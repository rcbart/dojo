STREAMS.push({icon:'🛡️',iam:true,sec:'Advanced OAuth & threats',title:'Advanced OAuth 2.0 & OIDC Threats',blurb:'The hard edges of OAuth in production: token introspection and revocation, the JWT validation checklist, PAR/JAR/RAR, DPoP and mTLS-bound (sender-constrained) tokens, and a catalog of attacks with the defenses from the OAuth Security BCP.',lessons:[

{id:'ao1',title:'Introspection & revocation',body:`
<p>Opaque access tokens carry no data, so a resource server validates them by calling the authorization server&#8217;s <b>introspection</b> endpoint (RFC 7662), which replies with <code>active: true/false</code> plus metadata. <b>Revocation</b> (RFC 7009) lets a client proactively kill a token or refresh token — on logout, or when a device is lost.</p>
<!--flow:ao1-introspection-->
<h4>Token introspection — step by step</h4>
<div class="flowDia"><svg viewBox="0 0 600 252" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Token introspection"><defs><marker id="ao1-introspection-ah-front" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent)"/></marker><marker id="ao1-introspection-ah-back" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent2)"/></marker><marker id="ao1-introspection-ah-attack" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--bad)"/></marker><marker id="ao1-introspection-ah-x" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--muted)"/></marker></defs><line x1="74" y1="54" x2="74" y2="240" class="fdLife"/><line x1="526" y1="54" x2="526" y2="240" class="fdLife"/><rect x="35" y="8" width="78" height="46" rx="8" class="fdActor"/><text x="74" y="27" class="fdActorT">API</text><text x="74" y="42" class="fdActorS">resource server</text><rect x="433" y="8" width="186" height="46" rx="8" class="fdActor"/><text x="526" y="35.5" class="fdActorT">Authorization Server</text><rect x="14" y="89" width="329.59999999999997" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="186.79999999999998" y="104" class="fdSelfT">opaque token arrives — nothing to read locally</text><circle cx="14" cy="100" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="14" y="103.5" class="fdNumT" style="fill:var(--muted)">1</text><line x1="77" y1="138" x2="521" y2="138" stroke="var(--accent2)" class="fdArrow" marker-end="url(#ao1-introspection-ah-back)"/><text x="315" y="129" class="fdLabel">POST /introspect — token + API’s OWN credentials</text><circle cx="92" cy="138" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="92" y="141.5" class="fdNumT" style="fill:var(--accent2)">2</text><line x1="523" y1="168" x2="79" y2="168" stroke="var(--accent2)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#ao1-introspection-ah-back)"/><text x="285" y="159" class="fdLabel">{active:true, sub, scope, exp, aud}</text><circle cx="508" cy="168" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="508" y="171.5" class="fdNumT" style="fill:var(--accent2)">3</text><rect x="14" y="185" width="329.59999999999997" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="186.79999999999998" y="200" class="fdSelfT">cache briefly; treat active:false as a hard no</text><circle cx="14" cy="196" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="14" y="199.5" class="fdNumT" style="fill:var(--muted)">4</text><text x="300" y="222" class="fdNote">Freshness you can revoke, at the price of a network hop — the JWT trade-off inverted.</text></svg></div>
<ol class="fdSteps">
<li><b>API:</b> opaque token arrives — nothing to read locally</li>
<li><b>API → Authorization Server:</b> POST /introspect — token + API’s OWN credentials <i>(back channel)</i></li>
<li><b>Authorization Server → API:</b> {active:true, sub, scope, exp, aud} <i>(back channel)</i></li>
<li><b>API:</b> cache briefly; treat active:false as a hard no</li>
</ol>
<!--/flow:ao1-introspection-->
<p>A token should be treated as usable only when the server both <b>knows it</b> and it has <b>not expired</b> or been revoked. That is the whole point of introspection: expiry alone is not enough, because a token can be revoked before it expires.</p>

<h4>The endpoints, and who may call them</h4>
<div class="codeSample" data-hl>POST /introspect            RFC 7662 - "is this token still good, and what does it mean?"
  token=...&token_type_hint=access_token
  -> { "active": true, "scope": "orders:read", "sub": "ada",
       "aud": "orders-api", "exp": 1767225600, "client_id": "web" }

POST /revoke                RFC 7009 - "stop honouring this"
  token=...&token_type_hint=refresh_token
  -> 200, ALWAYS. even for an unknown token.</div>
<p>Two details people get wrong. <b>Introspection endpoints must be authenticated</b> — an open one is
an oracle that lets anyone test stolen tokens for validity, and leaks scopes and subjects. And
<b>revocation returns 200 even for a token it has never seen</b>, deliberately: distinguishing "revoked"
from "unknown" would turn the endpoint into a token-existence oracle.</p>

<h4>The single field that matters</h4>
<p><code>active</code> is the answer. It is not merely "unexpired" — it is the server asserting the token
is currently honoured: issued by it, not expired, not revoked, and the grant behind it still standing.
A response of <code>{"active": false}</code> carries no other claims, on purpose, so a rejected token
reveals nothing.</p>

<h4>The cost, and the pattern that avoids it</h4>
<p>Introspection is a network call on every request, which is exactly what self-contained tokens exist to
avoid. The common resolution is the <b>split-token</b> (or phantom-token) pattern: hand the browser an
<i>opaque</i> token, and have the gateway introspect it once and forward a short-lived JWT inward. The
outside world gets revocability; the inside gets offline verification.</p>

<h4>What revocation does not do</h4>
<p>Revoking a refresh token does not invalidate access tokens already issued from it — those remain valid
until <code>exp</code>. And revoking one token is not the same as revoking the <b>grant</b>; only the
latter stops future refreshes. "Remove this app's access" means the grant. This is the same gap CAE
exists to close.</p>`,
docs:[['Token introspection (RFC 7662)','https://www.rfc-editor.org/rfc/rfc7662'],['Token revocation (RFC 7009)','https://www.rfc-editor.org/rfc/rfc7009']],
ex:{title:'Interpret an introspection response',lang:'js',
run:{call:'active',cases:[{name:'found and not expired',args:[true,false],expect:true},{name:'found but expired',args:[true,true],expect:false},{name:'not found',args:[false,false],expect:false},{name:'not found and expired',args:[false,true],expect:false}]},
prompt:`Write <code>function active(found, expired)</code> returning <code>true</code> only when the token was found in the authorization server's store <b>and</b> has not expired. Everything else is <code>active: false</code> — introspection deliberately reveals nothing more.`,
starter:`function active(found, expired) {
  return false;
}`,
solution:`function active(found, expired) {
  return found && !expired;
}`,
tests:[{d:'the token must exist',re:'found\\s*&&'},{d:'and must not be expired',re:'!\\s*expired'}],
behavior:`All four combinations are executed. Note what the response does NOT do: a revoked, unknown or malformed token all return the same flat active:false, so an attacker learns nothing from probing.`,
hints:['Two conditions: it exists, and it has not expired.','Use ! for "not expired".','Anything else is inactive — one answer for every failure mode.']}},

{id:'ao2',title:'The JWT validation checklist',body:`
<p>A self-contained JWT access token is only trustworthy if you check it properly. Verifying the signature is necessary but <b>not sufficient</b>. The core checklist: the signature verifies against the issuer&#8217;s key; the <code>iss</code> (issuer) is exactly who you expect; the <code>aud</code> (audience) names <i>your</i> API; and the token is <b>within its lifetime</b> (<code>exp</code> in the future, <code>nbf</code> in the past).</p>
<p>Skipping the audience check is a classic bug: a token minted for another service will still have a valid signature, so without <code>aud</code> you would accept a token that was never meant for you.</p>

<h4>The checklist, in the order that fails fastest</h4>
<div class="codeSample" data-hl>1  alg      PINNED BY YOU, not read from the header. never accept "none",
            never let an RS256 verifier be handed an HMAC token.
2  kid      look up the key in the JWKS you fetched from the issuer you
            configured. NEVER fetch keys from a URL inside the token.
3  sig      verify. if this fails, stop - everything below is attacker text.
4  iss      exact string match against the issuer you expect.
5  aud      does this token name ME? a valid token for another API is not
            a valid token for mine.
6  exp      expired? with a small, bounded clock skew (60s, not 300).
7  nbf/iat  not yet valid? implausibly old?
8  jti      seen before? (only if you keep a replay cache)
9  scope/claims  only NOW do the claims mean anything.</div>
<p>The ordering is not cosmetic. Steps 1&ndash;3 establish that the payload is <i>authentic</i>; every
step after that is reading data you have proven came from the issuer. Reading claims before verifying
the signature — even to decide which key to use — is how <code>alg:none</code> and key-confusion
attacks land.</p>

<h4>The two that are almost always wrong</h4>
<p><b>Trusting the header.</b> The header is attacker-controlled input. Pin the algorithm, and resolve
<code>kid</code> only within keys you already trust. A verifier that fetches a <code>jku</code> from the
token is fetching keys chosen by the attacker.</p>
<p><b>Clock skew.</b> Everyone allows some; many allow far too much. Five minutes of skew is five extra
minutes of life for every stolen token. Sixty seconds is usually plenty, and if it is not, fix the
clocks rather than the validator.</p>

<h4>What the checklist cannot tell you</h4>
<p>A token can pass all nine checks and still be the wrong basis for a decision. It proves <i>who issued
it</i> and <i>who it is for</i> — not that the issuer had authority over the claim, nor that the subject
owns the record being requested. Signature validity is authentication of the token; it is not
authorization.</p>`,
docs:[['JWT best practices (RFC 8725)','https://www.rfc-editor.org/rfc/rfc8725'],['JWT access tokens (RFC 9068)','https://www.rfc-editor.org/rfc/rfc9068']],
ex:{title:'Validate a token offline',lang:'js',
run:{call:'ok',cases:[{name:'right issuer, right audience, unexpired',args:['https://as.example.com','orders-api',2000,1000],expect:true},{name:'wrong issuer',args:['https://evil.example','orders-api',2000,1000],expect:false},{name:'token for another service',args:['https://as.example.com','billing-api',2000,1000],expect:false},{name:'expired',args:['https://as.example.com','orders-api',900,1000],expect:false},{name:'expiring exactly now is expired',args:['https://as.example.com','orders-api',1000,1000],expect:false}]},
prompt:`Write <code>function ok(iss, aud, exp, now)</code> that accepts a token only when the issuer is exactly <code>"https://as.example.com"</code>, the audience is exactly <code>"orders-api"</code>, and <code>exp &gt; now</code>. A token that expires exactly now is expired.`,
starter:`function ok(iss, aud, exp, now) {
  return false;
}`,
solution:`function ok(iss, aud, exp, now) {
  return iss === "https://as.example.com"
      && aud === "orders-api"
      && exp > now;
}`,
tests:[{d:'issuer must match exactly',re:'"https://as\\.example\\.com"'},{d:'audience must be this API',re:'"orders-api"'},{d:'must not be expired',re:'exp\\s*>\\s*now'}],
behavior:`The third case is the one that matters: a perfectly valid token minted by the same issuer for billing-api is rejected here. Skipping the audience check is how one compromised service becomes access to every service — and here it fails a named test rather than a pattern match.`,
hints:['Three conditions joined with &&.','Compare strings with === in JavaScript.','Expiry is strict: exp must be greater than now, not equal.']}},

{id:'ao3',title:'PAR, JAR/JARM & RAR',body:`
<p>Newer OAuth extensions harden the request itself. <b>PAR</b> (Pushed Authorization Requests) sends the request parameters to the server <i>first</i>, over a back channel, so nothing sensitive rides in the browser URL. <b>JAR/JARM</b> sign the request and response objects so they cannot be tampered with. <b>RAR</b> (Rich Authorization Requests) replaces coarse scopes with structured <b>authorization details</b> — "transfer up to 500 EUR from account X" instead of a blunt <code>payments</code> scope.</p>
<!--flow:ao3-par-->
<h4>Pushed Authorization Requests — step by step</h4>
<div class="flowDia"><svg viewBox="0 0 620 254" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Pushed Authorization Requests"><defs><marker id="ao3-par-ah-front" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent)"/></marker><marker id="ao3-par-ah-back" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent2)"/></marker><marker id="ao3-par-ah-attack" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--bad)"/></marker><marker id="ao3-par-ah-x" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--muted)"/></marker></defs><line x1="74" y1="42" x2="74" y2="222" class="fdLife"/><line x1="546" y1="42" x2="546" y2="222" class="fdLife"/><rect x="35" y="8" width="78" height="34" rx="8" class="fdActor"/><text x="74" y="29.5" class="fdActorT">Client</text><rect x="453" y="8" width="186" height="34" rx="8" class="fdActor"/><text x="546" y="29.5" class="fdActorT">Authorization Server</text><line x1="77" y1="90" x2="541" y2="90" stroke="var(--accent2)" class="fdArrow" marker-end="url(#ao3-par-ah-back)"/><text x="325" y="81" class="fdLabel">POST /par — full authz request, client-authenticated</text><circle cx="92" cy="90" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="92" y="93.5" class="fdNumT" style="fill:var(--accent2)">1</text><line x1="543" y1="120" x2="79" y2="120" stroke="var(--accent2)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#ao3-par-ah-back)"/><text x="295" y="111" class="fdLabel">request_uri — short-lived, one-time</text><circle cx="528" cy="120" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="528" y="123.5" class="fdNumT" style="fill:var(--accent2)">2</text><line x1="77" y1="150" x2="541" y2="150" stroke="var(--accent)" class="fdArrow" marker-end="url(#ao3-par-ah-front)"/><text x="325" y="141" class="fdLabel">/authorize?request_uri=… (tiny, tamper-proof)</text><circle cx="92" cy="150" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="92" y="153.5" class="fdNumT" style="fill:var(--accent)">3</text><rect x="250" y="167" width="356" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="436" y="182" class="fdSelfT">parameters were already vetted on the back channel</text><circle cx="250" cy="178" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="250" y="181.5" class="fdNumT" style="fill:var(--muted)">4</text><text x="310" y="204" class="fdNote">The browser now carries a reference, not the request — nothing left to tamper with.</text><line x1="18" y1="240" x2="44" y2="240" stroke="var(--accent2)" class="fdArrow"/><text x="50" y="244" class="fdLegend">back channel (server to server)</text><line x1="271.29999999999995" y1="240" x2="297.29999999999995" y2="240" stroke="var(--accent)" class="fdArrow"/><text x="303.29999999999995" y="244" class="fdLegend">front channel (via the browser)</text></svg></div>
<ol class="fdSteps">
<li><b>Client → Authorization Server:</b> POST /par — full authz request, client-authenticated <i>(back channel)</i></li>
<li><b>Authorization Server → Client:</b> request_uri — short-lived, one-time <i>(back channel)</i></li>
<li><b>Client → Authorization Server:</b> /authorize?request_uri=… (tiny, tamper-proof) <i>(front channel)</i></li>
<li><b>Authorization Server:</b> parameters were already vetted on the back channel</li>
</ol>
<!--/flow:ao3-par-->
<p>Together they push OAuth toward fine-grained, tamper-resistant authorization — the direction profiles like FAPI (financial-grade) require.</p>

<h4>What each one moves, and why</h4>
<p>All three exist because the classic authorization request travels <b>through the browser as a query
string</b> — visible, loggable, and modifiable by anyone who can influence the URL.</p>
<div class="codeSample" data-hl>PAR   (RFC 9126)  push the parameters to the AS over the BACK channel first,
                  get a request_uri handle, send only that through the browser.
  POST /par  client_id=..&scope=..&redirect_uri=..  ->  {"request_uri":"urn:...:6esc"}
  GET /authorize?client_id=..&request_uri=urn:...:6esc
  -> nothing sensitive in the URL; nothing for the user or a proxy to tamper with

JAR   (RFC 9101)  SIGN the request object, so the AS can prove the client
                  authored these parameters - not an attacker who rewrote them.

JARM              sign the RESPONSE too, closing the mirror attack where the
                  response is tampered with on the way back.

RAR   (RFC 9396)  replace coarse scopes with a structured authorization_details
                  object: not "payments", but "transfer EUR 50 to IBAN x on date y".</div>

<h4>Why RAR matters more than it looks</h4>
<p>Scopes are a flat list of strings, so they can only express <i>categories</i> of permission. The
moment consent needs to name an amount, a recipient or a single document, scopes run out —
and the usual workaround is to invent scope strings like <code>payment:50:GB29NWBK</code>, which is a
structured object badly encoded. RAR makes the structure explicit, which in turn makes the consent
screen able to say what the user is actually approving.</p>
<p>That is the real thread through all four: <b>the user should consent to a specific thing, and nothing
between the client and the authorization server should be able to change what that thing is.</b></p>

<h4>When you need them</h4>
<p>For an ordinary web app with read scopes, PKCE and exact redirect matching are enough. Reach for these
when the request parameters are sensitive, when a regulator requires non-repudiation, or when consent
must be fine-grained — which in practice means payments, health data, and anything under an open
banking regime.`,
docs:[['PAR (RFC 9126)','https://www.rfc-editor.org/rfc/rfc9126'],['RAR (RFC 9396)','https://www.rfc-editor.org/rfc/rfc9396']],
ex:{title:'What each extension is for',
prompt:`Write class <code>Advanced</code> with <code>static String purpose(String feature)</code>: <code>"PAR"</code>→<code>"push the request server-side"</code>, <code>"RAR"</code>→<code>"fine-grained authorization details"</code>, <code>"DPoP"</code>→<code>"sender-constrained tokens"</code>, and <code>"unknown"</code> otherwise.`,
starter:`public class Advanced {
    static String purpose(String feature) {
        return null;
    }
}`,
solution:`public class Advanced {
    static String purpose(String feature) {
        switch (feature) {
            case "PAR":  return "push the request server-side";
            case "RAR":  return "fine-grained authorization details";
            case "DPoP": return "sender-constrained tokens";
            default:     return "unknown";
        }
    }
}`,
tests:[{d:'PAR pushes the request server-side',re:'"PAR".*?"push the request server-side"',flags:'s'},{d:'RAR adds fine-grained detail',re:'"RAR".*?"fine-grained authorization details"',flags:'s'},{d:'DPoP is about sender-constraining',re:'"DPoP".*?"sender-constrained tokens"',flags:'s'},{d:'unknown default',re:'"unknown"'}],
behavior:`purpose("PAR") describes pushing the request server-side; purpose("RAR") describes structured authorization details; purpose("DPoP") describes sender-constrained tokens. These are the building blocks of high-assurance OAuth.`,
hints:['A switch mapping each acronym to its one-line purpose works well.','PAR is about moving the request off the browser URL; RAR is about detail; DPoP is about binding tokens to a key.','Everything else returns unknown.']}},

{id:'ao4',title:'DPoP & sender-constrained tokens',body:`
<p>A plain <b>bearer</b> token is like cash: whoever holds it can spend it, so a stolen token is game over. <b>Sender-constrained</b> tokens fix this by binding the token to a key only the legitimate client holds. Two mechanisms: <b>mTLS-bound</b> tokens (tied to the client&#8217;s TLS certificate) and <b>DPoP</b> (the client signs each request with a key referenced by the token).</p>
<p>The acceptance rule follows directly: a bearer token is fine on its own, but a sender-constrained token must be accompanied by a valid proof of possession. If the proof is missing or wrong, a stolen copy is worthless.</p>

<h4>Start with what "bearer" actually means</h4>
<p>The word is doing real work. A <b>bearer</b> instrument belongs to whoever is holding it — like cash,
or a cinema ticket. Nobody checks that the holder is the person it was issued to, because the instrument
carries no notion of an owner. That is the entire security model of an ordinary access token.</p>
<p>Which means the question a resource server asks is embarrassingly weak:</p>
<div class="codeSample" data-hl>BEARER                "do you have a valid token?"
                      -> anyone who obtained it, however they obtained it, passes

PROOF OF POSSESSION   "do you have a valid token AND can you prove you are
                       the party it was issued to?"
                      -> a copied token, on its own, is worthless</div>
<p>Tokens leak in unglamorous ways: a URL in a log, a proxy that records headers, a crash dump, a
browser extension, a debug endpoint. None of those require breaking cryptography. With bearer semantics,
each one is a full account compromise until the token expires.</p>

<h4>The idea: tie the token to a key</h4>
<p>Sender-constraining adds one requirement. When the token is issued, it records <b>which key its
rightful holder controls</b>. From then on, presenting the token is not enough — you must also
demonstrate you hold that key.</p>
<p>The mechanism is the same one used everywhere else in this course: <b>you prove possession of a
private key by signing something with it</b>. The verifier compares the key you signed with against the
key recorded in the token. Match, and you are the intended holder. No match, and you are holding
somebody else's ticket.</p>
<div class="codeSample" data-hl>// the token records the key it belongs to, in a "confirmation" claim
{ "sub": "ada", "aud": "orders-api", "exp": ...,
  "cnf": { "jkt": "0ZcOCORZ..." } }      <- a fingerprint of the holder's public key

// and every request carries a fresh proof, signed by the matching private key
// steal the token without the key, and you have a ticket you cannot use</div>

<h4>Two ways to hold that key</h4>
<p><b>mTLS</b> uses the client's TLS certificate — the key already proven during the handshake. Strong
and hardware-friendly, but it needs a PKI, and client certificates fail in browsers and through most
proxies.</p>
<p><b>DPoP</b> has the application generate its own key pair and sign a small proof per request. No PKI,
no infrastructure, works anywhere ordinary HTTPS works — which is why it is the practical option for
SPAs, mobile apps and public clients generally.</p>

<h4>What this does and does not buy</h4>
<p>It shrinks the value of a <i>stolen</i> token to nearly nothing. It does not help if the attacker took
the key as well — a compromised process holds both. And it does nothing about a token that was correctly
issued to a party who then misuses it, or about a missing audience check.</p>
<p><b>Treat it as the last layer, not the first.</b> Short lifetimes, audience restriction and not
logging tokens come first; sender-constraining is what remains after those, and it is the difference
between "a leaked token is a breach" and "a leaked token is an inert string". The next lesson is the
mechanics.</p>`,
docs:[['DPoP (RFC 9449)','https://www.rfc-editor.org/rfc/rfc9449'],['mTLS-bound tokens (RFC 8705)','https://www.rfc-editor.org/rfc/rfc8705']],
ex:{title:'Accept only a proven sender',lang:'js',
run:{call:'accept',cases:[{name:'sender-constrained with a valid proof',args:[true,true],expect:true},{name:'sender-constrained, proof missing or invalid',args:[true,false],expect:false},{name:'plain bearer token',args:[false,true],expect:false},{name:'neither',args:[false,false],expect:false}]},
prompt:`Write <code>function accept(senderConstrained, keyProofValid)</code> that accepts a request only when the token is sender-constrained <b>and</b> the caller proved possession of the bound key. A bearer token with a great-looking proof is still a bearer token.`,
starter:`function accept(senderConstrained, keyProofValid) {
  return false;
}`,
solution:`function accept(senderConstrained, keyProofValid) {
  return senderConstrained && keyProofValid;
}`,
tests:[{d:'the token must be sender-constrained',re:'senderConstrained\\s*&&'},{d:'and the key proof must verify',re:'keyProofValid'}],
behavior:`The third case is the trap: a plain bearer token accompanied by a valid-looking proof must still be refused, because nothing binds that proof to the token. Constraint and proof are two halves of one check.`,
hints:['Both halves are required, so use &&.','A proof means nothing if the token is not bound to a key.','A bound token with no proof is equally unusable.']}},

{id:'ao4b',title:'DPoP in depth: proving you hold the key',body:`
<p>Every bearer token shares one weakness: possession is the whole of the entitlement. Steal it from a
log, a proxy, a browser or a crash dump, and you are indistinguishable from the legitimate client.
<b>DPoP</b> — Demonstrating Proof-of-Possession, RFC 9449 — removes that property, and it does so
without requiring the client certificates that kept mTLS out of reach for most applications.</p>
<!--flow:ao4b-dpop-->
<h4>DPoP: proof-of-possession per request — step by step</h4>
<div class="flowDia"><svg viewBox="0 0 700 282" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="DPoP: proof-of-possession per request"><defs><marker id="ao4b-dpop-ah-front" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent)"/></marker><marker id="ao4b-dpop-ah-back" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent2)"/></marker><marker id="ao4b-dpop-ah-attack" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--bad)"/></marker><marker id="ao4b-dpop-ah-x" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--muted)"/></marker></defs><line x1="74" y1="54" x2="74" y2="270" class="fdLife"/><line x1="350" y1="54" x2="350" y2="270" class="fdLife"/><line x1="626" y1="54" x2="626" y2="270" class="fdLife"/><rect x="35" y="8" width="78" height="46" rx="8" class="fdActor"/><text x="74" y="27" class="fdActorT">Client</text><text x="74" y="42" class="fdActorS">holds a key pair</text><rect x="257" y="8" width="186" height="46" rx="8" class="fdActor"/><text x="350" y="35.5" class="fdActorT">Authorization Server</text><rect x="587" y="8" width="78" height="46" rx="8" class="fdActor"/><text x="626" y="35.5" class="fdActorT">API</text><rect x="14" y="89" width="296.59999999999997" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="170.29999999999998" y="104" class="fdSelfT">generate a key pair (per client instance)</text><circle cx="14" cy="100" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="14" y="103.5" class="fdNumT" style="fill:var(--muted)">1</text><line x1="77" y1="138" x2="345" y2="138" stroke="var(--accent2)" class="fdArrow" marker-end="url(#ao4b-dpop-ah-back)"/><text x="227" y="129" class="fdLabel">POST /token + DPoP proof (signed: htm, htu, jti)</text><circle cx="92" cy="138" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="92" y="141.5" class="fdNumT" style="fill:var(--accent2)">2</text><line x1="347" y1="168" x2="79" y2="168" stroke="var(--accent2)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#ao4b-dpop-ah-back)"/><text x="197" y="159" class="fdLabel">access token BOUND to the key (cnf.jkt)</text><circle cx="332" cy="168" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="332" y="171.5" class="fdNumT" style="fill:var(--accent2)">3</text><line x1="77" y1="198" x2="621" y2="198" stroke="var(--accent2)" class="fdArrow" marker-end="url(#ao4b-dpop-ah-back)"/><text x="365" y="189" class="fdLabel">request + token + a FRESH DPoP proof</text><circle cx="92" cy="198" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="92" y="201.5" class="fdNumT" style="fill:var(--accent2)">4</text><rect x="303.6" y="215" width="382.4" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="502.8" y="230" class="fdSelfT">verify proof sig; htm/htu match; jkt matches the token</text><circle cx="303.6" cy="226" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="303.6" y="229.5" class="fdNumT" style="fill:var(--muted)">5</text><text x="350" y="252" class="fdNote">A stolen token without the private key is a brick.</text></svg></div>
<ol class="fdSteps">
<li><b>Client:</b> generate a key pair (per client instance)</li>
<li><b>Client → Authorization Server:</b> POST /token + DPoP proof (signed: htm, htu, jti) <i>(back channel)</i></li>
<li><b>Authorization Server → Client:</b> access token BOUND to the key (cnf.jkt) <i>(back channel)</i></li>
<li><b>Client → API:</b> request + token + a FRESH DPoP proof <i>(back channel)</i></li>
<li><b>API:</b> verify proof sig; htm/htu match; jkt matches the token</li>
</ol>
<!--/flow:ao4b-dpop-->

<h4>The idea in one line</h4>
<p>The client generates a key pair, tells the authorization server about the public key when it asks
for a token, and thereafter <b>signs every API request with the private key</b>. The token records a
thumbprint of that key, so a resource server can check that whoever presents the token also holds the
key. A stolen token, without the key, is inert.</p>

<h4>The proof JWT</h4>
<p>Each request carries an extra header, <code>DPoP</code>, whose value is a small JWT the client mints
on the spot:</p>
<div class="codeSample" data-hl>// header — carries the PUBLIC key, so the server needs no prior registration
{ "typ": "dpop+jwt", "alg": "ES256",
  "jwk": { "kty":"EC", "crv":"P-256", "x":"...", "y":"..." } }

// payload — binds this proof to THIS request
{ "htm": "POST",                                  // the HTTP method
  "htu": "https://api.example.com/orders",        // the URI, no query or fragment
  "iat": 1767222000,                              // when it was minted
  "jti": "b7c1-9f2e-...",                         // unique: for the replay cache
  "ath": "fUHyO2r2Z3..." }                        // SHA-256 of the access token

// and the request itself
POST /orders
Authorization: DPoP eyJhbGciOi...     <- note the scheme is DPoP, not Bearer
DPoP: eyJ0eXAiOiJkcG9wK2p3dCI...</div>
<p><code>htm</code> and <code>htu</code> are what stop a captured proof being reused against a
different endpoint. <code>ath</code> ties the proof to one specific access token, so a proof captured
alongside one token cannot be paired with another. And <code>jti</code> exists so the server can
remember it.</p>

<h4>The cnf claim: where the binding actually lives</h4>
<p>The access token itself must record which key it is bound to, or a resource server has nothing to
compare against. That is the <b>confirmation claim</b>, <code>cnf</code>, holding <code>jkt</code> — the
base64url SHA-256 thumbprint of the client's public JWK:</p>
<div class="codeSample" data-hl>// inside the access token, issued by the authorization server
{ "sub": "ada", "aud": "orders-api", "exp": 1767225600,
  "cnf": { "jkt": "0ZcOCORZNYy-DWpqq30jZyJGHTN0d2HglBV3uiguA4I" } }

// the resource server's check:
//   thumbprint( proof.header.jwk )  ==  token.cnf.jkt   ?
// if not, the presenter does not hold the key this token was issued to.</div>
<p>The same <code>cnf</code> mechanism carries mTLS binding too, using <code>x5t#S256</code> instead —
so "sender-constrained" is one concept with two key types, not two unrelated features.</p>

<h4>What the resource server must do</h4>
<ol>
<li>Parse the <code>DPoP</code> header; confirm <code>typ</code> is <code>dpop+jwt</code> and the
algorithm is one you accept — never <code>none</code>, never a symmetric algorithm.</li>
<li>Verify the proof's signature <b>using the JWK in its own header</b>. This feels circular and is
not: it proves the sender holds that private key. Trust comes from step 4.</li>
<li>Check <code>htm</code> and <code>htu</code> match the request you are actually serving.</li>
<li><b>Compute the thumbprint of that JWK and compare it to <code>cnf.jkt</code> in the access
token.</b> This is the step that matters — without it the proof proves only that someone owns some key.</li>
<li>Check <code>ath</code> equals the hash of the presented access token.</li>
<li>Check <code>iat</code> is recent, and that <code>jti</code> has not been seen before.</li>
</ol>
<p>Step 4 is the one implementations get wrong, and omitting it is silently catastrophic: everything
still works, and the token is still effectively a bearer token.</p>

<h4>Replay, clocks, and the nonce</h4>
<p>A proof is valid for a short window, so an attacker who captures one has a brief chance to replay it
against the same endpoint. Two defences, used together:</p>
<ul>
<li><b>A replay cache.</b> Store each <code>jti</code> for the acceptance window and reject repeats.
Cheap for one server, awkward across a fleet — it needs shared state, which is precisely what
stateless tokens were meant to avoid.</li>
<li><b>Server-provided nonces.</b> The server returns <code>DPoP-Nonce</code> and a
<code>use_dpop_nonce</code> error; the client retries including that nonce in the proof. Now the server
chooses the value, so a proof cannot be minted in advance or replayed after the nonce rotates — and no
per-request storage is needed.</li>
</ul>
<p>Clock skew is the practical operational issue: proofs are short-lived by design, so a client whose
clock is minutes out fails everything. Allow a small, bounded window and log rejections clearly.</p>

<h4>Binding the refresh token too</h4>
<p>Constraining access tokens while leaving the refresh token bearer would be pointless — a stolen
refresh token simply mints new access tokens. For a public client, DPoP binds the refresh token as
well, and the same key must be proven at the token endpoint. Rotating the key means re-authenticating.</p>

<h4>DPoP or mTLS?</h4>
<div class="codeSample" data-hl>                      DPoP                        mTLS-bound (RFC 8705)
key material          app-generated, in memory    an X.509 client certificate
infrastructure        none — ordinary HTTPS       PKI, and TLS terminated where
                                                  the cert is still visible
works in a browser    yes                         effectively no
proxies / CDN         transparent                 client certs often break
strength              key can be extracted from   hardware-backed, harder to steal
                      a compromised process
typical use           SPAs, mobile, public        service-to-service, FAPI,
                      clients                     regulated environments</div>
<p><b>Neither is a substitute for the basics.</b> Sender constraint reduces the value of a stolen token;
it does not fix a missing audience check, an unvalidated redirect URI, or a token logged in plaintext.
Treat it as the last layer, not the first.</p>`,
docs:[['RFC 9449 — OAuth 2.0 Demonstrating Proof of Possession (DPoP)','https://www.rfc-editor.org/rfc/rfc9449'],['RFC 7638 — JSON Web Key (JWK) Thumbprint','https://www.rfc-editor.org/rfc/rfc7638'],['RFC 8705 — OAuth 2.0 Mutual-TLS Client Authentication and Certificate-Bound Access Tokens','https://www.rfc-editor.org/rfc/rfc8705'],['RFC 7800 — Proof-of-Possession Key Semantics for JWTs (the cnf claim)','https://www.rfc-editor.org/rfc/rfc7800']],
ex:{title:'Verify a DPoP proof against the token binding',
prompt:`Write <code>Dpop</code> with four methods. <code>static boolean bindingMatches(String jwkThumbprint, String cnfJkt)</code> returns true only when both are non-null and equal — the step that ties the proof to the token, and the one implementations forget. <code>static boolean requestMatches(String htm, String htu, String method, String uri)</code> requires all four non-null, with <code>htm</code> equal to <code>method</code> and <code>htu</code> equal to <code>uri</code>. <code>static boolean fresh(long iat, long now, long windowSeconds)</code> is true when <code>now - iat</code> is between <code>0</code> and <code>windowSeconds</code> inclusive. <code>static boolean accept(String jwkThumbprint, String cnfJkt, String htm, String htu, String method, String uri, long iat, long now, java.util.Set&lt;String&gt; seenJtis, String jti)</code> requires all of the above plus a <code>jti</code> not already in <code>seenJtis</code>, using a 60-second window.`,
starter:`import java.util.*;

public class Dpop {
    static boolean bindingMatches(String jwkThumbprint, String cnfJkt) {
        return false;
    }
    static boolean requestMatches(String htm, String htu, String method, String uri) {
        return false;
    }
    static boolean fresh(long iat, long now, long windowSeconds) {
        return false;
    }
    static boolean accept(String jwkThumbprint, String cnfJkt, String htm, String htu,
                          String method, String uri, long iat, long now,
                          Set<String> seenJtis, String jti) {
        return false;
    }
}`,
tests:[{d:'the thumbprint must be present',re:'jwkThumbprint\\s*!=\\s*null|null\\s*!=\\s*jwkThumbprint'},{d:'thumbprint is compared to the cnf claim',re:'equals\\s*\\(\\s*cnfJkt|cnfJkt\\s*\\.\\s*equals'},{d:'the proof is bound to the HTTP method',re:'htm\\s*\\.\\s*equals\\s*\\(\\s*method|method\\s*\\.\\s*equals\\s*\\(\\s*htm'},{d:'the proof is bound to the URI',re:'htu\\s*\\.\\s*equals\\s*\\(\\s*uri|uri\\s*\\.\\s*equals\\s*\\(\\s*htu'},{d:'a proof from the future is rejected',re:'age\\s*>=\\s*0|now\\s*-\\s*iat\\s*>=\\s*0|iat\\s*<=\\s*now'},{d:'the freshness window is bounded',re:'<=\\s*windowSeconds|windowSeconds\\s*>='},{d:'replayed jtis are rejected',re:'contains\\s*\\(\\s*jti\\s*\\)'},{d:'acceptance requires every check',re:'bindingMatches\\s*\\('}],
behavior:`bindingMatches("abc","abc") is true; bindingMatches("abc","xyz") and either being null are false. Skipping this comparison is the classic DPoP implementation bug: every other check still passes, so the integration appears to work while the token remains an ordinary bearer token. requestMatches("POST","https://api/x","POST","https://api/x") is true, but a mismatched method or URI is false, which is what stops a captured proof being replayed against a different endpoint. fresh(100,130,60) is true; fresh(100,200,60) is false as too old, and fresh(100,90,60) is false because a proof cannot be minted in the future. accept passes only when the binding, the request, the freshness and an unseen jti all hold.`,
hints:['Guard nulls in every comparison; a null thumbprint must never match a null cnf.','Freshness has two sides: <code>now - iat &gt;= 0 &amp;&amp; now - iat &lt;= windowSeconds</code>.','Compose <code>accept</code> from the other three plus <code>!seenJtis.contains(jti)</code>.'],
solution:`import java.util.*;

public class Dpop {
    static boolean bindingMatches(String jwkThumbprint, String cnfJkt) {
        // the step that actually makes the token sender-constrained
        return jwkThumbprint != null && jwkThumbprint.equals(cnfJkt);
    }
    static boolean requestMatches(String htm, String htu, String method, String uri) {
        if (htm == null || htu == null || method == null || uri == null) return false;
        return htm.equals(method) && htu.equals(uri);
    }
    static boolean fresh(long iat, long now, long windowSeconds) {
        long age = now - iat;
        return age >= 0 && age <= windowSeconds;   // not from the future, not stale
    }
    static boolean accept(String jwkThumbprint, String cnfJkt, String htm, String htu,
                          String method, String uri, long iat, long now,
                          Set<String> seenJtis, String jti) {
        if (jti == null || seenJtis == null || seenJtis.contains(jti)) return false;  // replay
        return bindingMatches(jwkThumbprint, cnfJkt)
            && requestMatches(htm, htu, method, uri)
            && fresh(iat, now, 60);
    }
}`}},

{id:'ao5',title:'Attack catalog & defenses',body:`
<p>The OAuth 2.0 Security Best Current Practice catalogs the attacks worth knowing — and each has a standard defense:</p>
<ul>
<li><b>CSRF on the redirect</b> → the <code>state</code> parameter (random, checked on return).</li>
<li><b>Token/code replay</b> → short lifetimes and a one-time <code>nonce</code>.</li>
<li><b>Authorization-code interception</b> (public clients) → <b>PKCE</b>.</li>
<li><b>Open redirect / mix-up</b> → register and match <b>exact</b> <code>redirect_uri</code> values, never wildcards.</li>
</ul>
<p>The through-line: bind each step to something the attacker cannot forge or reuse, and never trust a redirect target you did not pre-register.</p>

<h4>The catalog, and what each one actually exploits</h4>
<p><b>1. Open redirect.</b> Your app has an endpoint that forwards to a URL from a parameter. An
attacker registers <code>https://you.example/go?to=https://evil.example</code> as the target, and the
authorization code lands on their server. The fix is not validation-by-blocklist: it is an
<b>allow-list of exact redirect URIs</b>, and never reflecting a user-supplied URL into a redirect.</p>

<p><b>2. Mix-up attack.</b> An app that supports several IdPs is tricked into sending the code from
IdP&nbsp;A to IdP&nbsp;B's token endpoint — where B, a legitimate IdP, has no idea it did not issue it, but
an <i>attacker-controlled</i> IdP happily keeps it. Defence: track which IdP each authorization request
went to, and check the <code>iss</code> returned in the response matches. This is why RFC 9207 added an
explicit <code>iss</code> parameter to the authorization response.</p>

<p><b>3. CSRF on the callback.</b> Without <code>state</code>, an attacker completes their own
authorization, then feeds <i>their</i> code to your callback in the victim's browser. The victim's
session is now linked to the attacker's account, and anything they upload goes to the attacker. Defence:
<code>state</code>, bound to the user's session, checked on return.</p>

<p><b>4. Authorization code injection.</b> Distinct from CSRF: the attacker injects a code obtained
elsewhere into a legitimate flow. A client secret does not help — the client is genuine. <b>PKCE</b> is
the defence, because the victim's client holds a verifier that does not match the challenge the
attacker's code was bound to.</p>

<p><b>5. Token replay and theft.</b> Bearer tokens leak through logs, referrers, proxies and browser
storage. Defence in layers: short lifetimes, audience restriction, and sender-constraining with DPoP or
mTLS so possession of the token alone is not enough.</p>

<p><b>6. Refresh token reuse.</b> A stolen refresh token is the most valuable credential in the system.
Defence: <b>rotation with reuse detection</b> — if an old token is presented again, assume theft and
revoke the whole family, since either the legitimate client or the attacker is replaying.</p>

<p><b>7. Consent phishing.</b> No protocol flaw at all: the attacker registers a plausible app, sends a
genuine consent link, and the user grants real scopes to a malicious client. Defence is
organisational — app allow-listing, publisher verification, scope review, and admin consent for
sensitive scopes. <b>This is now a leading enterprise attack, and no amount of protocol hardening
addresses it.</b></p>

<p><b>8. alg confusion and key confusion.</b> Accepting the token's own <code>alg</code> lets an
attacker propose <code>none</code>, or hand an RSA public key to an HMAC verifier as the shared secret.
Defence: pin the algorithm, and pin where keys come from.</p>

<div class="codeSample" data-hl>ATTACK                    BOUND BY WHAT
open redirect             exact pre-registered redirect_uri
mix-up                    iss checked against the request (RFC 9207)
callback CSRF             state, bound to the session
code injection            PKCE verifier
token replay              short exp + aud + DPoP/mTLS
refresh reuse             rotation with reuse detection
consent phishing          nothing in the protocol - governance
alg confusion             algorithm pinned by the verifier</div>
<p>Notice the shape of the table: <b>every protocol defence is a binding</b> — of the response to the
request, the code to the client, the token to a key. The one row with no protocol answer is the one
that attacks the human, and it is the one growing fastest.</p>`,
docs:[['OAuth 2.0 Security BCP','https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics'],['Redirect URI validation','https://www.rfc-editor.org/rfc/rfc6749#section-3.1.2']],
ex:{title:'Match the defense to the attack',
prompt:`Write class <code>Defense</code> with <code>static String against(String attack)</code>: <code>"csrf"</code>→<code>"state parameter"</code>, <code>"replay"</code>→<code>"nonce"</code>, <code>"code-interception"</code>→<code>"pkce"</code>, <code>"open-redirect"</code>→<code>"exact redirect_uri match"</code>, and <code>"unknown"</code> otherwise.`,
starter:`public class Defense {
    static String against(String attack) {
        return null;
    }
}`,
solution:`public class Defense {
    static String against(String attack) {
        switch (attack) {
            case "csrf":              return "state parameter";
            case "replay":            return "nonce";
            case "code-interception": return "pkce";
            case "open-redirect":     return "exact redirect_uri match";
            default:                  return "unknown";
        }
    }
}`,
tests:[{d:'CSRF is countered by state',re:'"csrf".*?"state parameter"',flags:'s'},{d:'replay is countered by nonce',re:'"replay".*?"nonce"',flags:'s'},{d:'code interception is countered by PKCE',re:'"code-interception".*?"pkce"',flags:'s'},{d:'open redirect needs exact URI matching',re:'"open-redirect".*?"exact redirect_uri match"',flags:'s'},{d:'unknown default',re:'"unknown"'}],
behavior:`against("csrf") is "state parameter", against("replay") is "nonce", against("code-interception") is "pkce", against("open-redirect") is "exact redirect_uri match". Each defense binds a step to something an attacker cannot forge.`,
hints:['A switch maps each attack name to its standard mitigation.','state stops CSRF, nonce stops replay, PKCE stops code interception, exact URI matching stops open redirects.','Anything unlisted returns unknown.']}},
{id:'ao6',title:'Refresh token rotation & reuse detection',body:`
<p>Refresh tokens are long-lived, so a stolen one is a serious prize — it mints fresh access tokens indefinitely. Two mechanisms bound that risk.</p>
<!--flow:ao6-rotation-->
<h4>Refresh rotation and reuse detection — step by step</h4>
<div class="flowDia"><svg viewBox="0 0 700 356" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Refresh rotation and reuse detection"><defs><marker id="ao6-rotation-ah-front" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent)"/></marker><marker id="ao6-rotation-ah-back" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent2)"/></marker><marker id="ao6-rotation-ah-attack" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--bad)"/></marker><marker id="ao6-rotation-ah-x" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--muted)"/></marker></defs><line x1="74" y1="54" x2="74" y2="324" class="fdLife"/><line x1="350" y1="54" x2="350" y2="324" class="fdLife"/><line x1="626" y1="54" x2="626" y2="324" class="fdLife"/><rect x="-6.699999999999989" y="8" width="161.39999999999998" height="46" rx="8" class="fdActor"/><text x="74" y="35.5" class="fdActorT">Legitimate client</text><rect x="257" y="8" width="186" height="46" rx="8" class="fdActor"/><text x="350" y="35.5" class="fdActorT">Authorization Server</text><rect x="582.2" y="8" width="87.6" height="46" rx="8" class="fdActor"/><text x="626" y="27" class="fdActorT">Attacker</text><text x="626" y="42" class="fdActorS">stole RT₁ earlier</text><line x1="77" y1="102" x2="345" y2="102" stroke="var(--accent2)" class="fdArrow" marker-end="url(#ao6-rotation-ah-back)"/><text x="227" y="93" class="fdLabel">refresh with RT₁</text><circle cx="92" cy="102" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="92" y="105.5" class="fdNumT" style="fill:var(--accent2)">1</text><line x1="347" y1="132" x2="79" y2="132" stroke="var(--accent2)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#ao6-rotation-ah-back)"/><text x="197" y="123" class="fdLabel">new AT + RT₂ — RT₁ is now “used”</text><circle cx="332" cy="132" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="332" y="135.5" class="fdNumT" style="fill:var(--accent2)">2</text><line x1="14" y1="158" x2="686" y2="158" class="fdPhase"/><text x="350" y="162" class="fdPhaseT">the stolen copy surfaces</text><line x1="623" y1="192" x2="355" y2="192" stroke="var(--bad)" class="fdArrow" stroke-dasharray="7 4" marker-end="url(#ao6-rotation-ah-attack)"/><text x="473" y="183" class="fdLabel fdLabelBad">refresh with RT₁ — a USED token</text><circle cx="608" cy="192" r="9" class="fdNum" style="stroke:var(--bad)"/><text x="608" y="195.5" class="fdNumT" style="fill:var(--bad)">3</text><rect x="185.20000000000002" y="209" width="329.59999999999997" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="358" y="224" class="fdSelfT">reuse detected → revoke the whole token family</text><circle cx="185.20000000000002" cy="220" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="185.20000000000002" y="223.5" class="fdNumT" style="fill:var(--muted)">4</text><line x1="353" y1="258" x2="621" y2="258" stroke="var(--bad)" class="fdArrow" stroke-dasharray="7 4" marker-end="url(#ao6-rotation-ah-attack)"/><text x="503" y="249" class="fdLabel fdLabelBad">invalid_grant</text><circle cx="368" cy="258" r="9" class="fdNum" style="stroke:var(--bad)"/><text x="368" y="261.5" class="fdNumT" style="fill:var(--bad)">5</text><line x1="77" y1="288" x2="345" y2="288" stroke="var(--accent2)" class="fdArrow" marker-end="url(#ao6-rotation-ah-back)"/><text x="227" y="279" class="fdLabel">RT₂ is dead too → full re-authentication</text><circle cx="92" cy="288" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="92" y="291.5" class="fdNumT" style="fill:var(--accent2)">6</text><text x="350" y="306" class="fdNote">One theft costs one re-login — and produces a loud, unambiguous signal.</text><line x1="18" y1="342" x2="44" y2="342" stroke="var(--accent2)" class="fdArrow"/><text x="50" y="346" class="fdLegend">back channel (server to server)</text><line x1="271.29999999999995" y1="342" x2="297.29999999999995" y2="342" stroke="var(--bad)" class="fdArrow" stroke-dasharray="7 4"/><text x="303.29999999999995" y="346" class="fdLegend">attack path</text></svg></div>
<ol class="fdSteps">
<li><b>Legitimate client → Authorization Server:</b> refresh with RT₁ <i>(back channel)</i></li>
<li><b>Authorization Server → Legitimate client:</b> new AT + RT₂ — RT₁ is now “used” <i>(back channel)</i></li>
<li><b>Attacker → Authorization Server:</b> refresh with RT₁ — a USED token <b>⚠ attack</b></li>
<li><b>Authorization Server:</b> reuse detected → revoke the whole token family</li>
<li><b>Authorization Server → Attacker:</b> invalid_grant <b>⚠ attack</b></li>
<li><b>Legitimate client → Authorization Server:</b> RT₂ is dead too → full re-authentication <i>(back channel)</i></li>
</ol>
<!--/flow:ao6-rotation-->
<p><b>Rotation.</b> Every time a refresh token is used, the authorization server issues a <b>new</b> refresh token and <b>invalidates the old one</b>. A given refresh token is therefore usable exactly once.</p>
<p><b>Reuse detection.</b> Because each refresh token is single-use, if an <i>already-rotated</i> (old) token is presented again, something is wrong: either a replay, or the legitimate client and an attacker <b>both</b> hold a copy. The safe response is to assume compromise and <b>revoke the entire token family</b> (the whole session lineage), forcing a fresh login. This turns a stolen refresh token from an open-ended breach into a short, self-detecting one.</p>
<p>Rotation is <b>mandatory for public clients</b> (SPAs, mobile) per the OAuth Security BCP, since they cannot protect a long-lived secret. Pair it with short access-token lifetimes and, ideally, sender-constrained tokens (DPoP or mTLS) so even a captured token cannot be replayed elsewhere.</p>

<h4>Why refresh tokens are the crown jewels</h4>
<p>Access tokens expire in minutes, which is what makes them survivable when leaked. A refresh token is
the opposite: it is long-lived by design, and its whole purpose is to mint new access tokens without
the user present. Steal one and you have durable, silent access — no login, no MFA prompt, nothing in
the authentication logs.</p>
<p>That leaves an awkward problem. A public client — a SPA or a mobile app — cannot keep a secret, so it
cannot prove it is the rightful holder. Two tokens, one stolen, and the server sees identical requests
from both.</p>

<h4>Rotation, and the insight behind it</h4>
<p>Rotation means <b>each refresh token can be used exactly once</b>; redeeming it returns a new access
token <i>and</i> a new refresh token, and retires the old one.</p>
<p>On its own that is only mildly useful. The insight is what a <b>reuse</b> means:</p>
<div class="codeSample" data-hl>normal:   RT1 -> (AT1, RT2) -> (AT2, RT3) -> ...     each used once, then dead

theft:    attacker steals RT2 and redeems it   -> gets AT2, RT3
          the real client later redeems RT2    -> ALREADY USED

// the server cannot tell which party is the thief. it does not need to:
// a reused token means SOMEONE is replaying, so revoke the WHOLE FAMILY -
// RT1, RT2, RT3 and every access token issued from them.
// the legitimate user is logged out. the attacker is too. that is the trade.</div>
<p>This turns an undetectable compromise into a detectable one. Without rotation, a stolen refresh token
works quietly for as long as it lives. With rotation, the two parties inevitably collide, and the
collision is the alarm.</p>

<h4>The practical wrinkles</h4>
<p><b>Race conditions.</b> A page that fires three requests at once may refresh three times concurrently,
and naive reuse detection will read that as theft and log the user out. Real implementations allow a
short grace window where the immediately-previous token still works, and serialise refreshes in the
client.</p>
<p><b>Lost writes.</b> If the client redeems a token but the response never arrives, it now holds a dead
token and has no way back. Handle the failure explicitly, or the user's session simply stops working.</p>
<p><b>Rotation is the fallback, not the goal.</b> If you can sender-constrain the refresh token with
DPoP or mTLS, do that instead — a bound token cannot be replayed at all, so there is no collision to
detect. OAuth 2.1 requires one or the other precisely because a bare bearer refresh token in a public
client is the highest-value credential in the system.</p>`,
docs:[['Refresh token rotation — OAuth Security BCP','https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics'],['Token revocation (RFC 7009)','https://www.rfc-editor.org/rfc/rfc7009']],
ex:{title:'Handle a refresh-token use',
prompt:`Write class <code>RefreshRotation</code> with <code>static String onUse(boolean isCurrent)</code> returning <code>"rotate: issue new, revoke old"</code> when the presented token is the current one, and <code>"reuse detected: revoke the family"</code> when it is an old (already-rotated) token. Also <code>static boolean rotationRequired(String clientType)</code> returning true for a <code>"public"</code> client.`,
starter:`public class RefreshRotation {
    static String onUse(boolean isCurrent) {
        return null;
    }
    static boolean rotationRequired(String clientType) {
        return false;
    }
}`,
solution:`public class RefreshRotation {
    static String onUse(boolean isCurrent) {
        return isCurrent ? "rotate: issue new, revoke old" : "reuse detected: revoke the family";
    }
    static boolean rotationRequired(String clientType) {
        return clientType.equals("public");
    }
}`,
tests:[{d:'current token rotates; old token triggers family revocation',re:'isCurrent\\s*\\?\\s*"rotate: issue new, revoke old"\\s*:\\s*"reuse detected: revoke the family"'},{d:'rotation is required for public clients',re:'equals\\s*\\(\\s*"public"\\s*\\)'}],
behavior:`onUse(true) returns "rotate: issue new, revoke old"; onUse(false) returns "reuse detected: revoke the family" — the self-detecting response to a replayed refresh token. rotationRequired("public") is true: SPAs and mobile apps must rotate.`,
hints:['Each refresh token is single-use: using the current one rotates it; seeing an old one means compromise.','On reuse, revoke the whole token family to force a fresh login.','Public clients cannot protect a long-lived secret, so rotation is required for them.']}},

{id:'ao7',title:'FAPI: what a hardened OAuth profile looks like',body:`
<p>Plain OAuth 2.0 is a framework with a great many optional parts. That flexibility is why it is
everywhere, and it is also why two conformant deployments can differ enormously in security. When the
stakes are high — moving money, releasing health records — "conformant" is not a useful bar.</p>
<p>A <b>profile</b> fixes this by removing choices. <b>FAPI</b> (Financial-grade API, from the OpenID
Foundation) is the best-known one: a named set of mandatory requirements, with a certification suite
that proves an implementation actually meets them. It is worth studying even if you never need it,
because it is the industry's considered answer to "what does maximum-assurance OAuth look like?" — and
every requirement is a lesson already covered here, made compulsory.</p>

<h4>What a profile is</h4>
<div class="codeSample" data-hl>the base spec says          a profile says
  "should"                    MUST
  "one of these options"      exactly this one
  "implementers may choose"   here is the choice, and here is the test suite

// FAPI adds no new cryptography. It removes the freedom to be weak.</div>
<p>This is the same move as OAuth 2.1, applied harder and to a narrower audience. OAuth 2.1 raises the
floor for everyone; FAPI raises the ceiling for regulated deployments.</p>

<h4>The requirements, and the attack each one answers</h4>
<ul>
<li><b>PKCE with S256, always.</b> Authorization code interception and injection.</li>
<li><b>Sender-constrained access tokens</b> — mTLS-bound or DPoP. A stolen token is inert without the
key. Baseline OAuth's bearer semantics are simply not permitted.</li>
<li><b>Strong client authentication</b> — <code>private_key_jwt</code> or mTLS. No shared
<code>client_secret</code>, so there is no symmetric secret to leak from either side.</li>
<li><b>PAR</b> (pushed authorization requests). The client sends the request parameters to the
authorization server over the back channel first and receives a handle; the browser then carries only
that handle. Request parameters never appear in a URL, so they cannot be tampered with or logged.</li>
<li><b>JAR</b> (JWT-secured authorization request) — the request object is <i>signed</i>, so the
authorization server can prove the client authored those parameters, not an attacker who rewrote a
redirect.</li>
<li><b>JARM</b> (JWT-secured authorization response) — the response is signed too, closing the mirror
attack where a response is tampered with on the way back.</li>
<li><b>Exact redirect URI matching</b>, and no open redirects anywhere in the flow.</li>
<li><b>Short-lived authorization codes</b>, one-time use, bound to the client.</li>
</ul>
<p>Read that list again as a summary of the course: every item is a defence you have already met. FAPI's
contribution is refusing to let any of them be optional.</p>

<h4>Two levels</h4>
<div class="codeSample" data-hl>FAPI 2.0 Security Profile     the baseline: PKCE, PAR, sender-constrained
                              tokens, strong client auth
                              -> read access, most regulated APIs

FAPI 2.0 Message Signing      adds non-repudiation: requests AND responses are
                              signed end to end, so neither party can later
                              deny what was sent
                              -> payment initiation, high-value transactions</div>
<p>The distinction is worth understanding because it is not about strength but about <i>evidence</i>.
The baseline protects the exchange. Message signing produces an artefact that survives the exchange —
a signed record that stands up in a dispute months later. That is a legal requirement, not a
cryptographic one, which is why it is a separate level rather than simply "more secure".</p>

<h4>Certification: the part that makes it real</h4>
<p>FAPI ships with a conformance suite, and implementations are formally certified. This matters more
than it might appear. A specification alone is a document people interpret optimistically; a test suite
is a specification nobody can talk their way past. Much of the practical value of FAPI comes from the
fact that an ecosystem can <i>require certification</i> rather than trust a vendor's claim.</p>

<h4>When it applies to you</h4>
<p>Directly, if you build in open banking (the UK and Brazilian regimes mandate it), open healthcare, or
anywhere a regulator names it. Indirectly, and more usefully, as a checklist: if you ever need to argue
that an OAuth deployment is as strong as it reasonably can be, FAPI is the list to measure against.</p>
<p>And the caveat that matters: FAPI hardens the <i>protocol</i>. It says nothing about whether your scopes
model reality, whether the resource server checks record ownership, or whether your support tooling
lets staff read any account. A fully certified deployment can still have an IDOR on its main endpoint.
Protocol hardening and authorization correctness are different problems, and only one of them has a
test suite.</p>

<h4>Grant Management: treating the grant as a thing you can manage</h4>
<p>Ordinary OAuth has a blind spot. A user consents, tokens are issued, and after that <b>nobody can
enumerate what was actually granted</b>. Ask "which permissions does this bank's app currently hold for me,
and when were they given?" and the protocol has no answer — the grant exists only as a consequence of tokens
that were minted at some point.</p>
<p>That is tolerable for a photo-sharing app and not tolerable under open banking, where a regulator expects
a customer to see and withdraw individual consents. The <b>Grant Management API</b> (a FAPI 2.0 extension)
fixes it by making the grant a <b>first-class resource with its own identifier</b>.</p>
<div class="codeSample" data-hl>// on /authorize, say what to do with the grant:
grant_management_action=create   // a new grant; the response carries a grant_id
                       =update   // ADD scopes to an existing grant
                       =replace  // swap its contents entirely
                       =merge

// then the grant can be inspected and revoked on its own:
GET    /grants/{grant_id}    -> the scopes and claims currently granted
DELETE /grants/{grant_id}    -> revoke THIS grant, and every token from it

// what this buys, and it is not cosmetic:
//   the user can be shown a truthful list of what each app holds
//   incremental consent stops silently REPLACING the previous grant
//   revocation is per-grant, not "log out everywhere"</div>
<p>The problem it removes is subtle and real. Without it, an app asking for one extra scope starts a fresh
authorization that may <b>replace</b> everything previously granted — so a user who declines the new
permission can lose the ones they had already agreed to, with nothing in the protocol saying that happened.
<code>update</code> versus <code>replace</code> makes that an explicit, auditable choice.</p>
<p>You will meet this in regulated finance rather than in general-purpose OAuth, and it is worth recognising
because it is the direction the mature end of the ecosystem is moving: consent as a durable, inspectable
record rather than a side effect of a redirect.`,
docs:[['FAPI 2.0 Security Profile','https://openid.net/specs/fapi-security-profile-2_0-final.html'],['FAPI 2.0 Message Signing','https://openid.net/specs/fapi-message-signing-2_0.html'],['RFC 9126 — Pushed Authorization Requests','https://www.rfc-editor.org/rfc/rfc9126'],['RFC 9101 — JWT-Secured Authorization Request (JAR)','https://www.rfc-editor.org/rfc/rfc9101'],['OpenID Foundation — certification','https://openid.net/certification/']],
ex:{title:'Check a deployment against the FAPI baseline',
prompt:`Write <code>Fapi</code> with three methods. <code>static boolean clientAuthOk(String method)</code> accepts only <code>"private_key_jwt"</code> and <code>"tls_client_auth"</code>, rejecting <code>"client_secret_basic"</code>, <code>"client_secret_post"</code>, <code>"none"</code> and null — no shared secret is permitted. <code>static boolean tokenBindingOk(String binding)</code> accepts only <code>"mtls"</code> and <code>"dpop"</code>, rejecting <code>"bearer"</code> and null. <code>static boolean baselineCompliant(boolean pkceS256, boolean par, String clientAuth, String tokenBinding, boolean exactRedirect)</code> is true only when every requirement holds.`,
starter:`public class Fapi {
    static boolean clientAuthOk(String method) {
        return false;
    }
    static boolean tokenBindingOk(String binding) {
        return false;
    }
    static boolean baselineCompliant(boolean pkceS256, boolean par, String clientAuth,
                                     String tokenBinding, boolean exactRedirect) {
        return false;
    }
}`,
tests:[{d:'private_key_jwt is accepted',re:'"private_key_jwt"'},{d:'mTLS client auth is accepted',re:'"tls_client_auth"'},{d:'shared-secret client auth is refused',re:'default|return\\s+false'},{d:'mTLS-bound tokens are accepted',re:'"mtls"'},{d:'DPoP-bound tokens are accepted',re:'"dpop"'},{d:'plain bearer tokens are refused',re:'default|return\\s+false'},{d:'PKCE is required',re:'pkceS256'},{d:'PAR is required',re:'\\bpar\\b'},{d:'exact redirect matching is required',re:'exactRedirect'},{d:'every requirement must hold',re:'&&'}],
behavior:`clientAuthOk("private_key_jwt") and clientAuthOk("tls_client_auth") are true; clientAuthOk("client_secret_basic") and clientAuthOk(null) are false, because a shared secret exists in two places and can leak from either. tokenBindingOk("dpop") and tokenBindingOk("mtls") are true; tokenBindingOk("bearer") is false, since bearer semantics are exactly what the profile removes. baselineCompliant(true,true,"private_key_jwt","dpop",true) is true, and flipping any single argument to a weaker value makes it false — a profile is only as strong as its weakest permitted option, which is the whole reason profiles remove options rather than recommend them.`,
hints:['Two switch statements, each with two accepting cases and <code>default: return false;</code>.','Guard null before switching, or return false in the default arm after a null check.','Compose the last method from the two checks plus the three booleans, joined with &&.'],
solution:`public class Fapi {
    static boolean clientAuthOk(String method) {
        if (method == null) return false;
        switch (method) {
            case "private_key_jwt":   // asymmetric: nothing shared to leak
            case "tls_client_auth":
                return true;
            default:
                return false;         // client_secret_* and none are not permitted
        }
    }
    static boolean tokenBindingOk(String binding) {
        if (binding == null) return false;
        switch (binding) {
            case "mtls":
            case "dpop":
                return true;
            default:
                return false;         // plain bearer is what the profile removes
        }
    }
    static boolean baselineCompliant(boolean pkceS256, boolean par, String clientAuth,
                                     String tokenBinding, boolean exactRedirect) {
        return pkceS256
            && par
            && clientAuthOk(clientAuth)
            && tokenBindingOk(tokenBinding)
            && exactRedirect;
    }
}`}},

{id:'ao8',title:'Continuous Access Evaluation: revocation that arrives in seconds',body:`
<p>The token lesson left an unresolved tension. Self-contained tokens verify offline, which is why they
scale — and it is also why you cannot revoke one. The standard mitigation is a short lifetime, so the
industry settled on "your access ends within fifteen minutes". For a user who was just fired, or a
device that just failed a compliance check, fifteen minutes is a long time.</p>
<p><b>Continuous Access Evaluation</b> is the answer that does not require giving up offline
verification: instead of shortening the token, the resource server is <i>told</i> when something
changes.</p>

<h4>The shift: polling to events</h4>
<div class="codeSample" data-hl>SHORT LIFETIMES (the old trade)
  token lives 5-15 min -> revocation lands within 5-15 min
  cost: constant refresh traffic, and you still cannot act faster

INTROSPECTION (the other old option)
  ask the issuer on every call -> instant, and you have rebuilt the
  network round trip that self-contained tokens existed to remove

CAE
  keep long-lived tokens AND offline verification, and have the issuer
  PUSH an event when something changes:
     user disabled · password reset · session revoked · risk detected
     · device fell out of compliance · network location changed
  the resource server then rejects the affected token immediately.</div>
<p>The token has not changed and is still cryptographically valid. What changed is that the verifier now
holds a fact that overrides it — the same shape as a certificate revocation list, arriving by push
rather than poll.</p>

<h4>How the event gets there</h4>
<p>The delivery mechanism is standardised as <b>Shared Signals</b>: a <b>Security Event Token</b> (a JWT
carrying an event rather than an identity) delivered over a subscription. Two profiles matter — CAEP
for access changes, and RISC for account-level compromise signals shared between providers.</p>
<div class="codeSample" data-hl>// a Security Event Token: a JWT whose payload is an EVENT
{ "iss": "https://idp.example.com",
  "aud": "orders-api",
  "iat": 1767222000,
  "jti": "evt-91c",
  "events": {
    "https://schemas.openid.net/secevent/caep/event-type/session-revoked": {
      "subject": { "format": "iss_sub", "sub": "u-4817" },
      "event_timestamp": 1767221990
    } } }

// verify it exactly like any other token: signature, iss, aud, replay.
// an unauthenticated "revoke this user" endpoint is a denial-of-service tool.</div>

<h4>What the receiver has to do</h4>
<ol>
<li><b>Verify the event</b> as rigorously as a token. It changes access, so it is security-relevant
input.</li>
<li><b>Maintain state.</b> This is the real cost: the resource server must keep a revocation list
keyed by subject or session and consult it during authorization. A purely stateless verifier cannot
participate in CAE at all.</li>
<li><b>Handle missed events.</b> Push delivery fails. Without a fallback the system degrades silently
into "no revocation", which is the worst failure because it looks fine. Periodic reconciliation, or a
token lifetime short enough to bound the gap, is still required.</li>
<li><b>Decide the fail mode.</b> If the event stream is down, do you keep honouring tokens or start
rejecting? Both are defensible; not having chosen is not.</li>
</ol>

<h4>The trade, plainly</h4>
<p>CAE narrows the revocation window from minutes to seconds, and for high-value sessions that is worth
real effort. But notice what it costs: <b>the resource server becomes stateful</b>, which is precisely
the property self-contained tokens were adopted to avoid. It is not a free win but a considered trade —
you accept some state in exchange for near-real-time control.</p>
<p>So the sensible posture is layered rather than either/or: short lifetimes as the floor that works
everywhere, CAE on top for the sessions and events where seconds matter, and grant revocation as the
thing that actually stops continued access. And it remains true that no mechanism recalls a token
already in flight — CAE shortens the window; it does not close it.</p>`,
docs:[['OpenID — Continuous Access Evaluation Profile (CAEP)','https://openid.net/specs/openid-caep-specification-1_0.html'],['RFC 8417 — Security Event Token (SET)','https://www.rfc-editor.org/rfc/rfc8417'],['OpenID — Shared Signals Framework','https://openid.net/specs/openid-sharedsignals-framework-1_0.html'],['RFC 8935 — Push-Based Delivery of Security Event Tokens','https://www.rfc-editor.org/rfc/rfc8935']],
ex:{title:'Apply a revocation event',
prompt:`Write <code>Caep</code> with three methods. <code>static boolean eventTrusted(String iss, String expectedIss, String aud, String selfId, java.util.Set&lt;String&gt; seenJtis, String jti)</code> requires a matching issuer and audience and an unseen <code>jti</code> — an unauthenticated revocation endpoint is a denial-of-service tool. <code>static boolean stillValid(boolean signatureValid, boolean notExpired, java.util.Set&lt;String&gt; revokedSubjects, String sub)</code> returns true only when the token verifies, has not expired, and the subject is <b>not</b> in the revocation set. <code>static boolean canParticipate(boolean keepsRevocationState)</code> returns that flag: a purely stateless verifier cannot do CAE at all.`,
starter:`import java.util.*;

public class Caep {
    static boolean eventTrusted(String iss, String expectedIss, String aud, String selfId,
                                Set<String> seenJtis, String jti) {
        return false;
    }
    static boolean stillValid(boolean signatureValid, boolean notExpired,
                              Set<String> revokedSubjects, String sub) {
        return false;
    }
    static boolean canParticipate(boolean keepsRevocationState) {
        return false;
    }
}`,
tests:[{d:'the event issuer must match',re:'iss\\s*!=\\s*null|expectedIss'},{d:'the event audience must be this service',re:'selfId'},{d:'replayed events are rejected',re:'contains\\s*\\(\\s*jti\\s*\\)'},{d:'the signature still has to verify',re:'signatureValid'},{d:'expiry still applies',re:'notExpired'},{d:'a revoked subject is rejected',re:'revokedSubjects'},{d:'participation requires keeping state',re:'return\\s+keepsRevocationState'}],
behavior:`eventTrusted("https://idp","https://idp","orders-api","orders-api", new HashSet<>(), "evt-1") is true; a mismatched issuer or audience, or a jti already seen, is false — a revocation event changes access, so it must be verified as rigorously as a token or it becomes a way for anyone to sign your users out. stillValid(true, true, Set.of(), "u-1") is true, while stillValid(true, true, Set.of("u-1"), "u-1") is false: the token is still cryptographically valid and still unexpired, and the verifier now holds a fact that overrides it. canParticipate(false) is false, which is the real cost of CAE — the resource server becomes stateful, the very property self-contained tokens were adopted to avoid.`,
hints:['Four conditions in eventTrusted: issuer, audience, non-null jti, and not already seen.','stillValid needs all three: signature, expiry, and absence from the revocation set.','The last method genuinely just returns its argument — that is the point being made.'],
solution:`import java.util.*;

public class Caep {
    static boolean eventTrusted(String iss, String expectedIss, String aud, String selfId,
                                Set<String> seenJtis, String jti) {
        if (iss == null || aud == null || jti == null || seenJtis == null) return false;
        if (seenJtis.contains(jti)) return false;          // replay
        return iss.equals(expectedIss) && aud.equals(selfId);
    }
    static boolean stillValid(boolean signatureValid, boolean notExpired,
                              Set<String> revokedSubjects, String sub) {
        if (!signatureValid || !notExpired) return false;
        // the token verifies; the received event overrides it
        return revokedSubjects == null || !revokedSubjects.contains(sub);
    }
    static boolean canParticipate(boolean keepsRevocationState) {
        // a stateless verifier has nowhere to record the revocation
        return keepsRevocationState;
    }
}`}},

{id:'ao9',title:'Resource indicators: one token per audience',body:`
<p>A client that talks to five APIs asks for the scopes it needs across all five, and receives <b>one
access token that all five accept</b>. That is the default behaviour of most authorization servers, and it
is a design flaw hiding in plain sight: whichever of those five APIs is weakest now holds a credential
that works at the other four.</p>

<h4>The failure, concretely</h4>
<p>The reporting service is compromised — a log leak, a debug endpoint, an SSRF, take your pick. The
attacker now has bearer tokens belonging to real users. Those tokens carry
<code>scope: "reports.read payments.write"</code> because the client needed both, and they are accepted by
the payments API, which is well-written, well-tested and entirely uninvolved in the breach. The blast
radius of the weakest service became the union of everything the client was allowed to do.</p>
<p>The obvious answer — "the payments API should check the scope" — does not help. The scope
<i>is</i> present and valid. Scope answers <b>what</b> may be done; it does not answer <b>where</b> the
token may be presented.</p>

<h4>The resource parameter (RFC 8707)</h4>
<p><b>Resource indicators</b> let the client name the API it intends to call, on the authorization request
and again on the token request. The authorization server issues a token whose <code>aud</code> is that
resource — and only that resource:</p>
<div class="codeSample" data-hl>POST /token
  grant_type=authorization_code&code=...
  &resource=https://api.payments.example.com     <- the intended audience
  &scope=payments.write

// -> { "access_token": "...", "aud": "https://api.payments.example.com" }
//    presented to the reporting API, this token is refused: wrong audience.

// need to call two APIs? two token requests, from the same grant.
// need to narrow an existing token? RFC 8693 token exchange, downscoped.</div>
<p>The mechanism is only half the story, though. A resource indicator is <b>worthless unless the resource
server validates <code>aud</code></b> — and audience validation is the check most often skipped, because a
token that verifies cryptographically and carries the right scope <i>looks</i> correct. Both halves are
required: the AS must issue narrowly, and every RS must refuse tokens not addressed to it.</p>

<h4>Where the audience is a security boundary</h4>
<ul>
<li><b>Scope names collide.</b> Two teams both define <code>read</code>. Without an audience, a token
minted for one service's <code>read</code> satisfies the other's check.</li>
<li><b>Third-party APIs.</b> Sending a token to an external service is handing over a credential; if it is
audience-restricted to that service, the worst case is bounded.</li>
<li><b>Service chains.</b> When service A calls B which calls C, forwarding A's token to C is the confused
deputy from the service-to-service stream. Token exchange issues a fresh, narrowly-audienced token at each
hop instead.</li>
</ul>

<h4>The cost, stated plainly</h4>
<p>More token requests, more caching logic in clients, and more configuration on the authorization server —
resources must be registered, and clients must be told which they may request. Providers differ: some
implement <code>resource</code>, some use a non-standard <code>audience</code> parameter, some derive the
audience from scope naming conventions. The principle survives the variation: <b>a token should be usable
in exactly one place, and that place should check that it is the one</b>.</p>`,
docs:[['RFC 8707 — Resource Indicators for OAuth 2.0','https://www.rfc-editor.org/rfc/rfc8707'],['RFC 8693 — OAuth 2.0 Token Exchange','https://www.rfc-editor.org/rfc/rfc8693'],['RFC 9700 — OAuth 2.0 Security Best Current Practice','https://www.rfc-editor.org/rfc/rfc9700']],
ex:{title:'Validate the audience at the resource server',lang:'js',
run:{call:'tokenUsableAt',cases:[{name:'a single-string audience naming this API',args:['https://api.billing.example.com','https://api.billing.example.com'],expect:true},{name:'an array audience containing this API',args:[['https://api.billing.example.com','https://api.reports.example.com'],'https://api.reports.example.com'],expect:true},{name:'a token minted for a different API',args:['https://api.billing.example.com','https://api.payments.example.com'],expect:false},{name:'no audience claim at all is not a pass',args:[null,'https://api.billing.example.com'],expect:false},{name:'an empty array names nobody',args:[[],'https://api.billing.example.com'],expect:false}]},
prompt:`Write <code>function tokenUsableAt(tokenAud, resourceId)</code> returning <code>true</code> only when the token's <code>aud</code> names this resource. <code>aud</code> may be a string <b>or</b> an array of strings — the JWT specification permits both, and handling only one is a real-world bug. A missing audience is a rejection, never a wildcard.`,
starter:`function tokenUsableAt(tokenAud, resourceId) {
  return false;
}`,
solution:`function tokenUsableAt(tokenAud, resourceId) {
  if (!tokenAud || !resourceId) return false;
  if (Array.isArray(tokenAud)) return tokenAud.includes(resourceId);
  return tokenAud === resourceId;
}`,
tests:[{d:'a missing audience is rejected',re:'!tokenAud|tokenAud\\s*==\\s*null'},{d:'the array form is handled',re:'Array\\s*\\.\\s*isArray'},{d:'array membership is checked',re:'includes\\s*\\(\\s*resourceId|indexOf\\s*\\(\\s*resourceId'},{d:'the string form is compared exactly',re:'tokenAud\\s*===\\s*resourceId|resourceId\\s*===\\s*tokenAud'}],
behavior:`Five real cases. The array case is the one that bites: aud is defined as a string OR an array of strings, so a verifier written against the single-string form quietly rejects every multi-audience token — or, worse, a verifier written as a substring test accepts https://api.billing.example.com.attacker.net. The null case is the one that matters most: treating a missing audience as "no restriction" turns every token in your estate into a token for this API, which is precisely the situation resource indicators exist to end.`,
hints:['Two shapes to handle: a string and an array of strings.','Array.isArray tells you which branch you are in.','Missing means refuse. A token with no audience is not a token for everyone.']}},

{id:'ao10',title:'Cross-device flows: QR login, device code and consent phishing',body:`
<p>Three flows share one shape: the device that <b>gets</b> access is not the device that
<b>authenticates</b>. The device flow puts a code on a TV and asks you to type it on your phone. QR login
shows a code on a laptop that a phone app scans. CIBA sends a push to a phone while a call-centre agent
waits. Each solves a real problem — no keyboard, no browser, no shared session — and each introduces the
same structural weakness.</p>

<h4>The weakness: consent without context</h4>
<p>In a normal browser flow, the thing that starts the request and the thing that approves it are the same
context, bound by the same session, and the user sees the URL. Cross-device breaks that binding. The user
is asked to approve something they cannot see, initiated somewhere they cannot verify, on a device that
has no connection to the one that will be granted access.</p>
<p>An attacker therefore does not need to steal anything. They need only <b>start a flow and get the
victim to complete it</b>:</p>
<div class="codeSample" data-hl>1. attacker starts a device-code flow for a real client, real IdP
2. IdP returns:  user_code = WDJB-MJHT   verification_uri = https://id.example.com/device
3. attacker emails the victim: "IT security check — go to id.example.com/device, enter WDJB-MJHT"
4. victim authenticates AT THE REAL IdP, sees a real consent screen, approves
5. attacker polls the token endpoint and receives the victim's tokens

// nothing was spoofed. no password was captured. MFA was satisfied — by the victim,
// for a session the attacker started. the phishing-resistant part was never bypassed;
// it was never the target.</div>
<p>QR-jacking is the same attack with a picture: an attacker's QR code, displayed on a page the victim
trusts. And the <b>illicit consent grant</b> is its application-level cousin: a malicious registered app
asks for broad scopes, and the consent screen is real, so nothing looks wrong.</p>

<h4>Why passkeys do not save you here</h4>
<p>Worth being precise, because it is a common misreading. WebAuthn is phishing-resistant because the
credential is bound to an origin, so it cannot be replayed at a fake site. In a cross-device attack there
<i>is</i> no fake site — the user authenticates at the genuine origin, with the genuine authenticator, and
the ceremony succeeds exactly as designed. What was phished is the <b>authorization</b>, not the credential.</p>

<h4>The defences, in order of effectiveness</h4>
<ul>
<li><b>Do not enable the flow where it is not needed.</b> Device flow exists for input-constrained
devices. Enabling it for every client, as many providers do by default, hands the attacker a starting
point.</li>
<li><b>Bind the code to the approving user's action.</b> Requiring the user to <i>type</i> a short code
displayed on the initiating device — rather than tapping "approve" — means an attacker must get their code
in front of the victim and persuade them to enter it, which is a visible, describable act.</li>
<li><b>Show what and where.</b> The consent screen should name the client, the scopes, and the requesting
device's location or network. "Approve sign-in for Smart TV in Warsaw" is a question a user can answer.</li>
<li><b>Short expiry and rate-limited polling.</b> Minutes, not hours, and one grant per code.</li>
<li><b>Exclude high-value scopes.</b> Admin, payment and consent-granting scopes should require a
same-device flow, unconditionally.</li>
<li><b>Proximity where the platform offers it.</b> FIDO's hybrid transport uses Bluetooth proximity between
the two devices, which is the only defence here that is not advisory — it makes remote approval physically
impossible.</li>
</ul>
<p>The general principle, and it outlives all three protocols: <b>consent is only meaningful when the user
can see what they are consenting to and knows why they were asked</b>. Cross-device flows remove both, so
whatever you can add back — a code they must type, a device they must recognise, a scope you refuse to
grant this way — is the whole of the security.</p>`,
docs:[['OAuth 2.0 Cross-Device Flows Best Current Practice','https://datatracker.ietf.org/doc/draft-ietf-oauth-cross-device-security/'],['RFC 8628 — OAuth 2.0 Device Authorization Grant','https://www.rfc-editor.org/rfc/rfc8628'],['Microsoft — device code phishing','https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-device-code']],
ex:{title:'Gate a cross-device approval',lang:'js',
run:{call:'approveCrossDevice',cases:[{name:'the right code, entered in time, ordinary scope',args:['WDJB-MJHT','WDJB-MJHT',30,300,false],expect:true},{name:'a code the user did not get from this device',args:['AAAA-BBBB','WDJB-MJHT',30,300,false],expect:false},{name:'the code expired before approval',args:['WDJB-MJHT','WDJB-MJHT',301,300,false],expect:false},{name:'a high-value scope may never be approved cross-device',args:['WDJB-MJHT','WDJB-MJHT',30,300,true],expect:false},{name:'tapping approve without entering a code',args:['','WDJB-MJHT',30,300,false],expect:false}]},
prompt:`Write <code>function approveCrossDevice(enteredCode, expectedCode, secondsElapsed, maxAgeSeconds, highValueScope)</code> returning <code>true</code> only when the user typed the exact expected code, within <code>maxAgeSeconds</code>, for a scope that is not high-value. A high-value scope is refused <b>regardless</b> of everything else — check it first.`,
starter:`function approveCrossDevice(enteredCode, expectedCode, secondsElapsed, maxAgeSeconds, highValueScope) {
  return false;
}`,
solution:`function approveCrossDevice(enteredCode, expectedCode, secondsElapsed, maxAgeSeconds, highValueScope) {
  if (highValueScope) return false;                       // never cross-device
  if (!enteredCode || enteredCode !== expectedCode) return false;
  return secondsElapsed <= maxAgeSeconds;
}`,
tests:[{d:'high-value scopes are refused first',re:'highValueScope'},{d:'an empty entry is not an approval',re:'!enteredCode|enteredCode\\s*===\\s*["\\x27]["\\x27]'},{d:'the code must match exactly',re:'enteredCode\\s*!==\\s*expectedCode|enteredCode\\s*===\\s*expectedCode'},{d:'expiry is enforced',re:'secondsElapsed\\s*<=?\\s*maxAgeSeconds|secondsElapsed\\s*>'}],
behavior:`Five cases run. The empty-code case encodes the design point of the whole lesson: an approval that requires only a tap can be obtained by an attacker who sends a push at the right moment, while an approval that requires typing a code shown on the initiating device requires the attacker to get that code in front of the victim — a step the victim can notice and describe afterwards. The high-value case is deliberately unconditional: some scopes should have no cross-device path at all, so the check comes before anything else and cannot be reasoned around by a correct code. Expiry is a rate-limit on the whole attack: a code alive for five minutes gives the attacker five minutes to write a convincing email.`,
hints:['One check is unconditional and comes first.','An empty string is not a match — reject falsy input before comparing.','Elapsed time within the maximum is the last condition, not the first.']}}
]});
