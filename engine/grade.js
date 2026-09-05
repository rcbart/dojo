/* ============================== GRADING ==============================
   Every path by which an answer is judged: the structural regex checks, the
   sandboxed Web Worker that executes JavaScript, the in-browser SQL engine,
   the opt-in local Java runner, and the AI-assisted simulation.

   Extracted from app.js because this is where correctness lives, five paths
   with different trust levels, tested by engine/test and documented in
   ARCHITECTURE. Everything here is called at runtime, so load order relative
   to app.js does not matter; it is placed before for readability. */
/* ============================== TESTS ============================== */
/* Structural checks and the inert-code defense (issue #3, caught by Seve
   Zavala): pasting the official solution inside comment syntax or a string
   literal used to pass every structural check and, with the AI runner
   unavailable, complete the lesson. Two mechanisms close it:
   1. Comments are stripped before matching (C-family for Java/JS/Groovy,
      hash comments for shell/yaml/dockerfile), so commented-out code never
      satisfies a positive check. "://" is guarded so URLs survive, and the
      pass is state-tracked so markers inside strings do not confuse it.
      String contents are KEPT: many checks legitimately target literals
      (URLs, SQL, header values), and in shell a quoted awk/jq body IS the
      program. A test may set raw:true to match the unstripped code, for
      checks that deliberately require a comment.
   2. The tripwire: if stripping comments AND strings leaves no substantive
      code, the submission is inert (all comments/strings) and every check
      fails, which also catches the whole-solution-in-a-string wrap.
   Languages graded by real execution (run: JS worker, SQL engine, ML
   Dojo's Pyodide) never depended on this path. */
function stripInert(code,opts){
  const cstyle=opts.cstyle,hash=opts.hash,keepStrings=opts.keepStrings;
  let out='';
  for(let i=0;i<code.length;){
    const c=code[i],d=code[i+1];
    if(cstyle&&c==='/'&&d==='*'){const e=code.indexOf('*/',i+2);i=e<0?code.length:e+2;out+=' ';continue;}
    if(cstyle&&c==='/'&&d==='/'&&code[i-1]!==':'){while(i<code.length&&code[i]!=='\n')i++;continue;}
    if(hash&&c==='#'){while(i<code.length&&code[i]!=='\n')i++;continue;}
    if(opts.dash&&c==='-'&&d==='-'){while(i<code.length&&code[i]!=='\n')i++;continue;}
    if(opts.xml&&c==='<'&&code.substr(i,4)==='<!--'){const e=code.indexOf('-->',i+4);i=e<0?code.length:e+3;out+=' ';continue;}
    if(c==='"'||c==="'"||c==='`'){
      let j=i+1;
      while(j<code.length&&code[j]!==c){j+=code[j]==='\\'?2:1;}
      out+=keepStrings?code.slice(i,j+1):c+c;
      i=j+1;continue;
    }
    out+=c;i++;
  }
  return out;
}
function checkOpts(lang){
  if(!lang||lang==='java'||lang==='js'||lang==='jsx'||lang==='groovy')return {cstyle:true,hash:false};
  if(lang==='shell'||lang==='yaml'||lang==='dockerfile')return {cstyle:false,hash:true};
  if(lang==='sql')return {cstyle:true,hash:false,dash:true,markersMatter:true};
  if(lang==='http'||lang==='xml')return {cstyle:false,hash:false,xml:true};
  return null; // text and free-form answers: match raw, nothing to strip
}
/* The exercise's language, in the words a learner would use. `lang` is absent for
   Java because that is the engine's default; every other value is a real language
   the shared engine grades, so nothing should be described as Java by accident. */
const LANG_NAMES={java:'Java',js:'JavaScript',jsx:'React (JSX)',sql:'SQL',shell:'shell',
  yaml:'YAML',dockerfile:'Dockerfile',groovy:'Groovy',http:'HTTP',xml:'XML',text:'short-answer'};
