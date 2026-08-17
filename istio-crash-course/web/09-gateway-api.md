# 9 — The Kubernetes Gateway API

*The modern, portable way to configure ingress, and increasingly the recommended one. Concepts +
a lab. ~20 min.*

---

Istio has two ways to configure traffic entering the mesh:

1. **Istio's own API**: the `Gateway` + `VirtualService` you learned in Module 3. Istio-specific,
   very feature-rich.
2. **The Kubernetes Gateway API**: a *standard*, cross-vendor set of resources that Istio (and
   Envoy Gateway, Contour, Cilium, etc.) all implement. Same YAML works across implementations.

The Gateway API is the CNCF-standard successor to the old `Ingress` resource, and Istio fully
supports it. For new setups it's often the recommended path because it's portable and cleanly
splits responsibilities between teams.

## The resources (and who owns them)

| Resource | Owned by | Means |
|----------|----------|-------|
| **GatewayClass** | platform/infra | Which controller implements gateways (Istio installs one) |
| **Gateway** | platform team | An entry point: listeners, ports, protocols, TLS |
| **HTTPRoute** | app teams | Routing rules: match paths/headers → backend Services |

Note the clean split: infra owns the **Gateway** (the door), app teams own their **HTTPRoute** (their
routes). That split is the main reason the standard was designed this way.

> **Careful: same word, two meanings.** Istio's `Gateway` (networking.istio.io) and the Gateway
> API's `Gateway` (gateway.networking.k8s.io) are *different resources*. This module means the
> Kubernetes **Gateway API** one.

## The same Bookinfo ingress, in Gateway API

Compare to Module 3. A **Gateway** opens the door:

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: bookinfo-gateway
spec:
  gatewayClassName: istio           # Istio implements this Gateway
  listeners:
  - name: http
    port: 80
    protocol: HTTP
    allowedRoutes:
      namespaces: { from: Same }
```

An **HTTPRoute** provides the rules (this replaces the VirtualService for ingress):

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: bookinfo
spec:
  parentRefs:
  - name: bookinfo-gateway          # attach to the Gateway above
  rules:
  - matches:
    - path: { type: Exact, value: /productpage }
    - path: { type: PathPrefix, value: /static }
    - path: { type: Exact, value: /login }
    - path: { type: PathPrefix, value: /api/v1/products }
    backendRefs:
    - name: productpage
      port: 9080
```

## Lab: expose Bookinfo via the Gateway API

The Gateway API CRDs may need installing first (Istio's docs command):

```bash
kubectl get crd gateways.gateway.networking.k8s.io >/dev/null 2>&1 || \
  kubectl apply -f "https://github.com/kubernetes-sigs/gateway-api/releases/download/v1.2.0/standard-install.yaml"
```

Apply the bundled sample (Istio ships it):

```bash
kubectl apply -f samples/bookinfo/gateway-api/bookinfo-gateway.yaml
kubectl get gateway bookinfo-gateway          # wait for PROGRAMMED=True
```

Istio auto-provisions an Envoy for this Gateway. Reach it (port-forward the generated service, whose
name matches the Gateway):

```bash
kubectl port-forward svc/bookinfo-gateway-istio 8080:80
curl -s http://localhost:8080/productpage | grep -o "<title>.*</title>"
# → <title>Simple Bookstore App</title>
```

Same result as Module 3, via a different, portable API.

### Traffic splitting with Gateway API

Weighted canaries work here too, via `backendRefs` weights:

```yaml
rules:
- backendRefs:
  - name: reviews-v1
    port: 9080
    weight: 90
  - name: reviews-v2
    port: 9080
    weight: 10
```

For advanced Istio-only features (fault injection, mirroring, some policies), you may still reach
for a VirtualService; Istio lets you mix both. But basic ingress and splits are fully covered by
the standard API.

## Which should you use?

- **Gateway API**: new projects, portability across meshes/gateways, clean team split. The
  recommended default going forward.
- **Istio Gateway + VirtualService**: when you need Istio's richer L7 features not yet in the
  standard, or you're maintaining existing config.

They interoperate, so it's not an all-or-nothing choice.

## Check yourself

1. What problem does the Gateway API solve that Istio's own API doesn't? *(Portability: a standard
   API implemented by many gateways/meshes, with a clean infra/app ownership split.)*
2. Which Gateway API resource do app teams write? *(HTTPRoute.)*
3. Istio `Gateway` vs Gateway API `Gateway`: same thing? *(No, they are different resources in different API
   groups that happen to share the name.)*
4. How do you do a weighted canary in an HTTPRoute? *(Multiple `backendRefs` with `weight` values.)*
5. When might you still use a VirtualService? *(For Istio-only L7 features like fault injection or
   mirroring not yet in the standard API.)*

---

**Next:** [10 — Debugging & next steps →](./10-debugging-gotchas.md)
