---
title: "SSO, the fields"
nav_title: "SSO fields"
subtitle: "Every field in a SAML Response, an OIDC authorization response and ID token, a back-channel logout token and a launch token, with what it is for and which check refuses it. A reference for reading a response against a handler."
description: "A field-by-field reference for the messages in cross-application SSO: the SAML Response and Assertion, the OIDC authorization response and ID token, the back-channel logout token, and a signed launch token. What each field is for, which check in the mechanics post refuses it, and the sentence of the spec behind the check."
date: 2026-10-04
tags: ["identity", "sso", "saml", "oidc", "reference"]
category: identity
slug: "sso-fields"
page: true
nav_blurb: "every field in a SAML or OIDC message, and which check refuses it"
nav: 2
revisions: 17
status: published
---

This is a reference. The argument is in [the decision
post](/blog/sso-for-integrations-the-decision/), and the handlers these
rows point at are in [the mechanics post](/blog/sso-for-integrations/).
Each table is one message, shown once on the wire above the table,
stripped to what the receiver checks. Each row is one field, with what
it is in plain words, an example of its value, and the check that
refuses it when it is wrong, named the way the handler names it. The
examples use the same made-up names as the mechanics post's samples. Where a check rests on a sentence of a spec, the sentence is
cited after the table.

>! How to read a row: "Refused by" names the numbered step in the
>! handler in the mechanics post. "Not checked" means the handler reads
>! the field for something other than a refusal, or ignores it, and
>! says why.

## The SAML Response

