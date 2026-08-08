# 05 — Clusters, load balancing & resilience

*How Envoy picks a healthy backend and survives failures. Concepts + a two-backend lab. ~25 min.
Requires Docker.*

Lab files: [`labs/05-clusters/`](./labs/05-clusters/).

---

A **cluster** is Envoy's model of an upstream service: a named group of **endpoints** (host:port)
plus the policy for choosing among them and deciding which are healthy. If routes answer "where
does this request go?", clusters answer "*which instance*, and what if it's down?"

## Endpoint discovery: how Envoy learns the members

The cluster `type` sets how the endpoint list is populated:

- **`STATIC`** — endpoints are literal IP:ports in the config.
- **`STRICT_DNS`** — Envoy resolves a DNS name and uses *all* returned A records, re-resolving
  periodically. Perfect for Docker/Kubernetes service names (what our labs use).
- **`LOGICAL_DNS`** — like STRICT but keeps one connection, re-resolving lazily (for huge
  fleets / a single virtual IP).
- **`EDS`** — Endpoint Discovery Service: endpoints pushed dynamically over xDS by a control plane
  (Module 07). This is how meshes keep up with pods coming and going.

## Load balancing policies (`lb_policy`)

Once there are several healthy endpoints, `lb_policy` picks one per request:

- **`ROUND_ROBIN`** — rotate evenly. Simple, predictable.
- **`LEAST_REQUEST`** — send to the endpoint with the fewest in-flight requests. Usually the best
  default under uneven load.
- **`RANDOM`** — pick at random; cheap, decent at scale.
- **`RING_HASH` / `MAGLEV`** — consistent hashing on a key (e.g. a header or cookie) for **session
  affinity** ("sticky" routing to the same backend).

## Resilience: three layers that keep bad backends out

**1. Active health checks** — Envoy proactively probes each endpoint (`http_health_check` hits a
path on an interval). Fail enough probes → the endpoint is marked unhealthy and gets no traffic
until it recovers. Proactive: catches a sick backend *before* a user hits it.

**2. Outlier detection (passive health checking)** — Envoy watches *real* traffic and **ejects**
an endpoint that returns too many consecutive 5xx / connection errors, for a cooldown
(`base_ejection_time`), then tentatively returns it. Reactive: catches failures the health check
path doesn't.

**3. Timeouts & retries (per route)** — a `timeout` caps how long Envoy waits; a `retry_policy`
re-sends a failed idempotent request to *another* endpoint (`retry_on: 5xx,reset,
connect-failure`). Retries + multiple endpoints = a single bad instance becomes invisible to the
caller.

Together with **circuit breakers** (caps on concurrent connections/requests so one overloaded
cluster can't exhaust Envoy), these are the reason Envoy is described as a *resilience* layer, not
just a router.

## Lab: load-balance and survive a failure

Two identical-ish backends (A and B) sit behind one cluster. Run it:

```bash
cd labs/05-clusters && docker compose up   # first `docker compose down` the previous lab — labs share ports 10000/9901
```

**1. Watch round-robin spread the load:**
```bash
for i in $(seq 1 6); do curl -s localhost:10000; done
# alternates: response from backend A / backend B / A / B ...
```

**2. Kill a backend and watch Envoy route around it.** In another terminal:
```bash
docker compose stop backend_b
for i in $(seq 1 6); do curl -s localhost:10000; done
# now every response is "backend A" — B was health-checked out, no client errors
```
Bring it back and traffic rebalances:
```bash
docker compose start backend_b
```

**3. See health in the admin API:**
```bash
curl -s localhost:9901/clusters | grep -E "health_flags|::cx_"
# endpoints show healthy / failed_active_hc / ejected state
```

### Experiments

1. **Change the policy.** Set `lb_policy: LEAST_REQUEST` (or `RANDOM`), restart, re-run the loop.
   With two idle backends the visible behavior is similar; the difference shows under uneven load.
2. **Trip outlier detection.** Point one endpoint at a backend that returns 503 (e.g. add a route
   in that backend, or reuse Lab 04's `/flaky`) and watch `consecutive_5xx` eject it in
   `/clusters`.
3. **Turn off retries.** Remove the `retry_policy`, stop a backend *mid-loop*, and you'll see the
   occasional 503 slip through that retries would have hidden.

## Check yourself

1. What does a cluster represent? *(An upstream service: its endpoints + how to balance and
   health-check them.)*
2. STRICT_DNS vs EDS — when each? *(DNS name resolved by Envoy vs endpoints pushed by a control
   plane over xDS; EDS for dynamic mesh environments.)*
3. Active vs passive health checking? *(Active = Envoy probes a path proactively; passive =
   outlier detection ejects on real 5xx/errors.)*
4. Which lb_policy gives session affinity? *(RING_HASH / MAGLEV — consistent hashing on a key.)*
5. How do a timeout + retry_policy + multiple endpoints hide a single failing backend? *(Envoy
   caps the wait, then retries the request on a different healthy endpoint.)*

---

**Next:** [06 — Observability & the admin interface →](./06-observability-and-admin.md)
