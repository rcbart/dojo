# 6b — Request authentication: JWTs at the mesh

*mTLS proved which SERVICE is calling. This module proves which USER the request is for — and locks the two together. ~11 min read.*

---

Module 6 gave every workload a certificate: **PeerAuthentication**, the *service* half of
identity. But "the frontend called the orders service" is only half a security story — *on whose
behalf?* That's the request's user, carried as a **JWT**, and Istio can verify it at the sidecar,
before your code runs. If you've worked through Identity Dojo's OAuth/OIDC streams, this module
is where that material gets enforced by infrastructure.

## RequestAuthentication: teach the sidecar to check tokens

```yaml
apiVersion: security.istio.io/v1
kind: RequestAuthentication
metadata: { name: orders-jwt, namespace: prod }
spec:
  selector: { matchLabels: { app: orders } }
  jwtRules:
  - issuer: "https://auth.example.com"
    jwksUri: "https://auth.example.com/.well-known/jwks.json"
    audiences: ["orders-api"]
```

The sidecar now validates any `Authorization: Bearer …` token on requests to `orders`: signature
against the issuer's published keys (**JWKS** — fetched and cached automatically, so key rotation
at the IdP just works), plus `iss`, `exp`, and `aud`. Identity Dojo taught why each check exists;
here they run in the proxy, identically, for every service you select — no library drift, no
service that forgot.

**The trap everyone hits:** RequestAuthentication alone does *not* require a token. It says "IF a
token is present, it must be valid." A request with **no token at all sails through** — validated
tokens produce identity, absent tokens produce nothing, and nothing isn't rejected. Requiring a
token is an *authorization* decision, and that's deliberate: validation (is it real?) and policy
(is it required, and for what?) are different questions with different owners.

## Closing the gap: AuthorizationPolicy on request principals

```yaml
apiVersion: security.istio.io/v1
kind: AuthorizationPolicy
metadata: { name: orders-require-jwt, namespace: prod }
spec:
  selector: { matchLabels: { app: orders } }
  action: ALLOW
  rules:
  - from:
    - source:
        requestPrincipals: ["https://auth.example.com/*"]   # a VALID token, from OUR issuer
```

`requestPrincipals` (`issuer/subject`) exists only when a token validated — so this rule is "no
valid token, no entry." From there, real policy is claim arithmetic:

```yaml
  rules:
  - from: [{ source: { requestPrincipals: ["https://auth.example.com/*"] } }]
    to:   [{ operation: { methods: ["DELETE"] } }]
    when: [{ key: request.auth.claims[scope], values: ["orders:admin"] }]
```

DELETEs require the `orders:admin` scope — enforced in the sidecar, before the app. And the
module 6 material composes with it: a rule can require `principals` (the mTLS *service* identity)
**and** `requestPrincipals` (the *user*) — "only the frontend may call orders, only with a valid
user token, and only admins may delete." Service identity from certificates, user identity from
tokens, one policy. That sentence is the whole zero-trust pitch, made concrete.

## Where to enforce: gateway, service, or both

- **At the ingress gateway** — reject bad and missing tokens at the front door, before they spend
  any internal capacity. Cheap, central, and the right first line.
- **At the service** — the zero-trust position: the orders service doesn't *trust* that the
  gateway checked; its own sidecar re-verifies. Verification is local (signature + cached JWKS),
  so the second check costs microseconds, not a network hop.
- **Both** is the serious answer, and it's cheap precisely because JWTs verify offline.

What the sidecar does **not** do: issue tokens, refresh them, or run login flows — that's your
IdP's job, and your app still reads claims for fine-grained, data-dependent decisions ("is this
*their* order?"). The mesh enforces the perimeter conditions; it doesn't become your authorization
model.

## Debugging the three famous failures

| Symptom | Meaning | Look at |
|---|---|---|
| `401 Jwt issuer is not configured` | Token's `iss` doesn't match any jwtRule | The rule's `issuer` vs the token's claim — decode it (Identity Dojo way: locally, never a web decoder) |
| `401 Jwt verification fails` | Signature/expiry/audience failed | `aud` vs `audiences`, token expiry, IdP keys reachable from the *sidecar* (a `REGISTRY_ONLY` mesh needs a ServiceEntry — module 5b! — for the jwksUri) |
| `403 RBAC: access denied` | Token fine; policy said no | Which AuthorizationPolicy matched: `istioctl x authz check <pod>` |

That middle row is the cross-module bug worth remembering: strict egress silently blocks JWKS
fetches, and every token becomes "invalid." The mesh's features interact; the debugging habit is
the same as ever — read the response flag, find the deciding component, check its config.

---

**Next:** [7 — Observability: Kiali & telemetry →](./07-observability-kiali-telemetry.md)
