/* Keyword table and glossary: see engine/glossary.js */
/* ============================== STATE ============================== */
/* Every course in this repo used to write into ONE localStorage key, 'javadojo',
   with progress, saved editor code and ratings all filed under a bare lesson id.
   Dev, JS and Identity Dojo therefore shared a single blob, and nothing collided
   only because no two courses happened to reuse a lesson id, an invariant no code
   enforced. Each course now owns a key derived from its name. See migrateStore()
   below for what happens to progress made before this change. */
const STORE_LEGACY_KEY='javadojo';
function storeSlug(name){return String(name==null?'':name).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')||'dev-dojo';}
const STORE_KEY='dojo:'+storeSlug((typeof DOJO_HOME!=='undefined'&&DOJO_HOME.name)?DOJO_HOME.name:'Dev Dojo');
/* Published for the signed-in account bridge the site injects (/dojo-bridge.js),
   which hooks localStorage.setItem on this key to sync progress. It had the old
   key hardcoded, which also meant all three courses synced into one bucket. */
if(typeof window!=='undefined'){window.DOJO_STORE_KEY=STORE_KEY;window.DOJO_STORE_LEGACY_KEY=STORE_LEGACY_KEY;}
/* Storage can stop accepting writes part-way through a course: a full quota, or a
   browser that revokes permission after the first probe succeeded. The store falls
   back to memory so nothing crashes, but the learner used to be told nothing and
   would find an empty course in their next tab. Say it once, plainly. */
let storageWarned=false;
function storageLost(){
  if(storageWarned)return;storageWarned=true;
  try{toast('\u26a0 <b>Browser storage is not accepting writes.</b> Your progress is kept for this session only, so anything you finish now is gone when you close the tab.');}catch(e){}
}
const store={
  mem:{},                     // in-memory fallback if storage is blocked
  _raw:null,_cache:null,      // last text read from storage, and its parsed form
  persistent:(()=>{try{localStorage.setItem('__jd_t','1');localStorage.removeItem('__jd_t');return true}catch(e){return false}})(),
  /* get() re-parsed the whole blob on every single lookup, and the nav bar does
     about 600 lookups per render (one per lesson, plus srsDeck's one per
     exercise). At 374 exercises with saved editor code that is a 360KB parse six
     hundred times for one click, and it got slower the more a learner finished.
     The parse is now keyed on the stored text, so a value that has not changed is
     parsed once. Reading the text every time keeps another tab's writes visible,
     which a plain cache would have hidden. */
  get(){
    if(!this.persistent)return this.mem;
    let raw;
    try{raw=localStorage.getItem(STORE_KEY)||'{}';}catch(e){return this.mem;}
    if(raw===this._raw&&this._cache)return this._cache;
    try{this._cache=JSON.parse(raw);this._raw=raw;}catch(e){return this.mem;}
    return this._cache;
  },
  set(d){this.mem=d;if(this.persistent){try{const raw=JSON.stringify(d);localStorage.setItem(STORE_KEY,raw);this._raw=raw;this._cache=d;}catch(e){this.persistent=false;this._raw=null;this._cache=null;storageLost();}}},
  lesson(id){return this.get()[id]||{}},
  patch(id,p){const d=this.get();d[id]={...(d[id]||{}),...p};this.set(d)}
};
/* Every storage key this course owns: its lesson ids, its exercise sub-ids, and
   the rating/comment entry that sits under each of them. */
function courseKeys(){
  const own=new Set();
  (typeof STREAMS!=='undefined'?STREAMS:[]).forEach(s=>{(s.lessons||[]).forEach(l=>{
    own.add(l.id);own.add('rating:'+l.id);
    const exs=lessonExs(l);
    exs.forEach((x,i)=>{const sid=exSid(l,exs,i);own.add(sid);own.add('rating:'+sid);});
  });});
  return own;
}
/* Move progress out of the old shared key, once, at boot, after STREAMS exists.
   Three rules make this safe to ship to people who are part-way through a course:
     1. It only runs when this course has NO key of its own, so later work is
        never overwritten by an older copy.
     2. It copies only the entries this course owns, so a learner who has worked
        two dojos in one browser gets each course's progress in its own key
        instead of both courses inheriting the other's.
     3. It never deletes the old blob. If anything here is wrong, the original
        data is still on disk and the migration can simply run again.
   Returns the number of entries carried over. */
function migrateStore(){
  if(!store.persistent)return 0;
  let legacy=null;
  try{
    if(localStorage.getItem(STORE_KEY)!==null)return 0;       // already has its own key
    legacy=JSON.parse(localStorage.getItem(STORE_LEGACY_KEY)||'null');
  }catch(e){return 0;}
  if(!legacy||typeof legacy!=='object'||Array.isArray(legacy))return 0;
  const own=courseKeys();
  const mine={};let n=0;
  for(const k of Object.keys(legacy)){if(own.has(k)){mine[k]=legacy[k];n++;}}
  if(!n)return 0;
  store.set(mine);
  return n;
}
/* Lesson ratings and comments: see engine/feedback.js */
function extractJson(raw){
  let s=raw;
  if(typeof s!=='string'){
    s=(s&&(s.text||s.result||s.message))||
      (s&&s.content&&s.content[0]&&(s.content[0].text||s.content[0]))||
      JSON.stringify(s);
    if(typeof s!=='string')s=JSON.stringify(s);
  }
  const a=s.indexOf('{'),b=s.lastIndexOf('}');
  if(a===-1||b<=a)return null;
  try{return JSON.parse(s.slice(a,b+1))}catch(e){}
  try{return JSON.parse(s.slice(a,b+1).replace(/,\s*([}\]])/g,'$1'))}catch(e){return null}
}
const BELTS=[[0,'White belt'],[10,'Yellow belt'],[25,'Orange belt'],[40,'Green belt'],[55,'Blue belt'],[70,'Purple belt'],[85,'Brown belt'],[100,'Black belt 🖤']];
/* ============================== HELPERS ============================== */
/* Guard the coercion: esc is called on optional fields (a lesson without docs,
   an exercise without a note), and an undefined there should render as nothing
   rather than throwing and blanking the panel. Found by engine/test. */
const esc=s=>(s==null?'':String(s)).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
function highlight(src){
  const toks=[];
  const stash=(html)=>{toks.push(html);return '\u0000'+String.fromCharCode(0xE000+toks.length-1);};
  let s=esc(src);
  s=s.replace(/("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n]){1,2}')|(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g,(m,str)=>stash('<span class="hl-'+(str?'s':'c')+'">'+m+'</span>'));
  s=s.replace(/\b(abstract|assert|boolean|break|byte|case|catch|char|class|continue|default|do|double|else|enum|extends|final|finally|float|for|if|implements|import|instanceof|int|interface|long|native|new|package|private|protected|public|record|return|sealed|short|static|super|switch|synchronized|this|throw|throws|transient|try|var|void|volatile|while|yield|permits|null|true|false)\b/g,'<span class="hl-k">$1</span>');
  s=s.replace(/\b(\d[\d_]*\.?\d*[fLdF]?)\b/g,'<span class="hl-n">$1</span>');
  s=s.replace(/(@\w+)/g,'<span class="hl-a">$1</span>');
  s=s.replace(/\u0000([\uE000-\uF8FF])/g,(m,c)=>toks[c.charCodeAt(0)-0xE000]);
  return s;
}
function stripTags(h){const d=document.createElement('div');d.innerHTML=h;return d.textContent}
function renderExpected(b){
  const t=esc(String(b)).replace(/(?<=[.;:!)\]])\s+(?=\d+\.\s)/g,'<br>');
  return '<details class="expected" open><summary>\u2705 What your code must do</summary><div>'+t+'</div></details>';
}
/* ============================== NAV / HOME ============================== */
let cur=null; // {si, li}
/* A grade can outlive the lesson it was started for: the AI runner awaits a network
   round trip, the Java runner a real compile, and the JS worker gets up to three
   seconds. In that window the learner can click another lesson, and a late result
   used to write into the new lesson's panel and tick off the wrong exercise. Every
   openLesson bumps this counter; each grader captures it and drops its result if it
   has moved. Same defect, same shape, as the one fixed in the ML course. */
