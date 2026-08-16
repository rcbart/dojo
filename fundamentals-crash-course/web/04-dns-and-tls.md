# 4 — DNS & TLS

*The two technologies every request uses before your code runs: finding the address, and trusting the connection. ~12 min read.*

---

Every box in module 0's map depends on two things working first: the client has to *find* an
address for your name, and both sides have to *trust* the pipe between them. DNS and TLS are old,
unglamorous, and involved in essentially 100% of outages that begin with "it works from my
machine."

## DNS: the distributed phone book

When a browser needs `api.example.com`, it asks a **resolver** (usually the OS's or the ISP's),
which walks the hierarchy — root servers → `.com` servers → *your* zone's **authoritative
servers** — and returns an answer that then gets **cached at every step**, for the number of
seconds your record's **TTL** allows.

The records you'll actually touch:

| Record | Maps | Notes |
|---|---|---|
| **A / AAAA** | name → IPv4 / IPv6 address | The workhorses |
| **CNAME** | name → another name | "This is an alias" — how you point at a CDN |
| **ALIAS/ANAME** | apex name → another name | CNAME isn't allowed at `example.com` itself; providers offer this workaround |
| **TXT** | name → arbitrary text | Domain-ownership proofs, email policy (SPF/DKIM) |
| **NS** | zone → its authoritative servers | Delegation — who answers for this zone |

## DNS as a traffic tool

Because DNS is the *first* decision in every request, it's also the coarsest, most universal
routing layer you have:

- **Geo/latency routing** — answer Europeans with the Frankfurt IP, Australians with Sydney.
- **Failover** — health-check the primary; when it dies, answer with the standby's address.
- **Weighted answers** — 5% of resolutions get the new region: a crude canary.

The catch is always the same: **caching**. A resolver that cached your record ignores your
failover until the TTL expires — and some resolvers ignore TTLs entirely. That's why serious
failover pairs low TTLs (30–60s) with the *anycast* trick: instead of changing the answer, you
advertise **one IP from many locations** and let internet routing (BGP) deliver each user to the
nearest healthy one. When a site withdraws its announcement, routing heals in seconds, no cache
involved. CDNs and public resolvers (`1.1.1.1`, `8.8.8.8`) live on anycast.

Practical scars, cheaply acquired: lower TTLs a day *before* a migration, not during it; remember
`CNAME` at the zone apex is illegal (use ALIAS); and when something "works from my machine but not
production", compare what each side's resolver actually returns (`dig`) before debugging anything
else.

## TLS: trust for the pipe

TLS gives a connection three properties: **encryption** (nobody reads it), **integrity** (nobody
alters it), and **authentication** (you're talking to who you think). The third one is where all
the operational pain lives, because it runs on **certificates**.

A certificate says "this public key belongs to `api.example.com`", signed by a **certificate
authority** the client already trusts, usually via an intermediate — the **chain**. Your server
must present the *whole* chain; a missing intermediate is the classic "works in Chrome, fails in
curl/Java" bug, because browsers repair incomplete chains and strict clients don't.

Since one server IP often hosts many names, the client announces the name it wants in the TLS
handshake — **SNI** — and the server picks the matching certificate. You met SNI-based routing in
the Envoy course's filter-chain matching; this is why it exists.

**Let's Encrypt and the ACME protocol** turned certificates from an annual manual ritual into
free, automated, 90-day issuance — which is why modern practice is: automate issuance and renewal
on day one, or module 4's most predictable outage (*the cert expired on a Saturday*) will
eventually find you. cert-manager (Kubernetes course, module 12) is this automation as a cluster
component.

## Where TLS terminates — a real architectural decision

"Terminate TLS" means: decrypt here. Each choice moves the plaintext boundary:

```
user ──TLS──► CDN ──?──► LB ──?──► gateway ──?──► service
```

- **Terminate at the edge** (CDN/LB), plaintext inside — simple, and common historically; but
  everything inside the perimeter sees plaintext. The zero-trust position is that "inside" is not
  a trust boundary.
- **Re-encrypt hop by hop** — edge terminates (it must, to route on L7), then makes a fresh TLS
  connection inward. The common serious setup.
- **End-to-end mTLS between services** — every service proves its identity with its own
  certificate, both directions. Doing this by hand is brutal, which is precisely the pitch of the
  service mesh: Istio's sidecars (Istio course, module 6) do mTLS invisibly, with certificates
  rotated hourly, and the identity in that certificate — not the network location — is what
  authorization decisions use.

That last point closes a loop this course has been circling: **modern infrastructure identity is
certificates all the way down**, and the identity-aware proxy is how it's deployed. The Identity
Dojo service-to-service stream (SPIFFE) picks up exactly here.

---

**Next:** [5 — Queues, caches & the async path →](./05-queues-caches-async.md)
