/* JS Dojo configuration. Loaded BEFORE the shared runtime so it can override
   the domain grouping and the home-page copy. DOJO_NO_IAM_MERGE keeps the
   engine from folding any stream into an "Identity and Access" group, this
   course has no identity content. */
const DOJO_NO_IAM_MERGE = true;

/* Home-page copy. Without this the shared engine falls back to Dev Dojo's. */
const DOJO_HOME = {
  name: 'JS Dojo',
  icon: '',
  pageTitle: 'JS Dojo: JavaScript & Node, from the ground up',
  title: 'Welcome to JS Dojo \u{1F7E8}',
  intro: '<b>Why is this dojo here?</b> Because I want to leave nothing to chance and assume nothing. '
       + 'A good part of the graded work in Dev Dojo and Identity Dojo is written in JavaScript, alongside '
       + 'Java, SQL and shell, a decision I made to keep the lesson tooling simple and self-contained, with '
       + 'nothing to install and nothing to configure. That decision comes with a duty: if JS is the language '
       + 'a lot of the practice happens in, you deserve a place to learn it properly. This is that place. '
       + '<b>If you are starting from nothing, this is the gentlest dojo to start with.</b> It is not a '
       + 'prerequisite for everything, though: ML Dojo is Python and carries its own on-ramp, and the '
       + 'cloud-native path needs neither.<br><br>'
       + '<b>16 streams cover the whole road</b>: the language core, how it really works underneath, '
       + 'the event loop, the browser, two full streams of debugging, modules and TypeScript, and Node '
       + 'all the way to a real HTTP server.<br><br>'
       + 'The order is deliberate: you meet <b>values and types</b> before anything that manipulates them, '
       + '<b>the call stack</b> before closures, and <b>the event loop</b> before a single promise. Coercion, '
       + 'closures, <code>this</code>, prototypes, promises and async/await are each taken apart until the '
       + 'surprising behaviour stops being surprising. The browser then gets a stream of its own, the DOM, '
       + 'events, <code>fetch</code> and forms, because that is where most JavaScript actually lives. '
       + 'From there: generators, the EventEmitter pattern, security, memory and workers, each one placed '
       + 'where you have the background to understand it.<br><br>'
       + 'Two streams are devoted to <b>debugging</b>, because it is the skill nobody teaches: reading a stack '
       + 'trace properly, breakpoints and the scope pane, the Network panel, tracing an OAuth redirect flow end '
       + 'to end, <code>node --inspect</code>, heap snapshots and CPU profiles. '
       + '<b>Most exercises here run for real</b>, your function is called with real inputs in a sandboxed '
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
   lessons genuinely draw on: HTTP semantics in the server stream, and the identity
   terms used when tracing an OAuth flow in the browser-debugging stream. */
const DOJO_GLOSS_DOMAINS = [
  'JavaScript & Node',
  'Web & HTTP',
  'Identity & Access (IAM)'
];

/* The recommended route. Debugging arrives third on purpose: it is the skill
   that makes every later stream cheaper, and it is the one nobody teaches
   first. Without this the shared engine falls back to Dev Dojo's Java route,
   which used to send JS Dojo readers off to install a JDK. */
const DOJO_PATH_INTRO = 'is ordered so that nothing depends on something you have not met yet. This is the route I would take through it. The surprising parts of JavaScript are surprising mostly because people meet them out of order, so the sequence here is doing real work. Jump around once the language core is in, this is a suggestion, not a cage.';
const DOJO_PATH = [
  ['\u2B1C White','The language core',
   'Take <b>JavaScript Foundations</b>, <b>Control Flow &amp; Functions</b>, and <b>Objects, Arrays &amp; Data</b> in that order. Values and types come before anything that manipulates them, on purpose. Nothing to install: every exercise here runs for real in the page.'],
  ['\uD83D\uDFE1 Yellow','Reading a failure',
   'Do <b>Errors, Exceptions &amp; the Debugging Method</b> now rather than later. Reading a stack trace properly, and having a method instead of a guess, makes every stream after this one faster. Most courses put debugging last, which is exactly backwards.'],
  ['\uD83D\uDFE0 Orange','How it really works',
   'Take <b>Functions in Depth: Scope, Closures &amp; this</b>, then <b>Prototypes, Classes &amp; Objects in Depth</b>. The call stack before closures, and closures before <code>this</code>. This is where the language stops surprising you.'],
  ['\uD83D\uDFE2 Green','Asynchrony',
   'Take <b>The Event Loop &amp; Asynchronous JavaScript</b>. The loop itself comes before a single promise, because a promise you meet before the loop is a magic box. Callbacks, microtasks, promises, then async/await.'],
  ['\uD83D\uDD35 Blue','The browser',
   'Do <b>The Browser: DOM, Events &amp; fetch</b>, then <b>Debugging in the Browser</b>: breakpoints and the scope pane, the Network panel, and tracing an OAuth redirect end to end. This is where most JavaScript actually lives, and where most of it is actually debugged.'],
  ['\uD83D\uDFE3 Purple','Code other people can use',
   'Take <b>Modules, Packages &amp; Tooling</b> and <b>TypeScript: Types for JavaScript</b>. Modules and npm before types, because types are a description of a structure you need to already have.'],
  ['\uD83D\uDFE4 Brown','Node',
   'Work through <b>The Node Runtime</b>, <b>Files, Streams &amp; the Node Standard Library</b>, and <b>Building an HTTP Server</b>. Same language, a completely different set of globals, which is the distinction the very first lesson set up.'],
  ['\u26AB Black','Making it hold up',
   'Finish with <b>Debugging, Testing &amp; Profiling Node</b>: <code>node --inspect</code>, heap snapshots and CPU profiles. Then prove the lot in the <b>JavaScript Capstone</b>. With this behind you the exercises in Dev Dojo and Identity Dojo are no longer a language problem.'],
];


/* Alpha testers, credited on this course's home screen by the shared engine.
   Format: { name: 'Jane Doe', url: 'https://www.linkedin.com/in/...' }, url
   optional. While the list is empty the home screen shows the recruiting
   card instead. Add a person the day they finish, not later. */
const DOJO_ALPHA = [];
