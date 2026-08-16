# 02 — Lab: your first Envoy (static config)

*Hands-on. You'll run Envoy in Docker, proxy a real request through it, and understand every line
of the config. ~20 min. Requires Docker.*

The files for this lab live in [`labs/02-static/`](../labs/02-static/) — `envoy.yaml` and
`docker-compose.yaml`. You can run them as-is; below we build the same config up piece by piece
so nothing is a black box.

---

## What we're building

The smallest config that does something real: one **listener** on port `10000` that speaks HTTP
and forwards every request to one **cluster** (a backend that just echoes a string).

```
curl ──►  Envoy :10000  ──►  backend :5678  ("hello from the backend")
```

## Run it (30 seconds)

From `labs/02-static/`:

```bash
docker compose up
```

Docker pulls Envoy `v1.38-latest` and the tiny echo backend, then starts both. In another
terminal:

```bash
curl localhost:10000
# → hello from the backend
```

That response came **from the backend, through Envoy**. You now have a working proxy. When done,
`Ctrl-C` and `docker compose down`.

## The config, line by line

Open [`envoy.yaml`](../labs/02-static/envoy.yaml). It has three top-level sections: `admin`,
`static_resources.listeners`, and `static_resources.clusters`. Recall the mental checklist from
Module 01 — listeners, filter chains, HTTP filters + routes, clusters. Here they are for real.

### 1. The admin interface

```yaml
admin:
  address:
    socket_address: { address: 0.0.0.0, port_value: 9901 }
```

Envoy exposes a built-in management server. It's how you inspect a running Envoy — stats, the
live config, health. We'll use it heavily in Module 06. **It is powerful and unauthenticated;
never bind it to a public interface in production** (here it's fine — it's local).

Try it now while the lab runs:

```bash
curl -s localhost:9901/ready          # → LIVE
curl -s localhost:9901/server_info | head          # version, state, uptime
curl -s "localhost:9901/stats?filter=http.ingress_http.downstream_rq_total"
```

That last one shows how many requests your listener has handled — run a few `curl localhost:10000`
first and watch it climb.

### 2. The listener

```yaml
listeners:
- name: main_listener
  address:
    socket_address: { address: 0.0.0.0, port_value: 10000 }
  filter_chains:
  - filters:
    - name: envoy.filters.network.http_connection_manager
      typed_config:
        "@type": type.googleapis.com/envoy.extensions.filters.network.http_connection_manager.v3.HttpConnectionManager
        ...
```

- **`address`** — bind to all interfaces on port 10000; this is where clients connect.
- **`filter_chains[].filters`** — the L4 pipeline. Here there's exactly one network filter, the
  **HTTP Connection Manager** (HCM). Everything HTTP happens inside it.
- **`"@type": type.googleapis.com/…v3.HttpConnectionManager`** — Envoy config is strongly typed;
  this URL names the exact message type. You'll copy these `@type` lines a lot; you don't
  memorize them, you look them up in the docs. The `v3` is Envoy's stable API version.
- **`stat_prefix: ingress_http`** — labels this listener's metrics (that's the
  `http.ingress_http.*` you saw in the admin stats).
- **`access_log` → StdoutAccessLog** — log each request to stdout. Watch the `docker compose up`
  terminal as you curl: you'll see a line per request.

### 3. The route config (inside the HCM)

```yaml
route_config:
  virtual_hosts:
  - name: all_hosts
    domains: ["*"]
    routes:
    - match: { prefix: "/" }
      route: { cluster: echo_service }
```

- **`virtual_hosts`** — a group of routes selected by the request's `Host` header.
  `domains: ["*"]` matches any host. (A real gateway might have one virtual host for
  `api.example.com` and another for `www.example.com`.)
- **`routes`** — ordered match rules. `match: { prefix: "/" }` matches every path; `route:
  { cluster: echo_service }` sends it to our cluster. Routes are the dispatcher from Module 01.

### 4. The HTTP filters

