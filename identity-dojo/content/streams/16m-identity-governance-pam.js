STREAMS.push({icon:'🗝️',iam:true,sec:'Governance & privileged access',title:'Identity Governance & Privileged Access',blurb:'Keeping access correct over time: identity governance (access reviews, certification, separation of duties), privileged access management (vaulting, just-in-time elevation), secrets management and rotation, and CIAM vs workforce IAM.',lessons:[

{id:'ig1',title:'IGA: reviews & certification',body:`


<p>Over years, people accumulate <b>entitlements</b> they no longer need. An entitlement is one specific grant of access: membership in a group, a role, a permission in one application. The slow pile-up is called <b>privilege creep</b>. <b>IGA</b> is identity governance and administration: the part of identity management that answers "who has access to what, and should they still?" It fixes privilege creep with periodic <b>access reviews</b>. Managers or resource owners <b>certify</b> that each person still needs what they hold, and anything unconfirmed is revoked.</p>
<p>Governance also covers access <b>requests</b> with approval workflows and an <b>audit trail</b> of who approved what, the evidence auditors and regulators ask for.</p>

<h4>The problem is structural, not careless</h4>
<p>Over-permissioning happens because <b>granting access has an owner and
removing it does not</b>. Someone asks, a person approves, the job gets done.
Six months later they move teams. The requester is
gone, the approver has forgotten, and the administrator was never told.</p>
<p>This is the <b>mover</b> problem, and it is worse than the leaver problem. A leaver at least
triggers an offboarding checklist. A mover accumulates the union of every
role they have ever held. After five years an internal transfer can hold more access than any job
would justify, the profile an attacker wants to phish.</p>

<h4>Certification is the counterweight</h4>
<p>Access review, also called <b>certification</b> or <b>attestation</b>, supplies the missing removal pressure. A campaign asks a human to say,
for each grant, whether it is still needed. The default is what makes it work:</p>
<div class="codeSample" data-hl>certified   -> keep
revoked     -> remove
NO RESPONSE -> remove      <- the load-bearing rule

// if silence means "keep", the campaign measures nothing:
// a reviewer who ignores it entirely produces the same result as one
// who carefully confirms every line. that is theatre, not a control.</div>
<p>Frequency follows risk: privileged and financial access quarterly, ordinary
application access annually, and <b>event-driven</b> reviews on transfer. The last one
catches the mover problem, because it fires when the access became wrong.</p>

<h4>Why campaigns fail</h4>
<p><b>Rubber-stamping</b> is the dominant failure. Give a manager 400 rows of entitlements named
<code>APP_FIN_GL_RW_PRD</code> and they will approve them all in one click rather than spend
an afternoon guessing. The fix is to make the decision answerable: show the
plain-language description, when it was last used, and who else in the same job holds it. <b>Last-used
data is the one addition that improves a review most</b>. "Not used in 180 days" is an obvious revoke.</p>
<p><b>Wrong reviewer</b> is the second. A line manager knows whether someone still works for them. Only
the application owner knows what an entitlement permits. Serious programs run both, on different populations.</p>
<p><b>Revocations that never happen</b> is the third and most damaging. A revoke list nobody executes is worse than no campaign. It generates audit evidence of a control
that does not exist. The fix is closed-loop remediation: the decision drives the <b>deprovisioning</b>, the actual disabling of the account or removal of the grant, and
the ticket stays open until the entitlement is gone.</p>

<h4>What good looks like</h4>
<p>The mature version reviews <b>exceptions rather than everything</b>. A role model defines what each job
should hold, <b>birthright access</b> (the baseline every person in a given job gets automatically, on day one) is granted from HR data, and the campaign asks only about
the deviations. That turns 400 rows into 12, and 12 rows get read.</p>`,
docs:[['Identity and access management (Wikipedia)','https://en.wikipedia.org/wiki/Identity_and_access_management'],['Access certification','https://www.gartner.com/en/information-technology/glossary/identity-governance-and-administration-iga']],
ex:{title:'Certify or revoke',lang:'js',
run:{call:'decision',cases:[{name:'certified access is kept',args:[true],expect:'keep'},{name:'uncertified access is revoked',args:[false],expect:'revoke'}]},
prompt:`Write <code>function decision(stillNeeded)</code> that returns <code>"keep"</code> when the access is still needed and <code>"revoke"</code> otherwise. Use a single conditional expression.`,
starter:`function decision(stillNeeded) {
  return null;
}`,
solution:`function decision(stillNeeded) {
  return stillNeeded ? "keep" : "revoke";
}`,
tests:[{d:'keeps needed access, revokes the rest',re:'stillNeeded\\s*\\?\\s*"keep"\\s*:\\s*"revoke"'}],
behavior:`decision(true) is "keep", decision(false) is "revoke". Unconfirmed access defaults to revoked, which is how reviews reverse privilege creep. Your function is called with both inputs and its return value compared for real.`,
hints:['The ternary operator condition ? a : b fits in one line.','Return "keep" for true and "revoke" for false.','Default-deny: anything not certified should be revoked.']}},

{id:'ig2',title:'Entitlements & separation of duties',body:`


<p>An <b>entitlement</b> is a specific grant: membership in a group, a role, a fine-grained permission. Governance tracks entitlements so it can spot <b>toxic combinations</b>: pairs no one person should hold together. The classic finance example: whoever can <b>create</b> a vendor invoice must not also be able to <b>pay</b> it, or a single insider could commit fraud undetected.</p>
<p>Detecting these separation-of-duties conflicts across everyone&#8217;s entitlements is a standard governance control.</p>

<h4>Start with the naming problem</h4>
<p>An
<b>entitlement</b> is the atomic unit: one thing a person can do in one system. It
might be an <b>AD</b> group (Active Directory, Microsoft's directory of a company's accounts, groups and machines, where in most large companies the accounts actually live), a database role, a license tier in a <b>SaaS</b> application (software you rent over the web rather than install), an application permission. A <b>role</b> is a
named bundle of entitlements. Reviews and conflict checks must run at
the entitlement level, because two harmless-looking roles can conflict through entitlements neither name
reveals.</p>
<div class="codeSample" data-hl>role "AP Clerk"      -> {ap_create, vendor_read}
role "Treasury Ops" -> {ap_pay,    bank_read}

// neither role is dangerous. holding BOTH is fraud-enabling.
// a check that compares role NAMES misses it entirely -
// you have to expand to entitlements and intersect there.</div>

<h4>Separation of duties, and why it exists</h4>
<p>Separation of duties, <b>SoD</b> for short, is an
<b>anti-fraud and anti-error control</b>, not a defense against outsiders, and it comes from accounting long before IT. The
principle: no single person should be able to move value from beginning to
end without a second pair of eyes.</p>
<p>The canonical conflicts:</p>
<ul>
<li><b>Create vendor / pay vendor</b>: invent a supplier, invoice yourself, approve the payment.</li>
<li><b>Amend payroll / approve payroll</b>: the same fraud with salaries.</li>
<li><b>Write code / deploy to production</b>: ship an unreviewed change straight to customers.</li>
<li><b>Grant access / use access</b>: the meta-conflict. It makes every other control
optional for whoever holds it.</li>
<li><b>Administer logs / perform privileged actions</b>: do the thing, then erase the evidence.</li>
</ul>
<p>That last pair is why log retention is usually owned by a different team from the systems producing
the logs.</p>

<h4>Preventive versus detective</h4>
<p><b>Preventive</b> is a check at
request time: the grant is blocked before it exists. Cheap and non-negotiable. <b>Detective</b>
is a scan across current holdings. It catches what preventive control missed: access granted
directly in the target system, conflicts introduced by a new rule, or a role definition that
changed underneath its members. Mature programs do both.</p>
<p>Detective scanning is not optional, because <b>most real conflicts arrive sideways</b> rather than
through the request path.</p>

<h4>Handling the conflicts you cannot avoid</h4>
<p>In a ten-person company one person has to do both jobs. The answer is a documented <b>mitigating control</b>: a compensating review by someone else, a
transaction limit, or an alert on every action taken under the conflicting pair. An exception with an
owner, an expiry and a compensating control is a governed risk.</p>
<p>The common failure is <b>rule sprawl</b>: hundreds of conflict rules written once, never
tuned, firing on false positives until everyone routes around them.</p>`,
docs:[['Segregation of duties','https://en.wikipedia.org/wiki/Separation_of_duties'],['SoD controls','https://www.isaca.org/resources/isaca-journal']],
ex:{title:'Flag a toxic combination',
prompt:`Write class <code>Entitlements</code> with <code>static boolean conflict(java.util.Set&lt;String&gt; held)</code> that returns true when a user holds <b>both</b> <code>"ap_create"</code> and <code>"ap_pay"</code> (create and pay invoices).`,
starter:`import java.util.Set;
public class Entitlements {
    static boolean conflict(Set<String> held) {
        return false;
    }
}`,
solution:`import java.util.Set;
public class Entitlements {
    static boolean conflict(Set<String> held) {
        return held.contains("ap_create") && held.contains("ap_pay");
    }
}`,
tests:[{d:'checks the create entitlement',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:contains\\s*\\(\\s*"ap_create"\\s*\\)))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:contains\\s*\\(\\s*"ap_create"\\s*\\))[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:contains\\s*\\(\\s*"ap_create"\\s*\\))[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:contains\\s*\\(\\s*"ap_create"\\s*\\))[^{]*?return\\s+\\k<av>\\b)'},{d:'checks the pay entitlement',re:'contains\\s*\\(\\s*"ap_pay"\\s*\\)'},{d:'conflict needs BOTH',re:'&&'}],
behavior:`conflict(Set.of("ap_create","ap_pay")) is true; conflict(Set.of("ap_create")) is false. Holding both halves of create-and-pay is the toxic combination governance forbids.`,
hints:['Both entitlements must be present, so use &&.','Check each with contains.','Either one alone is acceptable.']}},

{id:'ig3',title:'PAM: privileged access management',body:`


<p>Admin, root, and break-glass accounts are the crown jewels, so they get extra controls under <b>PAM</b>, privileged access management. Credentials live in a <b>vault</b> rather than on laptops. Sessions can be <b>recorded</b> for audit. Access is granted <b>just-in-time</b>: elevated only for a short, approved window instead of standing 24/7.</p>
<p>The safest privileged grant is both <b>approved</b> and <b>time-boxed</b> so it expires automatically.</p>

<h4>What PAM is fighting</h4>
<p>Admins have to exist. The target is <b>standing privilege</b>: an account that
holds elevated rights continuously, whether or not anyone is using them. With standing privilege, the
window in which a compromise is catastrophic is 100% of the time. Every phish, every reused password,
every stolen laptop lands on a live administrator.</p>
<p>If elevation exists for two hours a week
against a specific target, an attacker who lands credentials outside that window has nothing to escalate
with.</p>

<h4>The four moves</h4>
<p><b>Vault the credential.</b> The password or key lives in a vault, not on a laptop, a wiki or
a shared spreadsheet. A human never needs to see it: the vault injects it into the session. That
kills credential sharing, which is what makes "who did this?" unanswerable for shared root
accounts.</p>
<p><b>Broker the session.</b> The admin connects through a proxy that
holds the real credential. That gives you one enforcement point for recording, and the endpoint
being administered never receives a credential the user could scrape.</p>
<p><b>Elevate just in time.</b> Access is requested, approved, and granted for a bounded window against a
named target with a stated reason. It expires without anyone remembering to remove it.</p>
<div class="codeSample" data-hl>STANDING     admin rights, always on, all targets
                risk window = permanent

JIT          approved + time-boxed + scoped to one target
                risk window = the 2 hours you asked for

// note it takes BOTH: an approval with no expiry becomes standing
// privilege by attrition, and an expiry with no approval is just
// self-service admin.</div>
<p>Just in time is usually shortened to <b>JIT</b>: access granted at the moment it is needed and taken away when the window closes, instead of standing there permanently.</p>
<p><b>Record and review.</b> Session recording and keystroke logging exist mostly for after the fact:
incident reconstruction and audit evidence. Their deterrent value is real but secondary. Recording is not
prevention: nobody watches the tapes until something has already gone wrong.</p>

<h4>Break-glass: the exception you must design</h4>
<p>Every PAM system needs an escape hatch, because when the <b>IdP</b> is down you need
administrative access to fix it. The IdP is the identity provider: the system that holds the accounts and does the actual logging in, then tells other applications who you are. A break-glass account sits outside the normal flow. It is not
<b>federated</b> (it does not rely on any other organization's or system's login being trusted), not dependent on <b>MFA</b> infrastructure that might itself be broken, and
excluded from conditional access policies that could lock it out. MFA is multi-factor authentication: proving who you are with two different kinds of evidence, usually something you know (a password) plus something you have (a phone or a security key). Conditional access policies are the rules that block a login based on device, location or risk. The break-glass account's credentials are split and sealed.</p>
<p>What makes it safe is <b>noise</b>. Any use fires a high-priority alert to people who
will notice, is logged immutably, and is reviewed afterward regardless of outcome. And it is
<b>tested</b>. An untested break-glass procedure is a comforting fiction.</p>

<h4>Where PAM programs stall</h4>
<p><b>Admins route around it.</b> If JIT elevation takes twenty minutes to approve during an outage,
people will keep a standing account "just in case", and the control is bypassed
when it matters. Fast paths for on-call, pre-approved for defined scenarios, keep the system in use.</p>
<p><b>Service accounts stay standing.</b> The human admins get vaulted and the automation does not,
leaving the highest-privilege credentials in the estate untouched. That gap is usually the larger population, and the subject of the
non-human identity lesson later in this stream.</p>`,
docs:[['Privileged access management','https://en.wikipedia.org/wiki/Privileged_access_management'],['Just-in-time access','https://learn.microsoft.com/en-us/entra/id-governance/privileged-identity-management/pim-configure']],
ex:{title:'Grant privilege safely',lang:'js',
run:{call:'grant',cases:[{name:'approved and time-boxed is granted',args:[true,true],expect:true},{name:'approved but standing is refused',args:[true,false],expect:false},{name:'time-boxed but unapproved is refused',args:[false,true],expect:false},{name:'neither is refused',args:[false,false],expect:false}]},
prompt:`Write <code>function grant(approved, timeBoxed)</code> that grants elevated access only when it was <b>both</b> approved and time-boxed.`,
starter:`function grant(approved, timeBoxed) {
  return false;
}`,
solution:`function grant(approved, timeBoxed) {
  return approved && timeBoxed;
}`,
tests:[{d:'must be approved',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:approved\\s*&&))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:approved\\s*&&)[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:approved\\s*&&)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:approved\\s*&&)[^{]*?return\\s+\\k<av>\\b)'},{d:'must be time-boxed',re:'&&\\s*timeBoxed'}],
behavior:`grant(true,true) is true; grant(true,false) is false (standing privilege is refused); grant(false,true) is false. All four combinations are executed against your function.`,
hints:['Both conditions must hold, so combine them with &&.','Approved alone is not enough without a time box.','Standing (non-time-boxed) privilege must be refused.']}},

