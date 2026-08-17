# 5 — Resilience & fault injection

*Make the mesh survive failure, and deliberately cause failure to test it. Concepts + a lab. ~25
min. Uses Bookinfo.*

---

Distributed systems fail constantly: a service is slow, a pod dies mid-request, the network blips.
Istio lets you add resilience as configuration and, just as important, **inject faults on purpose**
to check your resilience actually works.

## Timeouts — don't wait forever

By default a request waits a long time for a slow backend, tying up resources. Cap it in the
VirtualService:

```yaml
http:
- route:
  - destination: { host: reviews, subset: v1 }
  timeout: 1s        # give up after 1 second, return an error to the caller
```

## Retries — paper over transient failures

Re-send a failed idempotent request to another instance before giving up:

```yaml
http:
- route:
  - destination: { host: reviews }
  retries:
    attempts: 3
    perTryTimeout: 500ms
    retryOn: 5xx,reset,connect-failure    # what counts as retryable
```

Retries + multiple healthy pods make a single transient failure invisible to the caller. (Careful:
retries multiply load; keep `attempts` modest and only retry idempotent calls.)

## Circuit breaking — stop hammering a sick service

Set in the **DestinationRule**. Two parts:

```yaml
spec:
  host: reviews
  trafficPolicy:
    connectionPool:                 # cap concurrency — the "breaker"
      tcp: { maxConnections: 1 }
      http: { http1MaxPendingRequests: 1, maxRequestsPerConnection: 1 }
    outlierDetection:               # eject unhealthy pods automatically
      consecutive5xxErrors: 3
      interval: 10s
      baseEjectionTime: 30s         # pull a bad pod out for 30s, then tentatively return it
```

- **`connectionPool`** limits how many concurrent requests/connections a destination gets. Exceed
  it and new requests fail fast (a 503) instead of piling up. That's the circuit "tripping."
- **`outlierDetection`** watches real responses and **ejects** a pod that returns repeated errors,
  routing around it: the same passive health checking from the Envoy course.

## Fault injection — break things on purpose

The clever inverse of resilience: make Istio *inject* delays or errors so you can verify callers
handle them. Set it in the VirtualService.

**Inject a delay** (test timeouts/retries):

```yaml
http:
- fault:
    delay:
      percentage: { value: 100 }
      fixedDelay: 7s          # add 7s to every matching request
  route:
  - destination: { host: ratings, subset: v1 }
```

**Inject an abort** (test error handling):

```yaml
http:
- fault:
    abort:
      percentage: { value: 50 }
      httpStatus: 500         # fail half the requests with 500
  route:
  - destination: { host: ratings, subset: v1 }
```

The backend never sees these; Istio's proxy fabricates the delay/error. This is chaos engineering
as config.

## Lab: inject a fault and watch it surface

Istio ships a fault example. With Bookinfo pinned to v1 (Module 4) and logged in as **jason**:

```bash
# route jason's reviews to v2, and inject a 7s delay into ratings for jason
kubectl apply -f samples/bookinfo/networking/virtual-service-ratings-test-delay.yaml
```

Now load <http://localhost:8080/productpage> as jason. The page is **slow and the reviews section
shows an error**, because `reviews:v2` has a hard-coded 10s timeout calling `ratings`, but a
*3-retry × 2s* budget elsewhere trips first. You just discovered a real timeout bug using fault
injection, exactly as the Istio tutorial intends.

Fix-test loop: add a `timeout` or adjust retries in the VirtualService, re-apply, reload, and watch
the behavior change, all without redeploying a single service.

### Experiment: abort injection

Apply an abort fault (500 at 50%) to `ratings` for jason (edit the delay sample's `fault` block to
use `abort`), reload repeatedly, and watch the reviews stars appear/disappear as half the ratings
calls fail, confirming how the UI degrades under partial failure.

## Reset

```bash
kubectl apply -f samples/bookinfo/networking/virtual-service-all-v1.yaml
```

## Check yourself

1. Where do you set a request timeout, VirtualService or DestinationRule? *(VirtualService.)*
2. What does `outlierDetection` do? *(Ejects a pod that returns repeated errors, routing around it:
   passive health checking.)*
3. What's the risk of aggressive retries? *(They multiply load; only retry idempotent calls, keep
   attempts modest.)*
4. What is fault injection for? *(Deliberately adding delays/errors to verify callers handle failure
   (chaos testing) without touching real services.)*
5. Does the backend see an injected fault? *(No; the proxy fabricates the delay/abort.)*

---

**Next:** [5b — Egress & ServiceEntry →](./11-egress-serviceentry.md)
