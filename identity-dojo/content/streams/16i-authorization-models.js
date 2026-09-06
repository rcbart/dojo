STREAMS.push({icon:'🧩',iam:true,sec:'Authorization models',title:'Authorization Models',blurb:'Once you know who someone is, how do you decide what they can do? ACLs, RBAC (roles), ABAC (attributes/policy), ReBAC (relationships), and policy engines, plus least privilege, separation of duties, and the PDP/PEP split.',lessons:[

{id:'az1',title:'From ACLs to roles (RBAC)',body:`


<p>The simplest model is an <b>Access Control List</b> (ACL): each resource keeps a list of who may do what. It's precise and it doesn't scale.</p>
<p><b>RBAC</b> (Role-Based Access Control) adds indirection. Users get <b>roles</b> (admin, editor, viewer), and roles carry <b>permissions</b>. You manage a handful of roles, not millions of user-resource pairs. It's the default model in most enterprises.</p>
<div class="codeSample" data-hl>// a permission check reduces to: does this user hold a role that grants it?
boolean allowed = user.roles().contains("admin");</div>

<h4>Why ACLs stop scaling</h4>
<p>An ACL attaches permissions to the <i>object</i>: this file lists who may read it. That's O(users x
objects) to administer. Onboarding one person means touching every object they need. Offboarding means
finding every object that mentions them. A missed one is a permanent orphaned grant.</p>
<p>RBAC's indirection (<b>users get roles, roles carry permissions</b>) turns onboarding into a single
assignment. That's the whole gain, and the whole cost: "who can read this file?" is no longer answered at
the file.</p>
<div class="codeSample" data-hl>ACL          alice: read, bob: write        on EACH object
             precise, no indirection, and unmanageable past a few hundred

RBAC         alice -> "editor" -> {read, write}
             one assignment per person; permissions defined once per role
             but "who can see X?" now requires walking the model backwards

// ACLs did not disappear. filesystems, S3 and object sharing still use them,
// because per-object precision is exactly what those need.</div>

<h4>The distinction to keep straight</h4>
<p>A <b>permission</b> is a verb on a resource: <code>invoice:read</code>. A <b>role</b> is a named
bundle of permissions. A <b>group</b> is a collection of people. Roles and groups are not
interchangeable. "Who is in Finance?" is an HR question. "What may Finance do?" is a
security question. Collapse them and every org-chart change becomes an unreviewed permissions change.</p>

<h4>Where ACLs are still the right answer</h4>
<p>RBAC never replaced ACLs for <b>per-object sharing</b>. When a user shares one document with one
colleague, no role expresses that. The grant belongs to the object. Every file-sharing product works this
way. As roles it would be one role per document, the reductio of role explosion.</p>
<p>So real systems are hybrids: coarse organizational access from roles, fine per-object access from lists
or relationships.</p>

<h4>The question RBAC makes harder</h4>
<p>With RBAC, "who can read this file?" means walking backwards from permission to roles to every user
and group holding them. Auditors, incident responders and customers ask that reverse question.
If your system can't answer it on demand, access reviews are people approving role names they can't
evaluate. The relationship-based model in the next lessons is built to solve this.</p>

<h4>Deny, and why RBAC mostly avoids it</h4>
<p>ACLs commonly support explicit deny entries. Once allow and deny both exist, the answer depends on
precedence rules a reader has to hold in their head. Most RBAC implementations are deliberately
<b>allow-only</b>. You hold a permission or you don't. Exclusions go through <b>separation-of-duties</b>
constraints, checked at assignment time rather than at every decision. Separation of duties means no
single person may hold a conflicting combination: the one who creates a payment must not also be the
one who approves it. When you meet a model with deny
rules, find out how conflicts resolve.</p>`,
docs:[['RBAC, NIST','https://csrc.nist.gov/projects/role-based-access-control'],['Access control, OWASP','https://cheatsheetseries.owasp.org/cheatsheets/Access_Control_Cheat_Sheet.html']],
ex:{title:'Role check',gradeJava:{class:'Rbac',cases:[{name:'admin present -> true',call:'isAdmin',args:['java.util.Set.of("admin")'],expect:'true'},{name:'no admin -> false',call:'isAdmin',args:['java.util.Set.of("viewer")'],expect:'false'}]},
prompt:`Write class <code>Rbac</code> with <code>static boolean isAdmin(java.util.Set&lt;String&gt; roles)</code> that returns true only when the set of roles contains <code>"admin"</code>.`,
starter:`import java.util.Set;
public class Rbac {
    static boolean isAdmin(Set<String> roles) {
        return false;
    }
}`,
solution:`import java.util.Set;
public class Rbac {
    static boolean isAdmin(Set<String> roles) {
        return roles.contains("admin");
    }
}`,
tests:[{d:'checks membership of the admin role',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:roles\\.contains\\s*\\(\\s*"admin"\\s*\\)))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:roles\\.contains\\s*\\(\\s*"admin"\\s*\\))[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:roles\\.contains\\s*\\(\\s*"admin"\\s*\\))[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:roles\\.contains\\s*\\(\\s*"admin"\\s*\\))[^{]*?return\\s+\\k<av>\\b)'},{d:'does not hardcode true',re:'isAdmin\\s*\\([^)]*\\)\\s*\\{\\s*return\\s+true\\s*;',not:true}],
behavior:`isAdmin(Set.of("editor","admin")) is true; isAdmin(Set.of("viewer")) is false. RBAC turns a permission check into a role-membership check.`,
hints:['A Java Set has a contains method that returns a boolean.','Return the result of roles.contains("admin") directly.','No if statement is needed; the contains call already yields the boolean.']}},

{id:'az2',title:'RBAC in depth: roles to permissions',body:`


<p>Roles map to concrete <b>permissions</b>: a viewer reads, an editor reads and writes, an admin reads, writes and deletes. Keep the mapping in one place so a policy change is one edit.</p>
<p>Prefer a few broad roles over hundreds of narrow ones, and grant each role the <b>least privilege</b> it needs. Rules roles can't express ("only the owner", "only during business hours") are the job of <b>ABAC</b>, attribute-based access control, next lesson. Roles decide by the titles you hold. ABAC decides by facts about you, the resource and the moment: only the owner, only from a managed device, only during business hours.</p>

<h4>Role explosion, and the two forces causing it</h4>
<p><b>RBAC</b>, role-based access control, decides by the roles you hold ("managers may approve expenses"). It decays predictably. Someone needs a permission slightly different from an existing role, so a new
role is created. Five years later you have <code>Finance-EU-ReadOnly-Q3</code> and eight hundred
siblings, several identical under different names.</p>
<p>The forces are <b>exceptions</b> (one person needs one extra thing) and <b>dimensions</b> (region,
environment, business unit, seniority, each a multiplier). Exceptions need a separate mechanism with an
expiry, not a permanent role. <b>A dimension is an attribute, not a role.</b></p>

<h4>Hierarchy, and where it misleads</h4>
<p>Hierarchies let senior roles inherit junior ones. That fails on the case that matters: an auditor
needs broad <i>read</i> and no <i>write</i>, so they are neither "above" nor "below" an editor.
Hierarchies also hide effective permissions: a grant three levels up appears nowhere near the role you
inspect.</p>

<h4>The number that matters</h4>
<p>The reviewable figure for a person is <b>effective permissions</b>: the flattened union across
every role and group, direct and inherited. If your system can't produce that on demand, you can't
answer the only question an auditor asks.</p>

<h4>Designing roles from job functions, not from screens</h4>
<p>The common mistake is deriving roles from the user interface: a role per page, or per feature flag.
Those change with every release and mean nothing to the manager approving them.</p>
<p>Roles derived from <b>job functions</b> (what a person is employed to do) are stable across releases
and reviewable by someone who knows the business. The test: can a non-engineer read the role name and
say whether this person should have it? "Claims Adjuster" passes. "invoice-page-write" does not.</p>

<h4>Two tiers, business and technical</h4>
<p>Mature implementations separate <b>business roles</b> from <b>technical roles</b>. A person is granted
a business role ("Claims Adjuster"), composed of technical roles or permission sets in individual
applications. Adding an application means composing a new technical role into an existing business role,
not granting every person something new.</p>
<p>For joiners, a <b>birthright</b> business role attached to a job title grants a default on day
one. Everything beyond it is <b>requestable</b>: approved, time-bound, expiring on its own.
Standing access accumulates. Time-bound access does not.</p>

<h4>Ownership, or the review is theatre</h4>
<p>Every role needs a named owner who can say what it is for and whether it is still correct. Without one,
a review is a manager approving names they can't evaluate, worse than no review because it produces an audit
artifact saying someone checked.</p>
<p>Two health numbers: the ratio of roles to users, which should fall as the organization grows, and the
proportion of grants that are time-bound rather than standing. Both are cheap to compute and neither is
usually measured.</p>`,
docs:[['RBAC roles & permissions','https://auth0.com/docs/manage-users/access-control/rbac'],['Least privilege','https://csrc.nist.gov/glossary/term/least_privilege']],
},

{id:'az3',title:'ABAC: attributes & policy',body:`


<p><b>ABAC</b> (Attribute-Based Access Control) decides using <i>attributes</i> of the user, the resource, the action, and the context. "An employee may view a record <b>in their own department</b>." "A manager may approve amounts <b>under their limit</b>." "Access only <b>during business hours</b>." Roles alone can't express any of these.</p>
<p>ABAC is more expressive than <b>RBAC</b>, role-based access control, and harder to reason about. RBAC decides by the roles you hold ("managers may approve expenses"); ABAC decides by facts about you, the resource and the moment. The rule is written as a boolean policy over the attributes.</p>

<h4>The four attribute categories</h4>
<div class="codeSample" data-hl>SUBJECT      who is asking      department, clearance, employment status, manager
RESOURCE     what is touched    classification, owner, tenant, project, age
ACTION       what they want     read, write, approve, export
ENVIRONMENT  the context        time of day, network, device posture, location

// a policy is a boolean over those four:
permit if subject.department == resource.department
       and subject.clearance >= resource.classification
       and action == "read"
       and environment.network == "corporate"</div>
<p>This policy covers every department without naming one, and adding a department needs no policy
change. RBAC would need a role per department, per action.</p>

<h4>What you pay for it</h4>
<ul>
<li><b>You can't enumerate access.</b> "Who can read this document?" is no longer a lookup. It's a
question about every possible subject against a predicate. Auditors ask it.</li>
<li><b>Attributes must be trustworthy and fresh.</b> The policy is only as good as
<code>subject.clearance</code>, which comes from a <b>directory</b> that may be stale. A directory is
the database of people, groups and machines an organization keeps. Attributes in a token
are as old as the token.</li>
<li><b>Debugging is harder.</b> A denial has no single cause, only a failing <b>conjunct</b>, one of the
conditions the policy joins with "and", and the engine
has to tell you which one.</li>
</ul>

<h4>The hybrid most estates run</h4>
<p>RBAC for the coarse gate (may this <i>kind</i> of user reach this endpoint at all), ABAC for the fine
one, where ownership, tenant and context decide. A <b>tenant</b> is one customer organization inside a
shared system. That matches the split in the data-level lesson: roles
at the edge, attributes next to the data. It keeps the enumerable part enumerable, so reviews stay
possible.</p>

<h4>The cookbook: one request, evaluated by hand</h4>
<div class="codeSample" data-hl>// the request, as the decision point sees it
subject:     { id:"ada", department:"eng", clearance:2, status:"active" }
resource:    { id:"doc-7", department:"eng", classification:3, owner:"bob" }
action:      "read"
environment: { network:"corporate", time:"14:20" }

// the policy from above, conjunct by conjunct
subject.department == resource.department      eng == eng    PASS
subject.clearance  &gt;= resource.classification  2 &gt;= 3        FAIL  &lt;- here
action == "read"                               not evaluated: already denied
environment.network == "corporate"             not evaluated

decision: DENY. failing conjunct: clearance.</div>
<p>The engine must say <i>which conjunct failed</i>. A bare DENY turns every access ticket into an
investigation. Note also where each attribute came from: department from the directory (stale by one
sync), clearance from HR (stale by one export), network from the request itself (fresh, and the only one
the caller can influence). Write the source and the staleness next to every attribute your policies
use.</p>`,
docs:[['ABAC (NIST 800-162)','https://csrc.nist.gov/publications/detail/sp/800-162/final'],['ABAC vs RBAC (NIST)','https://csrc.nist.gov/pubs/journal/2010/06/adding-attributes-to-rolebased-access-control/final']],
ex:{title:'Write an attribute policy',
prompt:`Write class <code>Abac</code> with <code>static boolean permit(String userDept, String resourceDept, boolean isOwner)</code> that allows access when the user is in the same department as the resource <b>or</b> the user owns the resource.`,
starter:`public class Abac {
    static boolean permit(String userDept, String resourceDept, boolean isOwner) {
        return false;
    }
}`,
solution:`public class Abac {
    static boolean permit(String userDept, String resourceDept, boolean isOwner) {
        return userDept.equals(resourceDept) || isOwner;
    }
}`,
tests:[{d:'same-department attribute grants access',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:userDept\\.equals\\s*\\(\\s*resourceDept\\s*\\)))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:userDept\\.equals\\s*\\(\\s*resourceDept\\s*\\))[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:userDept\\.equals\\s*\\(\\s*resourceDept\\s*\\))[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:userDept\\.equals\\s*\\(\\s*resourceDept\\s*\\))[^{]*?return\\s+\\k<av>\\b)'},{d:'ownership also grants access',re:'\\|\\|\\s*isOwner'}],
behavior:`permit("sales","sales",false) is true (same department); permit("sales","hr",true) is true (owner); permit("sales","hr",false) is false. The decision is a boolean over attributes, not a fixed role.`,
hints:['Compare the two department strings with equals.','Combine the department match with ownership using the || operator.','Either condition being true should grant access.']}},

{id:'az4',title:'ReBAC & policy engines',body:`


<p>Some questions are about <b>relationships</b>. "Can this user view this document?" depends on whether it was <i>shared with</i> them, who <i>owns</i> it, and which <i>group</i> they belong to. <b>ReBAC</b> (Relationship-Based Access Control) models permissions as a graph of relations. It's the approach behind Google&#8217;s Zanzibar and open-source <b>OpenFGA</b>.</p>
<p>To keep policy out of scattered <code>if</code> statements, teams externalize it to a <b>policy engine</b>. The app asks "is this allowed?" and the engine answers from declarative rules. <b>OPA</b>, Open Policy Agent, and <b>AWS Cedar</b> are the common choices. OPA is a general-purpose policy engine you run beside your service, with rules written in its own language, Rego. This is <b>PBAC</b>, Policy-Based Access Control. Security rules can change without redeploying the app.</p>

<h4>Why relationships, not attributes</h4>
<p>ReBAC answers a question the other models can't phrase: access that exists <i>because of a link
between two objects</i>. "Ada can edit this document because she is an editor of the folder that contains
it" is neither a role nor an attribute. It's a path through a graph.</p>
<div class="codeSample" data-hl>RBAC   is the user in a role?                      set membership
ABAC   do the attributes satisfy a predicate?     boolean over fields
ReBAC  is there a PATH from user to object?       graph traversal

doc:readme#parent@folder:eng          the readme lives in eng
folder:eng#viewer@group:eng#member    eng members can view eng
group:eng#member@user:ada             ada is in eng
-> ada can view the readme. stated nowhere; derived by walking.</div>
<p>This is the model behind every "share with", nested folder and inherited-permission feature you have
used. Document and repository products converge on it. An ordinary line-of-business app usually
shouldn't.</p>

<h4>Externalizing policy: what you gain and lose</h4>
<p><b>Gain:</b> policy stops being scattered <code>if</code> statements across services that drift apart.
It becomes reviewable, testable, versioned and consistent, and one place can answer "why was this
denied?"</p>
<p><b>Lose:</b> a runtime dependency on the critical path of every request. Decide deliberately what
happens when the engine is unreachable. Fail closed and an authorization outage is a total outage. Fail
open and you have no authorization at all. The usual answer is aggressive caching plus fail-closed, and
the caching brings back the staleness problem the scale lesson covers.</p>
<p><b>OPA</b> (Rego, general-purpose policy), <b>Cedar</b> (AWS, verification-friendly) and
<b>OpenFGA/SpiceDB</b> (Zanzibar-style relationship graphs) are the common engines. Pick on the shape of
your question: predicate over attributes, or path through a graph.</p>

<h4>The cookbook: the model, the tuples, and one check traced</h4>
<div class="codeSample" data-hl>// the model (OpenFGA-style): what CAN relate to what
type group      define member: [user]
type folder     define viewer: [group#member]
type document   define parent: [folder]
                define viewer: viewer from parent

// the tuples: what IS related, one row per fact
document:readme   parent   folder:eng
folder:eng        viewer   group:eng#member
group:eng         member   user:ada

// check(user:ada, viewer, document:readme) resolves by walking:
viewer of readme  = viewer from parent  -&gt; look at folder:eng
viewer of eng     = group:eng#member    -&gt; look at the group
member of eng     includes user:ada     -&gt; ALLOW, three hops</div>
<p>Before adopting, answer what that trace exposes. How deep can a path get? Every hop is a lookup, and a
folder tree twelve levels deep makes every check twelve reads unless the engine caches or flattens. And
who writes the tuples? A <b>tuple</b> is one row of relationship data, subject, relation and object, such as "ada is a member of
group eng". Sharing a document is now a data write, with the same consistency questions as any
other write. Revoke a viewer and a cached ALLOW can outlive the tuple. That is the new-enemy problem, and
the reason the engines talk about snapshot consistency.</p>`,
docs:[['Google Zanzibar','https://research.google/pubs/pub48190/'],['OpenFGA','https://openfga.dev/'],['Open Policy Agent','https://www.openpolicyagent.org/']],
ex:{title:'A relationship check',
prompt:`Write class <code>Rebac</code> with <code>static boolean canView(String user, String owner, java.util.Set&lt;String&gt; sharedWith)</code> that returns true when the user is the owner <b>or</b> the document was shared with them.`,
starter:`import java.util.Set;
public class Rebac {
    static boolean canView(String user, String owner, Set<String> sharedWith) {
        return false;
    }
}`,
solution:`import java.util.Set;
public class Rebac {
    static boolean canView(String user, String owner, Set<String> sharedWith) {
        return user.equals(owner) || sharedWith.contains(user);
    }
}`,
tests:[{d:'owner can view',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:user\\.equals\\s*\\(\\s*owner\\s*\\)))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:user\\.equals\\s*\\(\\s*owner\\s*\\))[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:user\\.equals\\s*\\(\\s*owner\\s*\\))[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:user\\.equals\\s*\\(\\s*owner\\s*\\))[^{]*?return\\s+\\k<av>\\b)'},{d:'shared-with relationship grants view',re:'sharedWith\\.contains\\s*\\(\\s*user\\s*\\)'},{d:'combines the relationships with OR',re:'\\|\\|'}],
behavior:`canView("ada","ada",Set.of()) is true (owner); canView("bo","ada",Set.of("bo")) is true (shared); canView("cy","ada",Set.of("bo")) is false. Access follows the relationship graph, which is what ReBAC models.`,
hints:['Ownership is an equals check between user and owner.','A shared relationship is membership in the sharedWith set.','Combine the two relationships with ||.']}},

