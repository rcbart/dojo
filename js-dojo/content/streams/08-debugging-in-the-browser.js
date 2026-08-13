STREAMS.push({icon:'🔍',title:'Debugging in the Browser',blurb:'The tools that replace console.log: the Sources panel and every kind of breakpoint, the scope and call-stack panes, blackboxing and source maps, the Network panel and how to read a request, storage and cookies — and a full walkthrough of tracing an OAuth/OIDC redirect flow end to end.',lessons:[

{id:'js30',title:'The Sources panel and breakpoints',body:`
<p>A breakpoint pauses execution and lets you inspect <b>every variable in scope at that moment</b>. That
is strictly more information than any <code>console.log</code>, obtained without editing code, without a
reload, and without deciding in advance what you wanted to see.</p>

<h4>Getting there</h4>
<p>Open DevTools (F12, or Cmd-Option-I on macOS), choose <b>Sources</b>, find your file in the file tree
on the left, and click a line number in the gutter. Reload or trigger the code; execution stops on that
line with the whole state available.</p>
<div class="codeSample" data-hl>// or put the breakpoint in the code itself:
function calculate(a, b) {
  debugger;                 // pauses HERE whenever DevTools is open,
  return a + b;             // and is ignored when it is closed
}
// useful for code that is hard to find in the file tree, or that only
// exists briefly. remove it before committing - a linter rule helps.</div>

<h4>The four panes, and what each answers</h4>
<div class="codeSample" data-hl>SCOPE       every variable visible right now, grouped Local / Closure /
            Global. THIS IS THE ONE. it shows you what you did not think
            to log - including closure variables you cannot otherwise reach.

CALL STACK  who called this, and who called them. click any frame to jump
            to it AND see that frame's scope at the moment it called down.

WATCH       expressions re-evaluated at every pause: user?.address?.city,
            items.length, whatever question you keep asking.

BREAKPOINTS every breakpoint set, toggleable without losing them.</div>

<h4>Stepping</h4>
<div class="codeSample" data-hl>Resume        F8    run until the next breakpoint
Step over     F10   run this line, do NOT descend into calls
Step into     F11   descend into the function on this line
Step out    Shift-F11  finish this function, pause at its caller
Step          F9    the next statement, wherever it is

// the usual rhythm: step OVER by default, and step INTO only when you
// suspect the call on this line. stepping into everything is how an
// afternoon disappears inside library code.</div>

<h4>Breakpoints beyond the plain kind</h4>
<p>These are the ones that turn debugging from tedious to quick, and most people never use them.</p>
<p><b>Conditional</b> — right-click a line number, "Add conditional breakpoint", enter an expression such
as <code>user.id === 4172</code>. It pauses only when that is true. Indispensable inside a loop over ten
thousand rows.</p>
<p><b>Logpoint</b> — same menu, "Add logpoint". Logs an expression and <b>keeps going</b>: a
<code>console.log</code> you did not have to add to the source, cannot forget to remove, and can change
without a rebuild.</p>
<p><b>DOM breakpoint</b> — in Elements, right-click a node: break on subtree modification, attribute
change, or removal. The answer to "what is changing this element?" when you have no idea which code does
it.</p>
<p><b>XHR/fetch breakpoint</b> — in Sources, "XHR/fetch Breakpoints", add a URL fragment. Pauses when a
matching request is <i>about to be sent</i>, with the call stack showing exactly what triggered it.</p>
<p><b>Event listener breakpoint</b> — break on any <code>click</code>, or any <code>submit</code>, across
the whole page, without knowing which handler is attached.</p>
<p><b>Pause on exceptions</b> — the ⏸ icon with the stop sign. Pauses at the moment an error is thrown,
with the state intact. Tick "Pause on caught exceptions" as well when something is being swallowed by a
<code>catch</code> and you cannot find where.</p>

<h4>Why this beats logging</h4>
<p>A log answers the one question you thought of, after a reload, and only for values you can serialise.
A breakpoint answers <b>every</b> question about that moment — including ones you only think of once you
are looking — and lets you walk the call stack to see how you got there. Logging is still useful for
things you cannot pause on: production, timing-sensitive code, or a bug you can only reproduce once.</p>`,
docs:[['Chrome DevTools — debug JavaScript','https://developer.chrome.com/docs/devtools/javascript'],['Chrome DevTools — breakpoints','https://developer.chrome.com/docs/devtools/javascript/breakpoints'],['MDN — Firefox Debugger','https://firefox-source-docs.mozilla.org/devtools-user/debugger/']],
ex:{title:'Choose the right breakpoint',lang:'js',
run:{call:'breakpointFor',cases:[
 {name:'a bug on one specific record out of thousands',args:['one-record-in-a-loop'],expect:'conditional'},
 {name:'you want a value logged without editing the file',args:['log-without-editing'],expect:'logpoint'},
 {name:'an element changes and you cannot find the code',args:['element-changing'],expect:'dom'},
 {name:'you want to know what triggered a request',args:['who-sent-this-request'],expect:'xhr'},
 {name:'an error is thrown somewhere unknown',args:['error-somewhere'],expect:'pause-on-exceptions'},
 {name:'a click handler you cannot locate',args:['unknown-click-handler'],expect:'event-listener'},
 {name:'anything else starts with a plain line breakpoint',args:['zzz'],expect:'line'}]},
prompt:`Write <code>function breakpointFor(situation)</code> mapping a situation to the breakpoint that solves it: <code>"one-record-in-a-loop"</code>&rarr;<code>"conditional"</code>; <code>"log-without-editing"</code>&rarr;<code>"logpoint"</code>; <code>"element-changing"</code>&rarr;<code>"dom"</code>; <code>"who-sent-this-request"</code>&rarr;<code>"xhr"</code>; <code>"error-somewhere"</code>&rarr;<code>"pause-on-exceptions"</code>; <code>"unknown-click-handler"</code>&rarr;<code>"event-listener"</code>; anything else&rarr;<code>"line"</code>.`,
starter:`function breakpointFor(situation) {
  return null;
}`,
solution:`function breakpointFor(situation) {
  switch (situation) {
    case "one-record-in-a-loop":   return "conditional";
    case "log-without-editing":    return "logpoint";
    case "element-changing":       return "dom";
    case "who-sent-this-request":  return "xhr";
    case "error-somewhere":        return "pause-on-exceptions";
    case "unknown-click-handler":  return "event-listener";
    default:                       return "line";
  }
}`,
tests:[{d:'conditional for a single record',re:'"conditional"'},{d:'logpoint for logging without editing',re:'"logpoint"'},{d:'DOM breakpoint for element changes',re:'"dom"'},{d:'XHR breakpoint to find the caller',re:'"xhr"'},{d:'pause on exceptions for an unknown throw',re:'"pause-on-exceptions"'}],
behavior:`Seven situations execute. The three worth memorising are conditional (a loop with one bad record), XHR (what triggered this request) and pause-on-exceptions (where is this thrown) — between them they cover most of the debugging that otherwise turns into scattering log statements.`,
hints:['One case per breakpoint type, with a default.','A logpoint logs and continues; a conditional pauses selectively.','The plain line breakpoint is the fallback for everything else.']}},

{id:'js31',title:'Scope, call stack, blackboxing and source maps',body:`
<p>Setting a breakpoint is easy. Getting useful information out of the pause is the skill, and four
features do most of that work.</p>

<h4>Reading the Scope pane</h4>
<div class="codeSample" data-hl>Local      the current function's parameters and variables, and 'this'
Closure    variables captured from enclosing functions - one group PER
           enclosing scope, labelled with the function name
Script     module-level bindings
Global     window / globalThis

// the Closure group is the one you cannot get any other way. it makes
// the closures stream concrete: you can SEE the captured binding and
// watch it change between iterations.</div>
<p>Anything visible here can be typed into the Console while paused — the Console evaluates <b>in the
paused frame's scope</b>, so you can call functions, read closure variables and test a fix before
editing anything.</p>

<h4>Walking the call stack</h4>
<p>Clicking a frame moves you to it and <b>re-populates the Scope pane with that frame's state</b>. So
when a function receives a bad argument, you do not guess where it came from — you click the caller and
look at what it passed. Two more items on the right-click menu are worth knowing: <b>Restart frame</b>
re-runs the current function from the top without reloading the page, and <b>Copy stack trace</b> gets
you the whole thing for a bug report.</p>

<h4>Blackboxing: hiding the code that is not yours</h4>
<p>An error inside React or lodash gives you fifteen library frames above your own, and stepping walks
straight into them. Right-click a file in the stack and choose <b>"Add script to ignore list"</b> (or
match a pattern such as <code>/node_modules/</code> in Settings):</p>
<div class="codeSample" data-hl>WITHOUT ignore list        WITH ignore list
  at forEach (lodash)        at renderUser (profile.js:18)   &lt;- your code,
  at map (lodash)            at loadProfile (app.js:203)         at the top
  at invoke (react-dom)
  at renderUser (profile.js:18)   &lt;- buried
// and stepping now steps THROUGH library code instead of into it.</div>
<p>This is the single highest-value DevTools setting for anyone working in a framework, and it is off by
default.</p>

<h4>Source maps</h4>
<p>The JavaScript running in production is bundled, minified and often transpiled, so a stack trace points
at <code>main.4f2a.js:1:28471</code>. A <b>source map</b> is a separate file mapping those positions back
to your original files, and DevTools applies it automatically — so you set breakpoints in your real
source and see your real variable names.</p>
<div class="codeSample" data-hl>// when the map is missing or wrong, the symptoms are recognisable:
//   breakpoints do not bind, or bind to the wrong line
//   variable names are single letters
//   the Sources tree shows the bundle instead of your files
// check: DevTools Console -> any "Source map error" warnings
//        the //# sourceMappingURL comment at the end of the bundle
//        that the .map file actually deploys and is reachable

// SECURITY: a source map exposes your original source. serve them only
// to your team (an internal host, or upload them to your error tracker)
// rather than publishing them alongside the bundle.</div>

<h4>Local overrides and workspaces</h4>
<p>Two features that turn DevTools into an editing environment. <b>Overrides</b> let you save a modified
version of a file DevTools serves in place of the real one, so you can test a fix against production
without deploying. <b>Workspaces</b> map served files to a folder on disk, so edits in the Sources panel
write straight to your source. Both are enormous time-savers and almost unknown.</p>`,
docs:[['Chrome DevTools — ignore list','https://developer.chrome.com/docs/devtools/settings/ignore-list'],['Chrome DevTools — local overrides','https://developer.chrome.com/docs/devtools/overrides'],['MDN — Source maps','https://developer.mozilla.org/en-US/docs/Glossary/Source_map']],
ex:{title:'Diagnose a breakpoint that will not bind',lang:'js',
run:{call:'diagnoseSourceMap',cases:[
 {name:'single-letter variables mean no map is applied',args:[false,true,true],expect:'source map not applied'},
 {name:'the map is referenced but missing',args:[true,false,true],expect:'map file not reachable'},
 {name:'the map is stale relative to the bundle',args:[true,true,false],expect:'map is stale, rebuild'},
 {name:'everything is in order',args:[true,true,true],expect:'look elsewhere'}]},
prompt:`Write <code>function diagnoseSourceMap(hasSourceMappingComment, mapFileReachable, mapMatchesBundle)</code>. No <code>sourceMappingURL</code> comment at all &rarr; <code>"source map not applied"</code>. Comment present but the file cannot be fetched &rarr; <code>"map file not reachable"</code>. Fetched but out of date &rarr; <code>"map is stale, rebuild"</code>. All three fine &rarr; <code>"look elsewhere"</code>.`,
starter:`function diagnoseSourceMap(hasSourceMappingComment, mapFileReachable, mapMatchesBundle) {
  return null;
}`,
solution:`function diagnoseSourceMap(hasSourceMappingComment, mapFileReachable, mapMatchesBundle) {
  if (!hasSourceMappingComment) return "source map not applied";
  if (!mapFileReachable) return "map file not reachable";
  if (!mapMatchesBundle) return "map is stale, rebuild";
  return "look elsewhere";              // the maps are fine; the bug is not here
}`,
tests:[{d:'checks for the sourceMappingURL comment first',re:'!\\s*hasSourceMappingComment'},{d:'then whether the map can be fetched',re:'!\\s*mapFileReachable'},{d:'then whether it matches the bundle',re:'!\\s*mapMatchesBundle'},{d:'otherwise the problem is elsewhere',re:'"look elsewhere"'}],
behavior:`The guards run in the order you would actually check them: no point testing whether a map is stale before confirming one is referenced at all. The final case is the honest one — when the tooling is fine, stop debugging the tooling.`,
hints:['Guard clauses in the order you would check them in real life.','The comment must exist before the file can matter.','All three fine means the source maps are not your problem.']}},

{id:'js32',title:'The Network panel',body:`
<p>Most "JavaScript bugs" in a real application are data problems. Before debugging the code that
processes a response, confirm what the response actually was — and the Network panel is where that takes
thirty seconds.</p>

<h4>Setting it up</h4>
<div class="codeSample" data-hl>[x] Preserve log      keep entries across navigations. ESSENTIAL for
                      redirect flows, or everything vanishes on each hop.
[x] Disable cache     while DevTools is open, so you see real requests.
    Filter: Fetch/XHR to hide images, fonts and stylesheets
    Throttling: Slow 3G to expose race conditions and missing spinners</div>

<h4>Reading one request</h4>
<div class="codeSample" data-hl>Headers   general (URL, method, status), request and response headers.
          where you check Authorization, Content-Type, Set-Cookie, CORS.
Payload   what you SENT. the fastest way to find out that the field is
          named user_id and you sent userId.
Response  the RAW body. Preview renders JSON; Response shows the truth -
          including an HTML error page arriving where you expected JSON.
Timing    queued / DNS / TLS / waiting (TTFB) / downloading. distinguishes
          "the server is slow" from "we sent it late".
Initiator THE UNDERUSED ONE: the call stack that caused this request.
          answers "what code sent this?" without any breakpoint.</div>

<h4>The status codes that mean something specific</h4>
<div class="codeSample" data-hl>(failed) / net::ERR   never reached the server. DNS, TLS, offline, or
                      blocked by an extension or CSP.
0 / opaque            usually CORS. see below.
301 / 302 / 307       a redirect. with Preserve log ON you see the whole chain.
304                   not modified - served from cache. not an error.
401                   not authenticated. check the Authorization header
                      was actually attached.
403                   authenticated but not permitted. a DIFFERENT problem.
404                   check the URL in Headers, not the one in your code.
429                   rate limited. look for Retry-After.
5xx                   the server. the bug is probably not in your JS.</div>

<h4>CORS, read correctly</h4>
<p>CORS failures are the most misdiagnosed thing in browser development, so be precise about what they
are: the request usually <b>succeeded</b> and the <i>browser</i> refused to let your JavaScript read the
response, because the server did not say it was allowed to.</p>
<div class="codeSample" data-hl>// the tells:
//   the Console message names CORS explicitly - read it, it says WHICH
//     header was missing or wrong
//   the Network panel shows the request, often with a 200
//   an OPTIONS request appears first (the PREFLIGHT) for anything that
//     is not a simple GET/POST, or that carries custom headers

// what has to be true, and it is the SERVER's job, not yours:
Access-Control-Allow-Origin: https://your-app.example   (or *)
Access-Control-Allow-Credentials: true   // if you send cookies -
                                          // and then Origin CANNOT be *
Access-Control-Allow-Headers: authorization, content-type

// so: you cannot fix CORS in front-end code. changing your fetch options
// changes which rules apply, not whether they are enforced.</div>

<h4>Two more habits</h4>
<p><b>Copy as cURL</b> — right-click any request. You get the exact call, headers and all, to replay in a
terminal or hand to a backend engineer. It removes every "works for me" argument in one step.</p>
<p><b>Check the request, not your intention.</b> The panel shows what was actually sent. A surprising
number of bugs are a stale token, a missing header, or a URL built from an undefined variable that
stringified into the path.</p>`,
docs:[['Chrome DevTools — Network','https://developer.chrome.com/docs/devtools/network'],['MDN — CORS','https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS'],['MDN — HTTP status codes','https://developer.mozilla.org/en-US/docs/Web/HTTP/Status']],
ex:{title:'Triage from the Network panel',lang:'js',
run:{call:'triage',cases:[
 {name:'never reached the server',args:['failed'],expect:'network, DNS, TLS or blocked by CSP'},
 {name:'blocked by the browser after a response',args:['cors'],expect:'server must send the CORS headers'},
 {name:'not authenticated',args:[401],expect:'no valid credential was attached'},
 {name:'authenticated but not permitted',args:[403],expect:'the credential is valid but lacks permission'},
 {name:'wrong URL',args:[404],expect:'check the URL actually sent'},
 {name:'rate limited',args:[429],expect:'back off and read Retry-After'},
 {name:'server error',args:[500],expect:'the server failed, not your JavaScript'},
 {name:'success',args:[200],expect:'the request was fine, look at the body'}]},
prompt:`Write <code>function triage(status)</code>. <code>"failed"</code>&rarr;<code>"network, DNS, TLS or blocked by CSP"</code>; <code>"cors"</code>&rarr;<code>"server must send the CORS headers"</code>; <code>401</code>&rarr;<code>"no valid credential was attached"</code>; <code>403</code>&rarr;<code>"the credential is valid but lacks permission"</code>; <code>404</code>&rarr;<code>"check the URL actually sent"</code>; <code>429</code>&rarr;<code>"back off and read Retry-After"</code>; <code>500</code>&rarr;<code>"the server failed, not your JavaScript"</code>; anything else&rarr;<code>"the request was fine, look at the body"</code>.`,
starter:`function triage(status) {
  return null;
}`,
solution:`function triage(status) {
  switch (status) {
    case "failed": return "network, DNS, TLS or blocked by CSP";
    case "cors":   return "server must send the CORS headers";
    case 401:      return "no valid credential was attached";
    case 403:      return "the credential is valid but lacks permission";
    case 404:      return "check the URL actually sent";
    case 429:      return "back off and read Retry-After";
    case 500:      return "the server failed, not your JavaScript";
    default:       return "the request was fine, look at the body";
  }
}`,
tests:[{d:'distinguishes a failed connection',re:'"failed"'},{d:'names CORS as a server-side fix',re:'"cors"'},{d:'separates 401 from 403',re:'401'},{d:'403 is a different problem',re:'403'},{d:'429 means back off',re:'429'}],
behavior:`Note that the switch mixes a string and numbers, and switch uses === — so "401" as a string would not match 401. Eight cases execute. The 401/403 split is the one that saves the most time: one means the credential did not arrive, the other means it arrived and was not enough, and they lead to completely different investigations.`,
hints:['A switch handles both the string and numeric cases.','401 and 403 mean different things and must not share a branch.','The default covers success — the bug is then in the body or your parsing.']}},

{id:'js33',title:'Storage, cookies, and tracing an OAuth flow end to end',body:`
<p>This lesson puts the whole panel set to work on the flow that most often needs it. If you have worked
through IdentityDojo, this is the same Authorization Code flow seen from the browser's side.</p>

<h4>The Application panel</h4>
<div class="codeSample" data-hl>Cookies         per origin: name, value, Domain, Path, Expires, HttpOnly,
                Secure, SameSite. an HttpOnly cookie appears HERE but is
                invisible to document.cookie - that is the point of it.
Local Storage   persists until cleared. readable by any script on the origin.
Session Storage cleared when the tab closes. same script exposure.
Clear storage   the reset button for "it works in a private window".</div>
<p>"Works in incognito but not normally" almost always means stale storage or a stale cookie. Clear
storage first; it takes five seconds and settles the question.</p>

<h4>Tracing the redirect flow</h4>
<p><b>Turn on Preserve log before you start.</b> Without it every navigation wipes the panel and you see
only the final hop — which is the reason most people find these flows impossible to debug.</p>
<div class="codeSample" data-hl>1. GET /authorize?...      to the authorization server (a NAVIGATION)
     check the query: response_type=code, client_id, redirect_uri,
     scope, state, code_challenge, code_challenge_method=S256
     -> a missing code_challenge means PKCE is not actually on

2. the login and consent pages     (the AS's own pages)

3. 302 back to your redirect_uri?code=...&state=...
     check state MATCHES what you sent in step 1
     the code is in the URL, so it is in history and the Referer -
     which is exactly why it is single-use and short-lived

4. POST /token                     (Fetch/XHR, from YOUR code)
     Payload: grant_type=authorization_code, code, redirect_uri,
              client_id, code_verifier
     -> the code_verifier is the other half of PKCE
     Response: access_token, id_token, expires_in, refresh_token?

5. GET /api/...  with  Authorization: Bearer ...
     check the header is actually attached. this is where it usually
     is not.</div>

<h4>What goes wrong, and where each shows up</h4>
<div class="codeSample" data-hl>redirect_uri_mismatch   step 1 or 3. compare the sent value against the
                        registered one CHARACTER BY CHARACTER - a trailing
                        slash or http vs https is enough.
invalid_grant  at 4     the code was already used, expired, or the
                        code_verifier does not match the challenge.
                        also: a double-mounted component redeeming twice.
state mismatch          step 3. usually storage cleared between hops, or
                        two flows started in different tabs.
401 at step 5           expand the request headers. no Authorization
                        header at all is the common answer - the token
                        was still being fetched when the call went out.
CORS on /token          the AS must allow your origin. cannot be fixed
                        in your code.
loops back to login     the session cookie is not being set: check
                        SameSite and Secure in Application -> Cookies.</div>

<h4>Two DevTools tricks specific to this</h4>
<p><b>XHR breakpoint on <code>/token</code></b> pauses right before the exchange, with the call stack
showing which component triggered it — the fastest way to catch a double redemption.</p>
<p><b>Decode the tokens.</b> Copy the <code>id_token</code> from the Network response and decode it
locally — <code>JSON.parse(atob(t.split(".")[1]))</code> in the Console works and, unlike pasting into a
website, does not hand a live credential to a third party. Check <code>iss</code>, <code>aud</code>,
<code>exp</code> and <code>nonce</code>. Decoding is not verifying; the signature is the server's job.</p>
<p>And the security note that belongs here: <b>never paste a real token into an online decoder.</b> It is
a live credential, and you have just given it away.</p>`,
docs:[['Chrome DevTools — Application panel','https://developer.chrome.com/docs/devtools/storage/localstorage'],['MDN — Set-Cookie','https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie'],['RFC 6749 — OAuth 2.0','https://www.rfc-editor.org/rfc/rfc6749'],['RFC 7636 — PKCE','https://www.rfc-editor.org/rfc/rfc7636']],
exs:[
{title:'Locate the OAuth failure',lang:'js',
run:{call:'whereToLook',cases:[
 {name:'redirect_uri_mismatch is an authorize-request problem',args:['redirect_uri_mismatch'],expect:'compare the sent redirect_uri with the registered one'},
 {name:'invalid_grant is a token-exchange problem',args:['invalid_grant'],expect:'the code was reused, expired, or the verifier does not match'},
 {name:'a state mismatch is a storage problem',args:['state_mismatch'],expect:'storage was cleared or two flows overlapped'},
 {name:'a 401 on the API means the header is missing',args:['api_401'],expect:'check the Authorization header was attached'},
 {name:'looping back to login is a cookie problem',args:['login_loop'],expect:'check SameSite and Secure on the session cookie'},
 {name:'anything else',args:['zzz'],expect:'turn on Preserve log and walk the chain'}]},
prompt:`Write <code>function whereToLook(symptom)</code> mapping an OAuth symptom to where to look: <code>"redirect_uri_mismatch"</code>&rarr;<code>"compare the sent redirect_uri with the registered one"</code>; <code>"invalid_grant"</code>&rarr;<code>"the code was reused, expired, or the verifier does not match"</code>; <code>"state_mismatch"</code>&rarr;<code>"storage was cleared or two flows overlapped"</code>; <code>"api_401"</code>&rarr;<code>"check the Authorization header was attached"</code>; <code>"login_loop"</code>&rarr;<code>"check SameSite and Secure on the session cookie"</code>; anything else&rarr;<code>"turn on Preserve log and walk the chain"</code>.`,
starter:`function whereToLook(symptom) {
  return null;
}`,
solution:`function whereToLook(symptom) {
  switch (symptom) {
    case "redirect_uri_mismatch":
      return "compare the sent redirect_uri with the registered one";
    case "invalid_grant":
      return "the code was reused, expired, or the verifier does not match";
    case "state_mismatch":
      return "storage was cleared or two flows overlapped";
    case "api_401":
      return "check the Authorization header was attached";
    case "login_loop":
      return "check SameSite and Secure on the session cookie";
    default:
      return "turn on Preserve log and walk the chain";
  }
}`,
tests:[{d:'redirect_uri_mismatch',re:'"redirect_uri_mismatch"'},{d:'invalid_grant',re:'"invalid_grant"'},{d:'state_mismatch',re:'"state_mismatch"'},{d:'api_401',re:'"api_401"'},{d:'login_loop',re:'"login_loop"'}],
behavior:`Six symptoms execute. The default is the real lesson: when you do not recognise the symptom, turn on Preserve log and walk the chain from /authorize to the API call, because every one of these is visible in the Network panel if the panel is still holding the earlier hops.`,
hints:['One case per symptom, with a default that describes the general method.','invalid_grant is always at the token exchange, never at authorize.','The default should describe what to do when you do not recognise the error.']},
{title:'Decode a JWT payload safely',lang:'js',
run:{call:'decodePayload',cases:[
 {name:'decodes the middle segment',args:['aaa.eyJzdWIiOiJhZGEifQ.sig'],expect:{sub:'ada'}},
 {name:'decodes several claims',args:['h.eyJpc3MiOiJhcyIsImF1ZCI6ImFwaSJ9.s'],expect:{iss:'as',aud:'api'}},
 {name:'too few segments returns null',args:['aaa.bbb'],expect:null},
 {name:'a non-token string returns null',args:['nope'],expect:null},
 {name:'an undecodable payload returns null',args:['a.!!!.c'],expect:null}]},
prompt:`Write <code>function decodePayload(token)</code> that splits a JWT on <code>"."</code>, base64-decodes the <b>middle</b> segment with <code>atob</code> and parses it as JSON. Return <code>null</code> if there are not exactly three segments, or if decoding or parsing fails. Remember: decoding is not verifying.`,
starter:`function decodePayload(token) {
  return null;
}`,
solution:`function decodePayload(token) {
  const parts = token.split(".");
  if (parts.length !== 3) return null;      // header.payload.signature
  try {
    return JSON.parse(atob(parts[1]));      // the MIDDLE segment
  } catch {
    return null;                             // atob or JSON.parse threw
  }
}`,
tests:[{d:'splits on the dot',re:'split\\s*\\(\\s*"\\."'},{d:'requires exactly three segments',re:'length\\s*!==\\s*3'},{d:'decodes the middle segment',re:'parts\\[1\\]|\\[1\\]'},{d:'guards against bad input',re:'catch'}],
behavior:`Five cases execute, including two that throw without the try/catch — atob rejects invalid base64 and JSON.parse rejects the result. This is the Console one-liner from the lesson, hardened. It reads a token without sending it anywhere, which is the entire reason not to use an online decoder on a live credential.`,
hints:['A JWT is three dot-separated segments; the payload is the middle one.','atob decodes base64, and it throws on invalid input.','Wrap the decode and parse together in one try/catch.']}]}

]});
