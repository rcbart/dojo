STREAMS.push({icon:'🏢',iam:true,sec:'Enterprise identity & directories',title:'Enterprise Identity & Directories',blurb:'The systems that run identity inside companies: LDAP & Active Directory, Kerberos tickets, SCIM provisioning and the joiner/mover/leaver lifecycle, just-in-time provisioning, home-realm discovery, and social login with account linking.',lessons:[

{id:'ei1',title:'LDAP & Active Directory',body:`
<p>Enterprises keep users, groups, and computers in a <b>directory</b> — a hierarchical database queried over <b>LDAP</b> (Lightweight Directory Access Protocol). Microsoft&#8217;s <b>Active Directory</b> is the dominant implementation. Entries are named by a <b>Distinguished Name</b> (DN), a path from the specific entry up to the domain root.</p>
<div class="codeSample">cn=Ada Lovelace,ou=Engineering,dc=example,dc=com
| the entry     | org unit      | the domain parts |</div>
<p>Apps authenticate a user by <b>binding</b> to the directory with their DN and password, then read group memberships to make authorization decisions. LDAP is read-heavy and fast, which is why it underpins so much enterprise login.</p>`,
docs:[['LDAP — Wikipedia','https://en.wikipedia.org/wiki/Lightweight_Directory_Access_Protocol'],['Active Directory','https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/get-started/virtual-dc/active-directory-domain-services-overview']],
ex:{title:'Build a Distinguished Name',
prompt:`Write class <code>Ldap</code> with <code>static String dn(String cn, String dc)</code> that returns a simple DN of the form <code>cn=&lt;cn&gt;,dc=&lt;dc&gt;</code>.`,
starter:`public class Ldap {
    static String dn(String cn, String dc) {
        return null;
    }
}`,
solution:`public class Ldap {
    static String dn(String cn, String dc) {
        return "cn=" + cn + ",dc=" + dc;
    }
}`,
tests:[{d:'starts with the cn component',re:'"cn="\\s*\\+\\s*cn'},{d:'appends the dc component',re:'",dc="\\s*\\+\\s*dc'}],
behavior:`dn("ada","example") returns "cn=ada,dc=example". A real DN chains more components, but the comma-separated attribute=value shape is the same.`,
hints:['Concatenate the fixed labels and the arguments with +.','The two literals are "cn=" and ",dc=".','Order is cn first, then the dc part.']}},

{id:'ei2',title:'Kerberos: tickets, not passwords',body:`
<p><b>Kerberos</b> is the ticket-based SSO at the heart of Active Directory. Instead of sending your password to each service, you prove yourself once to a central <b>KDC</b> (Key Distribution Center) and receive tickets.</p>
<p>The flow: the <b>Authentication Service</b> (AS) verifies you and issues a <b>Ticket-Granting Ticket</b> (TGT). To reach a specific service, you present the TGT to the <b>Ticket-Granting Service</b> (TGS), which issues a <b>service ticket</b> for just that service. Passwords never travel to the services, and everything is time-limited to resist replay.</p>`,
docs:[['Kerberos — MIT','https://web.mit.edu/kerberos/'],['Kerberos explained','https://learn.microsoft.com/en-us/windows-server/security/kerberos/kerberos-authentication-overview']],
ex:{title:'What each stage issues',
prompt:`Write class <code>Kerberos</code> with <code>static String issues(String phase)</code>: <code>"as"</code>→<code>"TGT"</code>, <code>"tgs"</code>→<code>"service ticket"</code>, and <code>"unknown"</code> otherwise.`,
starter:`public class Kerberos {
    static String issues(String phase) {
        return null;
    }
}`,
solution:`public class Kerberos {
    static String issues(String phase) {
        switch (phase) {
            case "as":  return "TGT";
            case "tgs": return "service ticket";
            default:    return "unknown";
        }
    }
}`,
tests:[{d:'AS issues a TGT',re:'"as".*?"TGT"',flags:'s'},{d:'TGS issues a service ticket',re:'"tgs".*?"service ticket"',flags:'s'},{d:'unknown default',re:'"unknown"'}],
behavior:`issues("as") is "TGT", issues("tgs") is "service ticket", issues("x") is "unknown". The TGT proves who you are; the service ticket authorizes one specific service.`,
hints:['A switch on phase with two cases and a default is enough.','The AS hands out the ticket-granting ticket; the TGS hands out per-service tickets.','Anything else returns unknown.']}},

{id:'ei3',title:'SCIM & the joiner/mover/leaver lifecycle',body:`
<p>People join, change roles, and leave — and their accounts must follow. <b>SCIM</b> (System for Cross-domain Identity Management) is the standard API for <b>provisioning</b>: an HR or identity system pushes create/update/deactivate operations to every connected app so accounts stay in sync automatically.</p>
<p>The lifecycle is often called <b>JML</b> — <b>Joiner</b> (create the account and grant baseline access), <b>Mover</b> (update access when the role changes), <b>Leaver</b> (deactivate/delete on exit). Automating leaver deprovisioning is the single biggest win: orphaned accounts after someone departs are a top breach cause.</p>`,
docs:[['SCIM','https://scim.cloud/'],['SCIM (RFC 7644)','https://www.rfc-editor.org/rfc/rfc7644']],
ex:{title:'Map the lifecycle event to an operation',
prompt:`Write class <code>Scim</code> with <code>static String op(String event)</code>: <code>"joiner"</code>→<code>"create"</code>, <code>"mover"</code>→<code>"update"</code>, <code>"leaver"</code>→<code>"delete"</code>, and <code>"unknown"</code> otherwise.`,
starter:`public class Scim {
    static String op(String event) {
        return null;
    }
}`,
solution:`public class Scim {
    static String op(String event) {
        switch (event) {
            case "joiner": return "create";
            case "mover":  return "update";
            case "leaver": return "delete";
            default:       return "unknown";
        }
    }
}`,
tests:[{d:'joiner creates the account',re:'"joiner".*?"create"',flags:'s'},{d:'mover updates access',re:'"mover".*?"update"',flags:'s'},{d:'leaver deletes/deactivates',re:'"leaver".*?"delete"',flags:'s'},{d:'unknown default',re:'"unknown"'}],
behavior:`op("joiner") is "create", op("mover") is "update", op("leaver") is "delete". Automating the leaver case closes the orphaned-account risk.`,
hints:['One switch, three cases plus a default.','Joiner creates, mover updates, leaver deletes.','SCIM carries exactly these operations between systems.']}},

{id:'ei4',title:'JIT provisioning & home-realm discovery',body:`
<p>Two conveniences smooth federated login. <b>Just-in-time (JIT) provisioning</b> creates the local account automatically the first time a federated user logs in — no pre-import needed; the identity provider&#8217;s assertion supplies the profile.</p>
<p><b>Home-realm discovery</b> answers "which identity provider should authenticate this person?" A multi-tenant app often decides from the <b>email domain</b>: a user typing <code>ada@example.com</code> is routed to example.com&#8217;s IdP. Extracting that domain is the first step of the routing.</p>`,
docs:[['JIT provisioning','https://auth0.com/docs/authenticate/identity-providers/enterprise-identity-providers/just-in-time-provisioning'],['Home realm discovery','https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/home-realm-discovery-policy']],
ex:{title:'Extract the email domain (the realm)',
prompt:`Write class <code>Broker</code> with <code>static String realm(String email)</code> that returns the part after the <code>@</code> — the domain used to pick the identity provider. Use <code>substring</code> and <code>indexOf("@")</code>.`,
starter:`public class Broker {
    static String realm(String email) {
        return null;
    }
}`,
solution:`public class Broker {
    static String realm(String email) {
        return email.substring(email.indexOf("@") + 1);
    }
}`,
tests:[{d:'locates the @ sign',re:'indexOf\\s*\\(\\s*"@"\\s*\\)'},{d:'returns everything after it',re:'substring\\s*\\(\\s*email\\.indexOf\\s*\\(\\s*"@"\\s*\\)\\s*\\+\\s*1\\s*\\)'}],
behavior:`realm("ada@example.com") returns "example.com". That domain is matched against configured tenants to route the user to the right IdP.`,
hints:['indexOf("@") gives the position of the @ character.','substring from that index + 1 skips the @ and returns the domain.','No loop is needed — the two calls compose into one expression.']}},

{id:'ei4b',title:'JIT provisioning: methods, security & when to use',body:`
<p>When a federated user shows up, where does their local account come from? There are three provisioning models, and choosing well is a real design decision.</p>
<ul>
<li><b>Pre-provisioning (SCIM / directory sync)</b> — accounts are created <i>ahead of time</i> from an authoritative source (HR system, corporate directory). Deterministic, supports rich attributes, and — crucially — supports <b>deprovisioning</b> when someone leaves.</li>
<li><b>Just-in-time (JIT) provisioning</b> — the account is created <i>on first successful login</i>, from the claims in the IdP's token or assertion. No pre-import, so it scales to large or unpredictable populations (customers, partners).</li>
<li><b>Manual</b> — an admin creates each account. Fine at small scale or where every account needs explicit approval.</li>
</ul>
<p><b>Security considerations for JIT.</b> JIT means you create an account — and often assign roles and group memberships — <b>based on claims you did not originate</b>. That is the risk: if you over-trust the IdP's attributes, a wrong or manipulated <code>groups</code> claim could hand out admin. Defenses: verify the IdP is <b>authoritative</b> for that email domain (home-realm), map claims to roles explicitly and <b>default to least privilege</b>, and key the account on the IdP's <b>stable subject id, not the email</b> (emails get reused and reassigned, which enables account takeover).</p>
<p><b>Implications to plan for.</b> JIT <b>creates but does not remove</b> — pair it with SCIM or periodic access reviews or you accumulate orphaned accounts after people leave. Attributes are only as fresh as the <b>last login</b>, so roles can go stale. And the first login pays a small provisioning cost.</p>
<p><b>When to use each.</b> Workforce with an HR source of truth: <b>SCIM pre-provisioning</b> (optionally JIT as a fallback) so you also get clean deprovisioning. Large external / partner / consumer (CIAM) populations: <b>JIT</b>, because pre-importing millions of users is impractical. Small or highly regulated systems needing explicit sign-off: <b>manual</b>.</p>`,
docs:[['JIT provisioning — Auth0','https://auth0.com/docs/authenticate/identity-providers/enterprise-identity-providers/just-in-time-provisioning'],['SCIM (RFC 7644)','https://www.rfc-editor.org/rfc/rfc7644'],['Account takeover via email reuse','https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html']],
ex:{title:'Choose the provisioning method',
prompt:`Write class <code>Provisioning</code> with <code>static String method(String scenario)</code>: <code>"workforce-hr-source"</code>→<code>"SCIM"</code>, <code>"large-external-users"</code>→<code>"JIT"</code>, <code>"small-regulated"</code>→<code>"manual"</code>, else <code>"unknown"</code>. Also <code>static boolean jitHandlesDeprovisioning()</code> returning <code>false</code> (JIT creates accounts but does not remove them).`,
starter:`public class Provisioning {
    static String method(String scenario) {
        return null;
    }
    static boolean jitHandlesDeprovisioning() {
        return false;
    }
}`,
solution:`public class Provisioning {
    static String method(String scenario) {
        switch (scenario) {
            case "workforce-hr-source":  return "SCIM";
            case "large-external-users": return "JIT";
            case "small-regulated":      return "manual";
            default:                     return "unknown";
        }
    }
    static boolean jitHandlesDeprovisioning() {
        return false;
    }
}`,
tests:[{d:'workforce with an HR source uses SCIM pre-provisioning',re:'"workforce-hr-source".*?"SCIM"',flags:'s'},{d:'large external populations use JIT',re:'"large-external-users".*?"JIT"',flags:'s'},{d:'small/regulated uses manual',re:'"small-regulated".*?"manual"',flags:'s'},{d:'JIT does NOT deprovision',re:'jitHandlesDeprovisioning[\\s\\S]*?return\\s+false',flags:'s'},{d:'unknown default',re:'"unknown"'}],
behavior:`method("workforce-hr-source") is "SCIM", method("large-external-users") is "JIT", method("small-regulated") is "manual". jitHandlesDeprovisioning() is false — the classic JIT gap: it creates accounts on first login but never removes them, so pair it with SCIM or access reviews.`,
hints:['Match the scenario to the model: HR source to SCIM, large external users to JIT, small/regulated to manual.','JIT provisions on first login from the IdP claims; it does not deprovision, so return false.','Key JIT accounts on the stable subject id and default to least privilege.']}},
{id:'ei5',title:'Social login & account linking',body:`
<p><b>Social login</b> lets users sign in with Google, Apple, GitHub, and the like — convenient, and it offloads credential security to the provider. The catch is <b>account linking</b>: the same human might sign in with Google today and email/password tomorrow, and both must resolve to one account.</p>
<p>The reliable key is <b>provider + the provider&#8217;s stable subject id</b> (not the email, which can change or be reused). Store that composite so a returning user is recognized regardless of which button they click, and link additional methods to the existing account rather than creating duplicates.</p>`,
docs:[['Account linking — Auth0','https://auth0.com/docs/manage-users/user-accounts/user-account-linking'],['Sign in with Google','https://developers.google.com/identity']],
ex:{title:'Build a stable linking key',
prompt:`Write class <code>Linking</code> with <code>static String key(String provider, String subject)</code> that returns a composite identity key of the form <code>provider|subject</code> (provider, a pipe, then the provider&#8217;s subject id).`,
starter:`public class Linking {
    static String key(String provider, String subject) {
        return null;
    }
}`,
solution:`public class Linking {
    static String key(String provider, String subject) {
        return provider + "|" + subject;
    }
}`,
tests:[{d:'joins provider and subject with a pipe',re:'provider\\s*\\+\\s*"\\|"\\s*\\+\\s*subject'},{d:'does not key on email',re:'email',not:true}],
behavior:`key("google","1043") returns "google|1043". Keying on provider plus the immutable subject id keeps one human mapped to one account, even across sign-in methods.`,
hints:['Concatenate provider, the literal "|", and subject.','The pipe is just a one-character separator string.','Use the stable subject id, never the mutable email.']}},
{id:'biz',title:'B2B, B2C & B2B2C — and what they mean for identity',body:`
<p>Who your product serves changes how you do identity more than almost any technical choice. Three business models:</p>
<ul>
<li><b>B2C (business-to-consumer)</b> — you serve <b>individuals</b> directly. Examples: Netflix, Spotify, a news app. Identity is <b>CIAM</b>: self-service registration, social login, password reset, huge scale, and heavy emphasis on frictionless UX plus privacy/consent.</li>
<li><b>B2B (business-to-business)</b> — you serve <b>other companies</b>, and each user belongs to a customer <b>organization (tenant)</b>. Examples: Salesforce, Datadog, Workday. Identity is enterprise: <b>SSO</b> (SAML/OIDC) into the customer's IdP, <b>SCIM</b> provisioning, delegated admin, and roles scoped to the tenant.</li>
<li><b>B2B2C (business-to-business-to-consumer)</b> — you serve a <b>business that serves its own consumers through you</b>. Examples: Shopify (merchants and their shoppers), Stripe (platforms and their customers), a white-label banking app. Identity has <b>two layers</b>: the business tenant <i>and</i> that tenant's end users, requiring strict <b>tenant isolation</b>, <b>delegated administration</b>, and often per-tenant branding or IdP.</li>
</ul>
<p><b>How it shapes authentication.</b> B2C optimizes for low-friction self-service and consent. B2B optimizes for federation and central control (the customer's IT owns the users). B2B2C must do both — isolate each tenant's users while letting each business manage its own consumers — which is why multi-tenancy (next lesson) is the defining problem for B2B and B2B2C.</p>`,
docs:[['CIAM vs workforce IAM','https://auth0.com/blog/what-is-ciam/'],['Multi-tenancy patterns','https://learn.microsoft.com/en-us/azure/architecture/guide/multitenant/overview']],
ex:{title:'Match the model to its identity style',
prompt:`Write class <code>Model</code> with <code>static String identityStyle(String model)</code>: <code>"b2c"</code>→<code>"CIAM self-service"</code>, <code>"b2b"</code>→<code>"enterprise SSO and SCIM"</code>, <code>"b2b2c"</code>→<code>"tenant isolation and delegated admin"</code>, else <code>"unknown"</code>. Also <code>static boolean multiTenant(String model)</code> returning true for <code>"b2b"</code> or <code>"b2b2c"</code>.`,
starter:`public class Model {
    static String identityStyle(String model) {
        return null;
    }
    static boolean multiTenant(String model) {
        return false;
    }
}`,
solution:`public class Model {
    static String identityStyle(String model) {
        switch (model) {
            case "b2c":   return "CIAM self-service";
            case "b2b":   return "enterprise SSO and SCIM";
            case "b2b2c": return "tenant isolation and delegated admin";
            default:      return "unknown";
        }
    }
    static boolean multiTenant(String model) {
        return model.equals("b2b") || model.equals("b2b2c");
    }
}`,
tests:[{d:'B2C is CIAM self-service',re:'"b2c".*?"CIAM self-service"',flags:'s'},{d:'B2B is enterprise SSO + SCIM',re:'"b2b".*?"enterprise SSO and SCIM"',flags:'s'},{d:'B2B2C is tenant isolation + delegated admin',re:'"b2b2c".*?"tenant isolation and delegated admin"',flags:'s'},{d:'B2B and B2B2C are multi-tenant',re:'equals\\s*\\(\\s*"b2b"\\s*\\)\\s*\\|\\|'},{d:'unknown default',re:'"unknown"'}],
behavior:`identityStyle("b2c") is "CIAM self-service", ("b2b") is "enterprise SSO and SCIM", ("b2b2c") is "tenant isolation and delegated admin". multiTenant("b2b") and ("b2b2c") are true; ("b2c") is false. The model dictates whether you optimize for self-service, federation, or both with isolation.`,
hints:['B2C serves consumers (CIAM); B2B serves companies (enterprise SSO); B2B2C serves a business and its consumers.','B2B and B2B2C introduce tenants, so they are multi-tenant.','Shopify (merchants + shoppers) is the classic B2B2C example.']}},
{id:'mt',title:'Multi-tenant identity for B2B & B2B2C',body:`
<p>In B2B and B2B2C each customer is a <b>tenant</b>, and getting tenancy right is the defining identity problem. Four design pillars:</p>
<ul>
<li><b>Tenant isolation</b> — every user, resource, and role is scoped to a <code>tenant_id</code>, and one tenant must never see another's data. A cross-tenant leak is the catastrophic failure mode, so isolation is checked on every request.</li>
<li><b>Per-tenant IdP connections</b> — Acme signs in through Okta, Beta through Microsoft Entra. You first <b>resolve the tenant</b> (by email domain or a per-tenant subdomain), then route the login to <i>that</i> tenant's identity provider.</li>
<li><b>Delegated administration</b> — each customer's own admins manage their users, groups, and roles, without your involvement.</li>
<li><b>Tenant-scoped roles</b> — the same person can be an admin in one tenant and a read-only member in another, so roles are always evaluated within a tenant.</li>
</ul>
<p>The recurring pattern: <b>resolve tenant → route to the right IdP → enforce tenant isolation on every access</b>. Home-realm discovery (mapping an email domain to a tenant and its IdP) is how the first step usually works.</p>`,
docs:[['Multi-tenant identity — Azure','https://learn.microsoft.com/en-us/azure/architecture/guide/multitenant/considerations/identity'],['Home realm discovery','https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/home-realm-discovery-policy']],
ex:{title:'Resolve tenant & enforce isolation',
prompt:`Write class <code>Tenant</code> with <code>static String tenantKey(String email)</code> that returns the email domain (everything after <code>@</code>, used for home-realm discovery) and <code>static boolean sameTenant(String resourceTenant, String userTenant)</code> that allows access only when the two tenants match.`,
starter:`public class Tenant {
    static String tenantKey(String email) {
        return null;
    }
    static boolean sameTenant(String resourceTenant, String userTenant) {
        return false;
    }
}`,
solution:`public class Tenant {
    static String tenantKey(String email) {
        return email.substring(email.indexOf("@") + 1);
    }
    static boolean sameTenant(String resourceTenant, String userTenant) {
        return resourceTenant.equals(userTenant);
    }
}`,
tests:[{d:'derives the tenant from the email domain',re:'substring\\s*\\(\\s*email\\.indexOf\\s*\\(\\s*"@"\\s*\\)\\s*\\+\\s*1\\s*\\)'},{d:'isolation: access only within the same tenant',re:'resourceTenant\\.equals\\s*\\(\\s*userTenant\\s*\\)'}],
behavior:`tenantKey("ada@acme.com") is "acme.com" (used to find Acme's tenant and IdP). sameTenant("acme","acme") is true; sameTenant("acme","beta") is false — the isolation check that prevents cross-tenant access.`,
hints:['Tenant discovery from an email is the substring after the @.','Isolation is an equality check: the resource tenant must equal the user tenant.','Resolve tenant first, route to its IdP, then enforce isolation on every request.']}}
]});
