STREAMS.push({iam:true,sec:'PKI & certificates',icon:'📜',title:'PKI & Certificate Management',blurb:'The trust machinery under TLS, mTLS and signed tokens: public-key infrastructure, X.509 certificates, certificate authorities and chains of trust, CSRs and key usage, revocation (CRL/OCSP), rotation & ACME, and Java keystores/truststores.',lessons:[

{id:'pki1',title:'Asymmetric keys & X.509 certificates',body:`

<p><b>PKI</b> (Public Key Infrastructure) lets strangers trust each other's public keys. It rests on <b>asymmetric cryptography</b>: a <b>key pair</b> where the <b>private key</b> signs/decrypts and the matching <b>public key</b> verifies/encrypts.</p>
<p>A bare public key is anonymous: nothing says it belongs to <code>bank.com</code>. An <b>X.509 certificate</b> binds a public key to an identity and is <b>signed by a Certificate Authority (CA)</b> that vouches for the binding. Its fields:</p>
<ul>
<li><b>Subject</b>: who the cert is for, including the <b>SAN</b> (Subject Alternative Names: the DNS names/URIs it's valid for). Modern TLS uses SAN, not the old CN.</li>
<li><b>Issuer</b>: which CA signed it.</li>
<li><b>Public key</b>: the key being vouched for.</li>
<li><b>Validity</b>: <code>notBefore</code>/<code>notAfter</code> (expiry).</li>
<li><b>Signature</b>: the CA's signature over all of the above.</li>
</ul>
<div class="codeSample">// generate a key pair with the JDK
KeyPairGenerator g = KeyPairGenerator.getInstance("RSA");
g.initialize(2048);
KeyPair pair = g.generateKeyPair();   // pair.getPrivate() signs; pair.getPublic() is certified
// a CA then issues an X.509 cert binding pair.getPublic() to your identity</div>

<h4>The problem PKI solves</h4>
<p>You want to talk privately to your bank. Encryption isn't the hard part. The hard part is knowing that the key you received belongs to the bank and not to whoever sits between you and it.</p>
<p>A passport solves the same problem for people: a government you already trust <i>vouches for the binding</i> between photograph and name, in a way you can check. A certificate is that, for keys.</p>

<h4>Reading a certificate</h4>
<div class="codeSample" data-hl>Subject:      CN=bank.com
Subject Alternative Name (SAN):  DNS:bank.com, DNS:www.bank.com
              // THE SAN is what browsers actually check. the old CN
              // fallback was removed years ago - a certificate with only
              // a CN and no SAN is rejected outright.
Issuer:       CN=Example CA R3          // who vouched for this
Public Key:   ECDSA P-256               // the key being vouched for
Validity:     notBefore / notAfter      // and for how long
Extensions:   Key Usage, Extended Key Usage, Basic Constraints
Signature:    the ISSUER's signature over everything above</div>
<p>The signature covers the whole document, so nothing in it can be altered without invalidating it. You trust whoever signed the certificate, not the certificate itself.</p>

<h4>Why asymmetric keys make this possible</h4>
<p>A symmetric secret has to be shared before it is useful, and anyone who can verify with it can also forge with it. A key <b>pair</b> breaks that symmetry: publishing the public half gives nothing away.</p>
<p>That lets a stranger verify your identity without having met you. The same property makes federation possible in the identity streams, and is why RS256 and ES256 are preferred over HS256 across organizational boundaries. <b>RS256</b>, <b>ES256</b> and <b>HS256</b> are the names of signing algorithms in a signed token's header. RS256 and ES256 use a private key to sign and a public key to verify, so verifiers can't forge tokens. HS256 uses one shared secret for both, so anyone who can verify can also forge.</p>

<h4>Early gotchas</h4>
<p><b>A certificate is public.</b> It is handed to anyone who connects. The private key is the secret. It never leaves the machine, and it is the only thing whose loss matters.</p>
<p><b>The formats will confuse you once.</b> <b>PEM</b> is base64 text with <code>-----BEGIN CERTIFICATE-----</code> around it. <b>DER</b> is the same content in binary. <b>PKCS</b> stands for Public-Key Cryptography Standards: a numbered family of formats for keys and certificates, so "PKCS#12" means format number 12 in that family. <b>PKCS#12</b> (<code>.p12</code>/<code>.pfx</code>) is an encrypted bundle holding a private key <i>and</i> its certificate chain. When a tool rejects your file, it nearly always wanted a different container for the same bytes. <code>openssl x509 -in cert.pem -text -noout</code> tells you what you have.</p>`,
docs:[['RFC 5280, X.509 / PKIX','https://www.rfc-editor.org/rfc/rfc5280'],['KeyPairGenerator, API','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/security/KeyPairGenerator.html']],
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



<p>You trust a website's certificate because it chains up to a CA you already trust. A <b>CA</b> is a certificate authority: an organization that signs certificates, vouching that a public key belongs to a name. Your browser and operating system ship with a list of CAs they trust. That's the <b>chain of trust</b>:</p>
<ul>
<li><b>Root CA</b>: a self-signed cert baked into your OS/browser <b>trust store</b>.</li>
<li><b>Intermediate CA</b>: signed by the root. Does the day-to-day issuing so the root key stays offline.</li>
<li><b>Leaf / end-entity</b>: your server's cert, signed by an intermediate.</li>
</ul>
<p>Validation walks the chain from the leaf up, checking each link, and the top must be a <b>trusted root</b>.</p>
<div class="flowDia"><svg viewBox="0 0 640 318" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Chain of trust: the root CA signs the intermediate CA, which signs the leaf certificate"><defs><marker id="pki2-ah" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent)"/></marker><marker id="pki2-ah-x" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--muted)"/></marker></defs>
<rect x="55" y="8" width="250" height="46" rx="8" class="fdActor"/><text x="180" y="27" class="fdActorT">Root CA</text><text x="180" y="42" class="fdActorS">self-signed, in your trust store</text>
<line x1="180" y1="58" x2="180" y2="117" stroke="var(--accent)" class="fdArrow" marker-end="url(#pki2-ah)"/>
<text x="220" y="92" class="fdLabel">signs</text>
<rect x="55" y="122" width="250" height="46" rx="8" class="fdActor"/><text x="180" y="141" class="fdActorT">Intermediate CA</text><text x="180" y="156" class="fdActorS">signed by the root</text>
<line x1="180" y1="172" x2="180" y2="231" stroke="var(--accent)" class="fdArrow" marker-end="url(#pki2-ah)"/>
<text x="220" y="206" class="fdLabel">signs</text>
<rect x="55" y="236" width="250" height="46" rx="8" class="fdActor"/><text x="180" y="255" class="fdActorT">leaf cert</text><text x="180" y="270" class="fdActorS">bank.com</text>
<line x1="370" y1="259" x2="312" y2="259" stroke="var(--muted)" class="fdArrow" marker-end="url(#pki2-ah-x)"/>
<text x="490" y="255" class="fdNote">trusted because the chain</text>
<text x="490" y="271" class="fdNote">up to a trusted root verifies</text>
<text x="320" y="306" class="fdNote">each link: child.Issuer == parent.Subject, signature valid, not expired or revoked</text>
</svg></div>
<p>Read it top down: the root signs the intermediate, the intermediate signs the leaf, and the leaf is trusted only because that chain ends at a root already in your trust store.</p>

<h4>Why the chain exists</h4>
<p>Your browser can't know every website in the world. It knows a few hundred <b>root CAs</b>, shipped with the operating system or the browser, and accepts anything they vouch for, directly or through an intermediate.</p>
<p>That is delegation of trust. The middle layer exists because <b>the root's private key is the most valuable key in the system</b>. If it leaks, every certificate it ever signed becomes suspect and the root has to be removed from every trust store on earth. So roots are guarded fiercely: kept offline, in an HSM, and brought out rarely to sign an intermediate. An <b>HSM</b> is a hardware security module: a locked box, physical or cloud-hosted, that holds private keys and does the signing inside itself, so the key can be used but never copied out. The intermediate can be replaced without touching the root.</p>

<h4>What validation checks, in order</h4>
<div class="codeSample" data-hl>for each link, from the leaf upward:
  1. does child.Issuer match parent.Subject?
  2. does the parent's key verify the child's signature?
  3. is the child within its validity window?      (clocks matter here)
  4. is the parent allowed to sign?  Basic Constraints CA:true
                                     Key Usage keyCertSign
  5. is the child revoked?           (see the revocation lesson)
and finally:
  6. is the top of the chain a root ALREADY IN YOUR TRUST STORE?
  7. for TLS: does the hostname match a SAN on the LEAF?

// step 6 is the one that matters. a chain that verifies perfectly but
// ends at a root you do not trust is worth nothing - which is exactly
// what a self-signed certificate is.</div>

<h4>The failures you will meet</h4>
<p><b>"Unable to get local issuer certificate."</b> The server sent the leaf but not the intermediates, so the client can't build a path to a root it trusts. Browsers often fetch the missing link. <code>curl</code>, Java and Go don't. <b>The server must send the full chain</b>: leaf first, then intermediates, never the root.</p>
<p><b>"Certificate has expired"</b> when it plainly hasn't. Check the client's clock. A container with a skewed clock rejects valid certificates, and the error names the certificate rather than the cause.</p>
<p><b>A self-signed certificate</b> is its own issuer. It isn't weaker cryptographically, only unvouched-for, so every client refuses it unless you add it to a trust store.</p>

<h4>Private CAs, and what they cost</h4>
<p>Inside your own estate you can run a CA and put its root in your own trust stores. Service meshes and internal mTLS work this way, and it is legitimate. The cost is that <b>you now operate a CA</b>: you own the root key's protection, the issuance policy, the rotation schedule, and trust-store distribution to every workload. Cloud-managed private CAs exist because that list is longer than it looks.</p>
<p><b>Never add a CA to a trust store casually.</b> Whoever holds that CA's key can impersonate <i>any</i> site to that machine. Corporate TLS-inspection proxies work this way. Adding one is a serious decision, not a networking detail.</p>`,
docs:[['RFC 5280 §6, Certification Path Validation','https://www.rfc-editor.org/rfc/rfc5280#section-6'],['CertPathValidator, API','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/security/cert/CertPathValidator.html']],
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
tests:[{d:'links child issuer to parent subject',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:childIssuer\\s*\\.\\s*equals\\s*\\(\\s*parentSubject\\s*\\)))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:childIssuer\\s*\\.\\s*equals\\s*\\(\\s*parentSubject\\s*\\))[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:childIssuer\\s*\\.\\s*equals\\s*\\(\\s*parentSubject\\s*\\))[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:childIssuer\\s*\\.\\s*equals\\s*\\(\\s*parentSubject\\s*\\))[^{]*?return\\s+\\k<av>\\b)'},{d:'null-safe',re:'childIssuer\\s*!=\\s*null|null\\s*!=\\s*childIssuer'},{d:'root must be a trusted anchor',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:trustAnchors\\s*\\.\\s*contains\\s*\\(\\s*rootSubject\\s*\\)))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:trustAnchors\\s*\\.\\s*contains\\s*\\(\\s*rootSubject\\s*\\))[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:trustAnchors\\s*\\.\\s*contains\\s*\\(\\s*rootSubject\\s*\\))[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:trustAnchors\\s*\\.\\s*contains\\s*\\(\\s*rootSubject\\s*\\))[^{]*?return\\s+\\k<av>\\b)'}],
behavior:`signedBy("CN=Intermediate", "CN=Intermediate") is true (the leaf's issuer matches the intermediate's subject); a mismatch is false. trusted(rootSubject, anchors) is true only if that root is in the trust store. A chain is valid only when every link connects and the top is a trusted root.`,
hints:['<code>return childIssuer != null &amp;&amp; childIssuer.equals(parentSubject);</code>','The trust store is a set of roots you already trust: a membership test.','Real code uses CertPathValidator; this drills the core rule.'],
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

