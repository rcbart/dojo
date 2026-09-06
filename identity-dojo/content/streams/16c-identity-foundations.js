STREAMS.push({iam:true,sec:'Identity & federation foundations',icon:'🪪',title:'Identity Foundations',blurb:'The vocabulary of identity from scratch: a glossary, then authentication vs authorization, sessions vs tokens, SSO & federation, IdPs and clients, scopes and consent. The base every OAuth/OIDC/SAML lesson builds on.',lessons:[

{id:'idf0',title:'Glossary: the identity & OAuth vocabulary',body:`


<p>Identity has too many words, and half of them mean the same thing in a different protocol. The
definitions live in the <b>&#128214; Glossary</b> in the left sidebar, ordered by domain from the core
distinction through to governance. That order is also a sensible reading order if you want the
vocabulary in one pass.</p>
<p>You don't have to leave a lesson to look something up. <b>Select or double-click any term</b>,
<code>OAuth</code>, <code>SAML</code>, <code>PKCE</code>, <code>JWT</code>, <code>CSRF</code>,
<code>scope</code>, <code>nonce</code>, and its definition pops up in place. The same click-to-explain
that covers Java keywords covers the whole identity vocabulary.</p>

<h4>Why the vocabulary is the hard part</h4>
<p>The concepts in identity aren't complicated. The naming is. The same idea has a different name in
every protocol, and two different ideas often share a name. Two of those protocols need a word of
introduction before the role names make sense. <b>OIDC</b> is OpenID Connect: a thin layer on top of
OAuth that adds the missing piece, a signed statement of who logged in, called an ID token. OAuth
answers "what may this app do"; OIDC answers "who is this person". <b>SAML</b> is Security Assertion
Markup Language: the older, XML-based standard for single sign-on between companies. The identity
provider sends the application a signed XML document, an assertion, saying who the user is. It's still
what most enterprise single sign-on runs on. Now the roles. The thing that asks for a token is a
<i>client</i> in OAuth, a <i>relying party</i> in OIDC and a <i>service provider</i> in SAML. The thing
that issues one is an <i>authorization server</i> in OAuth, an <i>OpenID provider</i> in OIDC and an
<i>identity provider</i> in SAML. Each spec named the roles from its own point of view. Most identity
confusion is a conversation that mixes all three.</p>
<p>Get three pairs straight before anything else. Backwards, they make whole protocols unreadable:</p>
<ul>
<li><b>Authentication</b> proves who you are. <b>Authorization</b> decides what you may do. OAuth is an
authorization protocol, so using it alone to answer "who is this user?" is a category error. That's why
OIDC exists.</li>
<li>An <b>access token</b> is for a resource server and is none of the client's business. An <b>ID
token</b> is for the client and says who signed in. Sending an ID token to an API is one of the most
common integration bugs there is.</li>
<li><b>Authorization</b> (permission), <b>authentication</b> (identity) and <b>accounting</b> (the audit
trail) are three separate systems with separate failure modes.</li>
</ul>
<p>One habit that helps. When a lesson introduces a term, say which role it belongs to and in which
protocol: "Assertion: SAML's word for the signed statement about the user, the equivalent of an ID
token."</p>`,
docs:[['OAuth 2.0 roles (RFC 6749 §1.1)','https://www.rfc-editor.org/rfc/rfc6749#section-1.1'],['OIDC terminology','https://openid.net/specs/openid-connect-core-1_0.html#Terminology'],['CSRF (OWASP)','https://owasp.org/www-community/attacks/csrf']],
},

{id:'idf1',title:'Authentication vs authorization',body:`



<p>These two words get mixed up constantly. They answer different questions:</p>
<ul>
<li><b>Authentication (authn)</b>: <i>who are you?</i> Proving identity. Login.</li>
<li><b>Authorization (authz)</b>: <i>what are you allowed to do?</i> Deciding access, <b>after</b> you're known.</li>
</ul>
<p>The nouns you'll need:</p>
<ul>
<li><b>Identity</b>: the account or entity. A user, or a service or workload.</li>
<li><b>Principal / Subject</b>: the specific "who" a request acts as. Inside a token this is the <code>sub</code> claim; both words are unpacked just below.</li>
<li><b>Credentials</b>: what proves identity. A password, a private key, a client secret, a certificate. How they must be stored and moved is its own lesson, two ahead: <i>Credentials at rest and in transit</i>.</li>
<li><b>Factors &amp; MFA</b>: categories of proof. Something you <i>know</i> (password), <i>have</i> (phone, security key), <i>are</i> (biometric). Multi-factor combines two or more.</li>
</ul>
<div class="rule"><b>Rule.</b> A credential is never stored in plain text. Not a password, not an API key, not a client secret. If the database leaks, the attacker must get nothing they can log in with.</div>

<h4>Two words used above: token and claim</h4>
<p>A <b>token</b> is a small piece of data a system hands you after you've proven who you are, so you
don't have to prove it again on every request. Think of a wristband at a festival: you show your ticket
once at the gate, and after that the wristband is what gets you through. The token travels with each
request, either in an HTTP header (<code>Authorization: Bearer eyJ...</code>) or in a cookie the browser
attaches for you. The server checks the token, not your password.</p>
<p>A <b>claim</b> is one fact written inside a token. A token is a small bag of claims. A few have
standard names that every system understands:</p>
<ul>
<li><code>sub</code>: the <b>subject</b>, who the token is about. An account id, never a display name.</li>
<li><code>iss</code>: the <b>issuer</b>, who made the token.</li>
<li><code>aud</code>: the <b>audience</b>, who the token is for. An API must refuse a token meant for someone else.</li>
<li><code>exp</code> and <code>iat</code>: when it expires and when it was issued. <code>nbf</code>: not valid before.</li>
<li><code>jti</code>: a unique id for this one token, so a copy can be spotted and refused.</li>
</ul>
<p>You can add your own claims, such as <code>department</code> or <code>tenant</code>. Because two vendors
might both invent a claim called <code>role</code>, custom claims are usually namespaced with a URL
(<code>https://example.com/role</code>) so they can't collide. Anyone holding a token can read its claims;
what stops them changing one is the signature, which gets its own lesson. The lessons <i>What a token
actually is</i> and <i>Attributes, claims and assertions</i> go deeper into both.</p>
<div class="codeSample" data-hl>// the claims inside one access token, decoded
{
  "iss": "https://login.example.com",      // who made it
  "sub": "u-4817",                          // who it is about: the principal
  "aud": "orders-api",                      // who it is for
  "exp": 1757203200, "iat": 1757199600,     // valid for one hour
  "jti": "9f2c...",                          // this token's own id
  "scope": "orders:read orders:write",      // what it may do
  "https://example.com/department": "Platform"   // a custom claim, namespaced
}</div>

<p>A request carries a credential. The server <b>authenticates</b> it to establish a principal, then
<b>authorizes</b> the action against that principal's permissions. Checking <i>who</i> but never
<i>whether they're allowed</i> is one of the most common security bugs there is.</p>
<div class="codeSample" data-hl>// authentication: verify a credential -> establish the principal
// authorization: given the principal's roles, allow or deny the action
if (authenticate(header)) {          // who are you?
    if (authorize(roles, "orders:write")) { ... }   // may you do this?
}</div>

<h4>The airport version</h4>
<p>At the check-in desk someone looks at your passport and agrees you're the person in the photo.
That's <b>authentication</b>. Nobody has said where you may go.</p>
<p>At the gate someone looks at your boarding pass and decides whether you may board <i>this</i>
flight, in <i>that</i> seat. That's <b>authorization</b>: what you may do, now that you're known. Two
checks, two different failures.</p>
<div class="codeSample" data-hl>AUTHENTICATION   "who are you?"      -> a subject     -> 401 if it fails
AUTHORIZATION    "may you do this?" -> a decision    -> 403 if it fails

// and the sequence never reverses. you cannot decide what someone may
// do before you know who they are - which is why every request handler
// authenticates first and authorizes second.</div>

<h4>401 and 403</h4>
<p><b>401 Unauthorized</b> is misnamed. It means <i>unauthenticated</i>: "I don't know who you are.
Present a credential." A browser can act on it by showing the login page. It must carry a
<code>WWW-Authenticate</code> header naming the scheme.</p>
<p><b>403 Forbidden</b> means "I know who you are, and the answer is still no." Logging in again won't
help. Showing a login page here is the classic bug: the user signs in, lands on the same page, and gets
403 again.</p>
<p>The test: <i>would a different credential change the outcome?</i> Yes is 401. No is 403.</p>

<h4>Where each one lives</h4>
<div class="codeSample" data-hl>AUTHENTICATION happens ONCE, at the edge, and produces a token or session.
  passwords, passkeys, MFA, SSO redirects, certificates -
  all of it is machinery for answering one question, one time.

AUTHORIZATION happens ON EVERY REQUEST, everywhere, forever.
  "may this subject read this record?" is asked again for every
  record, every endpoint, every service in the chain.

// which is why authorization bugs vastly outnumber authentication
// bugs in real applications: there are thousands of decisions and
// only one login.</div>

<h4>The mistake this prevents</h4>
<p>"The user is logged in, so they can see it." That sentence collapses the two, and it's how
<b>IDOR</b> happens: insecure direct object reference. The application checks that <i>somebody</i> is
authenticated, then serves
<code>/orders/1042</code> to whoever asked, without checking the order is theirs. Change the number in
the URL and you have a data breach. It's among the most exploited web vulnerabilities there are.</p>
<p>Authentication tells you the request has an owner. It says nothing about what that owner may see.</p>

<h4>Two more words</h4>
<p><b>Identification</b> is claiming an identity: typing a username. Authentication is <i>proving</i>
it. A system that accepts an identifier as proof has skipped the second step. An unauthenticated
<code>X-User-Id</code> header is exactly that.</p>
<p><b>Accounting</b>, or auditing, is the third leg: recording what was decided and what happened.
Together they're <b>AAA</b>: authentication, authorization and accounting. Who you are, what you may
do, and the record of what happened. Accounting is the one teams discover they needed after an incident.</p>`,
docs:[['OWASP Authentication Cheat Sheet','https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html'],['OWASP Authorization Cheat Sheet','https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html']],
ex:{title:'Authenticate, then authorize',
prompt:`Write <code>Access</code> with: <code>static String[] decodeBasic(String header)</code> (the <b>authentication</b> step): given an HTTP Basic header value like <code>"Basic dXNlcjpwYXNz"</code>, take the part after the space, base64-decode it with <code>java.util.Base64.getDecoder()</code> into <code>"user:pass"</code>, and return it split into <code>{user, pass}</code> with <code>split(":", 2)</code>; and <code>static boolean authorize(java.util.Set&lt;String&gt; roles, String required)</code> (the <b>authorization</b> step): return whether <code>roles</code> <code>.contains(required)</code>.`,
starter:`import java.util.*;

public class Access {
    static String[] decodeBasic(String header) {
        return null;
    }
    static boolean authorize(Set<String> roles, String required) {
        return false;
    }
}`,
tests:[{d:'takes the part after the space',re:'substring\\s*\\(|indexOf\\s*\\(\\s*[\\x27"] [\\x27"]|split\\s*\\(\\s*" "'},{d:'base64-decodes the credentials',re:'Base64\\.getDecoder\\s*\\(\\s*\\)'},{d:'splits user:pass into two',re:'split\\s*\\(\\s*":"\\s*,\\s*2\\s*\\)'},{d:'authorization checks role membership',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:roles\\s*\\.\\s*contains\\s*\\(\\s*required\\s*\\)))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:roles\\s*\\.\\s*contains\\s*\\(\\s*required\\s*\\))[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:roles\\s*\\.\\s*contains\\s*\\(\\s*required\\s*\\))[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:roles\\s*\\.\\s*contains\\s*\\(\\s*required\\s*\\))[^{]*?return\\s+\\k<av>\\b)'}],
behavior:`decodeBasic("Basic dXNlcjpwYXNz") returns {"user","pass"} (that base64 decodes to "user:pass"). authorize(Set.of("orders:read","orders:write"), "orders:write") is true; authorize(Set.of("orders:read"), "orders:write") is false. Authentication (who) happens before authorization (what).`,
hints:['The token starts right after the space: take <code>header.substring(header.indexOf(" ") + 1)</code> (index of the space, plus one).','<code>new String(Base64.getDecoder().decode(b64))</code> gives "user:pass".','<code>split(":", 2)</code> keeps a password that itself contains a colon intact.'],
solution:`import java.util.*;

public class Access {
    // authentication: pull the identity's credentials out of the Basic header
    static String[] decodeBasic(String header) {
        String b64 = header.substring(header.indexOf(' ') + 1);
        String creds = new String(Base64.getDecoder().decode(b64));
        return creds.split(":", 2);
    }
    // authorization: does this principal hold the required role/permission?
    static boolean authorize(Set<String> roles, String required) {
        return roles.contains(required);
    }
}`}},

{id:'idflife',title:'How a person becomes a login: the identity lifecycle',body:`




<p>Before any protocol runs, something has to turn a <i>person</i> into something a computer can check.
Every later lesson assumes that already happened. This is that first step, and it's where a lot of the
vocabulary comes from.</p>

<h4>Four things people call "identity"</h4>
<ul>
<li><b>The person</b>: a real human, or a real machine. Exists whether or not any computer knows it.</li>
<li><b>The identity</b>: the set of facts a system holds about that person.</li>
<li><b>The account</b>: the record in one particular system. One person has many accounts: a work
account, a Google account, a customer account.</li>
<li><b>The identifier</b>: the string that names the account inside that system. A username, an email,
a UUID, an employee number.</li>
</ul>
<p>Specs say <b>subject</b> (the entity being described, the <code>sub</code> claim in a JWT) and
<b>principal</b> (the authenticated entity a system is acting for). Both mean "the who." A <b>JWT</b> is
a JSON Web Token: a small signed document, three base64 pieces separated by dots, that carries claims
such as who the user is and when the token expires. A <b>claim</b> is one fact inside a token: a name,
an email, an expiry time. A person is not an account, and an account is not an identifier.</p>

<h4>The lifecycle</h4>
<ol>
<li><b>Identity proofing</b>: establishing that the person is who they claim <i>in the real world</i>.
Checking a passport, verifying an employment record, confirming an email. This isn't authentication. It
happens once, before any account exists. Get it wrong and you'll authenticate an impostor perfectly,
forever.</li>
<li><b>Registration / enrollment</b>: creating the account and assigning the identifier.</li>
<li><b>Credential binding</b>: attaching a way to prove ownership of the account. Setting a password,
registering a passkey, issuing a certificate. <b>Binding</b> is the link between the person and the
identifier, and it's the step attackers go for. A self-service password reset with a weak email check is
a binding vulnerability, not an authentication one.</li>
<li><b>Authentication</b>: every login from then on. The person presents the bound credential and the
system confirms it matches. This is the only step most courses cover.</li>
<li><b>Changes ("mover")</b>: the person changes department, role or name. Entitlements have to
follow.</li>
<li><b>Deprovisioning ("leaver")</b>: the account is disabled and access ends. This is the step audits
fail on: orphaned accounts belonging to people who left years ago.</li>
</ol>
<p>Steps 2, 5 and 6 together are <b>provisioning</b>. The shorthand for the whole arc is <b>joiner /
mover / leaver</b>. <b>SCIM</b>, much later in the course, automates it across systems. That's the
System for Cross-domain Identity Management: the standard for creating, updating and disabling accounts
across systems automatically. When HR marks someone as left, SCIM is how that becomes a disabled account
in every application by the afternoon.</p>

<h4>Credential vs authenticator</h4>
<p>People use these interchangeably. NIST doesn't:</p>
<ul>
<li><b>Authenticator</b>: the <i>thing</i> that does the proving. A password, a phone running an
authenticator app, a security key, a fingerprint sensor. Something you know, have or are.</li>
<li><b>Credential</b>: the <i>record</i> that ties an authenticator to an identifier, stored by the
system. The row saying "account alice is proven by this password hash," or "by this public key."</li>
</ul>
<p>You <i>hold</i> an authenticator. The system <i>stores</i> a credential. When someone says
"credentials were stolen," ask which. A stolen password is a different incident from a stolen hash
database.</p>

<h4>Where identity lives: the directory</h4>
<p>Accounts and their facts live in a <b>directory</b>. Historically that meant LDAP or Active
Directory. <b>LDAP</b> is the Lightweight Directory Access Protocol: the protocol for querying a
directory, the database of people, groups and machines an organization keeps. "Look up this user's
groups" is an LDAP query. <b>Active Directory</b> is Microsoft's directory: the accounts, groups and
machines of a company, plus the login service that goes with it. Today it's just as often a cloud
identity provider's user store. It holds accounts, their
<b>attributes</b> (department, manager, email) and their group memberships. When a later lesson says
"the IdP looks up the user," this is where it looks.</p>
<div class="flowDia"><svg viewBox="0 0 640 412" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Identity lifecycle: person, account, authentication, deprovision"><defs><marker id="idflife-ah" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent)"/></marker></defs>
<rect x="30" y="10" width="280" height="46" rx="8" class="fdActor"/><text x="170" y="29" class="fdActorT">Person</text><text x="170" y="44" class="fdActorS">Ada, a real human being</text>
<line x1="170" y1="56" x2="170" y2="100" stroke="var(--accent)" class="fdArrow" marker-end="url(#idflife-ah)"/>
<text x="190" y="82" class="fdLabel" style="text-anchor:start">identity proofing: passport checked, once, before any login</text>
<rect x="30" y="104" width="280" height="46" rx="8" class="fdActor"/><text x="170" y="123" class="fdActorT">Account</text><text x="170" y="138" class="fdActorS">u-4817 in the corporate directory</text>
<line x1="170" y1="150" x2="170" y2="258" stroke="var(--accent)" class="fdArrow" marker-end="url(#idflife-ah)"/>
<text x="190" y="180" class="fdLabel" style="text-anchor:start">identifier: ada@corp.example</text>
<text x="190" y="206" class="fdLabel" style="text-anchor:start">attributes: department=Platform, manager=u-1102</text>
<text x="190" y="232" class="fdLabel" style="text-anchor:start">credential binding: passkey, its public key stored</text>
<rect x="30" y="262" width="280" height="46" rx="8" class="fdActor"/><text x="170" y="281" class="fdActorT">Authentication</text><text x="170" y="296" class="fdActorS">every login from now on</text>
<text x="330" y="289" class="fdLabel" style="text-anchor:start">prove you hold the authenticator</text>
<line x1="170" y1="308" x2="170" y2="352" stroke="var(--accent)" class="fdArrow" marker-end="url(#idflife-ah)"/>
<rect x="30" y="356" width="280" height="46" rx="8" class="fdActor"/><text x="170" y="375" class="fdActorT">Deprovision</text><text x="170" y="390" class="fdActorS">account disabled</text>
<text x="330" y="383" class="fdLabel" style="text-anchor:start">access ends everywhere at once</text>
</svg></div>
<ol class="fdSteps">
<li><b>Person:</b> Ada, a real human being. Identity proofing (passport checked) happens once, before any login.</li>
<li><b>Account:</b> id <code>u-4817</code> in the corporate directory, with the identifier <code>ada@corp.example</code>, attributes (department=Platform, manager=u-1102) and a credential binding to an authenticator: a passkey, whose public key is stored.</li>
<li><b>Authentication:</b> every login from now on, proving you hold the authenticator.</li>
<li><b>Deprovision:</b> the account is disabled and access ends everywhere at once.</li>
</ol>
<p>This map settles two phrases you'll hear a lot. <b>Assurance</b>: "high assurance" is ambiguous until
you ask which step. How carefully was the person proofed? That's the <b>Identity Assurance Level
(IAL)</b>. How strong is the login? That's the <b>Authenticator Assurance Level (AAL)</b>. NIST scores
each from 1 to 3, and they're separate scales for separate steps. <b>Revocation</b>: "remove access" can
mean disable the account, unbind a credential, or kill a live session. Those are three different
actions, and only the lifecycle view makes that obvious.</p>`,
docs:[['NIST SP 800-63-3 (Digital Identity Guidelines (overview))','https://pages.nist.gov/800-63-3/sp800-63-3.html'],['NIST SP 800-63A (Enrollment & Identity Proofing)','https://pages.nist.gov/800-63-3/sp800-63a.html'],['RFC 7644 (SCIM Protocol)','https://www.rfc-editor.org/rfc/rfc7644']],
},

{id:'idfcred',title:'Credentials at rest and in transit',
body:`
<p>The last lesson followed a person becoming an account, and step three was <b>credential binding</b>:
attaching something that proves you own the account. This lesson is about that something, how it is kept,
and how it moves. Get it wrong and none of the rest matters, because the attacker just logs in as you.</p>

<div class="rule"><b>The one rule.</b> A credential is <b>never</b> stored in plain text. Not a password,
not an API key, not a client secret, not a token. If your database is stolen, the thief must come away
with nothing they can log in with. Every practice below is a way of keeping that promise.</div>

<h4>What counts as a credential</h4>
<p>A <b>credential</b> is anything a system accepts as proof of who you are: a password, an API key, a
client secret, a private key, a token, a passkey's private half. They fall into two groups, and the
difference decides how you store them.</p>
<ul>
<li><b>Secrets you can verify without keeping.</b> A password is the clearest case. The server never
needs the password again after you set it; it only needs to check a future guess. So it should not keep
the password at all. It keeps a one-way transform of it.</li>
<li><b>Secrets you must be able to use again.</b> An API key you call a partner with, a private key you
sign with. The system needs the actual value later, so it must be stored recoverably, which means
encrypted, with the encryption key held somewhere else.</li>
</ul>

<h4>Hashing: proving a password without keeping it</h4>
<p>A <b>hash function</b> takes any input and returns a fixed-size fingerprint. The same input always
gives the same fingerprint, and there is no way to run it backwards from the fingerprint to the input.
So instead of storing your password, the server stores its hash. When you log in, it hashes what you
typed and compares fingerprints. It can tell a right password from a wrong one without ever holding the
right one.</p>
<p>One catch: ordinary hash functions like SHA-256 are built to be <i>fast</i>, and fast is exactly wrong
here. An attacker who steals the hashes runs billions of guesses a second against them. So passwords use
a <b>password hash</b> built to be deliberately slow and memory-hungry: <b>Argon2id</b> (first choice
today), <b>scrypt</b>, <b>bcrypt</b>, or <b>PBKDF2</b> where a library is not available. Slow is the
product: a single login taking 200 milliseconds is invisible to the user and turns an attacker's
six-hour job into six months.</p>

<h4>Salt: so two people with the same password get different hashes</h4>
<p>If the hash were the password alone, everyone who picked <code>summer2024</code> would have the same
fingerprint, and cracking one would crack them all. Worse, attackers precompute the hashes of common
passwords once (a <b>rainbow table</b>) and just look yours up.</p>
<p>A <b>salt</b> stops both. It is a random value, different for every user, mixed in before hashing. Now
the same password produces a different hash for every person, a stolen table is useless, and each password
must be attacked on its own. The salt is not a secret: it is stored right next to the hash, and a modern
password-hash library generates and embeds it for you.</p>

<h4>Pepper: one more layer, kept somewhere else</h4>
<p>A <b>pepper</b> is a single secret value mixed into every hash and, unlike the salt, kept <i>outside</i>
the database, in a secrets manager or a hardware security module (a locked box that holds keys and never
hands them out). If only the database leaks, the hashes cannot be cracked without the pepper the thief
did not get. It is not free: rotating a pepper is awkward, so it is reserved for high-value systems.
Salt is for everyone; pepper is a deliberate extra.</p>

<h4>At rest and in transit</h4>
<p>A credential is exposed in two situations, and each has its own defense.</p>
<ul>
<li><b>At rest</b>, sitting in storage. Passwords: store a salted, slow hash, never the password. Keys and
secrets you must reuse: encrypt them, and keep the encryption key in a secrets manager or HSM, not in the
same database and never in the source code. A secret committed to git is a leaked secret.</li>
<li><b>In transit</b>, moving across a network. Always over <b>TLS</b>, the encryption behind the padlock
in a browser, so nobody on the wire can read it. Never put a credential in a URL (URLs land in logs,
history and referrer headers); put it in a header or the request body. And send it only to the exact host
that should receive it.</li>
</ul>

<!--flow:idfcred-login-->
<h4>Step by step: one login, and where the secret is at each moment</h4>
<div class="flowDia"><svg viewBox="0 0 640 372" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Where a password travels during one login"><defs><marker id="idfcred-login-ah-front" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent)"/></marker><marker id="idfcred-login-ah-back" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent2)"/></marker><marker id="idfcred-login-ah-attack" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--bad)"/></marker><marker id="idfcred-login-ah-x" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--muted)"/></marker></defs><line x1="74" y1="54" x2="74" y2="346" class="fdLife"/><line x1="320" y1="54" x2="320" y2="346" class="fdLife"/><line x1="566" y1="54" x2="566" y2="346" class="fdLife"/><rect x="-21.4" y="8" width="190.8" height="46" rx="8" class="fdActor"/><text x="74" y="27" class="fdActorT">Browser</text><text x="74" y="42" class="fdActorS">the user types the password</text><rect x="240.6" y="8" width="158.8" height="46" rx="8" class="fdActor"/><text x="320" y="27" class="fdActorT">Your server</text><text x="320" y="42" class="fdActorS">verifies, never stores</text><rect x="470.6" y="8" width="190.8" height="46" rx="8" class="fdActor"/><text x="566" y="27" class="fdActorT">Database</text><text x="566" y="42" class="fdActorS">holds hashes, not passwords</text><line x1="77.0" y1="102" x2="315.0" y2="102" stroke="var(--accent)" class="fdArrow" marker-end="url(#idfcred-login-ah-front)"/><text x="197.0" y="93" class="fdLabel">POST /login over TLS: username + password</text><circle cx="89.0" cy="102" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="89.0" y="105.5" class="fdNumT" style="fill:var(--accent)">1</text><line x1="323.0" y1="136" x2="561.0" y2="136" stroke="var(--accent2)" class="fdArrow" marker-end="url(#idfcred-login-ah-back)"/><text x="443.0" y="127" class="fdLabel">read the stored salt and hash for this account</text><circle cx="335.0" cy="136" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="335.0" y="139.5" class="fdNumT" style="fill:var(--accent2)">2</text><line x1="563.0" y1="170" x2="325.0" y2="170" stroke="var(--accent2)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#idfcred-login-ah-back)"/><text x="443.0" y="161" class="fdLabel">salt, hash, cost parameters</text><circle cx="551.0" cy="170" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="551.0" y="173.5" class="fdNumT" style="fill:var(--accent2)">3</text><rect x="61.2" y="204.0" width="517.6" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="320.0" y="219.0" class="fdSelfT">hash(password + salt) with a slow function, compare in constant time</text><circle cx="61.2" cy="215.0" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="61.2" y="218.5" class="fdNumT" style="fill:var(--muted)">4</text><rect x="201.6" y="256.0" width="236.8" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="320.0" y="271.0" class="fdSelfT">wipe the password from memory</text><circle cx="201.6" cy="267.0" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="201.6" y="270.5" class="fdNumT" style="fill:var(--muted)">5</text><line x1="317.0" y1="308" x2="79.0" y2="308" stroke="var(--accent)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#idfcred-login-ah-front)"/><text x="197.0" y="299" class="fdLabel">Set-Cookie: sid=...; HttpOnly; Secure; SameSite=Lax</text><circle cx="305.0" cy="308" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="305.0" y="311.5" class="fdNumT" style="fill:var(--accent)">6</text><text x="320" y="358" class="fdNote">The password exists in plain text for one request, in one process, and is never written anywhere.</text></svg></div>
<ol class="fdSteps">
<li><b>Browser → Your server:</b> POST /login over TLS: username + password <i>(front channel)</i></li>
<li><b>Your server → Database:</b> read the stored salt and hash for this account <i>(back channel)</i></li>
<li><b>Database → Your server:</b> salt, hash, cost parameters <i>(back channel)</i></li>
<li><b>Your server:</b> hash(password + salt) with a slow function, compare in constant time</li>
<li><b>Your server:</b> wipe the password from memory</li>
<li><b>Your server → Browser:</b> Set-Cookie: sid=...; HttpOnly; Secure; SameSite=Lax <i>(front channel)</i></li>
</ol>

<p>Notice where the plain-text password actually exists: for the length of one request, inside one
server process, and nowhere else. It is checked against the stored hash and then wiped. It is never
written to disk, never logged, never stored. That is the whole discipline in one picture.</p>

<h4>Two more habits</h4>
<p>Compare hashes in <b>constant time</b>. A naive comparison returns the instant two bytes differ, and
the tiny timing difference leaks how much of a guess was right. Use a constant-time compare
(<code>MessageDigest.isEqual</code> in Java) that takes the same time whether the guess is close or wildly
wrong. And check new passwords against lists of known-breached passwords, because the most common attack
is not cracking your hashes, it is trying passwords already leaked from somewhere else.</p>`,
docs:[["OWASP Password Storage Cheat Sheet","https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html"],["NIST SP 800-63B (memorized secrets)","https://pages.nist.gov/800-63-3/sp800-63b.html"],["Argon2 (RFC 9106)","https://www.rfc-editor.org/rfc/rfc9106"]],
exs:[{title:'Store a password the right way',
prompt:"Write <code>CredentialStore</code> with three methods. <code>byte[] newSalt()</code>: a fresh random 16-byte salt. <code>String hash(char[] password, byte[] salt)</code>: a slow, salted hash using <code>PBKDF2WithHmacSHA256</code> (at least 200,000 iterations, 256-bit key), Base64-encoded. <code>boolean verify(char[] password, byte[] salt, String storedHash)</code>: true only if the password hashes to <code>storedHash</code>, compared in constant time. Never store or return the password itself.",
starter:`import java.security.*;
import java.util.*;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;

public class CredentialStore {
    // Return a fresh random 16-byte salt.
    static byte[] newSalt() {
        return null;
    }
    // Hash the password with PBKDF2WithHmacSHA256, the given salt, at least
    // 200000 iterations, 256-bit key. Return the key Base64-encoded.
    static String hash(char[] password, byte[] salt) {
        return null;
    }
    // Return true only if the password hashes (with the same salt) to storedHash.
    // Compare in constant time.
    static boolean verify(char[] password, byte[] salt, String storedHash) {
        return false;
    }
}`,
tests:[{"d":"salt comes from a secure random source","re":"new\\s+SecureRandom\\s*\\("},{"d":"uses a deliberately slow password hash (PBKDF2)","re":"PBKDF2WithHmacSHA256"},{"d":"runs the KDF over the salt","re":"new\\s+PBEKeySpec\\s*\\([^)]*salt"},{"d":"uses a high iteration count (>= 100000)","re":"(?:[1-9]\\d{5,}|\\d{3,}_\\d{3})"},{"d":"compares in constant time, not with equals()","re":"MessageDigest\\s*\\.\\s*isEqual\\s*\\("},{"d":"never returns the raw password","re":"return\\s+(?:new\\s+String\\s*\\()?\\s*password","not":true}],
behavior:"newSalt() returns 16 random bytes, different each call. hash(pw, salt) returns a Base64 string; the same password and salt always give the same string, a different salt gives a different one. verify(pw, salt, hash(pw, salt)) is true; verify with a wrong password or a different salt is false. The comparison in verify takes the same time whether the guess is close or completely wrong.",
hints:["newSalt(): make a <code>byte[16]</code> and fill it with <code>new SecureRandom().nextBytes(salt)</code>.","hash(): build a <code>PBEKeySpec(password, salt, ITERATIONS, 256)</code>, run it through <code>SecretKeyFactory.getInstance(\"PBKDF2WithHmacSHA256\")</code>, and Base64-encode the result.","verify(): hash the guess with the same salt, then compare with <code>MessageDigest.isEqual</code>, which does not stop early the way <code>equals</code> does."],
solution:`import java.security.*;
import java.util.*;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;

public class CredentialStore {
    static final int ITERATIONS = 600000;
    static final int KEY_BITS = 256;

    static byte[] newSalt() {
        byte[] salt = new byte[16];
        new SecureRandom().nextBytes(salt);
        return salt;
    }

    static String hash(char[] password, byte[] salt) {
        try {
            PBEKeySpec spec = new PBEKeySpec(password, salt, ITERATIONS, KEY_BITS);
            byte[] key = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256")
                             .generateSecret(spec).getEncoded();
            spec.clearPassword();
            return Base64.getEncoder().encodeToString(key);
        } catch (Exception e) {
            throw new IllegalStateException("PBKDF2 unavailable", e);
        }
    }

    static boolean verify(char[] password, byte[] salt, String storedHash) {
        byte[] a = Base64.getDecoder().decode(hash(password, salt));
        byte[] b = Base64.getDecoder().decode(storedHash);
        return MessageDigest.isEqual(a, b);
    }
}`}]},
{id:'idftok',title:'What a token actually is (and how it differs from a JWT)',body:`



<p>Every lesson from here on says <b>token</b>. This one covers what a token physically <i>is</i>: what it
looks like on the wire, who makes it, what's inside, and how the receiver decides to believe it.</p>

<h4>The one-sentence definition</h4>
<p>A token is <b>a string that stands for a verified fact, issued by an authority, that the holder
presents later instead of proving themselves again</b>.</p>
<p>You prove who you are <i>once</i> (password, passkey, MFA) and in exchange you get a small piece of
text. <b>MFA</b> is multi-factor authentication: proving who you are with two different kinds of
evidence, usually something you know (a password) plus something you have (a phone or a security key).
A stolen password alone is then not enough. A cinema ticket: you paid at the desk (authentication), you got a stub (the token), and the usher
checks the stub, not your credit card. The stub is worth something because the usher trusts whoever
printed it.</p>

<h4>Opaque vs structured</h4>
<p>There are two ways to build a token.</p>
<ul>
<li><b>Opaque (reference) token.</b> A long random string with <i>no meaning</i>: a lookup key, a
claim-check ticket. The issuer keeps the real data in its own database and gave you the row id. To
learn anything about it, ask the issuer. Nothing leaks, and deleting the row revokes it instantly. The
cost is a network call on every check.</li>
<li><b>Structured (self-contained / value) token.</b> The data <i>travels inside the token</i>, with a
cryptographic signature wrapped around it. Anyone holding the issuer's public key can read it and
confirm nobody edited it: no database, no network call. The cost is that anyone who gets it can read
it, and it stays valid until it expires, because there's nothing central to delete.</li>
</ul>

<h4>What they look like</h4>
<div class="codeSample" data-hl>// 1. OPAQUE, random bytes, base64/hex. Means nothing. Must be looked up.
2YotnFZFEjr1zCsicMWpAA

// 2. JWT (JSON Web Token), three base64url chunks joined by dots
eyJhbGciOiJSUzI1NiIsImtpZCI6ImsxIn0.eyJzdWIiOiJhbGljZSIsImV4cCI6MTc2NzIyNTYwMH0.SflKxwRJSMeKKF2QT4f

// 3. SAML assertion, the same idea, but signed XML (much larger)
&lt;saml:Assertion&gt;&lt;saml:Subject&gt;alice&lt;/saml:Subject&gt;&lt;ds:Signature&gt;...&lt;/ds:Signature&gt;&lt;/saml:Assertion&gt;

// 4. Session cookie id, an opaque token that happens to ride in a cookie
Cookie: session=8f3a91c07b2e4d15

// 5. API key, a long-lived opaque token identifying an application, not a person
X-Api-Key: sk_live_51H7qYbK9mNp2</div>
<p>#1 and #4 are <b>the same kind of token</b>, differing only in which HTTP header carries it. #2 and
#3 are the same kind of token, differing only in JSON vs XML. <b>SAML</b> is Security Assertion Markup
Language: the older, XML-based standard for single sign-on between companies. The identity provider
sends the application a signed XML document, an assertion, saying who the user is. Format and transport
are separate questions from what the token is.</p>

<h4>Inside a JWT</h4>
<p>A <b>JWT</b>, a JSON Web Token, is the dominant structured format, so learn to read one on sight. Three parts, joined by dots,
each <b>base64url</b>-encoded. Base64url is base64 with <code>+/</code> swapped for <code>-_</code> and
the <code>=</code> padding dropped, so it survives being put in a URL:</p>
<div class="codeSample" data-hl>header . payload . signature

// header, what algorithm signed this, and which key
{"alg":"RS256","kid":"k1","typ":"JWT"}

// payload, the "claims", just a JSON object of facts
{"iss":"https://idp.example.com",  // issuer: who minted it
 "sub":"alice",                    // subject: who it is about
 "aud":"orders-api",               // audience: who it is FOR
 "exp":1767225600,                 // expires at (unix seconds)
 "iat":1767222000,                 // issued at
 "scope":"orders:read"}            // what it permits

// signature, issuer signs base64url(header) + "." + base64url(payload)</div>
<p><b>Base64url is encoding, not encryption.</b> Anyone who intercepts the token can paste the middle
chunk into a decoder and read every claim. The signature stops <i>tampering</i>, not <i>reading</i>.
Never put a password, a national id, or anything private in a JWT payload. If the contents must be
hidden, that's a different format, <b>JWE</b>, which encrypts rather than signs. JWE is JSON Web
Encryption, the second shape a JWT can take: instead of signed so it can be read by anyone and forged by
no one, it's encrypted so only the intended recipient can read it.</p>

<h4>How one is created</h4>
<p>Minting a structured token is four steps:</p>
<ol>
<li>The issuer authenticates the user and decides what's true about them.</li>
<li>It writes those facts as a JSON <b>claims</b> object and base64url-encodes it, along with a header
naming the algorithm.</li>
<li>It <b>signs</b> the joined string with a private key it alone holds, and appends the signature.</li>
<li>It hands the result to the client, which stores it and attaches it to later requests.</li>
</ol>

<h4>How one is interpreted</h4>
<p>Receiving a token isn't trusting it. A verifier must, in order:</p>
<ol>
<li><b>Check the signature</b> against the issuer's public key, fetched from the issuer's <b>JWKS</b>
endpoint and matched by the <code>kid</code> in the header. JWKS is the JSON Web Key Set: the issuer's
public keys written as JSON and published at a well-known URL, so anyone can fetch them and check its
signatures. If this fails, stop.</li>
<li><b>Pin the algorithm.</b> Decide in advance that you accept <code>RS256</code> and reject whatever
else the header asks for. A verifier that obeys the token's own <code>alg</code> field can be handed
<code>alg:none</code> and talked out of checking at all.</li>
<li><b>Check <code>iss</code></b>: is this from the issuer I trust?</li>
<li><b>Check <code>aud</code></b>: is this token meant for <i>me</i>? A valid token for a different
API is not a valid token for yours. Skipping this is how a token gets replayed across services.</li>
<li><b>Check <code>exp</code></b> (and <code>nbf</code> if present) against the clock.</li>
<li><i>Only then</i> read the claims and make an authorization decision.</li>
</ol>
<p>An <b>opaque</b> token has nothing to verify locally, so the verifier calls the issuer's
<b>introspection</b> endpoint (RFC 7662) instead, which answers <code>{"active":true,...}</code> plus
the same claims.</p>

<h4>Token <i>type</i> and token <i>format</i></h4>
<p>"Access token" is a <b>role</b>: a job the token does. "JWT" is a <b>format</b>: how the bytes are
arranged. They vary independently. An access token may be a JWT or may be opaque, and you can't tell
from the name.</p>
<div class="codeSample" data-hl>ROLES (what the token is FOR)          FORMATS (how it is BUILT)
  Access token   -> call an API         Opaque    -> random string + lookup
  ID token       -> describe the user   JWT/JWS   -> signed JSON, readable
  Refresh token  -> get a new access    JWE       -> encrypted JSON, unreadable
  Authz code     -> one-time, swap it   SAML      -> signed XML assertion
                                        PASETO    -> signed, no alg negotiation
                                        Macaroon  -> signed + narrowable by holder
                                        CWT       -> CBOR, tiny, for IoT
                                        Kerberos  -> encrypted ticket, intranet

// Any role can wear almost any format. The one near-universal rule:
// an OIDC ID token is ALWAYS a JWT, because the spec says so.</div>
<p>An <b>ID token</b> is proof of <i>who the user is</i>, meant for your app to read. It's not an API
key, and sending it to an API is a common bug. An <b>access token</b> is the opposite: meant for the
API. Your app should treat it as an opaque blob to forward, even when it happens to be a readable
JWT.</p>

<h4>Why not always JWT?</h4>
<p>JWTs won on tooling, not on merit. The scorecard:</p>
<ul>
<li><b>Revocation.</b> A structured token can't be un-issued. Log a user out and their JWT keeps
working until <code>exp</code>. The industry's answer is short lifetimes (5&ndash;15 minutes) plus a
refresh token, a longer-lived token used only to get a new short-lived one without logging in again.
That's a patch, not a fix.</li>
<li><b>Size.</b> A JWT is often 800&ndash;2000 bytes on every request. An opaque token is ~30. SAML
assertions are larger still, which is why they ride in POST bodies rather than URLs.</li>
<li><b>Crypto agility.</b> The <code>alg</code> header was a design mistake: it let attackers propose
the algorithm. <b>PASETO</b> exists to remove that choice. It's short for Platform-Agnostic Security
Tokens: a token format with no algorithm field at all, so the token can't tell the verifier how to check
it.</li>
<li><b>Privacy.</b> Readable by anyone who holds it, including the browser and any log that captured it.</li>
</ul>
<p><b>The rule of thumb:</b> structured tokens between <i>services</i>, where offline verification is
the point. Opaque tokens in <i>browsers</i>, where leakage is likely and instant revocation matters.
Many large providers do both, issuing an opaque token to the browser and swapping it for a JWT at the
API gateway.</p>

<h4>A note on cookies</h4>
<p>Shape 4 above mentions a cookie. <b>HTTP has no memory.</b> To the protocol, two requests from the
same browser are two strangers. A <b>cookie</b> is the fix: the server sends a small named value back
with a response, the browser stores it, and then attaches it <i>automatically</i> to every later request
to that site.</p>
<div class="codeSample" data-hl>// the server hands one out:
HTTP/1.1 200 OK
Set-Cookie: session=8f3a91c07b2e4d15; HttpOnly; Secure; SameSite=Lax

// and the browser sends it back, unprompted, on every later request:
GET /account
Cookie: session=8f3a91c07b2e4d15</div>
<p>That word <b>automatically</b> cuts both ways. It's what makes staying logged in effortless. It's
also why a cookie can be sent by a request the user didn't intend, which is the basis of <b>CSRF</b>,
cross-site request forgery. A malicious page makes your browser send a request to a site you're logged
into, and the site can't tell it wasn't you. The browser attaches your cookies automatically, which is
the whole problem. That is why cookies carry flags (<code>HttpOnly</code>, <code>Secure</code>, <code>SameSite</code>) that
constrain when the browser will attach them.</p>
<p><b>A cookie is a transport, not a kind of token.</b> What rides in it might be an opaque session id,
or a JWT, or anything else. The Sessions and Web Login stream takes cookies apart properly: flags,
CSRF, fixation and revocation.</p>

<h4>Two more words</h4>
<p><b>JWKS</b>: "JSON Web Key Set". When an issuer signs tokens with a private key, verifiers need the
matching <i>public</i> key. The issuer publishes it at a well-known URL: a small JSON document listing
its current public keys, each with a <code>kid</code> (key id) that the token's header names. A
verifier fetches it once, caches it, and re-fetches when it sees a <code>kid</code> it doesn't
recognize, which makes key rotation a non-event. The JOSE stream builds one. <b>JOSE</b> is JSON Object
Signing and Encryption: the family of specifications (JWS, JWE, JWK, JWA) that JWT is built from.</p>
<p><b>Refresh token</b>: an access token is short-lived so a leaked one expires quickly, but sending
the user back through login every few minutes is unacceptable. A refresh token is a second,
longer-lived credential whose only purpose is to obtain a fresh access token, silently, over a back
channel. That makes it <b>higher value than the thing it replaces</b>. The OAuth stream covers what
follows: rotation, reuse detection, and why a bare one in a browser is the worst credential in the
system.</p>`,
docs:[['RFC 7519 (JSON Web Token (JWT))','https://www.rfc-editor.org/rfc/rfc7519'],['RFC 6750 (Bearer Token Usage)','https://www.rfc-editor.org/rfc/rfc6750'],['RFC 7662 (OAuth 2.0 Token Introspection)','https://www.rfc-editor.org/rfc/rfc7662'],['RFC 9068 (JWT Profile for OAuth 2.0 Access Tokens)','https://www.rfc-editor.org/rfc/rfc9068'],['jwt.io (paste a JWT and see it decoded)','https://jwt.io/']],
exs:[
{title:'Read a JWT: split it and decode the claims',
prompt:`A JWT is three base64url chunks joined by dots. Write <code>TokenReader</code> with: <code>static String[] parts(String jwt)</code> returning the three pieces; return <code>null</code> if <code>jwt</code> is null or does not split into exactly 3 parts (use <code>split("\\\\.")</code>); and <code>static String claims(String jwt)</code> returning the <b>decoded payload</b> (the middle part) as a String, or <code>null</code> if <code>parts</code> returned null. Decode with <code>java.util.Base64.getUrlDecoder()</code>; note it is the <b>URL</b> decoder, because JWTs use base64url, not plain base64.`,
starter:`import java.util.Base64;

public class TokenReader {
    static String[] parts(String jwt) {
        return null;
    }
    static String claims(String jwt) {
        return null;
    }
}`,
tests:[{d:'splits on the literal dot separator',re:'split\\s*\\(\\s*"\\\\\\\\."'},{d:'rejects anything that is not exactly 3 parts',re:'length\\s*!=\\s*3|length\\s*==\\s*3'},{d:'null-safe on the input',re:'jwt\\s*==\\s*null|null\\s*==\\s*jwt'},{d:'uses the base64URL decoder, not the plain one',re:'getUrlDecoder\\s*\\(\\s*\\)'},{d:'decodes the middle part (index 1), not the header',re:'\\[\\s*1\\s*\\]'},{d:'turns the decoded bytes back into a String',re:'new\\s+String\\s*\\('}],
behavior:`parts("a.b.c") returns a 3-element array {"a","b","c"}. parts("a.b"), parts("a.b.c.d") and parts(null) all return null. claims of a JWT whose middle chunk is eyJzdWIiOiJhbGljZSJ9 returns the text {"sub":"alice"}. claims(null) returns null. Decoding never verifies anything: reading a token and trusting a token are separate steps.`,
hints:['<code>split(".")</code> silently returns nothing, because <code>.</code> is a regex wildcard. You need the escaped form <code>split("\\\\.")</code>.','Guard first: <code>if (jwt == null) return null;</code> then split and <code>if (p.length != 3) return null;</code>','<code>byte[] b = Base64.getUrlDecoder().decode(p[1]); return new String(b);</code>. Index 1 is the payload; index 0 is the header.'],
solution:`import java.util.Base64;

public class TokenReader {
    static String[] parts(String jwt) {
        if (jwt == null) return null;
        String[] p = jwt.split("\\\\.");
        if (p.length != 3) return null;
        return p;
    }
    static String claims(String jwt) {
        String[] p = parts(jwt);
        if (p == null) return null;
        // base64URL, not plain base64: JWTs must survive being placed in a URL
        byte[] decoded = Base64.getUrlDecoder().decode(p[1]);
        return new String(decoded);
    }
}`},
{title:'Classify a token: opaque or structured?',
prompt:`Given only the string, you can tell the two families apart by shape. Write <code>TokenShape</code> with <code>static String classify(String token)</code> that returns <code>"none"</code> if <code>token</code> is null or empty; <code>"jwt"</code> if it splits into exactly 3 dot-separated parts; <code>"jwe"</code> if it splits into exactly 5; and <code>"opaque"</code> for anything else. Then write <code>static boolean needsIntrospection(String token)</code> returning <code>true</code> only when <code>classify</code> says <code>"opaque"</code>, because an opaque token carries no readable claims, so the only way to learn anything about it is to ask the issuer.`,
starter:`public class TokenShape {
    static String classify(String token) {
        return null;
    }
    static boolean needsIntrospection(String token) {
        return false;
    }
}`,
tests:[{d:'handles null and empty up front',re:'==\\s*null|isEmpty\\s*\\(\\s*\\)'},{d:'splits on the escaped dot',re:'split\\s*\\(\\s*"\\\\\\\\."'},{d:'recognizes the 3-part JWS compact form',re:'3'},{d:'recognizes the 5-part JWE compact form',re:'5'},{d:'falls through to opaque',re:'"opaque"'},{d:'introspection is driven by the classification',re:'"opaque"\\s*\\.\\s*equals|equals\\s*\\(\\s*"opaque"'}],
behavior:`classify("a.b.c") returns "jwt". classify("a.b.c.d.e") returns "jwe" (the JWE compact form has five parts). classify("2YotnFZFEjr1zCsicMWpAA") returns "opaque". classify(null) and classify("") return "none". needsIntrospection is true only for the opaque case: a JWT can be verified offline with the issuer public key, whereas an opaque token means nothing without a call to the issuer.`,
hints:['Guard first: <code>if (token == null || token.isEmpty()) return "none";</code>','<code>int n = token.split("\\\\.").length;</code> then return based on <code>n == 3</code> and <code>n == 5</code>.','<code>return "opaque".equals(classify(token));</code>, which reuses the method rather than repeating the shape logic.'],
solution:`public class TokenShape {
    static String classify(String token) {
        if (token == null || token.isEmpty()) return "none";
        int n = token.split("\\\\.").length;
        if (n == 3) return "jwt";   // JWS compact: header.payload.signature
        if (n == 5) return "jwe";   // JWE compact: adds encrypted key + IV + tag
        return "opaque";            // no structure to read: ask the issuer
    }
    static boolean needsIntrospection(String token) {
        // structured tokens verify offline; opaque ones must be looked up
        return "opaque".equals(classify(token));
    }
}`}]},

{id:'idfclaim',title:'Attributes, claims and assertions: the data model',body:`



<p>Identity systems spend most of their time moving facts about people from where they're stored to
where a decision is made. Three words describe those facts at three different moments. The system
doing most of the moving is the <b>IdP</b>, the identity provider: the system that holds the accounts and
does the actual logging in. It checks your password or passkey and then tells other applications who
you are.</p>

<h4>The three words</h4>
<ul>
<li><b>Attribute</b>: a fact <i>at rest</i>, stored in a directory. <code>department = Platform</code>
in a database row. Nobody has vouched for it yet.</li>
<li><b>Claim</b>: a fact <i>in transit</i>, asserted by someone. When the IdP puts
<code>"department":"Platform"</code> into a token, it becomes a claim: a statement by a specific
issuer, worth as much as your trust in that issuer.</li>
<li><b>Assertion</b>: a <i>signed bundle</i> of claims about a subject, issued at a point in time. A
SAML assertion is literally called that. An OIDC ID token is the same concept as a JWT.</li>
</ul>
<p>Those three names deserve a line each. <b>SAML</b> is Security Assertion Markup Language: the older,
XML-based standard for single sign-on between companies. The identity provider sends the application a
signed XML document, an assertion, saying who the user is. <b>OIDC</b> is OpenID Connect: a thin layer
on top of OAuth that adds the missing piece, a signed statement of who logged in, called an ID token.
OAuth answers "what may this app do"; OIDC answers "who is this person". A <b>JWT</b> is a JSON Web
Token: a small signed document, three base64 pieces separated by dots, that carries claims such as who
the user is and when the token expires. Anyone can read it; only the issuer can produce a valid
signature.</p>
<p>The pipeline: <b>attribute</b> (stored) &rarr; selected and asserted as a <b>claim</b> &rarr;
packaged and signed into an <b>assertion</b> &rarr; carried inside a <b>token</b>. The token is the
envelope. The claims are the letter.</p>

<h4>Registered claims</h4>
<p>A handful of claim names are standardized. They describe the <i>envelope</i>, not the person:</p>
<div class="codeSample" data-hl>iss  issuer      who asserted this          "https://idp.example.com"
sub  subject    who it is about            "u-4817"      <- the identifier
aud  audience   who it is FOR              "orders-api"
exp  expires    after this, worthless      1767225600
iat  issued at  when it was minted         1767222000
nbf  not before don't accept it before     1767222000
jti  token id   unique, for replay defense "b7c1-...-9f"

// everything else is up to the issuer; these are about the person:
"email":"ada@corp.example", "department":"Platform", "groups":["platform","oncall"]</div>
<p><b><code>sub</code> is the only claim you should treat as the identity.</b> Email addresses get
reassigned and names change. A good <code>sub</code> is an immutable, issuer-scoped identifier. Keying
user records on email is a bug that surfaces years later.</p>

<h4>Attribute release and mapping</h4>
<p>An IdP knows far more about a person than any one app should receive. <b>Attribute release</b> is the
per-app policy deciding which attributes become claims: an expense tool gets <code>department</code>
and <code>manager</code>, a public forum only a nickname. That's data minimization. In a consumer
context it's what a consent screen approves.</p>
<p>Everyone names things differently. The directory says <code>sAMAccountName</code>, SAML sends
<code>urn:oid:0.9.2342...</code>, OIDC says <code>preferred_username</code>, and your app wants
<code>username</code>. <b>Attribute mapping</b> is the translation table. Mismatched mappings are the
most common cause of a federation that authenticates fine but creates broken user records.</p>

<h4>Why "claim" is the right word</h4>
<p>A claim carries no authority on its own. Its weight comes from <i>who</i> asserted it
(<code>iss</code>), whether the signature proves they did, and whether you'd already decided to trust
that issuer for that kind of fact. An IdP asserting <code>"department":"Finance"</code> is
authoritative if it owns HR data, and is only repeating something if it doesn't.</p>
<p>The habit: <b>never trust a claim you didn't verify the signature on, and never trust an issuer for
facts it has no authority over.</b> A token from a valid issuer claiming <code>"role":"admin"</code>
means nothing if roles are your application's concept.</p>`,
docs:[['RFC 7519 §4 (JWT registered claim names)','https://www.rfc-editor.org/rfc/rfc7519#section-4'],['OpenID Connect Core (Standard Claims)','https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims'],['IANA (JSON Web Token Claims registry)','https://www.iana.org/assignments/jwt/jwt.xhtml']],
ex:{title:'Claim checks: registered vs custom, and the identity key',
prompt:`Write <code>Claims</code> with three methods. <code>static boolean isRegistered(String name)</code> returns <code>true</code> for the standard envelope claims <code>iss</code>, <code>sub</code>, <code>aud</code>, <code>exp</code>, <code>iat</code>, <code>nbf</code>, <code>jti</code> and <code>false</code> otherwise (including <code>null</code>); use <code>java.util.Set.of(...)</code> and <code>contains</code>. <code>static String identityKey()</code> returns the one claim you should key user records on. <code>static boolean expired(long exp, long now)</code> returns <code>true</code> when the token is no longer valid, remembering <code>exp</code> is an <b>expiry instant</b>, so a token is expired once <code>now</code> has reached it.`,
starter:`import java.util.Set;

public class Claims {
    static final Set<String> REGISTERED = Set.of();

    static boolean isRegistered(String name) {
        return false;
    }
    static String identityKey() {
        return null;
    }
    static boolean expired(long exp, long now) {
        return false;
    }
}`,
tests:[{d:'declares the registered set with Set.of',re:'Set\\s*\\.\\s*of\\s*\\('},{d:'includes the issuer claim',re:'"iss"'},{d:'includes the audience claim',re:'"aud"'},{d:'includes the token id claim',re:'"jti"'},{d:'membership test uses contains',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:contains\\s*\\())|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:contains\\s*\\()[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:contains\\s*\\()[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:contains\\s*\\()[^{]*?return\\s+\\k<av>\\b)'},{d:'keys identity on sub, not email',re:'return\\s+"sub"'},{d:'expiry compares now against exp',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:now\\s*>=\\s*exp|exp\\s*<=\\s*now))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:now\\s*>=\\s*exp|exp\\s*<=\\s*now)[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:now\\s*>=\\s*exp|exp\\s*<=\\s*now)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:now\\s*>=\\s*exp|exp\\s*<=\\s*now)[^{]*?return\\s+\\k<av>\\b)'}],
behavior:`isRegistered("iss") and isRegistered("jti") are true. isRegistered("department") and isRegistered(null) are false: a custom claim is anything the issuer invents. identityKey() returns "sub": it is immutable and issuer-scoped, whereas email and preferred_username can be reassigned to a different person. expired(100, 100) and expired(100, 101) are true; expired(100, 99) is false.`,
hints:['<code>Set.of("iss","sub","aud","exp","iat","nbf","jti")</code>: the seven registered claims.','<code>Set.of(...).contains(null)</code> throws, so guard: <code>return name != null &amp;&amp; REGISTERED.contains(name);</code>','A token is dead the instant the clock reaches <code>exp</code>: <code>return now &gt;= exp;</code>'],
solution:`import java.util.Set;

public class Claims {
    static final Set<String> REGISTERED = Set.of("iss", "sub", "aud", "exp", "iat", "nbf", "jti");

    static boolean isRegistered(String name) {
        // Set.of is null-hostile, so check before asking
        return name != null && REGISTERED.contains(name);
    }
    static String identityKey() {
        // sub is immutable and issuer-scoped; email can be reassigned
        return "sub";
    }
    static boolean expired(long exp, long now) {
        return now >= exp;
    }
}`}},

{id:'idfsig',title:"How a token is trusted: signatures",
body:`
<p>A token like a JWT is just text, and anyone holding it can read every claim inside. So what stops a
person from changing <code>"sub": "u-4817"</code> to someone else's id, or flipping
<code>"role": "user"</code> to <code>"admin"</code>, and handing it back? Nothing, until the token is
<b>signed</b>. The signature is the whole reason a server can trust a token it did not create.</p>

<h4>The problem it solves</h4>
<p>An access token travels through the client, which you do not control. The client can read it and can
try to rewrite it. The server that receives it needs two guarantees: that the claims have not been
changed since they were issued (<b>integrity</b>), and that they were issued by a system it trusts
(<b>authenticity</b>). A signature gives both. Without one, a token is a note written in pencil that
anyone along the way can erase and rewrite.</p>

<h4>How it works</h4>
<p>A <b>signature</b> is a value computed from the token's contents plus a key. Change one character of
the contents and the signature no longer matches, so tampering is detected. There are two families, and
the difference decides who can forge a token.</p>
<ul>
<li><b>Asymmetric (RS256, ES256).</b> The issuer signs with a <b>private key</b> it never shares. Anyone
can verify with the matching <b>public key</b>, which the issuer publishes. A verifier can check tokens
but cannot make them. This is what you want for a token one system issues and others accept.</li>
<li><b>Symmetric (HS256).</b> One shared secret both signs and verifies. Whoever can check a token can
also forge one, so this only fits inside a single service that signs tokens for itself.</li>
</ul>
<p>The verifier needs the issuer's public key. It fetches it once from a published list of keys, the
<b>JWKS</b>, at a well-known URL, and caches it. Each key has an id, the <code>kid</code>, named in the
token's header, so the issuer can rotate keys without every verifier changing anything.</p>

<!--flow:idfsig-verify-->
<h4>Step by step: sign once, verify anywhere</h4>
<div class="flowDia"><svg viewBox="0 0 640 356" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Signing and verifying a token"><defs><marker id="idfsig-verify-ah-front" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent)"/></marker><marker id="idfsig-verify-ah-back" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent2)"/></marker><marker id="idfsig-verify-ah-attack" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--bad)"/></marker><marker id="idfsig-verify-ah-x" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--muted)"/></marker></defs><line x1="74" y1="54" x2="74" y2="330" class="fdLife"/><line x1="320" y1="54" x2="320" y2="330" class="fdLife"/><line x1="566" y1="54" x2="566" y2="330" class="fdLife"/><rect x="-2.2" y="8" width="152.4" height="46" rx="8" class="fdActor"/><text x="74" y="27" class="fdActorT">Issuer</text><text x="74" y="42" class="fdActorS">holds the private key</text><rect x="256.6" y="8" width="126.8" height="46" rx="8" class="fdActor"/><text x="320" y="27" class="fdActorT">Client</text><text x="320" y="42" class="fdActorS">carries the token</text><rect x="477.0" y="8" width="178.0" height="46" rx="8" class="fdActor"/><text x="566" y="27" class="fdActorT">API</text><text x="566" y="42" class="fdActorS">holds only the public key</text><rect x="14.0" y="102.0" width="366.4" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="197.2" y="117.0" class="fdSelfT">signature = sign(header + payload, PRIVATE key)</text><circle cx="14.0" cy="113.0" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="14.0" y="116.5" class="fdNumT" style="fill:var(--muted)">1</text><line x1="77.0" y1="154" x2="315.0" y2="154" stroke="var(--accent2)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#idfsig-verify-ah-back)"/><text x="197.0" y="145" class="fdLabel">token = header.payload.signature</text><circle cx="89.0" cy="154" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="89.0" y="157.5" class="fdNumT" style="fill:var(--accent2)">2</text><line x1="323.0" y1="188" x2="561.0" y2="188" stroke="var(--accent)" class="fdArrow" marker-end="url(#idfsig-verify-ah-front)"/><text x="443.0" y="179" class="fdLabel">request with the token</text><circle cx="335.0" cy="188" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="335.0" y="191.5" class="fdNumT" style="fill:var(--accent)">3</text><rect x="180.4" y="222.0" width="445.6" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="403.2" y="237.0" class="fdSelfT">recompute over header + payload, check with the PUBLIC key</text><circle cx="180.4" cy="233.0" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="180.4" y="236.5" class="fdNumT" style="fill:var(--muted)">4</text><rect x="137.2" y="274.0" width="488.8" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="381.6" y="289.0" class="fdSelfT">signature valid? then trust the claims. also check iss, aud, exp</text><circle cx="137.2" cy="285.0" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="137.2" y="288.5" class="fdNumT" style="fill:var(--muted)">5</text><text x="320" y="342" class="fdNote">The API never contacts the issuer. The public key, fetched once, is enough to trust the token.</text></svg></div>
<ol class="fdSteps">
<li><b>Issuer:</b> signature = sign(header + payload, PRIVATE key)</li>
<li><b>Issuer → Client:</b> token = header.payload.signature <i>(back channel)</i></li>
<li><b>Client → API:</b> request with the token <i>(front channel)</i></li>
<li><b>API:</b> recompute over header + payload, check with the PUBLIC key</li>
<li><b>API:</b> signature valid? then trust the claims. also check iss, aud, exp</li>
</ol>

<h4>How it is used, and the ways it goes wrong</h4>
<p>Verifying a signature is necessary but not sufficient. A correctly signed token can still be the wrong
token. Three checks travel with every signature check: the token was signed by the issuer you expect
(<code>iss</code>), it was meant for you (<code>aud</code>), and it has not expired (<code>exp</code>).
Two classic failures are worth naming. <b>Algorithm confusion</b>: a token arrives with its header set to
<code>alg: none</code>, or switched from RS256 to HS256 so the public key is treated as an HMAC secret; a
verifier that trusts the header instead of its own configured algorithm accepts a forgery. Always pin the
algorithm you expect. And <b>skipping verification</b>: decoding a JWT to read its claims without checking
the signature at all, which is the same as trusting whatever the client typed. Reading is not verifying.</p>
<p>The signature is where a token stops being a claim and becomes proof. The mechanics, the key formats,
and a hands-on tamper-and-watch-it-fail exercise are in the <b>OAuth, JWT &amp; JOSE</b> stream; this
lesson is the idea the rest of that stream is built on.</p>`,
docs:[["JWT (RFC 7519)","https://www.rfc-editor.org/rfc/rfc7519"],["JWS (RFC 7515)","https://www.rfc-editor.org/rfc/rfc7515"],["OWASP JWT Cheat Sheet","https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html"]]},
{id:'idfpair',title:'Pairwise identifiers: the same person, different names',body:`



<p>Every application you sign into with the same identity provider receives an identifier for you. If they
all receive the <b>same</b> one, any two of them can compare notes and discover they're talking about
the same person, without asking you.</p>

<h4>The problem</h4>
<p>Suppose a fertility clinic, a job board and a debt advice service all use the same social login. Each
receives <code>sub = 7c9e6679-...</code>. None of them knows who you are. But if two of them share data
(an advertising network, a data broker, a breach), the shared identifier <b>joins the two records</b>
and reveals something neither held alone.</p>
<p>This is <b>correlation</b>, a privacy failure rather than a security one. Nothing was stolen. The
identifier did what it was designed to do.</p>

<h4>Public versus pairwise</h4>
<div class="codeSample" data-hl>PUBLIC       every relying party gets the SAME sub for this user.
  app A  ->  sub = 7c9e6679-7425-40de-944b-e07fc1f90ae7
  app B  ->  sub = 7c9e6679-7425-40de-944b-e07fc1f90ae7
             ^ identical. A and B can join their records.

PAIRWISE     each relying party gets a DIFFERENT sub for the same user.
  app A  ->  sub = 2f4c...   derived from (user, A's sector, a salt)
  app B  ->  sub = 9ab1...   derived from (user, B's sector, the salt)
             ^ unlinkable without the IdP's salt.

// the derivation is deterministic, so app A sees the SAME 2f4c...
// every time you return - the identifier is still stable, just local.</div>

<h4>Sector identifiers</h4>
<p>Derive pairwise per <i>client</i> and an organization running five applications gets five
identifiers for one user. Now <i>they</i> can't recognize their own customer across their own
products. That's the opposite problem.</p>
<p>A <b>sector identifier</b> is the grouping key. Clients that declare the same sector receive the
same pairwise <code>sub</code> as each other, and a different one from everyone else. The sector is
proved by hosting a JSON file listing the redirect URIs that belong to it, so a client can't claim
somebody else's sector and inherit their identifiers. A <b>redirect URI</b> is the address the login
sends the browser back to, with the result attached, so the list of them is a good proxy for "which
applications are really mine."</p>
<div class="codeSample" data-hl>subject_type = pairwise
sector_identifier_uri = https://example.com/redirect_uris.json
   // that file lists every redirect URI in the sector, and the IdP
   // checks each client's registered URI appears in it.

sub = hash(sector_identifier + local_user_id + salt)

// same sector  -> same sub  (one company recognizes its own user)
// other sector -> different sub  (nobody else can join to it)</div>

<h4>What it costs</h4>
<p><b>Support gets harder.</b> "My ID is 2f4c..." means nothing outside that one application, and
correlating a complaint across systems now needs the IdP.</p>
<p><b>Migration is awkward.</b> Switching an existing integration from public to pairwise changes every
identifier at once. Every account is orphaned unless you run a mapping table through the transition.</p>
<p><b>It's wrong inside one trust boundary.</b> Workforce identity <i>wants</i> correlation: HR, payroll
and the helpdesk are supposed to be talking about the same employee. Pairwise is a <b>CIAM</b> tool.
That's customer identity and access management: identity for customers rather than employees, with
sign-up forms, "log in with Google", and millions of accounts nobody pre-registered. This is the
CIAM-versus-workforce distinction from earlier in this stream showing up as a technical default.</p>

<h4>The rule</h4>
<p><b>Public for workforce and for applications you control. Pairwise for consumer identity, and
wherever the mere fact of using a service is sensitive</b>: health, finance, legal, employment. Sign in
with Apple made the strong version of this famous by also offering a relay email address, extending the
idea from the identifier to the contact detail.</p>
<p>One caveat. Pairwise stops correlation <i>by identifier</i>. It does nothing about an email address, a
phone number or a device fingerprint shared between the same two parties.</p>`,
docs:[['OIDC Core (pairwise subject identifiers)','https://openid.net/specs/openid-connect-core-1_0.html#PairwiseAlg'],['OIDC Core (sector identifier)','https://openid.net/specs/openid-connect-registration-1_0.html#SectorIdentifierValidation'],['NIST SP 800-63C (federation and privacy)','https://pages.nist.gov/800-63-3/sp800-63c.html']],
ex:{title:'Public or pairwise?',lang:'js',
run:{call:'subjectType',cases:[
 {name:'a consumer health app',args:['consumer','health',false],expect:'pairwise'},
 {name:'a consumer shopping app',args:['consumer','retail',false],expect:'pairwise'},
 {name:'internal HR tooling',args:['workforce','hr',false],expect:'public'},
 {name:'workforce, even for sensitive data',args:['workforce','health',false],expect:'public'},
 {name:'consumer apps inside one company share a sector',args:['consumer','retail',true],expect:'pairwise-same-sector'},
 {name:'workforce is unaffected by the sector flag',args:['workforce','hr',true],expect:'public'}]},
prompt:`Write <code>function subjectType(population, domain, sameOrganization)</code>. Workforce always returns <code>"public"</code>: correlation across internal systems is the point. Consumer returns <code>"pairwise-same-sector"</code> when the applications belong to one organization, and <code>"pairwise"</code> otherwise.`,
starter:`function subjectType(population, domain, sameOrganization) {
  return null;
}`,
solution:`function subjectType(population, domain, sameOrganization) {
  if (population === "workforce") return "public";   // checked FIRST
  return sameOrganization ? "pairwise-same-sector" : "pairwise";
}`,
tests:[{d:'workforce is always public',re:'(?:case\\s*["\']workforce["\']|population\\s*===?\\s*["\']workforce["\']|["\']workforce["\']\\s*===?\\s*population|["\']workforce["\']\\s*\\.\\s*equals|equals\\s*\\(\\s*["\']workforce["\'])[^;}]*?(?:return\\s+|->\\s*)["\']public["\']'},{d:'a shared sector groups an organization',re:'sameOrganization\\s*\\?\\s*["\']pairwise-same-sector["\']|!\\s*sameOrganization\\s*\\?\\s*["\']pairwise["\']\\s*:\\s*["\']pairwise-same-sector["\']|if\\s*\\(\\s*sameOrganization\\s*\\)\\s*\\{?\\s*return\\s+["\']pairwise-same-sector["\']|if\\s*\\(\\s*!\\s*sameOrganization\\s*\\)\\s*\\{?\\s*return\\s+["\']pairwise["\'][^{]*?return\\s+["\']pairwise-same-sector["\']'},{d:'consumer defaults to pairwise',re:'"pairwise"'}],
behavior:`Six cases execute, and the fourth is the one that pins the ordering: workforce identity stays public even when the data is sensitive, because HR, payroll and the helpdesk are supposed to be able to recognize the same employee. Checking the domain before the population would get that backwards. The sector flag exists so one company's five consumer apps still recognize their own customer while remaining unlinkable to anyone else.`,
hints:['Population is the stronger condition; check it before anything else.','Workforce wants correlation; consumer identity wants to prevent it.','The sector groups applications that belong to the same organization.']}},

{id:'idf2',title:'How identity is carried: sessions vs tokens',body:`



<p>You know what a token <i>is</i> and what claims travel inside it. The remaining question is
architectural: once you're authenticated, how does the <i>next</i> request prove it's still you? There
are two answers, and the choice shapes scaling, logout and revocation.</p>
<ul>
<li><b>Server-side sessions (stateful).</b> The server stores your login in memory/DB and hands you a <b>session cookie</b> holding only an opaque id. Every request sends the cookie and the server looks it up. Simple and easy to revoke, but the server must remember every session (state), which is awkward across many servers.</li>
<li><b>Tokens (stateless).</b> The server hands you a signed <b>token</b> (often a JWT) that <i>contains</i> the claims. A <b>JWT</b> is a JSON Web Token: a small signed document, three base64 pieces separated by dots, that carries claims such as who the user is and when the token expires. Anyone can read it; only the issuer can produce a valid signature. Later requests send it in the <code>Authorization: Bearer &lt;token&gt;</code> header. Any server verifies the signature and trusts the contents without a lookup. Scales horizontally, but revocation is harder: the token is valid until it expires.</li>
</ul>
<p>Two more terms you'll see everywhere:</p>
<ul>
<li><b>Bearer token</b>: "whoever <i>bears</i> (holds) it can use it," like cash. So it must be sent over TLS and kept secret. Sender-constrained tokens (lesson 6) remove this risk.</li>
<li><b>Front channel vs back channel.</b> The <b>front channel</b> goes through the user's browser (redirects, URL parameters). The user can see it, so never put secrets there. The <b>back channel</b> is a direct server-to-server call (the app's backend to the auth server): private, where secrets and tokens are exchanged. OAuth uses both (next stream).</li>
</ul>
<div class="codeSample" data-hl>// a token is presented on each request in the Authorization header
Authorization: Bearer eyJhbGciOiJSUzI1Ni␣...  (header.payload.signature)
// a session cookie instead carries only an opaque id the server looks up
Cookie: session=8f3a...   // meaningless without the server's session store</div>

<h4>The trade</h4>
<div class="codeSample" data-hl>SESSION (a reference)              TOKEN (self-contained)
server stores the state            the token IS the state
cookie holds only an id            the claims travel with the request
revoke = delete one row  INSTANT   revoke = hard. it verifies on its own.
every request does a lookup        no lookup: verify the signature
scales with a shared store         scales with no shared anything
opaque to the client               readable by anyone holding it (signed,
                                     not secret - never put secrets in one)</div>
<p><b>Sessions buy revocation and cost a lookup. Tokens buy statelessness and cost revocation.</b>
Everything else (refresh tokens, short lifetimes, denylists, introspection) softens whichever side you
chose.</p>
<p>The consequence people meet in production: you fire an employee at 09:00, disable the account, and
their access token keeps working until it expires. If that window is fifteen minutes, that's a decision
you made. If nobody knows what the window is, it's a decision that made itself.</p>

<h4>Which to use</h4>
<p><b>A session</b> when one server or one trust boundary owns the whole interaction: a traditional web
application, an admin console, a bank's internal tooling. Immediate revocation is worth the lookup, and
the cookie machinery (<code>HttpOnly</code>, <code>Secure</code>, <code>SameSite</code>) is mature.</p>
<p><b>A token</b> when the request crosses boundaries: a mobile app calling an API, a service calling
another service, a third party acting for your user. A session id means nothing to a system that doesn't
share your store. A signed token means something to anyone holding the issuer's public key.</p>
<p><b>Both, deliberately</b>, is the common real answer: a session cookie between the browser and your
own backend, and tokens from that backend outward. That's the <b>BFF</b> pattern, backend-for-frontend:
a small server that sits between the browser and the APIs and holds the tokens, so the browser only ever
has a cookie and never a token that JavaScript could steal. It exists so the browser never holds a token
at all.</p>

<h4>The word that causes the most confusion</h4>
<p>People say "token" for both, and a session id <i>is</i> a token in the loose sense: a string that
stands for your authenticated state. What matters is whether the value <b>carries</b> its meaning or
<b>refers</b> to it. That one question decides how it's revoked, what happens if it leaks, and whether
the issuer can be offline.</p>

<h4>Stateful and stateless</h4>
<p><b>Stateful</b> means <i>the server remembers something between requests.</i> It wrote something
down. <b>Stateless</b> means <i>it remembers nothing</i>. Every request has to carry whatever is needed
to handle it, because the server starts from scratch each time.</p>
<div class="codeSample" data-hl>STATEFUL, the doctor's surgery
  you give your name, and they pull your file. the file lives with THEM.
  they can add to it, correct it, or shred it at any moment.
  but the receptionist has to be able to REACH the filing cabinet.

STATELESS, the coffee shop loyalty card
  the card itself carries the nine stamps. nothing is written down at
  the shop. any branch can read it, with no filing cabinet anywhere.
  but if you claim a stamp was wrong, there is nothing to correct -
  and the shop cannot cancel your card once it is in your pocket.</div>

<h4>What each one costs</h4>
<p><b>Stateful costs a lookup and a shared place to look.</b> One server is easy. Ten servers behind a
load balancer must all reach the same store, so now Redis or a database sits in the request path of
every call. If it goes down, nobody is logged in anywhere.</p>
<p><b>Stateless costs the ability to change your mind.</b> Nothing to look up means nothing to delete.
The credential is valid because it verifies, not because anyone still agrees with it. Revoking it
early means reintroducing the shared store you were avoiding, just for the exceptions.</p>

<h4>Why sessions and tokens differ</h4>
<p>A session is the stateful choice and a self-contained token is the stateless one. Every difference in
the table above falls out of that:</p>
<div class="codeSample" data-hl>revocation   stateful wins.  there is a row; delete it.
scaling      stateless wins. no shared store to reach or to fail.
size         stateful wins.  a cookie holds an id, not a payload.
privacy      stateful wins.  an opaque id reveals nothing; a JWT is
                             readable by anyone holding it.
availability stateless wins. the issuer can be offline and calls still work.
freshness    stateful wins.  a stateless token carries the permissions it
                             had WHEN IT WAS MINTED, not the ones you have now.</div>
<p>That last row is the one people meet in production. Revoke someone's admin role at 09:00 and their
token keeps asserting it until 09:15. The token is a photograph of their permissions, not a window onto
them. Nothing is broken. That's what stateless means.</p>

<h4>The bottom line</h4>
<p><b>Neither is more secure.</b> They fail differently, and the choice is which failure you can live
with. Most real systems end up in the middle on purpose: short-lived stateless tokens so the staleness
window is small, plus a stateful denylist for the few credentials that must die immediately.</p>`,
docs:[['MDN, Authorization header','https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Authorization'],['RFC 6750, Bearer Token Usage','https://www.rfc-editor.org/rfc/rfc6750']],
ex:{title:'Bearer header: build and parse',
prompt:`Write <code>Bearer</code> with: <code>static String header(String token)</code> returning the header <b>value</b> <code>"Bearer " + token</code>; and <code>static String parse(String header)</code> that returns the token from a value like <code>"Bearer abc.def.ghi"</code>; return <code>null</code> if <code>header</code> is null or does not <code>startsWith("Bearer ")</code>, otherwise the substring after <code>"Bearer "</code>.`,
starter:`public class Bearer {
    static String header(String token) {
        return null;
    }
    static String parse(String header) {
        return null;
    }
}`,
tests:[{d:'builds the Bearer value',re:'"Bearer "\\s*\\+\\s*token'},{d:'guards the prefix with startsWith',re:'startsWith\\s*\\(\\s*"Bearer "\\s*\\)'},{d:'null-safety on the input',re:'==\\s*null|!=\\s*null|null\\s*=='},{d:'extracts the token after the prefix',re:'substring\\s*\\('}],
behavior:`header("t") returns "Bearer t". parse("Bearer t") returns "t"; parse("t") and parse(null) return null (a value without the scheme is not a valid bearer header).`,
hints:['<code>return "Bearer " + token;</code>','Guard first: <code>if (header == null || !header.startsWith("Bearer ")) return null;</code>','Then <code>return header.substring("Bearer ".length());</code>'],
solution:`public class Bearer {
    static String header(String token) {
        return "Bearer " + token;
    }
    static String parse(String header) {
        if (header == null || !header.startsWith("Bearer ")) return null;
        return header.substring("Bearer ".length());
    }
}`}},

{id:'idf2b',title:'Tokens in production: size, revocation lag, and when a session is the better answer',body:`



<p>The previous lesson gave you the architectural choice. This one is what that choice costs eighteen
months later, when the pager goes off at three in the morning.</p>

<h4>A JWT rides on every request</h4>
<p>A session cookie carries an opaque id: thirty-two bytes, and it never grows, because the id
<i>refers</i> to the state instead of containing it. A JWT contains the state. A <b>JWT</b> is a JSON
Web Token: a small signed document, three base64 pieces separated by dots, that carries claims such as
who the user is and when the token expires. Anyone can read it; only the issuer can produce a valid
signature. A modest payload
(issuer, subject, audience, expiry, issued-at, a scope string) is 400 to 800 bytes once signed and
encoded. Then someone adds <code>groups</code>, or <code>roles</code>, or <code>entitlements</code>, and
the token stops having a size and starts having a growth rate.</p>
<p>Two multipliers. Base64url costs four characters for
every three bytes, so the token on the wire is about a third larger than the JSON you're reading. And it
rides on <i>every</i> request: every API call, every image behind an authenticated route, every poll.
That's bandwidth on a mobile connection, bytes ahead of your response, and a copy in every line of every
access log.</p>
<div class="codeSample" data-hl>CLAIMS (the JSON you read)        ON THE WIRE (what you actually send)
sub, iss, aud, exp, iat, scope     ~156 B  ->   ~600 B   signed and encoded
  + 30 group DNs                  ~2976 B  ->  ~4360 B
  + 66 group DNs                  ~6329 B  ->  ~8815 B

// an RS256 signature is 256 bytes on its own, 342 once base64url has been
// applied, before a single claim. the payload you read is not what you send.</div>

<h4>Where it breaks, in the order you meet it</h4>
<div class="codeSample" data-hl>4 KB     one cookie. every browser enforces it. past the limit the
         browser DROPS the cookie, silently: no error, no console
         warning. the user is logged out at random and nobody can
         reproduce it.
8 KB     nginx, large_client_header_buffers, default "4 8k": a single
         header line has to fit in one 8k buffer.
8190 B   Apache, LimitRequestFieldSize.
16 KB    Node, --max-http-header-size. older releases defaulted to
         8 KB, and some of those are still running somewhere.
lower    load balancers, API gateways and serverless front ends often
         cap well below 8 KB, and rarely say so where you would look.</div>
<p>Past a header limit, the polite failure is <b>431 Request Header Fields Too Large</b>. The unkind one is a proxy that truncates the header and forwards it anyway. Your service
receives a JWT missing its last few hundred characters, fails the signature check, and answers with a
400 that says nothing about size. authlint (<code>/authlint/</code>) warns above 4 KB and calls anything
above 8 KB critical.</p>

<h4>It breaks for your longest-serving employees first</h4>
<p>Group membership accumulates and nothing removes it. Nobody is ever taken off the security group for
a project that ended in 2019. So token size tracks tenure, and the first people to cross a limit are the
longest-serving: in most organizations, the people with the most authority and the least appetite for a
mystery.</p>
<p>It passes every test, because the fixtures give the user three groups. It passes staging, because the
staging directory was copied before the last two reorganizations. Then it fails in production, on the
first day, for the VP of Engineering, as a login loop rather than an error anyone can search for.
authlint flags a <code>groups</code> array over forty entries on sight.</p>

<h4>Keeping the token small</h4>
<ul>
<li><b>Carry an identifier and a few claims, not a permission dump.</b> The resource server already has a
database, and a lookup gives an answer that's current rather than as old as the token.</li>
<li><b>Scopes rather than enumerated permissions.</b> <code>orders.write</code> is one claim that stands
for a hundred things. A hundred permission strings is a hundred strings on every request.</li>
<li><b>Filter <code>groups</code> to the ones the audience cares about.</b> The orders API has no use for
the payroll groups. Leaving them out is a smaller token and a smaller disclosure.</li>
<li><b>Split-token, or a BFF.</b> A <b>BFF</b> is a backend-for-frontend: a small server that sits
between the browser and the APIs and holds the tokens, so the browser only ever has a cookie and never a
token that JavaScript could steal. The browser holds an opaque token or a session cookie. The gateway
mints the JWT inward, short-lived and narrowed to one audience. The OAuth stream builds the pattern.</li>
</ul>
<p>Microsoft Entra hit this wall. Past a threshold the token stops
carrying the groups and carries <code>_claim_names</code> and <code>_claim_sources</code> instead, a
pointer to a Microsoft Graph endpoint your application has to call for the list. That's the <b>groups
overage</b> claim, and it turns an offline check into a network call.</p>

<h4>Stateless means you can't take it back</h4>
<p>Revocation lag is the token lifetime. It is not a separate tuning parameter.</p>
<div class="codeSample" data-hl>09:00  HR disables the account. the directory is now correct.
09:00  the access token minted at 08:31 is still signed, still
       unexpired, and still says role=admin. nothing consults
       the directory, because that was the entire point.
09:14  a production bucket is deleted. every request verified fine.
10:00  exp passes. NOW the token stops working.</div>
<p>Sixty-minute access tokens mean a sixty-minute window in which a disabled account stays authorized.
That can be defensible. Not knowing the number is not, and the number lives in whatever your identity
provider was configured with in 2021 rather than in your security policy.</p>

<h4>The logout that doesn't log out</h4>
<p>Clearing the cookie on logout deletes the client's copy of the token, not the token. The bytes are
still signed, still unexpired, and still accepted. Anyone who captured them (a shared machine, a proxy
log, an error report, a browser extension) holds a working credential until <code>exp</code>.</p>

<h4>Every fix reintroduces the state you were avoiding</h4>
<ul>
<li><b>A denylist.</b> Every verification now consults a shared store. That's the session lookup under a
different name, holding only the exceptions.</li>
<li><b>Introspection on every call.</b> Correct and current, at the cost of a network hop per request and
the authorization server sitting in the availability path of everything you run.</li>
<li><b>Short expiry plus refresh.</b> The refresh is a lookup at the token endpoint, so the state is still
there, moved off the hot path and consulted less often.</li>
<li><b>Continuous Access Evaluation.</b> The issuer pushes revocation events to resource servers, which
react in seconds instead of at expiry. It works, and it's a subscription, a delivery guarantee and a
piece of state. The Advanced OAuth and Threats stream gives it a lesson of its own.</li>
</ul>
<p>Teams adopt JWTs to avoid a lookup, discover they need revocation, and add the lookup back. At that
point, ask what the JWT is still buying. Sometimes the answer is real: offline verification between
services, an issuer that can be down for ten minutes without taking the estate with it. Sometimes nobody
has asked since the decision was made.</p>
<p>Shortening the lifetime doesn't escape the trade. Five-minute tokens cut the revocation window by a
factor of twelve and multiply traffic to your token endpoint by the same factor. That endpoint does
asymmetric crypto and a database write for every call.</p>

<h4>When a session is the better answer</h4>
<p>A <b>session</b> wins when all of these hold: one domain, a
backend you control, first-party clients only, and a logout that has to be immediate. A <b>token</b> wins
when any of these hold: cross-domain, several services that must verify without calling you, a
third-party client, or a mobile app against a public API.</p>
<div class="codeSample" data-hl>ONE DOMAIN, ONE BACKEND, YOUR OWN USERS  ->  session cookie
  32 bytes. never grows. revocable at any instant. HttpOnly, so
  script running in the page cannot read it.

MANY SERVICES / THIRD PARTIES / MOBILE  ->  token
  self-contained, verifiable by anyone holding the public key,
  and it costs you the ability to change your mind before exp.</div>
<p><b>"We used JWTs because they scale" is the most common piece of cargo-cult reasoning in this
field.</b> Most applications that reach for stateless never had a horizontal-scaling problem. They had
one server, or three behind a load balancer, and a session store nobody measured. A session lookup in
Redis is well under a millisecond, and it buys a logout that works and nothing readable if the cookie
leaks. Scaling is a real reason once you've measured it, not a default.</p>

<h4>The rest of the list</h4>
<ul>
<li><b>Clock skew.</b> An <code>iat</code> a few seconds in the future, or an <code>exp</code> a few
seconds past, gives intermittent 401s that reproduce on nothing and clear up by themselves. Sixty seconds
of leeway is the usual allowance, but fix time sync first. Widening the allowance to hide a drifting
clock turns a five-second problem into a five-minute one.</li>
<li><b>Caching the JWKS.</b> The <b>JWKS</b> is the JSON Web Key Set: the issuer's public keys written
as JSON and published at a well-known URL, so anyone can fetch them and check its signatures. Fetch it
per request and you've built a denial-of-service tool pointed at your own issuer. Cache it forever and
the next key rotation logs out everybody. Cache with a <b>TTL</b>, a time to live: how long the cached
copy is good for before it must be refreshed or thrown away. Refetch on an unrecognized
<code>kid</code>, and rate-limit that refetch, or an attacker sends junk kids and you fetch on their
behalf.</li>
<li><b>Rotation as a flag day.</b> Without a <code>kid</code>, no verifier can tell which key signed
what, so the only way to rotate is to swap everything at once and hope. A <code>kid</code> in the header
costs nothing and turns rotation into an ordinary Tuesday.</li>
<li><b>Tokens in URLs.</b> A token in a query string lands in browser history, in the
<code>Referer</code> header sent to the next site, in every proxy access log along the way, and in your
crash reporter's upload. A JWT payload is base64, not encryption, so personal data in a token is
personal data in every one of those places.</li>
<li><b>The <code>aud</code> you never checked.</b> If your service accepts any token from an issuer it
trusts, a token minted for a different service works against yours, and that service may have looser
rules about who gets one. Checking the audience is the one line that stops a valid token being valid everywhere.</li>
</ul>

<h4>The bottom line</h4>
<p>Token failures arrive late, hit your most senior people first, and don't name themselves. A cookie
that vanishes. A 400 with no explanation. A fired employee whose access lingers for an hour. A logout
that logs nobody out. Choose tokens when the shape of the system needs them, and a session when it
doesn't.</p>`,
docs:[['RFC 7519 (JSON Web Token)','https://www.rfc-editor.org/rfc/rfc7519'],['RFC 8725 (JWT Best Current Practices)','https://www.rfc-editor.org/rfc/rfc8725'],['RFC 9068 (JWT Profile for OAuth 2.0 Access Tokens)','https://www.rfc-editor.org/rfc/rfc9068'],['MDN, 431 Request Header Fields Too Large','https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/431'],['Microsoft Entra, access token claims (the groups overage claim)','https://learn.microsoft.com/en-us/entra/identity-platform/access-token-claims-reference'],['nginx, large_client_header_buffers','https://nginx.org/en/docs/http/ngx_http_core_module.html#large_client_header_buffers']],
exs:[{title:'Will this token fit?',lang:'js',diff:'medium',
run:{call:'tokenFit',cases:[
 {name:'a lean token: subject, audience, expiry, one scope',args:[{iss:'https://login.example.com/',sub:'ada.lovelace',aud:'api://orders',iat:1767222000,exp:1767225600,name:'Ada Lovelace',scope:'orders.read'}],expect:{bytes:600,fitsCookie:true,fitsHeader:true,bytesWithoutGroups:600,fitsCookieWithoutGroups:true}},
 {name:'thirty group memberships: past the cookie, inside the header',args:[{iss:'https://login.example.com/',sub:'ada.lovelace',aud:'api://orders',iat:1767222000,exp:1767225600,name:'Ada Lovelace',scope:'orders.read',groups:[
   'CN=SG-APP-Payments-Approvers-EMEA-Tier1,OU=Security Groups,OU=EMEA,DC=corp,DC=example,DC=com','CN=SG-APP-Billing-Approvers-AMER-Tier2,OU=Security Groups,OU=AMER,DC=corp,DC=example,DC=com',
   'CN=SG-APP-Fraud-Approvers-APAC-Tier3,OU=Security Groups,OU=APAC,DC=corp,DC=example,DC=com','CN=SG-APP-Treasury-Approvers-EMEA-Tier1,OU=Security Groups,OU=EMEA,DC=corp,DC=example,DC=com',
   'CN=SG-APP-Payroll-Approvers-AMER-Tier2,OU=Security Groups,OU=AMER,DC=corp,DC=example,DC=com','CN=SG-APP-Trading-Approvers-APAC-Tier3,OU=Security Groups,OU=APAC,DC=corp,DC=example,DC=com',
   'CN=SG-APP-Lending-Approvers-EMEA-Tier1,OU=Security Groups,OU=EMEA,DC=corp,DC=example,DC=com','CN=SG-APP-Clearing-Approvers-AMER-Tier2,OU=Security Groups,OU=AMER,DC=corp,DC=example,DC=com',
   'CN=SG-APP-Custody-Approvers-APAC-Tier3,OU=Security Groups,OU=APAC,DC=corp,DC=example,DC=com','CN=SG-APP-Reporting-Approvers-EMEA-Tier1,OU=Security Groups,OU=EMEA,DC=corp,DC=example,DC=com',
   'CN=SG-APP-Payments-Readers-AMER-Tier2,OU=Security Groups,OU=AMER,DC=corp,DC=example,DC=com','CN=SG-APP-Billing-Readers-APAC-Tier3,OU=Security Groups,OU=APAC,DC=corp,DC=example,DC=com',
   'CN=SG-APP-Fraud-Readers-EMEA-Tier1,OU=Security Groups,OU=EMEA,DC=corp,DC=example,DC=com','CN=SG-APP-Treasury-Readers-AMER-Tier2,OU=Security Groups,OU=AMER,DC=corp,DC=example,DC=com',
   'CN=SG-APP-Payroll-Readers-APAC-Tier3,OU=Security Groups,OU=APAC,DC=corp,DC=example,DC=com','CN=SG-APP-Trading-Readers-EMEA-Tier1,OU=Security Groups,OU=EMEA,DC=corp,DC=example,DC=com',
   'CN=SG-APP-Lending-Readers-AMER-Tier2,OU=Security Groups,OU=AMER,DC=corp,DC=example,DC=com','CN=SG-APP-Clearing-Readers-APAC-Tier3,OU=Security Groups,OU=APAC,DC=corp,DC=example,DC=com',
   'CN=SG-APP-Custody-Readers-EMEA-Tier1,OU=Security Groups,OU=EMEA,DC=corp,DC=example,DC=com','CN=SG-APP-Reporting-Readers-AMER-Tier2,OU=Security Groups,OU=AMER,DC=corp,DC=example,DC=com',
   'CN=SG-APP-Payments-Operators-APAC-Tier3,OU=Security Groups,OU=APAC,DC=corp,DC=example,DC=com','CN=SG-APP-Billing-Operators-EMEA-Tier1,OU=Security Groups,OU=EMEA,DC=corp,DC=example,DC=com',
   'CN=SG-APP-Fraud-Operators-AMER-Tier2,OU=Security Groups,OU=AMER,DC=corp,DC=example,DC=com','CN=SG-APP-Treasury-Operators-APAC-Tier3,OU=Security Groups,OU=APAC,DC=corp,DC=example,DC=com',
   'CN=SG-APP-Payroll-Operators-EMEA-Tier1,OU=Security Groups,OU=EMEA,DC=corp,DC=example,DC=com','CN=SG-APP-Trading-Operators-AMER-Tier2,OU=Security Groups,OU=AMER,DC=corp,DC=example,DC=com',
   'CN=SG-APP-Lending-Operators-APAC-Tier3,OU=Security Groups,OU=APAC,DC=corp,DC=example,DC=com','CN=SG-APP-Clearing-Operators-EMEA-Tier1,OU=Security Groups,OU=EMEA,DC=corp,DC=example,DC=com',
   'CN=SG-APP-Custody-Operators-AMER-Tier2,OU=Security Groups,OU=AMER,DC=corp,DC=example,DC=com','CN=SG-APP-Reporting-Operators-APAC-Tier3,OU=Security Groups,OU=APAC,DC=corp,DC=example,DC=com']}],expect:{bytes:4360,fitsCookie:false,fitsHeader:true,bytesWithoutGroups:600,fitsCookieWithoutGroups:true}},
 {name:'sixty-six group memberships: the fifteen-year employee',args:[{iss:'https://login.example.com/',sub:'ada.lovelace',aud:'api://orders',iat:1767222000,exp:1767225600,name:'Ada Lovelace',scope:'orders.read',groups:[
   'CN=SG-APP-Payments-Approvers-EMEA-Tier1,OU=Security Groups,OU=EMEA,DC=corp,DC=example,DC=com','CN=SG-APP-Billing-Approvers-AMER-Tier2,OU=Security Groups,OU=AMER,DC=corp,DC=example,DC=com',
   'CN=SG-APP-Fraud-Approvers-APAC-Tier3,OU=Security Groups,OU=APAC,DC=corp,DC=example,DC=com','CN=SG-APP-Treasury-Approvers-EMEA-Tier1,OU=Security Groups,OU=EMEA,DC=corp,DC=example,DC=com',
   'CN=SG-APP-Payroll-Approvers-AMER-Tier2,OU=Security Groups,OU=AMER,DC=corp,DC=example,DC=com','CN=SG-APP-Trading-Approvers-APAC-Tier3,OU=Security Groups,OU=APAC,DC=corp,DC=example,DC=com',
   'CN=SG-APP-Lending-Approvers-EMEA-Tier1,OU=Security Groups,OU=EMEA,DC=corp,DC=example,DC=com','CN=SG-APP-Clearing-Approvers-AMER-Tier2,OU=Security Groups,OU=AMER,DC=corp,DC=example,DC=com',
   'CN=SG-APP-Custody-Approvers-APAC-Tier3,OU=Security Groups,OU=APAC,DC=corp,DC=example,DC=com','CN=SG-APP-Reporting-Approvers-EMEA-Tier1,OU=Security Groups,OU=EMEA,DC=corp,DC=example,DC=com',
   'CN=SG-APP-Payments-Readers-AMER-Tier2,OU=Security Groups,OU=AMER,DC=corp,DC=example,DC=com','CN=SG-APP-Billing-Readers-APAC-Tier3,OU=Security Groups,OU=APAC,DC=corp,DC=example,DC=com',
   'CN=SG-APP-Fraud-Readers-EMEA-Tier1,OU=Security Groups,OU=EMEA,DC=corp,DC=example,DC=com','CN=SG-APP-Treasury-Readers-AMER-Tier2,OU=Security Groups,OU=AMER,DC=corp,DC=example,DC=com',
   'CN=SG-APP-Payroll-Readers-APAC-Tier3,OU=Security Groups,OU=APAC,DC=corp,DC=example,DC=com','CN=SG-APP-Trading-Readers-EMEA-Tier1,OU=Security Groups,OU=EMEA,DC=corp,DC=example,DC=com',
   'CN=SG-APP-Lending-Readers-AMER-Tier2,OU=Security Groups,OU=AMER,DC=corp,DC=example,DC=com','CN=SG-APP-Clearing-Readers-APAC-Tier3,OU=Security Groups,OU=APAC,DC=corp,DC=example,DC=com',
   'CN=SG-APP-Custody-Readers-EMEA-Tier1,OU=Security Groups,OU=EMEA,DC=corp,DC=example,DC=com','CN=SG-APP-Reporting-Readers-AMER-Tier2,OU=Security Groups,OU=AMER,DC=corp,DC=example,DC=com',
   'CN=SG-APP-Payments-Operators-APAC-Tier3,OU=Security Groups,OU=APAC,DC=corp,DC=example,DC=com','CN=SG-APP-Billing-Operators-EMEA-Tier1,OU=Security Groups,OU=EMEA,DC=corp,DC=example,DC=com',
   'CN=SG-APP-Fraud-Operators-AMER-Tier2,OU=Security Groups,OU=AMER,DC=corp,DC=example,DC=com','CN=SG-APP-Treasury-Operators-APAC-Tier3,OU=Security Groups,OU=APAC,DC=corp,DC=example,DC=com',
   'CN=SG-APP-Payroll-Operators-EMEA-Tier1,OU=Security Groups,OU=EMEA,DC=corp,DC=example,DC=com','CN=SG-APP-Trading-Operators-AMER-Tier2,OU=Security Groups,OU=AMER,DC=corp,DC=example,DC=com',
   'CN=SG-APP-Lending-Operators-APAC-Tier3,OU=Security Groups,OU=APAC,DC=corp,DC=example,DC=com','CN=SG-APP-Clearing-Operators-EMEA-Tier1,OU=Security Groups,OU=EMEA,DC=corp,DC=example,DC=com',
   'CN=SG-APP-Custody-Operators-AMER-Tier2,OU=Security Groups,OU=AMER,DC=corp,DC=example,DC=com','CN=SG-APP-Reporting-Operators-APAC-Tier3,OU=Security Groups,OU=APAC,DC=corp,DC=example,DC=com',
   'CN=SG-APP-Payments-Auditors-EMEA-Tier1,OU=Security Groups,OU=EMEA,DC=corp,DC=example,DC=com','CN=SG-APP-Billing-Auditors-AMER-Tier2,OU=Security Groups,OU=AMER,DC=corp,DC=example,DC=com',
   'CN=SG-APP-Fraud-Auditors-APAC-Tier3,OU=Security Groups,OU=APAC,DC=corp,DC=example,DC=com','CN=SG-APP-Treasury-Auditors-EMEA-Tier1,OU=Security Groups,OU=EMEA,DC=corp,DC=example,DC=com',
   'CN=SG-APP-Payroll-Auditors-AMER-Tier2,OU=Security Groups,OU=AMER,DC=corp,DC=example,DC=com','CN=SG-APP-Trading-Auditors-APAC-Tier3,OU=Security Groups,OU=APAC,DC=corp,DC=example,DC=com',
   'CN=SG-APP-Lending-Auditors-EMEA-Tier1,OU=Security Groups,OU=EMEA,DC=corp,DC=example,DC=com','CN=SG-APP-Clearing-Auditors-AMER-Tier2,OU=Security Groups,OU=AMER,DC=corp,DC=example,DC=com',
   'CN=SG-APP-Custody-Auditors-APAC-Tier3,OU=Security Groups,OU=APAC,DC=corp,DC=example,DC=com','CN=SG-APP-Reporting-Auditors-EMEA-Tier1,OU=Security Groups,OU=EMEA,DC=corp,DC=example,DC=com',
   'CN=SG-APP-Payments-Admins-AMER-Tier2,OU=Security Groups,OU=AMER,DC=corp,DC=example,DC=com','CN=SG-APP-Billing-Admins-APAC-Tier3,OU=Security Groups,OU=APAC,DC=corp,DC=example,DC=com',
   'CN=SG-APP-Fraud-Admins-EMEA-Tier1,OU=Security Groups,OU=EMEA,DC=corp,DC=example,DC=com','CN=SG-APP-Treasury-Admins-AMER-Tier2,OU=Security Groups,OU=AMER,DC=corp,DC=example,DC=com',
   'CN=SG-APP-Payroll-Admins-APAC-Tier3,OU=Security Groups,OU=APAC,DC=corp,DC=example,DC=com','CN=SG-APP-Trading-Admins-EMEA-Tier1,OU=Security Groups,OU=EMEA,DC=corp,DC=example,DC=com',
   'CN=SG-APP-Lending-Admins-AMER-Tier2,OU=Security Groups,OU=AMER,DC=corp,DC=example,DC=com','CN=SG-APP-Clearing-Admins-APAC-Tier3,OU=Security Groups,OU=APAC,DC=corp,DC=example,DC=com',
   'CN=SG-APP-Custody-Admins-EMEA-Tier1,OU=Security Groups,OU=EMEA,DC=corp,DC=example,DC=com','CN=SG-APP-Reporting-Admins-AMER-Tier2,OU=Security Groups,OU=AMER,DC=corp,DC=example,DC=com',
   'CN=SG-APP-Payments-Reviewers-APAC-Tier3,OU=Security Groups,OU=APAC,DC=corp,DC=example,DC=com','CN=SG-APP-Billing-Reviewers-EMEA-Tier1,OU=Security Groups,OU=EMEA,DC=corp,DC=example,DC=com',
   'CN=SG-APP-Fraud-Reviewers-AMER-Tier2,OU=Security Groups,OU=AMER,DC=corp,DC=example,DC=com','CN=SG-APP-Treasury-Reviewers-APAC-Tier3,OU=Security Groups,OU=APAC,DC=corp,DC=example,DC=com',
   'CN=SG-APP-Payroll-Reviewers-EMEA-Tier1,OU=Security Groups,OU=EMEA,DC=corp,DC=example,DC=com','CN=SG-APP-Trading-Reviewers-AMER-Tier2,OU=Security Groups,OU=AMER,DC=corp,DC=example,DC=com',
   'CN=SG-APP-Lending-Reviewers-APAC-Tier3,OU=Security Groups,OU=APAC,DC=corp,DC=example,DC=com','CN=SG-APP-Clearing-Reviewers-EMEA-Tier1,OU=Security Groups,OU=EMEA,DC=corp,DC=example,DC=com',
   'CN=SG-APP-Custody-Reviewers-AMER-Tier2,OU=Security Groups,OU=AMER,DC=corp,DC=example,DC=com','CN=SG-APP-Reporting-Reviewers-APAC-Tier3,OU=Security Groups,OU=APAC,DC=corp,DC=example,DC=com',
   'CN=SG-APP-Payments-Support-EMEA-Tier1,OU=Security Groups,OU=EMEA,DC=corp,DC=example,DC=com','CN=SG-APP-Billing-Support-AMER-Tier2,OU=Security Groups,OU=AMER,DC=corp,DC=example,DC=com',
   'CN=SG-APP-Fraud-Support-APAC-Tier3,OU=Security Groups,OU=APAC,DC=corp,DC=example,DC=com','CN=SG-APP-Treasury-Support-EMEA-Tier1,OU=Security Groups,OU=EMEA,DC=corp,DC=example,DC=com',
   'CN=SG-APP-Payroll-Support-AMER-Tier2,OU=Security Groups,OU=AMER,DC=corp,DC=example,DC=com','CN=SG-APP-Trading-Support-APAC-Tier3,OU=Security Groups,OU=APAC,DC=corp,DC=example,DC=com']}],expect:{bytes:8815,fitsCookie:false,fitsHeader:false,bytesWithoutGroups:600,fitsCookieWithoutGroups:true}}]},
prompt:`A token is only useful if it fits where it has to travel. Write <code>function tokenFit(claims)</code> that models the encoded size of a signed JWT and decides where it will survive.<br><br>Model the size as <code>392</code> bytes of fixed overhead (the encoded header, an encoded RS256 signature and the two dots) plus the base64url-encoded payload, which is <code>Math.ceil(JSON.stringify(claims).length * 4 / 3)</code> for ASCII claims. Return an object with: <code>bytes</code>, the encoded size; <code>fitsCookie</code>, true when <code>bytes</code> is at most <code>4096</code>; <code>fitsHeader</code>, true when it is at most <code>8192</code>; <code>bytesWithoutGroups</code>, the same size computed with the <code>groups</code> claim removed; and <code>fitsCookieWithoutGroups</code>. Do not modify the object you were given.`,
starter:`function tokenFit(claims) {
  return null;
}`,
solution:`function tokenFit(claims) {
  // 48 bytes of encoded header + 342 for an encoded RS256 signature + 2 dots.
  // Only the payload varies, so the rest is one constant.
  var OVERHEAD = 392;
  function encoded(c) {
    // base64url spends 4 characters on every 3 bytes, so the wire size is a
    // third larger than the JSON anyone reads in a debugger.
    return OVERHEAD + Math.ceil(JSON.stringify(c).length * 4 / 3);
  }
  var lean = {};
  for (var k of Object.keys(claims)) {
    if (k !== "groups") lean[k] = claims[k];   // copy, never delete from the input
  }
  var bytes = encoded(claims);
  var trimmed = encoded(lean);
  return {
    bytes: bytes,
    fitsCookie: bytes <= 4096,
    fitsHeader: bytes <= 8192,
    bytesWithoutGroups: trimmed,
    fitsCookieWithoutGroups: trimmed <= 4096
  };
}`,
tests:[{d:'measures the serialized claims',re:'JSON\\.stringify'},{d:'inflates the payload for base64url',re:'4\\s*/\\s*3'},{d:'rounds the encoded length up',re:'Math\\.ceil'},{d:'counts the header and signature overhead',re:'392'},{d:'checks the 4 KB cookie ceiling',re:'4096'},{d:'checks the 8 KB header ceiling',re:'8192'},{d:'removes the groups claim to get the second number',re:'"groups"'}],
behavior:`The lean token is 600 bytes and fits everywhere. Thirty group DNs take it to 4,360, which is past the 4 KB cookie limit and still inside an 8 KB header: the user is logged out at random while the API calls keep working, which is why this failure is so hard to place. Sixty-six DNs reach 8,815 and fail both. In every case the same claims without groups come back to 600, so the fix is not a bigger buffer. The 30-group case is the one that catches the two plausible wrong answers: skip the base64url inflation and you compute 3,368 and call it fine, and use one threshold for both cookie and header and you get fitsCookie right by accident.`,
hints:['Write the size calculation once as a small helper, then call it twice: once with the claims you were given, once without groups.','Math.ceil(JSON.stringify(c).length * 4 / 3) is the encoded payload. Add the 392 bytes of overhead before comparing against any limit.','Build the trimmed object by copying every key except groups. Using delete would mutate the caller’s claims, and this function is meant to answer a question, not change anything.']}]},

{id:'idfcast',title:'The cast: one set of actors, four sets of names',body:`



<p>Identity has four or five actors, and every protocol renamed all of them. Most of the difficulty in
reading OAuth, OIDC and SAML side by side is that <i>the same box has four names</i>. Two of those
names deserve a sentence before we start. <b>OIDC</b> is OpenID Connect, a thin layer on top of OAuth
that adds the missing piece: a signed statement of who logged in, called an ID token. OAuth answers
"what may this app do"; OIDC answers "who is this person". <b>SAML</b> is Security Assertion Markup
Language, the older, XML-based standard for single sign-on between companies. The identity provider
sends the application a signed XML document, an assertion, saying who the user is. It's still what
most enterprise single sign-on runs on.</p>

<h4>The boxes</h4>
<ul>
<li><b>The subject</b>: the human (or workload) the exchange is about. When the subject also grants
permission, OAuth calls them the <b>resource owner</b>: the person who <i>owns</i> the data an app
wants, and the only one who can authorize access to it.</li>
<li><b>The app the user is using</b>: wants to log the user in, or to call an API for them. OAuth and
OIDC call it the <b>client</b>. OIDC also calls it the <b>relying party (RP)</b>, because it relies on
someone else's authentication. SAML calls it the <b>service provider (SP)</b>.</li>
<li><b>The authority</b>: holds the accounts, authenticates people, and issues signed statements.
SAML calls it the <b>identity provider (IdP)</b>. OAuth calls it the <b>authorization server (AS)</b>.
Real products are usually both at once: Okta, Entra ID, Keycloak, Auth0, Google.</li>
<li><b>The API being protected</b>: OAuth calls it the <b>resource server</b>. It holds the data,
accepts access tokens, and enforces scopes. A <b>scope</b> is the named permission an app asks for,
such as <code>calendar.read</code>. SAML has no equivalent, because SAML is about logging into
applications, not calling APIs.</li>
<li><b>The signed statement</b>: SAML says <b>assertion</b> (XML), OIDC says <b>ID token</b> (a JWT),
OAuth says <b>access token</b>. A <b>JWT</b> is a JSON Web Token: a small signed document, three
base64 pieces separated by dots, that carries claims such as who the user is and when the token
expires. Anyone can read it; only the issuer can produce a valid signature. Same idea in all three,
different envelope and different job.</li>
</ul>

<h4>The translation table</h4>
<div class="codeSample" data-hl>ROLE                     SAML 2.0            OIDC                 OAuth 2.0
-----------------------  ------------------  -------------------  ------------------
the person               Subject / Principal Subject (end-user)   Resource Owner
the app                  Service Provider    Relying Party        Client
the authority            Identity Provider   OpenID Provider      Authorization Server
the API                  (n/a)               (n/a)                Resource Server
the signed statement     Assertion (XML)     ID Token (JWT)       Access Token
where trust config lives Metadata XML        Discovery document   (client registration)</div>

<h4>Two distinctions</h4>
<p><b>The client is not the user.</b> A client is a <i>registered application</i> with its own identity,
its own id, and sometimes its own secret. "Authenticate the client" means proving which <i>app</i> is
calling, a separate question from which <i>person</i> is using it. Both happen in a single OAuth
flow.</p>
<p><b>The authority is not the API.</b> The authorization server <i>issues</i> tokens. The resource
server <i>consumes</i> them. They're often run by different teams and sometimes different companies. A
resource server never authenticates a user. That happened somewhere else, and all the API gets is a
token to verify.</p>

<h4>How the boxes find each other</h4>
<p>An app can't verify anything from an authority it has never heard of, so the two are wired together
in advance. Two halves:</p>
<ul>
<li><b>Client registration</b>: the app is registered <i>at</i> the authority, receiving a
<code>client_id</code>, possibly a secret, and a list of allowed redirect URIs. A <b>redirect URI</b>
is the address the login sends the browser back to, with the result attached. If an attacker controls
it, they get the result. The authority learns about the app.</li>
<li><b>Discovery / metadata</b>: the app learns about the authority. OIDC publishes a discovery
document at <code>/.well-known/openid-configuration</code> listing every endpoint plus a
<code>jwks_uri</code> holding the public signing keys. SAML publishes an equivalent metadata XML file
containing the IdP's certificate.</li>
</ul>
<p>Those public keys are what makes verification possible. Wherever a later lesson says "the RP verifies
the token," it means: fetch the keys from that published location and check the signature.</p>`,
docs:[['RFC 6749 §1.1, OAuth 2.0 roles','https://www.rfc-editor.org/rfc/rfc6749#section-1.1'],['OpenID Connect Core, Terminology','https://openid.net/specs/openid-connect-core-1_0.html#Terminology'],['OIDC Discovery','https://openid.net/specs/openid-connect-discovery-1_0.html']],
},

{id:'idf3',title:'SSO vs federation vs delegation: experience, trust, permission',body:`




<p>These three words get used as if they were interchangeable. They describe different kinds of
thing.</p>
<div class="codeSample" data-hl>SSO         is an EXPERIENCE, what the user feels: "I only logged in once"
Federation  is an ARCHITECTURE, who is trusted to authenticate, across a boundary
Delegation  is a PERMISSION, an app acting on your behalf, with limits you set</div>
<p>They often appear together, so they get conflated, but each can exist without the others.</p>

<h4>SSO is a user experience, not a technology</h4>
<p><b>Single Sign-On</b> means: authenticate once, then reach many applications without being asked
again. That describes what the <i>person perceives</i>. It names no protocol, no message, no actor.
SSO is a <i>result</i>, and there's more than one way to produce it:</p>
<ul>
<li><b>Same-domain session sharing.</b> Several apps under <code>*.corp.example</code> share one session
cookie, or sit behind one gateway that holds the session. Log in at one, you're logged in at all.
This is SSO with <b>no federation, no IdP and no tokens</b>, just a cookie with a carefully scoped
domain.</li>
<li><b>Federated SSO.</b> Apps in different domains or organizations redirect to a shared authority.
It already has a session with you, so it answers without prompting. This version needs SAML or
OIDC. <b>SAML</b> is Security Assertion Markup Language, the older, XML-based standard for single
sign-on between companies. The identity provider sends the application a signed XML document, an
assertion, saying who the user is. It's still what most enterprise SSO runs on.</li>
<li><b>Desktop/integrated SSO.</b> Kerberos on a corporate network: your workstation login yields a
ticket that gets you into intranet apps silently.</li>
</ul>
<p><b>So SSO doesn't require federation.</b> When a stakeholder says "we need SSO," ask:
<i>across what boundary?</i> Within one domain it may be a cookie configuration. Across
organizations it's a federation project.</p>
<p>The mirror image, <b>Single Logout (SLO)</b>, is unreliable for the same reason. "One login" is
really N separate application sessions. Ending one doesn't end the rest, and there's no reliable
way to reach into every app and close them.</p>

<h4>Federation is a trust architecture</h4>
<p><b>Federation</b> means an application stops authenticating users itself. Instead it accepts a
signed statement from an authority it agreed in advance to trust, usually across an organizational
boundary. The app never sees a password. Trust is set up beforehand by exchanging the authority's
public keys or certificate.</p>
<p><b>Federation doesn't require SSO either.</b> One federated application gets no "sign on once"
benefit, and federation is still worth it. The wins are structural:</p>
<ul>
<li>MFA and login policy are enforced in <b>one</b> place instead of per app. <b>MFA</b> is
multi-factor authentication: proving who you are with two different kinds of evidence, usually
something you know (a password) plus something you have (a phone or a security key). A stolen
password alone is then not enough.</li>
<li>Disabling the account at the authority ends access <b>everywhere at once</b>: the deprovisioning
problem from the lifecycle lesson, solved.</li>
<li>No application ever stores a password, which removes a whole class of breach.</li>
<li>Audit of who logged in where lands in one log.</li>
</ul>

<h4>Delegation is about permission, not login</h4>
<p><b>Delegation</b> is a different axis. You authorize an <i>application</i> to act on your behalf
against an API, with a limited slice of your access, without giving it your password. This is what
OAuth 2.0 was invented for. It answers <i>"may this app do this thing for me?"</i>, not
<i>"who are you?"</i></p>
<p>Hence the most consequential misconception in the field: <b>OAuth is not a login protocol.</b> An
access token says an app may call an API. It says nothing reliable about who the user is, and
treating it as proof of identity is a vulnerability. <b>OpenID Connect</b> fixes that by adding an
ID token (an authentication statement) on top of OAuth's delegation.</p>
<p>Delegation has a dangerous neighbor. In <b>delegation</b> the token records both identities:
"app X, acting for user Y." In <b>impersonation</b> the app becomes user Y and the API can't tell
the difference. Impersonation carries more authority, is harder to audit, and should be a deliberate
choice.</p>

<h4>Putting it together</h4>
<div class="codeSample" data-hl>QUESTION IT ANSWERS                       CONCEPT      TYPICAL MECHANISM
"How many times must I log in?"           SSO          session cookie / IdP session
"Who is trusted to authenticate?"         Federation   SAML, OIDC
"May this app act for me, and how far?"   Delegation   OAuth 2.0 scopes + consent

// they compose, but they are independent:
same-domain cookie SSO   -> SSO, no federation, no delegation
one federated app        -> federation, no SSO benefit, no delegation
a CLI calling your API   -> delegation, no SSO, no federation
corporate Google login   -> all three at once, which is why they blur</div>
<p><b>Phrases to correct on sight.</b> "We'll use OAuth to log users in": you mean OIDC. "SAML is
SSO": SAML implements federation, which <i>delivers</i> SSO. "SSO means one password": SSO means
one <i>login event</i>. The credential could be a passkey. "Federation gives users one identity":
it gives them one <i>authority</i>. They still have an account at each app, now populated from that
authority.</p>`,
docs:[['OIDC Discovery','https://openid.net/specs/openid-connect-discovery-1_0.html'],['RFC 6749 §1 (OAuth 2.0 is delegated authorization)','https://www.rfc-editor.org/rfc/rfc6749#section-1'],['RFC 8693: OAuth 2.0 Token Exchange (delegation vs impersonation)','https://www.rfc-editor.org/rfc/rfc8693#section-1.1'],['Okta (What is federated identity?)','https://www.okta.com/identity-101/what-is-federated-identity/']],
ex:{title:'Trust an issuer, find its keys',
prompt:`Write <code>Federation</code> with: <code>static boolean issuerTrusted(String iss, java.util.Set&lt;String&gt; trustedIssuers)</code> returning whether <code>iss</code> is non-null and in <code>trustedIssuers</code>; and <code>static String jwksUri(String issuer)</code> returning the issuer's discovery keys URL: the <code>issuer</code> with any trailing <code>"/"</code> removed, then <code>"/.well-known/jwks.json"</code> appended (e.g. <code>"https://idp.example.com"</code> → <code>"https://idp.example.com/.well-known/jwks.json"</code>).`,
starter:`import java.util.*;

public class Federation {
    static boolean issuerTrusted(String iss, Set<String> trustedIssuers) {
        return false;
    }
    static String jwksUri(String issuer) {
        return null;
    }
}`,
tests:[{d:'null-checks the issuer',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:iss\\s*!=\\s*null|null\\s*!=\\s*iss))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:iss\\s*!=\\s*null|null\\s*!=\\s*iss)[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:iss\\s*!=\\s*null|null\\s*!=\\s*iss)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:iss\\s*!=\\s*null|null\\s*!=\\s*iss)[^{]*?return\\s+\\k<av>\\b)'},{d:'only trusts a configured issuer',re:'trustedIssuers\\s*\\.\\s*contains\\s*\\(\\s*iss\\s*\\)'},{d:'strips a trailing slash',re:'endsWith\\s*\\(\\s*"/"\\s*\\)|substring\\s*\\('},{d:'points at the well-known keys',re:'"/\\.well-known/jwks\\.json"|/\\.well-known/jwks\\.json'}],
behavior:`issuerTrusted("https://idp.example.com", Set.of("https://idp.example.com")) is true; an unknown or null issuer is false. jwksUri("https://idp.example.com/") returns "https://idp.example.com/.well-known/jwks.json" (exactly one slash before .well-known).`,
hints:['Trust is an allowlist: <code>return iss != null &amp;&amp; trustedIssuers.contains(iss);</code>','Strip the slash: <code>String base = issuer.endsWith("/") ? issuer.substring(0, issuer.length()-1) : issuer;</code>','Then <code>return base + "/.well-known/jwks.json";</code>'],
solution:`import java.util.*;

public class Federation {
    static boolean issuerTrusted(String iss, Set<String> trustedIssuers) {
        return iss != null && trustedIssuers.contains(iss);
    }
    static String jwksUri(String issuer) {
        String base = issuer.endsWith("/") ? issuer.substring(0, issuer.length() - 1) : issuer;
        return base + "/.well-known/jwks.json";
    }
}`}},

{id:'idf4',title:'Clients: public vs confidential (private)',body:`




<p>In OAuth/OIDC the app requesting tokens is the <b>client</b>. (<b>OIDC</b> is OpenID Connect: a thin layer on top of OAuth that adds the missing piece, a signed statement of who logged in, called an ID token. OAuth answers "what may this app do"; OIDC answers "who is this person".) The most important property of a client is whether it can <b>keep a secret</b>:</p>
<ul>
<li><b>Confidential client</b> (a.k.a. <b>private client</b>), runs somewhere users can't extract its secrets: a <b>server-side backend</b>. It authenticates to the authorization server with a <b>client secret</b>, or better a key/certificate. Example: a Spring Boot backend, a daemon.</li>
<li><b>Public client</b>: runs where the code/secret is visible to the user: a <b>SPA</b> (JavaScript in the browser), a <b>mobile app</b>, a desktop app. It <b>can't</b> hold a secret, so it proves itself per-request with <b>PKCE</b> (next stream) instead.</li>
</ul>
<p>The flows differ. Confidential clients may use flows that rely on a secret, such as <b>client credentials</b> for machine-to-machine. Public clients must use <b>Authorization Code + PKCE</b> and never embed a secret.</p>
<p><b>How confidential clients authenticate</b> (from weakest to strongest):</p>
<ul>
<li><code>client_secret_basic</code> / <code>client_secret_post</code>, a shared secret in the request (HTTP Basic or form field).</li>
<li><code>private_key_jwt</code>, the client signs a short JWT with its <b>private key</b> and the server verifies with the client's public key. No shared secret to leak. A <b>JWT</b> is a JSON Web Token: a small signed document, three base64 pieces separated by dots, that carries claims such as who is calling and when it expires. Anyone can read it; only the holder of the key can produce a valid signature.</li>
<li><code>tls_client_auth</code> (mTLS), the client presents a <b>client certificate</b> during the TLS handshake. Strongest, and it ties the token to the client (lesson 6 / the S2S stream). <b>S2S</b> is service to service: calls where both ends are programs and there is no user typing a password.</li>
</ul>
<div class="codeSample" data-hl>// confidential client: HTTP Basic client authentication
Authorization: Basic base64(client_id ":" client_secret)
// public client: NO secret, proves itself with a PKCE code_verifier instead</div>

<h4>The question, in plain English</h4>
<p>Ask one thing: <b>can this application keep a secret?</b></p>
<p>Your backend can. It runs on a machine you control, and the only way to see its configuration
is to break into it. A mobile app can't: anyone can download it and decompile it. A SPA can't: its
JavaScript is readable in the browser with one keystroke. A CLI distributed to users can't. For
these <b>public clients</b>, "public" is literal. Whatever secret you ship inside them is public the
day you ship it.</p>
<div class="codeSample" data-hl>// people ship a secret into a SPA and reason: "it is minified, and
// nobody will look". here is what looking costs:
//   DevTools -> Sources -> Ctrl-F "client_secret"
// that is the entire attack. it takes four seconds.

// and rotating it does not help: the new one ships the same way.</div>

<h4>What the distinction changes</h4>
<p>A confidential client can prove it is itself at the token endpoint. The authorization server then
knows the code is being redeemed by the app that started the flow. A public client can't prove
anything about itself. <b>PKCE</b> does that job instead: a one-time secret generated per flow, kept
in memory, never shipped, and so never stealable from the artifact.</p>
<div class="codeSample" data-hl>CONFIDENTIAL          a backend web app, a service, a scheduled job
  gets a client_secret (or better: private_key_jwt / mTLS)
  may use the Client Credentials grant - it can act as ITSELF
  can hold a refresh token relatively safely

PUBLIC                a SPA, a mobile app, a desktop app, a CLI
  gets NO secret. PKCE is mandatory.
  may NOT use Client Credentials - there is no identity to prove
  a refresh token here needs rotation or sender-constraining</div>

<h4>The classification is about deployment, not technology</h4>
<p>"Is React a public client?" has no answer. A React app whose tokens are handled by its own
backend is that <i>backend</i> acting as a confidential client. The same app talking to an
authorization server from the browser is a public client. <b>Where the credential lives</b> decides
it.</p>
<p>That is also the way out. Put a backend in front of a browser app and let it hold the tokens.
The browser gets an ordinary session cookie and never sees a token. That is the <b>BFF</b> pattern,
backend-for-frontend: a small server that sits between the browser and the APIs and holds the
tokens, so the browser only ever has a cookie and never a token that JavaScript could steal. It's
covered in the OAuth stream.</p>

<h4>Registration, briefly</h4>
<p>Whichever kind it is, a client must be <b>registered</b> before it can ask for anything.
Registration produces a <code>client_id</code> (a public identifier, not a secret) and records the
exact redirect URIs the authorization server will send codes to. That allowlist stops an attacker
starting a flow with your <code>client_id</code> and having the code delivered to their own
server.</p>`,
docs:[['RFC 6749 §2.1 (Client Types)','https://www.rfc-editor.org/rfc/rfc6749#section-2.1'],['OAuth 2.0 client authentication','https://oauth.net/2/client-authentication/']],
ex:{title:'Classify the client, build its auth',
prompt:`Write <code>ClientAuth</code> with: <code>static boolean isConfidential(String clientType)</code> returning whether <code>clientType</code> equals <code>"confidential"</code> (use <code>"confidential".equals(clientType)</code> so a null is safe); and <code>static String basicClientAuth(String clientId, String clientSecret)</code> that builds the confidential client's HTTP Basic value: base64-encode <code>clientId + ":" + clientSecret</code> with <code>java.util.Base64.getEncoder()</code> and return <code>"Basic " + encoded</code>.`,
starter:`public class ClientAuth {
    static boolean isConfidential(String clientType) {
        return false;
    }
    static String basicClientAuth(String clientId, String clientSecret) {
        return null;
    }
}`,
tests:[{d:'null-safe equality against the literal',re:'"confidential"\\s*\\.\\s*equals\\s*\\(\\s*clientType\\s*\\)'},{d:'joins id:secret',re:'clientId\\s*\\+\\s*":"\\s*\\+\\s*clientSecret'},{d:'base64-encodes it',re:'Base64\\.getEncoder\\s*\\(\\s*\\)'},{d:'returns a Basic value',re:'"Basic "\\s*\\+'}],
behavior:`isConfidential("confidential") is true; isConfidential("public") and isConfidential(null) are false. basicClientAuth("app","s3cret") returns "Basic YXBwOnMzY3JldA==" (base64 of "app:s3cret"). Only confidential clients should ever send this; a public client cannot keep the secret.`,
hints:['Put the literal first so null is handled for free: <code>"confidential".equals(clientType)</code>.','<code>String raw = clientId + ":" + clientSecret;</code>','<code>return "Basic " + Base64.getEncoder().encodeToString(raw.getBytes());</code>'],
solution:`public class ClientAuth {
    static boolean isConfidential(String clientType) {
        return "confidential".equals(clientType);
    }
    static String basicClientAuth(String clientId, String clientSecret) {
        String raw = clientId + ":" + clientSecret;
        return "Basic " + java.util.Base64.getEncoder().encodeToString(raw.getBytes());
    }
}`}},

{id:'idf5',title:'Delegation, consent & scopes',body:`




<p>The reason OAuth exists: let an app act <b>on your behalf</b> against an API <b>without giving it your password</b>. That is <b>delegated authorization</b>: you delegate a <i>limited</i> slice of your access to the app.</p>
<ul>
<li><b>Scope</b>: a named permission the app requests, e.g. <code>photos:read</code> or <code>calendar:write</code>. Scopes are a <b>space-separated</b> list. They bound what the resulting token can do (least privilege).</li>
<li><b>Consent</b>: the authorization server shows you what the app is asking for ("Acme wants to read your photos") and you approve. Consent is why delegation is safe: <i>you</i> decide.</li>
<li><b>Least privilege</b>: request only the scopes you need. A photo-printing app should ask for <code>photos:read</code>, not <code>photos:write</code> or your contacts.</li>
</ul>
<p><b>Delegation vs impersonation</b>:</p>
<ul>
<li><b>Delegation</b>: the token says "app X, acting for user Y, may do Z." Both identities are present.</li>
<li><b>Impersonation</b>: the app <i>becomes</i> user Y. The API can't tell it isn't Y. More authority, more risk, and audited differently. Token exchange, in the S2S stream, formalizes both. <b>S2S</b> is service to service: calls where both ends are programs and there is no user typing a password.</li>
</ul>
<p>A resource server enforces scopes on every call: it reads the token's <code>scope</code> claim and checks the required scope is present. A <b>claim</b> is one fact inside a token: a name, an email, an expiry time, or here the list of granted scopes.</p>
<div class="codeSample" data-hl>// token carries the granted scopes as a space-separated string
"scope": "photos:read profile"
// the API checks the needed scope is present before acting
if (!granted.contains("photos:read")) throw new ForbiddenException();</div>

<h4>The valet key</h4>
<p>Some cars come with a second key that starts the engine and opens the doors, but won't open the
trunk. You hand it to a valet. They can park the car and nothing more, they never had your own key,
and you can ask for it back.</p>
<p>That is delegation, and OAuth is a protocol for issuing valet keys:</p>
<div class="codeSample" data-hl>DELEGATION   you let an app act for you WITHOUT giving it your password.
             the app never learns your credential; it gets its own key.

CONSENT      you were asked, in terms you could understand, and agreed.
             a grant made without informed consent is not delegation,
             it is just access.

SCOPE        the BOUNDS of the key. what it may do, and no more.
             "read your calendar" is not "manage your account".</div>

<h4>Why "never give an app your password" matters</h4>
<p>Before OAuth, a service that wanted to import your contacts asked for your email password. People
typed it in. That gave the service <i>everything</i>: read your mail, change your password, lock
you out. There was no way to grant less and no way to see what it had done. The only way to revoke
it was changing the password, which broke every other integration too.</p>
<p>Delegation fixes all four. The app gets a bounded credential, you can see what it asked for, you
can revoke that one app, and your password never leaves you.</p>

<h4>A scope is a limit, not a permission</h4>
<p>A scope says what the app is <i>allowed to ask for</i>. It doesn't say what <b>you</b> are allowed
to do.</p>
<div class="codeSample" data-hl>token has scope "invoices:write"   AND   the user is a read-only clerk
   -> the answer is NO.

// the scope narrows the app's grant. the user's own permissions still
// apply underneath it. the effective answer is the INTERSECTION.
// a resource server that checks only the scope has just let an app
// escalate its user's privileges, which is a real and common bug.</div>

<h4>Consent that is worth something</h4>
<p>A consent screen listing "openid profile email offline_access https://api.example.com/.default"
hasn't informed anybody. Real consent names <b>what the app will do</b> in the user's language and
names <b>who is asking</b>. It is <b>granular</b> enough to decline part of it, and <b>revocable</b>
from somewhere the user can find.</p>
<p>The attack this defends against is <b>consent phishing</b>. An attacker registers a
plausible-looking application, sends a legitimate authorization link, and the victim grants it real
access. No password stolen, no malware, nothing for a scanner to detect. Every serious platform now
restricts which applications may request sensitive scopes, and administrators should be able to see
which third-party apps their users have granted.</p>

<h4>Ask for less</h4>
<p>Request the narrowest scope that does the job, and ask for more only when the user is doing the
thing that needs it. It reduces the damage when your app is compromised, and it raises consent
rates because the screen is less alarming.</p>`,
docs:[['RFC 6749 §3.3, Access Token Scope','https://www.rfc-editor.org/rfc/rfc6749#section-3.3'],['oauth.net, Scopes','https://oauth.net/2/scope/']],
ex:{title:'Parse scopes, enforce least privilege',
prompt:`Write <code>Scopes</code> with: <code>static java.util.Set&lt;String&gt; parse(String scope)</code> that turns a space-separated scope string into a set: <code>trim()</code> then <code>split(" ")</code>, collect into a <code>HashSet</code>; and <code>static boolean covers(java.util.Set&lt;String&gt; granted, String required)</code> returning whether <code>granted.contains(required)</code>. (Split on a single space; scopes are space-delimited.)`,
starter:`import java.util.*;

public class Scopes {
    static Set<String> parse(String scope) {
        return null;
    }
    static boolean covers(Set<String> granted, String required) {
        return false;
    }
}`,
tests:[{d:'trims the scope string',re:'\\.trim\\s*\\(\\s*\\)'},{d:'splits on a space',re:'split\\s*\\(\\s*" "\\s*\\)'},{d:'collects into a set',re:'new\\s+HashSet|Set\\.of|Collectors\\.toSet'},{d:'enforcement checks membership',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:granted\\s*\\.\\s*contains\\s*\\(\\s*required\\s*\\)))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:granted\\s*\\.\\s*contains\\s*\\(\\s*required\\s*\\))[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:granted\\s*\\.\\s*contains\\s*\\(\\s*required\\s*\\))[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:granted\\s*\\.\\s*contains\\s*\\(\\s*required\\s*\\))[^{]*?return\\s+\\k<av>\\b)'}],
behavior:`parse("photos:read profile") is the set {"photos:read","profile"}. covers(parse("photos:read profile"), "photos:read") is true; covers(..., "photos:write") is false: the app was never granted write, so the API denies it.`,
hints:['<code>new HashSet&lt;&gt;(Arrays.asList(scope.trim().split(" ")))</code>.','Enforcement is just membership: <code>return granted.contains(required);</code>','Scopes are separated by single spaces per the spec.'],
solution:`import java.util.*;

public class Scopes {
    static Set<String> parse(String scope) {
        return new HashSet<>(Arrays.asList(scope.trim().split(" ")));
    }
    static boolean covers(Set<String> granted, String required) {
        return granted.contains(required);
    }
}`}},

{id:'idfdauthn',title:'Delegated authentication: who gets to see the password',body:`






<p>An application has to answer "is this really Ada?", but it doesn't have to answer it <i>itself</i>.
Handing that question to someone else is <b>delegated authentication</b>, and there are two ways
to do it. The difference decides whether your application ever touches a user's
password.</p>

<h4>The question being delegated</h4>
<p>What is delegated here is the <b>act of verifying a credential</b>. In the delegated
<i>authorization</i> of the next lesson, what gets delegated is <i>permission to act on someone's
behalf</i>. Same word, different objects:</p>
<div class="codeSample" data-hl>Delegated AUTHENTICATION  "Someone else, please tell me WHO this is."
Delegated AUTHORIZATION   "User, please let this app DO something for you."</div>

<h4>Style 1: credential forwarding (the classic meaning)</h4>
<p>Your app shows its own login form, collects the username and password, and asks a backend system
to check them. The app is a middleman holding plaintext credentials:</p>
<ul>
<li><b>LDAP bind.</b> The app binds to the directory <i>as the user</i> with the password it just
collected. Bind succeeds, the password was right. Ubiquitous in enterprise Java. <b>LDAP</b> is
Lightweight Directory Access Protocol, the protocol for querying a directory, the database of
people, groups and machines an organization keeps. A bind is the LDAP way of logging in.</li>
<li><b>RADIUS.</b> The same pattern for network gear and VPNs. <b>RADIUS</b> is the protocol a VPN,
a Wi-Fi access point or a switch uses to ask a central server whether to let a user in. Old, and
still everywhere at the network edge.</li>
<li><b>A password-verification API.</b> An internal service exposing "here is a username and
password, is it valid?"</li>
<li><b>OAuth's ROPC grant.</b> The deprecated password grant: the app collects the password and posts
it to the token endpoint. <b>ROPC</b> is resource owner password credentials, the OAuth flow where
the app collects your username and password itself and trades them for a token. Deprecated because
of everything below, and because it teaches users to type their password into any app.</li>
</ul>
<p><b>What this buys you:</b> one place to store passwords and enforce password policy, and a login
screen you fully control.</p>
<p><b>What it costs you.</b> The application sits inside the credential blast radius. It can log the
password by accident. Its memory contains it. A compromise of the app is a compromise of every
password typed into it. It can't support MFA or passkeys without reinventing them, because the
authority never talks to the user, only to your app. <b>MFA</b> is multi-factor authentication:
proving who you are with two different kinds of evidence, usually something you know (a password)
plus something you have (a phone or a security key). And it can't support SSO at all. <b>SSO</b> is
single sign-on: you log in once, at one place, and every other application accepts that login
instead of asking for its own. With forwarding, nothing exists for a second app to reuse.</p>

<h4>Style 2: redirect the user (federated authentication)</h4>
<p>The app sends the user's browser to the authority, the user authenticates <i>there</i>, and the
app receives a signed statement saying it happened. The app never sees a credential.</p>
<table class="cmp"><thead><tr><th>Credential forwarding</th><th>Redirect (federated)</th></tr></thead><tbody>
<tr><td>user <b>&rarr;</b> app <b>&rarr;</b> directory. The app holds the password.</td><td>user <b>&rarr;</b> app <b>&rarr;</b> redirect <b>&rarr;</b> IdP. The user types the password <b>at the IdP</b>; the app gets back a signed assertion.</td></tr>
<tr><td><b>App sees:</b> username + password</td><td><b>App sees:</b> a signed token, never a credential</td></tr>
<tr><td><b>MFA:</b> app must build it</td><td><b>MFA:</b> IdP handles it, app unchanged</td></tr>
<tr><td><b>Passkeys:</b> effectively no</td><td><b>Passkeys:</b> work immediately</td></tr>
<tr><td><b>SSO:</b> impossible</td><td><b>SSO:</b> falls out for free</td></tr>
<tr><td><b>Breach:</b> passwords exposed</td><td><b>Breach:</b> no passwords to expose</td></tr>
</tbody></table>
<p>So "we delegate authentication to Okta" almost always means <i>federation</i>, not credential
forwarding.</p>

<h4>How to tell them apart in a design review</h4>
<p>One question settles it: <b>where does the user type their password?</b> If the answer is "a form
our application renders," you're forwarding credentials, whatever the diagram calls it. If the
answer is "on the identity provider's own page," you're federating.</p>
<p>The same test catches a phishing-style integration. An app that renders a page <i>looking</i>
like the IdP's login and forwards what it captures is doing credential forwarding with extra steps.
That is why users are taught to check the address bar before typing a password, and why mobile
apps must use a system browser rather than an embedded webview.</p>

<h4>When forwarding is still the right answer</h4>
<p>Legacy protocols that can't redirect (IMAP, SMTP, LDAP clients, database logins) have no browser
to send anywhere. Two standard mitigations. Issue <b>app-specific passwords</b> so the real
credential is never used. Or move the protocol onto <b>OAuth with SASL</b>, which is how modern
mail clients escaped the problem. <b>SASL</b> is Simple Authentication and Security Layer: the
plug-in framework that mail and directory protocols use to negotiate how to log in, so each
protocol doesn't have to invent its own login. With SASL, the client can hand over an OAuth token
instead of a password.</p>
<p><b>The default:</b> redirect. Reach for credential forwarding only when there's no browser in
the flow, and then treat the credential path as high-risk code.</p>`,
docs:[['RFC 6749 §4.3: Resource Owner Password Credentials (and its warnings)','https://www.rfc-editor.org/rfc/rfc6749#section-4.3'],['OAuth 2.0 Security BCP (why ROPC is deprecated)','https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics#name-resource-owner-password-cre'],['RFC 8252: OAuth for Native Apps (use a system browser, not a webview)','https://www.rfc-editor.org/rfc/rfc8252'],['RFC 4513 (LDAP Authentication Methods (bind))','https://www.rfc-editor.org/rfc/rfc4513']],
},

{id:'idfdauthz',title:'Delegated authorization: permission without the password',body:`


<p>The other delegation. Here the user grants an <i>application</i> a bounded slice of their own
access, so it can act for them against an API. This is the problem OAuth 2.0 was invented to
solve.</p>

<h4>The problem it replaced</h4>
<p>A photo-printing site wants the photos in your cloud album. Before OAuth, the only way was to type
your cloud password into the printing site. That is catastrophic in four ways, and they explain
every design decision that follows:</p>
<ul>
<li>The site gets <b>everything</b>, not only photos: mail, contacts, the ability to change your
password.</li>
<li>It lasts <b>forever</b>. There is no expiry on a password.</li>
<li>You can't <b>revoke</b> it without changing your password, which breaks every other app you did
the same thing to.</li>
<li>There is no <b>audit trail</b>. The cloud provider sees your login, not the printing site's.</li>
</ul>
<p>Delegated authorization fixes all four. The user authenticates at the authority, approves a
specific request, and the application receives a token instead of a credential.</p>
<div class="codeSample" data-hl>THE ANTI-PATTERN               DELEGATED AUTHORIZATION
give app your password         app gets a token, never the password
  full account access            only the approved scopes    -> photos:read
  forever                        expires in minutes           -> exp
  revoke = change password       revoke this app alone        -> /revoke
  no record of who did what      calls attributed to the app  -> client_id</div>

<h4>The three moving parts</h4>
<ul>
<li><b>Scope</b>: the named bound on what the resulting token may do:
<code>photos:read</code>, <code>calendar:write</code>. The app <i>requests</i> scopes. The authority
decides what to <i>grant</i>, and the two can differ. Least privilege lives here: a printing service
asks for <code>photos:read</code>, never <code>photos:write</code>.</li>
<li><b>Consent</b>: the authority shows the user what is being requested and the user approves. The
user, not the app, decides. That is why consent screens must name the app and list the scopes in
language a human can evaluate.</li>
<li><b>The grant</b>: the recorded fact that user Y approved app X for scopes Z. It persists after
the token expires. That is what lets a refresh token get a new access token silently, and what the
user deletes when they hit "remove access."</li>
</ul>
<p>The difference between the <b>grant</b> and the <b>token</b> catches people out. Revoking a token
kills one credential. Revoking the <i>grant</i> withdraws the permission, so refreshes stop working
too. "Remove this app's access" means the second one.</p>

<h4>The enforcement side</h4>
<p>Scopes are worthless unless the API checks them. A resource server reads the token's
<code>scope</code> claim and confirms the required scope is present before doing any work. It
must <b>fail closed</b>: an absent or unreadable scope claim means denied, never allowed.</p>
<div class="codeSample" data-hl>// the token carries granted scopes as a space-separated string
"scope": "photos:read profile"

// the API checks before acting, and denies when unsure
if (!granted.contains("photos:read")) throw new ForbiddenException();</div>
<p><b>A scope is not a permission.</b> A scope bounds what the <i>application</i> may attempt on the
user's behalf. The user's own rights still apply underneath. A token with <code>photos:read</code>
doesn't grant access to someone else's photos. Both checks must pass: what the app was allowed to
ask for, and what the user is allowed to see. Treating a scope as the whole authorization decision
is a real and common vulnerability.</p>

<h4>The line back to the previous lesson</h4>
<p>Delegated authentication answers <i>who is this?</i> Delegated authorization answers <i>may this
app do this for them?</i> They are so often bundled (one redirect, one consent screen, tokens for
both) that people assume one implies the other. It doesn't, and the failure mode is specific.</p>
<p><b>An access token is not proof of identity.</b> It says an app was authorized to call an API. It
carries no reliable statement about who the user is, was minted for a different audience, and may
be a token the app obtained for a different user. Applications that "log the user in" by accepting
an access token are exploitable. <b>OpenID Connect</b> closes this gap by adding an ID token (an
authentication statement) alongside OAuth's authorization.</p>`,
docs:[['RFC 6749 §1 (OAuth 2.0: delegated authorization)','https://www.rfc-editor.org/rfc/rfc6749#section-1'],['RFC 6749 §3.3 (Access token scope)','https://www.rfc-editor.org/rfc/rfc6749#section-3.3'],['RFC 7009 (OAuth 2.0 Token Revocation)','https://www.rfc-editor.org/rfc/rfc7009'],['OAuth 2.0 Security BCP','https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics']],
ex:{title:'Enforce a scope, and fail closed',
prompt:`Write <code>Delegation</code> with three methods. <code>static java.util.Set&lt;String&gt; granted(String scope)</code> splits a space-separated scope string into a set, returning an <b>empty set</b> when <code>scope</code> is null or blank (never null, so callers cannot forget to check). <code>static boolean allowed(String scope, String required)</code> returns whether the required scope is present. <code>static boolean canAct(String scope, String required, boolean userOwnsResource)</code> returns true only when <b>both</b> the scope is granted <b>and</b> the user actually owns the resource: a scope bounds the app, it does not grant the user new rights.`,
starter:`import java.util.*;

public class Delegation {
    static Set<String> granted(String scope) {
        return null;
    }
    static boolean allowed(String scope, String required) {
        return false;
    }
    static boolean canAct(String scope, String required, boolean userOwnsResource) {
        return false;
    }
}`,
tests:[{d:'missing scope yields an empty set, not null',re:'Set\\s*\\.\\s*of\\s*\\(\\s*\\)|emptySet\\s*\\(\\s*\\)|new\\s+HashSet\\s*<\\s*>\\s*\\(\\s*\\)'},{d:'null or blank input is handled',re:'==\\s*null|isBlank\\s*\\(\\s*\\)|isEmpty\\s*\\(\\s*\\)'},{d:'splits the space-separated scope string',re:'split\\s*\\('},{d:'membership decides the scope check',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:contains\\s*\\())|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:contains\\s*\\()[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:contains\\s*\\()[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:contains\\s*\\()[^{]*?return\\s+\\k<av>\\b)'},{d:'ownership is required as well as scope',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:&&\\s*userOwnsResource|userOwnsResource\\s*&&))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:&&\\s*userOwnsResource|userOwnsResource\\s*&&)[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:&&\\s*userOwnsResource|userOwnsResource\\s*&&)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:&&\\s*userOwnsResource|userOwnsResource\\s*&&)[^{]*?return\\s+\\k<av>\\b)'}],
behavior:`granted("photos:read profile") contains both scopes; granted(null) and granted("") return an empty set rather than null, so a missing scope claim fails closed. allowed("photos:read", "photos:read") is true; allowed(null, "photos:read") is false. canAct("photos:read", "photos:read", true) is true, but canAct("photos:read", "photos:read", false) is false: the app was authorized to read photos, not to read somebody else's photos.`,
hints:['Return an empty set for missing input: <code>if (scope == null || scope.isBlank()) return Set.of();</code>','<code>return new HashSet&lt;&gt;(Arrays.asList(scope.trim().split(" ")));</code>','Both conditions must hold: <code>return allowed(scope, required) &amp;&amp; userOwnsResource;</code>'],
solution:`import java.util.*;

public class Delegation {
    static Set<String> granted(String scope) {
        // fail closed: no scope claim means no permissions, never null
        if (scope == null || scope.isBlank()) return Set.of();
        return new HashSet<>(Arrays.asList(scope.trim().split(" ")));
    }
    static boolean allowed(String scope, String required) {
        return granted(scope).contains(required);
    }
    static boolean canAct(String scope, String required, boolean userOwnsResource) {
        // a scope bounds the APP; the user's own rights still apply underneath
        return allowed(scope, required) && userOwnsResource;
    }
}`}},

{id:'idfobo',title:'On-behalf-of: carrying "who asked" across services',body:`




<p>A request arrives from Ada at your gateway. The gateway calls the orders service, which calls the
billing service, which calls the ledger. Four hops in, something has to decide whether <i>Ada</i> may
do this. How does her identity survive the chain, and who is accountable for what happens at the
end? That is the <b>on-behalf-of</b> problem.</p>

<h4>Four ways to answer it, from worst to best</h4>
<ol>
<li><b>Trust the network.</b> The downstream service assumes anything reaching it is legitimate,
because it's "inside." One foothold anywhere and an attacker can call anything. This is the model
zero trust exists to kill.</li>
<li><b>Forward the original token unchanged.</b> Tempting and wrong. The token's <code>aud</code>
names the first service, so every later service must ignore the audience check to accept it. Now a
token minted for one service works everywhere. You have built a universal key.</li>
<li><b>Drop the user and call as the service.</b> The downstream sees "orders-service," which is
accurate about the caller but loses the user. The ledger can't enforce Ada's own limits, and the
audit log says a service did it: true, useless.</li>
<li><b>Exchange the token, preserving both identities.</b> The service asks the authority for a
<i>new</i> token, audienced for the next hop, that still names Ada as the subject and records who
is acting. Both facts survive.</li>
</ol>
<div class="flowDia"><svg viewBox="0 0 640 166" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="On-behalf-of chain: each hop gets its own token, still about Ada, naming who is acting"><defs><marker id="idfobo-ah" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent)"/></marker></defs>
<rect x="14" y="20" width="56" height="46" rx="8" class="fdActor"/><text x="42" y="47.5" class="fdActorT">Ada</text>
<line x1="72" y1="43" x2="104" y2="43" stroke="var(--accent)" class="fdArrow" marker-end="url(#idfobo-ah)"/>
<rect x="108" y="20" width="100" height="46" rx="8" class="fdActor"/><text x="158" y="47.5" class="fdActorT">Gateway</text>
<text x="158" y="90" class="fdLabel">aud=gateway</text><text x="158" y="108" class="fdLabel">sub=ada</text><text x="158" y="126" class="fdLabel" style="fill:var(--muted)">(no act yet)</text>
<line x1="210" y1="43" x2="242" y2="43" stroke="var(--accent)" class="fdArrow" marker-end="url(#idfobo-ah)"/>
<rect x="246" y="20" width="100" height="46" rx="8" class="fdActor"/><text x="296" y="47.5" class="fdActorT">Orders</text>
<text x="296" y="90" class="fdLabel">aud=orders</text><text x="296" y="108" class="fdLabel">sub=ada</text><text x="296" y="126" class="fdLabel">act=gateway</text>
<line x1="348" y1="43" x2="380" y2="43" stroke="var(--accent)" class="fdArrow" marker-end="url(#idfobo-ah)"/>
<rect x="384" y="20" width="100" height="46" rx="8" class="fdActor"/><text x="434" y="47.5" class="fdActorT">Billing</text>
<text x="434" y="90" class="fdLabel">aud=billing</text><text x="434" y="108" class="fdLabel">sub=ada</text><text x="434" y="126" class="fdLabel">act=orders</text>
<line x1="486" y1="43" x2="518" y2="43" stroke="var(--accent)" class="fdArrow" marker-end="url(#idfobo-ah)"/>
<rect x="522" y="20" width="100" height="46" rx="8" class="fdActor"/><text x="572" y="47.5" class="fdActorT">Ledger</text>
<text x="572" y="90" class="fdLabel">aud=ledger</text><text x="572" y="108" class="fdLabel">sub=ada</text><text x="572" y="126" class="fdLabel">act=billing</text>
<text x="320" y="156" class="fdNote">each hop gets a token FOR IT, still about Ada, naming who is acting</text>
</svg></div>
<ol class="fdSteps">
<li><b>Ada &rarr; Gateway:</b> <code>aud=gateway</code>, <code>sub=ada</code>; nobody is acting for her yet.</li>
<li><b>Gateway &rarr; Orders:</b> <code>aud=orders</code>, <code>sub=ada</code>, <code>act=gateway</code>.</li>
<li><b>Orders &rarr; Billing:</b> <code>aud=billing</code>, <code>sub=ada</code>, <code>act=orders</code>.</li>
<li><b>Billing &rarr; Ledger:</b> <code>aud=ledger</code>, <code>sub=ada</code>, <code>act=billing</code>.</li>
</ol>

<h4>Delegation vs impersonation</h4>
<p>The difference is whether the acting party is visible downstream:</p>
<ul>
<li><b>Delegation</b>: the token says "Ada, being acted for by orders-service." Both identities
present. The API can apply Ada's rights <i>and</i> know a service did it.</li>
<li><b>Impersonation</b>: the token says "Ada." The downstream can't tell a service is involved.
More authority, and the audit trail now claims Ada did something she never touched.</li>
</ul>
<p>OAuth Token Exchange encodes delegation with an <b>act</b> claim, which nests to record the whole
chain, and gates who may do this with <b>may_act</b> on the original token:</p>
<div class="codeSample" data-hl>// delegation, both identities, chain preserved
{"sub":"ada", "aud":"ledger",
 "act":{"sub":"billing-svc", "act":{"sub":"orders-svc"}}}

// impersonation, the acting party has vanished
{"sub":"ada", "aud":"ledger"}

// may_act on Ada's original token: WHO is allowed to act for her
{"sub":"ada", "may_act":{"sub":"orders-svc"}}

// RFC 8693 is strict about how to READ that chain:
//   the OUTERMOST act is the CURRENT actor - the only one you may use
//   in an access-control decision, alongside the top-level claims.
//   nested act claims are the least-recent actors, and are INFORMATIONAL
//   ONLY. authorizing on a prior actor is a spec violation, and in
//   practice it lets an earlier, more-trusted hop launder authority
//   through a later one.</div>
<p><b>Default to delegation.</b> Reserve impersonation for downstreams that must not distinguish,
such as legacy systems that can't parse an actor. Log who impersonated whom, since the token no
longer records it.</p>

<p>The human version of impersonation, a support agent choosing "view as this customer", carries
enough operational and legal weight to get its own treatment in the next lesson.</p>

<h4>Why you can't just pass a user id</h4>
<p>The obvious shortcut is a header: <code>X-User-Id: ada</code>. It fails because <b>it is
unauthenticated</b>. Any service that can reach the endpoint can claim to be acting for anyone, so
the security of every downstream now rests on perfect network isolation. A token is <i>signed</i>:
the downstream verifies the claim rather than trusting the caller. If you find yourself adding a
shared secret header to make the id trustworthy, you're building a worse token.</p>
<p>The mechanics (the token-exchange grant, request parameters and response) are covered in the
service-to-service stream. What matters here is the shape: <b>every hop needs its own audience, the
subject must survive, and the acting party must be recorded.</b></p>`,
docs:[['RFC 8693 (OAuth 2.0 Token Exchange)','https://www.rfc-editor.org/rfc/rfc8693'],['RFC 8693 §4.1 (the act (actor) claim)','https://www.rfc-editor.org/rfc/rfc8693#section-4.1'],['RFC 8693 §4.4 (the may_act claim)','https://www.rfc-editor.org/rfc/rfc8693#section-4.4'],['NIST SP 800-207 (Zero Trust Architecture)','https://csrc.nist.gov/pubs/sp/800/207/final']],
ex:{title:'Delegation or impersonation? And may the actor act?',
prompt:`Model the two shapes. Write <code>OnBehalfOf</code> with: <code>static String mode(String subject, String actor)</code> returning <code>"invalid"</code> if <code>subject</code> is null, <code>"impersonation"</code> if <code>actor</code> is null (nobody recorded as acting), and <code>"delegation"</code> otherwise. <code>static boolean mayAct(String allowedActor, String actor)</code> returns true only when both are non-null and equal: the may_act check, which must fail closed. <code>static String auditLine(String subject, String actor)</code> returns <code>subject + " (via " + actor + ")"</code> for delegation, or just <code>subject</code> when there is no actor to record.`,
starter:`public class OnBehalfOf {
    static String mode(String subject, String actor) {
        return null;
    }
    static boolean mayAct(String allowedActor, String actor) {
        return false;
    }
    static String auditLine(String subject, String actor) {
        return null;
    }
}`,
tests:[{d:'a missing subject is invalid',re:'(?:if\\s*\\(\\s*subject\\s*=\\s*=\\s*null\\s*\\)[^;}]*?return\\s+["\']invalid["\'])'},{d:'no recorded actor means impersonation',re:'"impersonation"'},{d:'both identities present means delegation',re:'"delegation"'},{d:'may_act requires a configured actor',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:allowedActor\\s*!=\\s*null|null\\s*!=\\s*allowedActor))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:allowedActor\\s*!=\\s*null|null\\s*!=\\s*allowedActor)[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:allowedActor\\s*!=\\s*null|null\\s*!=\\s*allowedActor)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:allowedActor\\s*!=\\s*null|null\\s*!=\\s*allowedActor)[^{]*?return\\s+\\k<av>\\b)'},{d:'may_act compares by value, not reference',re:'equals\\s*\\('},{d:'the audit line records who acted',re:'"\\s*\\(via\\s*"|\\(via'}],
behavior:`mode("ada","orders-svc") returns "delegation"; mode("ada",null) returns "impersonation"; mode(null,"orders-svc") returns "invalid". mayAct("orders-svc","orders-svc") is true, while mayAct(null,"orders-svc") and mayAct("orders-svc","billing-svc") are false: an unset may_act must never mean "anyone may act." auditLine("ada","orders-svc") returns ada (via orders-svc); auditLine("ada",null) returns ada, which is exactly the attribution that impersonation loses.`,
hints:['Check subject first, then actor: two guards before the delegation case.','Fail closed: <code>return allowedActor != null &amp;&amp; allowedActor.equals(actor);</code>','<code>return actor == null ? subject : subject + " (via " + actor + ")";</code>'],
solution:`public class OnBehalfOf {
    static String mode(String subject, String actor) {
        if (subject == null) return "invalid";
        // no act claim: the acting party is invisible downstream
        if (actor == null) return "impersonation";
        return "delegation";
    }
    static boolean mayAct(String allowedActor, String actor) {
        // an absent may_act must never mean "anyone may act"
        return allowedActor != null && allowedActor.equals(actor);
    }
    static String auditLine(String subject, String actor) {
        if (actor == null) return subject;   // attribution is lost
        return subject + " (via " + actor + ")";
    }
}`}},

{id:'idfactas',title:'Acting as a user: support access done safely',body:`




<p>Every serious product eventually needs it. A customer reports a bug nobody can reproduce, and a
support engineer needs to see what <i>they</i> see. So you build "view as this user", and create the
most dangerous feature in the system. It lets one human wear another human's identity.</p>
<p>Unless it's deliberately constrained, this feature is a self-service privilege escalation
mechanism. It reads customer data by design, so it's regulated data access, and regulators treat
it that way.</p>

<h4>The two subjects</h4>
<p>Everything good here follows from one modeling decision: <b>keep two identities, always</b>.</p>
<ul>
<li><b>Authenticated subject</b>: who logged in and holds the session. The support engineer. Never
changes during the session.</li>
<li><b>Effective subject</b>: whose data is being viewed and whose permissions apply. The customer.</li>
</ul>
<p>The naive implementation collapses these into one: mint the <i>customer</i> a session and hand it
to the engineer. It is a few lines of code and it destroys everything downstream. The audit log now
says the customer deleted their own account. Rate limits, notifications and security alerts all
fire as the customer. If the engineer's session is stolen, the thief is the customer. And you can't
answer the only question that matters after an incident: <i>which employee did this?</i></p>
<div class="codeSample" data-hl>WRONG, one subject                RIGHT, two subjects
session { user: "cust-91" }        session { auth: "eng-14",
                                             effective: "cust-91",
                                             reason: "TKT-8823",
                                             expires: 14:32,
                                             readOnly: true }

audit: "cust-91 deleted account"   audit: "eng-14 acting as cust-91: viewed order"</div>

<h4>Permissions: intersect, never inherit</h4>
<p><b>The acting session gets the intersection of what the engineer may do and what the customer can
do, and usually less.</b> Not the union, and not the customer's rights alone.</p>
<p>If acting-as adopted the target's permissions, acting as an <i>administrator</i> would hand the
engineer administrator rights. Support staff would be one click from full control, and so would an
attacker who phished a support account. So privileged targets must be excluded outright, and
destructive operations denied regardless of what either party could normally do.</p>
<ul>
<li><b>Read-only by default.</b> Most support sessions only need to look. Writing should be a
separate, rarer, more-approved capability.</li>
<li><b>Deny the dangerous set always</b>: changing passwords or email, adding MFA factors, deleting
the account, exporting all data, viewing full payment details. (<b>MFA</b> is multi-factor
authentication: proving who you are with two different kinds of evidence, usually a password plus
a phone or a security key. Whoever can add a factor can later log in as the customer.) Each is an
account-takeover primitive.</li>
<li><b>Never act as a privileged account.</b> Admins, other support staff, service accounts:
excluded, or the feature becomes a ladder.</li>
</ul>

<h4>The controls that make it defensible</h4>
<ol>
<li><b>Authorized explicitly.</b> A specific role, and a recorded reason, usually a ticket id.
"Because I could" is not an authorization.</li>
<li><b>Time-boxed.</b> Thirty minutes, not a session that lives until logout. Sessions that never
end are how this becomes routine surveillance.</li>
<li><b>Visible.</b> A persistent banner in the UI. Engineers forget which window they're in, and act
on production data believing it's their own account.</li>
<li><b>Attributed.</b> Every log line, every write, every downstream call carries both identities.
This is the <code>act</code> claim from the previous lesson doing real work.</li>
<li><b>Notified.</b> In consumer and regulated products, tell the user their account was accessed,
who did it and why. Under GDPR this is personal-data access. Under HIPAA it's disclosure.
<b>GDPR</b> is the General Data Protection Regulation, the European data-protection law: keep the
minimum data, have a reason for every field, and be able to delete a person. <b>HIPAA</b> is the
US health-privacy law: it requires access controls and an audit log of who saw which patient
record, and it treats looking at a record as a disclosure that has to be accounted for.</li>
<li><b>Reviewed.</b> Someone reads the acting-as log. A control nobody inspects is decoration, and
this is the log that catches an employee browsing a celebrity's account.</li>
</ol>

<h4>Prefer the weaker tool</h4>
<p>Most "I need to act as them" requests are really "I need to see what they see." Take the lowest
rung that solves the problem:</p>
<div class="codeSample" data-hl>LOWEST RISK   diagnostics view, their config and flags, none of their content
              redacted view, their screens, sensitive fields masked
              read-only act-as, full view, no writes, banner, time-boxed
HIGHEST RISK  write act-as, separate approval, narrow allowlist, notify</div>
<p>One alternative beats all of them when it fits: <b>ask the user to share their session</b>, by
screen share or a support link they generate themselves. Consent given directly by the person, in
the moment, is stronger than any control you can build on your side.</p>`,
docs:[['RFC 8693 §4.1 (the act (actor) claim)','https://www.rfc-editor.org/rfc/rfc8693#section-4.1'],['OWASP (Logging & audit cheat sheet)','https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html'],['NIST SP 800-53 AC-6 (Least Privilege)','https://csrc.nist.gov/projects/risk-management/sp800-53-controls/release-search#!/control?version=5.1&number=AC-6']],
ex:{title:'A safe acting-as session',lang:'js',
run:{call:'canDo',cases:[{name:'password change is always denied',args:['change-password',true],expect:false},{name:'email change is always denied',args:['change-email',true],expect:false},{name:'account deletion is always denied',args:['delete-account',true],expect:false},{name:'data export is always denied',args:['export-data',true],expect:false},{name:'an unapproved write is refused',args:['write:note',false],expect:false},{name:'an approved write is allowed',args:['write:note',true],expect:true},{name:'reads are the normal case',args:['view-orders',false],expect:true}]},
prompt:`Write three functions. <code>permitted(actorRole, targetIsPrivileged)</code> returns <code>true</code> only when <code>actorRole</code> is <code>"support"</code> and the target is <b>not</b> privileged. <code>canDo(action, writeApproved)</code> returns <code>false</code> for the always-denied actions <code>"change-password"</code>, <code>"change-email"</code>, <code>"delete-account"</code> and <code>"export-data"</code>; otherwise it returns <code>writeApproved</code> when the action starts with <code>"write:"</code>, and <code>true</code> for anything else. <code>audit(authSubject, effectiveSubject, action)</code> returns <code>authSubject + " acting as " + effectiveSubject + ": " + action</code>.`,
starter:`function permitted(actorRole, targetIsPrivileged) {
  return false;
}
function canDo(action, writeApproved) {
  return false;
}
function audit(authSubject, effectiveSubject, action) {
  return null;
}`,
solution:`function permitted(actorRole, targetIsPrivileged) {
  // never act as an admin: that turns support into a privilege ladder
  return actorRole === "support" && !targetIsPrivileged;
}
function canDo(action, writeApproved) {
  const denied = ["change-password", "change-email", "delete-account", "export-data"];
  if (denied.indexOf(action) >= 0) return false;   // takeover primitives
  if (action.indexOf("write:") === 0) return writeApproved;
  return true;                                     // reads are normal
}
function audit(authSubject, effectiveSubject, action) {
  // both subjects, always: the whole point of not collapsing them
  return authSubject + " acting as " + effectiveSubject + ": " + action;
}`,
tests:[{d:'only the support role may act as anyone',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:"support"))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:"support")[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:"support")[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:"support")[^{]*?return\\s+\\k<av>\\b)'},{d:'privileged targets are excluded',re:'!\\s*targetIsPrivileged'},{d:'account-takeover actions are always denied',re:'"change-password"'},{d:'data export is always denied',re:'"export-data"'},{d:'writes need separate approval',re:'write:[^;"\']*["\'][^;"\']*?writeApproved\\b'},{d:'the audit line keeps the acting identity',re:'acting as'},{d:'the audit line keeps the effective identity',re:'effectiveSubject'},{d:'a guard returns its constant, not the negation of it',re:'return\\s+!\\s*\\(?\\s*(?:true|false)\\s*\\)?\\s*;',not:true}],
behavior:`The denied list is checked with writeApproved set to true in every case, so an implementation that lets approval override the always-denied actions fails four named tests. permitted("support",true) is false because acting as a privileged account would escalate the engineer, and audit() keeps both subjects, the line that answers "which employee did this?"`,
hints:['<code>return actorRole === "support" &amp;&amp; !targetIsPrivileged;</code>','Check the denied list first and return false, before considering the write prefix.','<code>if (action.indexOf("write:") === 0) return writeApproved; return true;</code>']}},

