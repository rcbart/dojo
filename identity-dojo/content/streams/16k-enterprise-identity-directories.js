STREAMS.push({icon:'🏢',iam:true,sec:'Enterprise identity & directories',title:'Enterprise Identity & Directories',blurb:'The systems that run identity inside companies: LDAP & Active Directory, Kerberos tickets, SCIM provisioning and the joiner/mover/leaver lifecycle, just-in-time provisioning, home-realm discovery, and social login with account linking.',lessons:[

{id:'ei1',title:'LDAP & Active Directory',body:`
<p>Enterprises keep users, groups, and computers in a <b>directory</b>: a hierarchical database queried over <b>LDAP</b> (Lightweight Directory Access Protocol). Microsoft&#8217;s <b>Active Directory</b> is the dominant implementation. Entries are named by a <b>Distinguished Name</b> (DN), a path from the specific entry up to the domain root.</p>
<div class="codeSample">cn=Ada Lovelace,ou=Engineering,dc=example,dc=com
| the entry     | org unit      | the domain parts |</div>
<p>Apps authenticate a user by <b>binding</b> to the directory with their DN and password, then read group memberships to make authorization decisions. LDAP is read-heavy and fast, which is why it underpins so much enterprise login.</p>

<h4>The tree, and why it shapes everything</h4>
<div class="codeSample" data-hl>dc=example,dc=com                     the domain root
 +-- ou=Engineering                   organizational unit - a container
 |    +-- cn=Ada Lovelace             the entry, addressed by its full DN
 +-- ou=Groups
      +-- cn=platform-admins          members listed as DNs, not names

DN   cn=Ada Lovelace,ou=Engineering,dc=example,dc=com   the full path (unique)
RDN  cn=Ada Lovelace                                     the leaf part
UID / sAMAccountName / userPrincipalName    the login name, which is NOT the DN</div>
<p>The trap: a DN encodes <i>where the entry sits</i>, so moving someone between OUs changes their DN.
Anything that stored the DN as a foreign key now points at nothing. Key on an immutable attribute
(<code>objectGUID</code> in AD, <code>entryUUID</code> in OpenLDAP), never the DN and never the email.</p>

<h4>Bind is authentication; search is everything else</h4>
<p>A <b>bind</b> is a login: present a DN and a password, and the directory says yes or no. Most apps do
it in two steps: bind as a service account, <i>search</i> for the user by their login name to find the
DN, then bind again as that user with their password. That second bind is the actual credential check,
and it is why the app holds the plaintext password: the credential-forwarding pattern from Foundations.</p>
<p>Two operational realities. An <b>anonymous bind</b> may be allowed and often exposes more of the tree
than anyone intended. And LDAP without TLS sends the password in clear text: <code>ldaps://</code> or
StartTLS is not optional.</p>

<h4>Reading groups</h4>
<p>Group membership is stored as a list of member DNs on the group, not as a list of groups on the user,
so "what groups is Ada in?" is a search across groups rather than a field lookup. AD offers
<code>memberOf</code> as a convenience, and nested groups still require a recursive query, which is the
transitive-membership problem the groups lesson covers.</p>

<h4>The cookbook: the four searches that answer most questions</h4>
<div class="codeSample" data-hl># find the user's DN and groups (bound as the service account)
ldapsearch -H ldaps://dc.example.com -D "cn=svc-app,ou=Service,dc=example,dc=com" -W -b "dc=example,dc=com" "(sAMAccountName=ada)" dn mail memberOf

# the actual credential check: bind AS the user, with the DN you just found
ldapsearch -H ldaps://dc.example.com -D "cn=Ada Lovelace,ou=Engineering,dc=example,dc=com" -W -b "" -s base

# who is in this group? members live on the group, not on the user
ldapsearch -H ldaps://dc.example.com -D "cn=svc-app,ou=Service,dc=example,dc=com" -W -b "cn=platform-admins,ou=Groups,dc=example,dc=com" member

# AD only: nested membership in ONE query, the matryoshka OID
ldapsearch -H ldaps://dc.example.com -D "cn=svc-app,ou=Service,dc=example,dc=com" -W -b "dc=example,dc=com" "(member:1.2.840.113556.1.4.1941:=cn=Ada Lovelace,ou=Engineering,dc=example,dc=com)" dn</div>
<p>Reading notes for the doer. <code>-W</code> prompts for the password instead of leaving it in shell
history. The scheme is <code>ldaps://</code> in every line for a reason. And before any user-supplied
text goes into a filter, escape the LDAP metacharacters (parentheses, asterisk, backslash, NUL):
filter injection is SQL injection's forgotten sibling, and "(sAMAccountName=" plus raw input is
exactly the same bug as string-concatenated SQL.</p>`,
docs:[['LDAP (Wikipedia)','https://en.wikipedia.org/wiki/Lightweight_Directory_Access_Protocol'],['Active Directory','https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/get-started/virtual-dc/active-directory-domain-services-overview']],
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

{id:'ei1b',title:'Active Directory in depth: structure, trusts and attack paths',body:`
<p>Active Directory has run enterprise identity for twenty-five years and still underpins most large
organizations, including ones that believe they have moved to the cloud. It is also, by a wide margin,
the most commonly compromised identity system in existence. Both facts deserve attention.</p>
<p>The reason it is worth studying carefully: AD is not one service. It is an <b>LDAP directory, a
Kerberos KDC, a DNS service and a policy engine</b> fused together, and the seams between them are
where the interesting behavior lives.</p>

<h4>The structure, and the boundary people get wrong</h4>
<div class="codeSample" data-hl>FOREST            the SECURITY boundary. shared schema and configuration.
  |               compromise anywhere in a forest = compromise everywhere.
  +-- DOMAIN      a replication and administration boundary. NOT a security
  |     |         boundary, however much the org chart wishes it were.
  |     +-- OU    where policy is applied and administration is delegated
  |     |
  |     +-- objects: users, computers, groups, service accounts, GPOs
  +-- DOMAIN      (trusts between domains are automatic within a forest)</div>
<p><b>The forest is the security boundary, not the domain.</b> This single fact reframes most AD risk
discussions. Splitting into separate domains for "isolation" achieves administrative separation and
almost no security separation: an attacker who reaches Domain Admin in one domain of a forest can
generally reach Enterprise Admin and therefore the whole forest. Real isolation requires a
<i>separate forest</i>.</p>

<h4>Trusts</h4>
<p>Trusts let one domain accept authentications from another, and the terminology is genuinely
confusing because <b>trust direction is the opposite of access direction</b>. If domain A trusts
domain B, then <i>B's users can access A's resources</i>. People routinely configure it backwards.</p>
<p>Properties that matter: <b>transitivity</b> (whether trust flows onward to domains that the trusted
domain trusts; within a forest it does, automatically), <b>direction</b> (one-way or two-way), and
whether <b>SID filtering</b> is enabled. SID filtering is the control that stops a compromised trusted
domain from injecting privileged SIDs (the SID history attack), and disabling it, which some
migrations do for convenience, effectively merges the security of both forests.</p>

<h4>Groups, GPOs and the delegation surface</h4>
<p>Group <b>scope</b> (domain local, global, universal) governs what can be nested where and what
replicates across the forest. It looks like trivia and produces real bugs in cross-domain access.</p>
<p><b>Group Policy</b> applies configuration to everything in a site, domain or OU. From a security
standpoint the important property is that <b>whoever can edit a GPO can run code on every machine it
applies to</b>. A GPO linked at the domain root, editable by a helpdesk group, is a domain-wide
compromise waiting to be noticed.</p>
<p>The same logic applies to directory permissions themselves. Rights like <code>GenericAll</code>,
<code>WriteDACL</code>, <code>WriteOwner</code> or "reset password" on a privileged object create
<b>shadow admins</b>: accounts that are not in any admin group but can trivially become one. These
accumulate silently over years of one-off delegations.</p>

<h4>The attack surface</h4>
<div class="codeSample" data-hl>DCSync            replication rights let an account ASK a domain controller
                  for every password hash, no malware, no access to the DC,
                  it is a legitimate protocol operation
NTDS.dit theft    the database file itself: every hash, offline
Pass-the-hash     NTLM authenticates with the HASH, so cracking is unnecessary
GPO abuse         edit a policy -> code execution on every machine it targets
ACL abuse         WriteDACL / GenericAll -> grant yourself what you need
Kerberos attacks  Kerberoasting, golden and silver tickets (next lesson)
Delegation abuse  unconstrained and resource-based (next lesson)</div>
<p>The unifying idea, and the most useful mental shift: <b>AD is a graph, and attackers think in
paths.</b> No single permission looks alarming. The path does: a helpdesk group can reset a service
desk account, which is local admin on a workstation, where a server admin logged in last week, whose
token can reach a machine trusted for delegation. Tools like BloodHound exist to compute exactly these
paths, and defenders should run them before attackers do. Auditing permissions one at a time will
never find this.</p>

<h4>The defenses that actually work</h4>
<ol>
<li><b>Tiering.</b> Tier 0 (domain controllers, AD itself, anything that can control it), Tier 1
(servers), Tier 2 (workstations). Credentials never flow downward: a Domain Admin must never log into
a workstation, because their credential material then exists on a machine at the lowest tier. This
single discipline breaks most real attack paths.</li>
<li><b>Privileged access workstations</b> for Tier 0 administration, and separate admin accounts from
day-to-day accounts.</li>
<li><b>Minimize Tier 0 membership</b>: Domain Admins, Enterprise Admins, Schema Admins, plus anything
with replication rights or GPO edit rights at the root. Most organizations discover this set is far
larger than they believed.</li>
<li><b>Randomize local administrator passwords</b> per machine (LAPS), or one stolen local hash opens
every workstation.</li>
<li><b>Retire NTLM</b> where possible, and use the Protected Users group and managed service accounts
(gMSA) so credentials are not cached or human-chosen.</li>
<li><b>Monitor the graph</b>, not just the groups: alert on replication-rights grants, GPO edits, ACL
changes on privileged objects, and new delegation configuration.</li>
</ol>

<h4>The hybrid reality</h4>
<p>Very few organizations are purely cloud. Most synchronize AD to a cloud IdP, which creates a new
critical dependency: <b>the sync server is Tier 0</b>. It holds credentials or hashes for the whole
directory and can write to both sides, yet it is frequently treated as an ordinary application server.
Whichever integration model is used (hash sync, pass-through authentication, or federation), the
question to ask is the same: what can that server do, and who can log into it?</p>`,
docs:[['Microsoft: Securing privileged access and the tier model','https://learn.microsoft.com/en-us/security/privileged-access-workstations/privileged-access-access-model'],['Microsoft (Active Directory security best practices)','https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/plan/security-best-practices/best-practices-for-securing-active-directory'],['MITRE ATT&CK (Credential Access techniques)','https://attack.mitre.org/tactics/TA0006/'],['Microsoft: Local Administrator Password Solution (LAPS)','https://learn.microsoft.com/en-us/windows-server/identity/laps/laps-overview']],
ex:{title:'Tiering and the forest boundary',
prompt:`Write <code>AdSecurity</code> with three methods. <code>static int tier(String asset)</code> returns <code>0</code> for <code>"domain-controller"</code>, <code>"adfs"</code> and <code>"sync-server"</code>, <code>1</code> for <code>"server"</code>, <code>2</code> for <code>"workstation"</code>, and <code>-1</code> otherwise including null. <code>static boolean logonAllowed(int credentialTier, int machineTier)</code> is true only when the machine's tier is <b>less than or equal to</b> the credential's tier number; that is, a Tier 0 credential may only be used on a Tier 0 machine, while a Tier 2 credential may be used anywhere. Reject any negative tier. <code>static boolean isolatedFrom(String forestA, String forestB)</code> returns true only when the two forests differ, because a domain is not a security boundary.`,
starter:`public class AdSecurity {
    static int tier(String asset) {
        return -1;
    }
    static boolean logonAllowed(int credentialTier, int machineTier) {
        return false;
    }
    static boolean isolatedFrom(String forestA, String forestB) {
        return false;
    }
}`,
tests:[{d:'domain controllers are Tier 0',re:'(?:case\\s*["\']domain-controller["\']|equals\\s*\\(\\s*["\']domain-controller["\']\\s*\\)|["\']domain-controller["\']\\s*\\.\\s*equals\\s*\\([^)]*\\)|[=!]==?\\s*["\']domain-controller["\'])[^;}]*?(?:return\\s+|->\\s*)0\\b'},{d:'the sync server is Tier 0 too',re:'(?:case\\s*["\']sync-server["\']|equals\\s*\\(\\s*["\']sync-server["\']\\s*\\)|["\']sync-server["\']\\s*\\.\\s*equals\\s*\\([^)]*\\)|[=!]==?\\s*["\']sync-server["\'])[^;}]*?(?:return\\s+|->\\s*)0\\b'},{d:'servers are Tier 1',re:'(?:case\\s*["\']server["\']|equals\\s*\\(\\s*["\']server["\']\\s*\\)|["\']server["\']\\s*\\.\\s*equals\\s*\\([^)]*\\)|[=!]==?\\s*["\']server["\'])[^;}]*?(?:return\\s+|->\\s*)1\\b'},{d:'workstations are Tier 2',re:'(?:case\\s*["\']workstation["\']|equals\\s*\\(\\s*["\']workstation["\']\\s*\\)|["\']workstation["\']\\s*\\.\\s*equals\\s*\\([^)]*\\)|[=!]==?\\s*["\']workstation["\'])[^;}]*?(?:return\\s+|->\\s*)2\\b'},{d:'unknown assets are rejected',re:'return\\s+-1'},{d:'negative tiers are refused',re:'(?:if\\s*\\(\\s*[^;{]*(?:<\\s*0)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:return\\s+(?!\\s*!)[^;{]*(?:<\\s*0))|(?:(?<h1>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:<\\s*0)[^{]*?return\\s+\\k<h1>\\b)'},{d:'credentials may not flow downward',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:machineTier\\s*<=\\s*credentialTier|credentialTier\\s*>=\\s*machineTier))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:machineTier\\s*<=\\s*credentialTier|credentialTier\\s*>=\\s*machineTier)[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:machineTier\\s*<=\\s*credentialTier|credentialTier\\s*>=\\s*machineTier)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:machineTier\\s*<=\\s*credentialTier|credentialTier\\s*>=\\s*machineTier)[^{]*?return\\s+\\k<av>\\b)'},{d:'isolation requires different forests',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:equals\\s*\\())|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:equals\\s*\\()[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:equals\\s*\\()[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:equals\\s*\\()[^{]*?return\\s+\\k<av>\\b)'},{d:'a guard returns its constant, not the negation of it',re:'return\\s+!\\s*\\(?\\s*(?:true|false)\\s*\\)?\\s*;',not:true}],
behavior:`tier("domain-controller") and tier("sync-server") are both 0: the directory-sync server holds credential material for the whole directory and can write to both sides, so treating it as an ordinary application server is a common and serious mistake. logonAllowed(2,2) is true and logonAllowed(0,0) is true, but logonAllowed(0,2) is false: a Domain Admin logging into a workstation leaves credential material on the lowest-tier machine in the estate, and that single habit creates most real attack paths. logonAllowed(2,0) is true, since a low-privilege credential on a high-tier machine grants nothing extra. isolatedFrom("corp","corp") is false however the domains differ, because the forest is the security boundary; isolatedFrom("corp","lab") is true.`,
hints:['A switch mapping each asset to its tier with a default of -1.','Guard both tiers as non-negative first, then compare with &lt;=.','<code>return forestA != null &amp;&amp; !forestA.equals(forestB);</code>'],
solution:`public class AdSecurity {
    static int tier(String asset) {
        if (asset == null) return -1;
        switch (asset) {
            case "domain-controller":
            case "adfs":
            case "sync-server":     // holds directory credentials: Tier 0
                return 0;
            case "server":
                return 1;
            case "workstation":
                return 2;
            default:
                return -1;
        }
    }
    static boolean logonAllowed(int credentialTier, int machineTier) {
        if (credentialTier < 0 || machineTier < 0) return false;
        // credentials never flow downward: a Tier 0 credential stays on Tier 0
        return machineTier <= credentialTier;
    }
    static boolean isolatedFrom(String forestA, String forestB) {
        // a separate DOMAIN is not isolation; only a separate forest is
        return forestA != null && !forestA.equals(forestB);
    }
}`}},