{id:'ig4',title:'Secrets management & rotation',body:`


<p>Applications need secrets: database passwords, API keys, signing keys. Hardcoding them in code or config is how leaks happen. A <b>secrets manager</b> (HashiCorp Vault, or a cloud secret manager) stores them centrally, hands them out with access control, and audits every fetch. High-value keys live in an <b>HSM</b>, a hardware security module: a locked box, physical or cloud-hosted, that holds private keys and does the signing inside itself, so the key can be used but never copied out.</p>
<p><b>Rotation</b> is the other half. A secret is replaced once its age reaches the policy maximum, and immediately after any suspected exposure, so a leaked credential has a short useful life.</p>

<h4>Why secrets differ from passwords</h4>
<p>A user password is typed by a human who can be prompted for <b>MFA</b> and who notices when something is
wrong. MFA is multi-factor authentication: proving who you are with two different kinds of evidence, usually something you know (a password) plus something you have (a phone or a security key). A machine secret is used by software, at 3am, thousands of times an hour, with nobody watching.
It cannot be MFA'd, it produces no signal when stolen, and it usually grants far more than any
human account. A database credential reads every row, not the ten rows the user was entitled to.</p>
<p>Leaked secrets are the workhorse of real breaches. They need no clever exploit, just
a repository, a <b>CI</b> log, an error page, a Docker image layer, or a Slack message. CI is continuous integration: the automated pipeline that builds and tests code on every change, and its logs are full of whatever the build touched.</p>

<h4>The hierarchy, worst to best</h4>
<div class="codeSample" data-hl>hardcoded in source     -> in git history FOREVER. rotating the secret is
                           the only fix; deleting the commit is not.
config file on disk     -> better, but sprawls across hosts, backups, images
environment variable    -> the common baseline. leaks via crash dumps,
                           /proc, child processes, and debug endpoints
secrets manager         -> fetched at runtime, access-controlled, audited,
                           revocable centrally
dynamic / short-lived   -> the credential is MINTED per use and expires in
                           minutes. nothing long-lived exists to steal
no secret at all        -> workload identity: the platform attests what you
                           are, and you exchange that for a token</div>
<p>Most teams aim at the middle of this list. The
end state is <b>having no long-lived secret to store</b>. A pod (one running copy of an application in a Kubernetes cluster)
that proves its identity to the cloud provider and receives a fifteen-minute credential has removed the
whole class of problem.</p>

<h4>What rotation is for</h4>
<p>Rotation limits the useful life of a credential you did not know was stolen. It is often performed as ritual: a 90-day policy
followed, with no ability to rotate <i>quickly</i> when it matters.</p>
<p>The metric that counts is <b>time to rotate under pressure</b>. If a leaked
production key takes three days and a change-advisory board to replace, the schedule is irrelevant. If
it takes four minutes and is fully automated, you can rotate on any suspicion, and the interval
almost stops mattering.</p>
<p>The mechanical trap is the <b>cutover</b>: replacing a secret in one step breaks every consumer
that has not picked up the new value. The fix is two valid credentials at once:</p>
<div class="codeSample" data-hl>1. issue the NEW secret alongside the old   (both valid)
2. roll consumers over to the new one       (no outage)
3. verify nothing still uses the old        (usage metrics, not hope)
4. revoke the old

// step 3 is the one people skip, and it is why rotation gets
// abandoned after the first self-inflicted outage.</div>

<h4>Detection matters as much as storage</h4>
<p>Assume some secret will leak anyway. Secret <b>scanning</b> in repositories and CI shortens the interval between leak and response. So do distinctive
<b>prefixes</b> on issued keys, so scanners can recognize them, and push protection that rejects a commit
before it lands. Add <b>usage
anomaly</b> alerting and honeytoken credentials that exist only to be stolen and alert when used. A database credential appearing from an unfamiliar network is a strong signal.</p>
<p>When a secret does leak, <b>rotate first, investigate second</b>. The investigation can take days.
The exposure should not.</p>`,
docs:[['Secrets management, Vault','https://developer.hashicorp.com/vault/docs/what-is-vault'],['Key management, NIST','https://csrc.nist.gov/projects/key-management']],
ex:{title:'Is a secret due for rotation?',lang:'js',
run:{call:'rotateDue',cases:[{name:'due exactly at the maximum age',args:[90,90],expect:true},{name:'due past the maximum age',args:[91,90],expect:true},{name:'not yet due',args:[30,90],expect:false},{name:'brand new secret',args:[0,1],expect:false}]},
prompt:`Write <code>function rotateDue(ageDays, maxDays)</code> that returns <code>true</code> when the secret&#8217;s age has <b>reached or exceeded</b> the maximum allowed age.`,
starter:`function rotateDue(ageDays, maxDays) {
  return false;
}`,
solution:`function rotateDue(ageDays, maxDays) {
  return ageDays >= maxDays;
}`,
tests:[{d:'due once age reaches the maximum',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:ageDays\\s*>=\\s*maxDays))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:ageDays\\s*>=\\s*maxDays)[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:ageDays\\s*>=\\s*maxDays)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:ageDays\\s*>=\\s*maxDays)[^{]*?return\\s+\\k<av>\\b)'},{d:'does not hardcode a result',re:'rotateDue\\s*\\([^)]*\\)\\s*\\{\\s*return\\s+(true|false)\\s*;',not:true}],
behavior:`rotateDue(90,90) is true, rotateDue(91,90) is true, rotateDue(30,90) is false. The boundary case is the one that matters and it is executed for real, so an off-by-one here actually fails.`,
hints:['Reached or exceeded means the >= comparison.','Compare ageDays against maxDays directly.','Return the boolean result of the comparison.']}},

