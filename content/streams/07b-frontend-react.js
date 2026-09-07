STREAMS.push({icon:'⚛️',title:'Front-End with React',blurb:'Build user interfaces from zero to production with React, the most widely used UI framework. Components, JSX, state and hooks, lists and forms, effects and data fetching, connecting to a backend (REST, WebSocket, SSE, GraphQL), scaling state, and securing the UI against XSS/CSRF and friends.',lessons:[

{id:'ui1',title:'What a UI framework is (and why React)',body:`

<p>The browser shows a tree of elements called the <b>DOM</b>, the Document Object Model. It's the browser's live, in-memory tree of the page. JavaScript changes what you see by changing that tree; React changes it for you. The old way to update it was <b>imperative</b>: find a node and mutate it by hand (<code>el.textContent = ...</code>). That gets tangled fast. A UI framework is <b>declarative</b>: you describe what the screen should look like <i>for the current data</i>, and the framework works out the minimal DOM changes.</p>
<p><b>React</b> is the most widely used of these frameworks. Your UI is built from <b>components</b>, reusable functions that return markup. Each has <b>props</b> (inputs passed in) and <b>state</b> (data that changes over time). When state changes, React <b>re-renders</b> that component and reconciles the DOM for you. This is the MVC "view": data in, UI out. <b>MVC</b> is model, view, controller: the data and rules (model), what the user sees (view), and the code that takes a request and decides what happens (controller). It's a way of keeping those three from tangling, and React only claims the middle one.</p>

<h4>What "declarative" buys</h4>
<p>Imperative UI code describes <i>transitions</i>: when the cart gains an item, increment the badge, show it if hidden, update the total, enable checkout. Every feature adds transitions between every pair of states. The bugs live in the pairs nobody wrote, like the badge that stays visible after the last item is removed. Declarative code describes <i>states</i>: given this cart, the screen looks like this. There are no transitions to forget.</p>
<p>You give up direct control of the DOM and gain a guarantee that the screen matches the data. When a React app shows stale UI, the cause is almost always data mutated in place, so React never learned it changed.</p>

<h4>The three ideas everything else is built on</h4>
<ul>
<li><b>Components</b> are functions from data to markup. They compose and reuse like functions: small, single-purpose, named for what they render.</li>
<li><b>Props flow down, events flow up.</b> A child never reaches into its parent. It calls a function the parent handed it. That keeps data flow traceable in an app of a thousand components.</li>
<li><b>State triggers re-render.</b> Changing state re-renders that component and its children. React touches only the DOM nodes that differ from last time.</li>
</ul>

<h4>What React is not</h4>
<p>React is a view library, not a framework in the Angular sense. It has no router, no data-fetching layer, no form validation and no opinion about your build. Real projects add a router and a data library, so the ecosystem churns more than the core does. The core API has been stable for years. The advice around it changes yearly.</p>
<p>It's also not the only answer. Vue and Svelte solve the same problem with less ceremony. For a page with three interactive widgets, plain JavaScript is still correct. React earns its cost when state is complex and shared. This stream builds to that case.</p>`,
docs:[['React, official docs','https://react.dev/learn'],['DOM introduction, MDN','https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction']],
ex:{title:'The core vocabulary',lang:'js',run:{call:'role',cases:[{args:['component'],expect:'reusable piece of UI'},{args:['props'],expect:'inputs passed to a component'},{args:['state'],expect:'data that changes over time'},{args:['render'],expect:'produce UI from current data'},{args:['zzz'],expect:'unknown'}]},
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
tests:[{d:'a component is a reusable piece of UI',re:'(["\']component["\']\\s*(->|:)\\s*(\\{\\s*)?(yield\\s+|return\\s+)?["\']reusable piece of UI["\']|equals\\s*\\(\\s*["\']component["\']\\s*\\)[^"\']{0,40}["\']reusable piece of UI["\']|["\']component["\']\\s*\\.equals\\s*\\([^"\']{0,40}["\']reusable piece of UI["\']|===?\\s*["\']component["\'][^"\']{0,40}["\']reusable piece of UI["\']|["\']component["\']\\s*===?[^"\']{0,40}["\']reusable piece of UI["\']|(Map\\.of|Map\\.ofEntries|entry|\\.put|\\.set)\\s*\\([^;]{0,600}?["\']component["\']\\s*,\\s*["\']reusable piece of UI["\'])'},{d:'props are inputs',re:'(["\']props["\']\\s*(->|:)\\s*(\\{\\s*)?(yield\\s+|return\\s+)?["\']inputs passed to a component["\']|equals\\s*\\(\\s*["\']props["\']\\s*\\)[^"\']{0,40}["\']inputs passed to a component["\']|["\']props["\']\\s*\\.equals\\s*\\([^"\']{0,40}["\']inputs passed to a component["\']|===?\\s*["\']props["\'][^"\']{0,40}["\']inputs passed to a component["\']|["\']props["\']\\s*===?[^"\']{0,40}["\']inputs passed to a component["\']|(Map\\.of|Map\\.ofEntries|entry|\\.put|\\.set)\\s*\\([^;]{0,600}?["\']props["\']\\s*,\\s*["\']inputs passed to a component["\'])'},{d:'state is data that changes',re:'(["\']state["\']\\s*(->|:)\\s*(\\{\\s*)?(yield\\s+|return\\s+)?["\']data that changes over time["\']|equals\\s*\\(\\s*["\']state["\']\\s*\\)[^"\']{0,40}["\']data that changes over time["\']|["\']state["\']\\s*\\.equals\\s*\\([^"\']{0,40}["\']data that changes over time["\']|===?\\s*["\']state["\'][^"\']{0,40}["\']data that changes over time["\']|["\']state["\']\\s*===?[^"\']{0,40}["\']data that changes over time["\']|(Map\\.of|Map\\.ofEntries|entry|\\.put|\\.set)\\s*\\([^;]{0,600}?["\']state["\']\\s*,\\s*["\']data that changes over time["\'])'},{d:'render produces UI from data',re:'(["\']render["\']\\s*(->|:)\\s*(\\{\\s*)?(yield\\s+|return\\s+)?["\']produce UI from current data["\']|equals\\s*\\(\\s*["\']render["\']\\s*\\)[^"\']{0,40}["\']produce UI from current data["\']|["\']render["\']\\s*\\.equals\\s*\\([^"\']{0,40}["\']produce UI from current data["\']|===?\\s*["\']render["\'][^"\']{0,40}["\']produce UI from current data["\']|["\']render["\']\\s*===?[^"\']{0,40}["\']produce UI from current data["\']|(Map\\.of|Map\\.ofEntries|entry|\\.put|\\.set)\\s*\\([^;]{0,600}?["\']render["\']\\s*,\\s*["\']produce UI from current data["\'])'},{d:'unknown default',re:'(default\\s*(->|:)\\s*(\\{\\s*)?(yield\\s+|return\\s+)?["\']unknown["\']|else[^"\']{0,40}["\']unknown["\']|getOrDefault\\s*\\([^;]{0,120}["\']unknown["\']|(\\?\\?|\\|\\|)\\s*["\']unknown["\']|return\\s+["\']unknown["\']\\s*;)'}],
behavior:`role("component") is "reusable piece of UI", role("state") is "data that changes over time". These four words (component, props, state, render) are the whole mental model you will use for the rest of the stream.`,
hints:['A switch on term maps each concept to its one-line meaning.','Props flow in; state changes over time; a render turns data into UI.','Anything unlisted returns unknown.']}},

{id:'ui2',title:'Components & JSX',body:`

<p>A React component is a plain function whose name starts with a capital letter and which returns <b>JSX</b>: markup that looks like HTML but is really JavaScript. Inside JSX, anything in <code>{ }</code> is a live JavaScript expression.</p>
<div class="codeSample">function Greeting(props) {
  return &lt;h1&gt;Hello, {props.name}&lt;/h1&gt;;   // {props.name} is evaluated
}

// used elsewhere as:  &lt;Greeting name="Ada" /&gt;</div>
<p>A component must return a <b>single root element</b>. Wrap siblings in a parent or a <code>&lt;&gt;...&lt;/&gt;</code> fragment. HTML attributes are camelCased: <code>class</code> becomes <code>className</code>, <code>onclick</code> becomes <code>onClick</code>. <b>Props</b> are the inputs a parent passes down. Treat them as read-only.</p>
<h4>What JSX is</h4>
<p>It isn't a template language and there is no HTML anywhere. JSX is syntax sugar that the build step
compiles into ordinary function calls:</p>
<div class="codeSample" data-hl>&lt;h1 className="title"&gt;Hello, {name}&lt;/h1&gt;

// compiles to roughly:
React.createElement("h1", { className: "title" }, "Hello, ", name)

// which RETURNS AN OBJECT describing what you want on screen:
{ type: "h1", props: { className: "title", children: [...] } }</div>
<p>That explains the rules. <b>One root element</b>, because a function returns one value.
<b>camelCase attributes</b>, because they are JavaScript object keys, and <code>class</code> is a
reserved word. <b>Capitalized component names</b>, because the compiler uses the case to decide between
the string <code>"div"</code> and the variable <code>Greeting</code>. A lowercase component becomes an
unknown HTML tag that renders nothing.</p>

<h4>Expressions, not statements</h4>
<p>The braces take an <i>expression</i>: something with a value. <code>if</code> and <code>for</code>
don't work inside them. The common idioms are the expression equivalents:</p>
<div class="codeSample" data-hl>{isLoggedIn ? &lt;Dashboard /&gt; : &lt;Login /&gt;}      // ternary for either/or
{error && &lt;Alert msg={error} /&gt;}              // && for "render if"
{items.map(i =&gt; &lt;Item key={i.id} {...i} /&gt;)}  // map for lists

// the && gotcha that WILL catch you:
{items.length && &lt;List /&gt;}    // when length is 0, renders the literal "0"
{items.length > 0 && &lt;List /&gt;}  // coerce to a boolean. always.</div>
<p><code>false</code>, <code>null</code> and <code>undefined</code> render nothing. <code>0</code> is
a valid thing to display, so React displays it.</p>

<h4>Why props are read-only</h4>
<p>Data flows one way: parents pass down, children read. If a child could edit its props, a value could
change in a place the parent knows nothing about, and "where did this come from?" would have no answer.
A child that needs to cause a change receives a <b>function</b> to call instead. The parent still owns
the decision.</p>
<p>A component is a pure function of its props. Same props in, same markup out. That makes components
testable in isolation and safe to reuse, and the rest of React depends on it.</p>

<h4>The <code>key</code> prop</h4>
<p>When a list re-renders, React needs to know which item is which. <code>key</code> tells it. Use a
stable id from the data, <b>not the array index</b>. The index changes when items are inserted or
removed, so React reuses the wrong DOM node. That is the classic bug where input text follows the wrong
row. The <b>DOM</b> is the Document Object Model, the browser's live, in-memory tree of the page. React
changes what you see by changing that tree, and it tracks each list item by its key.</p>`,
docs:[['Your first component (React)','https://react.dev/learn/your-first-component'],['Writing markup with JSX','https://react.dev/learn/writing-markup-with-jsx']],
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

<p>Props come from the parent. <b>State</b> is data a component owns and can change. You declare it with the <b>useState</b> hook, which returns the current value and a setter. Calling the setter tells React to re-render the component with the new value. You never touch the DOM yourself. The <b>DOM</b> is the Document Object Model, the browser's live, in-memory tree of the page. JavaScript changes what you see by changing that tree; React changes it for you.</p>
<div class="codeSample">function Counter() {
  const [count, setCount] = useState(0);          // [value, setter]
  return &lt;button onClick={() =&gt; setCount(count + 1)}&gt;{count}&lt;/button&gt;;
}</div>
<p>The golden rule: <b>never mutate state directly</b> (<code>count++</code> or pushing into an array in place). Always call the setter with a new value, so React knows something changed. Hooks must be called at the top level of the component, never inside loops or conditions.</p>
<h4>State changes, React re-renders</h4>
<p>Coming from jQuery-style code, the instinct is to find an element and change it. React inverts that.
You change data. React works out what the DOM should look like now, compares it with what is there, and
applies the difference. Your job is to describe <i>what the UI is</i> for a given state, never
<i>what to update</i>.</p>
<p>That's why mutation breaks it. React decides whether to re-render by comparing the new value with the
old one by reference. Mutating an array in place gives it the same reference, so nothing re-renders.
The data is correct and the screen is stale.</p>
<div class="codeSample" data-hl>items.push(newItem); setItems(items);       // same reference. NO re-render.
setItems([...items, newItem]);              // new array. renders.

setUser(u =&gt; ({ ...u, name: "Ada" }));      // objects: copy, then override
setItems(items.map(i =&gt; i.id === id ? {...i, done: true} : i));</div>

<h4>Updates are asynchronous and batched</h4>
<p>The setter doesn't change the variable. <code>count</code> is a <code>const</code> captured by this
render and holds the same value for the whole render. The setter schedules a new render. So this doesn't
do what it looks like:</p>
<div class="codeSample" data-hl>setCount(count + 1);
setCount(count + 1);     // count is still 0 in BOTH lines -> result is 1

setCount(c =&gt; c + 1);
setCount(c =&gt; c + 1);    // functional form: each gets the latest -> 2</div>
<p><b>Use the functional form whenever the new value depends on the old one.</b> It reads the current
value instead of a stale snapshot, in event handlers, timers and async callbacks alike.</p>

<h4>Why hooks must be called unconditionally</h4>
<p>React doesn't know your variable names. It tracks hooks <b>by call order</b>: first
<code>useState</code> in this component is slot 0, second is slot 1, every render. Put one inside an
<code>if</code> and the slots shift on the render where the condition flips, so your state values swap
places. Hence the rule: top level only, never in a loop, condition, or nested function.</p>

<h4>Choosing what belongs in state</h4>
<p>The most common design mistake is storing things that can be calculated. If you keep
<code>items</code> and also <code>itemCount</code>, they will disagree eventually. Derive it during
render instead. Keep the <b>minimum</b> that can't be computed from props and other state.</p>
<p>State belongs in the closest component that needs it. When two siblings need the same value,
<b>lift it</b> to their nearest common parent and pass it down with a setter. That is the standard shape
of a React application. Reaching for a global store before you have tried it usually adds machinery you
don't need.</p>`,
docs:[['State: a component memory','https://react.dev/learn/state-a-components-memory'],['useState (React)','https://react.dev/reference/react/useState']],
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
behavior:`Each click calls setCount(count + 1); React re-renders and the button shows the new number. The value is never mutated directly; the setter is what triggers the re-render.`,
hints:['useState(0) returns the current value and a setter in an array you destructure.','Update through the setter: setCount(count + 1), never count++.','onClick takes a function, so wrap the call in an arrow: () => setCount(...).']}},

{id:'ui4',title:'Lists & conditional rendering',body:`

<p>Real UIs render collections. In JSX you turn an array into elements with <code>.map()</code>. <b>JSX</b> is the HTML-looking syntax inside React components. It's not HTML: a compiler turns each tag into a JavaScript call that builds the element. Each rendered item needs a stable <b>key</b> so React can track it across re-renders. Use a real id, not the array index, when the list can reorder.</p>
<div class="codeSample">function List(props) {
  return (
    &lt;ul&gt;
      {props.items.map(item =&gt; &lt;li key={item.id}&gt;{item.name}&lt;/li&gt;)}
    &lt;/ul&gt;
  );
}</div>
<p><b>Conditional rendering</b> is plain JavaScript inside braces. <code>{isLoading &amp;&amp; &lt;Spinner /&gt;}</code> shows the spinner only when true. A ternary <code>{user ? &lt;Profile /&gt; : &lt;Login /&gt;}</code> chooses between two. There is no special template syntax.</p>

<h4>Keys: the part that causes real bugs</h4>
<p>React uses <code>key</code> to match elements between renders. Get it wrong and React reuses the
wrong DOM node. The <b>DOM</b> is the Document Object Model, the browser's live, in-memory tree of the
page, and React changes what you see by changing that tree. Reusing the wrong node shows up as <b>state attached to the wrong row</b>: a checkbox that stays
ticked after you delete the item above it, or text typed into one input appearing in another.</p>
<div class="codeSample" data-hl>// BAD: the index changes when items are inserted, removed or reordered
{items.map((item, i) =&gt; &lt;Row key={i} item={item} /&gt;)}

// GOOD: stable identity that belongs to the DATA
{items.map(item =&gt; &lt;Row key={item.id} item={item} /&gt;)}</div>
<p>Index keys are only safe when the list is append-only and never reordered or filtered. That is rarely
guaranteed for long, so use the data's own id. Keys must be unique among siblings. They are a message to
React and are not passed to your component as a prop.</p>

<h4>The falsy-zero trap</h4>
<p>When the left side of <code>&amp;&amp;</code> is falsy, that value is what gets rendered. React
renders the number <code>0</code>. <code>false</code>, <code>null</code> and <code>undefined</code>
render nothing.</p>
<div class="codeSample" data-hl>{items.length &amp;&amp; &lt;List /&gt;}          // empty list renders a literal "0"
{items.length &gt; 0 &amp;&amp; &lt;List /&gt;}     // fine, the left side is a boolean
{items.length ? &lt;List /&gt; : null}    // also fine</div>
<p>Make the left side an explicit boolean.</p>

<h4>Deriving, not storing</h4>
<p>A filtered or sorted list is <b>derived state</b>. Compute it during render. Don't keep it in its own
<code>useState</code> and sync it with an effect: two states that must agree will eventually disagree,
and that is the whole class of "stale filter" bugs.</p>
<div class="codeSample" data-hl>const visible = items.filter(i =&gt; !i.done);   // just compute it

// only if profiling shows it matters:
const visible = useMemo(() =&gt; items.filter(i =&gt; !i.done), [items]);</div>
<p>Reach for <code>useMemo</code> when a measurement says to, not by default. It has its own cost, and
filtering fifty items isn't it.</p>

<h4>Rendering the empty and loading cases</h4>
<p>Every list has at least three states, and a common bug is designing only the happy one. Handle
<b>loading</b>, <b>empty</b> and <b>error</b> explicitly. An empty result is a normal outcome that
deserves a message, not a blank area that looks like a failure.</p>`,
docs:[['Rendering lists (React)','https://react.dev/learn/rendering-lists'],['Conditional rendering','https://react.dev/learn/conditional-rendering']],
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
hints:['Turn data into elements with props.items.map(item => ...).','Each mapped element needs a unique, stable key: use item.id.','Show the value in braces: {item.name}.']}},

{id:'ui5',title:'Events & controlled forms',body:`

<p>Handle user actions by passing a function to an event prop like <code>onClick</code> or <code>onChange</code>. For inputs, React favors the <b>controlled component</b> pattern. The input value comes <i>from</i> state, and every keystroke updates that state. React is the single source of truth for what the field contains.</p>
<div class="codeSample">function NameField() {
  const [name, setName] = useState("");
  return &lt;input value={name} onChange={e =&gt; setName(e.target.value)} /&gt;;
}</div>
<p>For a whole form, keep each field in state and handle <code>onSubmit</code> on the <code>&lt;form&gt;</code>. Call <code>e.preventDefault()</code> so the browser doesn't do a full page reload. Controlled inputs make validation easy: the current values are always in state.</p>
<h4>Why React wants to own the input</h4>
<p>An uncontrolled <code>&lt;input&gt;</code> keeps its value in the DOM, where React can't see it.
The <b>DOM</b> is the Document Object Model, the browser's live, in-memory tree of the page; React normally
changes that tree for you and expects to know what's in it. Reading the value means reaching into the DOM, and any state you keep alongside it can drift out of sync.</p>
<p>Controlled inputs remove the second source of truth. The value <i>is</i> your state, rendered. The
change handler is the only way it moves. The loop looks circular until it clicks:</p>
<div class="codeSample" data-hl>state ──renders──▶ input's value
  ▲                    │
  └──setState──── onChange (user types)

// consequences that fall straight out of this:
// - the field cannot show anything your state does not contain
// - value={name} with NO onChange = a permanently read-only field
//   (React's classic "you provided a value prop without onChange" warning)
// - value={undefined} makes it uncontrolled, and switching between the
//   two mid-life warns loudly. initialize to "" not null.</div>

<h4>Events are not quite DOM events</h4>
<p>React wraps native events in a <b>SyntheticEvent</b> with a consistent API across browsers, attached at
the root rather than to each node. <code>onChange</code> fires on every keystroke, unlike the DOM's
<code>change</code>, which waits for blur. And you pass a <b>function</b>, not a call:
<code>onClick={handleClick}</code>. <code>onClick={handleClick()}</code> runs it during render and
passes the return value.</p>
<p>On forms, <code>e.preventDefault()</code> in <code>onSubmit</code> stops the browser doing a full page
navigation. Keep the handler on the <code>&lt;form&gt;</code> rather than the button, so the Enter key
works. That is an accessibility requirement.</p>

<h4>Scaling past three fields</h4>
<p>One <code>useState</code> per field gets tedious fast. A single object keyed by field name collapses
it, provided every input has a <code>name</code>:</p>
<div class="codeSample" data-hl>const [form, setForm] = useState({ name: "", email: "" });
const onChange = e =&gt;
  setForm(f =&gt; ({ ...f, [e.target.name]: e.target.value }));   // computed key

&lt;input name="email" value={form.email} onChange={onChange} /&gt;</div>

<h4>Validation timing is a UX decision</h4>
<p>Validating on every keystroke means telling someone their email is invalid at the third character.
Validate on <b>blur</b> first, then on every change <i>once the field has been touched</i>, and always
on submit. Track a <code>touched</code> set alongside the values.</p>
<p><b>Disable the submit button while the request is in flight</b>, or users will double-submit. Give
every input a <code>&lt;label htmlFor&gt;</code>. It gives screen readers the field name and makes the
label clickable for everyone else.</p>`,
docs:[['Responding to events','https://react.dev/learn/responding-to-events'],['Controlled inputs (React)','https://react.dev/reference/react-dom/components/input']],
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
<p>Components should be pure functions of props and state. Anything that reaches <i>outside</i> React (network calls, timers, subscriptions) goes in an <b>effect</b> via the <code>useEffect</code> hook. The classic use is fetching data after the component first renders.</p>
<div class="codeSample">function Users() {
  const [users, setUsers] = useState([]);
  useEffect(() =&gt; {
    fetch("/api/users").then(r =&gt; r.json()).then(setUsers);
  }, []);                                   // [] = run once, after first render
  return &lt;ul&gt;{users.map(u =&gt; &lt;li key={u.id}&gt;{u.name}&lt;/li&gt;)}&lt;/ul&gt;;
}</div>
<p>The second argument is the <b>dependency array</b>. <code>[]</code> runs the effect once. Listing values runs it again whenever they change. Omitting it runs after <i>every</i> render, which is usually a bug. Return a cleanup function to cancel subscriptions or timers when the component unmounts.</p>
<h4>What an effect is for</h4>
<p><code>useEffect</code> exists to <b>synchronize your component with something outside React</b>: the
network, a timer, a subscription, the document title, a non-React widget. That framing is more useful than
"run code after render", because it tells you when <i>not</i> to use one.</p>
<p>The most common misuse is computing a value: storing a filtered list in state and recalculating it in
an effect. That is a second render for no reason, plus a window where the two disagree. Compute it during
render. An effect that only responds to a user action belongs in the event handler, where the cause is
visible.</p>

<h4>The dependency array is a correctness contract</h4>
<div class="codeSample" data-hl>useEffect(fn)              // after EVERY render - usually a bug, often a loop
useEffect(fn, [])          // once, after the first render
useEffect(fn, [userId])    // whenever userId changes (compared by ===)

// the loop everyone writes once:
useEffect(() =&gt; { setCount(count + 1); });   // render -> effect -> state
                                              // -> render -> effect ...</div>
<p>Every reactive value the effect reads (props, state, functions defined in the component) belongs in
the array. Omit one and the effect reads a stale value from an old render. That bug only appears in the
second scenario anyone tests. Let the lint rule fill the array in. When it demands something
inconvenient, the effect is probably doing too much.</p>

<h4>Cleanup, and the race you haven't noticed</h4>
<p>The returned function runs before the next effect and on unmount. Timers and subscriptions need it.
Fetches do too. If <code>userId</code> changes quickly, two requests are in flight and <b>they can
resolve out of order</b>, so the first response overwrites the second. The user sees the wrong data with
no error anywhere.</p>
<div class="codeSample" data-hl>useEffect(() =&gt; {
  const ac = new AbortController();
  fetch("/api/users/" + userId, { signal: ac.signal })
    .then(r =&gt; r.json()).then(setUser)
    .catch(e =&gt; { if (e.name !== "AbortError") setError(e); });
  return () =&gt; ac.abort();        // cancel the previous request
}, [userId]);</div>
<p>In development, React 18's Strict Mode deliberately mounts, unmounts and remounts every component to
surface this class of bug. If something double-fires only in development, that isn't noise. Strict Mode
is telling you the cleanup is missing.</p>

<h4>The three states every fetch has</h4>
<p>Loading, error, and data. A component that renders only the third will flash empty and then fail
silently when the request does. Handle all three from the start.</p>
<p>Fetching in <code>useEffect</code> means data loads only after the component renders, and every
component does its own caching, deduplication and revalidation badly. Production applications use a data
library (TanStack Query, SWR) or a framework's loader. Learn the effect first so the library isn't
magic. Then stop hand-rolling this.</p>`,
docs:[['Synchronizing with effects','https://react.dev/learn/synchronizing-with-effects'],['Fetching data (React)','https://react.dev/learn/you-might-not-need-an-effect#fetching-data']],
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

<p>The front end and back end are separate programs that talk over the network. Your React app almost always talks to an HTTP API. The method depends on the shape of the data flow:</p>
<ul>
<li><b>REST over fetch</b>: the default. Send JSON with the right method (GET/POST/PUT/DELETE) and read JSON back. Covers most apps.</li>
<li><b>WebSocket</b>: a persistent two-way connection for real-time, bidirectional data (chat, live dashboards, multiplayer).</li>
<li><b>Server-Sent Events (SSE)</b>: a one-way stream from server to client (notifications, live feeds). Simpler than WebSocket when you only need push.</li>
<li><b>GraphQL</b>: one endpoint where the client asks for the fields it needs, avoiding over- and under-fetching.</li>
</ul>
<p>In the browser, writes send <code>Content-Type: application/json</code> with a <code>JSON.stringify</code> body. Cross-origin calls need the server to allow them via <b>CORS</b>, or you route through a dev <b>proxy</b> so the browser sees a same-origin URL. CORS is cross-origin resource sharing. Browsers refuse to let a page read a response from a different site unless that server says, in a response header, that the page's site is allowed. It's fixed on the server, never in your code. Always <code>await</code> the response and handle non-2xx status.</p>
<div class="codeSample">const res = await fetch("/api/users", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(user)
});</div>

<h4>Choosing among the four</h4>
<p>The decision is about the direction and frequency of the data. <b>REST over fetch</b> covers request/response, which is most of what an app does. <b>SSE</b> is the answer for server-to-client push over ordinary HTTP. It reconnects automatically, carries an event id so the server can resume, and needs no new protocol. <b>WebSocket</b> earns its complexity only when the client also sends often: chat, collaborative editing, multiplayer. <b>GraphQL</b> is a query-shape decision, not a transport one. It pays off when many clients need different subsets of the same graph. For a single client and a stable API it is mostly extra machinery.</p>

<h4>The parts everyone gets wrong once</h4>
<ul>
<li><b><code>fetch</code> doesn't reject on 4xx or 5xx.</b> It resolves, with <code>ok: false</code>. Code that only catches network errors will parse an error page as data. Check <code>res.ok</code> before <code>res.json()</code>, every time.</li>
<li><b>Cancel in-flight requests.</b> A component that unmounts while its fetch is running will try to set state on nothing. Pass an <code>AbortController</code> signal and abort in the effect's cleanup. That also fixes the race where a slow first response overwrites a fast second one.</li>
<li><b>Errors need a place to go.</b> Every request has three visible states (loading, error, data). A UI that renders only the third looks broken when the network is.</li>
<li><b>Credentials are opt-in.</b> Cookies don't travel cross-origin unless you set <code>credentials: "include"</code>. Then the server must allow credentials and name a single origin rather than <code>*</code>.</li>
</ul>
<p>CORS decides whether your script may <i>read</i> the response, not whether the request was sent. A dev proxy makes the browser see a same-origin URL. That is why a call that works locally can fail in production, where the proxy is gone.</p>`,
docs:[['Using fetch (MDN)','https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch'],['WebSocket (MDN)','https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API'],['Server-sent events (MDN)','https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events']],
ex:{title:'POST JSON to the backend',lang:'js',run:{call:'createUser',mock:'fetch',cases:[{name:'sends a JSON POST to /api/users with the user in the body',args:[{name:'Ada'}],expect:{method:'POST',url:'/api/users',contentType:'application/json',bodyIncludes:'Ada'}}]},
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
<p><b>useReducer</b> centralizes complex update logic into one pure function, the same idea as a Redux reducer. You dispatch <i>actions</i> and the reducer returns the next state. Updates become predictable and testable.</p>
<div class="codeSample">function reducer(state, action) {
  switch (action.type) {
    case "inc": return { count: state.count + 1 };
    case "dec": return { count: state.count - 1 };
    default:    return state;
  }
}</div>
<p><b>Context</b> solves "prop drilling": passing a value through many layers. A provider makes a value available to any descendant via <code>useContext</code>. It suits the current user, theme, or locale. Reach for an external store (Redux, Zustand) only when context plus reducers stop scaling. Most apps never need to. Lift shared state to the nearest common parent before reaching for anything fancier.</p>

<h4>When a reducer beats useState</h4>
<p>The tell isn't the amount of state but the <b>relationships</b> in it. Two fields must change together. The next value depends on the previous one. The same update is dispatched from several places. A reducer collects that logic in one pure function you can read and test without rendering anything. Scattered <code>setX</code> calls across six handlers is how a component becomes untouchable.</p>
<p>Because the reducer is pure, the tests are ordinary function tests: given this state and this action, expect that state. No component, no DOM, no mocking. The <b>DOM</b> is the Document Object Model, the browser's live, in-memory tree of the page, the thing React changes for you. A reducer test never builds one.</p>

<h4>Context is not a state manager</h4>
<p>Context is a delivery mechanism. It moves a value down the tree without threading it through props. It has no store, no selectors and no way to update a subscriber without re-rendering everything that consumes it. That last property is the limit. Put a rapidly-changing value in a context near the root, and every consumer re-renders on every change, however little of it they use. The fixes: split one context into several, stable configuration apart from volatile data, or pass the dispatch function through its own context, since dispatch never changes identity.</p>

<h4>The escalation order</h4>
<p>Reach for the smallest thing that works. Local <code>useState</code>. Lift the state to the nearest common parent. <code>useReducer</code> when the updates get related. Context when the depth hurts. A dedicated store only when profiling shows context re-renders are the problem or the state outlives the tree. Most applications stop at step three or four.</p>
<p>One category belongs in none of the above, and putting it there is the most common architectural mistake in React apps: <b>server data is not application state</b>. Cached responses need staleness, refetching, deduplication and invalidation. Data-fetching libraries provide that. A reducer doesn't. Keeping the two separate stops a store from becoming a hand-written cache with no eviction.</p>`,
docs:[['useReducer (React)','https://react.dev/reference/react/useReducer'],['Passing data with context','https://react.dev/learn/passing-data-deeply-with-context']],
ex:{title:'Write a reducer',lang:'js',run:{call:'reducer',cases:[{name:'inc increments count',args:[{count:0},{type:'inc'}],expect:{count:1}},{name:'dec decrements count',args:[{count:5},{type:'dec'}],expect:{count:4}},{name:'unknown action returns state unchanged',args:[{count:2},{type:'noop'}],expect:{count:2}}]},
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

<p>The front end runs on the user's machine, fully inspectable, so security is about what you send there and how you render it. The dominant threat is <b>XSS</b> (Cross-Site Scripting): an attacker gets their script to run in your page and steals sessions or data. React <b>auto-escapes</b> everything you interpolate with <code>{ }</code>, rendering user text as text, never as HTML.</p>
<div class="codeSample">function Comment(props) {
  return &lt;p&gt;{props.text}&lt;/p&gt;;   // safe: React escapes props.text
}
// DANGER: dangerouslySetInnerHTML re-opens the XSS hole; avoid it,
// and if unavoidable, sanitize with a library like DOMPurify first.</div>
<p>The rest of the checklist:</p>
<ul>
<li><b>Never use <code>dangerouslySetInnerHTML</code></b> with untrusted input. Sanitize if you must inject HTML.</li>
<li><b>Content-Security-Policy (CSP)</b>: a response header that blocks injected and inline scripts. Your strongest XSS backstop.</li>
<li><b>Token storage</b>: prefer an <b>HttpOnly cookie</b> for the session so page JavaScript (and any XSS) can't read it. <code>localStorage</code> is readable by any script.</li>
<li><b>CSRF</b>: for cookie-based auth, defend with <code>SameSite</code> cookies and anti-CSRF tokens.</li>
<li><b>Clickjacking</b>: send <code>X-Frame-Options: DENY</code> or a <code>frame-ancestors</code> CSP so your app can't be framed.</li>
<li><b>Secrets &amp; dependencies</b>: never ship API secrets in the bundle. Run <code>npm audit</code> to catch vulnerable packages (supply-chain risk).</li>
</ul>

<h4>Where React's escaping stops</h4>
<p>Auto-escaping covers text interpolated with <code>{ }</code>. It doesn't cover four places, and every real React XSS lives in one of them: <code>dangerouslySetInnerHTML</code>; a URL built from user input, where <code>javascript:</code> as an <code>href</code> executes on click; props spread blindly onto an element (<code>{...userProvided}</code>), which can inject an <code>onError</code> handler; and anything rendered outside React, such as a third-party widget handed raw HTML.</p>
<p>If user HTML must be rendered (a rich-text field), sanitize it with a maintained library (DOMPurify) on an allowlist basis. Do it on the server too. Anything done only in the browser is done by an attacker's browser too.</p>

<h4>The storage argument</h4>
<p>"Cookies, not localStorage" is right but often overstated. An <code>HttpOnly</code> cookie can't be read by injected script, which removes the easy theft of a token. It doesn't stop that script from <i>using</i> the session, since the browser attaches the cookie to its requests automatically. Cookies raise the cost of XSS rather than neutralizing it, and they add CSRF for <code>SameSite</code> and anti-CSRF tokens to answer.</p>
<p>The defensible position: <code>HttpOnly; Secure; SameSite=Lax</code> cookies, short-lived tokens, and a real CSP. If you have XSS, no storage choice saves you. That is the argument for the BFF pattern: no token in the browser at all. A <b>BFF</b> is a backend-for-frontend: a small server that sits between the browser and the APIs and holds the tokens, so the browser only ever has a cookie and never a token that JavaScript could steal.</p>

<h4>Two rules the front end cannot break</h4>
<p><b>Nothing in the bundle is secret.</b> Every API key, feature flag and internal URL you ship is public, including environment variables your bundler inlined. Secrets live on a server you control.</p>
<p><b>Client-side checks are UX, not security.</b> Hiding an admin button is a courtesy. The API must reject the call regardless, because the button was never the control. Every check that matters is re-done on the server. The API stream teaches the same lesson from the other side.</p>`,
docs:[['XSS prevention (OWASP)','https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html'],['dangerouslySetInnerHTML (React)','https://react.dev/reference/react-dom/components/common#dangerously-setting-the-inner-html'],['CSP (MDN)','https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP']],
ex:{title:'Render user content safely',lang:'jsx',
prompt:`Write a <code>Comment</code> component that safely displays untrusted <code>props.text</code> by interpolating it inside a <code>&lt;p&gt;</code> with <code>{props.text}</code> (letting React auto-escape it). Do <b>not</b> use <code>dangerouslySetInnerHTML</code>.`,
starter:`function Comment(props) {
  // render props.text safely, let React escape it
}`,
solution:`function Comment(props) {
  return <p>{props.text}</p>;
}`,
tests:[{d:'renders inside a paragraph',re:'<p>'},{d:'interpolates props.text so React escapes it',re:'\\{\\s*props\\.text\\s*\\}'},{d:'does NOT use dangerouslySetInnerHTML',re:'dangerouslySetInnerHTML',not:true}],
behavior:`Comment({text:"<img src=x onerror=alert(1)>"}) renders that string as visible text, not as an executing tag, because React escapes interpolated values. Reaching for dangerouslySetInnerHTML would turn it back into a live XSS payload.`,
hints:['Interpolating with {props.text} makes React escape the value automatically.','Avoid dangerouslySetInnerHTML entirely for untrusted input.','No sanitizer is needed when you render as text rather than HTML.']}},

]});