{id:'idfciam',title:'CIAM vs workforce IAM: two disciplines, one vocabulary',body:`




<p>Almost every identity conversation inside an organization is really two conversations. Treating
them as one produces decisions that are wrong for both populations. The protocols are identical.
The answers are not.</p>

<h4>The same word, two different jobs</h4>
<p><b>Workforce IAM</b> governs the people your organization employs: staff, contractors, and the
systems they use. <b>CIAM</b> (Customer Identity and Access Management) governs the people your
organization <i>sells to</i>. Both authenticate humans. Both use OAuth, OIDC and SAML. (<b>OIDC</b> is OpenID Connect, a thin
layer on top of OAuth that adds a signed statement of who logged in. <b>SAML</b> is Security
Assertion Markup Language, the older, XML-based standard for single sign-on between companies, and
still what most enterprise single sign-on runs on.) Everything else differs.</p>
<div class="codeSample" data-hl>                     WORKFORCE                  CIAM
who creates it       HR does, from a hire       the person does, unprompted
identity source      AUTHORITATIVE (the HR      SELF-ASSERTED and unverified
                     system says they exist)
population           hundreds to thousands      millions to hundreds of millions
growth               predictable, budgeted      spiky, campaign-driven
friction             a cost of employment       a directly measurable revenue loss
you can mandate      MFA, devices, policy       almost nothing
the failure mode     over-access accumulating   abandoned signup, or a PII breach
downtime means       staff cannot work          customers cannot buy
who owns it          IT / security              usually product and marketing
regulated by         SOX, internal audit        GDPR, CCPA, consumer law</div>

<h4>What follows from an authoritative source</h4>
<p>Workforce identity has something CIAM will never have: <b>a system of record that decides who
exists</b>. HR says a person was hired, holds this job, reports to that manager, and left on this
date. Everything downstream derives from it: birthright access on joining, recalculation on
transfer, deprovisioning within minutes of termination.</p>
<p>That is what makes governance possible. Access reviews, joiner-mover-leaver, entitlement
certification and separation of duties all assume you can enumerate your people and ask an
authority whether each one still belongs. <b>None of that machinery transfers to CIAM.</b> There is
no HR system for your customers and nobody to certify that a shopper still needs their account.</p>

<h4>What follows from having no coercive power</h4>
<p>You can require an employee to enroll a security key. You can't require a customer to do
anything. They will leave. So the CIAM toolkit is different in kind:</p>
<ul>
<li><b>Registration is a funnel.</b> Every additional field measurably reduces completion. It is the
one place a security control has an attributable revenue cost, which is why marketing is in the
room for CIAM decisions and not for workforce ones.</li>
<li><b>Progressive profiling</b> replaces the long form: collect the minimum at signup and ask for
more when the customer understands why.</li>
<li><b>MFA is offered and risk-triggered</b>, not mandated: step up on a new device, a payment
change, an unusual location.</li>
<li><b>Account recovery is the real attack surface.</b> Workforce recovery routes through a helpdesk
that can verify a human. Consumers have only email and SMS, so the recovery path is usually weaker
than the login path, and attackers go there first.</li>
<li><b>Consent and data rights are legal obligations.</b> Deletion must delete, across every
downstream system, on request.</li>
<li><b>Scale is a design constraint</b>, not a capacity plan. Identity is the front door. If it's
down, everything is down.</li>
</ul>

<h4>How an organization should run them</h4>
<p><b>Separate the tenants, always.</b> A <b>tenant</b> is one customer organization, or here one
population, inside a shared system. Customers and employees must not share a user store, even
when the same product could serve both. One breach then reaches one population, an employee can't
accidentally be granted a customer entitlement, and each can be governed under the regime that
applies to it.</p>
<p><b>Separate the ownership, and say so.</b> Workforce identity belongs with IT and security,
measured on control: time to deprovision, review completion, standing privilege. CIAM belongs with
product, measured on experience: signup completion, login success rate, recovery success, support
contacts per thousand users. Running both against one set of metrics produces a CIAM that is
hostile to use, or a workforce estate no auditor will accept.</p>
<p><b>Share what is shared.</b> The protocols, the token-validation library, the incident response
process, the logging pipeline, and the expertise. Duplicating those is how the customer-facing
system ends up with weaker practices than the internal one.</p>
<p><b>Name the third population.</b> <b>B2B</b> is neither. These are business customers whose own
administrators manage their own users, bring their own IdP, and see only their own tenant. It
needs delegated administration, per-tenant federation and tenant isolation. Forcing it into either model is a
common and expensive error. The multi-tenancy lesson takes it properly.</p>

<h4>The question to ask first</h4>
<p>Before any identity decision, ask <b>which population</b> it is for. "Should we require MFA?" has
no answer until you know. For workforce: yes, phishing-resistant, mandated. For consumers: "offer
it, incentivize it, trigger it on risk, and never let it block a purchase".</p>`,
docs:[['Gartner (CIAM)','https://www.gartner.com/en/information-technology/glossary/customer-identity-and-access-management-ciam'],['NIST SP 800-63 (digital identity guidelines)','https://pages.nist.gov/800-63-3/'],['GDPR (Art. 17 right to erasure)','https://gdpr-info.eu/art-17-gdpr/']],
},

