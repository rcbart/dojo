STREAMS.push({icon:'🧩',iam:true,sec:'Authorization models',title:'Authorization Models',blurb:'Once you know who someone is, how do you decide what they can do? ACLs, RBAC (roles), ABAC (attributes/policy), ReBAC (relationships), and policy engines, plus least privilege, separation of duties, and the PDP/PEP split.',lessons:[

{id:'az1',title:'From ACLs to roles (RBAC)',body:`
<p>The simplest model is an <b>Access Control List</b> (ACL): each resource keeps a list of who may do what. It is precise but explodes: thousands of users times thousands of resources becomes unmanageable.</p>
<p><b>RBAC</b> (Role-Based Access Control) adds a layer of indirection: users get <b>roles</b> (admin, editor, viewer), and roles carry <b>permissions</b>. You manage a handful of roles instead of millions of user-resource pairs, and onboarding is just "assign a role." It is the default model in most enterprises for good reason.</p>
<div class="codeSample" data-hl>// a permission check reduces to: does this user hold a role that grants it?
boolean allowed = user.roles().contains("admin");</div>

<h4>Why ACLs stop scaling</h4>
<p>An ACL attaches permissions to the <i>object</i>: this file lists who may read it. That is precise and
it is O(users x objects) to administer. Onboarding one person means touching every object they need;
offboarding means finding every object that mentions them, and missing one is a permanent orphaned
grant.</p>
<p>RBAC inserts a level of indirection (<b>users get roles, roles carry permissions</b>), which turns
onboarding into a single assignment. That is the whole gain, and the whole cost: you can no longer
answer "who can read this file?" by looking at the file.</p>
<div class="codeSample" data-hl>ACL          alice: read, bob: write        on EACH object
             precise, no indirection, and unmanageable past a few hundred

RBAC         alice -> "editor" -> {read, write}
             one assignment per person; permissions defined once per role
             but "who can see X?" now requires walking the model backwards

// ACLs did not disappear. filesystems, S3 and object sharing still use them,
// because per-object precision is exactly what those need.</div>

<h4>The distinction to keep straight</h4>
<p>A <b>permission</b> is a verb on a resource: <code>invoice:read</code>. A <b>role</b> is a named
bundle of permissions. A <b>group</b> is a collection of people. Roles and groups get used
interchangeably and should not be: "who is in Finance?" is an HR question, "what may Finance do?" is a
security question, and collapsing them means every org-chart change silently becomes a permissions
change nobody reviewed.</p>

<h4>Where ACLs are still the right answer</h4>
<p>RBAC replaced ACLs for organizational permissions and never replaced them for <b>per-object sharing</b>.
When a user shares one document with one colleague, no role expresses that; the grant genuinely belongs to
the object. Every file-sharing product works this way, and trying to model it as roles produces one role
per document, which is the reductio of role explosion.</p>
<p>So real systems are hybrids: coarse organizational access from roles, fine per-object access from lists
or relationships. Knowing which question you are answering ("what may this job function do?" versus "who
may touch this specific thing?") tells you which model you are in.</p>

<h4>The question RBAC makes harder</h4>
<p>Indirection cuts both ways. With an ACL, "who can read this file?" is answered by reading the file's
list. With RBAC the answer requires walking backwards from permission to roles to every user and group
holding them, and that reverse question is the one auditors, incident responders and customers actually
ask.</p>
<p>If your system cannot answer it on demand, that is not a reporting gap; it is a sign that access reviews
are people approving role names they cannot evaluate. It is also the specific problem the relationship-based
model in the next lessons is built to solve.</p>

<h4>Deny, and why RBAC mostly avoids it</h4>
<p>ACLs commonly support explicit deny entries, which are seductive and produce systems nobody can reason
about: once allow and deny both exist, the answer depends on precedence rules a reader has to hold in their
head. Most RBAC implementations are deliberately <b>allow-only</b> (you hold a permission or you do not)
and handle exclusions through separation-of-duties constraints instead, which are checked at assignment
time rather than at every decision. That is a simplicity worth defending; when you meet a model with deny
rules, find out immediately how conflicts resolve.</p>`,
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
<p>Roles are only useful if they map to concrete <b>permissions</b>. A viewer can read; an editor can read and write; an admin can read, write, and delete. Keeping that mapping in one place means a policy change is one edit, not a hunt across the codebase.</p>
<p>Design tips: prefer a few broad roles over hundreds of narrow ones (role explosion is RBAC&#8217;s failure mode), and grant the <b>least privilege</b> each role truly needs. When roles alone cannot express a rule ("only the owner", "only during business hours"), that is the signal to reach for ABAC in the next lesson.</p>

<h4>Role explosion, and the two forces causing it</h4>
<p>RBAC decays in a predictable way. Someone needs a permission slightly different from an existing role,
so a new role is created rather than the model revisited. Repeat for five years and you have
<code>Finance-EU-ReadOnly-Q3</code> and eight hundred siblings, several of which are functionally
identical under different names.</p>
<p>Two forces drive it: <b>exceptions</b> (one person needs one extra thing) and <b>dimensions</b>
(region, environment, business unit, seniority, each multiplying the count). The fix for the first is a
separate exception mechanism with an expiry, not a new permanent role. The fix for the second is
recognizing that <b>a dimension is an attribute, not a role</b>, which is exactly the argument for ABAC
in the next lesson.</p>

<h4>Hierarchy, and where it misleads</h4>
<p>Role hierarchies let senior roles inherit junior ones, which models many organizations neatly and then
fails on the case that matters: an auditor needs broad <i>read</i> and no <i>write</i>, so they are not
"above" or "below" an editor. Hierarchies also make effective permissions harder to see, since a grant
three levels up appears nowhere near the role you are inspecting.</p>

<h4>The number that matters</h4>
<p>For any person, the reviewable figure is <b>effective permissions</b>: the flattened union across
every role and group, direct and inherited. If your system cannot produce that for one user on demand,
you cannot answer the only question an auditor will ask, and your access reviews are people approving
names they do not understand.</p>

<h4>Designing roles from job functions, not from screens</h4>
<p>The most common way to get this wrong is to derive roles from the application's user interface: a role
per page, or per feature flag. Those roles change whenever the product changes, and they mean nothing to
the manager who has to approve them during a review.</p>
<p>Roles derived from <b>job functions</b> (what a person is employed to do) are stable across releases
and reviewable by someone who understands the business rather than the codebase. The test is whether a
non-engineer can read the role name and say confidently whether this person should have it. "Claims
Adjuster" passes. "invoice-page-write" does not.</p>

<h4>Two tiers, which is how large estates stay manageable</h4>
<p>Mature implementations separate <b>business roles</b> from <b>technical roles</b>. A business role
("Claims Adjuster") is what a person is granted; it is composed of technical roles or permission sets in
individual applications. Adding an application then means composing a new technical role into an existing
business role, rather than granting every person something new.</p>
<p>This is also what makes joiners work: a <b>birthright</b> business role attached to a job title grants a
sensible default on day one, and everything beyond it is <b>requestable</b>: approved, time-bound, and
expiring on its own. The distinction matters because standing access accumulates and time-bound access does
not.</p>

<h4>Ownership, or the review is theatre</h4>
<p>Every role needs a named owner who can say what it is for and whether it is still correct. Without one,
access reviews become a manager approving a list of names they cannot evaluate, which is worse than no
review, because it produces an audit artifact asserting that someone checked.</p>
<p>Two numbers tell you whether the model is healthy: the ratio of roles to users, which should fall as the
organization grows rather than rise, and the proportion of grants that are time-bound rather than standing.
Both are cheap to compute and neither is usually measured.</p>`,
docs:[['RBAC roles & permissions','https://auth0.com/docs/manage-users/access-control/rbac'],['Least privilege','https://csrc.nist.gov/glossary/term/least_privilege']],
ex:{title:'Map roles to permissions',
prompt:`Write class <code>Roles</code> with <code>static String permissions(String role)</code>: <code>"viewer"</code>→<code>"read"</code>, <code>"editor"</code>→<code>"read,write"</code>, <code>"admin"</code>→<code>"read,write,delete"</code>, and <code>""</code> (empty string) for any unknown role.`,
starter:`public class Roles {
    static String permissions(String role) {
        return null;
    }
}`,
solution:`public class Roles {
    static String permissions(String role) {
        switch (role) {
            case "viewer": return "read";
            case "editor": return "read,write";
            case "admin":  return "read,write,delete";
            default:       return "";
        }
    }
}`,
tests:[{d:'viewer can read',re:'(?:["\']viewer["\'][^;}]*?return\\s+["\']read["\'])|(?:case\\s*["\']viewer["\']\\s*->\\s*(?:\\{\\s*)?["\']read["\'])|(?:["\']viewer["\']\\s*:\\s*["\']read["\'])|(?:(?:put|entry|of)\\s*\\(\\s*["\']viewer["\']\\s*,\\s*["\']read["\'])',flags:'s'},{d:'editor can read and write',re:'"editor".*?"read,write"',flags:'s'},{d:'admin can read, write, delete',re:'"admin".*?"read,write,delete"',flags:'s'},{d:'unknown role gets no permissions',re:'return\\s+""'}],
behavior:`permissions("viewer") is "read", permissions("editor") is "read,write", permissions("admin") is "read,write,delete", permissions("ghost") is "". The mapping lives in one place, so policy changes are one edit.`,
hints:['A switch on role keeps the whole mapping in one readable place.','Higher roles simply list more comma-separated permissions.','Unknown roles fall through to the default returning an empty string.']}},

{id:'az3',title:'ABAC: attributes & policy',body:`
<p><b>ABAC</b> (Attribute-Based Access Control) decides using <i>attributes</i> of the user, the resource, the action, and the context, not just a role. "An employee may view a record <b>in their own department</b>," "a manager may approve amounts <b>under their limit</b>," "access only <b>during business hours</b>." Rules like these are impossible to express as roles alone.</p>
<p>ABAC is more expressive than RBAC but harder to reason about, so teams often combine them: RBAC for the coarse "can this kind of user do this kind of thing," ABAC for the fine "on this specific resource, right now." The rule is written as a boolean policy over the attributes.</p>

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
<p>The expressive gain is real: this policy covers every department without enumerating any of them, and
adding a department requires no policy change at all. That is the thing RBAC cannot do; it would need a
role per department, per action.</p>

<h4>What you pay for it</h4>
<ul>
<li><b>You cannot enumerate access.</b> "Who can read this document?" is no longer a lookup; it is a
question about every possible subject against a predicate. Auditors ask this question.</li>
<li><b>Attributes must be trustworthy and fresh.</b> The policy is only as good as
<code>subject.clearance</code>, which comes from a directory that may be stale, and if attributes
arrive in a token, they are as old as the token.</li>
<li><b>Debugging is harder.</b> A denial has no single cause; it has a failing conjunct, and finding it
requires the engine to tell you which one.</li>
</ul>

<h4>The hybrid that most estates actually run</h4>
<p>RBAC for the coarse gate (may this <i>kind</i> of user reach this endpoint at all) and ABAC for the
fine one, where ownership, tenant and context decide. That maps neatly onto the split in the data-level
lesson: roles at the edge, attributes next to the data. It also keeps the enumerable part enumerable,
which is what keeps reviews possible.

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
<p>Two things to copy from that trace. First, the engine must be able to say <i>which conjunct
failed</i>; a bare DENY turns every access ticket into an investigation. Second, note where each
attribute came from: department from the directory (stale by one sync), clearance from HR (stale by one
export), network from the request itself (fresh, and the only one the caller can influence). A decision
is only as fresh as its stalest attribute and only as trustworthy as its most forgeable one, so write
the source and the staleness next to every attribute your policies use.</p>`,
docs:[['ABAC (NIST 800-162)','https://csrc.nist.gov/publications/detail/sp/800-162/final'],['ABAC vs RBAC','https://auth0.com/blog/what-is-abac-attribute-based-access-control/']],
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
<p>Some questions are about <b>relationships</b>: "can this user view this document?" depends on whether the document was <i>shared with</i> them, who <i>owns</i> it, and which <i>group</i> they belong to. <b>ReBAC</b> (Relationship-Based Access Control) models permissions as a graph of relations, the approach behind Google&#8217;s Zanzibar and open-source <b>OpenFGA</b>.</p>
<p>To keep policy out of scattered <code>if</code> statements, teams externalize it to a <b>policy engine</b>: the app asks "is this allowed?" and the engine answers from declarative rules. <b>OPA</b> (with the Rego language) and <b>AWS Cedar</b> are the common choices. This is <b>PBAC</b>, Policy-Based Access Control, and it lets security rules evolve without redeploying the app.</p>

<h4>Why relationships, not attributes</h4>
<p>ReBAC answers a question the other models cannot phrase: access that exists <i>because of a link
between two objects</i>. "Ada can edit this document because she is an editor of the folder that contains
it" is not a role and not an attribute; it is a path through a graph.</p>
<div class="codeSample" data-hl>RBAC   is the user in a role?                      set membership
ABAC   do the attributes satisfy a predicate?     boolean over fields
ReBAC  is there a PATH from user to object?       graph traversal

doc:readme#parent@folder:eng          the readme lives in eng
folder:eng#viewer@group:eng#member    eng members can view eng
group:eng#member@user:ada             ada is in eng
-> ada can view the readme. stated nowhere; derived by walking.</div>
<p>This is the model behind every "share with", nested folder and inherited-permission feature you have
used. It is why document and repository products converge on it, and why an ordinary line-of-business
app usually should not.</p>

<h4>Externalizing policy: what you gain and lose</h4>
<p><b>Gain:</b> policy stops being scattered <code>if</code> statements across services that drift apart.
It becomes reviewable, testable, versioned, and consistent, and one place can answer "why was this
denied?"</p>
<p><b>Lose:</b> a runtime dependency on the critical path of every request. That forces a decision you
must make deliberately: what happens when the engine is unreachable? Fail closed and an authorization
outage becomes a total outage; fail open and you have no authorization at all. Aggressive caching plus
fail-closed is the usual answer, and the caching brings back the staleness problem the scale lesson
covers.</p>
<p><b>OPA</b> (Rego, general-purpose policy), <b>Cedar</b> (AWS, verification-friendly) and
<b>OpenFGA/SpiceDB</b> (Zanzibar-style relationship graphs) are the common engines. Pick on the shape of
your question: predicate over attributes, or path through a graph.

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
<p>Before adopting, answer the two questions that trace exposes. How deep can a path get? Every hop is
a lookup, and a folder tree twelve levels deep makes every permission check twelve reads unless the
engine caches or flattens. And who writes the tuples? Sharing a document is now a data write, with the
same consistency questions as any other write: revoke a viewer and a cached ALLOW can outlive the
tuple, which is the new-enemy problem, and the reason the engines talk about snapshot consistency.</p>`,
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
<p>Two architectural terms show up everywhere in authorization. The <b>PDP</b> (Policy Decision Point) is the brain that answers "allow or deny"; the <b>PEP</b> (Policy Enforcement Point) is the gate in front of the resource that <i>asks</i> the PDP and enforces the answer. Separating them means one consistent decision engine guards many enforcement points.</p>
<p>Two principles govern good policy. <b>Least privilege</b>: grant the minimum access needed, for the shortest time. <b>Separation of duties</b> (SoD): no single person should hold a conflicting combination: the one who <i>creates</i> a payment must not also <i>approve</i> it. SoD is a cornerstone of fraud prevention and audit.</p>

<h4>Why splitting the decision from the enforcement matters</h4>
<p>Left alone, authorization logic grows where the code is: an <code>if</code> in a controller, a check in
a template, a filter in a query, a rule in a background job. Each is correct in isolation. Collectively
they are a policy nobody can state, spread across a codebase nobody can audit, and the question "who
can approve a refund?" becomes a code search rather than a lookup.</p>
<p>PDP/PEP is the response. <b>One place decides</b> (the Policy Decision Point) and <b>many places
enforce</b> (Policy Enforcement Points). That single move buys three things you cannot get otherwise:
consistency across entry points, a policy you can read without reading code, and an audit trail of
decisions rather than of outcomes.</p>
<div class="codeSample" data-hl>PEP  the gate in front of the resource. asks, then OBEYS.
     ("can user U do action A on resource R, in context C?")
PDP  the brain. evaluates policy, returns permit/deny.
PIP  policy INFORMATION point - where the PDP fetches facts it was not given
     (group membership, resource owner, device posture)
PAP  policy ADMINISTRATION point - where humans author and version policy

// the PEP must fail CLOSED: if the PDP is unreachable, DENY.
// a PEP that allows on error has inverted the entire control.</div>

<h4>The trade you are making</h4>
<p>Centralizing the decision introduces a dependency in the request path of everything. If the PDP is
slow, all of it is slow; if the PDP is down, all of it is down. That is why real deployments embed the
PDP as a library or sidecar rather than a remote service, distribute policy as data, and cache decisions
carefully, noting that a cached <i>permit</i> is a revocation you have not honored yet.</p>

<h4>Least privilege, stated precisely</h4>
<p>"Grant the minimum needed" is true but unactionable, because nobody knows what is needed. The version
you can implement has three parts: <b>minimum scope</b> (this resource, not the class of resources),
<b>minimum duration</b> (elevate for the task, expire automatically), and <b>minimum blast radius</b>
(read where read suffices; separate production from everything else).</p>
<p>The practical technique is to start from denial and let usage data pull the grant open: deny by
default, log what was refused, and grant against evidence. Working the other way (grant broadly, trim
later) never converges, because nothing forces the trim.</p>

<h4>Separation of duties, and its two enforcement moments</h4>
<p>SoD says no single person should hold both halves of a value-moving transaction: create and approve a
payment, amend and approve payroll, write and deploy code, grant and use access. It is an anti-fraud
control inherited from accounting, not a defense against outsiders.</p>
<p>Enforce it <b>preventively</b> at request time (block the grant that would create the conflict) and
<b>detectively</b> by scanning existing holdings, because most real conflicts arrive sideways: access
granted directly in a system, or a role definition that quietly changed under its members. Where the
conflict is unavoidable (small teams), the answer is a documented mitigating control with an owner and an
expiry, not silence.</p>`,
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
<p>RBAC, ABAC and ReBAC all answer the same shape of question: <i>may this user perform this kind of
action?</i> Every one of them will happily approve a request that then returns somebody else's data,
because none of them looked at <i>which</i> record was being fetched. That gap is where most real
authorization bugs live.</p>

<h4>Two questions, and only one usually gets asked</h4>
<div class="codeSample" data-hl>ENDPOINT authorization   "may this user call GET /invoices/{id}?"   <- role check
OBJECT   authorization   "is invoice 4417 theirs to see?"          <- often missing

// the bug, in its most common form:
@RequiresRole("customer")
Invoice get(long id) {
    return repo.findById(id);   // any customer, any invoice
}</div>
<p>Change the <code>4417</code> in the URL to <code>4418</code> and you are reading another customer's
invoice. This is <b>IDOR</b> (insecure direct object reference), known in the API world as <b>broken
object-level authorization</b>, and it sits at the top of the OWASP API Security Top 10 for a simple
reason: the role check passed, the test suite passed, and nothing looked wrong.</p>
<p>It is worth being clear about why it is so persistent. The endpoint check is <i>visible</i>: it is
an annotation, it is in the design doc, a reviewer notices when it is missing. The object check is
invisible: its absence looks exactly like working code.</p>

<h4>Guessable ids are not the problem</h4>
<p>The usual first reaction is to replace sequential ids with UUIDs. That is worth doing (it stops
casual enumeration and it keeps your customer count out of your URLs), but it is <b>not an
authorization control</b>. It only makes the reference harder to guess, and references leak constantly:
in shared links, referral logs, exports, support tickets, and to any former employee who saw them.
<b>An unguessable identifier is obscurity; an ownership check is security.</b> Do both, and never let
the first substitute for the second.</p>

<h4>Filter in the query, do not check after</h4>
<p>There are two places to enforce ownership, and only one of them scales:</p>
<div class="codeSample" data-hl>// FRAGILE: fetch first, check after. Every new call site must remember.
Invoice inv = repo.findById(id);
if (inv.tenantId != currentTenant) throw new Forbidden();

// SAFE: the constraint is part of the query. Wrong tenant simply finds nothing.
Invoice inv = repo.findByIdAndTenantId(id, currentTenant);

// and for lists, the filter must be in the WHERE clause, never applied afterwards
SELECT * FROM invoices WHERE tenant_id = ? AND status = ?</div>
<p>The check-after style fails the moment someone adds a new query, and someone always does. Pushing
the constraint into the data access layer makes the safe path the default one: a repository that
<i>cannot</i> fetch across tenants cannot leak across tenants.</p>
<p>Two extra failure modes worth naming. <b>Lists and search</b> are frequently forgotten while the
detail endpoint is carefully guarded, and a search that ignores the tenant filter leaks in bulk.
And <b>counts and aggregates</b> leak too: telling a user that a search matched 4,000 records reveals
information even if it returns none of them.</p>

<h4>Field-level: not every column is equally visible</h4>
<p>Object-level is only half of it. Two users may both be entitled to a record and entitled to see
<i>different parts</i> of it. A support agent reads the order but not the full card number; a manager
sees a direct report's salary while a peer does not.</p>
<p>The dangerous habit is serializing the whole entity and trusting the UI to hide things. The UI is
not an authorization boundary: the JSON already contains the field, and anyone can open developer
tools. <b>Mask or omit at the point of serialization</b>, driven by the caller's permissions. The same
applies in reverse for writes: accepting a whole object and copying it onto an entity lets a caller set
fields they should never control, which is how <code>"role":"admin"</code> ends up in a profile
update.</p>

<h4>Where the check belongs</h4>
<p>A gateway can enforce endpoint authorization, because it can see the route and the token. It cannot
enforce object authorization, because it does not know who owns record 4417; only the service holding
the data does. So the split is structural, not stylistic: <b>coarse checks at the edge, ownership
checks next to the data.</b> Any design that pushes all authorization to the perimeter has, by
construction, no answer to IDOR.</p>`,
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
<p>Roles are how authorization is <i>modeled</i>. Groups are how it is <i>administered</i>. Every
enterprise directory hands out access by putting people in groups, and the gap between the tidy diagram
and what an organization's group tree actually looks like after five years is where the interesting
problems are.</p>

<h4>The chain</h4>
<div class="codeSample" data-hl>user  ->  group  ->  role  ->  permission  ->  resource
Ada       Platform   Deploy    deploy:write    the production cluster

// why the indirection is worth it: nobody grants Ada anything directly.
// she joins Platform on day one and inherits whatever Platform holds.</div>
<p>The payoff is administrative. Access follows the org chart, joiners get the right access by being
put in the right group, and leavers lose it by removal in one place. The cost is that <b>nobody can
easily say what Ada can actually do</b>: her access is the union of every group she is in, transitively,
which no single screen shows.</p>

<h4>Nesting, and the two things it breaks</h4>
<p>Groups contain groups. <code>All-Engineering</code> contains <code>Platform</code> contains
<code>Platform-Oncall</code>, so membership is <b>transitive</b>: you must walk the whole graph, not
just direct membership.</p>
<p>Two consequences. First, <b>cycles</b>. Nothing stops A containing B while B contains A, and a naive
recursive walk hangs forever. Any real implementation tracks visited nodes, which is a graph traversal
problem, not an authorization one, and it is exactly where hand-rolled code fails.</p>
<p>Second, <b>surprise inheritance</b>. Adding a group to a widely-used parent silently grants its
access to everyone above it in the tree. Most accidental over-permissioning happens this way: nobody
granted anything to anybody, someone just nested a group.</p>
<div class="codeSample" data-hl>All-Employees
  └── Engineering
        └── Platform
              └── Platform-Oncall  ── has: prod-database-write

// putting Platform-Oncall under a broader parent by mistake would hand
// prod-database-write to everyone above it. no permission was ever granted.</div>

<h4>Two problems that show up at scale</h4>
<p><b>Group explosion.</b> Fine-grained access without a modeling discipline produces
<code>Finance-EU-ReadOnly-Q3</code> and thousands of siblings. Symptoms: nobody knows which group to
request, so people ask for the one a colleague has; access reviews become unreadable; and the same
effective permission exists under five names. The countermeasure is to derive membership from
<i>attributes</i> where you can (dynamic groups whose membership is a rule over department and
location), so the group is computed rather than curated.</p>
<p><b>Token bloat.</b> The instinct is to put every group in the token as a claim. Users in hundreds of
groups then produce headers that exceed proxy limits, and things fail in ways that look nothing like an
authorization problem: truncated headers, 431 responses, intermittent failures for exactly the
long-tenured employees with the most access. The fixes: emit only the groups relevant to the audience,
send group ids rather than distinguished names, or send none and have the API look them up.</p>

<h4>Groups are not roles, even when they are named like them</h4>
<p>A <b>group</b> is a collection of people; a <b>role</b> is a collection of permissions. The
distinction gets muddy because a directory group is often mapped directly onto a role, but it matters
in review: "who is in Finance?" is an HR question, and "what may Finance do?" is a security question.
Collapsing them means every org-chart change becomes a permissions change nobody reviewed.</p>
<p>And in reviews, the number that matters is <b>effective permissions</b>: the flattened union across
every group, nested or direct. If your system cannot produce that for one person on demand, you cannot
answer the only question an auditor will ask.</p>`,
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
<p>One policy is easy. Real systems evaluate many at once (an organization-wide rule, a team rule, a
resource rule, something a compliance team added last year), and several will apply to the same
request, sometimes disagreeing. What the system does then is a design decision, and leaving it
implicit is how "we definitely blocked that" turns out to be false.</p>

<h4>The combining algorithms</h4>
<ul>
<li><b>Deny-overrides.</b> If any policy says deny, the answer is deny, whatever else permits. The
safe default and the right choice almost always: a prohibition should not be defeatable by adding
another rule somewhere else.</li>
<li><b>Permit-overrides.</b> Any permit wins. Occasionally justified (a break-glass rule that must cut
through everything), but as a general setting it means one careless broad grant silently undoes every
restriction you have.</li>
<li><b>First-applicable.</b> Evaluate in order; the first policy that matches decides. Predictable and
easy to debug, but the outcome now depends on ordering, so inserting a rule in the wrong place changes
unrelated decisions.</li>
<li><b>Specificity wins.</b> The most specific matching rule decides: a rule about one document beats
a rule about the folder. Intuitive for humans, and the hardest to implement, because "more specific"
must be defined precisely and total.</li>
</ul>
<div class="codeSample" data-hl>request: Ada wants to read document 4417

  org policy      permit   employees may read internal documents
  project policy  permit   project members may read project documents
  legal hold      DENY     documents under legal hold are read-only to counsel

deny-overrides   -> DENY    (one prohibition is enough)
permit-overrides -> permit  (the legal hold is silently defeated)
first-applicable -> depends entirely on evaluation order</div>

<h4>The default when nothing matches</h4>
<p>Separate from combining, and just as important: what happens when <i>no</i> policy applies? The
answer must be <b>deny</b>. Default-permit means every resource anyone forgets to write a rule for is
public, and that is a mistake you discover from the outside.</p>
<p>So a well-behaved decision has three possible outcomes, not two: <b>permit</b>, <b>deny</b>, and
<b>not-applicable</b>; the last collapses to deny at the enforcement point. Keeping them distinct
in the engine is what lets you tell "a rule deliberately blocked this" apart from "no rule covered
this," which are very different bugs.</p>

<h4>Explicit deny versus absence of permit</h4>
<p>These feel similar and behave differently under composition. An <b>explicit deny</b> is a statement:
under deny-overrides it cannot be overridden by any later grant. An <b>absence of permit</b> is merely
a gap, and a gap can be filled by anyone who adds a policy.</p>
<p>That is why explicit denies are the right tool for things that must never happen regardless of who
gets creative later: contractors must never read payroll, nobody reads a legal hold. Use them
sparingly, though: a large body of denies interacting with a large body of permits becomes impossible
to reason about, and the resulting system fails in the direction of blocking legitimate work.</p>

<h4>Make the decision explainable</h4>
<p>The single most valuable feature of a policy engine is not the decision; it is <b>which policy
decided</b>. Without it, debugging is guesswork, and the standard response to an unexplained denial is
to add a broad permit until it works, which is how policy sets rot.</p>
<div class="codeSample" data-hl>{ "decision": "DENY",
  "decidedBy": "legal-hold-2024",
  "evaluated": ["org-baseline: permit",
                "project-members: permit",
                "legal-hold-2024: DENY"],
  "algorithm": "deny-overrides" }</div>
<p>And test the combinations, not the rules. Each policy in isolation is usually obviously correct; the
defects live in the interactions, so the cases worth writing down are the ones where two rules
disagree.</p>`,
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
<p>ReBAC is easy to describe and hard to run. "Ada can view this document because she is a member of a
group that was granted access to the folder it lives in" is a graph traversal. Doing that for every
request, across billions of relationships, in single-digit milliseconds, and never once showing someone
a document they should not see, is a genuinely difficult systems problem. Google's Zanzibar paper is the
reference answer, and the reasoning generalizes to any centralized authorization service.</p>

<h4>The data model</h4>
<p>Everything is a <b>relation tuple</b>: a subject, a relation, and an object. Nothing else:</p>
<div class="codeSample" data-hl>doc:readme#viewer@user:ada              ada can view the readme
doc:readme#parent@folder:eng           the readme lives in the eng folder
group:eng#member@user:bob              bob is in the eng group
folder:eng#viewer@group:eng#member     eng members can view the eng folder

// so: can bob view the readme? not stated anywhere. it is DERIVED by
// walking parent -> folder viewer -> group member -> bob.</div>
<p>Permissions are computed, not stored, which is what makes the model expressive, and what makes
every check a traversal.</p>

<h4>The three hard problems</h4>
<p><b>1. Latency.</b> A check may fan out across many tuples and many shards. The answer is aggressive
caching plus a trick worth knowing: <b>leopard indexes</b>, which precompute the transitive closure of
slow-changing sets such as group membership, so a deep nesting chain collapses into one lookup.</p>
<p><b>2. Consistency, the "new enemy" problem.</b> This is the one that makes the design interesting.
Authorization has a failure mode ordinary caches do not:</p>
<div class="codeSample" data-hl>t1  Ada removes Bob from the group
t2  Ada adds a confidential document to the group's folder
t3  Bob's check hits a replica that has t2 but NOT t1

    -> Bob sees the document. Each write was correct. The ORDER was lost.

// the reverse also matters: revoking access must not be overtaken by a
// stale cache that still says "permitted".</div>
<p>Eventual consistency is unacceptable here, and full strong consistency everywhere is too slow. The
resolution is a <b>consistency token</b> (Zanzibar calls it a <i>zookie</i>) handed back when content
is written and presented with the later check. It means "evaluate against a snapshot at least this
recent". The client does not need a global clock; it just carries a token forward, and the system
guarantees it will not answer from an older state.</p>
<p><b>3. Ordering across the system.</b> Underneath, this needs globally ordered timestamps, which is
why Zanzibar sits on Spanner. Reimplementations substitute their own ordering mechanism, and that
substitution is where correctness is usually lost.</p>

<h4>The centralization trade</h4>
<p>A central authorization service buys consistent policy, one audit trail, and one place to answer
"who can see this?" (a question most estates genuinely cannot answer). It costs you a <b>hard runtime
dependency on the critical path of every request</b>. That is the trade to weigh, and the
mitigations are the familiar ones: aggressive caching, and a deliberate decision about what happens
when the service is unreachable. Fail closed, and an authorization outage is a total outage.</p>

<h4>When you need this, and when you do not</h4>
<div class="codeSample" data-hl>YOU PROBABLY DO NOT                 YOU PROBABLY DO
roles map cleanly to permissions    sharing is user-driven and arbitrary
authorization is per-endpoint       "shared with me", nested folders, links
one service owns the data           many services must agree on one answer
"who can see this?" is answerable   the answer is currently unknowable</div>
<p>The sensible default: <b>most applications do not need Zanzibar</b>, and a tenant-scoped query with an
ownership check is the right answer. Reach for a relationship graph when users themselves grant access
to each other in patterns you cannot enumerate in advance, which is exactly the case document sharing,
repositories and collaboration tools have.</p>
<p>And if you do build on this model, the property to protect is not expressiveness but <b>the
guarantee that a revocation is never overtaken by a stale read</b>. Everything else is optimization.</p>`,
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
relationships, combining rules. This one is about <b>running</b> it, which is a different discipline and the
one that decides whether your model survives contact with production. A policy engine is not a library you
install; it is a system that answers thousands of questions per second, that everyone depends on, that
almost nobody can read, and that fails in a way users experience as "the button does nothing".</p>

<h4>The denial nobody can explain</h4>
<p>Here is the failure that defines the discipline. A user is refused. They raise a ticket. Support cannot
say why. The engineer on call opens the policy, reads forty rules across three files, and cannot say why
either, because the decision depended on the user's group memberships at that instant, an attribute
fetched from a directory, and a rule written by someone who left.</p>
<p>The fix is not a better policy language. It is to make the engine <b>return its reasoning with its
answer</b>. A decision should carry the rule that produced it, the inputs it used and the effect it applied:</p>
<div class="codeSample" data-hl>{ "allow": false,
  "rule":  "deny-prod-without-oncall",     // WHICH rule decided
  "inputs": { "role": "dev", "env": "prod", "oncall": false },
  "policy_version": "2026-08-14.3" }       // WHICH version of the policy</div>
<p>That single field turns an unanswerable ticket into a ten-second lookup, and it is the difference between
an authorization system you can operate and one you can only fear. Log every decision this way: deny
<i>and</i> allow, because "why was this permitted?" is the question an auditor asks after an incident.</p>

<h4>Policy is code, so test it like code</h4>
<p>Policies have the same properties that make code worth testing: branches, precedence, and consequences
when wrong. Yet they are routinely shipped with no test at all, because they live in a different file from
the application and often in a different language.</p>
<p>The tests worth writing are not "does rule 12 fire". They are the invariants your organization actually
holds:</p>
<ul>
<li><b>The positive cases.</b> A support agent can read a ticket. An engineer on call can restart a service.</li>
<li><b>The negative cases, which matter more.</b> A support agent cannot read a payment method. A contractor
cannot approve their own expense. Every negative test is a control you can prove.</li>
<li><b>The separation-of-duties invariants</b>: no single identity can both create and approve the same
payment, whatever roles it accumulates.</li>
<li><b>The default.</b> A request that matches nothing must be denied, and there should be a test that
fails loudly if a future edit makes the default permissive.</li>
</ul>

<h4>Shadow mode: the only safe way to change a policy</h4>
<p>A policy change is a change to who can do what, applied to everyone at once, with no gradual rollout,
unless you build one. <b>Shadow mode</b> is that rollout: run the new policy alongside the old, enforce the
<i>old</i> answer, and log every case where the two disagree.</p>
<p>After a day you have a list of exactly who would have been newly denied. That list is the review. It
routinely contains a team nobody thought about (the batch job running as a service account, the
integration that authenticates as a former employee), and finding them in a log is enormously cheaper than
finding them in an incident. Only when the disagreement list is empty, or entirely expected, do you switch
to enforcing.</p>

<h4>The operational properties nobody specifies until they hurt</h4>
<ul>
<li><b>Latency.</b> Authorization sits in every request. A remote PDP adds a network hop to every call, which
is why decisions get cached, and caching a decision means a revoked permission stays live for the cache
lifetime. That TTL is a security parameter, not a performance one.</li>
<li><b>Availability.</b> If the PDP is unreachable, do you fail open or closed? Closed is correct and it
means the PDP's uptime is now your application's uptime. That is an argument for distributing policy to
the enforcement points rather than centralizing the decision.</li>
<li><b>Versioning.</b> A decision made yesterday was made by yesterday's policy. Without a version in the
decision log you cannot reconstruct why, which makes post-incident review guesswork.</li>
<li><b>Staleness.</b> Attributes and group memberships arrive from elsewhere and are almost always slightly
old. "How stale can this input be before the decision is wrong?" is a question worth answering deliberately
rather than discovering.</li>
</ul>
<p>The summary a senior engineer should be able to give: <b>a policy you cannot test, explain or roll out
gradually is not a policy; it is a liability with a syntax.</b></p>`,
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
