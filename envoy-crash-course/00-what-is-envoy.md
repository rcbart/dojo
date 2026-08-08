# 00 — What Envoy is (and why it exists)

*No lab in this module — it builds the mental model everything else hangs on. ~10 min read.*

---

## The one-line answer

**Envoy is a proxy.** A proxy is a program that sits *between* a client and a server: the client
talks to the proxy, and the proxy talks to the real server on the client's behalf, then relays
the answer back.

```
client  ─────►  ENVOY  ─────►  your backend service
        ◄─────         ◄─────
```

Why put something in the middle? Because that middle spot is a fantastic place to do work that
*every* request needs but that you don't want baked into every service: routing, load balancing,
retries, timeouts, TLS encryption, authentication, rate limiting, and collecting metrics. Envoy
does all of that, and it is configured entirely by data (YAML/JSON), not code.

## "L7 proxy" — what the L7 means

Networks are described in layers. Two matter here:

- **Layer 4 (L4)** — the *transport* layer: raw TCP/UDP connections. An L4 proxy sees "bytes
  flowing between IP:port and IP:port." It can forward a connection but doesn't understand what's
  inside it.
- **Layer 7 (L7)** — the *application* layer: the actual protocol, like HTTP, gRPC, or Kafka. An
  L7 proxy *parses* the request — it can read the URL path, the headers, the method — and make
  decisions based on them.

Envoy does **both**, but its superpower is **L7**: because it understands HTTP/gRPC, it can say
"send `POST /checkout` to the payments service, retry it up to 3 times, and add a request-id
header" — decisions impossible for something that only sees bytes.

## The phrase you'll hear: "the universal data plane"

Envoy was built at Lyft (2016) and is now a graduated CNCF project. Its designers coined a useful
split:

- The **data plane** is the thing that actually touches your traffic — moves the bytes, applies
  the rules. **Envoy is a data plane.**
- The **control plane** is the brain that *tells* the data plane what to do — it computes config
  and pushes it to the proxies. Envoy is *not* a control plane; it consumes config from one (or
  from a static file).

"Universal data plane" means: Envoy is designed to be driven by *any* control plane through a
standard API (**xDS**, Module 07). That is exactly why so many different products — Istio,
Consul, Envoy Gateway, Contour, AWS App Mesh — all use Envoy as their data plane and just supply
their own control plane. **Learn Envoy once, and you understand the engine inside all of them.**

## Where Envoy shows up (the three classic roles)

The same Envoy binary plays different roles depending on *where you put it*:

1. **Edge / API gateway** — one (or a few) Envoys at the front door of your system, taking traffic
   from the internet and routing it to internal services. This is the "reverse proxy / ingress"
   role, competing with nginx and HAProxy.
2. **Sidecar** — one Envoy deployed right next to *each* instance of *each* service (in the same
   pod/host). Every bit of traffic in and out of that service goes through its personal Envoy.
   Thousands of Envoys, all identical, programmed by a control plane. This is the **service
   mesh** pattern (Module 09).
3. **Middle proxy** — an internal shared proxy between tiers of services.

It's the *same tool*. The roles differ only in topology and who configures it.

## Envoy vs nginx / HAProxy — why teams pick Envoy

nginx and HAProxy are excellent, battle-tested proxies. Envoy's distinguishing traits, especially
for modern microservice/cloud-native systems:

- **Dynamic configuration without restarts.** Envoy can be reconfigured *live* over its xDS API —
  add a route, change a backend, rotate a cert — with **zero dropped connections**. Traditional
  proxies historically reloaded config by restarting/forking. This is *the* reason meshes chose
  Envoy: a control plane can reprogram thousands of proxies continuously.
- **First-class L7 for modern protocols** — native HTTP/2, HTTP/3 (QUIC), and gRPC support,
  including gRPC-specific features.
- **Deep observability out of the box** — hundreds of metrics, structured access logs, and
  distributed tracing built in, not bolted on.
- **An extensible filter architecture** — its request-processing pipeline is a chain of pluggable
  "filters" (auth, rate limit, transformation, WASM…), so behavior is composable (Module 04).
- **Advanced resilience primitives** — outlier detection, circuit breaking, sophisticated retry
  and load-balancing policies as configuration (Module 05).

The trade-off: Envoy's configuration is **larger and more verbose** than an nginx config —
because it exposes so much control. This course's job is to make that verbosity feel logical.

## A tiny taste of the config (don't worry about details yet)

Everything Envoy does is expressed in structured config like this. Skim it — you'll write and
run exactly this in Module 02:

```yaml
static_resources:
  listeners:
  - name: my_first_listener
    address:
      socket_address: { address: 0.0.0.0, port_value: 10000 }   # accept traffic here
    # ... filters that parse HTTP and decide where the request goes ...
  clusters:
  - name: some_backend
    # ... where the real backend actually lives ...
```

Two of the words in there — **listener** (where Envoy accepts traffic) and **cluster** (a group
of backend servers Envoy sends traffic to) — are the two nouns you'll meet first in the next
module. Everything else is what happens *between* them.

## Check yourself

Before moving on, you should be able to answer:

1. In one sentence, what does a proxy do? *(Sits between client and server, relaying requests.)*
2. What does "L7" let Envoy do that "L4" doesn't? *(Read and act on the actual HTTP request —
   path, headers, method — not just raw bytes.)*
3. What's the difference between a data plane and a control plane, and which one is Envoy?
   *(Data plane moves traffic; control plane decides config. Envoy is the data plane.)*
4. Name the three roles Envoy can play. *(Edge gateway, sidecar, middle proxy.)*
5. What is Envoy's headline advantage over classic proxies for microservices? *(Live, dynamic
   reconfiguration with no restarts/drops, via xDS.)*

---

**Next:** [01 — Architecture & the request lifecycle →](./01-architecture-and-request-lifecycle.md)
