STREAMS.push({icon:'🗝️',iam:true,sec:'Governance & privileged access',title:'Identity Governance & Privileged Access',blurb:'Keeping access correct over time: identity governance (access reviews, certification, separation of duties), privileged access management (vaulting, just-in-time elevation), secrets management and rotation, and CIAM vs workforce IAM.',lessons:[

{id:'ig1',title:'IGA: reviews & certification',body:`
<p>Access granted is rarely access removed — over years, people accumulate entitlements they no longer need (<b>privilege creep</b>). <b>IGA</b> (Identity Governance and Administration) fixes this with periodic <b>access reviews</b>: managers or resource owners <b>certify</b> that each person still needs what they hold, and anything unconfirmed is revoked.</p>
<p>Governance also covers access <b>requests</b> with approval workflows and an <b>audit trail</b> of who approved what — the evidence auditors and regulators ask for. The core decision in a review is simply: is this access still needed? If yes, keep it; if not, revoke it.</p>`,
docs:[['Identity governance','https://en.wikipedia.org/wiki/Identity_governance'],['Access certification','https://www.gartner.com/en/information-technology/glossary/identity-governance-and-administration-iga']],
ex:{title:'Certify or revoke',
prompt:`Write class <code>Review</code> with <code>static String decision(boolean stillNeeded)</code> that returns <code>"keep"</code> when the access is still needed and <code>"revoke"</code> otherwise. Use a single conditional expression.`,
starter:`public class Review {
    static String decision(boolean stillNeeded) {
        return null;
    }
}`,
solution:`public class Review {
    static String decision(boolean stillNeeded) {
        return stillNeeded ? "keep" : "revoke";
    }
}`,
tests:[{d:'keeps needed access, revokes the rest',re:'stillNeeded\\s*\\?\\s*"keep"\\s*:\\s*"revoke"'}],
behavior:`decision(true) is "keep", decision(false) is "revoke". Unconfirmed access defaults to revoked, which is how reviews reverse privilege creep.`,
hints:['The ternary operator condition ? a : b fits in one line.','Return "keep" for true and "revoke" for false.','Default-deny: anything not certified should be revoked.']}},

{id:'ig2',title:'Entitlements & separation of duties',body:`
<p>An <b>entitlement</b> is a specific grant — membership in a group, a role, a fine-grained permission. Governance tracks entitlements so it can spot <b>toxic combinations</b>: pairs no one person should hold together. Classic example in finance: whoever can <b>create</b> a vendor invoice must not also be able to <b>pay</b> it, or a single insider could commit fraud undetected.</p>
<p>Detecting these separation-of-duties conflicts across everyone&#8217;s entitlements is a standard governance control, checked at request time and re-checked during reviews.</p>`,
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
<p>Admin, root, and break-glass accounts are the crown jewels, so they get extra controls under <b>PAM</b>. Credentials live in a <b>vault</b> rather than on laptops; sessions can be <b>recorded</b> for audit; and access is granted <b>just-in-time</b> — elevated only for a short, approved window instead of standing 24/7.</p>
<p>The safest privileged grant therefore requires two things at once: it was <b>approved</b>, and it is <b>time-boxed</b> so it expires automatically. Standing privilege is the anti-pattern PAM exists to eliminate.</p>`,
docs:[['Privileged access management','https://en.wikipedia.org/wiki/Privileged_access_management'],['Just-in-time access','https://learn.microsoft.com/en-us/entra/id-governance/privileged-identity-management/pim-configure']],
ex:{title:'Grant privilege safely',
prompt:`Write class <code>Pam</code> with <code>static boolean grant(boolean approved, boolean timeBoxed)</code> that grants elevated access only when it was both approved and time-boxed.`,
starter:`public class Pam {
    static boolean grant(boolean approved, boolean timeBoxed) {
        return false;
    }
}`,
solution:`public class Pam {
    static boolean grant(boolean approved, boolean timeBoxed) {
        return approved && timeBoxed;
    }
}`,
tests:[{d:'must be approved',re:'approved\\s*&&'},{d:'must be time-boxed',re:'&&\\s*timeBoxed'}],
behavior:`grant(true,true) is true; grant(true,false) is false (standing privilege is refused); grant(false,true) is false. JIT elevation that expires is the goal.`,
hints:['Both conditions must hold, so combine them with &&.','Approved alone is not enough without a time box.','Standing (non-time-boxed) privilege must be refused.']}},

{id:'ig4',title:'Secrets management & rotation',body:`
<p>Applications need secrets — database passwords, API keys, signing keys. Hardcoding them in code or config is how leaks happen. A <b>secrets manager</b> (HashiCorp Vault, or a cloud secret manager) stores them centrally, hands them out with access control, and audits every fetch. High-value keys live in an <b>HSM</b> (hardware security module) that never lets the raw key leave.</p>
<p><b>Rotation</b> is the other half: secrets should be replaced on a schedule (and immediately after any suspected exposure), so a leaked credential has a short useful life. A secret is due for rotation once its age reaches the policy maximum.</p>`,
docs:[['Secrets management — Vault','https://developer.hashicorp.com/vault/docs/what-is-vault'],['Key management — NIST','https://csrc.nist.gov/projects/key-management']],
ex:{title:'Is a secret due for rotation?',
prompt:`Write class <code>Secrets</code> with <code>static boolean rotateDue(long ageDays, long maxDays)</code> that returns true when the secret&#8217;s age has reached or exceeded the maximum allowed age.`,
starter:`public class Secrets {
    static boolean rotateDue(long ageDays, long maxDays) {
        return false;
    }
}`,
solution:`public class Secrets {
    static boolean rotateDue(long ageDays, long maxDays) {
        return ageDays >= maxDays;
    }
}`,
tests:[{d:'due once age reaches the maximum',re:'ageDays\\s*>=\\s*maxDays'},{d:'does not hardcode a result',re:'return\\s+(true|false)\\s*;',not:true}],
behavior:`rotateDue(90,90) is true, rotateDue(91,90) is true, rotateDue(30,90) is false. Rotating on schedule shrinks the window a leaked secret is useful.`,
hints:['Reached or exceeded means the >= comparison.','Compare ageDays against maxDays directly.','Return the boolean result of the comparison.']}},

{id:'ig5',title:'CIAM vs workforce IAM',body:`
<p>Identity comes in two flavors with different priorities. <b>Workforce IAM</b> governs employees and contractors: the emphasis is control — provisioning from HR, least privilege, access reviews, fast deprovisioning. <b>CIAM</b> (Customer IAM) governs external users: the emphasis is experience and scale — self-service registration, social login, consent and privacy, and handling millions of accounts.</p>
<p>Both rest on the same protocols (OAuth, OIDC, SAML) and the same compliance backbone (audit, least privilege, deprovisioning), but you tune them differently for employees versus customers.</p>`,
docs:[['CIAM vs IAM','https://auth0.com/blog/what-is-ciam/'],['Workforce vs customer identity','https://www.okta.com/customer-identity/']],
ex:{title:'Who is the audience?',
prompt:`Write class <code>Iam</code> with <code>static String audience(String type)</code>: <code>"ciam"</code>→<code>"customers"</code>, <code>"workforce"</code>→<code>"employees"</code>, and <code>"unknown"</code> otherwise.`,
starter:`public class Iam {
    static String audience(String type) {
        return null;
    }
}`,
solution:`public class Iam {
    static String audience(String type) {
        switch (type) {
            case "ciam":      return "customers";
            case "workforce": return "employees";
            default:          return "unknown";
        }
    }
}`,
tests:[{d:'CIAM serves customers',re:'"ciam".*?"customers"',flags:'s'},{d:'workforce IAM serves employees',re:'"workforce".*?"employees"',flags:'s'},{d:'unknown default',re:'"unknown"'}],
behavior:`audience("ciam") is "customers", audience("workforce") is "employees", audience("x") is "unknown". Same protocols, different priorities: experience and scale for customers, control for employees.`,
hints:['A two-case switch with a default covers it.','CIAM is customer-facing; workforce IAM is employee-facing.','Anything else returns unknown.']}},
{id:'ig6',title:'Consent & privacy in CIAM',body:`
<p>Consumer identity (CIAM) means holding real people's personal data, so <b>consent and privacy are first-class</b>, not an afterthought — and often legally required (GDPR, CCPA).</p>
<ul>
<li><b>Explicit, granular consent</b> — opt-in per purpose ("email me offers" separate from "process my order"), not one blanket checkbox. In OAuth/OIDC the consent screen is where the user approves <b>scopes</b>; record what was approved (a consent receipt).</li>
<li><b>Data minimization</b> — collect only what you actually need. Less data is less risk and less to leak.</li>
<li><b>Progressive profiling</b> — ask for more information over time as it's needed, instead of a giant signup form.</li>
<li><b>Data-subject rights</b> — access, correction, and <b>erasure</b> ("right to be forgotten"), plus the ability to <b>revoke consent</b> at any time.</li>
</ul>
<p><b>Privacy by design</b>: default to the least data, encrypt PII, make consent revocable, and keep an auditable record of what each user agreed to and when. Consent you can't prove or revoke isn't real consent.</p>`,
docs:[['GDPR consent','https://gdpr.eu/gdpr-consent-requirements/'],['Privacy by design','https://en.wikipedia.org/wiki/Privacy_by_design']],
ex:{title:'Validate consent & minimization',
prompt:`Write class <code>Consent</code> with <code>static boolean valid(boolean explicit, boolean granular, boolean revocable)</code> that is true only when consent is all three, and <code>static boolean dataMinimized(int collected, int needed)</code> returning true only when you collected no more than you needed (<code>collected &lt;= needed</code>).`,
starter:`public class Consent {
    static boolean valid(boolean explicit, boolean granular, boolean revocable) {
        return false;
    }
    static boolean dataMinimized(int collected, int needed) {
        return false;
    }
}`,
solution:`public class Consent {
    static boolean valid(boolean explicit, boolean granular, boolean revocable) {
        return explicit && granular && revocable;
    }
    static boolean dataMinimized(int collected, int needed) {
        return collected <= needed;
    }
}`,
tests:[{d:'valid consent is explicit, granular and revocable',re:'explicit\\s*&&\\s*granular\\s*&&\\s*revocable'},{d:'data minimization: collected <= needed',re:'collected\\s*<=\\s*needed'}],
behavior:`valid(true,true,true) is true; if consent is implicit, all-or-nothing, or cannot be revoked, it is false. dataMinimized(3,5) is true; dataMinimized(9,5) is false — you collected more than you needed. Consent must be provable and revocable to count.`,
hints:['Real consent is explicit, granular, and revocable — combine with &&.','Data minimization means collected is at most needed.','In OIDC the consent screen approves scopes; record what was agreed.']}}
]});
