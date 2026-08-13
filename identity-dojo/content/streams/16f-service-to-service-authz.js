STREAMS.push({iam:true,sec:'Service-to-service & zero trust',icon:'🔗',title:'Service-to-Service Authorization & SPIFFE',blurb:'How services prove who they are to each other with no human in the loop: token-based M2M (client credentials via a minting authority like Cognito), mutual TLS, OAuth token exchange, and workload identity with SPIFFE/SPIRE — the building blocks of zero trust.',lessons:[

{id:'s2s1',title:'Machine identity & token-based M2M',body:`
<p>Service-to-service (S2S / machine-to-machine, M2M) calls have <b>no user</b> — a backend calls another backend as <i>itself</i>. So "who is calling?" is answered by the <b>service's own identity</b>, not a logged-in person.</p>
<p>The token-based approach uses the <b>Client Credentials</b> grant against a <b>token-minting authority</b> — an OAuth Authorization Server such as <b>AWS Cognito</b>, Auth0, Okta, or Keycloak. The service authenticates with its client credentials and receives a scoped access token to call the target API:</p>
<div class="codeSample">Token-based M2M with a minting authority (e.g. Cognito)
 1. Service A holds client_id + client_secret (a confidential client registered at the authority)
 2. A → Authority /oauth2/token   grant_type=client_credentials&scope=orders/read   (HTTP Basic)
 3. Authority verifies A, returns a short-lived access token (a JWT) scoped to what A may do
 4. A → Service B   Authorization: Bearer &lt;token&gt;
 5. B validates the token (issuer, audience, scope, expiry) and serves the request
 -- no user anywhere; the token's subject is the SERVICE A --</div>
<p>Key points: it's a <b>confidential client</b> (only backends can hold the secret), there is <b>no refresh or ID token</b>, and the token is short-lived and <b>scoped</b> (least privilege — Service A gets exactly the scopes it needs, no more). With Cognito specifically, you define an app client + resource server/scopes and hit the pool's <code>/oauth2/token</code> endpoint.</p>

<h4>Why machine identity is the harder problem</h4>
<p>A human logs in once a day and can be asked for a second factor. A service authenticates thousands of
times an hour, at 3am, with nobody watching — so it cannot be challenged, it produces no signal when its
credential is stolen, and it usually holds far more access than any single person. A database credential
reads every row; a human reads the ten they were entitled to.</p>
<p>Machine identities also <b>outnumber human ones by a wide margin</b> in any modern estate, and they are
the population nobody reviews. That is the whole reason this stream exists, and the reason the governance
stream has a lesson on non-human identity.</p>

<h4>What the token actually says</h4>
<div class="codeSample" data-hl>{
  "iss": "https://auth.corp.com",       // who minted it
  "sub": "orders-service",              // THE SERVICE - there is no user here
  "aud": "https://billing.internal",    // who may accept it
  "scope": "invoices:read",             // what it may do there
  "exp": 1767225600                     // and for how long
}

// note what is ABSENT: no user, no email, no name. this token cannot
// answer "on whose behalf?" - which is exactly why token exchange
// exists, and why using client credentials for a user's request loses
// the information the downstream service needs to authorize properly.</div>

<h4>The operational details that decide whether it works</h4>
<p><b>Cache the token.</b> These are fetched by code, in a loop. A service that requests a fresh token per
outbound call will hammer the authorization server, get rate-limited, and take an outage caused entirely by
its own token acquisition — a genuinely common production failure. Cache until shortly before expiry, and
add jitter so a fleet restarting together does not stampede.</p>
<p><b>Decide what happens when the authority is down.</b> A cached token keeps working until it expires;
after that, every call fails. Whether that is a graceful degradation or a total outage is a decision, and
it should be one you made rather than discovered.</p>
<p><b>The audience check is not optional on the receiving side.</b> Five services trusting one issuer, with
nobody checking <code>aud</code>, means any service holding any token can call any other. That is the
confused deputy, and it is the single most common misconfiguration in internal platforms.</p>

<h4>The credential ladder</h4>
<div class="codeSample" data-hl>client_secret_basic     a shared secret. simple, ubiquitous, and it is a
                        long-lived credential to store, ship and rotate.
private_key_jwt         the client signs a short-lived assertion with its
                        private key. nothing shared, so nothing to leak
                        from the server side.
mTLS                    the certificate IS the credential, and the token can
                        be certificate-bound so a stolen one is unusable.
workload identity       the platform attests what the workload is, and that
                        attestation is exchanged for a token.
                        NO STORED SECRET AT ALL - the end state to aim for.</div>
<p>Most teams start at the top of that ladder and stay there. The rest of this stream is about the
climb.</p>`,
docs:[['AWS Cognito — client credentials','https://docs.aws.amazon.com/cognito/latest/developerguide/authorization-endpoint.html'],['RFC 6749 §4.4 — Client Credentials','https://www.rfc-editor.org/rfc/rfc6749#section-4.4']],
ex:{title:'Request an M2M token from the authority',
prompt:`Write <code>M2mToken</code> with: <code>static String tokenRequest(String scope)</code> returning <code>"grant_type=client_credentials&amp;scope=" + java.net.URLEncoder.encode(scope, "UTF-8")</code>; and <code>static String clientAuth(String clientId, String clientSecret)</code> returning <code>"Basic " + base64(clientId:clientSecret)</code> using <code>java.util.Base64.getEncoder()</code>. Declare <code>throws Exception</code> where needed.`,
starter:`import java.net.URLEncoder;
import java.util.Base64;

public class M2mToken {
    static String tokenRequest(String scope) throws Exception {
        return null;
    }
    static String clientAuth(String clientId, String clientSecret) {
        return null;
    }
}`,
tests:[{d:'client_credentials grant',re:'grant_type=client_credentials'},{d:'requests a scope',re:'scope='},{d:'URL-encodes the scope',re:'URLEncoder\\.encode\\s*\\('},{d:'authenticates with Basic',re:'"Basic "\\s*\\+'},{d:'base64 of id:secret',re:'Base64\\.getEncoder\\s*\\(\\s*\\)'}],
behavior:`tokenRequest("orders/read") is "grant_type=client_credentials&scope=orders%2Fread". clientAuth("svcA","secret") is "Basic c3ZjQTpzZWNyZXQ=". Sent to the authority (e.g. Cognito) /oauth2/token, this mints a short-lived, scoped access token whose subject is the calling service — no user involved.`,
hints:['It is the Client Credentials grant — same shape as the OAuth stream, framed for M2M.','The authority (Cognito/Auth0/Okta/Keycloak) is the token-minting authority.','Only a confidential client (a backend) can safely hold the secret used in clientAuth.'],
solution:`import java.net.URLEncoder;
import java.util.Base64;

public class M2mToken {
    static String tokenRequest(String scope) throws Exception {
        return "grant_type=client_credentials&scope=" + URLEncoder.encode(scope, "UTF-8");
    }
    static String clientAuth(String clientId, String clientSecret) {
        String raw = clientId + ":" + clientSecret;
        return "Basic " + Base64.getEncoder().encodeToString(raw.getBytes());
    }
}`}},

{id:'s2s2',title:'Mutual TLS (mTLS) as service identity',body:`
<p>The other way services prove themselves needs no token server at all: <b>mutual TLS</b>. In ordinary TLS only the <i>server</i> presents a certificate; in <b>mTLS both sides do</b>. The caller's verified <b>client certificate is its identity</b> — the receiver trusts it because it was signed by a CA the receiver trusts (PKI, next stream).</p>
<ul>
<li>Each service is issued a <b>client certificate</b> (short-lived, ideally auto-rotated).</li>
<li>On every call, TLS verifies the peer's cert against the trusted CA; the peer's <b>subject</b> (or a SAN URI) names the workload.</li>
<li>Authorization is then "is <i>this identity</i> allowed to call me?" — an allow-list of subjects, or policy keyed on the identity.</li>
</ul>
<p>mTLS is the backbone of <b>service meshes</b> (Istio, Linkerd): the mesh gives every workload a cert and encrypts + authenticates every hop automatically. It pairs naturally with SPIFFE (lesson 4), where the cert's SAN is a <code>spiffe://</code> URI.</p>
<div class="codeSample">mTLS call
 Service A ──TLS ClientHello + A's client cert──▶ Service B
 Service B verifies A's cert against the trusted CA, reads A's identity from the subject/SAN,
 then checks: is A allowed to call this endpoint?   (identity-based authorization)
 Both directions are encrypted and authenticated — a stolen bearer token alone won't get in.</div>

<h4>The property that makes mTLS different</h4>
<p>A bearer token is a thing you <i>hold</i>. Steal it and you are the caller. An mTLS identity is a thing
you <i>prove</i>: the client demonstrates possession of a private key during the handshake, and that key
never crosses the wire. Copy the certificate and you have copied a public document — without the key it
authenticates nothing.</p>
<p>That is the same sender-constraining idea as DPoP, achieved at the transport layer instead of the
application layer, and it is why mTLS is the strongest of the mechanisms in this stream.</p>

<h4>What you get for free, and what you still have to do</h4>
<div class="codeSample" data-hl>THE HANDSHAKE GIVES YOU        YOU STILL HAVE TO
authentication                 authorization
  "this is payments-svc"         "may payments-svc call THIS endpoint?"
encryption in both directions  revocation
  no plaintext on the wire       a valid cert stays valid until it expires
proof of key possession        identity mapping
  not just possession of a doc   cert subject -> the policy you wrote</div>
<p>The second column is where the work is. A common mistake is treating a successful handshake as
permission: <b>every service in the mesh has a valid certificate</b>, so "the TLS connection succeeded" only
tells you the caller is <i>somebody</i>. Which somebody, and whether they may do this, is a policy decision
you still have to make.</p>

<h4>The operational reality</h4>
<p><b>Certificate lifetime is the revocation story.</b> There is no practical way to revoke an mTLS
identity mid-flight — CRLs and OCSP do not work well internally either. The answer the industry settled on
is <b>very short-lived certificates</b>, rotated automatically: an hour, or minutes. A compromised workload
then loses access when its certificate expires rather than when someone remembers to revoke it.</p>
<p><b>Rotation must be automatic or it will not happen.</b> Hand-managed certificates expire at 2am on a
public holiday. This is precisely the problem SPIFFE/SPIRE and service meshes exist to solve, and it is why
they appear two lessons from here.</p>
<p><b>Where TLS terminates matters.</b> If a load balancer terminates TLS, your service sees the balancer's
identity, not the caller's — and any client-certificate information arrives in a header the balancer added,
which is only trustworthy if nothing else can reach your service directly. In a mesh the sidecar terminates
it inside the pod, which is why the guarantee holds there.</p>

<h4>Where it does not fit</h4>
<p>Browsers handle client certificates badly, most proxies and CDNs strip them, mobile platforms make
storage awkward, and third parties will not want to manage a certificate you issued. mTLS is excellent
<b>inside</b> a platform you control and a poor fit at its public edge — which is the split the choosing
lesson later in this stream makes explicit.</p>`,
docs:[['RFC 8705 — OAuth mTLS','https://www.rfc-editor.org/rfc/rfc8705'],['Istio mutual TLS','https://istio.io/latest/docs/concepts/security/#mutual-tls-authentication']],
ex:{title:'Authorize by peer identity',
prompt:`Write <code>MtlsIdentity</code> with: <code>static boolean allowed(String peerSubject, java.util.Set&lt;String&gt; allowedSubjects)</code> returning whether <code>peerSubject</code> is non-null and in <code>allowedSubjects</code>; and <code>static String spiffeFromSan(String sanUri)</code> returning <code>sanUri</code> if it is non-null and <code>startsWith("spiffe://")</code>, else <code>null</code> (the cert's SAN URI is the workload identity).`,
starter:`import java.util.*;

public class MtlsIdentity {
    static boolean allowed(String peerSubject, Set<String> allowedSubjects) {
        return false;
    }
    static String spiffeFromSan(String sanUri) {
        return null;
    }
}`,
tests:[{d:'null-checks the peer',re:'peerSubject\\s*!=\\s*null|null\\s*!=\\s*peerSubject'},{d:'authorizes by identity allow-list',re:'allowedSubjects\\s*\\.\\s*contains\\s*\\(\\s*peerSubject\\s*\\)'},{d:'recognizes a SPIFFE SAN',re:'startsWith\\s*\\(\\s*"spiffe://"\\s*\\)'}],
behavior:`allowed("svcA", Set.of("svcA")) is true; an unknown or null subject is false. spiffeFromSan("spiffe://corp/ns/prod/sa/a") returns it; a non-spiffe or null SAN returns null. In mTLS the peer's verified certificate IS the identity — no bearer token can be replayed by a thief who lacks the private key.`,
hints:['Authorization is an allow-list: <code>peerSubject != null &amp;&amp; allowedSubjects.contains(peerSubject)</code>.','A workload SPIFFE identity travels in the cert SAN as a <code>spiffe://</code> URI.','mTLS binds the call to the holder of the private key — that is what makes it sender-constrained.'],
solution:`import java.util.*;

public class MtlsIdentity {
    static boolean allowed(String peerSubject, Set<String> allowedSubjects) {
        return peerSubject != null && allowedSubjects.contains(peerSubject);
    }
    static String spiffeFromSan(String sanUri) {
        return (sanUri != null && sanUri.startsWith("spiffe://")) ? sanUri : null;
    }
}`}},

{id:'s2s3',title:'OAuth Token Exchange (on-behalf-of)',body:`
<p><i>The shape of this problem — audience per hop, subject survives, acting party recorded — is covered
by the on-behalf-of lesson in Identity Foundations. This lesson is the mechanism.</i></p>
<p>Often a request enters your system as a <b>user</b> (a user token at the gateway), then one service must call another <b>on that user's behalf</b> — but the user token is scoped/audienced for the first service, not the next. <b>Token Exchange</b> (RFC 8693) is the standard way to trade one token for another.</p>
<ul>
<li>A service sends its <b>subject_token</b> (the incoming token) to the authority and asks for a new token for a different <b>audience</b> / scopes.</li>
<li>The authority returns a fresh token that carries the right audience and can preserve the <b>delegation</b> chain ("service X acting for user Y").</li>
<li>Use cases: user → downstream API (on-behalf-of), and pure S2S (swap a service token for a narrower one). It formalizes both <b>delegation</b> and <b>impersonation</b>.</li>
</ul>
<div class="codeSample">Token exchange (on-behalf-of)
 Gateway ──(user token)──▶ Service A
 Service A → Authority /token
     grant_type = urn:ietf:params:oauth:grant-type:token-exchange
     subject_token = &lt;the user's token&gt;   subject_token_type = ...access_token
     audience = service-b
 Authority → Service A: a NEW token, audience=service-b, still tied to the user
 Service A ──(new token)──▶ Service B    (B sees the right audience &amp; the delegated user)</div>

<h4>The exchange, parameter by parameter</h4>
<p>The Identity Foundations stream established <i>why</i> on-behalf-of exists: a token minted for service A
must not be replayed against service B, and the user's identity must survive the hop anyway. RFC 8693 is
the protocol that does both. It is one call to the ordinary token endpoint with a different grant type.</p>
<div class="codeSample" data-hl>POST /token
grant_type=urn:ietf:params:oauth:grant-type:token-exchange
&amp;subject_token=&lt;the token you were given&gt;      // WHO the work is for
&amp;subject_token_type=urn:ietf:params:oauth:token-type:access_token
&amp;actor_token=&lt;your OWN service token&gt;           // WHO is asking (optional)
&amp;actor_token_type=urn:ietf:params:oauth:token-type:access_token
&amp;audience=https://billing.internal                // WHO the new token is FOR
&amp;scope=invoices:read                              // NARROWED, not inherited

// the response looks like any token response, plus one field:
{ "access_token": "...", "issued_token_type": "...:access_token",
  "token_type": "Bearer", "expires_in": 300, "scope": "invoices:read" }</div>
<p>Two parameters carry the whole design. <b><code>audience</code></b> is what makes the new token useless
anywhere else — this is the confused-deputy fix. <b><code>scope</code></b> is where you narrow: a token
for the next hop should ask for less than you hold, never more, and the authorization server enforces that
it cannot exceed the original grant.</p>

<h4>Delegation or impersonation — the exchange decides</h4>
<div class="codeSample" data-hl>DELEGATION    subject_token + actor_token
  the result names BOTH: sub is the user, and act records you.
  { "sub": "user-42", "aud": "billing", "act": { "sub": "orders-svc" } }
  -> the audit trail answers "which service acted for which user?"

IMPERSONATION  subject_token only
  the result names ONLY the user. you have vanished from the record.
  { "sub": "user-42", "aud": "billing" }
  -> billing cannot tell this apart from the user calling directly.

// prefer delegation. impersonation is occasionally necessary and always
// costs you the ability to answer "who actually did this?" afterwards.</div>

<h4>Chains, and the rule people miss</h4>
<p>Hop three exchanges hop two's token, so <code>act</code> nests: the outermost <code>act</code> is the
<i>most recent</i> actor, and older ones sit inside it. RFC 8693 §4.1 is explicit that <b>only the
top-level claims and the outermost <code>act</code> may inform an access decision</b> — nested actors are
informational, for audit. Writing authorization logic that walks the nested chain is a spec violation and
a real vulnerability, because an earlier hop controls what it put there.</p>

<h4>What it costs</h4>
<p>Every hop is a network call to the authorization server, in the request path. That is real latency and
a real dependency — so cache exchanged tokens for their (short) lifetime, keyed by subject <i>and</i>
audience, and make sure an authorization-server outage degrades in a way you have decided on rather than
discovered. And note that the AS must be configured to permit each exchange: which client may exchange
for which audience is policy, not something the caller asserts.</p>

<h4>When not to reach for it</h4>
<p>If the downstream service is acting purely on its own behalf — a nightly reconciliation, a cache warm —
Client Credentials is correct and simpler. Token exchange is for when the <b>user's identity has to survive
the hop</b>, and using it where there is no user adds a round trip to carry nothing.</p>`,
docs:[['RFC 8693 — OAuth Token Exchange','https://www.rfc-editor.org/rfc/rfc8693']],
ex:{title:'Build a token-exchange request',
prompt:`Write <code>TokenExchange</code> with <code>static String body(String subjectToken, String audience)</code> returning the form body: <code>grant_type=urn:ietf:params:oauth:grant-type:token-exchange</code>, then <code>&amp;subject_token=</code> (URL-encoded), then <code>&amp;subject_token_type=urn:ietf:params:oauth:token-type:access_token</code>, then <code>&amp;audience=</code> (URL-encoded). Declare <code>throws Exception</code>.`,
starter:`import java.net.URLEncoder;

public class TokenExchange {
    static String body(String subjectToken, String audience) throws Exception {
        return null;
    }
}`,
tests:[{d:'uses the token-exchange grant',re:'grant_type=urn:ietf:params:oauth:grant-type:token-exchange'},{d:'sends the subject token',re:'&subject_token='},{d:'declares the subject token type',re:'subject_token_type=urn:ietf:params:oauth:token-type:access_token'},{d:'targets an audience',re:'&audience='},{d:'URL-encodes dynamic values',re:'URLEncoder\\.encode\\s*\\('}],
behavior:`body("USERTOK","service-b") returns "grant_type=urn:ietf:params:oauth:grant-type:token-exchange&subject_token=USERTOK&subject_token_type=urn:ietf:params:oauth:token-type:access_token&audience=service-b". The authority returns a token addressed to service-b, still representing the original user — clean delegation instead of passing the user's token around.`,
hints:['The grant type and token-type are URN constants — include them verbatim.','URL-encode only the dynamic values (subject_token, audience).','This is how you avoid replaying a user token with the wrong audience downstream.'],
solution:`import java.net.URLEncoder;

public class TokenExchange {
    static String body(String subjectToken, String audience) throws Exception {
        return "grant_type=urn:ietf:params:oauth:grant-type:token-exchange"
                + "&subject_token=" + URLEncoder.encode(subjectToken, "UTF-8")
                + "&subject_token_type=urn:ietf:params:oauth:token-type:access_token"
                + "&audience=" + URLEncoder.encode(audience, "UTF-8");
    }
}`}},

{id:'s2s4',title:'SPIFFE & SPIRE: universal workload identity',body:`
<p>Client secrets are painful at scale (distribute, rotate, leak). <b>SPIFFE</b> (Secure Production Identity Framework For Everyone) gives every <b>workload</b> a cryptographic identity <b>automatically</b>, with no secrets to manage.</p>
<ul>
<li><b>SPIFFE ID</b> — the identity, a URI: <code>spiffe://&lt;trust-domain&gt;/&lt;path&gt;</code>, e.g. <code>spiffe://corp.com/ns/prod/sa/payments</code>. The <b>trust domain</b> is the root of trust; the path names the workload.</li>
<li><b>SVID</b> (SPIFFE Verifiable Identity Document) — the credential proving a SPIFFE ID, in two forms: an <b>X.509-SVID</b> (a cert with the SPIFFE ID in its SAN — used for mTLS) or a <b>JWT-SVID</b> (a JWT with the SPIFFE ID as <code>sub</code> — used where mTLS isn't practical).</li>
<li><b>SPIRE</b> — the reference implementation. It <b>attests</b> a workload (proves what it is, from the node + process properties) and issues short-lived, auto-rotated SVIDs — so there are <b>no long-lived secrets</b> anywhere.</li>
</ul>
<p>The payoff: two services (even across clouds/orgs sharing trust) authenticate by SVID over mTLS, identities are portable and standardized, and rotation is automatic. This is the identity layer under many service meshes.</p>
<div class="codeSample">SPIFFE ID:  spiffe://corp.com/ns/prod/sa/payments
             \\_______/  \\_____/  \\_______________/
              scheme     trust      path (the specific workload)
                         domain
 X.509-SVID → SPIFFE ID in the cert SAN  → used for mTLS
 JWT-SVID   → SPIFFE ID as the JWT sub   → used for token-based calls</div>

<h4>The problem it removes, in plain terms</h4>
<p>Every mechanism so far starts with a question nobody has a good answer to: <b>how does the very first
credential get onto the machine?</b> You give a service a client secret — but how? Baked into the image
(now it is in every registry pull), injected by CI (now CI holds every secret in the estate), fetched from
a vault (which needs a credential to open, so you have moved the problem rather than solved it).</p>
<p>This is the <b>secret zero</b> problem, and SPIFFE's answer is to stop shipping a secret at all. The
platform already knows things about a workload that an attacker cannot easily forge — which node it is on,
which Kubernetes service account it runs under, what its process looks like. <b>Attestation</b> turns those
facts into an identity, and the workload receives a freshly minted, short-lived credential it never had to
be given in advance.</p>

<h4>Reading a SPIFFE ID</h4>
<div class="codeSample" data-hl>spiffe://corp.com/ns/prod/sa/payments
         \________/ \________________/
         trust domain   the workload path

// the TRUST DOMAIN is the security boundary. two workloads in different
// trust domains do not trust each other unless the domains have been
// explicitly federated - which is what makes this work across clouds
// and across organisations.

// the PATH is a naming convention, not a rule. mirroring your platform
// (namespace, service account) is what makes policy readable, and it is
// what lets an operator tell at a glance which workload a policy names.</div>

<h4>Two credential shapes, two jobs</h4>
<p>An <b>X.509-SVID</b> is a certificate carrying the SPIFFE ID in its SAN. It is what mTLS consumes, so
the connection itself is authenticated — and being a certificate, possession of the key is proven rather
than asserted.</p>
<p>A <b>JWT-SVID</b> carries the SPIFFE ID as its <code>sub</code>. It is a bearer token, so it is weaker,
and it exists for the cases mTLS cannot reach — through a load balancer that terminates TLS, across an
event queue, into a system that speaks only HTTP headers. <b>Prefer the X.509 form</b>, and reach for the
JWT one knowingly, with a short lifetime and an audience check.</p>

<h4>What SPIRE actually does</h4>
<div class="codeSample" data-hl>1. NODE ATTESTATION     the agent proves which machine it is, using
                        something the platform vouches for - an AWS
                        instance identity document, a GCP metadata token,
                        a Kubernetes node token.
2. WORKLOAD ATTESTATION a process asks the local agent for an identity.
                        the agent inspects it through the kernel - uid,
                        the container it is in, its service account - and
                        decides which SPIFFE ID it qualifies for.
3. ISSUANCE + ROTATION  a short-lived SVID is handed over a unix socket
                        and refreshed automatically before it expires.

// the workload never presents a credential to get one. it asks a local
// socket, and the platform's own knowledge of it is the proof.</div>

<h4>The honest trade</h4>
<p>SPIRE is real infrastructure: a server, agents on every node, a registration entry per workload, and a
trust domain to operate and back up. That is a meaningful cost, and for a handful of services a client
secret in a secret manager is the proportionate answer.</p>
<p>It earns its keep when the estate is large enough that secret distribution and rotation have become a
standing burden, when workloads are ephemeral, or when identity must cross clouds or organisations. Most
teams meet it not directly but through a service mesh, which uses it underneath — which is the next
lesson.</p>`,
docs:[['SPIFFE overview','https://spiffe.io/docs/latest/spiffe-about/overview/'],['SPIFFE ID format','https://github.com/spiffe/spiffe/blob/main/standards/SPIFFE-ID.md'],['SPIRE','https://spiffe.io/docs/latest/spire-about/']],
ex:{title:'Parse & validate a SPIFFE ID',
prompt:`Write <code>Spiffe</code> with: <code>static boolean isValid(String id)</code> returning true only if <code>id</code> is non-null, <code>startsWith("spiffe://")</code>, and has a path (a <code>'/'</code> after the trust domain — i.e. <code>indexOf('/', "spiffe://".length())</code> is &gt; 0); and <code>static String trustDomain(String id)</code> returning the trust domain (the text between <code>spiffe://</code> and the next <code>'/'</code>), or <code>null</code> if invalid.`,
starter:`public class Spiffe {
    static boolean isValid(String id) {
        return false;
    }
    static String trustDomain(String id) {
        return null;
    }
}`,
tests:[{d:'requires the spiffe scheme',re:'startsWith\\s*\\(\\s*"spiffe://"\\s*\\)'},{d:'locates the trust-domain boundary',re:"indexOf\\s*\\(\\s*'/'"},{d:'extracts the trust domain',re:'substring\\s*\\('}],
behavior:`isValid("spiffe://corp.com/ns/prod/sa/payments") is true; "spiffe://corp.com" (no path) and null are false. trustDomain("spiffe://corp.com/ns/prod/sa/payments") returns "corp.com". The trust domain is the root of trust; the path identifies the specific workload.`,
hints:['<code>int start = "spiffe://".length();</code>, then find the next slash after the trust domain with <code>indexOf</code> from that position.','Valid = scheme present AND that slash is beyond the start (there is a path after the trust domain).','trustDomain = <code>id.substring(start, slash)</code>.'],
solution:`public class Spiffe {
    static boolean isValid(String id) {
        if (id == null || !id.startsWith("spiffe://")) return false;
        int start = "spiffe://".length();
        return id.indexOf('/', start) > start;
    }
    static String trustDomain(String id) {
        if (!isValid(id)) return null;
        int start = "spiffe://".length();
        int slash = id.indexOf('/', start);
        return id.substring(start, slash);
    }
}`}},

{id:'s2s5',title:'Workload identity in the cloud & mesh',body:`
<p>The same idea — <b>no long-lived secrets</b>, identity from the platform — appears in every cloud and mesh:</p>
<ul>
<li><b>Cloud workload identity federation</b> — instead of storing a static cloud key, a workload presents a <b>platform-issued token</b> (e.g. a Kubernetes ServiceAccount JWT, or a GitHub Actions OIDC token) and the cloud <b>exchanges</b> it for short-lived cloud credentials. AWS IAM Roles (IRSA), GCP Workload Identity, and Azure Managed Identity all do this. No secret to leak.</li>
<li><b>Service mesh mTLS</b> — Istio/Linkerd (often backed by SPIRE) give each pod an identity and do mTLS automatically; policy is written against the workload identity.</li>
<li><b>Validation</b> — a JWT-SVID or platform token is validated like any JWT: signature, <b>issuer</b>, <b>audience</b> (must be <i>this</i> service), and <b>expiry</b> — plus the <b>trust domain</b> must be one you accept.</li>
</ul>
<p>The throughline: prove identity with something the platform vouches for, keep it <b>short-lived</b>, and authorize on the verified identity — never a shared password.</p>

<h4>Federation, without a secret anywhere</h4>
<p>Every major platform now offers the same trade, under four different names. Your workload already holds
a token that says what it is — a Kubernetes service-account JWT, a GitHub Actions OIDC token, an instance
identity document. The cloud provider is willing to <b>trust that issuer</b> and exchange the token for
short-lived credentials of its own.</p>
<div class="codeSample" data-hl>THE OLD WAY                    THE FEDERATED WAY
a long-lived cloud key         the platform-issued token you already have
  stored in CI, in an image,     ↓ exchanged, over TLS, at call time
  in a repo, in a Slack message  ↓
  and rotated approximately      short-lived cloud credentials
  never                          expiring in minutes

// this is the single highest-value change most teams can make. the
// static cloud key in CI is, empirically, one of the most commonly
// leaked credentials in existence.</div>
<p>The names to recognise: <b>IRSA</b> (AWS, for Kubernetes), <b>Workload Identity</b> (GCP),
<b>Managed Identity</b> (Azure), and OIDC federation for CI systems. They differ in configuration and not
in idea.</p>

<h4>The part people get wrong: the trust policy</h4>
<p>Configuring federation means telling the cloud provider which external identities may assume which role.
Get that condition too loose and you have published the role to the internet.</p>
<div class="codeSample" data-hl>// a GitHub Actions trust policy, done badly:
"sub": "repo:acme/*"              // ANY repo in the org. including one
                                  // a contractor can open a PR against.
"sub": "repo:*"                   // ANY repository on GitHub. anyone.

// done properly - pin the repo, AND the ref or environment:
"sub": "repo:acme/payments:ref:refs/heads/main"
"sub": "repo:acme/payments:environment:production"
// and always constrain the audience, or a token minted for another
// service can be replayed at yours.</div>
<p>This is the same lesson as role assumption in Foundations: the trust policy decides <i>who may become
you</i>, and it is a far more consequential document than the permission policy attached to it.</p>

<h4>Validating a platform token on the receiving side</h4>
<p>Whether it is a JWT-SVID, a Kubernetes token or a CI token, the checks are the ones from the token
validation lesson, plus one: <b>signature</b> against the issuer's published keys, <b>iss</b> against an
issuer you configured (never one read out of the token), <b>aud</b> equal to <i>this</i> service,
<b>exp</b>, and the <b>trust domain</b> must be one you accept. Skipping the last two is how a token minted
for a neighbouring service, or from a federated domain you never intended to trust, is accepted.</p>

<h4>The throughline</h4>
<p>Every mechanism in this stream is the same move: <b>prove identity with something the platform vouches
for, keep it short-lived, and authorize on the verified identity</b> — never on a shared password, never on
being inside the network. Which mechanism you pick is the next lesson; that principle does not change
between them.</p>`,
docs:[['AWS IRSA','https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html'],['GCP Workload Identity Federation','https://cloud.google.com/iam/docs/workload-identity-federation'],['SPIFFE JWT-SVID','https://github.com/spiffe/spiffe/blob/main/standards/JWT-SVID.md']],
ex:{title:'Validate a workload token',
prompt:`Write <code>WorkloadToken</code> with <code>static boolean valid(String audience, String subjectSpiffeId, long expEpoch, String expectedAudience, String acceptedTrustDomainPrefix, long now)</code> returning true only if <code>expectedAudience.equals(audience)</code>, <code>subjectSpiffeId</code> is non-null and <code>startsWith(acceptedTrustDomainPrefix)</code>, and it is not expired (<code>expEpoch &gt; now</code>).`,
starter:`public class WorkloadToken {
    static boolean valid(String audience, String subjectSpiffeId, long expEpoch,
                         String expectedAudience, String acceptedTrustDomainPrefix, long now) {
        return false;
    }
}`,
tests:[{d:'checks the audience is this service',re:'expectedAudience\\s*\\.\\s*equals\\s*\\(\\s*audience\\s*\\)'},{d:'checks the trust domain / identity prefix',re:'startsWith\\s*\\(\\s*acceptedTrustDomainPrefix\\s*\\)'},{d:'checks expiry',re:'expEpoch\\s*>\\s*now|now\\s*<\\s*expEpoch'}],
behavior:`valid passes only when the token is addressed to this service (audience), its subject SPIFFE ID is in an accepted trust domain, and it has not expired. A token from another trust domain, for another audience, or past expiry is rejected — the same discipline as user tokens, applied to workloads.`,
hints:['Combine the three: <code>expectedAudience.equals(audience) &amp;&amp; subjectSpiffeId != null &amp;&amp; subjectSpiffeId.startsWith(acceptedTrustDomainPrefix) &amp;&amp; expEpoch &gt; now</code>.','Audience stops a token for service A being replayed at service B.','Accept only trust domains you federate with.'],
solution:`public class WorkloadToken {
    static boolean valid(String audience, String subjectSpiffeId, long expEpoch,
                         String expectedAudience, String acceptedTrustDomainPrefix, long now) {
        return expectedAudience.equals(audience)
                && subjectSpiffeId != null
                && subjectSpiffeId.startsWith(acceptedTrustDomainPrefix)
                && expEpoch > now;
    }
}`}},

{id:'s2s6',title:'Zero trust: choosing an S2S approach',body:`
<p><i>The principle and its history are in the zero trust lesson in Identity Foundations. Here it is
applied: picking a service-to-service approach.</i></p>
<p><b>Zero trust</b> means "never trust the network" — every call is authenticated and authorized on <b>identity</b>, not on being inside a perimeter. The S2S mechanisms in this stream are how you implement it. Choosing among them:</p>
<ul>
<li><b>mTLS + SPIFFE</b> — best <i>inside</i> a platform/mesh (Kubernetes, one or federated trust domains). Automatic, sender-constrained, no secrets. The default for internal S2S.</li>
<li><b>OAuth Client Credentials</b> (via Cognito/Auth0/Okta) — best <i>across</i> orgs or to third-party/public APIs, and where a central authority already issues tokens.</li>
<li><b>Token Exchange</b> — when a call must act <b>on behalf of a user</b> (or re-scope a token) as it moves between services.</li>
<li><b>Cloud workload identity federation</b> — to get cloud credentials with no static keys.</li>
</ul>
<p>Whatever the mechanism, the zero-trust rules are the same: <b>short-lived credentials</b>, <b>no long-lived shared secrets</b>, <b>least privilege</b> (narrow scopes/policies), verify <b>audience</b> and identity on every hop, and rotate automatically.</p>
<div class="codeSample">Pick an S2S mechanism
 Internal, in a mesh / Kubernetes?          → mTLS + SPIFFE  (automatic, no secrets)
 Cross-org / third-party / public API?      → OAuth Client Credentials (a minting authority)
 Must act on behalf of a user downstream?   → Token Exchange
 Need cloud creds without static keys?      → Workload identity federation
 Always: short-lived · least privilege · check audience · never a long-lived secret</div>

<h4>Ask the questions in this order</h4>
<p>The table above is the shape of the decision. The order matters, because the first two questions
eliminate most of the options before you have to weigh anything.</p>
<div class="codeSample" data-hl>1. DOES A USER'S IDENTITY NEED TO SURVIVE THIS HOP?
     yes -> token exchange. nothing else carries the subject, and using
            client credentials here silently loses the information the
            downstream service needs to authorize properly.
     no  -> continue.

2. IS THE CALLER INSIDE A PLATFORM YOU CONTROL?
     yes -> mTLS with SPIFFE/mesh identity. no secrets, sender-constrained,
            rotation is automatic. this is the default for internal calls.
     no  -> continue.

3. IS THE TARGET A CLOUD PROVIDER'S OWN API?
     yes -> workload identity federation. never a static key.
     no  -> OAuth client credentials, with the strongest client auth the
            other side supports: mTLS > private_key_jwt > shared secret.</div>
<p>Note what the order rules out. A team that starts at question 3 reaches for client credentials for
everything, ends up distributing secrets internally, and then builds tooling to manage the problem it
created. Starting at question 1 prevents the more expensive mistake: choosing a mechanism that cannot
carry the user, and discovering it only when the downstream service needs to authorize.</p>

<h4>What "never trust the network" costs</h4>
<p>Zero trust is right, and it is not free. Every hop now verifies a signature or completes a handshake, so
there is real latency and real CPU. Every service needs the identity infrastructure available, so an
outage in the authority or the mesh control plane becomes an outage in everything. And policy that used to
live in one firewall rule now lives in dozens of services.</p>
<p>The mitigations are the ones this stream has already named: cache verification keys with a long TTL and
refresh on an unknown <code>kid</code>; cache exchanged tokens for their lifetime; keep the policy decision
local (a sidecar or a library, not a network call per request); and decide in advance whether a control-plane
outage fails open or closed. <b>Fail closed</b> is the correct default, and it means an availability plan is
part of adopting zero trust rather than something you discover afterwards.</p>

<h4>What does not change, whichever you choose</h4>
<div class="codeSample" data-hl>SHORT-LIVED       minutes, not months. expiry is your revocation.
LEAST PRIVILEGE   narrow scopes, narrow audiences, one identity per service.
                  never one shared credential for a whole platform.
AUDIENCE CHECKED  on every hop, by the receiver. this is the confused
                  deputy fix and it is the most commonly skipped check.
ROTATED           automatically. a rotation that needs a human will not
                  happen at 2am on a public holiday.
NO SHARED SECRET  and where one is unavoidable, in a secret manager with
                  an audit trail - never in an image, a repo or CI config.</div>

<h4>A note for whoever is choosing</h4>
<p>Do not run all four mechanisms because each is locally optimal. Every one is infrastructure to operate,
document and debug at 3am. <b>Pick one internal mechanism and one external mechanism</b>, use token exchange
where the user must survive a hop, and treat anything else as an exception with a written reason. A platform
with two well-understood paths is more secure in practice than one with five correct ones nobody fully
knows.</p>`,
docs:[['NIST SP 800-207 — Zero Trust Architecture','https://csrc.nist.gov/pubs/sp/800/207/final'],['SPIFFE + service mesh','https://spiffe.io/docs/latest/microservices/']],
ex:{title:'Choose the mechanism',
prompt:`Write <code>ZeroTrust</code> with: <code>static String mechanism(String scenario)</code> returning <code>"mtls-spiffe"</code> for <code>"same-mesh"</code> or <code>"kubernetes"</code>, <code>"oauth-client-credentials"</code> for <code>"cross-org"</code> or <code>"third-party-api"</code>, <code>"token-exchange"</code> for <code>"on-behalf-of-user"</code>, and <code>"mtls-spiffe"</code> as the default; and <code>static boolean longLivedSecretOk(String env)</code> returning <code>false</code> (zero trust: never rely on long-lived shared secrets).`,
starter:`public class ZeroTrust {
    static String mechanism(String scenario) {
        return null;
    }
    static boolean longLivedSecretOk(String env) {
        return true;
    }
}`,
tests:[{d:'internal mesh → mTLS + SPIFFE',re:'"mtls-spiffe"'},{d:'cross-org → client credentials',re:'"oauth-client-credentials"'},{d:'on-behalf-of → token exchange',re:'"token-exchange"'},{d:'never OK to rely on long-lived secrets',re:'return\\s+false'}],
behavior:`mechanism("kubernetes") and mechanism("same-mesh") return "mtls-spiffe"; "cross-org"/"third-party-api" return "oauth-client-credentials"; "on-behalf-of-user" returns "token-exchange"; unknown defaults to mtls-spiffe. longLivedSecretOk always returns false — the core zero-trust stance.`,
hints:['A switch over the scenario with a default of "mtls-spiffe".','Group same-mesh/kubernetes, and cross-org/third-party-api.','longLivedSecretOk is deliberately always false.'],
solution:`public class ZeroTrust {
    static String mechanism(String scenario) {
        switch (scenario) {
            case "same-mesh": case "kubernetes":        return "mtls-spiffe";
            case "cross-org": case "third-party-api":   return "oauth-client-credentials";
            case "on-behalf-of-user":                   return "token-exchange";
            default:                                    return "mtls-spiffe";
        }
    }
    static boolean longLivedSecretOk(String env) {
        return false;
    }
}`}}
,
{id:'s2s7',title:'Context propagation across services',body:`
<p>When a request crosses many services, the <b>who</b> and the <b>trace</b> have to travel with it. That travelling bundle — the caller&#8217;s identity (their token or principal), plus correlation/trace ids — is the <b>security context</b>, and moving it correctly is <b>context propagation</b>.</p>
<p>Miss it and two things break. Downstream services cannot make authorization decisions or write meaningful audit logs, because they no longer know who the original caller was; and you create a <b>confused deputy</b>, where a trusted middle service acts with its own high privilege on behalf of an unknown user. So each hop must forward the identity — either by passing the original token through, or by exchanging it for a scoped downstream token — alongside a <code>traceparent</code> id so the whole call chain can be stitched together.</p>
<p>Inside a service the same context must survive thread and async boundaries: it typically rides in a <code>ThreadLocal</code> / MDC and must be <b>copied</b> onto worker threads, or it silently vanishes mid-request.</p>

<h4>Two kinds of context, and only one of them is trustworthy</h4>
<p>A request crossing five services carries two very different things, and conflating them is the bug this
lesson exists to prevent.</p>
<div class="codeSample" data-hl>SECURITY CONTEXT   who this is, and what they may do.
  Authorization: Bearer &lt;token&gt;
  SIGNED. verified independently by every hop. cannot be forged.

DIAGNOSTIC CONTEXT  how to correlate the logs afterwards.
  traceparent: 00-4bf92f...-00f067aa0ba902b7-01     (W3C Trace Context)
  baggage: tenant=acme,plan=pro
  UNSIGNED. anyone on the path can set it. useful, never authoritative.

// the failure: reading tenant from baggage and using it to scope a
// database query. that is an authorization decision made from an
// attacker-controllable header.</div>

<h4>The rule</h4>
<p><b>Authorization comes from the token; correlation comes from the headers.</b> If a piece of context
affects what a caller is allowed to see, it belongs in a claim the authorization server signed — not in
baggage, not in <code>X-User-Id</code>, not in a body field. If it only affects logging and tracing, an
unsigned header is exactly right and signing it would be waste.</p>

<h4>Propagating correctly</h4>
<p><code>traceparent</code> carries the trace id, the parent span id and flags; each service creates a new
span and passes a <i>new</i> parent id down, keeping the trace id constant. That constant id is what lets
one request be reassembled from a thousand interleaved log lines — the same argument as the request id in
a single service, extended across a fleet.</p>
<div class="codeSample" data-hl>// what every hop should do, in order:
1. verify the incoming token   (iss, aud, exp, signature)
2. start a span from traceparent, or START A TRACE if there is none
3. log with { trace_id, span_id, sub } on every line
4. when calling onward: exchange the token for the NEXT audience,
   and send a NEW traceparent with the same trace id

// and what it must NOT do: forward the incoming Authorization header
// unchanged. that is how a token minted for you reaches a service it
// was never meant for.</div>

<h4>Baggage, and why it needs a budget</h4>
<p>W3C Baggage propagates arbitrary key/value pairs to every downstream hop. It is genuinely useful — a
tenant name or a plan tier makes dashboards far more legible — and it has two hazards. It is
<b>unbounded</b>: every pair is copied onto every outbound request forever, so a large baggage header
costs bandwidth on every call in the graph. And it <b>leaks</b>: it crosses service boundaries you may not
control, including third parties, so personal data does not belong in it. Cap it, allowlist the keys, and
strip it at the edge of your trust boundary.</p>`,
docs:[['W3C Trace Context','https://www.w3.org/TR/trace-context/'],['Confused deputy problem','https://en.wikipedia.org/wiki/Confused_deputy_problem']],
ex:{title:'Forward identity and trace downstream',
prompt:`Write class <code>Context</code> with <code>static String headers(String bearer, String traceparent)</code> that builds the downstream header string <code>authorization=&lt;bearer&gt;;traceparent=&lt;traceparent&gt;</code> — carrying both the caller identity and the trace id to the next service.`,
starter:`public class Context {
    static String headers(String bearer, String traceparent) {
        return null;
    }
}`,
solution:`public class Context {
    static String headers(String bearer, String traceparent) {
        return "authorization=" + bearer + ";traceparent=" + traceparent;
    }
}`,
tests:[{d:'forwards the caller identity',re:'"authorization="\\s*\\+\\s*bearer'},{d:'forwards the trace id',re:'";traceparent="\\s*\\+\\s*traceparent'}],
behavior:`headers("Bearer abc","00-trace-01") returns "authorization=Bearer abc;traceparent=00-trace-01". The downstream service can now identify the original caller and correlate the call in traces.`,
hints:['Concatenate the two labelled values with +.','The separator between them is the literal ";traceparent=".','Both the identity and the trace id must be forwarded, not just one.']}},
{id:'s2s8',title:'Impersonation vs delegation',body:`
<p><i>The human side of this — support engineers acting as customers, and the controls that make it
defensible — is the acting-as-a-user lesson in Identity Foundations.</i></p>
<p><b>Impersonation</b> means one party <i>acts as</i> another so completely that the downstream cannot tell the difference — the request now looks like it simply came from the target user. A support admin using "log in as this customer" is impersonation: the effective subject becomes the customer, and the admin&#8217;s own identity disappears from view.</p>
<p><b>Delegation</b> is the safer cousin. The app acts <i>on behalf of</i> the user while <b>both</b> identities are preserved: the token names the user as the subject and records the acting party in an <code>act</code> (actor) claim, which OAuth <b>Token Exchange</b> produces. Auditors can then see "service X acted for user Y," which pure impersonation loses.</p>
<p>Rule of thumb: prefer delegation so attribution survives; reserve impersonation for genuine support scenarios, and always log who impersonated whom.</p>

<h4>The distinction, stated precisely</h4>
<p>Both let a service act for a user. They differ in <b>what the resulting token says</b>, and therefore in
what anyone can reconstruct afterwards.</p>
<div class="codeSample" data-hl>DELEGATION      "orders-svc is acting FOR user-42"
  { "sub": "user-42", "act": { "sub": "orders-svc" } }
  both identities survive. the audit trail is complete.

IMPERSONATION   "I AM user-42"
  { "sub": "user-42" }
  the acting service has disappeared from the record.

// the test: after the fact, can you answer "which service, or which
// employee, actually performed this action?" delegation can. the other
// cannot, and no amount of logging elsewhere reconstructs it reliably.</div>

<h4>Why impersonation persists despite that</h4>
<p>It is simpler, and downstream services need no changes: they see an ordinary user token and behave
exactly as if the user called them. That is genuinely convenient, and it is why so many internal platforms
end up there — usually not by decision but by nobody having asked the question.</p>
<p>The cost arrives later, in three places. <b>Incidents</b>: "who exported that data?" has no answer.
<b>Compliance</b>: an auditor asking how support access is evidenced gets a shrug. <b>Blast radius</b>: an
impersonation token is indistinguishable from a real user token, so a leaked one cannot be filtered out by
anything downstream.</p>

<h4>The permission rule that goes with it</h4>
<p>Whichever you choose, the effective permissions are the <b>intersection</b> of what the actor may do and
what the subject may do — never the union, and never simply the subject's. A support engineer acting for
an administrator must not inherit administrative rights; that turns a support tool into a privilege
ladder, which is the failure mode the acting-as lesson in Foundations covers in full.</p>

<h4>Choosing</h4>
<div class="codeSample" data-hl>USE DELEGATION when a human or a service is acting for a user and you
  will one day need to explain who did what. which is: nearly always.
  cost: downstream services must understand the act claim.

USE IMPERSONATION only when a system genuinely cannot be changed to
  understand delegation, AND you have a compensating control -
  a separate audit record written at the point of impersonation,
  with an owner, that is actually reviewed.

// "we'll add the audit later" is how the compensating control never
// gets written. if it is not there on the day you ship, assume it
// will not be.</div>

<h4>The claim to reach for</h4>
<p><code>may_act</code> is the other half: placed in a user's token, it names the parties permitted to act
for them. It turns "this service happens to hold a token" into "this service was authorised to act for
this subject", which is a policy statement the authorization server can enforce rather than a convention
each service implements differently.</p>`,
docs:[['Token Exchange & act claim (RFC 8693)','https://www.rfc-editor.org/rfc/rfc8693'],['Delegation vs impersonation','https://docs.oasis-open.org/']],
ex:{title:'Whose identity is this really?',lang:'js',
run:{call:'effectiveSubject',cases:[{name:'impersonating: the target subject is used',args:['svc-support','cust-91',true],expect:'cust-91'},{name:'not impersonating: the actor is the subject',args:['svc-support','cust-91',false],expect:'svc-support'},{name:'no target while impersonating falls back to the actor',args:['svc-support','',true],expect:'svc-support'}]},
prompt:`Write <code>function effectiveSubject(actor, target, impersonating)</code> that returns the subject an access decision should be made against: the <code>target</code> when impersonating and a non-empty target was supplied, and the <code>actor</code> otherwise. The actor is never lost — it belongs in the <code>act</code> claim and in the audit line.`,
starter:`function effectiveSubject(actor, target, impersonating) {
  return null;
}`,
solution:`function effectiveSubject(actor, target, impersonating) {
  // fall back to the actor rather than an empty subject: an unnamed
  // subject is how an authorization check silently passes on nothing
  if (impersonating && target !== "") return target;
  return actor;
}`,
tests:[{d:'impersonation uses the target subject',re:'impersonating\\s*&&'},{d:'an empty target is not a subject',re:'target\\s*!==?\\s*""'},{d:'otherwise the actor is the subject',re:'return\\s+actor'}],
behavior:`The third case is the one worth executing: impersonating with an empty target must fall back to the actor rather than returning an empty subject, because an unnamed subject is how an authorization check quietly passes on nothing at all.`,
hints:['Two conditions must both hold before you use the target.','An empty string is not a valid subject.','Every other path returns the actor.']}},

{id:'s2s9',title:'Identity for AI agents: acting for a user, autonomously',body:`
<p>An agent is software that acts on a user's behalf without the user watching. That breaks an
assumption running quietly through every protocol so far: <b>that a human is present at the moment of
authorization</b>. Consent screens, step-up prompts and re-authentication all assume someone is there
to respond. An agent working through a task at 2am is not.</p>
<p>Most of what agents need already exists — this is a composition problem far more than a new-protocol
problem — but the composition has sharp edges worth naming.</p>

<h4>Three identities, not one</h4>
<div class="codeSample" data-hl>THE USER      whose data and permissions are at stake
THE AGENT     a workload with its own identity — it is not the user
THE TOOL      the API being called, with its own audience and scopes

// the request must carry the first two. an agent that presents only the
// user's identity is impersonation, and nothing downstream can tell that
// software rather than a person made the decision.</div>
<p>This is the on-behalf-of pattern with a new actor, and the right shape is the familiar one: the
subject stays the user, the agent is recorded as the acting party, and every hop gets its own audience.
The temptation to hand the agent the user's token and let it act as them is the same temptation as
impersonation, with the same consequence — the audit trail says the user did it.</p>

<h4>Consent when nobody is watching</h4>
<p>Interactive OAuth asks at the moment of use. An agent needs authority granted <i>in advance</i> and
bounded tightly enough that advance consent is defensible:</p>
<ul>
<li><b>Grant narrowly.</b> Not "read your email" but "read messages in this thread". This is exactly
what Rich Authorization Requests exist for — scopes are usually too coarse to describe what an agent
should be allowed to do.</li>
<li><b>Bound the time.</b> An agent's authority should expire with the task, not persist indefinitely.</li>
<li><b>Bound the value.</b> Spending limits, record counts, rate caps — the analogue of a purchase
limit on a corporate card.</li>
<li><b>Escalate for the irreversible.</b> Reads and reversible writes proceed; sending money, deleting
data or emailing a customer should return to a human. Design the interrupt before it is needed.</li>
</ul>

<h4>The delegation chain gets long</h4>
<p>Agents call agents. A planner delegates to a researcher which calls a search tool which calls an
internal API, and the user is four hops back. Two rules keep this tractable, and both are already
familiar:</p>
<div class="codeSample" data-hl>{ "sub": "ada",                      // still the user, all the way down
  "aud": "internal-search-api",      // audience per hop, never reused
  "scope": "search:read",            // narrowed at each step, never widened
  "act": { "sub": "research-agent",       // CURRENT actor — authorize on this
           "act": { "sub": "planner-agent" } } }   // prior actor — audit only

// downstream can now answer: which user, which agent, and on whose behalf.
// but per RFC 8693, only the top-level claims and the OUTERMOST act may
// inform an access decision. the nested history is for attribution.</div>
<p><b>Narrowing must be monotonic.</b> A sub-agent may reduce scope, never expand it — if any hop can
request more than it was given, the whole chain is only as strong as its most compromised link.</p>

<h4>The new-ish problems</h4>
<ul>
<li><b>Prompt injection is an authorization problem.</b> Content the agent reads can contain
instructions. If the agent holds a token that permits an action, hostile text may cause it to take that
action. <b>You cannot fix this in the model; you fix it by not granting the authority.</b> The token is
the control, not the prompt. This is the single most important consequence of agents for identity
work.</li>
<li><b>Confused deputy, again.</b> An agent serving many users, holding broad credentials, must bind
every call to the user it is acting for — exactly the problem external ids solve in role assumption.</li>
<li><b>Attribution.</b> When an agent does something wrong, the log must distinguish "the user asked
for this", "the agent decided this", and "content the agent read told it to". Without the act chain,
all three look identical.</li>
<li><b>Non-human lifecycle.</b> Agents are created constantly and rarely retired, so they inherit every
service-account governance problem at higher velocity.</li>
</ul>

<h4>What to reuse</h4>
<p>Nothing here needs inventing. The agent authenticates as a workload (mTLS, SPIFFE, or workload
identity federation); it obtains user-scoped authority through token exchange with the act claim;
audience and scope narrow at each hop; tokens are short-lived and ideally sender-constrained; and every
call is logged with the full chain. The discipline that makes it safe is the oldest one in the domain:
<b>grant the least authority that completes the task, and assume the holder may be turned against
you.</b></p>`,
docs:[['RFC 8693 — OAuth 2.0 Token Exchange (the act claim)','https://www.rfc-editor.org/rfc/rfc8693'],['RFC 9396 — Rich Authorization Requests','https://www.rfc-editor.org/rfc/rfc9396'],['OWASP — Top 10 for LLM Applications','https://owasp.org/www-project-top-10-for-large-language-model-applications/'],['NIST SP 800-207 — Zero Trust Architecture','https://csrc.nist.gov/pubs/sp/800/207/final']],
ex:{title:'Bound an agent',
prompt:`Write <code>AgentAuthz</code> with three methods. <code>static boolean chainValid(String subject, java.util.List&lt;String&gt; actors)</code> requires a non-null subject and a non-empty actor chain — an agent call with no recorded actor is impersonation. <code>static boolean narrowingOk(java.util.Set&lt;String&gt; granted, java.util.Set&lt;String&gt; requested)</code> is true only when every requested scope is already in <code>granted</code>: a sub-agent may reduce, never expand. <code>static boolean requiresHuman(String action, boolean reversible)</code> returns true when the action is not reversible, or when it is one of <code>"send-money"</code>, <code>"delete-data"</code> or <code>"email-customer"</code>.`,
starter:`import java.util.*;

public class AgentAuthz {
    static boolean chainValid(String subject, List<String> actors) {
        return false;
    }
    static boolean narrowingOk(Set<String> granted, Set<String> requested) {
        return false;
    }
    static boolean requiresHuman(String action, boolean reversible) {
        return false;
    }
}`,
tests:[{d:'the subject must be the user',re:'subject\\s*!=\\s*null|null\\s*!=\\s*subject'},{d:'an actor chain must be present',re:'isEmpty\\s*\\(\\s*\\)'},{d:'narrowing is checked against the grant',re:'containsAll\\s*\\(|contains\\s*\\('},{d:'irreversible actions escalate',re:'!\\s*reversible|reversible\\s*==\\s*false'},{d:'moving money escalates',re:'"send-money"'},{d:'deleting data escalates',re:'"delete-data"'},{d:'contacting a customer escalates',re:'"email-customer"'}],
behavior:`chainValid("ada", List.of("research-agent")) is true; chainValid("ada", List.of()) and chainValid(null, List.of("a")) are false, because a call with no recorded actor is indistinguishable from the user acting personally. narrowingOk(Set.of("search:read","mail:read"), Set.of("search:read")) is true, while requesting a scope that was never granted is false — narrowing must be monotonic, or the chain is only as strong as its most compromised link. requiresHuman("send-money", true) is true even though the caller claims it is reversible, and requiresHuman("read-thread", false) is true because anything irreversible escalates regardless of what it is.`,
hints:['Guard the subject and require a non-empty actor list.','<code>granted.containsAll(requested)</code> expresses "reduce, never expand" directly.','Two independent reasons to escalate: irreversibility, or membership of the sensitive set.'],
solution:`import java.util.*;

public class AgentAuthz {
    static boolean chainValid(String subject, List<String> actors) {
        // no recorded actor means impersonation: nobody downstream can tell
        return subject != null && actors != null && !actors.isEmpty();
    }
    static boolean narrowingOk(Set<String> granted, Set<String> requested) {
        if (granted == null || requested == null) return false;
        return granted.containsAll(requested);   // reduce, never expand
    }
    static boolean requiresHuman(String action, boolean reversible) {
        if (!reversible) return true;            // irreversible always escalates
        if (action == null) return true;
        switch (action) {
            case "send-money":
            case "delete-data":
            case "email-customer":
                return true;
            default:
                return false;
        }
    }
}`}}
]});
