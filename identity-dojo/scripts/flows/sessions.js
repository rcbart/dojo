// Flow specs for 16j-sessions-web-login.js
const F = '16j-sessions-web-login.js';
module.exports = [

{ id: 'ss1-session', file: F, title: 'Form login and the session cookie', width: 700,
  actors: [
    { id: 'b',   label: 'Browser' },
    { id: 'srv', label: 'Server' },
    { id: 'st',  label: 'Session store' },
  ],
  steps: [
    { n: 1, from: 'b', to: 'srv', label: 'POST /login — credentials', ch: 'front' },
    { n: 2, self: 'srv', label: 'verify password hash; mint random session id' },
    { n: 3, from: 'srv', to: 'st', label: 'save sid → {user, expiry}', ch: 'back' },
    { n: 4, from: 'srv', to: 'b', label: 'Set-Cookie: sid=… HttpOnly Secure SameSite', ch: 'front', ret: true },
    { n: 5, from: 'b', to: 'srv', label: 'GET /account — cookie attached automatically', ch: 'front' },
    { n: 6, from: 'srv', to: 'st', label: 'look up sid', ch: 'back' },
    { n: 7, from: 'srv', to: 'b', label: '200 — personalised page', ch: 'front', ret: true },
    { note: '“Automatically” is the superpower AND the flaw — it is what CSRF abuses.' },
  ] },

{ id: 'ss3-csrf', file: F, title: 'CSRF: the confused deputy', width: 700,
  actors: [
    { id: 'b',    label: 'Victim’s browser' },
    { id: 'evil', label: 'evil.site' },
    { id: 'bank', label: 'bank.com' },
  ],
  steps: [
    { n: 1, from: 'b', to: 'bank', label: 'logs in — session cookie set', ch: 'front' },
    { phase: 'later, in another tab' },
    { n: 2, from: 'b', to: 'evil', label: 'visits evil.site', ch: 'front' },
    { n: 3, from: 'evil', to: 'b', label: 'page auto-submits a hidden form → bank.com', ch: 'attack', ret: true },
    { n: 4, from: 'b', to: 'bank', label: 'POST /transfer — cookie attached AUTOMATICALLY', ch: 'attack' },
    { n: 5, self: 'bank', label: 'valid session, valid request shape… money moves' },
    { note: 'The browser was deputised. Defences: SameSite, CSRF tokens, origin checks.' },
  ] },

{ id: 'ss6-slo-backchannel', file: F, title: 'OIDC back-channel logout', width: 720,
  actors: [
    { id: 'b',  label: 'Browser' },
    { id: 'a1', label: 'App A' },
    { id: 'op', label: 'OP (IdP)' },
    { id: 'a2', label: 'App B' },
  ],
  steps: [
    { n: 1, from: 'b', to: 'op', label: 'user logs out at the OP', ch: 'front' },
    { n: 2, from: 'op', to: 'a1', label: 'POST logout_token (signed JWT: sub, sid)', ch: 'back' },
    { n: 3, from: 'op', to: 'a2', label: 'POST logout_token', ch: 'back' },
    { n: 4, self: 'a1', label: 'verify token; kill the server-side session' },
    { n: 5, self: 'a2', label: 'same — no browser involvement needed' },
    { note: 'The front-channel variant uses hidden iframes — increasingly broken by third-party-cookie blocking.' },
  ] },

];
