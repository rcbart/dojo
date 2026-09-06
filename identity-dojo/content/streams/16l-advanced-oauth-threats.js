STREAMS.push({icon:'🛡️',iam:true,sec:'Advanced OAuth & threats',title:'Advanced OAuth 2.0 & OIDC Threats',blurb:'The hard edges of OAuth in production: token introspection and revocation, the JWT validation checklist, PAR/JAR/RAR, DPoP and mTLS-bound (sender-constrained) tokens, and a catalog of attacks with the defenses from the OAuth Security BCP.',lessons:[

{id:'ao1',title:'Introspection & revocation',body:`

<p>Opaque access tokens carry no data. A resource server validates them at the authorization server&#8217;s <b>introspection</b> endpoint (RFC 7662), which returns <code>active: true/false</code> plus metadata. <b>Revocation</b> (RFC 7009) lets a client kill a token or refresh token, on logout or a lost device. A <b>refresh token</b> is a long-lived token used only to get new short-lived access tokens without logging in again.</p>
<!--flow:ao1-introspection-->
<h4>Token introspection: step by step</h4>
<div class="flowDia"><svg viewBox="0 0 600 252" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Token introspection"><defs><marker id="ao1-introspection-ah-front" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent)"/></marker><marker id="ao1-introspection-ah-back" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent2)"/></marker><marker id="ao1-introspection-ah-attack" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--bad)"/></marker><marker id="ao1-introspection-ah-x" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--muted)"/></marker></defs><line x1="74" y1="54" x2="74" y2="240" class="fdLife"/><line x1="526" y1="54" x2="526" y2="240" class="fdLife"/><rect x="35" y="8" width="78" height="46" rx="8" class="fdActor"/><text x="74" y="27" class="fdActorT">API</text><text x="74" y="42" class="fdActorS">resource server</text><rect x="433" y="8" width="186" height="46" rx="8" class="fdActor"/><text x="526" y="35.5" class="fdActorT">Authorization Server</text><rect x="14" y="89" width="329.59999999999997" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="186.79999999999998" y="104" class="fdSelfT">opaque token arrives, nothing to read locally</text><circle cx="14" cy="100" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="14" y="103.5" class="fdNumT" style="fill:var(--muted)">1</text><line x1="77" y1="138" x2="521" y2="138" stroke="var(--accent2)" class="fdArrow" marker-end="url(#ao1-introspection-ah-back)"/><text x="315" y="129" class="fdLabel">POST /introspect, token + API’s OWN credentials</text><circle cx="92" cy="138" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="92" y="141.5" class="fdNumT" style="fill:var(--accent2)">2</text><line x1="523" y1="168" x2="79" y2="168" stroke="var(--accent2)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#ao1-introspection-ah-back)"/><text x="285" y="159" class="fdLabel">{active:true, sub, scope, exp, aud}</text><circle cx="508" cy="168" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="508" y="171.5" class="fdNumT" style="fill:var(--accent2)">3</text><rect x="14" y="185" width="329.59999999999997" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="186.79999999999998" y="200" class="fdSelfT">cache briefly; treat active:false as a hard no</text><circle cx="14" cy="196" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="14" y="199.5" class="fdNumT" style="fill:var(--muted)">4</text><text x="300" y="222" class="fdNote">Freshness you can revoke, at the price of a network hop, the JWT trade-off inverted.</text></svg></div>
<ol class="fdSteps">
<li><b>API:</b> opaque token arrives, nothing to read locally</li>
<li><b>API → Authorization Server:</b> POST /introspect, token + API’s OWN credentials <i>(back channel)</i></li>
<li><b>Authorization Server → API:</b> {active:true, sub, scope, exp, aud} <i>(back channel)</i></li>
<li><b>API:</b> cache briefly; treat active:false as a hard no</li>
</ol>
<!--/flow:ao1-introspection-->
<p>Treat a token as usable only when the server knows it and it has neither expired nor been revoked.</p>

<h4>The endpoints, and who may call them</h4>
<div class="codeSample" data-hl>POST /introspect            RFC 7662 - "is this token still good, and what does it mean?"
  token=...&token_type_hint=access_token
  -> { "active": true, "scope": "orders:read", "sub": "ada",
       "aud": "orders-api", "exp": 1767225600, "client_id": "web" }

POST /revoke                RFC 7009 - "stop honoring this"
  token=...&token_type_hint=refresh_token
  -> 200, ALWAYS. even for an unknown token.</div>
<p><b>Introspection endpoints must be authenticated.</b> An open one is an oracle for testing stolen tokens, and it leaks scopes and subjects. <b>Revocation returns 200 even for a token it has never seen</b>, deliberately. Distinguishing "revoked" from "unknown" would turn it into a token-existence oracle.</p>

<h4>The single field that matters</h4>
<p><code>active</code> means the server honors the token now: issued by it, not expired, not revoked, and the grant behind it still standing. A <code>{"active": false}</code> response carries no other claims, on purpose.</p>

<h4>The cost, and the fix</h4>
<p>Introspection is a network call on every request, which self-contained tokens exist to avoid. The <b>split-token</b> (or phantom-token) pattern resolves it: hand the browser an <i>opaque</i> token, and have the gateway introspect it once, then forward a short-lived JWT inward. A <b>JWT</b> is a JSON Web Token: a small signed document, three base64 pieces separated by dots, that carries claims such as who the user is and when the token expires. Anyone can read it; only the issuer can produce a valid signature, so the services behind the gateway can check it without another network call.</p>

<h4>What revocation does not do</h4>
<p>Revoking a refresh token does not invalidate access tokens already issued from it. Those stay valid until <code>exp</code>. Revoking one token is not revoking the <b>grant</b>: only that stops future refreshes. "Remove this app's access" means the grant. <b>CAE</b>, continuous access evaluation, closes this same gap. Instead of a token being valid until it expires, the identity provider pushes a signal ("this user's session was revoked") and the application acts on it at once.</p>`,
docs:[['Token introspection (RFC 7662)','https://www.rfc-editor.org/rfc/rfc7662'],['Token revocation (RFC 7009)','https://www.rfc-editor.org/rfc/rfc7009']],
ex:{title:'Interpret an introspection response',lang:'js',
run:{call:'active',cases:[{name:'found and not expired',args:[true,false],expect:true},{name:'found but expired',args:[true,true],expect:false},{name:'not found',args:[false,false],expect:false},{name:'not found and expired',args:[false,true],expect:false}]},
prompt:`Write <code>function active(found, expired)</code> returning <code>true</code> only when the token was found in the authorization server's store <b>and</b> has not expired. Everything else is <code>active: false</code>. Introspection deliberately reveals nothing more.`,
starter:`function active(found, expired) {
  return false;
}`,
solution:`function active(found, expired) {
  return found && !expired;
}`,
tests:[{d:'the token must exist',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:found\\s*&&))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:found\\s*&&)[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:found\\s*&&)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:found\\s*&&)[^{]*?return\\s+\\k<av>\\b)'},{d:'and must not be expired',re:'!\\s*expired'}],
behavior:`All four combinations are executed. Note what the response does NOT do: a revoked, unknown or malformed token all return the same flat active:false, so an attacker learns nothing from probing.`,
hints:['Two conditions: it exists, and it has not expired.','Use ! for "not expired".','Anything else is inactive: one answer for every failure mode.']}},

{id:'ao2',title:'The JWT validation checklist',body:`

<p>A <b>JWT</b> is a JSON Web Token: a small signed document, three base64 pieces separated by dots, that carries claims such as who the user is and when the token expires. A claim is one fact inside the token. Anyone can read a JWT; only the issuer can produce a valid signature. A self-contained JWT access token is only as trustworthy as your checks. Verifying the signature is necessary but <b>not sufficient</b>. You also confirm the <code>iss</code> (issuer) is who you expect, the <code>aud</code> (audience) names <i>your</i> API, and <code>exp</code>/<code>nbf</code> place the token within its lifetime.</p>
<p>Skipping the audience check is a classic bug. A token minted for another service still has a valid signature, so without <code>aud</code> you accept a token never meant for you.</p>

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
<p>The ordering is not cosmetic. Steps 1&ndash;3 establish that the payload is <i>authentic</i>; everything after reads data proven to come from the issuer. Reading claims before verifying the signature, even to pick the key, is how <code>alg:none</code> and key-confusion attacks land. The <code>kid</code> step looks the key up in the issuer's <b>JWKS</b>, its JSON Web Key Set: the list of public keys the issuer publishes at a well-known URL so anyone can fetch them and check its signatures.</p>

<h4>The two that are almost always wrong</h4>
<p><b>Trusting the header.</b> The header is attacker-controlled input. Pin the algorithm, and resolve <code>kid</code> only within keys you already trust. A verifier that fetches a <code>jku</code> from the token is fetching keys the attacker chose.</p>
<p><b>Clock skew.</b> Many verifiers allow far too much. Five minutes of skew is five extra minutes of life for every stolen token. Sixty seconds is usually plenty. If it is not, fix the clocks, not the validator.</p>

<h4>What the checklist cannot tell you</h4>
<p>Step 8 guards against <b>replay</b>: capturing a valid token and sending it again later. A token can pass all nine checks and still be the wrong basis for a decision. It proves <i>who issued it</i> and <i>who it is for</i>, not that the issuer had authority over the claim, nor that the subject owns the record requested.</p>

<h4>The checklist as running code</h4>
<div class="codeSample" data-hl>// node, with the jose library: the nine steps in their order
import { createRemoteJWKSet, jwtVerify } from 'jose';

// steps 1+2: keys come from the issuer YOU configured, never from the token
const JWKS = createRemoteJWKSet(
  new URL('https://issuer.example.com/.well-known/jwks.json'));

const { payload } = await jwtVerify(token, JWKS, {
  algorithms: ['RS256'],                  // 1: alg pinned by you
  issuer:   'https://issuer.example.com', // 4: exact match
  audience: 'https://api.example.com',    // 5: names ME
  clockTolerance: 60,                     // 6+7: bounded skew, in seconds
});                                       // 3: verified inside the same call
// 8: a jti replay cache is yours to add, if you keep one
// 9: only now do payload.scope and friends mean anything</div>
<p>One call carries seven of the nine steps. Distrust two library defaults: an algorithms list you did not write yourself, and a clock tolerance measured in minutes.</p>`,
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
tests:[{d:'issuer must match exactly',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:"https://as\\.example\\.com"))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:"https://as\\.example\\.com")[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:"https://as\\.example\\.com")[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:"https://as\\.example\\.com")[^{]*?return\\s+\\k<av>\\b)'},{d:'audience must be this API',re:'"orders-api"'},{d:'must not be expired',re:'exp\\s*>\\s*now'}],
behavior:`The third case is the one that matters: a perfectly valid token minted by the same issuer for billing-api is rejected here. Skipping the audience check is how one compromised service becomes access to every service, and here it fails a named test rather than a pattern match.`,
hints:['Three conditions joined with &&.','Compare strings with === in JavaScript.','Expiry is strict: exp must be greater than now, not equal.']}},