{id:'idfzt',title:'Zero trust: identity as the perimeter',body:`






<p>Everything so far points at one architectural idea: tokens with audiences, verifying every
signature, delegation that names the acting party. Zero trust is the name for it, and it's best
understood as a reaction to the model it replaced.</p>

<h4>The model that failed</h4>
<p>The old design was a <b>perimeter</b>: a hard boundary with a firewall and a VPN. A <b>VPN</b>
is a virtual private network, an encrypted tunnel that makes a remote machine appear to be inside
the company network. Inside that boundary was a soft interior where services trusted each other because they were "on the network." Authentication
happened once, at the edge. Being inside <i>was</i> the authorization.</p>
<p>It failed for reasons that all arrived at once:</p>
<ul>
<li><b>There is no inside any more.</b> Work moved to laptops in homes and cafés, and workloads moved
to cloud accounts you don't own.</li>
<li><b>SaaS lives outside it.</b> Your most sensitive data sits in applications the firewall never
sees.</li>
<li><b>Lateral movement.</b> One phished laptop lands the attacker <i>inside</i>, where nothing checks
anything. The perimeter stops outsiders and is useless the moment it's crossed.</li>
<li><b>Supply chain.</b> A compromised dependency runs inside your network by definition.</li>
</ul>
<p>Breach reports rarely describe a defeated firewall. They describe a modest initial foothold
followed by months of unchallenged movement, because nothing behind the wall asked a second
question.</p>

<h4>The principle</h4>
<div class="codeSample" data-hl>PERIMETER MODEL                    ZERO TRUST
"where are you connecting from?"   "who are you, and may you do THIS, right now?"
trust = network location           trust = verified identity + policy, per request
authenticate once at the edge      authenticate and authorize every request
flat interior, free movement       every hop is a checkpoint
breach = total access              breach = one narrow, short-lived credential</div>
<p><b>Never trust, always verify</b>, and note the word <i>always</i>. Not once at login, not once
per session. Every request re-establishes who is asking and whether they may. That sounds
expensive. A signed, audience-scoped, short-lived token makes it cheap: verification is a local
signature check, not a database lookup.</p>

<h4>What it means concretely</h4>
<ol>
<li><b>Every request carries a verifiable identity.</b> A user token, or a workload certificate for
a service. Never an unauthenticated header, and never an IP address. An IP is a routing detail
that can be spoofed, reassigned, or shared by thousands of people.</li>
<li><b>Authorize per request, not per session.</b> The decision is made at a policy point each
time, so revoked access takes effect in seconds rather than whenever the session expires.</li>
<li><b>Least privilege, expressed narrowly.</b> Tokens audienced for one service, scoped to one job,
valid for minutes. This is why audience checks matter: a token that works everywhere has recreated
the flat interior inside your token format.</li>
<li><b>Assume breach.</b> Design so that a stolen credential yields the smallest, shortest-lived
capability you can arrange, and so the damage is visible in a log.</li>
<li><b>Use context as a signal.</b> Device posture, location, time and behavioral anomalies feed the
decision, and can trigger step-up authentication, which means asking for a stronger login (a
second factor) only when the action warrants it. Context is <i>evidence</i>, never identity: "on
the corporate network" is one input to a decision, not a reason to skip it.</li>
</ol>

<h4>The decision point</h4>
<p>Zero trust needs somewhere the answer is computed. Two roles recur under many product names:</p>
<div class="flowDia"><svg viewBox="0 0 640 262" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Policy enforcement point and policy decision point"><defs><marker id="idfzt-ah" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent)"/></marker></defs>
<text x="40" y="30" class="fdLabel">request</text>
<line x1="12" y1="39" x2="66" y2="39" stroke="var(--accent)" class="fdArrow" marker-end="url(#idfzt-ah)"/>
<rect x="70" y="16" width="160" height="46" rx="8" class="fdActor"/><text x="150" y="35" class="fdActorT">PEP</text><text x="150" y="50" class="fdActorS">policy enforcement point</text>
<text x="250" y="35" class="fdLabel" style="text-anchor:start">sidecar, gateway, middleware</text>
<text x="250" y="51" class="fdLabel" style="text-anchor:start">intercepts, then obeys the verdict</text>
<line x1="150" y1="62" x2="150" y2="106" stroke="var(--accent)" class="fdArrow" marker-end="url(#idfzt-ah)"/>
<rect x="70" y="110" width="160" height="46" rx="8" class="fdActor"/><text x="150" y="129" class="fdActorT">PDP</text><text x="150" y="144" class="fdActorS">policy decision point</text>
<text x="250" y="129" class="fdLabel" style="text-anchor:start">evaluates identity + resource + action + context</text>
<text x="250" y="145" class="fdLabel" style="text-anchor:start">against policy</text>
<line x1="150" y1="156" x2="150" y2="200" stroke="var(--accent)" class="fdArrow" marker-end="url(#idfzt-ah)"/>
<rect x="70" y="204" width="160" height="46" rx="8" class="fdActor"/><text x="150" y="231.5" class="fdActorT">permit / deny</text>
<text x="250" y="231" class="fdLabel fdLabelBad" style="text-anchor:start">and it must DENY when it cannot decide</text>
</svg></div>
<ol class="fdSteps">
<li><b>Request &rarr; PEP:</b> the policy enforcement point (a sidecar, gateway or middleware) intercepts the request, then obeys the verdict.</li>
<li><b>PEP &rarr; PDP:</b> the policy decision point evaluates identity + resource + action + context against policy.</li>
<li><b>PDP &rarr; verdict:</b> permit or deny, and it must deny when it cannot decide.</li>
</ol>
<p><b>Fail closed.</b> A policy engine that is unreachable, a signature that can't be verified, a
claim that won't parse: all deny. A system that fails open under load is a system an attacker will
overload on purpose.</p>

<h4>What zero trust is not</h4>
<ul>
<li><b>Not a product.</b> Nothing you buy makes you zero trust. Vendors selling "a zero trust
solution" are selling one component of an architecture.</li>
<li><b>Not "MFA everywhere."</b> <b>MFA</b> is multi-factor authentication: proving who you are
with two different kinds of evidence, usually a password plus a phone or a security key. Strong
authentication is necessary and nowhere near sufficient. MFA at the edge with a flat interior
behind it is still the perimeter model.</li>
<li><b>Not "no trust."</b> The name is unhelpful. Trust is granted constantly. It is explicit,
narrow, evidenced and short-lived, rather than implied by a network cable.</li>
<li><b>Not all-or-nothing.</b> Real adoption is incremental: identity-aware access to one
application, mTLS between two services, removing one flat network segment.</li>
</ul>
<p>The service-to-service stream covers the machinery: mTLS, SPIFFE workload identity, mesh policy.
<b>SPIFFE</b> is the Secure Production Identity Framework for Everyone: a standard for giving each
running service its own short-lived identity document, based on where and how it is running, so
services can prove who they are to each other without stored passwords. The idea to carry there: <b>identity replaced the network as the thing access decisions are made
on.</b></p>`,
docs:[['NIST SP 800-207 (Zero Trust Architecture)','https://csrc.nist.gov/pubs/sp/800/207/final'],['NIST SP 800-207 §2 (the seven tenets)','https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-207.pdf'],['CISA (Zero Trust Maturity Model)','https://www.cisa.gov/zero-trust-maturity-model'],['Google BeyondCorp','https://cloud.google.com/beyondcorp']],
ex:{title:'A policy decision point that fails closed',
prompt:`Write <code>ZeroTrust</code> with <code>static boolean permit(String subject, String requiredScope, java.util.Set&lt;String&gt; grantedScopes, boolean policyEngineReachable)</code> returning <code>true</code> only when <b>all</b> of these hold: the policy engine is reachable, <code>subject</code> is non-null (an unauthenticated request is never permitted), <code>grantedScopes</code> is non-null, and it contains <code>requiredScope</code>. Anything else denies. Then <code>static boolean trustNetwork(String sourceIp)</code>: return <code>false</code> unconditionally, whatever the address, because network location is never identity.`,
starter:`import java.util.*;

public class ZeroTrust {
    static boolean permit(String subject, String requiredScope, Set<String> grantedScopes, boolean policyEngineReachable) {
        return false;
    }
    static boolean trustNetwork(String sourceIp) {
        return false;
    }
}`,
tests:[{d:'an unreachable policy engine denies',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:policyEngineReachable))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:policyEngineReachable)[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:policyEngineReachable)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:policyEngineReachable)[^{]*?return\\s+\\k<av>\\b)'},{d:'an unauthenticated request denies',re:'subject\\s*!=\\s*null|null\\s*!=\\s*subject'},{d:'a missing scope set denies rather than throwing',re:'grantedScopes\\s*!=\\s*null|null\\s*!=\\s*grantedScopes'},{d:'the required scope must be present',re:'contains\\s*\\(\\s*requiredScope\\s*\\)'},{d:'every condition must hold',re:'&&'},{d:'network location is never trusted',re:'return\\s+false'}],
behavior:`permit("ada","orders:read",Set.of("orders:read"),true) is true. Each of these is false: policyEngineReachable false (fail closed: an attacker who can overload your policy engine must not thereby be allowed in), subject null (no verified identity, no access), grantedScopes null (a missing scope claim denies instead of throwing), or the required scope absent. trustNetwork returns false for "10.0.0.5" and for any other address: an internal IP is a routing detail, it can be spoofed or reassigned, and treating it as identity is the perimeter model that zero trust exists to replace.`,
hints:['One expression, all conditions joined with &amp;&amp;, starting with the reachability check.','Check <code>grantedScopes != null</code> before calling <code>contains</code>, so a missing claim denies rather than throwing.','<code>trustNetwork</code> genuinely just returns false; that is the lesson, not a placeholder.'],
solution:`import java.util.*;

public class ZeroTrust {
    static boolean permit(String subject, String requiredScope, Set<String> grantedScopes, boolean policyEngineReachable) {
        // fail closed on every axis: no decision, no identity, no claim -> deny
        return policyEngineReachable
            && subject != null
            && grantedScopes != null
            && grantedScopes.contains(requiredScope);
    }
    static boolean trustNetwork(String sourceIp) {
        // never. an IP is a routing detail, not an identity
        return false;
    }
}`}},

