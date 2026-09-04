STREAMS.push({iam:true,sec:'OAuth 2.0 & OpenID Connect',icon:'🔓',title:'OAuth 2.0 & OpenID Connect',blurb:'Every OAuth 2.0 flow from first principles (authorization code, PKCE, client credentials, device, refresh), plus OpenID Connect on top (ID tokens, discovery, UserInfo, nonce). The protocol that issues the tokens.',lessons:[

{id:'oa1',title:'The roles & the Authorization Code flow',body:`
<p>OAuth 2.0 is a <b>delegated authorization</b> protocol: it lets an app get a <i>limited</i> access token to call an API on a user's behalf, <b>without the user's password</b>. Four roles:</p>
<ul>
<li><b>Resource Owner</b>: the user who owns the data.</li>
<li><b>Client</b>: the app that wants access (public or confidential; see Identity Foundations).</li>
<li><b>Authorization Server (AS)</b>: the IdP that authenticates the user and issues tokens. Two key endpoints: <code>/authorize</code> (front channel) and <code>/token</code> (back channel).</li>
<li><b>Resource Server</b>: the API that accepts the access token.</li>
</ul>
<p>The default, most secure flow is <b>Authorization Code</b>. The whole dance, end to end:</p>
<!--flow:oa1-authcode-->
<div class="flowDia"><svg viewBox="0 0 700 386" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Authorization Code flow"><defs><marker id="oa1-authcode-ah-front" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent)"/></marker><marker id="oa1-authcode-ah-back" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent2)"/></marker><marker id="oa1-authcode-ah-attack" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--bad)"/></marker><marker id="oa1-authcode-ah-x" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--muted)"/></marker></defs><line x1="74" y1="54" x2="74" y2="354" class="fdLife"/><line x1="258" y1="54" x2="258" y2="354" class="fdLife"/><line x1="442" y1="54" x2="442" y2="354" class="fdLife"/><line x1="626" y1="54" x2="626" y2="354" class="fdLife"/><rect x="34.300000000000004" y="8" width="79.39999999999999" height="46" rx="8" class="fdActor"/><text x="74" y="27" class="fdActorT">Browser</text><text x="74" y="42" class="fdActorS">the user, front channel</text><rect x="206" y="8" width="104" height="46" rx="8" class="fdActor"/><text x="258" y="27" class="fdActorT">Client app</text><text x="258" y="42" class="fdActorS">backend</text><rect x="355" y="8" width="174" height="46" rx="8" class="fdActor"/><text x="442" y="35.5" class="fdActorT">Authorization Server</text><rect x="587" y="8" width="78" height="46" rx="8" class="fdActor"/><text x="626" y="27" class="fdActorT">API</text><text x="626" y="42" class="fdActorS">resource server</text><line x1="77" y1="102" x2="253" y2="102" stroke="var(--muted)" class="fdArrow" marker-end="url(#oa1-authcode-ah-x)"/><text x="181" y="93" class="fdLabel">“Log in with Example”</text><circle cx="92" cy="102" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="92" y="105.5" class="fdNumT" style="fill:var(--muted)">1</text><line x1="261" y1="132" x2="437" y2="132" stroke="var(--accent)" class="fdArrow" marker-end="url(#oa1-authcode-ah-front)"/><text x="365" y="123" class="fdLabel">302 → /authorize?response_type=code…</text><circle cx="276" cy="132" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="276" y="135.5" class="fdNumT" style="fill:var(--accent)">2</text><rect x="333.3" y="149" width="217.39999999999998" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="450" y="164" class="fdSelfT">user authenticates &amp; consents</text><circle cx="333.3" cy="160" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="333.3" y="163.5" class="fdNumT" style="fill:var(--muted)">3</text><line x1="439" y1="198" x2="263" y2="198" stroke="var(--accent)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#oa1-authcode-ah-front)"/><text x="335" y="189" class="fdLabel">302 → redirect_uri?code=…</text><circle cx="424" cy="198" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="424" y="201.5" class="fdNumT" style="fill:var(--accent)">4</text><line x1="261" y1="228" x2="437" y2="228" stroke="var(--accent2)" class="fdArrow" marker-end="url(#oa1-authcode-ah-back)"/><text x="365" y="219" class="fdLabel">POST /token, code + client auth + verifier</text><circle cx="276" cy="228" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="276" y="231.5" class="fdNumT" style="fill:var(--accent2)">5</text><line x1="439" y1="258" x2="263" y2="258" stroke="var(--accent2)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#oa1-authcode-ah-back)"/><text x="335" y="249" class="fdLabel">access token (+ refresh, ID token)</text><circle cx="424" cy="258" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="424" y="261.5" class="fdNumT" style="fill:var(--accent2)">6</text><line x1="261" y1="288" x2="621" y2="288" stroke="var(--accent2)" class="fdArrow" marker-end="url(#oa1-authcode-ah-back)"/><text x="457" y="279" class="fdLabel">GET /invoices: Authorization: Bearer …</text><circle cx="276" cy="288" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="276" y="291.5" class="fdNumT" style="fill:var(--accent2)">7</text><line x1="623" y1="318" x2="263" y2="318" stroke="var(--accent2)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#oa1-authcode-ah-back)"/><text x="427" y="309" class="fdLabel">200, the user’s data</text><circle cx="608" cy="318" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="608" y="321.5" class="fdNumT" style="fill:var(--accent2)">8</text><text x="350" y="336" class="fdNote">Tokens only ever travel on the back channel.</text><line x1="18" y1="372" x2="44" y2="372" stroke="var(--accent)" class="fdArrow"/><text x="50" y="376" class="fdLegend">front channel (via the browser)</text><line x1="271.29999999999995" y1="372" x2="297.29999999999995" y2="372" stroke="var(--accent2)" class="fdArrow"/><text x="303.29999999999995" y="376" class="fdLegend">back channel (server to server)</text></svg></div>
<!--/flow:oa1-authcode-->
<ol class="fdSteps">
<li>The user clicks <i>“Log in with Example”</i> in the client app.</li>
<li>The client redirects the browser to the AS <code>/authorize</code> endpoint with what it wants (<b>front channel</b>).</li>
<li>The user logs in and consents at the AS; the client never sees the password.</li>
<li>The AS redirects back to the client's <code>redirect_uri</code> with a short-lived <b>authorization code</b> (front channel; the code is useless alone).</li>
<li>The client's backend exchanges that code for tokens at <code>/token</code>, authenticating itself and presenting the PKCE verifier (<b>back channel</b>, private).</li>
<li>The AS returns the access token (plus refresh and ID tokens if requested). Tokens never travel through the browser.</li>
<li>The client calls the API with <code>Authorization: Bearer …</code>.</li>
<li>The API validates the token and returns the user's data.</li>
</ol>
<p><b>CSRF protection on the redirect is mandatory, but <code>state</code> is no longer the only way to
get it.</b> RFC 9700 (the OAuth 2.0 Security BCP) says clients MUST prevent CSRF at the redirection
endpoint, and gives three acceptable mechanisms: a client using <b>PKCE</b> MAY rely on the protection
PKCE already provides; in OpenID Connect flows the <b>nonce</b> provides it; <i>otherwise</i> a one-time
CSRF token carried in <code>state</code> and bound to the user agent MUST be used.</p>
<p>So the modern reading is: PKCE is the CSRF defense, and <code>state</code> is how you carry
application state (where to send the user back to) rather than a security parameter you must always
populate. It is still shown below because plenty of deployments use it exactly that way, and because a
client that cannot rely on PKCE (the AS does not support it) still needs it.</p>
<div class="codeSample" data-hl>GET https://as.example.com/authorize
  ?response_type=code            // "code" = Authorization Code flow
  &client_id=app123
  &redirect_uri=https://app.example.com/callback
  &scope=openid%20profile        // space-separated, URL-encoded
  &state=xyzRANDOM               // CSRF protection, verified on return</div>

<h4>Why there is a code at all</h4>
<p>The obvious design would be for the authorization server to redirect back with the access token itself.
The reason it does not is that the redirect travels through the <b>browser</b>, and a browser is a leaky
place. URLs land in history, in server access logs, in the <code>Referer</code> header sent to the next
site, and in the address bar over someone's shoulder. Anything you put in a redirect should be assumed to
be seen.</p>
<p>So the redirect carries a <b>code</b>, which is useless on its own. Redeeming it requires something the
browser never had: the client's secret, or the PKCE verifier. An attacker who captures the code from a log
gets a value that has already been used, expires in seconds, and cannot be exchanged without a second
factor they do not hold.</p>

<h4>Front channel and back channel, precisely</h4>
<p>The <b>front channel</b> is anything routed through the user's browser: the <code>/authorize</code>
request and the redirect back. It is visible, modifiable and untrusted. The <b>back channel</b> is a direct
server-to-server HTTPS call (the <code>/token</code> request) where the client authenticates and nobody
in between can read the response. Tokens belong in the back channel. Once you hold that distinction, most
OAuth security advice stops needing to be memorized: it is nearly all "do not put that in the front
channel".</p>

<h4>What the redirect actually carries</h4>
<div class="codeSample">GET /authorize?response_type=code        // ask for a code, not a token
  &amp;client_id=my-app                      // who is asking
  &amp;redirect_uri=https://app.example/cb    // where to come back to, EXACT match
  &amp;scope=openid profile invoices:read     // what is being requested
  &amp;code_challenge=...&amp;code_challenge_method=S256   // PKCE
  &amp;state=...                              // app state, and CSRF where PKCE is unavailable</div>
<p>Two of these cause most integration failures. <code>redirect_uri</code> is matched as an <b>exact
string</b> against the registered list: a trailing slash, a different port in development, or an added
query parameter is a mismatch, and that strictness is deliberate: every relaxation of it has produced a
real attack. And the <b>code is single-use</b>. If one is presented twice the authorization server should
treat it as a theft signal and revoke the whole grant, not merely refuse the second attempt.</p>`,
docs:[['RFC 9700 &sect;2.1 - CSRF: PKCE, nonce or state','https://www.rfc-editor.org/rfc/rfc9700#section-2.1'],['RFC 6749 (OAuth 2.0)','https://www.rfc-editor.org/rfc/rfc6749'],['oauth.net (Authorization Code)','https://oauth.net/2/grant-types/authorization-code/'],['RFC 9700 (OAuth security BCP)','https://www.rfc-editor.org/rfc/rfc9700']],
ex:{title:'Build the /authorize request',
prompt:`Write <code>AuthorizeUrl</code> with <code>static String build(String base, String clientId, String redirectUri, String scope, String state)</code> that returns the authorization request URL: <code>base + "?response_type=code"</code> then <code>&amp;client_id=</code>, <code>&amp;redirect_uri=</code>, <code>&amp;scope=</code>, <code>&amp;state=</code>, each value passed through <code>java.net.URLEncoder.encode(value, "UTF-8")</code>. Include <code>response_type=code</code> and all four params. Declare <code>throws Exception</code>.`,
starter:`import java.net.URLEncoder;

public class AuthorizeUrl {
    static String build(String base, String clientId, String redirectUri, String scope, String state) throws Exception {
        return null;
    }
}`,
tests:[{d:'uses the authorization code response type',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:response_type=code))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:response_type=code)[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:response_type=code)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:response_type=code)[^{]*?return\\s+\\k<av>\\b)'},{d:'includes client_id',re:'&client_id=[^;"\']*["\'][^;"\']*?encode\\s*\\(\\s*clientId\\b'},{d:'includes redirect_uri',re:'&redirect_uri='},{d:'includes scope',re:'&scope='},{d:'includes state (CSRF)',re:'&state='},{d:'URL-encodes values',re:'URLEncoder\\.encode\\s*\\('}],
behavior:`build("https://as/authorize","app","https://app/cb","openid profile","xyz") returns "https://as/authorize?response_type=code&client_id=app&redirect_uri=https%3A%2F%2Fapp%2Fcb&scope=openid+profile&state=xyz". response_type=code selects the Authorization Code flow; every value is URL-encoded.`,
hints:['Start the query: <code>base + "?response_type=code"</code>.','Append each param: <code>+ "&client_id=" + URLEncoder.encode(clientId, "UTF-8")</code>.','Do the same for redirect_uri, scope, and state.'],
solution:`import java.net.URLEncoder;

public class AuthorizeUrl {
    static String build(String base, String clientId, String redirectUri, String scope, String state) throws Exception {
        return base + "?response_type=code"
                + "&client_id=" + URLEncoder.encode(clientId, "UTF-8")
                + "&redirect_uri=" + URLEncoder.encode(redirectUri, "UTF-8")
                + "&scope=" + URLEncoder.encode(scope, "UTF-8")
                + "&state=" + URLEncoder.encode(state, "UTF-8");
    }
}`}},

{id:'oaclient',title:'What a client is: registration, secrets & creation',body:`
<p>In OAuth the word <b>client</b> does not mean the user or the browser; it means the <b>application</b> asking for access (a web app, a mobile app, a backend service). Before it can ask for a single token, the client must be <b>registered</b> with the authorization server (AS), which is how the AS knows it and decides how much to trust it.</p>
<p><b>What registration produces.</b> The AS issues a <code>client_id</code> (a public identifier, not a secret) and records the client's allowed <b>redirect URIs</b> (an exact allowlist, so codes can only be sent back to URLs you pre-approved). For a <b>confidential client</b> it also issues a <code>client_secret</code>: a shared secret the client uses to prove its identity at the token endpoint. A <b>public client</b> (a SPA or mobile app) cannot keep a secret (anyone can read the bundle or decompile the app), so it gets <b>no secret</b> and relies on PKCE instead.</p>
<div class="codeSample">Register app  ─▶  client_id: "s6BhdRkqt3"   (public)
                  client_secret: "gX1...9f"   (confidential clients only, shown ONCE)
                  redirect_uris: ["https://app.example.com/callback"]</div>
<p><b>How clients are created.</b> Two ways: manually in the AS dashboard/admin console (you register the app and copy the id and secret), or programmatically via <b>Dynamic Client Registration</b> (RFC 7591), where a client is created through an API and the AS returns the credentials in the response.</p>
<p><b>How the secret is shared and protected.</b> The AS generates the secret at registration and displays it <b>once</b>; you store it in a secret manager or environment variable, <b>never in source control or front-end code</b>, and rotate it periodically. Stronger clients skip the shared secret entirely: <b>private_key_jwt</b> (the client signs a JWT with its private key; the AS verifies with the client's public key, so there is no shared secret to leak) or <b>mTLS</b> client certificates. So client authentication runs from "nothing" (public + PKCE) to a shared <code>client_secret</code> to asymmetric keys, in increasing order of assurance.</p>

<h4>Client authentication is more than a secret</h4>
<p>A shared <code>client_secret</code> is the weakest of the options the specification allows, because it is a symmetric credential that both parties hold: it appears in configuration, in CI variables, in the authorization server's database, and in whatever place a developer pasted it during setup. Two better mechanisms exist and are worth asking for:</p>
<ul>
<li><b><code>private_key_jwt</code></b>, the client signs a short-lived JWT assertion with a private key and sends that instead. The authorization server only ever holds a <i>public</i> key, so a compromise of its database does not yield anything that can impersonate a client.</li>
<li><b><code>tls_client_auth</code> (mTLS)</b>, the client authenticates with a certificate during the TLS handshake, which also enables certificate-bound access tokens.</li>
</ul>
<p>Where a secret must be used, prefer <code>client_secret_basic</code> or <code>client_secret_post</code> over anything that puts it in a URL, rotate it on a schedule, and support two valid secrets at once so rotation does not require downtime. Hardened profiles such as FAPI simply ban shared secrets, which tells you where the direction of travel is.</p>

<h4>Redirect URI matching is a security boundary</h4>
<p>The registered redirect URIs are the list of places an authorization code may be delivered, and the specification requires <b>exact string matching</b> for a reason: every relaxation has produced real attacks. Wildcards in the host let a subdomain takeover receive codes. Allowing a path prefix lets an open redirect on that path forward the code onward. Permitting arbitrary query parameters allows the same. The rule is to register complete, exact URIs, keep the list short, and never add <code>http://</code> entries outside of loopback for native apps.</p>

<h4>Dynamic registration, and the metadata that comes with it</h4>
<p>Dynamic Client Registration (RFC 7591) exists because some ecosystems cannot pre-register everyone by hand: native apps registering per installation, or a federation where participants join continuously. Open registration is a spam and abuse surface, so real deployments gate it with an initial access token, or replace it with the software-statement and trust-chain mechanisms of OpenID Federation. Whichever route, registration is where the client's <b>metadata</b> is fixed: its grant types, response types, scopes, token endpoint auth method and JWKS location. That metadata is the authorization server's model of what this client is allowed to do, which makes registration a security decision, not an onboarding formality.</p>`,
docs:[['Client registration (RFC 6749 §2)','https://www.rfc-editor.org/rfc/rfc6749#section-2'],['Dynamic Client Registration (RFC 7591)','https://www.rfc-editor.org/rfc/rfc7591'],['Client authentication (OIDC)','https://openid.net/specs/openid-connect-core-1_0.html#ClientAuthentication']],
ex:{title:'Pick the client credential',
prompt:`Write class <code>Client</code> with two static methods. <code>String credential(String clientType)</code>: <code>"spa"</code>→<code>"none (PKCE)"</code>, <code>"mobile"</code>→<code>"none (PKCE)"</code>, <code>"server"</code>→<code>"client_secret"</code>, <code>"backend-high-security"</code>→<code>"private_key_jwt"</code>, else <code>"unknown"</code>. <code>boolean confidential(String clientType)</code>: true only for <code>"server"</code> or <code>"backend-high-security"</code> (the clients that can keep a secret).`,
starter:`public class Client {
    static String credential(String clientType) {
        return null;
    }
    static boolean confidential(String clientType) {
        return false;
    }
}`,
solution:`public class Client {
    static String credential(String clientType) {
        switch (clientType) {
            case "spa":                   return "none (PKCE)";
            case "mobile":                return "none (PKCE)";
            case "server":                return "client_secret";
            case "backend-high-security": return "private_key_jwt";
            default:                      return "unknown";
        }
    }
    static boolean confidential(String clientType) {
        return clientType.equals("server") || clientType.equals("backend-high-security");
    }
}`,
tests:[{d:'a SPA is a public client using PKCE, no secret',re:'(?:["\']spa["\'][^;}]*?return\\s+["\']none \\(PKCE\\)["\'])|(?:case\\s*["\']spa["\']\\s*->\\s*(?:\\{\\s*)?["\']none \\(PKCE\\)["\'])|(?:["\']spa["\']\\s*:\\s*["\']none \\(PKCE\\)["\'])|(?:(?:put|entry|of)\\s*\\(\\s*["\']spa["\']\\s*,\\s*["\']none \\(PKCE\\)["\'])',flags:'s'},{d:'a server uses a client_secret',re:'"server".*?"client_secret"',flags:'s'},{d:'high-security backends use private_key_jwt',re:'"backend-high-security".*?"private_key_jwt"',flags:'s'},{d:'confidential = server or high-security',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:equals\\s*\\(\\s*"server"\\s*\\)\\s*\\|\\|))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:equals\\s*\\(\\s*"server"\\s*\\)\\s*\\|\\|)[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:equals\\s*\\(\\s*"server"\\s*\\)\\s*\\|\\|)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:equals\\s*\\(\\s*"server"\\s*\\)\\s*\\|\\|)[^{]*?return\\s+\\k<av>\\b)'},{d:'unknown default',re:'"unknown"'}],
behavior:`credential("spa") is "none (PKCE)", credential("server") is "client_secret", credential("backend-high-security") is "private_key_jwt". confidential("server") is true; confidential("spa") is false: a public client cannot keep a secret, which is exactly why it uses PKCE.`,
hints:['A client is the application, not the user; it is registered with the authorization server first.','Public clients (spa, mobile) hold no secret and use PKCE; confidential clients (server) authenticate with a secret or a key.','confidential() is true only for the two server-side types.']}},
{id:'oa2',title:'PKCE, securing public clients',body:`
<p>A <b>public client</b> (SPA, mobile app) can't keep a secret, so it can't prove it's the same app that started the flow. Without protection, an attacker who intercepts the authorization code could redeem it. <b>PKCE</b> (Proof Key for Code Exchange, "pixy") fixes this and is now recommended for <i>all</i> clients.</p>
<p>How it works: a one-time secret the client makes up per flow:</p>
<ul>
<li><b>code_verifier</b>: a high-entropy random string the client generates and keeps.</li>
<li><b>code_challenge</b>: <code>base64url(SHA-256(code_verifier))</code>, sent on the <code>/authorize</code> request along with <code>code_challenge_method=S256</code>.</li>
<li>Later, at <code>/token</code>, the client sends the original <b>code_verifier</b>. The AS hashes it and checks it matches the challenge it stored. Only the app that created the verifier can complete the exchange.</li>
</ul>
<p>It's a proof-of-possession: the challenge is public (goes through the browser), but the verifier stays on the client, and you can't reverse SHA-256 to get it. An intercepted code is now useless without the verifier.</p>
<div class="codeSample" data-hl>// challenge = base64url( SHA-256( verifier ) ), no padding
MessageDigest sha = MessageDigest.getInstance("SHA-256");
byte[] hash = sha.digest(verifier.getBytes("US-ASCII"));
String challenge = Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
// send on /authorize:  &code_challenge=...&code_challenge_method=S256</div>

<h4>The attack, told as a story</h4>
<p>A mobile app starts a login. The authorization server needs to send the code back, so the app registered
a custom URL scheme, <code>myapp://callback</code>. On some platforms, <b>any app can claim that
scheme</b>. A malicious app installed on the same phone registers it too, the operating system hands it the
redirect, and it now holds a valid authorization code for your user.</p>
<p>Before PKCE, that code was enough. A public client has no secret, so the token endpoint could not tell
the malicious app from the real one: both presented the same <code>client_id</code> and a valid code, and
both got tokens.</p>

<h4>The fix: a secret invented per flow</h4>
<p>PKCE's insight is that the client does not need a <i>long-lived</i> secret. It needs to prove it is the
same party that <b>started</b> this particular flow, and for that a one-time value generated in memory is
enough.</p>
<div class="codeSample" data-hl>1. the app invents a code_verifier: 43-128 random characters, in memory
2. it sends only the HASH of it on the (visible) /authorize request:
     code_challenge = base64url(SHA-256(verifier))
     code_challenge_method = S256
3. the code comes back through the browser - and a thief who intercepts
   it holds a code but NOT the verifier
4. redeeming the code requires presenting the ORIGINAL verifier, which
   the AS hashes and compares against the challenge it stored

// the challenge is public; the verifier never leaves the app; SHA-256
// cannot be reversed. so an intercepted code is inert.</div>

<h4>Why <code>plain</code> exists and must not be used</h4>
<p>The spec permits <code>code_challenge_method=plain</code>, where the challenge <i>is</i> the verifier.
That protects nothing against anyone who saw the authorization request, which is precisely the attacker
this defends against. <b>Always <code>S256</code></b>, and a server should refuse <code>plain</code>.</p>
<p>Related, and subtler: the <b>downgrade attack</b>. If an attacker can strip the
<code>code_challenge</code> from the request, an authorization server that treats PKCE as optional will
issue a code with no challenge attached, and the protection silently disappears. A server that requires
PKCE for public clients closes it; a client cannot.</p>

<h4>Three parameters people confuse</h4>
<div class="codeSample" data-hl>state            CSRF on the redirect endpoint, and app state
                 ("send me back to /reports"). per RFC 9700, PKCE now
                 provides the CSRF protection, so state is increasingly
                 just the return address.
nonce            OIDC replay protection. sent on /authorize, echoed in
                 the ID TOKEN, checked by the client. binds the token
                 to THIS login.
code_verifier    PKCE. proves the redeemer started the flow. never
                 leaves the client until the token request.

// three different jobs, three different attacks. they are not
// interchangeable, and having one does not excuse missing another.</div>

<h4>It is no longer just for mobile</h4>
<p>PKCE was designed for native apps and is now <b>required for every client</b> using the authorization
code flow under OAuth 2.1, including confidential ones with a secret. The reason is that a client secret
protects the <i>token request</i> and does nothing about a code stolen in transit, whereas PKCE binds the
code itself to the flow that created it. The two defend different things, so you want both.</p>`,
docs:[['RFC 7636, PKCE','https://www.rfc-editor.org/rfc/rfc7636'],['oauth.net, PKCE','https://oauth.net/2/pkce/']],
ex:{title:'Compute the PKCE code_challenge',
prompt:`Write <code>Pkce</code> with: <code>static String verifier()</code> returning a base64url (no padding) string of <b>32 random bytes</b> from <code>SecureRandom</code>; and <code>static String challenge(String verifier)</code> returning <code>base64url(SHA-256(verifier))</code>; use <code>MessageDigest.getInstance("SHA-256")</code>, hash <code>verifier.getBytes("US-ASCII")</code>, and encode with <code>Base64.getUrlEncoder().withoutPadding()</code>. Declare <code>throws Exception</code>.`,
starter:`import java.security.*;
import java.util.Base64;

public class Pkce {
    static String verifier() {
        return null;
    }
    static String challenge(String verifier) throws Exception {
        return null;
    }
}`,
tests:[{d:'random verifier from SecureRandom',re:'new\\s+SecureRandom\\s*\\('},{d:'hashes with SHA-256',re:'MessageDigest\\.getInstance\\s*\\(\\s*"SHA-256"\\s*\\)'},{d:'hashes the verifier bytes',re:'\\.digest\\s*\\('},{d:'base64url without padding',re:'getUrlEncoder\\s*\\(\\s*\\)\\s*\\.\\s*withoutPadding'}],
behavior:`verifier() returns a different high-entropy string each call. challenge(v) is deterministic for a given v and is the base64url SHA-256 of it (S256 method). The verifier stays on the client; only the challenge is sent on /authorize, so an intercepted code cannot be redeemed without the verifier.`,
hints:['verifier: <code>byte[] b=new byte[32]; new SecureRandom().nextBytes(b); return Base64.getUrlEncoder().withoutPadding().encodeToString(b);</code>','challenge: hash then encode using <code>md.digest(verifier.getBytes("US-ASCII"))</code>.','Always base64URL (not standard base64) and drop padding.'],
solution:`import java.security.*;
import java.util.Base64;

public class Pkce {
    static String verifier() {
        byte[] b = new byte[32];
        new SecureRandom().nextBytes(b);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(b);
    }
    static String challenge(String verifier) throws Exception {
        MessageDigest sha = MessageDigest.getInstance("SHA-256");
        byte[] hash = sha.digest(verifier.getBytes("US-ASCII"));
        return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
    }
}`}},