let navEpoch=0;
function gradeEpoch(){return navEpoch;}
function gradeStale(epoch){return epoch!==navEpoch;}
function totalLessons(){return STREAMS.reduce((a,s)=>a+((s.tournament||s.project||s.dan)?0:s.lessons.length),0)}
function doneCount(){const d=store.get();let n=0;STREAMS.forEach(s=>{if(s.tournament||s.project||s.dan)return;s.lessons.forEach(l=>{if(d[l.id]&&d[l.id].done)n++})});return n}
function streamDone(s){const d=store.get();return s.lessons.filter(l=>d[l.id]&&d[l.id].done).length}
function beltName(){
  const pct=Math.round(100*doneCount()/totalLessons());
  let name=BELTS[0][1];for(const[b,n]of BELTS)if(pct>=b)name=n;
  return name;
}
function lessonsToNextBelt(){
  const done=doneCount(),total=totalLessons();
  const pct=Math.round(100*done/total);   // same rounding as beltName, or the header and the hint disagree
  let next=null;
  for(const[b,n]of BELTS){if(b>pct){next=[b,n];break;}}
  if(!next)return null;                       // already black belt
  /* The belt is awarded on the ROUNDED percentage, so the lesson that earns it is
     the first whose rounded percentage reaches the threshold, not the first whose
     exact percentage does. Taking ceil() of the exact threshold overstated the
     count by one on almost every course size (by two at 55% of 200 lessons), so
     the header promised one more lesson than the promotion actually needed. */
  const needDone=Math.min(total,Math.ceil((next[0]-0.5)*total/100));
  return {count:Math.max(1,needDone-done),name:next[1]};
}
function refreshBelt(){
  const pct=Math.round(100*doneCount()/totalLessons());
  document.getElementById('beltName').textContent=beltName();
  document.getElementById('beltFill').style.width=pct+'%';
  document.getElementById('beltPct').textContent=pct+'%';
  const nx=document.getElementById('beltNext');
  if(nx){
    const n=lessonsToNextBelt();
    nx.textContent=n?(n.count+' to '+n.name.replace(/ 🖤/,'')):'Black belt, mastery!';
  }
}
function toast(msg){
  const t=document.createElement('div');
  t.className='toast';t.innerHTML=msg;
  document.body.appendChild(t);
  setTimeout(()=>{t.classList.add('gone');setTimeout(()=>t.remove(),400)},3600);
}
const BELT_COLORS={'White belt':'#e2e8f0','Yellow belt':'#facc15','Orange belt':'#fb923c','Green belt':'#22c55e','Blue belt':'#3b82f6','Purple belt':'#a855f7','Brown belt':'#92400e','Black belt 🖤':'#111827'};
function beltStrip(name){
  return '<div class="bStrip" style="background:'+(BELT_COLORS[name]||'#94a3b8')+'"><span class="bKnot"></span></div>';
}
function confettiHTML(n){
  const cols=['#f43f5e','#f59e0b','#facc15','#22c55e','#06b6d4','#3b82f6','#8b5cf6','#ec4899'];
  let out='';
  for(let i=0;i<n;i++){
    const left=Math.random()*100;
    const delay=(Math.random()*0.5).toFixed(2);
    const dur=(2.4+Math.random()*1.8).toFixed(2);
    const drift=((Math.random()*2-1)*140).toFixed(0);
    const rot=(Math.random()*720-360).toFixed(0);
    const c=cols[i%cols.length];
    const w=6+Math.floor(Math.random()*7);
    const round=Math.random()<0.35?'50%':'2px';
    out+='<span class="bConf" style="left:'+left+'%;--d:'+delay+'s;--t:'+dur+'s;--x:'+drift+'px;--r:'+rot+'deg;'
       +'width:'+w+'px;height:'+(w+Math.floor(Math.random()*6))+'px;background:'+c+';border-radius:'+round+'"></span>';
  }
  return out;
}
function showBeltUp(before,after,pct){
  const old=document.getElementById('beltUpOverlay');if(old)old.remove();
  const note=store.persistent?'':'<div class="bNote">⚠ browser storage blocked, progress lasts for this session only</div>';
  const black=/Black belt/.test(after);
  const ov=document.createElement('div');
  ov.id='beltUpOverlay';ov.className='beltOverlay'+(black?' finalBelt':'');
  ov.innerHTML='<div class="bConfLayer" aria-hidden="true">'+confettiHTML(70)+'</div>'
    +'<div class="beltModal" role="dialog" aria-modal="true" aria-label="Belt promotion">'
    +'<div class="bRays" aria-hidden="true"></div>'
    +'<div class="bBadge" aria-hidden="true"><div class="bBadgeStrip" style="background:'+(BELT_COLORS[after]||'#94a3b8')+'"><span class="bKnot"></span></div></div>'
    +'<div class="bKicker">'+(black?'⚫ Ultimate rank':'🥋 Rank up')+'</div>'
    +'<h2 class="bTitle">'+(black?'BLACK BELT!':'Belt up!')+'</h2>'
    +'<p class="bSub">'+(black?'Mastery of the path, the dojo salutes you.':'Your training has paid off, you have been promoted.')+'</p>'
    +'<div class="bRow">'
      +'<div class="bCol">'+beltStrip(before)+'<div class="bName">'+esc(before)+'</div></div>'
      +'<div class="bArrow">→</div>'
      +'<div class="bCol bNew">'+beltStrip(after)+'<div class="bName"><b>'+esc(after)+'</b></div></div>'
    +'</div>'
    +'<div class="bBar"><i style="width:'+pct+'%"></i></div>'
    +'<div class="bPct">'+pct+'% of the path to mastery</div>'
    +note
    +'<button class="bBtn" onclick="document.getElementById(\'beltUpOverlay\').remove()">Continue training 🥋</button>'
    +'</div>';
  ov.addEventListener('click',e=>{if(e.target===ov)ov.remove();});
  document.body.appendChild(ov);
  requestAnimationFrame(()=>ov.classList.add('show'));
}
const DAN_NAMES=['1st Dan','2nd Dan','3rd Dan','4th Dan','5th Dan'];
function danStreamsDone(){
  return STREAMS.filter(s=>s.dan&&s.lessons.every(l=>store.lesson(l.id).done)).length;
}
function showDanUp(rank){
  const old=document.getElementById('beltUpOverlay');if(old)old.remove();
  const name=DAN_NAMES[rank-1]||rank+'th Dan';
  const total=STREAMS.filter(s=>s.dan).length;
  const ov=document.createElement('div');
  ov.id='beltUpOverlay';ov.className='beltOverlay';
  ov.innerHTML='<div class="beltModal danModal" role="dialog" aria-modal="true" aria-label="Dan promotion">'
    +'<div class="bBurst">'+['⛩️','🥋','🖤','✨','🏮'].map((e,i)=>'<span class="bSpark s'+i+'">'+e+'</span>').join('')+'</div>'
    +'<h2>'+esc(name)+' earned!</h2>'
    +'<p class="bSub">Beyond the black belt, a full senior discipline mastered.</p>'
    +'<div class="bRow"><div class="bCol bNew"><div class="bStrip danStrip"><span class="bKnot"></span></div>'
    +'<div class="bName"><b>'+esc(name)+'</b> · '+rank+'/'+total+' disciplines</div></div></div>'
    +'<button class="bBtn danBtn" onclick="document.getElementById(\'beltUpOverlay\').remove()">Continue the path ⛩️</button>'
    +'</div>';
  ov.addEventListener('click',e=>{if(e.target===ov)ov.remove();});
  document.body.appendChild(ov);
  requestAnimationFrame(()=>ov.classList.add('show'));
}
function completeLesson(l){
  if(store.lesson(l.id).done)return;           // already counted
  const isDan=cur&&STREAMS[cur.si]&&STREAMS[cur.si].dan;
  if(isDan){
    store.patch(l.id,{done:true,completedAt:Date.now()});
    const db=document.getElementById('doneBanner');
    if(db)db.style.display='block';
    renderNav();
    const st=STREAMS[cur.si];
    if(st.lessons.every(x=>store.lesson(x.id).done))showDanUp(danStreamsDone());
    else toast('⛩️ <b>Dan lesson complete</b>, senior discipline in progress; the rank comes with the full stream.');
    return;
  }
  const isProject=cur&&STREAMS[cur.si]&&STREAMS[cur.si].project;
  if(isProject){
    store.patch(l.id,{done:true,completedAt:Date.now()});
    const pb=document.getElementById('doneBanner');
    if(pb)pb.style.display='block';
    renderNav();
    toast('🏗️ <b>Project milestone complete!</b> Real-world skill acquired, this is résumé material, no belt needed.');
    return;
  }
  const isTournament=cur&&STREAMS[cur.si]&&STREAMS[cur.si].tournament;
  if(isTournament){
    store.patch(l.id,{done:true,completedAt:Date.now()});
    const banner=document.getElementById('doneBanner');
    if(banner)banner.style.display='block';
    renderNav();
    toast('🏆 <b>Challenge conquered!</b> Tournament wins are dojo honor, the belt is earned in the main halls.');
    return;
  }
  const before=beltName();
  store.patch(l.id,{done:true,completedAt:Date.now()});
  const banner=document.getElementById('doneBanner');
  if(banner)banner.style.display='block';
  refreshBelt();renderNav();
  const after=beltName();
  const pct=Math.round(100*doneCount()/totalLessons());
  const note=store.persistent?'':'<br><small>⚠ browser storage blocked, progress lasts for this session only</small>';
  if(after!==before)showBeltUp(before,after,pct);
  else toast('✅ Lesson complete, progress saved ('+doneCount()+'/'+totalLessons()+')'+note);
}
function renderNav(){
  const nav=document.getElementById('nav');nav.innerHTML='';
  const home=document.createElement('div');home.className='streamHd';home.innerHTML=ico('🏠')+' Overview';home.onclick=()=>{cur=null;renderHome();renderNav()};nav.appendChild(home);
  const start=document.createElement('div');start.className='streamHd';start.innerHTML=ico('🚀')+' Getting started';start.onclick=()=>{cur=null;renderGettingStarted();renderNav()};nav.appendChild(start);
  const path=document.createElement('div');path.className='streamHd';path.innerHTML=ico('🗺️')+' Learning path';path.onclick=()=>{cur=null;renderPath();renderNav()};nav.appendChild(path);
  const dueN=(typeof reviewDueCount==='function')?reviewDueCount():0;
  const rev=document.createElement('div');rev.className='streamHd';rev.innerHTML=ico('📑')+' Review'+(dueN?` <span class="dueBadge">${dueN}</span>`:'');rev.onclick=()=>{cur=null;renderReview();renderNav()};nav.appendChild(rev);
  const prac=document.createElement('div');prac.className='streamHd';prac.innerHTML=ico('🎯')+' Practice';prac.onclick=()=>{cur=null;renderPractice('all');renderNav()};nav.appendChild(prac);
  const gloss=document.createElement('div');gloss.className='streamHd';gloss.innerHTML=ico('📖')+' Glossary';gloss.onclick=()=>{cur=null;renderGlossary();renderNav()};nav.appendChild(gloss);
  STREAMS.forEach((s,si)=>{
    if(s.tournament&&!(STREAMS[si-1]&&STREAMS[si-1].tournament)){
      const dv=document.createElement('div');dv.className='navDivider';
      dv.textContent='🏆 TOURNAMENTS, practice, no belt credit';
      nav.appendChild(dv);
    }
    if(s.project&&!(STREAMS[si-1]&&STREAMS[si-1].project)){
      const dv=document.createElement('div');dv.className='navDivider';
      dv.textContent='🏗️ PROJECTS, real-world builds, no belt credit';
      nav.appendChild(dv);
    }
    if(s.dan&&!(STREAMS[si-1]&&STREAMS[si-1].dan)){
      const dv=document.createElement('div');dv.className='navDivider danDivider';
      dv.textContent='⛩️ DAN TRACK, senior engineering, beyond black belt';
      nav.appendChild(dv);
    }
    const hd=document.createElement('div');hd.className='streamHd';
    hd.innerHTML=`${ico(s.icon)} ${s.title}<span class="pct">${streamDone(s)}/${s.lessons.length}</span>`;
    const box=document.createElement('div');box.className='lessons'+((cur&&cur.si===si)?' open':'');
    hd.onclick=()=>box.classList.toggle('open');
    let _lastSec=null;
    s.lessons.forEach((l,li)=>{
      if(l.sec&&l.sec!==_lastSec){const sh=document.createElement('div');sh.className='subHd';sh.textContent=l.sec;box.appendChild(sh);_lastSec=l.sec;}
      const a=document.createElement('div');
      const done=store.lesson(l.id).done;
      a.className='lessonLink'+((cur&&cur.si===si&&cur.li===li)?' active':'');
      a.innerHTML=`<span class="diffDot d-${lessonDiff(s,l)}" title="${lessonDiff(s,l)}"></span><span class="tick">${done?'✅':'○'}</span>${li+1}. ${l.title}`;
      a.onclick=()=>openLesson(si,li);
      box.appendChild(a);
    });
    nav.appendChild(hd);nav.appendChild(box);
  });
}
/* Technology domains, streams are grouped into these sections on the home page.
   Each entry lists the exact stream titles it contains, in display order. Any stream
   not matched here falls into a "More" section so nothing is ever hidden. */
