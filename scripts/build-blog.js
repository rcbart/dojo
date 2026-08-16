#!/usr/bin/env node
// build-blog.js: static blog + portfolio home for roniam.dev. Zero dependencies.
//
// Reads posts/*.md (published; blog/*.md drafts too with INCLUDE_DRAFTS=1), renders:
//   OUT/index.html          = docs/home.html with @@POSTS@@ / @@YEAR@@ filled in
//   OUT/blog/index.html     = the archive
//   OUT/blog/<slug>/index.html = one page per post
//
// Markdown subset (all this blog uses): # ## ### headings, ``` fences, `code`,
// **bold**, *italic*, [text](url), > quotes, - lists, --- rules, paragraphs.
// Publishing = moving a file from blog/ to posts/ (see the blog-post skill).
//
// Run: node scripts/build-blog.js [outDir]     (default: dist-site)
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.resolve(process.argv[2] || 'dist-site');

// ---- comments (giscus: GitHub Discussions-backed) ----
// Rendered on every published post page. Requires one-time setup on GitHub:
//   1. repo Settings -> Features -> enable Discussions
//   2. install the giscus app for rcbart/dojo (github.com/apps/giscus)
//   3. create an Announcements-type category "Blog comments"
//   4. open giscus.app, pick the repo + category, and paste the two IDs below
// Until both IDs are filled in, no comments block is emitted (the build stays valid).
const GISCUS = {
  repo: 'rcbart/dojo',
  repoId: '',       // looks like  R_kgDO...   (from giscus.app)
  category: 'Blog comments',
  categoryId: '',   // looks like  DIC_kwDO...  (from giscus.app)
};
const giscusBlock = () => (GISCUS.repoId && GISCUS.categoryId) ? `
<section class="comments">
  <h2 style="font-size:20px;margin:44px 0 4px">Comments</h2>
  <p style="color:var(--muted);font-size:13.5px;margin:0 0 14px">Signed with your GitHub account — identity required, drive-by anonymity not offered.</p>
  <script src="https://giscus.app/client.js"
        data-repo="${GISCUS.repo}"
        data-repo-id="${GISCUS.repoId}"
        data-category="${GISCUS.category}"
        data-category-id="${GISCUS.categoryId}"
        data-mapping="pathname"
        data-strict="1"
        data-reactions-enabled="1"
        data-emit-metadata="0"
        data-input-position="top"
        data-theme="light"
        data-lang="en"
        data-loading="lazy"
        crossorigin="anonymous"
        async>
  </scr` + `ipt>
</section>` : '';

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function inline(s) {
  // escape first, then apply spans; code spans protect their contents
  let out = esc(s);
  out = out.replace(/`([^`]+)`/g, (_, c) => `<code>${c}</code>`);
  out = out.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
  out = out.replace(/\*([^*]+)\*/g, '<i>$1</i>');
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  return out;
}

function md(src) {
  const lines = src.split('\n');
  const out = [];
  let i = 0, para = [];
  const flush = () => { if (para.length) { out.push(`<p>${inline(para.join(' '))}</p>`); para = []; } };
  while (i < lines.length) {
    const l = lines[i];
    if (l.startsWith('```')) {
      flush();
      const lang = l.slice(3).trim(); const buf = []; i++;
      while (i < lines.length && !lines[i].startsWith('```')) buf.push(lines[i++]);
      i++; out.push(`<pre class="code"${lang ? ` data-lang="${esc(lang)}"` : ''}><code>${esc(buf.join('\n'))}</code></pre>`);
      continue;
    }
    if (/^#{1,4} /.test(l)) { flush(); const d = l.match(/^#+/)[0].length; out.push(`<h${d + 1}>${inline(l.slice(d + 1))}</h${d + 1}>`); i++; continue; }
    if (/^---+\s*$/.test(l)) { flush(); out.push('<hr>'); i++; continue; }
    if (/^> /.test(l)) {
      flush(); const buf = [];
      while (i < lines.length && /^> ?/.test(lines[i])) buf.push(lines[i++].replace(/^> ?/, ''));
      out.push(`<blockquote>${inline(buf.join(' '))}</blockquote>`); continue;
    }
    if (/^[-*] /.test(l)) {
      flush(); const buf = [];
      while (i < lines.length && /^[-*] /.test(lines[i])) buf.push(lines[i++].slice(2));
      out.push(`<ul>${buf.map(b => `<li>${inline(b)}</li>`).join('')}</ul>`); continue;
    }
    if (l.trim() === '') { flush(); i++; continue; }
    para.push(l.trim()); i++;
  }
  flush();
  return out.join('\n');
}

