# Primer — The cluster, at a glance

*A gentle map of what's inside a Kubernetes cluster before we start using it. ~8 min. You don't need
to memorize this — just recognize the pieces when they come up.*

---

A Kubernetes **cluster** is a set of machines (**nodes**) working as one. The nodes split into two
kinds, matching the data-plane/control-plane idea you may know from the service-mesh world:

- **The control plane** — the **brain**. Makes decisions: what should run where, and keeps reality
  matching your desired state.
- **The worker nodes** — the **muscle**. Actually run your containers.

```
   ┌──────────────── CONTROL PLANE (the brain) ────────────────┐
   │  API server   ·  etcd   ·  Scheduler  ·  Controller mgr    │
   └───────────────────────────┬───────────────────────────────┘
                                │  (instructs the nodes)
        ┌───────────────────────┼────────────────────────┐
        ▼                        ▼                         ▼
   ┌── Worker node ──┐    ┌── Worker node ──┐       ┌── Worker node ──┐
   │ kubelet          │    │ kubelet          │       │ kubelet          │
   │ kube-proxy       │    │ kube-proxy       │       │ kube-proxy       │
   │ [ your pods ]    │    │ [ your pods ]    │       │ [ your pods ]    │
   └──────────────────┘    └──────────────────┘       └──────────────────┘
```

## Control-plane pieces (the brain)

| Component | Plain-English job |
|-----------|-------------------|
| **API server** | The front door. *Everything* talks to it — `kubectl`, the nodes, every component. You submit desired state here. |
| **etcd** | The cluster's database. Stores the entire desired + actual state (the single source of truth). |
| **Scheduler** | Decides *which node* each new pod should run on, based on resources and rules. |
| **Controller manager** | Runs the control loops (reconciliation) — e.g. "keep 3 replicas alive." |

When you `kubectl apply` a file, it goes to the **API server**, which saves it in **etcd**. The
**scheduler** picks nodes for new pods; **controllers** keep everything matching your spec.

## Worker-node pieces (the muscle)

| Component | Plain-English job |
|-----------|-------------------|
| **kubelet** | The node's agent. Talks to the API server and makes sure the pods it's told to run are actually running. |
| **kube-proxy** | Handles networking on the node so Services route traffic to the right pods. |
| **container runtime** | Actually runs containers (containerd/CRI-O). Runs the OCI images you built with Docker. |

## How a request to run something flows

You want to run an app. Roughly:

1. You `kubectl apply` a **Deployment** → the **API server** stores it in **etcd**.
2. A **controller** notices "desired 3 pods, actual 0" and creates 3 Pod objects.
3. The **scheduler** assigns each Pod to a node.
4. Each node's **kubelet** sees "you own this Pod," tells the **container runtime** to pull the image
   and start the container.
5. **kube-proxy** wires up networking so a **Service** can reach those pods.
6. Controllers keep watching — if a pod dies, back to step 2. Forever.

That loop — submit desired state, controllers reconcile, kubelets execute — *is* Kubernetes. Every
module adds a new kind of object you submit to the API server.

## The good news for learning

You rarely touch these components directly (managed Kubernetes and kind run them for you). But
knowing the map means error messages and behaviors make sense: "pod Pending" → the scheduler can't
place it; "ImagePullBackOff" → the kubelet/runtime can't pull the image; "the API server is
unreachable" → you can't submit anything. You'll meet these in the troubleshooting module.

## Check yourself

1. What are the two kinds of nodes and their roles? *(Control plane = the brain (decisions); worker
   nodes = the muscle (run containers).)*
2. What does the API server do? *(It's the front door — everything talks to it; you submit desired
   state there.)*
3. What is etcd? *(The cluster's database — the single source of truth for all state.)*
4. What does the scheduler decide? *(Which node each new pod runs on.)*
5. What does the kubelet do? *(Runs on each node and ensures its assigned pods are actually
   running.)*

---

**Next:** [0 — What Kubernetes is →](./00-what-is-kubernetes.md)
