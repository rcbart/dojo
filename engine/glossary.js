/* ============================== GLOSSARY & CLICK-TO-EXPLAIN ==============================
   The keyword table, the selection popup, and the domain-ordered glossary.
   Extracted from app.js: it is ~570 lines of reference DATA plus the two small
   renderers that read it, and it changes for entirely different reasons than
   the rest of the runtime.

   Load order matters. The IIFE below merges glossary terms into KW at load, so
   this file must be concatenated BEFORE app.js, which is why KW lives here
   rather than staying behind. */
/* ============================== KEYWORDS ============================== */
const TUT='https://docs.oracle.com/javase/tutorial/';
const KW={
abstract:['Declares a class that cannot be instantiated or a method without a body that subclasses must implement.',TUT+'java/IandI/abstract.html'],
assert:['Tests an assumption at runtime; throws AssertionError if false (enable with -ea).','https://docs.oracle.com/javase/8/docs/technotes/guides/language/assert.html'],
boolean:['Primitive type holding true or false.',TUT+'java/nutsandbolts/datatypes.html'],
break:['Exits the nearest loop or switch immediately.',TUT+'java/nutsandbolts/branch.html'],
byte:['8-bit signed integer primitive (-128 to 127).',TUT+'java/nutsandbolts/datatypes.html'],
case:['One branch of a switch statement or expression.',TUT+'java/nutsandbolts/switch.html'],
catch:['Handles an exception thrown in the matching try block.',TUT+'essential/exceptions/catch.html'],
char:['16-bit Unicode character primitive, e.g. \'A\'.',TUT+'java/nutsandbolts/datatypes.html'],
class:['Declares a class, a blueprint bundling state (fields) and behavior (methods).',TUT+'java/javaOO/classes.html'],
continue:['Skips the rest of the current loop iteration and starts the next one.',TUT+'java/nutsandbolts/branch.html'],
default:['Fallback branch in a switch; also declares a default method body in an interface.',TUT+'java/IandI/defaultmethods.html'],
do:['Starts a do-while loop, which always runs its body at least once.',TUT+'java/nutsandbolts/while.html'],
double:['64-bit floating point primitive; the default for decimal literals.',TUT+'java/nutsandbolts/datatypes.html'],
else:['Branch executed when the if condition is false.',TUT+'java/nutsandbolts/if.html'],
enum:['Declares a fixed set of named constants, each a singleton instance.',TUT+'java/javaOO/enum.html'],
extends:['Declares inheritance: the subclass inherits members of the superclass. A class can extend only one class.',TUT+'java/IandI/subclasses.html'],
final:['On a variable: assignable once. On a method: cannot be overridden. On a class: cannot be extended.',TUT+'java/IandI/final.html'],
finally:['Block that always runs after try/catch, for cleanup. Prefer try-with-resources for closeables.',TUT+'essential/exceptions/finally.html'],
float:['32-bit floating point primitive; literal needs an f suffix (1.5f).',TUT+'java/nutsandbolts/datatypes.html'],
for:['Classic counted loop, or enhanced for-each over arrays and Iterables: for (var x : list).',TUT+'java/nutsandbolts/for.html'],
if:['Conditional branch: runs the block when the boolean expression is true.',TUT+'java/nutsandbolts/if.html'],
implements:['Declares that a class provides the methods of an interface. A class can implement many interfaces.',TUT+'java/IandI/usinginterface.html'],
import:['Makes a class or static member from another package usable without its full name.',TUT+'java/package/usepkgs.html'],
instanceof:['Tests whether an object is of a given type; with pattern matching also binds it: if (o instanceof String s).','https://dev.java/learn/pattern-matching/'],
int:['32-bit signed integer primitive (the default integer type.)',TUT+'java/nutsandbolts/datatypes.html'],
interface:['A contract of abstract methods (plus default/static methods) that classes implement. Basis of polymorphism and lambdas.',TUT+'java/IandI/createinterface.html'],
long:['64-bit signed integer primitive; literal needs an L suffix (10_000_000_000L).',TUT+'java/nutsandbolts/datatypes.html'],
new:['Instantiates an object: allocates it on the heap and runs the constructor.',TUT+'java/javaOO/objectcreation.html'],
package:['Declares the namespace a class lives in; maps to the directory structure.',TUT+'java/package/packages.html'],
private:['Member visible only inside its own class. Default choice for fields (encapsulation).',TUT+'java/javaOO/accesscontrol.html'],
protected:['Member visible in the same package and in subclasses.',TUT+'java/javaOO/accesscontrol.html'],
public:['Member or class visible everywhere.',TUT+'java/javaOO/accesscontrol.html'],
return:['Exits a method, optionally handing back a value.',TUT+'java/javaOO/returnvalue.html'],
short:['16-bit signed integer primitive.',TUT+'java/nutsandbolts/datatypes.html'],
static:['Belongs to the class itself, not to instances. One copy shared by all; called without an object.',TUT+'java/javaOO/classvars.html'],
super:['Refers to the superclass: call its constructor super(...) or its methods super.m().',TUT+'java/IandI/super.html'],
switch:['Multi-way branch on a value. Modern switch expressions use -> arrows and can return a value.','https://dev.java/learn/language-basics/switch-expression/'],
synchronized:['Marks a method/block as a mutual-exclusion critical section using an object monitor lock.',TUT+'essential/concurrency/syncmeth.html'],
this:['Reference to the current object; also this(...) calls another constructor of the same class.',TUT+'java/javaOO/thiskey.html'],
throw:['Throws an exception object: throw new IllegalArgumentException("bad").',TUT+'essential/exceptions/throwing.html'],
throws:['Declares the checked exceptions a method may propagate to its caller.',TUT+'essential/exceptions/declaring.html'],
transient:['Excludes a field from Java serialization.','https://docs.oracle.com/javase/8/docs/platform/serialization/spec/serial-arch.html'],
try:['Starts a block whose exceptions can be caught; try (resource) auto-closes AutoCloseables.',TUT+'essential/exceptions/try.html'],
var:['Local variable type inference (Java 10+): the compiler infers the type from the initializer. Still statically typed.','https://dev.java/learn/language-basics/using-var/'],
void:['Return type meaning the method returns nothing.',TUT+'java/javaOO/methods.html'],
volatile:['Guarantees reads/writes of the field go to main memory, visibility across threads, not atomicity.',TUT+'essential/concurrency/atomic.html'],
while:['Loop that runs while its condition stays true.',TUT+'java/nutsandbolts/while.html'],
record:['Concise immutable data carrier (Java 16+): record Point(int x, int y) {} auto-generates constructor, accessors, equals, hashCode, toString.','https://dev.java/learn/records/'],
sealed:['Restricts which classes may extend/implement this type, listed with permits (Java 17+).','https://dev.java/learn/sealed-classes/'],
permits:['Lists the allowed subclasses of a sealed type.','https://dev.java/learn/sealed-classes/'],
yield:['Returns a value from a switch expression block branch.','https://dev.java/learn/language-basics/switch-expression/'],
stream:['Not a keyword but core API: a lazy pipeline of operations (filter, map, reduce) over data. See java.util.stream.','https://dev.java/learn/api/streams/'],
Optional:['Container that may or may not hold a value, an explicit alternative to returning null.','https://dev.java/learn/api/streams/optionals/'],
String:['Immutable sequence of characters; the most used class in Java.',TUT+'java/data/strings.html'],
null:['Literal meaning "no object". Dereferencing it throws NullPointerException.',TUT+'java/nutsandbolts/datatypes.html'],
true:['Boolean literal.',TUT+'java/nutsandbolts/datatypes.html'],
false:['Boolean literal.',TUT+'java/nutsandbolts/datatypes.html'],
};
/* ============================== KEYWORD POPUP ============================== */
const tip=document.getElementById('kwTip');
function showTip(word,x,y){
  const k=KW[word]||KW[word.toLowerCase()];
  if(!k){tip.style.display='none';return}
  const link=/^https?:/.test(k[1]||'')?` <a href="${k[1]}" target="_blank" rel="noopener">Docs ↗</a>`:'';
  tip.innerHTML=`<b>${esc(word)}</b>, ${esc(k[0])}${link}`;
  tip.style.display='block';
  tip.style.left=Math.min(x,innerWidth-360)+'px';
  tip.style.top=Math.min(y+14,innerHeight-120)+'px';
}
document.addEventListener('mouseup',e=>{
  if(tip.contains(e.target))return;
  setTimeout(()=>{
    let word='';
    const ed=document.getElementById('ed');
    if(ed&&e.target===ed&&ed.selectionStart!==ed.selectionEnd){
      word=ed.value.slice(ed.selectionStart,ed.selectionEnd).trim();
    }else{
      const sel=window.getSelection();
      word=sel?String(sel.toString()).trim():'';
    }
    if(word&&/^[A-Za-z][A-Za-z0-9-]{1,15}$/.test(word))showTip(word,e.clientX,e.clientY);
    else tip.style.display='none';
  },0);
});

/* ============================== GLOSSARY (domain-ordered) ============================== */
/* Single source of truth for domain vocabulary. Rendered as its own section (renderGlossary)
   AND merged into KW below so selecting a term in any lesson pops its definition. */
