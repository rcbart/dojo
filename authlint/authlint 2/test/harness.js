/* Load src/ into a single scope, the way the browser sees it after build.js
   concatenates everything into one <script>. Testing the real files rather
   than a copy is the only way the tests keep meaning anything. */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { DOMParser } = require('@xmldom/xmldom');

const ROOT = path.join(__dirname, '..');
const FILES = [
  'src/finding.js',
  'src/decode.js',
  'src/detect.js',
  'src/diagnose.js',
  'src/checks-jwt.js',
  'src/checks-oidc.js',
  'src/checks-oauth.js',
  'src/checks-saml.js',
];

const sandbox = {
  atob, btoa, TextDecoder, TextEncoder, URL, URLSearchParams,
  Date, Math, JSON, Object, Array, String, Number, RegExp, isNaN, parseInt, parseFloat,
  console,
  // Node has no DOMParser. This is the only reason the test harness has a
  // dependency at all, and nothing in dist/index.html uses it.
  DOMParser,
};
vm.createContext(sandbox);
for (const f of FILES) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), sandbox, { filename: f });
}

/* Assemble a JWT from plain objects, so tests read as the token they describe. */
function jwt(header, payload, sig) {
  const b = o => Buffer.from(JSON.stringify(o)).toString('base64url');
  return b(header) + '.' + b(payload) + '.' + (sig === undefined ? 'c2ln' : sig);
}

const NOW = 1800000000;             // fixed, so nothing here depends on when it runs

/* Findings are matched on a substring of the title, which keeps the tests
   readable and lets the wording be improved without breaking them. */
function has(findings, sev, fragment) {
  return findings.some(f => f.sev === sev && f.title.toLowerCase().includes(fragment.toLowerCase()));
}
function titles(findings) {
  return findings.map(f => f.sev + ': ' + f.title);
}

module.exports = { sandbox, jwt, NOW, has, titles };
