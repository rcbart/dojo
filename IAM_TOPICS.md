# Identity & Access Management: complete topic map

The IAM domain, organized by sub-category in reading order, with the concepts each lesson covers.
All 14 sub-categories are built: **149 lessons, 159 exercises, 729 checks**, of which **47 are graded
by real execution**. ⬜ marks topics
identified but not yet written.

The 14 content modules (`16b`–`16n` plus the `16z` capstone) merge at runtime into a single
**Identity and Access** stream with named sub-categories. Order is set by `content/streams/manifest.json`.

---

## The design principle

The domain is sequenced so that **concepts are grounded before the protocols that assume them**. A
reader meets "token" as a defined thing before any lesson uses one, learns that SSO is an outcome
before learning the protocols that produce it, and sees the actor cast once rather than three times
under three sets of names. Everything after Foundations can then be read as mechanism.

---

## ✅ Identity & federation foundations *(26 lessons)*

**The base layer, what every later lesson assumes.**

- Glossary of the whole domain, and authentication vs authorization
- **The identity lifecycle**: person / identity / account / identifier; identity proofing;
  enrollment; credential binding; credential vs authenticator; joiner-mover-leaver; deprovisioning
- **Attributes, claims and assertions**: fact at rest → fact asserted → signed bundle; registered
  claims; attribute release and mapping; why `sub` is the only safe identity key
- **What a token actually is**: opaque vs structured; the concrete shapes (opaque, JWT, SAML
  assertion, session cookie, API key); how one is minted and validated; token **role** vs token
  **format**
- Sessions vs tokens; bearer tokens; front-channel vs back-channel
- **The cast**: subject / resource owner, client / RP / SP, IdP / authorization server, resource
  server, mapped across SAML, OIDC and OAuth; client registration and discovery
- **SSO vs federation vs delegation**: SSO is a user experience (same-domain cookie sharing is SSO
  with no federation); federation is a cross-boundary trust architecture; delegation is an
  authorization mechanism. Why OAuth is not a login protocol
- Public vs confidential clients; client authentication (secret, `private_key_jwt`, mTLS)
- **Delegated authentication**: credential forwarding (LDAP bind, RADIUS, ROPC) vs redirect; who
  touches the password; when forwarding is still defensible
- **Delegated authorization**: the grant vs the token; scopes as bounds; consent; fail-closed
  enforcement; why a scope is not a permission
- **On-behalf-of**: audience per hop, subject survives, acting party recorded; `act` and `may_act`;
  why an unauthenticated user-id header is not a substitute
- **Acting as a user**: authenticated vs effective subject; intersect-never-inherit permissions;
  the controls that make support access defensible
- **Zero trust**: identity as the perimeter; PDP/PEP; fail closed; what zero trust is not
- **API keys**: how they leak; prefixes for secret scanning, hashing at rest, one per integration
- **Capability URLs**: the link is the credential; Referer leakage; mail scanners consuming
  single-use links; stored vs signed capabilities
- **Role assumption**: trust policy vs permission policy; the confused deputy and external ids;
  workload identity federation replacing static keys
- Token validation checklist; sender-constrained tokens
- Federation in plain English, and from the ground up
- **Trust**: how it is established; **trust anchors** and why the chain must stop somewhere you chose
- Decentralized identity: DIDs & Verifiable Credentials
- **Wallets in practice**: OID4VCI issuance, OID4VP presentation, the mDL and ISO 18013-5, asking for
  a predicate rather than the data, age assurance honestly, and what is still unsettled

## ✅ Authentication & MFA *(14 lessons)*

- Passwords done right; the three factors; TOTP/HOTP
- Passkeys: WebAuthn & FIDO2 (phishing-resistant, origin-bound)
- **Every MFA method compared**: SMS, voice, email, TOTP, HOTP, hardware OTP, push, number-matched
  push, security keys, passkeys, smart cards, biometrics, backup codes: pros, cons and best practice
  for each, ranked by phishing resistance. Plus no-downgrade, recovery, enrollment, enroll-two
- **FIDO2 architecture**: WebAuthn vs CTAP2; U2F/UAF history; platform vs roaming authenticators;
  discoverable credentials; the RP ID rules
- **WebAuthn registration**: creation options, user handle, `clientDataJSON`, `attestationObject`,
  `authData` flags (UP/UV/BE/BS), attestation formats and AAGUIDs, the verification procedure
- **WebAuthn authentication**: assertion verification, the signature counter and why `0/0` must not
  lock out synced passkeys, usernameless login, conditional UI, the failure modes that survive
- Step-up & adaptive authentication; IAL/AAL/FAL; passwordless & account recovery
- Credential stuffing, bots & account-takeover defense

## ✅ Authorization models *(10 lessons)*