<p>To <i>get</i> a certificate you never send your private key anywhere. You create a <b>CSR (Certificate Signing Request)</b>: your <b>public key</b> and desired identity, <b>signed by your private key</b> (proving you hold it). The CA validates you, then issues a cert. A <b>CA</b> is a certificate authority: an organization that signs certificates, vouching that a public key belongs to a name. Your browser and operating system ship with a list of CAs they trust.</p>
<div class="codeSample">// with keytool: make a keypair, then a CSR, then import the signed cert
keytool -genkeypair -alias mykey -keyalg RSA -keysize 2048 -keystore ks.p12 -storetype PKCS12
keytool -certreq  -alias mykey -file my.csr -keystore ks.p12         // → send my.csr to the CA
keytool -importcert -alias mykey -file signed.crt -keystore ks.p12   // ← import what the CA returns</div>
<p>A certificate also declares <b>what it may be used for</b>, and validators enforce it:</p>
<ul>
<li><b>Key Usage</b>: low-level operations (digitalSignature, keyEncipherment, <b>keyCertSign</b> = may sign other certs → a CA).</li>
<li><b>Extended Key Usage (EKU)</b>: high-level purpose: <b>serverAuth</b> (TLS server), <b>clientAuth</b> (mTLS client), codeSigning, emailProtection.</li>
<li><b>Basic Constraints</b>: <code>CA:true</code> marks a CA cert. A leaf must be <code>CA:false</code>. A leaf with CA:true, or without a serverAuth EKU, should be rejected.</li>
</ul>

