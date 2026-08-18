# 12: Ingress & TLS

*HTTP routing from the outside world into your Services, with TLS. Concepts + a lab. ~30 min. Needs
your kind cluster.*

---

A `LoadBalancer` Service works but gives each app its own external IP/load balancer, which is expensive and
crude. **Ingress** is the smart HTTP(S) front door: **one** entry point that routes to many Services
by **hostname and path**, terminates **TLS**, and centralizes edge concerns. It's how real clusters
expose web apps.

## Two pieces: the controller and the resource

This trips people up. Ingress needs **both**:

- **Ingress controller**: the actual proxy that runs in the cluster and does the routing (e.g.
  **ingress-nginx**, Traefik, HAProxy, or a cloud one). *You must install one*; Kubernetes doesn't
  ship a default.
- **Ingress resource**: the YAML *rules* ("host `shop.example.com` path `/api` → the `api`
  Service"). The controller reads these and configures itself.

```
   internet ──► Ingress controller (a proxy) ──reads──► Ingress resources (rules)
                          │
             ┌────────────┼─────────────┐
             ▼            ▼              ▼
         api Service   web Service   admin Service   (ClusterIP, internal)
```

Behind the Ingress, your Services stay simple **ClusterIP**; the Ingress is the only thing exposed.

## An Ingress resource

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: shop
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /   # controller-specific tuning via annotations
spec:
  ingressClassName: nginx
  rules:
  - host: shop.local
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service: { name: api, port: { number: 80 } }
      - path: /
        pathType: Prefix
        backend:
          service: { name: web, port: { number: 80 } }
  tls:
  - hosts: ["shop.local"]
    secretName: shop-tls        # a TLS Secret holding the cert+key
```

- **`rules`** route by **host** and **path** to backend Services.
- **`tls`** terminates HTTPS using a cert stored in a **Secret**.
- **annotations** configure controller-specific behavior (rewrites, timeouts, auth).

## TLS and cert-manager

You put a cert+key in a `kubernetes.io/tls` Secret and reference it. Managing certs by hand is
painful, so production clusters run **cert-manager**, an add-on that **automatically obtains and
renews** certificates (e.g. free from Let's Encrypt) and writes them into the Secret the Ingress
uses. You annotate the Ingress and cert-manager does the rest.

## Lab: install a controller and route two apps

kind needs the ingress-nginx controller (and a small setup to expose it):

```bash
# 1. install the ingress-nginx controller (kind-specific manifest)
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml
kubectl wait --namespace ingress-nginx --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller --timeout=120s

# 2. two apps behind ClusterIP Services
kubectl create deployment web --image=nginxdemos/hello
kubectl create deployment api --image=hashicorp/http-echo -- /http-echo -text="hello from api" -listen=:80
kubectl expose deployment web --port=80
kubectl expose deployment api --port=80

# 3. one Ingress routing by path
cat <<'EOF' | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: demo
  annotations: { nginx.ingress.kubernetes.io/rewrite-target: / }
spec:
  ingressClassName: nginx
  rules:
  - http:
      paths:
      - { path: /api, pathType: Prefix, backend: { service: { name: api, port: { number: 80 } } } }
      - { path: /,    pathType: Prefix, backend: { service: { name: web, port: { number: 80 } } } }
EOF

# 4. test both paths through the SAME entry point
curl -s localhost/          | grep -o "Server.*" | head -1     # → web (hello demo)
curl -s localhost/api                                          # → hello from api
```

One front door, path-based routing to two Services: the Ingress pattern.

Clean up:

```bash
kubectl delete ingress demo; kubectl delete deploy web api; kubectl delete svc web api
```

## Ingress vs the Gateway API (heads-up)

Ingress is ubiquitous but limited (HTTP-centric, lots of controller-specific annotations). The newer
**Gateway API** (a standard set of resources: GatewayClass, Gateway, HTTPRoute) is its successor: more
expressive, role-oriented, and on the current CKA. Many controllers support both. Learn Ingress first
(everywhere today); know the Gateway API is where things are heading.

## Check yourself

1. What two things must exist for Ingress to work? *(An Ingress controller (the proxy) AND Ingress
   resources (the rules).)*
2. Why don't you get Ingress out of the box? *(Kubernetes ships no default controller; you install
   one, e.g. ingress-nginx.)*
3. What do the backing Services look like behind an Ingress? *(Simple ClusterIP; only the Ingress is
   exposed externally.)*
4. How does an Ingress route to different apps? *(By host and path rules to backend Services.)*
5. What does cert-manager do? *(Automatically obtains and renews TLS certs into the Secret the
   Ingress uses.)*

---

**Next:** [13: Autoscaling →](./13-autoscaling.md)
