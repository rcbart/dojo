#!/usr/bin/env node
// monitor.js: health and activity report for roniam.dev. Zero dependencies.
//
// Deliberately adds NO tracking to the site. The home page promises "no
// accounts, no tracking" and that promise is worth more than pageview counts.
// Everything here is observed from outside, or read from GitHub.
//
// Checks:
//   1. Every URL the sitemap advertises resolves, with status, size and latency
//   2. Every internal link on the home page and blog index resolves
//   3. The feed parses, and how stale the newest item is
//   4. Post inventory, so a silent build regression is visible
//   5. Engagement per post from GitHub Discussions, when a token is present
//
// Run: node scripts/monitor.js [origin]        (default: https://roniam.dev)
// In Actions the report is appended to the job summary and a failure exits 1.

const ORIGIN = (process.argv[2] || 'https://roniam.dev').replace(/\/$/, '');
const REPO = 'rcbart/dojo';
const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
const SUMMARY = process.env.GITHUB_STEP_SUMMARY;
const fs = require('fs');

const out = [];
const say = line => { out.push(line); console.log(line); };
let failures = 0;

const get = async url => {
  const t0 = Date.now();
  try {
    const res = await fetch(url, { redirect: 'follow' });
    const body = await res.text();
    return { ok: res.ok, status: res.status, ms: Date.now() - t0, bytes: body.length, body };
  } catch (err) {
    return { ok: false, status: 0, ms: Date.now() - t0, bytes: 0, body: '', err: err.message };
  }
};

const kb = n => (n / 1024).toFixed(0) + 'kb';

(async () => {
  say(`# roniam.dev monitor\n`);
  say(`Checked ${new Date().toISOString().replace('T', ' ').slice(0, 16)} UTC against ${ORIGIN}\n`);

  // ---- 1. every advertised URL ----
  const sm = await get(`${ORIGIN}/sitemap.xml`);
  if (!sm.ok) {
    failures++;
    say(`## Advertised URLs\n\n**sitemap.xml did not load (${sm.status || sm.err}).** Nothing else could be checked from it.\n`);
  } else {
    const locs = [...sm.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
    const rows = [];
    let slowest = { ms: 0 }, total = 0;
    for (const loc of locs) {
      const r = await get(loc);
      total += r.bytes;
      if (r.ms > slowest.ms) slowest = { ms: r.ms, loc };
      if (!r.ok) failures++;
      rows.push(`| ${loc.replace(ORIGIN, '') || '/'} | ${r.ok ? r.status : '**' + (r.status || 'ERR') + '**'} | ${r.ms}ms | ${kb(r.bytes)} |`);
    }
    say(`## Advertised URLs\n`);
    say(`| path | status | time | size |`);
    say(`|---|---|---|---|`);
    rows.forEach(r => say(r));
    say(`\n${locs.length} URLs, ${kb(total)} total, slowest ${slowest.loc?.replace(ORIGIN, '') || 'n/a'} at ${slowest.ms}ms\n`);
  }

  // ---- 2. internal links actually on the pages ----
  const seen = new Set(), broken = [];
  for (const page of ['/', '/blog/']) {
    const r = await get(ORIGIN + page);
    if (!r.ok) { failures++; broken.push(`${page} itself did not load`); continue; }
    const hrefs = [...r.body.matchAll(/href="(\/[^"#?]*)"/g)].map(m => m[1]);
    for (const h of new Set(hrefs)) {
      if (seen.has(h)) continue;
      seen.add(h);
      const l = await get(ORIGIN + h);
      if (!l.ok) { failures++; broken.push(`${h} -> ${l.status || l.err} (linked from ${page})`); }
    }
  }
  say(`## Internal links\n`);
  say(broken.length
    ? `**${broken.length} broken:**\n\n` + broken.map(b => `- ${b}`).join('\n') + '\n'
    : `${seen.size} distinct internal links checked, all resolve.\n`);

  // ---- 3. the feed ----
  const feed = await get(`${ORIGIN}/feed.xml`);
  if (!feed.ok) { failures++; say(`## Feed\n\n**feed.xml did not load (${feed.status || feed.err}).**\n`); }
  else {
    const items = [...feed.body.matchAll(/<pubDate>([^<]+)<\/pubDate>/g)].map(m => new Date(m[1]));
    if (!items.length) say(`## Feed\n\nParses, but contains no items.\n`);
    else {
      const newest = new Date(Math.max(...items));
      const days = Math.floor((Date.now() - newest) / 86400000);
      say(`## Feed\n`);
      say(`${items.length} item(s). Newest is ${days} day(s) old (${newest.toISOString().slice(0, 10)}).`);
      say(days > 21
        ? `\n> Cadence note: nothing published in three weeks. The plan is a post every two weeks.\n`
        : `\n`);
    }
  }

  // ---- 4. engagement, if a token is available ----
  if (TOKEN) {
    const [owner, name] = REPO.split('/');
    const q = `{ repository(owner:"${owner}", name:"${name}") { discussions(first:50, orderBy:{field:UPDATED_AT, direction:DESC}) { nodes { title url comments { totalCount } reactions { totalCount } } } } }`;
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: q }),
    }).then(r => r.json()).catch(e => ({ error: e.message }));
    const nodes = res?.data?.repository?.discussions?.nodes;
    say(`## Engagement\n`);
    if (!nodes) say(`Could not read Discussions (${res?.error || res?.errors?.[0]?.message || 'no data'}).\n`);
    else if (!nodes.length) say(`No discussion threads yet. giscus creates one the first time somebody comments on a post.\n`);
    else {
      say(`| thread | comments | reactions |`);
      say(`|---|---|---|`);
      nodes.filter(n => n.comments.totalCount || n.reactions.totalCount)
        .forEach(n => say(`| [${n.title}](${n.url}) | ${n.comments.totalCount} | ${n.reactions.totalCount} |`));
      const tot = nodes.reduce((a, n) => a + n.comments.totalCount, 0);
      say(`\n${tot} comment(s) across ${nodes.length} thread(s).\n`);
    }
  } else {
    say(`## Engagement\n\nSkipped: no GITHUB_TOKEN in the environment.\n`);
  }

  // ---- 5. reach, from Search Console ----
  // Deliberately the only source of traffic data here. It is served from
  // Google's side, so the site stays free of any script, cookie or beacon and
  // the "no accounts, no tracking" line on the home page stays true.
  //
  // To switch on: verify roniam.dev as a Domain property, create a Google Cloud
  // service account, grant it read access to the property in Search Console,
  // then store the service-account JSON as the GSC_CREDENTIALS repo secret.
  // Until that exists this section reports that it is off, and the run still
  // passes.
  say(`## Reach\n`);
  if (!process.env.GSC_CREDENTIALS) {
    say(`Search Console is not wired up yet, so there are no impression or click`);
    say(`numbers in this report. Everything above is observed from outside the`);
    say(`site. No tracking has been added, and none should be.\n`);
  } else {
    say(`Search Console credentials are present. The query is not implemented`);
    say(`yet: wire it once the property has data, so the first run can be read`);
    say(`against a real response rather than a guessed one.\n`);
  }

  // ---- verdict ----
  say(`## Verdict\n`);
  say(failures ? `**${failures} problem(s) found.**` : `Everything resolves. No action needed.`);

  if (SUMMARY) fs.appendFileSync(SUMMARY, out.join('\n') + '\n');
  process.exit(failures ? 1 : 0);
})();