{id:'ao3',title:'PAR, JAR/JARM & RAR',body:`

<p>Newer OAuth extensions harden the request itself. <b>PAR</b> (Pushed Authorization Requests) sends the request parameters to the server over a back channel <i>first</i>, so nothing sensitive rides in the browser URL. <b>JAR/JARM</b> sign the request and response objects so they cannot be tampered with. <b>RAR</b> (Rich Authorization Requests) replaces coarse scopes with structured <b>authorization details</b>, so a request names an amount and account, not a blunt <code>payments</code> scope. A <b>scope</b> is the named permission an app asks for, such as <code>calendar.read</code>.</p>
<!--flow:ao3-par-->
<h4>Pushed Authorization Requests: step by step</h4>
<div class="flowDia"><svg viewBox="0 0 620 254" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Pushed Authorization Requests"><defs><marker id="ao3-par-ah-front" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent)"/></marker><marker id="ao3-par-ah-back" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent2)"/></marker><marker id="ao3-par-ah-attack" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--bad)"/></marker><marker id="ao3-par-ah-x" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--muted)"/></marker></defs><line x1="74" y1="42" x2="74" y2="222" class="fdLife"/><line x1="546" y1="42" x2="546" y2="222" class="fdLife"/><rect x="35" y="8" width="78" height="34" rx="8" class="fdActor"/><text x="74" y="29.5" class="fdActorT">Client</text><rect x="453" y="8" width="186" height="34" rx="8" class="fdActor"/><text x="546" y="29.5" class="fdActorT">Authorization Server</text><line x1="77" y1="90" x2="541" y2="90" stroke="var(--accent2)" class="fdArrow" marker-end="url(#ao3-par-ah-back)"/><text x="325" y="81" class="fdLabel">POST /par, full authz request, client-authenticated</text><circle cx="92" cy="90" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="92" y="93.5" class="fdNumT" style="fill:var(--accent2)">1</text><line x1="543" y1="120" x2="79" y2="120" stroke="var(--accent2)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#ao3-par-ah-back)"/><text x="295" y="111" class="fdLabel">request_uri, short-lived, one-time</text><circle cx="528" cy="120" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="528" y="123.5" class="fdNumT" style="fill:var(--accent2)">2</text><line x1="77" y1="150" x2="541" y2="150" stroke="var(--accent)" class="fdArrow" marker-end="url(#ao3-par-ah-front)"/><text x="325" y="141" class="fdLabel">/authorize?request_uri=… (tiny, tamper-proof)</text><circle cx="92" cy="150" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="92" y="153.5" class="fdNumT" style="fill:var(--accent)">3</text><rect x="250" y="167" width="356" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="436" y="182" class="fdSelfT">parameters were already vetted on the back channel</text><circle cx="250" cy="178" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="250" y="181.5" class="fdNumT" style="fill:var(--muted)">4</text><text x="310" y="204" class="fdNote">The browser now carries a reference, not the request, nothing left to tamper with.</text><line x1="18" y1="240" x2="44" y2="240" stroke="var(--accent2)" class="fdArrow"/><text x="50" y="244" class="fdLegend">back channel (server to server)</text><line x1="271.29999999999995" y1="240" x2="297.29999999999995" y2="240" stroke="var(--accent)" class="fdArrow"/><text x="303.29999999999995" y="244" class="fdLegend">front channel (via the browser)</text></svg></div>
<ol class="fdSteps">
<li><b>Client → Authorization Server:</b> POST /par, full authz request, client-authenticated <i>(back channel)</i></li>
<li><b>Authorization Server → Client:</b> request_uri, short-lived, one-time <i>(back channel)</i></li>
<li><b>Client → Authorization Server:</b> /authorize?request_uri=… (tiny, tamper-proof) <i>(front channel)</i></li>
<li><b>Authorization Server:</b> parameters were already vetted on the back channel</li>
</ol>
<!--/flow:ao3-par-->
<p>Together they push OAuth toward fine-grained, tamper-resistant authorization, the direction profiles like <b>FAPI</b> require. FAPI is the financial-grade API profile: the strictest profile of OAuth and OIDC, written for banking, with every optional protection made mandatory.</p>

<h4>What each one moves, and why</h4>
<p>All three exist because the classic authorization request travels <b>through the browser as a query
string</b>. It is visible, loggable, and modifiable by anyone who can influence the URL.</p>
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

<h4>Why RAR matters</h4>
<p>Scopes are a flat list of strings, so they can only express <i>categories</i> of permission. When consent needs to name an amount, a recipient or a single document, scopes run out. The usual workaround is to invent scope strings like <code>payment:50:GB29NWBK</code>, a structured object badly encoded. RAR makes the structure explicit, so the consent screen can say what the user is approving.</p>

<h4>When you need them</h4>
<p>For an ordinary web app with read scopes, PKCE and exact redirect matching are enough. <b>PKCE</b> is Proof Key for Code Exchange, said "pixy": the app invents a random secret at the start of a login, sends a hash of it, and reveals the secret only when it collects the token. An attacker who steals the login code in the middle can't finish without the secret. Reach for these when the request parameters are sensitive, when a regulator requires non-repudiation, or when consent must be fine-grained: payments, health data, anything under an open banking regime.</p>`,
docs:[['PAR (RFC 9126)','https://www.rfc-editor.org/rfc/rfc9126'],['RAR (RFC 9396)','https://www.rfc-editor.org/rfc/rfc9396']],
},

{id:'ao4',title:'DPoP & sender-constrained tokens',body:`

<p>A plain <b>bearer</b> token is like cash: whoever holds it can spend it, so a stolen token is game over. <b>Sender-constrained</b> tokens fix this by binding the token to a key only the legitimate client holds. Two mechanisms do it: <b>mTLS-bound</b> tokens and <b>DPoP</b>. mTLS is mutual TLS: ordinary TLS proves the server's identity to the client, and mutual TLS has the client present a certificate too. DPoP is demonstrating proof of possession: the app signs each request with a private key it holds, so a stolen token is useless without the key.</p>
<p>The acceptance rule: a bearer token is fine on its own, but a sender-constrained token must come with a valid proof of possession.</p>

<h4>What "bearer" means</h4>
<p>A <b>bearer</b> instrument belongs to whoever is holding it and carries no notion of an owner. That is the security model of an ordinary access token.</p>
<p>So the question a resource server asks is weak:</p>
<div class="codeSample" data-hl>BEARER                "do you have a valid token?"
                      -> anyone who obtained it, however they obtained it, passes

PROOF OF POSSESSION   "do you have a valid token AND can you prove you are
                       the party it was issued to?"
                      -> a copied token, on its own, is worthless</div>
<p>Tokens leak in ordinary ways: a URL in a log, a crash dump, a debug endpoint. None require breaking
cryptography. With bearer semantics, each is a full account compromise until the token expires.</p>

<h4>The idea: tie the token to a key</h4>
<p>Sender-constraining adds one requirement. When the token is issued, it records <b>which key its
rightful holder controls</b>. Presenting the token is then not enough. You must also prove you hold that key.</p>
<p>You prove possession of a private key by signing something with it. The verifier compares the key you signed with against the key recorded in the token. Match, and you are the intended holder. No match, and it is not yours.</p>
<div class="codeSample" data-hl>// the token records the key it belongs to, in a "confirmation" claim
{ "sub": "ada", "aud": "orders-api", "exp": ...,
  "cnf": { "jkt": "0ZcOCORZ..." } }      <- a fingerprint of the holder's public key

// and every request carries a fresh proof, signed by the matching private key
// steal the token without the key, and you have a ticket you cannot use</div>

<h4>Two ways to hold that key</h4>
<p><b>mTLS</b> uses the client's TLS certificate, the key already proven during the handshake. Strong
and hardware-friendly, but it needs a <b>PKI</b>, and client certificates fail in browsers and through most
proxies. A PKI is a public key infrastructure: the certificate authorities, certificates and rules that let a public key be trusted as belonging to a particular name. It's what makes the padlock in a browser mean something, and standing one up for your own clients is real work.</p>
<p><b>DPoP</b> has the application generate its own key pair and sign a small proof per request. No PKI,
no infrastructure, and it works anywhere ordinary HTTPS works. That makes it the practical option for
SPAs, mobile apps and public clients. An SPA is a single-page app: the whole application runs as JavaScript in the browser, with nowhere to hide a secret.</p>

<h4>What this does and does not buy</h4>
<p>It shrinks the value of a <i>stolen</i> token to nearly nothing. It does not help if the attacker took
the key as well: a compromised process holds both. And it does nothing about a token correctly
issued to a party who then misuses it, or about a missing audience check.</p>
<p><b>Treat it as the last layer, not the first.</b> Short lifetimes, audience restriction and not
logging tokens come first. The next lesson is the mechanics.</p>`,
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
tests:[{d:'the token must be sender-constrained',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:senderConstrained\\s*&&))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:senderConstrained\\s*&&)[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:senderConstrained\\s*&&)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:senderConstrained\\s*&&)[^{]*?return\\s+\\k<av>\\b)'},{d:'and the key proof must verify',re:'keyProofValid'}],
behavior:`The third case is the trap: a plain bearer token accompanied by a valid-looking proof must still be refused, because nothing binds that proof to the token. Constraint and proof are two halves of one check.`,
hints:['Both halves are required, so use &&.','A proof means nothing if the token is not bound to a key.','A bound token with no proof is equally unusable.']}},

