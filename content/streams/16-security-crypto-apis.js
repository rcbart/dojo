STREAMS.push({icon:'🔐',title:'Security & Crypto APIs',blurb:'Hashing, password storage, AES-GCM, signatures & HMAC, keystores and TLS: the JCA, done right.',lessons:[
{id:'sec1',title:'Hashing & password storage',body:`
<p>Two different jobs people confuse:</p>
<div class="codeSample" data-hl>// INTEGRITY hashing, fast by design (checksums, dedup, content ids)
MessageDigest md = MessageDigest.getInstance("SHA-256");
byte[] hash = md.digest(data);
String hex = HexFormat.of().formatHex(hash);       // Java 17+

// PASSWORD storage, must be SLOW and SALTED. Never bare SHA-256!
byte[] salt = new byte[16];
new SecureRandom().nextBytes(salt);                 // SecureRandom, never Random
PBEKeySpec spec = new PBEKeySpec(password, salt, 210_000, 256);  // OWASP-level iterations
SecretKeyFactory f = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
byte[] derived = f.generateSecret(spec).getEncoded();
// store: salt + iterations + derived, verify by re-deriving and comparing
// constant-time: MessageDigest.isEqual(a, b), never Arrays.equals for secrets</div>
<p>Why slow &amp; salted: a fast hash lets attackers try billions of guesses per second against a leaked table; the salt kills rainbow tables; iterations make each guess cost real time. In new systems prefer Argon2/bcrypt via a library (Spring Security's <code>PasswordEncoder</code>); PBKDF2 is the built-in JCA option. In CIAM, password storage policy is an audit line item; this is the vocabulary behind it.</p>

<h4>Choosing the work factor</h4>
<p>Every password hash has a cost parameter: PBKDF2 iterations, bcrypt rounds, Argon2's memory and time. It is not a constant you copy once; it is a <b>budget</b>. Pick the highest cost your login endpoint can absorb at peak, then revisit it as hardware improves. The usual calibration is to target roughly 250 milliseconds per hash on production hardware, which is imperceptible to a user logging in once and ruinous to an attacker trying a leaked list.</p>
<p>That cost has a direct consequence worth designing for: password verification is now expensive on purpose, so an unauthenticated endpoint that hashes on every request is a denial-of-service surface. Rate-limit before you hash, not after.</p>

<h4>Why Argon2 beats PBKDF2 on modern hardware</h4>
<p>PBKDF2 is <i>compute</i>-hard, and compute is exactly what a GPU has thousands of units of: a single card tries billions of PBKDF2-SHA256 guesses per second. Argon2id is <b>memory</b>-hard: each guess needs a configurable block of RAM, which a GPU cannot parallelize cheaply because memory, not arithmetic, becomes the bottleneck. bcrypt sits in between, with a small fixed memory requirement that still frustrates naive GPU cracking. Prefer Argon2id for new systems, accept bcrypt in existing ones, and use PBKDF2 when a FIPS-validated primitive is mandatory.</p>

<h4>Storing and upgrading</h4>
<p>Store the algorithm, its parameters, the salt and the derived key in one self-describing string: the <code>$argon2id$v=19$m=65536,t=3,p=4$salt$hash</code> convention, or Spring Security's <code>{bcrypt}</code> prefix. That is what makes a migration possible without a mass reset: on a successful login you have the plaintext for a moment, so re-hash with the new parameters and write it back. Systems that stored a bare hash with no parameters cannot do this, and they are the reason "we cannot upgrade our password hashing" appears in real incident reviews.</p>
<p>Two more rules that fail quietly. Compare with a <b>constant-time</b> function (<code>MessageDigest.isEqual</code>) so response timing does not leak how much of a value matched. And never truncate or pre-hash into bcrypt without knowing its 72-byte input limit: passwords longer than that are silently ignored past the cut.</p>`,
docs:[['OWASP Password Storage Cheat Sheet','https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html'],['MessageDigest (API)','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/security/MessageDigest.html']],
ex:{title:'Hash the right way twice',
prompt:`Write <code>Hashing</code> with: <code>static String sha256Hex(byte[] data)</code> returning the <b>SHA-256 digest of data as a lowercase hex string</b> (64 chars) using <code>MessageDigest</code> + <code>HexFormat</code>; <code>static byte[] newSalt()</code> returning <b>16 random bytes</b> from <code>SecureRandom</code> (different every call); and <code>static byte[] hashPassword(char[] password, byte[] salt)</code> returning the <b>PBKDF2 hash of the password with that salt</b>: <code>PBKDF2WithHmacSHA256</code>, <b>210_000 iterations</b>, 256-bit key length (same password+salt → same hash; different salt → different hash). Declare <code>throws Exception</code> where needed.`,
starter:`import java.security.*;
import java.util.HexFormat;
import javax.crypto.*;
import javax.crypto.spec.*;

public class Hashing {
    static String sha256Hex(byte[] data) throws Exception {
        return null;
    }

    static byte[] newSalt() {
        return null;
    }

    static byte[] hashPassword(char[] password, byte[] salt) throws Exception {
        return null;
    }
}`,
tests:[{d:'SHA-256 MessageDigest',re:'MessageDigest\\.getInstance\\s*\\(\\s*"SHA-256"\\s*\\)'},{d:'Hex via HexFormat',re:'HexFormat\\.of\\s*\\(\\s*\\)\\.formatHex'},{d:'SecureRandom for the salt (not Random)',re:'new\\s+SecureRandom\\s*\\(\\s*\\)'},{d:'PBKDF2WithHmacSHA256 factory',re:'SecretKeyFactory\\.getInstance\\s*\\(\\s*"PBKDF2WithHmacSHA256"\\s*\\)'},{d:'210,000 iterations, 256-bit key',re:'PBEKeySpec\\s*\\(\\s*password\\s*,\\s*salt\\s*,\\s*210_?000\\s*,\\s*256\\s*\\)'},{d:'java.util.Random never used',re:'new\\s+Random\\s*\\(',not:true}],
behavior:`1. sha256Hex("abc".getBytes()) returns the well-known 64-char hex digest starting "ba7816bf". 2. newSalt() returns 16 bytes, different every call. 3. hashPassword is deterministic for the same password+salt and different for a different salt. 4. Iterations are 210_000; the point of the exercise is that password hashing must be expensive.`,
hints:['sha256Hex is two lines: digest, then <code>HexFormat.of().formatHex(hash)</code>.','newSalt: <code>byte[] s = new byte[16]; new SecureRandom().nextBytes(s); return s;</code>','hashPassword: build the PBEKeySpec, get the PBKDF2WithHmacSHA256 factory, <code>return f.generateSecret(spec).getEncoded();</code>'],
solution:`import java.security.*;
import java.util.HexFormat;
import javax.crypto.*;
import javax.crypto.spec.*;

public class Hashing {
    static String sha256Hex(byte[] data) throws Exception {
        MessageDigest md = MessageDigest.getInstance("SHA-256");
        return HexFormat.of().formatHex(md.digest(data));
    }

    static byte[] newSalt() {
        byte[] salt = new byte[16];
        new SecureRandom().nextBytes(salt);
        return salt;
    }

    static byte[] hashPassword(char[] password, byte[] salt) throws Exception {
        PBEKeySpec spec = new PBEKeySpec(password, salt, 210_000, 256);
        SecretKeyFactory f = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
        return f.generateSecret(spec).getEncoded();
    }
}`}},
{id:'sec2',title:'Symmetric encryption: AES-GCM',body:`
<p>For encrypting data at rest or in transit segments, the modern default is <b>AES-GCM</b>, authenticated encryption: confidentiality AND tamper detection in one mode.</p>
<div class="codeSample" data-hl>// key: 256-bit AES
KeyGenerator kg = KeyGenerator.getInstance("AES");
kg.init(256);
SecretKey key = kg.generateKey();

// encrypt: FRESH 12-byte IV per message, reuse breaks GCM catastrophically
byte[] iv = new byte[12];
new SecureRandom().nextBytes(iv);
Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
cipher.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(128, iv));
byte[] ct = cipher.doFinal(plaintext);
// ship iv || ct together, the IV is not secret, uniqueness is what matters

// decrypt: same params; tampered ciphertext throws AEADBadTagException
cipher.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(128, iv));
byte[] pt = cipher.doFinal(ct);</div>
<p>The rules: never <code>AES/ECB</code> (the penguin picture: identical blocks leak patterns), never reuse an IV with the same key, 128-bit tag length, and keys come from a KMS/keystore in production, not from source code. GCM's tag means decryption <i>fails loudly</i> on tampering; you get integrity without a separate MAC.</p>

<h4>What "authenticated" buys you</h4>
<p>Encryption alone hides content; it does not stop an attacker <i>changing</i> it. With an unauthenticated stream mode, flipping a bit in the ciphertext flips the matching bit in the plaintext, and the recipient decrypts attacker-chosen data without noticing. GCM appends a 128-bit authentication tag over both the ciphertext and the associated data, so any modification makes <code>doFinal</code> throw <code>AEADBadTagException</code>. Treat that exception as an attack signal, not a parse error, and never return a different message for "bad tag" than for "bad key", or you have built a decryption oracle.</p>

<h4>The IV rule, and why it is absolute</h4>
<p>GCM turns a block cipher into a stream cipher by encrypting a counter derived from the IV. Reuse an IV with the same key and two messages are encrypted with the <i>same keystream</i>: XOR the ciphertexts and the key cancels out, leaving the XOR of two plaintexts; and, worse, the authentication key itself becomes recoverable, so an attacker can forge valid tags from then on. This is not a theoretical weakening; it is a total break, and it has shipped in real products. Generate 12 random bytes per message from <code>SecureRandom</code>, or use a counter you can prove never repeats, and store the IV alongside the ciphertext; it is not secret.</p>

<h4>Associated data, and where the keys live</h4>
<p><code>cipher.updateAAD(bytes)</code> authenticates data without encrypting it: a record id, a tenant, a version number. It is the mechanism that stops an attacker moving a validly-encrypted row from one account to another: bind the ciphertext to its context and a relocated blob fails its tag check.</p>
<p>In production the key itself comes from a KMS or an HSM, and the practical pattern is <b>envelope encryption</b>: the KMS holds a master key and issues a fresh data key per object, you encrypt with the data key and store the encrypted data key beside the ciphertext. Rotating the master key then re-wraps the data keys rather than re-encrypting terabytes, and the plaintext data key never touches disk.</p>`,
docs:[['Cipher (API)','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/javax/crypto/Cipher.html'],['JCA reference guide','https://docs.oracle.com/en/java/javase/21/security/java-cryptography-architecture-jca-reference-guide.html']],
ex:{title:'Seal and open',
prompt:`Write <code>AesGcm</code> with: <code>static byte[] encrypt(javax.crypto.SecretKey key, byte[] plaintext) throws Exception</code>: generate a fresh 12-byte IV with SecureRandom, use <code>Cipher.getInstance("AES/GCM/NoPadding")</code> with <code>GCMParameterSpec(128, iv)</code>, and return <b>iv concatenated with ciphertext</b> (use a ByteBuffer or arraycopy); and <code>static byte[] decrypt(javax.crypto.SecretKey key, byte[] ivAndCt) throws Exception</code>: split the first 12 bytes as IV, decrypt the rest.`,
starter:`import java.nio.ByteBuffer;
import java.security.SecureRandom;
import javax.crypto.*;
import javax.crypto.spec.GCMParameterSpec;

public class AesGcm {
    static byte[] encrypt(SecretKey key, byte[] plaintext) throws Exception {
        return null;
    }

    static byte[] decrypt(SecretKey key, byte[] ivAndCt) throws Exception {
        return null;
    }
}`,
tests:[{d:'GCM mode, never ECB',re:'Cipher\\.getInstance\\s*\\(\\s*"AES/GCM/NoPadding"\\s*\\)'},{d:'Fresh 12-byte IV from SecureRandom',re:'new\\s+byte\\[\\s*12\\s*\\][\\s\\S]*?SecureRandom'},{d:'128-bit GCM tag',re:'GCMParameterSpec\\s*\\(\\s*128\\s*,'},{d:'IV shipped with the ciphertext',re:'ByteBuffer|arraycopy'},{d:'Decrypt splits IV from payload',re:'decrypt[\\s\\S]*?12'},{d:'No ECB anywhere',re:'ECB',not:true}],
behavior:`1. decrypt(key, encrypt(key, msg)) round-trips to the original bytes. 2. Two encryptions of the same plaintext differ (fresh IV each time). 3. Flipping any ciphertext byte makes decrypt throw AEADBadTagException: authentication in action. 4. Output layout is exactly [12-byte IV][ciphertext+tag].`,
hints:['Concat: <code>ByteBuffer.allocate(12 + ct.length).put(iv).put(ct).array()</code>','Split in decrypt: copyOfRange(ivAndCt, 0, 12) for the IV, copyOfRange(ivAndCt, 12, length) for the ciphertext.','Both inits take the same GCMParameterSpec shape; only the mode constant differs.'],
solution:`import java.nio.ByteBuffer;
import java.security.SecureRandom;
import java.util.Arrays;
import javax.crypto.*;
import javax.crypto.spec.GCMParameterSpec;

public class AesGcm {
    static byte[] encrypt(SecretKey key, byte[] plaintext) throws Exception {
        byte[] iv = new byte[12];
        new SecureRandom().nextBytes(iv);
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(128, iv));
        byte[] ct = cipher.doFinal(plaintext);
        return ByteBuffer.allocate(iv.length + ct.length).put(iv).put(ct).array();
    }

    static byte[] decrypt(SecretKey key, byte[] ivAndCt) throws Exception {
        byte[] iv = Arrays.copyOfRange(ivAndCt, 0, 12);
        byte[] ct = Arrays.copyOfRange(ivAndCt, 12, ivAndCt.length);
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(128, iv));
        return cipher.doFinal(ct);
    }
}`}},
{id:'sec3',title:'Signatures & HMAC: how JWTs are really made',body:`
<p>Both prove authenticity; the difference is who can verify:</p>
<div class="codeSample" data-hl>// HMAC, shared secret: whoever can VERIFY can also FORGE. (JWT HS256)
Mac mac = Mac.getInstance("HmacSHA256");
mac.init(new SecretKeySpec(secret, "HmacSHA256"));
byte[] tag = mac.doFinal(message);
// verify: recompute and compare with MessageDigest.isEqual (constant time!)

// DIGITAL SIGNATURE, key pair: sign with PRIVATE, anyone verifies with PUBLIC. (JWT RS256/ES256)
KeyPairGenerator kpg = KeyPairGenerator.getInstance("EC");
kpg.initialize(256);
KeyPair pair = kpg.generateKeyPair();

Signature signer = Signature.getInstance("SHA256withECDSA");
signer.initSign(pair.getPrivate());
signer.update(message);
byte[] sig = signer.sign();

Signature verifier = Signature.getInstance("SHA256withECDSA");
verifier.initVerify(pair.getPublic());
verifier.update(message);
boolean ok = verifier.verify(sig);</div>
<p>This is your day job in miniature: an IdP signs JWTs with its private key; every API validates with the public key from the JWKS endpoint, which is why resource servers never hold signing secrets, and why HS256 between many parties is a smell (shared secret = anyone can mint tokens). ES256 = SHA256withECDSA, RS256 = SHA256withRSA.</p>
<h4>The distinction that decides your architecture</h4>
<p>Both mechanisms answer "did this message come from someone holding the key, unmodified?", but the
consequences of that word "the" differ completely.</p>
<div class="codeSample" data-hl>HMAC        one secret. verifying REQUIRES the same secret that signs.
            -> anyone who can check a token can also MINT one.
            -> symmetric trust. fine between two parties who already
               trust each other equally.

SIGNATURE   a key pair. sign with PRIVATE, verify with PUBLIC.
            -> verifiers can check but CANNOT forge.
            -> asymmetric trust. this is what makes federation possible.</div>
<p>That is why an IdP signs with RS256 or ES256: it can distribute the public key to a hundred resource
servers, publish it at a JWKS endpoint, and rotate it; none of those servers can issue a token. Use
HS256 across organizational boundaries and every party that validates tokens can also create them, so a
breach of the least careful one compromises the whole system.</p>
<p>HS256 is not wrong everywhere; it is fine and faster when one service signs and the same service
verifies, such as a stateless session cookie. The question is always <b>who needs to verify</b>.</p>

<h4>Two implementation details that break real systems</h4>
<p><b>Compare in constant time.</b> A byte-by-byte comparison that returns early leaks, through timing,
how many bytes matched, enough to forge a tag one byte at a time given enough attempts.
<code>MessageDigest.isEqual</code> is the constant-time comparison; <code>Arrays.equals</code> and
<code>String.equals</code> are not.</p>
<p><b>Never let the token choose the algorithm.</b> The <code>alg</code> header is attacker-controlled
input. Two classic attacks follow from trusting it: <code>alg: none</code>, where a library helpfully
accepts an unsigned token; and the RS256→HS256 confusion, where the attacker signs with the <i>public</i>
key as an HMAC secret and a naive verifier (which picks its method from the header) accepts it. The
defense is to decide the expected algorithm from your configuration and reject anything else.</p>

<h4>Sizing and choosing</h4>
<p>An HMAC secret must have real entropy: at least as many bits as the hash output, from a
<code>SecureRandom</code>, never a password or a memorable string. ES256 keys are far smaller than RSA for
equivalent strength, which makes tokens and JWKS documents smaller; RS256 remains ubiquitous for
compatibility. And key <b>rotation</b> is what the <code>kid</code> header exists for: publish both keys
during a rollover so tokens signed by either verify, then retire the old one.</p>

<h4>The check nobody sees in the code above</h4>
<p>A valid signature proves origin and integrity. It says nothing about whether the token is <b>for
you</b>, whether it has <b>expired</b>, or whether it permits the action. Verifying the signature and
stopping there is the most common JWT vulnerability in production, and it is why the identity course
spends a whole lesson on the claim checklist.</p>`,
docs:[['Signature (API)','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/security/Signature.html'],['Mac (API)','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/javax/crypto/Mac.html'],['JWT signing algorithms (RFC 7518)','https://www.rfc-editor.org/rfc/rfc7518']],
ex:{title:'Sign, verify, tag',
prompt:`Write <code>Signing</code> with three methods: <code>static byte[] hmac(byte[] secret, byte[] msg)</code> using <code>HmacSHA256</code>; <code>static byte[] sign(java.security.PrivateKey priv, byte[] msg)</code> and <code>static boolean verify(java.security.PublicKey pub, byte[] msg, byte[] sig)</code> both using <code>SHA256withECDSA</code>. Declare <code>throws Exception</code>. Bonus rigor: nothing in this class may compare byte arrays with <code>Arrays.equals</code>.`,
starter:`import java.security.*;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

public class Signing {
    static byte[] hmac(byte[] secret, byte[] msg) throws Exception {
        return null;
    }

    static byte[] sign(PrivateKey priv, byte[] msg) throws Exception {
        return null;
    }

    static boolean verify(PublicKey pub, byte[] msg, byte[] sig) throws Exception {
        return false;
    }
}`,
tests:[{d:'HmacSHA256 Mac',re:'Mac\\.getInstance\\s*\\(\\s*"HmacSHA256"\\s*\\)'},{d:'Keyed with SecretKeySpec',re:'new\\s+SecretKeySpec\\s*\\(\\s*secret\\s*,\\s*"HmacSHA256"\\s*\\)'},{d:'SHA256withECDSA for signing',re:'Signature\\.getInstance\\s*\\(\\s*"SHA256withECDSA"\\s*\\)'},{d:'initSign with the private key',re:'initSign\\s*\\(\\s*priv\\s*\\)'},{d:'initVerify with the public key, and its verdict is what comes back',re:'(?=[\\s\\S]*initVerify\\s*\\(\\s*pub\\s*\\))(?=[\\s\\S]*(return|=)\\s*(?!\\s*!)[^;]{0,60}\\.verify\\s*\\(\\s*sig\\s*\\))'},{d:'No Arrays.equals on secrets',re:'Arrays\\.equals',not:true}],
behavior:`1. hmac is deterministic: same secret+msg → same tag; different secret → different tag. 2. verify(pub, msg, sign(priv, msg)) == true for a matching key pair. 3. verify returns false (not throws) for a wrong signature. 4. sign uses the private key only, verify the public key only; the asymmetry IS the lesson.`,
hints:['hmac: getInstance → init(new SecretKeySpec(...)) → <code>return mac.doFinal(msg);</code>','sign: initSign(priv), update(msg), <code>return signer.sign();</code>','verify mirrors sign: initVerify(pub), update(msg), <code>return verifier.verify(sig);</code>'],
solution:`import java.security.*;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

public class Signing {
    static byte[] hmac(byte[] secret, byte[] msg) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret, "HmacSHA256"));
        return mac.doFinal(msg);
    }

    static byte[] sign(PrivateKey priv, byte[] msg) throws Exception {
        Signature signer = Signature.getInstance("SHA256withECDSA");
        signer.initSign(priv);
        signer.update(msg);
        return signer.sign();
    }

    static boolean verify(PublicKey pub, byte[] msg, byte[] sig) throws Exception {
        Signature verifier = Signature.getInstance("SHA256withECDSA");
        verifier.initVerify(pub);
        verifier.update(msg);
        return verifier.verify(sig);
    }
}`}},
{id:'sec4',title:'Keystores, certificates & TLS plumbing',body:`
<p>Where keys live and how TLS uses them:</p>
<ul>
<li><b>KeyStore</b> (format: PKCS12, <code>.p12</code>) holds YOUR private keys + certificates: what a server presents in the TLS handshake.</li>
<li><b>Truststore</b> is the same format holding certificates you TRUST; the JDK ships one (<code>$JAVA_HOME/lib/security/cacerts</code>) with the public CAs; corporate/internal CAs get imported into it.</li>
<li><b>The handshake</b>: server presents its cert chain → client checks it chains to a trusted root, matches the hostname, and is unexpired → key exchange derives session keys → symmetric encryption (your AES lesson) carries the traffic.</li>
<li>The infamous <code>PKIX path building failed</code> means: the presented chain does not reach anything in the client's truststore: fix the truststore, never <code>trustAll</code>.</li>
</ul>
<div class="codeSample">keytool -genkeypair -alias api -keyalg EC -keystore ks.p12 -storetype PKCS12
keytool -exportcert -alias api -keystore ks.p12 -file api.crt
keytool -importcert -alias corp-ca -file ca.crt -keystore truststore.p12 -storetype PKCS12
keytool -list -v -keystore ks.p12

# point a JVM at a custom truststore:
java -Djavax.net.ssl.trustStore=truststore.p12 -jar app.jar</div>

<h4>Reading a handshake failure</h4>
<p>Three errors cover most TLS incidents, and each names its own cause once you can decode it. <code>PKIX path building failed</code> means the chain the server presented does not reach any certificate in your truststore: usually a missing intermediate (the server is misconfigured) or an internal CA that was never imported (the client is). <code>No subject alternative names matching IP address</code> means the certificate is valid but was issued for a hostname, and you connected by IP; the fix is to connect by name, not to disable verification. <code>certificate_unknown</code> from a server during mTLS means <i>your</i> client certificate failed <i>its</i> checks; the direction of the failure is the first thing to establish.</p>
<p>The one response that is never correct is a trust-all <code>TrustManager</code>. It converts an authenticated channel into an encrypted one with no idea who is on the other end, which is precisely what an interception proxy needs, and it survives in codebases long after the certificate problem it was added for is gone.</p>

<h4>Keystore hygiene</h4>
<ul>
<li><b>PKCS12, not JKS.</b> JKS is a proprietary legacy format; PKCS12 is the standard, is the JDK default since Java 9, and interoperates with OpenSSL.</li>
<li><b>Separate the two stores.</b> A keystore holds secrets and belongs with restricted permissions; a truststore holds public certificates and is not sensitive. Merging them means shipping your private key everywhere the trust list goes.</li>
<li><b>Add to the JDK truststore, do not replace it.</b> Importing your corporate CA into a <i>copy</i> of <code>cacerts</code> keeps the public roots working; pointing the JVM at a truststore containing only your CA breaks every outbound HTTPS call to the rest of the internet, usually in a different service and a week later.</li>
<li><b>Expiry is an operational event.</b> Certificates outlive deployments, so rotation must be automated (ACME, cert-manager, the platform's own rotation) and monitored with an alert well before the date; a Sunday-night outage caused by a known expiry date is the most avoidable incident there is.</li>
</ul>
<p>Everything above is the same chain-of-trust model the PKI stream develops in depth; this lesson is the JVM-shaped view of it: where the files are, what the errors mean, and which flag points at which store.</p>`,
docs:[['keytool, reference','https://docs.oracle.com/en/java/javase/21/docs/specs/man/keytool.html'],['KeyStore, API','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/security/KeyStore.html'],['JSSE reference guide','https://docs.oracle.com/en/java/javase/21/security/java-secure-socket-extension-jsse-reference-guide.html']],
ex:{title:'keytool drill',lang:'shell',
prompt:`One per numbered line: (1) generate an EC key pair, alias <code>api</code>, in PKCS12 keystore <code>ks.p12</code>, (2) export that certificate to <code>api.crt</code>, (3) import <code>ca.crt</code> as trusted alias <code>corp-ca</code> into <code>truststore.p12</code> (PKCS12), (4) list the keystore contents verbosely, (5) the JVM flag pointing TLS at <code>truststore.p12</code>, (6) the exception message fragment that means "cert chain doesn't reach my truststore".`,
starter:`# 1)

# 2)

# 3)

# 4)

# 5)

# 6)
`,
tests:[{d:'genkeypair with EC into PKCS12',re:'keytool\\s+-genkeypair\\s+-alias\\s+api\\s+-keyalg\\s+EC\\s+-keystore\\s+ks\\.p12\\s+-storetype\\s+PKCS12'},{d:'exportcert to api.crt',re:'keytool\\s+-exportcert\\s+-alias\\s+api\\s+-keystore\\s+ks\\.p12\\s+-file\\s+api\\.crt'},{d:'importcert into the truststore',re:'keytool\\s+-importcert\\s+-alias\\s+corp-ca\\s+-file\\s+ca\\.crt\\s+-keystore\\s+truststore\\.p12'},{d:'Verbose list',re:'keytool\\s+-list\\s+-v\\s+-keystore\\s+ks\\.p12'},{d:'trustStore system property',re:'-Djavax\\.net\\.ssl\\.trustStore=truststore\\.p12'},{d:'PKIX path building failed',re:'PKIX\\s+path\\s+building\\s+failed'}],
behavior:`1-4. keytool commands exactly as specified; flags may reorder but all must be present. 5. -Djavax.net.ssl.trustStore=truststore.p12. 6. "PKIX path building failed", and the fix is importing the right CA into the truststore, never disabling verification.`,
hints:['keytool verbs are flags: -genkeypair, -exportcert, -importcert, -list.','Keystore vs truststore is the same file format; the difference is purely what you put in it and which side of the handshake reads it.','If you ever see trustAll / an empty X509TrustManager in a code review, that is an instant block; it turns TLS off silently.'],
solution:`# 1)
keytool -genkeypair -alias api -keyalg EC -keystore ks.p12 -storetype PKCS12

# 2)
keytool -exportcert -alias api -keystore ks.p12 -file api.crt

# 3)
keytool -importcert -alias corp-ca -file ca.crt -keystore truststore.p12 -storetype PKCS12

# 4)
keytool -list -v -keystore ks.p12

# 5)
-Djavax.net.ssl.trustStore=truststore.p12

# 6)
PKIX path building failed`}}
]});
