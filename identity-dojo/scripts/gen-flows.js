#!/usr/bin/env node
// gen-flows.js, bake generated auth-flow diagrams into the stream files.
//
// Reads every spec in scripts/flows/, renders it with flowdia.js, and
// replaces the content between <!--flow:ID--> and <!--/flow:ID--> markers
// in the owning stream file. Idempotent: run it any time a spec changes.
// Fails loudly if a spec has no markers or markers have no spec, so the
// two can never drift apart silently.
//
// Run: node scripts/gen-flows.js          (from identity-dojo/)
const fs = require('fs');
const path = require('path');
const { render, renderSteps } = require('./flowdia');

const ROOT = path.join(__dirname, '..');
const STREAMS = path.join(ROOT, 'content', 'streams');
const specs = require('./flows');

const byFile = new Map();
for (const s of specs) {
  if (!byFile.has(s.file)) byFile.set(s.file, []);
  byFile.get(s.file).push(s);
}

let wrote = 0, errors = 0;
for (const [file, list] of byFile) {
  const p = path.join(STREAMS, file);
  let src = fs.readFileSync(p, 'utf8');
  for (const spec of list) {
    const open = `<!--flow:${spec.id}-->`, close = `<!--/flow:${spec.id}-->`;
    const a = src.indexOf(open), b = src.indexOf(close);
    if (a === -1 || b === -1) {
      console.error(`MISSING MARKERS for ${spec.id} in ${file}`);
      errors++; continue;
    }
    const head = spec.bare ? '' : `<h4>${spec.title}, step by step</h4>\n`;
    const steps = spec.bare ? '' : '\n' + renderSteps(spec);
    src = src.slice(0, a + open.length) + '\n' + head + render(spec) + steps + '\n' + src.slice(b);
    wrote++;
  }
  fs.writeFileSync(p, src);
}

// orphan markers (marker in a file with no spec), warn so they get cleaned up
const known = new Set(specs.map(s => s.id));
for (const f of fs.readdirSync(STREAMS).filter(f => f.endsWith('.js'))) {
  const src = fs.readFileSync(path.join(STREAMS, f), 'utf8');
  for (const m of src.matchAll(/<!--flow:([a-z0-9-]+)-->/g)) {
    if (!known.has(m[1])) { console.error(`ORPHAN MARKER ${m[1]} in ${f}`); errors++; }
  }
}

console.log(`baked ${wrote} flow diagrams into ${byFile.size} stream files`);
if (errors) { console.error(`${errors} problem(s)`); process.exit(1); }