/* The course name, used in shared UI copy. A sibling dojo sets DOJO_HOME.name. */
const DOJO_NAME=(typeof DOJO_HOME!=="undefined"&&DOJO_HOME.name)?DOJO_HOME.name:'Dev Dojo';
const DOMAINS=(typeof DOJO_DOMAINS!=="undefined")?DOJO_DOMAINS:[
  {name:'Java & the JVM',icon:'☕',titles:['Java Fundamentals','Generics from the Ground Up','Exception Handling','Regex from the Ground Up','Working with User Input','Modern Java Mastery','Concurrency & Multithreading','Time, Testing, Reflection & the JVM','JPMS & Performance Engineering']},
  {name:'Computer Science & Algorithms',icon:'🧠',titles:['Data Structures','Dynamic Programming & Advanced Algorithms']},
  {name:'Web, APIs & Frameworks',icon:'🌐',titles:['Web Development','Front-End with React','APIs & REST','Spring Boot']},
  {name:'Data & Persistence',icon:'🗄️',titles:['Working with Databases']},
  {name:'Systems & Networking',icon:'🔌',titles:['Networking & Sockets']},
  {name:'Security & Cryptography',icon:'🔐',titles:['Security & Crypto APIs']},
  {name:'Identity & Access (IAM)',icon:'🛂',titles:['Identity and Access']},
  {name:'DevOps & Delivery',icon:'🚀',titles:['Build Tools: Maven & Gradle','Git: Beginner to Master','Deploying Java to the Web','Reading Production: the Command Line for Logs','CI/CD: GitHub Actions & ArgoCD']},
  {name:'Architecture & Design',icon:'🏛️',titles:['Design Patterns']},
  {name:'Senior Track (Dan)',icon:'⛩️',titles:['System Design & Tradeoffs','Failure-First: Distributed Systems','Working with Real Code']},
  {name:'Coding Challenges',icon:'🏆',titles:['Coding Challenges: The Tournament']},
  {name:'Real-World Projects',icon:'🛠️',titles:['Real-World Projects']}
];
/* Merge all identity sub-streams (flagged iam:true) into ONE "Identity and Access"
   stream whose lessons carry a .sec sub-category label. Runs once at boot; keeps each
   source file independently gradeable while presenting a single stream to the learner. */
function mergeIdentity(){
  if(typeof DOJO_NO_IAM_MERGE!=="undefined"&&DOJO_NO_IAM_MERGE)return;
  if(STREAMS.some(s=>s.title==='Identity and Access'))return;
  const idx=[];STREAMS.forEach((s,i)=>{if(s.iam)idx.push(i);});
  if(idx.length<2)return;
  const first=idx[0];const lessons=[];
  idx.forEach(i=>{const s=STREAMS[i];(s.lessons||[]).forEach(l=>{l.sec=s.sec||s.title;lessons.push(l);});});
  const merged={icon:'🛂',title:'Identity and Access',blurb:'The whole identity domain in one place, plain-English identity & federation, authentication & MFA, authorization models, sessions & web login, OAuth 2.0 & OIDC, tokens (JWT/JOSE), SAML, PKI, service-to-service & zero trust, enterprise directories, advanced OAuth threats, and governance. Grouped into sub-categories you graduate through from white to black belt.',lessons};
  for(let k=idx.length-1;k>=0;k--)STREAMS.splice(idx[k],1);
  STREAMS.splice(first,0,merged);
}
function streamCard(s,si){
  const d=streamDone(s),t=s.lessons.length;
  return `<div class="card${s.tournament?' tour':(s.project?' proj':(s.dan?' dan':''))}" onclick="openLesson(${si},0)">${ico(s.icon,'cardIc')}${s.tournament?'<span class="tourBadge">🏆 TOURNAMENT</span>':(s.project?'<span class="projBadge">🏗️ PROJECT</span>':(s.dan?'<span class="danBadge">⛩️ DAN</span>':''))}<h3>${s.title}</h3><div class="meta">${s.blurb}</div><div class="meta" style="margin-top:6px">${d}/${t} ${s.tournament?'challenges · no belt credit':(s.project?'projects · no belt credit':(s.dan?'lessons · dan track':'lessons'))}</div><div class="bar"><i style="width:${t?Math.round(100*d/t):0}%${s.tournament?';background:#d97706':(s.project?';background:#0e9f6e':(s.dan?';background:linear-gradient(90deg,#111827,#b8860b)':''))}"></i></div></div>`;
}
// per-domain belt: percentage of the domain's belt-eligible lessons completed
function domainBelt(done,total){
  if(!total) return 'White belt';
  const pct=100*done/total;
  const T=[[100,'Black belt 🖤'],[90,'Brown belt'],[75,'Purple belt'],[60,'Blue belt'],[45,'Green belt'],[30,'Orange belt'],[15,'Yellow belt']];
  for(const [th,name] of T){ if(pct>=th) return name; }
  return 'White belt';
}
function renderHome(){
  const m=document.getElementById('main');
  // index streams by title, remember which have been placed into a domain
  const byTitle={}; STREAMS.forEach((s,si)=>{byTitle[s.title]=si;});
  const placed=new Set();
  const anyProgress=STREAMS.some(st=>streamDone(st)>0);
  let sections='';
  for(const dom of DOMAINS){
    const idx=dom.titles.filter(t=>byTitle[t]!==undefined).map(t=>{const si=byTitle[t];placed.add(si);return si;});
    if(!idx.length)continue;
    const danIdx=idx.filter(si=>STREAMS[si].dan);
    const mainIdx=idx.filter(si=>!STREAMS[si].dan);
    const beltIdx=mainIdx.filter(si=>{const s=STREAMS[si];return !s.tournament&&!s.project;});
    // lesson totals for the collapsed summary line
    const nStreams=mainIdx.length+danIdx.length;
    const nLessons=idx.reduce((a,si)=>a+STREAMS[si].lessons.length,0);
    // A first-time visitor should see the course, not eight closed rows: with no
    // progress anywhere, open everything. Once there IS progress, open only what
    // they have started, so returning lands them on their own work.
    const started=anyProgress ? idx.some(si=>streamDone(STREAMS[si])>0) : true;
    let head;
    if(beltIdx.length){
      const done=beltIdx.reduce((a,si)=>a+streamDone(STREAMS[si]),0);
      const tot=beltIdx.reduce((a,si)=>a+STREAMS[si].lessons.length,0);
      const bn=domainBelt(done,tot);
      head=`<span class="domainLeft">${beltStrip(bn)}${ico(dom.icon)} ${dom.name}</span><span class="domainCount">${bn} · ${done}/${tot}</span>`;
    } else {
      head=`<span class="domainLeft">${ico(dom.icon)} ${dom.name}</span><span class="domainCount">${nStreams} streams · ${nLessons} lessons</span>`;
    }
    let inner='';
    if(mainIdx.length) inner+=`<div class="grid">${mainIdx.map(si=>streamCard(STREAMS[si],si)).join('')}</div>`;
    if(danIdx.length) inner+=`<div class="danTrackHd">⛩️ ${dom.name} · Dan track, advanced topics (post-black, no belt credit)</div><div class="grid">${danIdx.map(si=>streamCard(STREAMS[si],si)).join('')}</div>`;
    sections+=`<details class="domainSec"${started?' open':''}><summary class="domainHd">${head}<span class="domainMeta">${nStreams} stream${nStreams===1?'':'s'} · ${nLessons} lessons</span></summary>${inner}</details>`;
  }
  const extra=STREAMS.map((s,si)=>si).filter(si=>!placed.has(si));
  if(extra.length){
    const n=extra.reduce((a,si)=>a+STREAMS[si].lessons.length,0);
    sections+=`<details class="domainSec"><summary class="domainHd"><span class="domainLeft">✨ More</span><span class="domainMeta">${extra.length} streams · ${n} lessons</span></summary><div class="grid">${extra.map(si=>streamCard(STREAMS[si],si)).join('')}</div></details>`;
  }
  // Per-course home copy. A sibling dojo overrides this via DOJO_HOME in its
  // config; the defaults below are Dev Dojo's.
  const HOME=(typeof DOJO_HOME!=="undefined")?DOJO_HOME:{
    name:'Dev Dojo',
    title:'Welcome to Dev Dojo',
    intro:STREAMS.length+' training tracks take you from fundamentals to mastery across software engineering: Java &amp; the JVM, computer science &amp; algorithms, web/HTTP &amp; front-end (React), APIs &amp; Spring, databases &amp; SQL, concurrency, security, DevOps, and senior-level architecture, all grouped by domain below.'
  };
  m.innerHTML=`<div class="home">
  <h1 class="pageTitle">${HOME.title}</h1>
  <div class="startBanner">New here? Start with <a href="javascript:void(0)" onclick="cur=null;renderGettingStarted();renderNav()"><b>${ico('🚀')} Getting started</b></a> to set up your environment and get the full depth, then follow the <a href="javascript:void(0)" onclick="cur=null;renderPath();renderNav()"><b>${ico('🗺️')} Learning path</b></a>.</div>
  <p>${HOME.intro} Every lesson ends with an exercise in the built-in editor. <b>Most exercises are graded on the shape of your answer, not on running it</b>, regex checks that you used the right construct. SQL and JavaScript do execute for real; Java runs for real if you start the optional local runner. Every exercise has a <b>Run locally</b> panel with exact commands, that is the ground truth. Stuck? <b>Next Step</b> gives a progressive hint, and <b>Show me the solution</b> is always there, no judgment. Each lesson also ends with a <b>Quick check</b> quiz, and <b>choosing a wrong answer explains what is wrong with that answer</b>, not just which one was right, because the misconception you actually had is the one worth fixing.</p>
  <p><b>Tip:</b> select or double-click any keyword or term, in a lesson or your own code, and a popup explains it, drawing on the ${GLOSS.reduce((a,d)=>a+d.groups.reduce((b,g)=>b+g.terms.length,0),0)} terms in the glossary.</p>
  <div class="gsCard">
  <h2>How to get the most out of ${HOME.name}: learn &amp; retain</h2>
  <ol>
    <li><b>Follow the path, earn the belt.</b> Work a domain top-to-bottom via the <b>${ico('🗺️')} Learning path</b>; the belt bar tracks your progress white → black.</li>
    <li><b>Struggle first.</b> Try the exercise before revealing anything, use <b>Next Step</b> for a nudge, and only then <b>the solution</b>. The effort is what makes it stick.</li>
    <li><b>Run it for real.</b> Use the <b>${ico('🖥️')} Run-locally</b> panel or in-app execution to confirm behavior, reading a solution is not the same as making it work.</li>
    <li><b>Check yourself, and read the wrong answer.</b> Take the <b>Quick check</b> quiz on each lesson. Getting one wrong is the useful case: it tells you why <i>that</i> option is wrong, which is where a lot of the learning actually happens.</li>
    <li><b>Come back tomorrow.</b> Do your <b>${ico('📑')} Review</b> daily, spaced repetition resurfaces cards right before you'd forget them. This is the single biggest lever for retention.</li>
    <li><b>Ramp the difficulty.</b> Once the basics click, use <b>${ico('🎯')} Practice</b> to grind Easy → Hard.</li>
    <li><b>Teach it back.</b> After each lesson, say the idea in one plain sentence. If you can teach it, you own it.</li>
  </ol>
  </div>
  <div class="scaleBar">${STREAMS.length} streams · ${STREAMS.reduce((a,s)=>a+s.lessons.length,0)} lessons · ${STREAMS.reduce((a,s)=>a+s.lessons.reduce((b,l)=>b+((l.exs||(l.ex?[l.ex]:[])).length),0),0)} hands-on exercises</div>
  <p style="font-size:12px;color:var(--muted)">System status: AI test runner ${(window.cowork&&window.cowork.askClaude)?'✅ connected':'⚠️ unavailable, completion falls back to structural checks'} · progress storage ${store.persistent?'✅ persistent':'⚠️ session-only (browser storage is blocked here; progress lasts until this view closes)'}</p>
  ${alphaBlock()}
  ${sections}</div>`;
}
/* Alpha-tester credits on the home screen. A sibling dojo lists its testers
   via DOJO_ALPHA in its config: [{name:'Jane Doe', url:'https://...'}], url
   optional. While the list is empty the card recruits instead, because a
   reward that is not visible the day it is earned is a promise, not a
   reward. */
