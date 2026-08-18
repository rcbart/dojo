STREAMS.push({icon:'📚',title:'Modules, Packages & Tooling',blurb:'Splitting code across files and depending on other people\'s: ES modules and CommonJS and why both exist, package.json and what each field does, npm and semver, lockfiles and why they are committed, supply-chain risk, and what a bundler actually does.',lessons:[

{id:'js34',title:'ES modules',body:`
<p>Before 2015 JavaScript had no way to split a program across files. Everything shared one global scope,
load order mattered, and name collisions were a genuine hazard. <b>ES modules</b> (ESM) are the language's
answer, and they are what all new code uses.</p>

<div class="codeSample" data-hl>// math.js
export function add(a, b) { return a + b; }      // named export
export const PI = 3.14159;
export default class Calculator { }              // ONE default per module

// app.js
import Calculator, { add, PI } from "./math.js";  // default first, then named
import { add as sum } from "./math.js";           // rename on import
import * as math from "./math.js";                // everything as a namespace
import "./setup.js";                              // run it, import nothing</div>

<h4>Four things that are true of every module</h4>
<p><b>Its own scope.</b> A top-level <code>const</code> is private to the file unless exported. No more
accidental globals.</p>
<p><b>Always strict mode.</b> No opt-in required, and no sloppy-mode surprises.</p>
<p><b>Evaluated once.</b> Importing the same module from ten files runs it once and shares one instance,
which is what makes a module a natural singleton, for better and worse.</p>
<p><b>Static structure.</b> Imports are resolved <i>before</i> any code runs, which is what enables
tree-shaking and lets tools know your dependency graph without executing anything.</p>

<h4>The consequence of "static": imports are hoisted</h4>
<div class="codeSample" data-hl>console.log("first?");
import { x } from "./x.js";   // this is evaluated BEFORE the log above

// and this is why you cannot do:
if (condition) import { a } from "./a.js";   // SyntaxError

// for a genuinely conditional or lazy load, use the dynamic form:
const mod = await import("./heavy.js");      // returns a PROMISE
// which is how route-based code splitting works in every framework.</div>

<h4>Named or default?</h4>
<p><b>Prefer named exports.</b> They are checked at build time (a typo is an error rather than
<code>undefined</code>), they autocomplete, they are greppable, and every importer uses the same name so
the codebase stays searchable. A default export can be renamed to anything by each importer, which
quietly makes a symbol impossible to find.</p>

<h4>Extensions and paths</h4>
<div class="codeSample" data-hl>import { a } from "./a.js";     // relative: MUST start with ./ or ../
                                 // and in Node the .js extension is REQUIRED
import lodash from "lodash";    // bare specifier: resolved from node_modules
import data from "./d.json" with { type: "json" };   // import attributes

// bundlers historically allowed "./a" without the extension. Node does
// not, and neither do browsers - which is why code that worked under a
// bundler breaks the first time it runs natively.</div>

<h4>Circular imports</h4>
<p>A imports B and B imports A. ESM handles it without crashing (the second import gets a partially
initialised module), but that usually means reading a binding that is still in its temporal dead zone,
producing a <code>ReferenceError</code> or, worse, an <code>undefined</code> that flows onward. Treat a
cycle as a design signal: extract the shared piece into a third module.</p>`,
docs:[['MDN (JavaScript modules)','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules'],['MDN (import)','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import'],['Node (ECMAScript modules)','https://nodejs.org/api/esm.html']],
ex:{title:'Resolve a module specifier',diff:'easy',lang:'js',
run:{call:'specifierKind',cases:[
 {name:'a relative path',args:['./math.js'],expect:'relative'},
 {name:'a parent-relative path',args:['../lib/util.js'],expect:'relative'},
 {name:'a bare specifier resolves from node_modules',args:['lodash'],expect:'bare'},
 {name:'a scoped package is still bare',args:['@scope/pkg'],expect:'bare'},
 {name:'an absolute path',args:['/opt/app/x.js'],expect:'absolute'},
 {name:'a URL',args:['https://cdn.example/x.js'],expect:'url'},
 {name:'a subpath import',args:['#internal/db'],expect:'internal'}]},
prompt:`Write <code>function specifierKind(spec)</code>: starts with <code>"./"</code> or <code>"../"</code>&rarr;<code>"relative"</code>; starts with <code>"/"</code>&rarr;<code>"absolute"</code>; starts with <code>"http"</code>&rarr;<code>"url"</code>; starts with <code>"#"</code>&rarr;<code>"internal"</code>; anything else&rarr;<code>"bare"</code>. Order your checks so each is unambiguous.`,
starter:`function specifierKind(spec) {
  return null;
}`,
solution:`function specifierKind(spec) {
  if (spec.startsWith("./") || spec.startsWith("../")) return "relative";
  if (spec.startsWith("/")) return "absolute";      // AFTER the relative check
  if (spec.startsWith("http")) return "url";
  if (spec.startsWith("#")) return "internal";      // package "imports" field
  return "bare";                                     // resolved from node_modules
}`,
tests:[{d:'detects relative specifiers',re:'"\\./"'},{d:'detects absolute paths',re:'"/"'},{d:'detects URLs',re:'"http"'},{d:'bare specifiers are the fallback',re:'"bare"'}],
behavior:`Order is executed rather than described: "./math.js" does not start with "/" so the two checks happen to be independent here, but "../lib" and a leading "/" are easy to confuse if you test the shorter prefix first. Scoped packages like @scope/pkg are bare specifiers, which is what the fourth case pins down.`,
hints:['startsWith answers each of these directly.','Check the two-character relative prefixes before the single-character absolute one.','Everything unrecognised is a bare specifier: a package name.']}},

{id:'js35',title:'CommonJS, and the two-module-system problem',body:`
<p>Node existed for six years before the language had modules, so it invented its own system:
<b>CommonJS</b>. Millions of packages use it, so you will read it and occasionally have to interoperate
with it, which is where the difficulty lives.</p>

<div class="codeSample" data-hl>// math.js  (CommonJS)
function add(a, b) { return a + b; }
module.exports = { add };            // or: exports.add = add;

// app.js
const { add } = require("./math");   // note: extension optional
const fs = require("node:fs");</div>

<h4>The differences that actually matter</h4>
<div class="codeSample" data-hl>                ESM                      CommonJS
syntax          import / export          require / module.exports
resolution      STATIC, before running   DYNAMIC, at the moment of the call
loading         asynchronous             SYNCHRONOUS - it blocks
conditional     no (use import())        yes: if (x) require("y")
extensions      required                 optional
top-level await yes                      no
tree-shaking    yes - the graph is known no - the graph is not
strict mode     always                   opt-in
__dirname       no (use import.meta.url) yes</div>
<p>The static/dynamic split is the root of everything else. Because ESM's graph is known before
execution, tools can drop unused exports; because CommonJS is a function call that could take any string,
they cannot.</p>

<h4>Which one is a file? Node's rules</h4>
<div class="codeSample" data-hl>package.json  "type": "module"     -> .js files are ESM
package.json  "type": "commonjs"   -> .js files are CJS  (the default)
.mjs                                -> always ESM, whatever the package says
.cjs                                -> always CJS

// so the two errors you will meet:
"Cannot use import statement outside a module"
     -> the file is being treated as CommonJS. set "type": "module".
"require() of ES Module ... not supported"
     -> a CJS file tried to require an ESM one. see below.</div>

<h4>Interop, warts and all</h4>
<p><b>ESM can import CommonJS.</b> It works, and it gives you the whole <code>module.exports</code> object
as the default export, so named imports may or may not exist depending on whether Node's static analysis
could detect them.</p>
<p><b>CommonJS could not <code>require</code> ESM</b> for years, because <code>require</code> is
synchronous and ESM loading is asynchronous. The workaround was dynamic <code>await import()</code>.
Recent Node versions have added support for requiring synchronous ES modules, which softens this, but the
asymmetry is why so many packages still ship both formats.</p>

<h4>Where the pain shows up</h4>
<p>A package's <code>exports</code> field can offer different entry points per format, per environment
(browser, node), per condition (import, require, types). Get it wrong and consumers see confusing
resolution errors, which is why "dual-package" publishing is one of the genuinely fiddly parts of the
ecosystem, and why new projects should simply be ESM-only unless they must support old consumers.</p>

<h4>What to write</h4>
<p><b>ESM, for anything new.</b> It is the standard, it works in browsers and Node, and it enables
tree-shaking. Learn CommonJS to read existing code, understand the error messages, and know why a package
you depend on behaves oddly.</p>`,
docs:[['Node (CommonJS modules)','https://nodejs.org/api/modules.html'],['Node (determining module system)','https://nodejs.org/api/packages.html#determining-module-system'],['Node (package entry points)','https://nodejs.org/api/packages.html#package-entry-points']],
ex:{title:'Which module system is this file?',diff:'easy',lang:'js',
run:{call:'moduleSystem',cases:[
 {name:'.mjs is always ESM',args:['app.mjs','commonjs'],expect:'esm'},
 {name:'.cjs is always CommonJS',args:['app.cjs','module'],expect:'commonjs'},
 {name:'.js follows type: module',args:['app.js','module'],expect:'esm'},
 {name:'.js follows type: commonjs',args:['app.js','commonjs'],expect:'commonjs'},
 {name:'.js with no type field defaults to CommonJS',args:['app.js',''],expect:'commonjs'},
 {name:'the extension beats the package type',args:['app.mjs','module'],expect:'esm'}]},
prompt:`Write <code>function moduleSystem(filename, packageType)</code>. A <code>.mjs</code> extension is always <code>"esm"</code> and <code>.cjs</code> is always <code>"commonjs"</code>, whatever the package says. Otherwise a <code>packageType</code> of <code>"module"</code> means <code>"esm"</code>, and anything else, including an empty string, means <code>"commonjs"</code>.`,
starter:`function moduleSystem(filename, packageType) {
  return null;
}`,
solution:`function moduleSystem(filename, packageType) {
  if (filename.endsWith(".mjs")) return "esm";        // extension WINS
  if (filename.endsWith(".cjs")) return "commonjs";
  return packageType === "module" ? "esm" : "commonjs";  // default is CJS
}`,
tests:[{d:'.mjs is always ESM',re:'"\\.mjs"'},{d:'.cjs is always CommonJS',re:'"\\.cjs"'},{d:'otherwise the package type decides',re:'"module"'}],
behavior:`The last case executes the precedence: a .mjs file inside a "type": "module" package is still ESM, but so is a .mjs file inside a CommonJS one: the extension is unconditional. The fifth case pins the default: no type field means CommonJS, which is why "Cannot use import statement outside a module" is the error people hit first.`,
hints:['Check the explicit extensions first; they override everything.','Only .js files consult the package type.','The default when there is no type field is CommonJS.']}},

{id:'js36',title:'package.json, npm and semver',body:`
<p><code>package.json</code> is the manifest for a JavaScript project: what it is, what it needs, and how
to run it. Every field earns its place.</p>

<div class="codeSample" data-hl>{
  "name": "my-app",
  "version": "1.4.2",
  "type": "module",              // .js files are ESM
  "main": "./dist/index.js",     // legacy entry point
  "exports": { ".": "./dist/index.js" },   // modern, and it LIMITS what
                                            // consumers can import
  "engines": { "node": ">=20" },  // documents the runtime you support
  "scripts": {
    "dev":  "node --watch src/index.js",
    "test": "node --test",
    "lint": "eslint ."
  },
  "dependencies":     { "express": "^4.19.2" },  // needed at RUNTIME
  "devDependencies":  { "eslint": "^9.0.0" },    // build/test only
  "peerDependencies": { "react": ">=18" }        // the HOST must supply it
}</div>
<p>The dependency split is not cosmetic: <code>dependencies</code> are installed for anyone who depends on
you, <code>devDependencies</code> are not. Putting a test framework in the wrong one ships it to every
consumer.</p>

<h4>Semantic versioning</h4>
<div class="codeSample" data-hl>MAJOR . MINOR . PATCH        4    .   19  .   2
  |       |       └── backwards-compatible bug fixes
  |       └────────── backwards-compatible new features
  └────────────────── BREAKING changes

// the range operators, and what they actually allow:
"4.19.2"    exactly this. no updates.
"~4.19.2"   patch only:  >=4.19.2 <4.20.0
"^4.19.2"   minor+patch: >=4.19.2 <5.0.0     <- npm's default
"*"         anything. never do this.

// the 0.x exception that surprises people:
"^0.5.2"    -> >=0.5.2 <0.6.0    caret treats 0.x MINOR as breaking,
                                  because pre-1.0 packages break freely.</div>

<h4>Lockfiles</h4>
<p><code>package.json</code> records <b>ranges</b>; <code>package-lock.json</code> records the <b>exact
version of every package in the tree</b>, including transitive ones. Without it, two installs a week apart
produce different node_modules and "works on my machine" becomes literally true.</p>
<div class="codeSample" data-hl>npm install    reads package.json, RESOLVES ranges, WRITES the lockfile
npm ci         reads the LOCKFILE ONLY, deletes node_modules, installs
               exactly what is pinned. deterministic, faster, and the
               right command for CI and for any production build.

// commit the lockfile. always. including for libraries - it does not
// affect your consumers, and it makes YOUR builds reproducible.</div>

<h4>Scripts</h4>
<p><code>npm run x</code> executes the <code>x</code> script with <code>node_modules/.bin</code> on the
PATH, which is why you can write <code>eslint .</code> without a global install. <code>npx</code> runs a
binary from a package without installing it permanently: convenient, and worth a moment's thought before
you point it at an unfamiliar package name.</p>

<h4>Supply chain, briefly and seriously</h4>
<p>Installing a package runs its code on your machine, and its dependencies' code too. A typical app has
hundreds of transitive packages from hundreds of authors. The practical mitigations: audit what you add
and prefer fewer, well-maintained dependencies; use <code>npm ci</code> so builds are reproducible;
<code>npm audit</code> and Dependabot for known vulnerabilities; and <code>--ignore-scripts</code> when
installing something you have reason to be careful about. <b>Typosquatting is real</b>: check the name
character by character before installing something you have not used before.</p>`,
docs:[['npm, package.json','https://docs.npmjs.com/cli/v10/configuring-npm/package-json'],['Semantic Versioning','https://semver.org/'],['npm, npm ci','https://docs.npmjs.com/cli/v10/commands/npm-ci']],
exs:[
{title:'Does this version satisfy the range?',diff:'easy',lang:'js',
run:{call:'caretAllows',cases:[
 {name:'a patch bump is allowed',args:[4,19,2,4,19,5],expect:true},
 {name:'a minor bump is allowed',args:[4,19,2,4,20,0],expect:true},
 {name:'a major bump is not',args:[4,19,2,5,0,0],expect:false},
 {name:'an older version is not',args:[4,19,2,4,19,1],expect:false},
 {name:'the exact version is allowed',args:[4,19,2,4,19,2],expect:true},
 {name:'an older minor is not',args:[4,19,2,4,18,9],expect:false}]},
prompt:`Write <code>function caretAllows(wantMajor, wantMinor, wantPatch, haveMajor, haveMinor, havePatch)</code> implementing <code>^</code> for versions at 1.0.0 or above: the major must match exactly, and the available version must be greater than or equal to the wanted one.`,
starter:`function caretAllows(wantMajor, wantMinor, wantPatch, haveMajor, haveMinor, havePatch) {
  return false;
}`,
solution:`function caretAllows(wantMajor, wantMinor, wantPatch, haveMajor, haveMinor, havePatch) {
  if (haveMajor !== wantMajor) return false;          // ^ never crosses a major
  if (haveMinor !== wantMinor) return haveMinor > wantMinor;
  return havePatch >= wantPatch;                       // same minor: compare patch
}`,
tests:[{d:'the major must match',re:'haveMajor\\s*!==\\s*wantMajor'},{d:'compares the minor',re:'haveMinor'},{d:'compares the patch',re:'havePatch\\s*>=\\s*wantPatch'}],
behavior:`Six comparisons execute, including both directions of the minor check. The last case is the one a naive implementation fails: 4.18.9 has the right major and a patch that looks fine, but the minor went backwards, so the comparison has to be positional, not a single combined number.`,
hints:['Compare the components in order: major, then minor, then patch.','A differing major is an immediate no.','When the minors differ, the answer depends only on the minor.']},
{title:'Which install command?',diff:'medium',lang:'js',
run:{call:'installCommand',cases:[
 {name:'CI wants reproducibility',args:['ci'],expect:'npm ci'},
 {name:'a production build wants reproducibility too',args:['production-build'],expect:'npm ci'},
 {name:'adding a dependency updates the lockfile',args:['add-dependency'],expect:'npm install'},
 {name:'upgrading intentionally updates it too',args:['upgrade'],expect:'npm install'},
 {name:'anything else defaults to the safe one',args:['zzz'],expect:'npm ci'}]},
prompt:`Write <code>function installCommand(context)</code>: <code>"add-dependency"</code> and <code>"upgrade"</code>&rarr;<code>"npm install"</code> (they must resolve ranges and rewrite the lockfile); everything else, including <code>"ci"</code>, <code>"production-build"</code> and anything unrecognised&rarr;<code>"npm ci"</code>.`,
starter:`function installCommand(context) {
  return null;
}`,
solution:`function installCommand(context) {
  if (context === "add-dependency" || context === "upgrade") return "npm install";
  return "npm ci";      // deterministic by default: the lockfile is the truth
}`,
tests:[{d:'install when the lockfile must change',re:'"npm install"'},{d:'ci everywhere else',re:'"npm ci"'},{d:'defaults to the deterministic command',re:'return\\s+"npm ci"'}],
behavior:`The default is the point and it executes: an unrecognised context gets the reproducible command, not the one that silently resolves ranges. Running npm install in CI is how a build that passed yesterday fails today with a dependency nobody changed.`,
hints:['Only two contexts legitimately rewrite the lockfile.','Everything else should be deterministic.','Make the safe command the default rather than an explicit case.']},
{title:'Compare two versions properly',diff:'hard',lang:'js',
run:{call:'compareVersions',cases:[
 {name:'a higher patch wins',args:['1.2.4','1.2.3'],expect:1},
 {name:'a lower minor loses',args:['1.1.9','1.2.0'],expect:-1},
 {name:'equal versions',args:['1.2.3','1.2.3'],expect:0},
 {name:'numeric, not lexicographic: 10 is above 9',args:['1.10.0','1.9.0'],expect:1},
 {name:'and again on the major',args:['10.0.0','9.9.9'],expect:1},
 {name:'a prerelease is BELOW its release',args:['1.2.3-beta','1.2.3'],expect:-1},
 {name:'the release is above the prerelease',args:['1.2.3','1.2.3-beta'],expect:1},
 {name:'two prereleases compare alphabetically',args:['1.2.3-alpha','1.2.3-beta'],expect:-1}]},
prompt:`Write <code>function compareVersions(a, b)</code> returning <code>1</code> when <code>a</code> is newer, <code>-1</code> when it is older, and <code>0</code> when they are equal. Compare major, minor and patch <b>numerically</b>: <code>"1.10.0"</code> is newer than <code>"1.9.0"</code>, which string comparison gets wrong. A version with a prerelease suffix (<code>"1.2.3-beta"</code>) ranks <b>below</b> the same version without one, and two prereleases compare alphabetically.`,
starter:`function compareVersions(a, b) {
  return 0;
}`,
solution:`function compareVersions(a, b) {
  const split = v => {
    const [core, pre = ""] = v.split("-");           // "" means a real release
    return { nums: core.split(".").map(Number), pre };
  };
  const A = split(a), B = split(b);

  for (let i = 0; i < 3; i++) {                       // major, minor, patch
    if (A.nums[i] !== B.nums[i]) return A.nums[i] > B.nums[i] ? 1 : -1;
  }
  if (A.pre === B.pre) return 0;
  if (A.pre === "") return 1;                         // a release beats a prerelease
  if (B.pre === "") return -1;
  return A.pre < B.pre ? -1 : 1;                      // alphabetical between them
}`,
tests:[{d:'splits off the prerelease suffix',re:'split\\s*\\(\\s*"-"'},{d:'converts the parts to numbers',re:'map\\s*\\(\\s*Number|Number\\('},{d:'compares the three components in order',re:'for\\s*\\(|nums\\[0\\]'},{d:'handles the prerelease ranking',re:'pre'}],
behavior:`Eight comparisons execute. The fourth and fifth are the ones a string comparison fails: "1.10.0" < "1.9.0" is true as text, because "1" sorts before "9" character by character. Converting to numbers is what fixes it, and it is the reason npm cannot simply sort version strings. The last three cover the prerelease rule that catches people out: 1.2.3-beta is NOT newer than 1.2.3, it is a candidate for it.`,
hints:['Split on "-" first to separate the version core from any prerelease label.','Map the dot-separated parts through Number so the comparison is numeric.','An empty prerelease means a full release, and a full release outranks any prerelease.']}]},

{id:'js37',title:'Bundlers, transpilers and the rest of the toolchain',body:`
<p>Modern JavaScript projects sit under a stack of tools. Each exists to solve one problem, and knowing
which problem is what stops the toolchain feeling arbitrary.</p>

<h4>What each tool is for</h4>
<div class="codeSample" data-hl>BUNDLER      many modules -> few files. Vite, esbuild, webpack, Rollup.
             also: tree-shaking, code splitting, asset handling.
TRANSPILER   new syntax -> older syntax. Babel, tsc, esbuild.
             so you can write 2026 JavaScript for a 2019 browser.
MINIFIER     smaller output: short names, no whitespace, dead code gone.
LINTER       finds likely mistakes. ESLint.
FORMATTER    settles style arguments by having none. Prettier.
TYPE CHECKER catches type errors before running. TypeScript.
TEST RUNNER  Vitest, Jest, node:test.</div>

<h4>Why bundle at all, when browsers support modules?</h4>
<p>They do, and you could ship raw ESM. Bundling still wins for four reasons: <b>fewer requests</b> (a
few hundred modules means a few hundred round trips), <b>tree-shaking</b> (unused exports removed,
only possible because ESM is static), <b>non-JavaScript assets</b> (CSS, images, SVG imported as
modules), and <b>bare specifiers</b>, which browsers cannot resolve without an import map.</p>
<p>In development the calculation reverses, which is why Vite serves native ESM unbundled: the browser
requests only what a page needs and edits appear instantly, with no rebuild.</p>

<h4>Tree-shaking, and what defeats it</h4>
<div class="codeSample" data-hl>import { debounce } from "lodash-es";   // only debounce ends up in the bundle

// what BREAKS it:
//   CommonJS dependencies - the graph is not statically known
//   side effects at module top level (the bundler must keep the module)
//   "sideEffects": false in package.json is how a library promises
//     it has none, so the bundler can drop unused modules entirely</div>

<h4>Source maps, again</h4>
<p>Every transformation above moves your code further from what runs. Source maps are what let DevTools
show you the original, which is why the debugging stream treats a broken map as a first-class problem
rather than an inconvenience.</p>

<h4>The advice</h4>
<p><b>Start with a framework's defaults.</b> <code>npm create vite@latest</code> gives you a working,
sensible toolchain in one command; assembling one by hand teaches you configuration formats rather than
JavaScript.</p>
<p><b>Add tools when you feel the problem</b> they solve, not preemptively. Every tool is a dependency,
a configuration file, a thing that breaks on upgrade, and a thing the next person has to learn.</p>
<p><b>Let the formatter win.</b> Prettier's value is not its output, it is that it ends the discussion,
so do not configure it, and never argue with it in review.</p>
<p><b>Read the errors.</b> Toolchain errors are verbose and usually accurate. "Cannot use import statement
outside a module" and "Module not found" both mean exactly what they say, and both were covered two
lessons ago.</p>`,
docs:[['Vite','https://vitejs.dev/guide/'],['MDN, Introduction to client-side tooling','https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Client-side_tools/Overview'],['webpack, tree shaking','https://webpack.js.org/guides/tree-shaking/']],
ex:{title:'Which tool solves this?',diff:'easy',lang:'js',
run:{call:'toolFor',cases:[
 {name:'too many network requests in production',args:['too-many-requests'],expect:'bundler'},
 {name:'new syntax on an old browser',args:['old-browser'],expect:'transpiler'},
 {name:'inconsistent style across the team',args:['style-arguments'],expect:'formatter'},
 {name:'likely mistakes that still run',args:['likely-bugs'],expect:'linter'},
 {name:'unused library code shipped to users',args:['dead-code-shipped'],expect:'tree-shaking'},
 {name:'stack traces point at minified code',args:['unreadable-traces'],expect:'source maps'},
 {name:'anything else',args:['zzz'],expect:'no tool - understand the problem first'}]},
prompt:`Write <code>function toolFor(problem)</code>: <code>"too-many-requests"</code>&rarr;<code>"bundler"</code>; <code>"old-browser"</code>&rarr;<code>"transpiler"</code>; <code>"style-arguments"</code>&rarr;<code>"formatter"</code>; <code>"likely-bugs"</code>&rarr;<code>"linter"</code>; <code>"dead-code-shipped"</code>&rarr;<code>"tree-shaking"</code>; <code>"unreadable-traces"</code>&rarr;<code>"source maps"</code>; anything else&rarr;<code>"no tool - understand the problem first"</code>.`,
starter:`function toolFor(problem) {
  return null;
}`,
solution:`function toolFor(problem) {
  switch (problem) {
    case "too-many-requests":  return "bundler";
    case "old-browser":        return "transpiler";
    case "style-arguments":    return "formatter";
    case "likely-bugs":        return "linter";
    case "dead-code-shipped":  return "tree-shaking";
    case "unreadable-traces":  return "source maps";
    default:                   return "no tool - understand the problem first";
  }
}`,
tests:[{d:'bundler for request count',re:'"bundler"'},{d:'transpiler for old browsers',re:'"transpiler"'},{d:'formatter for style',re:'"formatter"'},{d:'linter for likely bugs',re:'"linter"'},{d:'has a default',re:'default'}],
behavior:`Seven cases execute, and the default carries the lesson: reaching for a tool before you can state the problem it solves is how a project accumulates eleven config files nobody can explain. Note that linter and formatter are separate answers: one finds mistakes, the other has no opinions worth arguing about.`,
hints:['One case per tool, with a default.','A linter finds likely bugs; a formatter only settles style.','The default should push back rather than name a tool.']}}

]});
