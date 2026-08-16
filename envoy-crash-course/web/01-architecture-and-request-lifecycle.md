# 01 — Architecture & the request lifecycle

*No lab — this is the map. Once you can trace one request through Envoy's objects, the config in
every later module reads itself. ~15 min.*

---

## The five nouns

Envoy's entire behavior is built from a small set of objects. Learn these five and you can read
any Envoy config:

| Object | One-line job | Real-world analogy |
|--------|--------------|--------------------|
| **Listener** | A port Envoy listens on for incoming connections | The front door(s) of the building |
| **Filter chain** | The ordered pipeline that processes what comes through a listener | The assembly line inside the door |
| **Filter** | One step in that pipeline (parse HTTP, check auth, rate-limit, route…) | One worker on the line |
| **Route** | A rule: "requests matching X go to cluster Y" | The signpost / dispatcher |
| **Cluster** | A named group of identical backend servers Envoy can send traffic to | A team of workers who all do the same job |
| **Endpoint** | One actual backend instance (an IP:port) inside a cluster | One specific worker |

> Mnemonic for the happy path: **a connection arrives at a *listener*, flows through a *filter
> chain*, the last HTTP filter (the *router*) reads the *route* table to pick a *cluster*, and the
> cluster load-balances to one *endpoint*.** That sentence is Envoy.

## How one HTTP request flows through Envoy (step by step)

Follow a single `GET /api/users` from a browser to a backend:

```
                          ┌─────────────────────────  ENVOY  ─────────────────────────┐
                          │                                                            │
browser ──GET /api/users──►  LISTENER :10000                                           │
                          │      │                                                     │
                          │      ▼                                                     │
                          │   FILTER CHAIN                                             │
                          │      │  (network filters)                                  │
                          │      ▼                                                     │
                          │   HTTP CONNECTION MANAGER  ── parses the HTTP request      │
                          │      │                                                     │
                          │      ▼  (HTTP filters, in order)                           │
                          │   [ cors ] → [ jwt_authn ] → [ router ]                    │
                          │                                │                           │
                          │                                ▼   reads the ROUTE table   │
                          │                       match: /api/*  → cluster "users_svc" │
                          │                                │                           │
                          │                                ▼                           │
                          │                       CLUSTER "users_svc"                  │
                          │                         load-balance across endpoints ─────┼──► 10.0.0.7:8080
                          │                                                            │    10.0.0.8:8080
                          └────────────────────────────────────────────────────────────┘    10.0.0.9:8080
```

Narrated:

1. **The listener accepts the TCP connection** on `0.0.0.0:10000`. A listener is bound to an
   address+port and owns one or more filter chains.
2. **The filter chain runs its network (L4) filters.** For HTTP traffic the crucial one is the
   **HTTP Connection Manager (HCM)** — a network filter that turns the raw byte stream into
   structured HTTP requests (handling HTTP/1.1, HTTP/2, HTTP/3). Everything HTTP happens *inside*
   the HCM.
3. **Inside the HCM, the HTTP filters run in order.** This is a second, HTTP-level pipeline —
   e.g. `cors`, then `jwt_authn` (verify a token), then finally the **router** filter. Each
   filter can inspect or modify the request, or short-circuit it (e.g. auth rejects with 401).
4. **The router filter consults the route configuration.** The route table is a set of
   **virtual hosts** and **routes**; the router finds the first route whose match (path prefix,
   headers, method…) fits — say `prefix: /api/` → `cluster: users_svc` — possibly rewriting the
   path, adding headers, or applying a timeout/retry policy.
5. **The chosen cluster load-balances to one endpoint.** The cluster `users_svc` knows its
   endpoints (either from static config or discovered dynamically). It picks one per its
   load-balancing policy (round-robin, least-request…), respecting health checks and circuit
   breakers, and forwards the request.
6. **The response flows back** up through the same filters (they get a crack at the response too)
   and out to the browser.

Two independent pipelines are the key insight: the **network filter chain** (L4, operates on the
connection) and, inside the HCM, the **HTTP filter chain** (L7, operates on each request). Most of
your day-to-day config lives in the HTTP filters and the route table.

## Downstream vs upstream — learn this vocabulary now

Envoy's docs and stats use two words constantly:

- **Downstream** = the side facing the **client** (whoever connected *to* Envoy). The browser is
  downstream.
- **Upstream** = the side facing the **backend** (whoever Envoy connects *to*). `users_svc` is
  upstream.

So "a downstream connection" is a client's connection *to* Envoy; "an upstream request" is
Envoy's request *to* a backend. Stats like `downstream_rq_total` and `upstream_cx_active` read
naturally once this clicks: requests received from clients vs connections open to backends.

## Static vs dynamic configuration (the big fork)

There are two ways Envoy gets its listeners/routes/clusters:

- **Static** — you write it all in a YAML file (`static_resources:`) and Envoy loads it at
  startup. Simple, great for learning and small setups. **This is what Modules 02–06 use.**
- **Dynamic (xDS)** — Envoy asks a **control plane** over a gRPC/REST API ("give me my
  listeners… my clusters… my endpoints…") and receives updates live, with no restart. This is
  how meshes and gateways manage fleets. **Module 07** covers it.

Crucially, the *objects are the same* either way — a cluster is a cluster whether it came from a
file or a control-plane push. Master the static objects first and dynamic config is just "the
same objects, delivered over the network."

## The threading model (why Envoy is fast)

Not essential for using Envoy, but it explains its performance and some behaviors:

- Envoy runs a small number of **worker threads** (by default, one per CPU core). Each worker has
  its own **event loop** (built on libevent) and handles connections with **non-blocking,
  asynchronous I/O** — one thread juggles thousands of connections without blocking on any.
- Connections are **not shared** between workers (a "share nothing" design), which avoids locks
  on the hot path and scales linearly with cores.
- A separate **main thread** handles the admin interface, xDS updates, and stats flushing — so
  config changes don't stall request processing.

Practical consequence: some stats and connection-pool behaviors are *per worker*, which
occasionally surprises people (e.g. a tiny backend may see connections from each worker).

## The mental checklist for reading any Envoy config

When you open an Envoy YAML, find these in order and you'll understand it:

1. **What listeners are defined?** → what ports does it accept traffic on?
2. **For each listener, what's the filter chain?** → almost always an HCM for HTTP.
3. **Inside the HCM: what HTTP filters, and what route config?** → what gets checked, and where do
   requests go?
4. **What clusters exist, and how do they find endpoints?** → the backends and how they're
   discovered/balanced.

That's the whole game. Everything else is options on these four questions.

## Check yourself

1. Put these in request order: cluster, listener, route, filter chain, endpoint.
   *(listener → filter chain → route → cluster → endpoint.)*
2. What does the HTTP Connection Manager do, and where does it sit? *(A network filter that parses
   the byte stream into HTTP requests and hosts the HTTP filter chain.)*
3. Is the browser upstream or downstream? *(Downstream — it's the client side.)*
4. Name the two independent filter pipelines. *(The L4 network filter chain, and the L7 HTTP
   filter chain inside the HCM.)*
5. What changes between static and dynamic config — the objects, or the delivery? *(Only the
   delivery; the objects are identical.)*

---

**Next:** [02 — Lab: your first Envoy (static config) →](./02-lab-first-static-config.md)
