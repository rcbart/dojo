# 6 — Security: mTLS & authorization

*The reason many teams adopt Istio: encryption and access control between services, with no app
changes. Concepts + a lab. ~25 min. Uses Bookinfo.*

---

Istio security has two layers, and they answer different questions:

- **Authentication (mTLS)**: "**is this connection encrypted, and who is the caller?**" Handled by
  mutual TLS between proxies, using the identities istiod's CA issued.
- **Authorization (AuthorizationPolicy)**: "**is this caller *allowed* to do this?**" Allow/deny
  rules based on identity, namespace, path, and method.

Encrypt first (mTLS), then decide who may do what (authz).

## mTLS — automatic mutual encryption

"Mutual TLS" means **both** ends present a certificate and verify the other. Regular HTTPS only
authenticates the server; mTLS authenticates the client too. In Istio, every workload already has a
SPIFFE identity cert (Module 1), so the sidecars can do mTLS **automatically**: you turn it on with
policy, no certs to manage.

### PERMISSIVE vs STRICT

By default Istio uses **PERMISSIVE** mode: a proxy accepts *both* mTLS and plain traffic. This lets
you adopt Istio gradually without breaking not-yet-meshed clients. Once everything is in the mesh,
switch to **STRICT**, and plaintext is rejected.

```yaml
apiVersion: security.istio.io/v1
kind: PeerAuthentication
metadata:
  name: default
  namespace: default            # scope: this whole namespace
spec:
  mtls:
    mode: STRICT                # require mTLS; reject any plaintext
```

Scope options: **mesh-wide** (put it in `istio-system` named `default`), **per-namespace** (as
above), or **per-workload** (add a `selector`). Narrow scopes override broader ones.

## AuthorizationPolicy — who may call whom

Once you know *who* the caller is (via mTLS identity), you can allow/deny. Default with no policy:
everything is allowed. Add an **ALLOW** policy and only listed traffic is permitted to that
workload; add a **DENY** policy to block specific traffic.

```yaml
apiVersion: security.istio.io/v1
kind: AuthorizationPolicy
metadata:
  name: reviews-viewer
  namespace: default
spec:
  selector:
    matchLabels: { app: reviews }        # this policy protects the reviews workload
  action: ALLOW
  rules:
  - from:
    - source:
        principals: ["cluster.local/ns/default/sa/bookinfo-productpage"]  # only productpage's identity
    to:
    - operation:
        methods: ["GET"]                  # may only GET
```

`principals` are SPIFFE identities (tied to Kubernetes ServiceAccounts). You can also match by
`namespaces`, `ipBlocks`, request `paths`, `methods`, and even JWT claims. This is **identity-based**
access control, far stronger than IP allowlists, because identity is cryptographically proven by
mTLS.

## Lab: enforce mTLS, then lock down access

### Step 1 — turn on STRICT mTLS for the namespace

```bash
kubectl apply -f - <<'EOF'
apiVersion: security.istio.io/v1
kind: PeerAuthentication
metadata: { name: default, namespace: default }
spec:
  mtls: { mode: STRICT }
EOF
```

Bookinfo still works (all its pods are meshed, so they speak mTLS). Prove plaintext is now rejected
by calling a service from a **non-mesh** pod:

```bash
kubectl create ns nomesh
kubectl -n nomesh run curl --image=curlimages/curl -it --rm --restart=Never -- \
  curl -sS http://productpage.default:9080/productpage
# → connection reset / failure: plaintext is refused under STRICT
kubectl delete ns nomesh
```

### Step 2 — verify traffic is actually encrypted

```bash
# Kiali shows a padlock on mTLS edges; from the CLI, check the mode Istio computed:
istioctl proxy-config secret "$(kubectl get pod -l app=productpage -o jsonpath='{.items[0].metadata.name}')" | head
```

### Step 3 — add an authorization policy

Deny everything to `reviews`, then allow only `productpage`:

```bash
# 1) default-deny for reviews (empty ALLOW rules = allow nothing)
kubectl apply -f - <<'EOF'
apiVersion: security.istio.io/v1
kind: AuthorizationPolicy
metadata: { name: reviews-deny-all, namespace: default }
spec:
  selector: { matchLabels: { app: reviews } }
  action: ALLOW
  rules: []
EOF
```

Reload the page: the **reviews box now errors** (nothing is allowed to call reviews). Now permit
productpage:

```bash
kubectl apply -f - <<'EOF'
apiVersion: security.istio.io/v1
kind: AuthorizationPolicy
metadata: { name: reviews-allow-productpage, namespace: default }
spec:
  selector: { matchLabels: { app: reviews } }
  action: ALLOW
  rules:
  - from:
    - source: { principals: ["cluster.local/ns/default/sa/bookinfo-productpage"] }
EOF
```

Reload: reviews work again, but **only** because the request comes from productpage's proven
identity. You've enforced least-privilege service-to-service access with no code changes.

### Clean up the policies

```bash
kubectl delete authorizationpolicy reviews-deny-all reviews-allow-productpage -n default
kubectl delete peerauthentication default -n default    # back to PERMISSIVE default
```

## Check yourself

1. What does the "mutual" in mTLS add over normal HTTPS? *(Both ends present and verify certs; the
   client is authenticated too, not just the server.)*
2. PERMISSIVE vs STRICT mode? *(PERMISSIVE accepts both mTLS and plaintext for gradual adoption;
   STRICT rejects plaintext.)*
3. What identity does an AuthorizationPolicy match on? *(SPIFFE principals tied to Kubernetes
   ServiceAccounts, cryptographically proven by mTLS.)*
4. With no AuthorizationPolicy on a workload, what's allowed? *(Everything; policies are additive,
   so add ALLOW to restrict.)*
5. Why is identity-based authz stronger than IP allowlists? *(Identity is cryptographically proven
   by mTLS and doesn't change with pod IPs.)*

---

**Next:** [6b — Request authentication: JWTs at the mesh →](./12-request-auth-jwt.md)