function exLang(e){const k=(e&&e.lang)||'java';return LANG_NAMES[k]||k;}
function localChecks(e,code){
  const opts=checkOpts(e.lang);
  let hay=code,bare=code,inert=false;
  if(opts){
    const p={cstyle:opts.cstyle,hash:opts.hash,dash:opts.dash,xml:opts.xml};
    // SQL exercises anchor their checks on "-- n)" comment markers, so comments
    // must survive in the haystack there; the inert tripwire below still strips
    // them, which is what rejects a wholly commented-out submission.
    hay=opts.markersMatter?code:stripInert(code,Object.assign({keepStrings:true},p));
    bare=stripInert(code,Object.assign({keepStrings:false},p));
    inert=(bare.replace(/[^A-Za-z]/g,'').length<15)&&(code.replace(/[^A-Za-z]/g,'').length>=15);
  }
  return (e.tests||[]).map(t=>{
    let pass;
    // An inert submission (nothing but comments and string literals) is matched
    // against the string-stripped text, so a short but genuine answer whose
    // content is mostly a literal still passes on its own merits.
    const target=t.raw?code:(inert&&!t.not?bare:hay);
    try{pass=new RegExp(t.re,t.flags||'s').test(target);}catch(err){pass=false}
    if(t.not)pass=!pass;
    return {desc:t.d,pass};
  });
}
function cline(txt,cls,attr){return '<div class="cLine'+(cls?' '+cls:'')+'"'+(attr||'')+'>'+txt+'</div>';}
/* The AI runner is a promise handed to us by the host page. It has no deadline of
   its own, so a runner that never settles used to leave the Run button disabled
   for good. Every call now races a timer, and the timer is cleared either way so
   a settled run does not keep a handle alive. */
const AI_TIMEOUT_MS=90000;
function withTimeout(p,ms,msg){
  let timer=null;
  const t=new Promise((_,rej)=>{timer=setTimeout(()=>rej(new Error(msg)),ms);});
  const clear=()=>{if(timer!==null){clearTimeout(timer);timer=null;}};
  return Promise.race([Promise.resolve(p),t]).then(v=>{clear();return v;},err=>{clear();throw err;});
}
/* A line number quoted back from the runner is untrusted text: it was written
   into innerHTML unescaped, so a runner reply of {"line":"<img onerror=...>"}
   injected markup into the learner's page. Reduce it to a positive integer or a
   question mark, which is all it was ever meant to be. */
