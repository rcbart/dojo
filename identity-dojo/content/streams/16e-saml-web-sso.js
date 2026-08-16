STREAMS.push({iam:true,sec:'SAML & enterprise web SSO',icon:'🎫',title:'SAML 2.0 & Web SSO',blurb:'The enterprise SSO workhorse: SAML assertions, SP- vs IdP-initiated flows, the HTTP bindings (Redirect/POST/Artifact), metadata & trust, signing/encryption and Single Logout — and when to choose SAML vs OIDC.',lessons:[

{id:'sml1',title:'What SAML is & the assertion',body:`
<p><b>SAML 2.0</b> (Security Assertion Markup Language) is the older, XML-based federation standard that still runs most <b>enterprise web SSO</b>. Same idea as OIDC — an <b>IdP</b> vouches for a user to a <b>Service Provider (SP)</b> — but the message is an XML <b>assertion</b> instead of a JWT.</p>
<p>SAML 2.0 Core defines exactly <b>three statement types</b> — <code>AuthnStatement</code>, <code>AttributeStatement</code> and <code>AuthzDecisionStatement</code> (the last is rarely used and deprecated in practice). An assertion also carries elements that are <i>not</i> statements but matter just as much. Both, together:</p>
<ul>
<li><b>Authentication statement</b> — "this subject authenticated at this time, using this method."</li>
<li><b>Attribute statement</b> — user attributes (email, groups, department) the SP uses.</li>
<li><b>NameID</b> <i>(not a statement — it sits in <code>&lt;Subject&gt;</code>)</i> — the subject identifier (the "who"), like OIDC's <code>sub</code>.</li>
<li><b>Conditions</b> <i>(not a statement — a sibling of them)</i> — validity window (<code>NotBefore</code>/<code>NotOnOrAfter</code>) and <b>Audience</b> (which SP it's for) — the SAML equivalents of <code>exp</code>/<code>aud</code>.</li>
</ul>
<p>The assertion is <b>signed by the IdP</b> (XML Signature) so the SP can trust it. SAML vs OIDC in one line: <b>SAML = XML assertions over browser POST/redirect, enterprise SSO; OIDC = JSON/JWT over OAuth, modern apps &amp; APIs.</b></p>
<div class="codeSample" data-hl>&lt;saml:Assertion&gt;
  &lt;saml:Subject&gt;&lt;saml:NameID&gt;jane@corp.com&lt;/saml:NameID&gt;&lt;/saml:Subject&gt;
  &lt;saml:Conditions NotOnOrAfter="2026-01-01T00:05:00Z"&gt;
    &lt;saml:AudienceRestriction&gt;&lt;saml:Audience&gt;https://app.example.com&lt;/saml:Audience&gt;
  &lt;/saml:Conditions&gt;
  &lt;saml:AttributeStatement&gt; ... groups, email ... &lt;/saml:AttributeStatement&gt;
&lt;/saml:Assertion&gt;   &lt;!-- signed by the IdP --&gt;</div>

<h4>Why you still need to know this</h4>
<p>SAML is from 2005 and it is not what you would choose today. It also runs a very large share of
enterprise SSO, and it is not going anywhere: every HR system, every finance suite, every long-lived
internal application speaks it. You will meet it not because someone chose it recently but because it was
chosen fifteen years ago and works.</p>
<p>The good news is that you already know the shape. An IdP vouches for a user to an application, the
application trusts the IdP's signature, and the user never gives the application their password. That is
federation, from the Foundations stream. SAML is one encoding of it — <b>signed XML delivered through the
browser</b> — where OIDC is another.</p>

<h4>The vocabulary, mapped to what you already know</h4>
<div class="codeSample" data-hl>SAML                        OIDC / OAuth              what it is
Identity Provider (IdP)     OpenID Provider / AS      vouches for the user
Service Provider (SP)       Relying Party / Client    the application
Assertion                   ID token                  the signed statement
NameID                      sub                       the subject identifier
AudienceRestriction         aud                       who it is for
NotOnOrAfter                exp                       when it stops being valid
entityID                    issuer / client_id        the party's unique name
ACS URL                     redirect_uri              where the response lands

// same cast, different names. this is why the Foundations stream
// introduced the actors ONCE rather than three times.</div>

<h4>The one structural difference that matters</h4>
<p>An OIDC ID token is compact, JSON, and travels in a header or a small parameter. A SAML assertion is
<b>signed XML</b>, frequently several kilobytes, and travels <b>through the browser</b> as a form POST.
Almost every SAML quirk follows from those two facts: XML signing is complicated enough to have its own
vulnerability class, and going through the browser means URL length limits, form auto-submission, and every
hop being visible to whatever else is running in that browser.</p>

<h4>A concrete assertion, annotated</h4>
<div class="codeSample" data-hl>&lt;saml:Assertion ID="_a1b2" IssueInstant="2026-01-01T00:00:00Z"&gt;
  &lt;saml:Issuer&gt;https://idp.corp.com/saml&lt;/saml:Issuer&gt;   &lt;!-- who says so --&gt;
  &lt;ds:Signature&gt;...&lt;/ds:Signature&gt;                        &lt;!-- proof they said it --&gt;
  &lt;saml:Subject&gt;
    &lt;saml:NameID Format="...emailAddress"&gt;jane@corp.com&lt;/saml:NameID&gt;
    &lt;saml:SubjectConfirmationData Recipient="https://app.example.com/saml/acs"
                                  InResponseTo="_req99"
                                  NotOnOrAfter="2026-01-01T00:05:00Z"/&gt;
  &lt;/saml:Subject&gt;
  &lt;saml:Conditions NotBefore="..." NotOnOrAfter="..."&gt;
    &lt;saml:AudienceRestriction&gt;&lt;saml:Audience&gt;https://app.example.com&lt;/saml:Audience&gt;
  &lt;/saml:Conditions&gt;
  &lt;saml:AuthnStatement AuthnInstant="..." SessionIndex="_sess42"&gt;
    &lt;saml:AuthnContextClassRef&gt;...&lt;/saml:AuthnContextClassRef&gt;  &lt;!-- HOW they authenticated --&gt;
  &lt;/saml:AuthnStatement&gt;
  &lt;saml:AttributeStatement&gt; ... groups, department, employeeId ... &lt;/saml:AttributeStatement&gt;
&lt;/saml:Assertion&gt;</div>
<p>Two fields there earn their keep later. <b><code>SessionIndex</code></b> is what makes Single Logout even
theoretically possible — it names <i>this</i> login so it can be ended. And
<b><code>AuthnContextClassRef</code></b> states <i>how</i> the user authenticated, which is SAML's version
of <code>acr</code> and the only way an SP can require MFA rather than hope for it.</p>

<h4>Choosing the NameID is a decision, not a default</h4>
<p>The <code>NameID</code> is the key the SP will store the user under, so picking a mutable one is a
mistake you live with. An email address is the common choice and it <b>changes</b> — people marry, companies
rebrand, and the SP then sees a brand-new user with no history. Use an opaque, permanent identifier and send
the email as an <i>attribute</i>. This is exactly the "<code>sub</code> is the only safe identity key" rule
from the claims lesson, in SAML's clothing.</p>`,
docs:[['SAML 2.0 Core &sect;2.7 - statement types','http://docs.oasis-open.org/security/saml/v2.0/saml-core-2.0-os.pdf'],['SAML 2.0 (OASIS)','http://docs.oasis-open.org/security/saml/v2.0/saml-core-2.0-os.pdf'],['Okta — What is SAML?','https://www.okta.com/integrate/documentation/saml/'],['SAML vs OIDC','https://www.okta.com/identity-101/saml-vs-oidc/']],
ex:{title:'Read the NameID from an assertion',
prompt:`Write <code>Saml</code> with <code>static String nameId(String xml)</code> that returns the text inside the first <code>&lt;saml:NameID&gt;...&lt;/saml:NameID&gt;</code> element, or <code>null</code> if absent. Find the open tag with <code>indexOf("&lt;saml:NameID&gt;")</code>, the close tag with <code>indexOf("&lt;/saml:NameID&gt;")</code>, and return the <code>substring</code> between them (return null if either is missing).`,
starter:`public class Saml {
    static String nameId(String xml) {
        return null;
    }
}`,
tests:[{d:'references the NameID open tag',re:'"<saml:NameID>"'},{d:'references the NameID close tag',re:'"</saml:NameID>"'},{d:'extracts the text between with substring',re:'substring\\s*\\('},{d:'guards when the element is absent',re:'<\\s*0|==\\s*-1'}],
behavior:`nameId("...<saml:NameID>jane@corp.com</saml:NameID>...") returns "jane@corp.com". If there is no NameID element, it returns null. (Real SAML libraries parse the XML with a hardened parser and verify the signature first — this drills the concept.)`,
hints:['<code>int a = xml.indexOf("&lt;saml:NameID&gt;");</code> and bail if <code>a &lt; 0</code>.','Advance past the open tag: <code>a += "&lt;saml:NameID&gt;".length();</code>','<code>int b = xml.indexOf("&lt;/saml:NameID&gt;");</code> then <code>return xml.substring(a, b);</code>'],
solution:`public class Saml {
    static String nameId(String xml) {
        String open = "<saml:NameID>", close = "</saml:NameID>";
        int a = xml.indexOf(open);
        int b = xml.indexOf(close);
        if (a < 0 || b < 0) return null;
        return xml.substring(a + open.length(), b);
    }
}`}},

{id:'sml2',title:'SP-initiated vs IdP-initiated SSO',body:`
<p>SAML SSO happens in one of two directions. Knowing which is which is essential:</p>
<!--flow:sml2-sp-init-->
<h4>SP-initiated SAML SSO — step by step</h4>
<div class="flowDia"><svg viewBox="0 0 680 312" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="SP-initiated SAML SSO"><defs><marker id="sml2-sp-init-ah-front" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent)"/></marker><marker id="sml2-sp-init-ah-back" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent2)"/></marker><marker id="sml2-sp-init-ah-attack" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--bad)"/></marker><marker id="sml2-sp-init-ah-x" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--muted)"/></marker></defs><line x1="74" y1="54" x2="74" y2="300" class="fdLife"/><line x1="340" y1="54" x2="340" y2="300" class="fdLife"/><line x1="606" y1="54" x2="606" y2="300" class="fdLife"/><rect x="34.300000000000004" y="8" width="79.39999999999999" height="46" rx="8" class="fdActor"/><text x="74" y="35.5" class="fdActorT">Browser</text><rect x="301" y="8" width="78" height="46" rx="8" class="fdActor"/><text x="340" y="27" class="fdActorT">SP</text><text x="340" y="42" class="fdActorS">the app</text><rect x="567" y="8" width="78" height="46" rx="8" class="fdActor"/><text x="606" y="35.5" class="fdActorT">IdP</text><line x1="77" y1="102" x2="335" y2="102" stroke="var(--accent)" class="fdArrow" marker-end="url(#sml2-sp-init-ah-front)"/><text x="222" y="93" class="fdLabel">GET /app — no session</text><circle cx="92" cy="102" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="92" y="105.5" class="fdNumT" style="fill:var(--accent)">1</text><line x1="343" y1="132" x2="601" y2="132" stroke="var(--accent)" class="fdArrow" marker-end="url(#sml2-sp-init-ah-front)"/><text x="488" y="123" class="fdLabel">302: AuthnRequest (Redirect binding)</text><circle cx="358" cy="132" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="358" y="135.5" class="fdNumT" style="fill:var(--accent)">2</text><rect x="310" y="149" width="356" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="496" y="164" class="fdSelfT">user authenticates (or already has an IdP session)</text><circle cx="310" cy="160" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="310" y="163.5" class="fdNumT" style="fill:var(--muted)">3</text><line x1="603" y1="198" x2="345" y2="198" stroke="var(--accent)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#sml2-sp-init-ah-front)"/><text x="458" y="189" class="fdLabel">auto-POST: signed Response + Assertion</text><circle cx="588" cy="198" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="588" y="201.5" class="fdNumT" style="fill:var(--accent)">4</text><rect x="168.60000000000002" y="215" width="342.79999999999995" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="348" y="230" class="fdSelfT">verify signature, InResponseTo, audience, window</text><circle cx="168.60000000000002" cy="226" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="168.60000000000002" y="229.5" class="fdNumT" style="fill:var(--muted)">5</text><line x1="337" y1="264" x2="79" y2="264" stroke="var(--accent)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#sml2-sp-init-ah-front)"/><text x="192" y="255" class="fdLabel">Set-Cookie: session; 302 → /app</text><circle cx="322" cy="264" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="322" y="267.5" class="fdNumT" style="fill:var(--accent)">6</text><text x="340" y="282" class="fdNote">The SP asked the question, so it can check the answer matches (InResponseTo).</text></svg></div>
<ol class="fdSteps">
<li><b>Browser → SP:</b> GET /app — no session <i>(front channel)</i></li>
<li><b>SP → IdP:</b> 302: AuthnRequest (Redirect binding) <i>(front channel)</i></li>
<li><b>IdP:</b> user authenticates (or already has an IdP session)</li>
<li><b>IdP → SP:</b> auto-POST: signed Response + Assertion <i>(front channel)</i></li>
<li><b>SP:</b> verify signature, InResponseTo, audience, window</li>
<li><b>SP → Browser:</b> Set-Cookie: session; 302 → /app <i>(front channel)</i></li>
</ol>
<!--/flow:sml2-sp-init-->
<!--flow:sml2-idp-init-->
<h4>IdP-initiated SAML SSO — step by step</h4>
<div class="flowDia"><svg viewBox="0 0 680 282" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="IdP-initiated SAML SSO"><defs><marker id="sml2-idp-init-ah-front" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent)"/></marker><marker id="sml2-idp-init-ah-back" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent2)"/></marker><marker id="sml2-idp-init-ah-attack" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--bad)"/></marker><marker id="sml2-idp-init-ah-x" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--muted)"/></marker></defs><line x1="74" y1="54" x2="74" y2="270" class="fdLife"/><line x1="340" y1="54" x2="340" y2="270" class="fdLife"/><line x1="606" y1="54" x2="606" y2="270" class="fdLife"/><rect x="34.300000000000004" y="8" width="79.39999999999999" height="46" rx="8" class="fdActor"/><text x="74" y="35.5" class="fdActorT">Browser</text><rect x="301" y="8" width="78" height="46" rx="8" class="fdActor"/><text x="340" y="27" class="fdActorT">SP</text><text x="340" y="42" class="fdActorS">the app</text><rect x="567" y="8" width="78" height="46" rx="8" class="fdActor"/><text x="606" y="27" class="fdActorT">IdP</text><text x="606" y="42" class="fdActorS">portal with app tiles</text><line x1="77" y1="102" x2="601" y2="102" stroke="var(--accent)" class="fdArrow" marker-end="url(#sml2-idp-init-ah-front)"/><text x="355" y="93" class="fdLabel">user clicks the app tile in the IdP portal</text><circle cx="92" cy="102" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="92" y="105.5" class="fdNumT" style="fill:var(--accent)">1</text><rect x="402.40000000000003" y="119" width="263.6" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="542.2" y="134" class="fdSelfT">builds an assertion nobody asked for</text><circle cx="402.40000000000003" cy="130" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="402.40000000000003" y="133.5" class="fdNumT" style="fill:var(--muted)">2</text><line x1="603" y1="168" x2="345" y2="168" stroke="var(--accent)" class="fdArrow" marker-end="url(#sml2-idp-init-ah-front)"/><text x="458" y="159" class="fdLabel">auto-POST: unsolicited signed Assertion</text><circle cx="588" cy="168" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="588" y="171.5" class="fdNumT" style="fill:var(--accent)">3</text><rect x="188.4" y="185" width="303.2" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="348" y="200" class="fdSelfT">no AuthnRequest → no InResponseTo to check</text><circle cx="188.4" cy="196" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="188.4" y="199.5" class="fdNumT" style="fill:var(--muted)">4</text><line x1="337" y1="234" x2="79" y2="234" stroke="var(--accent)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#sml2-idp-init-ah-front)"/><text x="192" y="225" class="fdLabel">session cookie; user lands in the app</text><circle cx="322" cy="234" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="322" y="237.5" class="fdNumT" style="fill:var(--accent)">5</text><text x="340" y="252" class="fdNote">Fewer redirects, weaker guarantees: replay and injection need extra care.</text></svg></div>
<ol class="fdSteps">
<li><b>Browser → IdP:</b> user clicks the app tile in the IdP portal <i>(front channel)</i></li>
<li><b>IdP:</b> builds an assertion nobody asked for</li>
<li><b>IdP → SP:</b> auto-POST: unsolicited signed Assertion <i>(front channel)</i></li>
<li><b>SP:</b> no AuthnRequest → no InResponseTo to check</li>
<li><b>SP → Browser:</b> session cookie; user lands in the app <i>(front channel)</i></li>
</ol>
<!--/flow:sml2-idp-init-->
<ul>
<li><b>SP-initiated</b> (the common, recommended one): the user starts at the <b>app</b> (SP). The unauthenticated app builds a <b>SAMLRequest</b> (an <code>AuthnRequest</code>) and redirects the browser to the IdP. The user logs in; the IdP posts a signed assertion back to the SP's <b>ACS</b> (Assertion Consumer Service) URL. Because the SP started it, it can carry the user back to exactly where they were.</li>
<li><b>IdP-initiated</b>: the user starts at the <b>IdP</b> (e.g. an app portal / dashboard) and clicks the app tile. The IdP posts an <b>unsolicited</b> assertion straight to the SP's ACS — there was no AuthnRequest. Convenient, but riskier (no request to correlate against, a known vector for assertion-injection/CSRF-style attacks), so it's often discouraged or hardened.</li>
</ul>
<p><b>RelayState</b> is the "where to go back to" value: in SP-initiated flow the SP sends it with the request and the IdP echoes it back, so the SP can return the user to the original page. (In IdP-initiated flow it's a target URL the IdP supplies.)</p>
<div class="codeSample" data-hl>// SP-initiated: app -> IdP  (front channel redirect)
GET https://idp.example.com/sso?SAMLRequest=...deflated+base64...&RelayState=/dashboard
// IdP then POSTs a signed assertion to the SP's ACS:
POST https://app.example.com/saml/acs   (SAMLResponse=..., RelayState=/dashboard)</div>

<h4>The two directions, in plain English</h4>
<p><b>SP-initiated</b> is the ordinary case: you go to the application, it does not know you, so it sends
you to the IdP to prove who you are and you come back. You started at the app.</p>
<p><b>IdP-initiated</b> is the tile: you are already signed in to a company portal, you click the
application's icon, and the IdP pushes an assertion at the app which has not asked for anything. You started
at the IdP.</p>

<h4>Why the direction is a security property, not a preference</h4>
<div class="codeSample" data-hl>SP-INITIATED
  the SP generates an AuthnRequest with an ID, and remembers it.
  the assertion comes back carrying  InResponseTo="_req99".
  the SP can therefore ask: "did I ask for this?"

IdP-INITIATED
  there was no request. there is no InResponseTo. nothing to correlate.
  the SP must accept an UNSOLICITED, signed assertion from anyone who
  can obtain one.</div>
<p>That missing correlation is the whole problem. A captured assertion can be replayed at the SP by anyone
who has it, and the SP has no request of its own to check it against. It is the same class of gap as an
OAuth flow with no <code>state</code> and no PKCE — and it is why the OASIS specification itself notes the
weakness, why the Security BCPs discourage it, and why many products either disable it or require extra
hardening to switch it on.</p>
<p>Hardening it, if you must: a short <code>NotOnOrAfter</code> measured in a couple of minutes, a strict
replay cache keyed on the assertion <code>ID</code>, and a <code>Recipient</code> that must match this SP's
ACS URL exactly.</p>

<h4>RelayState — small, and worth understanding</h4>
<p>A user clicks a deep link, is bounced to the IdP, logs in, and lands back at the application. How does
the app know to return them to the page they wanted rather than the home page? <b>RelayState</b>: the SP
sends an opaque value with its request, and the IdP is obliged to echo it back unchanged.</p>
<div class="codeSample" data-hl>// the SP sends it out and gets it back untouched:
GET /sso?SAMLRequest=...&amp;RelayState=/reports/q3
POST /saml/acs   SAMLResponse=...&amp;RelayState=/reports/q3

// two constraints people miss:
// 1. the spec caps it at 80 BYTES. put a lookup key in it, not state.
// 2. IT IS NOT SIGNED, and it usually becomes a redirect target -
//    which makes it an OPEN REDIRECT unless the SP validates it.
//    accept a relative path, or a value from an allowlist. never
//    redirect to whatever arrived.</div>

<h4>The flow, end to end</h4>
<p>The user hits a protected page; the SP builds an <code>AuthnRequest</code>, remembers its ID, and
redirects the browser to the IdP; the IdP authenticates the user however it likes — password, MFA, an
existing session — and POSTs a signed <code>Response</code> containing the assertion to the SP's <b>ACS</b>
(Assertion Consumer Service) URL; the SP validates it, creates its <i>own</i> local session, and sends the
user to the RelayState target.</p>
<p>Note that last step: <b>SAML gets the user in the door and then steps out of the way</b>. Everything
afterwards is an ordinary session cookie at the SP. That is why SAML has no concept of a refresh token and
why Single Logout is hard — the IdP has no idea how many local sessions its assertions created.</p>`,
docs:[['SAML profiles (OASIS)','http://docs.oasis-open.org/security/saml/v2.0/saml-profiles-2.0-os.pdf'],['IdP-initiated SSO risks','https://www.identityserver.com/articles/the-dangers-of-saml-idp-initiated-sso']],
ex:{title:'Build the SP-initiated redirect',
prompt:`Write <code>SamlRedirect</code> with <code>static String ssoUrl(String idpSso, String samlRequest, String relayState)</code> that returns the IdP SSO URL: <code>idpSso + "?SAMLRequest="</code> then the URL-encoded <code>samlRequest</code>, then <code>"&amp;RelayState="</code> then the URL-encoded <code>relayState</code> (use <code>java.net.URLEncoder.encode(v, "UTF-8")</code>). Declare <code>throws Exception</code>.`,
starter:`import java.net.URLEncoder;

public class SamlRedirect {
    static String ssoUrl(String idpSso, String samlRequest, String relayState) throws Exception {
        return null;
    }
}`,
tests:[{d:'carries the SAMLRequest',re:'\\?SAMLRequest='},{d:'carries RelayState (return-to)',re:'&RelayState='},{d:'URL-encodes both values',re:'URLEncoder\\.encode\\s*\\('}],
behavior:`ssoUrl("https://idp/sso","REQ","/dashboard") returns "https://idp/sso?SAMLRequest=REQ&RelayState=%2Fdashboard". This is the SP-initiated redirect; the IdP will echo RelayState back so the SP returns the user to /dashboard.`,
hints:['<code>idpSso + "?SAMLRequest=" + URLEncoder.encode(samlRequest, "UTF-8")</code>.','Append <code>"&RelayState=" + URLEncoder.encode(relayState, "UTF-8")</code>.','RelayState is how the SP remembers where the user was headed.'],
solution:`import java.net.URLEncoder;

public class SamlRedirect {
    static String ssoUrl(String idpSso, String samlRequest, String relayState) throws Exception {
        return idpSso + "?SAMLRequest=" + URLEncoder.encode(samlRequest, "UTF-8")
                + "&RelayState=" + URLEncoder.encode(relayState, "UTF-8");
    }
}`}},

{id:'sml3',title:'Bindings: how the message travels',body:`
<p>A <b>binding</b> is <i>how</i> a SAML message is carried over HTTP. Three matter:</p>
<!--flow:sml3-artifact-->
<h4>SAML Artifact binding — step by step</h4>
<div class="flowDia"><svg viewBox="0 0 680 254" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="SAML Artifact binding"><defs><marker id="sml3-artifact-ah-front" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent)"/></marker><marker id="sml3-artifact-ah-back" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent2)"/></marker><marker id="sml3-artifact-ah-attack" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--bad)"/></marker><marker id="sml3-artifact-ah-x" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--muted)"/></marker></defs><line x1="74" y1="42" x2="74" y2="222" class="fdLife"/><line x1="340" y1="42" x2="340" y2="222" class="fdLife"/><line x1="606" y1="42" x2="606" y2="222" class="fdLife"/><rect x="34.300000000000004" y="8" width="79.39999999999999" height="34" rx="8" class="fdActor"/><text x="74" y="29.5" class="fdActorT">Browser</text><rect x="301" y="8" width="78" height="34" rx="8" class="fdActor"/><text x="340" y="29.5" class="fdActorT">SP</text><rect x="567" y="8" width="78" height="34" rx="8" class="fdActor"/><text x="606" y="29.5" class="fdActorT">IdP</text><line x1="603" y1="90" x2="345" y2="90" stroke="var(--accent)" class="fdArrow" marker-end="url(#sml3-artifact-ah-front)"/><text x="458" y="81" class="fdLabel">redirect carrying a small artifact (a reference)</text><circle cx="588" cy="90" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="588" y="93.5" class="fdNumT" style="fill:var(--accent)">1</text><line x1="343" y1="120" x2="601" y2="120" stroke="var(--accent2)" class="fdArrow" marker-end="url(#sml3-artifact-ah-back)"/><text x="488" y="111" class="fdLabel">ArtifactResolve — SOAP, mutually authenticated</text><circle cx="358" cy="120" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="358" y="123.5" class="fdNumT" style="fill:var(--accent2)">2</text><line x1="603" y1="150" x2="345" y2="150" stroke="var(--accent2)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#sml3-artifact-ah-back)"/><text x="458" y="141" class="fdLabel">ArtifactResponse: the full Assertion</text><circle cx="588" cy="150" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="588" y="153.5" class="fdNumT" style="fill:var(--accent2)">3</text><rect x="237.9" y="167" width="204.2" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="348" y="182" class="fdSelfT">verify &amp; create the session</text><circle cx="237.9" cy="178" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="237.9" y="181.5" class="fdNumT" style="fill:var(--muted)">4</text><text x="340" y="204" class="fdNote">The assertion itself never crosses the browser — only a one-time reference does.</text><line x1="18" y1="240" x2="44" y2="240" stroke="var(--accent)" class="fdArrow"/><text x="50" y="244" class="fdLegend">front channel (via the browser)</text><line x1="271.29999999999995" y1="240" x2="297.29999999999995" y2="240" stroke="var(--accent2)" class="fdArrow"/><text x="303.29999999999995" y="244" class="fdLegend">back channel (server to server)</text></svg></div>
<ol class="fdSteps">
<li><b>IdP → SP:</b> redirect carrying a small artifact (a reference) <i>(front channel)</i></li>
<li><b>SP → IdP:</b> ArtifactResolve — SOAP, mutually authenticated <i>(back channel)</i></li>
<li><b>IdP → SP:</b> ArtifactResponse: the full Assertion <i>(back channel)</i></li>
<li><b>SP:</b> verify &amp; create the session</li>
</ol>
<!--/flow:sml3-artifact-->
<ul>
<li><b>HTTP-Redirect</b> — the message is <b>DEFLATE-compressed, base64-encoded, and URL-encoded</b> into a query parameter. Used for the (small) <code>AuthnRequest</code> because URLs have length limits. Signatures go in a separate query param.</li>
<li><b>HTTP-POST</b> — the message is base64-encoded into a hidden form field and <b>auto-submitted</b> by the browser. Used for the (larger, signed) <code>SAMLResponse</code>/assertion. No length limit; the XML Signature is inside the document.</li>
<li><b>HTTP-Artifact</b> — only a small <b>artifact</b> (a reference) goes through the browser; the SP then fetches the real assertion from the IdP over a <b>back channel</b>. Keeps the assertion off the front channel entirely.</li>
</ul>
<p>The Redirect binding's encoding is specific and worth doing once: <b>raw DEFLATE</b> (no zlib header, i.e. <code>nowrap=true</code>) → base64 → URL-encode.</p>
<div class="codeSample" data-hl>Deflater d = new Deflater(Deflater.DEFLATED, true);   // nowrap=true = raw DEFLATE
d.setInput(xml.getBytes("UTF-8")); d.finish();
// read deflated bytes -> base64 -> URLEncoder.encode(...)  == the SAMLRequest param</div>

<h4>Why "binding" is a word at all</h4>
<p>SAML defines <i>what</i> the messages say. A <b>binding</b> defines <i>how</i> they travel. The two are
separate on purpose, and the separation is why the same assertion can arrive as a URL parameter, a form
field, or a back-channel fetch without changing its contents.</p>
<p>There is a practical constraint driving the choice. Everything here goes <b>through the browser</b>, and
a browser can carry a message two ways: in the URL of a redirect, or in the body of a form it submits. URLs
have length limits — historically around 2000 characters, and enforced by proxies and servers you do not
control — while a form body does not. So the small message goes in the URL and the big one goes in a
form.</p>

<div class="codeSample" data-hl>HTTP-Redirect   the AuthnRequest (small)
  DEFLATE (raw, no zlib header) -> base64 -> URL-encode -> query param
  the signature travels in SEPARATE params: SigAlg and Signature,
  computed over the encoded query string, NOT over the XML.

HTTP-POST       the Response and assertion (large, signed)
  base64 -> a hidden form field -> auto-submitted by JavaScript
  the XML Signature is INSIDE the document.

HTTP-Artifact   neither - just a reference
  a short "artifact" goes through the browser; the SP then fetches the
  real assertion from the IdP over a back channel it opens itself.
  the assertion never touches the browser at all.</div>

<h4>The compression detail that costs people an afternoon</h4>
<p>The Redirect binding uses <b>raw DEFLATE</b> — the compressed bytes with no zlib header and no checksum.
Most standard-library helpers add that header by default, and the resulting parameter looks plausible,
base64-decodes fine, and is rejected by the IdP with an unhelpful error.</p>
<div class="codeSample" data-hl>// Java: the second argument is what matters
Deflater d = new Deflater(Deflater.DEFLATED, true);   // nowrap = TRUE
// Python: a negative window size means "no header"
zlib.compressobj(9, zlib.DEFLATED, -15)
// Node:
zlib.deflateRawSync(xml)     // deflateRaw, not deflate</div>

<h4>Where the signature lives changes what you verify</h4>
<p>This is the part that actually matters. Under <b>Redirect</b>, the signature covers the
<i>encoded query string</i> — so it must be verified against exactly the bytes as sent, in the specified
parameter order, before anything is decoded. Re-encoding first and verifying afterwards is a classic
implementation bug, because two different encodings of the same XML produce different signatures.</p>
<p>Under <b>POST</b>, the XML Signature is inside the document, which is where XML Signature Wrapping
becomes possible — the attack the signing lesson takes apart. Different binding, different failure mode,
same underlying rule: <b>verify the exact thing that was signed</b>.</p>

<h4>Artifact, and why it is rare</h4>
<p>The Artifact binding is genuinely more secure — nothing sensitive passes through the browser at all, so
there is no assertion to capture from history, a Referer header, or a compromised extension. It is also
rarely used, because it requires the SP to make a direct, authenticated back-channel call to the IdP, which
means network reachability and mutual trust that a browser-only integration does not. Recognise it, expect
POST.</p>`,
docs:[['SAML bindings (OASIS)','http://docs.oasis-open.org/security/saml/v2.0/saml-bindings-2.0-os.pdf'],['java.util.zip.Deflater','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/zip/Deflater.html']],
ex:{title:'Encode an AuthnRequest for the Redirect binding',
prompt:`Write <code>Redirect</code> with <code>static String encode(String xml)</code> that produces the HTTP-Redirect value: raw-DEFLATE the UTF-8 XML with <code>new Deflater(Deflater.DEFLATED, true)</code>, base64-encode the compressed bytes with <code>Base64.getEncoder()</code>, then <code>URLEncoder.encode(..., "UTF-8")</code> the result. Declare <code>throws Exception</code>. (Read the deflated bytes into a <code>ByteArrayOutputStream</code>.)`,
starter:`import java.io.ByteArrayOutputStream;
import java.net.URLEncoder;
import java.util.Base64;
import java.util.zip.Deflater;

public class Redirect {
    static String encode(String xml) throws Exception {
        return null;
    }
}`,
tests:[{d:'raw DEFLATE (nowrap=true)',re:'new\\s+Deflater\\s*\\(\\s*Deflater\\.DEFLATED\\s*,\\s*true\\s*\\)'},{d:'feeds the XML in',re:'setInput\\s*\\(|\\.finish\\s*\\('},{d:'base64-encodes the compressed bytes',re:'Base64\\.getEncoder\\s*\\(\\s*\\)'},{d:'URL-encodes the result',re:'URLEncoder\\.encode\\s*\\('}],
behavior:`encode("<AuthnRequest.../>") returns a URL-safe string that, reversed (URL-decode → base64-decode → inflate with nowrap), yields the original XML. The nowrap=true flag is essential — SAML uses raw DEFLATE, not zlib-wrapped.`,
hints:['<code>Deflater d=new Deflater(Deflater.DEFLATED,true); d.setInput(xml.getBytes("UTF-8")); d.finish();</code>','Drain it: <code>while(!d.finished()){int n=d.deflate(buf); out.write(buf,0,n);}</code> then <code>d.end();</code>','<code>return URLEncoder.encode(Base64.getEncoder().encodeToString(out.toByteArray()), "UTF-8");</code>'],
solution:`import java.io.ByteArrayOutputStream;
import java.net.URLEncoder;
import java.util.Base64;
import java.util.zip.Deflater;

public class Redirect {
    static String encode(String xml) throws Exception {
        Deflater d = new Deflater(Deflater.DEFLATED, true);   // raw DEFLATE
        d.setInput(xml.getBytes("UTF-8"));
        d.finish();
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        byte[] buf = new byte[4096];
        while (!d.finished()) {
            int n = d.deflate(buf);
            out.write(buf, 0, n);
        }
        d.end();
        String b64 = Base64.getEncoder().encodeToString(out.toByteArray());
        return URLEncoder.encode(b64, "UTF-8");
    }
}`}},

{id:'sml4',title:'Metadata & establishing trust',body:`
<p>Before any SSO works, the SP and IdP must <b>trust</b> each other. They do it by exchanging <b>metadata</b> — an XML document each side publishes describing itself:</p>
<ul>
<li><b>entityID</b> — the party's unique identifier (usually a URL). The audience/issuer names must match these.</li>
<li><b>Signing certificate(s)</b> — the IdP's public cert, so the SP can verify assertion signatures. This is the root of trust (PKI, next stream).</li>
<li><b>Endpoints</b> — the IdP's <b>SSO</b> URL; the SP's <b>ACS</b> (Assertion Consumer Service) and <b>SLO</b> (Single Logout) URLs; supported bindings.</li>
</ul>
<p>Setup = the SP imports the IdP's metadata and vice-versa. From then on, the SP accepts assertions whose <code>Issuer</code> equals the IdP's entityID and whose signature verifies against the metadata cert. <b>Certificate rotation is a common operational task</b>: when the IdP rotates its signing key, its metadata must be re-shared or the SP will reject new assertions (a frequent outage cause — publish both old+new during rollover).</p>
<div class="codeSample" data-hl>&lt;EntityDescriptor entityID="https://idp.example.com/saml"&gt;
  &lt;IDPSSODescriptor&gt;
    &lt;KeyDescriptor use="signing"&gt; ...X.509 cert... &lt;/KeyDescriptor&gt;
    &lt;SingleSignOnService Binding="...HTTP-Redirect" Location="https://idp.example.com/sso"/&gt;
  &lt;/IDPSSODescriptor&gt;
&lt;/EntityDescriptor&gt;</div>

<h4>What "establishing trust" actually means here</h4>
<p>There is no registry, no discovery protocol and nothing automatic. Two organisations decide to trust each
other and <b>exchange XML documents describing themselves</b>. That exchange is the entire trust
establishment, and it is usually done by a human pasting a URL into an admin console.</p>
<p>Once done, the SP's rule is simple: accept an assertion whose <code>Issuer</code> equals the IdP's
<code>entityID</code> and whose signature verifies against the certificate in that IdP's metadata. Nothing
else grants trust, which is what makes the metadata document the most important file in the
integration.</p>

<div class="codeSample" data-hl>&lt;EntityDescriptor entityID="https://idp.corp.com/saml"&gt;   &lt;!-- the NAME --&gt;
  &lt;IDPSSODescriptor protocolSupportEnumeration="...:2.0:protocol"&gt;
    &lt;KeyDescriptor use="signing"&gt;
      ... X.509 certificate ...        &lt;!-- THE ROOT OF TRUST --&gt;
    &lt;/KeyDescriptor&gt;
    &lt;SingleSignOnService Binding="...HTTP-Redirect"
                         Location="https://idp.corp.com/sso"/&gt;
    &lt;SingleLogoutService Binding="...HTTP-POST"
                         Location="https://idp.corp.com/slo"/&gt;
  &lt;/IDPSSODescriptor&gt;
&lt;/EntityDescriptor&gt;

// the SP publishes the mirror image: its own entityID, its ACS URL,
// and its certificate if it signs requests or wants encrypted assertions.</div>

<h4>entityID is a name, not an address</h4>
<p>It looks like a URL and it is an <b>identifier</b>. Nobody fetches it, it does not have to resolve, and
changing it breaks the integration even if the service is unmoved — because the SP is matching a string.
Two consequences: pick one at the start and never change it, and do not assume you can reach it.</p>

<h4>Certificate rotation: the outage everyone has</h4>
<p>The IdP's signing certificate expires. Somebody renews it. Every SP still holds the old one in its
metadata, so every assertion now fails signature verification and <b>all SSO stops at once</b> — for every
application, simultaneously, usually early in the morning.</p>
<div class="codeSample" data-hl>// what makes rotation survivable: publish BOTH keys during the overlap.
&lt;KeyDescriptor use="signing"&gt; ... NEW cert ... &lt;/KeyDescriptor&gt;
&lt;KeyDescriptor use="signing"&gt; ... OLD cert ... &lt;/KeyDescriptor&gt;

// and a well-behaved SP accepts an assertion signed by ANY signing key
// in the IdP's metadata - which is what turns a hard cutover into a
// window. the sequence:
//   1. IdP publishes both      2. SPs refresh their metadata
//   3. IdP switches to signing with the new one
//   4. after everyone has refreshed, the old one is removed</div>
<p>The reason this bites so often is that most SPs load metadata <b>once, by hand, at integration time</b>
and never look again. If a product supports a metadata <i>URL</i> with periodic refresh, use it — that
single setting converts a coordinated multi-team cutover into something that happens by itself.</p>

<h4>The operational advice</h4>
<p><b>Track expiry dates as an inventory</b>, with owners and alerts months ahead, not days. <b>Prefer a
metadata URL over an uploaded file</b> everywhere it is offered. And <b>fetch metadata over HTTPS from a
host you verified</b> — the document contains the certificate that defines who you trust, so accepting one
over an unauthenticated channel hands an attacker the ability to become your IdP.</p>`,
docs:[['SAML metadata (OASIS)','http://docs.oasis-open.org/security/saml/v2.0/saml-metadata-2.0-os.pdf'],['SAML metadata explained','https://www.samltool.com/idp_metadata.php']],
ex:{title:'Trust: match issuer to the configured IdP',
prompt:`Write <code>SamlTrust</code> with: <code>static String entityId(String metadataXml)</code> returning the value of the first <code>entityID="..."</code> attribute (find <code>entityID="</code>, then the text up to the next <code>"</code>); and <code>static boolean issuerTrusted(String assertionIssuer, String idpEntityId)</code> returning <code>idpEntityId.equals(assertionIssuer)</code>.`,
starter:`public class SamlTrust {
    static String entityId(String metadataXml) {
        return null;
    }
    static boolean issuerTrusted(String assertionIssuer, String idpEntityId) {
        return false;
    }
}`,
tests:[{d:'looks for the entityID attribute',re:'entityID='},{d:'uses indexOf to locate it',re:'indexOf\\s*\\('},{d:'extracts the attribute value',re:'substring\\s*\\('},{d:'trust compares issuer to the configured entityID',re:'idpEntityId\\s*\\.\\s*equals\\s*\\(\\s*assertionIssuer\\s*\\)'}],
behavior:`entityId of an EntityDescriptor with entityID="https://idp/saml" returns "https://idp/saml". issuerTrusted(assertionIssuer, idpEntityId) is true only when the assertion's Issuer exactly equals the IdP entityID from the imported metadata — the basis of SAML trust (plus the signature check).`,
hints:['Find the marker text <code>entityID=</code> with <code>indexOf</code>, then move past it to the start of the value.','The value ends at the next double-quote — find it with <code>indexOf</code> from that position, then take the <code>substring</code>.','Trust is exact-match of the assertion Issuer to the configured entityID.'],
solution:`public class SamlTrust {
    static String entityId(String metadataXml) {
        String marker = "entityID=\\"";
        int a = metadataXml.indexOf(marker);
        if (a < 0) return null;
        a += marker.length();
        int b = metadataXml.indexOf('"', a);
        return metadataXml.substring(a, b);
    }
    static boolean issuerTrusted(String assertionIssuer, String idpEntityId) {
        return idpEntityId.equals(assertionIssuer);
    }
}`}},

{id:'sml5',title:'Signing, encryption, SLO & choosing SAML vs OIDC',body:`
<p>Three more essentials, then the decision:</p>
<!--flow:sml5-slo-->
<h4>SP-initiated Single Logout — step by step</h4>
<div class="flowDia"><svg viewBox="0 0 720 326" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="SP-initiated Single Logout"><defs><marker id="sml5-slo-ah-front" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent)"/></marker><marker id="sml5-slo-ah-back" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--accent2)"/></marker><marker id="sml5-slo-ah-attack" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--bad)"/></marker><marker id="sml5-slo-ah-x" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="var(--muted)"/></marker></defs><line x1="74" y1="54" x2="74" y2="294" class="fdLife"/><line x1="264.66666666666663" y1="54" x2="264.66666666666663" y2="294" class="fdLife"/><line x1="455.3333333333333" y1="54" x2="455.3333333333333" y2="294" class="fdLife"/><line x1="646" y1="54" x2="646" y2="294" class="fdLife"/><rect x="34.300000000000004" y="8" width="79.39999999999999" height="46" rx="8" class="fdActor"/><text x="74" y="35.5" class="fdActorT">Browser</text><rect x="225.66666666666663" y="8" width="78" height="46" rx="8" class="fdActor"/><text x="264.66666666666663" y="27" class="fdActorT">SP A</text><text x="264.66666666666663" y="42" class="fdActorS">logout starts here</text><rect x="416.3333333333333" y="8" width="78" height="46" rx="8" class="fdActor"/><text x="455.3333333333333" y="35.5" class="fdActorT">IdP</text><rect x="607" y="8" width="78" height="46" rx="8" class="fdActor"/><text x="646" y="27" class="fdActorT">SP B</text><text x="646" y="42" class="fdActorS">also signed in</text><line x1="77" y1="102" x2="259.66666666666663" y2="102" stroke="var(--accent)" class="fdArrow" marker-end="url(#sml5-slo-ah-front)"/><text x="184.33333333333331" y="93" class="fdLabel">user clicks “log out”</text><circle cx="92" cy="102" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="92" y="105.5" class="fdNumT" style="fill:var(--accent)">1</text><line x1="267.66666666666663" y1="132" x2="450.3333333333333" y2="132" stroke="var(--accent)" class="fdArrow" marker-end="url(#sml5-slo-ah-front)"/><text x="375" y="123" class="fdLabel">signed LogoutRequest</text><circle cx="282.66666666666663" cy="132" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="282.66666666666663" y="135.5" class="fdNumT" style="fill:var(--accent)">2</text><rect x="297.1333333333333" y="149" width="316.4" height="22" rx="11" class="fdSelf" style="stroke:var(--muted)"/><text x="463.3333333333333" y="164" class="fdSelfT">ends the IdP session; finds other active SPs</text><circle cx="297.1333333333333" cy="160" r="9" class="fdNum" style="stroke:var(--muted)"/><text x="297.1333333333333" y="163.5" class="fdNumT" style="fill:var(--muted)">3</text><line x1="458.3333333333333" y1="198" x2="641" y2="198" stroke="var(--accent2)" class="fdArrow" marker-end="url(#sml5-slo-ah-back)"/><text x="565.6666666666666" y="189" class="fdLabel">LogoutRequest (SOAP back channel or via browser)</text><circle cx="473.3333333333333" cy="198" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="473.3333333333333" y="201.5" class="fdNumT" style="fill:var(--accent2)">4</text><line x1="643" y1="228" x2="460.3333333333333" y2="228" stroke="var(--accent2)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#sml5-slo-ah-back)"/><text x="535.6666666666666" y="219" class="fdLabel">LogoutResponse — session B ended</text><circle cx="628" cy="228" r="9" class="fdNum" style="stroke:var(--accent2)"/><text x="628" y="231.5" class="fdNumT" style="fill:var(--accent2)">5</text><line x1="452.3333333333333" y1="258" x2="269.66666666666663" y2="258" stroke="var(--accent)" class="fdArrow" stroke-dasharray="4 4" marker-end="url(#sml5-slo-ah-front)"/><text x="345" y="249" class="fdLabel">LogoutResponse — all done</text><circle cx="437.3333333333333" cy="258" r="9" class="fdNum" style="stroke:var(--accent)"/><text x="437.3333333333333" y="261.5" class="fdNumT" style="fill:var(--accent)">6</text><text x="360" y="276" class="fdNote">One unreachable SP is why SLO is “best effort” — see the Sessions stream.</text><line x1="18" y1="312" x2="44" y2="312" stroke="var(--accent)" class="fdArrow"/><text x="50" y="316" class="fdLegend">front channel (via the browser)</text><line x1="271.29999999999995" y1="312" x2="297.29999999999995" y2="312" stroke="var(--accent2)" class="fdArrow"/><text x="303.29999999999995" y="316" class="fdLegend">back channel (server to server)</text></svg></div>
<ol class="fdSteps">
<li><b>Browser → SP A:</b> user clicks “log out” <i>(front channel)</i></li>
<li><b>SP A → IdP:</b> signed LogoutRequest <i>(front channel)</i></li>
<li><b>IdP:</b> ends the IdP session; finds other active SPs</li>
<li><b>IdP → SP B:</b> LogoutRequest (SOAP back channel or via browser) <i>(back channel)</i></li>
<li><b>SP B → IdP:</b> LogoutResponse — session B ended <i>(back channel)</i></li>
<li><b>IdP → SP A:</b> LogoutResponse — all done <i>(front channel)</i></li>
</ol>
<!--/flow:sml5-slo-->
<ul>
<li><b>Signing</b> (always) — the IdP signs the assertion/response with <b>XML Signature</b>; the SP verifies with the metadata cert. Without a valid signature the assertion is worthless. The SP must also check the <b>Conditions</b>: <code>NotOnOrAfter</code> (not expired) and <code>Audience</code> (this SP) — the SAML <code>exp</code>/<code>aud</code>.</li>
<li><b>Encryption</b> (optional) — the IdP can <b>encrypt</b> the assertion (XML Encryption) to the SP's public key so intermediaries/the browser can't read it. Analogous to JWE vs JWS: sign for integrity, encrypt for confidentiality.</li>
<li><b>Single Logout (SLO)</b> — log the user out of the IdP <i>and</i> all SPs in one action. Attractive on paper and notoriously fiddly (every SP must be reachable and cooperate), so many deployments rely on short sessions instead.</li>
</ul>
<p><b>SAML or OIDC?</b></p>
<ul>
<li><b>SAML</b> — enterprise/workforce web SSO, especially with legacy apps and IdPs that speak it; browser-based, XML.</li>
<li><b>OIDC</b> — modern web/mobile/SPA and <b>APIs</b>; JSON/JWT, works cleanly with OAuth for API authorization, lighter for native/mobile. Prefer OIDC for new build; use SAML to integrate where it's already the standard.</li>
</ul>
<div class="codeSample" data-hl>// the SP's non-negotiable checks on a received assertion:
// 1) XML Signature verifies against the IdP metadata cert
// 2) Conditions NotOnOrAfter is in the future   (not expired)
// 3) AudienceRestriction Audience == this SP's entityID</div>

<h4>"The signature verified" is not the same as "the assertion is valid"</h4>
<p>This is the single most important thing to understand about SAML security, and it is where real
implementations have repeatedly failed. XML Signature does not sign a document — it signs a
<b>reference to an element</b>, identified by ID. Verification therefore answers "was <i>some</i>
element in this document signed by the IdP?", not "is the element I am about to read the signed
one?".</p>
<p><b>XML Signature Wrapping (XSW)</b> exploits exactly that gap. The attacker takes a legitimately
signed assertion, wraps it somewhere the parser will ignore, and inserts a forged assertion where the
application will look:</p>
<div class="codeSample" data-hl>&lt;Response&gt;
  &lt;Extensions&gt;
    &lt;Assertion ID="_abc"&gt;              &lt;-- the REAL, signed one, moved out of the way
      &lt;Subject&gt;jane@corp.com&lt;/Subject&gt;
      &lt;Signature URI="#_abc"/&gt;         &lt;-- still verifies perfectly
    &lt;/Assertion&gt;
  &lt;/Extensions&gt;
  &lt;Assertion ID="_evil"&gt;               &lt;-- FORGED, unsigned
    &lt;Subject&gt;admin@corp.com&lt;/Subject&gt;  &lt;-- what the app actually reads
  &lt;/Assertion&gt;
&lt;/Response&gt;

// the signature library says VALID (it found and checked #_abc)
// the application says "welcome, admin"
// two components, two different answers to "which assertion?" - that is the bug</div>
<p>The 2018 Duo Labs research found this class of flaw in multiple mainstream SAML libraries at once,
which tells you it is a design trap rather than a series of careless mistakes. The defences: verify the
signature and read the claims from <b>the same node reference</b>, reject documents containing more than
one assertion, resolve IDs strictly, disable DTD processing and entity expansion, and never re-parse the
document after validating it.</p>

<h4>Replay, and what <code>InResponseTo</code> is for</h4>
<p>A signed assertion stays cryptographically valid until <code>NotOnOrAfter</code> passes. If the SP does
nothing else, anyone who captures one can present it again inside that window. Three checks close
this:</p>
<ul>
<li><b><code>InResponseTo</code></b> must equal the <code>ID</code> of the <code>AuthnRequest</code> this
SP actually sent, and that request must be one this session is waiting on. This is what
SP-initiated flow buys you and what IdP-initiated flow gives up — an unsolicited assertion has no
request to correlate against, which is the concrete reason it is discouraged.</li>
<li><b>Replay cache.</b> Record each assertion <code>ID</code> until its <code>NotOnOrAfter</code> passes
and reject any repeat. The validity window should be minutes, not hours.</li>
<li><b>Recipient / Destination</b> must match this SP's ACS URL, so an assertion minted for another
endpoint cannot be redirected here.</li>
</ul>

<h4>Golden SAML</h4>
<p>One structural weakness has no protocol fix. The IdP's <b>signing private key</b> can mint an assertion
for any user, for any SP, with any attributes — and the SPs will accept it, because that is precisely
what they were configured to trust. An attacker who steals that key (the ADFS token-signing certificate
being the classic target, as seen in the SolarWinds intrusions) can impersonate anyone, indefinitely,
<b>without touching the IdP again</b> — so there is nothing in the IdP's logs and disabling the account
does not help.</p>
<p>That is why the signing key belongs in an HSM, why access to it is a PAM-grade control, and why key
rotation is a genuine incident-response step rather than hygiene. It also explains the shape of the
mitigations that do exist: short assertion lifetimes, monitoring SP-side authentications that have no
corresponding IdP login event, and not treating "the signature verified" as the end of the
conversation.`,
docs:[['Duo Labs - SAML XML signature wrapping','https://duo.com/blog/duo-finds-saml-vulnerabilities-affecting-multiple-implementations'],['CISA AA21-008A - Golden SAML / token-signing key abuse','https://www.cisa.gov/news-events/cybersecurity-advisories/aa21-008a'],['XML Signature / Encryption in SAML','http://docs.oasis-open.org/security/saml/v2.0/saml-core-2.0-os.pdf'],['SAML vs OIDC (Auth0)','https://auth0.com/intro-to-iam/saml-vs-oidc']],
ex:{title:'Validate the assertion conditions',
prompt:`Write <code>Assertion</code> with <code>static boolean acceptable(boolean signatureValid, String audience, long notOnOrAfterEpoch, String myEntityId, long nowEpoch)</code> that returns <code>true</code> only if the signature is valid, <code>myEntityId.equals(audience)</code>, and it is not expired (<code>nowEpoch &lt; notOnOrAfterEpoch</code>).`,
starter:`public class Assertion {
    static boolean acceptable(boolean signatureValid, String audience,
                              long notOnOrAfterEpoch, String myEntityId, long nowEpoch) {
        return false;
    }
}`,
tests:[{d:'requires a valid signature',re:'signatureValid'},{d:'checks the audience is this SP',re:'myEntityId\\s*\\.\\s*equals\\s*\\(\\s*audience\\s*\\)'},{d:'checks not-on-or-after (expiry)',re:'nowEpoch\\s*<\\s*notOnOrAfterEpoch|notOnOrAfterEpoch\\s*>\\s*nowEpoch'}],
behavior:`acceptable returns true only when all three hold: the IdP's signature verified, the assertion is addressed to this SP (Audience == our entityID), and it hasn't expired. Drop any one — bad signature, wrong audience, or past NotOnOrAfter — and the SP must reject it.`,
hints:['One boolean expression: <code>signatureValid &amp;&amp; myEntityId.equals(audience) &amp;&amp; nowEpoch &lt; notOnOrAfterEpoch</code>.','Audience is the SAML version of the JWT <code>aud</code> claim.','NotOnOrAfter is the SAML expiry — reject once now reaches it.'],
solution:`public class Assertion {
    static boolean acceptable(boolean signatureValid, String audience,
                              long notOnOrAfterEpoch, String myEntityId, long nowEpoch) {
        return signatureValid
                && myEntityId.equals(audience)
                && nowEpoch < notOnOrAfterEpoch;
    }
}`}},

{id:'sml6',title:'Migrating from SAML to OIDC without a flag day',body:`
<p>Plenty of working SAML deployments will outlive the people who built them, and that is fine — SAML is
not broken. But new applications are built against OIDC, mobile and single-page apps fit it badly through
SAML, and eventually an organisation ends up running both. This lesson is about getting from one to the
other while people keep logging in.</p>
<p>The first thing to establish is that there is no flag day. Anyone proposing "we switch on Saturday" is
proposing to discover every undocumented integration at once, at the weekend.</p>

<h4>What actually has to move</h4>
<p>The protocol swap is the easy part. What makes migrations long is everything attached to it:</p>
<ul>
<li><b>The identifier.</b> SAML gives you a <code>NameID</code>; OIDC gives you a <code>sub</code>. They
are usually <i>different values for the same person</i>, and if the application stored the NameID as its
user key, the OIDC login looks like a brand new user.</li>
<li><b>The attribute contract.</b> SAML attribute names are URIs by convention
(<code>http://schemas.xmlsoap.org/.../emailaddress</code>); OIDC claims are short names
(<code>email</code>). Every mapping has to be restated, and applications tend to depend on attributes
nobody documented.</li>
<li><b>Session and logout behaviour.</b> SAML single logout and OIDC front- or back-channel logout are not
equivalent, and a partially migrated estate can leave a user signed out of some applications and not
others.</li>
<li><b>The long tail.</b> The applications nobody owns, the service that authenticates through SAML for one
nightly job, the vendor whose OIDC support is "on the roadmap".</li>
</ul>

<h4>The strategy that works: run both, migrate per application</h4>
<p>Support both protocols simultaneously against one user population, and move applications one at a time.
Two shapes do this well. Either the IdP speaks both — most do — or you put a <b>broker</b> in the middle
that is a SAML SP upstream and an OIDC provider downstream, which lets applications migrate without the
IdP changing at all.</p>
<p>Then, per application: enable OIDC alongside SAML, move a pilot group, verify that the <i>same human</i>
resolves to the <i>same account</i>, cut the rest over, and only then remove the SAML integration. The
removal is a separate change, deliberately, so a rollback is a configuration flip rather than a rebuild.</p>

<h4>The identity-linking rule, which is where migrations go wrong</h4>
<p>During the overlap the same person can arrive as a SAML assertion or an OIDC token, and something must
decide they are one account. The tempting shortcut is to match on email address. Do not.</p>
<p>Email is mutable, reassignable, and — critically — asserted by whichever side is speaking. Auto-linking
on it means anyone able to influence an email claim can attach themselves to an existing account. The
correct approach is an explicit <b>link table</b>: a row per protocol identifier pointing at one internal
account, populated deliberately — from a directory export, from a first login that was verified another
way, or from an administrator's action. Unknown identifier means no account, not "probably this one".</p>
<p>This is also the reason to key applications on an internal account id rather than on whatever the
protocol handed them. Estates that did that migrate in weeks; estates that stored NameIDs everywhere spend
a year finding them.</p>

<h4>Knowing when you are finished</h4>
<p>Instrument the login path by protocol before you start, so "SAML logins last week" is a number rather
than an opinion. The migration is done when that number reaches zero for an application, and the SAML
integration is removed <i>after</i> a quiet period rather than at the same moment — because the traffic you
cannot see is the traffic that will page you.</p>`,
docs:[['OpenID Connect Core','https://openid.net/specs/openid-connect-core-1_0.html'],['SAML 2.0 core (assertions and NameID)','https://docs.oasis-open.org/security/saml/v2.0/saml-core-2.0-os.pdf'],['NIST SP 800-63C — federation assurance','https://pages.nist.gov/800-63-3/sp800-63c.html']],
ex:{title:'Resolve one human across two protocols',lang:'js',
run:{call:'resolveAccount',cases:[{name:'a known SAML identifier',args:[{protocol:'saml',id:'ada@acme.com',email:'ada@acme.com'},[{protocol:'saml',id:'ada@acme.com',accountId:'acct-1'},{protocol:'oidc',id:'sub-9911',accountId:'acct-1'}]],expect:'acct-1'},{name:'a known OIDC subject reaches the same account',args:[{protocol:'oidc',id:'sub-9911',email:'ada@acme.com'},[{protocol:'saml',id:'ada@acme.com',accountId:'acct-1'},{protocol:'oidc',id:'sub-9911',accountId:'acct-1'}]],expect:'acct-1'},{name:'an unknown subject is NOT linked by matching email',args:[{protocol:'oidc',id:'sub-0000',email:'ada@acme.com'},[{protocol:'saml',id:'ada@acme.com',accountId:'acct-1'},{protocol:'oidc',id:'sub-9911',accountId:'acct-1'}]],expect:null},{name:'the same string under the wrong protocol does not match',args:[{protocol:'oidc',id:'ada@acme.com',email:'ada@acme.com'},[{protocol:'saml',id:'ada@acme.com',accountId:'acct-1'}]],expect:null},{name:'no links at all',args:[{protocol:'saml',id:'ada@acme.com',email:'ada@acme.com'},[]],expect:null}]},
prompt:`Write <code>function resolveAccount(claim, links)</code> returning the internal account id for an arriving login, or <code>null</code>. A link is <code>{ protocol, id, accountId }</code> and matches only when <b>both</b> the protocol and the identifier match. The <code>email</code> on the claim is deliberately present and must not be used — auto-linking on email is the vulnerability this exercise exists to prevent.`,
starter:`function resolveAccount(claim, links) {
  return null;
}`,
solution:`function resolveAccount(claim, links) {
  const hit = links.find(l => l.protocol === claim.protocol && l.id === claim.id);
  return hit ? hit.accountId : null;   // unknown identifier: no account, never a guess
}`,
tests:[{d:'the protocol is part of the match',re:'claim\\.protocol'},{d:'the identifier is part of the match',re:'claim\\.id'},{d:'an unmatched login returns null',re:'null'},{d:'the email claim is never used to find an account',re:'^(?!.*claim\\.email)',flags:'s'}],
behavior:`Five cases execute. Case three is the security property: the email matches an existing account exactly, and the correct answer is still null. A migration that auto-links on email lets anyone who can influence an email claim attach themselves to an existing account — and during a migration there are two protocols asserting it, which doubles the opportunity. Case four is the subtler one: the same string can be a SAML NameID for one person and an OIDC subject for another, so the protocol is part of the key rather than decoration. The cost of doing this properly is that links must be populated deliberately, which is real work and is the actual content of a migration plan.`,
hints:['A link matches on two fields, not one.','The email is on the claim to tempt you. Leave it alone.','An identifier you have never seen is not evidence about which account it belongs to.']}}
]});
