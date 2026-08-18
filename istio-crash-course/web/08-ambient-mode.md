# 8: Ambient mode (sidecarless)

*Istio's newer data-plane design: no sidecars. Concepts + a lab. ~25 min. Uses a **separate**
ambient install, so ideally a fresh kind cluster.*

---

You met the idea in the primer; now the detail. **Ambient mode** removes the per-pod Envoy sidecar
and splits the mesh's work into two layers so you pay for heavy L7 processing only where you need
it.

## The two layers

- **ztunnel** ("zero-trust tunnel"): a lightweight agent (written in **Rust**) running **once per
  node** as a DaemonSet. It handles the **secure L4 overlay**: transparent **mTLS**, identity, and
  basic TCP-level routing/telemetry for every pod on that node. It does **not** do L7 (HTTP) logic.
  Enabling it needs **no pod restarts**.
- **waypoint proxy**: a full **Envoy**, deployed **only where you need L7 features** (HTTP routing,
  traffic splitting, L7 authorization, retries). You add a waypoint per namespace or per service;
  namespaces that only need encryption never pay for one.

```
   pod  pod  pod   ← your apps, NO sidecars
     \   |   /
   [ ztunnel ]  (per node)  → mTLS + L4 for everyone, cheaply, no restarts
        │
   [ waypoint (Envoy) ]  (only where L7 rules are needed)
```

## Why it exists

Sidecars deliver all of that but cost a proxy's CPU/memory in **every** pod, add latency, and force a pod
restart on every Istio upgrade. Ambient:

- **Cuts resource cost**: one ztunnel per node instead of one Envoy per pod.
- **Adopts gradually**: label a namespace and get mTLS instantly, with no restarts; add L7 only
  when a workload needs it.
- **Simplifies upgrades**: updating the data plane doesn't churn your app pods.

The trade-off is a more layered architecture (two components instead of one), but for large fleets
the savings are substantial. It's production-ready and increasingly the default choice for new
adoptions.

## The layers map to L4 vs L7

This is the key mental model:

- Need **encryption + identity + basic allow/deny at L4**? → **ztunnel alone** is enough.
- Need **HTTP routing, weighted canaries, L7 authz, retries**? → add a **waypoint** for that
  namespace/service.

Your Istio objects (VirtualService/DestinationRule/AuthorizationPolicy) still work: L7 ones are
enforced by the waypoint, L4 ones by ztunnel.

## Lab: run a namespace in ambient mode

> Best on a fresh cluster to avoid mixing with your sidecar install:
> `kind delete cluster --name istio-lab && kind create cluster --name istio-lab`.

### 1. Install Istio with the ambient profile

```bash
istioctl install --set profile=ambient -y
kubectl get pods -n istio-system        # istiod + ztunnel (DaemonSet) + istio-cni
```

Note **ztunnel** running as a DaemonSet (one per node); there are no per-pod proxies.

### 2. Deploy an app and add it to the mesh with a label (no restart)

```bash
kubectl apply -f samples/bookinfo/platform/kube/bookinfo.yaml
kubectl get pods                        # note: 1/1 — NO sidecar container!

# enroll the whole namespace into ambient — instant mTLS, no restart
kubectl label namespace default istio.io/dataplane-mode=ambient
```

Pods stay **1/1** (there's no sidecar), yet traffic between them is now **encrypted by ztunnel**.
That's the headline: mesh security with zero sidecars and zero restarts.

### 3. Prove L4 is working

```bash
kubectl exec "$(kubectl get pod -l app=ratings -o jsonpath='{.items[0].metadata.name}')" \
  -- curl -s productpage:9080/productpage | grep -o "<title>.*</title>"
# works, and the ratings→productpage hop is mTLS via ztunnel
```

### 4. Add a waypoint for L7 features

Suppose you want weighted routing (a canary) on `reviews`. That's L7, so the namespace needs a
waypoint:

```bash
istioctl waypoint apply --namespace default --enroll-namespace
kubectl get pods                        # a waypoint (Envoy) pod appears for the namespace
```

Now L7 rules like a VirtualService weighted split (Module 4) are enforced by the waypoint. Apply a
DestinationRule + a 50/50 VirtualService for `reviews` and it behaves exactly as in sidecar mode,
but only this namespace runs an Envoy, and only because it opted into L7.

### Clean up

```bash
kind delete cluster --name istio-lab
```

## Sidecar vs ambient: when to pick which

- **Sidecar**: simplest mental model, per-pod isolation, most mature. Good default for small/medium
  meshes and when you want full L7 everywhere.
- **Ambient**: lower cost at scale, gradual adoption, painless upgrades. Increasingly preferred for
  large fleets and mixed workloads.

Either way the **concepts are identical**: you've already learned them; ambient just relocates the
proxies.

## Check yourself

1. What are ambient's two layers and their jobs? *(ztunnel is per-node, handling mTLS + L4; waypoint is an Envoy,
   per-namespace/service, for L7.)*
2. What happens to your pods' container count in ambient? *(They stay 1/1: no sidecar.)*
3. What do you get just by labelling a namespace `istio.io/dataplane-mode=ambient`? *(Automatic
   mTLS/L4 via ztunnel, with no pod restarts.)*
4. When do you need a waypoint? *(For L7 features: HTTP routing, weighted canaries, L7 authz,
   retries.)*
5. Do your VirtualService/AuthorizationPolicy objects still work in ambient? *(Yes; L7 ones are
   enforced by the waypoint, L4 by ztunnel.)*

---

**Next:** [9: The Kubernetes Gateway API →](./09-gateway-api.md)
