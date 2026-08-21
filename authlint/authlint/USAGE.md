# Using authlint

A complete guide. If you only want the short version: paste something into the
box, read the findings top to bottom, and stop when you run out of red.

- [Getting it](#getting-it)
- [The basic loop](#the-basic-loop)
- [What you can paste](#what-you-can-paste)
- [Reading a result](#reading-a-result)
- [Severities, and what they actually mean](#severities-and-what-they-actually-mean)
- [Worked examples](#worked-examples)
- [Using it during an incident](#using-it-during-an-incident)
- [Using it in a review](#using-it-in-a-review)
- [Using it to teach](#using-it-to-teach)
- [Privacy, precisely](#privacy-precisely)
- [Limits, and what they mean for you](#limits-and-what-they-mean-for-you)
- [Troubleshooting](#troubleshooting)
- [Every check, by artifact](#every-check-by-artifact)
- [FAQ](#faq)

---

## Getting it

**In a browser:** <https://roniam.dev/authlint/>

**On your machine**, which is the way to use it with anything real:

```bash
curl -O https://roniam.dev/authlint/index.html
open index.html          # macOS.  xdg-open on Linux, start on Windows
```

That file is the whole tool. There is no server component, no build step, no
package to install. Copy it onto a USB stick, carry it into an air-gapped
environment, open it there. It behaves identically, because it never needed the
network in the first place.

**From the repository:**

```bash
git clone https://github.com/rcbart/authlint
cd authlint
open dist/index.html
```

To confirm for yourself that it does what it says:

```bash
npm ci
npm test                      # the checks, against the files in src/
node scripts/verify-dist.js   # dist matches src, and contains no network calls
```

---

## The basic loop

1. Paste into the box. One box, whatever you have.
2. authlint works out what it is and says so above the results.
3. Read the findings. They are sorted worst first.
4. Read the **Decoded** section underneath if you want to see the raw content.

Nothing to configure, no mode to select, no file to upload. It re-runs as you
type, so correcting a truncated paste updates the result immediately.

---

## What you can paste

| You have | Paste it | authlint calls it |
|---|---|---|
| A JWT | the raw token, three dot-separated segments | JSON Web Token |
| An ID token | same | OpenID Connect ID token |
| A JWT access token | same | OAuth 2.0 access token (JWT) |
| An encrypted token | a five-segment JWE | Encrypted JWT (JWE) |
| An `Authorization` header | `Bearer eyJ...` or the whole header line | JSON Web Token |
| A key set | the JSON from `jwks_uri` | JSON Web Key Set |
| A single key | one JWK object | JSON Web Key Set |
| Provider configuration | the JSON from `/.well-known/openid-configuration` | OpenID Connect discovery document |
| A login URL | the whole authorization URL | OAuth 2.0 authorization request |
| A callback URL | the redirect back to your app, query or fragment | OAuth 2.0 redirect (callback) |
| Just the parameters | `response_type=code&client_id=...` | OAuth 2.0 authorization request |
| A SAML response | the XML, or the base64 from the POST body | SAML response |
| A SAML request | the `AuthnRequest` XML | SAML authentication request |
| SAML metadata | the `EntityDescriptor` XML | SAML metadata |

You never say which. Detection runs on shape, and the detected type is printed
above the findings so you can tell immediately if it guessed wrong.

### Where to find each of these

- **A JWT in a browser session:** DevTools, Application, Local Storage or
  Cookies. Or the Network tab, any request, the `Authorization` request header.
- **An authorization request:** start a login and copy the URL from the address
  bar the moment you land on the provider. Or DevTools, Network, tick *Preserve
  log*, and look for the request to `/authorize`.
- **A discovery document:** `curl https://YOUR-ISSUER/.well-known/openid-configuration`
- **A JWKS:** the `jwks_uri` value out of that discovery document.
- **A SAML response:** DevTools, Network, *Preserve log*, do the login, find the
  `POST` to your assertion consumer service, and copy the `SAMLResponse` form
  field. It is base64, and authlint decodes it for you.

---

## Reading a result

A result has three parts.

**The type line** tells you what authlint decided you pasted. If this is wrong,
everything below it is answering the wrong question. It happens most often with
truncated pastes.

**The tallies** are the count by severity. This is the number to glance at, not
to optimise. A discovery document with three notes and no criticals is in better
shape than one with zero findings because it was truncated.

**The findings**, worst first. Each one has up to four parts:

- **The finding.** What is true about this artifact.
- **Why it matters.** What actually goes wrong. Not a definition of the field:
  if a finding tells you what `aud` means rather than what happens when it is
  missing, that is a bug, please report it.
- **Fix.** What to change. Absent when the finding is informational.
- **The reference.** The RFC section, specification clause or advisory it comes
  from, so you can take it to someone who wants the citation.

Below the findings, **Decoded** shows the content itself: header and payload for
a JWT with the time claims resolved to readable dates, the parameter table for a
URL, indented XML for SAML.

---

## Severities, and what they actually mean

**Critical** — exploitable, or broken right now. `alg: none`. A signed response
wrapping an unsigned assertion. A shared secret in a public key set. A client
secret in a browser URL. If you are triaging, this is the whole list.

**Warning** — will bite you, or is a bad default that someone should own. A
seven-day access token. An email address as `sub`. SHA-1 digests. None of these
is on fire today. All of them are the reason for a future incident, and they are
the findings worth putting in a backlog rather than a ticket.

**Note** — worth knowing, and often entirely deliberate. Transient `NameID`. No
revocation endpoint. IdP-initiated SAML. These are design decisions, and
authlint's job is to make sure they were decisions rather than accidents.

**Pass** — an explicit confirmation, shown only for the things people actually
worry about. PKCE with S256. A signed assertion. A certificate with life left in
it. Passes exist so you can tell the difference between "checked and fine" and
"not checked".

One rule for reading the list: **a clean result is not a security assessment.**
authlint checks what an artifact says and how it is assembled. It cannot see
your verification code, and that is where most real failures live.

---

## Worked examples

### "Login works in staging and fails in production"

Paste the production discovery document. Then paste the staging one. Compare the
findings rather than the JSON, because the JSON differs in a hundred
uninteresting ways.

The one that catches people: **issuer has a trailing slash.** Issuer comparison
is exact string equality. If production publishes `https://id.example.com/` and
your tokens carry `https://id.example.com`, every validation fails, and no error
message anywhere will mention the slash.

### "The token is valid but the API rejects it"

Paste the token. Look for, in this order:

- **Multiple audiences and no azp** — the API may be refusing because it cannot
  confirm the token was issued for it.
- **Access token typed as JWT rather than at+jwt** — a resource server checking
  `typ` will refuse an ID token, and this is how you find out you sent one.
- **Issued in the future** — clock skew. Intermittent, environment-specific, and
  miserable to chase without being told.
- **Expired N ago** — you are debugging yesterday's token.

### "Some users can log in and some cannot"

Paste a working user's token, then a failing user's.

If the failing one reports **Token is 9,412 bytes**, you have found it. Header
limits do not fail gradually. They fail for whoever has accumulated the most
group memberships, which is usually your longest-serving employees, which is
usually the people with the most political weight.

### "We passed the pen test, is our SAML actually fine"

Paste a real SAML response from your own login.

The finding to look for is **the response is signed but the assertion inside it
is not**. Scanners frequently report a signed response as a pass. It is not one:
a service provider that verifies the response and then reads the assertion can
be handed a second, unsigned assertion wrapped into the document, and the
signature still verifies because it still covers the element it always covered.

Also check **No AudienceRestriction**. Without it, an assertion issued for one
service provider is replayable at every other service provider trusting the same
identity provider.

### "Is this login URL safe to hand to a customer"

Paste it. The findings that matter are `client_secret` in the URL, a wildcard or
plaintext `redirect_uri`, `response_type=token`, and no PKCE. Any one of those
is a conversation with whoever owns the client.

---

## Using it during an incident

Open the local copy, not the hosted one. Not because the hosted one is unsafe,
but because during an incident you should not have to explain to anyone why a
production token went to a URL.

The sequence that gets you furthest fastest:

1. **Paste the failing token.** Time claims first. Most "sudden" auth failures
   are an expiry or a clock.
2. **Paste the discovery document.** If it changed, everything downstream
   changed with it.
3. **Paste the JWKS.** A certificate that expired at midnight explains an outage
   that started at midnight.
4. **Paste a working token from before the incident**, if you have one in a log.
   The difference between the two results is usually the answer.

---

## Using it in a review

Paste the authorization request from any new client integration before it ships.
It takes ten seconds and it catches the four things that get missed: no PKCE, no
`state`, a wildcard redirect, and a secret in the front channel.

For a vendor integration, ask them for their metadata or discovery document and
paste it before the first call. `WantAssertionsSigned="false"` in a service
provider's metadata is a thing you would rather learn now.

---

## Using it to teach

The samples exist for this. Load one, work down the findings, and let the
**Why it matters** text do the explaining. Every finding is written to be read
aloud to someone who has not met the field before.

The SAML sample is the best teaching artifact in the tool. It looks completely
normal, it has a valid signature, and it is broken in the way that matters.

---

## Privacy, precisely

Rather than asking you to trust the word "private", here is exactly what is
true, and how to check each claim.

**No network calls.** The page makes none, ever. Open DevTools, go to the Network
tab, and use the tool. You will see the initial document load and nothing else.

**No storage.** Nothing is written to `localStorage`, `sessionStorage`,
`indexedDB` or cookies. Reloading the page loses your input, which is
deliberate.

**No analytics, no telemetry, no error reporting.** There is no third party
involved because there is no third party at all.

**No dependencies.** The shipped file loads no external script, stylesheet or
font. Everything, including the icon, is inline.

**It works offline.** The real test: disconnect, open the saved file, use it.

These are enforced rather than promised. `scripts/verify-dist.js` runs in CI and
fails the build if the shipped file contains `fetch`, `XMLHttpRequest`,
`sendBeacon`, `localStorage`, `sessionStorage`, `indexedDB`, `WebSocket`, an
`Image()` beacon, an external script, or an external stylesheet.

**What you should still do:** use the local copy for production artifacts. Not
because of authlint, but because "I pasted it into a website" is a sentence you
never want to say in an incident review, whatever the website was.

---

## Limits, and what they mean for you

**It does not verify signatures.** This is the important one. Verifying needs the
key, the key needs the network, and the network breaks the only promise the tool
makes. Every result says so.

What this means in practice: authlint can tell you a token *claims* `RS256` and
carries a `kid`. It cannot tell you the signature is valid. **A token with no
findings may still be forged.** Verify in your own code, with the algorithm
pinned to what you expect rather than read from the header, against a key set
you fetched yourself.

**It does not inflate the SAML redirect binding.** Redirect-binding SAML is
DEFLATE compressed, and inflating it would mean a dependency. Use the POST
binding version, which is what you want for debugging anyway.

**It does not decrypt.** A JWE header is readable and its payload is not. An
`EncryptedAssertion` is reported as encrypted, which is a pass, and its contents
are not inspected.

**It does not know your deployment.** It cannot tell you that `aud` is wrong,
only that it is missing or ambiguous. It does not know your entity ID, your
client ID or your issuer. Several findings are of the form "this is unusual,
confirm it is intentional", and that is honest rather than lazy.

**It is not a scanner and not a compliance tool.** No score, no grade, no
certificate. A clean result means the artifact is well formed and free of the
patterns that commonly cause incidents. It does not mean your identity
deployment is secure.

---

## When nothing gets checked

The box takes anything, so there are two different ways for it to come back with
no findings, and they are shown differently on purpose.

**Amber: "This looks like a JWT, but it seems malformed."**

authlint recognised the shape and the document is broken. This is the useful
one. It names the fault as precisely as it can, because most of the time you are
two seconds from the fix:

| What you see | What happened |
| --- | --- |
| There are two segments | The signature was cut off. It is last, so it goes first. |
| There is only one segment | The dots were stripped, usually by a log formatter. |
| The payload segment is not valid base64url | A line break landed in the middle, or the token was URL-encoded on the way. |
| The payload decodes, but the result is not valid JSON | Truncated part way through. The tool shows you what did come out. |
| It parses, but it is not a shape authlint knows | Valid JSON of the wrong kind. Its top-level keys are listed so you can see what you actually have. |
| It has no query string | An authorization URL copied without everything after the `?`. Tick **Preserve log** in the network tab first. |
| It is valid base64, and what comes out is not text | Redirect-binding SAML, which is DEFLATE compressed. Get the POST binding version. |

**Red: "authlint does not recognise this."**

Nothing here is one of the six artifacts. Some of these get a specific answer
rather than a shrug, because they are things people reasonably try:

- **A PEM certificate.** Paste the SAML metadata or the JWKS that carries it, and
  the expiry gets checked in context.
- **A PEM private key.** Refused, and you should not be pasting one into
  anything.
- **A cookie header.** Session cookies are opaque. If one of the values is a JWT,
  paste just that value.
- **An opaque token.** Nothing to decode, by design. Only the issuer's
  introspection endpoint can tell you anything about it.
- **Anything else.** It lists what it does read.

Neither state ever renders your paste as HTML. What comes back quotes claim
names, JSON keys and XML element names from the document, and every one of those
is escaped. That is covered by a browser test.

---

## Troubleshooting

**It says JWT but I pasted something else**

Detection is by shape, and shape is occasionally ambiguous. The type line is
printed exactly so you can catch this. Please open an issue with the input, or
a redacted version of it.

**A finding is wrong**

Please report it. A false positive in a tool like this is worse than a missing
check, because it costs somebody an afternoon proving a non-problem. Include the
artifact, redacted, and what you expected.

---

## Every check, by artifact

### JWT

Header: missing `alg`, `alg: none`, symmetric signing, `jku`, `x5u` and `jwk`
key nomination, missing `kid` on asymmetric algorithms, access tokens typed
`JWT` instead of `at+jwt`, `crit` extensions, empty signature segment.

Time: millisecond timestamps, missing `exp`, expiry in the past, lifetime over a
day, lifetime over a year, issued in the future, not yet valid.

Parties: missing `iss`, non-https `iss`, missing `aud`, multiple audiences with
no `azp`, missing `sub`, email address as `sub`, missing `jti` on a long-lived
token.

Contents: personal data claims, embedded key material, tokens over 4KB and over
8KB, role and group arrays over forty entries, JWE payloads.

Always: the reminder that the signature was not verified.

### JWKS

Symmetric (`oct`) keys, private parameters (`d`, `p`, `q`), missing `kid`,
duplicate `kid`, RSA keys under 2048 bits, embedded certificate expiry, keys
declaring neither `use` nor `key_ops`.

### OpenID Connect discovery

Missing or non-https `issuer`, trailing-slash `issuer`, endpoints on a different
origin, missing or non-https `authorization_endpoint`, `token_endpoint` and
`jwks_uri`, missing PKCE, PKCE without S256, PKCE advertising `plain`, implicit
response types, `none` in ID token algorithms, symmetric ID token algorithms,
shared-secret client authentication, strong client authentication, missing
`end_session_endpoint`, missing `revocation_endpoint`, public-only subject
types, required pushed authorization requests.

### OAuth authorization requests and redirects

Plaintext http, `client_secret` in the URL, tokens in the fragment, missing
`response_type`, implicit and hybrid response types, missing PKCE,
`code_challenge_method` other than S256, missing or short `state`, `id_token`
requested without `nonce`, missing `scope`, OIDC without the `openid` scope,
very broad scopes, long scope lists, wildcard `redirect_uri`, plaintext
`redirect_uri`, fragment in `redirect_uri`, out-of-band redirects, and on the
callback side: provider errors, codes, access tokens in the URL, missing
`state`.

### SAML responses

Status codes, nothing signed, response signed with an unsigned assertion,
multiple assertions, duplicate `ID` attributes, SHA-1 signature and digest
algorithms, missing `AudienceRestriction`, missing `Destination`, missing
`InResponseTo`, missing `Conditions`, missing `NotOnOrAfter`, expired
assertions, validity windows over an hour, missing `Recipient`, email and
transient and unspecified `NameID` formats, password-level `AuthnContext`,
unencrypted personal attributes, signing certificate expiry.

### SAML metadata

Expired `validUntil`, `WantAssertionsSigned="false"`, `AuthnRequestsSigned` not
true, plaintext endpoints, missing certificates, certificate expiry, and
multiple published certificates as evidence of a clean rotation.

---

## FAQ

**Is it safe to paste a production token?**
Into your local copy, yes, and that is the recommended way to work. Into the
hosted page, also yes technically, since the page makes no network calls and you
can confirm that in DevTools. Use the local copy anyway. It costs nothing and it
removes the question.

**Why does it not verify signatures?**
Verification needs the key, keys come from the network, and a network call would
break the one thing that makes this tool different. That trade was deliberate.

**Can I use it in my company?**
Yes. MIT licensed. Host the file internally if you prefer, and there is nothing
to configure if you do.

**Can I add a check?**
Please. Checks are small functions in `src/checks-*.js` and the shape is
documented in the project README. The best contributions are findings that have
personally cost you a weekend.

**Why not a CLI?**
The audience is people holding a token in a browser at an awkward moment. A
paste box meets them there. The check functions are plain JavaScript with no
DOM dependency except the SAML ones, so a CLI is a small piece of work if
someone wants it.

**Is there a warranty?**
No. It is free software under the MIT license, which disclaims warranty and
liability in full. More usefully: a clean result is not a security assessment.
authlint reports what an artifact says and how it is assembled, it does not
verify signatures, and it cannot see your verification code, which is where most
real failures live. Use it only on systems you are authorized to test.

**Who made this?**
[Ron Bar-Tor](https://roniam.dev/), who has spent a long time in identity and
got tired of explaining the same twelve findings.
