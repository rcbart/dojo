STREAMS.push({icon:'🔓',title:'OAuth 2.0 & OpenID Connect',blurb:'Every OAuth 2.0 flow from first principles — authorization code, PKCE, client credentials, device, refresh — plus OpenID Connect on top (ID tokens, discovery, UserInfo, nonce). The protocol that issues the tokens.',lessons:[

{id:'oa1',title:'The roles & the Authorization Code flow',body:`
<p>OAuth 2.0 is a <b>delegated authorization</b> protocol: it lets an app get a <i>limited</i> access token to call an API on a user's behalf, <b>without the user's password</b>. Four roles:</p>
<ul>
<li><b>Resource Owner</b> — the user who owns the data.</li>
<li><b>Client</b> — the app that wants access (public or confidential — see Identity Foundations).</li>
<li><b>Authorization Server (AS)</b> — the IdP that authenticates the user and issues tokens. Two key endpoints: <code>/authorize</code> (front channel) and <code>/token</code> (back channel).</li>
<li><b>Resource Server</b> — the API that accepts the access token.</li>
</ul>
<p>The default, most secure flow is <b>Authorization Code</b>. The dance:</p>
<ul>
<li><b>1.</b> The client redirects the browser to the AS <code>/authorize</code> with what it wants (front channel).</li>
<li><b>2.</b> The user logs in and consents at the AS.</li>
<li><b>3.</b> The AS redirects back to the client's <code>redirect_uri</code> with a short-lived <b>authorization code</b> (front channel — the code is useless alone).</li>
<li><b>4.</b> The client's backend exchanges that code for tokens at <code>/token</code> (back channel — private). Tokens never travel through the browser.</li>
</ul>
<p>The <code>state</code> parameter is mandatory: a random value the client sends and checks on return, to prevent <b>CSRF</b> on the redirect.</p>
<div class="codeSample" data-hl>GET https://as.example.com/authorize
  ?response_type=code            // "code" = Authorization Code flow
  &client_id=app123
  &redirect_uri=https://app.example.com/callback
  &scope=openid%20profile        // space-separated, URL-encoded
  &state=xyzRANDOM               // CSRF protection, verified on return</div>`,
docs:[['RFC 6749 — OAuth 2.0','https://www.rfc-editor.org/rfc/rfc6749'],['oauth.net — Authorization Code','https://oauth.net/2/grant-types/authorization-code/'],['RFC 9700 — OAuth security BCP','https://www.rfc-editor.org/rfc/rfc9700']],
ex:{title:'Build the /authorize request',
prompt:`Write <code>AuthorizeUrl</code> with <code>static String build(String base, String clientId, String redirectUri, String scope, String state)</code> that returns the authorization request URL: <code>base + "?response_type=code"</code> then <code>&amp;client_id=</code>, <code>&amp;redirect_uri=</code>, <code>&amp;scope=</code>, <code>&amp;state=</code>, each value passed through <code>java.net.URLEncoder.encode(value, "UTF-8")</code>. Include <code>response_type=code</code> and all four params. Declare <code>throws Exception</code>.`,
starter:`import java.net.URLEncoder;

public class AuthorizeUrl {
    static String build(String base, String clientId, String redirectUri, String scope, String state) throws Exception {
        return null;
    }
}`,
tests:[{d:'uses the authorization code response type',re:'response_type=code'},{d:'includes client_id',re:'&client_id='},{d:'includes redirect_uri',re:'&redirect_uri='},{d:'includes scope',re:'&scope='},{d:'includes state (CSRF)',re:'&state='},{d:'URL-encodes values',re:'URLEncoder\\.encode\\s*\\('}],
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

{id:'oa2',title:'PKCE — securing public clients',body:`
<p>A <b>public client</b> (SPA, mobile app) can't keep a secret, so it can't prove it's the same app that started the flow. Without protection, an attacker who intercepts the authorization code could redeem it. <b>PKCE</b> (Proof Key for Code Exchange, "pixy") fixes this and is now recommended for <i>all</i> clients.</p>
<p>How it works — a one-time secret the client makes up per flow:</p>
<ul>
<li><b>code_verifier</b> — a high-entropy random string the client generates and keeps.</li>
<li><b>code_challenge</b> — <code>base64url(SHA-256(code_verifier))</code>, sent on the <code>/authorize</code> request along with <code>code_challenge_method=S256</code>.</li>
<li>Later, at <code>/token</code>, the client sends the original <b>code_verifier</b>. The AS hashes it and checks it matches the challenge it stored. Only the app that created the verifier can complete the exchange.</li>
</ul>
<p>It's a proof-of-possession: the challenge is public (goes through the browser), but the verifier stays on the client, and you can't reverse SHA-256 to get it. An intercepted code is now useless without the verifier.</p>
<div class="codeSample" data-hl>// challenge = base64url( SHA-256( verifier ) ), no padding
MessageDigest sha = MessageDigest.getInstance("SHA-256");
byte[] hash = sha.digest(verifier.getBytes("US-ASCII"));
String challenge = Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
// send on /authorize:  &code_challenge=...&code_challenge_method=S256</div>`,
docs:[['RFC 7636 — PKCE','https://www.rfc-editor.org/rfc/rfc7636'],['oauth.net — PKCE','https://oauth.net/2/pkce/']],
ex:{title:'Compute the PKCE code_challenge',
prompt:`Write <code>Pkce</code> with: <code>static String verifier()</code> returning a base64url (no padding) string of <b>32 random bytes</b> from <code>SecureRandom</code>; and <code>static String challenge(String verifier)</code> returning <code>base64url(SHA-256(verifier))</code> — use <code>MessageDigest.getInstance("SHA-256")</code>, hash <code>verifier.getBytes("US-ASCII")</code>, and encode with <code>Base64.getUrlEncoder().withoutPadding()</code>. Declare <code>throws Exception</code>.`,
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
hints:['verifier: <code>byte[] b=new byte[32]; new SecureRandom().nextBytes(b); return Base64.getUrlEncoder().withoutPadding().encodeToString(b);</code>','challenge: hash then encode — <code>md.digest(verifier.getBytes("US-ASCII"))</code>.','Always base64URL (not standard base64) and drop padding.'],
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

{id:'oa3',title:'Exchanging the code for tokens',body:`
<p>Step 4 of the flow: the client's <b>backend</b> takes the authorization code and calls the AS <code>/token</code> endpoint over the <b>back channel</b> (a direct, private POST — never the browser). This is where the actual tokens come out.</p>
<p>The request is a <code>application/x-www-form-urlencoded</code> body:</p>
<ul>
<li><code>grant_type=authorization_code</code></li>
<li><code>code=</code> the authorization code just received</li>
<li><code>redirect_uri=</code> the same one used on <code>/authorize</code> (the AS checks it matches)</li>
<li><code>client_id=</code> (and, for confidential clients, client authentication; for public clients, the PKCE <code>code_verifier</code>)</li>
</ul>
<p>The AS responds with JSON containing up to three tokens:</p>
<ul>
<li><b>access_token</b> — the key you send to the resource server (<code>Authorization: Bearer</code>). Short-lived.</li>
<li><b>refresh_token</b> — used to get new access tokens without re-login (lesson 5). Long-lived, guard it.</li>
<li><b>id_token</b> — only if you requested the <code>openid</code> scope; proves <i>who the user is</i> (OpenID Connect, lesson 6).</li>
</ul>
<div class="codeSample" data-hl>POST /token   (back channel)
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&code=AUTH_CODE&redirect_uri=https%3A%2F%2Fapp%2Fcb&client_id=app123&code_verifier=ORIGINAL_VERIFIER</div>`,
docs:[['RFC 6749 §4.1.3 — Token Request','https://www.rfc-editor.org/rfc/rfc6749#section-4.1.3'],['oauth.net — Access Tokens','https://oauth.net/2/access-tokens/']],
ex:{title:'Build the token request body',
prompt:`Write <code>TokenRequest</code> with <code>static String body(String code, String redirectUri, String clientId, String codeVerifier)</code> returning the form-encoded body: <code>"grant_type=authorization_code"</code> then <code>&amp;code=</code>, <code>&amp;redirect_uri=</code>, <code>&amp;client_id=</code>, and <code>&amp;code_verifier=</code>, each value passed through <code>java.net.URLEncoder.encode(value, "UTF-8")</code>. Declare <code>throws Exception</code>.`,
starter:`import java.net.URLEncoder;

public class TokenRequest {
    static String body(String code, String redirectUri, String clientId, String codeVerifier) throws Exception {
        return null;
    }
}`,
tests:[{d:'authorization_code grant',re:'grant_type=authorization_code'},{d:'sends the code',re:'&code='},{d:'sends the matching redirect_uri',re:'&redirect_uri='},{d:'sends the PKCE verifier',re:'&code_verifier='},{d:'URL-encodes values',re:'URLEncoder\\.encode\\s*\\('}],
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

{id:'oa4',title:'Client Credentials — machine to machine',body:`
<p>Not every flow has a user. When a <b>backend service</b> calls another service on <i>its own</i> behalf — a cron job, a microservice — there is no browser and no one to log in. That's the <b>Client Credentials</b> grant: the client authenticates <i>as itself</i> and gets an access token for itself.</p>
<ul>
<li>Only for <b>confidential clients</b> (they must authenticate with a secret / key / mTLS).</li>
<li><b>No user, no refresh token, no ID token</b> — there's no user identity involved. The token's subject is the <i>client</i>.</li>
<li>A single back-channel POST to <code>/token</code> with <code>grant_type=client_credentials</code> and the scopes it needs.</li>
</ul>
<p>This is the foundation of service-to-service authorization (its own stream). The client proves itself (commonly HTTP Basic with client_id:client_secret) and receives a scoped token to call the target API.</p>
<div class="codeSample" data-hl>POST /token
Authorization: Basic base64(client_id ":" client_secret)   // client auth
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials&scope=orders%3Aread</div>`,
docs:[['RFC 6749 §4.4 — Client Credentials','https://www.rfc-editor.org/rfc/rfc6749#section-4.4'],['oauth.net — Client Credentials','https://oauth.net/2/grant-types/client-credentials/']],
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
tests:[{d:'client_credentials grant',re:'grant_type=client_credentials'},{d:'requests scopes',re:'&scope=|scope='},{d:'URL-encodes the scope',re:'URLEncoder\\.encode\\s*\\('},{d:'client authenticates with Basic',re:'"Basic "\\s*\\+'},{d:'base64 of id:secret',re:'Base64\\.getEncoder\\s*\\(\\s*\\)'}],
behavior:`body("orders:read") is "grant_type=client_credentials&scope=orders%3Aread". basicAuth("svc","secret") is "Basic c3ZjOnNlY3JldA==". No user is involved — the token represents the service itself; there is no refresh or ID token.`,
hints:['<code>return "grant_type=client_credentials&scope=" + URLEncoder.encode(scope, "UTF-8");</code>','Basic auth: base64 of <code>clientId + ":" + clientSecret</code>, prefixed with "Basic ".','Only confidential clients can do this safely — the secret must stay server-side.'],
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
<ul>
<li><code>grant_type=refresh_token</code> with the stored <code>refresh_token</code> → a new access token (and often a new refresh token).</li>
<li><b>Refresh token rotation</b> — good AS's issue a new refresh token each time and invalidate the old one; if an attacker replays a used refresh token, the AS detects the reuse and revokes the whole chain.</li>
<li>Refresh tokens are high-value — store them securely (confidential clients: server-side; public clients: rotation + sender-constraining).</li>
</ul>
<p>The lifecycle in one line: <b>authenticate once → short access tokens for calls → refresh to renew → refresh expires or is revoked → log in again.</b></p>
<div class="codeSample" data-hl>POST /token
grant_type=refresh_token&refresh_token=STORED_REFRESH&scope=orders%3Aread
// response: a new (shorter-lived) access_token, and usually a rotated refresh_token</div>`,
docs:[['RFC 6749 §6 — Refreshing an Access Token','https://www.rfc-editor.org/rfc/rfc6749#section-6'],['oauth.net — Refresh Tokens','https://oauth.net/2/grant-types/refresh-token/']],
ex:{title:'Build the refresh request',
prompt:`Write <code>Refresh</code> with <code>static String body(String refreshToken, String scope)</code> returning <code>"grant_type=refresh_token"</code> then <code>&amp;refresh_token=</code> and <code>&amp;scope=</code>, each value passed through <code>java.net.URLEncoder.encode(value, "UTF-8")</code>. Declare <code>throws Exception</code>.`,
starter:`import java.net.URLEncoder;

public class Refresh {
    static String body(String refreshToken, String scope) throws Exception {
        return null;
    }
}`,
tests:[{d:'refresh_token grant',re:'grant_type=refresh_token'},{d:'sends the refresh token',re:'&refresh_token='},{d:'may narrow scope',re:'&scope='},{d:'URL-encodes values',re:'URLEncoder\\.encode\\s*\\('}],
behavior:`body("REFRESH","orders:read") is "grant_type=refresh_token&refresh_token=REFRESH&scope=orders%3Aread". The AS returns a new access token; with rotation, also a new refresh token, and the old one stops working.`,
hints:['<code>"grant_type=refresh_token"</code> then append the encoded refresh_token and scope.','You may request the same or narrower scope on refresh, never broader.','Treat the refresh token like a password — it can mint access tokens.'],
solution:`import java.net.URLEncoder;

public class Refresh {
    static String body(String refreshToken, String scope) throws Exception {
        return "grant_type=refresh_token"
                + "&refresh_token=" + URLEncoder.encode(refreshToken, "UTF-8")
                + "&scope=" + URLEncoder.encode(scope, "UTF-8");
    }
}`}},

{id:'oa6',title:'OpenID Connect: authentication on top of OAuth',body:`
<p>OAuth 2.0 is about <b>authorization</b> (access to APIs). It does <i>not</i>, by itself, tell an app <b>who the user is</b> — using an access token to identify a user is a known anti-pattern. <b>OpenID Connect (OIDC)</b> is a thin <b>authentication</b> layer on top of OAuth that adds exactly that.</p>
<p>What OIDC adds:</p>
<ul>
<li><b>The <code>openid</code> scope</b> — request it and the AS (now an "OpenID Provider") returns an <b>ID token</b>.</li>
<li><b>ID token</b> — a <b>JWT</b> describing the authentication event: <code>iss</code>, <code>sub</code> (the user's stable id), <code>aud</code> (your client_id), <code>exp</code>, <code>iat</code>, and <b><code>nonce</code></b>. It is meant for the <i>client</i> (unlike the access token, which is for the API).</li>
<li><b>nonce</b> — a random value the client puts on <code>/authorize</code> and then verifies is echoed in the ID token, binding the token to this login (replay protection).</li>
<li><b>UserInfo endpoint</b> — call it with the access token to fetch profile claims (name, email) per the granted scopes (<code>profile</code>, <code>email</code>).</li>
<li><b>Discovery</b> — <code>/.well-known/openid-configuration</code> lists all endpoints and the <code>jwks_uri</code> for verifying ID tokens.</li>
</ul>
<p>Rule of thumb: <b>access token = for the API (authorization); ID token = for the client (authentication).</b> Validate the ID token like any JWT (signature + iss/aud/exp) <i>and</i> check the nonce matches.</p>
<div class="codeSample" data-hl>// request authentication by adding the openid scope (+ nonce)
scope=openid%20profile%20email &nonce=RANDOM
// then fetch profile from UserInfo with the ACCESS token
GET /userinfo    Authorization: Bearer ACCESS_TOKEN</div>`,
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
tests:[{d:'checks the audience (client_id)',re:'expectedAud\\s*\\.\\s*equals\\s*\\(\\s*aud\\s*\\)'},{d:'checks the nonce (replay protection)',re:'expectedNonce\\s*\\.\\s*equals\\s*\\(\\s*nonce\\s*\\)'},{d:'checks expiry',re:'expEpoch\\s*>\\s*now|now\\s*<\\s*expEpoch'},{d:'UserInfo uses the access token as Bearer',re:'"Bearer "\\s*\\+\\s*accessToken'}],
behavior:`idTokenOk passes only when the ID token is for this client (aud), carries the nonce from this login, and is unexpired. userInfo("AT") returns "Bearer AT" — note the ID token authenticates the user, while the access token is what calls the API/UserInfo.`,
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

{id:'oa7',title:'Device flow & the legacy grants',body:`
<p>Two more flows round out the picture — one modern, two you should <b>recognize but avoid</b>.</p>
<p><b>Device Authorization Flow</b> (for input-constrained devices: TVs, CLIs, IoT). The device can't show a browser/keyboard well, so:</p>
<ul>
<li>The device asks the AS <code>/device_authorization</code> and gets a <b>user_code</b> and a <b>verification_uri</b>.</li>
<li>It shows "go to example.com/activate and enter WXYZ-1234" while it <b>polls</b> <code>/token</code> with <code>grant_type=urn:ietf:params:oauth:grant-type:device_code</code>.</li>
<li>The user authorizes on their phone; the next poll returns tokens. While waiting, the AS answers <code>authorization_pending</code> (keep polling) or <code>slow_down</code>.</li>
</ul>
<p><b>Legacy grants — do not use in new systems:</b></p>
<ul>
<li><b>Implicit</b> (<code>response_type=token</code>) — returned the access token directly in the browser URL (front channel). Deprecated: tokens leak via history/referrer. Replaced by <b>Authorization Code + PKCE</b>.</li>
<li><b>Resource Owner Password Credentials (ROPC)</b> (<code>grant_type=password</code>) — the app collects the user's actual username/password and sends them to the AS. This defeats the whole point of OAuth (the app sees the password) and breaks SSO/MFA. Deprecated.</li>
</ul>
<p>Modern guidance (OAuth 2.1 / Security BCP): use <b>Authorization Code + PKCE</b> for user flows, <b>Client Credentials</b> for machine-to-machine, and <b>Device</b> for constrained devices. Avoid Implicit and ROPC.</p>
<div class="codeSample" data-hl>// device flow polls the token endpoint with the device_code grant
grant_type=urn:ietf:params:oauth:grant-type:device_code&device_code=DEV_CODE&client_id=tvapp
// AS replies authorization_pending until the user approves on another screen</div>`,
docs:[['RFC 8628 — Device Authorization Grant','https://www.rfc-editor.org/rfc/rfc8628'],['OAuth 2.0 Security BCP (RFC 9700)','https://www.rfc-editor.org/rfc/rfc9700'],['Why the Implicit flow is deprecated','https://oauth.net/2/grant-types/implicit/']],
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
tests:[{d:'uses the device_code grant URN',re:'grant_type=urn:ietf:params:oauth:grant-type:device_code'},{d:'sends the device_code',re:'&device_code='},{d:'sends the client_id',re:'&client_id='},{d:'keeps polling while pending',re:'"authorization_pending"\\s*\\.\\s*equals|equals\\s*\\(\\s*"authorization_pending"'},{d:'also handles slow_down',re:'"slow_down"'}],
behavior:`pollBody("DEV","tvapp") is "grant_type=urn:ietf:params:oauth:grant-type:device_code&device_code=DEV&client_id=tvapp". keepPolling("authorization_pending") and keepPolling("slow_down") are true; keepPolling("access_denied") is false (stop). This is the modern flow for TVs/CLIs; Implicit and ROPC are deprecated.`,
hints:['The grant type is a URN string — include it verbatim.','<code>return "authorization_pending".equals(error) || "slow_down".equals(error);</code>','On any other error (expired_token, access_denied) stop polling.'],
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
}`}}

]});