function alphaBlock(){
  const list=(typeof DOJO_ALPHA!=='undefined'&&Array.isArray(DOJO_ALPHA))?DOJO_ALPHA:[];
  if(!list.length){
    return `<div class="gsCard"><h2>🧪 Alpha testers</h2><p>${DOJO_NAME} is in alpha, and the first testers get named right here, on this screen. The ask is about 45 minutes: work the first three lessons, then say what confused you, what bored you, and what the grader got wrong. Catch a real defect, a wrong answer key or an exercise that rejects a correct answer, and your name goes on the fix as well. <a href="https://roniam.dev/#contact" target="_blank" rel="noopener noreferrer">Volunteer here</a>.</p></div>`;
  }
  const names=list.map(t=>t&&t.url?`<a href="${t.url}" target="_blank" rel="noopener noreferrer">${t.name}</a>`:(t&&t.name)||'').filter(Boolean).join(' · ');
  return `<div class="gsCard"><h2>🧪 Alpha testers</h2><p>These people worked the lessons before anyone else and made them better: ${names}. Defects they caught are credited on the fixes themselves.</p></div>`;
}
/* ============================== LESSON ============================== */
function exSid(l,exs,i){return exs.length>1?l.id+'#'+i:l.id;}
function lessonExs(l){return l.exs||(l.ex?[l.ex]:[]);}
function openLesson(si,li,ei){
  navEpoch++;                 // any grade still in flight belongs to the old lesson
  const s=STREAMS[si],l=s.lessons[li];
  const exs=lessonExs(l);
  if(ei==null){ei=exs.findIndex((x,i)=>!store.lesson(exSid(l,exs,i)).done);if(ei<0)ei=0;}
  cur={si,li,ei};
  window.__QZ=shuffleQuiz(l.quiz);
  const e=exs[ei];
  const sid=e?exSid(l,exs,ei):null;
  const saved=sid?store.lesson(sid):{};
  const m=document.getElementById('main');
  m.innerHTML=`<div class="crumb">${ico(s.icon)} ${s.title}${l.sec?' · '+l.sec:''} · Lesson ${li+1} of ${s.lessons.length}</div>
  <h1 class="lessonTitle">${l.title}</h1>
  <div class="lessonBody">${l.body}</div>
  ${l.docs&&l.docs.length?`<div class="docs"><b>📚 References:</b><br>${l.docs.map(d=>`<a href="${d[1]}" target="_blank" rel="noopener">${d[0]} ↗</a>`).join('')}</div>`:''}
  ${e?`<div class="exercise">
    ${exs.length>1?(s.tournament?`<div class="chalBar"><button class="chalRandom" onclick="pickRandom(${si},${li})">🎲 Random challenge</button><span class="chalCount">${exs.filter((x,i)=>store.lesson(exSid(l,exs,i)).done).length}/${exs.length} solved</span><div class="chalChips">${exs.map((x,i)=>`<div class="chalChip ${i===ei?'active':''} ${store.lesson(exSid(l,exs,i)).done?'done':''}" onclick="openLesson(${si},${li},${i})" title="${esc(x.title)}">${store.lesson(exSid(l,exs,i)).done?'✓':(i+1)}</div>`).join('')}</div></div>`:`<div class="exTabs">${exs.map((x,i)=>`<div class="exTab ${i===ei?'active':''} ${store.lesson(exSid(l,exs,i)).done?'done':''}" id="extab-${i}" onclick="openLesson(${si},${li},${i})">${store.lesson(exSid(l,exs,i)).done?'✅ ':''}Exercise ${i+1}</div>`).join('')}</div>`):''}
    <div class="exHd"><span class="badge">EXERCISE${exs.length>1?' '+(ei+1)+' OF '+exs.length:''}</span> <span class="diffBadge d-${exDiff(e,s,l)}">${exDiff(e,s,l)}</span> ${e.title}${saved.done?' <span class="badge" style="background:#16a34a">✓ COMPLETED</span>':''}</div>
    <div class="prompt">${e.prompt}</div>${e.behavior?renderExpected(e.behavior):''}
    <div class="editorWrap">
      <div class="scroller" id="scroller">
        <div class="gutter" id="gutter"><div class="gLine cur">1</div></div>
        <div class="edStack" id="edStack"><pre id="hl"></pre><textarea id="ed" spellcheck="false" aria-label="code editor"></textarea></div>
      </div>
      <div class="statusBar"><span id="lnCol">Ln 1, Col 1</span><span>auto-indent · bracket pairing · Tab / ⇧Tab indent · ⌘/Ctrl+Enter = Run</span></div>
    </div>
    <div class="toolbar">
      <button class="primary" id="btnRun">▶ Compile & Run Tests</button>
      <button id="btnHint">💡 Next Step</button>
      <button id="btnSol">👀 Show me the solution</button>
      <button id="btnReset">↺ Reset code</button>
      <span class="tip">your code auto-saves</span>
    </div>
    <div class="ioPanel">
      <div class="ioTabs">
        <div class="ioTab active" id="tab-tests">Test Results<span class="dot" id="dot-tests" style="display:none"></span></div>
        <div class="ioTab" id="tab-console">Console<span class="dot" id="dot-console" style="display:none"></span></div>
      </div>
      <div class="ioBody" id="io-tests"><span style="color:var(--muted);font-size:12.5px">No runs yet, hit ▶ Compile &amp; Run Tests.</span></div>
      <div class="ioBody" id="io-console" style="display:none"><div class="cLine dim">— compiler and program output will appear here —</div></div>
    </div>
    <div class="doneBanner" id="doneBanner">✅ Lesson complete, nice work! Pick the next lesson in the sidebar.</div>
    <div class="solution" id="solBox" hidden><div class="codeSample">${highlight(e.solution)}</div></div>
    ${depthPanels(s,l,e)}
  </div>`:''}
  ${renderQuiz(l)}
  <div class="rateBox" id="rateBox">${ratingMarkup(l.id)}</div>
  <div style="margin-top:18px;display:flex;gap:10px">
    ${li>0?`<button onclick="openLesson(${si},${li-1})">← Previous</button>`:''}
    ${li<s.lessons.length-1?`<button class="primary" onclick="nextLesson(${si},${li},'${l.id}')">Next lesson →</button>`:''}
  </div>`;
  m.scrollTop=0;
  m.querySelectorAll('.codeSample[data-hl]').forEach(el=>{el.innerHTML=highlight(el.textContent);});
  if(e) initEditor(l,e,sid,ei,exs,saved);
  renderNav();
}
function pickRandom(si,li){
  const l=STREAMS[si].lessons[li];const exs=lessonExs(l);
  const undone=exs.map((x,i)=>i).filter(i=>!store.lesson(exSid(l,exs,i)).done);
  const pool=undone.length?undone:exs.map((x,i)=>i);
  const pick=pool[Math.floor(Math.random()*pool.length)];
  openLesson(si,li,pick);
}
function completeExercise(l,sid,ei,exs){
  if(exs.length===1){completeLesson(l);return;}
  if(!store.lesson(sid).done)store.patch(sid,{done:true,completedAt:Date.now()});
  if(exs.every((x,i)=>store.lesson(exSid(l,exs,i)).done)){
    completeLesson(l);
  }else{
    const isTour=cur&&STREAMS[cur.si]&&STREAMS[cur.si].tournament;
    const solved=exs.filter((x,i)=>store.lesson(exSid(l,exs,i)).done).length;
    if(isTour)toast('🏆 <b>Challenge solved!</b> '+solved+'/'+exs.length+' in this round, 🎲 Random or pick another anytime');
    else toast('✅ Exercise '+(ei+1)+' of '+exs.length+' complete, pick the next one in the tabs above');
    const t=document.getElementById('extab-'+ei);
    if(t){t.classList.add('done');t.innerHTML='✅ Exercise '+(ei+1);}
  }
}
/* ============================== EDITOR ============================== */
let hintIdx=0;
function caretPos(ed){
  const upto=ed.value.slice(0,ed.selectionStart).split('\n');
  return {line:upto.length,col:upto[upto.length-1].length+1};
}
function setTab(name){
  ['tests','console'].forEach(n=>{
    const tab=document.getElementById('tab-'+n),body=document.getElementById('io-'+n);
    if(!tab||!body)return;
    tab.classList.toggle('active',n===name);
    body.style.display=n===name?'block':'none';
    if(n===name){const d=document.getElementById('dot-'+n);if(d)d.style.display='none';}
  });
}
function markTab(name,color){
  const d=document.getElementById('dot-'+name);
  if(d){d.style.background=color;d.style.display='inline-block';}
}
function jumpToLine(n){
  const ed=document.getElementById('ed');if(!ed)return;
  const lines=ed.value.split('\n');
  let pos=0;
  for(let i=0;i<Math.min(n-1,lines.length);i++)pos+=lines[i].length+1;
  ed.focus();
  ed.selectionStart=ed.selectionEnd=pos;
  const sc=document.getElementById('scroller');
  if(sc)sc.scrollTop=Math.max(0,(n-5)*19.5);
  ed.dispatchEvent(new Event('caretmove'));
}
function initEditor(l,e,sid,ei,exs,saved){
  hintIdx=store.lesson(sid).hintIdx||0;
  const ed=document.getElementById('ed'),hl=document.getElementById('hl'),g=document.getElementById('gutter');
  ed.value=(saved.code!=null?saved.code:e.starter);
  const OPEN={'(':')','[':']','{':'}'};
  const CLOSERS=[')',']','}'];
  const paint=()=>{
    hl.innerHTML=highlight(ed.value)+'\n';
    const n=ed.value.split('\n').length;
    const cur=caretPos(ed);
    let gh='';
    for(let i=1;i<=n;i++)gh+='<div class="gLine'+(i===cur.line?' cur':'')+'">'+i+'</div>';
    g.innerHTML=gh;
    const lc=document.getElementById('lnCol');
    if(lc)lc.textContent='Ln '+cur.line+', Col '+cur.col;
  };
  const sync=()=>{paint();store.patch(sid,{code:ed.value});};
  const put=(val,caret)=>{ed.value=val;ed.selectionStart=ed.selectionEnd=caret;sync();};
  ed.addEventListener('input',sync);
  ed.addEventListener('keyup',paint);
  ed.addEventListener('click',paint);
  ed.addEventListener('caretmove',paint);
  ed.addEventListener('keydown',e=>{
    const s=ed.selectionStart,epos=ed.selectionEnd,v=ed.value;
    if((e.metaKey||e.ctrlKey)&&e.key==='Enter'){e.preventDefault();runTests(l,exs[ei],sid,ei,exs);return;}
    if(e.key==='Tab'){
      e.preventDefault();
      const ls=v.lastIndexOf('\n',s-1)+1;
      if(s!==epos&&v.slice(s,epos).includes('\n')){
        const le=v.indexOf('\n',epos);const end=le===-1?v.length:le;
        const block=v.slice(ls,end);
        const out=e.shiftKey?block.replace(/^ {1,4}/gm,''):block.replace(/^/gm,'    ');
        ed.value=v.slice(0,ls)+out+v.slice(end);
        ed.selectionStart=ls;ed.selectionEnd=ls+out.length;
        sync();
      }else if(e.shiftKey){
        const m=v.slice(ls).match(/^ {1,4}/);
        if(m)put(v.slice(0,ls)+v.slice(ls+m[0].length),Math.max(ls,s-m[0].length));
      }else{
        put(v.slice(0,s)+'    '+v.slice(epos),s+4);
      }
      return;
    }
    if(e.key==='Enter'){
      e.preventDefault();
      const ls=v.lastIndexOf('\n',s-1)+1;
      const indent=(v.slice(ls).match(/^ */)||[''])[0];
      const prev=v.slice(0,s).trimEnd().slice(-1);
      const next=v[epos];
      let ins='\n'+indent+(prev==='{'?'    ':'');
      const caret=s+ins.length;
      if(prev==='{'&&next==='}')ins+='\n'+indent;
      ed.value=v.slice(0,s)+ins+v.slice(epos);
      ed.selectionStart=ed.selectionEnd=caret;
      sync();return;
    }
    if(s===epos){
      if((e.key==='"'&&v[s]==='"')||(CLOSERS.includes(e.key)&&v[s]===e.key)){
        e.preventDefault();ed.selectionStart=ed.selectionEnd=s+1;paint();return;
      }
      if(e.key==='"'){e.preventDefault();put(v.slice(0,s)+'""'+v.slice(epos),s+1);return;}
      if(OPEN[e.key]){e.preventDefault();put(v.slice(0,s)+e.key+OPEN[e.key]+v.slice(epos),s+1);return;}
      if(e.key==='Backspace'&&s>0){
        const pair=OPEN[v[s-1]]||(v[s-1]==='"'?'"':null);
        if(pair&&v[s]===pair){e.preventDefault();put(v.slice(0,s-1)+v.slice(s+1),s-1);return;}
      }
    }
  });
  sync();
  document.getElementById('tab-tests').onclick=()=>setTab('tests');
  document.getElementById('tab-console').onclick=()=>setTab('console');
  if(store.lesson(l.id).done)document.getElementById('doneBanner').style.display='block';
  document.getElementById('btnRun').onclick=()=>runTests(l,e,sid,ei,exs);
  document.getElementById('btnHint').onclick=()=>nextStep(e,sid);
  document.getElementById('btnSol').onclick=()=>{
    const b=document.getElementById('solBox');b.hidden=!b.hidden;b.classList.toggle('show',!b.hidden);
    document.getElementById('btnSol').textContent=(!b.hidden)?'🙈 Hide solution':'👀 Show me the solution';
  };
  document.getElementById('btnReset').onclick=()=>{if(confirm('Reset to starter code?')){ed.value=e.starter;sync();}};
}
/* All five grading paths: see engine/grade.js */
/* ============================== HINTS ============================== */
/* Same three failure modes as the AI grading path, and for the same reason: an
   unbounded await, a DOM lookup afterwards with no guard, and a catch whose
   parameter shadowed the exercise it was given. Leaving a lesson mid-hint threw
   here and left the hint spinner turning for good. */
