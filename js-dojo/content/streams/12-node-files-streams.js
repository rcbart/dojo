STREAMS.push({icon:'🗂️',title:'Files, Streams & the Node Standard Library',blurb:'Working with the file system safely: the fs promises API and why the sync forms are dangerous, path arithmetic that survives Windows, streams and backpressure, buffers and character encoding, and path traversal as a real vulnerability.',lessons:[

{id:'js41',title:'Reading and writing files',body:`
<p>Everything a program keeps in variables disappears when it exits. Files are how work survives, and
Node's <code>fs</code> module is how you reach them. There are three versions of every operation, and
choosing the wrong one is the most consequential decision in this lesson.</p>

<div class="codeSample" data-hl>import fs from "node:fs/promises";        // THE ONE TO USE
import fsSync from "node:fs";             // sync + callback forms

// promises  - async, awaitable, does not block the loop
const text = await fs.readFile("data.txt", "utf8");
await fs.writeFile("out.txt", "hello");

// callback  - the original API. still everywhere in older code.
fsSync.readFile("data.txt", "utf8", (err, data) =&gt; { ... });

// sync      - BLOCKS THE ENTIRE EVENT LOOP until it finishes
const t = fsSync.readFileSync("data.txt", "utf8");</div>

<h4>When the sync forms are acceptable, and when they are not</h4>
<p><b>Acceptable:</b> at startup, before the server is listening: reading a config file once, loading a
template. Nobody is waiting, and simple code is worth more than concurrency you are not using.</p>
<p><b>Not acceptable:</b> anywhere inside a request handler, a job, or anything that runs repeatedly. One
<code>readFileSync</code> in a hot path stops <i>every</i> connected client for its duration, and it will
not show up as a slow endpoint; it shows up as the whole service being slow.</p>

<h4>The encoding argument decides what you get back</h4>
<div class="codeSample" data-hl>await fs.readFile("a.txt")            // a BUFFER - raw bytes
await fs.readFile("a.txt", "utf8")   // a STRING - decoded text

// forgetting the encoding gives you  &lt;Buffer 68 65 6c 6c 6f&gt;  where you
// expected "hello", and string methods on it behave strangely rather
// than throwing - which makes it an annoying bug to spot.</div>

<h4>The operations you will actually use</h4>
<div class="codeSample" data-hl>await fs.readFile(p, "utf8")
await fs.writeFile(p, text)             // creates or OVERWRITES
await fs.appendFile(p, line + "\\n")
await fs.mkdir(dir, { recursive: true })  // recursive: no error if it exists
await fs.readdir(dir)                     // names only
await fs.readdir(dir, { withFileTypes: true })  // entries with isDirectory()
await fs.stat(p)                          // size, mtime, isFile(), isDirectory()
await fs.rm(p, { recursive: true, force: true })
await fs.rename(from, to)                 // atomic within one filesystem
await fs.cp(from, to, { recursive: true })</div>

<h4>Checking existence is a trap</h4>
<div class="codeSample" data-hl>// DO NOT do this:
if (await exists(p)) { await fs.readFile(p); }
// between the check and the read, the file can be deleted by something
// else. this is a TOCTOU race - time of check to time of use.

// do this instead: attempt it, and handle the failure.
try {
  return await fs.readFile(p, "utf8");
} catch (e) {
  if (e.code === "ENOENT") return null;   // not found - an expected outcome
  throw e;                                 // anything else is not mine
}</div>
<p>The <code>code</code> property is how you branch on file-system errors, never the message, which is
localised and can change. The ones worth knowing: <b>ENOENT</b> no such file, <b>EACCES</b> permission
denied, <b>EEXIST</b> already exists, <b>EISDIR</b> it is a directory, <b>ENOTEMPTY</b> directory not
empty, <b>EMFILE</b> too many open files, which usually means you are leaking handles.</p>`,
docs:[['Node — fs promises API','https://nodejs.org/api/fs.html#promises-api'],['Node — fs error codes','https://nodejs.org/api/errors.html#common-system-errors'],['Node — do not block the event loop','https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop']],
exs:[
{title:'Branch on the error code',diff:'easy',lang:'js',
run:{call:'handleFsError',cases:[
 {name:'a missing file is an expected outcome',args:['ENOENT'],expect:'not found'},
 {name:'permission denied is a configuration problem',args:['EACCES'],expect:'permission denied'},
 {name:'already exists',args:['EEXIST'],expect:'already exists'},
 {name:'too many open files means a handle leak',args:['EMFILE'],expect:'handle leak - close what you open'},
 {name:'anything else is re-thrown',args:['EWEIRD'],expect:'rethrow'},
 {name:'an undefined code is re-thrown too',args:[undefined],expect:'rethrow'}]},
prompt:`Write <code>function handleFsError(code)</code>: <code>"ENOENT"</code>&rarr;<code>"not found"</code>; <code>"EACCES"</code>&rarr;<code>"permission denied"</code>; <code>"EEXIST"</code>&rarr;<code>"already exists"</code>; <code>"EMFILE"</code>&rarr;<code>"handle leak - close what you open"</code>; anything else, including <code>undefined</code>&rarr;<code>"rethrow"</code>.`,
starter:`function handleFsError(code) {
  return null;
}`,
solution:`function handleFsError(code) {
  switch (code) {
    case "ENOENT": return "not found";
    case "EACCES": return "permission denied";
    case "EEXIST": return "already exists";
    case "EMFILE": return "handle leak - close what you open";
    default:       return "rethrow";     // not mine to handle
  }
}`,
tests:[{d:'handles a missing file',re:'"ENOENT"'},{d:'handles permission denied',re:'"EACCES"'},{d:'handles too many open files',re:'"EMFILE"'},{d:'re-throws the rest',re:'"rethrow"'}],
behavior:`Six cases execute, including an undefined code. The default is the discipline: handle the codes you can act on and pass the rest upward, rather than collapsing every file-system failure into "could not read file" and destroying the information.`,
hints:['Branch on the code property, never on the message text.','A switch with one case per code you can act on.','The default re-throws: do not swallow codes you did not anticipate.']},
{title:'Read a file without a TOCTOU race',diff:'medium',lang:'js',
run:{call:'readOrDefault',cases:[
 {name:'an existing file returns its contents',args:['ok','contents'],expect:'contents'},
 {name:'a missing file returns the default',args:['ENOENT','contents'],expect:'default'},
 {name:'a permission error is NOT swallowed',args:['EACCES','contents'],expect:'rethrown'},
 {name:'a directory error is not swallowed either',args:['EISDIR','contents'],expect:'rethrown'},
 {name:'an empty file is a real result, not a default',args:['ok',''],expect:''}]},
prompt:`Write <code>function readOrDefault(outcome, contents)</code> modelling the attempt-and-handle pattern. When <code>outcome</code> is <code>"ok"</code> return <code>contents</code> unchanged, including the empty string. When it is <code>"ENOENT"</code> return <code>"default"</code>. Any other error code returns <code>"rethrown"</code>.`,
starter:`function readOrDefault(outcome, contents) {
  return null;
}`,
solution:`function readOrDefault(outcome, contents) {
  if (outcome === "ok") return contents;        // BEFORE any truthiness test
  if (outcome === "ENOENT") return "default";   // expected: file not there
  return "rethrown";                             // unexpected: pass it on
}`,
tests:[{d:'returns the contents on success',re:'"ok"'},{d:'only ENOENT falls back',re:'"ENOENT"'},{d:'everything else is re-thrown',re:'"rethrown"'}],
behavior:`The last case is the one that catches a plausible implementation: an empty file is a successful read, so returning "default" whenever the contents are falsy would be wrong. And EACCES must not be treated as "missing": a permissions problem silently becoming a default is how a service runs for a week on empty configuration.`,
hints:['Check the success outcome first and return the contents as they are.','Only ENOENT means "absent"; every other code is a real failure.','An empty string is a valid file content, so do not test it for truthiness.']}]},

{id:'js42',title:'Paths, and path traversal',body:`
<p>Building file paths by joining strings works on your machine and breaks somewhere else, or worse,
lets a user read files you never intended to expose. <code>node:path</code> exists for both reasons.</p>

<div class="codeSample" data-hl>import path from "node:path";

path.join("a", "b", "c.txt")      // "a/b/c.txt"  (or a\\b\\c.txt on Windows)
path.resolve("a", "b")            // an ABSOLUTE path, from the cwd
path.basename("/x/y/z.txt")       // "z.txt"
path.basename("/x/y/z.txt", ".txt")  // "z"
path.extname("/x/y/z.txt")        // ".txt"
path.dirname("/x/y/z.txt")        // "/x/y"
path.normalize("a/./b/../c")      // "a/c"     resolves . and ..
path.isAbsolute(p)
path.relative(from, to)
path.sep                           // "/" or "\\"

// join vs resolve, which people confuse:
path.join("/a", "b")        // "/a/b"
path.resolve("/a", "b")     // "/a/b"
path.join("/a", "/b")       // "/a/b"   join treats both as segments
path.resolve("/a", "/b")    // "/b"     resolve RESTARTS at an absolute one</div>

<h4>Where your code is, versus where you were run from</h4>
<div class="codeSample" data-hl>process.cwd()          where the process was STARTED. changes with the
                       terminal's directory. never use it to find your
                       own files.
import.meta.dirname    the directory of THIS file (Node 20.11+).
                       in CommonJS this is __dirname.

// so: reading a data file that ships with your code
const p = path.join(import.meta.dirname, "data", "seed.json");
// NOT path.join("data", "seed.json"), which only works when someone
// happens to run node from the right directory.</div>

<h4>Path traversal — the vulnerability</h4>
<p>If any part of a path comes from a user, they can try to escape the directory you meant. This is the
file-system equivalent of SQL injection, and it is still one of the most commonly exploited web
vulnerabilities.</p>
<div class="codeSample" data-hl>// the attack: a filename of  ../../../../etc/passwd
const p = path.join(UPLOADS, userFilename);   // join HAPPILY resolves the ..
await fs.readFile(p);                          // and you just served /etc/passwd

// the check that people write, which is NOT enough:
if (userFilename.includes("..")) reject();
// bypassed by URL-encoding, by "....//", by absolute paths, by symlinks,
// and by Windows separators. blocklists lose.

// the check that works: resolve, then VERIFY the result is still inside.
function safeJoin(baseDir, userPath) {
  const base = path.resolve(baseDir);
  const full = path.resolve(base, userPath);   // resolves .. for real
  if (full !== base && !full.startsWith(base + path.sep)) return null;
  return full;
}
// note the two-part check: full === base is fine (the directory itself),
// and startsWith needs the SEPARATOR, or "/uploads-evil" passes a
// startsWith("/uploads") test.</div>
<p>Even that is not complete: a symbolic link inside the directory can point outside it, so anything
handling genuinely hostile input should also resolve links (<code>fs.realpath</code>) and re-check.</p>

<h4>The general rule</h4>
<p><b>Never trust a filename.</b> Prefer generating your own names (a UUID plus a validated extension)
and storing the user's original name as metadata rather than as a path. That removes the entire class of
problem instead of filtering it.</p>`,
docs:[['Node — path','https://nodejs.org/api/path.html'],['OWASP — path traversal','https://owasp.org/www-community/attacks/Path_Traversal'],['Node — import.meta.dirname','https://nodejs.org/api/esm.html#importmetadirname']],
ex:{title:'Contain a user-supplied path',diff:'hard',lang:'js',
run:{call:'safeJoin',cases:[
 {name:'an ordinary filename is allowed',args:['/srv/uploads','photo.png'],expect:'/srv/uploads/photo.png'},
 {name:'a subdirectory is allowed',args:['/srv/uploads','2026/photo.png'],expect:'/srv/uploads/2026/photo.png'},
 {name:'traversal out of the directory is refused',args:['/srv/uploads','../../etc/passwd'],expect:null},
 {name:'traversal that lands back inside is allowed',args:['/srv/uploads','a/../photo.png'],expect:'/srv/uploads/photo.png'},
 {name:'an absolute path is refused',args:['/srv/uploads','/etc/passwd'],expect:null},
 {name:'a sibling directory sharing a prefix is refused',args:['/srv/uploads','../uploads-evil/x'],expect:null},
 {name:'the base directory itself is allowed',args:['/srv/uploads',''],expect:'/srv/uploads'},
 {name:'a deep traversal is refused',args:['/srv/uploads','a/b/../../../../root'],expect:null}]},
prompt:`Write <code>function safeJoin(baseDir, userPath)</code> that returns the resolved absolute path when it stays inside <code>baseDir</code>, and <code>null</code> when it escapes. Assume POSIX paths with <code>"/"</code> separators. Resolve <code>.</code> and <code>..</code> yourself rather than searching for <code>".."</code> in the string: a blocklist loses. Treat a leading <code>"/"</code> in <code>userPath</code> as an absolute path, which must be refused.`,
starter:`function safeJoin(baseDir, userPath) {
  return null;
}`,
solution:`function safeJoin(baseDir, userPath) {
  if (userPath.startsWith("/")) return null;      // absolute: never allowed

  const parts = baseDir.split("/").concat(userPath.split("/"));
  const stack = [];
  for (const part of parts) {
    if (part === "" || part === ".") continue;    // ignore empties and .
    if (part === "..") { stack.pop(); continue; } // walk UP one level
    stack.push(part);
  }
  const full = "/" + stack.join("/");

  const base = "/" + baseDir.split("/").filter(p => p !== "" && p !== ".").join("/");
  if (full !== base && !full.startsWith(base + "/")) return null;   // escaped
  return full;
}`,
tests:[{d:'refuses absolute user paths',re:'startsWith\\s*\\(\\s*"/"'},{d:'resolves .. rather than blocking it',re:'"\\.\\."'},{d:'verifies the result is still inside the base',re:'startsWith\\s*\\(\\s*base'},{d:'allows the base directory itself',re:'full\\s*!==\\s*base|===\\s*base'}],
behavior:`Eight cases execute, and three of them break the obvious implementations. Case 4 shows why a blocklist is wrong: "a/../photo.png" contains ".." and is perfectly safe, so rejecting on the substring blocks legitimate paths while still missing encoded attacks. Case 6 is the prefix trap: "/srv/uploads-evil/x" starts with "/srv/uploads", so the containment check must compare against the base plus a separator. And case 7 requires the base directory itself to be allowed, which a naive startsWith(base + "/") alone would reject.`,
hints:['Split into segments and walk them with a stack: ".." pops, "." and empty segments are skipped.','Reject a leading slash before doing anything else.','The containment check needs BOTH an exact match on the base and a startsWith on base + "/", or a sibling directory with a shared prefix slips through.']}},

{id:'js43',title:'Streams and backpressure',body:`
<p>Reading a whole file into memory works until the file is bigger than your memory. Streams process data
<b>in pieces</b>, so a 10GB file can pass through a process with 200MB of heap.</p>

<div class="codeSample" data-hl>// this loads the ENTIRE file before you can touch any of it:
const text = await fs.readFile("10gb.log", "utf8");   // heap exhausted

// this handles it in chunks, at constant memory:
import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";

const rl = createInterface({ input: createReadStream("10gb.log") });
for await (const line of rl) {          // async iteration - one line at a time
  if (line.includes("ERROR")) console.log(line);
}</div>
<p><code>for await...of</code> over a stream is the modern way to consume one, and it is worth reaching
for before the event-based API: the loop reads like ordinary code and errors propagate to your
<code>try</code>/<code>catch</code>.</p>

<h4>The four kinds</h4>
<div class="codeSample" data-hl>Readable    you read from it        file read, HTTP request, process.stdin
Writable    you write to it        file write, HTTP response, process.stdout
Duplex      both                   a TCP socket
Transform   a duplex that CHANGES  gzip, encryption, a CSV parser
            what passes through</div>

<h4>Backpressure: the reason streams have this shape</h4>
<p>Suppose you read from a fast disk and write to a slow network. The reader produces faster than the
writer consumes. Without coordination, the unwritten data piles up in memory, and you have reinvented
loading the whole file, only less obviously.</p>
<div class="codeSample" data-hl>// write() returns FALSE when the internal buffer is full. that is the
// signal to stop reading until it drains. handling this by hand is
// fiddly and easy to get wrong, so do not:

import { pipeline } from "node:stream/promises";
await pipeline(
  createReadStream("in.log"),
  createGzip(),
  createWriteStream("out.log.gz")
);
// pipeline handles backpressure, propagates errors, and CLEANS UP every
// stream if any of them fails. the old .pipe() does not - it leaks
// handles on error, which is why pipeline exists.</div>

<h4>Buffers and encoding</h4>
<p>A <code>Buffer</code> is a fixed-length chunk of raw bytes: what you get from a file read with no
encoding, from a socket, or from <code>crypto</code>. Bytes are not characters, and the difference bites
in one specific place:</p>
<div class="codeSample" data-hl>Buffer.from("hello")             // bytes
buf.toString("utf8")             // decode to text
buf.toString("base64")           // encode as base64
Buffer.byteLength("héllo")       // 6 - one more BYTE than characters

// the chunk-boundary bug: a multi-byte character can be SPLIT across
// two chunks, so decoding each chunk separately corrupts it.
//   -> use setEncoding("utf8") on the stream, or StringDecoder, which
//      both hold partial characters back until they are complete.</div>

<h4>When not to bother</h4>
<p>Streaming is more code and more ways to be wrong. For a 2KB config file, <code>readFile</code> is
correct and clearer. Reach for a stream when the data is large, unbounded, or arriving over time: a log
file, an upload, a database export, anything from the network.</p>`,
docs:[['Node — stream','https://nodejs.org/api/stream.html'],['Node — backpressure guide','https://nodejs.org/en/learn/modules/backpressuring-in-streams'],['Node — Buffer','https://nodejs.org/api/buffer.html']],
exs:[
{title:'Stream or read whole?',diff:'medium',lang:'js',
run:{call:'readStrategy',cases:[
 {name:'a small config file',args:[2,false],expect:'readFile'},
 {name:'a large log file',args:[5000,false],expect:'stream'},
 {name:'unbounded input must stream whatever its size',args:[1,true],expect:'stream'},
 {name:'a big unbounded upload',args:[9000,true],expect:'stream'},
 {name:'exactly at the threshold reads whole',args:[10,false],expect:'readFile'},
 {name:'just over the threshold streams',args:[11,false],expect:'stream'}]},
prompt:`Write <code>function readStrategy(sizeMb, unbounded)</code> returning <code>"stream"</code> when the input is unbounded (its size is not known in advance) <b>or</b> larger than 10 MB, and <code>"readFile"</code> otherwise. Exactly 10 MB reads whole.`,
starter:`function readStrategy(sizeMb, unbounded) {
  return null;
}`,
solution:`function readStrategy(sizeMb, unbounded) {
  if (unbounded) return "stream";      // size is unknown: it could be anything
  return sizeMb > 10 ? "stream" : "readFile";
}`,
tests:[{d:'unbounded input always streams',re:'unbounded'},{d:'compares against the threshold',re:'sizeMb\\s*>\\s*10'},{d:'small bounded input reads whole',re:'"readFile"'}],
behavior:`Six cases execute. The third is the point: a 1 MB unbounded input still streams, because "unbounded" means you do not know it is 1 MB: an upload advertised as small can arrive as gigabytes, and readFile would buffer all of it. The two threshold cases pin the boundary, which is exactly the kind of off-by-one that passes review and fails on the one file that sits on it.`,
hints:['Unbounded is the stronger condition: check it first and return.','The threshold comparison is strictly greater than.','Only bounded, small inputs are safe to read whole.']},
{title:'Consume a stream with backpressure',diff:'hard',lang:'js',
run:{call:'drainPlan',cases:[
 {name:'the writer keeps up, so nothing pauses',args:[[1,1,1],5],expect:{written:3,pauses:0,maxBuffered:3}},
 {name:'a slow writer forces a pause',args:[[3,1],4],expect:{written:2,pauses:1,maxBuffered:4}},
 {name:'buffer fills exactly and pauses',args:[[1,1],2],expect:{written:2,pauses:1,maxBuffered:2}},
 {name:'nothing to write',args:[[],5],expect:{written:0,pauses:0,maxBuffered:0}},
 {name:'a single oversized chunk still gets written',args:[[10],2],expect:{written:1,pauses:1,maxBuffered:10}},
 {name:'repeated pauses across many chunks',args:[[2,2,2,2],2],expect:{written:4,pauses:4,maxBuffered:2}}]},
prompt:`Write <code>function drainPlan(chunks, highWaterMark)</code> modelling backpressure. Process each chunk in order: add its size to the buffer and count it as written. If the buffer then reaches or exceeds <code>highWaterMark</code>, the writer signals "full": count a <b>pause</b> and drain the buffer back to 0 before the next chunk. Return <code>{ written, pauses, maxBuffered }</code>, where <code>maxBuffered</code> is the highest the buffer ever reached. The final chunk pausing still counts.`,
starter:`function drainPlan(chunks, highWaterMark) {
  return { written: 0, pauses: 0, maxBuffered: 0 };
}`,
solution:`function drainPlan(chunks, highWaterMark) {
  let buffered = 0, written = 0, pauses = 0, maxBuffered = 0;

  for (const size of chunks) {
    buffered += size;
    written++;
    if (buffered > maxBuffered) maxBuffered = buffered;   // record the PEAK
    if (buffered >= highWaterMark) {                       // writer says full
      pauses++;
      buffered = 0;                                        // drained
    }
  }
  return { written, pauses, maxBuffered };
}`,
tests:[{d:'accumulates the buffer',re:'buffered\\s*\\+='},{d:'counts every chunk as written',re:'written\\+\\+|written\\s*\\+='},{d:'pauses at the high-water mark',re:'>=\\s*highWaterMark'},{d:'tracks the peak',re:'maxBuffered'}],
behavior:`Six cases execute, and three of them are boundaries. Case 3 fills the buffer to exactly the high-water mark, which must pause; using a strict > instead of >= passes the other five and fails this one. Case 5 shows that a single chunk larger than the whole buffer is still written, because backpressure slows a producer down rather than rejecting data. And maxBuffered has to be recorded before the drain, or the peak is lost.`,
hints:['Record the peak immediately after adding, before any drain resets the buffer.','The pause condition is >= the high-water mark, not >.','Every chunk counts as written, including one that immediately triggers a pause.']}]}

]});
