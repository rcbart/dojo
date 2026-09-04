# 2: API gateways

*The front desk: what belongs at the front door, what absolutely doesn't, and the internal vs external split. ~12 min read.*

---

Once a system is more than one service, the outside world has a problem: *which* service do I talk
to, and does every one of them really need its own authentication, its own rate limiting, its own
TLS setup? An **API gateway** is the answer: one front door for all your APIs, where the
cross-cutting concerns live exactly once.

## What an API gateway is

Mechanically, a gateway is an L7 reverse proxy, the same species as the load balancer from the
last module and the Envoy proxy from its own course. What makes it a *gateway* is the job it's
given: it is the **policy edge** of your API. Clients see one stable host; behind it, requests fan
out to whatever services currently implement each path.

```
            api.example.com
                  │
           ┌──── gateway ────┐        authn, rate limits, routing, TLS
           ▼        ▼        ▼
        orders   billing   search      each service, free to change
```

## What a gateway SHOULD do

Each of these is a thing every service would otherwise have to implement, identically, forever:

- **Authentication at the edge.** Validate the token (OAuth 2.0/OIDC/JWT, Identity Dojo territory)
  once, reject garbage before it touches a backend, and pass verified identity inward as headers
  or a signed token. Services still *authorize* ("may this user delete that order?"), but they
  shouldn't each be parsing tokens.
- **Rate limiting & quotas.** "1,000 requests/hour per API key" is meaningless if every service
  counts separately. The front door is the only place a global count can live.
- **Routing & API versioning.** `/v2/orders` → the new orders service; `/v1/orders` → the old one
  until it dies. The public URL space stays stable while the service topology churns.
- **TLS termination** for north–south traffic, with certificates managed in one place.
- **Observability at the boundary.** One access log, one latency histogram, one request-ID stamp
  for every API call you serve: the baseline every debugging session starts from.
- **Basic request hygiene.** Size limits, timeout enforcement, rejecting obviously malformed
  requests: the cheap protections, applied uniformly.

## What a gateway should NOT do

This list is why gateway projects fail. The gateway is shared infrastructure on the hot path of
*every* request; whatever you put in it, you've put in front of everything you ship:

- **No business logic.** The moment the gateway knows that "gold-tier customers skip the fraud
  check", product behavior lives in a config file owned by the infrastructure team, deployed on
  its own schedule, reviewed by nobody who owns the feature. This is the #1 failure mode, and it
  has a name from history: the ESB, the enterprise service bus that slowly ate the business
  logic of a generation of architectures and became the thing nobody could change.
- **No response aggregation / orchestration.** "Call orders, then billing, then merge the JSON" is
  an application. If clients need a stitched view, build a thin **backend-for-frontend** service
  that owns that stitching; it can deploy, scale, and fail on its own without taking every other
  API with it.
- **No data transformation** beyond protocol mechanics. Header in, header out is fine; rewriting
  payload schemas between versions is a service's contract, not the front desk's.
- **Not a shared database of config for everyone.** Route tables with thousands of entries edited
  by twenty teams through tickets is the ESB again, wearing a YAML costume. Good gateway setups
  let each team own their routes (the Kubernetes Gateway API's Gateway-vs-HTTPRoute split, Envoy
  course module 8, is exactly this).

The test for any proposed gateway feature: **would this rule need to change when a product feature
changes?** If yes, it belongs in a service someone owns, not in the front door.

## Internal vs external gateways

Both are "a gateway", but they answer different threats and serve different clients:

| | **External (edge) gateway** | **Internal gateway** |
|---|---|---|
| Clients | The internet: browsers, mobile apps, partners | Your own teams' services |
| Trust level | Zero: assume hostility | Low but not zero (zero-trust says: still verify) |
| Auth job | Full authentication: OIDC, API keys, bot defense | Service identity (mTLS, service tokens), tenant isolation |
| Rate limits | Per customer/key, protecting you from the world | Per calling service, protecting teams from each other |
| API surface | Small, stable, versioned, documented for outsiders | Wider, faster-moving, documented for insiders |
| Typical form | Managed edge product or Envoy-based edge fleet | Lighter proxy tier, often per-domain, or mesh policy |

**When do you need an internal gateway at all?** When one department's services are consumed by
many other departments: a payments platform inside a big company is effectively a product with
internal customers, and it wants the same front-desk services: stable routes, quotas so one buggy
consumer can't flatten it, and an audit trail. In a small system, an internal gateway is usually
premature: the service mesh (Istio course) already gives you mTLS, retries, and telemetry for
east–west traffic, and a mesh plus an *external* gateway covers most architectures. The practical
sequence: external gateway first, mesh when service-to-service concerns bite, internal gateways
only when a domain inside the company becomes a platform.

## How this connects

A gateway is often *implemented* with the pieces you already know: Envoy is the data plane of many
gateway products, the Kubernetes Gateway API is the config model, and the token validation it does
at the edge is the OAuth/OIDC material from Identity Dojo, deployed to production.

---

**Next:** [3: CDNs →](./03-cdns.md)
