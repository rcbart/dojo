# 6: Health checks & resource management

*Production essentials: teach Kubernetes when a pod is healthy and how much it may consume. Concepts
+ a lab. ~30 min. Needs your kind cluster.*

---

Two things separate a toy deployment from a production-ready one: **probes** (so Kubernetes knows
whether your app is actually working) and **resource requests/limits** (so the scheduler places pods
well and no pod starves the node). These are heavily tested on the CKA/CKAD, and they're daily
practitioner work.

## Probes: is the app really OK?

A container can be "running" while the app inside is broken. **Probes** let the kubelet test the app
and act. Three kinds:

| Probe | Question | If it fails |
|-------|----------|-------------|
| **liveness** | "Is the app alive, or wedged?" | Kubernetes **restarts** the container |
| **readiness** | "Is the app ready to serve traffic *right now*?" | Pod is removed from Service endpoints (no traffic) until it passes |
| **startup** | "Has a slow-starting app finished booting?" | Delays liveness/readiness until it passes (protects slow starters) |

The distinction that trips everyone up: **liveness restarts; readiness gates traffic.** A pod that's
alive but still warming up should be *ready=false* (no traffic) but *live=true* (don't restart it).

## Probe definition

```yaml
spec:
  containers:
  - name: app
    image: myapp
    readinessProbe:
      httpGet: { path: /healthz, port: 8080 }
      initialDelaySeconds: 5
      periodSeconds: 10
    livenessProbe:
      httpGet: { path: /healthz, port: 8080 }
      periodSeconds: 10
      failureThreshold: 3
    startupProbe:
      httpGet: { path: /healthz, port: 8080 }
      failureThreshold: 30
      periodSeconds: 2          # allow up to 60s to start before liveness kicks in
```

Probe mechanisms: `httpGet` (2xx/3xx = pass), `tcpSocket` (port open = pass), `exec` (command exit 0
= pass). This is the direct evolution of Docker's `HEALTHCHECK`, now with the readiness concept that
enables zero-downtime rollouts (Module 2).

## Resource requests & limits

Every container should declare:

- **requests**: the amount of CPU/memory it *needs*. The **scheduler** uses requests to decide which
  node has room. Guaranteed to the pod.
- **limits**: the *maximum* it may use. Exceed the **memory** limit → the container is **OOM-killed**
  (137). Exceed the **CPU** limit → it's **throttled** (slowed), not killed.

```yaml
    resources:
      requests:
        cpu: "100m"           # 0.1 CPU core
        memory: "128Mi"
      limits:
        cpu: "500m"           # 0.5 core max
        memory: "256Mi"
```

`m` = millicores (1000m = 1 CPU). Memory in `Mi`/`Gi`.

## QoS classes (consequence of your requests/limits)

Kubernetes assigns each pod a **Quality of Service** class, which decides who gets evicted first when
a node runs low:

- **Guaranteed**: requests == limits for all resources. Last to be evicted.
- **Burstable**: has requests < limits. Evicted after BestEffort.
- **BestEffort**: no requests/limits set. **Evicted first.** (Never run important workloads
  BestEffort.)

Setting sensible requests/limits is thus both a scheduling and a reliability decision.

## Lab: probes and limits in action

```bash
# 1. a deployment with a readiness probe that fails at first
cat <<'EOF' | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata: { name: probed }
spec:
  replicas: 1
  selector: { matchLabels: { app: probed } }
  template:
    metadata: { labels: { app: probed } }
    spec:
      containers:
      - name: app
        image: nginx:1.27
        readinessProbe: { httpGet: { path: /, port: 80 }, initialDelaySeconds: 3, periodSeconds: 3 }
        resources:
          requests: { cpu: "50m", memory: "64Mi" }
          limits:   { cpu: "200m", memory: "128Mi" }
EOF
kubectl get pod -l app=probed -w      # READY goes 0/1 → 1/1 once the probe passes (Ctrl-C)
```

Watch a memory limit enforce itself:

```bash
kubectl run hog --image=polinux/stress --restart=Never --limits=memory=64Mi -- \
  stress --vm 1 --vm-bytes 150M --vm-hang 1
kubectl get pod hog -w                 # OOMKilled — the limit stopped it (Ctrl-C)
kubectl delete pod hog
kubectl describe pod hog 2>/dev/null | grep -i oom || true
kubectl delete deploy probed
```

### Experiment: liveness restart

Add a liveness probe hitting a path that returns 500, and watch `kubectl get pod` show the
RESTARTS counter climb as Kubernetes restarts the "wedged" container, while a readiness-only failure
would just remove it from Service traffic without restarting.

## Practitioner rules

- **Always set readiness probes**: they make rollouts safe (bad pods never receive traffic) and are
  why a broken deploy doesn't cause an outage.
- **Set liveness probes carefully**: too aggressive and you restart healthy-but-busy pods. Point
  them at a cheap health endpoint.
- **Always set requests** (for scheduling) and **memory limits** (to contain leaks). Be cautious with
  CPU limits (throttling can hurt latency).
- **Never run production pods BestEffort.**

## Check yourself

1. Liveness vs readiness: what does each do on failure? *(Liveness restarts the container; readiness
   removes the pod from Service traffic until it passes.)*
2. What is a startup probe for? *(Protecting slow-starting apps: it delays liveness/readiness until
   the app has booted.)*
3. requests vs limits? *(Requests = what the scheduler guarantees/places on; limits = the max;
   exceeding memory limit → OOM-kill, CPU limit → throttle.)*
4. Which QoS class is evicted first? *(BestEffort, pods with no requests/limits.)*
5. Why does setting readiness probes make rollouts safe? *(New pods only receive traffic once ready,
   so a broken version never serves users and can't cause downtime.)*

---

**Next:** [6b: Scheduling & disruptions →](./20-scheduling-disruptions.md)
