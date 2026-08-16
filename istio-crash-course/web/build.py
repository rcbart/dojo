#!/usr/bin/env python3
"""Build a single self-contained interactive index.html for the Istio crash course."""
import json, os, re, html

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # envoy-crash-course/
WEB = os.path.join(ROOT, "web")

# (id, source_path, title, group)  — all Istio pages live in web/
def W(name): return os.path.join(WEB, name)
PAGES = [
    ("setup-local-istio",                W("setup-local-istio.md"),                "Setup — run Istio locally",           "Get started"),
    ("primer-what-is-istio",             W("primer-what-is-istio.md"),             "Primer — What is Istio?",             "Get started"),
    ("primer-sidecar-vs-ambient",        W("primer-sidecar-vs-ambient.md"),        "Primer — Sidecar vs Ambient",         "Get started"),
    ("00-what-is-istio",                 W("00-what-is-istio.md"),                 "0 · What Istio is",                   "Fundamentals"),
    ("01-architecture",                  W("01-architecture.md"),                  "1 · Architecture (istiod + proxies)", "Fundamentals"),
    ("02-lab-install-and-inject",        W("02-lab-install-and-inject.md"),        "2 · Lab: install & inspect",          "Fundamentals"),
    ("03-traffic-gateway-virtualservice",W("03-traffic-gateway-virtualservice.md"),"3 · Ingress: Gateway & VirtualService","Fundamentals"),
    ("04-traffic-destinationrule-canary",W("04-traffic-destinationrule-canary.md"),"4 · DestinationRule & canaries",      "Fundamentals"),
    ("05-resilience-fault-injection",    W("05-resilience-fault-injection.md"),    "5 · Resilience & fault injection",    "Fundamentals"),
    ("11-egress-serviceentry",           W("11-egress-serviceentry.md"),           "5b · Egress & ServiceEntry",          "Fundamentals"),
    ("06-security-mtls-authz",           W("06-security-mtls-authz.md"),           "6 · Security: mTLS & authorization",  "Fundamentals"),
    ("12-request-auth-jwt",              W("12-request-auth-jwt.md"),              "6b · Request auth: JWTs",             "Fundamentals"),
    ("07-observability-kiali-telemetry", W("07-observability-kiali-telemetry.md"), "7 · Observability: Kiali & telemetry","Fundamentals"),
    ("08-ambient-mode",                  W("08-ambient-mode.md"),                  "8 · Ambient mode (sidecarless)",      "Platform"),
    ("09-gateway-api",                   W("09-gateway-api.md"),                   "9 · The Kubernetes Gateway API",      "Platform"),
    ("10-debugging-gotchas",             W("10-debugging-gotchas.md"),             "10 · Debugging & next steps",         "Platform"),
]

def load_page(path):
    with open(path, encoding="utf-8") as f:
        md = f.read()
    # strip leading H1 (title shown in header/sidebar)
    md = re.sub(r"^#\s+.*\n", "", md, count=1)
    # cut everything from "## Check yourself" onward (interactive quiz replaces it)
    idx = md.find("## Check yourself")
    if idx != -1:
        md = md[:idx]
    # drop any trailing "**Next:** ..." nav and trailing hr
    md = re.sub(r"\n\*\*Next:\*\*.*$", "", md.strip(), flags=re.S)
    md = re.sub(r"\n---\s*$", "", md.strip())
    return md.strip()

pages = []
for pid, path, title, group in PAGES:
    pages.append({"id": pid, "title": title, "group": group, "md": load_page(path)})

with open(os.path.join(WEB, "quizzes.json"), encoding="utf-8") as f:
    quizzes = json.load(f)

with open(os.path.join(WEB, "render.js"), encoding="utf-8") as f:
    render_js = f.read()

DATA = {"pages": pages, "quizzes": quizzes}
data_json = json.dumps(DATA, ensure_ascii=False)

