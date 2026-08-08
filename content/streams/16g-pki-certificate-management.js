STREAMS.push({icon:'📜',title:'PKI & Certificate Management',blurb:'The trust machinery under TLS, mTLS and signed tokens: public-key infrastructure, X.509 certificates, certificate authorities and chains of trust, CSRs and key usage, revocation (CRL/OCSP), rotation & ACME, and Java keystores/truststores.',lessons:[

{id:'pki1',title:'Asymmetric keys & X.509 certificates',body:`
<p><b>PKI</b> (Public Key Infrastructure) is the system that lets strangers trust each other's public keys. It rests on <b>asymmetric cryptography</b>: a <b>key pair</b> where the <b>private key</b> signs/decrypts and the matching <b>public key</b> verifies/encrypts.</p>
<p>But a bare public key is anonymous — how do you know it belongs to <code>bank.com</code>? A <b>certificate</b> answers that. An <b>X.509 certificate</b> binds a public key to an identity, and is <b>signed by a Certificate Authority (CA)</b> that vouches for the binding. Its key fields:</p>
<ul>
<li><b>Subject</b> — who the cert is for (the identity), incl. the <b>SAN</b> (Subject Alternative Names — the DNS names/URIs it's valid for; modern TLS uses SAN, not the old CN).</li>
<li><b>Issuer</b> — which CA signed it.</li>
<li><b>Public key</b> — the key being vouched for.</li>
<li><b>Validity</b> — <code>notBefore</code>/<code>notAfter</code> (expiry).</li>
<li><b>Signature</b> — the CA's signature over all of the above.</li>
</ul>
<div class="codeSample">// generate a key pair with the JDK
KeyPairGenerator g = KeyPairGenerator.getInstance("RSA");
g.initialize(2048);
KeyPair pair = g.generateKeyPair();   // pair.getPrivate() signs; pair.getPublic() is certified
// a CA then issues an X.509 cert binding pair.getPublic() to your identity</div>`,
docs:[['RFC 5280 — X.509 / PKIX','https://www.rfc-editor.org/rfc/rfc5280'],['KeyPairGenerator — API','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/security/KeyPairGenerator.html']],
ex:{title:'Generate a key pair',
prompt:`Write <code>Keys</code> with <code>static java.security.KeyPair rsa()</code> that returns a fresh <b>2048-bit RSA</b> key pair: <code>KeyPairGenerator.getInstance("RSA")</code>, <code>initialize(2048)</code>, then <code>generateKeyPair()</code>. Declare <code>throws Exception</code>.`,
starter:`import java.security.*;

public class Keys {
    static KeyPair rsa() throws Exception {
        return null;
    }
}`,
tests:[{d:'RSA key pair generator',re:'KeyPairGenerator\\.getInstance\\s*\\(\\s*"RSA"\\s*\\)'},{d:'2048-bit key',re:'initialize\\s*\\(\\s*2048'},{d:'generates the pair',re:'generateKeyPair\\s*\\(\\s*\\)'}],
behavior:`rsa() returns a KeyPair whose private key signs and whose public key is the one a CA would certify in an X.509 certificate. The certificate is what lets a stranger trust this public key belongs to your identity.`,
hints:['Three lines: get the generator, initialize to 2048 bits, return generateKeyPair().','The private key stays secret; the public key goes into the certificate.','A certificate = public key + identity + CA signature.'],
solution:`import java.security.*;

public class Keys {
    static KeyPair rsa() throws Exception {
        KeyPairGenerator g = KeyPairGenerator.getInstance("RSA");
        g.initialize(2048);
        return g.generateKeyPair();
    }
}`}},

{id:'pki2',title:'Certificate Authorities & the chain of trust',body:`
<p>You don't trust a website's certificate directly — you trust it because it chains up to a CA you already trust. That's the <b>chain of trust</b>:</p>
<ul>
<li><b>Root CA</b> — a self-signed cert baked into your OS/browser <b>trust store</b>. The ultimate anchor. Its private key is guarded fiercely (offline / HSM).</li>
<li><b>Intermediate CA</b> — signed by the root; does the day-to-day issuing (so the root key stays offline).</li>
<li><b>Leaf / end-entity</b> — your server's cert, signed by an intermediate.</li>
</ul>
<p>Validation walks the chain: each cert's <b>Issuer</b> must match the <b>Subject</b> of the next cert up, each signature must verify, none may be expired or revoked, and the top must be a <b>trusted root</b>. If every link holds, the leaf is trusted.</p>
<div class="codeSample">Chain of trust
 Root CA (self-signed, in your trust store)
    │ signs
    ▼
 Intermediate CA
    │ signs
    ▼
 leaf cert (bank.com)   ← trusted because the chain up to a trusted root verifies
 Check each link: child.Issuer == parent.Subject, signature valid, not expired/revoked</div>`,
docs:[['RFC 5280 §6 — Certification Path Validation','https://www.rfc-editor.org/rfc/rfc5280#section-6'],['CertPathValidator — API','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/security/cert/CertPathValidator.html']],
ex:{title:'Check a link in the chain',
prompt:`Write <code>Chain</code> with: <code>static boolean signedBy(String childIssuer, String parentSubject)</code> returning whether <code>childIssuer</code> is non-null and equals <code>parentSubject</code> (each cert's Issuer must match its parent's Subject); and <code>static boolean trusted(String rootSubject, java.util.Set&lt;String&gt; trustAnchors)</code> returning whether the root is in the trust store (<code>trustAnchors.contains(rootSubject)</code>).`,
starter:`import java.util.*;

public class Chain {
    static boolean signedBy(String childIssuer, String parentSubject) {
        return false;
    }
    static boolean trusted(String rootSubject, Set<String> trustAnchors) {
        return false;
    }
}`,
tests:[{d:'links child issuer to parent subject',re:'childIssuer\\s*\\.\\s*equals\\s*\\(\\s*parentSubject\\s*\\)'},{d:'null-safe',re:'childIssuer\\s*!=\\s*null|null\\s*!=\\s*childIssuer'},{d:'root must be a trusted anchor',re:'trustAnchors\\s*\\.\\s*contains\\s*\\(\\s*rootSubject\\s*\\)'}],
behavior:`signedBy("CN=Intermediate", "CN=Intermediate") is true (the leaf's issuer matches the intermediate's subject); a mismatch is false. trusted(rootSubject, anchors) is true only if that root is in the trust store. A chain is valid only when every link connects and the top is a trusted root.`,
hints:['<code>return childIssuer != null &amp;&amp; childIssuer.equals(parentSubject);</code>','The trust store is a set of roots you already trust — membership test.','Real code uses CertPathValidator; this drills the core rule.'],
solution:`import java.util.*;

public class Chain {
    static boolean signedBy(String childIssuer, String parentSubject) {
        return childIssuer != null && childIssuer.equals(parentSubject);
    }
    static boolean trusted(String rootSubject, Set<String> trustAnchors) {
        return trustAnchors.contains(rootSubject);
    }
}`}},

{id:'pki3',title:'CSRs, issuance & key usage',body:`
<p>How do you <i>get</i> a certificate? You never send your private key anywhere. Instead you create a <b>CSR (Certificate Signing Request)</b>: it contains your <b>public key</b> and desired identity, <b>signed by your private key</b> (proving you hold it). The CA validates you, then issues a cert.</p>
<div class="codeSample">// with keytool: make a keypair, then a CSR, then import the signed cert
keytool -genkeypair -alias mykey -keyalg RSA -keysize 2048 -keystore ks.p12 -storetype PKCS12
keytool -certreq  -alias mykey -file my.csr -keystore ks.p12         // → send my.csr to the CA
keytool -importcert -alias mykey -file signed.crt -keystore ks.p12   // ← import what the CA returns</div>
<p>A certificate also declares <b>what it may be used for</b>, and validators enforce it:</p>
<ul>
<li><b>Key Usage</b> — low-level operations (digitalSignature, keyEncipherment, <b>keyCertSign</b> = may sign other certs → a CA).</li>
<li><b>Extended Key Usage (EKU)</b> — high-level purpose: <b>serverAuth</b> (TLS server), <b>clientAuth</b> (mTLS client), codeSigning, emailProtection.</li>
<li><b>Basic Constraints</b> — <code>CA:true</code> marks a CA cert; a leaf must be <code>CA:false</code>. (A leaf with CA:true or a missing serverAuth EKU should be rejected.)</li>
</ul>`,
docs:[['keytool','https://docs.oracle.com/en/java/javase/21/docs/specs/man/keytool.html'],['RFC 5280 §4.2.1.12 — Extended Key Usage','https://www.rfc-editor.org/rfc/rfc5280#section-4.2.1.12']],
ex:{title:'Enforce key usage',
prompt:`Write <code>KeyUsage</code> with: <code>static boolean canServeTls(java.util.Set&lt;String&gt; eku)</code> returning whether the Extended Key Usage set <code>contains("serverAuth")</code>; and <code>static boolean isCa(boolean basicConstraintsCa, boolean keyCertSign)</code> returning whether <b>both</b> are true (a real CA cert has CA:true and the keyCertSign usage).`,
starter:`import java.util.*;

public class KeyUsage {
    static boolean canServeTls(Set<String> eku) {
        return false;
    }
    static boolean isCa(boolean basicConstraintsCa, boolean keyCertSign) {
        return false;
    }
}`,
tests:[{d:'TLS server needs serverAuth EKU',re:'contains\\s*\\(\\s*"serverAuth"\\s*\\)'},{d:'a CA needs CA:true AND keyCertSign',re:'basicConstraintsCa\\s*&&\\s*keyCertSign'}],
behavior:`canServeTls(Set.of("serverAuth")) is true; a cert without serverAuth cannot terminate TLS. isCa(true,true) is true; if either basic-constraints CA or keyCertSign is missing, it is not a valid CA — so a leaf cert can't masquerade as one.`,
hints:['<code>return eku.contains("serverAuth");</code>','A CA cert must assert both CA:true and the keyCertSign key usage.','Enforcing EKU/constraints is what stops a leaf cert from signing others.'],
solution:`import java.util.*;

public class KeyUsage {
    static boolean canServeTls(Set<String> eku) {
        return eku.contains("serverAuth");
    }
    static boolean isCa(boolean basicConstraintsCa, boolean keyCertSign) {
        return basicConstraintsCa && keyCertSign;
    }
}`}},

{id:'pki4',title:'TLS & mTLS: certificates in action',body:`
<p>Certificates exist mostly to make <b>TLS</b> work. In the handshake, the server proves its identity so the client knows it's really talking to <code>bank.com</code> (and they agree on encryption keys):</p>
<div class="codeSample">TLS handshake (server auth)
 1. Client → ClientHello (supported versions/ciphers)
 2. Server → its certificate chain (leaf + intermediates)
 3. Client validates: chain up to a trusted root, signatures OK, not expired/revoked,
                      and the requested hostname matches the cert SAN
 4. Key exchange → both derive session keys → encrypted channel
 -- mTLS adds: the SERVER also asks for the CLIENT's cert and validates it the same way --</div>
<p>The client's checks are non-negotiable: <b>valid chain</b>, <b>not expired</b>, <b>not revoked</b>, and <b>hostname matches the SAN</b> (a valid cert for the <i>wrong</i> host must be rejected — that's what stops impersonation). <b>mTLS</b> simply runs the same validation in <i>both</i> directions, which is how services authenticate each other (the S2S stream).</p>`,
docs:[['RFC 8446 — TLS 1.3','https://www.rfc-editor.org/rfc/rfc8446'],['RFC 6125 — hostname verification','https://www.rfc-editor.org/rfc/rfc6125']],
ex:{title:'Validate a server certificate',
prompt:`Write <code>TlsValidate</code> with <code>static boolean serverCertOk(boolean chainValid, String certHost, String requestedHost, long notAfterEpoch, long now)</code> returning true only if the chain is valid, the requested host matches the cert's host (<code>requestedHost.equals(certHost)</code>), and it is not expired (<code>now &lt; notAfterEpoch</code>).`,
starter:`public class TlsValidate {
    static boolean serverCertOk(boolean chainValid, String certHost, String requestedHost, long notAfterEpoch, long now) {
        return false;
    }
}`,
tests:[{d:'requires a valid chain',re:'chainValid'},{d:'hostname must match the SAN',re:'requestedHost\\s*\\.\\s*equals\\s*\\(\\s*certHost\\s*\\)'},{d:'must not be expired',re:'now\\s*<\\s*notAfterEpoch|notAfterEpoch\\s*>\\s*now'}],
behavior:`serverCertOk passes only when the chain validates, the hostname you asked for matches the certificate, and it's within its validity window. A perfectly valid certificate for a different hostname is rejected — that host-match check is what prevents a valid-but-wrong cert from impersonating a site.`,
hints:['One expression: <code>chainValid &amp;&amp; requestedHost.equals(certHost) &amp;&amp; now &lt; notAfterEpoch</code>.','Hostname verification is separate from chain validation — both are required.','mTLS runs this same check on the client cert too.'],
solution:`public class TlsValidate {
    static boolean serverCertOk(boolean chainValid, String certHost, String requestedHost, long notAfterEpoch, long now) {
        return chainValid && requestedHost.equals(certHost) && now < notAfterEpoch;
    }
}`}},

{id:'pki5',title:'Revocation, expiry, rotation & ACME',body:`
<p>Certificates expire on purpose, and sometimes must be killed <i>early</i> (a private key leaks). Managing this lifecycle is most of the operational work in PKI.</p>
<ul>
<li><b>Expiry</b> — every cert has a hard <code>notAfter</code>. Let one lapse and clients reject it — a classic outage. The industry is moving to <b>short-lived</b> certs (days/hours) precisely so revocation matters less.</li>
<li><b>Revocation</b> — invalidating a cert before it expires. Two mechanisms: <b>CRL</b> (Certificate Revocation List — a signed list of revoked serials the client downloads) and <b>OCSP</b> (Online Certificate Status Protocol — the client asks "is this serial still good?"). <b>OCSP stapling</b> has the <i>server</i> attach a fresh, signed OCSP response so the client needn't call the CA (faster, more private).</li>
<li><b>Rotation</b> — replacing a cert before it expires (or a key is compromised). Automate it; overlap old+new during rollover.</li>
<li><b>ACME</b> — the protocol (Let's Encrypt) that <b>automates</b> issuance and renewal: prove domain control, get a cert, auto-renew. This is why free, auto-rotating TLS is now the norm.</li>
</ul>
<div class="codeSample">A cert is usable only if:  now &lt; notAfter   AND   not revoked (per CRL/OCSP)
 Short-lived certs + automation (ACME) &gt; long-lived certs + manual revocation.</div>`,
docs:[['RFC 6960 — OCSP','https://www.rfc-editor.org/rfc/rfc6960'],['RFC 8555 — ACME','https://www.rfc-editor.org/rfc/rfc8555'],['Lets Encrypt','https://letsencrypt.org/how-it-works/']],
ex:{title:'Is this certificate usable?',
prompt:`Write <code>Revocation</code> with <code>static boolean usable(long notAfterEpoch, long now, boolean revoked)</code> returning true only if the certificate is not expired (<code>now &lt; notAfterEpoch</code>) <b>and</b> not <code>revoked</code>.`,
starter:`public class Revocation {
    static boolean usable(long notAfterEpoch, long now, boolean revoked) {
        return false;
    }
}`,
tests:[{d:'not expired',re:'now\\s*<\\s*notAfterEpoch|notAfterEpoch\\s*>\\s*now'},{d:'not revoked',re:'!\\s*revoked|revoked\\s*==\\s*false'}],
behavior:`usable(future, now, false) is true; an expired cert (now past notAfter) or a revoked one is false. Both checks matter: expiry is time-based; revocation (via CRL/OCSP) kills a cert early when its key is compromised.`,
hints:['<code>return now &lt; notAfterEpoch &amp;&amp; !revoked;</code>','Expiry alone is not enough — a stolen key must be revoked before its natural expiry.','Short-lived certs shrink the window where revocation is even needed.'],
solution:`public class Revocation {
    static boolean usable(long notAfterEpoch, long now, boolean revoked) {
        return now < notAfterEpoch && !revoked;
    }
}`}},

{id:'pki6',title:'Keystores & truststores',body:`
<p>In Java (and most runtimes) certificates and keys live in two kinds of files — confusing until you see the split:</p>
<ul>
<li><b>Keystore</b> — holds <b>your own</b> private keys + their certs. It's your <i>identity</i> (what you present in TLS/mTLS). Guard it; it has secrets.</li>
<li><b>Truststore</b> — holds the <b>CA certificates you trust</b> (public certs only, no secrets). It's your <i>list of who you believe</i>. Validation walks a presented chain up to something in here.</li>
</ul>
<p>Formats: <b>PKCS12</b> (<code>.p12</code>/<code>.pfx</code>) is the modern, portable standard; <b>JKS</b> is the legacy Java format. Manage both with <b>keytool</b>; load them in code with the <code>KeyStore</code> API.</p>
<div class="codeSample">KeyStore ks = KeyStore.getInstance("PKCS12");   // your identity (private key + cert)
ks.load(new FileInputStream("ks.p12"), password);
// a truststore is just a KeyStore holding trusted CA certs (no private keys)
// TLS uses your keystore to present identity, your truststore to validate the peer</div>
<p>Rule of thumb: <b>keystore = who you are (has secrets); truststore = who you trust (public only).</b> mTLS needs both — a keystore to present your client cert, a truststore to validate the server's (and vice-versa).</p>`,
docs:[['KeyStore — API','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/security/KeyStore.html'],['PKCS12','https://www.rfc-editor.org/rfc/rfc7292']],
ex:{title:'Load a keystore, check a truststore',
prompt:`Write <code>Stores</code> with: <code>static java.security.KeyStore loadPkcs12()</code> returning <code>KeyStore.getInstance("PKCS12")</code>; and <code>static boolean trusts(java.util.Set&lt;String&gt; truststoreAliases, String caAlias)</code> returning whether the truststore <code>contains(caAlias)</code>. Declare <code>throws Exception</code> where needed.`,
starter:`import java.security.KeyStore;
import java.util.*;

public class Stores {
    static KeyStore loadPkcs12() throws Exception {
        return null;
    }
    static boolean trusts(Set<String> truststoreAliases, String caAlias) {
        return false;
    }
}`,
tests:[{d:'uses the modern PKCS12 format',re:'KeyStore\\.getInstance\\s*\\(\\s*"PKCS12"\\s*\\)'},{d:'truststore membership = trust',re:'truststoreAliases\\s*\\.\\s*contains\\s*\\(\\s*caAlias\\s*\\)'}],
behavior:`loadPkcs12() returns a PKCS12 KeyStore instance (your identity store). trusts(aliases, caAlias) is true when that CA is present in the truststore. The keystore holds your private key; the truststore holds the CAs you validate peers against — mTLS needs both.`,
hints:['<code>return KeyStore.getInstance("PKCS12");</code> — PKCS12 over the legacy JKS.','A truststore is just a KeyStore of trusted CA certs — membership means "trusted".','Keystore = secrets (your identity); truststore = public certs (who you trust).'],
solution:`import java.security.KeyStore;
import java.util.*;

public class Stores {
    static KeyStore loadPkcs12() throws Exception {
        return KeyStore.getInstance("PKCS12");
    }
    static boolean trusts(Set<String> truststoreAliases, String caAlias) {
        return truststoreAliases.contains(caAlias);
    }
}`}}

]});
