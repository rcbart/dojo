STREAMS.push({icon:'⌨️',title:'Working with User Input',blurb:'Scanner in depth, command-line arguments, validation that never trusts, an interactive REPL, and the security mindset for untrusted input.',lessons:[
{id:'inp1',title:'Scanner in depth: tokens, lines & the trap',body:`
<p>Programs earn their keep by reacting to input. On the console, input arrives through <code>System.in</code> — a raw byte stream — and <code>Scanner</code> is the standard tool that turns those bytes into values you can use.</p>
<p>The key to never being surprised by Scanner: it reads in two different modes, and mixing them is where everyone gets burned.</p>
<ul>
<li><b>Token mode</b> — <code>next()</code>, <code>nextInt()</code>, <code>nextDouble()</code>: skip whitespace, read ONE whitespace-delimited chunk, and <b>stop right after it</b> — before any newline.</li>
<li><b>Line mode</b> — <code>nextLine()</code>: read everything up to the newline and consume the newline.</li>
</ul>
<div class="codeSample" data-hl>Scanner sc = new Scanner(System.in);
System.out.print("Age: ");
int age = sc.nextInt();          // user types "36⏎" — reads 36, LEAVES the ⏎
System.out.print("Name: ");
String name = sc.nextLine();     // consumes that leftover ⏎ → name is ""  ← THE TRAP

// the fix: clear the dangling newline after token reads
int age2 = sc.nextInt();
sc.nextLine();                   // swallow the ⏎
String name2 = sc.nextLine();    // now actually waits for the name</div>
<p>The second essential habit: <b>ask before you read</b>. Every <code>nextInt()</code> on non-numeric input throws <code>InputMismatchException</code> — and the bad token <i>stays in the stream</i>, so a naive retry loops forever on the same garbage. The professional pattern pairs <code>hasNextInt()</code> with an explicit discard:</p>
<div class="codeSample" data-hl>while (!sc.hasNextInt()) {       // is the NEXT token an int?
    sc.next();                   // no — throw the bad token away
    System.out.print("Numbers only, try again: ");
}
int value = sc.nextInt();        // guaranteed to succeed</div>
<p>Design habit from the Fundamentals prompt exercise, worth repeating: methods that read input should <b>take the Scanner as a parameter</b> — one Scanner per program, passed around, never closed (closing it closes System.in for everyone), and testable by handing in <code>new Scanner("36\\nAda\\n")</code>.</p>`,
docs:[['Scanner — Javadoc','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Scanner.html'],['Scanning — Oracle tutorial','https://docs.oracle.com/javase/tutorial/essential/io/scanning.html']],
ex:{title:'Tame the Scanner',
prompt:`Write class <code>Input</code> with two static methods taking a <code>java.util.Scanner</code> parameter: (1) <code>int readInt(java.util.Scanner sc, String prompt)</code> — print the prompt with <code>System.out.print</code>, then loop <code>while (!sc.hasNextInt())</code> discarding the bad token with <code>sc.next()</code> and re-printing the prompt; finally return <code>sc.nextInt()</code>; (2) <code>String readName(java.util.Scanner sc, String prompt)</code> — print the prompt, call <code>sc.nextLine()</code> <b>once to clear any dangling newline</b>, then return the result of a second <code>sc.nextLine()</code> — the real line. Neither method may close the scanner.`,
starter:`import java.util.Scanner;

public class Input {

    static int readInt(Scanner sc, String prompt) {
        return 0;
    }

    static String readName(Scanner sc, String prompt) {
        return null;
    }
}`,
solution:`import java.util.Scanner;

public class Input {

    static int readInt(Scanner sc, String prompt) {
        System.out.print(prompt);
        while (!sc.hasNextInt()) {
            sc.next();
            System.out.print(prompt);
        }
        return sc.nextInt();
    }

    static String readName(Scanner sc, String prompt) {
        System.out.print(prompt);
        sc.nextLine();
        return sc.nextLine();
    }
}`,
tests:[{d:'readInt guards with hasNextInt before reading',re:'while\\s*\\(\\s*!\\s*sc\\.hasNextInt\\s*\\(\\s*\\)\\s*\\)'},{d:'Bad tokens discarded with sc.next() inside the loop',re:'while[\\s\\S]*?sc\\.next\\s*\\(\\s*\\)\\s*;'},{d:'Returns via nextInt only after the guard',re:'return\\s+sc\\.nextInt\\s*\\(\\s*\\)'},{d:'readName clears the dangling newline first (two nextLine calls)',re:'sc\\.nextLine\\s*\\(\\s*\\)\\s*;[\\s\\S]*?return\\s+sc\\.nextLine\\s*\\(\\s*\\)'},{d:'Scanner is a parameter, never constructed inside',re:'new\\s+Scanner\\s*\\(',not:true},{d:'Scanner never closed',re:'sc\\.close|\\.close\\s*\\(\\s*\\)',not:true}],
behavior:`1. readInt on input "abc x 42" prompts three times, discards abc and x, returns 42 — no exception, no infinite loop. 2. readName called right after a token read returns the actual typed line, not "" — the first nextLine ate the dangling newline. 3. Testable without a keyboard: readInt(new Scanner("7"), "n: ") == 7. 4. System.in stays open for the rest of the program because nobody closed the scanner.`,
hints:['The retry loop reads: while the next token is NOT an int, throw it away and re-prompt.','readName is the nextInt/nextLine trap distilled: the first nextLine() is a drain, the second is the read.','Constructing or closing a Scanner inside a helper is the bug — the caller owns it.']}},

{id:'inp2',title:'Command-line arguments & the environment',body:`
<p>Interactive prompts are one door; most real programs take input the non-interactive way — <b>arguments</b> handed over at launch. That's the <code>String[] args</code> you've been ignoring in every <code>main</code>:</p>
<div class="codeSample">java Convert report.csv --format json --verbose
                └────────────┴──────────────┴─ args = ["report.csv", "--format", "json", "--verbose"]</div>
<p>The shell splits on spaces (quotes keep phrases together: <code>"my file.csv"</code> arrives as one element). Conventions the whole ecosystem shares: bare values are <i>positional</i> arguments; <code>--name</code> introduces an option, usually consuming the next element as its value; boolean options (<code>--verbose</code>) stand alone. A hand-rolled parse is a loop with an index — real CLIs graduate to a library (picocli), but you should be able to write the loop:</p>
<div class="codeSample" data-hl>String file = null; String format = "text"; boolean verbose = false;
for (int i = 0; i &lt; args.length; i++) {
    switch (args[i]) {
        case "--format"  -&gt; format = args[++i];    // option consumes the NEXT element
        case "--verbose" -&gt; verbose = true;
        default          -&gt; file = args[i];        // positional
    }
}
if (file == null) {
    System.err.println("usage: convert &lt;file&gt; [--format json|text] [--verbose]");
    System.exit(2);                                 // non-zero = failure, scripts can react
}</div>
<p>Three professional touches in that snippet: complaints go to <b><code>System.err</code></b> (so piped stdout stays clean), a <b>usage line</b> tells the user what legal input looks like, and <b><code>System.exit</code> with a non-zero code</b> lets shells and CI detect the failure — 0 means success, anything else means "went wrong", by universal convention.</p>
<p>The third input door: <b>environment variables</b> — <code>System.getenv("API_KEY")</code> (null when unset — handle it). You met them as the 12-factor way to configure deployments; from the program's side they're just one more untyped string arriving from outside. Which is the running theme of this stream: <i>args, prompts, env vars — everything from outside is a String until you validate it into something better.</i></p>`,
docs:[['Command-line arguments — Oracle','https://docs.oracle.com/javase/tutorial/essential/environment/cmdLineArgs.html'],['Environment & system properties','https://docs.oracle.com/javase/tutorial/essential/environment/env.html'],['picocli — when you outgrow the loop','https://picocli.info/']],
ex:{title:'Parse the launch line',
prompt:`Write class <code>Args</code> with <code>static java.util.Map&lt;String, String&gt; parse(String[] args)</code> returning a HashMap describing the launch: loop with a classic indexed for; on <code>"--format"</code> put key <code>"format"</code> with the <b>next</b> element as value (increment i); on <code>"--verbose"</code> put <code>"verbose"</code> → <code>"true"</code>; any other element goes under key <code>"file"</code>. Before returning: if no <code>"file"</code> key was set, print <code>usage: convert &lt;file&gt;</code> to <b>System.err</b> and return an <b>empty immutable map</b> via <code>Map.of()</code>. Seed defaults first: <code>"format"</code> → <code>"text"</code>.`,
starter:`import java.util.HashMap;
import java.util.Map;

public class Args {

    static Map<String, String> parse(String[] args) {
        return null;
    }
}`,
solution:`import java.util.HashMap;
import java.util.Map;

public class Args {

    static Map<String, String> parse(String[] args) {
        Map<String, String> result = new HashMap<>();
        result.put("format", "text");
        for (int i = 0; i < args.length; i++) {
            switch (args[i]) {
                case "--format" -> result.put("format", args[++i]);
                case "--verbose" -> result.put("verbose", "true");
                default -> result.put("file", args[i]);
            }
        }
        if (!result.containsKey("file")) {
            System.err.println("usage: convert <file>");
            return Map.of();
        }
        return result;
    }
}`,
tests:[{d:'Default format seeded before parsing',re:'put\\s*\\(\\s*"format"\\s*,\\s*"text"\\s*\\)'},{d:'--format consumes the NEXT element (++i)',re:'case\\s+"--format"\\s*->\\s*\\w+\\.put\\s*\\(\\s*"format"\\s*,\\s*args\\s*\\[\\s*\\+\\+i\\s*\\]'},{d:'--verbose is a standalone boolean flag',re:'case\\s+"--verbose"\\s*->\\s*\\w+\\.put\\s*\\(\\s*"verbose"\\s*,\\s*"true"'},{d:'Positional argument lands under file',re:'default\\s*->\\s*\\w+\\.put\\s*\\(\\s*"file"'},{d:'Missing file: usage to System.err, not out',re:'System\\.err\\.println\\s*\\(\\s*"usage'},{d:'Failure returns the empty immutable map',re:'return\\s+Map\\.of\\s*\\(\\s*\\)'}],
behavior:`1. parse(["report.csv", "--format", "json", "--verbose"]) → {file=report.csv, format=json, verbose=true}. 2. parse(["data.csv"]) → format defaults to "text", no verbose key. 3. parse(["--verbose"]) → usage line on stderr, returns an empty Map.of() — callers check isEmpty() for failure. 4. The ++i inside the --format case is what makes an option consume its value; without it the value would be misread as the file.`,
hints:['Seed defaults into the map BEFORE the loop — parsing then overwrites them.','args[++i] increments first, then indexes: the option eats its value in one expression.','stderr for humans, stdout for data — mixing them breaks every pipe your tool is used in.']}},

{id:'inp3',title:'Validate everything: parse, don\'t trust',body:`
<p>Input has now arrived — as Strings, because input always arrives as Strings. The next discipline: <b>turn stringly-typed data into real types at the boundary, immediately, and reject garbage there</b> — never let a raw String wander into the middle of your program to explode later.</p>
<p>The toolbox, in order of preference:</p>
<ul>
<li><b>Parse to a type</b> — <code>Integer.parseInt</code>, <code>LocalDate.parse</code>, <code>new BigDecimal(s)</code>. Each throws on garbage — which is good news at the boundary: catch it <i>there</i> and answer the user <i>there</i>. The exception-handling stream taught you to catch <code>NumberFormatException</code> narrowly; this is where that pays off.</li>
<li><b>Return Optional for expected failure</b> — "the user typed junk" is not exceptional, it's Tuesday. A helper like <code>Optional&lt;Integer&gt; tryParse(String s)</code> makes the maybe-ness part of the signature, and callers write <code>tryParse(s).orElse(defaultValue)</code> instead of try/catch at every call site.</li>
<li><b>Check ranges and formats after parsing</b> — 9999 parses fine and is still not a valid age. Validation is parse + predicate: <code>age &gt;= 0 &amp;&amp; age &lt;= 130</code>; regex for shapes (<code>s.matches("[A-Za-z][A-Za-z0-9_]{2,15}")</code> for a username — anchored by default with matches).</li>
<li><b>Fail fast with clear messages</b> — <code>IllegalArgumentException("age must be 0-130, got " + age)</code> at the boundary beats a mystery NPE three layers deep. Say what was wrong AND what would have been right.</li>
</ul>
<div class="codeSample" data-hl>static Optional&lt;Integer&gt; tryParse(String s) {
    try {
        return Optional.of(Integer.parseInt(s.trim()));
    } catch (NumberFormatException e) {
        return Optional.empty();                 // junk in → empty out, no drama
    }
}

int port = tryParse(System.getenv("PORT") == null ? "" : System.getenv("PORT"))
               .filter(p -&gt; p &gt;= 1 &amp;&amp; p &lt;= 65535)   // parsed AND in range
               .orElse(8080);                          // sensible default</div>
<p>Note what that pipeline reads like: parse → constrain → default. That shape — every raw String funneled through one validating gate that produces either a good value or a clear outcome — is the entire lesson. Programs with one gate per input are debuggable; programs that sprinkle <code>parseInt</code> everywhere are haunted.</p>`,
docs:[['Optional — Javadoc','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Optional.html'],['Pattern/matches — Javadoc','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/regex/Pattern.html'],['Effective validation — dev.java','https://dev.java/learn/exceptions/']],
ex:{title:'One gate per input',
prompt:`Write class <code>Gate</code> with three static methods: (1) <code>java.util.Optional&lt;Integer&gt; tryParse(String s)</code> — trim, <code>Integer.parseInt</code> in a try, return <code>Optional.of</code>; catch <b>only</b> <code>NumberFormatException</code> returning <code>Optional.empty()</code>; a null s should also give empty (plain null check before the try); (2) <code>int port(String raw)</code> — run <code>tryParse(raw)</code>, <code>.filter</code> to the range 1..65535, <code>.orElse(8080)</code>; (3) <code>String username(String raw)</code> — throw <code>IllegalArgumentException</code> with message containing <code>"3-16"</code> unless <code>raw != null &amp;&amp; raw.matches("[A-Za-z][A-Za-z0-9_]{2,15}")</code>; return raw when valid.`,
starter:`import java.util.Optional;

public class Gate {

    static Optional<Integer> tryParse(String s) {
        return Optional.empty();
    }

    static int port(String raw) {
        return 0;
    }

    static String username(String raw) {
        return null;
    }
}`,
solution:`import java.util.Optional;

public class Gate {

    static Optional<Integer> tryParse(String s) {
        if (s == null) {
            return Optional.empty();
        }
        try {
            return Optional.of(Integer.parseInt(s.trim()));
        } catch (NumberFormatException e) {
            return Optional.empty();
        }
    }

    static int port(String raw) {
        return tryParse(raw)
            .filter(p -> p >= 1 && p <= 65535)
            .orElse(8080);
    }

    static String username(String raw) {
        if (raw == null || !raw.matches("[A-Za-z][A-Za-z0-9_]{2,15}")) {
            throw new IllegalArgumentException("username must be 3-16 chars, letter first");
        }
        return raw;
    }
}`,
tests:[{d:'Null handled with a plain check, not a catch',re:'if\\s*\\(\\s*s\\s*==\\s*null\\s*\\)[\\s\\S]*?Optional\\.empty'},{d:'Catches ONLY NumberFormatException',re:'catch\\s*\\(\\s*NumberFormatException\\s+\\w+\\s*\\)'},{d:'Broad Exception never caught',re:'catch\\s*\\(\\s*Exception\\b',not:true},{d:'port: parse then filter range then default',re:'tryParse\\s*\\(\\s*raw\\s*\\)[\\s\\S]*?filter\\s*\\(\\s*\\w+\\s*->\\s*\\w+\\s*>=\\s*1\\s*&&\\s*\\w+\\s*<=\\s*65535[\\s\\S]*?orElse\\s*\\(\\s*8080'},{d:'username validated with an anchored matches regex',re:'matches\\s*\\(\\s*"\\[A-Za-z\\]\\[A-Za-z0-9_\\]\\{2,15\\}"'},{d:'Rejection message says what WOULD be right',re:'IllegalArgumentException\\s*\\(\\s*"[^"]*3-16'}],
behavior:`1. tryParse(" 42 ") → Optional[42]; tryParse("junk") and tryParse(null) → Optional.empty — no exceptions escape. 2. port("8443") == 8443; port("99999") == 8080 (parsed but out of range); port(null) == 8080. 3. username("Ada_42") returns it; username("x") and username("9lives") throw IllegalArgumentException whose message teaches the rule. 4. The parse→filter→default pipeline in port is the reusable shape for every config value you will ever read.`,
hints:['null is a state you can check; NumberFormatException is an event you must catch — use each where it belongs.','Optional.filter turns "parsed" into "parsed AND valid" without an if.','matches() anchors the whole string — no ^ or $ needed; {2,15} plus the first letter gives 3-16 total.']}},

{id:'inp4',title:'The interactive loop: build a REPL',body:`
<p>Prompts, parsing, validation — now compose them into the classic interactive shape: the <b>REPL</b> (read, evaluate, print, loop). Every CLI tool, database shell, and game loop is this pattern:</p>
<div class="codeSample" data-hl>Scanner sc = new Scanner(System.in);
boolean running = true;
while (running) {
    System.out.print("&gt; ");
    if (!sc.hasNextLine()) break;          // input ended (Ctrl-D / piped file ran out)
    String line = sc.nextLine().trim();
    if (line.isEmpty()) continue;          // silently re-prompt on blank

    String[] parts = line.split("\\\\s+", 2);   // command + the rest
    String command = parts[0].toLowerCase();
    String arg = parts.length &gt; 1 ? parts[1] : "";

    switch (command) {
        case "add"  -&gt; { todos.add(arg); System.out.println("added: " + arg); }
        case "list" -&gt; todos.forEach(t -&gt; System.out.println("- " + t));
        case "quit" -&gt; running = false;
        default     -&gt; System.out.println("unknown command: " + command);
    }
}</div>
<p>The load-bearing details, each one a lesson from earlier in the stream applied: read <b>whole lines</b>, then split — token-mode reads would fight multi-word arguments; <code>split("\\\\s+", 2)</code> keeps everything after the command as ONE argument ("add buy milk" → add, "buy milk"); the <code>default</code> branch answers <i>every</i> unrecognized command — silence is the worst UX; <code>hasNextLine()</code> guards the end of piped input so the loop also works non-interactively (<code>java App &lt; commands.txt</code> — your REPL is instantly scriptable and testable); and state (the todos list) lives <i>outside</i> the loop.</p>
<p>That last point deserves its own sentence: a REPL is just <b>state + a command dispatch</b> — which is why the same skeleton scales from this toy to database consoles. When commands multiply, the switch graduates to a <code>Map&lt;String, Consumer&lt;String&gt;&gt;</code> of handlers — the strategy pattern from the Design Patterns stream, arriving on schedule.</p>`,
docs:[['Scanner line-oriented use — Javadoc','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Scanner.html'],['String.split — Javadoc','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/String.html#split(java.lang.String,int)'],['Switch expressions — dev.java','https://dev.java/learn/language-basics/switch-expression/']],
ex:{title:'A todo REPL',
prompt:`Write class <code>TodoRepl</code> with a <code>private final java.util.List&lt;String&gt; todos = new java.util.ArrayList&lt;&gt;()</code> and method <code>void run(java.util.Scanner sc)</code>: a <code>while</code> loop guarded by <code>sc.hasNextLine()</code>; read <code>sc.nextLine().trim()</code>, <code>continue</code> on empty; split with <code>line.split("\\\\s+", 2)</code> into command (lowercased) and arg; dispatch with an arrow-case switch: <code>"add"</code> — add arg to todos and print <code>added: &lt;arg&gt;</code>; <code>"list"</code> — print each todo on its own line prefixed <code>"- "</code>; <code>"quit"</code> — <code>return</code>; <code>default</code> — print <code>unknown command: &lt;command&gt;</code>.`,
starter:`import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

public class TodoRepl {

    private final List<String> todos = new ArrayList<>();

    void run(Scanner sc) {
        // your loop
    }
}`,
solution:`import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

public class TodoRepl {

    private final List<String> todos = new ArrayList<>();

    void run(Scanner sc) {
        while (sc.hasNextLine()) {
            String line = sc.nextLine().trim();
            if (line.isEmpty()) {
                continue;
            }
            String[] parts = line.split("\\s+", 2);
            String command = parts[0].toLowerCase();
            String arg = parts.length > 1 ? parts[1] : "";
            switch (command) {
                case "add" -> {
                    todos.add(arg);
                    System.out.println("added: " + arg);
                }
                case "list" -> todos.forEach(t -> System.out.println("- " + t));
                case "quit" -> {
                    return;
                }
                default -> System.out.println("unknown command: " + command);
            }
        }
    }
}`,
tests:[{d:'Loop guarded by hasNextLine (works piped AND interactive)',re:'while\\s*\\(\\s*sc\\.hasNextLine\\s*\\(\\s*\\)\\s*\\)'},{d:'Blank lines skipped with continue',re:'isEmpty\\s*\\(\\s*\\)[\\s\\S]*?continue'},{d:'split with limit 2 keeps multi-word args whole',re:'split\\s*\\(\\s*"\\\\s\\+"\\s*,\\s*2\\s*\\)'},{d:'Commands normalized to lowercase',re:'parts\\s*\\[\\s*0\\s*\\]\\s*\\.toLowerCase\\s*\\(\\s*\\)'},{d:'add stores and confirms',re:'case\\s+"add"[\\s\\S]*?todos\\.add\\s*\\(\\s*arg\\s*\\)[\\s\\S]*?added:'},{d:'default answers unknown commands',re:'default\\s*->[\\s\\S]*?unknown command'},{d:'quit exits via return',re:'case\\s+"quit"[\\s\\S]*?return'}],
behavior:`1. Feeding the scanner "add buy milk\\nlist\\nquit\\n" prints added: buy milk, then - buy milk, then returns. 2. "ADD x" works — commands are case-insensitive; the arg keeps its case. 3. Blank lines re-loop silently; "frobnicate" answers unknown command: frobnicate. 4. When piped input runs out, hasNextLine goes false and run() ends cleanly — the same class is interactive on a keyboard and scriptable in a test: new Scanner("add a\\nquit\\n").`,
hints:['The limit-2 split is what makes "add buy milk" one command + one argument — without it milk is lost.','Arrow-case switch needs braces only for multi-statement cases; quit is just a braced return.','Test it exactly like the behavior says: run(new Scanner("add a\\nlist\\nquit\\n")) — no keyboard required.']}},

{id:'inp5',title:'Untrusted input: the security mindset',body:`
<p>Everything so far assumed the user is clumsy. Security starts when you assume the user is <b>hostile</b> — and the promotion from "validates input" to "safe to expose" is learning what hostile input looks like. The dojo has shown you pieces; this lesson assembles the mindset.</p>
<ul>
<li><b>Injection — never concatenate input into another language.</b> A name typed as <code>'; DROP TABLE users; --</code> is data to you and code to your database. The database stream's rule (<code>PreparedStatement</code> with <code>?</code>, never string-built SQL) is one instance of the general law: input goes into <i>parameter slots</i>, never into <i>source text</i> — the same reasoning bans splicing input into shell commands (<code>ProcessBuilder</code> with list arguments, never a concatenated command line) and unescaped HTML (the web stream's XSS lesson).</li>
<li><b>Path traversal — filenames are attack vectors.</b> A "filename" of <code>../../etc/passwd</code> escapes your upload directory via the parent-directory hop. The defense is resolve-normalize-verify:</li>
</ul>
<div class="codeSample" data-hl>Path base = Path.of("/srv/uploads").toAbsolutePath().normalize();
Path target = base.resolve(userFilename).normalize();   // collapse any ../
if (!target.startsWith(base)) {                          // did it escape?
    throw new IllegalArgumentException("invalid filename");
}</div>
<ul>
<li><b>Bound everything.</b> Unlimited input length is a denial-of-service invitation — a 2 GB "username" allocates 2 GB before your regex ever runs. Check <code>length()</code> <i>first</i>, then format. Same for counts ("how many items?" → cap it) and loop-driving numbers.</li>
<li><b>Allowlist beats blocklist.</b> "Reject <code>&lt;script&gt;</code>" loses to the next encoding trick you didn't think of; "accept only <code>[A-Za-z0-9_-]{1,64}</code>" cannot lose. Validate for what IS allowed, never enumerate evil.</li>
<li><b>Fail closed, complain vaguely.</b> On invalid input: refuse, log the details server-side, and answer the user generically — "invalid filename", not "path /srv/uploads/../etc resolved outside base" (that message is a map for the attacker).</li>
</ul>
<p>The habit that binds it all: at every boundary ask <i>"what is the worst string that could arrive here?"</i> — then make the gate provably reject it. Your Ledgerly project's ownership checks, the runner sandbox in the launch plan, the prepared statements in the database stream: all the same answer to the same question at different boundaries.</p>`,
docs:[['OWASP — injection','https://owasp.org/Top10/A03_2021-Injection/'],['OWASP — path traversal','https://owasp.org/www-community/attacks/Path_Traversal'],['Files & Path — Javadoc','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/nio/file/Path.html']],
ex:{title:'Harden the upload gate',
prompt:`Write class <code>UploadGate</code> with two static methods: (1) <code>String safeName(String raw)</code> — throw <code>IllegalArgumentException("invalid filename")</code> unless raw is non-null, <b>length ≤ 64 checked before the regex</b>, and matches the allowlist <code>"[A-Za-z0-9][A-Za-z0-9._-]*"</code>; return raw when clean; (2) <code>java.nio.file.Path resolveUnder(java.nio.file.Path base, String name)</code> — <code>base.resolve(name).normalize()</code> into a variable, then throw <code>IllegalArgumentException("invalid filename")</code> if the result does <b>not</b> <code>startsWith(base)</code>; return it otherwise. Same vague message in both — no attacker cartography.`,
starter:`import java.nio.file.Path;

public class UploadGate {

    static String safeName(String raw) {
        return null;
    }

    static Path resolveUnder(Path base, String name) {
        return null;
    }
}`,
solution:`import java.nio.file.Path;

public class UploadGate {

    static String safeName(String raw) {
        if (raw == null || raw.length() > 64 || !raw.matches("[A-Za-z0-9][A-Za-z0-9._-]*")) {
            throw new IllegalArgumentException("invalid filename");
        }
        return raw;
    }

    static Path resolveUnder(Path base, String name) {
        Path target = base.resolve(name).normalize();
        if (!target.startsWith(base)) {
            throw new IllegalArgumentException("invalid filename");
        }
        return target;
    }
}`,
tests:[{d:'Length capped BEFORE the regex runs',re:'raw\\.length\\s*\\(\\s*\\)\\s*>\\s*64\\s*\\|\\|\\s*!\\s*raw\\.matches'},{d:'Allowlist regex, first char alphanumeric',re:'matches\\s*\\(\\s*"\\[A-Za-z0-9\\]\\[A-Za-z0-9._-\\]\\*"'},{d:'resolve then normalize collapses ../ hops',re:'base\\.resolve\\s*\\(\\s*name\\s*\\)\\s*\\.normalize\\s*\\(\\s*\\)'},{d:'Escape detected with startsWith on the base',re:'!\\s*\\w+\\.startsWith\\s*\\(\\s*base\\s*\\)'},{d:'Both failures use the same vague message',re:'"invalid filename"[\\s\\S]*"invalid filename"'},{d:'No blocklist thinking — .. never string-matched',re:'contains\\s*\\(\\s*"\\.\\."',not:true}],
behavior:`1. safeName("report_2026.pdf") passes; safeName("../secret"), safeName(".hidden") and a 65-char name all throw — the dot-leading and traversal names never match an allowlist that requires an alphanumeric first char. 2. The length check runs before the regex, so a 2 GB string is rejected in O(1). 3. resolveUnder(Path.of("/srv/uploads"), "docs/a.txt") returns the resolved path; "..%2F" tricks that survive decoding still die at startsWith after normalize. 4. Both rejections say only "invalid filename" — the log can know more; the attacker learns nothing.`,
hints:['Order in the guard IS the defense: null check, then length, then regex — each shields the next.','normalize() is what turns a/b/../../etc into etc so startsWith can catch the escape; resolve alone is not enough.','Why no contains("..") check? Allowlist thinking: you already required every char to be [A-Za-z0-9._-] and the path to stay under base — enumeration of evil adds nothing.']}}
]});
