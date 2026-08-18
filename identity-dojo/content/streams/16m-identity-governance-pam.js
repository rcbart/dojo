STREAMS.push({icon:'🗝️',iam:true,sec:'Governance & privileged access',title:'Identity Governance & Privileged Access',blurb:'Keeping access correct over time: identity governance (access reviews, certification, separation of duties), privileged access management (vaulting, just-in-time elevation), secrets management and rotation, and CIAM vs workforce IAM.',lessons:[

{id:'ig1',title:'IGA: reviews & certification',body:`
<p>Access granted is rarely access removed: over years, people accumulate entitlements they no longer need (<b>privilege creep</b>). <b>IGA</b> (Identity Governance and Administration) fixes this with periodic <b>access reviews</b>: managers or resource owners <b>certify</b> that each person still needs what they hold, and anything unconfirmed is revoked.</p>
<p>Governance also covers access <b>requests</b> with approval workflows and an <b>audit trail</b> of who approved what, the evidence auditors and regulators ask for. The core decision in a review is simply: is this access still needed? If yes, keep it; if not, revoke it.</p>

<h4>The problem is structural, not careless</h4>
<p>Nobody sets out to over-permission a workforce. It happens because <b>granting access has an owner and
removing it does not</b>. Someone asks for access to do their job; a person approves; the job gets done.
Six months later they move teams, and the old access has no advocate for its removal. The requester is
gone, the approver has forgotten, and the system administrator was never told anything changed.</p>
<p>The result is the <b>mover</b> problem, and it is worse than the leaver problem. A leaver at least
triggers an offboarding checklist. A mover triggers nothing: they simply accumulate the union of every
role they have ever held. After five years an internal transfer can hold more access than any single job
would ever justify, which is exactly the profile an attacker wants to phish.</p>

<h4>Certification is the counterweight</h4>
<p>Access review, also called <b>certification</b> or <b>attestation</b>, is the periodic sweep that
supplies the missing removal pressure. A campaign takes a population of access and asks a human to say,
for each grant, whether it is still needed. What makes it work is the default:</p>
<div class="codeSample" data-hl>certified   -> keep
revoked     -> remove
NO RESPONSE -> remove      <- the load-bearing rule

// if silence means "keep", the campaign measures nothing:
// a reviewer who ignores it entirely produces the same result as one
// who carefully confirms every line. that is theatre, not a control.</div>
<p>Frequency follows risk, not calendar habit: privileged and financial access quarterly, ordinary
application access annually, and <b>event-driven</b> reviews on transfer, which is the one that
actually catches the mover problem, because it fires at the moment the access became wrong.</p>

<h4>Why campaigns fail in practice</h4>
<p><b>Rubber-stamping</b> is the dominant failure. Give a manager 400 rows of entitlements named
<code>APP_FIN_GL_RW_PRD</code> and they will approve all of them in one click, because the alternative is
an afternoon of guessing. The fix is not exhortation; it is making the decision answerable: show the
plain-language description, when it was last used, and who else in the same job holds it. <b>Last-used
data is the one addition that improves a review most</b>; "not used in 180 days" converts a judgement
call into an obvious revoke.</p>
<p><b>Wrong reviewer</b> is the second. A line manager knows whether someone still works for them; only
the application owner knows what a given entitlement actually permits. Serious programmes run both
perspectives, on different populations.</p>
<p><b>Revocations that never happen</b> is the third and most damaging. A campaign that produces a
revoke list nobody executes is worse than no campaign, because it generates audit evidence of a control
that does not exist. Closed-loop remediation (the decision drives the deprovisioning automatically, and
the ticket stays open until the entitlement is gone) is what separates governance from paperwork.</p>

<h4>What good looks like</h4>
<p>The mature version reviews <b>exceptions rather than everything</b>: a role model defines what each job
should hold, birthright access is granted automatically from HR data, and the campaign asks only about
the deviations. That turns 400 rows into 12, and 12 rows get read.`,
docs:[['Identity governance','https://en.wikipedia.org/wiki/Identity_governance'],['Access certification','https://www.gartner.com/en/information-technology/glossary/identity-governance-and-administration-iga']],
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
<p>An <b>entitlement</b> is a specific grant: membership in a group, a role, a fine-grained permission. Governance tracks entitlements so it can spot <b>toxic combinations</b>: pairs no one person should hold together. Classic example in finance: whoever can <b>create</b> a vendor invoice must not also be able to <b>pay</b> it, or a single insider could commit fraud undetected.</p>
<p>Detecting these separation-of-duties conflicts across everyone&#8217;s entitlements is a standard governance control, checked at request time and re-checked during reviews.</p>

<h4>Start with the naming problem</h4>
<p>Governance is only as good as its vocabulary, and the vocabulary here is genuinely muddled. An
<b>entitlement</b> is the atomic unit: one specific thing a person can do in one specific system. It
might be an AD group, a database role, a SaaS licence tier, an application permission. A <b>role</b> is a
named bundle of entitlements. The distinction matters because reviews and conflict checks must run at
the entitlement level: two harmless-looking roles can conflict through entitlements neither name
reveals.</p>
<div class="codeSample" data-hl>role "AP Clerk"      -> {ap_create, vendor_read}
role "Treasury Ops" -> {ap_pay,    bank_read}

// neither role is dangerous. holding BOTH is fraud-enabling.
// a check that compares role NAMES misses it entirely -
// you have to expand to entitlements and intersect there.</div>

<h4>Separation of duties, and why it exists</h4>
<p>SoD is not a security control in the usual sense: it does not stop an outsider. It is an
<b>anti-fraud and anti-error control</b>, and it comes from accounting long before it came from IT. The
principle: no single person should be able to complete a transaction that moves value from beginning to
end without a second pair of eyes.</p>
<p>The canonical conflicts recur across every organisation:</p>
<ul>
<li><b>Create vendor / pay vendor</b>: invent a supplier, invoice yourself, approve the payment.</li>
<li><b>Amend payroll / approve payroll</b>: the same fraud with salaries.</li>
<li><b>Write code / deploy to production</b>: ship an unreviewed change straight to customers.</li>
<li><b>Grant access / use access</b>: the meta-conflict, and the one that makes every other control
optional for whoever holds it.</li>
<li><b>Administer logs / perform privileged actions</b>: do the thing, then erase the evidence.</li>
</ul>
<p>That last pair is why log retention is usually owned by a different team from the systems producing
the logs.</p>

<h4>Preventive versus detective</h4>
<p>You can enforce SoD at two moments, and mature programmes do both. <b>Preventive</b> is a check at
request time: the grant is blocked before it exists, which is cheap and non-negotiable. <b>Detective</b>
is a scan across current holdings, which catches everything preventive control missed: access granted
directly in the target system, conflicts introduced by a new rule, or a role definition that quietly
changed underneath its members.</p>
<p>Detective scanning is not optional, because <b>most real conflicts arrive sideways</b> rather than
through the request path.</p>

<h4>Handling the conflicts you cannot avoid</h4>
<p>In a ten-person company one person genuinely has to do both jobs. The answer is not to pretend
otherwise; it is a documented <b>mitigating control</b>: a compensating review by someone else, a
transaction limit, or an alert on every action taken under the conflicting pair. An exception with an
owner, an expiry and a compensating control is a governed risk. An exception nobody wrote down is just a
gap you happen to know about.</p>
<p>The practical failure mode is <b>rule sprawl</b>: hundreds of conflict rules written once, never
tuned, firing constantly on false positives until everyone routes around them. A dozen enforced rules
beat two hundred ignored ones.`,
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
tests:[{d:'checks the create entitlement',re:'contains\\s*\\(\\s*"ap_create"\\s*\\)'},{d:'checks the pay entitlement',re:'contains\\s*\\(\\s*"ap_pay"\\s*\\)'},{d:'conflict needs BOTH',re:'&&'}],
behavior:`conflict(Set.of("ap_create","ap_pay")) is true; conflict(Set.of("ap_create")) is false. Holding both halves of create-and-pay is the toxic combination governance forbids.`,
hints:['Both entitlements must be present, so use &&.','Check each with contains.','Either one alone is acceptable.']}},

{id:'ig3',title:'PAM: privileged access management',body:`
<p>Admin, root, and break-glass accounts are the crown jewels, so they get extra controls under <b>PAM</b>. Credentials live in a <b>vault</b> rather than on laptops; sessions can be <b>recorded</b> for audit; and access is granted <b>just-in-time</b>: elevated only for a short, approved window instead of standing 24/7.</p>
<p>The safest privileged grant therefore requires two things at once: it was <b>approved</b>, and it is <b>time-boxed</b> so it expires automatically. Standing privilege is the anti-pattern PAM exists to eliminate.</p>

<h4>The thing PAM is really fighting</h4>
<p>Not "admins exist": admins have to exist. The target is <b>standing privilege</b>: an account that
holds elevated rights continuously, whether or not anyone is using them. Standing privilege means the
window in which a compromise is catastrophic is 100% of the time. Every phish, every reused password,
every stolen laptop lands on a live administrator.</p>
<p>Shrink the window and you have changed the arithmetic. If elevation exists for two hours a week
against a specific target, an attacker who lands credentials outside that window has nothing to escalate
with.</p>

<h4>The four moves</h4>
<p><b>Vault the credential.</b> The password or key lives in a vault, not on a laptop, not in a wiki, not
in a shared spreadsheet. A human never needs to see it: the vault injects it into the session. That
alone kills credential sharing, which is what makes "who did this?" unanswerable for shared root
accounts.</p>
<p><b>Broker the session.</b> Rather than connecting directly, the admin connects through a proxy that
holds the real credential. That gives you one enforcement point for recording, and it means the endpoint
being administered never receives a credential the user could scrape.</p>
<p><b>Elevate just in time.</b> Access is requested, approved, and granted for a bounded window against a
named target with a stated reason, and it expires without anyone remembering to remove it.</p>
<div class="codeSample" data-hl>STANDING     admin rights, always on, all targets
                risk window = permanent

JIT          approved + time-boxed + scoped to one target
                risk window = the 2 hours you asked for

// note it takes BOTH: an approval with no expiry becomes standing
// privilege by attrition, and an expiry with no approval is just
// self-service admin.</div>
<p><b>Record and review.</b> Session recording and keystroke logging exist mostly for after the fact:
incident reconstruction and audit evidence. Their deterrent value is real but secondary; do not mistake
recording for prevention, since nobody watches the tapes until something has already gone wrong.</p>

<h4>Break-glass: the exception you must design</h4>
<p>Every PAM system needs an escape hatch, because the day your IdP is down is precisely the day you need
administrative access to fix it. A break-glass account is deliberately outside the normal flow: not
federated, not dependent on MFA infrastructure that might itself be broken, credentials split and sealed,
excluded from conditional access policies that could lock it out.</p>
<p>What makes it safe is not obscurity but <b>noise</b>: any use fires a high-priority alert to people who
will notice, is logged immutably, and is reviewed afterward regardless of outcome. And it is
<b>tested</b>: an untested break-glass procedure is a comforting fiction, discovered to be broken at
exactly the worst moment.</p>

<h4>Where PAM programmes stall</h4>
<p><b>Admins route around it.</b> If JIT elevation takes twenty minutes to approve during an outage,
people will keep a standing account "just in case", and you have built a control that is bypassed
precisely when it matters. Fast paths for on-call, pre-approved for defined scenarios, are not a
weakness; they are what keeps the system in use.</p>
<p><b>Service accounts stay standing.</b> The human admins get vaulted and the automation does not,
leaving the highest-privilege credentials in the estate untouched. That gap is the subject of the
non-human identity lesson later in this stream, and it is usually the larger population.</p>`,
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
tests:[{d:'must be approved',re:'approved\\s*&&'},{d:'must be time-boxed',re:'&&\\s*timeBoxed'}],
behavior:`grant(true,true) is true; grant(true,false) is false (standing privilege is refused); grant(false,true) is false. All four combinations are executed against your function.`,
hints:['Both conditions must hold, so combine them with &&.','Approved alone is not enough without a time box.','Standing (non-time-boxed) privilege must be refused.']}},

{id:'ig4',title:'Secrets management & rotation',body:`
<p>Applications need secrets: database passwords, API keys, signing keys. Hardcoding them in code or config is how leaks happen. A <b>secrets manager</b> (HashiCorp Vault, or a cloud secret manager) stores them centrally, hands them out with access control, and audits every fetch. High-value keys live in an <b>HSM</b> (hardware security module) that never lets the raw key leave.</p>
<p><b>Rotation</b> is the other half: secrets should be replaced on a schedule (and immediately after any suspected exposure), so a leaked credential has a short useful life. A secret is due for rotation once its age reaches the policy maximum.</p>

<h4>Why secrets are structurally different from passwords</h4>
<p>A user password is typed by a human who can be prompted for MFA and who notices when something is
wrong. A machine secret is used by software, at 3am, thousands of times an hour, with nobody watching.
It cannot be MFA'd, it produces no signal when stolen, and it usually grants far more than any single
human account: a database credential reads every row, not the ten rows the user was entitled to.</p>
<p>Which is why leaked secrets are the workhorse of real breaches. They do not require a clever exploit.
They require a repository, a CI log, an error page, a Docker image layer, or a Slack message.</p>

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
<p>Most teams are aiming at the middle of this list when the top two rows are the interesting ones. The
end state is not "store the secret better"; it is <b>having no long-lived secret to store</b>. A pod
that proves its identity to the cloud provider and receives a fifteen-minute credential has removed the
entire class of problem.</p>

<h4>What rotation is actually for</h4>
<p>Rotation limits the useful life of a credential you did not know was stolen. That is its whole
purpose, and it is worth stating plainly because rotation is often performed as ritual: a 90-day policy
diligently followed, with no ability to rotate <i>quickly</i> when it actually matters.</p>
<p>The metric that counts is not the interval; it is <b>time to rotate under pressure</b>. If a leaked
production key takes three days and a change-advisory board to replace, the schedule is irrelevant. If
it takes four minutes and is fully automated, you can rotate on any suspicion at all, and the interval
almost stops mattering.</p>
<p>The mechanical trap is the <b>cutover</b>. Replacing a secret in one atomic step breaks every consumer
that has not picked up the new value. The pattern that works is two valid credentials at once:</p>
<div class="codeSample" data-hl>1. issue the NEW secret alongside the old   (both valid)
2. roll consumers over to the new one       (no outage)
3. verify nothing still uses the old        (usage metrics, not hope)
4. revoke the old

// step 3 is the one people skip, and it is why rotation gets
// abandoned after the first self-inflicted outage.</div>

<h4>Detection matters as much as storage</h4>
<p>Assume some secret will leak anyway. Secret <b>scanning</b> in repositories and CI, distinctive
<b>prefixes</b> on issued keys so scanners can recognise them, and push protection that rejects a commit
before it lands, all shorten the interval between leak and response. Pair that with <b>usage
anomaly</b> alerting (a database credential appearing from an unfamiliar network is a strong signal)
and honeytoken credentials that exist only to be stolen and alert when used.</p>
<p>And when a secret does leak: <b>rotate first, investigate second</b>. The investigation can take days;
the exposure should not.</p>`,
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
tests:[{d:'due once age reaches the maximum',re:'ageDays\\s*>=\\s*maxDays'},{d:'does not hardcode a result',re:'return\\s+(true|false)\\s*;',not:true}],
behavior:`rotateDue(90,90) is true, rotateDue(91,90) is true, rotateDue(30,90) is false. The boundary case is the one that matters and it is executed for real, so an off-by-one here actually fails.`,
hints:['Reached or exceeded means the >= comparison.','Compare ageDays against maxDays directly.','Return the boolean result of the comparison.']}},

{id:'ig5',title:'CIAM vs workforce IAM',body:`
<p>Everything else in this stream assumes two things that consumer identity does not have. Access reviews,
joiner-mover-leaver, entitlement certification and separation of duties all assume an <b>authoritative
source</b> that says who exists, and <b>coercive power</b> to enforce a decision. For customers there is no
HR system and no employment relationship. The foundations stream covers <i>why</i> the two disciplines
diverge; this lesson is about what governance actually becomes once you accept that the usual machinery
does not transfer.</p>

<h4>What replaces each control</h4>
<ul>
<li><b>Access review becomes lifecycle policy.</b> Nobody can certify that a shopper still needs their
account, so the question changes from "does this person still need access?" to "is this account still
alive?", expressed as dormancy thresholds and a retention deadline that runs automatically.</li>
<li><b>Deprovisioning becomes deletion, with a legal basis.</b> A leaver is disabled by an event; a customer
leaves by asking, or by never coming back. Both paths must end in data actually being removed, on a clock
you can state.</li>
<li><b>Entitlement certification becomes delegated administration.</b> In B2B2C you cannot certify a
merchant's staff, so the merchant's own admin does, and you certify the <i>merchant</i>. The boundary
moves up a level rather than disappearing.</li>
<li><b>Separation of duties becomes fraud control.</b> The risk is not a customer accumulating conflicting
permissions; it is a customer, or someone wearing their account, doing something the real person would not.</li>
</ul>

<h4>The consent lifecycle is the governance object</h4>
<p>Where workforce governance tracks entitlements, consumer governance tracks <b>consent</b>, and it is
harder, because consent is per purpose, revocable at any time, and must be provable years later. A usable
implementation records what was agreed, in what wording, under which policy version, through which
interface, and when. Withdrawal has to be as easy as granting, and it has to <b>propagate</b>: to the
marketing platform, the analytics pipeline and every downstream copy. That is why consent belongs in a
service other systems query rather than a flag each system caches and forgets.</p>

<h4>The control that fails most often</h4>
<p>It is not the login. It is the <b>support tool</b>. Every consumer product ends up with an internal
interface that can view, edit and act on any customer account, built quickly under pressure, and it is
routinely the least governed system in the estate: broad access, weak approval, thin logging.</p>
<p>Treat it as privileged access, because it is: scope what an agent can see by ticket rather than granting
the whole database, require a reason string that is logged, prefer time-boxed impersonation over standing
access, mask what does not need to be read, and make impersonation visible to the customer where the law or
decency requires it. The safe-support-access lesson in the foundations stream is the mechanism; this is the
governance around it.</p>

<h4>What to measure</h4>
<p>Four numbers tell you whether any of this is real:</p>
<ul>
<li><b>Dormant-account ratio</b>: how much of your user base is inactive, which is both a breach surface
and a signal about the product.</li>
<li><b>Deletion latency</b>: the time from request to data actually gone, including backups. Most teams
discover this number is unbounded when they first measure it.</li>
<li><b>Consent-revocation propagation time</b>: how long after a withdrawal the last downstream system
stops using the data.</li>
<li><b>Support impersonation events reviewed</b>: as a proportion of events, not as a raw count.</li>
</ul>

<h4>The conflict you have to design for</h4>
<p>Erasure and retention pull in opposite directions, and they will collide. A customer requests deletion
while their account is under a legal hold, or inside a period a financial regulator requires you to keep.
Erasure is a right, and it is not absolute; the resolution is neither to ignore the request nor to destroy
regulated records. It is to <b>suspend and record</b>: stop processing, mark the account, and delete when
the hold lifts, with the decision written down, because the one thing you cannot defend is having made no
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
tests:[{d:'the hold-versus-erasure conflict is handled first',re:'retain-pending-hold'},{d:'an erasure request is honoured',re:'deletionRequested'},{d:'the retention deadline deletes on its own',re:'deleteAfterDays'},{d:'dormancy is evaluated against its own threshold',re:'dormantAfterDays'}],
behavior:`Six cases execute. The fifth is the one worth sitting with: a customer exercising a right to erasure while a legal hold is active is a genuine conflict between two obligations, and both obvious answers are wrong: ignoring the request breaches the right, destroying the record breaches the hold. The defensible outcome is to stop processing, mark the account and delete when the hold lifts, with the decision recorded. The third case is the one teams forget entirely: retention deadlines should delete accounts nobody asked about, because data you kept without a reason is the cheapest breach you will ever suffer. Note the ordering is the policy: reordering these five lines changes what your organisation promises.`,
hints:['Two flags interact, and their combination is a distinct outcome rather than either one alone.','Deletion has two independent triggers: someone asked, or the clock ran out.','Decide whether exactly at a threshold counts, then encode it: that boundary is a policy statement.']}},
{id:'ig6',title:'Consent & privacy in CIAM',body:`
<p>Consumer identity (CIAM) means holding real people's personal data, so <b>consent and privacy are first-class</b>, not an afterthought, and often legally required (GDPR, CCPA).</p>
<ul>
<li><b>Explicit, granular consent</b>: opt-in per purpose ("email me offers" separate from "process my order"), not one blanket checkbox. In OAuth/OIDC the consent screen is where the user approves <b>scopes</b>; record what was approved (a consent receipt).</li>
<li><b>Data minimization</b>: collect only what you actually need. Less data is less risk and less to leak.</li>
<li><b>Progressive profiling</b>: ask for more information over time as it's needed, instead of a giant signup form.</li>
<li><b>Data-subject rights</b>: access, correction, and <b>erasure</b> ("right to be forgotten"), plus the ability to <b>revoke consent</b> at any time.</li>
</ul>
<p><b>Privacy by design</b>: default to the least data, encrypt PII, make consent revocable, and keep an auditable record of what each user agreed to and when. Consent you can't prove or revoke isn't real consent.</p>

<h4>Consent has to be provable, not just collected</h4>
<p>A checkbox is not consent; the <b>record</b> is. What a regulator, an auditor or an angry customer asks for is the same thing: what exactly did this person agree to, in what wording, on what date, under which version of the policy, and through what interface? That is a <b>consent receipt</b> (purpose, scope, timestamp, policy version, and the mechanism) stored as an immutable record rather than a boolean column that yesterday's migration overwrote.</p>
<p>The same applies to withdrawal. Consent that cannot be revoked as easily as it was given is not valid consent under GDPR, and "as easily" is a design constraint: if opting in took one click, opting out cannot require an email to support. Revocation must also propagate (to the marketing platform, the analytics pipeline and every downstream copy), which is why consent belongs in a service other systems query, not in a flag each system caches.</p>

<h4>Lawful basis, and why consent is often the wrong one</h4>
<p>Consent is one of six lawful bases in GDPR, and frequently the weakest choice. Processing an order needs no consent; it is <b>contractual necessity</b>. Fraud prevention and security logging are usually <b>legitimate interests</b>. Asking for consent where another basis applies creates an obligation you cannot honour: if a user withdraws consent for something you must do anyway to run the service, you have promised something untrue. Map each purpose to its basis first, then ask for consent only where consent is genuinely the basis: typically marketing, optional personalisation and non-essential cookies.</p>

<h4>What data-subject rights mean for the identity store</h4>
<ul>
<li><b>Access and portability</b>: you must be able to export everything you hold about one person, which means knowing every store that keys on a user id, including logs and backups.</li>
<li><b>Erasure</b>: genuinely hard, because deleting a user id from a relational store breaks referential integrity and audit records must survive. The usual answer is to delete or crypto-shred the personal data while retaining a pseudonymous id for the records that must remain, and to document that decision.</li>
<li><b>Correction</b>: including in the downstream systems provisioned from your directory.</li>
<li><b>Identity for the request itself</b>: a subject-access request is a beautiful phishing target, so verifying the requester is part of honouring the right.</li>
</ul>
<p><b>Privacy by design</b>, restated as engineering: collect the minimum, separate identifiers from attributes, set retention per purpose and enforce it automatically, encrypt personal data at rest, and make every one of those choices visible in the data model rather than in a policy document nobody reads.</p>`,
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
tests:[{d:'consent must be explicit',re:'explicit\\s*&&'},{d:'consent must be granular',re:'granular'},{d:'consent must be revocable',re:'revocable'}],
behavior:`valid(true,true,true) is true; dropping any one makes it false. Pre-ticked boxes are not explicit, all-or-nothing is not granular, and consent you cannot withdraw is not consent; each is executed as its own case.`,
hints:['Three conditions joined with &&.','A pre-ticked box is not explicit consent.','If it cannot be withdrawn, it is not consent.']}},
{id:'igaudit',title:'Identity audit, logging & compliance',body:`
<p>You cannot prove security you cannot show. Identity systems must keep an <b>audit trail</b> of the events that matter (logins and failures, MFA challenges, password and privilege changes, consent grants, and every admin action), recording <b>who did what, to whom, and when</b>. These logs should be tamper-evident and retained per policy.</p>
<p>What the logs power:</p>
<ul>
<li><b>Investigations & detection</b>: feed them to a <b>SIEM</b> to alert on suspicious patterns (a burst of failed logins, a new admin, impossible travel).</li>
<li><b>Access reviews</b>: periodic certification that people still need what they hold (IGA), evidenced by the trail.</li>
<li><b>Compliance</b>: frameworks like <b>SOC 2</b>, ISO 27001, and <b>NIST 800-63</b> map controls to exactly these identity practices: MFA, least privilege, timely deprovisioning, and complete audit logs. The audit trail is the evidence auditors ask for.</li>
</ul>
<p>Design notes: log identity events as structured, append-only records; never log secrets or full tokens; correlate with a request/trace id; and make sure <b>deprovisioning</b> and access-review actions are themselves logged: the controls have to prove they ran.</p>

<h4>What makes a log an audit trail</h4>
<p>Application logs and audit logs answer different questions and have different rules. An audit event is a <b>factual record of an action</b>, written for someone who was not there and may be reading it in two years: actor, action, target, outcome, time, and the context that makes it interpretable: source address, session or request id, client, and which policy allowed it. It is append-only, retained on a schedule you can state, and protected so that the people whose actions it records cannot alter it. That last property is why audit logs are shipped off the machine that produces them within seconds, and why write access to the audit store is itself a privileged operation.</p>
<p>Two things distinguish a usable trail from a pile of lines. <b>Events are structured</b>, with stable field names, so a query for "every privilege change by this admin" is a filter rather than a regular expression. And <b>failures are recorded as carefully as successes</b>: a denied access is often the more interesting event, and a trail that only shows what worked cannot show an attack that did not.</p>

<h4>What must never appear in it</h4>
<p>Passwords, tokens, session identifiers, MFA codes, private keys, full card numbers, and the contents of assertions. This matters more in identity than elsewhere, because the audit pipeline is widely readable by design (SOC analysts, auditors, on-call engineers), so a token in a log has effectively been published. Log identifiers and hashes instead: a token's <code>jti</code>, a key's <code>kid</code>, the last four digits, a salted hash of an email where correlation is needed without exposure. And treat the pipeline as processing personal data, because names, addresses and behaviour patterns are exactly what identity events contain.</p>

<h4>From evidence to control</h4>
<p>The reason to invest here is that in identity the audit trail is not documentation of the controls; it <i>is</i> several of them. Access reviews are evidenced by it. Deprovisioning is proved by it. "Least privilege" is measurable only if you can see what was actually used, which is what makes usage-derived recommendations possible. Detection (impossible travel, a burst of failures, a new admin, a first-time-seen client) reads the same stream. And the real test of the whole thing is a rehearsal: pick a real question ("which accounts did this compromised admin touch on Tuesday?") and try to answer it from the logs alone. Most teams discover a missing field the first time, which is much better than discovering it during an incident.</p>`,
docs:[['Logging & monitoring (OWASP)','https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html'],['NIST SP 800-63','https://pages.nist.gov/800-63-3/'],['SOC 2 overview','https://www.aicpa-cima.com/topic/audit-assurance/audit-and-assurance-greater-than-soc-2']],
ex:{title:'Map the requirement to the control',
prompt:`Write class <code>Audit</code> with <code>static String control(String requirement)</code>: <code>"prove-who-did-what"</code>→<code>"immutable audit log"</code>, <code>"detect-attacks"</code>→<code>"SIEM alerting"</code>, <code>"periodic-access-review"</code>→<code>"IGA certification"</code>, <code>"remove-leaver-access"</code>→<code>"deprovisioning"</code>, and <code>"unknown"</code> otherwise.`,
starter:`public class Audit {
    static String control(String requirement) {
        return null;
    }
}`,
solution:`public class Audit {
    static String control(String requirement) {
        switch (requirement) {
            case "prove-who-did-what":     return "immutable audit log";
            case "detect-attacks":         return "SIEM alerting";
            case "periodic-access-review": return "IGA certification";
            case "remove-leaver-access":   return "deprovisioning";
            default:                       return "unknown";
        }
    }
}`,
tests:[{d:'who-did-what -> immutable audit log',re:'"prove-who-did-what".*?"immutable audit log"',flags:'s'},{d:'detect attacks -> SIEM alerting',re:'"detect-attacks".*?"SIEM alerting"',flags:'s'},{d:'access review -> IGA certification',re:'"periodic-access-review".*?"IGA certification"',flags:'s'},{d:'remove leaver access -> deprovisioning',re:'"remove-leaver-access".*?"deprovisioning"',flags:'s'},{d:'unknown default',re:'"unknown"'}],
behavior:`control("prove-who-did-what") is "immutable audit log", control("detect-attacks") is "SIEM alerting". Compliance frameworks (SOC 2, NIST 800-63) map their requirements onto exactly these identity controls.`,
hints:['Proving who did what needs an immutable, append-only audit log.','Detecting attacks in real time is a SIEM job.','Access reviews are IGA certification; removing a leaver is deprovisioning.']}},

{id:'ig7',title:'Non-human identity: the majority nobody governs',body:`
<p>Count the identities in a typical estate and the humans are a minority. Service accounts, CI
runners, scripts, integrations, API keys, workload certificates, bots and now agents outnumber
employees by a wide margin, commonly quoted at ten to one or more. Almost every governance control in
this stream was designed for the humans.</p>
<p>The consequence is predictable: <b>non-human identities are more numerous, more privileged and less
governed than human ones</b>, and they are increasingly the way in.</p>

<h4>Why the human controls do not transfer</h4>
<div class="codeSample" data-hl>HUMAN IDENTITY                    NON-HUMAN IDENTITY
joins via HR, leaves via HR       created ad hoc by whoever needed it
has a manager                     has an owner who left in 2021
MFA                               a static secret in a config file
password expires                  the credential never expires
access reviewed quarterly         never reviewed — reviewers do not know
                                    what it does or dare disable it
one person, one account           shared across teams and environments
leaves when the person leaves     outlives every person who touched it</div>
<p>The joiner-mover-leaver lifecycle has no equivalent trigger here. Nothing tells you a service account
is finished, so nothing ever removes it. Estates accumulate them monotonically.</p>

<h4>The four failure modes</h4>
<ol>
<li><b>No owner.</b> The single most common finding. Nobody knows what it does, so nobody will disable
it, so it stays forever with whatever rights it was given. An identity without a named, current owner
is ungovernable by definition.</li>
<li><b>Over-privilege.</b> Granted broad rights during setup "to get it working", never narrowed.
Service accounts are frequently the most privileged principals in the estate.</li>
<li><b>Static long-lived credentials.</b> A secret in a config file, a repo, a CI variable, a wiki page.
It does not rotate because rotation risks an outage nobody wants to own.</li>
<li><b>Sprawl and sharing.</b> One account used by six systems cannot be rotated without breaking five,
and its logs cannot attribute anything to anyone.</li>
</ol>

<h4>What good looks like</h4>
<ul>
<li><b>Every NHI has a named human owner and an expiry.</b> Both mandatory at creation, and both
re-confirmed periodically. An expiry that must be renewed converts "forever" into a decision someone
takes deliberately.</li>
<li><b>One identity per workload</b>, never shared across systems or environments, so it can be
rotated, revoked and attributed independently.</li>
<li><b>Prefer no credential at all.</b> The strongest control is workload identity federation: the
workload proves what it is (mTLS, SPIFFE, a platform OIDC token) and exchanges that for short-lived
access. There is then no static secret to leak, rotate or find in a repository.</li>
<li><b>Where a secret is unavoidable</b>, keep it in a manager, rotate automatically, and record
last-used so dead credentials are visible.</li>
<li><b>Review them like humans, with different questions.</b> Not "should this person have access" but
"does this still run, does it still need this, and who owns it now?" Instrument last-used first: an
NHI unused for ninety days is a candidate for removal and the easiest win available.</li>
</ul>

<h4>The reviewer's problem, and how to fix it</h4>
<p>Human access reviews work because a manager recognises their reports. Nobody recognises
<code>svc-etl-prod-3</code>. Reviewers therefore approve everything, and the review becomes a
compliance artefact with no security value.</p>
<p>The fix is not more reviews but <b>better evidence</b>: show the reviewer what the identity did, when
it last ran, what it accessed and who owns it. Given that, a reviewer can make a real decision. Given a
list of names, they cannot, and asking anyway trains people that reviews are theatre.</p>

<h4>Where agents make this urgent</h4>
<p>Agents are non-human identities created at high velocity, often per-task, frequently with delegated
user authority. Every problem above applies, faster, and with the added property that an agent's
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
tests:[{d:'requires a named owner',re:'owner\\s*!==?\\s*""'},{d:'the owner must still be employed',re:'ownerStillEmployed'},{d:'the credential must not have expired',re:'expiresAt\\s*>\\s*now'}],
behavior:`governable("ada",true,2000,1000) is true. An empty owner, a departed owner, or a lapsed expiry each make it false: the three ways service accounts become the ungoverned majority.`,
hints:['Three conditions joined with &&.','An empty string is not a named owner.','Expiry is in the future when expiresAt > now.']}}
]});