```yaml
http_filters:
- name: envoy.filters.http.router
  typed_config:
    "@type": type.googleapis.com/…v3.Router
```

The L7 pipeline. Here it's just the **router** — the filter that actually applies the route
decision and forwards upstream. **The router is always last.** In Module 04 we'll add filters
*before* it (CORS, auth, fault injection); each gets to inspect/modify the request on its way to
the router.

### 5. The cluster

```yaml
clusters:
- name: echo_service
  type: STRICT_DNS
  lb_policy: ROUND_ROBIN
  load_assignment:
    cluster_name: echo_service
    endpoints:
    - lb_endpoints:
      - endpoint:
          address:
            socket_address: { address: backend, port_value: 5678 }
```

- **`type: STRICT_DNS`** — how Envoy finds endpoints. `STRICT_DNS` means "resolve this hostname
  (`backend`) via DNS and use every IP it returns." (Docker's internal DNS resolves `backend` to
  the echo container.) Other discovery types — STATIC, LOGICAL_DNS, EDS — are Module 05.
- **`lb_policy: ROUND_ROBIN`** — spread requests across the cluster's endpoints. With one
  endpoint it doesn't matter yet; in Module 05 you'll add a second and watch it alternate.
- **`load_assignment.endpoints`** — the actual backend address(es). This is the `endpoint` noun
  from Module 01.

## Experiments (do these — they cement the model)

1. **Watch the request flow.** Keep `docker compose up` in view and run `curl localhost:10000` a
   few times. Each produces an access-log line in Envoy's output. That's step 6 of the lifecycle
   you learned.

2. **Break the backend, see Envoy's honesty.** Stop just the backend:
   `docker compose stop backend`, then `curl -v localhost:10000`. Envoy responds **503** with a
   header `x-envoy-upstream-service-time` absent and a body like `no healthy upstream` — Envoy is
   up, but it has nowhere to route. Restart it: `docker compose start backend`.

3. **Add a second route.** In `envoy.yaml`, add a more specific route *above* the `prefix: "/"`
   route that answers directly without touching the backend. Edit the whole `routes:` block so it
   reads exactly like this — the two new lines must line up with the existing route:
   ```yaml
              routes:
              - match: { prefix: "/healthz" }
                direct_response: { status: 200, body: { inline_string: "ok\n" } }
              - match: { prefix: "/" }
                route: { cluster: echo_service }
   ```
   Two things matter, or Envoy won't start:
   - **Indentation:** each route is a list item beginning with `- ` at the *same* column; `match`
     and its partner key (`direct_response` or `route`) sit two spaces further in, aligned under
     each other.
   - **One key per line:** `match:` and `direct_response:` are separate keys — never put them on the
     same line. (Pasting them onto one line causes `yaml-cpp: error ... end of map not found`.)

   Restart (`Ctrl-C`, then `docker compose up` again) and `curl localhost:10000/healthz` → `ok`,
   while `curl localhost:10000/` still hits the backend. **Route order matters** — Envoy uses the
   first match, so specific routes go above the catch-all.

4. **See the whole running config.** `curl -s localhost:9901/config_dump | less`. This is the
   *effective* config Envoy is running — invaluable for debugging (Module 10). Notice it's the
   same objects you wrote, expanded with defaults.

## What you now understand

You have run Envoy, traced a request through a listener → HCM → route → cluster → endpoint, met
the admin interface, and seen route ordering and the 503-on-no-backend behavior. Every later
module adds capability to *these same objects*.

## Check yourself

1. Which section says "accept traffic on port 10000"? *(the listener's `address`.)*
2. Where does the decision "send `/` to `echo_service`" live? *(the route config inside the HCM.)*
3. Why must the router be the last HTTP filter? *(it forwards upstream; filters before it get to
   act first.)*
4. What did `type: STRICT_DNS` do? *(resolve the backend hostname via DNS to get endpoints.)*
5. If two routes both match a request, which wins? *(the first one listed — order matters.)*

---

**Next:** [03 — Listeners, filter chains & TLS →](./03-listeners-filter-chains-tls.md)
