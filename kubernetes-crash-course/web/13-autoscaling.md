# 13: Autoscaling

*Let the cluster add and remove capacity on its own. Concepts + a lab. ~25 min. Needs your kind
cluster + metrics-server.*

---

You set a replica count in Module 2. But load changes: busy at noon, quiet at night. **Autoscaling**
makes Kubernetes adjust capacity automatically. There are three kinds, at three levels; know what
each does.

## The three autoscalers

| Autoscaler | Scales | Based on |
|-----------|--------|----------|
| **HPA** (Horizontal Pod Autoscaler) | **number of pods** (out/in) | CPU/memory or custom metrics |
| **VPA** (Vertical Pod Autoscaler) | **each pod's requests/limits** (up/down) | observed usage |
| **Cluster Autoscaler** | **number of nodes** | pending pods that don't fit |

The one you'll use most, and the one on the exam, is the **HPA**: more traffic → more pods; less
traffic → fewer. VPA right-sizes a pod's resources; the Cluster Autoscaler adds machines when pods
can't be scheduled (cloud clusters).

## How the HPA works

The HPA runs a control loop: it reads a metric (say average CPU across the pods), compares it to a
**target**, and computes the replica count needed to hit that target, then scales the Deployment.

```
   desiredReplicas = ceil( currentReplicas × (currentMetric / targetMetric) )
```

Example: 3 pods averaging 90% CPU, target 50% → `ceil(3 × 90/50) = ceil(5.4) = 6` pods. As load
falls, it scales back down (with a stabilization delay to avoid flapping). The HPA needs the
**metrics-server** to read CPU/memory.

## An HPA (declarative)

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata: { name: web }
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 50     # aim to keep average CPU at 50% of the pods' requests
```

> **HPA requires resource *requests*.** Utilization is measured *relative to the CPU request*
> (Module 6). No request → the HPA can't compute a percentage. This is a classic gotcha.

## Lab: watch pods scale under load

```bash
# 0. metrics-server (kind needs the insecure-kubelet flag)
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
kubectl -n kube-system patch deployment metrics-server --type=json \
  -p='[{"op":"add","path":"/spec/template/spec/containers/0/args/-","value":"--kubelet-insecure-tls"}]'
kubectl -n kube-system rollout status deployment/metrics-server

# 1. a CPU-burnable app WITH a request (required for HPA)
kubectl create deployment php --image=registry.k8s.io/hpa-example
kubectl set resources deployment php --requests=cpu=100m
kubectl expose deployment php --port=80

# 2. an HPA: keep CPU ~50%, 1–10 replicas
kubectl autoscale deployment php --cpu-percent=50 --min=1 --max=10
kubectl get hpa php               # shows current vs target and replica count

# 3. generate load and WATCH it scale up
kubectl run load --image=busybox --restart=Never -- /bin/sh -c \
  "while true; do wget -q -O- http://php; done"
kubectl get hpa php -w            # TARGETS climbs, REPLICAS grows toward 10 (give it a minute; Ctrl-C)

# 4. stop the load and watch it scale back down (takes a few minutes)
kubectl delete pod load
kubectl get hpa php -w            # REPLICAS shrinks back toward 1

kubectl delete hpa php; kubectl delete deploy php load 2>/dev/null; kubectl delete svc php
```

Seeing REPLICAS rise and fall on its own is the payoff: the cluster right-sizes itself to demand.

## Practitioner notes

- **HPA needs requests + metrics-server.** Set CPU requests on anything you autoscale.
- **min/max are guardrails**: set a sane `minReplicas` (availability) and `maxReplicas` (cost cap).
- **Don't combine HPA and VPA on the same CPU/memory metric**: they fight. Use VPA for
  right-sizing requests, HPA for replica count (often on different signals).
- **Scale-down is deliberately slow** (stabilization window) to avoid thrashing; expect a delay.
- **Cluster Autoscaler** is a cloud concern (kind has fixed nodes) but conceptually: pending pods →
  add nodes.

## Check yourself

1. What does the HPA scale, and on what? *(The number of pods, based on CPU/memory or custom
   metrics.)*
2. HPA vs VPA vs Cluster Autoscaler? *(HPA = pod count; VPA = each pod's requests/limits; Cluster
   Autoscaler = node count.)*
3. Why must a Deployment have CPU requests for CPU-based HPA? *(Utilization is measured relative to
   the request; without it, no percentage can be computed.)*
4. What component must be installed for CPU/memory HPA? *(The metrics-server.)*
5. Why is scale-down slower than scale-up? *(A stabilization window prevents flapping when load
   fluctuates.)*

---

**Next:** [14: Operators & CRDs →](./14-operators-crds.md)