{id:'ei2',title:'Kerberos: tickets, not passwords',body:`
<p><b>Kerberos</b> is the ticket-based SSO at the heart of Active Directory. Instead of sending your password to each service, you prove yourself once to a central <b>KDC</b> (Key Distribution Center) and receive tickets.</p>
<!--flow:ei2-kerberos-->
<h4>Kerberos: TGT, service ticket, access: step by step</h4>
<div class="flowDia"><svg viewBox="0 0 740 372" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Kerberos: TGT, service ticket, access"><defs><marker id="ei2-kerberos-ah-front" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent)"/></marker><marker id="ei2-kerberos-ah-back" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent2)"/></marker><marker id="ei2-kerberos-ah-attack" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--bad)"/></marker><marker id="ei2-kerberos-ah-x" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--muted)"/></marker></defs><line x1="74" y1="54" x2="74" y2="360" class="fdLife"/><line x1="271.33333333333337" y1="54" x2="271.33333333333337" y2="360" class="fdLife"/><line x1="468.6666666666667" y1="54" x2="468.6666666666667" y2="360" class="fdLife"/><line x1="666" y1="54" x2="666" y2="360" class="fdLife"/><rect x="35" y="8" width="78" height="46" rx="8" class="fdActor"/><text x="74" y="27" class="fdActorT">Client</text><text x="74" y="42" class="fdActorS">your workstation</text><rect x="227.53333333333336" y="8" width="87.6" height="46" rx="8" class="fdActor"/><text x="271.33333333333337" y="27" class="fdActorT">KDC: AS</text><text x="271.33333333333337" y="42" class="fdActorS">Authentication Service</text><rect x="420.7666666666667" y="8" width="95.8" height="46" rx="8" class="fdActor"/><text x="468.6666666666667" y="27" class="fdActorT">KDC: TGS</text><text x="468.6666666666667" y="42" class="fdActorS">Ticket-Granting Service</text><rect x="626.3" y="8" width="79.39999999999999" height="46" rx="8" class="fdActor"/><text x="666" y="27" class="fdActorT">Service</text><text x="666" y="42" class="fdActorS">e.g. file server</text><line x1="77" y1="102" x2="266.33333333333337" y2="102" stroke="var(--accent2)" class="fdArrow" marker-end="url(#ei2-kerberos-ah-back)"/><text x="187.66666666666669" y="93" class="fdLabel">AS-REQ: “I am ron” (+ pre-auth timestamp)</text><circle cx="92" cy="102" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="92" y="105.5" class="fdNumT" style="fill:var(--accent2)">1</text><line x1="268.33333333333337" y1="132" x2="79" y2="132" stroke="var(--accent2)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#ei2-kerberos-ah-back)"/><text x="157.66666666666669" y="123" class="fdLabel">AS-REP: TGT + session key (enc. with ron’s key)</text><circle cx="253.33333333333337" cy="132" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="253.33333333333337" y="135.5" class="fdNumT" style="fill:var(--accent2)">2</text><rect x="14" y="149" width="395.59999999999997" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="219.79999999999998" y="164" class="fdSelfT">decrypting it IS the password check, offline at the KDC</text><circle cx="14" cy="160" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="14" y="163.5" class="fdNumT" style="fill:var(--muted)">3</text><line x1="77" y1="198" x2="463.6666666666667" y2="198" stroke="var(--accent2)" class="fdArrow" marker-end="url(#ei2-kerberos-ah-back)"/><text x="286.33333333333337" y="189" class="fdLabel">TGS-REQ: TGT + “I want the file server”</text><circle cx="92" cy="198" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="92" y="201.5" class="fdNumT" style="fill:var(--accent2)">4</text><line x1="465.6666666666667" y1="228" x2="79" y2="228" stroke="var(--accent2)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#ei2-kerberos-ah-back)"/><text x="256.33333333333337" y="219" class="fdLabel">TGS-REP: service ticket (enc. with the SERVICE’s key)</text><circle cx="450.6666666666667" cy="228" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="450.6666666666667" y="231.5" class="fdNumT" style="fill:var(--accent2)">5</text><line x1="77" y1="258" x2="661" y2="258" stroke="var(--accent2)" class="fdArrow" marker-end="url(#ei2-kerberos-ah-back)"/><text x="385" y="249" class="fdLabel">AP-REQ: service ticket + fresh authenticator</text><circle cx="92" cy="258" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="92" y="261.5" class="fdNumT" style="fill:var(--accent2)">6</text><rect x="376.59999999999997" y="275" width="349.4" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="559.3" y="290" class="fdSelfT">decrypts with its own key, the KDC is not called</text><circle cx="376.59999999999997" cy="286" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="376.59999999999997" y="289.5" class="fdNumT" style="fill:var(--muted)">7</text><line x1="663" y1="324" x2="79" y2="324" stroke="var(--accent2)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#ei2-kerberos-ah-back)"/><text x="355" y="315" class="fdLabel">AP-REP (mutual auth), access granted</text><circle cx="648" cy="324" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="648" y="327.5" class="fdNumT" style="fill:var(--accent2)">8</text><text x="370" y="342" class="fdNote">The password never crosses the network; tickets and keys do the proving.</text></svg></div>
<ol class="fdSteps">
<li><b>Client → KDC: AS:</b> AS-REQ: “I am ron” (+ pre-auth timestamp) <i>(back channel)</i></li>
<li><b>KDC: AS → Client:</b> AS-REP: TGT + session key (enc. with ron’s key) <i>(back channel)</i></li>
<li><b>Client:</b> decrypting it IS the password check, offline at the KDC</li>
<li><b>Client → KDC: TGS:</b> TGS-REQ: TGT + “I want the file server” <i>(back channel)</i></li>
<li><b>KDC: TGS → Client:</b> TGS-REP: service ticket (enc. with the SERVICE’s key) <i>(back channel)</i></li>
<li><b>Client → Service:</b> AP-REQ: service ticket + fresh authenticator <i>(back channel)</i></li>
<li><b>Service:</b> decrypts with its own key, the KDC is not called</li>
<li><b>Service → Client:</b> AP-REP (mutual auth), access granted <i>(back channel)</i></li>
</ol>
<!--/flow:ei2-kerberos-->
<p>The flow: the <b>Authentication Service</b> (AS) verifies you and issues a <b>Ticket-Granting Ticket</b> (TGT). To reach a specific service, you present the TGT to the <b>Ticket-Granting Service</b> (TGS), which issues a <b>service ticket</b> for just that service. Passwords never travel to the services, and everything is time-limited to resist replay.</p>

<h4>Why tickets, rather than sending the password</h4>
<p>Kerberos was designed on the assumption that <b>the network is hostile and eavesdropping is free</b>.
So the password never travels: it is used locally as a key to decrypt something only the real user
could decrypt. Every later design in this course inherits that idea; Kerberos got there in the 1980s.</p>
<div class="codeSample" data-hl>ONCE per session
  you  -> KDC   "I am ada"  + timestamp encrypted with ada's key (pre-auth)
  KDC  -> you   TGT, encrypted with the KRBTGT key (you cannot read it)
              + a session key, encrypted with YOUR key (you can)

PER SERVICE
  you  -> KDC   TGT + "I want cifs/fs01"
  KDC  -> you   a service ticket encrypted with FS01's OWN key

TO THE SERVICE
  you  -> fs01  the service ticket
  fs01 decrypts it with its own key. no call to the KDC. no password anywhere.</div>

<h4>The three properties that follow</h4>
<p><b>Single sign-on</b>: one password entry yields a TGT, and every service ticket after that is
silent. <b>Mutual authentication</b>: the service can prove itself back, so you know the file server is
the real one. And <b>offline validation</b>: a service verifies a ticket with its own key, contacting
nobody, which is why Kerberos scales inside a network.</p>

<h4>Time is part of the protocol</h4>
<p>Pre-authentication encrypts a <b>timestamp</b>, and tickets carry validity windows, so Kerberos fails
when clocks drift (five minutes by default). This produces authentication errors that look random and
are trivially explained once you think to check, and it is why domain members sync time from the domain
controller.</p>
<p>It is also <b>name-sensitive</b>: the client asks for a ticket by service principal name, so reaching
a server by an alias or a raw IP finds no SPN and silently falls back to NTLM. That is usually the real
answer to "why isn't Kerberos working?"</p>`,
docs:[['Kerberos (MIT)','https://web.mit.edu/kerberos/'],['Kerberos explained','https://learn.microsoft.com/en-us/windows-server/security/kerberos/kerberos-authentication-overview']],
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
tests:[{d:'AS issues a TGT',re:'(?:["\']as["\'][^;}]*?return\\s+["\']TGT["\'])|(?:case\\s*["\']as["\']\\s*->\\s*(?:\\{\\s*)?["\']TGT["\'])|(?:["\']as["\']\\s*:\\s*["\']TGT["\'])|(?:(?:put|entry|of)\\s*\\(\\s*["\']as["\']\\s*,\\s*["\']TGT["\'])',flags:'s'},{d:'TGS issues a service ticket',re:'"tgs".*?"service ticket"',flags:'s'},{d:'unknown default',re:'"unknown"'}],
behavior:`issues("as") is "TGT", issues("tgs") is "service ticket", issues("x") is "unknown". The TGT proves who you are; the service ticket authorizes one specific service.`,
hints:['A switch on phase with two cases and a default is enough.','The AS hands out the ticket-granting ticket; the TGS hands out per-service tickets.','Anything else returns unknown.']}},

