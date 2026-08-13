STREAMS.push({iam:true,sec:'Running identity in production',icon:'🚨',title:'Running Identity',blurb:'The half of identity that is not a protocol: what to do when credentials are compromised, how to migrate an estate without an outage, why the IdP is the blast radius for everything, what to measure, and how to test any of it. The lessons an on-call rotation teaches.',lessons:[

{id:'run1',title:'Identity incident response: when credentials are compromised',body:`
<p>Every other lesson has been about preventing compromise. This one starts after it has happened. The
uncomfortable property of identity systems is that <b>the thing that makes them fast makes them hard to
stop</b>: self-contained tokens verify offline, so there is no central place to switch them off.</p>

<h4>The first question: what exactly leaked?</h4>
<p>The blast radius differs enormously, and the response differs with it:</p>
<div class="codeSample" data-hl>WHAT LEAKED              WHO IS AFFECTED            HOW BAD
one access token         one user, one API          minutes, then it expires
a refresh token          one user, durably          until you revoke the grant
a session cookie         one user, one app          until session revocation
a client secret          every user of that app     rotate, and audit its usage
an API key               whatever it could reach    revoke; check what it touched
the IdP SIGNING KEY      EVERY user, EVERY app      total. tokens can be forged
a directory dump         every password hash        force reset, assume cracked
an admin account         everything, including the  worst case: the attacker can
                         ability to hide the trail  mint their own access</div>
<p>Two of these are categorically different. A <b>signing key</b> compromise means an attacker can mint
valid tokens for anyone — no login required, nothing in your authentication logs. An <b>admin account</b>
compromise means they can enroll their own authenticator, add a federated IdP, or create a client, all
of which survive the password reset you are about to do.</p>

<h4>Why you cannot just "revoke everything"</h4>
<p>A structured token is valid because it verifies, not because a database says so. So:</p>
<ul>
<li><b>Access tokens cannot be recalled.</b> They stay valid until <code>exp</code>. Your real lever is
that they are short-lived — which is why the 5-to-15-minute lifetime is an incident-response decision,
not a performance one.</li>
<li><b>Refresh tokens and grants can be revoked</b>, and this is what actually stops continued access.
Revoking the token alone is not enough; revoke the <b>grant</b>.</li>
<li><b>Sessions can be revoked</b> only if you kept server-side state or a denylist to check.</li>
</ul>
<p>If your answer to "how do we cut off a compromised user right now" is "wait for the tokens to
expire", that is the finding, and you learn it during the incident rather than before.</p>

<h4>Signing key rotation under duress</h4>
<p>Normal rotation is graceful: publish the new key in JWKS, wait for caches to pick it up, then start
signing with it. Emergency rotation cannot wait, and the conflict is real — remove the compromised key
immediately and every legitimately-issued token fails too.</p>
<div class="codeSample" data-hl>EMERGENCY KEY ROTATION
 1. generate + publish the new key alongside the old   (JWKS holds both)
 2. start signing with the new kid immediately
 3. REMOVE the compromised key from JWKS
 4. force RPs to refetch — this is where JWKS cache TTL becomes your
    recovery time. a 24h cache means a 24h window of forged tokens.
 5. invalidate every session and grant: everyone re-authenticates
 6. only then investigate what was minted while the key was out</div>
<p>Step 4 is the lesson: <b>your JWKS cache TTL is your worst-case exposure window.</b> Decide it with
that in mind, and make sure relying parties honour a <code>kid</code> they do not recognise by
refetching rather than failing closed forever.</p>

<h4>The containment order</h4>
<ol>
<li><b>Stop the bleeding</b> — disable the account, revoke grants, rotate the secret. Before you
understand it fully.</li>
<li><b>Preserve evidence</b> — snapshot the logs before anything rotates them out. Identity logs are
frequently the shortest-retention logs in an organisation, which is discovered at the worst time.</li>
<li><b>Find persistence</b> — this is the step people skip. An attacker with a session enrolled their
own MFA authenticator, added an API key, registered an OAuth client, or created a federated trust.
Resetting the password removes none of it. <b>Enumerate every credential and trust attached to the
account, and every one created during the window.</b></li>
<li><b>Assess reach</b> — what did that identity touch, and what did it authorise?</li>
<li><b>Restore</b> — re-enroll, re-issue, force re-authentication.</li>
</ol>

<h4>What to prepare in advance</h4>
<p>All of the above is much easier if it exists before the incident: a documented emergency revocation
runbook, break-glass accounts that are phishing-resistant and monitored, identity log retention long
enough to investigate with, the ability to answer "what is currently issued to this user" in one place,
and a rehearsed key rotation. The rotation especially — an untested emergency procedure is a hope.</p>`,
docs:[['NIST SP 800-61 — Computer Security Incident Handling Guide','https://csrc.nist.gov/pubs/sp/800/61/r2/final'],['RFC 7009 — OAuth 2.0 Token Revocation','https://www.rfc-editor.org/rfc/rfc7009'],['CISA — Identity and access management guidance','https://www.cisa.gov/resources-tools/resources/identity-and-access-management-recommended-best-practices-administrators']],
ex:{title:'Blast radius and the containment plan',
prompt:`Write <code>IncidentResponse</code> with three methods. <code>static String blastRadius(String leaked)</code> returns <code>"total"</code> for <code>"signing-key"</code> and <code>"admin-account"</code>, <code>"durable-user"</code> for <code>"refresh-token"</code> and <code>"session-cookie"</code>, <code>"transient-user"</code> for <code>"access-token"</code>, <code>"application"</code> for <code>"client-secret"</code> and <code>"api-key"</code>, and <code>"unknown"</code> otherwise including null. <code>static boolean revocationStops(String leaked)</code> returns <b>false</b> for <code>"access-token"</code> — a self-contained token cannot be recalled — and true for everything else with a known blast radius. <code>static boolean mustHuntPersistence(String leaked)</code> is true only when the blast radius is <code>"total"</code>, because that is where an attacker could enroll their own credentials.`,
starter:`public class IncidentResponse {
    static String blastRadius(String leaked) {
        return null;
    }
    static boolean revocationStops(String leaked) {
        return false;
    }
    static boolean mustHuntPersistence(String leaked) {
        return false;
    }
}`,
tests:[{d:'a signing key is a total compromise',re:'"signing-key"'},{d:'an admin account is a total compromise',re:'"admin-account"'},{d:'refresh tokens are durable for one user',re:'"durable-user"'},{d:'client secrets affect the whole application',re:'"application"'},{d:'unknown inputs fall through',re:'"unknown"'},{d:'access tokens cannot be revoked',re:'"access-token"'},{d:'persistence hunting follows a total compromise',re:'"total"\\s*\\.\\s*equals|equals\\s*\\(\\s*"total"'}],
behavior:`blastRadius("signing-key") and blastRadius("admin-account") return total, because the first lets an attacker mint tokens for anyone with nothing in your login logs, and the second lets them establish access that survives a password reset. blastRadius("refresh-token") is durable-user and blastRadius("access-token") is transient-user. revocationStops("refresh-token") is true but revocationStops("access-token") is false: it stays valid until exp, which is why a short lifetime is an incident-response decision rather than a performance one. mustHuntPersistence("signing-key") is true; mustHuntPersistence("access-token") is false.`,
hints:['A switch mapping each leaked artefact to its radius, defaulting to "unknown".','Special-case "access-token" first in revocationStops, then require a known radius.','<code>return "total".equals(blastRadius(leaked));</code>'],
solution:`public class IncidentResponse {
    static String blastRadius(String leaked) {
        if (leaked == null) return "unknown";
        switch (leaked) {
            case "signing-key":
            case "admin-account":
                return "total";          // forge tokens / establish persistence
            case "refresh-token":
            case "session-cookie":
                return "durable-user";
            case "access-token":
                return "transient-user";
            case "client-secret":
            case "api-key":
                return "application";
            default:
                return "unknown";
        }
    }
    static boolean revocationStops(String leaked) {
        // a self-contained token verifies offline: nothing to switch off
        if ("access-token".equals(leaked)) return false;
        return !"unknown".equals(blastRadius(leaked));
    }
    static boolean mustHuntPersistence(String leaked) {
        // enrolled authenticators, new clients and federated trusts survive a reset
        return "total".equals(blastRadius(leaked));
    }
}`}},

{id:'run2',title:'Migrating an identity estate without an outage',body:`
<p>Almost nobody builds identity on a blank page. The real work is moving an existing estate — hundreds
of applications, years of accounts, a legacy IdP nobody fully understands — onto something better,
while everyone keeps logging in. It is the least glamorous and most commonly failed part of the job.</p>

<h4>The constraint that shapes everything</h4>
<p><b>You cannot cut over atomically.</b> There is no moment when 200 applications switch IdP together.
So every migration is a period of <i>coexistence</i>, and the design question is not "how do we move"
but "how do we run both at once, safely, for a year".</p>

<h4>Four patterns</h4>
<ul>
<li><b>Big bang.</b> Everything moves in one weekend. Only viable for a handful of apps, and the
rollback plan is usually fictional.</li>
<li><b>Strangler.</b> Put the new IdP in front, federate it back to the old one, then migrate apps to
the new IdP one at a time. Users authenticate at the new IdP from day one even though the old system
still holds the credentials. The most common and generally the right answer.</li>
<li><b>App-by-app cutover.</b> Each app is repointed independently. Simple per app, but users may be
prompted twice during the overlap because the two IdPs have separate sessions.</li>
<li><b>Parallel run.</b> Both systems live, one authoritative, differences reconciled. Expensive, and
sometimes the only option under a regulator.</li>
</ul>
<div class="codeSample" data-hl>STRANGLER, in practice

  phase 1   users -> NEW IdP --federates--> OLD IdP (still authoritative)
            nothing changes for apps. the new IdP learns the population.

  phase 2   migrate apps to the new IdP one at a time
            each app: register client, test, dual-run, cut over, verify

  phase 3   migrate credentials (below), then stop federating

  phase 4   decommission — the step organisations skip, leaving a legacy
            IdP running for years as an unmonitored attack surface</div>

<h4>Moving the credentials</h4>
<p>You usually cannot move passwords: hashes are one-way, and often use a different algorithm. Three
options, in order of preference:</p>
<ol>
<li><b>Lazy migration ("just-in-time rehash").</b> Import the old hashes as-is. On each successful
login, verify with the old algorithm, then immediately rehash with the new one and discard the old.
Users notice nothing, and the population migrates itself. After a cutoff, force a reset for whoever is
left — usually inactive accounts you did not want anyway.</li>
<li><b>Nested hashing.</b> Store <code>newAlgo(oldHash)</code> so you can verify without the old
implementation. Works, but complicates verification forever.</li>
<li><b>Forced reset.</b> Reliable, and a support and abandonment disaster at any scale. Also trains
users to expect unsolicited password reset emails, which is exactly what phishing looks like.</li>
</ol>
<p>Passkeys and MFA enrollments are worse: they are <b>bound to the RP ID</b> and generally cannot be
migrated at all. If the new IdP has a different RP ID, every user re-enrolls. Plan for it, and take the
chance to enroll something stronger.</p>

<h4>Identifier mapping: the silent data disaster</h4>
<p>The old IdP keyed users on <code>email</code>; the new one issues a fresh <code>sub</code>. If your
applications stored the old identifier, every account must be re-linked. Get this wrong and users log in
successfully to an empty account, which reads as data loss and generates far more panic than an outage.</p>
<p>The safe approach: build the mapping table <i>before</i> cutover, have the new IdP assert the legacy
identifier as an additional claim during the overlap, and let applications migrate their key on first
login. Never rely on email as the join — it is the thing most likely to have changed.</p>

<h4>How to sequence</h4>
<p>Migrate in order of <i>recoverability</i>, not importance: an internal low-traffic app first, so the
first real cutover teaches you what your runbook got wrong. Then broad-but-simple. Then the crown
jewels, last, when the process is boring. And keep the old path warm — a cutover you cannot reverse
within an hour is not a cutover, it is a commitment.</p>`,
docs:[['OWASP — Password Storage Cheat Sheet (upgrading hashes)','https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html'],['Martin Fowler — Strangler Fig Application','https://martinfowler.com/bliki/StranglerFigApplication.html'],['W3C — WebAuthn RP ID','https://www.w3.org/TR/webauthn-2/#rp-id']],
ex:{title:'Lazy password migration and identifier mapping',
prompt:`Write <code>Migration</code> with three methods. <code>static boolean verifyLegacy(String storedAlgo, String presented, java.util.function.BiPredicate&lt;String,String&gt; legacyCheck, java.util.function.BiPredicate&lt;String,String&gt; modernCheck)</code> uses <code>modernCheck</code> when <code>storedAlgo</code> is <code>"argon2"</code> and <code>legacyCheck</code> otherwise, returning false if <code>presented</code> is null. <code>static boolean shouldRehash(String storedAlgo, boolean loginSucceeded)</code> is true only when the login succeeded and the stored algorithm is not already <code>"argon2"</code> — that is the just-in-time upgrade. <code>static String resolveUser(String legacyId, String newSub, java.util.Map&lt;String,String&gt; mapping)</code> returns <code>newSub</code> when non-null, else the mapped value for <code>legacyId</code>, else null.`,
starter:`import java.util.*;
import java.util.function.BiPredicate;

public class Migration {
    static boolean verifyLegacy(String storedAlgo, String presented,
                                BiPredicate<String,String> legacyCheck,
                                BiPredicate<String,String> modernCheck) {
        return false;
    }
    static boolean shouldRehash(String storedAlgo, boolean loginSucceeded) {
        return false;
    }
    static String resolveUser(String legacyId, String newSub, Map<String,String> mapping) {
        return null;
    }
}`,
tests:[{d:'a null password is rejected',re:'presented\\s*==\\s*null|null\\s*==\\s*presented'},{d:'the modern algorithm is recognised',re:'"argon2"'},{d:'the legacy checker is used otherwise',re:'legacyCheck'},{d:'rehash only after a successful login',re:'loginSucceeded'},{d:'already-modern hashes are not rehashed',re:'!\\s*"argon2"\\s*\\.\\s*equals|\\!"argon2"'},{d:'the new subject wins when present',re:'newSub\\s*!=\\s*null|null\\s*!=\\s*newSub'},{d:'otherwise fall back to the mapping table',re:'mapping\\s*\\.\\s*get\\s*\\('}],
behavior:`verifyLegacy("argon2","pw",legacy,modern) uses the modern checker; verifyLegacy("bcrypt","pw",legacy,modern) uses the legacy one, which is what lets you import old hashes untouched. shouldRehash("bcrypt", true) is true, so the account upgrades silently on the user's next login and the population migrates itself. shouldRehash("bcrypt", false) is false, because you only have the plaintext to rehash from when the login actually succeeded, and shouldRehash("argon2", true) is false since it is already current. resolveUser("old@x", "u-1", map) returns u-1; resolveUser("old@x", null, map) returns the mapped id, which is how an app relinks an account instead of showing the user an empty one.`,
hints:['Guard the null password, then branch on the stored algorithm.','Both conditions matter in shouldRehash: the login succeeded AND the algorithm is stale.','A short chain of null checks is enough for resolveUser.'],
solution:`import java.util.*;
import java.util.function.BiPredicate;

public class Migration {
    static boolean verifyLegacy(String storedAlgo, String presented,
                                BiPredicate<String,String> legacyCheck,
                                BiPredicate<String,String> modernCheck) {
        if (presented == null) return false;
        if ("argon2".equals(storedAlgo)) return modernCheck.test(storedAlgo, presented);
        return legacyCheck.test(storedAlgo, presented);   // old hashes imported as-is
    }
    static boolean shouldRehash(String storedAlgo, boolean loginSucceeded) {
        // only on success: that is the one moment you hold the plaintext
        return loginSucceeded && !"argon2".equals(storedAlgo);
    }
    static String resolveUser(String legacyId, String newSub, Map<String,String> mapping) {
        if (newSub != null) return newSub;
        if (legacyId == null || mapping == null) return null;
        return mapping.get(legacyId);   // relink, rather than serve an empty account
    }
}`}},

{id:'run3',title:'The IdP is the blast radius: availability and break-glass',body:`
<p>Federation concentrates authentication into one system on purpose — one place for MFA, one place to
deprovision. The unavoidable corollary is that <b>the IdP becomes a single point of failure for
everything</b>. When it is down, nobody logs into anything: not the app, not the monitoring, not the
ticketing system you would use to coordinate the response.</p>
<p>This is the risk nobody writes down when they propose SSO, and it is worth writing down.</p>

<h4>What "the IdP is down" actually means</h4>
<p>The failure is not uniform, and the distinction decides how bad the day is:</p>
<div class="codeSample" data-hl>WHAT FAILS                 WHO NOTICES                  IMMEDIATE?
authorization endpoint     anyone LOGGING IN            new logins fail
                           existing sessions fine       degrades over hours
token endpoint             refreshes fail               degrades over minutes
JWKS endpoint              anyone VERIFYING a token     only when caches expire
                                                        (cached keys keep working)
the directory behind it    everything                   immediate and total

// the shape of it: existing sessions survive, new ones do not. an outage
// therefore looks small for the first hour and then grows.</div>
<p>Two design consequences follow. <b>Cache JWKS aggressively</b> and serve stale keys on fetch failure
— a verifier that hard-fails when it cannot reach JWKS turns an IdP blip into a total outage of every
API. And <b>longer sessions degrade more gracefully</b>, which is a genuine tension with the short
lifetimes that incident response wants. Name the trade-off rather than pretending it does not exist.</p>

<h4>Break-glass accounts</h4>
<p>You need a way in when the IdP is unavailable or compromised. That means a small number of accounts
that <i>do not depend on it</i> — and they are dangerous by construction, so the controls carry the
weight:</p>
<ul>
<li><b>Excluded from conditional access and federation</b> — otherwise they fail exactly when needed.</li>
<li><b>Phishing-resistant</b> — a hardware key, or credentials split between two people.</li>
<li><b>Stored physically</b>, in a safe, not in the password manager that requires SSO to open.</li>
<li><b>Alerted on every use</b>, to a channel that does not require the IdP to read.</li>
<li><b>Tested quarterly.</b> An untested break-glass account has usually expired, been disabled by a
cleanup script, or lost its password.</li>
</ul>
<p>The recursive failure is the one to design out: your emergency credentials must not live behind the
thing they exist to bypass. Password manager behind SSO, alerting into a chat tool behind SSO,
documentation in a wiki behind SSO — all common, all useless during the incident.</p>

<h4>Degraded modes worth having</h4>
<ol>
<li><b>Serve stale JWKS</b> rather than failing verification.</li>
<li><b>Extend session lifetime</b> during an incident, deliberately and reversibly.</li>
<li><b>Read-only mode</b> — accept existing sessions, defer anything requiring re-authentication.</li>
<li><b>A second region or a standby IdP</b> if the business case justifies it, remembering that
identity data replication is itself a security boundary.</li>
</ol>

<h4>The questions to answer before you need to</h4>
<p>How does an on-call engineer reach production if the IdP is down? Does your incident channel require
SSO? Can you extend session lifetimes without a deploy? Does verification survive a JWKS outage? When
was break-glass last tested, and by whom? If any answer is unknown, that is the work — and it is
cheaper to find out now than at 3am, when nobody can log in to look it up.</p>`,
docs:[['Google SRE — Managing Critical State','https://sre.google/sre-book/managing-critical-state/'],['Microsoft — Manage emergency access accounts','https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/security-emergency-access'],['RFC 7517 — JSON Web Key Set','https://www.rfc-editor.org/rfc/rfc7517']],
ex:{title:'Degrade gracefully when the IdP is unreachable',
prompt:`Write <code>Resilience</code> with three methods. <code>static boolean verifyWithCache(boolean jwksReachable, boolean haveCachedKeys, boolean signatureValid)</code> returns <code>signatureValid</code> whenever cached keys are available — reachable or not — and <code>false</code> only when JWKS is unreachable and nothing is cached. <code>static boolean breakGlassUsable(boolean dependsOnIdp, boolean phishingResistant, boolean storedOffline)</code> is true only when it does <b>not</b> depend on the IdP and both other conditions hold. <code>static boolean shouldAlert(boolean breakGlassUsed)</code> simply returns <code>breakGlassUsed</code> — every use is an alert, with no exceptions.`,
starter:`public class Resilience {
    static boolean verifyWithCache(boolean jwksReachable, boolean haveCachedKeys, boolean signatureValid) {
        return false;
    }
    static boolean breakGlassUsable(boolean dependsOnIdp, boolean phishingResistant, boolean storedOffline) {
        return false;
    }
    static boolean shouldAlert(boolean breakGlassUsed) {
        return false;
    }
}`,
tests:[{d:'cached keys keep verification working',re:'haveCachedKeys'},{d:'the signature still decides the outcome',re:'signatureValid'},{d:'no keys at all means failure',re:'return\\s+false'},{d:'break-glass must not depend on the IdP',re:'!\\s*dependsOnIdp|dependsOnIdp\\s*==\\s*false'},{d:'break-glass must be phishing-resistant',re:'phishingResistant'},{d:'break-glass must be stored offline',re:'storedOffline'},{d:'every break-glass use alerts',re:'return\\s+breakGlassUsed'}],
behavior:`verifyWithCache(false, true, true) is true — an unreachable JWKS endpoint must not break token verification, or one IdP blip becomes a total outage of every API. verifyWithCache(false, false, true) is false, since with no keys at all there is nothing to verify against. verifyWithCache(true, true, false) is false because the signature still has to be valid. breakGlassUsable(false, true, true) is true; breakGlassUsable(true, true, true) is false, which is the recursive failure to design out - emergency credentials must not live behind the thing they exist to bypass. shouldAlert(true) is true, always.`,
hints:['If cached keys exist, the signature decides; otherwise reachability decides.','Three conditions in breakGlassUsable, and the first is a negation.','shouldAlert is one line, and the point is that there is no exception to it.'],
solution:`public class Resilience {
    static boolean verifyWithCache(boolean jwksReachable, boolean haveCachedKeys, boolean signatureValid) {
        // serve stale keys rather than hard-failing every API call
        if (haveCachedKeys) return signatureValid;
        return false;   // unreachable and uncached: nothing to verify against
    }
    static boolean breakGlassUsable(boolean dependsOnIdp, boolean phishingResistant, boolean storedOffline) {
        // must not live behind the system it exists to bypass
        return !dependsOnIdp && phishingResistant && storedOffline;
    }
    static boolean shouldAlert(boolean breakGlassUsed) {
        return breakGlassUsed;   // no exceptions
    }
}`}},

{id:'run4',title:'What to measure, what to log, what never to log',body:`
<p>Identity is unusually measurable and unusually badly measured. Most teams watch uptime and nothing
else, so they cannot answer the questions that matter: is login getting worse, how much of the estate
is actually protected, how long does it take for a leaver to lose access.</p>

<h4>The metrics that change decisions</h4>
<div class="codeSample" data-hl>EXPERIENCE
  login success rate            the headline. a drop is an outage users feel
                                before any dashboard shows red
  time to first successful auth  p50/p95 — the redirect chain is 4+ hops
  MFA prompt rate               too high means fatigue and workarounds
  password reset rate           a proxy for friction AND for phishing

COVERAGE — the ones auditors ask for
  % accounts with MFA           and specifically with PHISHING-RESISTANT MFA
  % apps behind SSO             the un-federated tail is your real risk
  orphaned accounts             no owner, still enabled
  time to deprovision           leaver event -> access actually gone (hours? weeks?)
  stale credentials             API keys and service accounts unused for 90 days

SECURITY
  impossible-travel / anomaly hits
  failed logins per account and per IP    (two very different signals)
  break-glass usage                       should be zero, alert on non-zero
  token validation failures by reason     a spike in "bad signature" is not routine</div>
<p><b>Time to deprovision</b> is the one to instrument first if you instrument nothing else. It is the
number audits actually fail on, and it is usually far worse than anyone assumes — measure it before
claiming it.</p>

<h4>SLOs worth setting</h4>
<p>Two are genuinely useful: <b>login success rate</b> above some threshold (with the denominator
defined carefully — abandoned logins are not failures), and <b>authentication latency</b> at p95. Both
are user-visible, both degrade before an outage, and both give you a budget conversation rather than an
argument about whether the IdP was "up".</p>

<h4>What to log</h4>
<p>Every authentication decision needs enough context to reconstruct it: who, when, from where, which
method, which client, which session, and <b>why it failed</b>. That last one is where most identity
logging is useless — "login failed" tells an investigator nothing.</p>
<div class="codeSample" data-hl>{ "event": "auth.failed",
  "sub": "u-4817",
  "client_id": "orders-web",
  "method": "webauthn",
  "reason": "origin_mismatch",        // the field that makes this worth keeping
  "session_id": "sess-abc",
  "correlation_id": "req-7f3a",       // ties the redirect chain together
  "ip": "203.0.113.7",
  "ts": "2026-08-12T21:40:00Z" }</div>
<p>A <b>correlation id</b> spanning the whole redirect chain is the highest-value single field. An OIDC
login crosses the app, the IdP, and back, and without a shared id you cannot follow one user's failure
through three systems.</p>

<h4>What must never be logged</h4>
<ul>
<li><b>Passwords</b> — including in failed-login events, where they end up most often, and including
"near misses" people log while debugging.</li>
<li><b>Whole tokens.</b> A log containing access tokens is a credential store with no access control.
Log a prefix or a hash.</li>
<li><b>Authorization codes, PKCE verifiers, session cookies, API keys, capability URLs</b> — same
reasoning.</li>
<li><b>Biometric templates</b>, ever.</li>
</ul>
<p>The recurring pattern is a middleware that dumps request headers on error. It is invisible until an
incident, when you discover your log platform — which has broader access than production — has been
accumulating bearer tokens for two years. Redact at the logging layer, not at each call site, so it
cannot be forgotten.</p>
<p>And treat <b>identity log retention</b> as a security decision. These logs are often the shortest-
retained and the first needed; an investigation that can only see seven days cannot establish when an
attacker first got in.</p>`,
docs:[['OWASP — Logging Cheat Sheet','https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html'],['Google SRE — Service Level Objectives','https://sre.google/sre-book/service-level-objectives/'],['RFC 9068 — JWT Profile for OAuth 2.0 Access Tokens','https://www.rfc-editor.org/rfc/rfc9068']],
ex:{title:'Redact before logging',
prompt:`Write <code>AuthLog</code> with three methods. <code>static boolean loggable(String field)</code> returns false for <code>"password"</code>, <code>"access_token"</code>, <code>"refresh_token"</code>, <code>"code_verifier"</code>, <code>"session_cookie"</code> and <code>"biometric_template"</code>, and true for anything else including null-safe handling. <code>static String redact(String field, String value)</code> returns the value unchanged when the field is loggable; otherwise it returns the first 6 characters plus <code>"..."</code>, or <code>"[redacted]"</code> when the value is null or shorter than 6. <code>static boolean investigable(java.util.Set&lt;String&gt; fields)</code> requires the set to contain <code>"reason"</code> and <code>"correlation_id"</code> — the two fields that make a failure reconstructable.`,
starter:`import java.util.*;

public class AuthLog {
    static boolean loggable(String field) {
        return false;
    }
    static String redact(String field, String value) {
        return null;
    }
    static boolean investigable(Set<String> fields) {
        return false;
    }
}`,
tests:[{d:'passwords are never logged',re:'"password"'},{d:'access tokens are never logged',re:'"access_token"'},{d:'PKCE verifiers are never logged',re:'"code_verifier"'},{d:'biometric templates are never logged',re:'"biometric_template"'},{d:'other fields are loggable',re:'return\\s+true'},{d:'redaction keeps only a short prefix',re:'substring\\s*\\(\\s*0\\s*,\\s*6\\s*\\)'},{d:'short or missing values are fully redacted',re:'"\\[redacted\\]"'},{d:'the failure reason must be present',re:'"reason"'},{d:'a correlation id must be present',re:'"correlation_id"'}],
behavior:`loggable("client_id") and loggable("method") are true; loggable("password") and loggable("access_token") are false. redact("client_id","orders-web") returns orders-web unchanged. redact("access_token","eyJhbGciOiJSUzI1NiJ9...") returns eyJhbG..., which is enough to correlate an incident without putting a working credential in a log platform that usually has broader access than production. redact("password", null) returns [redacted]. investigable(Set.of("sub","reason","correlation_id")) is true, while a set missing either is false — "login failed" with no reason tells an investigator nothing, and without a correlation id you cannot follow one login across the app, the IdP and back.`,
hints:['A switch listing the six forbidden fields, returning false, with <code>default: return true;</code>.','Check <code>loggable</code> first in redact, then guard the length before slicing.','<code>fields != null &amp;&amp; fields.contains("reason") &amp;&amp; fields.contains("correlation_id")</code>'],
solution:`import java.util.*;

public class AuthLog {
    static boolean loggable(String field) {
        if (field == null) return true;
        switch (field) {
            case "password":
            case "access_token":
            case "refresh_token":
            case "code_verifier":
            case "session_cookie":
            case "biometric_template":
                return false;
            default:
                return true;
        }
    }
    static String redact(String field, String value) {
        if (loggable(field)) return value;
        // enough to correlate, useless to anyone who reads the log
        if (value == null || value.length() < 6) return "[redacted]";
        return value.substring(0, 6) + "...";
    }
    static boolean investigable(Set<String> fields) {
        // why it failed, and how to follow it across systems
        return fields != null && fields.contains("reason") && fields.contains("correlation_id");
    }
}`}},

{id:'run5',title:'Testing identity: the part everyone skips',body:`
<p>Authentication is the one code path every user takes and almost nobody tests properly. The reasons
are understandable — it spans systems you do not control, it involves a browser, and the happy path
"works on my machine". The result is that identity bugs are found in production by users who cannot log
in.</p>

<h4>Why it is genuinely awkward</h4>
<ul>
<li>The flow crosses your app, a browser, and a third-party IdP.</li>
<li>It depends on redirects, cookies and browser behaviour, so unit tests miss most of it.</li>
<li>Real IdPs rate-limit, require MFA, and have no API to create a hundred test users.</li>
<li>Tokens expire, so recorded fixtures rot.</li>
</ul>

<h4>What to test at each level</h4>
<div class="codeSample" data-hl>UNIT — no network. the highest-value tests, and the cheapest.
  token validation: expired, wrong aud, wrong iss, bad signature,
    alg:none, missing claims, clock skew at the boundary
  authorization: ownership checks, scope checks, deny by default
  PKCE: verifier/challenge, and the DOWNGRADE (no verifier presented)

INTEGRATION — against a MOCK IdP you control
  full redirect flow, state and nonce round-trip
  refresh, and refresh-token reuse detection
  logout and session invalidation

END-TO-END — a real IdP in a test tenant, a small number of cases
  one happy path per client type. that is enough: E2E is for wiring,
  not for logic.</div>
<p>The temptation is to invert this — a few E2E tests and nothing underneath. It is the wrong shape:
E2E tests are slow, flaky and prove only that the wiring is connected, while the bugs that matter are
in validation logic that a unit test catches in milliseconds.</p>

<h4>Test the failures, not the happy path</h4>
<p>The happy path breaks loudly and someone notices. The dangerous cases are the ones that fail
<i>open</i>, and each is a one-line test:</p>
<ul>
<li>A token with the right signature but the <b>wrong audience</b> — is it rejected?</li>
<li>A token with <code>"alg":"none"</code> — rejected?</li>
<li>An <b>expired</b> token, and one expiring exactly now.</li>
<li>A code redemption with the <b>verifier omitted</b> — the PKCE downgrade.</li>
<li>A <b>reused</b> refresh token — does reuse detection fire?</li>
<li>A record belonging to <b>another tenant</b> — the IDOR test, which almost nobody writes.</li>
<li>A <b>missing</b> scope claim entirely — deny, not allow.</li>
</ul>
<p>If a bug of this class ever reaches production, the fix is not just the patch — it is the test, so
the failure mode cannot return.</p>

<h4>Mock IdPs and test data</h4>
<p>Run a lightweight IdP in CI and sign tokens with a <b>test key pair you generate</b>. That gives you
what a real IdP will not: tokens that are expired, malformed, wrongly-audienced or wrongly-signed, on
demand and deterministically.</p>
<p>Two rules. <b>Never point tests at production</b>, and never let a production key exist anywhere test
code can reach. And <b>never disable authentication in a test environment</b> — the "auth off in dev"
switch has a habit of shipping, and it means the path you tested is not the path you run.</p>
<p>Finally, if you take away one habit: <b>write the test when you write the check</b>. Every validation
step in the token checklist is a test case, and the checklist is only real if something enforces it.</p>`,
docs:[['OWASP — Web Security Testing Guide: Authentication','https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/04-Authentication_Testing/'],['OAuth 2.0 Security Best Current Practice','https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics'],['Martin Fowler — The Practical Test Pyramid','https://martinfowler.com/articles/practical-test-pyramid.html']],
ex:{title:'The negative-path checklist',
prompt:`Write <code>AuthTests</code> with three methods. <code>static boolean isNegativeCase(String scenario)</code> returns true for <code>"wrong-audience"</code>, <code>"alg-none"</code>, <code>"expired"</code>, <code>"pkce-downgrade"</code>, <code>"refresh-reuse"</code>, <code>"cross-tenant"</code> and <code>"missing-scope"</code>, and false otherwise including null. <code>static String level(String scenario)</code> returns <code>"unit"</code> for <code>"wrong-audience"</code>, <code>"alg-none"</code> and <code>"expired"</code>, <code>"integration"</code> for <code>"pkce-downgrade"</code> and <code>"refresh-reuse"</code>, and <code>"e2e"</code> for <code>"happy-path"</code>; anything else returns <code>"unit"</code>, because the default belongs at the cheapest level. <code>static boolean suiteAdequate(java.util.Set&lt;String&gt; covered)</code> requires <code>"wrong-audience"</code>, <code>"expired"</code> and <code>"cross-tenant"</code> to all be present.`,
starter:`import java.util.*;

public class AuthTests {
    static boolean isNegativeCase(String scenario) {
        return false;
    }
    static String level(String scenario) {
        return null;
    }
    static boolean suiteAdequate(Set<String> covered) {
        return false;
    }
}`,
tests:[{d:'wrong audience is a negative case',re:'"wrong-audience"'},{d:'alg none is a negative case',re:'"alg-none"'},{d:'the PKCE downgrade is a negative case',re:'"pkce-downgrade"'},{d:'cross-tenant access is a negative case',re:'"cross-tenant"'},{d:'validation cases belong at unit level',re:'"unit"'},{d:'flow cases belong at integration level',re:'"integration"'},{d:'the happy path is the e2e case',re:'"e2e"'},{d:'the suite must cover the IDOR case',re:'contains\\s*\\(\\s*"cross-tenant"\\s*\\)'}],
behavior:`isNegativeCase("wrong-audience") and isNegativeCase("cross-tenant") are true; isNegativeCase("happy-path") and isNegativeCase(null) are false. level("expired") is unit, because token validation needs no network and is the cheapest place to catch a fail-open bug. level("refresh-reuse") is integration, since it needs a mock IdP to issue and reuse a token. level("happy-path") is e2e — end-to-end tests prove the wiring is connected, not that the logic is right. suiteAdequate(Set.of("wrong-audience","expired","cross-tenant")) is true; dropping cross-tenant makes it false, and that is the test almost nobody writes even though IDOR tops the API security risks.`,
hints:['One switch for the seven negative scenarios, another for the level mapping.','The level default is "unit", not "unknown" — push tests down the pyramid.','<code>covered != null &amp;&amp; covered.containsAll(...)</code> also works for the last one.'],
solution:`import java.util.*;

public class AuthTests {
    static boolean isNegativeCase(String scenario) {
        if (scenario == null) return false;
        switch (scenario) {
            case "wrong-audience":
            case "alg-none":
            case "expired":
            case "pkce-downgrade":
            case "refresh-reuse":
            case "cross-tenant":
            case "missing-scope":
                return true;    // the cases that fail OPEN if unhandled
            default:
                return false;
        }
    }
    static String level(String scenario) {
        if (scenario == null) return "unit";
        switch (scenario) {
            case "pkce-downgrade":
            case "refresh-reuse":
                return "integration";   // needs a mock IdP
            case "happy-path":
                return "e2e";           // proves wiring, not logic
            default:
                return "unit";          // cheapest level wins by default
        }
    }
    static boolean suiteAdequate(Set<String> covered) {
        if (covered == null) return false;
        return covered.contains("wrong-audience")
            && covered.contains("expired")
            && covered.contains("cross-tenant");
    }
}`}},

{id:'run6',title:'Diagnosing identity failures: a systematic method',body:`
<p>Identity bugs are disproportionately hard to debug for one structural reason: <b>the failure is
almost never where the error appears</b>. A login breaks in the browser, but the cause is a
configuration value in an IdP you do not administer, three redirects earlier. Guessing is expensive.
A method is not.</p>

<h4>Start by locating the failure in the chain</h4>
<p>Every federated login is the same shape. Before theorising, find out <i>how far it got</i>:</p>
<div class="codeSample" data-hl>1  app  -> browser: redirect to /authorize
2  browser -> IdP: the authorization request
3  IdP: authenticates the user  (MFA here)
4  IdP -> browser: redirect back with a code
5  browser -> app: the callback
6  app  -> IdP: POST /token   (back channel — invisible in the browser)
7  app: validates the token, creates a session
8  app: authorizes the request

// find the LAST step that worked. that alone eliminates most hypotheses.
</div>

<h4>Where each failure actually lives</h4>
<p>Once you know the last successful step, the cause is nearly always in a small set:</p>
<div class="codeSample" data-hl>SYMPTOM                          LOOK AT
never reaches the IdP            client_id wrong, discovery doc unreachable
"invalid redirect_uri"           registered value vs sent value — EXACT match,
                                 including trailing slash, port and scheme
loops between app and IdP        the app cannot set or read its cookie:
                                 SameSite, Secure over http, domain mismatch
back at the app, "invalid state" state not stored (multi-instance app with no
                                 shared session), or the browser dropped it
token endpoint 401               client auth: wrong secret, or a confidential
                                 client sending nothing
token endpoint "invalid_grant"   code already used, expired, or the
                                 redirect_uri differs from step 2. also the
                                 PKCE verifier not matching
token validates, user is wrong   keyed on email instead of sub
403 AFTER a successful login     authorization, not authentication. stop
                                 looking at the IdP.</div>
<p>That last row is worth internalising. "Login is broken" reported by a user very often means
<i>authorization</i> is broken — they authenticated fine and then could not see something. The two
have entirely different owners and entirely different fixes.</p>

<h4>The five questions that resolve most incidents</h4>
<ol>
<li><b>Everyone, or one user?</b> One user points at data — their account state, their group
membership, their enrolled factors. Everyone points at configuration or a key.</li>
<li><b>New users only, or existing sessions too?</b> Existing sessions surviving means the
<i>authorization</i> path broke, not verification. Both broken means keys or the directory.</li>
<li><b>What changed?</b> Identity breaks on change: a rotated key, a renewed certificate, a config
push, a library upgrade, or a browser release. If nothing changed on your side, something expired.</li>
<li><b>One app, or all apps?</b> One app is that client's registration. All apps is the IdP.</li>
<li><b>Does the clock agree?</b> Skew produces "token not yet valid" and expiry errors that look
random, and it is invisible unless you check.</li>
</ol>

<h4>Read the actual artefacts</h4>
<p>Do not debug from the error message alone. The evidence is available and specific:</p>
<ul>
<li><b>Decode the token.</b> Look at <code>iss</code>, <code>aud</code>, <code>exp</code>,
<code>sub</code> and <code>kid</code> with your own eyes. Most "the token is invalid" incidents are
visible in ten seconds this way — usually an <code>aud</code> naming a different service, or a
<code>kid</code> not in the JWKS.</li>
<li><b>Fetch the JWKS yourself</b> and check the <code>kid</code> is there. A rotated key with a stale
cache is a classic.</li>
<li><b>Capture the redirect chain</b> in browser devtools with "preserve log" on, so the redirects are
not wiped. Compare the <code>redirect_uri</code> sent against the one registered, character by
character.</li>
<li><b>Check the cookie</b> in the response: is it actually set, with what flags, on what domain.</li>
<li><b>Read the IdP's own logs.</b> Its failure reason is usually far more precise than the generic
error it returns to the browser, which is deliberately vague to avoid leaking information.</li>
</ul>

<h4>The expiry class of bug</h4>
<p>A large share of identity incidents have no trigger at all on your side — something simply reached
its expiry: a signing certificate, a SAML metadata certificate, a client secret, a TLS certificate, a
CRL. These fail suddenly, completely, and at whatever hour they were issued years earlier. The
diagnostic tell is that nothing changed and it broke anyway. The fix is monitoring expiry dates as a
first-class alert, well before the day.</p>`,
docs:[['OAuth 2.0 error responses (RFC 6749 §5.2)','https://www.rfc-editor.org/rfc/rfc6749#section-5.2'],['MDN — Set-Cookie SameSite','https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite'],['jwt.io — decode a token','https://jwt.io/']],
ex:{title:'Triage from the symptom',
prompt:`Write <code>Triage</code> with three methods. <code>static String suspect(String symptom)</code> maps a symptom to where to look: <code>"invalid-redirect-uri"</code> and <code>"invalid-client"</code> return <code>"client-registration"</code>; <code>"login-loop"</code> and <code>"missing-state"</code> return <code>"cookies"</code>; <code>"invalid-grant"</code> and <code>"bad-signature"</code> return <code>"token-exchange"</code>; <code>"403-after-login"</code> returns <code>"authorization"</code>; anything else returns <code>"unknown"</code>. <code>static boolean idpSideIssue(boolean allUsers, boolean allApps)</code> is true only when both are true. <code>static boolean likelyExpiry(boolean nothingChanged, boolean brokeSuddenly)</code> is true only when both hold — the signature of a certificate or secret reaching its expiry.`,
starter:`public class Triage {
    static String suspect(String symptom) {
        return null;
    }
    static boolean idpSideIssue(boolean allUsers, boolean allApps) {
        return false;
    }
    static boolean likelyExpiry(boolean nothingChanged, boolean brokeSuddenly) {
        return false;
    }
}`,
tests:[{d:'redirect errors point at the registration',re:'"client-registration"'},{d:'login loops point at cookies',re:'"cookies"'},{d:'grant errors point at the token exchange',re:'"token-exchange"'},{d:'a 403 after login is authorization',re:'"authorization"'},{d:'unknown symptoms fall through',re:'"unknown"'},{d:'an IdP-side issue affects everyone everywhere',re:'allUsers\\s*&&\\s*allApps|allApps\\s*&&\\s*allUsers'},{d:'expiry is suspected when nothing changed',re:'nothingChanged'}],
behavior:`suspect("invalid-redirect-uri") returns client-registration, because redirect URIs are matched by exact string and a trailing slash is enough to break it. suspect("login-loop") returns cookies: the app cannot set or read its own cookie, usually SameSite or a domain mismatch. suspect("403-after-login") returns authorization — the user authenticated perfectly well, so the IdP is the wrong place to look, which is the most commonly misdiagnosed case. idpSideIssue(true,true) is true; if only one app is affected it is that client's registration, and if only one user is affected it is their account data. likelyExpiry(true,true) is true: nothing changed and it broke anyway is the signature of a certificate or secret reaching its expiry.`,
hints:['One switch with four groups of cases and a default of "unknown".','Both flags must be true for an IdP-side conclusion — narrow either one and the answer changes.','likelyExpiry is a single && of its two arguments.'],
solution:`public class Triage {
    static String suspect(String symptom) {
        if (symptom == null) return "unknown";
        switch (symptom) {
            case "invalid-redirect-uri":
            case "invalid-client":
                return "client-registration";
            case "login-loop":
            case "missing-state":
                return "cookies";
            case "invalid-grant":
            case "bad-signature":
                return "token-exchange";
            case "403-after-login":
                return "authorization";   // authentication worked: wrong place to look
            default:
                return "unknown";
        }
    }
    static boolean idpSideIssue(boolean allUsers, boolean allApps) {
        // one app -> that client's config. one user -> their account data.
        return allUsers && allApps;
    }
    static boolean likelyExpiry(boolean nothingChanged, boolean brokeSuddenly) {
        // no trigger on your side: something reached its expiry date
        return nothingChanged && brokeSuddenly;
    }
}`}},

{id:'run7',title:'"3am, I got paged": working an identity incident',body:`
<p>Everything so far has been method. This is the shape of the night itself — what the first ten
minutes look like, what to do in what order, and the specific traps of identity incidents that other
outages do not have.</p>

<h4>The first thing to establish: outage or attack?</h4>
<p>They demand opposite reflexes. An <b>outage</b> wants you to restore service fast. An <b>attack</b>
wants you to preserve evidence and contain before restoring — and restoring carelessly can destroy the
only record of what happened, or hand access straight back.</p>
<div class="codeSample" data-hl>LOOKS LIKE AN OUTAGE            LOOKS LIKE AN ATTACK
everyone equally affected       a few accounts, oddly chosen
started at a deploy or expiry   started at no particular time
failures are uniform            successes where there should be failures
error rate up                   error rate NORMAL, but unusual activity
nothing was created             new clients, keys, factors, or trusts appeared

// when unsure, treat it as an attack for the first ten minutes. it is
// cheap to relax that stance, and impossible to un-destroy evidence.</div>

<h4>The first ten minutes</h4>
<ol>
<li><b>Can you get in?</b> If the IdP is down, your tooling may be too. This is the moment break-glass
exists for. Establish access before anything else.</li>
<li><b>Scope it.</b> One app or all? One user or everyone? New logins or existing sessions too? Three
questions, and they cut the hypothesis space enormously.</li>
<li><b>What changed?</b> Deploys, config pushes, key rotations, certificate expiries, vendor status
page. Identity rarely breaks spontaneously.</li>
<li><b>Declare and communicate.</b> Say what is broken and what still works. "You cannot log in, but if
you are already logged in you are fine" is genuinely useful to thousands of people, and it stops the
support flood that otherwise consumes the responder.</li>
<li><b>Decide: contain or restore.</b> Consciously, and say which you chose.</li>
</ol>

<h4>Traps specific to identity incidents</h4>
<ul>
<li><b>Your tools are behind the thing that is broken.</b> The runbook is in the wiki behind SSO, the
alert went to the chat tool behind SSO, the password manager needs SSO. Check this on a quiet day.</li>
<li><b>The fix invalidates everyone.</b> Rotating a signing key logs out the entire company. Sometimes
correct — but it converts a partial outage into a total one, so do it deliberately, not reflexively.</li>
<li><b>Restarting hides the evidence.</b> A rolling restart clears in-memory session state and the
attacker's foothold with it, along with your ability to see what they did.</li>
<li><b>The blast radius exceeds your team.</b> Identity failure takes down systems owned by people who
have no idea you exist. Communicate wider than feels necessary.</li>
<li><b>Password resets are not containment.</b> If the attacker enrolled an authenticator, added an API
key or created a client, a reset changes nothing. Hunt persistence before declaring it over.</li>
</ul>

<h4>A worked example</h4>
<p><b>02:47</b> — page: login success rate has fallen from 99.4% to 12%.</p>
<p><b>02:49</b> — scope. Every app. New logins fail; existing sessions still work. So verification of
new tokens is failing, or the IdP cannot issue them. Not authorization.</p>
<p><b>02:52</b> — what changed? No deploys. Vendor status page green. Someone checks certificate
expiries: the IdP's token-signing certificate expired at 02:00 UTC.</p>
<p><b>02:55</b> — outage, not attack: uniform, coincides with an expiry, nothing created. Switch to
restore-fast.</p>
<p><b>02:58</b> — communicate: "New logins are failing. If you are already signed in you are
unaffected. ETA 30 minutes." That single message prevents most of the incoming.</p>
<p><b>03:10</b> — renew the certificate, publish it, confirm the new <code>kid</code> is in JWKS.</p>
<p><b>03:20</b> — relying parties still failing: they cached the old JWKS. Force refetch where possible;
otherwise the cache TTL is the recovery time, which is now a documented finding.</p>
<p><b>03:40</b> — recovered. Nobody was logged out, because existing sessions were never affected.</p>
<p><b>The follow-ups are the point:</b> alert on certificate expiry at 30 days, not at expiry; cap JWKS
cache TTL and serve stale on failure; document that certificate renewal is a change requiring the same
care as a deploy. An incident that produces no change to the system will happen again.</p>

<h4>Afterwards</h4>
<p>Blameless review, and one identity-specific addition to the usual questions: <b>what would have made
this five minutes shorter?</b> For identity the answer is almost always the same small set — a metric
that would have shown it sooner, an expiry alert, a runbook not behind SSO, or a rehearsed key
rotation. Those are the actions. "Be more careful" is not.</p>`,
docs:[['Google SRE — Managing Incidents','https://sre.google/sre-book/managing-incidents/'],['Google SRE — Postmortem Culture','https://sre.google/sre-book/postmortem-culture/'],['NIST SP 800-61 — Incident Handling','https://csrc.nist.gov/pubs/sp/800/61/r2/final']],
ex:{title:'First-ten-minutes triage',
prompt:`Write <code>Paged</code> with three methods. <code>static String posture(boolean uniformFailure, boolean newArtifactsCreated)</code> returns <code>"attack"</code> whenever new artifacts were created (clients, keys, factors, trusts), otherwise <code>"outage"</code> when the failure is uniform, otherwise <code>"attack"</code> — an unexplained non-uniform failure is treated as an attack until shown otherwise. <code>static String scope(boolean allApps, boolean existingSessionsWork)</code> returns <code>"authorization"</code> when existing sessions still work and only one app is affected, <code>"token-issuance"</code> when existing sessions work and all apps are affected, and <code>"total"</code> when existing sessions are broken too. <code>static boolean safeToRestart(String posture)</code> is false for <code>"attack"</code> — restarting clears the evidence along with the foothold.`,
starter:`public class Paged {
    static String posture(boolean uniformFailure, boolean newArtifactsCreated) {
        return null;
    }
    static String scope(boolean allApps, boolean existingSessionsWork) {
        return null;
    }
    static boolean safeToRestart(String posture) {
        return false;
    }
}`,
tests:[{d:'created artifacts mean an attack',re:'newArtifactsCreated'},{d:'a uniform failure suggests an outage',re:'"outage"'},{d:'ambiguity defaults to attack',re:'"attack"'},{d:'surviving sessions on one app is authorization',re:'"authorization"'},{d:'surviving sessions across all apps is issuance',re:'"token-issuance"'},{d:'broken sessions mean a total failure',re:'"total"'},{d:'restarting is unsafe during an attack',re:'"attack"\\s*\\.\\s*equals|equals\\s*\\(\\s*"attack"'}],
behavior:`posture(true,false) is outage; posture(true,true) is attack, because a new client, key, factor or federated trust appearing is not something an outage does; posture(false,false) is attack, since an unexplained non-uniform failure is treated as an attack for the first ten minutes - that stance is cheap to relax and evidence is impossible to un-destroy. scope(false,true) is authorization: the user authenticated fine and then could not see something, which is the most commonly misdiagnosed identity symptom. scope(true,true) is token-issuance and scope(true,false) is total. safeToRestart("outage") is true; safeToRestart("attack") is false, because a rolling restart clears in-memory session state and the attacker's foothold together with your ability to see what they did.`,
hints:['Check newArtifactsCreated first — it overrides everything.','In scope, branch on existingSessionsWork first, then on allApps.','<code>return !"attack".equals(posture);</code>'],
solution:`public class Paged {
    static String posture(boolean uniformFailure, boolean newArtifactsCreated) {
        if (newArtifactsCreated) return "attack";   // outages do not create clients or keys
        if (uniformFailure) return "outage";
        return "attack";                            // unexplained: assume the worse one
    }
    static String scope(boolean allApps, boolean existingSessionsWork) {
        if (!existingSessionsWork) return "total";
        return allApps ? "token-issuance" : "authorization";
    }
    static boolean safeToRestart(String posture) {
        // a restart destroys the foothold and the evidence together
        return !"attack".equals(posture);
    }
}`}},

{id:'run8',title:'Changing identity safely: rollout, rollback and continuity',body:`
<p>Identity changes are uniquely unforgiving. A bad deploy in most systems degrades a feature; a bad
identity change means nobody can log in, including the people who would fix it. And a change that
breaks <i>authentication</i> is loud, while a change that quietly breaks <i>authorization</i> can leave
data exposed for weeks. Both deserve more care than a normal release.</p>

<h4>Why rollback is harder here</h4>
<p>Ordinary deployments roll back cleanly because the previous version is still valid. Identity changes
often leave state behind that outlives the revert:</p>
<div class="codeSample" data-hl>CHANGE                        WHAT SURVIVES A ROLLBACK
rotate the signing key        tokens signed with the NEW key, still in the wild
change the RP ID              every passkey registered under it — permanently
migrate password hashes       accounts already rehashed (one-way)
change the sub claim format   every app that stored the new identifier
tighten a scope               tokens already issued with the old semantics
enable MFA enforcement        enrollments users already completed (harmless)

// the pattern: anything you ISSUED or anything a user ENROLLED does not
// roll back with your config. plan the reverse path before the forward one.</div>
<p>The practical rule: for any identity change, ask <b>"what will exist after this that did not before,
and what happens to it if I revert?"</b> If the answer is "it breaks", you need a forward fix rather
than a rollback, and you should know that before you start.</p>

<h4>Rolling out safely</h4>
<ol>
<li><b>Additive first.</b> Publish the new key alongside the old; accept both the old and new
identifier; support the new and old client auth method. Only remove the old thing after the new one is
proven — a two-phase change with a gap is what makes a revert possible at all.</li>
<li><b>Ring by ring.</b> Yourself, then your team, then a friendly department, then everyone. Identity
affects every human in the organisation, so a 1% rollout is still hundreds of people.</li>
<li><b>Watch the right signal.</b> Login success rate, not CPU. And watch it per client — an aggregate
stays green while one app is completely broken.</li>
<li><b>Never change two things at once.</b> Rotating a key during an IdP upgrade means you cannot tell
which one broke it, and you cannot revert one without the other.</li>
<li><b>Have the revert command written down before you start</b>, and know how long it takes to take
effect — cache TTLs mean "revert" is rarely instant.</li>
</ol>

<h4>The authorization change is the dangerous one</h4>
<p>An authentication change fails loudly. An authorization change can fail <i>silently and open</i>: a
policy edit that grants more than intended produces no errors, no alerts and no user complaints —
everything works, for everyone, including people who should not have access.</p>
<p>So authorization changes need a different discipline: diff the <i>effective</i> permissions before
and after, not the policy text; test the negative cases explicitly (the cross-tenant read, the
absent-scope call); and prefer changes that can only reduce access when you are unsure. A policy that
denies too much generates tickets within the hour. One that permits too much generates nothing at all.</p>

<h4>Business continuity</h4>
<p>Beyond individual changes, the continuity questions for identity are concrete and answerable:</p>
<ul>
<li><b>If the IdP is unavailable for four hours, what still works?</b> Existing sessions, if their
lifetime exceeds the outage. That is the whole answer, and it means session lifetime is a continuity
parameter as well as a security one.</li>
<li><b>If the vendor is unavailable for four days?</b> Now it is a business decision: a standby IdP, a
local fallback for critical systems, or accepting the downtime. All three are legitimate; not having
decided is not.</li>
<li><b>If the vendor disappears entirely?</b> Concentration risk. Can you export users, group
memberships and configuration in a usable form? Credentials will not come with you, so re-enrollment is
the plan whether you like it or not.</li>
<li><b>Who can authorise emergency access, and how is that person reached out of hours?</b></li>
</ul>
<p>Test the answers rather than documenting them. A continuity plan nobody has exercised is a
description of what you hope would happen.</p>`,
docs:[['Google SRE — Release Engineering','https://sre.google/sre-book/release-engineering/'],['Microsoft — Entra ID resilience guidance','https://learn.microsoft.com/en-us/entra/architecture/resilience-overview'],['W3C — WebAuthn RP ID','https://www.w3.org/TR/webauthn-2/#rp-id']],
ex:{title:'Is this change reversible?',
prompt:`Write <code>ChangeSafety</code> with three methods. <code>static boolean reversible(String change)</code> returns false for <code>"rp-id-change"</code>, <code>"password-rehash"</code> and <code>"sub-format-change"</code> — each leaves state that outlives a revert — and true otherwise. <code>static boolean additiveRollout(boolean newAcceptedAlongsideOld, boolean oldRemovedImmediately)</code> is true only when the new value is accepted alongside the old and the old is <b>not</b> removed immediately. <code>static boolean needsEffectiveDiff(String changeType)</code> returns true for <code>"authorization"</code>, because an over-permissive policy fails silently and produces no errors, no alerts and no complaints.`,
starter:`public class ChangeSafety {
    static boolean reversible(String change) {
        return false;
    }
    static boolean additiveRollout(boolean newAcceptedAlongsideOld, boolean oldRemovedImmediately) {
        return false;
    }
    static boolean needsEffectiveDiff(String changeType) {
        return false;
    }
}`,
tests:[{d:'an RP ID change is irreversible',re:'"rp-id-change"'},{d:'a password rehash is irreversible',re:'"password-rehash"'},{d:'a subject format change is irreversible',re:'"sub-format-change"'},{d:'other changes are reversible',re:'return\\s+true'},{d:'the new value must be accepted alongside the old',re:'newAcceptedAlongsideOld'},{d:'the old value must not be removed immediately',re:'!\\s*oldRemovedImmediately|oldRemovedImmediately\\s*==\\s*false'},{d:'authorization changes need an effective diff',re:'"authorization"'}],
behavior:`reversible("key-rotation") is true, since publishing a new key alongside the old is a two-phase change with a gap to revert into. reversible("rp-id-change") is false: every passkey registered under the old RP ID is permanently unusable, and no config revert brings them back. reversible("password-rehash") is false because hashing is one-way. additiveRollout(true,false) is true — publish the new thing, keep accepting the old, remove it only once the new one is proven. additiveRollout(true,true) is false, which is the common mistake that makes a revert impossible. needsEffectiveDiff("authorization") is true: an authentication change fails loudly, but a policy that grants more than intended produces no errors at all, so you must diff effective permissions rather than policy text.`,
hints:['A switch listing the three irreversible changes returning false, defaulting to true.','Both conditions in additiveRollout, the second negated.','<code>return "authorization".equals(changeType);</code>'],
solution:`public class ChangeSafety {
    static boolean reversible(String change) {
        if (change == null) return true;
        switch (change) {
            case "rp-id-change":       // passkeys registered under it are gone
            case "password-rehash":    // hashing is one-way
            case "sub-format-change":  // apps stored the new identifier
                return false;
            default:
                return true;
        }
    }
    static boolean additiveRollout(boolean newAcceptedAlongsideOld, boolean oldRemovedImmediately) {
        // two phases with a gap: that gap is what a revert reverts into
        return newAcceptedAlongsideOld && !oldRemovedImmediately;
    }
    static boolean needsEffectiveDiff(String changeType) {
        // over-permissive policy fails silently: no errors, no complaints
        return "authorization".equals(changeType);
    }
}`}},

{id:'run9',title:'Evaluating and recommending an identity solution',body:`
<p>At some point the question stops being technical and becomes "what should we buy, and can you
justify it?" This lesson is a framework for answering that well — the questions that actually
discriminate between options, the ones vendors would rather you did not ask, and how to present a
recommendation a decision-maker can act on.</p>

<h4>The framing mistake to avoid</h4>
<p>Most evaluations start as a feature comparison and end in a spreadsheet where every vendor scores
8/10, because every serious product does OIDC, SAML, SCIM and MFA. Feature grids do not discriminate.</p>
<p><b>Constraints discriminate.</b> The useful question is not "which is best" but "which of these can
actually work here, given what we already have and cannot change quickly?" Start from your own estate,
not from the market.</p>

<h4>The ten questions, in order of how much they narrow the field</h4>
<ol>
<li><b>Who are the users?</b> Workforce, customers (CIAM), business partners (B2B), or machines. This
one answer eliminates most of the market immediately, and the products are genuinely different:
workforce IAM optimises for governance and lifecycle, CIAM for conversion, scale and privacy consent.
A workforce tool used for a consumer product is a common and expensive mistake.</li>
<li><b>What do your applications speak <i>today</i>?</b> Not what you wish. Inventory it: OIDC, SAML,
and then the awkward tail — header-based auth behind a proxy, Kerberos/IWA on the intranet, direct LDAP
binds, an app with a hardcoded password. <b>The tail determines the project, not the modern majority.</b>
Ask every vendor how they handle your three worst applications, by name.</li>
<li><b>Where does identity data come from, and who is authoritative?</b> HR system, AD, several
directories that disagree. If nothing is authoritative today, no product fixes that — it is your work,
and it happens before or during any migration.</li>
<li><b>What is the scale and shape?</b> Users, peak logins per second (not average — Monday 09:00 is
the number), tenant count for B2B, growth. Shape matters more than size: 10,000 employees is a
different system from 10 million consumers with a seasonal spike.</li>
<li><b>What does security actually require?</b> Phishing-resistant MFA, sender-constrained tokens,
FAPI, specific assurance levels, data residency. Write these as requirements before you see a demo, or
you will find yourself wanting whatever was demonstrated well.</li>
<li><b>What does governance require?</b> Access reviews, separation of duties, certification campaigns,
and above all <b>audit evidence in a form your auditor accepts</b>. "It has reporting" is not the same
as "it produces the artefact we are asked for each quarter".</li>
<li><b>What are the operational commitments?</b> SLA and its credits, DR posture and tested RTO, data
residency, support responsiveness at 3am, and the maintenance windows they impose on you.</li>
<li><b>What does it cost — really?</b> Per monthly-active-user or per named user (a huge difference for
consumer products), tier cliffs, and specifically <b>which security features are gated behind the
enterprise tier</b>. Charging extra for SSO, MFA or audit logs is common; price the configuration you
will actually need, not the entry tier.</li>
<li><b>How do you get out?</b> Can you export users, group memberships, application configuration and
audit history in a usable form? Credentials will <i>not</i> come with you — passwords are hashed with
their scheme, and passkeys are bound to their RP ID — so any exit means re-enrollment. Knowing that
before you sign is worth a great deal.</li>
<li><b>Who runs it, and do they exist?</b> A product that assumes a dedicated IAM team is the wrong
product for two engineers who also own three other systems.</li>
</ol>

<h4>Build versus buy</h4>
<p>Be honest in both directions. <b>Building authentication is almost always a false economy</b>: the
protocol is the easy part, and the long tail — MFA, recovery, session management, bot defence, audit,
compliance, keeping pace with the security BCP — is a permanent team. Most "we built our own" estates
are quietly worse and quietly expensive.</p>
<p>The legitimate exceptions are narrow: identity <i>is</i> the product; scale or unit economics make
per-user pricing untenable; or the model is genuinely unusual and no vendor fits. Even then the usual
answer is buy the IdP and build the thin layer around it, rather than building the IdP.</p>

<h4>Scoring without fooling yourself</h4>
<div class="codeSample" data-hl>GATES  (must-have — fail one and the option is OUT, no score)
  handles our legacy auth tail
  meets the residency requirement
  produces the audit evidence we are asked for
  supports phishing-resistant MFA

SCORED (weighted — only for options that pass every gate)
  migration effort        x3   the largest real cost, and the most underestimated
  operational burden      x3   who runs this, every week, forever
  total 3-year cost       x2   licence + migration + run, not licence alone
  governance depth        x2
  developer experience    x1

// never average a gate into the score. a weighted total will happily
// hide a dealbreaker behind a strong showing elsewhere.</div>

<h4>Run a proof of concept that can fail</h4>
<p>A POC that only demonstrates the happy path tells you nothing you did not already know. Design it to
break:</p>
<ul>
<li>Integrate <b>the worst application</b>, not the easy one.</li>
<li>Import a realistic slice of <b>real, messy</b> user data — duplicates included.</li>
<li>Perform an <b>export</b>, and check what you actually get back.</li>
<li>Raise a genuine <b>support ticket</b> and time the response.</li>
<li>Test one <b>failure mode</b>: what does an outage look like from an application's perspective?</li>
</ul>

<h4>Presenting the recommendation</h4>
<p>Decision-makers do not want a winner announced; they want a defensible choice they can own. So
present <b>two or three viable options with their trade-offs</b>, a recommendation with reasoning, the
<b>total</b> cost including migration and run, the risks and how reversible the decision is, and what
happens if you do nothing. That last one is often the strongest argument, and it is the one most often
left out.</p>
<p>And name the uncomfortable things explicitly: concentration risk, the re-enrollment that any future
exit requires, the tail of applications that will not federate, and the headcount the operating model
assumes. A recommendation that hides these is not saving anyone trouble — it is deferring it to the
person who inherits the decision.</p>`,
docs:[['NIST SP 800-63-3 — Digital Identity Guidelines (requirements framing)','https://pages.nist.gov/800-63-3/sp800-63-3.html'],['OpenID Foundation — certification (verifying vendor claims)','https://openid.net/certification/'],['RFC 7644 — SCIM Protocol (provisioning interoperability)','https://www.rfc-editor.org/rfc/rfc7644']],
ex:{title:'Gate first, then score',
prompt:`Write <code>VendorEval</code> with three methods. <code>static boolean passesGates(boolean handlesLegacyTail, boolean meetsResidency, boolean producesAuditEvidence, boolean phishingResistantMfa)</code> requires <b>all four</b> — a gate is not scored, it is pass or fail. <code>static int score(int migrationEffortInverse, int operationalEase, int costEase, int governance, int devExperience)</code> returns the weighted total <code>3*migrationEffortInverse + 3*operationalEase + 2*costEase + 2*governance + devExperience</code>. <code>static int evaluate(boolean gates, int weightedScore)</code> returns the score when the gates pass and <code>-1</code> otherwise, so a failed gate can never be averaged away by a strong showing elsewhere.`,
starter:`public class VendorEval {
    static boolean passesGates(boolean handlesLegacyTail, boolean meetsResidency,
                               boolean producesAuditEvidence, boolean phishingResistantMfa) {
        return false;
    }
    static int score(int migrationEffortInverse, int operationalEase, int costEase,
                     int governance, int devExperience) {
        return 0;
    }
    static int evaluate(boolean gates, int weightedScore) {
        return 0;
    }
}`,
tests:[{d:'every gate must pass',re:'handlesLegacyTail\\s*&&'},{d:'residency is a gate',re:'meetsResidency'},{d:'audit evidence is a gate',re:'producesAuditEvidence'},{d:'phishing-resistant MFA is a gate',re:'phishingResistantMfa'},{d:'migration effort carries the heaviest weight',re:'3\\s*\\*\\s*migrationEffortInverse'},{d:'operational burden is weighted equally',re:'3\\s*\\*\\s*operationalEase'},{d:'a failed gate disqualifies rather than scores',re:'return\\s+-1|-1\\s*;'}],
behavior:`passesGates(true,true,true,true) is true; flipping any one argument to false makes it false, because a gate is pass-or-fail and cannot be compensated for. score(5,5,5,5,5) is 55 — migration effort and operational burden carry triple weight because they are the largest real costs and the most consistently underestimated, while licence price and developer experience dominate most evaluations for no good reason. evaluate(true, 55) is 55, while evaluate(false, 55) is -1: a vendor that cannot handle your legacy tail is out regardless of how well it scores elsewhere, and returning a number there would let a spreadsheet quietly hide the dealbreaker.`,
hints:['Four conditions joined with &&, no scoring involved.','Write the weighted sum literally so the weights are visible in the code.','<code>return gates ? weightedScore : -1;</code>'],
solution:`public class VendorEval {
    static boolean passesGates(boolean handlesLegacyTail, boolean meetsResidency,
                               boolean producesAuditEvidence, boolean phishingResistantMfa) {
        // gates are pass/fail: they are never traded off against a score
        return handlesLegacyTail && meetsResidency
            && producesAuditEvidence && phishingResistantMfa;
    }
    static int score(int migrationEffortInverse, int operationalEase, int costEase,
                     int governance, int devExperience) {
        // migration and operations dominate: they are the real, recurring costs
        return 3 * migrationEffortInverse
             + 3 * operationalEase
             + 2 * costEase
             + 2 * governance
             + devExperience;
    }
    static int evaluate(boolean gates, int weightedScore) {
        // -1, not a low score: a dealbreaker must not be averageable
        return gates ? weightedScore : -1;
    }
}`}}

]});
