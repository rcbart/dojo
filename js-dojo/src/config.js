/* JS Dojo configuration. Loaded BEFORE the shared runtime so it can override
   the domain grouping and the home-page copy. DOJO_NO_IAM_MERGE keeps the
   engine from folding any stream into an "Identity and Access" group — this
   course has no identity content. */
const DOJO_NO_IAM_MERGE = true;

/* Home-page copy. Without this the shared engine falls back to Dev Dojo's. */
const DOJO_HOME = {
  name: 'JS Dojo',
  icon: '🟨',
  pageTitle: 'JS Dojo — JavaScript & Node, from the ground up',
  title: 'Welcome to JS Dojo \u{1F7E8}',
  intro: '<b>Why is this dojo here?</b> Because I want to leave nothing to chance and assume nothing. '
       + 'Exercises all across this site run in JavaScript — a decision I made to keep the lesson tooling '
       + 'simple and self-contained, with nothing to install and nothing to configure. That decision comes '
       + 'with a duty: if JS is the language everything else is practiced in, you deserve a place to learn '
       + 'it properly. This is that place. Work through the examples, quizzes and exercises here and '
       + 'you will have the background for everything else on the site. <b>If you are starting from '
       + 'nothing, this is the dojo to start with.</b><br><br>'
       + '<b>16 streams cover the whole road</b>: the language core, how it really works underneath, '
       + 'the event loop, the browser, two full streams of debugging, modules and TypeScript, and Node '
       + 'all the way to a real HTTP server.<br><br>'
       + 'The order is deliberate: you meet <b>values and types</b> before anything that manipulates them, '
       + '<b>the call stack</b> before closures, and <b>the event loop</b> before a single promise. Coercion, '
       + 'closures, <code>this</code>, prototypes, promises and async/await are each taken apart until the '
       + 'surprising behaviour stops being surprising. The browser then gets a stream of its own — the DOM, '
       + 'events, <code>fetch</code> and forms — because that is where most JavaScript actually lives. '
       + 'From there: generators, the EventEmitter pattern, security, memory and workers, each one placed '
       + 'where you have the background to understand it.<br><br>'
       + 'Two streams are devoted to <b>debugging</b>, because it is the skill nobody teaches: reading a stack '
       + 'trace properly, breakpoints and the scope pane, the Network panel, tracing an OAuth redirect flow end '
       + 'to end, <code>node --inspect</code>, heap snapshots and CPU profiles. '
       + '<b>Most exercises here run for real</b> — your function is called with real inputs in a sandboxed '
       + 'worker and its return value checked, not pattern-matched.'
};
/* Only streams that EXIST are listed. Adding a stream to the manifest means
   adding its title here too, or it will not appear under any domain. */
const DOJO_DOMAINS = [
  {name:'The Language',icon:'\u{1F7E8}',titles:[
    'JavaScript Foundations',
    'Control Flow & Functions',
    'Objects, Arrays & Data']},
  {name:'How JavaScript Really Works',icon:'\u{2699}\u{FE0F}',titles:[
    'Functions in Depth: Scope, Closures & this',
    'Prototypes, Classes & Objects in Depth']},
  {name:'Asynchronous JavaScript',icon:'\u{23F3}',titles:[
    'The Event Loop & Asynchronous JavaScript']},
  {name:'The Browser',icon:'\u{1F310}',titles:[
    'The Browser: DOM, Events & fetch',
    'Debugging in the Browser']},
  {name:'Errors & Debugging',icon:'\u{1F41B}',titles:[
    'Errors, Exceptions & the Debugging Method']},
  {name:'Code at Scale',icon:'\u{1F4E6}',titles:[
    'Modules, Packages & Tooling',
    'TypeScript: Types for JavaScript']},
  {name:'Node.js',icon:'\u{1F7E9}',titles:[
    'The Node Runtime',
    'Files, Streams & the Node Standard Library',
    'Building an HTTP Server',
    'Debugging, Testing & Profiling Node']},
  {name:'Capstone',icon:'\u{26E9}\u{FE0F}',titles:[
    'JavaScript Capstone']}
];

/* Glossary scope: JS Dojo shows its own vocabulary plus the two shared domains its
   lessons genuinely draw on — HTTP semantics in the server stream, and the identity
   terms used when tracing an OAuth flow in the browser-debugging stream. */
const DOJO_GLOSS_DOMAINS = [
  'JavaScript & Node',
  'Web & HTTP',
  'Identity & Access (IAM)'
];
