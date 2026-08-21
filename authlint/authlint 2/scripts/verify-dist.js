#!/usr/bin/env node
/* dist/index.html is the product. It is committed so the tool can be downloaded
   and opened without a toolchain, which means it can drift from src/. Rebuild
   into memory and compare. */
const fs = require('fs');
const { execFileSync } = require('child_process');
const before = fs.existsSync('dist/index.html') ? fs.readFileSync('dist/index.html', 'utf8') : '';
execFileSync(process.execPath, ['build.js'], { stdio: 'pipe' });
const after = fs.readFileSync('dist/index.html', 'utf8');
if (before !== after) {
  console.error('dist/index.html was stale. It has been rebuilt; commit the result.');
  process.exit(1);
}

/* The promise on the page is that nothing leaves the browser. Check it rather
   than trusting it: no script or style may load from anywhere else, and there
   is no fetch, no XHR, no storage, no beacon. */
const body = after.replace(/<a\b[^>]*>/gi, '');
const offences = [];
for (const [re, what] of [
  [/<script[^>]+src=/i, 'an external script'],
  [/<link[^>]+rel=["']?stylesheet/i, 'an external stylesheet'],
  [/\bfetch\s*\(/, 'a fetch() call'],
  [/XMLHttpRequest/, 'XMLHttpRequest'],
  [/\bnavigator\.sendBeacon/, 'sendBeacon'],
  [/\blocalStorage\b|\bsessionStorage\b|\bindexedDB\b/, 'browser storage'],
  [/\bnew\s+WebSocket\b/, 'a WebSocket'],
  [/\bnew\s+Image\s*\(/, 'an Image() beacon'],
]) if (re.test(body)) offences.push(what);
if (offences.length) {
  console.error('The page claims nothing leaves the browser, but it contains: ' + offences.join(', '));
  process.exit(1);
}

const size = Buffer.byteLength(after);
console.log(`dist/index.html is current (${size.toLocaleString()} bytes), self-contained, and makes no network calls.`);
