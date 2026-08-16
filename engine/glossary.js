/* ============================== GLOSSARY & CLICK-TO-EXPLAIN ==============================
   The keyword table, the selection popup, and the domain-ordered glossary.
   Extracted from app.js: it is ~570 lines of reference DATA plus the two small
   renderers that read it, and it changes for entirely different reasons than
   the rest of the runtime.

   Load order matters. The IIFE below merges glossary terms into KW at load, so
   this file must be concatenated BEFORE app.js — which is why KW lives here
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
class:['Declares a class — a blueprint bundling state (fields) and behavior (methods).',TUT+'java/javaOO/classes.html'],
continue:['Skips the rest of the current loop iteration and starts the next one.',TUT+'java/nutsandbolts/branch.html'],
default:['Fallback branch in a switch; also declares a default method body in an interface.',TUT+'java/IandI/defaultmethods.html'],
do:['Starts a do-while loop, which always runs its body at least once.',TUT+'java/nutsandbolts/while.html'],
double:['64-bit floating point primitive; the default for decimal literals.',TUT+'java/nutsandbolts/datatypes.html'],
else:['Branch executed when the if condition is false.',TUT+'java/nutsandbolts/if.html'],
enum:['Declares a fixed set of named constants, each a singleton instance.',TUT+'java/javaOO/enum.html'],
extends:['Declares inheritance: the subclass inherits members of the superclass. A class can extend only one class.',TUT+'java/IandI/subclasses.html'],
final:['On a variable: assignable once. On a method: cannot be overridden. On a class: cannot be extended.',TUT+'java/IandI/final.html'],
finally:['Block that always runs after try/catch — for cleanup. Prefer try-with-resources for closeables.',TUT+'essential/exceptions/finally.html'],
float:['32-bit floating point primitive; literal needs an f suffix (1.5f).',TUT+'java/nutsandbolts/datatypes.html'],
for:['Classic counted loop, or enhanced for-each over arrays and Iterables: for (var x : list).',TUT+'java/nutsandbolts/for.html'],
if:['Conditional branch: runs the block when the boolean expression is true.',TUT+'java/nutsandbolts/if.html'],
implements:['Declares that a class provides the methods of an interface. A class can implement many interfaces.',TUT+'java/IandI/usinginterface.html'],
import:['Makes a class or static member from another package usable without its full name.',TUT+'java/package/usepkgs.html'],
instanceof:['Tests whether an object is of a given type; with pattern matching also binds it: if (o instanceof String s).','https://dev.java/learn/pattern-matching/'],
int:['32-bit signed integer primitive — the default integer type.',TUT+'java/nutsandbolts/datatypes.html'],
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
volatile:['Guarantees reads/writes of the field go to main memory — visibility across threads, not atomicity.',TUT+'essential/concurrency/atomic.html'],
while:['Loop that runs while its condition stays true.',TUT+'java/nutsandbolts/while.html'],
record:['Concise immutable data carrier (Java 16+): record Point(int x, int y) {} auto-generates constructor, accessors, equals, hashCode, toString.','https://dev.java/learn/records/'],
sealed:['Restricts which classes may extend/implement this type, listed with permits (Java 17+).','https://dev.java/learn/sealed-classes/'],
permits:['Lists the allowed subclasses of a sealed type.','https://dev.java/learn/sealed-classes/'],
yield:['Returns a value from a switch expression block branch.','https://dev.java/learn/language-basics/switch-expression/'],
stream:['Not a keyword but core API: a lazy pipeline of operations (filter, map, reduce) over data. See java.util.stream.','https://dev.java/learn/api/streams/'],
Optional:['Container that may or may not hold a value — an explicit alternative to returning null.','https://dev.java/learn/api/streams/optionals/'],
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
  tip.innerHTML=`<b>${esc(word)}</b> — ${esc(k[0])}${link}`;
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
    if(word&&/^[A-Za-z]{2,14}$/.test(word))showTip(word,e.clientX,e.clientY);
    else tip.style.display='none';
  },0);
});

/* ============================== GLOSSARY (domain-ordered) ============================== */
/* Single source of truth for domain vocabulary. Rendered as its own section (renderGlossary)
   AND merged into KW below so selecting a term in any lesson pops its definition. */
