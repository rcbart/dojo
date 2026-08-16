# 04 — HTTP routing & filters

*The heart of everyday Envoy work. Concepts + a lab exercising real routing rules and an HTTP
filter. ~25 min. Requires Docker.*

Lab files: [`labs/04-routing/`](../labs/04-routing/).

---

Almost all the config you'll ever write lives in two places inside the HTTP Connection Manager:
the **route configuration** (where requests go) and the **HTTP filter chain** (what happens to
them on the way). This module covers both.

## Route configuration structure

```
route_config
└── virtual_hosts[]        ← selected by the request's Host header (domains)
    └── routes[]           ← ordered match rules; FIRST match wins
        ├── match          ← what makes this route apply
        └── route / redirect / direct_response   ← what to do
```

### Matching a route (`match`)

A route's `match` can test, in increasing specificity:

- **`prefix: "/api/"`** — path starts with this. The workhorse.
- **`path: "/healthz"`** — exact path.
- **`safe_regex: {...}`** — regex on the path (use sparingly; slower).
- **`headers: [...]`** — require header values (exact, prefix, regex, presence). Great for
  canaries (`x-canary: yes`), API versions, auth gating.
- **`query_parameters: [...]`** — match on `?foo=bar`.

**Order matters: Envoy takes the first route that matches.** So specific routes go above the
catch-all `prefix: "/"`. Getting a "wrong backend" is nearly always a route-order bug.

### What to do when it matches

- **`route: { cluster: X }`** — forward to a cluster. Plus options:
  - **`prefix_rewrite` / `regex_rewrite`** — change the path before sending upstream
    (e.g. strip `/api`).
  - **`host_rewrite_literal`** — change the `Host` header sent upstream.
  - **`timeout`, `retry_policy`** — per-route resilience (Module 05).
  - **`request_headers_to_add`, `response_headers_to_add`** — header manipulation (also settable
    at the virtual-host and route-config levels).
- **`redirect: {...}`** — send a 301/302 (change scheme to https, rewrite path/host).
- **`direct_response: {...}`** — Envoy answers itself without any backend (health checks, canned
  errors, maintenance pages).

## HTTP filters — the request pipeline

Inside the HCM, `http_filters` is an **ordered** list; each request passes through them before
the **router** (which must be last). A filter can read, modify, delay, or reject a request. The
ones you'll actually meet:

| Filter | Job |
|--------|-----|
| `router` | Applies the route and forwards upstream. **Always last.** |
| `cors` | Cross-Origin Resource Sharing headers/preflight handling |
| `jwt_authn` | Verify a JWT (auth) and reject invalid tokens |
| `ext_authz` | Call an **external** authorization service (allow/deny per request) |
| `ratelimit` / `local_ratelimit` | Global (via a service) or local request rate limiting |
| `fault` | Inject latency or aborts — for **resilience testing** (chaos) |
| `compressor` | gzip/brotli response compression |
| `lua` / `wasm` | Custom logic in Lua or WebAssembly |
| `ext_proc` | Stream requests to an external processor to mutate them |

You compose behavior by stacking filters — e.g. `cors → jwt_authn → ratelimit → router`. Each is
just another `typed_config` block.

## Lab: routing rules + a fault filter

The lab config ([`envoy.yaml`](../labs/04-routing/envoy.yaml)) sets up several behaviors on one
listener. Run it:

```bash
cd labs/04-routing && docker compose up   # first `docker compose down` the previous lab — labs share ports 10000/9901
```

Now exercise each rule (in another terminal):

**1. A direct response (no backend):**
```bash
curl -i localhost:10000/healthz
# HTTP/1.1 200 OK ... body: ok   — Envoy answered directly
```

**2. A response header added by config:**
```bash
curl -i localhost:10000/ | grep -i x-served-by
# x-served-by: envoy-crash-course   — added by response_headers_to_add
```

**3. A redirect:**
```bash
curl -i localhost:10000/old
# HTTP/1.1 301 Moved Permanently ... location: /new
```

**4. Header-based (canary) routing.** The `/` route only matches when `x-canary: yes` is present;
otherwise the request falls through to the final catch-all. Both reach the backend here, but note
the *matched route differs*:
```bash
curl -s localhost:10000/ -H "x-canary: yes"     # matches the canary route (adds x-route: canary upstream)
curl -s localhost:10000/                        # falls through to the catch-all route
```

**5. Path rewrite:**
```bash
curl -s localhost:10000/api/anything
# reaches the backend as "/" because prefix_rewrite stripped /api
```

**6. Fault injection — deliberate failure.** The `fault` filter aborts `/flaky` with 503 half the
time. Hammer it and watch the mix:
```bash
for i in $(seq 1 10); do curl -s -o /dev/null -w "%{http_code}\n" localhost:10000/flaky; done
# ~5x 200 and ~5x 503 — Envoy injected the failures, the backend never saw them
```
This is how teams test that *callers* handle failures (retries, fallbacks) without breaking a real
backend — chaos engineering as config.

### Experiment

Reorder the routes: move the catch-all `prefix: "/"` route to the **top** of the list, restart,
and re-test `/healthz`. It now returns the backend's echo instead of `ok`, because the catch-all
matched first. Put it back. This is the single most common Envoy routing mistake — **specific
routes above general ones.**

## Check yourself

1. Two routes match a request. Which is used? *(The first one listed.)*
2. Name three things a `match` can test besides path prefix. *(exact path, regex, headers, query
   params.)*
3. What's the difference between `direct_response` and `redirect`? *(Envoy answers with a body
   itself vs tells the client to go elsewhere with a 3xx.)*
4. Why must the `router` filter be last? *(It forwards upstream; filters before it must run
   first.)*
5. What is the `fault` filter for? *(Injecting latency/aborts to test resilience — chaos
   testing — without touching real backends.)*

---

**Next:** [4b — Rate limiting & ext_authz →](./11-rate-limiting-ext-authz.md)
