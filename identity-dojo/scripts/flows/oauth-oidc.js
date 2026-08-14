// Flow specs for 16d-oauth2-oidc-flows.js
const F = '16d-oauth2-oidc-flows.js';
module.exports = [

{ id: 'oa1-authcode', file: F, title: 'Authorization Code flow', width: 700, bare: true,
  actors: [
    { id: 'b',   label: 'Browser',  sub: 'the user, front channel' },
    { id: 'c',   label: 'Client app', sub: 'backend' },
    { id: 'as',  label: 'Authorization Server' },
    { id: 'api', label: 'API', sub: 'resource server' },
  ],
  steps: [
    { n: 1, from: 'b',  to: 'c',   label: '“Log in with Example”' },
    { n: 2, from: 'c',  to: 'as',  label: '302 → /authorize?response_type=code…', ch: 'front' },
    { n: 3, self: 'as', label: 'user authenticates & consents' },
    { n: 4, from: 'as', to: 'c',   label: '302 → redirect_uri?code=…', ch: 'front', ret: true },
    { n: 5, from: 'c',  to: 'as',  label: 'POST /token — code + client auth + verifier', ch: 'back' },
    { n: 6, from: 'as', to: 'c',   label: 'access token (+ refresh, ID token)', ch: 'back', ret: true },
    { n: 7, from: 'c',  to: 'api', label: 'GET /invoices — Authorization: Bearer …', ch: 'back' },
    { n: 8, from: 'api', to: 'c',  label: '200 — the user’s data', ch: 'back', ret: true },
    { note: 'Tokens only ever travel on the back channel.' },
  ] },

{ id: 'oa2b-pkce', file: F, title: 'PKCE: the flow and the interception attack', width: 700,
  actors: [
    { id: 'app', label: 'Native / SPA app', sub: 'public client — no secret' },
    { id: 'as',  label: 'Authorization Server' },
    { id: 'atk', label: 'Malicious app', sub: 'intercepted the redirect' },
  ],
  steps: [
    { n: 1, self: 'app', label: 'random code_verifier, kept in memory' },
    { n: 2, self: 'app', label: 'code_challenge = S256(verifier)' },
    { n: 3, from: 'app', to: 'as', label: '/authorize + code_challenge', ch: 'front' },
    { n: 4, from: 'as', to: 'app', label: 'code', ch: 'front', ret: true },
    { n: 5, from: 'app', to: 'as', label: 'POST /token — code + code_verifier', ch: 'back' },
    { n: 6, self: 'as', label: 'S256(verifier) = stored challenge? ✓' },
    { n: 7, from: 'as', to: 'app', label: 'tokens', ch: 'back', ret: true },
    { phase: 'the same code, stolen in transit' },
    { n: 8, from: 'atk', to: 'as', label: 'POST /token — stolen code, no verifier', ch: 'attack' },
    { n: 9, from: 'as', to: 'atk', label: '400 invalid_grant', ch: 'attack', ret: true },
  ] },

{ id: 'oa4-clientcreds', file: F, title: 'Client Credentials flow', width: 640,
  actors: [
    { id: 'svc', label: 'Service', sub: 'confidential client' },
    { id: 'as',  label: 'Authorization Server' },
    { id: 'api', label: 'API' },
  ],
  steps: [
    { n: 1, from: 'svc', to: 'as', label: 'POST /token — grant_type=client_credentials', ch: 'back' },
    { n: 2, self: 'as', label: 'authenticate the CLIENT itself (secret / key / mTLS)' },
    { n: 3, from: 'as', to: 'svc', label: 'access token — no refresh token', ch: 'back', ret: true },
    { n: 4, from: 'svc', to: 'api', label: 'call with Bearer token', ch: 'back' },
    { note: 'No user, no browser, no consent — back channel only.' },
  ] },

{ id: 'oa5-refresh', file: F, title: 'Refresh token lifecycle with rotation', width: 620,
  actors: [
    { id: 'c',  label: 'Client' },
    { id: 'as', label: 'Authorization Server' },
  ],
  steps: [
    { phase: 'at first sign-in' },
    { n: 1, from: 'c', to: 'as', label: 'authorization code grant', ch: 'back' },
    { n: 2, from: 'as', to: 'c', label: 'access token (short) + refresh token RT₁', ch: 'back', ret: true },
    { phase: 'later — the access token has expired' },
    { n: 3, from: 'c', to: 'as', label: 'POST /token — grant_type=refresh_token, RT₁', ch: 'back' },
    { n: 4, from: 'as', to: 'c', label: 'new access token + NEW refresh token RT₂', ch: 'back', ret: true },
    { n: 5, self: 'as', label: 'RT₁ retired — any reuse revokes the family' },
  ] },

{ id: 'oa6-oidc', file: F, title: 'OpenID Connect on top of OAuth', width: 680,
  actors: [
    { id: 'b',  label: 'Browser' },
    { id: 'rp', label: 'Client (RP)' },
    { id: 'op', label: 'OpenID Provider', sub: 'the AS, speaking OIDC' },
  ],
  steps: [
    { n: 1, from: 'rp', to: 'op', label: '/authorize — scope=openid + nonce', ch: 'front' },
    { n: 2, self: 'op', label: 'user authenticates' },
    { n: 3, from: 'op', to: 'rp', label: 'code', ch: 'front', ret: true },
    { n: 4, from: 'rp', to: 'op', label: 'POST /token', ch: 'back' },
    { n: 5, from: 'op', to: 'rp', label: 'ID token + access token', ch: 'back', ret: true },
    { n: 6, self: 'rp', label: 'verify ID token: sig, iss, aud, exp, nonce' },
    { n: 7, from: 'rp', to: 'op', label: 'GET /userinfo — Bearer', ch: 'back' },
    { n: 8, from: 'op', to: 'rp', label: 'claims (profile, email…)', ch: 'back', ret: true },
  ] },

{ id: 'oadisc-discovery', file: F, title: 'OIDC discovery and JWKS fetch', width: 600,
  actors: [
    { id: 'c',  label: 'Client / verifier' },
    { id: 'as', label: 'Authorization Server' },
  ],
  steps: [
    { n: 1, from: 'c', to: 'as', label: 'GET /.well-known/openid-configuration', ch: 'back' },
    { n: 2, from: 'as', to: 'c', label: 'endpoints, jwks_uri, supported algs', ch: 'back', ret: true },
    { n: 3, from: 'c', to: 'as', label: 'GET jwks_uri', ch: 'back' },
    { n: 4, from: 'as', to: 'c', label: 'public keys, each with a kid', ch: 'back', ret: true },
    { n: 5, self: 'c', label: 'cache keys; refetch on an unknown kid' },
    { note: 'Nothing is hardcoded: keys and endpoints can rotate under you.' },
  ] },

{ id: 'oa7-device', file: F, title: 'Device Authorization flow', width: 700,
  actors: [
    { id: 'tv', label: 'TV / CLI', sub: 'no keyboard, no browser' },
    { id: 'as', label: 'Authorization Server' },
    { id: 'ph', label: 'User’s phone' },
  ],
  steps: [
    { n: 1, from: 'tv', to: 'as', label: 'POST /device_authorization', ch: 'back' },
    { n: 2, from: 'as', to: 'tv', label: 'device_code + user_code + verification_uri', ch: 'back', ret: true },
    { n: 3, self: 'tv', label: 'shows the code and a QR' },
    { n: 4, from: 'ph', to: 'as', label: 'user opens URI, types code, logs in', ch: 'front' },
    { n: 5, from: 'tv', to: 'as', label: 'polls /token with device_code', ch: 'back' },
    { n: 6, from: 'as', to: 'tv', label: '…authorization_pending… then tokens', ch: 'back', ret: true },
  ] },

{ id: 'oa8b-bff', file: F, title: 'Browser app behind a BFF', width: 720,
  actors: [
    { id: 'b',   label: 'Browser (SPA)' },
    { id: 'bff', label: 'BFF', sub: 'backend for frontend' },
    { id: 'as',  label: 'Authorization Server' },
    { id: 'api', label: 'API' },
  ],
  steps: [
    { n: 1, from: 'b', to: 'bff', label: 'login', ch: 'front' },
    { n: 2, from: 'bff', to: 'as', label: 'auth code flow — confidential client', ch: 'back' },
    { n: 3, from: 'as', to: 'bff', label: 'tokens — kept server-side', ch: 'back', ret: true },
    { n: 4, from: 'bff', to: 'b', label: 'Set-Cookie: session (HttpOnly, Secure, SameSite)', ch: 'front', ret: true },
    { n: 5, from: 'b', to: 'bff', label: 'fetch /api/… — cookie attached', ch: 'front' },
    { n: 6, from: 'bff', to: 'api', label: 'same call, with Bearer token', ch: 'back' },
    { n: 7, from: 'api', to: 'bff', label: '200', ch: 'back', ret: true },
    { n: 8, from: 'bff', to: 'b', label: '200', ch: 'front', ret: true },
    { note: 'No token ever reaches the browser: cookies out front, OAuth in back.' },
  ] },

];
