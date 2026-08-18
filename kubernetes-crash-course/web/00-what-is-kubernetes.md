# 0: What Kubernetes is

*No lab: the mental model that anchors everything. ~12 min read.*

---

## Recap and sharpen

**Kubernetes runs and manages containers across many machines, automatically, from declarative
desired state.** You submit "what you want" (as YAML objects) to the control plane; controllers work
forever to make the cluster match. This module frames the whole system so the hands-on modules have
a skeleton to hang on.

## Everything is an object

Kubernetes is, at heart, a **database of objects** (in etcd) plus **controllers** that make the
world match those objects. You work by creating/updating objects. Every object has the same shape:

```yaml
apiVersion: apps/v1        # which API group/version defines this kind
kind: Deployment           # what kind of object
metadata:
  name: web                # its name (and labels, namespace…)
spec:                      # DESIRED state — what YOU want
  replicas: 3
status:                    # ACTUAL state — what Kubernetes observes (it fills this in)
  readyReplicas: 3
```

**`spec` = your desired state; `status` = reality.** A controller's whole job is to drive `status`
toward `spec`. Learn this shape once and every object (Pod, Service, ConfigMap, Ingress) reads the
same way.

## The objects you'll learn (the map)

| Object | One-line job | Module |
|--------|-------------|--------|
| **Pod** | The smallest unit, one (or a few) containers running together | 1 |
| **Deployment** | Keeps N replicas of a Pod healthy; handles rollouts/rollbacks | 2 |
| **Service** | A stable name + load balancing across a set of Pods | 3 |
| **ConfigMap / Secret** | Inject configuration / credentials into Pods | 4 |
| **PersistentVolume / PVC / StatefulSet** | Storage and stateful apps | 5 |
| **Probes, requests/limits** | Health checks and resource guarantees | 6 |
| **RBAC, NetworkPolicy** | Who can do what; which pods may talk | 7 |
| **Ingress** | HTTP routing from outside into Services | 12 |
| **HPA** | Autoscale replicas by load | 13 |
| **CRD / Operator** | Extend Kubernetes with your own object kinds | 14 |

Every one is just a `spec` you submit and a controller that reconciles it.

## Labels and selectors: the glue

Kubernetes objects find each other with **labels** (key/value tags) and **selectors** (queries over
labels), not hard IDs. A Deployment labels its pods `app: web`; a Service selects `app: web` to know
which pods to send traffic to. This loose coupling is everywhere:

```
   Service (selector: app=web)  ─────►  any Pod labelled app=web
```

Add a pod with that label and the Service instantly includes it; no wiring. **Labels + selectors**
are how almost everything connects. Internalize this early.

## Namespaces: dividing the cluster

A **namespace** is a virtual sub-cluster for organizing objects (by team, environment, or app).
`default` is where your stuff goes unless you say otherwise; `kube-system` holds Kubernetes' own
components. Names must be unique *within* a namespace. RBAC and quotas are often scoped per
namespace.

## Imperative vs declarative (two ways to work)

- **Imperative**: direct commands like `kubectl create deployment web --image=nginx`. Fast for
  learning and one-offs.
- **Declarative**: write YAML and `kubectl apply -f file.yaml`. Reproducible, version-controlled,
  reviewable. **This is how real teams work** (and how GitOps/CI-CD deploy).

The course uses imperative to explore quickly, then declarative for anything real. Both submit to the
same API server.

## The reconciliation loop (say it again, it matters)

The single most important behavior: controllers **continuously** compare `spec` to `status` and act
to close the gap. Delete a pod → the Deployment makes a new one. A node dies → its pods are
rescheduled. You don't script recovery; you declare intent and the loop maintains it. This is why
Kubernetes is *resilient by design*.

## The mental checklist for any K8s task

1. **What workload?** (Pod via Deployment/StatefulSet/Job)
2. **How is it reached?** (Service, and Ingress for HTTP)
3. **What config/secrets/storage does it need?** (ConfigMap, Secret, PVC)
4. **What are its health checks and resource limits?** (probes, requests/limits)
5. **Who/what may access it?** (RBAC, NetworkPolicy)

Every module answers one of these.

## Check yourself

1. What do `spec` and `status` mean on an object? *(`spec` = your desired state; `status` = the
   actual state Kubernetes observes.)*
2. How do objects like Services find their Pods? *(Labels and selectors: Services select pods by
   label, not by ID/IP.)*
3. What is a namespace? *(A virtual sub-cluster for organizing objects; names are unique within
   one.)*
4. Imperative vs declarative: which do real teams use? *(Declarative: YAML applied with `kubectl
   apply`, version-controlled.)*
5. Describe the reconciliation loop in one sentence. *(Controllers continuously drive actual state
   toward the desired state, fixing any drift.)*

---

**Next:** [1: Pods & kubectl →](./01-pods-and-kubectl.md)
