/* JSDojo configuration. Loaded BEFORE the shared runtime so it can override
   the domain grouping and the home-page copy. DOJO_NO_IAM_MERGE keeps the
   engine from folding any stream into an "Identity and Access" group — this
   course has no identity content. */
const DOJO_NO_IAM_MERGE = true;

/* Home-page copy. Without this the shared engine falls back to DevDojo's. */
const DOJO_HOME = {
  name: 'JSDojo',
  title: 'Welcome to JSDojo \u{1F7E8}',
  intro: 'JavaScript from the ground up, assuming nothing. <b>5 of a planned 15 streams are written</b> — '
       + 'the language core and the event loop. Debugging, modules, TypeScript and Node are next.<br><br>'
       + 'The order is deliberate: you meet <b>values and types</b> before anything that manipulates them, '
       + '<b>the call stack</b> before closures, and <b>the event loop</b> before a single promise. Coercion, '
       + 'closures, <code>this</code>, prototypes, promises and async/await are each taken apart until the '
       + 'surprising behaviour stops being surprising. Then modules and npm, the Node runtime, files and '
       + 'streams, a real HTTP server, testing and TypeScript.<br><br>'
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
  {name:'Errors & Debugging',icon:'\u{1F41B}',titles:[
    'Errors, Exceptions & the Debugging Method',
    'Debugging in the Browser']},
  {name:'Code at Scale',icon:'\u{1F4E6}',titles:[
    'Modules, Packages & Tooling']},
  {name:'Node.js',icon:'\u{1F7E9}',titles:[
    'The Node Runtime',
    'Files, Streams & the Node Standard Library',
    'Building an HTTP Server',
    'Debugging, Testing & Profiling Node']}
];
