# Primer — Sidecar vs Ambient (the two ways Istio runs)

*A 6-minute orientation so the rest of the course isn't confusing. Istio has two "modes" for where
its proxies live. You'll learn sidecar mode first (it's the clearest), and meet ambient properly in
Module 8.*

---

Istio needs proxies on your traffic to do its job. There are two designs for *where those proxies
sit*. Same goals (encryption, routing, resilience, metrics) — different plumbing and different
cost.

## Sidecar mode — a proxy inside every pod

The classic model. Alongside every copy of every service, Istio injects a **full Envoy proxy** into
the same pod. (A "pod" is Kubernetes' smallest unit — think "a running copy of your service.")
That proxy is called a **sidecar** because it rides along next to your app like a motorcycle
sidecar.

```
   ┌─────── pod ───────┐        ┌─────── pod ───────┐
   │  your app   ↕  Envoy │ ───► │  Envoy  ↕   your app │
   └───────────────────┘        └───────────────────┘
```

Every packet in or out of your app quietly detours through its personal Envoy, which applies
encryption, routing, and policy. It covers everything and is simple to reason about: one proxy per app,
full features everywhere.

**The catch:** a proxy in *every* pod costs CPU and memory per pod, adds a little latency, and
upgrading Istio means restarting every pod to update its sidecar. At a few services that's nothing;
at thousands, it adds up.

## Ambient mode — no sidecars, shared proxies instead

The newer, "sidecar-less" design. Istio pulls the proxy *out* of your pods and splits the work into
two layers:

- **ztunnel** ("zero-trust tunnel") — a lightweight agent that runs **once per node** (a node is a
  worker machine that hosts many pods). It's written in Rust and handles the cheap, universal
  part: **encrypting traffic (mTLS) and basic L4 routing** for all pods on that node. Turning it on
  requires **no pod restarts**.
- **waypoint proxy** — a **full Envoy**, added only for the namespaces/services that need the
  richer **L7 features** (HTTP routing rules, traffic splitting, L7 authorization). You deploy one
  only where you actually need it.

```
   pod   pod   pod          (no proxy inside the pods)
     \    |    /
      [ ztunnel ]  ← one per node: encryption + L4 for everyone, cheaply
          |
      [ waypoint (Envoy) ]  ← added only where L7 features are needed
```

So Envoy is still the L7 engine — it's just no longer sitting in every single pod. You pay for the
heavy proxy only where it earns its keep.

## How they compare

| | Sidecar mode | Ambient mode |
|--|--|--|
| Proxy location | Full Envoy in every pod | Per-node ztunnel; Envoy waypoint only where needed |
| Cost per pod | Higher (a proxy each) | Lower (shared) |
| Enabling it | Inject sidecar, restart pod | Label the namespace, **no restart** |
| L7 features | Everywhere by default | Add a waypoint where needed |
| Maturity | Battle-tested, the classic model | Production-ready and increasingly the default choice |
| Best when | You want full features per workload, simplest mental model | You want lower cost, gradual adoption, big fleets |

## Which does this course use?

**Sidecar first.** It's the clearest way to *see* the mesh — you can literally watch a second
container appear inside your pod. Modules 2–7 use sidecar mode. Then **Module 8** teaches ambient
properly, now that you know what the proxy underneath is actually doing. The concepts you learn
(mTLS, VirtualService, authorization) apply to **both** modes — only the plumbing differs.

## Check yourself

1. In sidecar mode, where does the proxy live? *(Inside every pod, next to the app — a full Envoy
   sidecar.)*
2. In ambient mode, what are the two proxy layers and what does each do? *(ztunnel — per-node,
   handles mTLS/L4 cheaply; waypoint — a full Envoy added per-namespace/service for L7 features.)*
3. A big advantage of ambient's ztunnel when you turn it on? *(It encrypts traffic with no pod
   restarts, and costs less than a proxy per pod.)*
4. Is Envoy still involved in ambient mode? *(Yes — the waypoint proxy is Envoy; it's just not in
   every pod.)*
5. Do Istio concepts like mTLS and VirtualService apply to both modes? *(Yes — only the plumbing
   differs; the concepts carry over.)*

---

**Next:** [0 — What Istio is →](./00-what-is-istio.md)