{id:'az5',title:'PDP/PEP, least privilege & separation of duties',body:`

<p>The <b>PDP</b> (Policy Decision Point) answers "allow or deny". The <b>PEP</b> (Policy Enforcement Point) is the gate in front of the resource that <i>asks</i> the PDP and enforces the answer. One decision engine guards many enforcement points.</p>
<p>Two principles govern good policy. <b>Least privilege</b>: grant the minimum access needed, for the shortest time. <b>Separation of duties</b> (SoD): no single person holds a conflicting combination. The one who <i>creates</i> a payment must not also <i>approve</i> it.</p>

<h4>Why split the decision from the enforcement</h4>
<p>Left alone, authorization logic grows where the code is. An <code>if</code> in a controller, a check in
a template, a filter in a query, a rule in a background job. Each is correct on its own. Together they
are a policy nobody can state, and "who can approve a refund?" becomes a code search.</p>
<p>PDP/PEP is the response. <b>One place decides</b> and <b>many places enforce</b>. That buys
consistency across entry points, a policy you can read without reading code, and an audit trail of
decisions rather than outcomes.</p>
<div class="codeSample" data-hl>PEP  the gate in front of the resource. asks, then OBEYS.
     ("can user U do action A on resource R, in context C?")
PDP  the brain. evaluates policy, returns permit/deny.
PIP  policy INFORMATION point - where the PDP fetches facts it was not given
     (group membership, resource owner, device posture)
PAP  policy ADMINISTRATION point - where humans author and version policy

// the PEP must fail CLOSED: if the PDP is unreachable, DENY.
// a PEP that allows on error has inverted the entire control.</div>

<h4>The trade</h4>
<p>Centralizing the decision puts a dependency in the request path of everything. If the PDP is slow or
down, all of it is. So real deployments embed the PDP as a library or a <b>sidecar</b>, distribute policy as
data, and cache decisions carefully. A sidecar is a helper process that runs beside the service on the
same machine. A cached <i>permit</i> is a revocation you haven't honored yet.</p>

<h4>Least privilege you can act on</h4>
<p>"Grant the minimum needed" is unactionable, because nobody knows what is needed. The implementable
version has three parts. <b>Minimum scope</b>: this resource, not the class of resources. <b>Minimum
duration</b>: elevate for the task, expire automatically. <b>Minimum blast radius</b>: read where read
suffices, and separate production from everything else.</p>
<p>Start from denial. Log what was refused, and grant against evidence. Granting broadly and trimming
later never converges, because nothing forces the trim.</p>

<h4>Separation of duties: two enforcement moments</h4>
<p>No single person should hold both halves of a value-moving transaction: create and approve a payment,
amend and approve payroll, write and deploy code, grant and use access. It is an anti-fraud and audit control
inherited from accounting, not a defense against outsiders.</p>
<p>Enforce it <b>preventively</b> at request time, blocking the grant that would create the conflict, and
<b>detectively</b> by scanning existing holdings. Most real conflicts arrive sideways: access granted
directly in a system, or a role definition that changed under its members. Where the conflict is
unavoidable, as on small teams, document a mitigating control with an owner and an expiry.</p>`,
docs:[['PDP/PEP (XACML)','https://en.wikipedia.org/wiki/XACML'],['Separation of duties','https://csrc.nist.gov/glossary/term/separation_of_duty']],
ex:{title:'Detect a separation-of-duties conflict',
prompt:`Write class <code>Sod</code> with <code>static boolean violates(java.util.Set&lt;String&gt; roles)</code> that returns true when a user holds <b>both</b> conflicting roles <code>"maker"</code> and <code>"checker"</code> at once.`,
starter:`import java.util.Set;
public class Sod {
    static boolean violates(Set<String> roles) {
        return false;
    }
}`,
solution:`import java.util.Set;
public class Sod {
    static boolean violates(Set<String> roles) {
        return roles.contains("maker") && roles.contains("checker");
    }
}`,
tests:[{d:'checks for the maker role',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:contains\\s*\\(\\s*"maker"\\s*\\)))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:contains\\s*\\(\\s*"maker"\\s*\\))[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:contains\\s*\\(\\s*"maker"\\s*\\))[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:contains\\s*\\(\\s*"maker"\\s*\\))[^{]*?return\\s+\\k<av>\\b)'},{d:'checks for the checker role',re:'contains\\s*\\(\\s*"checker"\\s*\\)'},{d:'a violation needs BOTH roles',re:'&&'}],
behavior:`violates(Set.of("maker","checker")) is true; violates(Set.of("maker")) is false. Holding both halves of a create-and-approve pair breaks separation of duties.`,
hints:['A conflict exists only when both roles are present, so use &&.','Check membership of each role with contains.','One role alone is fine; it is the combination that violates the rule.']}},

