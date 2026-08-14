# DevDojo — Roadmap: per-domain belts, dan tracks & the full IAM curriculum

> **Status note (this document is historical).** It was written before the identity material was split
> out into its own course, so its figures describe IAM *inside* DevDojo and no longer match anything.
> What it proposed has shipped: per-domain percentage belts, per-domain dan tracks, and an IAM curriculum
> that outgrew the estimate here and became [IdentityDojo](identity-dojo/README.md) — now 14 streams and
> 149 lessons. For current figures see [ARCHITECTURE.md](ARCHITECTURE.md); this file is kept for the
> reasoning, not the numbers.

This captures the product direction you described so nothing is lost, and proposes a concrete,
low-risk way to build it. Three things are in scope:

1. **Per-domain progression** — graduate white → black belt *within each domain*.
2. **A dan (advanced) track per domain** — not one global dan track.
3. **Comprehensive content** — every domain deep enough to earn a real black belt, starting with a
   complete beginner→expert **Identity & Access (IAM)** curriculum.

---

## 1. Where we are today

- **Belts are global.** `BELTS` in `src/app.js` are absolute thresholds
  (`0,10,25,40,55,70,85,100` lessons). One belt for the whole app; ~100 belt-eligible lessons = black.
- **One global dan track.** Three "dan" streams (System Design, Distributed Systems, Real Code) are
  flagged `dan:true` and grouped in a single "Senior Track (Dan)" section.
- **Domains exist only as home-page grouping** (the `DOMAINS` map in `app.js`) — they don't yet
  affect belts or dan.

## 2. Target model

### Per-domain belts (percentage-based)

Because domains differ in size, a domain belt should be based on **percent of that domain's
belt-eligible lessons completed**, not absolute counts:

| % of domain complete | Belt |
|----------------------|------|
| 0% | White |
| 15% | Yellow |
| 30% | Orange |
| 45% | Green |
| 60% | Blue |
| 75% | Purple |
| 90% | Brown |
| 100% | Black 🖤 |

Each domain header on the home page shows its own belt strip + "N/total". A small **overall**
belt (average across domains, or total) can remain in the top bar for a global sense of progress.

### A dan track per domain

- Every domain gets its own **Dan track** — advanced streams unlocked once its black belt is earned.
- Mechanically: streams carry a `domain` and a `dan:true` flag; a domain renders its normal streams
  (belt progression) and, below them, its **Dan track** (advanced, no belt credit — post-black
  mastery), exactly like today's senior track but scoped to the domain.

### Engine changes required (small, isolated)

1. Add a `domain` field to each stream (or keep deriving it from the `DOMAINS` map by title).
2. `domainBelt(domain)` — compute percent + belt for a domain's belt-eligible streams.
3. Render a belt strip on each domain header; render a per-domain "⛩️ Dan track" sub-section.
4. Keep global belt as an "overall" indicator (or retire it).
5. `verify.js` unchanged; `build.js` unchanged.

No rewrite of the runtime, storage, or exercise engine — this is additive.

## 3. Comprehensive IAM curriculum (beginner → expert)

The immediate content goal: make **Identity & Access (IAM)** a full white→black journey with a dan
track. Proposed streams (✅ = built):

**Belt track (white → black):**
1. ✅ **Identity Foundations** — authn vs authz; sessions vs tokens; SSO & federation (IdP/SP/RP,
   trust); public vs confidential (private) clients + client auth; delegation, consent, scopes;
   token validation; bearer vs sender-constrained.
2. ✅ **OAuth 2.0 & OpenID Connect** — roles & endpoints; Authorization Code; PKCE; code→token
   exchange; Client Credentials; Refresh & lifecycle; OIDC (ID token, nonce, UserInfo, discovery);
   Device flow + legacy (Implicit/ROPC).
3. **Authentication Methods** — passwords & storage recap; MFA/2FA; TOTP/HOTP; push & magic links;
   **WebAuthn/FIDO2 & passkeys** (phishing-resistant); step-up & adaptive/risk-based auth.
