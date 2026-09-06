#!/usr/bin/env node
// AI-tell profiler for lesson prose. Not a gate (yet): a report. Counts the
// structural tells an alpha reader flagged as "reads like AI" (parentheticals,
// semicolon-balanced sentences, "worth noting", aphoristic closers, enumerated
// framing) per lesson, with sentence-length stats. Run before and after a prose
// sweep to see whether it did anything.
//   node scripts/tells.js identity-dojo --lessons --top 15
//   node scripts/tells.js . --lessons        (Dev Dojo)
const fs=require('fs'),path=require('path');
const ROOT=process.argv[2]; const LESS=process.argv.includes('--lessons');
const TOP=(()=>{const i=process.argv.indexOf('--top');return i>0?+process.argv[i+1]:15})();
const streams=path.join(ROOT,'content/streams');
const S=[];for(const f of JSON.parse(fs.readFileSync(path.join(streams,'manifest.json'),'utf8')))new Function('STREAMS',fs.readFileSync(path.join(streams,f),'utf8'))(S);
function prose(html){
  let s=String(html||'');
  s=s.replace(/<pre[\s\S]*?<\/pre>/gi,' ').replace(/<code[\s\S]*?<\/code>/gi,' CODE ').replace(/<svg[\s\S]*?<\/svg>/gi,' ');
  s=s.replace(/<(h[1-6]|p|li|div|tr|br)[^>]*>/gi,'\n').replace(/<[^>]+>/g,' ');
  s=s.replace(/&mdash;/g,'—').replace(/&ndash;/g,'–').replace(/&rarr;/g,'->').replace(/&amp;/g,'&').replace(/&nbsp;/g,' ').replace(/&quot;/g,'"').replace(/&#\d+;/g,' ').replace(/&[a-z]+;/g,' ');
  return s;
}
const TELLS={
 'em dash (&mdash;)':/—/g,
 'not just X but Y':/\bnot (?:just|only|merely|simply) \b[^.;:]{1,60}?\bbut\b/gi,
 "it's not about X, it's Y":/\b(?:is|it's|isn't|is not|are not|aren't|was not|wasn't) (?:not )?(?:about|a matter of) \b[^.;]{1,50}?[,;] (?:it's|it is|but|they're|they are)\b/gi,
 'X is not Y. It is Z. (aphorism)':/\b(?:is not|isn't|are not|aren't|does not|doesn't|do not|don't) [^.;:!?]{2,40}[.;] (?:It|They|That|This) (?:is|are|was|does|do)\b/g,
 'worth (noting/fixing/…)':/\b(?:is |are |'s )?worth (?:noting|fixing|holding|remembering|repeating|saying|knowing|keeping|pausing|spelling|stating|a |the |it\b)/gi,
 'pays for itself / earns its':/\b(?:pays for itself|earns its (?:place|keep)|earn their (?:place|keep))\b/gi,
 'the point/trick/catch/short version/takeaway is':/\b[Tt]he (?:point|trick|catch|short version|takeaway|key insight|lesson|upshot|rule|test|tell|giveaway|payoff|habit) (?:is|here|of this|that pays)\b/g,
 'in other words / put differently / to put it':/\b(?:[Ii]n other words|[Pp]ut differently|[Pp]ut another way|[Tt]o put it (?:another way|plainly|bluntly|simply)|[Ss]aid differently)\b/g,
 'crucially/importantly/notably/critically':/\b(?:[Cc]rucially|[Ii]mportantly|[Nn]otably|[Cc]ritically|[Ss]ubtly)\b,?/g,
 'think of it as / under the hood / at its core':/\b(?:[Tt]hink of (?:it|them|this) as|[Uu]nder the hood|[Aa]t its core|[Bb]oils down to|[Aa]t the end of the day|[Ii]n a nutshell|[Tt]he bottom line)\b/g,
 "here's the thing / the thing is":/\b(?:[Hh]ere's the (?:thing|catch|rub|problem|key)|[Tt]he thing is|[Hh]ere is the thing)\b/g,
 'This matters because / Why this matters':/\b(?:[Tt]his matters because|[Ww]hy (?:this|it|that) matters|[Tt]he reason (?:this|it|that) matters)\b/g,
 'robust/seamless/crucial/leverage/delve/vital/pivotal':/\b(?:robust(?:ly|ness)?|seamless(?:ly)?|crucial(?:ly)?|leverag(?:e|es|ed|ing)|delv(?:e|es|ed|ing)|vital(?:ly)?|pivotal|paramount|holistic|streamline[ds]?|foster(?:s|ed|ing)?|underpin(?:s|ned|ning)?|elegant(?:ly)?)\b/gi,
 'a X is a Y is a Z (chain)':/\b(?:is not|isn't) \b[^.;,]{1,30}? (?:is not|isn't) \b/g,
 'colon-led aphorism ("The rule: ...")':/(?:^|[.!?] )(?:The (?:rule|test|fix|answer|habit|trade-off|tradeoff|trick|catch|result|difference|lesson|point|reason|cost|risk|mistake|question|pattern|problem|short version|practical (?:rule|test|answer))|One (?:rule|habit|test)|Two (?:things|rules|habits)|Three (?:things|rules|habits)|Rule of thumb|Practical rule|Bottom line): /g,
 'parenthetical aside ( … )':/\([^)]{12,}\)/g,
 'semicolon-balanced sentence':/[a-z]; [a-z][^.;!?]{20,}[.!?]/g,
 'Two/Three/Four things/pairs/ways … (enumerated framing)':/\b(?:Two|Three|Four|Five) (?:things|pairs|ways|reasons|rules|habits|questions|points|cases|mistakes|patterns|properties|ideas|consequences|distinctions|lessons|failure modes|forces)\b/g,
 'rhetorical question then answer':/\?\s+(?:Because|Yes|No|Not|Almost|Usually|Only|Neither|Both|It depends)\b/g,
 'ends on a one-liner ("…, and that is the whole X.")':/,\s(?:and|which) (?:is|was) (?:the (?:whole|entire|real|actual) (?:point|story|lesson|problem|trick|game|difference|reason|job)|why [^.]{1,40}exists)\./g,
};
function sents(t){return t.replace(/\s+/g,' ').split(/(?<=[.!?])\s+(?=[A-Z"'(])/).map(x=>x.trim()).filter(x=>x.split(' ').length>=3);}
const rows=[];const totals={};let W=0,SL=[];
for(const st of S)for(const l of (st.lessons||[])){
  const parts=[l.body,l.ex&&l.ex.prompt,l.ex&&l.ex.behavior,...(l.ex&&l.ex.hints||[]),...((l.exs||[]).flatMap(e=>[e.prompt,e.behavior,...(e.hints||[])]))].filter(Boolean);
  const t=prose(parts.join('\n'));
  const w=t.split(/\s+/).filter(Boolean).length;W+=w;
  const ss=sents(t);const lens=ss.map(x=>x.split(' ').length);SL.push(...lens);
  const mean=lens.reduce((a,b)=>a+b,0)/(lens.length||1);
  const sd=Math.sqrt(lens.reduce((a,b)=>a+(b-mean)**2,0)/(lens.length||1));
  const r={id:l.id,title:l.title,stream:st.title,words:w,sents:ss.length,mean:+mean.toFixed(1),sd:+sd.toFixed(1),tells:{},n:0};
  for(const [k,re] of Object.entries(TELLS)){const m=(t.match(re)||[]).length;if(m){r.tells[k]=m;r.n+=m;totals[k]=(totals[k]||0)+m;}}
  r.per1k=+(r.n/(w||1)*1000).toFixed(1);
  rows.push(r);
}
const mean=SL.reduce((a,b)=>a+b,0)/SL.length,sd=Math.sqrt(SL.reduce((a,b)=>a+(b-mean)**2,0)/SL.length);
console.log(`${path.basename(path.resolve(ROOT))}: ${rows.length} lessons, ${W} prose words, sentence mean ${mean.toFixed(1)} sd ${sd.toFixed(1)}`);
console.log('tells (total, per 1k words):');
for(const [k,v] of Object.entries(totals).sort((a,b)=>b[1]-a[1]))console.log(`  ${String(v).padStart(5)}  ${(v/W*1000).toFixed(1).padStart(5)}  ${k}`);
console.log(`  ${String(Object.values(totals).reduce((a,b)=>a+b,0)).padStart(5)}  ${(Object.values(totals).reduce((a,b)=>a+b,0)/W*1000).toFixed(1).padStart(5)}  ALL`);
if(LESS){console.log(`\nworst ${TOP} lessons by tells per 1k words (min 300 words):`);
 for(const r of rows.filter(r=>r.words>=300).sort((a,b)=>b.per1k-a.per1k).slice(0,TOP))console.log(`  ${r.per1k.toFixed(1).padStart(5)}/1k  ${String(r.words).padStart(5)}w  sd ${String(r.sd).padStart(4)}  ${r.id.padEnd(10)} ${r.title.slice(0,60)}`);
 console.log(`\nlongest ${TOP}:`);for(const r of [...rows].sort((a,b)=>b.words-a.words).slice(0,TOP))console.log(`  ${String(r.words).padStart(5)}w  ${r.id.padEnd(10)} ${r.title.slice(0,60)}`);
}
if(process.argv.includes('--json'))fs.writeFileSync(path.join(process.env.HOME,'sweep',path.basename(path.resolve(ROOT))+'-tells.json'),JSON.stringify(rows,null,1));
