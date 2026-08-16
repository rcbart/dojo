# 0 — What Istio is (and why it exists)

*No lab — this sets the mental model. ~12 min read.*

---

## Recap in one breath

**Istio is a service mesh.** It puts a proxy (Envoy) next to every service, and a brain (`istiod`)
that programs all those proxies from your simple YAML intent. The result: encryption, traffic
control, resilience, and observability for all your service-to-service traffic — **without touching
your application code.**

If that already makes sense from the primers, this module sharpens it and places Istio among its
alternatives.

## The three things Istio gives you

Everything Istio does falls into three buckets. The whole course is these three, in depth:

1. **Traffic management** — control *where* requests go and *how*. Route by path/header, split
   traffic between versions (canary), rewrite, mirror, and apply retries/timeouts. You express this
   as a few Kubernetes objects; Istio programs the proxies to enforce it.
2. **Security** — **mTLS** (mutual TLS) between every service automatically, so traffic is encrypted
   and both sides prove their identity. Plus **authorization**: "service A may call service B, and
   nobody else." Identity is built in, not bolted on.
3. **Observability** — because every request passes through a proxy, Istio produces uniform
   **metrics**, **distributed traces**, and a live **service graph** (Kiali) for free. You see what
   calls what, how fast, and where it's failing.

## Data plane and control plane (the core split)

Keep these two words straight and Istio is simple:

| Half | What it is | In Istio |
|------|-----------|----------|
| **Data plane** | The proxies that carry traffic and enforce rules | **Envoy** proxies (sidecars or waypoints) |
| **Control plane** | The brain that computes config and pushes it to the proxies | **`istiod`** |

You never configure Envoy by hand. You write Istio objects (VirtualService, DestinationRule,
etc.); `istiod` translates them into Envoy config and streams it to every proxy over a standard API
called **xDS**. Services appear, disappear, scale — istiod keeps every proxy up to date, live.

> **This is why the Envoy course and this one fit together:** Envoy is the muscle, Istio is the
> brain. Learn Envoy to understand *what* the proxy does; learn Istio to drive a whole fleet of
> them declaratively.

## Where the proxies sit: sidecar vs ambient (quick recap)

- **Sidecar mode** — a full Envoy inside every pod. Classic, full-featured, higher per-pod cost.
  *This course teaches it first (Modules 2–7).*
- **Ambient mode** — no per-pod sidecar; a per-node **ztunnel** does cheap encryption/L4, and an
  Envoy **waypoint** is added only where L7 features are needed. Lower cost, gradual adoption.
  *Module 8.*

Same features either way — only the plumbing differs.

## Istio vs the alternatives (what else is out there)

- **Istio** — the most feature-rich and widely used mesh; uses Envoy; now offers both sidecar and
  ambient. Full-featured, historically heavier (ambient addresses that).
- **Linkerd** — a simpler, lighter mesh that uses its *own* tiny Rust proxy (not Envoy). Fewer
  knobs, easy to run; less flexible for complex L7 needs.
- **Consul (service mesh)** — HashiCorp's mesh, also Envoy-based, strong in multi-platform / VM +
  Kubernetes environments.
- **Envoy Gateway / Contour / Gloo** — these are **gateways** (edge ingress), not full meshes.
  They manage north-south (in/out) traffic, not necessarily every east-west (service-to-service)
  call. A mesh covers east-west too.

Rule of thumb: **gateway** = your front door; **mesh** = the smart network *between* all your
services (which usually includes a gateway at the edge).

## When Istio is (and isn't) worth it

**Worth it when:** you have many services, need uniform encryption/identity, want safe canary
releases, and need consistent observability across teams — without every team re-implementing it.

**Overkill when:** you have a handful of services. A single edge gateway plus basic
retries/timeouts in code is simpler. The cost/benefit shifts as the system grows — and ambient
mode lowers the entry cost considerably.

## The mental checklist for this course

When you look at any Istio setup, ask:

1. **Is the workload in the mesh?** (sidecar injected, or namespace in ambient?)
2. **How does traffic get in?** (a Gateway + VirtualService, or Gateway API)
3. **Where does it route, and how is it split?** (VirtualService + DestinationRule subsets)
4. **Is it secured?** (mTLS mode + AuthorizationPolicy)
5. **Can I see it?** (Kiali/metrics/traces)

Those five questions are the whole game. Every module fills in one.

## Check yourself

1. What are the three things Istio provides? *(Traffic management, security, and observability.)*
2. Data plane vs control plane in Istio, by name? *(Data plane = Envoy proxies; control plane =
   istiod.)*
3. Do you configure Envoy directly in Istio? *(No — you write Istio objects; istiod translates them
   to Envoy config over xDS.)*
4. How does Istio differ from a gateway like Envoy Gateway? *(A gateway handles edge/in-out
   traffic; a mesh manages traffic between all services too.)*
5. Give one situation where Istio is overkill. *(A handful of services, where an edge gateway plus
   basic retries is simpler.)*

---

**Next:** [1 — Architecture (istiod + the proxies) →](./01-architecture.md)
