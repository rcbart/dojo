STREAMS.push({icon:'☕',title:'Java Fundamentals',blurb:'Classes, types, methods, OOP, collections & generics, user input and file I/O — fast track for people who already code.',lessons:[
{id:'fun0',title:'Setup: Java on your machine',body:`
<p>Get a working toolchain before anything else. The pieces:</p>
<ul>
<li><b>JDK vs JRE</b>: the JDK is the full development kit (compiler, tools); a JRE only runs programs. You want a JDK — grab an LTS release (21) from <a href="https://adoptium.net" target="_blank" rel="noopener">Adoptium (Temurin)</a>.</li>
<li><b>Install &amp; switch versions</b> — the pro tool is <a href="https://sdkman.io" target="_blank" rel="noopener">SDKMAN!</a> (macOS/Linux): install, list, and switch JDKs per shell or per project. macOS alternative: <code>brew install --cask temurin@21</code>; Windows: winget or the Adoptium installer.</li>
<li><b>JAVA_HOME</b>: many tools (Maven, Gradle, IDEs) locate Java via this env var — point it at the JDK folder and put <code>$JAVA_HOME/bin</code> on PATH. SDKMAN manages this for you.</li>
<li><b>The core commands</b>: <code>javac</code> compiles, <code>java</code> runs (and since Java 11 runs single .java files directly), <code>jshell</code> is the interactive REPL — perfect for trying snippets from this dojo.</li>
<li><b>IDE</b>: IntelliJ IDEA Community is the de-facto standard; VS Code + the Java extension pack is lighter. Either way, know the CLI too — CI servers don't run IDEs.</li>
</ul>
<div class="codeSample">sdk install java 21.0.3-tem      # install Temurin 21 via SDKMAN
sdk use java 21.0.3-tem          # switch this shell to it
java --version                   # verify
echo $JAVA_HOME                  # where tools will look

javac Greeter.java && java Greeter    # compile then run
java Greeter.java                     # single-file mode: no javac step
jshell                                # REPL: try Java line by line</div>`,
docs:[['Adoptium Temurin downloads','https://adoptium.net'],['SDKMAN! usage','https://sdkman.io/usage'],['JShell tutorial — Oracle','https://docs.oracle.com/en/java/javase/21/jshell/introduction-jshell.html']],
ex:{title:'Toolchain drill',lang:'shell',
prompt:`One per numbered line: (1) the SDKMAN command to install Temurin 21 (identifier <code>21.0.3-tem</code>), (2) verify the active Java version, (3) compile <code>Greeter.java</code> and, on the same line with <code>&amp;&amp;</code>, run the resulting class, (4) run <code>Greeter.java</code> directly without a compile step, (5) start the Java REPL, (6) print the JAVA_HOME environment variable.`,
starter:`# 1)

# 2)

# 3)

# 4)

# 5)

# 6)
`,
tests:[{d:'sdk install with the identifier',re:'sdk\\s+install\\s+java\\s+21\\.0\\.3-tem'},{d:'Version check',re:'java\\s+--?version'},{d:'Compile && run',re:'javac\\s+Greeter\\.java\\s*&&\\s*java\\s+Greeter\\b'},{d:'Single-file mode (java + .java)',re:'java\\s+Greeter\\.java'},{d:'jshell REPL',re:'\\bjshell\\b'},{d:'Echoes JAVA_HOME',re:'echo\\s+\\$JAVA_HOME'}],
behavior:`1. (1) sdk install java 21.0.3-tem. 2. (2) java --version. 3. (3) javac Greeter.java && java Greeter — note: java runs the CLASS name, no .class extension. 4. (4) java Greeter.java. 5. (5) jshell. 6. (6) echo $JAVA_HOME.`,
hints:['SDKMAN verbs: install, use, default, list — all as <code>sdk &lt;verb&gt; java ...</code>','Classic two-step: javac produces Greeter.class; java then takes the bare class name Greeter.','Single-file mode (Java 11+) compiles in memory: <code>java Greeter.java</code> — great for small experiments.'],
solution:`# 1)
sdk install java 21.0.3-tem

# 2)
java --version

# 3)
javac Greeter.java && java Greeter

# 4)
java Greeter.java

# 5)
jshell

# 6)
echo $JAVA_HOME`}},
{id:'fun1',title:'Hello, JVM: your first class',body:`
<p>🌱 <b>Starting from zero:</b> a program is nothing more than a list of instructions a computer follows, written in a language it can be taught to understand — here, Java. You write the instructions in a plain text file, a tool turns them into a form the machine can run, and then it runs them, top to bottom. That is the whole magic trick. This lesson is your first complete round trip: write the smallest possible Java program, run it, and watch it do something.</p>
<p>Java source lives in classes. You compile <code>.java</code> to <code>.class</code> bytecode with <code>javac</code>, and the JVM runs it with <code>java</code>. Since Java 11 you can also run a single file directly: <code>java Greeter.java</code>. Execution starts at <code>public static void main(String[] args)</code>.</p>
<div class="codeSample" data-hl>public class Greeter {
    public static void main(String[] args) {
        System.out.println("Hello, Dojo!");
    }
}</div>
<p>Coming from another language, the key differences: everything lives in a class, the file name must match the public class name, every statement ends with <code>;</code>, and Java is statically typed — every variable has a declared (or inferred) type.</p>`,
docs:[['dev.java — Getting Started','https://dev.java/learn/getting-started/'],['Oracle Tutorial — A Closer Look at main','https://docs.oracle.com/javase/tutorial/getStarted/application/index.html']],
ex:{title:'Your first Greeter',
prompt:`Write a class <code>Greeter</code> with: (1) a <code>main</code> method that prints exactly <code>Welcome to DevDojo!</code>, and (2) a <code>static</code> method <code>String greet(String name)</code> that returns <code>"Hello, " + name + "!"</code>. Have main also print <code>greet("Ada")</code>.`,
starter:`public class Greeter {
    // 1. add main here

    // 2. add static String greet(String name)
}`,
tests:[{d:'Declares public class Greeter',re:'public\\s+class\\s+Greeter'},{d:'Has a proper main method',re:'public\\s+static\\s+void\\s+main\\s*\\(\\s*String\\s*\\[\\]\\s*\\w+\\s*\\)'},{d:'Defines static String greet(String ...)',re:'static\\s+String\\s+greet\\s*\\(\\s*String\\s+\\w+\\s*\\)'},{d:'Prints the welcome line',re:'Welcome to DevDojo!'}],
behavior:`1. main prints "Welcome to DevDojo!" as first line. 2. greet("Ada") returns exactly "Hello, Ada!". 3. main prints the result of greet("Ada"). 4. Code compiles (types, semicolons, braces).`,
hints:['main has the exact signature <code>public static void main(String[] args)</code> — the JVM looks for that exact shape.','Printing is <code>System.out.println("...")</code>. Do it inside main.','greet should <code>return "Hello, " + name + "!";</code> — then call <code>System.out.println(greet("Ada"));</code> from main (works because both are static).'],
solution:`public class Greeter {
    public static void main(String[] args) {
        System.out.println("Welcome to DevDojo!");
        System.out.println(greet("Ada"));
    }

    static String greet(String name) {
        return "Hello, " + name + "!";
    }
}`}},
{id:'fun2',title:'Variables, types, var and conversions',body:`
<p><b>Variables deserve a slower look — everything else builds on them.</b> A variable is a <i>named piece of storage with a declared type</i>: the name is how your code refers to it, the type is the compiler-enforced promise about what it can hold. Three moments in a variable's life are worth separating: <b>declaration</b> (<code>int count;</code> — the name and type exist), <b>initialization</b> (the <i>first</i> value goes in), and <b>assignment</b> (any later value replaces the current one). <code>final</code> forbids that third step — declare-once, assign-once — and modern Java style uses it liberally: a variable that never changes is one less thing to track while reading.</p>
<p>⚠️ <b>Always initialize your variables — ideally in the same line that declares them.</b> Java's rules here have a trap-shaped asymmetry:</p>
<ul>
<li><b>Local variables</b> (inside methods) have <b>no default value at all</b>. Using one before it's assigned is a <i>compile error</i> ("variable count might not have been initialized") — the compiler proves <b>definite assignment</b> on every path. Good: the mistake can't reach runtime. But don't fight the checker with a lazy <code>int count = 0;</code>-then-reassign dance when <code>int count = computeCount();</code> says it in one honest line.</li>
<li><b>Fields</b> (class members) silently get defaults: <code>0</code>, <code>0.0</code>, <code>false</code>, and — the dangerous one — <b><code>null</code> for every reference type</b>. A field you forgot to initialize doesn't fail the build; it waits and throws <code>NullPointerException</code> the first time something calls a method on it, often far from where the real mistake lives. The habit that prevents this: initialize fields at the declaration or in the constructor — those are the only two places a reader looks.</li>
</ul>
<div class="codeSample" data-hl>int x;
// System.out.println(x);     // compile error: x might not have been initialized
int y = 42;                   // declare + initialize — the habit

class Session {
    List&lt;String&gt; events;                          // silently null — NPE waiting
    List&lt;String&gt; safe = new ArrayList&lt;&gt;();        // initialized at declaration
}</div>
<p>Every variable also has a <b>scope</b> — the region of code where its name exists: the block it was declared in, and nothing more. Declare variables in the <i>smallest scope that works</i> and as close to first use as possible; a variable alive for 300 lines is 300 lines of "what's its value now?".</p>
<p>Java has 8 primitives (<code>int</code>, <code>long</code>, <code>double</code>, <code>boolean</code>, <code>char</code>, <code>byte</code>, <code>short</code>, <code>float</code>) and reference types (objects). Primitives hold values; references point to heap objects. Each primitive has a wrapper class (<code>Integer</code>, <code>Double</code> …) and Java auto-boxes between them.</p>
<div class="codeSample" data-hl>int a = 7;
double d = a;          // widening: automatic
int b = (int) 3.99;    // narrowing: explicit cast, b == 3 (truncates!)
var list = "1,2,3";    // var infers String — still static typing
int n = Integer.parseInt("42");
double half = 1 / 2;     // 0.0 — integer division happens FIRST
double half2 = 1 / 2.0;  // 0.5</div>
<p>Two classic traps: integer division truncates, and <code>==</code> on objects compares references — use <code>.equals()</code> for value equality (especially Strings).</p>`,
docs:[['Primitive Data Types — Oracle','https://docs.oracle.com/javase/tutorial/java/nutsandbolts/datatypes.html'],['Using var — dev.java','https://dev.java/learn/language-basics/using-var/']],
ex:{title:'Conversion toolbox',
prompt:`Write a class <code>Conversions</code> with three static methods: <code>double average(int a, int b)</code> returning the true average (careful: integer division!), <code>int toInt(String s)</code> parsing a string to int, and <code>boolean sameText(String a, String b)</code> comparing string content, not references.`,
starter:`public class Conversions {
    static double average(int a, int b) {
        return 0; // fix me
    }

    static int toInt(String s) {
        return 0; // fix me
    }

    static boolean sameText(String a, String b) {
        return false; // fix me
    }
}`,
tests:[{d:'average avoids integer division (uses 2.0 or a cast)',re:'average[\\s\\S]*?(2\\.0|\\(\\s*double\\s*\\))'},{d:'toInt uses Integer.parseInt',re:'Integer\\.parseInt'},{d:'sameText uses .equals, not ==',re:'\\.equals\\s*\\('},{d:'Does not compare strings with ==',re:'sameText[\\s\\S]*?==\\s*b',not:true}],
behavior:`1. average(1, 2) returns 1.5 (not 1.0). 2. toInt("42") returns 42. 3. sameText(new String("hi"), "hi") returns true. 4. Compiles.`,
hints:['average: <code>(a + b) / 2</code> is integer division. Divide by <code>2.0</code> or cast: <code>(double)(a + b) / 2</code>.','toInt: the standard parse is <code>Integer.parseInt(s)</code>.','sameText: <code>a.equals(b)</code> compares content; <code>==</code> would compare references.'],
solution:`public class Conversions {
    static double average(int a, int b) {
        return (a + b) / 2.0;
    }

    static int toInt(String s) {
        return Integer.parseInt(s);
    }

    static boolean sameText(String a, String b) {
        return a.equals(b);
    }
}`}},
{id:'fun2a',title:'Booleans & logical operators',body:`
<p>Every condition your programs will ever branch on is built from a handful of operators combining <code>boolean</code> values. Master the combinators before the conditionals that use them:</p>
<ul>
<li><b><code>&amp;&amp;</code> — AND</b>: true only when both sides are true.</li>
<li><b><code>||</code> — OR</b>: true when at least one side is true.</li>
<li><b><code>!</code> — NOT</b>: flips the value.</li>
<li><b><code>^</code> — XOR</b>: true when the sides <i>differ</i> (exactly one is true). Rarer, but the cleanest way to say "one or the other, not both".</li>
</ul>
<p><b>Short-circuit evaluation</b> is the behavior that makes <code>&amp;&amp;</code> and <code>||</code> more than logic: the right side is <i>not evaluated at all</i> when the left side already decides the answer. <code>false &amp;&amp; anything</code> never looks at anything; <code>true || anything</code> likewise. This is not an optimization footnote — it is the standard null-safety idiom:</p>
<div class="codeSample">// safe: if s is null the left side is false and s.length() NEVER runs
if (s != null &amp;&amp; s.length() &gt; 3) { ... }

// crash: both sides always evaluated — &amp; and | are the non-short-circuit twins
if (s != null &amp; s.length() &gt; 3) { ... }   // NullPointerException when s == null</div>
<p><b>Precedence</b>: <code>!</code> binds tightest, then <code>&amp;&amp;</code>, then <code>||</code> — so <code>a || b &amp;&amp; c</code> means <code>a || (b &amp;&amp; c)</code>. When a condition needs a re-read, add the parentheses; the compiler doesn't need them, colleagues do.</p>
<p><b>De Morgan's laws</b> — the rewrite rules for pushing <code>!</code> through: <code>!(a &amp;&amp; b) == !a || !b</code> and <code>!(a || b) == !a &amp;&amp; !b</code>. They turn "not (in range)" into "below or above" — often the version that reads like the requirement. And one style rule that separates juniors from seniors: <code>if (x) return true; else return false;</code> is just <code>return x;</code> — boolean expressions are values; return them directly.</p>`,
docs:[['Operators — Java Tutorials','https://docs.oracle.com/javase/tutorial/java/nutsandbolts/operators.html'],['Equality & relational operators','https://docs.oracle.com/javase/tutorial/java/nutsandbolts/op2.html'],['JLS — conditional operators','https://docs.oracle.com/javase/specs/jls/se21/html/jls-15.html#jls-15.23']],
ex:{title:'Combinator drill',
prompt:`Write class <code>Logic</code> with five static methods, each a <b>single return of a boolean expression — no if statements anywhere</b>: (1) <code>boolean canRent(int age, boolean hasLicense)</code> — true when age is at least 21 <b>AND</b> the license is there; (2) <code>boolean isWeekend(String day)</code> — true when day equals <code>"SAT"</code> <b>OR</b> <code>"SUN"</code> (use equals, not ==); (3) <code>boolean longEnough(String s, int min)</code> — true when s is <b>not null AND</b> at least min chars — order matters: the null check must short-circuit first; (4) <code>boolean exactlyOne(boolean a, boolean b)</code> — true when exactly one of them is true (one operator does this); (5) <code>boolean outsideRange(int n, int lo, int hi)</code> — true when n is below lo <b>OR</b> above hi.`,
starter:`public class Logic {

    static boolean canRent(int age, boolean hasLicense) {
        return false;
    }

    static boolean isWeekend(String day) {
        return false;
    }

    static boolean longEnough(String s, int min) {
        return false;
    }

    static boolean exactlyOne(boolean a, boolean b) {
        return false;
    }

    static boolean outsideRange(int n, int lo, int hi) {
        return false;
    }
}`,
solution:`public class Logic {

    static boolean canRent(int age, boolean hasLicense) {
        return age >= 21 && hasLicense;
    }

    static boolean isWeekend(String day) {
        return day.equals("SAT") || day.equals("SUN");
    }

    static boolean longEnough(String s, int min) {
        return s != null && s.length() >= min;
    }

    static boolean exactlyOne(boolean a, boolean b) {
        return a ^ b;
    }

    static boolean outsideRange(int n, int lo, int hi) {
        return n < lo || n > hi;
    }
}`,
tests:[{d:'canRent: AND combines age and license',re:'canRent[\\s\\S]*?return\\s+age\\s*>=\\s*21\\s*&&\\s*hasLicense'},{d:'isWeekend: OR of two equals calls',re:'isWeekend[\\s\\S]*?equals\\s*\\(\\s*"SAT"\\s*\\)\\s*\\|\\|[\\s\\S]*?equals\\s*\\(\\s*"SUN"\\s*\\)'},{d:'Strings never compared with ==',re:'day\\s*==\\s*"',not:true},{d:'longEnough: null guard FIRST, then length — short-circuit order',re:'return\\s+s\\s*!=\\s*null\\s*&&\\s*s\\.length\\s*\\(\\s*\\)\\s*>=\\s*min'},{d:'exactlyOne uses XOR',re:'return\\s+a\\s*\\^\\s*b'},{d:'outsideRange: below-or-above (De Morgan of the range check)',re:'return\\s+n\\s*<\\s*lo\\s*\\|\\|\\s*n\\s*>\\s*hi'},{d:'No if statements — booleans returned directly',re:'\\bif\\s*\\(',not:true}],
behavior:`1. canRent(22, true) == true; canRent(22, false) == false; canRent(20, true) == false. 2. isWeekend("SAT") and isWeekend("SUN") are true, isWeekend("MON") false. 3. longEnough(null, 3) returns FALSE instead of throwing — the null check short-circuits before s.length() runs; longEnough("hello", 3) == true. 4. exactlyOne(true, false) == true, exactlyOne(true, true) == false — XOR is "the sides differ". 5. outsideRange(5, 1, 10) == false, outsideRange(0, 1, 10) == true, outsideRange(11, 1, 10) == true. 6. No method contains an if — every condition IS the return value.`,
hints:['Every method body is one line: return <expression>; — if you typed if, you are working too hard.','longEnough is the whole lesson: swap the operands (s.length() >= min && s != null) and null crashes it — short-circuit only protects left-to-right.','outsideRange has two equally correct spellings: n < lo || n > hi, or !(n >= lo && n <= hi) — De Morgan says they are the same; the drill asks for the first (it reads better).']}},

{id:'obj1',title:'Objects & autoboxing: the two kinds of values',body:`
<p>🌱 <b>Starting from zero:</b> Java values come in two kinds, and telling them apart explains half the confusing things beginners hit.</p>
<ul>
<li><b>Primitives</b> are raw values — just a number or a true/false, nothing more. <code>int</code>, <code>double</code>, <code>boolean</code> and friends. Think of a primitive as a number written directly on a sticky note: the note IS the value.</li>
<li><b>Objects</b> are smart bundles — data plus abilities, packaged together. A String object holds its characters AND knows how to uppercase itself (<code>name.toUpperCase()</code>). You will build your own object types soon (that is what classes are); for now the key idea is that an object <i>can do things</i>, a primitive just <i>is</i> a thing.</li>
</ul>
<p>One more difference matters: a variable never holds an object directly — it holds a <b>reference</b>, which works like a TV remote. The TV (the object) sits on the heap; the remote (the reference) is what you pass around, and two remotes can control the SAME TV. Copy a primitive and you get an independent copy; copy a reference and both variables now point at one shared object. This picture is why <code>==</code> on objects compares <i>remotes</i> (same object?) while <code>.equals()</code> compares <i>content</i> — the trap you met in the variables lesson, now explained.</p>
<p><b>The bridge between the two worlds.</b> Java's containers (like <code>List</code>) and its generics labels can only hold <i>objects</i> — there is no <code>List&lt;int&gt;</code>. So every primitive has an object twin, a <b>wrapper class</b>: <code>int</code>→<code>Integer</code>, <code>double</code>→<code>Double</code>, <code>boolean</code>→<code>Boolean</code>, and so on. A wrapper is literally a small object with one primitive inside — the sticky note placed in a labeled box.</p>
<p><b>Autoboxing</b> is Java doing the boxing and unboxing for you, silently:</p>
<div class="codeSample" data-hl>List&lt;Integer&gt; scores = new ArrayList&lt;&gt;();
scores.add(97);              // AUTOBOXING: int 97 → new Integer object, automatically
int first = scores.get(0);   // UNBOXING: Integer object → raw int, automatically

Integer maybe = null;        // a reference can be null ("no box at all")...
int boom = maybe;            // ...UNBOXING null → NullPointerException!  trap #1

Integer a = 1000, b = 1000;
a == b;                      // false! — two different boxes (compares remotes)  trap #2
a.equals(b);                 // true — compares the numbers inside the boxes</div>
<p>The two traps deserve names. <b>Null unboxing</b>: a wrapper variable can be <code>null</code>, and unwrapping "no box" explodes — so check for null before treating a wrapper as a primitive. <b>Wrapper <code>==</code></b>: it compares references, not values (small values -128..127 are cached and can coincidentally match, which makes the bug worse — it "works" in tests and fails with real data). Rule: <b>wrappers are compared with <code>.equals()</code>, always.</b></p>
<p>When do you choose which? Primitives for arithmetic, counters, and fields that always have a value — they are faster and can never be null. Wrappers when an object is required: inside collections and generics (<code>List&lt;Integer&gt;</code>, <code>Map&lt;String, Double&gt;</code>), or when "no value yet" is a legitimate state. Autoboxing makes the boundary almost invisible — these two traps are the only places the seam shows.</p>`,
docs:[['Autoboxing — Oracle tutorial','https://docs.oracle.com/javase/tutorial/java/data/autoboxing.html'],['Numbers classes (wrappers) — Oracle','https://docs.oracle.com/javase/tutorial/java/data/numberclasses.html'],['Integer cache — JLS 5.1.7','https://docs.oracle.com/javase/specs/jls/se21/html/jls-5.html#jls-5.1.7']],
ex:{title:'Boxing without the traps',
prompt:`Write class <code>Boxing</code> with three static methods: (1) <code>int sum(java.util.List&lt;Integer&gt; nums)</code> — enhanced for over the list, accumulate into an <code>int</code> and return it (unboxing does the unwrapping for you); (2) <code>int valueOr(Integer maybe, int fallback)</code> — return <code>fallback</code> when <code>maybe == null</code>, otherwise return <code>maybe</code> (the null check is what makes the unboxing safe — trap #1 disarmed); (3) <code>boolean sameValue(Integer a, Integer b)</code> — return whether the two hold the same number: null-safe via <code>java.util.Objects.equals(a, b)</code> — and <b>never compare the wrappers with ==</b> (trap #2 disarmed).`,
starter:`import java.util.List;
import java.util.Objects;

public class Boxing {

    static int sum(List<Integer> nums) {
        return 0;
    }

    static int valueOr(Integer maybe, int fallback) {
        return 0;
    }

    static boolean sameValue(Integer a, Integer b) {
        return false;
    }
}`,
solution:`import java.util.List;
import java.util.Objects;

public class Boxing {

    static int sum(List<Integer> nums) {
        int total = 0;
        for (int n : nums) {
            total += n;
        }
        return total;
    }

    static int valueOr(Integer maybe, int fallback) {
        if (maybe == null) {
            return fallback;
        }
        return maybe;
    }

    static boolean sameValue(Integer a, Integer b) {
        return Objects.equals(a, b);
    }
}`,
tests:[{d:'sum walks the list with an enhanced for, unboxing as it goes',re:'for\\s*\\(\\s*int\\s+\\w+\\s*:\\s*nums\\s*\\)'},{d:'sum accumulates into a primitive int',re:'int\\s+total\\s*=\\s*0|total\\s*\\+=|int\\s+\\w+\\s*=\\s*0'},{d:'valueOr checks null BEFORE unboxing',re:'maybe\\s*==\\s*null[\\s\\S]*?return\\s+fallback'},{d:'sameValue uses null-safe Objects.equals',re:'return\\s+Objects\\.equals\\s*\\(\\s*a\\s*,\\s*b\\s*\\)'},{d:'Wrappers never compared with == (a == b forbidden)',re:'a\\s*==\\s*b',not:true}],
behavior:`1. sum(List.of(1, 2, 3)) == 6 — each Integer silently unboxes into the running int total. 2. valueOr(null, 7) == 7 and does NOT throw — the null check runs before any unboxing; valueOr(42, 7) == 42. 3. sameValue(1000, 1000) == true even though those two boxes are different objects — Objects.equals compares contents; sameValue(null, null) == true and sameValue(null, 5) == false, no NPE anywhere. 4. Nowhere does the file compare two wrappers with == — the compiler can't catch that bug for you, so the habit has to.`,
hints:['sum needs no boxing code at all — write it as if the list held ints; that invisible convenience IS autoboxing.','valueOr: the danger line would be returning maybe when maybe is null — the if disarms it before the unboxing happens.','Objects.equals(a, b) handles all four null/value combinations correctly in one call — the standard null-safe comparison.']}},

{id:'fun2b',title:'Conditionals: if/else to switch expressions',body:`
<p>🌱 <b>Starting from zero:</b> so far our instructions run top to bottom, every time, the same way. Real programs make <b>decisions</b>: "IF the password is right, let them in, OTHERWISE show an error." That fork in the road is called a <b>conditional</b> — the program tests a yes/no question (built with the operators from the last lesson) and picks a path. Everything on this page is just increasingly polished ways of writing "if this, then that, otherwise the other."</p>
<p>Branching, from classic to modern:</p>
<div class="codeSample" data-hl>if (score &gt;= 90) grade = "A";
else if (score &gt;= 80) grade = "B";
else grade = "F";                          // classic chain — order matters!

String sign = n &lt; 0 ? "negative" : "non-negative";   // ternary: small choices only

// guard clauses: handle edge cases first, exit early — flat beats nested
if (input == null) throw new IllegalArgumentException("input required");
if (input.isBlank()) return DEFAULT;
// ...happy path continues un-indented

// OLD switch: fall-through, break required. NEW (Java 14+): expression, no fall-through
String quarter = switch (month) {
    case 1, 2, 3   -&gt; "Q1";               // multi-label, arrow, no break
    case 4, 5, 6   -&gt; "Q2";
    case 7, 8, 9   -&gt; "Q3";
    case 10, 11, 12 -&gt; "Q4";
    default -&gt; {
        log(month);                        // block body needs yield
        yield "invalid";
    }
};</div>
<p>Style rules that scale: prefer guard clauses over deep nesting; ternaries for tiny picks, never nested; switch <i>expressions</i> (with <code>-&gt;</code>) over statements — the compiler checks exhaustiveness and fall-through bugs vanish.</p>`,
docs:[['if-then-else — Oracle','https://docs.oracle.com/javase/tutorial/java/nutsandbolts/if.html'],['Switch expressions — dev.java','https://dev.java/learn/language-basics/switch-expression/']],
exs:[
{title:'Classic chain: letter grades',
prompt:`Write <code>Grades</code> with <code>static String grade(int score)</code> using an <b>if / else-if chain</b> (no switch): 90+ → "A", 80+ → "B", 70+ → "C", 60+ → "D", below → "F".`,
starter:`public class Grades {
    static String grade(int score) {
        // if / else if chain, highest band first
        return null;
    }
}`,
tests:[{d:'Uses an else-if chain',re:'else\\s+if\\s*\\('},{d:'Checks 90 first (order matters)',re:'if\\s*\\(\\s*score\\s*>=\\s*90'},{d:'No switch used',re:'switch',not:true},{d:'All five grades present',re:'"A"[\\s\\S]*"B"[\\s\\S]*"C"[\\s\\S]*"D"[\\s\\S]*"F"'}],
behavior:`1. grade(95)=="A", grade(90)=="A" (boundary!), grade(85)=="B", grade(70)=="C", grade(60)=="D", grade(59)=="F". 2. Bands checked highest-first — reversed order would trap everything at the first true condition.`,
hints:['Start at the top band: <code>if (score >= 90) return "A";</code>','Each subsequent test only runs when the previous failed — so <code>else if (score >= 80)</code> already implies score < 90.','The final <code>else return "F";</code> (or a bare return) catches everything below 60.'],
solution:`public class Grades {
    static String grade(int score) {
        if (score >= 90) return "A";
        else if (score >= 80) return "B";
        else if (score >= 70) return "C";
        else if (score >= 60) return "D";
        else return "F";
    }
}`},
{title:'Ternary & guard clauses',
prompt:`Write <code>Checks</code> with: <code>static String sign(int n)</code> as a <b>single return using ternaries</b> ("negative" / "zero" / "positive"), and <code>static String access(Integer age)</code> using <b>guard clauses</b>: throw <code>IllegalArgumentException</code> if age is null or negative, then return "minor" for under 18 else "adult" — no nested if blocks anywhere.`,
starter:`public class Checks {
    static String sign(int n) {
        return null; // one return, ternaries
    }

    static String access(Integer age) {
        // guards first, then the simple decision
        return null;
    }
}`,
tests:[{d:'sign is a single ternary return',re:'return\\s+n\\s*[<>=!][\\s\\S]*?\\?[\\s\\S]*?:[\\s\\S]*?;'},{d:'Guard throws on bad input',re:'throw\\s+new\\s+IllegalArgumentException'},{d:'Null-checked before use',re:'age\\s*==\\s*null|null\\s*==\\s*age'},{d:'No nested if blocks (flat guards)',re:'if\\s*\\([^)]*\\)\\s*\\{[^}]*if\\s*\\(',not:true}],
behavior:`1. sign(-5)=="negative", sign(0)=="zero", sign(3)=="positive". 2. access(null) and access(-1) throw IllegalArgumentException. 3. access(17)=="minor", access(18)=="adult". 4. access reads as a flat sequence of early exits — no pyramid of doom.`,
hints:['Chained ternary: <code>return n < 0 ? "negative" : n == 0 ? "zero" : "positive";</code> — acceptable because each branch is trivial.','Guards are one-liners: <code>if (age == null || age < 0) throw new IllegalArgumentException("age must be a non-negative number");</code>','After the guards the happy path is a single ternary or if/return.'],
solution:`public class Checks {
    static String sign(int n) {
        return n < 0 ? "negative" : n == 0 ? "zero" : "positive";
    }

    static String access(Integer age) {
        if (age == null || age < 0) {
            throw new IllegalArgumentException("age must be a non-negative number");
        }
        return age < 18 ? "minor" : "adult";
    }
}`},
{title:'Modern switch expressions',
prompt:`Write <code>Quarters</code> with <code>static String quarter(int month)</code> as a <b>switch expression</b>: multi-label arrow cases mapping 1-3→"Q1", 4-6→"Q2", 7-9→"Q3", 10-12→"Q4", and a <code>default</code> using a <b>block with yield</b> returning "invalid". No <code>break</code> anywhere.`,
starter:`public class Quarters {
    static String quarter(int month) {
        return switch (month) {
            // case 1, 2, 3 -> ...
            default -> {
                // yield from a block
                yield "invalid";
            }
        };
    }
}`,
tests:[{d:'switch expression assigned/returned',re:'return\\s+switch\\s*\\(\\s*month\\s*\\)'},{d:'Multi-label arrow case',re:'case\\s+1\\s*,\\s*2\\s*,\\s*3\\s*->'},{d:'All four quarters mapped',re:'"Q1"[\\s\\S]*"Q2"[\\s\\S]*"Q3"[\\s\\S]*"Q4"'},{d:'default block uses yield',re:'default\\s*->\\s*\\{[\\s\\S]*?yield'},{d:'No break statements',re:'\\bbreak\\s*;',not:true}],
behavior:`1. quarter(1)=="Q1", quarter(6)=="Q2", quarter(9)=="Q3", quarter(12)=="Q4". 2. quarter(0) and quarter(13)=="invalid". 3. Arrow cases cannot fall through — no break needed or allowed. 4. The switch is an expression: its value is returned directly.`,
hints:['Arrow cases with several labels: <code>case 1, 2, 3 -> "Q1";</code>','Single-expression cases need no braces or yield — only block bodies do.','The whole thing is one statement: <code>return switch (month) { ... };</code> — note the trailing semicolon.'],
solution:`public class Quarters {
    static String quarter(int month) {
        return switch (month) {
            case 1, 2, 3    -> "Q1";
            case 4, 5, 6    -> "Q2";
            case 7, 8, 9    -> "Q3";
            case 10, 11, 12 -> "Q4";
            default -> {
                yield "invalid";
            }
        };
    }
}`}
]},
{id:'fun2c',title:'Loops: for, while, do-while',body:`
<p>🌱 <b>Starting from zero:</b> the second superpower after deciding is <b>repeating</b>. "Wash a dish. Is the sink empty? No — wash the next one" — you loop until a condition says stop. A <b>loop</b> is exactly that: a block of instructions the program runs again and again while some yes/no test stays true. Java has three loop shapes, and the only skill is picking the one that matches how you\u0027d naturally describe the repetition out loud.</p>
<p>The three classic loops, and when each earns its place:</p>
<div class="codeSample" data-hl>for (int i = 0; i &lt; 10; i++) { ... }   // known count / need the index

while (queue.hasWork()) { ... }        // unknown count, maybe zero times

do {
    input = readInput();               // must run at least once
} while (!valid(input));

for (int i = 0; i &lt; n; i++) {
    if (skip(i)) continue;             // jump to next iteration
    if (found(i)) break;               // leave the loop entirely
}

outer:                                  // labeled break: escape nested loops
for (int r = 0; r &lt; rows; r++)
    for (int c = 0; c &lt; cols; c++)
        if (grid[r][c] == target) break outer;</div>
<p>Choose by intent: <code>for</code> when the count is known, <code>while</code> when it isn't, <code>do-while</code> when the body must run first (input loops). Off-by-one errors live at the boundaries — always test first and last iterations mentally. The enhanced for (next lesson) replaces most index loops over collections.</p>`,
docs:[['The for statement — Oracle','https://docs.oracle.com/javase/tutorial/java/nutsandbolts/for.html'],['while & do-while — Oracle','https://docs.oracle.com/javase/tutorial/java/nutsandbolts/while.html'],['Branching statements — Oracle','https://docs.oracle.com/javase/tutorial/java/nutsandbolts/branch.html']],
exs:[
{title:'Classic for: sum the evens',
prompt:`Write <code>Loops</code> with <code>static int sumEvens(int n)</code>: a classic three-part <b>for loop</b> from 1 to n (inclusive) accumulating only even numbers — use <code>continue</code> to skip odds (that is the drill).`,
starter:`public class Loops {
    static int sumEvens(int n) {
        int sum = 0;
        // for (…; …; …) with continue for odd numbers
        return sum;
    }
}`,
tests:[{d:'Three-part for loop',re:'for\\s*\\(\\s*int\\s+\\w+\\s*=\\s*1?\\s*;[^;]*;[^)]*\\)'},{d:'Uses continue to skip odds',re:'continue\\s*;'},{d:'Modulo test for evenness',re:'%\\s*2'},{d:'No streams (this drill is the classic way)',re:'\\.stream\\s*\\(',not:true}],
behavior:`1. sumEvens(6) == 12 (2+4+6). 2. sumEvens(1) == 0. 3. sumEvens(0) == 0 (loop body never runs). 4. The inclusive boundary: i <= n, not i < n — sumEvens(6) must include 6.`,
hints:['Header: <code>for (int i = 1; i <= n; i++)</code> — inclusive upper bound.','Skip pattern: <code>if (i % 2 != 0) continue;</code> then accumulate below it.','Trace the boundaries: first iteration i=1 (skipped), last i=n.'],
solution:`public class Loops {
    static int sumEvens(int n) {
        int sum = 0;
        for (int i = 1; i <= n; i++) {
            if (i % 2 != 0) continue;
            sum += i;
        }
        return sum;
    }
}`},
{title:'while & do-while: Collatz and digits',
prompt:`Two methods in class <code>WhileDrills</code>: <code>static int collatzSteps(long n)</code> — returns <b>how many Collatz steps</b> it takes n to reach 1, where one step transforms n (even → n/2, odd → 3n+1); count them with a <b>while loop</b>, so <code>collatzSteps(1) == 0</code> (loop never runs) and <code>collatzSteps(6) == 8</code>. And <code>static int digitCount(int n)</code> — returns <b>the number of decimal digits</b> in n (12345 → 5): a <b>do-while</b> that divides by 10 until 0, so that <code>digitCount(0) == 1</code> falls out naturally (that is why do-while!).`,
starter:`public class WhileDrills {
    static int collatzSteps(long n) {
        int steps = 0;
        // while n != 1 ...
        return steps;
    }

    static int digitCount(int n) {
        int count = 0;
        // do { ... } while ( ... );
        return count;
    }
}`,
tests:[{d:'while loop drives collatz',re:'while\\s*\\(\\s*n\\s*!=\\s*1\\s*\\)'},{d:'Even/odd branch inside',re:'n\\s*%\\s*2'},{d:'do-while for digits',re:'do\\s*\\{[\\s\\S]*?\\}\\s*while\\s*\\('},{d:'Divides by 10',re:'/=?\\s*10'}],
behavior:`1. collatzSteps(6) == 8 (6→3→10→5→16→8→4→2→1). 2. collatzSteps(1) == 0 (while's condition is false immediately — zero iterations). 3. digitCount(0) == 1 and digitCount(12345) == 5 — do-while guarantees one pass, which is exactly what makes 0 work without a special case.`,
hints:['Collatz body: <code>n = (n % 2 == 0) ? n / 2 : 3 * n + 1; steps++;</code>','collatzSteps(1) must do nothing — that is why while (checks first) is right here.','digitCount: <code>do { count++; n /= 10; } while (n != 0);</code> — the guaranteed first pass counts 0 as one digit.'],
solution:`public class WhileDrills {
    static int collatzSteps(long n) {
        int steps = 0;
        while (n != 1) {
            n = (n % 2 == 0) ? n / 2 : 3 * n + 1;
            steps++;
        }
        return steps;
    }

    static int digitCount(int n) {
        int count = 0;
        do {
            count++;
            n /= 10;
        } while (n != 0);
        return count;
    }
}`},
{title:'Nested loops & labeled break',
prompt:`Write <code>Grid</code> with <code>static int[] find(int[][] grid, int target)</code>: nested for loops over rows and columns; on the first match, record the position and use a <b>labeled break</b> to exit both loops at once; return <code>new int[]{row, col}</code> or <code>new int[]{-1, -1}</code> when absent.`,
starter:`public class Grid {
    static int[] find(int[][] grid, int target) {
        int row = -1, col = -1;
        // outer: for ... for ... break outer;
        return new int[]{row, col};
    }
}`,
tests:[{d:'A loop label is declared',re:'\\w+\\s*:\\s*\\n?\\s*for\\s*\\('},{d:'Nested for loops',re:'for\\s*\\([^)]*\\)[\\s\\S]*?for\\s*\\([^)]*\\)'},{d:'break with the label',re:'break\\s+\\w+\\s*;'},{d:'Not-found convention {-1,-1}',re:'-1'}],
behavior:`1. find({{1,2},{3,4}}, 3) returns [1, 0]. 2. find(grid, 99) returns [-1, -1]. 3. On a match BOTH loops exit immediately — a plain break would only leave the inner loop and keep scanning rows. 4. First match wins (row-major order).`,
hints:['Label goes right before the outer loop: <code>outer:\\nfor (int r = 0; ...)</code>','On match: <code>row = r; col = c; break outer;</code>','Column bound comes from the current row: <code>grid[r].length</code> (rows can be ragged).'],
solution:`public class Grid {
    static int[] find(int[][] grid, int target) {
        int row = -1, col = -1;
        outer:
        for (int r = 0; r < grid.length; r++) {
            for (int c = 0; c < grid[r].length; c++) {
                if (grid[r][c] == target) {
                    row = r;
                    col = c;
                    break outer;
                }
            }
        }
        return new int[]{row, col};
    }
}`}
]},
{id:'fun2d',title:'Iterating collections: Iterator → for-each → forEach',body:`
<p>🌱 <b>Starting from zero:</b> programs constantly work with <b>groups</b> of things — all the players, every line of a file, each item in a cart. Java calls these groups <i>collections</i> (a fuller tour comes in two lessons; for now: a List is simply an ordered bunch of values). The everyday need is to <b>visit every item and do something to it</b> — like going down a checklist. This lesson shows the three ways Java lets you walk a collection, from the old manual way to the modern one-liner.</p>
<p>Three generations of the same job:</p>
<div class="codeSample" data-hl>// 1) explicit Iterator — verbose, but the ONLY safe way to remove while iterating
Iterator&lt;String&gt; it = names.iterator();
while (it.hasNext()) {
    String s = it.next();
    if (s.isBlank()) it.remove();       // list.remove(s) here would throw CME!
}

// 2) enhanced for (Java 5) — the everyday workhorse
for (String s : names) use(s);
for (Map.Entry&lt;String, Double&gt; e : prices.entrySet())
    System.out.println(e.getKey() + " = " + e.getValue());

// 3) modern (Java 8+): internal iteration
names.forEach(System.out::println);
names.removeIf(String::isBlank);        // the safe-removal one-liner
prices.forEach((k, v) -&gt; System.out.println(k + " = " + v));</div>
<p>The rule that bites everyone once: mutating a collection inside its own enhanced for throws <code>ConcurrentModificationException</code> — use <code>Iterator.remove()</code> or, better, <code>removeIf</code>. The enhanced for works on any <code>Iterable</code> (you built one in the Modern Java stream) and arrays.</p>`,
docs:[['The Collection interface & iterators — Oracle','https://docs.oracle.com/javase/tutorial/collections/interfaces/collection.html'],['Iterable.forEach — API','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Iterable.html']],
exs:[
{title:'Explicit Iterator: remove while iterating',
prompt:`Write <code>Cleaner</code> with <code>static void dropShort(java.util.List&lt;String&gt; names, int minLen)</code>: iterate with an <b>explicit Iterator</b> (<code>hasNext</code>/<code>next</code>) and remove every name shorter than minLen using <code>it.remove()</code> — not <code>names.remove(...)</code>, which throws ConcurrentModificationException mid-iteration.`,
starter:`import java.util.*;

public class Cleaner {
    static void dropShort(List<String> names, int minLen) {
        // Iterator<String> it = names.iterator(); ...
    }
}`,
tests:[{d:'Gets an explicit Iterator',re:'Iterator<String>\\s+\\w+\\s*=\\s*names\\.iterator\\s*\\(\\s*\\)'},{d:'Classic hasNext/next loop',re:'while\\s*\\(\\s*\\w+\\.hasNext\\s*\\(\\s*\\)\\s*\\)'},{d:'Removes via the iterator',re:'\\w+\\.remove\\s*\\(\\s*\\)'},{d:'Never calls names.remove(...) inside the loop',re:'names\\.remove\\s*\\(',not:true}],
behavior:`1. dropShort(["Jo","Ronald","Al","Maria"], 3) leaves ["Ronald","Maria"]. 2. The list is modified in place (void method). 3. it.remove() removes the element last returned by next() — calling it before any next() would throw IllegalStateException. 4. Zero ConcurrentModificationException risk.`,
hints:['Skeleton: <code>Iterator&lt;String&gt; it = names.iterator(); while (it.hasNext()) { String s = it.next(); ... }</code>','Condition: <code>if (s.length() < minLen) it.remove();</code>','it.remove() is the only mutation the iterator sanctions — that is the entire point of this drill.'],
solution:`import java.util.*;

public class Cleaner {
    static void dropShort(List<String> names, int minLen) {
        Iterator<String> it = names.iterator();
        while (it.hasNext()) {
            String s = it.next();
            if (s.length() < minLen) {
                it.remove();
            }
        }
    }
}`},
{title:'Enhanced for: lists, arrays & map entries',
prompt:`Write <code>Report</code> with <code>static double total(double[] amounts)</code> using an enhanced for over the <b>array</b>, and <code>static String priceList(java.util.Map&lt;String, Double&gt; prices)</code> using an enhanced for over <code>entrySet()</code>, appending lines <code>name: value</code> (one per entry, separated by newline) with a StringBuilder.`,
starter:`import java.util.*;

public class Report {
    static double total(double[] amounts) {
        return 0;
    }

    static String priceList(Map<String, Double> prices) {
        StringBuilder sb = new StringBuilder();
        // for (Map.Entry<...> e : prices.entrySet()) ...
        return sb.toString();
    }
}`,
tests:[{d:'Enhanced for over the array',re:'for\\s*\\(\\s*double\\s+\\w+\\s*:\\s*amounts\\s*\\)'},{d:'Enhanced for over entrySet',re:'for\\s*\\([^)]*Map\\.Entry<String,\\s*Double>[^)]*:\\s*prices\\.entrySet\\s*\\(\\s*\\)\\s*\\)'},{d:'Uses getKey and getValue',re:'getKey\\s*\\(\\s*\\)[\\s\\S]*getValue\\s*\\(\\s*\\)'},{d:'No index-based loop',re:'for\\s*\\(\\s*int\\s+\\w+\\s*=',not:true}],
behavior:`1. total({1.5, 2.5}) == 4.0; total({}) == 0.0. 2. priceList({"apple"=1.0}) contains the line "apple: 1.0". 3. Entries iterate via entrySet — one pass, no separate get() lookups per key. 4. No indexes anywhere: the enhanced for expresses "each element", nothing more.`,
hints:['Arrays work in for-each too: <code>for (double a : amounts) sum += a;</code>','Entry loop: <code>for (Map.Entry&lt;String, Double&gt; e : prices.entrySet())</code>','Append: <code>sb.append(e.getKey()).append(": ").append(e.getValue()).append("\\n");</code>'],
solution:`import java.util.*;

public class Report {
    static double total(double[] amounts) {
        double sum = 0;
        for (double a : amounts) {
            sum += a;
        }
        return sum;
    }

    static String priceList(Map<String, Double> prices) {
        StringBuilder sb = new StringBuilder();
        for (Map.Entry<String, Double> e : prices.entrySet()) {
            sb.append(e.getKey()).append(": ").append(e.getValue()).append("\\n");
        }
        return sb.toString();
    }
}`},
{title:'Modern iteration: forEach & removeIf',
prompt:`Rewrite the classics the modern way in class <code>Modern</code>: <code>static void tidy(java.util.List&lt;String&gt; names)</code> — one <code>removeIf</code> call dropping blank entries (method reference <code>String::isBlank</code>); and <code>static void printAll(java.util.Map&lt;String, Integer&gt; scores)</code> — a single <code>Map.forEach</code> with a two-parameter lambda printing <code>key=value</code>. <b>No for/while loops or Iterators allowed anywhere.</b>`,
starter:`import java.util.*;

public class Modern {
    static void tidy(List<String> names) {
        // one line
    }

    static void printAll(Map<String, Integer> scores) {
        // one forEach
    }
}`,
tests:[{d:'removeIf with a method reference',re:'names\\.removeIf\\s*\\(\\s*String::isBlank\\s*\\)'},{d:'Map.forEach with (k, v) lambda',re:'scores\\.forEach\\s*\\(\\s*\\(\\s*\\w+\\s*,\\s*\\w+\\s*\\)\\s*->'},{d:'Prints key=value',re:'\\+\\s*"="\\s*\\+'},{d:'No loops or Iterators at all',re:'\\b(for|while)\\s*\\(|Iterator',not:true}],
behavior:`1. tidy(["a", " ", "", "b"]) leaves ["a", "b"] — removeIf handles the iterate-and-remove dance internally, safely. 2. printAll({"ron"=10}) prints "ron=10". 3. Each method body is a single statement — compare with exercise 1 of this lesson: same semantics, one line instead of six.`,
hints:['<code>names.removeIf(String::isBlank);</code> — the predicate runs per element; removal is handled for you.','Map.forEach hands you both halves: <code>scores.forEach((k, v) -> System.out.println(k + "=" + v));</code>','If you feel the urge to write a loop here, re-read exercise 1 and appreciate the upgrade.'],
solution:`import java.util.*;

public class Modern {
    static void tidy(List<String> names) {
        names.removeIf(String::isBlank);
    }

    static void printAll(Map<String, Integer> scores) {
        scores.forEach((k, v) -> System.out.println(k + "=" + v));
    }
}`}
]},
{id:'fun3',title:'Methods, overloading, static vs instance',body:`
<p>🌱 <b>Starting from zero:</b> a <b>method</b> is a named recipe — a chunk of instructions you write once, give a name, and then run whenever you like by calling that name. Recipes take ingredients (<i>parameters</i>) and hand back a result (the <i>return value</i>): "greet, given a name, gives back a greeting." Naming recipes is how programs stay readable — instead of one endless scroll of instructions, you compose small named steps. This lesson covers writing them, and one Java wrinkle: whether a recipe belongs to the whole class (static) or to one particular object (instance) — a distinction that will fully click after the objects lesson.</p>
<p><b>Static</b> members belong to the class (one shared copy, no object needed). <b>Instance</b> members belong to each object. <b>Overloading</b> = same method name, different parameter lists — resolved at compile time.</p>
<div class="codeSample" data-hl>public class Counter {
    private int count;              // instance state
    private static int totalMade;   // shared across ALL counters

    public Counter() { totalMade++; }

    public void increment() { count++; }          // needs an object
    public static int total() { return totalMade; } // Counter.total()

    // overloads
    public void add(int n)    { count += n; }
    public void add(int n, int times) { count += n * times; }
}</div>
<p>Rule of thumb: if a method uses no instance fields, it can be static. Utility methods (like <code>Math.max</code>) are static; behavior tied to object state is instance.</p>`,
docs:[['Defining Methods — Oracle','https://docs.oracle.com/javase/tutorial/java/javaOO/methods.html'],['Class vs instance members — Oracle','https://docs.oracle.com/javase/tutorial/java/javaOO/classvars.html']],
ex:{title:'Overloaded Temperature',
prompt:`Write a class <code>Temperature</code> with a private instance field <code>double celsius</code>, a constructor <code>Temperature(double celsius)</code>, an instance method <code>double inFahrenheit()</code> (C × 9/5 + 32), and two <b>overloaded static</b> factory methods: <code>Temperature of(double celsius)</code> and <code>Temperature of(double value, String unit)</code> where unit "F" converts to celsius first ((F − 32) × 5/9).`,
starter:`public class Temperature {
    // field + constructor

    // double inFahrenheit()

    // static Temperature of(double celsius)

    // static Temperature of(double value, String unit)
}`,
tests:[{d:'Private double celsius field',re:'private\\s+(final\\s+)?double\\s+celsius'},{d:'Instance method inFahrenheit',re:'double\\s+inFahrenheit\\s*\\(\\s*\\)'},{d:'Two overloaded static of(...) methods',re:'static\\s+Temperature\\s+of\\s*\\([\\s\\S]*static\\s+Temperature\\s+of\\s*\\('},{d:'Handles the "F" unit',re:'"F"'}],
behavior:`1. new Temperature(100).inFahrenheit() returns 212.0. 2. Temperature.of(0).inFahrenheit() returns 32.0. 3. Temperature.of(212, "F").inFahrenheit() returns ~212.0 (converted to 100C internally). 4. of(value, "C") or unknown unit treats value as celsius.`,
hints:['Constructor: <code>public Temperature(double celsius) { this.celsius = celsius; }</code> — <code>this</code> disambiguates field from parameter.','inFahrenheit: <code>return celsius * 9 / 5.0 + 32;</code> — keep one operand double.','The second of(): if unit.equals("F"), compute <code>(value - 32) * 5 / 9.0</code> and pass it to the constructor; otherwise pass value straight through.'],
solution:`public class Temperature {
    private final double celsius;

    public Temperature(double celsius) {
        this.celsius = celsius;
    }

    public double inFahrenheit() {
        return celsius * 9 / 5.0 + 32;
    }

    public static Temperature of(double celsius) {
        return new Temperature(celsius);
    }

    public static Temperature of(double value, String unit) {
        if ("F".equals(unit)) {
            return new Temperature((value - 32) * 5 / 9.0);
        }
        return new Temperature(value);
    }
}`}},
{id:'fun3b',title:'Constructors: every kind and when to use each',body:`
<p>🌱 <b>Starting from zero:</b> when a new object is created (a new bank account, a new player), someone has to fill in its starting details — no account should exist without an owner. A <b>constructor</b> is the special setup recipe that runs exactly once, at the moment of creation, and its whole job is making sure the object starts life valid and complete. Java gives you several flavors of constructor for different situations; this lesson tours them.</p>
<p>A constructor runs when <code>new</code> creates an object — its one job is to establish a valid initial state. The kinds:</p>
<div class="codeSample" data-hl>public class Account {
    private final String owner;
    private long cents;

    // 1) DEFAULT: if you write NO constructor, the compiler adds a no-arg one.
    //    The moment you write any constructor, the freebie disappears.

    // 2) NO-ARG (explicit): sensible defaults
    public Account() {
        this("unknown", 0);              // 4) CHAINING: this(...) reuses another
    }                                    //    constructor — must be the FIRST line

    // 3) PARAMETERIZED: the workhorse — validate here!
    public Account(String owner, long cents) {
        if (cents &lt; 0) throw new IllegalArgumentException("negative balance");
        this.owner = owner;              // this. disambiguates field from param
        this.cents = cents;
    }

    // 5) COPY constructor: an independent duplicate
    public Account(Account other) {
        this(other.owner, other.cents);
    }
}

// 6) PRIVATE constructor: nobody may 'new' this — used for
class Ids {
    private Ids() {}                             // utility class (all static)
    static String next() { return java.util.UUID.randomUUID().toString(); }
}
Temperature.of(72, "F");                          // ...and static factories (you
                                                  // built these two lessons ago!)</div>
<p>In a subclass, the first line is implicitly <code>super()</code> — if the parent lacks a no-arg constructor you must call <code>super(args)</code> explicitly, first line. Constructors aren't inherited and can't be abstract, final or static. Frameworks care too: JPA entities need a no-arg constructor; Spring injects through the parameterized one.</p>`,
docs:[['Providing constructors — Oracle','https://docs.oracle.com/javase/tutorial/java/javaOO/constructors.html'],['this(...) chaining — Oracle','https://docs.oracle.com/javase/tutorial/java/javaOO/thiskey.html'],['Effective Java: static factories — item summary','https://www.baeldung.com/java-constructors-vs-static-factory-methods']],
exs:[
{title:'Overloading & this(...) chaining',
prompt:`Write <code>Order</code> with private fields <code>String item</code>, <code>int qty</code>, <code>double unitPrice</code> and <b>three chained constructors</b>: <code>(String item, int qty, double unitPrice)</code> — the primary, which validates qty &gt; 0 (<code>IllegalArgumentException</code>) and assigns with <code>this.</code>; <code>(String item, double unitPrice)</code> — chains with qty 1; and a no-arg constructor chaining to <code>("unspecified", 1, 0.0)</code>. The two smaller constructors must contain <b>only</b> the <code>this(...)</code> call.`,
starter:`public class Order {
    private String item;
    private int qty;
    private double unitPrice;

    // primary constructor (validates)

    // (item, unitPrice) -> qty 1

    // no-arg -> ("unspecified", 1, 0.0)
}`,
tests:[{d:'Primary constructor validates qty',re:'Order\\s*\\(\\s*String\\s+item\\s*,\\s*int\\s+qty\\s*,\\s*double\\s+unitPrice\\s*\\)[\\s\\S]*?IllegalArgumentException'},{d:'Uses this. to assign fields',re:'this\\.item\\s*=\\s*item'},{d:'Two-arg constructor chains via this(...)',re:'Order\\s*\\(\\s*String\\s+item\\s*,\\s*double\\s+unitPrice\\s*\\)\\s*\\{\\s*this\\s*\\(\\s*item\\s*,\\s*1\\s*,\\s*unitPrice\\s*\\)\\s*;\\s*\\}'},{d:'No-arg chains with the defaults',re:'this\\s*\\(\\s*"unspecified"\\s*,\\s*1\\s*,\\s*0\\.0\\s*\\)'}],
behavior:`1. new Order("book", 2, 9.99) sets all three fields. 2. new Order("pen", 1.5) has qty 1 — via chaining, so validation in the primary still ran. 3. new Order() gives ("unspecified", 1, 0.0). 4. new Order("x", 0, 1.0) throws. 5. Validation lives in exactly ONE place — that is the point of chaining.`,
hints:['Primary first: validate, then <code>this.item = item;</code> etc.','Chaining call must be line one of the constructor body: <code>this(item, 1, unitPrice);</code> and nothing else.','All roads lead to the primary — defaults funnel through it so its validation guards every path.'],
solution:`public class Order {
    private String item;
    private int qty;
    private double unitPrice;

    public Order(String item, int qty, double unitPrice) {
        if (qty <= 0) throw new IllegalArgumentException("qty must be positive");
        this.item = item;
        this.qty = qty;
        this.unitPrice = unitPrice;
    }

    public Order(String item, double unitPrice) {
        this(item, 1, unitPrice);
    }

    public Order() {
        this("unspecified", 1, 0.0);
    }
}`},
{title:'super(...) & the copy constructor',
prompt:`(1) Write <code>class Vehicle</code> with <code>protected final String vin</code> and only a <code>Vehicle(String vin)</code> constructor (no no-arg!). (2) Write <code>class Car extends Vehicle</code> with <code>private final int doors</code> and constructor <code>Car(String vin, int doors)</code> that must call <code>super(vin)</code> first. (3) Add a <b>copy constructor</b> <code>Car(Car other)</code> that chains to the main one using other's fields, plus a getter <code>int doors()</code>.`,
starter:`class Vehicle {
    protected final String vin;

    // Vehicle(String vin)
}

class Car extends Vehicle {
    private final int doors;

    // Car(String vin, int doors) — super first!

    // Car(Car other) — copy constructor

    // int doors()
}`,
tests:[{d:'Vehicle has only the parameterized constructor',re:'Vehicle\\s*\\(\\s*String\\s+vin\\s*\\)'},{d:'Car calls super(vin) first',re:'Car\\s*\\(\\s*String\\s+vin\\s*,\\s*int\\s+doors\\s*\\)\\s*\\{\\s*super\\s*\\(\\s*vin\\s*\\)\\s*;'},{d:'Copy constructor takes a Car',re:'Car\\s*\\(\\s*Car\\s+other\\s*\\)'},{d:'Copy chains via this(...) with other fields',re:'this\\s*\\(\\s*other\\.vin\\s*,\\s*other\\.doors'},{d:'Fields are final (immutability habit)',re:'final\\s+int\\s+doors'}],
behavior:`1. new Car("VIN1", 4).doors() == 4. 2. Car b = new Car(a) produces an independent copy: same vin and doors, different object. 3. Vehicle has no no-arg constructor, so omitting super(vin) in Car would be a compile error — the exercise proves you know why. 4. Copy constructor reuses the main constructor (one initialization path).`,
hints:['Because Vehicle defines a constructor, its default no-arg is GONE — Car must call super(vin) explicitly, first line.','Copy constructor: <code>Car(Car other) { this(other.vin, other.doors); }</code> — chaining beats duplicating assignments.','protected fields of the superclass are readable from Car — that is how other.vin works.'],
solution:`class Vehicle {
    protected final String vin;

    Vehicle(String vin) {
        this.vin = vin;
    }
}

class Car extends Vehicle {
    private final int doors;

    Car(String vin, int doors) {
        super(vin);
        this.doors = doors;
    }

    Car(Car other) {
        this(other.vin, other.doors);
    }

    int doors() {
        return doors;
    }
}`},
{title:'Private constructors: utilities & named factories',
prompt:`Two classes: (1) <code>final class MathUtil</code> — a utility class: <b>private no-arg constructor</b> (so nobody instantiates it) and <code>static int clamp(int v, int lo, int hi)</code>, which <b>limits v to the inclusive range [lo, hi]</b>: return <code>lo</code> when <code>v &lt; lo</code>, <code>hi</code> when <code>v &gt; hi</code>, otherwise <code>v</code> unchanged — so <code>clamp(15, 0, 10) == 10</code> and <code>clamp(-3, 0, 10) == 0</code>. (2) <code>class Duration2</code> with private final <code>long seconds</code>, a <b>private</b> constructor, and two <b>named static factories</b> that convert their unit to seconds: <code>static Duration2 ofMinutes(long m)</code> (stores m × 60) and <code>static Duration2 ofHours(long h)</code> (stores h × 3600), plus <code>long seconds()</code> returning the stored total. (Same pattern as java.time.Duration — the names document the unit, which a constructor cannot.)`,
starter:`final class MathUtil {
    // private constructor

    static int clamp(int v, int lo, int hi) {
        return 0;
    }
}

class Duration2 {
    private final long seconds;

    // private constructor + two named factories + getter
}`,
tests:[{d:'MathUtil constructor is private',re:'private\\s+MathUtil\\s*\\(\\s*\\)'},{d:'clamp implemented with Math.min/max or ifs',re:'clamp[\\s\\S]*?(Math\\.(min|max)|[<>])'},{d:'Duration2 constructor is private',re:'private\\s+Duration2\\s*\\('},{d:'ofMinutes factory converts',re:'static\\s+Duration2\\s+ofMinutes\\s*\\(\\s*long\\s+\\w+\\s*\\)[\\s\\S]*?60'},{d:'ofHours factory converts',re:'static\\s+Duration2\\s+ofHours\\s*\\(\\s*long\\s+\\w+\\s*\\)[\\s\\S]*?3600'}],
behavior:`1. MathUtil.clamp(15, 0, 10) == 10; clamp(-3, 0, 10) == 0; clamp(5, 0, 10) == 5. 2. Duration2.ofMinutes(2).seconds() == 120; Duration2.ofHours(1).seconds() == 3600. 3. new MathUtil() and new Duration2(...) do not compile from outside — the private constructor is the enforcement. 4. Factory names carry the unit; an overloaded constructor Duration2(long) could not distinguish minutes from hours.`,
hints:['Utility pattern: <code>private MathUtil() {}</code> — combined with final class, instantiation and subclassing are both off.','clamp one-liner: <code>return Math.max(lo, Math.min(hi, v));</code>','Factories call the private constructor with converted values: <code>return new Duration2(m * 60);</code>'],
solution:`final class MathUtil {
    private MathUtil() {}

    static int clamp(int v, int lo, int hi) {
        return Math.max(lo, Math.min(hi, v));
    }
}

class Duration2 {
    private final long seconds;

    private Duration2(long seconds) {
        this.seconds = seconds;
    }

    static Duration2 ofMinutes(long m) {
        return new Duration2(m * 60);
    }

    static Duration2 ofHours(long h) {
        return new Duration2(h * 3600);
    }

    long seconds() {
        return seconds;
    }
}`}
]},
{id:'fun4',title:'Encapsulation: classes done right',body:`
<p>🌱 <b>Starting from zero:</b> think of a vending machine. You interact with buttons and a coin slot; you cannot reach inside and rearrange the cans — and that restriction is exactly why the machine stays reliable. <b>Encapsulation</b> is building your objects the same way: the data inside is off-limits (private), and the only way in is through the buttons the class chooses to offer (its methods) — each of which can refuse nonsense. It is the single most important habit in object-oriented programming, and this lesson shows how Java enforces it.</p>
<p>Encapsulation = fields are <code>private</code>; the class guards its own invariants through methods. Nobody outside can put the object into an invalid state.</p>
<div class="codeSample" data-hl>public class BankAccount {
    private long balanceCents;   // never negative — the class enforces it

    public void deposit(long cents) {
        if (cents &lt;= 0) throw new IllegalArgumentException("deposit must be positive");
        balanceCents += cents;
    }

    public long balance() { return balanceCents; }
}</div>
<p><b>Those keywords — <code>private</code>, <code>public</code> — are access modifiers, and they deserve exact definitions</b>, because they are how a class draws the line between its inside and its outside. Java has four levels, from most to least restrictive:</p>
<ul>
<li><b><code>private</code></b> — visible only <i>inside this class</i>. Not subclasses, not neighbors, nobody. The default choice for every field, and for any helper method that exists only to serve the class internally.</li>
<li><b>package-private</b> (no keyword at all) — visible to every class <i>in the same package</i>. What you get when you write no modifier. Useful for collaborating classes that ship together and for test access, invisible beyond the package boundary.</li>
<li><b><code>protected</code></b> — package-private <i>plus subclasses anywhere</i>. You met it on <code>Account</code>'s <code>protected long cents</code> in the inheritance lesson: it invites subclasses to touch state directly. That invitation is real coupling — every subclass now depends on that field existing forever — so treat protected fields as a deliberate design decision, not a reflex.</li>
<li><b><code>public</code></b> — visible to <i>all code everywhere</i>. This is your API.</li>
</ul>
<div class="codeSample">who can see it?          private   (none)pkg   protected   public
same class                  ✓          ✓           ✓          ✓
same package                ✗          ✓           ✓          ✓
subclass (other package)    ✗          ✗           ✓          ✓
everyone else               ✗          ✗           ✗          ✓</div>
<p><b>The impact is bigger than visibility — it's changeability.</b> Everything <code>public</code> is a promise: other code may now depend on it, so renaming or removing it breaks callers — in a library, forever. Everything <code>private</code> is yours to rewrite tonight without telling anyone. That's why BankAccount above works: <code>balanceCents</code> is private, so the <i>only</i> paths to it are deposit's validation and balance's read — no external code can set it to -50, and the class could switch to a different representation tomorrow without any caller noticing. The working rule: <b>start everything private and widen only when a real caller forces you to</b> — you can always open access later; taking it back is a breaking change.</p>
<p>Validate in constructors and mutators, keep fields <code>final</code> when they never change, and expose the minimum surface. (Money as <code>long</code> cents, never <code>double</code> — floating point can't represent 0.10 exactly.)</p>`,
docs:[['Access Control — Oracle','https://docs.oracle.com/javase/tutorial/java/javaOO/accesscontrol.html'],['Encapsulation — Baeldung','https://www.baeldung.com/java-oop-principles']],
ex:{title:'A safe BankAccount',
prompt:`Implement <code>BankAccount</code>: private <code>long balanceCents</code>; <code>deposit(long cents)</code> throws <code>IllegalArgumentException</code> for amounts &le; 0; <code>withdraw(long cents)</code> throws <code>IllegalArgumentException</code> for amounts &le; 0 and <code>IllegalStateException</code> if it would overdraw; <code>long balance()</code> returns the current balance.`,
starter:`public class BankAccount {
    private long balanceCents;

    public void deposit(long cents) {
        // validate, then add
    }

    public void withdraw(long cents) {
        // validate amount AND sufficient funds
    }

    public long balance() {
        return balanceCents;
    }
}`,
tests:[{d:'deposit validates and throws IllegalArgumentException',re:'deposit[\\s\\S]*?throw\\s+new\\s+IllegalArgumentException'},{d:'withdraw throws IllegalStateException on overdraw',re:'withdraw[\\s\\S]*?throw\\s+new\\s+IllegalStateException'},{d:'Field stays private',re:'private\\s+long\\s+balanceCents'},{d:'No setter exposing raw balance',re:'void\\s+setBalance',not:true}],
behavior:`1. deposit(1000) then balance() == 1000. 2. withdraw(300) then balance() == 700. 3. deposit(0) and deposit(-5) throw IllegalArgumentException. 4. withdraw(999999) on balance 700 throws IllegalStateException and balance stays 700. 5. withdraw(-1) throws IllegalArgumentException.`,
hints:['Guard clause first: <code>if (cents <= 0) throw new IllegalArgumentException("...");</code>','withdraw needs two checks in order: amount valid, then <code>if (cents > balanceCents) throw new IllegalStateException("insufficient funds");</code>','Only mutate the field after all checks pass — that is the whole point of encapsulation.'],
solution:`public class BankAccount {
    private long balanceCents;

    public void deposit(long cents) {
        if (cents <= 0) throw new IllegalArgumentException("deposit must be positive");
        balanceCents += cents;
    }

    public void withdraw(long cents) {
        if (cents <= 0) throw new IllegalArgumentException("withdrawal must be positive");
        if (cents > balanceCents) throw new IllegalStateException("insufficient funds");
        balanceCents -= cents;
    }

    public long balance() {
        return balanceCents;
    }
}`}},
{id:'fun4b',title:'Inheritance with extends',body:`
<p><code>extends</code> creates an <b>is-a</b> relationship: a subclass inherits every field and method of its superclass, then adds to or specializes it. A <code>SavingsAccount</code> <i>is an</i> <code>Account</code> — it gets deposit/balance for free and adds interest.</p>
<div class="codeSample" data-hl>class Account {
    protected long cents;                       // protected = visible to subclasses
    void deposit(long c) { cents += c; }
    long balance() { return cents; }
}

class SavingsAccount extends Account {          // inherits deposit, balance, cents
    private final double rate;
    SavingsAccount(double rate) { this.rate = rate; }

    void addInterest() { cents += (long)(cents * rate); }   // uses inherited field

    @Override
    long balance() {                            // SPECIALIZE: override behavior
        return super.balance() + 1;             // super.x calls the parent version
    }
}</div>
<p>✋ <b>Pause — that <code>@Override</code> is the first <i>annotation</i> you've met in the dojo.</b> Anything starting with <code>@</code> is an annotation: a machine-readable label you attach to code. By itself it changes nothing about what the method does — it's metadata that <i>tools</i> read and act on. <code>@Override</code> is read by the <b>compiler</b>, and it means: "I claim this method replaces one inherited from the superclass — fail the build if it doesn't." That claim has teeth: without it, a typo like <code>balence()</code> silently creates a <i>new</i> method and the parent's version keeps running; with it, the same typo is a compile error at the exact line. That's the annotation pattern in general — state your intent so a machine can verify or act on it. ⚠️ <b>Capitalization matters</b>: an annotation is a named type like a class, and Java is case-sensitive — it's <code>@Override</code>, never <code>@override</code> or <code>@OVERRIDE</code>. The lowercase version isn't a milder warning, it's a compile error (<i>cannot find symbol</i>), because no type with that name exists. Annotation names follow the same UpperCamelCase convention as class names — <code>@Override</code>, <code>@Test</code>, <code>@FunctionalInterface</code>. You'll soon meet annotations read by test runners and frameworks instead of the compiler (<code>@Test</code>, <code>@Service</code>, <code>@WebServlet</code>), and when you're ready to see how they really work — retention, targets, reading them via reflection, building your own — the <b>Time, Testing, Reflection &amp; the JVM</b> stream covers exactly that in its <i>Annotations &amp; reflection</i> and <i>Annotation mastery</i> lessons.</p>
<p>The rules that matter: a class <code>extends</code> <b>exactly one</b> superclass (single inheritance — but it may <code>implements</code> many interfaces); the subclass constructor implicitly calls <code>super()</code> first, or you call <code>super(args)</code> explicitly; <code>@Override</code> replaces a method (the compiler verifies the signature matches); <code>super.method()</code> reaches the parent's version; <code>final</code> on a method or class forbids overriding/extending. An <code>abstract</code> class can't be instantiated and may declare <code>abstract</code> methods subclasses must implement. Prefer shallow hierarchies — deep inheritance chains are a classic maintainability trap ("favor composition over inheritance").</p>`,
docs:[['Inheritance — Oracle','https://docs.oracle.com/javase/tutorial/java/IandI/subclasses.html'],['Overriding & super — Oracle','https://docs.oracle.com/javase/tutorial/java/IandI/super.html'],['Abstract methods & classes','https://docs.oracle.com/javase/tutorial/java/IandI/abstract.html']],
exs:[
{title:'Specialize with extends & super',
prompt:`Given a base <code>class Employee</code> with <code>protected String name</code>, constructor <code>Employee(String name)</code>, and <code>double weeklyPay()</code> returning 1000. Write <code>class Manager extends Employee</code>: a constructor taking name and <code>double bonus</code> that calls <code>super(name)</code>, and an <code>@Override double weeklyPay()</code> that returns <code>super.weeklyPay() + bonus</code>.`,
starter:`class Employee {
    protected String name;
    Employee(String name) { this.name = name; }
    double weeklyPay() { return 1000; }
}

class Manager extends Employee {
    // bonus field, constructor calling super(name), overridden weeklyPay()
}`,
tests:[{d:'Manager extends Employee',re:'class\\s+Manager\\s+extends\\s+Employee'},{d:'Constructor calls super(name)',re:'super\\s*\\(\\s*name\\s*\\)'},{d:'Overrides weeklyPay',re:'@Override\\s*(?:(?:public|protected)\\s+)?double\\s+weeklyPay'},{d:'Reuses parent pay via super',re:'super\\.weeklyPay\\s*\\(\\s*\\)\\s*\\+\\s*bonus'}],
behavior:`1. new Manager("Ada", 500).weeklyPay() == 1500.0. 2. name is inherited and set through super(name). 3. @Override is required — a typo'd signature would fail to compile with it present. 4. super.weeklyPay() reuses the base logic instead of duplicating the 1000.`,
hints:['First line of the constructor must be <code>super(name);</code> — the parent has no no-arg constructor to fall back on.','Store bonus in a field, then override: <code>@Override double weeklyPay() { return super.weeklyPay() + bonus; }</code>','super.weeklyPay() reaches the Employee version even though Manager overrides it.'],
solution:`class Employee {
    protected String name;
    Employee(String name) { this.name = name; }
    double weeklyPay() { return 1000; }
}

class Manager extends Employee {
    private final double bonus;
    Manager(String name, double bonus) {
        super(name);
        this.bonus = bonus;
    }
    @Override
    double weeklyPay() {
        return super.weeklyPay() + bonus;
    }
}`},
{title:'Abstract base class',
prompt:`Write <code>abstract class Shape</code> with an <code>abstract double area()</code> and a concrete <code>String describe()</code> returning <code>"area=" + area()</code>. Then <code>class Square extends Shape</code> with a <code>double side</code> field, constructor, and the required <code>@Override double area()</code> returning side². Prove you understand abstract: Shape must not be instantiable.`,
starter:`abstract class Shape {
    abstract double area();
    String describe() { return "area=" + area(); }
}

class Square extends Shape {
    // add: a double side field and a constructor,
    // then make this return the correct area (replace the 0)
    @Override
    double area() {
        return 0;
    }
}`,
tests:[{d:'Shape is abstract with an abstract method',re:'abstract\\s+class\\s+Shape[\\s\\S]*?abstract\\s+double\\s+area'},{d:'Square extends Shape',re:'class\\s+Square\\s+extends\\s+Shape'},{d:'Implements the abstract area()',re:'@Override\\s*(?:(?:public|protected)\\s+)?double\\s+area\\s*\\(\\s*\\)'},{d:'area returns side squared',re:'side\\s*\\*\\s*side'}],
behavior:`1. new Square(3).area() == 9.0 and describe() returns "area=9.0". 2. describe() is inherited and works via the overridden area() — dynamic dispatch. 3. Shape cannot be instantiated (new Shape() would not compile) — that is what abstract enforces. 4. A Square that failed to implement area() would itself have to be abstract.`,
hints:['The abstract method has no body — just a signature ending in a semicolon.','Square must provide area() or the compiler forces Square to be abstract too.','describe() lives in the base and calls area() — at runtime that resolves to Square.area() (polymorphism).'],
solution:`abstract class Shape {
    abstract double area();
    String describe() { return "area=" + area(); }
}

class Square extends Shape {
    private final double side;
    Square(double side) { this.side = side; }
    @Override
    double area() { return side * side; }
}`}
]},
{id:'fun5',title:'Inheritance, interfaces & polymorphism',body:`
<p>An <code>interface</code> is a contract; a class <code>implements</code> it. A class <code>extends</code> one superclass but can implement many interfaces. <b>Polymorphism</b>: code written against the interface works with any implementation — the JVM dispatches to the actual object's method at runtime.</p>
<div class="codeSample" data-hl>interface Shape {
    double area();
    default String describe() { return "shape with area " + area(); }
}

class Circle implements Shape {
    private final double r;
    Circle(double r) { this.r = r; }
    @Override public double area() { return Math.PI * r * r; }
}

Shape s = new Circle(2);   // interface type, concrete object
s.area();                  // runtime dispatch → Circle.area()</div>
<p><b>Polymorphism deserves a slower look — it is the core payoff of object orientation.</b> The word means "many forms": <i>one</i> piece of code, written against <i>one</i> type, produces <i>different behavior</i> depending on which concrete object is actually there. Two types are in play in <code>Shape s = new Circle(2)</code>: the <b>declared type</b> (<code>Shape</code>) decides what you're <i>allowed to call</i> — the compiler checks against it; the <b>runtime type</b> (<code>Circle</code>) decides <i>what actually runs</i> — the JVM looks at the real object at the moment of the call and dispatches to its override. That lookup is called <b>dynamic dispatch</b>, and it happens on every non-static, non-final method call in Java.</p>
<p>Why it matters is best seen in a loop:</p>
<div class="codeSample" data-hl>Shape[] shapes = { new Circle(2), new Rectangle(3, 4), new Circle(1) };
double total = 0;
for (Shape s : shapes) {
    total += s.area();     // SAME line of code — three different methods run
}</div>
<p>That loop knows nothing about circles or rectangles — and that ignorance is the feature. Add a <code>Triangle implements Shape</code> tomorrow and the loop handles it <i>without being touched</i>: behavior was extended without modifying existing code (you'll meet this again as the open/closed principle, and it's why <code>totalArea(Shape[])</code> in the exercise never needs an <code>if (s instanceof Circle)</code> chain — the dispatch IS the branching). The alternative — a switch over types — must be found and edited everywhere, every time a type is added.</p>
<p>One disambiguation, since the word gets overloaded (pun intended): what this lesson shows is <b>subtype polymorphism</b> — the "real" one people mean by default. Java has two cousins: <b>overloading</b> (same method name, different parameter lists — resolved by the <i>compiler</i> from the declared argument types, no runtime lookup) and <b>generics</b> (<code>List&lt;T&gt;</code> — one class parameterized over many types, coming up in the generics lessons). Keeping the three apart is a classic interview question and an everyday reading skill.</p>
<p>Prefer interfaces over concrete inheritance for flexibility. Always mark overrides with <code>@Override</code> — the compiler then catches signature typos.</p>`,
docs:[['Interfaces — Oracle','https://docs.oracle.com/javase/tutorial/java/IandI/createinterface.html'],['Polymorphism — Oracle','https://docs.oracle.com/javase/tutorial/java/IandI/polymorphism.html']],
ex:{title:'Shapes, polymorphically',
prompt:`Define interface <code>Shape</code> with <code>double area()</code>. Implement <code>Circle(double radius)</code> (&pi;r²) and <code>Rectangle(double w, double h)</code> (w×h), both using <code>@Override</code>. Add a class <code>Geometry</code> with <code>static double totalArea(Shape[] shapes)</code> summing areas polymorphically.`,
starter:`interface Shape {
    double area();
}

class Circle implements Shape {
    // add: a radius field + constructor, then return the circle's area (replace the 0)
    @Override
    public double area() {
        return 0;
    }
}

class Rectangle implements Shape {
    // add: width/height fields + constructor, then return the area (replace the 0)
    @Override
    public double area() {
        return 0;
    }
}

class Geometry {
    static double totalArea(Shape[] shapes) {
        return 0; // sum via the interface
    }
}`,
tests:[{d:'Circle implements Shape',re:'class\\s+Circle\\s+implements\\s+Shape'},{d:'Rectangle implements Shape',re:'class\\s+Rectangle\\s+implements\\s+Shape'},{d:'Uses @Override',re:'@Override'},{d:'totalArea loops over shapes calling area()',re:'totalArea[\\s\\S]*?\\.area\\s*\\(\\s*\\)'}],
behavior:`1. new Circle(1).area() ≈ 3.14159. 2. new Rectangle(2,3).area() == 6.0. 3. Geometry.totalArea(new Shape[]{new Circle(1), new Rectangle(2,3)}) ≈ 9.14159. 4. totalArea never checks concrete types (no instanceof) — pure polymorphism.`,
hints:['Circle: store radius in a private final field via the constructor; <code>area()</code> returns <code>Math.PI * radius * radius</code>.','Annotate each implementation: <code>@Override public double area() {...}</code>.','totalArea: enhanced for loop — <code>for (Shape s : shapes) sum += s.area();</code> — no casts, no instanceof.'],
solution:`interface Shape {
    double area();
}

class Circle implements Shape {
    private final double radius;
    Circle(double radius) { this.radius = radius; }
    @Override public double area() { return Math.PI * radius * radius; }
}

class Rectangle implements Shape {
    private final double w, h;
    Rectangle(double w, double h) { this.w = w; this.h = h; }
    @Override public double area() { return w * h; }
}

class Geometry {
    static double totalArea(Shape[] shapes) {
        double sum = 0;
        for (Shape s : shapes) {
            sum += s.area();
        }
        return sum;
    }
}`}},
{id:'fun6',title:'Collections & generics',body:`
<p>🌱 <b>Starting from zero:</b> three containers cover most of programming. A <b>List</b> is a shopping list — items in order, repeats allowed. A <b>Set</b> is a guest list — order optional, but nobody appears twice. A <b>Map</b> is a phone book — look something up by name and get its entry. Java ships all three ready-made, and the angle brackets (like <code>List&lt;String&gt;</code>) are labels declaring what the container holds. Learn to pick the right container for the job and half of everyday coding becomes filling in the other half.</p>
<p>The core interfaces: <code>List</code> (ordered, duplicates), <code>Set</code> (unique), <code>Map</code> (key→value). Generics (<code>List&lt;String&gt;</code>) make them type-safe at compile time. Program to the interface, choose the implementation:</p>
<div class="codeSample" data-hl>List&lt;String&gt; names = new ArrayList&lt;&gt;();      // fast random access
Set&lt;String&gt;  seen  = new HashSet&lt;&gt;();        // O(1) contains, no order
Map&lt;String,Integer&gt; freq = new HashMap&lt;&gt;();  // key → value

freq.merge("java", 1, Integer::sum);         // count occurrences
for (Map.Entry&lt;String,Integer&gt; e : freq.entrySet())
    System.out.println(e.getKey() + " = " + e.getValue());

List.of(1, 2, 3);        // immutable literal (Java 9+)
new TreeSet&lt;&gt;(names);    // sorted unique</div>
<p><code>TreeSet</code>/<code>TreeMap</code> keep sorted order; <code>LinkedHashMap</code> keeps insertion order. Generic methods declare their own type parameter: <code>static &lt;T&gt; T first(List&lt;T&gt; list)</code>.</p>`,
docs:[['Collections Trail — Oracle','https://docs.oracle.com/javase/tutorial/collections/index.html'],['Generics — dev.java','https://dev.java/learn/generics/']],
ex:{title:'Word frequency',
prompt:`Write class <code>WordStats</code> with <code>static Map&lt;String,Integer&gt; frequencies(List&lt;String&gt; words)</code> returning how often each word appears (case-insensitive: lowercase the keys), and <code>static Set&lt;String&gt; uniqueSorted(List&lt;String&gt; words)</code> returning the distinct lowercased words in alphabetical order.`,
starter:`import java.util.*;

public class WordStats {
    static Map<String, Integer> frequencies(List<String> words) {
        return null; // build a HashMap of counts
    }

    static Set<String> uniqueSorted(List<String> words) {
        return null; // hint: which Set keeps sorted order?
    }
}`,
tests:[{d:'frequencies builds a Map',re:'new\\s+(Hash|Tree|LinkedHash)Map'},{d:'uniqueSorted uses TreeSet (sorted set)',re:'new\\s+TreeSet'},{d:'Lowercases words',re:'toLowerCase\\s*\\('},{d:'Counts via merge / getOrDefault / containsKey',re:'(merge|getOrDefault|containsKey)'}],
behavior:`1. frequencies(List.of("Java","java","Git")) returns {java=2, git=1}. 2. uniqueSorted(List.of("b","A","b")) returns [a, b] in that order. 3. Both handle empty lists (empty results, no exceptions).`,
hints:['Loop the list; for counting use <code>map.merge(w.toLowerCase(), 1, Integer::sum)</code> or getOrDefault + put.','A <code>TreeSet</code> is a Set that iterates in sorted order — perfect for uniqueSorted.','uniqueSorted can be 3 lines: create TreeSet, loop-add lowercased words, return it.'],
solution:`import java.util.*;

public class WordStats {
    static Map<String, Integer> frequencies(List<String> words) {
        Map<String, Integer> freq = new HashMap<>();
        for (String w : words) {
            freq.merge(w.toLowerCase(), 1, Integer::sum);
        }
        return freq;
    }

    static Set<String> uniqueSorted(List<String> words) {
        Set<String> out = new TreeSet<>();
        for (String w : words) {
            out.add(w.toLowerCase());
        }
        return out;
    }
}`}}
,
{id:'enm1',title:'Enums in depth: fields, methods & strategy',body:`
<p>🌱 <b>Starting from zero:</b> some values come from a short fixed menu: days of the week, sizes S/M/L, shipping speeds. You COULD store them as free text, but then nothing stops "Tuseday" from sneaking in. An <b>enum</b> is Java\u0027s multiple-choice type: you declare the complete list of allowed values once, and the compiler guarantees no other value ever appears. Even better, each choice can carry its own data and behavior — which turns out to be quietly powerful.</p>
<p>A Java enum is a full class with a fixed set of instances. Each constant can carry <b>fields</b> (set via a private constructor), expose <b>methods</b>, and even override methods <b>per constant</b> — which turns an enum into a strategy table with exhaustive switch support for free.</p>
<div class="codeSample">enum Op {
    ADD("+")  { double apply(double a, double b) { return a + b; } },
    MUL("*")  { double apply(double a, double b) { return a * b; } };

    private final String symbol;
    Op(String symbol) { this.symbol = symbol; }
    String symbol() { return symbol; }
    abstract double apply(double a, double b);   // each constant must implement
}</div>
<ul>
<li><b>Built-ins</b>: <code>values()</code> (all constants, in declaration order), <code>valueOf("ADD")</code> (throws on unknown names), <code>name()</code>, <code>ordinal()</code> — never persist <code>ordinal()</code>; reordering constants silently corrupts stored data.</li>
<li><b>EnumMap / EnumSet</b>: specialized, array-backed collections keyed by enum — faster and smaller than HashMap/HashSet. <code>new EnumMap&lt;&gt;(Op.class)</code>, <code>EnumSet.of(Op.ADD)</code>, <code>EnumSet.allOf(Op.class)</code>.</li>
<li><b>Singleton</b>: a one-constant enum is the most robust singleton in Java — serialization- and reflection-proof (Effective Java, Item 3).</li>
</ul>`,
docs:[['Enum types — dev.java','https://dev.java/learn/classes-objects/enums/'],['EnumMap — API','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/EnumMap.html'],['EnumSet — API','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/EnumSet.html']],
ex:{title:'Enum as a strategy table',
prompt:`Build enum <code>Shipping</code> with constants <code>STANDARD</code>, <code>EXPRESS</code>, <code>OVERNIGHT</code>. Each carries a <code>double baseFee</code> (4.99, 9.99, 24.99) via a private constructor, and each implements an <code>abstract double cost(double weightKg)</code>: STANDARD = base + 0.5/kg, EXPRESS = base + 1.0/kg, OVERNIGHT = base + 2.5/kg. Add <code>static double cheapest(double weightKg)</code> that streams <code>values()</code> and returns the minimum cost.`,
starter:`public enum Shipping {
    // 1. three constants, each with a fee and its own cost(...) body

    // 2. field + private constructor + abstract double cost(double weightKg)

    static double cheapest(double weightKg) {
        // 3. min over values()
        return 0;
    }
}`,
tests:[{d:'Enum with the three constants',re:'enum\\s+Shipping.*STANDARD.*EXPRESS.*OVERNIGHT'},{d:'Constructor stores the base fee',re:'Shipping\\s*\\(\\s*double\\s+\\w+\\s*\\)'},{d:'Abstract per-constant method',re:'abstract\\s+double\\s+cost\\s*\\(\\s*double\\s+\\w+\\s*\\)'},{d:'Constants provide their own bodies',re:'STANDARD\\s*\\(\\s*4\\.99\\s*\\)\\s*\\{'},{d:'cheapest iterates values()',re:'values\\s*\\(\\s*\\)'}],
behavior:`1. Shipping.STANDARD.cost(2) == 5.99. 2. Shipping.OVERNIGHT.cost(2) == 29.99. 3. cheapest(2) == 5.99 (STANDARD wins for light parcels). 4. Each constant has its own cost body — no switch statement anywhere. 5. Compiles with a private (or default) enum constructor.`,
hints:['Constant-with-body syntax: <code>STANDARD(4.99) { double cost(double kg) { return baseFee + 0.5 * kg; } },</code>','The shared members come after the constants: <code>private final double baseFee; Shipping(double baseFee) { this.baseFee = baseFee; } abstract double cost(double weightKg);</code>','cheapest: <code>double best = Double.MAX_VALUE; for (Shipping s : values()) best = Math.min(best, s.cost(weightKg)); return best;</code> — or a stream with min().'],
solution:`public enum Shipping {
    STANDARD(4.99)  { double cost(double kg) { return baseFee + 0.5 * kg; } },
    EXPRESS(9.99)   { double cost(double kg) { return baseFee + 1.0 * kg; } },
    OVERNIGHT(24.99){ double cost(double kg) { return baseFee + 2.5 * kg; } };

    final double baseFee;
    Shipping(double baseFee) { this.baseFee = baseFee; }
    abstract double cost(double weightKg);

    static double cheapest(double weightKg) {
        double best = Double.MAX_VALUE;
        for (Shipping s : values()) {
            best = Math.min(best, s.cost(weightKg));
        }
        return best;
    }
}`}},
{id:'ctr1',title:'The equals / hashCode / toString contracts',body:`
<p>🌱 <b>Starting from zero:</b> when are two things "the same"? Two printouts of the same photo are equal in content but are not one object; identical twins are equal-looking but different people. Java needs YOUR answer to this question for every class you write, because its containers ask it constantly — "is this key already in the map?", "does the set contain this?". Three small methods are how a class answers — equals (are we the same in content?), hashCode (a quick fingerprint used for fast lookup), toString (how do I describe myself in print?) — and this lesson teaches the rules that keep the answers honest.</p>
<p>Half the collections library only works if your classes honor three contracts from <code>Object</code>. Get them wrong and HashMap "loses" your keys, HashSet holds duplicates, and lists can't find elements.</p>
<ul>
<li><b>equals</b> must be reflexive, symmetric, transitive, consistent, and return false for null. The signature is <code>equals(Object)</code> — overloading with your own type creates a second, unrelated method the collections never call.</li>
<li><b>hashCode</b>: if <code>a.equals(b)</code> then <code>a.hashCode() == b.hashCode()</code> — <i>always override them together</i>. Equal objects landing in different hash buckets is the classic "my key disappeared" bug.</li>
<li><b>toString</b>: for humans and logs. Make it cheap and unambiguous: <code>Money[amount=12.50, currency=EUR]</code>.</li>
<li><b>Comparable</b>: <code>compareTo</code> should be <i>consistent with equals</i> (<code>compareTo == 0</code> ⇔ <code>equals</code>) — TreeSet/TreeMap use compareTo for equality, so inconsistency changes what "duplicate" means between HashSet and TreeSet.</li>
</ul>
<div class="codeSample">@Override public boolean equals(Object o) {
    if (this == o) return true;                     // fast path
    if (!(o instanceof Money m)) return false;      // pattern variable, handles null
    return cents == m.cents &amp;&amp; currency.equals(m.currency);
}
@Override public int hashCode() { return Objects.hash(cents, currency); }
@Override public String toString() { return "Money[" + cents + " " + currency + "]"; }</div>
<p><b>Records write all of this for you</b> — field-by-field equals, hashCode, toString. Use a record when the type is plain immutable data; write the methods by hand only when identity is more subtle than "all fields equal".</p>`,
docs:[['Object.equals — API','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Object.html#equals(java.lang.Object)'],['Objects.hash — API','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Objects.html'],['Comparable — API','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Comparable.html']],
ex:{title:'A well-behaved value class',
prompt:`Write <code>Version</code> (fields <code>int major, minor</code>) implementing <code>Comparable&lt;Version&gt;</code>: (1) <code>equals(Object)</code> using the <code>instanceof</code> pattern with the fast <code>this == o</code> path, (2) <code>hashCode()</code> via <code>Objects.hash</code>, (3) <code>toString()</code> returning like <code>1.4</code>, (4) <code>compareTo</code> by major then minor (use <code>Integer.compare</code>), consistent with equals. Mark all four <code>@Override</code> where applicable.`,
starter:`import java.util.Objects;

public class Version implements Comparable<Version> {
    private final int major;
    private final int minor;

    public Version(int major, int minor) {
        this.major = major;
        this.minor = minor;
    }

    // 1. equals(Object)   2. hashCode()   3. toString()

    // 4. replace this stub: order by major first, then minor (stay consistent with equals)
    @Override
    public int compareTo(Version other) {
        return 0;
    }
}`,
tests:[{d:'Overrides equals(Object) — not an overload',re:'boolean\\s+equals\\s*\\(\\s*Object\\s+\\w+\\s*\\)'},{d:'Fast identity path this == o',re:'this\\s*==\\s*\\w+'},{d:'instanceof check (null-safe)',re:'instanceof\\s+Version'},{d:'hashCode via Objects.hash',re:'Objects\\.hash\\s*\\('},{d:'Implements compareTo(Version)',re:'int\\s+compareTo\\s*\\(\\s*Version\\s+\\w+\\s*\\)'},{d:'Uses @Override',re:'@Override'}],
behavior:`1. new Version(1,4).equals(new Version(1,4)) is true; equals(null) and equals("1.4") are false. 2. Equal versions produce equal hashCodes. 3. toString() of Version(1,4) is "1.4". 4. compareTo: (1,4) < (2,0), (2,1) > (2,0), and compareTo == 0 exactly when equals is true. 5. Works correctly as a HashMap key and inside TreeSet.`,
hints:['equals skeleton: <code>if (this == o) return true; if (!(o instanceof Version v)) return false; return major == v.major &amp;&amp; minor == v.minor;</code>','hashCode is one line: <code>return Objects.hash(major, minor);</code> — always paired with equals.','compareTo: <code>int c = Integer.compare(major, o.major); return c != 0 ? c : Integer.compare(minor, o.minor);</code>'],
solution:`import java.util.Objects;

public class Version implements Comparable<Version> {
    private final int major;
    private final int minor;

    public Version(int major, int minor) {
        this.major = major;
        this.minor = minor;
    }

    @Override public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Version v)) return false;
        return major == v.major && minor == v.minor;
    }

    @Override public int hashCode() {
        return Objects.hash(major, minor);
    }

    @Override public String toString() {
        return major + "." + minor;
    }

    @Override public int compareTo(Version o) {
        int c = Integer.compare(major, o.major);
        return c != 0 ? c : Integer.compare(minor, o.minor);
    }
}`}},
{id:'big1',title:'BigDecimal & precise numbers',body:`
<p><code>0.1 + 0.2 != 0.3</code> in any binary floating-point language — doubles cannot represent most decimal fractions. For money and anything regulatory, Java's answer is <code>BigDecimal</code>: exact decimal arithmetic with explicit rounding. (The lightweight alternative you've seen in this dojo — <code>long</code> cents — is fine inside one service; BigDecimal is the tool when you need scale, division, rates and interop.)</p>
<ul>
<li><b>Creation</b>: <code>new BigDecimal("0.1")</code> or <code>BigDecimal.valueOf(0.1)</code> — <b>never</b> <code>new BigDecimal(0.1)</code>, which faithfully preserves the double's error: 0.1000000000000000055511151231257827…</li>
<li><b>Scale &amp; rounding</b>: every value has a scale (digits after the point). Division must be told how to round: <code>a.divide(b, 2, RoundingMode.HALF_UP)</code> — without it, 1/3 throws <code>ArithmeticException</code>. Finance default is <code>HALF_EVEN</code> ("banker's rounding"); tills usually use <code>HALF_UP</code>.</li>
<li><b>equals vs compareTo</b>: <code>equals</code> compares scale too — <code>1.0</code> and <code>1.00</code> are <i>not equal</i> but <code>compareTo</code> says 0. Compare money with <code>compareTo</code>, and think twice before using BigDecimal as a HashMap key.</li>
<li><b>Immutable</b>: every operation returns a new object — <code>total.add(x)</code> alone does nothing; reassign: <code>total = total.add(x)</code>.</li>
</ul>
<div class="codeSample">BigDecimal price = new BigDecimal("19.99");
BigDecimal qty   = BigDecimal.valueOf(3);
BigDecimal net   = price.multiply(qty);                          // 59.97
BigDecimal vat   = net.multiply(new BigDecimal("0.19"))
                      .setScale(2, RoundingMode.HALF_EVEN);      // 11.39
net.add(vat);            // ⚠ result thrown away — BigDecimal is immutable
BigDecimal gross = net.add(vat);                                 // 71.36</div>`,
docs:[['BigDecimal — API','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/math/BigDecimal.html'],['RoundingMode — API','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/math/RoundingMode.html']],
ex:{title:'An exact invoice',
prompt:`Write <code>Invoice</code> with <code>static BigDecimal gross(String unitPrice, int quantity, String vatRate)</code> returning the <b>gross total: unitPrice × quantity × (1 + vatRate)</b> — e.g. gross("19.99", 3, "0.19") == 71.36. Build the unit price and rate from the <b>String</b> constructor, multiply by quantity (<code>BigDecimal.valueOf(quantity)</code>), add the VAT portion, and return the total scaled to 2 with <code>RoundingMode.HALF_EVEN</code>. Also add <code>static boolean same(BigDecimal a, BigDecimal b)</code> returning true when the two are <b>numerically equal ignoring scale</b> (1.0 vs 1.00 → true). Do <b>not</b> use the double constructor anywhere.`,
starter:`import java.math.BigDecimal;
import java.math.RoundingMode;

public class Invoice {
    static BigDecimal gross(String unitPrice, int quantity, String vatRate) {
        // net = price * qty;  gross = net + net * rate;  scale 2, HALF_EVEN
        return null;
    }

    static boolean same(BigDecimal a, BigDecimal b) {
        // 1.0 and 1.00 must count as the same amount
        return false;
    }
}`,
tests:[{d:'Uses the String constructor',re:'new\\s+BigDecimal\\s*\\(\\s*\\w+\\s*\\)|new\\s+BigDecimal\\s*\\(\\s*"'},{d:'Never the double constructor (precision trap)',re:'new\\s+BigDecimal\\s*\\(\\s*[0-9]+\\.[0-9]',not:true},{d:'Quantity via BigDecimal.valueOf',re:'BigDecimal\\.valueOf\\s*\\(\\s*quantity\\s*\\)'},{d:'Explicit scale + HALF_EVEN',re:'setScale\\s*\\(\\s*2\\s*,\\s*RoundingMode\\.HALF_EVEN\\s*\\)'},{d:'same() uses compareTo, not equals',re:'compareTo\\s*\\(\\s*\\w+\\s*\\)\\s*==\\s*0'}],
behavior:`1. gross("19.99", 3, "0.19") returns 71.36 (net 59.97, VAT 11.3943 → banker's rounding). 2. gross("10.00", 1, "0.00") returns 10.00 with scale 2. 3. same(new BigDecimal("1.0"), new BigDecimal("1.00")) is true even though equals() would say false. 4. No double ever enters the computation.`,
hints:['Start: <code>BigDecimal price = new BigDecimal(unitPrice); BigDecimal rate = new BigDecimal(vatRate);</code> — Strings preserve exactly what was written.','Chain it: <code>BigDecimal net = price.multiply(BigDecimal.valueOf(quantity)); return net.add(net.multiply(rate)).setScale(2, RoundingMode.HALF_EVEN);</code>','same is one line: <code>return a.compareTo(b) == 0;</code> — compareTo ignores scale, equals does not.'],
solution:`import java.math.BigDecimal;
import java.math.RoundingMode;

public class Invoice {
    static BigDecimal gross(String unitPrice, int quantity, String vatRate) {
        BigDecimal price = new BigDecimal(unitPrice);
        BigDecimal rate  = new BigDecimal(vatRate);
        BigDecimal net   = price.multiply(BigDecimal.valueOf(quantity));
        return net.add(net.multiply(rate)).setScale(2, RoundingMode.HALF_EVEN);
    }

    static boolean same(BigDecimal a, BigDecimal b) {
        return a.compareTo(b) == 0;
    }
}`}},
{id:'str1',title:'String mastery: pool, builders & formatting',body:`
<p>🌱 <b>Starting from zero:</b> text in Java — names, messages, file contents — lives in <b>String</b> objects, and Strings have one famous personality trait: they never change. "Modifying" a String actually manufactures a brand-new one, like getting a fresh printout instead of scribbling on the original. That design makes Strings safe to share everywhere — and it means building big text by repeated gluing is wasteful, which is why Java offers a dedicated workbench (StringBuilder) for assembly. This lesson covers both, plus formatting.</p>
<p>Strings are <b>immutable</b>: every "modification" allocates a new object. That enables the <b>string pool</b> (identical literals share one instance — which is why <code>==</code> sometimes <i>seems</i> to work and then betrays you; always <code>equals()</code>) and makes strings safe as keys and across threads.</p>
<ul>
<li><b>Concatenation</b>: a single expression of <code>+</code> is fine (the compiler optimizes it). Concatenating <i>in a loop</i> is O(n²) — each pass copies everything so far. Use <b>StringBuilder</b>: <code>sb.append(x)</code>, then one <code>sb.toString()</code>.</li>
<li><b>Formatting</b>: <code>String.format("%s costs %.2f", name, price)</code> — or <code>"%.2f".formatted(price)</code>. <code>%s %d %.2f %n</code> cover 95% of use; <code>%,d</code> adds thousands separators.</li>
<li><b>Text blocks</b> (Java 15+): <code>"""..."""</code> for multi-line strings — JSON, SQL, HTML — with incidental indentation stripped.</li>
<li><b>The everyday toolkit</b>: <code>join</code>, <code>split</code> (regex!), <code>strip</code> (Unicode-aware trim), <code>isBlank</code>, <code>repeat</code>, <code>contains</code>, <code>startsWith</code>, <code>lines()</code>, <code>chars()</code>.</li>
</ul>
<div class="codeSample">// O(n): one builder, one final String
StringBuilder sb = new StringBuilder();
for (String part : parts) {
    if (sb.length() &gt; 0) sb.append(", ");
    sb.append(part);
}
String joined = sb.toString();

String same = String.join(", ", parts);        // the shortcut for exactly this

String json = """
    { "name": "%s", "score": %.1f }
    """.formatted("Ada", 97.5);</div>`,
docs:[['String — API','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/String.html'],['StringBuilder — API','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/StringBuilder.html'],['Text blocks — dev.java','https://dev.java/learn/language-basics/text-blocks/']],
ex:{title:'Receipt builder',
prompt:`Write <code>Receipt</code> with <code>static String render(String[] items, double[] prices)</code>: use a <b>StringBuilder</b> in a loop to append one line per item formatted with <code>String.format("%-10s %8.2f%n", item, price)</code>, then append a separator line of 19 dashes using <code>"-".repeat(19)</code> and a total line with the same numeric format. Compare strings nowhere with <code>==</code>.`,
starter:`public class Receipt {
    static String render(String[] items, double[] prices) {
        // 1. StringBuilder + loop with String.format("%-10s %8.2f%n", ...)
        // 2. "-".repeat(19) separator, then the TOTAL line
        return null;
    }
}`,
tests:[{d:'Uses StringBuilder (not loop concatenation)',re:'new\\s+StringBuilder\\s*\\('},{d:'Appends in a loop',re:'(for|while)\\s*\\(.*append'},{d:'Formats columns with String.format',re:'String\\.format\\s*\\(\\s*"%-10s\\s+%8\\.2f%n"'},{d:'Separator via repeat()',re:'"-"\\.repeat\\s*\\(\\s*19\\s*\\)'},{d:'Single final toString()',re:'\\.toString\\s*\\(\\s*\\)'}],
behavior:`1. render(new String[]{"coffee","bagel"}, new double[]{3.50,2.25}) contains a line "coffee" padded to 10 chars then 3.50 right-aligned in 8. 2. A dashes line of exactly 19 '-'. 3. A TOTAL line showing 5.75 in the same format. 4. Runs in O(total length) — one builder, no s += in the loop.`,
hints:['Track the sum while you loop: <code>double total = 0; for (int i = 0; i &lt; items.length; i++) { sb.append(String.format("%-10s %8.2f%n", items[i], prices[i])); total += prices[i]; }</code>','<code>%-10s</code> = left-pad name to 10; <code>%8.2f</code> = right-align price, 2 decimals; <code>%n</code> = platform newline.','Finish: <code>sb.append("-".repeat(19)).append(String.format("%n%-10s %8.2f%n", "TOTAL", total)); return sb.toString();</code>'],
solution:`public class Receipt {
    static String render(String[] items, double[] prices) {
        StringBuilder sb = new StringBuilder();
        double total = 0;
        for (int i = 0; i < items.length; i++) {
            sb.append(String.format("%-10s %8.2f%n", items[i], prices[i]));
            total += prices[i];
        }
        sb.append("-".repeat(19));
        sb.append(String.format("%n%-10s %8.2f%n", "TOTAL", total));
        return sb.toString();
    }
}`}},
{id:'inr1',title:'Nested, inner & anonymous classes',body:`
<p>Classes can live inside classes — four flavors, each with a job:</p>
<ul>
<li><b>Static nested</b> — <code>static class Node</code>. No hidden reference to the outer instance; just a namespaced class. <i>Default choice</i>: helpers, builders, linked-list nodes. (You built these in the data-structures stream.)</li>
<li><b>Inner (non-static)</b> — carries a hidden <code>Outer.this</code> reference. Use only when the object genuinely needs its parent (an <code>Iterator</code> over its collection). The hidden reference is a classic <b>memory-leak</b> source: an inner class handed to a long-lived listener keeps the whole outer object alive.</li>
<li><b>Local</b> — declared inside a method; rare, but handy for a named throwaway type.</li>
<li><b>Anonymous</b> — <code>new Interface() { ... }</code>: declaration + instantiation in one expression. Pre-lambda Java used these everywhere; today, a lambda beats an anonymous class for functional interfaces, but anonymous classes still win when you must override <i>multiple</i> methods or hold state.</li>
</ul>
<div class="codeSample">List&lt;String&gt; names = new ArrayList&lt;&gt;(List.of("Ada", "Al", "Maria"));

// anonymous class (multi-method interfaces, or pre-Java-8 code)
names.sort(new Comparator&lt;String&gt;() {
    @Override public int compare(String a, String b) {
        return Integer.compare(a.length(), b.length());
    }
});

// same thing as a lambda — functional interface, one method
names.sort((a, b) -&gt; Integer.compare(a.length(), b.length()));</div>
<p><b>Capture rule</b>: local and anonymous classes (and lambdas) can only read local variables that are <i>effectively final</i> — assigned once. The workaround for a mutable counter is a one-element array or <code>AtomicInteger</code>; the better fix is usually restructuring.</p>`,
docs:[['Nested classes — dev.java','https://dev.java/learn/classes-objects/nested-classes/'],['Anonymous classes — Oracle tutorial','https://docs.oracle.com/javase/tutorial/java/javaOO/anonymousclasses.html']],
ex:{title:'Three flavors, one file',
prompt:`Write <code>Playlist</code>: (1) a <b>static nested</b> class <code>Track</code> (fields <code>String title; int seconds</code>, constructor). (2) A method <code>Comparator&lt;Track&gt; byLength()</code> returning an <b>anonymous class</b> implementing <code>Comparator&lt;Track&gt;</code> comparing by seconds with <code>Integer.compare</code>. (3) A method <code>Comparator&lt;Track&gt; byTitle()</code> returning the same idea as a <b>lambda</b> using <code>compareTo</code> on titles.`,
starter:`import java.util.Comparator;

public class Playlist {
    // 1. give this nested class a String title and int seconds (+ constructor)
    static class Track {
    }

    Comparator<Track> byLength() {
        // 2. anonymous  new Comparator<Track>() { ... } comparing by seconds
        return null;
    }

    Comparator<Track> byTitle() {
        // 3. lambda
        return null;
    }
}`,
tests:[{d:'Track is a static nested class',re:'static\\s+class\\s+Track'},{d:'byLength returns an anonymous Comparator',re:'new\\s+Comparator<\\s*Track\\s*>\\s*\\(\\s*\\)\\s*\\{'},{d:'Anonymous class overrides compare',re:'int\\s+compare\\s*\\(\\s*Track\\s+\\w+\\s*,\\s*Track\\s+\\w+\\s*\\)'},{d:'Compares seconds with Integer.compare',re:'Integer\\.compare\\s*\\(\\s*\\w+\\.seconds\\s*,\\s*\\w+\\.seconds\\s*\\)'},{d:'byTitle is a lambda',re:'byTitle.*->.*compareTo'}],
behavior:`1. byLength().compare(shortTrack, longTrack) < 0 when shortTrack.seconds < longTrack.seconds. 2. byTitle().compare orders "Abbey" before "Zoo". 3. Track instantiates without a Playlist instance (proves it is static): new Playlist.Track("x", 60). 4. Both comparators are consistent (equal inputs → 0).`,
hints:['Track: <code>static class Track { String title; int seconds; Track(String title, int seconds) { this.title = title; this.seconds = seconds; } }</code>','Anonymous shape: <code>return new Comparator&lt;Track&gt;() { @Override public int compare(Track a, Track b) { return Integer.compare(a.seconds, b.seconds); } };</code> — note the <code>;</code> after the brace: it ends the return statement.','Lambda: <code>return (a, b) -&gt; a.title.compareTo(b.title);</code> — same interface, a tenth of the ceremony.'],
solution:`import java.util.Comparator;

public class Playlist {
    static class Track {
        String title;
        int seconds;
        Track(String title, int seconds) {
            this.title = title;
            this.seconds = seconds;
        }
    }

    Comparator<Track> byLength() {
        return new Comparator<Track>() {
            @Override public int compare(Track a, Track b) {
                return Integer.compare(a.seconds, b.seconds);
            }
        };
    }

    Comparator<Track> byTitle() {
        return (a, b) -> a.title.compareTo(b.title);
    }
}`}},
{id:'fun7',title:'User input & console I/O',body:`
<p>Interactive programs read from <code>System.in</code>, almost always through a <code>Scanner</code>:</p>
<div class="codeSample" data-hl>Scanner sc = new Scanner(System.in);

System.out.print("Name: ");
String name = sc.nextLine();          // whole line, spaces included

System.out.print("Age: ");
while (!sc.hasNextInt()) {            // validate BEFORE reading
    System.out.println("Numbers only, please.");
    sc.next();                        // discard the bad token!
}
int age = sc.nextInt();
sc.nextLine();                        // eat the leftover newline (classic trap)

System.out.printf("Hello %s, age %d (%.1f in dog years)%n", name, age, age / 7.0);</div>
<p>The two traps everyone hits: (1) <code>nextInt()</code> leaves the newline in the buffer, so a following <code>nextLine()</code> returns "" — consume it; (2) on invalid input you must <code>next()</code> to discard the bad token or the validation loop spins forever. Command-line arguments arrive in <code>main</code>'s <code>String[] args</code>. Don't close a Scanner wrapping System.in — that closes the stream for the whole JVM.</p>
<h4>Why <code>Scanner</code> confuses everyone once</h4>
<p>The trouble is that <code>Scanner</code> has two different reading models and mixes them freely.
Token-based methods (<code>nextInt</code>, <code>next</code>, <code>nextDouble</code>) read a value and
<b>stop</b>, leaving everything after it — including the newline you pressed — sitting in the buffer.
Line-based <code>nextLine</code> reads to the next newline and consumes it.</p>
<div class="codeSample" data-hl>// input typed:  "42\nAda\n"
int n = sc.nextInt();     // reads 42, leaves "\nAda\n"
String s = sc.nextLine(); // reads to the FIRST newline -> returns ""  !!
                          // the name was never read

sc.nextInt(); sc.nextLine();   // the fix: discard the rest of the line
String s2 = sc.nextLine();     // now this reads "Ada"</div>
<p>Once you see it as "tokens leave the newline behind, lines consume it", the rule writes itself:
<b>after any token-based read, call <code>nextLine()</code> before reading a line.</b></p>

<h4>Validation, and why <code>next()</code> is required</h4>
<p><code>hasNextInt()</code> only <i>looks</i> — it does not consume. So a loop that checks and prints a
message without discarding the offending token examines the same bad input forever. <code>sc.next()</code>
is what throws it away.</p>
<p>The alternative shape, which scales better to real programs, is to read the whole line and parse it
yourself in a <code>try</code>/<code>catch</code> around
<code>Integer.parseInt</code> — you get the raw input for the error message, and there is no buffer state
to reason about.</p>

<h4>Do not close a <code>Scanner</code> over <code>System.in</code></h4>
<p>Closing it closes the underlying stream, and <code>System.in</code> is process-wide — so every later
read anywhere in the JVM fails with <code>NoSuchElementException</code>. This is one of the rare cases
where try-with-resources is the wrong instinct: <code>System.in</code> is not yours to close, and the OS
reclaims it when the process ends.</p>

<h4><code>printf</code>, and where console I/O stops</h4>
<p><code>printf</code> is worth learning properly — <code>%s</code>, <code>%d</code>, <code>%.2f</code> for
fixed decimals, <code>%-10s</code> to left-pad a column, and <code>%n</code> rather than <code>\n</code>
because it emits the correct line separator for the platform.</p>
<p>And the boundary: this is how you learn and prototype, not how programs take input in production. Real
ones read arguments (<code>args</code>, and a library like picocli once there are more than two),
environment variables for configuration, and files or network for data — largely because none of those
require a human to be present. Do notice that <code>args</code> is empty, not null, when nothing was
passed, so <code>args.length</code> is the check.</p>`,
docs:[['Scanner — API','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Scanner.html'],['Formatting output — Oracle','https://docs.oracle.com/javase/tutorial/java/data/numberformat.html']],
ex:{title:'A robust prompt',
prompt:`Write <code>Prompt</code> with two static methods taking a <code>java.util.Scanner</code> parameter (passing it in keeps them testable): <code>static int askAge(java.util.Scanner sc)</code> — loop with <code>hasNextInt()</code>, discarding invalid tokens with <code>sc.next()</code>, then return <code>nextInt()</code>; and <code>static String welcome(java.util.Scanner sc)</code> — read a full name with <code>nextLine()</code> and return it formatted via <code>String.format("Welcome, %s!", name)</code>.`,
starter:`import java.util.Scanner;

public class Prompt {
    static int askAge(Scanner sc) {
        // validate with hasNextInt(), discard junk with next()
        return 0;
    }

    static String welcome(Scanner sc) {
        // nextLine + String.format
        return null;
    }
}`,
tests:[{d:'Validation loop with hasNextInt()',re:'while\\s*\\(\\s*!\\s*sc\\.hasNextInt\\s*\\(\\s*\\)\\s*\\)'},{d:'Discards bad tokens with next()',re:'sc\\.next\\s*\\(\\s*\\)'},{d:'Reads the int with nextInt()',re:'nextInt\\s*\\(\\s*\\)'},{d:'welcome uses nextLine()',re:'nextLine\\s*\\(\\s*\\)'},{d:'Formats with String.format',re:'String\\.format\\s*\\(\\s*"Welcome, %s!"'},{d:'Never closes the Scanner',re:'sc\\.close\\s*\\(\\s*\\)',not:true}],
behavior:`1. askAge on input "abc x 42" returns 42 (discards two bad tokens without infinite-looping). 2. welcome on input line "Ada Lin" returns "Welcome, Ada Lin!" (full line, space preserved). 3. Neither method closes the scanner. 4. Methods use the passed-in Scanner — no new Scanner(System.in) inside.`,
hints:['The loop shape: <code>while (!sc.hasNextInt()) { sc.next(); }</code> — hasNextInt peeks, next() consumes the junk.','After the loop, the next token IS an int: <code>return sc.nextInt();</code>','welcome is two lines: <code>String name = sc.nextLine(); return String.format("Welcome, %s!", name);</code>'],
solution:`import java.util.Scanner;

public class Prompt {
    static int askAge(Scanner sc) {
        while (!sc.hasNextInt()) {
            sc.next();
        }
        return sc.nextInt();
    }

    static String welcome(Scanner sc) {
        String name = sc.nextLine();
        return String.format("Welcome, %s!", name);
    }
}`}},
{id:'dep1',title:'Files & I/O (NIO.2)',body:`
<p>🌱 <b>Starting from zero:</b> everything your program keeps in variables evaporates the moment it exits. To make anything survive — a report, a save-game, a log — you write it to a <b>file</b> on disk, and later read it back. This lesson is Java\u0027s modern way of doing exactly that: naming a location on disk, reading what\u0027s there, writing something new.</p>
<p>Modern file I/O lives in <code>java.nio.file</code>: <code>Path</code> addresses files, <code>Files</code> does the work. The old <code>File</code> class is legacy.</p>
<div class="codeSample" data-hl>Path p = Path.of("reports", "q3.txt");

String all       = Files.readString(p);                  // small files
List&lt;String&gt; ls  = Files.readAllLines(p);
Files.writeString(p, "content");                          // create/overwrite

try (Stream&lt;String&gt; lines = Files.lines(p)) {             // large files: stream + close!
    long words = lines.filter(s -&gt; !s.isBlank()).count();
}

Files.exists(p);  Files.createDirectories(p.getParent());
try (Stream&lt;Path&gt; tree = Files.walk(Path.of("src"))) {    // recursive listing
    tree.filter(f -&gt; f.toString().endsWith(".java")).forEach(System.out::println);
}</div>
<p><code>Files.lines</code> and <code>Files.walk</code> hold OS resources — always try-with-resources. Everything throws <code>IOException</code> (checked).</p>
<h4><code>Path</code> and <code>Files</code>: why the split</h4>
<p>The old <code>File</code> class tried to be both the name of a file and the operations on it, and did
both poorly — failures returned <code>false</code> with no reason, symbolic links were invisible, and there
was no way to ask the filesystem anything interesting. NIO.2 separates the two: a <b>Path</b> is a name
(it need not exist; constructing one touches no disk), and <b>Files</b> is where every operation lives.</p>
<p>The practical gain is error reporting. <code>file.delete()</code> returning <code>false</code> tells you
nothing; <code>Files.delete(p)</code> throws <code>NoSuchFileException</code> or
<code>DirectoryNotEmptyException</code> or <code>AccessDeniedException</code> — the actual reason.</p>

<h4>Choosing a read method by file size</h4>
<div class="codeSample" data-hl>Files.readString(p)      loads the WHOLE file into memory. fine for
Files.readAllLines(p)    config and small data. an OutOfMemoryError
                         waiting for the day someone hands you a 4GB log.

Files.lines(p)           lazy: one line at a time, constant memory.
                         holds an open file handle -> try-with-resources.

Files.newBufferedReader  explicit control, when you want the loop.</div>
<p><code>Files.lines</code> and <code>Files.walk</code> return streams backed by an open handle, and a
stream is not closed by consuming it. Leak enough and you hit the process limit on open files, which
manifests as unrelated code failing to open anything at all.</p>

<h4>Two silent correctness traps</h4>
<p><b>Charset.</b> <code>readString</code> and <code>writeString</code> default to UTF-8, which is right.
The older <code>FileReader</code>/<code>FileWriter</code> default to the <i>platform</i> charset, so a file
written on one machine can be read as mojibake on another. Always be explicit, or use the
<code>Files</code> methods that default correctly.</p>
<p><b>Partial writes.</b> A crash mid-write leaves a truncated file, and for anything that matters — a
config, a saved document, a data file — that is corruption. The safe pattern is to write a temporary file
in the same directory and then move it into place atomically:</p>
<div class="codeSample" data-hl>Path tmp = Files.createTempFile(target.getParent(), "w", ".tmp");
Files.writeString(tmp, content);
Files.move(tmp, target, StandardCopyOption.ATOMIC_MOVE,
                        StandardCopyOption.REPLACE_EXISTING);
// readers see either the OLD file or the NEW one. never half of either.
// same directory matters: ATOMIC_MOVE is only guaranteed within one
// filesystem.</div>

<h4>Portability and paths from users</h4>
<p>Build paths with <code>Path.of("a", "b")</code> or <code>resolve</code> rather than concatenating with
<code>/</code>, and use <code>Path.getFileName()</code> rather than string splitting. And treat any path
containing user input as hostile: <code>../../etc/passwd</code> is <b>path traversal</b>, the file-system
equivalent of SQL injection. Resolve against a known base directory, call
<code>normalize()</code>, and then verify the result still <code>startsWith</code> the base — checking for
".." in the string is not sufficient.</p>`,
docs:[['File I/O (NIO.2) — Oracle','https://docs.oracle.com/javase/tutorial/essential/io/fileio.html'],['Files — API','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/nio/file/Files.html']],
ex:{title:'Line counter',
prompt:`Write <code>FileStats</code> with <code>static long nonBlankLines(java.nio.file.Path p) throws java.io.IOException</code> using <code>Files.lines</code> in a <b>try-with-resources</b>, filtering out blank lines and counting; and <code>static void saveReport(java.nio.file.Path p, long count) throws java.io.IOException</code> that ensures the parent directory exists (<code>createDirectories</code>) and writes <code>"lines: " + count</code> with <code>writeString</code>.`,
starter:`import java.io.IOException;
import java.nio.file.*;
import java.util.stream.Stream;

public class FileStats {
    static long nonBlankLines(Path p) throws IOException {
        return 0;
    }

    static void saveReport(Path p, long count) throws IOException {
    }
}`,
tests:[{d:'Files.lines in try-with-resources',re:'try\\s*\\(\\s*(var|Stream<String>)\\s+\\w+\\s*=\\s*Files\\.lines'},{d:'Filters blank lines',re:'isBlank\\s*\\(\\s*\\)'},{d:'Counts via the stream',re:'\\.count\\s*\\(\\s*\\)'},{d:'Ensures parent dirs',re:'createDirectories\\s*\\('},{d:'Writes with writeString',re:'Files\\.writeString\\s*\\('}],
behavior:`1. nonBlankLines on a file with 3 content lines and 2 blank lines returns 3. 2. The lines stream is closed even if counting throws. 3. saveReport creates missing parent directories then writes "lines: <count>". 4. Both methods propagate IOException (no swallowing).`,
hints:['<code>try (Stream&lt;String&gt; lines = Files.lines(p)) { return lines.filter(s -> !s.isBlank()).count(); }</code>','Guard the parent: <code>if (p.getParent() != null) Files.createDirectories(p.getParent());</code>','<code>Files.writeString(p, "lines: " + count);</code> creates or truncates the file.'],
solution:`import java.io.IOException;
import java.nio.file.*;
import java.util.stream.Stream;

public class FileStats {
    static long nonBlankLines(Path p) throws IOException {
        try (Stream<String> lines = Files.lines(p)) {
            return lines.filter(s -> !s.isBlank()).count();
        }
    }

    static void saveReport(Path p, long count) throws IOException {
        if (p.getParent() != null) {
            Files.createDirectories(p.getParent());
        }
        Files.writeString(p, "lines: " + count);
    }
}`}},
{id:'jvm1',title:'Inside the JVM: heap, stack & how methods run',body:`
<p>Java code does not run on the CPU directly. <code>javac</code> compiles your <code>.java</code> source into portable <b>bytecode</b> (<code>.class</code> files); the <b>JVM</b> then executes that bytecode — first by interpreting it, and then, for "hot" methods run many times, by <b>JIT</b>-compiling them to native machine code for speed. That two-step is what "write once, run anywhere" actually means: the same bytecode runs on any machine that has a JVM.</p>
<p>At run time the JVM divides memory into a few <b>runtime data areas</b>:</p>
<ul>
<li><b>Heap</b> — one big shared region where <i>every object and array lives</i>. It is shared across all threads and managed by the <b>garbage collector</b>, which reclaims objects nothing references anymore. Modern GCs are <i>generational</i>: new objects start in a "young" space and, if they survive, are promoted to an "old" space.</li>
<li><b>Stack</b> — <i>one per thread</i>. It is a pile of <b>frames</b>, one per in-progress method call (details below). Fast, automatic, no GC needed.</li>
<li><b>Metaspace</b> — class metadata: the loaded class definitions, method bytecode, and the constant pool.</li>
<li><b>PC register &amp; native stack</b> — per-thread bookkeeping for which instruction is executing and for native (non-Java) calls.</li>
</ul>
<p><b>How a method call works under the hood.</b> Every time you call a method, the JVM <b>pushes a new frame</b> onto the current thread&#8217;s stack. That frame holds the method&#8217;s <b>local variable array</b> (its parameters and locals) and an <b>operand stack</b> (a scratch workspace the bytecode uses to compute expressions). When the method returns, its frame is <b>popped</b> and its locals vanish instantly. This is why locals are cheap and thread-safe: each call has its own frame.</p>
<div class="codeSample" data-hl>int total = sum(2, 3);            // pushes a frame for sum(): locals a=2, b=3

static int sum(int a, int b) {    // a, b live in THIS frame — on the stack
    int r = a + b;                // r is a local — stack
    int[] data = new int[3];      // the variable 'data' (a reference) is on the stack,
                                  // but the array OBJECT it points to lives on the HEAP
    return r;                     // frame pops; 'data' is now unreachable -> GC reclaims it later
}</div>
<p>So the split is simple: <b>primitives and references</b> (the arrows) sit in the stack frame; <b>the objects they point to</b> sit on the heap. This also explains Java&#8217;s "pass-by-value": Java copies the <i>value</i> you pass; for an object that copied value is the reference, so caller and callee end up pointing at the <i>same</i> heap object.</p>
<p>The two classic failure modes fall right out of this design. Recurse too deeply and you keep pushing frames until the thread&#8217;s stack is exhausted — a <b>StackOverflowError</b>. Allocate more live objects than the heap can hold and the GC cannot help — an <b>OutOfMemoryError</b>. Knowing which memory area is involved tells you immediately which one you are looking at.</p>`,
docs:[['JVM runtime data areas — JVM spec','https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-2.html#jvms-2.5'],['How the JVM works — Oracle','https://docs.oracle.com/javase/specs/jvms/se21/html/index.html'],['Garbage collection basics','https://docs.oracle.com/en/java/javase/21/gctuning/introduction-garbage-collection-tuning.html']],
ex:{title:'Where does it live, and what breaks?',
prompt:`Write class <code>Jvm</code> with two static methods. <code>String location(String what)</code>: <code>"object"</code>→<code>"heap"</code>, <code>"local-primitive"</code>→<code>"stack"</code>, <code>"reference-variable"</code>→<code>"stack"</code>, <code>"class-metadata"</code>→<code>"metaspace"</code>, else <code>"unknown"</code>. <code>String error(String cause)</code>: <code>"deep-recursion"</code>→<code>"StackOverflowError"</code>, <code>"too-many-objects"</code>→<code>"OutOfMemoryError"</code>, else <code>"unknown"</code>.`,
starter:`public class Jvm {
    static String location(String what) {
        return null;
    }
    static String error(String cause) {
        return null;
    }
}`,
solution:`public class Jvm {
    static String location(String what) {
        switch (what) {
            case "object":             return "heap";
            case "local-primitive":    return "stack";
            case "reference-variable": return "stack";
            case "class-metadata":     return "metaspace";
            default:                   return "unknown";
        }
    }
    static String error(String cause) {
        switch (cause) {
            case "deep-recursion":   return "StackOverflowError";
            case "too-many-objects": return "OutOfMemoryError";
            default:                 return "unknown";
        }
    }
}`,
tests:[{d:'objects live on the heap',re:'"object".*?"heap"',flags:'s'},{d:'local primitives live on the stack',re:'"local-primitive".*?"stack"',flags:'s'},{d:'a reference variable lives on the stack',re:'"reference-variable".*?"stack"',flags:'s'},{d:'class metadata lives in metaspace',re:'"class-metadata".*?"metaspace"',flags:'s'},{d:'deep recursion throws StackOverflowError',re:'"deep-recursion".*?"StackOverflowError"',flags:'s'},{d:'exhausting the heap throws OutOfMemoryError',re:'"too-many-objects".*?"OutOfMemoryError"',flags:'s'},{d:'unknown default present',re:'"unknown"'}],
behavior:`location("object") is "heap"; location("local-primitive") and location("reference-variable") are "stack"; location("class-metadata") is "metaspace". error("deep-recursion") is "StackOverflowError"; error("too-many-objects") is "OutOfMemoryError". The object lives on the heap even though the reference to it lives on the stack.`,
hints:['Objects and arrays always live on the heap; local primitives and the reference variables that point to objects live in the current stack frame.','Each method call pushes a stack frame with its own locals; returning pops it, and too many nested calls overflow the stack.','Class metadata lives in metaspace; running out of heap for live objects is an OutOfMemoryError.']}}
]});