4. **Authorization Models** — RBAC; ABAC; **ReBAC** (Zanzibar/OpenFGA); PBAC & policy engines (OPA/
   Rego, Cedar); scopes vs roles vs permissions; least privilege & separation of duties.
5. **SAML 2.0 & Web SSO** — assertions; SP- vs IdP-initiated SSO; bindings (Redirect/POST/Artifact);
   metadata; signing & encryption; Single Logout; SAML vs OIDC.
6. **Sessions, Cookies & Web Login Security** — cookie flags, session fixation/CSRF; SSO session vs
   app session; front-channel vs back-channel logout; token storage in browsers.
7. **PKI & Certificate Management** — X.509; CAs & chains of trust; CSR; key usage/EKU; TLS & mTLS;
   revocation (CRL/OCSP/stapling); keystores/truststores (keytool); rotation; ACME; HSMs.

**Dan track (advanced / expert):**
- **Enterprise Identity & Directories** — LDAP, Active Directory, **Kerberos** (KDC, tickets),
  RADIUS; SCIM provisioning; JML lifecycle; JIT provisioning.
- **Service-to-Service Authorization & SPIFFE** — client credentials at scale; **mTLS**; token
  exchange (RFC 8693); **SPIFFE/SPIRE**, SVIDs (X.509 & JWT), workload identity; service-mesh mTLS;
  cloud workload identity federation.
- **Advanced OAuth/OIDC & Threats** — token introspection & revocation; JWT access tokens (RFC
  9068); PAR, JAR/JARM, RAR; **DPoP** & mTLS-bound tokens; FAPI; dynamic client registration; attack
  catalog (mix-up, CSRF, open redirect, token replay, consent phishing) + defenses.
- **Identity Governance & Privileged Access** — IGA, access reviews/certification, **PAM**,
  just-in-time privilege, secrets management (Vault), CIAM vs workforce IAM, compliance.

That's a genuine beginner→expert IAM domain (7 belt streams + 4 dan streams, ~60 lessons).

> **Status update — this section is complete and then some.** All 13 IAM sub-categories are built:
> **115 lessons, 122 exercises, 537 checks**, well past the ~60 originally planned. The extra depth
> went into a much larger foundations layer (23 lessons) that grounds tokens, the identity lifecycle,
> the claims data model, the actor cast, and the SSO / federation / delegation distinction *before*
> the protocol streams use them — plus patterns the original map never listed: API keys, capability
> URLs, cross-account role assumption, data-level authorization and IDOR, acting-as-a-user, OAuth
> 2.1, the BFF pattern, DPoP in depth, SD-JWT, and FAPI. See `IAM_TOPICS.md` for the current map and
> the short list of topics still open.

## 4. The rest of the app

To realize "white→black in *every* domain, each with a dan track," the other domains need the same
treatment over time: most already have solid belt content; each still needs a dedicated **dan
track**, and a few thinner domains (Data & Persistence, Systems & Networking, Architecture &
Design) need more belt lessons to make black belt meaningful. This is a phased effort, not one turn.

## 5. Recommended sequencing

1. ~~**Engine: per-domain belts + per-domain dan rendering**~~ — done; belts are percentage-based
   per domain.
2. ~~**Finish the IAM belt track + IAM dan track**~~ — done, and extended well beyond the original
   map (see the status note in section 3).
3. **Roll dan tracks + fill gaps across the other domains**, domain by domain, until each is a full
   white→black + dan journey. ← *current focus*

Each step ends green (`verify.js` 0 failures) and rebuilt.

## 6. Where the other domains stand

IAM is now by far the deepest domain at 115 lessons; the rest of the course is 200. The gap is the
work remaining. Rough shape of it, from the current content:

- **Deep enough for a meaningful black belt** — Java & the JVM, data structures & algorithms,
  concurrency, web/HTTP & APIs, DevOps & delivery.
- **Thinner, needs belt lessons** — data & persistence, systems & networking, architecture & design.
- **Missing a dedicated dan track** — most domains outside IAM and the three existing dan streams.

The IAM build is a useful template for the others: ground the vocabulary first in a foundations
sub-category, then let each protocol or tool stream assume it.
