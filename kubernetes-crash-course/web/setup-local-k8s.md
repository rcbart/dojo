# Setup — a local Kubernetes cluster

*Do this once. In ~15 minutes you'll have a real multi-node Kubernetes cluster on your laptop,
`kubectl` talking to it, Helm installed, and your first app deployed. Every step spelled out.
Assumes you finished the Docker course (or know Docker basics).*

> **This course is hands-on, on your own machine.** The site you're reading gives you the lessons
> and quizzes, but the real work happens in your own terminal: installing tools, running
> containers, and breaking things you can then fix. This setup page gets your machine ready; do it
> before the first lab.

Kubernetes normally runs across many servers, but you can run a full cluster locally inside Docker
with **kind** (Kubernetes-IN-Docker): free, fast, and disposable. You'll install four tools.

---

## Step 1 — Prerequisites

**Docker**: already installed if you did the Docker course. Verify: `docker run --rm hello-world`.

**kubectl** (the Kubernetes command-line tool: how you talk to any cluster)
: <https://kubernetes.io/docs/tasks/tools/>. macOS: `brew install kubectl`. Verify:
`kubectl version --client`.

**kind** (runs Kubernetes nodes as Docker containers)
: <https://kind.sigs.k8s.io/docs/user/quick-start/>. macOS: `brew install kind`. Verify:
`kind version` (0.32.x current).

**Helm** (the Kubernetes package manager, used later)
: <https://helm.sh/docs/intro/install/>. macOS: `brew install helm`. Verify: `helm version`
(v4.x current).

> **Version note.** Kubernetes 1.36 is current as of this writing; kind pulls a matching node image.
> `kubectl` works within one minor version of the cluster. Commands here are stable across recent
> versions.

## Step 2 — Create a multi-node cluster

A one-node cluster works, but a **multi-node** one lets you see real scheduling. Save this as
`kind-config.yaml`:

```yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
- role: worker
- role: worker
```

Create it:

```bash
kind create cluster --name k8s-lab --config kind-config.yaml
kubectl cluster-info --context kind-k8s-lab
kubectl get nodes -o wide          # one control-plane + two workers, all Ready
```

You now have a real Kubernetes cluster: one **control plane** node (the brain) and two **worker**
nodes (where your containers run). Module 1 explains each.

## Step 3 — Meet `kubectl`

`kubectl` ("cube-cuttle" or "cube-control") is how you interact with the cluster. The pattern is
`kubectl <verb> <resource>`:

```bash
kubectl get nodes                  # list nodes
kubectl get pods -A                # all pods in all namespaces (-A) — the system pods running K8s
kubectl get namespaces             # the cluster's namespaces
kubectl api-resources | head       # the kinds of objects the cluster understands
```

## Step 4 — Deploy your first app

Two ways: a quick imperative command, or a declarative file. Start imperative to see something run:

```bash
kubectl create deployment web --image=nginx --replicas=3
kubectl get pods -o wide           # 3 nginx pods, spread across your worker nodes
kubectl get deployment web         # 3/3 ready
```

Three containers, scheduled across nodes, from one command. Expose it so you can reach it:

```bash
kubectl expose deployment web --port=80 --type=NodePort
kubectl get service web            # note the assigned NodePort
```

Reach it via a port-forward (simplest on kind):

```bash
kubectl port-forward deployment/web 8080:80
# in another terminal:
curl localhost:8080 | grep -o "<title>.*</title>"    # → nginx welcome
```

## Step 5 — See the self-healing (the "wow" moment)

Kubernetes constantly keeps reality matching your desired state. Delete a pod and watch it come
back:

```bash
kubectl get pods
kubectl delete pod <one-of-the-web-pods>
kubectl get pods                   # a replacement is already being created — 3 desired, 3 kept
```

You asked for 3 replicas; Kubernetes maintains 3 forever, healing failures automatically. That's the
core idea of the whole system.

## Step 6 — Clean up

```bash
kind delete cluster --name k8s-lab    # removes the entire cluster
```

One command wipes everything. Recreate anytime from Step 2.

---

## Troubleshooting

**Nodes never reach Ready / pods Pending**
: kind needs memory. Give Docker Desktop ≥ 6–8 GB (Settings → Resources) and recreate the cluster.

**`kubectl` can't connect ("connection refused")**
: The cluster isn't running or the context is wrong. `kind get clusters`, then
`kubectl config use-context kind-k8s-lab`.

**`port-forward` exits / "unable to listen"**
: The pod isn't ready yet (`kubectl get pods`), or the local port is taken; pick another
(`8090:80`).

**Image pull errors**
: Check the image name/tag and your internet. `kubectl describe pod <pod>` shows pull errors under
Events.

## Check yourself

1. What does kind do? *(Runs a real Kubernetes cluster locally, using Docker containers as the
   nodes.)*
2. What is `kubectl`? *(The command-line tool you use to talk to any Kubernetes cluster.)*
3. What did `kubectl create deployment web --replicas=3` produce? *(Three nginx pods, scheduled
   across the worker nodes.)*
4. What happened when you deleted a pod? *(Kubernetes created a replacement to keep the desired 3:
   self-healing.)*
5. How do you delete the whole environment? *(`kind delete cluster --name k8s-lab`.)*

---

**Next:** [Primer — Why Kubernetes? →](./primer-why-kubernetes.md)
