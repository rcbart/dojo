STREAMS.push({icon:'🌐',title:'The Browser: DOM, Events & fetch',blurb:'Writing for the browser, not just debugging it: the page as a tree of objects you can change, events and the bubbling that makes one listener do the work of a hundred, fetch and the discipline of handling a response properly, and forms, where user input actually comes from.',lessons:[

{id:'jsdom1',title:'The DOM: the page as an object tree',body:`
<p>Everything you see in a browser tab is an object. The HTML you wrote gets parsed into a tree of them,
the <b>Document Object Model</b>, and JavaScript changes the page by changing that tree. There is no
other mechanism. Every framework you will ever meet is, underneath, doing what this lesson does.</p>

<h4>Finding elements</h4>
<div class="codeSample" data-hl>document.querySelector("#save")        // FIRST match, or null
document.querySelectorAll(".row")      // ALL matches (a static NodeList)

// the argument is a CSS selector - the same language you style with:
document.querySelector("nav a.active")
document.querySelector("[data-id='42']")

// older APIs you will read in existing code:
document.getElementById("save")        // fast, id only, no "#"</div>
<p>Two habits save hours. First, <code>querySelector</code> returns <code>null</code> when nothing
matches, and <code>null.textContent</code> throws, so a typo in a selector surfaces as an error one line
<i>later</i> than the mistake. Second, a <code>NodeList</code> is not an array; it has
<code>forEach</code>, but for <code>map</code> or <code>filter</code> spread it first:
<code>[...document.querySelectorAll(".row")]</code>.</p>

<h4>Reading and changing what's there</h4>
<div class="codeSample" data-hl>const el = document.querySelector("#status");

el.textContent = "Saved";        // TEXT. always safe.
el.innerHTML  = "&lt;b&gt;Saved&lt;/b&gt;";  // parses as HTML. NEVER with user input -
                                 // this is how XSS happens (the security
                                 // lesson in the HTTP stream returns to this)
el.classList.add("ok");          // add / remove / toggle / contains
el.style.color = "green";        // inline style - classList usually beats it
el.getAttribute("href")
el.dataset.userId                // data-user-id="7"  ->  "7" (a string!)</div>
<p>The <code>textContent</code> versus <code>innerHTML</code> line is worth a rule: <b>text goes in
through <code>textContent</code>, structure gets built with elements</b>. The convenience of assembling
HTML strings is exactly the vulnerability.</p>

<h4>Creating and removing</h4>
<div class="codeSample" data-hl>const li = document.createElement("li");
li.textContent = user.name;            // safe even when the name is hostile
list.append(li);                       // append / prepend / before / after
li.remove();

// building N rows? build them all, append ONCE - every append can
// trigger layout, and layout is what makes pages feel slow:
const frag = document.createDocumentFragment();
for (const u of users) {
  const li = document.createElement("li");
  li.textContent = u.name;
  frag.append(li);
}
list.append(frag);                     // one layout, not N</div>

<h4>Where the mental model connects</h4>
<p>DOM elements are ordinary objects: references (from the objects stream) explain why two variables
pointing at the same element see each other's changes, and the event loop (from the async stream)
explains why the page repaints only <i>after</i> your handler returns. Nothing here is a new language;
it is the same JavaScript, holding a live page instead of your own data.</p>`,
docs:[['MDN (Introduction to the DOM)','https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction'],['MDN (querySelector)','https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector'],['MDN (textContent vs innerHTML)','https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent']],
ex:{title:'Choose the safe DOM operation',diff:'easy',lang:'js',
run:{call:'domCall',cases:[
 {name:'user text goes in as text',args:['show-user-text'],expect:'textContent'},
 {name:'trusted markup you wrote yourself',args:['insert-own-markup'],expect:'innerHTML'},
 {name:'toggling appearance uses a class',args:['toggle-style'],expect:'classList'},
 {name:'reading a data- attribute',args:['read-data-attribute'],expect:'dataset'},
 {name:'building a new element',args:['create-element'],expect:'createElement'},
 {name:'anything unrecognised is refused',args:['zzz'],expect:'unknown'}]},
prompt:`Write <code>function domCall(task)</code> mapping a task to the right tool: <code>"show-user-text"</code>&rarr;<code>"textContent"</code>, <code>"insert-own-markup"</code>&rarr;<code>"innerHTML"</code>, <code>"toggle-style"</code>&rarr;<code>"classList"</code>, <code>"read-data-attribute"</code>&rarr;<code>"dataset"</code>, <code>"create-element"</code>&rarr;<code>"createElement"</code>, anything else&rarr;<code>"unknown"</code>. The first two are the security decision of the lesson.`,
starter:`function domCall(task) {
  return null;
}`,
solution:`function domCall(task) {
  switch (task) {
    case "show-user-text":      return "textContent";   // text is always safe
    case "insert-own-markup":   return "innerHTML";     // ONLY for markup you wrote
    case "toggle-style":        return "classList";
    case "read-data-attribute": return "dataset";
    case "create-element":      return "createElement";
    default:                    return "unknown";
  }
}`,
tests:[{d:'user text uses textContent',re:'"textContent"'},{d:'own markup may use innerHTML',re:'"innerHTML"'},{d:'styling toggles a class',re:'"classList"'},{d:'unknown tasks are refused',re:'"unknown"'}],
behavior:`Six cases execute. The pair that matters is the first two: textContent treats everything as text, so a hostile name renders as characters on the screen; innerHTML parses, so the same name executes. The rest of the mapping is convention: classList over inline styles, dataset for data- attributes.`,
hints:['A switch over the five tasks plus a default.','User-supplied text is textContent, always.','innerHTML is reserved for markup you authored yourself.']}},

{id:'jsdom2',title:'Events: listening, bubbling and delegation',body:`
<p>A page does nothing until something happens: a click, a keypress, a form submitted. JavaScript's model
for this is simple and it is everywhere: you register a function, the browser calls it when the event
occurs. Every listener is a callback, exactly the shape the async stream taught.</p>

<div class="codeSample" data-hl>button.addEventListener("click", (event) =&gt; {
  event.target       // the element the event actually happened on
  event.currentTarget // the element THIS listener is attached to
  event.preventDefault()   // stop the browser's built-in behavior
});

button.removeEventListener("click", handler);  // needs the SAME function
                                               // reference - an inline arrow
                                               // cannot be removed</div>
<p>The <code>target</code> / <code>currentTarget</code> distinction looks pedantic and is the key to the
whole lesson: click a <code>&lt;b&gt;</code> inside a button, and <code>target</code> is the
<code>&lt;b&gt;</code> while <code>currentTarget</code> is the button.</p>

<h4>Bubbling: events travel upward</h4>
<div class="codeSample" data-hl>&lt;ul id="list"&gt;
  &lt;li data-id="1"&gt;First&lt;/li&gt;      a click on this li fires listeners on:
  &lt;li data-id="2"&gt;Second&lt;/li&gt;       li  ->  ul  ->  body  ->  document
&lt;/ul&gt;                              in that order. that is BUBBLING.

event.stopPropagation()   // stop the climb here (use sparingly - other
                          // code may legitimately be listening above you)</div>

<h4>Delegation: one listener instead of a hundred</h4>
<p>Bubbling is not trivia; it is a technique. Instead of a listener per row, put <b>one</b> listener on
the container and ask <i>which</i> row the event came from:</p>
<div class="codeSample" data-hl>list.addEventListener("click", (e) =&gt; {
  const li = e.target.closest("li");   // walk UP from the target
  if (!li || !list.contains(li)) return;   // clicked the gap between rows
  select(li.dataset.id);
});

// why this wins:
//   - rows added LATER are covered automatically - no re-wiring
//   - one function to debug instead of a hundred registrations
//   - removing a row cannot leak its listener</div>
<p>Delegation is the pattern behind every data table and menu you have used. When an interviewer asks
"a list has ten thousand rows, how do you handle clicks?", this is the answer.</p>

<h4>The events worth knowing by name</h4>
<div class="codeSample" data-hl>click, dblclick            input      fires per keystroke in a field
submit    on the FORM      change     fires when the field commits
keydown   has e.key        DOMContentLoaded   the tree is ready

// and the golden rule from the event-loop stream applies: a handler
// that computes for 300ms freezes the page for 300ms. handlers finish
// fast, or hand the work off.</div>`,
docs:[['MDN (Introduction to events)','https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Events'],['MDN (Event bubbling)','https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Event_bubbling'],['MDN (closest)','https://developer.mozilla.org/en-US/docs/Web/API/Element/closest']],
exs:[
{title:'Which listeners fire, and in what order?',diff:'medium',lang:'js',
run:{call:'bubblePath',cases:[
 {name:'a click on the innermost element bubbles up through its ancestors',args:[['li','ul','body'],'li'],expect:['li','ul','body']},
 {name:'a click on a middle element starts there',args:[['li','ul','body'],'ul'],expect:['ul','body']},
 {name:'a click on the outermost fires only it',args:[['li','ul','body'],'body'],expect:['body']},
 {name:'an element not in the chain fires nothing',args:[['li','ul','body'],'nav'],expect:[]},
 {name:'a single-element chain',args:[['div'],'div'],expect:['div']}]},
prompt:`The chain of ancestors is given innermost-first, like <code>["li", "ul", "body"]</code>. Write <code>function bubblePath(chain, clicked)</code> returning the elements whose listeners fire for a click on <code>clicked</code>, in firing order: the clicked element first, then each ancestor outward. If <code>clicked</code> is not in the chain, nothing fires.`,
starter:`function bubblePath(chain, clicked) {
  return [];
}`,
solution:`function bubblePath(chain, clicked) {
  const start = chain.indexOf(clicked);
  if (start === -1) return [];        // not in this part of the tree
  return chain.slice(start);          // from the target, outward - bubbling
}`,
tests:[{d:'locates the clicked element in the chain',re:'indexOf'},{d:'nothing fires for an element outside the chain',re:'-1'},{d:'returns the tail of the chain from the target outward',re:'\\.slice\\('}],
behavior:`Five cases execute the model: the event starts at the target and visits every ancestor above it, which is why a listener on the container hears clicks on rows that did not exist when the listener was attached, the fact delegation is built on.`,
hints:['Find where the clicked element sits in the chain.','slice from that index gives the upward path.','Not found means an empty result, not an error.']},
{title:'Delegate clicks from one listener',diff:'hard',lang:'js',
run:{call:'delegate',cases:[
 {name:'a click inside a row resolves to that row id',args:[[['b','7'],['li','7'],['ul',null]],'li'],expect:'7'},
 {name:'the row itself was clicked directly',args:[[['li','3'],['ul',null]],'li'],expect:'3'},
 {name:'a click on the container, between rows, is ignored',args:[[['ul',null]],'li'],expect:null},
 {name:'a click outside any matching element is ignored',args:[[['span',null],['div',null]],'li'],expect:null},
 {name:'the NEAREST matching ancestor wins',args:[[['b','9'],['li','9'],['li','1'],['ul',null]],'li'],expect:'9'}]},
prompt:`The path from the clicked element upward is given as pairs of <code>[tagName, dataId]</code>, innermost first, modeling <code>e.target</code> and its ancestors. Write <code>function delegate(path, matchTag)</code> that does what <code>e.target.closest(matchTag)</code> does: walk up the path, find the <b>first</b> element whose tag is <code>matchTag</code>, and return its <code>dataId</code>. Return <code>null</code> when no element on the path matches.`,
starter:`function delegate(path, matchTag) {
  return null;
}`,
solution:`function delegate(path, matchTag) {
  for (const [tag, id] of path) {     // innermost first: nearest match wins
    if (tag === matchTag) return id;  // closest() stops at the FIRST hit
  }
  return null;                        // clicked the gap - a real case, not an error
}`,
tests:[{d:'walks the path upward',re:'for\\s*'},{d:'matches on the tag',re:'matchTag'},{d:'a miss returns null rather than throwing',re:'null'}],
behavior:`The third case is the one real delegation code forgets: clicks land on the container itself, between rows, and closest() finds nothing; code that does li.dataset.id without the null check throws on the very first misclick. The fifth case pins "nearest wins" for nested matches.`,
hints:['Loop the path in the order given; it is already innermost-first.','Return the id of the first tag match and stop.','No match is a normal outcome: return null.']}]},

{id:'jsdom3',title:'fetch: talking to a server',body:`
<p>The browser-debugging stream taught you to <i>inspect</i> network traffic. This lesson is where you
learn to <i>create</i> it. <code>fetch</code> is the standard way for page JavaScript to call a server,
it returns a promise, and everything the async stream taught applies to it directly.</p>

<div class="codeSample" data-hl>const res = await fetch("/api/users/7");
const user = await res.json();      // parsing the body is a SECOND await -
                                    // the body streams in after the headers

await fetch("/api/users", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "Ada" }),   // objects do not send themselves
});</div>

<h4>The mistake everyone makes once</h4>
<p><b><code>fetch</code> does not reject on a 404 or a 500.</b> The promise rejects only when no response
arrived at all: DNS failure, offline, CORS, an aborted request. A 500 with an HTML error page is, to
<code>fetch</code>, a perfectly good response, and <code>res.json()</code> will then throw a confusing
parse error far from the real problem.</p>
<div class="codeSample" data-hl>const res = await fetch(url);
if (!res.ok) {                           // ok  means  status 200-299
  throw new Error(\`HTTP \${res.status}\`); // make the failure LOUD, and near
}                                        // its cause - not in json() later
const data = await res.json();

// res.status   200, 404, 500...      res.ok   status is 200-299
// res.headers.get("content-type")</div>
<p>That <code>if (!res.ok) throw</code> line is not boilerplate to skip; it is the difference between
"HTTP 404 for /api/users/7" in your error report and "Unexpected token &lt; in JSON" from somewhere
inside a rendering function.</p>

<h4>Failure is normal: timeouts and cancellation</h4>
<div class="codeSample" data-hl>// AbortController, from the async stream, is how fetch is canceled:
const ac = new AbortController();
const t = setTimeout(() =&gt; ac.abort(), 5000);
try {
  const res = await fetch(url, { signal: ac.signal });
  ...
} catch (e) {
  if (e.name === "AbortError") ...     // timeout / navigation - not a bug
  else ...                             // network genuinely failed
} finally {
  clearTimeout(t);
}</div>

<h4>CORS, from the consumer's side</h4>
<p>When page JavaScript calls a <b>different origin</b> (another scheme, host or port), the browser asks
that server for permission, and blocks the response unless it grants it via
<code>Access-Control-Allow-Origin</code>. Two things to internalise: the error appears in the console but
is deliberately <i>invisible</i> to your code (a generic <code>TypeError</code>, so scripts cannot probe
where you are logged in), and <b>it is not fetch being broken</b>; the server stream shows the other
side of this handshake. <code>curl</code> works and the browser refuses: that is CORS, every time.</p>`,
docs:[['MDN (Using the Fetch API)','https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch'],['MDN (Response)','https://developer.mozilla.org/en-US/docs/Web/API/Response'],['MDN (CORS)','https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS']],
exs:[
{title:'Classify the outcome of a fetch',diff:'medium',lang:'js',
run:{call:'outcome',cases:[
 {name:'a 200 with JSON is a success',args:[{rejected:false,status:200,contentType:'application/json'}],expect:'success'},
 {name:'a 201 counts as ok too',args:[{rejected:false,status:201,contentType:'application/json'}],expect:'success'},
 {name:'a 404 is an HTTP error, not a network error',args:[{rejected:false,status:404,contentType:'application/json'}],expect:'http-error'},
 {name:'a 500 is an HTTP error',args:[{rejected:false,status:500,contentType:'text/html'}],expect:'http-error'},
 {name:'a rejected promise means the network failed',args:[{rejected:true}],expect:'network-error'},
 {name:'a 200 that is not JSON must not reach res.json()',args:[{rejected:false,status:200,contentType:'text/html'}],expect:'not-json'}]},
prompt:`Write <code>function outcome(result)</code> for <code>{ rejected, status, contentType }</code>. A rejected promise is <code>"network-error"</code>. Otherwise a status outside 200&ndash;299 is <code>"http-error"</code>; a good status whose <code>contentType</code> does not include <code>"application/json"</code> is <code>"not-json"</code>; the rest are <code>"success"</code>. The order of those checks is the lesson.`,
starter:`function outcome(result) {
  return null;
}`,
solution:`function outcome(result) {
  if (result.rejected) return "network-error";       // fetch itself failed
  if (result.status < 200 || result.status > 299) return "http-error";
  if (!result.contentType.includes("application/json")) return "not-json";
  return "success";                                   // only now is json() safe
}`,
tests:[{d:'a rejection is a network error',re:'rejected'},{d:'checks the status range',re:'2\\d\\d|200'},{d:'checks the content type before parsing',re:'includes\\s*\\(\\s*"application/json"'}],
behavior:`Six cases run and the fourth is the everyday one: a 500 whose body is an HTML error page. fetch resolves happily, res.ok is false, and code that goes straight to res.json() gets a parse error pointing at the wrong suspect. Classifying before parsing is what keeps the error message near the cause.`,
hints:['Rejection first: it means there was no response at all.','ok is shorthand for status 200-299; reproduce it with a range check.','Only a good status with a JSON content type should ever be parsed.']},
{title:'Build the request options',diff:'medium',lang:'js',
run:{call:'postJson',cases:[
 {name:'a body becomes JSON with the right header',args:[{name:'Ada'}],expect:{method:'POST',headers:{'Content-Type':'application/json'},body:'{"name":"Ada"}'}},
 {name:'nested data survives the round trip',args:[{user:{id:7},tags:['a']}],expect:{method:'POST',headers:{'Content-Type':'application/json'},body:'{"user":{"id":7},"tags":["a"]}'}},
 {name:'an empty object is still a valid body',args:[{}],expect:{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'}}]},
prompt:`Write <code>function postJson(data)</code> returning the options object for a JSON POST: <code>method</code>, a <code>Content-Type: application/json</code> header, and <code>body</code> as the <b>stringified</b> data. Passing an object as <code>body</code> without stringifying sends <code>"[object Object]"</code>, a bug you will meet in the wild.`,
starter:`function postJson(data) {
  return {};
}`,
solution:`function postJson(data) {
  return {
    method: "POST",
    headers: { "Content-Type": "application/json" },  // or the server guesses wrong
    body: JSON.stringify(data),                        // objects do NOT send themselves
  };
}`,
tests:[{d:'sets the method',re:'"POST"'},{d:'declares the content type',re:'application/json'},{d:'stringifies the body',re:'JSON\\.stringify'}],
behavior:`The comparison is structural, so the body must be the exact JSON text: JSON.stringify(data), not String(data), which produces "[object Object]", a request that a server will politely reject with a 400 that then needs the previous exercise to classify.`,
hints:['Three properties: method, headers, body.','The header tells the server how to parse what you sent.','JSON.stringify turns the object into wire-format text.']}]},

{id:'jsdom4',title:'Forms: where user input comes from',body:`
<p>Forms are the browser's native way to collect input, and they work with no JavaScript at all: a
<code>submit</code> navigates the page and sends the fields. Modern apps intercept that flow: stop the
navigation, read the values, validate, and send with <code>fetch</code>. Every piece of that sentence is
something you have already learned; this lesson assembles them.</p>

<div class="codeSample" data-hl>form.addEventListener("submit", async (e) =&gt; {
  e.preventDefault();                  // stop the full-page navigation
  const data = new FormData(form);     // reads every named field
  const name = data.get("name");       // by the field's name attribute
  ...validate, then fetch...
});

// individual fields, when you need them live:
input.value          // ALWAYS a string - "42" not 42, "" when empty
checkbox.checked     // boolean
select.value</div>
<p><code>input.value</code> being a string is the oldest trap in web development; the foundations
stream built <code>toNumber</code> for exactly this moment. Convert at the boundary, validate the result,
and only then let the value into your program.</p>

<h4>Validate like you mean it</h4>
<div class="codeSample" data-hl>// HTML gives you the first line for free - USE it:
&lt;input name="email" type="email" required maxlength="80"&gt;
&lt;input name="age" type="number" min="13" max="120"&gt;
// form.checkValidity() runs all of it; invalid fields get :invalid styling

// then JavaScript enforces what HTML cannot express:
//   "the end date is after the start date"
//   "this username is not already taken" (async - the server decides)</div>
<p>The layering matters: HTML validation is instant and free, JavaScript handles cross-field rules, and
the <b>server validates everything again</b>: the HTTP stream's rule that you never trust input applies
to your own form too, because nothing stops a request skipping your form entirely.</p>

<h4>Tell the user what happened</h4>
<p>A form that silently fails teaches the user to click twice, and now you have two requests in flight,
the dashboard double-submits, and the rate limiter from the capstone starts earning its keep. The
pattern: disable the button while the request is out, re-enable in <code>finally</code>, show the failure
next to the field it belongs to.</p>
<div class="codeSample" data-hl>submitBtn.disabled = true;
try {
  const res = await fetch(...);
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  showSuccess();
} catch (err) {
  showError(err);          // NEAR the form, in words a human can act on
} finally {
  submitBtn.disabled = false;    // ALWAYS runs - success, failure, or throw
}</div>`,
docs:[['MDN (Your first form)','https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Your_first_form'],['MDN (FormData)','https://developer.mozilla.org/en-US/docs/Web/API/FormData'],['MDN (Constraint validation)','https://developer.mozilla.org/en-US/docs/Web/HTML/Constraint_validation']],
ex:{title:'Validate a signup form',diff:'hard',lang:'js',
run:{call:'validateSignup',cases:[
 {name:'a valid form has no errors',args:[{email:'ada@example.com',age:'36',start:'2026-01-01',end:'2026-02-01'}],expect:{}},
 {name:'a missing email is reported',args:[{email:'',age:'36',start:'2026-01-01',end:'2026-02-01'}],expect:{email:'required'}},
 {name:'an email needs an @',args:[{email:'nope',age:'36',start:'2026-01-01',end:'2026-02-01'}],expect:{email:'invalid'}},
 {name:'age arrives as a string and must be numeric',args:[{email:'a@b.c',age:'abc',start:'2026-01-01',end:'2026-02-01'}],expect:{age:'invalid'}},
 {name:'age zero is invalid, but for the RANGE reason',args:[{email:'a@b.c',age:'0',start:'2026-01-01',end:'2026-02-01'}],expect:{age:'out-of-range'}},
 {name:'the cross-field rule: end must be after start',args:[{email:'a@b.c',age:'36',start:'2026-02-01',end:'2026-01-01'}],expect:{end:'before-start'}},
 {name:'equal dates fail the same rule',args:[{email:'a@b.c',age:'36',start:'2026-01-01',end:'2026-01-01'}],expect:{end:'before-start'}},
 {name:'multiple problems are all reported at once',args:[{email:'',age:'abc',start:'2026-02-01',end:'2026-01-01'}],expect:{email:'required',age:'invalid',end:'before-start'}}]},
prompt:`Write <code>function validateSignup(fields)</code> for <code>{ email, age, start, end }</code>, all strings, as forms deliver them. Return an object with one entry per problem (empty object when valid): <code>email</code> is <code>"required"</code> when blank or <code>"invalid"</code> without an <code>"@"</code>; <code>age</code> is <code>"invalid"</code> when not numeric or <code>"out-of-range"</code> outside 13&ndash;120; <code>end</code> is <code>"before-start"</code> unless it is strictly after <code>start</code> (the dates compare correctly as <code>YYYY-MM-DD</code> strings). Report <b>every</b> problem, not just the first.`,
starter:`function validateSignup(fields) {
  return {};
}`,
solution:`function validateSignup(fields) {
  const errors = {};

  if (fields.email.trim() === "") errors.email = "required";
  else if (!fields.email.includes("@")) errors.email = "invalid";

  const age = Number(fields.age);
  if (fields.age.trim() === "" || !Number.isFinite(age)) errors.age = "invalid";
  else if (age < 13 || age > 120) errors.age = "out-of-range";   // 0 lands here

  if (!(fields.end > fields.start)) errors.end = "before-start"; // ISO strings
                                                                 // sort correctly
  return errors;   // {} means valid - and EVERY problem is present, so the
                   // user fixes the form once, not once per submit
}`,
tests:[{d:'a blank email is required, not invalid',re:'"required"'},{d:'converts the age before judging it',re:'Number\\s*\\('},{d:'range-checks the age separately',re:'13'},{d:'compares the dates cross-field',re:'end\\s*>\\s*fields\\.start|fields\\.end\\s*>'}],
behavior:`Eight cases execute. Age "0" is the subtle one: it is a perfectly numeric string, so it must fail the range check, not the numeric one; a truthiness test on Number(age) would misreport it. And the last case is the user-experience point: all three problems arrive in one pass, because a validator that stops at the first error makes the user resubmit once per mistake.`,
hints:['Collect errors in an object; only add a key when a rule fails.','Number("") is 0; guard the empty string before converting, as ever.','YYYY-MM-DD strings compare in date order with plain >.']}}

]});
