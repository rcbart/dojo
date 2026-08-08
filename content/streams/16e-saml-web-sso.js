STREAMS.push({icon:'🎫',title:'SAML 2.0 & Web SSO',blurb:'The enterprise SSO workhorse: SAML assertions, SP- vs IdP-initiated flows, the HTTP bindings (Redirect/POST/Artifact), metadata & trust, signing/encryption and Single Logout — and when to choose SAML vs OIDC.',lessons:[

{id:'sml1',title:'What SAML is & the assertion',body:`
<p><b>SAML 2.0</b> (Security Assertion Markup Language) is the older, XML-based federation standard that still runs most <b>enterprise web SSO</b>. Same idea as OIDC — an <b>IdP</b> vouches for a user to a <b>Service Provider (SP)</b> — but the message is an XML <b>assertion</b> instead of a JWT.</p>
<p>The three statement types inside an assertion, and the parts that matter:</p>
<ul>
<li><b>Authentication statement</b> — "this subject authenticated at this time, using this method."</li>
<li><b>Attribute statement</b> — user attributes (email, groups, department) the SP uses.</li>
<li><b>NameID</b> — the subject identifier (the "who"), like OIDC's <code>sub</code>.</li>
<li><b>Conditions</b> — validity window (<code>NotBefore</code>/<code>NotOnOrAfter</code>) and <b>Audience</b> (which SP it's for) — the SAML equivalents of <code>exp</code>/<code>aud</code>.</li>
</ul>
<p>The assertion is <b>signed by the IdP</b> (XML Signature) so the SP can trust it. SAML vs OIDC in one line: <b>SAML = XML assertions over browser POST/redirect, enterprise SSO; OIDC = JSON/JWT over OAuth, modern apps &amp; APIs.</b></p>
<div class="codeSample" data-hl>&lt;saml:Assertion&gt;
  &lt;saml:Subject&gt;&lt;saml:NameID&gt;jane@corp.com&lt;/saml:NameID&gt;&lt;/saml:Subject&gt;
  &lt;saml:Conditions NotOnOrAfter="2026-01-01T00:05:00Z"&gt;
    &lt;saml:AudienceRestriction&gt;&lt;saml:Audience&gt;https://app.example.com&lt;/saml:Audience&gt;
  &lt;/saml:Conditions&gt;
  &lt;saml:AttributeStatement&gt; ... groups, email ... &lt;/saml:AttributeStatement&gt;
&lt;/saml:Assertion&gt;   &lt;!-- signed by the IdP --&gt;</div>`,
docs:[['SAML 2.0 (OASIS)','http://docs.oasis-open.org/security/saml/v2.0/saml-core-2.0-os.pdf'],['Okta — What is SAML?','https://www.okta.com/integrate/documentation/saml/'],['SAML vs OIDC','https://www.okta.com/identity-101/saml-vs-oidc/']],
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
<ul>
<li><b>SP-initiated</b> (the common, recommended one): the user starts at the <b>app</b> (SP). The unauthenticated app builds a <b>SAMLRequest</b> (an <code>AuthnRequest</code>) and redirects the browser to the IdP. The user logs in; the IdP posts a signed assertion back to the SP's <b>ACS</b> (Assertion Consumer Service) URL. Because the SP started it, it can carry the user back to exactly where they were.</li>
<li><b>IdP-initiated</b>: the user starts at the <b>IdP</b> (e.g. an app portal / dashboard) and clicks the app tile. The IdP posts an <b>unsolicited</b> assertion straight to the SP's ACS — there was no AuthnRequest. Convenient, but riskier (no request to correlate against, a known vector for assertion-injection/CSRF-style attacks), so it's often discouraged or hardened.</li>
</ul>
<p><b>RelayState</b> is the "where to go back to" value: in SP-initiated flow the SP sends it with the request and the IdP echoes it back, so the SP can return the user to the original page. (In IdP-initiated flow it's a target URL the IdP supplies.)</p>
<div class="codeSample" data-hl>// SP-initiated: app -> IdP  (front channel redirect)
GET https://idp.example.com/sso?SAMLRequest=...deflated+base64...&RelayState=/dashboard
// IdP then POSTs a signed assertion to the SP's ACS:
POST https://app.example.com/saml/acs   (SAMLResponse=..., RelayState=/dashboard)</div>`,
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
<ul>
<li><b>HTTP-Redirect</b> — the message is <b>DEFLATE-compressed, base64-encoded, and URL-encoded</b> into a query parameter. Used for the (small) <code>AuthnRequest</code> because URLs have length limits. Signatures go in a separate query param.</li>
<li><b>HTTP-POST</b> — the message is base64-encoded into a hidden form field and <b>auto-submitted</b> by the browser. Used for the (larger, signed) <code>SAMLResponse</code>/assertion. No length limit; the XML Signature is inside the document.</li>
<li><b>HTTP-Artifact</b> — only a small <b>artifact</b> (a reference) goes through the browser; the SP then fetches the real assertion from the IdP over a <b>back channel</b>. Keeps the assertion off the front channel entirely.</li>
</ul>
<p>The Redirect binding's encoding is specific and worth doing once: <b>raw DEFLATE</b> (no zlib header, i.e. <code>nowrap=true</code>) → base64 → URL-encode.</p>
<div class="codeSample" data-hl>Deflater d = new Deflater(Deflater.DEFLATED, true);   // nowrap=true = raw DEFLATE
d.setInput(xml.getBytes("UTF-8")); d.finish();
// read deflated bytes -> base64 -> URLEncoder.encode(...)  == the SAMLRequest param</div>`,
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
&lt;/EntityDescriptor&gt;</div>`,
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
<ul>
<li><b>Signing</b> (always) — the IdP signs the assertion/response with <b>XML Signature</b>; the SP verifies with the metadata cert. Without a valid signature the assertion is worthless. The SP must also check the <b>Conditions</b>: <code>NotOnOrAfter</code> (not expired) and <code>Audience</code> (this SP) — the SAML <code>exp</code>/<code>aud</code>.</li>
<li><b>Encryption</b> (optional) — the IdP can <b>encrypt</b> the assertion (XML Encryption) to the SP's public key so intermediaries/the browser can't read it. Analogous to JWE vs JWS: sign for integrity, encrypt for confidentiality.</li>
<li><b>Single Logout (SLO)</b> — log the user out of the IdP <i>and</i> all SPs in one action. Powerful but notoriously fiddly (every SP must be reachable and cooperate), so many deployments rely on short sessions instead.</li>
</ul>
<p><b>SAML or OIDC?</b></p>
<ul>
<li><b>SAML</b> — enterprise/workforce web SSO, especially with legacy apps and IdPs that speak it; browser-based, XML.</li>
<li><b>OIDC</b> — modern web/mobile/SPA and <b>APIs</b>; JSON/JWT, works cleanly with OAuth for API authorization, lighter for native/mobile. Prefer OIDC for new build; use SAML to integrate where it's already the standard.</li>
</ul>
<div class="codeSample" data-hl>// the SP's non-negotiable checks on a received assertion:
// 1) XML Signature verifies against the IdP metadata cert
// 2) Conditions NotOnOrAfter is in the future   (not expired)
// 3) AudienceRestriction Audience == this SP's entityID</div>`,
docs:[['XML Signature / Encryption in SAML','http://docs.oasis-open.org/security/saml/v2.0/saml-core-2.0-os.pdf'],['SAML vs OIDC (Auth0)','https://auth0.com/intro-to-iam/saml-vs-oidc']],
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
}`}}

]});