{id:'idfapikey',title:'API keys: the pattern everyone uses and nobody teaches',body:`




<p>Look at any real system and you will find API keys everywhere, far more common than OAuth. They
survive because they are the least effort that works: one string, one header, done. Most of the damage
they cause is avoidable.</p>

<h4>What an API key is</h4>
<p>An API key is a <b>long-lived, opaque bearer token identifying an application rather than a
person</b>. Every word there matters:</p>
<ul>
<li><b>Long-lived</b>: usually no expiry. An access token lasts minutes. A key issued in 2019 is
probably still valid.</li>
<li><b>Opaque</b>: a random string that must be looked up. No claims, no signature, nothing to verify
offline.</li>
<li><b>Bearer</b>: whoever holds it can use it. No proof of possession, no audience, no binding to a
caller. An <b>audience</b> is who a token is for; a key has none, so it works anywhere it is accepted.</li>
<li><b>Identifies an application</b>: there is no user. "Who did this?" can only be answered as
"whichever integration holds this key."</li>
</ul>
<p>Against an OAuth access token, keys win on simplicity and lose on everything else.</p>
<div class="codeSample" data-hl>                 API KEY                    OAUTH ACCESS TOKEN
lifetime         forever (usually)          minutes
scope            often all-or-nothing       explicit scopes
subject          an application             a user, or a service
audience         none, works anywhere      one API (aud)
revocation       delete the row (instant)   hard: valid until exp
verification     lookup on every call       offline signature check
setup cost       ten minutes                a real integration</div>
<p>Keys are <i>better</i> at revocation, because they are opaque: deleting the row kills them at once.
The problem is the lifetime and the sprawl.</p>

<h4>How they leak</h4>
<p>Keys leak in a few predictable ways. Knowing the list is most of the defense:</p>
<ul>
<li><b>Committed to git.</b> Rewriting history does not help. Assume anything pushed is public forever
and rotate.</li>
<li><b>Put in a URL query string.</b> URLs land in server logs, proxy logs, browser history and
<code>Referer</code> headers sent to third parties. Keys belong in a header.</li>
<li><b>Shipped in a mobile app or SPA bundle.</b> Anything downloaded to a device is public. The key is
extractable in minutes.</li>
<li><b>Shared between environments and teams.</b> One key used by six integrations cannot be rotated
without breaking five, so it never gets rotated.</li>
<li><b>Logged by accident</b> by a middleware that dumps request headers on error.</li>
</ul>

<h4>Doing them properly</h4>
<p>If you issue keys, a few choices separate a manageable credential from an incident:</p>
<ol>
<li><b>Give every key an identifiable prefix</b>: <code>sk_live_</code>, <code>ghp_</code>. It costs
nothing. Secret scanners can spot the key in a public repo before an attacker does, and an engineer can
tell at a glance what they are holding.</li>
<li><b>Store only a hash.</b> Treat keys like passwords: hash at rest, compare on lookup. Show the
plaintext once, at creation.</li>
<li><b>One key per integration.</b> You can revoke one without an outage, and the audit log can say
<i>which</i> integration did something.</li>
<li><b>Scope them.</b> Read-only keys for read-only integrations. Most keys get full account power
because scoping was never offered.</li>
<li><b>Record last-used and support rotation with overlap.</b> "Last used" tells you which keys are
dead. Two live keys at once is what makes rotation possible without downtime.</li>
<li><b>Compare in constant time</b> and rate-limit by key, closing off lookup timing and brute force.</li>
</ol>

<h4>When to use one</h4>
<p>Keys are right for server-to-server integrations a human sets up once: a webhook receiver, a CI job,
an internal script. <b>CI</b> is continuous integration: the automated pipeline that builds and tests code
on every change. It runs as its own identity and often holds credentials. They are wrong whenever a <i>user</i> is involved, because a key cannot represent
one. They are wrong wherever the user can read the code, because then the key is not a secret.</p>
<p>The modern replacement in cloud and CI is <b>workload identity federation</b>. The workload proves
what it is and exchanges that for a short-lived token, so no static credential exists to leak. That is
the lesson after next.</p>`,
docs:[['OWASP (Secrets Management Cheat Sheet)','https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html'],['GitHub (Secret scanning partner program)','https://docs.github.com/en/code-security/secret-scanning/introduction/about-secret-scanning'],['RFC 6750 §2.3 (why credentials do not belong in URIs)','https://www.rfc-editor.org/rfc/rfc6750#section-2.3']],
ex:{title:'Issue and check an API key safely',
prompt:`Write <code>ApiKeys</code> with three methods. <code>static boolean looksLikeOurKey(String key)</code> returns true only when <code>key</code> is non-null and starts with the prefix <code>"sk_live_"</code>, the prefix that lets secret scanners find leaked keys. <code>static boolean validPlacement(String header, String queryParam)</code> returns true only when the key arrived in the <code>header</code> (non-null) and <code>queryParam</code> is null, because a key in a URL leaks through logs and Referer headers. <code>static boolean matches(String presentedHash, String storedHash)</code> compares two hashes, returning false if either is null; you store a hash, never the key itself.`,
starter:`public class ApiKeys {
    static final String PREFIX = "sk_live_";

    static boolean looksLikeOurKey(String key) {
        return false;
    }
    static boolean validPlacement(String header, String queryParam) {
        return false;
    }
    static boolean matches(String presentedHash, String storedHash) {
        return false;
    }
}`,
tests:[{d:'keys carry a scannable prefix',re:'"sk_live_"'},{d:'null keys are rejected before inspection',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:key\\s*!=\\s*null|null\\s*!=\\s*key))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:key\\s*!=\\s*null|null\\s*!=\\s*key)[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:key\\s*!=\\s*null|null\\s*!=\\s*key)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:key\\s*!=\\s*null|null\\s*!=\\s*key)[^{]*?return\\s+\\k<av>\\b)'},{d:'the prefix is checked',re:'startsWith\\s*\\('},{d:'the key must arrive in a header',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:header\\s*!=\\s*null|null\\s*!=\\s*header))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:header\\s*!=\\s*null|null\\s*!=\\s*header)[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:header\\s*!=\\s*null|null\\s*!=\\s*header)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:header\\s*!=\\s*null|null\\s*!=\\s*header)[^{]*?return\\s+\\k<av>\\b)'},{d:'a key in the query string is refused',re:'queryParam\\s*==\\s*null|null\\s*==\\s*queryParam'},{d:'hashes are compared, and nulls rejected',re:'(?:if\\s*\\(\\s*[^;{]*(?:storedHash\\s*[=!]=\\s*null|null\\s*[=!]=\\s*storedHash)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:return\\s+(?!\\s*!)[^;{]*(?:storedHash\\s*[=!]=\\s*null|null\\s*[=!]=\\s*storedHash))|(?:(?<h1>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:storedHash\\s*[=!]=\\s*null|null\\s*[=!]=\\s*storedHash)[^{]*?return\\s+\\k<h1>\\b)'},{d:'comparison is by value',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:equals\\s*\\())|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:equals\\s*\\()[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:equals\\s*\\()[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:equals\\s*\\()[^{]*?return\\s+\\k<av>\\b)'}],
behavior:`looksLikeOurKey("sk_live_abc123") is true; looksLikeOurKey("abc123") and looksLikeOurKey(null) are false. validPlacement("sk_live_abc", null) is true, but validPlacement(null, "sk_live_abc") and validPlacement("sk_live_abc", "sk_live_abc") are both false: once the key is in the URL it is already in your access logs, so accepting it there at all trains callers to leak. matches("h1","h1") is true; matches(null,"h1") and matches("h1",null) are false, so an unknown key can never accidentally match a missing stored value.`,
hints:['<code>return key != null &amp;&amp; key.startsWith(PREFIX);</code>','Both conditions matter: a header present <i>and</i> no query parameter at all.','Guard both arguments before <code>equals</code>, so null never equals null here.'],
solution:`public class ApiKeys {
    static final String PREFIX = "sk_live_";

    static boolean looksLikeOurKey(String key) {
        // the prefix is what lets secret scanners catch a leaked key
        return key != null && key.startsWith(PREFIX);
    }
    static boolean validPlacement(String header, String queryParam) {
        // a key in the query string is already in logs, history and Referer
        return header != null && queryParam == null;
    }
    static boolean matches(String presentedHash, String storedHash) {
        // we store a hash, never the key: nothing usable sits in the database
        if (presentedHash == null || storedHash == null) return false;
        return presentedHash.equals(storedHash);
    }
}`}},

