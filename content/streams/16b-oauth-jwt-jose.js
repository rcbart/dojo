STREAMS.push({icon:'🔑',title:'OAuth, JWT & JOSE (JWK · JWS · JWE)',blurb:'Generate JWKs, mint and sign JWTs (RS256/ES256), verify them against a JWKS well-known endpoint, watch tampering fail, and encrypt with JWE — the token layer of OAuth/OIDC, in Java with Nimbus JOSE+JWT.',lessons:[

{id:'jose1',title:'Signing keys as JWKs (RSA-2048 & EC P-256)',body:`
<p>OAuth and OpenID Connect hand out <b>tokens</b> that a receiver must be able to <i>trust</i>. Trust comes from a <b>signature</b>, and a signature needs a <b>key pair</b>:</p>
<ul>
<li>the <b>private key</b> signs tokens — kept secret by the Authorization Server;</li>
<li>the <b>public key</b> verifies them — published for everyone to fetch.</li>
</ul>
<p>Those keys are shared in a standard JSON shape called a <b>JWK</b> (JSON Web Key, RFC 7517). Two families dominate JWT signing:</p>
<ul>
<li><b>RSA-2048</b> &rarr; algorithm <b>RS256</b>. The classic default; larger keys and signatures.</li>
<li><b>EC P-256</b> &rarr; algorithm <b>ES256</b>. Modern elliptic-curve keys — far smaller for the same security.</li>
</ul>
<p>With the Nimbus JOSE+JWT library, a generator produces a JWK directly, tagged with its metadata:</p>
<div class="codeSample" data-hl>// RSA-2048 signing key, as a JWK
RSAKey rsa = new RSAKeyGenerator(2048)
        .keyUse(KeyUse.SIGNATURE)          // use: "sig" — this key is for signatures
        .algorithm(JWSAlgorithm.RS256)     // alg: RS256
        .keyIDFromThumbprint(true)         // kid: a stable RFC 7638 fingerprint of the key
        .generate();

RSAKey publicOnly = rsa.toPublicJWK();     // safe to publish; strips the private half
String json = publicOnly.toJSONString();   // the JSON you serve at a JWKS endpoint</div>
<p>The <b>kid</b> (key ID) is important: it is a stable label for the key. Because issuers hold several keys and rotate them, the kid is how a verifier later knows <i>which</i> key signed a given token (next lessons).</p>`,
docs:[['Nimbus JOSE+JWT','https://connect2id.com/products/nimbus-jose-jwt'],['RFC 7517 — JSON Web Key','https://www.rfc-editor.org/rfc/rfc7517'],['RFC 7638 — JWK Thumbprint','https://www.rfc-editor.org/rfc/rfc7638']],
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
behavior:`rsa() returns a 2048-bit RSAKey with use=sig, alg=RS256, and a thumbprint kid. ec() returns a P-256 ECKey with alg=ES256. publicJwkJson strips the private half so the result contains no "d" (or p/q) — only public members — and is safe to publish.`,
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
<p>A <b>JWT</b> (JSON Web Token) is three base64url pieces joined by dots: <code>header.payload.signature</code>. The <b>payload</b> is a JSON object of <b>claims</b> — statements about the token. Crucially, until it is encrypted (JWE, last lesson) the payload is <i>not secret</i>: anyone can base64url-decode and read it. Signing makes it <i>tamper-proof</i>, not <i>hidden</i>.</p>
<p>Here is what the standard claims mean, in plain terms:</p>
<ul>
<li><b>iss</b> (issuer) — <i>who minted the token.</i> The Authorization Server's identifier (usually its URL). Like the letterhead on a letter: it says who is vouching for this.</li>
<li><b>sub</b> (subject) — <i>who the token is about.</i> The user or service id. "This token concerns user 1234."</li>
<li><b>aud</b> (audience) — <i>who the token is for.</i> The API meant to accept it. Like a ticket stamped "valid at Cinema A only" — a service must <b>reject</b> tokens not addressed to it.</li>
<li><b>exp</b> (expiration) — <i>when it stops being valid.</i> A use-by timestamp; a verifier rejects expired tokens. Keep it short.</li>
<li><b>iat</b> / <b>nbf</b> (issued-at / not-before) — when it was created, and the earliest it may be used.</li>
<li><b>jti</b> (JWT ID) — a unique id, handy for one-time-use or revocation lists.</li>
</ul>
<p>Beyond these you add <b>custom claims</b> for your app — for example a <code>role</code> the API uses for authorization. (In real systems, namespace custom claims, e.g. <code>https://myapp/role</code>, so they never collide with standard ones.)</p>
<div class="codeSample" data-hl>JWTClaimsSet claims = new JWTClaimsSet.Builder()
        .issuer("https://auth.example.com")     // iss — who signed it
        .subject("user-1234")                   // sub — who it is about
        .audience("https://api.example.com")    // aud — who may accept it
        .expirationTime(new Date(now + 900_000))// exp — valid 15 minutes
        .issueTime(new Date())                  // iat — now
        .claim("role", "admin")                 // custom claim
        .build();</div>`,
docs:[['RFC 7519 — JSON Web Token','https://www.rfc-editor.org/rfc/rfc7519'],['IANA JWT claims registry','https://www.iana.org/assignments/jwt/jwt.xhtml'],['Nimbus — JWTClaimsSet','https://www.javadoc.io/doc/com.nimbusds/nimbus-jose-jwt/latest/com/nimbusds/jwt/JWTClaimsSet.html']],
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
hints:['It is one fluent chain returned directly.','audience(String) is a convenience overload — no list needed.','Finish with <code>.build()</code>.'],
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
<p><b>Same token, two algorithms — measurably different.</b> Sign the identical claims with RS256 and ES256 and compare:</p>
<ul>
<li><b>Token size.</b> An RS256 signature is the size of the RSA modulus — <b>256 bytes</b> for RSA-2048 — so the token is noticeably larger. An ES256 signature is only <b>64 bytes</b>, giving a much smaller token. Over millions of requests (every one carries the token) that bandwidth adds up.</li>
<li><b>Signing time.</b> RSA <i>signing</i> is comparatively slow; EC <i>signing</i> is fast. (Verification is the opposite: RSA verifies very fast, EC a little slower — relevant because tokens are verified far more often than signed.)</li>
</ul>
<div class="codeSample" data-hl>// measure it yourself — bracket each sign with System.nanoTime()
long t0 = System.nanoTime();
String tok = sign(rsa, claims);
double ms = (System.nanoTime() - t0) / 1_000_000.0;
System.out.println("RS256 size=" + tok.length() + " chars, sign=" + ms + "ms");</div>
<p>In the exercise below you'll write a <code>compare()</code> method that does exactly this for <b>both</b> algorithms and prints the two lines side by side, so the size and speed difference is right in front of you.</p>
<p><b>Which to pick?</b> ES256 for smaller tokens and fast signing (great for high token issuance and mobile/bandwidth-sensitive clients); RS256 when your ecosystem/verifiers expect RSA or you want the fastest verification. Both are secure — this is an engineering trade-off, not a security one.</p>`,
docs:[['RFC 7515 — JSON Web Signature','https://www.rfc-editor.org/rfc/rfc7515'],['RFC 7518 — JWA (algorithms)','https://www.rfc-editor.org/rfc/rfc7518'],['Nimbus — signing a JWT','https://connect2id.com/products/nimbus-jose-jwt/examples/signed-jwt']],
ex:{title:'Sign with RS256 and ES256',
prompt:`Write <code>JwtSigner</code> with: <code>static String sign(RSAKey key, JWTClaimsSet claims)</code> — build a <code>SignedJWT</code> with a <code>JWSHeader.Builder(JWSAlgorithm.RS256).keyID(key.getKeyID()).build()</code>, sign it with <code>new RSASSASigner(key)</code>, and return <code>serialize()</code>; and <code>static String signEc(ECKey key, JWTClaimsSet claims)</code> — same but <code>JWSAlgorithm.ES256</code> and <code>new ECDSASigner(key)</code>. Then add <code>static String compare(RSAKey rsa, ECKey ec, JWTClaimsSet claims)</code> that signs the <b>same</b> claims with both algorithms, <b>times each signing with <code>System.nanoTime()</code></b> (capture the time just before and after each sign), builds a report showing each token's size via <code>length()</code> and its sign time in milliseconds, <b>prints it with <code>System.out.print(...)</code></b> so you can see the results, and returns that report string. Declare <code>throws Exception</code>.`,
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
behavior:`sign returns a compact "a.b.c" string that verifies with the matching public key. compare signs the same claims with RS256 and ES256, times each with System.nanoTime(), and prints (and returns) a report like — "RS256: 640 chars, signed in 3.10 ms / ES256: 430 chars, signed in 0.45 ms" — so you can see that the RS256 token is larger (256-byte vs 64-byte signature) and that EC signs faster.`,
hints:['<code>new SignedJWT(header, claims)</code> then <code>jwt.sign(signer)</code> then <code>jwt.serialize()</code>.','Time a call by bracketing it: <code>long t0 = System.nanoTime(); String tok = sign(rsa, claims); long ns = System.nanoTime() - t0;</code> — milliseconds are <code>ns / 1_000_000.0</code>.','Build the report with <code>String.format(...)</code> using <code>tok.length()</code> and the millis, then <code>System.out.print(report); return report;</code>'],
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
<p>A resource server (your API) receives a token and must decide whether to trust it. It never has the issuer's private key — it uses the issuer's <b>public</b> keys, published as a <b>JWKS</b> (JWK Set): a JSON document holding one or more public JWKs. Issuers expose it at a well-known URL, e.g. <code>https://auth.example.com/.well-known/jwks.json</code> (OIDC discovery at <code>/.well-known/openid-configuration</code> points to it via <code>jwks_uri</code>). You fetch it once and <b>cache</b> it.</p>
<p><b>What to check, and in what order</b> — this is the whole job of verification:</p>
<ul>
<li><b>1. Parse, don't trust.</b> Decode the token into header + payload. Nothing is believed yet.</li>
<li><b>2. Decide the key — pick the right JWK.</b> Read the header's <code>kid</code> and find the JWK in the set with the <i>same</i> kid. Think of the JWKS as a <b>keyring</b> and the kid as the <b>label on each key</b>: the token tells you which key signed it, so you don't have to try them all. (Issuers publish several keys and rotate them; the kid is how you keep up.) Also confirm the chosen key's <code>use</code> is <i>sig</i> and its <code>alg</code> is the asymmetric algorithm you expect.</li>
<li><b>3. Fix the algorithm yourself.</b> Only accept the alg(s) you intended (e.g. RS256/ES256). <b>Never</b> accept <code>alg: none</code>, and never let the token's header talk you into a different algorithm family — that is the classic "algorithm-confusion" attack.</li>
<li><b>4. Verify the signature</b> with the chosen public key. If it fails, stop — the token is forged or corrupted.</li>
<li><b>5. Only now, check the claims.</b> <code>exp</code> not in the past; <code>iss</code> is an issuer you trust; <code>aud</code> contains <i>this</i> service; <code>nbf</code> not in the future. A perfectly-signed token still must be addressed to you and still valid.</li>
</ul>
<div class="codeSample" data-hl>JWKSet jwks = JWKSet.load(new URL("http://localhost:8080/.well-known/jwks.json")); // fetch + cache
SignedJWT jwt = SignedJWT.parse(token);                 // 1. parse
String kid = jwt.getHeader().getKeyID();                 // 2. which key?
JWK jwk = jwks.getKeyByKeyId(kid);                        //    pick by kid
boolean sig = jwt.verify(new RSASSAVerifier(jwk.toRSAKey())); // 4. signature
JWTClaimsSet c = jwt.getJWTClaimsSet();                   // 5. claims
boolean fresh = c.getExpirationTime().after(new Date());</div>
<p>Run a tiny local server that serves your public JWK at <code>/.well-known/jwks.json</code> and point the verifier at it — that is exactly how the real handshake works, just on localhost.</p>`,
docs:[['OpenID Connect Discovery','https://openid.net/specs/openid-connect-discovery-1_0.html'],['Nimbus — validating JWT access tokens','https://connect2id.com/products/nimbus-jose-jwt/examples/validating-jwt-access-tokens'],['RFC 8725 — JWT best practices','https://www.rfc-editor.org/rfc/rfc8725']],
ex:{title:'Verify against a JWKS',
prompt:`Write <code>JwtVerifier</code> with <code>static boolean verify(String jwksUrl, String token, String expectedIssuer, String expectedAudience)</code> that: loads the key set with <code>JWKSet.load(new URL(jwksUrl))</code>; parses the token with <code>SignedJWT.parse(token)</code>; reads the kid via <code>jwt.getHeader().getKeyID()</code> and selects the JWK with <code>jwks.getKeyByKeyId(kid)</code> (return <code>false</code> if none); verifies the signature with <code>new RSASSAVerifier(jwk.toRSAKey())</code> (return false if it fails); then checks the claims — <code>getExpirationTime()</code> is after now, <code>getIssuer()</code> equals <code>expectedIssuer</code>, and <code>getAudience()</code> contains <code>expectedAudience</code>. Return <code>true</code> only if all pass. Declare <code>throws Exception</code>.`,
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
tests:[{d:'loads the JWKS from the URL',re:'JWKSet\\.load\\s*\\(\\s*new\\s+URL'},{d:'parses the token',re:'SignedJWT\\.parse\\s*\\('},{d:'reads the kid from the header',re:'getHeader\\s*\\(\\s*\\)\\s*\\.\\s*getKeyID'},{d:'selects the JWK by kid',re:'getKeyByKeyId\\s*\\('},{d:'verifies with the public RSA key',re:'new\\s+RSASSAVerifier\\s*\\('},{d:'checks the signature',re:'\\.verify\\s*\\('},{d:'checks expiry',re:'getExpirationTime\\s*\\('},{d:'checks issuer',re:'getIssuer\\s*\\('},{d:'checks audience',re:'getAudience\\s*\\('}],
behavior:`Given a JWKS URL that serves the signer's public key, verify() returns true for a genuine, unexpired token whose iss/aud match, and false if: the kid is unknown, the signature fails, the token is expired, the issuer is wrong, or the audience does not include this service.`,
hints:['Fetch first: <code>JWKSet jwks = JWKSet.load(new URL(jwksUrl));</code>','Pick the key: <code>JWK jwk = jwks.getKeyByKeyId(jwt.getHeader().getKeyID());</code> — bail out if null.','Signature before claims: <code>if (!jwt.verify(new RSASSAVerifier(jwk.toRSAKey()))) return false;</code> then check exp/iss/aud.'],
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
<p>The signature is computed over <code>base64url(header) + "." + base64url(payload)</code>. So if an attacker edits even a single character of the payload — say flips <code>"role":"user"</code> to <code>"role":"admin"</code> — and re-encodes it, the signature no longer matches the new bytes, and <code>verify()</code> returns <b>false</b>. To make a matching signature they would need the <b>private key</b>, which they don't have.</p>
<p>Two truths that surprise people, both shown here:</p>
<ul>
<li><b>You can read a JWT</b> without any key — the payload is just base64url. So never put secrets in a JWS payload; signing proves <i>authenticity and integrity</i>, not <i>confidentiality</i>. (If you need it hidden, that's JWE — next lesson.)</li>
<li><b>You cannot forge one</b> — any change breaks the signature, and only the holder of the private key can produce a valid one.</li>
</ul>
<div class="codeSample" data-hl>// read the payload with no key — it is NOT secret
String payloadJson = SignedJWT.parse(token).getParsedParts()[1].decodeToString();

// verification catches ANY change to header or payload
boolean valid = SignedJWT.parse(token).verify(new RSASSAVerifier(publicKey));
// tamper with the middle segment, keep the old signature -> valid == false</div>
<div style="border:1px solid #26313d;border-radius:10px;padding:14px;margin:16px 0;background:#0b1017">
<div style="font-weight:700;margin-bottom:6px">🔬 Try it live — tamper with a real JWT (runs in your browser with Web Crypto, ES256)</div>
<button id="jt-gen" onclick="jwtTamper.gen()" style="background:#155e59;color:#fff;border:0;border-radius:8px;padding:8px 14px;cursor:pointer;font-size:13px">Generate &amp; sign a JWT</button>
<div style="font-size:13px;color:#93a1b1;margin:10px 0 4px">Now edit the payload — change <code>"role": "user"</code> to <code>"admin"</code>, or anything at all — and watch the signature stop matching:</div>
<textarea id="jt-payload" oninput="jwtTamper.edit(this)" spellcheck="false" placeholder="Click &quot;Generate &amp; sign&quot; first…" style="width:100%;height:104px;background:#141b23;color:#e6edf3;border:1px solid #26313d;border-radius:8px;padding:8px;font-family:monospace;font-size:12.5px"></textarea>
<div id="jt-status" style="font-weight:700;margin:10px 0;min-height:1.2em"></div>
<div style="font-size:12px;color:#93a1b1">Signing input (base64url header.payload):</div>
<div id="jt-siginput" style="word-break:break-all;font-family:monospace;font-size:11px;color:#8be9c9;margin-bottom:8px"></div>
<div style="font-size:12px;color:#93a1b1">Signature carried in the token (fixed — from the original signing):</div>
<div id="jt-origsig" style="word-break:break-all;font-family:monospace;font-size:11px;color:#e6edf3;margin-bottom:8px"></div>
<div style="font-size:12px;color:#93a1b1">Signature THIS payload would require (re-signed here with the private key — an attacker can’t do this):</div>
<div id="jt-newsig" style="word-break:break-all;font-family:monospace;font-size:11px;color:#f5b301;margin-bottom:6px"></div>
<div style="font-size:12px;color:#93a1b1">The two signatures are: <span id="jt-diff" style="color:#e6edf3"></span></div>
<div style="font-size:12px;color:#93a1b1;margin-top:8px">Tampered token: <span id="jt-token" style="word-break:break-all;font-family:monospace;font-size:10.5px;color:#93a1b1"></span></div>
</div>
<p>This is the property the whole OAuth trust model rests on: the resource server never trusts the token's contents until the signature check passes with the issuer's public key.</p>`,
docs:[['RFC 7515 §5.2 — verifying a JWS','https://www.rfc-editor.org/rfc/rfc7515#section-5.2'],['RFC 8725 — JWT best current practices','https://www.rfc-editor.org/rfc/rfc8725'],['Nimbus — Base64URL','https://www.javadoc.io/doc/com.nimbusds/nimbus-jose-jwt/latest/com/nimbusds/jose/util/Base64URL.html']],
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
tests:[{d:'parses the token',re:'SignedJWT\\.parse\\s*\\('},{d:'builds an RSA verifier',re:'new\\s+RSASSAVerifier\\s*\\('},{d:'calls verify()',re:'\\.verify\\s*\\('},{d:'returns the inverse of verify (invalid == tampered)',re:'return\\s*!'},{d:'reads the payload segment',re:'getParsedParts\\s*\\(\\s*\\)\\s*\\[\\s*1\\s*\\]'},{d:'decodes base64url to text',re:'decodeToString\\s*\\('}],
behavior:`For a genuine token isTampered returns false; for a token whose payload was modified after signing it returns true. decodePayload returns the readable claims JSON with no key at all — demonstrating that a JWS hides nothing.`,
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
<p>A JWS is <b>signed</b> — trustworthy but readable. When the token itself must be <b>secret</b> (it carries PII, entitlements, or a nested token you don't want the client to see), you need <b>JWE</b> (JSON Web Encryption): the payload is encrypted so only the intended recipient can read it.</p>
<p><b>Key wrapping — the trick JWE uses.</b> There are two styles of encryption, each with a drawback: <i>symmetric</i> (one shared secret key — very fast, but how do both sides get the same secret safely?) and <i>public-key</i> (no shared secret needed — but slow, and awkward for bulk data). JWE combines their strengths:</p>
<ul>
<li>generate a fresh, random one-time <b>Content Encryption Key</b> (CEK);</li>
<li>encrypt the payload with the CEK using <b>A256GCM</b> (AES-256 in GCM — fast, and it also tamper-detects);</li>
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
<p><b>JWS vs JWE — the difference in one breath.</b> JWS answers "is this real and unchanged?"; JWE answers "is this hidden from everyone but the recipient?"</p>
<ul>
<li><b>Goal:</b> JWS = integrity + authenticity; JWE = confidentiality.</li>
<li><b>Readable by others:</b> JWS yes (base64, not secret); JWE no.</li>
<li><b>Shape:</b> JWS has 3 parts; JWE has 5.</li>
<li><b>Typical use:</b> JWS for normal OAuth/OIDC access &amp; ID tokens; JWE when the payload must stay private.</li>
</ul>
<p><b>Which to use, and when.</b> Reach for <b>JWS</b> by default — most access and ID tokens are <i>not</i> secret; the client is allowed to read them, you just need to trust the issuer and detect tampering. Reach for <b>JWE</b> when the token carries data that must be hidden from the client or from intermediaries (personal data, internal ids, sensitive entitlements), or when a policy requires it. Very often you want <b>both</b>: <b>sign, then encrypt</b> — a nested JWT (a JWS placed inside a JWE) — so the recipient can confirm <i>who</i> issued it (signature) <i>and</i> nobody else can read it (encryption). Don't rely on JWE alone for authenticity: encryption proves secrecy, not who sent it — nest a JWS for that.</p>`,
docs:[['RFC 7516 — JSON Web Encryption','https://www.rfc-editor.org/rfc/rfc7516'],['RFC 7518 §4-5 — key management & content encryption','https://www.rfc-editor.org/rfc/rfc7518#section-4'],['Nimbus — encrypting a JWT','https://connect2id.com/products/nimbus-jose-jwt/examples/jwt-with-rsa-encryption']],
ex:{title:'Encrypt and decrypt a JWE',
prompt:`Write <code>Jwe</code> with: <code>static String encrypt(RSAKey recipientPublic, JWTClaimsSet claims)</code> — build an <code>EncryptedJWT</code> with a <code>new JWEHeader(JWEAlgorithm.RSA_OAEP_256, EncryptionMethod.A256GCM)</code>, encrypt with <code>new RSAEncrypter(recipientPublic)</code>, and return <code>serialize()</code>; and <code>static String decrypt(RSAKey recipientPrivate, String token)</code> — <code>EncryptedJWT.parse(token)</code>, <code>decrypt(new RSADecrypter(recipientPrivate))</code>, and return <code>getJWTClaimsSet().getSubject()</code>. Declare <code>throws Exception</code>.`,
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
hints:['Header first: <code>new JWEHeader(JWEAlgorithm.RSA_OAEP_256, EncryptionMethod.A256GCM)</code> — the wrap algorithm and the content-encryption method.','<code>new EncryptedJWT(header, claims)</code> then <code>jwe.encrypt(new RSAEncrypter(recipientPublic))</code> then <code>serialize()</code>.','To read: <code>EncryptedJWT.parse</code>, <code>decrypt(new RSADecrypter(recipientPrivate))</code>, then <code>getJWTClaimsSet().getSubject()</code>.'],
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
}`}}

]});