Arrives by the HTTP-POST binding as a base64 form field named
`SAMLResponse`, with `RelayState` beside it. The handler is
[`accept_unsolicited_response`](/blog/sso-for-integrations/#saml-idp-initiated)
for the IdP-initiated case. The solicited case makes the same checks
with the two `InResponseTo` lines inverted. Listing 1 is the solicited
document, so it carries both `InResponseTo` attributes, and the unsolicited
handler would refuse exactly those two, and accept the same document
without them.

```xml Listing 1: a SAML Response as it arrives, decoded from the SAMLResponse form field, Assertion collapsed
<samlp:Response ID="_r9" Version="2.0" IssueInstant="2026-09-27T16:00:00Z"
    Destination="https://partner.example.net/saml/acs"
    InResponseTo="_req5f3a">
  <saml:Issuer>https://idp.example.com</saml:Issuer>
  <ds:Signature>...</ds:Signature>
  <samlp:Status>
    <samlp:StatusCode Value="urn:oasis:names:tc:SAML:2.0:status:Success"/>
  </samlp:Status>
  <saml:Assertion ID="_a1b2c3" ...>   the whole of Listing 3 goes here   </saml:Assertion>
</samlp:Response>
```

The form that carried it had two fields, `SAMLResponse` holding the
base64 of the document above and `RelayState=orders` beside it. This is
the solicited case, answering the request in Listing 13, so
`InResponseTo` is present here and on the bearer confirmation in Listing
3. The unsolicited case is the same document without those two
attributes. When the Assertion is encrypted, the `Assertion` element is
replaced by the one in Listing 2.

```xml Listing 2: the same Response with the Assertion encrypted, everything the receiver sees before decrypting
<samlp:Response ID="_r9" Version="2.0" IssueInstant="2026-09-27T16:00:00Z"
    Destination="https://partner.example.net/saml/acs" InResponseTo="_req5f3a">
  <saml:Issuer>https://idp.example.com</saml:Issuer>
  <ds:Signature>...</ds:Signature>
  <samlp:Status><samlp:StatusCode Value="urn:oasis:names:tc:SAML:2.0:status:Success"/></samlp:Status>
  <saml:EncryptedAssertion>
    <xenc:EncryptedData Type="http://www.w3.org/2001/04/xmlenc#Element">
      <xenc:EncryptionMethod Algorithm="http://www.w3.org/2009/xmlenc11#aes256-gcm"/>
      <ds:KeyInfo>
        <xenc:EncryptedKey>
          <xenc:EncryptionMethod Algorithm="http://www.w3.org/2009/xmlenc11#rsa-oaep"/>
          <ds:KeyInfo><ds:KeyName>partner-enc-2026</ds:KeyName></ds:KeyInfo>
          <xenc:CipherData><xenc:CipherValue>base64 of the AES key, encrypted to the partner's public key</xenc:CipherValue></xenc:CipherData>
        </xenc:EncryptedKey>
      </ds:KeyInfo>
      <xenc:CipherData><xenc:CipherValue>base64 of the encrypted Assertion</xenc:CipherValue></xenc:CipherData>
    </xenc:EncryptedData>
  </saml:EncryptedAssertion>
</samlp:Response>
```

Every Response-level field, the two algorithm names, and which partner
key the content key was wrapped with are in the clear, and therefore
readable in a log or a HAR file. Nothing about the user, the audience, the
Assertion's times or the attributes is visible until the outer signature holds and
the Assertion is decrypted.

| Field | What it is | Example | Refused by |
|---|---|---|---|
| `ID` | A name for this Response that the issuer never reuses. Unique means across everything that issuer has ever minted, not just within this document, with enough randomness that a collision is negligible. It must start with a letter or underscore, hence the leading `_`. | `ID="_r9"` | Not checked. Single use is tracked on the Assertion's `ID`, in the next table, not on this one. |
| `Version` | The SAML version. Always `2.0`. | `Version="2.0"` | Step 3, `saml.version == "2.0"`. |
| `IssueInstant` | The time the identity provider created the Response. Always UTC, written with a trailing `Z` and no offset. A value with an offset, or with no `Z`, is a bug at the sender. When debugging, convert your logs to UTC before comparing. | `IssueInstant="2026-09-27T16:00:00Z"` | Not checked at the Response level. The Assertion's `IssueInstant` is (step 5). |
| `Destination` | The exact address this Response was meant to be delivered to. Optional in general, so a Response that is not itself signed (the Assertion inside carries the signature) may omit it, and the `Recipient` on the bearer confirmation does the same job. Required when the Response is signed, because the signature covers it: without it, a signed Response could be replayed to a different endpoint and the signature would still verify. The identity provider already knows the ACS URL from the partner's metadata. This attribute exists so the receiver can prove the message was meant for the address it arrived at. | `Destination="https://partner.example.net/saml/acs"` | Step 1, two rules. When present, it must equal our ACS URL. When the Response is signed, it must be present, so the same check runs. |
| `InResponseTo` | The ID of the request this Response answers. Absent when nobody asked, which is the unsolicited case. | `InResponseTo="_req5f3a"` | Step 1: must be absent on the unsolicited path, and must equal the remembered request ID on the solicited path. |
| `Issuer` | The identity provider's name for itself. Required when the Response is signed or the assertion is encrypted. | `<saml:Issuer>https://idp.example.com</saml:Issuer>` | Step 2 selects the tenant's keys by it, and step 3 requires it to match the verified Assertion's issuer. |
| `Signature` | The identity provider's signature over the whole Response, proving nothing in it was changed. | `<ds:Signature>...</ds:Signature>` as a child of the Response | Step 2, verified with the tenant's keys before anything is decrypted. An Assertion covered by this signature needs none of its own (E26). |
| `Status/StatusCode` | Whether the login succeeded, or why it did not. | `Value="urn:oasis:names:tc:SAML:2.0:status:Success"` | Step 1, must be `Success`. A nested second-level code (`NoPassive`, the answer to a silent attempt) is read by the retry rule in the mechanics post, not here. |
| `Assertion` | The statement about the user, carried inside the Response as a child element, in the clear. The profile requires at least one. This handler takes exactly one. | `<saml:Assertion ID="_a1b2c3" ...>` | Step 3 takes exactly one, and its fields are the next table. |
| `EncryptedAssertion` | The same Assertion, encrypted so only the service provider can read it, in place of the clear one. | `<saml:EncryptedAssertion><xenc:EncryptedData>...</xenc:EncryptedData></saml:EncryptedAssertion>` | Step 3 decrypts after the outer signature holds, then treats the result as the one Assertion. |
| `RelayState` | Not part of the XML, but a second form field posted beside it. Says where in the application the user should land. Limited to 80 bytes. | `RelayState=orders` in the POST body | Step 8, `resolve_landing`: a name we map or a path matched against our routes, never a URL followed as given. |

## The SAML Assertion

The Assertion travels inside the Response, as a child element, in the
clear as `Assertion` or encrypted as `EncryptedAssertion`. The Response is
the envelope, with the status, the destination and its own signature, and the
Assertion is the statement about the user. The profile requires at
least one. The handler takes exactly one, verifies every signature
present, and requires one whose reference encloses the element it reads
the subject from.

```xml Listing 3: the Assertion inside Listing 1, with every field the table below names
<saml:Assertion ID="_a1b2c3" Version="2.0" IssueInstant="2026-09-27T16:00:00Z">
  <saml:Issuer>https://idp.example.com</saml:Issuer>
  <ds:Signature>...</ds:Signature>
  <saml:Subject>
    <saml:NameID Format="urn:oasis:names:tc:SAML:2.0:nameid-format:persistent"
        NameQualifier="https://idp.example.com"
        SPNameQualifier="https://partner.example.net">p-8c21e0</saml:NameID>
    <saml:SubjectConfirmation Method="urn:oasis:names:tc:SAML:2.0:cm:bearer">
      <saml:SubjectConfirmationData NotOnOrAfter="2026-09-27T16:05:00Z"
          Recipient="https://partner.example.net/saml/acs"
          InResponseTo="_req5f3a"/>
    </saml:SubjectConfirmation>
  </saml:Subject>
  <saml:Conditions NotBefore="2026-09-27T15:59:00Z" NotOnOrAfter="2026-09-27T16:05:00Z">
    <saml:AudienceRestriction>
      <saml:Audience>https://partner.example.net</saml:Audience>
    </saml:AudienceRestriction>
    <saml:OneTimeUse/>
  </saml:Conditions>
  <saml:AuthnStatement AuthnInstant="2026-09-27T15:58:30Z" SessionIndex="s-77"
      SessionNotOnOrAfter="2026-09-28T00:00:00Z">
    <saml:AuthnContext>
      <saml:AuthnContextClassRef>urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport</saml:AuthnContextClassRef>
    </saml:AuthnContext>
  </saml:AuthnStatement>
  <saml:AttributeStatement>
    <saml:Attribute Name="mail">
      <saml:AttributeValue>ada@customer-a.example</saml:AttributeValue>
    </saml:Attribute>
  </saml:AttributeStatement>
</saml:Assertion>
```

This Assertion carries its own signature as well as being covered by
the Response's, which is the belt-and-braces shape some identity
providers send. Either one alone satisfies the handler unless the
partner's metadata says `WantAssertionsSigned`, in which case the
Assertion's own is required. `NotBefore` on
the bearer confirmation is the one field the table names that is absent
on purpose.

| Field | What it is | Example | Refused by |
|---|---|---|---|
| `ID` | A name the issuer never reuses. It is the replay key, the value the handler remembers so that the same Assertion, presented a second time, is refused. The cache is keyed by issuer as well, so two issuers that happen to mint the same `ID` cannot collide. | `ID="_a1b2c3"` | Step 7, `seen_ids.add_if_absent((tenant.issuer, assertion.id))`, kept until the bearer window plus skew. |
| `Version` | The SAML version. Always `2.0`. | `Version="2.0"` | Step 3. |
| `IssueInstant` | The time the identity provider created the Assertion. UTC with a trailing `Z`, like every time value in SAML. | `IssueInstant="2026-09-27T16:00:00Z"` | Step 5, must not be in the future beyond skew, and the bearer window measured from it must not exceed `MAX_WINDOW`. |
| `Issuer` | The identity provider's name for itself, the one the tenant was registered under. | `<saml:Issuer>https://idp.example.com</saml:Issuer>` | Step 3, re-read from the verified element and required to equal the tenant's issuer. |
| `Signature` | The identity provider's signature over the Assertion alone. | `<ds:Signature>...</ds:Signature>` as a child of the Assertion | Step 3, `covered_by_verified_signature`: its own or the Response's, never neither. |
| `Subject/NameID` | The user's identifier, the value the account is linked by. | `<saml:NameID Format="...persistent">p-8c21e0</saml:NameID>` | Step 6, must be present and in the format agreed at setup, and carried with its qualifiers. Never matched on email. |
| `NameID/@Format` | What kind of identifier `NameID` is: a stable opaque one, a one-time one, an email address, or unspecified. | `Format="urn:oasis:names:tc:SAML:2.0:nameid-format:persistent"` | Step 6, must equal the tenant's configured format. |
| `NameID/@NameQualifier`, `@SPNameQualifier` | Which identity provider and which service provider the identifier belongs to. Part of the identity, not decoration. | `NameQualifier="https://idp.example.com" SPNameQualifier="https://partner.example.net"` | Carried into `LoginResult.subject`. A value without them is a different identity. |
| `SubjectConfirmation/@Method` | How the receiver may confirm that the sender of this Assertion is its subject. For browser SSO it is always `bearer`: whoever holds it is taken to be the user. | `Method="urn:oasis:names:tc:SAML:2.0:cm:bearer"` | Step 4 reads the bearer confirmation, and any other method is not this profile. |
| `SubjectConfirmationData/@Recipient` | The exact address the Assertion may be handed in at. | `Recipient="https://partner.example.net/saml/acs"` | Step 4, must equal our ACS URL. |
| `SubjectConfirmationData/@NotOnOrAfter` | The moment after which the Assertion may no longer be handed in. Required. | `NotOnOrAfter="2026-09-27T16:05:00Z"` | Step 4 requires it to be present, and step 5 requires it to be in the future within skew. |
| `SubjectConfirmationData/@NotBefore` | A start time for handing it in. Must not be present on a bearer confirmation. | absent | Step 4, `bearer_must_nots`, refused if present. |
| `SubjectConfirmationData/@InResponseTo` | The ID of the request this confirmation answers. | `InResponseTo="_req5f3a"` | Step 4, must be absent on the unsolicited path, and must equal the remembered request ID on the solicited path. |
| `Conditions/@NotBefore`, `@NotOnOrAfter` | The period during which the Assertion as a whole is valid. Optional at both ends. | `NotBefore="2026-09-27T15:59:00Z" NotOnOrAfter="2026-09-27T16:05:00Z"` | Step 5, each enforced with skew when present. |
| `AudienceRestriction/Audience` | Who the Assertion is meant for. May appear more than once. | `<saml:Audience>https://partner.example.net</saml:Audience>` | Step 4, every restriction on its own must contain our entity ID. |
| Any other `Condition` | A rule the identity provider attached. `OneTimeUse`, shown in Listing 3, is a standard one this handler understands, since its replay cache at step 7 is exactly what `OneTimeUse` asks for. A condition the handler cannot evaluate, an extension type it has never seen, is the refused case. | `<saml:OneTimeUse/>` (understood) and `<saml:Condition xsi:type="acme:DeviceCondition"/>` (not) | Step 5, `conditions_not_understood` is a refusal, and an unevaluable condition makes the Assertion indeterminate. |
| `AuthnStatement/@AuthnInstant` | The time the user actually logged in at the identity provider, which may be well before this Assertion was made. | `AuthnInstant="2026-09-27T15:58:30Z"` | Step 6, against the tenant's `max_age` when it has one. |
| `AuthnStatement/@SessionIndex` | The identity provider's name for the user's session there, quoted back at logout. | `SessionIndex="s-77"` | Carried into `LoginResult.session_index`. Not a refusal. |
| `AuthnStatement/@SessionNotOnOrAfter` | When the user's session at the identity provider will end. | `SessionNotOnOrAfter="2026-09-28T00:00:00Z"` | Carried into `LoginResult.session_ends` as the ceiling on the partner session. Not a refusal. |
| `AuthnContext/AuthnContextClassRef` | How strongly the user was authenticated, as a named level the two sides agreed on: a password over TLS, a password plus a second factor, a hardware key. The identity provider states which level this login met. | `urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport` | Step 6, must be in the tenant's `acr_values` when it has them. |
| `AttributeStatement` | Facts about the user the identity provider chose to share: name, email, groups. | `<saml:Attribute Name="mail"><saml:AttributeValue>ada@customer-a.example</saml:AttributeValue></saml:Attribute>` | Not checked by the handler. Read after the session starts, from the verified element only. |

The Response issuer rule and the bearer confirmation's end-and-no-start
are Web Browser SSO Profile section 4.1.4.2, the issuer rule as amended by
erratum E17. Every assertion delivered
by POST must be covered by a signature, its own or the Response's,
profile 4.1.4.5 as amended by erratum E26. Every audience restriction is
evaluated on its own, Core 2.5.1.4. An unevaluable condition makes the
assertion indeterminate, Core 2.5.1.1. The replay cache is keyed to the
bearer window, profile 4.1.4.5. `RelayState` is limited to 80 bytes by
the bindings specification. Identifier uniqueness is Core 1.3.4 and all
time values being UTC is Core 1.3.3. `Destination` is optional, and
when present the receiver must check it against the address the
message arrived at, Core 3.2.2. The rule that a signed message must
carry it is the HTTP-POST binding's, Bindings 3.5.5.2.

## The OIDC authorization response

The redirect back to the callback, by GET or by `form_post`. The handler
is [`handle_callback`](/blog/sso-for-integrations/#sp-initiated-the-baseline),
and the third-party-initiated flow ends in the same one.

```text Listing 4: the callback as the browser delivers it, the query string split one parameter per line
GET /sso/callback
  ?code=SplxlOBeZQQYbYS6...
  &state=Q4w9pLm2...
  &iss=https%3A%2F%2Fidp.customer-a.example
Host: app.partner.example
Cookie: __Host-pending=9c1f...
```

Why a GET. The identity provider finishes the login on its own site and
has to get the browser back to the partner's callback, and the
ordinary tool a server has for that is a redirect, an HTTP 302 with a
Location header. The request being redirected is the browser's own GET
of the authorization endpoint, and a browser follows a 302 to a GET, so
the code and the state arrive in the query string. That is OAuth's
default `response_mode=query`. The identity provider never
talks to the callback itself. The browser does, carrying what the
identity provider put in the URL. The cost is a URL's. The code is
visible in browser history and access logs, which the protocol accepts
because the code is single-use, short-lived, and useless without the
PKCE code verifier. The alternative is `response_mode=form_post`, where the
identity provider returns a small page whose form auto-submits a POST
to the callback, the same shape as SAML's HTTP-POST binding, and the
handler accepts both. A top-level GET carries the partner's `Lax`
cookies and a cross-site POST does not, which is why the pending cookie
is `SameSite=None` and why the SAML path needs the [stash and bounce](/blog/sso-for-integrations/#saml-idp-initiated), the extra hop the mechanics post adds so a cross-site POST ends in a top-level GET that carries the cookie.

The error form of the same arrival replaces `code` with
`error=login_required` and keeps `state`, so the handler can still find
the request it answers.

```http Listing 5: the code exchange at the token endpoint, step 4, with the PKCE code verifier
POST /token HTTP/1.1
Host: idp.customer-a.example
Authorization: Basic cGFydG5lci1hcHA6czNjcjN0
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
  &code=SplxlOBeZQQYbYS6...
  &redirect_uri=https%3A%2F%2Fapp.partner.example%2Fsso%2Fcallback
  &client_id=partner-app
  &code_verifier=dBjftJeZ4CVP...
```

The body is one line on the wire, the five parameters joined by `&`.
It is split here so each can be found.

```json Listing 6: the token endpoint's answer, where the ID token arrives
{
  "access_token": "2YotnFZFEjr1zCsicMWpAA",
  "token_type": "Bearer",
  "expires_in": 300,
  "id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjIwMjYtMDkiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOi...dmVyaWZpZWQiOnRydWV9.signature"
}
```

The partner, not the browser, makes this request, server to server,
authenticating as the client (here with HTTP Basic, but a private-key JWT
is the stronger option). `code_verifier` is PKCE's code verifier, the
secret the partner made at `start_login` and kept in the pending record
(the mechanics post's code stores it as `pkce_verifier`, and the wire
parameter name is `code_verifier`, from RFC 7636). The identity provider
hashes it and compares the result with the `code_challenge` the
request in Listing 12 carried, and refuses the exchange on a mismatch.
`redirect_uri` must be the one the request carried. The `id_token` in
the answer is Listing 7.

| Parameter | What it is | Example | Refused by |
|---|---|---|---|
| `state` | A random value the partner made when it sent the user off to log in, now coming back unchanged. It finds the request this response belongs to. | `state=Q4w9pLm2...` | Step 1, `pop_pending_login` by `state`. Nothing pending means refusal. |
| `code` | A one-time ticket. The partner trades it at the token endpoint for the ID token, once. | `code=SplxlOBeZQQYbYS6...` | Step 4, must be present, then exchanged with the same `redirect_uri` the request carried. |
| `iss` | The identity provider saying which issuer sent this response, so a response from the wrong one is caught before the code is used. | `iss=https://idp.customer-a.example` | Step 2: must equal the tenant's issuer, and must be present when the tenant advertises it. A missing `iss` from an IdP that advertises it is the attack. |
| `error`, `error_description` | The identity provider declined, and why. `login_required` and its siblings arrive here. | `error=login_required` | Step 3, `fail(known_error(...))`, which answers with a page and never redirects. The one exception is `login_required` after a `prompt=none` attempt, which is retried once without `prompt=none`. |

The `iss` rule is RFC 9207 section 2.4. One callback path per issuer is
the alternative RFC 9700 section 4.4.2 allows, and the handler requires
it for a tenant that does not send `iss`. The token endpoint's response
is checked at step 4, where an ID token must be present and
`token_type` must be `Bearer`, Core 3.1.3.3.

## The ID token

Returned by the token endpoint in the code flow. Verified at step 5
with the tenant's keys, then read claim by claim at step 6.

```text Listing 7: an ID token as the token endpoint returns it, split at the two dots and decoded
header     eyJhbGciOiJSUzI1NiIsImtpZCI6IjIwMjYtMDkiLCJ0eXAiOiJKV1QifQ
           {"alg": "RS256", "kid": "2026-09", "typ": "JWT"}

payload    eyJpc3MiOiJodHRwczovL2lkcC5jdXN0b21lci1hLmV4YW1wbGUiLCJhdWQiOiJwYXJ0bmVyLWFwcCIsInN1YiI6IjBhN2UuLi4iLCJub25jZSI6IjdmQTJrelI4Li4uIiwiYXV0aF90aW1lIjoxNzkwNTI0NzEwLCJhY3IiOiJodHRwczovL2lkcC5jdXN0b21lci1hLmV4YW1wbGUvYWNyL21mYSIsImlhdCI6MTc5MDUyNDgwMCwiZXhwIjoxNzkwNTI4NDAwLCJzaWQiOiJzLTc3IiwiZW1haWwiOiJhZGFAY3VzdG9tZXItYS5leGFtcGxlIiwiZW1haWxfdmVyaWZpZWQiOnRydWV9
           {
             "iss": "https://idp.customer-a.example",
             "aud": "partner-app",
             "sub": "0a7e...",
             "nonce": "7fA2kzR8...",
             "auth_time": 1790524710,
             "acr": "https://idp.customer-a.example/acr/mfa",
             "iat": 1790524800,
             "exp": 1790528400,
             "sid": "s-77",
             "email": "ada@customer-a.example",
             "email_verified": true
           }

signature  the RS256 signature over header.payload, base64url, verified with the key kid names
```

The three segments travel joined by dots as one string, the `id_token`
member of the token endpoint's JSON response, beside `access_token` and
`token_type`. The header is the first segment, and `alg`, `kid` and
`typ` live there, not among the claims. `typ` is `JWT` for an ID token when present, which Core doesn't require,
and the two tokens below use it to say what they are.

| Claim | What it is | Example | Refused by |
|---|---|---|---|
| `alg` (header) | Which signature algorithm signed the token. | `"alg": "RS256"` | Step 5, pinned per tenant in configuration, asymmetric only. |
| `kid` (header) | Which of the identity provider's published keys signed it. | `"kid": "2026-09"` | Step 5, `tenant.key_for(kid, alg)`: an unknown `kid` triggers one rate-limited re-fetch. No `kid` gets the one key of that algorithm, or fails. |
| `iss` | The identity provider that made the token. | `"iss": "https://idp.customer-a.example"` | Step 6, must equal the tenant's issuer. |
| `aud` | Who the token is for: one client id, or a list of them. | `"aud": "partner-app"` | Step 6, must contain our client id, and must contain no audience we do not trust. |
| `azp` | The authorized party, the client the token was issued to. Core errata set 2 reduced it to that definition and says a client not using an extension that needs it can ignore it. | `"azp": "partner-app"` | Step 6, when present must equal our client id. Its role was softened by Core errata set 2, so the trusted-audience line carries the weight. |
| `nonce` | The random value the partner put in its request, copied into the signed token so the token can only answer that request. | `"nonce": "7fA2kzR8..."` | Step 6, must equal the pending request's nonce, which must itself be set. |
| `sub` | The user's identifier, stable for that user at that identity provider. | `"sub": "0a7e..."` | Step 6, required, and carried as the subject with its issuer. Never email. |
| `iat` | The time the token was made, in seconds since 1970. | `"iat": 1790524800` | Step 6, required, and `now` must be at or after `iat` minus skew. |
| `exp` | The time after which the token is no longer valid. | `"exp": 1790528400` | Step 6, required, and `now` must be before `exp` plus skew. |
| `nbf` | The time before which the token is not yet valid. Optional in an ID token. | `"nbf": 1790524800` | Step 6, binding when present, RFC 7519 section 4.1.5. |
| `auth_time` | The time the user actually logged in, which may be well before the token was made. Required when the request sent `max_age`. | `"auth_time": 1790524710` | Step 6, must be present and recent enough when the pending request carried `max_age`. |
| `acr` | How strongly the user was authenticated, as a named level the identity provider and the partner agreed on. A password alone, a password plus a second factor, and a hardware key each have a name. This claim says which one the login met. | `"acr": "https://idp.customer-a.example/acr/mfa"` | Step 6, must be in the requested `acr_values` when the request carried any. |
| `sid` | The identity provider's name for the user's session there, quoted back in a logout token. | `"sid": "s-77"` | Carried into `LoginResult.sid`. Not a refusal. An identity provider may include it whenever it likes, but registering `backchannel_logout_session_required` is what makes it required. |
| `email`, `email_verified`, profile claims, and anything else | Facts about the user. OpenID Connect defines a standard set (name, picture, locale, phone, address, under the `profile`, `email`, `phone` and `address` scopes) and leaves the set open, so an identity provider can add any claim it likes, and does: groups, roles, tenant, employee IDs. What arrives is decided at the identity provider, by the scopes the partner asked for and by its own release policy for that client. | `"email": "ada@customer-a.example", "email_verified": true, "groups": ["analysts"]` | Not checked by the handler. `email_verified` matters once, at the single first-login match [the account contract](/blog/sso-for-integrations/#the-account-contract) allows. |

Everything in those claims is personal data, and an ID token is a
credential that teams log the way they would never log a password, in
debug output, in error reports that attach the request, in a gateway's
access log, in a trace. Never log the raw token. Log `iss`, `sub`,
`jti` or a hash of the token, `aud` and `exp`, and nothing else. Ask
for `openid` and only the scopes you need. Take profile data from the
UserInfo endpoint after login (Core 5.3) rather than inside the token,
so the token stays small and the data does not travel in a bearer
artifact through the browser. Where the identity provider supports it,
use pairwise `sub` values (Core 8.1) so the identifier itself does not
correlate the user across partners. If personal data must travel in
the token and must not be readable in transit, the ID token can be
encrypted (a JWE), which is OpenID Connect's version of the encrypted
Assertion in Listing 2. SAML's `AttributeStatement` has the same
exposure and the same remedy.

The audience and `azp` rules are Core 3.1.3.7 incorporating errata set
2. The client must reject an ID token that does not list it as an
audience or that lists an audience it does not trust. `azp`, when
present, is validated as the extension that put it there specifies.
The standard claims and the open set are Core 5.1 and 5.1.2.

## The logout token

Arrives by POST at the back-channel logout URI as a form parameter
named `logout_token`. The handler is
[`backchannel_logout`](/blog/sso-for-integrations/#single-logout), and it
validates the token the way an ID token is validated before it looks
for a session.

```http Listing 8: the back-channel logout request, identity provider to partner
POST /oidc/backchannel-logout HTTP/1.1
Host: app.partner.example
Content-Type: application/x-www-form-urlencoded

logout_token=eyJhbGciOiJSUzI1NiIsImtpZCI6IjIwMjYtMDkiLCJ0eXAiOiJsb2dvdXQrand0In0.eyJpc3MiOiJodHRwczovL2lkcC5jdXN0b21lci1hLmV4YW1wbGUiLCJhdWQiOiJwYXJ0bmVyLWFwcCIsImlhdCI6MTc5MDUyNDgwMCwiZXhwIjoxNzkwNTI0OTIwLCJqdGkiOiJsby00ZDFlIiwic2lkIjoicy03NyIsImV2ZW50cyI6eyJodHRwOi8vc2NoZW1hcy5vcGVuaWQubmV0L2V2ZW50L2JhY2tjaGFubmVsLWxvZ291dCI6e319fQ.signature-omitted
```

```text Listing 9: the logout token in Listing 8, split at the two dots and decoded
header     eyJhbGciOiJSUzI1NiIsImtpZCI6IjIwMjYtMDkiLCJ0eXAiOiJsb2dvdXQrand0In0
           {"alg": "RS256", "kid": "2026-09", "typ": "logout+jwt"}

payload    eyJpc3MiOiJodHRwczovL2lkcC5jdXN0b21lci1hLmV4YW1wbGUiLCJhdWQiOiJwYXJ0bmVyLWFwcCIsImlhdCI6MTc5MDUyNDgwMCwiZXhwIjoxNzkwNTI0OTIwLCJqdGkiOiJsby00ZDFlIiwic2lkIjoicy03NyIsImV2ZW50cyI6eyJodHRwOi8vc2NoZW1hcy5vcGVuaWQubmV0L2V2ZW50L2JhY2tjaGFubmVsLWxvZ291dCI6e319fQ
           {
             "iss": "https://idp.customer-a.example",
             "aud": "partner-app",
             "iat": 1790524800,
             "exp": 1790524920,
             "jti": "lo-4d1e",
             "sid": "s-77",
             "events": { "http://schemas.openid.net/event/backchannel-logout": {} }
           }

signature  the RS256 signature over header.payload, base64url
```

| Claim | What it is | Example | Refused by |
|---|---|---|---|
| `typ` (header) | A label saying what kind of token this is, so it cannot be mistaken for an ID token. Recommended. | `"typ": "logout+jwt"` | Step 1, when present must equal `logout+jwt` as a media type. |
| `iss` | The identity provider that made the token. Selects the tenant's keys before verification, re-read after. | `"iss": "https://idp.customer-a.example"` | Step 2, must equal the tenant's issuer. |
| `aud` | Which client the token is for. | `"aud": "partner-app"` | Step 2, must contain our client id and no untrusted audience, and `azp` when present must equal our client id. |
| `iat` | The time the token was made. | `"iat": 1790524800` | Step 2, required, within skew. |
| `exp` | The time after which it is no longer valid. | `"exp": 1790524920` | Step 2, required, within skew. |
| `jti` | A unique name for this token. It is the replay key, the value remembered so the same token is refused a second time. | `"jti": "lo-4d1e"` | Step 3, `seen_jti.add_if_absent`, kept until `exp` plus skew. |
| `events` | A marker saying this token announces a logout, and nothing else. Must contain the back-channel logout key with an object value. | `"events": {"http://schemas.openid.net/event/backchannel-logout": {}}` | Step 3, refused otherwise. |
| `nonce` | Must not be present. Its presence would mean an ID token is being passed off as a logout token. | absent | Step 3, refused if present. |
| `sid` | The session to end, the same value the ID token carried at login. | `"sid": "s-77"` | Step 3, `sid` or `sub` must be present, and step 4 ends the session by `sid` when it is. |
| `sub` | The user whose sessions to end when no `sid` is given. | `"sub": "0a7e..."` | Step 3, `sid` or `sub`. Step 4 ends every session for the subject when only `sub` is present. When both are present the session found by `sid` must belong to `sub`. |

Validating the token as an ID token is Back-Channel Logout section
2.6. The response is section 2.8, `200` when the session is gone
(`204` tolerated), `400` when the request was invalid or the logout
failed, with `Cache-Control: no-store`. The `sid` at login is optional
for the identity provider until the client registers
`backchannel_logout_session_required`, which makes it required.

## The launch token

The signed handoff's token, minted by the platform and carried in a
POST body to the partner's launch endpoint. The handler is
[`accept_launch_token`](/blog/sso-for-integrations/#the-signed-handoff).
This one you mint, so every field is yours to define, and the checks can be stricter than you'd apply to a token from outside.

```http Listing 10: the launch, platform to partner, as the browser posts it
POST /launch HTTP/1.1
Host: partner.example.net
Origin: https://platform.example.com
Content-Type: application/x-www-form-urlencoded

token=eyJhbGciOiJFUzI1NiIsImtpZCI6ImxhdW5jaC0yMDI2LTA5IiwidHlwIjoibGF1bmNoK2p3dCJ9.eyJpc3MiOiJodHRwczovL3BsYXRmb3JtLmV4YW1wbGUuY29tIiwiYXVkIjoiaHR0cHM6Ly9wYXJ0bmVyLmV4YW1wbGUubmV0Iiwic3ViIjoiYTFmOWQyYzQiLCJpYXQiOjE3OTA1MjQ4MDAsImV4cCI6MTc5MDUyNDg2MCwianRpIjoiOWMyZTFmNGEtN2IzZC00ZThmLTlhMWItMmMzZDRlNWY2YTdiIiwidGFyZ2V0IjoiL3JlcG9ydHMvNDIifQ.signature-omitted
```

```text Listing 11: the launch token in Listing 10, split at the two dots and decoded
header     eyJhbGciOiJFUzI1NiIsImtpZCI6ImxhdW5jaC0yMDI2LTA5IiwidHlwIjoibGF1bmNoK2p3dCJ9
           {"alg": "ES256", "kid": "launch-2026-09", "typ": "launch+jwt"}

payload    eyJpc3MiOiJodHRwczovL3BsYXRmb3JtLmV4YW1wbGUuY29tIiwiYXVkIjoiaHR0cHM6Ly9wYXJ0bmVyLmV4YW1wbGUubmV0Iiwic3ViIjoiYTFmOWQyYzQiLCJpYXQiOjE3OTA1MjQ4MDAsImV4cCI6MTc5MDUyNDg2MCwianRpIjoiOWMyZTFmNGEtN2IzZC00ZThmLTlhMWItMmMzZDRlNWY2YTdiIiwidGFyZ2V0IjoiL3JlcG9ydHMvNDIifQ
           {
             "iss": "https://platform.example.com",
             "aud": "https://partner.example.net",
             "sub": "a1f9d2c4",
             "iat": 1790524800,
             "exp": 1790524860,
             "jti": "9c2e1f4a-7b3d-4e8f-9a1b-2c3d4e5f6a7b",
             "target": "/reports/42"
           }

signature  the ES256 signature over header.payload, base64url, verified with the platform key kid names
```

| Claim | What it is | Example | Refused by |
|---|---|---|---|
| `typ` (header) | A label saying what kind of token this is, so it can never be read as an access token signed with the same keys. | `"typ": "launch+jwt"` | Step 1, must equal `launch+jwt` as a media type, RFC 7515 section 4.1.9. |
| `alg`, `kid` (header) | The signature algorithm, and which platform key signed it. | `"alg": "ES256", "kid": "launch-2026-09"` | Step 2, algorithm pinned, and `kid` always present because we mint it. |
| `iss` | The platform, as the party that made the token. | `"iss": "https://platform.example.com"` | Step 3, must equal the platform issuer. |
| `aud` | The partner the token is for, exactly one, the same string the partner uses as its client id at the platform's token exchange endpoint. | `"aud": "https://partner.example.net"` | Step 3, must equal our audience and nothing else. |
| `sub` | The user, as the platform names them. | `"sub": "a1f9d2c4"` | Step 3, required. |
| `iat`, `exp` | When it was made and when it stops being valid. A window of seconds, two minutes at the most. | `"iat": 1790524800, "exp": 1790524860` | Step 3, both required, `now` inside the window with skew, and `exp - iat` no more than 120 seconds. |
| `nbf` | The time before which it is not yet valid. | `"nbf": 1790524800` | Step 3, binding when present. |
| `jti` | A unique name for this token. It is the replay key, the value remembered so the same token is refused a second time. | `"jti": "9c2e1f4a-7b3d-4e8f-9a1b-2c3d4e5f6a7b"` | Step 4, `seen_jti.add_if_absent`, kept until `exp` plus skew. |
| `target` | Where in the partner's application the user should land, as a path. | `"target": "/reports/42"` | Step 5, must start with `/`, not `//`, contain no backslash, and match a route on the partner's list. |
| Anything about authority | What the user is allowed to do. A role at most, never a list of permissions. | `"role": "analyst"` | Not checked by the handler, but [the account contract](/blog/sso-for-integrations/#the-account-contract) forbids permissions crossing. |

The POST itself is checked before the token is. The request must be a
POST, and its `Origin` header must be the platform's own origin, which
is enforced rather than logged because the platform, unlike a customer
IdP, is yours.

## The authentication request, for completeness

The partner sends these. Nothing refuses them on the way out, but each
one is the reason a field above can be checked on the way back.

```text Listing 12: the OIDC authentication request, one parameter per line, with every field the table names
GET https://idp.customer-a.example/authorize
  ?response_type=code
  &client_id=partner-app
  &redirect_uri=https%3A%2F%2Fapp.partner.example%2Fsso%2Fcallback
  &scope=openid%20profile%20email
  &state=Q4w9pLm2...
  &nonce=7fA2kzR8...
  &code_challenge=E9Melhoa2Owv...
  &code_challenge_method=S256
  &max_age=300
  &acr_values=https%3A%2F%2Fidp.customer-a.example%2Facr%2Fmfa
  &prompt=none
  &login_hint=ada%40customer-a.example
```

On the wire the parameters are one query string on one line. They are
split here so each can be found. A real request carries `prompt=none`
only on the silent attempt and `login_hint` only when the identity
provider supplied one, but both are shown so the table's rows have an
example.

```xml Listing 13: the SAML AuthnRequest, decoded from the SAMLRequest parameter, with every field the table names
<samlp:AuthnRequest ID="_req5f3a" Version="2.0" IssueInstant="2026-09-27T15:58:00Z"
    Destination="https://idp.example.com/sso"
    AssertionConsumerServiceURL="https://partner.example.net/saml/acs"
    ProtocolBinding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
    ForceAuthn="true" IsPassive="false">
  <saml:Issuer>https://partner.example.net</saml:Issuer>
  <samlp:NameIDPolicy Format="urn:oasis:names:tc:SAML:2.0:nameid-format:persistent" AllowCreate="false"/>
  <samlp:RequestedAuthnContext Comparison="minimum">
    <saml:AuthnContextClassRef>urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport</saml:AuthnContextClassRef>
  </samlp:RequestedAuthnContext>
</samlp:AuthnRequest>
```

The AuthnRequest travels deflated and base64-encoded as the
`SAMLRequest` query parameter of a redirect, with `RelayState=orders`
as a second parameter beside it. `ForceAuthn` and `IsPassive` are both
shown so the table's rows have an example. Setting both to `true` is
allowed by Core 3.4.1 and pointless, since the identity provider may
then not authenticate afresh unless it can do so silently.

| Protocol | Field | What it is | Example | Comes back as |
|---|---|---|---|---|
| OIDC | `state` | A random value that ties the answer to this request. | `state=Q4w9pLm2...` | `state` in the authorization response. |
| OIDC | `nonce` | A random value that ties the ID token to this request. | `nonce=7fA2kzR8...` | `nonce` in the ID token. |
| OIDC | `code_challenge`, `code_challenge_method=S256` | A hash of a secret only the partner holds, the PKCE code verifier, so a stolen code cannot be exchanged by anyone else. The verifier itself is sent later, as `code_verifier` at the token endpoint (Listing 5). | `code_challenge=E9Melhoa2Owv...&code_challenge_method=S256` | The token endpoint refuses a code exchanged without the matching verifier. |
| OIDC | `redirect_uri` | The address the answer must be sent to. | `redirect_uri=https://app.partner.example/sso/callback` | The token endpoint refuses a code exchanged with a different one. |
| OIDC | `max_age` | How recently the user must have logged in, in seconds. | `max_age=300` | `auth_time` in the ID token, required and checked. |
| OIDC | `acr_values` | Which authentication levels the partner will accept. | `acr_values=https://idp.customer-a.example/acr/mfa` | `acr` in the ID token, checked. |
| OIDC | `prompt=none` | Log the user in silently or say why not. Never show a page. | `prompt=none` | `error=login_required` (or a sibling) instead of a login page. Retried once without it. |
| OIDC | `login_hint` | A suggestion of which user this is, for the identity provider to prefill. | `login_hint=ada%40customer-a.example` | Nothing. A hint. In the third-party-initiated flow, `initiate_login` forwards the one the identity provider sent. |
| SAML | `AuthnRequest/@ID` | A unique name for this request. | `ID="_req5f3a"` | `InResponseTo` on the Response and on the bearer confirmation. |
| SAML | `ForceAuthn` | Make the user log in again even if they have a session. | `ForceAuthn="true"` | A fresh `AuthnInstant`. |
| SAML | `RequestedAuthnContext` | Which authentication levels the partner will accept. | `<saml:AuthnContextClassRef>urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport</saml:AuthnContextClassRef>` inside `RequestedAuthnContext` | `AuthnContextClassRef`, checked. |
| SAML | `IsPassive` | Log the user in silently or say why not. Never show a page. | `IsPassive="true"` | A `NoPassive` status instead of a login page. Retried once without it. |
| SAML | `RelayState` | Where in the application the user should land afterwards. | `RelayState=orders` | `RelayState`, unchanged, beside the Response. |