async function nextStep(e,sid){
  setTab('tests');
  const res=document.getElementById('io-tests');
  if(!res)return;
  const hints=e.hints||[];
  if(hintIdx<hints.length){
    res.insertAdjacentHTML('beforeend',`<div class="aiBox hint"><h4>💡 Next step ${hintIdx+1}/${hints.length}</h4>${hints[hintIdx]}</div>`);
    hintIdx++;store.patch(sid,{hintIdx});
    return;
  }
  const epoch=gradeEpoch();
  const btn=document.getElementById('btnHint');
  if(btn)btn.disabled=true;                  // one request in flight at a time
  res.insertAdjacentHTML('beforeend',`<div class="aiBox hint" id="aiHint"><span class="spin"></span>Asking Claude for a personalised next step…</div>`);
  const ed=document.getElementById('ed');
  const code=ed?ed.value:'';
  try{
    if(!window.cowork||!window.cowork.askClaude)throw new Error('AI hints unavailable in this preview.');
    const raw=await withTimeout(window.cowork.askClaude(`A student is stuck on this ${exLang(e)} exercise. Give ONE short concrete next step (2-3 sentences max) based on their current code. Do not give the full solution.\n\nEXERCISE: ${stripTags(e.prompt)}\n\nTHEIR CODE:\n${code}`,[]),AI_TIMEOUT_MS,'No hint came back in time. Try again, or work from the structural checks above.');
    if(gradeStale(epoch))return;
    const box=document.getElementById('aiHint');
    if(box)box.innerHTML='<h4>💡 Claude suggests</h4>'+esc(String(raw));
  }catch(err){
    if(!gradeStale(epoch)){
      const box=document.getElementById('aiHint');
      if(box)box.innerHTML=esc((err&&err.message)?err.message:String(err));
    }
  }finally{
    const b=document.getElementById('btnHint')||btn;
    if(b)b.disabled=false;
    const box=document.getElementById('aiHint');
    if(box)box.removeAttribute('id');
  }
}