{id:'ei2b',title:'Kerberos in depth: tickets, delegation and forgery',body:`
<p>Kerberos is the best-designed authentication protocol in wide deployment and the one most often
abused, and both come from the same property: <b>tickets are encrypted with the target's password
key</b>. Everything interesting about Kerberos security follows from asking, for any ticket, <i>whose
key encrypted this?</i></p>

<h4>The three exchanges</h4>
<div class="codeSample" data-hl>AS   (once per session)  client -> KDC   "I am ada"
                          + PRE-AUTH: a timestamp encrypted with ada's key
                        KDC -> client  a TGT, encrypted with the KRBTGT key
                                       (the client cannot read it, only the KDC can)

TGS  (once per service)  client -> KDC   TGT + "I want cifs/fs01"
                        KDC -> client  a SERVICE TICKET, encrypted with the
                                       SERVICE ACCOUNT's key

AP   (to the service)    client -> service   the service ticket
                        service decrypts it with its OWN key. no KDC contact.

// note the last line: a service validates a ticket entirely offline.</div>
<p>Two structural details carry most of the weight. <b>Pre-authentication</b> proves you know the
password before the KDC issues anything; accounts with it disabled can be attacked offline
(AS-REP roasting). And the ticket carries a <b>PAC</b> containing the user's group SIDs, which is how a
service learns your group memberships without querying the directory. The PAC is why forging a ticket
grants group membership, not merely identity.</p>

<h4>SPNs, and the flaw that follows</h4>
<p>A <b>service principal name</b> identifies a service instance (<code>cifs/fs01.corp.example</code>)
and maps it to the account running it. The client asks for a ticket by SPN; the KDC encrypts that
ticket with the SPN account's key.</p>
<p>Now the consequence. <b>Any authenticated user may request a service ticket for any SPN.</b> That is
not a bug; it is how the protocol distributes tickets. But the returned ticket is encrypted with the
service account's password-derived key, so an attacker can request tickets for every SPN in the domain
and crack them <i>offline</i>, at their leisure, with no failed logins and no lockouts. This is
<b>Kerberoasting</b>, and it is why service accounts with human-chosen passwords are the softest target
in most AD estates. The defense is not detection but key strength: <b>gMSA</b> accounts with
128-character machine-generated passwords, and AES rather than RC4.</p>

<h4>Ticket forgery: golden and silver</h4>
<div class="codeSample" data-hl>GOLDEN TICKET   requires: the KRBTGT account's key
                gives:    forge ANY TGT, for anyone, with any group SIDs
                          in the PAC, including Domain Admin
                lifetime: valid until krbtgt is rotated TWICE, Active
                          Directory retains the PREVIOUS krbtgt key for
                          continuity, so one rotation leaves forged tickets
                          working. (This is AD behavior, not something
                          RFC 4120 specifies.)

SILVER TICKET   requires: one SERVICE account's key
                gives:    forge service tickets for that one service
                scope:    narrower, and stealthier, the KDC is never
                          contacted, so there is no ticket request to log</div>
<p>The golden ticket is why <b>krbtgt compromise means the domain must be rebuilt or the key rotated
twice</b>, and why "we reset the Domain Admin passwords" is not recovery. The silver ticket is why
service account keys matter even for unimportant-looking services.</p>

<h4>Delegation, and why it is the sharpest edge</h4>
<p>Delegation lets a service act as the user against a further service, the classic web-server-to-
database problem. Three generations, in increasing safety:</p>
<ul>
<li><b>Unconstrained.</b> The user's <i>entire TGT</i> is sent to the service and cached in its memory.
Any admin on that machine can extract it and become that user anywhere. Worse, an attacker who can
coerce a domain controller to authenticate to such a host obtains the DC's TGT. Treat any host with
unconstrained delegation as Tier 0, and prefer to have none.</li>
<li><b>Constrained (S4U2Proxy).</b> The service may request tickets to a specified list of SPNs only.
Paired with <b>S4U2Self</b>, which lets a service obtain a ticket to itself on a user's behalf. This
is "protocol transition", and it means the service can impersonate a user who never authenticated to
it with Kerberos at all.</li>
<li><b>Resource-based constrained delegation (RBCD).</b> The <i>resource</i> decides who may delegate
to it. Safer in principle, because control sits with the thing being protected, but the attribute
lives on the target's computer object, so <b>anyone who can write to that object can grant themselves
delegation to it</b>. This has become one of the most reliable privilege-escalation paths in modern
AD, and it is a permissions problem rather than a protocol flaw.</li>
</ul>

<h4>Operational realities</h4>
<p>Kerberos is <b>time-sensitive</b>: pre-authentication uses an encrypted timestamp, and the default
tolerance is five minutes. Clock drift produces authentication failures that look random and are
trivially diagnosed once you think to check. It is also <b>name-sensitive</b>: clients must reach
services by the name in the SPN, so a load balancer alias or a raw IP address silently falls back to
NTLM, which is usually the real reason "Kerberos isn't working".</p>

<h4>The defensive checklist</h4>
<ol>
<li>gMSA for service accounts; never human-chosen service passwords.</li>
<li>AES only; disable RC4, which makes offline cracking dramatically cheaper.</li>
<li>Require pre-authentication everywhere.</li>
<li>Eliminate unconstrained delegation; audit write access to computer objects for RBCD.</li>
<li>Put sensitive accounts in Protected Users and mark them as not delegatable.</li>
<li>Rotate krbtgt periodically: in Active Directory, <b>twice</b> with a gap between, because the
previous key is retained for continuity and a single rotation leaves forged tickets valid.</li>
<li>Alert on bulk service-ticket requests, RC4 requests in an AES-only estate, and tickets with
implausible lifetimes.</li>
</ol>`,
docs:[['RFC 4120: The Kerberos Network Authentication Service (V5)','https://www.rfc-editor.org/rfc/rfc4120'],['Microsoft (Kerberos constrained delegation overview)','https://learn.microsoft.com/en-us/windows-server/security/kerberos/kerberos-constrained-delegation-overview'],['Microsoft (Group Managed Service Accounts)','https://learn.microsoft.com/en-us/windows-server/security/group-managed-service-accounts/group-managed-service-accounts-overview'],['MITRE ATT&CK (Steal or Forge Kerberos Tickets)','https://attack.mitre.org/techniques/T1558/']],
ex:{title:'Whose key encrypted this ticket?',
prompt:`Write <code>Kerberos</code> with three methods. <code>static String encryptedWith(String ticketType)</code> returns <code>"krbtgt-key"</code> for <code>"tgt"</code>, <code>"service-account-key"</code> for <code>"service-ticket"</code>, and <code>"unknown"</code> otherwise including null. <code>static String forgeryImpact(String stolenKey)</code> returns <code>"domain-wide"</code> for <code>"krbtgt-key"</code> (a golden ticket, any user, any groups), <code>"single-service"</code> for <code>"service-account-key"</code> (a silver ticket), and <code>"none"</code> otherwise. <code>static boolean rotationSufficient(String stolenKey, int rotations)</code> requires <b>two</b> rotations when the krbtgt key was stolen, because the KDC keeps the previous key; one rotation is enough for anything else.`,
starter:`public class Kerberos {
    static String encryptedWith(String ticketType) {
        return null;
    }
    static String forgeryImpact(String stolenKey) {
        return null;
    }
    static boolean rotationSufficient(String stolenKey, int rotations) {
        return false;
    }
}`,
tests:[{d:'a TGT is encrypted with the krbtgt key',re:'(?:case\\s*["\']tgt["\'][^;}]*?return\\s+["\']krbtgt-key["\'])'},{d:'a service ticket uses the service account key',re:'"service-account-key"'},{d:'unknown ticket types fall through',re:'"unknown"'},{d:'krbtgt compromise is domain-wide',re:'"domain-wide"'},{d:'a service key forges one service only',re:'"single-service"'},{d:'no key means no forgery',re:'"none"'},{d:'krbtgt needs two rotations',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:rotations\\s*>=\\s*2))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:rotations\\s*>=\\s*2)[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:rotations\\s*>=\\s*2)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:rotations\\s*>=\\s*2)[^{]*?return\\s+\\k<av>\\b)'},{d:'one rotation suffices otherwise',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:rotations\\s*>=\\s*1))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:rotations\\s*>=\\s*1)[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:rotations\\s*>=\\s*1)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:rotations\\s*>=\\s*1)[^{]*?return\\s+\\k<av>\\b)'}],
behavior:`encryptedWith("tgt") is krbtgt-key and encryptedWith("service-ticket") is service-account-key, and that second answer is the whole of Kerberoasting, since any authenticated user may request a service ticket and then crack it offline with no failed logins to detect. forgeryImpact("krbtgt-key") is domain-wide: a golden ticket forges any TGT for any user with any group SIDs in the PAC. forgeryImpact("service-account-key") is single-service, narrower but stealthier because the KDC is never contacted and there is no ticket request to log. rotationSufficient("krbtgt-key", 1) is false and rotationSufficient("krbtgt-key", 2) is true, because the KDC accepts the previous krbtgt key, so a single rotation leaves forged tickets working.`,
hints:['Two small switches, each with a clear default.','Special-case the krbtgt key in rotationSufficient before the general rule.','The gotcha is the number 2: one rotation leaves the previous key valid.'],
solution:`public class Kerberos {
    static String encryptedWith(String ticketType) {
        if (ticketType == null) return "unknown";
        switch (ticketType) {
            case "tgt":
                return "krbtgt-key";          // only the KDC can read it
            case "service-ticket":
                return "service-account-key"; // hence Kerberoasting
            default:
                return "unknown";
        }
    }
    static String forgeryImpact(String stolenKey) {
        if ("krbtgt-key".equals(stolenKey)) return "domain-wide";      // golden ticket
        if ("service-account-key".equals(stolenKey)) return "single-service"; // silver
        return "none";
    }
    static boolean rotationSufficient(String stolenKey, int rotations) {
        // the KDC keeps the PREVIOUS krbtgt key, so one rotation changes nothing
        if ("krbtgt-key".equals(stolenKey)) return rotations >= 2;
        return rotations >= 1;
    }
}`}},

