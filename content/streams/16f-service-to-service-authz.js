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
<p>Key points: it's a <b>confidential client</b> (only backends can hold the secret), there is <b>no refresh or ID token</b>, and the token is short-lived and <b>scoped</b> (least privilege — Service A gets exactly the scopes it needs, no more). With Cognito specifically, you define an app client + resource server/scopes and hit the pool's <code>/oauth2/token</code> endpoint.</p>`,
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
 Both directions are encrypted and authenticated — a stolen bearer token alone won't get in.</div>`,
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
 Service A ──(new token)──▶ Service B    (B sees the right audience &amp; the delegated user)</div>`,
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
 JWT-SVID   → SPIFFE ID as the JWT sub   → used for token-based calls</div>`,
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
<p>The throughline: prove identity with something the platform vouches for, keep it <b>short-lived</b>, and authorize on the verified identity — never a shared password.</p>`,
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
 Always: short-lived · least privilege · check audience · never a long-lived secret</div>`,
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
<p>Inside a service the same context must survive thread and async boundaries: it typically rides in a <code>ThreadLocal</code> / MDC and must be <b>copied</b> onto worker threads, or it silently vanishes mid-request.</p>`,
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
<p><b>Impersonation</b> means one party <i>acts as</i> another so completely that the downstream cannot tell the difference — the request now looks like it simply came from the target user. A support admin using "log in as this customer" is impersonation: the effective subject becomes the customer, and the admin&#8217;s own identity disappears from view.</p>
<p><b>Delegation</b> is the safer cousin. The app acts <i>on behalf of</i> the user while <b>both</b> identities are preserved: the token names the user as the subject and records the acting party in an <code>act</code> (actor) claim, which OAuth <b>Token Exchange</b> produces. Auditors can then see "service X acted for user Y," which pure impersonation loses.</p>
<p>Rule of thumb: prefer delegation so attribution survives; reserve impersonation for genuine support scenarios, and always log who impersonated whom.</p>`,
docs:[['Token Exchange & act claim (RFC 8693)','https://www.rfc-editor.org/rfc/rfc8693'],['Delegation vs impersonation','https://docs.oasis-open.org/']],
ex:{title:'Resolve the effective subject',
prompt:`Write class <code>Impersonation</code> with <code>static String effectiveSubject(String actor, String target, boolean impersonating)</code> that returns the <code>target</code> when impersonating (the request appears to come from the target) and the <code>actor</code> otherwise. Use one conditional expression.`,
starter:`public class Impersonation {
    static String effectiveSubject(String actor, String target, boolean impersonating) {
        return null;
    }
}`,
solution:`public class Impersonation {
    static String effectiveSubject(String actor, String target, boolean impersonating) {
        return impersonating ? target : actor;
    }
}`,
tests:[{d:'impersonation makes the target the effective subject',re:'impersonating\\s*\\?\\s*target\\s*:\\s*actor'}],
behavior:`effectiveSubject("admin","alice",true) returns "alice" — the request now appears to be alice, and the admin identity is hidden (why delegation with an act claim is safer). effectiveSubject("admin","alice",false) returns "admin".`,
hints:['A single ternary condition ? target : actor expresses it.','Impersonating means the target becomes the effective subject.','Otherwise the actor remains the subject.']}}
]});
