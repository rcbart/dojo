// Flow specs for 16b-oauth-jwt-jose.js
const F = '16b-oauth-jwt-jose.js';
module.exports = [

{ id: 'jose4-jwks', file: F, title: 'Verifying a JWT via JWKS', width: 620,
  actors: [
    { id: 'api', label: 'API', sub: 'verifier' },
    { id: 'as',  label: 'AS', sub: '/.well-known/jwks.json' },
  ],
  steps: [
    { n: 1, self: 'api', label: 'JWT arrives — header names kid + alg' },
    { n: 2, from: 'api', to: 'as', label: 'GET jwks_uri (usually served from cache)', ch: 'back' },
    { n: 3, from: 'as', to: 'api', label: 'keys[] — pick the one matching kid', ch: 'back', ret: true },
    { n: 4, self: 'api', label: 'verify signature; then iss, aud, exp, nbf' },
    { n: 5, self: 'api', label: 'unknown kid? refetch once — that is how rotation works' },
  ] },

];