{id:'az6',title:'Data-level authorization: the check that actually matters',body:`

<p><b>RBAC</b>, <b>ABAC</b> and <b>ReBAC</b> all answer the same shape of question: <i>may this user perform this kind of
action?</i> Role-based access control decides by the roles you hold ("managers may approve expenses").
Attribute-based access control decides by facts about you, the resource and the moment ("only from a
managed device, only during business hours"). Relationship-based access control decides by how you're
connected to the thing ("she may edit it because she's an editor of the folder it's in").
None of them looks at <i>which</i> record is being fetched, so every one of them will
approve a request that returns somebody else's data. That gap is where most real authorization bugs
live.</p>

<h4>Two questions, and only one usually gets asked</h4>
<div class="codeSample" data-hl>ENDPOINT authorization   "may this user call GET /invoices/{id}?"   <- role check
OBJECT   authorization   "is invoice 4417 theirs to see?"          <- often missing

// the bug, in its most common form:
@RequiresRole("customer")
Invoice get(long id) {
    return repo.findById(id);   // any customer, any invoice
}</div>
<p>Change the <code>4417</code> in the URL to <code>4418</code> and you're reading another customer's
invoice. This is <b>IDOR</b>, insecure direct object reference: the application checks that you're logged
in, then hands over whatever record you name in the URL without checking it's yours. The API world calls
the same bug <b>broken object-level authorization</b>. It sits at the top of the OWASP API Security Top
10, the most cited list of the ways web APIs get broken into. The role check
passed, the test suite passed, and nothing looked wrong.</p>
<p>The endpoint check is <i>visible</i>: an annotation, a line in the design doc, something a reviewer
notices when it's missing. The object check is invisible. Its absence looks like working code.</p>

<h4>Guessable ids aren't the problem</h4>
<p>Replacing sequential ids with UUIDs stops casual enumeration and keeps your customer count out of
your URLs. Do it. But it isn't <b>an authorization control</b>. References leak: shared links,
referral logs, exports, support tickets, any former employee who saw them. An unguessable identifier
is obscurity. An ownership check is security. Do both.</p>

<h4>Filter in the query, don't check after</h4>
<p>Two places to enforce ownership. Only one scales:</p>
<div class="codeSample" data-hl>// FRAGILE: fetch first, check after. Every new call site must remember.
Invoice inv = repo.findById(id);
if (inv.tenantId != currentTenant) throw new Forbidden();

// SAFE: the constraint is part of the query. Wrong tenant simply finds nothing.
Invoice inv = repo.findByIdAndTenantId(id, currentTenant);

// and for lists, the filter must be in the WHERE clause, never applied afterwards
SELECT * FROM invoices WHERE tenant_id = ? AND status = ?</div>
<p>Check-after fails the moment someone adds a new query, and someone always does. Put the constraint
in the data access layer and the safe path is the default: a repository that <i>can't</i> fetch across
tenants can't leak across tenants. A <b>tenant</b> is one customer organization inside a shared
system.</p>
<p><b>Lists and search</b> get forgotten while the detail endpoint is guarded, and a search that ignores
the tenant filter leaks in bulk. <b>Counts and aggregates</b> leak too. Telling a user that a search
matched 4,000 records reveals information even if it returns none of them.</p>

<h4>Field-level: not every column is equally visible</h4>
<p>Two users may both be entitled to a record and to <i>different parts</i> of it. A support agent
reads the order but not the full card number. A manager sees a direct report's salary while a peer
doesn't.</p>
<p>The dangerous habit is serializing the whole entity and trusting the UI to hide things. The UI isn't
an authorization boundary: the JSON already contains the field, and anyone can open developer tools.
<b>Mask or omit at the point of serialization</b>, driven by the caller's permissions. The same applies
to writes. Copying a whole submitted object onto an entity lets a caller set fields they should never
control, which is how <code>"role":"admin"</code> ends up in a profile update.</p>

<h4>Where the check belongs</h4>
<p>A gateway can enforce endpoint authorization, because it can see the route and the token. It can't
enforce object authorization, because it doesn't know who owns record 4417. Only the service holding
the data does. <b>Coarse checks at the edge, ownership checks next to the data.</b> A design that
pushes all authorization to the perimeter has no answer to IDOR.</p>`,
docs:[['OWASP API Security Top 10: API1:2023 Broken Object Level Authorization','https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/'],['OWASP: Insecure Direct Object Reference Prevention Cheat Sheet','https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html'],['PostgreSQL (Row Security Policies)','https://www.postgresql.org/docs/current/ddl-rowsecurity.html']],
ex:{title:'Ownership checks and field masking',
prompt:`Write <code>DataAuthz</code> with three methods. <code>static boolean canRead(String callerTenant, String recordTenant)</code> returns true only when both are non-null and equal: the ownership check that role-based rules never perform. <code>static String scopedQuery(String base)</code> returns <code>base + " AND tenant_id = ?"</code>, putting the constraint in the query rather than checking after the fetch. <code>static String maskCard(String pan, boolean fullAccess)</code> returns <code>pan</code> unchanged when <code>fullAccess</code> is true; otherwise it returns <code>"****"</code> plus the <b>last 4 characters</b>. Return <code>"****"</code> if <code>pan</code> is null or shorter than 4.`,
starter:`public class DataAuthz {
    static boolean canRead(String callerTenant, String recordTenant) {
        return false;
    }
    static String scopedQuery(String base) {
        return null;
    }
    static String maskCard(String pan, boolean fullAccess) {
        return null;
    }
}`,
tests:[{d:'ownership requires a caller tenant',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:callerTenant\\s*[=!]=\\s*null|null\\s*[=!]=\\s*callerTenant))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:callerTenant\\s*[=!]=\\s*null|null\\s*[=!]=\\s*callerTenant)[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:callerTenant\\s*[=!]=\\s*null|null\\s*[=!]=\\s*callerTenant)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:callerTenant\\s*[=!]=\\s*null|null\\s*[=!]=\\s*callerTenant)[^{]*?return\\s+\\k<av>\\b)'},{d:'the two tenants are compared by value',re:'equals\\s*\\('},{d:'the tenant filter is part of the query',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:AND\\s+tenant_id\\s*=\\s*\\?))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:AND\\s+tenant_id\\s*=\\s*\\?)[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:AND\\s+tenant_id\\s*=\\s*\\?)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:AND\\s+tenant_id\\s*=\\s*\\?)[^{]*?return\\s+\\k<av>\\b)'},{d:'full access returns the unmasked value',re:'fullAccess'},{d:'masked output hides all but the last digits',re:'"\\*\\*\\*\\*"'},{d:'the last four characters are kept',re:'length\\s*\\(\\s*\\)\\s*-\\s*4'}],
behavior:`canRead("t1","t1") is true; canRead("t1","t2"), canRead(null,"t1") and canRead("t1",null) are all false: this is the check that stops changing 4417 to 4418 in the URL from returning someone else's record. scopedQuery("SELECT * FROM invoices WHERE status = ?") appends AND tenant_id = ?, so a wrong tenant finds nothing rather than being caught afterwards by a check somebody might forget to write. maskCard("4111111111111234", true) returns the full value; with false it returns ****1234; maskCard(null, false) and maskCard("12", false) return ****.`,
hints:['<code>return callerTenant != null &amp;&amp; callerTenant.equals(recordTenant);</code>','Simple concatenation: <code>return base + " AND tenant_id = ?";</code>','Guard the length before slicing: <code>pan.substring(pan.length() - 4)</code>.'],
solution:`public class DataAuthz {
    static boolean canRead(String callerTenant, String recordTenant) {
        // the object-level check a role annotation never performs
        return callerTenant != null && callerTenant.equals(recordTenant);
    }
    static String scopedQuery(String base) {
        // constraint in the query: the wrong tenant simply finds nothing
        return base + " AND tenant_id = ?";
    }
    static String maskCard(String pan, boolean fullAccess) {
        if (fullAccess) return pan;
        // mask at serialisation: the UI is not an authorization boundary
        if (pan == null || pan.length() < 4) return "****";
        return "****" + pan.substring(pan.length() - 4);
    }
}`}},