<h4>Why a CSR</h4>
<p>The CA has to be sure of two things: that you are entitled to the name you claim, and that you hold the private key for the public key you sent. The CSR's own signature proves the second.</p>
<p>The first (do you control <code>bank.com</code>?) is the CA's job, and it is where the real security of the public web lives. For a public certificate that means <b>domain validation</b>: a specific token at a URL on the domain, or a specific TXT record in its DNS. <b>ACME</b> (Automatic Certificate Management Environment) automates this. It is the protocol behind automated certificate issuance: a program on your server proves control of the name and collects the certificate with nobody typing anything. It is what Let's Encrypt runs on, and it made free automated certificates possible.</p>
<div class="codeSample" data-hl># what actually leaves your machine
openssl req -new -key server.key -out server.csr -subj "/CN=api.example.com"   -addext "subjectAltName=DNS:api.example.com,DNS:www.example.com"

# the CSR contains: your PUBLIC key, the requested names, and a signature
# made with your PRIVATE key.
# the private key never appears in it and never leaves the machine.
# any process that asks you to upload a private key is doing it wrong.</div>

<h4>The extensions that decide what a certificate may do</h4>
<div class="codeSample" data-hl>Basic Constraints   CA:true   -> may sign other certificates
                    CA:false  -> a leaf. MUST NOT sign anything.
                    also carries pathLen: how many CAs may sit below it

Key Usage           digitalSignature   sign data / TLS handshakes
                    keyEncipherment    encrypt a key to this cert
                    keyCertSign        sign certificates  <- CA only
                    cRLSign            sign revocation lists

Extended Key Usage  serverAuth    a TLS server
                    clientAuth    an mTLS client
                    codeSigning / emailProtection / timeStamping</div>
<p><b>Validators enforce these.</b> That stops an ordinary leaf being used to mint certificates for other names, the single worst thing that can go wrong in a PKI. A <b>PKI</b> is a public key infrastructure: the certificate authorities, certificates and rules that let a public key be trusted as belonging to a particular name.</p>
<p>So <b>one certificate should not do two jobs</b>. A certificate with both <code>serverAuth</code> and <code>clientAuth</code> is common and usually harmless. A certificate with <code>keyCertSign</code> on anything that is not a CA is a finding.</p>

<h4>Naming, and the trap in it</h4>
<p>Put every name the service answers to in the SAN. The <b>SAN</b> is the subject alternative name: the field in a certificate that lists the hostnames it is valid for. It is the field browsers actually check. A <b>wildcard</b> such as <code>*.example.com</code> matches one label: it covers <code>api.example.com</code> but not <code>a.b.example.com</code>, and not the bare <code>example.com</code>. Wildcards also concentrate risk: one private key that can impersonate every subdomain. Prefer specific names where automation makes it cheap, which ACME does.</p>

<h4>Where the private key should live</h4>
<p><b>Generated on the machine that will use it, and never moved.</b> A key in two places has twice the ways to leak, and you can no longer say which copy was compromised. For anything high-value (a CA key, a token-signing key), that means an <b>HSM</b> or a cloud KMS. An HSM is a hardware security module: a locked box, physical or cloud-hosted, that holds private keys and does the signing inside itself, so the key can be used but never copied out. A <b>KMS</b> is a key management service: a cloud service that stores keys and does the signing by API, usually with such a box behind it. Your code asks it to sign; it never sees the key. Either way the key is generated inside the device and never comes out. You send data in and get a signature back.</p>`,
docs:[['keytool','https://docs.oracle.com/en/java/javase/21/docs/specs/man/keytool.html'],['RFC 5280 §4.2.1.12 (Extended Key Usage)','https://www.rfc-editor.org/rfc/rfc5280#section-4.2.1.12']],
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
tests:[{d:'TLS server needs serverAuth EKU',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:contains\\s*\\(\\s*"serverAuth"\\s*\\)))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:contains\\s*\\(\\s*"serverAuth"\\s*\\))[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:contains\\s*\\(\\s*"serverAuth"\\s*\\))[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:contains\\s*\\(\\s*"serverAuth"\\s*\\))[^{]*?return\\s+\\k<av>\\b)'},{d:'a CA needs CA:true AND keyCertSign',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:basicConstraintsCa\\s*&&\\s*keyCertSign))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:basicConstraintsCa\\s*&&\\s*keyCertSign)[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:basicConstraintsCa\\s*&&\\s*keyCertSign)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:basicConstraintsCa\\s*&&\\s*keyCertSign)[^{]*?return\\s+\\k<av>\\b)'}],
behavior:`canServeTls(Set.of("serverAuth")) is true; a cert without serverAuth cannot terminate TLS. isCa(true,true) is true; if either basic-constraints CA or keyCertSign is missing, it is not a valid CA, so a leaf cert can't masquerade as one.`,
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

