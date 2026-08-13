<p align="center">
  <img src="https://img.shields.io/badge/streams-14-8b5cf6" alt="streams">
  <img src="https://img.shields.io/badge/lessons-132-8b5cf6" alt="lessons">
  <img src="https://img.shields.io/badge/exercises-139-06b6d4" alt="exercises">
  <img src="https://img.shields.io/badge/content%20checks-660-2ea44f" alt="content integrity checks">
  <img src="https://img.shields.io/badge/deps-zero-111827" alt="zero dependencies">
</p>

# IdentityDojo 🛂

A self-contained course on identity and access management — **14 streams, 132 lessons, 139 hands-on
exercises**, in a single offline HTML file. Split out of [DevDojo](../README.md) once the domain grew
large enough to stand on its own.

## The design principle

Most identity material starts at the protocol and assumes the vocabulary. This one is sequenced so
that **concepts are grounded before the protocols that assume them**:

- you meet "token" as a defined thing — opaque vs structured, role vs format — before any lesson uses one
- you learn that **SSO is a user experience** before learning the protocols that produce it, and that
  federation and delegation are the mechanisms underneath
- you see the actor cast **once**, mapped across SAML, OIDC and OAuth, rather than three times under
  three sets of names

Everything after Foundations then reads as mechanism rather than vocabulary.

## What's covered

| Stream | Lessons | |
|---|--:|---|
| Identity Foundations | 24 | lifecycle, claims, tokens, the cast, SSO vs federation vs delegation, delegated authn/authz, on-behalf-of, acting as a user, zero trust, API keys, capability URLs, role assumption, trust anchors, wallets |
| Authentication & MFA | 13 | passwords, factors, TOTP, every MFA method compared, FIDO2 architecture, WebAuthn registration and assertion internals, step-up, assurance levels |
| Authorization Models | 9 | ACL → RBAC → ABAC → ReBAC, PDP/PEP, data-level authz and IDOR, groups, policy combination, Zanzibar at scale |
| Sessions & Web Login | 6 | cookies, CSRF, fixation, token storage, revocation, Single Logout |
| OAuth 2.0 & OIDC | 16 | the flows, PKCE end to end, OIDC, native and browser apps, the BFF pattern, OAuth 2.1, OpenID Federation |
| Tokens: JWT & JOSE | 7 | JWK, JWS, JWE, JWKS verification, tampering, SD-JWT selective disclosure |
| SAML & Web SSO | 5 | assertions, bindings, metadata, signing, SAML vs OIDC |
| PKI & Certificates | 6 | X.509, CAs, CSRs, TLS/mTLS, revocation and rotation, keystores |
| Service-to-Service | 9 | machine identity, mTLS, token exchange, SPIFFE, context propagation, AI agent identity |
| Enterprise Identity | 10 | LDAP, **Active Directory in depth**, **Kerberos in depth**, SCIM, JIT, social login, multi-tenancy |
| Advanced OAuth & Threats | 9 | introspection, PAR/JAR/JARM, DPoP in depth, attack catalog, CAE, FAPI |
| Governance & Privileged Access | 8 | IGA, entitlements, PAM, secrets, CIAM, consent, audit, non-human identity |
| **Running Identity** | 9 | incident response, migration, availability and break-glass, observability, testing, diagnosis, the 3am page, change safety, evaluating a solution |
| Capstone | 1 | build a secure auth service |

The **Running Identity** stream is the part most courses omit entirely: not how the protocols work, but
how the systems fail and how they are operated.

## Build & run

```bash
node build.js                  # produces dist/index.html
node scripts/verify.js         # content integrity gate (target: 0 failures)
```

Open `dist/index.html` directly in a browser, or host it on any static host.

IdentityDojo owns everything in this directory except the runtime, which comes from the shared
[`../engine`](../engine/README.md) — one engine, used by every course in the repo, rather than a fork
per course. That is the course's **only** external dependency: to lift IdentityDojo into its own
repository, vendor or submodule `engine/` and change the `ENGINE` constant at the top of `build.js`.
Nothing else moves.

## How grading works (honestly)

The **content checks** badge counts assertions in `scripts/verify.js` proving every reference solution
matches its own regex checks and that ids are unique. That is a **content integrity gate, not a test
suite** — it says the material is internally consistent, not that a learner's code is correct.

Exercises here are Java, graded by **regex structural checks**: they verify you wrote the expected
construct, not that your code runs. Every exercise ships a **Run locally** panel with exact commands,
and that is the ground truth. Raising the share of real execution is the most valuable open
improvement.

## Accuracy

Lessons cite primary sources (RFCs, W3C, NIST) throughout. Specific claims have been spot-checked
against those sources, which caught three real errors — WebAuthn's BE/BS flags being Level 3 rather
than Level 2, the RFC 8693 rule that nested `act` claims are informational and must not drive access
decisions, and the krbtgt double-rotation being Active Directory behaviour rather than something
RFC 4120 specifies. **The remaining content has not been reviewed by an independent expert**, so treat
specific details as well-researched rather than authoritative.

See [`../IAM_TOPICS.md`](../IAM_TOPICS.md) for the full topic map, including what is deliberately not
yet covered.
