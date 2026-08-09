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
,
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
hints:['Each refresh token is single-use: using the current one rotates it; seeing an old one means compromise.','On reuse, revoke the whole token family to force a fresh login.','Public clients cannot protect a long-lived secret, so rotation is required for them.']}}
]});
