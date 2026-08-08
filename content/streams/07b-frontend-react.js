STREAMS.push({icon:'⚛️',title:'Front-End with React',blurb:'Build user interfaces from zero to production with React — the most widely used UI framework. Components, JSX, state and hooks, lists and forms, effects and data fetching, connecting to a backend (REST, WebSocket, SSE, GraphQL), scaling state, and securing the UI against XSS/CSRF and friends.',lessons:[

{id:'ui1',title:'What a UI framework is (and why React)',body:`
<p>The browser shows a tree of elements called the <b>DOM</b>. The old way to update it was <b>imperative</b>: you found a node and mutated it by hand (<code>el.textContent = ...</code>), which gets tangled fast as an app grows. A UI framework flips this to <b>declarative</b>: you describe what the screen should look like <i>for the current data</i>, and the framework figures out the minimal DOM changes to get there.</p>
<p><b>React</b> is the most widely used of these frameworks. Its core ideas are tiny: your UI is built from <b>components</b> (reusable functions that return markup), each component has <b>props</b> (inputs passed in) and <b>state</b> (data that changes over time), and whenever state changes React <b>re-renders</b> that component and reconciles the DOM for you. This is the MVC "view" done right: data in, UI out.</p>
<p>This stream builds from a single component up to a data-driven, secured app. It pairs with the MVC and HTTP lessons on the backend side.</p>`,
docs:[['React — official docs','https://react.dev/learn'],['DOM introduction — MDN','https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction']],
ex:{title:'The core vocabulary',lang:'js',
prompt:`Write <code>function role(term)</code> that returns what each React concept is: <code>"component"</code>→<code>"reusable piece of UI"</code>, <code>"props"</code>→<code>"inputs passed to a component"</code>, <code>"state"</code>→<code>"data that changes over time"</code>, <code>"render"</code>→<code>"produce UI from current data"</code>, else <code>"unknown"</code>.`,
starter:`function role(term) {
  return null;
}`,
solution:`function role(term) {
  switch (term) {
    case "component": return "reusable piece of UI";
    case "props":     return "inputs passed to a component";
    case "state":     return "data that changes over time";
    case "render":    return "produce UI from current data";
    default:          return "unknown";
  }
}`,
tests:[{d:'a component is a reusable piece of UI',re:'"component".*?"reusable piece of UI"',flags:'s'},{d:'props are inputs',re:'"props".*?"inputs passed to a component"',flags:'s'},{d:'state is data that changes',re:'"state".*?"data that changes over time"',flags:'s'},{d:'render produces UI from data',re:'"render".*?"produce UI from current data"',flags:'s'},{d:'unknown default',re:'"unknown"'}],
behavior:`role("component") is "reusable piece of UI", role("state") is "data that changes over time". These four words — component, props, state, render — are the whole mental model you will use for the rest of the stream.`,
hints:['A switch on term maps each concept to its one-line meaning.','Props flow in; state changes over time; a render turns data into UI.','Anything unlisted returns unknown.']}},

{id:'ui2',title:'Components & JSX',body:`
<p>A React component is a plain function whose name starts with a capital letter and which returns <b>JSX</b> — markup that looks like HTML but is really JavaScript. Inside JSX, anything in <code>{ }</code> is a live JavaScript expression.</p>
<div class="codeSample">function Greeting(props) {
  return &lt;h1&gt;Hello, {props.name}&lt;/h1&gt;;   // {props.name} is evaluated
}

// used elsewhere as:  &lt;Greeting name="Ada" /&gt;</div>
<p>Two JSX rules trip up beginners: a component must return a <b>single root element</b> (wrap siblings in a parent or a <code>&lt;&gt;...&lt;/&gt;</code> fragment), and HTML attributes are camelCased — <code>class</code> becomes <code>className</code>, <code>onclick</code> becomes <code>onClick</code>. <b>Props</b> are the inputs a parent passes down; a component should treat them as read-only.</p>`,
docs:[['Your first component — React','https://react.dev/learn/your-first-component'],['Writing markup with JSX','https://react.dev/learn/writing-markup-with-jsx']],
ex:{title:'Write a component',lang:'jsx',
prompt:`Write a function component <code>Greeting</code> that takes <code>props</code> and returns an <code>&lt;h1&gt;</code> containing the text <code>Hello, </code> followed by <code>{props.name}</code>.`,
starter:`function Greeting(props) {
  // return an <h1> greeting that interpolates props.name
}`,
solution:`function Greeting(props) {
  return <h1>Hello, {props.name}</h1>;
}`,
tests:[{d:'declares a Greeting component taking props',re:'function\\s+Greeting\\s*\\(\\s*props\\s*\\)'},{d:'returns an h1 element',re:'<h1>'},{d:'interpolates props.name inside braces',re:'\\{\\s*props\\.name\\s*\\}'}],
behavior:`Rendering <Greeting name="Ada" /> shows "Hello, Ada" in an h1. props.name is read from the object the parent passes; the component never mutates it.`,
hints:['A component is a capitalized function that returns JSX.','Put the dynamic value in curly braces: {props.name}.','Return a single root element, here the h1.']}},

{id:'ui3',title:'State & the useState hook',body:`
<p>Props come from the parent; <b>state</b> is data a component owns and can change. You declare it with the <b>useState</b> hook, which returns the current value and a setter. Calling the setter tells React to re-render the component with the new value — you never touch the DOM yourself.</p>
<div class="codeSample">function Counter() {
  const [count, setCount] = useState(0);          // [value, setter]
  return &lt;button onClick={() =&gt; setCount(count + 1)}&gt;{count}&lt;/button&gt;;
}</div>
<p>The golden rule: <b>never mutate state directly</b> (<code>count++</code> or pushing into an array in place). Always call the setter with a new value, so React knows something changed and re-renders. Hooks must be called at the top level of the component, never inside loops or conditions.</p>`,
docs:[['State: a component memory','https://react.dev/learn/state-a-components-memory'],['useState — React','https://react.dev/reference/react/useState']],
ex:{title:'A counter with state',lang:'jsx',
prompt:`Write a <code>Counter</code> component that holds a number in state starting at <code>0</code> using <code>useState</code>, and renders a <code>&lt;button&gt;</code> whose <code>onClick</code> increments it with the setter (<code>setCount(count + 1)</code>) and whose label shows the count.`,
starter:`function Counter() {
  // const [count, setCount] = useState(0);
  // return a button that shows count and increments on click
}`,
solution:`function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}`,
tests:[{d:'initializes state to 0 with useState',re:'useState\\s*\\(\\s*0\\s*\\)'},{d:'destructures value and setter',re:'\\[\\s*count\\s*,\\s*setCount\\s*\\]'},{d:'increments via the setter (no direct mutation)',re:'setCount\\s*\\(\\s*count\\s*\\+\\s*1\\s*\\)'},{d:'wires an onClick handler',re:'onClick\\s*=\\s*\\{'}],
behavior:`Each click calls setCount(count + 1); React re-renders and the button shows the new number. The value is never mutated directly — the setter is what triggers the re-render.`,
hints:['useState(0) returns the current value and a setter in an array you destructure.','Update through the setter: setCount(count + 1), never count++.','onClick takes a function, so wrap the call in an arrow: () => setCount(...).']}},

{id:'ui4',title:'Lists & conditional rendering',body:`
<p>Real UIs render collections. In JSX you turn an array into elements with <code>.map()</code>, and each rendered item needs a stable <b>key</b> so React can track it across re-renders (use a real id, not the array index when the list can reorder).</p>
<div class="codeSample">function List(props) {
  return (
    &lt;ul&gt;
      {props.items.map(item =&gt; &lt;li key={item.id}&gt;{item.name}&lt;/li&gt;)}
    &lt;/ul&gt;
  );
}</div>
<p><b>Conditional rendering</b> is just JavaScript inside braces: <code>{isLoading &amp;&amp; &lt;Spinner /&gt;}</code> shows the spinner only when true, and a ternary <code>{user ? &lt;Profile /&gt; : &lt;Login /&gt;}</code> chooses between two. There is no special template syntax — you already know it.</p>`,
docs:[['Rendering lists — React','https://react.dev/learn/rendering-lists'],['Conditional rendering','https://react.dev/learn/conditional-rendering']],
ex:{title:'Render a keyed list',lang:'jsx',
prompt:`Write a <code>List</code> component that takes <code>props</code> and returns a <code>&lt;ul&gt;</code> mapping <code>props.items</code> to a <code>&lt;li&gt;</code> for each item, using <code>key={item.id}</code> and showing <code>{item.name}</code>.`,
starter:`function List(props) {
  // return a <ul> that maps props.items to <li> with a key
}`,
solution:`function List(props) {
  return <ul>{props.items.map(item => <li key={item.id}>{item.name}</li>)}</ul>;
}`,
tests:[{d:'maps over the items array',re:'props\\.items\\.map\\s*\\('},{d:'renders li elements',re:'<li'},{d:'gives each item a stable key',re:'key\\s*=\\s*\\{\\s*item\\.id\\s*\\}'},{d:'shows the item name',re:'\\{\\s*item\\.name\\s*\\}'}],
behavior:`Given items [{id:1,name:"a"},{id:2,name:"b"}] the component renders a two-item list. The key lets React update, reorder, or remove rows efficiently without re-creating the whole list.`,
hints:['Turn data into elements with props.items.map(item => ...).','Each mapped element needs a unique, stable key — use item.id.','Show the value in braces: {item.name}.']}},

{id:'ui5',title:'Events & controlled forms',body:`
<p>Handle user actions by passing a function to an event prop like <code>onClick</code> or <code>onChange</code>. For inputs, React favors the <b>controlled component</b> pattern: the input value comes <i>from</i> state, and every keystroke updates that state — so React is the single source of truth for what the field contains.</p>
<div class="codeSample">function NameField() {
  const [name, setName] = useState("");
  return &lt;input value={name} onChange={e =&gt; setName(e.target.value)} /&gt;;
}</div>
<p>For a whole form, keep each field in state and handle <code>onSubmit</code> on the <code>&lt;form&gt;</code>, calling <code>e.preventDefault()</code> so the browser does not do a full page reload. Controlled inputs make validation trivial: you always have the current values in state.</p>`,
docs:[['Responding to events','https://react.dev/learn/responding-to-events'],['Controlled inputs — React','https://react.dev/reference/react-dom/components/input']],
ex:{title:'A controlled input',lang:'jsx',
prompt:`Write a <code>NameField</code> component with a string state initialized to <code>""</code>. Render an <code>&lt;input&gt;</code> whose <code>value</code> is bound to that state (<code>value={name}</code>) and whose <code>onChange</code> updates it with <code>setName(e.target.value)</code>.`,
starter:`function NameField() {
  // controlled input: value from state, onChange updates state
}`,
solution:`function NameField() {
  const [name, setName] = useState("");
  return <input value={name} onChange={e => setName(e.target.value)} />;
}`,
tests:[{d:'holds the field value in state',re:'useState\\s*\\(\\s*""\\s*\\)'},{d:'binds the input value to state',re:'value\\s*=\\s*\\{\\s*name\\s*\\}'},{d:'updates state on change',re:'setName\\s*\\(\\s*e\\.target\\.value\\s*\\)'},{d:'wires onChange',re:'onChange\\s*=\\s*\\{'}],
behavior:`The input always displays the state value, and each keystroke flows through setName, so state is the single source of truth. That makes validation and submission read straight from state.`,
hints:['Controlled means value={state} plus an onChange that writes back to state.','Read the typed text from e.target.value.','Start the state as an empty string so the input is empty initially.']}},

{id:'ui6',title:'Effects & fetching data',body:`
<p>Components should be pure functions of props and state, so anything that reaches <i>outside</i> React — network calls, timers, subscriptions — goes in an <b>effect</b> via the <code>useEffect</code> hook. The classic use is fetching data after the component first renders.</p>
<div class="codeSample">function Users() {
  const [users, setUsers] = useState([]);
  useEffect(() =&gt; {
    fetch("/api/users").then(r =&gt; r.json()).then(setUsers);
  }, []);                                   // [] = run once, after first render
  return &lt;ul&gt;{users.map(u =&gt; &lt;li key={u.id}&gt;{u.name}&lt;/li&gt;)}&lt;/ul&gt;;
}</div>
<p>The second argument is the <b>dependency array</b>: <code>[]</code> runs the effect once; listing values runs it again whenever they change; omitting it runs after <i>every</i> render (usually a bug). Return a cleanup function to cancel subscriptions or timers when the component unmounts.</p>`,
docs:[['Synchronizing with effects','https://react.dev/learn/synchronizing-with-effects'],['Fetching data — React','https://react.dev/learn/you-might-not-need-an-effect#fetching-data']],
ex:{title:'Fetch on mount',lang:'jsx',
prompt:`Write a <code>Users</code> component with an array state starting <code>[]</code>. In a <code>useEffect</code> with an empty dependency array, <code>fetch("/api/users")</code>, parse the JSON, and store it with the setter. Render the users as a keyed list.`,
starter:`function Users() {
  // state for users; useEffect(..., []) to fetch once; render a keyed list
}`,
solution:`function Users() {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    fetch("/api/users").then(r => r.json()).then(setUsers);
  }, []);
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}`,
tests:[{d:'runs an effect',re:'useEffect\\s*\\('},{d:'fetches the API',re:'fetch\\s*\\(\\s*"/api/users"'},{d:'parses JSON',re:'\\.json\\s*\\(\\s*\\)'},{d:'runs once via empty deps',re:'\\}\\s*,\\s*\\[\\s*\\]\\s*\\)'},{d:'stores the result in state',re:'setUsers'}],
behavior:`On first render users is []; the effect fires once, fetches /api/users, and setUsers triggers a re-render showing the list. The empty dependency array is what stops it from re-fetching on every render.`,
hints:['Side effects like fetch belong in useEffect, not in the render body.','Chain the promise: fetch(...).then(r => r.json()).then(setUsers).','Pass [] as the second argument so it runs only once.']}},

{id:'ui7',title:'Connecting front end to back end',body:`
<p>The front end and back end are separate programs that talk over the network. Your React app almost always talks to an HTTP API, and there are several methods depending on the shape of the data flow:</p>
<ul>
<li><b>REST over fetch</b> — the default. Send JSON with the right method (GET/POST/PUT/DELETE) and read JSON back. Covers the vast majority of apps.</li>
<li><b>WebSocket</b> — a persistent two-way connection for real-time, bidirectional data (chat, live dashboards, multiplayer).</li>
<li><b>Server-Sent Events (SSE)</b> — a one-way stream from server to client (notifications, live feeds); simpler than WebSocket when you only need push.</li>
<li><b>GraphQL</b> — one endpoint where the client asks for exactly the fields it needs, avoiding over- and under-fetching.</li>
</ul>
<p>Two things to get right in the browser: writes send <code>Content-Type: application/json</code> with a <code>JSON.stringify</code> body, and cross-origin calls need the server to allow them via <b>CORS</b> (or you route through a dev <b>proxy</b> so the browser sees a same-origin URL). Always <code>await</code> the response and handle non-2xx status.</p>
<div class="codeSample">const res = await fetch("/api/users", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(user)
});</div>`,
docs:[['Using fetch — MDN','https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch'],['WebSocket — MDN','https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API'],['Server-sent events — MDN','https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events']],
ex:{title:'POST JSON to the backend',lang:'js',
prompt:`Write <code>async function createUser(user)</code> that POSTs to <code>/api/users</code> with <code>fetch</code>: method <code>"POST"</code>, header <code>"Content-Type": "application/json"</code>, body <code>JSON.stringify(user)</code>. <code>await</code> the response and return its parsed JSON.`,
starter:`async function createUser(user) {
  // POST JSON to /api/users and return the parsed response
}`,
solution:`async function createUser(user) {
  const res = await fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user)
  });
  return res.json();
}`,
tests:[{d:'awaits the fetch call',re:'await\\s+fetch\\s*\\(\\s*"/api/users"'},{d:'uses the POST method',re:'method\\s*:\\s*"POST"'},{d:'sends the JSON content type',re:'"Content-Type"\\s*:\\s*"application/json"'},{d:'serializes the body with JSON.stringify',re:'JSON\\.stringify\\s*\\(\\s*user\\s*\\)'},{d:'returns parsed JSON',re:'\\.json\\s*\\(\\s*\\)'}],
behavior:`createUser({name:"Ada"}) sends a JSON POST to /api/users and resolves to the created record the server returns. The Content-Type header and JSON.stringify body are what make it a JSON request.`,
hints:['fetch takes a URL and an options object with method, headers, and body.','Stringify the object for the body and set the JSON content type.','Mark the function async and await both the fetch and res.json().']}},

{id:'ui8',title:'Scaling state: reducers & context',body:`
<p>As an app grows, two problems appear: complex state with many related updates, and state that many components need. React answers each without a library.</p>
<p><b>useReducer</b> centralizes complex update logic into one pure function — the same idea as a Redux reducer. You dispatch <i>actions</i> and the reducer returns the next state, which makes updates predictable and testable.</p>
<div class="codeSample">function reducer(state, action) {
  switch (action.type) {
    case "inc": return { count: state.count + 1 };
    case "dec": return { count: state.count - 1 };
    default:    return state;
  }
}</div>
<p><b>Context</b> solves "prop drilling" — passing a value through many layers. A provider makes a value available to any descendant via <code>useContext</code>, ideal for the current user, theme, or locale. Reach for an external store (Redux, Zustand) only when context plus reducers genuinely stop scaling; most apps never need to. And lift shared state up to the nearest common parent before reaching for anything fancier.</p>`,
docs:[['useReducer — React','https://react.dev/reference/react/useReducer'],['Passing data with context','https://react.dev/learn/passing-data-deeply-with-context']],
ex:{title:'Write a reducer',lang:'js',
prompt:`Write <code>function reducer(state, action)</code> that switches on <code>action.type</code>: <code>"inc"</code> returns <code>{ count: state.count + 1 }</code>, <code>"dec"</code> returns <code>{ count: state.count - 1 }</code>, and any other action returns the unchanged <code>state</code>.`,
starter:`function reducer(state, action) {
  // switch on action.type; default returns state unchanged
}`,
solution:`function reducer(state, action) {
  switch (action.type) {
    case "inc": return { count: state.count + 1 };
    case "dec": return { count: state.count - 1 };
    default:    return state;
  }
}`,
tests:[{d:'takes state and action',re:'function\\s+reducer\\s*\\(\\s*state\\s*,\\s*action\\s*\\)'},{d:'branches on action.type',re:'action\\.type'},{d:'inc increments the count',re:'"inc".*?state\\.count\\s*\\+\\s*1',flags:'s'},{d:'dec decrements the count',re:'"dec".*?state\\.count\\s*-\\s*1',flags:'s'},{d:'default returns state unchanged',re:'default\\s*:\\s*return\\s+state'}],
behavior:`reducer({count:0}, {type:"inc"}) is {count:1}; an unknown action returns state untouched. A reducer is a pure function of (state, action) -> newState, which is exactly why it is easy to test.`,
hints:['A reducer is a pure function switching on action.type.','Return a NEW object for each change; never mutate state.','The default case must return the existing state unchanged.']}},

{id:'ui9',title:'Securing your UI',body:`
<p>The front end runs on the user's machine, fully inspectable, so security is about what you send there and how you render it. The dominant threat is <b>XSS</b> (Cross-Site Scripting): an attacker gets their script to run in your page and steals sessions or data. React helps by <b>auto-escaping</b> everything you interpolate with <code>{ }</code> — rendering user text as text, never as HTML.</p>
<div class="codeSample">function Comment(props) {
  return &lt;p&gt;{props.text}&lt;/p&gt;;   // safe: React escapes props.text
}
// DANGER: dangerouslySetInnerHTML re-opens the XSS hole — avoid it,
// and if unavoidable, sanitize with a library like DOMPurify first.</div>
<p>The rest of the checklist:</p>
<ul>
<li><b>Never use <code>dangerouslySetInnerHTML</code></b> with untrusted input; sanitize if you truly must inject HTML.</li>
<li><b>Content-Security-Policy (CSP)</b> — a response header that blocks injected/inline scripts; your strongest XSS backstop.</li>
<li><b>Token storage</b> — prefer an <b>HttpOnly cookie</b> for the session so page JavaScript (and any XSS) cannot read it; <code>localStorage</code> is readable by any script.</li>
<li><b>CSRF</b> — for cookie-based auth, defend with <code>SameSite</code> cookies and anti-CSRF tokens.</li>
<li><b>Clickjacking</b> — send <code>X-Frame-Options: DENY</code> or a <code>frame-ancestors</code> CSP so your app cannot be framed.</li>
<li><b>Secrets &amp; dependencies</b> — never ship API secrets in the bundle (anything in the front end is public), and run <code>npm audit</code> to catch vulnerable packages (supply-chain risk).</li>
</ul>`,
docs:[['XSS prevention — OWASP','https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html'],['dangerouslySetInnerHTML — React','https://react.dev/reference/react-dom/components/common#dangerously-setting-the-inner-html'],['CSP — MDN','https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP']],
ex:{title:'Render user content safely',lang:'jsx',
prompt:`Write a <code>Comment</code> component that safely displays untrusted <code>props.text</code> by interpolating it inside a <code>&lt;p&gt;</code> with <code>{props.text}</code> (letting React auto-escape it). Do <b>not</b> use <code>dangerouslySetInnerHTML</code>.`,
starter:`function Comment(props) {
  // render props.text safely — let React escape it
}`,
solution:`function Comment(props) {
  return <p>{props.text}</p>;
}`,
tests:[{d:'renders inside a paragraph',re:'<p>'},{d:'interpolates props.text so React escapes it',re:'\\{\\s*props\\.text\\s*\\}'},{d:'does NOT use dangerouslySetInnerHTML',re:'dangerouslySetInnerHTML',not:true}],
behavior:`Comment({text:"<img src=x onerror=alert(1)>"}) renders that string as visible text, not as an executing tag, because React escapes interpolated values. Reaching for dangerouslySetInnerHTML would turn it back into a live XSS payload.`,
hints:['Interpolating with {props.text} makes React escape the value automatically.','Avoid dangerouslySetInnerHTML entirely for untrusted input.','No sanitizer is needed when you render as text rather than HTML.']}},

]});
