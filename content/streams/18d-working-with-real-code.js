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
ex:{title:'Archaeology drill',lang:'shell',
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
hints:['The pickaxe (-S) answers "when did this name enter/leave the codebase" — the single best archaeology tool.','-L takes start,end before the filename.','Q4 has a name worth knowing in reviews: Chesterton\\u2019s fence — never remove a fence until you know why it stands.']}},

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
ex:{title:'Pin the legacy calculator',
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
hints:['You are documenting what IS, not what OUGHT — resist the itch to "fix" while pinning; that itch gets its own commit later.','The probing workflow: assert something absurd, run, copy the truth from the failure message into the assertion.','The _pinned suffix and comment are communication: future readers must not "helpfully" delete the weird tests.']}},

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
ex:{title:'Name the move',lang:'text',
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
hints:['A comment naming WHAT a block does is a method name in captivity — free it.','Q3-Q4 are your OOP streams recurring as refactoring moves: SRP and polymorphism as verbs, not nouns.','Q6: the fig strangles gradually — the tree (old system) stays alive until the fig fully replaces it.']}},

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
ex:{title:'Review this diff',lang:'text',
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
hints:['Severity labels are kindness: the author instantly knows the must-fix list from the take-it-or-leave-it list.','The question format is not politeness theater — phrased as a question, being wrong costs the reviewer nothing and the thread stays curious.','Both blocking comments follow the same shape: symptom → consequence → concrete alternative.']}},

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
ex:{title:'Incident triage drill',lang:'text',
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
hints:['Mitigation needs no understanding — that is precisely its virtue under a running clock.','Two dumps beat one: a single dump shows where threads ARE; the pair shows where they are STUCK.','Blameless test: does the root cause end in a system change, or in a person promising vigilance?']}}
]});
