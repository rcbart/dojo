#!/usr/bin/env node
/* The security gate.
 *
 * authlint tells people it is safe to paste a production token. Every claim
 * that supports that has to be checked against the file being shipped, not
 * against intent, because the failure mode is silent and the blast radius is
 * somebody else's credentials.
 *
 * This runs in CI. If it fails, the build fails.
 */
const fs = require('fs');
const file = 'dist/index.html';
const html = fs.readFileSync(file, 'utf8');
const fail = [];
const pass = [];

function check(name, ok, detail) {
  (ok ? pass : fail).push(detail ? `${name}: ${detail}` : name);
}

/* ---------- 1. no way out of the page ---------- */
// Anchors are allowed to point at other sites. Everything else is not.
const body = html.replace(/<a\b[^>]*>/gi, '<a>');
const EXFIL = [
  [/\bfetch\s*\(/,                         'fetch()'],
  [/XMLHttpRequest/,                       'XMLHttpRequest'],
  [/navigator\s*\.\s*sendBeacon/,          'navigator.sendBeacon'],
  [/new\s+WebSocket/,                      'WebSocket'],
  [/new\s+EventSource/,                    'EventSource'],
  [/navigator\s*\.\s*serviceWorker/,       'service worker registration'],
  [/new\s+Worker\s*\(/,                    'Worker'],
  [/importScripts\s*\(/,                   'importScripts'],
  [/new\s+Image\s*\(/,                     'Image() beacon'],
  [/<img\b[^>]*\bsrc\s*=\s*["']?https?:/i, 'a remote <img>'],
  [/<iframe/i,                             'an iframe'],
  [/<script[^>]+\bsrc\s*=/i,               'an external script'],
  [/<link[^>]+rel=["']?stylesheet/i,       'an external stylesheet'],
  [/@import\s/,                            'a CSS @import'],
  [/url\(\s*["']?https?:/i,                'a remote url() in CSS'],
  [/<form\b/i,                             'a form'],
  [/navigator\s*\.\s*clipboard\s*\.\s*write/, 'a clipboard write'],
  [/navigator\s*\.\s*(geolocation|mediaDevices|credentials)/, 'a sensitive navigator API'],
];
for (const [re, what] of EXFIL) check('no ' + what, !re.test(body), 'found ' + what);

/* ---------- 2. nothing is retained ---------- */
const STORAGE = [
  [/\blocalStorage\b/,   'localStorage'],
  [/\bsessionStorage\b/, 'sessionStorage'],
  [/\bindexedDB\b/,      'indexedDB'],
  [/document\s*\.\s*cookie/, 'document.cookie'],
  [/\bwindow\.name\s*=/, 'window.name'],
  [/\bcaches\b/,         'the Cache API'],
];
for (const [re, what] of STORAGE) check('no ' + what, !re.test(body), 'found ' + what);

/* ---------- 3. the input can never reach the URL ---------- */
// The only permitted mentions of history are the trap and the one deliberate
// native call that strips a URL somebody else constructed.
// The only file allowed to touch history state is src/hardening.js, which
// replaces both methods with a loud no-op and then makes exactly one
// deliberate native call to strip a URL somebody else constructed.
const otherSources = fs.readdirSync('src')
  .filter(f => f.endsWith('.js') && f !== 'hardening.js')
  .filter(f => /history\s*\.\s*(pushState|replaceState)|location\s*\.\s*(href|search|hash)\s*=/
    .test(fs.readFileSync('src/' + f, 'utf8')));
check('only the hardening module touches history or location', otherSources.length === 0,
      'these write to history or location: ' + otherSources.join(', '));
check('history.pushState is trapped', /history\.pushState\s*=\s*trap/.test(body));
check('history.replaceState is trapped', /history\.replaceState\s*=\s*trap/.test(body));
check('no assignment to location.search', !/location\s*\.\s*search\s*=/.test(body));
check('no assignment to location.hash', !/location\s*\.\s*hash\s*=/.test(body));
check('the URL is stripped on load if it carries anything',
      /location\.search\.length|location\.hash\.length/.test(body));

/* ---------- 4. the browser enforces it too ---------- */
// The value contains single quotes ('none'), so match the double-quoted form.
const csp = (html.match(/<meta[^>]+http-equiv="Content-Security-Policy"[^>]+content="([^"]+)"/i) || [])[1];
check('a Content-Security-Policy is present', !!csp);
if (csp) {
  for (const directive of ["default-src 'none'", "connect-src 'none'", "form-action 'none'",
                           "base-uri 'none'", "object-src 'none'"]) {
    check('CSP has ' + directive, csp.includes(directive), 'CSP is: ' + csp);
  }
  check('CSP does not allow a remote script',
        !/script-src[^;]*https?:/i.test(csp) && !/script-src[^;]*\*/.test(csp));
}
check('referrer policy is no-referrer',
      /<meta[^>]+name=["']referrer["'][^>]+content=["']no-referrer["']/i.test(html));

/* ---------- 5. the paste box does not leak to helpers ---------- */
const ta = (html.match(/<textarea[^>]*id=["']in["'][^>]*>/i) || [])[0] || '';
check('textarea disables spellcheck', /spellcheck\s*=\s*["']false["']/.test(ta),
      'Chrome enhanced spellcheck sends typed text to Google');
check('textarea disables autocomplete', /autocomplete\s*=\s*["']off["']/.test(ta));
check('textarea opts out of Grammarly', /data-gramm\s*=\s*["']false["']/.test(ta),
      'Grammarly reads text boxes and transmits their contents');
check('textarea opts out of password managers', /data-1p-ignore|data-lpignore/.test(ta));

/* ---------- 6. the input is dropped when the page goes away ---------- */
check('the input is cleared on pagehide', /addEventListener\(\s*['"]pagehide['"]/.test(body),
      'form state is restored on reload and kept alive in the bfcache');

/* ---------- 7. it will not run framed ---------- */
check('refuses to run in a frame', /window\.top\s*!==\s*window\.self/.test(body));

/* ---------- 8. every outbound link is safe ---------- */
const anchors = [...html.matchAll(/<a\b[^>]*href=["'](https?:[^"']+)["'][^>]*>/gi)];
const unsafe = anchors.filter(a => !/rel=["'][^"']*noreferrer/i.test(a[0]));
check('every external link is rel=noreferrer', unsafe.length === 0,
      unsafe.length + ' link(s) would send a Referer header: ' + unsafe.map(a => a[1]).join(', '));

/* ---------- 9. no third party, at all ---------- */
const remote = [...html.matchAll(/(?:src|href)\s*=\s*["'](https?:\/\/[^"']+)["']/gi)]
  .map(m => m[1])
  .filter(u => !/^https:\/\/(roniam\.dev|github\.com)/.test(u));
check('no third-party origin is referenced', remote.length === 0, remote.join(', '));

/* ---------- report ---------- */
console.log(`${pass.length} security check(s) passed.`);
if (fail.length) {
  console.error('\nFAILED:');
  for (const f of fail) console.error('  ' + f);
  console.error('\nThe page claims nothing leaves the browser. Fix this or change the claim.');
  process.exit(1);
}
console.log('The privacy claim on the page holds for the file being shipped.');
