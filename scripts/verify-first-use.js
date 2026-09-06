// Per lesson: acronyms/jargon used in prose that the lesson never expands or glosses.
// Per lesson: known terms (glossary keys) used in prose that the lesson never expands or glosses at first use.
// Heuristic: the glossary expansion appears somewhere in the lesson, or the first use is followed by "(", ":", "is", "means".
//   node scripts/verify-first-use.js . identity-dojo --detail [--json out.json]
// node firstuse.js <repo> <dojo> [--detail]
const fs=require('fs'),path=require('path');
const REPO=process.argv[2],DOJO=process.argv[3],DETAIL=process.argv.includes('--detail');const JSONOUT=(()=>{const i=process.argv.indexOf('--json');return i>0?process.argv[i+1]:null})();const OUT={};
const g=new Function('document','window',fs.readFileSync(path.join(REPO,'engine/glossary.js'),'utf8')+'\n;return {KW,GLOSS_ALL};')({getElementById:()=>null,addEventListener:()=>{}},{});
// acronym -> expansion (from glossary term names like 'Relying Party (RP)')
const EXP={};
for(const d of g.GLOSS_ALL)for(const gr of d.groups)for(const [term] of gr.terms){
  const m=term.match(/^(.+?)\s*\(([A-Za-z][A-Za-z0-9-]{1,15})\)\s*$/);
  if(m)EXP[m[2].toUpperCase()]=m[1];
  else if(/^[A-Z][A-Z0-9-]{1,9}(\s*\/\s*[A-Z][A-Z0-9-]{1,9})?$/.test(term))for(const t of term.split(/\s*\/\s*/))EXP[t.toUpperCase()]=EXP[t.toUpperCase()]||null; // bare acronym term, no expansion in name
}
const UNIVERSAL=new Set(['HTTP','HTTPS','URL','URI','API','JSON','TLS','ID','UI','HTML','CPU','RAM','OS','IP','TCP','DNS','GET','POST','PUT','DELETE','PATCH','US','EU','UK','SMS','USB','PDF','CSV','QR','PC','MS','AWS','GCP','FAQ','PIN','XML','YAML','RFC','IETF','NIST','ISO','CLI','SDK','IDE','UUID','ASCII','UTF','TODO','OK','AND','OR','NOT','THE','MUST','SHOULD','MAY','TV','HR','IT','UX','NA','KB','MB','GB','EUR','USD','A','I']);
const streams=path.join(REPO,DOJO,'content/streams');
const S=[];for(const f of JSON.parse(fs.readFileSync(path.join(streams,'manifest.json'),'utf8')))new Function('STREAMS',fs.readFileSync(path.join(streams,f),'utf8'))(S);
function prose(html){let s=String(html||'');s=s.replace(/<pre[\s\S]*?<\/pre>/gi,' ').replace(/<div class="codeSample"[^>]*>[\s\S]*?<\/div>/gi,' ').replace(/<svg[\s\S]*?<\/svg>/gi,' ').replace(/<code[\s\S]*?<\/code>/gi,' ').replace(/<[^>]+>/g,' ');return s.replace(/&amp;/g,'&').replace(/&[a-z#0-9]+;/g,' ').replace(/\s+/g,' ');}
let total=0,lessonsHit=0;const agg={};
for(const st of S)for(const l of (st.lessons||[])){
  const t=prose(l.body);const tl=t.toLowerCase();const seen=new Set();const bad=[];
  for(const m of t.matchAll(/\b([A-Z][A-Z0-9]{1,7}(?:-[A-Z0-9]{1,4})?)\b/g)){
    const a=m[1];if(seen.has(a)||UNIVERSAL.has(a)||/^\d+$/.test(a))continue;seen.add(a);
    if(!(a in EXP)&&!g.KW[a.toLowerCase()])continue; // not a known term at all: verify-acronyms covers those
    const exp=EXP[a];
    const titleHas=new RegExp('\\b'+a+'\\b').test(l.title);
    const expanded=exp&&tl.includes(exp.toLowerCase());
    const after=t.slice(m.index,m.index+160);
    const glossed=/^[A-Z0-9-]+\s*(?:\(|,|:|\bis\b|\bmeans\b|\bstands for\b)/.test(after)&&/\(|:|\bis\b|\bmeans\b|\bstands for\b/.test(after.slice(0,a.length+3));
    if(!expanded&&!glossed)bad.push(a+(titleHas?'*':''));
  }
  if(bad.length){lessonsHit++;total+=bad.length;for(const b of bad)agg[b.replace('*','')]=(agg[b.replace('*','')]||0)+1;
    if(DETAIL)console.log(l.id.padEnd(10),bad.join(' '));OUT[l.id]=bad;}
}
if(JSONOUT)fs.writeFileSync(JSONOUT,JSON.stringify(OUT,null,1));
console.log(`${DOJO}: ${total} first-uses without expansion or gloss across ${lessonsHit} lessons`);
console.log(Object.entries(agg).sort((a,b)=>b[1]-a[1]).slice(0,40).map(([k,v])=>k+':'+v).join('  '));