{id:'oa2b',title:'PKCE end to end: the attack, the flow, the pitfalls',body:`
<p>The previous lesson gave the mechanism. This one walks the entire exchange parameter by parameter,
names the two distinct attacks PKCE defeats, and covers the ways implementations get it wrong. PKCE is
now required on <i>every</i> authorization code flow, so it is worth knowing completely.</p>
<!--flow:oa2b-pkce-->
<h4>PKCE: the flow and the interception attack: step by step</h4>
<div class="flowDia"><svg viewBox="0 0 700 434" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="PKCE: the flow and the interception attack"><defs><marker id="oa2b-pkce-ah-front" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent)"/></marker><marker id="oa2b-pkce-ah-back" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent2)"/></marker><marker id="oa2b-pkce-ah-attack" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--bad)"/></marker><marker id="oa2b-pkce-ah-x" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--muted)"/></marker></defs><line x1="74" y1="54" x2="74" y2="402" class="fdLife"/><line x1="350" y1="54" x2="350" y2="402" class="fdLife"/><line x1="626" y1="54" x2="626" y2="402" class="fdLife"/><rect x="-2.5999999999999943" y="8" width="153.2" height="46" rx="8" class="fdActor"/><text x="74" y="27" class="fdActorT">Native / SPA app</text><text x="74" y="42" class="fdActorS">public client, no secret</text><rect x="257" y="8" width="186" height="46" rx="8" class="fdActor"/><text x="350" y="35.5" class="fdActorT">Authorization Server</text><rect x="561.7" y="8" width="128.6" height="46" rx="8" class="fdActor"/><text x="626" y="27" class="fdActorT">Malicious app</text><text x="626" y="42" class="fdActorS">intercepted the redirect</text><rect x="14" y="89" width="263.6" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="153.8" y="104" class="fdSelfT">random code_verifier, kept in memory</text><circle cx="14" cy="100" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="14" y="103.5" class="fdNumT" style="fill:var(--muted)">1</text><rect x="14.000000000000014" y="125" width="230.6" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="137.3" y="140" class="fdSelfT">code_challenge = S256(verifier)</text><circle cx="14.000000000000014" cy="136" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="14.000000000000014" y="139.5" class="fdNumT" style="fill:var(--muted)">2</text><line x1="77" y1="174" x2="345" y2="174" stroke="var(--accent)" class="fdArrow" marker-end="url(#oa2b-pkce-ah-front)"/><text x="227" y="165" class="fdLabel">/authorize + code_challenge</text><circle cx="92" cy="174" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="92" y="177.5" class="fdNumT" style="fill:var(--accent)">3</text><line x1="347" y1="204" x2="79" y2="204" stroke="var(--accent)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#oa2b-pkce-ah-front)"/><text x="197" y="195" class="fdLabel">code</text><circle cx="332" cy="204" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="332" y="207.5" class="fdNumT" style="fill:var(--accent)">4</text><line x1="77" y1="234" x2="345" y2="234" stroke="var(--accent2)" class="fdArrow" marker-end="url(#oa2b-pkce-ah-back)"/><text x="227" y="225" class="fdLabel">POST /token, code + code_verifier</text><circle cx="92" cy="234" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="92" y="237.5" class="fdNumT" style="fill:var(--accent2)">5</text><rect x="218.2" y="251" width="263.6" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="358" y="266" class="fdSelfT">S256(verifier) = stored challenge? ✓</text><circle cx="218.2" cy="262" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="218.2" y="265.5" class="fdNumT" style="fill:var(--muted)">6</text><line x1="347" y1="300" x2="79" y2="300" stroke="var(--accent2)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#oa2b-pkce-ah-back)"/><text x="197" y="291" class="fdLabel">tokens</text><circle cx="332" cy="300" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="332" y="303.5" class="fdNumT" style="fill:var(--accent2)">7</text><line x1="14" y1="326" x2="686" y2="326" class="fdPhase"/><text x="350" y="330" class="fdPhaseT">the same code, stolen in transit</text><line x1="623" y1="360" x2="355" y2="360" stroke="var(--bad)" class="fdArrow" stroke-dasharray="7 4" marker-end="url(#oa2b-pkce-ah-attack)"/><text x="473" y="351" class="fdLabel fdLabelBad">POST /token, stolen code, no verifier</text><circle cx="608" cy="360" r="9" class="fdNum" style="stroke:var(--bad)"/><text x="608" y="363.5" class="fdNumT" style="fill:var(--bad)">8</text><line x1="353" y1="390" x2="621" y2="390" stroke="var(--bad)" class="fdArrow" stroke-dasharray="7 4" marker-end="url(#oa2b-pkce-ah-attack)"/><text x="503" y="381" class="fdLabel fdLabelBad">400 invalid_grant</text><circle cx="368" cy="390" r="9" class="fdNum" style="stroke:var(--bad)"/><text x="368" y="393.5" class="fdNumT" style="fill:var(--bad)">9</text><line x1="18" y1="420" x2="44" y2="420" stroke="var(--accent)" class="fdArrow"/><text x="50" y="424" class="fdLegend">front channel (via the browser)</text><line x1="271.29999999999995" y1="420" x2="297.29999999999995" y2="420" stroke="var(--accent2)" class="fdArrow"/><text x="303.29999999999995" y="424" class="fdLegend">back channel (server to server)</text><line x1="524.5999999999999" y1="420" x2="550.5999999999999" y2="420" stroke="var(--bad)" class="fdArrow" stroke-dasharray="7 4"/><text x="556.5999999999999" y="424" class="fdLegend">attack path</text></svg></div>
<ol class="fdSteps">
<li><b>Native / SPA app:</b> random code_verifier, kept in memory</li>
<li><b>Native / SPA app:</b> code_challenge = S256(verifier)</li>
<li><b>Native / SPA app → Authorization Server:</b> /authorize + code_challenge <i>(front channel)</i></li>
<li><b>Authorization Server → Native / SPA app:</b> code <i>(front channel)</i></li>
<li><b>Native / SPA app → Authorization Server:</b> POST /token, code + code_verifier <i>(back channel)</i></li>
<li><b>Authorization Server:</b> S256(verifier) = stored challenge? ✓</li>
<li><b>Authorization Server → Native / SPA app:</b> tokens <i>(back channel)</i></li>
<li><b>Malicious app → Authorization Server:</b> POST /token, stolen code, no verifier <b>⚠ attack</b></li>
<li><b>Authorization Server → Malicious app:</b> 400 invalid_grant <b>⚠ attack</b></li>
</ol>
<!--/flow:oa2b-pkce-->

<h4>The attack it was invented for</h4>
<p>PKCE came from mobile. A native app cannot hold a client secret (anyone can unpack the binary), and
it receives its authorization code through a <b>custom URL scheme</b> like
<code>myapp://callback</code>. On mobile platforms of the time, <i>any</i> installed app could register
that same scheme. Nothing verified ownership.</p>
<div class="codeSample" data-hl>WITHOUT PKCE, authorization code interception

 1. real app  -> browser: /authorize?client_id=app&redirect_uri=myapp://cb
 2. user authenticates and consents
 3. AS -> browser: redirect to myapp://cb?code=XYZ
 4. MALICIOUS app also registered myapp:// and receives the code
 5. malicious app -> /token  code=XYZ, client_id=app
 6. AS has no way to tell the apps apart -> issues the token

// there is no secret, so "which app is this?" is unanswerable.</div>
<p>The insight behind the fix: if the app cannot prove <i>who</i> it is, let it prove that it is
<i>the same party that started this particular flow</i>. A fresh secret per flow, committed to up
front, and revealed only at redemption.</p>

<h4>The second attack: code injection</h4>
<p>Less discussed and the reason PKCE now applies to confidential clients too. Here the attacker does
not steal your code; they feed you <i>theirs</i>.</p>
<p>The attacker begins their own legitimate authorization flow and obtains a code for <i>their</i>
account. They then inject that code into a victim's session, so the victim's client redeems it and ends
up logged in as, or linked to, the attacker's account. Data the victim then uploads goes to the
attacker's account. A client secret does nothing here: the client is genuine, it is the code that is
foreign. PKCE stops it because the victim's client holds a verifier that does not match the challenge
the attacker's code was bound to.</p>

<h4>The complete flow</h4>
<div class="codeSample" data-hl>STEP 1, client generates, per flow, and keeps in memory
  code_verifier = 43-128 chars from [A-Z a-z 0-9 - . _ ~]
                  cryptographically random, e.g. base64url(32 random bytes)
  code_challenge = base64url_nopad( SHA-256( ASCII(code_verifier) ) )

STEP 2, authorization request (front channel, through the browser)
  GET /authorize
    ?response_type=code
    &client_id=app
    &redirect_uri=https://app.example.com/cb    exact match, registered
    &scope=openid%20orders:read
    &state=xyz789                     CSRF: bound to the user's session
    &code_challenge=E9Melhoa2Ow...    the HASH, safe to expose
    &code_challenge_method=S256

STEP 3, AS stores challenge + method against the issued code, then redirects
  302 https://app.example.com/cb?code=SplxlOB&state=xyz789

STEP 4, client checks state matches, then redeems (back channel, direct POST)
  POST /token
    grant_type=authorization_code
    &code=SplxlOB
    &redirect_uri=https://app.example.com/cb    must match step 2 exactly
    &client_id=app
    &code_verifier=dBjftJeZ4CVP...    the ORIGINAL, never sent before now

STEP 5, AS verifies
    base64url_nopad(SHA-256(code_verifier)) == stored code_challenge ?
    and the code is unused, unexpired, and issued to this client
  -> 200 { "access_token": "...", "token_type": "Bearer", ... }</div>
<p>The asymmetry is the whole design. The <b>challenge</b> travels through the browser, where it may be
observed, and that is harmless, because SHA-256 cannot be reversed. The <b>verifier</b> travels only on
the direct back-channel POST, once, at the end.</p>

<h4>state and PKCE are not the same thing</h4>
<p>They are routinely conflated because they sit next to each other in the request:</p>
<div class="codeSample" data-hl>state           binds the RESPONSE to the user's session   -> stops CSRF
code_challenge  binds the CODE to the client's secret       -> stops interception
                                                               and injection
// you need both. neither substitutes for the other.</div>
<p>In OpenID Connect the <code>nonce</code> is a third, separate thing: it binds the <i>ID token</i> to
this login, defeating ID token replay.</p>

<h4>Four ways to get it wrong</h4>
<ol>
<li><b>Using <code>plain</code>.</b> The specification allows <code>code_challenge_method=plain</code>,
where the challenge <i>is</i> the verifier. Anyone who observes the authorization request then has the
verifier, and the protection is gone. Always <code>S256</code>; a server should reject
<code>plain</code> outright.</li>
<li><b>The downgrade attack.</b> If a server accepts a redemption with no <code>code_verifier</code>
when a challenge <i>was</i> registered, an attacker simply omits it. The server must remember that a
challenge was stored and <b>require</b> the verifier; absence is failure, not a skipped optional
check.</li>
<li><b>A reused or weak verifier.</b> Generate it fresh per flow from a cryptographic random source, at
least 43 characters. A verifier derived from a timestamp, a session id or a counter is guessable, and
then so is the flow.</li>
<li><b>Storing the verifier where the code lands.</b> On a SPA, keeping it in
<code>localStorage</code> hands it to any injected script alongside everything else. Memory, for the
lifetime of the flow, is the right place.</li>
</ol>

<h4>When to use it</h4>
<p>Always. The old guidance ("PKCE is for public clients") is obsolete: OAuth 2.1 requires it on every
authorization code request, because the code-injection attack applies regardless of whether the client
holds a secret. It costs one hash, and there is no scenario where an authorization code flow is
better off without it.</p>`,
docs:[['RFC 7636 (Proof Key for Code Exchange)','https://www.rfc-editor.org/rfc/rfc7636'],['OAuth 2.0 Security BCP (authorization code injection)','https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics#name-authorization-code-injection'],['RFC 8252 (OAuth 2.0 for Native Apps)','https://www.rfc-editor.org/rfc/rfc8252'],['The OAuth 2.1 Authorization Framework (draft)','https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/']],
ex:{title:'The authorization server side of PKCE',
prompt:`Implement the verification an authorization server performs. Write <code>PkceServer</code> with three methods. <code>static boolean methodAllowed(String method)</code> accepts only <code>"S256"</code>, rejecting <code>"plain"</code> and null. <code>static boolean verifierWellFormed(String verifier)</code> requires a non-null verifier whose length is between 43 and 128 inclusive. <code>static boolean redeem(String storedChallenge, String presentedVerifier, java.util.function.Function&lt;String,String&gt; sha256Base64Url)</code> returns true only when a challenge was stored, a well-formed verifier was presented, and hashing the verifier reproduces the stored challenge, and it must return <b>false</b> when a challenge was stored but no verifier was presented, which is the downgrade attack.`,
starter:`import java.util.function.Function;

public class PkceServer {
    static boolean methodAllowed(String method) {
        return false;
    }
    static boolean verifierWellFormed(String verifier) {
        return false;
    }
    static boolean redeem(String storedChallenge, String presentedVerifier,
                          Function<String,String> sha256Base64Url) {
        return false;
    }
}`,
tests:[{d:'only S256 is accepted',re:'"S256"\\s*\\.\\s*equals|equals\\s*\\(\\s*"S256"'},{d:'the verifier has a minimum length',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:43))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:43)[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:43)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:43)[^{]*?return\\s+\\k<av>\\b)'},{d:'the verifier has a maximum length',re:'128'},{d:'a null verifier is rejected',re:'(?:if\\s*\\(\\s*[^;{]*(?:verifier\\s*==\\s*null|null\\s*==\\s*verifier)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:return\\s+(?!\\s*!)[^;{]*(?:verifier\\s*==\\s*null|null\\s*==\\s*verifier))|(?:(?<h1>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:verifier\\s*==\\s*null|null\\s*==\\s*verifier)[^{]*?return\\s+\\k<h1>\\b)'},{d:'a missing verifier fails the downgrade check',re:'(?:if\\s*\\(\\s*[^;{]*(?:presentedVerifier\\s*==\\s*null|null\\s*==\\s*presentedVerifier)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:return\\s+(?!\\s*!)[^;{]*(?:presentedVerifier\\s*==\\s*null|null\\s*==\\s*presentedVerifier))|(?:(?<h1>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:presentedVerifier\\s*==\\s*null|null\\s*==\\s*presentedVerifier)[^{]*?return\\s+\\k<h1>\\b)'},{d:'the stored challenge is required',re:'(?:if\\s*\\(\\s*[^;{]*(?:storedChallenge\\s*==\\s*null|null\\s*==\\s*storedChallenge)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:return\\s+(?!\\s*!)[^;{]*(?:storedChallenge\\s*==\\s*null|null\\s*==\\s*storedChallenge))|(?:(?<h1>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:storedChallenge\\s*==\\s*null|null\\s*==\\s*storedChallenge)[^{]*?return\\s+\\k<h1>\\b)'},{d:'the presented verifier is hashed before comparison',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:sha256Base64Url\\s*\\.\\s*apply\\s*\\())|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:sha256Base64Url\\s*\\.\\s*apply\\s*\\()[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:sha256Base64Url\\s*\\.\\s*apply\\s*\\()[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:sha256Base64Url\\s*\\.\\s*apply\\s*\\()[^{]*?return\\s+\\k<av>\\b)'},{d:'the hash is compared to the stored challenge',re:'equals\\s*\\('},{d:'a guard returns its constant, not the negation of it',re:'return\\s+!\\s*\\(?\\s*(?:true|false)\\s*\\)?\\s*;',not:true}],
behavior:`methodAllowed("S256") is true; methodAllowed("plain") is false, because with plain the challenge is the verifier and anyone who saw the authorization request already has it. verifierWellFormed of a 43-character string is true, of a 42-character one false, and of a 129-character one false. redeem returns true when the hash of the presented verifier equals the stored challenge. It returns false when presentedVerifier is null even though a challenge was stored: that is the downgrade attack, where the attacker simply omits the parameter and hopes the check is treated as optional. It also returns false when no challenge was stored at all.`,
hints:['<code>return "S256".equals(method);</code>','Length bounds are inclusive on both ends: <code>&gt;= 43 &amp;&amp; &lt;= 128</code>.','Guard both the stored challenge and the presented verifier before hashing, then <code>storedChallenge.equals(sha256Base64Url.apply(presentedVerifier))</code>.'],
solution:`import java.util.function.Function;

public class PkceServer {
    static boolean methodAllowed(String method) {
        // plain leaks the verifier to anyone who saw the authorization request
        return "S256".equals(method);
    }
    static boolean verifierWellFormed(String verifier) {
        if (verifier == null) return false;
        int n = verifier.length();
        return n >= 43 && n <= 128;
    }
    static boolean redeem(String storedChallenge, String presentedVerifier,
                          Function<String,String> sha256Base64Url) {
        if (storedChallenge == null) return false;
        // downgrade attack: a challenge was stored, so the verifier is REQUIRED
        if (presentedVerifier == null) return false;
        if (!verifierWellFormed(presentedVerifier)) return false;
        return storedChallenge.equals(sha256Base64Url.apply(presentedVerifier));
    }
}`}},

{id:'oa3',title:'Exchanging the code for tokens',body:`
<p>Step 4 of the flow: the client's <b>backend</b> takes the authorization code and calls the AS <code>/token</code> endpoint over the <b>back channel</b> (a direct, private POST, never the browser). This is where the actual tokens come out.</p>
<p>The request is a <code>application/x-www-form-urlencoded</code> body:</p>
<ul>
<li><code>grant_type=authorization_code</code></li>
<li><code>code=</code> the authorization code just received</li>
<li><code>redirect_uri=</code> the same one used on <code>/authorize</code> (the AS checks it matches)</li>
<li><code>client_id=</code> (and, for confidential clients, client authentication; for public clients, the PKCE <code>code_verifier</code>)</li>
</ul>
<p>The AS responds with JSON containing up to three tokens:</p>
<ul>
<li><b>access_token</b>: the key you send to the resource server (<code>Authorization: Bearer</code>). Short-lived.</li>
<li><b>refresh_token</b>: used to get new access tokens without re-login (lesson 5). Long-lived, guard it.</li>
<li><b>id_token</b>: only if you requested the <code>openid</code> scope; proves <i>who the user is</i> (OpenID Connect, lesson 6).</li>
</ul>
<div class="codeSample" data-hl>POST /token   (back channel)
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&code=AUTH_CODE&redirect_uri=https%3A%2F%2Fapp%2Fcb&client_id=app123&code_verifier=ORIGINAL_VERIFIER</div>

<h4>What the exchange is really for</h4>
<p>It is worth asking why this step exists at all: why not have the authorization server return tokens
directly to the browser and skip a round trip? That was the Implicit flow, and it is deprecated, because
of what the two channels can and cannot protect.</p>
<div class="codeSample" data-hl>FRONT CHANNEL (via the browser redirect)
  visible in URLs, history, Referer headers, server logs, extensions
  -> carries the CODE: single-use, short-lived, useless on its own

BACK CHANNEL (client backend -> AS, direct TLS)
  no browser, no intermediaries, client can authenticate itself
  -> carries the TOKENS: long-lived, high-privilege, must never be exposed

// the code exchange exists precisely to move value from the leaky
// channel to the private one. that is the whole design.</div>
<p>The code is deliberately a <b>voucher, not a credential</b>: it is worth nothing unless redeemed by the
party that started the flow, which is what client authentication (confidential clients) or PKCE (public
clients) proves.</p>

<h4>The checks the AS runs, and what each stops</h4>
<ul>
<li><b>Is the code known, unexpired, and unused?</b> Codes are single-use and short-lived; the spec
recommends a maximum of ten minutes. A second redemption must not only fail; RFC 9700 says the AS SHOULD
revoke every token already issued from that code, because a replay means someone else has it.</li>
<li><b>Was it issued to <i>this</i> client?</b> Otherwise a malicious client could redeem a code intended
for another.</li>
<li><b>Does <code>redirect_uri</code> match the one used at <code>/authorize</code>?</b> This binds the
redemption to the original request.</li>
<li><b>Does the <code>code_verifier</code> hash to the stored challenge?</b> The proof that the redeeming
party is the one that started the flow.</li>
</ul>

<h4>Reading the response properly</h4>
<p>The response is JSON, and <code>Cache-Control: no-store</code> matters: these are credentials, and
caching them anywhere is a leak. Beyond the tokens themselves:</p>
<div class="codeSample" data-hl>{ "access_token": "...", "token_type": "Bearer", "expires_in": 300,
  "refresh_token": "...", "id_token": "...", "scope": "orders:read" }

// "scope" may be NARROWER than you asked for. the AS is allowed to
// grant less. a client that assumes it got what it requested will
// fail at the resource server instead, confusingly.

// "expires_in" is SECONDS FROM NOW, not a timestamp. treat it as a
// hint and handle a 401 anyway - clocks drift and tokens get revoked.</div>

<h4>Two mistakes worth naming</h4>
<p><b>Reading the access token.</b> It is opaque <i>to the client</i> by contract, even when it happens to
be a decodable JWT. Its format and audience belong to the resource server, and clients that parse it
break the day the AS changes it. If you need to know who the user is, that is the ID token's job.</p>
<p><b>Treating the ID token as an API credential.</b> It is issued to the client, audience-restricted to
the client, and proves an authentication event. Sending it to an API is a category error the API should
reject.</p>`,
docs:[['RFC 6749 §4.1.3, Token Request','https://www.rfc-editor.org/rfc/rfc6749#section-4.1.3'],['oauth.net, Access Tokens','https://oauth.net/2/access-tokens/']],
ex:{title:'Build the token request body',
prompt:`Write <code>TokenRequest</code> with <code>static String body(String code, String redirectUri, String clientId, String codeVerifier)</code> returning the form-encoded body: <code>"grant_type=authorization_code"</code> then <code>&amp;code=</code>, <code>&amp;redirect_uri=</code>, <code>&amp;client_id=</code>, and <code>&amp;code_verifier=</code>, each value passed through <code>java.net.URLEncoder.encode(value, "UTF-8")</code>. Declare <code>throws Exception</code>.`,
starter:`import java.net.URLEncoder;

public class TokenRequest {
    static String body(String code, String redirectUri, String clientId, String codeVerifier) throws Exception {
        return null;
    }
}`,
tests:[{d:'authorization_code grant',re:'grant_type=authorization_code'},{d:'sends the code',re:'&code=[^;"\']*["\'][^;"\']*?encode\\s*\\(\\s*code\\b'},{d:'sends the matching redirect_uri',re:'&redirect_uri='},{d:'sends the PKCE verifier',re:'&code_verifier='},{d:'URL-encodes values',re:'URLEncoder\\.encode\\s*\\('}],
behavior:`body("AUTH","https://app/cb","app","VERIFIER") produces "grant_type=authorization_code&code=AUTH&redirect_uri=https%3A%2F%2Fapp%2Fcb&client_id=app&code_verifier=VERIFIER". Sent over the back channel to /token, it returns access_token (+ refresh_token, and id_token when openid was requested).`,
hints:['Start with the fixed grant: <code>"grant_type=authorization_code"</code>.','Append each field with <code>"&code=" + URLEncoder.encode(code, "UTF-8")</code> and so on.','redirect_uri must equal the one used on /authorize or the AS rejects the exchange.'],
solution:`import java.net.URLEncoder;

public class TokenRequest {
    static String body(String code, String redirectUri, String clientId, String codeVerifier) throws Exception {
        return "grant_type=authorization_code"
                + "&code=" + URLEncoder.encode(code, "UTF-8")
                + "&redirect_uri=" + URLEncoder.encode(redirectUri, "UTF-8")
                + "&client_id=" + URLEncoder.encode(clientId, "UTF-8")
                + "&code_verifier=" + URLEncoder.encode(codeVerifier, "UTF-8");
    }
}`}},

{id:'oa4',title:'Client Credentials, machine to machine',body:`
<p>Not every flow has a user. When a <b>backend service</b> calls another service on <i>its own</i> behalf (a cron job, a microservice), there is no browser and no one to log in. That's the <b>Client Credentials</b> grant: the client authenticates <i>as itself</i> and gets an access token for itself.</p>
<!--flow:oa4-clientcreds-->
<h4>Client Credentials flow: step by step</h4>
<div class="flowDia"><svg viewBox="0 0 640 246" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Client Credentials flow"><defs><marker id="oa4-clientcreds-ah-front" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent)"/></marker><marker id="oa4-clientcreds-ah-back" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent2)"/></marker><marker id="oa4-clientcreds-ah-attack" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--bad)"/></marker><marker id="oa4-clientcreds-ah-x" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--muted)"/></marker></defs><line x1="74" y1="54" x2="74" y2="234" class="fdLife"/><line x1="320" y1="54" x2="320" y2="234" class="fdLife"/><line x1="566" y1="54" x2="566" y2="234" class="fdLife"/><rect x="34.300000000000004" y="8" width="79.39999999999999" height="46" rx="8" class="fdActor"/><text x="74" y="27" class="fdActorT">Service</text><text x="74" y="42" class="fdActorS">confidential client</text><rect x="227" y="8" width="186" height="46" rx="8" class="fdActor"/><text x="320" y="35.5" class="fdActorT">Authorization Server</text><rect x="527" y="8" width="78" height="46" rx="8" class="fdActor"/><text x="566" y="35.5" class="fdActorT">API</text><line x1="77" y1="102" x2="315" y2="102" stroke="var(--accent2)" class="fdArrow" marker-end="url(#oa4-clientcreds-ah-back)"/><text x="212" y="93" class="fdLabel">POST /token, grant_type=client_credentials</text><circle cx="92" cy="102" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="92" y="105.5" class="fdNumT" style="fill:var(--accent2)">1</text><rect x="135.4" y="119" width="369.2" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="328" y="134" class="fdSelfT">authenticate the CLIENT itself (secret / key / mTLS)</text><circle cx="135.4" cy="130" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="135.4" y="133.5" class="fdNumT" style="fill:var(--muted)">2</text><line x1="317" y1="168" x2="79" y2="168" stroke="var(--accent2)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#oa4-clientcreds-ah-back)"/><text x="182" y="159" class="fdLabel">access token, no refresh token</text><circle cx="302" cy="168" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="302" y="171.5" class="fdNumT" style="fill:var(--accent2)">3</text><line x1="77" y1="198" x2="561" y2="198" stroke="var(--accent2)" class="fdArrow" marker-end="url(#oa4-clientcreds-ah-back)"/><text x="335" y="189" class="fdLabel">call with Bearer token</text><circle cx="92" cy="198" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="92" y="201.5" class="fdNumT" style="fill:var(--accent2)">4</text><text x="320" y="216" class="fdNote">No user, no browser, no consent, back channel only.</text></svg></div>
<ol class="fdSteps">
<li><b>Service → Authorization Server:</b> POST /token, grant_type=client_credentials <i>(back channel)</i></li>
<li><b>Authorization Server:</b> authenticate the CLIENT itself (secret / key / mTLS)</li>
<li><b>Authorization Server → Service:</b> access token, no refresh token <i>(back channel)</i></li>
<li><b>Service → API:</b> call with Bearer token <i>(back channel)</i></li>
</ol>
<!--/flow:oa4-clientcreds-->
<ul>
<li>Only for <b>confidential clients</b> (they must authenticate with a secret / key / mTLS).</li>
<li><b>No user, no refresh token, no ID token</b>: there's no user identity involved. The token's subject is the <i>client</i>.</li>
<li>A single back-channel POST to <code>/token</code> with <code>grant_type=client_credentials</code> and the scopes it needs.</li>
</ul>
<p>This is the foundation of service-to-service authorization (its own stream). The client proves itself (commonly HTTP Basic with client_id:client_secret) and receives a scoped token to call the target API.</p>
<div class="codeSample" data-hl>POST /token
Authorization: Basic base64(client_id ":" client_secret)   // client auth
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials&scope=orders%3Aread</div>

<h4>The conceptual shift: no user in the picture</h4>
<p>Every flow so far has had a user at the center: someone to authenticate, someone to consent, someone
whose data is being reached. Client Credentials removes all three. There is no resource owner because the
<b>client is the resource owner</b>: it is asking for access to something it owns, on its own behalf.</p>
<p>Which is why the pieces you are used to disappear. No redirect, because there is no browser and nobody
to look at a consent screen. No ID token, because there is no authentication event to describe. No
refresh token, because the client can simply authenticate again whenever it likes; RFC 6749 says a
refresh token SHOULD NOT be issued here, and a client asking for one has usually misunderstood the
grant.</p>
<div class="codeSample" data-hl>authorization code:  "this USER lets this APP read their orders"
                       sub = the user, and the app is a delegate

client credentials:  "this SERVICE may read orders"
                       sub = the service. no delegation, no user.

// this is the distinction that trips people: if a request is
// ultimately on behalf of a person, client credentials is the
// WRONG grant, even when a service makes the call.</div>

<h4>The mistake this grant invites</h4>
<p>A background job legitimately acts as itself. But teams reach for Client Credentials for the wrong
reason too: a service needs to call another service <i>during a user's request</i>, and passing user
context is awkward, so it uses its own service token instead.</p>
<p>The consequence is that the downstream service sees only "orders-service called me" and has lost the
information it needs to authorize properly. The user's identity, their permissions, and any consent are
gone, so the downstream must either trust the caller completely, or accept an unauthenticated user-id
header, which is not authorization at all. The correct tool is <b>token exchange</b> (RFC 8693), covered
in the service-to-service stream, which produces a token for the downstream audience that still carries
the subject.</p>

<h4>Authenticating as a machine</h4>
<p>The security of this grant reduces entirely to how the client proves itself, and the options run in
increasing order of assurance:</p>
<ul>
<li><b>client_secret_basic / _post</b>: a shared secret. Simple, ubiquitous, and it is a long-lived
credential that must be stored, distributed, rotated, and kept out of logs.</li>
<li><b><code>private_key_jwt</code></b>, the client signs a short-lived JWT assertion with its private
key. Nothing shared, so nothing to leak from the server side.</li>
<li><b>mTLS</b>: the TLS certificate is the credential, and the issued token can be
<i>certificate-bound</i> (RFC 8705), so a stolen token cannot be used without the key.</li>
<li><b>Workload identity federation</b>: the platform attests what the workload is, and that attestation
is exchanged for a token. No stored secret at all, which is the end state worth aiming at.</li>
</ul>

<h4>And the operational trap</h4>
<p>These tokens are fetched by code, in a loop. <b>Cache them until shortly before expiry.</b> A service
that requests a fresh token per outbound call will hammer the authorization server, get rate-limited, and
take an outage caused entirely by its own token acquisition, a genuinely common production failure. Add
jitter, so a fleet restarting together does not stampede.</p>`,
docs:[['RFC 6749 §4.4, Client Credentials','https://www.rfc-editor.org/rfc/rfc6749#section-4.4'],['oauth.net, Client Credentials','https://oauth.net/2/grant-types/client-credentials/']],
ex:{title:'Client credentials request',
prompt:`Write <code>ClientCreds</code> with: <code>static String body(String scope)</code> returning <code>"grant_type=client_credentials&amp;scope=" + java.net.URLEncoder.encode(scope, "UTF-8")</code>; and <code>static String basicAuth(String clientId, String clientSecret)</code> returning <code>"Basic " + Base64.getEncoder().encodeToString((clientId + ":" + clientSecret).getBytes())</code>. Declare <code>throws Exception</code> where needed.`,
starter:`import java.net.URLEncoder;
import java.util.Base64;

public class ClientCreds {
    static String body(String scope) throws Exception {
        return null;
    }
    static String basicAuth(String clientId, String clientSecret) {
        return null;
    }
}`,
tests:[{d:'client_credentials grant',re:'grant_type=client_credentials[^;"\']*["\'][^;"\']*?encode\\s*\\(\\s*scope\\b'},{d:'requests scopes',re:'&scope=|scope='},{d:'URL-encodes the scope',re:'URLEncoder\\.encode\\s*\\('},{d:'client authenticates with Basic',re:'"Basic "\\s*\\+'},{d:'base64 of id:secret',re:'Base64\\.getEncoder\\s*\\(\\s*\\)'}],
behavior:`body("orders:read") is "grant_type=client_credentials&scope=orders%3Aread". basicAuth("svc","secret") is "Basic c3ZjOnNlY3JldA==". No user is involved: the token represents the service itself; there is no refresh or ID token.`,
hints:['<code>return "grant_type=client_credentials&scope=" + URLEncoder.encode(scope, "UTF-8");</code>','Basic auth: base64 of <code>clientId + ":" + clientSecret</code>, prefixed with "Basic ".','Only confidential clients can do this safely; the secret must stay server-side.'],
solution:`import java.net.URLEncoder;
import java.util.Base64;

public class ClientCreds {
    static String body(String scope) throws Exception {
        return "grant_type=client_credentials&scope=" + URLEncoder.encode(scope, "UTF-8");
    }
    static String basicAuth(String clientId, String clientSecret) {
        String raw = clientId + ":" + clientSecret;
        return "Basic " + Base64.getEncoder().encodeToString(raw.getBytes());
    }
}`}},

{id:'oa5',title:'Refresh tokens & the token lifecycle',body:`
<p>Access tokens are deliberately <b>short-lived</b> (minutes) so a leaked one expires fast. But you don't want to send the user back through login every few minutes. The <b>refresh token</b> solves this: a longer-lived credential the client exchanges for a fresh access token, silently, over the back channel.</p>
<!--flow:oa5-refresh-->
<h4>Refresh token lifecycle with rotation: step by step</h4>
<div class="flowDia"><svg viewBox="0 0 620 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Refresh token lifecycle with rotation"><defs><marker id="oa5-refresh-ah-front" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent)"/></marker><marker id="oa5-refresh-ah-back" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent2)"/></marker><marker id="oa5-refresh-ah-attack" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--bad)"/></marker><marker id="oa5-refresh-ah-x" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--muted)"/></marker></defs><line x1="74" y1="42" x2="74" y2="288" class="fdLife"/><line x1="546" y1="42" x2="546" y2="288" class="fdLife"/><rect x="35" y="8" width="78" height="34" rx="8" class="fdActor"/><text x="74" y="29.5" class="fdActorT">Client</text><rect x="453" y="8" width="186" height="34" rx="8" class="fdActor"/><text x="546" y="29.5" class="fdActorT">Authorization Server</text><line x1="14" y1="86" x2="606" y2="86" class="fdPhase"/><text x="310" y="90" class="fdPhaseT">at first sign-in</text><line x1="77" y1="120" x2="541" y2="120" stroke="var(--accent2)" class="fdArrow" marker-end="url(#oa5-refresh-ah-back)"/><text x="325" y="111" class="fdLabel">authorization code grant</text><circle cx="92" cy="120" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="92" y="123.5" class="fdNumT" style="fill:var(--accent2)">1</text><line x1="543" y1="150" x2="79" y2="150" stroke="var(--accent2)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#oa5-refresh-ah-back)"/><text x="295" y="141" class="fdLabel">access token (short) + refresh token RT₁</text><circle cx="528" cy="150" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="528" y="153.5" class="fdNumT" style="fill:var(--accent2)">2</text><line x1="14" y1="176" x2="606" y2="176" class="fdPhase"/><text x="310" y="180" class="fdPhaseT">later, the access token has expired</text><line x1="77" y1="210" x2="541" y2="210" stroke="var(--accent2)" class="fdArrow" marker-end="url(#oa5-refresh-ah-back)"/><text x="325" y="201" class="fdLabel">POST /token, grant_type=refresh_token, RT₁</text><circle cx="92" cy="210" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="92" y="213.5" class="fdNumT" style="fill:var(--accent2)">3</text><line x1="543" y1="240" x2="79" y2="240" stroke="var(--accent2)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#oa5-refresh-ah-back)"/><text x="295" y="231" class="fdLabel">new access token + NEW refresh token RT₂</text><circle cx="528" cy="240" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="528" y="243.5" class="fdNumT" style="fill:var(--accent2)">4</text><rect x="302.79999999999995" y="257" width="303.2" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="462.4" y="272" class="fdSelfT">RT₁ retired, any reuse revokes the family</text><circle cx="302.79999999999995" cy="268" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="302.79999999999995" y="271.5" class="fdNumT" style="fill:var(--muted)">5</text></svg></div>
<ol class="fdSteps">
<li><b>Client → Authorization Server:</b> authorization code grant <i>(back channel)</i></li>
<li><b>Authorization Server → Client:</b> access token (short) + refresh token RT₁ <i>(back channel)</i></li>
<li><b>Client → Authorization Server:</b> POST /token, grant_type=refresh_token, RT₁ <i>(back channel)</i></li>
<li><b>Authorization Server → Client:</b> new access token + NEW refresh token RT₂ <i>(back channel)</i></li>
<li><b>Authorization Server:</b> RT₁ retired, any reuse revokes the family</li>
</ol>
<!--/flow:oa5-refresh-->
<ul>
<li><code>grant_type=refresh_token</code> with the stored <code>refresh_token</code> → a new access token (and often a new refresh token).</li>
<li><b>Refresh token rotation</b>: good AS's issue a new refresh token each time and invalidate the old one; if an attacker replays a used refresh token, the AS detects the reuse and revokes the whole chain.</li>
<li>Refresh tokens are high-value; store them securely (confidential clients: server-side; public clients: rotation + sender-constraining).</li>
</ul>
<p>The lifecycle in one line: <b>authenticate once → short access tokens for calls → refresh to renew → refresh expires or is revoked → log in again.</b></p>
<div class="codeSample" data-hl>POST /token
grant_type=refresh_token&refresh_token=STORED_REFRESH&scope=orders%3Aread
// response: a new (shorter-lived) access_token, and usually a rotated refresh_token</div>

<h4>Why refresh tokens exist at all</h4>
<p>Two goals pull in opposite directions. <b>Short access tokens</b> limit the damage from a leak: a token
that expires in five minutes is nearly worthless to a thief. <b>Not asking the user to log in every five
minutes</b> is a hard product requirement.</p>
<p>The refresh token resolves it by splitting the credential in two: a short-lived one that travels widely
(to every API you call) and a long-lived one that travels rarely and only to the authorization server. The
thing that gets exposed is the thing that expires fast.</p>

<h4>Which makes the refresh token the crown jewels</h4>
<div class="codeSample" data-hl>ACCESS TOKEN            REFRESH TOKEN
minutes                 days, weeks, sometimes indefinitely
sent to every API       sent ONLY to the authorization server
leaks broadly           should never appear in a log or a header you
                        did not control
expires into safety     mints NEW access tokens, silently, forever

// steal a refresh token and you have durable access with no login,
// no MFA prompt, and nothing in the authentication logs. it is the
// highest-value credential in an OAuth system.</div>

<h4>Rotation, and the insight behind it</h4>
<p>Rotation means each refresh token may be used <b>exactly once</b>: redeeming it returns a new access
token <i>and</i> a new refresh token, retiring the old one. On its own that is only mildly useful. The
insight is what a <b>reuse</b> means.</p>
<div class="codeSample" data-hl>normal:  RT1 -> (AT1, RT2) -> (AT2, RT3) -> ...   each used once

theft:   the attacker redeems RT2      -> gets AT2, RT3
         the real client redeems RT2   -> ALREADY USED

// the server cannot tell which party is the thief - and it does not
// need to. a reuse means SOMEONE is replaying, so the WHOLE FAMILY is
// revoked: every token descended from that original grant.
// the legitimate user is logged out too. that is the accepted trade.</div>
<p>Without rotation a stolen refresh token works quietly for as long as it lives. With it, the two parties
inevitably collide, and the collision is the alarm.</p>

<h4>The wrinkles that bite in production</h4>
<p><b>Concurrent refreshes.</b> A page firing three requests at once may refresh three times in parallel, and
naive reuse detection reads that as theft and logs the user out. Real implementations allow a short grace
window where the immediately-previous token still works, and serialize refreshes in the client.</p>
<p><b>Lost responses.</b> The client redeems a token, the response never arrives, and it now holds a dead
token with no way back. Handle that path explicitly or the session simply stops working with no error
anyone can see.</p>

<h4>The lifetimes worth thinking about</h4>
<p>There are three, and only naming two is a common mistake. <b>Access token lifetime</b> is your
revocation lag. <b>Refresh token lifetime</b> is the idle timeout: how long an inactive user stays signed
in. And the <b>absolute session lifetime</b> caps the whole grant regardless of activity, which is the one
teams forget: without it, a user who keeps refreshing stays authenticated for ever, and so does whoever
stole their refresh token.</p>
<p>Rotation is the fallback, not the goal. If the refresh token can be <b>sender-constrained</b> with DPoP
or mTLS, do that instead; a bound token cannot be replayed at all, so there is no collision to detect.
OAuth 2.1 requires one or the other for public clients precisely because a bare bearer refresh token in a
browser is the worst credential in the system.</p>`,
docs:[['RFC 6749 §6, Refreshing an Access Token','https://www.rfc-editor.org/rfc/rfc6749#section-6'],['oauth.net, Refresh Tokens','https://oauth.net/2/grant-types/refresh-token/']],
ex:{title:'Build the refresh request',
prompt:`Write <code>Refresh</code> with <code>static String body(String refreshToken, String scope)</code> returning <code>"grant_type=refresh_token"</code> then <code>&amp;refresh_token=</code> and <code>&amp;scope=</code>, each value passed through <code>java.net.URLEncoder.encode(value, "UTF-8")</code>. Declare <code>throws Exception</code>.`,
starter:`import java.net.URLEncoder;

public class Refresh {
    static String body(String refreshToken, String scope) throws Exception {
        return null;
    }
}`,
tests:[{d:'refresh_token grant',re:'grant_type=refresh_token'},{d:'sends the refresh token',re:'&refresh_token=[^;"\']*["\'][^;"\']*?encode\\s*\\(\\s*refreshToken\\b'},{d:'may narrow scope',re:'&scope='},{d:'URL-encodes values',re:'URLEncoder\\.encode\\s*\\('}],
behavior:`body("REFRESH","orders:read") is "grant_type=refresh_token&refresh_token=REFRESH&scope=orders%3Aread". The AS returns a new access token; with rotation, also a new refresh token, and the old one stops working.`,
hints:['<code>"grant_type=refresh_token"</code> then append the encoded refresh_token and scope.','You may request the same or narrower scope on refresh, never broader.','Treat the refresh token like a password; it can mint access tokens.'],
solution:`import java.net.URLEncoder;

public class Refresh {
    static String body(String refreshToken, String scope) throws Exception {
        return "grant_type=refresh_token"
                + "&refresh_token=" + URLEncoder.encode(refreshToken, "UTF-8")
                + "&scope=" + URLEncoder.encode(scope, "UTF-8");
    }
}`}},

{id:'oa6',title:'OpenID Connect: authentication on top of OAuth',body:`
<p>OAuth 2.0 is about <b>authorization</b> (access to APIs). It does <i>not</i>, by itself, tell an app <b>who the user is</b>; using an access token to identify a user is a known anti-pattern. <b>OpenID Connect (OIDC)</b> is a thin <b>authentication</b> layer on top of OAuth that adds exactly that.</p>
<!--flow:oa6-oidc-->
<h4>OpenID Connect on top of OAuth: step by step</h4>
<div class="flowDia"><svg viewBox="0 0 680 368" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="OpenID Connect on top of OAuth"><defs><marker id="oa6-oidc-ah-front" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent)"/></marker><marker id="oa6-oidc-ah-back" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent2)"/></marker><marker id="oa6-oidc-ah-attack" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--bad)"/></marker><marker id="oa6-oidc-ah-x" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--muted)"/></marker></defs><line x1="74" y1="54" x2="74" y2="336" class="fdLife"/><line x1="340" y1="54" x2="340" y2="336" class="fdLife"/><line x1="606" y1="54" x2="606" y2="336" class="fdLife"/><rect x="34.300000000000004" y="8" width="79.39999999999999" height="46" rx="8" class="fdActor"/><text x="74" y="35.5" class="fdActorT">Browser</text><rect x="283.9" y="8" width="112.19999999999999" height="46" rx="8" class="fdActor"/><text x="340" y="35.5" class="fdActorT">Client (RP)</text><rect x="533.5" y="8" width="145" height="46" rx="8" class="fdActor"/><text x="606" y="27" class="fdActorT">OpenID Provider</text><text x="606" y="42" class="fdActorS">the AS, speaking OIDC</text><line x1="343" y1="102" x2="601" y2="102" stroke="var(--accent)" class="fdArrow" marker-end="url(#oa6-oidc-ah-front)"/><text x="488" y="93" class="fdLabel">/authorize, scope=openid + nonce</text><circle cx="358" cy="102" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="358" y="105.5" class="fdNumT" style="fill:var(--accent)">1</text><rect x="521.2" y="119" width="144.8" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="601.6" y="134" class="fdSelfT">user authenticates</text><circle cx="521.2" cy="130" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="521.2" y="133.5" class="fdNumT" style="fill:var(--muted)">2</text><line x1="603" y1="168" x2="345" y2="168" stroke="var(--accent)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#oa6-oidc-ah-front)"/><text x="458" y="159" class="fdLabel">code</text><circle cx="588" cy="168" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="588" y="171.5" class="fdNumT" style="fill:var(--accent)">3</text><line x1="343" y1="198" x2="601" y2="198" stroke="var(--accent2)" class="fdArrow" marker-end="url(#oa6-oidc-ah-back)"/><text x="488" y="189" class="fdLabel">POST /token</text><circle cx="358" cy="198" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="358" y="201.5" class="fdNumT" style="fill:var(--accent2)">4</text><line x1="603" y1="228" x2="345" y2="228" stroke="var(--accent2)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#oa6-oidc-ah-back)"/><text x="458" y="219" class="fdLabel">ID token + access token</text><circle cx="588" cy="228" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="588" y="231.5" class="fdNumT" style="fill:var(--accent2)">5</text><rect x="188.4" y="245" width="303.2" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="348" y="260" class="fdSelfT">verify ID token: sig, iss, aud, exp, nonce</text><circle cx="188.4" cy="256" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="188.4" y="259.5" class="fdNumT" style="fill:var(--muted)">6</text><line x1="343" y1="294" x2="601" y2="294" stroke="var(--accent2)" class="fdArrow" marker-end="url(#oa6-oidc-ah-back)"/><text x="488" y="285" class="fdLabel">GET /userinfo, Bearer</text><circle cx="358" cy="294" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="358" y="297.5" class="fdNumT" style="fill:var(--accent2)">7</text><line x1="603" y1="324" x2="345" y2="324" stroke="var(--accent2)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#oa6-oidc-ah-back)"/><text x="458" y="315" class="fdLabel">claims (profile, email…)</text><circle cx="588" cy="324" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="588" y="327.5" class="fdNumT" style="fill:var(--accent2)">8</text><line x1="18" y1="354" x2="44" y2="354" stroke="var(--accent)" class="fdArrow"/><text x="50" y="358" class="fdLegend">front channel (via the browser)</text><line x1="271.29999999999995" y1="354" x2="297.29999999999995" y2="354" stroke="var(--accent2)" class="fdArrow"/><text x="303.29999999999995" y="358" class="fdLegend">back channel (server to server)</text></svg></div>
<ol class="fdSteps">
<li><b>Client (RP) → OpenID Provider:</b> /authorize, scope=openid + nonce <i>(front channel)</i></li>
<li><b>OpenID Provider:</b> user authenticates</li>
<li><b>OpenID Provider → Client (RP):</b> code <i>(front channel)</i></li>
<li><b>Client (RP) → OpenID Provider:</b> POST /token <i>(back channel)</i></li>
<li><b>OpenID Provider → Client (RP):</b> ID token + access token <i>(back channel)</i></li>
<li><b>Client (RP):</b> verify ID token: sig, iss, aud, exp, nonce</li>
<li><b>Client (RP) → OpenID Provider:</b> GET /userinfo: Bearer <i>(back channel)</i></li>
<li><b>OpenID Provider → Client (RP):</b> claims (profile, email…) <i>(back channel)</i></li>
</ol>
<!--/flow:oa6-oidc-->
<p>What OIDC adds:</p>
<ul>
<li><b>The <code>openid</code> scope</b>, request it and the AS (now an "OpenID Provider") returns an <b>ID token</b>.</li>
<li><b>ID token</b>: a <b>JWT</b> describing the authentication event: <code>iss</code>, <code>sub</code> (the user's stable id), <code>aud</code> (your client_id), <code>exp</code>, <code>iat</code>, and <b><code>nonce</code></b>. It is meant for the <i>client</i> (unlike the access token, which is for the API).</li>
<li><b>nonce</b>: a random value the client puts on <code>/authorize</code> and then verifies is echoed in the ID token, binding the token to this login (replay protection).</li>
<li><b>UserInfo endpoint</b>: call it with the access token to fetch profile claims (name, email) per the granted scopes (<code>profile</code>, <code>email</code>).</li>
<li><b>Discovery</b>: <code>/.well-known/openid-configuration</code> lists all endpoints and the <code>jwks_uri</code> for verifying ID tokens.</li>
</ul>
<p>Rule of thumb: <b>access token = for the API (authorization); ID token = for the client (authentication).</b> Validate the ID token like any JWT (signature + iss/aud/exp) <i>and</i> check the nonce matches.</p>
<div class="codeSample" data-hl>// request authentication by adding the openid scope (+ nonce)
scope=openid%20profile%20email &nonce=RANDOM
// then fetch profile from UserInfo with the ACCESS token
GET /userinfo    Authorization: Bearer ACCESS_TOKEN</div>

<h4>The confusion OIDC was invented to end</h4>
<p>OAuth answers "may this app access that resource?". It does not answer "who is this person?", and for
years everyone pretended it did. The pattern was: get an access token, call the provider's profile endpoint,
and treat whatever came back as the logged-in user.</p>
<p>That is broken, and the reason is worth understanding rather than memorizing. <b>An access token is a
bearer credential meant for an API.</b> It does not say who obtained it, it is not audience-restricted to
your application, and it carries no proof that it was issued in response to <i>your</i> login request. An
attacker who obtains an access token for a different app (from a malicious app the same user installed)
can present it to your profile lookup, which will happily describe that user, and you will log them in as
someone else. This is the <b>confused deputy</b> again, and it had a real name in the wild: the token
substitution attack.</p>

<h4>What OIDC adds, and why each piece is there</h4>
<div class="codeSample" data-hl>scope=openid    the switch. without it you get plain OAuth and no
                ID token. this one word is what makes it OIDC.

ID TOKEN        a JWT ABOUT THE AUTHENTICATION EVENT, audience-restricted
                to YOUR client_id. it is for the CLIENT, not for an API.
  iss  who authenticated them        aud  YOUR client_id - check this
  sub  the stable user identifier    exp  when it stops being valid
  iat  when it was issued            nonce  binds it to YOUR login
  auth_time  when they ACTUALLY authenticated (not when this was minted)
  acr / amr  how strongly, and by what means

// the two claims that fix the old attack:
//   aud   this token was minted FOR YOU. another app's cannot be reused.
//   nonce YOU generated it, YOU stored it, and it must come back. a
//         replayed token from an earlier session fails.</div>

<h4>The rule to carry away</h4>
<p><b>Access token = for the API, about authorization. ID token = for the client, about authentication.</b>
Sending an ID token to an API is a category error the API should reject. Using an access token to decide who
the user is reintroduces the attack OIDC exists to prevent.</p>

<h4>Discovery, and why it matters more than it looks</h4>
<p><code>/.well-known/openid-configuration</code> publishes every endpoint, the supported algorithms, and
the <code>jwks_uri</code>. A client configured with just an issuer URL fetches the rest, which means key
rotation is a non-event, because the client re-fetches the JWKS when it sees an unfamiliar <code>kid</code>.
Hard-coding endpoints and keys is how an integration breaks on the day the provider rotates.</p>

<h4>UserInfo, and choosing where claims come from</h4>
<p>The <b>UserInfo endpoint</b> returns profile claims for the access token presented. You now have two
sources for a user's name and email, and they differ in a way worth deciding deliberately: claims in the ID
token are a <b>snapshot at login</b> and cost nothing to read; UserInfo is <b>current</b> and costs a
request. Put identity essentials in the token, fetch mutable profile data when you actually need it, and do
not put large or sensitive attributes in a token that travels everywhere.</p>

<h4>What to validate, in order</h4>
<p>Signature against the JWKS; <code>iss</code> exactly matching the configured issuer; <code>aud</code>
containing your <code>client_id</code>; <code>exp</code> and <code>iat</code> within tolerance; and the
<code>nonce</code> equal to the one you stored for this login. Skipping the last two is how replay becomes
possible, and skipping <code>aud</code> is how you accept another application's token.</p>`,
docs:[['OpenID Connect Core','https://openid.net/specs/openid-connect-core-1_0.html'],['OIDC Discovery','https://openid.net/specs/openid-connect-discovery-1_0.html']],
ex:{title:'Validate an ID token + call UserInfo',
prompt:`Write <code>Oidc</code> with: <code>static boolean idTokenOk(String aud, String nonce, long expEpoch, String expectedAud, String expectedNonce, long now)</code> returning true only if <code>expectedAud.equals(aud)</code>, <code>expectedNonce.equals(nonce)</code>, and <code>expEpoch &gt; now</code>; and <code>static String userInfo(String accessToken)</code> returning the Authorization header value <code>"Bearer " + accessToken</code> used to call the UserInfo endpoint.`,
starter:`public class Oidc {
    static boolean idTokenOk(String aud, String nonce, long expEpoch,
                             String expectedAud, String expectedNonce, long now) {
        return false;
    }
    static String userInfo(String accessToken) {
        return null;
    }
}`,
tests:[{d:'checks the audience (client_id)',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:expectedAud\\s*\\.\\s*equals\\s*\\(\\s*aud\\s*\\)))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:expectedAud\\s*\\.\\s*equals\\s*\\(\\s*aud\\s*\\))[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:expectedAud\\s*\\.\\s*equals\\s*\\(\\s*aud\\s*\\))[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:expectedAud\\s*\\.\\s*equals\\s*\\(\\s*aud\\s*\\))[^{]*?return\\s+\\k<av>\\b)'},{d:'checks the nonce (replay protection)',re:'expectedNonce\\s*\\.\\s*equals\\s*\\(\\s*nonce\\s*\\)'},{d:'checks expiry',re:'expEpoch\\s*>\\s*now|now\\s*<\\s*expEpoch'},{d:'UserInfo uses the access token as Bearer',re:'"Bearer "\\s*\\+\\s*accessToken'}],
behavior:`idTokenOk passes only when the ID token is for this client (aud), carries the nonce from this login, and is unexpired. userInfo("AT") returns "Bearer AT"; note the ID token authenticates the user, while the access token is what calls the API/UserInfo.`,
hints:['Combine the three checks: <code>expectedAud.equals(aud) &amp;&amp; expectedNonce.equals(nonce) &amp;&amp; expEpoch &gt; now</code>.','The nonce check binds the ID token to the exact login request the client started.','UserInfo is called with the ACCESS token, not the ID token.'],
solution:`public class Oidc {
    static boolean idTokenOk(String aud, String nonce, long expEpoch,
                             String expectedAud, String expectedNonce, long now) {
        return expectedAud.equals(aud) && expectedNonce.equals(nonce) && expEpoch > now;
    }
    static String userInfo(String accessToken) {
        return "Bearer " + accessToken;
    }
}`}},

{id:'oadisc',title:'Discovery: metadata, JWKS, and why endpoints are never hardcoded',body:`
<p>Every flow so far has said "the client sends the code to the token endpoint" without saying how the
client <i>knows</i> where that is. The naive answer (paste the URLs into a config file) is how a
provider migration turns into an outage, and how a key rotation turns into every login failing at once.
The protocol's answer is a <b>metadata document</b>: one signed-by-TLS JSON file, published at a
well-known path, that tells a client everything it needs to talk to this authorization server.</p>
<!--flow:oadisc-discovery-->
<h4>OIDC discovery and JWKS fetch: step by step</h4>
<div class="flowDia"><svg viewBox="0 0 600 264" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="OIDC discovery and JWKS fetch"><defs><marker id="oadisc-discovery-ah-front" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent)"/></marker><marker id="oadisc-discovery-ah-back" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent2)"/></marker><marker id="oadisc-discovery-ah-attack" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--bad)"/></marker><marker id="oadisc-discovery-ah-x" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--muted)"/></marker></defs><line x1="74" y1="42" x2="74" y2="252" class="fdLife"/><line x1="526" y1="42" x2="526" y2="252" class="fdLife"/><rect x="-6.699999999999989" y="8" width="161.39999999999998" height="34" rx="8" class="fdActor"/><text x="74" y="29.5" class="fdActorT">Client / verifier</text><rect x="433" y="8" width="186" height="34" rx="8" class="fdActor"/><text x="526" y="29.5" class="fdActorT">Authorization Server</text><line x1="77" y1="90" x2="521" y2="90" stroke="var(--accent2)" class="fdArrow" marker-end="url(#oadisc-discovery-ah-back)"/><text x="315" y="81" class="fdLabel">GET /.well-known/openid-configuration</text><circle cx="92" cy="90" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="92" y="93.5" class="fdNumT" style="fill:var(--accent2)">1</text><line x1="523" y1="120" x2="79" y2="120" stroke="var(--accent2)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#oadisc-discovery-ah-back)"/><text x="285" y="111" class="fdLabel">endpoints, jwks_uri, supported algs</text><circle cx="508" cy="120" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="508" y="123.5" class="fdNumT" style="fill:var(--accent2)">2</text><line x1="77" y1="150" x2="521" y2="150" stroke="var(--accent2)" class="fdArrow" marker-end="url(#oadisc-discovery-ah-back)"/><text x="315" y="141" class="fdLabel">GET jwks_uri</text><circle cx="92" cy="150" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="92" y="153.5" class="fdNumT" style="fill:var(--accent2)">3</text><line x1="523" y1="180" x2="79" y2="180" stroke="var(--accent2)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#oadisc-discovery-ah-back)"/><text x="285" y="171" class="fdLabel">public keys, each with a kid</text><circle cx="508" cy="180" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="508" y="183.5" class="fdNumT" style="fill:var(--accent2)">4</text><rect x="14" y="197" width="270.2" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="157.1" y="212" class="fdSelfT">cache keys; refetch on an unknown kid</text><circle cx="14" cy="208" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="14" y="211.5" class="fdNumT" style="fill:var(--muted)">5</text><text x="300" y="234" class="fdNote">Nothing is hardcoded: keys and endpoints can rotate under you.</text></svg></div>
<ol class="fdSteps">
<li><b>Client / verifier → Authorization Server:</b> GET /.well-known/openid-configuration <i>(back channel)</i></li>
<li><b>Authorization Server → Client / verifier:</b> endpoints, jwks_uri, supported algs <i>(back channel)</i></li>
<li><b>Client / verifier → Authorization Server:</b> GET jwks_uri <i>(back channel)</i></li>
<li><b>Authorization Server → Client / verifier:</b> public keys, each with a kid <i>(back channel)</i></li>
<li><b>Client / verifier:</b> cache keys; refetch on an unknown kid</li>
</ol>
<!--/flow:oadisc-discovery-->

<h4>Two well-known paths, one idea</h4>
<p>OpenID Connect Discovery publishes <code>/.well-known/openid-configuration</code>; OAuth 2.0
Authorization Server Metadata (RFC 8414) publishes <code>/.well-known/oauth-authorization-server</code>.
The contents overlap heavily (endpoints, supported algorithms, supported scopes, the JWKS location):</p>
<div class="codeSample" data-hl>GET https://id.example.com/.well-known/openid-configuration

{ "issuer":                 "https://id.example.com",
  "authorization_endpoint": "https://id.example.com/authorize",
  "token_endpoint":         "https://id.example.com/token",
  "jwks_uri":               "https://id.example.com/.well-known/jwks.json",
  "id_token_signing_alg_values_supported": ["ES256","RS256"],
  "token_endpoint_auth_methods_supported": ["private_key_jwt","client_secret_basic"] }</div>
<p>One path detail catches people out: OIDC <b>appends</b> the well-known segment to the issuer, while
RFC 8414 <b>inserts</b> it before the issuer's path. For an issuer of
<code>https://id.example.com/tenant-a</code> those give different URLs, which is exactly the sort of thing
that works in single-tenant testing and breaks the day you go multi-tenant.</p>

<h4>The issuer is the identity of the server, and it must match exactly</h4>
<p>The single most important validation in this lesson: <b>the <code>issuer</code> value inside the
document must be identical, character for character, to the issuer you resolved it from</b>, and later,
to the <code>iss</code> claim of every token you accept from it. Not "the same host". Not "equal after
normalizing the trailing slash". Identical.</p>
<p>Without that check, an attacker who can get your client to fetch metadata from a URL of their choosing
supplies their own authorize and token endpoints, and your client walks the entire flow against a server
the attacker controls. This is the <b>IdP mix-up</b> family of attacks, and exact issuer comparison is the
defense that makes it structurally impossible rather than merely unlikely.</p>

<h4>JWKS: fetch, cache, and key by kid</h4>
<p><code>jwks_uri</code> is where the signing public keys live. The discipline is small and rigid:</p>
<ul>
<li><b>Cache the key set</b>: never fetch it per request. A verifier that fetches on every token turns
your identity provider into your own denial-of-service target, and its availability into yours.</li>
<li><b>Select by <code>kid</code></b>, the key id in the token header. On an unknown <code>kid</code>,
refresh once, rate-limited, and fail if it is still unknown. That single behavior is what makes key
rotation invisible to users.</li>
<li><b>Never follow a URL from the token itself.</b> A <code>jku</code> or <code>x5u</code> header naming
where to find the key is an attacker telling you which key to trust. Keys come from metadata you resolved
from the issuer, full stop.</li>
</ul>
<p>Cache lifetime is a security parameter, not a performance knob: too long and a rotated-away key stays
trusted, too short and every restart stampedes the provider. Minutes, with a jittered refresh, is the
usual answer.</p>

<h4>What to validate before you trust a document</h4>
<p>Metadata arrives over TLS and is trusted on that basis, so the checks are about consistency rather than
signatures. The issuer must match exactly. Every endpoint must be <code>https</code>, on a host you
expect. The algorithms offered must intersect with the ones your policy permits, and the decision uses
<i>your</i> list, never theirs. A provider advertising <code>HS256</code> does not make it acceptable
to you.</p>
<p>Then cache the document with its own TTL and re-resolve periodically. Endpoints do move. That is the
entire point of not hardcoding them.</p>`,
docs:[['OpenID Connect Discovery 1.0','https://openid.net/specs/openid-connect-discovery-1_0.html'],['RFC 8414, OAuth 2.0 Authorization Server Metadata','https://www.rfc-editor.org/rfc/rfc8414'],['RFC 9207, the iss parameter and mix-up defense','https://www.rfc-editor.org/rfc/rfc9207']],
ex:{title:'Accept a metadata document',lang:'js',
run:{call:'acceptMetadata',cases:[{name:'exact issuer match over https',args:['https://id.example.com','https://id.example.com','https://id.example.com/token'],expect:true},{name:'issuer points somewhere else, the mix-up attack',args:['https://id.example.com','https://evil.example.com','https://evil.example.com/token'],expect:false},{name:'trailing slash makes it a different issuer',args:['https://id.example.com','https://id.example.com/','https://id.example.com/token'],expect:false},{name:'a plaintext token endpoint is never acceptable',args:['https://id.example.com','https://id.example.com','http://id.example.com/token'],expect:false},{name:'a missing issuer field is not a pass',args:['https://id.example.com',null,'https://id.example.com/token'],expect:false}]},
prompt:`Write <code>function acceptMetadata(fetchedFromIssuer, metadataIssuer, tokenEndpoint)</code> returning <code>true</code> only when the document's <code>issuer</code> is <b>identical</b> to the issuer it was resolved from, and the token endpoint is an <code>https://</code> URL. Any missing value is a rejection. Do not normalize, trim or lowercase anything; exact comparison is the security property.`,
starter:`function acceptMetadata(fetchedFromIssuer, metadataIssuer, tokenEndpoint) {
  return false;
}`,
solution:`function acceptMetadata(fetchedFromIssuer, metadataIssuer, tokenEndpoint) {
  if (!fetchedFromIssuer || !metadataIssuer || !tokenEndpoint) return false;
  // exact string equality, this is the mix-up defence
  if (metadataIssuer !== fetchedFromIssuer) return false;
  return tokenEndpoint.startsWith("https://");
}`,
tests:[{d:'missing values are rejected',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:!fetchedFromIssuer|== *null|!metadataIssuer))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:!fetchedFromIssuer|== *null|!metadataIssuer)[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:!fetchedFromIssuer|== *null|!metadataIssuer)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:!fetchedFromIssuer|== *null|!metadataIssuer)[^{]*?return\\s+\\k<av>\\b)'},{d:'the issuer is compared exactly',re:'(?:if\\s*\\(\\s*[^;{]*(?:metadataIssuer\\s*!==\\s*fetchedFromIssuer|fetchedFromIssuer\\s*!==\\s*metadataIssuer|metadataIssuer\\s*===\\s*fetchedFromIssuer)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:return\\s+(?!\\s*!)[^;{]*(?:metadataIssuer\\s*!==\\s*fetchedFromIssuer|fetchedFromIssuer\\s*!==\\s*metadataIssuer|metadataIssuer\\s*===\\s*fetchedFromIssuer))|(?:(?<h1>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:metadataIssuer\\s*!==\\s*fetchedFromIssuer|fetchedFromIssuer\\s*!==\\s*metadataIssuer|metadataIssuer\\s*===\\s*fetchedFromIssuer)[^{]*?return\\s+\\k<h1>\\b)'},{d:'the token endpoint must be https',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:startsWith\\s*\\(\\s*["\\x27]https://|https://))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:startsWith\\s*\\(\\s*["\\x27]https://|https://)[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:startsWith\\s*\\(\\s*["\\x27]https://|https://)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:startsWith\\s*\\(\\s*["\\x27]https://|https://)[^{]*?return\\s+\\k<av>\\b)'},{d:'no normalization is applied',re:'^(?!.*toLowerCase)',flags:'s'}],
behavior:`All five cases run for real. The trailing-slash case is the one worth staring at: https://id.example.com/ is a different issuer from https://id.example.com, and a verifier that "helpfully" normalizes them has quietly accepted that two distinct issuer strings are the same server, which is the assumption the mix-up attack needs. The evil-issuer case is the attack in its plainest form: fetch metadata from a URL the attacker influenced, and every endpoint in the flow is theirs. The http case fails because a plaintext token endpoint means the code and client secret cross the network in the clear.`,
hints:['Reject anything missing first; a null issuer must never pass.','Compare with !== on the raw strings. Resist the urge to trim or lowercase.','The endpoint check is a prefix test on the string.']}},

{id:'oa7',title:'Device flow & the legacy grants',body:`
<p>Two more flows round out the picture: one modern, two you should <b>recognize but avoid</b>.</p>
<!--flow:oa7-device-->
<h4>Device Authorization flow: step by step</h4>
<div class="flowDia"><svg viewBox="0 0 700 302" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Device Authorization flow"><defs><marker id="oa7-device-ah-front" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent)"/></marker><marker id="oa7-device-ah-back" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent2)"/></marker><marker id="oa7-device-ah-attack" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--bad)"/></marker><marker id="oa7-device-ah-x" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--muted)"/></marker></defs><line x1="74" y1="54" x2="74" y2="270" class="fdLife"/><line x1="350" y1="54" x2="350" y2="270" class="fdLife"/><line x1="626" y1="54" x2="626" y2="270" class="fdLife"/><rect x="30.200000000000003" y="8" width="87.6" height="46" rx="8" class="fdActor"/><text x="74" y="27" class="fdActorT">TV / CLI</text><text x="74" y="42" class="fdActorS">no keyboard, no browser</text><rect x="257" y="8" width="186" height="46" rx="8" class="fdActor"/><text x="350" y="35.5" class="fdActorT">Authorization Server</text><rect x="565.8" y="8" width="120.39999999999999" height="46" rx="8" class="fdActor"/><text x="626" y="35.5" class="fdActorT">User’s phone</text><line x1="77" y1="102" x2="345" y2="102" stroke="var(--accent2)" class="fdArrow" marker-end="url(#oa7-device-ah-back)"/><text x="227" y="93" class="fdLabel">POST /device_authorization</text><circle cx="92" cy="102" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="92" y="105.5" class="fdNumT" style="fill:var(--accent2)">1</text><line x1="347" y1="132" x2="79" y2="132" stroke="var(--accent2)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#oa7-device-ah-back)"/><text x="197" y="123" class="fdLabel">device_code + user_code + verification_uri</text><circle cx="332" cy="132" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="332" y="135.5" class="fdNumT" style="fill:var(--accent2)">2</text><rect x="14" y="149" width="177.79999999999998" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="110.89999999999999" y="164" class="fdSelfT">shows the code and a QR</text><circle cx="14" cy="160" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="14" y="163.5" class="fdNumT" style="fill:var(--muted)">3</text><line x1="623" y1="198" x2="355" y2="198" stroke="var(--accent)" class="fdArrow" marker-end="url(#oa7-device-ah-front)"/><text x="473" y="189" class="fdLabel">user opens URI, types code, logs in</text><circle cx="608" cy="198" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="608" y="201.5" class="fdNumT" style="fill:var(--accent)">4</text><line x1="77" y1="228" x2="345" y2="228" stroke="var(--accent2)" class="fdArrow" marker-end="url(#oa7-device-ah-back)"/><text x="227" y="219" class="fdLabel">polls /token with device_code</text><circle cx="92" cy="228" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="92" y="231.5" class="fdNumT" style="fill:var(--accent2)">5</text><line x1="347" y1="258" x2="79" y2="258" stroke="var(--accent2)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#oa7-device-ah-back)"/><text x="197" y="249" class="fdLabel">…authorization_pending… then tokens</text><circle cx="332" cy="258" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="332" y="261.5" class="fdNumT" style="fill:var(--accent2)">6</text><line x1="18" y1="288" x2="44" y2="288" stroke="var(--accent2)" class="fdArrow"/><text x="50" y="292" class="fdLegend">back channel (server to server)</text><line x1="271.29999999999995" y1="288" x2="297.29999999999995" y2="288" stroke="var(--accent)" class="fdArrow"/><text x="303.29999999999995" y="292" class="fdLegend">front channel (via the browser)</text></svg></div>
<ol class="fdSteps">
<li><b>TV / CLI → Authorization Server:</b> POST /device_authorization <i>(back channel)</i></li>
<li><b>Authorization Server → TV / CLI:</b> device_code + user_code + verification_uri <i>(back channel)</i></li>
<li><b>TV / CLI:</b> shows the code and a QR</li>
<li><b>User’s phone → Authorization Server:</b> user opens URI, types code, logs in <i>(front channel)</i></li>
<li><b>TV / CLI → Authorization Server:</b> polls /token with device_code <i>(back channel)</i></li>
<li><b>Authorization Server → TV / CLI:</b> …authorization_pending… then tokens <i>(back channel)</i></li>
</ol>
<!--/flow:oa7-device-->
<p><b>Device Authorization Flow</b> (for input-constrained devices: TVs, CLIs, IoT). The device can't show a browser/keyboard well, so:</p>
<ul>
<li>The device asks the AS <code>/device_authorization</code> and gets a <b>user_code</b> and a <b>verification_uri</b>.</li>
<li>It shows "go to example.com/activate and enter WXYZ-1234" while it <b>polls</b> <code>/token</code> with <code>grant_type=urn:ietf:params:oauth:grant-type:device_code</code>.</li>
<li>The user authorizes on their phone; the next poll returns tokens. While waiting, the AS answers <code>authorization_pending</code> (keep polling) or <code>slow_down</code>.</li>
</ul>
<p><b>Legacy grants, do not use in new systems:</b></p>
<ul>
<li><b>Implicit</b> (<code>response_type=token</code>), returned the access token directly in the browser URL (front channel). Deprecated: tokens leak via history/referrer. Replaced by <b>Authorization Code + PKCE</b>.</li>
<li><b>Resource Owner Password Credentials (ROPC)</b> (<code>grant_type=password</code>), the app collects the user's actual username/password and sends them to the AS. This defeats the whole point of OAuth (the app sees the password) and breaks SSO/MFA. Deprecated.</li>
</ul>
<p>Modern guidance (OAuth 2.1 / Security BCP): use <b>Authorization Code + PKCE</b> for user flows, <b>Client Credentials</b> for machine-to-machine, and <b>Device</b> for constrained devices. Avoid Implicit and ROPC.</p>
<div class="codeSample" data-hl>// device flow polls the token endpoint with the device_code grant
grant_type=urn:ietf:params:oauth:grant-type:device_code&device_code=DEV_CODE&client_id=tvapp
// AS replies authorization_pending until the user approves on another screen</div>

<h4>The problem the device flow solves</h4>
<p>You are setting up a television. It has no keyboard worth using, no browser you would want to log in
with, and typing a password on a remote control is miserable. But you have a phone in your hand.</p>
<p>The device flow splits authentication across <b>two devices</b>: the constrained one shows a short code,
and the authentication happens somewhere comfortable. Nothing secret is ever typed on the television.</p>
<div class="codeSample" data-hl>1. TV -> AS   POST /device_authorization  (client_id, scope)
2. AS -> TV   { device_code, user_code: "WDJB-MJHT",
                verification_uri: "https://example.com/activate",
                interval: 5, expires_in: 600 }
3. TV shows   "go to example.com/activate and enter WDJB-MJHT"
4. the human  opens that on a PHONE, signs in, approves
5. TV polls   POST /token  grant_type=...:device_code&device_code=...
                 authorization_pending  -> keep waiting
                 slow_down              -> increase the interval
                 access_denied          -> the user said no. STOP.
                 expired_token          -> too slow. STOP.
                 200 + tokens           -> done

// two errors mean STOP and two mean CONTINUE. a client that polls
// through access_denied is both wrong and abusive.</div>

<h4>The attack it invites</h4>
<p>Device flow has a phishing variant worth knowing: an attacker starts a device flow for <i>their</i>
client, then sends the victim the legitimate <code>verification_uri</code> and code: "enter this code to
finish setting up your account". The victim authenticates on a genuine page and approves, and the tokens go
to the attacker's device.</p>
<p>The mitigations are all about making the consent screen say what is really happening: show <b>what is being authorized and
which device is asking</b>, keep the code short-lived, and require the user to type the code rather than
following a pre-filled link. Restricting which clients may use the grant at all is the strongest
control.</p>

<h4>The two grants to recognize and never write</h4>
<p><b>Implicit</b> (<code>response_type=token</code>) returned the access token directly in the URL
fragment. That put a credential in browser history, in the Referer header, and in any script on the page,
and it existed only because browsers once could not make cross-origin token requests. CORS solved that, so
the reason is gone. Authorization Code with PKCE replaces it entirely.</p>
<p><b>ROPC</b> (<code>grant_type=password</code>) has the application collect the user's actual username and
password and send them to the authorization server. It defeats the entire point of OAuth: the app sees the
password, so there is no delegation, no consent screen, no MFA, no SSO, and no federation. Every one of
those is a capability you lose.</p>
<div class="codeSample" data-hl>// both are REMOVED in OAuth 2.1. if you meet one:
implicit  -> Authorization Code + PKCE. always. no exceptions.
ROPC      -> Authorization Code + PKCE, in a system browser or a
             web view you do not control the DOM of.

// the usual defense of ROPC is "it is our own first-party app, so
// the password is safe with us". it still blocks MFA and SSO, still
// trains users to type their password into app UIs, and still cannot
// federate. it is a dead end you have to migrate off later.</div>

<h4>The modern guidance, in one line</h4>
<p>Authorization Code with PKCE for anything with a user, Client Credentials for machine-to-machine, Device
Authorization for input-constrained hardware, and Token Exchange when a user's identity must survive a hop.
Everything else is either one of those in disguise or something you should stop doing.</p>`,
docs:[['RFC 8628 (Device Authorization Grant)','https://www.rfc-editor.org/rfc/rfc8628'],['OAuth 2.0 Security BCP (RFC 9700)','https://www.rfc-editor.org/rfc/rfc9700'],['Why the Implicit flow is deprecated','https://oauth.net/2/grant-types/implicit/']],
ex:{title:'Poll the token endpoint (device flow)',
prompt:`Write <code>DeviceFlow</code> with: <code>static String pollBody(String deviceCode, String clientId)</code> returning <code>"grant_type=urn:ietf:params:oauth:grant-type:device_code"</code> then <code>&amp;device_code=</code> and <code>&amp;client_id=</code>, each value <code>java.net.URLEncoder.encode(value, "UTF-8")</code>; and <code>static boolean keepPolling(String error)</code> returning true when <code>error</code> is <code>"authorization_pending"</code> or <code>"slow_down"</code> (the device should keep polling). Declare <code>throws Exception</code>.`,
starter:`import java.net.URLEncoder;

public class DeviceFlow {
    static String pollBody(String deviceCode, String clientId) throws Exception {
        return null;
    }
    static boolean keepPolling(String error) {
        return false;
    }
}`,
tests:[{d:'uses the device_code grant URN',re:'grant_type=urn:ietf:params:oauth:grant-type:device_code'},{d:'sends the device_code',re:'&device_code=[^;"\']*["\'][^;"\']*?encode\\s*\\(\\s*deviceCode\\b'},{d:'sends the client_id',re:'&client_id='},{d:'keeps polling while pending',re:'"authorization_pending"\\s*\\.\\s*equals|equals\\s*\\(\\s*"authorization_pending"'},{d:'also handles slow_down',re:'"slow_down"'}],
behavior:`pollBody("DEV","tvapp") is "grant_type=urn:ietf:params:oauth:grant-type:device_code&device_code=DEV&client_id=tvapp". keepPolling("authorization_pending") and keepPolling("slow_down") are true; keepPolling("access_denied") is false (stop). This is the modern flow for TVs/CLIs; Implicit and ROPC are deprecated.`,
hints:['The grant type is a URN string; include it verbatim.','<code>return "authorization_pending".equals(error) || "slow_down".equals(error);</code>','On any other error (expired_token, access_denied) stop polling.'],
solution:`import java.net.URLEncoder;

public class DeviceFlow {
    static String pollBody(String deviceCode, String clientId) throws Exception {
        return "grant_type=urn:ietf:params:oauth:grant-type:device_code"
                + "&device_code=" + URLEncoder.encode(deviceCode, "UTF-8")
                + "&client_id=" + URLEncoder.encode(clientId, "UTF-8");
    }
    static boolean keepPolling(String error) {
        return "authorization_pending".equals(error) || "slow_down".equals(error);
    }
}`}},

{id:'oa8',title:'Native & mobile apps',body:`
<p>Phone and desktop apps are <b>public clients</b>: the binary ships to users, so it can't hold a secret. The correct, secure flow is <b>Authorization Code + PKCE</b>, opened in the device's <b>system browser</b>, never an embedded WebView.</p>
<p><b>Why the system browser (not a WebView)?</b> A WebView is controlled by the app, so it can read the user's password, defeats SSO (no shared cookies), and blocks passkeys/security keys. The system browser keeps the credentials away from the app and reuses the device's login session for true SSO.</p>
<p><b>Getting the redirect back into the app</b>: three options, best last:</p>
<ul>
<li><b>Custom URI scheme</b> (<code>com.example.app:/callback</code>), simple, but another app can register the same scheme and hijack the code. Always pair with PKCE.</li>
<li><b>Loopback</b> (<code>http://127.0.0.1:PORT</code>), for desktop apps; the app runs a tiny local listener.</li>
<li><b>Claimed HTTPS redirect</b>: iOS <b>Universal Links</b> / Android <b>App Links</b>: a real <code>https://</code> URL your domain proves it owns, which the OS routes straight to your app. <b>Not hijackable; preferred.</b></li>
</ul>
<div class="codeSample">Native app, Authorization Code + PKCE in the system browser
 1. App makes a PKCE verifier + challenge, opens the SYSTEM BROWSER at /authorize
 2. User authenticates &amp; consents at the Authorization Server  (SSO &amp; passkeys work)
 3. Auth Server redirects to the app's claimed redirect (https App/Universal Link)
 4. The OS hands the redirect (with ?code) to YOUR app, not to any other app
 5. App POSTs code + code_verifier to /token   (no client secret, it is public)
 6. App gets access + refresh + id tokens; stores the refresh token in Keychain/Keystore
 7. App calls APIs with the Bearer access token; refreshes silently when it expires</div>
<p>Use a vetted library (<b>AppAuth</b> for iOS/Android) rather than hand-rolling. Store refresh tokens in the platform secure store (Keychain / Keystore), keep access tokens short, and consider sender-constraining (DPoP) since mobile tokens live on devices you don't control.</p>

<h4>Why a custom scheme is weaker than it looks</h4>
<p>Nothing stops a second application on the device from registering <code>com.example.app:/callback</code>. On some platforms the resolution of a collision is undefined; on others it goes to whichever app registered most recently. A malicious app that wins the race receives the authorization code that was meant for you. PKCE is what makes that theft useless: the attacker has the code but not the verifier, so the exchange fails, which is precisely why PKCE is mandatory for native clients rather than advisory.</p>
<p>Claimed HTTPS links close the hole entirely: the operating system verifies your domain's ownership through a file served over TLS at a well-known path, so no other app can claim the URL. The cost is real setup (hosting the association file, matching bundle identifiers and signing fingerprints), which is why so many apps ship the weaker option and rely on PKCE alone.</p>

<h4>Where the tokens live on a device</h4>
<p>The platform secure store (Keychain on iOS, Keystore-backed storage on Android) is the only acceptable place for a refresh token, and it is worth knowing what it does and does not protect. It protects against another app reading the value and, with the right flags, against extraction from a backup or from a device that is merely stolen and locked. It does not protect against a compromised or rooted device, and it does not stop the token being used by malware running inside your own app's process.</p>
<p>That residual risk is what <b>sender-constrained tokens</b> address: with DPoP or mTLS binding, a stolen refresh token cannot be used without the private key it is bound to, and on modern devices that key can be generated inside hardware and made non-exportable. Combine it with refresh token rotation and reuse detection and a theft becomes detectable as well as difficult.</p>

<h4>Practical rules for shipping</h4>
<ul>
<li><b>Use AppAuth</b> or the platform's own authentication session API rather than opening a browser by hand: the details of ephemeral sessions, cancellation and interception are easy to get subtly wrong.</li>
<li><b>Never embed a client secret</b> in the binary. It is extractable in minutes, and a secret every user holds is not a secret.</li>
<li><b>Handle the cancel path.</b> Users dismiss the browser; an app that hangs on a pending authorization looks broken.</li>
<li><b>Log out means revoke.</b> Deleting the token locally leaves it valid at the authorization server, so call the revocation endpoint as well.</li>
</ul>`,
docs:[['RFC 8252 (OAuth for Native Apps)','https://www.rfc-editor.org/rfc/rfc8252'],['AppAuth','https://appauth.io/'],['Apple Universal Links','https://developer.apple.com/ios/universal-links/'],['Android App Links','https://developer.android.com/training/app-links']],
ex:{title:'Build a mobile authorize URL (public client + PKCE)',
prompt:`Write <code>MobileAuthorize</code> with <code>static String build(String base, String clientId, String appLinkRedirect, String scope, String state, String codeChallenge)</code> returning the <code>/authorize</code> URL for a native app: <code>response_type=code</code>, then URL-encoded <code>client_id</code>, <code>redirect_uri</code> (the App/Universal Link), <code>scope</code>, <code>state</code>, and <code>code_challenge</code>, plus <code>code_challenge_method=S256</code>. <b>Do not include a client_secret</b>: a mobile app is a public client. Declare <code>throws Exception</code>.`,
starter:`import java.net.URLEncoder;

public class MobileAuthorize {
    static String build(String base, String clientId, String appLinkRedirect, String scope, String state, String codeChallenge) throws Exception {
        return null;
    }
}`,
tests:[{d:'authorization code flow',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:response_type=code))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:response_type=code)[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:response_type=code)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:response_type=code)[^{]*?return\\s+\\k<av>\\b)'},{d:'uses the app-link redirect',re:'&redirect_uri=[^;"\']*["\'][^;"\']*?encode\\s*\\(\\s*appLinkRedirect\\b'},{d:'sends the PKCE challenge',re:'&code_challenge='},{d:'declares S256',re:'code_challenge_method=S256'},{d:'no client secret (public client)',re:'client_secret',not:true},{d:'URL-encodes values',re:'URLEncoder\\.encode\\s*\\('}],
behavior:`build(...) returns "…?response_type=code&client_id=…&redirect_uri=…&scope=…&state=…&code_challenge=…&code_challenge_method=S256" with no client_secret anywhere. This is opened in the system browser; PKCE is what secures the public client, and the App Link redirect is what stops another app from stealing the code.`,
hints:['Same shape as the web /authorize URL, plus <code>&code_challenge=</code> and <code>&code_challenge_method=S256</code>.','A native app is a PUBLIC client: never put a secret in it; PKCE replaces the secret.','The redirect should be a claimed https App/Universal Link so only your app receives the code.'],
solution:`import java.net.URLEncoder;

public class MobileAuthorize {
    static String build(String base, String clientId, String appLinkRedirect, String scope, String state, String codeChallenge) throws Exception {
        return base + "?response_type=code"
                + "&client_id=" + URLEncoder.encode(clientId, "UTF-8")
                + "&redirect_uri=" + URLEncoder.encode(appLinkRedirect, "UTF-8")
                + "&scope=" + URLEncoder.encode(scope, "UTF-8")
                + "&state=" + URLEncoder.encode(state, "UTF-8")
                + "&code_challenge=" + URLEncoder.encode(codeChallenge, "UTF-8")
                + "&code_challenge_method=S256";
    }
}`}},

{id:'oa11',title:'OAuth 2.1: what the revision removes and mandates',body:`
<p>OAuth 2.0 is from 2012, and the years since produced a long trail of security advice scattered across
extension RFCs, best-current-practice drafts and errata. <b>OAuth 2.1</b> is the consolidation: it does
not invent anything, it <i>folds the accumulated guidance into the base specification</i> and deletes
the parts the community stopped recommending.</p>
<p>That framing matters. If you have been following the Security BCP, you are already writing OAuth 2.1.
The value of the revision is that the safe path becomes the <i>default</i> path, rather than something
you had to know to look for.</p>

<h4>What is removed</h4>
<ul>
<li><b>The Implicit grant</b> (<code>response_type=token</code>). It returned an access token directly
in the URL fragment, so the token passed through browser history, referrer headers and any script on the
page, and there was no way to authenticate the client. Authorization Code with PKCE does the same job
without any of that.</li>
<li><b>The Resource Owner Password Credentials grant</b> (ROPC). The app collects the user's password
and posts it to the token endpoint: credential forwarding, with everything that implies. It cannot
support MFA, passkeys or federation, and it teaches users to type their password into applications.</li>
<li><b>Bearer tokens in query strings.</b> Tokens must travel in the <code>Authorization</code> header,
not <code>?access_token=</code>, for the reasons that apply to any credential in a URL: logs, history,
referrers.</li>
</ul>

<h4>What becomes mandatory</h4>
<ul>
<li><b>PKCE for every authorization code request</b>: not just public clients. Confidential clients
benefit too, because PKCE defends against code interception and injection, which a client secret does
not address at all. This is the single biggest change in practice.</li>
<li><b>Exact string matching on redirect URIs.</b> No wildcards, no prefix matching, no "starts with."
Loose redirect matching is one of the most reliable ways to steal an authorization code.</li>
<li><b>Refresh tokens must be sender-constrained or rotated.</b> A long-lived bearer refresh token in a
public client is the highest-value credential in the system, so it must either be bound to a key (DPoP
or mTLS) or rotated on every use with reuse detection.</li>
</ul>
<div class="codeSample" data-hl>OAuth 2.0 (as commonly deployed)      OAuth 2.1
  implicit grant available            removed
  ROPC available                      removed
  PKCE optional, "for mobile"         REQUIRED for all authorization code flows
  redirect_uri matching left vague    exact string match, always
  refresh tokens: long-lived bearer   rotate with reuse detection, or bind to a key
  token in query string tolerated     prohibited

// nothing here is new. it is the Security BCP, made the default.</div>

<h4>What is unchanged</h4>
<p>Worth stating plainly, because "2.1" sounds more disruptive than it is. Authorization Code,
Client Credentials, Refresh, Device Authorization Grant: all still present and unchanged. Token
formats, scopes, the endpoints, OpenID Connect on top: all the same. There is <b>no protocol
incompatibility</b>: an OAuth 2.1 client talks to an OAuth 2.0 server perfectly well, provided that
server supports PKCE, which practically all of them now do.</p>

<h4>What it deliberately does not solve</h4>
<p>OAuth 2.1 tightens the flows. It does not address the problems that live above them, and it is worth
knowing where the boundary is:</p>
<ul>
<li><b>It is still not authentication.</b> An access token remains a statement about authorization.
OpenID Connect is still what you use to learn who the user is.</li>
<li><b>Token storage in browsers</b> is out of scope; that is the browser-based apps BCP and the BFF
pattern.</li>
<li><b>Authorization semantics</b> (what a scope means, whether the user owns the record) remain
entirely yours. OAuth never had an opinion on that, and still does not.</li>
</ul>

<h4>The practical checklist</h4>
<p>To assess an existing integration against OAuth 2.1, five questions settle almost everything:</p>
<ol>
<li>Is every authorization code request using PKCE with <code>S256</code>? (Not <code>plain</code>.)</li>
<li>Are redirect URIs matched by exact string comparison, with no wildcard entries registered?</li>
<li>Are refresh tokens rotated with reuse detection, or key-bound?</li>
<li>Is any implicit or password grant still enabled, including for that one legacy client nobody has
migrated?</li>
<li>Does any code path accept a token from a query parameter?</li>
</ol>
<p>Question four is where the real risk usually sits: the grants are removed from the specification, but
authorization servers keep supporting them for compatibility, and an enabled-but-unused legacy grant is
still an enabled grant.</p>`,
docs:[['The OAuth 2.1 Authorization Framework (draft)','https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/'],['OAuth 2.0 Security Best Current Practice','https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics'],['RFC 7636, PKCE','https://www.rfc-editor.org/rfc/rfc7636'],['oauth.net, OAuth 2.1','https://oauth.net/2.1/']],
ex:{title:'Audit a client configuration against OAuth 2.1',lang:'js',
run:{call:'grantAllowed',cases:[{name:'authorization code remains',args:['authorization_code'],expect:true},{name:'client credentials remains',args:['client_credentials'],expect:true},{name:'refresh token remains',args:['refresh_token'],expect:true},{name:'device code remains',args:['device_code'],expect:true},{name:'implicit is removed',args:['implicit'],expect:false},{name:'password (ROPC) is removed',args:['password'],expect:false},{name:'an unknown grant is refused',args:['magic'],expect:false},{name:'null is refused',args:[null],expect:false}]},
prompt:`Write four functions. <code>grantAllowed(grantType)</code> returns <code>false</code> for <code>"implicit"</code> and <code>"password"</code>, <code>true</code> for <code>"authorization_code"</code>, <code>"client_credentials"</code>, <code>"refresh_token"</code> and <code>"device_code"</code>, and <code>false</code> for anything else including <code>null</code>. <code>pkceOk(method)</code> accepts only <code>"S256"</code>. <code>redirectOk(registered, presented)</code> requires an exact match of two non-null values and must reject any registered value containing <code>"*"</code>. <code>refreshOk(rotatedWithReuseDetection, senderConstrained)</code> is <code>true</code> when <b>either</b> protection is in place.`,
starter:`function grantAllowed(grantType) {
  return false;
}
function pkceOk(method) {
  return false;
}
function redirectOk(registered, presented) {
  return false;
}
function refreshOk(rotatedWithReuseDetection, senderConstrained) {
  return false;
}`,
solution:`function grantAllowed(grantType) {
  switch (grantType) {
    case "implicit":            // removed: token in the URL fragment
    case "password":            // removed: the app collects the password
      return false;
    case "authorization_code":
    case "client_credentials":
    case "refresh_token":
    case "device_code":
      return true;
    default:
      return false;            // unknown grants and null fail closed
  }
}
function pkceOk(method) {
  return method === "S256";     // plain protects nothing once observed
}
function redirectOk(registered, presented) {
  if (registered == null || presented == null) return false;
  if (registered.indexOf("*") >= 0) return false;   // no wildcards
  return registered === presented;                  // exact match, always
}
function refreshOk(rotatedWithReuseDetection, senderConstrained) {
  return rotatedWithReuseDetection || senderConstrained;
}`,
tests:[{d:'the implicit grant is removed',re:'(?:case\\s*["\']implicit["\']|equals\\s*\\(\\s*["\']implicit["\']\\s*\\)|["\']implicit["\']\\s*\\.\\s*equals\\s*\\([^)]*\\)|[=!]==?\\s*["\']implicit["\']|includes\\s*\\(\\s*["\']implicit["\']\\s*\\)|contains\\s*\\(\\s*["\']implicit["\']\\s*\\))[^;}]*?return\\s+false\\b|(?:case\\s*["\']implicit["\']|equals\\s*\\(\\s*["\']implicit["\']\\s*\\)|["\']implicit["\']\\s*\\.\\s*equals\\s*\\([^)]*\\)|[=!]==?\\s*["\']implicit["\']|includes\\s*\\(\\s*["\']implicit["\']\\s*\\)|contains\\s*\\(\\s*["\']implicit["\']\\s*\\))[^;}]*?->\\s*(?:\\{\\s*)?(?:return\\s+)?false\\b'},{d:'the password grant is removed',re:'"password"'},{d:'authorization code remains',re:'(?:case\\s*["\']authorization_code["\']|equals\\s*\\(\\s*["\']authorization_code["\']\\s*\\)|["\']authorization_code["\']\\s*\\.\\s*equals\\s*\\([^)]*\\)|[=!]==?\\s*["\']authorization_code["\']|includes\\s*\\(\\s*["\']authorization_code["\']\\s*\\)|contains\\s*\\(\\s*["\']authorization_code["\']\\s*\\))[^;}]*?return\\s+true\\b|(?:case\\s*["\']authorization_code["\']|equals\\s*\\(\\s*["\']authorization_code["\']\\s*\\)|["\']authorization_code["\']\\s*\\.\\s*equals\\s*\\([^)]*\\)|[=!]==?\\s*["\']authorization_code["\']|includes\\s*\\(\\s*["\']authorization_code["\']\\s*\\)|contains\\s*\\(\\s*["\']authorization_code["\']\\s*\\))[^;}]*?->\\s*(?:\\{\\s*)?(?:return\\s+)?true\\b'},{d:'only S256 is accepted for PKCE',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:"S256"))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:"S256")[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:"S256")[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:"S256")[^{]*?return\\s+\\k<av>\\b)'},{d:'wildcard redirect registrations are refused',re:'(?:if\\s*\\(\\s*[^;{]*(?:indexOf\\s*\\(\\s*"\\*"\\s*\\))[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:return\\s+(?!\\s*!)[^;{]*(?:indexOf\\s*\\(\\s*"\\*"\\s*\\)))|(?:(?<h1>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:indexOf\\s*\\(\\s*"\\*"\\s*\\))[^{]*?return\\s+\\k<h1>\\b)'},{d:'redirect matching is exact',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:registered\\s*===\\s*presented))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:registered\\s*===\\s*presented)[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:registered\\s*===\\s*presented)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:registered\\s*===\\s*presented)[^{]*?return\\s+\\k<av>\\b)'},{d:'either refresh protection suffices',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:\\|\\|))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:\\|\\|)[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:\\|\\|)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:\\|\\|)[^{]*?return\\s+\\k<av>\\b)'},{d:'a guard returns its constant, not the negation of it',re:'return\\s+!\\s*\\(?\\s*(?:true|false)\\s*\\)?\\s*;',not:true}],
behavior:`Eight grant types are executed, including an unknown value and null, so a default that fails open is caught rather than merely unmatched by a regex. pkceOk("plain") is false because plain offers no protection against an attacker who observed the challenge, and a registered redirect of "https://app.example.com/*" is rejected however it is presented.`,
hints:['A switch listing the four permitted grants, defaulting to false, handles the removed ones and null together.','<code>return method === "S256";</code>','Reject the wildcard registration first, then compare with ===.']}},

{id:'oa8b',title:'Browser-based apps and the BFF pattern',body:`
<p>A single-page app needs to call an API on the user's behalf. The obvious design (run the OAuth flow
in JavaScript, keep the access token in the browser, attach it to fetch calls) is what most tutorials
show, and it is no longer the recommended approach. Understanding why leads to the pattern that
replaced it.</p>
<!--flow:oa8b-bff-->
<h4>Browser app behind a BFF: step by step</h4>
<div class="flowDia"><svg viewBox="0 0 720 380" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Browser app behind a BFF"><defs><marker id="oa8b-bff-ah-front" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent)"/></marker><marker id="oa8b-bff-ah-back" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent2)"/></marker><marker id="oa8b-bff-ah-attack" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--bad)"/></marker><marker id="oa8b-bff-ah-x" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--muted)"/></marker></defs><line x1="74" y1="54" x2="74" y2="348" class="fdLife"/><line x1="264.66666666666663" y1="54" x2="264.66666666666663" y2="348" class="fdLife"/><line x1="455.3333333333333" y1="54" x2="455.3333333333333" y2="348" class="fdLife"/><line x1="646" y1="54" x2="646" y2="348" class="fdLife"/><rect x="9.700000000000003" y="8" width="128.6" height="46" rx="8" class="fdActor"/><text x="74" y="35.5" class="fdActorT">Browser (SPA)</text><rect x="225.66666666666663" y="8" width="78" height="46" rx="8" class="fdActor"/><text x="264.66666666666663" y="27" class="fdActorT">BFF</text><text x="264.66666666666663" y="42" class="fdActorS">backend for frontend</text><rect x="365" y="8" width="180.66666666666666" height="46" rx="8" class="fdActor"/><text x="455.3333333333333" y="35.5" class="fdActorT">Authorization Server</text><rect x="607" y="8" width="78" height="46" rx="8" class="fdActor"/><text x="646" y="35.5" class="fdActorT">API</text><line x1="77" y1="102" x2="259.66666666666663" y2="102" stroke="var(--accent)" class="fdArrow" marker-end="url(#oa8b-bff-ah-front)"/><text x="184.33333333333331" y="93" class="fdLabel">login</text><circle cx="92" cy="102" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="92" y="105.5" class="fdNumT" style="fill:var(--accent)">1</text><line x1="267.66666666666663" y1="132" x2="450.3333333333333" y2="132" stroke="var(--accent2)" class="fdArrow" marker-end="url(#oa8b-bff-ah-back)"/><text x="375" y="123" class="fdLabel">auth code flow, confidential client</text><circle cx="282.66666666666663" cy="132" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="282.66666666666663" y="135.5" class="fdNumT" style="fill:var(--accent2)">2</text><line x1="452.3333333333333" y1="162" x2="269.66666666666663" y2="162" stroke="var(--accent2)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#oa8b-bff-ah-back)"/><text x="345" y="153" class="fdLabel">tokens, kept server-side</text><circle cx="437.3333333333333" cy="162" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="437.3333333333333" y="165.5" class="fdNumT" style="fill:var(--accent2)">3</text><line x1="261.66666666666663" y1="192" x2="79" y2="192" stroke="var(--accent)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#oa8b-bff-ah-front)"/><text x="154.33333333333331" y="183" class="fdLabel">Set-Cookie: session (HttpOnly, Secure, SameSite)</text><circle cx="246.66666666666663" cy="192" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="246.66666666666663" y="195.5" class="fdNumT" style="fill:var(--accent)">4</text><line x1="77" y1="222" x2="259.66666666666663" y2="222" stroke="var(--accent)" class="fdArrow" marker-end="url(#oa8b-bff-ah-front)"/><text x="184.33333333333331" y="213" class="fdLabel">fetch /api/…, cookie attached</text><circle cx="92" cy="222" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="92" y="225.5" class="fdNumT" style="fill:var(--accent)">5</text><line x1="267.66666666666663" y1="252" x2="641" y2="252" stroke="var(--accent2)" class="fdArrow" marker-end="url(#oa8b-bff-ah-back)"/><text x="470.3333333333333" y="243" class="fdLabel">same call, with Bearer token</text><circle cx="282.66666666666663" cy="252" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="282.66666666666663" y="255.5" class="fdNumT" style="fill:var(--accent2)">6</text><line x1="643" y1="282" x2="269.66666666666663" y2="282" stroke="var(--accent2)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#oa8b-bff-ah-back)"/><text x="440.3333333333333" y="273" class="fdLabel">200</text><circle cx="628" cy="282" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="628" y="285.5" class="fdNumT" style="fill:var(--accent2)">7</text><line x1="261.66666666666663" y1="312" x2="79" y2="312" stroke="var(--accent)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#oa8b-bff-ah-front)"/><text x="154.33333333333331" y="303" class="fdLabel">200</text><circle cx="246.66666666666663" cy="312" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="246.66666666666663" y="315.5" class="fdNumT" style="fill:var(--accent)">8</text><text x="360" y="330" class="fdNote">No token ever reaches the browser: cookies out front, OAuth in back.</text><line x1="18" y1="366" x2="44" y2="366" stroke="var(--accent)" class="fdArrow"/><text x="50" y="370" class="fdLegend">front channel (via the browser)</text><line x1="271.29999999999995" y1="366" x2="297.29999999999995" y2="366" stroke="var(--accent2)" class="fdArrow"/><text x="303.29999999999995" y="370" class="fdLegend">back channel (server to server)</text></svg></div>
<ol class="fdSteps">
<li><b>Browser (SPA) → BFF:</b> login <i>(front channel)</i></li>
<li><b>BFF → Authorization Server:</b> auth code flow, confidential client <i>(back channel)</i></li>
<li><b>Authorization Server → BFF:</b> tokens, kept server-side <i>(back channel)</i></li>
<li><b>BFF → Browser (SPA):</b> Set-Cookie: session (HttpOnly, Secure, SameSite) <i>(front channel)</i></li>
<li><b>Browser (SPA) → BFF:</b> fetch /api/…, cookie attached <i>(front channel)</i></li>
<li><b>BFF → API:</b> same call, with Bearer token <i>(back channel)</i></li>
<li><b>API → BFF:</b> 200 <i>(back channel)</i></li>
<li><b>BFF → Browser (SPA):</b> 200 <i>(front channel)</i></li>
</ol>
<!--/flow:oa8b-bff-->

<h4>The problem is not the flow, it is the storage</h4>
<p>Authorization Code with PKCE fixed the <i>flow</i> for public clients. What it cannot fix is that a
browser has nowhere safe to put the result:</p>
<ul>
<li><b><code>localStorage</code></b>, readable by any JavaScript on the page. One compromised
dependency, one XSS, and the token is exfiltrated. It also persists across tabs and restarts, so the
window of exposure is long.</li>
<li><b><code>sessionStorage</code></b>, the same exposure, with a shorter life.</li>
<li><b>A JavaScript variable</b>: better, since nothing is persisted, but still readable by any script
in the same context, and lost on every refresh.</li>
</ul>
<p>The uncomfortable summary: <b>if your app can read the token, so can any script that gets injected
into your app.</b> No amount of care with the flow changes that, because the token has to be readable
for the app to use it.</p>
<p>There is a second, quieter problem. Browsers now aggressively partition and expire third-party
cookies, which breaks the silent-renew mechanisms SPAs relied on to refresh tokens without a redirect.
Even setting security aside, the pattern has become fragile.</p>

<h4>The BFF pattern</h4>
<p>A <b>backend-for-frontend</b> is a small server-side component that belongs to your frontend. It
holds the tokens; the browser holds only a session cookie.</p>
<div class="codeSample" data-hl>WITHOUT a BFF                        WITH a BFF
browser  --token in JS-->  API       browser --cookie--> BFF --token--> API
                                                          ^
  token readable by any script         token never leaves the server;
  refresh token in the browser         browser holds an HttpOnly cookie
  CORS on every API                    same-origin calls, no CORS

// the browser now has NO token at all. XSS can still make requests as
// the user while the page is open, but it cannot steal a durable credential.</div>
<p>The BFF is a confidential client: it has a real secret, so it can use the strongest client
authentication, and it holds refresh tokens where they belong. The browser's session cookie should be
<code>HttpOnly</code>, <code>Secure</code> and <code>SameSite=Lax</code> or stricter, invisible to
JavaScript by construction.</p>

<h4>What this does and does not buy</h4>
<p>Be precise, because BFF is sometimes oversold. It <b>eliminates token theft</b>: there is no durable
credential in the browser to exfiltrate, so an XSS that fires once cannot grant lasting access. It does
<b>not</b> eliminate XSS damage: injected script can still call the BFF with the user's cookie and act
as them while the page is open. The difference is between an attacker who has a token they can use from
anywhere for an hour, and an attacker confined to a live session in the victim's browser.</p>
<p>The costs are real: you now operate a server component, and because the browser authenticates with a
cookie, you have reintroduced <b>CSRF</b>, which cookie-based apps have always had to handle.
<code>SameSite</code> cookies plus a per-session CSRF token on state-changing requests is the standard
answer.</p>

<h4>Choosing</h4>
<div class="codeSample" data-hl>BFF                        default for anything handling real data
                           tokens server-side, cookie to the browser

Token in memory + PKCE     acceptable when a backend is genuinely impossible:
                           short-lived access token, NO refresh token in the
                           browser, accept re-authentication on refresh

localStorage               no. this is the pattern the BCP exists to discourage</div>
<p>Note what has happened conceptually: the BFF turns your SPA back into a <b>confidential client</b>
with a session, which is what server-rendered applications were doing all along. The industry spent a
decade moving tokens into the browser and has spent the last few years moving them back out.</p>`,
docs:[['OAuth 2.0 for Browser-Based Applications (BCP draft)','https://datatracker.ietf.org/doc/draft-ietf-oauth-browser-based-apps/'],['OWASP, Cross-Site Request Forgery Prevention Cheat Sheet','https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html'],['MDN, Set-Cookie: HttpOnly, Secure, SameSite','https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie']],
ex:{title:'Score a browser token strategy',lang:'js',
run:{call:'durableCredentialInBrowser',cases:[{name:'refresh token in localStorage: one XSS becomes lasting access',args:['localStorage',true],expect:true},{name:'refresh token in an HttpOnly cookie is not script-readable',args:['httpOnlyCookie',true],expect:false},{name:'script-readable storage with no refresh token',args:['localStorage',false],expect:false},{name:'sessionStorage is equally readable',args:['sessionStorage',true],expect:true},{name:'a plain variable is readable too',args:['jsVariable',true],expect:true}]},
prompt:`Write three functions. <code>scriptReadable(storage)</code> returns <code>true</code> for <code>"localStorage"</code>, <code>"sessionStorage"</code> and <code>"jsVariable"</code>, and <code>false</code> for <code>"httpOnlyCookie"</code> and anything else including <code>null</code>. <code>durableCredentialInBrowser(storage, refreshTokenInBrowser)</code> is <code>true</code> when the storage is script-readable <b>and</b> a refresh token is held there. <code>recommend(hasBackend)</code> returns <code>"bff"</code> when a backend is available and <code>"memory-only-pkce"</code> otherwise.`,
starter:`function scriptReadable(storage) {
  return false;
}
function durableCredentialInBrowser(storage, refreshTokenInBrowser) {
  return false;
}
function recommend(hasBackend) {
  return null;
}`,
solution:`function scriptReadable(storage) {
  return storage === "localStorage"
      || storage === "sessionStorage"
      || storage === "jsVariable";
}
function durableCredentialInBrowser(storage, refreshTokenInBrowser) {
  // script-readable is survivable; script-readable AND long-lived is not
  return scriptReadable(storage) && refreshTokenInBrowser;
}
function recommend(hasBackend) {
  return hasBackend ? "bff" : "memory-only-pkce";
}`,
tests:[{d:'localStorage is script-readable',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:localStorage[^;"\']*["\'][^;"\']*?storage\\b))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:localStorage[^;"\']*["\'][^;"\']*?storage\\b)[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:localStorage[^;"\']*["\'][^;"\']*?storage\\b)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:localStorage[^;"\']*["\'][^;"\']*?storage\\b)[^{]*?return\\s+\\k<av>\\b)'},{d:'sessionStorage is script-readable',re:'sessionStorage[^;"\']*["\'][^;"\']*?storage\\b'},{d:'an HttpOnly cookie is not',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:scriptReadable\\s*\\(\\s*storage\\s*\\)))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:scriptReadable\\s*\\(\\s*storage\\s*\\))[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:scriptReadable\\s*\\(\\s*storage\\s*\\))[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:scriptReadable\\s*\\(\\s*storage\\s*\\))[^{]*?return\\s+\\k<av>\\b)'},{d:'the danger is readable storage plus a refresh token',re:'refreshTokenInBrowser'},{d:'a backend means the BFF pattern',re:'"bff"'},{d:'otherwise keep tokens in memory with PKCE',re:'"memory-only-pkce"'}],
behavior:`Your scriptReadable is called through durableCredentialInBrowser, so both must be right. The distinction being executed is the useful one: a short-lived access token in memory is a bounded loss, while a refresh token in script-readable storage turns a single XSS into indefinite access that survives the tab closing.`,
hints:['Three readable stores joined by ||, everything else false.','The dangerous combination is readable storage AND a long-lived credential.','With a backend, keep the tokens on the server and use a cookie-based session.']}},

{id:'oa9',title:'Opaque vs JWT tokens & the split-token pattern',body:`
<p>Access tokens come in two styles, and the choice has real consequences:</p>
<ul>
<li><b>By-value (JWT)</b>: the token <i>contains</i> the claims, signed. Any resource server verifies it <b>offline</b> (just check the signature): fast, no call back to the issuer. Downsides: it's <b>readable</b> by anyone who holds it (base64, not secret), it's <b>bigger</b>, and it's <b>hard to revoke</b> before it expires (it's valid until <code>exp</code>).</li>
<li><b>By-reference (opaque)</b>: the token is just a <b>random string</b> with no data in it. To use it, the resource server calls the Authorization Server's <b>introspection</b> endpoint (RFC 7662) to ask "is this active, and what are its claims?" Upsides: <b>instant revocation</b> (the AS just stops saying "active"), <b>nothing leaks</b> to the client, and it's small. Downside: a network call per validation (cache it).</li>
</ul>
<p><b>The split-token / phantom-token pattern</b> gives you both. The client only ever sees an <b>opaque</b> token; at the edge, the <b>API gateway</b> introspects (or exchanges) it and forwards a short-lived <b>JWT</b> to the internal microservices:</p>
<div class="codeSample">Phantom / split-token pattern
 Client ──(opaque token)──▶ API Gateway ──(introspect)──▶ Authorization Server
                               │  ◀─(claims / a signed JWT)─┘
                               └──(JWT)──▶ internal microservices  (verify offline, fast)

 outward = opaque  → revocable, leaks nothing to the client
 inward  = JWT     → self-contained, fast offline verification between services</div>
<p><b>Benefits:</b> instant revocation and no data exposure on the public side, and JWT performance on the internal side; internal services never call the AS. This is a very common production architecture (e.g. with a gateway in front of a mesh).</p>

<h4>The same stateful/stateless trade, one layer up</h4>
<p>The Foundations stream framed sessions versus tokens as stateful versus stateless. Access tokens face the
identical choice, and it is worth seeing that it is the <i>same</i> decision rather than a new one.</p>
<div class="codeSample" data-hl>OPAQUE                          JWT
a random string. means nothing  self-describing. claims inside, signed.
  to anyone but the issuer.
the API must ASK the issuer     the API verifies the signature LOCALLY
  (introspection: RFC 7662)       against a cached public key
revocation is INSTANT           valid until exp, whatever you do
  - stop returning active:true
tiny                            hundreds of bytes to several KB, on
                                every single request
reveals nothing if it leaks     readable by anyone holding it. NEVER
                                put anything sensitive in one.
a network call per request      no call, no dependency, no latency</div>

<h4>Introspection is a real dependency</h4>
<p>Opaque tokens sound obviously safer until you count the calls. Every request to every service now makes a
synchronous call to the authorization server before it can do anything. That is latency on every hop, load
on the AS proportional to your total traffic, and, the part that matters, <b>the authorization server is
now in the availability path of your entire estate</b>. When it is slow, everything is slow. When it is
down, nothing works.</p>
<p>Caching introspection responses helps and reintroduces the staleness you were avoiding: a cached
<code>active: true</code> is a revocation you have not honored yet. There is no version of this where you
get both properties for free.</p>

<h4>The split-token pattern</h4>
<p>The pattern that gets you most of both, and it is what large platforms actually do: <b>issue an opaque
token to the outside world and a JWT inside</b>.</p>
<div class="codeSample" data-hl>browser / third party  --opaque token-->  YOUR EDGE (gateway)
                                             |
                       introspects ONCE, or looks it up locally
                                             |
                                        mints a short-lived JWT
                                             |
   internal services  <--JWT (verified locally, no AS call)--

// what you get:
//   INSTANT revocation at the edge - the opaque token stops working
//   NO per-hop AS dependency inside - services verify a signature
//   nothing readable leaks to the client - the JWT never leaves
//   the internal JWT can be audience-narrowed per hop (token exchange)</div>
<p>The cost is a gateway that must be there and must be fast. That is a real piece of infrastructure, which
is why this pattern belongs to platforms with enough services to justify it, not to a single application.</p>

<h4>How to choose</h4>
<p><b>Opaque</b> when revocation must be immediate, when the client is a browser or a third party, or when
the token would otherwise carry anything you do not want read. <b>JWT</b> for internal service-to-service
calls where the audience is narrow, the lifetime is short, and the availability win is worth the revocation
lag. <b>Split</b> when you have both problems and a gateway already.</p>
<p>And the sentence that settles most arguments: <b>a JWT's expiry is your revocation policy</b>. If a
fifteen-minute window between disabling an account and its tokens dying is acceptable, JWTs are fine. If it
is not, no amount of design makes them fine: you need a lookup somewhere, and the only question is where
you put it.`,
docs:[['RFC 7662 (Token Introspection)','https://www.rfc-editor.org/rfc/rfc7662'],['Phantom Token pattern','https://curity.io/resources/learn/phantom-token-pattern/'],['Split Token pattern','https://curity.io/resources/learn/split-token-pattern/']],
ex:{title:'Introspect an opaque token',
prompt:`Write <code>Introspect</code> with: <code>static String body(String token)</code> returning <code>"token=" + URLEncoder.encode(token, "UTF-8") + "&amp;token_type_hint=access_token"</code>; <code>static String basicAuth(String clientId, String clientSecret)</code> returning the <code>"Basic " + base64(clientId:clientSecret)</code> value (the resource server authenticates to the introspection endpoint); and <code>static boolean isActive(boolean active, long expEpoch, long now)</code> returning <code>active &amp;&amp; expEpoch &gt; now</code>. Declare <code>throws Exception</code> where needed.`,
starter:`import java.net.URLEncoder;
import java.util.Base64;

public class Introspect {
    static String body(String token) throws Exception {
        return null;
    }
    static String basicAuth(String clientId, String clientSecret) {
        return null;
    }
    static boolean isActive(boolean active, long expEpoch, long now) {
        return false;
    }
}`,
tests:[{d:'posts the token',re:'token=[^;"\']*["\'][^;"\']*?encode\\s*\\(\\s*token\\b'},{d:'URL-encodes the token',re:'URLEncoder\\.encode\\s*\\('},{d:'authenticates with Basic',re:'"Basic "\\s*\\+'},{d:'base64 client credentials',re:'Base64\\.getEncoder\\s*\\(\\s*\\)'},{d:'active AND not expired',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:active\\s*&&\\s*expEpoch\\s*>\\s*now))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:active\\s*&&\\s*expEpoch\\s*>\\s*now)[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:active\\s*&&\\s*expEpoch\\s*>\\s*now)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:active\\s*&&\\s*expEpoch\\s*>\\s*now)[^{]*?return\\s+\\k<av>\\b)'}],
behavior:`body("abc") is "token=abc&token_type_hint=access_token". basicAuth("api","secret") is "Basic YXBpOnNlY3JldA==". isActive(true, future, now) is true; isActive(false,...) or an expired token is false. Introspection is what makes opaque tokens work, and what makes instant revocation possible.`,
hints:['The introspection request is a form POST: <code>token=…</code> (URL-encoded) plus an optional <code>token_type_hint</code>.','The caller (resource server) authenticates too; reuse the Basic auth pattern.','A token is usable only if the AS says <code>active</code> AND it has not expired.'],
solution:`import java.net.URLEncoder;
import java.util.Base64;

public class Introspect {
    static String body(String token) throws Exception {
        return "token=" + URLEncoder.encode(token, "UTF-8") + "&token_type_hint=access_token";
    }
    static String basicAuth(String clientId, String clientSecret) {
        String raw = clientId + ":" + clientSecret;
        return "Basic " + Base64.getEncoder().encodeToString(raw.getBytes());
    }
    static boolean isActive(boolean active, long expEpoch, long now) {
        return active && expEpoch > now;
    }
}`}},

{id:'oa10',title:'Choosing a flow: the decision guide',body:`
<p>Every OAuth flow exists for a specific situation. Here is the full map of <b>what each is for, and when to use it</b>:</p>
<ul>
<li><b>Authorization Code + PKCE</b>: <i>any app acting for a user</i>: server web apps, SPAs, and mobile/native. <b>The default for user login.</b></li>
<li><b>Client Credentials</b>: <i>machine-to-machine</i>, no user (a backend/daemon calling an API as itself).</li>
<li><b>Device Authorization</b>: <i>input-constrained devices</i>: TVs, CLIs, IoT (enter a code on your phone).</li>
<li><b>Refresh Token</b>: <i>renew</i> an access token without sending the user back through login.</li>
<li><b>Hybrid (OIDC)</b>: returns a <code>code</code> and an <code>id_token</code> together; niche, for apps that need an ID token immediately at the front channel.</li>
<li><b>CIBA</b> (Client-Initiated Backchannel Authentication), <i>decoupled</i> auth: the user approves on a <b>separate device</b> (e.g. a call-center agent triggers a push the customer approves on their phone).</li>
<li><b>Token Exchange</b> (RFC 8693), <i>swap one token for another</i>: delegation and service-to-service (the next stream), and impersonation.</li>
<li><b>Implicit</b>: <b>deprecated</b> (SPAs once used it; use Code + PKCE).</li>
<li><b>ROPC / password</b>: <b>deprecated</b> (the app handles the user's password; never for new systems).</li>
</ul>
<div class="codeSample">Pick a flow, a quick decision tree
 Is a user involved?
   NO  → Client Credentials         (service-to-service, machine identity)
   YES → Can the user's device show a browser + type?
           NO  → Device Authorization   (TV / CLI / IoT)
           YES → Authorization Code + PKCE
                   • server web app  → + confidential client auth
                   • SPA / mobile    → public client, PKCE only (no secret)
 Need auth on a SEPARATE device (push-to-approve)? → CIBA
 Need to trade a token for another (delegation / S2S)? → Token Exchange
 Renewing without re-login? → Refresh Token
 Considering Implicit or ROPC? → don't, they're deprecated</div>

<h4>The decision, as three questions</h4>
<p>The list above is a map; in practice you get to the answer with three questions in order. <b>Is a user involved?</b> No means Client Credentials, and nothing else. <b>Can the device show a browser and take input?</b> No means the Device grant (a TV, a CLI on a headless box) or CIBA when the user has a registered second device and the request originates elsewhere, such as a call center. <b>Can the client keep a secret?</b> A server-side app can, and authenticates itself at the token endpoint, ideally with <code>private_key_jwt</code> or mTLS rather than a shared string. A browser app or a mobile app cannot, whatever it looks like: anything shipped to a user's device is public, which is what PKCE exists to compensate for.</p>
<p>That is the whole decision for new systems, and it collapses to one sentence: <b>Authorization Code with PKCE unless there is no user, in which case Client Credentials.</b> Everything else is a special case with a specific justification.</p>

<h4>Why the deprecated ones are deprecated</h4>
<p><b>Implicit</b> returned the access token in the URL fragment, where it landed in browser history, in referrer headers and in any script on the page, with no client authentication and no way to bind the response to the request. PKCE plus the code flow gives the same capability without any of that. <b>ROPC</b> has the application collect the user's password directly, which defeats the entire purpose of federation: it trains users to type their corporate password into third-party forms, cannot support MFA properly, and cannot be used with an external IdP at all. Both are removed in OAuth 2.1. When you meet them, they are almost always a migration artifact, and the migration is the work.</p>

<h4>Refresh tokens are not a flow</h4>
<p>Worth stating because the list above puts them side by side: a refresh token is not a way to <i>obtain</i> authorization, it is a way to keep one alive. It is issued by another grant and exchanged at the token endpoint, and its security properties are entirely about what happens if it leaks, which is why public clients must have rotation with reuse detection, and why a refresh token with no rotation, no expiry and no binding is a password that never changes.</p>`,
docs:[['OAuth 2.0 grant types','https://oauth.net/2/grant-types/'],['OAuth 2.1 (consolidated best practice)','https://oauth.net/2.1/'],['RFC 9126 (CIBA / decoupled)','https://openid.net/specs/openid-client-initiated-backchannel-authentication-core-1_0.html']],
ex:{title:'Recommend the right flow',
prompt:`Write <code>FlowChooser</code> with: <code>static String recommend(String scenario)</code> returning the grant to use: <code>"authorization_code+pkce"</code> for <code>"web-app"</code>, <code>"spa"</code>, or <code>"mobile"</code>; <code>"client_credentials"</code> for <code>"service"</code> or <code>"backend-daemon"</code>; <code>"device_code"</code> for <code>"tv"</code>, <code>"cli"</code>, or <code>"iot"</code>; and <code>"authorization_code+pkce"</code> for anything else (safe default); and <code>static boolean deprecated(String grant)</code> returning true for <code>"implicit"</code> or <code>"password"</code>.`,
starter:`public class FlowChooser {
    static String recommend(String scenario) {
        return null;
    }
    static boolean deprecated(String grant) {
        return false;
    }
}`,
tests:[{d:'user apps → auth code + PKCE',re:'(?:case\\s*["\']web-app["\'][^;}]*?return\\s+["\']authorization_code\\+pkce["\'])|(?:case\\s*["\']spa["\'][^;}]*?return\\s+["\']authorization_code\\+pkce["\'])|(?:case\\s*["\']mobile["\'][^;}]*?return\\s+["\']authorization_code\\+pkce["\'])'},{d:'machine to machine → client credentials',re:'client_credentials'},{d:'constrained devices → device code',re:'device_code'},{d:'flags implicit as deprecated',re:'"implicit"\\s*\\.\\s*equals|equals\\s*\\(\\s*"implicit"|"implicit"'},{d:'flags password/ROPC as deprecated',re:'"password"'}],
behavior:`recommend("spa") and recommend("mobile") return "authorization_code+pkce"; recommend("service") returns "client_credentials"; recommend("tv") returns "device_code"; unknown scenarios default to authorization_code+pkce. deprecated("implicit") and deprecated("password") are true; deprecated("authorization_code") is false.`,
hints:['A switch over the scenario is the clearest structure, with a default that returns authorization_code+pkce.','Group the cases: web-app/spa/mobile, service/backend-daemon, tv/cli/iot.','<code>return "implicit".equals(grant) || "password".equals(grant);</code>'],
solution:`public class FlowChooser {
    static String recommend(String scenario) {
        switch (scenario) {
            case "web-app": case "spa": case "mobile": return "authorization_code+pkce";
            case "service": case "backend-daemon":      return "client_credentials";
            case "tv": case "cli": case "iot":          return "device_code";
            default:                                    return "authorization_code+pkce";
        }
    }
    static boolean deprecated(String grant) {
        return "implicit".equals(grant) || "password".equals(grant);
    }
}`}}
,
{id:'oa3p',title:'Third-party integrations & unsolicited assertions',body:`
<p>Most OAuth in the wild is <b>integrating with a third party</b>: "Log in with Google," a GitHub App that opens pull requests, a Slack app that posts messages, or an enterprise customer single-signing-on into your SaaS. In every case two independent organizations must establish <b>trust</b> before any token flows.</p>
<p><b>How trust is established.</b> You register your application with the provider. In OAuth or OIDC you
receive a <code>client_id</code> and usually a <code>client_secret</code>. In SAML you exchange metadata
containing an X.509 certificate.</p>
<p>The asymmetry underneath is the part worth holding on to. Each side <b>publishes its public key</b> so
the other can verify its signatures. Each side <b>keeps its private key</b>, so only it can produce them.
The provider publishes signing keys at a JWKS URL, or inside SAML metadata, and your application verifies
against those rather than against anything the message itself supplies.</p>
<p>Webhooks are the same idea with a symmetric key: a shared secret produces an HMAC over the payload, and
you recompute it to confirm the message was not forged.</p>
<div class="codeSample">Your app  ──register──▶  Provider
          ◀─client_id/secret, or exchange SAML metadata + cert──
Later:    Provider ──signed token/assertion──▶ Your app
          Your app verifies the signature using the provider's PUBLISHED public key (JWKS/metadata)</div>
<p><b>Unsolicited assertions.</b> Normally your app <i>starts</i> the flow (SP-initiated), so it can match the response to its own request. An <b>unsolicited assertion</b> is the opposite: the identity provider pushes a signed assertion to your app <i>without</i> a preceding request: this is SAML <b>IdP-initiated SSO</b> (OIDC deliberately has no such flow). It is convenient (a portal launches the app for the user) but riskier: there is <b>no request to correlate to</b> (no in-response-to / state), so it is more exposed to <b>replay</b> and to an assertion being injected from elsewhere.</p>
<p><b>Defending unsolicited assertions.</b> Accept them only from a <b>pre-configured, trusted IdP</b>; verify the <b>signature</b> against that IdP's known key; enforce the <b>audience/recipient</b> so an assertion minted for another service is rejected; enforce a short validity window (<code>NotOnOrAfter</code>) to bound replay; and <b>track assertion IDs</b> so the same one cannot be replayed. When you can, prefer SP-initiated flows; the request you send is itself a defense.</p>
<h4>Verifying what arrives, in both directions</h4>
<p>An integration has two trust paths and teams routinely secure only one. <b>Inbound tokens and
assertions</b> are verified against the provider's published keys. <b>Inbound webhooks</b> are verified
against the shared secret, and that check needs three parts, not one: recompute the HMAC over the exact
raw body before any parsing, compare it in <b>constant time</b>, and reject anything whose timestamp is
outside a short window so a captured-and-replayed call is refused.</p>
<p>The subtlety that breaks implementations is the raw body. Parsing JSON and re-serializing it changes
whitespace and key order, so the signature no longer matches. Capture the bytes as they arrived.</p>

<h4>What breaks later, and how to survive it</h4>
<ul>
<li><b>Key rotation at the provider.</b> Fetch and cache the JWKS, refresh on an unknown <code>kid</code>,
and never pin a single key. Providers rotate on their schedule, not yours, and a pinned key fails on their
timetable.</li>
<li><b>Certificate expiry in SAML.</b> Metadata certificates expire, and the failure is a total outage for
that integration on a date that was knowable years in advance. Refresh metadata automatically and alert
well before the date.</li>
<li><b>Secret rotation on your side.</b> Support two valid secrets at once, or rotation requires downtime,
which is why it never happens.</li>
</ul>
<p>The rule for both directions is the same: <b>discover keys, do not embed them</b>, and treat every
credential in the integration as something that will change while you are not looking.</p>`,
docs:[['SAML IdP-initiated SSO','https://en.wikipedia.org/wiki/SAML_2.0#IdP-initiated'],['OAuth 2.0 Security BCP','https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics'],['JWKS / verifying tokens','https://www.rfc-editor.org/rfc/rfc7517']],
ex:{title:'Accept a third-party assertion',lang:'js',
run:{call:'accept',cases:[{name:'everything checks out',args:[true,true,true,true],expect:true},{name:'bad signature',args:[false,true,true,true],expect:false},{name:'wrong audience',args:[true,false,true,true],expect:false},{name:'outside the validity window',args:[true,true,false,true],expect:false},{name:'replayed',args:[true,true,true,false],expect:false}]},
prompt:`Write <code>function accept(signatureValid, audienceOk, withinWindow, notReplayed)</code> that accepts an incoming assertion only when <b>all four</b> hold.`,
starter:`function accept(signatureValid, audienceOk, withinWindow, notReplayed) {
  return false;
}`,
solution:`function accept(signatureValid, audienceOk, withinWindow, notReplayed) {
  return signatureValid && audienceOk && withinWindow && notReplayed;
}`,
tests:[{d:'the signature must verify',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:signatureValid\\s*&&))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:signatureValid\\s*&&)[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:signatureValid\\s*&&)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:signatureValid\\s*&&)[^{]*?return\\s+\\k<av>\\b)'},{d:'the audience must be you',re:'audienceOk'},{d:'it must be within its validity window',re:'withinWindow'},{d:'and it must not be a replay',re:'notReplayed'}],
behavior:`Each of the four is executed as its own failing case. "The signature verified" is the one people stop at, and it is the weakest of the four on its own: a correctly signed assertion for another party, or one you have already seen, is not yours to accept.`,
hints:['Four conditions joined with &&.','A valid signature alone proves origin, not that the assertion is for you.','Replay protection means remembering the assertion id until it expires.']}},

