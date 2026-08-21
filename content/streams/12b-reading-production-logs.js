STREAMS.push({icon:'🔎',title:'Reading Production: the Command Line for Logs',blurb:'The diagnosis skill nobody teaches: streaming text through composable filters. The pipeline model, grep without the silent over-matches, sed\'s addressing model, awk\'s associative arrays, jq for structured logs, and a capstone that finds which endpoint regressed after a deploy.',lessons:[

{id:'rpl1',title:'The pipeline model: why text streams beat opening the file',body:`
<p>You are on a call. Something is slow. Someone pastes a link to 40 million log lines and the clock is running. The instinct (download it, open it in an editor, scroll) fails on the first step: the editor loads the whole file into memory, and the file is bigger than your laptop's memory. The command line answers a different question. Not <i>"how do I see this file?"</i> but <b>"what transformation turns this file into the answer?"</b></p>
<p>The model has three parts, and everything else in this stream is built on them.</p>
<ul>
<li><b>A program is a filter.</b> It reads bytes from <b>stdin</b>, writes results to <b>stdout</b>, and writes complaints to <b>stderr</b>, a separate channel precisely so that diagnostics never contaminate data. <code>grep</code>, <code>sed</code>, <code>awk</code>, <code>jq</code>, <code>sort</code>, <code>uniq</code>, <code>head</code> are all the same shape: text in, text out.</li>
<li><b>The pipe connects one filter's stdout to the next one's stdin.</b> <code>a | b</code> does not mean "run a, then run b". Both processes start <i>at once</i> and the data flows through as it is produced. Nothing is ever fully in memory: <code>grep ERROR huge.log | head -5</code> answers in milliseconds on a 40GB file, because <code>head</code> exits after five lines, the kernel sends <code>SIGPIPE</code> to <code>grep</code>, and <code>grep</code> stops reading. The editor was still allocating.</li>
<li><b>Every program returns an exit code.</b> <code>0</code> means success, non-zero means failure, and tools use it to mean something specific. <code>grep</code> returns <code>0</code> if it matched, <code>1</code> if it matched nothing, <code>2</code> on a real error. That is what makes <code>if grep -q ERROR app.log; then ...</code> work: the search result <i>is</i> the condition. It is also the classic CI trap: under <code>set -e</code>, a <code>grep</code> that legitimately finds nothing aborts the script.</li>
</ul>
<div class="codeSample">grep ERROR app.log | head -5          # stops early; SIGPIPE ends grep
sort app.log &gt; sorted.log             # stdout to a file
noisy-tool 2&gt;/dev/null | wc -l        # discard stderr, keep the data
noisy-tool 2&gt;&amp;1 | grep -i warn        # merge stderr INTO stdout, then filter
grep -q ERROR app.log; echo $?        # 0 = found, 1 = no match (not an error)
set -o pipefail                       # without it, a pipeline's status is the LAST command's</div>
<p>The last line deserves the paranoia. By default a pipeline reports only the exit status of its final command, so <code>badcommand | sort | head</code> succeeds (status <code>0</code>) while producing nothing. In a deploy script that is a silent, green-looking failure. <code>set -o pipefail</code> makes the pipeline fail if any stage failed.</p>
<p><b>Why this design outlived the machines it was written for.</b> Doug McIlroy's 1964 memo asked for a way to "screw programs together like garden hose", and the reason it still works is that the tools agreed on the narrowest possible interface: <b>lines of text</b>. No shared library, no schema, no version negotiation. <code>jq</code> was written forty years after <code>sed</code> and composes with it perfectly, because neither knows the other exists. Every tool does one job, so a new tool adds capability without anyone rewriting the others, and combinations nobody planned are the normal case, not the exception. That is the whole trade: text is a poor data model, and it is the only one everything can agree on.</p>
<p>The rest of this stream is four filters and one habit: <i>describe the transformation, then build it one stage at a time, checking the output after each</i>.</p>`,
docs:[['POSIX: shell command language','https://pubs.opengroup.org/onlinepubs/9699919799/utilities/V3_chap02.html'],['McIlroy on the origin of pipes','https://www.bell-labs.com/usr/dmr/www/mdmpipe.html'],['GNU coreutils manual','https://www.gnu.org/software/coreutils/manual/coreutils.html']],
exs:[{title:'The three streams and the exit code',lang:'shell',diff:'easy',
prompt:`Name the machinery. One answer per numbered line: (1) the stream a filter reads its input from (one word), (2) the stream results are written to (one word), (3) the separate stream diagnostics and warnings go to, so they don't contaminate the data (one word), (4) the exit code that means success (a number), (5) the exit code <code>grep</code> returns when it ran fine but matched nothing (a number), (6) the redirection that throws stderr away, keeping stdout intact (write it exactly, as in <code>2&gt;/dev/null</code>).`,
starter:`1.
2.
3.
4.
5.
6.
`,
solution:`1. stdin
2. stdout
3. stderr
4. 0
5. 1
6. 2>/dev/null
`,
tests:[{d:'Input stream is stdin',re:'1\\.\\s*stdin',flags:'i'},{d:'Output stream is stdout',re:'2\\.\\s*stdout',flags:'i'},{d:'Diagnostics go to stderr, not stdout',re:'3\\.\\s*stderr',flags:'i'},{d:'Success is exit code 0',re:'4\\.\\s*0\\s*$',flags:'im'},{d:'grep returns 1 for "no match", which is not an error',re:'5\\.\\s*1\\s*$',flags:'im'},{d:'stderr is discarded with 2>/dev/null',re:'6\\.\\s*2>\\s*/dev/null'}],
behavior:`1-3. Three streams, not two: stderr exists so that a tool can warn you without corrupting the data flowing down the pipe. Merge them deliberately (2>&1) or discard them (2>/dev/null), never by accident. 4. 0 is success; every other value is a failure the caller can distinguish. 5. grep's 1 means "searched successfully, found nothing": a legitimate answer, which is why "no matches" aborts a script running under set -e. 6. 2>/dev/null redirects file descriptor 2 only; stdout (fd 1) still flows to the next stage.`,
hints:['Three streams have numbers as well as names: 0, 1 and 2 in that order.','"Ran and found nothing" and "failed to run" must be different answers; otherwise a script cannot tell them apart.','2> redirects file descriptor 2; /dev/null is the kernel\'s bin.']},

{title:'Build a pipeline stage by stage',lang:'shell',diff:'medium',
prompt:`The log <code>app.log</code> has lines shaped like <code>2026-08-11T09:36:36Z api-7f3 ERROR POST /api/checkout 500 73ms trace=2c1eea</code>. One command per numbered line: (1) print just the first 3 lines of the file, (2) count the lines containing <code>ERROR</code>, using <code>grep</code> alone (no <code>wc</code>), (3) show the first 5 <code>ERROR</code> lines (the pipeline that stops reading early), (4) send the whole file to <code>sort</code> and write the result to <code>sorted.log</code>, (5) run <code>noisy-tool</code> so its warnings are discarded and only its stdout reaches <code>wc -l</code>, (6) the shell setting that makes a pipeline fail when <b>any</b> stage fails, not just the last (write the whole <code>set</code> command).`,
starter:`1.
2.
3.
4.
5.
6.
`,
solution:`1. head -3 app.log
2. grep -c ERROR app.log
3. grep ERROR app.log | head -5
4. sort app.log > sorted.log
5. noisy-tool 2>/dev/null | wc -l
6. set -o pipefail
`,
tests:[{d:'head takes the first n lines',re:'1\\.\\s*head\\s+-n?\\s?3\\s+app\\.log',flags:'i'},{d:'grep -c counts without spawning wc',re:'2\\.\\s*grep\\s+-c\\s+ERROR\\s+app\\.log',flags:'i'},{d:'grep piped into head stops early via SIGPIPE',re:'3\\.\\s*grep\\s+ERROR\\s+app\\.log\\s*\\|\\s*head\\s+-n?\\s?5',flags:'i'},{d:'stdout redirected to a file with >',re:'4\\.\\s*sort\\s+app\\.log\\s*>\\s*sorted\\.log',flags:'i'},{d:'stderr discarded, stdout still piped',re:'5\\.\\s*noisy-tool\\s+2>\\s*/dev/null\\s*\\|\\s*wc\\s+-l',flags:'i'},{d:'pipefail propagates a mid-pipeline failure',re:'6\\.\\s*set\\s+-o\\s+pipefail',flags:'i'}],
behavior:`1. head reads only what it needs and exits. 2. grep -c counts internally: one process instead of two, and it is the difference between "how many" and "which ones". 3. This is the pipeline's signature move: head exits after 5 lines, grep gets SIGPIPE and dies, and the remaining 40GB is never read. Reversing it (head -5 app.log | grep ERROR) searches only the first five lines, a different question with a plausible-looking wrong answer. 4. > truncates the file before the command runs; >> appends. 5. 2>/dev/null discards fd 2 only, so wc -l counts real output lines rather than warnings. 6. Without pipefail, "badcommand | sort | head" exits 0 and your CI stays green while producing nothing.`,
hints:['Two of these are about which stage does the work: grep can count on its own, and grep must run BEFORE head or you are searching the wrong five lines.','> redirects stdout (fd 1); 2> redirects stderr (fd 2). Order matters when you combine them.','The pipeline-status setting is a "set -o" option whose name says exactly what it does.']},

{title:'Interview: why the pipeline survived fifty years',lang:'text',diff:'hard',
prompt:`The reasoning behind the design: a real interview question when a role touches operations. One answer per numbered line: (1) the universal interface every tool agreed on, which is why a 2012 tool composes with a 1974 one (two words: "lines of ____", answer the last word), (2) <code>a | b</code>: do the two run one after the other, or ____ , with data streaming through (one word), (3) the consequence for memory: a pipeline processes a 40GB file in ____ memory (one word, the opposite of "growing"), (4) the signal <code>head</code> causes to be delivered to an upstream producer when it exits early (one word, e.g. SIGxxxx), (5) the design rule each tool follows: do one ____ well (one word), (6) the cost of the trade: text is a poor data ____ , and every tool must re-parse it (one word).`,
starter:`1.
2.
3.
4.
5.
6.
`,
solution:`1. text
2. concurrently
3. constant
4. SIGPIPE
5. job
6. model
`,
tests:[{d:'The narrow waist is lines of text',re:'1\\.\\s*text',flags:'is'},{d:'Pipeline stages run concurrently, not sequentially',re:'2\\.\\s*concurrent',flags:'is'},{d:'Streaming means constant memory',re:'3\\.\\s*constant',flags:'is'},{d:'Early exit propagates as SIGPIPE',re:'4\\.\\s*SIGPIPE',flags:'is'},{d:'Each tool does one job well',re:'5\\.\\s*job',flags:'is'},{d:'The cost: text is a weak data model',re:'6\\.\\s*model',flags:'is'}],
behavior:`1. Lines of text is the narrow waist: no schema, no shared library, no version negotiation, so tools written decades apart compose without either knowing the other exists. 2. Concurrently. Both processes start immediately and the kernel's pipe buffer applies backpressure; "run a, then run b" is what > and a temp file do. 3. Constant memory: the file size stops being a limit, which is the whole reason this beats an editor on production data. 4. SIGPIPE: writing to a pipe whose reader has closed kills the writer by default, which is why "| head" is fast rather than merely truncated. 5. One job well: capability is added by writing a new tool, not by growing an existing one, and combinations nobody planned are the normal case. 6. Data model. Every stage re-parses text, so a route containing a space or a quoted field with a delimiter inside it will break a naive pipeline; that is exactly what jq exists to fix for structured logs.`,
hints:['Question 1 is the reason the answer to "why does jq work with sed?" is "neither knows the other exists".','Question 2: if they ran one after the other, "grep | head" on a 40GB file could not possibly return instantly.','Question 6 is the real limitation: the reason the last lesson of this stream switches to JSON.']}]},

{id:'rpl2',title:'grep properly: fixed strings, context, and the anchoring mistake',body:`
<p>Nearly everyone can use <code>grep</code> badly. Used well it answers three different questions (<i>does this appear?</i>, <i>how often?</i>, <i>what surrounds it?</i>), and the difference between the two is mostly knowing six flags and one failure mode.</p>
<ul>
<li><b><code>-F</code>, fixed strings.</b> Your pattern is <i>data</i>, not a regex: <code>grep -F '/api/v1.0/orders'</code> treats the dot as a dot. Without <code>-F</code> that dot matches any character, so the pattern also matches <code>/api/v1X0/orders</code>. <code>-F</code> is also measurably faster (no regex engine), and it is the only safe choice when the pattern comes from a variable, a file or a user: a stray <code>.</code>, <code>*</code> or <code>[</code> otherwise changes the meaning or errors out.</li>
<li><b><code>-E</code>, extended regex.</b> Use it whenever you want <code>|</code>, <code>+</code>, <code>?</code>, <code>{2,4}</code> or groups without backslashes. Basic <code>grep</code> requires <code>\\|</code> and <code>\\+</code>, which is how patterns end up unreadable. The rule of thumb: <b>-F if you can, -E if you must, plain grep almost never.</b></li>
<li><b><code>-o</code>, print only the match.</b> This turns grep from a filter into an <i>extractor</i>: <code>grep -oE 'trace=[0-9a-f]+'</code> emits just the trace ids, one per line, ready for <code>sort | uniq -c</code>.</li>
<li><b><code>-A</code> / <code>-B</code> / <code>-C</code>, context.</b> Lines after, before, or both around each hit. An exception's stack trace lives in the lines <i>after</i> the message: <code>grep -A20 'NullPointerException'</code>. What led to it lives before: <code>-B5</code>.</li>
<li><b><code>-v</code>, invert</b>, the noise filter: <code>grep -v HealthCheck</code>. <b><code>-c</code>, count</b> matching <i>lines</i>. <b><code>-r</code>, recurse</b> a directory, with <code>-n</code> for line numbers and <code>-l</code> for filenames only.</li>
</ul>
<div class="codeSample">grep -F ' 500 ' app.log                    # literal, fast, no regex surprises
grep -oE 'trace=[0-9a-f]+' app.log         # extract just the ids
grep -A20 'NullPointerException' app.log   # the message plus its stack trace
grep -c ' 500 ' app.log                    # how many, not which
grep -rn 'TODO' src/                       # recurse, with file:line
grep -vE 'health|metrics' app.log          # drop the noise, keep everything else</div>
<p><b>The mistake that silently costs you an hour.</b> <code>grep 200 app.log</code> looks like "find the successful requests". It matches the status field <code>200</code>, and also <code>1200ms</code>, and <code>trace=2004ab</code>, and the timestamp <code>...T12:00:20Z</code>. On the sample log it reports 911 lines where 910 have status 200; on your log the error will be larger and in the direction that makes you confident. A pattern with no anchors matches <b>anywhere on the line</b>, and a log line is full of numbers.</p>
<p>The fixes, in order of preference: <b>match the field with its delimiters</b>: <code>grep -F ' 200 '</code>; <b>anchor to a position</b>: <code>^</code> for start of line, <code>$</code> for end, <code>\\b</code> for a word boundary; or, when the field's position actually matters, stop using grep and use <code>awk '$6==200'</code>, which compares the sixth field and cannot match anything else. The general principle is worth more than the flags: <b>a grep pattern is a claim about the whole line, so say where on the line you mean.</b> Two more traps in the same family: <code>-w</code> matches whole words but treats <code>/api/orders</code> as several words, and case matters unless you pass <code>-i</code>: <code>error</code> and <code>ERROR</code> are different searches.</p>`,
docs:[['GNU grep manual','https://www.gnu.org/software/grep/manual/grep.html'],['POSIX grep','https://pubs.opengroup.org/onlinepubs/9699919799/utilities/grep.html'],['Regular expression syntax (BRE vs ERE)','https://www.gnu.org/software/grep/manual/html_node/Regular-Expressions.html']],
exs:[{title:'Six flags, six questions',lang:'shell',diff:'easy',
prompt:`Same <code>app.log</code>. One command per numbered line: (1) count the lines containing <code>ERROR</code>, (2) print every line containing the literal string <code>/api/v1.0/orders</code> treating the dot as a real dot (use the fixed-string flag), (3) print only the matched trace ids using the pattern <code>trace=[0-9a-f]+</code> (extended regex, only-matching), (4) print each <code>NullPointerException</code> line plus the <b>20 lines after</b> it, (5) print every line that does <b>not</b> contain <code>HealthCheck</code>, (6) search the whole <code>src/</code> directory recursively for <code>TODO</code>, showing line numbers.`,
starter:`1.
2.
3.
4.
5.
6.
`,
solution:`1. grep -c ERROR app.log
2. grep -F '/api/v1.0/orders' app.log
3. grep -oE 'trace=[0-9a-f]+' app.log
4. grep -A20 'NullPointerException' app.log
5. grep -v HealthCheck app.log
6. grep -rn TODO src/
`,
tests:[{d:'-c counts matching lines',re:'1\\.\\s*grep\\s+-c\\s+ERROR',flags:'i'},{d:'-F makes the dot literal',re:'2\\.\\s*grep\\s+-F\\s+.?/api/v1\\.0/orders',flags:'i'},{d:'-o extracts, -E enables +',re:'3\\.\\s*grep\\s+-oE\\s+.?trace=\\[0-9a-f\\]\\+',flags:'i'},{d:'-A20 shows the stack trace after the message',re:'4\\.\\s*grep\\s+-A\\s?20\\s+',flags:'i'},{d:'-v inverts the match',re:'5\\.\\s*grep\\s+-v\\s+HealthCheck',flags:'i'},{d:'-r recurses, -n numbers the lines',re:'6\\.\\s*grep\\s+-(rn|nr)\\s+TODO\\s+src/?',flags:'i'}],
behavior:`1. -c prints a number, not lines, and counts matching LINES, so two matches on one line count once. 2. Without -F the dot matches any character, so /api/v1X0/orders would match too; -F also skips the regex engine entirely. 3. -o prints one match per line rather than the whole line, which is what makes grep an extractor you can pipe into sort | uniq -c. 4. -A20 prints trailing context; a Java stack trace is the twenty lines AFTER the message, so plain grep shows you the one line that tells you least. 5. -v inverts the selection, the standard way to drop health checks and metrics scrapes. 6. -r walks directories; -n adds file:line so the output is clickable in most terminals.`,
hints:['Count, fixed, only-matching, after-context, invert, recursive: one flag each, and five of the six are a single letter.','The dot is the tell in question 2: if it must be a literal dot, do not let the regex engine see it.','-A is "after", -B is "before", -C is both.']},

{title:'Case, words and file lists',lang:'shell',diff:'easy',
prompt:`Four more flags that decide what "a match" means. One command per numbered line: (1) count lines containing <code>error</code> in <b>any</b> case (<code>Error</code>, <code>ERROR</code>, <code>error</code>) using <code>grep</code> with the case-insensitive flag and the count flag together, (2) print matching lines with their <b>line numbers</b> for the pattern <code>ERROR</code>, (3) print only the <b>names of files</b> that contain <code>ERROR</code>, given <code>app.log</code> and <code>app.json.log</code> (the "files with matches" flag), (4) match <code>ERROR</code> only as a whole word, so <code>ERRORS</code> does not match (the word-regexp flag), (5) test quietly whether the file contains <code>ERROR</code>, printing nothing and setting only the exit code (the quiet flag), (6) count total <b>occurrences</b> rather than matching lines: print every match on its own line and pipe to <code>wc -l</code>; use the pattern <code>api</code>.`,
starter:`1.
2.
3.
4.
5.
6.
`,
solution:`1. grep -ic error app.log
2. grep -n ERROR app.log
3. grep -l ERROR app.log app.json.log
4. grep -w ERROR app.log
5. grep -q ERROR app.log
6. grep -o api app.log | wc -l
`,
tests:[{d:'-i ignores case, -c counts',re:'1\\.\\s*grep\\s+-(ic|ci|i\\s+-c|c\\s+-i)\\s+error',flags:'i'},{d:'-n prefixes the line number',re:'2\\.\\s*grep\\s+-n\\s+ERROR',flags:''},{d:'-l lists filenames only',re:'3\\.\\s*grep\\s+-l\\s+ERROR\\s+app\\.log\\s+app\\.json\\.log',flags:''},{d:'-w requires whole-word match',re:'4\\.\\s*grep\\s+-w\\s+ERROR',flags:''},{d:'-q sets only the exit code',re:'5\\.\\s*grep\\s+-q\\s+ERROR',flags:''},{d:'-o then wc -l counts occurrences',re:'6\\.\\s*grep\\s+-o\\s+api\\s+app\\.log\\s*\\|\\s*wc\\s+-l',flags:'i'}],
behavior:`1. Flags combine: -ic is -i plus -c. Without -i, "error" and "ERROR" are two different searches, and a mixed-case codebase will hide half your hits. 2. -n gives file:line, which most terminals and editors turn into a clickable jump. 3. -l stops at the first match per file and prints just the name, the fast way to ask "which of these 400 files mentions it". On the sample data only app.log matches, because the JSON log spells the level lowercase. 4. -w bounds the match at non-word characters, so ERRORS no longer matches, but beware: it treats /api/orders as several words, so it rarely helps with paths. 5. -q prints nothing and exits 0 or 1; it is what belongs inside "if grep -q ... ; then". 6. -c counts LINES; -o | wc -l counts MATCHES. On this file that is 1980 occurrences of "api" across 990 lines, a factor of two, which is the size of the mistake if you use the wrong one.`,
hints:['Single-letter flags can be joined: -i -c is the same as -ic.','Two of these are about output shape: one prints filenames only, one prints nothing at all.','"How many lines?" and "how many times?" are different questions: -c answers the first, -o | wc -l the second.']},

{title:'The anchoring mistake',lang:'shell',diff:'medium',
prompt:`Lines look like <code>2026-08-11T09:36:36Z api-7f3 ERROR POST /api/checkout 500 73ms trace=2c1eea</code>. One answer per numbered line: (1) the naive command <code>grep 200 app.log</code> over-matches: name one other field a bare <code>200</code> can match (one word: the timestamp, the duration or the trace; answer <code>duration</code>), (2) rewrite it as a fixed-string search for the status field surrounded by its delimiters (spaces): use <code>grep -F</code> and quote the pattern <b>with the spaces inside the quotes</b>, (3) print only lines whose <b>status field is exactly 500</b> using awk field comparison instead of grep (the sixth field), (4) the regex metacharacter that anchors a pattern to the start of a line (one character), (5) the metacharacter that anchors it to the end of the line (one character), (6) show the lines for either <code>/api/checkout</code> or <code>/api/orders</code> with one extended-regex alternation (use <code>grep -E</code> and <code>|</code>).`,
starter:`1.
2.
3.
4.
5.
6.
`,
solution:`1. duration
2. grep -F ' 200 ' app.log
3. awk '$6==500' app.log
4. ^
5. $
6. grep -E '/api/(checkout|orders)' app.log
`,
tests:[{d:'A bare 200 also matches inside the duration',re:'1\\.\\s*duration',flags:'i'},{d:'Delimiters included inside the quotes',re:'2\\.\\s*grep\\s+-F\\s+([\'"]) 200 \\1',flags:''},{d:'awk compares the field itself, so it cannot over-match',re:'3\\.\\s*awk\\s+.\\$6\\s*==\\s*500',flags:'i'},{d:'^ anchors to start of line',re:'4\\.\\s*\\^'},{d:'$ anchors to end of line',re:'5\\.\\s*\\$'},{d:'-E alternation with |',re:'6\\.\\s*grep\\s+-E\\s+.?/api/\\(checkout\\|orders\\)',flags:'i'}],
behavior:`1. A duration of 1200ms contains 200, and so does the trace id 2004ab and the timestamp T12:00:20Z. On the sample log the naive count is 911 against a true 910: small enough to believe, wrong enough to mislead. 2. Putting the spaces inside the quotes turns "the digits 200" into "the field 200", which is the cheapest correct fix. 3. awk '$6==500' is the exact version: it compares the sixth field as a value, so no amount of 500 elsewhere on the line can match. It is also the moment to leave grep: positional questions are awk's job. 4-5. ^ and $ pin a pattern to a position; unanchored patterns are claims about the entire line. 6. -E gives you alternation without backslashes; plain grep would need /api/\\(checkout\\|orders\\).`,
hints:['Ask of every pattern: could these characters appear somewhere else on the line? On a log line full of numbers, the answer is usually yes.','The cheapest fix is to include the delimiters: the spaces are part of what you mean by "the status field".','When the answer depends on WHICH field, grep is the wrong tool: awk compares fields by number.']},

{title:'Extract, then rank',lang:'shell',diff:'medium',
prompt:`<code>grep -o</code> plus the counting pair is the most reused pipeline on this page. One command per numbered line: (1) extract every route with <code>grep -oE '/api/[a-z]+'</code> and print the routes alone, (2) take that and produce a <b>frequency count</b>: pipe it through <code>sort</code> then <code>uniq -c</code> (both are required; <code>uniq</code> only collapses <i>adjacent</i> duplicates), (3) rank that count with the busiest route first: add <code>sort -rn</code>, (4) show only the top 3: add <code>head -3</code>, (5) the reason <code>sort</code> must come before <code>uniq -c</code>, in one word: uniq only sees ____ duplicates, (6) the flag pair in <code>sort -rn</code>: <code>r</code> is reverse and <code>n</code> is ____ (one word).`,
starter:`1.
2.
3.
4.
5.
6.
`,
solution:`1. grep -oE '/api/[a-z]+' app.log
2. grep -oE '/api/[a-z]+' app.log | sort | uniq -c
3. grep -oE '/api/[a-z]+' app.log | sort | uniq -c | sort -rn
4. grep -oE '/api/[a-z]+' app.log | sort | uniq -c | sort -rn | head -3
5. adjacent
6. numeric
`,
tests:[{d:'-o extracts the route only',re:'1\\.\\s*grep\\s+-oE\\s+([\'"])/api/\\[a-z\\]\\+\\1\\s+app\\.log',flags:'i'},{d:'sort then uniq -c makes a frequency table',re:'2\\.[^\\n]*\\|\\s*sort\\s*\\|\\s*uniq\\s+-c',flags:'i'},{d:'sort -rn ranks by count, descending',re:'3\\.[^\\n]*uniq\\s+-c\\s*\\|\\s*sort\\s+-rn',flags:'i'},{d:'head -3 truncates to a top-N',re:'4\\.[^\\n]*sort\\s+-rn\\s*\\|\\s*head\\s+-n?\\s?3',flags:'i'},{d:'uniq only collapses adjacent duplicates',re:'5\\.\\s*adjacent',flags:'i'},{d:'-n sorts numerically, not lexically',re:'6\\.\\s*numeric',flags:'i'}],
behavior:`1. The output is one route per line, 990 of them: no longer log lines, just the values you asked about. 2. sort | uniq -c is the counting idiom. Skip the sort and uniq collapses only runs that happen to be next to each other, which on interleaved traffic silently produces one entry per burst. 3. sort -rn on the counted output ranks by the leading number: /api/search 259, /api/orders 257, /api/checkout 249, /api/users 225. 4. head -3 is the "top offenders" cut, and it also ends the pipeline early. 5. Adjacent: this is the single most common wrong answer in the whole pipeline vocabulary, and it fails quietly rather than loudly. 6. Numeric. Without -n, sort compares text, so "9" sorts after "100" and your top-N is nonsense, the classic wrong ranking that looks plausible enough to publish.`,
hints:['grep -o first turns lines into values; everything after that is counting.','uniq without sort is the bug: it only collapses runs that are already next to each other.','Without -n, sort compares strings: "9" then comes after "100".']},

{title:'Interview: -F vs -E, and reading a stack trace',lang:'text',diff:'hard',
prompt:`One answer per numbered line: (1) the flag to use when the pattern is a literal string: faster, and safe when the pattern comes from a variable (one flag, e.g. <code>-x</code>), (2) the flag for alternation, <code>+</code> and <code>{n,m}</code> without backslashes (one flag), (3) the flag that prints only the matching part of the line, turning grep into an extractor (one flag), (4) to see a Java stack trace you need the lines ____ the message: before or after (one word), (5) <code>grep -c</code> counts matching ____ , not matching occurrences, so two hits on one line count once (one word), (6) the real risk of interpolating an untrusted pattern into a plain <code>grep</code>: the characters are interpreted as a ____ (one word).`,
starter:`1.
2.
3.
4.
5.
6.
`,
solution:`1. -F
2. -E
3. -o
4. after
5. lines
6. regex
`,
tests:[{d:'-F for fixed strings',re:'1\\.\\s*-F',flags:'s'},{d:'-E for extended regex',re:'2\\.\\s*-E',flags:'s'},{d:'-o prints only the match',re:'3\\.\\s*-o',flags:'s'},{d:'A stack trace follows its message',re:'4\\.\\s*after',flags:'is'},{d:'-c counts lines, not occurrences',re:'5\\.\\s*lines',flags:'is'},{d:'An untrusted pattern is executed as a regex',re:'6\\.\\s*regex|regular\\s+expression',flags:'is'}],
behavior:`1. -F treats the pattern as data. It skips the regex engine (faster on big files) and, more importantly, cannot be re-interpreted: a pattern containing . * [ ] ( ) means exactly those characters. 2. -E is ERE: alternation, +, ?, {n,m} and groups without backslash noise. 3. -o prints each match on its own line; combined with sort | uniq -c it is a one-line frequency count of anything you can describe. 4. After: the message is line one and the frames follow, so -A20 is the flag that shows you the cause. Use -B when you want what led up to it. 5. Lines. If you need occurrences, use grep -o | wc -l, a different question with a different answer. 6. It becomes a regex: an unescaped [ is a syntax error and an unescaped .* silently widens the match. This is the same class of bug as SQL injection: untrusted input reaching an interpreter.`,
hints:['Two of the flags are about what the PATTERN means; one is about what the OUTPUT is.','A Java stack trace is printed after its message, so the default one-line output shows you the least useful line.','The last one has a familiar shape: untrusted input reaching an interpreter it was not meant to reach.']},

{title:'Triage a directory of logs',lang:'shell',diff:'hard',
prompt:`A pod wrote several files into <code>logs/</code>. One command per numbered line: (1) list the names of files under <code>logs/</code> that contain <code>ERROR</code>, restricted to <code>*.log</code> files: use <code>-r</code>, the "files with matches" flag and <code>--include='*.log'</code>, (2) count all 4xx and 5xx responses in <code>app.log</code> with one extended regex: the status field is surrounded by spaces, so match <code>' (4|5)[0-9]{2} '</code>, (3) extract routes across every file under <code>logs/</code> and rank them, suppressing the filename prefix: combine <code>-r</code>, <code>-h</code>, <code>-o</code> and <code>-E</code> with pattern <code>/api/[a-z]+</code>, then <code>sort | uniq -c | sort -rn</code>, (4) stop after the first 2 matches of <code>ERROR</code> in <code>app.log</code> (the max-count flag), (5) match only lines whose <b>third field</b> is <code>ERROR</code> or <code>WARN</code>, by anchoring past the first two fields with <code>'^[^ ]+ [^ ]+ (ERROR|WARN) '</code> and <code>-E</code>, (6) find the slowest duration on the file: extract <code>[0-9]+ms</code>, strip the <code>ms</code> with a second grep, then <code>sort -n | tail -1</code>.`,
starter:`1.
2.
3.
4.
5.
6.
`,
solution:`1. grep -rl --include='*.log' ERROR logs/
2. grep -cE ' (4|5)[0-9]{2} ' app.log
3. grep -rhoE '/api/[a-z]+' --include='*.log' logs/ | sort | uniq -c | sort -rn
4. grep -m2 ERROR app.log
5. grep -E '^[^ ]+ [^ ]+ (ERROR|WARN) ' app.log
6. grep -oE '[0-9]+ms' app.log | grep -oE '[0-9]+' | sort -n | tail -1
`,
tests:[{d:'-r plus -l plus --include scopes the search',re:'1\\.\\s*grep\\s+-(rl|lr)\\s+--include=([\'"])\\*\\.log\\2\\s+ERROR\\s+logs/?',flags:''},{d:'One ERE counts 4xx and 5xx together',re:'2\\.\\s*grep\\s+-cE\\s+([\'"]) \\(4\\|5\\)\\[0-9\\]\\{2\\} \\1',flags:''},{d:'-h suppresses filename prefixes so the count is by route',re:'3\\.\\s*grep\\s+-rhoE[^\\n]*\\|\\s*sort\\s*\\|\\s*uniq\\s+-c\\s*\\|\\s*sort\\s+-rn',flags:'i'},{d:'-m stops after n matches',re:'4\\.\\s*grep\\s+-m\\s?2\\s+ERROR',flags:''},{d:'Field position expressed by anchoring past earlier fields',re:'5\\.\\s*grep\\s+-E\\s+([\'"])\\^\\[\\^ \\]\\+ \\[\\^ \\]\\+ \\(ERROR\\|WARN\\) \\1',flags:''},{d:'Two greps then a numeric sort finds the maximum',re:'6\\.[^\\n]*sort\\s+-n\\s*\\|\\s*tail\\s+-n?\\s?1',flags:'i'}],
behavior:`1. -l prints names only and --include keeps rotated .gz and stray .txt files out of the search; on the sample tree only logs/api.log matches, because the JSON copy writes the level in lowercase. 2. 80 lines: one regex instead of two passes, and the surrounding spaces keep it to the status field. 3. Without -h, recursive grep prefixes every match with its filename, so the "route" you count becomes "logs/api.log:/api/orders" and every file gets its own bucket. 4. -m2 stops reading after the second match, the same early-exit economics as | head, done inside grep. 5. This is grep straining: expressing "the third field" as "past two runs of non-spaces" works, but it is unreadable and breaks the moment a field contains a space. awk '$3=="ERROR"' is the clean version, and the next lesson but one is where you switch. 6. 1075ms. The second grep strips the unit so sort -n compares numbers; without it, sort would compare "99ms" against "1075ms" as text and answer 99.`,
hints:['Question 3 has a subtle flag: recursive grep prefixes filenames, which poisons a frequency count.','Question 5 is deliberately awkward: notice how much regex it takes to say "the third field", and remember it when you meet awk.','Question 6 needs the unit gone before a numeric sort can mean anything.']},
{title:'Compare the field, not the line',lang:'js',diff:'easy',
run:{call:'fieldMatches',cases:[{"name": "the third field is ERROR", "args": ["2026-08-11T09:00:00Z api ERROR", 2, "ERROR"], "expect": true}, {"name": "the value appears elsewhere on the line but not in that field", "args": ["ERROR-free api INFO", 2, "ERROR"], "expect": false}, {"name": "fields are counted from zero here", "args": ["a b c", 0, "a"], "expect": true}, {"name": "a missing field is not a match", "args": ["a b", 5, "x"], "expect": false}, {"name": "runs of whitespace count as one separator", "args": ["a   b", 1, "b"], "expect": true}]},
prompt:`Write <code>function fieldMatches(line, index, value)</code> splitting the line on runs of whitespace and returning whether the field at <code>index</code> (zero-based) is exactly <code>value</code>. This is what <code>awk \x27$3=="ERROR"\x27</code> does, and it is the fix for grep\x27s anchoring problem: a value elsewhere on the line cannot match.`,
starter:`function fieldMatches(line, index, value) {\n  return false;\n}`,
solution:`function fieldMatches(line, index, value) {\n  return line.split(/\\s+/)[index] === value;\n}`,
tests:[{d:'the line is split on whitespace',re:'split\\s*\\(\\s*/'},{d:'runs of whitespace are one separator',re:'\\\\s\\+'},{d:'the field is selected by index',re:'\\[index\\]'},{d:'comparison is exact',re:'==='}],
behavior:`Five cases execute. The second is the entire argument of the grep lesson, executed: "ERROR-free" contains ERROR, so a substring search matches a line that says the opposite of what you were looking for, while a field comparison cannot. The missing-field case returns undefined from the array, which is not equal to any string: the right answer, arrived at for free. Note the difference from awk in one detail: awk numbers fields from 1 and this function from 0, which is exactly the kind of off-by-one that makes a pipeline translated between tools quietly wrong.`,
hints:['Split on /\\s+/ so several spaces behave as one separator.','Index into the resulting array and compare with ===.','An index past the end gives undefined, which correctly matches nothing.']}]},

{id:'rpl3',title:'sed: the addressing model first, substitution second',body:`
<p><code>sed</code> is taught backwards. Everyone learns <code>s/old/new/</code> on day one and never learns the model underneath, so their <code>sed</code> commands are half-remembered incantations. The model is small and it explains everything: <b>sed reads one line at a time, and for each line it applies the commands whose <i>address</i> matches.</b> An address is <i>which lines</i>; a command is <i>what to do</i>. That is the whole language.</p>
<div class="codeSample">sed -n '2,3p'      app.log   # ADDRESS 2,3       COMMAND p (print)
sed -n '/ERROR/p'  app.log   # ADDRESS /regex/   COMMAND p
sed '/health/d'    app.log   # ADDRESS /regex/   COMMAND d (delete)
sed -n '/T14:00/,$p' app.log # RANGE: first match .. last line
sed '$d'           app.log   # ADDRESS $ = last line
sed -n '5p'        app.log   # just line 5</div>
<p>Two conventions do most of the work. <b><code>-n</code> suppresses the automatic print</b>, so <code>sed -n '/x/p'</code> means "print nothing except what I ask for". Without <code>-n</code> you get every line, plus a second copy of the matches. And <b><code>$</code> means the last line</b>, so <code>/start/,$</code> is "from the first match to the end", the everyday "show me everything after the deploy" address.</p>
<p><b>Substitution</b> is one command among many: <code>s/pattern/replacement/flags</code>. The flags that matter are <code>g</code> (every occurrence on the line, not just the first), <code>i</code> (case-insensitive) and <code>p</code> (print the result, the one you pair with <code>-n</code>). The delimiter is not special: when the pattern contains slashes, switch to <code>s#...#...#</code> or <code>s|...|...|</code> and stop escaping. Use <code>-E</code> for extended regex so groups are <code>(...)</code> rather than <code>\\(...\\)</code>, and refer back to them as <code>\\1</code>, <code>\\2</code>.</p>
<div class="codeSample">sed -E 's/trace=[0-9a-f]+/trace=REDACTED/' app.log     # scrub before sharing
sed -nE 's/.* ([0-9]+)ms .*/\\1/p' app.log              # EXTRACT: -n + s///p
sed -E 's#/api/orders/[0-9]+#/api/orders/:id#' app.log  # normalize ids, then count</div>
<p>That middle line is the idiom worth memorizing: <b><code>-n</code> plus <code>s///p</code> is extraction</b>: match the line, keep only the captured group, print that. The third is the one that makes traffic countable: collapse <code>/api/orders/1234</code> and <code>/api/orders/9876</code> into a single normalized route, and suddenly <code>sort | uniq -c</code> tells you something true.</p>
<p><b>Where sed stops being the right tool.</b> Three places, and recognizing them is most of the skill. <b>When you need fields</b>: "the sixth column" is awk's job; expressing it in sed means counting spaces in a regex. <b>When you need arithmetic or state across lines</b>: sums, averages, grouping. sed has no numbers. <b>When the input is structured</b>: HTML, JSON, CSV with quoted commas. A regex cannot parse nested structure, and the log line that breaks your pattern will be the one you needed.</p>
<p>Two operational warnings. <code>.*</code> is <b>greedy</b>: it matches as much as possible, so <code>s/.*=//</code> deletes through the <i>last</i> <code>=</code> on the line, not the first, usually the bug in an extraction that returns almost the right thing. And <code>-i</code> edits files <b>in place</b>, with no undo: GNU sed takes <code>-i</code> alone, BSD/macOS sed requires an argument (<code>-i ''</code>), so the same command silently does different things on a Mac and in CI. Always run it without <code>-i</code> first and read the output.</p>`,
docs:[['GNU sed manual','https://www.gnu.org/software/sed/manual/sed.html'],['POSIX sed','https://pubs.opengroup.org/onlinepubs/9699919799/utilities/sed.html'],['sed one-liners, explained','https://catonmat.net/sed-one-liners-explained-part-one']],
exs:[{title:'Addressing: which lines',lang:'shell',diff:'easy',
prompt:`Address lines before you change them. One command per numbered line, all on <code>app.log</code>: (1) print lines 2 to 3 only (use <code>-n</code> and the <code>p</code> command), (2) print only the lines matching <code>/ERROR/</code>, (3) delete every line containing <code>health</code> and print the rest (no <code>-n</code> here), (4) print from the first line matching <code>/T14:00/</code> to the end of the file (the range ending in the last-line address), (5) delete the last line, (6) print line 5 only.`,
starter:`1.
2.
3.
4.
5.
6.
`,
solution:`1. sed -n '2,3p' app.log
2. sed -n '/ERROR/p' app.log
3. sed '/health/d' app.log
4. sed -n '/T14:00/,$p' app.log
5. sed '$d' app.log
6. sed -n '5p' app.log
`,
tests:[{d:'Line-number range with -n and p',re:'1\\.\\s*sed\\s+-n\\s+([\'"])2,3p\\1',flags:'i'},{d:'Regex address selects matching lines',re:'2\\.\\s*sed\\s+-n\\s+([\'"])/ERROR/p\\1',flags:''},{d:'d deletes the addressed lines',re:'3\\.\\s*sed\\s+([\'"])/health/d\\1',flags:'i'},{d:'Range from a match to $ (last line)',re:'4\\.\\s*sed\\s+-n\\s+([\'"])/T14:00/,\\$p\\1',flags:'i'},{d:'$ addresses the last line',re:'5\\.\\s*sed\\s+([\'"])\\$d\\1',flags:'i'},{d:'A single line number is an address too',re:'6\\.\\s*sed\\s+-n\\s+([\'"])5p\\1',flags:'i'}],
behavior:`1. -n suppresses the automatic print, so only the addressed lines appear; drop -n and you get the whole file with lines 2-3 duplicated. 2. A regex between slashes is an address, exactly like a line number: same grammar, different selector. 3. d with no -n is the everyday noise filter: print everything, minus what matched. 4. /T14:00/,$ is "from the first line matching, to the end", the address you reach for after a deploy timestamp. Note it starts at the FIRST match, not every match. 5. $ is the last-line address, so '$d' drops the trailing line (a stray footer, for example). 6. A bare number selects one line: 5p prints line 5.`,
hints:['Every sed command is ADDRESS then COMMAND. Two commands cover this exercise: p and d.','-n means "print nothing automatically"; it is what makes p meaningful.','$ is not the end-of-line anchor here; as an address it means the last line of input.']},

{title:'Ranges, multiple commands and cleanup',lang:'shell',diff:'easy',
prompt:`More addresses, and how to run several commands at once. One command per numbered line: (1) print the lines between the first match of <code>/T14:00/</code> and the next match of <code>/T14:30/</code> (a two-regex range), (2) delete blank lines from <code>notes.txt</code> (address <code>/^$/</code>), (3) delete comment lines starting with <code>#</code> from <code>notes.txt</code> (address <code>/^#/</code>), (4) do both in one pass over <code>notes.txt</code>, using two <code>-e</code> expressions, (5) do the same two deletions in one quoted script with the commands joined by a semicolon, (6) replace only the <b>second</b> <code>=</code> on each line of <code>notes.txt</code> with <code>:</code>, the numeric flag on <code>s///</code>.`,
starter:`1.
2.
3.
4.
5.
6.
`,
solution:`1. sed -n '/T14:00/,/T14:30/p' app.log
2. sed '/^$/d' notes.txt
3. sed '/^#/d' notes.txt
4. sed -e '/^#/d' -e '/^$/d' notes.txt
5. sed '/^#/d;/^$/d' notes.txt
6. sed 's/=/:/2' notes.txt
`,
tests:[{d:'A range can be bounded by two regexes',re:'1\\.\\s*sed\\s+-n\\s+([\'"])/T14:00/,/T14:30/p\\1',flags:''},{d:'/^$/ addresses blank lines',re:'2\\.\\s*sed\\s+([\'"])/\\^\\$/d\\1',flags:''},{d:'/^#/ addresses comment lines',re:'3\\.\\s*sed\\s+([\'"])/\\^#/d\\1',flags:''},{d:'-e runs several commands in one pass',re:'4\\.\\s*sed\\s+-e\\s+([\'"])/\\^#/d\\1\\s+-e\\s+([\'"])/\\^\\$/d\\2',flags:''},{d:'A semicolon separates commands in one script',re:'5\\.\\s*sed\\s+([\'"])/\\^#/d;\\s*/\\^\\$/d\\1',flags:''},{d:'The numeric flag targets the nth occurrence',re:'6\\.\\s*sed\\s+([\'"])s/=/:/2\\1',flags:''}],
behavior:`1. 46 lines on the sample log, and the trap worth knowing: the range ends at the FIRST match of the end pattern after the start. If the end pattern never matches (try /T14:05/, a timestamp this log never produces), the range silently runs to end of file and you get 540 lines instead of 46. A range that returns far too much usually means the end address never matched. 2-3. Two addresses, same command; /^$/ is "start immediately followed by end", i.e. an empty line. 4-5. Both forms run the commands in order on every line, in a single pass; chaining "sed | sed | sed" instead costs a process per stage and reads the data again each time. 6. Without a number or a g, s/// changes the first occurrence only; "2" changes exactly the second. That is how a=1 b=2 becomes a=1 b:2.`,
hints:['A range takes two addresses separated by a comma: line numbers, regexes, or one of each.','-e lets you give several commands; so does a semicolon inside one quoted script.','s/// has three modifiers worth knowing: g (all), a number (the nth), and i (case-insensitive).']},

{title:'Substitute and extract',lang:'shell',diff:'medium',
prompt:`Now change things. One command per numbered line: (1) replace every <code>trace=</code> id (pattern <code>trace=[0-9a-f]+</code>) with <code>trace=REDACTED</code>, using <code>sed -E</code>, (2) print <b>only</b> the duration digits from each line: combine <code>-n</code> with <code>-E 's/.* ([0-9]+)ms .*/\\1/p'</code>, (3) normalize numeric order ids: replace <code>/api/orders/1234</code>-style paths (regex <code>/api/orders/[0-9]+</code>) with <code>/api/orders/:id</code>, using <code>#</code> as the delimiter so you need no backslashes, (4) the <code>s///</code> flag that replaces <b>every</b> occurrence on a line rather than the first (one letter), (5) the flag that makes sed edit the file in place, with the warning that it has no undo (write the flag), (6) name the quantifier behavior that makes <code>s/.*=//</code> delete through the <b>last</b> <code>=</code> on the line instead of the first (one word).`,
starter:`1.
2.
3.
4.
5.
6.
`,
solution:`1. sed -E 's/trace=[0-9a-f]+/trace=REDACTED/' app.log
2. sed -nE 's/.* ([0-9]+)ms .*/\\1/p' app.log
3. sed -E 's#/api/orders/[0-9]+#/api/orders/:id#' app.log
4. g
5. -i
6. greedy
`,
tests:[{d:'Substitution with an ERE character class',re:'1\\.\\s*sed\\s+-E\\s+([\'"])s/trace=\\[0-9a-f\\]\\+/trace=REDACTED/\\1',flags:'i'},{d:'-n with s///p is the extraction idiom',re:'2\\.\\s*sed\\s+-nE\\s+([\'"])s/\\.\\* \\(\\[0-9\\]\\+\\)ms \\.\\*/\\\\1/p\\1'},{d:'A different delimiter avoids escaping slashes',re:'3\\.\\s*sed\\s+-E\\s+([\'"])s#/api/orders/\\[0-9\\]\\+#/api/orders/:id#\\1',flags:'i'},{d:'g replaces every occurrence on the line',re:'4\\.\\s*g\\s*$',flags:'im'},{d:'-i edits in place, irreversibly',re:'5\\.\\s*-i',flags:'i'},{d:'.* is greedy',re:'6\\.\\s*greedy',flags:'i'}],
behavior:`1. Scrubbing identifiers is the responsible way to share a log in a ticket, and -E lets you write + instead of \\+. 2. This is THE sed idiom: -n prints nothing, the s/// keeps only capture group 1, and the trailing p prints just that. Without -n you would get every line, changed or not. 3. Collapsing /api/orders/1234 into /api/orders/:id is what makes routes countable; otherwise every request is its own unique "route" and uniq -c tells you nothing. Choosing # as the delimiter removes six backslashes. 4. Without g, sed replaces only the FIRST match per line, a classic near-miss when a line carries two trace ids. 5. -i has no undo, and GNU (-i) and BSD/macOS (-i '') disagree on the syntax, so the same script behaves differently on a laptop and in CI. Run it without -i first. 6. Greedy: .* takes as much as it can, so an extraction anchored with .* silently starts from the last possible position.`,
hints:['Question 2 is the extraction idiom: -n, a capture group, and the p flag on the s command.','The delimiter after s is whatever character you put there; if the pattern is full of slashes, pick something else.','Question 6 explains why an extraction that "works on most lines" fails on the line with two separators.']},

{title:'Normalize, then count',lang:'shell',diff:'medium',
prompt:`Ids make traffic uncountable; normalizing them is sed's best day job. Assume lines like <code>... GET /api/orders/1234 200 87ms ...</code>. One command per numbered line: (1) rewrite any <code>/api/&lt;word&gt;/&lt;digits&gt;</code> path to <code>/api/&lt;word&gt;/:id</code>: use <code>sed -E</code> with <code>#</code> delimiters and the pattern <code>/api/([a-z]+)/[0-9]+</code>, replacement <code>/api/\\1/:id</code>, (2) pipe that into <code>awk '{print $5}'</code> to keep only the normalized route, (3) complete the frequency count by adding <code>sort | uniq -c | sort -rn</code>, (4) extract just the date part (the first 10 characters) and the level from each line, printing <code>date level</code>, using <code>sed -nE 's/^([^ ]{10}).*(ERROR|WARN).*/\\1 \\2/p'</code>, (5) strip the <code>ms</code> unit from durations so they can be sorted numerically: <code>sed -E 's/([0-9]+)ms/\\1/'</code>, (6) name what would happen to your route counts if you skipped step 1 entirely (one word: every request becomes its own ____ ).`,
starter:`1.
2.
3.
4.
5.
6.
`,
solution:`1. sed -E 's#/api/([a-z]+)/[0-9]+#/api/\\1/:id#' app.log
2. sed -E 's#/api/([a-z]+)/[0-9]+#/api/\\1/:id#' app.log | awk '{print $5}'
3. sed -E 's#/api/([a-z]+)/[0-9]+#/api/\\1/:id#' app.log | awk '{print $5}' | sort | uniq -c | sort -rn
4. sed -nE 's/^([^ ]{10}).*(ERROR|WARN).*/\\1 \\2/p' app.log
5. sed -E 's/([0-9]+)ms/\\1/' app.log
6. bucket
`,
tests:[{d:'Capture group reused in the replacement',re:'1\\.\\s*sed\\s+-E\\s+([\'"])s#/api/\\(\\[a-z\\]\\+\\)/\\[0-9\\]\\+#/api/\\\\1/:id#\\1',flags:''},{d:'awk keeps the normalized route field',re:'2\\.[^\\n]*\\|\\s*awk\\s+([\'"])\\{print \\$5\\}\\1',flags:''},{d:'The counting idiom completes the pipeline',re:'3\\.[^\\n]*\\|\\s*sort\\s*\\|\\s*uniq\\s+-c\\s*\\|\\s*sort\\s+-rn',flags:'i'},{d:'Two capture groups, printed in order',re:'4\\.\\s*sed\\s+-nE\\s+([\'"])s/\\^\\(\\[\\^ \\]\\{10\\}\\)\\.\\*\\(ERROR\\|WARN\\)\\.\\*/\\\\1 \\\\2/p\\1',flags:''},{d:'Unit stripped so numbers can sort',re:'5\\.\\s*sed\\s+-E\\s+([\'"])s/\\(\\[0-9\\]\\+\\)ms/\\\\1/\\1',flags:''},{d:'Un-normalized ids fragment the counts',re:'6\\.\\s*bucket|6\\.\\s*group|6\\.\\s*route',flags:'i'}],
behavior:`1. \\1 in the replacement re-uses what the group captured, so /api/orders/1234 and /api/users/77 both keep their resource name while losing the id. 2. The route now sits in field 5 of every line, identical across requests. 3. The counting idiom then produces a real traffic profile rather than a list of unique URLs. 4. Two groups, referenced as \\1 and \\2, and note .* between them is greedy, which is fine here because the levels appear once. 5. sort -n on "87ms" compares text and gives you nonsense; strip the unit first, or use awk, which coerces "87ms" to 87 on its own. 6. Its own bucket: with raw ids, uniq -c reports thousands of routes each seen once, a table that is technically correct and completely useless. Normalization is what makes aggregation meaningful, the same reason metrics libraries insist on templated route labels.`,
hints:['\\1 in the replacement is the text the first (...) captured.','Normalize first, count second: the counting idiom is unchanged from the grep lesson.','If your top-N table is thousands of rows each with count 1, you forgot to normalize.']},

{title:'Interview: where sed stops',lang:'text',diff:'hard',
prompt:`Knowing the boundary is the senior half of the skill. One answer per numbered line: (1) sed's processing model: it reads and applies commands one ____ at a time (one word), (2) every sed command is an ____ followed by a command (one word), (3) when you need "the sixth column", the right tool is ____ (one word), (4) when you need a sum, an average or grouping across lines, the right tool is ____ (one word), (5) when the input is JSON, the right tool is ____ (one word), (6) the general rule this stream keeps returning to: never parse ____ data with a regex (one word, the category HTML, JSON and CSV share).`,
starter:`1.
2.
3.
4.
5.
6.
`,
solution:`1. line
2. address
3. awk
4. awk
5. jq
6. structured
`,
tests:[{d:'sed is line-oriented',re:'1\\.\\s*line',flags:'is'},{d:'Address then command',re:'2\\.\\s*address',flags:'is'},{d:'Fields are awk\'s job',re:'3\\.\\s*awk',flags:'is'},{d:'Arithmetic and grouping are awk\'s job',re:'4\\.\\s*awk',flags:'is'},{d:'JSON is jq\'s job',re:'5\\.\\s*jq',flags:'is'},{d:'Never regex structured data',re:'6\\.\\s*structured',flags:'is'}],
behavior:`1. Line at a time, which is why sed streams a 40GB file in constant memory, and why anything spanning lines is awkward (possible via the hold space, rarely worth it). 2. Address then command: /ERROR/d is "on lines matching ERROR, delete". Once you see the grammar, the incantations become sentences. 3-4. Both awk: it splits every line into fields for free and has real variables and arrays, so "the sixth column" and "the average per route" are one-liners rather than regex gymnastics. 5. jq, because JSON has nesting, escaping and optional fields that no regex can track. 6. Structured. The failure is not theoretical: the first log line with a quoted delimiter, an escaped quote or a missing field is the one that quietly breaks your pattern, and it will be the line you needed.`,
hints:['Two answers are the same tool: the one that splits lines into fields and can also do arithmetic.','sed has no numbers and no columns; that is the boundary, not a gap in your knowledge.','The last answer names the property HTML, JSON and CSV share: nesting and escaping, which regexes cannot track.']},

{title:'Greed, in-place edits and portability',lang:'shell',diff:'hard',
prompt:`The three ways a working <code>sed</code> command turns into an incident. One answer per numbered line: (1) on the line <code>a=1 b=2 c=3</code>, what does <code>sed -E 's/.*=//'</code> print: write the exact output, (2) rewrite that substitution so it deletes only up to the <b>first</b> <code>=</code>, using a negated character class instead of <code>.*</code>: the pattern is <code>[^=]*=</code>, (3) the general name for the <code>.*</code> behavior that caused (1) (one word), (4) edit <code>app.log</code> in place while keeping a backup at <code>app.log.bak</code> (the flag takes the suffix directly), (5) the reason a bare <code>-i</code> works on Linux but fails on macOS: BSD sed requires an ____ after -i (one word), (6) before running any in-place edit, the habit that prevents the incident: run it ____ <code>-i</code> first and read the output (one word).`,
starter:`1.
2.
3.
4.
5.
6.
`,
solution:`1. 3
2. sed -E 's/[^=]*=//'
3. greedy
4. sed -i.bak '/INFO/d' app.log
5. argument
6. without
`,
tests:[{d:'Greedy .* consumes through the last =',re:'1\\.\\s*3\\s*$',flags:'m'},{d:'A negated class stops at the first delimiter',re:'2\\.\\s*sed\\s+-E\\s+([\'"])s/\\[\\^=\\]\\*=//\\1',flags:''},{d:'The behavior is called greediness',re:'3\\.\\s*greed',flags:'i'},{d:'-i takes the backup suffix directly',re:'4\\.\\s*sed\\s+-i\\.bak\\s+([\'"])/INFO/d\\1\\s+app\\.log',flags:''},{d:'BSD sed needs an argument after -i',re:'5\\.\\s*argument|5\\.\\s*extension|5\\.\\s*suffix',flags:'i'},{d:'Dry-run before editing in place',re:'6\\.\\s*without',flags:'i'}],
behavior:`1. It prints 3. .* matches as much as it can, so the match runs to the LAST = on the line and everything before it is deleted, the extraction that is right on single-delimiter lines and quietly wrong on the rest. 2. [^=]*= means "as many non-= characters as possible, then one =", which cannot cross a delimiter; the output becomes 1 b=2 c=3. POSIX regexes have no lazy .*?; the negated class IS the idiom. 3. Greediness. It is the same trap as the sed extraction in the previous exercise and the reason a pattern that works on your sample breaks on production data. 4. -i.bak writes app.log.bak before overwriting: the only cheap undo you get. 5. An argument. GNU sed accepts -i alone; BSD/macOS sed reads the next token as the suffix, so "sed -i '/x/d' file" on a Mac tries to use "/x/d" as the backup suffix and then complains about a missing command. The same script therefore behaves differently on a laptop and in CI. Always write -i.bak, which is valid on both. 6. Without. A no -i dry run costs two seconds and is the difference between reading a diff and restoring from backup.`,
hints:['Question 1: ask which = the greedy .* stops at: the first or the last.','POSIX regex has no lazy quantifier; "everything that is not the delimiter" is how you get the same effect.','Questions 4 and 5 are the same bug seen twice: -i.bak is portable, bare -i is not.']}]},

{id:'rpl4',title:'awk: the one that actually computes',body:`
<p>grep selects lines. sed rewrites them. Neither can answer <i>"what is the average latency per endpoint?"</i>, because neither can add. <b>awk</b> is a small programming language that has been sitting in every Unix since 1977 waiting for exactly that question, and its whole grammar is one line:</p>
<div class="codeSample">awk 'PATTERN { ACTION }' file</div>
<p>For each line, if <code>PATTERN</code> is true, run <code>ACTION</code>. Omit the pattern and the action runs on every line; omit the action and matching lines are printed. That is why <code>awk '$6==500'</code> is a complete program (pattern only), and <code>awk '{print $5}'</code> is too.</p>
<p><b>Fields come free.</b> awk splits every line on whitespace before you see it: <code>$1</code>, <code>$2</code>, … <code>$NF</code> (the last field), with <code>NF</code> the field count and <code>NR</code> the line number. <code>$0</code> is the whole line. <code>-F,</code> switches the separator to a comma, <code>-F'\\t'</code> to a tab. Everything that took a page of regex in sed ("the third column", "the last column") is now two characters.</p>
<div class="codeSample">awk '{print $5}'            app.log   # the route field
awk '$6==500'               app.log   # status exactly 500, cannot over-match
awk '$3=="ERROR" &amp;&amp; $5=="/api/checkout"' app.log
awk 'NR==1 {print "first:", $0}'      app.log
awk 'END {print NR}'        app.log   # 990, line count, no wc needed
awk -F, '{print $2}'        data.csv  # comma-separated</div>
<p><b>BEGIN and END</b> are patterns that match before the first line and after the last, where you print headers and totals. Variables need no declaration and start at <code>0</code> or <code>""</code>, so <code>{s+=$7; n++} END {print s/n}</code> is a complete average. And awk coerces strings to numbers by reading the leading digits: <code>"87ms"+0</code> is <b>87</b>. That single behavior is why durations with units are not a problem here and are a problem everywhere else.</p>
<p><b>The part that beats every other tool: associative arrays.</b> An awk array is a hash map with string keys, and it turns "group by" into one line: one pass over the data, no sorting, memory proportional to the number of <i>distinct keys</i> rather than to the file:</p>
<div class="codeSample">awk '{c[$5]++} END {for (r in c) print c[r], r}' app.log | sort -rn
# 259 /api/search · 257 /api/orders · 249 /api/checkout · 225 /api/users

awk '{s[$5]+=$7+0; n[$5]++} END {for (r in s) printf "%-16s avg=%6.1fms n=%d\\n", r, s[r]/n[r], n[r]}' app.log
# /api/checkout   avg=  76.3ms n=249      &lt;- remember this number</div>
<p>That is <code>SELECT route, avg(dur) FROM log GROUP BY route</code> with no database, no import and no schema, on a file you received ninety seconds ago. It is the reason awk is still worth learning: not the syntax, the <b>aggregation</b>.</p>
<p><b>Where it stops.</b> Whitespace splitting breaks on fields that contain spaces or quoted separators; a real CSV parser is not a <code>-F,</code>. Sorting inside awk is <code>gawk</code>-only (<code>asort</code>), so portable scripts pipe to <code>sort</code> instead. And once a script grows past a screen, or needs joins, dates or JSON, it wants to be Python. Note the number above, though: checkout's <b>average</b> is 76.3ms. Its p99 is nearly a second. Averages hide exactly the failure you are being paged about, which is the capstone.</p>`,
docs:[['GNU awk user\'s guide','https://www.gnu.org/software/gawk/manual/gawk.html'],['POSIX awk','https://pubs.opengroup.org/onlinepubs/9699919799/utilities/awk.html'],['The AWK Programming Language (Aho, Kernighan, Weinberger)','https://awk.dev/']],
exs:[{title:'Fields, NR and NF',lang:'shell',diff:'easy',
prompt:`The vocabulary. One command per numbered line, on <code>app.log</code> (lines like <code>2026-08-11T09:36:36Z api-7f3 ERROR POST /api/checkout 500 73ms trace=2c1eea</code>): (1) print the route (field 5), (2) print the timestamp and the status together (fields 1 and 6, separated by a comma in the <code>print</code> list), (3) print the <b>last</b> field of every line using the last-field variable, (4) print the line number and the number of fields for each line, using <code>NR</code> and <code>NF</code>, (5) print the total number of lines using an <code>END</code> block and <code>NR</code> (no <code>wc</code>), (6) print field 2 of a comma-separated file <code>data.csv</code> by setting the field separator on the command line.`,
starter:`1.
2.
3.
4.
5.
6.
`,
solution:`1. awk '{print $5}' app.log
2. awk '{print $1, $6}' app.log
3. awk '{print $NF}' app.log
4. awk '{print NR, NF}' app.log
5. awk 'END {print NR}' app.log
6. awk -F, '{print $2}' data.csv
`,
tests:[{d:'Fields are numbered from 1',re:'1\\.\\s*awk\\s+([\'"])\\{print \\$5\\}\\1',flags:''},{d:'A comma in print inserts the output separator',re:'2\\.\\s*awk\\s+([\'"])\\{print \\$1,\\s*\\$6\\}\\1',flags:''},{d:'$NF is the last field',re:'3\\.\\s*awk\\s+([\'"])\\{print \\$NF\\}\\1',flags:''},{d:'NR is the record number, NF the field count',re:'4\\.\\s*awk\\s+([\'"])\\{print NR,\\s*NF\\}\\1',flags:''},{d:'END runs after the last line',re:'5\\.\\s*awk\\s+([\'"])END \\{print NR\\}\\1',flags:''},{d:'-F sets the field separator',re:'6\\.\\s*awk\\s+-F,?[\'"]?,?[\'"]?\\s+([\'"])\\{print \\$2\\}\\1',flags:''}],
behavior:`1. No regex, no counting spaces: the fifth field is $5, and awk did the splitting before your code ran. 2. A comma between print arguments emits OFS (a space by default); omit it and "print $1 $6" concatenates them with nothing between, a classic near-miss. 3. $NF is the last field whatever the line length, which is how you read a trailing column from ragged input. 4. NR counts records (lines) from 1; NF is fields on the current line: 8 here. A line where NF suddenly differs is a malformed line, and comparing NF is the cheapest data-quality check there is. 5. END {print NR} is wc -l without the extra process, and it works after any filtering you applied. 6. -F, changes the separator for the whole run; for tabs it is -F'\\t'.`,
hints:['awk has already split the line; you never write a regex to reach a column.','NR = number of records so far; NF = number of fields on this line; $NF = the last field\'s value.','print with commas separates the values; without commas it glues them together.']},

{title:'Patterns select, actions compute',lang:'shell',diff:'easy',
prompt:`Everything before the braces is the pattern. One command per numbered line on <code>app.log</code>: (1) print lines whose status field (field 6) is exactly <code>500</code> (pattern only, no action), (2) print lines matching the regex <code>/ERROR/</code>, pattern only, (3) print the route of lines whose status is 500 or more (use <code>&gt;=</code>), (4) print lines where the level (field 3) is <code>ERROR</code> <b>and</b> the route (field 5) is <code>/api/checkout</code>: use <code>&amp;&amp;</code> and string equality with double quotes, (5) count lines matching <code>/ERROR/</code> by incrementing a variable and printing it in <code>END</code>, (6) print the first line only, prefixed with <code>first:</code>, using the pattern <code>NR==1</code>.`,
starter:`1.
2.
3.
4.
5.
6.
`,
solution:`1. awk '$6==500' app.log
2. awk '/ERROR/' app.log
3. awk '$6>=500 {print $5}' app.log
4. awk '$3=="ERROR" && $5=="/api/checkout"' app.log
5. awk '/ERROR/ {n++} END {print n}' app.log
6. awk 'NR==1 {print "first:", $0}' app.log
`,
tests:[{d:'A pattern with no action prints the line',re:'1\\.\\s*awk\\s+([\'"])\\$6==500\\1',flags:''},{d:'A bare regex is a pattern',re:'2\\.\\s*awk\\s+([\'"])/ERROR/\\1',flags:''},{d:'Numeric comparison on a field',re:'3\\.\\s*awk\\s+([\'"])\\$6>=500 \\{print \\$5\\}\\1',flags:''},{d:'Two field tests combined with &&',re:'4\\.\\s*awk\\s+([\'"])\\$3=="ERROR" && \\$5=="/api/checkout"\\1',flags:''},{d:'A counter plus END prints a total',re:'5\\.\\s*awk\\s+([\'"])/ERROR/ \\{n\\+\\+\\} END \\{print n\\}\\1',flags:''},{d:'NR==1 selects the first record',re:'6\\.\\s*awk\\s+([\'"])NR==1 \\{print "first:", \\$0\\}\\1',flags:''}],
behavior:`1. 32 lines, and none of them matched by accident: comparing field 6 to 500 cannot be fooled by a 500 inside a trace id or a duration, which is the grep lesson's mistake made structurally impossible. 2. /ERROR/ tests the whole line, exactly like grep; awk is a superset when you need it to be. 3. Field 6 is compared as a number here because both sides look numeric; awk decides by content, which is usually what you want and occasionally surprising ("010" vs 10). 4. && is the ordinary logical and; string comparison needs double quotes, and single quotes would end the shell's quoting. 5. n starts at 0 without being declared: no initialization ceremony, which is why awk one-liners stay one lines. 6. NR==1 is how you skip or capture a header row: "NR>1" is the everyday "skip the CSV header".`,
hints:['Pattern only prints the line; action only runs on every line. You need both forms here.','Numbers compare with == >= <; strings compare with == inside double quotes.','A variable you have never mentioned is already 0; just increment it.']},

{title:'Arithmetic and formatting',lang:'shell',diff:'medium',
prompt:`Now compute. Durations look like <code>73ms</code> in field 7. One command per numbered line: (1) print the total of all durations: add <code>$7+0</code> to a variable and print it in <code>END</code>, (2) print the <b>average</b> duration to one decimal place, using <code>printf "%.1f\\n", s/n</code>, (3) count how many lines have a duration over 100ms, passing the threshold in from the shell with <code>-v t=100</code> and comparing <code>$7+0 &gt; t</code>, (4) print the largest duration seen, tracking a maximum in a variable, (5) explain the <code>+0</code>: awk converts <code>"73ms"</code> to the number 73 by reading its leading ____ (one word), (6) print the count of each level (field 3): this needs an array, so write <code>{c[$3]++} END {for (l in c) print l, c[l]}</code>.`,
starter:`1.
2.
3.
4.
5.
6.
`,
solution:`1. awk '{s+=$7+0} END {print s}' app.log
2. awk '{s+=$7+0; n++} END {printf "%.1f\\n", s/n}' app.log
3. awk -v t=100 '$7+0 > t {n++} END {print n+0}' app.log
4. awk '{d=$7+0; if (d>m) m=d} END {print m}' app.log
5. digits
6. awk '{c[$3]++} END {for (l in c) print l, c[l]}' app.log
`,
tests:[{d:'Accumulate a sum across lines',re:'1\\.\\s*awk\\s+([\'"])\\{s\\+=\\$7\\+0\\} END \\{print s\\}\\1',flags:''},{d:'printf formats to one decimal',re:'2\\.[^\\n]*printf "%\\.1f',flags:''},{d:'-v passes a shell value in safely',re:'3\\.\\s*awk\\s+-v\\s+t=100\\s+([\'"])\\$7\\+0 > t \\{n\\+\\+\\}',flags:''},{d:'A running maximum needs a comparison',re:'4\\.[^\\n]*if \\(d>m\\) m=d',flags:''},{d:'Coercion reads the leading digits',re:'5\\.\\s*digits|5\\.\\s*number',flags:'i'},{d:'An array keyed by the level field counts groups',re:'6\\.\\s*awk\\s+([\'"])\\{c\\[\\$3\\]\\+\\+\\} END \\{for \\(l in c\\) print l, c\\[l\\]\\}\\1',flags:''}],
behavior:`1. 77100ms total on the sample. Without +0 awk would still coerce in an arithmetic context, but writing it makes the intent explicit and survives fields like "n/a". 2. 77.9. printf gives you control that print does not: field widths, decimals, and no trailing space surprises. 3. 236 lines. -v is the safe way to get a shell value into awk; interpolating the shell variable into the program text instead is the awk equivalent of SQL injection. Printing "n+0" rather than "n" prints 0 instead of an empty line when nothing matched. 4. 1075. m starts at 0, so this is correct for non-negative values and would need seeding for data that can go negative. 5. Leading digits: "73ms" becomes 73, "ms73" becomes 0. That is why durations with units need no cleanup in awk and do need it before sort -n. 6. INFO 910, WARN 48, ERROR 32: one pass, no sort, and the shape of the next exercise.`,
hints:['A variable used before being set is 0, so s+=... and n++ need no setup.','printf takes a format string and then the values, and you supply the newline yourself.','-v name=value defines a variable before the first line is read; never paste shell variables into the program text.']},

{title:'Associative arrays: group by',lang:'shell',diff:'medium',
prompt:`The feature that makes awk indispensable. One command per numbered line on <code>app.log</code> (route in field 5, status in 6, duration in 7): (1) count requests per route: increment <code>c[$5]</code>, then print <code>c[r], r</code> for each key in <code>END</code>, (2) pipe that into <code>sort -rn</code> so the busiest route is first, (3) count only the 5xx responses per route, by adding the pattern <code>$6&gt;=500</code> before the action, (4) sum the duration per route into <code>s[$5]</code> and print <code>r, s[r]</code> in <code>END</code>, (5) track the maximum duration per route using <code>if (($7+0) &gt; m[$5]) m[$5]=$7+0</code> and print each route with its max, (6) name the property of an awk array that makes all of this one pass and no sorting: its keys are ____ (one word, the data type).`,
starter:`1.
2.
3.
4.
5.
6.
`,
solution:`1. awk '{c[$5]++} END {for (r in c) print c[r], r}' app.log
2. awk '{c[$5]++} END {for (r in c) print c[r], r}' app.log | sort -rn
3. awk '$6>=500 {c[$5]++} END {for (r in c) print c[r], r}' app.log
4. awk '{s[$5]+=$7+0} END {for (r in s) print r, s[r]}' app.log
5. awk '{if (($7+0) > m[$5]) m[$5]=$7+0} END {for (r in m) print r, m[r]}' app.log
6. strings
`,
tests:[{d:'An array keyed by route counts groups in one pass',re:'1\\.\\s*awk\\s+([\'"])\\{c\\[\\$5\\]\\+\\+\\} END \\{for \\(r in c\\) print c\\[r\\], r\\}\\1',flags:''},{d:'Ranking is delegated to sort',re:'2\\.[^\\n]*\\|\\s*sort\\s+-rn',flags:'i'},{d:'A pattern filters before the grouping',re:'3\\.\\s*awk\\s+([\'"])\\$6>=500 \\{c\\[\\$5\\]\\+\\+\\}',flags:''},{d:'Summing per key needs += into the array',re:'4\\.\\s*awk\\s+([\'"])\\{s\\[\\$5\\]\\+=\\$7\\+0\\}',flags:''},{d:'A per-key maximum tracked across lines',re:'5\\.[^\\n]*if \\(\\(\\$7\\+0\\) > m\\[\\$5\\]\\) m\\[\\$5\\]=\\$7\\+0',flags:''},{d:'awk array keys are strings',re:'6\\.\\s*string',flags:'i'}],
behavior:`1. /api/search 259, /api/orders 257, /api/checkout 249, /api/users 225, in whatever order the hash yields, which is why step 2 exists. 2. for-in gives no ordering guarantee, so ranking is sort's job; expecting sorted output from the loop is the assumption a wrong answer here breaks. 3. Filtering in the pattern means the array only ever sees the rows you care about: 11 checkout, 9 users, 7 search, 5 orders. 4. Summing per key is the same shape as counting, and adding a parallel n[$5]++ turns it into an average, which is the previous lesson's SQL GROUP BY. 5. checkout 1075, search 200, orders 120, users 40: the max already hints at the story the average hid. 6. Strings. Every subscript is converted to a string, so c[1] and c["1"] are the same bucket: convenient here, and a real trap when you index by a number you expected to stay numeric.`,
hints:['Every one of these is the same three-part shape: pattern, array update, END loop.','for (k in arr) has no defined order; pipe to sort when order matters.','Counting, summing and maxing differ only in what the action does to the array slot.']},

{title:'The average that hides the outage',lang:'shell',diff:'hard',
prompt:`Aggregate properly, then read the result critically. One command per numbered line: (1) print, per route, the average duration formatted with <code>printf "%-16s avg=%6.1fms n=%d\\n", r, s[r]/n[r], n[r]</code>: accumulate <code>s[$5]+=$7+0</code> and <code>n[$5]++</code>, (2) pipe it through <code>sort</code> so the routes come out in a stable order, (3) restrict the same calculation to lines <b>after</b> the deploy at 14:00 by adding the pattern <code>$1 &gt;= "2026-08-11T14:00:00Z"</code> (string comparison: ISO-8601 sorts correctly as text), (4) print the maximum duration per route alongside the average, so the tail is visible: add <code>if (($7+0)&gt;m[$5]) m[$5]=$7+0</code> and print <code>m[r]</code> too, (5) checkout's average after the deploy is about 76ms while its worst request is over 1000ms: name the statistic that would have shown the problem (one word, e.g. p99; write <code>percentile</code>), (6) the reason the average missed it, in one word: the slow requests are a small ____ of the total.`,
starter:`1.
2.
3.
4.
5.
6.
`,
solution:`1. awk '{s[$5]+=$7+0; n[$5]++} END {for (r in s) printf "%-16s avg=%6.1fms n=%d\\n", r, s[r]/n[r], n[r]}' app.log
2. awk '{s[$5]+=$7+0; n[$5]++} END {for (r in s) printf "%-16s avg=%6.1fms n=%d\\n", r, s[r]/n[r], n[r]}' app.log | sort
3. awk '$1 >= "2026-08-11T14:00:00Z" {s[$5]+=$7+0; n[$5]++} END {for (r in s) printf "%-16s avg=%6.1fms n=%d\\n", r, s[r]/n[r], n[r]}' app.log
4. awk '{s[$5]+=$7+0; n[$5]++; if (($7+0)>m[$5]) m[$5]=$7+0} END {for (r in s) printf "%-16s avg=%6.1fms max=%dms n=%d\\n", r, s[r]/n[r], m[r], n[r]}' app.log
5. percentile
6. fraction
`,
tests:[{d:'Average per route with aligned printf output',re:'1\\.[^\\n]*s\\[\\$5\\]\\+=\\$7\\+0; n\\[\\$5\\]\\+\\+[^\\n]*printf "%-16s avg=%6\\.1fms n=%d',flags:''},{d:'Sorted for a stable, readable table',re:'2\\.[^\\n]*\\|\\s*sort\\s*$',flags:'m'},{d:'ISO-8601 timestamps compare correctly as strings',re:'3\\.\\s*awk\\s+([\'"])\\$1 >= "2026-08-11T14:00:00Z" \\{',flags:''},{d:'Max per route exposes the tail the mean hides',re:'4\\.[^\\n]*if \\(\\(\\$7\\+0\\)>m\\[\\$5\\]\\) m\\[\\$5\\]=\\$7\\+0[^\\n]*max=%dms',flags:''},{d:'Percentiles show what averages hide',re:'5\\.\\s*percentile|5\\.\\s*p99',flags:'i'},{d:'A small fraction of requests moves the tail, not the mean',re:'6\\.\\s*fraction|6\\.\\s*percent|6\\.\\s*proportion',flags:'i'}],
behavior:`1. checkout avg=76.3ms n=249, orders 75.3, search 127.7, users 25.2: a table that says "everything is fine". 2. for-in order is unspecified; piping to sort is what makes two runs comparable. 3. After the deploy checkout's mean is 86.1ms against 64.8ms before: up a third, on 134 samples, which is exactly the kind of move a tired on-call engineer writes off as noise. Its median goes 65ms to 67ms: unchanged. Meanwhile its p99 goes 95ms to 975ms. 4. Add the max and checkout reads 1075ms against 200, 120 and 40 for the others: the first real signal in the whole table. 5. A percentile: p99 goes from 95ms to 975ms on this data, a 10x regression the mean rounds away. 6. A small fraction: 3 of the 134 checkout calls after the deploy exceed 500ms: 2.2%. Three slow requests move the mean by about 21ms and the 99th percentile by 880. This is why SLOs are written on percentiles, and why "average response time" dashboards let outages run for hours.`,
hints:['Everything here is the group-by shape from the last exercise plus printf.','ISO-8601 was designed so that lexical order equals chronological order; a plain string comparison is a valid time filter.','Compute the max next to the mean and the story changes; that is the whole argument for percentiles.']},

{title:'Interview: why awk, and where it stops',lang:'text',diff:'hard',
prompt:`One answer per numbered line: (1) awk's grammar in two words: ____ and action (one word, the first), (2) the variable holding the current line number (two letters), (3) the variable holding the number of fields on this line (two letters), (4) the data structure that makes group-by a one-liner: an ____ array (one word), (5) <code>"87ms"+0</code> evaluates to what number, (6) the reason a <code>-F,</code> is not a CSV parser: it cannot handle a separator inside a ____ field (one word).`,
starter:`1.
2.
3.
4.
5.
6.
`,
solution:`1. pattern
2. NR
3. NF
4. associative
5. 87
6. quoted
`,
tests:[{d:'Pattern then action',re:'1\\.\\s*pattern',flags:'is'},{d:'NR is the record number',re:'2\\.\\s*NR',flags:'s'},{d:'NF is the field count',re:'3\\.\\s*NF',flags:'s'},{d:'Associative arrays give group-by',re:'4\\.\\s*associative',flags:'is'},{d:'Leading-digit coercion yields 87',re:'5\\.\\s*87',flags:'s'},{d:'Quoted fields defeat naive splitting',re:'6\\.\\s*quoted',flags:'is'}],
behavior:`1. Pattern and action: omit either and awk supplies a default, which is why one-liners are so short. 2-3. NR is records seen so far (line number), NF is fields on the current line; NR>1 skips a header, NF!=8 finds malformed lines. 4. Associative: string-keyed hash maps, so counting, summing and maxing per group are all one pass with memory proportional to distinct keys, not to file size. 5. 87: awk reads the leading digits and stops at "m". "ms87" would be 0, so the coercion helps only when the number leads. 6. A quoted field: "Smith, John" contains the separator, and -F, splits it in two. Real CSV needs a real parser (Python's csv module, or a dedicated tool), and the senior answer to "can awk do this?" is "yes, until the data has quoting, and then no".`,
hints:['Two of the answers are two-letter built-in variables that come up in every awk script.','Question 4 is the answer to "why not just use grep and sed for this?"','Question 6 is the boundary: the failure appears on the first row that quotes its separator, not before.']},
{title:'Group and count, executed',lang:'js',diff:'medium',
run:{call:'groupCount',cases:[{"name": "two of one key and one of another", "args": [["a x", "b y", "a z"], 0], "expect": {"a": 2, "b": 1}}, {"name": "grouping by a different field", "args": [["a x", "b x", "c y"], 1], "expect": {"x": 2, "y": 1}}, {"name": "an empty input gives an empty table", "args": [[], 0], "expect": {}}, {"name": "one line, one group", "args": [["only line"], 0], "expect": {"only": 1}}]},
prompt:`Write <code>function groupCount(lines, field)</code> returning an object mapping each distinct value of the given space-separated field (zero-based) to the number of lines carrying it. This is <code>awk \x27{c[$5]++} END{...}\x27</code> (the associative-array group-by) in the language the engine can execute.`,
starter:`function groupCount(lines, field) {\n  return {};\n}`,
solution:`function groupCount(lines, field) {\n  const out = {};\n  for (const line of lines) {\n    const key = line.split(" ")[field];\n    out[key] = (out[key] || 0) + 1;   // first sighting starts at 0\n  }\n  return out;\n}`,
tests:[{d:'a table accumulates the counts',re:'\\{\\s*\\}|Object\\.create|new Map'},{d:'each line is split into fields',re:'split'},{d:'the selected field is the key',re:'\\[field\\]'},{d:'an unseen key starts at zero',re:'\\|\\|\\s*0|\\?\\?\\s*0|\\+\\+'}],
behavior:`Four cases run. The first-sighting guard is what awk gives you for free: an unset awk variable is already 0, so c[$5]++ needs no initialization, while in JavaScript out[key] is undefined and undefined + 1 is NaN. That is the whole difference between the two languages for this pattern, and it is why the awk one-liner is one line. The empty-input case checks you return an empty table rather than undefined: a group-by over no data has a correct answer, and it is not an error.`,
hints:['Build up a plain object keyed by the field value.','undefined + 1 is NaN; start unseen keys at 0 explicitly.','One pass over the lines is enough; no sorting is needed to count.']}]},

{id:'rpl5',title:'jq: structured logs, where modern services actually live',body:`
<p>Every tool so far treats a log line as text and re-derives its structure with a regex. Modern services skip that: they emit <b>one JSON object per line</b>, so the structure is already there: as JS Dojo's structured-logging lesson puts it, log to stdout, one object per line, and let the platform collect it. The cost of that decision is that <code>awk '{print $5}'</code> becomes meaningless: fields have names, not positions, they may be absent, and a message can contain a comma, a quote or a newline without breaking anything. <b><code>jq</code> is awk for JSON</b>: a filter language over structured values.</p>
<div class="codeSample">{"ts":"2026-08-11T09:36:36Z","level":"error","route":"/api/checkout","status":500,"dur_ms":73,"trace":"2c1eea"}</div>
<p>Four ideas cover most real use.</p>
<ul>
<li><b>Paths select.</b> <code>jq '.route'</code> pulls one field, <code>.user.id</code> reaches into nesting, <code>.[]</code> iterates an array. <code>-r</code> prints strings <i>raw</i>: without it every value comes back with quotes around it, which then poison your <code>sort | uniq -c</code>.</li>
<li><b><code>select()</code> filters</b>, and it is the <code>WHERE</code> clause: <code>select(.status &gt;= 500)</code>, <code>select(.level=="error" and .dur_ms &gt; 60)</code>. Comparisons are typed: <code>.status &gt;= 500</code> is a number comparison, not a string one, which is exactly the class of bug the grep lesson spent its time on.</li>
<li><b>Output shaping.</b> <code>[.ts, .route, .dur_ms] | @tsv</code> emits tab-separated columns, the bridge back to <code>awk</code>, <code>sort</code> and the rest of the pipeline. <code>@csv</code> quotes properly, <code>-c</code> prints one compact object per line, <code>del(.trace, .host)</code> drops noise before you paste a line into a ticket.</li>
<li><b>Aggregation with <code>-s</code>.</b> By default jq processes one object at a time; <code>-s</code> ("slurp") reads them all into one array so you can <code>group_by</code>, <code>map</code>, <code>add</code>, <code>length</code>, <code>sort_by</code>. That is where jq becomes awk's associative arrays, at the cost of holding the file in memory, so filter <i>before</i> you slurp.</li>
</ul>
<div class="codeSample">jq -r 'select(.status&gt;=500) | .route' app.json.log | sort | uniq -c | sort -rn
jq -r 'select(.dur_ms &gt; 500) | [.ts, .route, .dur_ms] | @tsv' app.json.log
jq -s 'group_by(.route) | map({route:.[0].route, n:length, avg:((map(.dur_ms)|add)/length)})' app.json.log
jq --arg r /api/users -r 'select(.route==$r) | .dur_ms' app.json.log     # values from the shell, safely
jq -r '.user.id // "anonymous"' app.json.log                             # default for a missing field</div>
<p>Two survival details. <b><code>//</code> supplies a default</b> when a field is missing or null (<code>.user.id // "anonymous"</code>), because real logs are ragged and a missing key otherwise yields <code>null</code> that spreads through the rest of your expression. And <b><code>--arg</code> passes shell values in as data</b>, never by string-splicing them into the program, for the same reason <code>awk -v</code> and SQL parameters exist.</p>
<p><b>The real limits.</b> One malformed line aborts the run with <code>parse error</code>, so mixed text-and-JSON logs need <code>grep '^{'</code> in front, or jq's <code>--seq</code>/<code>-R 'fromjson?'</code> to skip the wreckage. <code>-s</code> is not streaming. And the field names are a contract nobody enforces: rename <code>dur_ms</code> to <code>duration_ms</code> in a service and every dashboard and pipeline that read it silently returns <code>null</code>, the structured-logging equivalent of a schema migration, which is why the field list belongs in a review checklist.</p>`,
docs:[['jq manual','https://jqlang.github.io/jq/manual/'],['jq play (try expressions in the browser)','https://jqplay.org/'],['JSON Lines (one object per line)','https://jsonlines.org/']],
exs:[{title:'Paths and raw output',lang:'shell',diff:'easy',
prompt:`The file <code>app.json.log</code> holds one JSON object per line with keys <code>ts, level, svc, host, method, route, status, dur_ms, trace</code>. One command per numbered line: (1) print the <code>route</code> of every line, (2) print it <b>without surrounding quotes</b>: add the raw-output flag, (3) print the whole object compactly, one per line (the compact flag), (4) print the nested value <code>.user.id</code>, falling back to the string <code>anonymous</code> when it is missing: use the alternative operator <code>//</code>, (5) print the key names of the first object using <code>keys_unsorted</code>: pipe through <code>head -1</code>, (6) drop the <code>trace</code> and <code>host</code> keys from every object, keeping compact output: use <code>del(.trace, .host)</code>.`,
starter:`1.
2.
3.
4.
5.
6.
`,
solution:`1. jq '.route' app.json.log
2. jq -r '.route' app.json.log
3. jq -c '.' app.json.log
4. jq -r '.user.id // "anonymous"' app.json.log
5. jq -r 'keys_unsorted' app.json.log | head -1
6. jq -c 'del(.trace, .host)' app.json.log
`,
tests:[{d:'A path expression selects a field',re:'1\\.\\s*jq\\s+([\'"])\\.route\\1\\s+app\\.json\\.log',flags:''},{d:'-r strips the JSON quotes',re:'2\\.\\s*jq\\s+-r\\s+([\'"])\\.route\\1',flags:''},{d:'-c prints one compact object per line',re:'3\\.\\s*jq\\s+-c\\s+([\'"])\\.\\1',flags:''},{d:'// supplies a default for a missing field',re:'4\\.\\s*jq\\s+-r\\s+([\'"])\\.user\\.id // "anonymous"\\1',flags:''},{d:'keys_unsorted shows the field names as written',re:'5\\.[^\\n]*keys_unsorted',flags:''},{d:'del removes keys before sharing a line',re:'6\\.\\s*jq\\s+-c\\s+([\'"])del\\(\\.trace, \\.host\\)\\1',flags:''}],
behavior:`1. Output is "/api/search" WITH quotes: valid JSON strings, and useless as pipeline input. 2. -r gives /api/search, which sort | uniq -c can actually count. Forgetting -r is the single most common jq mistake, and it fails by producing plausible-looking output with quote marks glued to every value. 3. -c is what you want when piping to another tool or grepping; the default pretty-print is for humans. 4. Missing keys yield null, and null propagates silently through the rest of the expression; // is the guard. Real logs are ragged: a field present on 95% of lines is normal. 5. keys_unsorted preserves the order the service wrote them (keys would sort alphabetically), which is how you check a field-name contract quickly. 6. del is the polite way to paste a log line into a ticket without leaking a trace id or an internal hostname.`,
hints:['Without -r you get JSON strings, quotes included: fine for jq, wrong for the next stage of a pipeline.','// is jq\'s "or else" for null and missing values.','del takes the paths to remove, comma-separated.']},

{title:'select is the WHERE clause',lang:'shell',diff:'easy',
prompt:`One command per numbered line on <code>app.json.log</code>: (1) print the full objects whose <code>status</code> is 500 or more, compactly, (2) print just the <code>route</code> of those, raw, (3) print the <code>trace</code> of lines where <code>level</code> is <code>"error"</code> <b>and</b> <code>dur_ms</code> is over 60: one <code>select</code> with <code>and</code>, (4) print the <code>ts</code> of every request slower than 900ms, (5) rank the 5xx responses by route: take answer (2) and add <code>sort | uniq -c | sort -rn</code>, (6) pass the route in from the shell instead of hard-coding it: use <code>--arg r /api/users</code> and compare <code>.route==$r</code>, printing <code>dur_ms</code>.`,
starter:`1.
2.
3.
4.
5.
6.
`,
solution:`1. jq -c 'select(.status >= 500)' app.json.log
2. jq -r 'select(.status >= 500) | .route' app.json.log
3. jq -r 'select(.level=="error" and .dur_ms > 60) | .trace' app.json.log
4. jq -r 'select(.dur_ms > 900) | .ts' app.json.log
5. jq -r 'select(.status >= 500) | .route' app.json.log | sort | uniq -c | sort -rn
6. jq --arg r /api/users -r 'select(.route==$r) | .dur_ms' app.json.log
`,
tests:[{d:'select filters whole objects',re:'1\\.\\s*jq\\s+-c\\s+([\'"])select\\(\\.status >= 500\\)\\1',flags:''},{d:'Pipe inside jq narrows to one field',re:'2\\.\\s*jq\\s+-r\\s+([\'"])select\\(\\.status >= 500\\) \\| \\.route\\1',flags:''},{d:'Two conditions joined with and',re:'3\\.[^\\n]*select\\(\\.level=="error" and \\.dur_ms > 60\\) \\| \\.trace',flags:''},{d:'Numeric comparison on a typed field',re:'4\\.[^\\n]*select\\(\\.dur_ms > 900\\) \\| \\.ts',flags:''},{d:'The counting idiom works unchanged on jq output',re:'5\\.[^\\n]*\\|\\s*sort\\s*\\|\\s*uniq\\s+-c\\s*\\|\\s*sort\\s+-rn',flags:'i'},{d:'--arg injects a shell value as data',re:'6\\.\\s*jq\\s+--arg\\s+r\\s+/api/users\\s+-r\\s+([\'"])select\\(\\.route==\\$r\\)',flags:''}],
behavior:`1. 32 objects. The comparison is numeric because status is a JSON number: no risk of matching a 500 inside another field, which took a whole lesson to get right in grep. 2. The | inside the jq program is jq's own pipe: filter, then project. 3. "and" is spelled out, not &&; jq is not C. 4. Three lines on the sample, all /api/checkout, all after 14:00: the outage, visible in one expression. 5. 11 checkout, 9 users, 7 search, 5 orders. jq's -r output feeds the same counting idiom as grep -o did; the pipeline vocabulary transfers unchanged. 6. --arg binds $r as a STRING value. Splicing the shell variable into the program text instead would let a value containing a quote change the program, the same injection shape as awk -v and SQL parameters.`,
hints:['select() keeps the whole object; add "| .field" to project one value out of it.','jq spells the logical operators "and", "or", "not".','--arg name value defines $name inside the program, as data rather than as code.']},

{title:'Shape output for the rest of the pipeline',lang:'shell',diff:'medium',
prompt:`jq is a good citizen: it can hand columns to <code>awk</code> and <code>sort</code>. One command per numbered line: (1) print <code>ts</code>, <code>route</code> and <code>dur_ms</code> as tab-separated columns: build an array and pipe it to <code>@tsv</code>, with <code>-r</code>, (2) do the same as proper CSV with <code>@csv</code>, (3) print those columns only for requests over 500ms, (4) take answer (3) and pipe into <code>awk -F'\\t' '{print $2}'</code> to keep only the route, (5) print the durations of <code>/api/checkout</code> and find its three slowest values by piping to <code>sort -n | tail -3</code>, (6) name what <code>@tsv</code> does to a value containing a tab or newline, in one word: it ____ it (escapes / deletes / keeps): answer <code>escapes</code>.`,
starter:`1.
2.
3.
4.
5.
6.
`,
solution:`1. jq -r '[.ts, .route, .dur_ms] | @tsv' app.json.log
2. jq -r '[.ts, .route, .dur_ms] | @csv' app.json.log
3. jq -r 'select(.dur_ms > 500) | [.ts, .route, .dur_ms] | @tsv' app.json.log
4. jq -r 'select(.dur_ms > 500) | [.ts, .route, .dur_ms] | @tsv' app.json.log | awk -F'\\t' '{print $2}'
5. jq -r 'select(.route=="/api/checkout") | .dur_ms' app.json.log | sort -n | tail -3
6. escapes
`,
tests:[{d:'@tsv emits tab-separated columns',re:'1\\.\\s*jq\\s+-r\\s+([\'"])\\[\\.ts, \\.route, \\.dur_ms\\] \\| @tsv\\1',flags:''},{d:'@csv quotes fields properly',re:'2\\.[^\\n]*\\| @csv',flags:''},{d:'Filter first, then shape',re:'3\\.[^\\n]*select\\(\\.dur_ms > 500\\) \\| \\[\\.ts, \\.route, \\.dur_ms\\] \\| @tsv',flags:''},{d:'awk -F tab reads the columns back',re:'4\\.[^\\n]*awk\\s+-F([\'"])\\\\t\\1\\s+([\'"])\\{print \\$2\\}\\2',flags:''},{d:'Raw values sort numerically',re:'5\\.[^\\n]*select\\(\\.route=="/api/checkout"\\) \\| \\.dur_ms[^\\n]*sort -n \\| tail -n?\\s?3',flags:''},{d:'@tsv escapes embedded delimiters',re:'6\\.\\s*escape',flags:'i'}],
behavior:`1. Three columns per line, tabs between them: the format every downstream Unix tool expects. 2. @csv quotes strings and escapes embedded quotes, so the output survives a spreadsheet; @tsv is friendlier to awk. 3. Filtering inside jq before shaping keeps the data small; three lines here, all checkout. 4. -F'\\t' tells awk the columns are tab-separated, which matters the moment a value contains a space, the reason to emit tabs rather than spaces in the first place. 5. 973, 975, 1075: the tail of checkout's distribution, and the evidence the capstone will quantify. 6. It escapes them (\\t and \\n become escape sequences), which is precisely why @tsv is safe and "join with a space" is not. A log message containing a tab would otherwise silently add a column and shift every field after it.`,
hints:['Build an array of the values you want, then pipe it to @tsv or @csv inside the jq program.','Tell awk the separator is a tab with -F\'\\\\t\' or the split reverts to whitespace.','Filter before shaping: less data through every later stage.']},

{title:'Aggregate with slurp',lang:'shell',diff:'medium',
prompt:`<code>-s</code> reads every object into one array so jq can aggregate. One command per numbered line: (1) print the mean of <code>dur_ms</code> across the whole file: slurp, then <code>map(.dur_ms) | add / length</code>, (2) count the objects: slurp and use <code>length</code>, (3) group by route and print, for each group, an object with <code>route</code>, <code>n</code> (the group's <code>length</code>) and <code>avg</code>: use <code>group_by(.route) | map({route:.[0].route, n:length, avg:((map(.dur_ms)|add)/length)})</code>, (4) sort those groups by <code>avg</code>, descending, by appending <code>| sort_by(.avg) | reverse</code>, (5) restrict (3) to requests after the deploy by inserting <code>map(select(.ts &gt;= "2026-08-11T14:00:00Z")) |</code> after the slurp, (6) name the cost of <code>-s</code> in one word: the whole file is held in ____ (one word).`,
starter:`1.
2.
3.
4.
5.
6.
`,
solution:`1. jq -s 'map(.dur_ms) | add / length' app.json.log
2. jq -s 'length' app.json.log
3. jq -s 'group_by(.route) | map({route:.[0].route, n:length, avg:((map(.dur_ms)|add)/length)})' app.json.log
4. jq -s 'group_by(.route) | map({route:.[0].route, n:length, avg:((map(.dur_ms)|add)/length)}) | sort_by(.avg) | reverse' app.json.log
5. jq -s 'map(select(.ts >= "2026-08-11T14:00:00Z")) | group_by(.route) | map({route:.[0].route, n:length, avg:((map(.dur_ms)|add)/length)})' app.json.log
6. memory
`,
tests:[{d:'-s turns the stream into one array',re:'1\\.\\s*jq\\s+-s\\s+([\'"])map\\(\\.dur_ms\\) \\| add / length\\1',flags:''},{d:'length counts the slurped array',re:'2\\.\\s*jq\\s+-s\\s+([\'"])length\\1',flags:''},{d:'group_by plus map is jq\'s GROUP BY',re:'3\\.[^\\n]*group_by\\(\\.route\\) \\| map\\(\\{route:\\.\\[0\\]\\.route, n:length, avg:\\(\\(map\\(\\.dur_ms\\)\\|add\\)/length\\)\\}\\)',flags:''},{d:'sort_by then reverse ranks the groups',re:'4\\.[^\\n]*\\| sort_by\\(\\.avg\\) \\| reverse',flags:''},{d:'Filtering before grouping keeps the numbers right',re:'5\\.[^\\n]*map\\(select\\(\\.ts >= "2026-08-11T14:00:00Z"\\)\\) \\|[^\\n]*group_by',flags:''},{d:'Slurping costs memory',re:'6\\.\\s*memory',flags:'i'}],
behavior:`1. 77.88ms: the same number awk produced, computed the same way, on data that no longer needs a regex to read. 2. 990. 3. Four groups; checkout's avg is 76.29, orders 75.3, search 127.7, users 25.2: again, the average says nothing is wrong. 4. sort_by is ascending only, so ranking descending means sort_by then reverse; there is no sort_by -r. 5. Filtering inside the slurped array is how you compare two time windows in one command, and doing the select BEFORE group_by is what keeps the groups meaningful. 6. Memory. -s materializes the entire input, so on a multi-gigabyte log you filter with select first (streaming, one object at a time) and slurp only what survives. This is the one place jq stops being a streaming filter.`,
hints:['Without -s, jq sees one object at a time and cannot count or group anything.','group_by yields an array of arrays; map over it to turn each group into a summary object.','sort_by only ascends; reverse is how you rank.']},

{title:'Ragged data and broken lines',lang:'shell',diff:'hard',
prompt:`Production JSON is not clean. One answer per numbered line: (1) a line of plain text in the middle of a JSON log makes jq exit with a ____ error (one word), (2) keep only the lines that look like JSON before jq sees them, using <code>grep</code> with an anchored pattern for a leading brace: write the command <code>grep '^{' app.json.log</code> piped into <code>jq -c .</code>, (3) print <code>.user.id</code> but never fail on objects that have no <code>user</code> key: give the default <code>"anonymous"</code>, (4) a service renames <code>dur_ms</code> to <code>duration_ms</code>; what does <code>.dur_ms</code> now return for every line (one word), (5) the flag that passes a shell value into jq as data rather than as program text (write it), (6) the rule for large files: <code>select</code> before you ____ (one word, the flag's nickname).`,
starter:`1.
2.
3.
4.
5.
6.
`,
solution:`1. parse
2. grep '^{' app.json.log | jq -c .
3. jq -r '.user.id // "anonymous"' app.json.log
4. null
5. --arg
6. slurp
`,
tests:[{d:'A non-JSON line causes a parse error',re:'1\\.\\s*parse',flags:'i'},{d:'Anchored grep guards the jq stage',re:'2\\.\\s*grep\\s+([\'"])\\^\\{\\1\\s+app\\.json\\.log\\s*\\|\\s*jq\\s+-c\\s+\\.',flags:''},{d:'// defaults a missing nested field',re:'3\\.[^\\n]*\\.user\\.id // "anonymous"',flags:''},{d:'A renamed field silently yields null',re:'4\\.\\s*null',flags:'i'},{d:'--arg passes data, not code',re:'5\\.\\s*--arg',flags:''},{d:'Filter before slurping',re:'6\\.\\s*slurp',flags:'i'}],
behavior:`1. A parse error, and it aborts the whole run; jq is strict by design, so one stray startup banner or stack trace in the file kills a pipeline that worked yesterday. 2. grep '^{' is the pragmatic guard: cheap, streaming, and it keeps the malformed lines out. (jq's own -R with fromjson? can skip them instead, at more typing.) 3. Without //, a missing user key gives null, and null then flows into whatever you do next: string concatenation, comparisons, a group_by bucket named null. 4. null, on every line, silently. No error, no warning: your dashboard shows zero and your alert never fires. Log field names are an interface, and renaming one is a breaking change that no compiler will catch, which is why they belong in code review and in a schema, and why the JS Dojo lesson insists on a fixed set of fields. 5. --arg (and --argjson for non-string values). 6. Slurp. select streams one object at a time; -s materializes everything, so filter first and slurp only the survivors.`,
hints:['Question 1 and 2 are the same problem: jq trusts its input completely.','Question 4 is the one that bites in production, and it produces no error at all.','The last two are the same discipline as awk: values in as data, and do not load what you can filter out.']},

{title:'p99 per route, in jq alone',lang:'shell',diff:'hard',
prompt:`The capstone calculation, done without leaving jq. One answer per numbered line: (1) print the sorted durations for <code>/api/checkout</code>: slurp, <code>map(select(.route=="/api/checkout") | .dur_ms) | sort</code>, (2) take the p99 of that list by nearest rank: append <code>| .[(length*0.99|ceil)-1]</code>, (3) explain the <code>-1</code> in one word: jq arrays are indexed from ____ (a number), (4) do it per route: slurp, <code>group_by(.route)</code>, then <code>map({route:.[0].route, n:length, p99:(map(.dur_ms)|sort|.[(length*0.99|ceil)-1])})</code>, (5) restrict (4) to after the deploy by inserting <code>map(select(.ts &gt;= "2026-08-11T14:00:00Z")) |</code> before <code>group_by</code>, (6) the jq builtin that rounds a fractional rank up (one word).`,
starter:`1.
2.
3.
4.
5.
6.
`,
solution:`1. jq -s 'map(select(.route=="/api/checkout") | .dur_ms) | sort' app.json.log
2. jq -s 'map(select(.route=="/api/checkout") | .dur_ms) | sort | .[(length*0.99|ceil)-1]' app.json.log
3. 0
4. jq -s 'group_by(.route) | map({route:.[0].route, n:length, p99:(map(.dur_ms)|sort|.[(length*0.99|ceil)-1])})' app.json.log
5. jq -s 'map(select(.ts >= "2026-08-11T14:00:00Z")) | group_by(.route) | map({route:.[0].route, n:length, p99:(map(.dur_ms)|sort|.[(length*0.99|ceil)-1])})' app.json.log
6. ceil
`,
tests:[{d:'Project and sort one route\'s durations',re:'1\\.[^\\n]*map\\(select\\(\\.route=="/api/checkout"\\) \\| \\.dur_ms\\) \\| sort',flags:''},{d:'Nearest-rank index into the sorted array',re:'2\\.[^\\n]*\\| \\.\\[\\(length\\*0\\.99\\|ceil\\)-1\\]',flags:''},{d:'jq arrays are zero-indexed',re:'3\\.\\s*0\\s*$',flags:'m'},{d:'group_by plus a p99 per group',re:'4\\.[^\\n]*group_by\\(\\.route\\) \\| map\\(\\{route:\\.\\[0\\]\\.route, n:length, p99:\\(map\\(\\.dur_ms\\)\\|sort\\|\\.\\[\\(length\\*0\\.99\\|ceil\\)-1\\]\\)\\}\\)',flags:''},{d:'Window applied before grouping',re:'5\\.[^\\n]*map\\(select\\(\\.ts >= "2026-08-11T14:00:00Z"\\)\\) \\| group_by',flags:''},{d:'ceil rounds the rank up',re:'6\\.\\s*ceil',flags:'i'}],
behavior:`1. 249 numbers, ascending, ending 973 975 1075. 2. 973 for the whole file. 3. Zero, so the 134th value sits at index 133, and forgetting the -1 gives you the value one position too high (or an index error at the very end). Note this differs from awk, where split() fills a 1-based array: the same calculation, two different offsets, which is exactly the kind of detail to check rather than remember. 4. Four groups; checkout 973 against 119, 200 and 40. 5. Restricted to after 14:00: checkout n=134 p99=975. Run it with < instead and checkout reads 95: the same 10x regression the awk pipeline found, computed by a completely different implementation. Two independent methods agreeing is the cheapest confidence you can buy before you tell a team their service is broken. 6. ceil, because nearest rank rounds up: the p99 is the smallest observed value that at least 99% of requests came in at or under.`,
hints:['Sort first, then index: a percentile is a position in a sorted list.','jq indexes from 0; awk\'s split() indexes from 1. The -1 is that difference.','If you get an answer that looks like a typical request rather than a slow one, check that the select ran before the group_by.']}]},

{id:'rpl6',title:'Capstone: which endpoint got worse after Tuesday\'s deploy',body:`
<p>The page arrives at 15:40 on Tuesday: <i>"checkout feels slow since the deploy."</i> You have <code>app.log</code>: 990 lines, one request each, and a deploy that went out at <b>14:00</b>. No dashboard, no tracing UI, no time to build one. The question is precise, and so is the answer you need: <b>which route's p99 latency got worse after 14:00, and by how much?</b></p>
<p><b>Step 1, do not start with the average.</b> The previous lesson already showed why: checkout's mean after the deploy is 86.1ms against 76.0 for orders: up a third on 134 samples, which reads as noise. If you compute means you will close the incident and go back to bed while checkout keeps timing out for one user in thirty. <b>A mean is a claim about the typical request; an outage is a claim about the tail.</b> You want a percentile.</p>
<p><b>Step 2, build the pipeline one stage at a time, reading the output after each.</b> The transformation, in English: <i>keep the lines after 14:00, reduce each to route and duration, sort by route then by duration, and for each route take the value 99% of the way up its list.</i></p>
<div class="codeSample">awk '$1 &gt;= "2026-08-11T14:00:00Z" {print $5, $7+0}' app.log \\
  | sort -k1,1 -k2,2n \\
  | awk '{v[$1]=v[$1]" "$2; n[$1]++}
         END {for (r in n) {split(v[r],a," "); i=int((n[r]*99+99)/100);
                            printf "%-16s n=%-4d p99=%sms\\n", r, n[r], a[i]}}' \\
  | sort</div>
<p>Run it for the window <b>before</b> 14:00 and then for the window after, and the answer is not ambiguous:</p>
<div class="codeSample">BEFORE 14:00                        AFTER 14:00
/api/checkout    n=115  p99=95ms    /api/checkout    n=134  p99=975ms   &lt;- 10x
/api/orders      n=118  p99=119ms   /api/orders      n=139  p99=119ms
/api/search      n=112  p99=200ms   /api/search      n=147  p99=198ms
/api/users       n=105  p99=40ms    /api/users       n=120  p99=40ms</div>
<p><b>Step 3, read what the numbers say, and what they do not.</b> One route regressed, and only in the tail: checkout's <i>median</i> after the deploy is 67ms, entirely healthy. So roughly 1–3% of checkout requests now take about a second while the rest are unaffected: the signature of a dependency that is slow on a subset of calls (a cold cache, one bad shard, an added call on a branch that only some requests take), not of a service that is uniformly slower. That is a precise, falsifiable claim you can hand to the team that owns checkout, and it took four processes and no infrastructure.</p>
<p><b>Why each stage is the way it is.</b> <code>$1 &gt;= "2026-08-11T14:00:00Z"</code> is a <i>string</i> comparison, and it is correct because ISO-8601 was designed so lexical order matches chronological order. <code>$7+0</code> coerces <code>"87ms"</code> to 87. <code>sort -k1,1 -k2,2n</code> sorts by route, then by duration numerically, so each route's durations arrive in ascending order and the final awk can simply index into them. The nearest-rank index is <code>int((n*99+99)/100)</code>, which is <code>ceil(0.99n)</code> in integer arithmetic. And the whole thing streams: nothing but the durations for the distinct routes is ever in memory.</p>
<p><b>What to do with it now.</b> Two habits are worth keeping from this stream. First, <b>build pipelines incrementally</b>: run stage one, look, add stage two, look again; a pipeline written in one go and debugged as a unit is how you get a confident wrong answer. Second, <b>when the same question recurs, stop reaching for the pipeline</b>: a one-off is what the command line is for, and the third time you compute p99 by hand is the day to ask for latency histograms and per-route percentiles in the metrics stack. The command line is the tool that answers the question nobody anticipated, not a substitute for the instrumentation you should have.</p>`,
docs:[['sort, keys and numeric ordering','https://www.gnu.org/software/coreutils/manual/html_node/sort-invocation.html'],['Latency percentiles, and why averages mislead','https://www.brendangregg.com/blog/2018-02-09/kpti-kaiser-meltdown-performance.html'],['Google SRE Workbook, SLOs on percentiles','https://sre.google/workbook/implementing-slos/']],
exs:[{title:'Window the data',lang:'shell',diff:'easy',
prompt:`First isolate the two windows. One command per numbered line on <code>app.log</code> (timestamp field 1, route 5, status 6, duration 7): (1) print every line from the deploy onward, comparing field 1 with <code>&gt;=</code> to the string <code>"2026-08-11T14:00:00Z"</code>, (2) print every line before it, (3) count the lines after the deploy, using the pattern plus <code>END {print NR}</code>. Careful: that counts <b>all</b> lines, so instead increment a variable in the action and print it in <code>END</code>, (4) print route and numeric duration only, for lines after the deploy, (5) count 5xx responses after the deploy: add <code>$6&gt;=500</code> to the pattern with <code>&amp;&amp;</code>, (6) why a plain string comparison on the timestamp is correct here: ISO-8601 orders ____ the same way it orders chronologically (one word).`,
starter:`1.
2.
3.
4.
5.
6.
`,
solution:`1. awk '$1 >= "2026-08-11T14:00:00Z"' app.log
2. awk '$1 < "2026-08-11T14:00:00Z"' app.log
3. awk '$1 >= "2026-08-11T14:00:00Z" {n++} END {print n}' app.log
4. awk '$1 >= "2026-08-11T14:00:00Z" {print $5, $7+0}' app.log
5. awk '$1 >= "2026-08-11T14:00:00Z" && $6>=500 {n++} END {print n+0}' app.log
6. lexically
`,
tests:[{d:'A timestamp comparison selects the window',re:'1\\.\\s*awk\\s+([\'"])\\$1 >= "2026-08-11T14:00:00Z"\\1',flags:''},{d:'The complementary window uses <',re:'2\\.\\s*awk\\s+([\'"])\\$1 < "2026-08-11T14:00:00Z"\\1',flags:''},{d:'Counting in the action, not with NR',re:'3\\.[^\\n]*\\{n\\+\\+\\} END \\{print n\\}',flags:''},{d:'Project route and coerced duration',re:'4\\.[^\\n]*\\{print \\$5, \\$7\\+0\\}',flags:''},{d:'Two conditions narrow the window further',re:'5\\.[^\\n]*&& \\$6>=500 \\{n\\+\\+\\}',flags:''},{d:'ISO-8601 sorts lexically as it does chronologically',re:'6\\.\\s*lexical|6\\.\\s*alphabetical|6\\.\\s*text',flags:'i'}],
behavior:`1-2. 540 lines after, 450 before, on the sample log. 3. END {print NR} alone would print 990: NR counts every record read, not the ones your pattern matched. This is the most common miscount in awk, and it fails in the direction that looks plausible. 4. Two columns, ready for sorting: the route as a key, the duration as a number. 5. The counts are small either side; the incident is a latency regression, not an error-rate one, which is itself worth establishing early. 6. Lexically. Fixed-width, zero-padded, most-significant-first: the reason no date parsing is needed anywhere in this stream, and a good argument for ISO-8601 in your own log format.`,
hints:['A pattern with no action prints the line; a pattern with {n++} counts it.','NR is every record read, including the ones your pattern rejected.','ISO-8601 is designed so that string order equals time order: no parsing required.']},

{title:'Percentile by hand',lang:'shell',diff:'medium',
prompt:`Now the ranking. One answer per numbered line: (1) print route and duration for the after-window, then sort by route and then by duration <b>numerically</b>: add <code>sort -k1,1 -k2,2n</code>, (2) the sort key syntax <code>-k2,2n</code> means: use field 2 through field 2, compared ____ (one word), (3) the p99 by nearest rank is the value at position <code>ceil(0.99 × n)</code>; write that in integer arithmetic as an awk expression using <code>int()</code>: <code>int((n*99+99)/100)</code>, (4) for n=134 requests, what index does that give (a number), (5) if you used <code>sort</code> without <code>-n</code> on the durations, what value would sort last, in one word: the one that is largest ____ (one word, as text/alphabetically), (6) the statistic you should <b>not</b> lead with when diagnosing a tail-latency regression (one word).`,
starter:`1.
2.
3.
4.
5.
6.
`,
solution:`1. awk '$1 >= "2026-08-11T14:00:00Z" {print $5, $7+0}' app.log | sort -k1,1 -k2,2n
2. numerically
3. int((n*99+99)/100)
4. 133
5. alphabetically
6. average
`,
tests:[{d:'Sorted by route, then numerically by duration',re:'1\\.[^\\n]*\\|\\s*sort\\s+-k1,1\\s+-k2,2n',flags:''},{d:'The n suffix on a key means numeric comparison',re:'2\\.\\s*numeric',flags:'i'},{d:'Nearest-rank index in integer arithmetic',re:'3\\.\\s*int\\(\\(n\\*99\\+99\\)/100\\)',flags:''},{d:'ceil(0.99 x 134) = 133',re:'4\\.\\s*133',flags:''},{d:'Text sort ranks alphabetically, not by size',re:'5\\.\\s*alphabetic|5\\.\\s*lexical|5\\.\\s*text',flags:'i'},{d:'Averages hide tail regressions',re:'6\\.\\s*average|6\\.\\s*mean',flags:'i'}],
behavior:`1. Each route's durations now arrive in ascending order, which is what lets the next stage take the p99 by index instead of implementing a sort in awk (portable awk has none). 2. Numerically. -k2,2n bounds the key to field 2 and compares it as a number; without the bound, sort uses "from field 2 to end of line" and the trailing text changes the order. 3-4. int((134*99+99)/100) = int(133.65) = 133: the 133rd of 134 sorted values, i.e. the smallest value that at least 99% of requests came in under. 5. Alphabetically: "99" sorts after "1075" as text, so a missing -n reports 99ms as your slowest request and everything downstream is confidently wrong. 6. The average: checkout's barely moved while its p99 went up tenfold. Lead with percentiles; quote the mean only to show that it is not where the problem is.`,
hints:['Two-part sort: group by the key you will aggregate on, then order within the group.','-k2,2n bounds the key to exactly field 2 and compares numerically; -k2n means "field 2 to end of line".','Nearest rank: round the position UP, and remember awk arrays from split() start at 1.']},

{title:'The full capstone pipeline',lang:'shell',diff:'hard',
prompt:`Assemble it. Write, as a single line, the pipeline that prints <b>p99 per route for requests after the deploy</b>: (1) <code>awk</code> selects <code>$1 &gt;= "2026-08-11T14:00:00Z"</code> and prints <code>$5, $7+0</code>; (2) <code>sort -k1,1 -k2,2n</code>; (3) a second <code>awk</code> that appends each duration to <code>v[$1]</code>, counts <code>n[$1]</code>, and in <code>END</code> splits the list with <code>split(v[r],a," ")</code>, computes <code>i=int((n[r]*99+99)/100)</code> and prints <code>r, n[r], a[i]</code>; (4) <code>sort</code>. Then answer: (5) which route regressed (write the path), (6) its p99 before and after, as <code>95 975</code> (two numbers separated by a space).`,
starter:`1.
2.
3.
4.
5.
6.
`,
solution:`1. awk '$1 >= "2026-08-11T14:00:00Z" {print $5, $7+0}' app.log
2. sort -k1,1 -k2,2n
3. awk '{v[$1]=v[$1]" "$2; n[$1]++} END {for (r in n) {split(v[r],a," "); i=int((n[r]*99+99)/100); print r, n[r], a[i]}}'
4. sort
5. /api/checkout
6. 95 975
`,
tests:[{d:'Stage 1 windows and projects',re:'1\\.\\s*awk\\s+([\'"])\\$1 >= "2026-08-11T14:00:00Z" \\{print \\$5, \\$7\\+0\\}\\1\\s+app\\.log',flags:''},{d:'Stage 2 sorts by route then duration numerically',re:'2\\.\\s*sort\\s+-k1,1\\s+-k2,2n',flags:''},{d:'Stage 3 accumulates per route and indexes the p99',re:'3\\.[^\\n]*v\\[\\$1\\]=v\\[\\$1\\]" "\\$2; n\\[\\$1\\]\\+\\+[^\\n]*split\\(v\\[r\\],a," "\\)[^\\n]*int\\(\\(n\\[r\\]\\*99\\+99\\)/100\\)',flags:''},{d:'Stage 4 gives stable output order',re:'4\\.\\s*sort',flags:''},{d:'The regressed route is /api/checkout',re:'5\\.\\s*/api/checkout',flags:''},{d:'p99 went from 95ms to 975ms',re:'6\\.\\s*95\\s+975',flags:''}],
behavior:`1. 486 lines, two columns. 2. Durations ascend within each route: the precondition the final stage depends on, and the reason a wrong sort produces a wrong percentile with no error. 3. v[r] accumulates a space-separated list, split() turns it into a 1-based array, and the nearest-rank index reads the p99 straight out. Memory is proportional to the data for the distinct routes, not to the file. 4. for-in order is unspecified, so the final sort is what makes two runs comparable side by side. 5-6. /api/checkout, 95ms to 975ms: a 10x tail regression, while its median moved 65ms to 67ms and its mean 64.8ms to 86.1ms. The finding to report is precise: not "checkout is slow" but "checkout's p99 went 95ms to 975ms after the 14:00 deploy, median steady at 67ms, so a small fraction of requests hit something new and slow".`,
hints:['Stage 3 is the group-by shape again: accumulate into an array keyed by route, then loop in END.','split() fills a 1-based array, so the nearest-rank index needs no offset.','If your p99 looks like a typical value rather than a tail value, check that stage 2 sorted numerically.']},

{title:'Interview: report the finding',lang:'text',diff:'hard',
prompt:`The last mile is communicating it. One answer per numbered line: (1) the statistic that showed the regression (one word; write <code>p99</code>), (2) the statistic that hid it (one word), (3) checkout's median was unchanged, so the slowdown affects a small ____ of requests (one word), (4) the shape that implicates: a dependency that is slow on ____ calls, not on all of them (one word: "some" / "all"), (5) the habit that keeps a long pipeline from fooling you: build it ____ , checking the output after each stage (one word), (6) when the same question comes up for the third time, the right answer stops being a pipeline and becomes ____ in the metrics stack (one word, the thing you ask for).`,
starter:`1.
2.
3.
4.
5.
6.
`,
solution:`1. p99
2. average
3. fraction
4. some
5. incrementally
6. percentiles
`,
tests:[{d:'Percentiles surfaced the regression',re:'1\\.\\s*p99|1\\.\\s*percentile',flags:'is'},{d:'The average hid it',re:'2\\.\\s*average|2\\.\\s*mean',flags:'is'},{d:'A small fraction of requests is affected',re:'3\\.\\s*fraction|3\\.\\s*percent|3\\.\\s*subset|3\\.\\s*proportion',flags:'is'},{d:'Slow on some calls, not all',re:'4\\.\\s*some',flags:'is'},{d:'Build pipelines incrementally',re:'5\\.\\s*incremental|5\\.\\s*stage',flags:'is'},{d:'Ask for percentiles in the metrics stack',re:'6\\.\\s*percentile|6\\.\\s*histogram',flags:'is'}],
behavior:`1-2. p99 versus the mean: 95ms to 975ms against 64.8ms to 86.1ms. Quoting both is stronger than quoting either: it tells the owning team the problem is real AND tells them why their dashboard looks fine. 3. A small fraction (3 of 134 requests, 2.2%), which is also why nobody noticed until a user complained. 4. Some calls: a uniform slowdown moves the median, and this one did not. That single observation rules out half the candidate causes before anyone opens the code. 5. Incrementally: each stage's output is a hypothesis you can check in one second, and a four-stage pipeline debugged only at the end is where confident wrong answers come from. 6. Percentiles (latency histograms) per route. The command line answered the question nobody anticipated; recurring questions deserve instrumentation, and asking for it is the engineering-manager half of this skill.`,
hints:['The first two answers are the two numbers you put in the incident update, in that order.','Question 4 turns on the median being unchanged: that is the evidence, and it excludes a whole class of causes.','The last answer is what you ask the owning team to add, so nobody has to run this pipeline a fourth time.']},
{title:'Nearest-rank p99, executed',lang:'js',diff:'hard',
run:{call:'p99',cases:[{"name": "one to a hundred: the 99th value", "args": [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100]], "expect": 99}, {"name": "a single sample is its own p99", "args": [[42]], "expect": 42}, {"name": "no samples has no p99", "args": [[]], "expect": null}, {"name": "unsorted input must be sorted first", "args": [[900, 10, 20, 30, 40]], "expect": 900}, {"name": "numeric order, not text order", "args": [[99, 1075, 300]], "expect": 1075}]},
prompt:`Write <code>function p99(values)</code> returning the 99th percentile by <b>nearest rank</b>: sort ascending and take the value at position <code>ceil(0.99 x n)</code>, one-based. Return <code>null</code> for an empty input. Do not modify the caller\x27s array.`,
starter:`function p99(values) {\n  return null;\n}`,
solution:`function p99(values) {\n  if (!values.length) return null;\n  const sorted = [...values].sort((a, b) => a - b);   // numeric, and a copy\n  const rank = Math.ceil(values.length * 0.99);       // one-based position\n  return sorted[rank - 1];\n}`,
tests:[{d:'an empty input returns null',re:'!values\\.length|length\\s*===\\s*0'},{d:'the input is copied before sorting',re:'\\[\\.\\.\\.|slice\\s*\\('},{d:'a numeric comparator is used',re:'a\\s*-\\s*b'},{d:'the rank is rounded up',re:'Math\\.ceil'},{d:'the one-based rank is converted to an index',re:'-\\s*1'}],
behavior:`Five cases execute, and they encode every mistake this calculation invites. The last case is the one that produces a confidently wrong answer in real pipelines: sort() without a comparator compares numbers as TEXT, so 1075 sorts before 99 and the reported p99 is smaller than most of your data. The unsorted case checks you sort at all rather than assuming the caller did. And ceil rather than round is what makes the definition nearest-rank: the p99 is the smallest observed value that at least 99% of samples came in at or under, so a fractional rank always rounds up.`,
hints:['Sort a COPY, numerically, ascending.','ceil(0.99 * n) is a one-based rank; arrays are zero-based.','Decide what an empty input means before you index into anything.']}]}
]});
