# 10 — Debugging, gotchas & next steps

*The field guide you'll come back to. Concept-only. ~15 min.*

---

You now know the whole model: istiod programs Envoy proxies (sidecar or ambient) from your
VirtualService/DestinationRule/PeerAuthentication/AuthorizationPolicy YAML, giving you traffic
control, mTLS, and observability. This module is the practical stuff that saves hours.

## The debugging toolkit — four commands

Almost every Istio problem is diagnosed with these:

- **`istioctl analyze`** — static analysis of your config across the namespace/cluster. Catches
  dangling references, conflicts, missing subsets, injection issues. **Run this first, always.**
- **`istioctl proxy-status`** — is every proxy **SYNCED** with istiod? `STALE`/`NOT SENT` means a
  push isn't landing (often a bad config istiod rejected).
- **`istioctl proxy-config <listeners|routes|clusters|endpoints|secret> <pod>`** — the *actual*
  Envoy config a proxy received. When traffic misbehaves, confirm the proxy really has the rule you
  think it does.
- **`kubectl logs <pod> -c istio-proxy`** — the sidecar's own logs, including access logs and
  `RESPONSE_FLAGS` (the same UH/UT/NR codes from the Envoy course).

Add **Kiali** (visual health/mTLS) and **`istioctl x describe pod <pod>`** (a plain-English summary
of how a pod is configured) and you can resolve the large majority of issues.

## The gotchas that bite everyone

- **Forgot to label the namespace / labelled it too late.** No sidecar = not in the mesh. Injection
  happens at pod **creation**; label the namespace *then* `kubectl rollout restart` existing
  deployments. Symptom: pod shows `1/1`.
- **DestinationRule subset missing.** A VirtualService routing to `subset: v2` with no matching
  DestinationRule subset produces **503s**. Define subsets before routing to them. `istioctl analyze`
  catches this.
- **Route order.** In a VirtualService, the **first matching** `http` rule wins — specific matches
  (headers, exact paths) must go **above** catch-alls. The #1 routing surprise.
- **mTLS mode mismatch.** Setting `STRICT` while a client (a non-mesh pod, a health checker, a
  Prometheus scrape) still speaks plaintext → connection failures. Roll out STRICT only once
  everything talking to the workload is meshed; use PERMISSIVE during migration.
- **AuthorizationPolicy "deny by accident."** An ALLOW policy with `rules: []` allows **nothing**.
  Adding your first ALLOW policy to a workload implicitly denies everything else to it — intended,
  but surprising.
- **`host` naming.** In VirtualService/DestinationRule, short names resolve in the resource's
  namespace; across namespaces use the FQDN (`reviews.default.svc.cluster.local`). Wrong host =
  traffic doesn't match.
- **Gateway selector.** An Istio `Gateway` must `selector` the right ingress proxy
  (`istio: ingressgateway`), or it configures nothing.
- **Two `Gateway` kinds.** Mixing up Istio's `Gateway` and the Gateway API `Gateway` (Module 9)
  leads to confusing "why isn't my config applied" moments — check the `apiVersion`.
- **Ambient: expecting L7 without a waypoint.** In ambient mode, HTTP-level rules need a waypoint;
  ztunnel alone only does L4/mTLS. No waypoint = your VirtualService split silently doesn't apply.

## A debugging method that works

1. **`istioctl analyze`** — fix anything it flags before going deeper.
2. **Is the workload in the mesh?** `2/2` (sidecar) or namespace ambient-labelled? `istioctl x describe pod`.
3. **Is the proxy synced?** `istioctl proxy-status` → SYNCED.
4. **Does the proxy have the rule?** `istioctl proxy-config routes/clusters <pod>` — verify the
   route/subset/endpoint actually exists there.
5. **What does the traffic say?** Sidecar access logs + `RESPONSE_FLAGS` (NR = no route, UH = no
   healthy upstream, etc.), and Kiali for a visual.

Ninety percent of issues fall out by step 4.

## Performance & production notes

- **Right-size the profile.** The `demo` profile is for learning; use `default` or a tuned profile
  in production, and set proxy resource requests/limits.
- **Trace sampling.** 100% sampling is fine in dev; lower it in prod (e.g. 1%) to control overhead.
- **Prefer ambient for large fleets** to cut per-pod proxy overhead; sidecar for maximal per-workload
  isolation.
- **Roll out mTLS STRICT gradually** (namespace by namespace) using PERMISSIVE as the bridge.
- **Keep VirtualServices lean** — prefer header/exact/prefix matches over heavy regex.

## Where to go next

- **Official docs & tasks** — <https://istio.io/latest/docs/> (the "Tasks" section is excellent,
  hands-on, and canonical).
- **Ambient docs** — <https://istio.io/latest/docs/ambient/> — deployment and migration guides.
- **Gateway API** — <https://gateway-api.sigs.k8s.io> — the portable ingress standard.
- **The Envoy course** — to understand what the proxies are actually doing under istiod's
  instructions, learn the data plane itself.
- **Practice ideas:** do a full canary rollout (0→100%) on Bookinfo; enforce mesh-wide STRICT mTLS
  plus per-service AuthorizationPolicies; migrate a namespace from sidecar to ambient; wire an
  external service in with a `ServiceEntry`.

## Course recap — the one-paragraph mental model

**Istio** is a service mesh: **istiod** (the control plane) watches your Kubernetes objects and
streams **Envoy** config + identity certs to a fleet of proxies (the data plane) over **xDS**. Those
proxies — a **sidecar** in every pod, or a per-node **ztunnel** plus **waypoint** in ambient mode —
carry every service-to-service call, giving you **traffic management** (Gateway/VirtualService/
DestinationRule: routing, canaries, retries, faults), **security** (automatic **mTLS** +
identity-based **AuthorizationPolicy**), and **observability** (metrics, traces, and Kiali's live
graph) — all declaratively, with no changes to your application code.

## Check yourself

1. First command to run when something's wrong? *(`istioctl analyze`.)*
2. A VirtualService routes to `subset: v2` but you get 503s. Likely cause? *(No matching
   DestinationRule subset defining v2.)*
3. You set mTLS STRICT and a scraper breaks. Why? *(Something still speaks plaintext; STRICT rejects
   it — migrate with PERMISSIVE first.)*
4. In ambient mode your weighted split doesn't apply. What's missing? *(A waypoint — L7 rules need
   one; ztunnel only does L4/mTLS.)*
5. Recite the mesh in one line. *(istiod programs Envoy proxies over xDS to carry all traffic,
   providing traffic management, mTLS security, and observability declaratively.)*

---

**You've finished the crash course.** Keep the Bookinfo cluster around — the fastest way to cement
any of this is to apply a VirtualService, reload the page, and watch what changes. Jump back to any
module from the sidebar, and use the search box to find a concept fast.
