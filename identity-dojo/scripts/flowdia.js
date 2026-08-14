// flowdia.js — sequence-diagram generator for auth-flow lessons.
//
// Turns a small spec (actors + steps) into a self-contained inline <svg>
// that inherits the site theme through CSS variables (see styles.css
// ".flowDia"). Used by gen-flows.js, which bakes the SVG into the stream
// files between <!--flow:ID--> ... <!--/flow:ID--> markers, so the built
// site needs no extra runtime and both build.js variants keep working.
//
// Spec shape:
//   {
//     id: 'oa1-authcode',                    // unique; namespaces SVG ids
//     file: '16d-oauth2-oidc-flows.js',      // stream file holding the markers
//     title: 'Authorization Code flow',      // aria-label
//     width: 720,                            // optional viewBox width
//     actors: [ {id:'b', label:'Browser', sub:'front channel'}, ... ],
//     steps: [
//       {n:1, from:'c', to:'as', label:'GET /authorize?...', ch:'front'},
//       {n:2, self:'as', label:'User logs in & consents'},
//       {to:'c', from:'as', label:'302 redirect with code', ch:'front', ret:true},
//       {phase:'later, when the token expires'},
//       {note:'Everything above the line is visible to the browser.'},
//     ]
//   }
//
// Channels (ch): 'front' (accent, via the browser), 'back' (accent2,
// server-to-server), 'attack' (bad, dashed), default '' (ink/muted).
// ret:true renders the arrow dashed (a response/redirect back).
// Identity never rides on color alone: a legend names every channel used,
// and the numbered list in the lesson prose restates each step in words.

