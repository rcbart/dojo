#!/usr/bin/env node
// Pre-render every ```mermaid fence in a post to SVG, so the site can inline
// the picture at build time and ship no diagram library to the browser.
//
// The site's rule is zero runtime dependencies. A Mermaid fence in markdown is
// source, not a picture, and shipping it as source would mean shipping the
// renderer. So the renderer runs HERE, once, wherever mermaid-cli is
// installed, and writes:
//
//   <diagram-dir>/<slug>/<n>.svg   the picture build-blog.js inlines
//   <diagram-dir>/<slug>/<n>.mmd   the exact source that produced it
//
// The .mmd sidecar is what verify-diagrams.js compares against the fence, so
// a diagram edited in the prose and not re-rendered fails the build instead
// of shipping stale.
//
//   node scripts/render-diagrams.js posts/2026-09-27-sso-for-integrations.md
//   node scripts/render-diagrams.js blog/2026-09-27-sso-for-integrations.md
//
// Drafts in blog/ render into blog/_diagrams/<slug>/ (gitignored with the
// rest of blog/). Published posts in posts/ render into posts/diagrams/<slug>/
// and those SVGs are committed with the post.
//
// Requires: @mermaid-js/mermaid-cli on PATH as `mmdc`, and a Chromium for it.
// Set PUPPETEER_EXECUTABLE_PATH if mmdc cannot find one.

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const src = process.argv[2];
if (!src) { console.error('usage: render-diagrams.js <post.md>'); process.exit(2); }

const md = fs.readFileSync(src, 'utf8');
const slug = (md.match(/^slug:\s*"?([^"\n]+)"?/m) || [])[1];
if (!slug) { console.error(`${src}: no slug in front matter`); process.exit(2); }

const postDir = path.dirname(src);
const base = path.basename(postDir) === 'posts'
  ? path.join(postDir, 'diagrams', slug)
  : path.join(postDir, '_diagrams', slug);
fs.mkdirSync(base, { recursive: true });

const fences = [];
const re = /^```mermaid[^\n]*\n([\s\S]*?)^```/gm;
let m;
while ((m = re.exec(md))) fences.push(m[1]);
if (!fences.length) { console.log(`${src}: no mermaid fences`); process.exit(0); }

// Puppeteer config: let mmdc find the browser we have, sandbox off for CI-ish
// containers. Written to the OS temp dir, never into the repo: the repo may be
// a mount where unlink is not permitted, and a leftover config next to the
// diagrams would be committed with them.
const os = require('os');
const pptr = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'mmdc-')), 'puppeteer.json');
const exe = process.env.PUPPETEER_EXECUTABLE_PATH;
fs.writeFileSync(pptr, JSON.stringify({
  ...(exe ? { executablePath: exe } : {}),
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
}));

let rendered = 0, skipped = 0;
fences.forEach((source, i) => {
  const n = i + 1;
  const mmd = path.join(base, `${n}.mmd`);
  const svg = path.join(base, `${n}.svg`);
  if (fs.existsSync(mmd) && fs.existsSync(svg) && fs.readFileSync(mmd, 'utf8') === source) {
    skipped++; return;                       // unchanged since last render
  }
  fs.writeFileSync(mmd, source);
  execFileSync('mmdc', [
    '-i', mmd, '-o', svg,
    '-b', 'transparent',
    '-t', 'neutral',
    '--svgId', `diagram-${slug}-${n}`,        // unique ids: several SVGs share one page
    '-p', pptr,
    '-c', path.join(__dirname, 'mermaid-config.json'),
  ], { stdio: 'inherit' });
  // mmdc writes a fixed pixel max-width; let the page decide instead.
  let out = fs.readFileSync(svg, 'utf8');
  out = out.replace(/style="max-width:\s*[\d.]+px;/, 'style="max-width: 100%;');
  fs.writeFileSync(svg, out);
  rendered++;
});
try { fs.rmSync(path.dirname(pptr), { recursive: true, force: true }); } catch (e) { /* temp dir, best effort */ }
console.log(`${src}: ${fences.length} diagram(s), ${rendered} rendered, ${skipped} unchanged -> ${base}/`);
