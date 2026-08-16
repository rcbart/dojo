# 2 — Deployments & ReplicaSets

*How you actually run apps: self-healing, scaling, and zero-downtime updates. Concepts + a lab. ~30
min. Needs your kind cluster.*

---

A bare Pod is fragile. A **Deployment** is what you use for real: you declare "I want N replicas of
this image," and Kubernetes creates them, replaces any that die, scales on command, and rolls out
new versions without downtime. It's the workhorse object.

## The hierarchy

```
   Deployment  ──manages──►  ReplicaSet  ──manages──►  Pods
   (you edit this)           (keeps N copies)          (run your containers)
```

- **You** create/edit the **Deployment** (desired image + replica count).
- The Deployment creates a **ReplicaSet**, whose only job is "keep exactly N identical pods alive."
- The ReplicaSet creates and watches the **Pods**.

When you update the image, the Deployment creates a *new* ReplicaSet and shifts pods from old to new
gradually (the rollout). You almost always interact with the **Deployment**; the ReplicaSet is
managed for you.

## A Deployment manifest

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
spec:
  replicas: 3                      # desired number of pods
  selector:
    matchLabels: { app: web }      # which pods this Deployment owns
  template:                        # the Pod blueprint to stamp out
    metadata:
      labels: { app: web }         # must match the selector
    spec:
      containers:
      - name: web
        image: nginx:1.27
        ports:
        - containerPort: 80
```

The `template` is a Pod spec — everything from Module 1, embedded. `selector` + `template.labels`
must agree; that's how the Deployment knows which pods are "its."

## Lab: create, scale, self-heal

```bash
kubectl apply -f web-deploy.yaml     # (the manifest above)
kubectl get deploy,rs,pods           # a Deployment, one ReplicaSet, 3 Pods

# scale up
kubectl scale deployment web --replicas=5
kubectl get pods                     # now 5

# self-heal: delete a pod, watch a replacement appear
kubectl delete pod <one-web-pod>
kubectl get pods                     # still 5 — the ReplicaSet replaced it
```

You declared 5; Kubernetes maintains 5 forever. That's the reconciliation loop doing its job.

## Rolling updates — zero-downtime deploys

Change the image and Kubernetes rolls it out gradually: spin up new pods, wait for them ready, then
retire old ones — so the app never fully goes down.

```bash
# update the image (imperative) — or edit the YAML and re-apply
kubectl set image deployment/web web=nginx:1.28
kubectl rollout status deployment/web        # watch it progress to complete
kubectl get rs                               # old ReplicaSet scaled to 0, new one to 5
```

The behavior is controlled by the Deployment's **strategy** (`RollingUpdate` by default) with
`maxSurge` (how many extra pods during rollout) and `maxUnavailable` (how many can be down). Defaults
are safe.

## Rollbacks — undo instantly

Shipped something broken? Roll back to the previous revision:

```bash
kubectl rollout history deployment/web       # list revisions
kubectl rollout undo deployment/web          # back to the previous one
kubectl rollout undo deployment/web --to-revision=2
```

Because old ReplicaSets are kept (scaled to 0), rollback is near-instant — a huge operational safety
net.

## Lab: a full rollout + rollback + failure

```bash
# 1. deploy, then roll to a new version
kubectl set image deployment/web web=nginx:1.28 && kubectl rollout status deployment/web

# 2. roll to a BROKEN image and watch the rollout stall (new pods never become ready)
kubectl set image deployment/web web=nginx:nope
kubectl rollout status deployment/web --timeout=30s      # times out — rollout stuck
kubectl get pods                                          # new pod ImagePullBackOff; OLD pods still serving!

# 3. rescue: undo
kubectl rollout undo deployment/web
kubectl get pods                                          # healthy again
```

Notice step 2's safety property: because new pods never became **ready**, the rollout didn't
kill the old healthy ones — **no downtime from a bad deploy**. This is why readiness probes (Module
6) matter so much.

## Other workload controllers (brief)

Deployments are for **stateless** apps. Know the siblings for later:

- **StatefulSet** — stable identities/storage for stateful apps (databases) — Module 5.
- **DaemonSet** — one pod on *every* node (log/metrics agents).
- **Job / CronJob** — run-to-completion tasks and scheduled jobs.

All share the same declarative, self-healing model.

## Check yourself

1. What's the chain from Deployment to Pods? *(Deployment → ReplicaSet → Pods; you edit the
   Deployment.)*
2. What must match between a Deployment's selector and its pod template? *(Their labels.)*
3. How does a rolling update avoid downtime? *(It brings up new ready pods before retiring old ones,
   gradually.)*
4. Why is rollback nearly instant? *(Old ReplicaSets are kept scaled to 0, so undo just scales one
   back up.)*
5. Why didn't the broken image cause an outage in the lab? *(New pods never became ready, so the
   rollout kept the old healthy pods serving.)*

---

**Next:** [2b — Workloads beyond Deployments: DaemonSets, Jobs & CronJobs →](./19-workloads-beyond-deployments.md)