<p>Certificates exist mostly to make <b>TLS</b> work. In the handshake the server proves it's <code>bank.com</code>, and the two sides agree on encryption keys:</p>
<!--flow:pki4-tls-->
<h4>TLS handshake: and what mTLS adds: step by step</h4>
<div class="flowDia"><svg viewBox="0 0 620 336" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="TLS handshake, and what mTLS adds"><defs><marker id="pki4-tls-ah-front" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent)"/></marker><marker id="pki4-tls-ah-back" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent2)"/></marker><marker id="pki4-tls-ah-attack" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--bad)"/></marker><marker id="pki4-tls-ah-x" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--muted)"/></marker></defs><line x1="74" y1="42" x2="74" y2="324" class="fdLife"/><line x1="546" y1="42" x2="546" y2="324" class="fdLife"/><rect x="35" y="8" width="78" height="34" rx="8" class="fdActor"/><text x="74" y="29.5" class="fdActorT">Client</text><rect x="507" y="8" width="78" height="34" rx="8" class="fdActor"/><text x="546" y="29.5" class="fdActorT">Server</text><line x1="77" y1="90" x2="541" y2="90" stroke="var(--accent2)" class="fdArrow" marker-end="url(#pki4-tls-ah-back)"/><text x="325" y="81" class="fdLabel">ClientHello, algorithms, SNI, key share</text><circle cx="92" cy="90" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="92" y="93.5" class="fdNumT" style="fill:var(--accent2)">1</text><line x1="543" y1="120" x2="79" y2="120" stroke="var(--accent2)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#pki4-tls-ah-back)"/><text x="295" y="111" class="fdLabel">ServerHello + cert chain (+ CertRequest)</text><circle cx="528" cy="120" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="528" y="123.5" class="fdNumT" style="fill:var(--accent2)">2</text><rect x="14" y="137" width="402.2" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="223.1" y="152" class="fdSelfT">build chain to a trusted root; name, validity, revocation</text><circle cx="14" cy="148" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="14" y="151.5" class="fdNumT" style="fill:var(--muted)">3</text><line x1="77" y1="186" x2="541" y2="186" stroke="var(--accent2)" class="fdArrow" marker-end="url(#pki4-tls-ah-back)"/><text x="325" y="177" class="fdLabel">client certificate + proof of key (mTLS)</text><circle cx="92" cy="186" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="92" y="189.5" class="fdNumT" style="fill:var(--accent2)">4</text><line x1="14" y1="212" x2="606" y2="212" class="fdPhase"/><text x="310" y="216" class="fdPhaseT">still one handshake, no application data yet</text><line x1="543" y1="246" x2="79" y2="246" stroke="var(--accent2)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#pki4-tls-ah-back)"/><text x="295" y="237" class="fdLabel">verify client chain, then Finished</text><circle cx="528" cy="246" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="528" y="249.5" class="fdNumT" style="fill:var(--accent2)">5</text><line x1="77" y1="276" x2="541" y2="276" stroke="var(--accent2)" class="fdArrow" marker-end="url(#pki4-tls-ah-back)"/><text x="325" y="267" class="fdLabel">Finished, then application data</text><circle cx="92" cy="276" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="92" y="279.5" class="fdNumT" style="fill:var(--accent2)">6</text><rect x="223.60000000000002" y="293" width="382.4" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="422.8" y="308" class="fdSelfT">identity comes from the cert SAN, not from a token</text><circle cx="223.60000000000002" cy="304" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="223.60000000000002" y="307.5" class="fdNumT" style="fill:var(--muted)">7</text></svg></div>
<ol class="fdSteps">
<li><b>Client → Server:</b> ClientHello, algorithms, SNI, key share</li>
<li><b>Server → Client:</b> ServerHello and key share, then certificate CHAIN, and for mTLS a CertificateRequest in the same flight</li>
<li><b>Client:</b> build chain to a trusted root; name, validity, revocation</li>
<li><b>Client → Server:</b> for mTLS, client certificate + proof of key</li>
<li><b>Server:</b> verify the client’s chain, identity from the cert SAN</li>
<li><b>Both:</b> Finished, then application data</li>
</ol>
<!--/flow:pki4-tls-->
<div class="codeSample">TLS handshake (server auth)
 1. Client → ClientHello (supported versions/ciphers)
 2. Server → its certificate chain (leaf + intermediates)
 3. Client validates: chain up to a trusted root, signatures OK, not expired/revoked,
                      and the requested hostname matches the cert SAN
 4. Key agreement → both derive session keys → encrypted channel
 -- mTLS adds: the SERVER asks for the CLIENT's cert IN THE SAME HANDSHAKE and
    validates it the same way. Client auth finishes before any application data
    moves; it is not a second exchange afterwards. --</div>
<p>Two words in those steps need unpacking. <b>SNI</b> is Server Name Indication: the hostname the client sends in its very first message, so a server holding many certificates can pick the right one. It travels in the clear, because no keys exist yet. The certificate <b>chain</b> is the server's own certificate plus the intermediate certificates that link it up to a root the client already trusts. The server sends them together so the client can build that path.</p>
<p>The client's checks aren't optional: <b>valid chain</b>, <b>not expired</b>, <b>not revoked</b>, <b>hostname matches the SAN</b>. The <b>SAN</b> is the subject alternative name: the field in a certificate that lists the hostnames it's valid for. It's the field browsers actually check. <b>mTLS</b> runs the same validation in <i>both</i> directions, so services can authenticate each other (the S2S stream). <b>S2S</b> means service to service: calls where both ends are programs and there's no user typing a password.</p>

<h4>What the handshake does</h4>
<p><b>Authentication</b>: the server is who the name says. <b>Key agreement</b>: a shared symmetric key for the conversation. The certificate serves the first. The second uses ephemeral keys, so a recording can't be decrypted later even if the server's key is stolen. That's <b>forward secrecy</b>, the default in TLS 1.3.</p>
<div class="codeSample" data-hl>1. ClientHello    versions, ciphers, and the SNI - the hostname the
                  client WANTS, sent before any certificate exists.
                  (SNI is how one IP serves many sites, and it is also
                   why the requested hostname is visible on the network.)
2. Server sends   its certificate CHAIN: leaf first, then intermediates.
3. Client checks  chain to a trusted root, signatures, validity, revocation
                  AND that the hostname matches a SAN on the leaf.
4. Key agreement  ephemeral keys -> a shared session key
5. Encrypted      everything after this point, in both directions

// mTLS inserts one step: the server ALSO requests a certificate from the
// client, and runs the same validation in the other direction.</div>

<h4>The hostname check is the one that matters</h4>
<p>A certificate can be signed by a trusted CA, unexpired, unrevoked, and still be the wrong certificate. A <b>CA</b> is a certificate authority: an organization that signs certificates, vouching that a public key belongs to a name. Your browser and operating system ship with a list of CAs they trust. Without the hostname check, an attacker holding a valid certificate for any domain could present it for yours. That check is what stops impersonation.</p>
<p><b>Library defaults get this wrong.</b> Browsers always perform it. Hand-rolled HTTP clients often do not, nor does code that disables verification to make a self-signed certificate work in development. That setting has a long history of reaching production. To trust a private CA, <b>add it to the client's trust store</b>. Never disable verification.</p>

<h4>What mTLS adds, and what it does not</h4>
<p>It adds a verified caller identity at the transport layer, before your application code runs. It doesn't add authorization. Every service in the mesh has a valid certificate, so a handshake only proves the caller is <i>somebody</i>. Which somebody, and whether they may call this endpoint, you decide from the certificate's subject or SAN.</p>

<h4>Debugging it</h4>
<div class="codeSample" data-hl>openssl s_client -connect api.example.com:443 -servername api.example.com
  # shows the chain the server ACTUALLY sends, in order.
  # "unable to get local issuer certificate" here usually means the
  # server omitted its intermediates - a server misconfiguration, even
  # though browsers may hide it.