{id:'ao4b',title:'DPoP in depth: proving you hold the key',body:`
<p>Every bearer token shares one weakness: possession is the whole of the entitlement. Steal it from a
log or a crash dump and you are indistinguishable from the legitimate client.
<b>DPoP</b> (Demonstrating Proof-of-Possession, RFC 9449) removes that property, without the client
certificates that kept mTLS out of reach for most apps.</p>
<!--flow:ao4b-dpop-->
<h4>DPoP: proof-of-possession per request: step by step</h4>
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
<p>The client <b>signs every API request with a private key</b>, and the token records a thumbprint of
that key, so a resource server can check that whoever presents the token also holds it.</p>

<h4>The proof JWT</h4>
<p>Each request carries an extra header, <code>DPoP</code>, whose value is a small JWT the client mints
on the spot:</p>
<div class="codeSample" data-hl>// header, carries the PUBLIC key, so the server needs no prior registration
{ "typ": "dpop+jwt", "alg": "ES256",
  "jwk": { "kty":"EC", "crv":"P-256", "x":"...", "y":"..." } }

// payload, binds this proof to THIS request
{ "htm": "POST",                                  // the HTTP method
  "htu": "https://api.example.com/orders",        // the URI, no query or fragment
  "iat": 1767222000,                              // when it was minted
  "jti": "b7c1-9f2e-...",                         // unique: for the replay cache
  "ath": "fUHyO2r2Z3..." }                        // SHA-256 of the access token

// and the request itself
POST /orders
Authorization: DPoP eyJhbGciOi...     <- note the scheme is DPoP, not Bearer
DPoP: eyJ0eXAiOiJkcG9wK2p3dCI...</div>
<p><code>htm</code> and <code>htu</code> stop a captured proof being reused against another
endpoint. <code>ath</code> ties it to one access token, so a proof captured with one token cannot be
paired with another.</p>

<h4>The cnf claim: where the binding lives</h4>
<p>The access token must record which key it is bound to. That is the <b>confirmation claim</b>,
<code>cnf</code>, holding <code>jkt</code>: the base64url SHA-256 thumbprint of the client's public
JWK.</p>
<div class="codeSample" data-hl>// inside the access token, issued by the authorization server
{ "sub": "ada", "aud": "orders-api", "exp": 1767225600,
  "cnf": { "jkt": "0ZcOCORZNYy-DWpqq30jZyJGHTN0d2HglBV3uiguA4I" } }

// the resource server's check:
//   thumbprint( proof.header.jwk )  ==  token.cnf.jkt   ?
// if not, the presenter does not hold the key this token was issued to.</div>
<p>The same <code>cnf</code> mechanism carries mTLS binding too, using <code>x5t#S256</code> instead.
Sender-constrained is one concept with two key types.</p>

<h4>What the resource server must do</h4>
<ol>
<li>Confirm the <code>DPoP</code> header's <code>typ</code> is <code>dpop+jwt</code> and its algorithm
is one you accept: never <code>none</code>, never symmetric.</li>
<li>Verify the proof's signature <b>using the JWK in its own header</b>. That alone proves only that the
sender holds some key; step 4 binds it.</li>
<li>Check <code>htm</code> and <code>htu</code> match the request you are serving.</li>
<li><b>Compute the thumbprint of that JWK and compare it to <code>cnf.jkt</code> in the access
token.</b> Without this, the proof shows only that someone owns some key.</li>
<li>Check <code>ath</code> equals the hash of the presented access token.</li>
<li>Check <code>iat</code> is recent, and that <code>jti</code> has not been seen before.</li>
</ol>
<p>Step 4 is the one implementations get wrong. Omit it and everything still works, but the token is
effectively a bearer token.</p>

<h4>Replay, clocks, and the nonce</h4>
<p>A proof is valid for a short window, so an attacker who captures one can replay it against the same
endpoint. Two defenses, used together:</p>
<ul>
<li><b>A replay cache.</b> Store each <code>jti</code> for the acceptance window and reject repeats.
Cheap for one server, awkward across a fleet: it needs shared state.</li>
<li><b>Server-provided nonces.</b> The server returns <code>DPoP-Nonce</code> and a
<code>use_dpop_nonce</code> error. The client retries with that nonce in the proof. The server now
chooses the value, so a proof cannot be minted in advance or replayed after the nonce rotates. No
per-request storage is needed.</li>
</ul>
<p>Proofs are short-lived, so a client whose clock is minutes off fails everything. Allow a small,
bounded window and log rejections.</p>

<h4>Binding the refresh token too</h4>
<p>Constraining access tokens while leaving the refresh token bearer is pointless: a stolen refresh
token just mints new ones. For a public client, DPoP binds the refresh token too, and the same key
must be proven at the token endpoint. Rotating the key means re-authenticating.</p>

<h4>DPoP or mTLS?</h4>
<div class="codeSample" data-hl>                      DPoP                        mTLS-bound (RFC 8705)
key material          app-generated, in memory    an X.509 client certificate
infrastructure        none, ordinary HTTPS       PKI, and TLS terminated where
                                                  the cert is still visible
works in a browser    yes                         effectively no
proxies / CDN         transparent                 client certs often break
strength              key can be extracted from   hardware-backed, harder to steal
                      a compromised process
typical use           SPAs, mobile, public        service-to-service, FAPI,
                      clients                     regulated environments</div>
<p><b>Neither is a substitute for the basics.</b> Sender constraint reduces the value of a stolen token.
It does not fix a missing audience check, an unvalidated redirect URI, or a token logged in plaintext.
Treat it as the last layer, not the first.</p>`,
docs:[['RFC 9449: OAuth 2.0 Demonstrating Proof of Possession (DPoP)','https://www.rfc-editor.org/rfc/rfc9449'],['RFC 7638 (JSON Web Key (JWK) Thumbprint)','https://www.rfc-editor.org/rfc/rfc7638'],['RFC 8705: OAuth 2.0 Mutual-TLS Client Authentication and Certificate-Bound Access Tokens','https://www.rfc-editor.org/rfc/rfc8705'],['RFC 7800: Proof-of-Possession Key Semantics for JWTs (the cnf claim)','https://www.rfc-editor.org/rfc/rfc7800']],
ex:{title:'Verify a DPoP proof against the token binding',
prompt:`Write <code>Dpop</code> with four methods. <code>static boolean bindingMatches(String jwkThumbprint, String cnfJkt)</code> returns true only when both are non-null and equal: the step that ties the proof to the token, and the one implementations forget. <code>static boolean requestMatches(String htm, String htu, String method, String uri)</code> requires all four non-null, with <code>htm</code> equal to <code>method</code> and <code>htu</code> equal to <code>uri</code>. <code>static boolean fresh(long iat, long now, long windowSeconds)</code> is true when <code>now - iat</code> is between <code>0</code> and <code>windowSeconds</code> inclusive. <code>static boolean accept(String jwkThumbprint, String cnfJkt, String htm, String htu, String method, String uri, long iat, long now, java.util.Set&lt;String&gt; seenJtis, String jti)</code> requires all of the above plus a <code>jti</code> not already in <code>seenJtis</code>, using a 60-second window.`,
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
tests:[{d:'the thumbprint must be present',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:jwkThumbprint\\s*!=\\s*null|null\\s*!=\\s*jwkThumbprint))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:jwkThumbprint\\s*!=\\s*null|null\\s*!=\\s*jwkThumbprint)[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:jwkThumbprint\\s*!=\\s*null|null\\s*!=\\s*jwkThumbprint)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:jwkThumbprint\\s*!=\\s*null|null\\s*!=\\s*jwkThumbprint)[^{]*?return\\s+\\k<av>\\b)'},{d:'thumbprint is compared to the cnf claim',re:'equals\\s*\\(\\s*cnfJkt|cnfJkt\\s*\\.\\s*equals'},{d:'the proof is bound to the HTTP method',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:htm\\s*\\.\\s*equals\\s*\\(\\s*method|method\\s*\\.\\s*equals\\s*\\(\\s*htm))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:htm\\s*\\.\\s*equals\\s*\\(\\s*method|method\\s*\\.\\s*equals\\s*\\(\\s*htm)[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:htm\\s*\\.\\s*equals\\s*\\(\\s*method|method\\s*\\.\\s*equals\\s*\\(\\s*htm)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:htm\\s*\\.\\s*equals\\s*\\(\\s*method|method\\s*\\.\\s*equals\\s*\\(\\s*htm)[^{]*?return\\s+\\k<av>\\b)'},{d:'the proof is bound to the URI',re:'htu\\s*\\.\\s*equals\\s*\\(\\s*uri|uri\\s*\\.\\s*equals\\s*\\(\\s*htu'},{d:'a proof from the future is rejected',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:age\\s*>=\\s*0|now\\s*-\\s*iat\\s*>=\\s*0|iat\\s*<=\\s*now))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:age\\s*>=\\s*0|now\\s*-\\s*iat\\s*>=\\s*0|iat\\s*<=\\s*now)[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:age\\s*>=\\s*0|now\\s*-\\s*iat\\s*>=\\s*0|iat\\s*<=\\s*now)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:age\\s*>=\\s*0|now\\s*-\\s*iat\\s*>=\\s*0|iat\\s*<=\\s*now)[^{]*?return\\s+\\k<av>\\b)'},{d:'the freshness window is bounded',re:'<=\\s*windowSeconds|windowSeconds\\s*>='},{d:'replayed jtis are rejected',re:'(?:if\\s*\\(\\s*[^;{]*(?:contains\\s*\\(\\s*jti\\s*\\))[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:return\\s+(?!\\s*!)[^;{]*(?:contains\\s*\\(\\s*jti\\s*\\)))|(?:(?<h1>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:contains\\s*\\(\\s*jti\\s*\\))[^{]*?return\\s+\\k<h1>\\b)'},{d:'acceptance requires every check',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:bindingMatches\\s*\\())|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:bindingMatches\\s*\\()[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:bindingMatches\\s*\\()[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:bindingMatches\\s*\\()[^{]*?return\\s+\\k<av>\\b)'},{d:'a guard returns its constant, not the negation of it',re:'return\\s+!\\s*\\(?\\s*(?:true|false)\\s*\\)?\\s*;',not:true}],
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

<p>The OAuth 2.0 Security Best Current Practice catalogs the attacks that matter, and each has a standard defense:</p>
<ul>
<li><b>CSRF on the redirect</b> → PKCE, the OIDC <code>nonce</code>, or a one-time <code>state</code> bound to the user agent (RFC 9700 accepts any of the three).</li>
<li><b>Token/code replay</b> → short lifetimes and a one-time <code>nonce</code>.</li>
<li><b>Authorization-code interception</b> (public clients) → <b>PKCE</b>.</li>
<li><b>Open redirect / mix-up</b> → register and match <b>exact</b> <code>redirect_uri</code> values, never wildcards.</li>
</ul>
<p>Three of those names need unpacking. <b>CSRF</b> is cross-site request forgery: a malicious page makes your browser send a request to a site you're logged into, and the site can't tell it wasn't you. The browser attaches your cookies automatically, which is the whole problem. <b>PKCE</b> is Proof Key for Code Exchange, said "pixy": the app invents a random secret at the start of a login, sends a hash of it, and reveals the secret only when it collects the token. An attacker who steals the login code in the middle can't finish without the secret. <b>OIDC</b> is OpenID Connect, a thin layer on top of OAuth that adds a signed statement of who logged in, called an ID token. Its <code>nonce</code> is a random value used once, so a login response can't be replayed. A <b>redirect URI</b> is the address the login sends the browser back to, with the result attached. If an attacker controls it, they get the result.</p>

<h4>The catalog: what each one exploits</h4>
<p><b>1. Open redirect.</b> Your app has an endpoint that forwards to a URL from a parameter. An
attacker registers <code>https://you.example/go?to=https://evil.example</code> as the target, and the
authorization code lands on their server. The fix is an <b>allowlist of exact redirect URIs</b>, never
reflecting a user-supplied URL into a redirect.</p>

<p><b>2. Mix-up attack.</b> An app that supports several IdPs is tricked into sending the code from
IdP&nbsp;A to an attacker-controlled IdP's token endpoint, which keeps it. An <b>IdP</b> is an identity provider: the system that holds the accounts and does the actual logging in, then tells other applications who you are. Defense: track which IdP each
authorization request went to, and check the <code>iss</code> in the response matches (RFC 9207 added
an explicit <code>iss</code> parameter for this).</p>

<p><b>3. CSRF on the callback.</b> Without <code>state</code>, an attacker completes their own
authorization, then feeds <i>their</i> code to your callback in the victim's browser. The victim's
session is now linked to the attacker's account. Defense: a one-time value bound to the session and
checked on return, whether <code>state</code>, PKCE, or the OIDC <code>nonce</code>.</p>

<p><b>4. Authorization code injection.</b> Distinct from CSRF: the attacker injects a code obtained
elsewhere into a legitimate flow. A client secret does not help, since the client is genuine. <b>PKCE</b> is
the defense, because the victim's client holds a verifier that does not match the challenge the
attacker's code was bound to.</p>

<p><b>5. Token replay and theft.</b> Bearer tokens leak through logs, referrers, proxies and browser
storage. A <b>bearer token</b> works for whoever holds it, like cash, with no proof of who is presenting it. Defense in layers: short lifetimes, audience restriction, and sender-constraining with DPoP or
mTLS so possession of the token alone is not enough.</p>

<p><b>6. Refresh token reuse.</b> A <b>refresh token</b> is a long-lived token used only to get new short-lived access tokens without logging in again. A stolen one is the most valuable credential in the system.
Defense: <b>rotation with reuse detection</b>. If an old token is presented again, assume theft and
revoke the whole family, since either the legitimate client or the attacker is replaying.</p>

<p><b>7. Consent phishing.</b> No protocol flaw at all: the attacker registers a plausible app, sends a
genuine consent link, and the user grants real scopes to a malicious client. Defense is
organizational: app allowlisting, publisher verification, scope review, and admin consent for
sensitive scopes.</p>

<p><b>8. alg confusion and key confusion.</b> Accepting the token's own <code>alg</code> lets an
attacker propose <code>none</code>, or hand an RSA public key to an HMAC verifier as the shared secret.
Defense: pin the algorithm, and pin where keys come from.</p>

<div class="codeSample" data-hl>ATTACK                    BOUND BY WHAT
open redirect             exact pre-registered redirect_uri
mix-up                    iss checked against the request (RFC 9207)
callback CSRF             state, bound to the session
code injection            PKCE verifier
token replay              short exp + aud + DPoP/mTLS
refresh reuse             rotation with reuse detection
consent phishing          nothing in the protocol - governance
alg confusion             algorithm pinned by the verifier</div>
<p><b>Every protocol defense is a binding</b>: the response to the request, the code to the client, the
token to a key. The one row with no protocol answer attacks the human, and it is growing fastest.</p>`,
docs:[['OAuth 2.0 Security BCP','https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics'],['Redirect URI validation','https://www.rfc-editor.org/rfc/rfc6749#section-3.1.2']],
},
{id:'ao6',title:'Refresh token rotation & reuse detection',body:`



<p>Refresh tokens are long-lived, so a stolen one is a serious prize: it mints fresh access tokens indefinitely. Two mechanisms bound that risk.</p>
<h4>What it's for</h4>
<p>An access token lasts minutes. A refresh token lasts days or weeks, and its only job is to fetch new access tokens while the user isn't there. That makes it the one token in the system an attacker most wants. Rotation and reuse detection exist so that a stolen refresh token stops working the moment both the thief and the real app try to spend it. The theft then shows up as a clear signal instead of running silently for weeks.</p>

<h4>When to use it</h4>
<p>Any public client that holds a refresh token: a single-page app in the browser, a mobile app, a desktop app. None of them can keep a secret, so the token itself is the only thing the server can check. The OAuth Security BCP makes rotation mandatory for them. Confidential clients, such as a web backend with a client secret, can turn it on too. For them the secret already ties the token to one holder, so rotation is a second layer rather than the only one.</p>

<h4>When not to</h4>
<ul>
<li>A job with no user, such as a nightly sync between two servers: use the client credentials grant. It issues no refresh token, so there is nothing to rotate.</li>
<li>A client that can sender-constrain its refresh token with DPoP or mTLS: do that instead. A bound token can't be replayed, so there is no reuse to detect.</li>
<li>A client that fires refreshes in parallel and has no serialization: fix the client first, or naive reuse detection will log real users out.</li>
</ul>
<!--flow:ao6-rotation-->
<h4>Refresh rotation and reuse detection: step by step</h4>
<div class="flowDia"><svg viewBox="0 0 700 356" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Refresh rotation and reuse detection"><defs><marker id="ao6-rotation-ah-front" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent)"/></marker><marker id="ao6-rotation-ah-back" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent2)"/></marker><marker id="ao6-rotation-ah-attack" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--bad)"/></marker><marker id="ao6-rotation-ah-x" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--muted)"/></marker></defs><line x1="74" y1="54" x2="74" y2="324" class="fdLife"/><line x1="350" y1="54" x2="350" y2="324" class="fdLife"/><line x1="626" y1="54" x2="626" y2="324" class="fdLife"/><rect x="-6.699999999999989" y="8" width="161.39999999999998" height="46" rx="8" class="fdActor"/><text x="74" y="35.5" class="fdActorT">Legitimate client</text><rect x="257" y="8" width="186" height="46" rx="8" class="fdActor"/><text x="350" y="35.5" class="fdActorT">Authorization Server</text><rect x="582.2" y="8" width="87.6" height="46" rx="8" class="fdActor"/><text x="626" y="27" class="fdActorT">Attacker</text><text x="626" y="42" class="fdActorS">stole RT₁ earlier</text><line x1="77" y1="102" x2="345" y2="102" stroke="var(--accent2)" class="fdArrow" marker-end="url(#ao6-rotation-ah-back)"/><text x="227" y="93" class="fdLabel">refresh with RT₁</text><circle cx="92" cy="102" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="92" y="105.5" class="fdNumT" style="fill:var(--accent2)">1</text><line x1="347" y1="132" x2="79" y2="132" stroke="var(--accent2)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#ao6-rotation-ah-back)"/><text x="197" y="123" class="fdLabel">new AT + RT₂: RT₁ is now “used”</text><circle cx="332" cy="132" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="332" y="135.5" class="fdNumT" style="fill:var(--accent2)">2</text><line x1="14" y1="158" x2="686" y2="158" class="fdPhase"/><text x="350" y="162" class="fdPhaseT">the stolen copy surfaces</text><line x1="623" y1="192" x2="355" y2="192" stroke="var(--bad)" class="fdArrow" stroke-dasharray="7 4" marker-end="url(#ao6-rotation-ah-attack)"/><text x="473" y="183" class="fdLabel fdLabelBad">refresh with RT₁, a USED token</text><circle cx="608" cy="192" r="9" class="fdNum" style="stroke:var(--bad)"/><text x="608" y="195.5" class="fdNumT" style="fill:var(--bad)">3</text><rect x="185.20000000000002" y="209" width="329.59999999999997" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="358" y="224" class="fdSelfT">reuse detected → revoke the whole token family</text><circle cx="185.20000000000002" cy="220" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="185.20000000000002" y="223.5" class="fdNumT" style="fill:var(--muted)">4</text><line x1="353" y1="258" x2="621" y2="258" stroke="var(--bad)" class="fdArrow" stroke-dasharray="7 4" marker-end="url(#ao6-rotation-ah-attack)"/><text x="503" y="249" class="fdLabel fdLabelBad">invalid_grant</text><circle cx="368" cy="258" r="9" class="fdNum" style="stroke:var(--bad)"/><text x="368" y="261.5" class="fdNumT" style="fill:var(--bad)">5</text><line x1="77" y1="288" x2="345" y2="288" stroke="var(--accent2)" class="fdArrow" marker-end="url(#ao6-rotation-ah-back)"/><text x="227" y="279" class="fdLabel">RT₂ is dead too → full re-authentication</text><circle cx="92" cy="288" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="92" y="291.5" class="fdNumT" style="fill:var(--accent2)">6</text><text x="350" y="306" class="fdNote">One theft costs one re-login, and produces a loud, unambiguous signal.</text><line x1="18" y1="342" x2="44" y2="342" stroke="var(--accent2)" class="fdArrow"/><text x="50" y="346" class="fdLegend">back channel (server to server)</text><line x1="271.29999999999995" y1="342" x2="297.29999999999995" y2="342" stroke="var(--bad)" class="fdArrow" stroke-dasharray="7 4"/><text x="303.29999999999995" y="346" class="fdLegend">attack path</text></svg></div>
<ol class="fdSteps">
<li><b>Legitimate client → Authorization Server:</b> refresh with RT₁ <i>(back channel)</i></li>
<li><b>Authorization Server → Legitimate client:</b> new AT + RT₂: RT₁ is now “used” <i>(back channel)</i></li>
<li><b>Attacker → Authorization Server:</b> refresh with RT₁, a USED token <b>⚠ attack</b></li>
<li><b>Authorization Server:</b> reuse detected → revoke the whole token family</li>
<li><b>Authorization Server → Attacker:</b> invalid_grant <b>⚠ attack</b></li>
<li><b>Legitimate client → Authorization Server:</b> RT₂ is dead too → full re-authentication <i>(back channel)</i></li>
</ol>
<!--/flow:ao6-rotation-->
<p><b>Step 1.</b> The app's access token has run out, so it sends its refresh token, RT₁, to the authorization server over the back channel. That means server to server, with no browser in the way. Nothing is wrong yet.</p>
<p><b>Step 2.</b> The server hands back a new access token and a new refresh token, RT₂, and marks RT₁ as used. From now on RT₁ is dead.</p>
<p><b>Step 3.</b> An attacker who copied RT₁ earlier tries to spend it. The request looks the same as a real one, except that the token has already been used.</p>
<p><b>Step 4.</b> A used token coming back means two parties hold a copy. The server can't tell which one is the thief, so it revokes the whole family: RT₁, RT₂ and every access token minted from them.</p>
<p><b>Step 5.</b> The attacker gets <code>invalid_grant</code> and nothing else.</p>
<p><b>Step 6.</b> The real app's next refresh with RT₂ fails too, and the user has to log in again. That one re-login is the cost, and the failed refresh is the signal that someone else had the token.</p>

<p><b>Rotation.</b> Every time a refresh token is used, the authorization server issues a <b>new</b> refresh token and <b>invalidates the old one</b>. A given refresh token is usable exactly once.</p>
<p><b>Reuse detection.</b> Because each refresh token is single-use, an <i>already-rotated</i> token presented again means something is wrong: a <b>replay</b> (a valid message captured and sent again later), or the legitimate client and an attacker <b>both</b> hold a copy. Assume compromise and <b>revoke the entire token family</b> (the whole session lineage), forcing a fresh login. That turns a stolen refresh token from an open-ended breach into a short, self-detecting one.</p>
<p>Rotation is <b>mandatory for public clients</b> (SPAs, mobile) per the OAuth Security BCP, since they cannot protect a long-lived secret. A <b>BCP</b> is a best current practice: a document from the IETF, the body that writes internet standards, saying how to use a standard safely. For OAuth, the Security BCP is the current list of "do this, never that". Pair rotation with short access-token lifetimes and, ideally, sender-constrained tokens (DPoP or mTLS) so even a captured token cannot be replayed elsewhere. <b>DPoP</b> is demonstrating proof of possession: the app signs each request with a private key it holds. <b>mTLS</b> is mutual TLS: the client presents a certificate, not just the server. Either way, a stolen token is useless without the key.</p>

<h4>Why refresh tokens are the crown jewels</h4>
<p>Access tokens expire in minutes, which makes them survivable when leaked. A refresh token is
long-lived by design, and its purpose is to mint new access tokens without the user present. Steal one
and you have durable, silent access: no login, no MFA prompt, nothing in the authentication logs. <b>MFA</b> is multi-factor authentication: proving who you are with two different kinds of evidence, usually something you know (a password) plus something you have (a phone or a security key). A stolen refresh token skips that check entirely.</p>
<p>A public client (a SPA or a mobile app) cannot keep a secret, so it cannot prove it is the rightful
holder. With two copies in play, the server sees identical requests from both.</p>

<h4>The reuse insight</h4>
<p>What matters is what a <b>reuse</b> means:</p>
<div class="codeSample" data-hl>normal:   RT1 -> (AT1, RT2) -> (AT2, RT3) -> ...     each used once, then dead

theft:    attacker steals RT2 and redeems it   -> gets AT2, RT3
          the real client later redeems RT2    -> ALREADY USED

// the server cannot tell which party is the thief. it does not need to:
// a reused token means SOMEONE is replaying, so revoke the WHOLE FAMILY -
// RT1, RT2, RT3 and every access token issued from them.
// the legitimate user is logged out. the attacker is too. that is the trade.</div>

<h4>The practical wrinkles</h4>
<p><b>Race conditions.</b> A page that fires three requests at once may refresh concurrently, and naive
reuse detection reads that as theft and logs the user out. Allow a short grace window where the
immediately-previous token still works, and serialize refreshes in the client.</p>
<p><b>Lost writes.</b> If the client redeems a token but the response never arrives, it holds a dead
token with no way back. Handle the failure explicitly, or the session simply stops working.</p>
<p><b>Rotation is the fallback, not the goal.</b> If you can sender-constrain the refresh token with
DPoP or mTLS, do that instead: a bound token cannot be replayed, so there is no collision to
detect. OAuth 2.1 requires one or the other, because a bare bearer refresh token in a public
client is the highest-value credential in the system.</p>`,
docs:[['Refresh token rotation (OAuth Security BCP)','https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics'],['Token revocation (RFC 7009)','https://www.rfc-editor.org/rfc/rfc7009']],
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
tests:[{d:'current token rotates; old token triggers family revocation',re:'(?:return\\s+|=\\s*)(?!\\s*!\\s*\\()[^;{]*isCurrent\\s*\\?\\s*"rotate: issue new, revoke old"\\s*:\\s*"reuse detected: revoke the family"|(?:return\\s+|=\\s*)(?!\\s*!\\s*\\()[^;{]*!\\s*isCurrent\\s*\\?\\s*"reuse detected: revoke the family"\\s*:\\s*"rotate: issue new, revoke old"|if\\s*\\(\\s*isCurrent\\s*\\)\\s*\\{?\\s*return\\s+"rotate: issue new, revoke old"[^{]*?return\\s+"reuse detected: revoke the family"|if\\s*\\(\\s*!\\s*isCurrent\\s*\\)\\s*\\{?\\s*return\\s+"reuse detected: revoke the family"[^{]*?return\\s+"rotate: issue new, revoke old"'},{d:'rotation is required for public clients',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:equals\\s*\\(\\s*"public"\\s*\\)))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:equals\\s*\\(\\s*"public"\\s*\\))[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:equals\\s*\\(\\s*"public"\\s*\\))[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:equals\\s*\\(\\s*"public"\\s*\\))[^{]*?return\\s+\\k<av>\\b)'},{d:'a guard returns its constant, not the negation of it',re:'return\\s+!\\s*\\(?\\s*(?:true|false)\\s*\\)?\\s*;',not:true}],
behavior:`onUse(true) returns "rotate: issue new, revoke old"; onUse(false) returns "reuse detected: revoke the family", the self-detecting response to a replayed refresh token. rotationRequired("public") is true: SPAs and mobile apps must rotate.`,
hints:['Each refresh token is single-use: using the current one rotates it; seeing an old one means compromise.','On reuse, revoke the whole token family to force a fresh login.','Public clients cannot protect a long-lived secret, so rotation is required for them.']}},

{id:'ao7',title:'FAPI: what a hardened OAuth profile looks like',body:`

<p>Plain OAuth 2.0 is a framework with many optional parts. That flexibility is why it is
everywhere, and why two conformant deployments can differ widely in security. When the
stakes are high (moving money, releasing health records), "conformant" is not a useful bar.</p>
<p>A <b>profile</b> fixes this by removing choices. <b>FAPI</b> (Financial-grade API, from the OpenID
Foundation) is the best-known one: a named set of mandatory requirements, with a certification suite
that proves an implementation meets them. It is the industry's answer to what maximum-assurance OAuth
looks like.</p>

<h4>What a profile is</h4>
<div class="codeSample" data-hl>the base spec says          a profile says
  "should"                    MUST
  "one of these options"      exactly this one
  "implementers may choose"   here is the choice, and here is the test suite

// FAPI adds no new cryptography. It removes the freedom to be weak.</div>
<p>This is the same move as OAuth 2.1, applied harder and to a narrower audience. OAuth 2.1 raises the
floor for everyone. FAPI raises the ceiling for regulated deployments.</p>

<h4>The requirements, and the attack each one answers</h4>
<ul>
<li><b>PKCE with S256, always.</b> Authorization code interception and injection. <b>PKCE</b> is Proof Key for Code Exchange, said "pixy": the app invents a random secret at the start of a login, sends a hash of it, and reveals the secret only when it collects the token. An attacker who steals the login code in the middle can't finish without the secret. <b>S256</b> is the hash method: the app sends the SHA-256 fingerprint of its secret rather than the secret itself.</li>
<li><b>Sender-constrained access tokens</b>: mTLS-bound or DPoP. A stolen token is inert without the
key. <b>mTLS</b> is mutual TLS, where the client presents a certificate as well as the server; <b>DPoP</b> is demonstrating proof of possession, where the app signs each request with a private key it holds. Baseline OAuth's bearer semantics, where a token works for whoever holds it, like cash, are not permitted.</li>
<li><b>Strong client authentication</b>: <code>private_key_jwt</code> or mTLS. No shared
<code>client_secret</code>, so there is no symmetric secret to leak.</li>
<li><b>PAR</b> (pushed authorization requests). The client sends the request parameters to the
authorization server over the back channel first and gets a handle. The browser then carries only
that handle. Parameters never appear in a URL, so they cannot be tampered with or logged.</li>
<li><b>JAR</b> (JWT-secured authorization request): the request object is <i>signed</i>, so the
authorization server can prove the client authored those parameters, not an attacker who rewrote a
redirect. A <b>JWT</b> is a JSON Web Token: a small signed document, three base64 pieces separated by dots, that carries claims such as who the user is and when the token expires. Anyone can read it; only the issuer can produce a valid signature.</li>
<li><b>JARM</b> (JWT-secured authorization response): the response is signed too, closing the mirror
attack where a response is tampered with on the way back.</li>
<li><b>Exact redirect URI matching</b>, and no open redirects anywhere in the flow.</li>
<li><b>Short-lived authorization codes</b>, one-time use, bound to the client.</li>
</ul>
<p>Every item is a defense covered earlier in the course. FAPI's contribution is refusing to let any of them be optional.</p>

<h4>Two levels</h4>
<div class="codeSample" data-hl>FAPI 2.0 Security Profile     the baseline: PKCE, PAR, sender-constrained
                              tokens, strong client auth
                              -> read access, most regulated APIs

FAPI 2.0 Message Signing      adds non-repudiation: requests AND responses are
                              signed end to end, so neither party can later
                              deny what was sent
                              -> payment initiation, high-value transactions</div>
<p>The distinction is about <i>evidence</i>, not strength. The baseline protects the exchange. Message
signing produces an artifact that survives it: a signed record that stands up in a dispute months later.
That is a legal requirement, not a cryptographic one, so it is a separate level.</p>

<h4>Certification: the part that makes it real</h4>
<p>FAPI ships with a conformance suite, and implementations are formally certified. A specification
alone is a document people interpret optimistically. A test suite is a specification nobody can talk
their way past. Much of FAPI's value is that an ecosystem can <i>require certification</i> rather than
trust a vendor's claim.</p>

<h4>When it applies to you</h4>
<p>Directly, if you build in open banking (the UK and Brazilian regimes mandate it), open healthcare, or
anywhere a regulator names it. Otherwise, as a checklist for arguing that an OAuth deployment is as
strong as it reasonably can be.</p>
<p>The caveat: FAPI hardens the <i>protocol</i>. It says nothing about whether your scopes
model reality, whether the resource server checks record ownership, or whether your support tooling
lets staff read any account. A fully certified deployment can still have an <b>IDOR</b> on its main endpoint: an insecure direct object reference. The application checks that you're logged in, then hands over whatever record you name in the URL without checking it's yours. Change <code>/orders/1042</code> to <code>/orders/1043</code> and you're reading someone else's order.</p>

<h4>Grant Management: treating the grant as a thing you can manage</h4>
<p>Ordinary OAuth has a blind spot. A user consents, tokens are issued, and after that <b>nobody can
enumerate what was granted</b>. Ask which permissions an app currently holds, and when they were given,
and the protocol has no answer. The grant exists only as a consequence of tokens minted at some point.</p>
<p>Tolerable for a photo-sharing app, not under open banking, where a regulator expects
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
<p>Without grant management, an app asking for one extra scope starts a fresh
authorization that may <b>replace</b> everything previously granted. A user who declines can then lose
permissions they already agreed to. <code>update</code> versus <code>replace</code> makes that an
explicit, auditable choice.</p>
<p>You will meet this in regulated finance rather than general-purpose OAuth. It is the direction the
mature end of the ecosystem is moving: consent as a durable, inspectable record rather than a side
effect of a redirect.</p>`,
docs:[['FAPI 2.0 Security Profile','https://openid.net/specs/fapi-security-profile-2_0-final.html'],['FAPI 2.0 Message Signing','https://openid.net/specs/fapi-message-signing-2_0.html'],['RFC 9126 (Pushed Authorization Requests)','https://www.rfc-editor.org/rfc/rfc9126'],['RFC 9101 (JWT-Secured Authorization Request (JAR))','https://www.rfc-editor.org/rfc/rfc9101'],['OpenID Foundation (certification)','https://openid.net/certification/']],
ex:{title:'Check a deployment against the FAPI baseline',
prompt:`Write <code>Fapi</code> with three methods. <code>static boolean clientAuthOk(String method)</code> accepts only <code>"private_key_jwt"</code> and <code>"tls_client_auth"</code>, rejecting <code>"client_secret_basic"</code>, <code>"client_secret_post"</code>, <code>"none"</code> and null: no shared secret is permitted. <code>static boolean tokenBindingOk(String binding)</code> accepts only <code>"mtls"</code> and <code>"dpop"</code>, rejecting <code>"bearer"</code> and null. <code>static boolean baselineCompliant(boolean pkceS256, boolean par, String clientAuth, String tokenBinding, boolean exactRedirect)</code> is true only when every requirement holds.`,
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
tests:[{d:'private_key_jwt is accepted',re:'(?:clientAuthOk\\b(?:(?!\\bstatic\\b|\\bfunction\\b)[\\s\\S])*?(?:(?:case\\s*["\']private_key_jwt["\']|equals\\s*\\(\\s*["\']private_key_jwt["\']\\s*\\)|["\']private_key_jwt["\']\\s*\\.\\s*equals\\s*\\([^)]*\\)|[=!]==?\\s*["\']private_key_jwt["\']|includes\\s*\\(\\s*["\']private_key_jwt["\']\\s*\\)|contains\\s*\\(\\s*["\']private_key_jwt["\']\\s*\\))[^;}]*?return\\s+true\\b))|(?:clientAuthOk\\b(?:(?!\\bstatic\\b|\\bfunction\\b)[\\s\\S])*?(?:(?:case\\s*["\']private_key_jwt["\']|equals\\s*\\(\\s*["\']private_key_jwt["\']\\s*\\)|["\']private_key_jwt["\']\\s*\\.\\s*equals\\s*\\([^)]*\\)|[=!]==?\\s*["\']private_key_jwt["\']|includes\\s*\\(\\s*["\']private_key_jwt["\']\\s*\\)|contains\\s*\\(\\s*["\']private_key_jwt["\']\\s*\\))[^;}]*?->\\s*(?:\\{\\s*)?(?:return\\s+)?true\\b))'},{d:'mTLS client auth is accepted',re:'"tls_client_auth"'},{d:'shared-secret client auth is refused',re:'default|return\\s+false'},{d:'mTLS-bound tokens are accepted',re:'"mtls"'},{d:'DPoP-bound tokens are accepted',re:'(?:tokenBindingOk\\b(?:(?!\\bstatic\\b|\\bfunction\\b)[\\s\\S])*?(?:(?:case\\s*["\']dpop["\']|equals\\s*\\(\\s*["\']dpop["\']\\s*\\)|["\']dpop["\']\\s*\\.\\s*equals\\s*\\([^)]*\\)|[=!]==?\\s*["\']dpop["\']|includes\\s*\\(\\s*["\']dpop["\']\\s*\\)|contains\\s*\\(\\s*["\']dpop["\']\\s*\\))[^;}]*?return\\s+true\\b))|(?:tokenBindingOk\\b(?:(?!\\bstatic\\b|\\bfunction\\b)[\\s\\S])*?(?:(?:case\\s*["\']dpop["\']|equals\\s*\\(\\s*["\']dpop["\']\\s*\\)|["\']dpop["\']\\s*\\.\\s*equals\\s*\\([^)]*\\)|[=!]==?\\s*["\']dpop["\']|includes\\s*\\(\\s*["\']dpop["\']\\s*\\)|contains\\s*\\(\\s*["\']dpop["\']\\s*\\))[^;}]*?->\\s*(?:\\{\\s*)?(?:return\\s+)?true\\b))'},{d:'plain bearer tokens are refused',re:'default|return\\s+false'},{d:'PKCE is required',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:pkceS256))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:pkceS256)[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:pkceS256)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:pkceS256)[^{]*?return\\s+\\k<av>\\b)'},{d:'PAR is required',re:'\\bpar\\b'},{d:'exact redirect matching is required',re:'exactRedirect'},{d:'every requirement must hold',re:'&&'},{d:'a guard returns its constant, not the negation of it',re:'return\\s+!\\s*\\(?\\s*(?:true|false)\\s*\\)?\\s*;',not:true}],
behavior:`clientAuthOk("private_key_jwt") and clientAuthOk("tls_client_auth") are true; clientAuthOk("client_secret_basic") and clientAuthOk(null) are false, because a shared secret exists in two places and can leak from either. tokenBindingOk("dpop") and tokenBindingOk("mtls") are true; tokenBindingOk("bearer") is false, since bearer semantics are exactly what the profile removes. baselineCompliant(true,true,"private_key_jwt","dpop",true) is true, and flipping any single argument to a weaker value makes it false: a profile is only as strong as its weakest permitted option, which is the whole reason profiles remove options rather than recommend them.`,
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

<p>Self-contained tokens verify offline, which is why they scale and also why you cannot revoke one. The
standard mitigation is a short lifetime, so the industry settled on access ending within fifteen
minutes. For a user who was just fired, or a device that just failed a compliance check, fifteen
minutes is a long time.</p>
<p><b>Continuous Access Evaluation</b>, <b>CAE</b> for short, keeps offline verification. Instead of shortening the token, the
resource server is <i>told</i> when something changes.</p>

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
<p>The token has not changed. It is still cryptographically valid. The verifier now holds a fact that
overrides it, like a certificate revocation list, arriving by push rather than poll.</p>

<h4>How the event gets there</h4>
<p>The delivery mechanism is standardized as <b>Shared Signals</b>: a <b>Security Event Token</b> (a JWT
carrying an event rather than an identity) delivered over a subscription. A <b>JWT</b> is a JSON Web Token: a small signed document, three base64 pieces separated by dots, that carries claims such as who the user is and when the token expires. Anyone can read it; only the issuer can produce a valid signature. Two profiles matter. <b>CAEP</b>, the Continuous Access Evaluation Profile, is the one that standardizes CAE itself: the identity provider pushes a signal such as "this user's session was revoked" and the application acts on it at once. <b>RISC</b> is Risk Incident Sharing and Coordination: identity providers tell each other about account-level events (password reset, account disabled) so a takeover at one doesn't spread.</p>
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
<li><b>Verify the event</b> as rigorously as a token; it changes access.</li>
<li><b>Maintain state.</b> The real cost: the resource server keeps a revocation list keyed by subject
or session and consults it during authorization. A stateless verifier cannot participate in CAE.</li>
<li><b>Handle missed events.</b> Push delivery fails. Without a fallback the system degrades silently
into no revocation, the worst failure because it looks fine. Periodic reconciliation, or a token
lifetime short enough to bound the gap, is still required.</li>
<li><b>Decide the fail mode.</b> If the event stream is down, do you keep honoring tokens or start
rejecting? Both are defensible. Not having chosen is not.</li>
</ol>

<h4>The trade, plainly</h4>
<p>CAE narrows the revocation window from minutes to seconds, worth real effort for high-value sessions.
The cost: <b>the resource server becomes stateful</b>, the property self-contained tokens were adopted
to avoid. You accept state in exchange for near-real-time control.</p>
<p>The posture is layered: short lifetimes as the floor that works everywhere, CAE on top for the
sessions and events where seconds matter, and grant revocation as the thing that stops continued access.
No mechanism recalls a token already in flight. CAE shortens the window, it does not close it.</p>`,
docs:[['OpenID: Continuous Access Evaluation Profile (CAEP)','https://openid.net/specs/openid-caep-specification-1_0.html'],['RFC 8417 (Security Event Token (SET))','https://www.rfc-editor.org/rfc/rfc8417'],['OpenID (Shared Signals Framework)','https://openid.net/specs/openid-sharedsignals-framework-1_0.html'],['RFC 8935: Push-Based Delivery of Security Event Tokens','https://www.rfc-editor.org/rfc/rfc8935']],
ex:{title:'Apply a revocation event',
prompt:`Write <code>Caep</code> with three methods. <code>static boolean eventTrusted(String iss, String expectedIss, String aud, String selfId, java.util.Set&lt;String&gt; seenJtis, String jti)</code> requires a matching issuer and audience and an unseen <code>jti</code>: an unauthenticated revocation endpoint is a denial-of-service tool. <code>static boolean stillValid(boolean signatureValid, boolean notExpired, java.util.Set&lt;String&gt; revokedSubjects, String sub)</code> returns true only when the token verifies, has not expired, and the subject is <b>not</b> in the revocation set. <code>static boolean canParticipate(boolean keepsRevocationState)</code> returns that flag: a purely stateless verifier cannot do CAE at all.`,
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
tests:[{d:'the event issuer must match',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:iss\\s*!=\\s*null|expectedIss))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:iss\\s*!=\\s*null|expectedIss)[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:iss\\s*!=\\s*null|expectedIss)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:iss\\s*!=\\s*null|expectedIss)[^{]*?return\\s+\\k<av>\\b)'},{d:'the event audience must be this service',re:'selfId'},{d:'replayed events are rejected',re:'(?:if\\s*\\(\\s*[^;{]*(?:contains\\s*\\(\\s*jti\\s*\\))[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:return\\s+(?!\\s*!)[^;{]*(?:contains\\s*\\(\\s*jti\\s*\\)))|(?:(?<h1>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:contains\\s*\\(\\s*jti\\s*\\))[^{]*?return\\s+\\k<h1>\\b)'},{d:'the signature still has to verify',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:signatureValid))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:signatureValid)[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:signatureValid)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:signatureValid)[^{]*?return\\s+\\k<av>\\b)'},{d:'expiry still applies',re:'notExpired'},{d:'a revoked subject is rejected',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:revokedSubjects))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:revokedSubjects)[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:revokedSubjects)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:revokedSubjects)[^{]*?return\\s+\\k<av>\\b)'},{d:'participation requires keeping state',re:'return\\s+keepsRevocationState'},{d:'a guard returns its constant, not the negation of it',re:'return\\s+!\\s*\\(?\\s*(?:true|false)\\s*\\)?\\s*;',not:true}],
behavior:`eventTrusted("https://idp","https://idp","orders-api","orders-api", new HashSet<>(), "evt-1") is true; a mismatched issuer or audience, or a jti already seen, is false: a revocation event changes access, so it must be verified as rigorously as a token or it becomes a way for anyone to sign your users out. stillValid(true, true, Set.of(), "u-1") is true, while stillValid(true, true, Set.of("u-1"), "u-1") is false: the token is still cryptographically valid and still unexpired, and the verifier now holds a fact that overrides it. canParticipate(false) is false, which is the real cost of CAE: the resource server becomes stateful, the very property self-contained tokens were adopted to avoid.`,
hints:['Four conditions in eventTrusted: issuer, audience, non-null jti, and not already seen.','stillValid needs all three: signature, expiry, and absence from the revocation set.','The last method genuinely just returns its argument: that is the point being made.'],
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

<p>A client that talks to five APIs asks for the scopes it needs across all five and receives <b>one
access token that all five accept</b>. A <b>scope</b> is the named permission an app asks for, such as <code>calendar.read</code>. That is the default in most authorization servers, and it
is a design flaw. Whichever of the five APIs is weakest now holds a credential that works at the other
four.</p>

<h4>The failure, concretely</h4>
<p>The reporting service is compromised: a log leak, a debug endpoint, an SSRF. <b>SSRF</b> is server-side request forgery: tricking a server into making a web request on the attacker's behalf, usually to something the attacker can't reach directly, such as an internal metadata service that hands out credentials. The attacker now has
bearer tokens belonging to real users. A <b>bearer token</b> works for whoever holds it, like cash, with no proof of who is presenting it. Those tokens carry
<code>scope: "reports.read payments.write"</code> because the client needed both, and they are accepted by
the payments API, which is well-written and uninvolved in the breach.</p>
<p>Having the payments API check the scope does not help: the scope <i>is</i> present and valid. Scope
answers <b>what</b> may be done, not <b>where</b> the token may be presented.</p>

<h4>The resource parameter (RFC 8707)</h4>
<p><b>Resource indicators</b> let the client name the API it intends to call, on both the authorization
and token requests. The authorization server issues a token whose <code>aud</code> is that resource,
and only that resource. The <b>audience</b>, <code>aud</code>, is who a token is for, and an API must refuse tokens meant for someone else:</p>
<div class="codeSample" data-hl>POST /token
  grant_type=authorization_code&code=...
  &resource=https://api.payments.example.com     <- the intended audience
  &scope=payments.write

// -> { "access_token": "...", "aud": "https://api.payments.example.com" }
//    presented to the reporting API, this token is refused: wrong audience.

// need to call two APIs? two token requests, from the same grant.
// need to narrow an existing token? RFC 8693 token exchange, downscoped.</div>
<p>A resource indicator is <b>worthless unless the resource server validates <code>aud</code></b>.
Audience validation is the check most often skipped, because a token that verifies cryptographically
and carries the right scope <i>looks</i> correct. The AS must issue narrowly, and every RS must refuse
tokens not addressed to it. The AS is the authorization server, which issues tokens. An RS is a resource server, the API that receives them.</p>

<h4>Where the audience is a security boundary</h4>
<ul>
<li><b>Scope names collide.</b> Two teams both define <code>read</code>. Without an audience, a token
minted for one service's <code>read</code> satisfies the other's check.</li>
<li><b>Third-party APIs.</b> Sending a token to an external service is handing over a credential. If it is
audience-restricted to that service, the worst case is bounded.</li>
<li><b>Service chains.</b> When service A calls B which calls C, forwarding A's token to C is the confused
deputy from the service-to-service stream: a trusted service tricked into using its own authority on behalf of someone who shouldn't have it. Token exchange issues a fresh, narrowly-audienced token at each
hop instead.</li>
</ul>

<h4>The cost</h4>
<p>More token requests, more caching logic in clients, and more configuration: resources must be
registered, and clients told which they may request. Providers differ: some implement
<code>resource</code>, some use a non-standard <code>audience</code> parameter, some derive the
audience from scope naming. Whatever the mechanism, a token should be usable in exactly one place, and
that place should check that it is the one.</p>`,
docs:[['RFC 8707 (Resource Indicators for OAuth 2.0)','https://www.rfc-editor.org/rfc/rfc8707'],['RFC 8693 (OAuth 2.0 Token Exchange)','https://www.rfc-editor.org/rfc/rfc8693'],['RFC 9700 (OAuth 2.0 Security Best Current Practice)','https://www.rfc-editor.org/rfc/rfc9700']],
ex:{title:'Validate the audience at the resource server',lang:'js',
run:{call:'tokenUsableAt',cases:[{name:'a single-string audience naming this API',args:['https://api.billing.example.com','https://api.billing.example.com'],expect:true},{name:'an array audience containing this API',args:[['https://api.billing.example.com','https://api.reports.example.com'],'https://api.reports.example.com'],expect:true},{name:'a token minted for a different API',args:['https://api.billing.example.com','https://api.payments.example.com'],expect:false},{name:'no audience claim at all is not a pass',args:[null,'https://api.billing.example.com'],expect:false},{name:'an empty array names nobody',args:[[],'https://api.billing.example.com'],expect:false}]},
prompt:`Write <code>function tokenUsableAt(tokenAud, resourceId)</code> returning <code>true</code> only when the token's <code>aud</code> names this resource. <code>aud</code> may be a string <b>or</b> an array of strings: the JWT specification permits both, and handling only one is a real-world bug. A missing audience is a rejection, never a wildcard.`,
starter:`function tokenUsableAt(tokenAud, resourceId) {
  return false;
}`,
solution:`function tokenUsableAt(tokenAud, resourceId) {
  if (!tokenAud || !resourceId) return false;
  if (Array.isArray(tokenAud)) return tokenAud.includes(resourceId);
  return tokenAud === resourceId;
}`,
tests:[{d:'a missing audience is rejected',re:'(?:if\\s*\\(\\s*[^;{]*(?:!tokenAud|tokenAud\\s*==\\s*null)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:return\\s+(?!\\s*!)[^;{]*(?:!tokenAud|tokenAud\\s*==\\s*null))|(?:(?<h1>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:!tokenAud|tokenAud\\s*==\\s*null)[^{]*?return\\s+\\k<h1>\\b)'},{d:'the array form is handled',re:'Array\\s*\\.\\s*isArray'},{d:'array membership is checked',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:includes\\s*\\(\\s*resourceId|indexOf\\s*\\(\\s*resourceId))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:includes\\s*\\(\\s*resourceId|indexOf\\s*\\(\\s*resourceId)[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:includes\\s*\\(\\s*resourceId|indexOf\\s*\\(\\s*resourceId)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:includes\\s*\\(\\s*resourceId|indexOf\\s*\\(\\s*resourceId)[^{]*?return\\s+\\k<av>\\b)'},{d:'the string form is compared exactly',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:tokenAud\\s*===\\s*resourceId|resourceId\\s*===\\s*tokenAud))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:tokenAud\\s*===\\s*resourceId|resourceId\\s*===\\s*tokenAud)[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:tokenAud\\s*===\\s*resourceId|resourceId\\s*===\\s*tokenAud)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:tokenAud\\s*===\\s*resourceId|resourceId\\s*===\\s*tokenAud)[^{]*?return\\s+\\k<av>\\b)'}],
behavior:`Five real cases. The array case is the one that bites: aud is defined as a string OR an array of strings, so a verifier written against the single-string form quietly rejects every multi-audience token; or, worse, a verifier written as a substring test accepts https://api.billing.example.com.attacker.net. The null case is the one that matters most: treating a missing audience as "no restriction" turns every token in your estate into a token for this API, which is precisely the situation resource indicators exist to end.`,
hints:['Two shapes to handle: a string and an array of strings.','Array.isArray tells you which branch you are in.','Missing means refuse. A token with no audience is not a token for everyone.']}},

{id:'ao10',title:'Cross-device flows: QR login, device code and consent phishing',body:`



<p>Three flows share one shape: the device that <b>gets</b> access is not the device that
<b>authenticates</b>. The device flow puts a code on a TV and asks you to type it on your phone. QR login
shows a code on a laptop that a phone app scans. CIBA sends a push to a phone while a call-center agent
waits. <b>CIBA</b> is client-initiated backchannel authentication: the login starts on one device (the agent's screen) and you approve it on another (your phone), with no browser redirect in between. Each solves a real problem, and each introduces the same structural weakness.</p>

<h4>What it's for</h4>
<p>Some devices can't run a login. A TV has no real keyboard to type a password on. A printer has no browser. A command-line tool on a server has no screen a person is looking at. The device flow moves the login to a device that can do it. The TV shows a short code and a web address. You open that address on your phone, log in there, and type the code. The TV then collects its tokens. QR login and CIBA are the same idea with a different handoff: a picture to scan, or a push notification to approve.</p>

<h4>When to use it</h4>
<p>A streaming app signing in on a smart TV or a games console. A command-line tool that needs a user's tokens on a machine with no browser. A phone app scanning a QR code on a laptop screen to log the laptop in. A call center where the agent starts the login on their screen and you approve it on your phone, so the agent never hears your password (CIBA). In every case the person who approves is on a different device from the one that ends up with access.</p>

<h4>When not to</h4>
<ul>
<li>A web or mobile app that has a browser: use the authorization code flow with PKCE. Request and approval then share one device and one session, and the user can see the URL.</li>
<li>Admin, payment or consent-granting scopes: same-device flow only, with no exceptions.</li>
<li>A job with no user at all, such as a nightly sync: use client credentials. There is nobody to approve anything.</li>
<li>Every client, switched on by default: leave the flow disabled for clients that don't need it. Each one it's enabled for is a starting point for the attack below.</li>
</ul>

<!--flow:ao10-device-flow-->
<h4>Step by step</h4>
<div class="flowDia"><svg viewBox="0 0 640 490" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Device flow across two devices, and the consent-phishing variant"><defs><marker id="ao10-device-flow-ah-front" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent)"/></marker><marker id="ao10-device-flow-ah-back" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent2)"/></marker><marker id="ao10-device-flow-ah-attack" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--bad)"/></marker><marker id="ao10-device-flow-ah-x" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--muted)"/></marker></defs><line x1="74" y1="54" x2="74" y2="464" class="fdLife"/><line x1="238" y1="54" x2="238" y2="464" class="fdLife"/><line x1="402" y1="54" x2="402" y2="464" class="fdLife"/><line x1="566" y1="54" x2="566" y2="464" class="fdLife"/><rect x="20.2" y="8" width="107.6" height="46" rx="8" class="fdActor"/><text x="74" y="27" class="fdActorT">Phone</text><text x="74" y="42" class="fdActorS">user's browser</text><rect x="143.0" y="8" width="190.0" height="46" rx="8" class="fdActor"/><text x="238" y="27" class="fdActorT">Authorization Server</text><text x="238" y="42" class="fdActorS">the real IdP</text><rect x="316.2" y="8" width="171.6" height="46" rx="8" class="fdActor"/><text x="402" y="27" class="fdActorT">Smart TV</text><text x="402" y="42" class="fdActorS">input-constrained client</text><rect x="512.2" y="8" width="107.6" height="46" rx="8" class="fdActor"/><text x="566" y="27" class="fdActorT">Attacker</text><text x="566" y="42" class="fdActorS">acts as the TV</text><line x1="399.0" y1="102" x2="243.0" y2="102" stroke="var(--accent2)" class="fdArrow" marker-end="url(#ao10-device-flow-ah-back)"/><text x="320.0" y="93" class="fdLabel">POST /device_authorization (client_id, scope)</text><circle cx="387.0" cy="102" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="387.0" y="105.5" class="fdNumT" style="fill:var(--accent2)">1</text><line x1="241.0" y1="136" x2="397.0" y2="136" stroke="var(--accent2)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#ao10-device-flow-ah-back)"/><text x="320.0" y="127" class="fdLabel">device_code, user_code WDJB-MJHT, verification_uri</text><circle cx="253.0" cy="136" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="253.0" y="139.5" class="fdNumT" style="fill:var(--accent2)">2</text><rect x="229.6" y="170.0" width="344.8" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="402.0" y="185.0" class="fdSelfT">shows: id.example.com/device, code WDJB-MJHT</text><circle cx="229.6" cy="181.0" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="229.6" y="184.5" class="fdNumT" style="fill:var(--muted)">3</text><line x1="77.0" y1="222" x2="233.0" y2="222" stroke="var(--accent)" class="fdArrow" marker-end="url(#ao10-device-flow-ah-front)"/><text x="156.0" y="213" class="fdLabel">opens the URI, types the code, logs in, approves</text><circle cx="89.0" cy="222" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="89.0" y="225.5" class="fdNumT" style="fill:var(--accent)">4</text><line x1="399.0" y1="256" x2="243.0" y2="256" stroke="var(--accent2)" class="fdArrow" marker-end="url(#ao10-device-flow-ah-back)"/><text x="320.0" y="247" class="fdLabel">poll POST /token (device_code)</text><circle cx="387.0" cy="256" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="387.0" y="259.5" class="fdNumT" style="fill:var(--accent2)">5</text><line x1="241.0" y1="290" x2="397.0" y2="290" stroke="var(--accent2)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#ao10-device-flow-ah-back)"/><text x="320.0" y="281" class="fdLabel">access token (+ refresh token)</text><circle cx="253.0" cy="290" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="253.0" y="293.5" class="fdNumT" style="fill:var(--accent2)">6</text><line x1="563.0" y1="324" x2="243.0" y2="324" stroke="var(--bad)" class="fdArrow" marker-end="url(#ao10-device-flow-ah-attack)"/><text x="402.0" y="315" class="fdLabel fdLabelBad">same request: attacker gets its own user_code</text><circle cx="551.0" cy="324" r="9" class="fdNum" style="stroke:var(--bad)"/><text x="551.0" y="327.5" class="fdNumT" style="fill:var(--bad)">7</text><line x1="563.0" y1="358" x2="79.0" y2="358" stroke="var(--bad)" class="fdArrow" marker-end="url(#ao10-device-flow-ah-attack)"/><text x="320.0" y="349" class="fdLabel fdLabelBad">email: &quot;IT security check: enter WDJB-MJHT at id.example.com/device&quot;</text><circle cx="551.0" cy="358" r="9" class="fdNum" style="stroke:var(--bad)"/><text x="551.0" y="361.5" class="fdNumT" style="fill:var(--bad)">8</text><line x1="77.0" y1="392" x2="233.0" y2="392" stroke="var(--accent)" class="fdArrow" marker-end="url(#ao10-device-flow-ah-front)"/><text x="156.0" y="383" class="fdLabel">victim logs in at the REAL IdP and approves</text><circle cx="89.0" cy="392" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="89.0" y="395.5" class="fdNumT" style="fill:var(--accent)">9</text><line x1="241.0" y1="426" x2="561.0" y2="426" stroke="var(--bad)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#ao10-device-flow-ah-attack)"/><text x="402.0" y="417" class="fdLabel fdLabelBad">attacker polls /token: the victim's tokens</text><circle cx="253.0" cy="426" r="9" class="fdNum" style="stroke:var(--bad)"/><text x="253.0" y="429.5" class="fdNumT" style="fill:var(--bad)">10</text><text x="320" y="476" class="fdNote">Nothing was spoofed. The approval was real; it was for a session the attacker started.</text></svg></div>
<ol class="fdSteps">
<li><b>Smart TV → Authorization Server:</b> POST /device_authorization (client_id, scope) <i>(back channel)</i></li>
<li><b>Authorization Server → Smart TV:</b> device_code, user_code WDJB-MJHT, verification_uri <i>(back channel)</i></li>
<li><b>Smart TV:</b> shows: id.example.com/device, code WDJB-MJHT</li>
<li><b>Phone → Authorization Server:</b> opens the URI, types the code, logs in, approves <i>(front channel)</i></li>
<li><b>Smart TV → Authorization Server:</b> poll POST /token (device_code) <i>(back channel)</i></li>
<li><b>Authorization Server → Smart TV:</b> access token (+ refresh token) <i>(back channel)</i></li>
<li><b>Attacker → Authorization Server:</b> same request: attacker gets its own user_code <i>(attack)</i></li>
<li><b>Attacker → Phone:</b> email: &quot;IT security check: enter WDJB-MJHT at id.example.com/device&quot; <i>(attack)</i></li>
<li><b>Phone → Authorization Server:</b> victim logs in at the REAL IdP and approves <i>(front channel)</i></li>
<li><b>Authorization Server → Attacker:</b> attacker polls /token: the victim's tokens <i>(attack)</i></li>
</ol>
<!--/flow:ao10-device-flow-->
<p><b>Step 1.</b> The TV asks the authorization server to start a login, naming which app it is and which permissions it wants. This is a direct server-to-server call, so no browser is involved.</p>
<p><b>Step 2.</b> The server answers with two codes and a web address. The <code>device_code</code> is a long secret only the TV sees. The <code>user_code</code> is short, such as WDJB-MJHT, because a person will type it.</p>
<p><b>Step 3.</b> The TV puts the address and the short code on its screen. That's all it can do; it now has to wait.</p>
<p><b>Step 4.</b> You open the address on your phone, type the short code, log in with your normal password or passkey, and approve. The server now knows which pending request you meant and that you said yes to it.</p>
<p><b>Step 5.</b> Meanwhile the TV has been asking the token endpoint every few seconds, sending its <code>device_code</code>, whether the approval has happened yet.</p>
<p><b>Step 6.</b> Once it has, the server hands the TV an access token, and usually a refresh token. The TV is logged in, and no password ever touched it.</p>
<p><b>Step 7.</b> Now the attack. An attacker runs step 1 themselves, for a real app at the real identity provider, and gets a code of their own. Nothing here is forged.</p>
<p><b>Step 8.</b> They send the victim a message dressed up as an IT security check: go to this address and enter this code. The address is the genuine one.</p>
<p><b>Step 9.</b> The victim does exactly what step 4 describes. Real site, real login, real MFA, real consent screen. What they can't see is that the request they're approving was started by someone else.</p>
<p><b>Step 10.</b> The attacker's polling now succeeds, and the server hands them the victim's tokens. The password was never captured and the identity provider was never impersonated. Only the approval was misdirected.</p>
<h4>The weakness: consent without context</h4>
<p>In a normal browser flow, the request and its approval share one context and session, and the user
sees the URL. Cross-device breaks that binding. The user approves something they cannot see, started
somewhere they cannot verify, on a device unconnected to the one that will be granted access.</p>
<p>An attacker therefore does not need to steal anything. They need only <b>start a flow and get the
victim to complete it</b>:</p>
<div class="codeSample" data-hl>1. attacker starts a device-code flow for a real client, real IdP
2. IdP returns:  user_code = WDJB-MJHT   verification_uri = https://id.example.com/device
3. attacker emails the victim: "IT security check: go to id.example.com/device, enter WDJB-MJHT"
4. victim authenticates AT THE REAL IdP, sees a real consent screen, approves
5. attacker polls the token endpoint and receives the victim's tokens

// nothing was spoofed. no password was captured. MFA was satisfied, by the victim,
// for a session the attacker started. the phishing-resistant part was never bypassed;
// it was never the target.</div>
<p>QR-jacking is the same attack with a picture: an attacker's QR code, displayed on a page the victim
trusts. The <b>illicit consent grant</b> is its application-level cousin: a malicious registered app
asks for broad scopes, and the consent screen is real, so nothing looks wrong. A <b>scope</b> is the named permission an app asks for, such as <code>calendar.read</code>.</p>

<h4>Why passkeys do not save you here</h4>
<p><b>WebAuthn</b> is the browser standard behind passkeys: your device holds a private key, the site holds the public key, and a login is a signature over a challenge from that exact site. Nothing reusable is ever sent. WebAuthn is phishing-resistant because the credential is bound to an origin, so it cannot be replayed
at a fake site. In a cross-device attack there <i>is</i> no fake site: the user authenticates at the
genuine origin and the ceremony succeeds as designed. What was phished is the <b>authorization</b>, not
the credential.</p>

<h4>The defenses, in order of effectiveness</h4>
<ul>
<li><b>Do not enable the flow where it is not needed.</b> Device flow exists for input-constrained
devices. Enabling it for every client, as many providers do by default, hands the attacker a starting
point.</li>
<li><b>Bind the code to the approving user's action.</b> Make the user <i>type</i> a short code
displayed on the initiating device, rather than tapping "approve". An attacker must then get their code
in front of the victim and persuade them to enter it, a visible, describable act.</li>
<li><b>Show what and where.</b> The consent screen should name the client, the scopes, and the requesting
device's location or network. "Approve sign-in for Smart TV in Warsaw" is a question a user can answer.</li>
<li><b>Short expiry and rate-limited polling.</b> Minutes, not hours, and one grant per code.</li>
<li><b>Exclude high-value scopes.</b> Admin, payment and consent-granting scopes should require a
same-device flow, unconditionally.</li>
<li><b>Proximity where the platform offers it.</b> FIDO's hybrid transport uses Bluetooth proximity between
the two devices, the only defense here that is not advisory: it makes remote approval physically
impossible. FIDO is Fast Identity Online, the alliance whose standards passkeys come from.</li>
</ul>
<p><b>Consent is only meaningful when the user can see what they are consenting to and knows why they
were asked.</b> Cross-device flows remove both. Whatever you can add back is the whole of the security:
a code they must type, a device they must recognize, a scope you refuse to grant this way.</p>`,
docs:[['OAuth 2.0 Cross-Device Flows Best Current Practice','https://datatracker.ietf.org/doc/draft-ietf-oauth-cross-device-security/'],['RFC 8628, OAuth 2.0 Device Authorization Grant','https://www.rfc-editor.org/rfc/rfc8628'],['Microsoft, device code phishing','https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-device-code']],
ex:{title:'Gate a cross-device approval',lang:'js',
run:{call:'approveCrossDevice',cases:[{name:'the right code, entered in time, ordinary scope',args:['WDJB-MJHT','WDJB-MJHT',30,300,false],expect:true},{name:'a code the user did not get from this device',args:['AAAA-BBBB','WDJB-MJHT',30,300,false],expect:false},{name:'the code expired before approval',args:['WDJB-MJHT','WDJB-MJHT',301,300,false],expect:false},{name:'a high-value scope may never be approved cross-device',args:['WDJB-MJHT','WDJB-MJHT',30,300,true],expect:false},{name:'tapping approve without entering a code',args:['','WDJB-MJHT',30,300,false],expect:false}]},
prompt:`Write <code>function approveCrossDevice(enteredCode, expectedCode, secondsElapsed, maxAgeSeconds, highValueScope)</code> returning <code>true</code> only when the user typed the exact expected code, within <code>maxAgeSeconds</code>, for a scope that is not high-value. A high-value scope is refused <b>regardless</b> of everything else: check it first.`,
starter:`function approveCrossDevice(enteredCode, expectedCode, secondsElapsed, maxAgeSeconds, highValueScope) {
  return false;
}`,
solution:`function approveCrossDevice(enteredCode, expectedCode, secondsElapsed, maxAgeSeconds, highValueScope) {
  if (highValueScope) return false;                       // never cross-device
  if (!enteredCode || enteredCode !== expectedCode) return false;
  return secondsElapsed <= maxAgeSeconds;
}`,
tests:[{d:'high-value scopes are refused first',re:'(?:if\\s*\\(\\s*[^;{]*(?:highValueScope)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:return\\s+(?!\\s*!)[^;{]*(?:highValueScope))|(?:(?<h1>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:highValueScope)[^{]*?return\\s+\\k<h1>\\b)'},{d:'an empty entry is not an approval',re:'(?:if\\s*\\(\\s*[^;{]*(?:!enteredCode|enteredCode\\s*===\\s*["\\x27]["\\x27])[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:return\\s+(?!\\s*!)[^;{]*(?:!enteredCode|enteredCode\\s*===\\s*["\\x27]["\\x27]))|(?:(?<h1>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:!enteredCode|enteredCode\\s*===\\s*["\\x27]["\\x27])[^{]*?return\\s+\\k<h1>\\b)'},{d:'the code must match exactly',re:'enteredCode\\s*!==\\s*expectedCode|enteredCode\\s*===\\s*expectedCode'},{d:'expiry is enforced',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:secondsElapsed\\s*<=?\\s*maxAgeSeconds|secondsElapsed\\s*>))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:secondsElapsed\\s*<=?\\s*maxAgeSeconds|secondsElapsed\\s*>)[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:secondsElapsed\\s*<=?\\s*maxAgeSeconds|secondsElapsed\\s*>)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:secondsElapsed\\s*<=?\\s*maxAgeSeconds|secondsElapsed\\s*>)[^{]*?return\\s+\\k<av>\\b)'}],
behavior:`Five cases run. The empty-code case encodes the design point of the whole lesson: an approval that requires only a tap can be obtained by an attacker who sends a push at the right moment, while an approval that requires typing a code shown on the initiating device requires the attacker to get that code in front of the victim, a step the victim can notice and describe afterwards. The high-value case is deliberately unconditional: some scopes should have no cross-device path at all, so the check comes before anything else and cannot be reasoned around by a correct code. Expiry is a rate-limit on the whole attack: a code alive for five minutes gives the attacker five minutes to write a convincing email.`,
hints:['One check is unconditional and comes first.','An empty string is not a match: reject falsy input before comparing.','Elapsed time within the maximum is the last condition, not the first.']}}
]});
