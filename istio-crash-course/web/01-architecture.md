# 1 — Architecture: istiod + the proxies

*No lab; this is the map. Once you can trace how your YAML becomes proxy behavior, every later
module reads itself. ~15 min.*

---

## The whole architecture in one picture

```
   YOU  ──apply──►  Kubernetes API  ◄──watches──  ┌───────────────┐
   (VirtualService,                                │    istiod      │  ← the control plane (brain)
    DestinationRule,                               │  (config + CA  │
    PeerAuthentication…)                           │  + injector)   │
                                                   └──────┬────────┘
                                                          │ xDS (streams config + certs)
                        ┌─────────────────────────────────┼───────────────────────┐
                        ▼                                  ▼                        ▼
                  [ Envoy sidecar ]                 [ Envoy sidecar ]        [ ingress gateway ]
                    next to app A                     next to app B            (Envoy at the edge)
                        │                                  ▲
                        └────────── encrypted mTLS ────────┘   ← the data plane (muscle)
```

You apply Istio objects to Kubernetes. **istiod** watches them, computes the right Envoy
configuration, and streams it (plus TLS certificates) to every proxy over **xDS**. The proxies,
the **data plane**, carry the actual traffic.

## istiod — the control plane, up close

`istiod` is a single component that bundles three jobs (they used to be separate: Pilot, Citadel,
Galley):

- **Configuration (Pilot).** Watches the Kubernetes API for your Istio objects *and* for services
  and pods coming/going. It converts all of that into Envoy config and pushes updates to every
  proxy via **xDS**: live, no restarts. This is the bulk of what istiod does.
- **Certificate Authority (Citadel).** Issues each workload a cryptographic **identity** as an
  X.509 certificate (using the **SPIFFE** standard), and rotates these certs automatically. This is
  what makes automatic **mTLS** possible: every proxy has a verifiable identity.
- **Sidecar injection (webhook).** A Kubernetes "mutating admission webhook": when a pod is created
  in an injection-enabled namespace, istiod automatically edits the pod spec to add the Envoy
  sidecar container. That's why your pods came up as `2/2`.

One process, three hats. In production you run a few replicas of it for high availability.

## The data plane — Envoy, in two roles

Same Envoy binary, two placements:

- **Sidecar proxy**: one Envoy per pod, intercepting that pod's traffic (sidecar mode).
- **Gateway proxy**: standalone Envoys at the mesh edge (the **ingress gateway** for traffic
  coming in, **egress gateway** for traffic going out).

Both are just Envoy, configured entirely by istiod. You never write their config directly.

## How a sidecar hijacks your app's traffic (the clever bit)

Your application code makes a normal network call; it has no idea Istio exists. So how does the
traffic reach the sidecar? When the sidecar is injected, an **init container** programs the pod's
**iptables** rules so that:

- every packet **leaving** the app is transparently redirected into the local Envoy (commonly port
  `15001`),
- every packet **arriving** at the pod is redirected into Envoy first (port `15006`),

Envoy then applies mTLS, routing, and policy, and forwards on. The app thinks it's talking directly
to the other service; really every byte detours through its sidecar. This "transparent
interception" is why **no code changes** are needed.

## How one request flows through the mesh

Follow `productpage` calling `reviews`:

1. productpage's app makes a plain call to `reviews:9080`.
2. **Its sidecar intercepts the outbound request** (iptables), looks up istiod-provided routing
   (VirtualService/DestinationRule), picks a healthy `reviews` endpoint and version, and opens an
   **mTLS** connection to that pod's sidecar.
3. **The reviews sidecar receives it**, verifies the caller's identity, checks any
   **AuthorizationPolicy**, decrypts, and hands the plain request to the reviews app.
4. The response returns the same way; **both sidecars record metrics/traces** for the hop.

Every call in the mesh is really *sidecar-to-sidecar*, encrypted, observed, and policy-checked,
with your apps none the wiser.

## Ambient mode architecture (preview)

In ambient mode the picture changes: instead of a sidecar per pod, a per-node **ztunnel** handles
mTLS + L4 for all local pods, and an Envoy **waypoint** is deployed per-namespace/service for L7.
istiod still programs everything over xDS; only *where the proxies live* differs. Full detail in
Module 8.

## The Istio object model (what you'll actually write)

All Istio config is **Kubernetes Custom Resources** (CRDs): YAML you `kubectl apply`. The families:

| Object | Purpose | Module |
|--------|---------|--------|
| **Gateway** | Configure an edge proxy: ports, hosts, TLS (the front door) | 3 |
| **VirtualService** | Routing rules: match → destination, splits, rewrites, retries, faults | 3–5 |
| **DestinationRule** | Post-routing policy: subsets (versions), load balancing, pooling, outlier detection | 4–5 |
| **PeerAuthentication** | mTLS mode (STRICT/PERMISSIVE) for workloads | 6 |
| **AuthorizationPolicy** | Who may call whom (allow/deny by identity, path, method) | 6 |
| **Telemetry** | Tune metrics/traces/logging | 7 |
| **Sidecar / WorkloadEntry / ServiceEntry** | Scope proxies, add non-K8s or external endpoints | later reading |

You'll meet the top five constantly. Everything else is refinement.

## Check yourself

1. What are istiod's three jobs? *(Config/xDS push, certificate authority (identity/mTLS), and
   sidecar injection webhook.)*
2. How does an app's traffic get to its sidecar without code changes? *(An init container sets
   iptables rules that transparently redirect in/outbound traffic into Envoy.)*
3. What does istiod stream to the proxies, and over what? *(Envoy config and certificates, over
   xDS.)*
4. In the mesh, a call from A to B is really between what? *(A's sidecar and B's sidecar, encrypted
   and policy-checked.)*
5. What form do all Istio config objects take? *(Kubernetes Custom Resources: YAML you apply, like
   VirtualService and DestinationRule.)*

---

**Next:** [2 — Lab: install & inspect the mesh →](./02-lab-install-and-inject.md)