openssl x509 -in cert.pem -noout -dates -ext subjectAltName
  # the two things you check most: when it expires, and which names.</div>
<p><b>Most TLS problems are configuration, not cryptography</b>: a missing intermediate, a skewed clock, a name not in the SAN, or a certificate nobody renewed.</p>`,
docs:[['RFC 8446, TLS 1.3','https://www.rfc-editor.org/rfc/rfc8446'],['RFC 6125, hostname verification','https://www.rfc-editor.org/rfc/rfc6125']],
ex:{title:'Validate a server certificate',
prompt:`Write <code>TlsValidate</code> with <code>static boolean serverCertOk(boolean chainValid, String certHost, String requestedHost, long notAfterEpoch, long now)</code> returning true only if the chain is valid, the requested host matches the cert's host (<code>requestedHost.equals(certHost)</code>), and it is not expired (<code>now &lt; notAfterEpoch</code>).`,
starter:`public class TlsValidate {
    static boolean serverCertOk(boolean chainValid, String certHost, String requestedHost, long notAfterEpoch, long now) {
        return false;
    }
}`,
tests:[{d:'requires a valid chain',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:chainValid))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:chainValid)[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:chainValid)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:chainValid)[^{]*?return\\s+\\k<av>\\b)'},{d:'hostname must match the SAN',re:'requestedHost\\s*\\.\\s*equals\\s*\\(\\s*certHost\\s*\\)'},{d:'must not be expired',re:'now\\s*<\\s*notAfterEpoch|notAfterEpoch\\s*>\\s*now'}],
behavior:`serverCertOk passes only when the chain validates, the hostname you asked for matches the certificate, and it's within its validity window. A perfectly valid certificate for a different hostname is rejected; that host-match check is what prevents a valid-but-wrong cert from impersonating a site.`,
hints:['One expression: <code>chainValid &amp;&amp; requestedHost.equals(certHost) &amp;&amp; now &lt; notAfterEpoch</code>.','Hostname verification is separate from chain validation; both are required.','mTLS runs this same check on the client cert too.'],
solution:`public class TlsValidate {
    static boolean serverCertOk(boolean chainValid, String certHost, String requestedHost, long notAfterEpoch, long now) {
        return chainValid && requestedHost.equals(certHost) && now < notAfterEpoch;
    }
}`}},

