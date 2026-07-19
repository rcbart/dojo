
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
function totalLessons(){return STREAMS.reduce((a,s)=>a+((s.tournament||s.project)?0:s.lessons.length),0)}
function doneCount(){const d=store.get();let n=0;STREAMS.forEach(s=>{if(s.tournament||s.project)return;s.lessons.forEach(l=>{if(d[l.id]&&d[l.id].done)n++})});return n}
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
function showBeltUp(before,after,pct){
  const old=document.getElementById('beltUpOverlay');if(old)old.remove();
  const note=store.persistent?'':'<div class="bNote">⚠ browser storage blocked — progress lasts for this session only</div>';
  const ov=document.createElement('div');
  ov.id='beltUpOverlay';ov.className='beltOverlay';
  ov.innerHTML='<div class="beltModal" role="dialog" aria-modal="true" aria-label="Belt promotion">'
    +'<div class="bBurst">'+['🎉','🥋','✨','🎊','⭐'].map((e,i)=>'<span class="bSpark s'+i+'">'+e+'</span>').join('')+'</div>'
    +'<h2>Belt up!</h2>'
    +'<p class="bSub">Your training has paid off — you have been promoted.</p>'
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
function completeLesson(l){
  if(store.lesson(l.id).done)return;           // already counted
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
    const hd=document.createElement('div');hd.className='streamHd';
    hd.innerHTML=`${s.icon} ${s.title}<span class="pct">${streamDone(s)}/${s.lessons.length}</span>`;
    const box=document.createElement('div');box.className='lessons'+((cur&&cur.si===si)?' open':'');
    hd.onclick=()=>box.classList.toggle('open');
    s.lessons.forEach((l,li)=>{
      const a=document.createElement('div');
      const done=store.lesson(l.id).done;
      a.className='lessonLink'+((cur&&cur.si===si&&cur.li===li)?' active':'');
      a.innerHTML=`<span class="tick">${done?'✅':'○'}</span>${li+1}. ${l.title}`;
      a.onclick=()=>openLesson(si,li);
      box.appendChild(a);
    });
    nav.appendChild(hd);nav.appendChild(box);
  });
}
function renderHome(){
  const m=document.getElementById('main');
  m.innerHTML=`<div class="home">
  <h1>Welcome to the Dojo 🥋</h1>
  <p>${STREAMS.length} training streams take you from Java fundamentals to mastery: modern language features, build tools, web &amp; MVC, REST APIs, Spring Boot, and Git. Every lesson ends with an exercise you write in the built-in editor (line numbers included). <b>Run Tests</b> checks your code and sends it to Claude, who executes the tests mentally like a compiler + JUnit runner and reports pass/fail per test with line-referenced feedback. Stuck? <b>Next Step</b> gives a progressive hint, and <b>Show me the solution</b> is always there — no judgment.</p>
  <p><b>Tip:</b> select/double-click any Java keyword anywhere (lesson text or your own code) and a popup explains it, with a link to the official docs.</p>
  <p style="font-size:12px;color:var(--muted)">System status: AI test runner ${(window.cowork&&window.cowork.askClaude)?'✅ connected':'⚠️ unavailable — completion falls back to structural checks'} · progress storage ${store.persistent?'✅ persistent':'⚠️ session-only (browser storage is blocked here; progress lasts until this view closes)'}</p>
  <div class="grid">${STREAMS.map((s,si)=>{
    const d=streamDone(s),t=s.lessons.length;
    return `<div class="card${s.tournament?' tour':(s.project?' proj':'')}" onclick="openLesson(${si},0)">${s.icon}${s.tournament?'<span class="tourBadge">🏆 TOURNAMENT</span>':(s.project?'<span class="projBadge">🏗️ PROJECT</span>':'')}<h3>${s.title}</h3><div class="meta">${s.blurb}</div><div class="meta" style="margin-top:6px">${d}/${t} ${s.tournament?'challenges · no belt credit':(s.project?'projects · no belt credit':'lessons')}</div><div class="bar"><i style="width:${t?Math.round(100*d/t):0}%${s.tournament?';background:#d97706':(s.project?';background:#0e9f6e':'')}"></i></div></div>`;
  }).join('')}</div></div>`;
}
/* ============================== LESSON ============================== */
function exSid(l,exs,i){return exs.length>1?l.id+'#'+i:l.id;}
function lessonExs(l){return l.exs||(l.ex?[l.ex]:[]);}
function openLesson(si,li,ei){
  const s=STREAMS[si],l=s.lessons[li];
  const exs=lessonExs(l);
  if(ei==null){ei=exs.findIndex((x,i)=>!store.lesson(exSid(l,exs,i)).done);if(ei<0)ei=0;}
  cur={si,li,ei};
  const e=exs[ei];
  const sid=e?exSid(l,exs,ei):null;
  const saved=sid?store.lesson(sid):{};
  const m=document.getElementById('main');
  m.innerHTML=`<div class="crumb">${s.icon} ${s.title} · Lesson ${li+1} of ${s.lessons.length}</div>
  <h1 class="lessonTitle">${l.title}</h1>
  <div class="lessonBody">${l.body}</div>
  ${l.docs&&l.docs.length?`<div class="docs"><b>📚 References:</b><br>${l.docs.map(d=>`<a href="${d[1]}" target="_blank" rel="noopener">${d[0]} ↗</a>`).join('')}</div>`:''}
  ${e?`<div class="exercise">
    ${exs.length>1?(s.tournament?`<div class="chalBar"><button class="chalRandom" onclick="pickRandom(${si},${li})">🎲 Random challenge</button><span class="chalCount">${exs.filter((x,i)=>store.lesson(exSid(l,exs,i)).done).length}/${exs.length} solved</span><div class="chalChips">${exs.map((x,i)=>`<div class="chalChip ${i===ei?'active':''} ${store.lesson(exSid(l,exs,i)).done?'done':''}" onclick="openLesson(${si},${li},${i})" title="${esc(x.title)}">${store.lesson(exSid(l,exs,i)).done?'✓':(i+1)}</div>`).join('')}</div></div>`:`<div class="exTabs">${exs.map((x,i)=>`<div class="exTab ${i===ei?'active':''} ${store.lesson(exSid(l,exs,i)).done?'done':''}" id="extab-${i}" onclick="openLesson(${si},${li},${i})">${store.lesson(exSid(l,exs,i)).done?'✅ ':''}Exercise ${i+1}</div>`).join('')}</div>`):''}
    <div class="exHd"><span class="badge">EXERCISE${exs.length>1?' '+(ei+1)+' OF '+exs.length:''}</span> ${e.title}${saved.done?' <span class="badge" style="background:#16a34a">✓ COMPLETED</span>':''}</div>
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
  </div>`:''}
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
  tip.innerHTML=`<b>${esc(word)}</b> — ${k[0]} <a href="${k[1]}" target="_blank" rel="noopener">Docs ↗</a>`;
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
