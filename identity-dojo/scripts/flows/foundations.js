// Flow specs for 16c-identity-foundations.js
const F = '16c-identity-foundations.js';
module.exports = [

{ id: 'idffed2-federation', file: F, title: 'Federation: the canonical triangle', width: 680,
  actors: [
    { id: 'b',   label: 'Browser' },
    { id: 'sp',  label: 'SP', sub: 'the app you want' },
    { id: 'idp', label: 'IdP', sub: 'who vouches for you' },
  ],
  steps: [
    { n: 1, from: 'b', to: 'sp', label: 'access the app', ch: 'front' },
    { n: 2, from: 'sp', to: 'idp', label: 'redirect: “please authenticate this person”', ch: 'front' },
    { n: 3, self: 'idp', label: 'user authenticates ONCE, here — and only here' },
    { n: 4, from: 'idp', to: 'sp', label: 'signed assertion about the user', ch: 'front', ret: true },
    { n: 5, self: 'sp', label: 'trusts the signature — never sees a password' },
    { n: 6, from: 'sp', to: 'b', label: 'session — you are in', ch: 'front', ret: true },
    { note: 'Every SSO protocol — SAML, OIDC — is a dialect of this one shape.' },
  ] },

];