{id:'pki5',title:'Revocation, expiry, rotation & ACME',body:`

<p>Certificates expire on purpose, and sometimes must be killed <i>early</i>, when a private key leaks. Managing this lifecycle is most of the operational work in PKI. <b>PKI</b> is public key infrastructure: the certificate authorities, certificates and rules that let a public key be trusted as belonging to a particular name. It's what makes the padlock in a browser mean something.</p>
<!--flow:pki5-acme-->
<h4>ACME: automated issuance and renewal: step by step</h4>
<div class="flowDia"><svg viewBox="0 0 700 342" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ACME: automated issuance and renewal"><defs><marker id="pki5-acme-ah-front" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent)"/></marker><marker id="pki5-acme-ah-back" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent2)"/></marker><marker id="pki5-acme-ah-attack" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--bad)"/></marker><marker id="pki5-acme-ah-x" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--muted)"/></marker></defs><line x1="74" y1="54" x2="74" y2="330" class="fdLife"/><line x1="350" y1="54" x2="350" y2="330" class="fdLife"/><line x1="626" y1="54" x2="626" y2="330" class="fdLife"/><rect x="17.900000000000006" y="8" width="112.19999999999999" height="46" rx="8" class="fdActor"/><text x="74" y="27" class="fdActorT">ACME client</text><text x="74" y="42" class="fdActorS">certbot / caddy</text><rect x="311" y="8" width="78" height="46" rx="8" class="fdActor"/><text x="350" y="27" class="fdActorT">CA</text><text x="350" y="42" class="fdActorS">Let’s Encrypt</text><rect x="545.3" y="8" width="161.39999999999998" height="46" rx="8" class="fdActor"/><text x="626" y="35.5" class="fdActorT">Your server / DNS</text><line x1="77" y1="102" x2="345" y2="102" stroke="var(--accent2)" class="fdArrow" marker-end="url(#pki5-acme-ah-back)"/><text x="227" y="93" class="fdLabel">new order: example.com</text><circle cx="92" cy="102" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="92" y="105.5" class="fdNumT" style="fill:var(--accent2)">1</text><line x1="347" y1="132" x2="79" y2="132" stroke="var(--accent2)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#pki5-acme-ah-back)"/><text x="197" y="123" class="fdLabel">challenge: prove you control it</text><circle cx="332" cy="132" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="332" y="135.5" class="fdNumT" style="fill:var(--accent2)">2</text><line x1="77" y1="162" x2="621" y2="162" stroke="var(--accent2)" class="fdArrow" marker-end="url(#pki5-acme-ah-back)"/><text x="365" y="153" class="fdLabel">place token at /.well-known/acme-challenge (or DNS TXT)</text><circle cx="92" cy="162" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="92" y="165.5" class="fdNumT" style="fill:var(--accent2)">3</text><line x1="353" y1="192" x2="621" y2="192" stroke="var(--accent2)" class="fdArrow" marker-end="url(#pki5-acme-ah-back)"/><text x="503" y="183" class="fdLabel">fetch the token from the public internet</text><circle cx="368" cy="192" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="368" y="195.5" class="fdNumT" style="fill:var(--accent2)">4</text><line x1="347" y1="222" x2="79" y2="222" stroke="var(--accent2)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#pki5-acme-ah-back)"/><text x="197" y="213" class="fdLabel">validated, send your CSR</text><circle cx="332" cy="222" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="332" y="225.5" class="fdNumT" style="fill:var(--accent2)">5</text><line x1="77" y1="252" x2="345" y2="252" stroke="var(--accent2)" class="fdArrow" marker-end="url(#pki5-acme-ah-back)"/><text x="227" y="243" class="fdLabel">CSR</text><circle cx="92" cy="252" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="92" y="255.5" class="fdNumT" style="fill:var(--accent2)">6</text><line x1="347" y1="282" x2="79" y2="282" stroke="var(--accent2)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#pki5-acme-ah-back)"/><text x="197" y="273" class="fdLabel">signed certificate (90 days)</text><circle cx="332" cy="282" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="332" y="285.5" class="fdNumT" style="fill:var(--accent2)">7</text><rect x="14" y="299" width="428.59999999999997" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="236.29999999999998" y="314" class="fdSelfT">renew automatically around day 60, nobody remembers manually</text><circle cx="14" cy="310" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="14" y="313.5" class="fdNumT" style="fill:var(--muted)">8</text></svg></div>
<ol class="fdSteps">
<li><b>ACME client → CA:</b> new order: example.com <i>(back channel)</i></li>
<li><b>CA → ACME client:</b> challenge: prove you control it <i>(back channel)</i></li>
<li><b>ACME client → Your server / DNS:</b> place token at /.well-known/acme-challenge (or DNS TXT) <i>(back channel)</i></li>
<li><b>CA → Your server / DNS:</b> fetch the token from the public internet <i>(back channel)</i></li>
<li><b>CA → ACME client:</b> validated, send your CSR <i>(back channel)</i></li>
<li><b>ACME client → CA:</b> CSR <i>(back channel)</i></li>
<li><b>CA → ACME client:</b> signed certificate (90 days) <i>(back channel)</i></li>
<li><b>ACME client:</b> renew automatically around day 60, nobody remembers manually</li>
</ol>
<!--/flow:pki5-acme-->
<ul>
<li><b>Expiry</b>: every cert has a hard <code>notAfter</code>. Let one lapse and clients reject it, a classic outage.</li>
<li><b>Revocation</b>: invalidating a cert before it expires. <b>CRL</b> (Certificate Revocation List): a signed list of revoked serials the client downloads. <b>OCSP</b> (Online Certificate Status Protocol): the client asks "is this serial still good?". <b>OCSP stapling</b>: the <i>server</i> attaches a fresh, signed OCSP response, so the client needn't call the CA. Faster and more private.</li>
<li><b>Rotation</b>: replacing a cert before it expires or a key is compromised. Automate it, and overlap old and new during rollover.</li>
<li><b>ACME</b>: the protocol (Let's Encrypt) that <b>automates</b> issuance and renewal: prove domain control, get a cert, auto-renew. It's why free, auto-rotating TLS is now the norm.</li>
</ul>
<div class="codeSample">A cert is usable only if:  now &lt; notAfter   AND   not revoked (per CRL/OCSP)
 Short-lived certs + automation (ACME) &gt; long-lived certs + manual revocation.</div>

<h4>Update: OCSP is being retired</h4>
<p>That picture is how revocation was taught for twenty years. It's now out of date in one respect: <b>OCSP is going away</b>, for privacy. An OCSP responder learns which site a given IP address is visiting, in real time. In August 2023 the CA/Browser Forum voted to make OCSP <b>optional</b> for publicly trusted CAs, effective March 2024. Let's Encrypt, the largest CA by certificate count, added CRL support in 2022, dropped OCSP URLs from issued certificates in May 2025, and shut its OCSP responders down on <b>6 August 2025</b>.</p>
<p>What replaced it isn't classic CRL downloading, which never scaled to the browser. Browsers now aggregate revocation centrally and push a compressed summary to clients (<b>CRLite</b> in Firefox, <b>CRLSets</b> in Chrome). The client checks locally: no network call, no privacy leak. The CA publishes CRLs. The browser vendor aggregates.</p>
<div class="codeSample" data-hl>then                          now
  client -> OCSP responder      CA -> publishes CRL
  ("is serial 0x4f2 ok?")       browser vendor -> aggregates + compresses
  privacy leak, latency,        client -> checks a LOCAL structure
  soft-fail on timeout          no call, no leak, no soft-fail

// and underneath both: SHORT-LIVED CERTIFICATES.
// a 6-day certificate barely needs revocation - expiry does the job.
// this is why the CA/B Forum is ratcheting maximum lifetimes down.</div>
<p><b>Revocation has never worked reliably.</b> Soft-fail means an attacker who can block the check wins. So the industry moved to <b>short-lived</b> certs (days/hours), short enough that revocation matters less. Automate issuance with ACME, keep lifetimes short, and treat revocation as a backstop.</p>`,
docs:[["Let's Encrypt - OCSP service end of life (Aug 2025)",'https://letsencrypt.org/2025/08/06/ocsp-service-has-reached-end-of-life'],['Mozilla CRLite','https://blog.mozilla.org/security/2020/01/09/crlite-part-1-all-web-pki-revocations-compressed/'],['RFC 6960, OCSP','https://www.rfc-editor.org/rfc/rfc6960'],['RFC 8555, ACME','https://www.rfc-editor.org/rfc/rfc8555'],["Let's Encrypt, how it works",'https://letsencrypt.org/how-it-works/']],
ex:{title:'Is this certificate usable?',lang:'js',
run:{call:'usable',cases:[{name:'valid and not revoked',args:[2000,1000,false],expect:true},{name:'expired',args:[900,1000,false],expect:false},{name:'revoked',args:[2000,1000,true],expect:false},{name:'expiring exactly now is unusable',args:[1000,1000,false],expect:false},{name:'expired and revoked',args:[900,1000,true],expect:false}]},
prompt:`Write <code>function usable(notAfterEpoch, now, revoked)</code> returning <code>true</code> only when the certificate has not expired (<code>notAfterEpoch &gt; now</code>) <b>and</b> has not been revoked.`,
starter:`function usable(notAfterEpoch, now, revoked) {
  return false;
}`,
solution:`function usable(notAfterEpoch, now, revoked) {
  return notAfterEpoch > now && !revoked;
}`,
tests:[{d:'must not be expired',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:notAfterEpoch\\s*>\\s*now))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:notAfterEpoch\\s*>\\s*now)[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:notAfterEpoch\\s*>\\s*now)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:notAfterEpoch\\s*>\\s*now)[^{]*?return\\s+\\k<av>\\b)'},{d:'must not be revoked',re:'!\\s*revoked'}],
behavior:`Both failure modes are executed independently. In practice expiry is the reliable check and revocation is the unreliable one: soft-fail means an attacker who can block the revocation lookup simply wins, which is why the industry answer became short-lived certificates plus ACME automation rather than better revocation.`,
hints:['Two conditions joined with &&.','Expiry is strict: notAfterEpoch must be greater than now.','Use ! for "not revoked".']}},

