/* IdentityDojo configuration. Loaded BEFORE the shared runtime so it can
   override the domain grouping and keep the 14 identity streams separate
   instead of merging them into one "Identity and Access" stream. */
const DOJO_NO_IAM_MERGE = true;

/* Home-page copy. Without this the shared engine falls back to DevDojo's. */
const DOJO_HOME = {
  name: 'IdentityDojo',
  title: 'Welcome to IdentityDojo \u{1F6C2}',
  intro: '14 streams and 132 lessons take you from what an identity actually is to running one in production. '
       + 'The sequencing is deliberate: concepts are grounded <b>before</b> the protocols that assume them, so you meet '
       + '"token" as a defined thing before any lesson uses one, and learn that <b>SSO is a user experience</b> before '
       + 'the protocols that produce it. From there into OAuth 2.0/2.1 and PKCE end to end, OIDC, SAML, WebAuthn and '
       + 'FIDO2 internals, Active Directory and Kerberos, zero trust and authorization at scale — and a '
       + '<b>Running Identity</b> stream on the half that is not a protocol: incident response, migration, break-glass, '
       + 'what to measure, and the 3am page.'
};
const DOJO_DOMAINS = [
  {name:'Foundations',icon:'🪪',titles:['Identity Foundations']},
  {name:'Authentication',icon:'🔑',titles:['Authentication Methods & MFA','Sessions, Cookies & Web Login Security']},
  {name:'Authorization',icon:'🛡️',titles:['Authorization Models']},
  {name:'Protocols',icon:'🔗',titles:['OAuth 2.0 & OpenID Connect','OAuth, JWT & JOSE (JWK · JWS · JWE)','SAML 2.0 & Web SSO']},
  {name:'Keys & Machine Identity',icon:'🔐',titles:['PKI & Certificate Management','Service-to-Service Authorization & SPIFFE']},
  {name:'Enterprise',icon:'🏢',titles:['Enterprise Identity & Directories','Identity Governance & Privileged Access']},
  {name:'Advanced & Operations',icon:'🚨',titles:['Advanced OAuth 2.0 & OIDC Threats','Running Identity']},
  {name:'Capstone',icon:'⛩️',titles:['Identity Capstone']}
];

/* Glossary scope: IdentityDojo shows only the vocabulary it teaches. Without this the
   shared glossary would also list Java collections, SQL and React terms. */
const DOJO_GLOSS_DOMAINS = [
  'Identity & Access (IAM)',
  'Service-to-Service & Zero Trust',
  'PKI & Certificates'
];
