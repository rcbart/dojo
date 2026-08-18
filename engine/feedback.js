/* ============================== LEARNER FEEDBACK ==============================
   Per-lesson ratings and written comments: storage, the pure aggregate, the
   markup, and the prompt shown when moving to the next lesson.

   Extracted from app.js so the feedback loop can grow, phase 3 ideas include
   pairing ratings with exercise failure rates, without further enlarging the
   file that renders everything else. Depends on `store` from app.js at call
   time only. */
/* ============================== LESSON RATINGS ==============================
   Phase 1: capture a per-lesson signal (up / neutral / down), aggregate it, and
   sync it to the account when one exists. Ratings live under their own key
   prefix so they can never collide with exercise progress. Phase 2 will add a
   free-text comment, which is why the stored shape is an object rather than a
   bare number. */
const RATE={UP:1,NEUTRAL:0,DOWN:-1};
const rateKey=id=>'rating:'+id;
function getRating(id){const r=store.get()[rateKey(id)];return r&&typeof r.v==='number'?r.v:null;}
function getComment(id){const r=store.get()[rateKey(id)];return r&&typeof r.c==='string'?r.c:'';}
/* Phase 2: the written half. Submit is explicit, nothing is captured while
   someone is still typing, and an empty box clears rather than storing "". */
const COMMENT_MAX=2000;
function saveComment(id,raw){
  const text=(raw==null?'':String(raw)).trim().slice(0,COMMENT_MAX);
  store.patch(rateKey(id),{c:text||undefined,at:Date.now()});
  syncRating(id,getRating(id),text);
  return text;
}
function setRating(id,v){
  if(![RATE.UP,RATE.NEUTRAL,RATE.DOWN].includes(v))return false;
  store.patch(rateKey(id),{v,at:Date.now()});
  syncRating(id,v);
  return true;
}
/* Pure: given the whole store, count each rating value. Kept free of DOM and
   storage so the engine tests can exercise it directly. */
function rateAggregate(data){
  const t={up:0,neutral:0,down:0,rated:0};
  for(const k of Object.keys(data||{})){
    if(k.indexOf('rating:')!==0)continue;
    const v=data[k]&&data[k].v;
    if(v===RATE.UP)t.up++;else if(v===RATE.DOWN)t.down++;else if(v===RATE.NEUTRAL)t.neutral++;else continue;
    t.rated++;
  }
  t.comments=0;
  for(const k of Object.keys(data||{})){
    if(k.indexOf('rating:')!==0)continue;
    const c=data[k]&&data[k].c;
    if(typeof c==='string'&&c.trim())t.comments++;
  }
  t.score=t.rated?Math.round(((t.up-t.down)/t.rated)*100):null;   // -100..100, null when unrated
  return t;
}
/* Best-effort sync. The courses must work with no server at all, so a failure
   here is silent and the local value remains the source of truth. */
function syncRating(id,v,comment){
  try{
    if(typeof fetch!=='function')return;
    const payload={lesson:id};
    if(typeof v==='number')payload.rating=v;
    if(typeof comment==='string')payload.comment=comment;
    fetch('/api/ratings',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',
      body:JSON.stringify(payload)}).catch(()=>{});
  }catch(e){}
}
function rateLesson(id,v,fromPrompt){
  if(!setRating(id,v))return;
  const ta=document.getElementById('cmtT-'+id);
  const typed=ta?ta.value:null;                 // do not discard unsent text on re-render
  const box=document.getElementById('rateBox');
  if(box)box.innerHTML=ratingMarkup(id);
  const ta2=document.getElementById('cmtT-'+id);
  if(ta2&&typed&&!ta2.value)ta2.value=typed;
  const p=document.getElementById('ratePrompt');
  if(p)p.remove();
  if(fromPrompt&&window.__pendingNav){const n=window.__pendingNav;window.__pendingNav=null;openLesson(n[0],n[1]);}
}
/* The prompt adapts to the rating, because "what went wrong" and "what worked"
   are different questions and a generic box gets generic answers. Asking what
   the reader was TRYING to do surfaces the gap; asking whether they liked it
   surfaces politeness. */
