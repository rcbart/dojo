STREAMS.push({iam:true,sec:'OAuth 2.0 & OpenID Connect',icon:'🔓',title:'OAuth 2.0 & OpenID Connect',blurb:'Every OAuth 2.0 flow from first principles (authorization code, PKCE, client credentials, device, refresh), plus OpenID Connect on top (ID tokens, discovery, UserInfo, nonce). The protocol that issues the tokens.',lessons:[

{id:'oa1',title:'The roles & the Authorization Code flow',body:`






<p>OAuth 2.0 is a <b>delegated authorization</b> protocol. It lets an app get a <i>limited</i> access token to call an API on a user's behalf, <b>without the user's password</b>. Four roles:</p>
<ul>
<li><b>Resource Owner</b>: the user who owns the data.</li>
<li><b>Client</b>: the app that wants access, public or confidential (see Identity Foundations).</li>
<li><b>Authorization Server (AS)</b>: the IdP that authenticates the user and issues tokens. Two key endpoints: <code>/authorize</code> (front channel) and <code>/token</code> (back channel).</li>
<li><b>Resource Server</b>: the API that accepts the access token.</li>
</ul>

<h4>What it's for</h4>
<p>You use an expense app, and your invoices live in a separate accounting service. The app needs to
read them, but handing it your accounting password would give it everything, for ever, with no way to
take it back. The Authorization Code flow solves that. You log in at the accounting service itself, say
yes to "read invoices", and the app gets a short-lived token good for that and nothing else. The app
never sees the password, and the token can be revoked without changing it.</p>

<h4>When to use it</h4>
<ul>
<li>A web app with a backend that signs users in through a company or consumer identity provider.</li>
<li>Any app that calls an API holding a user's data (calendar, invoices, files) with that user's permission.</li>
<li>A mobile app or single-page app. Same flow, protected with PKCE (next lesson).</li>
<li>Every OpenID Connect login. OIDC rides on this flow and adds the ID token (lesson 6).</li>
</ul>

<h4>When not to</h4>
<ul>
<li>A nightly job or a service calling another service, with no user present. Use Client Credentials (lesson 4).</li>
<li>Renewing an access token that has expired. Use the refresh token (lesson 5), not a new login.</li>
<li>A television or a command-line tool with no browser of its own. Use the Device flow (later in this stream).</li>
<li>Collecting the user's password in your own form and trading it for a token. That is the deprecated password grant. Redirect to the AS instead.</li>
<li>Sending the token itself back in the redirect to skip a round trip. That was the Implicit flow, deprecated. Lesson 3 explains why.</li>
</ul>

<h4>Step by step</h4>
<p>The default and most secure flow is <b>Authorization Code</b>. End to end:</p>
<!--flow:oa1-authcode-->
<div class="flowDia"><svg viewBox="0 0 700 386" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Authorization Code flow"><defs><marker id="oa1-authcode-ah-front" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent)"/></marker><marker id="oa1-authcode-ah-back" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent2)"/></marker><marker id="oa1-authcode-ah-attack" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--bad)"/></marker><marker id="oa1-authcode-ah-x" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--muted)"/></marker></defs><line x1="74" y1="54" x2="74" y2="354" class="fdLife"/><line x1="258" y1="54" x2="258" y2="354" class="fdLife"/><line x1="442" y1="54" x2="442" y2="354" class="fdLife"/><line x1="626" y1="54" x2="626" y2="354" class="fdLife"/><rect x="34.300000000000004" y="8" width="79.39999999999999" height="46" rx="8" class="fdActor"/><text x="74" y="27" class="fdActorT">Browser</text><text x="74" y="42" class="fdActorS">the user, front channel</text><rect x="206" y="8" width="104" height="46" rx="8" class="fdActor"/><text x="258" y="27" class="fdActorT">Client app</text><text x="258" y="42" class="fdActorS">backend</text><rect x="355" y="8" width="174" height="46" rx="8" class="fdActor"/><text x="442" y="35.5" class="fdActorT">Authorization Server</text><rect x="587" y="8" width="78" height="46" rx="8" class="fdActor"/><text x="626" y="27" class="fdActorT">API</text><text x="626" y="42" class="fdActorS">resource server</text><line x1="77" y1="102" x2="253" y2="102" stroke="var(--muted)" class="fdArrow" marker-end="url(#oa1-authcode-ah-x)"/><text x="181" y="93" class="fdLabel">“Log in with Example”</text><circle cx="92" cy="102" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="92" y="105.5" class="fdNumT" style="fill:var(--muted)">1</text><line x1="261" y1="132" x2="437" y2="132" stroke="var(--accent)" class="fdArrow" marker-end="url(#oa1-authcode-ah-front)"/><text x="365" y="123" class="fdLabel">302 → /authorize?response_type=code…</text><circle cx="276" cy="132" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="276" y="135.5" class="fdNumT" style="fill:var(--accent)">2</text><rect x="333.3" y="149" width="217.39999999999998" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="450" y="164" class="fdSelfT">user authenticates &amp; consents</text><circle cx="333.3" cy="160" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="333.3" y="163.5" class="fdNumT" style="fill:var(--muted)">3</text><line x1="439" y1="198" x2="263" y2="198" stroke="var(--accent)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#oa1-authcode-ah-front)"/><text x="335" y="189" class="fdLabel">302 → redirect_uri?code=…</text><circle cx="424" cy="198" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="424" y="201.5" class="fdNumT" style="fill:var(--accent)">4</text><line x1="261" y1="228" x2="437" y2="228" stroke="var(--accent2)" class="fdArrow" marker-end="url(#oa1-authcode-ah-back)"/><text x="365" y="219" class="fdLabel">POST /token, code + client auth + verifier</text><circle cx="276" cy="228" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="276" y="231.5" class="fdNumT" style="fill:var(--accent2)">5</text><line x1="439" y1="258" x2="263" y2="258" stroke="var(--accent2)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#oa1-authcode-ah-back)"/><text x="335" y="249" class="fdLabel">access token (+ refresh, ID token)</text><circle cx="424" cy="258" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="424" y="261.5" class="fdNumT" style="fill:var(--accent2)">6</text><line x1="261" y1="288" x2="621" y2="288" stroke="var(--accent2)" class="fdArrow" marker-end="url(#oa1-authcode-ah-back)"/><text x="457" y="279" class="fdLabel">GET /invoices: Authorization: Bearer …</text><circle cx="276" cy="288" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="276" y="291.5" class="fdNumT" style="fill:var(--accent2)">7</text><line x1="623" y1="318" x2="263" y2="318" stroke="var(--accent2)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#oa1-authcode-ah-back)"/><text x="427" y="309" class="fdLabel">200, the user’s data</text><circle cx="608" cy="318" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="608" y="321.5" class="fdNumT" style="fill:var(--accent2)">8</text><text x="350" y="336" class="fdNote">Tokens only ever travel on the back channel.</text><line x1="18" y1="372" x2="44" y2="372" stroke="var(--accent)" class="fdArrow"/><text x="50" y="376" class="fdLegend">front channel (via the browser)</text><line x1="271.29999999999995" y1="372" x2="297.29999999999995" y2="372" stroke="var(--accent2)" class="fdArrow"/><text x="303.29999999999995" y="376" class="fdLegend">back channel (server to server)</text></svg></div>
<!--/flow:oa1-authcode-->
<ol class="fdSteps">
<li>The user clicks <i>“Log in with Example”</i> in the client app.</li>
<li>The client redirects the browser to the AS <code>/authorize</code> endpoint with what it wants (<b>front channel</b>).</li>
<li>The user logs in and consents at the AS. The client never sees the password.</li>
<li>The AS redirects back to the client's <code>redirect_uri</code> with a short-lived <b>authorization code</b> (front channel). The code is useless alone.</li>
<li>The client's backend exchanges the code for tokens at <code>/token</code>, authenticating itself and presenting the PKCE verifier (<b>back channel</b>). <b>PKCE</b> is Proof Key for Code Exchange, said "pixy". The app invented a random secret at the start of the login, sent a hash of it in step 2, and reveals the secret only now, when it collects the token. An attacker who steals the code in the middle can't finish without the secret.</li>
<li>The AS returns the access token, plus refresh and ID tokens if requested. A <b>refresh token</b> is a long-lived token used only to get new short-lived access tokens without logging in again. An <b>ID token</b> is the signed statement of who logged in, for the app itself, not for APIs. Tokens never travel through the browser.</li>
<li>The client calls the API with <code>Authorization: Bearer …</code>. <b>Bearer</b> means the token works for whoever holds it, like cash. No proof of who is presenting it.</li>
<li>The API validates the token and returns the user's data.</li>
</ol>
<p><b>Step 1.</b> Nothing has left the app yet. The click tells it to start a login it can't perform on its
own, because it doesn't hold the user's account.
<b>Step 2.</b> The app sends the browser to the authorization server with its request spelled out in the
URL: a code please, these scopes, and come back to this address. The browser carries it, so anyone
watching the browser can read it.
<b>Step 3.</b> The user types their password on the authorization server's page, not in the app. The
consent screen shows what the app asked for.
<b>Step 4.</b> The server sends the browser back to the app's registered address with a code attached.
A code on its own buys nothing, and it expires in seconds.</p>
<p><b>Step 5.</b> The app's backend contacts the server directly, out of the browser's sight, and proves it
is the party that started the flow: with its client secret, and with the PKCE verifier.
<b>Step 6.</b> Only now does the server hand over tokens. The reply goes server to server, so the browser
never holds one.
<b>Step 7.</b> The app calls the API with the access token in the <code>Authorization</code> header. The
API checks the token, not the user.
<b>Step 8.</b> The API returns the data. The app has done its job without ever seeing a password.</p>
<p><b>CSRF protection on the redirect is mandatory, but <code>state</code> is no longer the only way to
get it.</b> <b>CSRF</b> is cross-site request forgery: a malicious page makes your browser send a request
to a site you're logged into, and the site can't tell it wasn't you. The browser attaches your cookies
automatically, which is the whole problem. RFC 9700 (the OAuth 2.0 Security BCP) says clients MUST prevent
CSRF at the redirection endpoint and accepts three mechanisms. A <b>BCP</b> is a best current practice, an
IETF document that says how to use a standard safely. For OAuth, the Security BCP is the current list of
"do this, never that". A client using <b>PKCE</b> MAY rely on the protection PKCE
already provides. In OpenID Connect flows the <b>nonce</b> provides it: a random value used once, so a message can't be
replayed. Otherwise a one-time CSRF token
carried in <code>state</code> and bound to the user agent MUST be used.</p>
<p>So PKCE is the CSRF defense, and <code>state</code> carries application state such as where to send
the user back. It's shown below because many deployments still use it for CSRF, and a client whose AS
lacks PKCE needs it.</p>
<div class="codeSample" data-hl>GET https://as.example.com/authorize
  ?response_type=code            // "code" = Authorization Code flow
  &client_id=app123
  &redirect_uri=https://app.example.com/callback
  &scope=openid%20profile        // space-separated, URL-encoded
  &state=xyzRANDOM               // CSRF protection, verified on return</div>

<h4>Why there is a code at all</h4>
<p>The obvious design would be to redirect back with the access token itself. But the redirect goes
through the <b>browser</b>, and a browser leaks: history, server access logs, the <code>Referer</code>
header sent to the next site, the address bar over someone's shoulder. Assume anything in a redirect is
seen.</p>
<p>So the redirect carries a <b>code</b>, useless on its own. Redeeming it needs something the browser
never had: the client's secret, or the PKCE verifier. A code captured from a log is already used, expires
in seconds, and can't be exchanged without that second factor.</p>

<h4>Front channel and back channel</h4>
<p>The <b>front channel</b> is anything routed through the user's browser: the <code>/authorize</code>
request and the redirect back. It's visible, modifiable and untrusted. The <b>back channel</b> is the
direct server-to-server HTTPS call to <code>/token</code>. The client authenticates there, and nobody in
between can read the response. Tokens belong in the back channel. Most OAuth security advice comes down to
"don't put that in the front channel".</p>

<h4>What the redirect carries</h4>
<div class="codeSample">GET /authorize?response_type=code        // ask for a code, not a token
  &amp;client_id=my-app                      // who is asking
  &amp;redirect_uri=https://app.example/cb    // where to come back to, EXACT match
  &amp;scope=openid profile invoices:read     // what is being requested
  &amp;code_challenge=...&amp;code_challenge_method=S256   // PKCE
  &amp;state=...                              // app state, and CSRF where PKCE is unavailable</div>
<p>Two of these cause most integration failures. <code>redirect_uri</code> is matched as an <b>exact
string</b> against the registered list. A trailing slash, a different port in development, or an extra
query parameter is a mismatch. That strictness is deliberate: every relaxation has produced a real attack.
And the <b>code is single-use</b>. A code presented twice is a theft signal. The AS should revoke the
whole grant, not only refuse the second attempt.</p>`,
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




<p>In OAuth the <b>client</b> is the <b>application</b> asking for access: a web app, a mobile app, a backend service. Not the user, not the browser. Before it can ask for a token, the client must be <b>registered</b> with the authorization server (AS). That is how the AS knows it and decides how much to trust it.</p>
<p><b>What registration produces.</b> The AS issues a <code>client_id</code>, a public identifier, not a secret. It records the client's allowed <b>redirect URIs</b> as an exact allowlist, so codes only go back to URLs you pre-approved. A <b>confidential client</b> also gets a <code>client_secret</code>, which it uses to prove its identity at the token endpoint. A <b>public client</b> (a <b>SPA</b>, a single-page application that runs entirely as JavaScript in the browser, or a mobile app) can't keep a secret: anyone can read the bundle or decompile the app. It gets <b>no secret</b> and relies on PKCE instead. <b>PKCE</b> is Proof Key for Code Exchange, said "pixy". The app invents a random secret at the start of a login, sends a hash of it, and reveals the secret only when it collects the token. An attacker who steals the login code in the middle can't finish without the secret.</p>
<div class="codeSample">Register app  ─▶  client_id: "s6BhdRkqt3"   (public)
                  client_secret: "gX1...9f"   (confidential clients only, shown ONCE)
                  redirect_uris: ["https://app.example.com/callback"]</div>
<p><b>How clients are created.</b> Manually in the AS dashboard or admin console, where you register the app and copy the id and secret. Or programmatically via <b>Dynamic Client Registration</b> (RFC 7591), where an API call creates the client and the AS returns the credentials.</p>
<p><b>How the secret is shared and protected.</b> The AS generates the secret at registration and shows it <b>once</b>. Store it in a secret manager or environment variable, <b>never in source control or front-end code</b>, and rotate it periodically. Stronger clients skip the shared secret and use <b>private_key_jwt</b> or <b>mTLS</b> client certificates, covered below. mTLS is mutual TLS: ordinary TLS proves the server's identity to the client, and mutual TLS has the client present a certificate too, so both sides are identified before any data flows. So client authentication runs from nothing (public + PKCE) to a shared <code>client_secret</code> to asymmetric keys, in increasing order of assurance.</p>

<h4>Client authentication is more than a secret</h4>
<p>A shared <code>client_secret</code> is the weakest option the specification allows. Both parties hold it. It appears in configuration, in CI variables, in the AS's database, and wherever a developer pasted it during setup. <b>CI</b> is continuous integration, the automated pipeline that builds and tests code on every change. It runs as its own identity and often holds credentials. Ask for one of these instead:</p>
<ul>
<li><b><code>private_key_jwt</code></b>: the client signs a short-lived JWT assertion with a private key and sends that. A <b>JWT</b> is a JSON Web Token: a small signed document, three base64 pieces separated by dots, that carries claims such as who the client is and when the token expires. Anyone can read it; only the holder of the key can produce a valid signature. The AS only ever holds a <i>public</i> key, so a compromise of its database yields nothing that can impersonate a client.</li>
<li><b><code>tls_client_auth</code> (mTLS)</b>: the client authenticates with a certificate during the TLS handshake. This also enables certificate-bound access tokens.</li>
</ul>
<p>Where a secret must be used, prefer <code>client_secret_basic</code> or <code>client_secret_post</code> over anything that puts it in a URL. Rotate it on a schedule, and support two valid secrets at once so rotation needs no downtime. Hardened profiles such as FAPI ban shared secrets outright. <b>FAPI</b> is financial-grade API, the strictest profile of OAuth and OIDC, written for banking: every optional protection made mandatory.</p>

<h4>Redirect URI matching is a security boundary</h4>
<p>The registered redirect URIs are the only places an authorization code may be delivered. The specification requires <b>exact string matching</b> because every relaxation has produced real attacks. Wildcards in the host let a subdomain takeover receive codes. A path prefix lets an open redirect on that path forward the code. Arbitrary query parameters allow the same. Register complete, exact URIs, keep the list short, and never add <code>http://</code> entries outside of loopback for native apps.</p>

<h4>Dynamic registration and its metadata</h4>
<p>Dynamic Client Registration (RFC 7591) exists because some ecosystems can't pre-register everyone by hand: native apps registering per installation, or a federation where participants join continuously. Open registration is a spam and abuse surface. Real deployments gate it with an initial access token, or replace it with the software-statement and trust-chain mechanisms of OpenID Federation. Either way, registration fixes the client's <b>metadata</b>: grant types, response types, scopes, token endpoint auth method and JWKS location. A <b>JWKS</b> is a JSON Web Key Set: the client's public keys written as JSON, published at a URL so the AS can fetch them and check the client's signatures. That metadata is the AS's model of what this client may do, so registration is a security decision, not an onboarding formality.</p>`,
docs:[['Client registration (RFC 6749 §2)','https://www.rfc-editor.org/rfc/rfc6749#section-2'],['Dynamic Client Registration (RFC 7591)','https://www.rfc-editor.org/rfc/rfc7591'],['Client authentication (OIDC)','https://openid.net/specs/openid-connect-core-1_0.html#ClientAuthentication']],
},
{id:'oa2',title:'PKCE, securing public clients',body:`






<p>A <b>public client</b> (a SPA, meaning a single-page application that runs entirely as JavaScript in the browser, or a mobile app) can't keep a secret, so it can't prove it's the same app that started the flow. Without protection, an attacker who intercepts the authorization code can redeem it. <b>PKCE</b> (Proof Key for Code Exchange, "pixy") fixes this and is now recommended for <i>all</i> clients.</p>
<p>It works with a one-time secret the client makes up per flow:</p>
<ul>
<li><b>code_verifier</b>: a high-entropy random string the client generates and keeps.</li>
<li><b>code_challenge</b>: <code>base64url(SHA-256(code_verifier))</code>, sent on the <code>/authorize</code> request along with <code>code_challenge_method=S256</code>.</li>
<li>Later, at <code>/token</code>, the client sends the original <b>code_verifier</b>. The <b>AS</b> is the authorization server, the OAuth name for the server that logs the user in and issues the tokens. It hashes the verifier and checks it against the challenge it stored. Only the app that created the verifier can complete the exchange.</li>
</ul>
<p>The challenge is public, since it goes through the browser. The verifier stays on the client, and SHA-256 can't be reversed to get it. <b>SHA-256</b> is a hash function. It turns any input into a fixed 32-byte fingerprint; the same input always gives the same fingerprint, and no one can work backwards from the fingerprint to the input. An intercepted code is useless without it.</p>
<div class="codeSample" data-hl>// challenge = base64url( SHA-256( verifier ) ), no padding
MessageDigest sha = MessageDigest.getInstance("SHA-256");
byte[] hash = sha.digest(verifier.getBytes("US-ASCII"));
String challenge = Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
// send on /authorize:  &code_challenge=...&code_challenge_method=S256</div>

<h4>What it's for</h4>
<p>A mobile app or a single-page app runs on hardware the user controls, so anything baked into it can be
read out. It can't hold a client secret, and the token endpoint can't tell it from a copy. The code it
receives comes back through a browser redirect, where another app on the same phone may be able to grab
it. PKCE gives the app a way to prove it started this particular login: it invents a fresh secret each
time and reveals it only when collecting the tokens. A stolen code is then worthless.</p>

<h4>When to use it</h4>
<ul>
<li>A native mobile or desktop app receiving its code through a custom URL scheme or a loopback address.</li>
<li>A single-page app that runs entirely in the browser and has no server of its own.</li>
<li>A web app with a backend and a client secret. OAuth 2.1 requires PKCE there too, because the secret does nothing about a stolen code.</li>
<li>Any OpenID Connect login, since it runs on the authorization code flow.</li>
</ul>

<h4>When not to</h4>
<ul>
<li>As a replacement for the client secret on a confidential client. PKCE binds the code. The secret authenticates the token request. Keep both.</li>
<li>As a replacement for <code>state</code>'s other job. Something still has to carry where to send the user back.</li>
<li>As a replacement for the OIDC <code>nonce</code>. The nonce binds the ID token to this login. PKCE binds the code.</li>
<li>In Client Credentials or a refresh. There is no authorization code in those, so there is nothing to bind.</li>
<li>With <code>code_challenge_method=plain</code>. It protects nothing. Always <code>S256</code>.</li>
</ul>

<!--flow:oa2-pkce-client-->
<h4>Step by step</h4>
<div class="flowDia"><svg viewBox="0 0 640 510" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="PKCE from the public client's side"><defs><marker id="oa2-pkce-client-ah-front" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent)"/></marker><marker id="oa2-pkce-client-ah-back" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent2)"/></marker><marker id="oa2-pkce-client-ah-attack" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--bad)"/></marker><marker id="oa2-pkce-client-ah-x" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--muted)"/></marker></defs><line x1="74" y1="54" x2="74" y2="484" class="fdLife"/><line x1="320" y1="54" x2="320" y2="484" class="fdLife"/><line x1="566" y1="54" x2="566" y2="484" class="fdLife"/><rect x="47.8" y="8" width="52.4" height="46" rx="8" class="fdActor"/><text x="74" y="35.5" class="fdActorT">User</text><rect x="221.4" y="8" width="197.2" height="46" rx="8" class="fdActor"/><text x="320" y="27" class="fdActorT">Public client</text><text x="320" y="42" class="fdActorS">mobile app or SPA, no secret</text><rect x="493.0" y="8" width="146.0" height="46" rx="8" class="fdActor"/><text x="566" y="27" class="fdActorT">AS</text><text x="566" y="42" class="fdActorS">authorization server</text><line x1="77.0" y1="102" x2="315.0" y2="102" stroke="var(--muted)" class="fdArrow" marker-end="url(#oa2-pkce-client-ah-x)"/><text x="197.0" y="93" class="fdLabel">taps Log in</text><circle cx="89.0" cy="102" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="89.0" y="105.5" class="fdNumT" style="fill:var(--muted)">1</text><rect x="165.6" y="136.0" width="308.8" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="320.0" y="151.0" class="fdSelfT">invent code_verifier, keep it in memory</text><circle cx="165.6" cy="147.0" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="165.6" y="150.5" class="fdNumT" style="fill:var(--muted)">2</text><rect x="144.0" y="188.0" width="352.0" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="320.0" y="203.0" class="fdSelfT">code_challenge = base64url(SHA-256(verifier))</text><circle cx="144.0" cy="199.0" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="144.0" y="202.5" class="fdNumT" style="fill:var(--muted)">3</text><line x1="323.0" y1="240" x2="561.0" y2="240" stroke="var(--accent)" class="fdArrow" marker-end="url(#oa2-pkce-client-ah-front)"/><text x="443.0" y="231" class="fdLabel">/authorize + code_challenge, method=S256</text><circle cx="335.0" cy="240" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="335.0" y="243.5" class="fdNumT" style="fill:var(--accent)">4</text><rect x="490.0" y="274.0" width="136.0" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="558.0" y="289.0" class="fdSelfT">login + consent</text><circle cx="490.0" cy="285.0" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="490.0" y="288.5" class="fdNumT" style="fill:var(--muted)">5</text><line x1="563.0" y1="326" x2="325.0" y2="326" stroke="var(--accent)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#oa2-pkce-client-ah-front)"/><text x="443.0" y="317" class="fdLabel">redirect_uri?code=…</text><circle cx="551.0" cy="326" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="551.0" y="329.5" class="fdNumT" style="fill:var(--accent)">6</text><line x1="323.0" y1="360" x2="561.0" y2="360" stroke="var(--accent2)" class="fdArrow" marker-end="url(#oa2-pkce-client-ah-back)"/><text x="443.0" y="351" class="fdLabel">POST /token, code + code_verifier</text><circle cx="335.0" cy="360" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="335.0" y="363.5" class="fdNumT" style="fill:var(--accent2)">7</text><rect x="504.4" y="394.0" width="121.6" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="565.2" y="409.0" class="fdSelfT">hash matches?</text><circle cx="504.4" cy="405.0" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="504.4" y="408.5" class="fdNumT" style="fill:var(--muted)">8</text><line x1="563.0" y1="446" x2="325.0" y2="446" stroke="var(--accent2)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#oa2-pkce-client-ah-back)"/><text x="443.0" y="437" class="fdLabel">tokens</text><circle cx="551.0" cy="446" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="551.0" y="449.5" class="fdNumT" style="fill:var(--accent2)">9</text><text x="320" y="496" class="fdNote">The challenge is public. The verifier is shown once, at the end, on the back channel.</text></svg></div>
<ol class="fdSteps">
<li><b>User → Public client:</b> taps Log in</li>
<li><b>Public client:</b> invent code_verifier, keep it in memory</li>
<li><b>Public client:</b> code_challenge = base64url(SHA-256(verifier))</li>
<li><b>Public client → AS:</b> /authorize + code_challenge, method=S256 <i>(front channel)</i></li>
<li><b>AS:</b> login + consent</li>
<li><b>AS → Public client:</b> redirect_uri?code=… <i>(front channel)</i></li>
<li><b>Public client → AS:</b> POST /token, code + code_verifier <i>(back channel)</i></li>
<li><b>AS:</b> hash matches?</li>
<li><b>AS → Public client:</b> tokens <i>(back channel)</i></li>
</ol>

<!--/flow:oa2-pkce-client-->
<p><b>Step 1.</b> The user taps the login button. Nothing has been sent anywhere yet.
<b>Step 2.</b> The app makes up a long random string, the <code>code_verifier</code>, and keeps it in
memory. It is new for this login and is never written down.
<b>Step 3.</b> The app hashes the verifier with SHA-256 and encodes the result. That hash is the
<code>code_challenge</code>. Anyone may see it, because no one can work back from it to the verifier.
<b>Step 4.</b> The app opens the authorization request in the browser, with the challenge and the method
name <code>S256</code> attached. This travels on the front channel, in a URL.
<b>Step 5.</b> The user logs in and consents at the AS. The AS stores the challenge next to the code it is
about to issue.</p>
<p><b>Step 6.</b> The AS redirects the browser back to the app's address with the code. On some platforms
another app can register the same address and receive this too.
<b>Step 7.</b> The app posts the code to the token endpoint and, for the first and only time, sends the
original verifier with it. This is a direct call, not a redirect.
<b>Step 8.</b> The AS hashes the verifier it just received and compares it with the challenge it stored in
step 5. Only the app that invented the verifier can pass this check.
<b>Step 9.</b> The tokens come back to the app. A thief who grabbed the code in step 6 holds a code and no
verifier, and gets <code>invalid_grant</code> instead.</p>

<h4>The attack</h4>
<p>A mobile app starts a login. To get the code back, the app registered a custom URL scheme,
<code>myapp://callback</code>. On some platforms <b>any app can claim that scheme</b>. A malicious app on
the same phone registers it too. The operating system hands it the redirect, and it now holds a valid
authorization code for your user.</p>
<p>Before PKCE, that code was enough. A public client has no secret, so the token endpoint couldn't tell
the malicious app from the real one. Both presented the same <code>client_id</code> and a valid code, and
both got tokens.</p>

<h4>The fix: a secret invented per flow</h4>
<p>The client doesn't need a <i>long-lived</i> secret. It needs to prove it's the same party that
<b>started</b> this flow, and a one-time value generated in memory does that.</p>
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
That protects nothing against anyone who saw the authorization request, which is the attacker this
defends against. <b>Always <code>S256</code></b>, and a server should refuse <code>plain</code>.</p>
<p>Subtler: the <b>downgrade attack</b>. If an attacker can strip the <code>code_challenge</code> from the
request, an AS that treats PKCE as optional issues a code with no challenge attached, and the protection
disappears. A server that requires PKCE for public clients closes this. A client can't.</p>

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

<h4>No longer just for mobile</h4>
<p>PKCE was designed for native apps. Under OAuth 2.1 it's <b>required for every client</b> using the
authorization code flow, including confidential ones with a secret. A client secret protects the <i>token
request</i> and does nothing about a code stolen in transit. PKCE binds the code itself to the flow that
created it. They defend different things, so you want both.</p>`,
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






<p>PKCE is now required on <i>every</i> authorization code flow. This lesson walks the exchange parameter
by parameter, names the two attacks it defeats, and covers how implementations get it wrong.</p>

<h4>What it's for</h4>
<p>An authorization code comes back to the app through a browser redirect, and a redirect can be seen or
diverted. On a phone, another app may receive it. In a web app, an attacker may slip their own code into
your session. In both cases the code arrives at the token endpoint from a party that didn't start the
flow. PKCE (Proof Key for Code Exchange, said "pixy") ties each code to a secret the real app invented
at the start and shows only at the end. A code that arrives without that secret is refused.</p>
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
<p><b>Step 1.</b> Before anything is sent, the app generates a long random string and holds it in memory.
This is the <code>code_verifier</code>, new for every login.
<b>Step 2.</b> It hashes that string with SHA-256 and base64url-encodes the result. That is the
<code>code_challenge</code>, safe to show anyone.
<b>Step 3.</b> The app opens the authorization request in the browser with the challenge attached. This
URL is visible to the browser, its history and anyone watching.
<b>Step 4.</b> After the user logs in, the AS redirects back with a code. The AS has filed the challenge
against that code.
<b>Step 5.</b> The app calls the token endpoint directly, sending the code and, for the first time, the
verifier itself.</p>
<p><b>Step 6.</b> The AS hashes the verifier it was just given and compares it with the challenge on
file. A match means the caller is the party that invented the verifier.
<b>Step 7.</b> Tokens go back to the app on the direct connection, never through the browser.
<b>Step 8.</b> Now the attack. A malicious app that intercepted the redirect in step 4 sends the same code
to the token endpoint. It has no verifier, so it sends none, or a guess.
<b>Step 9.</b> The hash doesn't match, and the AS answers <code>invalid_grant</code>. The stolen code
bought nothing.</p>

<h4>The attack it was invented for</h4>
<p>PKCE came from mobile. A native app can't hold a client secret, since anyone can unpack the binary. It
receives its authorization code through a <b>custom URL scheme</b> like <code>myapp://callback</code>.
On mobile platforms of the time, <i>any</i> installed app could register that same scheme. Nothing
verified ownership.</p>
<div class="codeSample" data-hl>WITHOUT PKCE, authorization code interception

 1. real app  -> browser: /authorize?client_id=app&redirect_uri=myapp://cb
 2. user authenticates and consents
 3. AS -> browser: redirect to myapp://cb?code=XYZ
 4. MALICIOUS app also registered myapp:// and receives the code
 5. malicious app -> /token  code=XYZ, client_id=app
 6. AS has no way to tell the apps apart -> issues the token

// there is no secret, so "which app is this?" is unanswerable.</div>
<p>The fix: if the app can't prove <i>who</i> it is, let it prove that it's <i>the same party that
started this flow</i>. A fresh secret per flow, committed to up front, revealed only at redemption.</p>

<h4>The second attack: code injection</h4>
<p>Less discussed, and the reason PKCE now applies to confidential clients too. Here the attacker doesn't
steal your code. They feed you <i>theirs</i>.</p>
<p>The attacker starts their own legitimate authorization flow and gets a code for <i>their</i> account.
They inject that code into a victim's session. The victim's client redeems it, and the victim ends up
logged in as, or linked to, the attacker's account. Data the victim then uploads goes to the attacker. A
client secret does nothing here: the client is genuine, the code is foreign. PKCE stops it because the
victim's client holds a verifier that doesn't match the challenge the attacker's code was bound to.</p>

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
    &state=xyz789                     the return address, and CSRF where
                                      PKCE cannot be relied on
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
observed. That's harmless, because SHA-256 can't be reversed. <b>SHA-256</b> is a hash function. It turns
any input into a fixed 32-byte fingerprint; the same input always gives the same fingerprint, and no one
can work backwards from the fingerprint to the input. The <b>verifier</b> travels only on the
direct back-channel POST, once, at the end.</p>

<h4>state and PKCE are not the same thing</h4>
<p>They get conflated because they sit next to each other in the request:</p>
<div class="codeSample" data-hl>state           binds the RESPONSE to the user's session   -> stops CSRF
code_challenge  binds the CODE to a ONE-TIME SECRET the       -> stops interception
                redeeming client generated for this flow         and injection
                (the code_verifier, NOT the client secret:
                 a public client has no client secret, which
                 is precisely why PKCE was invented)

// they defend different things. RFC 9700 does allow a client that has
// confirmed the server supports PKCE to rely on PKCE for the CSRF
// protection too, which is why state is increasingly the return
// address rather than a security parameter. what you may NEVER do is
// run state alone and call the code protected: nothing about state
// stops interception or injection.</div>
<p>In OpenID Connect the <code>nonce</code> is a third, separate thing. It binds the <i>ID token</i> to
this login, defeating ID token replay: capturing a valid token and sending it again later. RFC 9700
accepts it as a CSRF defense as well. <b>CSRF</b> is cross-site request forgery: a malicious page makes
your browser send a request to a site you're logged into, and the site can't tell it wasn't you. The
browser attaches your cookies automatically, which is the whole problem. So a flow needs
<b>PKCE always</b>, and <i>one of</i> PKCE, <code>nonce</code> or <code>state</code> doing the CSRF
job.</p>

<h4>Four ways to get it wrong</h4>
<ol>
<li><b>Using <code>plain</code>.</b> The specification allows <code>code_challenge_method=plain</code>,
where the challenge <i>is</i> the verifier. Anyone who observes the authorization request then has the
verifier. Always <code>S256</code>. A server should reject <code>plain</code> outright.</li>
<li><b>The downgrade attack.</b> If a server accepts a redemption with no <code>code_verifier</code>
when a challenge <i>was</i> registered, an attacker just omits it. The server must remember that a
challenge was stored and <b>require</b> the verifier. Absence is failure, not a skipped optional
check.</li>
<li><b>A reused or weak verifier.</b> Generate it fresh per flow from a cryptographic random source, at
least 43 characters. A verifier derived from a timestamp, a session id or a counter is guessable, and
then so is the flow.</li>
<li><b>Storing the verifier where the code lands.</b> On a SPA (a single-page application, which runs
entirely as JavaScript in the browser), keeping it in
<code>localStorage</code> hands it to any injected script. Keep it in memory for the lifetime of the
flow.</li>
</ol>

<h4>When to use it</h4>
<p>Always. The old guidance ("PKCE is for public clients") is obsolete. OAuth 2.1 requires it on every
authorization code request, because code injection applies whether or not the client holds a secret. It
costs one hash, and no authorization code flow is better off without it.</p>

<h4>When not to</h4>
<ul>
<li>As the only protection on a confidential client's token request. PKCE binds the code. Client authentication proves who the client is. Keep both.</li>
<li>As the thing that carries the return address. That stays in <code>state</code>. PKCE can take over its CSRF job, not this one.</li>
<li>As replay protection for the ID token. That is the OIDC <code>nonce</code>, a separate check.</li>
<li>In Client Credentials or a refresh request. Neither has an authorization code, so there is nothing for PKCE to bind.</li>
<li>With <code>code_challenge_method=plain</code>. That is PKCE in name only. Use <code>S256</code>.</li>
</ul>`,
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






<p>Step 4 of the flow: the client's <b>backend</b> takes the authorization code and calls the AS <code>/token</code> endpoint over the <b>back channel</b>, a direct, private POST that never touches the browser. The <b>AS</b> is the authorization server, the OAuth name for the server that logged the user in and issues the tokens. This is where the tokens come out.</p>
<p>The request is an <code>application/x-www-form-urlencoded</code> body:</p>
<ul>
<li><code>grant_type=authorization_code</code></li>
<li><code>code=</code> the authorization code just received</li>
<li><code>redirect_uri=</code> the same one used on <code>/authorize</code>. The AS checks it matches.</li>
<li><code>client_id=</code>, plus client authentication for confidential clients, or the PKCE <code>code_verifier</code> for public clients. <b>PKCE</b> is Proof Key for Code Exchange, said "pixy": the app invented a random secret at the start of the login, sent a hash of it, and reveals the secret only now, when it collects the token. An attacker who stole the code in the middle can't finish without the secret.</li>
</ul>
<p>The AS responds with JSON containing up to three tokens:</p>
<ul>
<li><b>access_token</b>: the key you send to the resource server (<code>Authorization: Bearer</code>). <b>Bearer</b> means the token works for whoever holds it, like cash. No proof of who is presenting it. Short-lived.</li>
<li><b>refresh_token</b>: gets new access tokens without re-login (lesson 5). Long-lived, guard it.</li>
<li><b>id_token</b>: only if you requested the <code>openid</code> scope. A <b>scope</b> is the named permission an app asks for, such as <code>orders:read</code>. Proves <i>who the user is</i> (OpenID Connect, lesson 6).</li>
</ul>
<div class="codeSample" data-hl>POST /token   (back channel)
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&code=AUTH_CODE&redirect_uri=https%3A%2F%2Fapp%2Fcb&client_id=app123&code_verifier=ORIGINAL_VERIFIER</div>

<h4>What it's for</h4>
<p>The app now holds a code that arrived through the browser, and it wants tokens. The exchange is the
step where it trades one for the other in private. It is a direct call from the app's server to the
authorization server. The app can prove it is the app there, and nobody else can see the reply.</p>
<p>Why not have the AS return tokens directly to the browser and skip a round trip? That was the Implicit
flow. It's deprecated because of what the two channels can and can't protect.</p>
<div class="codeSample" data-hl>FRONT CHANNEL (via the browser redirect)
  visible in URLs, history, Referer headers, server logs, extensions
  -> carries the CODE: single-use, short-lived, useless on its own

BACK CHANNEL (client backend -> AS, direct TLS)
  no browser, no intermediaries, client can authenticate itself
  -> carries the TOKENS: long-lived, high-privilege, must never be exposed

// the code exchange exists precisely to move value from the leaky
// channel to the private one. that is the whole design.</div>
<p>The code is a <b>voucher, not a credential</b>. It's worth nothing unless redeemed by the party that
started the flow, which client authentication (confidential clients) or PKCE (public clients) proves.</p>

<h4>When to use it</h4>
<ul>
<li>Every authorization code flow, the moment the redirect delivers a code: a web app's backend, a mobile app, a single-page app.</li>
<li>Every OpenID Connect login. The ID token comes out of this same response.</li>
<li>Whenever the client has a secret. This is the one request where it presents it.</li>
</ul>

<h4>When not to</h4>
<ul>
<li>The access token has expired and you still hold a refresh token. Send that (lesson 5). The code was single-use and is gone.</li>
<li>No user is involved. Client Credentials (lesson 4) uses the same endpoint with a different <code>grant_type</code> and no code.</li>
<li>From JavaScript in the browser when you have a backend. Let the backend make this call, so the tokens never reach the browser (the BFF lesson).</li>
<li>Skipping it by having the redirect carry tokens. That was Implicit, and it is deprecated.</li>
</ul>

<!--flow:oa3-token-exchange-->
<h4>Step by step</h4>
<div class="flowDia"><svg viewBox="0 0 640 494" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Exchanging the code for tokens at /token"><defs><marker id="oa3-token-exchange-ah-front" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent)"/></marker><marker id="oa3-token-exchange-ah-back" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent2)"/></marker><marker id="oa3-token-exchange-ah-attack" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--bad)"/></marker><marker id="oa3-token-exchange-ah-x" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--muted)"/></marker></defs><line x1="74" y1="54" x2="74" y2="468" class="fdLife"/><line x1="320" y1="54" x2="320" y2="468" class="fdLife"/><line x1="566" y1="54" x2="566" y2="468" class="fdLife"/><rect x="4.8" y="8" width="138.4" height="46" rx="8" class="fdActor"/><text x="74" y="27" class="fdActorT">Client backend</text><text x="74" y="42" class="fdActorS">holds the code</text><rect x="225.0" y="8" width="190.0" height="46" rx="8" class="fdActor"/><text x="320" y="27" class="fdActorT">Authorization Server</text><text x="320" y="42" class="fdActorS">/token endpoint</text><rect x="509.0" y="8" width="114.0" height="46" rx="8" class="fdActor"/><text x="566" y="27" class="fdActorT">API</text><text x="566" y="42" class="fdActorS">resource server</text><line x1="77.0" y1="102" x2="315.0" y2="102" stroke="var(--accent2)" class="fdArrow" marker-end="url(#oa3-token-exchange-ah-back)"/><text x="197.0" y="93" class="fdLabel">POST /token, grant_type=authorization_code + code</text><circle cx="89.0" cy="102" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="89.0" y="105.5" class="fdNumT" style="fill:var(--accent2)">1</text><rect x="93.6" y="136.0" width="452.8" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="320.0" y="151.0" class="fdSelfT">authenticate the client (secret), or take its code_verifier</text><circle cx="93.6" cy="147.0" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="93.6" y="150.5" class="fdNumT" style="fill:var(--muted)">2</text><rect x="198.0" y="188.0" width="244.0" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="320.0" y="203.0" class="fdSelfT">code known, unexpired, unused?</text><circle cx="198.0" cy="199.0" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="198.0" y="202.5" class="fdNumT" style="fill:var(--muted)">3</text><rect x="198.0" y="240.0" width="244.0" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="320.0" y="255.0" class="fdSelfT">code issued to this client_id?</text><circle cx="198.0" cy="251.0" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="198.0" y="254.5" class="fdNumT" style="fill:var(--muted)">4</text><rect x="180.0" y="292.0" width="280.0" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="320.0" y="307.0" class="fdSelfT">redirect_uri same as on /authorize?</text><circle cx="180.0" cy="303.0" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="180.0" y="306.5" class="fdNumT" style="fill:var(--muted)">5</text><rect x="136.8" y="344.0" width="366.4" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="320.0" y="359.0" class="fdSelfT">SHA-256(code_verifier) = stored code_challenge?</text><circle cx="136.8" cy="355.0" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="136.8" y="358.5" class="fdNumT" style="fill:var(--muted)">6</text><line x1="317.0" y1="396" x2="79.0" y2="396" stroke="var(--accent2)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#oa3-token-exchange-ah-back)"/><text x="197.0" y="387" class="fdLabel">200 { access_token, refresh_token, id_token }</text><circle cx="305.0" cy="396" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="305.0" y="399.5" class="fdNumT" style="fill:var(--accent2)">7</text><line x1="77.0" y1="430" x2="561.0" y2="430" stroke="var(--accent2)" class="fdArrow" marker-end="url(#oa3-token-exchange-ah-back)"/><text x="320.0" y="421" class="fdLabel">Authorization: Bearer access_token</text><circle cx="89.0" cy="430" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="89.0" y="433.5" class="fdNumT" style="fill:var(--accent2)">8</text><text x="320" y="480" class="fdNote">A code presented twice is a theft signal: refuse it and revoke what it already bought.</text></svg></div>
<ol class="fdSteps">
<li><b>Client backend → Authorization Server:</b> POST /token, grant_type=authorization_code + code <i>(back channel)</i></li>
<li><b>Authorization Server:</b> authenticate the client (secret), or take its code_verifier</li>
<li><b>Authorization Server:</b> code known, unexpired, unused?</li>
<li><b>Authorization Server:</b> code issued to this client_id?</li>
<li><b>Authorization Server:</b> redirect_uri same as on /authorize?</li>
<li><b>Authorization Server:</b> SHA-256(code_verifier) = stored code_challenge?</li>
<li><b>Authorization Server → Client backend:</b> 200 { access_token, refresh_token, id_token } <i>(back channel)</i></li>
<li><b>Client backend → API:</b> Authorization: Bearer access_token <i>(back channel)</i></li>
</ol>

<!--/flow:oa3-token-exchange-->
<p><b>Step 1.</b> The client's backend posts the code to <code>/token</code> over its own HTTPS connection,
with <code>grant_type=authorization_code</code>, the <code>redirect_uri</code> it used before and its
<code>client_id</code>. No browser is involved.
<b>Step 2.</b> The AS works out who is calling. A confidential client sends its secret (or a signed
assertion, or a certificate). A public client has none, so its <code>code_verifier</code> stands in.
<b>Step 3.</b> The AS looks the code up. It must exist, be younger than its lifetime (the spec says ten
minutes at most) and never have been redeemed.
<b>Step 4.</b> The AS checks the code was issued to the client now presenting it. A code minted for one
app can't be cashed by another.</p>
<p><b>Step 5.</b> The AS compares the <code>redirect_uri</code> with the one on the original
<code>/authorize</code> request. A mismatch means this redemption doesn't belong to that request.
<b>Step 6.</b> The AS hashes the verifier and compares it with the challenge it stored when the code was
issued. This proves the redeemer is the party that started the flow.
<b>Step 7.</b> All checks passed, so the AS returns JSON with the access token and, if requested, a
refresh token and an ID token, marked <code>Cache-Control: no-store</code>.
<b>Step 8.</b> The client sends the access token to the API as a bearer token. The ID token stays with the
client.</p>

<h4>The checks the AS runs, and what each stops</h4>
<ul>
<li><b>Is the code known, unexpired, and unused?</b> Codes are single-use and short-lived. The spec
recommends a maximum of ten minutes. A second redemption must fail, and RFC 9700 says the AS SHOULD also
revoke every token already issued from that code, because a replay (the same code captured and sent again) means someone else has it.</li>
<li><b>Was it issued to <i>this</i> client?</b> Otherwise a malicious client could redeem a code intended
for another.</li>
<li><b>Does <code>redirect_uri</code> match the one used at <code>/authorize</code>?</b> This binds the
redemption to the original request.</li>
<li><b>Does the <code>code_verifier</code> hash to the stored challenge?</b> Proof that the redeeming
party started the flow.</li>
</ul>

<h4>Reading the response</h4>
<p>The response is JSON. <code>Cache-Control: no-store</code> matters: these are credentials, and caching
them anywhere is a leak.</p>
<div class="codeSample" data-hl>{ "access_token": "...", "token_type": "Bearer", "expires_in": 300,
  "refresh_token": "...", "id_token": "...", "scope": "orders:read" }

// "scope" may be NARROWER than you asked for. the AS is allowed to
// grant less. a client that assumes it got what it requested will
// fail at the resource server instead, confusingly.

// "expires_in" is SECONDS FROM NOW, not a timestamp. treat it as a
// hint and handle a 401 anyway - clocks drift and tokens get revoked.</div>

<h4>Two mistakes</h4>
<p><b>Reading the access token.</b> It's opaque <i>to the client</i> by contract, even when it happens to
be a decodable JWT. A <b>JWT</b> is a JSON Web Token: a small signed document, three base64 pieces
separated by dots, that carries claims such as who the user is and when the token expires. Anyone can
read it; only the issuer can produce a valid signature. Its format and audience belong to the resource server. Clients that parse it break
the day the AS changes it. If you need to know who the user is, that's the ID token's job.</p>
<p><b>Treating the ID token as an API credential.</b> It's issued to the client, its <b>audience</b> (who
the token is for) is the client, and it proves an authentication event. Sending it to an API is a category error the API should
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






<p>Not every flow has a user. When a <b>backend service</b> calls another service on <i>its own</i> behalf (a cron job, a microservice), there is no browser and no one to log in. That's the <b>Client Credentials</b> grant: the client authenticates <i>as itself</i> and gets an access token for itself. In OAuth the <b>client</b> is the application asking for access, so here the client is the service itself, not a user and not a browser.</p>

<h4>What it's for</h4>
<p>A program needs to call an API and there is no person to ask. A reconciliation job runs at three in the
morning. One microservice fetches prices from another. Nobody is at a keyboard, nobody can type a password
and nobody can click "allow". Client Credentials gives the program an identity of its own. It was handed a
credential when it was registered. It presents that credential to the authorization server and gets a
token that says "this service may do these things". The token is about the service, not about any user.</p>

<h4>When to use it</h4>
<ul>
<li>A nightly or scheduled job that reads or writes data the service itself is responsible for.</li>
<li>A microservice calling another service on its own account, with no user request behind the call.</li>
<li>A CI runner or a deployment tool that needs an API token to do its work.</li>
<li>Any confidential client that can keep a secret, a private key or a certificate on a server.</li>
</ul>

<h4>When not to</h4>
<ul>
<li>A service calling another service <i>during a user's request</i>. The user's identity would be lost. Use token exchange (RFC 8693).</li>
<li>Anything that reads or changes a particular person's data on their behalf. Use Authorization Code, so the token names the user.</li>
<li>A mobile app or a single-page app. It can't keep a secret, so it can't authenticate as itself.</li>
<li>A client that wants a refresh token. There is no login to avoid repeating. Authenticate again instead.</li>
</ul>
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
<p><b>Step 1.</b> The service opens a direct HTTPS connection to the token endpoint and asks for a token
with <code>grant_type=client_credentials</code> and the scopes it needs. There is no redirect, because
there is no browser to redirect.
<b>Step 2.</b> The authorization server checks the caller's own credential: a client secret, a JWT signed
with the service's private key, or the certificate on the TLS connection. This is the whole login. There is
no user step to follow it.
<b>Step 3.</b> The server returns an access token whose subject is the service. No refresh token comes
with it, since the service can simply ask again. No ID token either, because nobody authenticated.
<b>Step 4.</b> The service calls the API with the token as a bearer token. The API sees "this service" and
authorizes on that basis alone.</p>
<ul>
<li>Only for <b>confidential clients</b>. They must authenticate with a secret, key or mTLS. <b>mTLS</b> is mutual TLS: ordinary TLS proves the server's identity to the client, and mutual TLS has the client present a certificate too, so both sides are identified before any data flows.</li>
<li><b>No user, no refresh token, no ID token</b>. The token's subject, meaning who the token is about, is the <i>client</i>.</li>
<li>A single back-channel POST to <code>/token</code> with <code>grant_type=client_credentials</code> and the scopes it needs. A <b>scope</b> is the named permission an app asks for, such as <code>orders:read</code>.</li>
</ul>
<p>This is the foundation of service-to-service authorization (its own stream). The client proves itself, commonly HTTP Basic with client_id:client_secret, and receives a scoped token to call the target API. It presents that token as a <b>bearer</b> token: one that works for whoever holds it, like cash, with no proof of who is presenting it.</p>
<div class="codeSample" data-hl>POST /token
Authorization: Basic base64(client_id ":" client_secret)   // client auth
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials&scope=orders%3Aread</div>

<h4>No user in the picture</h4>
<p>Every flow so far had a user at the center: someone to authenticate, someone to consent, someone whose
data is being reached. Client Credentials removes all three. The <b>client is the resource owner</b>. It's
asking for access to something it owns, on its own behalf.</p>
<p>So the familiar pieces disappear. No redirect: there's no browser and nobody to look at a consent
screen. No ID token: there's no authentication event to describe. No refresh token: the client can
authenticate again whenever it likes. RFC 6749 says a refresh token SHOULD NOT be issued here, and a
client asking for one has usually misunderstood the grant.</p>
<div class="codeSample" data-hl>authorization code:  "this USER lets this APP read their orders"
                       sub = the user, and the app is a delegate

client credentials:  "this SERVICE may read orders"
                       sub = the service. no delegation, no user.

// this is the distinction that trips people: if a request is
// ultimately on behalf of a person, client credentials is the
// WRONG grant, even when a service makes the call.</div>

<h4>The mistake this grant invites</h4>
<p>A background job legitimately acts as itself. But teams reach for Client Credentials for the wrong
reason too. A service needs to call another service <i>during a user's request</i>, passing user context
is awkward, so it uses its own service token instead.</p>
<p>The downstream service then sees only "orders-service called me" and has lost what it needs to
authorize properly. The user's identity, their permissions, and any consent are gone. The downstream must
either trust the caller completely, or accept an unauthenticated user-id header, which is not
authorization at all. The correct tool is <b>token exchange</b> (RFC 8693), covered in the
service-to-service stream. It produces a token for the downstream audience that still carries the
subject.</p>

<h4>Authenticating as a machine</h4>
<p>The security of this grant reduces to how the client proves itself. The options, in increasing order
of assurance:</p>
<ul>
<li><b>client_secret_basic / _post</b>: a shared secret. Simple and ubiquitous, but a long-lived
credential that must be stored, distributed, rotated, and kept out of logs.</li>
<li><b><code>private_key_jwt</code></b>: the client signs a short-lived JWT assertion with its private
key. A <b>JWT</b> is a JSON Web Token: a small signed document, three base64 pieces separated by dots,
that carries claims such as who the client is and when the token expires. Anyone can read it; only the
holder of the key can produce a valid signature. Nothing shared, so nothing to leak from the server
side.</li>
<li><b>mTLS</b>: the TLS certificate is the credential, and the issued token can be
<i>certificate-bound</i> (RFC 8705), so a stolen token can't be used without the key.</li>
<li><b>Workload identity federation</b>: the platform attests what the workload is, and that attestation
is exchanged for a token. No stored secret at all. Aim for this.</li>
</ul>

<h4>The operational trap</h4>
<p>These tokens are fetched by code, in a loop. <b>Cache them until shortly before expiry.</b> A service
that requests a fresh token per outbound call will hammer the AS, get rate-limited, and take an outage
caused by its own token acquisition. This is a common production failure. Add jitter, a small random delay before each refresh, so a fleet
restarting together doesn't stampede.</p>`,
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






<p>Access tokens are <b>short-lived</b> (minutes) so a leaked one expires fast, but nobody wants to log in every few minutes. The <b>refresh token</b> is a longer-lived credential the client exchanges for a fresh access token, silently, over the back channel.</p>
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
<p><b>Step 1.</b> The user signs in once through the ordinary authorization code flow. This is the only
time they see a login screen.
<b>Step 2.</b> The token response carries two things: an access token that lasts minutes, and a refresh
token, RT₁, that lasts much longer. The client stores RT₁ somewhere safe and never sends it to an API.
<b>Step 3.</b> Later an API call fails with 401, or the client sees <code>expires_in</code> is nearly up.
It posts RT₁ to the token endpoint with <code>grant_type=refresh_token</code>. The user notices nothing.
<b>Step 4.</b> The server returns a fresh access token and, with rotation, a new refresh token RT₂. The
client replaces RT₁ with RT₂.
<b>Step 5.</b> The server marks RT₁ as spent. If RT₁ ever turns up again, someone is replaying a token
that was already used, and the server revokes every token descended from this sign-in.</p>
<ul>
<li><code>grant_type=refresh_token</code> with the stored <code>refresh_token</code> → a new access token, and often a new refresh token.</li>
<li><b>Refresh token rotation</b>: a good AS (the authorization server, the server that issues the tokens) issues a new refresh token each time and invalidates the old one. If an attacker replays a used one, meaning captures it and sends it again later, the AS detects the reuse and revokes the whole chain.</li>
<li>Refresh tokens are high-value. Confidential clients store them server-side. Public clients rely on rotation plus sender-constraining, which ties the token to a key only the real client holds.</li>
</ul>
<p>The lifecycle in one line: <b>authenticate once → short access tokens for calls → refresh to renew → refresh expires or is revoked → log in again.</b></p>
<div class="codeSample" data-hl>POST /token
grant_type=refresh_token&refresh_token=STORED_REFRESH&scope=orders%3Aread
// response: a new (shorter-lived) access_token, and usually a rotated refresh_token</div>

<h4>What it's for</h4>
<p>Two goals pull in opposite directions. A token that expires in five minutes is nearly worthless to a
thief. Not asking the user to log in every five minutes is a hard product requirement. The refresh token
splits the credential in two: a short-lived one that travels to every API you call, and a long-lived one
that travels only to the authorization server.</p>

<h4>When to use it</h4>
<ul>
<li>A web app with a backend that keeps a user signed in for days while its access tokens last minutes.</li>
<li>A mobile app that must not ask for a password every time it is opened.</li>
<li>A confidential client that can store the refresh token server-side, where the browser never sees it.</li>
<li>A public client, only with rotation and, where the AS supports it, a sender-constrained token.</li>
</ul>

<h4>When not to</h4>
<ul>
<li>Client Credentials. The service can authenticate again whenever it likes, and RFC 6749 says a refresh token SHOULD NOT be issued.</li>
<li>A bare bearer refresh token held by browser JavaScript. Put the tokens behind a backend (the BFF lesson), or bind them with DPoP or mTLS.</li>
<li>Keeping a session alive for ever. Set an absolute session lifetime. Without one, whoever stole a refresh token stays signed in for as long as they keep refreshing.</li>
<li>Finding out who the user is. That is the ID token's job. The refresh token says nothing about the person.</li>
<li>Calling an API. A refresh token goes to the authorization server only, never in an <code>Authorization</code> header to anything else.</li>
</ul>

<h4>The refresh token is the crown jewels</h4>
<div class="codeSample" data-hl>ACCESS TOKEN            REFRESH TOKEN
minutes                 days, weeks, sometimes indefinitely
sent to every API       sent ONLY to the authorization server
leaks broadly           should never appear in a log or a header you
                        did not control
expires into safety     mints NEW access tokens, silently, forever

// steal a refresh token and you have durable access with no login,
// no MFA prompt, and nothing in the authentication logs. it is the
// highest-value credential in an OAuth system.</div>

<h4>Rotation</h4>
<p>Rotation means each refresh token may be used <b>once</b>. Redeeming it returns a new access
token <i>and</i> a new refresh token, and retires the old one. What matters is what a <b>reuse</b> means.</p>
<div class="codeSample" data-hl>normal:  RT1 -> (AT1, RT2) -> (AT2, RT3) -> ...   each used once

theft:   the attacker redeems RT2      -> gets AT2, RT3
         the real client redeems RT2   -> ALREADY USED

// the server cannot tell which party is the thief - and it does not
// need to. a reuse means SOMEONE is replaying, so the WHOLE FAMILY is
// revoked: every token descended from that original grant.
// the legitimate user is logged out too. that is the accepted trade.</div>
<p>Without rotation a stolen refresh token works for as long as it lives. With it, thief and client
collide, and the collision is the alarm.</p>

<h4>Production wrinkles</h4>
<p><b>Concurrent refreshes.</b> A page firing three requests at once may refresh three times in parallel.
Naive reuse detection reads that as theft and logs the user out. Real implementations allow a short grace
window in which the previous token still works, and serialize refreshes in the client.</p>
<p><b>Lost responses.</b> The client redeems a token and the response never arrives. It now holds a dead
token with no way back. Handle that path, or the session stops working with no visible error.</p>

<h4>Three lifetimes</h4>
<p>Naming only two of them is a common mistake. <b>Access token lifetime</b> is your revocation lag.
<b>Refresh token lifetime</b> is the idle timeout: how long an inactive user stays signed in.
<b>Absolute session lifetime</b> caps the whole grant regardless of activity. Teams forget this one.
Without it, a user who keeps refreshing stays authenticated for ever, and so does whoever stole their
refresh token.</p>
<p>Rotation is the fallback. If the refresh token can be <b>sender-constrained</b> with DPoP or mTLS, do
that instead. <b>DPoP</b> is demonstrating proof of possession: the app signs each request with a private
key it holds, so a stolen token is useless without the key. <b>mTLS</b> is mutual TLS: the client
presents a certificate during the connection itself, so it too is identified before any data flows. A bound token can't be replayed, so there's no collision to detect. OAuth 2.1 requires one
or the other for public clients, because a bare bearer refresh token in a browser is the worst credential
in the system. <b>Bearer</b> means it works for whoever holds it, like cash, with no proof of who is
presenting it.</p>`,
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






<p>OAuth 2.0 is about <b>authorization</b> (access to APIs). By itself it doesn't tell an app <b>who the user is</b>, and using an access token to identify a user is a known anti-pattern. <b>OpenID Connect (OIDC)</b> is a thin <b>authentication</b> layer on top of OAuth that adds that.</p>

<h4>What it's for</h4>
<p>You want a "Log in with Google" button, or you want every app in the company to accept the one login
the employee already did. The app doesn't want to store passwords or run its own login page. It wants a
trustworthy statement from the place that does: "this person just logged in here, and this is who they
are". OpenID Connect adds that statement to an OAuth flow. It is a signed document called the ID token,
addressed to your app, describing who authenticated, when, and how.</p>

<h4>When to use it</h4>
<ul>
<li>Signing users into your app through a consumer provider or a company identity provider.</li>
<li>Single sign-on across a company's applications: one login, accepted everywhere.</li>
<li>Any time the app needs to know who the person is, and not only whether it may call an API.</li>
<li>When you need to know how and when someone authenticated (<code>auth_time</code>, <code>acr</code>, <code>amr</code>), for example before a sensitive action.</li>
</ul>

<h4>When not to</h4>
<ul>
<li>To call an API. Send the access token. The ID token is for the client, and an API should reject it.</li>
<li>To identify a user from an access token or a profile lookup. That is the token substitution attack this lesson describes. Use the ID token.</li>
<li>Service to service, with no user. Use Client Credentials. There is no authentication event, so no ID token exists.</li>
<li>A partner who only speaks SAML. Use SAML. Its assertion is the equivalent of the ID token.</li>
</ul>
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
<p><b>Step 1.</b> The client sends the browser to the provider's <code>/authorize</code> endpoint. Two
additions turn this into an OIDC request: the <code>openid</code> scope, and a random <code>nonce</code>
the client makes up and remembers.
<b>Step 2.</b> The user logs in at the OpenID Provider. The client never handles the credentials.
<b>Step 3.</b> The provider sends the browser back with an authorization code, as in plain OAuth.
<b>Step 4.</b> The client's backend redeems the code at <code>/token</code> on the back channel.</p>
<p><b>Step 5.</b> The response holds two tokens with different jobs. The access token is for calling APIs.
The ID token is for the client, and it is the statement of who logged in.
<b>Step 6.</b> The client checks the ID token before believing it. The signature must verify against the
provider's published keys. The issuer, the expiry and the audience (its own <code>client_id</code>) must
be right. The nonce must be the one it sent in step 1. That last check ties the token to this login and no other.
<b>Step 7.</b> If the app wants more about the person, it calls UserInfo with the access token.
<b>Step 8.</b> UserInfo returns the profile claims the granted scopes allow, such as name and email.
These are current, where the ID token's claims are a snapshot from login.</p>
<p>What OIDC adds:</p>
<ul>
<li><b>The <code>openid</code> scope</b>: request it and the AS (the authorization server, now called an "OpenID Provider") returns an <b>ID token</b>. In OIDC the client is called the <b>RP</b>, the relying party: the application that doesn't log you in itself and instead trusts the identity provider to do it.</li>
<li><b>ID token</b>: a <b>JWT</b> describing the authentication event. A JWT is a JSON Web Token: a small signed document, three base64 pieces separated by dots, that carries <b>claims</b>, single facts such as who the user is and when the token expires. Anyone can read it; only the issuer can produce a valid signature. The claims here are <code>iss</code>, <code>sub</code> (the user's stable id), <code>aud</code> (your client_id), <code>exp</code>, <code>iat</code>, and <b><code>nonce</code></b>. It is for the <i>client</i>. The access token is for the API.</li>
<li><b>nonce</b>: a random value the client sends on <code>/authorize</code> and checks for in the ID token. It binds the token to this login (replay protection: a <b>replay</b> is capturing a valid message and sending it again later).</li>
<li><b>UserInfo endpoint</b>: call it with the access token to fetch profile claims (name, email) per the granted scopes (<code>profile</code>, <code>email</code>).</li>
<li><b>Discovery</b>: <code>/.well-known/openid-configuration</code> lists all endpoints and the <code>jwks_uri</code> for verifying ID tokens.</li>
</ul>
<div class="codeSample" data-hl>// request authentication by adding the openid scope (+ nonce)
scope=openid%20profile%20email &nonce=RANDOM
// then fetch profile from UserInfo with the ACCESS token
GET /userinfo    Authorization: Bearer ACCESS_TOKEN</div>

<h4>The confusion OIDC was invented to end</h4>
<p>OAuth answers "may this app access that resource?". It doesn't answer "who is this person?", and for
years everyone pretended it did. The pattern: get an access token, call the provider's profile endpoint,
and treat whatever came back as the logged-in user.</p>
<p>That's broken. <b>An access token is a bearer credential meant for an API.</b> <b>Bearer</b> means it
works for whoever holds it, like cash, with no proof of who is presenting it. It doesn't say who
obtained it, its <b>audience</b> (who the token is for) isn't restricted to your application, and it carries no proof that it was issued
for <i>your</i> login request. A malicious app the same user installed gives an attacker an access token for a different app. The
attacker presents it to your profile lookup. The lookup describes that user, and you log the attacker in
as someone else. This is the <b>confused deputy</b> again: a trusted service tricked into using its own authority on
behalf of someone who should not have it. In the wild
it was called the token substitution attack.</p>

<h4>What OIDC adds</h4>
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

<h4>The rule</h4>
<p><b>Access token = for the API, about authorization. ID token = for the client, about authentication.</b>
Sending an ID token to an API is a category error the API should reject. Using an access token to decide who
the user is reintroduces the attack OIDC exists to prevent.</p>

<h4>Discovery</h4>
<p><code>/.well-known/openid-configuration</code> publishes every endpoint, the supported algorithms, and
the <code>jwks_uri</code>. A client configured with just an issuer URL fetches the rest. Key rotation
becomes a non-event: the client re-fetches the JWKS when it sees an unfamiliar <code>kid</code>, the key
id in the token's header. The <b>JWKS</b> is the JSON Web Key Set: the provider's public keys written as
JSON, published at a well-known URL so anyone can fetch them and check its signatures.
Hard-coding endpoints and keys is how an integration breaks on the day the provider rotates.</p>

<h4>UserInfo</h4>
<p>The <b>UserInfo endpoint</b> returns profile claims for the access token presented. That gives you two
sources for a user's name and email. Claims in the ID token are a <b>snapshot at login</b> and cost nothing
to read. UserInfo is <b>current</b> and costs a request. Put identity essentials in the token, fetch
mutable profile data when you need it, and don't put large or sensitive attributes in a token that travels
everywhere.</p>

<h4>What to validate, in order</h4>
<p>Signature against the JWKS. <code>iss</code> exactly matching the configured issuer. <code>aud</code>
containing your <code>client_id</code>. <code>exp</code> and <code>iat</code> within tolerance. The
<code>nonce</code> equal to the one you stored for this login. Skip the last two and replay becomes
possible. Skip <code>aud</code> and you accept another application's token.</p>`,
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
client <i>knows</i> where that is. Pasting the URLs into a config file is how a provider migration turns
into an outage, and how a key rotation turns into every login failing at once. The protocol's answer is a
<b>metadata document</b>: one JSON file, served over TLS at a well-known path. It tells a client
everything it needs to talk to this authorization server.</p>
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
<p>OpenID Connect Discovery publishes <code>/.well-known/openid-configuration</code>. OAuth 2.0
Authorization Server Metadata (RFC 8414) publishes <code>/.well-known/oauth-authorization-server</code>.
The contents overlap heavily, covering endpoints, supported algorithms, supported scopes and the JWKS
location. The <b>JWKS</b> is the JSON Web Key Set: the provider's public keys written as JSON, published
at a well-known URL so anyone can fetch them and check its signatures:</p>
<div class="codeSample" data-hl>GET https://id.example.com/.well-known/openid-configuration

{ "issuer":                 "https://id.example.com",
  "authorization_endpoint": "https://id.example.com/authorize",
  "token_endpoint":         "https://id.example.com/token",
  "jwks_uri":               "https://id.example.com/.well-known/jwks.json",
  "id_token_signing_alg_values_supported": ["ES256","RS256"],
  "token_endpoint_auth_methods_supported": ["private_key_jwt","client_secret_basic"] }</div>
<p>One path detail catches people out. OIDC <b>appends</b> the well-known segment to the issuer. RFC 8414
<b>inserts</b> it before the issuer's path. For an issuer of <code>https://id.example.com/tenant-a</code>
those give different URLs. That works in single-tenant testing and breaks the day you go multi-tenant, serving several customer
organizations (<b>tenants</b>) from one shared system.</p>

<h4>The issuer must match exactly</h4>
<p>The most important validation in this lesson: <b>the <code>issuer</code> value inside the document
must be identical, character for character, to the issuer you resolved it from</b>. Later, the same goes
for the <code>iss</code> claim (a <b>claim</b> is one fact inside a token; this one says who made it) of
every token you accept from it. Not "the same host". Not "equal after
normalizing the trailing slash". Identical.</p>
<p>Without that check, an attacker who can make your client fetch metadata from a URL of their choosing
supplies their own authorize and token endpoints. Your client then walks the entire flow against a server
the attacker controls. This is the <b>IdP mix-up</b> family of attacks. The <b>IdP</b> is the identity provider: the system
that holds the accounts and does the actual logging in, which here is what the attacker impersonates. Exact issuer comparison makes it
structurally impossible.</p>

<h4>JWKS: fetch, cache, and key by kid</h4>
<p><code>jwks_uri</code> is where the signing public keys live. The discipline is small and rigid:</p>
<ul>
<li><b>Cache the key set</b>: never fetch it per request. A verifier that fetches on every token turns
your identity provider into your own denial-of-service target, and its availability into yours.</li>
<li><b>Select by <code>kid</code></b>, the key id in the token header. On an unknown <code>kid</code>,
refresh once, rate-limited, and fail if it's still unknown. That one behavior makes key rotation
invisible to users.</li>
<li><b>Never follow a URL from the token itself.</b> A <code>jku</code> or <code>x5u</code> header naming
where to find the key is an attacker telling you which key to trust. Keys come from metadata you resolved
from the issuer.</li>
</ul>
<p>Cache lifetime is a security parameter. Too long and a rotated-away key stays trusted. Too short and
every restart stampedes the provider. Minutes, with a jittered refresh, is the usual answer.</p>

<h4>What to validate before you trust a document</h4>
<p>Metadata arrives over TLS and is trusted on that basis, so the checks are about consistency, not
signatures. The issuer must match exactly. Every endpoint must be <code>https</code>, on a host you
expect. The algorithms offered must intersect with the ones your policy permits, and the decision uses
<i>your</i> list, never theirs. A provider advertising <code>HS256</code> doesn't make it acceptable
to you. <b>HS256</b> uses one shared secret both to sign and to verify, so anyone who can verify can also
forge.</p>
<p>Then cache the document with its own TTL and re-resolve periodically. <b>TTL</b> is time to live: how
long a cached record is good for before it must be refreshed or thrown away. Endpoints do move.</p>`,
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

<p>One more flow, and two grants you should <b>recognize but avoid</b>.</p>

<h4>What it's for</h4>
<p>You're setting up a television. It has no keyboard worth using, no browser you'd want to log in with,
and typing a password on a remote control is miserable. But you have a phone in your hand.</p>
<p>The <b>Device Authorization flow</b> splits authentication across <b>two devices</b>. The constrained one shows a short code.
The authentication happens somewhere comfortable. Nothing secret is ever typed on the television. The device asks the AS (the authorization server, the server that logs the user in and issues the tokens) for a code, shows it, and waits.</p>

<h4>When to use it</h4>
<p>A smart TV or streaming box signing in to a video service. A command-line tool (a program you drive by typing in a terminal) that needs your account, running on a remote server with no screen of its own. A printer, a meeting-room display or another small connected gadget (IoT) that can show a few characters but has no keyboard. The shape is always the same: the device can show text and reach the authorization server over the network, and the user has a phone or laptop within reach to finish the login on.</p>

<h4>When not to</h4>
<ul>
<li>A mobile or desktop app on the device the user is holding. It has a browser. Use Authorization Code with PKCE (the native-app lesson).</li>
<li>A web app. Same answer: Authorization Code with PKCE.</li>
<li>A nightly job or a service with no person involved. Use Client Credentials. The device flow always ends with a human approving.</li>
<li>A call-center agent who needs the customer to approve on their own phone. That is CIBA (next lesson): the server pushes the request to the phone instead of the user typing a code.</li>
<li>As a way to dodge a system browser you find inconvenient. The phishing weakness below is the price, so don't pay it when a browser is available.</li>
</ul>

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
<p><b>Step 1.</b> The TV tells the AS which client it is and which scopes it wants, over its own network connection to <code>/device_authorization</code>. No user is involved yet.
<b>Step 2.</b> The AS answers with two codes and an address. The <b>device_code</b> is the TV's private handle on this login attempt; the user never sees it. The <b>user_code</b> is short enough for a human to type. The <b>verification_uri</b> is where the human should go.
<b>Step 3.</b> The TV shows "go to example.com/activate and enter WXYZ-1234", often with a QR code that opens the same page.</p>
<p><b>Step 4.</b> The user picks up their phone, opens the address, types the code and logs in the normal way, with whatever MFA and SSO the AS already has. Then they approve. The consent screen should say which device is asking.
<b>Step 5.</b> Meanwhile the TV <b>polls</b> <code>/token</code> every few seconds with <code>grant_type=urn:ietf:params:oauth:grant-type:device_code</code> and its device_code.
<b>Step 6.</b> Until the user is done, the AS answers <code>authorization_pending</code> (keep polling) or <code>slow_down</code> (wait longer between polls). Once the user approves, the next poll returns tokens. Two other answers mean stop, as the trace below shows.</p>
<div class="codeSample" data-hl>// device flow polls the token endpoint with the device_code grant
grant_type=urn:ietf:params:oauth:grant-type:device_code&device_code=DEV_CODE&client_id=tvapp
// AS replies authorization_pending until the user approves on another screen</div>
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
<p>Device flow has a phishing variant. An attacker starts a device flow for <i>their</i> client, then sends
the victim the legitimate <code>verification_uri</code> and code: "enter this code to finish setting up
your account". The victim authenticates on a genuine page and approves. The tokens go to the attacker's
device.</p>
<p>The mitigations make the consent screen say what is happening. Show <b>what is being authorized and
which device is asking</b>. Keep the code short-lived. Make the user type the code rather than follow a
pre-filled link. Restricting which clients may use the grant at all is the strongest control.</p>

<p><b>Legacy grants, don't use in new systems:</b></p>
<ul>
<li><b>Implicit</b> (<code>response_type=token</code>) returned the access token in the browser URL (front channel). Deprecated. Replaced by <b>Authorization Code + PKCE</b>. <b>PKCE</b> is Proof Key for Code Exchange, said "pixy": the app invents a random secret at the start of a login, sends a hash of it, and reveals the secret only when it collects the token. An attacker who steals the login code in the middle can't finish without the secret.</li>
<li><b>Resource Owner Password Credentials (ROPC)</b> (<code>grant_type=password</code>): the app collects the user's username and password and sends them to the AS. Deprecated, because it teaches users to type their password into any app.</li>
</ul>

<h4>The two grants to recognize and never write</h4>
<p><b>Implicit</b> (<code>response_type=token</code>) returned the access token in the URL fragment. That
put a credential in browser history and in reach of every script on the page. It existed only because
browsers once couldn't make cross-origin token requests. CORS fixed that, so the reason is gone. <b>CORS</b>
is cross-origin resource sharing: a server's opt-in, enforced by the browser, that lets a page from one
site read a response from another site.
Authorization Code with PKCE replaces it.</p>
<p><b>ROPC</b> (<code>grant_type=password</code>) has the application collect the user's username and
password and send them to the authorization server. It defeats the point of OAuth. The app sees the
password, so there's no delegation, no consent screen, no MFA, no SSO, and no federation. <b>MFA</b> is
multi-factor authentication: proving who you are with two different kinds of evidence, usually something
you know (a password) plus something you have (a phone or a security key), so a stolen password alone is
not enough. <b>SSO</b> is single sign-on: you log in once, at one place, and every other application
accepts that login instead of asking for its own. <b>Federation</b> is two organizations agreeing that
one will trust the other's logins.</p>
<div class="codeSample" data-hl>// both are REMOVED in OAuth 2.1. if you meet one:
implicit  -> Authorization Code + PKCE. always. no exceptions.
ROPC      -> Authorization Code + PKCE, in a system browser or a
             web view you do not control the DOM of.

// the usual defense of ROPC is "it is our own first-party app, so
// the password is safe with us". it still blocks MFA and SSO, still
// trains users to type their password into app UIs, and still cannot
// federate. it is a dead end you have to migrate off later.</div>

<h4>The modern guidance, in one line</h4>
<p>Authorization Code with PKCE for anything with a user. Client Credentials for machine-to-machine. Device
Authorization for input-constrained hardware. Token Exchange when a user's identity must survive a hop.</p>`,
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

{id:'oaciba',title:'CIBA: authenticating on a device the client cannot reach',body:`

<p><b>CIBA</b> (Client-Initiated Backchannel Authentication) is the one flow where the client never
touches the user's browser. No redirect, no <code>/authorize</code> request, no user agent. The client
asks the OpenID Provider to find the user, then waits.</p>

<h4>What it's for</h4>
<p>You telephone your bank. Before the agent can move money they need your authorization, and they
are at a terminal you will never see. There is no browser to redirect. The device flow assumes the
user is standing in front of the constrained device reading a code off its screen. Here the user is
on a telephone.</p>
<p>Point of sale is the other common case. A card terminal needs the cardholder to approve a payment,
and the approval belongs on the cardholder's own phone, not a shared terminal keypad.</p>
<div class="codeSample" data-hl>AUTHORIZATION CODE  the client sends the USER'S BROWSER to the provider
DEVICE FLOW         the client shows a code; the user carries it elsewhere
CIBA                the client tells the provider WHO to ask, and the
                    provider reaches that person on its own

// the vocabulary: the CONSUMPTION DEVICE is the thing that ends up with
// the tokens (the agent's terminal). the AUTHENTICATION DEVICE is where
// the human approves (their phone). CIBA is the only flow where those
// two are not joined by a browser session.</div>

<h4>When to use it</h4>
<p>Two devices, held by two people, in two places. A call-center agent who needs the customer on the line to approve a transfer from the customer's own phone. A card terminal in a shop that asks the cardholder's banking app to confirm the payment. A branch employee at a counter who needs the customer to authorize a change to their account. In each case the consumption device cannot host or redirect a browser, and the provider can already reach the user on a registered device. That is why you meet CIBA in banking, call centers and payment terminals rather than in general-purpose applications.</p>

<h4>When not to</h4>
<ul>
<li>A browser is available on the device the user is using. Authorization Code with PKCE is better in every respect.</li>
<li>The user is standing at the constrained device (a TV, a terminal). The device flow is simpler: they read a code off the screen.</li>
<li>The client is a public client (a mobile app, a single-page app). CIBA depends on client authentication, so it is confidential-client only.</li>
<li>Nobody at the provider has a registered phone for this user. There is no one to ping, so the flow cannot start.</li>
<li>Machine-to-machine calls. There is no human to approve. Use Client Credentials.</li>
</ul>

<!--flow:oaciba-flow-->
<h4>Step by step</h4>
<div class="flowDia"><svg viewBox="0 0 640 336" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="CIBA: backchannel authentication across two devices"><defs><marker id="oaciba-flow-ah-front" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent)"/></marker><marker id="oaciba-flow-ah-back" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent2)"/></marker><marker id="oaciba-flow-ah-attack" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--bad)"/></marker><marker id="oaciba-flow-ah-x" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--muted)"/></marker></defs><line x1="74" y1="54" x2="74" y2="310" class="fdLife"/><line x1="320" y1="54" x2="320" y2="310" class="fdLife"/><line x1="566" y1="54" x2="566" y2="310" class="fdLife"/><rect x="4.8" y="8" width="138.4" height="46" rx="8" class="fdActor"/><text x="74" y="27" class="fdActorT">Agent terminal</text><text x="74" y="42" class="fdActorS">consumption device</text><rect x="246.5" y="8" width="147.0" height="46" rx="8" class="fdActor"/><text x="320" y="35.5" class="fdActorT">OpenID Provider</text><rect x="496.8" y="8" width="138.4" height="46" rx="8" class="fdActor"/><text x="566" y="27" class="fdActorT">Customer phone</text><text x="566" y="42" class="fdActorS">user approves here</text><line x1="77.0" y1="102" x2="315.0" y2="102" stroke="var(--accent2)" class="fdArrow" marker-end="url(#oaciba-flow-ah-back)"/><text x="197.0" y="93" class="fdLabel">POST /bc-authorize: login_hint, A7F2</text><circle cx="89.0" cy="102" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="89.0" y="105.5" class="fdNumT" style="fill:var(--accent2)">1</text><line x1="317.0" y1="136" x2="79.0" y2="136" stroke="var(--accent2)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#oaciba-flow-ah-back)"/><text x="197.0" y="127" class="fdLabel">auth_req_id, expires_in, interval</text><circle cx="305.0" cy="136" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="305.0" y="139.5" class="fdNumT" style="fill:var(--accent2)">2</text><line x1="323.0" y1="170" x2="561.0" y2="170" stroke="var(--accent)" class="fdArrow" marker-end="url(#oaciba-flow-ah-front)"/><text x="443.0" y="161" class="fdLabel">push: approve payment? code A7F2</text><circle cx="335.0" cy="170" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="335.0" y="173.5" class="fdNumT" style="fill:var(--accent)">3</text><line x1="563.0" y1="204" x2="325.0" y2="204" stroke="var(--accent)" class="fdArrow" marker-end="url(#oaciba-flow-ah-front)"/><text x="443.0" y="195" class="fdLabel">user logs in, checks A7F2, approves</text><circle cx="551.0" cy="204" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="551.0" y="207.5" class="fdNumT" style="fill:var(--accent)">4</text><line x1="77.0" y1="238" x2="315.0" y2="238" stroke="var(--accent2)" class="fdArrow" marker-end="url(#oaciba-flow-ah-back)"/><text x="197.0" y="229" class="fdLabel">polls /token with auth_req_id</text><circle cx="89.0" cy="238" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="89.0" y="241.5" class="fdNumT" style="fill:var(--accent2)">5</text><line x1="317.0" y1="272" x2="79.0" y2="272" stroke="var(--accent2)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#oaciba-flow-ah-back)"/><text x="197.0" y="263" class="fdLabel">authorization_pending… then tokens</text><circle cx="305.0" cy="272" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="305.0" y="275.5" class="fdNumT" style="fill:var(--accent2)">6</text><text x="320" y="322" class="fdNote">ping and push modes replace 5 and 6 with a call to the client's notification endpoint</text></svg></div>
<ol class="fdSteps">
<li><b>Agent terminal → OpenID Provider:</b> POST /bc-authorize: login_hint, A7F2 <i>(back channel)</i></li>
<li><b>OpenID Provider → Agent terminal:</b> auth_req_id, expires_in, interval <i>(back channel)</i></li>
<li><b>OpenID Provider → Customer phone:</b> push: approve payment? code A7F2 <i>(front channel)</i></li>
<li><b>Customer phone → OpenID Provider:</b> user logs in, checks A7F2, approves <i>(front channel)</i></li>
<li><b>Agent terminal → OpenID Provider:</b> polls /token with auth_req_id <i>(back channel)</i></li>
<li><b>OpenID Provider → Agent terminal:</b> authorization_pending… then tokens <i>(back channel)</i></li>
</ol>
<p><b>Step 1.</b> The agent's terminal, which is the OAuth client, calls the provider's backchannel authentication endpoint over its own server-to-server connection. It authenticates as a client and says who to ask, here with a <code>login_hint</code>, and includes a short <b>binding message</b> (A7F2) that the agent can read aloud.
<b>Step 2.</b> The provider does not return tokens. It returns an <code>auth_req_id</code>, a receipt for this request, plus how long it stays valid and how often the client may check.
<b>Step 3.</b> The provider finds the customer's registered phone and prompts it: someone wants to approve a payment, and here is the code.</p>
<p><b>Step 4.</b> The customer logs in on their phone the normal way, sees A7F2, hears the agent read the same value, and approves. If the two values differ they are approving someone else's request and should refuse.
<b>Step 5.</b> Meanwhile the terminal asks the token endpoint whether the request is done, quoting the <code>auth_req_id</code>.
<b>Step 6.</b> Until the customer answers, the provider replies <code>authorization_pending</code>. Once they approve, the same poll returns the tokens. In ping mode the provider calls the client to say a result is ready; in push mode it delivers the tokens on that call.</p>

<h4>The exchange</h4>
<p>The client posts to the <b>backchannel authentication endpoint</b>, authenticating
itself as it would at the token endpoint. It says <i>who</i> to ask with one of
three hints:</p>
<div class="codeSample" data-hl>POST /bc-authorize                        (client-authenticated, back channel)
  scope=openid%20payments
  &amp;login_hint=ada@example.com            // ONE of these three, never two:
  // &amp;login_hint_token=...                //   an issuer-minted hint
  // &amp;id_token_hint=...                   //   a previous ID token
  &amp;binding_message=A7F2                   // shown on BOTH devices
  &amp;client_notification_token=...          // required for ping and push
  &amp;requested_expiry=300

-&gt; 200 { "auth_req_id": "1c266114-a1be-...", "expires_in": 120, "interval": 5 }</div>
<p>Tokens arrive in one of <b>three delivery modes</b>, fixed per client at registration:</p>
<ul>
<li><b>Poll.</b> The client calls the ordinary token endpoint with
<code>grant_type=urn:openid:params:grant-type:ciba</code> and the <code>auth_req_id</code>, and keeps
asking. The waiting errors are the device flow's:
<code>authorization_pending</code> and <code>slow_down</code> mean keep going.
<code>access_denied</code> and <code>expired_token</code> mean stop.</li>
<li><b>Ping.</b> The provider calls a notification endpoint the client registered, saying only that a
result is ready. The client then collects the tokens from the token endpoint as in poll mode. No
tokens on the notification channel.</li>
<li><b>Push.</b> The provider delivers the tokens straight to the client's notification endpoint.
Simplest to operate, and the one to justify carefully: tokens now arrive at an endpoint
rather than being fetched by the party that asked.</li>
</ul>
<p>No mode has a <b>redirect URI</b>, the address a browser-based login sends the browser back to
with the result attached. Nothing comes back through a browser, so the
interception and injection attacks <b>PKCE</b> exists to stop have no path here. PKCE is Proof Key
for Code Exchange, said "pixy": the app invents a random secret at the start of a login, sends a hash
of it, and reveals the secret only when it collects the token, so an attacker who steals the login
code in the middle can't finish without the secret. Here there's no login code in transit to steal.
<b>Client authentication</b> replaces them, so CIBA is a confidential-client flow. A public client cannot
use it, because nothing else establishes who asked.</p>

<h4>The binding message is the security control</h4>
<p>The user's phone buzzes and asks them to approve something. They did not start it, cannot see what
started it, and have only the prompt's word for what it is. That is the cross-device
consent problem from the threats stream, with the initiating party unverifiable by construction.</p>
<p><code>binding_message</code> is the answer: a short human-readable value the client supplies. The
provider displays it <b>on the authentication device</b> while the agent reads the same value aloud
from the consumption device. If the two do not match, the user is approving somebody else's request.
It authenticates nothing on its own, so it must be short enough to read out and
compare. A deployment that omits it has an approval prompt with no context.</p>
<p>The rest is operational. Keep the <code>auth_req_id</code> alive for a couple of
minutes, not ten. Rate-limit how often one client may raise requests against one user. An
unbounded prompt generator is a fatigue attack with the provider's own branding on it. Log every
request with the client that raised it. An insider abusing this flow looks like
ordinary traffic otherwise.</p>`,
docs:[['OpenID Connect CIBA Core 1.0','https://openid.net/specs/openid-client-initiated-backchannel-authentication-core-1_0.html'],['FAPI CIBA Profile','https://openid.net/specs/openid-financial-api-ciba-ID1.html'],['RFC 8628, Device Authorization Grant (for contrast)','https://www.rfc-editor.org/rfc/rfc8628']],
ex:{title:'Validate a CIBA request',lang:'js',
run:{call:'hintOk',cases:[{name:'exactly one hint, login_hint',args:['ada@example.com',null,null],expect:true},{name:'exactly one hint, login_hint_token',args:[null,'lht-abc',null],expect:true},{name:'exactly one hint, id_token_hint',args:[null,null,'eyJhbGci'],expect:true},{name:'two hints is a rejection',args:['ada@example.com','lht-abc',null],expect:false},{name:'all three is a rejection',args:['ada@example.com','lht-abc','eyJhbGci'],expect:false},{name:'no hint at all is a rejection',args:[null,null,null],expect:false}]},
prompt:`Write three functions. <code>hintOk(loginHint, loginHintToken, idTokenHint)</code> returns <code>true</code> only when <b>exactly one</b> of the three is non-null: the specification requires one identity hint and forbids more, because two hints naming different people leave the provider guessing which human to wake. <code>notificationTokenRequired(mode)</code> returns <code>true</code> for <code>"ping"</code> and <code>"push"</code>, <code>false</code> for <code>"poll"</code>, and <code>false</code> for anything else including <code>null</code>. <code>bindingMatches(shownOnConsumptionDevice, shownOnAuthDevice)</code> returns <code>true</code> only when both values are non-null and equal, which is the check the human performs out loud.`,
starter:`function hintOk(loginHint, loginHintToken, idTokenHint) {
  return false;
}
function notificationTokenRequired(mode) {
  return false;
}
function bindingMatches(shownOnConsumptionDevice, shownOnAuthDevice) {
  return false;
}`,
solution:`function hintOk(loginHint, loginHintToken, idTokenHint) {
  // exactly one: the provider must know which human to reach, unambiguously
  var supplied = 0;
  if (loginHint != null) supplied = supplied + 1;
  if (loginHintToken != null) supplied = supplied + 1;
  if (idTokenHint != null) supplied = supplied + 1;
  return supplied === 1;
}
function notificationTokenRequired(mode) {
  // ping and push have the provider call the client back, so the client
  // needs a value it can recognize that callback by; poll fetches its own
  return mode === "ping" || mode === "push";
}
function bindingMatches(shownOnConsumptionDevice, shownOnAuthDevice) {
  if (shownOnConsumptionDevice == null || shownOnAuthDevice == null) return false;
  return shownOnConsumptionDevice === shownOnAuthDevice;
}`,
tests:[{d:'exactly one hint is counted, not merely one present',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:supplied\\s*===?\\s*1|1\\s*===?\\s*supplied))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:supplied\\s*===?\\s*1|1\\s*===?\\s*supplied)[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:(?<h1>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:supplied\\s*===?\\s*1)[^{]*?return\\s+\\k<h1>\\b)'},{d:'all three hint parameters are inspected',re:'hintOk\\s*\\([^)]*\\)\\s*\\{(?:[^{}]|\\{[^{}]*\\})*?loginHintToken[\\s\\S]*?idTokenHint'},{d:'ping requires a notification token',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:"ping"|\'ping\'))|(?:case\\s*(?:"ping"|\'ping\')[^;}]*?return\\s+true\\b)|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:"ping"|\'ping\')[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:(?<h2>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:"ping"|\'ping\')[^{]*?return\\s+\\k<h2>\\b)'},{d:'push requires one too',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:"push"|\'push\'))|(?:case\\s*(?:"push"|\'push\')[^;}]*?return\\s+true\\b)|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:"push"|\'push\')[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:(?<h3>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:"push"|\'push\')[^{]*?return\\s+\\k<h3>\\b)'},{d:'poll is not treated as needing one',re:'notificationTokenRequired\\s*\\([^)]*\\)\\s*\\{(?:[^{}]|\\{[^{}]*\\})*?(?:return\\s+(?!\\s*!)[^;{]*(?:"ping"|\'ping\'|"push"|\'push\')|case\\s*(?:"poll"|\'poll\')[^;}]*?return\\s+false\\b|(?:"poll"|\'poll\')[^;{]*\\)\\s*\\{?\\s*return\\s+false)'},{d:'the two displayed messages are compared, not merely present',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:shownOnConsumptionDevice\\s*===?\\s*shownOnAuthDevice|shownOnAuthDevice\\s*===?\\s*shownOnConsumptionDevice))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:shownOnConsumptionDevice\\s*===?\\s*shownOnAuthDevice)[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:(?<h4>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:shownOnConsumptionDevice\\s*===?\\s*shownOnAuthDevice)[^{]*?return\\s+\\k<h4>\\b)'},{d:'a missing binding message is rejected, not merely noticed',re:'bindingMatches\\s*\\([^)]*\\)\\s*\\{(?:[^{}]|\\{[^{}]*\\})*?(?:(?:==\\s*null|!=\\s*null|===?\\s*undefined)[^;{]*\\)\\s*\\{?\\s*return\\s+false\\b|return\\s+(?!\\s*!)[^;{]*(?:!=\\s*null|!==\\s*undefined)[^;{]*&&)'}],
behavior:`hintOk is executed six times. One hint of any of the three kinds passes; two or three fail, and so does none, because "exactly one" is the rule and a solution that merely checks whether a hint is present passes the easy cases and fails here. notificationTokenRequired("ping") and ("push") are true, since both modes have the provider call the client back and the client needs a value to recognize that callback by; ("poll") is false because the client fetches the result itself; anything unknown, and null, is false. bindingMatches("A7F2","A7F2") is true and bindingMatches("A7F2","B119") is false, which is the moment the person on the phone discovers they are being asked to approve a transaction somebody else started. Either value being null is false too, since a prompt with no binding message gives the user nothing to compare.`,
hints:['Count the non-null hints into a variable, then compare that count to one.','Ping and push both have the provider call you back; poll does not.','Guard both binding values against null before comparing them.']}},
{id:'oa8',title:'Native & mobile apps',body:`

<p>Phone and desktop apps are <b>public clients</b>. The binary ships to users, so it cannot hold a secret. The correct flow is <b>Authorization Code + PKCE</b>, opened in the device's <b>system browser</b>, never an embedded WebView. PKCE is Proof Key for Code Exchange, said "pixy". The app invents a random secret at the start of a login, sends a hash of it, and reveals the secret only when it collects the token. An attacker who steals the login code in the middle can't finish without the secret.</p>

<h4>What it's for</h4>
<p>An app installed on a phone or a laptop needs to act for its user against an API: read their mail, post to their account, sync their files. It can't keep a secret, because anyone who downloads it can pull the binary apart. So the login happens in the device's own browser, the app never sees the password, and PKCE stands in for the secret the app can't hold. The one hard part is getting the result from the browser back into the right app, which is what the redirect options below are about.</p>

<h4>When to use it</h4>
<p>Any iOS, Android, macOS, Windows or Linux app with a person who logs in: a mail client, a banking app, a field-service app your technicians carry, a desktop tool that talks to a SaaS API as the signed-in employee. A command-line tool (a program you drive by typing in a terminal) running on a laptop that can open a browser. If the software is installed on the user's own device and the user is present, this is the flow.</p>

<h4>When not to</h4>
<ul>
<li>Your own username-and-password screen inside the app (ROPC). Deprecated. It trains users to type their password into any app and blocks MFA, SSO and passkeys.</li>
<li>The implicit flow (token in the redirect URL). Removed in OAuth 2.1. It put a credential in browser history.</li>
<li>An embedded WebView showing the login page. Use the system browser or the platform's authentication session API, for the reasons below.</li>
<li>A device with no usable browser (a TV, a tool on a remote server). Use the device flow.</li>
<li>A background service with no user. Use Client Credentials.</li>
<li>A single-page web app. Same grant, but a browser has nowhere safe to keep the tokens, so see the BFF lesson.</li>
</ul>

<p><b>Why the system browser?</b> A WebView is controlled by the app. It can read the user's password, defeats SSO (no shared cookies), and blocks passkeys and security keys. The system browser keeps credentials away from the app and reuses the device's login session for true SSO.</p>
<p><b>Getting the redirect back into the app</b>: three options, best last:</p>
<ul>
<li><b>Custom URI scheme</b> (<code>com.example.app:/callback</code>). Simple, but another app can register the same scheme and hijack the code. Always pair with PKCE.</li>
<li><b>Loopback</b> (<code>http://127.0.0.1:PORT</code>), for desktop apps. The app runs a tiny local listener.</li>
<li><b>Claimed HTTPS redirect</b>: iOS <b>Universal Links</b> / Android <b>App Links</b>. A real <code>https://</code> URL your domain proves it owns, which the OS routes straight to your app. <b>Not hijackable; preferred.</b></li>
</ul>

<!--flow:oa8-native-->
<h4>Step by step</h4>
<div class="flowDia"><svg viewBox="0 0 640 370" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Native app: Authorization Code with PKCE in the system browser"><defs><marker id="oa8-native-ah-front" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent)"/></marker><marker id="oa8-native-ah-back" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent2)"/></marker><marker id="oa8-native-ah-attack" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--bad)"/></marker><marker id="oa8-native-ah-x" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--muted)"/></marker></defs><line x1="74" y1="54" x2="74" y2="344" class="fdLife"/><line x1="238" y1="54" x2="238" y2="344" class="fdLife"/><line x1="402" y1="54" x2="402" y2="344" class="fdLife"/><line x1="566" y1="54" x2="566" y2="344" class="fdLife"/><rect x="22.0" y="8" width="104.0" height="46" rx="8" class="fdActor"/><text x="74" y="27" class="fdActorT">Native app</text><text x="74" y="42" class="fdActorS">public client</text><rect x="184.2" y="8" width="107.6" height="46" rx="8" class="fdActor"/><text x="238" y="27" class="fdActorT">Browser</text><text x="238" y="42" class="fdActorS">system browser</text><rect x="307.0" y="8" width="190.0" height="46" rx="8" class="fdActor"/><text x="402" y="35.5" class="fdActorT">Authorization Server</text><rect x="544.1" y="8" width="43.8" height="46" rx="8" class="fdActor"/><text x="566" y="35.5" class="fdActorT">API</text><line x1="77.0" y1="102" x2="233.0" y2="102" stroke="var(--accent)" class="fdArrow" marker-end="url(#oa8-native-ah-front)"/><text x="156.0" y="93" class="fdLabel">opens /authorize (PKCE)</text><circle cx="89.0" cy="102" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="89.0" y="105.5" class="fdNumT" style="fill:var(--accent)">1</text><line x1="241.0" y1="136" x2="397.0" y2="136" stroke="var(--accent)" class="fdArrow" marker-end="url(#oa8-native-ah-front)"/><text x="320.0" y="127" class="fdLabel">user logs in, consents</text><circle cx="253.0" cy="136" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="253.0" y="139.5" class="fdNumT" style="fill:var(--accent)">2</text><line x1="399.0" y1="170" x2="243.0" y2="170" stroke="var(--accent)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#oa8-native-ah-front)"/><text x="320.0" y="161" class="fdLabel">302 to app link, ?code</text><circle cx="387.0" cy="170" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="387.0" y="173.5" class="fdNumT" style="fill:var(--accent)">3</text><line x1="235.0" y1="204" x2="79.0" y2="204" stroke="var(--accent)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#oa8-native-ah-front)"/><text x="156.0" y="195" class="fdLabel">OS routes link to your app</text><circle cx="223.0" cy="204" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="223.0" y="207.5" class="fdNumT" style="fill:var(--accent)">4</text><line x1="77.0" y1="238" x2="397.0" y2="238" stroke="var(--accent2)" class="fdArrow" marker-end="url(#oa8-native-ah-back)"/><text x="238.0" y="229" class="fdLabel">POST /token: code + code_verifier, no secret</text><circle cx="89.0" cy="238" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="89.0" y="241.5" class="fdNumT" style="fill:var(--accent2)">5</text><line x1="399.0" y1="272" x2="79.0" y2="272" stroke="var(--accent2)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#oa8-native-ah-back)"/><text x="238.0" y="263" class="fdLabel">access + refresh + ID tokens</text><circle cx="387.0" cy="272" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="387.0" y="275.5" class="fdNumT" style="fill:var(--accent2)">6</text><line x1="77.0" y1="306" x2="561.0" y2="306" stroke="var(--muted)" class="fdArrow" marker-end="url(#oa8-native-ah-x)"/><text x="320.0" y="297" class="fdLabel">Bearer access token</text><circle cx="89.0" cy="306" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="89.0" y="309.5" class="fdNumT" style="fill:var(--muted)">7</text><text x="320" y="356" class="fdNote">refresh token goes in Keychain/Keystore; the app refreshes silently when the access token expires</text></svg></div>
<ol class="fdSteps">
<li><b>Native app → Browser:</b> opens /authorize (PKCE) <i>(front channel)</i></li>
<li><b>Browser → Authorization Server:</b> user logs in, consents <i>(front channel)</i></li>
<li><b>Authorization Server → Browser:</b> 302 to app link, ?code <i>(front channel)</i></li>
<li><b>Browser → Native app:</b> OS routes link to your app <i>(front channel)</i></li>
<li><b>Native app → Authorization Server:</b> POST /token: code + code_verifier, no secret <i>(back channel)</i></li>
<li><b>Authorization Server → Native app:</b> access + refresh + ID tokens <i>(back channel)</i></li>
<li><b>Native app → API:</b> Bearer access token</li>
</ol>
<p><b>Step 1.</b> The app invents a random PKCE verifier, hashes it into a challenge, and opens the system browser at <code>/authorize</code> with the challenge, its client_id and its redirect URI. The app never draws the login page itself.
<b>Step 2.</b> The user logs in at the authorization server in the real browser. Because it is the device's browser, existing SSO cookies, passkeys and security keys all work. They consent to what the app asked for.
<b>Step 3.</b> The authorization server redirects the browser to the app's claimed <code>https://</code> link with the one-time code in the query string. With a custom scheme the same redirect goes to <code>com.example.app:/callback</code> instead.
<b>Step 4.</b> The operating system recognizes the link as belonging to your app, because it verified your domain when the app was installed, and hands the code to your app and no other.</p>
<p><b>Step 5.</b> The app posts the code and the original verifier to <code>/token</code> over its own connection. There is no client secret. The verifier is the proof that this is the same app that started the login.
<b>Step 6.</b> The server checks that the verifier hashes to the challenge it saw in step 1, then returns an access token, a refresh token and an ID token. The refresh token goes into the Keychain or Keystore, nowhere else.
<b>Step 7.</b> The app calls APIs with the access token as a Bearer token, a token that works for whoever holds it. When it expires, the app uses the refresh token to get a new one without asking the user again.</p>

<h4>Why a custom scheme is weaker than it looks</h4>
<p>Nothing stops a second application on the device from registering <code>com.example.app:/callback</code>. On some platforms a collision resolves in undefined order. On others it goes to whichever app registered most recently. A malicious app that wins the race receives the authorization code meant for you. PKCE makes that theft useless: the attacker has the code but not the verifier, so the exchange fails. That is why PKCE is mandatory for native clients, not advisory.</p>
<p>Claimed HTTPS links close the hole. The operating system verifies your domain's ownership through a file served over TLS at a well-known path, so no other app can claim the URL. The cost is setup: hosting the association file, matching bundle identifiers and signing fingerprints. Many apps ship the weaker option and rely on PKCE alone.</p>

<h4>Where the tokens live on a device</h4>
<p>The platform secure store (Keychain on iOS, Keystore-backed storage on Android) is the only acceptable place for a <b>refresh token</b>, the long-lived token used only to get new short-lived access tokens without logging in again. Keep access tokens short. The store protects against another app reading the value and, with the right flags, against extraction from a backup or from a stolen, locked device. It does not protect against a compromised or rooted device, and it does not stop malware inside your own app's process from using the token.</p>
<p><b>Sender-constrained tokens</b> address that residual risk. With DPoP or mTLS binding, a stolen refresh token cannot be used without the private key it is bound to. On modern devices that key can be generated inside hardware and made non-exportable. Add refresh token rotation and reuse detection and a theft becomes detectable as well as difficult.</p>

<h4>Practical rules for shipping</h4>
<ul>
<li><b>Use AppAuth</b> (iOS/Android) or the platform's own authentication session API rather than opening a browser by hand. Ephemeral sessions, cancellation and interception are easy to get wrong.</li>
<li><b>Never embed a client secret</b> in the binary. It is extractable in minutes, and a secret every user holds is not a secret.</li>
<li><b>Handle the cancel path.</b> Users dismiss the browser. An app that hangs on a pending authorization looks broken.</li>
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



<p>OAuth 2.0 is from 2012. The years since produced a long trail of security advice scattered across
extension RFCs, best-current-practice drafts and errata. <b>OAuth 2.1</b> is the consolidation. It
invents nothing. It <i>folds the accumulated guidance into the base specification</i> and deletes
the parts the community stopped recommending. If you have been following the Security <b>BCP</b>, you are
already writing OAuth 2.1. A BCP is a best current practice: an IETF document that says how to use a
standard safely. For OAuth, the Security BCP is the current list of "do this, never that." The safe path becomes the <i>default</i> path.</p>

<h4>What is removed</h4>
<ul>
<li><b>The Implicit grant</b> (<code>response_type=token</code>). It returned an access token directly
in the URL fragment, so the token passed through browser history and every script on the
page, and there was no way to authenticate the client. Authorization Code with <b>PKCE</b> does the same job
without any of that. PKCE is Proof Key for Code Exchange, said "pixy": the app invents a random secret
at the start of a login, sends a hash of it, and reveals the secret only when it collects the token.
An attacker who steals the login code in the middle can't finish without the secret.</li>
<li><b>The Resource Owner Password Credentials grant</b> (<b>ROPC</b>). The app collects the user's password
itself and posts it to the token endpoint in exchange for a token: credential forwarding. It cannot
support <b>MFA</b>, passkeys or federation, and it teaches users to type their password into applications.
MFA is multi-factor authentication: proving who you are with two different kinds of evidence, usually
something you know (a password) plus something you have (a phone or a security key), so a stolen
password alone isn't enough. Federation is two organizations agreeing that one will trust the other's
logins. A flow that only ever sees a password can do neither.</li>
<li><b>Bearer tokens in query strings.</b> A <b>bearer token</b> works for whoever holds it, like cash,
with no proof of who is presenting it. Tokens must travel in the <code>Authorization</code> header,
not <code>?access_token=</code>, for the reasons that apply to any credential in a URL: logs, history,
referrers.</li>
</ul>

<h4>What becomes mandatory</h4>
<ul>
<li><b>PKCE for every authorization code request</b>, confidential clients included. PKCE defends
against code interception and injection, which a client secret does not address. In practice this is
the biggest change.</li>
<li><b>Exact string matching on redirect URIs.</b> The <b>redirect URI</b> is the address the login
sends the browser back to, with the result attached. If an attacker controls it, they get the result.
So: no wildcards, no prefix matching, no "starts with."
Loose redirect matching is one of the most reliable ways to steal an authorization code.</li>
<li><b>Refresh tokens must be sender-constrained or rotated.</b> A <b>refresh token</b> is the
long-lived token used only to get new short-lived access tokens without logging in again. A
long-lived bearer refresh token in a
public client is the highest-value credential in the system. It must either be bound to a key (DPoP
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
<p>"2.1" sounds more disruptive than it is. Authorization Code,
Client Credentials, Refresh, Device Authorization Grant: all still present and unchanged. Token
formats, scopes, the endpoints, OpenID Connect on top: all the same. There is <b>no protocol
incompatibility</b>. An OAuth 2.1 client talks to an OAuth 2.0 server, provided that
server supports PKCE, which nearly all of them now do.</p>

<h4>What it does not solve</h4>
<p>OAuth 2.1 tightens the flows. It does not address the problems that live above them:</p>
<ul>
<li><b>It is still not authentication.</b> An access token remains a statement about authorization.
OpenID Connect is still how you learn who the user is.</li>
<li><b>Token storage in browsers</b> is out of scope. That is the browser-based apps BCP and the <b>BFF</b>
pattern. A BFF is a backend-for-frontend: a small server that sits between the browser and the APIs
and holds the tokens, so the browser only ever has a cookie and never a token that JavaScript could
steal.</li>
<li><b>Authorization semantics</b> (what a scope means, whether the user owns the record) remain
yours. OAuth never had an opinion on that, and still does not.</li>
</ul>

<h4>The practical checklist</h4>
<p>These questions settle almost everything when assessing an existing integration against OAuth 2.1:</p>
<ol>
<li>Is every authorization code request using PKCE with <code>S256</code>? (Not <code>plain</code>.)</li>
<li>Are redirect URIs matched by exact string comparison, with no wildcard entries registered?</li>
<li>Are refresh tokens rotated with reuse detection, or key-bound?</li>
<li>Is any implicit or password grant still enabled, including for that one legacy client nobody has
migrated?</li>
<li>Does any code path accept a token from a query parameter?</li>
</ol>
<p>Question four is where the real risk usually sits. The grants are removed from the specification, but
authorization servers keep supporting them for compatibility. An enabled-but-unused legacy grant is
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

<p>A single-page app needs to call an API on the user's behalf. Most tutorials run the OAuth flow
in JavaScript, keep the <b>access token</b> in the browser and attach it to fetch calls. The access
token is the short-lived token an app shows an API to prove it may make the call. That is no longer
the recommended approach.</p>

<h4>What it's for</h4>
<p>A web app that runs in the browser (a single-page app, or SPA: one HTML page whose JavaScript draws every screen) needs to call APIs as the logged-in user. The <b>BFF pattern</b> (backend-for-frontend) puts a small server of your own between the browser and the APIs. That server runs the OAuth flow and holds the tokens. The browser gets a session cookie and nothing else. The point is storage. A browser has no place to keep a token that an injected script can't also read, so the pattern moves the token out of the browser altogether.</p>

<h4>When to use it</h4>
<p>Any browser app that handles real data: a customer portal, an admin console, an internal dashboard that calls several APIs. Any SPA that needs a <b>refresh token</b>, because a refresh token must never live in a browser. Any app that used to renew tokens silently in a hidden iframe, now that browsers partition and expire third-party cookies. If a server of yours already serves the app's HTML, the BFF is usually a handful of routes on that same server.</p>

<h4>When not to</h4>
<ul>
<li>A native or desktop app. Use the system browser with PKCE and keep tokens in the Keychain or Keystore (previous lesson).</li>
<li>A backend is truly impossible, such as a static site with no server you control. Then run Authorization Code with PKCE in the browser, keep a short-lived access token in memory only, hold no refresh token, and accept re-authentication on refresh.</li>
<li>A server-rendered app that already has a session. It is already a confidential client with a session, so there is nothing to add.</li>
<li>You expect the BFF to stop XSS. It stops token theft. It does not stop a script acting as the user while the page is open.</li>
<li>Keeping the token in <code>localStorage</code> to avoid running a server. No. That is the pattern the OAuth Security BCP (the IETF document that says how to use OAuth safely) exists to discourage.</li>
</ul>

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
<p><b>Step 1.</b> The user clicks log in. The request goes to the BFF, which lives on the same origin as the page.
<b>Step 2.</b> The BFF starts the Authorization Code flow as a confidential client. The login redirect still passes through the browser, but the code lands on the BFF's callback URL, and the BFF exchanges it at the token endpoint with its own client secret.
<b>Step 3.</b> The authorization server returns the access, refresh and ID tokens to the BFF. It keeps them server-side, tied to a session record.
<b>Step 4.</b> The BFF answers the browser with a session cookie. <code>HttpOnly</code> means JavaScript can't read it. <code>Secure</code> means HTTPS only. <code>SameSite</code> means the browser won't attach it to requests started from another site.</p>
<p><b>Step 5.</b> The page calls <code>/api/…</code> on its own origin. The browser attaches the cookie by itself. No token, no Authorization header, no cross-origin request.
<b>Step 6.</b> The BFF looks up the session, finds the access token and forwards the same call to the real API with the token as a Bearer token. If the token has expired, it uses the refresh token first.
<b>Step 7.</b> The API answers the BFF.
<b>Step 8.</b> The BFF relays the answer to the page. At no point did the browser see a token.</p>

<h4>The problem is the storage</h4>
<p>Authorization Code with <b>PKCE</b> fixed the <i>flow</i> for public clients. PKCE is Proof Key for
Code Exchange, said "pixy": the app invents a random secret at the start of a login, sends a hash of
it, and reveals the secret only when it collects the token, so an attacker who steals the login code
in the middle can't finish without the secret. It cannot fix the fact that a
browser has nowhere safe to put the result:</p>
<ul>
<li><b><code>localStorage</code></b>, readable by any JavaScript on the page. One compromised
dependency, one <b>XSS</b>, and the token is exfiltrated. XSS is cross-site scripting: an attacker
gets their JavaScript to run inside a page you trust, at which point it can read anything that page
can, including tokens kept in the browser. It also persists across tabs and restarts, so the
window of exposure is long.</li>
<li><b><code>sessionStorage</code></b>, the same exposure, with a shorter life.</li>
<li><b>A JavaScript variable</b>: better, since nothing is persisted, but still readable by any script
in the same context, and lost on every refresh.</li>
</ul>
<p><b>If your app can read the token, so can any script injected
into your app.</b> The token has to be readable for the app to use it.</p>
<p>There is a second problem. Browsers now partition and expire third-party
cookies, which breaks the silent-renew mechanisms SPAs relied on to refresh tokens without a redirect.</p>

<h4>The BFF pattern</h4>
<p>A <b>backend-for-frontend</b> is a small server-side component that belongs to your frontend. It
holds the tokens. The browser holds only a session cookie.</p>
<table class="cmp"><thead><tr><th>Without a BFF</th><th>With a BFF</th></tr></thead><tbody>
<tr><td>browser &rarr; API, with the token in JavaScript</td><td>browser &rarr; BFF with a cookie; BFF &rarr; API with the token</td></tr>
<tr><td>token readable by any script</td><td>token never leaves the server</td></tr>
<tr><td>refresh token in the browser</td><td>browser holds an <code>HttpOnly</code> cookie</td></tr>
<tr><td>CORS on every API</td><td>same-origin calls, no CORS</td></tr>
</tbody></table>
<p>The browser now has no token at all. XSS can still make requests as the user while the page is open, but it cannot steal a durable credential.</p>
<p>The BFF is a confidential client. It has a real secret, so it can use the strongest client
authentication, and it holds refresh tokens where they belong. A <b>refresh token</b> is the
long-lived token used only to get new short-lived access tokens without logging in again, which is
exactly the kind of thing a browser shouldn't hold. The browser's session cookie should be
<code>HttpOnly</code>, <code>Secure</code> and <code>SameSite=Lax</code> or stricter, invisible to
JavaScript by construction.</p>

<h4>What this does and does not buy</h4>
<p>BFF is sometimes oversold. It <b>eliminates token theft</b>: there is no durable
credential in the browser to exfiltrate, so an XSS that fires once cannot grant lasting access. It does
<b>not</b> eliminate XSS damage. Injected script can still call the BFF with the user's cookie and act
as them while the page is open. An attacker with a token can use it from anywhere for an hour. An attacker with XSS is confined to
a live session in the victim's browser.</p>
<p>The costs: you now operate a server component, and because the browser authenticates with a
cookie, you have reintroduced <b>CSRF</b>, which cookie-based apps have always had to handle. CSRF is
cross-site request forgery: a malicious page makes your browser send a request to a site you're
logged into, and the site can't tell it wasn't you. The browser attaches your cookies automatically,
which is the whole problem.
<code>SameSite</code> cookies plus a per-session CSRF token on state-changing requests is the standard
answer.</p>

<h4>Choosing</h4>
<div class="codeSample" data-hl>BFF                        default for anything handling real data
                           tokens server-side, cookie to the browser

Token in memory + PKCE     acceptable when a backend is genuinely impossible:
                           short-lived access token, NO refresh token in the
                           browser, accept re-authentication on refresh

localStorage               no. this is the pattern the BCP exists to discourage</div>
<p>The BFF turns your SPA back into a <b>confidential client</b>
with a session, which is what server-rendered applications were doing all along.</p>`,
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

<p>An <b>access token</b> is the short-lived token an app shows an API to prove it may make the call.
Access tokens come in two styles, and the choice has consequences:</p>
<ul>
<li><b>By-value (JWT)</b>: a <b>JWT</b> is a JSON Web Token, a small signed document, three base64 pieces
separated by dots, that carries claims such as who the user is and when the token expires. A
<b>claim</b> is one fact inside the token: a name, an email, an expiry time. Anyone can read a JWT;
only the issuer can produce a valid signature. So the token <i>contains</i> the claims, signed. Any resource server verifies it <b>offline</b> by checking the signature. Fast, no call back to the issuer. Downsides: it is <b>readable</b> by anyone who holds it (base64, not secret), it is <b>bigger</b>, and it is <b>hard to revoke</b> before it expires. It is valid until <code>exp</code>.</li>
<li><b>By-reference (opaque)</b>: the token is a <b>random string</b> with no data in it. To use it, the resource server calls the Authorization Server's <b>introspection</b> endpoint (RFC 7662) to ask "is this active, and what are its claims?" Upsides: <b>instant revocation</b> (the AS stops saying "active"), <b>nothing leaks</b> to the client, and it is small. Downside: a network call per validation (cache it).</li>
</ul>
<p><b>The split-token / phantom-token pattern</b> gives you both. The client only ever sees an <b>opaque</b> token. At the edge, the <b>API gateway</b> introspects (or exchanges) it and forwards a short-lived <b>JWT</b> to the internal microservices:</p>
<!--flow:oa9-split-->
<div class="flowDia"><svg viewBox="0 0 640 320" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Phantom / split-token pattern"><defs><marker id="oa9-split-ah-front" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent)"/></marker><marker id="oa9-split-ah-back" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent2)"/></marker><marker id="oa9-split-ah-attack" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--bad)"/></marker><marker id="oa9-split-ah-x" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--muted)"/></marker></defs><line x1="74" y1="54" x2="74" y2="294" class="fdLife"/><line x1="238" y1="54" x2="238" y2="294" class="fdLife"/><line x1="402" y1="54" x2="402" y2="294" class="fdLife"/><line x1="566" y1="54" x2="566" y2="294" class="fdLife"/><rect x="1.0" y="8" width="146.0" height="46" rx="8" class="fdActor"/><text x="74" y="27" class="fdActorT">Client</text><text x="74" y="42" class="fdActorS">browser or 3rd party</text><rect x="181.7" y="8" width="112.6" height="46" rx="8" class="fdActor"/><text x="238" y="27" class="fdActorT">API Gateway</text><text x="238" y="42" class="fdActorS">your edge</text><rect x="307.0" y="8" width="190.0" height="46" rx="8" class="fdActor"/><text x="402" y="35.5" class="fdActorT">Authorization Server</text><rect x="505.4" y="8" width="121.2" height="46" rx="8" class="fdActor"/><text x="566" y="27" class="fdActorT">Microservice</text><text x="566" y="42" class="fdActorS">internal</text><line x1="77.0" y1="102" x2="233.0" y2="102" stroke="var(--accent)" class="fdArrow" marker-end="url(#oa9-split-ah-front)"/><text x="156.0" y="93" class="fdLabel">opaque token</text><circle cx="89.0" cy="102" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="89.0" y="105.5" class="fdNumT" style="fill:var(--accent)">1</text><line x1="241.0" y1="136" x2="397.0" y2="136" stroke="var(--accent2)" class="fdArrow" marker-end="url(#oa9-split-ah-back)"/><text x="320.0" y="127" class="fdLabel">introspect (once)</text><circle cx="253.0" cy="136" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="253.0" y="139.5" class="fdNumT" style="fill:var(--accent2)">2</text><line x1="399.0" y1="170" x2="243.0" y2="170" stroke="var(--accent2)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#oa9-split-ah-back)"/><text x="320.0" y="161" class="fdLabel">claims, or a signed JWT</text><circle cx="387.0" cy="170" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="387.0" y="173.5" class="fdNumT" style="fill:var(--accent2)">3</text><rect x="98.0" y="204.0" width="280.0" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="238.0" y="219.0" class="fdSelfT">forwards or mints a short-lived JWT</text><circle cx="98.0" cy="215.0" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="98.0" y="218.5" class="fdNumT" style="fill:var(--muted)">4</text><line x1="241.0" y1="256" x2="561.0" y2="256" stroke="var(--accent2)" class="fdArrow" marker-end="url(#oa9-split-ah-back)"/><text x="402.0" y="247" class="fdLabel">JWT: verified offline, no AS call</text><circle cx="253.0" cy="256" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="253.0" y="259.5" class="fdNumT" style="fill:var(--accent2)">5</text><text x="320" y="306" class="fdNote">outward = opaque: revocable, leaks nothing. inward = JWT: self-contained, fast offline verification</text></svg></div>
<ol class="fdSteps">
<li><b>Client → API Gateway:</b> opaque token <i>(front channel)</i></li>
<li><b>API Gateway → Authorization Server:</b> introspect (once) <i>(back channel)</i></li>
<li><b>Authorization Server → API Gateway:</b> claims, or a signed JWT <i>(back channel)</i></li>
<li><b>API Gateway:</b> forwards or mints a short-lived JWT</li>
<li><b>API Gateway → Microservice:</b> JWT: verified offline, no AS call <i>(back channel)</i></li>
</ol>
<p><b>Benefits:</b> instant revocation and no data exposure on the public side, JWT performance on the internal side. Internal services never call the AS. This is a common production architecture (e.g. a gateway in front of a mesh).</p>

<h4>The same stateful/stateless trade, one layer up</h4>
<p>The Foundations stream framed sessions versus tokens as stateful versus stateless. Access tokens face the
same decision.</p>
<table class="cmp"><thead><tr><th>Opaque</th><th>JWT</th></tr></thead><tbody>
<tr><td>A random string. Means nothing to anyone but the issuer.</td><td>Self-describing: the claims are inside, signed.</td></tr>
<tr><td>The API must <b>ask</b> the issuer (introspection, RFC 7662).</td><td>The API verifies the signature <b>locally</b> against a cached public key.</td></tr>
<tr><td>Revocation is <b>instant</b>: stop returning <code>active:true</code>.</td><td>Valid until <code>exp</code>, whatever you do.</td></tr>
<tr><td>Tiny.</td><td>Hundreds of bytes to several KB, on every single request.</td></tr>
<tr><td>Reveals nothing if it leaks.</td><td>Readable by anyone holding it. <b>Never</b> put anything sensitive in one.</td></tr>
<tr><td>A network call per request.</td><td>No call, no dependency, no latency.</td></tr>
</tbody></table>

<h4>Introspection is a real dependency</h4>
<p>Opaque tokens sound safer until you count the calls. Every request to every service now makes a
synchronous call to the authorization server before it can do anything. That is latency on every hop, load
on the AS proportional to your total traffic, and <b>the authorization server is
now in the availability path of your entire estate</b>. When it is slow, everything is slow. When it is
down, nothing works.</p>
<p>Caching introspection responses helps and reintroduces the staleness you were avoiding. A cached
<code>active: true</code> is a revocation you have not honored yet. You do not get both properties for free.</p>

<h4>The split-token pattern</h4>
<p>Large platforms get most of both by <b>issuing an opaque
token to the outside world and a JWT inside</b>.</p>
<p>The edge introspects the opaque token once, or looks it up locally, and mints a short-lived JWT for the services behind it. What you get:</p>
<ul>
<li><b>Instant revocation at the edge.</b> The opaque token stops working.</li>
<li><b>No per-hop AS dependency inside.</b> Services verify a signature.</li>
<li><b>Nothing readable leaks to the client.</b> The JWT never leaves.</li>
<li>The internal JWT can be <b>audience-narrowed per hop</b> (token exchange).</li>
</ul>
<p>The cost is a gateway that must be there and must be fast. That is a real piece of infrastructure, so
this pattern belongs to platforms with enough services to justify it, not to a single application.</p>

<h4>How to choose</h4>
<p><b>Opaque</b> when revocation must be immediate, when the client is a browser or a third party, or when
the token would otherwise carry anything you do not want read. <b>JWT</b> for internal service-to-service
calls where the audience is narrow, the lifetime is short, and the availability win is worth the revocation
lag. <b>Split</b> when you have both problems and a gateway already.</p>
<p><b>A JWT's expiry is your revocation policy.</b> If a
fifteen-minute window between disabling an account and its tokens dying is acceptable, JWTs are fine. If it
is not, no design makes them fine. You need a lookup somewhere, and the only question is where
you put it.</p>`,
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



<p>Every OAuth flow exists for a specific situation. The full map of <b>what each is for, and when to use it</b>:</p>
<ul>
<li><b>Authorization Code + PKCE</b>: <i>any app acting for a user</i>: server web apps, SPAs, and mobile/native. <b>The default for user login.</b> PKCE is Proof Key for Code Exchange, said "pixy": the app invents a random secret at the start of a login, sends a hash of it, and reveals the secret only when it collects the token, so an attacker who steals the login code in the middle can't finish without the secret.</li>
<li><b>Client Credentials</b>: <i>machine-to-machine</i>, no user (a backend/daemon calling an API as itself).</li>
<li><b>Device Authorization</b>: <i>input-constrained devices</i>: TVs, CLIs, IoT (enter a code on your phone).</li>
<li><b>Refresh Token</b>: <i>renew</i> an access token without sending the user back through login.</li>
<li><b>Hybrid (OIDC)</b>: returns a <code>code</code> and an <code>id_token</code> together. <b>OIDC</b> is OpenID Connect, a thin layer on top of OAuth that adds the missing piece: a signed statement of who logged in, called an ID token. OAuth answers "what may this app do"; OIDC answers "who is this person." Hybrid is niche, for apps that need that ID token immediately at the front channel.</li>
<li><b>CIBA</b> (Client-Initiated Backchannel Authentication), <i>decoupled</i> auth: the user approves on a <b>separate device</b> (e.g. a call-center agent triggers a push the customer approves on their phone).</li>
<li><b>Token Exchange</b> (RFC 8693), <i>swap one token for another</i>: delegation and service-to-service (the next stream), and impersonation.</li>
<li><b>Implicit</b>: <b>deprecated</b> (SPAs once used it; use Code + PKCE).</li>
<li><b>ROPC / password</b>: <b>deprecated</b>. ROPC is resource owner password credentials, the flow where the app collects your username and password itself and trades them for a token. Never for new systems.</li>
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
<p><b>Is a user involved?</b> No means Client Credentials, nothing else. <b>Can the device show a browser and take input?</b> No means the Device grant (a TV, a CLI on a headless box), or CIBA when the user has a registered second device and the request originates elsewhere, such as a call center. <b>Can the client keep a secret?</b> A server-side app can. It authenticates itself at the token endpoint, ideally with <code>private_key_jwt</code> or mTLS rather than a shared string. A browser app or a mobile app cannot, whatever it looks like. Anything shipped to a user's device is public, and PKCE exists to compensate for that.</p>
<p>For new systems that collapses to one sentence: <b>Authorization Code with PKCE unless there is no user, in which case Client Credentials.</b> Everything else is a special case with a specific justification.</p>

<h4>Why the deprecated ones are deprecated</h4>
<p><b>Implicit</b> returned the access token in the URL fragment, where it landed in browser history and in reach of every script on the page, with no client authentication and no way to bind the response to the request. PKCE plus the code flow gives the same capability without any of that. <b>ROPC</b> has the application collect the user's password directly, which defeats the purpose of federation. It trains users to type their corporate password into third-party forms, cannot support <b>MFA</b> properly, and cannot be used with an external <b>IdP</b> at all. MFA is multi-factor authentication: proving who you are with two different kinds of evidence, usually something you know (a password) plus something you have (a phone or a security key), so a stolen password alone isn't enough. An IdP is an identity provider, the system that holds the accounts and does the actual logging in, then tells other applications who you are. A flow that only ever sees a password can't hand off to either. Both are removed in OAuth 2.1. When you meet them, they are almost always a migration artifact, and the migration is the work.</p>

<h4>Refresh tokens are not a flow</h4>
<p>A refresh token is not a way to <i>obtain</i> authorization. It keeps one alive. It is issued by another grant and exchanged at the token endpoint, and its security properties are about what happens if it leaks. That is why public clients must have rotation with reuse detection. A refresh token with no rotation, no expiry and no binding is a password that never changes.</p>`,
docs:[['OAuth 2.0 grant types','https://oauth.net/2/grant-types/'],['OAuth 2.1 (consolidated best practice)','https://oauth.net/2.1/'],['OpenID Connect CIBA Core 1.0 (decoupled authentication)','https://openid.net/specs/openid-client-initiated-backchannel-authentication-core-1_0.html']],
}
,
{id:'oascope',title:'Designing a scope model: what to name, how finely, and what a scope must never be',body:`



<p>A <b>scope</b> is the named permission an app asks for, such as <code>calendar.read</code>. Every
lesson so far has treated scopes as something the authorization server hands you. If you build
an API, they are something you <b>design</b>. Scope strings appear on consent screens, in every
integration guide, in every client registration, and in tokens already issued. A scope is close to
impossible to remove once anyone depends on it. The catalog you publish in week one is the one you
operate for years.</p>

<h4>A scope is a unit of consent, not a unit of code</h4>
<p>That settles most granularity arguments. The question is not "how many endpoints do
I have?" but <b>"would a reasonable person make a different decision about these two things?"</b> If the
answer is no, they are one scope.</p>
<div class="codeSample" data-hl>TOO COARSE   scope=api
             every client that integrates at all holds everything you
             will ever build. the consent screen says nothing. the
             blast radius of any one integration is the whole product.

TOO FINE     scope=invoices:line-items:read
             a consent screen with forty checkboxes is read by nobody,
             and every new endpoint becomes a client-registration change
             for every integrator you have.

ABOUT RIGHT  scope=invoices:read  invoices:write  payments:initiate
             each names something a user would separately agree to,
             and reading is separated from writing, always.</div>
<p>Read and write are the one split to make even when it feels excessive. "See my invoices" and
"create invoices as me" are different decisions to a human. The read-only client is the common case,
so collapsing them means every integration holds write access it never uses.</p>

<h4>Naming, and what not to put in the string</h4>
<p><code>resource:action</code> is the convention that survives a real catalog:
<code>invoices:read</code>, <code>payments:initiate</code>. It sorts, it reads on a consent
screen, and it tells an engineer where to enforce it. Three things do not belong in a scope string:</p>
<ul>
<li><b>An instance.</b> <code>payment:50:GB29NWBK</code> is a structured object badly encoded. That is
what <b>RAR</b> exists for. RAR is Rich Authorization Requests: instead of a flat scope string, the app
sends a small JSON description of exactly what it wants, so a grant can say "pay 50 euros to this
account, once" rather than just "payments." Scopes are categories, not particulars.</li>
<li><b>A tenant or an environment.</b> A <b>tenant</b> is one customer organization inside a shared
system. <code>invoices:read:acme-prod</code> multiplies your catalog by
your customer list. Tenancy belongs in the token's claims and in the resource server's ownership check.</li>
<li><b>A wildcard.</b> A scope that matches other scopes has the same problem as a wildcard redirect
URI. It is a grant nobody reviewed, expressed as a pattern.</li>
</ul>
<p>Where the token may be used is a separate question from what it permits. That is what resource
indicators do, in the threats stream: <b>scope answers what, audience answers where.</b> A catalog that
encodes the target API into the scope name is rebuilding <code>aud</code> badly.</p>

<h4>The rule the resource server must not forget</h4>
<p>A scope bounds the <i>client's</i> delegation. It says nothing about what the <i>user</i> may do. The
effective answer is the intersection of the two:</p>
<div class="codeSample" data-hl>token scope   invoices:write        the app was granted write
user          a read-only clerk     the human may not write
              ------------------------------------------------
answer        DENY

// an API that checks only the scope has let an application escalate
// its user's privileges. an API that checks only the user's role has
// ignored the bounds of the delegation. both checks, every time.</div>
<p>This is why a scope called <code>admin</code> is a design smell rather than a permission. A resource
server that sees it stops asking the second question.</p>

<h4>Ask for less, later</h4>
<p><b>Incremental authorization</b> makes a fine-grained catalog usable. Request the
minimum at first login, and ask for the rest when the user does the thing that needs it, when
the reason is obvious. Consent rates rise and the standing grant shrinks.</p>
<p>Two mechanics make it safe. Downstream, <b>token exchange</b> narrows a token for the next hop, and
narrowing is the only legal direction. A service may spend less authority than it holds and never more.
Upstream, check whether your authorization server <i>adds</i> the new scope to the existing grant or
<i>replaces</i> it. A replace can drop permissions the user already agreed to. The Grant Management
API in the <b>FAPI</b> lesson exists to make that explicit. FAPI is financial-grade API, the strictest
profile of OAuth and OpenID Connect, written for banking, with every optional protection made mandatory.</p>

<h4>Operating the catalog</h4>
<p>Give the scope list an owner, review it on a schedule, and record for every scope what it permits,
which endpoints enforce it, and who consumes it. You cannot delete a scope that clients hold, but you
can stop issuing it, deprecate it in the documentation and watch the number of tokens carrying it fall
to zero. That measurement tells you when retirement is safe.</p>`,
docs:[['RFC 6749 §3.3, Access Token Scope','https://www.rfc-editor.org/rfc/rfc6749#section-3.3'],['RFC 9396, Rich Authorization Requests','https://www.rfc-editor.org/rfc/rfc9396'],['RFC 8707, Resource Indicators','https://www.rfc-editor.org/rfc/rfc8707'],['RFC 8693, Token Exchange','https://www.rfc-editor.org/rfc/rfc8693']],
ex:{title:'Enforce the scope rules a catalog depends on',lang:'js',
run:{call:'permitted',cases:[{name:'scope granted and the user is entitled',args:[['invoices:read','invoices:write'],'invoices:write',true],expect:true},{name:'scope granted but the user is not entitled',args:[['invoices:read','invoices:write'],'invoices:write',false],expect:false},{name:'user entitled but the scope was never granted',args:[['invoices:read'],'invoices:write',true],expect:false},{name:'neither holds',args:[['invoices:read'],'payments:initiate',false],expect:false},{name:'an empty grant permits nothing',args:[[],'invoices:read',true],expect:false},{name:'a missing grant list permits nothing',args:[null,'invoices:read',true],expect:false}]},
prompt:`Write three functions. <code>permitted(grantedScopes, requiredScope, userEntitled)</code> returns <code>true</code> only when <code>grantedScopes</code> is a non-null array containing <code>requiredScope</code> <b>and</b> <code>userEntitled</code> is true: the effective answer is the intersection of the delegation and the user's own permissions, never either one alone. <code>downscopeOk(held, requested)</code> returns <code>true</code> only when both are non-null arrays, <code>requested</code> is non-empty, and <b>every</b> requested scope appears in <code>held</code>: a token may be narrowed and never widened. <code>wellFormed(scope)</code> returns <code>true</code> only for a <code>resource:action</code> string with exactly one colon, a non-empty half on each side, and no <code>"*"</code> anywhere.`,
starter:`function permitted(grantedScopes, requiredScope, userEntitled) {
  return false;
}
function downscopeOk(held, requested) {
  return false;
}
function wellFormed(scope) {
  return false;
}`,
solution:`function permitted(grantedScopes, requiredScope, userEntitled) {
  // BOTH halves: the scope bounds the app, the entitlement bounds the human
  return grantedScopes != null
      && requiredScope != null
      && grantedScopes.indexOf(requiredScope) >= 0
      && userEntitled === true;
}
function downscopeOk(held, requested) {
  // narrowing only, and an empty request is not narrowing: it is asking
  // for a token with no bounds at all
  return held != null
      && requested != null
      && requested.length > 0
      && requested.every(s => held.indexOf(s) >= 0);
}
function wellFormed(scope) {
  if (scope == null || scope.indexOf("*") >= 0) return false;   // no wildcards
  var parts = scope.split(":");                                 // resource:action
  return parts.length === 2 && parts[0].length > 0 && parts[1].length > 0;
}`,
tests:[{d:'the granted scope is checked',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:grantedScopes\\s*\\.\\s*(?:indexOf|includes)\\s*\\(\\s*requiredScope))|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:grantedScopes\\s*\\.\\s*(?:indexOf|includes)\\s*\\(\\s*requiredScope)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<p1>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:grantedScopes\\s*\\.\\s*(?:indexOf|includes)\\s*\\(\\s*requiredScope)[^{]*?return\\s+\\k<p1>\\b)'},{d:'and the user entitlement is required as well, in the same decision',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:grantedScopes\\s*\\.\\s*(?:indexOf|includes)\\s*\\(\\s*requiredScope)[^;{]*&&[^;{]*userEntitled)|(?:return\\s+(?!\\s*!)[^;{]*userEntitled[^;{]*&&[^;{]*(?:grantedScopes\\s*\\.\\s*(?:indexOf|includes)\\s*\\(\\s*requiredScope))|(?:if\\s*\\(\\s*!\\s*userEntitled[^;{]*\\)\\s*\\{?\\s*return\\s+false)'},{d:'every requested scope must already be held',re:'(?:return\\s+(?!\\s*!)[^;{]*requested\\s*\\.\\s*(?:every|filter)\\s*\\()|(?:held\\s*\\.\\s*(?:indexOf|includes)\\s*\\([^)]*\\)\\s*(?:<\\s*0|===?\\s*-\\s*1)?\\s*\\)\\s*\\{?\\s*return\\s+false\\b)'},{d:'an empty request is refused rather than trivially satisfied',re:'(?:return\\s+(?!\\s*!)[^;{]*requested\\s*\\.\\s*length\\s*(?:>\\s*0|>=\\s*1|!==?\\s*0))|(?:requested\\s*\\.\\s*length\\s*(?:===?\\s*0|<\\s*1|<=\\s*0)[^;{]*\\)\\s*\\{?\\s*return\\s+false\\b)'},{d:'a wildcard scope is rejected',re:'wellFormed\\s*\\([^)]*\\)\\s*\\{(?:[^{}]|\\{[^{}]*\\})*?(?:indexOf\\s*\\(\\s*"\\*"\\s*\\)|includes\\s*\\(\\s*"\\*"\\s*\\))[^;{]*\\)?\\s*\\{?\\s*return\\s+false'},{d:'the resource:action shape is enforced with exactly one colon',re:'(?:split\\s*\\(\\s*(?:":"|\\x27:\\x27)\\s*\\)[\\s\\S]{0,200}?return\\s+(?!\\s*!)[^;{]*\\.\\s*length\\s*===?\\s*2)|(?:\\.\\s*length\\s*!==?\\s*2[^;{]*\\)\\s*\\{?\\s*return\\s+false\\b)'},{d:'both halves must be non-empty',re:'(?:return\\s+(?!\\s*!)[^;{]*parts\\s*\\[\\s*0\\s*\\]\\s*\\.\\s*length[^;{]*&&[^;{]*parts\\s*\\[\\s*1\\s*\\]\\s*\\.\\s*length)|(?:if\\s*\\(\\s*[^;{]*parts\\s*\\[\\s*[01]\\s*\\]\\s*\\.\\s*length\\s*(?:===?\\s*0|<\\s*1)[^;{]*\\)\\s*\\{?\\s*return\\s+false)'}],
behavior:`permitted is executed six times, and the second and third cases are the point of the exercise. In the second, the token carries invoices:write and the human is a read-only clerk: the correct answer is deny, and a resource server that checks only the scope has just let an application escalate its user's privileges. In the third the human may write and the app was never granted it: also deny, and an API that checks only the user's role has ignored the bounds of the delegation. A null or empty grant list permits nothing rather than throwing. downscopeOk(["a","b"],["a"]) is true because narrowing is the legal direction; downscopeOk(["a"],["a","b"]) is false because a service may spend less authority than it holds and never more; an empty request is false rather than vacuously true, since "every element of nothing" is a trap that would let a caller ask for a token with no bounds at all. wellFormed("invoices:read") is true, while "invoices", "invoices:read:eu", ":read", "invoices:" and anything containing an asterisk are false.`,
hints:['Both conditions belong in one expression: the scope check and the entitlement check.','Narrowing means every requested scope is already held; an empty request is not narrowing.','Split on the colon and count the parts before you look at them.']}},
{id:'oa3p',title:'Third-party integrations & unsolicited assertions',body:`

<p>Most OAuth in the wild is <b>integrating with a third party</b>: "Log in with Google," a GitHub App that opens pull requests, a Slack app that posts messages, or an enterprise customer single-signing-on into your SaaS. In every case two independent organizations must establish <b>trust</b> before any token flows.</p>

<h4>What it's for</h4>
<p>Two organizations that share no database and no administrator need to believe each other's messages: a login result from Google, a webhook from a payment provider, a SAML assertion from a customer's identity provider. The integration flow sets that trust up once, at registration, and then uses it on every message. Each side publishes a public key and keeps its private key. The other side verifies signatures against the published key, never against anything the message carries. The rest of the lesson is what to check when a signed message arrives, including one nobody asked for.</p>

<h4>When to use it</h4>
<p>"Log in with Google" or any other social login on a consumer app. A GitHub App that opens pull requests, or a Slack app that posts messages, acting inside someone else's platform. An enterprise customer whose staff should single-sign-on into your SaaS from their own IdP, over SAML or OIDC. A provider that calls your webhook when a payment settles. Anywhere a message will arrive from a party you don't operate, and you have to decide whether to believe it, this is the pattern.</p>

<h4>When not to</h4>
<ul>
<li>Two services inside your own company under one authorization server. That is Client Credentials or token exchange, not a third-party integration.</li>
<li>Accepting an assertion from any IdP that presents one. Trust is pre-configured. A valid signature from an unknown key proves nothing.</li>
<li>IdP-initiated SSO when the portal could start an SP-initiated flow instead. In OIDC, <code>initiate_login_uri</code> does that.</li>
<li>Verifying a token against a key or certificate the message itself supplies. Keys come from the provider's published JWKS or metadata.</li>
<li>Pinning one key or pasting the provider's certificate into your config. Discover keys; they rotate on the provider's schedule.</li>
</ul>

<p><b>How trust is established.</b> You register your application with the provider. In OAuth or <b>OIDC</b> you
receive a <code>client_id</code> and usually a <code>client_secret</code>. OIDC is OpenID Connect, a thin
layer on top of OAuth that adds the missing piece: a signed statement of who logged in, called an ID
token. OAuth answers "what may this app do"; OIDC answers "who is this person." In <b>SAML</b> you exchange metadata
containing an X.509 certificate. SAML is Security Assertion Markup Language, the older, XML-based
standard for single sign-on between companies. The identity provider sends the application a signed XML
document, an <b>assertion</b>, saying who the user is. It's still what most enterprise single sign-on runs on.</p>
<p>Each side <b>publishes its public key</b> so
the other can verify its signatures. Each side <b>keeps its private key</b>, so only it can produce them.
The provider publishes signing keys at a <b>JWKS</b> URL, or inside SAML metadata. A JWKS is a JSON Web
Key Set: a list of public keys written as JSON, published at a well-known URL so anyone can fetch the
keys and check the issuer's signatures. Your application verifies
against those, not against anything the message itself supplies.</p>
<p>Webhooks are the same idea with a symmetric key. A shared secret produces an <b>HMAC</b> over the payload, and
you recompute it to confirm the message was not forged. An HMAC is a keyed fingerprint: a hash of the
message mixed with the secret, so only someone holding the same secret can produce or check it.</p>

<!--flow:oa3p-thirdparty-->
<h4>Step by step</h4>
<div class="flowDia"><svg viewBox="0 0 640 406" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Third-party integration: establishing trust, then verifying what arrives"><defs><marker id="oa3p-thirdparty-ah-front" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent)"/></marker><marker id="oa3p-thirdparty-ah-back" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent2)"/></marker><marker id="oa3p-thirdparty-ah-attack" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--bad)"/></marker><marker id="oa3p-thirdparty-ah-x" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--muted)"/></marker></defs><line x1="74" y1="54" x2="74" y2="380" class="fdLife"/><line x1="320" y1="54" x2="320" y2="380" class="fdLife"/><line x1="566" y1="54" x2="566" y2="380" class="fdLife"/><rect x="10.6" y="8" width="126.8" height="46" rx="8" class="fdActor"/><text x="74" y="27" class="fdActorT">Provider</text><text x="74" y="42" class="fdActorS">identity provider</text><rect x="253.4" y="8" width="133.2" height="46" rx="8" class="fdActor"/><text x="320" y="27" class="fdActorT">Your app</text><text x="320" y="42" class="fdActorS">SP / relying party</text><rect x="496.2" y="8" width="139.6" height="46" rx="8" class="fdActor"/><text x="566" y="27" class="fdActorT">Attacker</text><text x="566" y="42" class="fdActorS">replay or injection</text><line x1="317.0" y1="102" x2="79.0" y2="102" stroke="var(--muted)" class="fdArrow" marker-end="url(#oa3p-thirdparty-ah-x)"/><text x="197.0" y="93" class="fdLabel">register the app, exchange metadata</text><circle cx="305.0" cy="102" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="305.0" y="105.5" class="fdNumT" style="fill:var(--muted)">1</text><line x1="77.0" y1="136" x2="315.0" y2="136" stroke="var(--muted)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#oa3p-thirdparty-ah-x)"/><text x="197.0" y="127" class="fdLabel">client_id/secret, or metadata + cert</text><circle cx="89.0" cy="136" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="89.0" y="139.5" class="fdNumT" style="fill:var(--muted)">2</text><line x1="317.0" y1="170" x2="79.0" y2="170" stroke="var(--accent2)" class="fdArrow" marker-end="url(#oa3p-thirdparty-ah-back)"/><text x="197.0" y="161" class="fdLabel">GET JWKS: the published public keys</text><circle cx="305.0" cy="170" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="305.0" y="173.5" class="fdNumT" style="fill:var(--accent2)">3</text><line x1="77.0" y1="204" x2="315.0" y2="204" stroke="var(--accent)" class="fdArrow" marker-end="url(#oa3p-thirdparty-ah-front)"/><text x="197.0" y="195" class="fdLabel">login result: signed token/assertion</text><circle cx="89.0" cy="204" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="89.0" y="207.5" class="fdNumT" style="fill:var(--accent)">4</text><rect x="165.6" y="238.0" width="308.8" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="320.0" y="253.0" class="fdSelfT">verify signature with the PUBLISHED key</text><circle cx="165.6" cy="249.0" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="165.6" y="252.5" class="fdNumT" style="fill:var(--muted)">5</text><line x1="563.0" y1="290" x2="325.0" y2="290" stroke="var(--bad)" class="fdArrow" marker-end="url(#oa3p-thirdparty-ah-attack)"/><text x="443.0" y="281" class="fdLabel fdLabelBad">unsolicited assertion, nothing to match</text><circle cx="551.0" cy="290" r="9" class="fdNum" style="stroke:var(--bad)"/><text x="551.0" y="293.5" class="fdNumT" style="fill:var(--bad)">6</text><rect x="158.4" y="324.0" width="323.2" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="320.0" y="339.0" class="fdSelfT">check: known IdP, signature, audience, ID</text><circle cx="158.4" cy="335.0" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="158.4" y="338.5" class="fdNumT" style="fill:var(--muted)">7</text><text x="320" y="392" class="fdNote">verify against keys you fetched from the provider, never against anything the message itself supplies</text></svg></div>
<ol class="fdSteps">
<li><b>Your app → Provider:</b> register the app, exchange metadata</li>
<li><b>Provider → Your app:</b> client_id/secret, or metadata + cert</li>
<li><b>Your app → Provider:</b> GET JWKS: the published public keys <i>(back channel)</i></li>
<li><b>Provider → Your app:</b> login result: signed token/assertion <i>(front channel)</i></li>
<li><b>Your app:</b> verify signature with the PUBLISHED key</li>
<li><b>Attacker → Your app:</b> unsolicited assertion, nothing to match <i>(attack)</i></li>
<li><b>Your app:</b> check: known IdP, signature, audience, ID</li>
</ol>
<p><b>Step 1.</b> Once, at setup, you register your app with the provider: the redirect URIs it may use and, for SAML, your metadata with your own certificate.
<b>Step 2.</b> The provider hands back a <code>client_id</code> and usually a <code>client_secret</code> (OAuth and OIDC), or its own metadata carrying an X.509 certificate (SAML). Both sides now know who the other is.
<b>Step 3.</b> Your app fetches the provider's public signing keys from its JWKS URL, or reads them out of the SAML metadata. It caches them and fetches again when a token names a key it doesn't know.
<b>Step 4.</b> A user logs in. Because your app started the flow, the response carries something to match it to (<code>state</code>, or SAML's in-response-to) and arrives at the redirect URI or ACS you registered.</p>
<p><b>Step 5.</b> Your app checks the signature against the key from step 3. The message may claim any issuer and any key; only the published one counts.
<b>Step 6.</b> An attacker, or a captured message played back later, delivers an assertion your app never asked for. In SAML IdP-initiated SSO this is legitimate traffic, so your app can't refuse it just for being unrequested.
<b>Step 7.</b> So the checks have to stand on their own. The issuer is a pre-configured IdP. The signature verifies against that IdP's known key. The audience or recipient is you. <code>NotOnOrAfter</code> hasn't passed. The assertion ID has never been seen before.</p>

<p><b>Unsolicited assertions.</b> Normally your app <i>starts</i> the flow (<b>SP</b>-initiated), so it can match the response to its own request. The SP is the service provider: the application that doesn't log you in itself and instead trusts the identity provider to do it. An <b>unsolicited assertion</b> is the opposite. The identity provider (the <b>IdP</b>, the system that holds the accounts and does the actual logging in) pushes a signed assertion to your app <i>without</i> a preceding request. This is SAML <b>IdP-initiated SSO</b>. SSO is single sign-on: you log in once, at one place, and every other application accepts that login instead of asking for its own. OIDC has no equivalent. Where a portal must launch the app, <code>initiate_login_uri</code> has the IdP trigger an ordinary SP-initiated flow instead. It is convenient (a portal launches the app for the user) but riskier. There is <b>no request to correlate to</b> (no in-response-to / state), so it is more exposed to <b>replay</b> (capturing a valid message and sending it again later) and to an assertion injected from elsewhere.</p>
<p><b>Defending unsolicited assertions.</b> Accept them only from a <b>pre-configured, trusted IdP</b>. Verify the <b>signature</b> against that IdP's known key. Enforce the <b>audience/recipient</b> so an assertion minted for another service is rejected. Enforce a short validity window (<code>NotOnOrAfter</code>) to bound replay. <b>Track assertion IDs</b> so the same one cannot be replayed. When you can, prefer SP-initiated flows. The request you send is itself a defense.</p>
<h4>Verifying what arrives, in both directions</h4>
<p>An integration has two trust paths and teams often secure only one. <b>Inbound tokens and
assertions</b> are verified against the provider's published keys. <b>Inbound webhooks</b> are verified
against the shared secret, and that check has three parts: recompute the HMAC over the
raw body before any parsing, compare it in <b>constant time</b>, and reject anything whose timestamp is
outside a short window so a captured-and-replayed call is refused.</p>
<p>The raw body is what breaks implementations. Parsing JSON and re-serializing it changes
whitespace and key order, so the signature no longer matches. Capture the bytes as they arrived.</p>

<h4>What breaks later, and how to survive it</h4>
<ul>
<li><b>Key rotation at the provider.</b> Fetch and cache the JWKS, refresh on an unknown <code>kid</code>,
and never pin a single key. Providers rotate on their schedule, not yours.</li>
<li><b>Certificate expiry in SAML.</b> Metadata certificates expire, and the failure is a total outage for
that integration on a date that was knowable years in advance. Refresh metadata automatically and alert
well before the date.</li>
<li><b>Secret rotation on your side.</b> Support two valid secrets at once. Otherwise rotation requires downtime,
so it never happens.</li>
</ul>
<p>The rule for both directions: <b>discover keys, do not embed them</b>, and treat every
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



<p>Everything so far assumes <b>bilateral</b> trust: for each app-to-<b>IdP</b> pair, somebody registers a
client and exchanges keys. The IdP is the identity provider, the system that holds the accounts and
does the actual logging in, then tells other applications who you are. That works, and it scales quadratically. Ten parties need forty-five
relationships. A national health network or a university ecosystem with thousands of participants needs
a different mechanism.</p>
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
<p>An <b>RP</b> is a relying party: the application that doesn't log you in itself and instead trusts
the identity provider to do it. An <b>OP</b> is an OpenID Provider, the identity provider on the OpenID
Connect side, the one that actually does the login. <b>An RP can accept an OP it has never been configured with</b>,
because trust is transitive through the anchor rather than pairwise. Onboarding a new participant
becomes a registration with the authority, not N integrations.</p>

<h4>Metadata policy: authorities constrain, not only vouch</h4>
<p>Vouching alone would say a participant is real, not that it behaves. So each
statement in the chain can carry a <b>metadata policy</b> that constrains what the subordinate may
declare about itself. Policies <b>compose downward and can only narrow</b>:</p>
<div class="codeSample" data-hl>anchor policy      token_endpoint_auth_methods_supported:
                     subset_of ["private_key_jwt", "tls_client_auth"]
                   id_token_signed_response_alg: one_of ["ES256","RS256"]

entity declares    token_endpoint_auth_method: "client_secret_basic"
                   -> REJECTED. the entity cannot widen what the anchor allowed.</div>
<p>This is how an ecosystem enforces a security baseline (the <b>FAPI</b> requirements from the threats
stream, for example) on participants it does not operate. FAPI is financial-grade API: the strictest
profile of OAuth and OpenID Connect, written for banking, with every optional protection made mandatory. A member cannot opt into weaker client
authentication. The policy is applied during chain resolution, not left to the member.</p>

<h4>Automatic registration</h4>
<p>Because the chain proves who a client is and what it may declare, an OP can accept a
client it has never registered. The client presents its entity identifier, the OP resolves the chain,
applies policy, and proceeds. That removes the manual onboarding step that makes large ecosystems
impractical, and it is the reason the specification exists.</p>

<h4>The trade-offs</h4>
<ul>
<li><b>The anchor is absolute.</b> Compromise it and the entire ecosystem is compromised: the trust
anchor lesson's point at maximum stakes. Anchor keys belong offline, with a rehearsed rotation.</li>
<li><b>Resolution costs.</b> Chains must be fetched, verified and cached. Stale caches mean an
expelled participant is still accepted. Cache <b>TTL</b>, time to live, is how long a cached record is
good for before it must be refreshed or thrown away, and here it is again a security parameter.</li>
<li><b>Governance is the hard part.</b> Who admits members, on what evidence, and how is one expelled
in minutes rather than at the next cache expiry? The protocol does not answer these.</li>
<li><b>It is not for two parties.</b> For a handful of integrations, bilateral registration is simpler
and better. The crossover is somewhere in the tens of participants, or wherever participants change
often.</li>
</ul>
<p>Where you will meet it: research and education federations, national health and government
ecosystems, open banking schemes, and increasingly the digital wallet ecosystem, where a verifier must
accept credentials from issuers it has never contacted. <b>SAML</b>
solved the same problem earlier with metadata aggregates and eduGAIN. SAML is Security Assertion
Markup Language, the older, XML-based standard for single sign-on between companies, and still what
most enterprise single sign-on runs on.</p>`,
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