const GLOSS_ALL=[
 {domain:'Identity & Access (IAM)',icon:'🛂',groups:[
   {h:'1 · The core distinction',terms:[
     ['Authentication (authn)',`Proving who you are, the login step.`],
     ['Authorization (authz)',`Deciding what you may do, once you are known.`],
     ['Identity',`The account or entity behind a request, a person or a workload.`],
     ['Principal',`The specific "who" a request acts as; in tokens, the sub (subject) claim.`],
     ['Subject',`Same as principal, the entity a token is about (the sub claim).`],
     ['Credential',`The stored binding that ties an authenticator to an identifier, the record saying "this account is proven by this password hash or public key."`],
['Authenticator',`The thing you actually hold and present: a password, a passkey, a security key, a fingerprint. You possess an authenticator; the system stores a credential.`],
['Account',`The concrete record for a person in one particular system. One person routinely has many accounts.`],
['Identifier',`The string naming an account inside a system: a username, email, UUID or employee number.`],
['Identity proofing',`Establishing who a person is in the real world, once, before an account exists. Not authentication.`],
['Enrollment',`Creating the account and assigning its identifier, after proofing.`],
['Credential binding',`Attaching an authenticator to an identifier. The step attackers target, a weak password-reset flow is a binding flaw, not an authentication one.`],
     ['Identity Assurance Level (IAL)',`NIST SP 800-63 scale, 1 to 3, for how rigorously a person's real-world identity was checked at enrollment. IAL1 is the lightest check, IAL3 is in person with a trained operator. It rates proofing, not the login.`],
     ['Authenticator Assurance Level (AAL)',`NIST SP 800-63 scale, 1 to 3, for how strong the login is. AAL1 is a single factor, AAL2 needs two, AAL3 needs a hardware-based, phishing-resistant authenticator. It rates the login, not proofing.`],
     ['Federation Assurance Level (FAL)',`NIST SP 800-63 scale, 1 to 3, for how an assertion is protected between IdP and RP. FAL1 signed, FAL2 signed and encrypted to the RP, FAL3 the user also proves possession of a key bound to the assertion.`],
     ['Identity and Access Management (IAM)',`The discipline and the tooling covering the whole arc: proofing, accounts, authentication, authorization, governance. Workforce IAM is for employees, CIAM is for customers.`],
     ['Workforce IAM',`Identity for employees and contractors: HR-driven joiner, mover, leaver, a directory, SSO into SaaS, and access reviews. Tens of thousands of accounts, all of them known in advance.`],
     ['Customer IAM (CIAM)',`Identity for customers: self-registration, social login, consent, privacy law, and scale in the millions. The same protocols as workforce IAM with the opposite constraints: nobody is known in advance and friction costs revenue.`],
     ['AAA',`Authentication, authorization and accounting: who you are, what you may do, and the record of what happened. Three systems with three failure modes; the third is the one found missing after an incident.`],
   ]},
   {h:'2 · The actors',terms:[
     ['Resource Owner',`The user who owns the data an app wants to reach.`],
     ['Client',`The app requesting access. Called Relying Party in OIDC and Service Provider in SAML.`],
     ['Relying Party (RP)',`OIDC name for the app that relies on the provider to authenticate the user.`],
     ['Service Provider (SP)',`SAML name for the app that consumes assertions from an IdP.`],
     ['Identity Provider (IdP)',`The authority that authenticates users and issues tokens or assertions. Called AS in OAuth, OP in OIDC.`],
     ['Authorization Server (AS)',`OAuth name for the server that issues access tokens.`],
     ['OpenID Provider (OP)',`OIDC name for the identity provider that issues ID tokens.`],
     ['Resource Server (RS)',`The API that accepts and validates access tokens.`],
   ]},
   {h:'3 · Tokens & assertions',terms:[
     ['Transaction Token (Txn-Token)',`A short-lived, signed JWT carrying the identity and immutable context of one request as it passes through the internal call chain. Its aud is a trust DOMAIN rather than a single service, and it is explicitly neither an authentication credential nor an access token. Defined in an IETF draft, obtained via RFC 8693 token exchange.`],
     ['Transaction Token Service (TTS)',`The single logical service in a trust domain permitted to mint transaction tokens. It validates the presented subject token, applies issuance policy, and decides the scope and context claims, which makes it both the control point and a dependency on the path of internal traffic.`],
     ['Subject token',`In a token exchange, the token identifying WHO the work is being done for, usually the user's token, the one you were handed. Distinct from the actor token, which says who is asking.`],
     ['Actor token',`In a token exchange, the token identifying WHO is asking for the new token, the calling service's own credential. Optional, and what turns an anonymous swap into a recorded delegation.`],
     ['kid (key id)',`The key identifier in a JWS/JWT header, naming which key in the JWKS signed this token. Selecting the key by kid is what lets an issuer rotate keys without coordinating with any verifier.`],
     ['Crypto agility',`The ability to change algorithm or key without changing the system, algorithms in a policy list rather than hardcoded, keys selected by kid, rotation as a routine drill. Measured by how long it would take you to stop using an algorithm, not by which one you use today.`],
     ['Post-quantum cryptography (PQC)',`Algorithms designed to resist attack by a quantum computer: NIST's ML-KEM for key establishment, ML-DSA and SLH-DSA for signatures. Confidentiality is the urgent case ("harvest now, decrypt later"); short-lived signatures are far less exposed.`],
     ['ML-KEM',`The NIST-standardized post-quantum key encapsulation mechanism (FIPS 203, formerly Kyber). Used in hybrid TLS key exchange today, because confidentiality is the urgent post-quantum case.`],
     ['ML-DSA',`The NIST-standardized post-quantum signature algorithm (FIPS 204, formerly Dilithium). Relevant first to long-lived signed artifacts, certificates, firmware, credentials valid for years, rather than to five-minute access tokens.`],
     ['SLH-DSA',`A NIST-standardized stateless hash-based signature scheme (FIPS 205, formerly SPHINCS+). Conservative and slow, with large signatures; chosen where a very long security lifetime matters more than size.`],
     ['Access token',`The key an app uses to call an API. Represents authorization, not identity.`],
     ['ID token',`OIDC proof of who the user is, issued to the client. A JWT. Not for calling APIs.`],
     ['Refresh token',`A long-lived token used to obtain new access tokens without a fresh login.`],
     ['Assertion',`SAML signed XML statement about a user, its equivalent of an ID token.`],
     ['JWT',`JSON Web Token, a signed, self-contained token whose claims you can read and verify.`],
     ['Opaque token',`A random reference with no readable content; validated by calling the issuer introspection endpoint.`],
     ['Claim',`A fact in transit, asserted by a specific issuer, worth exactly as much as your trust in that issuer for that kind of fact.`],
['Attribute',`A fact at rest, stored in a directory (department, manager, email). It becomes a claim when an issuer asserts it.`],
['Registered claim',`The standardized envelope claims: iss, sub, aud, exp, iat, nbf, jti. Everything else is issuer-defined.`],
['Attribute release',`The per-app policy deciding which stored attributes are allowed to become claims. Data minimization.`],
['Attribute mapping',`Translating attribute names between systems (sAMAccountName to preferred_username to username). Mismatches are the top cause of federations that log in fine but create broken user records.`],
['Structured token',`A self-contained token carrying its claims inside, verified offline via a signature. Fast, but public and hard to revoke. Contrast with an opaque token.`],
['JWS',`JSON Web Signature, the signed compact form behind a normal JWT: three base64url parts, readable by anyone.`],
['JWE',`JSON Web Encryption, the encrypted five-part compact form, for when the claims must not be readable.`],
['PASETO',`A token format designed to remove the alg negotiation that made JWT footguns possible.`],
['Macaroon',`A token format whose holder can narrow its own permissions before passing it on.`],
['Token introspection',`Asking the issuer what an opaque token means, since it carries no readable claims (RFC 7662).`],
     ['Scope',`A named permission a token grants, such as read invoices.`],
     ['Bearer token',`A token usable by anyone who holds it, like cash. Protect it in transit and at rest.`],
     ['Sender-constrained token',`A token bound to a key only the real client has (mTLS-bound or DPoP), so a stolen copy is useless.`],
     ['JOSE',`JSON Object Signing and Encryption, the IETF family JWT is built from: JWS (signing), JWE (encryption), JWK (keys) and JWA (the algorithm registry).`],
     ['JSON Web Key (JWK)',`A JSON object describing one cryptographic key: its type, use, algorithm, id (kid) and the key material. A JWKS is a set of them, which is what the jwks_uri endpoint serves.`],
     ['RS256',`JWS algorithm: RSA signature (PKCS#1 v1.5) over SHA-256. Asymmetric, so verifiers hold only the public key. The default in most identity providers.`],
     ['ES256',`JWS algorithm: ECDSA on the P-256 curve with SHA-256. Asymmetric like RS256, with much smaller keys and signatures. Preferred for new deployments.`],
     ['HS256',`JWS algorithm: HMAC with SHA-256 over a shared secret. Symmetric: anyone who can verify can also forge. Fine inside one service, wrong for anything an IdP issues to others.`],
     ['Content Encryption Key (CEK)',`In JWE, the per-message symmetric key that encrypts the payload. The CEK is itself encrypted to the recipient (with RSA-OAEP, say) and shipped inside the token.`],
     ['A256GCM',`JWE content-encryption algorithm: AES-256 in GCM mode, authenticated encryption. Pairs with a key-management algorithm such as RSA-OAEP that protects the CEK.`],
     ['RSA-OAEP',`JWE key-management algorithm: RSA with OAEP padding, used to encrypt the CEK to the recipient's public key. Never use the older RSA1_5 padding.`],
     ['SD-JWT',`Selective Disclosure JWT. The issuer signs hashes of the claims; the holder reveals only the claims they choose, with their salts, and the verifier checks them against the hashes. The credential format behind most wallet designs.`],
     ['Security Token Service (STS)',`Any service that issues, validates or exchanges security tokens. RFC 8693 token exchange, a cloud AssumeRole endpoint and a SAML-to-JWT bridge are all STSs.`],
     ['JWT-SVID',`A SPIFFE workload identity expressed as a JWT rather than an X.509 certificate, for hops where mTLS is impossible (through a load balancer that terminates TLS, say). Shorter-lived and bearer, so weaker than the X509-SVID.`],
   ]},
   {h:'4 · Protocols & standards',terms:[
     ['Workload identity federation',`Exchanging a platform-issued identity, a CI job's OIDC token, a Kubernetes service account, a mesh workload's SPIFFE identity, for short-lived credentials somewhere else, so no long-lived key is stored anywhere. The security boundary is the relying platform's trust policy, not the signature.`],
     ['Identity broker (IdP proxy)',`A hub that is a relying party to many upstream identity providers and an identity provider to many downstream applications, turning n x m integrations into n + m. Also the one place cross-cutting policy, claim normalization and audit can live, and a concentrated blast radius.`],
     ['Authorization Server Metadata',`The document at /.well-known/oauth-authorization-server (RFC 8414) or /.well-known/openid-configuration listing an authorization server's endpoints, supported algorithms and jwks_uri. Its issuer value must match, character for character, the issuer it was resolved from.`],
     ['Resource indicator',`The resource parameter (RFC 8707) naming the API a token is intended for, so the authorization server issues a token whose aud covers that API only. Worthless unless each resource server validates aud.`],
     ['OAuth 2.0',`The delegated authorization framework: lets an app act for a user without the user password.`],
     ['OpenID Connect (OIDC)',`An authentication layer on top of OAuth 2.0 that adds the ID token.`],
     ['SAML 2.0',`An XML-based standard for enterprise web single sign-on.`],
     ['SCIM',`A standard for provisioning and syncing user accounts across systems.`],
     ['WebAuthn',`A browser standard for phishing-resistant, origin-bound login (the basis of passkeys).`],
     ['LDAP',`A protocol for querying enterprise directories of users and groups.`],
     ['Kerberos',`A ticket-based enterprise SSO protocol (KDC, TGT, service tickets).`],
     ['FIDO2',`The umbrella standard behind passkeys and security keys: WebAuthn (the browser API) plus CTAP2 (the protocol to the authenticator). Phishing-resistant because the credential is bound to the origin that registered it.`],
     ['CTAP',`Client to Authenticator Protocol, the FIDO spec for how a browser or OS talks to a roaming authenticator over USB, NFC or Bluetooth. CTAP2 is FIDO2; CTAP1 is the older U2F wire format.`],
     ['U2F',`Universal 2nd Factor, FIDO's original security-key standard, second factor only. Superseded by FIDO2 and still supported by it as CTAP1.`],
     ['FAPI',`Financial-grade API, the OpenID Foundation's hardened profile of OAuth and OIDC: PAR, PKCE, sender-constrained tokens (mTLS or DPoP), signed requests and responses. Mandated in most open-banking regimes.`],
     ['Pushed Authorization Request (PAR)',`RFC 9126. The client POSTs the authorization parameters to the AS over the back channel first and redirects the browser with only a short request_uri, so nothing in the request can be read or altered in transit.`],
     ['Rich Authorization Requests (RAR)',`RFC 9396. An authorization_details JSON array instead of flat scope strings, so a grant can say "pay 50 EUR to this account once" rather than "payments".`],
     ['Best Current Practice (BCP)',`An IETF document class for operational guidance rather than protocol. In OAuth, the Security BCP (RFC 9700) and the Browser-Based Apps BCP are the ones to know.`],
     ['Decentralized Identifier (DID)',`A W3C identifier, did:method:id, that resolves to a DID document listing public keys and service endpoints. Controlled by the subject rather than by a registry or IdP.`],
     ['Verifiable Credential (VC)',`A W3C data model: an issuer signs claims about a holder, the holder stores them in a wallet and presents them to a verifier, who checks the signature without contacting the issuer. The three-party model behind digital wallets.`],
     ['BBS signatures',`A signature scheme that lets a holder prove a subset of signed claims without revealing the rest, and without two presentations being linkable. The cryptography behind some verifiable-credential formats.`],
     ['SOAP',`The XML messaging protocol over HTTP that SAML's artifact binding and its older profiles use. A large part of why SAML libraries are heavy.`],
     ['Active Directory (AD)',`Microsoft's directory service: LDAP for lookups, Kerberos for authentication, Group Policy for configuration. The workforce directory in most enterprises, and what Entra ID grew out of.`],
     ['NTLM',`Microsoft's legacy challenge-response authentication from before Kerberos. Still the fallback in Active Directory, relayable and without mutual authentication. Disable it wherever you can.`],
     ['RADIUS',`The protocol network gear uses to ask a central server whether to admit a user: VPNs, Wi-Fi (802.1X) and switches. Old, UDP, shared-secret based, still everywhere at the network edge.`],
     ['SASL',`Simple Authentication and Security Layer, the pluggable framework LDAP, SMTP and IMAP use to negotiate an authentication mechanism (Kerberos via GSSAPI, plain, SCRAM) without each protocol reinventing login.`],
     ['JARM',`JWT Secured Authorization Response Mode. The AS returns the authorization response (code, state) inside a signed JWT, so the client can verify who issued it and that nothing was altered. Part of FAPI.`],
     ['CAEP',`Continuous Access Evaluation Profile, an OpenID Shared Signals profile. The IdP pushes session events (revoked, device out of compliance, risk changed) to relying parties as Security Event Tokens, so access ends before the token expires.`],
     ['RISC',`Risk Incident Sharing and Coordination, the other Shared Signals profile: account-level events such as credential compromise or account disabled, shared between providers so a takeover at one does not spread.`],
     ['Self-sovereign identity (SSI)',`The model where the person holds their own credentials in a wallet and presents them directly, with no IdP in the loop at presentation time. DIDs and verifiable credentials are its building blocks.`],
     ['CBOR',`Concise Binary Object Representation, the binary cousin of JSON. WebAuthn attestation objects and the mDL are CBOR, which is why you cannot read them with a JSON parser.`],
     ['PIV / CAC',`Personal Identity Verification and Common Access Card: the US federal and defense smart cards. A certificate on a chip, PIN-protected, used for both building and system login. High-assurance authentication from before passkeys.`],
     ['Integrated Windows Authentication (IWA)',`The browser silently authenticates to an intranet site with the user's Kerberos ticket (or NTLM as fallback) via the Negotiate scheme. Silent SSO on a domain-joined machine, and a puzzle everywhere else.`],
   ]},
   {h:'5 · Flows / grant types',terms:[
     ['Authorization Code flow',`The main flow for apps acting for a user: get a short code via the browser, then swap it for tokens on the back channel.`],
     ['PKCE',`Proof Key for Code Exchange, protects the code flow for public clients so a stolen code cannot be redeemed.`],
     ['Client Credentials flow',`Machine-to-machine flow with no user: the service authenticates as itself to get a token.`],
     ['Device flow',`For input-limited devices such as TVs and CLIs: the user approves on a phone using a code.`],
     ['Token Exchange',`Swapping one token for another, for example to call a downstream service on behalf of a user.`],
     ['CIBA',`Client-Initiated Backchannel Authentication, the user approves on a separate device, no browser redirect.`],
     ['Implicit flow',`A legacy flow that returned tokens directly in the browser. Deprecated; use code plus PKCE.`],
     ['ROPC',`Resource Owner Password Credentials, the app collects the user password directly. Deprecated.`],
   ]},
   {h:'6 · Endpoints',terms:[
     ['/authorize',`Where a login or consent flow starts (front channel, in the browser).`],
     ['/token',`Where an app exchanges a code or credentials for tokens (back channel).`],
     ['/userinfo',`An OIDC endpoint returning profile claims for the access token user.`],
     ['/introspect',`Where a resource server asks the issuer whether an opaque token is valid (RFC 7662).`],
     ['/revoke',`Where a token is proactively invalidated (RFC 7009).`],
     ['JWKS',`The published set of public keys (jwks_uri) used to verify token signatures.`],
     ['Discovery',`The /.well-known/openid-configuration document listing a provider endpoints and keys.`],
     ['Assertion Consumer Service (ACS)',`The SP's SAML endpoint that receives the POSTed assertion and starts the session. SAML's equivalent of the OAuth redirect URI, and just as important to lock down.`],
   ]},
   {h:'7 · Core concepts',terms:[
     ['Trust domain',`A group of workloads sharing one set of security controls and policies, invoked only through published interfaces. The unit a transaction token is scoped to, and the boundary at which external authorization is exchanged for internal context.`],
     ['Call chain',`Every invocation across every workload caused by one incoming request. The thing a transaction token travels along, and the thing a single forwarded access token would over-authorize.`],
     ['Workload',`A running instance of software executing for a specific purpose, a container, a service, a managed database. The non-human actor in service-to-service authorization.`],
     ['Same-origin policy',`The browser rule that script on one origin (scheme + host + port) cannot read responses from another. It does not stop the request being sent or cookies being attached, which is the gap CSRF lives in.`],
     ['CORS (Cross-Origin Resource Sharing)',`Server opt-in, enforced by browsers, that lets script on another origin READ a response. It governs reading, not sending, and not whether cookies ride along (that is SameSite). Because only browsers enforce it, it is never a substitute for authorization.`],
     ['Preflight request',`The OPTIONS request a browser sends before a cross-origin call that carries an Authorization header, a custom header or an unusual content type, asking the server whether the real request is permitted.`],
     ['SameSite',`The cookie attribute deciding whether a cookie is attached to requests originating from another site: Strict, Lax or None (which requires Secure). The primary structural defense against CSRF.`],
     ['Cross-device flow',`Any flow where the device gaining access is not the device that authenticates: the device grant, QR-code login, CIBA. Convenient where there is no keyboard or browser, and structurally weak because consent is given without context.`],
     ['SSO',`Single Sign-On, a user experience, not a protocol: one login event, many apps. Achievable by a shared session cookie within one domain, or by federation across boundaries.`],
     ['Federation',`A trust architecture: an app stops authenticating users itself and accepts signed statements from an authority it trusts, usually across an organizational boundary. Delivers SSO as a side effect, but is worth doing for one app.`],
['Single Logout (SLO)',`Ending every session created by an SSO login. Unreliable in practice because one login event really created many independent app sessions.`],
     ['Trust',`A relying party accepting tokens or assertions signed by an authority it is configured to rely on.`],
['Trust anchor',`Where the chain of verification stops: a key or certificate accepted as authoritative by configuration rather than by proof. A JWKS you pinned, an IdP certificate in SAML metadata, a root CA in your truststore. Never let a token choose its own anchor.`],
     ['Consent',`The user explicitly approving what an app may access.`],
     ['Delegated authorization',`The core idea of OAuth: you let an app do a limited set of things for you without sharing your password, and you can revoke it. Answers "may this app do this for me?"`],
['Delegated authentication',`Outsourcing the act of verifying a credential. Two very different styles: credential forwarding (LDAP bind, RADIUS, ROPC, your app holds the password) and redirect/federation (the user authenticates at the IdP and your app never sees a credential).`],
['Credential forwarding',`Delegated authentication where the app collects the password and relays it to a backend to check. Puts the app inside the credential blast radius, and cannot support MFA, passkeys or SSO.`],
['LDAP bind',`Verifying a password by attempting to bind to the directory as that user. The classic credential-forwarding pattern.`],
['On-behalf-of (OBO)',`One service calling another for a user, with a token audienced for the next hop that still names the user as subject and records who is acting.`],
['act (actor) claim',`Records the party acting on the subject's behalf, nesting to preserve a whole delegation chain (RFC 8693). Its presence is what makes a token delegation rather than impersonation.`],
['may_act',`A claim naming who is permitted to act for this subject. Must fail closed: an absent may_act never means "anyone may act."`],
['Effective subject',`Whose data is being viewed and whose permissions apply, as distinct from the authenticated subject who actually logged in. Keeping the two separate is what makes support "act as user" auditable.`],
['Policy Decision Point (PDP)',`Where an access decision is computed from identity, resource, action and context.`],
['Policy Enforcement Point (PEP)',`Where the decision is applied, a gateway, sidecar or middleware that intercepts the request and obeys the verdict.`],
['Fail closed',`Deny when you cannot decide: unreachable policy engine, unverifiable signature, unparseable claim. Failing open is what an attacker induces by overloading you.`],
['cnf (confirmation claim)',`Records which key a sender-constrained token is bound to, jkt for a DPoP JWK thumbprint, x5t#S256 for an mTLS certificate. Comparing it to the presented key is what makes the token non-bearer.`],
['DPoP proof',`A short-lived JWT sent alongside the token on every request, carrying htm, htu, iat, jti and ath, signed with the client's private key.`],
['BFF (backend-for-frontend)',`A server-side component owned by the frontend that holds OAuth tokens, so the browser only ever gets an HttpOnly session cookie.`],
['Capability URL',`A URL whose unguessable path or query IS the credential, password resets, share links, presigned downloads.`],
['IDOR / BOLA',`Insecure direct object reference: the role check passes but nobody verified the record belongs to the caller. Top of the OWASP API Security Top 10.`],
['Effective permissions',`The flattened union of everything a person can do across all groups, nested and direct. The number an access review actually needs.`],
['Deny-overrides',`A policy-combining algorithm where any deny wins, so a prohibition cannot be defeated by adding a permit elsewhere. The safe default.`],
['Discoverable credential',`A WebAuthn credential stored on the authenticator itself, so it knows which accounts it holds, what makes usernameless login possible.`],
['User verification (UV)',`The WebAuthn flag meaning the authenticator checked a PIN or biometric locally. Distinct from user presence (UP), which only means someone touched it.`],
['Phishing-resistant MFA',`A method where the authenticator itself checks who is asking, because the origin is part of the cryptographic operation: passkeys, security keys, smart cards.`],
['Number matching',`Requiring the user to type digits shown on the login screen into the push prompt, defeating blind approval and MFA fatigue.`],
['OAuth 2.1',`A consolidation of OAuth 2.0 plus the Security BCP: implicit and password grants removed, PKCE required for all authorization code flows, exact redirect URI matching.`],
['Confused deputy',`Abusing a party trusted by many principals to act against one of them. External ids in role assumption exist to prevent it.`],
['Relation tuple',`Zanzibar's unit of authorization data: subject, relation, object. Permissions are derived by traversal, not stored.`],
['Zookie',`A consistency token returned on write and presented with a later check, meaning "evaluate against a snapshot at least this recent".`],
['New enemy problem',`A stale replica applies a later write without an earlier one, so a removed user sees newly added content. Each write was correct; the order was lost.`],
['CAE',`Continuous Access Evaluation, the issuer pushes an event when access changes, so a long-lived token can be rejected in seconds instead of at expiry.`],
['Security Event Token (SET)',`A JWT whose payload is an event rather than an identity (RFC 8417). Verify it as rigorously as a token, it changes access.`],
['OpenID Federation',`Trust proven on demand by a signed chain of entity statements up to a trust anchor, replacing pairwise registration in large ecosystems.`],
['Entity statement',`A signed statement a federation participant publishes about itself, and that its authority publishes about it. Chains of these are resolved to an anchor.`],
['Metadata policy',`Constraints an authority places on what a subordinate may declare about itself. Composes downward and can only narrow.`],
['OID4VCI / OID4VP',`OpenID protocols for issuing a verifiable credential into a wallet, and for a verifier requesting a presentation from it.`],
['Presentation definition',`A verifier's machine-readable description of what it needs. The wallet chooses which credential satisfies it and which claims to disclose.`],
['mDL',`Mobile driving license (ISO/IEC 18013-5), a CBOR credential format designed to work offline over NFC or Bluetooth.`],
['Non-human identity (NHI)',`Service accounts, workloads, CI runners, bots and agents. They outnumber humans in most estates and inherit none of the joiner-mover-leaver lifecycle.`],
['Agent identity',`An autonomous caller acting for a user: the subject stays the user, the agent is recorded as the acting party, and authority is granted in advance and bounded.`],
     ['Impersonation',`When a service simply acts as the user with no distinction, contrast with delegation.`],
     ['Least privilege',`Granting only the access truly needed, nothing more.`],
     ['MFA',`Multi-factor authentication, requiring two or more independent factors.`],
     ['Step-up authentication',`Asking for stronger proof only when an action is sensitive.`],
     ['Public client',`An app that cannot keep a secret, such as a SPA or mobile app, must use PKCE.`],
     ['Confidential client',`An app that can keep a secret, such as a server, authenticates to the token endpoint.`],
     ['Front channel',`Communication that passes through the user browser (redirects).`],
     ['Back channel',`Direct server-to-server communication the browser never sees.`],
     ['audience (aud)',`The claim naming who a token is for; a resource server must check it.`],
     ['issuer (iss)',`The claim naming who minted a token; verified against the expected authority.`],
     ['nonce',`A one-time value that ties an OIDC ID token to a single login, preventing replay.`],
     ['state',`A random value the client sends on the redirect and re-checks on return, preventing CSRF.`],
     ['Session',`Server- or cookie-tracked state that remembers a logged-in user between requests.`],
     ['TOTP',`Time-based One-Time Password, RFC 6238. A six-digit code computed as HMAC over a shared secret and the current 30-second window. Something you have, but not phishing-resistant: the code can be relayed.`],
     ['HOTP',`HMAC-based One-Time Password, RFC 4226. The same construction as TOTP with a counter instead of the clock. TOTP is HOTP with the counter set to the time step.`],
     ['One-time password (OTP)',`Any code valid for a single use: SMS, email, TOTP, a printed backup code. SMS is the weakest (SIM swap); none of them resist phishing.`],
     ['Passkey',`A FIDO2/WebAuthn credential: a key pair, the private half held by the device or synced through a platform account, the public half registered with the site. Phishing-resistant, no shared secret on the server.`],
     ['User presence (UP)',`The WebAuthn flag set when the authenticator confirmed a human was there: a touch on the key. Weaker than user verification (UV), which confirms who the human is with a PIN or biometric.`],
     ['AAGUID',`Authenticator Attestation GUID, a 128-bit identifier for an authenticator model in a WebAuthn attestation. Shared by every unit of that model, so it names the make, not the device.`],
     ['S256',`The PKCE code_challenge_method: challenge = BASE64URL(SHA-256(code_verifier)). The only method to use; "plain" sends the verifier itself and defeats the purpose.`],
     ['DEFLATE',`The compression SAML applies to an AuthnRequest in the HTTP-Redirect binding so the XML fits in a URL. Decompress before you decode.`],
     ['Time to live (TTL)',`How long a token, cache entry or session stays valid. For a self-contained token it is also the revocation lag: the window between revoking and the token stopping working.`],
     ['B2B / B2C / B2B2C',`Who the accounts belong to: other businesses, consumers, or a business's own customers reached through it. Decides tenancy, who administers accounts, and whether IdP federation or social login is the norm.`],
     ['VPN',`Network-level access to a private network. Under zero trust, being on the VPN is no longer a grant of access; every request still carries an identity and is authorized on its own.`],
     ['Hardware Security Module (HSM)',`A tamper-resistant device that holds keys and performs signing and decryption so the private key never leaves it. Where an IdP's signing keys and a CA's root belong.`],
     ['Key Management Service (KMS)',`A cloud service that stores keys and performs cryptographic operations by API, usually HSM-backed. Your code asks it to sign; it never sees the key.`],
     ['Personally identifiable information (PII)',`Data that identifies a person: name, email, government id, and often a stable subject identifier. What privacy law regulates and what claims should carry as little of as possible.`],
     ['GDPR',`The EU General Data Protection Regulation. Data minimization, a lawful basis for processing, and the right to erasure. Shapes which claims an IdP releases, what a log may keep, and for how long.`],
     ['SOC 2',`An audit report on a service organization's controls for security, availability, confidentiality and privacy. What an auditor is holding when they ask for your access-review evidence.`],
     ['Open Policy Agent (OPA)',`A general-purpose policy engine with the Rego language, commonly deployed as a PDP beside the service it protects. The engine is generic; the policy and the data are yours.`],
     ['Home realm discovery (HRD)',`Working out which IdP a user belongs to before redirecting them, usually from the email domain. The step that turns "sign in" into "sign in with your company".`],
     ['Machine-to-machine (M2M)',`A synonym for service-to-service: no user in the loop, the client-credentials grant or a workload identity.`],
     ['SIEM',`Security Information and Event Management, the system that collects logs from everything and correlates them. Where authentication and authorization events must land to be useful in an investigation.`],
     ['ITDR',`Identity Threat Detection and Response: monitoring identity systems themselves for compromise, such as impossible travel, token replay and privilege changes, and acting on it. SIEM narrowed to identity.`],
     ['Web Application Firewall (WAF)',`A filter in front of a web application that blocks known-bad requests. Defense in depth for injection and abuse, no substitute for authorization in the application.`],
     ['HIPAA',`The US health-privacy law. For identity it means access controls, audit logs of who saw which record, and minimum-necessary access.`],
     ['CCPA',`The California Consumer Privacy Act: the right to know what data is held, to delete it, and to opt out of sale. The US counterpart to GDPR for consumer identity systems.`],
   ]},
   {h:'8 · Threats & defenses',terms:[
     ['Certificate pinning',`Requiring a presented chain to contain a specific pre-configured public key rather than accepting any certificate from any trusted CA. Pin the SubjectPublicKeyInfo hash, prefer an intermediate over the leaf, always hold a backup pin, a failed pin denies service in a way no server-side change can fix.`],
     ['Subject collision',`Two upstream identity providers issuing the same subject identifier for different people. Only the (issuer, subject) pair is unique, so a broker or application keying on the raw subject alone will eventually merge two unrelated accounts.`],
     ['IdP mix-up',`An attack in which a client is induced to use one identity provider's endpoints while believing it is talking to another, typically by supplying attacker-controlled metadata. Defended by exact issuer comparison and the iss response parameter (RFC 9207).`],
     ['Algorithm confusion',`Forging a token by changing its alg, most classically re-signing an RS256 token as HS256 using the issuer's public key as the HMAC secret. Defended by validating alg against your own policy list rather than dispatching on the header.`],
     ['Consent phishing (illicit grant)',`Obtaining access by persuading a user to approve a genuine consent screen for an attacker's request, rather than by stealing a credential. Nothing is spoofed, MFA is satisfied legitimately, and phishing-resistant authentication does not prevent it.`],
     ['SSRF',`Server-Side Request Forgery: making a server issue HTTP requests of the attacker's choosing. In identity systems it is a common route to internal metadata endpoints and to tokens the server holds.`],
     ['Device-code phishing',`Cross-device consent phishing: the attacker starts a device-grant flow and sends the resulting user_code to the victim, who authenticates at the real provider and approves the attacker's session.`],
     ['CSRF',`Cross-Site Request Forgery, a malicious page makes your browser send an unintended authenticated request. Defended with the state parameter and anti-CSRF tokens.`],
     ['Replay attack',`Re-sending a captured token or message to impersonate someone. Defended with short expiries, nonces, and sender-constrained tokens.`],
     ['Token theft',`Stealing a bearer token to reuse it. Defended with short lifetimes, secure storage, and proof-of-possession.`],
     ['Phishing-resistant authentication',`Login methods that cannot be phished because the secret never leaves the device and is bound to the real site origin (passkeys and WebAuthn).`],
     ['Open redirect',`A flaw where an app forwards users to an attacker URL; abused to steal codes or tokens.`],
     ['SIM swap',`The attacker convinces a carrier to move the victim's phone number to a SIM they control, then receives the SMS codes. The reason SMS is the weakest second factor.`],
     ['CAPTCHA',`A challenge meant to tell humans from bots. Rate control and abuse friction, not authentication: it proves nothing about who is there.`],
     ['MD5 / RC4',`Broken algorithms still met in legacy identity: MD5 hashes, RC4 in old Kerberos encryption types. Recognize them, then disable them.`],
     ['Account takeover (ATO)',`An attacker gaining control of a legitimate account: phished password, SIM swap, session theft, or a weak recovery flow. The outcome most identity controls exist to prevent.`],
     ['XML Signature Wrapping (XSW)',`A SAML attack: the attacker moves the signed assertion elsewhere in the document and inserts an unsigned one where the SP looks. The signature still verifies; the SP reads the forgery. Fixed by validating only the signed element.`],
     ['Resource-based constrained delegation (RBCD)',`Kerberos delegation configured on the target service rather than on the delegating account. Also the mechanism behind a family of Active Directory privilege-escalation attacks when write access to a computer object is loose.`],
     ['LAPS',`Local Administrator Password Solution: Windows rotates every machine's local admin password and stores it in AD. Closes the shared-local-admin-password problem that let one compromised machine open all of them.`],
     ['PBKDF2',`Password-Based Key Derivation Function 2: a deliberately slow hash for passwords that runs HMAC hundreds of thousands of times. In the JDK without a library, which is why the course uses it; Argon2id is the first choice when you can add one.`],
   ]},
   {h:'9 · Governance & lifecycle',terms:[
     ['Provisioning',`Creating and configuring user accounts and their access, often automated via SCIM.`],
     ['Deprovisioning',`Removing access when someone leaves or changes roles.`],
     ['JML',`Joiner, Mover, Leaver, the employee identity lifecycle.`],
     ['JIT provisioning',`Just-in-time, creating the account automatically on first successful login.`],
     ['RBAC',`Role-Based Access Control, permissions granted through roles.`],
     ['ABAC',`Attribute-Based Access Control, decisions from attributes and policy rules.`],
     ['IGA',`Identity Governance and Administration, access requests, reviews, and certification.`],
     ['PAM',`Privileged Access Management, securing and monitoring high-power accounts.`],
     ['Access review',`A periodic, recorded check that each account's entitlements are still justified, signed off by a manager or owner. The evidence auditors ask for first.`],
   ]},
   {h:'10 · Enterprise directory & Kerberos',terms:[
     ['Key Distribution Center (KDC)',`The Kerberos server holding every principal's key. Two halves: the Authentication Service, which issues TGTs, and the Ticket Granting Service, which issues service tickets. In Active Directory every domain controller is a KDC.`],
     ['Ticket Granting Ticket (TGT)',`What the KDC issues after the user proves the password once. It is presented to the TGS to get service tickets, so the password is not used again for the ticket's lifetime, typically ten hours.`],
     ['Ticket Granting Service (TGS)',`The half of the KDC that trades a valid TGT for a ticket to a specific service. The client never sends a password to the service; the ticket carries the proof.`],
     ['Service Principal Name (SPN)',`The Kerberos name a service is registered under, such as HTTP/app.corp.example. It is what the client asks the TGS for a ticket to, so a missing or duplicate SPN is the classic Kerberos failure.`],
     ['Privilege Attribute Certificate (PAC)',`The block inside a Windows Kerberos ticket carrying the user's SID and group SIDs. How Active Directory conveys authorization data along with the authentication.`],
     ['Security Identifier (SID)',`The immutable identifier for a user, group or computer in Windows and Active Directory. Permissions are stored against SIDs, not names, which is why a renamed account keeps its access.`],
     ['Group Policy Object (GPO)',`Active Directory's mechanism for pushing configuration to machines and users by organizational unit: password policy, lockout, what may run.`],
   ]},
 ]},
 {domain:'Service-to-Service & Zero Trust',icon:'🔗',groups:[
   {h:'Machine identity',terms:[
     ['Service-to-service (S2S)',`A call where both ends are software and no user is present, or the user is represented only by a forwarded token. The client-credentials grant, mTLS and SPIFFE are the tools; the confused deputy is the risk.`],
     ['SPIFFE',`A standard for giving workloads verifiable identities (SPIFFE IDs).`],
     ['SPIRE',`The reference implementation that attests workloads and issues SVIDs.`],
     ['SVID',`SPIFFE Verifiable Identity Document, the X.509 cert or JWT a workload uses to prove who it is.`],
     ['mTLS',`Mutual TLS, both client and server present certificates, so each proves its identity.`],
     ['Workload identity',`A non-human identity for a service or job, used instead of shared secrets.`],
     ['Attestation',`Proving what a workload is, from node or process properties, before issuing it an identity.`],
     ['Zero trust',`Never trust by network location; verify identity and authorize every request.`],
     ['IRSA',`IAM Roles for Service Accounts: an EKS pod's Kubernetes service-account token is exchanged, through OIDC federation, for short-lived AWS credentials. Workload identity federation, AWS flavor.`],
   ]},
 ]},
 {domain:'PKI & Certificates',icon:'📜',groups:[
   {h:'Public key infrastructure',terms:[
     ['X.509',`The standard format for a public-key certificate binding a key to an identity.`],
     ['Certificate Authority (CA)',`A trusted issuer that signs certificates.`],
     ['Chain of trust',`A certificate is trusted because it chains up to a root CA you already trust.`],
     ['CSR',`Certificate Signing Request, what you send a CA to get a certificate issued.`],
     ['CRL',`Certificate Revocation List, a published list of revoked certificates.`],
     ['OCSP',`Online Certificate Status Protocol, checks a single certificate revocation status in real time.`],
     ['ACME',`The protocol behind automated certificate issuance, such as Let us Encrypt.`],
     ['Public Key Infrastructure (PKI)',`The certificate authorities, certificates, revocation and policy that let a public key be trusted as belonging to a name. The trust machinery under TLS, mTLS, code signing and smart cards.`],
     ['Subject Alternative Name (SAN)',`The X.509 extension listing the DNS names, IP addresses, emails or URIs a certificate is valid for. Browsers ignore the Common Name; the SAN is what gets checked.`],
     ['PKCS',`Public-Key Cryptography Standards. The ones you will meet: PKCS#1 (RSA), PKCS#8 (private key format), PKCS#10 (the CSR), PKCS#12 (a key and certificate bundle, .p12 or .pfx).`],
     ['PEM / DER',`The two encodings of certificates and keys. DER is binary ASN.1; PEM is DER in base64 between BEGIN and END lines. Same content, and most tools accept both.`],
     ['SHA-256',`The hash function used throughout modern identity: PKCE S256, RS256 and ES256 signatures, certificate fingerprints, DPoP thumbprints.`],
     ['Extended Key Usage (EKU)',`The X.509 extension saying what a certificate may be used for: server auth, client auth, code signing, email. A cert without the right EKU is rejected even when the chain is valid.`],
     ['SNI',`Server Name Indication: the hostname the client sends in the TLS ClientHello so a server holding many certificates can pick the right one. Sent in the clear unless Encrypted ClientHello is in use.`],
   ]},
 ]},
 {domain:'Java & the JVM',icon:'☕',groups:[
   {h:'Language & objects',terms:[
     ['Class',`A blueprint that bundles state (fields) and behavior (methods).`],
     ['Object',`A specific instance of a class, living on the heap.`],
     ['Interface',`A contract of methods a class promises to implement; basis of polymorphism.`],
     ['Abstract class',`A partial class that cannot be instantiated and is meant to be extended.`],
     ['Generics',`Type parameters that let one class or method work over many types safely.`],
     ['Enum',`A fixed set of named constant instances.`],
     ['Record',`A concise, immutable data carrier that auto-generates constructor, accessors, equals and hashCode.`],
     ['Autoboxing',`Automatic conversion between a primitive (int) and its wrapper object (Integer).`],
     ['Immutability',`An object whose state cannot change after construction; inherently thread-safe.`],
     ['Lambda',`A short anonymous function you can pass as a value.`],
     ['Functional interface',`An interface with one abstract method, the target type of a lambda.`],
     ['Stream',`A lazy pipeline of operations (filter, map, reduce) over a data source.`],
     ['Optional',`A container that may or may not hold a value; an explicit alternative to null.`],
     ['Checked exception',`An error the compiler forces you to handle or declare.`],
     ['Unchecked exception',`A RuntimeException the compiler does not force you to handle.`],
     ['Data transfer object (DTO)',`A plain class whose only job is to carry data across a boundary: into or out of an API, between layers. No behavior, no database identity. Keeps your domain model off the wire.`],
     ['Dependency injection (DI)',`Handing an object the things it depends on (from outside, usually via the constructor) instead of letting it construct them. What makes a class testable in isolation, and what Spring's container does for you.`],
     ['Aspect-oriented programming (AOP)',`Attaching behavior such as logging, transactions or security to many methods at once, from outside those methods, by wrapping them in a proxy. How @Transactional works without you writing begin and commit.`],
     ['Java Platform Module System (JPMS)',`Java 9's module system: a module-info.java declares which packages a module exports and which modules it requires, so the compiler and runtime enforce the boundaries. Used heavily inside the JDK, less so by applications.`],
     ['REPL',`Read, evaluate, print, loop: an interactive prompt that runs one line of code at a time and shows the result. Java's is jshell.`],
     ['XOR',`Exclusive or: true when exactly one input is true. As a bit operation, a ^ b flips the bits where the two differ, and a ^ b ^ b gets a back, which is why it shows up in checksums, swaps and puzzles.`],
   ]},
   {h:'The JVM',terms:[
     ['JVM',`The Java Virtual Machine that executes bytecode on any platform.`],
     ['Bytecode',`The portable instruction set javac compiles your source into.`],
     ['JIT',`Just-In-Time compilation of hot bytecode into native machine code for speed.`],
     ['JDK',`The Java Development Kit: compiler and tools plus the runtime.`],
     ['JRE',`The Java Runtime Environment: just what is needed to run, not compile.`],
     ['Heap',`The shared memory region where all objects and arrays live; managed by the garbage collector.`],
     ['Stack',`Per-thread memory of call frames holding locals and references; automatic, no GC.`],
     ['Metaspace',`Memory holding class metadata and method bytecode.`],
     ['Garbage collection',`Automatic reclaiming of heap objects nothing references anymore.`],
     ['Garbage collection (GC)',`The JVM finding objects nothing can reach any more and freeing their memory, automatically. You never call free; you pay instead in pauses, which is why GC choice and heap sizing matter.`],
     ['Java Flight Recorder (JFR)',`The JVM's built-in, low-overhead profiler. Records what the application was doing (allocations, locks, GC, methods) into a file you open in JDK Mission Control. Safe to leave on in production.`],
     ['Java Microbenchmark Harness (JMH)',`The standard tool for timing small pieces of Java code. It warms up the JIT and repeats runs so the number means something; a hand-written loop with System.nanoTime measures the wrong thing.`],
     ['Mapped Diagnostic Context (MDC)',`A per-thread map your logging framework prints on every line: request id, user, tenant. Set it at the start of a request and every log line from that request carries the ids without you passing them around.`],
   ]},
 ]},
 {domain:'Data Structures & Algorithms',icon:'🧠',groups:[
   {h:'Structures',terms:[
     ['Array',`A fixed-size, index-addressable block of elements; O(1) access.`],
     ['Linked list',`Nodes chained by pointers; O(1) insert/remove at a known node, O(n) search.`],
     ['Stack',`A last-in first-out (LIFO) collection.`],
     ['Queue',`A first-in first-out (FIFO) collection.`],
     ['Deque',`A double-ended queue supporting push/pop at both ends.`],
     ['Hash table',`Key-value store with O(1) average lookup via a hash function.`],
     ['Tree',`Hierarchical nodes with parent-child links and no cycles.`],
     ['Binary search tree',`A tree keeping left smaller and right larger for O(log n) search when balanced.`],
     ['Heap',`A tree with a parent-child order giving O(1) min/max peek; powers priority queues.`],
     ['Trie',`A prefix tree with one node per character; lookup is O(key length).`],
     ['B-tree',`A wide, shallow tree that minimizes disk reads; the basis of database indexes.`],
     ['Graph',`Nodes connected by edges, possibly with cycles and weights.`],
     ['Binary search tree (BST)',`A tree where every node's left subtree holds smaller keys and its right subtree larger ones, so lookups halve the search each step. Balanced, that is logarithmic; unbalanced, it degrades to a list.`],
     ['Least recently used (LRU)',`A cache eviction rule: when full, throw out the entry that has gone longest without being read. In Java, a LinkedHashMap in access order with removeEldestEntry does it in a few lines.`],
   ]},
   {h:'Algorithms & analysis',terms:[
     ['BFS',`Breadth-first search: explore level by level with a queue; shortest path in unweighted graphs.`],
     ['DFS',`Depth-first search: go deep with a stack or recursion; cycles, paths, topological sort.`],
     ['Dijkstra',`Shortest path in a weighted graph using a priority queue; the SPF in OSPF routing.`],
     ['Topological sort',`Ordering a DAG so every edge points forward; task and build scheduling.`],
     ['Recursion',`A method that calls itself on a smaller subproblem until a base case.`],
     ['Big-O',`Upper bound on how work grows with input size; the worst-case promise.`],
     ['Theta',`A tight bound where the upper and lower bounds agree.`],
     ['Omega',`A lower bound on how work grows.`],
     ['Time complexity',`How runtime scales with input size, ignoring constants.`],
     ['Space complexity',`How extra memory scales with input size.`],
   ]},
 ]},
 {domain:'Web & HTTP',icon:'🌐',groups:[
   {h:'The protocol',terms:[
     ['HTTP',`The request/response protocol of the web; stateless by design.`],
     ['HTTPS',`HTTP encrypted with TLS.`],
     ['Method',`The verb of a request: GET, POST, PUT, PATCH, DELETE.`],
     ['Status code',`A three-digit result: 2xx success, 3xx redirect, 4xx client error, 5xx server error.`],
     ['Header',`A key-value line carrying metadata on a request or response.`],
     ['Idempotency',`An operation that has the same effect whether done once or many times (safe to retry).`],
     ['Statelessness',`Each request stands alone; the server keeps no per-request memory of the client.`],
     ['CORS',`Cross-Origin Resource Sharing: server opt-in, enforced by browsers, that lets script on another origin read a response. It governs reading the response, not sending the request, and it is not authorization, because only browsers enforce it.`],
     ['UDP',`User Datagram Protocol: send a packet, no connection, no delivery guarantee, no ordering. Faster than TCP because it promises less; right for DNS, video and games, wrong for anything that must arrive.`],
     ['JSX',`The HTML-looking syntax inside React components. Not HTML: a compiler turns each tag into a JavaScript function call that builds the element.`],
   ]},
   {h:'API design',terms:[
     ['REST',`An architectural style using HTTP verbs on resource URLs.`],
     ['MVC',`Model-View-Controller: separates data, presentation, and request handling.`],
     ['Pagination',`Returning a large collection in pages instead of all at once.`],
     ['Offset pagination',`Page by position (page and size); simple but drifts and slows at depth.`],
     ['Cursor pagination',`Page by an opaque pointer; stable and fast for large, changing data.`],
     ['Content negotiation',`Choosing a response format based on the Accept header.`],
     ['API versioning',`Evolving an API without breaking clients (URI, header, or media-type).`],
     ['Rate limiting',`Capping how many requests a client may make in a window.`],
   ]},
 ]},
 {domain:'Databases & SQL',icon:'🗄️',groups:[
   {h:'Model',terms:[
     ['Table',`A named set of rows and columns.`],
     ['Primary key',`A column (or set) uniquely identifying each row.`],
     ['Foreign key',`A column referencing a primary key in another table, enforcing relationships.`],
     ['Index',`A structure that speeds lookups at the cost of extra writes and space.`],
     ['Constraint',`A rule the data must satisfy (NOT NULL, UNIQUE, CHECK).`],
     ['Normalization',`Organizing tables to remove redundancy.`],
     ['Transaction',`A group of statements that commit all-or-nothing.`],
     ['ACID',`Atomicity, Consistency, Isolation, Durability: the guarantees of a transaction.`],
     ['Foreign key (FK)',`A column whose values must match a primary key in another table. The database refuses an order that points at a customer who doesn't exist.`],
     ['Java Persistence API (JPA)',`The Java standard for mapping objects to database tables: annotate a class, and the provider (Hibernate, usually) writes the SQL. Spring Data JPA sits on top and generates repositories from method names.`],
     ['H2',`A small database written in Java that can run in memory inside your test process. The usual choice for fast tests; not what you deploy.`],
   ]},
   {h:'Querying',terms:[
     ['JOIN',`Combining rows from two tables on a matching condition.`],
     ['DDL',`Data Definition Language: CREATE, ALTER, DROP, TRUNCATE.`],
     ['DML',`Data Manipulation Language: SELECT, INSERT, UPDATE, DELETE.`],
     ['TCL',`Transaction Control Language: BEGIN, COMMIT, ROLLBACK.`],
     ['DCL',`Data Control Language: GRANT, REVOKE.`],
     ['Aggregate',`A function that collapses rows into one value: COUNT, SUM, AVG.`],
     ['Subquery',`A query nested inside another.`],
     ['CTE',`A named temporary result (WITH ...) used like a table.`],
     ['Window function',`A calculation across a set of rows without collapsing them.`],
     ['N+1 problem',`Firing one query per row instead of one query for all; a common performance bug.`],
     ['Connection pool',`A reused set of database connections to avoid per-request setup cost.`],
     ['EXPLAIN / EXPLAIN ANALYZE',`Ask the database how it plans to run a query (EXPLAIN), or run it and report what it did and how long each step took (EXPLAIN ANALYZE). The first thing to read when a query is slow.`],
   ]},
 ]},
 {domain:'Concurrency',icon:'🧵',groups:[
   {h:'Core ideas',terms:[
     ['Process',`An isolated program with its own private memory.`],
     ['Thread',`A single path of execution within a process; threads share the heap.`],
     ['Concurrency',`Managing many tasks in overlapping time (not necessarily at once).`],
     ['Parallelism',`Actually running tasks at the same instant on multiple cores.`],
     ['Context switch',`The OS swapping one thread off a core for another.`],
     ['Race condition',`A bug where the result depends on unpredictable thread timing.`],
     ['Deadlock',`Two threads each waiting forever for a lock the other holds.`],
     ['Mutex',`A mutual-exclusion lock so only one thread enters a critical section.`],
     ['Atomic',`An operation that completes indivisibly, without interleaving.`],
     ['Volatile',`A field whose reads/writes always go to main memory (visibility across threads).`],
   ]},
   {h:'Tools',terms:[
     ['Thread pool',`A reused set of worker threads that run submitted tasks.`],
     ['Executor',`The Java service that manages a thread pool and runs tasks.`],
     ['Future',`A handle to a result that will be available later.`],
     ['CompletableFuture',`A composable future for building async pipelines.`],
     ['Semaphore',`A counter that limits how many threads use a resource at once.`],
     ['Virtual thread',`A lightweight JVM thread (Java 21) making blocking code scale cheaply.`],
   ]},
 ]},
 {domain:'DevOps & Delivery',icon:'🚀',groups:[
   {h:'Reading production: the command line',terms:[
     ['stdin / stdout / stderr',`The three streams every filter has: input, results, and a separate channel for diagnostics, separate so that warnings never contaminate the data flowing down a pipe.`],
     ['Pipeline',`Two or more filters joined by |, running concurrently, with one program's stdout feeding the next one's stdin. Data streams through as it is produced, so file size stops being a memory limit.`],
     ['Exit code',`The status a program returns: 0 for success, non-zero for failure. grep returns 1 for "ran fine, matched nothing", which is why an empty result aborts a script running under set -e.`],
     ['SIGPIPE',`The signal delivered to a process that writes to a pipe whose reader has closed. It is why "grep pattern huge.log | head -5" returns instantly instead of reading the whole file.`],
     ['pipefail',`The shell option (set -o pipefail) that makes a pipeline fail if any stage failed. Without it a pipeline reports only its last command's status, so a broken first stage exits 0 and produces nothing.`],
     ['Greedy matching',`The default behavior of .*, match as much as possible. It is why s/.*=// deletes through the LAST delimiter on the line; the POSIX fix is a negated class such as [^=]*=.`],
     ['Associative array',`awk's string-keyed hash map. It turns group-by into one pass with memory proportional to the number of distinct keys, which is what makes awk, rather than grep or sed, the tool that aggregates.`],
     ['Percentile (p99)',`The value below which that share of observations fall. A mean describes the typical request and hides the tail; a p99 that moves tenfold while the median holds steady is the signature of a slow dependency on a small fraction of calls.`],
     ['Nearest rank',`The simplest percentile definition: sort the values and take position ceil(p x n). Requires a numeric sort, a text sort ranks "99" above "1075" and quietly returns the wrong tail.`]
   ]},
   {h:'Pipeline & packaging',terms:[
     ['CI',`Continuous Integration: automatically build and test every change.`],
     ['CD',`Continuous Delivery/Deployment: automatically ship changes to environments.`],
     ['Pipeline',`The automated sequence of build, test, and deploy steps.`],
     ['Artifact',`A built output (jar, image) produced by the pipeline.`],
     ['Container',`A lightweight, isolated package of an app and its dependencies.`],
     ['Image',`The immutable template a container is started from.`],
     ['Kubernetes',`A system that schedules and runs containers across many machines.`],
     ['Pod',`The smallest deployable unit in Kubernetes: one or more containers.`],
     ['Helm',`A package manager for Kubernetes applications.`],
     ['IaC',`Infrastructure as Code: provisioning servers from version-controlled files.`],
     ['Project Object Model (POM)',`Maven's pom.xml: the file that names your project, its dependencies and its build plugins. Gradle's equivalent is build.gradle.`],
   ]},
   {h:'Release & operate',terms:[
     ['Blue-green',`Two identical environments; switch traffic to the new one instantly.`],
     ['Canary',`Releasing to a small slice of users first to limit blast radius.`],
     ['Rollback',`Reverting to a previous known-good version.`],
     ['Observability',`Understanding a system from its logs, metrics, and traces.`],
   ]},
 ]},
 {domain:'Architecture & Distributed Systems',icon:'🏛️',groups:[
   {h:'Concepts',terms:[
     ['Latency',`How long one operation takes.`],
     ['Throughput',`How many operations complete per unit time.`],
     ['Scalability',`The ability to handle more load by adding resources.`],
     ['Horizontal scaling',`Adding more machines; vertical scaling adds power to one machine.`],
     ['Load balancer',`Distributes incoming requests across many servers.`],
     ['Cache',`A fast store of recent results to avoid recomputing or refetching.`],
     ['CAP theorem',`Under a partition, a distributed store trades consistency against availability.`],
     ['Eventual consistency',`Replicas converge to the same value given enough time.`],
   ]},
   {h:'Resilience',terms:[
     ['Retry with backoff',`Re-attempting a failed call after growing delays.`],
     ['Circuit breaker',`Stops calling a failing dependency to let it recover.`],
     ['Timeout',`A cap on how long to wait before giving up on a call.`],
     ['Idempotency key',`A client token that makes a retried write apply only once.`],
     ['Message queue',`A buffer that decouples producers from consumers.`],
     ['Sharding',`Splitting data across nodes by a partition key.`],
     ['Replication',`Keeping copies of data on multiple nodes for durability and reads.`],
     ['SLO',`A Service Level Objective: a target for reliability or latency.`],
   ]},
 ]},
 {domain:'JavaScript & Node',icon:'\u{1F7E8}',groups:[
   {h:'1 \u00b7 Values and types',terms:[
     ['Primitive',`One of the seven immutable single values: number, string, boolean, undefined, null, bigint, symbol. Everything else is an object.`],
     ['Coercion',`Automatic conversion between types. + concatenates if either side is a string; every other arithmetic operator converts to number.`],
     ['Truthy / falsy',`Exactly eight values are falsy: false, 0, -0, 0n, "", null, undefined and NaN. Everything else, including "0", [] and {}, is truthy.`],
     ['NaN',`"Not a number", the failure value of a numeric operation. The only value not equal to itself; test with Number.isNaN.`],
     ['Nullish coalescing (??)',`Falls back only on null and undefined, unlike || which falls back on any falsy value including 0 and "".`],
     ['Optional chaining (?.)',`Short-circuits to undefined instead of throwing when a link in a property path is null or undefined.`]]},
   {h:'2 \u00b7 Scope and functions',terms:[
     ['Hoisting',`Declarations are processed before the code runs. var yields undefined; let and const throw until initialized.`],
     ['Temporal dead zone',`The region between a let/const declaration being hoisted and initialized, where reading it is a ReferenceError.`],
     ['Lexical scope',`A name resolves according to where the function is WRITTEN, not where it is called. The opposite of how this is decided.`],
     ['Closure',`A function together with the scope it was created in. It captures the binding, not a copy of the value.`],
     ['this',`Decided at call time by how the function was called: new, explicit binding, the object left of the dot, or nothing. Arrows have none of their own.`],
     ['Pure function',`Same input gives same output, and it touches nothing outside itself. Needs no mocks to test.`]]},
   {h:'3 \u00b7 Objects and prototypes',terms:[
     ['Prototype chain',`Property lookup follows a hidden link from object to object until it reaches null. Reading searches upward; writing always lands on the object itself.`],
     ['Structural typing',`If the shape fits, it fits, nothing declares that it implements an interface. How TypeScript compares types.`],
     ['Shallow copy',`Spread and Object.assign copy only top-level properties; nested objects remain shared references. structuredClone copies deeply.`],
     ['Prototype pollution',`Merging untrusted data can set __proto__ and thereby add a property to every object in the program. Use Object.create(null) or a Map for untrusted keys.`],
     ['Iterable protocol',`An object with a [Symbol.iterator] method works with for...of, spread and destructuring.`]]},
   {h:'4 \u00b7 The browser',terms:[
     ['DOM',`The Document Object Model \u2014 the live tree of objects the browser builds from your HTML. JavaScript changes the page by changing this tree; the HTML text itself is never edited.`],
     ['Event',`A signal that something happened \u2014 a click, a keypress, a submitted form. Code subscribes with addEventListener and receives an event object describing exactly what occurred.`],
     ['Bubbling',`After an event fires on its target it travels up through the ancestors, giving each one a chance to handle it. Why a listener on a list can hear clicks on its items.`],
     ['Delegation',`One listener on a parent handling events for all its children, using bubbling plus event.target to learn where it started. Survives children being added and removed.`],
     ['fetch',`The browser\u2019s HTTP function: fetch(url) returns a promise of a response. It rejects only on network failure \u2014 a 404 or 500 still resolves, so check res.ok yourself.`],
     ['CORS',`Cross-Origin Resource Sharing: the browser blocks reading responses from another origin unless that server explicitly allows your page. Fixed on the server, never in your code.`],
     ['FormData',`Reads a whole form\u2019s fields into key\u2013value pairs in one line: new FormData(formElement). Pairs with the submit event for JavaScript-handled forms.`],
     ['XSS',`Cross-site scripting: user text ending up executed as markup or script, e.g. via innerHTML. Cured by keeping data out of executable channels \u2014 textContent for text, always.`]]},
   {h:'5 \u00b7 Asynchrony',terms:[
     ['Event loop',`When the call stack is empty, take the next callback from a queue and run it. The host does the waiting; nothing in your code runs in parallel.`],
     ['Microtask',`A promise callback. The entire microtask queue drains after each macrotask, so promises always run before the next timer.`],
     ['Macrotask',`A timer or I/O callback. setTimeout(fn, 0) is a minimum delay, not an immediate call.`],
     ['Unhandled rejection',`A rejected promise nobody awaited or caught. Since Node 15 it terminates the process.`],
     ['Backpressure',`A slow writer signalling a fast reader to pause, so unwritten data does not pile up in memory. pipeline handles it for you.`],
     ['Event loop lag',`The gap between when a timer should have fired and when it did. The single most useful health metric a Node service can emit.`]]},
   {h:'6 \u00b7 Modules, tooling and types',terms:[
     ['ESM',`ES modules: import/export, statically resolved before execution, which is what makes tree-shaking possible.`],
     ['CommonJS',`Node\u2019s original module system: require/module.exports, resolved dynamically at the moment of the call.`],
     ['Tree-shaking',`Dropping unused exports from a bundle. Only possible because ESM\u2019s dependency graph is known without running the code.`],
     ['Semver',`MAJOR.MINOR.PATCH. ^ allows minor and patch but never crosses a major, except below 1.0, where it treats the minor as breaking.`],
     ['Lockfile',`Records the exact version of every package in the tree. npm ci installs from it; npm install rewrites it.`],
     ['Type erasure',`TypeScript annotations are removed before the code runs, so there are no runtime type checks and every boundary still needs validation.`],
     ['Source map',`A file mapping bundled, minified positions back to your original source, so a stack trace names real files and variables.`]]},
   {h:'7 \u00b7 Memory, time and the runtime',terms:[
     ['Generator',`A function* that can pause at yield and resume later, keeping all its local state. Produces values lazily \u2014 you only pay for what the consumer takes.`],
     ['EventEmitter',`Node\u2019s many-occurrences pattern: on() subscribes, emit() calls every listener synchronously in order. An "error" event with no listener crashes the process.`],
     ['Worker',`A separate thread with its own event loop, talking to yours only by message passing. For CPU-bound work; I/O never needs one.`],
     ['Structured clone',`The deep-copy algorithm behind postMessage and structuredClone: carries objects, arrays, Map, Set and Date, survives cycles, refuses functions and DOM nodes.`],
     ['Garbage collection',`The engine frees any object that can no longer be reached from a root (globals, the stack, live closures). There is no free() \u2014 only references to sever.`],
     ['Reachability',`The collector\u2019s one rule: alive means findable by following references from the roots. A cycle nothing points at is still garbage.`],
     ['Memory leak',`In JavaScript, always an unintended reference: a module-level Map that only grows, a cache with no eviction, a listener never removed.`],
     ['WeakMap',`A map whose keys are held weakly: a key reachable only through the WeakMap can still be collected, and its entry evaporates with it. Metadata that cannot cause a leak.`],
     ['Immutability',`Treating data as read-only and making changed copies instead: spread for objects, toSorted over sort. Turns a class of far-away bugs impossible.`],
     ['Intl',`The built-in, localised formatting library for dates, numbers, currencies and relative time. Reach for it before hand-rolling any "format this nicely" function.`],
     ['UTC',`The shared zero-offset timeline every timezone is defined against. Store and transmit UTC instants; convert to local time only when formatting for a human.`],
     ['ISO 8601',`The unambiguous date-time text format: 2026-03-03T10:00:00Z. The trailing Z means UTC. The only string form a Date should ever be built from.`]]}]}
];

