#!/usr/bin/env node
/* Gate 6: colour contrast.
 *
 * The engine's palette is shared with the site, and two of the site's brand
 * hues are unusable as text: violet #8b5cf6 is 4.23:1 on white and teal
 * #0d9488 is 3.74:1, both under the 4.5:1 WCAG AA floor for body copy. The
 * token set therefore carries a darker -ink variant for every hue, and the
 * rule is: raw hue for fills, borders and gradients; -ink for text.
 *
 * This gate reads the tokens straight out of engine/styles.css and checks
 * every declared text-on-background pairing, so a future palette edit that
 * makes text unreadable fails the build instead of shipping. Zero deps.
 */
const fs = require('fs');
const path = require('path');
const CSS = path.join(__dirname, '..', 'engine', 'styles.css');

const css = fs.readFileSync(CSS, 'utf8');
const root = css.slice(css.indexOf(':root'), css.indexOf('}', css.indexOf(':root')));
const TOK = {};
for (const m of root.matchAll(/--([\w-]+)\s*:\s*(#[0-9a-fA-F]{3,8})/g)) TOK[m[1]] = m[2];

const lum = hex => {
  let h = hex.replace('#', '');
  if (h.length === 3) h = [...h].map(c => c + c).join('');
  const [r, g, b] = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255)
    .map(c => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};

// fg token, bg token, minimum, what it is
const PAIRS = [
  ['ink',        'bg',          4.5, 'body copy on the page'],
  ['ink',        'panel',       4.5, 'body copy on a card'],
  ['muted',      'bg',          4.5, 'secondary copy on the page'],
  ['muted',      'panel',       4.5, 'secondary copy on a card'],
  ['accent',     'panel',       4.5, 'links and nav on a card'],
  ['accent',     'bg',          4.5, 'links on the page'],
  ['accent',     'violet-tint', 4.5, 'active nav item'],
  ['violet-ink', 'panel',       4.5, 'violet as text'],
  ['teal-ink',   'teal-tint',   4.5, 'docs callout text'],
  ['accent2-ink','panel',       4.5, 'teal as text'],
  ['amber-ink',  'amber-tint',  4.5, 'hint callout text'],
  ['amber-ink',  'panel',       4.5, 'dan-track headings'],
  ['ok-ink',     'ok-tint',     4.5, 'passing test case'],
  ['rose-ink',   'rose-tint',   4.5, 'failing test case'],
  ['code-ink',   'code-bg',     4.5, 'code samples and the editor'],
  ['on-night',   'night',       4.5, 'header brand on the night bar'],
  ['on-night',   'night2',      4.5, 'header brand, gradient end'],
  ['night-muted','night',       4.5, 'header secondary text'],
  ['night-muted','night2',      4.5, 'header secondary text, gradient end'],
  ['ink',        'amber',       4.5, 'text on an amber button'],
];

let fails = 0, worst = { r: Infinity };
console.log(`contrast: ${PAIRS.length} declared pairings\n`);
for (const [f, b, min, use] of PAIRS) {
  if (!TOK[f] || !TOK[b]) { console.log(`  MISSING TOKEN --${TOK[f] ? b : f}  (${use})`); fails++; continue; }
  const r = ratio(TOK[f], TOK[b]);
  if (r < worst.r) worst = { r, use };
  if (r < min) { fails++; console.log(`  FAIL ${r.toFixed(2)} < ${min}  --${f} on --${b}  ${use}`); }
}
if (fails) { console.error(`\ncontrast: ${fails} pairing(s) below WCAG AA`); process.exit(1); }
console.log(`contrast: every pairing clears WCAG AA (worst ${worst.r.toFixed(2)}:1, ${worst.use})`);
