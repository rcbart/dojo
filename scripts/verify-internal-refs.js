#!/usr/bin/env node
/* Gate 17. Every repo-relative reference resolves to a file that exists.
 *
 * verify-links.py checks the ASSEMBLED site, so it only sees what ships. It
 * cannot see the cross-links between crash-course markdown files, the
 * relative links in README.md, or an <img src> pointing at a missing asset,
 * because none of those files deploy: they are read on GitHub. Those broke
 * silently until this existed. Run: node scripts/verify-internal-refs.js
 */
const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..');
let checked=0; const bad=[];
const exists=p=>{try{fs.statSync(p);return true}catch(e){return false}};

// 1. Relative links between markdown files (these resolve on GitHub, where the
//    crash-course sources are read; they never deploy to the site).
const mdDirs=['fundamentals','docker','kubernetes','envoy','istio'].map(c=>ROOT+'/'+c+'-crash-course/web');
mdDirs.push(ROOT+'/posts');
for(const d of mdDirs){ if(!exists(d))continue;
  for(const f of fs.readdirSync(d).filter(x=>x.endsWith('.md'))){
    const src=path.join(d,f), t=fs.readFileSync(src,'utf8');
    for(const m of t.matchAll(/\]\((?!https?:|#|mailto:)([^)#\s]+)(#[^)\s]*)?\)/g)){
      checked++;
      const target=path.resolve(d,m[1]);
      if(!exists(target)) bad.push(['md-rel',path.relative(ROOT,src),m[1]]);
    }
  }
}
// 2. README and root markdown relative links.
for(const f of ['README.md']){
  const src=ROOT+'/'+f; if(!exists(src))continue;
  const t=fs.readFileSync(src,'utf8');
  for(const m of t.matchAll(/\]\((?!https?:|#|mailto:)([^)#\s]+)(#[^)\s]*)?\)/g)){
    checked++;
    if(!exists(path.resolve(ROOT,m[1]))) bad.push(['readme',f,m[1]]);
  }
}
// 3. Every href in the shipped HTML pages that points at a repo-relative asset.
for(const f of ['docs/home.html','docs/landing.html','skills-rubric.html']){
  const src=ROOT+'/'+f; if(!exists(src))continue;
  const t=fs.readFileSync(src,'utf8');
  for(const m of t.matchAll(/(?:href|src)="(?!https?:|\/\/|#|mailto:|data:)([^"]+)"/g)){
    checked++;
    const rel=m[1].split(/[?#]/)[0];
    if(rel.startsWith('/')) continue;            // site-absolute, gated by verify-links
    if(!exists(path.resolve(path.dirname(src),rel))) bad.push(['html-rel',f,m[1]]);
  }
}
// 4. Site-absolute asset paths (/img/..., /css/...) must exist under docs/.
for(const f of ['docs/home.html','docs/landing.html','skills-rubric.html']){
  const src=ROOT+'/'+f; if(!exists(src))continue;
  const t=fs.readFileSync(src,'utf8');
  for(const m of t.matchAll(/(?:href|src)="(\/[^"]+\.(?:png|jpg|jpeg|svg|webp|ico|css|js))"/g)){
    checked++;
    const rel=m[1].split(/[?#]/)[0];
    if(!exists(ROOT+'/docs'+rel)) bad.push(['asset',f,m[1]]);
  }
}
console.log('internal references checked:',checked);
if(!bad.length){console.log('all internal references resolve');process.exit(0);}
console.log('BROKEN:',bad.length);
for(const b of bad)console.log('  ',b[0].padEnd(9),b[1],'->',b[2]);
process.exit(1);