/* Per-course glossary. A course sets DOJO_GLOSS_DOMAINS in its config to name the
   domains it actually teaches; without it, every domain is shown (DevDojo's case).
   This is why IdentityDojo does not list Java collections and JSDojo does not list
   Kerberos, one shared vocabulary file, filtered per course. */
const GLOSS=(typeof DOJO_GLOSS_DOMAINS!=="undefined"&&Array.isArray(DOJO_GLOSS_DOMAINS))
  ? GLOSS_ALL.filter(function(d){return DOJO_GLOSS_DOMAINS.indexOf(d.domain)>=0;})
  : GLOSS_ALL;

/* Merge glossary terms into the keyword-popup table (KW) so click-to-explain works in lessons.
   Adds a key for any parenthetical acronym and for a single-word/acronym leading token.
   Never overrides an existing (Java) keyword. */
(function(){
  GLOSS.forEach(function(d){d.groups.forEach(function(g){g.terms.forEach(function(t){
    var term=t[0], def=t[1], keys=[];
    var m=term.match(/\(([A-Za-z][A-Za-z0-9-]{1,15})\)/); if(m)keys.push(m[1]);
    var first=term.split(/[\s(\/]/)[0];
    if(/^[A-Za-z][A-Za-z0-9-]{1,15}$/.test(first))keys.push(first);
    keys.forEach(function(k){k=k.toLowerCase(); if(!KW[k])KW[k]=[def,'#glossary'];});
  });});});
  /* Level names and second spellings that lessons use bare. Each points at the
     term that defines it, so "AAL2" pops the AAL definition. */
  var ALIAS={ial1:'ial',ial2:'ial',ial3:'ial',aal1:'aal',aal2:'aal',aal3:'aal',fal1:'fal',fal2:'fal',fal3:'fal',
    oid4vp:'oid4vci',ctap1:'ctap',ctap2:'ctap',b2c:'b2b',b2b2c:'b2b',rc4:'md5',pkcs12:'pkcs',pkcs8:'pkcs',pkcs1:'pkcs',pkcs10:'pkcs',
    oid4vc:'oid4vci',m2m:'s2s',cac:'piv',der:'pem',x509:'x.509',authn:'authentication',authz:'authorization'};
  Object.keys(ALIAS).forEach(function(a){if(!KW[a]&&KW[ALIAS[a]])KW[a]=KW[ALIAS[a]];});
})();
function renderGlossary(){
  const m=document.getElementById('main');
  const termCount=d=>d.groups.reduce((a,g)=>a+g.terms.length,0);
  const total=GLOSS.reduce((a,d)=>a+termCount(d),0);
  const jump=GLOSS.map((d,i)=>`<a class="glossJump" href="javascript:void(0)" onclick="glossJumpTo(${i})">${d.icon} ${esc(d.domain)} <span class="glossJumpN">${termCount(d)}</span></a>`).join('');
  const body=GLOSS.map((d,i)=>`<details class="glossDom" id="gd${i}" open><summary class="glossSum">${d.icon} ${esc(d.domain)}<span class="glossDomN">${termCount(d)} terms</span></summary>${d.groups.map(g=>`<div class="glossGrp">${esc(g.h)}</div><dl class="glossList">${g.terms.map(t=>`<div class="glossItem"><dt>${esc(t[0])}</dt><dd>${esc(t[1])}</dd></div>`).join('')}</dl>`).join('')}</details>`).join('');
  m.innerHTML=`<div class="home glossary">
  <h1 class="pageTitle">${ico('📖')} Glossary</h1>
  <p>${total} key terms across ${DOJO_NAME}, grouped by domain. In any lesson, <b>select or double-click a highlighted term</b> to see its definition inline, this page is the full reference. Use the filter to search, or the chips to jump to a domain.</p>
  <div class="glossToolbar">
    <input id="glossSearch" class="glossSearch" placeholder="Filter ${total} terms…" oninput="filterGloss(this.value)" aria-label="Filter glossary terms">
    <button class="glossBtn" onclick="glossToggleAll(true)">Expand all</button>
    <button class="glossBtn" onclick="glossToggleAll(false)">Collapse all</button>
  </div>
  <div class="glossJumps">${jump}</div>
  <div id="glossBody">${body}</div></div>`;
  m.scrollTop=0;
}
function glossJumpTo(i){
  const d=document.getElementById('gd'+i);
  if(d){d.open=true; d.scrollIntoView({behavior:'smooth',block:'start'});}
}
function glossToggleAll(open){
  document.querySelectorAll('#main .glossDom').forEach(d=>{d.open=open;});
}
function filterGloss(q){
  q=(q||'').trim().toLowerCase();
  document.querySelectorAll('#main .glossDom').forEach(dom=>{
    let domHits=0;
    dom.querySelectorAll('.glossList').forEach(list=>{
      let listHits=0;
      list.querySelectorAll('.glossItem').forEach(it=>{
        const hit=!q||it.textContent.toLowerCase().includes(q);
        it.style.display=hit?'':'none';
        if(hit)listHits++;
      });
      list.style.display=listHits?'':'none';
      const grp=list.previousElementSibling;
      if(grp&&grp.classList.contains('glossGrp'))grp.style.display=(listHits&&!q)?'':(listHits?'':'none');
      domHits+=listHits;
    });
    dom.style.display=domHits?'':'none';
    if(q)dom.open=true;
  });
}
