# Identity & Access Management — complete topic map

A comprehensive checklist of IAM topics, organized into streams, with the concepts each lesson
covers. ✅ = built and live in DevDojo; ⬜ = planned next. The belt track is white→black; the dan
track is advanced/expert.

---

## BELT TRACK (white → black)

### ✅ Identity Foundations  *(built — 7 lessons)*
- Glossary of the whole domain (actors, tokens, flows, endpoints, concepts) + deep terms:
  **delegated authorization, CSRF, replay, bearer vs sender-constrained, phishing-resistance,
  attestation, trust domain**
- Authentication vs authorization; identity, principal/subject, credentials, factors/MFA
- Sessions vs tokens; bearer tokens; front-channel vs back-channel
- SSO & federation; IdP / SP / RP / AS; trust; discovery
- Public vs confidential (private) clients; client authentication (secret, private_key_jwt, mTLS)
- Delegation, consent, scopes; delegation vs impersonation; least privilege
- Token validation checklist (iss/aud/exp); bearer vs sender-constrained (mTLS-bound, DPoP)

### ✅ OAuth 2.0 & OpenID Connect  *(built — 10 lessons)*
- Roles & endpoints; Authorization Code flow; **flow diagrams**
- PKCE (public clients); code→token exchange; Client Credentials; Refresh & lifecycle
- OIDC (ID token, nonce, UserInfo, discovery); Device flow; legacy Implicit/ROPC
- **Native & mobile apps** (system browser, App/Universal Links, PKCE, secure storage)
- **Opaque vs JWT tokens; introspection; the split/phantom-token pattern**
- **Choosing a flow** — decision guide covering every grant (incl. Hybrid, CIBA, Token Exchange)

### ✅ JWT & JOSE (JWK · JWS · JWE)  *(built — 6 lessons, in this domain)*
- JWK key generation; JWT claims; RS256/ES256 signing; JWKS verification; tampering; JWE encryption

### ✅ SAML 2.0 & Web SSO  *(built — 5 lessons)*
- Assertions; SP- vs IdP-initiated; bindings (Redirect/POST/Artifact); metadata & trust;
  signing/encryption, Single Logout; SAML vs OIDC

### ⬜ Authentication Methods & MFA
- Passwords & storage recap (Argon2/bcrypt/PBKDF2); credential stuffing & breach lists
- MFA/2FA; TOTP/HOTP; push & magic links; SMS pitfalls
- **WebAuthn / FIDO2 / passkeys** (phishing-resistant, origin-bound); security keys
- Step-up authentication; adaptive / risk-based auth; account recovery

### ⬜ Authorization Models
- ACLs; **RBAC** (roles/permissions); **ABAC** (attributes/policies)
- **ReBAC** (relationship-based — Google Zanzibar / OpenFGA)
- **PBAC & policy engines** (OPA/Rego, AWS Cedar); scopes vs roles vs permissions
- Least privilege, separation of duties, policy decision vs enforcement point (PDP/PEP)

### ⬜ Sessions, Cookies & Web Login Security
- Cookie flags (HttpOnly/Secure/SameSite); session fixation; CSRF defenses
- SSO session vs app session; token storage in browsers (why not localStorage)
- Logout: front-channel vs back-channel; session revocation

### ✅ PKI & Certificate Management  *(built — 6 lessons)*
- Asymmetric keys & X.509; CAs & chains of trust; CSRs & key usage/EKU
- TLS & mTLS handshake; revocation (CRL/OCSP/stapling), rotation, ACME; keystores/truststores

---

## DAN TRACK (advanced / expert)

### ✅ Service-to-Service Authorization & SPIFFE  *(built — 6 lessons)*
- Machine identity & token-based M2M (**Cognito** as the minting authority, client credentials)
- mTLS as service identity; **OAuth Token Exchange** (on-behalf-of)
- **SPIFFE/SPIRE**, SVIDs (X.509 & JWT), attestation; cloud workload identity federation &
  service-mesh mTLS; zero-trust decision guide

### ⬜ Enterprise Identity & Directories
- **LDAP** & **Active Directory**; **Kerberos** (KDC, tickets, TGT/TGS); RADIUS
- **SCIM** provisioning; JML (joiner/mover/leaver) lifecycle; just-in-time provisioning
- Identity brokering & home-realm discovery; social login & account linking

### ⬜ Advanced OAuth/OIDC & Threats
- Token introspection & revocation (RFC 7009/7662); JWT access tokens (RFC 9068)
- PAR, JAR/JARM, RAR (rich authorization requests); **DPoP** & mTLS-bound tokens; FAPI
- Dynamic client registration; OIDC session management & logout
- Attack catalog: mix-up, CSRF/state, open redirect, token replay, PKCE downgrade, consent
  phishing — and the defenses (OAuth 2.0 Security BCP)

### ⬜ Identity Governance & Privileged Access
- **IGA** — access requests, reviews/certification, segregation-of-duties, entitlements
- **PAM** — privileged accounts, vaulting, session recording, just-in-time privilege
- Secrets management (Vault, cloud secret managers); key management & HSMs
- CIAM vs workforce IAM; compliance (audit, least privilege, deprovisioning)

---

## Status

Built so far: **6 IAM streams** (Identity Foundations, OAuth 2.0 & OIDC, JWT/JOSE, SAML, PKI,
Service-to-Service & SPIFFE) — ~40 lessons, each with a hands-on exercise. Remaining to reach the
full map: **6 more streams** (Authentication Methods, Authorization Models, Sessions & Web Login
Security, Enterprise Identity & Directories, Advanced OAuth/OIDC & Threats, Identity Governance &
PAM). These are the next build batches.
