// Flow specs for 16h-authentication-methods-mfa.js
const F = '16h-authentication-methods-mfa.js';
module.exports = [

{ id: 'am3-totp', file: F, title: 'TOTP: enrolment and login', width: 620,
  actors: [
    { id: 'u',   label: 'User + authenticator', sub: 'phone app' },
    { id: 'srv', label: 'Server' },
  ],
  steps: [
    { phase: 'enrolment — happens once' },
    { n: 1, from: 'srv', to: 'u', label: 'QR code: the shared secret K', ch: 'front', ret: true },
    { n: 2, self: 'u', label: 'app stores K' },
    { phase: 'every login' },
    { n: 3, self: 'u', label: 'code = TOTP(K, now ÷ 30 s)' },
    { n: 4, from: 'u', to: 'srv', label: 'the 6-digit code', ch: 'front' },
    { n: 5, self: 'srv', label: 'same computation ±1 window; compare' },
    { note: 'Both sides compute; nothing is “sent to your phone”. And a code can be phished — see passkeys.' },
  ] },

{ id: 'am8b-webauthn-reg', file: F, title: 'WebAuthn registration ceremony', width: 720,
  actors: [
    { id: 'au', label: 'Authenticator', sub: 'Touch ID / security key' },
    { id: 'b',  label: 'Browser' },
    { id: 'rp', label: 'Server (RP)' },
  ],
  steps: [
    { n: 1, from: 'b', to: 'rp', label: 'start registration', ch: 'front' },
    { n: 2, from: 'rp', to: 'b', label: 'random challenge + rp.id + user info', ch: 'front', ret: true },
    { n: 3, from: 'b', to: 'au', label: 'navigator.credentials.create() → CTAP', ch: 'front' },
    { n: 4, self: 'au', label: 'user gesture; NEW key pair scoped to (rp.id, user)' },
    { n: 5, from: 'au', to: 'b', label: 'attestation: public key + credential id', ch: 'front', ret: true },
    { n: 6, from: 'b', to: 'rp', label: 'attestationObject + clientDataJSON', ch: 'front' },
    { n: 7, self: 'rp', label: 'verify challenge, origin, rp.id hash; store the public key' },
    { note: 'The private key never leaves the authenticator — there is nothing to breach server-side.' },
  ] },

{ id: 'am8c-webauthn-authn', file: F, title: 'WebAuthn authentication ceremony', width: 720,
  actors: [
    { id: 'au', label: 'Authenticator' },
    { id: 'b',  label: 'Browser' },
    { id: 'rp', label: 'Server (RP)' },
  ],
  steps: [
    { n: 1, from: 'b', to: 'rp', label: 'start login — perhaps usernameless', ch: 'front' },
    { n: 2, from: 'rp', to: 'b', label: 'fresh challenge (+ allowed credential ids)', ch: 'front', ret: true },
    { n: 3, from: 'b', to: 'au', label: 'navigator.credentials.get()', ch: 'front' },
    { n: 4, self: 'au', label: 'user gesture; sign challenge + origin + counter' },
    { n: 5, from: 'au', to: 'b', label: 'assertion', ch: 'front', ret: true },
    { n: 6, from: 'b', to: 'rp', label: 'assertion', ch: 'front' },
    { n: 7, self: 'rp', label: 'verify with the STORED public key; check origin, counter' },
    { note: 'The signature binds to rp.id and origin — a phishing page gets a useless answer.' },
  ] },

{ id: 'am5-stepup', file: F, title: 'Step-up authentication', width: 680,
  actors: [
    { id: 'b',   label: 'Browser' },
    { id: 'app', label: 'App' },
    { id: 'idp', label: 'IdP' },
  ],
  steps: [
    { n: 1, from: 'b', to: 'app', label: 'view balance — existing session is enough', ch: 'front' },
    { n: 2, from: 'b', to: 'app', label: 'transfer $5,000 — this needs more', ch: 'front' },
    { n: 3, from: 'app', to: 'idp', label: '/authorize — acr_values=mfa, max_age=300', ch: 'front' },
    { n: 4, self: 'idp', label: 'current session is password-only → prompt MFA now' },
    { n: 5, from: 'idp', to: 'app', label: 'new token: acr=mfa, fresh auth_time', ch: 'front', ret: true },
    { n: 6, self: 'app', label: 'VERIFY acr + auth_time before allowing the transfer' },
    { note: 'Asking for step-up is not enough — the app must check it actually happened.' },
  ] },

];