{id:'ei3',title:'SCIM & the joiner/mover/leaver lifecycle',body:`
<p>People join, change roles, and leave, and their accounts must follow. <b>SCIM</b> (System for Cross-domain Identity Management) is the standard API for <b>provisioning</b>: an HR or identity system pushes create/update/deactivate operations to every connected app so accounts stay in sync automatically.</p>
<!--flow:ei3-scim-->
<h4>SCIM: joiner, mover, leaver: step by step</h4>
<div class="flowDia"><svg viewBox="0 0 640 312" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="SCIM: joiner, mover, leaver"><defs><marker id="ei3-scim-ah-front" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent)"/></marker><marker id="ei3-scim-ah-back" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent2)"/></marker><marker id="ei3-scim-ah-attack" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--bad)"/></marker><marker id="ei3-scim-ah-x" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--muted)"/></marker></defs><line x1="74" y1="54" x2="74" y2="300" class="fdLife"/><line x1="566" y1="54" x2="566" y2="300" class="fdLife"/><rect x="30.200000000000003" y="8" width="87.6" height="46" rx="8" class="fdActor"/><text x="74" y="27" class="fdActorT">IdP / HR</text><text x="74" y="42" class="fdActorS">SCIM client, source of truth</text><rect x="527" y="8" width="78" height="46" rx="8" class="fdActor"/><text x="566" y="27" class="fdActorT">App</text><text x="566" y="42" class="fdActorS">SCIM server</text><line x1="14" y1="98" x2="626" y2="98" class="fdPhase"/><text x="320" y="102" class="fdPhaseT">joiner, day one</text><line x1="77" y1="132" x2="561" y2="132" stroke="var(--accent2)" class="fdArrow" marker-end="url(#ei3-scim-ah-back)"/><text x="335" y="123" class="fdLabel">POST /Users, account exists before 9am</text><circle cx="92" cy="132" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="92" y="135.5" class="fdNumT" style="fill:var(--accent2)">1</text><line x1="14" y1="158" x2="626" y2="158" class="fdPhase"/><text x="320" y="162" class="fdPhaseT">mover, new department</text><line x1="77" y1="192" x2="561" y2="192" stroke="var(--accent2)" class="fdArrow" marker-end="url(#ei3-scim-ah-back)"/><text x="335" y="183" class="fdLabel">PATCH /Users/{id}, groups follow the role</text><circle cx="92" cy="192" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="92" y="195.5" class="fdNumT" style="fill:var(--accent2)">2</text><line x1="14" y1="218" x2="626" y2="218" class="fdPhase"/><text x="320" y="222" class="fdPhaseT">leaver, same day, not “eventually”</text><line x1="77" y1="252" x2="561" y2="252" stroke="var(--accent2)" class="fdArrow" marker-end="url(#ei3-scim-ah-back)"/><text x="335" y="243" class="fdLabel">PATCH active:false (or DELETE)</text><circle cx="92" cy="252" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="92" y="255.5" class="fdNumT" style="fill:var(--accent2)">3</text><rect x="309.6" y="269" width="316.4" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="475.8" y="284" class="fdSelfT">access gone everywhere the connector reaches</text><circle cx="309.6" cy="280" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="309.6" y="283.5" class="fdNumT" style="fill:var(--muted)">4</text></svg></div>
<ol class="fdSteps">
<li><b>IdP / HR → App:</b> POST /Users, account exists before 9am <i>(back channel)</i></li>
<li><b>IdP / HR → App:</b> PATCH /Users/{id}, groups follow the role <i>(back channel)</i></li>
<li><b>IdP / HR → App:</b> PATCH active:false (or DELETE) <i>(back channel)</i></li>
<li><b>App:</b> access gone everywhere the connector reaches</li>
</ol>
<!--/flow:ei3-scim-->
<p>The lifecycle is often called <b>JML</b>: <b>Joiner</b> (create the account and grant baseline access), <b>Mover</b> (update access when the role changes), <b>Leaver</b> (deactivate/delete on exit). Automating leaver deprovisioning is the single biggest win: orphaned accounts after someone departs are a top breach cause.</p>

<h4>What SCIM actually standardizes</h4>
<p>Before SCIM every SaaS vendor had a bespoke user API, so connecting fifty applications meant fifty
integrations. SCIM fixes the <i>shape</i>: a standard schema for User and Group, over ordinary REST.</p>
<div class="codeSample" data-hl>POST   /scim/v2/Users        create        (Joiner)
PATCH  /scim/v2/Users/{id}   update        (Mover - department, manager, groups)
PATCH  /scim/v2/Users/{id}   active:false  (Leaver - DEACTIVATE, not delete)
GET    /scim/v2/Users?filter=userName eq "ada@corp.example"
PATCH  /scim/v2/Groups/{id}  add/remove members

{ "schemas":["urn:ietf:params:scim:schemas:core:2.0:User"],
  "userName":"ada@corp.example",
  "externalId":"u-4817",        <- YOUR stable id. this is the join key.
  "active":true }</div>

<h4>The three things that go wrong</h4>
<p><b>Deactivate, do not delete.</b> Setting <code>active:false</code> ends access while preserving the
record, its audit history and anything owned by it. A hard delete orphans documents and destroys the
trail, and if the person returns, a new account cannot inherit what the old one owned.</p>
<p><b>Key on <code>externalId</code>.</b> Matching on email or username breaks the day someone marries,
changes department, or an address is reassigned. This is the same "key on <code>sub</code>" rule from
the claims lesson, one layer down.</p>
<p><b>Movers are the hard case.</b> Joiners and leavers are events with a clear trigger. A mover keeps
working throughout, and the failure is silent: they gain the new team's access and keep the old team's.
Repeat over a career and you get the privilege accumulation that access reviews exist to catch.</p>

<h4>Why it is worth the effort</h4>
<p>Federation ends access at the IdP but leaves the account behind in every app. SCIM is what makes
deprovisioning real rather than theoretical, and time-to-deprovision is the metric audits actually
fail on.</p>

<h4>What the calls look like</h4>
<div class="codeSample">POST /scim/v2/Users            // joiner: create, with externalId as the stable key
PATCH /scim/v2/Users/{id}      // mover: change what changed, not the whole record
PATCH /scim/v2/Users/{id}      // leaver: {"op":"replace","path":"active","value":false}
GET  /scim/v2/Users?filter=userName eq "ada@example.com"   // find before you create</div>
<p>The shape is deliberately boring, and that is the point: one integration pattern instead of fifty
bespoke user APIs.</p>

<h4>Where SCIM gets rough in practice</h4>
<ul>
<li><b>PATCH is the interoperability problem.</b> The specification's PATCH syntax is intricate and vendors
implement subsets of it inconsistently, so the same payload succeeds against one application and fails
against another. Teams routinely discover this per integration rather than once.</li>
<li><b>Ordering matters.</b> A user must exist before they can be added to a group, and a group before it
can be referenced. Provisioning engines that fire events in parallel produce failures that disappear on
retry, which is the worst kind of bug to diagnose.</li>
<li><b>Push needs a pull as a safety net.</b> SCIM is event-driven, and events are lost: a webhook fails, a
service is down, a change is made directly in the target application. A periodic <b>reconciliation</b> that
compares source and target and reports drift is what turns "we send events" into "we know the state is
right".</li>
</ul>

<h4>The gap that surprises people</h4>
<p>Setting <code>active:false</code> ends the ability to sign in. It does not end sessions that are already
live, and it does not invalidate an access token already issued; those remain valid until they expire.
Deprovisioning is therefore two actions, not one: deactivate the account <i>and</i> revoke the live
sessions and tokens, which is exactly what the continuous-access-evaluation mechanism in the threats stream
exists to make fast.</p>
<p>The number auditors ask for is <b>time to deprovision</b>: from the leaver event in the authoritative
source to access actually being gone everywhere. Measured properly, including the applications nobody
connected, it is usually far worse than teams expect.</p>`,
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
tests:[{d:'joiner creates the account',re:'(?:["\']joiner["\'][^;}]*?return\\s+["\']create["\'])|(?:case\\s*["\']joiner["\']\\s*->\\s*(?:\\{\\s*)?["\']create["\'])|(?:["\']joiner["\']\\s*:\\s*["\']create["\'])|(?:(?:put|entry|of)\\s*\\(\\s*["\']joiner["\']\\s*,\\s*["\']create["\'])',flags:'s'},{d:'mover updates access',re:'"mover".*?"update"',flags:'s'},{d:'leaver deletes/deactivates',re:'"leaver".*?"delete"',flags:'s'},{d:'unknown default',re:'"unknown"'}],
behavior:`op("joiner") is "create", op("mover") is "update", op("leaver") is "delete". Automating the leaver case closes the orphaned-account risk.`,
hints:['One switch, three cases plus a default.','Joiner creates, mover updates, leaver deletes.','SCIM carries exactly these operations between systems.']}},

