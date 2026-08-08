STREAMS.push({icon:'🧩',iam:true,sec:'Authorization models',title:'Authorization Models',blurb:'Once you know who someone is, how do you decide what they can do? ACLs, RBAC (roles), ABAC (attributes/policy), ReBAC (relationships), and policy engines — plus least privilege, separation of duties, and the PDP/PEP split.',lessons:[

{id:'az1',title:'From ACLs to roles (RBAC)',body:`
<p>The simplest model is an <b>Access Control List</b> (ACL): each resource keeps a list of who may do what. It is precise but explodes — thousands of users times thousands of resources becomes unmanageable.</p>
<p><b>RBAC</b> (Role-Based Access Control) adds a layer of indirection: users get <b>roles</b> (admin, editor, viewer), and roles carry <b>permissions</b>. You manage a handful of roles instead of millions of user-resource pairs, and onboarding is just "assign a role." It is the default model in most enterprises for good reason.</p>
<div class="codeSample" data-hl>// a permission check reduces to: does this user hold a role that grants it?
boolean allowed = user.roles().contains("admin");</div>`,
docs:[['RBAC — NIST','https://csrc.nist.gov/projects/role-based-access-control'],['Access control — OWASP','https://cheatsheetseries.owasp.org/cheatsheets/Access_Control_Cheat_Sheet.html']],
ex:{title:'Role check',
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
tests:[{d:'checks membership of the admin role',re:'roles\\.contains\\s*\\(\\s*"admin"\\s*\\)'},{d:'does not hardcode true',re:'return\\s+true\\s*;',not:true}],
behavior:`isAdmin(Set.of("editor","admin")) is true; isAdmin(Set.of("viewer")) is false. RBAC turns a permission check into a role-membership check.`,
hints:['A Java Set has a contains method that returns a boolean.','Return the result of roles.contains("admin") directly.','No if statement is needed — the contains call already yields the boolean.']}},

{id:'az2',title:'RBAC in depth: roles to permissions',body:`
<p>Roles are only useful if they map to concrete <b>permissions</b>. A viewer can read; an editor can read and write; an admin can read, write, and delete. Keeping that mapping in one place means a policy change is one edit, not a hunt across the codebase.</p>
<p>Design tips: prefer a few broad roles over hundreds of narrow ones (role explosion is RBAC&#8217;s failure mode), and grant the <b>least privilege</b> each role truly needs. When roles alone cannot express a rule ("only the owner", "only during business hours"), that is the signal to reach for ABAC in the next lesson.</p>`,
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
tests:[{d:'viewer can read',re:'"viewer".*?"read"',flags:'s'},{d:'editor can read and write',re:'"editor".*?"read,write"',flags:'s'},{d:'admin can read, write, delete',re:'"admin".*?"read,write,delete"',flags:'s'},{d:'unknown role gets no permissions',re:'return\\s+""'}],
behavior:`permissions("viewer") is "read", permissions("editor") is "read,write", permissions("admin") is "read,write,delete", permissions("ghost") is "". The mapping lives in one place, so policy changes are one edit.`,
hints:['A switch on role keeps the whole mapping in one readable place.','Higher roles simply list more comma-separated permissions.','Unknown roles fall through to the default returning an empty string.']}},

{id:'az3',title:'ABAC: attributes & policy',body:`
<p><b>ABAC</b> (Attribute-Based Access Control) decides using <i>attributes</i> of the user, the resource, the action, and the context — not just a role. "An employee may view a record <b>in their own department</b>," "a manager may approve amounts <b>under their limit</b>," "access only <b>during business hours</b>." Rules like these are impossible to express as roles alone.</p>
<p>ABAC is more expressive than RBAC but harder to reason about, so teams often combine them: RBAC for the coarse "can this kind of user do this kind of thing," ABAC for the fine "on this specific resource, right now." The rule is written as a boolean policy over the attributes.</p>`,
docs:[['ABAC — NIST 800-162','https://csrc.nist.gov/publications/detail/sp/800-162/final'],['ABAC vs RBAC','https://auth0.com/blog/what-is-abac-attribute-based-access-control/']],
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
tests:[{d:'same-department attribute grants access',re:'userDept\\.equals\\s*\\(\\s*resourceDept\\s*\\)'},{d:'ownership also grants access',re:'\\|\\|\\s*isOwner'}],
behavior:`permit("sales","sales",false) is true (same department); permit("sales","hr",true) is true (owner); permit("sales","hr",false) is false. The decision is a boolean over attributes, not a fixed role.`,
hints:['Compare the two department strings with equals.','Combine the department match with ownership using the || operator.','Either condition being true should grant access.']}},

{id:'az4',title:'ReBAC & policy engines',body:`
<p>Some questions are about <b>relationships</b>: "can this user view this document?" depends on whether the document was <i>shared with</i> them, who <i>owns</i> it, and which <i>group</i> they belong to. <b>ReBAC</b> (Relationship-Based Access Control) models permissions as a graph of relations — the approach behind Google&#8217;s Zanzibar and open-source <b>OpenFGA</b>.</p>
<p>To keep policy out of scattered <code>if</code> statements, teams externalize it to a <b>policy engine</b>: the app asks "is this allowed?" and the engine answers from declarative rules. <b>OPA</b> (with the Rego language) and <b>AWS Cedar</b> are the common choices. This is <b>PBAC</b> — Policy-Based Access Control — and it lets security rules evolve without redeploying the app.</p>`,
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
tests:[{d:'owner can view',re:'user\\.equals\\s*\\(\\s*owner\\s*\\)'},{d:'shared-with relationship grants view',re:'sharedWith\\.contains\\s*\\(\\s*user\\s*\\)'},{d:'combines the relationships with OR',re:'\\|\\|'}],
behavior:`canView("ada","ada",Set.of()) is true (owner); canView("bo","ada",Set.of("bo")) is true (shared); canView("cy","ada",Set.of("bo")) is false. Access follows the relationship graph, which is what ReBAC models.`,
hints:['Ownership is an equals check between user and owner.','A shared relationship is membership in the sharedWith set.','Combine the two relationships with ||.']}},

{id:'az5',title:'PDP/PEP, least privilege & separation of duties',body:`
<p>Two architectural terms show up everywhere in authorization. The <b>PDP</b> (Policy Decision Point) is the brain that answers "allow or deny"; the <b>PEP</b> (Policy Enforcement Point) is the gate in front of the resource that <i>asks</i> the PDP and enforces the answer. Separating them means one consistent decision engine guards many enforcement points.</p>
<p>Two principles govern good policy. <b>Least privilege</b>: grant the minimum access needed, for the shortest time. <b>Separation of duties</b> (SoD): no single person should hold a conflicting combination — the one who <i>creates</i> a payment must not also <i>approve</i> it. SoD is a cornerstone of fraud prevention and audit.</p>`,
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
tests:[{d:'checks for the maker role',re:'contains\\s*\\(\\s*"maker"\\s*\\)'},{d:'checks for the checker role',re:'contains\\s*\\(\\s*"checker"\\s*\\)'},{d:'a violation needs BOTH roles',re:'&&'}],
behavior:`violates(Set.of("maker","checker")) is true; violates(Set.of("maker")) is false. Holding both halves of a create-and-approve pair breaks separation of duties.`,
hints:['A conflict exists only when both roles are present, so use &&.','Check membership of each role with contains.','One role alone is fine; it is the combination that violates the rule.']}},

]});