{id:'az7',title:'Groups: how membership becomes permission',body:`



<p>Roles are how authorization is <i>modeled</i>. Groups are how it's <i>administered</i>. Every
enterprise <b>directory</b>, the database of people, groups and machines an organization keeps, hands out
access by putting people in groups.</p>

<h4>The chain</h4>
<div class="flowDia"><svg viewBox="0 0 640 92" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="The access chain: user, group, role, permission, resource, with Ada as the example"><defs><marker id="az7-ah" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent)"/></marker></defs>
<rect x="10" y="8" width="100" height="46" rx="8" class="fdActor"/><text x="60" y="27" class="fdActorT">user</text><text x="60" y="42" class="fdActorS">Ada</text>
<line x1="113" y1="31" x2="136" y2="31" stroke="var(--accent)" class="fdArrow" marker-end="url(#az7-ah)"/>
<rect x="140" y="8" width="100" height="46" rx="8" class="fdActor"/><text x="190" y="27" class="fdActorT">group</text><text x="190" y="42" class="fdActorS">Platform</text>
<line x1="243" y1="31" x2="266" y2="31" stroke="var(--accent)" class="fdArrow" marker-end="url(#az7-ah)"/>
<rect x="270" y="8" width="100" height="46" rx="8" class="fdActor"/><text x="320" y="27" class="fdActorT">role</text><text x="320" y="42" class="fdActorS">Deploy</text>
<line x1="373" y1="31" x2="396" y2="31" stroke="var(--accent)" class="fdArrow" marker-end="url(#az7-ah)"/>
<rect x="400" y="8" width="100" height="46" rx="8" class="fdActor"/><text x="450" y="27" class="fdActorT">permission</text><text x="450" y="42" class="fdActorS">deploy:write</text>
<line x1="503" y1="31" x2="526" y2="31" stroke="var(--accent)" class="fdArrow" marker-end="url(#az7-ah)"/>
<rect x="530" y="8" width="100" height="46" rx="8" class="fdActor"/><text x="580" y="27" class="fdActorT">resource</text><text x="580" y="42" class="fdActorS">prod cluster</text>
<text x="320" y="80" class="fdNote">nobody grants Ada anything directly: she joins Platform and inherits what it holds</text>
</svg></div>
<p>Left to right: Ada is in the <code>Platform</code> group; <code>Platform</code> holds the Deploy role; Deploy carries the <code>deploy:write</code> permission on the production cluster. The indirection is worth it because nobody grants Ada anything directly. She joins <code>Platform</code> on day one and inherits whatever <code>Platform</code> holds.</p>
<p>Access follows the org chart. Joiners get the right access by being put in the right group, and
leavers lose it by removal in one place. The cost is that <b>nobody can easily say what Ada can do</b>.
Her access is the union of every group she is in, transitively, and no single screen shows that.</p>

<h4>Nesting, and the two things it breaks</h4>
<p>Groups contain groups. <code>All-Engineering</code> contains <code>Platform</code> contains
<code>Platform-Oncall</code>, so membership is <b>transitive</b>. You must walk the whole graph, not
just direct membership.</p>
<p>First, <b>cycles</b>. Nothing stops A containing B while B contains A, and a naive recursive walk
hangs forever. Any real implementation tracks visited nodes, and that is where hand-rolled code fails.</p>
<p>Second, <b>surprise inheritance</b>. Adding a group to a widely used parent grants its access to
everyone above it in the tree. Most accidental over-permissioning happens this way.</p>
<div class="codeSample" data-hl>All-Employees
  └── Engineering
        └── Platform
              └── Platform-Oncall  ── has: prod-database-write

// putting Platform-Oncall under a broader parent by mistake would hand
// prod-database-write to everyone above it. no permission was ever granted.</div>

<h4>Two problems that show up at scale</h4>
<p><b>Group explosion.</b> Fine-grained access without a modeling discipline produces
<code>Finance-EU-ReadOnly-Q3</code> and thousands of siblings. Nobody knows which group to request, so
people ask for the one a colleague has. Access reviews become unreadable. The same effective permission
exists under five names. The countermeasure is to derive membership from <i>attributes</i> where you
can: dynamic groups whose membership is a rule over department and location, computed rather than
curated.</p>
<p><b>Token bloat.</b> A <b>claim</b> is one fact inside a token: a name, an email, an expiry time.
Put every group in the token as a claim and users in hundreds of groups produce
headers that exceed proxy limits. Things then fail in ways that look nothing like an authorization
problem: truncated headers, 431 responses, intermittent failures for the long-tenured employees with
the most access. A 431 is the status a server sends when the request headers are too big. The fixes:
emit only the groups relevant to the <b>audience</b>, send group ids rather than
distinguished names, or send none and have the API look them up. The audience is who the token is for,
the one API that will read it. A distinguished name is the long full path a directory gives each entry.</p>

<h4>Groups aren't roles, even when they're named like them</h4>
<p>A <b>group</b> is a collection of people. A <b>role</b> is a collection of permissions. A directory
group is often mapped directly onto a role, which muddies the distinction, but it matters in review.
"Who is in Finance?" is an HR question. "What may Finance do?" is a security question. Collapse them
and every org-chart change becomes a permissions change nobody reviewed.</p>
<p>In reviews, the number that matters is <b>effective permissions</b>: the flattened union across every
group, nested or direct. If your system can't produce that for one person on demand, you can't answer
the only question an auditor will ask.</p>`,
docs:[['Microsoft Entra (Dynamic membership rules)','https://learn.microsoft.com/en-us/entra/identity/users/groups-dynamic-membership'],['Microsoft Entra: Configure group claims (and the token size problem)','https://learn.microsoft.com/en-us/entra/identity/hybrid/connect/how-to-connect-fed-group-claims'],['NIST SP 800-53 AC-2 (Account Management)','https://csrc.nist.gov/projects/risk-management/sp800-53-controls/release-search#!/control?version=5.1&number=AC-2']],
ex:{title:'Flatten nested groups without hanging on a cycle',
prompt:`Write <code>Groups</code> with <code>static java.util.Set&lt;String&gt; effective(String group, java.util.Map&lt;String, java.util.List&lt;String&gt;&gt; children)</code> returning the group plus every group reachable through nesting. Walk iteratively with a stack or queue, and keep a <b>visited</b> set so a cycle terminates instead of looping forever. Return an empty set if <code>group</code> is null. Then <code>static boolean memberOf(String group, String target, java.util.Map&lt;String, java.util.List&lt;String&gt;&gt; children)</code>, true when <code>target</code> is in the effective set: the transitive check a direct-membership lookup misses.`,
starter:`import java.util.*;

public class Groups {
    static Set<String> effective(String group, Map<String, List<String>> children) {
        return null;
    }
    static boolean memberOf(String group, String target, Map<String, List<String>> children) {
        return false;
    }
}`,
tests:[{d:'a null group yields an empty set',re:'group\\s*==\\s*null|null\\s*==\\s*group'},{d:'tracks visited groups so cycles terminate',re:'seen|visited'},{d:'walks the nesting with a stack or queue',re:'ArrayDeque|Stack|LinkedList|Queue'},{d:'loops until the frontier is empty',re:'while\\s*\\('},{d:'looks up the children of each group',re:'children\\s*\\.\\s*get(OrDefault)?\\s*\\('},{d:'handles a group with no children',re:'getOrDefault|!=\\s*null'},{d:'transitive membership reuses the flatten',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:effective\\s*\\())|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:effective\\s*\\()[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:effective\\s*\\()[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:effective\\s*\\()[^{]*?return\\s+\\k<av>\\b)'}],
behavior:`With children = {"A":["B"], "B":["C"]}, effective("A") returns {A, B, C}: nesting is transitive, so a direct-membership check on A would wrongly miss C. effective(null) returns an empty set. With a cycle, children = {"A":["B"], "B":["A"]}, effective("A") returns {A, B} and terminates rather than recursing forever, which is the failure mode of hand-rolled traversals. memberOf("A","C",children) is true; memberOf("C","A",children) is false, because nesting has a direction.`,
hints:['Seed a stack with the starting group and a <code>seen</code> set, then loop while the stack is non-empty.','Add to <code>seen</code> as you pop; skip anything already there; that is what makes a cycle terminate.','<code>children.getOrDefault(g, List.of())</code> avoids a null check for leaf groups.'],
solution:`import java.util.*;

public class Groups {
    static Set<String> effective(String group, Map<String, List<String>> children) {
        Set<String> seen = new LinkedHashSet<>();
        if (group == null) return seen;
        Deque<String> stack = new ArrayDeque<>();
        stack.push(group);
        while (!stack.isEmpty()) {
            String g = stack.pop();
            if (!seen.add(g)) continue;          // already expanded: cycles terminate here
            for (String child : children.getOrDefault(g, List.of())) {
                if (!seen.contains(child)) stack.push(child);
            }
        }
        return seen;
    }
    static boolean memberOf(String group, String target, Map<String, List<String>> children) {
        // membership is transitive; a direct lookup would miss nested groups
        return effective(group, children).contains(target);
    }
}`}},

{id:'az8',title:'When policies collide: combining rules',body:`

<p>One policy is easy. Real systems evaluate many at once: an organization-wide rule, a team rule, a
resource rule, something a compliance team added last year. Several will apply to the same request,
and sometimes they disagree. What the system does then is a design decision, and leaving it implicit is how
"we definitely blocked that" turns out to be false.</p>

<h4>The combining algorithms</h4>
<ul>
<li><b>Deny-overrides.</b> If any policy says deny, the answer is deny, whatever else permits. The safe
default and almost always the right choice: a prohibition shouldn't be defeatable by adding another
rule somewhere else.</li>
<li><b>Permit-overrides.</b> Any permit wins. Occasionally justified, as for a <b>break-glass</b> rule, the emergency access an
on-call engineer uses during an outage, logged and reviewed afterwards, that
must cut through everything. As a general setting it means one careless broad grant undoes every
restriction you have.</li>
<li><b>First-applicable.</b> Evaluate in order. The first policy that matches decides. Predictable and
easy to debug, but the outcome depends on ordering, so inserting a rule in the wrong place changes
unrelated decisions.</li>
<li><b>Specificity wins.</b> The most specific matching rule decides: a rule about one document beats a
rule about the folder. Intuitive for humans, and the hardest to implement, because "more specific" must
be defined precisely and total.</li>
</ul>
<div class="codeSample" data-hl>request: Ada wants to read document 4417

  org policy      permit   employees may read internal documents
  project policy  permit   project members may read project documents
  legal hold      DENY     documents under legal hold are read-only to counsel

deny-overrides   -> DENY    (one prohibition is enough)
permit-overrides -> permit  (the legal hold is silently defeated)
first-applicable -> depends entirely on evaluation order</div>

<h4>The default when nothing matches</h4>
<p>What happens when <i>no</i> policy applies? The answer must be <b>deny</b>. Default-permit means
every resource anyone forgets to write a rule for is public, and you discover that from the
outside.</p>
<p>So a decision has three possible outcomes: <b>permit</b>, <b>deny</b>, and <b>not-applicable</b>.
The last collapses to deny at the enforcement point. Keeping them distinct in the engine lets you tell
"a rule deliberately blocked this" apart from "no rule covered this", which are different bugs.</p>

<h4>Explicit deny versus absence of permit</h4>
<p>These feel similar and behave differently under composition. An <b>explicit deny</b> is a statement.
Under deny-overrides no later grant can override it. An <b>absence of permit</b> is a gap, and anyone
who adds a policy can fill it.</p>
<p>So explicit denies are the tool for things that must never happen whoever gets creative later:
contractors never read payroll, nobody reads a legal hold. Use them sparingly. A large body of denies
interacting with a large body of permits becomes impossible to reason about. The system then fails in
the direction of blocking legitimate work.</p>

<h4>Make the decision explainable</h4>
<p>The most valuable feature of a policy engine is <b>which policy decided</b>. Without it, debugging
is guesswork, and the standard response to an unexplained denial is to add a broad permit until it
works. That is how policy sets rot.</p>
<div class="codeSample" data-hl>{ "decision": "DENY",
  "decidedBy": "legal-hold-2024",
  "evaluated": ["org-baseline: permit",
                "project-members: permit",
                "legal-hold-2024: DENY"],
  "algorithm": "deny-overrides" }</div>
<p>Test the combinations, not the rules. Each policy on its own is usually obviously correct. The
defects live in the interactions, so write down the cases where two rules disagree.</p>`,
docs:[['XACML 3.0 (rule-combining algorithms)','https://docs.oasis-open.org/xacml/3.0/xacml-3.0-core-spec-os-en.html#_Toc325047267'],['AWS: Policy evaluation logic (explicit deny always wins)','https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html'],['Open Policy Agent (Policy language)','https://www.openpolicyagent.org/docs/latest/policy-language/']],
ex:{title:'Combine decisions, deny-overrides, default deny',
prompt:`Model a decision as one of the strings <code>"PERMIT"</code>, <code>"DENY"</code> or <code>"NA"</code> (not applicable). Write <code>PolicyCombiner</code> with <code>static String denyOverrides(java.util.List&lt;String&gt; decisions)</code>: return <code>"DENY"</code> if any decision is DENY; otherwise <code>"PERMIT"</code> if any is PERMIT; otherwise <code>"NA"</code>, including when the list is null or empty. Then <code>static boolean enforce(String decision)</code>, which permits <b>only</b> on <code>"PERMIT"</code>, so NA collapses to denied at the enforcement point.`,
starter:`import java.util.*;

public class PolicyCombiner {
    static String denyOverrides(List<String> decisions) {
        return null;
    }
    static boolean enforce(String decision) {
        return false;
    }
}`,
tests:[{d:'a null or empty policy set is not applicable',re:'decisions\\s*==\\s*null|isEmpty\\s*\\(\\s*\\)'},{d:'any deny wins',re:'"DENY"'},{d:'otherwise a permit is honored',re:'"PERMIT"'},{d:'no applicable policy returns NA',re:'"NA"'},{d:'deny is checked before permit',re:'contains\\s*\\(\\s*"DENY"\\s*\\)|equals\\s*\\(\\s*"DENY"'},{d:'enforcement permits only on an explicit permit',re:'"PERMIT"\\s*\\.\\s*equals|equals\\s*\\(\\s*"PERMIT"'}],
behavior:`denyOverrides(List.of("PERMIT","PERMIT","DENY")) returns DENY: a single prohibition cannot be outvoted, which is why this is the safe default. denyOverrides(List.of("NA","PERMIT")) returns PERMIT. denyOverrides(List.of("NA","NA")), denyOverrides(List.of()) and denyOverrides(null) all return NA, keeping "a rule blocked this" distinguishable from "no rule covered this". enforce("PERMIT") is true; enforce("DENY") and enforce("NA") are both false, so a resource nobody wrote a policy for is closed rather than public.`,
hints:['Handle null and empty first, returning "NA".','<code>if (decisions.contains("DENY")) return "DENY";</code> then the same for "PERMIT".','<code>return "PERMIT".equals(decision);</code>: anything else, including NA, denies.'],
solution:`import java.util.*;

public class PolicyCombiner {
    static String denyOverrides(List<String> decisions) {
        if (decisions == null || decisions.isEmpty()) return "NA";
        // an explicit deny cannot be outvoted by any number of permits
        if (decisions.contains("DENY")) return "DENY";
        if (decisions.contains("PERMIT")) return "PERMIT";
        return "NA";   // no policy applied: distinct from a deliberate deny
    }
    static boolean enforce(String decision) {
        // NA collapses to denied here: default deny, so gaps are closed
        return "PERMIT".equals(decision);
    }
}`}},

{id:'az9',title:'Authorization at scale: what Zanzibar actually solves',body:`

<p><b>ReBAC</b>, relationship-based access control, decides by how you're connected to the thing rather
than by a role or an attribute. It is easy to describe and hard to run. "Ada can view this document because she is a member of a
group that was granted access to the folder it lives in" is a graph traversal. Doing that for every
request, across billions of relationships, in single-digit milliseconds, without ever showing someone a
document they shouldn't see, is a hard systems problem. Google's Zanzibar paper is the reference
answer, and the reasoning generalizes to any centralized authorization service.</p>

<h4>The data model</h4>
<p>Everything is a <b>relation tuple</b>: a subject, a relation, and an object. Nothing else:</p>
<div class="codeSample" data-hl>doc:readme#viewer@user:ada              ada can view the readme
doc:readme#parent@folder:eng           the readme lives in the eng folder
group:eng#member@user:bob              bob is in the eng group
folder:eng#viewer@group:eng#member     eng members can view the eng folder

// so: can bob view the readme? not stated anywhere. it is DERIVED by
// walking parent -> folder viewer -> group member -> bob.</div>
<p>Permissions are computed, not stored. That makes the model expressive, and it makes every check a
traversal.</p>

<h4>The three hard problems</h4>
<p><b>1. Latency.</b> A check may fan out across many tuples and many shards, the separate pieces a large
database is split across. The answer is aggressive
caching plus <b>leopard indexes</b>, which precompute the transitive closure of slow-changing sets such
as group membership. That closure is the full list of everyone reachable by following memberships down
through every level of nesting. A deep nesting chain collapses into one lookup.</p>
<p><b>2. Consistency, the "new enemy" problem.</b> Authorization has a failure mode ordinary caches do
not:</p>
<div class="codeSample" data-hl>t1  Ada removes Bob from the group
t2  Ada adds a confidential document to the group's folder
t3  Bob's check hits a replica that has t2 but NOT t1

    -> Bob sees the document. Each write was correct. The ORDER was lost.

// the reverse also matters: revoking access must not be overtaken by a
// stale cache that still says "permitted".</div>
<p>Eventual consistency is where copies of the data catch up with each other in their own time. It is unacceptable here, and full strong consistency everywhere is too slow. The
resolution is a <b>consistency token</b> (Zanzibar calls it a <i>zookie</i>) handed back when content is
written and presented with the later check. It means "evaluate against a snapshot at least this
recent". The client needs no global clock. It carries a token forward, and the system guarantees it
won't answer from an older state.</p>
<p><b>3. Ordering across the system.</b> Underneath, this needs globally ordered timestamps, which is
why Zanzibar sits on Spanner, Google's globally distributed database, which supplies them. Reimplementations substitute their own ordering mechanism, and that
substitution is where correctness is usually lost.</p>

<h4>The centralization trade</h4>
<p>A central authorization service buys consistent policy, one audit trail, and one place to answer
"who can see this?", a question most estates can't answer. It costs you a <b>hard runtime dependency
on the critical path of every request</b>. The mitigations are the familiar ones: aggressive caching,
and a deliberate decision about what happens when the service is unreachable. Fail closed, and an
authorization outage is a total outage.</p>

<h4>When you need this, and when you don't</h4>
<div class="codeSample" data-hl>YOU PROBABLY DO NOT                 YOU PROBABLY DO
roles map cleanly to permissions    sharing is user-driven and arbitrary
authorization is per-endpoint       "shared with me", nested folders, links
one service owns the data           many services must agree on one answer
"who can see this?" is answerable   the answer is currently unknowable</div>
<p><b>Most applications don't need Zanzibar.</b> A tenant-scoped query with an ownership check is the
right answer. A <b>tenant</b> is one customer organization inside a shared system, and a tenant-scoped
query can only ever see that organization's rows. Reach for a relationship graph when users grant access to each other in patterns you
can't enumerate in advance, as they do in document sharing, repositories and collaboration tools.</p>
<p>If you do build on this model, the property to protect is <b>the guarantee that a revocation is
never overtaken by a stale read</b>. Everything else is optimization.</p>`,
docs:[['Google: Zanzibar: Consistent, Global Authorization System','https://research.google/pubs/pub48190/'],['OpenFGA (Modeling guides)','https://openfga.dev/docs/modeling'],['SpiceDB (Consistency and zookies)','https://authzed.com/docs/spicedb/concepts/consistency']],
ex:{title:'Zookies and the new-enemy problem',
prompt:`Write <code>Zanzibar</code> with three methods. <code>static boolean freshEnough(long snapshotAt, long zookieAt)</code> is true only when the replica's snapshot is at or after the token's timestamp. <code>static boolean check(boolean tupleGrantsAccess, long snapshotAt, long zookieAt)</code> returns false whenever the snapshot is too old, <b>even if the tuple currently says access is granted</b>, because a stale replica may not yet know about a revocation. <code>static boolean needsRelationshipGraph(boolean userDrivenSharing, boolean rolesMapCleanly)</code> is true only when sharing is user-driven and roles do not map cleanly.`,
starter:`public class Zanzibar {
    static boolean freshEnough(long snapshotAt, long zookieAt) {
        return false;
    }
    static boolean check(boolean tupleGrantsAccess, long snapshotAt, long zookieAt) {
        return false;
    }
    static boolean needsRelationshipGraph(boolean userDrivenSharing, boolean rolesMapCleanly) {
        return false;
    }
}`,
tests:[{d:'the snapshot must be at least as recent as the token',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:snapshotAt\\s*>=\\s*zookieAt|zookieAt\\s*<=\\s*snapshotAt))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:snapshotAt\\s*>=\\s*zookieAt|zookieAt\\s*<=\\s*snapshotAt)[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:snapshotAt\\s*>=\\s*zookieAt|zookieAt\\s*<=\\s*snapshotAt)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:snapshotAt\\s*>=\\s*zookieAt|zookieAt\\s*<=\\s*snapshotAt)[^{]*?return\\s+\\k<av>\\b)'},{d:'a stale snapshot denies regardless of the tuple',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:freshEnough\\s*\\())|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:freshEnough\\s*\\()[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:freshEnough\\s*\\()[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:freshEnough\\s*\\()[^{]*?return\\s+\\k<av>\\b)'},{d:'the tuple still has to grant access',re:'tupleGrantsAccess'},{d:'user-driven sharing is required',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:userDrivenSharing))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:userDrivenSharing)[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:userDrivenSharing)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:userDrivenSharing)[^{]*?return\\s+\\k<av>\\b)'},{d:'clean role mapping means you do not need this',re:'!\\s*rolesMapCleanly|rolesMapCleanly\\s*==\\s*false'}],
behavior:`freshEnough(100, 100) and freshEnough(101, 100) are true; freshEnough(99, 100) is false. check(true, 99, 100) is false; this is the whole point: the replica says access is granted, but it is older than the write the client already observed, so it may not yet know Bob was removed from the group. Answering from it is the new-enemy problem, where each write was correct and only the order was lost. check(true, 100, 100) is true, and check(false, 100, 100) is false. needsRelationshipGraph(true, false) is true, while needsRelationshipGraph(true, true) and needsRelationshipGraph(false, false) are false: most applications do not need this, and a tenant-scoped query with an ownership check is the right answer.`,
hints:['One comparison for freshness; note it is &gt;=, not &gt;.','In check, test freshness first and deny before even looking at the tuple.','Two conditions, the second negated.'],
solution:`public class Zanzibar {
    static boolean freshEnough(long snapshotAt, long zookieAt) {
        return snapshotAt >= zookieAt;
    }
    static boolean check(boolean tupleGrantsAccess, long snapshotAt, long zookieAt) {
        // a stale replica may not know about a revocation yet: deny first
        if (!freshEnough(snapshotAt, zookieAt)) return false;
        return tupleGrantsAccess;
    }
    static boolean needsRelationshipGraph(boolean userDrivenSharing, boolean rolesMapCleanly) {
        // arbitrary user-driven sharing is the case roles cannot enumerate
        return userDrivenSharing && !rolesMapCleanly;
    }
}`}},