{id:'ei4',title:'JIT provisioning & home-realm discovery',body:`
<p>Two conveniences smooth federated login. <b>Just-in-time (JIT) provisioning</b> creates the local account automatically the first time a federated user logs in: no pre-import needed; the identity provider&#8217;s assertion supplies the profile.</p>
<!--flow:ei4-jit-hrd-->
<h4>Home-realm discovery + JIT provisioning: step by step</h4>
<div class="flowDia"><svg viewBox="0 0 680 288" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Home-realm discovery + JIT provisioning"><defs><marker id="ei4-jit-hrd-ah-front" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent)"/></marker><marker id="ei4-jit-hrd-ah-back" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent2)"/></marker><marker id="ei4-jit-hrd-ah-attack" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--bad)"/></marker><marker id="ei4-jit-hrd-ah-x" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--muted)"/></marker></defs><line x1="74" y1="54" x2="74" y2="276" class="fdLife"/><line x1="340" y1="54" x2="340" y2="276" class="fdLife"/><line x1="606" y1="54" x2="606" y2="276" class="fdLife"/><rect x="34.300000000000004" y="8" width="79.39999999999999" height="46" rx="8" class="fdActor"/><text x="74" y="35.5" class="fdActorT">Browser</text><rect x="301" y="8" width="78" height="46" rx="8" class="fdActor"/><text x="340" y="27" class="fdActorT">SP</text><text x="340" y="42" class="fdActorS">the app</text><rect x="562.2" y="8" width="87.6" height="46" rx="8" class="fdActor"/><text x="606" y="27" class="fdActorT">Home IdP</text><text x="606" y="42" class="fdActorS">acme.com’s</text><line x1="77" y1="102" x2="335" y2="102" stroke="var(--accent)" class="fdArrow" marker-end="url(#ei4-jit-hrd-ah-front)"/><text x="222" y="93" class="fdLabel">login as ron@acme.com</text><circle cx="92" cy="102" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="92" y="105.5" class="fdNumT" style="fill:var(--accent)">1</text><rect x="218.10000000000002" y="119" width="243.79999999999998" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="348" y="134" class="fdSelfT">HRD: domain acme.com → Acme’s IdP</text><circle cx="218.10000000000002" cy="130" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="218.10000000000002" y="133.5" class="fdNumT" style="fill:var(--muted)">2</text><line x1="343" y1="168" x2="601" y2="168" stroke="var(--accent)" class="fdArrow" marker-end="url(#ei4-jit-hrd-ah-front)"/><text x="488" y="159" class="fdLabel">redirect: federated authentication</text><circle cx="358" cy="168" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="358" y="171.5" class="fdNumT" style="fill:var(--accent)">3</text><line x1="603" y1="198" x2="345" y2="198" stroke="var(--accent)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#ei4-jit-hrd-ah-front)"/><text x="458" y="189" class="fdLabel">assertion with name, email, groups</text><circle cx="588" cy="198" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="588" y="201.5" class="fdNumT" style="fill:var(--accent)">4</text><rect x="142.20000000000002" y="215" width="395.59999999999997" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="348" y="230" class="fdSelfT">no local account? create it NOW from the assertion (JIT)</text><circle cx="142.20000000000002" cy="226" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="142.20000000000002" y="229.5" class="fdNumT" style="fill:var(--muted)">5</text><line x1="337" y1="264" x2="79" y2="264" stroke="var(--accent)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#ei4-jit-hrd-ah-front)"/><text x="192" y="255" class="fdLabel">signed in, no pre-provisioning ever ran</text><circle cx="322" cy="264" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="322" y="267.5" class="fdNumT" style="fill:var(--accent)">6</text></svg></div>
<ol class="fdSteps">
<li><b>Browser → SP:</b> login as ron@acme.com <i>(front channel)</i></li>
<li><b>SP:</b> HRD: domain acme.com → Acme’s IdP</li>
<li><b>SP → Home IdP:</b> redirect: federated authentication <i>(front channel)</i></li>
<li><b>Home IdP → SP:</b> assertion with name, email, groups <i>(front channel)</i></li>
<li><b>SP:</b> no local account? create it NOW from the assertion (JIT)</li>
<li><b>SP → Browser:</b> signed in, no pre-provisioning ever ran <i>(front channel)</i></li>
</ol>
<!--/flow:ei4-jit-hrd-->
<p><b>Home-realm discovery</b> answers "which identity provider should authenticate this person?" A multi-tenant app often decides from the <b>email domain</b>: a user typing <code>ada@example.com</code> is routed to example.com&#8217;s IdP. Extracting that domain is the first step of the routing.</p>

<h4>JIT provisioning: the account is created by the login</h4>
<p>Instead of pushing accounts ahead of time with SCIM, the app creates the account <i>the first time the
person successfully authenticates</i>, from the claims in the assertion. No pre-provisioning, no sync
job: the first login is the provisioning event.</p>
<div class="codeSample" data-hl>SCIM (push)              JIT (pull, on first login)
+ account exists early   + zero setup, works for any federated user
+ DEPROVISIONS           - creates accounts only; NOTHING removes them
+ full attribute sync    - attributes only as fresh as the last login
- an integration per app - roles come from claims you must trust

// the common shape: JIT to create, SCIM to deprovision.
// JIT alone means leavers keep app-side accounts forever.</div>
<p>That last line is the trap. JIT feels complete because logins work, and it has <b>no leaver story at
all</b>: the IdP account is disabled, so they cannot log in, but the app-side account, its data and its
entitlements remain indefinitely.</p>
<p>Two more cautions. Grant <b>least privilege on creation</b>: a JIT rule that maps a claim to an admin
role means whoever controls that claim controls your admin access. And key the new account on the stable
<code>sub</code>, or a returning user with a changed email silently becomes a second account.</p>

<h4>Home-realm discovery: which IdP is this person's?</h4>
<p>A multi-tenant app federating with hundreds of customer IdPs must route each login to the right one,
before knowing who the user is. Four common approaches:</p>
<div class="codeSample" data-hl>email domain     ada@acme.com -> Acme's IdP.  most common. leaks nothing
                 much, but tells an attacker which domains are customers
tenant in URL    acme.app.example / app.example?tenant=acme.  unambiguous
IdP picker       a list of logos. simple, and unusable past ~10 tenants
remembered       a cookie from last time - a shortcut, never the only path</div>
<p>The subtle failure is the <b>shared domain</b>: contractors on gmail.com, or two customers who both
use a generic domain. Domain-based routing then sends people to the wrong realm, and the fallback has to
be an explicit choice rather than a guess.</p>`,
docs:[['JIT provisioning','https://help.okta.com/en-us/content/topics/users-groups-profiles/usgp-add-users-jit.htm'],['Home realm discovery','https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/home-realm-discovery-policy']],
ex:{title:'Extract the email domain (the realm)',
prompt:`Write class <code>Broker</code> with <code>static String realm(String email)</code> that returns the part after the <code>@</code>, the domain used to pick the identity provider. Use <code>substring</code> and <code>indexOf("@")</code>.`,
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
hints:['indexOf("@") gives the position of the @ character.','substring from that index + 1 skips the @ and returns the domain.','No loop is needed; the two calls compose into one expression.']}},

