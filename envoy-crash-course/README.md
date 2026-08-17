# Envoy Crash Course — from zero to service mesh

A hands-on course to understand **Envoy Proxy** from scratch. It starts with the raw
fundamentals (what Envoy is, how a request flows through it, static config you run yourself),
then builds up to how Envoy is used in the real world (Kubernetes gateways and service meshes).

Every module pairs **concepts** with **real, annotated Envoy config** and **runnable labs** you
execute with Docker and `curl`, so you actually watch Envoy proxy traffic instead of just
reading about it.

---

## Who this is for

You have used a terminal and know roughly what an HTTP request is (a client asks a server for
something over a network). You do **not** need to know Envoy, proxies, Go, or Kubernetes; each
idea is introduced before it is used. Some later modules touch Kubernetes; those explain the
minimum you need as you go.

## What you need installed

- **Docker** (Desktop or Engine): the only hard requirement for the standalone modules
  (0–7). Check with `docker --version`.
- **curl**: almost certainly already on your machine (`curl --version`).
- For the platform modules (8–9): **kind** (Kubernetes-in-Docker) and **kubectl**. Install
  instructions are in those modules; you can read them without installing if you prefer.

> **Version note.** Labs use the Docker image `envoyproxy/envoy:v1.38-latest` (Envoy's current
> stable line as of this writing) and Envoy's **v3 configuration API**, which is the stable,
> long-lived config format. If a newer stable minor exists when you read this, you can bump the
> tag (e.g. `v1.39-latest`); the v3 config in these labs is unchanged. Pin a tag in real
> deployments; never run `:latest` unpinned in production.

## How to work through it

Read the modules in order; each builds on the last. Do the labs; they are short (a few
commands each) and are where the understanding actually sticks. Every lab is **self-contained
and safe**: it runs local containers on high ports and cleans up at the end. Nothing touches
your system config.

## The modules

| # | Module | What you learn | Lab? |
|---|--------|----------------|------|
| 00 | [What Envoy is (and why it exists)](./web/00-what-is-envoy.md) | The mental model: an L7 proxy / "universal data plane"; where it's used; Envoy vs nginx/HAProxy | — |
| 01 | [Architecture & the request lifecycle](./web/01-architecture-and-request-lifecycle.md) | The core objects (listener → filters → router → cluster → endpoint) and how one request flows through them; the threading model | — |
| 02 | [Lab: your first Envoy (static config)](./web/02-lab-first-static-config.md) | Run Envoy in Docker with a minimal static config and proxy a real request, line by line | ✅ |
| 03 | [Listeners, filter chains & TLS](./web/03-listeners-filter-chains-tls.md) | Listeners in depth; TCP vs HTTP; filter-chain matching (SNI); terminating TLS | ✅ |
| 04 | [HTTP routing & filters](./web/04-http-routing-and-filters.md) | The HTTP Connection Manager; virtual hosts & route matching; header manipulation, redirects, CORS, fault injection, ext_authz | ✅ |
| 4b | [Rate limiting & ext_authz](./web/11-rate-limiting-ext-authz.md) | Local vs global rate limiting, token buckets, descriptors; ext_authz as the enforcement point for edge authentication | — |
| 05 | [Clusters, load balancing & resilience](./web/05-clusters-load-balancing-resilience.md) | Service discovery, load-balancing policies, health checks, timeouts, retries, circuit breakers, outlier detection | ✅ |
| 06 | [Observability & the admin interface](./web/06-observability-and-admin.md) | The admin endpoint, stats/Prometheus metrics, access logs, distributed tracing | ✅ |
| 07 | [Dynamic config & xDS](./web/07-dynamic-config-xds.md) | Static vs dynamic; the xDS APIs (LDS/RDS/CDS/EDS/SDS/ADS); control planes; hot-reload with zero drops | ✅ |
| 08 | [Envoy on Kubernetes (Gateway API)](./web/08-envoy-on-kubernetes.md) | How Envoy runs as an ingress/gateway; Envoy Gateway + the Kubernetes Gateway API | ✅ |
| 09 | [Envoy as a service-mesh sidecar (Istio)](./web/09-service-mesh-sidecars.md) | The sidecar pattern; mTLS between proxies; how Istio programs Envoy via xDS; reading the generated config | ✅ |
| 10 | [Debugging, gotchas & where to go next](./web/10-debugging-gotchas-next-steps.md) | The debugging toolkit, common mistakes, and a curated path onward | — |

## The one-sentence summary you'll understand by the end

> Envoy is a programmable L7 proxy whose entire behavior is described by config: **listeners**
> accept connections, **filter chains** process the bytes/requests, and the **router** sends each
> request to a **cluster** of backend **endpoints**; and that config can be delivered statically
> from a file or dynamically from a control plane over **xDS**, which is exactly how service
> meshes and gateways drive fleets of Envoys.

---

*Start with [Module 00 →](./web/00-what-is-envoy.md)*