TEMPLATE = r"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Istio Crash Course</title>
<style>
  :root{
    --bg:#0d1117; --panel:#141b23; --panel2:#1b2530; --ink:#e6edf3; --muted:#93a1b1;
    --teal:#2dd4bf; --teal-dim:#155e59; --line:#26313d; --code:#0b1017;
    --good:#22c55e; --good-bg:#0e2a1a; --bad:#ef4444; --bad-bg:#2a1414; --accent:#38bdf8;
  }
  *{box-sizing:border-box}
  html,body{margin:0;padding:0;background:var(--bg);color:var(--ink);
    font:16px/1.65 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
  a{color:var(--teal);text-decoration:none} a:hover{text-decoration:underline}
  #app{display:flex;min-height:100vh}
  /* sidebar */
  #sidebar{width:290px;flex:0 0 290px;background:var(--panel);border-right:1px solid var(--line);
    position:sticky;top:0;height:100vh;overflow-y:auto;padding:20px 0}
  .brand{padding:0 20px 14px;border-bottom:1px solid var(--line);margin-bottom:10px}
  .brand h1{font-size:17px;margin:0;color:#fff;letter-spacing:.2px}
  .brand .sub{font-size:12px;color:var(--muted);margin-top:3px}
  .progwrap{padding:12px 20px}
  .progbar{height:7px;background:var(--panel2);border-radius:6px;overflow:hidden}
  .progfill{height:100%;width:0;background:linear-gradient(90deg,var(--teal-dim),var(--teal));transition:width .4s}
  .progtxt{font-size:11px;color:var(--muted);margin-top:6px}
  .searchwrap{padding:6px 20px 4px}
  #search{width:100%;background:var(--code);border:1px solid var(--line);color:var(--ink);
    border-radius:8px;padding:9px 11px;font-size:13.5px;outline:none}
  #search:focus{border-color:var(--teal)}
  .searchinfo{font-size:11px;color:var(--muted);padding:4px 20px 0}
  .result{padding:9px 20px;cursor:pointer;border-left:3px solid transparent}
  .result:hover{background:var(--panel2);border-left-color:var(--teal)}
  .result .rt{font-size:13.5px;color:#fff;font-weight:600}
  .result .rs{font-size:12px;color:var(--muted);margin-top:2px;line-height:1.4}
  .result .rs mark{background:var(--teal-dim);color:#d7fff6;border-radius:3px;padding:0 2px}
  .noresult{padding:12px 20px;font-size:13px;color:var(--muted)}
  .navgroup{font-size:11px;text-transform:uppercase;letter-spacing:.9px;color:var(--muted);
    padding:14px 20px 6px;font-weight:700}
  .navitem{display:flex;align-items:center;gap:9px;padding:8px 20px;cursor:pointer;
    font-size:14px;color:var(--ink);border-left:3px solid transparent}
  .navitem:hover{background:var(--panel2)}
  .navitem.active{background:var(--panel2);border-left-color:var(--teal);color:#fff}
  .navitem .dot{width:16px;height:16px;flex:0 0 16px;border-radius:50%;border:2px solid var(--line);
    display:inline-flex;align-items:center;justify-content:center;font-size:10px}
  .navitem.done .dot{background:var(--teal);border-color:var(--teal);color:#04211f}
  .navitem .t{flex:1}
  /* main */
  #main{flex:1;min-width:0;display:flex;justify-content:center;padding:38px 40px 90px}
  #content{max-width:820px;width:100%}
  #content h2{font-size:26px;margin:.2em 0 .5em;color:#fff}
  #content h3{font-size:19px;margin:1.5em 0 .4em;color:var(--teal)}
  #content h4{font-size:16px;margin:1.2em 0 .3em;color:var(--ink)}
  #content p{margin:.7em 0}
  #content p.dd{margin:.2em 0 .8em 1.2em;color:var(--muted)}
  #content ul,#content ol{margin:.6em 0;padding-left:1.4em}
  #content li{margin:.3em 0}
  #content strong{color:#fff}
  #content code{background:var(--code);border:1px solid var(--line);border-radius:5px;
    padding:.08em .38em;font:13.5px/1.4 "SF Mono",Menlo,Consolas,monospace;color:#8be9c9}
  #content hr{border:0;border-top:1px solid var(--line);margin:1.8em 0}
  blockquote{margin:1em 0;padding:.5em 1em;background:var(--panel);border-left:3px solid var(--accent);
    border-radius:0 6px 6px 0;color:var(--ink)}
  blockquote p{margin:.3em 0}
  pre.code{position:relative;background:var(--code);border:1px solid var(--line);border-radius:9px;
    padding:14px 16px;overflow-x:auto;margin:1em 0}
  pre.code code{background:none;border:0;padding:0;color:#d7e2ea;
    font:13px/1.55 "SF Mono",Menlo,Consolas,monospace;white-space:pre}
  pre.code .copy{position:absolute;top:8px;right:8px;background:var(--panel2);color:var(--muted);
    border:1px solid var(--line);border-radius:6px;font-size:11px;padding:3px 9px;cursor:pointer}
  pre.code .copy:hover{color:var(--teal);border-color:var(--teal)}
  .tablewrap{overflow-x:auto;margin:1em 0}
  table{border-collapse:collapse;width:100%;font-size:14px}
  th,td{border:1px solid var(--line);padding:8px 11px;text-align:left;vertical-align:top}
  th{background:var(--panel2);color:#fff}
  tr:nth-child(even) td{background:rgba(255,255,255,.02)}
  .pagehdr{font-size:12px;text-transform:uppercase;letter-spacing:1px;color:var(--muted);margin-bottom:2px}
  /* quiz */
  .quiz{margin:34px 0 10px;padding:22px;background:var(--panel);border:1px solid var(--line);border-radius:12px}
  .quiz h3{margin-top:0;color:#fff}
  .quiz .qmeta{font-size:13px;color:var(--muted);margin-bottom:14px}
  .qcard{margin:16px 0;padding:16px;background:var(--panel2);border:1px solid var(--line);border-radius:10px}
  .qtext{font-weight:600;margin-bottom:12px}
  .opt{display:block;width:100%;text-align:left;background:var(--code);border:1px solid var(--line);
    color:var(--ink);border-radius:8px;padding:11px 13px;margin:8px 0;cursor:pointer;font-size:14.5px;
    transition:border-color .15s,background .15s}
  .opt:hover{border-color:var(--teal)}
  .opt.correct{border-color:var(--good);background:var(--good-bg)}
  .opt.wrong{border-color:var(--bad);background:var(--bad-bg)}
  .opt.disabled{cursor:default;opacity:.85}
  .why{margin-top:10px;font-size:13.5px;color:var(--ink);background:var(--code);
    border-left:3px solid var(--teal);border-radius:0 6px 6px 0;padding:9px 12px;display:none}
  .why.show{display:block}
  .why.ok{border-left-color:var(--good)} .why.no{border-left-color:var(--bad)}
  .qscore{margin-top:16px;font-size:14px;color:var(--muted)}
  .navbtns{display:flex;justify-content:space-between;margin-top:40px;gap:12px}
  .navbtns button{background:var(--panel2);color:var(--ink);border:1px solid var(--line);
    border-radius:9px;padding:11px 18px;font-size:14px;cursor:pointer}
  .navbtns button:hover:not(:disabled){border-color:var(--teal);color:#fff}
  .navbtns button:disabled{opacity:.35;cursor:default}
  .navbtns .next{background:var(--teal-dim);border-color:var(--teal)}
  .mobtog{display:none}
  @media(max-width:860px){
    #sidebar{position:fixed;left:0;top:0;z-index:30;transform:translateX(-100%);transition:transform .25s}
    #sidebar.open{transform:none}
    #main{padding:64px 18px 80px}
    .mobtog{display:inline-flex;position:fixed;top:12px;left:12px;z-index:40;background:var(--panel);
      border:1px solid var(--line);color:var(--ink);border-radius:8px;padding:8px 12px;cursor:pointer}
  }
</style>
</head>
<body>
<button class="mobtog" onclick="document.getElementById('sidebar').classList.toggle('open')">☰ Menu</button>
<div id="app">
  <aside id="sidebar">
    <div class="brand">
      <h1>Istio Crash Course</h1>
      <div class="sub">From zero to service mesh · interactive</div>
    </div>
    <div class="progwrap">
      <div class="progbar"><div class="progfill" id="progfill"></div></div>
      <div class="progtxt" id="progtxt">0% complete</div>
    </div>
    <div class="searchwrap">
      <input id="search" type="search" placeholder="Search the course…" autocomplete="off">
    </div>
    <div id="results"></div>
    <nav id="nav"></nav>
  </aside>
  <main id="main"><div id="content"></div></main>
</div>

<script>
__RENDER_JS__
</script>
<script>
const DATA = __DATA__;
const KEY = "istio-course-progress-v1";
let done = {};
try { done = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch(e){ done = {}; }
let current = 0;

function save(){ try { localStorage.setItem(KEY, JSON.stringify(done)); } catch(e){} }

// plain-text index for search (strip markdown to readable text)
function stripMd(md){
  return md
    .replace(/```[\s\S]*?```/g, " ")     // code fences
    .replace(/`[^`]+`/g, " ")            // inline code
    .replace(/^\s*\|.*$/gm, " ")         // table rows
    .replace(/[#>*_\-]+/g, " ")          // md symbols
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links -> text
    .replace(/\s+/g, " ").trim();
}
const INDEX = DATA.pages.map((p,idx) => ({idx, id:p.id, title:p.title, text:stripMd(p.md)}));

function escRe(s){ return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
function escHtml(s){ return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }

function snippet(text, q){
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i === -1) return "";
  const start = Math.max(0, i - 45), end = Math.min(text.length, i + q.length + 55);
  let s = (start>0?"…":"") + text.slice(start, end) + (end<text.length?"…":"");
  const re = new RegExp(escRe(q), "ig");
  return escHtml(s).replace(re, m => "<mark>"+escHtml(m)+"</mark>");
}

function doSearch(q){
  const nav = document.getElementById("nav");
  const box = document.getElementById("results");
  q = q.trim();
  if (!q){ box.innerHTML = ""; nav.style.display = ""; return; }
  nav.style.display = "none";
  const ql = q.toLowerCase();
  const hits = INDEX.map(p => {
    const inTitle = p.title.toLowerCase().includes(ql);
    const inText = p.text.toLowerCase().includes(ql);
    return (inTitle||inText) ? {p, inTitle, snip: snippet(p.text, q)} : null;
  }).filter(Boolean);
  if (!hits.length){ box.innerHTML = '<div class="noresult">No matches for “'+escHtml(q)+'”.</div>'; return; }
  box.innerHTML = '<div class="searchinfo">'+hits.length+' module'+(hits.length>1?'s':'')+' match</div>';
  hits.forEach(h => {
    const d = document.createElement("div");
    d.className = "result";
    d.innerHTML = '<div class="rt"></div><div class="rs">'+(h.snip||"(title match)")+'</div>';
    d.querySelector(".rt").textContent = h.p.title;
    d.onclick = () => {
      document.getElementById("search").value = "";
      doSearch("");
      go(h.p.idx);
      document.getElementById('sidebar').classList.remove('open');
    };
    box.appendChild(d);
  });
}

function buildNav(){
  const nav = document.getElementById("nav");
  nav.innerHTML = "";
  let lastGroup = null;
  DATA.pages.forEach((p, idx) => {
    if (p.group !== lastGroup){
      const g = document.createElement("div");
      g.className = "navgroup"; g.textContent = p.group;
      nav.appendChild(g); lastGroup = p.group;
    }
    const it = document.createElement("div");
    it.className = "navitem" + (idx===current?" active":"") + (done[p.id]?" done":"");
    it.innerHTML = '<span class="dot">'+(done[p.id]?"✓":"")+'</span><span class="t"></span>';
    it.querySelector(".t").textContent = p.title;
    it.onclick = () => { go(idx); document.getElementById('sidebar').classList.remove('open'); };
    nav.appendChild(it);
  });
}

function updateProgress(){
  const total = DATA.pages.length;
  const n = DATA.pages.filter(p => done[p.id]).length;
  const pct = Math.round(100*n/total);
  document.getElementById("progfill").style.width = pct + "%";
  document.getElementById("progtxt").textContent = pct + "% complete · " + n + "/" + total + " modules";
}

function attachCopy(root){
  root.querySelectorAll("pre.code .copy").forEach(btn => {
    btn.onclick = () => {
      const code = btn.parentElement.querySelector("code").innerText;
      navigator.clipboard.writeText(code).then(()=>{
        btn.textContent = "Copied!"; setTimeout(()=>btn.textContent="Copy", 1200);
      });
    };
  });
}

function renderQuiz(pid){
  const qs = DATA.quizzes[pid];
  if (!qs || !qs.length) return "";
  const wrap = document.createElement("div");
  wrap.className = "quiz";
  wrap.innerHTML = '<h3>Test your knowledge</h3><div class="qmeta">'+qs.length+
    ' questions · answer all to mark this module complete.</div>';
  const state = {answered: new Array(qs.length).fill(false), correct: 0};
  qs.forEach((q, qi) => {
    const card = document.createElement("div");
    card.className = "qcard";
    const qt = document.createElement("div");
    qt.className = "qtext"; qt.textContent = (qi+1)+". "+q.q;
    card.appendChild(qt);
    const why = document.createElement("div");
    why.className = "why";
    q.options.forEach((opt, oi) => {
      const b = document.createElement("button");
      b.className = "opt"; b.textContent = opt;
      b.onclick = () => {
        if (state.answered[qi]) return;
        state.answered[qi] = true;
        const ok = oi === q.answer;
        if (ok) state.correct++;
        card.querySelectorAll(".opt").forEach((x, xi) => {
          x.classList.add("disabled");
          if (xi === q.answer) x.classList.add("correct");
          if (xi === oi && !ok) x.classList.add("wrong");
        });
        why.textContent = ok ? ("✓ Correct. " + q.why)
          : ("✗ Not quite. " + ((q.whyWrong && q.whyWrong[oi]) ? q.whyWrong[oi] + " " : "") + q.why);
        why.className = "why show " + (ok ? "ok":"no");
        maybeComplete();
      };
      card.appendChild(b);
    });
    card.appendChild(why);
    wrap.appendChild(card);
  });
  const score = document.createElement("div");
  score.className = "qscore";
  wrap.appendChild(score);
  function maybeComplete(){
    const n = state.answered.filter(Boolean).length;
    score.textContent = "Answered "+n+"/"+qs.length+" · "+state.correct+" correct";
    if (n === qs.length){
      if (!done[pid]){ done[pid] = true; save(); buildNav(); updateProgress(); }
      score.textContent += "  —  module complete ✓";
    }
  }
  return wrap;
}

function go(idx){
  current = idx;
  const p = DATA.pages[idx];
  const c = document.getElementById("content");
  c.innerHTML = '<div class="pagehdr">'+p.group+'</div><h2></h2>';
  c.querySelector("h2").textContent = p.title;
  const body = document.createElement("div");
  body.innerHTML = mdToHtml(p.md);
  c.appendChild(body);
  attachCopy(c);
  const quiz = renderQuiz(p.id);
  if (quiz) c.appendChild(quiz);
  // prev/next
  const nb = document.createElement("div");
  nb.className = "navbtns";
  const prev = document.createElement("button");
  prev.textContent = "← Previous"; prev.disabled = idx===0;
  prev.onclick = ()=>go(idx-1);
  const next = document.createElement("button");
  next.className = "next";
  next.textContent = idx===DATA.pages.length-1 ? "Finish ✓" : "Next →";
  next.disabled = idx===DATA.pages.length-1 && !!done[p.id];
  next.onclick = ()=>{ if(idx<DATA.pages.length-1) go(idx+1); else { done[p.id]=true; save(); buildNav(); updateProgress(); } };
  nb.appendChild(prev); nb.appendChild(next);
  c.appendChild(nb);
  buildNav();
  updateProgress();
  window.scrollTo(0,0);
  document.getElementById("main").scrollTo && document.getElementById("main").scrollTo(0,0);
}

document.getElementById("search").addEventListener("input", e => doSearch(e.target.value));

buildNav();
updateProgress();
go(0);
</script>
</body>
</html>
"""

out = TEMPLATE.replace("__RENDER_JS__", render_js).replace("__DATA__", data_json)
outpath = os.path.join(ROOT, "index.html")
with open(outpath, "w", encoding="utf-8") as f:
    f.write(out)
print("Wrote", outpath, "(", len(out), "bytes )")
print("Pages:", len(pages), "| Quiz sets:", len(quizzes),
      "| Total questions:", sum(len(v) for v in quizzes.values()))
