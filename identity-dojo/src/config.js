/* Identity Dojo configuration. Loaded BEFORE the shared runtime so it can
   override the domain grouping and keep the 14 identity streams separate
   instead of merging them into one "Identity and Access" stream. */
const DOJO_NO_IAM_MERGE = true;

/* Home-page copy. Without this the shared engine falls back to Dev Dojo's. */
const DOJO_HOME = {
  name: 'Identity Dojo',
  icon: '',
  pageTitle: 'Identity Dojo: Master identity & access management',
  title: 'Welcome to Identity Dojo \u{1F510}',
  intro: '14 streams and 139 lessons take you from what an identity actually is to running one in production. '
       + 'The sequencing is deliberate: concepts are grounded <b>before</b> the protocols that assume them, so you meet '
       + '"token" as a defined thing before any lesson uses one, and learn that <b>SSO is a user experience</b> before '
       + 'the protocols that produce it. From there into OAuth 2.0/2.1 and PKCE end to end, OIDC, SAML, WebAuthn and '
       + 'FIDO2 internals, Active Directory and Kerberos, zero trust and authorization at scale, and a '
       + '<b>Running Identity</b> stream on the half that is not a protocol: incident response, migration, break-glass, '
       + 'what to measure, and the 3am page.'
};
const DOJO_DOMAINS = [
  {name:'Foundations',icon:'',titles:['Identity Foundations']},
  {name:'Authentication',icon:'',titles:['Authentication Methods & MFA','Sessions, Cookies & Web Login Security']},
  {name:'Authorization',icon:'',titles:['Authorization Models']},
  {name:'Protocols',icon:'',titles:['OAuth 2.0 & OpenID Connect','OAuth, JWT & JOSE (JWK · JWS · JWE)','SAML 2.0 & Web SSO']},
  {name:'Keys & Machine Identity',icon:'',titles:['PKI & Certificate Management','Service-to-Service Authorization & SPIFFE']},
  {name:'Enterprise',icon:'',titles:['Enterprise Identity & Directories','Identity Governance & Privileged Access']},
  {name:'Advanced & Operations',icon:'',titles:['Advanced OAuth 2.0 & OIDC Threats','Running Identity']},
  {name:'Capstone',icon:'',titles:['Identity Capstone']}
];

/* Glossary scope: Identity Dojo shows only the vocabulary it teaches. Without this the
   shared glossary would also list Java collections, SQL and React terms. */
const DOJO_GLOSS_DOMAINS = [
  'Identity & Access (IAM)',
  'Service-to-Service & Zero Trust',
  'PKI & Certificates'
];

/* The recommended route. Ordered the way the course is: every protocol arrives
   after the problem it exists to solve, so OAuth is obvious when you reach it
   rather than four endpoints to memorize. Without this the shared engine falls
   back to Dev Dojo's Java route. */
const DOJO_PATH_INTRO = 'covers a field that is wide and full of sharp edges, so this is the order I would teach it in. Concepts first, protocols second, operations last, because a protocol you meet before its problem is just a list of steps. Jump around once the foundations are in, this is a suggestion, not a cage.';
const DOJO_PATH = [
  ['\u2B1C White','The vocabulary, and what a token actually is',
   'Start with <b>Identity Foundations</b>: authentication versus authorization, what a token physically is, sessions versus tokens, and what that choice costs you in production. Skim the <b>Glossary</b> as you go. Nothing later makes sense without this stream, and most confusion in this field is vocabulary confusion.'],
  ['\uD83D\uDFE1 Yellow','Staying logged in, safely',
   'Take <b>Sessions, Cookies &amp; Web Login Security</b>: cookie flags, CSRF, fixation, token storage, and why logout is harder than it looks. This is the browser plumbing every protocol later rides on top of.'],
  ['\uD83D\uDFE0 Orange','Proving who you are',
   'Work through <b>Authentication Methods &amp; MFA</b>: passwords done right, the three factors, TOTP, then passkeys and the WebAuthn ceremonies in depth. Finish with assurance levels and account recovery, which is where most real breaches actually start.'],
  ['\uD83D\uDFE2 Green','Deciding what people may do',
   'Do <b>Authorization Models</b> end to end: ACLs to RBAC, then ABAC, ReBAC and policy engines, PDP/PEP, and the data-level check that actually matters. Authorization is the half of this field that gets least attention and causes most incidents.'],
  ['\uD83D\uDD35 Blue','The protocols',
   'Now <b>OAuth 2.0 &amp; OpenID Connect</b>: the roles, the authorization code flow, PKCE, refresh tokens, discovery, and choosing a flow. Then <b>OAuth, JWT &amp; JOSE</b> for what is inside the tokens and how a verifier is supposed to check them. Paste real artifacts into <b>authlint</b> as you go.'],
  ['\uD83D\uDFE3 Purple','The enterprise, which is where the money is',
   'Take <b>SAML 2.0 &amp; Web SSO</b>, <b>Enterprise Identity &amp; Directories</b> (LDAP, Active Directory, Kerberos, SCIM), and <b>PKI &amp; Certificate Management</b>. Older, still everywhere, and the reason most migrations are hard.'],
  ['\uD83D\uDFE4 Brown','Machines, and attackers',
   'Do <b>Service-to-Service Authorization &amp; SPIFFE</b> for mTLS, workload identity and token exchange, then <b>Advanced OAuth 2.0 &amp; OIDC Threats</b>: introspection, DPoP, PAR, FAPI, the attack catalog, and refresh-token reuse detection. Add <b>Identity Governance &amp; Privileged Access</b> for the reviews and the non-human identities nobody governs.'],
  ['\u26AB Black','Running it at 3am',
   'Finish with <b>Running Identity</b>: incident response, migrating an estate without an outage, break-glass when the IdP is the blast radius, what to log and what never to log, and a systematic method for diagnosing failures. Then prove it in the <b>Identity Capstone</b>. This stream is the difference between knowing the protocols and being trusted with them.'],
];
