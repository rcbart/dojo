# 1 — Pods & kubectl

*Hands-on. The atom of Kubernetes and the tool you'll live in. ~25 min. Needs your kind cluster.*

---

## What a Pod is

A **Pod** is the smallest thing Kubernetes runs: **one container** (usually), or a few tightly
coupled containers that share the same network and storage. A pod's containers share:

- **One IP address** — they reach each other on `localhost`.
- **Storage volumes** — they can share mounted data.
- **A lifecycle** — they're scheduled, started, and stopped together, on one node.

If a Docker container is "a running app," a Pod is Kubernetes' **wrapper** around it that adds an
identity, networking, and scheduling. Usually **one container per pod**; multiple only for helper
"sidecar" patterns (a log shipper, a proxy — remember Istio?).

> **Pods are disposable.** You almost never create bare Pods in production — they don't self-heal.
> Instead a **Deployment** (Module 2) creates and replaces them for you. But understanding the Pod
> first makes everything else clear.

## A Pod manifest

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: hello
  labels:
    app: hello
spec:
  containers:
  - name: web
    image: nginx:1.27
    ports:
    - containerPort: 80
```

`spec.containers` lists the image(s) to run — this is where your Docker images plug in.

## kubectl — the verbs you'll use constantly

`kubectl <verb> <resource> [name] [flags]`:

| Command | What it does |
|---------|-------------|
| `kubectl get <res>` | List objects (add `-o wide`, `-o yaml`, `-A` for all namespaces) |
| `kubectl describe <res> <name>` | Detailed human-readable status + **Events** (great for debugging) |
| `kubectl logs <pod>` | Container logs (`-f` follow, `-c <container>` pick one) |
| `kubectl exec -it <pod> -- sh` | Run a command / shell inside a pod |
| `kubectl apply -f file.yaml` | Create/update from a manifest (declarative) |
| `kubectl delete <res> <name>` | Remove an object |
| `kubectl get <res> -o yaml` | Dump full object YAML (includes status) |

`kubectl describe` and `kubectl logs` are your two primary debugging tools — reach for them first.

## Lab: run and inspect a Pod

```bash
# create the pod from the manifest above (save it as hello.yaml), or imperatively:
kubectl run hello --image=nginx:1.27 --labels=app=hello
kubectl get pods -o wide            # status, node, IP
kubectl describe pod hello          # events: scheduled, pulled, started
kubectl logs hello                  # nginx startup logs
```

Reach it and look inside:

```bash
kubectl port-forward pod/hello 8080:80   # forward local :8080 → pod :80
curl localhost:8080 | grep -o "<title>.*</title>"   # (Ctrl-C the forward after)

kubectl exec -it hello -- bash
#   inside: curl localhost   (containers in a pod share localhost)  ->  exit
```

## Prove pods don't self-heal (the key lesson)

```bash
kubectl delete pod hello
kubectl get pods            # it's gone — nothing recreated it
```

A bare Pod, once deleted or crashed, stays gone. That's why you use a **Deployment** — it watches
and replaces pods to maintain your desired count. You'll see that next module.

## Reading a pod's state

`kubectl get pods` shows a **STATUS** and **READY** column. Common statuses:

- `Running` — containers are up (READY `1/1` means all containers ready).
- `Pending` — not scheduled yet (no room, or waiting on resources). `describe` shows why.
- `ContainerCreating` — pulling image / setting up.
- `CrashLoopBackOff` — the container keeps crashing and restarting. `logs` shows why.
- `ImagePullBackOff` / `ErrImagePull` — can't pull the image (bad name/tag/registry auth).

**When a pod is unhealthy, `kubectl describe pod <name>` (read the Events) and `kubectl logs <name>`
tell you why 90% of the time.**

## Lab: read the signals

```bash
# a pod with a bad image name — watch it fail
kubectl run broken --image=nginx:doesnotexist
kubectl get pods                    # broken: ImagePullBackOff
kubectl describe pod broken | sed -n '/Events/,$p'   # the pull error, spelled out
kubectl delete pod broken

# a pod that crashes — CrashLoopBackOff
kubectl run crasher --image=busybox --restart=Never -- sh -c "echo booting; exit 1"
kubectl get pod crasher             # Error/CrashLoop depending on restart
kubectl logs crasher                # → booting  (your clue)
kubectl delete pod crasher
```

## Check yourself

1. What is a Pod? *(The smallest Kubernetes unit — one or a few tightly-coupled containers sharing an
   IP, storage, and lifecycle.)*
2. How many containers does a typical pod have? *(One; multiple only for sidecar patterns.)*
3. Why don't you create bare Pods in production? *(They don't self-heal — use a Deployment that
   replaces them.)*
4. Your two go-to debugging commands for an unhealthy pod? *(`kubectl describe pod` (read Events) and
   `kubectl logs`.)*
5. What does `CrashLoopBackOff` mean? *(The container keeps crashing and being restarted — check its
   logs.)*

---

**Next:** [2 — Deployments & ReplicaSets →](./02-deployments-replicasets.md)
