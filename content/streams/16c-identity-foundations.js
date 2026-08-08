STREAMS.push({iam:true,sec:'Identity & federation foundations',icon:'🪪',title:'Identity Foundations',blurb:'The vocabulary of identity from scratch — a glossary, then authentication vs authorization, sessions vs tokens, SSO & federation, IdPs and clients, scopes and consent. The base every OAuth/OIDC/SAML lesson builds on.',lessons:[

{id:'idf0',title:'Glossary: the identity & OAuth vocabulary',body:`
<p>Identity is drowning in jargon, and many terms mean the same thing in different protocols. Rather
than cram every definition here, DevDojo keeps a living <b>&#128214; Glossary</b> as its own section in
the left sidebar, organized by domain and in logical reading order (core distinction &rarr; actors
&rarr; tokens &rarr; protocols &rarr; flows &rarr; endpoints &rarr; concepts &rarr; threats &rarr;
governance).</p>
<p><b>Two ways to use it.</b> Open the Glossary section any time as a full reference. And in <i>any</i>
lesson, <b>select or double-click a term</b> &mdash; like <code>OAuth</code>, <code>SAML</code>,
<code>PKCE</code>, <code>JWT</code>, <code>CSRF</code>, <code>scope</code> or <code>nonce</code> &mdash;
and a popup shows its definition on the spot. The same click-to-explain that already works for Java
keywords now covers the whole identity vocabulary.</p>
<p>The rest of this stream builds on that vocabulary: authentication vs authorization, sessions vs
tokens, SSO &amp; federation, IdPs and clients, scopes and consent. Whenever a word trips you up, the
Glossary is one click away. The quick exercise below cements the acronyms you will see most.</p>
`,
docs:[['OAuth 2.0 roles (RFC 6749 §1.1)','https://www.rfc-editor.org/rfc/rfc6749#section-1.1'],['OIDC terminology','https://openid.net/specs/openid-connect-core-1_0.html#Terminology'],['CSRF (OWASP)','https://owasp.org/www-community/attacks/csrf']],
ex:{title:'Expand the acronyms',
prompt:`Write <code>Glossary</code> with <code>static String expand(String abbr)</code> that returns the full term for common identity acronyms: <code>"IdP"</code>→<code>"Identity Provider"</code>, <code>"SP"</code>→<code>"Service Provider"</code>, <code>"RP"</code>→<code>"Relying Party"</code>, <code>"AS"</code>→<code>"Authorization Server"</code>, <code>"RS"</code>→<code>"Resource Server"</code>, <code>"OIDC"</code>→<code>"OpenID Connect"</code>, <code>"PKCE"</code>→<code>"Proof Key for Code Exchange"</code>, <code>"JWT"</code>→<code>"JSON Web Token"</code>, <code>"MFA"</code>→<code>"Multi-Factor Authentication"</code>, <code>"SSO"</code>→<code>"Single Sign-On"</code>, and <code>"unknown"</code> for anything else.`,
starter:`public class Glossary {
    static String expand(String abbr) {
        return null;
    }
}`,
tests:[{d:'IdP → Identity Provider',re:'"IdP"\\s*:\\s*return\\s*"Identity Provider"|"IdP".*?"Identity Provider"'},{d:'RP → Relying Party',re:'"RP".*?"Relying Party"'},{d:'AS → Authorization Server',re:'"AS".*?"Authorization Server"'},{d:'OIDC → OpenID Connect',re:'"OIDC".*?"OpenID Connect"'},{d:'PKCE → Proof Key for Code Exchange',re:'"PKCE".*?"Proof Key for Code Exchange"'},{d:'unknown default',re:'"unknown"'}],
behavior:`expand("IdP") returns "Identity Provider", expand("RP") returns "Relying Party", expand("PKCE") returns "Proof Key for Code Exchange", and expand("XYZ") returns "unknown". A quick reinforcement of the vocabulary the rest of the domain uses.`,
hints:['A <code>switch (abbr)</code> with a <code>case</code> per acronym and a <code>default: return "unknown";</code> is the clearest.','Return the exact full-term strings from the prompt.','Anything not listed falls through to "unknown".'],
solution:`public class Glossary {
    static String expand(String abbr) {
        switch (abbr) {
            case "IdP":  return "Identity Provider";
            case "SP":   return "Service Provider";
            case "RP":   return "Relying Party";
            case "AS":   return "Authorization Server";
            case "RS":   return "Resource Server";
            case "OIDC": return "OpenID Connect";
            case "PKCE": return "Proof Key for Code Exchange";
            case "JWT":  return "JSON Web Token";
            case "MFA":  return "Multi-Factor Authentication";
            case "SSO":  return "Single Sign-On";
            default:     return "unknown";
        }
    }
}`}},

{id:'idf1',title:'Authentication vs authorization',body:`
<p>These two words get mixed up constantly. They answer <b>different questions</b>:</p>
<ul>
<li><b>Authentication (authn)</b> — <i>who are you?</i> Proving identity (login).</li>
<li><b>Authorization (authz)</b> — <i>what are you allowed to do?</i> Deciding access, <b>after</b> you're known.</li>
</ul>
<p>The nightclub analogy: <b>authentication</b> is the bouncer checking your ID at the door; <b>authorization</b> is your wristband deciding which rooms you can enter. You authenticate once; you're authorized many times.</p>
<p>The core nouns:</p>
<ul>
<li><b>Identity</b> — the account/entity (a user, or a service/workload).</li>
<li><b>Principal / Subject</b> — the specific "who" a request is acting as. In tokens this is the <code>sub</code> claim.</li>
<li><b>Credentials</b> — what proves identity: a password, a private key, a client secret, a certificate.</li>
<li><b>Factors &amp; MFA</b> — categories of proof: something you <i>know</i> (password), <i>have</i> (phone/security key), <i>are</i> (biometric). Multi-factor combines two+.</li>
</ul>
<p>A request typically carries a credential; the server <b>authenticates</b> it to establish a principal, then <b>authorizes</b> the action against that principal's permissions. Mixing these up is a top source of security bugs — e.g. checking <i>who</i> but never <i>whether they're allowed</i>.</p>
<div class="codeSample" data-hl>// authentication: verify a credential -> establish the principal
// authorization: given the principal's roles, allow or deny the action
if (authenticate(header)) {          // who are you?
    if (authorize(roles, "orders:write")) { ... }   // may you do this?
}</div>`,
docs:[['OWASP Authentication Cheat Sheet','https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html'],['OWASP Authorization Cheat Sheet','https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html']],
ex:{title:'Authenticate, then authorize',
prompt:`Write <code>Access</code> with: <code>static String[] decodeBasic(String header)</code> — the <b>authentication</b> step — given an HTTP Basic header value like <code>"Basic dXNlcjpwYXNz"</code>, take the part after the space, base64-decode it with <code>java.util.Base64.getDecoder()</code> into <code>"user:pass"</code>, and return it split into <code>{user, pass}</code> with <code>split(":", 2)</code>; and <code>static boolean authorize(java.util.Set&lt;String&gt; roles, String required)</code> — the <b>authorization</b> step — return whether <code>roles</code> <code>.contains(required)</code>.`,
starter:`import java.util.*;

public class Access {
    static String[] decodeBasic(String header) {
        return null;
    }
    static boolean authorize(Set<String> roles, String required) {
        return false;
    }
}`,
tests:[{d:'takes the part after the space',re:'substring\\s*\\(|indexOf\\s*\\(\\s*[\\x27"] [\\x27"]|split\\s*\\(\\s*" "'},{d:'base64-decodes the credentials',re:'Base64\\.getDecoder\\s*\\(\\s*\\)'},{d:'splits user:pass into two',re:'split\\s*\\(\\s*":"\\s*,\\s*2\\s*\\)'},{d:'authorization checks role membership',re:'roles\\s*\\.\\s*contains\\s*\\(\\s*required\\s*\\)'}],
behavior:`decodeBasic("Basic dXNlcjpwYXNz") returns {"user","pass"} (that base64 decodes to "user:pass"). authorize(Set.of("orders:read","orders:write"), "orders:write") is true; authorize(Set.of("orders:read"), "orders:write") is false. Authentication (who) happens before authorization (what).`,
hints:['The token starts right after the space — take <code>header.substring(header.indexOf(" ") + 1)</code> (index of the space, plus one).','<code>new String(Base64.getDecoder().decode(b64))</code> gives "user:pass".','<code>split(":", 2)</code> keeps a password that itself contains a colon intact.'],
solution:`import java.util.*;

public class Access {
    // authentication: pull the identity's credentials out of the Basic header
    static String[] decodeBasic(String header) {
        String b64 = header.substring(header.indexOf(' ') + 1);
        String creds = new String(Base64.getDecoder().decode(b64));
        return creds.split(":", 2);
    }
    // authorization: does this principal hold the required role/permission?
    static boolean authorize(Set<String> roles, String required) {
        return roles.contains(required);
    }
}`}},

{id:'idf2',title:'How identity is carried: sessions vs tokens',body:`
<p>Once you're authenticated, how does the <i>next</i> request prove it's still you? Two models:</p>
<ul>
<li><b>Server-side sessions (stateful).</b> The server stores your login in memory/DB and hands you a <b>session cookie</b> holding only an opaque id. Every request sends the cookie; the server looks it up. Simple, easy to revoke — but the server must remember every session (state), which is awkward across many servers.</li>
<li><b>Tokens (stateless).</b> The server hands you a signed <b>token</b> (often a JWT) that <i>contains</i> the claims. Later requests send it in the <code>Authorization: Bearer &lt;token&gt;</code> header; any server verifies the signature and trusts the contents without a lookup. Scales horizontally; the trade-off is revocation is harder (the token is valid until it expires).</li>
</ul>
<p>Two more terms you'll see everywhere:</p>
<ul>
<li><b>Bearer token</b> — "whoever <i>bears</i> (holds) it can use it," like cash. So it must be sent over TLS and kept secret. (Sender-constrained tokens, lesson 6, remove this risk.)</li>
<li><b>Front channel vs back channel.</b> The <b>front channel</b> goes through the user's browser (redirects, URL parameters) — visible to the user, so never put secrets there. The <b>back channel</b> is a direct server-to-server call (the app's backend to the auth server) — private, where secrets and tokens are safely exchanged. OAuth deliberately uses both (next stream).</li>
</ul>
<div class="codeSample" data-hl>// a token is presented on each request in the Authorization header
Authorization: Bearer eyJhbGciOiJSUzI1Ni␣...  (header.payload.signature)
// a session cookie instead carries only an opaque id the server looks up
Cookie: session=8f3a...   // meaningless without the server's session store</div>`,
docs:[['MDN — Authorization header','https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Authorization'],['RFC 6750 — Bearer Token Usage','https://www.rfc-editor.org/rfc/rfc6750']],
ex:{title:'Bearer header: build and parse',
prompt:`Write <code>Bearer</code> with: <code>static String header(String token)</code> returning the header <b>value</b> <code>"Bearer " + token</code>; and <code>static String parse(String header)</code> that returns the token from a value like <code>"Bearer abc.def.ghi"</code> — return <code>null</code> if <code>header</code> is null or does not <code>startsWith("Bearer ")</code>, otherwise the substring after <code>"Bearer "</code>.`,
starter:`public class Bearer {
    static String header(String token) {
        return null;
    }
    static String parse(String header) {
        return null;
    }
}`,
tests:[{d:'builds the Bearer value',re:'"Bearer "\\s*\\+\\s*token'},{d:'guards the prefix with startsWith',re:'startsWith\\s*\\(\\s*"Bearer "\\s*\\)'},{d:'null-safety on the input',re:'==\\s*null|!=\\s*null|null\\s*=='},{d:'extracts the token after the prefix',re:'substring\\s*\\('}],
behavior:`header("t") returns "Bearer t". parse("Bearer t") returns "t"; parse("t") and parse(null) return null (a value without the scheme is not a valid bearer header).`,
hints:['<code>return "Bearer " + token;</code>','Guard first: <code>if (header == null || !header.startsWith("Bearer ")) return null;</code>','Then <code>return header.substring("Bearer ".length());</code>'],
solution:`public class Bearer {
    static String header(String token) {
        return "Bearer " + token;
    }
    static String parse(String header) {
        if (header == null || !header.startsWith("Bearer ")) return null;
        return header.substring("Bearer ".length());
    }
}`}},

{id:'idf3',title:'SSO & federation: IdPs, SPs and trust',body:`
<p><b>Single Sign-On (SSO)</b> is logging in once and getting into many apps without re-entering credentials. <b>Federation</b> is what makes it possible across organizational boundaries: apps <i>delegate</i> authentication to a central authority they <b>trust</b>.</p>
<p>The cast of characters (the same idea, different words per protocol):</p>
<ul>
<li><b>Identity Provider (IdP)</b> — the authority that authenticates users and vouches for them (Okta, Entra ID, Google, Keycloak). In OAuth/OIDC this is the <b>Authorization Server</b>.</li>
<li><b>Service Provider (SP)</b> — the app that <i>relies</i> on the IdP. In SAML it's the "SP"; in OIDC it's the <b>Relying Party (RP)</b> / client.</li>
<li><b>Assertion / Token</b> — the signed statement the IdP issues saying "this user authenticated, here are their attributes." SAML calls it an <b>assertion</b> (XML); OIDC calls it an <b>ID token</b> (JWT).</li>
<li><b>Trust</b> — the SP is configured to accept assertions/tokens signed by that IdP (via the IdP's certificate or its published <b>JWKS</b> keys). Trust is what turns "a signed blob" into "a login I believe."</li>
</ul>
<p>Why federate? One place to enforce MFA and policy, instant deprovisioning (disable the account at the IdP and access ends everywhere), and users keep one identity. The SP never sees the password — only a signed proof of authentication.</p>
<p><b>How an SP finds an IdP's keys:</b> modern IdPs publish a <b>discovery document</b> (OIDC: <code>/.well-known/openid-configuration</code>) that points to the signing keys (<code>jwks_uri</code>). The SP fetches and caches those keys to verify tokens.</p>`,
docs:[['OIDC Discovery','https://openid.net/specs/openid-connect-discovery-1_0.html'],['Okta — What is federated identity?','https://www.okta.com/identity-101/what-is-federated-identity/']],
ex:{title:'Trust an issuer, find its keys',
prompt:`Write <code>Federation</code> with: <code>static boolean issuerTrusted(String iss, java.util.Set&lt;String&gt; trustedIssuers)</code> returning whether <code>iss</code> is non-null and in <code>trustedIssuers</code>; and <code>static String jwksUri(String issuer)</code> returning the issuer's discovery keys URL — the <code>issuer</code> with any trailing <code>"/"</code> removed, then <code>"/.well-known/jwks.json"</code> appended (e.g. <code>"https://idp.example.com"</code> → <code>"https://idp.example.com/.well-known/jwks.json"</code>).`,
starter:`import java.util.*;

public class Federation {
    static boolean issuerTrusted(String iss, Set<String> trustedIssuers) {
        return false;
    }
    static String jwksUri(String issuer) {
        return null;
    }
}`,
tests:[{d:'null-checks the issuer',re:'iss\\s*!=\\s*null|null\\s*!=\\s*iss'},{d:'only trusts a configured issuer',re:'trustedIssuers\\s*\\.\\s*contains\\s*\\(\\s*iss\\s*\\)'},{d:'strips a trailing slash',re:'endsWith\\s*\\(\\s*"/"\\s*\\)|substring\\s*\\('},{d:'points at the well-known keys',re:'"/\\.well-known/jwks\\.json"|/\\.well-known/jwks\\.json'}],
behavior:`issuerTrusted("https://idp.example.com", Set.of("https://idp.example.com")) is true; an unknown or null issuer is false. jwksUri("https://idp.example.com/") returns "https://idp.example.com/.well-known/jwks.json" (exactly one slash before .well-known).`,
hints:['Trust is an allow-list: <code>return iss != null &amp;&amp; trustedIssuers.contains(iss);</code>','Strip the slash: <code>String base = issuer.endsWith("/") ? issuer.substring(0, issuer.length()-1) : issuer;</code>','Then <code>return base + "/.well-known/jwks.json";</code>'],
solution:`import java.util.*;

public class Federation {
    static boolean issuerTrusted(String iss, Set<String> trustedIssuers) {
        return iss != null && trustedIssuers.contains(iss);
    }
    static String jwksUri(String issuer) {
        String base = issuer.endsWith("/") ? issuer.substring(0, issuer.length() - 1) : issuer;
        return base + "/.well-known/jwks.json";
    }
}`}},

{id:'idf4',title:'Clients: public vs confidential (private)',body:`
<p>In OAuth/OIDC the app requesting tokens is the <b>client</b>. The single most important property of a client is whether it can <b>keep a secret</b>:</p>
<ul>
<li><b>Confidential client</b> (a.k.a. <b>private client</b>) — runs somewhere users can't extract its secrets: a <b>server-side backend</b>. It can authenticate to the authorization server with a <b>client secret</b> (or better, a key/certificate). Example: a Spring Boot backend, a daemon.</li>
<li><b>Public client</b> — runs where the code/secret is visible to the user: a <b>SPA</b> (JavaScript in the browser), a <b>mobile app</b>, a desktop app. It <b>cannot</b> hold a secret (anyone can read it), so it authenticates differently — it proves itself per-request with <b>PKCE</b> (next stream) instead of a static secret.</li>
</ul>
<p>Why it matters: the flows and protections differ. Confidential clients may use flows that rely on a secret (like <b>client credentials</b>, for machine-to-machine); public clients must use <b>Authorization Code + PKCE</b> and never embed a secret.</p>
<p><b>How confidential clients authenticate</b> (from weakest to strongest):</p>
<ul>
<li><code>client_secret_basic</code> / <code>client_secret_post</code> — a shared secret in the request (HTTP Basic or form field).</li>
<li><code>private_key_jwt</code> — the client signs a short JWT with its <b>private key</b>; the server verifies with the client's public key. No shared secret to leak.</li>
<li><code>tls_client_auth</code> (mTLS) — the client presents a <b>client certificate</b> during the TLS handshake. Strongest; ties the token to the client (lesson 6 / the S2S stream).</li>
</ul>
<div class="codeSample" data-hl>// confidential client: HTTP Basic client authentication
Authorization: Basic base64(client_id ":" client_secret)
// public client: NO secret — proves itself with a PKCE code_verifier instead</div>`,
docs:[['RFC 6749 §2.1 — Client Types','https://www.rfc-editor.org/rfc/rfc6749#section-2.1'],['OAuth 2.0 client authentication','https://oauth.net/2/client-authentication/']],
ex:{title:'Classify the client, build its auth',
prompt:`Write <code>ClientAuth</code> with: <code>static boolean isConfidential(String clientType)</code> returning whether <code>clientType</code> equals <code>"confidential"</code> (use <code>"confidential".equals(clientType)</code> so a null is safe); and <code>static String basicClientAuth(String clientId, String clientSecret)</code> that builds the confidential client's HTTP Basic value: base64-encode <code>clientId + ":" + clientSecret</code> with <code>java.util.Base64.getEncoder()</code> and return <code>"Basic " + encoded</code>.`,
starter:`public class ClientAuth {
    static boolean isConfidential(String clientType) {
        return false;
    }
    static String basicClientAuth(String clientId, String clientSecret) {
        return null;
    }
}`,
tests:[{d:'null-safe equality against the literal',re:'"confidential"\\s*\\.\\s*equals\\s*\\(\\s*clientType\\s*\\)'},{d:'joins id:secret',re:'clientId\\s*\\+\\s*":"\\s*\\+\\s*clientSecret'},{d:'base64-encodes it',re:'Base64\\.getEncoder\\s*\\(\\s*\\)'},{d:'returns a Basic value',re:'"Basic "\\s*\\+'}],
behavior:`isConfidential("confidential") is true; isConfidential("public") and isConfidential(null) are false. basicClientAuth("app","s3cret") returns "Basic YXBwOnMzY3JldA==" (base64 of "app:s3cret"). Only confidential clients should ever send this — a public client cannot keep the secret.`,
hints:['Put the literal first so null is handled for free: <code>"confidential".equals(clientType)</code>.','<code>String raw = clientId + ":" + clientSecret;</code>','<code>return "Basic " + Base64.getEncoder().encodeToString(raw.getBytes());</code>'],
solution:`public class ClientAuth {
    static boolean isConfidential(String clientType) {
        return "confidential".equals(clientType);
    }
    static String basicClientAuth(String clientId, String clientSecret) {
        String raw = clientId + ":" + clientSecret;
        return "Basic " + java.util.Base64.getEncoder().encodeToString(raw.getBytes());
    }
}`}},

{id:'idf5',title:'Delegation, consent & scopes',body:`
<p>The reason OAuth exists: let an app act <b>on your behalf</b> against an API <b>without giving it your password</b>. That is <b>delegated authorization</b> — you delegate a <i>limited</i> slice of your access to the app.</p>
<ul>
<li><b>Scope</b> — a named permission the app requests, e.g. <code>photos:read</code> or <code>calendar:write</code>. Scopes are a <b>space-separated</b> list. They bound what the resulting token can do (least privilege).</li>
<li><b>Consent</b> — the authorization server shows you what the app is asking for ("Acme wants to read your photos") and you approve. Consent is why delegation is safe: <i>you</i> decide.</li>
<li><b>Least privilege</b> — request only the scopes you need. A photo-printing app should ask for <code>photos:read</code>, not <code>photos:write</code> or your contacts.</li>
</ul>
<p><b>Delegation vs impersonation</b> — a subtle but important distinction:</p>
<ul>
<li><b>Delegation</b>: the token says "app X, acting for user Y, may do Z." Both identities are present — the API knows a client is acting for a user.</li>
<li><b>Impersonation</b>: the app simply <i>becomes</i> user Y — the API can't tell it isn't Y. More powerful, riskier, and audited differently. (Token exchange, in the S2S stream, formalizes both.)</li>
</ul>
<p>A resource server enforces scopes on every call: it reads the token's <code>scope</code> claim and checks the required scope is present before doing the work.</p>
<div class="codeSample" data-hl>// token carries the granted scopes as a space-separated string
"scope": "photos:read profile"
// the API checks the needed scope is present before acting
if (!granted.contains("photos:read")) throw new ForbiddenException();</div>`,
docs:[['RFC 6749 §3.3 — Access Token Scope','https://www.rfc-editor.org/rfc/rfc6749#section-3.3'],['oauth.net — Scopes','https://oauth.net/2/scope/']],
ex:{title:'Parse scopes, enforce least privilege',
prompt:`Write <code>Scopes</code> with: <code>static java.util.Set&lt;String&gt; parse(String scope)</code> that turns a space-separated scope string into a set — <code>trim()</code> then <code>split(" ")</code>, collect into a <code>HashSet</code>; and <code>static boolean covers(java.util.Set&lt;String&gt; granted, String required)</code> returning whether <code>granted.contains(required)</code>. (Split on a single space — scopes are space-delimited.)`,
starter:`import java.util.*;

public class Scopes {
    static Set<String> parse(String scope) {
        return null;
    }
    static boolean covers(Set<String> granted, String required) {
        return false;
    }
}`,
tests:[{d:'trims the scope string',re:'\\.trim\\s*\\(\\s*\\)'},{d:'splits on a space',re:'split\\s*\\(\\s*" "\\s*\\)'},{d:'collects into a set',re:'new\\s+HashSet|Set\\.of|Collectors\\.toSet'},{d:'enforcement checks membership',re:'granted\\s*\\.\\s*contains\\s*\\(\\s*required\\s*\\)'}],
behavior:`parse("photos:read profile") is the set {"photos:read","profile"}. covers(parse("photos:read profile"), "photos:read") is true; covers(..., "photos:write") is false — the app was never granted write, so the API denies it.`,
hints:['<code>new HashSet&lt;&gt;(Arrays.asList(scope.trim().split(" ")))</code>.','Enforcement is just membership: <code>return granted.contains(required);</code>','Scopes are separated by single spaces per the spec.'],
solution:`import java.util.*;

public class Scopes {
    static Set<String> parse(String scope) {
        return new HashSet<>(Arrays.asList(scope.trim().split(" ")));
    }
    static boolean covers(Set<String> granted, String required) {
        return granted.contains(required);
    }
}`}},

{id:'idf6',title:'Validating a token & sender-constrained tokens',body:`
<p>A resource server must <b>validate</b> every token before trusting it. Signature aside (covered in the JOSE stream), the mandatory claim checks are:</p>
<ul>
<li><b>iss (issuer)</b> — was it minted by an issuer you trust?</li>
<li><b>aud (audience)</b> — is <i>this</i> API the intended recipient? A token for service A must be rejected by service B.</li>
<li><b>exp (expiration)</b> — is it still within its lifetime? (and <b>nbf</b> — not before.)</li>
<li><b>scope / roles</b> — does it permit this specific action? (lesson 5)</li>
</ul>
<p>Skipping <b>aud</b> is a classic mistake: a token leaked from one service could otherwise be replayed against another.</p>
<p><b>Bearer vs sender-constrained tokens.</b> A plain <b>bearer</b> token is like cash — whoever steals it can use it. <b>Sender-constrained</b> (a.k.a. proof-of-possession) tokens are bound to a key only the legitimate client holds, so a stolen token is useless to a thief:</p>
<ul>
<li><b>mTLS-bound tokens</b> (RFC 8705) — the token is tied to the client's TLS certificate; the API checks the caller's cert matches.</li>
<li><b>DPoP</b> (RFC 9449) — the client signs each request with a key; the token carries that key's thumbprint. Common for public clients (SPAs).</li>
</ul>
<p>Default to short-lived bearer tokens over TLS; reach for sender-constraint when tokens are high-value or the client is exposed.</p>
<div class="codeSample" data-hl>// the non-negotiable claim checks, in order
if (!expectedIss.equals(iss))    return false;   // trusted issuer?
if (!expectedAud.equals(aud))    return false;   // token meant for US?
if (expEpoch <= nowEpoch)        return false;   // not expired?
return true;                                       // (then check scope/roles)</div>`,
docs:[['RFC 9068 — JWT access tokens','https://www.rfc-editor.org/rfc/rfc9068'],['RFC 8705 — mTLS-bound tokens','https://www.rfc-editor.org/rfc/rfc8705'],['RFC 9449 — DPoP','https://www.rfc-editor.org/rfc/rfc9449']],
ex:{title:'The token validation checklist',
prompt:`Write <code>TokenCheck</code> with <code>static boolean valid(String iss, String aud, long expEpoch, String expectedIss, String expectedAud, long nowEpoch)</code> that returns <code>true</code> only if: <code>expectedIss.equals(iss)</code>, <b>and</b> <code>expectedAud.equals(aud)</code>, <b>and</b> the token is not expired (<code>expEpoch &gt; nowEpoch</code>). Return <code>false</code> as soon as any check fails.`,
starter:`public class TokenCheck {
    static boolean valid(String iss, String aud, long expEpoch,
                         String expectedIss, String expectedAud, long nowEpoch) {
        return false;
    }
}`,
tests:[{d:'checks the issuer',re:'expectedIss\\s*\\.\\s*equals\\s*\\(\\s*iss\\s*\\)'},{d:'checks the audience (rejects tokens meant for others)',re:'expectedAud\\s*\\.\\s*equals\\s*\\(\\s*aud\\s*\\)'},{d:'checks expiry',re:'expEpoch\\s*(<=|>)\\s*nowEpoch|nowEpoch\\s*(<|>=)\\s*expEpoch'}],
behavior:`valid returns true only for a token from the expected issuer, addressed to the expected audience, and not yet expired. Change the issuer, point the audience at another service, or set exp in the past and it returns false. Audience is what stops a token for service A being replayed on service B.`,
hints:['Fail fast: <code>if (!expectedIss.equals(iss)) return false;</code> then the same for audience.','Expiry: <code>if (expEpoch &lt;= nowEpoch) return false;</code>','If all three pass, <code>return true;</code>'],
solution:`public class TokenCheck {
    static boolean valid(String iss, String aud, long expEpoch,
                         String expectedIss, String expectedAud, long nowEpoch) {
        if (!expectedIss.equals(iss)) return false;      // trusted issuer
        if (!expectedAud.equals(aud)) return false;      // meant for this API
        if (expEpoch <= nowEpoch) return false;          // not expired
        return true;
    }
}`}}
,
{id:'idffed',title:'Identity & federation in plain English',body:`
<p>Your <b>identity</b> is just your digital "who" — an account plus the facts attached to it (name, email, groups). <b>Authentication</b> proves you are that who; <b>authorization</b> decides what that who may do. So far, so simple.</p>
<p>The problem: if every app keeps its own usernames and passwords, you drown in logins and each app becomes a place your password can leak. <b>Federation</b> solves this by letting apps <b>trust a shared authority</b> to say who you are, instead of each checking for themselves.</p>
<p><b>The passport analogy.</b> Your country verifies who you are and issues a passport; other countries accept it at the border without re-investigating you, because they trust the issuer. In identity, the <b>Identity Provider (IdP)</b> is your country, the passport is a signed <b>token or assertion</b>, and each app — the <b>Service Provider / Relying Party</b> — is the border that trusts it.</p>
<p><b>Everyday examples.</b> "Log in with Google": Google is the IdP that vouches for you, and the app relies on Google&#8217;s word rather than storing your password. Corporate SSO: an employee logs into Okta once and reaches Salesforce, Slack, and Workday — each app trusts Okta, so one login opens all of them. That is <b>federated identity</b>: your identity lives in one place and is accepted in many.</p>
<p>The trust is set up in advance (the app is configured with the IdP&#8217;s keys/metadata), which is why a random site cannot simply claim "Google says this is you" — only the real, pre-trusted IdP&#8217;s signature is accepted.</p>`,
docs:[['Identity federation — Wikipedia','https://en.wikipedia.org/wiki/Federated_identity'],['SSO & federation basics','https://www.cloudflare.com/learning/access-management/what-is-federated-identity/']],
ex:{title:'Who plays which role?',
prompt:`Write class <code>Federation</code> with <code>static String role(String party)</code>: <code>"idp"</code>→<code>"vouches for the user"</code>, <code>"sp"</code>→<code>"relies on the idp"</code>, and <code>"unknown"</code> for anything else.`,
starter:`public class Federation {
    static String role(String party) {
        return null;
    }
}`,
solution:`public class Federation {
    static String role(String party) {
        switch (party) {
            case "idp": return "vouches for the user";
            case "sp":  return "relies on the idp";
            default:    return "unknown";
        }
    }
}`,
tests:[{d:'the IdP vouches for the user',re:'"idp".*?"vouches for the user"',flags:'s'},{d:'the SP relies on the IdP',re:'"sp".*?"relies on the idp"',flags:'s'},{d:'unknown default',re:'"unknown"'}],
behavior:`role("idp") is "vouches for the user", role("sp") is "relies on the idp", role("x") is "unknown". The IdP is the trusted authority; the SP/RP is the app that accepts its word.`,
hints:['A two-case switch plus a default covers it.','The identity provider vouches; the service provider relies.','Anything else returns unknown.']}}
]});
