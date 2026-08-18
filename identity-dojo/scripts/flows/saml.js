// Flow specs for 16e-saml-web-sso.js
const F = '16e-saml-web-sso.js';
module.exports = [

{ id: 'sml2-sp-init', file: F, title: 'SP-initiated SAML SSO', width: 680,
  actors: [
    { id: 'b',   label: 'Browser' },
    { id: 'sp',  label: 'SP', sub: 'the app' },
    { id: 'idp', label: 'IdP' },
  ],
  steps: [
    { n: 1, from: 'b', to: 'sp', label: 'GET /app, no session', ch: 'front' },
    { n: 2, from: 'sp', to: 'idp', label: '302: AuthnRequest (Redirect binding)', ch: 'front' },
    { n: 3, self: 'idp', label: 'user authenticates (or already has an IdP session)' },
    { n: 4, from: 'idp', to: 'sp', label: 'auto-POST: signed Response + Assertion', ch: 'front', ret: true },
    { n: 5, self: 'sp', label: 'verify signature, InResponseTo, audience, window' },
    { n: 6, from: 'sp', to: 'b', label: 'Set-Cookie: session; 302 → /app', ch: 'front', ret: true },
    { note: 'The SP asked the question, so it can check the answer matches (InResponseTo).' },
  ] },

{ id: 'sml2-idp-init', file: F, title: 'IdP-initiated SAML SSO', width: 680,
  actors: [
    { id: 'b',   label: 'Browser' },
    { id: 'sp',  label: 'SP', sub: 'the app' },
    { id: 'idp', label: 'IdP', sub: 'portal with app tiles' },
  ],
  steps: [
    { n: 1, from: 'b', to: 'idp', label: 'user clicks the app tile in the IdP portal', ch: 'front' },
    { n: 2, self: 'idp', label: 'builds an assertion nobody asked for' },
    { n: 3, from: 'idp', to: 'sp', label: 'auto-POST: unsolicited signed Assertion', ch: 'front' },
    { n: 4, self: 'sp', label: 'no AuthnRequest → no InResponseTo to check' },
    { n: 5, from: 'sp', to: 'b', label: 'session cookie; user lands in the app', ch: 'front', ret: true },
    { note: 'Fewer redirects, weaker guarantees: replay and injection need extra care.' },
  ] },

{ id: 'sml3-artifact', file: F, title: 'SAML Artifact binding', width: 680,
  actors: [
    { id: 'b',   label: 'Browser' },
    { id: 'sp',  label: 'SP' },
    { id: 'idp', label: 'IdP' },
  ],
  steps: [
    { n: 1, from: 'idp', to: 'sp', label: 'redirect carrying a small artifact (a reference)', ch: 'front' },
    { n: 2, from: 'sp', to: 'idp', label: 'ArtifactResolve: SOAP, mutually authenticated', ch: 'back' },
    { n: 3, from: 'idp', to: 'sp', label: 'ArtifactResponse: the full Assertion', ch: 'back', ret: true },
    { n: 4, self: 'sp', label: 'verify & create the session' },
    { note: 'The assertion itself never crosses the browser, only a one-time reference does.' },
  ] },

{ id: 'sml5-slo', file: F, title: 'SP-initiated Single Logout', width: 720,
  actors: [
    { id: 'b',   label: 'Browser' },
    { id: 'spa', label: 'SP A', sub: 'logout starts here' },
    { id: 'idp', label: 'IdP' },
    { id: 'spb', label: 'SP B', sub: 'also signed in' },
  ],
  steps: [
    { n: 1, from: 'b', to: 'spa', label: 'user clicks “log out”', ch: 'front' },
    { n: 2, from: 'spa', to: 'idp', label: 'signed LogoutRequest', ch: 'front' },
    { n: 3, self: 'idp', label: 'ends the IdP session; finds other active SPs' },
    { n: 4, from: 'idp', to: 'spb', label: 'LogoutRequest (SOAP back channel or via browser)', ch: 'back' },
    { n: 5, from: 'spb', to: 'idp', label: 'LogoutResponse, session B ended', ch: 'back', ret: true },
    { n: 6, from: 'idp', to: 'spa', label: 'LogoutResponse, all done', ch: 'front', ret: true },
    { note: 'One unreachable SP is why SLO is “best effort”, see the Sessions stream.' },
  ] },

];