{id:'idfcapurl',title:'Capability URLs: when the link is the credential',body:`


<p>You have used dozens of these today. A password-reset email, an "anyone with this link can view"
document, a presigned download that works without logging in. There is no session and no token header:
<b>the URL itself is the credential</b>. Holding the link <i>is</i> the authorization.</p>
<p>The pattern is called a <b>capability URL</b>. It works in email, for people without accounts, with
no login. It also fails in ways ordinary credentials do not, because URLs are handled by software that
assumes they are not secret.</p>

<h4>The three properties that define one</h4>
<ul>
<li><b>Unguessable.</b> The secret is the only protection, so it needs 128 or more cryptographically
random bits. Never a sequential id, a timestamp, or a hash of the user's email.</li>
<li><b>Self-contained.</b> No other authentication is required. That is the feature and the risk.</li>
<li><b>Bounded.</b> A capability grants one specific thing (view <i>this</i> document, reset
<i>this</i> password) and should expire.</li>
</ul>

<h4>Why URLs leak in ways headers do not</h4>
<p>A token in an <code>Authorization</code> header travels a narrow, well-understood path. A URL passes
through a great deal of software that treats it as public metadata:</p>
<div class="codeSample" data-hl>a capability URL passes through, and is often retained by:

  server access logs         every proxy, load balancer and CDN in the path
  browser history            and it syncs across the user's devices
  the Referer header         sent to any third party the page links to or loads
  email scanners             corporate security gateways FETCH links to check them
  chat and ticket systems    pasted "so you can see what I mean"
  analytics and error trackers  full URL captured with the page view</div>
<p><b>Referer leakage</b>: if the page at a capability URL loads an external script or has an outbound
link, the full URL can be handed to that third party. Set <code>Referrer-Policy: no-referrer</code> on
those pages. <b>Link prefetching by scanners</b>: corporate mail gateways visit links to check them for
malware, so a single-use link can be consumed before the human clicks it. This is a real bug in
password-reset flows.</p>

<h4>The rules</h4>
<ol>
<li><b>Short expiry.</b> Minutes for a password reset, hours or days for a share link. An eternal
capability URL is a permanent unauthenticated back door.</li>
<li><b>Single use where the action is sensitive.</b> Consume the token on use, so a leaked reset link
in an inbox is already spent. Require a POST, so a GET from a scanner does not consume it.</li>
<li><b>Bind to the action, not only the resource.</b> A reset token should reset one account's
password and nothing else.</li>
<li><b>Put nothing sensitive in the path.</b> No email addresses, names or account numbers. All of
that goes into logs and history.</li>
<li><b>Re-authenticate before anything irreversible.</b> Deleting an account or changing an email
should require a real login, not possession of a link.</li>
<li><b>Make them revocable and visible.</b> Users should be able to see active share links and kill
them.</li>
<li><b>Log the use, not the URL.</b> Record that capability <code>abc123</code> was used. Never write
the secret to a log.</li>
</ol>

<h4>Two flavors</h4>
<p><b>Stored capabilities</b>: a random token in a database row recording what it grants and when it
expires. Revocable at once, needs a lookup. Password resets should be this.</p>
<p><b>Signed capabilities</b>: the parameters are in the URL with an HMAC signature, so the server
verifies without storing anything. Cloud presigned URLs work this way. Stateless and scalable, but
<i>not revocable</i> before expiry. This is the structured-versus-opaque trade-off from the token
lesson, in a URL.</p>
<div class="codeSample" data-hl>// stored: the token means nothing without the row
https://app.example.com/reset?t=9f3a7c1e5b8d4a2f6c0e9b7d3a5f1c8e

// signed: the URL carries its own terms, verified by HMAC
https://files.example.com/report.pdf
    ?expires=1767225600&amp;scope=read&amp;sig=b41c9e...
// change any parameter and the signature no longer matches</div>
<p>Pick stored when you need revocation and an audit trail. Pick signed when you need scale and can
live with "valid until it expires."</p>`,
docs:[['W3C TAG (Good Practices for Capability URLs)','https://www.w3.org/TR/capability-urls/'],['MDN (Referrer-Policy)','https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy'],['OWASP (Forgot Password Cheat Sheet)','https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html']],
ex:{title:'Is this capability token strong enough?',lang:'js',
run:{call:'strongEnough',cases:[{name:'128 bits of base64url-ish entropy',args:['a'.repeat(22)],expect:true},{name:'a short guessable token',args:['abc123'],expect:false},{name:'an empty token',args:[''],expect:false},{name:'a sequential id is not a capability',args:['1042'],expect:false}]},
prompt:`Write <code>function strongEnough(token)</code> that returns <code>true</code> only when the token is at least <b>22 characters</b>, roughly 128 bits once base64url-encoded. In a capability URL the link <i>is</i> the credential, so anything guessable is an open door.`,
starter:`function strongEnough(token) {
  return false;
}`,
solution:`function strongEnough(token) {
  return token.length >= 22;
}`,
tests:[{d:'requires at least 22 characters of entropy',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:token\\.length\\s*>=\\s*22))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:token\\.length\\s*>=\\s*22)[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:token\\.length\\s*>=\\s*22)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:token\\.length\\s*>=\\s*22)[^{]*?return\\s+\\k<av>\\b)'},{d:'does not hardcode a result',re:'strongEnough\\s*\\([^)]*\\)\\s*\\{\\s*return\\s+(true|false)\\s*;',not:true}],
behavior:`A sequential id is executed as its own case, because that is the real-world mistake: a URL containing a database id is not a capability, it is an invitation to enumerate. Remember the rest of the lesson too: a strong token still leaks through Referer headers, mail scanners that follow links, and browser history.`,
hints:['One comparison on the length is enough.','22 base64url characters is about 128 bits.','Anything shorter is guessable at scale.']}},

