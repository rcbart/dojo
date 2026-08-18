# 2: Lab: install & inspect the mesh

*Hands-on. You'll confirm Istio is running, see a sidecar get injected, and use `istioctl` to look
at the Envoy config istiod generated. ~20 min. Assumes you finished the Setup page.*

If you completed **Setup**, your cluster already has Istio and Bookinfo. This lab is about *seeing*
the machinery you read about in Module 1. If you deleted the cluster, redo Setup Steps 2–6 first.

---

## 1. Confirm the control plane is healthy

```bash
kubectl get pods -n istio-system           # istiod + gateways Running
istioctl version                           # client + control-plane versions match
istioctl x precheck                         # sanity checks the install
```

## 2. See sidecar injection happen live

Injection is a namespace label. Watch it work on a fresh pod:

```bash
# a namespace WITHOUT the label — no sidecar
kubectl create namespace nomesh
kubectl -n nomesh run demo --image=nginx --restart=Never
kubectl -n nomesh get pod demo             # READY 1/1  — no sidecar

# the default namespace HAS the label (from Setup) — sidecar injected
kubectl -n default run demo --image=nginx --restart=Never
kubectl -n default get pod demo            # READY 2/2  — app + istio-proxy
```

The difference (`1/1` vs `2/2`) is the injector webhook adding an Envoy container. Prove it:

```bash
kubectl -n default get pod demo -o jsonpath='{.spec.containers[*].name}'
# → demo istio-proxy
```

Clean up the demos:

```bash
kubectl -n default delete pod demo; kubectl delete namespace nomesh
```

## 3. List the proxies istiod is managing

```bash
istioctl proxy-status
# one line per proxy (each Bookinfo pod + the gateways), showing sync state SYNCED
```

`SYNCED` means the proxy has the latest config istiod pushed. Anything stuck in `STALE`/`NOT SENT`
is a red flag (Module 10).

## 4. Look at the Envoy config istiod generated

You wrote no Envoy config; istiod did. Inspect what a sidecar actually received. Pick the
`productpage` pod:

```bash
PP=$(kubectl get pod -l app=productpage -o jsonpath='{.items[0].metadata.name}')

istioctl proxy-config listeners $PP        # the ports this proxy handles
istioctl proxy-config routes    $PP        # HTTP route rules
istioctl proxy-config clusters  $PP        # upstream services it knows about
istioctl proxy-config endpoints $PP        # the actual pod IPs behind each service
```

Everything you learned in the Envoy course (listeners → routes → clusters → endpoints) is here,
except **you never wrote it**. istiod discovered every service in the cluster and generated it.
Notice clusters for `reviews`, `details`, `ratings`, etc., each with real endpoint IPs.

## 5. See the mTLS certificate a workload was issued

istiod's built-in CA gave each workload an identity:

```bash
istioctl proxy-config secret $PP           # lists the workload's certs
# The identity is a SPIFFE URI like spiffe://cluster.local/ns/default/sa/bookinfo-productpage
```

That SPIFFE identity is what mTLS and AuthorizationPolicy (Module 6) use to know *who* a caller is.

## 6. Generate traffic and watch a proxy's stats

Send some requests, then read the sidecar's own metrics (same admin interface as raw Envoy, port
15000 inside the pod):

```bash
# drive traffic
for i in $(seq 1 20); do
  kubectl exec "$(kubectl get pod -l app=ratings -o jsonpath='{.items[0].metadata.name}')" \
    -c ratings -- curl -s productpage:9080/productpage >/dev/null; done

# read the productpage sidecar's request counters
kubectl exec $PP -c istio-proxy -- curl -s localhost:15000/stats | grep -E "reviews.*upstream_rq_total"
```

You're looking at the exact Envoy stats from the Envoy course, now auto-generated inside a mesh.

## Experiments

1. **Break injection ordering.** Deploy an app to a namespace *before* labelling it, note `1/1`,
   then label it and `kubectl rollout restart` the deployment: it comes back `2/2`. Injection
   happens at pod *creation*, so existing pods must be recreated.
2. **Diff two proxies.** Run `istioctl proxy-config clusters` for `productpage` vs `ratings`. They
   differ, because each proxy only gets the config relevant to its workload, computed by istiod.
3. **Trigger `analyze`.** Run `istioctl analyze -n default`: it scans your config for problems and
   prints warnings. You'll use this constantly (Module 10).

## Check yourself

1. What single thing controls whether a pod gets a sidecar? *(The namespace's
   `istio-injection=enabled` label, applied before the pod is created.)*
2. What does `2/2` vs `1/1` tell you? *(Two containers (app + injected istio-proxy) vs no
   sidecar.)*
3. What does `istioctl proxy-status` show? *(Each proxy and whether it's SYNCED with istiod's latest
   config.)*
4. Who wrote the listeners/routes/clusters you saw with `istioctl proxy-config`? *(istiod generated
   them from discovered services; you didn't.)*
5. What identity format does each workload get? *(A SPIFFE URI, e.g.
   spiffe://cluster.local/ns/default/sa/…, used for mTLS and authz.)*

---

**Next:** [3: Ingress: Gateway & VirtualService →](./03-traffic-gateway-virtualservice.md)
