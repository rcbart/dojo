
/* ============================== KEYWORDS ============================== */
const TUT='https://docs.oracle.com/javase/tutorial/';
const KW={
abstract:['Declares a class that cannot be instantiated or a method without a body that subclasses must implement.',TUT+'java/IandI/abstract.html'],
assert:['Tests an assumption at runtime; throws AssertionError if false (enable with -ea).','https://docs.oracle.com/javase/8/docs/technotes/guides/language/assert.html'],
boolean:['Primitive type holding true or false.',TUT+'java/nutsandbolts/datatypes.html'],
break:['Exits the nearest loop or switch immediately.',TUT+'java/nutsandbolts/branch.html'],
byte:['8-bit signed integer primitive (-128 to 127).',TUT+'java/nutsandbolts/datatypes.html'],
case:['One branch of a switch statement or expression.',TUT+'java/nutsandbolts/switch.html'],
catch:['Handles an exception thrown in the matching try block.',TUT+'essential/exceptions/catch.html'],
char:['16-bit Unicode character primitive, e.g. \'A\'.',TUT+'java/nutsandbolts/datatypes.html'],
class:['Declares a class — a blueprint bundling state (fields) and behavior (methods).',TUT+'java/javaOO/classes.html'],
continue:['Skips the rest of the current loop iteration and starts the next one.',TUT+'java/nutsandbolts/branch.html'],
default:['Fallback branch in a switch; also declares a default method body in an interface.',TUT+'java/IandI/defaultmethods.html'],
do:['Starts a do-while loop, which always runs its body at least once.',TUT+'java/nutsandbolts/while.html'],
double:['64-bit floating point primitive; the default for decimal literals.',TUT+'java/nutsandbolts/datatypes.html'],
else:['Branch executed when the if condition is false.',TUT+'java/nutsandbolts/if.html'],
enum:['Declares a fixed set of named constants, each a singleton instance.',TUT+'java/javaOO/enum.html'],
extends:['Declares inheritance: the subclass inherits members of the superclass. A class can extend only one class.',TUT+'java/IandI/subclasses.html'],
final:['On a variable: assignable once. On a method: cannot be overridden. On a class: cannot be extended.',TUT+'java/IandI/final.html'],
finally:['Block that always runs after try/catch — for cleanup. Prefer try-with-resources for closeables.',TUT+'essential/exceptions/finally.html'],
float:['32-bit floating point primitive; literal needs an f suffix (1.5f).',TUT+'java/nutsandbolts/datatypes.html'],
for:['Classic counted loop, or enhanced for-each over arrays and Iterables: for (var x : list).',TUT+'java/nutsandbolts/for.html'],
if:['Conditional branch: runs the block when the boolean expression is true.',TUT+'java/nutsandbolts/if.html'],
implements:['Declares that a class provides the methods of an interface. A class can implement many interfaces.',TUT+'java/IandI/usinginterface.html'],
import:['Makes a class or static member from another package usable without its full name.',TUT+'java/package/usepkgs.html'],
instanceof:['Tests whether an object is of a given type; with pattern matching also binds it: if (o instanceof String s).','https://dev.java/learn/pattern-matching/'],
int:['32-bit signed integer primitive — the default integer type.',TUT+'java/nutsandbolts/datatypes.html'],
interface:['A contract of abstract methods (plus default/static methods) that classes implement. Basis of polymorphism and lambdas.',TUT+'java/IandI/createinterface.html'],
long:['64-bit signed integer primitive; literal needs an L suffix (10_000_000_000L).',TUT+'java/nutsandbolts/datatypes.html'],
new:['Instantiates an object: allocates it on the heap and runs the constructor.',TUT+'java/javaOO/objectcreation.html'],
package:['Declares the namespace a class lives in; maps to the directory structure.',TUT+'java/package/packages.html'],
private:['Member visible only inside its own class. Default choice for fields (encapsulation).',TUT+'java/javaOO/accesscontrol.html'],
protected:['Member visible in the same package and in subclasses.',TUT+'java/javaOO/accesscontrol.html'],
public:['Member or class visible everywhere.',TUT+'java/javaOO/accesscontrol.html'],
return:['Exits a method, optionally handing back a value.',TUT+'java/javaOO/returnvalue.html'],
short:['16-bit signed integer primitive.',TUT+'java/nutsandbolts/datatypes.html'],
static:['Belongs to the class itself, not to instances. One copy shared by all; called without an object.',TUT+'java/javaOO/classvars.html'],
super:['Refers to the superclass: call its constructor super(...) or its methods super.m().',TUT+'java/IandI/super.html'],
switch:['Multi-way branch on a value. Modern switch expressions use -> arrows and can return a value.','https://dev.java/learn/language-basics/switch-expression/'],
synchronized:['Marks a method/block as a mutual-exclusion critical section using an object monitor lock.',TUT+'essential/concurrency/syncmeth.html'],
this:['Reference to the current object; also this(...) calls another constructor of the same class.',TUT+'java/javaOO/thiskey.html'],
throw:['Throws an exception object: throw new IllegalArgumentException("bad").',TUT+'essential/exceptions/throwing.html'],
throws:['Declares the checked exceptions a method may propagate to its caller.',TUT+'essential/exceptions/declaring.html'],
transient:['Excludes a field from Java serialization.','https://docs.oracle.com/javase/8/docs/platform/serialization/spec/serial-arch.html'],
try:['Starts a block whose exceptions can be caught; try (resource) auto-closes AutoCloseables.',TUT+'essential/exceptions/try.html'],
var:['Local variable type inference (Java 10+): the compiler infers the type from the initializer. Still statically typed.','https://dev.java/learn/language-basics/using-var/'],
void:['Return type meaning the method returns nothing.',TUT+'java/javaOO/methods.html'],
volatile:['Guarantees reads/writes of the field go to main memory — visibility across threads, not atomicity.',TUT+'essential/concurrency/atomic.html'],
while:['Loop that runs while its condition stays true.',TUT+'java/nutsandbolts/while.html'],
record:['Concise immutable data carrier (Java 16+): record Point(int x, int y) {} auto-generates constructor, accessors, equals, hashCode, toString.','https://dev.java/learn/records/'],
sealed:['Restricts which classes may extend/implement this type, listed with permits (Java 17+).','https://dev.java/learn/sealed-classes/'],
permits:['Lists the allowed subclasses of a sealed type.','https://dev.java/learn/sealed-classes/'],
yield:['Returns a value from a switch expression block branch.','https://dev.java/learn/language-basics/switch-expression/'],
stream:['Not a keyword but core API: a lazy pipeline of operations (filter, map, reduce) over data. See java.util.stream.','https://dev.java/learn/api/streams/'],
Optional:['Container that may or may not hold a value — an explicit alternative to returning null.','https://dev.java/learn/api/streams/optionals/'],
String:['Immutable sequence of characters; the most used class in Java.',TUT+'java/data/strings.html'],
null:['Literal meaning "no object". Dereferencing it throws NullPointerException.',TUT+'java/nutsandbolts/datatypes.html'],
true:['Boolean literal.',TUT+'java/nutsandbolts/datatypes.html'],
false:['Boolean literal.',TUT+'java/nutsandbolts/datatypes.html'],
};
/* ============================== STATE ============================== */
const store={
  mem:{},                     // in-memory fallback if storage is blocked
  persistent:(()=>{try{localStorage.setItem('__jd_t','1');localStorage.removeItem('__jd_t');return true}catch(e){return false}})(),
  get(){if(!this.persistent)return this.mem;try{return JSON.parse(localStorage.getItem('javadojo')||'{}')}catch(e){return this.mem}},
  set(d){this.mem=d;if(this.persistent){try{localStorage.setItem('javadojo',JSON.stringify(d))}catch(e){this.persistent=false}}},
  lesson(id){return this.get()[id]||{}},
  patch(id,p){const d=this.get();d[id]={...(d[id]||{}),...p};this.set(d)}
};
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
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
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
  const pct=100*done/total;
  let next=null;
  for(const[b,n]of BELTS){if(b>pct){next=[b,n];break;}}
  if(!next)return null;                       // already black belt
  const needDone=Math.ceil(next[0]/100*total);
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
    nx.textContent=n?(n.count+' to '+n.name.replace(/ 🖤/,'')):'Black belt — mastery!';
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
  const note=store.persistent?'':'<div class="bNote">⚠ browser storage blocked — progress lasts for this session only</div>';
  const black=/Black belt/.test(after);
  const ov=document.createElement('div');
  ov.id='beltUpOverlay';ov.className='beltOverlay'+(black?' finalBelt':'');
  ov.innerHTML='<div class="bConfLayer" aria-hidden="true">'+confettiHTML(70)+'</div>'
    +'<div class="beltModal" role="dialog" aria-modal="true" aria-label="Belt promotion">'
    +'<div class="bRays" aria-hidden="true"></div>'
    +'<div class="bBadge" aria-hidden="true"><div class="bBadgeStrip" style="background:'+(BELT_COLORS[after]||'#94a3b8')+'"><span class="bKnot"></span></div></div>'
    +'<div class="bKicker">'+(black?'⚫ Ultimate rank':'🥋 Rank up')+'</div>'
    +'<h2 class="bTitle">'+(black?'BLACK BELT!':'Belt up!')+'</h2>'
    +'<p class="bSub">'+(black?'Mastery of the path — the dojo salutes you.':'Your training has paid off — you have been promoted.')+'</p>'
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
    +'<p class="bSub">Beyond the black belt — a full senior discipline mastered.</p>'
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
    else toast('⛩️ <b>Dan lesson complete</b> — senior discipline in progress; the rank comes with the full stream.');
    return;
  }
  const isProject=cur&&STREAMS[cur.si]&&STREAMS[cur.si].project;
  if(isProject){
    store.patch(l.id,{done:true,completedAt:Date.now()});
    const pb=document.getElementById('doneBanner');
    if(pb)pb.style.display='block';
    renderNav();
    toast('🏗️ <b>Project milestone complete!</b> Real-world skill acquired — this is résumé material, no belt needed.');
    return;
  }
  const isTournament=cur&&STREAMS[cur.si]&&STREAMS[cur.si].tournament;
  if(isTournament){
    store.patch(l.id,{done:true,completedAt:Date.now()});
    const banner=document.getElementById('doneBanner');
    if(banner)banner.style.display='block';
    renderNav();
    toast('🏆 <b>Challenge conquered!</b> Tournament wins are dojo honor — the belt is earned in the main halls.');
    return;
  }
  const before=beltName();
  store.patch(l.id,{done:true,completedAt:Date.now()});
  const banner=document.getElementById('doneBanner');
  if(banner)banner.style.display='block';
  refreshBelt();renderNav();
  const after=beltName();
  const pct=Math.round(100*doneCount()/totalLessons());
  const note=store.persistent?'':'<br><small>⚠ browser storage blocked — progress lasts for this session only</small>';
  if(after!==before)showBeltUp(before,after,pct);
  else toast('✅ Lesson complete — progress saved ('+doneCount()+'/'+totalLessons()+')'+note);
}
function renderNav(){
  const nav=document.getElementById('nav');nav.innerHTML='';
  const home=document.createElement('div');home.className='streamHd';home.innerHTML='🏠 Overview';home.onclick=()=>{cur=null;renderHome();renderNav()};nav.appendChild(home);
  const start=document.createElement('div');start.className='streamHd';start.innerHTML='🚀 Getting started';start.onclick=()=>{cur=null;renderGettingStarted();renderNav()};nav.appendChild(start);
  const path=document.createElement('div');path.className='streamHd';path.innerHTML='🗺️ Learning path';path.onclick=()=>{cur=null;renderPath();renderNav()};nav.appendChild(path);
  const dueN=(typeof reviewDueCount==='function')?reviewDueCount():0;
  const rev=document.createElement('div');rev.className='streamHd';rev.innerHTML='🔁 Review'+(dueN?` <span class="dueBadge">${dueN}</span>`:'');rev.onclick=()=>{cur=null;renderReview();renderNav()};nav.appendChild(rev);
  const prac=document.createElement('div');prac.className='streamHd';prac.innerHTML='🎯 Practice';prac.onclick=()=>{cur=null;renderPractice('all');renderNav()};nav.appendChild(prac);
  const gloss=document.createElement('div');gloss.className='streamHd';gloss.innerHTML='📖 Glossary';gloss.onclick=()=>{cur=null;renderGlossary();renderNav()};nav.appendChild(gloss);
  STREAMS.forEach((s,si)=>{
    if(s.tournament&&!(STREAMS[si-1]&&STREAMS[si-1].tournament)){
      const dv=document.createElement('div');dv.className='navDivider';
      dv.textContent='🏆 TOURNAMENTS — practice, no belt credit';
      nav.appendChild(dv);
    }
    if(s.project&&!(STREAMS[si-1]&&STREAMS[si-1].project)){
      const dv=document.createElement('div');dv.className='navDivider';
      dv.textContent='🏗️ PROJECTS — real-world builds, no belt credit';
      nav.appendChild(dv);
    }
    if(s.dan&&!(STREAMS[si-1]&&STREAMS[si-1].dan)){
      const dv=document.createElement('div');dv.className='navDivider danDivider';
      dv.textContent='⛩️ DAN TRACK — senior engineering, beyond black belt';
      nav.appendChild(dv);
    }
    const hd=document.createElement('div');hd.className='streamHd';
    hd.innerHTML=`${s.icon} ${s.title}<span class="pct">${streamDone(s)}/${s.lessons.length}</span>`;
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
/* Technology domains — streams are grouped into these sections on the home page.
   Each entry lists the exact stream titles it contains, in display order. Any stream
   not matched here falls into a "More" section so nothing is ever hidden. */
const DOMAINS=[
  {name:'Java & the JVM',icon:'☕',titles:['Java Fundamentals','Generics from the Ground Up','Exception Handling','Regex from the Ground Up','Working with User Input','Modern Java Mastery','Concurrency & Multithreading','Time, Testing, Reflection & the JVM','JPMS & Performance Engineering']},
  {name:'Computer Science & Algorithms',icon:'🧠',titles:['Data Structures','Dynamic Programming & Advanced Algorithms']},
  {name:'Web, APIs & Frameworks',icon:'🌐',titles:['Web Development','Front-End with React','APIs & REST','Spring Boot']},
  {name:'Data & Persistence',icon:'🗄️',titles:['Working with Databases']},
  {name:'Systems & Networking',icon:'🔌',titles:['Networking & Sockets']},
  {name:'Security & Cryptography',icon:'🔐',titles:['Security & Crypto APIs']},
  {name:'Identity & Access (IAM)',icon:'🛂',titles:['Identity and Access']},
  {name:'DevOps & Delivery',icon:'🚀',titles:['Build Tools: Maven & Gradle','Git: Beginner to Master','Deploying Java to the Web','CI/CD: GitHub Actions & ArgoCD']},
  {name:'Architecture & Design',icon:'🏛️',titles:['Design Patterns']},
  {name:'Senior Track (Dan)',icon:'⛩️',titles:['System Design & Tradeoffs','Failure-First: Distributed Systems','Working with Real Code']},
  {name:'Coding Challenges',icon:'🏆',titles:['Coding Challenges: The Tournament']},
  {name:'Real-World Projects',icon:'🛠️',titles:['Real-World Projects']}
];
/* Merge all identity sub-streams (flagged iam:true) into ONE "Identity and Access"
   stream whose lessons carry a .sec sub-category label. Runs once at boot; keeps each
   source file independently gradeable while presenting a single stream to the learner. */
function mergeIdentity(){
  if(STREAMS.some(s=>s.title==='Identity and Access'))return;
  const idx=[];STREAMS.forEach((s,i)=>{if(s.iam)idx.push(i);});
  if(idx.length<2)return;
  const first=idx[0];const lessons=[];
  idx.forEach(i=>{const s=STREAMS[i];(s.lessons||[]).forEach(l=>{l.sec=s.sec||s.title;lessons.push(l);});});
  const merged={icon:'🛂',title:'Identity and Access',blurb:'The whole identity domain in one place — plain-English identity & federation, authentication & MFA, authorization models, sessions & web login, OAuth 2.0 & OIDC, tokens (JWT/JOSE), SAML, PKI, service-to-service & zero trust, enterprise directories, advanced OAuth threats, and governance. Grouped into sub-categories you graduate through from white to black belt.',lessons};
  for(let k=idx.length-1;k>=0;k--)STREAMS.splice(idx[k],1);
  STREAMS.splice(first,0,merged);
}
function streamCard(s,si){
  const d=streamDone(s),t=s.lessons.length;
  return `<div class="card${s.tournament?' tour':(s.project?' proj':(s.dan?' dan':''))}" onclick="openLesson(${si},0)">${s.icon}${s.tournament?'<span class="tourBadge">🏆 TOURNAMENT</span>':(s.project?'<span class="projBadge">🏗️ PROJECT</span>':(s.dan?'<span class="danBadge">⛩️ DAN</span>':''))}<h3>${s.title}</h3><div class="meta">${s.blurb}</div><div class="meta" style="margin-top:6px">${d}/${t} ${s.tournament?'challenges · no belt credit':(s.project?'projects · no belt credit':(s.dan?'lessons · dan track':'lessons'))}</div><div class="bar"><i style="width:${t?Math.round(100*d/t):0}%${s.tournament?';background:#d97706':(s.project?';background:#0e9f6e':(s.dan?';background:linear-gradient(90deg,#111827,#b8860b)':''))}"></i></div></div>`;
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
    // a domain opens by default only if the learner has started it
    const started=idx.some(si=>streamDone(STREAMS[si])>0);
    let head;
    if(beltIdx.length){
      const done=beltIdx.reduce((a,si)=>a+streamDone(STREAMS[si]),0);
      const tot=beltIdx.reduce((a,si)=>a+STREAMS[si].lessons.length,0);
      const bn=domainBelt(done,tot);
      head=`<span class="domainLeft">${beltStrip(bn)}${dom.icon} ${dom.name}</span><span class="domainCount">${bn} · ${done}/${tot}</span>`;
    } else {
      head=`<span class="domainLeft">${dom.icon} ${dom.name}</span><span class="domainCount">${nStreams} streams · ${nLessons} lessons</span>`;
    }
    let inner='';
    if(mainIdx.length) inner+=`<div class="grid">${mainIdx.map(si=>streamCard(STREAMS[si],si)).join('')}</div>`;
    if(danIdx.length) inner+=`<div class="danTrackHd">⛩️ ${dom.name} · Dan track — advanced topics (post-black, no belt credit)</div><div class="grid">${danIdx.map(si=>streamCard(STREAMS[si],si)).join('')}</div>`;
    sections+=`<details class="domainSec"${started?' open':''}><summary class="domainHd">${head}<span class="domainMeta">${nStreams} stream${nStreams===1?'':'s'} · ${nLessons} lessons</span></summary>${inner}</details>`;
  }
  const extra=STREAMS.map((s,si)=>si).filter(si=>!placed.has(si));
  if(extra.length){
    const n=extra.reduce((a,si)=>a+STREAMS[si].lessons.length,0);
    sections+=`<details class="domainSec"><summary class="domainHd"><span class="domainLeft">✨ More</span><span class="domainMeta">${extra.length} streams · ${n} lessons</span></summary><div class="grid">${extra.map(si=>streamCard(STREAMS[si],si)).join('')}</div></details>`;
  }
  m.innerHTML=`<div class="home">
  <h1>Welcome to DevDojo 🥋</h1>
  <div class="startBanner">New here? Start with <a href="javascript:void(0)" onclick="cur=null;renderGettingStarted();renderNav()"><b>🚀 Getting started</b></a> to set up your environment and get the full depth, then follow the <a href="javascript:void(0)" onclick="cur=null;renderPath();renderNav()"><b>🗺️ Learning path</b></a>.</div>
  <p>${STREAMS.length} training tracks take you from fundamentals to mastery across software engineering — Java &amp; the JVM, computer science &amp; algorithms, web/HTTP &amp; front-end (React), APIs &amp; Spring, databases &amp; SQL, concurrency, security &amp; a large identity domain, DevOps, and senior-level architecture, all grouped by domain below. Every lesson ends with an exercise in the built-in editor. <b>Most exercises are graded on the shape of your answer, not on running it</b> — regex checks that you used the right construct. SQL and JavaScript do execute for real (sample data and a sandboxed worker), and Java runs for real if you start the optional local runner. Every exercise has a <b>Run locally</b> panel with exact commands — that is the ground truth. Stuck? <b>Next Step</b> gives a progressive hint, and <b>Show me the solution</b> is always there — no judgment.</p>
  <p><b>Tip:</b> select or double-click any keyword or term — in a lesson or your own code — and a popup explains it, drawing on 200+ Java, CS, and identity terms from the glossary.</p>
  <div class="gsCard">
  <h2>How to get the most out of DevDojo — learn &amp; retain</h2>
  <ol>
    <li><b>Follow the path, earn the belt.</b> Work a domain top-to-bottom via the <b>🗺️ Learning path</b>; the belt bar tracks your progress white → black.</li>
    <li><b>Struggle first.</b> Try the exercise before revealing anything — use <b>💡 Next Step</b> for a nudge, and only then <b>👀 the solution</b>. The effort is what makes it stick.</li>
    <li><b>Run it for real.</b> Use the <b>🖥️ Run-locally</b> panel or in-app execution to confirm behavior — reading a solution is not the same as making it work.</li>
    <li><b>Check yourself.</b> Take the <b>🧠 Quick check</b> quiz on each lesson; getting one slightly wrong and seeing why is where a lot of the learning happens.</li>
    <li><b>Come back tomorrow.</b> Do your <b>🔁 Review</b> daily — spaced repetition resurfaces cards right before you'd forget them. This is the single biggest lever for retention.</li>
    <li><b>Ramp the difficulty.</b> Once the basics click, use <b>🎯 Practice</b> to grind Easy → Hard.</li>
    <li><b>Teach it back.</b> After each lesson, say the idea in one plain sentence. If you can teach it, you own it.</li>
  </ol>
  </div>
  <p style="font-size:12px;color:var(--muted)">System status: AI test runner ${(window.cowork&&window.cowork.askClaude)?'✅ connected':'⚠️ unavailable — completion falls back to structural checks'} · progress storage ${store.persistent?'✅ persistent':'⚠️ session-only (browser storage is blocked here; progress lasts until this view closes)'}</p>
  ${sections}</div>`;
}
/* ============================== LESSON ============================== */
function exSid(l,exs,i){return exs.length>1?l.id+'#'+i:l.id;}
function lessonExs(l){return l.exs||(l.ex?[l.ex]:[]);}
function openLesson(si,li,ei){
  const s=STREAMS[si],l=s.lessons[li];
  const exs=lessonExs(l);
  if(ei==null){ei=exs.findIndex((x,i)=>!store.lesson(exSid(l,exs,i)).done);if(ei<0)ei=0;}
  cur={si,li,ei};
  window.__QZ=shuffleQuiz(l.quiz);
  const e=exs[ei];
  const sid=e?exSid(l,exs,ei):null;
  const saved=sid?store.lesson(sid):{};
  const m=document.getElementById('main');
  m.innerHTML=`<div class="crumb">${s.icon} ${s.title}${l.sec?' · '+l.sec:''} · Lesson ${li+1} of ${s.lessons.length}</div>
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
      <div class="ioBody" id="io-tests"><span style="color:var(--muted);font-size:12.5px">No runs yet — hit ▶ Compile &amp; Run Tests.</span></div>
      <div class="ioBody" id="io-console" style="display:none"><div class="cLine dim">— compiler and program output will appear here —</div></div>
    </div>
    <div class="doneBanner" id="doneBanner">✅ Lesson complete — nice work! Pick the next lesson in the sidebar.</div>
    <div class="solution" id="solBox" hidden><div class="codeSample">${highlight(e.solution)}</div></div>
    ${depthPanels(s,l,e)}
  </div>`:''}
  ${renderQuiz(l)}
  <div style="margin-top:18px;display:flex;gap:10px">
    ${li>0?`<button onclick="openLesson(${si},${li-1})">← Previous</button>`:''}
    ${li<s.lessons.length-1?`<button class="primary" onclick="openLesson(${si},${li+1})">Next lesson →</button>`:''}
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
    if(isTour)toast('🏆 <b>Challenge solved!</b> '+solved+'/'+exs.length+' in this round — 🎲 Random or pick another anytime');
    else toast('✅ Exercise '+(ei+1)+' of '+exs.length+' complete — pick the next one in the tabs above');
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
/* ============================== TESTS ============================== */
function localChecks(e,code){
  return (e.tests||[]).map(t=>{
    let pass;
    try{pass=new RegExp(t.re,t.flags||'s').test(code);}catch(e){pass=false}
    if(t.not)pass=!pass;
    return {desc:t.d,pass};
  });
}
function cline(txt,cls,attr){return '<div class="cLine'+(cls?' '+cls:'')+'"'+(attr||'')+'>'+txt+'</div>';}
async function runTests(l,e,sid,ei,exs){
  const code=document.getElementById('ed').value;
  if(e.lang==='sql'&&e.data&&window.SQLDB&&window.SQL_DATASETS&&window.SQL_DATASETS[e.data])return gradeSql(l,e,sid,ei,exs,code);
  if(e.run&&typeof Worker!=='undefined')return gradeJs(l,e,sid,ei,exs,code);
  if(!e.lang&&e.gradeJava&&typeof fetch!=='undefined'&&await gradeJavaViaRunner(l,e,sid,ei,exs,code))return;
  const tests=document.getElementById('io-tests');
  const con=document.getElementById('io-console');
  const btn=document.getElementById('btnRun');btn.disabled=true;
  const isJava=!e.lang;
  const checks=localChecks(e,code);
  con.innerHTML=cline('$ '+(isJava?'javac Solution.java && java DojoTestRunner':'dojo check'),'dim')+
    cline('<span class="spin"></span>Claude is compiling and executing in the background…','dim');
  tests.innerHTML='<h4 style="margin:8px 0 4px">Structural checks</h4>'+
    checks.map(c=>`<div class="tcase ${c.pass?'ok':'bad'}">${c.pass?'✔':'✘'} ${c.desc}</div>`).join('')+
    `<div class="aiBox" id="aiOut"><span class="spin"></span>Compile & test run in progress…</div>`;
  setTab('console');
  const numbered=code.split('\n').map((ln,i)=>String(i+1).padStart(3)+' | '+ln).join('\n');
  const prompt=`You are JavaDojo's build and test runner. Act as a strict ${isJava?'Java compiler (javac) and JUnit-style test executor':(e.lang+' validator')}. First check the code compiles/is well-formed; report every compile/syntax error with its line number from the numbered listing. Only if it compiles, mentally execute the behavior tests. Be precise and cite line numbers.

EXERCISE: ${stripTags(e.prompt)}

BEHAVIOR TESTS TO EXECUTE:
${e.behavior}

STUDENT CODE (numbered):
${numbered}

Respond with ONLY valid JSON, no markdown fences:
{"compiles": true|false,
 "compileErrors": [{"line": <int>, "message": "javac-style message"}],
 "tests": [{"name":"...","pass":true|false,"note":"short, cite line numbers on failure"}],
 "output": "what the program/tests would print to stdout, if anything, else empty string",
 "passed": true|false,
 "feedback": "2-4 sentences: what's right, what's wrong, one concrete next suggestion. Do NOT give the full solution."}`;
  try{
    if(!window.cowork||!window.cowork.askClaude)throw new Error('AI runner unavailable in this preview — structural checks only.');
    const raw=await window.cowork.askClaude(prompt,[]);
    const out=extractJson(raw);
    if(out){
      // ---- console tab ----
      let ch=cline('$ '+(isJava?'javac Solution.java':'dojo check'),'dim');
      if(out.compiles===false){
        (out.compileErrors||[]).forEach(er=>{
          ch+=cline('Solution.java:'+(er.line||'?')+': error: '+esc(er.message||''),'err',
            ' onclick="jumpToLine('+(parseInt(er.line)||1)+')" title="click to jump to line '+(er.line||1)+'"');
        });
        ch+=cline((out.compileErrors||[]).length+' error(s)','err')+cline('BUILD FAILED','err');
      }else{
        ch+=cline('Compilation successful.','ok');
        if(isJava)ch+=cline('$ java DojoTestRunner','dim');
        if(out.output&&String(out.output).trim())
          String(out.output).split('\n').forEach(x=>ch+=cline(esc(x)));
        const tl=out.tests||[],p=tl.filter(t=>t.pass).length;
        tl.forEach(t=>ch+=cline((t.pass?'✔ PASS':'✘ FAIL')+'  '+esc(t.name)+(t.note&&!t.pass?'  — '+esc(t.note):''),t.pass?'ok':'err'));
        ch+=cline('Tests run: '+tl.length+', passed: '+p+', failed: '+(tl.length-p),p===tl.length?'ok':'err');
        ch+=cline(p===tl.length?'BUILD SUCCESS':'BUILD FAILED (test failures)',p===tl.length?'ok':'err');
      }
      con.innerHTML=ch;
      // ---- tests tab ----
      const box=document.getElementById('aiOut');
      let th='';
      if(out.compiles===false){
        th='<h4 style="margin:10px 0 4px">Compilation</h4>'+
          (out.compileErrors||[]).map(er=>`<div class="tcase bad" style="cursor:pointer" onclick="jumpToLine(${parseInt(er.line)||1})">✘ line ${er.line||'?'}: ${esc(er.message||'')}</div>`).join('')+
          `<div class="aiBox"><h4>🤖 Feedback</h4>${esc(out.feedback||'')}</div>`;
      }else{
        th='<h4 style="margin:10px 0 4px">Test run</h4>'+
          (out.tests||[]).map(t=>`<div class="tcase ${t.pass?'ok':'bad'}">${t.pass?'✔':'✘'} ${esc(t.name)}${t.note?' — '+esc(t.note):''}</div>`).join('')+
          `<div class="aiBox"><h4>🤖 Feedback</h4>${esc(out.feedback||'')}</div>`;
      }
      box.outerHTML=th;
      const allLocal=checks.every(c=>c.pass);
      const tl2=out.tests||[];
      const aiPass=out.passed===true||(tl2.length>0&&tl2.every(t=>t.pass));
      const green=out.compiles!==false&&aiPass&&allLocal;
      setTab(out.compiles===false?'console':'tests');
      markTab(out.compiles===false?'tests':'console',green?'#16a34a':'#dc2626');
      if(green){
        completeExercise(l,sid,ei,exs);
      }else if(out.compiles!==false&&aiPass&&!allLocal){
        document.getElementById('io-tests').insertAdjacentHTML('beforeend',
          '<div class="aiBox hint"><h4>⚠ Almost there</h4>All behavior tests pass, but one or more structural checks above are still failing — they enforce the specific technique this lesson teaches. Fix those and run again to complete the lesson.</div>');
      }
    }else{
      const allLocal=checks.length&&checks.every(c=>c.pass);
      document.getElementById('aiOut').innerHTML='<h4>🤖 Feedback</h4>'+
        esc(typeof raw==='string'?raw:JSON.stringify(raw))+
        (allLocal?'<br><br><b>All structural checks pass — lesson marked complete.</b>':'');
      con.innerHTML=cline('Runner returned unstructured feedback — see Test Results tab.','warn');
      setTab('tests');
      if(allLocal)completeExercise(l,sid,ei,exs);
    }
  }catch(e){
    const allLocal=checks.length&&checks.every(c=>c.pass);
    document.getElementById('aiOut').innerHTML=esc(e.message)+(allLocal?' All structural checks passed — marking complete.':'');
    con.innerHTML=cline(esc(e.message),'warn');
    setTab('tests');
    if(allLocal)completeExercise(l,sid,ei,exs);
  }
  btn.disabled=false;
}
/* ============================== REAL EXECUTION GRADERS ============================== */
function sqlSelects(text){
  return text.replace(/\/\*[\s\S]*?\*\//g,' ').replace(/--[^\n]*/g,' ')
    .split(';').map(s=>s.trim()).filter(Boolean).filter(s=>/^select/i.test(s));
}
function canonRows(rows,ordered){
  const tuples=rows.map(r=>JSON.stringify(Object.values(r)));
  if(!ordered)tuples.sort();
  return JSON.stringify(tuples);
}
/* Grade SQL by REAL execution: run the learner's and the reference solution's SELECTs
   against the sample dataset and compare result sets (value-tuples; order matters only
   when the reference uses ORDER BY). */
function gradeSql(l,e,sid,ei,exs,code){
  const btn=document.getElementById('btnRun');btn.disabled=true;
  const tests=document.getElementById('io-tests');const con=document.getElementById('io-console');
  const db=window.SQL_DATASETS[e.data];
  const refQ=sqlSelects(e.solution),myQ=sqlSelects(code);
  const results=[];let allPass=refQ.length>0;
  const n=Math.max(refQ.length,myQ.length);
  for(let i=0;i<n;i++){
    const rq=refQ[i],mq=myQ[i];
    if(!rq){results.push({pass:false,name:'Query '+(i+1),note:'unexpected extra query'});allPass=false;continue;}
    if(!mq){results.push({pass:false,name:'Query '+(i+1),note:'missing — this exercise expects '+refQ.length+' quer'+(refQ.length>1?'ies':'y')});allPass=false;continue;}
    let refRows=null,myRows=null,err=null;
    try{refRows=window.SQLDB.run(JSON.parse(JSON.stringify(db)),rq);}catch(x){refRows=null;}
    try{myRows=window.SQLDB.run(JSON.parse(JSON.stringify(db)),mq);}catch(x){err=x.message;}
    if(err){results.push({pass:false,name:'Query '+(i+1),note:'SQL error: '+err});allPass=false;continue;}
    const ordered=/order\s+by/i.test(rq);
    const pass=!!refRows&&canonRows(myRows,ordered)===canonRows(refRows,ordered);
    results.push({pass,name:'Query '+(i+1)+' returns the correct rows',
      note:pass?'':((myRows?myRows.length:0)+' row(s) returned, expected '+(refRows?refRows.length:'?')+' — check columns, filter'+(ordered?', and order':'')) });
    if(!pass)allPass=false;
  }
  tests.innerHTML='<h4 style="margin:8px 0 4px">Executed against sample data ('+esc(e.data)+')</h4>'+
    results.map(c=>`<div class="tcase ${c.pass?'ok':'bad'}">${c.pass?'✔':'✘'} ${esc(c.name)}${c.note?' — '+esc(c.note):''}</div>`).join('')+
    `<div class="aiBox"><h4>🗄️ Real execution</h4>Your SQL ran in the in-browser engine against the <b>${esc(e.data)}</b> dataset and its result set was compared to the reference — this is real execution, not a pattern match. Open “Sample data” below to inspect the rows.</div>`;
  con.innerHTML=cline('$ dojo sql --dataset '+e.data,'dim')+cline(allPass?'All queries returned the expected rows.':'Some queries did not match the expected result set.',allPass?'ok':'err');
  setTab('tests');markTab('console',allPass?'#16a34a':'#dc2626');
  if(allPass)completeExercise(l,sid,ei,exs);
  btn.disabled=false;
}
/* Grade pure-JS exercises by REAL execution in an isolated Web Worker. The exercise
   supplies e.run = { call:'fnName', cases:[{args,expect,name?}], mock?:'fetch' }. */
function buildWorkerSrc(code,spec){
  const cases=JSON.stringify(spec.cases||[]);
  const mode=spec.mock==='fetch'?'fetch':'call';
  const callLine=mode==='fetch'
    ? '__req=null; await '+spec.call+'.apply(null,c.args||[]); var r=checkFetch(c.expect,__req); results.push({name:c.name||("case "+(i+1)),pass:r.ok,note:r.note});'
    : 'var got=await '+spec.call+'.apply(null,c.args||[]); var ok=deepEq(got,c.expect); results.push({name:c.name||("case "+(i+1)),pass:ok,note:ok?"":("returned "+JSON.stringify(got))});';
  return '"use strict";\n'
    +'function deepEq(a,b){return JSON.stringify(a)===JSON.stringify(b);}\n'
    +'function checkFetch(x,req){if(!req)return{ok:false,note:"no fetch was called"};var o=req.opts||{};'
    +'if(x.method&&String(o.method||"GET").toUpperCase()!==x.method.toUpperCase())return{ok:false,note:"method was "+(o.method||"GET")};'
    +'if(x.url&&String(req.url).indexOf(x.url)<0)return{ok:false,note:"url was "+req.url};'
    +'if(x.contentType){var h=o.headers||{};var ct=h["Content-Type"]||h["content-type"]||"";if(String(ct).indexOf(x.contentType)<0)return{ok:false,note:"content-type was "+ct};}'
    +'if(x.bodyIncludes&&String(o.body||"").indexOf(x.bodyIncludes)<0)return{ok:false,note:"body was "+String(o.body||"")};return{ok:true,note:""};}\n'
    +'(async function(){var results=[];var __req=null;'
    +(mode==='fetch'?'self.fetch=function(u,o){__req={url:u,opts:o||{}};return Promise.resolve({ok:true,status:201,json:function(){return Promise.resolve({});}});};':'')
    +'try{\n'+code+'\nvar cases='+cases+';for(var i=0;i<cases.length;i++){var c=cases[i];try{'+callLine+'}catch(err){results.push({name:c.name||("case "+(i+1)),pass:false,note:(err&&err.message)||String(err)});}}'
    +'}catch(err){results.push({name:"loaded without error",pass:false,note:(err&&err.message)||String(err)});}'
    +'postMessage(results);})();';
}
function gradeJs(l,e,sid,ei,exs,code){
  const btn=document.getElementById('btnRun');btn.disabled=true;
  const tests=document.getElementById('io-tests');const con=document.getElementById('io-console');
  tests.innerHTML='<div class="aiBox"><span class="spin"></span>Running your code in a sandboxed Web Worker…</div>';setTab('tests');
  let w=null;
  const finish=(results,fatal)=>{
    try{if(w)w.terminate();}catch(_){}
    const allPass=!fatal&&results.length>0&&results.every(r=>r.pass);
    tests.innerHTML='<h4 style="margin:8px 0 4px">Executed in a sandboxed Web Worker</h4>'+
      (fatal?`<div class="tcase bad">✘ ${esc(fatal)}</div>`:results.map(c=>`<div class="tcase ${c.pass?'ok':'bad'}">${c.pass?'✔':'✘'} ${esc(c.name)}${c.note?' — '+esc(c.note):''}</div>`).join(''))+
      `<div class="aiBox"><h4>▶ Real execution</h4>Your function was called with real inputs in an isolated worker and its output compared to expected values — real execution, not a pattern match.</div>`;
    con.innerHTML=cline('$ run '+e.run.call+'()','dim')+cline(allPass?'All cases passed.':(fatal||'Failures above.'),allPass?'ok':'err');
    markTab('console',allPass?'#16a34a':'#dc2626');
    if(allPass)completeExercise(l,sid,ei,exs);
    btn.disabled=false;
  };
  let src;try{src=buildWorkerSrc(code,e.run);}catch(x){return finish([],'could not prepare runner: '+x.message);}
  try{
    w=new Worker(URL.createObjectURL(new Blob([src],{type:'text/javascript'})));
    const timer=setTimeout(()=>finish([],'timed out after 3s (possible infinite loop)'),3000);
    w.onmessage=ev=>{clearTimeout(timer);finish(ev.data,null);};
    w.onerror=ev=>{clearTimeout(timer);finish([],(ev&&ev.message)||'worker error (check for syntax errors)');};
  }catch(x){finish([],'worker unavailable: '+x.message);}
}
/* Phase 3: executable Java grading via the opt-in local runner. Builds a DojoTest
   harness that calls the student's methods and asserts expected values, compiles it
   with their code, runs it, and parses PASS/FAIL. Falls back (returns false) when the
   runner is off, so everyone still gets the regex/AI path. */
function buildJavaHarness(g){
  const inst=g.static===false, cls=g.class, recv=inst?'_o':cls;
  const L=['public class DojoTest {','  public static void main(String[] args){','    int p=0,t=0;','    StringBuilder sb=new StringBuilder();'];
  if(inst)L.push('    '+cls+' _o=new '+cls+'();');
  (g.cases||[]).forEach((c,i)=>{
    const args=(c.args||[]).join(', ');
    const name=String(c.name||('case '+(i+1))).replace(/\\/g,'\\\\').replace(/"/g,'\\"');
    L.push('    t++; try { Object got='+recv+'.'+c.call+'('+args+'); boolean ok=java.util.Objects.equals(got, '+c.expect+'); if(ok)p++; sb.append(ok?"PASS ":"FAIL ").append("'+name+'").append(ok?"":(" (got "+got+")")).append("\\n"); } catch(Throwable ex){ sb.append("FAIL "+"'+name+'"+" (threw "+ex+")\\n"); }');
  });
  L.push('    System.out.print(sb.toString());');
  L.push('    System.out.println("DOJO_RESULT "+p+"/"+t);');
  L.push('  }','}');
  return L.join('\n');
}
async function gradeJavaViaRunner(l,e,sid,ei,exs,code){
  const tests=document.getElementById('io-tests'),con=document.getElementById('io-console'),btn=document.getElementById('btnRun');
  const prev=tests.innerHTML; if(btn)btn.disabled=true;
  tests.innerHTML='<div class="aiBox"><span class="spin"></span>Compiling &amp; running with the local JDK…</div>';
  let data=null;
  try{
    const r=await fetch('/api/run/java',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify({code,harness:buildJavaHarness(e.gradeJava)})});
    if(!r.ok){tests.innerHTML=prev;if(btn)btn.disabled=false;return false;} // runner off -> fall back
    data=await r.json();
  }catch(_){tests.innerHTML=prev;if(btn)btn.disabled=false;return false;}
  const out=String(data.output||'');
  if(data.ok===false&&data.stage==='compile'){
    con.innerHTML=cline('$ javac *.java','dim')+out.split('\n').map(x=>cline(esc(x),'err')).join('')+cline('BUILD FAILED','err');
    tests.innerHTML='<h4 style="margin:8px 0 4px">Compilation (local JDK)</h4><div class="tcase bad">✘ your code did not compile — see the Console tab</div>';
    setTab('console');markTab('tests','#dc2626');if(btn)btn.disabled=false;return true;
  }
  const caseLines=out.split('\n').filter(x=>/^(PASS|FAIL) /.test(x));
  const mr=out.match(/DOJO_RESULT\s+(\d+)\/(\d+)/);
  const p=mr?parseInt(mr[1],10):0,t=mr?parseInt(mr[2],10):0,allPass=t>0&&p===t;
  tests.innerHTML='<h4 style="margin:8px 0 4px">Executed with the local JDK — real compile &amp; run</h4>'+
    caseLines.map(x=>{const ok=x.indexOf('PASS')===0;return '<div class="tcase '+(ok?'ok':'bad')+'">'+(ok?'✔':'✘')+' '+esc(x.replace(/^(PASS|FAIL) /,''))+'</div>';}).join('')+
    '<div class="aiBox"><h4>▶ Real execution</h4>Compiled and ran on your machine; '+p+'/'+t+' assertions passed.</div>';
  con.innerHTML=cline('$ javac *.java && java DojoTest','dim')+cline(esc(out),allPass?'ok':'err');
  setTab('tests');markTab('console',allPass?'#16a34a':'#dc2626');
  if(allPass)completeExercise(l,sid,ei,exs);
  if(btn)btn.disabled=false;
  return true;
}
/* ============================== HINTS ============================== */
async function nextStep(e,sid){
  setTab('tests');
  const res=document.getElementById('io-tests');
  const hints=e.hints||[];
  if(hintIdx<hints.length){
    res.insertAdjacentHTML('beforeend',`<div class="aiBox hint"><h4>💡 Next step ${hintIdx+1}/${hints.length}</h4>${hints[hintIdx]}</div>`);
    hintIdx++;store.patch(sid,{hintIdx});
    return;
  }
  res.insertAdjacentHTML('beforeend',`<div class="aiBox hint" id="aiHint"><span class="spin"></span>Asking Claude for a personalised next step…</div>`);
  const code=document.getElementById('ed').value;
  try{
    if(!window.cowork||!window.cowork.askClaude)throw new Error('AI hints unavailable in this preview.');
    const raw=await window.cowork.askClaude(`A student is stuck on this Java exercise. Give ONE short concrete next step (2-3 sentences max) based on their current code. Do not give the full solution.\n\nEXERCISE: ${stripTags(e.prompt)}\n\nTHEIR CODE:\n${code}`,[]);
    document.getElementById('aiHint').innerHTML='<h4>💡 Claude suggests</h4>'+esc(String(raw));
  }catch(e){document.getElementById('aiHint').innerHTML=esc(e.message)}
  document.getElementById('aiHint')?.removeAttribute('id');
}
/* ============================== KEYWORD POPUP ============================== */
const tip=document.getElementById('kwTip');
function showTip(word,x,y){
  const k=KW[word]||KW[word.toLowerCase()];
  if(!k){tip.style.display='none';return}
  const link=/^https?:/.test(k[1]||'')?` <a href="${k[1]}" target="_blank" rel="noopener">Docs ↗</a>`:'';
  tip.innerHTML=`<b>${esc(word)}</b> — ${esc(k[0])}${link}`;
  tip.style.display='block';
  tip.style.left=Math.min(x,innerWidth-360)+'px';
  tip.style.top=Math.min(y+14,innerHeight-120)+'px';
}
document.addEventListener('mouseup',e=>{
  if(tip.contains(e.target))return;
  setTimeout(()=>{
    let word='';
    const ed=document.getElementById('ed');
    if(ed&&e.target===ed&&ed.selectionStart!==ed.selectionEnd){
      word=ed.value.slice(ed.selectionStart,ed.selectionEnd).trim();
    }else{
      const sel=window.getSelection();
      word=sel?String(sel.toString()).trim():'';
    }
    if(word&&/^[A-Za-z]{2,14}$/.test(word))showTip(word,e.clientX,e.clientY);
    else tip.style.display='none';
  },0);
});

/* ============================== GLOSSARY (domain-ordered) ============================== */
/* Single source of truth for domain vocabulary. Rendered as its own section (renderGlossary)
   AND merged into KW below so selecting a term in any lesson pops its definition. */
const GLOSS=[
 {domain:'Identity & Access (IAM)',icon:'🛂',groups:[
   {h:'1 · The core distinction',terms:[
     ['Authentication (authn)',`Proving who you are — the login step.`],
     ['Authorization (authz)',`Deciding what you may do, once you are known.`],
     ['Identity',`The account or entity behind a request — a person or a workload.`],
     ['Principal',`The specific "who" a request acts as; in tokens, the sub (subject) claim.`],
     ['Subject',`Same as principal — the entity a token is about (the sub claim).`],
     ['Credential',`The stored binding that ties an authenticator to an identifier — the record saying "this account is proven by this password hash or public key."`],
['Authenticator',`The thing you actually hold and present: a password, a passkey, a security key, a fingerprint. You possess an authenticator; the system stores a credential.`],
['Account',`The concrete record for a person in one particular system. One person routinely has many accounts.`],
['Identifier',`The string naming an account inside a system: a username, email, UUID or employee number.`],
['Identity proofing',`Establishing who a person is in the real world, once, before an account exists. Not authentication.`],
['Enrollment',`Creating the account and assigning its identifier, after proofing.`],
['Credential binding',`Attaching an authenticator to an identifier. The step attackers target — a weak password-reset flow is a binding flaw, not an authentication one.`],
   ]},
   {h:'2 · The actors',terms:[
     ['Resource Owner',`The user who owns the data an app wants to reach.`],
     ['Client',`The app requesting access. Called Relying Party in OIDC and Service Provider in SAML.`],
     ['Relying Party (RP)',`OIDC name for the app that relies on the provider to authenticate the user.`],
     ['Service Provider (SP)',`SAML name for the app that consumes assertions from an IdP.`],
     ['Identity Provider (IdP)',`The authority that authenticates users and issues tokens or assertions. Called AS in OAuth, OP in OIDC.`],
     ['Authorization Server (AS)',`OAuth name for the server that issues access tokens.`],
     ['OpenID Provider (OP)',`OIDC name for the identity provider that issues ID tokens.`],
     ['Resource Server (RS)',`The API that accepts and validates access tokens.`],
   ]},
   {h:'3 · Tokens & assertions',terms:[
     ['Access token',`The key an app uses to call an API. Represents authorization, not identity.`],
     ['ID token',`OIDC proof of who the user is, issued to the client. A JWT. Not for calling APIs.`],
     ['Refresh token',`A long-lived token used to obtain new access tokens without a fresh login.`],
     ['Assertion',`SAML signed XML statement about a user — its equivalent of an ID token.`],
     ['JWT',`JSON Web Token — a signed, self-contained token whose claims you can read and verify.`],
     ['Opaque token',`A random reference with no readable content; validated by calling the issuer introspection endpoint.`],
     ['Claim',`A fact in transit, asserted by a specific issuer — worth exactly as much as your trust in that issuer for that kind of fact.`],
['Attribute',`A fact at rest, stored in a directory (department, manager, email). It becomes a claim when an issuer asserts it.`],
['Registered claim',`The standardized envelope claims: iss, sub, aud, exp, iat, nbf, jti. Everything else is issuer-defined.`],
['Attribute release',`The per-app policy deciding which stored attributes are allowed to become claims. Data minimization.`],
['Attribute mapping',`Translating attribute names between systems (sAMAccountName to preferred_username to username). Mismatches are the top cause of federations that log in fine but create broken user records.`],
['Structured token',`A self-contained token carrying its claims inside, verified offline via a signature. Fast, but public and hard to revoke. Contrast with an opaque token.`],
['JWS',`JSON Web Signature — the signed compact form behind a normal JWT: three base64url parts, readable by anyone.`],
['JWE',`JSON Web Encryption — the encrypted five-part compact form, for when the claims must not be readable.`],
['PASETO',`A token format designed to remove the alg negotiation that made JWT footguns possible.`],
['Macaroon',`A token format whose holder can narrow its own permissions before passing it on.`],
['Token introspection',`Asking the issuer what an opaque token means, since it carries no readable claims (RFC 7662).`],
     ['Scope',`A named permission a token grants, such as read invoices.`],
     ['Bearer token',`A token usable by anyone who holds it, like cash. Protect it in transit and at rest.`],
     ['Sender-constrained token',`A token bound to a key only the real client has (mTLS-bound or DPoP), so a stolen copy is useless.`],
   ]},
   {h:'4 · Protocols & standards',terms:[
     ['OAuth 2.0',`The delegated authorization framework: lets an app act for a user without the user password.`],
     ['OpenID Connect (OIDC)',`An authentication layer on top of OAuth 2.0 that adds the ID token.`],
     ['SAML 2.0',`An XML-based standard for enterprise web single sign-on.`],
     ['SCIM',`A standard for provisioning and syncing user accounts across systems.`],
     ['WebAuthn',`A browser standard for phishing-resistant, origin-bound login (the basis of passkeys).`],
     ['LDAP',`A protocol for querying enterprise directories of users and groups.`],
     ['Kerberos',`A ticket-based enterprise SSO protocol (KDC, TGT, service tickets).`],
   ]},
   {h:'5 · Flows / grant types',terms:[
     ['Authorization Code flow',`The main flow for apps acting for a user: get a short code via the browser, then swap it for tokens on the back channel.`],
     ['PKCE',`Proof Key for Code Exchange — protects the code flow for public clients so a stolen code cannot be redeemed.`],
     ['Client Credentials flow',`Machine-to-machine flow with no user: the service authenticates as itself to get a token.`],
     ['Device flow',`For input-limited devices such as TVs and CLIs: the user approves on a phone using a code.`],
     ['Token Exchange',`Swapping one token for another, for example to call a downstream service on behalf of a user.`],
     ['CIBA',`Client-Initiated Backchannel Authentication — the user approves on a separate device, no browser redirect.`],
     ['Implicit flow',`A legacy flow that returned tokens directly in the browser. Deprecated; use code plus PKCE.`],
     ['ROPC',`Resource Owner Password Credentials — the app collects the user password directly. Deprecated.`],
   ]},
   {h:'6 · Endpoints',terms:[
     ['/authorize',`Where a login or consent flow starts (front channel, in the browser).`],
     ['/token',`Where an app exchanges a code or credentials for tokens (back channel).`],
     ['/userinfo',`An OIDC endpoint returning profile claims for the access token user.`],
     ['/introspect',`Where a resource server asks the issuer whether an opaque token is valid (RFC 7662).`],
     ['/revoke',`Where a token is proactively invalidated (RFC 7009).`],
     ['JWKS',`The published set of public keys (jwks_uri) used to verify token signatures.`],
     ['Discovery',`The /.well-known/openid-configuration document listing a provider endpoints and keys.`],
   ]},
   {h:'7 · Core concepts',terms:[
     ['SSO',`Single Sign-On — a user experience, not a protocol: one login event, many apps. Achievable by a shared session cookie within one domain, or by federation across boundaries.`],
     ['Federation',`A trust architecture: an app stops authenticating users itself and accepts signed statements from an authority it trusts, usually across an organizational boundary. Delivers SSO as a side effect, but is worth doing for one app.`],
['Single Logout (SLO)',`Ending every session created by an SSO login. Unreliable in practice because one login event really created many independent app sessions.`],
     ['Trust',`A relying party accepting tokens or assertions signed by an authority it is configured to rely on.`],
['Trust anchor',`Where the chain of verification stops: a key or certificate accepted as authoritative by configuration rather than by proof. A JWKS you pinned, an IdP certificate in SAML metadata, a root CA in your truststore. Never let a token choose its own anchor.`],
     ['Consent',`The user explicitly approving what an app may access.`],
     ['Delegated authorization',`The core idea of OAuth: you let an app do a limited set of things for you without sharing your password, and you can revoke it. Answers "may this app do this for me?"`],
['Delegated authentication',`Outsourcing the act of verifying a credential. Two very different styles: credential forwarding (LDAP bind, RADIUS, ROPC — your app holds the password) and redirect/federation (the user authenticates at the IdP and your app never sees a credential).`],
['Credential forwarding',`Delegated authentication where the app collects the password and relays it to a backend to check. Puts the app inside the credential blast radius, and cannot support MFA, passkeys or SSO.`],
['LDAP bind',`Verifying a password by attempting to bind to the directory as that user. The classic credential-forwarding pattern.`],
['On-behalf-of (OBO)',`One service calling another for a user, with a token audienced for the next hop that still names the user as subject and records who is acting.`],
['act (actor) claim',`Records the party acting on the subject's behalf, nesting to preserve a whole delegation chain (RFC 8693). Its presence is what makes a token delegation rather than impersonation.`],
['may_act',`A claim naming who is permitted to act for this subject. Must fail closed: an absent may_act never means "anyone may act."`],
['Effective subject',`Whose data is being viewed and whose permissions apply, as distinct from the authenticated subject who actually logged in. Keeping the two separate is what makes support "act as user" auditable.`],
['Policy Decision Point (PDP)',`Where an access decision is computed from identity, resource, action and context.`],
['Policy Enforcement Point (PEP)',`Where the decision is applied — a gateway, sidecar or middleware that intercepts the request and obeys the verdict.`],
['Fail closed',`Deny when you cannot decide: unreachable policy engine, unverifiable signature, unparseable claim. Failing open is what an attacker induces by overloading you.`],
['cnf (confirmation claim)',`Records which key a sender-constrained token is bound to — jkt for a DPoP JWK thumbprint, x5t#S256 for an mTLS certificate. Comparing it to the presented key is what makes the token non-bearer.`],
['DPoP proof',`A short-lived JWT sent alongside the token on every request, carrying htm, htu, iat, jti and ath, signed with the client's private key.`],
['BFF (backend-for-frontend)',`A server-side component owned by the frontend that holds OAuth tokens, so the browser only ever gets an HttpOnly session cookie.`],
['Capability URL',`A URL whose unguessable path or query IS the credential — password resets, share links, presigned downloads.`],
['IDOR / BOLA',`Insecure direct object reference: the role check passes but nobody verified the record belongs to the caller. Top of the OWASP API Security Top 10.`],
['Effective permissions',`The flattened union of everything a person can do across all groups, nested and direct. The number an access review actually needs.`],
['Deny-overrides',`A policy-combining algorithm where any deny wins, so a prohibition cannot be defeated by adding a permit elsewhere. The safe default.`],
['Discoverable credential',`A WebAuthn credential stored on the authenticator itself, so it knows which accounts it holds — what makes usernameless login possible.`],
['User verification (UV)',`The WebAuthn flag meaning the authenticator checked a PIN or biometric locally. Distinct from user presence (UP), which only means someone touched it.`],
['Phishing-resistant MFA',`A method where the authenticator itself checks who is asking, because the origin is part of the cryptographic operation: passkeys, security keys, smart cards.`],
['Number matching',`Requiring the user to type digits shown on the login screen into the push prompt, defeating blind approval and MFA fatigue.`],
['OAuth 2.1',`A consolidation of OAuth 2.0 plus the Security BCP: implicit and password grants removed, PKCE required for all authorization code flows, exact redirect URI matching.`],
['Confused deputy',`Abusing a party trusted by many principals to act against one of them. External ids in role assumption exist to prevent it.`],
['Relation tuple',`Zanzibar's unit of authorization data: subject, relation, object. Permissions are derived by traversal, not stored.`],
['Zookie',`A consistency token returned on write and presented with a later check, meaning "evaluate against a snapshot at least this recent".`],
['New enemy problem',`A stale replica applies a later write without an earlier one, so a removed user sees newly added content. Each write was correct; the order was lost.`],
['CAE',`Continuous Access Evaluation — the issuer pushes an event when access changes, so a long-lived token can be rejected in seconds instead of at expiry.`],
['Security Event Token (SET)',`A JWT whose payload is an event rather than an identity (RFC 8417). Verify it as rigorously as a token — it changes access.`],
['OpenID Federation',`Trust proven on demand by a signed chain of entity statements up to a trust anchor, replacing pairwise registration in large ecosystems.`],
['Entity statement',`A signed statement a federation participant publishes about itself, and that its authority publishes about it. Chains of these are resolved to an anchor.`],
['Metadata policy',`Constraints an authority places on what a subordinate may declare about itself. Composes downward and can only narrow.`],
['OID4VCI / OID4VP',`OpenID protocols for issuing a verifiable credential into a wallet, and for a verifier requesting a presentation from it.`],
['Presentation definition',`A verifier's machine-readable description of what it needs. The wallet chooses which credential satisfies it and which claims to disclose.`],
['mDL',`Mobile driving licence (ISO/IEC 18013-5) — a CBOR credential format designed to work offline over NFC or Bluetooth.`],
['Non-human identity (NHI)',`Service accounts, workloads, CI runners, bots and agents. They outnumber humans in most estates and inherit none of the joiner-mover-leaver lifecycle.`],
['Agent identity',`An autonomous caller acting for a user: the subject stays the user, the agent is recorded as the acting party, and authority is granted in advance and bounded.`],
     ['Impersonation',`When a service simply acts as the user with no distinction — contrast with delegation.`],
     ['Least privilege',`Granting only the access truly needed, nothing more.`],
     ['MFA',`Multi-factor authentication — requiring two or more independent factors.`],
     ['Step-up authentication',`Asking for stronger proof only when an action is sensitive.`],
     ['Public client',`An app that cannot keep a secret, such as a SPA or mobile app — must use PKCE.`],
     ['Confidential client',`An app that can keep a secret, such as a server — authenticates to the token endpoint.`],
     ['Front channel',`Communication that passes through the user browser (redirects).`],
     ['Back channel',`Direct server-to-server communication the browser never sees.`],
     ['audience (aud)',`The claim naming who a token is for; a resource server must check it.`],
     ['issuer (iss)',`The claim naming who minted a token; verified against the expected authority.`],
     ['nonce',`A one-time value that ties an OIDC ID token to a single login, preventing replay.`],
     ['state',`A random value the client sends on the redirect and re-checks on return, preventing CSRF.`],
     ['Session',`Server- or cookie-tracked state that remembers a logged-in user between requests.`],
   ]},
   {h:'8 · Threats & defenses',terms:[
     ['CSRF',`Cross-Site Request Forgery — a malicious page makes your browser send an unintended authenticated request. Defended with the state parameter and anti-CSRF tokens.`],
     ['Replay attack',`Re-sending a captured token or message to impersonate someone. Defended with short expiries, nonces, and sender-constrained tokens.`],
     ['Token theft',`Stealing a bearer token to reuse it. Defended with short lifetimes, secure storage, and proof-of-possession.`],
     ['Phishing-resistant authentication',`Login methods that cannot be phished because the secret never leaves the device and is bound to the real site origin (passkeys and WebAuthn).`],
     ['Open redirect',`A flaw where an app forwards users to an attacker URL; abused to steal codes or tokens.`],
   ]},
   {h:'9 · Governance & lifecycle',terms:[
     ['Provisioning',`Creating and configuring user accounts and their access, often automated via SCIM.`],
     ['Deprovisioning',`Removing access when someone leaves or changes roles.`],
     ['JML',`Joiner, Mover, Leaver — the employee identity lifecycle.`],
     ['JIT provisioning',`Just-in-time — creating the account automatically on first successful login.`],
     ['RBAC',`Role-Based Access Control — permissions granted through roles.`],
     ['ABAC',`Attribute-Based Access Control — decisions from attributes and policy rules.`],
     ['IGA',`Identity Governance and Administration — access requests, reviews, and certification.`],
     ['PAM',`Privileged Access Management — securing and monitoring high-power accounts.`],
   ]},
 ]},
 {domain:'Service-to-Service & Zero Trust',icon:'🔗',groups:[
   {h:'Machine identity',terms:[
     ['SPIFFE',`A standard for giving workloads verifiable identities (SPIFFE IDs).`],
     ['SPIRE',`The reference implementation that attests workloads and issues SVIDs.`],
     ['SVID',`SPIFFE Verifiable Identity Document — the X.509 cert or JWT a workload uses to prove who it is.`],
     ['mTLS',`Mutual TLS — both client and server present certificates, so each proves its identity.`],
     ['Workload identity',`A non-human identity for a service or job, used instead of shared secrets.`],
     ['Attestation',`Proving what a workload is, from node or process properties, before issuing it an identity.`],
     ['Zero trust',`Never trust by network location; verify identity and authorize every request.`],
   ]},
 ]},
 {domain:'PKI & Certificates',icon:'📜',groups:[
   {h:'Public key infrastructure',terms:[
     ['X.509',`The standard format for a public-key certificate binding a key to an identity.`],
     ['Certificate Authority (CA)',`A trusted issuer that signs certificates.`],
     ['Chain of trust',`A certificate is trusted because it chains up to a root CA you already trust.`],
     ['CSR',`Certificate Signing Request — what you send a CA to get a certificate issued.`],
     ['CRL',`Certificate Revocation List — a published list of revoked certificates.`],
     ['OCSP',`Online Certificate Status Protocol — checks a single certificate revocation status in real time.`],
     ['ACME',`The protocol behind automated certificate issuance, such as Let us Encrypt.`],
   ]},
 ]},
 {domain:'Java & the JVM',icon:'☕',groups:[
   {h:'Language & objects',terms:[
     ['Class',`A blueprint that bundles state (fields) and behavior (methods).`],
     ['Object',`A specific instance of a class, living on the heap.`],
     ['Interface',`A contract of methods a class promises to implement; basis of polymorphism.`],
     ['Abstract class',`A partial class that cannot be instantiated and is meant to be extended.`],
     ['Generics',`Type parameters that let one class or method work over many types safely.`],
     ['Enum',`A fixed set of named constant instances.`],
     ['Record',`A concise, immutable data carrier that auto-generates constructor, accessors, equals and hashCode.`],
     ['Autoboxing',`Automatic conversion between a primitive (int) and its wrapper object (Integer).`],
     ['Immutability',`An object whose state cannot change after construction; inherently thread-safe.`],
     ['Lambda',`A short anonymous function you can pass as a value.`],
     ['Functional interface',`An interface with one abstract method, the target type of a lambda.`],
     ['Stream',`A lazy pipeline of operations (filter, map, reduce) over a data source.`],
     ['Optional',`A container that may or may not hold a value; an explicit alternative to null.`],
     ['Checked exception',`An error the compiler forces you to handle or declare.`],
     ['Unchecked exception',`A RuntimeException the compiler does not force you to handle.`],
   ]},
   {h:'The JVM',terms:[
     ['JVM',`The Java Virtual Machine that executes bytecode on any platform.`],
     ['Bytecode',`The portable instruction set javac compiles your source into.`],
     ['JIT',`Just-In-Time compilation of hot bytecode into native machine code for speed.`],
     ['JDK',`The Java Development Kit: compiler and tools plus the runtime.`],
     ['JRE',`The Java Runtime Environment: just what is needed to run, not compile.`],
     ['Heap',`The shared memory region where all objects and arrays live; managed by the garbage collector.`],
     ['Stack',`Per-thread memory of call frames holding locals and references; automatic, no GC.`],
     ['Metaspace',`Memory holding class metadata and method bytecode.`],
     ['Garbage collection',`Automatic reclaiming of heap objects nothing references anymore.`],
   ]},
 ]},
 {domain:'Data Structures & Algorithms',icon:'🧠',groups:[
   {h:'Structures',terms:[
     ['Array',`A fixed-size, index-addressable block of elements; O(1) access.`],
     ['Linked list',`Nodes chained by pointers; O(1) insert/remove at a known node, O(n) search.`],
     ['Stack',`A last-in first-out (LIFO) collection.`],
     ['Queue',`A first-in first-out (FIFO) collection.`],
     ['Deque',`A double-ended queue supporting push/pop at both ends.`],
     ['Hash table',`Key-value store with O(1) average lookup via a hash function.`],
     ['Tree',`Hierarchical nodes with parent-child links and no cycles.`],
     ['Binary search tree',`A tree keeping left smaller and right larger for O(log n) search when balanced.`],
     ['Heap',`A tree with a parent-child order giving O(1) min/max peek; powers priority queues.`],
     ['Trie',`A prefix tree with one node per character; lookup is O(key length).`],
     ['B-tree',`A wide, shallow tree that minimizes disk reads; the basis of database indexes.`],
     ['Graph',`Nodes connected by edges, possibly with cycles and weights.`],
   ]},
   {h:'Algorithms & analysis',terms:[
     ['BFS',`Breadth-first search: explore level by level with a queue; shortest path in unweighted graphs.`],
     ['DFS',`Depth-first search: go deep with a stack or recursion; cycles, paths, topological sort.`],
     ['Dijkstra',`Shortest path in a weighted graph using a priority queue; the SPF in OSPF routing.`],
     ['Topological sort',`Ordering a DAG so every edge points forward; task and build scheduling.`],
     ['Recursion',`A method that calls itself on a smaller subproblem until a base case.`],
     ['Big-O',`Upper bound on how work grows with input size; the worst-case promise.`],
     ['Theta',`A tight bound where the upper and lower bounds agree.`],
     ['Omega',`A lower bound on how work grows.`],
     ['Time complexity',`How runtime scales with input size, ignoring constants.`],
     ['Space complexity',`How extra memory scales with input size.`],
   ]},
 ]},
 {domain:'Web & HTTP',icon:'🌐',groups:[
   {h:'The protocol',terms:[
     ['HTTP',`The request/response protocol of the web; stateless by design.`],
     ['HTTPS',`HTTP encrypted with TLS.`],
     ['Method',`The verb of a request: GET, POST, PUT, PATCH, DELETE.`],
     ['Status code',`A three-digit result: 2xx success, 3xx redirect, 4xx client error, 5xx server error.`],
     ['Header',`A key-value line carrying metadata on a request or response.`],
     ['Idempotency',`An operation that has the same effect whether done once or many times (safe to retry).`],
     ['Statelessness',`Each request stands alone; the server keeps no per-request memory of the client.`],
     ['CORS',`Cross-Origin Resource Sharing: browser rules for calling another origin.`],
   ]},
   {h:'API design',terms:[
     ['REST',`An architectural style using HTTP verbs on resource URLs.`],
     ['MVC',`Model-View-Controller: separates data, presentation, and request handling.`],
     ['Pagination',`Returning a large collection in pages instead of all at once.`],
     ['Offset pagination',`Page by position (page and size); simple but drifts and slows at depth.`],
     ['Cursor pagination',`Page by an opaque pointer; stable and fast for large, changing data.`],
     ['Content negotiation',`Choosing a response format based on the Accept header.`],
     ['API versioning',`Evolving an API without breaking clients (URI, header, or media-type).`],
     ['Rate limiting',`Capping how many requests a client may make in a window.`],
   ]},
 ]},
 {domain:'Databases & SQL',icon:'🗄️',groups:[
   {h:'Model',terms:[
     ['Table',`A named set of rows and columns.`],
     ['Primary key',`A column (or set) uniquely identifying each row.`],
     ['Foreign key',`A column referencing a primary key in another table, enforcing relationships.`],
     ['Index',`A structure that speeds lookups at the cost of extra writes and space.`],
     ['Constraint',`A rule the data must satisfy (NOT NULL, UNIQUE, CHECK).`],
     ['Normalization',`Organizing tables to remove redundancy.`],
     ['Transaction',`A group of statements that commit all-or-nothing.`],
     ['ACID',`Atomicity, Consistency, Isolation, Durability: the guarantees of a transaction.`],
   ]},
   {h:'Querying',terms:[
     ['JOIN',`Combining rows from two tables on a matching condition.`],
     ['DDL',`Data Definition Language: CREATE, ALTER, DROP, TRUNCATE.`],
     ['DML',`Data Manipulation Language: SELECT, INSERT, UPDATE, DELETE.`],
     ['TCL',`Transaction Control Language: BEGIN, COMMIT, ROLLBACK.`],
     ['DCL',`Data Control Language: GRANT, REVOKE.`],
     ['Aggregate',`A function that collapses rows into one value: COUNT, SUM, AVG.`],
     ['Subquery',`A query nested inside another.`],
     ['CTE',`A named temporary result (WITH ...) used like a table.`],
     ['Window function',`A calculation across a set of rows without collapsing them.`],
     ['N+1 problem',`Firing one query per row instead of one query for all; a common performance bug.`],
     ['Connection pool',`A reused set of database connections to avoid per-request setup cost.`],
   ]},
 ]},
 {domain:'Concurrency',icon:'🧵',groups:[
   {h:'Core ideas',terms:[
     ['Process',`An isolated program with its own private memory.`],
     ['Thread',`A single path of execution within a process; threads share the heap.`],
     ['Concurrency',`Managing many tasks in overlapping time (not necessarily at once).`],
     ['Parallelism',`Actually running tasks at the same instant on multiple cores.`],
     ['Context switch',`The OS swapping one thread off a core for another.`],
     ['Race condition',`A bug where the result depends on unpredictable thread timing.`],
     ['Deadlock',`Two threads each waiting forever for a lock the other holds.`],
     ['Mutex',`A mutual-exclusion lock so only one thread enters a critical section.`],
     ['Atomic',`An operation that completes indivisibly, without interleaving.`],
     ['Volatile',`A field whose reads/writes always go to main memory (visibility across threads).`],
   ]},
   {h:'Tools',terms:[
     ['Thread pool',`A reused set of worker threads that run submitted tasks.`],
     ['Executor',`The Java service that manages a thread pool and runs tasks.`],
     ['Future',`A handle to a result that will be available later.`],
     ['CompletableFuture',`A composable future for building async pipelines.`],
     ['Semaphore',`A counter that limits how many threads use a resource at once.`],
     ['Virtual thread',`A lightweight JVM thread (Java 21) making blocking code scale cheaply.`],
   ]},
 ]},
 {domain:'DevOps & Delivery',icon:'🚀',groups:[
   {h:'Pipeline & packaging',terms:[
     ['CI',`Continuous Integration: automatically build and test every change.`],
     ['CD',`Continuous Delivery/Deployment: automatically ship changes to environments.`],
     ['Pipeline',`The automated sequence of build, test, and deploy steps.`],
     ['Artifact',`A built output (jar, image) produced by the pipeline.`],
     ['Container',`A lightweight, isolated package of an app and its dependencies.`],
     ['Image',`The immutable template a container is started from.`],
     ['Kubernetes',`A system that schedules and runs containers across many machines.`],
     ['Pod',`The smallest deployable unit in Kubernetes: one or more containers.`],
     ['Helm',`A package manager for Kubernetes applications.`],
     ['IaC',`Infrastructure as Code: provisioning servers from version-controlled files.`],
   ]},
   {h:'Release & operate',terms:[
     ['Blue-green',`Two identical environments; switch traffic to the new one instantly.`],
     ['Canary',`Releasing to a small slice of users first to limit blast radius.`],
     ['Rollback',`Reverting to a previous known-good version.`],
     ['Observability',`Understanding a system from its logs, metrics, and traces.`],
   ]},
 ]},
 {domain:'Architecture & Distributed Systems',icon:'🏛️',groups:[
   {h:'Concepts',terms:[
     ['Latency',`How long one operation takes.`],
     ['Throughput',`How many operations complete per unit time.`],
     ['Scalability',`The ability to handle more load by adding resources.`],
     ['Horizontal scaling',`Adding more machines; vertical scaling adds power to one machine.`],
     ['Load balancer',`Distributes incoming requests across many servers.`],
     ['Cache',`A fast store of recent results to avoid recomputing or refetching.`],
     ['CAP theorem',`Under a partition, a distributed store trades consistency against availability.`],
     ['Eventual consistency',`Replicas converge to the same value given enough time.`],
   ]},
   {h:'Resilience',terms:[
     ['Retry with backoff',`Re-attempting a failed call after growing delays.`],
     ['Circuit breaker',`Stops calling a failing dependency to let it recover.`],
     ['Timeout',`A cap on how long to wait before giving up on a call.`],
     ['Idempotency key',`A client token that makes a retried write apply only once.`],
     ['Message queue',`A buffer that decouples producers from consumers.`],
     ['Sharding',`Splitting data across nodes by a partition key.`],
     ['Replication',`Keeping copies of data on multiple nodes for durability and reads.`],
     ['SLO',`A Service Level Objective: a target for reliability or latency.`],
   ]},
 ]},
];
/* Merge glossary terms into the keyword-popup table (KW) so click-to-explain works in lessons.
   Adds a key for any parenthetical acronym and for a single-word/acronym leading token.
   Never overrides an existing (Java) keyword. */
(function(){
  GLOSS.forEach(function(d){d.groups.forEach(function(g){g.terms.forEach(function(t){
    var term=t[0], def=t[1], keys=[];
    var m=term.match(/\(([A-Za-z]{2,14})\)/); if(m)keys.push(m[1]);
    var first=term.split(/[\s(]/)[0];
    if(/^[A-Za-z]{2,14}$/.test(first))keys.push(first);
    keys.forEach(function(k){k=k.toLowerCase(); if(!KW[k])KW[k]=[def,'#glossary'];});
  });});});
})();
function renderGlossary(){
  const m=document.getElementById('main');
  const termCount=d=>d.groups.reduce((a,g)=>a+g.terms.length,0);
  const total=GLOSS.reduce((a,d)=>a+termCount(d),0);
  const jump=GLOSS.map((d,i)=>`<a class="glossJump" href="javascript:void(0)" onclick="glossJumpTo(${i})">${d.icon} ${esc(d.domain)} <span class="glossJumpN">${termCount(d)}</span></a>`).join('');
  const body=GLOSS.map((d,i)=>`<details class="glossDom" id="gd${i}" open><summary class="glossSum">${d.icon} ${esc(d.domain)}<span class="glossDomN">${termCount(d)} terms</span></summary>${d.groups.map(g=>`<div class="glossGrp">${esc(g.h)}</div><dl class="glossList">${g.terms.map(t=>`<div class="glossItem"><dt>${esc(t[0])}</dt><dd>${esc(t[1])}</dd></div>`).join('')}</dl>`).join('')}</details>`).join('');
  m.innerHTML=`<div class="home glossary">
  <h1>📖 Glossary</h1>
  <p>${total} key terms across DevDojo, grouped by domain. In any lesson, <b>select or double-click a highlighted term</b> to see its definition inline — this page is the full reference. Use the filter to search, or the chips to jump to a domain.</p>
  <div class="glossToolbar">
    <input id="glossSearch" class="glossSearch" placeholder="Filter ${total} terms…" oninput="filterGloss(this.value)" aria-label="Filter glossary terms">
    <button class="glossBtn" onclick="glossToggleAll(true)">Expand all</button>
    <button class="glossBtn" onclick="glossToggleAll(false)">Collapse all</button>
  </div>
  <div class="glossJumps">${jump}</div>
  <div id="glossBody">${body}</div></div>`;
  m.scrollTop=0;
}
function glossJumpTo(i){
  const d=document.getElementById('gd'+i);
  if(d){d.open=true; d.scrollIntoView({behavior:'smooth',block:'start'});}
}
function glossToggleAll(open){
  document.querySelectorAll('#main .glossDom').forEach(d=>{d.open=open;});
}
function filterGloss(q){
  q=(q||'').trim().toLowerCase();
  document.querySelectorAll('#main .glossDom').forEach(dom=>{
    let domHits=0;
    dom.querySelectorAll('.glossList').forEach(list=>{
      let listHits=0;
      list.querySelectorAll('.glossItem').forEach(it=>{
        const hit=!q||it.textContent.toLowerCase().includes(q);
        it.style.display=hit?'':'none';
        if(hit)listHits++;
      });
      list.style.display=listHits?'':'none';
      const grp=list.previousElementSibling;
      if(grp&&grp.classList.contains('glossGrp'))grp.style.display=(listHits&&!q)?'':(listHits?'':'none');
      domHits+=listHits;
    });
    dom.style.display=domHits?'':'none';
    if(q)dom.open=true;
  });
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
<p>No Docker? Any Postgres, MySQL or even SQLite works — the syntax in these lessons is standard SQL.</p>`;
  } else if(lang==='shell'){
    steps=`<p>These are real commands. Try them in a throwaway directory so nothing important is at risk:</p>
<pre class="runbox">mkdir /tmp/play && cd /tmp/play && git init
# then run each command and watch exactly what changes</pre>`;
  } else if(lang==='text'){
    steps=`<p>This is a short-answer / mental-model check — there is no code to execute. Compare your reasoning against the solution, and follow the references below to go deeper.</p>`;
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
    steps=`<p>DevDojo verifies your code has the right shape and (in the app) asks Claude to run the tests. To confirm it genuinely works, run it on your own machine with a JDK (see Getting started):</p>
<pre class="runbox">// 1) save your solution as ${esc(cls)}.java
${hasMain?'':`// 2) add a tiny main to try it, e.g.:
//    public static void main(String[] a) { System.out.println(/* call a method here */); }
`}// ${hasMain?'2':'3'}) compile and run:
javac ${esc(cls)}.java && java ${esc(cls)}

// or explore interactively, no main needed:
jshell ${esc(cls)}.java</pre>
<p>To grade it the way DevDojo does, add <b>JUnit 5</b> and turn the "expected behavior" above into <code>assertEquals</code> checks.</p>
<p><b>Or compile &amp; run it right here</b> — if you started the site with a local JDK and <code>JD_LOCAL_RUNNER=1</code>:</p>
<button class="glossBtn" type="button" onclick="runJavaLocal()">▶ Compile &amp; run with local JDK</button>
<div id="javaRun" class="sqlResult"></div>`;
  }
  return `<details class="depth"><summary>🖥️ Run this on your own machine</summary><div class="depthBody">${steps}</div></details>`;
}
function diveDeeperHtml(s,l,e){
  const docs=(l.docs&&l.docs.length)?`<p><b>Read the source:</b> ${l.docs.map(d=>`<a href="${d[1]}" target="_blank" rel="noopener">${esc(d[0])} ↗</a>`).join(' · ')}</p>`:'';
  return `<details class="depth"><summary>🔬 Dive deeper</summary><div class="depthBody">
<p><b>How this is graded.</b> The check looks for the right constructs in your code, and in the app Claude runs the tests like a compiler. That verifies structure and logic, not every runtime edge — so for real confidence, run it locally (above) and try to break it.</p>
<p><b>Push further.</b> Change the inputs and predict the output before running. Add an edge case the prompt did not mention. Then say the idea aloud in one sentence — if you can teach it, you own it.</p>
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
    .catch(err=>{ out.innerHTML='<div class="sqlMeta">Local runner unavailable — start the site with <code>JD_LOCAL_RUNNER=1 node site/server.js</code> and a JDK installed, or use the commands above. <span style="color:var(--muted)">('+esc(String(err))+')</span></div>'; });
}

/* ---- live in-browser SQL runner (real execution on sample datasets) ---- */
function sqlFmt(v){ return (v===null||v===undefined)?'NULL':String(v); }
function sqlTableHtml(name,tbl){
  return `<div class="sqlTblName">${esc(name)} <span class="sqlTblN">${tbl.rows.length} rows</span></div>`
    +`<table class="sqlTbl"><thead><tr>${tbl.cols.map(c=>`<th>${esc(c)}</th>`).join('')}</tr></thead>`
    +`<tbody>${tbl.rows.map(r=>`<tr>${tbl.cols.map(c=>`<td>${esc(sqlFmt(r[c]))}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}
function sqlResultHtml(rows){
  if(!rows.length)return '<div class="sqlMeta">✔ ran successfully — 0 rows</div>';
  const cols=Object.keys(rows[0]);
  return `<table class="sqlTbl"><thead><tr>${cols.map(c=>`<th>${esc(c)}</th>`).join('')}</tr></thead>`
    +`<tbody>${rows.map(r=>`<tr>${cols.map(c=>`<td>${esc(sqlFmt(r[c]))}</td>`).join('')}</tr>`).join('')}</tbody></table>`
    +`<div class="sqlMeta">${rows.length} row(s)</div>`;
}
function sqlRunPanel(dsName){
  const db=window.SQL_DATASETS[dsName];
  return `<details class="depth sqlPanel" open><summary>🗄️ Sample data — run your query for real</summary><div class="depthBody">
  <p>Your SQL runs against this live sample database, entirely in your browser (a small built-in engine — no server, works offline):</p>
  <div class="sqlData">${Object.keys(db).map(t=>sqlTableHtml(t,db[t])).join('')}</div>
  <button class="primary" type="button" onclick="runSqlExercise('${dsName}')">▶ Run query on sample data</button>
  <div id="sqlResult" class="sqlResult"><div class="sqlMeta">Write a SELECT above and press Run to see real rows.</div></div>
  </div></details>`;
}
function runSqlExercise(dsName){
  const out=document.getElementById('sqlResult'); if(!out)return;
  const db=window.SQL_DATASETS[dsName]; if(!db){out.innerHTML='<div class="sqlErr">sample data unavailable</div>';return;}
  const src=((document.getElementById('ed')||{}).value||'').replace(/\/\*[\s\S]*?\*\//g,' ').replace(/--[^\n]*/g,' ');
  const stmts=src.split(';').map(s=>s.trim()).filter(Boolean).filter(s=>/^select/i.test(s));
  if(!stmts.length){out.innerHTML='<div class="sqlMeta">No SELECT found — write one (INSERT/UPDATE/DDL are not executed by the sample runner).</div>';return;}
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
  <h1>🚀 Getting started with DevDojo</h1>
  <p>DevDojo runs entirely in your browser and every lesson ends with a hands-on exercise. This page shows how your work is checked, what to install to get the <b>full depth</b>, and how to run any exercise in your own dev environment when you want real, compiler-verified feedback.</p>

  <div class="gsCard">
  <h2>How your work is checked (be honest with yourself)</h2>
  <p>When you hit <b>Compile &amp; Run Tests</b>, DevDojo does two things: it checks your code contains the right constructs, and — in the app — it asks Claude to execute the tests like a compiler plus JUnit and report pass/fail per test. That is great for fast feedback and learning, but it is <b>not a real compiler</b>. It can miss a runtime edge case, and a correct solution written in an unusual way can occasionally be marked wrong.</p>
  <p><b>The fix for real depth:</b> every exercise now has a <b>🖥️ Run this on your own machine</b> panel with the exact commands. SQL exercises execute against real sample data in your browser, and pure-JavaScript exercises run in a sandboxed Web Worker — both graded on real behavior. Java exercises can even <b>compile &amp; run in-app</b> if you start the site with a local JDK and <code>JD_LOCAL_RUNNER=1</code>.</p>
  </div>

  <div class="gsCard">
  <h2>Set up your environment</h2>
  <p>You do not need all of this on day one — install a tool when a track calls for it. Each line notes what it unlocks.</p>
  <ul>
    <li><b>JDK 21+</b> — the Java compiler and runtime. Unlocks running every Java exercise locally (<code>javac</code>, <code>java</code>, <code>jshell</code>). Get it from Adoptium (Temurin) or <code>sdkman</code>. <i>This is the one to install first.</i></li>
    <li><b>An IDE</b> — IntelliJ IDEA (Community) or VS Code with the Java extensions. Real autocomplete, debugging, and JUnit runs.</li>
    <li><b>Git</b> — to actually try the Git &amp; version-control lessons; make a throwaway repo and experiment.</li>
    <li><b>Node.js 22+</b> — needed only to run this site with accounts/progress (<code>node site/server.js</code>) and to rebuild the app (<code>node build.js</code>).</li>
    <li><b>Docker</b> — spins up a real Postgres for the SQL lessons, and is the backbone of the Docker / Kubernetes / Istio / Envoy courses.</li>
    <li><b>Maven or Gradle</b> — to build the Spring Boot, API and larger Java projects for real.</li>
  </ul>
  </div>

  <div class="gsCard">
  <h2>What DevDojo can do in-app vs. in your own dev environment</h2>
  <p><b>Great in the app:</b> learning the concepts, writing and checking Java/SQL/CLI exercises, the belt progression, the glossary, and click-to-explain terms.</p>
  <p><b>Best on your own machine (the app can teach but not fully run these):</b> compiling and executing Java with a real JVM; running a live database for SQL; standing up a Spring Boot service; the concurrency lessons where real timing and multiple cores matter; the networking/sockets and deployment lessons; and the standalone <b>Docker, Kubernetes, Istio and Envoy</b> courses, which are separate hands-on labs in this repository. The Run-locally panel on each exercise bridges the gap.</p>
  </div>

  <div class="gsCard">
  <h2>Where to go next</h2>
  <p>New here? Follow the <a href="javascript:void(0)" onclick="cur=null;renderPath();renderNav()"><b>🗺️ Learning path</b></a> for a recommended order from white to black belt. Confused by a term? The <a href="javascript:void(0)" onclick="cur=null;renderGlossary();renderNav()"><b>📖 Glossary</b></a> defines everything, and you can select any highlighted term inside a lesson to see its definition inline.</p>
  </div>
  </div>`;
  m.scrollTop=0;
}

/* ============================== LEARNING PATH ============================== */
function renderPath(){
  const m=document.getElementById('main');
  const step=(n,belt,title,body)=>`<div class="pathStep"><div class="pathNum">${n}</div><div class="pathBody"><div class="pathBelt">${belt}</div><h3>${esc(title)}</h3><p>${body}</p></div></div>`;
  m.innerHTML=`<div class="home">
  <h1>🗺️ Learning path</h1>
  <p>DevDojo is large on purpose, but you do not have to wander. This is a recommended route from beginner to senior. Finish the belt lessons in a domain to earn its belt; the dan sub-tracks and the Projects/Tournaments are where you cement it. Jump around once you know the basics — this is a suggestion, not a cage.</p>
  <div class="pathWrap">
  ${step(1,'⬜ White','Start here','Read <b>🚀 Getting started</b>, install a JDK, and skim the <b>Glossary</b>. Then begin <b>Java Fundamentals</b> — variables, control flow, objects, collections.')}
  ${step(2,'🟡 Yellow','Core Java','Finish <b>Java Fundamentals</b> (including <i>Inside the JVM</i>), <b>Exception Handling</b>, and <b>Generics from the Ground Up</b>. This is the language spine everything else assumes.')}
  ${step(3,'🟠 Orange','Computer science','Do <b>Data Structures &amp; Algorithms</b> — collections, Big-O, trees, and BFS/DFS/Dijkstra traversal. Interview-critical and used everywhere.')}
  ${step(4,'🟢 Green','How programs talk','Take <b>Web &amp; HTTP</b>, <b>APIs &amp; REST</b>, and <b>Working with Databases</b> (SQL joins, the command map, complex queries). Now you can build real services.')}
  ${step(5,'🔵 Blue','Frameworks &amp; concurrency','Add <b>Spring Boot</b>, <b>Concurrency &amp; Multithreading</b> (start with <i>threads vs processes</i>), and <b>Modern Java</b>. Run these locally — concurrency especially rewards a real JVM.')}
  ${step(6,'🟣 Purple','Security &amp; identity','Work through <b>Identity and Access</b> end to end: foundations &amp; federation, authn/MFA, authorization models, sessions, OAuth/OIDC, tokens, SAML, PKI, and the advanced/governance sub-tracks.')}
  ${step(7,'🟤 Brown','Ship it','Learn <b>Build Tools</b>, <b>Git</b>, <b>Deploying to the Web</b>, and <b>CI/CD</b>. Pair these with the standalone Docker &amp; Kubernetes courses in your own environment.')}
  ${step(8,'⚫ Black','Senior craft','Enter the <b>Senior (Dan)</b> tracks — System Design, Failure-First Distributed Systems, Working with Real Code — then prove it in <b>Real-World Projects</b> and the <b>Tournament</b>.')}
  </div>
  <p style="margin-top:16px">Ready? <a href="javascript:void(0)" onclick="cur=null;renderHome();renderNav()"><b>Back to all tracks →</b></a></p>
  </div>`;
  m.scrollTop=0;
}

/* ============================== SPACED REPETITION (Review) ============================== */
const SRS_DAY=86400000, SRS_STEPS=[1,3,7,16,35,90,180];
function srsDue(rec){ return rec.srsDue || (rec.completedAt ? rec.completedAt + SRS_DAY : Infinity); }
function srsDeck(){
  const out=[];
  STREAMS.forEach((s,si)=>{(s.lessons||[]).forEach((l,li)=>{
    const exs=l.exs||(l.ex?[l.ex]:[]);
    exs.forEach((e,ei)=>{
      const sid=exs.length>1?l.id+'#'+ei:l.id;
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
    <div class="revMeta">${d.icon} ${esc(d.lessonTitle)}${d.reps?` · reviewed ${d.reps}×`:''}</div>
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
    body=`<div class="reviewEmpty">No completed exercises yet. Finish a few lessons and they'll appear here for review — spaced out so they stick.</div>`;
  } else if(!due.length){
    const nx=upcoming[0];
    body=`<div class="reviewEmpty">✅ Nothing due right now. Your review deck has <b>${deck.length}</b> card${deck.length>1?'s':''}; next one is due in <b>${nx?srsFmtIn(nx.due-now):'—'}</b>.</div>`;
  } else {
    body=`<p><b>${due.length}</b> card${due.length>1?'s':''} due. Try to recall the solution first; open the lesson if you need to. Then rate yourself — <b>Good</b> schedules it further out, <b>Again</b> brings it back soon.</p>`
      + due.map(reviewCard).join('')
      + (upcoming.length?`<div class="reviewEmpty" style="margin-top:14px">+ ${upcoming.length} more scheduled later (next in ${srsFmtIn(upcoming[0].due-now)}).</div>`:'');
  }
  m.innerHTML=`<div class="home"><h1>🔁 Review</h1>
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
  const exs=l.exs||(l.ex?[l.ex]:[]);
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
    const exs=l.exs||(l.ex?[l.ex]:[]);
    exs.forEach((e,ei)=>{
      const sid=exs.length>1?l.id+'#'+ei:l.id;
      items.push({si,li,ei,d:exDiff(e,s,l),title:e.title||l.title,lesson:l.title,icon:s.icon,done:!!store.lesson(sid).done});
    });
  });});
  const counts={easy:0,medium:0,hard:0};items.forEach(i=>counts[i.d]++);
  const shown=filter==='all'?items:items.filter(i=>i.d===filter);
  const tab=(k,label,n)=>`<button class="pracTab ${filter===k?'active':''}" onclick="renderPractice('${k}')">${label} <span class="pcount">${n}</span></button>`;
  m.innerHTML=`<div class="home"><h1>🎯 Practice by difficulty</h1>
  <p style="color:var(--muted)">Every exercise across DevDojo, rated by difficulty. Filter to build a ramp — grind 🟢 Easy to warm up, or jump to 🔴 Hard for interview-grade problems. Ratings are auto-derived from each solution.</p>
  <div class="pracTabs">${tab('all','All',items.length)}${tab('easy','🟢 Easy',counts.easy)}${tab('medium','🟡 Medium',counts.medium)}${tab('hard','🔴 Hard',counts.hard)}</div>
  <div class="pracList">${shown.map(i=>`<div class="pracRow" onclick="openLesson(${i.si},${i.li},${i.ei})"><span class="diffDot d-${i.d}" title="${i.d}"></span><span class="pracDone">${i.done?'✅':'○'}</span><span class="pracIcon">${i.icon}</span><span class="pracTitle">${esc(i.title)}</span><span class="pracLesson">${esc(i.lesson)}</span></div>`).join('')}</div>
  </div>`;
  m.scrollTop=0;
}

/* ============================== QUIZ ENGINE (Quick check) ============================== */
/* Randomise option order so the correct answer is never predictable by position.
   Hand-authored quizzes were written with the right answer first (answer:0), which
   made them solvable without reading the question. Permutes options and whyWrong in
   lockstep and remaps answer, so quizPick() stays correct with no other changes.
   Re-shuffles on every lesson visit, so position can never be memorised.
   Returns new question objects — the source data in l.quiz is never mutated. */
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
  return `<div class="quizBox"><h3>🧠 Quick check</h3>`+qs.map((q,qi)=>
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
      +'<span class="quizWrongPick">You picked “'+esc(picked)+'” — '+esc(ww)+'</span>';
  }
}