function lineLabel(v){const n=parseInt(v,10);return (Number.isFinite(n)&&n>0)?String(n):'?';}
async function runTests(l,e,sid,ei,exs){
  const code=document.getElementById('ed').value;
  if(e.lang==='sql'&&e.data&&window.SQLDB&&window.SQL_DATASETS&&window.SQL_DATASETS[e.data])return gradeSql(l,e,sid,ei,exs,code);
  if(e.run&&typeof Worker!=='undefined')return gradeJs(l,e,sid,ei,exs,code);
  if(!e.lang&&e.gradeJava&&typeof fetch!=='undefined'&&await gradeJavaViaRunner(l,e,sid,ei,exs,code))return;
  const tests=document.getElementById('io-tests');
  const con=document.getElementById('io-console');
  const btn=document.getElementById('btnRun');if(btn)btn.disabled=true;
  /* This path awaits a network round trip. Remember which lesson the learner was
     on when they hit Run, so a late reply cannot mark a different one complete. */
  const epoch=(typeof gradeEpoch==='function')?gradeEpoch():0;
  const stale=()=>(typeof gradeStale==='function')&&gradeStale(epoch);
  const isJava=!e.lang;
  const checks=localChecks(e,code);
  con.innerHTML=cline('$ '+(isJava?'javac Solution.java && java DojoTestRunner':'dojo check'),'dim')+
    cline('<span class="spin"></span>Claude is compiling and executing in the background…','dim');
  tests.innerHTML='<h4 style="margin:8px 0 4px">Structural checks</h4>'+
    checks.map(c=>`<div class="tcase ${c.pass?'ok':'bad'}">${c.pass?'✔':'✘'} ${c.desc}</div>`).join('')+
    `<div class="aiBox" id="aiOut"><span class="spin"></span>Compile & test run in progress…</div>`;
  setTab('console');
  const numbered=code.split('\n').map((ln,i)=>String(i+1).padStart(3)+' | '+ln).join('\n');
  const prompt=`You are ${DOJO_NAME}'s build and test runner. Act as a strict ${isJava?'Java compiler (javac) and JUnit-style test executor':(exLang(e)+' validator')}. First check the code compiles/is well-formed; report every compile/syntax error with its line number from the numbered listing. Only if it compiles, mentally execute the behavior tests. Be precise and cite line numbers.

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
    if(!window.cowork||!window.cowork.askClaude)throw new Error('AI runner unavailable in this preview, structural checks only.');
    const raw=await withTimeout(window.cowork.askClaude(prompt,[]),AI_TIMEOUT_MS,'the runner did not answer in time, structural checks only.');
    if(stale())return;                       // the learner moved on; drop this result
    const out=extractJson(raw);
    if(out){
      // ---- console tab ----
      let ch=cline('$ '+(isJava?'javac Solution.java':'dojo check'),'dim');
      if(out.compiles===false){
        (out.compileErrors||[]).forEach(er=>{
          ch+=cline('Solution.java:'+lineLabel(er.line)+': error: '+esc(er.message||''),'err',
            ' onclick="jumpToLine('+(parseInt(er.line)||1)+')" title="click to jump to line '+(parseInt(er.line)||1)+'"');
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
          (out.compileErrors||[]).map(er=>`<div class="tcase bad" style="cursor:pointer" onclick="jumpToLine(${parseInt(er.line)||1})">✘ line ${lineLabel(er.line)}: ${esc(er.message||'')}</div>`).join('')+
          `<div class="aiBox"><h4>🤖 Feedback</h4>${esc(out.feedback||'')}</div>`;
      }else{
        th='<h4 style="margin:10px 0 4px">Test run</h4>'+
          (out.tests||[]).map(t=>`<div class="tcase ${t.pass?'ok':'bad'}">${t.pass?'✔':'✘'} ${esc(t.name)}${t.note?', '+esc(t.note):''}</div>`).join('')+
          `<div class="aiBox"><h4>🤖 Feedback</h4>${esc(out.feedback||'')}</div>`;
      }
      if(box)box.outerHTML=th;               // may be gone; a passing run still counts
      const allLocal=checks.every(c=>c.pass);
      const tl2=out.tests||[];
      const aiPass=out.passed===true||(tl2.length>0&&tl2.every(t=>t.pass));
      const green=out.compiles!==false&&aiPass&&allLocal;
      setTab(out.compiles===false?'console':'tests');
      markTab(out.compiles===false?'tests':'console',green?'#16a34a':'#dc2626');
      if(green){
        completeExercise(l,sid,ei,exs);
      }else if(out.compiles!==false&&aiPass&&!allLocal){
        const box2=document.getElementById('io-tests');
        if(box2)box2.insertAdjacentHTML('beforeend',
          '<div class="aiBox hint"><h4>⚠ Almost there</h4>All behavior tests pass, but one or more structural checks above are still failing, they enforce the specific technique this lesson teaches. Fix those and run again to complete the lesson.</div>');
      }
    }else{
      const allLocal=checks.length&&checks.every(c=>c.pass);
      const box=document.getElementById('aiOut');
      if(box)box.innerHTML='<h4>🤖 Feedback</h4>'+
        esc(typeof raw==='string'?raw:JSON.stringify(raw))+
        (allLocal?'<br><br><b>All structural checks pass, lesson marked complete.</b>':'');
      con.innerHTML=cline('Runner returned unstructured feedback, see Test Results tab.','warn');
      setTab('tests');
      if(allLocal)completeExercise(l,sid,ei,exs);
    }
  }catch(err){
    /* The catch used to name its parameter `e`, shadowing the exercise, and then
       dereference #aiOut with no guard: switching lesson mid-grade threw here,
       the run never settled, and the Run button stayed disabled for good. */
    if(!stale()){
      const allLocal=checks.length&&checks.every(c=>c.pass);
      const msg=(err&&err.message)?err.message:String(err);
      const box=document.getElementById('aiOut');
      if(box)box.innerHTML=esc(msg)+(allLocal?' All structural checks passed, marking complete.':'');
      if(con)con.innerHTML=cline(esc(msg),'warn');
      setTab('tests');
      if(allLocal)completeExercise(l,sid,ei,exs);
    }
  }finally{
    const b=document.getElementById('btnRun')||btn;
    if(b)b.disabled=false;
  }
}
/* ============================== REAL EXECUTION GRADERS ============================== */
function sqlSelects(text){
  return text.replace(/\/\*[\s\S]*?\*\//g,' ').replace(/--[^\n]*/g,' ')
    .split(';').map(s=>s.trim()).filter(Boolean).filter(s=>/^select/i.test(s));
}
/* JSON.stringify turns NaN and Infinity into null, so a query that produced a
   non-finite number (SUM over a text column, say) serialized identically to one
   that produced NULL and could be graded correct against the wrong reference.
   Tag non-finite numbers so they compare equal only to themselves. */
function canonRows(rows,ordered){
  const cell=v=>(typeof v==='number'&&!isFinite(v))?'\u0000'+String(v):v;
  const tuples=rows.map(r=>JSON.stringify(Object.values(r).map(cell)));
  if(!ordered)tuples.sort();
  return JSON.stringify(tuples);
}
/* Grade SQL by REAL execution: run the learner's and the reference solution's SELECTs
   against the sample dataset and compare result sets (value-tuples; order matters only
   when the reference uses ORDER BY). */
function gradeSql(l,e,sid,ei,exs,code){
  const btn=document.getElementById('btnRun');if(btn)btn.disabled=true;
  const tests=document.getElementById('io-tests');const con=document.getElementById('io-console');
  const db=window.SQL_DATASETS[e.data];
  const refQ=sqlSelects(e.solution),myQ=sqlSelects(code);
  const results=[];let allPass=refQ.length>0;
  const n=Math.max(refQ.length,myQ.length);
  for(let i=0;i<n;i++){
    const rq=refQ[i],mq=myQ[i];
    if(!rq){results.push({pass:false,name:'Query '+(i+1),note:'unexpected extra query'});allPass=false;continue;}
    if(!mq){results.push({pass:false,name:'Query '+(i+1),note:'missing, this exercise expects '+refQ.length+' quer'+(refQ.length>1?'ies':'y')});allPass=false;continue;}
    let refRows=null,myRows=null,err=null;
    try{refRows=window.SQLDB.run(JSON.parse(JSON.stringify(db)),rq);}catch(x){refRows=null;}
    try{myRows=window.SQLDB.run(JSON.parse(JSON.stringify(db)),mq);}catch(x){err=x.message;}
    if(err){results.push({pass:false,name:'Query '+(i+1),note:'SQL error: '+err});allPass=false;continue;}
    const ordered=/order\s+by/i.test(rq);
    const pass=!!refRows&&canonRows(myRows,ordered)===canonRows(refRows,ordered);
    results.push({pass,name:'Query '+(i+1)+' returns the correct rows',
      note:pass?'':((myRows?myRows.length:0)+' row(s) returned, expected '+(refRows?refRows.length:'?')+', check columns, filter'+(ordered?', and order':'')) });
    if(!pass)allPass=false;
  }
  tests.innerHTML='<h4 style="margin:8px 0 4px">Executed against sample data ('+esc(e.data)+')</h4>'+
    results.map(c=>`<div class="tcase ${c.pass?'ok':'bad'}">${c.pass?'✔':'✘'} ${esc(c.name)}${c.note?', '+esc(c.note):''}</div>`).join('')+
    `<div class="aiBox"><h4>🗄️ Real execution</h4>Your SQL ran in the in-browser engine against the <b>${esc(e.data)}</b> dataset and its result set was compared to the reference, this is real execution, not a pattern match. Open “Sample data” below to inspect the rows.</div>`;
  con.innerHTML=cline('$ dojo sql --dataset '+e.data,'dim')+cline(allPass?'All queries returned the expected rows.':'Some queries did not match the expected result set.',allPass?'ok':'err');
  setTab('tests');markTab('console',allPass?'#16a34a':'#dc2626');
  if(allPass)completeExercise(l,sid,ei,exs);
  if(btn)btn.disabled=false;
}
/* Grade pure-JS exercises by REAL execution in an isolated Web Worker. The exercise
   supplies e.run = { call:'fnName', cases:[{args,expect,name?}], mock?:'fetch' }. */
function buildWorkerSrc(code,spec,token){
  const cases=JSON.stringify(spec.cases||[]);
  const mode=spec.mock==='fetch'?'fetch':'call';
  const callLine=mode==='fetch'
    ? '__req=null; await '+spec.call+'.apply(null,c.args||[]); var r=checkFetch(c.expect,__req); results.push({name:c.name||("case "+(i+1)),pass:r.ok,note:r.note});'
    : 'var got=await '+spec.call+'.apply(null,c.args||[]); var ok=deepEq(got,c.expect); results.push({name:c.name||("case "+(i+1)),pass:ok,note:ok?"":("returned "+JSON.stringify(got))});';
  /* Hardening. The worker already has no DOM, no cookies, no localStorage and
     no access to the page. What it CAN still reach by default is the network,
     so those globals are removed before a single line of submitted code runs.
     The page CSP (connect-src 'none') is the real control and this is defence
     in depth: it turns a silent network attempt into an immediate TypeError. */
  const harden = 'try{'
    + '["importScripts","XMLHttpRequest","WebSocket","EventSource","Notification",'
    + '"indexedDB","caches","navigator","SharedWorker","Worker","BroadcastChannel"]'
    + '.forEach(function(k){try{delete self[k];}catch(e){self[k]=undefined;}});'
    + (mode==='fetch'?'':'try{delete self.fetch;}catch(e){self.fetch=undefined;}')
    + '}catch(e){}\n';
  return '"use strict";\n'+harden
    /* Deep equality that ignores OBJECT key order but respects ARRAY order.
       JSON.stringify alone made {a:1,b:2} unequal to {b:2,a:1}, so a learner
       returning the right object with the keys in another order was told they
       had failed. Array order stays significant because for a list it is data. */
    +'function canon(v){if(v===null||typeof v!=="object")return v;'
    +'if(Array.isArray(v))return v.map(canon);'
    +'var o={};Object.keys(v).sort().forEach(function(k){o[k]=canon(v[k]);});return o;}\n'
    +'function deepEq(a,b){return JSON.stringify(canon(a))===JSON.stringify(canon(b));}\n'
    +'function checkFetch(x,req){if(!req)return{ok:false,note:"no fetch was called"};var o=req.opts||{};'
    +'if(x.method&&String(o.method||"GET").toUpperCase()!==x.method.toUpperCase())return{ok:false,note:"method was "+(o.method||"GET")};'
    +'if(x.url&&String(req.url).indexOf(x.url)<0)return{ok:false,note:"url was "+req.url};'
    +'if(x.contentType){var h=o.headers||{};var ct=h["Content-Type"]||h["content-type"]||"";if(String(ct).indexOf(x.contentType)<0)return{ok:false,note:"content-type was "+ct};}'
    +'if(x.bodyIncludes&&String(o.body||"").indexOf(x.bodyIncludes)<0)return{ok:false,note:"body was "+String(o.body||"")};return{ok:true,note:""};}\n'
    +'(async function(){var results=[];var __req=null;'
    +(mode==='fetch'?'self.fetch=function(u,o){__req={url:u,opts:o||{}};return Promise.resolve({ok:true,status:201,json:function(){return Promise.resolve({});}});};':'')
    +'try{\n'+code+'\nvar cases='+cases+';for(var i=0;i<cases.length;i++){var c=cases[i];try{'+callLine+'}catch(err){results.push({name:c.name||("case "+(i+1)),pass:false,note:(err&&err.message)||String(err)});}}'
    +'}catch(err){results.push({name:"loaded without error",pass:false,note:(err&&err.message)||String(err)});}'
    +'postMessage({__t:'+JSON.stringify(String(token||''))+',r:results});})();';
}
function gradeJs(l,e,sid,ei,exs,code){
  const btn=document.getElementById('btnRun');if(btn)btn.disabled=true;
  const epoch=(typeof gradeEpoch==='function')?gradeEpoch():0;
  const stale=()=>(typeof gradeStale==='function')&&gradeStale(epoch);
  const tests=document.getElementById('io-tests');const con=document.getElementById('io-console');
  tests.innerHTML='<div class="aiBox"><span class="spin"></span>Running your code in a sandboxed Web Worker…</div>';setTab('tests');
  let w=null,settled=false;
  const finish=(results,fatal)=>{
    if(settled)return;settled=true;
    try{if(w)w.terminate();}catch(_){}
    /* A worker gets up to three seconds, which is long enough for the learner to
       click another lesson. Terminate it, then drop the result on the floor. */
    if(stale()){if(btn)btn.disabled=false;return;}
    const allPass=!fatal&&results.length>0&&results.every(r=>r.pass);
    tests.innerHTML='<h4 style="margin:8px 0 4px">Executed in a sandboxed Web Worker</h4>'+
      (fatal?`<div class="tcase bad">✘ ${esc(fatal)}</div>`:results.map(c=>`<div class="tcase ${c.pass?'ok':'bad'}">${c.pass?'✔':'✘'} ${esc(c.name)}${c.note?', '+esc(c.note):''}</div>`).join(''))+
      `<div class="aiBox"><h4>▶ Real execution</h4>Your function was called with real inputs in an isolated worker and its output compared to expected values, real execution, not a pattern match.</div>`;
    con.innerHTML=cline('$ run '+e.run.call+'()','dim')+cline(allPass?'All cases passed.':(fatal||'Failures above.'),allPass?'ok':'err');
    markTab('console',allPass?'#16a34a':'#dc2626');
    if(allPass)completeExercise(l,sid,ei,exs);
    if(btn)btn.disabled=false;
  };
  /* The learner's own code runs inside this worker, so it can call postMessage
     itself and forge an all-pass result. Each run carries a fresh token that the
     submitted code never sees before it is inlined; messages without it are
     ignored, and only the first accepted message settles the run. */
  const token=Math.random().toString(36).slice(2)+Date.now().toString(36);
  let src;try{src=buildWorkerSrc(code,e.run,token);}catch(x){return finish([],'could not prepare runner: '+x.message);}
  try{
    const url=URL.createObjectURL(new Blob([src],{type:'text/javascript'}));
    w=new Worker(url);
    URL.revokeObjectURL(url);   // the worker keeps running; the URL stops being resolvable
    const timer=setTimeout(()=>finish([],'timed out after 3s (possible infinite loop)'),3000);
    w.onmessage=ev=>{const d=ev&&ev.data;if(!d||d.__t!==token)return;clearTimeout(timer);finish(Array.isArray(d.r)?d.r:[],null);};
    w.onerror=ev=>{clearTimeout(timer);finish([],(ev&&ev.message)||'worker error (check for syntax errors)');};
  }catch(x){finish([],'worker unavailable: '+x.message);}
}
/* Phase 3: executable Java grading via the opt-in local runner. Builds a DojoTest
   harness that calls the student's methods and asserts expected values, compiles it
   with their code, runs it, and parses PASS/FAIL. Falls back (returns false) when the
   runner is off, so everyone still gets the regex/AI path. */
function buildJavaHarness(g,nonce){
  const inst=g.static===false, cls=g.class, recv=inst?'_o':cls;
  /* Every line the harness emits is prefixed with a per-run nonce, and the
     reader below accepts nothing without it. Without this, results came out of
     learner-controlled stdout: printing "PASS ..." lines and "DOJO_RESULT 8/8"
     from a static initializer, then System.exit(0) before the harness ran, was
     enough to paint the panel green on wrong code. Same defence as the JS
     worker path above, which ignores any message whose __t does not match.
     The limit, stated honestly: this stops forging by printing. It is not a
     sandbox. The learner owns the machine and can read the nonce out of the
     request if they set out to, exactly as they can read the worker token. */
  const N=JSON.stringify(String(nonce));
  const L=['public class DojoTest {','  public static void main(String[] args){','    final String N='+N+';','    int p=0,t=0;','    StringBuilder sb=new StringBuilder();'];
  if(inst)L.push('    '+cls+' _o=new '+cls+'();');
  (g.cases||[]).forEach((c,i)=>{
    const args=(c.args||[]).join(', ');
    const name=String(c.name||('case '+(i+1))).replace(/\\/g,'\\\\').replace(/"/g,'\\"');
    L.push('    t++; try { Object got='+recv+'.'+c.call+'('+args+'); boolean ok=java.util.Objects.equals(got, '+c.expect+'); if(ok)p++; sb.append(N).append(ok?" PASS ":" FAIL ").append("'+name+'").append(ok?"":(" (got "+got+")")).append("\\n"); } catch(Throwable ex){ sb.append(N).append(" FAIL "+"'+name+'"+" (threw "+ex+")\\n"); }');
  });
  L.push('    System.out.print(sb.toString());');
  L.push('    System.out.println(N+" DOJO_RESULT "+p+"/"+t);');
  L.push('  }','}');
  return L.join('\n');
}
async function gradeJavaViaRunner(l,e,sid,ei,exs,code){
  const tests=document.getElementById('io-tests'),con=document.getElementById('io-console'),btn=document.getElementById('btnRun');
  if(!tests||!con)return false;
  const epoch=(typeof gradeEpoch==='function')?gradeEpoch():0;
  const stale=()=>(typeof gradeStale==='function')&&gradeStale(epoch);
  const prev=tests.innerHTML; if(btn)btn.disabled=true;
  tests.innerHTML='<div class="aiBox"><span class="spin"></span>Compiling &amp; running with the local JDK…</div>';
  let data=null;
  const nonce='N'+Math.random().toString(36).slice(2)+Date.now().toString(36);
  try{
    const r=await fetch('/api/run/java',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify({code,harness:buildJavaHarness(e.gradeJava,nonce)})});
    if(!r.ok){tests.innerHTML=prev;if(btn)btn.disabled=false;return false;} // runner off -> fall back
    data=await r.json();
  }catch(_){tests.innerHTML=prev;if(btn)btn.disabled=false;return false;}
  /* A local compile can take seconds. If the learner has moved on, report the run
     as handled so nothing falls through to the AI path, and touch nothing. */
  if(stale()){if(btn)btn.disabled=false;return true;}
  const out=String(data.output||'');
  if(data.ok===false&&data.stage==='compile'){
    con.innerHTML=cline('$ javac *.java','dim')+out.split('\n').map(x=>cline(esc(x),'err')).join('')+cline('BUILD FAILED','err');
    tests.innerHTML='<h4 style="margin:8px 0 4px">Compilation (local JDK)</h4><div class="tcase bad">✘ your code did not compile, see the Console tab</div>';
    setTab('console');markTab('tests','#dc2626');if(btn)btn.disabled=false;return true;
  }
  /* Only lines the harness signed are read, and the LAST result wins rather
     than the first, so nothing printed before the harness runs can pre-empt it. */
  const sig=new RegExp('^'+nonce+' (PASS|FAIL) (.*)$');
  const caseLines=out.split('\n').map(x=>{const m=sig.exec(x);return m?(m[1]+' '+m[2]):null;}).filter(Boolean);
  const hits=out.match(new RegExp(nonce+'\\s+DOJO_RESULT\\s+(\\d+)\\/(\\d+)','g'))||[];
  const mr=hits.length?new RegExp(nonce+'\\s+DOJO_RESULT\\s+(\\d+)\\/(\\d+)').exec(hits[hits.length-1]):null;
  const shown=out.replace(new RegExp(nonce+' ?','g'),'');
  /* No signed result means the harness never finished: an early System.exit, a
     throw in a static initializer, or an attempt to forge the transcript. Fail
     closed. Nothing is marked complete on output we cannot vouch for. */
  if(!mr){
    tests.innerHTML='<h4 style="margin:8px 0 4px">Executed with the local JDK, real compile &amp; run</h4>'+
      '<div class="tcase bad">\u2718 the grader never reported a result, so nothing was marked complete. Your program ended before the checks ran, most often an early System.exit or a throw during static initialization.</div>';
    con.innerHTML=cline('$ javac *.java &amp;&amp; java DojoTest','dim')+cline(esc(shown),'err');
    setTab('tests');markTab('console','#dc2626');if(btn)btn.disabled=false;return true;
  }
  const p=parseInt(mr[1],10),t=parseInt(mr[2],10),allPass=t>0&&p===t&&caseLines.length===t;
  tests.innerHTML='<h4 style="margin:8px 0 4px">Executed with the local JDK, real compile &amp; run</h4>'+
    caseLines.map(x=>{const ok=x.indexOf('PASS')===0;return '<div class="tcase '+(ok?'ok':'bad')+'">'+(ok?'✔':'✘')+' '+esc(x.replace(/^(PASS|FAIL) /,''))+'</div>';}).join('')+
    '<div class="aiBox"><h4>▶ Real execution</h4>Compiled and ran on your machine; '+p+'/'+t+' assertions passed.</div>';
  con.innerHTML=cline('$ javac *.java && java DojoTest','dim')+cline(esc(shown),allPass?'ok':'err');
  setTab('tests');markTab('console',allPass?'#16a34a':'#dc2626');
  if(allPass)completeExercise(l,sid,ei,exs);
  if(btn)btn.disabled=false;
  return true;
}