{id:'ig5',title:'CIAM vs workforce IAM',body:`


<p>Access reviews,
joiner-mover-leaver, entitlement certification and separation of duties all assume an <b>authoritative
source</b> that says who exists, and <b>coercive power</b> to enforce a decision. For customers there is no
HR system and no employment relationship. The foundations stream covers <i>why</i> the two disciplines
diverge.</p>

<h4>What replaces each control</h4>
<ul>
<li><b>Access review becomes lifecycle policy.</b> Nobody can certify that a shopper still needs their
account. The question changes from "does this person still need access?" to "is this account still
alive?", expressed as dormancy thresholds and a retention deadline that runs automatically.</li>
<li><b>Deprovisioning becomes deletion, with a legal basis.</b> A leaver is disabled by an event. A customer
leaves by asking, or by never coming back. Both paths must end in data being removed, on a clock
you can state.</li>
<li><b>Entitlement certification becomes delegated administration.</b> In <b>B2B2C</b> you cannot certify a
merchant's staff, so the merchant's own admin does, and you certify the <i>merchant</i>. B2B2C is business to business to consumer: your customers are other businesses, and you reach their customers through them, as a payments platform reaches a merchant's shoppers. The boundary
moves up a level.</li>
<li><b>Separation of duties becomes fraud control.</b> The risk is a customer, or someone wearing their account, doing something the real person would not.</li>
</ul>

<h4>Consent is the governance object</h4>
<p>Workforce governance tracks entitlements. Consumer governance tracks <b>consent</b>, which is
harder: consent is per purpose, revocable at any time, and must be provable years later. A usable
implementation records what was agreed, in what wording, under which policy version, through which
interface, and when. Withdrawal has to be as easy as granting, and it has to <b>propagate</b>: to the
marketing platform, the analytics pipeline and every downstream copy. So consent belongs in a
service other systems query, not a flag each system caches and forgets.</p>

<h4>The control that fails most often</h4>
<p>Not the login. The <b>support tool</b>. Every consumer product ends up with an internal
interface that can view, edit and act on any customer account, built quickly under pressure. It is
usually the least governed system in the estate: broad access, weak approval, thin logging.</p>
<p>Treat it as privileged access, because it is. Scope what an agent can see by ticket rather than granting
the whole database. Require a reason string that is logged. Prefer time-boxed impersonation over standing
access. Mask what does not need to be read. Make impersonation visible to the customer where the law or
decency requires it. The safe-support-access lesson in the foundations stream is the mechanism. This is the
governance around it.</p>

<h4>What to measure</h4>
<ul>
<li><b>Dormant-account ratio</b>: how much of your user base is inactive, which is both a breach surface
and a signal about the product.</li>
<li><b>Deletion latency</b>: the time from request to data gone, including backups. Most teams
discover this number is unbounded when they first measure it.</li>
<li><b>Consent-revocation propagation time</b>: how long after a withdrawal the last downstream system
stops using the data.</li>
<li><b>Support impersonation events reviewed</b>: as a proportion of events, not a raw count.</li>
</ul>

<h4>The conflict you have to design for</h4>
<p>Erasure and retention will collide. A customer requests deletion
while their account is under a <b>legal hold</b> (a freeze on deleting anything that may be evidence in a lawsuit or investigation), or inside a period a financial regulator requires you to keep.
Erasure is a right, and it is not absolute. Neither ignore the request nor destroy
regulated records. <b>Suspend and record</b>: stop processing, mark the account, and delete when
the hold lifts, with the decision written down. You cannot defend having made no
decision at all.</p>`,
docs:[['CIAM vs IAM','https://auth0.com/blog/what-is-ciam/'],['Workforce vs customer identity','https://www.okta.com/customer-identity/']],
ex:{title:'Decide the lifecycle action',lang:'js',
run:{call:'lifecycleAction',cases:[{name:'a recent login is simply active',args:[{daysSinceLastSeen:10,deletionRequested:false,legalHoldActive:false,dormantAfterDays:180,deleteAfterDays:730}],expect:'active'},{name:'past the dormancy threshold',args:[{daysSinceLastSeen:200,deletionRequested:false,legalHoldActive:false,dormantAfterDays:180,deleteAfterDays:730}],expect:'dormant'},{name:'past the retention deadline, delete without being asked',args:[{daysSinceLastSeen:800,deletionRequested:false,legalHoldActive:false,dormantAfterDays:180,deleteAfterDays:730}],expect:'delete'},{name:'an erasure request beats an active account',args:[{daysSinceLastSeen:5,deletionRequested:true,legalHoldActive:false,dormantAfterDays:180,deleteAfterDays:730}],expect:'delete'},{name:'a legal hold outranks the erasure request',args:[{daysSinceLastSeen:5,deletionRequested:true,legalHoldActive:true,dormantAfterDays:180,deleteAfterDays:730}],expect:'retain-pending-hold'},{name:'exactly at the dormancy threshold counts as dormant',args:[{daysSinceLastSeen:180,deletionRequested:false,legalHoldActive:false,dormantAfterDays:180,deleteAfterDays:730}],expect:'dormant'}]},
prompt:`Write <code>function lifecycleAction(account)</code> returning <code>"active"</code>, <code>"dormant"</code>, <code>"delete"</code> or <code>"retain-pending-hold"</code> from <code>{ daysSinceLastSeen, deletionRequested, legalHoldActive, dormantAfterDays, deleteAfterDays }</code>. An erasure request under a legal hold is <b>retain-pending-hold</b>: neither ignore the request nor destroy a regulated record. Otherwise an erasure request deletes; then the retention deadline; then dormancy; otherwise active.`,
starter:`function lifecycleAction(account) {
  return "active";
}`,
solution:`function lifecycleAction(a) {
  if (a.deletionRequested && a.legalHoldActive) return "retain-pending-hold"; // suspend and record
  if (a.deletionRequested) return "delete";
  if (a.daysSinceLastSeen >= a.deleteAfterDays) return "delete";
  if (a.daysSinceLastSeen >= a.dormantAfterDays) return "dormant";
  return "active";
}`,
tests:[{d:'the hold-versus-erasure conflict is handled first',re:'(?:if\\s*\\(\\s*a\\s*\\.\\s*deletionRequested\\s*&\\s*&\\s*a\\s*\\.\\s*legalHoldActive\\s*\\)[^;}]*?return\\s+["\']retain-pending-hold["\'])'},{d:'an erasure request is honored',re:'deletionRequested'},{d:'the retention deadline deletes on its own',re:'deleteAfterDays'},{d:'dormancy is evaluated against its own threshold',re:'dormantAfterDays'}],
behavior:`Six cases execute. The fifth is the one worth sitting with: a customer exercising a right to erasure while a legal hold is active is a genuine conflict between two obligations, and both obvious answers are wrong: ignoring the request breaches the right, destroying the record breaches the hold. The defensible outcome is to stop processing, mark the account and delete when the hold lifts, with the decision recorded. The third case is the one teams forget entirely: retention deadlines should delete accounts nobody asked about, because data you kept without a reason is the cheapest breach you will ever suffer. Note the ordering is the policy: reordering these five lines changes what your organization promises.`,
hints:['Two flags interact, and their combination is a distinct outcome rather than either one alone.','Deletion has two independent triggers: someone asked, or the clock ran out.','Decide whether exactly at a threshold counts, then encode it: that boundary is a policy statement.']}},
{id:'ig6',title:'Consent & privacy in CIAM',body:`


<p>Consumer identity, <b>CIAM</b> for customer identity and access management, is identity for customers rather than employees: sign-up forms, "log in with Google", millions of accounts nobody pre-registered. It means holding real people's personal data, so <b>consent and privacy are first-class</b>, and often legally required. <b>GDPR</b> is the General Data Protection Regulation, the European data-protection law: keep the minimum data, have a reason for every field, and be able to delete a person. <b>CCPA</b> is the California Consumer Privacy Act, its US counterpart: the right to know what data is held, to delete it, and to opt out of it being sold.</p>
<ul>
<li><b>Explicit, granular consent</b>: opt-in per purpose ("email me offers" separate from "process my order"), not one blanket checkbox. In OAuth/OIDC the consent screen is where the user approves <b>scopes</b>. <b>OAuth</b> is the standard way one application gets permission to use another on your behalf, such as a calendar app reading your Google calendar, without ever seeing your password. <b>OIDC</b>, OpenID Connect, is a thin layer on top of it that adds a signed statement of who logged in. A scope is the named permission an app asks for, such as <code>calendar.read</code>.</li>
<li><b>Data minimization</b>: collect only what you need. Less data is less risk and less to leak.</li>
<li><b>Progressive profiling</b>: ask for more information over time as it is needed, instead of a giant signup form.</li>
<li><b>Data-subject rights</b>: access, correction, and <b>erasure</b> ("right to be forgotten"), plus the ability to <b>revoke consent</b> at any time.</li>
</ul>

<h4>Consent has to be provable</h4>
<p>A checkbox is not consent. The <b>record</b> is. A regulator, an auditor or an angry customer asks: what did this person agree to? In what wording, on what date, under which policy version, through what interface? That is a <b>consent receipt</b> (purpose, scope, timestamp, policy version, and the mechanism) stored as an immutable record, not a boolean column that yesterday's migration overwrote.</p>
<p>The same applies to withdrawal. Consent that cannot be revoked as easily as it was given is not valid consent under GDPR. "As easily" is a design constraint: if opting in took one click, opting out cannot require an email to support. Revocation must also propagate, to the marketing platform, the analytics pipeline and every downstream copy. So consent belongs in a service other systems query, not in a flag each system caches.</p>

<h4>Lawful basis, and why consent is often the wrong one</h4>
<p>Consent is one of six lawful bases in GDPR, and often the weakest choice. Processing an order needs no consent. It is <b>contractual necessity</b>. Fraud prevention and security logging are usually <b>legitimate interests</b>. Asking for consent where another basis applies creates an obligation you cannot honor, because if the user withdraws it you must process anyway to run the service. Map each purpose to its basis first, then ask for consent only where consent is the basis: typically marketing, optional personalization and non-essential cookies.</p>

<h4>What data-subject rights mean for the identity store</h4>
<ul>
<li><b>Access and portability</b>: you must be able to export everything you hold about one person. That means knowing every store that keys on a user id, including logs and backups.</li>
<li><b>Erasure</b>: hard, because deleting a user id from a relational store breaks referential integrity (other tables still point at the row you removed), and audit records must survive. The usual answer is to delete or <b>crypto-shred</b> the personal data (destroy the key it was encrypted with, so what remains is unreadable), retain a pseudonymous id for the records that must remain, and document that decision.</li>
<li><b>Correction</b>: including in the downstream systems provisioned from your directory.</li>
<li><b>Identity for the request itself</b>: a subject-access request is a beautiful phishing target, so verifying the requester is part of honoring the right.</li>
</ul>
<p><b>Privacy by design</b>, as engineering: collect the minimum, separate identifiers from attributes, set retention per purpose and enforce it automatically, and encrypt personal data at rest. Make each of those choices visible in the data model, not in a policy document nobody reads.</p>`,
docs:[['GDPR consent','https://gdpr.eu/gdpr-consent-requirements/'],['Privacy by design','https://en.wikipedia.org/wiki/Privacy_by_design']],
ex:{title:'Is this consent valid?',lang:'js',
run:{call:'valid',cases:[{name:'explicit, granular and revocable',args:[true,true,true],expect:true},{name:'not explicit',args:[false,true,true],expect:false},{name:'not granular',args:[true,false,true],expect:false},{name:'not revocable',args:[true,true,false],expect:false}]},
prompt:`Write <code>function valid(explicit, granular, revocable)</code> that returns <code>true</code> only when consent is <b>all three</b>: explicitly given, granular per purpose, and revocable.`,
starter:`function valid(explicit, granular, revocable) {
  return false;
}`,
solution:`function valid(explicit, granular, revocable) {
  return explicit && granular && revocable;
}`,
tests:[{d:'consent must be explicit',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:explicit\\s*&&))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:explicit\\s*&&)[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:explicit\\s*&&)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:explicit\\s*&&)[^{]*?return\\s+\\k<av>\\b)'},{d:'consent must be granular',re:'granular'},{d:'consent must be revocable',re:'revocable'}],
behavior:`valid(true,true,true) is true; dropping any one makes it false. Pre-ticked boxes are not explicit, all-or-nothing is not granular, and consent you cannot withdraw is not consent; each is executed as its own case.`,
hints:['Three conditions joined with &&.','A pre-ticked box is not explicit consent.','If it cannot be withdrawn, it is not consent.']}},
{id:'igaudit',title:'Identity audit, logging & compliance',body:`


<p>Identity systems must keep an <b>audit trail</b> of the events that matter, recording <b>who did what, to whom, and when</b>. That means logins and failures, <b>MFA</b> challenges, password and privilege changes, consent grants, and every admin action. MFA is multi-factor authentication: proving who you are with two different kinds of evidence, usually something you know (a password) plus something you have (a phone or a security key), and each challenge is an event worth keeping. These logs should be tamper-evident and retained per policy.</p>
<p>What the logs power:</p>
<ul>
<li><b>Investigations & detection</b>: feed them to a <b>SIEM</b> to alert on suspicious patterns (a burst of failed logins, a new admin, impossible travel). A SIEM, security information and event management, is the system that collects logs from everything and lets an analyst search and correlate them during an investigation. Impossible travel is a login from London followed an hour later by one from Sydney: nobody moved that fast, so one of them is not the user.</li>
<li><b>Access reviews</b>: periodic certification that people still need what they hold, evidenced by the trail. This is the job of <b>IGA</b>, identity governance and administration: the part of identity management that answers "who has access to what, and should they still".</li>
<li><b>Compliance</b>: frameworks like <b>SOC 2</b>, ISO 27001, and <b>NIST 800-63</b> map controls to these identity practices: MFA, least privilege, timely deprovisioning, and complete audit logs. SOC 2 is an audit report on a company's controls, ISO 27001 is the international standard for running an information-security program, and NIST 800-63 is the US standards body's guideline on digital identity. The audit trail is the evidence auditors ask for.</li>
</ul>
<p>Make sure <b>deprovisioning</b> (disabling an account and removing its access when the person leaves) and access-review actions are themselves logged. The controls have to prove they ran.</p>

<h4>What makes a log an audit trail</h4>
<p>Application logs and audit logs have different rules. An audit event is a <b>factual record of an action</b>, written for someone who was not there and may be reading it in two years. It holds actor, action, target, outcome and time, plus the context that makes it interpretable: source address, session or request id, client, and which policy allowed it. It is append-only, retained on a schedule you can state, and protected so that the people whose actions it records cannot alter it. That is why audit logs are shipped off the machine that produces them within seconds, and why write access to the audit store is itself a privileged operation.</p>
<p><b>Events are structured</b>, with stable field names, so a query for "every privilege change by this admin" is a filter rather than a regular expression. <b>Failures are recorded as carefully as successes</b>. A denied access is often the more interesting event, and a trail that only shows what worked cannot show an attack that did not.</p>

<h4>What must never appear in it</h4>
<p>Passwords, tokens, session identifiers, MFA codes, private keys, full card numbers, and the contents of <b>assertions</b>, the signed statements about a user that single sign-on passes between systems. This matters more in identity than elsewhere. The audit pipeline is widely readable by design (<b>SOC</b> analysts, auditors, on-call engineers), so a token in a log has been published. The SOC is the security operations center, the team that watches the alerts; it is not the same thing as SOC 2 above. Log identifiers and hashes instead: a token's <code>jti</code>, a key's <code>kid</code>, the last four digits, a salted hash of an email where correlation is needed without exposure. The <code>jti</code> is the token's own unique id and the <code>kid</code> is the id of the key that signed it, so either can be looked up later without exposing the secret itself. A salted hash is a fingerprint of the email with a random value mixed in first, so two logs of the same address match each other but nobody can work back to the address. Treat the pipeline as processing personal data, because names, addresses and behavior patterns are what identity events contain.</p>

<h4>From evidence to control</h4>
<p>In identity the audit trail <i>is</i> several of the controls. Access reviews are evidenced by it. Deprovisioning is proved by it. "Least privilege" is measurable only if you can see what was used, which is what makes usage-derived recommendations possible. Detection (impossible travel, a burst of failures, a new admin, a first-time-seen client) reads the same stream. The real test is a rehearsal. Pick a real question ("which accounts did this compromised admin touch on Tuesday?") and try to answer it from the logs alone. Most teams discover a missing field the first time, which is better than discovering it during an incident.</p>`,
docs:[['Logging & monitoring (OWASP)','https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html'],['NIST SP 800-63','https://pages.nist.gov/800-63-3/'],['SOC 2 overview','https://www.aicpa-cima.com/topic/audit-assurance/audit-and-assurance-greater-than-soc-2']],
},

