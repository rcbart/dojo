# 4b — Rate limiting & ext_authz: policy at the proxy

*The two filters that turn Envoy from a router into a policy edge: limiting how often, and deciding who. ~12 min read.*

---

Module 4 showed the HTTP filter chain and name-dropped two filters that deserve their own module,
because together they are how Envoy becomes the enforcement point for the fundamentals course's
"API gateway SHOULD list": **rate limiting** (how often may you call) and **external
authorization** (may you call at all).

## Local rate limiting: the circuit breaker for abuse

The simplest protection lives entirely inside one Envoy: a **token bucket** per proxy.

```yaml
http_filters:
- name: envoy.filters.http.local_ratelimit
  typed_config:
    "@type": type.googleapis.com/envoy.extensions.filters.http.local_ratelimit.v3.LocalRateLimit
    stat_prefix: rl
    token_bucket: { max_tokens: 100, tokens_per_fill: 100, fill_interval: 1s }
    filter_enabled:  { default_value: { numerator: 100 } }
    filter_enforced: { default_value: { numerator: 100 } }
```

Each request takes a token; an empty bucket means **429 Too Many Requests**. The bucket refills at
a steady rate, so bursts up to `max_tokens` pass but the *sustained* rate is capped. Two things to
notice: the `filter_enabled` / `filter_enforced` pair lets you run in **shadow mode** — count and
log what *would* be limited before you turn it on, the same observe-then-enforce habit every
module of this course keeps preaching; and "local" means **per Envoy instance** — ten sidecars
each allowing 100 rps allow 1,000 rps in total. Local limiting is the right tool for protecting
*this* process (and as a backstop when fancier systems fail). It cannot express a *global* truth.

## Global rate limiting: one count, many proxies

"Free tier: 1,000 requests/hour per API key" is a promise about a **customer**, not a proxy — so
somewhere, one counter must exist. Envoy's answer is a **rate limit service**: each Envoy sends
the request's **descriptors** (key-value facts you choose: the API key, the route, the client IP)
to a central gRPC service that keeps the counters (typically in Redis) and answers allow/deny.

```yaml
# route-level: what facts to send
rate_limits:
- actions:
  - request_headers: { header_name: x-api-key, descriptor_key: api_key }
```

The mental model: **Envoy contributes facts, the service owns arithmetic.** Your quota logic —
tiers, overrides, spike allowances — lives in the service's config, not scattered through proxy
YAML. The cost is a network hop on the request path, so the filter's `failure_mode_deny` choice
matters: deny-on-failure protects the backend even when the limiter dies, allow-on-failure
protects availability — pick per route, deliberately. In practice: local limits everywhere as the
crude backstop, global limits where a promise to a *customer* is being kept — both at once is the
production configuration.

## ext_authz: authentication decisions, outsourced

The **external authorization** filter pauses each request and asks another service: *may this
proceed?* The check service sees the request's metadata (method, path, headers) and answers —
allow (optionally adding headers) or deny (with a status and body Envoy returns verbatim).

```yaml
- name: envoy.filters.http.ext_authz
  typed_config:
    "@type": type.googleapis.com/envoy.extensions.filters.http.ext_authz.v3.ExtAuthz
    grpc_service: { envoy_grpc: { cluster_name: authz_service } }
    failure_mode_allow: false        # authz down => requests DENIED. For auth: yes.
```

Why this design is the important part: the proxy **enforces**, the service **decides**. Your token
validation — parse the JWT, check the signature against the IdP's keys, verify `iss`/`aud`/`exp`,
map scopes to permissions (all of it Identity Dojo material) — lives in one small service you own,
in a real language, tested like code. Envoy guarantees *no request skips the check*: the filter
runs before routing, so there is no forgotten endpoint, no service that "didn't add the
middleware." That inversion — every service trusting a header like `x-user-id` *because ext_authz
is the only thing that can set it* (list it in `internal_only_headers` / strip it from client
requests) — is how "authenticate at the edge, authorize in the service" is actually implemented.

The pattern scales down as well as up: on the mesh's sidecars, the same filter enforces
service-to-service policy — Istio's `AuthorizationPolicy` (its course, module 6) compiles to
exactly this machinery inside each sidecar's Envoy.

## The order of the chain

Policy filters compose by position, and the conventional order is a security statement:

```
jwt_authn / ext_authz  →  ratelimit  →  router
   who are you?           how often?     where to?
```

Authenticate first so limits can count *identities* rather than IPs (an attacker with a botnet has
many IPs; a free-tier customer has one API key). And both before the router, because policy that
runs after routing decisions can be dodged by route quirks. When a policy filter misbehaves, the
debugging tools are module 6's: `/stats | grep ratelimit` (look for `over_limit` vs `ok`), access
logs with the response flags — `RL` marks a rate-limited request, `UAEX` an unauthorized one.

---

**Next:** [5 — Clusters, load balancing & resilience →](./05-clusters-load-balancing-resilience.md)