function commentQuestion(id){
  const r=getRating(id);
  if(r===1)return 'What worked here? (so it does not get edited away)';
  if(r===-1)return 'What were you trying to do when this stopped making sense?';
  return 'What would have made this lesson clearer?';
}
function commentMarkup(id){
  const saved=getComment(id);
  return `<div class="cmtBox" id="cmt-${id}">`+
    `<label class="cmtQ" for="cmtT-${id}">${esc(commentQuestion(id))}</label>`+
    `<textarea id="cmtT-${id}" class="cmtInput" rows="3" maxlength="${COMMENT_MAX}" `+
      `placeholder="Optional. Specifics help more than praise, the line, the example, the step that lost you.">${esc(saved)}</textarea>`+
    `<div class="cmtRow">`+
      `<button class="cmtSend" onclick="submitComment('${id}')">${saved?'Update comment':'Submit comment'}</button>`+
      `<span class="cmtNote" id="cmtN-${id}">${saved?'Saved. Edit and submit again to change it.':'Stored with your account when signed in.'}</span>`+
    `</div></div>`;
}
function submitComment(id){
  const ta=document.getElementById('cmtT-'+id);
  if(!ta)return;
  const text=saveComment(id,ta.value);
  const note=document.getElementById('cmtN-'+id);
  if(note)note.textContent=text?'Thanks, saved.':'Comment cleared.';
  const btn=ta.parentNode&&ta.parentNode.querySelector('.cmtSend');
  if(btn)btn.textContent=text?'Update comment':'Submit comment';
}
function ratingMarkup(id){
  const cur=getRating(id);
  const btn=(v,icon,label)=>`<button class="rateBtn${cur===v?' on':''}" onclick="rateLesson('${id}',${v})" `+
    `aria-pressed="${cur===v}" title="${label}"><span aria-hidden="true">${icon}</span><span class="rateLbl">${label}</span></button>`;
  return `<div class="rateRow">${cur===null?'<span class="rateAsk">Was this lesson useful?</span>':'<span class="rateAsk done">Thanks, rating saved.</span>'}`+
    btn(RATE.UP,'&#128077;','Useful')+btn(RATE.NEUTRAL,'&#128528;','Neutral')+btn(RATE.DOWN,'&#128078;','Not useful')+`</div>`+
    commentMarkup(id);
}
/* Next lesson: if this one is unrated, ask once, inline, and let the reader
   dismiss it. A prompt that blocks navigation would be a dark pattern. */
function nextLesson(si,li,id){
  if(getRating(id)!==null)return openLesson(si,li+1);
  if(document.getElementById('ratePrompt'))return openLesson(si,li+1);
  window.__pendingNav=[si,li+1];
  const holder=document.getElementById('rateBox');
  if(!holder)return openLesson(si,li+1);
  const p=document.createElement('div');
  p.id='ratePrompt';p.className='ratePrompt';
  p.innerHTML=`<b>Before you move on</b>, was this lesson useful?`+
    `<div class="rateRow">`+
    `<button class="rateBtn" onclick="rateLesson('${id}',1,true)"><span aria-hidden="true">&#128077;</span><span class="rateLbl">Useful</span></button>`+
    `<button class="rateBtn" onclick="rateLesson('${id}',0,true)"><span aria-hidden="true">&#128528;</span><span class="rateLbl">Neutral</span></button>`+
    `<button class="rateBtn" onclick="rateLesson('${id}',-1,true)"><span aria-hidden="true">&#128078;</span><span class="rateLbl">Not useful</span></button>`+
    `<button class="rateSkip" onclick="skipRating()">Skip</button></div>`;
  holder.appendChild(p);
  p.scrollIntoView({block:'nearest'});
}
function skipRating(){
  const p=document.getElementById('ratePrompt');if(p)p.remove();
  const n=window.__pendingNav;window.__pendingNav=null;
  if(n)openLesson(n[0],n[1]);
}
