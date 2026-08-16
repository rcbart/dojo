STREAMS.push({iam:true,sec:'PKI & certificates',icon:'📜',title:'PKI & Certificate Management',blurb:'The trust machinery under TLS, mTLS and signed tokens: public-key infrastructure, X.509 certificates, certificate authorities and chains of trust, CSRs and key usage, revocation (CRL/OCSP), rotation & ACME, and Java keystores/truststores.',lessons:[

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
// a CA then issues an X.509 cert binding pair.getPublic() to your identity</div>

<h4>The problem PKI exists to solve, in plain English</h4>
<p>You want to talk privately to your bank. Encryption is not the hard part — the hard part is knowing
that the public key you just received belongs to the bank and not to whoever is sitting between you and
it. A key on its own is <b>anonymous</b>: it is a long number, and numbers do not have names.</p>
<p>Think of a passport. Anyone can print a card with their photograph on it. What makes a passport worth
anything is that a government you already trust <i>vouches for the binding</i> between the photograph and
the name, and did so in a way you can check. A certificate is that, for keys: a public key, an identity,
and a signature from an authority attesting that the two belong together.</p>

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
<p>The signature covers the whole document, so nothing in it can be altered without invalidating it. That
is the entire security property: you are not trusting the certificate, you are trusting whoever signed
it.</p>

<h4>Why asymmetric keys are what make this possible</h4>
<p>A symmetric secret has to be shared before it is useful, and anyone who can verify with it can also
forge with it. A key <b>pair</b> breaks that symmetry: the private key signs and decrypts, the public key
verifies and encrypts, and publishing the public one gives nothing away.</p>
<p>That asymmetry is what lets a stranger verify your identity without you having first met them — the
same property that makes federation possible in the identity streams, and the reason RS256 and ES256 are
preferred over HS256 across organisational boundaries.</p>

<h4>Two things worth knowing early</h4>
<p><b>A certificate is public.</b> It is meant to be handed to anyone who connects. There is nothing
secret in it. The private key is the secret, it never leaves the machine, and it is the only thing whose
loss actually matters.</p>
<p><b>The formats will confuse you once.</b> <b>PEM</b> is the base64 text with
<code>-----BEGIN CERTIFICATE-----</code> around it; <b>DER</b> is the same content in binary;
<b>PKCS#12</b> (<code>.p12</code>/<code>.pfx</code>) is an encrypted bundle holding a private key
<i>and</i> its certificate chain. When a tool rejects your file, the answer is nearly always that it
wanted a different container for the same bytes — <code>openssl x509 -in cert.pem -text -noout</code>
tells you what you actually have.</p>`,
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
 Check each link: child.Issuer == parent.Subject, signature valid, not expired/revoked</div>

<h4>Why the chain exists at all</h4>
<p>Your browser cannot know every website in the world. What it can do is know a few hundred
<b>root CAs</b>, shipped with the operating system or the browser, and accept anything they vouch for —
directly or through an intermediate.</p>
<p>That is delegation of trust, and the reason for the middle layer is entirely practical: <b>the root's
private key is the most valuable key in the system</b>. If it leaks, every certificate it ever signed
becomes suspect and the root has to be removed from every trust store on earth. So roots are kept offline,
in hardware, in a safe, and are brought out rarely to sign an intermediate. The intermediate does the daily
work and can be replaced without touching the root.</p>

<h4>What validation actually checks, in order</h4>
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

<h4>The failures you will actually meet</h4>
<p><b>"Unable to get local issuer certificate."</b> The server sent the leaf but not the intermediates, so
the client cannot build a path to a root it trusts. Browsers often paper over this by fetching the missing
link; <code>curl</code>, Java and Go do not. <b>The server must send the full chain</b> — leaf first, then
intermediates, never the root.</p>
<p><b>"Certificate has expired"</b> when it plainly has not. Check the client's clock. A container with a
badly skewed clock rejects perfectly valid certificates, and the error names the certificate rather than the
real cause.</p>
<p><b>A self-signed certificate</b> is its own issuer. It is not weaker cryptographically — it is simply
unvouched-for, which is why every client refuses it unless you explicitly add it to a trust store.</p>

<h4>Private CAs, and what they cost</h4>
<p>Inside your own estate you can run a CA and put its root in your own trust stores. That is how service
meshes and internal mTLS work, and it is legitimate. The cost is that <b>you now operate a CA</b>: you own
the root key's protection, the issuance policy, the rotation schedule, and the trust-store distribution to
every workload. Cloud-managed private CAs exist precisely because that list is longer than it looks.</p>
<p>And the warning that follows from all of this: <b>never add a CA to a trust store casually</b>. Whoever
holds that CA's key can now impersonate <i>any</i> site to that machine — which is exactly how corporate
TLS-inspection proxies work, and exactly why one is a serious decision rather than a networking detail.</p>`,
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
</ul>

<h4>Why a CSR rather than just asking</h4>
<p>The CA has to be sure of two separate things: that you are entitled to the name you are claiming, and
that you actually hold the private key for the public key you sent. A CSR proves the second on its own —
<b>it is signed with the private key it is asking to have certified</b>, so a CA that verifies the CSR's
own signature knows the requester holds the matching key.</p>
<p>The first — do you control <code>bank.com</code>? — is the CA's job to check, and it is where the real
security of the public web lives. For a public certificate that means <b>domain validation</b>: put a
specific token at a URL on the domain, or a specific TXT record in its DNS. ACME automates exactly this,
which is why free automated certificates became possible at all.</p>
<div class="codeSample" data-hl># what actually leaves your machine
openssl req -new -key server.key -out server.csr -subj "/CN=api.example.com" \
  -addext "subjectAltName=DNS:api.example.com,DNS:www.example.com"

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
<p>These are not documentation — <b>validators enforce them</b>. A leaf certificate presented as a CA, or a
certificate without <code>serverAuth</code> presented for TLS, must be rejected. That enforcement is what
stops an ordinary leaf certificate being used to mint certificates for other names, which is the single
worst thing that can go wrong in a PKI.</p>
<p>It is also why <b>one certificate should not do two jobs</b>. A certificate with both
<code>serverAuth</code> and <code>clientAuth</code> is common and usually harmless; a certificate with
<code>keyCertSign</code> on anything that is not a CA is a finding.</p>

<h4>Naming, and the trap in it</h4>
<p>Put every name the service answers to in the SAN, and remember that a <b>wildcard</b> such as
<code>*.example.com</code> matches exactly one label — it covers <code>api.example.com</code> but not
<code>a.b.example.com</code>, and not the bare <code>example.com</code>. Wildcards also concentrate risk:
one private key that can impersonate every subdomain you have. Prefer specific names where automation makes
it cheap, which ACME does.</p>

<h4>Where the private key should live</h4>
<p><b>Generated on the machine that will use it, and never moved.</b> If a key exists in two places you have
doubled the ways it can leak and lost the ability to say which copy was compromised. For anything
high-value — a CA key, a token-signing key — that means an <b>HSM</b> or a cloud KMS, where the key is
generated inside the device and the raw material never comes out at all. You send data in and get a
signature back; the key cannot be exfiltrated because it cannot be read.</p>`,
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
<!--flow:pki4-tls-->
<h4>TLS handshake — and what mTLS adds — step by step</h4>
<div class="flowDia"><svg viewBox="0 0 620 336" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="TLS handshake — and what mTLS adds"><defs><marker id="pki4-tls-ah-front" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent)"/></marker><marker id="pki4-tls-ah-back" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent2)"/></marker><marker id="pki4-tls-ah-attack" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--bad)"/></marker><marker id="pki4-tls-ah-x" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--muted)"/></marker></defs><line x1="74" y1="42" x2="74" y2="324" class="fdLife"/><line x1="546" y1="42" x2="546" y2="324" class="fdLife"/><rect x="35" y="8" width="78" height="34" rx="8" class="fdActor"/><text x="74" y="29.5" class="fdActorT">Client</text><rect x="507" y="8" width="78" height="34" rx="8" class="fdActor"/><text x="546" y="29.5" class="fdActorT">Server</text><line x1="77" y1="90" x2="541" y2="90" stroke="var(--accent2)" class="fdArrow" marker-end="url(#pki4-tls-ah-back)"/><text x="325" y="81" class="fdLabel">ClientHello — algorithms, SNI</text><circle cx="92" cy="90" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="92" y="93.5" class="fdNumT" style="fill:var(--accent2)">1</text><line x1="543" y1="120" x2="79" y2="120" stroke="var(--accent2)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#pki4-tls-ah-back)"/><text x="295" y="111" class="fdLabel">ServerHello + certificate CHAIN</text><circle cx="528" cy="120" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="528" y="123.5" class="fdNumT" style="fill:var(--accent2)">2</text><rect x="14" y="137" width="402.2" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="223.1" y="152" class="fdSelfT">build chain to a trusted root; name, validity, revocation</text><circle cx="14" cy="148" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="14" y="151.5" class="fdNumT" style="fill:var(--muted)">3</text><line x1="77" y1="186" x2="541" y2="186" stroke="var(--accent2)" class="fdArrow" marker-end="url(#pki4-tls-ah-back)"/><text x="325" y="177" class="fdLabel">key exchange → encrypted session</text><circle cx="92" cy="186" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="92" y="189.5" class="fdNumT" style="fill:var(--accent2)">4</text><line x1="14" y1="212" x2="606" y2="212" class="fdPhase"/><text x="310" y="216" class="fdPhaseT">mTLS adds a mirror image</text><line x1="543" y1="246" x2="79" y2="246" stroke="var(--accent2)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#pki4-tls-ah-back)"/><text x="295" y="237" class="fdLabel">CertificateRequest</text><circle cx="528" cy="246" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="528" y="249.5" class="fdNumT" style="fill:var(--accent2)">5</text><line x1="77" y1="276" x2="541" y2="276" stroke="var(--accent2)" class="fdArrow" marker-end="url(#pki4-tls-ah-back)"/><text x="325" y="267" class="fdLabel">client certificate + proof of key</text><circle cx="92" cy="276" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="92" y="279.5" class="fdNumT" style="fill:var(--accent2)">6</text><rect x="223.60000000000002" y="293" width="382.4" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="422.8" y="308" class="fdSelfT">verify the client’s chain — identity from the cert SAN</text><circle cx="223.60000000000002" cy="304" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="223.60000000000002" y="307.5" class="fdNumT" style="fill:var(--muted)">7</text></svg></div>
<ol class="fdSteps">
<li><b>Client → Server:</b> ClientHello — algorithms, SNI <i>(back channel)</i></li>
<li><b>Server → Client:</b> ServerHello + certificate CHAIN <i>(back channel)</i></li>
<li><b>Client:</b> build chain to a trusted root; name, validity, revocation</li>
<li><b>Client → Server:</b> key exchange → encrypted session <i>(back channel)</i></li>
<li><b>Server → Client:</b> CertificateRequest <i>(back channel)</i></li>
<li><b>Client → Server:</b> client certificate + proof of key <i>(back channel)</i></li>
<li><b>Server:</b> verify the client’s chain — identity from the cert SAN</li>
</ol>
<!--/flow:pki4-tls-->
<div class="codeSample">TLS handshake (server auth)
 1. Client → ClientHello (supported versions/ciphers)
 2. Server → its certificate chain (leaf + intermediates)
 3. Client validates: chain up to a trusted root, signatures OK, not expired/revoked,
                      and the requested hostname matches the cert SAN
 4. Key exchange → both derive session keys → encrypted channel
 -- mTLS adds: the SERVER also asks for the CLIENT's cert and validates it the same way --</div>
<p>The client's checks are non-negotiable: <b>valid chain</b>, <b>not expired</b>, <b>not revoked</b>, and <b>hostname matches the SAN</b> (a valid cert for the <i>wrong</i> host must be rejected — that's what stops impersonation). <b>mTLS</b> simply runs the same validation in <i>both</i> directions, which is how services authenticate each other (the S2S stream).</p>

<h4>What the handshake is really doing</h4>
<p>Two things at once, and it helps to keep them separate. <b>Authentication</b> — proving the server is who
the name says — and <b>key agreement</b>, arriving at a shared symmetric key for the actual conversation.
The certificate serves the first; the second uses ephemeral keys and is why a captured recording cannot be
decrypted later even if the server's key is stolen afterwards. That property is called <b>forward
secrecy</b> and it is the default in TLS 1.3.</p>
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
<p>A certificate can be perfectly valid — signed by a trusted CA, unexpired, unrevoked — and still be the
wrong certificate. Without the hostname check, an attacker who holds any valid certificate for any domain
could present it for yours, and the chain would verify happily.</p>
<p>This is the check that <b>library defaults get wrong</b>. Browsers always perform it. Hand-rolled HTTP
clients, and any code that disables verification to make a self-signed certificate work in development,
frequently do not — and that setting has a long history of reaching production. If a client needs to trust a
private CA, <b>add the CA to its trust store</b>; never disable verification.</p>

<h4>What mTLS adds, and what it does not</h4>
<p>It adds a verified caller identity at the transport layer, before a single byte of your application code
runs. It does not add authorization: as the service-to-service stream put it, every service in the mesh has
a valid certificate, so a successful handshake tells you the caller is <i>somebody</i>. Which somebody, and
whether they may call this endpoint, is still yours to decide from the certificate's subject or SAN.</p>

<h4>Debugging it</h4>
<div class="codeSample" data-hl>openssl s_client -connect api.example.com:443 -servername api.example.com
  # shows the chain the server ACTUALLY sends, in order.
  # "unable to get local issuer certificate" here usually means the
  # server omitted its intermediates - a server misconfiguration, even
  # though browsers may hide it.

openssl x509 -in cert.pem -noout -dates -ext subjectAltName
  # the two things you check most: when it expires, and which names.</div>
<p>The lesson from the failure modes: <b>most TLS problems are configuration, not cryptography</b> — a
missing intermediate, a skewed clock, a name not in the SAN, or a certificate nobody renewed.</p>`,
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
<!--flow:pki5-acme-->
<h4>ACME: automated issuance and renewal — step by step</h4>
<div class="flowDia"><svg viewBox="0 0 700 342" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ACME: automated issuance and renewal"><defs><marker id="pki5-acme-ah-front" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent)"/></marker><marker id="pki5-acme-ah-back" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent2)"/></marker><marker id="pki5-acme-ah-attack" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--bad)"/></marker><marker id="pki5-acme-ah-x" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--muted)"/></marker></defs><line x1="74" y1="54" x2="74" y2="330" class="fdLife"/><line x1="350" y1="54" x2="350" y2="330" class="fdLife"/><line x1="626" y1="54" x2="626" y2="330" class="fdLife"/><rect x="17.900000000000006" y="8" width="112.19999999999999" height="46" rx="8" class="fdActor"/><text x="74" y="27" class="fdActorT">ACME client</text><text x="74" y="42" class="fdActorS">certbot / caddy</text><rect x="311" y="8" width="78" height="46" rx="8" class="fdActor"/><text x="350" y="27" class="fdActorT">CA</text><text x="350" y="42" class="fdActorS">Let’s Encrypt</text><rect x="545.3" y="8" width="161.39999999999998" height="46" rx="8" class="fdActor"/><text x="626" y="35.5" class="fdActorT">Your server / DNS</text><line x1="77" y1="102" x2="345" y2="102" stroke="var(--accent2)" class="fdArrow" marker-end="url(#pki5-acme-ah-back)"/><text x="227" y="93" class="fdLabel">new order: example.com</text><circle cx="92" cy="102" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="92" y="105.5" class="fdNumT" style="fill:var(--accent2)">1</text><line x1="347" y1="132" x2="79" y2="132" stroke="var(--accent2)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#pki5-acme-ah-back)"/><text x="197" y="123" class="fdLabel">challenge: prove you control it</text><circle cx="332" cy="132" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="332" y="135.5" class="fdNumT" style="fill:var(--accent2)">2</text><line x1="77" y1="162" x2="621" y2="162" stroke="var(--accent2)" class="fdArrow" marker-end="url(#pki5-acme-ah-back)"/><text x="365" y="153" class="fdLabel">place token at /.well-known/acme-challenge (or DNS TXT)</text><circle cx="92" cy="162" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="92" y="165.5" class="fdNumT" style="fill:var(--accent2)">3</text><line x1="353" y1="192" x2="621" y2="192" stroke="var(--accent2)" class="fdArrow" marker-end="url(#pki5-acme-ah-back)"/><text x="503" y="183" class="fdLabel">fetch the token from the public internet</text><circle cx="368" cy="192" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="368" y="195.5" class="fdNumT" style="fill:var(--accent2)">4</text><line x1="347" y1="222" x2="79" y2="222" stroke="var(--accent2)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#pki5-acme-ah-back)"/><text x="197" y="213" class="fdLabel">validated — send your CSR</text><circle cx="332" cy="222" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="332" y="225.5" class="fdNumT" style="fill:var(--accent2)">5</text><line x1="77" y1="252" x2="345" y2="252" stroke="var(--accent2)" class="fdArrow" marker-end="url(#pki5-acme-ah-back)"/><text x="227" y="243" class="fdLabel">CSR</text><circle cx="92" cy="252" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="92" y="255.5" class="fdNumT" style="fill:var(--accent2)">6</text><line x1="347" y1="282" x2="79" y2="282" stroke="var(--accent2)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#pki5-acme-ah-back)"/><text x="197" y="273" class="fdLabel">signed certificate (90 days)</text><circle cx="332" cy="282" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="332" y="285.5" class="fdNumT" style="fill:var(--accent2)">7</text><rect x="14" y="299" width="428.59999999999997" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="236.29999999999998" y="314" class="fdSelfT">renew automatically around day 60 — nobody remembers manually</text><circle cx="14" cy="310" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="14" y="313.5" class="fdNumT" style="fill:var(--muted)">8</text></svg></div>
<ol class="fdSteps">
<li><b>ACME client → CA:</b> new order: example.com <i>(back channel)</i></li>
<li><b>CA → ACME client:</b> challenge: prove you control it <i>(back channel)</i></li>
<li><b>ACME client → Your server / DNS:</b> place token at /.well-known/acme-challenge (or DNS TXT) <i>(back channel)</i></li>
<li><b>CA → Your server / DNS:</b> fetch the token from the public internet <i>(back channel)</i></li>
<li><b>CA → ACME client:</b> validated — send your CSR <i>(back channel)</i></li>
<li><b>ACME client → CA:</b> CSR <i>(back channel)</i></li>
<li><b>CA → ACME client:</b> signed certificate (90 days) <i>(back channel)</i></li>
<li><b>ACME client:</b> renew automatically around day 60 — nobody remembers manually</li>
</ol>
<!--/flow:pki5-acme-->
<ul>
<li><b>Expiry</b> — every cert has a hard <code>notAfter</code>. Let one lapse and clients reject it — a classic outage. The industry is moving to <b>short-lived</b> certs (days/hours) precisely so revocation matters less.</li>
<li><b>Revocation</b> — invalidating a cert before it expires. Two mechanisms: <b>CRL</b> (Certificate Revocation List — a signed list of revoked serials the client downloads) and <b>OCSP</b> (Online Certificate Status Protocol — the client asks "is this serial still good?"). <b>OCSP stapling</b> has the <i>server</i> attach a fresh, signed OCSP response so the client needn't call the CA (faster, more private).</li>
<li><b>Rotation</b> — replacing a cert before it expires (or a key is compromised). Automate it; overlap old+new during rollover.</li>
<li><b>ACME</b> — the protocol (Let's Encrypt) that <b>automates</b> issuance and renewal: prove domain control, get a cert, auto-renew. This is why free, auto-rotating TLS is now the norm.</li>
</ul>
<div class="codeSample">A cert is usable only if:  now &lt; notAfter   AND   not revoked (per CRL/OCSP)
 Short-lived certs + automation (ACME) &gt; long-lived certs + manual revocation.</div>

<h4>Update: OCSP is being retired</h4>
<p>The two-mechanism picture above is how revocation was taught for twenty years, and it is now out of
date in one important respect: <b>OCSP is going away</b>. The reason is privacy — an OCSP responder
learns which site a given IP address is visiting, in real time, every time. In August 2023 the
CA/Browser Forum passed a ballot making OCSP <b>optional</b> for publicly trusted CAs (effective March
2024), and Let's Encrypt — the largest CA in the world by certificate count — shut its OCSP responders
down for good on <b>6 August 2025</b>, after adding CRL support in 2022 and removing OCSP URLs from
issued certificates in May 2025.</p>
<p>What replaced it is not classic CRL downloading either, which never scaled to the browser. Browsers
now aggregate revocation centrally and push a compressed summary to clients — <b>CRLite</b> in Firefox,
<b>CRLSets</b> in Chrome — so the client checks locally with no network call and no privacy leak. The
CA publishes CRLs; the browser vendor does the aggregation.</p>
<div class="codeSample" data-hl>then                          now
  client -> OCSP responder      CA -> publishes CRL
  ("is serial 0x4f2 ok?")       browser vendor -> aggregates + compresses
  privacy leak, latency,        client -> checks a LOCAL structure
  soft-fail on timeout          no call, no leak, no soft-fail

// and underneath both: SHORT-LIVED CERTIFICATES.
// a 6-day certificate barely needs revocation - expiry does the job.
// this is why the CA/B Forum is ratcheting maximum lifetimes down.</div>
<p>The practical lesson has not changed, it has hardened: <b>revocation has never worked reliably</b>
(soft-fail means an attacker who can block the check simply wins), so the industry solved it by making
certificates short enough that revocation matters less. Automate issuance with ACME, keep lifetimes
short, and treat revocation as a backstop rather than a control you can depend on.`,
docs:[['Let&#39;s Encrypt - OCSP service end of life (Aug 2025)','https://letsencrypt.org/2025/08/06/ocsp-service-has-reached-end-of-life'],['Mozilla CRLite','https://blog.mozilla.org/security/2020/01/09/crlite-part-1-all-web-pki-revocations-compressed/'],['RFC 6960 — OCSP','https://www.rfc-editor.org/rfc/rfc6960'],['RFC 8555 — ACME','https://www.rfc-editor.org/rfc/rfc8555'],['Lets Encrypt','https://letsencrypt.org/how-it-works/']],
ex:{title:'Is this certificate usable?',lang:'js',
run:{call:'usable',cases:[{name:'valid and not revoked',args:[2000,1000,false],expect:true},{name:'expired',args:[900,1000,false],expect:false},{name:'revoked',args:[2000,1000,true],expect:false},{name:'expiring exactly now is unusable',args:[1000,1000,false],expect:false},{name:'expired and revoked',args:[900,1000,true],expect:false}]},
prompt:`Write <code>function usable(notAfterEpoch, now, revoked)</code> returning <code>true</code> only when the certificate has not expired (<code>notAfterEpoch &gt; now</code>) <b>and</b> has not been revoked.`,
starter:`function usable(notAfterEpoch, now, revoked) {
  return false;
}`,
solution:`function usable(notAfterEpoch, now, revoked) {
  return notAfterEpoch > now && !revoked;
}`,
tests:[{d:'must not be expired',re:'notAfterEpoch\\s*>\\s*now'},{d:'must not be revoked',re:'!\\s*revoked'}],
behavior:`Both failure modes are executed independently. In practice expiry is the reliable check and revocation is the unreliable one — soft-fail means an attacker who can block the revocation lookup simply wins, which is why the industry answer became short-lived certificates plus ACME automation rather than better revocation.`,
hints:['Two conditions joined with &&.','Expiry is strict: notAfterEpoch must be greater than now.','Use ! for "not revoked".']}},

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
<p>Rule of thumb: <b>keystore = who you are (has secrets); truststore = who you trust (public only).</b> mTLS needs both — a keystore to present your client cert, a truststore to validate the server's (and vice-versa).</p>

<h4>The distinction, and why it is worth being pedantic about</h4>
<p>Two files, two completely different risk profiles, and mixing them up is the source of most Java TLS
misery.</p>
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

<h4>Where the trust actually comes from</h4>
<p>If you never configure a truststore, the JVM falls back to <code>$JAVA_HOME/lib/security/cacerts</code>
— a bundle of public root CAs shipped with the JDK. That is why calling a public HTTPS API works with no
configuration, and it is also the thing that surprises people: <b>configure a custom truststore and you
replace that bundle rather than adding to it</b>, so every public CA disappears and unrelated calls start
failing. If you need both, import your private CA <i>into</i> a copy of <code>cacerts</code>, or configure
both stores explicitly.</p>

<h4>Formats, briefly</h4>
<p><b>PKCS#12</b> (<code>.p12</code>, <code>.pfx</code>) is the modern, portable standard and has been the
JDK default since Java 9. <b>JKS</b> is the legacy Java-only format; you will still meet it in older
systems, and <code>keytool -importkeystore</code> converts one to the other. Neither format changes what is
inside — the same distinction above applies to both.</p>
<div class="codeSample" data-hl># what is actually in this file?
keytool -list -v -keystore store.p12 -storetype PKCS12

# entry types tell you which kind of store you are looking at:
#   PrivateKeyEntry        -> a keystore. there is a secret in here.
#   trustedCertEntry       -> a truststore. public certificates only.

# and the flags that point Java at them:
-Djavax.net.ssl.keyStore=/path/id.p12   -Djavax.net.ssl.keyStorePassword=...
-Djavax.net.ssl.trustStore=/path/ca.p12 -Djavax.net.ssl.trustStorePassword=...</div>

<h4>Operating them</h4>
<p><b>Treat a keystore as a secret.</b> Not in the image, not in the repository, not in a wiki. It belongs
in a secret manager or mounted at runtime, with the same rotation story as any other credential — which is
the argument the secrets lesson in the governance stream makes in full.</p>
<p><b>Truststores need rotating too</b>, and this is the one teams forget. Root CAs expire, and public roots
are occasionally distrusted outright after an incident. A truststore assembled once and never revisited
becomes the reason an integration breaks on a date nobody has in a calendar.</p>
<p><b>Prefer the platform's stores where you can.</b> In a service mesh the sidecar handles all of this and
rotates certificates hourly; in a cloud runtime the managed identity does. Hand-managed keystores are worth
avoiding not because they are hard but because they are <b>quiet</b> — nothing reminds you they exist until
something expires.`,
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
}`}},

{id:'pki7',title:'Certificate pinning: stronger than trust, and easier to get wrong',body:`
<p>The chain-of-trust lessons end with a reassuring conclusion: your client trusts a set of certificate
authorities, and any certificate chaining to one of them is accepted. That is what makes the web work, and
it contains an uncomfortable implication — <b>any</b> of the hundred-odd CAs in the trust store can issue a
certificate for your domain. A compromised or coerced CA, or a corporate interception proxy installed on
the device, produces a certificate your client accepts happily.</p>
<p><b>Certificate pinning</b> narrows that. The client refuses to accept a connection unless something in
the presented chain matches a value it was configured with in advance. Trust stops being "any CA" and
becomes "this specific key".</p>

<h4>What to pin, and why it is usually not the leaf</h4>
<p>Modern practice pins the <b>public key</b> — specifically a hash of the SubjectPublicKeyInfo — rather
than the certificate itself. That distinction matters: certificates are reissued routinely, and if the key
is carried across a renewal, a key pin survives it while a certificate pin does not.</p>
<p>Then there is a choice of which certificate in the chain to pin:</p>
<ul>
<li><b>The leaf</b> — the strongest and the most brittle. Every rotation is a coordinated release.</li>
<li><b>An intermediate</b> — survives leaf rotation, still excludes every other CA. The usual choice.</li>
<li><b>The root</b> — survives almost everything, and narrows trust only from "any CA" to "this one CA".</li>
</ul>
<p>Whatever you choose, <b>pin more than one value</b>. A backup pin — a second key held offline and not yet
in use — is what turns an emergency key rotation from an outage into a deployment.</p>

<h4>The failure mode is self-inflicted denial of service</h4>
<p>This is the thing to understand before adopting it. A pin that no longer matches does not degrade
gracefully; the client refuses to connect, and it refuses in a way no server-side change can fix. If your
mobile app pins a key you then rotate, every installed copy is bricked until users update — and you cannot
push an update to a client that will not talk to you.</p>
<p>The rule that follows: <b>the pin lifetime is bounded by your ability to update clients.</b> A web page
can reasonably pin nothing at all, because the browser already ships a trust store and a revocation
mechanism. A mobile app with a slow update tail should pin an intermediate, keep a backup pin, and monitor
failures. An internal service, where you control both ends and can deploy together, can pin aggressively.</p>
<p>Note also that HTTP Public Key Pinning — the header-based version for browsers — was <b>removed</b>
precisely because sites bricked themselves with it. Pinning survives where the client is an application you
control, not where it is a browser.</p>

<h4>Where it earns its risk</h4>
<p>Mobile applications talking to their own backend, because the threat is real: an attacker with a device
and a proxy certificate reads your entire API otherwise. Payment and messaging clients where interception
is the whole attack. Internal service-to-service calls, where mTLS with a private CA is really pinning by
another name and the update problem does not exist.</p>
<p>Where it does not earn its risk: a public website, a service integrating with third-party APIs whose
rotation schedule you do not control, and anywhere the operational maturity to monitor and rotate pins does
not exist. The real test is whether you can answer "what happens when this key rotates unexpectedly?"
with a procedure rather than a silence.</p>`,
docs:[['OWASP — certificate and public key pinning','https://owasp.org/www-community/controls/Certificate_and_Public_Key_Pinning'],['RFC 7469 — HPKP (obsolete, and instructive)','https://www.rfc-editor.org/rfc/rfc7469'],['Android — network security configuration','https://developer.android.com/privacy-and-security/security-config']],
ex:{title:'Accept the chain, or fail closed',lang:'js',
run:{call:'pinAccepted',cases:[{name:'the leaf key matches a pin',args:[[{spkiHash:'aaa',isLeaf:true},{spkiHash:'bbb'}],['aaa']],expect:true},{name:'the leaf rotated but the pinned intermediate still matches',args:[[{spkiHash:'zzz',isLeaf:true},{spkiHash:'bbb'}],['aaa','bbb']],expect:true},{name:'nothing in the chain matches',args:[[{spkiHash:'zzz',isLeaf:true},{spkiHash:'yyy'}],['aaa','bbb']],expect:false},{name:'an empty pin set fails closed',args:[[{spkiHash:'aaa',isLeaf:true}],[]],expect:false},{name:'an empty chain matches nothing',args:[[],['aaa']],expect:false}]},
prompt:`Write <code>function pinAccepted(chain, pins)</code> returning whether a presented certificate chain satisfies pinning. Accept when <b>any</b> certificate in the chain has an <code>spkiHash</code> present in <code>pins</code>. An empty or missing pin set returns <code>false</code> — fail closed, so a configuration that failed to load never silently disables the control.`,
starter:`function pinAccepted(chain, pins) {
  return false;
}`,
solution:`function pinAccepted(chain, pins) {
  if (!pins || pins.length === 0) return false;      // no pins loaded: fail closed
  return chain.some(c => pins.includes(c.spkiHash)); // ANY cert in the chain may match
}`,
tests:[{d:'an empty pin set is refused',re:'length\\s*===\\s*0|!pins|length\\s*<\\s*1'},{d:'the whole chain is searched',re:'some\\s*\\(|for\\s*\\('},{d:'the pin list is consulted',re:'pins\\.includes|indexOf'},{d:'the key hash is what is compared',re:'spkiHash'}],
behavior:`Five cases execute. Case two is the argument for pinning an intermediate rather than a leaf: the leaf key changed — an ordinary certificate renewal — and the connection still succeeds because the pinned intermediate is in the chain. Pin only the leaf and that same renewal is an outage on every installed client, fixable only by shipping an update to devices that can no longer reach you. Case four is a deliberate design choice worth arguing about: an empty pin list could mean "pinning disabled" and return true, which is friendlier and means a failed configuration load silently removes a security control. Failing closed makes the misconfiguration loud, which is the correct trade for a control you adopted on purpose.`,
hints:['Any certificate in the chain matching any pin is enough.','Decide what an empty pin list means before you write the loop — it is a security decision.','You are comparing key hashes, not certificates.']}}
]});
