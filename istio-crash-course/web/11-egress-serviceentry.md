# 5b — Egress & ServiceEntry: the traffic that leaves

*The mesh knows every service inside it — and nothing about the internet. This module is about calls that leave the cluster. ~10 min read.*

---

Every module so far managed traffic *between* your services. But real applications call out:
Stripe, S3, a partner's API, the legacy database that never moved. By default that traffic is a
blind spot — and in a security review, the blind spot is the finding. This module closes it.

## The default: outbound traffic is invisible, and allowed

Out of the box, Istio's sidecars pass through traffic to unknown destinations
(`outboundTrafficPolicy: ALLOW_ANY`). Your pod can call `api.stripe.com` — it works, but the mesh
sees only "bytes to somewhere": no per-destination telemetry, no retries or timeouts, no policy.
Kiali draws it as traffic to a black hole named `PassthroughCluster`.

The strict posture flips the default:

```yaml
meshConfig:
  outboundTrafficPolicy:
    mode: REGISTRY_ONLY     # unknown destination => connection refused
```

Now the mesh is a **default-deny egress boundary**: a compromised pod can't quietly exfiltrate
data to an attacker's server, because the attacker's server isn't in the registry. The cost: every
legitimate external dependency must now be *declared*. That declaration is the ServiceEntry.

## ServiceEntry: teaching the mesh about the outside

A **ServiceEntry** adds an external destination to Istio's service registry — after which the mesh
treats it like any other service:

```yaml
apiVersion: networking.istio.io/v1
kind: ServiceEntry
metadata: { name: stripe }
spec:
  hosts: [api.stripe.com]
  location: MESH_EXTERNAL
  resolution: DNS
  ports:
  - { number: 443, name: tls, protocol: TLS }
```

Two consequences, immediately: the call is **allowed** again under `REGISTRY_ONLY`, and it's
**visible** — `api.stripe.com` appears in Kiali and the metrics with its own request rates and
error counts. And because it's registry material, the module 4–5 machinery now applies to it: a
`VirtualService` can put a 3-second timeout on Stripe calls, a `DestinationRule` can cap
connections and eject a flapping endpoint — your resilience policies, wrapped around a dependency
you don't operate. Declaring an entry per external dependency also produces something audit teams
ask for and rarely get: a *reviewed*, version-controlled list of everything the cluster talks to.

## The caveat that matters: hosts vs IPs

`REGISTRY_ONLY` matches TLS traffic by **SNI hostname**. A pod calling a raw IP, or speaking a
protocol without SNI, doesn't match a `hosts:` entry — and sufficiently deliberate malware can
shape its traffic to dodge host-based matching. Treat mesh egress control as a strong *first*
fence — excellent against accidents, misconfig, and lazy attackers — and pair it with
**NetworkPolicy** (Kubernetes course, module 7) at L3/L4 for the layer below. Defense in depth,
not either/or.

## The egress gateway: one door out

For compliance postures that require outbound traffic to exit from *known network locations* —
"only these IPs may reach the payment processor" — Istio offers the **egress gateway**: the mirror
of module 3's ingress. Sidecars route external calls to a dedicated Envoy fleet, which makes the
actual outbound connection:

```
pod → sidecar ──mTLS──► egress gateway ──TLS──► api.stripe.com
```

The wins: the processor can allowlist the gateway's IPs; outbound TLS origination happens at one
audited place; and *all* external traffic funnels through a choke point you can log, meter, and —
in an incident — close. The cost is real too: an extra hop, an extra fleet to run, and more YAML
(the VirtualService that reroutes sidecar→gateway is famously fiddly). The realistic sizing: most
teams live well on `REGISTRY_ONLY` + ServiceEntries; add the egress gateway when a regulator,
partner contract, or SOC's allowlist asks for it by name — not before.

## The checklist

- Flip to `REGISTRY_ONLY` early — retrofitting it after a hundred undeclared dependencies is an
  archaeology project. (Grep Kiali/metrics for `PassthroughCluster` traffic *first* to find them.)
- One **ServiceEntry per external dependency**, in version control, reviewed like code.
- Timeouts and `DestinationRule` circuit breaking on the entries that matter — external services
  fail more, not less, than yours.
- **NetworkPolicy underneath**, egress gateway when compliance calls for it.

---

**Next:** [6 — Security: mTLS & authorization →](./06-security-mtls-authz.md)
