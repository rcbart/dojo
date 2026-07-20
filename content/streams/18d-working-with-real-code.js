STREAMS.push({icon:'🧭',dan:true,title:'Working with Real Code',blurb:'The unglamorous senior majority: reading code you didn\\u0027t write, pinning legacy behavior, refactoring without fear, reviewing like a colleague, and handling incidents.',lessons:[
{id:'wrc1',title:'Code archaeology: reading before writing',body:`
<p>Seniors spend far more time reading code than writing it — and reading a 500k-line codebase is a learned skill with a method, not an act of patience. The method:</p>
<ul>
<li><b>Start from the entry points, not the file tree.</b> Where does execution begin — <code>main</code>, the controllers, the message listeners, the scheduled jobs? An unfamiliar codebase is a set of stories; entry points are their first pages. Reading alphabetically by folder is how you learn nothing in four hours.</li>
<li><b>Trace one request end to end.</b> Pick a single concrete operation ("what happens when a user posts a comment?") and follow it through every layer, writing the chain down as you go: <code>CommentController → CommentService → SpamChecker → CommentRepo → events</code>. One completed trace teaches more architecture than any diagram in the wiki (which is outdated anyway — trust the code, verify the docs).</li>
<li><b>Interrogate the history — git is a time machine with testimony.</b> <code>git log --follow</code> on a confusing file; <code>git log -S "methodName"</code> (the "pickaxe") finds every commit that ever touched a string — who introduced this, with what commit message, alongside what else? <code>git blame</code> answers "why is this line weird" more often than the line itself does. A strange <code>if</code> guarding nothing visible + a blame pointing at "fix prod incident 2023-04" = load-bearing weirdness; leave it until you understand it.</li>
<li><b>Read the tests as documentation.</b> Test names are executable claims about intended behavior — often the only honest spec in the building. No tests? The archaeology just told you the most important fact about this code.</li>
<li><b>Build a map, not a memory.</b> Keep notes: entry points found, the trace chains, surprises, questions. Your future PRs will be reviewed by people who hold this map in their heads; the notes are how you catch up in weeks instead of years.</li>
</ul>
<div class="codeSample">git log --oneline --follow src/billing/InvoiceCalc.java   # story of one file
git log -S "applyLegacyDiscount"                          # every commit touching that name
git blame -L 40,60 InvoiceCalc.java                       # who wrote THESE lines, in which commit
git log --oneline --since="3 months" -- src/billing/      # what's hot lately (hot = risky)</div>
<p>The mindset shift this lesson asks for: unfamiliar code is <i>evidence</i>, not mess. Every weird line was written by someone with a reason under some constraint; archaeology recovers the reason before you delete the constraint — which is next lesson's famous fence.</p>`,
docs:[['git pickaxe & log search','https://git-scm.com/docs/git-log#Documentation/git-log.txt--Sltstringgt'],['Working Effectively with Legacy Code (Feathers)','https://www.oreilly.com/library/view/working-effectively-with/0131177052/'],['Chesterton\\u2019s fence','https://fs.blog/chestertons-fence/']],
exs:[{title:'Archaeology drill',lang:'shell',
prompt:`One answer per numbered line: (1) the git command showing every commit whose diff ever added or removed the string <code>applyDiscount</code> (the pickaxe), (2) the command showing who last changed each of lines 10-30 of <code>Billing.java</code> (use <code>-L</code>), (3) the command listing commits that touched anything under <code>src/billing/</code> in the last 3 months (one line, use <code>--since="3 months"</code> and the path after <code>--</code>), (4) concept: you find an inexplicable <code>if</code> statement and blame says "fix prod incident" — do you delete it or <b>understand it first</b> (two words), (5) concept: the most honest, executable documentation of intended behavior in a codebase (one word), (6) concept: reading should start from entry ____ , not the file tree (one word).`,
starter:`1.
2.
3.
4.
5.
6.
`,
solution:`1. git log -S "applyDiscount"
2. git blame -L 10,30 Billing.java
3. git log --since="3 months" -- src/billing/
4. understand first
5. tests
6. points
`,
tests:[{d:'Pickaxe search with -S',re:'1\\.\\s*git\\s+log\\s+-S\\s+"?applyDiscount"?',flags:'i'},{d:'Line-ranged blame',re:'2\\.\\s*git\\s+blame\\s+-L\\s+10,30\\s+Billing\\.java',flags:'i'},{d:'Path-scoped recent history',re:'3\\.\\s*git\\s+log\\s+--since="?3 months"?\\s+--\\s+src/billing/',flags:'i'},{d:'Chesterton\\u2019s fence: understand before deleting',re:'4\\.\\s*understand(\\s+it)?\\s+first',flags:'i'},{d:'Tests are the honest spec',re:'5\\.\\s*tests',flags:'i'},{d:'Entry points first',re:'6\\.\\s*points',flags:'i'}],
behavior:`1. -S finds commits where the string count changed — introductions and removals, with their commit messages as testimony. 2. blame -L scopes to exactly the weird lines: author, commit, date per line. 3. Recently-hot paths are where the bugs and the knowledge both live. 4. Understand first — Chesterton's fence: the fence was built for a reason; find it before removing (the blame message just told you where to look). 5. Tests — names like rejects_negative_amounts() are claims the build verifies daily; comments merely hope. 6. Entry points — code is read as executions, not as an alphabet.`,
hints:['The pickaxe (-S) answers "when did this name enter/leave the codebase" — the single best archaeology tool.','-L takes start,end before the filename.','Q4 has a name worth knowing in reviews: Chesterton\\u2019s fence — never remove a fence until you know why it stands.']},{title:'Interview: onboarding into a legacy codebase',lang:'text',
prompt:`"You join a team with a 400k-line service, no docs, the author left. Walk me through your first week." — the real senior interview question. One per numbered line: (1) start reading from the file tree alphabetically, or from the ____ ____ where execution begins (two words); (2) the single most instructive exercise: ____ one request end to end (one word, a verb); (3) to find who introduced a mysterious method and why, the git command family (one word — the flag letter tool, "-S", is the ____); (4) the honest, executable spec of intended behavior, when it exists (one word); (5) you find a weird guard clause; git blame says "hotfix prod incident" — delete it or ____ ____ first (two words); (6) what you produce for yourself as you go, so week 3 isn't week 1 again (one word — notes/a ____).`,
starter:`1.
2.
3.
4.
5.
6.
`,
solution:`1. entry points
2. trace
3. pickaxe
4. tests
5. understand it
6. map
`,
tests:[{d:'Q1: start from entry points',re:'1\\.\\s*entry\\s+points',flags:'is'},{d:'Q2: trace a request end to end',re:'2\\.\\s*trace',flags:'is'},{d:'Q3: the pickaxe (git log -S)',re:'3\\.\\s*pickaxe',flags:'is'},{d:'Q4: tests are the honest spec',re:'4\\.\\s*tests',flags:'is'},{d:'Q5: understand before deleting (Chesterton)',re:'5\\.\\s*understand',flags:'is'},{d:'Q6: build a map, not a memory',re:'6\\.\\s*map',flags:'is'}],
behavior:`1. Entry points — controllers, listeners, main, scheduled jobs; the file tree is an index, not a story. 2. Trace one concrete operation through every layer; one completed trace beats a week of browsing and any stale wiki diagram. 3. The pickaxe (git log -S "name") surfaces every commit that added or removed a symbol, with its message as testimony. 4. Tests — their names are claims the build verifies daily; no tests is itself the most important finding. 5. Understand it first — Chesterton's fence, and the blame message just handed you the thread to pull. 6. A map: entry points, traces, surprises, questions — the notes that turn onboarding from years into weeks. This IS a common senior-screen question; a crisp method is the signal.`,
hints:['The anti-pattern the interviewer is listening for: "I\\u2019d read through the code" (aimlessly). The signal: entry points → trace → history.','git log -S is called the pickaxe — the single best archaeology tool.','Chesterton\\u2019s fence: never remove what you don\\u2019t yet understand, especially with an incident in its history.']},
{title:'Read unfamiliar code: find the bug',
prompt:`Reading comprehension — the daily senior skill. This method, copied from a real codebase, has a concurrency bug. Write class <code>Diagnosis</code> with <code>static String bug()</code> returning a <b>one-line description naming the specific problem</b>. The code under review:<br><code>private final Map&lt;String,Integer&gt; counts = new HashMap&lt;&gt;();<br>public void increment(String key){ counts.put(key, counts.getOrDefault(key,0)+1); }</code><br>...called concurrently from many threads. Your <code>bug()</code> must return a string containing BOTH the phrase <code>race condition</code> (or <code>not thread-safe</code>) AND the fix word <code>ConcurrentHashMap</code> (or <code>synchronized</code>). This tests that you can read code and name the defect precisely, not just feel that something's off.`,
starter:`public class Diagnosis {

    static String bug() {
        return "";
    }
}`,
solution:`public class Diagnosis {

    static String bug() {
        return "HashMap with read-modify-write increment is a race condition under "
             + "concurrent access; two threads can read the same value and lose an "
             + "update. Fix: ConcurrentHashMap with merge/compute, or synchronized.";
    }
}`,
tests:[{d:'Names the concurrency defect precisely',re:'race\\s+condition|not\\s+thread[- ]safe|lost\\s+update',flags:'i'},{d:'Names a correct fix',re:'ConcurrentHashMap|synchronized|AtomicInteger|merge|compute',flags:'i'},{d:'Returns a non-empty diagnosis',re:'return\\s+"[^"]{20,}'},{d:'Identifies the read-modify-write shape',re:'read[- ]modify[- ]write|getOrDefault|two\\s+threads',flags:'i'}],
behavior:`1. The defect: getOrDefault-then-put is a read-modify-write that isn't atomic — two threads read count 5, both write 6, one increment vanishes (a lost update). 2. The plain HashMap is also structurally unsafe under concurrent writes (it can corrupt its internal buckets, even infinite-loop in older JDKs). 3. The fixes, in order of preference: counts.merge(key, 1, Integer::sum) on a ConcurrentHashMap (atomic, lock-free), an AtomicInteger value, or a synchronized block (coarsest). 4. This is what "reading code" means at senior level: not "looks fine" but "line 2 is a race under the stated concurrency, here's the exact interleaving and the fix" — precision is the skill.`,
hints:['The tell is read-modify-write on shared mutable state with no synchronization.','getOrDefault(k,0)+1 then put is THREE steps that can interleave — the classic lost update.','Best fix is atomic-by-construction: ConcurrentHashMap.merge, not a lock bolted on.']}]},

{id:'wrc2',title:'Characterization tests: pin it before you touch it',body:`
<p>The scariest sentence in professional software: <i>"just change this one thing"</i> — in a class with no tests, written by someone who left, that production has depended on for five years. The legacy-code discipline (Michael Feathers' book is the canon) starts with a redefinition: <b>legacy code is code without tests</b> — age irrelevant. And its first move is never the change itself:</p>
<p><b>Characterization tests</b> pin down what the code <i>currently does</i> — not what it should do. You write a test with a guessed assertion, run it, and let the CODE tell you the real answer; then you assert <i>that</i>, weirdness included:</p>
<div class="codeSample" data-hl>// step 1: probe with a deliberately wrong assertion
@Test void shipping_for_2kg_to_zone_B() {
    assertEquals(-1.0, LegacyShipping.cost(2.0, "B"));   // -1 is a lie; run it
}
// step 2: the failure message confesses: expected -1.0 but was 12.75
// step 3: pin the truth — THIS is the spec now
    assertEquals(12.75, LegacyShipping.cost(2.0, "B"));
// step 4: repeat for the edges: zone "Q"? weight 0? negative? null?
//         each surprising answer gets pinned too — bugs and all (for now)</div>
<p>Why pin bugs instead of fixing them on sight? Because <b>current behavior is what production depends on</b> — some caller somewhere may rely on zone "Q" returning 0 instead of throwing. Characterize first (the safety net), change second (one thing at a time), and fix the bug as its own deliberate, visible commit — not as a silent side effect of a refactor.</p>
<p>The blocker you'll hit immediately: the legacy class news up its own dependencies (<code>new SmtpMailer()</code> inside the method — your DI lessons' anti-pattern, live and in the wild), so testing it sends email. The escape is a <b>seam</b>: the smallest change that makes a dependency swappable <i>without changing behavior</i> — extract the <code>new</code> into a constructor parameter (keep a default constructor delegating with the old value so no caller breaks), or extract a protected method a test subclass can override. Seam first, characterize second, and only then — with the net finally under you — change the thing they sent you in to change.</p>`,
docs:[['Feathers — Working Effectively with Legacy Code','https://www.oreilly.com/library/view/working-effectively-with/0131177052/'],['Characterization tests — Fowler wiki','https://michaelfeathers.silvrback.com/characterization-testing'],['Approval testing — a power tool for this','https://approvaltests.com/']],
exs:[{title:'Pin the legacy calculator',
prompt:`This legacy method is in production: <code>static double fee(int qty, String tier)</code> — behavior (discovered by probing): qty × 10.0, minus 5.0 when tier equals <code>"gold"</code>, and — surprisingly — returns <b>0.0 for any qty &le; 0</b> (a caller depends on it). Write <code>FeeTest</code> with four <b>characterization</b> tests using JUnit (<code>org.junit.jupiter.api.Test</code>, <code>Assertions.assertEquals</code>): (1) <code>plainTier()</code> — fee(3, "basic") == 30.0; (2) <code>goldDiscount()</code> — fee(3, "gold") == 25.0; (3) <code>zeroQty_pinned()</code> — fee(0, "basic") == 0.0 with a comment <code>// pinned: callers rely on this</code>; (4) <code>negativeQty_pinned()</code> — fee(-2, "gold") == 0.0. Use a delta of 0.001 in every assertEquals (doubles!).`,
starter:`import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class FeeTest {

    // your four characterization tests
}`,
solution:`import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class FeeTest {

    @Test
    void plainTier() {
        assertEquals(30.0, LegacyFees.fee(3, "basic"), 0.001);
    }

    @Test
    void goldDiscount() {
        assertEquals(25.0, LegacyFees.fee(3, "gold"), 0.001);
    }

    @Test
    void zeroQty_pinned() {
        // pinned: callers rely on this
        assertEquals(0.0, LegacyFees.fee(0, "basic"), 0.001);
    }

    @Test
    void negativeQty_pinned() {
        assertEquals(0.0, LegacyFees.fee(-2, "gold"), 0.001);
    }
}`,
tests:[{d:'Four @Test methods present',re:'@Test[\\s\\S]*?@Test[\\s\\S]*?@Test[\\s\\S]*?@Test'},{d:'Plain tier pinned at 30.0',re:'assertEquals\\s*\\(\\s*30\\.0\\s*,[\\s\\S]*?fee\\s*\\(\\s*3\\s*,\\s*"basic"\\s*\\)'},{d:'Gold discount pinned at 25.0',re:'assertEquals\\s*\\(\\s*25\\.0\\s*,[\\s\\S]*?fee\\s*\\(\\s*3\\s*,\\s*"gold"\\s*\\)'},{d:'The weird zero-qty behavior is pinned, not fixed',re:'zeroQty_pinned[\\s\\S]*?assertEquals\\s*\\(\\s*0\\.0\\s*,[\\s\\S]*?fee\\s*\\(\\s*0\\s*,'},{d:'Comment marks the pin as deliberate',re:'//\\s*pinned:\\s*callers\\s+rely\\s+on\\s+this'},{d:'Every double assertion carries a delta',re:'assertEquals\\s*\\(\\s*[\\d.]+\\s*,[\\s\\S]{0,80}?,\\s*0\\.001\\s*\\)'}],
behavior:`1. All four tests pass against the CURRENT code — that is the definition of characterization; a failing one means your model of the code is wrong, which is exactly what you needed to learn. 2. The zero/negative pins encode the surprise as protected behavior — with a comment telling the next reader the weirdness is known and deliberate, not endorsed. 3. Now any refactor that changes ANY of the four behaviors fails a test within seconds — the net exists. 4. When the team later decides qty <= 0 should throw, the pin is deleted consciously in that commit — behavior change as a visible decision, never an accident.`,
hints:['You are documenting what IS, not what OUGHT — resist the itch to "fix" while pinning; that itch gets its own commit later.','The probing workflow: assert something absurd, run, copy the truth from the failure message into the assertion.','The _pinned suffix and comment are communication: future readers must not "helpfully" delete the weird tests.']},{title:'Characterize a gnarly legacy method',
prompt:`A real legacy method <code>grade(int score)</code> is in production; probing revealed: 90+ → <code>"A"</code>, 80-89 → <code>"B"</code>, 70-79 → <code>"C"</code>, below 70 → <code>"F"</code> (note: no "D" — a known quirk callers rely on), AND <b>score &gt; 100 returns <code>"A"</code></b> (not an error), AND <b>negative scores return <code>"F"</code></b>. Write <code>GradeTest</code> (JUnit: <code>org.junit.jupiter.api.Test</code>, static <code>assertEquals</code>) with FIVE characterization tests pinning CURRENT behavior, bugs and all: (1) <code>normalA()</code> grade(95)=="A"; (2) <code>noDgrade_pinned()</code> grade(65)=="F" with comment <code>// pinned: no D grade, by design</code>; (3) <code>over100_pinned()</code> grade(150)=="A"; (4) <code>negative_pinned()</code> grade(-5)=="F"; (5) <code>boundaryB()</code> grade(80)=="B".`,
starter:`import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class GradeTest {

    // five characterization tests
}`,
solution:`import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class GradeTest {

    @Test
    void normalA() {
        assertEquals("A", Legacy.grade(95));
    }

    @Test
    void noDgrade_pinned() {
        // pinned: no D grade, by design
        assertEquals("F", Legacy.grade(65));
    }

    @Test
    void over100_pinned() {
        assertEquals("A", Legacy.grade(150));
    }

    @Test
    void negative_pinned() {
        assertEquals("F", Legacy.grade(-5));
    }

    @Test
    void boundaryB() {
        assertEquals("B", Legacy.grade(80));
    }
}`,
tests:[{d:'Five @Test methods',re:'@Test[\\s\\S]*?@Test[\\s\\S]*?@Test[\\s\\S]*?@Test[\\s\\S]*?@Test'},{d:'Normal A grade pinned',re:'assertEquals\\s*\\(\\s*"A"\\s*,[\\s\\S]*?grade\\s*\\(\\s*95\\s*\\)'},{d:'The no-D quirk pinned with a marker comment',re:'noDgrade_pinned[\\s\\S]*?//\\s*pinned[\\s\\S]*?assertEquals\\s*\\(\\s*"F"\\s*,[\\s\\S]*?grade\\s*\\(\\s*65'},{d:'Over-100 behavior pinned (not "fixed" to an error)',re:'over100_pinned[\\s\\S]*?assertEquals\\s*\\(\\s*"A"\\s*,[\\s\\S]*?grade\\s*\\(\\s*150'},{d:'Negative-score behavior pinned',re:'negative_pinned[\\s\\S]*?assertEquals\\s*\\(\\s*"F"\\s*,[\\s\\S]*?grade\\s*\\(\\s*-5'},{d:'Boundary at 80 pinned to B',re:'grade\\s*\\(\\s*80\\s*\\)[\\s\\S]*?"B"|assertEquals\\s*\\(\\s*"B"\\s*,[\\s\\S]*?grade\\s*\\(\\s*80'}],
behavior:`1. All five pass against the CURRENT code — that's what makes them characterization tests, not aspiration. 2. The three _pinned tests encode the surprises (no D, >100→A, negatives→F) as protected behavior with comments telling the next reader they're known, not accidents. 3. Now ANY refactor that changes these behaviors fails instantly — the net is under you before you touch a line. 4. When the team later decides >100 should throw, that test is edited in the SAME commit as the behavior change — visible, deliberate, reviewable. This is exactly how you make a five-year-old untested method safe to modify.`,
hints:['Pin what IS, not what SHOULD BE — the quirks are load-bearing until proven otherwise.','The _pinned naming + comment is communication: stop the next dev from "helpfully" deleting the weird test.','Boundary values (80, 90, 70) are where grading bugs hide — pin at least one.']},
{title:'Break a dependency with a seam',
prompt:`Legacy method you must test news up its own mailer: <code>void notifyUser(String email){ new SmtpMailer().send(email, "hi"); }</code> — testing it sends real email. Introduce a <b>seam</b> without changing behavior for existing callers. Write class <code>Notifier</code>: a <code>private final Mailer mailer</code> field; a <b>public no-arg constructor</b> that delegates <code>this(new SmtpMailer())</code> (so existing callers who write <code>new Notifier()</code> are UNCHANGED); a <b>package-private constructor</b> <code>Notifier(Mailer mailer)</code> that a test can call with a fake; and <code>void notifyUser(String email)</code> calling <code>mailer.send(email, "hi")</code>. Assume interface <code>Mailer { void send(String to, String body); }</code> and <code>class SmtpMailer implements Mailer</code> exist.`,
starter:`public class Notifier {

    // introduce the seam here
    // existing callers use: new Notifier()
    // tests will use:       new Notifier(fakeMailer)

    void notifyUser(String email) {
    }
}`,
solution:`public class Notifier {

    private final Mailer mailer;

    public Notifier() {
        this(new SmtpMailer());
    }

    Notifier(Mailer mailer) {
        this.mailer = mailer;
    }

    void notifyUser(String email) {
        mailer.send(email, "hi");
    }
}`,
tests:[{d:'Dependency is now an injectable field, not a new inside the method',re:'private\\s+final\\s+Mailer\\s+mailer'},{d:'No-arg constructor preserves old behavior via delegation',re:'public\\s+Notifier\\s*\\(\\s*\\)\\s*\\{\\s*this\\s*\\(\\s*new\\s+SmtpMailer\\s*\\(\\s*\\)\\s*\\)'},{d:'Test seam: constructor taking a Mailer',re:'Notifier\\s*\\(\\s*Mailer\\s+mailer\\s*\\)\\s*\\{\\s*this\\.mailer\\s*=\\s*mailer'},{d:'Method uses the field, no new SmtpMailer inside',re:'notifyUser[\\s\\S]*?mailer\\.send\\s*\\(\\s*email'},{d:'The method no longer constructs its own mailer',re:'notifyUser\\s*\\([\\s\\S]*?new\\s+SmtpMailer',not:true}],
behavior:`1. Existing callers writing new Notifier() behave EXACTLY as before — the no-arg constructor delegates to the real SmtpMailer; zero callers break. That preservation is what makes this a refactoring, not a rewrite. 2. A test writes new Notifier(fakeMailer) and asserts on the fake without sending email — the seam is open. 3. The dependency moved from hard-wired (new inside the method, your DI stream's anti-pattern) to injected, the smallest change that achieves testability. 4. This is Feathers' "introduce a seam" verbatim: you didn't rewrite notifyUser, you made ONE dependency swappable, and now you can characterize the class you were sent in to change.`,
hints:['A seam is the SMALLEST change that makes a dependency swappable without altering existing behavior.','The delegating no-arg constructor is the trick: old callers see no difference, tests get an injection point.','Keep the test constructor package-private — the seam is for tests, not the public API.']}]},

{id:'wrc3',title:'Refactoring without fear: small steps',body:`
<p>With behavior pinned, you may now change structure — and the discipline that separates refactoring from rewriting is <b>step size</b>. Fowler's definition is precise: a refactoring is a change that <i>improves structure while preserving behavior</i>, performed as a sequence of tiny, individually-safe transformations with the tests green between every one.</p>
<ul>
<li><b>The rhythm</b>: change one small thing → run the tests → commit (or revert — a failing refactor step is <i>discarded</i>, never debugged, because the step was 3 minutes; that cheap revert is the entire economic argument for small steps). Two hats, worn separately: the refactoring hat never changes behavior; the feature hat never restructures. One hat per commit.</li>
<li><b>The moves have names</b> — and knowing ~six covers 90% of daily work: <i>Extract Method</i> (name a block; the workhorse), <i>Rename</i> (the highest value-per-risk in software), <i>Extract Class</i> (when a class hoards two jobs — your SRP lessons), <i>Inline</i> (dissolve needless indirection), <i>Replace Conditional with Polymorphism</i> (your Shipping enum, discovered in the wild), <i>Introduce Parameter Object</i> (four booleans marching in formation = a type begging to exist).</li>
<li><b>Smells tell you which move</b>: a comment saying "// now compute the surcharge" is Extract Method wearing a disguise (the comment becomes the method name); a 40-line method wants dissection; the same three arguments traveling everywhere want an object; a switch on type duplicated in four places wants polymorphism.</li>
<li><b>The strangler fig</b> — the same discipline at architecture scale, from your launch plan and Judge0-first runner: stand the new implementation beside the old, route traffic over incrementally (one endpoint, one percent, one tenant), keep the old path warm for instant retreat, delete it only when the new one has taken all traffic and held. Rewrite-from-scratch-in-one-cutover is the most reliably fatal project shape in the industry; the fig survives because every intermediate state ships and works.</li>
</ul>
<div class="codeSample">big-bang rewrite:   old ──────────────✂──────────────▶ new     (one giant bet, no retreat)
strangler fig:      old ██████████▓▓▓▓▓▓░░░░░░ new              (traffic shifts gradually,
                    tests green at every band, rollback = route back)</div>
<p>The senior tell in a diff: fifteen commits, each boring, each green, message like "extract TariffCalculator from Billing (no behavior change)" — versus one commit titled "refactored billing" touching 40 files. The first is reviewable, bisectable and revertible; the second is a prayer.</p>`,
docs:[['Refactoring — Fowler (catalog)','https://refactoring.com/catalog/'],['Strangler fig — Fowler','https://martinfowler.com/bliki/StranglerFigApplication.html'],['Code smells cheat sheet','https://refactoring.guru/refactoring/smells']],
exs:[{title:'Name the move',lang:'text',
prompt:`Name the refactoring for each situation, one per numbered line: (1) a 12-line block inside a method is preceded by the comment <code>// calculate late fees</code> (two words), (2) the variable <code>d2</code> actually holds the invoice due date (one word), (3) <code>OrderService</code> validates orders AND renders email HTML (two words), (4) <code>switch (shape.type)</code> computing area appears in three different classes (a phrase — what replaces the conditional), (5) <code>(street, city, zip, country)</code> travel together through nine signatures (three words), (6) replacing a legacy service by routing traffic to the new one endpoint-by-endpoint while both run (two words).`,
starter:`1.
2.
3.
4.
5.
6.
`,
solution:`1. extract method
2. rename
3. extract class
4. polymorphism
5. introduce parameter object
6. strangler fig
`,
tests:[{d:'Q1: extract method (the comment is the name)',re:'1\\.\\s*extract\\s+method',flags:'is'},{d:'Q2: rename',re:'2\\.\\s*rename',flags:'is'},{d:'Q3: extract class (two jobs, one class)',re:'3\\.\\s*extract\\s+class',flags:'is'},{d:'Q4: replace conditional with polymorphism',re:'4\\.\\s*.*polymorphism',flags:'is'},{d:'Q5: introduce parameter object',re:'5\\.\\s*(introduce\\s+)?parameter\\s+object',flags:'is'},{d:'Q6: strangler fig',re:'6\\.\\s*strangler\\s+fig',flags:'is'}],
behavior:`1. Extract Method — the comment becomes calculateLateFees() and deletes itself. 2. Rename — d2 → dueDate; near-zero risk, permanent comprehension gain, the best deal in refactoring. 3. Extract Class — validation and presentation are two reasons to change; SRP applied as a move rather than a slogan. 4. Replace Conditional with Polymorphism — each shape owns area(); adding a shape stops meaning three edits (your polymorphism lesson, now as surgery). 5. Introduce Parameter Object — Address was hiding in those signatures; make it a type and behavior will migrate to it. 6. Strangler fig — both run, traffic shifts, retreat stays cheap; the launch plan's Judge0-then-own-runner is this exact shape.`,
hints:['A comment naming WHAT a block does is a method name in captivity — free it.','Q3-Q4 are your OOP streams recurring as refactoring moves: SRP and polymorphism as verbs, not nouns.','Q6: the fig strangles gradually — the tree (old system) stays alive until the fig fully replaces it.']},{title:'Refactor: extract and rename, safely',
prompt:`Structure-only refactor (behavior must NOT change). This works but reads badly:<br><code>double c(double p, int q, boolean g){ double t = p * q; if(g) t = t * 0.9; return t; }</code><br>Rewrite it as class <code>Pricing</code> with a well-named method — same behavior, better names, one extracted helper: <code>double total(double price, int qty, boolean gold)</code> returning <code>applyDiscount(price * qty, gold)</code>, plus a <b>private</b> helper <code>double applyDiscount(double subtotal, boolean gold)</code> returning <code>gold ? subtotal * 0.9 : subtotal</code>. Same numbers out, names a human can read, and the discount rule now has a name and one home.`,
starter:`public class Pricing {

    // rename the params, extract the discount step
    double total(double price, int qty, boolean gold) {
        return 0;
    }
}`,
solution:`public class Pricing {

    double total(double price, int qty, boolean gold) {
        return applyDiscount(price * qty, gold);
    }

    private double applyDiscount(double subtotal, boolean gold) {
        return gold ? subtotal * 0.9 : subtotal;
    }
}`,
tests:[{d:'Public method has readable named parameters',re:'double\\s+total\\s*\\(\\s*double\\s+price\\s*,\\s*int\\s+qty\\s*,\\s*boolean\\s+gold\\s*\\)'},{d:'Discount logic extracted to a named helper',re:'private\\s+double\\s+applyDiscount\\s*\\(\\s*double\\s+subtotal\\s*,\\s*boolean\\s+gold\\s*\\)'},{d:'total delegates to the helper — one responsibility each',re:'return\\s+applyDiscount\\s*\\(\\s*price\\s*\\*\\s*qty\\s*,\\s*gold\\s*\\)'},{d:'Discount rule lives in exactly one place',re:'gold\\s*\\?\\s*subtotal\\s*\\*\\s*0\\.9\\s*:\\s*subtotal'},{d:'Behavior preserved: the 0.9 multiplier survives',re:'0\\.9'}],
behavior:`1. total(100, 2, true) == 180.0 and total(100, 2, false) == 200.0 — identical to the cryptic original; a characterization test written against c() would pass unchanged against total(). That green test between versions is what makes this a refactoring. 2. c/p/q/g became total/price/qty/gold — Rename, the highest value-per-risk move in software; the code now says what it means. 3. The discount became applyDiscount() — Extract Method — so the 0.9 rule has a name and a single home; changing the discount is now one edit in one obvious place. 4. Two small named moves, behavior bit-for-bit preserved: that's the refactoring discipline, not a rewrite.`,
hints:['Behavior first: the numbers out must not change — only names and structure.','Rename is nearly free and enormously valuable; do it liberally.','Extract the discount so the rule has ONE home — next time it changes, you edit one line, not a formula buried in another.']},
{title:'Interview: legacy migration strategy',lang:'text',
prompt:`"We have a 15-year-old monolith. Leadership wants it replaced. How?" — the migration question that separates seniors from optimists. One per numbered line: (1) rewrite-from-scratch-and-cut-over-in-one-release is famously the ____ approach (one word: think risk); (2) the incremental pattern: stand the new system beside the old and shift traffic piece by piece (two words); (3) during migration, both systems run at ____ (one word — simultaneously); (4) each slice migrated must keep a cheap ____ path if the new code misbehaves (one word, from the incidents lesson); (5) you migrate by routing one endpoint / one percent / one tenant at a time so every intermediate state ____ (one word — is deployable/works); (6) the old system is deleted only when the new one has taken ____ the traffic and held (one word).`,
starter:`1.
2.
3.
4.
5.
6.
`,
solution:`1. riskiest
2. strangler fig
3. once
4. rollback
5. ships
6. all
`,
tests:[{d:'Q1: big-bang rewrite is the riskiest',re:'1\\.\\s*(riskiest|worst|dangerous|fatal)',flags:'is'},{d:'Q2: the strangler fig pattern',re:'2\\.\\s*strangler\\s+fig',flags:'is'},{d:'Q3: both systems run at once',re:'3\\.\\s*once|3\\.\\s*simultaneous',flags:'is'},{d:'Q4: keep a rollback path per slice',re:'4\\.\\s*rollback',flags:'is'},{d:'Q5: every intermediate state ships/works',re:'5\\.\\s*(ships|works|deployable)',flags:'is'},{d:'Q6: delete the old only after taking all traffic',re:'6\\.\\s*all',flags:'is'}],
behavior:`1. Riskiest — the big-bang rewrite is the most reliably fatal project shape in the industry: months of no shipping, then a single terrifying cutover with no retreat. 2-3. The strangler fig: new grows around old, both run at once, traffic shifts gradually — named for the vine that envelops a tree before the tree is gone. 4-5. Every slice keeps a rollback and every intermediate state ships: the migration is never in a "half-broken, can't deploy" limbo — that property is the entire safety argument. 6. Delete old only after new carries all traffic and holds — the last step, not the first. Your launch plan's Judge0-then-own-runner is this exact shape; so is every credible legacy migration.`,
hints:['"Rewrite from scratch" is the answer that fails the interview — name the strangler fig instead.','The safety property: every intermediate state is shippable, so you\\u2019re never stuck mid-migration.','Both systems running at once is a feature (gradual shift + instant rollback), not a temporary ugliness to rush past.']}]},

{id:'wrc4',title:'Code review: the senior craft',body:`
<p>Code review is where a team's engineering culture is actually decided — and reviewing well is a distinct skill from coding well. The craft, both directions:</p>
<p><b>Reviewing — look for things in severity order, and label them:</b></p>
<ul>
<li><b>1. Correctness</b>: does it do what it claims? Edge cases (null, empty, concurrent, huge), off-by-ones, resources leaked, race windows — your whole dojo, worn as a checklist.</li>
<li><b>2. Security & data</b>: input validated at the boundary? Ownership checked (the IDOR lesson)? Secrets out of code? Migrations reversible?</li>
<li><b>3. Design</b>: right place for this logic? Coupling introduced? Will this shape survive the next three features? Tests test the <i>behavior</i> (not the mocks)?</li>
<li><b>4. Readability</b>: naming, dead code, comment drift.</li>
<li><b>5. Style — automate it out of the conversation entirely.</b> If humans are debating brace position, the team lacks a formatter, not opinions. Review time spent on style is review time stolen from correctness.</li>
</ul>
<p><b>Phrasing is engineering too</b> — review comments have a blast radius: comment on the <i>code, never the author</i> ("this method re-reads the file per loop iteration" — not "you always do this"); <b>ask before asserting</b> ("what happens here when the list is empty?" beats "this breaks on empty" — and is more instructive when you're the one who's wrong); label severity honestly — <code>blocking:</code> vs <code>suggestion:</code> vs <code>nit:</code> — so the author knows what must change versus what's an offering; and <b>say what's good</b>: "this test names the bug it prevents — nice" teaches as much as any critique, and costs one line.</p>
<p><b>Receiving — the half seniors model:</b> the review is of the code, not of you; every question is a place the code failed to explain itself (the reviewer is the first confused reader of many — fix the code or add the why-comment, don't just answer in the thread, where the answer evaporates); and gratitude for a hard review is a senior tell — someone spent an hour making your change better before production got to review it the expensive way.</p>
<p><b>And the author's duty that precedes it all</b>: small PRs. Review quality collapses with size — a 200-line PR gets found bugs; a 2,000-line PR gets "LGTM" (approval by exhaustion). Stacking small PRs is the single highest-leverage habit for getting good reviews. The fifteen boring commits from the refactoring lesson? That's also what a reviewable change looks like.</p>`,
docs:[['Google engineering practices — code review','https://google.github.io/eng-practices/review/'],['Conventional comments (labels)','https://conventionalcomments.org/'],['How to make your code reviewer fall in love with you','https://mtlynch.io/code-review-love/']],
exs:[{title:'Review this diff',lang:'text',
prompt:`You're reviewing this handler: <code>String load(String userId) { String sql = "SELECT data FROM docs WHERE owner='" + userId + "'"; try { return db.query(sql); } catch (Exception e) { return null; } }</code> — write a four-comment review, one per numbered line, each starting with a severity label: (1) a <code>blocking:</code> comment naming the <b>SQL injection</b> (mention PreparedStatement or parameters), (2) a <code>blocking:</code> comment on the <b>swallowed exception</b> returning null (mention what's lost or what should happen), (3) a <code>question:</code> — asked, not asserted — about what the <b>caller does with null</b>, (4) a <code>nit:</code> or <code>suggestion:</code> about the method name <code>load</code> being vague (suggest a better one like <code>loadOwnedDoc</code>).`,
starter:`1. blocking:
2. blocking:
3. question:
4. nit:
`,
solution:`1. blocking: userId is concatenated straight into the SQL — this is injectable. Use a PreparedStatement with a ? parameter instead of string building.
2. blocking: the catch swallows every exception and returns null — the failure cause is lost and callers can't tell "no doc" from "database down". Let it propagate or wrap it in a domain exception with the cause.
3. question: what does the caller do when this returns null — is there a null check on every call site, or would an Optional (or an exception) make the contract explicit?
4. nit: load is vague about scope — loadOwnedDoc(userId) would say what it loads and hint at the ownership rule.
`,
tests:[{d:'Injection flagged as blocking with the fix named',re:'1\\.\\s*blocking:[\\s\\S]*?(inject|concatenat)[\\s\\S]*?(PreparedStatement|\\bparameter)',flags:'i'},{d:'Swallowed exception flagged: cause lost / propagate',re:'2\\.\\s*blocking:[\\s\\S]*?(swallow|lost|propagate|wrap)',flags:'i'},{d:'Null contract raised as a QUESTION with a question mark',re:'3\\.\\s*question:[\\s\\S]*?\\?',flags:'i'},{d:'Naming nit offers a concrete alternative',re:'4\\.\\s*(nit|suggestion):[\\s\\S]*?loadOwnedDoc',flags:'i'},{d:'Comments target the code, not the person (no "you always/never")',re:'you\\s+(always|never)',not:true,flags:'i'}],
behavior:`1. The two real dangers carry blocking: — severity is information, and both name the fix, not just the crime. 2. The null-contract issue arrives as a genuine question — the reviewer might be missing context, and the question teaches either way. 3. The naming point is honestly labeled nit: — the author knows it won't block merge. 4. Every comment discusses the code's behavior; none discusses the author. That's the difference between a review culture people learn from and one they armor against. 5. Bonus you'd add in real life: one line about anything done well.`,
hints:['Severity labels are kindness: the author instantly knows the must-fix list from the take-it-or-leave-it list.','The question format is not politeness theater — phrased as a question, being wrong costs the reviewer nothing and the thread stays curious.','Both blocking comments follow the same shape: symptom → consequence → concrete alternative.']},{title:'Interview: reviewing a risky PR',lang:'text',
prompt:`A teammate opens a 900-line PR titled "refactor auth + add SSO + fix logging". You're the reviewer. One per numbered line: (1) the first problem is the PR's ____ — it should be several small PRs, not one (one word); (2) three unrelated changes in one PR make it hard to ____ if one breaks prod (one word — think undo a single change); (3) severity label for "this concatenates user input into SQL" (one word, the must-fix tag); (4) severity label for "consider renaming this variable" (one word, the take-it-or-leave-it tag); (5) you spot a real bug but you might be missing context — phrase it as a ____ not an assertion (one word); (6) one thing a good review always includes besides criticism (one word — what you say about the good parts).`,
starter:`1.
2.
3.
4.
5.
6.
`,
solution:`1. size
2. revert
3. blocking
4. nit
5. question
6. praise
`,
tests:[{d:'Q1: the PR is too large',re:'1\\.\\s*size|1\\.\\s*(too\\s+)?(large|big)',flags:'is'},{d:'Q2: bundled changes are hard to revert',re:'2\\.\\s*revert',flags:'is'},{d:'Q3: injection is blocking',re:'3\\.\\s*blocking',flags:'is'},{d:'Q4: naming is a nit',re:'4\\.\\s*nit',flags:'is'},{d:'Q5: ask, don\\u2019t assert',re:'5\\.\\s*question',flags:'is'},{d:'Q6: name what was done well',re:'6\\.\\s*praise|6\\.\\s*positive',flags:'is'}],
behavior:`1. Size — "refactor + feature + fix" in 900 lines guarantees a rubber-stamp "LGTM"; review quality collapses with size, so the first, kindest feedback is "please split this". 2. Revert — if this ships and prod breaks, you can't roll back the logging fix without also reverting SSO; bundled changes lose git's superpower. 3. Blocking — injection must change before merge; the label tells the author it's non-negotiable. 4. Nit — naming is take-it-or-leave-it; labeling it honestly means the author won't over-index on it. 5. Question — "what happens here on empty input?" teaches whether you're right OR wrong, and costs the author no face. 6. Praise — "this test names the bug it prevents, nice" teaches as much as any critique and builds the culture people stay for. Reviewing well is a distinct senior craft.`,
hints:['The biggest review problem is usually structural: PR size, before any single line.','Severity labels (blocking/nit/question) are kindness — they tell the author what MUST change vs what\\u2019s optional.','A review that\\u2019s all criticism trains people to fear reviews; one line of praise changes that.']},
{title:'Review this concurrency PR',lang:'text',
prompt:`Reviewing: <code>class Counter { private int n; public int next(){ return n++; } }</code> used across threads to hand out unique ids. Write a three-comment review, one per numbered line, each starting with a severity label: (1) a <code>blocking:</code> comment naming why <code>n++</code> is unsafe here (mention <b>atomic</b> or <b>race</b>) and a fix (mention <code>AtomicInteger</code>); (2) a <code>question:</code> — asked, not asserted — about whether ids must be unique across process <b>restarts</b> (which an in-memory int can't guarantee); (3) a <code>nit:</code> or <code>suggestion:</code> that <code>next</code> is a vague name (suggest <code>nextId</code>).`,
starter:`1. blocking:
2. question:
3. nit:
`,
solution:`1. blocking: n++ is a read-modify-write and isn't atomic — under concurrent access two threads can return the same id (a race). Use AtomicInteger and return getAndIncrement().
2. question: do these ids need to stay unique across process restarts? An in-memory int resets to 0 on restart — if so, we need a database sequence or a persisted counter, not a field.
3. nit: next is vague; nextId() would say what it returns and read better at call sites.
`,
tests:[{d:'Blocking: names the atomicity/race bug + AtomicInteger fix',re:'1\\.\\s*blocking:[\\s\\S]*?(atomic|race)[\\s\\S]*?AtomicInteger',flags:'i'},{d:'Question about uniqueness across restarts, with a "?"',re:'2\\.\\s*question:[\\s\\S]*?restart[\\s\\S]*?\\?',flags:'i'},{d:'Nit offers a concrete better name',re:'3\\.\\s*(nit|suggestion):[\\s\\S]*?nextId',flags:'i'},{d:'Comments address the code, not the author',re:'you\\s+(always|never)',not:true,flags:'i'}],
behavior:`1. The blocking comment names the exact defect (read-modify-write race) and the exact fix (AtomicInteger.getAndIncrement) — symptom, consequence, remedy, the shape of every good blocking note. 2. The restart question raises a design issue the diff can't answer: an in-memory counter resets to 0 on deploy, silently colliding with old ids — asked as a question because the reviewer might lack context, and instructive either way. 3. The naming point is honestly tagged nit so the author knows it won't block. 4. Not one comment attacks the person. That's the difference between a review culture engineers learn from and one they armor against — and it's a graded senior skill at every company that reviews well.`,
hints:['The blocking comment follows the template: symptom (race) → consequence (dup ids) → fix (AtomicInteger).','Q2 shows senior range: the concurrency bug is obvious, but the RESTART uniqueness gap is the one juniors miss.','Question-form for anything you\\u2019re not 100% sure of — being wrong then costs nothing and teaches you.']}]},

{id:'wrc5',title:'Incidents: mitigate first, learn always',body:`
<p>Production is down. What you do in the next ten minutes — and the next ten days — is among the most senior-differentiating skill sets in the field, and almost nobody teaches it.</p>
<p><b>During: mitigate first, diagnose second.</b> The instinct to find the bug is wrong-ordered — the user-facing clock is running. The triage sequence:</p>
<ul>
<li><b>1. What changed?</b> Ninety percent of incidents follow a change. Last deploy? Feature flag? Config push? Dependency's status page? <code>git log --since</code> and the deploy dashboard are your first minute.</li>
<li><b>2. Can we roll back / turn it off?</b> Rollback of the suspect deploy, flag off, traffic away — <i>mitigation restores users without requiring understanding</i>. The artifact-tag rollback from your CD lessons and the git revert from the Git stream are exactly this muscle. Fix-forward under pressure is plan B, chosen deliberately, not by ego.</li>
<li><b>3. Only then, diagnose</b> — with the telemetry you invested in earlier: logs with MDC request-ids (trace ONE failing request end to end), metrics for the shape (all requests or one endpoint? gradual or cliff? — a cliff points at a change, a ramp at a resource leak), and thread dumps when the service is alive-but-frozen: two dumps 10 seconds apart, and the threads that didn't move are your suspects — dozens parked in <code>WAITING</code> on the same pool means a starved pool (your bulkhead lesson, arriving as evidence).</li>
<li><b>Communicate on a cadence</b> — a status line every 15 minutes ("mitigated via rollback, root cause under investigation") costs 20 seconds and prevents the second incident: everyone important interrupting the people fixing the first one.</li>
</ul>
<p><b>After: the blameless postmortem.</b> Its premise is load-bearing: <i>the engineer acted reasonably given what they knew; the SYSTEM let a reasonable action cause damage</i> — so fix the system. Name a human cause and people hide the next near-miss; name a system cause and you get action items. The document: timeline (detection → mitigation → resolution, with timestamps), impact honestly quantified, <b>root causes plural</b> (there are always several: the bug AND the review that missed it AND the missing alert AND the slow rollback), and action items that are <i>specific, owned, and deadlined</i> — "add an alert on p99 &gt; 500ms, owner: you, by Friday" — never "be more careful", which is a wish wearing a checkbox.</p>
<p>The quiet payoff: teams that run honest postmortems convert every outage into infrastructure. Teams that don't, meet the same outage annually like a holiday.</p>`,
docs:[['Google SRE — managing incidents','https://sre.google/sre-book/managing-incidents/'],['Blameless postmortems — Etsy debriefing guide','https://www.etsy.com/codeascraft/blameless-postmortems/'],['Java thread dump analysis','https://docs.oracle.com/en/java/javase/21/troubleshoot/troubleshooting-tools.html']],
exs:[{title:'Incident triage drill',lang:'text',
prompt:`One per numbered line: (1) error rate jumped to 40% eight minutes after a deploy — your FIRST action: <code>rollback</code> or <code>debug the code</code>? (2) the first diagnostic question of any incident, three words, starts with "what"; (3) the service is up but every request hangs; you take two thread dumps 10s apart — which threads are the suspects: the ones that <code>moved</code> or the ones that <code>didn't</code>? (4) during a 90-minute incident, roughly how often do you post a status update (one number of minutes), (5) a postmortem names "engineer pushed without testing" as root cause — is that <code>blameless</code>? (yes/no), (6) which is a valid action item: <code>"be more careful with configs"</code> or <code>"add config validation to CI, owner Dana, by June 1"</code> (write <code>first</code> or <code>second</code>).`,
starter:`1.
2.
3.
4.
5.
6.
`,
solution:`1. rollback
2. what changed
3. didn't
4. 15
5. no
6. second
`,
tests:[{d:'Mitigate before diagnosing: rollback',re:'1\\.\\s*roll\\s*back|1\\.\\s*rollback',flags:'is'},{d:'"What changed" opens every triage',re:'2\\.\\s*what\\s+(has\\s+)?changed',flags:'is'},{d:'Frozen threads are the suspects',re:'3\\.\\s*didn',flags:'is'},{d:'~15-minute comms cadence',re:'4\\.\\s*15',flags:'is'},{d:'Naming a human is not blameless',re:'5\\.\\s*no',flags:'is'},{d:'Specific, owned, deadlined action item',re:'6\\.\\s*second',flags:'is'}],
behavior:`1. Rollback — eight minutes after a deploy, the correlation IS the hypothesis; users are restored in minutes and the bug can be studied calmly at 2pm instead of frantically at 2am. 2. "What changed" — incidents follow changes; the deploy log outranks the debugger. 3. The ones that didn't move — a live thread's stack varies between dumps; frozen stacks mark where everyone is stuck (same lock, same pool = your answer). 4. ~15 minutes — silence breeds a second incident of interruptions. 5. No — "pushed without testing" indicts a person; blameless asks why the SYSTEM allowed an untested push to reach production (missing CI gate = fixable). 6. Second — an owner and a date make it an action; the first is a hope.`,
hints:['Mitigation needs no understanding — that is precisely its virtue under a running clock.','Two dumps beat one: a single dump shows where threads ARE; the pair shows where they are STUCK.','Blameless test: does the root cause end in a system change, or in a person promising vigilance?']},{title:'Interview: walk me through an incident',lang:'text',
prompt:`"Checkout is throwing 500s for 30% of users. You're on call. Go." — the incident question, live. One per numbered line: (1) your literal first action is not to open the debugger but to check ____ ____ (two words — the usual culprit); (2) if the last deploy correlates, the fastest path to restoring users is ____ (one word), understanding can wait; (3) fixing forward under live pressure is plan ____ (one letter), chosen deliberately, not by ego; (4) to trace ONE failing request through the services you rely on logs carrying a correlated request ____ (one word); (5) every ~15 minutes during the incident you post a ____ ____ so leadership stops interrupting the responders (two words); (6) the doc written afterward is a ____ postmortem — its premise is the system failed, not a person (one word).`,
starter:`1.
2.
3.
4.
5.
6.
`,
solution:`1. what changed
2. rollback
3. B
4. id
5. status update
6. blameless
`,
tests:[{d:'Q1: check what changed first',re:'1\\.\\s*what\\s+changed',flags:'is'},{d:'Q2: rollback restores users fastest',re:'2\\.\\s*rollback',flags:'is'},{d:'Q3: fix-forward is plan B',re:'3\\.\\s*b\\b',flags:'is'},{d:'Q4: correlated request id',re:'4\\.\\s*id',flags:'is'},{d:'Q5: regular status updates',re:'5\\.\\s*status\\s+update',flags:'is'},{d:'Q6: blameless postmortem',re:'6\\.\\s*blameless',flags:'is'}],
behavior:`1. "What changed" — 90% of incidents follow a deploy, flag, or config push; the deploy dashboard outranks the debugger in minute one. 2. Rollback restores users WITHOUT requiring you to understand the bug — mitigation and diagnosis are different jobs and mitigation wins while the clock runs. 3. Fix-forward is plan B: sometimes necessary (a migration you can't reverse), but chosen with eyes open, never as a reflex to "just push the fix". 4. Request id in MDC-tagged logs lets you follow one doomed request across services (your logging lesson, arriving as evidence). 5. Status updates on a cadence prevent the SECOND incident — every VP DMing the responders. 6. Blameless — "why did the SYSTEM let a reasonable action cause this?" produces fixes; "who pushed it?" produces hiding. Interviewers listen for mitigate-before-diagnose; leading with "I'd read the stack trace" is the miss.`,
hints:['Mitigate before diagnose: rollback needs no understanding, and that\\u2019s exactly its value under a running clock.','"What changed?" is the first question of every incident — the deploy log beats the debugger.','Blameless isn\\u2019t soft: naming a person ends learning; naming a system gap produces an action item.']},
{title:'Write a blameless postmortem',lang:'text',
prompt:`A config change set a cache TTL to 0, every request hit the database, the DB fell over, checkout was down 45 minutes. Write the postmortem skeleton — a markdown doc, sections in order: (1) a <code># Postmortem:</code> title line naming the outage; (2) an <code>## Impact</code> section quantifying it (mention the ~45 minutes and checkout); (3) a <code>## Timeline</code> section with at least two timestamped-style entries (detection, mitigation); (4) a <code>## Root causes</code> section listing at least TWO causes (the config change AND a system gap like "no validation on TTL" or "no alert on cache hit rate") — plural, blameless, systemic; (5) an <code>## Action items</code> section with at least one item that is <b>specific and owned</b> (a name and a concrete change, not "be careful").`,
starter:`# Postmortem:

## Impact

## Timeline

## Root causes

## Action items
`,
solution:`# Postmortem: Checkout outage from cache TTL misconfiguration

## Impact
Checkout returned errors for ~45 minutes. ~30% of purchase attempts
failed during the window; estimated revenue impact quantified separately.

## Timeline
- 14:02 config change deployed, cache TTL set to 0
- 14:05 database CPU alert fires; checkout error rate climbs
- 14:11 on-call detects, identifies the 14:02 deploy as the change
- 14:14 config rolled back; cache repopulates, errors subside
- 14:47 fully recovered, monitoring confirms

## Root causes
- a config change set cache TTL to 0, sending all reads to the database
- no validation rejected a nonsensical TTL of 0 before deploy
- no alert on cache hit rate would have caught this in seconds, not minutes

## Action items
- add config validation rejecting TTL < 1s in CI — owner: Dana, by June 1
- add a cache-hit-rate alert with pager threshold — owner: Sam, by June 8
- document the rollback runbook for config changes — owner: Dana, by June 5
`,
tests:[{d:'Titled postmortem for the outage',re:'#\\s*Postmortem:',flags:'i'},{d:'Impact quantified (~45 min, checkout)',re:'##\\s*Impact[\\s\\S]*?(45|forty-five)[\\s\\S]*?(checkout|minute)',flags:'i'},{d:'Timeline has multiple timestamped entries',re:'##\\s*Timeline[\\s\\S]*?\\d\\d:\\d\\d[\\s\\S]*?\\d\\d:\\d\\d',flags:'i'},{d:'Root causes are PLURAL and include a system gap',re:'##\\s*Root causes[\\s\\S]*?-[\\s\\S]*?-[\\s\\S]*?(no\\s+validation|no\\s+alert|gap|missing)',flags:'i'},{d:'Action item is specific, owned and dated',re:'##\\s*Action items[\\s\\S]*?owner:\\s*\\w+[\\s\\S]*?(by\\s+\\w|/)',flags:'i'},{d:'No blame on a named person as a root cause',re:'root causes[\\s\\S]*?(fault of|blame|because\\s+\\w+\\s+was\\s+careless)',not:true,flags:'i'}],
behavior:`1. Impact leads and is quantified — "~45 min, 30% of checkouts" — because the first question anyone asks is "how bad". 2. The timeline with timestamps turns argument into fact: detection at 14:11, mitigation at 14:14 — and the gap between 14:05 (alert) and 14:11 (human) is itself an action item (why 6 minutes?). 3. Root causes PLURAL is the blameless heart: the config change AND the missing validation AND the missing alert — every one a system that can be fixed, none a person to punish. 4. Action items are specific, owned, dated — "add TTL validation to CI, Dana, June 1" is an action; "be more careful" is a wish. A team that writes these converts every outage into infrastructure; a team that doesn't meets it again next year.`,
hints:['Lead with quantified Impact — it\\u2019s the first thing every reader wants.','Root causes are always plural: the trigger AND the gaps that let the trigger cause damage.','"be more careful" is not an action item; "add validation X, owner Y, by date Z" is.']}]}
]});