{id:'oa12',title:'OpenID Federation: trust at ecosystem scale',body:`
<p>Everything so far assumes <b>bilateral</b> trust: for each app-to-IdP pair, somebody registers a
client and exchanges keys. That works, and it scales quadratically. Ten parties need forty-five
relationships; a national health network or a university ecosystem with thousands of participants needs
a different mechanism entirely.</p>
<p><b>OpenID Federation</b> replaces "everyone configures everyone" with "everyone trusts an
authority, and proves membership on demand".</p>

<h4>The trust chain</h4>
<p>Each participant publishes a signed <b>entity statement</b> about itself. Its authority publishes a
signed statement about <i>it</i>. That authority's authority signs in turn, up to a <b>trust
anchor</b> the verifier already has. A party proves it belongs by presenting the chain:</p>
<div class="codeSample" data-hl>            [ TRUST ANCHOR ]        configured out of band. the one thing
                  |                you decided to believe.
                  | signs
          [ INTERMEDIATE ]         e.g. a national body, a sector authority
                  | signs
            [ THE ENTITY ]         the RP or OP you have never seen before

// verification: walk the chain to an anchor you hold, checking each
// signature. this is the PKI chain-of-trust idea, applied to federation
// metadata rather than to certificates.</div>
<p>The consequence worth internalising: <b>an RP can accept an OP it has never been configured with</b>,
because trust is transitive through the anchor rather than pairwise. Onboarding a new participant
becomes a registration with the authority, not N integrations.</p>

<h4>Metadata policy: authorities constrain, they do not just vouch</h4>
<p>Vouching alone would be weak: it would say a participant is real, not that it behaves. So each
statement in the chain can carry a <b>metadata policy</b> that constrains what the subordinate is
allowed to declare about itself, and policies <b>compose downward and can only narrow</b>:</p>
<div class="codeSample" data-hl>anchor policy      token_endpoint_auth_methods_supported:
                     subset_of ["private_key_jwt", "tls_client_auth"]
                   id_token_signed_response_alg: one_of ["ES256","RS256"]

entity declares    token_endpoint_auth_method: "client_secret_basic"
                   -> REJECTED. the entity cannot widen what the anchor allowed.</div>
<p>This is how an ecosystem enforces a security baseline (the FAPI requirements from the threats
stream, for example) on participants it does not operate. A member cannot opt into weaker client
authentication, because the policy is applied during chain resolution, not left to the member to enforce on itself.</p>

<h4>Automatic registration</h4>
<p>Because the chain proves who a client is and what it is permitted to declare, an OP can accept a
client it has never registered: the client presents its entity identifier, the OP resolves the chain,
applies policy, and proceeds. That removes the manual onboarding step that makes large ecosystems
impractical, and it is the practical reason the specification exists.</p>

<h4>The trade-offs</h4>
<ul>
<li><b>The anchor is absolute.</b> Compromise it and the entire ecosystem is compromised: the trust
anchor lesson's point at maximum stakes. Anchor keys belong offline, with a rehearsed rotation.</li>
<li><b>Resolution costs.</b> Chains must be fetched, verified and cached, and stale caches mean an
expelled participant is still accepted. Cache TTL is again a security parameter.</li>
<li><b>Governance is the hard part.</b> Who admits members, on what evidence, and how is one expelled
in minutes rather than at the next cache expiry? These are organizational questions the protocol does
not answer.</li>
<li><b>It is not for two parties.</b> For a handful of integrations, bilateral registration is simpler
and better. The crossover is somewhere in the tens of participants, or wherever participants change
often.</li>
</ul>
<p>Where you will meet it: research and education federations, national health and government
ecosystems, open banking schemes, and increasingly the digital wallet ecosystem, where a verifier must
accept credentials from issuers it has never contacted. It is also worth recognizing the shape: SAML
solved the same problem with metadata aggregates and eduGAIN, less elegantly and rather earlier.</p>`,
docs:[['OpenID Federation 1.0','https://openid.net/specs/openid-federation-1_0.html'],['OpenID Federation, entity statements and trust chains','https://openid.net/specs/openid-federation-1_0.html#name-trust-chain'],['GEANT / eduGAIN, interfederation','https://edugain.org/']],
ex:{title:'Resolve a trust chain and apply policy',
prompt:`Write <code>Federation</code> with three methods. <code>static boolean chainTrusted(java.util.List&lt;String&gt; chainIssuers, java.util.Set&lt;String&gt; anchors)</code> is true only when the chain is non-empty and its <b>last</b> element is an anchor you hold. <code>static boolean policyAllows(java.util.Set&lt;String&gt; allowedByPolicy, String declared)</code> requires the declared value to be within the policy set; an entity may not widen what the authority permitted. <code>static boolean acceptEntity(java.util.List&lt;String&gt; chainIssuers, java.util.Set&lt;String&gt; anchors, java.util.Set&lt;String&gt; allowedByPolicy, String declaredAuthMethod)</code> requires both.`,
starter:`import java.util.*;

public class Federation {
    static boolean chainTrusted(List<String> chainIssuers, Set<String> anchors) {
        return false;
    }
    static boolean policyAllows(Set<String> allowedByPolicy, String declared) {
        return false;
    }
    static boolean acceptEntity(List<String> chainIssuers, Set<String> anchors,
                                Set<String> allowedByPolicy, String declaredAuthMethod) {
        return false;
    }
}`,
tests:[{d:'an empty chain is rejected',re:'(?:if\\s*\\(\\s*[^;{]*(?:isEmpty\\s*\\(\\s*\\))[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:return\\s+(?!\\s*!)[^;{]*(?:isEmpty\\s*\\(\\s*\\)))|(?:(?<h1>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:isEmpty\\s*\\(\\s*\\))[^{]*?return\\s+\\k<h1>\\b)'},{d:'the chain must terminate at an anchor',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:anchors\\s*\\.\\s*contains\\s*\\())|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:anchors\\s*\\.\\s*contains\\s*\\()[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:anchors\\s*\\.\\s*contains\\s*\\()[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:anchors\\s*\\.\\s*contains\\s*\\()[^{]*?return\\s+\\k<av>\\b)'},{d:'the last element is the anchor',re:'size\\s*\\(\\s*\\)\\s*-\\s*1'},{d:'policy membership is checked',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:allowedByPolicy\\s*\\.\\s*contains\\s*\\())|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:allowedByPolicy\\s*\\.\\s*contains\\s*\\()[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:allowedByPolicy\\s*\\.\\s*contains\\s*\\()[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:allowedByPolicy\\s*\\.\\s*contains\\s*\\()[^{]*?return\\s+\\k<av>\\b)'},{d:'a null declaration is rejected',re:'(?:if\\s*\\(\\s*[^;{]*(?:declared\\s*!=\\s*null|declared\\s*==\\s*null)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:return\\s+(?!\\s*!)[^;{]*(?:declared\\s*!=\\s*null|declared\\s*==\\s*null))|(?:(?<h1>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:declared\\s*!=\\s*null|declared\\s*==\\s*null)[^{]*?return\\s+\\k<h1>\\b)'},{d:'acceptance requires both checks',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:chainTrusted\\s*\\())|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:chainTrusted\\s*\\()[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:chainTrusted\\s*\\()[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:chainTrusted\\s*\\()[^{]*?return\\s+\\k<av>\\b)'},{d:'and the policy check',re:'policyAllows\\s*\\('}],
behavior:`chainTrusted(List.of("entity","intermediate","anchor-a"), Set.of("anchor-a")) is true, and the same chain against Set.of("anchor-b") is false: the chain must terminate somewhere you decided to believe out of band, which is why an anchor compromise takes the whole ecosystem with it. An empty chain is false. policyAllows(Set.of("private_key_jwt","tls_client_auth"), "client_secret_basic") is false: policies compose downward and can only narrow, so a member cannot opt into weaker client authentication by declaring it. acceptEntity requires both, which is what lets an OP accept a client it has never registered.`,
hints:['The anchor is the last element: <code>chainIssuers.get(chainIssuers.size() - 1)</code>.','Guard the declared value before calling contains.','Compose the third method from the first two.'],
solution:`import java.util.*;

public class Federation {
    static boolean chainTrusted(List<String> chainIssuers, Set<String> anchors) {
        if (chainIssuers == null || chainIssuers.isEmpty() || anchors == null) return false;
        // the chain must terminate at something you configured out of band
        return anchors.contains(chainIssuers.get(chainIssuers.size() - 1));
    }
    static boolean policyAllows(Set<String> allowedByPolicy, String declared) {
        if (allowedByPolicy == null || declared == null) return false;
        return allowedByPolicy.contains(declared);   // narrow only, never widen
    }
    static boolean acceptEntity(List<String> chainIssuers, Set<String> anchors,
                                Set<String> allowedByPolicy, String declaredAuthMethod) {
        return chainTrusted(chainIssuers, anchors)
            && policyAllows(allowedByPolicy, declaredAuthMethod);
    }
}`}}
]});