{id:'idfassume',title:'Assuming a role: short-lived credentials across accounts',body:`






<p>A deployment job needs to write to a production bucket in another cloud account. The lazy answer is
a long-lived access key pasted into the CI system. <b>CI</b> is continuous integration: the automated
pipeline that builds and tests code on every change. It runs as its own identity and often holds
credentials. The pattern that replaced it is <b>role
assumption</b>: prove who you are, then exchange that for a temporary credential scoped to a specific
role, with nothing durable to steal.</p>
<p>This is the same delegation idea as token exchange, applied to infrastructure. Treat it as identity,
not cloud trivia.</p>

<h4>The mechanics</h4>
<p>A <b>role</b> is a named bundle of permissions that nobody owns. It has two policies, and confusing
them causes most of the pain:</p>
<ul>
<li><b>The trust policy</b>: <i>who is allowed to assume this role.</i> An identity question.</li>
<li><b>The permission policy</b>: <i>what the role can do once assumed.</i> An authorization
question.</li>
</ul>
<p>Assuming the role returns a temporary credential, typically valid for an hour. The caller's
effective permissions are the <b>intersection</b> of what the role grants and what any session policy
allows. Use that: assume the role with less than it offers when the task needs less.</p>
<!--flow:idfassume-role-->
<h4>Assuming a role, step by step</h4>
<div class="flowDia"><svg viewBox="0 0 640 286" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Role assumption: CI in account A assumes a role in account B"><defs><marker id="idfassume-role-ah-front" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent)"/></marker><marker id="idfassume-role-ah-back" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent2)"/></marker><marker id="idfassume-role-ah-attack" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--bad)"/></marker><marker id="idfassume-role-ah-x" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--muted)"/></marker></defs><line x1="74" y1="54" x2="74" y2="260" class="fdLife"/><line x1="320" y1="54" x2="320" y2="260" class="fdLife"/><line x1="566" y1="54" x2="566" y2="260" class="fdLife"/><rect x="20.2" y="8" width="107.6" height="46" rx="8" class="fdActor"/><text x="74" y="27" class="fdActorT">ci-runner</text><text x="74" y="42" class="fdActorS">Account A (CI)</text><rect x="240.6" y="8" width="158.8" height="46" rx="8" class="fdActor"/><text x="320" y="27" class="fdActorT">deploy-role</text><text x="320" y="42" class="fdActorS">Account B (production)</text><rect x="528.2" y="8" width="75.6" height="46" rx="8" class="fdActor"/><text x="566" y="27" class="fdActorT">Bucket</text><text x="566" y="42" class="fdActorS">Account B</text><line x1="77.0" y1="102" x2="315.0" y2="102" stroke="var(--accent2)" class="fdArrow" marker-end="url(#idfassume-role-ah-back)"/><text x="197.0" y="93" class="fdLabel">assume-role: &quot;I am ci-runner&quot;</text><circle cx="89.0" cy="102" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="89.0" y="105.5" class="fdNumT" style="fill:var(--accent2)">1</text><rect x="154.8" y="136.0" width="330.4" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="320.0" y="151.0" class="fdSelfT">checks the TRUST policy: who may assume me</text><circle cx="154.8" cy="147.0" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="154.8" y="150.5" class="fdNumT" style="fill:var(--muted)">2</text><line x1="317.0" y1="188" x2="79.0" y2="188" stroke="var(--accent2)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#idfassume-role-ah-back)"/><text x="197.0" y="179" class="fdLabel">temporary credential (1 hour)</text><circle cx="305.0" cy="188" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="305.0" y="191.5" class="fdNumT" style="fill:var(--accent2)">3</text><line x1="77.0" y1="222" x2="561.0" y2="222" stroke="var(--accent2)" class="fdArrow" marker-end="url(#idfassume-role-ah-back)"/><text x="320.0" y="213" class="fdLabel">writes to the bucket, using the ROLE's PERM policy: what I can do</text><circle cx="89.0" cy="222" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="89.0" y="225.5" class="fdNumT" style="fill:var(--accent2)">4</text><text x="320" y="272" class="fdNote">audit log records: ci-runner assumed deploy-role</text></svg></div>
<ol class="fdSteps">
<li><b>ci-runner → deploy-role:</b> assume-role: &quot;I am ci-runner&quot; <i>(back channel)</i></li>
<li><b>deploy-role:</b> checks the TRUST policy: who may assume me</li>
<li><b>deploy-role → ci-runner:</b> temporary credential (1 hour) <i>(back channel)</i></li>
<li><b>ci-runner → Bucket:</b> writes to the bucket, using the ROLE's PERM policy: what I can do <i>(back channel)</i></li>
</ol>
<p>Note the audit line. Like the <code>act</code> claim, a good implementation records both the
original identity and the role, so "who did this?" survives the hop. A <b>claim</b> is one fact inside a
token: a name, an email, an expiry time, or here, who is acting for whom.</p>

<h4>The confused deputy, and why external ids exist</h4>
<p>Suppose you are a SaaS vendor and your customers grant your account permission to read their
buckets. Your account is now a <b>deputy</b> holding access to many customers.</p>
<p>Customer A configures a trust policy saying "vendor's account may assume my role." So does customer
B. Now B types A's role identifier into their own configuration form. Your service will assume A's
role, because your account is trusted by A. You have been used as a deputy to reach data you were never
meant to touch on B's behalf.</p>
<p>The fix is the <b>external id</b>: a secret value the customer puts in their trust policy, which the
vendor must supply on assumption. B does not know A's external id, so B cannot make the deputy act
against A.</p>
<div class="codeSample" data-hl>// customer A's trust policy
allow assume-role by vendor-account
  ONLY IF externalId == "a7f3-c19e-..."   // A's secret, unique per customer

// the vendor must present it, and B cannot guess it
assumeRole(roleArn = A's role, externalId = "a7f3-c19e-...")</div>
<p>The principle outlives any one cloud: <b>when you are trusted by many principals, something must
bind each request to the principal it is really for.</b> Otherwise anyone can aim you.</p>

<h4>Killing the last static credential</h4>
<p>Role assumption still needs an initial identity. For years that was a long-lived key, the thing the
pattern was meant to remove. <b>Workload identity federation</b> closes the loop: the workload already
has a verifiable identity from its platform, so it exchanges that directly for a role.</p>
<p>A CI job is the clearest example. The CI platform issues the job a short-lived OIDC token describing
it: which repository, which branch, which workflow. <b>OIDC</b> is OpenID Connect, a thin layer on top of
OAuth that adds a signed statement of who logged in. Here the "who" is a job rather than a person. The cloud is configured to trust that issuer and to
accept only tokens whose claims match. No secret is stored anywhere.</p>
<div class="codeSample" data-hl>// trust policy conditions on the OIDC token's own claims
issuer:  https://token.actions.githubusercontent.com
require: sub == "repo:acme/api:ref:refs/heads/main"
         aud == "sts.amazonaws.com"

// the danger: a loose condition trusts far too much
require: sub startsWith "repo:acme/"     // ANY repo in the org
require: nothing at all                  // ANY repo on GitHub, anywhere</div>
<p>That last line is not hypothetical. A trust policy naming the issuer but not constraining
<code>sub</code> lets any repository on the platform assume your role. With federated trust, <b>the
issuer check tells you the token is real. The subject check tells you it is the right one.</b> You need
both, as with <code>iss</code> and <code>aud</code> on any other token.</p>`,
docs:[['AWS: The confused deputy problem and external IDs','https://docs.aws.amazon.com/IAM/latest/UserGuide/confused-deputy.html'],['AWS: Configuring OpenID Connect for CI providers','https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_oidc.html'],['GitHub (Security hardening with OpenID Connect)','https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect'],['RFC 8693 (OAuth 2.0 Token Exchange)','https://www.rfc-editor.org/rfc/rfc8693']],
ex:{title:'Guard a role assumption',
prompt:`Write <code>RoleAssumption</code> with three methods. <code>static boolean trusted(String callerId, java.util.Set&lt;String&gt; allowedCallers)</code> is the trust-policy check: true only when both arguments are non-null and the set contains the caller. <code>static boolean externalIdOk(String expected, String presented)</code> is the confused-deputy guard: true only when <code>expected</code> is non-null and equals <code>presented</code>; an unset expectation must never mean "anyone." <code>static boolean subjectAllowed(String requiredSub, String tokenSub)</code> requires an <b>exact</b> match of the federated token's subject, and returns false if either is null, so a trust policy that names only the issuer cannot let every repository in.`,
starter:`import java.util.*;

public class RoleAssumption {
    static boolean trusted(String callerId, Set<String> allowedCallers) {
        return false;
    }
    static boolean externalIdOk(String expected, String presented) {
        return false;
    }
    static boolean subjectAllowed(String requiredSub, String tokenSub) {
        return false;
    }
}`,
tests:[{d:'the trust policy is an allowlist',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:contains\\s*\\())|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:contains\\s*\\()[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:contains\\s*\\()[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:contains\\s*\\()[^{]*?return\\s+\\k<av>\\b)'},{d:'a null caller or missing policy denies',re:'callerId\\s*!=\\s*null|allowedCallers\\s*!=\\s*null'},{d:'an unset external id never means anyone',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:expected\\s*!=\\s*null|null\\s*!=\\s*expected))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:expected\\s*!=\\s*null|null\\s*!=\\s*expected)[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:expected\\s*!=\\s*null|null\\s*!=\\s*expected)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:expected\\s*!=\\s*null|null\\s*!=\\s*expected)[^{]*?return\\s+\\k<av>\\b)'},{d:'the external id is compared by value',re:'expected\\s*\\.\\s*equals|equals\\s*\\(\\s*presented'},{d:'the federated subject must be present',re:'(?:if\\s*\\(\\s*[^;{]*(?:requiredSub\\s*[=!]=\\s*null|tokenSub\\s*[=!]=\\s*null)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:return\\s+(?!\\s*!)[^;{]*(?:requiredSub\\s*[=!]=\\s*null|tokenSub\\s*[=!]=\\s*null))|(?:(?<h1>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:requiredSub\\s*[=!]=\\s*null|tokenSub\\s*[=!]=\\s*null)[^{]*?return\\s+\\k<h1>\\b)'},{d:'the subject is matched exactly, not by prefix',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:requiredSub\\s*\\.\\s*equals|equals\\s*\\(\\s*tokenSub))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:requiredSub\\s*\\.\\s*equals|equals\\s*\\(\\s*tokenSub)[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:requiredSub\\s*\\.\\s*equals|equals\\s*\\(\\s*tokenSub)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:requiredSub\\s*\\.\\s*equals|equals\\s*\\(\\s*tokenSub)[^{]*?return\\s+\\k<av>\\b)'},{d:'no prefix matching on the subject',re:'startsWith',not:true}],
behavior:`trusted("ci-runner", Set.of("ci-runner")) is true; an unknown caller, a null caller or a null policy set are all false. externalIdOk("a7f3","a7f3") is true, while externalIdOk(null,"a7f3") is false; that is the whole confused-deputy defense, since a vendor trusted by many customers must bind each call to the customer it is for. subjectAllowed("repo:acme/api:ref:refs/heads/main", same) is true, but a different branch or repository is false, and prefix matching is deliberately not used because "repo:acme/" would admit every repository in the organization.`,
hints:['Guard both arguments, then <code>allowedCallers.contains(callerId)</code>.','<code>return expected != null &amp;&amp; expected.equals(presented);</code>','Exact equality only; reaching for <code>startsWith</code> here is the bug the test checks for.'],
solution:`import java.util.*;

public class RoleAssumption {
    static boolean trusted(String callerId, Set<String> allowedCallers) {
        // the trust policy answers "who may assume me", an allowlist, nothing else
        return callerId != null && allowedCallers != null && allowedCallers.contains(callerId);
    }
    static boolean externalIdOk(String expected, String presented) {
        // confused-deputy guard: an unset expectation must not mean "anyone"
        return expected != null && expected.equals(presented);
    }
    static boolean subjectAllowed(String requiredSub, String tokenSub) {
        // exact match: a prefix would admit every repo in the organisation
        if (requiredSub == null || tokenSub == null) return false;
        return requiredSub.equals(tokenSub);
    }
}`}},

{id:'idf6',title:'Validating a token & sender-constrained tokens',body:`




<p>A resource server must <b>validate</b> every token before trusting it. Signature aside (covered in the JOSE stream), the mandatory claim checks are below. <b>JOSE</b> is JSON Object Signing and Encryption, the family of specifications that a signed token is built from. A <b>claim</b> is one fact inside a token: a name, an email, an expiry time.</p>
<ul>
<li><b>iss (issuer)</b>: was it minted by an issuer you trust?</li>
<li><b>aud (audience)</b>: is <i>this</i> API the intended recipient? A token for service A must be rejected by service B.</li>
<li><b>exp (expiration)</b>: is it still within its lifetime? Also <b>nbf</b>, not before.</li>
<li><b>scope / roles</b>: does it permit this specific action? (lesson 5)</li>
</ul>
<p>Skipping <b>aud</b> is a classic mistake. A token leaked from one service could then be replayed against another. A <b>replay</b> is capturing a valid message and sending it again later, somewhere it was never meant to go.</p>
<p><b>Bearer vs sender-constrained tokens.</b> A plain <b>bearer</b> token is like cash: whoever steals it can use it. <b>Sender-constrained</b> (proof-of-possession) tokens are bound to a key only the legitimate client holds, so a stolen token is useless to a thief:</p>
<ul>
<li><b>mTLS-bound tokens</b> (RFC 8705): the token is tied to the client's TLS certificate. The API checks the caller's cert matches.</li>
<li><b>DPoP</b> (RFC 9449): the client signs each request with a key, and the token carries that key's thumbprint. Common for public clients (SPAs).</li>
</ul>
<p>Default to short-lived bearer tokens over TLS. Use sender-constraint when tokens are high-value or the client is exposed.</p>
<div class="codeSample" data-hl>// the non-negotiable claim checks, in order
if (!expectedIss.equals(iss))    return false;   // trusted issuer?
if (!expectedAud.equals(aud))    return false;   // token meant for US?
if (expEpoch <= nowEpoch)        return false;   // not expired?
return true;                                       // (then check scope/roles)</div>

<h4>Why validation is the whole game</h4>
<p>It is tempting to read the token as a message from the user. It is a message from the <b>issuer</b>,
handed to you by whoever is calling, and that party may not be the person the token describes.
Everything a resource server does rests on one judgment: <i>is this a statement my issuer made, to me,
that is still true?</i></p>
<p>Split that sentence and you have the checks, in order, and the attack each one stops:</p>
<div class="codeSample" data-hl>"a statement my issuer made"   -> signature + iss   stops FORGED tokens
"...to me"                     -> aud              stops REPLAYED tokens
"...that is still true"        -> exp / nbf        stops EXPIRED tokens
"...permitting this action"    -> scope / roles    stops OVER-REACH</div>
<p>None of these is optional, and none substitutes for another. A well-signed, unexpired token issued
for a different API is still not yours to accept.</p>

<h4>The audience check is the one people skip</h4>
<p>Signature and expiry are obvious. Audience is not, because a token that verifies feels valid. It
<i>is</i> valid, just not for you.</p>
<p>Picture an internal platform where five services trust the same issuer. The billing service holds a
token its caller gave it. If it forwards that token to the admin API, and the admin API checks only the
signature, then <b>any service holding any token can call any other service</b>. One compromised
low-value service becomes access to everything. That is a <b>confused deputy</b>: a trusted service tricked into using its own authority on behalf of
someone who should not have it. <code>aud</code> is the line of code that prevents it.</p>

<h4>Validate at the edge of trust, not the edge of the network</h4>
<p>A gateway that validates tokens only proves the request entered through the front door. Anything
that can reach the service directly bypasses it. Each service validates for itself. The gateway is
defense in depth, not the check.</p>
<p>Two related habits. <b>Fail closed</b>: an issuer you cannot reach, a key you cannot fetch, a claim
you cannot parse are all rejections, never "allow and log". <b>Never trust the token to tell you where
to verify it</b>: the issuer list is your configuration, not something read out of the token you are
about to validate.</p>

<h4>And then: is the holder the rightful one?</h4>
<p>Every check above answers "is this token good?". None answers "is the party presenting it the party
it was issued to?", because a bearer token has no answer to give. Sender-constraining closes that gap.
The Advanced OAuth stream takes it apart in detail.</p>`,
docs:[['RFC 9068 (JWT access tokens)','https://www.rfc-editor.org/rfc/rfc9068'],['RFC 8705 (mTLS-bound tokens)','https://www.rfc-editor.org/rfc/rfc8705'],['RFC 9449 (DPoP)','https://www.rfc-editor.org/rfc/rfc9449']],
ex:{title:'The token validation checklist',
prompt:`Write <code>TokenCheck</code> with <code>static boolean valid(String iss, String aud, long expEpoch, String expectedIss, String expectedAud, long nowEpoch)</code> that returns <code>true</code> only if: <code>expectedIss.equals(iss)</code>, <b>and</b> <code>expectedAud.equals(aud)</code>, <b>and</b> the token is not expired (<code>expEpoch &gt; nowEpoch</code>). Return <code>false</code> as soon as any check fails.`,
starter:`public class TokenCheck {
    static boolean valid(String iss, String aud, long expEpoch,
                         String expectedIss, String expectedAud, long nowEpoch) {
        return false;
    }
}`,
tests:[{d:'checks the issuer',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:expectedIss\\s*\\.\\s*equals\\s*\\(\\s*iss\\s*\\)))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:expectedIss\\s*\\.\\s*equals\\s*\\(\\s*iss\\s*\\))[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:expectedIss\\s*\\.\\s*equals\\s*\\(\\s*iss\\s*\\))[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:expectedIss\\s*\\.\\s*equals\\s*\\(\\s*iss\\s*\\))[^{]*?return\\s+\\k<av>\\b)'},{d:'checks the audience (rejects tokens meant for others)',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:expectedAud\\s*\\.\\s*equals\\s*\\(\\s*aud\\s*\\)))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:expectedAud\\s*\\.\\s*equals\\s*\\(\\s*aud\\s*\\))[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:expectedAud\\s*\\.\\s*equals\\s*\\(\\s*aud\\s*\\))[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:expectedAud\\s*\\.\\s*equals\\s*\\(\\s*aud\\s*\\))[^{]*?return\\s+\\k<av>\\b)'},{d:'checks expiry',re:'(?:if\\s*\\(\\s*[^;{]*(?:expEpoch\\s*(<=|>)\\s*nowEpoch|nowEpoch\\s*(<|>=)\\s*expEpoch)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:return\\s+(?!\\s*!)[^;{]*(?:expEpoch\\s*(<=|>)\\s*nowEpoch|nowEpoch\\s*(<|>=)\\s*expEpoch))|(?:(?<h1>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:expEpoch\\s*(<=|>)\\s*nowEpoch|nowEpoch\\s*(<|>=)\\s*expEpoch)[^{]*?return\\s+\\k<h1>\\b)'},{d:'a guard returns its constant, not the negation of it',re:'return\\s+!\\s*\\(?\\s*(?:true|false)\\s*\\)?\\s*;',not:true}],
behavior:`valid returns true only for a token from the expected issuer, addressed to the expected audience, and not yet expired. Change the issuer, point the audience at another service, or set exp in the past and it returns false. Audience is what stops a token for service A being replayed on service B.`,
hints:['Fail fast: <code>if (!expectedIss.equals(iss)) return false;</code> then the same for audience.','Expiry: <code>if (expEpoch &lt;= nowEpoch) return false;</code>','If all three pass, <code>return true;</code>'],
solution:`public class TokenCheck {
    static boolean valid(String iss, String aud, long expEpoch,
                         String expectedIss, String expectedAud, long nowEpoch) {
        if (!expectedIss.equals(iss)) return false;      // trusted issuer
        if (!expectedAud.equals(aud)) return false;      // meant for this API
        if (expEpoch <= nowEpoch) return false;          // not expired
        return true;
    }
}`}}
,
{id:'idffed',title:'Identity & federation in plain English',body:`




<p>Your <b>identity</b> is your digital "who": an account plus the facts attached to it (name, email, groups). <b>Authentication</b> proves you are that who. <b>Authorization</b> decides what that who may do.</p>
<p>If every app keeps its own usernames and passwords, you drown in logins and each app becomes a place your password can leak. <b>Federation</b> lets apps <b>trust a shared authority</b> to say who you are, instead of each checking for themselves.</p>
<p><b>The passport analogy.</b> Your country verifies who you are and issues a passport. Other countries accept it at the border without re-investigating you, because they trust the issuer. The <b>Identity Provider (IdP)</b> is your country, the passport is a signed <b>token or assertion</b>, and each app (the <b>Service Provider / Relying Party</b>) is the border that trusts it. An <b>assertion</b> is the older, XML-based word for the same thing: a signed statement about the user.</p>
<p><b>Everyday examples.</b> "Log in with Google": Google is the IdP that vouches for you, and the app relies on Google&#8217;s word rather than storing your password. Corporate <b>SSO</b>, single sign-on: an employee logs into Okta once and reaches Salesforce, Slack, and Workday. Each app trusts Okta, so one login opens all of them. That is <b>federated identity</b>: your identity lives in one place and is accepted in many.</p>
<p>The trust is set up in advance. The app is configured with the IdP&#8217;s keys and metadata, so a random site cannot claim "Google says this is you". Only the pre-trusted IdP&#8217;s signature is accepted.</p>

<h4>What the app gives up, and what it gains</h4>
<p>Federation is a trade. The app <b>gains</b>: no password to store or leak, no reset flow to build, <b>MFA</b> and policy enforced centrally, and access that ends when the employer says it ends. MFA is multi-factor authentication: proving who you are with two different kinds of evidence, usually a password plus a phone or security key, so a stolen password alone is not enough. The app <b>gives up</b>: control of the login experience, the ability to authenticate when the IdP is down, and any independent knowledge of who the user is. It believes what the token says.</p>
<p>That last item makes the IdP the highest-value target in the estate. Compromise one app and you have one app. Compromise the IdP and you can mint a valid identity for every app that trusts it. Federation <b>concentrates</b> risk rather than removing it. That is a good bargain, because one system defended well beats fifty defended averagely, but only if the concentration is acknowledged and funded.</p>

<h4>Reading the passport analogy carefully</h4>
<p>The edges of the analogy are the real subject. A border checks that the passport is authentic (the signature), unexpired (the token's lifetime), and issued by a country it recognizes (the trust configuration). It does not phone the issuing country, so revoking a passport is slow and imperfect, like a signed token that stays valid until it expires. A passport says who you are, not what you may do. The visa is separate: authentication and authorization in the same document.</p>

<h4>Three things that must be arranged in advance</h4>
<ul>
<li><b>Keys</b>: the app must know the IdP's public keys. It fetches them from a metadata or JWKS URL rather than having them pasted into config, so rotation does not require a deployment. A <b>JWKS</b> is a JSON Web Key Set: the IdP's public keys written as JSON and published at a well-known address, so anyone can fetch them and check its signatures.</li>
<li><b>Identifiers</b>: the app and the IdP must agree on what names the user. A stable subject identifier, not an email.</li>
<li><b>Attributes</b>: which claims the IdP will release. A <b>claim</b> is one fact inside a token: a name, an email, a group. An app that needs a department or a group only gets it if the IdP is configured to send it. In enterprise deployments this negotiation is most of the integration work, and it is where "SSO is set up but nobody has the right permissions" comes from.</li>
</ul>`,
docs:[['Identity federation (Wikipedia)','https://en.wikipedia.org/wiki/Federated_identity'],['SSO & federation basics','https://www.cloudflare.com/learning/access-management/what-is-sso/']],
},
{id:'idffed2',title:'Federation from the ground up: why & how',body:`




<p>We met federation in plain English (the passport analogy). Now the ground-up version: <b>why</b> it exists and <b>how</b> it is built. Every OAuth, OIDC and SAML lesson assumes this base. <b>SAML</b> is Security Assertion Markup Language, the older, XML-based standard for single sign-on between companies. It is still what most enterprise SSO runs on.</p>
<!--flow:idffed2-federation-->
<h4>Federation: the canonical triangle: step by step</h4>
<div class="flowDia"><svg viewBox="0 0 680 312" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Federation: the canonical triangle"><defs><marker id="idffed2-federation-ah-front" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent)"/></marker><marker id="idffed2-federation-ah-back" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent2)"/></marker><marker id="idffed2-federation-ah-attack" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--bad)"/></marker><marker id="idffed2-federation-ah-x" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--muted)"/></marker></defs><line x1="74" y1="54" x2="74" y2="300" class="fdLife"/><line x1="340" y1="54" x2="340" y2="300" class="fdLife"/><line x1="606" y1="54" x2="606" y2="300" class="fdLife"/><rect x="34.300000000000004" y="8" width="79.39999999999999" height="46" rx="8" class="fdActor"/><text x="74" y="35.5" class="fdActorT">Browser</text><rect x="301" y="8" width="78" height="46" rx="8" class="fdActor"/><text x="340" y="27" class="fdActorT">SP</text><text x="340" y="42" class="fdActorS">the app you want</text><rect x="567" y="8" width="78" height="46" rx="8" class="fdActor"/><text x="606" y="27" class="fdActorT">IdP</text><text x="606" y="42" class="fdActorS">who vouches for you</text><line x1="77" y1="102" x2="335" y2="102" stroke="var(--accent)" class="fdArrow" marker-end="url(#idffed2-federation-ah-front)"/><text x="222" y="93" class="fdLabel">access the app</text><circle cx="92" cy="102" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="92" y="105.5" class="fdNumT" style="fill:var(--accent)">1</text><line x1="343" y1="132" x2="601" y2="132" stroke="var(--accent)" class="fdArrow" marker-end="url(#idffed2-federation-ah-front)"/><text x="488" y="123" class="fdLabel">redirect: “please authenticate this person”</text><circle cx="358" cy="132" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="358" y="135.5" class="fdNumT" style="fill:var(--accent)">2</text><rect x="343" y="149" width="323" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="512.5" y="164" class="fdSelfT">user authenticates ONCE, here, and only here</text><circle cx="343" cy="160" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="343" y="163.5" class="fdNumT" style="fill:var(--muted)">3</text><line x1="603" y1="198" x2="345" y2="198" stroke="var(--accent)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#idffed2-federation-ah-front)"/><text x="458" y="189" class="fdLabel">signed assertion about the user</text><circle cx="588" cy="198" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="588" y="201.5" class="fdNumT" style="fill:var(--accent)">4</text><rect x="181.8" y="215" width="316.4" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="348" y="230" class="fdSelfT">trusts the signature, never sees a password</text><circle cx="181.8" cy="226" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="181.8" y="229.5" class="fdNumT" style="fill:var(--muted)">5</text><line x1="337" y1="264" x2="79" y2="264" stroke="var(--accent)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#idffed2-federation-ah-front)"/><text x="192" y="255" class="fdLabel">session, you are in</text><circle cx="322" cy="264" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="322" y="267.5" class="fdNumT" style="fill:var(--accent)">6</text><text x="340" y="282" class="fdNote">Every SSO protocol: SAML, OIDC, is a dialect of this one shape.</text></svg></div>
<ol class="fdSteps">
<li><b>Browser → SP:</b> access the app <i>(front channel)</i></li>
<li><b>SP → IdP:</b> redirect: “please authenticate this person” <i>(front channel)</i></li>
<li><b>IdP:</b> user authenticates ONCE, here, and only here</li>
<li><b>IdP → SP:</b> signed assertion about the user <i>(front channel)</i></li>
<li><b>SP:</b> trusts the signature, never sees a password</li>
<li><b>SP → Browser:</b> session, you are in <i>(front channel)</i></li>
</ol>
<!--/flow:idffed2-federation-->
<p><b>Why it is needed.</b> If every app stores its own passwords you get four problems. Password sprawl and reuse. No single place to disable a leaver. No way for a partner or customer to bring an identity they already have. A password honeypot in every app. Federation removes all four by letting apps <b>trust one authority</b> to authenticate the user.</p>
<p><b>How it is implemented.</b> Three moving parts and three protocols:</p>
<ul>
<li><b>The authority</b>: the <b>Identity Provider (IdP)</b> authenticates the user and issues a <b>signed proof</b>: an <b>ID token</b> (a JWT) in OpenID Connect, or a signed XML <b>assertion</b> in SAML. A <b>JWT</b> is a JSON Web Token: a small signed document, three base64 pieces separated by dots, that carries claims such as who the user is and when the token expires. An <b>assertion</b> is SAML's word for the same signed statement about the user. <b>OAuth 2.0</b> underneath carries authorization (API access).</li>
<li><b>The app</b>: the <b>Relying Party (RP) / Service Provider (SP)</b> receives that proof and <b>verifies</b> it rather than checking a password.</li>
<li><b>The wiring</b>: <b>metadata / discovery</b> tells the RP where the IdP's endpoints and <b>public keys</b> live (a <code>jwks_uri</code> for OIDC, metadata XML for SAML).</li>
</ul>
<p>The safe shape is <b>SP-initiated</b>. The app starts the login by redirecting to the IdP. The user authenticates, and the IdP redirects back with a proof the app verifies and turns into a session. Because the app started it, it can match the response to its own request.</p>

<h4>Why SP-initiated is the safe shape</h4>
<p>When the app starts the flow it creates state before anything leaves: a request id, a <code>state</code> value, a PKCE verifier, a return URL. <b>PKCE</b> is Proof Key for Code Exchange, said "pixy": the app invents a random secret at the start of a login, sends a hash of it, and reveals the secret only when it collects the token, so an attacker who steals the login code in the middle cannot finish without it. Everything that comes back can be matched against something the app generated. That is what makes a forged or replayed response detectable. A <b>replay</b> is capturing a valid message and sending it again later. In the <b>IdP-initiated</b> direction, the user clicks a tile in a portal and an unsolicited assertion arrives at the app. None of that state exists. The app receives a valid-looking assertion it never asked for, and it cannot tell whether the user sent it or an attacker did. That shape is behind a whole family of login-CSRF and assertion-replay problems. <b>CSRF</b> is cross-site request forgery: a malicious page makes your browser send a request to a site, and the site cannot tell it was not you. Login CSRF is the version where the request that gets sent is a login, so the attacker chooses which account you end up in. Modern guidance is to avoid IdP-initiated flows, or convert them to SP-initiated ones by bouncing the user back to the app first.</p>

<h4>What "trust" consists of</h4>
<p>Trust in federation is four pieces of configuration that both sides can point at. The <b>issuer identifier</b>, which must match exactly. The <b>signing keys</b>, discovered rather than hardcoded so rotation is invisible. The <b>audience</b>, so an assertion for one app is not usable at another. And the <b>attribute contract</b>: which claims are released, in what format, with what identifier. A <b>claim</b> is one fact inside a token: a name, an email, a group. Get the first three wrong and you have a security problem. Get the fourth wrong and you have an integration that authenticates people it cannot authorize.</p>

<h4>The failure modes to expect</h4>
<ul>
<li><b>The IdP is a single point of failure.</b> When it is down, nobody logs into anything. Break-glass access and cached sessions are operational requirements.</li>
<li><b>Clock skew</b> breaks assertion validity windows, and SAML's windows are typically minutes. NTP is a dependency of your login.</li>
<li><b>Certificate and key rotation</b> at the IdP breaks every relying party that pinned instead of discovering. This is the most common cause of a federation outage preceded by "nobody changed anything".</li>
<li><b>Session lifetime mismatch.</b> The app's session can outlive the IdP's, so a user disabled centrally stays signed in locally until the app's session expires. Short app sessions, or a revocation signal, are the answers.</li>
</ul>`,
docs:[['Federated identity (Wikipedia)','https://en.wikipedia.org/wiki/Federated_identity'],['OIDC Core','https://openid.net/specs/openid-connect-core-1_0.html'],['SAML 2.0 overview','https://docs.oasis-open.org/security/saml/v2.0/']],
},
{id:'idftrust',title:'How trust is established, end to end',body:`




<p>Federation only works if the relying party (RP) can be sure a proof came from the identity provider (IdP), is meant for <i>this</i> app, and is fresh. That certainty is <b>trust</b>: <b>configuration plus cryptography</b>. This lesson ties together pieces you meet across the OAuth, SAML and PKI streams. <b>SAML</b> is Security Assertion Markup Language, the older, XML-based standard for single sign-on between companies, and still what most enterprise SSO runs on. <b>PKI</b> is public key infrastructure: the certificate authorities, certificates and rules that let a public key be trusted as belonging to a particular name. It is what makes the padlock in a browser mean something.</p>
<p><b>1. Identification (set up once, out of band).</b> The RP <b>registers</b> with the IdP. In OAuth/OIDC it receives a <code>client_id</code> and, for a confidential client, a <code>client_secret</code>, and registers exact redirect URIs. <b>OIDC</b> is OpenID Connect, a thin layer on top of OAuth that adds a signed statement of who logged in. A <b>redirect URI</b> is the address the login sends the browser back to, with the result attached. If an attacker controls it, they get the result. In SAML the two sides exchange <b>metadata</b> containing an <b>X.509 certificate</b>. This is where the parties learn who each other are.</p>
<p><b>2. Keys (the core asymmetry).</b> The IdP signs proofs with its <b>private</b> key and <b>publishes the matching public key</b>, at a <b>JWKS</b> endpoint (OIDC) or in SAML metadata. A JWKS is a JSON Web Key Set: the public keys written as JSON at a well-known URL, so anyone can fetch them and check the signatures. The RP verifies signatures with that public key. <b>Public keys are shared. Private keys never leave their owner.</b> A forger who can read the public key still cannot mint a valid signature. For certificates, verification may walk a <b>PKI chain</b> to a trusted <b>CA</b>. A CA is a certificate authority: an organization that signs certificates, vouching that a public key belongs to a name. Your browser and operating system ship with a list of CAs they trust.</p>
<p><b>2b. The trust anchor, where the regress stops.</b> Verification is a chain of "I believe this because of that," and every chain has to end in something you believe <i>because you decided to</i>. That is the <b>trust anchor</b>: a key or certificate accepted as authoritative by configuration rather than by proof. Nothing else vouches for it.</p>
<p>Each stream has its own anchor. In OIDC it is the <b>issuer URL plus its JWKS keys</b> you configured. In SAML it is the <b>IdP certificate in the metadata</b> you loaded. In PKI it is a <b>root CA certificate</b> in your trust store, self-signed by definition: a root is trusted <i>because it is in the store</i>, not because its signature proves anything. So "fetch the keys from whatever URL the token names" is fatal. It lets the token choose its own anchor, and an attacker will point you at keys they control. <b>The anchor must be pinned by you, in advance, out of band.</b></p>
<p><b>3. How strongly the client proves itself</b> runs on a ladder: nothing (public client + PKCE) → a shared <code>client_secret</code> → <b>private_key_jwt</b> (the client signs with its own private key; no shared secret) → <b>mTLS</b>. Asymmetric methods are stronger because there is no shared secret to leak. <b>PKCE</b>, at the bottom rung, is Proof Key for Code Exchange, said "pixy": the app invents a random secret at the start of a login, sends a hash of it, and reveals the secret only when it collects the token. An attacker who steals the login code in the middle cannot finish without the secret. It protects the flow, but it does not prove which app is calling.</p>
<p><b>4. Verification (enforced on every message).</b> A valid signature is necessary but not sufficient. The RP must also check four things. The <b>issuer</b>: <code>iss</code> is the expected IdP. The <b>audience</b>: <code>aud</code>/recipient names this RP, so a proof minted for another app is rejected. <b>Freshness</b>: <code>exp</code>/<code>NotOnOrAfter</code> and <code>nbf</code>, with small clock skew. <b>Anti-replay/correlation</b>: the <code>nonce</code> ties an ID token to this login, <code>state</code> blocks CSRF, and SAML tracks assertion IDs. A <b>nonce</b> is a random value used once, so a message cannot be captured and sent again later. <b>CSRF</b> is cross-site request forgery: a malicious page makes your browser send a request to a site you are logged into, and the site cannot tell it was not you. An <b>assertion</b> is SAML's word for the signed statement about the user.</p>
<p><b>5. The sharp edges.</b> <b>Unsolicited assertions</b> (SAML IdP-initiated) have no request to correlate to. Accept them only from a trusted IdP with full validation, and prefer SP-initiated, where the <b>SP</b>, the service provider, meaning the app itself, starts the login and can match the answer to its own request. <b>JIT provisioning</b> is just-in-time provisioning: the account is created at the moment the person first logs in, from the claims the IdP sends, instead of being set up in advance. A <b>claim</b> is one fact inside the proof: a name, an email, a group. So map claims to <b>least privilege</b> and key on the stable subject id. Trust is not set-and-forget: rotate keys and certificates, honor JWKS caching, and support revocation and logout.</p>`,
docs:[['OAuth 2.0 Security BCP','https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics'],['JWT best practices (RFC 8725)','https://www.rfc-editor.org/rfc/rfc8725'],['JSON Web Key (RFC 7517)','https://www.rfc-editor.org/rfc/rfc7517']],
ex:{title:'The trust checklist, in code',lang:'js',
run:{call:'valid',cases:[{name:'all five checks pass',args:[true,true,true,true,true],expect:true},{name:'bad signature',args:[false,true,true,true,true],expect:false},{name:'wrong issuer',args:[true,false,true,true,true],expect:false},{name:'wrong audience',args:[true,true,false,true,true],expect:false},{name:'stale',args:[true,true,true,false,true],expect:false},{name:'replayed',args:[true,true,true,true,false],expect:false}]},
prompt:`Write <code>function valid(signatureOk, issuerOk, audienceOk, fresh, notReplayed)</code> that accepts a proof only when <b>all five</b> checks pass, and <code>function idpPublishes()</code> returning <code>"public key"</code> (never the private key).`,
starter:`function valid(signatureOk, issuerOk, audienceOk, fresh, notReplayed) {
  return false;
}
function idpPublishes() {
  return null;
}`,
solution:`function valid(signatureOk, issuerOk, audienceOk, fresh, notReplayed) {
  return signatureOk && issuerOk && audienceOk && fresh && notReplayed;
}
function idpPublishes() {
  return "public key";
}`,
tests:[{d:'all five checks must hold (signature, issuer, audience, freshness, no replay)',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:signatureOk\\s*&&\\s*issuerOk\\s*&&\\s*audienceOk\\s*&&\\s*fresh\\s*&&\\s*notReplayed))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:signatureOk\\s*&&\\s*issuerOk\\s*&&\\s*audienceOk\\s*&&\\s*fresh\\s*&&\\s*notReplayed)[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:signatureOk\\s*&&\\s*issuerOk\\s*&&\\s*audienceOk\\s*&&\\s*fresh\\s*&&\\s*notReplayed)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:signatureOk\\s*&&\\s*issuerOk\\s*&&\\s*audienceOk\\s*&&\\s*fresh\\s*&&\\s*notReplayed)[^{]*?return\\s+\\k<av>\\b)'},{d:'the IdP publishes its PUBLIC key, never the private one',re:'return\\s+"public key"'}],
behavior:`Each of the five failure modes is executed as its own case, so omitting any single check fails a named test rather than passing a pattern match. idpPublishes() returns "public key", the asymmetry that makes federation forgery-resistant.`,
hints:['Trust is configuration (registration) plus cryptography (verifying a signature against a published public key).','A valid signature is not enough: also check issuer, audience, freshness, and non-replay; combine with &&.','The IdP shares only its public key; the private signing key never leaves it.']}},
{id:'iddid',title:'Decentralized identity: DIDs & Verifiable Credentials',body:`




<p>Everything so far assumes a central authority (an IdP) vouches for you. <b>Decentralized identity</b>, also called self-sovereign identity (SSI), flips that: <b>you</b> hold your own credentials in a digital wallet and present them directly, with no IdP in the middle at sign-in time.</p>
<p>Two building blocks:</p>
<ul>
<li><b>DID (Decentralized Identifier)</b>: an identifier you control (a URI like <code>did:example:123</code>) that resolves to a <b>DID document</b> containing your public keys. No one company issues or owns it.</li>
<li><b>Verifiable Credential (VC)</b>: a tamper-evident, signed claim (e.g. "over 18", "employed by Acme") <b>issued</b> by an authority, <b>held</b> by you in a wallet, and <b>presented</b> to whoever needs it. A <b>claim</b> is one fact about you, stated by someone else and signed so it cannot be altered.</li>
</ul>
<p>The model is a <b>trust triangle</b>. The <b>issuer</b> signs and gives you a credential. The <b>holder</b> (you) stores it in a wallet. The <b>verifier</b> checks the issuer signature without calling the issuer. The standout property is <b>selective disclosure</b> (and zero-knowledge proofs): prove you are over 18 <i>without</i> revealing your birthdate. A <b>zero-knowledge proof</b> is a way to prove a statement is true without showing the data behind it.</p>
<p>Versus federation: there is no central login and no IdP that sees every sign-in, which improves privacy and resilience. The ecosystem (wallets, revocation, standards) is still maturing, so most production identity today is still federated. VCs are showing up in digital IDs and know-your-customer flows.</p>

<h4>The trust triangle, and what is new</h4>
<p>Federation and decentralized identity both rest on a signature from an authority you trust. The difference is <b>where the authority sits at the moment of use</b>. In federation the IdP is online and in the flow. It learns every login, every relying party, and every time you sign in. A <b>relying party</b> is the application that trusts the IdP to do the logging in for it. In the credential model the issuer signs once and goes away. The verifier checks a signature against a published key and never contacts the issuer. No phone-home means no central observer of your behavior, and no single service whose outage stops every login.</p>
<p><b>Selective disclosure</b> is the second new property. A signed credential normally has to be shown whole, so proving your age with a driving license reveals your address. <b>SD-JWT</b>, a selective-disclosure JSON Web Token, and similar constructions let the holder reveal individual claims while the signature still verifies over what was revealed. It is a signed credential where the holder can reveal some claims (over 18) and keep the rest hidden (date of birth), and the signature still checks. "Over 18" becomes provable without a birthdate. Federation has no equivalent.</p>

<h4>The parts that are still hard</h4>
<ul>
<li><b>Revocation.</b> An offline check cannot see that a credential was revoked this morning. Schemes use status lists, short lifetimes or re-issuance, and each trades privacy against freshness, because a status lookup can leak which credential is being checked.</li>
<li><b>Key recovery.</b> If you hold your own keys, losing your phone means losing your identity unless there is recovery. Recovery is a backdoor by another name, and wallet vendors differ most here.</li>
<li><b>Trust registries.</b> A verifier still has to decide which issuers to believe. That question moves to a registry, and the governance of that registry is where the politics lives.</li>
<li><b>Correlation.</b> Presenting the same credential identifier everywhere reintroduces tracking. Batch-issued single-use credentials and pairwise identifiers exist to prevent that.</li>
</ul>

<h4>Where it is being used</h4>
<p>In 2026 it is no longer a research topic and not yet the default. The EU Digital Identity Wallet regulation obliges member states to offer wallets. Mobile driving licenses are in production in several US states and accepted at airports. OpenID for Verifiable Credential Issuance and Presentation (<b>OID4VCI</b> / <b>OID4VP</b>) have made the flows look like OAuth, which is the practical reason they are gaining traction. They are the two OpenID protocols for the wallet: one for an issuer putting a credential into it, the other for a verifier asking it to show one. Most enterprise identity remains federated, and the two will coexist: an employee logs in via the corporate IdP and presents a credential to prove a professional certification the employer never held.</p>`,
docs:[['Decentralized Identifiers (W3C DID)','https://www.w3.org/TR/did-core/'],['Verifiable Credentials (W3C)','https://www.w3.org/TR/vc-data-model/'],['Self-sovereign identity','https://en.wikipedia.org/wiki/Self-sovereign_identity']],
},