{id:'pki6',title:'Keystores & truststores',body:`

<p>In Java (and most runtimes) certificates and keys live in two kinds of files:</p>
<ul>
<li><b>Keystore</b>: holds <b>your own</b> private keys and their certs. It's your <i>identity</i>, what you present in TLS/mTLS. Guard it. It has secrets.</li>
<li><b>Truststore</b>: holds the <b>CA certificates you trust</b>. Public certs only, no secrets. It's your <i>list of who you believe</i>. Validation walks a presented chain up to something in here.</li>
</ul>
<p>A <b>CA</b> is a certificate authority: an organization that signs certificates, vouching that a public key belongs to a name. Your browser and operating system ship with a list of CAs they trust, and a truststore is that list for your program. Manage both with <b>keytool</b>. Load them in code with the <code>KeyStore</code> API.</p>
<div class="codeSample">KeyStore ks = KeyStore.getInstance("PKCS12");   // your identity (private key + cert)
ks.load(new FileInputStream("ks.p12"), password);
// a truststore is just a KeyStore holding trusted CA certs (no private keys)
// TLS uses your keystore to present identity, your truststore to validate the peer</div>
<p>mTLS needs both, at both ends: a keystore to present your client cert, a truststore to validate the server's.</p>

<h4>Two files, two risk profiles</h4>
<p>Mixing them up is the source of most Java TLS misery.</p>
<div class="codeSample" data-hl>KEYSTORE    WHO YOU ARE.
            holds YOUR private key + its certificate chain.
            CONTAINS SECRETS. leaking it means someone can impersonate you.
            used to PRESENT identity: a TLS server, or an mTLS client.

TRUSTSTORE  WHO YOU BELIEVE.
            holds CA certificates. public documents, no secrets.
            leaking it is harmless. ADDING to it is the dangerous act -
            whoever holds that CA's key can now impersonate anything to you.
            used to VALIDATE the peer.

// a plain TLS client needs only a truststore.
// a TLS server needs only a keystore.
// mTLS needs BOTH, at BOTH ends.</div>

<h4>Where the trust comes from</h4>
<p>If you never configure a truststore, the JVM falls back to <code>$JAVA_HOME/lib/security/cacerts</code>, a bundle of public root CAs shipped with the JDK. The <b>JVM</b> is the Java Virtual Machine: the program that actually runs your compiled Java code. The <b>JDK</b> is the Java Development Kit: the compiler and tools, plus that runtime, installed together. That's why calling a public HTTPS API works with no configuration. It's also what surprises people: <b>configure a custom truststore and you replace that bundle rather than adding to it</b>. Every public CA disappears and unrelated calls start failing. If you need both, import your private CA <i>into</i> a copy of <code>cacerts</code>, or configure both stores explicitly.</p>

<h4>Formats, briefly</h4>
<p><b>PKCS#12</b> (<code>.p12</code>, <code>.pfx</code>) is the modern, portable standard, and the JDK default since Java 9. <b>PKCS</b> stands for Public-Key Cryptography Standards: a numbered family of formats for keys and certificates, and number 12 is the one for bundling a private key with its certificates. <b>JKS</b> is the legacy Java-only format. You'll still meet it in older systems, and <code>keytool -importkeystore</code> converts one to the other. Neither format changes what's inside.</p>
<div class="codeSample" data-hl># what is actually in this file?
keytool -list -v -keystore store.p12 -storetype PKCS12

# entry types tell you which kind of store you are looking at:
#   PrivateKeyEntry        -> a keystore. there is a secret in here.
#   trustedCertEntry       -> a truststore. public certificates only.

# and the flags that point Java at them:
-Djavax.net.ssl.keyStore=/path/id.p12   -Djavax.net.ssl.keyStorePassword=...
-Djavax.net.ssl.trustStore=/path/ca.p12 -Djavax.net.ssl.trustStorePassword=...</div>

<h4>Operating them</h4>
<p><b>Treat a keystore as a secret.</b> Not in the image, not in the repository, not in a wiki. It belongs in a secret manager or mounted at runtime, with the same rotation story as any other credential. The secrets lesson in the governance stream makes that argument in full.</p>
<p><b>Truststores need rotating too.</b> Teams forget this. Root CAs expire, and public roots are occasionally distrusted after an incident. A truststore assembled once and never revisited breaks an integration on a date nobody has in a calendar.</p>
<p><b>Prefer the platform's stores where you can.</b> In a service mesh the sidecar handles all of this and rotates certificates hourly. In a cloud runtime the managed identity does. The problem with hand-managed keystores is that they are <b>quiet</b>: nothing reminds you they exist until something expires.</p>`,
docs:[['KeyStore (API)','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/security/KeyStore.html'],['PKCS12','https://www.rfc-editor.org/rfc/rfc7292']],
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
tests:[{d:'uses the modern PKCS12 format',re:'KeyStore\\.getInstance\\s*\\(\\s*"PKCS12"\\s*\\)'},{d:'truststore membership = trust',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:truststoreAliases\\s*\\.\\s*contains\\s*\\(\\s*caAlias\\s*\\)))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:truststoreAliases\\s*\\.\\s*contains\\s*\\(\\s*caAlias\\s*\\))[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:truststoreAliases\\s*\\.\\s*contains\\s*\\(\\s*caAlias\\s*\\))[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:truststoreAliases\\s*\\.\\s*contains\\s*\\(\\s*caAlias\\s*\\))[^{]*?return\\s+\\k<av>\\b)'}],
behavior:`loadPkcs12() returns a PKCS12 KeyStore instance (your identity store). trusts(aliases, caAlias) is true when that CA is present in the truststore. The keystore holds your private key; the truststore holds the CAs you validate peers against; mTLS needs both.`,
hints:['<code>return KeyStore.getInstance("PKCS12");</code>: PKCS12 over the legacy JKS.','A truststore is just a KeyStore of trusted CA certs; membership means "trusted".','Keystore = secrets (your identity); truststore = public certs (who you trust).'],
solution:`import java.security.KeyStore;
import java.util.*;

public class Stores {
    static KeyStore loadPkcs12() throws Exception {
        return KeyStore.getInstance("PKCS12");
    }
    static boolean trusts(Set<String> truststoreAliases, String caAlias) {
        return truststoreAliases.contains(caAlias);
    }
}`}},

