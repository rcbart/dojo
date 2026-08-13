STREAMS.push({icon:'🛡️',iam:true,sec:'Advanced OAuth & threats',title:'Advanced OAuth 2.0 & OIDC Threats',blurb:'The hard edges of OAuth in production: token introspection and revocation, the JWT validation checklist, PAR/JAR/RAR, DPoP and mTLS-bound (sender-constrained) tokens, and a catalog of attacks with the defenses from the OAuth Security BCP.',lessons:[

{id:'ao1',title:'Introspection & revocation',body:`
<p>Opaque access tokens carry no data, so a resource server validates them by calling the authorization server&#8217;s <b>introspection</b> endpoint (RFC 7662), which replies with <code>active: true/false</code> plus metadata. <b>Revocation</b> (RFC 7009) lets a client proactively kill a token or refresh token — on logout, or when a device is lost.</p>
<p>A token should be treated as usable only when the server both <b>knows it</b> and it has <b>not expired</b> or been revoked. That is the whole point of introspection: expiry alone is not enough, because a token can be revoked before it expires.</p>`,
docs:[['Token introspection (RFC 7662)','https://www.rfc-editor.org/rfc/rfc7662'],['Token revocation (RFC 7009)','https://www.rfc-editor.org/rfc/rfc7009']],
ex:{title:'Decide if a token is active',
prompt:`Write class <code>Introspect</code> with <code>static boolean active(boolean found, boolean expired)</code> that returns true only when the token is <b>found</b> (known and not revoked) <b>and</b> not <b>expired</b>.`,
starter:`public class Introspect {
    static boolean active(boolean found, boolean expired) {
        return false;
    }
}`,
solution:`public class Introspect {
    static boolean active(boolean found, boolean expired) {
        return found && !expired;
    }
}`,
tests:[{d:'the token must be found (not revoked)',re:'found\\s*&&'},{d:'and must not be expired',re:'!\\s*expired'}],
behavior:`active(true,false) is true; active(true,true) is false (expired); active(false,false) is false (revoked/unknown). Expiry alone is insufficient — revocation is why the server is asked.`,
hints:['Combine the two booleans: found AND not expired.','Negate expired with the ! operator.','A revoked token is simply not found by introspection.']}},

{id:'ao2',title:'The JWT validation checklist',body:`
<p>A self-contained JWT access token is only trustworthy if you check it properly. Verifying the signature is necessary but <b>not sufficient</b>. The core checklist: the signature verifies against the issuer&#8217;s key; the <code>iss</code> (issuer) is exactly who you expect; the <code>aud</code> (audience) names <i>your</i> API; and the token is <b>within its lifetime</b> (<code>exp</code> in the future, <code>nbf</code> in the past).</p>
<p>Skipping the audience check is a classic bug: a token minted for another service will still have a valid signature, so without <code>aud</code> you would accept a token that was never meant for you.</p>`,
docs:[['JWT best practices (RFC 8725)','https://www.rfc-editor.org/rfc/rfc8725'],['JWT access tokens (RFC 9068)','https://www.rfc-editor.org/rfc/rfc9068']],
ex:{title:'Validate the claims',
prompt:`Write class <code>Validate</code> with <code>static boolean ok(String iss, String aud, long exp, long now)</code> that returns true only when <code>iss</code> equals <code>"https://issuer"</code>, <code>aud</code> equals <code>"api"</code>, and <code>exp</code> is strictly greater than <code>now</code> (not expired).`,
starter:`public class Validate {
    static boolean ok(String iss, String aud, long exp, long now) {
        return false;
    }
}`,
solution:`public class Validate {
    static boolean ok(String iss, String aud, long exp, long now) {
        return iss.equals("https://issuer") && aud.equals("api") && exp > now;
    }
}`,
tests:[{d:'checks the issuer',re:'iss\\.equals\\s*\\(\\s*"https://issuer"\\s*\\)'},{d:'checks the audience is this API',re:'aud\\.equals\\s*\\(\\s*"api"\\s*\\)'},{d:'checks the token is not expired',re:'exp\\s*>\\s*now'}],
behavior:`ok("https://issuer","api",100,50) is true; ok("https://issuer","other",100,50) is false (wrong audience); ok("https://issuer","api",40,50) is false (expired). Signature-valid but wrong-audience tokens must be rejected.`,
hints:['Three conditions joined by && must all hold.','Use equals for the string claims iss and aud.','Not-expired means exp is still in the future: exp > now.']}},

{id:'ao3',title:'PAR, JAR/JARM & RAR',body:`
<p>Newer OAuth extensions harden the request itself. <b>PAR</b> (Pushed Authorization Requests) sends the request parameters to the server <i>first</i>, over a back channel, so nothing sensitive rides in the browser URL. <b>JAR/JARM</b> sign the request and response objects so they cannot be tampered with. <b>RAR</b> (Rich Authorization Requests) replaces coarse scopes with structured <b>authorization details</b> — "transfer up to 500 EUR from account X" instead of a blunt <code>payments</code> scope.</p>
<p>Together they push OAuth toward fine-grained, tamper-resistant authorization — the direction profiles like FAPI (financial-grade) require.</p>`,
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
<p>The acceptance rule follows directly: a bearer token is fine on its own, but a sender-constrained token must be accompanied by a valid proof of possession. If the proof is missing or wrong, a stolen copy is worthless.</p>`,
docs:[['DPoP (RFC 9449)','https://www.rfc-editor.org/rfc/rfc9449'],['mTLS-bound tokens (RFC 8705)','https://www.rfc-editor.org/rfc/rfc8705']],
ex:{title:'Accept only with valid proof',
prompt:`Write class <code>Dpop</code> with <code>static boolean accept(boolean senderConstrained, boolean keyProofValid)</code>: a token is accepted if it is <b>not</b> sender-constrained (a plain bearer) <b>or</b> its key proof is valid.`,
starter:`public class Dpop {
    static boolean accept(boolean senderConstrained, boolean keyProofValid) {
        return false;
    }
}`,
solution:`public class Dpop {
    static boolean accept(boolean senderConstrained, boolean keyProofValid) {
        return !senderConstrained || keyProofValid;
    }
}`,
tests:[{d:'plain bearer tokens are accepted',re:'!\\s*senderConstrained'},{d:'sender-constrained needs a valid proof',re:'\\|\\|\\s*keyProofValid'}],
behavior:`accept(false,false) is true (plain bearer); accept(true,true) is true (proof valid); accept(true,false) is false (constrained but no proof). A stolen sender-constrained token cannot be replayed without the key.`,
hints:['Not sender-constrained OR the proof is valid.','Use ! for the not-sender-constrained case.','Join the two conditions with ||.']}},

{id:'ao4b',title:'DPoP in depth: proving you hold the key',body:`
<p>Every bearer token shares one weakness: possession is the whole of the entitlement. Steal it from a
log, a proxy, a browser or a crash dump, and you are indistinguishable from the legitimate client.
<b>DPoP</b> — Demonstrating Proof-of-Possession, RFC 9449 — removes that property, and it does so
without requiring the client certificates that kept mTLS out of reach for most applications.</p>

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
<p>The through-line: bind each step to something the attacker cannot forge or reuse, and never trust a redirect target you did not pre-register.</p>`,
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
<p><b>Rotation.</b> Every time a refresh token is used, the authorization server issues a <b>new</b> refresh token and <b>invalidates the old one</b>. A given refresh token is therefore usable exactly once.</p>
<p><b>Reuse detection.</b> Because each refresh token is single-use, if an <i>already-rotated</i> (old) token is presented again, something is wrong: either a replay, or the legitimate client and an attacker <b>both</b> hold a copy. The safe response is to assume compromise and <b>revoke the entire token family</b> (the whole session lineage), forcing a fresh login. This turns a stolen refresh token from an open-ended breach into a short, self-detecting one.</p>
<p>Rotation is <b>mandatory for public clients</b> (SPAs, mobile) per the OAuth Security BCP, since they cannot protect a long-lived secret. Pair it with short access-token lifetimes and, ideally, sender-constrained tokens (DPoP or mTLS) so even a captured token cannot be replayed elsewhere.</p>`,
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
<p>And the honest caveat: FAPI hardens the <i>protocol</i>. It says nothing about whether your scopes
model reality, whether the resource server checks record ownership, or whether your support tooling
lets staff read any account. A fully certified deployment can still have an IDOR on its main endpoint.
Protocol hardening and authorization correctness are different problems, and only one of them has a
test suite.</p>`,
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

<h4>The honest assessment</h4>
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
}`}}
]});
