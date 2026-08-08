# 3 — Services & networking

*How pods get stable names and how traffic reaches them. Concepts + a lab. ~30 min. Needs your kind
cluster.*

---

Pods are disposable — they come and go, and each gets a **new IP** every time. So you can never rely
on a pod's IP. A **Service** solves this: it's a **stable name and address** that automatically load
-balances across a changing set of pods.

## The problem a Service solves

```
   Pods come and go, IPs change:   10.1.2.3 → dies → 10.1.7.9 → scaled → 10.1.7.9, 10.1.8.1 …
   A Service gives ONE stable front:   "web"  ──load-balances──►  whatever pods match app=web
```

A Service selects pods by **label** (Module 0's glue) and spreads traffic across all of them,
wherever they run, however many there are. Callers use the Service's name; they never track pods.

## Service types

| Type | Reachable from | Use for |
|------|---------------|---------|
| **ClusterIP** (default) | *Inside* the cluster only | Service-to-service calls (most Services) |
| **NodePort** | A port on every node's IP | Simple external access, dev/testing |
| **LoadBalancer** | A cloud load balancer with an external IP | Production external access (on cloud) |
| **ExternalName** | Maps to an external DNS name | Pointing at an off-cluster service |

Most Services are **ClusterIP** (internal). For real external HTTP traffic you usually use an
**Ingress** (Module 12) in front of ClusterIP Services, rather than many NodePorts/LoadBalancers.

## A Service manifest

```yaml
apiVersion: v1
kind: Service
metadata:
  name: web
spec:
  selector:
    app: web                 # send traffic to pods labelled app=web
  ports:
  - port: 80                 # the Service's port
    targetPort: 80           # the pods' containerPort
  type: ClusterIP
```

## Service DNS — talk by name

Every Service gets an in-cluster DNS name. From any pod, you can reach it as:

```
   web                                 (same namespace)
   web.default                         (namespace-qualified)
   web.default.svc.cluster.local       (fully-qualified)
```

So an app connects to `http://web` or `web:80` — no IPs, ever. This is exactly the "talk by name"
model from Docker Compose, scaled to a cluster. **Service discovery = labels + DNS.**

## Lab: expose a Deployment and load-balance

```bash
# a deployment of 3 pods that each report their hostname
kubectl create deployment hello --image=nginxdemos/hello --replicas=3
kubectl expose deployment hello --port=80        # creates a ClusterIP Service "hello"
kubectl get svc hello                             # its ClusterIP + port
```

Reach it from *inside* the cluster and watch load balancing:

```bash
# run a throwaway client pod and hit the Service by NAME several times
kubectl run tester --image=busybox -it --rm --restart=Never -- \
  sh -c "for i in $(seq 1 6); do wget -qO- hello | grep -o 'Server.*'; done"
# → responses come from different pod hostnames — the Service is load-balancing
```

Prove DNS resolves the name:

```bash
kubectl run dnstest --image=busybox -it --rm --restart=Never -- nslookup hello
# → resolves hello.default.svc.cluster.local to the Service's ClusterIP
```

## Reaching it from your laptop (local dev)

kind has no cloud load balancer, so use one of:

```bash
kubectl port-forward svc/hello 8080:80     # simplest: local :8080 → Service
curl localhost:8080
```

(or make the Service `NodePort` and use the node port; on cloud you'd use `LoadBalancer` or an
Ingress.)

## How it works under the hood (brief)

- The Service has a stable virtual IP (**ClusterIP**).
- **kube-proxy** on each node programs rules so traffic to that IP is spread across the current
  matching pod IPs.
- An **EndpointSlice** object tracks which pod IPs currently match the selector — updated live as
  pods come and go. That's how the Service always points at healthy, current pods.

You don't manage any of this; you just create the Service.

## Lab: prove the stable-name magic

```bash
# scale the deployment and confirm the SAME Service name now spans more pods
kubectl scale deployment hello --replicas=5
kubectl get endpointslices -l kubernetes.io/service-name=hello   # 5 endpoints now
# delete a pod; the Service keeps working — endpoints update automatically
kubectl delete pod -l app=hello --field-selector=status.phase=Running --grace-period=1 | head -1
kubectl get pods -l app=hello        # replacements appear; Service unaffected
kubectl delete deployment hello && kubectl delete svc hello
```

## Check yourself

1. Why can't you rely on a pod's IP? *(Pods are disposable and get a new IP each time they're
   recreated.)*
2. What does a Service provide? *(A stable name/address that load-balances across all pods matching
   its label selector.)*
3. ClusterIP vs LoadBalancer? *(ClusterIP is internal-only; LoadBalancer exposes the Service
   externally via a cloud load balancer.)*
4. How does an app reach a Service without knowing IPs? *(By the Service's DNS name, e.g. `web` or
   `web.default.svc.cluster.local`.)*
5. What keeps a Service pointing at the right pods as they change? *(The selector + EndpointSlices,
   updated live; kube-proxy routes to current pod IPs.)*

---

**Next:** [4 — ConfigMaps & Secrets →](./04-configmaps-secrets.md)