/* ============================== DEPTH: run-locally + dive-deeper ============================== */
function localRunHtml(s,l,e){
  const lang=e.lang||'java';
  let steps;
  if(lang==='sql'){
    steps=`<p>These exercises are graded on the SQL text. To run them for real against a live database:</p>
<pre class="runbox">docker run --rm -e POSTGRES_PASSWORD=pw -p 5432:5432 postgres:16
psql postgresql://postgres:pw@localhost:5432/postgres
-- create the tables named in the prompt, insert a few rows, then run your query</pre>
<p>No Docker? Any Postgres, MySQL or even SQLite works, the syntax in these lessons is standard SQL.</p>`;
  } else if(lang==='shell'){
    steps=`<p>These are real commands. Try them in a throwaway directory so nothing important is at risk:</p>
<pre class="runbox">mkdir /tmp/play && cd /tmp/play && git init
# then run each command and watch exactly what changes</pre>`;
  } else if(lang==='text'){
    steps=`<p>This is a short-answer / mental-model check, there is no code to execute. Compare your reasoning against the solution, and follow the references below to go deeper.</p>`;
  } else if(lang==='js'||lang==='jsx'){
    steps=`<p>These run in a Node or React project. To try a React component for real:</p>
<pre class="runbox">npm create vite@latest my-app -- --template react
cd my-app && npm install && npm run dev
# paste the component into src/, import and use it, then open the browser</pre>
<p>Plain JavaScript (no React) runs straight in Node: <code>node file.js</code>. Add the React import at the top of a component file: <code>import { useState, useEffect } from "react";</code></p>`;
  } else {
    const m=(e.solution||'').match(/public\s+class\s+(\w+)/)||(e.solution||'').match(/\bclass\s+(\w+)/);
    const cls=m?m[1]:'Solution';
    const hasMain=/static\s+void\s+main/.test(e.solution||'');
    steps=`<p>${DOJO_NAME} verifies your code has the right shape and (in the app) asks Claude to run the tests. To confirm it genuinely works, run it on your own machine with a JDK (see Getting started):</p>
<pre class="runbox">// 1) save your solution as ${esc(cls)}.java
${hasMain?'':`// 2) add a tiny main to try it, e.g.:
//    public static void main(String[] a) { System.out.println(/* call a method here */); }
`}// ${hasMain?'2':'3'}) compile and run:
javac ${esc(cls)}.java && java ${esc(cls)}

// or explore interactively, no main needed:
jshell ${esc(cls)}.java</pre>
<p>To grade it the way ${DOJO_NAME} does, add <b>JUnit 5</b> and turn the "expected behavior" above into <code>assertEquals</code> checks.</p>
<p><b>Or compile &amp; run it right here</b>: if you started the site with a local JDK and <code>JD_LOCAL_RUNNER=1</code>:</p>
<button class="glossBtn" type="button" onclick="runJavaLocal()">▶ Compile &amp; run with local JDK</button>
<div id="javaRun" class="sqlResult"></div>`;
  }
  return `<details class="depth"><summary>🖥️ Run this on your own machine</summary><div class="depthBody">${steps}</div></details>`;
}
function diveDeeperHtml(s,l,e){
  const docs=(l.docs&&l.docs.length)?`<p><b>Read the source:</b> ${l.docs.map(d=>`<a href="${d[1]}" target="_blank" rel="noopener">${esc(d[0])} ↗</a>`).join(' · ')}</p>`:'';
  return `<details class="depth"><summary>🔬 Dive deeper</summary><div class="depthBody">
<p><b>How this is graded.</b> The check looks for the right constructs in your code, and in the app Claude runs the tests like a compiler. That verifies structure and logic, not every runtime edge, so for real confidence, run it locally (above) and try to break it.</p>
<p><b>Push further.</b> Change the inputs and predict the output before running. Add an edge case the prompt did not mention. Then say the idea aloud in one sentence, if you can teach it, you own it.</p>
${docs}
</div></details>`;
}
function depthPanels(s,l,e){ return `<div class="depthWrap">${(e.lang==='sql'&&e.data&&window.SQL_DATASETS&&window.SQL_DATASETS[e.data])?sqlRunPanel(e.data):''}${localRunHtml(s,l,e)}${diveDeeperHtml(s,l,e)}</div>`; }
/* opt-in: compile & run Java via the site's local runner endpoint (needs JD_LOCAL_RUNNER=1 + a JDK) */
function runJavaLocal(){
  const out=document.getElementById('javaRun'); if(!out)return;
  const code=((document.getElementById('ed')||{}).value)||'';
  out.innerHTML='<div class="sqlMeta"><span class="spin"></span>compiling with local JDK…</div>';
  fetch('/api/run/java',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify({code})})
    .then(r=>r.ok?r.json():r.json().then(j=>Promise.reject(j.error||('HTTP '+r.status))))
    .then(d=>{
      const head=d.ok?('✔ '+(d.stage==='run'?'compiled &amp; ran':'compiled')):('✘ '+esc(d.stage||'error')+' failed');
      out.innerHTML='<div class="sqlMeta">'+head+'</div><pre class="runbox">'+esc(d.output||'(no output)')+'</pre>';
    })
    .catch(err=>{ out.innerHTML='<div class="sqlMeta">Local runner unavailable, start the site with <code>JD_LOCAL_RUNNER=1 node site/server.js</code> and a JDK installed, or use the commands above. <span style="color:var(--muted)">('+esc(String(err))+')</span></div>'; });
}

