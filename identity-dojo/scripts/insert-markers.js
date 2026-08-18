#!/usr/bin/env node
// insert-markers.js, one-time helper: place empty <!--flow:ID--> marker pairs
// into the stream files, right after the FIRST paragraph of the target lesson
// body. gen-flows.js then fills them. Idempotent: skips ids already present.
const fs = require('fs');
const path = require('path');
const STREAMS = path.join(__dirname, '..', 'content', 'streams');

// lessonId → flow ids (in order of appearance)
const MAP = {
  '16d-oauth2-oidc-flows.js': {
    oa2b: ['oa2b-pkce'], oa4: ['oa4-clientcreds'], oa5: ['oa5-refresh'],
    oa6: ['oa6-oidc'], oadisc: ['oadisc-discovery'], oa7: ['oa7-device'], oa8b: ['oa8b-bff'],
  },
  '16e-saml-web-sso.js': {
    sml2: ['sml2-sp-init', 'sml2-idp-init'], sml3: ['sml3-artifact'], sml5: ['sml5-slo'],
  },
  '16b-oauth-jwt-jose.js': { jose4: ['jose4-jwks'] },
  '16f-service-to-service-authz.js': {
    s2s2: ['s2s2-mtls'], s2s3: ['s2s3-token-exchange'], s2s4: ['s2s4-spiffe'],
    s2scicd: ['s2scicd-fed'], s2stxn: ['s2stxn-txn'],
  },
  '16g-pki-certificate-management.js': { pki4: ['pki4-tls'], pki5: ['pki5-acme'] },
  '16h-authentication-methods-mfa.js': {
    am3: ['am3-totp'], am8b: ['am8b-webauthn-reg'], am8c: ['am8c-webauthn-authn'], am5: ['am5-stepup'],
  },
  '16j-sessions-web-login.js': {
    ss1: ['ss1-session'], ss3: ['ss3-csrf'], ss6: ['ss6-slo-backchannel'],
  },
  '16k-enterprise-identity-directories.js': {
    ei2: ['ei2-kerberos'], ei3: ['ei3-scim'], ei4: ['ei4-jit-hrd'], eibroker: ['eibroker-broker'],
  },
  '16l-advanced-oauth-threats.js': {
    ao1: ['ao1-introspection'], ao3: ['ao3-par'], ao4b: ['ao4b-dpop'], ao6: ['ao6-rotation'],
  },
  '16c-identity-foundations.js': { idffed2: ['idffed2-federation'] },
};

let placed = 0, skipped = 0, failed = 0;
for (const [file, lessons] of Object.entries(MAP)) {
  const p = path.join(STREAMS, file);
  let src = fs.readFileSync(p, 'utf8');
  for (const [lesson, flows] of Object.entries(lessons)) {
    const markers = flows.map(id => `<!--flow:${id}--><!--/flow:${id}-->`).join('\n');
    if (flows.every(id => src.includes(`<!--flow:${id}-->`))) { skipped += flows.length; continue; }
    const start = src.indexOf(`{id:'${lesson}',`);
    if (start === -1) { console.error(`LESSON ${lesson} not found in ${file}`); failed++; continue; }
    const pEnd = src.indexOf('</p>', start);
    if (pEnd === -1) { console.error(`no <p> in ${lesson}`); failed++; continue; }
    const at = pEnd + 4;
    src = src.slice(0, at) + '\n' + markers + src.slice(at);
    placed += flows.length;
  }
  fs.writeFileSync(p, src);
}
console.log(`placed ${placed} marker pair(s), skipped ${skipped}, failed ${failed}`);
process.exit(failed ? 1 : 0);