const GLOSS_ALL=[
 {domain:'Identity & Access (IAM)',icon:'🛂',groups:[
   {h:'1 · The core distinction',terms:[
     ['Authentication (authn)',`Proving who you are — the login step.`],
     ['Authorization (authz)',`Deciding what you may do, once you are known.`],
     ['Identity',`The account or entity behind a request — a person or a workload.`],
     ['Principal',`The specific "who" a request acts as; in tokens, the sub (subject) claim.`],
     ['Subject',`Same as principal — the entity a token is about (the sub claim).`],
     ['Credential',`The stored binding that ties an authenticator to an identifier — the record saying "this account is proven by this password hash or public key."`],
['Authenticator',`The thing you actually hold and present: a password, a passkey, a security key, a fingerprint. You possess an authenticator; the system stores a credential.`],
['Account',`The concrete record for a person in one particular system. One person routinely has many accounts.`],
['Identifier',`The string naming an account inside a system: a username, email, UUID or employee number.`],
['Identity proofing',`Establishing who a person is in the real world, once, before an account exists. Not authentication.`],
['Enrollment',`Creating the account and assigning its identifier, after proofing.`],
['Credential binding',`Attaching an authenticator to an identifier. The step attackers target — a weak password-reset flow is a binding flaw, not an authentication one.`],
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
     ['Transaction Token Service (TTS)',`The single logical service in a trust domain permitted to mint transaction tokens. It validates the presented subject token, applies issuance policy, and decides the scope and context claims — which makes it both the control point and a dependency on the path of internal traffic.`],
     ['Subject token',`In a token exchange, the token identifying WHO the work is being done for — usually the user's token, the one you were handed. Distinct from the actor token, which says who is asking.`],
     ['Actor token',`In a token exchange, the token identifying WHO is asking for the new token — the calling service's own credential. Optional, and what turns an anonymous swap into a recorded delegation.`],
     ['kid (key id)',`The key identifier in a JWS/JWT header, naming which key in the JWKS signed this token. Selecting the key by kid is what lets an issuer rotate keys without coordinating with any verifier.`],
     ['Crypto agility',`The ability to change algorithm or key without changing the system — algorithms in a policy list rather than hardcoded, keys selected by kid, rotation as a routine drill. Measured by how long it would take you to stop using an algorithm, not by which one you use today.`],
     ['Post-quantum cryptography (PQC)',`Algorithms designed to resist attack by a quantum computer — NIST's ML-KEM for key establishment, ML-DSA and SLH-DSA for signatures. Confidentiality is the urgent case ("harvest now, decrypt later"); short-lived signatures are far less exposed.`],
     ['ML-KEM',`The NIST-standardised post-quantum key encapsulation mechanism (FIPS 203, formerly Kyber). Used in hybrid TLS key exchange today, because confidentiality is the urgent post-quantum case.`],
     ['ML-DSA',`The NIST-standardised post-quantum signature algorithm (FIPS 204, formerly Dilithium). Relevant first to long-lived signed artefacts — certificates, firmware, credentials valid for years — rather than to five-minute access tokens.`],
     ['SLH-DSA',`A NIST-standardised stateless hash-based signature scheme (FIPS 205, formerly SPHINCS+). Conservative and slow, with large signatures; chosen where a very long security lifetime matters more than size.`],
     ['Access token',`The key an app uses to call an API. Represents authorization, not identity.`],
     ['ID token',`OIDC proof of who the user is, issued to the client. A JWT. Not for calling APIs.`],
     ['Refresh token',`A long-lived token used to obtain new access tokens without a fresh login.`],
     ['Assertion',`SAML signed XML statement about a user — its equivalent of an ID token.`],
     ['JWT',`JSON Web Token — a signed, self-contained token whose claims you can read and verify.`],
     ['Opaque token',`A random reference with no readable content; validated by calling the issuer introspection endpoint.`],
     ['Claim',`A fact in transit, asserted by a specific issuer — worth exactly as much as your trust in that issuer for that kind of fact.`],
['Attribute',`A fact at rest, stored in a directory (department, manager, email). It becomes a claim when an issuer asserts it.`],
['Registered claim',`The standardized envelope claims: iss, sub, aud, exp, iat, nbf, jti. Everything else is issuer-defined.`],
['Attribute release',`The per-app policy deciding which stored attributes are allowed to become claims. Data minimization.`],
['Attribute mapping',`Translating attribute names between systems (sAMAccountName to preferred_username to username). Mismatches are the top cause of federations that log in fine but create broken user records.`],
['Structured token',`A self-contained token carrying its claims inside, verified offline via a signature. Fast, but public and hard to revoke. Contrast with an opaque token.`],
['JWS',`JSON Web Signature — the signed compact form behind a normal JWT: three base64url parts, readable by anyone.`],
['JWE',`JSON Web Encryption — the encrypted five-part compact form, for when the claims must not be readable.`],
['PASETO',`A token format designed to remove the alg negotiation that made JWT footguns possible.`],
['Macaroon',`A token format whose holder can narrow its own permissions before passing it on.`],
['Token introspection',`Asking the issuer what an opaque token means, since it carries no readable claims (RFC 7662).`],
     ['Scope',`A named permission a token grants, such as read invoices.`],
     ['Bearer token',`A token usable by anyone who holds it, like cash. Protect it in transit and at rest.`],
     ['Sender-constrained token',`A token bound to a key only the real client has (mTLS-bound or DPoP), so a stolen copy is useless.`],
   ]},
   {h:'4 · Protocols & standards',terms:[
     ['Workload identity federation',`Exchanging a platform-issued identity — a CI job's OIDC token, a Kubernetes service account, a mesh workload's SPIFFE identity — for short-lived credentials somewhere else, so no long-lived key is stored anywhere. The security boundary is the relying platform's trust policy, not the signature.`],
     ['Identity broker (IdP proxy)',`A hub that is a relying party to many upstream identity providers and an identity provider to many downstream applications, turning n x m integrations into n + m. Also the one place cross-cutting policy, claim normalisation and audit can live — and a concentrated blast radius.`],
     ['Authorization Server Metadata',`The document at /.well-known/oauth-authorization-server (RFC 8414) or /.well-known/openid-configuration listing an authorization server's endpoints, supported algorithms and jwks_uri. Its issuer value must match, character for character, the issuer it was resolved from.`],
     ['Resource indicator',`The resource parameter (RFC 8707) naming the API a token is intended for, so the authorization server issues a token whose aud covers that API only. Worthless unless each resource server validates aud.`],
     ['OAuth 2.0',`The delegated authorization framework: lets an app act for a user without the user password.`],
     ['OpenID Connect (OIDC)',`An authentication layer on top of OAuth 2.0 that adds the ID token.`],
     ['SAML 2.0',`An XML-based standard for enterprise web single sign-on.`],
     ['SCIM',`A standard for provisioning and syncing user accounts across systems.`],
     ['WebAuthn',`A browser standard for phishing-resistant, origin-bound login (the basis of passkeys).`],
     ['LDAP',`A protocol for querying enterprise directories of users and groups.`],
     ['Kerberos',`A ticket-based enterprise SSO protocol (KDC, TGT, service tickets).`],
   ]},
   {h:'5 · Flows / grant types',terms:[
     ['Authorization Code flow',`The main flow for apps acting for a user: get a short code via the browser, then swap it for tokens on the back channel.`],
     ['PKCE',`Proof Key for Code Exchange — protects the code flow for public clients so a stolen code cannot be redeemed.`],
     ['Client Credentials flow',`Machine-to-machine flow with no user: the service authenticates as itself to get a token.`],
     ['Device flow',`For input-limited devices such as TVs and CLIs: the user approves on a phone using a code.`],
     ['Token Exchange',`Swapping one token for another, for example to call a downstream service on behalf of a user.`],
     ['CIBA',`Client-Initiated Backchannel Authentication — the user approves on a separate device, no browser redirect.`],
     ['Implicit flow',`A legacy flow that returned tokens directly in the browser. Deprecated; use code plus PKCE.`],
     ['ROPC',`Resource Owner Password Credentials — the app collects the user password directly. Deprecated.`],
   ]},
   {h:'6 · Endpoints',terms:[
     ['/authorize',`Where a login or consent flow starts (front channel, in the browser).`],
     ['/token',`Where an app exchanges a code or credentials for tokens (back channel).`],
     ['/userinfo',`An OIDC endpoint returning profile claims for the access token user.`],
     ['/introspect',`Where a resource server asks the issuer whether an opaque token is valid (RFC 7662).`],
     ['/revoke',`Where a token is proactively invalidated (RFC 7009).`],
     ['JWKS',`The published set of public keys (jwks_uri) used to verify token signatures.`],
     ['Discovery',`The /.well-known/openid-configuration document listing a provider endpoints and keys.`],
   ]},
   {h:'7 · Core concepts',terms:[
     ['Trust domain',`A group of workloads sharing one set of security controls and policies, invoked only through published interfaces. The unit a transaction token is scoped to, and the boundary at which external authorization is exchanged for internal context.`],
     ['Call chain',`Every invocation across every workload caused by one incoming request. The thing a transaction token travels along, and the thing a single forwarded access token would over-authorise.`],
     ['Workload',`A running instance of software executing for a specific purpose — a container, a service, a managed database. The non-human actor in service-to-service authorization.`],
     ['Same-origin policy',`The browser rule that script on one origin (scheme + host + port) cannot read responses from another. It does not stop the request being sent or cookies being attached — which is the gap CSRF lives in.`],
     ['CORS (Cross-Origin Resource Sharing)',`Server opt-in, enforced by browsers, that lets script on another origin READ a response. It governs reading, not sending, and not whether cookies ride along (that is SameSite). Because only browsers enforce it, it is never a substitute for authorization.`],
     ['Preflight request',`The OPTIONS request a browser sends before a cross-origin call that carries an Authorization header, a custom header or an unusual content type, asking the server whether the real request is permitted.`],
     ['SameSite',`The cookie attribute deciding whether a cookie is attached to requests originating from another site — Strict, Lax or None (which requires Secure). The primary structural defence against CSRF.`],
     ['Cross-device flow',`Any flow where the device gaining access is not the device that authenticates: the device grant, QR-code login, CIBA. Convenient where there is no keyboard or browser, and structurally weak because consent is given without context.`],
     ['SSO',`Single Sign-On — a user experience, not a protocol: one login event, many apps. Achievable by a shared session cookie within one domain, or by federation across boundaries.`],
     ['Federation',`A trust architecture: an app stops authenticating users itself and accepts signed statements from an authority it trusts, usually across an organizational boundary. Delivers SSO as a side effect, but is worth doing for one app.`],
['Single Logout (SLO)',`Ending every session created by an SSO login. Unreliable in practice because one login event really created many independent app sessions.`],
     ['Trust',`A relying party accepting tokens or assertions signed by an authority it is configured to rely on.`],
['Trust anchor',`Where the chain of verification stops: a key or certificate accepted as authoritative by configuration rather than by proof. A JWKS you pinned, an IdP certificate in SAML metadata, a root CA in your truststore. Never let a token choose its own anchor.`],
     ['Consent',`The user explicitly approving what an app may access.`],
     ['Delegated authorization',`The core idea of OAuth: you let an app do a limited set of things for you without sharing your password, and you can revoke it. Answers "may this app do this for me?"`],
['Delegated authentication',`Outsourcing the act of verifying a credential. Two very different styles: credential forwarding (LDAP bind, RADIUS, ROPC — your app holds the password) and redirect/federation (the user authenticates at the IdP and your app never sees a credential).`],
['Credential forwarding',`Delegated authentication where the app collects the password and relays it to a backend to check. Puts the app inside the credential blast radius, and cannot support MFA, passkeys or SSO.`],
['LDAP bind',`Verifying a password by attempting to bind to the directory as that user. The classic credential-forwarding pattern.`],
['On-behalf-of (OBO)',`One service calling another for a user, with a token audienced for the next hop that still names the user as subject and records who is acting.`],
['act (actor) claim',`Records the party acting on the subject's behalf, nesting to preserve a whole delegation chain (RFC 8693). Its presence is what makes a token delegation rather than impersonation.`],
['may_act',`A claim naming who is permitted to act for this subject. Must fail closed: an absent may_act never means "anyone may act."`],
['Effective subject',`Whose data is being viewed and whose permissions apply, as distinct from the authenticated subject who actually logged in. Keeping the two separate is what makes support "act as user" auditable.`],
['Policy Decision Point (PDP)',`Where an access decision is computed from identity, resource, action and context.`],
['Policy Enforcement Point (PEP)',`Where the decision is applied — a gateway, sidecar or middleware that intercepts the request and obeys the verdict.`],
['Fail closed',`Deny when you cannot decide: unreachable policy engine, unverifiable signature, unparseable claim. Failing open is what an attacker induces by overloading you.`],
['cnf (confirmation claim)',`Records which key a sender-constrained token is bound to — jkt for a DPoP JWK thumbprint, x5t#S256 for an mTLS certificate. Comparing it to the presented key is what makes the token non-bearer.`],
['DPoP proof',`A short-lived JWT sent alongside the token on every request, carrying htm, htu, iat, jti and ath, signed with the client's private key.`],
['BFF (backend-for-frontend)',`A server-side component owned by the frontend that holds OAuth tokens, so the browser only ever gets an HttpOnly session cookie.`],
['Capability URL',`A URL whose unguessable path or query IS the credential — password resets, share links, presigned downloads.`],
['IDOR / BOLA',`Insecure direct object reference: the role check passes but nobody verified the record belongs to the caller. Top of the OWASP API Security Top 10.`],
['Effective permissions',`The flattened union of everything a person can do across all groups, nested and direct. The number an access review actually needs.`],
['Deny-overrides',`A policy-combining algorithm where any deny wins, so a prohibition cannot be defeated by adding a permit elsewhere. The safe default.`],
['Discoverable credential',`A WebAuthn credential stored on the authenticator itself, so it knows which accounts it holds — what makes usernameless login possible.`],
['User verification (UV)',`The WebAuthn flag meaning the authenticator checked a PIN or biometric locally. Distinct from user presence (UP), which only means someone touched it.`],
['Phishing-resistant MFA',`A method where the authenticator itself checks who is asking, because the origin is part of the cryptographic operation: passkeys, security keys, smart cards.`],
['Number matching',`Requiring the user to type digits shown on the login screen into the push prompt, defeating blind approval and MFA fatigue.`],
['OAuth 2.1',`A consolidation of OAuth 2.0 plus the Security BCP: implicit and password grants removed, PKCE required for all authorization code flows, exact redirect URI matching.`],
['Confused deputy',`Abusing a party trusted by many principals to act against one of them. External ids in role assumption exist to prevent it.`],
['Relation tuple',`Zanzibar's unit of authorization data: subject, relation, object. Permissions are derived by traversal, not stored.`],
['Zookie',`A consistency token returned on write and presented with a later check, meaning "evaluate against a snapshot at least this recent".`],
['New enemy problem',`A stale replica applies a later write without an earlier one, so a removed user sees newly added content. Each write was correct; the order was lost.`],
['CAE',`Continuous Access Evaluation — the issuer pushes an event when access changes, so a long-lived token can be rejected in seconds instead of at expiry.`],
['Security Event Token (SET)',`A JWT whose payload is an event rather than an identity (RFC 8417). Verify it as rigorously as a token — it changes access.`],
['OpenID Federation',`Trust proven on demand by a signed chain of entity statements up to a trust anchor, replacing pairwise registration in large ecosystems.`],
['Entity statement',`A signed statement a federation participant publishes about itself, and that its authority publishes about it. Chains of these are resolved to an anchor.`],
['Metadata policy',`Constraints an authority places on what a subordinate may declare about itself. Composes downward and can only narrow.`],
['OID4VCI / OID4VP',`OpenID protocols for issuing a verifiable credential into a wallet, and for a verifier requesting a presentation from it.`],
['Presentation definition',`A verifier's machine-readable description of what it needs. The wallet chooses which credential satisfies it and which claims to disclose.`],
['mDL',`Mobile driving licence (ISO/IEC 18013-5) — a CBOR credential format designed to work offline over NFC or Bluetooth.`],
['Non-human identity (NHI)',`Service accounts, workloads, CI runners, bots and agents. They outnumber humans in most estates and inherit none of the joiner-mover-leaver lifecycle.`],
['Agent identity',`An autonomous caller acting for a user: the subject stays the user, the agent is recorded as the acting party, and authority is granted in advance and bounded.`],
     ['Impersonation',`When a service simply acts as the user with no distinction — contrast with delegation.`],
     ['Least privilege',`Granting only the access truly needed, nothing more.`],
     ['MFA',`Multi-factor authentication — requiring two or more independent factors.`],
     ['Step-up authentication',`Asking for stronger proof only when an action is sensitive.`],
     ['Public client',`An app that cannot keep a secret, such as a SPA or mobile app — must use PKCE.`],
     ['Confidential client',`An app that can keep a secret, such as a server — authenticates to the token endpoint.`],
     ['Front channel',`Communication that passes through the user browser (redirects).`],
     ['Back channel',`Direct server-to-server communication the browser never sees.`],
     ['audience (aud)',`The claim naming who a token is for; a resource server must check it.`],
     ['issuer (iss)',`The claim naming who minted a token; verified against the expected authority.`],
     ['nonce',`A one-time value that ties an OIDC ID token to a single login, preventing replay.`],
     ['state',`A random value the client sends on the redirect and re-checks on return, preventing CSRF.`],
     ['Session',`Server- or cookie-tracked state that remembers a logged-in user between requests.`],
   ]},
   {h:'8 · Threats & defenses',terms:[
     ['Certificate pinning',`Requiring a presented chain to contain a specific pre-configured public key rather than accepting any certificate from any trusted CA. Pin the SubjectPublicKeyInfo hash, prefer an intermediate over the leaf, always hold a backup pin — a failed pin denies service in a way no server-side change can fix.`],
     ['Subject collision',`Two upstream identity providers issuing the same subject identifier for different people. Only the (issuer, subject) pair is unique, so a broker or application keying on the raw subject alone will eventually merge two unrelated accounts.`],
     ['IdP mix-up',`An attack in which a client is induced to use one identity provider's endpoints while believing it is talking to another, typically by supplying attacker-controlled metadata. Defended by exact issuer comparison and the iss response parameter (RFC 9207).`],
     ['Algorithm confusion',`Forging a token by changing its alg — most classically re-signing an RS256 token as HS256 using the issuer's public key as the HMAC secret. Defended by validating alg against your own policy list rather than dispatching on the header.`],
     ['Consent phishing (illicit grant)',`Obtaining access by persuading a user to approve a genuine consent screen for an attacker's request, rather than by stealing a credential. Nothing is spoofed, MFA is satisfied honestly, and phishing-resistant authentication does not prevent it.`],
     ['SSRF',`Server-Side Request Forgery: making a server issue HTTP requests of the attacker's choosing. In identity systems it is a common route to internal metadata endpoints and to tokens the server holds.`],
     ['Device-code phishing',`Cross-device consent phishing: the attacker starts a device-grant flow and sends the resulting user_code to the victim, who authenticates at the real provider and approves the attacker's session.`],
     ['CSRF',`Cross-Site Request Forgery — a malicious page makes your browser send an unintended authenticated request. Defended with the state parameter and anti-CSRF tokens.`],
     ['Replay attack',`Re-sending a captured token or message to impersonate someone. Defended with short expiries, nonces, and sender-constrained tokens.`],
     ['Token theft',`Stealing a bearer token to reuse it. Defended with short lifetimes, secure storage, and proof-of-possession.`],
     ['Phishing-resistant authentication',`Login methods that cannot be phished because the secret never leaves the device and is bound to the real site origin (passkeys and WebAuthn).`],
     ['Open redirect',`A flaw where an app forwards users to an attacker URL; abused to steal codes or tokens.`],
   ]},
   {h:'9 · Governance & lifecycle',terms:[
     ['Provisioning',`Creating and configuring user accounts and their access, often automated via SCIM.`],
     ['Deprovisioning',`Removing access when someone leaves or changes roles.`],
     ['JML',`Joiner, Mover, Leaver — the employee identity lifecycle.`],
     ['JIT provisioning',`Just-in-time — creating the account automatically on first successful login.`],
     ['RBAC',`Role-Based Access Control — permissions granted through roles.`],
     ['ABAC',`Attribute-Based Access Control — decisions from attributes and policy rules.`],
     ['IGA',`Identity Governance and Administration — access requests, reviews, and certification.`],
     ['PAM',`Privileged Access Management — securing and monitoring high-power accounts.`],
   ]},
 ]},
 {domain:'Service-to-Service & Zero Trust',icon:'🔗',groups:[
   {h:'Machine identity',terms:[
     ['SPIFFE',`A standard for giving workloads verifiable identities (SPIFFE IDs).`],
     ['SPIRE',`The reference implementation that attests workloads and issues SVIDs.`],
     ['SVID',`SPIFFE Verifiable Identity Document — the X.509 cert or JWT a workload uses to prove who it is.`],
     ['mTLS',`Mutual TLS — both client and server present certificates, so each proves its identity.`],
     ['Workload identity',`A non-human identity for a service or job, used instead of shared secrets.`],
     ['Attestation',`Proving what a workload is, from node or process properties, before issuing it an identity.`],
     ['Zero trust',`Never trust by network location; verify identity and authorize every request.`],
   ]},
 ]},
 {domain:'PKI & Certificates',icon:'📜',groups:[
   {h:'Public key infrastructure',terms:[
     ['X.509',`The standard format for a public-key certificate binding a key to an identity.`],
     ['Certificate Authority (CA)',`A trusted issuer that signs certificates.`],
     ['Chain of trust',`A certificate is trusted because it chains up to a root CA you already trust.`],
     ['CSR',`Certificate Signing Request — what you send a CA to get a certificate issued.`],
     ['CRL',`Certificate Revocation List — a published list of revoked certificates.`],
     ['OCSP',`Online Certificate Status Protocol — checks a single certificate revocation status in real time.`],
     ['ACME',`The protocol behind automated certificate issuance, such as Let us Encrypt.`],
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
     ['CORS',`Cross-Origin Resource Sharing: server opt-in, enforced by browsers, that lets script on another origin read a response. It governs reading the response, not sending the request — and it is not authorization, because only browsers enforce it.`],
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
     ['stdin / stdout / stderr',`The three streams every filter has: input, results, and a separate channel for diagnostics — separate so that warnings never contaminate the data flowing down a pipe.`],
     ['Pipeline',`Two or more filters joined by |, running concurrently, with one program's stdout feeding the next one's stdin. Data streams through as it is produced, so file size stops being a memory limit.`],
     ['Exit code',`The status a program returns: 0 for success, non-zero for failure. grep returns 1 for "ran fine, matched nothing" — which is why an empty result aborts a script running under set -e.`],
     ['SIGPIPE',`The signal delivered to a process that writes to a pipe whose reader has closed. It is why "grep pattern huge.log | head -5" returns instantly instead of reading the whole file.`],
     ['pipefail',`The shell option (set -o pipefail) that makes a pipeline fail if any stage failed. Without it a pipeline reports only its last command's status, so a broken first stage exits 0 and produces nothing.`],
     ['Greedy matching',`The default behaviour of .* — match as much as possible. It is why s/.*=// deletes through the LAST delimiter on the line; the POSIX fix is a negated class such as [^=]*=.`],
     ['Associative array',`awk's string-keyed hash map. It turns group-by into one pass with memory proportional to the number of distinct keys, which is what makes awk, rather than grep or sed, the tool that aggregates.`],
     ['Percentile (p99)',`The value below which that share of observations fall. A mean describes the typical request and hides the tail; a p99 that moves tenfold while the median holds steady is the signature of a slow dependency on a small fraction of calls.`],
     ['Nearest rank',`The simplest percentile definition: sort the values and take position ceil(p x n). Requires a numeric sort — a text sort ranks "99" above "1075" and quietly returns the wrong tail.`]
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
 ]},,
 {domain:'JavaScript & Node',icon:'\u{1F7E8}',groups:[
   {h:'1 \u00b7 Values and types',terms:[
     ['Primitive',`One of the seven immutable single values: number, string, boolean, undefined, null, bigint, symbol. Everything else is an object.`],
     ['Coercion',`Automatic conversion between types. + concatenates if either side is a string; every other arithmetic operator converts to number.`],
     ['Truthy / falsy',`Exactly eight values are falsy: false, 0, -0, 0n, "", null, undefined and NaN. Everything else — including "0", [] and {} — is truthy.`],
     ['NaN',`"Not a number" — the failure value of a numeric operation. The only value not equal to itself; test with Number.isNaN.`],
     ['Nullish coalescing (??)',`Falls back only on null and undefined, unlike || which falls back on any falsy value including 0 and "".`],
     ['Optional chaining (?.)',`Short-circuits to undefined instead of throwing when a link in a property path is null or undefined.`]]},
   {h:'2 \u00b7 Scope and functions',terms:[
     ['Hoisting',`Declarations are processed before the code runs. var yields undefined; let and const throw until initialised.`],
     ['Temporal dead zone',`The region between a let/const declaration being hoisted and initialised, where reading it is a ReferenceError.`],
     ['Lexical scope',`A name resolves according to where the function is WRITTEN, not where it is called. The opposite of how this is decided.`],
     ['Closure',`A function together with the scope it was created in. It captures the binding, not a copy of the value.`],
     ['this',`Decided at call time by how the function was called: new, explicit binding, the object left of the dot, or nothing. Arrows have none of their own.`],
     ['Pure function',`Same input gives same output, and it touches nothing outside itself. Needs no mocks to test.`]]},
   {h:'3 \u00b7 Objects and prototypes',terms:[
     ['Prototype chain',`Property lookup follows a hidden link from object to object until it reaches null. Reading searches upward; writing always lands on the object itself.`],
     ['Structural typing',`If the shape fits, it fits — nothing declares that it implements an interface. How TypeScript compares types.`],
     ['Shallow copy',`Spread and Object.assign copy only top-level properties; nested objects remain shared references. structuredClone copies deeply.`],
     ['Prototype pollution',`Merging untrusted data can set __proto__ and thereby add a property to every object in the program. Use Object.create(null) or a Map for untrusted keys.`],
     ['Iterable protocol',`An object with a [Symbol.iterator] method works with for...of, spread and destructuring.`]]},
   {h:'4 \u00b7 Asynchrony',terms:[
     ['Event loop',`When the call stack is empty, take the next callback from a queue and run it. The host does the waiting; nothing in your code runs in parallel.`],
     ['Microtask',`A promise callback. The entire microtask queue drains after each macrotask, so promises always run before the next timer.`],
     ['Macrotask',`A timer or I/O callback. setTimeout(fn, 0) is a minimum delay, not an immediate call.`],
     ['Unhandled rejection',`A rejected promise nobody awaited or caught. Since Node 15 it terminates the process.`],
     ['Backpressure',`A slow writer signalling a fast reader to pause, so unwritten data does not pile up in memory. pipeline handles it for you.`],
     ['Event loop lag',`The gap between when a timer should have fired and when it did. The single most useful health metric a Node service can emit.`]]},
   {h:'5 \u00b7 Modules, tooling and types',terms:[
     ['ESM',`ES modules: import/export, statically resolved before execution — which is what makes tree-shaking possible.`],
     ['CommonJS',`Node\u2019s original module system: require/module.exports, resolved dynamically at the moment of the call.`],
     ['Tree-shaking',`Dropping unused exports from a bundle. Only possible because ESM\u2019s dependency graph is known without running the code.`],
     ['Semver',`MAJOR.MINOR.PATCH. ^ allows minor and patch but never crosses a major — except below 1.0, where it treats the minor as breaking.`],
     ['Lockfile',`Records the exact version of every package in the tree. npm ci installs from it; npm install rewrites it.`],
     ['Type erasure',`TypeScript annotations are removed before the code runs, so there are no runtime type checks and every boundary still needs validation.`],
     ['Source map',`A file mapping bundled, minified positions back to your original source, so a stack trace names real files and variables.`]]}]}
];

/* Per-course glossary. A course sets DOJO_GLOSS_DOMAINS in its config to name the
   domains it actually teaches; without it, every domain is shown (Dev Dojo's case).
   This is why Identity Dojo does not list Java collections and JS Dojo does not list
   Kerberos — one shared vocabulary file, filtered per course. */
const GLOSS=(typeof DOJO_GLOSS_DOMAINS!=="undefined"&&Array.isArray(DOJO_GLOSS_DOMAINS))
  ? GLOSS_ALL.filter(function(d){return DOJO_GLOSS_DOMAINS.indexOf(d.domain)>=0;})
  : GLOSS_ALL;

/* Merge glossary terms into the keyword-popup table (KW) so click-to-explain works in lessons.
   Adds a key for any parenthetical acronym and for a single-word/acronym leading token.
   Never overrides an existing (Java) keyword. */
(function(){
  GLOSS.forEach(function(d){d.groups.forEach(function(g){g.terms.forEach(function(t){
    var term=t[0], def=t[1], keys=[];
    var m=term.match(/\(([A-Za-z]{2,14})\)/); if(m)keys.push(m[1]);
    var first=term.split(/[\s(]/)[0];
    if(/^[A-Za-z]{2,14}$/.test(first))keys.push(first);
    keys.forEach(function(k){k=k.toLowerCase(); if(!KW[k])KW[k]=[def,'#glossary'];});
  });});});
})();
function renderGlossary(){
  const m=document.getElementById('main');
  const termCount=d=>d.groups.reduce((a,g)=>a+g.terms.length,0);
  const total=GLOSS.reduce((a,d)=>a+termCount(d),0);
  const jump=GLOSS.map((d,i)=>`<a class="glossJump" href="javascript:void(0)" onclick="glossJumpTo(${i})">${d.icon} ${esc(d.domain)} <span class="glossJumpN">${termCount(d)}</span></a>`).join('');
  const body=GLOSS.map((d,i)=>`<details class="glossDom" id="gd${i}" open><summary class="glossSum">${d.icon} ${esc(d.domain)}<span class="glossDomN">${termCount(d)} terms</span></summary>${d.groups.map(g=>`<div class="glossGrp">${esc(g.h)}</div><dl class="glossList">${g.terms.map(t=>`<div class="glossItem"><dt>${esc(t[0])}</dt><dd>${esc(t[1])}</dd></div>`).join('')}</dl>`).join('')}</details>`).join('');
  m.innerHTML=`<div class="home glossary">
  <h1>📖 Glossary</h1>
  <p>${total} key terms across ${DOJO_NAME}, grouped by domain. In any lesson, <b>select or double-click a highlighted term</b> to see its definition inline — this page is the full reference. Use the filter to search, or the chips to jump to a domain.</p>
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
