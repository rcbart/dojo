# 3: Ingress: Gateway & VirtualService

*Concepts + a lab getting outside traffic into the mesh and routing it. ~25 min. Uses the Bookinfo
app from Setup.*

---

Two objects do most traffic work in Istio, and they answer two different questions:

- **Gateway**: "**let traffic in**." It configures an edge Envoy (the ingress gateway) to accept
  connections on a port/host/protocol. It's the front door, nothing more.
- **VirtualService**: "**where does this traffic go?**" The routing rules: match on host/path/
  headers and send to a service (optionally a specific version, with rewrites, splits, retries).

A Gateway without a VirtualService is an open door with no directions. You almost always use them
together.

## Gateway: the front door

```yaml
apiVersion: networking.istio.io/v1
kind: Gateway
metadata:
  name: bookinfo-gateway
spec:
  selector:
    istio: ingressgateway        # which edge proxy this configures (the one installed by Istio)
  servers:
  - port:
      number: 80
      name: http
      protocol: HTTP
    hosts:
    - "*"                        # accept any Host header (a real site lists its domains)
```

This says: on the ingress gateway, open port 80 for HTTP, for any host. It does **not** say where
requests go; that's the VirtualService's job.

## VirtualService: the routing rules

```yaml
apiVersion: networking.istio.io/v1
kind: VirtualService
metadata:
  name: bookinfo
spec:
  hosts:
  - "*"
  gateways:
  - bookinfo-gateway            # attach these rules to the Gateway above
  http:
  - match:                       # only these paths are exposed publicly
    - uri: { exact: /productpage }
    - uri: { prefix: /static }
    - uri: { exact: /login }
    - uri: { prefix: /api/v1/products }
    route:
    - destination:
        host: productpage        # the in-cluster Service to send matched traffic to
        port: { number: 9080 }
```

Key ideas:

- **`hosts`**: which incoming hostnames these rules apply to.
- **`gateways`**: bind to a Gateway (for ingress). Omit it / use `mesh` and the rules apply to
  *internal* service-to-service traffic instead; VirtualServices work east-west too, not just at
  the edge.
- **`http[].match`**: ordered rules on uri/headers/method/query. **First match wins** (same as raw
  Envoy).
- **`route[].destination.host`**: the target Kubernetes Service (and optionally a `subset` = a
  version; Module 4).

## Lab: expose Bookinfo to the outside

Istio ships these exact manifests. From inside your `istio-*` folder:

```bash
kubectl apply -f samples/bookinfo/networking/bookinfo-gateway.yaml
istioctl analyze                 # should report no problems
```

Find how to reach the ingress gateway. On kind, port-forward it:

```bash
# forward localhost:8080 to the ingress gateway's port 80
kubectl -n istio-system port-forward svc/istio-ingressgateway 8080:80
```

In another terminal:

```bash
curl -s "http://localhost:8080/productpage" | grep -o "<title>.*</title>"
# → <title>Simple Bookstore App</title>
```

You just reached an in-mesh app from outside, through the ingress gateway. Open
<http://localhost:8080/productpage> in a browser and refresh a few times, and note the **Book Reviews**
box sometimes shows stars, sometimes not: that's the three `reviews` versions being hit
round-robin. We'll take control of that in Module 4.

### Prove the routing is selective

The VirtualService only exposed specific paths. Try one it didn't:

```bash
curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:8080/"          # 404 — not matched
curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:8080/productpage" # 200 — matched
```

Only the paths you listed are reachable: the gateway is a controlled front door, not a wide-open
proxy.

### Experiments

1. **Add a path.** Edit the VirtualService to also expose `prefix: /api/v1/products` responses (it
   already is), then try changing a `prefix` to something wrong, re-apply, and watch that route 404.
2. **Host-based routing.** Change `hosts` to `bookinfo.local` and re-run curl with
   `-H "Host: bookinfo.local"`. Only requests with that Host now match, which is how one gateway serves many
   sites.
3. **`istioctl analyze` a mistake.** Point the VirtualService `gateways` at a name that doesn't
   exist, apply, and run `istioctl analyze`: it flags the dangling reference.

## Check yourself

1. What does a Gateway do vs a VirtualService? *(Gateway opens the edge door (port/host/protocol);
   VirtualService decides where matched traffic goes.)*
2. If two `http.match` rules both match, which wins? *(The first one listed.)*
3. How do you make a VirtualService apply to internal (east-west) traffic instead of the edge? *(Bind
   it to the `mesh` gateway / omit `gateways`, and set `hosts` to the internal service.)*
4. In the lab, why did `/` return 404 but `/productpage` return 200? *(Only listed paths were
   matched by the VirtualService; others aren't routed.)*
5. What tool checks your Istio config for problems? *(`istioctl analyze`.)*

---

**Next:** [4: DestinationRule & canary releases →](./04-traffic-destinationrule-canary.md)
