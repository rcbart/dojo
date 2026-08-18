// flows/index.js, every auth-flow diagram spec, grouped by stream.
// Rendered by ../flowdia.js, baked into stream files by ../gen-flows.js.
// Keep arrow labels short, the numbered <ol class="fdSteps"> in the lesson
// prose carries the full step-by-step description; numbers must match.
module.exports = [
  ...require('./oauth-oidc'),      // 16d
  ...require('./saml'),            // 16e
  ...require('./jose'),            // 16b
  ...require('./s2s'),             // 16f
  ...require('./pki'),             // 16g
  ...require('./authn-mfa'),       // 16h
  ...require('./sessions'),        // 16j
  ...require('./enterprise'),      // 16k
  ...require('./threats'),         // 16l
  ...require('./foundations'),     // 16c
];
