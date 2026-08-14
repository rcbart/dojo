// Flow specs for 16f-service-to-service-authz.js
const F = '16f-service-to-service-authz.js';
module.exports = [

{ id: 's2s2-mtls', file: F, title: 'Mutual TLS between two services', width: 620,
  actors: [
    { id: 'a', label: 'Service A', sub: 'client side' },
    { id: 'b', label: 'Service B', sub: 'server side' },
  ],
  steps: [
    { n: 1, from: 'a', to: 'b', label: 'ClientHello', ch: 'back' },
    { n: 2, from: 'b', to: 'a', label: 'certificate B + CertificateRequest', ch: 'back', ret: true },
    { n: 3, self: 'a', label: 'verify B’s chain to a trusted CA' },
    { n: 4, from: 'a', to: 'b', label: 'certificate A + proof of private key', ch: 'back' },
    { n: 5, self: 'b', label: 'verify A’s chain — identity = cert SAN' },
    { n: 6, from: 'a', to: 'b', label: 'encrypted channel — BOTH ends authenticated', ch: 'back' },
    { note: 'Identity is proven per connection, not per request — contrast with tokens.' },
  ] },

{ id: 's2s3-token-exchange', file: F, title: 'OAuth Token Exchange (on-behalf-of)', width: 700,
  actors: [
    { id: 'a',   label: 'API A', sub: 'holds the user’s token' },
    { id: 'sts', label: 'AS / STS' },
    { id: 'b',   label: 'API B', sub: 'downstream' },
  ],
  steps: [
    { n: 1, self: 'a', label: 'user’s token has aud=A — B must not accept it' },
    { n: 2, from: 'a', to: 'sts', label: 'POST /token — grant=token-exchange, subject_token', ch: 'back' },
    { n: 3, self: 'sts', label: 'policy: may A act for this user at B?' },
    { n: 4, from: 'sts', to: 'a', label: 'new token: sub=user, act=A, aud=B', ch: 'back', ret: true },
    { n: 5, from: 'a', to: 'b', label: 'call B with the exchanged token', ch: 'back' },
    { n: 6, self: 'b', label: 'sees who asked (sub) AND who carried it (act)' },
  ] },

{ id: 's2s4-spiffe', file: F, title: 'SPIFFE/SPIRE: how a workload gets its identity', width: 720,
  actors: [
    { id: 'w',  label: 'Workload' },
    { id: 'ag', label: 'SPIRE Agent', sub: 'one per node' },
    { id: 'sv', label: 'SPIRE Server' },
  ],
  steps: [
    { n: 1, from: 'ag', to: 'sv', label: 'node attestation — prove which machine this is', ch: 'back' },
    { n: 2, from: 'w', to: 'ag', label: 'Workload API: “who am I?” (no credentials!)', ch: 'back' },
    { n: 3, self: 'ag', label: 'workload attestation: selectors — uid, k8s SA, image…' },
    { n: 4, from: 'ag', to: 'sv', label: 'fetch identity for the matching registration entry', ch: 'back' },
    { n: 5, from: 'sv', to: 'ag', label: 'signed SVID', ch: 'back', ret: true },
    { n: 6, from: 'ag', to: 'w', label: 'X.509-SVID: spiffe://domain/ns/…/sa/… + private key', ch: 'back', ret: true },
    { n: 7, self: 'w', label: 'short-lived, auto-rotated — the secret-zero problem dissolves' },
  ] },

{ id: 's2scicd-fed', file: F, title: 'Workload identity federation: CI to cloud with no stored keys', width: 720,
  actors: [
    { id: 'ci',  label: 'CI job', sub: 'e.g. GitHub Actions' },
    { id: 'iss', label: 'CI OIDC issuer' },
    { id: 'sts', label: 'Cloud STS' },
    { id: 'cl',  label: 'Cloud API' },
  ],
  steps: [
    { n: 1, from: 'ci', to: 'iss', label: 'request this job’s OIDC token', ch: 'back' },
    { n: 2, from: 'iss', to: 'ci', label: 'signed JWT: repo, branch, workflow, run id', ch: 'back', ret: true },
    { n: 3, from: 'ci', to: 'sts', label: 'exchange the JWT for cloud credentials', ch: 'back' },
    { n: 4, self: 'sts', label: 'verify sig via issuer JWKS + match trust policy (repo/branch)' },
    { n: 5, from: 'sts', to: 'ci', label: 'short-lived cloud credentials', ch: 'back', ret: true },
    { n: 6, from: 'ci', to: 'cl', label: 'deploy', ch: 'back' },
    { note: 'Nothing long-lived is stored in CI — the trust is in the OIDC federation.' },
  ] },

{ id: 's2stxn-txn', file: F, title: 'Transaction tokens across a call chain', width: 720,
  actors: [
    { id: 'gw', label: 'Gateway' },
    { id: 'ts', label: 'Txn token service' },
    { id: 's1', label: 'Service A' },
    { id: 's2', label: 'Service B' },
  ],
  steps: [
    { n: 1, from: 'gw', to: 'ts', label: 'user token + request context in', ch: 'back' },
    { n: 2, from: 'ts', to: 'gw', label: 'short-lived txn token — signed once', ch: 'back', ret: true },
    { n: 3, from: 'gw', to: 's1', label: 'call + txn token', ch: 'back' },
    { n: 4, from: 's1', to: 's2', label: 'the SAME token, forwarded', ch: 'back' },
    { n: 5, self: 's2', label: 'verify the signature locally — no STS hop per service' },
    { note: 'Sign the context once at the edge; verify cheaply at every hop.' },
  ] },

];
