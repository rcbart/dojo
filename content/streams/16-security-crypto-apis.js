STREAMS.push({icon:'🔐',title:'Security & Crypto APIs',blurb:'Hashing, password storage, AES-GCM, signatures & HMAC, keystores and TLS — the JCA, done right.',lessons:[
{id:'sec1',title:'Hashing & password storage',body:`
<p>Two different jobs people confuse:</p>
<div class="codeSample" data-hl>// INTEGRITY hashing — fast by design (checksums, dedup, content ids)
MessageDigest md = MessageDigest.getInstance("SHA-256");
byte[] hash = md.digest(data);
String hex = HexFormat.of().formatHex(hash);       // Java 17+

// PASSWORD storage — must be SLOW and SALTED. Never bare SHA-256!
byte[] salt = new byte[16];
new SecureRandom().nextBytes(salt);                 // SecureRandom, never Random
PBEKeySpec spec = new PBEKeySpec(password, salt, 210_000, 256);  // OWASP-level iterations
SecretKeyFactory f = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
byte[] derived = f.generateSecret(spec).getEncoded();
// store: salt + iterations + derived — verify by re-deriving and comparing
// constant-time: MessageDigest.isEqual(a, b), never Arrays.equals for secrets</div>
<p>Why slow &amp; salted: a fast hash lets attackers try billions of guesses per second against a leaked table; the salt kills rainbow tables; iterations make each guess cost real time. In new systems prefer Argon2/bcrypt via a library (Spring Security's <code>PasswordEncoder</code>); PBKDF2 is the built-in JCA option. In CIAM, password storage policy is an audit line item — this is the vocabulary behind it.</p>`,
docs:[['OWASP Password Storage Cheat Sheet','https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html'],['MessageDigest — API','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/security/MessageDigest.html']],
ex:{title:'Hash the right way twice',
prompt:`Write <code>Hashing</code> with: <code>static String sha256Hex(byte[] data)</code> returning the <b>SHA-256 digest of data as a lowercase hex string</b> (64 chars) using <code>MessageDigest</code> + <code>HexFormat</code>; <code>static byte[] newSalt()</code> returning <b>16 random bytes</b> from <code>SecureRandom</code> (different every call); and <code>static byte[] hashPassword(char[] password, byte[] salt)</code> returning the <b>PBKDF2 hash of the password with that salt</b> — <code>PBKDF2WithHmacSHA256</code>, <b>210_000 iterations</b>, 256-bit key length (same password+salt → same hash; different salt → different hash). Declare <code>throws Exception</code> where needed.`,
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
behavior:`1. sha256Hex("abc".getBytes()) returns the well-known 64-char hex digest starting "ba7816bf". 2. newSalt() returns 16 bytes, different every call. 3. hashPassword is deterministic for the same password+salt and different for a different salt. 4. Iterations are 210_000 — the point of the exercise is that password hashing must be expensive.`,
hints:['sha256Hex: two lines — digest, then <code>HexFormat.of().formatHex(hash)</code>.','newSalt: <code>byte[] s = new byte[16]; new SecureRandom().nextBytes(s); return s;</code>','hashPassword: build the PBEKeySpec, get the PBKDF2WithHmacSHA256 factory, <code>return f.generateSecret(spec).getEncoded();</code>'],
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
<p>For encrypting data at rest or in transit segments, the modern default is <b>AES-GCM</b> — authenticated encryption: confidentiality AND tamper detection in one mode.</p>
<div class="codeSample" data-hl>// key: 256-bit AES
KeyGenerator kg = KeyGenerator.getInstance("AES");
kg.init(256);
SecretKey key = kg.generateKey();

// encrypt: FRESH 12-byte IV per message — reuse breaks GCM catastrophically
byte[] iv = new byte[12];
new SecureRandom().nextBytes(iv);
Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
cipher.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(128, iv));
byte[] ct = cipher.doFinal(plaintext);
// ship iv || ct together — the IV is not secret, uniqueness is what matters

// decrypt: same params; tampered ciphertext throws AEADBadTagException
cipher.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(128, iv));
byte[] pt = cipher.doFinal(ct);</div>
<p>The rules: never <code>AES/ECB</code> (the penguin picture — identical blocks leak patterns), never reuse an IV with the same key, 128-bit tag length, and keys come from a KMS/keystore in production — not from source code. GCM's tag means decryption <i>fails loudly</i> on tampering; you get integrity without a separate MAC.</p>`,
docs:[['Cipher — API','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/javax/crypto/Cipher.html'],['JCA reference guide','https://docs.oracle.com/en/java/javase/21/security/java-cryptography-architecture-jca-reference-guide.html']],
ex:{title:'Seal and open',
prompt:`Write <code>AesGcm</code> with: <code>static byte[] encrypt(javax.crypto.SecretKey key, byte[] plaintext) throws Exception</code> — generate a fresh 12-byte IV with SecureRandom, use <code>Cipher.getInstance("AES/GCM/NoPadding")</code> with <code>GCMParameterSpec(128, iv)</code>, and return <b>iv concatenated with ciphertext</b> (use a ByteBuffer or arraycopy); and <code>static byte[] decrypt(javax.crypto.SecretKey key, byte[] ivAndCt) throws Exception</code> — split the first 12 bytes as IV, decrypt the rest.`,
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
behavior:`1. decrypt(key, encrypt(key, msg)) round-trips to the original bytes. 2. Two encryptions of the same plaintext differ (fresh IV each time). 3. Flipping any ciphertext byte makes decrypt throw AEADBadTagException — authentication in action. 4. Output layout is exactly [12-byte IV][ciphertext+tag].`,
hints:['Concat: <code>ByteBuffer.allocate(12 + ct.length).put(iv).put(ct).array()</code>','Split in decrypt: copyOfRange(ivAndCt, 0, 12) for the IV, copyOfRange(ivAndCt, 12, length) for the ciphertext.','Both inits take the same GCMParameterSpec shape — only the mode constant differs.'],
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
<div class="codeSample" data-hl>// HMAC — shared secret: whoever can VERIFY can also FORGE. (JWT HS256)
Mac mac = Mac.getInstance("HmacSHA256");
mac.init(new SecretKeySpec(secret, "HmacSHA256"));
byte[] tag = mac.doFinal(message);
// verify: recompute and compare with MessageDigest.isEqual (constant time!)

// DIGITAL SIGNATURE — key pair: sign with PRIVATE, anyone verifies with PUBLIC. (JWT RS256/ES256)
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
<p>This is your day job in miniature: an IdP signs JWTs with its private key; every API validates with the public key from the JWKS endpoint — which is why resource servers never hold signing secrets, and why HS256 between many parties is a smell (shared secret = anyone can mint tokens). ES256 = SHA256withECDSA, RS256 = SHA256withRSA.</p>`,
docs:[['Signature — API','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/security/Signature.html'],['Mac — API','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/javax/crypto/Mac.html'],['JWT signing algorithms — RFC 7518','https://www.rfc-editor.org/rfc/rfc7518']],
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
tests:[{d:'HmacSHA256 Mac',re:'Mac\\.getInstance\\s*\\(\\s*"HmacSHA256"\\s*\\)'},{d:'Keyed with SecretKeySpec',re:'new\\s+SecretKeySpec\\s*\\(\\s*secret\\s*,\\s*"HmacSHA256"\\s*\\)'},{d:'SHA256withECDSA for signing',re:'Signature\\.getInstance\\s*\\(\\s*"SHA256withECDSA"\\s*\\)'},{d:'initSign with the private key',re:'initSign\\s*\\(\\s*priv\\s*\\)'},{d:'initVerify with the public key',re:'initVerify\\s*\\(\\s*pub\\s*\\)'},{d:'No Arrays.equals on secrets',re:'Arrays\\.equals',not:true}],
behavior:`1. hmac is deterministic: same secret+msg → same tag; different secret → different tag. 2. verify(pub, msg, sign(priv, msg)) == true for a matching key pair. 3. verify returns false (not throws) for a wrong signature. 4. sign uses the private key only, verify the public key only — the asymmetry IS the lesson.`,
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
<li><b>KeyStore</b> (format: PKCS12, <code>.p12</code>) holds YOUR private keys + certificates — what a server presents in the TLS handshake.</li>
<li><b>Truststore</b> is the same format holding certificates you TRUST — the JDK ships one (<code>$JAVA_HOME/lib/security/cacerts</code>) with the public CAs; corporate/internal CAs get imported into it.</li>
<li><b>The handshake</b>: server presents its cert chain → client checks it chains to a trusted root, matches the hostname, and is unexpired → key exchange derives session keys → symmetric encryption (your AES lesson) carries the traffic.</li>
<li>The infamous <code>PKIX path building failed</code> means: the presented chain does not reach anything in the client's truststore — fix the truststore, never <code>trustAll</code>.</li>
</ul>
<div class="codeSample">keytool -genkeypair -alias api -keyalg EC -keystore ks.p12 -storetype PKCS12
keytool -exportcert -alias api -keystore ks.p12 -file api.crt
keytool -importcert -alias corp-ca -file ca.crt -keystore truststore.p12 -storetype PKCS12
keytool -list -v -keystore ks.p12

# point a JVM at a custom truststore:
java -Djavax.net.ssl.trustStore=truststore.p12 -jar app.jar</div>`,
docs:[['keytool — reference','https://docs.oracle.com/en/java/javase/21/docs/specs/man/keytool.html'],['KeyStore — API','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/security/KeyStore.html'],['JSSE reference guide','https://docs.oracle.com/en/java/javase/21/security/java-secure-socket-extension-jsse-reference-guide.html']],
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
behavior:`1-4. keytool commands exactly as specified — flags may reorder but all must be present. 5. -Djavax.net.ssl.trustStore=truststore.p12. 6. "PKIX path building failed" — and the fix is importing the right CA into the truststore, never disabling verification.`,
hints:['keytool verbs are flags: -genkeypair, -exportcert, -importcert, -list.','Keystore vs truststore is the same file format — the difference is purely what you put in it and which side of the handshake reads it.','If you ever see trustAll / an empty X509TrustManager in a code review, that is an instant block — it turns TLS off silently.'],
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