{id:'az10',title:'Operating policy: testing, shadow mode and the denial nobody can explain',body:`

<p>Every lesson so far in this stream has been about <i>expressing</i> authorization: roles, attributes,
relationships, combining rules. This one is about <b>running</b> it, which is what decides whether your
model survives production. A policy engine answers thousands of questions per second. Everyone depends on it, almost nobody can
read it, and it fails in a way users experience as "the button does nothing".</p>

<h4>The denial nobody can explain</h4>
<p>A user is refused. They raise a ticket. Support can't say why. The engineer on call opens the policy,
reads forty rules across three files, and can't say why either. The decision depended on the user's
group memberships at that instant, an attribute fetched from a <b>directory</b>, and a rule written by someone
who left. A directory is the database of people, groups and machines the organization keeps.</p>
<p>The fix is to make the engine <b>return its reasoning with its answer</b>. A decision should carry the
rule that produced it, the inputs it used and the effect it applied:</p>
<div class="codeSample" data-hl>{ "allow": false,
  "rule":  "deny-prod-without-oncall",     // WHICH rule decided
  "inputs": { "role": "dev", "env": "prod", "oncall": false },
  "policy_version": "2026-08-14.3" }       // WHICH version of the policy</div>
<p>That one field turns an unanswerable ticket into a ten-second lookup. Log every decision this way,
deny <i>and</i> allow, because "why was this permitted?" is the question an auditor asks after an
incident.</p>

<h4>Policy is code, so test it like code</h4>
<p>Policies have branches, precedence, and consequences when wrong. Yet they ship with no test at all,
because they live in a different file from the application and often in a different language.</p>
<p>Write tests for the invariants your organization holds, not for whether rule 12 fires:</p>
<ul>
<li><b>The positive cases.</b> A support agent can read a ticket. An engineer on call can restart a service.</li>
<li><b>The negative cases, which matter more.</b> A support agent can't read a payment method. A contractor
can't approve their own expense. Every negative test is a control you can prove.</li>
<li><b>The separation-of-duties invariants</b>: no single identity can both create and approve the same
payment, whatever roles it accumulates.</li>
<li><b>The default.</b> A request that matches nothing must be denied, and a test should fail loudly if a
future edit makes the default permissive.</li>
</ul>

<h4>Shadow mode: the only safe way to change a policy</h4>
<p>A policy change is a change to who can do what, applied to everyone at once. There's no gradual
rollout unless you build one. <b>Shadow mode</b> is that rollout. Run the new policy alongside the old, enforce
the <i>old</i> answer, and log every case where the two disagree.</p>
<p>After a day you have a list of who would have been newly denied. That list is the review. It usually
contains a team nobody thought about: the batch job running as a service account, the integration that
authenticates as a former employee. Finding them in a log is much cheaper than finding them in an
incident. Switch to enforcing only when the disagreement list is empty or entirely expected.</p>

<h4>The operational properties nobody specifies until they hurt</h4>
<ul>
<li><b>Latency.</b> Authorization sits in every request. The <b>PDP</b> is the policy decision point,
where the yes-or-no is computed. A remote PDP adds a network hop to every call, so
decisions get cached, and a cached decision keeps a revoked permission live for the cache lifetime.
That <b>TTL</b>, the time to live, is how long the cached answer is trusted before it's thrown away. It
is a security parameter, not a performance one.</li>
<li><b>Availability.</b> If the PDP is unreachable, do you fail open or closed? Closed is correct, and it
means the PDP's uptime is now your application's uptime. That is an argument for distributing policy to
the enforcement points rather than centralizing the decision.</li>
<li><b>Versioning.</b> A decision made yesterday was made by yesterday's policy. Without a version in the
decision log you can't reconstruct why, and post-incident review becomes guesswork.</li>
<li><b>Staleness.</b> Attributes and group memberships arrive from elsewhere and are almost always slightly
old. Decide how stale each input can be before the decision is wrong, rather than discovering it.</li>
</ul>
<p>A policy you can't test, explain or roll out gradually is a liability with a syntax.</p>`,
docs:[['OPA (policy testing)','https://www.openpolicyagent.org/docs/latest/policy-testing/'],['AWS Cedar (policy validation)','https://docs.cedarpolicy.com/'],['Google SRE Workbook (canarying releases)','https://sre.google/workbook/canarying-releases/']],
ex:{title:'Return the reason with the decision',lang:'js',
run:{call:'decide',cases:[{name:'a matching allow rule is reported by id',args:[[{id:'r1',effect:'allow',when:{role:'admin'}},{id:'r2',effect:'deny',when:{env:'prod'}}],{role:'admin',env:'dev'}],expect:{allow:true,reason:'r1'}},{name:'deny overrides an earlier allow',args:[[{id:'r1',effect:'allow',when:{role:'admin'}},{id:'r2',effect:'deny',when:{env:'prod'}}],{role:'admin',env:'prod'}],expect:{allow:false,reason:'r2'}},{name:'nothing matches, so the default denies',args:[[{id:'r1',effect:'allow',when:{role:'admin'}}],{role:'guest'}],expect:{allow:false,reason:'no rule matched'}},{name:'an empty policy denies rather than permits',args:[[],{role:'admin'}],expect:{allow:false,reason:'no rule matched'}},{name:'a rule matches only when every condition holds',args:[[{id:'r1',effect:'allow',when:{role:'dev',oncall:true}}],{role:'dev',oncall:false}],expect:{allow:false,reason:'no rule matched'}}]},
prompt:`Write <code>function decide(rules, req)</code> returning <code>{ allow, reason }</code>. A rule is <code>{ id, effect, when }</code> and matches when <b>every</b> key in <code>when</code> equals the same key in <code>req</code>. Deny wins: if any matching rule denies, return that rule's id. Otherwise return the id of the first matching allow. If nothing matches, deny with the reason <code>"no rule matched"</code>. The <code>reason</code> is the decision log; without it, a refused user is an unanswerable ticket.`,
starter:`function decide(rules, req) {
  return { allow: false, reason: "" };
}`,
solution:`function decide(rules, req) {
  let allowedBy = null;
  for (const r of rules) {
    const match = Object.keys(r.when).every(k => r.when[k] === req[k]);
    if (!match) continue;
    if (r.effect === "deny") return { allow: false, reason: r.id };   // deny wins
    if (!allowedBy) allowedBy = r.id;                                  // remember the first allow
  }
  return allowedBy ? { allow: true, reason: allowedBy }
                   : { allow: false, reason: "no rule matched" };      // default deny
}`,
tests:[{d:'every condition in a rule must match',re:'every\\s*\\(|for\\s*\\(.*of\\s+Object\\.keys'},{d:'a matching deny returns immediately',re:'["\x27]deny["\x27]'},{d:'the deciding rule id is returned',re:'reason:\\s*r\\.id|reason:\\s*allowedBy'},{d:'the default is deny with a stated reason',re:'no rule matched'}],
behavior:`Five cases execute. The last one is the one that catches a partial-match bug: a rule requiring role dev AND oncall true must not fire for an on-call-false developer, and a solution using "some" instead of "every" quietly grants it. The empty-policy case encodes the most important default in authorization: no rules means no permission, never "nothing to stop you". And note what the reason field does to operations: every one of these outcomes is explainable in one line to a user, a support agent or an auditor, which is the difference between a policy you can run and one you can only apologize for.`,
hints:['A rule matches only when EVERY condition in its when block matches the request.','Deny wins, so return as soon as a matching deny is found.','Remember the first matching allow rather than returning it immediately; a later deny must still win.']}}
]});
