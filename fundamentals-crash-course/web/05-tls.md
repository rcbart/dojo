# 5 — TLS & certificates

*Trust for the pipe: what certificates actually prove, why chains break in exactly one way, and where decryption should happen. ~12 min read.*

---

DNS (last module) told you *where* to connect. TLS is what makes the connection worth having: it
gives the pipe **encryption** (nobody reads it), **integrity** (nobody alters it), and
**authentication** (you're talking to who you think you are). The first two come nearly free. The
third one runs on **certificates**, and certificates are where all the operational pain lives —
so that's where this module spends its time.

## What a certificate actually proves

A certificate is a signed statement: *"this public key belongs to `api.example.com`"* — signed by
a **certificate authority (CA)** your client already trusts. The trust is transitive and forms the
**chain**:

```
root CA          lives in the client's trust store, offline, decades-long
  └─ intermediate CA     does the day-to-day signing
        └─ your certificate     "api.example.com", valid ~90 days
```

The server must present **its certificate plus the intermediates**; clients only have roots
built in. Which produces *the* classic TLS bug: an incomplete chain **works in browsers and fails
everywhere else** — browsers repair missing intermediates by fetching them, while curl, Java, and
most libraries validate exactly what the server sent. "Works in Chrome, fails in the app" is a
missing intermediate until proven otherwise; `openssl s_client -connect host:443` shows precisely
what's being served.

Two more things a certificate is *not*: proof the site is trustworthy (only that the name is
theirs — phishing sites have valid certificates), and permanent (modern certs live ~90 days on
purpose: short lifetimes make stolen keys age out fast and force the automation habit below).

## SNI: many names, one address

One server IP usually hosts many names, so the client announces the name it wants *inside the TLS
handshake* — **SNI** (Server Name Indication) — and the server picks the matching certificate.
Infrastructure reads SNI everywhere: it's how the Envoy course's filter-chain matching routes TLS
connections without decrypting them, and why a misrouted certificate ("wrong cert served for my
domain") is usually an SNI/default-chain configuration bug, not a certificate bug.

## ACME: certificates as automation, not ritual

**Let's Encrypt** and the **ACME** protocol turned certificates from an annual purchase into free,
automated, 90-day issuance. The CA's problem is proving you control the name; ACME offers two
challenge shapes, and knowing both is practical knowledge:

- **HTTP-01** — "serve this token at `http://yourname/.well-known/acme-challenge/…`". Simple, but
  requires the CA to reach your web server — no good for internal hosts.
- **DNS-01** — "create this TXT record". Runs entirely through last module's machinery, works for
  internal names, and it's the only way to get **wildcard** certificates (`*.example.com`). The
  price: your automation now needs API access to your DNS zone — credentials worth guarding.

Two DNS records from last module close the loop: **CAA** limits which CAs may issue for your name
at all, and the TXT records DNS-01 writes are why cert automation and DNS automation end up being
the same project. Either way the rule is absolute: **automate issuance and renewal from day one**
(cert-manager in Kubernetes, or your proxy's built-in ACME) — "the cert expired on a Saturday" is
the single most preventable outage in this whole course.

## Where TLS terminates — a real architectural decision

"Terminating TLS" means decrypting. *Where* you do it decides where plaintext exists:

```
user ──TLS──► CDN ──?──► LB ──?──► gateway ──?──► service
```

- **Terminate at the edge, plaintext inside.** Simple, fast, historically common — and it means
  everything behind the edge sees plaintext. The zero-trust critique is blunt: "inside the
  perimeter" is not a trust boundary; one compromised pod reads its neighbors' traffic.
- **Re-encrypt hop by hop.** The edge terminates (it must, to route on L7 data), then opens fresh
  TLS inward. The common serious posture for north–south traffic.
- **mTLS service-to-service.** For east–west traffic, *mutual* TLS: both sides present
  certificates, so every service proves its identity, both directions. Doing this by hand — a
  cert per service, rotated, distributed — is brutal, which is exactly the service mesh's pitch:
  Istio issues each workload a short-lived certificate and rotates it automatically (Istio
  course, module 6), and the identity *inside* that certificate is what authorization policies
  consume.

That last sentence closes this course's loop with the identity world: modern infrastructure
identity **is** certificates — SPIFFE-style workload identity, mTLS meshes, cert-bound service
accounts. The Identity Dojo service-to-service stream picks up exactly where this module stops.

## The debugging shortlist

| Symptom | First suspect |
|---|---|
| Works in browser, fails in curl/Java/mobile | Incomplete chain — serve the intermediates |
| "Certificate name mismatch" | SNI: wrong cert picked, or the name isn't on the cert (check SANs) |
| Everything broke at once, no deploys | Expiry — yours, or an intermediate's; check the whole chain |
| Valid cert, but clients with old devices fail | Root not in their ancient trust store (the classic old-Android problem) |
| Renewal suddenly failing | CAA record blocking the CA, or the ACME challenge can't reach you |

---

**Next:** [6 — Queues, caches & the async path →](./06-queues-caches-async.md)