{id:'ei4b',title:'JIT provisioning: methods, security & when to use',body:`
<p>When a federated user shows up, where does their local account come from? There are three provisioning models, and choosing well is a real design decision.</p>
<ul>
<li><b>Pre-provisioning (SCIM / directory sync)</b>: accounts are created <i>ahead of time</i> from an authoritative source (HR system, corporate directory). Deterministic, supports rich attributes, and (the part that matters) supports <b>deprovisioning</b> when someone leaves.</li>
<li><b>Just-in-time (JIT) provisioning</b>: the account is created <i>on first successful login</i>, from the claims in the IdP's token or assertion. No pre-import, so it scales to large or unpredictable populations (customers, partners).</li>
<li><b>Manual</b>: an admin creates each account. Fine at small scale or where every account needs explicit approval.</li>
</ul>
<p><b>Security considerations for JIT.</b> JIT means you create an account, and often assign roles and group memberships, <b>based on claims you did not originate</b>. That is the risk: if you over-trust the IdP's attributes, a wrong or manipulated <code>groups</code> claim could hand out admin. Defenses: verify the IdP is <b>authoritative</b> for that email domain (home-realm), map claims to roles explicitly and <b>default to least privilege</b>, and key the account on the IdP's <b>stable subject id, not the email</b> (emails get reused and reassigned, which enables account takeover).</p>
<p><b>Implications to plan for.</b> JIT <b>creates but does not remove</b>: pair it with SCIM or periodic access reviews or you accumulate orphaned accounts after people leave. Attributes are only as fresh as the <b>last login</b>, so roles can go stale. And the first login pays a small provisioning cost.</p>
<p><b>When to use each.</b> Workforce with an HR source of truth: <b>SCIM pre-provisioning</b> (optionally JIT as a fallback) so you also get clean deprovisioning. Large external / partner / consumer (CIAM) populations: <b>JIT</b>, because pre-importing millions of users is impractical. Small or highly regulated systems needing explicit sign-off: <b>manual</b>.</p>

<h4>The deprovisioning gap</h4>
<p>JIT's defining weakness deserves its own heading, because it is the one that appears in audit findings. JIT creates accounts and <b>nothing removes them</b>. When an employee leaves, the IdP stops authenticating them, so they cannot log in, which sounds sufficient and is not. The local account still exists, still holds its roles, still owns data, and is still reachable by any path that does not go through the IdP: a local password set during an earlier migration, an API token issued to that account, a service integration, or the break-glass login. It also still appears in your access reviews as an active user, so reviewers certify access for people who left months ago.</p>
<p>The practical shape is therefore <b>JIT for creation, SCIM for the lifecycle</b>: provision on first login for speed, but subscribe to leaver events so deactivation is driven by the authoritative source. Where SCIM is not available, the fallback is a scheduled reconciliation against the directory plus an inactivity policy that disables accounts unseen for a defined period. Both are worse than an event; both are far better than nothing.</p>

<h4>Attribute drift</h4>
<p>The second JIT problem is subtler: attributes are copied at first login and then frozen. Someone changes department, loses a group membership, or has their name corrected, and your local copy still says what it said the first time. Any authorization decision made from those stale attributes is wrong in the direction that matters: permissions retained after the reason for them ended.</p>
<p>The fix is to <b>re-apply claims on every login</b>, not only at creation, and to treat the IdP's assertion as the source of truth for anything it is authoritative for. That has a consequence worth designing deliberately: local edits to synchronized attributes will be overwritten, so decide which fields are IdP-owned and which are yours, and make the distinction visible in the admin UI rather than discovering it through a support ticket.</p>

<h4>The three questions that decide the model</h4>
<p><b>Who is authoritative for the population?</b> If HR or a corporate directory is, pre-provision from it. <b>Do you need the account to exist before first login?</b> Sharing a document with a colleague who has never signed in requires the account to exist, which JIT cannot provide. <b>How predictable is the population?</b> Partners and customers arrive unpredictably and in numbers that make pre-import impractical, which is exactly where JIT earns its place.</p>`,
docs:[['JIT provisioning (Okta)','https://help.okta.com/en-us/content/topics/users-groups-profiles/usgp-add-users-jit.htm'],['SCIM (RFC 7644)','https://www.rfc-editor.org/rfc/rfc7644'],['Account takeover via email reuse','https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html']],
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
tests:[{d:'workforce with an HR source uses SCIM pre-provisioning',re:'(?:["\']workforce-hr-source["\'][^;}]*?return\\s+["\']SCIM["\'])|(?:case\\s*["\']workforce-hr-source["\']\\s*->\\s*(?:\\{\\s*)?["\']SCIM["\'])|(?:["\']workforce-hr-source["\']\\s*:\\s*["\']SCIM["\'])|(?:(?:put|entry|of)\\s*\\(\\s*["\']workforce-hr-source["\']\\s*,\\s*["\']SCIM["\'])',flags:'s'},{d:'large external populations use JIT',re:'"large-external-users".*?"JIT"',flags:'s'},{d:'small/regulated uses manual',re:'"small-regulated".*?"manual"',flags:'s'},{d:'JIT does NOT deprovision',re:'jitHandlesDeprovisioning\\s*\\([^)]*\\)\\s*\\{(?:[^{}]|\\{[^{}]*\\})*?(?:\\{(?:[^{}]|\\{[^{}]*\\})*?)*?return\\s+false',flags:'s'},{d:'unknown default',re:'"unknown"'}],
behavior:`method("workforce-hr-source") is "SCIM", method("large-external-users") is "JIT", method("small-regulated") is "manual". jitHandlesDeprovisioning() is false, the classic JIT gap: it creates accounts on first login but never removes them, so pair it with SCIM or access reviews.`,
hints:['Match the scenario to the model: HR source to SCIM, large external users to JIT, small/regulated to manual.','JIT provisions on first login from the IdP claims; it does not deprovision, so return false.','Key JIT accounts on the stable subject id and default to least privilege.']}},
{id:'ei5',title:'Social login & account linking',body:`
<p><b>Social login</b> lets users sign in with Google, Apple, GitHub, and the like. It is convenient, and it offloads credential security to the provider. The catch is <b>account linking</b>: the same human might sign in with Google today and email/password tomorrow, and both must resolve to one account.</p>
<p>The reliable key is <b>provider + the provider&#8217;s stable subject id</b> (not the email, which can change or be reused). Store that composite so a returning user is recognized regardless of which button they click, and link additional methods to the existing account rather than creating duplicates.</p>

<h4>Why account linking is where the bugs are</h4>
<p>Social login itself is ordinary OIDC. The hard part is what happens when the same human arrives twice
by different routes (Google today, GitHub next month, a password account last year), and you must
decide whether they are one person.</p>
<div class="codeSample" data-hl>// THE classic vulnerability: linking on email alone
provider says: { sub: "google|123", email: "ada@corp.example" }
your app:      "I have a user with that email - same person, link them."

// an attacker signs up at a provider that does NOT verify email addresses,
// claims ada@corp.example, and is handed Ada's existing account.

// the rules that close it:
//   1. require email_verified == true, and only from providers you trust
//      to verify it - do NOT take the claim's word for it universally
//   2. NEVER auto-link. make the user prove the existing account first.
//   3. key the identity on provider + sub, not on email.</div>

<h4>The identity key, again</h4>
<p>The reliable key is <b>provider + that provider's stable subject id</b>. Emails get changed and
reassigned; usernames get released. A <code>sub</code> is scoped to the issuer, so
<code>google|123</code> and <code>github|123</code> are different people and always will be.</p>

<h4>The consequences people forget</h4>
<ul>
<li><b>Account recovery inherits the provider's security.</b> "Sign in with X" means your account is as
strong as the X account, and X's recovery flow is now yours.</li>
<li><b>Unlinking needs a rule.</b> Removing the last login method locks the user out permanently: require
at least one remaining, or force a password to be set first.</li>
<li><b>Providers disappear or change ids.</b> Keep your own internal user id as the primary key and treat
every provider identity as an attached credential, not as the user.</li>
</ul>

<h4>The cookbook: the arrival decision, every branch</h4>
<div class="codeSample" data-hl>token arrives: { iss:"google", sub:"123",
                 email:"ada@corp.example", email_verified:true }

1. look up (iss, sub) in the identities table
   found      -&gt; log the linked account in. done. (email is ignored)
   not found  -&gt; continue

2. does an account already exist with that email?
   no   -&gt; create the account, store (iss, sub) against it. done.
   yes  -&gt; do NOT auto-link. authenticate the existing account first:
             already logged in this session  -&gt; confirm, then link
             otherwise                       -&gt; password or magic link to
                                                the ACCOUNT's address first
3. only after that proof: store (iss, sub) against the account</div>
<p>Provider quirks that bend the neat picture. Apple hands you a private relay address unless the user
shares the real one; it works as a mailbox, so treat it as the account email only if the user confirms
it. GitHub accounts carry several addresses and the token shows whichever is primary today. And
<code>email_verified</code> means the provider verified it, at some point, by their rules; it lowers the
risk of step 2, and it never replaces step 2.</p>`,
docs:[['Account linking (Auth0)','https://auth0.com/docs/manage-users/user-accounts/user-account-linking'],['Sign in with Google','https://developers.google.com/identity']],
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
{id:'biz',title:'B2B, B2C & B2B2C, and what they mean for identity',body:`
<p>Who your product serves changes how you do identity more than almost any technical choice. Three business models:</p>
<ul>
<li><b>B2C (business-to-consumer)</b>: you serve <b>individuals</b> directly. Examples: Netflix, Spotify, a news app. Identity is <b>CIAM</b>: self-service registration, social login, password reset, huge scale, and heavy emphasis on frictionless UX plus privacy/consent.</li>
<li><b>B2B (business-to-business)</b>: you serve <b>other companies</b>, and each user belongs to a customer <b>organization (tenant)</b>. Examples: Salesforce, Datadog, Workday. Identity is enterprise: <b>SSO</b> (SAML/OIDC) into the customer's IdP, <b>SCIM</b> provisioning, delegated admin, and roles scoped to the tenant.</li>
<li><b>B2B2C (business-to-business-to-consumer)</b>: you serve a <b>business that serves its own consumers through you</b>. Examples: Shopify (merchants and their shoppers), Stripe (platforms and their customers), a white-label banking app. Identity has <b>two layers</b>: the business tenant <i>and</i> that tenant's end users, requiring strict <b>tenant isolation</b>, <b>delegated administration</b>, and often per-tenant branding or IdP.</li>
</ul>
<p><b>How it shapes authentication.</b> B2C optimizes for low-friction self-service and consent. B2B optimizes for federation and central control (the customer's IT owns the users). B2B2C must do both (isolate each tenant's users while letting each business manage its own consumers), which is why multi-tenancy (next lesson) is the defining problem for B2B and B2B2C.</p>

<h4>What changes when the customer is a company</h4>
<p>The deepest difference is <b>who owns the user</b>. In B2C the person owns their own account: they register themselves, choose their password, and can delete it. In B2B the <i>customer organization</i> owns the account: their IT department decides who exists, what they may access, and when access ends. That single shift explains most of the technical differences downstream, and it is why a B2C-shaped product entering the enterprise market discovers it needs a rebuild rather than a feature.</p>
<p>It also inverts the definition of a good login. In B2C, friction is the enemy: every extra field costs conversions. In B2B, control is the requirement: the buyer wants SSO enforced, self-registration disabled, and a leaver's access gone within minutes of HR pressing a button.</p>

<h4>The enterprise checklist, and why buyers ask for it</h4>
<ul>
<li><b>SSO via SAML or OIDC</b>, so the customer's IdP remains the only place credentials exist. Often mandated by their security policy, which makes it a deal blocker rather than a preference.</li>
<li><b>SCIM provisioning</b>, so accounts are created, updated and <b>deactivated</b> automatically. Manual deprovisioning is what leaves an ex-employee with access for months, and auditors ask about exactly this.</li>
<li><b>Group-to-role mapping</b>: the customer expresses permissions in their directory groups and expects your product to honor them.</li>
<li><b>Delegated administration and audit</b>: their admins manage their own users, and their auditors want the log.</li>
</ul>
<p>Charging extra for SSO is worth a mention because the industry argues about it: the "SSO tax" is common commercially and is criticized on the grounds that it prices a security control out of reach for small customers.</p>

<h4>B2B2C: two populations, one system</h4>
<p>The hardest model, because you serve two kinds of identity at once with different rules: the merchant's staff (enterprise-shaped: SSO, roles, audit) and the merchant's shoppers (consumer-shaped: self-service, social login, privacy rights). They must be isolated from each other, branded per tenant, and often stored so that one tenant's consumers are invisible to another's, including in your support tooling. The mistake that is expensive to undo is modeling both populations in one user table with a flag; the two have different lifecycles, different lawful bases for processing, and different definitions of "delete my account".</p>`,
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
tests:[{d:'B2C is CIAM self-service',re:'(?:["\']b2c["\'][^;}]*?return\\s+["\']CIAM self-service["\'])|(?:case\\s*["\']b2c["\']\\s*->\\s*(?:\\{\\s*)?["\']CIAM self-service["\'])|(?:["\']b2c["\']\\s*:\\s*["\']CIAM self-service["\'])|(?:(?:put|entry|of)\\s*\\(\\s*["\']b2c["\']\\s*,\\s*["\']CIAM self-service["\'])',flags:'s'},{d:'B2B is enterprise SSO + SCIM',re:'"b2b".*?"enterprise SSO and SCIM"',flags:'s'},{d:'B2B2C is tenant isolation + delegated admin',re:'"b2b2c".*?"tenant isolation and delegated admin"',flags:'s'},{d:'B2B and B2B2C are multi-tenant',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:equals\\s*\\(\\s*"b2b"\\s*\\)\\s*\\|\\|))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:equals\\s*\\(\\s*"b2b"\\s*\\)\\s*\\|\\|)[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:equals\\s*\\(\\s*"b2b"\\s*\\)\\s*\\|\\|)[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:equals\\s*\\(\\s*"b2b"\\s*\\)\\s*\\|\\|)[^{]*?return\\s+\\k<av>\\b)'},{d:'unknown default',re:'"unknown"'}],
behavior:`identityStyle("b2c") is "CIAM self-service", ("b2b") is "enterprise SSO and SCIM", ("b2b2c") is "tenant isolation and delegated admin". multiTenant("b2b") and ("b2b2c") are true; ("b2c") is false. The model dictates whether you optimize for self-service, federation, or both with isolation.`,
hints:['B2C serves consumers (CIAM); B2B serves companies (enterprise SSO); B2B2C serves a business and its consumers.','B2B and B2B2C introduce tenants, so they are multi-tenant.','Shopify (merchants + shoppers) is the classic B2B2C example.']}},
{id:'mt',title:'Multi-tenant identity for B2B & B2B2C',body:`
<p>In B2B and B2B2C each customer is a <b>tenant</b>, and getting tenancy right is the defining identity problem. Four design pillars:</p>
<ul>
<li><b>Tenant isolation</b>: every user, resource, and role is scoped to a <code>tenant_id</code>, and one tenant must never see another's data. A cross-tenant leak is the catastrophic failure mode, so isolation is checked on every request.</li>
<li><b>Per-tenant IdP connections</b>: Acme signs in through Okta, Beta through Microsoft Entra. You first <b>resolve the tenant</b> (by email domain or a per-tenant subdomain), then route the login to <i>that</i> tenant's identity provider.</li>
<li><b>Delegated administration</b>: each customer's own admins manage their users, groups, and roles, without your involvement.</li>
<li><b>Tenant-scoped roles</b>: the same person can be an admin in one tenant and a read-only member in another, so roles are always evaluated within a tenant.</li>
</ul>
<p>The recurring pattern: <b>resolve tenant → route to the right IdP → enforce tenant isolation on every access</b>. Home-realm discovery (mapping an email domain to a tenant and its IdP) is how the first step usually works.</p>

<h4>Where the tenant id has to live</h4>
<p>Tenant isolation fails in the gap between "the code checks the tenant" and "every query is scoped to the tenant". The choices, in descending order of safety: a <b>database per tenant</b> (strongest isolation, most operational cost, hardest to run at thousands of tenants); a <b>schema per tenant</b> (a middle ground with the same connection pool); or a <b>shared schema with a tenant column</b> (cheapest and by far the most common, and the only one where a forgotten <code>WHERE tenant_id = ?</code> leaks data).</p>
<p>If you choose the shared schema, do not rely on developers remembering. Enforce it structurally: row-level security in the database, or a repository layer that refuses to build a query without a tenant, so the isolation is a property of the system rather than of a code review. And derive the tenant from the <b>authenticated token</b>, never from a request parameter or a header the caller controls; a tenant id taken from the URL is an invitation to change it.</p>

<h4>Resolving the tenant before there is a session</h4>
<p>At login there is no token yet, so the tenant must come from somewhere else: a per-tenant subdomain (<code>acme.app.com</code>), a path prefix, or <b>home-realm discovery</b> from the email domain the user typed. Email-domain mapping is the most common and has two sharp edges: a domain must be verified before it may be claimed, or anyone can hijack a tenant's users, and consumer domains like gmail.com can never map to a single tenant. The usual design is: verified domain to tenant where possible, and an explicit tenant chooser where a person legitimately belongs to several.</p>

<h4>The parts teams underestimate</h4>
<ul>
<li><b>One human, several tenants.</b> A consultant with access to three customers needs one credential and three memberships, so identity is global while roles, sessions and consent are per tenant. Building the user record inside the tenant makes this impossible to fix later.</li>
<li><b>Per-tenant policy.</b> Different customers demand different MFA rules, session lengths and password policies, so policy is data, not configuration.</li>
<li><b>Delegated administration is a permission model of its own</b>, and the tenant admin must never be able to escalate outside their tenant.</li>
<li><b>Per-tenant audit.</b> Customers increasingly want their own logs, which means the audit trail is tenant-scoped from the start.</li>
</ul>`,
docs:[['Multi-tenant identity (Azure)','https://learn.microsoft.com/en-us/azure/architecture/guide/multitenant/considerations/identity'],['Home realm discovery','https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/home-realm-discovery-policy']],
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
tests:[{d:'derives the tenant from the email domain',re:'substring\\s*\\(\\s*email\\.indexOf\\s*\\(\\s*"@"\\s*\\)\\s*\\+\\s*1\\s*\\)'},{d:'isolation: access only within the same tenant',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:resourceTenant\\.equals\\s*\\(\\s*userTenant\\s*\\)))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:resourceTenant\\.equals\\s*\\(\\s*userTenant\\s*\\))[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:resourceTenant\\.equals\\s*\\(\\s*userTenant\\s*\\))[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:resourceTenant\\.equals\\s*\\(\\s*userTenant\\s*\\))[^{]*?return\\s+\\k<av>\\b)'}],
behavior:`tenantKey("ada@acme.com") is "acme.com" (used to find Acme's tenant and IdP). sameTenant("acme","acme") is true; sameTenant("acme","beta") is false, the isolation check that prevents cross-tenant access.`,
hints:['Tenant discovery from an email is the substring after the @.','Isolation is an equality check: the resource tenant must equal the user tenant.','Resolve tenant first, route to its IdP, then enforce isolation on every request.']}},