function frontMatter(src) {
  const m = src.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return [{}, src];
  const meta = {};
  for (const line of m[1].split('\n')) {
    const k = line.match(/^(\w+):\s*(.*)$/);
    if (k) meta[k[1]] = k[2].replace(/^"(.*)"$/, '$1');
  }
  return [meta, src.slice(m[0].length)];
}

const fmtDate = iso => new Date(iso + 'T12:00:00Z')
  .toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

// shared page chrome for blog pages; same brand as home.html, kept tiny
const page = (title, desc, body, root) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="icon" type="image/svg+xml" href='data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect x="1" y="1" width="30" height="30" rx="8" fill="%231a1f2b"/><g fill="none" stroke="%23d97706" stroke-width="2.4" stroke-linecap="round"><path d="M5 10.5 Q16 8 27 10.5" stroke-width="2.8"/><path d="M7.5 14.5 H24.5"/><path d="M10 11 V25"/><path d="M22 11 V25"/></g></svg>'>
<style>
  :root{--bg:#f6f6fa;--panel:#fff;--ink:#191530;--muted:#5b5872;--line:#e4e4f0;
        --accent:#f59e0b;--accent-ink:#b45309;--deep2:#0d9488;
        --serif:"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif}
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--ink);
       font:17px/1.7 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
  a{color:var(--deep2);text-decoration:none} a:hover{text-decoration:underline}
  .wrap{max-width:760px;margin:0 auto;padding:0 24px 70px}
  nav{border-bottom:1px solid var(--line)}
  .navrow{display:flex;align-items:center;gap:18px;padding:14px 0;font-size:14.5px;font-weight:600}
  .navrow a{color:var(--ink)}
  h1{font-family:var(--serif);font-size:clamp(28px,4.6vw,42px);line-height:1.15;margin:40px 0 8px;font-weight:600;letter-spacing:-.4px}
  h2{font-family:var(--serif);font-size:26px;margin:36px 0 10px;font-weight:600}
  h3{font-size:19px;margin:26px 0 8px}
  .pdate{color:var(--muted);font-size:14px;margin-bottom:26px}
  blockquote{border-left:4px solid var(--accent);margin:22px 0;padding:4px 0 4px 20px;
             font-family:var(--serif);font-style:italic;font-size:19px;color:var(--ink)}
  pre.code{background:#161b26;color:#e2e8f0;border-radius:10px;padding:14px 16px;overflow-x:auto;
           font:13px/1.55 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
  code{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:.92em;
       background:#ebebf5;border-radius:5px;padding:1.5px 5px}
  pre.code code{background:none;padding:0;font-size:inherit}
  hr{border:0;border-top:1px solid var(--line);margin:30px 0}
  .post{display:block;padding:20px 0;border-bottom:1px solid var(--line);color:inherit}
  .post:hover{text-decoration:none}
  .post h2{margin:0 0 6px;font-size:23px} .post:hover h2{color:var(--accent-ink)}
  .post p{color:var(--muted);margin:6px 0 0;font-size:15.5px}
  footer{border-top:1px solid var(--line);margin-top:50px;padding-top:20px;color:var(--muted);font-size:14px}
</style>
</head>
<body>
<nav><div class="wrap navrow" style="padding-bottom:14px">
  <a href="${root}">← roniam.dev</a><a href="${root}blog/">Writing</a>
  <span style="margin-left:auto"><a href="${root}identity/">Identity Dojo</a></span>
</div></nav>
<div class="wrap">
${body}
<footer>© ${new Date().getFullYear()} Ron Bar-Tor · <a href="https://github.com/rcbart">GitHub</a> · <span id="mailme" style="cursor:pointer;font-weight:600;color:var(--deep2)">email me</span> · <a href="https://github.com/rcbart/dojo/issues/new?template=bug_report.yml&labels=bug,blog">report an issue</a></footer>
</div>
<script>
(function(){const p=['rc','ba','rt'],d=['gm','ail'];document.getElementById('mailme').addEventListener('click',()=>{location.href='mailto:'+p.join('')+'@'+d.join('')+'.com?subject='+encodeURIComponent('Hello from roniam.dev')});})();
</script>
</body>
</html>`;

// ---- read posts ----
// Two directories, one publish gate:
//   posts/  tracked in git, always built  -> these are the published posts
//   blog/   gitignored, local drafts      -> built ONLY with INCLUDE_DRAFTS=1,
//           titles marked so a preview can never be mistaken for the real site
// Publishing a post = moving its file from blog/ to posts/ (see the blog-post skill).
const posts = [];
const sources = [['posts', true, ''], ['blog', process.env.INCLUDE_DRAFTS === '1', '[preview] ']];
for (const [dir, include, mark] of sources) {
  if (!include) continue;
  const dp = path.join(ROOT, dir);
  if (!fs.existsSync(dp)) continue;
  for (const f of fs.readdirSync(dp).filter(f => f.endsWith('.md'))) {
    const [meta, body] = frontMatter(fs.readFileSync(path.join(dp, f), 'utf8'));
    if (mark) meta.title = mark + (meta.title || f);
    const slug = meta.slug || f.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, '');
    posts.push({ meta, body, slug, date: meta.date || f.slice(0, 10) });
  }
}
posts.sort((a, b) => b.date.localeCompare(a.date));

// ---- emit ----
fs.mkdirSync(path.join(OUT, 'blog'), { recursive: true });

for (const p of posts) {
  const html = page(p.meta.title + ' · Ron Bar-Tor', p.meta.description || '',
    `<h1>${esc(p.meta.title)}</h1><div class="pdate">${fmtDate(p.date)}</div>` + md(p.body) + giscusBlock(), '/');
  fs.mkdirSync(path.join(OUT, 'blog', p.slug), { recursive: true });
  fs.writeFileSync(path.join(OUT, 'blog', p.slug, 'index.html'), html);
}

const list = root => posts.map(p =>
  `<a class="post" href="${root}blog/${p.slug}/"><h2>${esc(p.meta.title)}</h2>` +
  `<div class="pdate">${fmtDate(p.date)}</div><p>${esc(p.meta.description || '')}</p></a>`).join('\n');

fs.writeFileSync(path.join(OUT, 'blog', 'index.html'),
  page('Essays & proud scars · Ron Bar-Tor', 'Essays on engineering management, identity, and quality.',
    `<h1>Essays &amp; proud scars</h1><div class="pdate">Engineering management, identity, and the occasional bug worth telling the whole story about.</div>` + list('/'), '/'));

// home page: fill @@POSTS@@ (latest 3, home-styled), @@NAVPOSTS@@ (sidebar
// links, latest 5, title only) and @@YEAR@@
const navPosts = posts.length
  ? posts.slice(0, 5).map(p =>
      `<a class="snav post" href="/blog/${p.slug}/" title="${esc(p.meta.title)}">${esc(p.meta.title)}</a>`).join('\n  ')
  : '<span class="snone">first post coming soon</span>';
const mainPosts = posts.length
  ? posts.slice(0, 3).map(p =>
      `<a class="post" href="/blog/${p.slug}/"><div class="pdate">${fmtDate(p.date)}</div>` +
      `<h3>${esc(p.meta.title)}</h3><p>${esc(p.meta.description || '')}</p></a>`).join('\n')
  : '<p class="secdesc">First post coming soon.</p>';
const home = fs.readFileSync(path.join(ROOT, 'docs', 'home.html'), 'utf8')
  .replace('@@POSTS@@', mainPosts)
  .replace('@@NAVPOSTS@@', navPosts)
  .replace('@@YEAR@@', String(new Date().getFullYear()));
fs.writeFileSync(path.join(OUT, 'index.html'), home);

console.log(`built home + ${posts.length} post(s) + archive into ${OUT}`);