{id:'ig7',title:'Non-human identity: the majority nobody governs',body:`


<p>Count the identities in a typical estate and the humans are a minority. Service accounts, <b>CI</b>
runners, scripts, integrations, API keys, workload certificates, bots and now agents outnumber
employees, commonly quoted at ten to one or more. CI is continuous integration: the automated pipeline that builds and tests code on every change, and each runner it uses is an identity of its own that often holds credentials. Almost every governance control in
this stream was designed for the humans.</p>
<p>So <b>non-human identities are more numerous, more privileged and less
governed than human ones</b>, and they are increasingly the way in. The usual shorthand is <b>NHI</b>: every identity that belongs to software rather than a person.</p>

<h4>Why the human controls do not transfer</h4>
<div class="codeSample" data-hl>HUMAN IDENTITY                    NON-HUMAN IDENTITY
joins via HR, leaves via HR       created ad hoc by whoever needed it
has a manager                     has an owner who left in 2021
MFA                               a static secret in a config file
password expires                  the credential never expires
access reviewed quarterly         never reviewed, reviewers do not know
                                    what it does or dare disable it
one person, one account           shared across teams and environments
leaves when the person leaves     outlives every person who touched it</div>
<p>The joiner-mover-leaver lifecycle has no equivalent trigger here. Nothing tells you a service account
is finished, so nothing removes it. Estates accumulate them.</p>

<h4>The four failure modes</h4>
<ol>
<li><b>No owner.</b> The most common finding. Nobody knows what it does, so nobody will disable
it, so it keeps whatever rights it was given. An identity without a named, current owner
is ungovernable.</li>
<li><b>Over-privilege.</b> Granted broad rights during setup "to get it working", never narrowed.
Service accounts are often the most privileged <b>principals</b> in the estate. A principal is anything, person or program, that a system makes an access decision about.</li>
<li><b>Static long-lived credentials.</b> A secret in a config file, a repo, a CI variable, a wiki page.
It does not rotate because rotation risks an outage nobody wants to own.</li>
<li><b>Sprawl and sharing.</b> One account used by six systems cannot be rotated without breaking five,
and its logs cannot attribute anything to anyone.</li>
</ol>

<h4>What good looks like</h4>
<ul>
<li><b>Every NHI has a named human owner and an expiry.</b> Both mandatory at creation, both
re-confirmed periodically. An expiry that must be renewed turns "forever" into a decision someone
takes deliberately.</li>
<li><b>One identity per workload</b>, never shared across systems or environments, so it can be
rotated, revoked and attributed independently. A workload is one running piece of software: a service, a job, a container.</li>
<li><b>Prefer no credential at all.</b> The strongest control is workload identity federation: the
workload proves what it is (mTLS, SPIFFE, a platform OIDC token) and exchanges that for short-lived
access. Federation here means the platform the workload runs on vouches for it, and the target system agrees to trust that vouching. <b>mTLS</b> is mutual TLS: ordinary TLS proves the server's identity to the client, and mutual TLS has the client present a certificate too, so both sides are identified before any data flows. <b>SPIFFE</b>, Secure Production Identity Framework for Everyone, is a standard for giving each running service its own short-lived identity document based on where and how it is running, so services can prove who they are to each other without stored passwords. An <b>OIDC</b> token (OpenID Connect, the standard login layer on top of OAuth) is a signed statement from the platform saying which workload this is. There is no static secret to leak, rotate or find in a repository.</li>
<li><b>Where a secret is unavoidable</b>, keep it in a manager, rotate automatically, and record
last-used so dead credentials are visible.</li>
<li><b>Review them like humans, with different questions.</b> "Does this still run, does it still need this, and who owns it now?" Instrument last-used first. An
NHI unused for ninety days is a candidate for removal and the easiest win available.</li>
</ul>

<h4>The reviewer's problem</h4>
<p>Human access reviews work because a manager recognizes their reports. Nobody recognizes
<code>svc-etl-prod-3</code>. Reviewers approve everything, and the review becomes a
compliance artifact with no security value.</p>
<p>The fix is <b>better evidence</b>: show the reviewer what the identity did, when
it last ran, what it accessed and who owns it. Given a
list of names, a reviewer cannot decide, and asking anyway trains people that reviews are theatre.</p>

<h4>Where agents make this urgent</h4>
<p>Agents are non-human identities created at high velocity, often per-task, often with delegated
user authority. Every problem above applies, faster, and an agent's
authority may be exercised in response to content it read. The governance answer is the same and more
important: short-lived, narrowly scoped, owned, attributable, and expiring by default.</p>`,
docs:[['OWASP (Non-Human Identities Top 10)','https://owasp.org/www-project-non-human-identities-top-10/'],['NIST SP 800-53 AC-2 (Account Management)','https://csrc.nist.gov/projects/risk-management/sp800-53-controls/release-search#!/control?version=5.1&number=AC-2'],['SPIFFE (workload identity)','https://spiffe.io/docs/latest/spiffe-about/overview/'],['OWASP (Secrets Management Cheat Sheet)','https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html']],
ex:{title:'Can this non-human identity be governed?',lang:'js',
run:{call:'governable',cases:[{name:'named owner, still employed, not expired',args:['ada',true,2000,1000],expect:true},{name:'no owner',args:['',true,2000,1000],expect:false},{name:'owner has left',args:['ada',false,2000,1000],expect:false},{name:'credential already expired',args:['ada',true,900,1000],expect:false}]},
prompt:`Write <code>function governable(owner, ownerStillEmployed, expiresAt, now)</code> returning <code>true</code> only when the identity has a <b>non-empty named owner</b>, that owner <b>still works here</b>, and the credential <b>has not expired</b> (<code>expiresAt &gt; now</code>).`,
starter:`function governable(owner, ownerStillEmployed, expiresAt, now) {
  return false;
}`,
solution:`function governable(owner, ownerStillEmployed, expiresAt, now) {
  // an unowned or orphaned credential cannot be reviewed by anyone
  return owner !== "" && ownerStillEmployed && expiresAt > now;
}`,
tests:[{d:'requires a named owner',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:owner\\s*!==?\\s*""))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:owner\\s*!==?\\s*"")[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:owner\\s*!==?\\s*"")[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:owner\\s*!==?\\s*"")[^{]*?return\\s+\\k<av>\\b)'},{d:'the owner must still be employed',re:'ownerStillEmployed'},{d:'the credential must not have expired',re:'expiresAt\\s*>\\s*now'}],
behavior:`governable("ada",true,2000,1000) is true. An empty owner, a departed owner, or a lapsed expiry each make it false: the three ways service accounts become the ungoverned majority.`,
hints:['Three conditions joined with &&.','An empty string is not a named owner.','Expiry is in the future when expiresAt > now.']}}
]});
