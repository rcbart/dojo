# 10: Debugging, gotchas & next steps

*The field guide you'll come back to. Concept-only. ~15 min.*

---

You now know the whole model: listeners → filter chains → HTTP filters → routes → clusters →
endpoints, delivered statically or via xDS, at the edge or as a mesh. This last module is the
practical stuff that saves hours.

## A debugging method that always works

When something is wrong, resist guessing at YAML. Follow the request through Envoy's own eyes:

1. **Is Envoy even up and healthy?** `curl localhost:9901/ready` → `LIVE`. Check `docker`/`kubectl`
   logs for a config parse error on startup (Envoy refuses to start on invalid *bootstrap*).
2. **Read the access log line.** It has the response code and (the field to read first) **`%RESPONSE_FLAGS%`**.
   The flag usually tells you the answer before you look anywhere else (table below).
3. **Did it match a route?** `curl localhost:9901/config_dump` and find your route config. Flag
   `NR` = *no route matched* → your `match` is wrong or ordered below a catch-all.
4. **Is the cluster healthy?** `curl localhost:9901/clusters` shows each endpoint's health and
   ejection state. Flag `UH` = *no healthy upstream* → health checks failing, wrong address, or
   backend down.
5. **Turn up the volume.** `curl -X POST localhost:9901/logging?level=debug`, reproduce, read, then
   set it back to `info`.

`/config_dump` + `/clusters` + the access-log flag resolve the large majority of issues.

### `%RESPONSE_FLAGS%` cheat-sheet

| Flag | Meaning | Usual cause |
|------|---------|-------------|
| `NR` | No route configured | `match` wrong / ordered below catch-all / wrong `Host` (virtual_host domains) |
| `UH` | No healthy upstream | all endpoints unhealthy or ejected; bad cluster address |
| `UF` | Upstream connection failure | backend down / wrong port / DNS |
| `UT` | Upstream request timeout | backend too slow vs route `timeout` |
| `URX` | Upstream retry limit exceeded | retries exhausted; backend really failing |
| `UO` | Upstream overflow | circuit breaker tripped (too many concurrent) |
| `RL` | Rate limited | a ratelimit filter rejected it |
| `DC` | Downstream connection termination | the *client* hung up |
| `NC` | No cluster found | route names a cluster that doesn't exist (typo) |

## The gotchas that bite everyone

- **Route order.** First match wins. A `prefix: "/"` catch-all above a specific route silently
  shadows it. Specific routes go **on top**. (This is the #1 mistake; see Module 04.)
- **`typed_config` `@type` typos.** The long `type.googleapis.com/...v3....` URLs must be exact and
  **v3** (v2 was removed years ago). A wrong type = startup failure or a silently ignored block.
- **`virtual_hosts` domains.** If `domains` doesn't include the request's `Host` header (and isn't
  `"*"`), you get `NR`. Easy to forget when adding a second host.
- **Admin interface exposure.** Never bind `:9901` to a public address in production; it leaks
  config and offers `/quitquitquit`. Localhost only.
- **The router filter must be last** in `http_filters`, and every HCM needs one.
- **`prefix_rewrite` vs expectations.** Rewrites change the path the *backend* sees; if the backend
  404s, check what path actually arrived (access log on the backend).
- **Container vs localhost addresses.** In Docker/K8s the cluster address is the *service name*
  (`backend`, `echo`), not `localhost`: `localhost` inside Envoy's container is Envoy itself.
- **STRICT_DNS caching.** Envoy re-resolves on an interval; a just-started backend may take a
  moment to appear. Health checks + retries paper over the gap.
- **Config precedence.** With xDS, the *file/control plane* is the source of truth; a bad push is
  **rejected** and Envoy keeps the last good config (check `*.update_rejected` stats), so "my
  change did nothing" often means "my change was invalid."

## Performance notes (so you're not surprised)

Envoy is fast (C++, non-blocking, worker-thread-per-core), but: regex route matches and heavy Lua/
Wasm filters cost CPU; very large `/config_dump`s indicate an over-large config that slows xDS
pushes; and each additional filter runs on every request. Prefer prefix/header matches over regex,
and keep the filter chain lean.

## Where to go next

- **Official docs & API reference**: <https://www.envoyproxy.io/docs> (the v3 API reference is the
  canonical source for every field you'll ever set).
- **Envoy Gateway**: <https://gateway.envoyproxy.io>, the modern Kubernetes ingress path (Module
  08).
- **Istio docs**: <https://istio.io>, the mesh, sidecar and ambient (Module 09).
- **Go deeper on internals**: read about the threading model, the `go-control-plane` library
  (build your own control plane), and Wasm filters for custom logic.
- **Practice ideas:** add JWT auth (`jwt_authn`) to Lab 04; wire Lab 06 stats into
  Prometheus+Grafana; build a canary with weighted clusters; put TLS origination
  (`UpstreamTlsContext`) in front of an HTTPS backend.

## Course recap: the one-paragraph mental model

A **listener** binds a port and hands connections to a **filter chain**; for HTTP that chain's
**HTTP Connection Manager** runs an ordered list of **HTTP filters** ending in the **router**,
which uses the **route table** to pick a **cluster**, which load-balances and health-checks across
its **endpoints**. Encryption is a separate **transport_socket** layer. All of this is either
written **statically** or delivered **dynamically via xDS** by a **control plane**, and that exact
mechanism, applied at the edge, is an **API gateway**; applied to every workload, is a **service
mesh**. Everything else is detail on top of these nouns.

## Check yourself

1. First stop when debugging a bad response? *(The access-log line and its `%RESPONSE_FLAGS%`.)*
2. You get `NR`. Two likely causes? *(No route matched: bad/ordered-wrong `match`, or `Host`
   not in `virtual_hosts` domains.)*
3. You get `UH`. What do you check? *(`/clusters`: endpoint health/ejection, address, health
   checks.)*
4. Your xDS change "did nothing." What probably happened? *(Envoy rejected an invalid update and
   kept the last good config; check `update_rejected` stats/logs.)*
5. Recite the noun chain from port to backend. *(listener → filter chain → HCM/HTTP filters →
   router → route → cluster → endpoint.)*

---

**You've finished the crash course.** The sidebar jumps you back to any module, and keep the labs
around: the fastest way to cement any of this is to change a config and watch what `curl` and
`:9901` tell you.
