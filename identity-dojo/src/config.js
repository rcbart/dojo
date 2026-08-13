/* IdentityDojo configuration. Loaded BEFORE the shared runtime so it can
   override the domain grouping and keep the 14 identity streams separate
   instead of merging them into one "Identity and Access" stream. */
const DOJO_NO_IAM_MERGE = true;
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
