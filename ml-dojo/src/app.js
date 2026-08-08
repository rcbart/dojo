/* ============================== MLDojo engine (POC) ============================== */
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
function hesc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

/* ------------------------- Python syntax highlighting ------------------------- */
const PY_KW=new Set(('def return if elif else for while in not and or import from as class try except '+
  'finally with lambda pass break continue True False None is global nonlocal yield assert raise del').split(' '));
const PY_BI=new Set(('print len range sum min max abs sorted enumerate zip map filter list dict set tuple '+
  'str int float bool type isinstance open input round any all').split(' '));
function highlight(src){
  let out='',last=0,m;
  const re=/("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|#[^\n]*|\b\d+(?:\.\d+)?\b|\b[A-Za-z_]\w*\b)/g;
  while((m=re.exec(src))){
    out+=hesc(src.slice(last,m.index));
    const tok=m[0];let cls=null;
    if(tok[0]==='#')cls='c';
    else if(/^("""|'''|"|')/.test(tok))cls='s';
    else if(/^\d/.test(tok))cls='n';
    else if(PY_KW.has(tok))cls='k';
    else if(PY_BI.has(tok))cls='b';
    out+=cls?'<span class="'+cls+'">'+hesc(tok)+'</span>':hesc(tok);
    last=m.index+tok.length;
  }
  return out+hesc(src.slice(last));
}
function caretPos(ed){
  const upto=ed.value.slice(0,ed.selectionStart).split('\n');
  return {line:upto.length,col:upto[upto.length-1].length+1};
}
/* Full editor: gutter + highlight overlay + auto-indent + pairing. Returns the textarea. */
function editorHTML(){
  return `<div class="editorWrap">
    <div class="scroller"><div class="gutter" id="gutter"><div class="gLine cur">1</div></div>
      <div class="edStack"><pre id="hl" aria-hidden="true"></pre><textarea id="ed" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="Python editor"></textarea></div></div>
    <div class="statusBar"><span id="lnCol">Ln 1, Col 1</span><span>auto-indent · Tab / ⇧Tab · pairs () [] {} "" · ⌘/Ctrl+Enter = Run</span></div>
  </div>`;
}
function wireEditor(initial,onChange,onRun){
  const ed=document.getElementById('ed'),hl=document.getElementById('hl'),g=document.getElementById('gutter');
  const OPEN={'(':')','[':']','{':'}'};const CLOSERS=[')',']','}'];
  ed.value=initial;
  const paint=()=>{
    hl.innerHTML=highlight(ed.value)+'\n';
    const n=ed.value.split('\n').length,cur=caretPos(ed);
    let gh='';for(let i=1;i<=n;i++)gh+='<div class="gLine'+(i===cur.line?' cur':'')+'">'+i+'</div>';
    g.innerHTML=gh;
    const lc=document.getElementById('lnCol');if(lc)lc.textContent='Ln '+cur.line+', Col '+cur.col;
  };
  const sync=()=>{paint();if(onChange)onChange(ed.value);};
  const put=(val,caret)=>{ed.value=val;ed.selectionStart=ed.selectionEnd=caret;sync();};
  ed.addEventListener('input',sync);
  ed.addEventListener('keyup',paint);
  ed.addEventListener('click',paint);
  ed.addEventListener('keydown',e=>{
    const s=ed.selectionStart,epos=ed.selectionEnd,v=ed.value;
    if((e.metaKey||e.ctrlKey)&&e.key==='Enter'){e.preventDefault();if(onRun)onRun();return;}
    if(e.key==='Tab'){
      e.preventDefault();
      const ls=v.lastIndexOf('\n',s-1)+1;
      if(s!==epos&&v.slice(s,epos).includes('\n')){
        const le=v.indexOf('\n',epos);const end=le===-1?v.length:le;
        const block=v.slice(ls,end);
        const outb=e.shiftKey?block.replace(/^ {1,4}/gm,''):block.replace(/^/gm,'    ');
        ed.value=v.slice(0,ls)+outb+v.slice(end);
        ed.selectionStart=ls;ed.selectionEnd=ls+outb.length;sync();
      }else if(e.shiftKey){
        const mm=v.slice(ls).match(/^ {1,4}/);
        if(mm)put(v.slice(0,ls)+v.slice(ls+mm[0].length),Math.max(ls,s-mm[0].length));
      }else put(v.slice(0,s)+'    '+v.slice(epos),s+4);
      return;
    }
    if(e.key==='Enter'){
      e.preventDefault();
      const ls=v.lastIndexOf('\n',s-1)+1;
      const indent=(v.slice(ls).match(/^ */)||[''])[0];
      const prev=v.slice(0,s).trimEnd().slice(-1);
      const ins='\n'+indent+(prev===':'?'    ':'');
      put(v.slice(0,s)+ins+v.slice(epos),s+ins.length);
      return;
    }
    if(s===epos){
      if((e.key==='"'&&v[s]==='"')||(CLOSERS.includes(e.key)&&v[s]===e.key)){e.preventDefault();ed.selectionStart=ed.selectionEnd=s+1;paint();return;}
      if(e.key==='"'){e.preventDefault();put(v.slice(0,s)+'""'+v.slice(epos),s+1);return;}
      if(OPEN[e.key]){e.preventDefault();put(v.slice(0,s)+e.key+OPEN[e.key]+v.slice(epos),s+1);return;}
      if(e.key==='Backspace'&&s>0){
        const pair=OPEN[v[s-1]]||(v[s-1]==='"'?'"':null);
        if(pair&&v[s]===pair){e.preventDefault();put(v.slice(0,s-1)+v.slice(s+1),s-1);return;}
      }
    }
  });
  paint();
  return ed;
}

/* ------------------------------ storage ------------------------------ */
const store={
  mem:{},
  persistent:(()=>{try{localStorage.setItem('__ml_t','1');localStorage.removeItem('__ml_t');return true}catch(e){return false}})(),
  get(){if(!this.persistent)return this.mem;try{return JSON.parse(localStorage.getItem('mldojo')||'{}')}catch(e){return this.mem}},
  set(d){this.mem=d;if(this.persistent){try{localStorage.setItem('mldojo',JSON.stringify(d))}catch(e){this.persistent=false}}},
  lesson(id){return this.get()[id]||{};},
  patch(id,p){const d=this.get();d[id]=Object.assign({},d[id],p);this.set(d);}
};

/* ------------------------------ belts ------------------------------ */
const BELTS=[[0,'White belt'],[10,'Yellow belt'],[25,'Orange belt'],[40,'Green belt'],[55,'Blue belt'],[70,'Purple belt'],[85,'Brown belt'],[100,'Black belt 🖤']];
function totalLessons(){return STREAMS.reduce((a,s)=>a+s.lessons.length,0);}
function doneCount(){const d=store.get();let n=0;STREAMS.forEach(s=>s.lessons.forEach(l=>{if(d[l.id]&&d[l.id].done)n++;}));return n;}
function beltName(){const pct=totalLessons()?100*doneCount()/totalLessons():0;let name=BELTS[0][1];for(const[t,n]of BELTS)if(pct>=t)name=n;return name;}
function refreshBelt(){
  const pct=totalLessons()?Math.round(100*doneCount()/totalLessons()):0;
  document.getElementById('beltName').textContent=beltName();
  document.getElementById('beltFill').style.width=pct+'%';
  document.getElementById('beltPct').textContent=pct+'%';
}
function toast(msg){
  const t=document.createElement('div');t.textContent=msg;
  t.style.cssText='position:fixed;left:50%;top:18px;transform:translateX(-50%);background:#0f2a2e;color:#fff;padding:10px 16px;border-radius:10px;z-index:60;font-size:13px;box-shadow:0 8px 24px rgba(0,0,0,.2)';
  document.body.appendChild(t);setTimeout(()=>t.remove(),2600);
}

/* ------------------------------ Pyodide runner ------------------------------ */
let _py=null,_pyInit=null;const _loadedPkgs=new Set();
function getPy(status){
  if(_pyInit)return _pyInit;
  _pyInit=(async()=>{
    if(status)status('Loading Python (first run downloads ~10MB)…');
    _py=await loadPyodide();
    return _py;
  })();
  return _pyInit;
}
async function ensurePackages(packages,status){
  const py=await getPy(status);
  const need=(packages||[]).filter(p=>!_loadedPkgs.has(p));
  if(need.length){if(status)status('Loading '+need.join(', ')+'…');await py.loadPackage(need);need.forEach(p=>_loadedPkgs.add(p));}
  return py;
}
const PY_HARNESS=`
import json, io, sys, os, traceback
os.environ.setdefault("MPLBACKEND", "Agg")
def _grade(code, tests):
    ns={}
    buf=io.StringIO(); old=sys.stdout; sys.stdout=buf
    res={"ok":True,"stdout":"","error":None,"results":[],"figure":None}
    try:
        exec(code, ns)
    except Exception as e:
        res["ok"]=False
        res["error"]="".join(traceback.format_exception_only(type(e),e)).strip()
    finally:
        sys.stdout=old
    res["stdout"]=buf.getvalue()
    ns["_stdout"]=res["stdout"]
    if res["ok"]:
        for t in tests:
            try:
                ok=bool(eval(t["expr"], ns))
                res["results"].append({"d":t["d"],"pass":ok})
            except Exception as e:
                res["results"].append({"d":t["d"],"pass":False,"err":"".join(traceback.format_exception_only(type(e),e)).strip()})
    # capture any matplotlib figure the student drew (after tests, so tests can inspect it)
    try:
        if "matplotlib" in sys.modules:
            import matplotlib.pyplot as _plt, base64 as _b64
            if _plt.get_fignums():
                _fb=io.BytesIO()
                _plt.gcf().savefig(_fb, format="png", dpi=80, bbox_inches="tight")
                _plt.close("all")
                res["figure"]=_b64.b64encode(_fb.getvalue()).decode()
    except Exception:
        pass
    return res
json.dumps(_grade(_CODE, json.loads(_TESTS_JSON)))
`;
async function runPython(code,tests,packages,status){
  const py=await ensurePackages(packages,status);
  try{await py.loadPackagesFromImports(code);}catch(e){/* unknown imports fail at exec with a clear Python error */}
  py.globals.set('_CODE',code);
  py.globals.set('_TESTS_JSON',JSON.stringify(tests||[]));
  const out=await py.runPythonAsync(PY_HARNESS);
  return JSON.parse(out);
}

/* ------------------------------ nav / home ------------------------------ */
let cur={si:-1,li:-1};
function renderHome(){
  cur={si:-1,li:-1};
  const total=totalLessons(),done=doneCount();
  document.getElementById('main').innerHTML=`
  <h1 class="lessonTitle" style="font-size:30px">Welcome to <span style="color:var(--accent)">MLDojo</span> 🧠</h1>
  <div class="lessonBody">
  <p style="font-size:16px"><b>This course takes you from absolute zero to genuinely understanding
  machine learning and AI</b> — the way a university would teach it, but hands-on, self-paced,
  and with every concept grounded in what it is actually <i>for</i>.</p>

  <div class="ground"><span class="gTag">⏳ An honest promise</span>
  <p><b>This will take time to master — and that is the point.</b> MLDojo is not a "become an
  ML expert in 30 days" shortcut. It offers the opposite: <b>depth and rigor that rivals
  college studies</b>. We are confident that, although it does not grant a degree, if you
  complete this course you will be able to understand and work in machine learning and AI at
  the level of someone who studied it in college — because you will have covered the same
  foundations, done the math, and written the code yourself.</p></div>

  <div class="hardidea">🧮 <b>Fair warning: this course is math-heavy — it has to be.</b>
  Machine learning <i>is</i> mathematics — linear algebra, calculus, logarithms, and
  probability are not prerequisites you rush past, they are the subject itself. So we teach
  them properly, from zero, with the same grounding-first care as everything else: every
  formula arrives only after the plain-English reason it exists. You do not need to love math
  today. You need to be willing to do it — and by the end, the equations that once looked like
  hieroglyphs will read like sentences.</div>

  <h3>What this course aims to provide</h3>
  <p>A complete path: <b>Python programming</b>, <b>linear algebra</b>, <b>calculus</b>, and
  <b>probability &amp; statistics</b> from first principles (the Foundations Track), then
  classic machine learning, deep learning, and LLMs — each tier standing on the one before it.
  Nothing is assumed; nothing important is skipped.</p>

  <h3>How it does it</h3>
  <p><b>Grounding before math.</b> Every concept starts with a real-world example — what it
  does and what it is used for — before any formula. No more "what the hell is an eigenvector
  for?"</p>
  <p><b>You write real code, immediately.</b> Real Python runs in your browser on every
  lesson, graded on real output. You do not watch ML — you do it.</p>
  <p><b>Fancy names get demystified.</b> A "Support Vector Machine" is a line that separates
  two groups. "Regression" is a historical accident that means "predict a number." Every term
  is explained in plain English before it is used — and the plain version is always
  <i>correct</i>, followed by the precise, exam-surviving definition.</p>
  <p><b>Depth on demand.</b> Every lesson checks your understanding with quizzes and
  exercises, offers progressive hints and full solutions, a tutor you can ask anything, and
  a Dive Deeper path down to graduate-level treatment when you want it.</p>

  <h3>Where this leads — said honestly</h3>
  <p>Completing MLDojo means you can understand, build, and deploy real ML systems, and hold
  your own with people who studied this in college. It is <b>preparation, not a credential</b>:
  it will make you thrive in a job interview, an ML team, or a degree program — but it is not
  itself a degree, and where a door needs one (some résumé filters, formal admissions
  prerequisites), we will always tell you plainly instead of overselling.</p>

  <p style="margin-top:20px">
  <button class="primary" style="font-size:15px;padding:12px 22px" onclick="openLesson(0,0)">
  ${done>0?'▶ Continue training — '+done+'/'+total+' lessons done':'▶ Begin: Python from Zero'}</button></p>
  </div>`;
  renderNav();
}
function renderNav(){
  const nav=document.getElementById('nav');
  let lastTrack=null;
  nav.innerHTML=`<div class="lessonLink${cur.si===-1?' active':''}" onclick="renderHome()" style="font-weight:700">🏠 Welcome &amp; mission</div>
  <div class="lessonLink${cur.si===-2?' active':''}" onclick="renderPlayground()" style="font-weight:700">🐍 Python Playground</div>
  <div class="lessonLink${cur.si===-3?' active':''}" onclick="renderSetupGuide()" style="font-weight:700">🛠 Python on your machine</div>`+STREAMS.map((s,si)=>{
    let divider='';
    if(s.track&&s.track!==lastTrack){divider=`<div class="trackDivider">${esc(s.track)}</div>`;lastTrack=s.track;}
    const links=s.lessons.map((l,li)=>{
      const done=store.lesson(l.id).done;
      const active=(si===cur.si&&li===cur.li);
      return `<div class="lessonLink${active?' active':''}" onclick="openLesson(${si},${li})">${done?'✅':'○'} ${esc(l.title)}</div>`;
    }).join('');
    return `${divider}<div class="streamHd">${s.icon} ${esc(s.title)}</div>${links}`;
  }).join('');
}

/* ------------------------------ lesson view ------------------------------ */
function openLesson(si,li){
  cur={si,li};
  window.__quiz={};                 // reset per-lesson quiz correctness
  const s=STREAMS[si],l=s.lessons[li];
  const m=document.getElementById('main');
  const done=store.lesson(l.id).done;
  const prev=siblingLesson(si,li,-1),next=siblingLesson(si,li,1);
  const nextTitle=next?STREAMS[next.si].lessons[next.li].title:'';
  const prereqUnmet=s.requires&&!store.lesson(s.requires).done;
  const prereqBanner=prereqUnmet?`<div class="hardidea" style="border-color:#e2a03f;background:#fff4e0">🔒 <b>Prerequisite:</b> this stream assumes you've completed <b>${esc(s.requiresName||'the earlier stream')}</b> first — it teaches the Python and the primitives (like what a <i>dimension</i> is) that this lesson builds on. You can look around, but you'll get the most out of it after finishing the prerequisite.</div>`:'';
  m.innerHTML=`
    <div class="crumb">${s.icon} ${esc(s.title)} · Lesson ${li+1} of ${s.lessons.length}</div>
    ${prereqBanner}
    <h1 class="lessonTitle">${esc(l.title)}${done?' <span class="badge done">✓ COMPLETED</span>':''}</h1>
    <div class="lessonBody">${l.body}</div>
    ${l.deepDive?`<div style="margin:14px 0"><button id="btnDeep">📖 Dive deeper into the math</button>
      <button id="btnDeepAsk">📖 Ask the tutor to go deeper (Bishop-level)</button></div>
      <div class="hardidea" id="deepBox" hidden>${l.deepDive}</div>`:''}
    ${l.docs&&l.docs.length?`<div class="docs"><b>📚 References:</b><br>${l.docs.map(d=>`<a href="${d[1]}" target="_blank" rel="noopener">${esc(d[0])} ↗</a>`).join('<br>')}</div>`:''}
    ${l.quiz?renderQuiz(l.quiz):''}
    ${lessonExs(l).length?renderExercise(l):''}
    ${l.homework?renderHomework(l.homework):''}
    <div class="fbBar">Was this lesson clear?
      <button onclick="sendFeedback('${l.id}','clear','👍 Clear')">👍 Clear</button>
      <button onclick="sendFeedback('${l.id}','fast','😵 Too fast')">😵 Too fast</button>
      <button onclick="sendFeedback('${l.id}','error','🐞 Found an error')">🐞 Found an error</button>
      <span id="fbNote"></span>
    </div>
    <div class="lessonNav">
      ${prev?`<button onclick="openLesson(${prev.si},${prev.li})">← Previous</button>`:`<span></span>`}
      ${next?`<button class="primary" onclick="openLesson(${next.si},${next.li})">Next: ${esc(nextTitle)} →</button>`:`<span class="navDone">🎉 You have reached the end of the current content</span>`}
    </div>`;
  m.scrollTop=0;
  if(l.deepDive){
    document.getElementById('btnDeep').onclick=()=>{const b=document.getElementById('deepBox');b.hidden=!b.hidden;};
    document.getElementById('btnDeepAsk').onclick=()=>diveDeeperAsk(l);
  }
  if(lessonExs(l).length)initExercise(l);
  renderNav();
}
function lessonExs(l){return l.exs||(l.ex?[l.ex]:[]);}
function flatLessons(){const a=[];STREAMS.forEach((s,si)=>s.lessons.forEach((l,li)=>a.push({si,li})));return a;}
function siblingLesson(si,li,dir){const f=flatLessons();const i=f.findIndex(p=>p.si===si&&p.li===li);return f[i+dir]||null;}

/* ------------------------------ quiz ------------------------------ */
function renderQuiz(q){
  return `<div class="quiz"><div class="quizHd">📝 ${esc(q.title||'Quick check')}</div>
    ${q.questions.map((qq,qi)=>`<div class="qBlock" id="q-${qi}">
      <div class="qq">${qi+1}. ${esc(qq.q)}</div>
      ${qq.options.map((o,oi)=>`<label class="qOpt" onclick="pickQuiz(${qi},${oi})">${esc(o)}</label>`).join('')}
      <div class="qWhy" id="qwhy-${qi}"></div>
    </div>`).join('')}</div>`;
}
window.__quiz={};
function pickQuiz(qi,oi){
  const l=STREAMS[cur.si].lessons[cur.li];const qq=l.quiz.questions[qi];
  const block=document.getElementById('q-'+qi);
  const opts=block.querySelectorAll('.qOpt');
  opts.forEach((o,i)=>{o.classList.remove('sel','correct','wrong');if(i===qq.answer)o.classList.add('correct');if(i===oi&&oi!==qq.answer)o.classList.add('wrong');});
  const why=document.getElementById('qwhy-'+qi);
  why.textContent=(oi===qq.answer?'✓ Correct. ':'✗ Not quite. ')+qq.why;
  why.classList.add('show');
  window.__quiz[qi]=(oi===qq.answer);
  // A lesson with a quiz but NO code exercise completes when every question is answered correctly.
  if(lessonExs(l).length===0){
    const total=l.quiz.questions.length;
    const rightCount=l.quiz.questions.filter((_,i)=>window.__quiz[i]===true).length;
    if(rightCount===total)markComplete(l);
  }
}

/* ------------------------------ homework ------------------------------ */
function renderHomework(hw){
  return `<div class="homework">
    <div class="hwHd">📝 Homework — reinforce it on your own</div>
    <p class="hwIntro">${hw.intro||'Work these on paper or in your own Python — then reveal the full step-by-step solution to check yourself. Not graded; pure practice.'}</p>
    <ol class="hwList">${hw.problems.map(p=>`<li>
      <div class="hwQ">${p.q}</div>
      <details class="hwSol"><summary>Show step-by-step solution</summary><div class="hwBody">${p.solution}</div></details>
    </li>`).join('')}</ol>
    <div class="hwTry">💻 <b>Try it in Python</b> — open the <button class="linklike" onclick="renderPlayground()">Python Playground</button> and experiment with these ideas in real code to get comfortable. ${hw.tryIt||'Type them in, tweak the numbers, and see what changes.'}</div>
  </div>`;
}

/* ------------------------------ exercise + editor ------------------------------ */
let hintIdx=0;
// Detect Python patterns beyond the absolute basics, so the exercise can be MARKED
// as using intermediate Python (each is taught in the Python stream before it appears here).
function pyFeatures(code){
  code=String(code||'');const f=[];
  if(/\[[^\]\n]*\bfor\b[^\]\n]*\bin\b/.test(code)||/\b(sum|min|max|any|all|sorted|list|dict|set)\s*\([^)]*\bfor\b[^)]*\bin\b/.test(code))f.push('comprehensions');
  if(/\blambda\b/.test(code))f.push('lambda');
  if(/\bzip\s*\(/.test(code))f.push('zip');
  if(/\benumerate\s*\(/.test(code))f.push('enumerate');
  if(/\b(any|all)\s*\(/.test(code))f.push('any/all');
  return f;
}
function renderExercise(l){
  const e=lessonExs(l)[0];const sid=l.id;const saved=store.lesson(sid);
  const feats=pyFeatures(e.starter+'\n'+e.solution);
  const advBadge=feats.length?`<span class="badge adv" title="This exercise uses intermediate Python (${feats.join(', ')}) — all taught in the Python stream. Stuck on the syntax? Revisit those lessons or ask the tutor.">⚡ intermediate Python: ${feats.join(', ')}</span>`:'';
  return `<div class="exercise">
    <div class="exHd"><span class="badge${saved.done?' done':''}">EXERCISE${saved.done?' · ✓':''}</span> ${esc(e.title)}${advBadge}</div>
    <div class="prompt">${e.prompt}</div>
    ${editorHTML()}
    <div class="toolbar">
      <button class="primary" id="btnRun">▶ Run &amp; check (real Python)</button>
      <button id="btnHint">💡 Next step</button>
      <button id="btnSol">👀 Show me the solution</button>
      <button id="btnReset">↺ Reset code</button>
    </div>
    <div class="ioPanel">
      <div class="ioTabs"><div class="ioTab active" id="tab-tests">Test results</div><div class="ioTab" id="tab-console">Console</div></div>
      <div class="ioBody" id="io-tests"><span style="color:var(--muted);font-size:12.5px">No runs yet — hit ▶ Run &amp; check. The first run loads Python in your browser (a few seconds).</span></div>
      <div class="ioBody" id="io-console" style="display:none"><span class="cLine dim">— program output appears here —</span></div>
    </div>
    <div class="doneBanner" id="doneBanner">✅ Lesson complete — nice work!</div>
    <div class="solution" id="solBox" hidden><div class="codeSample">${esc(e.solution)}</div></div>
  </div>`;
}
function initExercise(l){
  const e=lessonExs(l)[0];const sid=l.id;const saved=store.lesson(sid);
  hintIdx=saved.hintIdx||0;
  const ed=wireEditor(saved.code!=null?saved.code:e.starter,
    code=>store.patch(sid,{code}),
    ()=>runExercise(l));
  if(saved.done)document.getElementById('doneBanner').style.display='block';
  document.getElementById('tab-tests').onclick=()=>setTab('tests');
  document.getElementById('tab-console').onclick=()=>setTab('console');
  document.getElementById('btnRun').onclick=()=>runExercise(l);
  document.getElementById('btnHint').onclick=()=>nextStep(l);
  document.getElementById('btnReset').onclick=()=>{if(confirm('Reset to starter code?')){ed.value=e.starter;ed.dispatchEvent(new Event('input'));}};
  document.getElementById('btnSol').onclick=()=>{
    const b=document.getElementById('solBox');b.hidden=!b.hidden;
    document.getElementById('btnSol').textContent=b.hidden?'👀 Show me the solution':'🙈 Hide solution';
  };
}
function setTab(name){
  document.getElementById('io-tests').style.display=name==='tests'?'block':'none';
  document.getElementById('io-console').style.display=name==='console'?'block':'none';
  document.getElementById('tab-tests').classList.toggle('active',name==='tests');
  document.getElementById('tab-console').classList.toggle('active',name==='console');
}
async function runExercise(l){
  const e=lessonExs(l)[0];const sid=l.id;
  const code=document.getElementById('ed').value;
  const tests=document.getElementById('io-tests');
  const con=document.getElementById('io-console');
  const btn=document.getElementById('btnRun');btn.disabled=true;
  tests.innerHTML='<div class="cLine dim"><span class="spin"></span><span id="pyStatus">Starting Python…</span></div>';
  const status=msg=>{const el=document.getElementById('pyStatus');if(el)el.textContent=msg;};
  try{
    const r=await runPython(code,e.tests,e.packages,status);
    con.innerHTML=(r.stdout?r.stdout.split('\n').map(x=>`<div class="cLine">${esc(x)}</div>`).join(''):'<span class="cLine dim">(no output)</span>')
      +(r.figure?`<img class="pyFig" src="data:image/png;base64,${r.figure}" alt="your plot">`:'');
    if(!r.ok){
      tests.innerHTML=`<div class="tcase bad">✘ Your code raised an error:</div><div class="cLine err">${esc(r.error)}</div>`;
      con.innerHTML+=`<div class="cLine err">${esc(r.error)}</div>`;
      setTab('console');
    }else{
      const passed=r.results.filter(t=>t.pass).length;
      tests.innerHTML=r.results.map(t=>`<div class="tcase ${t.pass?'ok':'bad'}">${t.pass?'✔':'✘'} ${esc(t.d)}${t.err?' — '+esc(t.err):''}</div>`).join('')+
        `<div class="aiBox">Passed ${passed} / ${r.results.length} checks.</div>`;
      setTab('tests');
      if(passed===r.results.length){markComplete(l);}
    }
  }catch(err){
    tests.innerHTML=`<div class="tcase bad">✘ Could not run Python: ${esc(err.message||err)}</div>
      <div class="cLine dim">If this persists, the Pyodide CDN may be blocked on your network.</div>`;
  }
  btn.disabled=false;
}
function markComplete(l){
  const sid=l.id;
  if(!store.lesson(sid).done){store.patch(sid,{done:true,completedAt:Date.now()});
    const banner=document.getElementById('doneBanner');if(banner)banner.style.display='block';
    toast('✅ Lesson complete — '+doneCount()+'/'+totalLessons());
    refreshBelt();renderNav();
  }
}
function nextStep(l){
  const e=lessonExs(l)[0];const hints=e.hints||[];
  const box=document.getElementById('io-tests');setTab('tests');
  if(hintIdx<hints.length){
    box.insertAdjacentHTML('beforeend',`<div class="aiBox hint">💡 <b>Next step ${hintIdx+1}/${hints.length}:</b> ${esc(hints[hintIdx])}</div>`);
    hintIdx++;store.patch(l.id,{hintIdx});
    return;
  }
  askTutorInline(l,'I am stuck on this exercise. Give me ONE short concrete next step based on my current code, without giving the full solution.');
}

/* ------------------------------ setup guide ------------------------------ */
function renderSetupGuide(){
  cur={si:-3,li:-1};
  document.getElementById('main').innerHTML=`
  <h1 class="lessonTitle">🛠 Set up Python for ML on your own machine</h1>
  <div class="lessonBody">
  <p><b>You do not need any of this to take the course</b> — everything in MLDojo runs right
  here in your browser. But when you want to experiment further on your own computer (bigger
  datasets, longer experiments, real projects), this is the standard professional setup,
  step by step. Allow 15–30 minutes.</p>

  <h3>Step 1 — Install Python</h3>
  <p><b>macOS:</b> download the latest Python 3 installer from
  <a href="https://www.python.org/downloads/" target="_blank" rel="noopener">python.org/downloads ↗</a>
  and run it (or, if you use Homebrew: <code>brew install python</code>).<br>
  <b>Windows:</b> download from the same page and run the installer — and <b>check the box
  "Add python.exe to PATH"</b> on the first screen (missing that is the #1 setup problem on
  Windows).<br>
  <b>Linux (Ubuntu/Debian):</b> <code>sudo apt install python3 python3-pip python3-venv</code>.</p>

  <h3>Step 2 — Verify it works</h3>
  <p>Open a terminal (macOS: Terminal app; Windows: "PowerShell"; Linux: you know where it is)
  and run:</p>
  <div class="codeSample">python3 --version     # macOS / Linux
python --version      # Windows</div>
  <p>You want <b>Python 3.10 or newer</b>. If the command is not found, the installer did not
  land on your PATH — on Windows, re-run it and tick the PATH box.</p>

  <h3>Step 3 — Make a project folder with a virtual environment</h3>
  <p>Remember install-vs-import from the imports lesson? Real projects keep their installed
  packages in a per-project <b>virtual environment</b>, so projects never fight over versions:</p>
  <div class="codeSample">mkdir my-ml-lab
cd my-ml-lab
python3 -m venv .venv

# activate it (do this every time you work in the project):
source .venv/bin/activate       # macOS / Linux
.venv\\Scripts\\activate          # Windows (PowerShell)</div>
  <p>Your prompt gains a <code>(.venv)</code> prefix — that means pip now installs into this
  project only. <code>deactivate</code> leaves it.</p>

  <h3>Step 4 — Install the ML toolkit</h3>
  <div class="codeSample">pip install numpy pandas matplotlib scikit-learn jupyter</div>
  <p>That is the exact toolkit this course teaches: arrays, tables, plots, classic ML, and
  the notebook environment — the same libraries the browser has been fetching for you
  automatically.</p>

  <h3>Step 5 — Run your first script</h3>
  <p>Create a file <code>hello_ml.py</code> (any text editor) containing:</p>
  <div class="codeSample">import numpy as np

v = np.array([3, 4])
print("length of", v, "is", np.linalg.norm(v))</div>
  <p>Then run it from the terminal:</p>
  <div class="codeSample">python hello_ml.py</div>
  <p>If it prints <code>length of [3 4] is 5.0</code> — congratulations, your machine is an ML
  workstation.</p>

  <h3>Step 6 (recommended) — a real editor and notebooks</h3>
  <p>Install <a href="https://code.visualstudio.com/" target="_blank" rel="noopener">VS Code ↗</a>
  with its Python extension (it will find your .venv automatically). And try
  <b>Jupyter</b> — the notebook workflow ML practitioners live in, where code, output, and
  plots interleave like they do in MLDojo lessons:</p>
  <div class="codeSample">jupyter notebook      # opens in your browser; make a new Python 3 notebook</div>

  <h3>If something goes wrong</h3>
  <p>The two classics: <code>command not found</code> → Python is not on your PATH (re-run the
  installer / restart the terminal); <code>ModuleNotFoundError</code> → you installed into a
  different environment than you are running — check for the <code>(.venv)</code> prefix.
  Paste any error into the <b>Ask the Tutor</b> panel and it will help you debug it.</p>

  <p style="margin-top:18px"><button class="primary" onclick="openLesson(0,0)">← Back to the course</button></p>
  </div>`;
  renderNav();
}

/* ------------------------------ playground ------------------------------ */
const PLAY_DEFAULT=`# Your Python scratchpad — write anything and hit Run (or Cmd/Ctrl+Enter).
# Imports like numpy are fetched automatically on first use.

import numpy as np

v = np.array([3, 4])
print("length of", v, "is", np.linalg.norm(v))

for i in range(3):
    print("hello from real Python, run", i + 1)
`;
function renderPlayground(){
  cur={si:-2,li:-1};
  document.getElementById('main').innerHTML=`
    <h1 class="lessonTitle">🐍 Python Playground</h1>
    <p class="lessonBody" style="margin-bottom:12px">A free coding space — real Python in your browser, no rules, no grading.
    Test an idea from a lesson, or just explore. Imports (numpy, pandas, …) are downloaded automatically the first time you use them.
    Your code is saved between visits.</p>
    ${editorHTML()}
    <div class="toolbar">
      <button class="primary" id="btnRun">▶ Run</button>
      <button id="btnClear">↺ Clear scratchpad</button>
    </div>
    <div class="ioPanel"><div class="ioTabs"><div class="ioTab active">Output</div></div>
      <div class="ioBody" id="io-play"><span class="cLine dim">— output appears here —</span></div></div>`;
  const saved=store.get().__play;
  const ed=wireEditor(saved!=null?saved:PLAY_DEFAULT,
    code=>{const d=store.get();d.__play=code;store.set(d);},
    runPlayground);
  document.getElementById('btnRun').onclick=runPlayground;
  document.getElementById('btnClear').onclick=()=>{if(confirm('Clear the scratchpad?')){ed.value=PLAY_DEFAULT;ed.dispatchEvent(new Event('input'));}};
  renderNav();
}
async function runPlayground(){
  const code=document.getElementById('ed').value;
  const out=document.getElementById('io-play');
  const btn=document.getElementById('btnRun');btn.disabled=true;
  out.innerHTML='<div class="cLine dim"><span class="spin"></span><span id="pyStatus">Starting Python…</span></div>';
  const status=msg=>{const el=document.getElementById('pyStatus');if(el)el.textContent=msg;};
  try{
    const r=await runPython(code,[],[],status);
    let h=r.stdout?r.stdout.split('\n').map(x=>`<div class="cLine">${esc(x)}</div>`).join(''):'<span class="cLine dim">(no output — use print() to see results)</span>';
    if(r.figure)h+=`<img class="pyFig" src="data:image/png;base64,${r.figure}" alt="your plot">`;
    if(!r.ok)h+=`<div class="cLine err">${esc(r.error)}</div>`;
    out.innerHTML=h;
  }catch(err){out.innerHTML=`<div class="cLine err">Could not run Python: ${esc(err.message||err)}</div>`;}
  btn.disabled=false;
}

/* ------------------------------ feedback ------------------------------ */
function sendFeedback(id,kind,label){
  const d=store.get();d.__feedback=d.__feedback||[];d.__feedback.push({id,kind,at:Date.now()});store.set(d);
  document.getElementById('fbNote').textContent=' — thanks! ('+label+' noted)';
}

/* ------------------------------ tutor / dive deeper ------------------------------ */
function lessonContext(l){return `LESSON: ${l.title}\n\n${stripHtml(l.body).slice(0,1600)}`;}
function stripHtml(h){const d=document.createElement('div');d.innerHTML=h;return d.textContent||'';}
function tutorLog(cls,html){const log=document.getElementById('tutorLog');const div=document.createElement('div');div.className='tMsg '+cls;div.innerHTML=html;log.appendChild(div);log.scrollTop=log.scrollHeight;return div;}
async function askClaudeSafe(prompt){
  if(!(window.cowork&&window.cowork.askClaude))throw new Error('The AI tutor is available in the Cowork/desktop app. (In a plain browser preview it is disabled, but everything else — including running Python — works.)');
  return await window.cowork.askClaude(prompt,[]);
}
async function sendTutor(){
  const q=document.getElementById('tutorQ').value.trim();if(!q)return;
  document.getElementById('tutorQ').value='';
  tutorLog('tUser',esc(q));
  const l=cur.si>=0?STREAMS[cur.si].lessons[cur.li]:{title:'the MLDojo welcome page',body:'The student has not opened a lesson yet.'};
  const wait=tutorLog('tBot','<span class="spin"></span>Thinking…');
  try{
    const ans=await askClaudeSafe(`You are MLDojo's tutor. The student is on this lesson:\n\n${lessonContext(l)}\n\nAnswer their question clearly, grounded first (what it is / what it's for) before any math, in plain English. Keep it focused.\n\nQUESTION: ${q}`);
    wait.innerHTML=esc(String(ans));
  }catch(e){wait.innerHTML=esc(e.message);}
}
function askTutorInline(l,prompt){
  openTutor();
  document.getElementById('tutorQ').value='';
  const code=document.getElementById('ed')?document.getElementById('ed').value:'';
  const wait=tutorLog('tBot','<span class="spin"></span>Thinking…');
  askClaudeSafe(`You are MLDojo's tutor helping with this lesson:\n\n${lessonContext(l)}\n\nThe student's current code:\n${code}\n\n${prompt}`)
    .then(a=>wait.innerHTML=esc(String(a))).catch(e=>wait.innerHTML=esc(e.message));
}
async function diveDeeperAsk(l){
  const box=document.getElementById('deepBox');box.hidden=false;
  const note=document.createElement('div');note.style.marginTop='10px';note.innerHTML='<span class="spin"></span>Asking the tutor for a deeper, Bishop-level walkthrough…';
  box.appendChild(note);
  try{
    const a=await askClaudeSafe(`You are MLDojo's tutor. Give a rigorous but plain-English "dive deeper" on the core math of this lesson, at roughly the level of Bishop's Pattern Recognition and Machine Learning — but explained so a motivated beginner follows every step. Ground each formula in what it does. Lesson:\n\n${lessonContext(l)}`);
    note.innerHTML='<b>📖 Deeper (tutor):</b><br>'+esc(String(a));
  }catch(e){note.innerHTML=esc(e.message);}
}
function openTutor(){document.getElementById('tutorPanel').classList.remove('hidden');document.getElementById('tutorFab').classList.add('hidden');}
function closeTutor(){document.getElementById('tutorPanel').classList.add('hidden');document.getElementById('tutorFab').classList.remove('hidden');}
document.getElementById('tutorFab').onclick=openTutor;
document.getElementById('tutorClose').onclick=closeTutor;
document.getElementById('tutorSend').onclick=sendTutor;
document.getElementById('tutorQ').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendTutor();}});