{id:'eibroker',title:'Identity brokering: one hub between many IdPs and many apps',body:`
<p>Federation lessons so far assume one identity provider and one application. Real estates rarely look
like that. A university has a dozen upstream providers and hundreds of services; a SaaS company has one
login page and a different corporate IdP behind every enterprise customer; an acquisition arrives with its
own directory that will not be merged for two years.</p>
<!--flow:eibroker-broker-->
<h4>Identity brokering: one hub, many IdPs: step by step</h4>
<div class="flowDia"><svg viewBox="0 0 720 306" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Identity brokering: one hub, many IdPs"><defs><marker id="eibroker-broker-ah-front" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent)"/></marker><marker id="eibroker-broker-ah-back" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent2)"/></marker><marker id="eibroker-broker-ah-attack" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--bad)"/></marker><marker id="eibroker-broker-ah-x" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--muted)"/></marker></defs><line x1="74" y1="54" x2="74" y2="294" class="fdLife"/><line x1="264.66666666666663" y1="54" x2="264.66666666666663" y2="294" class="fdLife"/><line x1="455.3333333333333" y1="54" x2="455.3333333333333" y2="294" class="fdLife"/><line x1="646" y1="54" x2="646" y2="294" class="fdLife"/><rect x="34.300000000000004" y="8" width="79.39999999999999" height="46" rx="8" class="fdActor"/><text x="74" y="35.5" class="fdActorT">Browser</text><rect x="225.66666666666663" y="8" width="78" height="46" rx="8" class="fdActor"/><text x="264.66666666666663" y="27" class="fdActorT">App</text><text x="264.66666666666663" y="42" class="fdActorS">integrates ONCE</text><rect x="416.3333333333333" y="8" width="78" height="46" rx="8" class="fdActor"/><text x="455.3333333333333" y="35.5" class="fdActorT">Broker</text><rect x="585.8" y="8" width="120.39999999999999" height="46" rx="8" class="fdActor"/><text x="646" y="27" class="fdActorT">Upstream IdP</text><text x="646" y="42" class="fdActorS">per customer</text><line x1="77" y1="102" x2="259.66666666666663" y2="102" stroke="var(--accent)" class="fdArrow" marker-end="url(#eibroker-broker-ah-front)"/><text x="184.33333333333331" y="93" class="fdLabel">login</text><circle cx="92" cy="102" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="92" y="105.5" class="fdNumT" style="fill:var(--accent)">1</text><line x1="267.66666666666663" y1="132" x2="450.3333333333333" y2="132" stroke="var(--accent)" class="fdArrow" marker-end="url(#eibroker-broker-ah-front)"/><text x="375" y="123" class="fdLabel">OIDC /authorize, app only speaks to the broker</text><circle cx="282.66666666666663" cy="132" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="282.66666666666663" y="135.5" class="fdNumT" style="fill:var(--accent)">2</text><line x1="458.3333333333333" y1="162" x2="641" y2="162" stroke="var(--accent)" class="fdArrow" marker-end="url(#eibroker-broker-ah-front)"/><text x="565.6666666666666" y="153" class="fdLabel">second hop: SAML or OIDC, per tenant</text><circle cx="473.3333333333333" cy="162" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="473.3333333333333" y="165.5" class="fdNumT" style="fill:var(--accent)">3</text><line x1="643" y1="192" x2="460.3333333333333" y2="192" stroke="var(--accent)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#eibroker-broker-ah-front)"/><text x="535.6666666666666" y="183" class="fdLabel">assertion in the upstream’s dialect</text><circle cx="628" cy="192" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="628" y="195.5" class="fdNumT" style="fill:var(--accent)">4</text><rect x="313.6333333333333" y="209" width="283.4" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="463.3333333333333" y="224" class="fdSelfT">normalize claims to one canonical shape</text><circle cx="313.6333333333333" cy="220" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="313.6333333333333" y="223.5" class="fdNumT" style="fill:var(--muted)">5</text><line x1="452.3333333333333" y1="258" x2="269.66666666666663" y2="258" stroke="var(--accent)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#eibroker-broker-ah-front)"/><text x="345" y="249" class="fdLabel">code → tokens, one predictable format</text><circle cx="437.3333333333333" cy="258" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="437.3333333333333" y="261.5" class="fdNumT" style="fill:var(--accent)">6</text><text x="360" y="276" class="fdNote">Customers’ IdPs come and go; the app’s integration never changes.</text></svg></div>
<ol class="fdSteps">
<li><b>Browser → App:</b> login <i>(front channel)</i></li>
<li><b>App → Broker:</b> OIDC /authorize, app only speaks to the broker <i>(front channel)</i></li>
<li><b>Broker → Upstream IdP:</b> second hop: SAML or OIDC, per tenant <i>(front channel)</i></li>
<li><b>Upstream IdP → Broker:</b> assertion in the upstream’s dialect <i>(front channel)</i></li>
<li><b>Broker:</b> normalize claims to one canonical shape</li>
<li><b>Broker → App:</b> code → tokens, one predictable format <i>(front channel)</i></li>
</ol>
<!--/flow:eibroker-broker-->
<p>Connecting every app to every IdP is the quadratic problem federation was supposed to solve. An
<b>identity broker</b>, sometimes an IdP proxy or hub, sits in the middle: it is a relying party to every
upstream provider and an identity provider to every application. Each side integrates once, with it.</p>

<div class="codeSample" data-hl>  Okta (customer A)  ─┐                    ┌─▶ App 1
  Entra (customer B) ─┼─▶  [ BROKER ]  ──┼─▶ App 2
  Google (consumers) ─┤    RP upstream   ├─▶ App 3
  Legacy LDAP        ─┘    IdP downstream└─▶ App 4

  n + m integrations instead of n x m</div>

<h4>What the broker is actually for</h4>
<p>The integration arithmetic is the obvious benefit and the least interesting one. The real value is that
the broker is the one place where cross-cutting decisions can live: where MFA policy is applied
consistently no matter which upstream authenticated the user, where claims from four very different
providers are normalized into one shape your applications understand, where a session exists that spans
them, and where the audit trail is complete.</p>
<p>It is also where you absorb change. Replacing an upstream provider becomes a broker configuration
change rather than a project touching every application.</p>

<h4>The two failures that matter</h4>
<p><b>Subject collision.</b> Every upstream provider assigns its own subject identifiers, and they are only
unique within that provider. Two upstreams can each have a user <code>12345</code>. A broker that keys
accounts on the raw upstream <code>sub</code> will eventually merge two unrelated people, and the way you
find out is a support ticket from someone seeing another customer's data. The fix is to <b>namespace the
subject by its issuer</b>: the identity is the pair, never the value alone.</p>
<p><b>Unverified claims.</b> This one is sharper. An upstream provider can assert any email address it
likes, including one belonging to a user of a different upstream. If your broker links accounts by email,
a customer who controls their own IdP can assert <code>ceo@yourcompany.com</code> and take over that
account. The rule: a claim is only as trustworthy as the provider's <b>authority over it</b>, so verify
domain ownership and only accept an email claim from an upstream authoritative for that domain.</p>

<h4>The costs, which are structural</h4>
<ul>
<li><b>A single point of failure.</b> If the broker is down, nobody signs in to anything. It inherits the
availability requirements of every application behind it.</li>
<li><b>A double hop.</b> Two redirects, two sets of clock-skew tolerances, two session lifetimes, and
error messages that arrive at the user two translations away from where they originated. Diagnosis takes
longer, which is why the trace identifier must survive both hops.</li>
<li><b>The temptation to add logic.</b> Brokers accumulate transformation rules until nobody can say what
claims an application receives. Keep the mapping declarative and reviewable.</li>
<li><b>Concentrated blast radius.</b> Compromise the broker and you have every application and every
upstream at once, the same argument as the IdP-as-blast-radius lesson, one level up.</li>
</ul>
<p>Use one when you genuinely have many-to-many, or when you need a consistent policy point across
providers you do not control. For three applications and one IdP it is machinery you will regret.</p>`,
docs:[['Keycloak (identity brokering)','https://www.keycloak.org/docs/latest/server_admin/#_identity_broker'],['OpenID Connect Core (the sub claim)','https://openid.net/specs/openid-connect-core-1_0.html#IDToken'],['NIST SP 800-63C (federation and assertions)','https://pages.nist.gov/800-63-3/sp800-63c.html']],
exs:[{title:'Namespace the subject',lang:'js',diff:'medium',
run:{call:'brokeredSubject',cases:[{name:'an upstream subject becomes issuer-qualified',args:['https://acme.okta.com','12345'],expect:'https://acme.okta.com|12345'},{name:'the same raw id from another upstream is a different person',args:['https://beta.example','12345'],expect:'https://beta.example|12345'},{name:'a missing subject is not an identity',args:['https://acme.okta.com',''],expect:null},{name:'a missing issuer is not an identity',args:['','12345'],expect:null}]},
prompt:`Write <code>function brokeredSubject(upstreamIssuer, upstreamSub)</code> returning a subject identifier that is unique across all upstream providers: the issuer and the subject joined by <code>|</code>. Return <code>null</code> if either part is missing, because half an identity is not an identity.`,
starter:`function brokeredSubject(upstreamIssuer, upstreamSub) {
  return null;
}`,
solution:`function brokeredSubject(upstreamIssuer, upstreamSub) {
  if (!upstreamIssuer || !upstreamSub) return null;   // half an identity is not one
  return upstreamIssuer + "|" + upstreamSub;          // unique across ALL upstreams
}`,
tests:[{d:'both parts are required',re:'!upstreamIssuer|!upstreamSub'},{d:'the issuer qualifies the subject',re:'upstreamIssuer\\s*\\+|\\$\\{upstreamIssuer'},{d:'the subject is included',re:'upstreamSub'},{d:'missing input returns null',re:'return null'}],
behavior:`Four cases execute, and cases one and two are the whole lesson: the same raw identifier 12345 arrives from two different providers and must produce two different accounts. A broker keying on the raw sub merges them, and the symptom is a user seeing someone else's data, which is discovered by a support ticket rather than by a test. The rule generalizes past brokering: a subject identifier is only unique within its issuer, so anywhere you store one, store the issuer beside it.`,
hints:['The identity is the pair, not either value alone.','Guard both inputs before combining them.','Pick a separator that cannot appear in an issuer URL.']},
{title:'Which upstream may assert this email?',lang:'js',diff:'hard',
run:{call:'acceptUpstreamEmail',cases:[{name:'the upstream is authoritative for the domain',args:['https://acme.okta.com','ada@acme.com',{'https://acme.okta.com':['acme.com'],'https://beta.example':['beta.example']}],expect:true},{name:'another customer claiming your domain is refused',args:['https://beta.example','ada@acme.com',{'https://acme.okta.com':['acme.com'],'https://beta.example':['beta.example']}],expect:false},{name:'domains compare case-insensitively',args:['https://acme.okta.com','Ada@ACME.com',{'https://acme.okta.com':['acme.com'],'https://beta.example':['beta.example']}],expect:true},{name:'a malformed address is refused',args:['https://acme.okta.com','not-an-email',{'https://acme.okta.com':['acme.com']}],expect:false},{name:'an upstream with no verified domains',args:['https://who.example','ada@acme.com',{'https://acme.okta.com':['acme.com']}],expect:false}]},
prompt:`Write <code>function acceptUpstreamEmail(upstreamIssuer, email, authoritative)</code> deciding whether to believe an email claim. <code>authoritative</code> maps each upstream issuer to the list of domains it has proven it owns. Accept only when the email's domain is in that upstream's list. Compare domains case-insensitively, and reject anything without an <code>@</code>.`,
starter:`function acceptUpstreamEmail(upstreamIssuer, email, authoritative) {
  return false;
}`,
solution:`function acceptUpstreamEmail(upstreamIssuer, email, authoritative) {
  if (!email || !email.includes("@")) return false;
  const domain = email.split("@").pop().toLowerCase();
  return (authoritative[upstreamIssuer] || []).includes(domain);  // unknown upstream: no domains
}`,
tests:[{d:'the address is validated before use',re:'includes\\s*\\(\\s*["\x27]@|indexOf\\s*\\(\\s*["\x27]@'},{d:'the domain is extracted',re:'split\\s*\\(\\s*["\x27]@'},{d:'comparison is case-insensitive',re:'toLowerCase'},{d:'an unknown upstream has no authority',re:'(?:return\\s+(?!\\s*!)[^;{]*(?:\\|\\|\\s*\\[\\]|\\?\\?\\s*\\[\\]))|(?:if\\s*\\(\\s*(?!\\s*!)[^;{]*(?:\\|\\|\\s*\\[\\]|\\?\\?\\s*\\[\\])[^;{]*\\)\\s*\\{?\\s*return\\s+true)|(?:if\\s*\\(\\s*!\\s*[^;{]*(?:\\|\\|\\s*\\[\\]|\\?\\?\\s*\\[\\])[^;{]*\\)\\s*\\{?\\s*return\\s+false)|(?:(?<av>[A-Za-z_$][\\w$]*)\\s*=(?!=)\\s*(?!\\s*!)[^;{]*(?:\\|\\|\\s*\\[\\]|\\?\\?\\s*\\[\\])[^{]*?return\\s+\\k<av>\\b)'},{d:'a guard returns its constant, not the negation of it',re:'return\\s+!\\s*\\(?\\s*(?:true|false)\\s*\\)?\\s*;',not:true}],
behavior:`Five cases execute. Case two is the account-takeover vector in one line: a customer who runs their own IdP asserts an email at your domain, and a broker that links accounts by email hands them the matching account. That is not hypothetical; it is a recurring finding in multi-tenant SaaS. The unknown-upstream case matters just as much: falling back to an empty list means a provider you have not configured has authority over nothing, which is the correct default. Note what this function does NOT do: it never uses the email to find an account. It only decides whether the claim is believable; linking still requires an explicit, verified step.`,
hints:['Take the domain from the address, then ask whether this upstream owns it.','An upstream you have never configured should have authority over nothing.','Domains are case-insensitive; local parts are not, but you are not comparing those.']}]}
]});