/* ---- live in-browser SQL runner (real execution on sample datasets) ---- */
function sqlFmt(v){ return (v===null||v===undefined)?'NULL':String(v); }
function sqlTableHtml(name,tbl){
  return `<div class="sqlTblName">${esc(name)} <span class="sqlTblN">${tbl.rows.length} rows</span></div>`
    +`<table class="sqlTbl"><thead><tr>${tbl.cols.map(c=>`<th>${esc(c)}</th>`).join('')}</tr></thead>`
    +`<tbody>${tbl.rows.map(r=>`<tr>${tbl.cols.map(c=>`<td>${esc(sqlFmt(r[c]))}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}
function sqlResultHtml(rows){
  if(!rows.length)return '<div class="sqlMeta">✔ ran successfully, 0 rows</div>';
  const cols=Object.keys(rows[0]);
  return `<table class="sqlTbl"><thead><tr>${cols.map(c=>`<th>${esc(c)}</th>`).join('')}</tr></thead>`
    +`<tbody>${rows.map(r=>`<tr>${cols.map(c=>`<td>${esc(sqlFmt(r[c]))}</td>`).join('')}</tr>`).join('')}</tbody></table>`
    +`<div class="sqlMeta">${rows.length} row(s)</div>`;
}
function sqlRunPanel(dsName){
  const db=window.SQL_DATASETS[dsName];
  return `<details class="depth sqlPanel" open><summary>🗄️ Sample data, run your query for real</summary><div class="depthBody">
  <p>Your SQL runs against this live sample database, entirely in your browser (a small built-in engine, no server, works offline):</p>
  <div class="sqlData">${Object.keys(db).map(t=>sqlTableHtml(t,db[t])).join('')}</div>
  <button class="primary" type="button" onclick="runSqlExercise('${dsName}')">▶ Run query on sample data</button>
  <div id="sqlResult" class="sqlResult"><div class="sqlMeta">Write a SELECT above and press Run to see real rows.</div></div>
  </div></details>`;
}
function runSqlExercise(dsName){
  const out=document.getElementById('sqlResult'); if(!out)return;
  const db=window.SQL_DATASETS[dsName]; if(!db){out.innerHTML='<div class="sqlErr">sample data unavailable</div>';return;}
  /* sqlSelects (engine/grade.js) is the one definition of "which statements in this
     box are SELECTs". This panel used to carry a second copy, so the query the
     learner saw run here could drift from the one the grader scored. */
  const stmts=sqlSelects(((document.getElementById('ed')||{}).value||''));
  if(!stmts.length){out.innerHTML='<div class="sqlMeta">No SELECT found, write one (INSERT/UPDATE/DDL are not executed by the sample runner).</div>';return;}
  let html='';
  stmts.forEach((s,i)=>{
    try{ const rows=window.SQLDB.run(JSON.parse(JSON.stringify(db)),s); html+=`${stmts.length>1?`<div class="sqlQ">Query ${i+1}</div>`:''}${sqlResultHtml(rows)}`; }
    catch(err){ html+=`<div class="sqlErr">${stmts.length>1?'Query '+(i+1)+': ':''}${esc(err.message)}</div>`; }
  });
  out.innerHTML=html;
}

/* ============================== GETTING STARTED ============================== */
function renderGettingStarted(){
  const m=document.getElementById('main');
  m.innerHTML=`<div class="home">
  <h1 class="pageTitle">${ico('🚀')} Getting started with ${DOJO_NAME}</h1>
  <p>${DOJO_NAME} runs entirely in your browser and every lesson ends with a hands-on exercise. This page shows how your work is checked, what to install to get the <b>full depth</b>, and how to run any exercise in your own dev environment when you want real, compiler-verified feedback.</p>

  <div class="gsCard">
  <h2>How your work is checked (mark yourself strictly)</h2>
  <p>When you hit <b>Compile &amp; Run Tests</b>, ${DOJO_NAME} does two things: it checks your code contains the right constructs, and, in the app, it asks Claude to execute the tests like a compiler plus JUnit and report pass/fail per test. That is great for fast feedback and learning, but it is <b>not a real compiler</b>. It can miss a runtime edge case, and a correct solution written in an unusual way can occasionally be marked wrong.</p>
  <p><b>The fix for real depth:</b> every exercise now has a <b>🖥️ Run this on your own machine</b> panel with the exact commands. SQL exercises execute against real sample data in your browser, and pure-JavaScript exercises run in a sandboxed Web Worker, both graded on real behavior. Java exercises can even <b>compile &amp; run in-app</b> if you start the site with a local JDK and <code>JD_LOCAL_RUNNER=1</code>.</p>
  </div>

  <div class="gsCard">
  <h2>Set up your environment</h2>
  <p>You do not need all of this on day one, install a tool when a track calls for it. Each line notes what it unlocks.</p>
  <ul>
    <li><b>JDK 21+</b>: the Java compiler and runtime. Unlocks running every Java exercise locally (<code>javac</code>, <code>java</code>, <code>jshell</code>). Get it from Adoptium (Temurin) or <code>sdkman</code>. <i>This is the one to install first.</i></li>
    <li><b>An IDE</b>: IntelliJ IDEA (Community) or VS Code with the Java extensions. Real autocomplete, debugging, and JUnit runs.</li>
    <li><b>Git</b>: to actually try the Git &amp; version-control lessons; make a throwaway repo and experiment.</li>
    <li><b>Node.js 22+</b>: needed only to run this site with accounts/progress (<code>node site/server.js</code>) and to rebuild the app (<code>node build.js</code>).</li>
    <li><b>Docker</b>: spins up a real Postgres for the SQL lessons, and is the backbone of the Docker / Kubernetes / Istio / Envoy courses.</li>
    <li><b>Maven or Gradle</b>: to build the Spring Boot, API and larger Java projects for real.</li>
  </ul>
  </div>

  <div class="gsCard">
  <h2>What ${DOJO_NAME} can do in-app vs. in your own dev environment</h2>
  <p><b>Great in the app:</b> learning the concepts, writing and checking Java/SQL/CLI exercises, the belt progression, the glossary, and click-to-explain terms.</p>
  <p><b>Best on your own machine (the app can teach but not fully run these):</b> compiling and executing Java with a real JVM; running a live database for SQL; standing up a Spring Boot service; the concurrency lessons where real timing and multiple cores matter; the networking/sockets and deployment lessons; and the standalone <b>Docker, Kubernetes, Istio and Envoy</b> courses, which are separate hands-on labs in this repository. The Run-locally panel on each exercise bridges the gap.</p>
  </div>

  <div class="gsCard">
  <h2>Where to go next</h2>
  <p>New here? Follow the <a href="javascript:void(0)" onclick="cur=null;renderPath();renderNav()"><b>${ico('🗺️')} Learning path</b></a> for a recommended order from white to black belt. Confused by a term? The <a href="javascript:void(0)" onclick="cur=null;renderGlossary();renderNav()"><b>📖 Glossary</b></a> defines everything, and you can select any highlighted term inside a lesson to see its definition inline.</p>
  </div>
  </div>`;
  m.scrollTop=0;
}

/* ============================== LEARNING PATH ==============================
   The route used to be hardcoded to Dev Dojo's belts, which meant JS Dojo and
   Identity Dojo both opened this page and told the reader to install a JDK and
   start on Java Fundamentals. A sibling course now supplies its own route as
   DOJO_PATH in its config: an array of [belt, title, body] rows, longest
   journey last. The default below stays Dev Dojo's. */
const DEFAULT_PATH = [
  ['\u2B1C White','Start here','Read <b>Getting started</b>, install a JDK, and skim the <b>Glossary</b>. Then begin <b>Java Fundamentals</b>, variables, control flow, objects, collections.'],
  ['\uD83D\uDFE1 Yellow','Core Java','Finish <b>Java Fundamentals</b> (including <i>Inside the JVM</i>), <b>Exception Handling</b>, and <b>Generics from the Ground Up</b>. This is the language spine everything else assumes.'],
  ['\uD83D\uDFE0 Orange','Computer science','Do <b>Data Structures &amp; Algorithms</b>, collections, Big-O, trees, and BFS/DFS/Dijkstra traversal. Interview-critical and used everywhere.'],
  ['\uD83D\uDFE2 Green','How programs talk','Take <b>Web &amp; HTTP</b>, <b>APIs &amp; REST</b>, and <b>Working with Databases</b> (SQL joins, the command map, complex queries). Now you can build real services.'],
  ['\uD83D\uDD35 Blue','Frameworks & concurrency','Add <b>Spring Boot</b>, <b>Concurrency &amp; Multithreading</b> (start with <i>threads vs processes</i>), and <b>Modern Java</b>. Run these locally, concurrency especially rewards a real JVM.'],
  ['\uD83D\uDFE3 Purple','Security & identity','Work through <b>Identity and Access</b> end to end: foundations &amp; federation, authn/MFA, authorization models, sessions, OAuth/OIDC, tokens, SAML, PKI, and the advanced/governance sub-tracks.'],
  ['\uD83D\uDFE4 Brown','Ship it','Learn <b>Build Tools</b>, <b>Git</b>, <b>Deploying to the Web</b>, and <b>CI/CD</b>. Pair these with the standalone Docker &amp; Kubernetes courses in your own environment.'],
  ['\u26AB Black','Senior craft','Enter the <b>Senior (Dan)</b> tracks, System Design, Failure-First Distributed Systems, Working with Real Code, then prove it in <b>Real-World Projects</b> and the <b>Tournament</b>.'],
];
const DEFAULT_PATH_INTRO = 'is large on purpose, but you do not have to wander. This is a recommended route from beginner to senior. Finish the belt lessons in a domain to earn its belt; the dan sub-tracks and the Projects/Tournaments are where you cement it. Jump around once you know the basics, this is a suggestion, not a cage.';

function renderPath(){
  const m=document.getElementById('main');
  const rows=(typeof DOJO_PATH!=="undefined"&&DOJO_PATH.length)?DOJO_PATH:DEFAULT_PATH;
  const intro=(typeof DOJO_PATH_INTRO!=="undefined"&&DOJO_PATH_INTRO)?DOJO_PATH_INTRO:DEFAULT_PATH_INTRO;
  const step=(n,belt,title,body)=>`<div class="pathStep"><div class="pathNum">${n}</div><div class="pathBody"><div class="pathBelt">${belt}</div><h3>${esc(title)}</h3><p>${body}</p></div></div>`;
  m.innerHTML=`<div class="home">
  <h1 class="pageTitle">${ico('\uD83D\uDDFA\uFE0F')} Learning path</h1>
  <p>${DOJO_NAME} ${intro}</p>
  <div class="pathWrap">
  ${rows.map((r,i)=>step(i+1,r[0],r[1],r[2])).join('\n  ')}
  </div>
  <p style="margin-top:16px">Ready? <a href="javascript:void(0)" onclick="cur=null;renderHome();renderNav()"><b>Back to all tracks &rarr;</b></a></p>
  </div>`;
  m.scrollTop=0;
}

/* ============================== SPACED REPETITION (Review) ============================== */
const SRS_DAY=86400000, SRS_STEPS=[1,3,7,16,35,90,180];
function srsDue(rec){ return rec.srsDue || (rec.completedAt ? rec.completedAt + SRS_DAY : Infinity); }
function srsDeck(){
  const out=[];
  STREAMS.forEach((s,si)=>{(s.lessons||[]).forEach((l,li)=>{
    const exs=lessonExs(l);
    exs.forEach((e,ei)=>{
      const sid=exSid(l,exs,ei);
      const rec=store.lesson(sid);
      if(rec&&rec.done&&rec.completedAt)
        out.push({sid,si,li,ei,lessonTitle:l.title,icon:s.icon,exTitle:e.title||'Exercise',prompt:e.prompt||'',due:srsDue(rec),reps:rec.srsReps||0});
    });
  });});
  return out;
}
function reviewDueCount(){ const now=Date.now(); return srsDeck().filter(d=>d.due<=now).length; }
function srsFmtIn(ms){ if(ms<3600000)return Math.max(1,Math.round(ms/60000))+' min'; if(ms<SRS_DAY)return Math.round(ms/3600000)+' h'; return Math.round(ms/SRS_DAY)+' d'; }
function srsGrade(sid,good){
  const rec=store.lesson(sid), now=Date.now();
  if(good){ const reps=(rec.srsReps||0)+1; const ival=SRS_STEPS[Math.min(reps-1,SRS_STEPS.length-1)];
    store.patch(sid,{srsReps:reps,srsInterval:ival,srsDue:now+ival*SRS_DAY,srsLast:now}); }
  else { store.patch(sid,{srsReps:0,srsInterval:0,srsDue:now+10*60000,srsLast:now}); }
  renderReview(); renderNav();
}
function reviewCard(d){
  return `<div class="revCard">
    <div class="revMeta">${ico(d.icon)} ${esc(d.lessonTitle)}${d.reps?` · reviewed ${d.reps}×`:''}</div>
    <div class="revTitle">${esc(d.exTitle)}</div>
    <div class="revPrompt">${d.prompt}</div>
    <div class="revBtns">
      <button onclick="openLesson(${d.si},${d.li},${d.ei})">Open lesson ↗</button>
      <button class="revAgain" onclick="srsGrade('${d.sid}',false)">↻ Again (soon)</button>
      <button class="primary" onclick="srsGrade('${d.sid}',true)">✓ Good (later)</button>
    </div>
  </div>`;
}
function renderReview(){
  const m=document.getElementById('main'); const now=Date.now();
  const deck=srsDeck();
  const due=deck.filter(d=>d.due<=now).sort((a,b)=>a.due-b.due);
  const upcoming=deck.filter(d=>d.due>now).sort((a,b)=>a.due-b.due);
  let body;
  if(!deck.length){
    body=`<div class="reviewEmpty">No completed exercises yet. Finish a few lessons and they'll appear here for review, spaced out so they stick.</div>`;
  } else if(!due.length){
    const nx=upcoming[0];
    body=`<div class="reviewEmpty">✅ Nothing due right now. Your review deck has <b>${deck.length}</b> card${deck.length>1?'s':''}; next one is due in <b>${nx?srsFmtIn(nx.due-now):'—'}</b>.</div>`;
  } else {
    body=`<p><b>${due.length}</b> card${due.length>1?'s':''} due. Try to recall the solution first; open the lesson if you need to. Then rate yourself, <b>Good</b> schedules it further out, <b>Again</b> brings it back soon.</p>`
      + due.map(reviewCard).join('')
      + (upcoming.length?`<div class="reviewEmpty" style="margin-top:14px">+ ${upcoming.length} more scheduled later (next in ${srsFmtIn(upcoming[0].due-now)}).</div>`:'');
  }
  m.innerHTML=`<div class="home"><h1 class="pageTitle">${ico('📑')} Review</h1>
  <p style="color:var(--muted)">Spaced repetition resurfaces what you've learned right before you'd forget it. Cards are built automatically from the exercises you've completed and scheduled with expanding intervals (1 → 3 → 7 → 16 → 35 days…).</p>
  ${body}</div>`;
  m.scrollTop=0;
}

/* ============================== DIFFICULTY TIERS + PRACTICE ============================== */
/* Per-exercise difficulty: explicit e.diff override, else derived from the solution's
   size and constructs. Deterministic, so the same exercise always rates the same. */
function exDiff(e,s,l){
  if(e&&e.diff&&/^(easy|medium|hard)$/.test(e.diff))return e.diff;
  if(s&&(s.tournament||s.project))return 'hard';
  if(e&&e.lang==='text')return 'easy';
  const sol=(e&&e.solution)||'';
  const lines=sol.split('\n').length;
  let score=0;
  if(s&&s.dan)score+=1;
  if(lines>26)score+=2;else if(lines>14)score+=1;
  if(/\bfor\b|\bwhile\b/.test(sol))score+=1;
  if(/<[A-Z][\w,<>\s\[\]]*>/.test(sol))score+=1;                                   // generics
  if(/synchronized|\bThread\b|ExecutorService|CompletableFuture|volatile|Atomic/.test(sol))score+=2;
  if(/\binterface\b|\bimplements\b|\bextends\b/.test(sol))score+=1;
  const cases=(sol.match(/case\s+["0-9]/g)||[]).length;
  if(cases>=2&&/switch\s*\(/.test(sol)&&!/\bfor\b|\bwhile\b/.test(sol))score-=1;    // recall/mapping = easier
  if(score<=0)return 'easy';
  if(score<=2)return 'medium';
  return 'hard';
}
function lessonDiff(s,l){
  const exs=lessonExs(l);
  const order={easy:0,medium:1,hard:2};
  let d='easy';
  exs.forEach(e=>{const x=exDiff(e,s,l);if(order[x]>order[d])d=x;});
  return exs.length?d:'medium';
}
function renderPractice(filter){
  filter=filter||'all';
  const m=document.getElementById('main');
  const items=[];
  STREAMS.forEach((s,si)=>{(s.lessons||[]).forEach((l,li)=>{
    const exs=lessonExs(l);
    exs.forEach((e,ei)=>{
      const sid=exSid(l,exs,ei);
      items.push({si,li,ei,d:exDiff(e,s,l),title:e.title||l.title,lesson:l.title,icon:s.icon,done:!!store.lesson(sid).done});
    });
  });});
  const counts={easy:0,medium:0,hard:0};items.forEach(i=>counts[i.d]++);
  const shown=filter==='all'?items:items.filter(i=>i.d===filter);
  const tab=(k,label,n)=>`<button class="pracTab ${filter===k?'active':''}" onclick="renderPractice('${k}')">${label} <span class="pcount">${n}</span></button>`;
  m.innerHTML=`<div class="home"><h1 class="pageTitle">${ico('🎯')} Practice by difficulty</h1>
  <p style="color:var(--muted)">Every exercise across ${DOJO_NAME}, rated by difficulty. Filter to build a ramp, grind 🟢 Easy to warm up, or jump to 🔴 Hard for interview-grade problems. Ratings are auto-derived from each solution.</p>
  <div class="pracTabs">${tab('all','All',items.length)}${tab('easy','🟢 Easy',counts.easy)}${tab('medium','🟡 Medium',counts.medium)}${tab('hard','🔴 Hard',counts.hard)}</div>
  <div class="pracList">${shown.map(i=>`<div class="pracRow" onclick="openLesson(${i.si},${i.li},${i.ei})"><span class="diffDot d-${i.d}" title="${i.d}"></span><span class="pracDone">${i.done?'✅':'○'}</span><span class="pracIcon">${ico(i.icon)}</span><span class="pracTitle">${esc(i.title)}</span><span class="pracLesson">${esc(i.lesson)}</span></div>`).join('')}</div>
  </div>`;
  m.scrollTop=0;
}

/* ============================== QUIZ ENGINE (Quick check) ============================== */
/* Randomize option order so the correct answer is never predictable by position.
   Hand-authored quizzes were written with the right answer first (answer:0), which
   made them solvable without reading the question. Permutes options and whyWrong in
   lockstep and remaps answer, so quizPick() stays correct with no other changes.
   Re-shuffles on every lesson visit, so position can never be memorised.
   Returns new question objects, the source data in l.quiz is never mutated. */
function shuffleQuiz(qs){
  if(!qs||!qs.length)return qs||null;
  return qs.map(function(q){
    const n=(q&&q.options)?q.options.length:0;
    if(n<2)return q;
    const idx=q.options.map(function(_,i){return i;});
    for(let i=n-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));const t=idx[i];idx[i]=idx[j];idx[j]=t;}
    const ww=q.whyWrong;
    return Object.assign({},q,{
      options:idx.map(function(i){return q.options[i];}),
      whyWrong:Array.isArray(ww)?idx.map(function(i){return ww[i]||'';}):ww,
      answer:idx.indexOf(q.answer)
    });
  });
}
function renderQuiz(l){
  const qs=window.__QZ||(l&&l.quiz); if(!qs||!qs.length)return '';
  return `<div class="quizBox"><h3>🧠 Quick check</h3><p class="quizNote">Pick a wrong answer and it tells you what is wrong with <em>that</em> answer, not just which one was right.</p>`+qs.map((q,qi)=>
    `<div class="quizQ"><div class="quizQt">${qi+1}. ${esc(q.q)}</div>`+
    `<div class="quizOpts">${q.options.map((o,oi)=>`<button class="quizOpt" data-qi="${qi}" data-oi="${oi}" onclick="quizPick(${qi},${oi})">${esc(o)}</button>`).join('')}</div>`+
    `<div class="quizWhy" id="quizWhy-${qi}" hidden></div></div>`).join('')+`</div>`;
}
function quizPick(qi,oi){
  const qs=window.__QZ; if(!qs||!qs[qi])return; const q=qs[qi], ans=q.answer;
  document.querySelectorAll('.quizOpt[data-qi="'+qi+'"]').forEach(b=>{b.disabled=true;const boi=+b.getAttribute('data-oi');if(boi===ans)b.classList.add('correct');else if(boi===oi)b.classList.add('wrong');});
  const w=document.getElementById('quizWhy-'+qi); if(!w)return; w.hidden=false;
  const correct=q.options[ans];
  if(oi===ans){
    w.innerHTML='✔ <b>Correct.</b> '+esc(q.why||'');
  }else{
    const picked=q.options[oi];
    const ww=(q.whyWrong&&q.whyWrong[oi])?q.whyWrong[oi]:('“'+picked+'” is not the best fit here.');
    w.innerHTML='✘ <b>The correct answer is “'+esc(correct)+'.”</b> '+esc(q.why||'')
      +'<span class="quizWrongPick">You picked “'+esc(picked)+'”, '+esc(ww)+'</span>';
  }
}

// --- Mobile nav toggle (Dima Galat's find). Off-canvas below 760px;
// the scrim and choosing a lesson both close it. ---
(function(){
  var t=document.getElementById('navToggle'), sc=document.getElementById('navScrim'),
      nv=document.getElementById('nav'), b=document.body;
  if(!t||!nv) return;
  function set(open){ b.classList.toggle('navOpen', open); t.setAttribute('aria-expanded', String(open)); }
  t.addEventListener('click', function(){ set(!b.classList.contains('navOpen')); });
  if(sc) sc.addEventListener('click', function(){ set(false); });
  nv.addEventListener('click', function(e){
    var el=e.target && e.target.closest ? e.target.closest('.lessonLink') : null;
    if(el && window.matchMedia('(max-width:760px)').matches) set(false);
  });
})();
