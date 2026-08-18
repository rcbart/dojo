# 07: Dynamic config with xDS

*The idea that makes Envoy a platform, not just a proxy. Concepts + a hot-reload lab. ~25 min.
Requires Docker.*

Lab files: [`labs/07-xds/`](../labs/07-xds/).

---

So far every config has been **static**: listeners and clusters written in the file, changed only
by editing and restarting. That's fine for a single edge proxy. But a fleet of hundreds of
sidecars, with pods appearing and disappearing every second, can't be managed by editing files by
hand. **xDS** is Envoy's answer.

## What xDS is

**xDS** = the "**x** Discovery Service" APIs: a family of APIs by which Envoy *fetches its
configuration from an external source at runtime* and updates **without restarting**. Each config
object type has its own discovery service:

| API | Discovers | "x" stands for |
|-----|-----------|----------------|
| **LDS** | Listeners | Listener |
| **RDS** | Routes (route configs) | Route |
| **CDS** | Clusters | Cluster |
| **EDS** | Endpoints (per cluster) | Endpoint |
| **SDS** | Secrets (TLS certs) | Secret |
| **ADS** | *All of the above over one stream, ordered* | Aggregated |

The thing serving these APIs is a **control plane** (Module 08/09): Istio, Gloo, Contour,
Kuma/Consul, or a custom one built on Envoy's `go-control-plane`. Envoy is the **data plane** that
subscribes; the control plane **pushes** updates. This split is the whole architecture from Module
00 made concrete.

### Where the config can come from

An xDS `ConfigSource` can be:

- **A gRPC stream** to a control plane (`api_config_source`/ADS): the real-world production path;
  the control plane streams updates as the world changes.
- **A watched file** (`path_config_source`): Envoy watches a file/dir and reloads on change. No
  control plane needed. This is what our lab uses, because it demonstrates the *dynamic* behavior
  with nothing but a text editor.

Both deliver the same typed resources; only the transport differs.

## The bootstrap

A dynamic Envoy still needs a tiny **bootstrap** config to start: its `node` identity, the `admin`
block, and, instead of `static_resources`, a **`dynamic_resources`** block pointing LDS and CDS
at their sources. See [`bootstrap.yaml`](../labs/07-xds/bootstrap.yaml):

```yaml
dynamic_resources:
  lds_config: { path_config_source: { path: /etc/envoy/lds.yaml, watched_directory: {...} } }
  cds_config: { path_config_source: { path: /etc/envoy/cds.yaml, watched_directory: {...} } }
```

The listeners live in [`lds.yaml`](../labs/07-xds/lds.yaml) and clusters in
[`cds.yaml`](../labs/07-xds/cds.yaml), each a `resources:` list of typed objects: exactly the same
Listener/Cluster shapes you've been writing, just delivered dynamically.

## Lab: change config with no restart

```bash
cd labs/07-xds && docker compose up   # first `docker compose down` the previous lab — labs share ports 10000/9901
```

Confirm it works like before:

```bash
curl -s localhost:10000            # hello from the backend  (via the dynamic cluster)
curl -s localhost:10000/version    # v1                      (a dynamic direct_response)
```

**Now edit `lds.yaml` on your host**: change the `/version` body from `v1` to `v2`, save. Within
a second or two, **without touching the container**:

```bash
curl -s localhost:10000/version    # v2   ← Envoy hot-reloaded the listener
```

Watch the Envoy logs during the save; you'll see it detect the change and add/warm the updated
listener. Confirm via the admin API that the config is live:

```bash
curl -s localhost:9901/config_dump | grep -A2 '"version"'   # dynamic resources with versions
curl -s localhost:9901/stats | grep -E "listener_manager\.(lds|listener_added|listener_modified)"
```

### Experiments

1. **Add a route live.** In `lds.yaml`, add a new `direct_response` route (e.g. `/health` → `ok`)
   *above* the catch-all, save, and curl it; it appears with no restart.
2. **Change a backend live.** Edit `cds.yaml` to point the cluster at a different address, save,
   watch `/clusters` update. This is EDS-by-hand, exactly what a control plane automates when pods
   move.
3. **Break it and recover.** Introduce a YAML typo in `lds.yaml`, save, and watch Envoy **reject
   the bad update and keep serving the last good config** (check the logs and
   `listener_manager.lds.update_rejected` stat). Graceful rejection is a key safety property of
   xDS; a bad push doesn't take you down.

## Why this matters

Everything in Modules 08–09 (Kubernetes ingress, service mesh) is *just a control plane feeding
xDS to Envoys*. Istio's `istiod` watches the Kubernetes API and streams LDS/RDS/CDS/EDS to every
sidecar. Once you've seen a file edit hot-reload a listener, you understand the mesh: replace "you
editing a file" with "a control plane reacting to the cluster state," and the mechanism is
identical.

## Check yourself

1. What does xDS let Envoy do that static config can't? *(Fetch/refresh config at runtime with no
   restart.)*
2. Match the API to what it discovers: LDS, CDS, EDS, RDS, SDS. *(Listeners, Clusters, Endpoints,
   Routes, Secrets.)*
3. What is ADS and why prefer it? *(Aggregated Discovery Service: all resources over one ordered
   stream, avoiding update races between separate streams.)*
4. Data plane vs control plane, concretely? *(Envoy subscribing to xDS = data plane; the thing
   serving xDS, e.g. istiod = control plane.)*
5. What happens when a control plane pushes an invalid config? *(Envoy rejects the update and keeps
   serving the last good config.)*

---

**Next:** [08: Envoy on Kubernetes →](./08-envoy-on-kubernetes.md)
