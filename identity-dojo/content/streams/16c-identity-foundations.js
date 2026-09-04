STREAMS.push({iam:true,sec:'Identity & federation foundations',icon:'🪪',title:'Identity Foundations',blurb:'The vocabulary of identity from scratch: a glossary, then authentication vs authorization, sessions vs tokens, SSO & federation, IdPs and clients, scopes and consent. The base every OAuth/OIDC/SAML lesson builds on.',lessons:[

{id:'idf0',title:'Glossary: the identity & OAuth vocabulary',body:`
<p>Identity is drowning in jargon, and many terms mean the same thing in different protocols. Rather
than cram every definition here, Dev Dojo keeps a living <b>&#128214; Glossary</b> as its own section in
the left sidebar, organized by domain and in logical reading order (core distinction &rarr; actors
&rarr; tokens &rarr; protocols &rarr; flows &rarr; endpoints &rarr; concepts &rarr; threats &rarr;
governance).</p>
<p><b>Two ways to use it.</b> Open the Glossary section any time as a full reference. And in <i>any</i>
lesson, <b>select or double-click a term</b> &mdash; like <code>OAuth</code>, <code>SAML</code>,
<code>PKCE</code>, <code>JWT</code>, <code>CSRF</code>, <code>scope</code> or <code>nonce</code> &mdash;
and a popup shows its definition on the spot. The same click-to-explain that already works for Java
keywords now covers the whole identity vocabulary.</p>
<p>The rest of this stream builds on that vocabulary: authentication vs authorization, sessions vs
tokens, SSO &amp; federation, IdPs and clients, scopes and consent. Whenever a word trips you up, the
Glossary is one click away. The quick exercise below cements the acronyms you will see most.</p>

<h4>Why the vocabulary is the hard part</h4>
<p>Identity is unusual among technical domains: the concepts are not especially complicated, but the <b>same idea has a different name in every protocol</b>, and two different ideas frequently share a name. The thing that requests a token is a <i>client</i> in OAuth, a <i>relying party</i> in OIDC and a <i>service provider</i> in SAML. The thing that issues one is an <i>authorization server</i> in OAuth, an <i>OpenID provider</i> in OIDC and an <i>identity provider</i> in SAML. None of these are synonyms by accident (each specification named the roles from its own point of view), but a conversation mixing all three is where most identity confusion actually comes from.</p>
<p>Three pairs are worth fixing in your head before anything else, because getting them backwards makes whole protocols unreadable:</p>
<ul>
<li><b>Authentication</b> proves who you are; <b>authorization</b> decides what you may do. OAuth is an authorization protocol, which is why using it alone to answer "who is this user?" is a category error, and why OIDC exists.</li>
<li><b>An access token</b> is for a resource server and is none of your business as a client; an <b>ID token</b> is for the client and says who signed in. Sending an ID token to an API is one of the most common integration bugs there is.</li>
<li><b>Authorization</b> (permission) is not <b>authentication</b> (identity) is not <b>accounting</b> (the audit trail): the three A's are separate systems with separate failure modes.</li>
</ul>

<h4>How to use the glossary while you read</h4>
<p>Open the <b>&#128214; Glossary</b> in the sidebar as a full reference, or select any term inside a lesson to see its definition in place. The order it is organized in (core distinction, actors, tokens, protocols, flows, endpoints, concepts, threats, governance) is also a reasonable reading order if you want the vocabulary in one pass before the protocols that use it.</p>
<p>One habit pays for itself throughout this course: whenever a lesson introduces a term, say out loud <b>which role it belongs to and in which protocol</b>. "Assertion: that is SAML's word for the signed statement about the user, the equivalent of an ID token." Terms anchored to a role and a protocol stay put; terms learned as isolated definitions do not.</p>`,
docs:[['OAuth 2.0 roles (RFC 6749 §1.1)','https://www.rfc-editor.org/rfc/rfc6749#section-1.1'],['OIDC terminology','https://openid.net/specs/openid-connect-core-1_0.html#Terminology'],['CSRF (OWASP)','https://owasp.org/www-community/attacks/csrf']],
ex:{title:'Expand the acronyms',
prompt:`Write <code>Glossary</code> with <code>static String expand(String abbr)</code> that returns the full term for common identity acronyms: <code>"IdP"</code>→<code>"Identity Provider"</code>, <code>"SP"</code>→<code>"Service Provider"</code>, <code>"RP"</code>→<code>"Relying Party"</code>, <code>"AS"</code>→<code>"Authorization Server"</code>, <code>"RS"</code>→<code>"Resource Server"</code>, <code>"OIDC"</code>→<code>"OpenID Connect"</code>, <code>"PKCE"</code>→<code>"Proof Key for Code Exchange"</code>, <code>"JWT"</code>→<code>"JSON Web Token"</code>, <code>"MFA"</code>→<code>"Multi-Factor Authentication"</code>, <code>"SSO"</code>→<code>"Single Sign-On"</code>, and <code>"unknown"</code> for anything else.`,
starter:`public class Glossary {
    static String expand(String abbr) {
        return null;
    }
}`,
tests:[{d:'IdP → Identity Provider',re:'(?:["\']IdP["\'][^;}]*?return\\s+["\']Identity Provider["\'])|(?:case\\s*["\']IdP["\']\\s*->\\s*(?:\\{\\s*)?["\']Identity Provider["\'])|(?:["\']IdP["\']\\s*:\\s*["\']Identity Provider["\'])|(?:(?:put|entry|of)\\s*\\(\\s*["\']IdP["\']\\s*,\\s*["\']Identity Provider["\'])'},{d:'RP → Relying Party',re:'"RP".*?"Relying Party"'},{d:'AS → Authorization Server',re:'"AS".*?"Authorization Server"'},{d:'OIDC → OpenID Connect',re:'"OIDC".*?"OpenID Connect"'},{d:'PKCE → Proof Key for Code Exchange',re:'"PKCE".*?"Proof Key for Code Exchange"'},{d:'unknown default',re:'"unknown"'}],
behavior:`expand("IdP") returns "Identity Provider", expand("RP") returns "Relying Party", expand("PKCE") returns "Proof Key for Code Exchange", and expand("XYZ") returns "unknown". A quick reinforcement of the vocabulary the rest of the domain uses.`,
hints:['A <code>switch (abbr)</code> with a <code>case</code> per acronym and a <code>default: return "unknown";</code> is the clearest.','Return the exact full-term strings from the prompt.','Anything not listed falls through to "unknown".'],
solution:`public class Glossary {
    static String expand(String abbr) {
        switch (abbr) {
            case "IdP":  return "Identity Provider";
            case "SP":   return "Service Provider";
            case "RP":   return "Relying Party";
            case "AS":   return "Authorization Server";
            case "RS":   return "Resource Server";
            case "OIDC": return "OpenID Connect";
            case "PKCE": return "Proof Key for Code Exchange";
            case "JWT":  return "JSON Web Token";
            case "MFA":  return "Multi-Factor Authentication";
            case "SSO":  return "Single Sign-On";
            default:     return "unknown";
        }
    }
}`}},

{id:'idf1',title:'Authentication vs authorization',body:`
<p>These two words get mixed up constantly. They answer <b>different questions</b>:</p>
<ul>
<li><b>Authentication (authn)</b>: <i>who are you?</i> Proving identity (login).</li>
<li><b>Authorization (authz)</b>: <i>what are you allowed to do?</i> Deciding access, <b>after</b> you're known.</li>
</ul>
<p>The nightclub analogy: <b>authentication</b> is the bouncer checking your ID at the door; <b>authorization</b> is your wristband deciding which rooms you can enter. You authenticate once; you're authorized many times.</p>
<p>The core nouns:</p>
<ul>
<li><b>Identity</b>: the account/entity (a user, or a service/workload).</li>
<li><b>Principal / Subject</b>: the specific "who" a request is acting as. In tokens this is the <code>sub</code> claim.</li>
<li><b>Credentials</b>: what proves identity: a password, a private key, a client secret, a certificate.</li>
<li><b>Factors &amp; MFA</b>: categories of proof: something you <i>know</i> (password), <i>have</i> (phone/security key), <i>are</i> (biometric). Multi-factor combines two+.</li>
</ul>
<p>A request typically carries a credential; the server <b>authenticates</b> it to establish a principal, then <b>authorizes</b> the action against that principal's permissions. Mixing these up is a top source of security bugs, e.g. checking <i>who</i> but never <i>whether they're allowed</i>.</p>
<div class="codeSample" data-hl>// authentication: verify a credential -> establish the principal
// authorization: given the principal's roles, allow or deny the action
if (authenticate(header)) {          // who are you?
    if (authorize(roles, "orders:write")) { ... }   // may you do this?
}</div>

<h4>The airport, in plain English</h4>
<p>You arrive at an airport. At the check-in desk someone looks at your passport and agrees you are the
person in the photograph. That is <b>authentication</b>: proving who you are. Nobody has yet said where
you may go.</p>
<p>At the gate someone looks at your boarding pass and decides whether you may board <i>this</i> flight,
in <i>that</i> seat, through <i>that</i> door. That is <b>authorization</b>: deciding what you may do,
now that you are known. Two different checks, two different failures, and confusing them is the source of
an enormous amount of muddled security design.</p>
<div class="codeSample" data-hl>AUTHENTICATION   "who are you?"      -> a subject     -> 401 if it fails
AUTHORIZATION    "may you do this?" -> a decision    -> 403 if it fails

// and the sequence never reverses. you cannot decide what someone may
// do before you know who they are - which is why every request handler
// authenticates first and authorizes second.</div>

<h4>Why 401 and 403 are different, concretely</h4>
<p><b>401 Unauthorized</b> is misnamed: it means <i>unauthenticated</i>. "I do not know who you are.
Present a credential." A browser can act on it: show the login page. It must carry a
<code>WWW-Authenticate</code> header saying which scheme to use.</p>
<p><b>403 Forbidden</b> means "I know exactly who you are, and the answer is still no." Logging in again
will not help. Showing a login page here is the classic confusing bug: the user signs in, lands back on
the same page, and gets 403 again, forever.</p>
<p>The practical test: <i>would presenting a different credential change the outcome?</i> Yes means 401.
No means 403.</p>

<h4>Where each one actually lives</h4>
<div class="codeSample" data-hl>AUTHENTICATION happens ONCE, at the edge, and produces a token or session.
  passwords, passkeys, MFA, SSO redirects, certificates -
  all of it is machinery for answering one question, one time.

AUTHORIZATION happens ON EVERY REQUEST, everywhere, forever.
  "may this subject read this record?" is asked again for every
  record, every endpoint, every service in the chain.

// which is why authorization bugs vastly outnumber authentication
// bugs in real applications: there are thousands of decisions and
// only one login.</div>

<h4>The mistake this distinction prevents</h4>
<p>"The user is logged in, so they can see it." That sentence collapses the two, and it is how
<b>IDOR</b> happens: an application checks that <i>somebody</i> is authenticated, then serves
<code>/orders/1042</code> to whoever asked, without checking that this order belongs to them. Changing the
number in the URL is then a complete data breach, and it is consistently among the most exploited web
vulnerabilities.</p>
<p>Authentication tells you the request has an owner. It says nothing at all about what that owner is
entitled to see.</p>

<h4>Two more words you will meet immediately</h4>
<p><b>Identification</b> is claiming an identity: typing a username. Authentication is <i>proving</i> it.
The username identifies; the password (or passkey) authenticates. A system that accepts an identifier as
proof has skipped the second step, which is exactly what an unauthenticated <code>X-User-Id</code> header
does.</p>
<p><b>Accounting</b> (or auditing) is the third leg: recording what was decided and what happened. Together
they are sometimes called <b>AAA</b> (authentication, authorization, accounting), and the third is the one
teams discover they needed only after an incident.</p>`,
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
<p>Before any protocol can run, something has to turn a <i>human being</i> into something a computer can
check. Every later lesson assumes that has already happened. This is that missing first step, and it
explains a pile of vocabulary that otherwise arrives unannounced.</p>

<h4>Four things people call "identity" (they are not the same)</h4>
<ul>
<li><b>The person</b>: a real human, or a real machine. Exists whether or not any computer knows it.</li>
<li><b>The identity</b>: the set of facts a system holds about that person. Abstract.</li>
<li><b>The account</b>: the concrete record in one particular system. One person routinely has many
accounts: a work account, a Google account, a customer account. Same person, different accounts.</li>
<li><b>The identifier</b>: the string that names the account inside that system: a username, an email,
a UUID, an employee number.</li>
</ul>
<p>Protocol specs say <b>subject</b> (the entity being described, the <code>sub</code> claim in a JWT)
and <b>principal</b> (the authenticated entity a system is currently acting for). Treat them as
"the who." The important habit: a person is not an account, and an account is not an identifier.</p>

<h4>The lifecycle, start to finish</h4>
<ol>
<li><b>Identity proofing</b>: establishing that the person is who they claim <i>in the real world</i>.
Checking a passport, verifying an employment record, confirming an email. This is not authentication;
it happens once, before any account exists. Getting it wrong means you will perfectly authenticate an
impostor forever.</li>
<li><b>Registration / enrollment</b>: creating the account and assigning the identifier.</li>
<li><b>Credential binding</b>: attaching a way to prove ownership of that account: setting a password,
registering a passkey, issuing a certificate. <b>Binding</b> is the actual link between the person and
the identifier, and it is the step attackers target: a self-service password reset with a weak email
check is a binding vulnerability, not an authentication one.</li>
<li><b>Authentication</b>: every subsequent login. The person presents the bound credential and the
system confirms it matches. This is the only step most courses discuss.</li>
<li><b>Ongoing changes ("mover")</b>: the person changes department, role, or name; entitlements must
follow.</li>
<li><b>Deprovisioning ("leaver")</b>: the account is disabled and access ends. The unglamorous step
that audits actually fail on: orphaned accounts belonging to people who left years ago.</li>
</ol>
<p>Steps 2, 5 and 6 together are <b>provisioning</b>, and the industry shorthand for the whole arc is
<b>joiner / mover / leaver</b>. Automating it across systems is what SCIM does, much later in the course.</p>

<h4>Credential vs authenticator</h4>
<p>These get used interchangeably and should not be. NIST is precise about it:</p>
<ul>
<li><b>Authenticator</b>: the <i>thing</i> that does the proving: a password, a phone running an
authenticator app, a security key, a fingerprint sensor. Something you know, have, or are.</li>
<li><b>Credential</b>: the <i>binding record</i> that ties an authenticator to an identifier, stored by
the system: the row saying "account alice is proven by this password hash" or "…by this public key."</li>
</ul>
<p>So you <i>possess</i> an authenticator; the system <i>stores</i> a credential. When someone says
"credentials were stolen," ask which: a stolen authenticator (a password) is a different incident from
a stolen credential store (the hash database).</p>

<h4>Where identity lives: the directory</h4>
<p>Accounts and their facts are kept in a <b>directory</b>, historically LDAP or Active Directory,
today just as often a cloud identity provider's user store. It holds accounts, their <b>attributes</b>
(department, manager, email), and their group memberships. When a later lesson says "the IdP looks up
the user," this is what it looks in.</p>
<div class="codeSample" data-hl>PERSON            Ada, a real human being
  |  identity proofing        (passport checked, happens once, before login)
  v
ACCOUNT           id=u-4817  in the corporate directory
  |  identifier               ada@corp.example
  |  attributes               department=Platform, manager=u-1102
  |  credential binding       -> authenticator: passkey (public key stored)
  v
AUTHENTICATION    every login from now on: prove you hold the authenticator
  |
  v
DEPROVISION       account disabled -> access ends everywhere at once</div>
<p>Two payoffs from having this map. First, <b>assurance</b>: a phrase like "high assurance" is
ambiguous until you ask <i>which step</i>: how carefully was the person proofed (IAL), or how strong is
the login (AAL)? Those are different scales for different steps. Second, <b>revocation</b>: "remove
access" can mean disable the account, unbind a credential, or invalidate a live session, and only the
lifecycle view makes it obvious those are three separate actions.</p>`,
docs:[['NIST SP 800-63-3 (Digital Identity Guidelines (overview))','https://pages.nist.gov/800-63-3/sp800-63-3.html'],['NIST SP 800-63A (Enrollment & Identity Proofing)','https://pages.nist.gov/800-63-3/sp800-63a.html'],['RFC 7644 (SCIM Protocol)','https://www.rfc-editor.org/rfc/rfc7644']],
exs:[
{title:'Sort the vocabulary: identifier, credential, authenticator, attribute',
prompt:`Write <code>IdentityTerms</code> with <code>static String classify(String thing)</code> returning: <code>"identifier"</code> for <code>"email"</code> or <code>"username"</code>; <code>"authenticator"</code> for <code>"password"</code>, <code>"passkey"</code> or <code>"fingerprint"</code>; <code>"attribute"</code> for <code>"department"</code> or <code>"manager"</code>; and <code>"unknown"</code> for anything else, including <code>null</code>. Use a <code>switch</code> on the input. Then add <code>static boolean provesOwnership(String thing)</code> returning <code>true</code> only for authenticators, the only category that proves you own the account.`,
starter:`public class IdentityTerms {
    static String classify(String thing) {
        return null;
    }
    static boolean provesOwnership(String thing) {
        return false;
    }
}`,
tests:[{d:'guards null before switching',re:'thing\\s*==\\s*null|null\\s*==\\s*thing'},{d:'uses a switch on the input',re:'switch\\s*\\(\\s*thing'},{d:'names an account: identifier',re:'"identifier"'},{d:'proves ownership: authenticator',re:'"authenticator"'},{d:'a stored fact: attribute',re:'"attribute"'},{d:'unrecognised input falls through',re:'"unknown"'},{d:'ownership is derived from the classification',re:'"authenticator"\\s*\\.\\s*equals|equals\\s*\\(\\s*"authenticator"'}],
behavior:`classify("email") and classify("username") return "identifier". classify("password"), classify("passkey") and classify("fingerprint") return "authenticator". classify("department") and classify("manager") return "attribute". classify("badge-number") and classify(null) return "unknown". provesOwnership("passkey") is true; provesOwnership("email") is false, because an identifier only names the account, it never proves you hold it.`,
hints:['Guard first: <code>if (thing == null) return "unknown";</code>; a switch on null throws.','Group the cases with fall-through: <code>case "email": case "username": return "identifier";</code>','<code>return "authenticator".equals(classify(thing));</code>, which reuses the method instead of repeating the list.'],
solution:`public class IdentityTerms {
    static String classify(String thing) {
        if (thing == null) return "unknown";
        switch (thing) {
            case "email":
            case "username":
                return "identifier";   // names the account
            case "password":
            case "passkey":
            case "fingerprint":
                return "authenticator"; // proves you hold the account
            case "department":
            case "manager":
                return "attribute";     // a fact about the account
            default:
                return "unknown";
        }
    }
    static boolean provesOwnership(String thing) {
        // only an authenticator proves ownership; an identifier merely names
        return "authenticator".equals(classify(thing));
    }
}`},
{title:'Joiner, mover, leaver',
prompt:`Write <code>Lifecycle</code> with <code>static String stage(String event)</code> returning <code>"joiner"</code> for <code>"hired"</code>, <code>"mover"</code> for <code>"transferred"</code> or <code>"promoted"</code>, <code>"leaver"</code> for <code>"terminated"</code> or <code>"resigned"</code>, and <code>"unknown"</code> otherwise (including <code>null</code>). Then <code>static boolean endsAccess(String event)</code>, returning <code>true</code> only for a leaver, the stage where deprovisioning must run, and the one organizations most often skip.`,
starter:`public class Lifecycle {
    static String stage(String event) {
        return null;
    }
    static boolean endsAccess(String event) {
        return false;
    }
}`,
tests:[{d:'guards null input',re:'event\\s*==\\s*null|null\\s*==\\s*event'},{d:'switches on the event',re:'switch\\s*\\(\\s*event'},{d:'account created: joiner',re:'"joiner"'},{d:'entitlements change: mover',re:'"mover"'},{d:'access must end: leaver',re:'"leaver"'},{d:'unrecognised events fall through',re:'"unknown"'},{d:'deprovisioning is driven by the stage',re:'"leaver"\\s*\\.\\s*equals|equals\\s*\\(\\s*"leaver"'}],
behavior:`stage("hired") returns "joiner". stage("transferred") and stage("promoted") return "mover". stage("terminated") and stage("resigned") return "leaver". stage("rehired") and stage(null) return "unknown". endsAccess("resigned") is true; endsAccess("promoted") is false: a mover keeps access but should have different entitlements, which is why movers quietly accumulate permissions over a career.`,
hints:['Guard null first, then <code>switch (event)</code>.','Two events map to each of mover and leaver, so use case fall-through.','<code>return "leaver".equals(stage(event));</code>'],
solution:`public class Lifecycle {
    static String stage(String event) {
        if (event == null) return "unknown";
        switch (event) {
            case "hired":
                return "joiner";   // provision the account
            case "transferred":
            case "promoted":
                return "mover";    // entitlements must follow the person
            case "terminated":
            case "resigned":
                return "leaver";   // deprovision: access ends everywhere
            default:
                return "unknown";
        }
    }
    static boolean endsAccess(String event) {
        return "leaver".equals(stage(event));
    }
}`}]},

{id:'idfclaim',title:'Attributes, claims and assertions: the data model',body:`
<p>Identity systems spend most of their time moving <i>facts about people</i> from where they are stored
to where a decision is made. Three words describe those facts at three different moments, and they are
used interchangeably far too often. Separating them makes the rest of the domain legible.</p>

<h4>The three words</h4>
<ul>
<li><b>Attribute</b>: a fact <i>at rest</i>, stored in a directory. <code>department = Platform</code>
sitting in a database row. It is just data; nobody has vouched for it in transit.</li>
<li><b>Claim</b>: a fact <i>in transit</i>, asserted by someone. When the IdP puts
<code>"department":"Platform"</code> into a token, the fact becomes a claim: a statement <i>by a
specific issuer</i>. The word is deliberately humble: a claim is something asserted, and it is worth
exactly as much as your trust in whoever asserted it.</li>
<li><b>Assertion</b>: a <i>signed bundle</i> of claims about a subject, issued at a point in time. A
SAML assertion is literally called that; an OIDC ID token is the same concept as a JWT.</li>
</ul>
<p>So the pipeline is: <b>attribute</b> (stored) &rarr; selected and asserted as a <b>claim</b> &rarr;
packaged and signed into an <b>assertion</b> &rarr; carried inside a <b>token</b>. The token is the
envelope; the claims are the letter.</p>

<h4>Registered claims: the ones every token has</h4>
<p>A handful of claim names are standardized, and they are about the <i>envelope</i>, not the person:</p>
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
reassigned and names change; a good <code>sub</code> is an immutable, issuer-scoped identifier. Keying
your user records on email is a bug that surfaces years later when someone changes theirs.</p>

<h4>Attribute release and mapping</h4>
<p>An IdP knows far more about a person than any one app should receive. <b>Attribute release</b> is the
per-app policy deciding which attributes become claims: an expense tool may get
<code>department</code> and <code>manager</code>, a public forum only a nickname. This is data
minimization, and in a consumer context it is what a consent screen is approving.</p>
<p><b>Attribute mapping</b> handles the fact that everyone names things differently: the directory says
<code>sAMAccountName</code>, SAML sends <code>urn:oid:0.9.2342...</code>, OIDC says
<code>preferred_username</code>, and your app wants <code>username</code>. Mapping is the translation
table, and mismatched mappings are the single most common cause of a federation integration that
authenticates fine but creates broken user records.</p>

<h4>Why "claim" is exactly the right word</h4>
<p>A claim carries no authority on its own. Its weight comes entirely from three things: <i>who</i>
asserted it (<code>iss</code>), whether the signature proves they really did, and whether you had
already decided to trust that issuer for that kind of fact. An IdP asserting
<code>"department":"Finance"</code> is authoritative if it owns HR data, and is merely repeating
something if it does not.</p>
<p>This is where a real security habit comes from: <b>never trust a claim you did not verify the
signature on, and never trust an issuer for facts it has no authority over.</b> A token from a valid
issuer claiming <code>"role":"admin"</code> means nothing if roles are your application's concept and
the IdP has no business asserting them.</p>`,
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

{id:'idfpair',title:'Pairwise identifiers: the same person, different names',body:`
<p>Every application you sign into with the same identity provider receives an identifier for you. If they
all receive the <b>same</b> one, then any two of them can compare notes and discover they are talking about
the same person, without asking you, and without either of them holding your name.</p>

<h4>The problem, concretely</h4>
<p>Suppose a fertility clinic, a job board and a debt advice service all use the same social login. Each
receives <code>sub = 7c9e6679-...</code>. None of them knows who you are. But if two of them share data
(through an advertising network, a data broker, or a breach), that shared identifier <b>joins the two
records</b>, and the combination reveals something neither held alone.</p>
<p>This is <b>correlation</b>, and it is a privacy failure rather than a security one. Nothing was stolen;
the identifier did exactly what it was designed to do.</p>

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

<h4>Sector identifiers, and the problem they solve</h4>
<p>If pairwise is derived per <i>client</i>, an organization running five applications gets five different
identifiers for one user, and now <i>they</i> cannot recognize their own customer across their own
products. That is the opposite problem.</p>
<p>A <b>sector identifier</b> is the grouping key. Several clients declare the same sector, so they receive
the same pairwise <code>sub</code> as each other and a different one from everyone else. The sector is
proved by hosting a JSON file listing the redirect URIs that belong to it, so a client cannot simply claim
somebody else's sector and inherit their identifiers.</p>
<div class="codeSample" data-hl>subject_type = pairwise
sector_identifier_uri = https://example.com/redirect_uris.json
   // that file lists every redirect URI in the sector, and the IdP
   // checks each client's registered URI appears in it.

sub = hash(sector_identifier + local_user_id + salt)

// same sector  -> same sub  (one company recognizes its own user)
// other sector -> different sub  (nobody else can join to it)</div>

<h4>What it costs, and when not to use it</h4>
<p><b>Support becomes harder.</b> A user quoting "my ID is 2f4c..." means nothing to anyone but that one
application, and correlating a complaint across systems now needs the IdP.</p>
<p><b>Migration is awkward.</b> Switching an existing integration from public to pairwise changes every
identifier at once, so every account is orphaned unless you run a mapping table through the transition.</p>
<p><b>It is wrong inside one trust boundary.</b> Workforce identity <i>wants</i> correlation: HR, payroll
and the helpdesk are supposed to be talking about the same employee. Pairwise is a <b>CIAM</b> tool, which
is the CIAM-versus-workforce distinction from earlier in this stream showing up as a concrete technical
default.</p>

<h4>The rule</h4>
<p><b>Public for workforce and for applications you control. Pairwise for consumer identity, and
particularly wherever the mere fact of using a service is sensitive</b>: health, finance, legal,
employment. Apple's Sign in with Apple made the strong version of this famous by also offering a relay
email address, which extends the same idea from the identifier to the contact detail.</p>
<p>And the caveat worth stating: pairwise stops correlation <i>by identifier</i>. It does nothing about an
email address, a phone number or a device fingerprint shared between the same two parties. It is one
control, not a privacy guarantee.</p>`,
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

{id:'idftok',title:'What a token actually is (and how it differs from a JWT)',body:`
<p>Every lesson from here on says <b>token</b> constantly. Before that word can carry any weight, you
need to know what one physically <i>is</i>: what it looks like on the wire, who makes it, what is
inside it, and how the receiver decides to believe it. This lesson is that foundation.</p>

<h4>The one-sentence definition</h4>
<p>A token is <b>a string that stands for a verified fact, issued by an authority, that the holder
presents later instead of proving themselves again</b>.</p>
<p>That is the whole idea. You prove who you are <i>once</i> (password, passkey, MFA) and in exchange
you get a small piece of text. On every later request you hand over that text rather than your password.
A cinema ticket is the perfect analogy: you paid at the desk (authentication), you got a stub (the token),
and the usher at the door checks the stub, not your credit card. The stub is worth something precisely
because the usher trusts whoever printed it.</p>

<h4>The one distinction that explains everything: opaque vs structured</h4>
<p>There are exactly two ways to build a token, and almost every question you will ever have about
tokens resolves to which of these you are holding.</p>
<ul>
<li><b>Opaque (reference) token.</b> A long random string with <i>no meaning</i>. It is a lookup key:
a claim-check ticket. The issuer wrote the real data in its own database and gave you the row id.
To learn anything about it, you must ask the issuer. Nothing leaks, and it can be revoked instantly by
deleting the row. The cost is a network call on every check.</li>
<li><b>Structured (self-contained / value) token.</b> The data <i>travels inside the token</i>, with a
cryptographic signature wrapped around it. Anyone holding the issuer's public key can read it and
confirm nobody edited it: no database, no network call. The cost is that it is readable by anyone who
gets it, and it stays valid until it expires, because there is nothing central to delete.</li>
</ul>
<p><b>The trade-off in one line:</b> opaque tokens are private and instantly revocable but need a
lookup; structured tokens are fast and offline-verifiable but public and hard to revoke.</p>

<h4>What they actually look like</h4>
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
<p>Look at #1 and #4: <b>the same kind of token</b>, differing only in which HTTP header carries it.
Look at #2 and #3: the same kind of token, differing only in JSON vs XML. Format and transport are
separate questions from what the token fundamentally is.</p>

<h4>Inside a JWT</h4>
<p>A JWT is the dominant structured format, so learn to read one on sight. Three parts, separated by
dots, each <b>base64url</b>-encoded (base64 with <code>+/</code> swapped for <code>-_</code> and the
<code>=</code> padding dropped, so it survives being put in a URL):</p>
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
<p><b>Base64url is encoding, not encryption.</b> This is the single most misunderstood point about
JWTs. Anyone who intercepts the token can paste the middle chunk into a decoder and read every claim.
The signature stops <i>tampering</i>, not <i>reading</i>. Never put a password, a national id, or
anything private in a JWT payload. If you truly need the contents hidden, that is a different
format, <b>JWE</b>, which encrypts rather than merely signs.</p>

<h4>How one is created</h4>
<p>Minting a structured token is four mechanical steps, and nothing more:</p>
<ol>
<li>The issuer authenticates the user and decides what is true about them.</li>
<li>It writes those facts as a JSON <b>claims</b> object and base64url-encodes it, along with a header
naming the algorithm.</li>
<li>It <b>signs</b> the joined string with a private key it alone holds, and appends the signature.</li>
<li>It hands the result to the client, which stores it and attaches it to later requests.</li>
</ol>

<h4>How one is interpreted</h4>
<p>Receiving a token is not the same as trusting it. A verifier must, in order:</p>
<ol>
<li><b>Check the signature</b> against the issuer's public key, fetched from the issuer's <b>JWKS</b>
endpoint and matched by the <code>kid</code> in the header. If this fails, stop.</li>
<li><b>Pin the algorithm.</b> Decide in advance that you accept <code>RS256</code> and reject whatever
the header asks for otherwise. A verifier that obeys the token's own <code>alg</code> field can be
handed <code>alg:none</code> and talked out of checking at all.</li>
<li><b>Check <code>iss</code></b>, is this from the issuer I trust?</li>
<li><b>Check <code>aud</code></b>, is this token meant for <i>me</i>? A valid token for a different
API is not a valid token for yours. Skipping this is how a token gets replayed across services.</li>
<li><b>Check <code>exp</code></b> (and <code>nbf</code> if present) against the clock.</li>
<li><i>Only then</i> read the claims and make an authorization decision.</li>
</ol>
<p>For an <b>opaque</b> token there is nothing to verify locally, so the verifier instead calls the
issuer's <b>introspection</b> endpoint (RFC 7662), which answers <code>{"active":true,...}</code> plus
the same claims. Same questions, different place to get the answers.</p>

<h4>Token <i>type</i> and token <i>format</i> are different questions</h4>
<p>This is the confusion the rest of the identity streams depend on you not having. "Access token" is a
<b>role</b>: a job the token does. "JWT" is a <b>format</b>: how the bytes are arranged. They vary
independently: an access token may be a JWT or may be opaque, and you cannot tell from the name.</p>
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
<p>Two role notes worth fixing now. An <b>ID token</b> is proof of <i>who the user is</i>, meant for
your app to read; it is not an API key, and sending it to an API is a common bug. An <b>access
token</b> is the opposite: meant for the API, and your app should treat it as an opaque blob to
forward, even when it happens to be a readable JWT.</p>

<h4>Why not always JWT?</h4>
<p>JWTs won on tooling, not on merit. The real scorecard:</p>
<ul>
<li><b>Revocation.</b> A structured token cannot be un-issued. Log a user out and their JWT keeps
working until <code>exp</code>. The industry's answer is short lifetimes (5&ndash;15 minutes) plus a
refresh token, which is a patch, not a fix.</li>
<li><b>Size.</b> A JWT is often 800&ndash;2000 bytes on every single request; an opaque token is ~30.
SAML assertions are larger still, which is why they ride in POST bodies rather than URLs.</li>
<li><b>Crypto agility.</b> The <code>alg</code> header was a design mistake: it let attackers propose
the algorithm. <b>PASETO</b> exists specifically to remove that choice.</li>
<li><b>Privacy.</b> Readable by anyone who holds it, including the browser and any log that captured it.</li>
</ul>
<p><b>The rule of thumb in practice:</b> use structured tokens between <i>services</i>, where offline
verification is the whole point; use opaque tokens in <i>browsers</i>, where leakage is likely and
instant revocation matters. Many large providers do both, issuing an opaque token to the browser and
swapping it for a JWT at the API gateway.</p>
<p>Now that <b>token</b> means something concrete, the next lesson can compare carrying identity in a
session against carrying it in a token, and the choice will read as a real engineering trade-off
rather than jargon.</p>

<h4>A note on cookies, since one appeared above</h4>
<p>Shape 4 in that list mentions a cookie, and this course does not use a term before defining it, so
here is the whole idea, in one paragraph. <b>HTTP has no memory.</b> Two requests from the same browser are,
as far as the protocol is concerned, two strangers. A <b>cookie</b> is the fix: the server sends a small
named value back with a response, the browser stores it, and the browser then attaches it
<i>automatically</i> to every subsequent request to that site.</p>
<div class="codeSample" data-hl>// the server hands one out:
HTTP/1.1 200 OK
Set-Cookie: session=8f3a91c07b2e4d15; HttpOnly; Secure; SameSite=Lax

// and the browser sends it back, unprompted, on every later request:
GET /account
Cookie: session=8f3a91c07b2e4d15</div>
<p>That word <b>automatically</b> is the whole story, good and bad. It is what makes staying logged in
effortless: you never re-present anything. It is also why a cookie can be sent by a request the user did
not intend, which is the basis of CSRF, and why cookies carry flags (<code>HttpOnly</code>,
<code>Secure</code>, <code>SameSite</code>) that constrain when the browser will attach them.</p>
<p>For now, one thing to carry forward: <b>a cookie is a transport, not a kind of token</b>. What rides in
it might be an opaque session id, or a JWT, or anything else. The Sessions and Web Login stream takes
cookies apart properly: flags, CSRF, fixation and revocation. This paragraph exists so that the word means
something the first time you meet it.

<h4>Two more words this lesson used before defining them</h4>
<p><b>JWKS</b>: "JSON Web Key Set". When an issuer signs tokens with a private key, verifiers need the
matching <i>public</i> key. Publishing it at a well-known URL is how: a small JSON document listing the
issuer's current public keys, each with a <code>kid</code> (key id) that the token's header names. A
verifier fetches it once, caches it, and re-fetches when it sees a <code>kid</code> it does not recognize,
which is what makes key rotation a non-event. The JOSE stream builds one.</p>
<p><b>Refresh token</b>: an access token is deliberately short-lived so a leaked one expires quickly, but
sending the user back through login every few minutes is unacceptable. A refresh token is a second,
longer-lived credential whose only purpose is to obtain a fresh access token, silently, over a back
channel. It is therefore <b>higher value than the thing it replaces</b>, and the OAuth stream covers what
follows from that: rotation, reuse detection, and why a bare one in a browser is the worst credential in
the system.</p>
<p>Neither is needed to follow the rest of this stream. They appear here because a token lesson cannot
reasonably avoid naming them, and this course does not leave a term hanging.</p>`,
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

{id:'idf2',title:'How identity is carried: sessions vs tokens',body:`
<p>You now know what a token <i>is</i> (previous lesson) and what claims travel inside it. The remaining
question is architectural: once you're authenticated, how does the <i>next</i> request prove it's still
you? There are two answers, and the choice shapes everything downstream: scaling, logout, and how hard
revocation turns out to be.</p>
<ul>
<li><b>Server-side sessions (stateful).</b> The server stores your login in memory/DB and hands you a <b>session cookie</b> holding only an opaque id. Every request sends the cookie; the server looks it up. Simple, easy to revoke, but the server must remember every session (state), which is awkward across many servers.</li>
<li><b>Tokens (stateless).</b> The server hands you a signed <b>token</b> (often a JWT) that <i>contains</i> the claims. Later requests send it in the <code>Authorization: Bearer &lt;token&gt;</code> header; any server verifies the signature and trusts the contents without a lookup. Scales horizontally; the trade-off is revocation is harder (the token is valid until it expires).</li>
</ul>
<p>Two more terms you'll see everywhere:</p>
<ul>
<li><b>Bearer token</b>: "whoever <i>bears</i> (holds) it can use it," like cash. So it must be sent over TLS and kept secret. (Sender-constrained tokens, lesson 6, remove this risk.)</li>
<li><b>Front channel vs back channel.</b> The <b>front channel</b> goes through the user's browser (redirects, URL parameters): visible to the user, so never put secrets there. The <b>back channel</b> is a direct server-to-server call (the app's backend to the auth server): private, where secrets and tokens are safely exchanged. OAuth deliberately uses both (next stream).</li>
</ul>
<div class="codeSample" data-hl>// a token is presented on each request in the Authorization header
Authorization: Bearer eyJhbGciOiJSUzI1Ni␣...  (header.payload.signature)
// a session cookie instead carries only an opaque id the server looks up
Cookie: session=8f3a...   // meaningless without the server's session store</div>

<h4>Two ways to remember someone, in plain English</h4>
<p>HTTP forgets you between every request. Two clicks on the same site are, as far as the protocol is
concerned, two strangers. Everything in this lesson is about how a server remembers.</p>
<p><b>A session is a cloakroom ticket.</b> The venue keeps your coat and hands you a numbered stub. The
stub says nothing about the coat; its only power is that the venue can look up number 47 and find what it
stored. Lose the ticket and someone else can collect your coat; the venue can also decide, at any moment,
that ticket 47 is void.</p>
<p><b>A token is a festival wristband.</b> Everything needed is printed on it and it is sealed so it cannot
be altered: which stages you may enter, and the date it stops working. Nobody has to phone the box office;
staff read the band and decide. Which also means the box office cannot un-print it: once issued, it works
until it expires.</p>

<div class="codeSample" data-hl>SESSION (a reference)              TOKEN (self-contained)
server stores the state            the token IS the state
cookie holds only an id            the claims travel with the request
revoke = delete one row  INSTANT   revoke = hard. it verifies on its own.
every request does a lookup        no lookup: verify the signature
scales with a shared store         scales with no shared anything
opaque to the client               readable by anyone holding it (signed,
                                     not secret - never put secrets in one)</div>

<h4>The trade, stated once</h4>
<p><b>Sessions buy revocation and cost a lookup. Tokens buy statelessness and cost revocation.</b> That is
the whole decision, and everything else (refresh tokens, short lifetimes, denylists, introspection) is an
attempt to soften whichever side you chose.</p>
<p>The consequence people meet in production: you fire an employee at 09:00, disable the account, and their
access token keeps working until it expires. If that window is fifteen minutes, that is a decision you made.
If nobody knows what the window is, it is a decision that made itself.</p>

<h4>Which to use</h4>
<p><b>A session</b> when one server or one trust boundary owns the whole interaction: a traditional web
application, an admin console, a bank's internal tooling. Immediate revocation is worth the lookup, and the
cookie machinery (<code>HttpOnly</code>, <code>Secure</code>, <code>SameSite</code>) is mature and well
understood.</p>
<p><b>A token</b> when the request crosses boundaries: a mobile app calling an API, a service calling
another service, a third party acting for your user. A session id means nothing to a system that does not
share your store; a signed token means something to anyone holding the issuer's public key.</p>
<p><b>Both, deliberately</b>, is the common real answer: a session cookie between the browser and your own
backend, and tokens from that backend outward. That is the BFF pattern, and it exists precisely so the
browser never holds a token at all.</p>

<h4>The word that causes the most confusion</h4>
<p>People say "token" for both. A session id <i>is</i> a token in the loose sense, a string that stands for
your authenticated state. The distinction that matters is not the word but whether the value
<b>carries</b> its meaning or <b>refers</b> to it. Ask that question about any credential and the rest of
its behavior follows: how it is revoked, what happens if it leaks, whether the issuer can be offline.</p>

<h4>Stateful and stateless, in plain English</h4>
<p>Those two words sit underneath everything above, and they are worth ten seconds on their own because
they get used as jargon far more often than they get explained.</p>
<p><b>Stateful</b> means <i>the server remembers something between requests.</i> It wrote something down.
<b>Stateless</b> means <i>it remembers nothing</i>: every request has to arrive carrying whatever is needed
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
<p><b>Stateful costs a lookup and a shared place to look.</b> One server is easy. Ten servers behind a load
balancer means they must all reach the same store, so now you run Redis or a database in the request path
of every single call, and if it goes down, nobody is logged in anywhere. Scaling means scaling that store
too.</p>
<p><b>Stateless costs the ability to change your mind.</b> Nothing to look up means nothing to delete. The
credential is valid because it verifies, not because anyone still agrees with it, so revoking it before it
expires means reintroducing exactly the shared store you were avoiding, just for the exceptions.</p>

<h4>Why this is the real reason sessions and tokens differ</h4>
<p>A session is the stateful choice and a self-contained token is the stateless one, and every difference in
the table above falls out of that:</p>
<div class="codeSample" data-hl>revocation   stateful wins.  there is a row; delete it.
scaling      stateless wins. no shared store to reach or to fail.
size         stateful wins.  a cookie holds an id, not a payload.
privacy      stateful wins.  an opaque id reveals nothing; a JWT is
                             readable by anyone holding it.
availability stateless wins. the issuer can be offline and calls still work.
freshness    stateful wins.  a stateless token carries the permissions it
                             had WHEN IT WAS MINTED, not the ones you have now.</div>
<p>That last row is the one people meet in production. You revoke someone's admin role at 09:00 and their
token keeps asserting it until 09:15, because the token is a photograph of their permissions rather than a
window onto them. Nothing is broken; that is what stateless means.</p>

<h4>The bottom line</h4>
<p><b>Neither is more secure.</b> They fail differently, and the choice is about which failure you can live
with. Most real systems end up in the middle on purpose: short-lived stateless tokens so the staleness
window is small, plus a stateful denylist for the small number of credentials that must die immediately.
That is not indecision; it is buying revocation only where you actually need it, and paying the lookup only
on that path.</p>`,
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
<p>The previous lesson gave you the architectural choice. This one is what that choice costs at three in
the morning, eighteen months later, when the system is running and the pager has gone off. None of it is
exotic, and almost none of it appears in the tutorial that talked the team into tokens.</p>

<h4>A JWT is not free, and it rides on every single request</h4>
<p>A session cookie carries an opaque id: thirty-two bytes, and it never grows, because the id
<i>refers</i> to the state instead of containing it. A JWT contains the state. With a modest payload,
issuer, subject, audience, expiry, issued-at and a scope string, you are looking at 400 to 800 bytes once
it is signed and encoded. That is fine. Then someone adds <code>groups</code>, or <code>roles</code>, or
<code>entitlements</code>, and the token stops having a size and starts having a growth rate.</p>
<p>Two multipliers make this worse than it looks in the debugger. Base64url costs four characters for
every three bytes, so the token on the wire is about a third larger than the JSON you are reading. And it
rides on <i>every</i> request: every API call, every image behind an authenticated route, every poll. That
is bandwidth on a mobile connection, bytes ahead of the first byte of your response, and a copy of itself
in every line of every access log.</p>
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
<p>Past a header limit, the polite failure is <b>431 Request Header Fields Too Large</b>, which at least
names itself. The unkind one is a proxy that truncates the header and forwards it anyway: your service
receives a JWT missing its last few hundred characters, fails the signature check, and answers with a 400
that says nothing about size. You will spend an hour on the signature before you think to count the bytes.
Paste the token into authlint (<code>/authlint/</code>) and it warns above 4 KB and calls anything above
8 KB critical.</p>

<h4>It breaks for your longest-serving employees first</h4>
<p>This is the part worth carrying around. Group membership accumulates and nothing removes it: nobody
is ever taken off the security group for a project that ended in 2019. Token size therefore tracks tenure,
and the first people to cross a limit are the people who have been there longest, which in most
organizations means the people with the most authority and the least appetite for a mystery.</p>
<p>It passes every test, because the fixtures give the user three groups. It passes staging, because the
staging directory was copied before the last two reorganizations. Then it fails in production, on the
first day, for the VP of Engineering, as a login loop rather than as an error anyone can search for. A
<code>groups</code> array over forty entries is worth flagging on sight, which is why authlint does.</p>

<h4>Keeping the token small</h4>
<ul>
<li><b>Carry an identifier and a few claims, not a permission dump.</b> The resource server already has a
database, and looking up what this subject may do gives an answer that is current rather than as old as
the token.</li>
<li><b>Scopes rather than enumerated permissions.</b> <code>orders.write</code> is one claim that stands
for a hundred things. A hundred permission strings is a hundred permission strings, on every request.</li>
<li><b>Filter <code>groups</code> to the ones the audience cares about.</b> The orders API has no use for
the payroll groups, so leaving them out is a smaller token and a smaller disclosure.</li>
<li><b>Split-token, or a BFF.</b> The browser holds an opaque token or a session cookie, and the gateway
mints the JWT inward, where it is short-lived and narrowed to one audience. The OAuth stream builds the
pattern properly.</li>
</ul>
<p>And the evidence that this is a wall rather than a tidiness preference: Microsoft Entra hit it and had
to design around it. Past a threshold the token stops carrying the groups and carries
<code>_claim_names</code> and <code>_claim_sources</code> instead, a pointer to a Microsoft Graph endpoint
your application has to call for the list. That is the <b>groups overage</b> claim, and it turns an offline
check into a network call exactly when you did not plan for one. The largest identity provider in the
enterprise market gave up on fitting groups into a token, which is a fair guide to how the argument ends
in your system.</p>

<h4>Stateless means you cannot take it back</h4>
<p>Revocation lag is not a tuning parameter you get to choose separately. It is the token lifetime,
exactly.</p>
<div class="codeSample" data-hl>09:00  HR disables the account. the directory is now correct.
09:00  the access token minted at 08:31 is still signed, still
       unexpired, and still says role=admin. nothing consults
       the directory, because that was the entire point.
09:14  a production bucket is deleted. every request verified fine.
10:00  exp passes. NOW the token stops working.</div>
<p>Sixty-minute access tokens mean a sixty-minute window in which a disabled account stays authorized.
That can be defensible. What is not defensible is not knowing the number, which lives in whatever your
identity provider was configured with in 2021 rather than in your security policy.</p>

<h4>The logout that does not log out</h4>
<p>Clearing the cookie on logout deletes the client's copy of the token. It does not delete the token. The
bytes are still signed, still unexpired, and still accepted, so anyone who captured them, from a shared
machine, a proxy log, an error report, a browser extension, is holding a working credential until
<code>exp</code>. Logout felt like an event. To the resource server, nothing happened.</p>

<h4>Every fix reintroduces the state you were avoiding</h4>
<ul>
<li><b>A denylist.</b> Now every verification consults a shared store. That is the session lookup wearing
a different name, with the one advantage that it holds only the exceptions.</li>
<li><b>Introspection on every call.</b> Correct and current, at the cost of a network hop per request and
the authorization server sitting in the availability path of everything you run.</li>
<li><b>Short expiry plus refresh.</b> The refresh is a lookup at the token endpoint, so the state is still
there. You have moved it off the hot path and reduced how often anyone consults it.</li>
<li><b>Continuous Access Evaluation.</b> The issuer pushes revocation events to resource servers, which
react in seconds instead of at expiry. It works, and it is a subscription, a delivery guarantee and a
piece of state. The Advanced OAuth and Threats stream gives it a lesson of its own.</li>
</ul>
<p>Notice the shape of that list. Teams adopt JWTs to avoid a lookup, discover they need revocation, and
add a lookup back to get it. At that point the question worth asking out loud is what the JWT is still
buying. Sometimes the answer is real: offline verification between services, an issuer that can be down
for ten minutes without taking the estate with it. Sometimes nobody has asked since the decision was
made.</p>
<p>Shortening the lifetime does not escape the trade either. Five-minute tokens cut the revocation window
by a factor of twelve and multiply traffic to your token endpoint by the same factor, on an endpoint doing
asymmetric crypto and a database write for every call. Lifetime is a dial with load on one end and
staleness on the other, and there is no setting that is free.</p>

<h4>When a session is simply the better answer</h4>
<p>Not a preference, a decision procedure. A <b>session</b> wins when all of these hold: one domain, a
backend you control, first-party clients only, and a logout that has to be immediate. A <b>token</b> wins
when any of these hold: genuinely cross-domain, several services that must verify without calling you, a
third-party client, or a mobile app against a public API.</p>
<div class="codeSample" data-hl>ONE DOMAIN, ONE BACKEND, YOUR OWN USERS  ->  session cookie
  32 bytes. never grows. revocable at any instant. HttpOnly, so
  script running in the page cannot read it.

MANY SERVICES / THIRD PARTIES / MOBILE  ->  token
  self-contained, verifiable by anyone holding the public key,
  and it costs you the ability to change your mind before exp.</div>
<p><b>"We used JWTs because they scale" is the most common piece of cargo-cult reasoning in this
field.</b> Most applications that reach for stateless never had a horizontal-scaling problem. They had one
server, or three behind a load balancer, and a session store nobody ever measured. A session lookup in
Redis is well under a millisecond, and it buys a logout that works and nothing readable if the cookie
leaks. Scaling is a real reason once you have measured it. It is not a default.</p>

<h4>The rest of the list, briefly</h4>
<ul>
<li><b>Clock skew.</b> An <code>iat</code> a few seconds in the future, or an <code>exp</code> a few
seconds past, produces intermittent 401s that reproduce on nothing and clear up by themselves. Sixty
seconds of leeway is the usual allowance, but fix time sync first: widening the allowance to hide a
drifting clock is how a five-second problem becomes a five-minute one.</li>
<li><b>Caching the JWKS.</b> Fetch it per request and you have written a denial-of-service tool pointed at
your own issuer. Cache it forever and the next key rotation logs out everybody. Cache with a TTL, refetch
when a <code>kid</code> you do not recognize arrives, and rate-limit that refetch, or an attacker sends
junk kids and you do the fetching on their behalf.</li>
<li><b>Rotation as a flag day.</b> If your tokens carry no <code>kid</code>, no verifier can tell which
key signed what, so the only way to rotate is to swap everything at once and hope. A <code>kid</code> in
the header costs nothing and turns rotation into an ordinary Tuesday.</li>
<li><b>Tokens in URLs.</b> A token in a query string lands in browser history, in the
<code>Referer</code> header sent to the next site, in every proxy access log along the way, and in the
report your crash reporter uploads. Worse: a JWT payload is base64, not encryption, so personal data in a
token is personal data in every one of those places.</li>
<li><b>The <code>aud</code> you never checked.</b> If your service accepts any token from an issuer it
trusts, a token minted for a different service, quite possibly one with looser rules about who gets one,
works against yours. Checking the audience is the one line that stops a valid token being valid
everywhere.</li>
</ul>

<h4>The bottom line</h4>
<p>Sessions and tokens fail differently, and the previous lesson said so. What this one adds is that the
token failures arrive late, hit your most senior people first, and take forms that do not name themselves:
a cookie that vanishes, a 400 with no explanation, a fired employee whose access lingers for an hour, a
logout that logs nobody out. Choose tokens when the shape of the system needs them, and a session when it
does not.</p>`,
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
reading OAuth, OIDC and SAML side by side is not conceptual; it is that <i>the same box has four
names</i>. Learn the boxes once here and the protocol streams become translation exercises.</p>

<h4>The boxes</h4>
<ul>
<li><b>The subject</b>: the human (or workload) the whole exchange is about. In OAuth, when the
subject is also the one granting permission, the spec calls them the <b>resource owner</b>: the person
who <i>owns</i> the data an app wants and is therefore the only one who can authorize access to it.</li>
<li><b>The app the user is using</b>: wants to log the user in, or to call an API for them. OAuth and
OIDC call it the <b>client</b>; OIDC also calls it the <b>relying party (RP)</b> because it relies on
someone else's authentication; SAML calls it the <b>service provider (SP)</b>.</li>
<li><b>The authority</b>: holds the accounts, authenticates people, and issues signed statements.
SAML calls it the <b>identity provider (IdP)</b>; OAuth calls it the <b>authorization server (AS)</b>.
Real products are usually both at once: Okta, Entra ID, Keycloak, Auth0, Google.</li>
<li><b>The API being protected</b>: OAuth calls it the <b>resource server</b>. It holds the data,
accepts access tokens, and enforces scopes. SAML has no equivalent, because SAML is about logging into
applications, not about calling APIs.</li>
<li><b>The signed statement</b>: SAML says <b>assertion</b> (XML), OIDC says <b>ID token</b> (a JWT),
OAuth says <b>access token</b>. Same idea, different envelope and different job.</li>
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

<h4>Two distinctions worth burning in now</h4>
<p><b>The client is not the user.</b> A client is a <i>registered application</i> with its own identity,
its own id, and sometimes its own secret. When you see "authenticate the client," that means proving
which <i>app</i> is calling, which is a completely separate question from which <i>person</i> is using
it. Both happen in a single OAuth flow, and confusing them is the root of most flow confusion.</p>
<p><b>The authority is not the API.</b> The authorization server <i>issues</i> tokens; the resource
server <i>consumes</i> them. They are often run by different teams and sometimes different companies.
A resource server never authenticates a user; by the time a request arrives, that already happened
somewhere else, and all the API gets is a token to verify.</p>

<h4>How the boxes find each other</h4>
<p>An app cannot verify anything from an authority it has never heard of, so the two are wired together
in advance. Two halves:</p>
<ul>
<li><b>Client registration</b>: the app is registered <i>at</i> the authority, receiving a
<code>client_id</code>, possibly a secret, and a list of allowed redirect URIs. This is the authority
learning about the app.</li>
<li><b>Discovery / metadata</b>: the app learns about the authority. OIDC publishes a discovery
document at <code>/.well-known/openid-configuration</code> listing every endpoint plus a
<code>jwks_uri</code> holding the public signing keys; SAML publishes an equivalent metadata XML file
containing the IdP's certificate.</li>
</ul>
<p>Those public keys are the concrete thing that makes verification possible, which is exactly what
the trust lessons build on. Wherever a later lesson says "the RP verifies the token," it means: fetch
the keys from that published location, and check the signature against them.</p>`,
docs:[['RFC 6749 §1.1, OAuth 2.0 roles','https://www.rfc-editor.org/rfc/rfc6749#section-1.1'],['OpenID Connect Core, Terminology','https://openid.net/specs/openid-connect-core-1_0.html#Terminology'],['OIDC Discovery','https://openid.net/specs/openid-connect-discovery-1_0.html']],
ex:{title:'Translate the cast between protocols',
prompt:`Write <code>Actors</code> with <code>static String oauthName(String samlName)</code> translating SAML vocabulary to OAuth/OIDC: <code>"IdentityProvider"</code> becomes <code>"AuthorizationServer"</code>, <code>"ServiceProvider"</code> becomes <code>"Client"</code>, <code>"Assertion"</code> becomes <code>"IDToken"</code>, <code>"Principal"</code> becomes <code>"ResourceOwner"</code>, and anything else (including <code>null</code>) returns <code>"unmapped"</code>. Then <code>static boolean issuesTokens(String role)</code>, true only for <code>"AuthorizationServer"</code>: exactly one actor mints tokens, and everyone else only verifies or presents them.`,
starter:`public class Actors {
    static String oauthName(String samlName) {
        return null;
    }
    static boolean issuesTokens(String role) {
        return false;
    }
}`,
tests:[{d:'guards null before switching',re:'samlName\\s*==\\s*null|null\\s*==\\s*samlName'},{d:'switches on the SAML name',re:'switch\\s*\\(\\s*samlName'},{d:'IdP maps to the authorization server',re:'"AuthorizationServer"'},{d:'SP maps to the client',re:'"Client"'},{d:'assertion maps to the ID token',re:'"IDToken"'},{d:'principal maps to the resource owner',re:'"ResourceOwner"'},{d:'unknown vocabulary falls through',re:'"unmapped"'},{d:'only the authority mints tokens',re:'"AuthorizationServer"\\s*\\.\\s*equals|equals\\s*\\(\\s*"AuthorizationServer"'}],
behavior:`oauthName("IdentityProvider") returns "AuthorizationServer"; oauthName("ServiceProvider") returns "Client"; oauthName("Assertion") returns "IDToken"; oauthName("Principal") returns "ResourceOwner"; oauthName("Binding") and oauthName(null) return "unmapped". issuesTokens("AuthorizationServer") is true; issuesTokens("Client") and issuesTokens("ResourceServer") are false: a client presents tokens and a resource server verifies them, but neither can create one.`,
hints:['Guard null first; a switch on null throws.','One case per SAML term, each returning the OAuth equivalent, with <code>default: return "unmapped";</code>','<code>return "AuthorizationServer".equals(role);</code>'],
solution:`public class Actors {
    static String oauthName(String samlName) {
        if (samlName == null) return "unmapped";
        switch (samlName) {
            case "IdentityProvider": return "AuthorizationServer"; // the authority
            case "ServiceProvider":  return "Client";              // the app
            case "Assertion":        return "IDToken";             // the signed statement
            case "Principal":        return "ResourceOwner";       // the person
            default:                 return "unmapped";
        }
    }
    static boolean issuesTokens(String role) {
        // exactly one actor mints tokens; the rest present or verify them
        return "AuthorizationServer".equals(role);
    }
}`}},

{id:'idf3',title:'SSO vs federation vs delegation: experience, trust, permission',body:`
<p>These three words get used as if they were interchangeable, and they describe completely different
kinds of thing. Getting them apart is probably the clarification that pays off most in the whole domain,
because almost every muddled identity conversation is really a collision between them.</p>
<div class="codeSample" data-hl>SSO         is an EXPERIENCE, what the user feels: "I only logged in once"
Federation  is an ARCHITECTURE, who is trusted to authenticate, across a boundary
Delegation  is a PERMISSION, an app acting on your behalf, with limits you set</div>
<p>One is an outcome. One is a trust relationship. One is an authorization mechanism. They frequently
appear together, which is exactly why they get conflated, but each can exist without the others.</p>

<h4>SSO is a user experience, not a technology</h4>
<p><b>Single Sign-On</b> means: authenticate once, then reach many applications without being asked
again. Notice that this describes only what the <i>person perceives</i>. It names no protocol, no
message, no actor. You cannot "implement SSO" the way you implement OAuth; you produce SSO as a
<i>result</i>, and there is more than one way to produce it:</p>
<ul>
<li><b>Same-domain session sharing.</b> Several apps under <code>*.corp.example</code> share one session
cookie, or sit behind one gateway that holds the session. Log in at one, you are logged in at all.
This is genuine SSO, and it involves <b>no federation, no IdP and no tokens</b>, just a cookie with a
carefully scoped domain.</li>
<li><b>Federated SSO.</b> Apps in different domains or different organizations each redirect to a
shared authority. The authority already has a session with you, so it answers immediately without
prompting, and you experience SSO. This is the version that needs SAML or OIDC.</li>
<li><b>Desktop/integrated SSO.</b> Kerberos on a corporate network: your workstation login yields a
ticket that gets you into intranet apps silently.</li>
</ul>
<p><b>So SSO does not require federation.</b> That single fact dissolves a lot of confusion. When a
stakeholder says "we need SSO," the useful reply is: <i>across what boundary?</i> Within one domain it
may be a cookie configuration. Across organizations it is a federation project.</p>
<p>The mirror image is <b>Single Logout (SLO)</b>, and it is notoriously unreliable for exactly this
reason: the pleasant illusion of "one login" is really N separate application sessions created behind
your back. Ending one does not end the rest, and there is no reliable way to reach into every app and
close them.</p>

<h4>Federation is a trust architecture</h4>
<p><b>Federation</b> means an application stops authenticating users itself and instead accepts a signed
statement from an authority it has agreed in advance to trust, typically across an organizational
boundary. The app never sees a password. Trust is configured beforehand, by exchanging the authority's
public keys or certificate.</p>
<p><b>Federation does not require SSO either.</b> An organization with exactly one federated
application gets no "sign on once" benefit at all, yet federation is still worth it, because the real
wins are structural:</p>
<ul>
<li>MFA and login policy are enforced in <b>one</b> place instead of per app.</li>
<li>Disabling the account at the authority ends access <b>everywhere at once</b>: the deprovisioning
problem from the lifecycle lesson, solved.</li>
<li>No application ever stores a password, which removes a whole class of breach.</li>
<li>Audit of who logged in where lands in one log.</li>
</ul>
<p>SSO is the <i>pleasant side effect</i> that shows up once you federate more than one app. The
architecture is the point; the experience is the bonus.</p>

<h4>Delegation is about permission, not login</h4>
<p><b>Delegation</b> is a different axis entirely: you authorize an <i>application</i> to act on your
behalf against an API, with a limited slice of your access, without giving it your password. This is
what OAuth 2.0 was invented for. It answers <i>"may this app do this thing for me?"</i>, not
<i>"who are you?"</i></p>
<p>Hence the most consequential misconception in the field: <b>OAuth is not a login protocol.</b> An
access token says an app may call an API; it says nothing reliable about who the user is, and treating
it as proof of identity is a real vulnerability. <b>OpenID Connect</b> exists precisely to fix that,
adding an ID token (an authentication statement) on top of OAuth's delegation.</p>
<p>And delegation has a dangerous neighbor. In <b>delegation</b> the token records both identities:
"app X, acting for user Y." In <b>impersonation</b> the app simply becomes user Y and the API cannot
tell the difference. Impersonation carries more authority, is harder to audit, and should be a deliberate
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
SSO": SAML is a protocol that implements federation, which <i>delivers</i> SSO. "SSO means one
password": SSO means one <i>login event</i>; the credential could be a passkey and there may be no
password anywhere. "Federation gives users one identity": it gives them one <i>authority</i>; they
still have an account at each app, now populated from that authority.</p>`,
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
<p>In OAuth/OIDC the app requesting tokens is the <b>client</b>. The single most important property of a client is whether it can <b>keep a secret</b>:</p>
<ul>
<li><b>Confidential client</b> (a.k.a. <b>private client</b>), runs somewhere users can't extract its secrets: a <b>server-side backend</b>. It can authenticate to the authorization server with a <b>client secret</b> (or better, a key/certificate). Example: a Spring Boot backend, a daemon.</li>
<li><b>Public client</b>: runs where the code/secret is visible to the user: a <b>SPA</b> (JavaScript in the browser), a <b>mobile app</b>, a desktop app. It <b>cannot</b> hold a secret (anyone can read it), so it authenticates differently: it proves itself per-request with <b>PKCE</b> (next stream) instead of a static secret.</li>
</ul>
<p>Why it matters: the flows and protections differ. Confidential clients may use flows that rely on a secret (like <b>client credentials</b>, for machine-to-machine); public clients must use <b>Authorization Code + PKCE</b> and never embed a secret.</p>
<p><b>How confidential clients authenticate</b> (from weakest to strongest):</p>
<ul>
<li><code>client_secret_basic</code> / <code>client_secret_post</code>, a shared secret in the request (HTTP Basic or form field).</li>
<li><code>private_key_jwt</code>, the client signs a short JWT with its <b>private key</b>; the server verifies with the client's public key. No shared secret to leak.</li>
<li><code>tls_client_auth</code> (mTLS), the client presents a <b>client certificate</b> during the TLS handshake. Strongest; ties the token to the client (lesson 6 / the S2S stream).</li>
</ul>
<div class="codeSample" data-hl>// confidential client: HTTP Basic client authentication
Authorization: Basic base64(client_id ":" client_secret)
// public client: NO secret, proves itself with a PKCE code_verifier instead</div>

<h4>The question, in plain English</h4>
<p>Forget the vocabulary for a moment and ask one thing: <b>can this application keep a secret?</b></p>
<p>Your backend server can. It runs on a machine you control, nobody can read its memory or its
environment variables, and the only way to see its configuration is to break into it. That is a
<b>confidential client</b>.</p>
<p>A mobile app cannot. Anyone can download it from the store and decompile it. A single-page application
cannot: its JavaScript is served to the browser and readable with one keystroke. A CLI tool distributed
to users cannot. These are <b>public clients</b>, and the word "public" is literal: whatever secret you
ship inside them is public the day you ship it.</p>
<div class="codeSample" data-hl>// people ship a secret into a SPA and reason: "it is minified, and
// nobody will look". here is what looking costs:
//   DevTools -> Sources -> Ctrl-F "client_secret"
// that is the entire attack. it takes four seconds.

// and rotating it does not help: the new one ships the same way.</div>

<h4>What the distinction actually changes</h4>
<p>A confidential client can prove it is itself at the token endpoint, so the authorization server knows the
code is being redeemed by the app that started the flow. A public client cannot prove anything about
itself, so something else has to do that job, and that something is <b>PKCE</b>: a one-time secret
generated per flow, kept in memory, never shipped, and therefore never stealable from the artifact.</p>
<div class="codeSample" data-hl>CONFIDENTIAL          a backend web app, a service, a scheduled job
  gets a client_secret (or better: private_key_jwt / mTLS)
  may use the Client Credentials grant - it can act as ITSELF
  can hold a refresh token relatively safely

PUBLIC                a SPA, a mobile app, a desktop app, a CLI
  gets NO secret. PKCE is mandatory.
  may NOT use Client Credentials - there is no identity to prove
  a refresh token here needs rotation or sender-constraining</div>

<h4>The classification is about deployment, not technology</h4>
<p>This is the part people get wrong. "Is React a public client?" has no answer. A React application whose
tokens are handled by its own backend is that <i>backend</i> acting as a confidential client. The same
React application talking directly to an authorization server from the browser is a public client. Nothing
about the framework decides it; <b>where the credential lives</b> decides it.</p>
<p>Which is also the way out. If you want confidential-client properties for a browser application, put a
backend in front of it and let that backend hold the tokens; the browser then gets an ordinary session
cookie and never sees a token at all. That is the BFF pattern, covered in the OAuth stream.</p>

<h4>Registration, briefly</h4>
<p>Whichever kind it is, a client must be <b>registered</b> before it can ask for anything. Registration
produces a <code>client_id</code> (a public identifier, not a secret) and records the exact redirect URIs
the authorization server will send codes to. That allowlist is doing real security work: it is what stops an
attacker starting a flow with your <code>client_id</code> and having the code delivered to their own
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
<p><i>This lesson introduces the vocabulary. The next four take it apart properly: delegated
authentication versus delegated authorization, then acting for a user across services, and acting as a
user in support.</i></p>
<ul>
<li><b>Scope</b>: a named permission the app requests, e.g. <code>photos:read</code> or <code>calendar:write</code>. Scopes are a <b>space-separated</b> list. They bound what the resulting token can do (least privilege).</li>
<li><b>Consent</b>: the authorization server shows you what the app is asking for ("Acme wants to read your photos") and you approve. Consent is why delegation is safe: <i>you</i> decide.</li>
<li><b>Least privilege</b>: request only the scopes you need. A photo-printing app should ask for <code>photos:read</code>, not <code>photos:write</code> or your contacts.</li>
</ul>
<p><b>Delegation vs impersonation</b>: a subtle but important distinction:</p>
<ul>
<li><b>Delegation</b>: the token says "app X, acting for user Y, may do Z." Both identities are present: the API knows a client is acting for a user.</li>
<li><b>Impersonation</b>: the app simply <i>becomes</i> user Y: the API can't tell it isn't Y. More authority, more risk, and audited differently. (Token exchange, in the S2S stream, formalizes both.)</li>
</ul>
<p>A resource server enforces scopes on every call: it reads the token's <code>scope</code> claim and checks the required scope is present before doing the work.</p>
<div class="codeSample" data-hl>// token carries the granted scopes as a space-separated string
"scope": "photos:read profile"
// the API checks the needed scope is present before acting
if (!granted.contains("photos:read")) throw new ForbiddenException();</div>

<h4>The valet key</h4>
<p>Some cars come with a second key that starts the engine and opens the doors, but will not open the boot
and limits the top speed. You hand it to a valet. You have given them <i>enough</i> to park the car and
nothing more, you did not give them your own key, and you can ask for it back.</p>
<p>That is delegation, and OAuth is a protocol for issuing valet keys. Three ideas do the work:</p>
<div class="codeSample" data-hl>DELEGATION   you let an app act for you WITHOUT giving it your password.
             the app never learns your credential; it gets its own key.

CONSENT      you were asked, in terms you could understand, and agreed.
             a grant made without informed consent is not delegation,
             it is just access.

SCOPE        the BOUNDS of the key. what it may do, and no more.
             "read your calendar" is not "manage your account".</div>

<h4>Why "never give an app your password" is the whole point</h4>
<p>Before OAuth, a service that wanted to import your contacts asked for your email password. People typed
it in. That gave the service <i>everything</i> (read your mail, change your password, lock you out) with
no way to grant less, no way to see what it had done, and no way to revoke it except by changing the
password and breaking every other integration at the same time.</p>
<p>Delegation fixes all four: the app gets a bounded credential, you can see what it asked for, you can
revoke that one app, and your actual password never leaves you.</p>

<h4>A scope is a limit, not a permission</h4>
<p>This is the sentence to remember. A scope says what the app is <i>allowed to ask for</i>. It does not say
what <b>you</b> are allowed to do.</p>
<div class="codeSample" data-hl>token has scope "invoices:write"   AND   the user is a read-only clerk
   -> the answer is NO.

// the scope narrows the app's grant. the user's own permissions still
// apply underneath it. the effective answer is the INTERSECTION.
// a resource server that checks only the scope has just let an app
// escalate its user's privileges, which is a real and common bug.</div>
<p>Say it as: the scope bounds the delegation; your entitlements bound you; the request must satisfy
both.</p>

<h4>Consent that is worth something</h4>
<p>A consent screen listing "openid profile email offline_access https://api.example.com/.default" has not
informed anybody. Real consent means the screen names <b>what the app will do</b> in the user's language,
names <b>who is asking</b>, is <b>granular</b> enough to decline part of it, and is <b>revocable</b> from
somewhere the user can find.</p>
<p>The attack this defends against is <b>consent phishing</b>: an attacker registers a plausible-looking
application, sends a legitimate authorization link, and the victim grants it real access: no password
stolen, no malware, nothing for a scanner to detect. It is why every serious platform now restricts which
applications may request sensitive scopes, and why administrators should be able to see which third-party
apps their users have granted.</p>

<h4>Ask for less</h4>
<p>Request the narrowest scope that does the job, and ask for more only when the user is doing the thing
that needs it. It reduces the damage when your app is compromised, it raises consent rates because the
screen is less alarming, and it is the one habit that makes the rest of this stream easier to reason
about.</p>`,
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
<p>An application has to answer "is this really Ada?", but it does not have to answer it <i>itself</i>.
Handing that question to someone else is <b>delegated authentication</b>, and there are two very
different ways to do it. The difference is not academic: it decides whether your application ever
touches a user's password.</p>

<h4>The question being delegated</h4>
<p>Note carefully what is delegated here: the <b>act of verifying a credential</b>. That is a different
thing from the delegated <i>authorization</i> of the next lesson, where what gets delegated is
<i>permission to act on someone's behalf</i>. Same word, different objects:</p>
<div class="codeSample" data-hl>Delegated AUTHENTICATION  "Someone else, please tell me WHO this is."
Delegated AUTHORIZATION   "User, please let this app DO something for you."</div>

<h4>Style 1: credential forwarding (the classic meaning)</h4>
<p>Your app shows its own login form, collects the username and password, and then asks a backend
system to check them. The app is a middleman holding plaintext credentials:</p>
<ul>
<li><b>LDAP bind.</b> The app attempts to bind to the directory <i>as the user</i> with the password it
just collected. Bind succeeds, the password was right. Ubiquitous in enterprise Java.</li>
<li><b>RADIUS.</b> The same pattern for network gear and VPNs.</li>
<li><b>A password-verification API.</b> Some internal service exposing "here is a username and
password, is it valid?"</li>
<li><b>OAuth's ROPC grant.</b> The deprecated password grant: the app collects the password and posts
it to the token endpoint. Deprecated <i>precisely</i> because of everything below.</li>
</ul>
<p><b>What this buys you:</b> one place to store passwords and enforce password policy, and a login
screen you fully control.</p>
<p><b>What it costs you.</b> The application sits inside the credential blast radius. It can log the
password by accident. Its memory contains it. A compromise of the app is a compromise of every
password typed into it. It cannot support MFA or passkeys without reinventing them, because the
authority never talks to the user, only to your app. And it cannot support SSO at all: nothing exists
for a second app to reuse.</p>

<h4>Style 2: redirect the user (federated authentication)</h4>
<p>The app sends the user's browser to the authority, the user authenticates <i>there</i>, and the app
receives a signed statement saying it happened. The app never sees a credential, and is never asked to
be trustworthy with one.</p>
<div class="codeSample" data-hl>CREDENTIAL FORWARDING            REDIRECT (federated)
user -> [ APP ] -> directory     user -> [ APP ] --redirect--> [ IdP ]
        ^^^^^                                                     |
   app holds the password        user types password AT the IdP --+
                                 app gets back a signed assertion

app sees:  username + password   app sees:  a signed token. never a credential
MFA:       app must build it     MFA:       IdP handles it, app unchanged
passkeys:  effectively no        passkeys:  work immediately
SSO:       impossible            SSO:       falls out for free
breach:    passwords exposed     breach:    no passwords to expose</div>
<p>This is why "we delegate authentication to Okta" almost always means <i>federation</i>, not
credential forwarding. Both are delegated authentication in the literal sense; only one keeps your app
out of the blast radius.</p>

<h4>How to tell them apart in a design review</h4>
<p>One question settles it: <b>where does the user type their password?</b> If the answer is "a form
our application renders," you are forwarding credentials, whatever the diagram calls it. If the answer
is "on the identity provider's own page," you are federating.</p>
<p>This is also the test for a phishing-style integration. An app that renders a page <i>looking</i>
like the IdP's login and forwards what it captures is doing credential forwarding with extra steps.
That is precisely why users are taught to check the address bar before typing a password, and why
mobile apps must use a system browser rather than an embedded webview.</p>

<h4>When forwarding is still the right answer</h4>
<p>It is not always wrong, and pretending otherwise is unhelpful. Legacy protocols that cannot redirect
(IMAP, SMTP, LDAP clients, database logins) have no browser to send anywhere. The standard mitigations
are worth knowing: issue <b>app-specific passwords</b> so the real credential is never used, or move
the protocol onto <b>OAuth with SASL</b>, which is how modern mail clients escaped the problem.</p>
<p><b>The default:</b> redirect. Reach for credential forwarding only when there is genuinely no
browser in the flow, and then treat the credential path as high-risk code.</p>`,
docs:[['RFC 6749 §4.3: Resource Owner Password Credentials (and its warnings)','https://www.rfc-editor.org/rfc/rfc6749#section-4.3'],['OAuth 2.0 Security BCP (why ROPC is deprecated)','https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics#name-resource-owner-password-cre'],['RFC 8252: OAuth for Native Apps (use a system browser, not a webview)','https://www.rfc-editor.org/rfc/rfc8252'],['RFC 4513 (LDAP Authentication Methods (bind))','https://www.rfc-editor.org/rfc/rfc4513']],
ex:{title:'Which style is this integration?',
prompt:`Write <code>AuthDelegation</code> with <code>static String style(String method)</code> returning <code>"forwarding"</code> for <code>"ldap-bind"</code>, <code>"radius"</code> and <code>"ropc"</code>; <code>"redirect"</code> for <code>"saml"</code> and <code>"oidc"</code>; and <code>"unknown"</code> otherwise, including <code>null</code>. Then <code>static boolean appSeesPassword(String method)</code>, true only for the forwarding style, the single question that decides whether your application is inside the credential blast radius.`,
starter:`public class AuthDelegation {
    static String style(String method) {
        return null;
    }
    static boolean appSeesPassword(String method) {
        return false;
    }
}`,
tests:[{d:'guards null before switching',re:'method\\s*==\\s*null|null\\s*==\\s*method'},{d:'switches on the method',re:'switch\\s*\\(\\s*method'},{d:'classifies credential forwarding',re:'"forwarding"'},{d:'classifies the redirect style',re:'"redirect"'},{d:'unrecognised methods fall through',re:'"unknown"'},{d:'password exposure follows from the style',re:'"forwarding"\\s*\\.\\s*equals|equals\\s*\\(\\s*"forwarding"'}],
behavior:`style("ldap-bind"), style("radius") and style("ropc") return "forwarding". style("saml") and style("oidc") return "redirect". style("kerberos") and style(null) return "unknown". appSeesPassword("ldap-bind") is true and appSeesPassword("oidc") is false: under a redirect the user types the password on the IdP page, so the application never holds it, which is why MFA and passkeys work without the app changing at all.`,
hints:['Guard null first, then <code>switch (method)</code> with case fall-through for the three forwarding methods.','Two cases return "redirect"; everything else hits <code>default: return "unknown";</code>','<code>return "forwarding".equals(style(method));</code>'],
solution:`public class AuthDelegation {
    static String style(String method) {
        if (method == null) return "unknown";
        switch (method) {
            case "ldap-bind":
            case "radius":
            case "ropc":
                return "forwarding";  // the app collects and relays the password
            case "saml":
            case "oidc":
                return "redirect";    // the user authenticates at the IdP itself
            default:
                return "unknown";
        }
    }
    static boolean appSeesPassword(String method) {
        // only credential forwarding puts the app inside the blast radius
        return "forwarding".equals(style(method));
    }
}`}},

{id:'idfdauthz',title:'Delegated authorization: permission without the password',body:`
<p>The other delegation. Here the user is not asking someone to vouch for them; they are granting an
<i>application</i> a bounded slice of their own access, so it can act for them against an API. This is
the problem OAuth 2.0 was invented to solve, and it is worth seeing the problem before the solution.</p>

<h4>The problem it replaced</h4>
<p>A photo-printing site wants the photos in your cloud album. Before OAuth, the only way was to type
your cloud password into the printing site. That is catastrophic in four separate ways, and naming
them explains every design decision that follows:</p>
<ul>
<li>The site gets <b>everything</b>, not just photos: mail, contacts, the ability to change your
password.</li>
<li>It lasts <b>forever</b>; there is no expiry on a password.</li>
<li>You cannot <b>revoke</b> it without changing your password, which breaks every other app you did
the same thing to.</li>
<li>There is no <b>audit trail</b>: the cloud provider sees your login, not the printing site's.</li>
</ul>
<p>Delegated authorization fixes all four. The user authenticates at the authority, approves a specific
request, and the application receives a token instead of a credential.</p>
<div class="codeSample" data-hl>THE ANTI-PATTERN               DELEGATED AUTHORIZATION
give app your password         app gets a token, never the password
  full account access            only the approved scopes    -> photos:read
  forever                        expires in minutes           -> exp
  revoke = change password       revoke this app alone        -> /revoke
  no record of who did what      calls attributed to the app  -> client_id</div>

<h4>The three moving parts</h4>
<ul>
<li><b>Scope</b>: the named bound on what the resulting token may do:
<code>photos:read</code>, <code>calendar:write</code>. The app <i>requests</i> scopes; the authority
decides what to <i>grant</i>, and the two can differ. Least privilege lives here: a printing service
asks for <code>photos:read</code>, never <code>photos:write</code>.</li>
<li><b>Consent</b>: the authority shows the user what is being requested and the user approves. This
is the step that makes the whole thing legitimate: the user, not the app, decides. It is also why
consent screens must name the app and list the scopes in language a human can evaluate.</li>
<li><b>The grant</b>: the recorded fact that user Y approved app X for scopes Z. It persists after the
token expires, which is what lets a refresh token get a new access token silently, and what the user is
deleting when they hit "remove access."</li>
</ul>
<p>The distinction between the <b>grant</b> and the <b>token</b> catches people out. Revoking a token
kills one credential; revoking the <i>grant</i> withdraws the permission entirely, so refreshes stop
working too. "Remove this app's access" means the second one.</p>

<h4>The enforcement side</h4>
<p>Scopes are worthless unless the API checks them. A resource server reads the token's
<code>scope</code> claim and confirms the required scope is present before doing any work, and it
must <b>fail closed</b>: an absent or unreadable scope claim means denied, never allowed.</p>
<div class="codeSample" data-hl>// the token carries granted scopes as a space-separated string
"scope": "photos:read profile"

// the API checks before acting, and denies when unsure
if (!granted.contains("photos:read")) throw new ForbiddenException();</div>
<p>A subtlety worth internalizing: <b>a scope is not a permission.</b> A scope bounds what the
<i>application</i> may attempt on the user's behalf; the user's own rights still apply underneath.
A token with <code>photos:read</code> does not grant access to someone else's photos. Both checks
must pass: what the app was allowed to ask for, and what the user is actually allowed to see. Treating
a scope as the whole authorization decision is a real and common vulnerability.</p>

<h4>The line back to the previous lesson</h4>
<p>Delegated authentication answers <i>who is this?</i> Delegated authorization answers <i>may this app
do this for them?</i> They are so routinely bundled (one redirect, one consent screen, tokens for
both) that people assume one implies the other. It does not, and the failure mode is specific:</p>
<p><b>An access token is not proof of identity.</b> It says an app was authorized to call an API. It
carries no reliable statement about who the user is, was minted for a different audience, and may be a
token the app obtained for an entirely different user. Applications that "log the user in" by accepting
an access token are exploitable. <b>OpenID Connect</b> exists to close exactly this gap by adding an
ID token (an authentication statement) alongside OAuth's authorization.</p>`,
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
do this. How does her identity survive the chain of hops, and who is accountable for what happens at the
end? That is the <b>on-behalf-of</b> problem.</p>

<h4>Four ways to answer it, from worst to best</h4>
<ol>
<li><b>Trust the network.</b> The downstream service assumes anything reaching it is legitimate,
because it is "inside." One foothold anywhere and an attacker can call anything. This is the model zero
trust exists to kill.</li>
<li><b>Forward the original token unchanged.</b> Tempting and wrong. The token's <code>aud</code> names
the first service; every later service must ignore the audience check to accept it, and now a token
minted for one service works everywhere. You have built a universal key.</li>
<li><b>Drop the user entirely and call as the service.</b> The downstream sees "orders-service," which
is accurate about the caller but loses the user completely. The ledger cannot enforce Ada's own limits,
and the audit log says a service did it: true, useless.</li>
<li><b>Exchange the token, preserving both identities.</b> The service asks the authority for a
<i>new</i> token, correctly audienced for the next hop, that still names Ada as the subject and records
who is acting. Both facts survive.</li>
</ol>
<div class="codeSample" data-hl>Ada --> [ Gateway ] --> [ Orders ] --> [ Billing ] --> [ Ledger ]
           aud=gateway    aud=orders    aud=billing    aud=ledger
           sub=ada        sub=ada       sub=ada        sub=ada
                          act=gateway   act=orders     act=billing

// each hop gets a token FOR IT, still about Ada, naming who is acting</div>

<h4>Delegation vs impersonation, precisely</h4>
<p>Two shapes, and the difference is whether the acting party is visible downstream:</p>
<ul>
<li><b>Delegation</b>: the token says "Ada, being acted for by orders-service." Both identities
present. The API can apply Ada's rights <i>and</i> know a service did it. Attribution survives.</li>
<li><b>Impersonation</b>: the token simply says "Ada." The downstream cannot tell a service is
involved. More authority, and the audit trail now claims Ada did something she never touched.</li>
</ul>
<p>OAuth Token Exchange encodes delegation with an <b>act</b> claim, which nests to record the whole
chain, and gates who is permitted to do this with <b>may_act</b> on the original token:</p>
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
<p><b>Default to delegation.</b> Reserve impersonation for cases where the downstream genuinely must
not distinguish (some legacy systems cannot parse an actor) and log who impersonated whom, since the
token no longer records it.</p>

<p>The human version of impersonation (a support agent choosing "view as this customer") has enough
operational and legal weight to need its own treatment, and gets it in the next lesson.</p>

<h4>Why you cannot just pass a user id</h4>
<p>The obvious shortcut is a header: <code>X-User-Id: ada</code>. It fails for one decisive reason:
<b>it is unauthenticated</b>. Any service that can reach the endpoint can claim to be acting for
anyone, so the security of every downstream now rests on perfect network isolation. A token is the
alternative because it is <i>signed</i>: the downstream verifies the claim rather than trusting the
caller. If you find yourself adding a shared secret header to make the id trustworthy, you are building
a worse token.</p>
<p>The mechanics (the token-exchange grant, request parameters and response) are covered in the
service-to-service stream. What matters here is the shape of the problem: <b>every hop needs its own
audience, the subject must survive, and the acting party must be recorded.</b></p>`,
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
support engineer needs to see what <i>they</i> see. So you build "view as this user", and quietly
create the most dangerous feature in the system, because it lets one human wear another human's
identity.</p>
<p>It is worth being blunt about the stakes: this feature is a self-service privilege escalation
mechanism unless it is deliberately constrained. It reads customer data by design, so it is regulated
data access, and regulators treat it that way.</p>

<h4>The two subjects</h4>
<p>Everything good here follows from one modeling decision: <b>keep two identities, always</b>.</p>
<ul>
<li><b>Authenticated subject</b>: who actually logged in and holds the session. The support engineer.
Never changes during the session.</li>
<li><b>Effective subject</b>: whose data is being viewed and whose permissions apply. The customer.</li>
</ul>
<p>The naive implementation collapses these into one: mint the <i>customer</i> a session and hand it to
the engineer. It is a few lines of code and it destroys everything downstream. The audit log now says
the customer deleted their own account. Rate limits, notifications and security alerts all fire as the
customer. If the engineer's session is stolen, the thief is the customer. And you have no way to answer
the only question that matters after an incident: <i>which employee did this?</i></p>
<div class="codeSample" data-hl>WRONG, one subject                RIGHT, two subjects
session { user: "cust-91" }        session { auth: "eng-14",
                                             effective: "cust-91",
                                             reason: "TKT-8823",
                                             expires: 14:32,
                                             readOnly: true }

audit: "cust-91 deleted account"   audit: "eng-14 acting as cust-91: viewed order"</div>

<h4>Permissions: intersect, never inherit</h4>
<p>The rule that prevents the worst outcome: <b>the acting session gets the intersection of what the
engineer is allowed to do and what the customer can do, and usually less.</b> Not the union, and not
the customer's rights alone.</p>
<p>Why it matters: if acting-as simply adopted the target's permissions, then acting as an
<i>administrator</i> would hand the engineer administrator rights. Support staff would be one click
from full control, and an attacker who phished a support account would be too. So privileged targets
must be excluded outright, and destructive operations denied regardless of what either party could
normally do.</p>
<ul>
<li><b>Read-only by default.</b> The overwhelming majority of support sessions only need to look.
Writing should be a separate, rarer, more-approved capability.</li>
<li><b>Deny the dangerous set always</b>: changing passwords or email, adding MFA factors, deleting the
account, exporting all data, viewing full payment details. Each is an account-takeover primitive.</li>
<li><b>Never act as a privileged account.</b> Admins, other support staff, service accounts: excluded,
or the feature becomes a ladder.</li>
</ul>

<h4>The controls that make it defensible</h4>
<ol>
<li><b>Authorized explicitly.</b> A specific role, and a recorded reason, usually a ticket id. "Because
I could" is not an authorization.</li>
<li><b>Time-boxed.</b> Thirty minutes, not a session that lives until logout. Sessions that never end
are how this becomes routine surveillance.</li>
<li><b>Visible.</b> A persistent banner in the UI. Engineers forget which window they are in, and act
on production data believing it is their own account.</li>
<li><b>Attributed.</b> Every log line, every write, every downstream call carries both identities. This
is the <code>act</code> claim from the previous lesson doing real work.</li>
<li><b>Notified.</b> In consumer and regulated products, tell the user their account was accessed, who
did it and why. Under GDPR this is personal-data access; under HIPAA it is disclosure.</li>
<li><b>Reviewed.</b> Someone reads the acting-as log. A control nobody inspects is decoration;
this is the log that catches an employee browsing a celebrity's account.</li>
</ol>

<h4>Prefer the weaker tool</h4>
<p>Most "I need to act as them" requests are really "I need to see what they see," and there is a ladder
of options with steadily lower blast radius. Take the lowest rung that solves the problem:</p>
<div class="codeSample" data-hl>LOWEST RISK   diagnostics view, their config and flags, none of their content
              redacted view, their screens, sensitive fields masked
              read-only act-as, full view, no writes, banner, time-boxed
HIGHEST RISK  write act-as, separate approval, narrow allowlist, notify</div>
<p>And one alternative that beats all of them when it fits: <b>ask the user to share their session</b>:
a screen share, or a support link they generate themselves. Consent given directly by the person,
in the moment, is stronger than any control you can build on your side.</p>`,
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
<p>Almost every identity conversation inside an organization is really two conversations, and treating them
as one produces decisions that are wrong for both populations. This lesson separates them <b>before</b> the
protocol streams, because the protocols are identical and the answers are not.</p>

<h4>The same word, two different jobs</h4>
<p><b>Workforce IAM</b> governs the people your organization employs: staff, contractors, and the systems
they use. <b>CIAM</b> (Customer Identity and Access Management) governs the people your organization
<i>sells to</i>. Both authenticate humans. Both use OAuth, OIDC and SAML. Everything else differs, because
the forces acting on them are inverted.</p>
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
<p>Workforce identity has something CIAM will never have: <b>a system of record that decides who exists</b>.
HR says a person was hired, holds this job, reports to that manager, and left on this date. Every
downstream behavior derives from it: birthright access on joining, recalculation on transfer,
deprovisioning within minutes of termination.</p>
<p>That single fact is what makes governance possible. Access reviews, joiner-mover-leaver, entitlement
certification and separation of duties all assume you can enumerate your people and ask an authority
whether each one still belongs. <b>None of that machinery transfers to CIAM</b>, because there is no HR
system for your customers and nobody to certify that a shopper still needs their account.</p>

<h4>What follows from having no coercive power</h4>
<p>You can require an employee to enroll a security key. You cannot require a customer to do anything;
they will simply leave. So the CIAM toolkit is different in kind:</p>
<ul>
<li><b>Registration is a funnel.</b> Every additional field measurably reduces completion. This is the one
place where a security control has an attributable revenue cost, which is why CIAM decisions get argued
about with marketing in the room and workforce decisions do not.</li>
<li><b>Progressive profiling</b> replaces the long form: collect the minimum at signup and ask for more
when the customer understands why.</li>
<li><b>MFA is offered and risk-triggered</b>, not mandated: step up on a new device, a payment change, an
unusual location.</li>
<li><b>Account recovery is the real attack surface.</b> Workforce recovery routes through a helpdesk that
can verify a human; consumers have only email and SMS, so the recovery path is usually weaker than the
login path, and attackers go there first.</li>
<li><b>Consent and data rights are legal obligations.</b> Deletion must actually delete, across every
downstream system, on request.</li>
<li><b>Scale is a design constraint</b>, not a capacity plan. Identity is the front door: if it is down,
everything is down.</li>
</ul>

<h4>How an organization should actually run them</h4>
<p><b>Separate the tenants, always.</b> Customers and employees must not share a user store, even when the
same product could serve both. One breach then reaches one population, an employee cannot accidentally be
granted a customer entitlement, and the two can be governed under the regimes that actually apply to
them.</p>
<p><b>Separate the ownership, and say so.</b> Workforce identity belongs with IT and security, measured on
control: time to deprovision, review completion, standing privilege. CIAM belongs with product, measured
on experience: signup completion, login success rate, recovery success, support contacts per thousand
users. Trying to run both against one set of metrics produces a CIAM that is hostile to use, or a
workforce estate that no auditor will accept.</p>
<p><b>Share what genuinely is shared.</b> The protocols, the token-validation library, the incident
response process, the logging pipeline, and the expertise. Duplicating those is how the customer-facing
system quietly ends up with weaker practices than the internal one.</p>
<p><b>Name the third population.</b> <b>B2B</b> (business customers whose own administrators manage their
own users, bring their own IdP, and see only their own tenant) is neither. It needs delegated
administration, per-tenant federation and tenant isolation, and forcing it into either model is a common
and expensive error. The multi-tenancy lesson takes it properly.</p>

<h4>The question to ask first</h4>
<p>Before any identity decision, ask <b>which population</b> it is for. "Should we require MFA?" has no
answer until you know. For workforce the answer is yes, phishing-resistant, mandated. For consumers it is
"offer it, incentivize it, trigger it on risk, and never let it block a purchase". Same question, same
protocols, opposite conclusions.</p>`,
docs:[['Gartner (CIAM)','https://www.gartner.com/en/information-technology/glossary/customer-identity-and-access-management-ciam'],['NIST SP 800-63 (digital identity guidelines)','https://pages.nist.gov/800-63-3/'],['GDPR (Art. 17 right to erasure)','https://gdpr-info.eu/art-17-gdpr/']],
ex:{title:'Which discipline governs this decision?',lang:'js',
run:{call:'population',cases:[
 {name:'deprovisioning within minutes of termination',args:['deprovision-on-termination'],expect:'workforce'},
 {name:'quarterly access certification',args:['access-review'],expect:'workforce'},
 {name:'mandating phishing-resistant MFA',args:['mandate-mfa'],expect:'workforce'},
 {name:'reducing signup form fields',args:['signup-funnel'],expect:'ciam'},
 {name:'honoring a deletion request',args:['right-to-erasure'],expect:'ciam'},
 {name:'self-service account recovery by email',args:['self-service-recovery'],expect:'ciam'},
 {name:'a customer admin managing their own users',args:['delegated-admin'],expect:'b2b'},
 {name:'a customer bringing their own IdP',args:['bring-your-own-idp'],expect:'b2b'},
 {name:'validating a token audience',args:['validate-audience'],expect:'shared'},
 {name:'the incident response process',args:['incident-response'],expect:'shared'},
 {name:'anything unrecognised',args:['zzz'],expect:'ask which population first'}]},
prompt:`Write <code>function population(decision)</code> returning which discipline owns it. <b>workforce:</b> <code>"deprovision-on-termination"</code>, <code>"access-review"</code>, <code>"mandate-mfa"</code>. <b>ciam:</b> <code>"signup-funnel"</code>, <code>"right-to-erasure"</code>, <code>"self-service-recovery"</code>. <b>b2b:</b> <code>"delegated-admin"</code>, <code>"bring-your-own-idp"</code>. <b>shared:</b> <code>"validate-audience"</code>, <code>"incident-response"</code>. Anything else returns <code>"ask which population first"</code>.`,
starter:`function population(decision) {
  return null;
}`,
solution:`function population(decision) {
  switch (decision) {
    case "deprovision-on-termination":
    case "access-review":
    case "mandate-mfa":
      return "workforce";      // needs an authoritative source and coercive power
    case "signup-funnel":
    case "right-to-erasure":
    case "self-service-recovery":
      return "ciam";           // self-asserted identity, revenue-sensitive friction
    case "delegated-admin":
    case "bring-your-own-idp":
      return "b2b";            // the third population, neither of the above
    case "validate-audience":
    case "incident-response":
      return "shared";         // protocols and process are common to all
    default:
      return "ask which population first";
  }
}`,
tests:[{d:'deprovisioning is a workforce control',re:'"deprovision-on-termination"'},{d:'the signup funnel is a CIAM concern',re:'"signup-funnel"'},{d:'delegated administration is B2B',re:'"delegated-admin"'},{d:'protocol mechanics are shared',re:'(?:case\\s*["\']validate-audience["\'][^;}]*?return\\s+["\']shared["\'])|(?:case\\s*["\']incident-response["\'][^;}]*?return\\s+["\']shared["\'])'},{d:'the default pushes the question back',re:'ask which population first'}],
behavior:`Eleven cases execute. Two groups carry the lesson. The <b>b2b</b> answers exist because forcing a business customer into either model is a common and expensive error: delegated administration is not a workforce feature and not a consumer one. And the <b>default</b> is deliberate advice rather than a fallback: an identity decision made without naming the population is how an organization ends up mandating security keys for shoppers, or letting employees self-register.`,
hints:['Group the cases by population and let them fall through to a shared return.','B2B is a third population, not a variant of the other two.','The default should push the question back rather than guess.']}},

{id:'idfzt',title:'Zero trust: identity as the perimeter',body:`
<p>Everything so far (tokens with audiences, verifying every signature, delegation that names the
acting party) points at one architectural idea. Zero trust is the name for it, and it is best
understood as a reaction to the model it replaced.</p>

<h4>The model that failed</h4>
<p>The old design was a <b>perimeter</b>: a hard boundary with a firewall and a VPN, and inside it, a
soft interior where services trusted each other because they were "on the network." Authentication
happened once, at the edge. Being inside <i>was</i> the authorization.</p>
<p>It failed for reasons that all arrived at once:</p>
<ul>
<li><b>There is no inside any more.</b> Work moved to laptops in homes and cafés, and workloads moved
to cloud accounts you do not own.</li>
<li><b>SaaS lives outside it.</b> Your most sensitive data sits in applications the firewall never
sees.</li>
<li><b>Lateral movement.</b> One phished laptop lands the attacker <i>inside</i>, where nothing checks
anything. The perimeter is excellent at stopping outsiders and useless the moment it is crossed.</li>
<li><b>Supply chain.</b> A compromised dependency runs inside your network by definition.</li>
</ul>
<p>The recurring pattern in breach reports is not a defeated firewall. It is a modest initial foothold
followed by months of unchallenged movement, because nothing behind the wall asked a second question.</p>

<h4>The principle</h4>
<div class="codeSample" data-hl>PERIMETER MODEL                    ZERO TRUST
"where are you connecting from?"   "who are you, and may you do THIS, right now?"
trust = network location           trust = verified identity + policy, per request
authenticate once at the edge      authenticate and authorize every request
flat interior, free movement       every hop is a checkpoint
breach = total access              breach = one narrow, short-lived credential</div>
<p><b>Never trust, always verify</b>, and note the word <i>always</i>. Not once at login; not once per
session. Every request re-establishes who is asking and whether they may. That sounds expensive, and it
is exactly what a signed, audience-scoped, short-lived token makes cheap: verification is a local
signature check, not a database lookup.</p>

<h4>What it means concretely</h4>
<ol>
<li><b>Every request carries a verifiable identity.</b> A user token, or a workload certificate for a
service. Never an unauthenticated header, and never an IP address: an IP is a routing detail that can
be spoofed, reassigned, or shared by thousands of people.</li>
<li><b>Authorize per request, not per session.</b> The decision is made at a policy point each time, so
revoked access takes effect in seconds rather than whenever the session expires.</li>
<li><b>Least privilege, expressed narrowly.</b> Tokens audienced for one service, scoped to one job,
valid for minutes. This is why audience checks matter so much: a token that works everywhere has
recreated the flat interior inside your token format.</li>
<li><b>Assume breach.</b> Design so that a stolen credential yields the smallest, shortest-lived
capability you can arrange, and so the damage is visible in a log.</li>
<li><b>Use context as a signal.</b> Device posture, location, time, behavioral anomalies feed the
decision, and can trigger step-up authentication. Context is <i>evidence</i>, never identity: "on the
corporate network" is one input to a decision, not a reason to skip it.</li>
</ol>

<h4>The decision point</h4>
<p>Zero trust needs somewhere the answer is computed. Two roles recur under many product names:</p>
<div class="codeSample" data-hl>request ──▶ [ PEP ]  policy ENFORCEMENT point, sidecar, gateway, middleware
               │     intercepts, then obeys the verdict
               ▼
            [ PDP ]  policy DECISION point, evaluates identity + resource
               │              + action + context against policy
               ▼
            permit / deny  ── and it must DENY when it cannot decide</div>
<p><b>Fail closed.</b> A policy engine that is unreachable, a signature that cannot be verified, a claim
that will not parse: all deny. A system that fails open under load is a system an attacker will
deliberately overload.</p>

<h4>What zero trust is not</h4>
<ul>
<li><b>Not a product.</b> Nothing you buy makes you zero trust; vendors selling "a zero trust solution"
are selling one component of an architecture.</li>
<li><b>Not "MFA everywhere."</b> Strong authentication is necessary and nowhere near sufficient; MFA at
the edge with a flat interior behind it is still the perimeter model.</li>
<li><b>Not "no trust."</b> The name is unhelpful. Trust is granted constantly; it is just explicit,
narrow, evidenced and short-lived, rather than implied by a network cable.</li>
<li><b>Not all-or-nothing.</b> Real adoption is incremental: identity-aware access to one application,
mTLS between two services, removing one flat network segment.</li>
</ul>
<p>The service-to-service stream covers the machinery: mTLS, SPIFFE workload identity, mesh policy.
The idea to carry there is this one: <b>identity replaced the network as the thing access decisions are
made on.</b></p>`,
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
survive because they are the least effort that works: one string, one header, done. It is worth being
precise about what you give up for that convenience, because most of the damage is avoidable.</p>

<h4>What an API key actually is</h4>
<p>An API key is a <b>long-lived, opaque bearer token identifying an application rather than a
person</b>. Every word there is doing work:</p>
<ul>
<li><b>Long-lived</b>: typically no expiry at all. Unlike an access token measured in minutes, a key
issued in 2019 is probably still valid.</li>
<li><b>Opaque</b>: a random string that must be looked up. No claims, no signature, nothing to verify
offline.</li>
<li><b>Bearer</b>: whoever holds it can use it. There is no proof of possession, no audience, no
binding to a caller.</li>
<li><b>Identifies an application</b>: there is no user in the picture, so "who did this?" can only
ever be answered as "whichever integration holds this key."</li>
</ul>
<p>Compare it against an OAuth access token and the trade is clear: keys win on simplicity and
lose on everything else.</p>
<div class="codeSample" data-hl>                 API KEY                    OAUTH ACCESS TOKEN
lifetime         forever (usually)          minutes
scope            often all-or-nothing       explicit scopes
subject          an application             a user, or a service
audience         none, works anywhere      one API (aud)
revocation       delete the row (instant)   hard: valid until exp
verification     lookup on every call       offline signature check
setup cost       ten minutes                a real integration</div>
<p>Note that keys are genuinely <i>better</i> at revocation, because they are opaque: deleting the row
kills them immediately. The problem is never the mechanism; it is the lifetime and the sprawl.</p>

<h4>How they leak</h4>
<p>Keys leak in a small number of very predictable ways, and knowing the list is most of the defense:</p>
<ul>
<li><b>Committed to git.</b> The classic. Rewriting history does not help; assume anything pushed is
public forever and rotate.</li>
<li><b>Put in a URL query string.</b> URLs land in server logs, proxy logs, browser history and
<code>Referer</code> headers sent to third parties. Keys belong in a header, never a query parameter.</li>
<li><b>Shipped in a mobile app or SPA bundle.</b> Anything downloaded to a device is public; the key is
extractable in minutes.</li>
<li><b>Shared between environments and teams.</b> One key used by six integrations cannot be rotated
without breaking five of them, so it never gets rotated.</li>
<li><b>Logged accidentally</b> by a middleware that dumps request headers on error.</li>
</ul>

<h4>Doing them properly</h4>
<p>If you are issuing keys, a handful of choices make the difference between a manageable credential and
an incident:</p>
<ol>
<li><b>Give every key an identifiable prefix</b>: <code>sk_live_</code>, <code>ghp_</code>. It costs
nothing and lets secret scanners spot the key in a public repo and alert you before an attacker
notices. It also tells an engineer at a glance what they are holding.</li>
<li><b>Store only a hash.</b> Treat keys like passwords: hash at rest, compare on lookup. Your database
should not contain a usable credential. Show the plaintext once, at creation, and never again.</li>
<li><b>One key per integration.</b> Separate keys mean you can revoke one without an outage, and the
audit log can say <i>which</i> integration did something.</li>
<li><b>Scope them.</b> Read-only keys for read-only integrations. Most keys are handed full account
power because scoping was never offered.</li>
<li><b>Record last-used and support rotation with overlap.</b> "Last used" tells you which keys are
dead and safe to delete. Allowing two live keys at once is what makes rotation possible without
downtime.</li>
<li><b>Compare in constant time</b> and rate-limit by key, so lookup timing and brute force are both
closed off.</li>
</ol>

<h4>When to use one</h4>
<p>Keys are the right answer for server-to-server integrations where a human sets them up once: a
webhook receiver, a CI job, an internal script. They are the wrong answer whenever a <i>user</i> is
involved, because a key cannot represent one, and whenever the code runs somewhere the user can read
it, because then it is not a secret at all.</p>
<p>The modern replacement for the long-lived key in cloud and CI is <b>workload identity federation</b>:
the workload proves what it is and exchanges that for a short-lived token, so no static credential
exists to leak. That is the next lesson but one.</p>`,
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
<p>You have used dozens of these today. A password-reset email, a "anyone with this link can view"
document, a presigned download that works without logging in. In each case there is no session and no
token header: <b>the URL itself is the credential</b>. Holding the link <i>is</i> the authorization.</p>
<p>The pattern has a name, <b>capability URL</b>, and it is genuinely useful: it works in email, it
works for people without accounts, and it needs no login. It also fails in ways that ordinary
credentials do not, because URLs are handled by software that assumes they are not secret.</p>

<h4>The three properties that define one</h4>
<ul>
<li><b>Unguessable.</b> The secret is the only protection, so it must have real entropy: a
cryptographically random 128 bits or more, never a sequential id, a timestamp, or a hash of the user's
email.</li>
<li><b>Self-contained.</b> No other authentication is required. That is the feature and the risk.</li>
<li><b>Bounded.</b> A capability grants one specific thing (view <i>this</i> document, reset
<i>this</i> password) and should expire.</li>
</ul>

<h4>Why URLs leak in ways headers do not</h4>
<p>This is the part that surprises people. A token in an <code>Authorization</code> header travels
through a narrow, well-understood path. A URL travels through an enormous amount of software that
treats it as public metadata:</p>
<div class="codeSample" data-hl>a capability URL passes through, and is often retained by:

  server access logs         every proxy, load balancer and CDN in the path
  browser history            and it syncs across the user's devices
  the Referer header         sent to any third party the page links to or loads
  email scanners             corporate security gateways FETCH links to check them
  chat and ticket systems    pasted "so you can see what I mean"
  analytics and error trackers  full URL captured with the page view</div>
<p>Two of these deserve emphasis. <b>Referer leakage</b>: if the page at a capability URL loads an
external script or has an outbound link, the full URL can be handed to that third party. Set
<code>Referrer-Policy: no-referrer</code> on those pages. And <b>link prefetching by scanners</b>:
corporate mail gateways visit links to check them for malware, which means a single-use link can be
consumed before the human ever clicks it, a real and confusing bug in password-reset flows.</p>

<h4>The rules</h4>
<ol>
<li><b>Short expiry.</b> Minutes for a password reset, hours or days for a share link. An eternal
capability URL is a permanent unauthenticated back door.</li>
<li><b>Single use where the action is sensitive.</b> Consume the token on use, so a leaked reset link
in an inbox is already spent. Handle the scanner problem by requiring a POST: a GET from a scanner
then does not consume it.</li>
<li><b>Bind to the action, not just the resource.</b> A reset token should be valid for resetting one
account's password, and nothing else.</li>
<li><b>Put nothing sensitive in the path.</b> No email addresses, no names, no account numbers. All of
that is going into logs and history.</li>
<li><b>Re-authenticate before anything irreversible.</b> Deleting an account or changing an email
should require a real login, not just possession of a link.</li>
<li><b>Make them revocable and visible.</b> Users should be able to see active share links and kill
them.</li>
<li><b>Log the use, not the URL.</b> Record that capability <code>abc123</code> was used; never write
the full secret to a log.</li>
</ol>

<h4>Two flavors worth distinguishing</h4>
<p><b>Stored capabilities</b>: a random token in a database row recording what it grants and when it
expires. Instantly revocable, requires a lookup. This is what password resets should be.</p>
<p><b>Signed capabilities</b>: the parameters are in the URL along with an HMAC signature, so the
server verifies without storing anything. Cloud presigned URLs work this way. Stateless and scalable,
but <i>not revocable</i> before expiry, which is exactly the structured-versus-opaque trade-off from the
token lesson showing up again in a URL.</p>
<div class="codeSample" data-hl>// stored: the token means nothing without the row
https://app.example.com/reset?t=9f3a7c1e5b8d4a2f6c0e9b7d3a5f1c8e

// signed: the URL carries its own terms, verified by HMAC
https://files.example.com/report.pdf
    ?expires=1767225600&amp;scope=read&amp;sig=b41c9e...
// change any parameter and the signature no longer matches</div>
<p>Pick stored when you need revocation and an audit trail; pick signed when you need scale and can
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
a long-lived access key pasted into the CI system. The pattern that replaced it is <b>role
assumption</b>: prove who you are, then exchange that for a temporary credential scoped to a specific
role, with nothing durable to steal.</p>
<p>This is the same delegation idea as token exchange, applied to infrastructure, and it is worth seeing
as identity rather than as cloud trivia.</p>

<h4>The mechanics</h4>
<p>A <b>role</b> is a named bundle of permissions that nobody owns. It has two policies, and confusing
them causes most of the pain:</p>
<ul>
<li><b>The trust policy</b>: <i>who is allowed to assume this role.</i> An identity question.</li>
<li><b>The permission policy</b>: <i>what the role can do once assumed.</i> An authorization
question.</li>
</ul>
<p>Assuming the role returns a temporary credential (typically valid for an hour), and the caller's
effective permissions are the <b>intersection</b> of what the role grants and what any session policy
allows. Narrowing on assumption is a real capability worth using: assume the role with less than it
offers when the task needs less.</p>
<div class="codeSample" data-hl>Account A (CI)                        Account B (production)
  identity: ci-runner                   role: deploy-role
       |                                  trust policy:  who may assume me
       |  1. "I am ci-runner"             perm policy:   what I can do
       +--- assume-role -----------------------> checks the TRUST policy
                                                        |
       <---- temporary credential (1 hour) --------------+
       |
       +--- writes to the bucket, using the ROLE's permissions
            audit log records: ci-runner assumed deploy-role</div>
<p>Notice the audit line: like the <code>act</code> claim, a good implementation records both the
original identity and the role, so "who did this?" survives the hop.</p>

<h4>The confused deputy, and why external ids exist</h4>
<p>This is the subtlety that catches everyone. Suppose you are a SaaS vendor and your customers grant
your account permission to read their buckets. Your account is now a <b>deputy</b> holding access to
many customers.</p>
<p>Customer A configures a trust policy saying "vendor's account may assume my role." So can customer
B. Now, if customer B can persuade your service to make a call with <i>A's</i> role name (for example
by typing A's role identifier into their own configuration form), your service will happily assume it,
because your account genuinely is trusted by A. You have been used as a deputy to reach data you were
never meant to touch on that customer's behalf.</p>
<p>The fix is the <b>external id</b>: a secret value the customer puts in their trust policy, which the
vendor must supply on assumption. Because customer B does not know A's external id, B cannot make the
deputy act against A.</p>
<div class="codeSample" data-hl>// customer A's trust policy
allow assume-role by vendor-account
  ONLY IF externalId == "a7f3-c19e-..."   // A's secret, unique per customer

// the vendor must present it, and B cannot guess it
assumeRole(roleArn = A's role, externalId = "a7f3-c19e-...")</div>
<p>The general principle outlives any one cloud: <b>when you are trusted by many principals, something
must bind each request to the principal it is really for.</b> Otherwise being trusted by everyone means
anyone can aim you.</p>

<h4>Killing the last static credential</h4>
<p>Role assumption still needs an initial identity, and for years that was a long-lived key, the exact
thing the pattern was meant to remove. <b>Workload identity federation</b> closes the loop: the
workload already has a verifiable identity from its platform, so it exchanges that directly for a
role.</p>
<p>A CI job is the clearest example. The CI platform issues the job a short-lived OIDC token describing
it: which repository, which branch, which workflow. The cloud is configured to trust that issuer, and
to accept only tokens whose claims match. No secret is stored anywhere.</p>
<div class="codeSample" data-hl>// trust policy conditions on the OIDC token's own claims
issuer:  https://token.actions.githubusercontent.com
require: sub == "repo:acme/api:ref:refs/heads/main"
         aud == "sts.amazonaws.com"

// the danger: a loose condition trusts far too much
require: sub startsWith "repo:acme/"     // ANY repo in the org
require: nothing at all                  // ANY repo on GitHub, anywhere</div>
<p>That last line is not hypothetical: a trust policy naming the issuer but not constraining
<code>sub</code> lets any repository on the platform assume your role. The lesson generalizes: with
federated trust, <b>the issuer check tells you the token is real; the subject check tells you it is
the right one.</b> You need both, exactly as with <code>iss</code> and <code>aud</code> on any other
token.</p>`,
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
<p>A resource server must <b>validate</b> every token before trusting it. Signature aside (covered in the JOSE stream), the mandatory claim checks are:</p>
<ul>
<li><b>iss (issuer)</b>: was it minted by an issuer you trust?</li>
<li><b>aud (audience)</b>: is <i>this</i> API the intended recipient? A token for service A must be rejected by service B.</li>
<li><b>exp (expiration)</b>, is it still within its lifetime? (and <b>nbf</b>, not before.)</li>
<li><b>scope / roles</b>: does it permit this specific action? (lesson 5)</li>
</ul>
<p>Skipping <b>aud</b> is a classic mistake: a token leaked from one service could otherwise be replayed against another.</p>
<p><b>Bearer vs sender-constrained tokens.</b> A plain <b>bearer</b> token is like cash: whoever steals it can use it. <b>Sender-constrained</b> (a.k.a. proof-of-possession) tokens are bound to a key only the legitimate client holds, so a stolen token is useless to a thief:</p>
<ul>
<li><b>mTLS-bound tokens</b> (RFC 8705), the token is tied to the client's TLS certificate; the API checks the caller's cert matches.</li>
<li><b>DPoP</b> (RFC 9449), the client signs each request with a key; the token carries that key's thumbprint. Common for public clients (SPAs).</li>
</ul>
<p>Default to short-lived bearer tokens over TLS; reach for sender-constraint when tokens are high-value or the client is exposed.</p>
<div class="codeSample" data-hl>// the non-negotiable claim checks, in order
if (!expectedIss.equals(iss))    return false;   // trusted issuer?
if (!expectedAud.equals(aud))    return false;   // token meant for US?
if (expEpoch <= nowEpoch)        return false;   // not expired?
return true;                                       // (then check scope/roles)</div>

<h4>Why validation is the whole game</h4>
<p>It is tempting to read the token as a message from the user. It is not. It is a message from the
<b>issuer</b>, handed to you by whoever is calling, and that party may not be the person the token
describes. Everything a resource server does rests on one judgment: <i>is this a statement my issuer
made, to me, that is still true?</i></p>
<p>Split that sentence and you have the checks, in order, and the attack each one stops:</p>
<div class="codeSample" data-hl>"a statement my issuer made"   -> signature + iss   stops FORGED tokens
"...to me"                     -> aud              stops REPLAYED tokens
"...that is still true"        -> exp / nbf        stops EXPIRED tokens
"...permitting this action"    -> scope / roles    stops OVER-REACH</div>
<p>None of these are optional, and none substitutes for another. A perfectly signed, unexpired token
issued for a different API is still not yours to accept.</p>

<h4>The audience check is the one people skip</h4>
<p>Signature and expiry are obvious. Audience is not, because a token that verifies feels valid, and it
<i>is</i> valid, just not for you.</p>
<p>Picture an internal platform where five services all trust the same issuer. The billing service holds
a token its caller gave it. If it forwards that token to the admin API, and the admin API checks only
the signature, then <b>any service holding any token can call any other service</b>. One compromised
low-value service becomes access to everything. That is a confused deputy, and <code>aud</code> is the
single line of code that prevents it.</p>

<h4>Validate at the edge of trust, not at the edge of the network</h4>
<p>A gateway that validates tokens is useful, but it is not sufficient; it only proves the request
entered through the front door. Anything that can reach the service directly bypasses it. Each service
validates for itself; the gateway is defense in depth, not the check.</p>
<p>Two related habits: <b>fail closed</b> (an issuer you cannot reach, a key you cannot fetch, a claim you
cannot parse are all rejections, never "allow and log"), and <b>never trust the token to tell you where
to verify it</b>: the issuer list is your configuration, not something read out of the token you are
about to validate.</p>

<h4>And then: is the holder the rightful one?</h4>
<p>Every check above answers "is this token good?". None answers "is the party presenting it the party it
was issued to?", because a bearer token has no answer to give. That is the gap sender-constraining
closes, and the Advanced OAuth stream takes it apart in detail.`,
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
<p>Your <b>identity</b> is just your digital "who": an account plus the facts attached to it (name, email, groups). <b>Authentication</b> proves you are that who; <b>authorization</b> decides what that who may do. So far, so simple.</p>
<p>The problem: if every app keeps its own usernames and passwords, you drown in logins and each app becomes a place your password can leak. <b>Federation</b> solves this by letting apps <b>trust a shared authority</b> to say who you are, instead of each checking for themselves.</p>
<p><b>The passport analogy.</b> Your country verifies who you are and issues a passport; other countries accept it at the border without re-investigating you, because they trust the issuer. In identity, the <b>Identity Provider (IdP)</b> is your country, the passport is a signed <b>token or assertion</b>, and each app (the <b>Service Provider / Relying Party</b>) is the border that trusts it.</p>
<p><b>Everyday examples.</b> "Log in with Google": Google is the IdP that vouches for you, and the app relies on Google&#8217;s word rather than storing your password. Corporate SSO: an employee logs into Okta once and reaches Salesforce, Slack, and Workday: each app trusts Okta, so one login opens all of them. That is <b>federated identity</b>: your identity lives in one place and is accepted in many.</p>
<p>The trust is set up in advance (the app is configured with the IdP&#8217;s keys/metadata), which is why a random site cannot simply claim "Google says this is you"; only the real, pre-trusted IdP&#8217;s signature is accepted.</p>

<h4>What the app gives up, and what it gains</h4>
<p>Federation is a trade, and naming both sides makes the rest of this stream easier to reason about. The app <b>gains</b>: no password to store or leak, no reset flow to build, MFA and policy enforced centrally, and access that ends when the employer says it ends. The app <b>gives up</b>: control of the login experience, the ability to authenticate when the IdP is down, and any independent knowledge of who the user is: it believes what the token says.</p>
<p>That last item is why the IdP becomes the highest-value target in the estate. Compromise one app and you have one app; compromise the IdP and you can mint a valid identity for every app that trusts it. Federation does not remove risk, it <b>concentrates</b> it, which is a good bargain, because one system defended extremely well beats fifty defended averagely, but only if the concentration is acknowledged and funded.</p>

<h4>Reading the passport analogy carefully</h4>
<p>The analogy is worth pushing on, because its edges are the real subject. A border checks that the passport is authentic (the signature), unexpired (the token's lifetime), and issued by a country it recognizes (the trust configuration). It does not phone the issuing country, which is why revoking a passport is slow and imperfect, exactly like a signed token that stays valid until it expires. And a passport says who you are, not what you may do; the visa is separate, which is the distinction between authentication and authorization arriving in the same document.</p>

<h4>Three things that must be arranged in advance</h4>
<ul>
<li><b>Keys</b>: the app must know the IdP's public keys, which it fetches from a metadata or JWKS URL rather than having them pasted into config, so rotation does not require a deployment.</li>
<li><b>Identifiers</b>: the app and the IdP must agree on what names the user. A stable subject identifier, not an email.</li>
<li><b>Attributes</b>: which claims the IdP will release, since an app that needs a department or a group only gets it if the IdP is configured to send it. In enterprise deployments this negotiation is most of the integration work, and it is where "SSO is set up but nobody has the right permissions" comes from.</li>
</ul>`,
docs:[['Identity federation (Wikipedia)','https://en.wikipedia.org/wiki/Federated_identity'],['SSO & federation basics','https://www.cloudflare.com/learning/access-management/what-is-sso/']],
ex:{title:'Who plays which role?',
prompt:`Write class <code>Federation</code> with <code>static String role(String party)</code>: <code>"idp"</code>→<code>"vouches for the user"</code>, <code>"sp"</code>→<code>"relies on the idp"</code>, and <code>"unknown"</code> for anything else.`,
starter:`public class Federation {
    static String role(String party) {
        return null;
    }
}`,
solution:`public class Federation {
    static String role(String party) {
        switch (party) {
            case "idp": return "vouches for the user";
            case "sp":  return "relies on the idp";
            default:    return "unknown";
        }
    }
}`,
tests:[{d:'the IdP vouches for the user',re:'(?:["\']idp["\'][^;}]*?return\\s+["\']vouches for the user["\'])|(?:case\\s*["\']idp["\']\\s*->\\s*(?:\\{\\s*)?["\']vouches for the user["\'])|(?:["\']idp["\']\\s*:\\s*["\']vouches for the user["\'])|(?:(?:put|entry|of)\\s*\\(\\s*["\']idp["\']\\s*,\\s*["\']vouches for the user["\'])',flags:'s'},{d:'the SP relies on the IdP',re:'"sp".*?"relies on the idp"',flags:'s'},{d:'unknown default',re:'"unknown"'}],
behavior:`role("idp") is "vouches for the user", role("sp") is "relies on the idp", role("x") is "unknown". The IdP is the trusted authority; the SP/RP is the app that accepts its word.`,
hints:['A two-case switch plus a default covers it.','The identity provider vouches; the service provider relies.','Anything else returns unknown.']}},
{id:'idffed2',title:'Federation from the ground up: why & how',body:`
<p>We met federation in plain English (the passport analogy). Now the ground-up version: <b>why</b> it exists and <b>how</b> it is actually built: the base every OAuth, OIDC and SAML lesson assumes.</p>
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
<p><b>Why it is needed.</b> If every app stores its own passwords you get password sprawl and reuse, no single place to disable a leaver, no way for a partner or customer to bring an identity they already have, and a password honeypot in every app. Federation removes all four by letting apps <b>trust one authority</b> to authenticate the user.</p>
<p><b>How it is implemented.</b> Three moving parts and three protocols:</p>
<ul>
<li><b>The authority</b>: the <b>Identity Provider (IdP)</b> authenticates the user and issues a <b>signed proof</b>: an <b>ID token</b> (a JWT) in OpenID Connect, or a signed XML <b>assertion</b> in SAML. <b>OAuth 2.0</b> underneath carries authorization (API access).</li>
<li><b>The app</b>: the <b>Relying Party (RP) / Service Provider (SP)</b> receives that proof and <b>verifies</b> it rather than checking a password.</li>
<li><b>The wiring</b>: <b>metadata / discovery</b> tells the RP where the IdP's endpoints and <b>public keys</b> live (a <code>jwks_uri</code> for OIDC, metadata XML for SAML), so the RP can find and check everything.</li>
</ul>
<p>The safe shape is <b>SP-initiated</b>: the app starts the login by redirecting to the IdP, the user authenticates, and the IdP redirects back with a proof the app verifies and turns into a session. Because the app started it, it can correlate the response to its own request, a property the trust deep-dive builds on next.</p>

<h4>Why SP-initiated is the safe shape</h4>
<p>When the app starts the flow it creates state before anything leaves: a request id, a <code>state</code> value, a PKCE verifier, a return URL. Everything that comes back can then be matched against something the app itself generated, which is what makes a response forged or replayed by a third party detectable. In the <b>IdP-initiated</b> direction (the user clicks a tile in a portal and an unsolicited assertion arrives at the app), none of that state exists. The app receives a valid-looking assertion it never asked for, and it cannot tell whether the user meant to send it or an attacker did. That is the shape behind a whole family of login-CSRF and assertion-replay problems, and it is why modern guidance is to avoid IdP-initiated flows or to convert them into SP-initiated ones by bouncing the user back to the app first.</p>

<h4>What "trust" concretely consists of</h4>
<p>Trust in federation is not a feeling; it is four pieces of configuration that both sides can point at. The <b>issuer identifier</b>, which must match exactly. The <b>signing keys</b>, discovered rather than hardcoded so rotation is invisible. The <b>audience</b>, so an assertion for one app is not usable at another. And the <b>attribute contract</b>: which claims are released, in what format, with what identifier. Get the first three wrong and you have a security problem; get the fourth wrong and you have an integration that authenticates people it cannot authorize.</p>

<h4>The failure modes worth expecting</h4>
<ul>
<li><b>The IdP is a single point of failure.</b> When it is down, nobody logs into anything, which is why break-glass access and cached sessions are operational requirements rather than nice-to-haves.</li>
<li><b>Clock skew</b> breaks assertion validity windows, and SAML's windows are typically minutes. NTP is a dependency of your login.</li>
<li><b>Certificate and key rotation</b> at the IdP breaks every relying party that pinned instead of discovering, the most common cause of a federation outage that "nobody changed anything" precedes.</li>
<li><b>Session lifetime mismatch.</b> The app's session can outlive the IdP's, so a user disabled centrally stays signed in locally until the app's session expires. Short app sessions, or a revocation signal, are the answers.</li>
</ul>`,
docs:[['Federated identity (Wikipedia)','https://en.wikipedia.org/wiki/Federated_identity'],['OIDC Core','https://openid.net/specs/openid-connect-core-1_0.html'],['SAML 2.0 overview','https://docs.oasis-open.org/security/saml/v2.0/']],
ex:{title:'Name the moving parts',
prompt:`Write class <code>Federation</code> with <code>static String piece(String role)</code>: <code>"authority"</code>→<code>"IdP"</code>, <code>"app"</code>→<code>"relying party"</code>, <code>"proof"</code>→<code>"signed token or assertion"</code>, <code>"keys"</code>→<code>"published at JWKS or metadata"</code>, else <code>"unknown"</code>.`,
starter:`public class Federation {
    static String piece(String role) {
        return null;
    }
}`,
solution:`public class Federation {
    static String piece(String role) {
        switch (role) {
            case "authority": return "IdP";
            case "app":       return "relying party";
            case "proof":     return "signed token or assertion";
            case "keys":      return "published at JWKS or metadata";
            default:          return "unknown";
        }
    }
}`,
tests:[{d:'the authority is the IdP',re:'(?:["\']authority["\'][^;}]*?return\\s+["\']IdP["\'])|(?:case\\s*["\']authority["\']\\s*->\\s*(?:\\{\\s*)?["\']IdP["\'])|(?:["\']authority["\']\\s*:\\s*["\']IdP["\'])|(?:(?:put|entry|of)\\s*\\(\\s*["\']authority["\']\\s*,\\s*["\']IdP["\'])',flags:'s'},{d:'the app is the relying party',re:'"app".*?"relying party"',flags:'s'},{d:'the proof is a signed token or assertion',re:'"proof".*?"signed token or assertion"',flags:'s'},{d:'keys are published at JWKS/metadata',re:'"keys".*?"published at JWKS or metadata"',flags:'s'},{d:'unknown default',re:'"unknown"'}],
behavior:`piece("authority") is "IdP", piece("app") is "relying party", piece("proof") is "signed token or assertion", piece("keys") is "published at JWKS or metadata". Those four pieces (authority, app, proof, and published keys) are all federation is.`,
hints:['Federation removes password sprawl by making apps trust one authority.','The IdP issues a signed proof; the relying party verifies it instead of a password.','Metadata/JWKS publishes the IdP public keys and endpoints so the app can find and check them.']}},
{id:'idftrust',title:'How trust is established, end to end',body:`
<p>Federation only works if the relying party (RP) can be sure a proof really came from the identity provider (IdP), is meant for <i>this</i> app, and is fresh. That certainty is <b>trust</b>, and it is not a feeling; it is <b>configuration plus cryptography</b>. This lesson ties together the pieces you meet across the OAuth, SAML and PKI streams.</p>
<p><b>1. Identification (set up once, out of band).</b> The RP <b>registers</b> with the IdP. In OAuth/OIDC it receives a <code>client_id</code> and, for a confidential client, a <code>client_secret</code>, and registers exact redirect URIs. In SAML the two sides exchange <b>metadata</b> containing an <b>X.509 certificate</b>. This is where the parties learn who each other are.</p>
<p><b>2. Keys (the core asymmetry).</b> The IdP signs proofs with its <b>private</b> key and <b>publishes the matching public key</b>, at a <b>JWKS</b> endpoint (OIDC) or in SAML metadata. The RP verifies signatures with that public key. <b>Public keys are shared; private keys never leave their owner</b>, which is exactly why a forger who can read the public key still cannot mint a valid signature. For certificates, verification may walk a <b>PKI chain</b> to a trusted <b>CA</b>.</p>
<p><b>2b. The trust anchor, where the regress stops.</b> Verification is a chain of "I believe this because of that," and every chain has to terminate somewhere in a thing you believe <i>because you decided to</i>. That terminus is the <b>trust anchor</b>: a key or certificate accepted as authoritative by configuration rather than by proof. It is the one link nothing else vouches for.</p>
<p>The same idea wears different clothes in each stream: in OIDC the anchor is the <b>issuer URL plus its JWKS keys</b> you configured; in SAML it is the <b>IdP certificate in the metadata</b> you loaded; in PKI it is a <b>root CA certificate</b> in your trust store, self-signed by definition: a root is trusted <i>because it is in the store</i>, not because its signature proves anything. This is why "just fetch the keys from whatever URL the token names" is fatal: it lets the token choose its own anchor, and an attacker will happily point you at keys they control. <b>The anchor must be pinned by you, in advance, out of band.</b> Everything downstream is only as trustworthy as that one deliberate decision.</p>
<p><b>3. How strongly the client proves itself</b> runs on a ladder: nothing (public client + PKCE) → a shared <code>client_secret</code> → <b>private_key_jwt</b> (the client signs with its own private key; no shared secret) → <b>mTLS</b>. Asymmetric methods are stronger because there is no shared secret to leak.</p>
<p><b>4. Verification (enforced on every message).</b> A valid signature is necessary but not sufficient. The RP must also check the <b>issuer</b> (<code>iss</code> is the expected IdP), the <b>audience</b> (<code>aud</code>/recipient names this RP, so a proof minted for another app is rejected), <b>freshness</b> (<code>exp</code>/<code>NotOnOrAfter</code> and <code>nbf</code>, with small clock skew), and <b>anti-replay/correlation</b> (the <code>nonce</code> ties an ID token to this login; <code>state</code> blocks CSRF; SAML tracks assertion IDs).</p>
<p><b>5. The sharp edges.</b> <b>Unsolicited assertions</b> (SAML IdP-initiated) have no request to correlate to, so accept them only from a trusted IdP with full validation, and prefer SP-initiated. <b>JIT provisioning</b> means you create accounts from IdP claims, so map claims to <b>least privilege</b> and key on the stable subject id. And trust is not set-and-forget: rotate keys and certificates, honor JWKS caching, and support revocation and logout.</p>`,
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
<li><b>DID (Decentralized Identifier)</b>: an identifier you control (a URI like <code>did:example:123</code>) that resolves to a <b>DID document</b> containing your public keys. It is not issued or ownable by any one company.</li>
<li><b>Verifiable Credential (VC)</b>: a tamper-evident, cryptographically signed claim (e.g. "over 18", "employed by Acme") <b>issued</b> by an authority, <b>held</b> by you in a wallet, and <b>presented</b> to whoever needs it.</li>
</ul>
<p>The model is a <b>trust triangle</b>: the <b>issuer</b> signs and gives you a credential; the <b>holder</b> (you) stores it in a wallet; the <b>verifier</b> checks the issuer signature, without calling the issuer. The standout property is <b>selective disclosure</b> (and zero-knowledge proofs): prove you are over 18 <i>without</i> revealing your birthdate.</p>
<p>Versus federation: there is no central login and no IdP that sees every sign-in, which improves privacy and resilience. The caveat: the ecosystem (wallets, revocation, standards) is still maturing, so most production identity today is still federated, but VCs are showing up in digital IDs and know-your-customer flows.</p>

<h4>The trust triangle, and what is genuinely new</h4>
<p>Federation and decentralized identity both rest on a signature from an authority you trust. The difference is <b>where the authority sits at the moment of use</b>. In federation the IdP is online and in the flow: it learns every login, every relying party, and every time you sign in. In the credential model the issuer signs once and goes away; the verifier checks a signature against a published key and never contacts the issuer. That absence is the point: no phone-home means no central observer of your behavior, and no single service whose outage stops every login.</p>
<p><b>Selective disclosure</b> is the second genuinely new property. A signed credential normally has to be shown whole, which is why proving your age with a driving license reveals your address. SD-JWT and similar constructions let the holder reveal individual claims while the signature still verifies over what was revealed, so "over 18" is provable without a birthdate. That is a capability federation simply does not have.</p>

<h4>The parts that are still hard</h4>
<ul>
<li><b>Revocation.</b> An offline check cannot see that a credential was revoked this morning, so schemes use status lists, short lifetimes or re-issuance, and each trades privacy against freshness, because a status lookup can leak which credential is being checked.</li>
<li><b>Key recovery.</b> If you hold your own keys, losing your phone means losing your identity unless there is recovery, and recovery is a backdoor by another name, which is why wallet vendors differ so much here.</li>
<li><b>Trust registries.</b> A verifier still has to decide which issuers to believe. That question does not disappear; it moves to a registry, and the governance of that registry is where the politics lives.</li>
<li><b>Correlation.</b> Presenting the same credential identifier everywhere reintroduces tracking, which is what batch-issued single-use credentials and pairwise identifiers exist to prevent.</li>
</ul>

<h4>Where it is actually being used</h4>
<p>Where this stands in 2026: it is no longer a research topic and not yet the default. The EU Digital Identity Wallet regulation obliges member states to offer wallets, mobile driving licenses are in production in several US states and are accepted at airports, and OpenID for Verifiable Credential Issuance and Presentation (OID4VCI / OID4VP) have made the flows look reassuringly like OAuth, which is the pragmatic reason they are gaining traction. Most enterprise identity remains federated, and the two will coexist: an employee logs in via the corporate IdP and presents a credential to prove a professional certification the employer never held.</p>`,
docs:[['Decentralized Identifiers (W3C DID)','https://www.w3.org/TR/did-core/'],['Verifiable Credentials (W3C)','https://www.w3.org/TR/vc-data-model/'],['Self-sovereign identity','https://en.wikipedia.org/wiki/Self-sovereign_identity']],
ex:{title:'The trust triangle',
prompt:`Write class <code>Ssi</code> with <code>static String role(String party)</code>: <code>"issuer"</code>→<code>"signs and issues the credential"</code>, <code>"holder"</code>→<code>"keeps it in a wallet"</code>, <code>"verifier"</code>→<code>"checks the issuer signature"</code>, and <code>"unknown"</code> otherwise.`,
starter:`public class Ssi {
    static String role(String party) {
        return null;
    }
}`,
solution:`public class Ssi {
    static String role(String party) {
        switch (party) {
            case "issuer":   return "signs and issues the credential";
            case "holder":   return "keeps it in a wallet";
            case "verifier": return "checks the issuer signature";
            default:         return "unknown";
        }
    }
}`,
tests:[{d:'issuer signs & issues',re:'(?:["\']issuer["\'][^;}]*?return\\s+["\']signs and issues the credential["\'])|(?:case\\s*["\']issuer["\']\\s*->\\s*(?:\\{\\s*)?["\']signs and issues the credential["\'])|(?:["\']issuer["\']\\s*:\\s*["\']signs and issues the credential["\'])|(?:(?:put|entry|of)\\s*\\(\\s*["\']issuer["\']\\s*,\\s*["\']signs and issues the credential["\'])',flags:'s'},{d:'holder keeps it in a wallet',re:'"holder".*?"keeps it in a wallet"',flags:'s'},{d:'verifier checks the signature',re:'"verifier".*?"checks the issuer signature"',flags:'s'},{d:'unknown default',re:'"unknown"'}],
behavior:`role("issuer") is "signs and issues the credential", role("holder") is "keeps it in a wallet", role("verifier") is "checks the issuer signature". The verifier trusts the issuer signature without contacting the issuer; that is the decentralized part.`,
hints:['Issuer → holder → verifier is the trust triangle.','The holder stores credentials in a wallet and presents them.','The verifier checks the cryptographic signature, not a live call to the issuer.']}},

{id:'iddid2',title:'Wallets in practice: OID4VC, OID4VP and the mDL',body:`
<p>The previous lesson covered DIDs and verifiable credentials as concepts, and the JOSE stream covered
SD-JWT as the format. What has been missing is the <b>protocols that move credentials</b>: how one is
issued into a wallet, and how a verifier asks for one. That is OID4VC and OID4VP, and they are
deliberately built on OAuth so that the ecosystem does not have to learn a new stack.</p>

<h4>The three-party model</h4>
<div class="codeSample" data-hl>  [ ISSUER ]  --OID4VCI-->  [ WALLET ]  --OID4VP-->  [ VERIFIER ]
   the DMV                    on the                    the bar,
                              user's phone              the landlord

// note what is ABSENT: the verifier never contacts the issuer. that is the
// whole point: the DMV does not learn where you proved your age.
// contrast federation, where the IdP sees every login.</div>
<p>That absence is the substantive difference from everything else in this domain. In federation the
authority is <i>online</i> at the moment of use and therefore sees it. Here the credential is issued
once and presented many times without the issuer's involvement, which removes a surveillance surface
that federation cannot.</p>

<h4>Issuance (OID4VCI)</h4>
<p>An OAuth flow with a different prize at the end: instead of an access token for an API, you receive a
credential to keep. The wallet authenticates the user at the issuer, obtains an access token, and calls
a <b>credential endpoint</b>, presenting a proof that it holds the key the credential will be bound
to, so the credential cannot be replayed into a different wallet.</p>

<h4>Presentation (OID4VP)</h4>
<p>The verifier sends a <b>presentation definition</b>, a machine-readable description of what it
needs, not which credential to use. The wallet decides which credential satisfies it and which claims
to disclose, using the SD-JWT selective-disclosure mechanism plus a key-binding proof naming this
verifier and its nonce.</p>
<div class="codeSample" data-hl>verifier asks:   "a government ID credential, proving age_over_18"
wallet returns:  the SD-JWT + the age_over_18 disclosure + a KB-JWT
                 -> the date of birth is NEVER sent
                 -> the name and address are never sent
                 -> the verifier learns exactly one fact</div>
<p><b>Ask for the predicate, not the data.</b> A credential can carry a pre-computed
<code>age_over_18</code> claim, so proving eligibility never requires disclosing a birthdate. This is
the single most useful design habit in the whole area, and it applies well beyond wallets: most systems
that store dates of birth only ever needed a boolean.</p>

<h4>The mDL and why standards collided</h4>
<p>Mobile driving licenses arrived from a different direction: ISO/IEC 18013-5, written by standards
bodies serving physical documents, using CBOR and designed to work offline over NFC or Bluetooth at a
roadside stop with no connectivity. OID4VP came from the web. Both are real, both are deployed, and
convergence is partial: OID4VP can carry mdoc credentials, so the transport and the format are
increasingly separable. Expect to meet both.</p>

<h4>Age assurance: what wallets do and do not solve</h4>
<p>Regulators increasingly require age checks, and wallets are the mechanism most often proposed.
Verifiable presentation genuinely solves the technical problem: prove over-18 without revealing
identity or birthdate, unlinkably enough for most purposes. What it does not solve is that <b>somebody
must still have verified the underlying fact</b>, and that requires an issuer who saw a real document.
The privacy question therefore moves rather than disappearing: from "what does this site learn" to "who
issued this, and what did they retain".</p>

<h4>What is still unsettled</h4>
<ul>
<li><b>Revocation.</b> Status lists exist, but checking one can reintroduce a call that tells someone
you are being verified, the privacy problem returning through the back door.</li>
<li><b>Unlinkability.</b> SD-JWT's issuer signature is identical across presentations, so colluding
verifiers can correlate. BBS+ fixes it and is not yet widely deployed.</li>
<li><b>Recovery.</b> Losing the phone means losing the credentials, and the recovery story is
per-ecosystem and mostly immature.</li>
<li><b>Trust.</b> A verifier must know which issuers to accept, which is exactly the trust-anchor and
federation problem, now at ecosystem scale.</li>
</ul>
<p>Worth watching rather than adopting for most systems today. The habit to take away regardless is the
predicate one: <b>ask for the narrowest fact that answers your question.</b></p>`,
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
