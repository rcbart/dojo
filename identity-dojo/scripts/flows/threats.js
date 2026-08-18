// Flow specs for 16l-advanced-oauth-threats.js
const F = '16l-advanced-oauth-threats.js';
module.exports = [

{ id: 'ao1-introspection', file: F, title: 'Token introspection', width: 600,
  actors: [
    { id: 'api', label: 'API', sub: 'resource server' },
    { id: 'as',  label: 'Authorization Server' },
  ],
  steps: [
    { n: 1, self: 'api', label: 'opaque token arrives, nothing to read locally' },
    { n: 2, from: 'api', to: 'as', label: 'POST /introspect, token + API’s OWN credentials', ch: 'back' },
    { n: 3, from: 'as', to: 'api', label: '{active:true, sub, scope, exp, aud}', ch: 'back', ret: true },
    { n: 4, self: 'api', label: 'cache briefly; treat active:false as a hard no' },
    { note: 'Freshness you can revoke, at the price of a network hop, the JWT trade-off inverted.' },
  ] },

{ id: 'ao3-par', file: F, title: 'Pushed Authorization Requests', width: 620,
  actors: [
    { id: 'c',  label: 'Client' },
    { id: 'as', label: 'Authorization Server' },
  ],
  steps: [
    { n: 1, from: 'c', to: 'as', label: 'POST /par, full authz request, client-authenticated', ch: 'back' },
    { n: 2, from: 'as', to: 'c', label: 'request_uri, short-lived, one-time', ch: 'back', ret: true },
    { n: 3, from: 'c', to: 'as', label: '/authorize?request_uri=… (tiny, tamper-proof)', ch: 'front' },
    { n: 4, self: 'as', label: 'parameters were already vetted on the back channel' },
    { note: 'The browser now carries a reference, not the request, nothing left to tamper with.' },
  ] },

{ id: 'ao4b-dpop', file: F, title: 'DPoP: proof-of-possession per request', width: 700,
  actors: [
    { id: 'c',   label: 'Client', sub: 'holds a key pair' },
    { id: 'as',  label: 'Authorization Server' },
    { id: 'api', label: 'API' },
  ],
  steps: [
    { n: 1, self: 'c', label: 'generate a key pair (per client instance)' },
    { n: 2, from: 'c', to: 'as', label: 'POST /token + DPoP proof (signed: htm, htu, jti)', ch: 'back' },
    { n: 3, from: 'as', to: 'c', label: 'access token BOUND to the key (cnf.jkt)', ch: 'back', ret: true },
    { n: 4, from: 'c', to: 'api', label: 'request + token + a FRESH DPoP proof', ch: 'back' },
    { n: 5, self: 'api', label: 'verify proof sig; htm/htu match; jkt matches the token' },
    { note: 'A stolen token without the private key is a brick.' },
  ] },

{ id: 'ao6-rotation', file: F, title: 'Refresh rotation and reuse detection', width: 700,
  actors: [
    { id: 'c',   label: 'Legitimate client' },
    { id: 'as',  label: 'Authorization Server' },
    { id: 'atk', label: 'Attacker', sub: 'stole RT₁ earlier' },
  ],
  steps: [
    { n: 1, from: 'c', to: 'as', label: 'refresh with RT₁', ch: 'back' },
    { n: 2, from: 'as', to: 'c', label: 'new AT + RT₂: RT₁ is now “used”', ch: 'back', ret: true },
    { phase: 'the stolen copy surfaces' },
    { n: 3, from: 'atk', to: 'as', label: 'refresh with RT₁, a USED token', ch: 'attack' },
    { n: 4, self: 'as', label: 'reuse detected → revoke the whole token family' },
    { n: 5, from: 'as', to: 'atk', label: 'invalid_grant', ch: 'attack', ret: true },
    { n: 6, from: 'c', to: 'as', label: 'RT₂ is dead too → full re-authentication', ch: 'back' },
    { note: 'One theft costs one re-login, and produces a loud, unambiguous signal.' },
  ] },

];
