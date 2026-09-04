#!/usr/bin/env node
/* Check every external link the site and the dojos point at.
 *
 * NOT a CI gate, and deliberately so: third-party hosts rate-limit, go down
 * for an hour, and answer 403 to anything that looks automated. A build that
 * fails because MDN was slow is a build people learn to ignore. Run this by
 * hand, from a machine with ordinary network access:
 *
 *     node scripts/verify-external-links.js              # check everything
 *     node scripts/verify-external-links.js --host mdn   # one host
 *     node scripts/verify-external-links.js --slow       # 4 at a time, kinder
 *
 * Exit code is 1 if anything looks genuinely dead, so it still works in a
 * pre-release script if you want it there.
 *
 * Reads links out of the content source rather than the built pages, so a
 * dead link is reported against the file you have to edit.
 */
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const ROOT = path.join(__dirname, '..');
const args = process.argv.slice(2);
const HOST_FILTER = (args.indexOf('--host') >= 0) ? args[args.indexOf('--host') + 1] : null;
const CONCURRENCY = args.includes('--slow') ? 4 : 12;
const TIMEOUT_MS = 20000;

/* Not links. These are XML namespaces, SAML claim URIs, OIDC event types and
   in-cluster hostnames from code samples: they are identifiers that happen to
   be shaped like URLs, and nothing is meant to resolve. */
