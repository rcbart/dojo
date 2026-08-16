# 6b — Scheduling & disruptions: placing pods, and surviving maintenance

*Where pods land, which pods die first, and how to make node maintenance boring. ~12 min read.*

---

Module 6 taught requests and limits — *how much* a pod needs. This module is the other half of the
scheduler's job: *where* pods may run, what happens when nodes drain, and the objects that decide
which pods survive pressure. It's the difference between a cluster that tolerates a node upgrade
and one where every upgrade is an incident.

## Steering pods: selectors, affinity, taints

Three mechanisms, in increasing sophistication — and note the direction of each:

**nodeSelector** — the blunt instrument. Pod says: only nodes with this label.

```yaml
spec:
  nodeSelector: { disktype: ssd }
```

**Affinity** — the expressive version. Pod says: I *require* (or merely *prefer*) nodes matching
these rules, including rules about *other pods*:

```yaml
affinity:
  podAntiAffinity:                      # spread MY replicas away from each other
    requiredDuringSchedulingIgnoredDuringExecution:
    - labelSelector: { matchLabels: { app: api } }
      topologyKey: kubernetes.io/hostname
```

That anti-affinity example is the one that matters in production: without it, nothing stops all 3
replicas of your API landing on one node — a "highly available" deployment with a single point of
failure. (`topologySpreadConstraints` is the modern, gentler way to say "spread evenly across
nodes/zones"; reach for it when strict anti-affinity is too rigid to schedule.)

**Taints & tolerations** — the reverse direction. Pods *ask for* nodes with selectors/affinity;
**nodes repel** pods with taints, and only pods carrying a matching toleration may land:

```bash
kubectl taint nodes gpu-node-1 gpu=true:NoSchedule
```

```yaml
tolerations:
- { key: gpu, operator: Equal, value: "true", effect: NoSchedule }
```

Selector = pod chooses node. Taint = node refuses pods. Reserving expensive hardware needs *both*:
the taint keeps everyone else off; the selector makes GPU pods actually go there. Taints are also
how Kubernetes itself works: a `NotReady` node gets tainted automatically, which is what evicts
pods from a dead node.

## Priority: who dies first

When a cluster runs out of room, the scheduler can **preempt** — evict lower-priority pods to
make space for higher-priority ones. A **PriorityClass** is a named number:

```yaml
apiVersion: scheduling.k8s.io/v1
kind: PriorityClass
metadata: { name: critical-service }
value: 100000
```

Reference it with `priorityClassName` in the pod spec. Two rules that hold up in practice: define a *small* set
(critical / normal / batch — three is plenty), because a proliferation of priorities is an
un-debuggable pecking order; and give batch work a *low* priority explicitly, so the 2 a.m.
report job is what dies when the API needs room — not the other way round. Combined with module
6's QoS classes, this is the full answer to "under pressure, who goes first?": priority decides
preemption; QoS breaks ties at the node's OOM level.

## PodDisruptionBudgets: surviving voluntary disruption

Node maintenance, cluster upgrades, autoscaler scale-down — all of these **drain** nodes, evicting
pods on purpose. A **PodDisruptionBudget** (PDB) is your service's floor during such *voluntary*
disruptions:

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata: { name: api-pdb }
spec:
  minAvailable: 2
  selector: { matchLabels: { app: api } }
```

With 3 replicas and `minAvailable: 2`, a drain evicts one pod, waits for its replacement to become
Ready elsewhere, then continues — an upgrade rolls through the cluster without ever dropping you
below quorum. Two sharp edges: a PDB does **nothing** for *involuntary* disruption (a node
catching fire consults no budgets — that's what anti-affinity and replicas are for), and an
impossible budget (`minAvailable: 3` with 3 replicas) blocks drains *forever*, which is how "the
upgrade is stuck at node 4" tickets are born. Every service with more than one replica should
have a PDB; every PDB must leave the drain some room to work.

## Admission: the cluster's rule book

One more gate runs before any of the above: **admission controllers** intercept every write to
the API server and can mutate or reject it. This is where cluster-wide policy lives — "every
namespace gets default resource limits" (`LimitRange`, mutating), "no images from unknown
registries", "every pod must have a PDB" (policy engines like Kyverno/Gatekeeper, validating).
Pod Security Admission (module 7's `restricted` profile) is exactly this mechanism. When a
perfectly valid manifest bounces with a policy error, you're not fighting the scheduler — you're
meeting the rule book. `kubectl get validatingwebhookconfigurations` shows who wrote it.

## The maintenance-day test

Put it together: replicas spread by **anti-affinity**, floors held by **PDBs**, sacrifice order
declared by **PriorityClass**, hardware reserved by **taints**, and the rules enforced by
**admission**. The test of all five is one command on a busy afternoon:

```bash
kubectl drain node-3 --ignore-daemonsets
```

If that's boring — pods reshuffle, dashboards stay green — this module is done its job.

---

**Next:** [7 — Security: RBAC, ServiceAccounts & NetworkPolicies →](./07-security-rbac-netpol.md)
