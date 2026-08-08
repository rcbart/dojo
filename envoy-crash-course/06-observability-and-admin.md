# 06 — Observability & the admin interface

*Envoy's superpower is that it sees every request. This module is how you look. Concepts +
hands-on using the admin API of any lab you already have running. ~20 min.*

No new lab — start any earlier stack (`labs/02-static/`, `labs/04-routing/`, or
`labs/05-clusters/`) with `docker compose up` and follow along.

---

Because every request passes through Envoy, it's a natural place to emit telemetry. Envoy gives
you the classic **three pillars** — logs, metrics, traces — plus a live **admin interface** for
introspection.

## The admin interface (port 9901)

Every lab config has an `admin:` block on `:9901`. It exposes dozens of endpoints; the ones you'll
use constantly:

| Endpoint | What it gives you |
|----------|-------------------|
| `GET /ready` | Liveness/health of Envoy itself (200 = serving) |
| `GET /stats` | **All** metrics, in Prometheus-ish text |
| `GET /stats/prometheus` | Metrics in Prometheus exposition format (for scraping) |
| `GET /clusters` | Every endpoint's health, in-flight requests, ejection state |
| `GET /config_dump` | The **entire effective config** as JSON — invaluable for xDS debugging |
| `GET /listeners` | Bound listeners and their addresses |
| `GET /server_info` | Version, uptime, state, hot-restart epoch |
| `POST /logging?level=debug` | Change log level live, no restart |
| `POST /quitquitquit` | Graceful shutdown |

> ⚠️ **The admin interface exposes secrets-adjacent data and control endpoints. Never bind it to a
> public address.** In production, bind it to `127.0.0.1` or a localhost-only socket. In our labs
> it's on `0.0.0.0` purely for convenience.

Try it now against a running lab:

```bash
curl -s localhost:9901/ready              # → LIVE
curl -s localhost:9901/server_info | head
curl -s localhost:9901/clusters | head
```

## Metrics (stats)

Envoy tracks **counters**, **gauges**, and **histograms** for essentially everything. Names are
dotted and namespaced by the `stat_prefix` you set on the HCM and by cluster name. Send a couple
of requests, then:

```bash
curl -s localhost:9901/stats | grep -E "ingress_http\.(downstream_rq_total|downstream_rq_2xx|downstream_rq_5xx)"
curl -s localhost:9901/stats | grep -E "cluster\.echo_service\.(upstream_rq_total|upstream_cx_active|upstream_rq_pending)"
```

Key families to know:

- **`http.<stat_prefix>.downstream_rq_*`** — requests *from clients*: totals and by response class
  (`_2xx`, `_4xx`, `_5xx`), active connections, request time histograms.
- **`cluster.<name>.upstream_rq_*` / `upstream_cx_*`** — requests/connections *to backends*,
  including `upstream_rq_retry`, `_pending_overflow` (circuit breaker trips), and per-endpoint
  health.
- **`server.*`** — memory, uptime, live connections.

The **RED method** (Rate, Errors, Duration) maps directly: rate = `downstream_rq_total`, errors =
`downstream_rq_5xx`, duration = the `downstream_rq_time` histogram. In production you scrape
`/stats/prometheus` into Prometheus and graph these in Grafana.

## Access logs

Each lab enables the **stdout access logger** on the HCM, so `docker compose` logs show one line
per request. The default format includes method, path, response code, bytes, durations, upstream
host, and more. You can set a **custom format** with **command operators** like `%RESPONSE_CODE%`,
`%DURATION%`, `%UPSTREAM_HOST%`, `%REQ(:PATH)%`, `%RESPONSE_FLAGS%`:

```yaml
access_log:
- name: envoy.access_loggers.stdout
  typed_config:
    "@type": type.googleapis.com/envoy.extensions.access_loggers.stream.v3.StdoutAccessLog
    log_format:
      text_format_source:
        inline_string: "%START_TIME% %REQ(:METHOD)% %REQ(:PATH)% %RESPONSE_CODE% %RESPONSE_FLAGS% %DURATION%ms upstream=%UPSTREAM_HOST%\n"
```

**`%RESPONSE_FLAGS%` is the debugging goldmine** — short codes explain *why* a request ended a
certain way: `UH` (no healthy upstream), `UF` (upstream connection failure), `UT` (upstream
timeout), `NR` (no route configured), `URX` (retry limit hit), `DC` (downstream disconnect). When
something's wrong, read the flag first.

## Distributed tracing (brief)

Envoy can generate/propagate trace spans (B3 / W3C `traceparent` headers) and report them to
Jaeger, Zipkin, or an OpenTelemetry collector. Enable it with a `tracing:` block on the HCM and
set a sampling percentage. Because the sidecar sits on every hop, an Envoy mesh gives you
end-to-end traces across services with no app code changes — a major reason teams adopt it. Full
setup (running a collector) is beyond this crash course, but know that it's config, not code.

## Lab tasks

1. Send 10 requests to a running lab, then diff `downstream_rq_total` before/after via `/stats`.
2. Break a backend (Lab 05: `docker compose stop backend_b`) and watch `upstream_rq_retry` and the
   `%RESPONSE_FLAGS%` in the access log change.
3. Flip log level live: `curl -s -X POST localhost:9901/logging?level=debug`, send a request, see
   the verbose logs, then set it back to `info`.

## Check yourself

1. Which admin endpoint shows the full effective config? *(`/config_dump`.)*
2. Why must the admin port never be public? *(It exposes config/secrets-adjacent data and control
   endpoints like `/quitquitquit`.)*
3. In RED terms, which stats are rate/errors/duration? *(`downstream_rq_total` /
   `downstream_rq_5xx` / `downstream_rq_time`.)*
4. What does `%RESPONSE_FLAGS%` give you? *(A short code for *why* a request ended that way — UH,
   UT, NR, etc.)*
5. How much app code do you change to get tracing across a mesh? *(None — it's Envoy config on
   each hop.)*

---

**Next:** [07 — Dynamic config with xDS →](./07-dynamic-config-xds.md)
