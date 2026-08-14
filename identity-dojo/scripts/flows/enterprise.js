// Flow specs for 16k-enterprise-identity-directories.js
const F = '16k-enterprise-identity-directories.js';
module.exports = [

{ id: 'ei2-kerberos', file: F, title: 'Kerberos: TGT, service ticket, access', width: 740,
  actors: [
    { id: 'c',   label: 'Client', sub: 'your workstation' },
    { id: 'as',  label: 'KDC — AS', sub: 'Authentication Service' },
    { id: 'tgs', label: 'KDC — TGS', sub: 'Ticket-Granting Service' },
    { id: 'srv', label: 'Service', sub: 'e.g. file server' },
  ],
  steps: [
    { n: 1, from: 'c', to: 'as', label: 'AS-REQ: “I am ron” (+ pre-auth timestamp)', ch: 'back' },
    { n: 2, from: 'as', to: 'c', label: 'AS-REP: TGT + session key (enc. with ron’s key)', ch: 'back', ret: true },
    { n: 3, self: 'c', label: 'decrypting it IS the password check — offline at the KDC' },
    { n: 4, from: 'c', to: 'tgs', label: 'TGS-REQ: TGT + “I want the file server”', ch: 'back' },
    { n: 5, from: 'tgs', to: 'c', label: 'TGS-REP: service ticket (enc. with the SERVICE’s key)', ch: 'back', ret: true },
    { n: 6, from: 'c', to: 'srv', label: 'AP-REQ: service ticket + fresh authenticator', ch: 'back' },
    { n: 7, self: 'srv', label: 'decrypts with its own key — the KDC is not called' },
    { n: 8, from: 'srv', to: 'c', label: 'AP-REP (mutual auth) — access granted', ch: 'back', ret: true },
    { note: 'The password never crosses the network; tickets and keys do the proving.' },
  ] },

{ id: 'ei3-scim', file: F, title: 'SCIM: joiner, mover, leaver', width: 640,
  actors: [
    { id: 'idp', label: 'IdP / HR', sub: 'SCIM client — source of truth' },
    { id: 'app', label: 'App', sub: 'SCIM server' },
  ],
  steps: [
    { phase: 'joiner — day one' },
    { n: 1, from: 'idp', to: 'app', label: 'POST /Users — account exists before 9am', ch: 'back' },
    { phase: 'mover — new department' },
    { n: 2, from: 'idp', to: 'app', label: 'PATCH /Users/{id} — groups follow the role', ch: 'back' },
    { phase: 'leaver — same day, not “eventually”' },
    { n: 3, from: 'idp', to: 'app', label: 'PATCH active:false (or DELETE)', ch: 'back' },
    { n: 4, self: 'app', label: 'access gone everywhere the connector reaches' },
  ] },

{ id: 'ei4-jit-hrd', file: F, title: 'Home-realm discovery + JIT provisioning', width: 680,
  actors: [
    { id: 'b',   label: 'Browser' },
    { id: 'sp',  label: 'SP', sub: 'the app' },
    { id: 'idp', label: 'Home IdP', sub: 'acme.com’s' },
  ],
  steps: [
    { n: 1, from: 'b', to: 'sp', label: 'login as ron@acme.com', ch: 'front' },
    { n: 2, self: 'sp', label: 'HRD: domain acme.com → Acme’s IdP' },
    { n: 3, from: 'sp', to: 'idp', label: 'redirect: federated authentication', ch: 'front' },
    { n: 4, from: 'idp', to: 'sp', label: 'assertion with name, email, groups', ch: 'front', ret: true },
    { n: 5, self: 'sp', label: 'no local account? create it NOW from the assertion (JIT)' },
    { n: 6, from: 'sp', to: 'b', label: 'signed in — no pre-provisioning ever ran', ch: 'front', ret: true },
  ] },

{ id: 'eibroker-broker', file: F, title: 'Identity brokering: one hub, many IdPs', width: 720,
  actors: [
    { id: 'b',   label: 'Browser' },
    { id: 'app', label: 'App', sub: 'integrates ONCE' },
    { id: 'br',  label: 'Broker' },
    { id: 'idp', label: 'Upstream IdP', sub: 'per customer' },
  ],
  steps: [
    { n: 1, from: 'b', to: 'app', label: 'login', ch: 'front' },
    { n: 2, from: 'app', to: 'br', label: 'OIDC /authorize — app only speaks to the broker', ch: 'front' },
    { n: 3, from: 'br', to: 'idp', label: 'second hop: SAML or OIDC, per tenant', ch: 'front' },
    { n: 4, from: 'idp', to: 'br', label: 'assertion in the upstream’s dialect', ch: 'front', ret: true },
    { n: 5, self: 'br', label: 'normalize claims to one canonical shape' },
    { n: 6, from: 'br', to: 'app', label: 'code → tokens, one predictable format', ch: 'front', ret: true },
    { note: 'Customers’ IdPs come and go; the app’s integration never changes.' },
  ] },

];