const NOT_A_LINK = [
  // Identifiers shaped like URLs: XML namespaces, SAML claim URIs, OIDC issuers.
  /^https?:\/\/(www\.)?w3\.org\/\d{4}\//,
  /^https?:\/\/schemas\.(xmlsoap|microsoft|openid)\./,
  /^https?:\/\/[^/]*\/ns\//,
  /^https:\/\/token\.actions\.githubusercontent\.com/,   // GitHub's OIDC issuer claim
  /^https:\/\/kubernetes\.default\.svc/,                  // in-cluster API address

  // Hostnames that teach rather than resolve. Every course uses these in code
  // samples and request traces; none is meant to be clicked, and reporting them
  // as dead trains the reader of this report to skim.
  /^https?:\/\/[^/]*\.example(\/|$|:)/i,                  // app.example, idp.example, ...
  /example\.(com|org|net)/i,
  /^https?:\/\/[^/]*(evil|attacker|malicious|phish)/i,
  /^https?:\/\/[^/]*\.(internal|local|localhost|test|invalid|corp\.com)(\/|$|:)/i,
  /^https?:\/\/(api|auth|as|idp|app|web|php|myapp|billing|bank|who|dmv|bar|foo)\.dojo\.dev/i,
  /^https?:\/\/[^/]*dojo\.dev/i,                           // the courses' own worked API
  /\byour(name|domain|-app|app)\b/i,
  /^https?:\/\/(acme|beta|alpha)\b/i,
  /github\.com\/(you|acme|your-org)\//i,
  /^https?:\/\/[a-c]\.com(\/|$)/i,                        // a.com, b.com, c.com in samples
  /^https?:\/\/x\.dev(\/|$)/i,

  // Structural noise from extraction: bare schemes, table pipes, entity fragments.
  /^https?:\/\/$/,
  /\|/,
  /&lt;|&gt;|&amp;lt/,
  /\blocalhost\b|127\.0\.0\.1|:\d{4}\//,
  /YOUR-|THEIR-|<[a-z-]+>|\$\{|@@|\.\.\.|…/,
  /^https?:\/\/[^./\s]+(\/|$)/,   // no dot in the host: a sample, not a domain
];

/* Codes that mean "a robot asked", not "the page is gone". LinkedIn answers 999
   to everything automated; Buttondown's subscribe endpoint is POST-only and
   answers 400 to a GET. Both links are correct for a human. */
const NOT_DEAD = { 999: 'anti-bot', 400: 'POST-only endpoint' };

function sourceFiles() {
  const out = [];
  const add = p => { try { if (fs.statSync(p).isFile()) out.push(p); } catch (e) {} };
  const walk = (d, re) => {
    let entries; try { entries = fs.readdirSync(d); } catch (e) { return; }
    for (const f of entries) {
      const p = path.join(d, f);
      let s; try { s = fs.statSync(p); } catch (e) { continue; }
      if (s.isDirectory()) { if (!/node_modules|_site|dist|\.git|_to_delete/.test(p)) walk(p, re); }
      else if (re.test(f)) out.push(p);
    }
  };
  ['docs/home.html', 'docs/landing.html', 'skills-rubric.html', 'README.md',
   'src/quizzes_hand.js', 'identity-dojo/src/quizzes_hand.js', 'js-dojo/src/quizzes_hand.js']
    .forEach(f => add(path.join(ROOT, f)));
  ['content/streams', 'identity-dojo/content/streams', 'js-dojo/content/streams']
    .forEach(d => walk(path.join(ROOT, d), /\.js$/));
  walk(path.join(ROOT, 'posts'), /\.md$/);
  for (const c of ['fundamentals', 'docker', 'kubernetes', 'envoy', 'istio'])
    walk(path.join(ROOT, c + '-crash-course', 'web'), /\.md$/);
  return out;
}

function collect() {
  const urls = new Map();                       // url -> Set(source file)
  for (const f of sourceFiles()) {
    const rel = path.relative(ROOT, f);
    const text = fs.readFileSync(f, 'utf8');
    // Parentheses are legal in URLs (Wikipedia's Thread_(computing) is the
    // case that caught this), so they are matched and then balanced: a
    // trailing ")" is dropped only when it closes nothing.
    for (const m of text.matchAll(/https?:\/\/[^\s"'`<>\\\]]+/g)) {
      let url = m[0].replace(/[.,;:]+$/, '').replace(/&amp;/g, '&');
      while (url.endsWith(')') &&
             (url.match(/\)/g) || []).length > (url.match(/\(/g) || []).length) {
        url = url.slice(0, -1);
      }
      if (NOT_A_LINK.some(re => re.test(url))) continue;
      if (!urls.has(url)) urls.set(url, new Set());
      urls.get(url).add(rel);
    }
  }
  return urls;
}

function head(url, redirects = 0) {
  return new Promise(resolve => {
    if (redirects > 5) return resolve({ code: 0, note: 'too many redirects' });
    let u; try { u = new URL(url); } catch (e) { return resolve({ code: 0, note: 'malformed' }); }
    const lib = u.protocol === 'http:' ? http : https;
    const req = lib.request(u, {
      method: redirects === 0 ? 'HEAD' : 'GET',
      timeout: TIMEOUT_MS,
      headers: {
        // Several doc hosts serve 403 to anything without a browser UA.
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
                      '(KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/pdf,*/*',
      },
    }, res => {
      const code = res.statusCode;
      res.resume();
      if (code >= 300 && code < 400 && res.headers.location) {
        const next = new URL(res.headers.location, u).toString();
        return resolve(head(next, redirects + 1));
      }
      // A HEAD that is refused or 404s is retried as a GET: plenty of hosts
      // only implement GET properly, and answer nonsense to HEAD.
      if ((code === 403 || code === 404 || code === 405 || code === 501) && redirects === 0)
        return resolve(head(url, 1));
      resolve({ code });
    });
    req.on('timeout', () => { req.destroy(); resolve({ code: 0, note: 'timeout' }); });
    req.on('error', e => resolve({ code: 0, note: e.code || e.message }));
    req.end();
  });
}

(async () => {
  let urls = [...collect().entries()];
  if (HOST_FILTER) urls = urls.filter(([u]) => u.includes(HOST_FILTER));
  console.log(`checking ${urls.length} external link(s) from ${sourceFiles().length} source file(s)` +
              (HOST_FILTER ? ` matching "${HOST_FILTER}"` : '') + `, ${CONCURRENCY} at a time\n`);

  const dead = [], soft = [];
  let done = 0;
  const queue = urls.slice();
  await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
    for (;;) {
      const item = queue.shift();
      if (!item) return;
      const [url, files] = item;
      const { code, note } = await head(url);
      done++;
      if (done % 50 === 0) process.stdout.write(`  ...${done}/${urls.length}\n`);
      if (code >= 200 && code < 400) continue;
      const row = { url, code, note, files: [...files] };
      // 403, 429 and the codes above are the host refusing a robot, not a dead
      // page. ECONNRESET and redirect loops are usually bot defenses too.
      const refused = code === 403 || code === 429 || NOT_DEAD[code] ||
                      note === 'ECONNRESET' || note === 'too many redirects' || note === 'timeout';
      (refused ? soft : dead).push(row);
    }
  }));

  const show = (title, rows) => {
    if (!rows.length) return;
    console.log(`\n${title} (${rows.length})`);
    for (const r of rows.sort((a, b) => a.url.localeCompare(b.url))) {
      console.log(`  ${String(r.code || r.note).padEnd(8)} ${r.url}`);
      console.log(`           ${r.files.slice(0, 3).join(', ')}`);
    }
  };
  show('LIKELY DEAD, fix these', dead);
  show('Refused a robot (403/429), check by hand before changing anything', soft);

  console.log(`\n${urls.length} checked, ${dead.length} likely dead, ${soft.length} refused, ` +
              `${urls.length - dead.length - soft.length} fine`);
  process.exit(dead.length ? 1 : 0);
})();