- ACLs → RBAC; RBAC in depth; ABAC; ReBAC & policy engines (Zanzibar/OpenFGA, OPA, Cedar)
- PDP/PEP, least privilege, separation of duties
- **Data-level authorization**: endpoint authz vs object authz; IDOR/BOLA; filter in the query
  rather than checking after; field masking. UUIDs are obscurity, not authorization
- **Groups**: transitive and nested membership, cycles, group explosion, token bloat, effective
  permissions
- **Combining policies**: deny-overrides, permit-overrides, first-applicable, specificity; default
  deny; explicit deny vs absence of permit; explainable decisions
- **Authorization at scale**: Zanzibar relation tuples, leopard indexes, the new-enemy problem and
  zookies, the centralisation trade, and when you genuinely do not need any of it

## ✅ Sessions, cookies & web login *(7 lessons)*

- Sessions & cookies; cookie security flags; CSRF; session fixation & token storage; logout &
  session revocation
- **Single Logout**: the three things called logout; RP-initiated logout and `id_token_hint`;
  front-channel logout and why third-party cookie blocking is ending it; back-channel logout and the
  logout token; why full SLO rarely works and what to do instead

## ✅ OAuth 2.0 & OpenID Connect *(17 lessons)*

- Roles & the Authorization Code flow; what a client is; code→token exchange
- **PKCE**, and **PKCE end to end**, code interception on mobile, code injection, the complete
  parameter-by-parameter flow, `state` vs `code_challenge` vs `nonce`, and the downgrade attack
- Client Credentials; refresh tokens & lifecycle; OIDC; device flow & legacy grants
- Native & mobile apps; **browser-based apps and the BFF pattern**
- Opaque vs JWT tokens & the split-token pattern; choosing a flow; third-party integrations
- **OAuth 2.1**: what is removed, what becomes mandatory, what is unchanged, and the audit checklist
- **OpenID Federation**: trust chains and entity statements, metadata policy that can only narrow,
  automatic registration, and why the anchor is absolute

## ✅ Tokens: JWT & JOSE *(8 lessons)*

- JWK generation; JWT claims; RS256 vs ES256; JWKS verification; tampering; JWE encryption
- **SD-JWT**: selective disclosure via salted digests; why the salt is load-bearing; key binding
  with `cnf` and `kb+jwt`; the unlinkability it deliberately gives up

## ✅ SAML & enterprise web SSO *(6 lessons)*

- Assertions; SP- vs IdP-initiated; bindings; metadata & trust; signing, encryption, SLO, SAML vs OIDC

## ✅ PKI & certificates *(7 lessons)*

- Asymmetric keys & X.509; CAs & chains of trust; CSRs & key usage; TLS & mTLS; revocation, rotation
  and ACME; keystores & truststores

## ✅ Service-to-service & zero trust *(13 lessons)*

- Machine identity & token-based M2M; mTLS as service identity; OAuth Token Exchange
- SPIFFE/SPIRE and SVIDs; cloud & mesh workload identity; zero-trust decision guide
- Context propagation; impersonation vs delegation
- **Identity for AI agents**: three identities not one, consent granted in advance and bounded,
  monotonic narrowing down the delegation chain, and why prompt injection is an authorization problem

## ✅ Enterprise identity & directories *(11 lessons)*

- LDAP & Active Directory; SCIM & joiner/mover/leaver; JIT provisioning & home-realm discovery;
  social login & account linking; B2B/B2C/B2B2C; multi-tenant identity
- **Active Directory in depth**: forest as the security boundary (a domain is not one), trusts and
  their inverted direction, SID filtering, group scopes, GPO as a code-execution path, ACL abuse and
  shadow admins, DCSync and NTDS.dit, the tiering model, LAPS, and AD as a *graph* attackers walk
- **Kerberos in depth**: the AS/TGS/AP exchanges, pre-authentication, the PAC, SPNs and why any user
  may request any service ticket (Kerberoasting), golden vs silver tickets and the double krbtgt
  rotation, unconstrained / constrained / resource-based delegation and S4U, clock and name
  sensitivity, and the defensive checklist

## ✅ Advanced OAuth & threats *(11 lessons)*

- Introspection & revocation; the JWT validation checklist; PAR, JAR/JARM, RAR
- Sender-constrained tokens, and **DPoP in depth**, the proof JWT (`htm`/`htu`/`jti`/`ath`), the
  `cnf`/`jkt` binding implementations forget, nonces vs replay caches, refresh binding, DPoP vs mTLS
- Attack catalog & defenses; refresh token rotation & reuse detection
- **FAPI**: what a hardened profile is, each requirement mapped to the attack it answers, the two
  levels, certification, and what it still does not tell you
- **Continuous Access Evaluation**: pushed security event tokens, what the receiver must do, and the
  honest cost: the resource server becomes stateful

## ✅ Governance & privileged access *(8 lessons)*

- IGA reviews & certification; entitlements & separation of duties; PAM; secrets management &
  rotation; CIAM vs workforce IAM; consent & privacy; identity audit, logging & compliance
