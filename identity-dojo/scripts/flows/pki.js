// Flow specs for 16g-pki-certificate-management.js
const F = '16g-pki-certificate-management.js';
module.exports = [

{ id: 'pki4-tls', file: F, title: 'TLS handshake, and what mTLS adds', width: 620,
  actors: [
    { id: 'c', label: 'Client' },
    { id: 's', label: 'Server' },
  ],
  steps: [
    { n: 1, from: 'c', to: 's', label: 'ClientHello, algorithms, SNI', ch: 'back' },
    { n: 2, from: 's', to: 'c', label: 'ServerHello + certificate CHAIN', ch: 'back', ret: true },
    { n: 3, self: 'c', label: 'build chain to a trusted root; name, validity, revocation' },
    { n: 4, from: 'c', to: 's', label: 'key exchange → encrypted session', ch: 'back' },
    { phase: 'mTLS adds a mirror image' },
    { n: 5, from: 's', to: 'c', label: 'CertificateRequest', ch: 'back', ret: true },
    { n: 6, from: 'c', to: 's', label: 'client certificate + proof of key', ch: 'back' },
    { n: 7, self: 's', label: 'verify the client’s chain, identity from the cert SAN' },
  ] },

{ id: 'pki5-acme', file: F, title: 'ACME: automated issuance and renewal', width: 700,
  actors: [
    { id: 'ac',  label: 'ACME client', sub: 'certbot / caddy' },
    { id: 'ca',  label: 'CA', sub: 'Let’s Encrypt' },
    { id: 'web', label: 'Your server / DNS' },
  ],
  steps: [
    { n: 1, from: 'ac', to: 'ca', label: 'new order: example.com', ch: 'back' },
    { n: 2, from: 'ca', to: 'ac', label: 'challenge: prove you control it', ch: 'back', ret: true },
    { n: 3, from: 'ac', to: 'web', label: 'place token at /.well-known/acme-challenge (or DNS TXT)', ch: 'back' },
    { n: 4, from: 'ca', to: 'web', label: 'fetch the token from the public internet', ch: 'back' },
    { n: 5, from: 'ca', to: 'ac', label: 'validated, send your CSR', ch: 'back', ret: true },
    { n: 6, from: 'ac', to: 'ca', label: 'CSR', ch: 'back' },
    { n: 7, from: 'ca', to: 'ac', label: 'signed certificate (90 days)', ch: 'back', ret: true },
    { n: 8, self: 'ac', label: 'renew automatically around day 60, nobody remembers manually' },
  ] },

];
