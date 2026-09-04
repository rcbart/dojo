STREAMS.push({iam:true,sec:'Tokens: JWT & JOSE',icon:'🔑',title:'OAuth, JWT & JOSE (JWK · JWS · JWE)',blurb:'Generate JWKs, mint and sign JWTs (RS256/ES256), verify them against a JWKS well-known endpoint, watch tampering fail, and encrypt with JWE: the token layer of OAuth/OIDC, in Java with Nimbus JOSE+JWT.',lessons:[

{id:'jose1',title:'Signing keys as JWKs (RSA-2048 & EC P-256)',body:`
<p>OAuth and OpenID Connect hand out <b>tokens</b> that a receiver must be able to <i>trust</i>. Trust comes from a <b>signature</b>, and a signature needs a <b>key pair</b>:</p>
<ul>
<li>the <b>private key</b> signs tokens, kept secret by the Authorization Server;</li>
<li>the <b>public key</b> verifies them, published for everyone to fetch.</li>
</ul>
<p>Those keys are shared in a standard JSON shape called a <b>JWK</b> (JSON Web Key, RFC 7517). Two families dominate JWT signing:</p>
<ul>
<li><b>RSA-2048</b> &rarr; algorithm <b>RS256</b>. The classic default; larger keys and signatures.</li>
<li><b>EC P-256</b> &rarr; algorithm <b>ES256</b>. Modern elliptic-curve keys, far smaller for the same security.</li>
</ul>
<p>With the Nimbus JOSE+JWT library, a generator produces a JWK directly, tagged with its metadata:</p>
<div class="codeSample" data-hl>// RSA-2048 signing key, as a JWK
RSAKey rsa = new RSAKeyGenerator(2048)
        .keyUse(KeyUse.SIGNATURE)          // use: "sig", this key is for signatures
        .algorithm(JWSAlgorithm.RS256)     // alg: RS256
        .keyIDFromThumbprint(true)         // kid: a stable RFC 7638 fingerprint of the key
        .generate();

RSAKey publicOnly = rsa.toPublicJWK();     // safe to publish; strips the private half
String json = publicOnly.toJSONString();   // the JSON you serve at a JWKS endpoint</div>
<p>The <b>kid</b> (key ID) is important: it is a stable label for the key. Because issuers hold several keys and rotate them, the kid is how a verifier later knows <i>which</i> key signed a given token (next lessons).</p>

<h4>Reading a JWK</h4>
<p>A JWK is a JSON object whose fields depend on the key type. The parameters worth recognizing:</p>
<div class="codeSample" data-hl>{ "kty": "EC",          // key type: EC, RSA or oct (symmetric)
  "crv": "P-256",       // the curve, for EC keys
  "x": "...", "y": "...",   // the public point. RSA instead has "n" and "e"
  "kid": "2026-08-a",   // key id: your label, any string, must be unique
  "use": "sig",         // sig (signature) or enc (encryption), never both
  "alg": "ES256" }      // the algorithm this key is intended for</div>
<p>A <b>private</b> JWK adds the secret parameters: <code>d</code> for EC, and <code>d</code>, <code>p</code>, <code>q</code> and friends for RSA. That is the single most dangerous mistake in this area: publishing the full JWK instead of its public half exposes your signing key, and it looks identical to the correct thing at a glance. Libraries provide an explicit "public only" projection precisely because the difference is a few fields.</p>
<p>A <b>JWKS</b> is simply <code>{"keys": [ ... ]}</code>: several JWKs together, which is what makes rotation possible: publish the new key beside the old one, and verifiers holding either can keep working.</p>

<h4>Choosing the key type</h4>
<p>RSA-2048 and EC P-256 offer comparable security today, roughly 112 and 128 bits respectively, but their shapes differ. RSA has larger keys and much larger signatures (256 bytes against 64), which every token carries on every request. EC signs faster; RSA verifies faster, and verification is the more frequent operation. For a new system with no legacy constraints, ES256 is the better default on size alone; RS256 remains correct where an existing ecosystem expects it. EdDSA (Ed25519) is a third option, smaller and faster still, supported by fewer libraries.</p>

<h4>Where the private key lives</h4>
<p>Nowhere in your source, and ideally nowhere in your process memory. Production signing keys belong in a KMS or an HSM that performs the signature without releasing the key, so a compromise of the application does not become a permanent forgery capability. If the key must exist as a file, it belongs in a secret manager with access logged, and its rotation belongs in a runbook that has been rehearsed, because the day you discover the key has leaked is a bad day to be reading about rotation for the first time.</p>`,
docs:[['Nimbus JOSE+JWT','https://connect2id.com/products/nimbus-jose-jwt'],['RFC 7517, JSON Web Key','https://www.rfc-editor.org/rfc/rfc7517'],['RFC 7638, JWK Thumbprint','https://www.rfc-editor.org/rfc/rfc7638']],
ex:{title:'Generate signing JWKs',
prompt:`Using Nimbus, write <code>JwkKeys</code> with: <code>static RSAKey rsa()</code> returning a <b>2048-bit RSA</b> signing JWK (<code>RSAKeyGenerator(2048)</code>, <code>KeyUse.SIGNATURE</code>, algorithm <code>JWSAlgorithm.RS256</code>, <code>keyIDFromThumbprint(true)</code>); <code>static ECKey ec()</code> returning a <b>P-256</b> signing JWK (<code>ECKeyGenerator(Curve.P_256)</code>, <code>KeyUse.SIGNATURE</code>, <code>JWSAlgorithm.ES256</code>, thumbprint kid); and <code>static String publicJwkJson(JWK jwk)</code> returning <code>jwk.toPublicJWK().toJSONString()</code>. Declare <code>throws Exception</code> where needed.`,
starter:`import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.jwk.*;
import com.nimbusds.jose.jwk.gen.*;

public class JwkKeys {
    static RSAKey rsa() throws Exception {
        return null;
    }
    static ECKey ec() throws Exception {
        return null;
    }
    static String publicJwkJson(JWK jwk) {
        return null;
    }
}`,
tests:[{d:'RSA-2048 generator',re:'RSAKeyGenerator\\s*\\(\\s*2048\\s*\\)'},{d:'EC P-256 generator',re:'ECKeyGenerator\\s*\\(\\s*Curve\\.P_256\\s*\\)'},{d:'key use = signature',re:'KeyUse\\.SIGNATURE'},{d:'RS256 algorithm',re:'JWSAlgorithm\\.RS256'},{d:'ES256 algorithm',re:'JWSAlgorithm\\.ES256'},{d:'kid from RFC 7638 thumbprint',re:'keyIDFromThumbprint\\s*\\(\\s*true\\s*\\)'},{d:'export public JWK as JSON',re:'toPublicJWK\\s*\\(\\s*\\)\\s*\\.\\s*toJSONString'}],
behavior:`rsa() returns a 2048-bit RSAKey with use=sig, alg=RS256, and a thumbprint kid. ec() returns a P-256 ECKey with alg=ES256. publicJwkJson strips the private half so the result contains no "d" (or p/q), only public members, and is safe to publish.`,
hints:['Each generator is a builder: <code>new RSAKeyGenerator(2048).keyUse(...).algorithm(...).keyIDFromThumbprint(true).generate()</code>.','EC uses <code>new ECKeyGenerator(Curve.P_256)</code> with <code>JWSAlgorithm.ES256</code>.','<code>publicJwkJson</code> is one line: <code>return jwk.toPublicJWK().toJSONString();</code>'],
solution:`import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.jwk.*;
import com.nimbusds.jose.jwk.gen.*;

public class JwkKeys {
    static RSAKey rsa() throws Exception {
        return new RSAKeyGenerator(2048)
                .keyUse(KeyUse.SIGNATURE)
                .algorithm(JWSAlgorithm.RS256)
                .keyIDFromThumbprint(true)
                .generate();
    }
    static ECKey ec() throws Exception {
        return new ECKeyGenerator(Curve.P_256)
                .keyUse(KeyUse.SIGNATURE)
                .algorithm(JWSAlgorithm.ES256)
                .keyIDFromThumbprint(true)
                .generate();
    }
    static String publicJwkJson(JWK jwk) {
        return jwk.toPublicJWK().toJSONString();
    }
}`}},

{id:'jose2',title:'Building a JWT: the claims, explained',body:`
<p>A <b>JWT</b> (JSON Web Token) is three base64url pieces joined by dots: <code>header.payload.signature</code>. The <b>payload</b> is a JSON object of <b>claims</b>: statements about the token. And the part everyone forgets: until it is encrypted (JWE, last lesson) the payload is <i>not secret</i>: anyone can base64url-decode and read it. Signing makes it <i>tamper-proof</i>, not <i>hidden</i>.</p>
<p>Here is what the standard claims mean, in plain terms:</p>
<ul>
<li><b>iss</b> (issuer): <i>who minted the token.</i> The Authorization Server's identifier (usually its URL). Like the letterhead on a letter: it says who is vouching for this.</li>
<li><b>sub</b> (subject): <i>who the token is about.</i> The user or service id. "This token concerns user 1234."</li>
<li><b>aud</b> (audience): <i>who the token is for.</i> The API meant to accept it. Like a ticket stamped "valid at Cinema A only". A service must <b>reject</b> tokens not addressed to it.</li>
<li><b>exp</b> (expiration): <i>when it stops being valid.</i> A use-by timestamp; a verifier rejects expired tokens. Keep it short.</li>
<li><b>iat</b> / <b>nbf</b> (issued-at / not-before): when it was created, and the earliest it may be used.</li>
<li><b>jti</b> (JWT ID): a unique id, handy for one-time-use or revocation lists.</li>
</ul>
<p>Beyond these you add <b>custom claims</b> for your app: for example, a <code>role</code> the API uses for authorization. (In real systems, namespace custom claims, e.g. <code>https://myapp/role</code>, so they never collide with standard ones.)</p>
<div class="codeSample" data-hl>JWTClaimsSet claims = new JWTClaimsSet.Builder()
        .issuer("https://auth.example.com")     // iss, who signed it
        .subject("user-1234")                   // sub, who it is about
        .audience("https://api.example.com")    // aud, who may accept it
        .expirationTime(new Date(now + 900_000))// exp, valid 15 minutes
        .issueTime(new Date())                  // iat, now
        .claim("role", "admin")                 // custom claim
        .build();</div>

<h4>The claims a verifier must actually check</h4>
<p>Writing claims is easy; the value is in knowing which ones a receiver is obliged to verify, and why each check exists.</p>
<ul>
<li><b>iss</b>: compare it to the issuer you expect, as an exact string. Skipping this means accepting a perfectly valid token signed by somebody else's authorization server.</li>
<li><b>aud</b>: must contain <i>you</i>. This is the check that stops a token minted for another API being replayed at yours, and it is the one most often left out because the token verifies cryptographically without it.</li>
<li><b>exp</b>, and <b>nbf</b> when present: with a small clock-skew allowance, conventionally sixty seconds. Larger tolerances quietly extend the lifetime of every token you issue.</li>
<li><b>alg</b>: against your own policy list, never dispatched from the header.</li>
<li><b>sub</b>: the identifier you key your own records on. Note it is only unique <i>within</i> an issuer, so a multi-IdP system must store issuer plus subject, not the subject alone.</li>
</ul>

<h4>Two claims people misuse</h4>
<p><b>sub is not an email address.</b> Emails change, get reassigned between employees, and are a terrible primary key, yet mapping <code>email</code> to a local account is a common shortcut, and it is how a new employee inherits a former colleague's access. Use the stable subject identifier and treat email as a mutable attribute.</p>
<p><b>jti is only useful if you store it.</b> A unique id enables one-time-use and replay detection, but only if the receiver keeps a record of what it has seen until the token expires. A jti nobody records is decoration.</p>

<h4>Size, secrecy and namespacing</h4>
<p>The payload is base64url, not encryption: <b>every claim is readable by anyone holding the token</b>, including the user's browser and any log that recorded the Authorization header. Nothing private goes in a JWS payload. It also travels on every request, so a token stuffed with roles, permissions and profile data becomes a header measured in kilobytes; put the identifier in the token and look up the detail behind it.</p>
<p>Namespace custom claims (<code>https://myapp.example.com/role</code>) so they cannot collide with registered claims or with another issuer's conventions: the same reason XML namespaces exist, arrived at the hard way.</p>`,
docs:[['RFC 7519, JSON Web Token','https://www.rfc-editor.org/rfc/rfc7519'],['IANA JWT claims registry','https://www.iana.org/assignments/jwt/jwt.xhtml'],['Nimbus, JWTClaimsSet','https://www.javadoc.io/doc/com.nimbusds/nimbus-jose-jwt/latest/com/nimbusds/jwt/JWTClaimsSet.html']],
ex:{title:'Assemble the claims',
prompt:`Write <code>JwtClaims</code> with <code>static JWTClaimsSet build(String issuer, String subject, String audience, Date expiry, String role)</code> that returns a <code>JWTClaimsSet</code> built with <code>.issuer(issuer)</code>, <code>.subject(subject)</code>, <code>.audience(audience)</code>, <code>.expirationTime(expiry)</code>, an <code>.issueTime(new Date())</code>, and a custom <code>.claim("role", role)</code>, finished with <code>.build()</code>.`,
starter:`import com.nimbusds.jwt.JWTClaimsSet;
import java.util.Date;

public class JwtClaims {
    static JWTClaimsSet build(String issuer, String subject, String audience, Date expiry, String role) {
        return null;
    }
}`,
tests:[{d:'uses the JWTClaimsSet builder',re:'JWTClaimsSet\\.Builder\\s*\\(\\s*\\)'},{d:'sets iss',re:'\\.issuer\\s*\\('},{d:'sets sub',re:'\\.subject\\s*\\('},{d:'sets aud',re:'\\.audience\\s*\\('},{d:'sets exp',re:'\\.expirationTime\\s*\\('},{d:'custom role claim',re:'\\.claim\\s*\\(\\s*"role"'},{d:'builds the set',re:'\\.build\\s*\\(\\s*\\)'}],
behavior:`build(...) returns a JWTClaimsSet whose getIssuer/getSubject/getAudience/getExpirationTime match the arguments and whose getClaim("role") equals the role. issueTime is set to now.`,
hints:['It is one fluent chain returned directly.','audience(String) is a convenience overload: no list needed.','Finish with <code>.build()</code>.'],
solution:`import com.nimbusds.jwt.JWTClaimsSet;
import java.util.Date;

public class JwtClaims {
    static JWTClaimsSet build(String issuer, String subject, String audience, Date expiry, String role) {
        return new JWTClaimsSet.Builder()
                .issuer(issuer)
                .subject(subject)
                .audience(audience)
                .expirationTime(expiry)
                .issueTime(new Date())
                .claim("role", role)
                .build();
    }
}`}},

{id:'jose3',title:'Signing the JWT: RS256 vs ES256 (size & speed)',body:`
<p>Signing turns a claims set into a <b>JWS</b> (JSON Web Signature). The signature is computed over <code>base64url(header) + "." + base64url(payload)</code>, so it protects both. The header names the algorithm and the key id.</p>
<div class="codeSample" data-hl>SignedJWT jwt = new SignedJWT(
        new JWSHeader.Builder(JWSAlgorithm.RS256).keyID(rsa.getKeyID()).build(),
        claims);
jwt.sign(new RSASSASigner(rsa));   // sign with the PRIVATE key
String token = jwt.serialize();    // header.payload.signature</div>
<p><b>Same token, two algorithms: measurably different.</b> Sign the identical claims with RS256 and ES256 and compare:</p>
<ul>
<li><b>Token size.</b> An RS256 signature is the size of the RSA modulus, <b>256 bytes</b> for RSA-2048, so the token is noticeably larger. An ES256 signature is only <b>64 bytes</b>, giving a much smaller token. Over millions of requests (every one carries the token) that bandwidth adds up.</li>
<li><b>Signing time.</b> RSA <i>signing</i> is comparatively slow; EC <i>signing</i> is fast. (Verification is the opposite: RSA verifies very fast, EC a little slower, relevant because tokens are verified far more often than signed.)</li>
</ul>
<div class="codeSample" data-hl>// measure it yourself: bracket each sign with System.nanoTime()
long t0 = System.nanoTime();
String tok = sign(rsa, claims);
double ms = (System.nanoTime() - t0) / 1_000_000.0;
System.out.println("RS256 size=" + tok.length() + " chars, sign=" + ms + "ms");</div>
<p>In the exercise below you'll write a <code>compare()</code> method that does exactly this for <b>both</b> algorithms and prints the two lines side by side, so the size and speed difference is right in front of you.</p>
<p><b>Which to pick?</b> ES256 for smaller tokens and fast signing (great for high token issuance and mobile/bandwidth-sensitive clients); RS256 when your ecosystem/verifiers expect RSA or you want the fastest verification. Both are secure; this is an engineering trade-off, not a security one.</p>

<h4>What the header carries, and why it is signed</h4>
<p>The JWS header names the algorithm (<code>alg</code>) and, in practice, the key (<code>kid</code>). Both are covered by the signature (the signing input is the encoded header <i>and</i> the encoded payload), so an attacker cannot alter them without breaking verification. What they <i>can</i> do is present a completely different token with a header of their choosing, which is why the verifier's rule remains: use the <code>kid</code> to <b>select</b> a key from the set you already trust, and use your own policy to decide whether the algorithm is acceptable. Never let the header decide the verification routine.</p>
<p>Two header fields to refuse outright: <code>jku</code> and <code>x5u</code>, which point at a URL where the key may be found. Following them is letting the token nominate its own trust anchor.</p>

<h4>The measurement in context</h4>
<p>The size difference is not academic. An access token is sent on every request, and headers are not compressed the way bodies are; the signatures differ by 192 raw bytes, which is about 256 characters once base64url encoding is applied, so across a billion requests a day that is roughly 250GB of traffic that buys nothing. On constrained links it also risks crossing header-size limits in proxies and gateways, which fail in ways that are hard to diagnose because they depend on how many claims a particular user has.</p>
<p>The speed asymmetry is worth internalizing too: RSA verification is very fast and RSA signing is slow, while EC is the reverse. Since an authorization server signs once and resource servers verify many times, RSA's profile is arguably better matched to the workload, which is the real counterweight to the size argument, and why both remain in use.</p>

<h4>Making the choice reversible</h4>
<p>Whichever you pick, the decision that matters more is whether you can change it later. That means: algorithms in a configurable policy list rather than a constant, key selection by <code>kid</code>, both algorithms accepted during a migration, and a rotation procedure that has been run at least once when nothing was on fire. A system that can move from RS256 to ES256 without a release is a system that can also move away from either when the ground shifts, which the post-quantum lesson in this stream argues is the property to design for.</p>`,
docs:[['RFC 7515 (JSON Web Signature)','https://www.rfc-editor.org/rfc/rfc7515'],['RFC 7518 (JWA (algorithms))','https://www.rfc-editor.org/rfc/rfc7518'],['Nimbus (signing a JWT)','https://connect2id.com/products/nimbus-jose-jwt/examples/signed-jwt']],
ex:{title:'Sign with RS256 and ES256',
prompt:`Write <code>JwtSigner</code> with: <code>static String sign(RSAKey key, JWTClaimsSet claims)</code>: build a <code>SignedJWT</code> with a <code>JWSHeader.Builder(JWSAlgorithm.RS256).keyID(key.getKeyID()).build()</code>, sign it with <code>new RSASSASigner(key)</code>, and return <code>serialize()</code>; and <code>static String signEc(ECKey key, JWTClaimsSet claims)</code>: same but <code>JWSAlgorithm.ES256</code> and <code>new ECDSASigner(key)</code>. Then add <code>static String compare(RSAKey rsa, ECKey ec, JWTClaimsSet claims)</code> that signs the <b>same</b> claims with both algorithms, <b>times each signing with <code>System.nanoTime()</code></b> (capture the time just before and after each sign), builds a report showing each token's size via <code>length()</code> and its sign time in milliseconds, <b>prints it with <code>System.out.print(...)</code></b> so you can see the results, and returns that report string. Declare <code>throws Exception</code>.`,
starter:`import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.*;
import com.nimbusds.jose.jwk.*;
import com.nimbusds.jwt.*;

public class JwtSigner {
    static String sign(RSAKey key, JWTClaimsSet claims) throws Exception {
        return null;
    }
    static String signEc(ECKey key, JWTClaimsSet claims) throws Exception {
        return null;
    }
    static String compare(RSAKey rsa, ECKey ec, JWTClaimsSet claims) throws Exception {
        return null;
    }
}`,
tests:[{d:'creates a SignedJWT',re:'new\\s+SignedJWT\\s*\\('},{d:'RS256 header',re:'JWSHeader\\.Builder\\s*\\(\\s*JWSAlgorithm\\.RS256'},{d:'signs with RSASSASigner',re:'new\\s+RSASSASigner\\s*\\('},{d:'ES256 header',re:'JWSAlgorithm\\.ES256'},{d:'signs with ECDSASigner',re:'new\\s+ECDSASigner\\s*\\('},{d:'invokes sign()',re:'\\.sign\\s*\\('},{d:'serializes the token',re:'\\.serialize\\s*\\(\\s*\\)'},{d:'times the signing with System.nanoTime()',re:'System\\.nanoTime\\s*\\('},{d:'measures each token size with length()',re:'\\.length\\s*\\(\\s*\\)'},{d:'displays the results with System.out.print',re:'System\\.out\\.print'}],
behavior:`sign returns a compact "a.b.c" string that verifies with the matching public key. compare signs the same claims with RS256 and ES256, times each with System.nanoTime(), and prints (and returns) a report like "RS256: 640 chars, signed in 3.10 ms / ES256: 430 chars, signed in 0.45 ms", so you can see that the RS256 token is larger (256-byte vs 64-byte signature) and that EC signs faster.`,
hints:['<code>new SignedJWT(header, claims)</code> then <code>jwt.sign(signer)</code> then <code>jwt.serialize()</code>.','Time a call by bracketing it: <code>long t0 = System.nanoTime(); String tok = sign(rsa, claims); long ns = System.nanoTime() - t0;</code>. Milliseconds are <code>ns / 1_000_000.0</code>.','Build the report with <code>String.format(...)</code> using <code>tok.length()</code> and the millis, then <code>System.out.print(report); return report;</code>'],
solution:`import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.*;
import com.nimbusds.jose.jwk.*;
import com.nimbusds.jwt.*;

public class JwtSigner {
    static String sign(RSAKey key, JWTClaimsSet claims) throws Exception {
        SignedJWT jwt = new SignedJWT(
                new JWSHeader.Builder(JWSAlgorithm.RS256).keyID(key.getKeyID()).build(),
                claims);
        jwt.sign(new RSASSASigner(key));
        return jwt.serialize();
    }
    static String signEc(ECKey key, JWTClaimsSet claims) throws Exception {
        SignedJWT jwt = new SignedJWT(
                new JWSHeader.Builder(JWSAlgorithm.ES256).keyID(key.getKeyID()).build(),
                claims);
        jwt.sign(new ECDSASigner(key));
        return jwt.serialize();
    }
    static String compare(RSAKey rsa, ECKey ec, JWTClaimsSet claims) throws Exception {
        long t0 = System.nanoTime();
        String rs = sign(rsa, claims);
        double rsMs = (System.nanoTime() - t0) / 1_000_000.0;

        long t1 = System.nanoTime();
        String es = signEc(ec, claims);
        double esMs = (System.nanoTime() - t1) / 1_000_000.0;

        String report = String.format(
                "RS256: %d chars, signed in %.2f ms%nES256: %d chars, signed in %.2f ms%n",
                rs.length(), rsMs, es.length(), esMs);
        System.out.print(report);   // display the results
        return report;
    }
}`}},

{id:'jose4',title:'Verifying a JWT with a JWKS well-known endpoint',body:`
<p>A resource server (your API) receives a token and must decide whether to trust it. It never has the issuer's private key; it uses the issuer's <b>public</b> keys, published as a <b>JWKS</b> (JWK Set): a JSON document holding one or more public JWKs. Issuers expose it at a well-known URL, e.g. <code>https://auth.example.com/.well-known/jwks.json</code> (OIDC discovery at <code>/.well-known/openid-configuration</code> points to it via <code>jwks_uri</code>). You fetch it once and <b>cache</b> it.</p>
<!--flow:jose4-jwks-->
<h4>Verifying a JWT via JWKS: step by step</h4>
<div class="flowDia"><svg viewBox="0 0 620 264" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Verifying a JWT via JWKS"><defs><marker id="jose4-jwks-ah-front" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent)"/></marker><marker id="jose4-jwks-ah-back" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent2)"/></marker><marker id="jose4-jwks-ah-attack" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--bad)"/></marker><marker id="jose4-jwks-ah-x" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--muted)"/></marker></defs><line x1="74" y1="54" x2="74" y2="252" class="fdLife"/><line x1="546" y1="54" x2="546" y2="252" class="fdLife"/><rect x="35" y="8" width="78" height="46" rx="8" class="fdActor"/><text x="74" y="27" class="fdActorT">API</text><text x="74" y="42" class="fdActorS">verifier</text><rect x="507" y="8" width="78" height="46" rx="8" class="fdActor"/><text x="546" y="27" class="fdActorT">AS</text><text x="546" y="42" class="fdActorS">/.well-known/jwks.json</text><rect x="14" y="89" width="263.6" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="153.8" y="104" class="fdSelfT">JWT arrives, header names kid + alg</text><circle cx="14" cy="100" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="14" y="103.5" class="fdNumT" style="fill:var(--muted)">1</text><line x1="77" y1="138" x2="541" y2="138" stroke="var(--accent2)" class="fdArrow" marker-end="url(#jose4-jwks-ah-back)"/><text x="325" y="129" class="fdLabel">GET jwks_uri (usually served from cache)</text><circle cx="92" cy="138" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="92" y="141.5" class="fdNumT" style="fill:var(--accent2)">2</text><line x1="543" y1="168" x2="79" y2="168" stroke="var(--accent2)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#jose4-jwks-ah-back)"/><text x="295" y="159" class="fdLabel">keys[], pick the one matching kid</text><circle cx="528" cy="168" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="528" y="171.5" class="fdNumT" style="fill:var(--accent2)">3</text><rect x="14" y="185" width="296.59999999999997" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="170.29999999999998" y="200" class="fdSelfT">verify signature; then iss, aud, exp, nbf</text><circle cx="14" cy="196" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="14" y="199.5" class="fdNumT" style="fill:var(--muted)">4</text><rect x="14" y="221" width="382.4" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="213.2" y="236" class="fdSelfT">unknown kid? refetch once, that is how rotation works</text><circle cx="14" cy="232" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="14" y="235.5" class="fdNumT" style="fill:var(--muted)">5</text></svg></div>
<ol class="fdSteps">
<li><b>API:</b> JWT arrives, header names kid + alg</li>
<li><b>API → AS:</b> GET jwks_uri (usually served from cache) <i>(back channel)</i></li>
<li><b>AS → API:</b> keys[], pick the one matching kid <i>(back channel)</i></li>
<li><b>API:</b> verify signature; then iss, aud, exp, nbf</li>
<li><b>API:</b> unknown kid? refetch once, that is how rotation works</li>
</ol>
<!--/flow:jose4-jwks-->
<p><b>What to check, and in what order.</b> This is the whole job of verification:</p>
<ul>
<li><b>1. Parse, don't trust.</b> Decode the token into header + payload. Nothing is believed yet.</li>
<li><b>2. Decide the key: pick the right JWK.</b> Read the header's <code>kid</code> and find the JWK in the set with the <i>same</i> kid. Think of the JWKS as a <b>keyring</b> and the kid as the <b>label on each key</b>: the token tells you which key signed it, so you don't have to try them all. (Issuers publish several keys and rotate them; the kid is how you keep up.) Also confirm the chosen key's <code>use</code> is <i>sig</i> and its <code>alg</code> is the asymmetric algorithm you expect.</li>
<li><b>3. Fix the algorithm yourself.</b> Only accept the alg(s) you intended (e.g. RS256/ES256). <b>Never</b> accept <code>alg: none</code>, and never let the token's header talk you into a different algorithm family; that is the classic "algorithm-confusion" attack.</li>
<li><b>4. Verify the signature</b> with the chosen public key. If it fails, stop: the token is forged or corrupted.</li>
<li><b>5. Only now, check the claims.</b> <code>exp</code> not in the past; <code>iss</code> is an issuer you trust; <code>aud</code> contains <i>this</i> service; <code>nbf</code> not in the future. A perfectly-signed token still must be addressed to you and still valid.</li>
</ul>
<div class="codeSample" data-hl>JWKSet jwks = JWKSet.load(new URL("http://localhost:8080/.well-known/jwks.json")); // fetch + cache
SignedJWT jwt = SignedJWT.parse(token);                 // 1. parse
String kid = jwt.getHeader().getKeyID();                 // 2. which key?
JWK jwk = jwks.getKeyByKeyId(kid);                        //    pick by kid
boolean sig = jwt.verify(new RSASSAVerifier(jwk.toRSAKey())); // 4. signature
JWTClaimsSet c = jwt.getJWTClaimsSet();                   // 5. claims
boolean fresh = c.getExpirationTime().after(new Date());</div>
<p>Run a tiny local server that serves your public JWK at <code>/.well-known/jwks.json</code> and point the verifier at it; that is exactly how the real handshake works, just on localhost.</p>`,
docs:[['OpenID Connect Discovery','https://openid.net/specs/openid-connect-discovery-1_0.html'],['Nimbus, validating JWT access tokens','https://connect2id.com/products/nimbus-jose-jwt/examples/validating-jwt-access-tokens'],['RFC 8725, JWT best practices','https://www.rfc-editor.org/rfc/rfc8725']],
ex:{title:'Verify against a JWKS',
prompt:`Write <code>JwtVerifier</code> with <code>static boolean verify(String jwksUrl, String token, String expectedIssuer, String expectedAudience)</code> that: loads the key set with <code>JWKSet.load(new URL(jwksUrl))</code>; parses the token with <code>SignedJWT.parse(token)</code>; reads the kid via <code>jwt.getHeader().getKeyID()</code> and selects the JWK with <code>jwks.getKeyByKeyId(kid)</code> (return <code>false</code> if none); verifies the signature with <code>new RSASSAVerifier(jwk.toRSAKey())</code> (return false if it fails); then checks the claims: <code>getExpirationTime()</code> is after now, <code>getIssuer()</code> equals <code>expectedIssuer</code>, and <code>getAudience()</code> contains <code>expectedAudience</code>. Return <code>true</code> only if all pass. Declare <code>throws Exception</code>.`,
starter:`import com.nimbusds.jose.crypto.*;
import com.nimbusds.jose.jwk.*;
import com.nimbusds.jwt.*;
import java.net.URL;
import java.util.Date;

public class JwtVerifier {
    static boolean verify(String jwksUrl, String token, String expectedIssuer, String expectedAudience) throws Exception {
        return false;
    }
}`,
tests:[{d:'loads the JWKS from the URL',re:'JWKSet\\.load\\s*\\(\\s*new\\s+URL'},{d:'parses the token',re:'SignedJWT\\.parse\\s*\\('},{d:'reads the kid from the header',re:'getHeader\\s*\\(\\s*\\)\\s*\\.\\s*getKeyID'},{d:'selects the JWK by kid',re:'getKeyByKeyId\\s*\\('},{d:'verifies with the public RSA key',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:new\\s+RSASSAVerifier\\s*\\())|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:new\\s+RSASSAVerifier\\s*\\()[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:new\\s+RSASSAVerifier\\s*\\()[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:new\\s+RSASSAVerifier\\s*\\()[^{]*?return\\s+\\k<av>\\b)'},{d:'checks the signature',re:'\\.verify\\s*\\('},{d:'checks expiry',re:'(?:if\\s*\\(\\s*[^;{]*(?:getExpirationTime\\s*\\()[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:return\\s+(?!\\s*!)[^;{]*(?:getExpirationTime\\s*\\())|(?:(?<h1>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:getExpirationTime\\s*\\()[^{]*?return\\s+\\k<h1>\\b)'},{d:'checks issuer',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:getIssuer\\s*\\())|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:getIssuer\\s*\\()[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:getIssuer\\s*\\()[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:getIssuer\\s*\\()[^{]*?return\\s+\\k<av>\\b)'},{d:'checks audience',re:'(?:if\\s*\\(\\s*[^;{]*(?:getAudience\\s*\\()[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:return\\s+(?!\\s*!)[^;{]*(?:getAudience\\s*\\())|(?:(?<h1>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:getAudience\\s*\\()[^{]*?return\\s+\\k<h1>\\b)'},{d:'a guard returns its constant, not the negation of it',re:'return\\s+!\\s*\\(?\\s*(?:true|false)\\s*\\)?\\s*;',not:true}],
behavior:`Given a JWKS URL that serves the signer's public key, verify() returns true for a genuine, unexpired token whose iss/aud match, and false if: the kid is unknown, the signature fails, the token is expired, the issuer is wrong, or the audience does not include this service.`,
hints:['Fetch first: <code>JWKSet jwks = JWKSet.load(new URL(jwksUrl));</code>','Pick the key: <code>JWK jwk = jwks.getKeyByKeyId(jwt.getHeader().getKeyID());</code>. Bail out if null.','Signature before claims: <code>if (!jwt.verify(new RSASSAVerifier(jwk.toRSAKey()))) return false;</code> then check exp/iss/aud.'],
solution:`import com.nimbusds.jose.crypto.*;
import com.nimbusds.jose.jwk.*;
import com.nimbusds.jwt.*;
import java.net.URL;
import java.util.Date;

public class JwtVerifier {
    static boolean verify(String jwksUrl, String token, String expectedIssuer, String expectedAudience) throws Exception {
        JWKSet jwks = JWKSet.load(new URL(jwksUrl));            // fetch the issuer's public keys
        SignedJWT jwt = SignedJWT.parse(token);                 // parse, do not trust yet
        String kid = jwt.getHeader().getKeyID();                // which key signed this?
        JWK jwk = jwks.getKeyByKeyId(kid);                      // pick the JWK with that kid
        if (jwk == null) return false;
        if (!jwt.verify(new RSASSAVerifier(jwk.toRSAKey()))) return false;  // signature
        JWTClaimsSet c = jwt.getJWTClaimsSet();                 // now the claims
        if (c.getExpirationTime() == null || !c.getExpirationTime().after(new Date())) return false;
        if (!expectedIssuer.equals(c.getIssuer())) return false;
        if (c.getAudience() == null || !c.getAudience().contains(expectedAudience)) return false;
        return true;
    }
}`}},

{id:'jose5',title:'Tampering: why a changed payload fails',body:`
<p>The signature is computed over <code>base64url(header) + "." + base64url(payload)</code>. So if an attacker edits even a single character of the payload (say, flips <code>"role":"user"</code> to <code>"role":"admin"</code>) and re-encodes it, the signature no longer matches the new bytes, and <code>verify()</code> returns <b>false</b>. To make a matching signature they would need the <b>private key</b>, which they don't have.</p>
<p>Two truths that surprise people, both shown here:</p>
<ul>
<li><b>You can read a JWT</b> without any key: the payload is just base64url. So never put secrets in a JWS payload; signing proves <i>authenticity and integrity</i>, not <i>confidentiality</i>. (If you need it hidden, that's JWE, next lesson.)</li>
<li><b>You cannot forge one</b>: any change breaks the signature, and only the holder of the private key can produce a valid one.</li>
</ul>
<div class="codeSample" data-hl>// read the payload with no key: it is NOT secret
String payloadJson = SignedJWT.parse(token).getParsedParts()[1].decodeToString();

// verification catches ANY change to header or payload
boolean valid = SignedJWT.parse(token).verify(new RSASSAVerifier(publicKey));
// tamper with the middle segment, keep the old signature -> valid == false</div>
<div style="border:1px solid #26313d;border-radius:10px;padding:14px;margin:16px 0;background:#0b1017">
<div style="font-weight:700;margin-bottom:6px">🔬 Try it live, tamper with a real JWT (runs in your browser with Web Crypto, ES256)</div>
<button id="jt-gen" onclick="jwtTamper.gen()" style="background:#155e59;color:#fff;border:0;border-radius:8px;padding:8px 14px;cursor:pointer;font-size:13px">Generate &amp; sign a JWT</button>
<div style="font-size:13px;color:#93a1b1;margin:10px 0 4px">Now edit the payload (change <code>"role": "user"</code> to <code>"admin"</code>, or anything at all) and watch the signature stop matching:</div>
<textarea id="jt-payload" oninput="jwtTamper.edit(this)" spellcheck="false" placeholder="Click &quot;Generate &amp; sign&quot; first…" style="width:100%;height:104px;background:#141b23;color:#e6edf3;border:1px solid #26313d;border-radius:8px;padding:8px;font-family:monospace;font-size:12.5px"></textarea>
<div id="jt-status" style="font-weight:700;margin:10px 0;min-height:1.2em"></div>
<div style="font-size:12px;color:#93a1b1">Signing input (base64url header.payload):</div>
<div id="jt-siginput" style="word-break:break-all;font-family:monospace;font-size:11px;color:#8be9c9;margin-bottom:8px"></div>
<div style="font-size:12px;color:#93a1b1">Signature carried in the token (fixed, from the original signing):</div>
<div id="jt-origsig" style="word-break:break-all;font-family:monospace;font-size:11px;color:#e6edf3;margin-bottom:8px"></div>
<div style="font-size:12px;color:#93a1b1">Signature THIS payload would require (re-signed here with the private key; an attacker can’t do this):</div>
<div id="jt-newsig" style="word-break:break-all;font-family:monospace;font-size:11px;color:#f5b301;margin-bottom:6px"></div>
<div style="font-size:12px;color:#93a1b1">The two signatures are: <span id="jt-diff" style="color:#e6edf3"></span></div>
<div style="font-size:12px;color:#93a1b1;margin-top:8px">Tampered token: <span id="jt-token" style="word-break:break-all;font-family:monospace;font-size:10.5px;color:#93a1b1"></span></div>
</div>
<p>This is the property the whole OAuth trust model rests on: the resource server never trusts the token's contents until the signature check passes with the issuer's public key.</p>

<h4>Why a one-character change destroys the signature</h4>
<p>The demonstration above is a property of the hash underneath. Signing computes a digest of the signing input and then a signature over that digest, and a cryptographic hash has the <b>avalanche property</b>: flipping a single bit of input changes about half the bits of the output, unpredictably. So there is no "close enough" signature and no gradual degradation: the required signature for the tampered payload is entirely unrelated to the one the token carries. Producing the right one requires the private key, and that is the whole of the security.</p>

<h4>The forgeries that do work</h4>
<p>Every real JWT forgery attacks the <b>verification code</b>, never the mathematics:</p>
<ul>
<li><b>alg: none</b>, the specification's unsecured mode. A library that honors it accepts a token with an empty signature. Refuse it explicitly.</li>
<li><b>Algorithm confusion</b>: change <code>alg</code> from RS256 to HS256 and sign with the issuer's <i>public</i> key as the HMAC secret. A verifier that picks its routine from the header will validate it. Selecting the algorithm from your own policy makes this impossible.</li>
<li><b>Decoding without verifying</b>: libraries offer a decode function that parses claims and checks nothing, and it is used by mistake constantly. If your code path can reach the claims without a verification result, that is the bug.</li>
<li><b>Ignoring iss and aud</b>: a genuine, unexpired, correctly-signed token from a different issuer or intended for a different API is not a forgery at all; it is a valid token you should have rejected.</li>
<li><b>Trusting jku or a key fetched from the token</b>: the attacker supplies the key that verifies their own signature.</li>
</ul>

<h4>What the property does and does not buy</h4>
<p>Tamper-evidence is not confidentiality: the payload is readable by anyone who holds the token, so a JWS in a log or a browser is a disclosure of everything in it. It is also not revocation: a signed token remains cryptographically valid until it expires, whatever happens to the user's account, which is why short lifetimes and the introspection and CAE mechanisms elsewhere in this course exist. And it says nothing about <i>who presented</i> the token: a bearer token is valid in anyone's hands, which is the gap sender-constrained tokens (DPoP, mTLS) close.</p>`,
docs:[['RFC 7515 §5.2 (verifying a JWS)','https://www.rfc-editor.org/rfc/rfc7515#section-5.2'],['RFC 8725 (JWT best current practices)','https://www.rfc-editor.org/rfc/rfc8725'],['Nimbus (Base64URL)','https://www.javadoc.io/doc/com.nimbusds/nimbus-jose-jwt/latest/com/nimbusds/jose/util/Base64URL.html']],
ex:{title:'Detect the tamper',
prompt:`Write <code>TamperCheck</code> with: <code>static boolean isTampered(RSAKey publicKey, String token)</code> that parses the token with <code>SignedJWT.parse</code>, verifies it with <code>new RSASSAVerifier(publicKey)</code>, and returns <code>true</code> when the signature is <b>invalid</b> (i.e. <code>return !jwt.verify(...)</code>); and <code>static String decodePayload(String token)</code> that returns the payload JSON with no key, via <code>SignedJWT.parse(token).getParsedParts()[1].decodeToString()</code>. Declare <code>throws Exception</code>.`,
starter:`import com.nimbusds.jose.crypto.*;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jwt.SignedJWT;

public class TamperCheck {
    static boolean isTampered(RSAKey publicKey, String token) throws Exception {
        return false;
    }
    static String decodePayload(String token) throws Exception {
        return null;
    }
}`,
tests:[{d:'parses the token',re:'SignedJWT\\.parse\\s*\\('},{d:'builds an RSA verifier',re:'new\\s+RSASSAVerifier\\s*\\('},{d:'calls verify()',re:'\\.verify\\s*\\('},{d:'returns the inverse of verify (invalid == tampered)',re:'return\\s*!\\s*\\(?\\s*[^;{!]*?\\.\\s*verify\\s*\\(|(?<a1>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{!]*\\.\\s*verify\\s*\\([^{]*?return\\s+!\\s*\\k<a1>\\b|if\\s*\\(\\s*(?!\\s*!)[^;{!]*\\.\\s*verify\\s*\\([^;{]*\\)\\s*\\{?\\s*return\\s+false'},{d:'reads the payload segment',re:'getParsedParts\\s*\\(\\s*\\)\\s*\\[\\s*1\\s*\\]'},{d:'decodes base64url to text',re:'decodeToString\\s*\\('}],
behavior:`For a genuine token isTampered returns false; for a token whose payload was modified after signing it returns true. decodePayload returns the readable claims JSON with no key at all, demonstrating that a JWS hides nothing.`,
hints:['<code>isTampered</code> is one meaningful line: <code>return !SignedJWT.parse(token).verify(new RSASSAVerifier(publicKey));</code>','<code>getParsedParts()</code> returns the three Base64URL segments; index 1 is the payload.','<code>decodeToString()</code> turns that Base64URL into the JSON string.'],
solution:`import com.nimbusds.jose.crypto.*;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jwt.SignedJWT;

public class TamperCheck {
    static boolean isTampered(RSAKey publicKey, String token) throws Exception {
        SignedJWT jwt = SignedJWT.parse(token);
        return !jwt.verify(new RSASSAVerifier(publicKey));
    }
    static String decodePayload(String token) throws Exception {
        return SignedJWT.parse(token).getParsedParts()[1].decodeToString();
    }
}`}},

{id:'jose6',title:'Encryption with JWE (A256GCM + RSA-OAEP)',body:`
<p>A JWS is <b>signed</b>: trustworthy but readable. When the token itself must be <b>secret</b> (it carries PII, entitlements, or a nested token you don't want the client to see), you need <b>JWE</b> (JSON Web Encryption): the payload is encrypted so only the intended recipient can read it.</p>
<p><b>Key wrapping: the trick JWE uses.</b> There are two styles of encryption, each with a drawback: <i>symmetric</i> (one shared secret key: very fast, but how do both sides get the same secret safely?) and <i>public-key</i> (no shared secret needed, but slow and awkward for bulk data). JWE combines their strengths:</p>
<ul>
<li>generate a fresh, random one-time <b>Content Encryption Key</b> (CEK);</li>
<li>encrypt the payload with the CEK using <b>A256GCM</b> (AES-256 in GCM: fast, and it also tamper-detects);</li>
<li>then <b>wrap</b> (encrypt) that little CEK with the recipient's <b>RSA public key</b> using <b>RSA-OAEP</b>, and ship it alongside.</li>
</ul>
<p>Only the recipient's private key can <i>unwrap</i> the CEK, and only with the CEK can they decrypt the payload. Analogy: lock the letter in a strongbox with a fast padlock (A256GCM), then lock that padlock's key inside a small box only the recipient can open (RSA-OAEP). "Key wrapping" is exactly that small box.</p>
<div class="codeSample" data-hl>// encrypt to the recipient's PUBLIC key
EncryptedJWT jwe = new EncryptedJWT(
        new JWEHeader(JWEAlgorithm.RSA_OAEP_256, EncryptionMethod.A256GCM), // wrap alg + content enc
        claims);
jwe.encrypt(new RSAEncrypter(recipientPublic));
String token = jwe.serialize();     // FIVE dot-separated parts (not three)

// only the recipient's PRIVATE key can read it
EncryptedJWT back = EncryptedJWT.parse(token);
back.decrypt(new RSADecrypter(recipientPrivate));
String sub = back.getJWTClaimsSet().getSubject();</div>
<p><b>JWS vs JWE: the difference in one breath.</b> JWS answers "is this real and unchanged?"; JWE answers "is this hidden from everyone but the recipient?"</p>
<ul>
<li><b>Goal:</b> JWS = integrity + authenticity; JWE = confidentiality.</li>
<li><b>Readable by others:</b> JWS yes (base64, not secret); JWE no.</li>
<li><b>Shape:</b> JWS has 3 parts; JWE has 5.</li>
<li><b>Typical use:</b> JWS for normal OAuth/OIDC access &amp; ID tokens; JWE when the payload must stay private.</li>
</ul>
<p><b>Which to use, and when.</b> Reach for <b>JWS</b> by default: most access and ID tokens are <i>not</i> secret; the client is allowed to read them, you just need to trust the issuer and detect tampering. Reach for <b>JWE</b> when the token carries data that must be hidden from the client or from intermediaries (personal data, internal ids, sensitive entitlements), or when a policy requires it. Very often you want <b>both</b>: <b>sign, then encrypt</b>, a nested JWT (a JWS placed inside a JWE), so the recipient can confirm <i>who</i> issued it (signature) <i>and</i> nobody else can read it (encryption). Don't rely on JWE alone for authenticity: encryption proves secrecy, not who sent it; nest a JWS for that.</p>

<h4>The cookbook: the five parts, and what a failed decrypt means</h4>
<div class="codeSample" data-hl>header . encrypted-CEK . IV . ciphertext . auth-tag

header         alg (how the CEK is wrapped) + enc (how the payload is sealed)
encrypted CEK  the padlock key, locked to the recipient's public key
IV             fresh randomness for GCM; never reused under the same key
ciphertext     the payload, unreadable without the CEK
auth tag       GCM's tamper seal, covering ciphertext AND header

when decryption fails, the failure tells you where to look:
  CEK unwrap fails         wrong private key: rotated key? wrong kid?
  auth tag fails           tampered or truncated in transit
  header alg unexpected    refuse BEFORE unwrapping. pin alg and enc the
                           same way JWS pins alg: the header is input.</div>`,
docs:[['RFC 7516 (JSON Web Encryption)','https://www.rfc-editor.org/rfc/rfc7516'],['RFC 7518 §4-5 (key management & content encryption)','https://www.rfc-editor.org/rfc/rfc7518#section-4'],['Nimbus (encrypting a JWT)','https://connect2id.com/products/nimbus-jose-jwt/examples/jwt-with-rsa-encryption']],
ex:{title:'Encrypt and decrypt a JWE',
prompt:`Write <code>Jwe</code> with: <code>static String encrypt(RSAKey recipientPublic, JWTClaimsSet claims)</code>: build an <code>EncryptedJWT</code> with a <code>new JWEHeader(JWEAlgorithm.RSA_OAEP_256, EncryptionMethod.A256GCM)</code>, encrypt with <code>new RSAEncrypter(recipientPublic)</code>, and return <code>serialize()</code>; and <code>static String decrypt(RSAKey recipientPrivate, String token)</code>: <code>EncryptedJWT.parse(token)</code>, <code>decrypt(new RSADecrypter(recipientPrivate))</code>, and return <code>getJWTClaimsSet().getSubject()</code>. Declare <code>throws Exception</code>.`,
starter:`import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.*;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jwt.*;

public class Jwe {
    static String encrypt(RSAKey recipientPublic, JWTClaimsSet claims) throws Exception {
        return null;
    }
    static String decrypt(RSAKey recipientPrivate, String token) throws Exception {
        return null;
    }
}`,
tests:[{d:'creates an EncryptedJWT',re:'new\\s+EncryptedJWT\\s*\\('},{d:'RSA-OAEP-256 key wrapping',re:'new\\s+JWEHeader\\s*\\(\\s*JWEAlgorithm\\.RSA_OAEP_256'},{d:'A256GCM content encryption',re:'EncryptionMethod\\.A256GCM'},{d:'encrypts to the public key',re:'new\\s+RSAEncrypter\\s*\\('},{d:'calls encrypt()',re:'\\.encrypt\\s*\\('},{d:'parses the JWE',re:'EncryptedJWT\\.parse\\s*\\('},{d:'decrypts with the private key',re:'new\\s+RSADecrypter\\s*\\('},{d:'calls decrypt()',re:'\\.decrypt\\s*\\('}],
behavior:`encrypt produces a five-part JWE that is unreadable without the private key. decrypt round-trips it back and returns the subject claim. Encrypting with the public key and decrypting with the matching private key succeeds; a different key fails to decrypt.`,
hints:['Header first: <code>new JWEHeader(JWEAlgorithm.RSA_OAEP_256, EncryptionMethod.A256GCM)</code>, the wrap algorithm and the content-encryption method.','<code>new EncryptedJWT(header, claims)</code> then <code>jwe.encrypt(new RSAEncrypter(recipientPublic))</code> then <code>serialize()</code>.','To read: <code>EncryptedJWT.parse</code>, <code>decrypt(new RSADecrypter(recipientPrivate))</code>, then <code>getJWTClaimsSet().getSubject()</code>.'],
solution:`import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.*;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jwt.*;

public class Jwe {
    static String encrypt(RSAKey recipientPublic, JWTClaimsSet claims) throws Exception {
        EncryptedJWT jwe = new EncryptedJWT(
                new JWEHeader(JWEAlgorithm.RSA_OAEP_256, EncryptionMethod.A256GCM),
                claims);
        jwe.encrypt(new RSAEncrypter(recipientPublic));
        return jwe.serialize();
    }
    static String decrypt(RSAKey recipientPrivate, String token) throws Exception {
        EncryptedJWT jwe = EncryptedJWT.parse(token);
        jwe.decrypt(new RSADecrypter(recipientPrivate));
        return jwe.getJWTClaimsSet().getSubject();
    }
}`}},

{id:'jose7',title:'SD-JWT: selective disclosure, and proving one fact',body:`
<p>Every token format so far has one property in common: <b>the verifier sees every claim</b>. A JWT
proving you are over 18 also hands over your exact date of birth, your name and your address, because
the signature covers the whole payload and removing a claim breaks it.</p>
<p>That is tolerable when the verifier is your own API. It is unacceptable when the verifier is a bar
checking your age, or a landlord checking your income: the emerging wallet and verifiable-credential
world, where a credential issued once is presented to many unrelated parties.
<b>SD-JWT</b> solves it: the holder chooses which claims to reveal, and the signature still verifies.</p>

<h4>How it works</h4>
<p>The trick is that the signed payload contains <b>hashes of claims, not the claims themselves</b>. The
actual values travel separately, as <i>disclosures</i>, and the holder decides which ones to include.</p>
<div class="codeSample" data-hl>1. ISSUER builds one disclosure per selectively-disclosable claim:
     disclosure = base64url( ["&lt;random salt&gt;", "birthdate", "1985-03-14"] )
     digest     = base64url( SHA-256( disclosure ) )

2. the signed JWT payload carries only the DIGESTS:
     { "iss": "https://dmv.example",
       "exp": 1798761600,
       "_sd": [ "5vX3...",      // digest of the birthdate disclosure
                "9aQ2...",      // digest of the name disclosure
                "Kp71..." ],    // digest of the address disclosure
       "_sd_alg": "sha-256" }

3. the credential is issued as the JWT plus ALL disclosures, tilde-separated:
     &lt;jwt&gt;~&lt;disclosure-birthdate&gt;~&lt;disclosure-name&gt;~&lt;disclosure-address&gt;

4. the HOLDER presents only what is needed, dropping the rest:
     &lt;jwt&gt;~&lt;disclosure-birthdate&gt;~

5. the VERIFIER hashes each disclosure it received and checks the digest is
   in _sd. The signature still verifies, because the payload never changed.</div>
<p>Nothing was removed from the signed document. The digests for name and address are still there; the
verifier simply cannot invert them, so it learns that two further claims exist without learning what
they are.</p>

<h4>The salt matters</h4>
<p>Each disclosure begins with fresh random salt, and it is not decoration. Without it, a verifier
holding a digest could brute-force the value: there are only so many plausible birthdates, and a
verifier could hash them all until one matched. The salt makes the digest input unguessable, so an
undisclosed claim stays genuinely hidden.</p>
<p>Salts must also be <b>unique per disclosure</b>. Reusing one lets a verifier recognize the same claim
value across two presentations, which quietly reintroduces the correlation the format exists to
prevent.</p>

<h4>Key binding: stopping the credential being passed around</h4>
<p>Selective disclosure alone leaves a hole. The presentation is just bytes: a verifier who receives it
could replay it elsewhere, and a holder could hand their credential to somebody else.</p>
<p><b>Key binding</b> closes it. The issuer includes the holder's public key in the signed payload
(<code>cnf</code>, the same confirmation claim used by DPoP), and the holder appends a small JWT signed
with the matching private key, naming the verifier and the moment:</p>
<div class="codeSample" data-hl>&lt;jwt&gt;~&lt;disclosure&gt;~&lt;KB-JWT&gt;

// the key-binding JWT
{ "typ": "kb+jwt", "alg": "ES256" }
{ "aud":   "https://bar.example",     // THIS verifier only
  "nonce": "&lt;value the verifier just supplied&gt;",
  "iat":   1767222000,
  "sd_hash": "&lt;hash of the JWT + disclosures being presented&gt;" }

// so a captured presentation cannot be replayed to a different verifier,
// and cannot be presented by anyone who lacks the holder's private key.</div>

<h4>What it does and does not solve</h4>
<ul>
<li><b>Solves data minimization.</b> Prove one fact, disclose one fact.</li>
<li><b>Solves holder binding</b>, with the key-binding JWT.</li>
<li><b>Does not make you unlinkable.</b> The issuer's signature is identical in every presentation, so
two colluding verifiers can tell they saw the same credential. Only more exotic cryptography (BBS+
signatures, zero-knowledge proofs) removes that, and SD-JWT deliberately trades it away for being
implementable with ordinary JOSE libraries today.</li>
<li><b>Does not hide that undisclosed claims exist.</b> The verifier sees three digests and knows you
withheld two things, which is occasionally itself informative.</li>
<li><b>Does not solve revocation</b>: status lists are a separate mechanism.</li>
</ul>
<p>That third point is the real limitation, and it is a deliberate design choice: SD-JWT is
"good privacy you can actually ship" rather than perfect privacy nobody deploys. It is the format
behind SD-JWT VC, and the one the European digital identity wallet work has converged on.</p>`,
docs:[['Selective Disclosure for JWTs (SD-JWT)','https://datatracker.ietf.org/doc/draft-ietf-oauth-selective-disclosure-jwt/'],['SD-JWT-based Verifiable Credentials (SD-JWT VC)','https://datatracker.ietf.org/doc/draft-ietf-oauth-sd-jwt-vc/'],['RFC 7800, the cnf claim','https://www.rfc-editor.org/rfc/rfc7800'],['W3C, Verifiable Credentials Data Model','https://www.w3.org/TR/vc-data-model-2.0/']],
ex:{title:'Verify a selective disclosure',
prompt:`Write <code>SdJwt</code> with three methods. <code>static java.util.List&lt;String&gt; parts(String presentation)</code> splits a tilde-separated presentation, returning an empty list when <code>presentation</code> is null or blank (use <code>split("~", -1)</code> so a trailing tilde is preserved). <code>static boolean disclosureAccepted(java.util.Set&lt;String&gt; sdDigests, String disclosureDigest)</code> is true only when both are non-null and the digest is listed in <code>_sd</code>. <code>static boolean keyBindingOk(String kbAud, String verifier, String kbNonce, String expectedNonce)</code> requires the audience to equal this verifier and the nonce to equal the one the verifier just issued, rejecting nulls; that is what stops a captured presentation being replayed elsewhere.`,
starter:`import java.util.*;

public class SdJwt {
    static List<String> parts(String presentation) {
        return null;
    }
    static boolean disclosureAccepted(Set<String> sdDigests, String disclosureDigest) {
        return false;
    }
    static boolean keyBindingOk(String kbAud, String verifier, String kbNonce, String expectedNonce) {
        return false;
    }
}`,
tests:[{d:'a missing presentation yields an empty list',re:'List\\s*\\.\\s*of\\s*\\(\\s*\\)|emptyList\\s*\\(\\s*\\)|new\\s+ArrayList'},{d:'null or blank input is handled',re:'(?:if\\s*\\(\\s*[^;{]*(?:==\\s*null|isBlank\\s*\\(\\s*\\))[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:return\\s+(?!\\s*!)[^;{]*(?:==\\s*null|isBlank\\s*\\(\\s*\\)))|(?:(?<h1>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:==\\s*null|isBlank\\s*\\(\\s*\\))[^{]*?return\\s+\\k<h1>\\b)'},{d:'parts are tilde-separated',re:'"~"'},{d:'the split keeps trailing empty parts',re:'split\\s*\\(\\s*"~"\\s*,\\s*-1\\s*\\)'},{d:'a disclosure must be listed in _sd',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:contains\\s*\\(\\s*disclosureDigest\\s*\\)))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:contains\\s*\\(\\s*disclosureDigest\\s*\\))[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:contains\\s*\\(\\s*disclosureDigest\\s*\\))[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:contains\\s*\\(\\s*disclosureDigest\\s*\\))[^{]*?return\\s+\\k<av>\\b)'},{d:'key binding checks the audience',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:kbAud\\s*\\.\\s*equals\\s*\\(\\s*verifier|verifier\\s*\\.\\s*equals\\s*\\(\\s*kbAud))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:kbAud\\s*\\.\\s*equals\\s*\\(\\s*verifier|verifier\\s*\\.\\s*equals\\s*\\(\\s*kbAud)[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:kbAud\\s*\\.\\s*equals\\s*\\(\\s*verifier|verifier\\s*\\.\\s*equals\\s*\\(\\s*kbAud)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:kbAud\\s*\\.\\s*equals\\s*\\(\\s*verifier|verifier\\s*\\.\\s*equals\\s*\\(\\s*kbAud)[^{]*?return\\s+\\k<av>\\b)'},{d:'key binding checks the nonce',re:'kbNonce\\s*\\.\\s*equals\\s*\\(\\s*expectedNonce|expectedNonce\\s*\\.\\s*equals\\s*\\(\\s*kbNonce'}],
behavior:`parts("jwt~d1~d2~") returns four elements, the last empty, because -1 preserves the trailing separator that marks the end of the disclosure list. parts(null) and parts("") return an empty list. disclosureAccepted(Set.of("5vX3"), "5vX3") is true; a digest absent from _sd is false, which is how a forged disclosure is caught even though the signature still verifies over the unchanged payload. keyBindingOk("https://bar","https://bar","n1","n1") is true; a mismatched audience or nonce, or any null, is false; without both checks a presentation captured by one verifier could be replayed to another.`,
hints:['Guard first, then <code>Arrays.asList(presentation.split("~", -1))</code>.','The -1 limit matters: the default drops trailing empty strings.','Both key-binding conditions must hold, and both comparisons need null guards.'],
solution:`import java.util.*;

public class SdJwt {
    static List<String> parts(String presentation) {
        if (presentation == null || presentation.isBlank()) return List.of();
        // -1 keeps the trailing empty element that terminates the disclosure list
        return Arrays.asList(presentation.split("~", -1));
    }
    static boolean disclosureAccepted(Set<String> sdDigests, String disclosureDigest) {
        // the payload never changed, so a forged disclosure is caught here, not by the signature
        return sdDigests != null && disclosureDigest != null && sdDigests.contains(disclosureDigest);
    }
    static boolean keyBindingOk(String kbAud, String verifier, String kbNonce, String expectedNonce) {
        if (kbAud == null || kbNonce == null) return false;
        // audience + nonce: this verifier, this moment
        return kbAud.equals(verifier) && kbNonce.equals(expectedNonce);
    }
}`}},

{id:'jose8',title:'Crypto agility: kid, alg, and the post-quantum migration',body:`
<p>Every algorithm in production today is on a path to becoming a liability. MD5 and SHA-1 were once
default choices; 1024-bit RSA was once prudent. The question a system should be designed to answer is not
"is this algorithm safe?" but <b>"how long would it take us to stop using it?"</b> That property is
<b>crypto agility</b>. JOSE has the machinery for it built in, which most deployments then defeat by
hardcoding one algorithm in a dozen places.</p>

<h4>The two header fields that make rotation possible</h4>
<p><code>kid</code> names <i>which key</i> signed this token; <code>alg</code> names <i>which
algorithm</i> was used. A JWKS can publish several keys at once, of different types, so a rotation is a
sequence with no downtime:</p>
<div class="codeSample" data-hl>1. publish the new key in the JWKS   (both keys present, old one still signing)
2. wait longer than your JWKS cache TTL   <- verifiers must have seen it
3. start signing with the new kid
4. keep the old key published for at least max token lifetime
5. remove the old key

// a verifier that selects by kid needs no coordination at all:
//   header.kid -> look up in cached JWKS -> unknown? refresh once, rate-limited -> verify</div>
<p>Steps 2 and 4 are the ones people skip, and each has its own failure mode. Skip step 2 and verifiers
reject tokens signed by a key they have not fetched yet. Skip step 4 and tokens still inside their
validity window fail. Both look like an outage; neither looks like a key problem.</p>

<h4>The verifier decides the algorithm, never the token</h4>
<p>The rule from the validation checklist deserves repeating here because agility is where it gets
violated: <b>your policy names the acceptable algorithms, and the token's <code>alg</code> is checked
against that list</b>. Selecting a verification routine from the header is how <code>alg: "none"</code>
and the RS256-to-HS256 confusion attack work. In the latter, an attacker re-signs a token with HMAC,
using the RSA <i>public</i> key as the shared secret. A verifier that trusts the header then validates
the forgery happily.</p>
<p>Agility and this rule fit together neatly: the policy is a <i>list</i>, so adding an algorithm is a
config change, while everything absent from the list is refused by default.</p>

<h4>Where post-quantum actually sits</h4>
<p>NIST standardized ML-KEM (key establishment), ML-DSA and SLH-DSA (signatures) in 2024. The urgency
differs sharply by use:</p>
<ul>
<li><b>Confidentiality is urgent</b>, because of <i>harvest now, decrypt later</i>: traffic captured today
can be decrypted once a cryptographically relevant quantum computer exists. This is why browsers and
servers already negotiate <b>hybrid</b> TLS key exchange (X25519 combined with ML-KEM), and why long-lived
JWE-encrypted data deserves attention now.</li>
<li><b>Signatures are less urgent</b>, because a signature only needs to resist forgery <i>during the
lifetime of the thing it signs</i>. A five-minute access token is not a harvest-now target. Long-lived
artifacts (certificates, firmware, verifiable credentials valid for years) are.</li>
</ul>
<p>The practical answer for an identity system in 2026 is not to swap to ML-DSA everywhere. It is:
<b>inventory where each algorithm is named</b>, remove the hardcoded strings, keep token lifetimes short,
make key rotation a routine drill rather than an incident, prefer hybrid key exchange where the library
offers it, and use a maintained crypto library instead of your own. A system that can rotate keys on a
Tuesday afternoon can change algorithms; a system where rotation requires a release train cannot, whatever
its algorithm choice is today.</p>`,
docs:[['RFC 7517, JSON Web Key (kid, key sets)','https://www.rfc-editor.org/rfc/rfc7517'],['NIST post-quantum standards (FIPS 203/204/205)','https://csrc.nist.gov/projects/post-quantum-cryptography'],['RFC 8725, JWT best current practices','https://www.rfc-editor.org/rfc/rfc8725']],
ex:{title:'Enforce an algorithm policy',lang:'js',
run:{call:'acceptAlg',cases:[{name:'an algorithm on the policy list',args:['ES256',['ES256','RS256']],expect:true},{name:'alg none is always refused',args:['none',['ES256','RS256']],expect:false},{name:'HS256 when policy allows only RS256, the confusion attack',args:['HS256',['RS256']],expect:false},{name:'algorithm names are case-sensitive',args:['es256',['ES256']],expect:false},{name:'an empty policy accepts nothing',args:['ES256',[]],expect:false}]},
prompt:`Write <code>function acceptAlg(tokenAlg, allowedAlgs)</code> returning <code>true</code> only when the token's algorithm appears in <b>your</b> policy list. <code>"none"</code> is refused even if somebody put it in the list. An empty or missing list accepts nothing, and comparison is exact: <code>"es256"</code> is not <code>"ES256"</code>.`,
starter:`function acceptAlg(tokenAlg, allowedAlgs) {
  return false;
}`,
solution:`function acceptAlg(tokenAlg, allowedAlgs) {
  if (!tokenAlg || !allowedAlgs || allowedAlgs.length === 0) return false;
  if (tokenAlg === "none") return false;      // never, under any policy
  return allowedAlgs.includes(tokenAlg);      // your list, not the token's claim
}`,
tests:[{d:'a missing algorithm or policy is refused',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:!tokenAlg|!allowedAlgs))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:!tokenAlg|!allowedAlgs)[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:!tokenAlg|!allowedAlgs)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:!tokenAlg|!allowedAlgs)[^{]*?return\\s+\\k<av>\\b)'},{d:'an empty policy accepts nothing',re:'length\\s*===\\s*0|length\\s*==\\s*0|!allowedAlgs\\.length'},{d:'alg none is rejected explicitly',re:'(?:if\\s*\\(\\s*[^;{]*(?:["\\x27]none["\\x27])[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:return\\s+(?!\\s*!)[^;{]*(?:["\\x27]none["\\x27]))|(?:(?<h1>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:["\\x27]none["\\x27])[^{]*?return\\s+\\k<h1>\\b)'},{d:'membership of the policy list decides',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:allowedAlgs\\s*\\.\\s*includes|indexOf\\s*\\(\\s*tokenAlg))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:allowedAlgs\\s*\\.\\s*includes|indexOf\\s*\\(\\s*tokenAlg)[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:allowedAlgs\\s*\\.\\s*includes|indexOf\\s*\\(\\s*tokenAlg)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:allowedAlgs\\s*\\.\\s*includes|indexOf\\s*\\(\\s*tokenAlg)[^{]*?return\\s+\\k<av>\\b)'}],
behavior:`Five cases execute. The HS256-against-an-RS256-policy case is the confusion attack in miniature: an attacker takes your published RSA public key, uses it as an HMAC secret, sets alg to HS256, and a verifier that dispatches on the header verifies the forgery. Refusing anything outside your own list makes the attack impossible rather than merely difficult. The empty-policy case matters because a config that failed to load must fail closed; an empty allowlist that accepts everything is the classic inverted default. And case sensitivity is deliberate: algorithm identifiers are exact registry strings, so a "helpful" lowercase comparison widens what you accept.`,
hints:['Fail closed first: missing token alg, missing list, or an empty list are all refusals.','"none" gets its own explicit check; do not rely on it being absent from the list.','Then it is a membership test against your policy, compared exactly.']}}

]});
