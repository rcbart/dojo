#!/usr/bin/env python3
"""Build a single self-contained interactive index.html for the Envoy crash course."""
import json, os, re, html

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # envoy-crash-course/
WEB = os.path.join(ROOT, "web")

# (id, source_path, title, group)
PAGES = [
    ("setup-local-envoy",                    os.path.join(WEB, "setup-local-envoy.md"),                     "Setup — run Envoy locally",            "Get started"),
    ("primer-what-is-a-proxy",               os.path.join(WEB, "primer-what-is-a-proxy.md"),                "Primer — What is a proxy?",            "Get started"),
    ("primer-service-mesh",                  os.path.join(WEB, "primer-service-mesh.md"),                   "Primer — Service meshes",              "Get started"),
    ("00-what-is-envoy",                     os.path.join(WEB, "00-what-is-envoy.md"),                     "0 · What Envoy is",                    "Fundamentals"),
    ("01-architecture-and-request-lifecycle",os.path.join(WEB, "01-architecture-and-request-lifecycle.md"),"1 · Architecture & request flow",     "Fundamentals"),
    ("02-lab-first-static-config",           os.path.join(WEB, "02-lab-first-static-config.md"),           "2 · Lab: your first Envoy",            "Fundamentals"),
    ("03-listeners-filter-chains-tls",       os.path.join(WEB, "03-listeners-filter-chains-tls.md"),       "3 · Listeners, filter chains & TLS",   "Fundamentals"),
    ("04-http-routing-and-filters",          os.path.join(WEB, "04-http-routing-and-filters.md"),          "4 · HTTP routing & filters",           "Fundamentals"),
    ("11-rate-limiting-ext-authz",           os.path.join(WEB, "11-rate-limiting-ext-authz.md"),           "4b · Rate limiting & ext_authz",       "Fundamentals"),
    ("05-clusters-load-balancing-resilience",os.path.join(WEB, "05-clusters-load-balancing-resilience.md"),"5 · Clusters, LB & resilience",       "Fundamentals"),
    ("06-observability-and-admin",           os.path.join(WEB, "06-observability-and-admin.md"),           "6 · Observability & admin",            "Fundamentals"),
    ("07-dynamic-config-xds",                os.path.join(WEB, "07-dynamic-config-xds.md"),                "7 · Dynamic config (xDS)",             "Fundamentals"),
    ("08-envoy-on-kubernetes",               os.path.join(WEB, "08-envoy-on-kubernetes.md"),               "8 · Envoy on Kubernetes",              "Platform"),
    ("09-service-mesh-sidecars",             os.path.join(WEB, "09-service-mesh-sidecars.md"),             "9 · Service mesh & sidecars",          "Platform"),
    ("10-debugging-gotchas-next-steps",      os.path.join(WEB, "10-debugging-gotchas-next-steps.md"),      "10 · Debugging & next steps",          "Platform"),
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
    md = re.sub(r"\]\((?:\.\./)?labs/([^)]+?)\.(yaml|yml|json)\)",
                r"](https://github.com/rcbart/dojo/blob/main/envoy-crash-course/labs/\1.\2)", md)
    md = re.sub(r"\]\((?:\.\./)?labs/([^)]+?)/?\)",
                r"](https://github.com/rcbart/dojo/tree/main/envoy-crash-course/labs/\1)", md)
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
data_json = data_json.replace("</script", "<\\/script")  # SCRIPT-SAFE: valid JSON escape, inert in strings

TEMPLATE = r"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Envoy Crash Course</title>
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
  .pathnav{padding:12px 14px 14px;border-bottom:1px solid var(--line);margin-bottom:6px}
  .pathnav .pn-head{display:block;font-size:10.5px;text-transform:uppercase;letter-spacing:1px;
    font-weight:800;color:var(--muted);margin:0 6px 8px}
  .pathnav .pn-item{display:flex;align-items:center;gap:9px;padding:6px 8px;border-radius:7px;
    font-size:13px;font-weight:600;color:var(--muted);text-decoration:none}
  .pathnav a.pn-item:hover{background:rgba(255,255,255,.06);color:var(--teal)}
  .pathnav .pn-item b{display:inline-flex;align-items:center;justify-content:center;
    width:19px;height:19px;border-radius:5px;font-size:11px;font-weight:800;
    background:rgba(255,255,255,.08);color:var(--muted);flex:0 0 auto}
  .pathnav .pn-here{color:var(--teal);background:rgba(255,255,255,.07)}
  .pathnav .pn-here b{background:var(--teal);color:#0b1020}
  .pathnav a.pn-item:focus-visible{outline:2px solid var(--teal);outline-offset:2px}
  .pathlinks{padding:14px 20px 4px;border-top:1px solid var(--line);margin-top:12px;
    font-size:12px;color:var(--muted);line-height:1.9}
  .pathlinks a{color:var(--muted)} .pathlinks a:hover{color:var(--teal)}
  .pathlinks .pl-here{color:var(--teal);font-weight:700}
  .pathlinks .pl-head{display:block;font-size:10.5px;text-transform:uppercase;letter-spacing:1px;
    font-weight:800;color:var(--muted);margin-bottom:2px}
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
  pre.code .explain{position:absolute;top:8px;right:58px;width:22px;height:22px;line-height:1;
    background:var(--panel2);color:var(--teal);border:1px solid var(--line);border-radius:50%;
    font-size:12px;font-weight:700;cursor:pointer;padding:0}
  pre.code .explain:hover{color:#fff;border-color:var(--teal);background:var(--teal-dim)}
  .explanation{background:var(--panel);border:1px solid var(--teal-dim);border-left:3px solid var(--teal);
    border-radius:0 8px 8px 0;padding:12px 14px;margin:-4px 0 14px;font-size:13.5px;line-height:1.55}
  .explanation .eh{color:var(--teal);font-weight:700;font-size:12px;text-transform:uppercase;
    letter-spacing:.6px;margin-bottom:6px}
  .explanation ul{margin:6px 0 0;padding-left:18px}
  .explanation li{margin:3px 0}
  .explanation code{background:var(--code);border:1px solid var(--line);border-radius:4px;padding:.05em .3em;
    font:12.5px/1.4 "SF Mono",Menlo,Consolas,monospace;color:#8be9c9}
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
      <h1>Envoy Crash Course</h1>
      <div class="sub">From zero to service mesh · interactive</div>
    </div>
    <div class="progwrap">
      <div class="progbar"><div class="progfill" id="progfill"></div></div>
      <div class="progtxt" id="progtxt">0% complete</div>
    </div>
    <div class="searchwrap">
      <input id="search" type="search" placeholder="Search the course…" aria-label="Search this course" autocomplete="off">
    </div>
    <div id="results"></div>
    <div class="pathnav">
      <span class="pn-head">The cloud-native path · 5 courses</span>
      <a class="pn-item" href="/fundamentals/"><b>1</b>Fundamentals</a>
      <a class="pn-item" href="/docker/"><b>2</b>Docker</a>
      <a class="pn-item" href="/kubernetes/"><b>3</b>Kubernetes</a>
      <span class="pn-item pn-here"><b>4</b>Envoy</span>
      <a class="pn-item" href="/istio/"><b>5</b>Istio</a>
    </div>
    <nav id="nav"></nav>
    <div class="pathlinks">
      <span class="pl-head" style="margin-top:10px">Course</span>
      <a href="https://github.com/rcbart/dojo/issues/new?labels=bug,envoy&template=bug_report.yml" target="_blank" rel="noopener">Report an issue</a> ·
      <a href="https://roniam.dev/">roniam.dev</a>
    </div>
  </aside>
  <main id="main"><div id="content"></div></main>
</div>

<script>
__RENDER_JS__
</script>
<script>
const DATA = __DATA__;
const KEY = "envoy-course-progress-v1";
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
  root.querySelectorAll("pre.code .explain").forEach(btn => {
    btn.onclick = () => {
      const pre = btn.parentElement;
      let panel = pre.nextElementSibling;
      if (panel && panel.classList.contains("explanation")) { panel.remove(); return; } // toggle off
      const lang = pre.getAttribute("data-lang") || "";
      const code = pre.querySelector("code").innerText;
      panel = document.createElement("div");
      panel.className = "explanation";
      panel.innerHTML = '<div class="eh">What this does</div>' + explainBlock(code, lang);
      pre.parentNode.insertBefore(panel, pre.nextSibling);
    };
  });
}

// ---- plain-English command/config explainer -------------------------------
function esc(s){ return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function code(s){ return "<code>" + esc(s) + "</code>"; }

const CURL_FLAGS = {
  "-k":"accept a self-signed certificate (don't verify TLS)","--insecure":"accept a self-signed certificate",
  "-v":"verbose — also show the connection/headers","-s":"silent — hide the progress meter",
  "-S":"still show errors when silent","-i":"include the response headers in the output",
  "-L":"follow redirects","-o":"save the response to a file","-O":"save using the remote filename",
  "-w":"print a chosen statistic (e.g. the HTTP status code)","-X":"use a specific HTTP method (e.g. POST)",
  "-H":"add a request header","-d":"send a request body (data)","-f":"fail quietly on HTTP errors","--fail":"fail on HTTP errors"
};

function explainCurl(cmd){
  const urls = cmd.match(/https?:\/\/[^\s"']+|localhost:\d+[^\s"']*/g) || [];
  let s = "Sends an HTTP request" + (urls.length ? " to " + code(urls[0]) : "") + " and prints the reply.";
  const notes = [];
  for (const f in CURL_FLAGS) if (new RegExp("(^|\\s)" + f.replace(/[-]/g,"\\-") + "(\\s|=|$)").test(cmd)) notes.push(code(f) + " = " + CURL_FLAGS[f]);
  if (/-X\s*POST|--request\s*POST/.test(cmd)) notes.push("it uses the POST method");
  if (/9901/.test(cmd)) notes.push("port <code>9901</code> is Envoy's admin interface (stats/health/config)");
  if (/10000/.test(cmd)) notes.push("port <code>10000</code> is the Envoy listener your app traffic goes to");
  return { s, notes };
}

function explainOneCommand(cmd){
  const c = cmd.trim();
  const map = [
    [/^docker\s+compose\s+up/, "Starts all the containers defined in this folder's compose file" + (/\-d/.test(c) ? ", in the background." : ".")],
    [/^docker\s+compose\s+down/, "Stops and removes those containers" + (/\-v/.test(c) ? " and deletes their data volumes." : ".")],
    [/^docker\s+compose\s+logs/, "Shows the log output of the running containers."],
    [/^docker\s+compose\s+ps/, "Lists the containers in this compose project."],
    [/^docker\s+compose/, "Runs a Docker Compose command on this folder's stack."],
    [/^docker\s+run/, "Starts a new container from an image."],
    [/^docker\s+build/, "Builds a container image from a Dockerfile."],
    [/^docker\s+exec/, "Runs a command inside an already-running container."],
    [/^docker\s+ps/, "Lists running containers."],
    [/^docker\s+logs/, "Shows a container's log output."],
    [/^docker\s+(stop|start|rm|restart)/, "Controls a container's lifecycle (stop/start/remove)."],
    [/^openssl\s+s_client/, "Opens a TLS connection and prints the certificate the server presents."],
    [/^openssl/, "Runs OpenSSL to create or inspect TLS certificates and keys."],
    [/^chmod\s+\+x/, "Makes the script executable so you can run it."],
    [/^\.\/[\w./-]*gen-certs/, "Runs the script that generates a self-signed TLS certificate and key."],
    [/^\.\//, "Runs the script in the current folder."],
    [/^cd\s/, "Changes into the given directory."],
    [/^kind\s+create\s+cluster/, "Creates a local Kubernetes cluster (running in Docker)."],
    [/^kind\s+delete\s+cluster/, "Deletes the local Kubernetes cluster and everything in it."],
    [/^kubectl\s+apply/, "Creates or updates Kubernetes objects from a file or URL."],
    [/^kubectl\s+get/, "Lists Kubernetes objects (pods, services, etc.)."],
    [/^kubectl\s+wait/, "Waits until a resource reaches a condition (e.g. becomes Ready)."],
    [/^kubectl\s+port-forward/, "Forwards a local port to a service/pod inside the cluster so you can reach it."],
    [/^kubectl\s+-n|^kubectl\s+.*\s-n\s/, "Runs a kubectl command against a specific namespace."],
    [/^kubectl/, "Runs a kubectl command against the cluster."],
    [/^helm\s+install/, "Installs a Helm chart (a packaged app) into the cluster."],
    [/^helm/, "Runs a Helm (Kubernetes package manager) command."],
    [/^echo\b/, /[>]/.test(c) ? "Writes the given text into a file." : "Prints the given text."],
    [/^cat\b/, "Prints the contents of a file."],
    [/^grep\b/, "Filters text, keeping only lines that match the pattern."],
    [/^mkdir\b/, "Creates a directory."]
  ];
  // for-loop repetition
  const loop = c.match(/for\s+\w+\s+in\s+\$\(seq\s+1\s+(\d+)\)/);
  if (loop) {
    const inner = (c.match(/;\s*do\s+(.*?);?\s*done/) || [])[1] || "";
    let innerExpl = inner ? explainOneCommand(inner).replace(/^Sends|^Runs|^Starts/, m=>m.toLowerCase()) : "the command";
    return "Repeats a command <b>" + loop[1] + " times</b> — here it " + innerExpl;
  }
  if (/^curl\b/.test(c)) { const r = explainCurl(c); return r.s + (r.notes.length ? " <span class='nx'></span>" : ""); }
  for (const [re, txt] of map) if (re.test(c)) return txt;
  // piped: explain the head
  if (c.includes("|")) return explainOneCommand(c.split("|")[0]) + " (then the output is filtered/processed by the rest of the pipe).";
  return "Runs " + code(c.split(/\s+/)[0]) + ".";
}

const CONFIG_TERMS = [
  [/admin:/, "an <b>admin interface</b> — Envoy's management endpoint for stats, health, and config"],
  [/listeners?:/, "a <b>listener</b> — the port Envoy accepts incoming traffic on"],
  [/filter_chains?:/, "a <b>filter chain</b> — the pipeline that processes each connection"],
  [/http_connection_manager|HttpConnectionManager/, "the <b>HTTP Connection Manager</b> — parses HTTP and runs the HTTP filters"],
  [/route_config|routes:|virtual_hosts/, "<b>routing rules</b> — which requests go to which backend"],
  [/clusters?:/, "a <b>cluster</b> — a group of backend servers Envoy sends traffic to"],
  [/lb_endpoints|endpoints:/, "<b>endpoints</b> — the actual backend addresses (host:port)"],
  [/transport_socket|DownstreamTlsContext|UpstreamTlsContext|tls/i, "<b>TLS settings</b> — encryption for the connection"],
  [/http_filters/, "<b>HTTP filters</b> — steps each request passes through (e.g. router, auth, fault)"],
  [/HTTPFault|fault:/, "a <b>fault-injection</b> filter — deliberately adds delays/errors for testing"],
  [/health_checks?:/, "<b>health checking</b> — Envoy probes backends and drops unhealthy ones"],
  [/outlier_detection/, "<b>outlier detection</b> — ejects backends that keep returning errors"],
  [/retry_policy|retries/, "a <b>retry policy</b> — retry failed requests on another backend"],
  [/dynamic_resources|lds_config|cds_config/, "<b>dynamic configuration (xDS)</b> — config delivered/updated at runtime"],
  [/apiVersion:.*|kind:\s*Gateway/, "a <b>Kubernetes Gateway API</b> object (ingress configuration)"]
];

function explainConfig(text){
  const found = [];
  for (const [re, txt] of CONFIG_TERMS) if (re.test(text)) found.push(txt);
  if (!found.length) return "<p>A configuration snippet used by this lab. See the surrounding text for what each field does.</p>";
  return "<p>This is a configuration snippet. It sets up:</p><ul>" + found.map(f=>"<li>"+f+"</li>").join("") + "</ul>";
}

function explainBlock(text, lang){
  if (/^(yaml|yml)$/i.test(lang) || (!/^(bash|sh|shell|console)$/i.test(lang) && /(^|\n)\s*(apiVersion:|"@type"|static_resources:|admin:|listeners:|clusters:)/.test(text)))
    return explainConfig(text);
  // shell: join backslash-continued lines, drop comments/blanks
  const raw = text.split("\n"); const lines = []; let buf = "";
  for (const l of raw){ if (/\\\s*$/.test(l)){ buf += l.replace(/\\\s*$/, " "); continue; } buf += l; lines.push(buf); buf = ""; }
  if (buf) lines.push(buf);
  const cmds = lines.map(l=>l.trim()).filter(l=>l && !l.startsWith("#"));
  if (!cmds.length) return "<p>" + esc(text.trim()) + "</p>";
  const items = cmds.map(cmd => {
    let expl = explainOneCommand(cmd);
    let extra = "";
    if (/^curl\b/.test(cmd)) { const r = explainCurl(cmd); if (r.notes.length) extra = "<ul>" + r.notes.map(n=>"<li>"+n+"</li>").join("") + "</ul>"; expl = r.s; }
    return "<li>" + code(cmd.length>70 ? cmd.slice(0,68)+"…" : cmd) + "<br>" + expl + extra + "</li>";
  });
  return "<ul>" + items.join("") + "</ul>";
}
// ---------------------------------------------------------------------------

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