{id:'iddid2',title:'Wallets in practice: OID4VC, OID4VP and the mDL',body:`






<p>The previous lesson covered DIDs and verifiable credentials as concepts, and the JOSE stream covered
SD-JWT as the format. <b>JOSE</b> is JSON Object Signing and Encryption, the family of specifications
that signed tokens are built from. An <b>SD-JWT</b> is a selective-disclosure JSON Web Token: a signed
credential where the holder can reveal some claims (over 18) and keep the rest hidden (date of birth),
and the signature still checks. What remains is the <b>protocols that move credentials</b>: how one is issued
into a wallet, and how a verifier asks for one. That is OID4VC and OID4VP. They are built on OAuth so
the ecosystem does not have to learn a new stack.</p>

<h4>The three-party model</h4>
<div class="flowDia"><svg viewBox="0 0 640 150" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="The three-party model: issuer, wallet, verifier; the verifier never contacts the issuer"><defs><marker id="iddid2-ah" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent)"/></marker></defs>
<rect x="40" y="16" width="140" height="46" rx="8" class="fdActor"/><text x="110" y="35" class="fdActorT">Issuer</text><text x="110" y="50" class="fdActorS">the DMV</text>
<line x1="182" y1="39" x2="246" y2="39" stroke="var(--accent)" class="fdArrow" marker-end="url(#iddid2-ah)"/><text x="215" y="30" class="fdLabel">OID4VCI</text>
<rect x="250" y="16" width="140" height="46" rx="8" class="fdActor"/><text x="320" y="35" class="fdActorT">Wallet</text><text x="320" y="50" class="fdActorS">on the user's phone</text>
<line x1="392" y1="39" x2="456" y2="39" stroke="var(--accent)" class="fdArrow" marker-end="url(#iddid2-ah)"/><text x="425" y="30" class="fdLabel">OID4VP</text>
<rect x="460" y="16" width="140" height="46" rx="8" class="fdActor"/><text x="530" y="35" class="fdActorT">Verifier</text><text x="530" y="50" class="fdActorS">the bar, the landlord</text>
<path d="M110 62 L110 104 L530 104 L530 62" fill="none" stroke="var(--muted)" stroke-dasharray="4 4" class="fdArrow"/>
<line x1="312" y1="96" x2="328" y2="112" stroke="var(--bad)" class="fdArrow"/><line x1="328" y1="96" x2="312" y2="112" stroke="var(--bad)" class="fdArrow"/>
<text x="320" y="128" class="fdLabel fdLabelBad">absent: the verifier never contacts the issuer</text>
<text x="320" y="144" class="fdNote">the DMV does not learn where you proved your age</text>
</svg></div>
<ol class="fdSteps">
<li><b>Issuer &rarr; Wallet:</b> OID4VCI puts the credential into the wallet (the DMV issues it to the user's phone).</li>
<li><b>Wallet &rarr; Verifier:</b> OID4VP presents it (to the bar, the landlord).</li>
<li><b>Verifier and Issuer:</b> no connection. Note what is absent: the verifier never contacts the issuer. That is the whole point: the DMV does not learn where you proved your age. Contrast federation, where the IdP sees every login.</li>
</ol>
<p>That absence is the real difference from everything else in this domain. In federation the authority
is <i>online</i> at the moment of use and sees it. Here the credential is issued once and presented many
times without the issuer's involvement. That removes a surveillance surface federation cannot.</p>

<h4>Issuance (OID4VCI)</h4>
<p><b>OID4VCI</b> is OpenID for Verifiable Credential Issuance, the protocol for putting a credential
into a wallet. It is an OAuth flow with a different prize at the end: instead of an access token for an
API, you receive a credential to keep. An <b>access token</b> is the short-lived token an app shows an
API to prove it may make the call. The wallet authenticates the user at the issuer, obtains an access
token, and calls a <b>credential endpoint</b>. It presents a proof that it holds the key the credential
will be bound to, so the credential cannot be replayed, that is, copied and used again, from a different
wallet.</p>

<h4>Presentation (OID4VP)</h4>
<p>The verifier sends a <b>presentation definition</b>: a machine-readable description of what it needs,
not which credential to use. The wallet decides which credential satisfies it and which claims to
disclose, using SD-JWT selective disclosure plus a key-binding proof naming this verifier and its
nonce. A <b>claim</b> is one fact inside the credential: a name, a birthdate, an over-18 flag. A
<b>nonce</b> is a random value used once, so a presentation cannot be captured and shown again later.</p>
<div class="codeSample" data-hl>verifier asks:   "a government ID credential, proving age_over_18"
wallet returns:  the SD-JWT + the age_over_18 disclosure + a KB-JWT
                 -> the date of birth is NEVER sent
                 -> the name and address are never sent
                 -> the verifier learns exactly one fact</div>
<p><b>Ask for the predicate, not the data.</b> A credential can carry a pre-computed
<code>age_over_18</code> claim, so proving eligibility never requires a birthdate. This habit applies
well beyond wallets. Most systems that store dates of birth only ever needed a boolean.</p>

<h4>The mDL and why standards collided</h4>
<p>Mobile driving licenses arrived from a different direction: ISO/IEC 18013-5, written by standards
bodies serving physical documents. It uses <b>CBOR</b>, Concise Binary Object Representation, the binary cousin of JSON, which is why you
cannot read one with a JSON parser. It works offline over NFC or Bluetooth at a roadside stop with no
connectivity. OID4VP came from the web. Both are deployed, and convergence is partial:
OID4VP can carry mdoc credentials (the mDL's own credential format), so transport and format are increasingly separable. Expect to meet
both.</p>

<h4>Age assurance: what wallets do and do not solve</h4>
<p>Regulators increasingly require age checks, and wallets are the mechanism most often proposed.
Verifiable presentation solves the technical problem: prove over-18 without revealing identity or
birthdate, unlinkably enough for most purposes. It does not solve the fact that <b>somebody must still
have verified the underlying fact</b>, which requires an issuer who saw a real document. The privacy
question moves from "what does this site learn" to "who issued this, and what did they retain".</p>

<h4>What is still unsettled</h4>
<ul>
<li><b>Revocation.</b> Status lists exist, but checking one can reintroduce a call that tells someone
you are being verified.</li>
<li><b>Unlinkability.</b> SD-JWT's issuer signature is identical across presentations, so colluding
verifiers can correlate. BBS+ fixes it and is not yet widely deployed. <b>BBS</b> is a signature scheme
that lets a holder prove some of the signed facts without revealing the rest, and without two
presentations looking alike, so nobody can tell they came from the same credential.</li>
<li><b>Recovery.</b> Losing the phone means losing the credentials. The recovery story is
per-ecosystem and mostly immature.</li>
<li><b>Trust.</b> A verifier must know which issuers to accept: the trust-anchor and federation
problem, now at ecosystem scale.</li>
</ul>
<p>For most systems today, watch rather than adopt. The habit to keep regardless: <b>ask for the
narrowest fact that answers your question.</b></p>`,
docs:[['OpenID for Verifiable Credential Issuance (OID4VCI)','https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0.html'],['OpenID for Verifiable Presentations (OID4VP)','https://openid.net/specs/openid-4-verifiable-presentations-1_0.html'],['ISO/IEC 18013-5, mobile driving license (mDL)','https://www.iso.org/standard/69084.html'],['W3C, Verifiable Credentials Data Model 2.0','https://www.w3.org/TR/vc-data-model-2.0/']],
ex:{title:'Ask for the predicate, not the data',
prompt:`Write <code>Wallet</code> with three methods. <code>static String minimalClaim(String question)</code> returns the narrowest claim that answers it: <code>"age_over_18"</code> for <code>"is-adult"</code>, <code>"country"</code> for <code>"is-resident"</code>, <code>"has_licence"</code> for <code>"may-drive"</code>, and <code>"unknown"</code> otherwise including null, never <code>"birthdate"</code>. <code>static boolean disclosureMinimal(java.util.Set&lt;String&gt; disclosed, String required)</code> is true only when exactly the required claim was disclosed and nothing else. <code>static boolean presentationBound(String kbAud, String verifier, String kbNonce, String expectedNonce)</code> requires both to match, rejecting nulls.`,
starter:`import java.util.*;

public class Wallet {
    static String minimalClaim(String question) {
        return null;
    }
    static boolean disclosureMinimal(Set<String> disclosed, String required) {
        return false;
    }
    static boolean presentationBound(String kbAud, String verifier, String kbNonce, String expectedNonce) {
        return false;
    }
}`,
tests:[{d:'adulthood is a predicate, not a birthdate',re:'(?:case\\s*["\']is-adult["\'][^;}]*?return\\s+["\']age_over_18["\'])'},{d:'residency asks for country only',re:'"country"'},{d:'driving eligibility is a boolean claim',re:'"has_licence"'},{d:'unknown questions fall through',re:'"unknown"'},{d:'exactly one claim may be disclosed',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:size\\s*\\(\\s*\\)\\s*==\\s*1))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:size\\s*\\(\\s*\\)\\s*==\\s*1)[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:size\\s*\\(\\s*\\)\\s*==\\s*1)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:size\\s*\\(\\s*\\)\\s*==\\s*1)[^{]*?return\\s+\\k<av>\\b)'},{d:'and it must be the required one',re:'contains\\s*\\(\\s*required\\s*\\)'},{d:'the presentation names this verifier',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:kbAud\\s*\\.\\s*equals|equals\\s*\\(\\s*verifier))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:kbAud\\s*\\.\\s*equals|equals\\s*\\(\\s*verifier)[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:kbAud\\s*\\.\\s*equals|equals\\s*\\(\\s*verifier)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:kbAud\\s*\\.\\s*equals|equals\\s*\\(\\s*verifier)[^{]*?return\\s+\\k<av>\\b)'},{d:'and this nonce',re:'kbNonce\\s*\\.\\s*equals|equals\\s*\\(\\s*expectedNonce'},{d:'a guard returns its constant, not the negation of it',re:'return\\s+!\\s*\\(?\\s*(?:true|false)\\s*\\)?\\s*;',not:true}],
behavior:`minimalClaim("is-adult") returns age_over_18, never birthdate: a credential can carry the pre-computed predicate so proving eligibility never discloses a date, and most systems that store dates of birth only ever needed a boolean. minimalClaim("unknown-question") returns unknown. disclosureMinimal(Set.of("age_over_18"), "age_over_18") is true, while disclosing the required claim plus a name is false, because over-disclosure defeats the point even when the extra claim seems harmless. presentationBound("https://bar","https://bar","n1","n1") is true; a mismatched audience or nonce is false, which is what stops a verifier replaying your presentation somewhere else.`,
hints:['A switch mapping each question to its narrowest claim, defaulting to "unknown".','Minimal means exactly one element, and that element is the required one.','Guard both strings, then compare both pairs.'],
solution:`import java.util.*;

public class Wallet {
    static String minimalClaim(String question) {
        if (question == null) return "unknown";
        switch (question) {
            case "is-adult":    return "age_over_18";  // the predicate, not the date
            case "is-resident": return "country";
            case "may-drive":   return "has_licence";
            default:            return "unknown";
        }
    }
    static boolean disclosureMinimal(Set<String> disclosed, String required) {
        if (disclosed == null || required == null) return false;
        // exactly one: over-disclosure defeats the purpose
        return disclosed.size() == 1 && disclosed.contains(required);
    }
    static boolean presentationBound(String kbAud, String verifier, String kbNonce, String expectedNonce) {
        if (kbAud == null || kbNonce == null) return false;
        return kbAud.equals(verifier) && kbNonce.equals(expectedNonce);
    }
}`}}
]});