- **Non-human identity**: why joiner-mover-leaver has no equivalent trigger, the four failure modes,
  ownership and expiry as the base controls, and why reviewers rubber-stamp NHI campaigns

## ✅ Running identity in production *(10 lessons)*

**The half of identity that is not a protocol.**

- **Incident response**: blast radius per leaked artefact, why access tokens cannot be recalled,
  emergency signing-key rotation and JWKS cache TTL as the exposure window, hunting persistence
- **Migration**: coexistence and the strangler pattern, lazy password rehashing, why passkeys cannot
  migrate, identifier mapping, sequencing by recoverability
- **Availability & break-glass**: the IdP as the blast radius for everything, serving stale JWKS,
  break-glass accounts that do not live behind the thing they bypass, degraded modes
- **Observability**: the metrics that change decisions (time to deprovision first), SLOs, what to log,
  correlation ids, and what must never be logged
- **Testing**: the pyramid for identity, the negative cases that fail *open*, mock IdPs and test keys
- **Diagnosis**: locating the failure in the redirect chain, symptom-to-cause mapping, the five
  triage questions, reading the artefacts, and the expiry class of bug
- **The 3am page**: outage versus attack, the first ten minutes, traps specific to identity, a worked
  incident, and what makes the review worthwhile
- **Change safety**: what does not roll back, additive rollout, why authorization changes fail
  silently and open, and the business-continuity questions
- **Evaluating and recommending a solution**: the ten questions that discriminate, build versus buy,
  gates before weighted scores, a POC designed to fail, and how to present a defensible recommendation

## ✅ Capstone *(1 lesson)*

- Build a secure auth service, graded end to end

---

## Added since this map was first written

Fifteen lessons closed gaps found by three successive coverage sweeps. Listed by sub-category:

- **Foundations**: discovery, metadata and JWKS (`oadisc`, exact issuer matching and the mix-up defence)
- **Authentication & MFA**: proofing in practice (`am10`: document authenticity, liveness, injection
  attacks and deepfakes, age assurance, and why "refer" must be a third outcome)
- **Authorization models**: operating policy (`az10`: decision logs, policy tests, shadow-mode rollout,
  and the latency/availability/versioning properties nobody specifies until they hurt)
- **Sessions & web login**: CORS and the browser's other security model (`ss7`)
- **Tokens: JWT & JOSE**: crypto agility (`jose8`: kid rotation, algorithm policy, post-quantum position)
- **SAML**: migrating from SAML to OIDC without a flag day (`sml6`)
- **PKI**: certificate pinning (`pki7`: SPKI pins, intermediate over leaf, backup pins, why HPKP died)
- **Service-to-service**: token exchange from first principles (`s2sx`), transaction tokens
  (`s2stxn`, the IETF draft built on RFC 8693), authorizing an agent's tool use (`s2s10`: MCP-style tool
  servers and prompt injection as an authorization problem), and workload identity federation
  (`s2scicd`: CI pipelines exchanging an OIDC token for cloud credentials instead of storing a key)
- **Enterprise**: identity brokering (`eibroker`: subject collision and unverified email claims)
- **Advanced OAuth & threats**: resource indicators (`ao9`) and cross-device flows with the
  consent-phishing class (`ao10`)
- **Running identity**: detecting identity attacks (`run10`: what ITDR watches, and tiering the response)

`ig5` was also rewritten: a term-overlap check found it duplicating `idfciam`, and it now covers governing
consumer identity specifically, what replaces access reviews with no HR feed, the consent lifecycle, the
support tool as the least governed system in the estate, and the erasure-versus-legal-hold conflict.

---

## ⬜ Identified, not yet written

- **BBS+ / zero-knowledge credentials** and **credential status lists**, named in the SD-JWT and
  wallet lessons as open problems, not covered in their own right

- **Dynamic client registration** (RFC 7591) and software statements, now summarised inside `oaclient`,
  but without a lesson of its own
- **Grant management** (the OIDC grant management API)
- **Anonymous and progressive identity**: guest access that later becomes an account
- **Hands-on lab against a real IdP**: the biggest gap versus vendor training; every exercise here
  is self-contained by design

---

## Known limitation

**47 of 159 exercises (30%) are graded by real execution**, the function is called with real inputs in a
sandboxed Web Worker and its return value compared, one named case per failure mode. The remaining 112 are
Java, graded by **regex structural checks**: they verify you wrote the right shape, not that your code runs.
Every exercise ships a **Run locally** panel with exact commands for ground truth.

Three gates protect the material: `scripts/verify.js` checks each solution against its own structural
checks, `scripts/verify-exec.js` executes every run-spec exercise against its own cases, and the shared
engine's unit tests run before either. See [ARCHITECTURE.md](ARCHITECTURE.md) for what each one can and
cannot see.
