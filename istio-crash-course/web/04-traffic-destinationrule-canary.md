# 4 — DestinationRule & canary releases

*The payoff module: safely shifting traffic between versions. Concepts + a hands-on canary. ~25
min. Uses Bookinfo (which has three `reviews` versions).*

---

## VirtualService vs DestinationRule (the pairing to memorize)

They work as a team:

- **VirtualService = the "where."** Routing decisions: which service, which **subset** (version),
  what weights/splits, matches, rewrites.
- **DestinationRule = the "how."** Policy applied *after* a destination is chosen: load-balancing
  algorithm, connection pool limits, outlier detection — **and crucially, it defines the `subsets`**
  (named versions) that a VirtualService can route to.

> A VirtualService can't send traffic to "v2" until a DestinationRule has *defined* what "v2" means
> (which pods, by label). Define subsets in the DestinationRule; route to them in the
> VirtualService.

## Defining versions with subsets

Bookinfo's `reviews` pods are labelled `version: v1|v2|v3`. A DestinationRule turns those labels
into named subsets:

```yaml
apiVersion: networking.istio.io/v1
kind: DestinationRule
metadata:
  name: reviews
spec:
  host: reviews                 # the Service
  subsets:
  - name: v1
    labels: { version: v1 }     # subset v1 = pods labelled version=v1
  - name: v2
    labels: { version: v2 }
  - name: v3
    labels: { version: v3 }
```

Now "v2" is a thing a VirtualService can target.

## Lab: pin, split, then canary `reviews`

### Step 0 — apply the DestinationRules

```bash
kubectl apply -f samples/bookinfo/networking/destination-rule-all.yaml
```

### Step 1 — pin everyone to v1 (no more random stars)

```bash
kubectl apply -f samples/bookinfo/networking/virtual-service-all-v1.yaml
```

That file routes every service to its v1 subset. Refresh
<http://localhost:8080/productpage> (keep the port-forward from Module 3 running) — the reviews box
now **always** shows the v1 look (no stars), every time. You've taken control of versioning.

### Step 2 — a 50/50 canary split

Apply a VirtualService that weights `reviews` traffic between v1 and v3:

```bash
kubectl apply -f samples/bookinfo/networking/virtual-service-reviews-50-v3.yaml
```

The relevant part looks like:

```yaml
http:
- route:
  - destination: { host: reviews, subset: v1 }
    weight: 50
  - destination: { host: reviews, subset: v3 }
    weight: 50
```

Refresh the page repeatedly: about **half** the loads show v3 (red stars), half show v1 (none).
That's a **canary** — a controlled percentage on the new version. To roll out, you'd shift 50 → 90
→ 100; to abort, back to 0. Traffic percentage, not luck.

### Step 3 — route by identity (header-based)

Send only a specific user to v2 while everyone else stays on v1:

```bash
kubectl apply -f samples/bookinfo/networking/virtual-service-reviews-test-v2.yaml
```

That rule matches a header (`end-user: jason`) and routes only those requests to v2. Log into the
Bookinfo page as user **jason** (any password) and you'll see v2; log out and you're back on v1.
This is how you dark-launch a feature to internal users or a cohort before anyone else.

```yaml
http:
- match:
  - headers: { end-user: { exact: jason } }
  route:
  - destination: { host: reviews, subset: v2 }
- route:                                    # everyone else
  - destination: { host: reviews, subset: v1 }
```

## DestinationRule's other job: traffic policy

Beyond subsets, a DestinationRule sets *how* to talk to a destination:

```yaml
spec:
  host: reviews
  trafficPolicy:
    loadBalancer: { simple: LEAST_REQUEST }   # or ROUND_ROBIN, RANDOM, consistent-hash for affinity
    connectionPool:
      tcp: { maxConnections: 100 }
      http: { http2MaxRequests: 1000 }
  subsets: [ ... ]
```

Policy can be set for the whole host or per subset. Load-balancing and connection pools here are the
same primitives from the Envoy course — Istio just exposes them declaratively.

## Reset when done

```bash
kubectl apply -f samples/bookinfo/networking/virtual-service-all-v1.yaml   # back to all-v1
```

## Check yourself

1. What does the VirtualService decide vs the DestinationRule? *(VirtualService = where/which subset
   and weights; DestinationRule = how (LB, pools, outlier) and it defines the subsets.)*
2. Why must a DestinationRule exist before you route to "v2"? *(It defines subset v2 by label; the
   VirtualService can only target subsets that are defined.)*
3. How do you do a 50/50 canary? *(Two route destinations to different subsets, each with
   weight: 50.)*
4. How do you send only user jason to v2? *(A VirtualService match on the `end-user: jason` header
   routing to subset v2, with a default route for everyone else.)*
5. Name two things a DestinationRule `trafficPolicy` controls. *(Any of: load-balancer algorithm,
   connection-pool limits, outlier detection, TLS settings.)*

---

**Next:** [5 — Resilience & fault injection →](./05-resilience-fault-injection.md)