const COLORS = {
  front:  'var(--accent)',
  back:   'var(--accent2)',
  attack: 'var(--bad)',
  '':     'var(--muted)',
};
const CH_LABEL = {
  front: 'front channel (via the browser)',
  back: 'back channel (server to server)',
  attack: 'attack path',
};

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function render(spec) {
  const M = 14;                 // side margin
  const n = spec.actors.length;
  const W = spec.width || Math.max(560, 150 * n);
  const colGap = (W - 2 * M - 120) / Math.max(1, n - 1);
  const x = i => M + 60 + i * colGap;
  const ix = Object.fromEntries(spec.actors.map((a, i) => [a.id, i]));
  const twoLine = spec.actors.some(a => a.sub || String(a.label).includes('\n'));
  const boxH = twoLine ? 46 : 34;
  const topY = 8, lifeTop = topY + boxH;

  // measure rows
  const rows = [];
  let y = lifeTop + 26;
  for (const s of spec.steps) {
    const lines = String(s.label || '').split('\n').length;
    let h;
    if (s.phase !== undefined) h = 30;
    else if (s.note !== undefined) h = 24 + (String(s.note).split('\n').length - 1) * 14;
    else if (s.self) h = 36;
    else h = 30 + (lines - 1) * 13 + (lines > 1 ? 4 : 0);
    rows.push({ s, y: y + h - 8, h });
    y += h;
  }
  const chansUsed = [...new Set(spec.steps.map(s => s.ch).filter(c => c && CH_LABEL[c]))];
  const legendH = chansUsed.length > 1 ? 26 : 6;
  const H = y + 10 + legendH;

  const out = [];
  out.push(`<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(spec.title)}">`);
  // arrowhead markers, one per channel color, namespaced by spec id
  out.push('<defs>');
  for (const [ch, col] of Object.entries(COLORS)) {
    out.push(`<marker id="${spec.id}-ah-${ch || 'x'}" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0 0.8 L9.2 5 L0 9.2 Z" fill="${col}"/></marker>`);
  }
  out.push('</defs>');

  // lifelines
  for (let i = 0; i < n; i++) {
    out.push(`<line x1="${x(i)}" y1="${lifeTop}" x2="${x(i)}" y2="${H - legendH - 6}" class="fdLife"/>`);
  }
  // actor boxes
  spec.actors.forEach((a, i) => {
    const bw = Math.min(colGap - 10, Math.max(78, 8.2 * Math.max(...String(a.label).split('\n').map(t => t.length)) + 22));
    out.push(`<rect x="${x(i) - bw / 2}" y="${topY}" width="${bw}" height="${boxH}" rx="8" class="fdActor"/>`);
    const lls = String(a.label).split('\n');
    const ly0 = topY + (a.sub ? 19 : boxH / 2 + 4.5) - (lls.length - 1) * 6.5;
    lls.forEach((t, k) => out.push(`<text x="${x(i)}" y="${ly0 + k * 13}" class="fdActorT">${esc(t)}</text>`));
    if (a.sub) out.push(`<text x="${x(i)}" y="${topY + 34}" class="fdActorS">${esc(a.sub)}</text>`);
  });

  // steps
  for (const { s, y: sy } of rows) {
    const col = COLORS[s.ch || ''] || COLORS[''];
    if (s.phase !== undefined) {
      out.push(`<line x1="${M}" y1="${sy - 4}" x2="${W - M}" y2="${sy - 4}" class="fdPhase"/>`);
      if (s.phase) out.push(`<text x="${W / 2}" y="${sy}" class="fdPhaseT">${esc(s.phase)}</text>`);
      continue;
    }
    if (s.note !== undefined) {
      String(s.note).split('\n').forEach((t, k) =>
        out.push(`<text x="${W / 2}" y="${sy - 6 + k * 14}" class="fdNote">${esc(t)}</text>`));
      continue;
    }
    if (s.self) {
      const cx = x(ix[s.self]);
      const lab = String(s.label).split('\n');
      const pw = Math.min(W - 2 * M, Math.max(...lab.map(t => t.length)) * 6.6 + 26);
      // clamp the pill inside the canvas — edge actors would otherwise clip
      let px = cx;
      if (px - pw / 2 < M) px = M + pw / 2;
      if (px + pw / 2 > W - M) px = W - M - pw / 2;
      out.push(`<rect x="${px - pw / 2}" y="${sy - 19}" width="${pw}" height="${22 + (lab.length - 1) * 13}" rx="11" class="fdSelf" style="stroke:${col}"/>`);
      lab.forEach((t, k) => out.push(`<text x="${px + (s.n ? 8 : 0)}" y="${sy - 4 + k * 13}" class="fdSelfT">${esc(t)}</text>`));
      if (s.n) out.push(badge(px - pw / 2, sy - 8, s.n, col));
      continue;
    }
    const x1 = x(ix[s.from]), x2 = x(ix[s.to]);
    const dir = x2 > x1 ? 1 : -1;
    const dash = s.ch === 'attack' ? ' stroke-dasharray="7 4"' : (s.ret ? ' stroke-dasharray="4 4"' : '');
    out.push(`<line x1="${x1 + dir * 3}" y1="${sy}" x2="${x2 - dir * 5}" y2="${sy}" stroke="${col}" class="fdArrow"${dash} marker-end="url(#${spec.id}-ah-${s.ch || 'x'})"/>`);
    const mid = (x1 + dir * (s.n !== undefined ? 30 : 6) + x2) / 2;
    const lls = String(s.label || '').split('\n');
    lls.forEach((t, k) => out.push(`<text x="${mid}" y="${sy - 9 - (lls.length - 1 - k) * 13}" class="fdLabel${s.ch === 'attack' ? ' fdLabelBad' : ''}">${esc(t)}</text>`));
    if (s.n !== undefined) out.push(badge(x1 + dir * 18, sy, s.n, col));
  }

  // legend
  if (chansUsed.length > 1) {
    let lx = M + 4;
    const ly = H - 10;
    for (const ch of chansUsed) {
      const col = COLORS[ch];
      const dash = ch === 'attack' ? ' stroke-dasharray="7 4"' : '';
      out.push(`<line x1="${lx}" y1="${ly - 4}" x2="${lx + 26}" y2="${ly - 4}" stroke="${col}" class="fdArrow"${dash}/>`);
      const t = CH_LABEL[ch];
      out.push(`<text x="${lx + 32}" y="${ly}" class="fdLegend">${esc(t)}</text>`);
      lx += 32 + t.length * 6.3 + 26;
    }
  }
  out.push('</svg>');
  return `<div class="flowDia">${out.join('')}</div>`;
}

function badge(cx, cy, n, col) {
  return `<circle cx="${cx}" cy="${cy}" r="9" class="fdNum" style="stroke:${col}"/>`
    + `<text x="${cx}" y="${cy + 3.5}" class="fdNumT" style="fill:${col}">${n}</text>`;
}

// Numbered <ol> matching the diagram, generated from the same steps so the
// two can never disagree. Actor names come from the spec; channel noted where
// it matters. Specs with hand-written prose set bare:true to skip this.
const CH_NOTE = {
  front: ' <i>(front channel)</i>',
  back: ' <i>(back channel)</i>',
  attack: ' <b>⚠ attack</b>',
};
function renderSteps(spec) {
  const name = Object.fromEntries(spec.actors.map(a => [a.id, String(a.label).split('\n')[0]]));
  const items = spec.steps.filter(s => s.n !== undefined)
    .sort((a, b) => a.n - b.n)
    .map(s => {
      const who = s.self ? `<b>${esc(name[s.self])}:</b>` : `<b>${esc(name[s.from])} → ${esc(name[s.to])}:</b>`;
      return `<li>${who} ${esc(String(s.label).replace(/\n/g, ' '))}${CH_NOTE[s.ch] || ''}</li>`;
    });
  return `<ol class="fdSteps">\n${items.join('\n')}\n</ol>`;
}

module.exports = { render, renderSteps };