{id:'pki7',title:'Certificate pinning: stronger than trust, and easier to get wrong',body:`

<p>The chain-of-trust lessons end reassuringly: your client trusts a set of certificate authorities, and any certificate chaining to one of them is accepted. A <b>CA</b>, a certificate authority, is an organization that signs certificates, vouching that a public key belongs to a name. Your browser and operating system ship with a list of CAs they trust. That means <b>any</b> of the hundred-odd CAs in the trust store can issue a certificate for your domain. A compromised or coerced CA, or a corporate interception proxy on the device, produces a certificate your client accepts.</p>
<p><b>Certificate pinning</b> narrows that. The client refuses a connection unless something in the presented chain matches a value it was configured with in advance. Trust stops being "any CA" and becomes "this specific key".</p>

<h4>What to pin, and why not the leaf</h4>
<p>Modern practice pins the <b>public key</b>, a hash of the SubjectPublicKeyInfo, rather than the certificate itself. Certificates are reissued often. If the key is carried across a renewal, a key pin survives it. A certificate pin does not.</p>
<p>Then which certificate in the chain:</p>
<ul>
<li><b>The leaf</b>: the strongest and the most brittle. Every rotation is a coordinated release.</li>
<li><b>An intermediate</b>: survives leaf rotation, still excludes every other CA. The usual choice.</li>
<li><b>The root</b>: survives almost everything, and narrows trust only from "any CA" to "this one CA".</li>
</ul>
<p>Whatever you choose, <b>pin more than one value</b>. A backup pin, a second key held offline and not yet in use, turns an emergency key rotation from an outage into a deployment.</p>

<h4>The failure mode is self-inflicted denial of service</h4>
<p>A pin that no longer matches doesn't degrade gracefully. The client refuses to connect, and no server-side change can fix it. If your mobile app pins a key you then rotate, every installed copy is bricked until users update, and you can't push an update to a client that won't talk to you.</p>
<p>So <b>the pin lifetime is bounded by your ability to update clients.</b> A mobile app with a slow update tail should pin an intermediate, keep a backup pin, and monitor failures. An internal service, where you control both ends and deploy together, can pin aggressively.</p>
<p>HTTP Public Key Pinning, the header-based version for browsers, was <b>removed</b> because sites bricked themselves with it. Pinning survives where the client is an application you control, not a browser.</p>

<h4>Where it earns its risk</h4>
<p>Mobile apps talking to their own backend, because the threat is real: otherwise an attacker with a device and a proxy certificate reads your entire API. Payment and messaging clients, where interception is the whole attack. Internal service-to-service calls, where mTLS with a private CA is pinning by another name and there is no update problem.</p>
<p>Where it doesn't: a public website, since the browser already ships a trust store and a revocation mechanism. A service integrating with third-party APIs whose rotation schedule you don't control. Anywhere nobody is set up to monitor and rotate pins. The test is whether you can answer "what happens when this key rotates unexpectedly?" with a procedure.</p>

<h4>The cookbook: computing a pin, and rotating without bricking anyone</h4>
<div class="codeSample" data-hl># the SPKI pin of a live server's leaf (inspect what you would be trusting)
openssl s_client -connect api.example.com:443 2&gt;/dev/null | openssl x509 -pubkey -noout | openssl pkey -pubin -outform der | openssl dgst -sha256 -binary | openssl enc -base64

# the pin of the intermediate you actually chose
openssl x509 -in intermediate.pem -pubkey -noout | openssl pkey -pubin -outform der | openssl dgst -sha256 -binary | openssl enc -base64

# the backup pin: generate the NEXT key today, pin it, keep it offline
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out next.key
openssl pkey -in next.key -pubout -outform der | openssl dgst -sha256 -binary | openssl enc -base64</div>
<p>The rotation runbook: release N ships pins for the current key and the offline next key. When N's adoption crosses your comfort line, rotate the server to the next key. Generate a fresh offline next, pin it in N+1, repeat.</p>`,
docs:[['OWASP (certificate and public key pinning)','https://owasp.org/www-community/controls/Certificate_and_Public_Key_Pinning'],['RFC 7469 (HPKP (obsolete, and instructive))','https://www.rfc-editor.org/rfc/rfc7469'],['Android (network security configuration)','https://developer.android.com/privacy-and-security/security-config']],
ex:{title:'Accept the chain, or fail closed',lang:'js',
run:{call:'pinAccepted',cases:[{name:'the leaf key matches a pin',args:[[{spkiHash:'aaa',isLeaf:true},{spkiHash:'bbb'}],['aaa']],expect:true},{name:'the leaf rotated but the pinned intermediate still matches',args:[[{spkiHash:'zzz',isLeaf:true},{spkiHash:'bbb'}],['aaa','bbb']],expect:true},{name:'nothing in the chain matches',args:[[{spkiHash:'zzz',isLeaf:true},{spkiHash:'yyy'}],['aaa','bbb']],expect:false},{name:'an empty pin set fails closed',args:[[{spkiHash:'aaa',isLeaf:true}],[]],expect:false},{name:'an empty chain matches nothing',args:[[],['aaa']],expect:false}]},
prompt:`Write <code>function pinAccepted(chain, pins)</code> returning whether a presented certificate chain satisfies pinning. Accept when <b>any</b> certificate in the chain has an <code>spkiHash</code> present in <code>pins</code>. An empty or missing pin set returns <code>false</code>: fail closed, so a configuration that failed to load never silently disables the control.`,
starter:`function pinAccepted(chain, pins) {
  return false;
}`,
solution:`function pinAccepted(chain, pins) {
  if (!pins || pins.length === 0) return false;      // no pins loaded: fail closed
  return chain.some(c => pins.includes(c.spkiHash)); // ANY cert in the chain may match
}`,
tests:[{d:'an empty pin set is refused',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:length\\s*===\\s*0|!pins|length\\s*<\\s*1))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:length\\s*===\\s*0|!pins|length\\s*<\\s*1)[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:length\\s*===\\s*0|!pins|length\\s*<\\s*1)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:length\\s*===\\s*0|!pins|length\\s*<\\s*1)[^{]*?return\\s+\\k<av>\\b)'},{d:'the whole chain is searched',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:some\\s*\\(|for\\s*\\())|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:some\\s*\\(|for\\s*\\()[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:some\\s*\\(|for\\s*\\()[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:some\\s*\\(|for\\s*\\()[^{]*?return\\s+\\k<av>\\b)'},{d:'the pin list is consulted',re:'pins\\.includes|indexOf'},{d:'the key hash is what is compared',re:'spkiHash'}],
behavior:`Five cases execute. Case two is the argument for pinning an intermediate rather than a leaf: the leaf key changed (an ordinary certificate renewal), and the connection still succeeds because the pinned intermediate is in the chain. Pin only the leaf and that same renewal is an outage on every installed client, fixable only by shipping an update to devices that can no longer reach you. Case four is a deliberate design choice worth arguing about: an empty pin list could mean "pinning disabled" and return true, which is friendlier and means a failed configuration load silently removes a security control. Failing closed makes the misconfiguration loud, which is the correct trade for a control you adopted on purpose.`,
hints:['Any certificate in the chain matching any pin is enough.','Decide what an empty pin list means before you write the loop; it is a security decision.','You are comparing key hashes, not certificates.']}}
]});
