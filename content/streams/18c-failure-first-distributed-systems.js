STREAMS.push({icon:'🌩️',dan:true,title:'Failure-First: Distributed Systems',blurb:'Senior engineers design for the failure case first: timeouts, retries with jitter, idempotency, circuit breakers, and why clocks lie.',lessons:[
{id:'fdr1',title:'Partial failure: the mindset',body:`
<p>A single process fails simply: it's running or it's dead. The moment your system spans two machines and a network, a third state appears and never leaves: <b>partial failure</b> — some pieces working, some not, and (the cruel part) <b>you often can't tell which</b>. Senior distributed-systems thinking is one habit: <i>design for the failure case first; the success path is the easy 90%</i>.</p>
<p>The classic "eight fallacies of distributed computing" — assumptions juniors build on and networks demolish — compress into four you'll meet weekly:</p>
<ul>
<li><b>The network is NOT reliable.</b> Packets drop, connections die mid-request. Any remote call can fail — so every remote call needs a failure plan, not just the ones that "matter".</li>
<li><b>Latency is NOT zero, bandwidth is NOT infinite.</b> A chatty design (100 small calls per page) that flies on localhost crawls across a real network. This is why batch endpoints and caches exist.</li>
<li><b>The scariest failure isn't "no" — it's silence.</b> A request times out: did the server never get it? Get it and crash? <b>Get it, do the work, and die before answering?</b> All three look identical from your side. This single ambiguity creates the next three lessons: timeouts (how long to wait), retries (asking again safely), and idempotency (making "again" harmless).</li>
<li><b>There is no "now".</b> Two machines never agree exactly what time it is — the clocks lesson closes the stream with what that breaks.</li>
</ul>
<div class="codeSample">you ──── request ────▶ ??? ──── (no answer) ────
three indistinguishable worlds:
  1. request lost      → work NOT done   → safe to retry
  2. server crashed    → work NOT done   → safe to retry
  3. RESPONSE lost     → work WAS done   → retry duplicates it!   ← the whole problem</div>
<p>One more senior reflex to install now: <b>failures cascade</b>. A slow dependency fills your thread pool with waiting requests; your service slows; YOUR callers' pools fill; three hops later the login page is down because a thumbnail service hiccuped. Every pattern in this stream — timeout, retry budget, circuit breaker, bulkhead — is a firebreak against exactly that spread.</p>`,
docs:[['The 8 fallacies — annotated','https://architecturenotes.co/fallacies-of-distributed-systems/'],['AWS builders library — timeouts & retries','https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/'],['Notes on distributed systems for young bloods','https://www.somethingsimilar.com/2013/01/14/notes-on-distributed-systems-for-young-bloods/']],
ex:{title:'Failure literacy drill',lang:'text',
prompt:`One per numbered line: (1) a request times out — from the caller's side, do you know whether the work was done: <code>yes</code> or <code>no</code>? (2) of the three timeout worlds (request lost / server crashed before work / response lost after work), which one makes blind retrying dangerous (write <code>response lost</code> or the world number <code>3</code>), (3) 100 sequential small remote calls per page is bad because latency is not ____ (one word), (4) a slow downstream dependency fills your thread pool — this spreading failure is called a ____ failure (one word, think dominoes), (5) true or false: a failure plan is only needed for the "important" remote calls, (6) two servers disagree about the current time — is that a bug or normal operation (one word)?`,
starter:`1.
2.
3.
4.
5.
6.
`,
solution:`1. no
2. response lost
3. zero
4. cascading
5. false
6. normal
`,
tests:[{d:'Q1: a timeout tells you nothing about the work',re:'1\\.\\s*no',flags:'is'},{d:'Q2: the response-lost world makes retries duplicate',re:'2\\.\\s*(response\\s+lost|3)',flags:'is'},{d:'Q3: latency is not zero',re:'3\\.\\s*zero',flags:'is'},{d:'Q4: cascading failure',re:'4\\.\\s*cascad',flags:'is'},{d:'Q5: every remote call needs a plan — false',re:'5\\.\\s*false',flags:'is'},{d:'Q6: clock disagreement is normal',re:'6\\.\\s*normal',flags:'is'}],
behavior:`1. No — and designing as if you knew is the root bug of naive distributed code. 2. World 3: the work happened, the answer died — retrying charges the card twice. This is why idempotency gets its own lesson. 3. Zero — chatty designs pay the network round-trip tax per call. 4. Cascading — pools fill, callers stall, unrelated features die three hops away. 5. False — "unimportant" calls share thread pools with important ones; see Q4. 6. Normal — clock skew is physics plus NTP, not a misconfiguration to file a ticket about.`,
hints:['Q1-Q2 are the same insight twice: silence is ambiguous, and one of its worlds already did the work.','Q4: the dependency did not take your service down — your WAITING for it did.','Q5-Q6 test the mindset shift: failure and skew are the default weather, not storms.']}},

{id:'fdr2',title:'Timeouts, retries & backoff with jitter',body:`
<p>Two disciplines turn "the network is unreliable" from terror into arithmetic. Both look trivial; both are done wrong everywhere.</p>
<p><b>Timeouts: every remote call has one, and a budget.</b> No timeout means a hung dependency parks your thread forever (the cascading lesson made this a pool-filler). But timeouts must also <i>nest</i>: if your caller gives you 2s and you call two services, their timeouts must fit inside — say 800ms each plus your own work — or you'll still be diligently working on a request whose caller hung up long ago. That's a <b>timeout budget</b>: the deadline flows down the call chain, each hop spending part of it.</p>
<p><b>Retries: powerful, and a loaded weapon.</b> A transient blip (dropped packet, rolling deploy) deserves one cheap retry. But naive retrying has two famous failure modes:</p>
<ul>
<li><b>Retry amplification</b> — you retry 3×, your caller retries 3×, their caller retries 3×: one user click becomes 27 requests at the worst possible moment — while the dependency is already struggling. Retry at ONE layer (usually the edge), not every layer.</li>
<li><b>The thundering herd</b> — a service dies for 10s; 10,000 clients all retry on the same fixed 1s interval; it comes back to a perfectly synchronized battering ram and dies again. The fix is two-part: <b>exponential backoff</b> (wait 1s, 2s, 4s, 8s — pressure decays) and <b>jitter</b> (randomize each wait — the herd spreads into a drizzle). Full jitter — <code>sleep(random(0, base × 2^attempt))</code> — is the standard.</li>
</ul>
<div class="codeSample">attempt 1  ──fail──▶  wait random(0, 1s)
attempt 2  ──fail──▶  wait random(0, 2s)
attempt 3  ──fail──▶  wait random(0, 4s)
attempt 4  ──fail──▶  give up — surface the error honestly
(and only retry SAFE-to-repeat operations — the next lesson makes them safe)</div>
<p>Two more rules complete the kit: <b>cap the attempts</b> (a retry budget — infinite patience is an outage prolonger), and <b>only retry retryable things</b> — a 503 or timeout, yes; a 400 Bad Request will be exactly as bad the fourth time. Idempotency (next lesson) is what makes even the scary world-3 retry safe.</p>`,
docs:[['Exponential backoff & jitter — AWS','https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/'],['Google SRE — handling overload','https://sre.google/sre-book/handling-overload/'],['Resilience4j — retry','https://resilience4j.readme.io/docs/retry']],
ex:{title:'Implement backoff with jitter',
prompt:`Write class <code>Retry</code> with <code>static &lt;T&gt; T withBackoff(java.util.function.Supplier&lt;T&gt; call, int maxAttempts, long baseMillis)</code>: a for loop over attempts; call <code>call.get()</code> in a try and return its result; on <code>RuntimeException</code>: if this was the last attempt (<code>attempt == maxAttempts - 1</code>), <b>rethrow</b>; otherwise compute exponential-with-full-jitter sleep: <code>long cap = baseMillis * (1L &lt;&lt; attempt)</code> then <code>long wait = java.util.concurrent.ThreadLocalRandom.current().nextLong(cap + 1)</code>, sleep via <code>Thread.sleep(wait)</code> (wrap the <code>InterruptedException</code>: re-interrupt with <code>Thread.currentThread().interrupt()</code> and throw <code>new RuntimeException(e)</code>). After the loop <code>throw new IllegalStateException("unreachable")</code>.`,
starter:`import java.util.concurrent.ThreadLocalRandom;
import java.util.function.Supplier;

public class Retry {

    static <T> T withBackoff(Supplier<T> call, int maxAttempts, long baseMillis) {
        return null;
    }
}`,
solution:`import java.util.concurrent.ThreadLocalRandom;
import java.util.function.Supplier;

public class Retry {

    static <T> T withBackoff(Supplier<T> call, int maxAttempts, long baseMillis) {
        for (int attempt = 0; attempt < maxAttempts; attempt++) {
            try {
                return call.get();
            } catch (RuntimeException e) {
                if (attempt == maxAttempts - 1) {
                    throw e;
                }
                long cap = baseMillis * (1L << attempt);
                long wait = ThreadLocalRandom.current().nextLong(cap + 1);
                try {
                    Thread.sleep(wait);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException(ie);
                }
            }
        }
        throw new IllegalStateException("unreachable");
    }
}`,
tests:[{d:'Bounded attempts — a for loop over maxAttempts',re:'for\\s*\\(\\s*int\\s+attempt\\s*=\\s*0\\s*;\\s*attempt\\s*<\\s*maxAttempts'},{d:'Success returns immediately from inside the try',re:'try\\s*\\{\\s*return\\s+call\\.get\\s*\\(\\s*\\)'},{d:'Last attempt rethrows instead of sleeping',re:'attempt\\s*==\\s*maxAttempts\\s*-\\s*1[\\s\\S]*?throw\\s+e'},{d:'Exponential cap via bit shift',re:'baseMillis\\s*\\*\\s*\\(\\s*1L\\s*<<\\s*attempt\\s*\\)'},{d:'FULL jitter: random in [0, cap]',re:'ThreadLocalRandom\\.current\\s*\\(\\s*\\)\\s*\\.nextLong\\s*\\(\\s*cap\\s*\\+\\s*1\\s*\\)'},{d:'Interrupt status restored before wrapping',re:'Thread\\.currentThread\\s*\\(\\s*\\)\\s*\\.interrupt\\s*\\(\\s*\\)[\\s\\S]*?throw\\s+new\\s+RuntimeException'}],
behavior:`1. A supplier that succeeds immediately returns with zero sleeps. 2. One that fails twice then succeeds sleeps ~random(0,base) then ~random(0,2·base) and returns the third result. 3. One that always fails throws its own exception after exactly maxAttempts calls — bounded budget, honest surfacing. 4. Two thousand instances retrying the same dead service wake at scattered moments — the jitter IS the herd-dispersal. 5. Interrupting the sleeping thread propagates promptly with interrupt status intact (the concurrency stream's etiquette, honored under pressure).`,
hints:['The shape is: try { return } catch { last? rethrow : sleep-and-loop } — nothing else.','1L << attempt is 2^attempt without Math.pow — and the L keeps 31+ attempts from overflowing int.','Full jitter means the FLOOR is zero: nextLong(cap + 1) picks uniformly in [0, cap] — not cap itself, not cap/2 + random.']}},

{id:'fdr3',title:'Idempotency: making retries safe',body:`
<p>Lesson 1 left a bomb armed: in the response-lost world, the work <i>happened</i> — retrying duplicates it. "Exactly-once delivery" — the dream of the network guaranteeing each request is processed once — is <b>provably impossible</b> over an unreliable network (you cannot distinguish the three silent worlds, so you must choose: give up (at-most-once) or retry (at-least-once)). Seniors stop chasing exactly-once <i>delivery</i> and build the practical equivalent: <b>at-least-once delivery + idempotent processing = effectively-once outcome</b>.</p>
<p><b>Idempotent</b> = doing it twice has the same effect as doing it once. Some operations are born idempotent: <code>PUT /users/7 {name: "Ada"}</code> (absolute assignment), <code>DELETE /orders/9</code> (already gone? fine), your dojo's "mark lesson done". Others are born dangerous: <code>POST /payments {amount: 50}</code> — twice is twice the money. The rule of thumb: <i>absolute state ("set X to 5") is idempotent; relative change ("add 5 to X") is not</i>.</p>
<p>The universal cure for the dangerous kind is the <b>idempotency key</b>: the CLIENT mints a unique id per logical operation (not per attempt!) and sends it with every retry; the server remembers processed keys and answers duplicates with the <i>original</i> result instead of redoing the work:</p>
<div class="codeSample">client:  POST /payments   Idempotency-Key: 7f3a-...   (same key on every retry)
server:  seen 7f3a before?  ──no──▶  process, STORE (key → result), reply
                            ──yes─▶  reply with the stored result — do nothing
the store: unique index on the key column — the DATABASE enforces once,
           atomically, even when two retries race in concurrently</div>
<p>Details that separate toy from production: the key must be stored <b>in the same transaction</b> as the work's effects (else you can crash between them and re-arm the bomb); keys can expire after a retention window (24h covers any sane retry storm); and Stripe's API made <code>Idempotency-Key</code> a de-facto standard header worth copying. You've met this pattern's siblings already: the Kafka consumer's processed-ids set, and the outbox pattern's exactly-once-ish publishing — same idea, different boundary. <i>Idempotency is not an optimization; it's what makes lesson 2's retries legal.</i></p>`,
docs:[['Stripe — idempotent requests','https://docs.stripe.com/api/idempotent_requests'],['You cannot have exactly-once delivery','https://bravenewgeek.com/you-cannot-have-exactly-once-delivery/'],['AWS builders library — idempotency','https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/']],
ex:{title:'Build the idempotent handler',
prompt:`Write class <code>PaymentHandler</code>: a <code>private final java.util.concurrent.ConcurrentHashMap&lt;String, String&gt; processed = new java.util.concurrent.ConcurrentHashMap&lt;&gt;()</code> as the key store, and a <code>private final java.util.List&lt;String&gt; charges = java.util.Collections.synchronizedList(new java.util.ArrayList&lt;&gt;())</code> as the "effects". Method <code>String charge(String idempotencyKey, String payload)</code>: use <b>one atomic</b> <code>processed.computeIfAbsent(idempotencyKey, k -&gt; { charges.add(payload); return "charged:" + payload; })</code> and return its result — duplicates (and concurrent duplicates) get the stored answer while the charge happens at most once. Add <code>int chargeCount()</code> returning <code>charges.size()</code>.`,
starter:`import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

public class PaymentHandler {

    // your code
}`,
solution:`import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

public class PaymentHandler {

    private final ConcurrentHashMap<String, String> processed = new ConcurrentHashMap<>();
    private final List<String> charges = Collections.synchronizedList(new ArrayList<>());

    String charge(String idempotencyKey, String payload) {
        return processed.computeIfAbsent(idempotencyKey, k -> {
            charges.add(payload);
            return "charged:" + payload;
        });
    }

    int chargeCount() {
        return charges.size();
    }
}`,
tests:[{d:'Concurrent key store, not a plain HashMap',re:'ConcurrentHashMap<String,\\s*String>\\s+processed'},{d:'Effects list is thread-safe',re:'Collections\\.synchronizedList\\s*\\(\\s*new\\s+ArrayList<>\\s*\\(\\s*\\)\\s*\\)'},{d:'ONE atomic computeIfAbsent guards work + memory',re:'return\\s+processed\\.computeIfAbsent\\s*\\(\\s*idempotencyKey'},{d:'The charge happens inside the mapping function',re:'computeIfAbsent\\s*\\([\\s\\S]*?charges\\.add\\s*\\(\\s*payload\\s*\\)[\\s\\S]*?return\\s+"charged:"'},{d:'No check-then-act race (no containsKey/get before)',re:'containsKey|\\.get\\s*\\(\\s*idempotencyKey\\s*\\)',not:true}],
behavior:`1. charge("k1", "50eur") → "charged:50eur", chargeCount() == 1. 2. The retry charge("k1", "50eur") → the SAME string, chargeCount() STILL 1 — the response-lost world is now harmless. 3. A different key charges again: count 2. 4. Two threads racing the same key: computeIfAbsent guarantees the mapping function runs once — one charge, both callers get the stored result. A containsKey-then-put version has a race window exactly where the money is. 5. In production the map is a table with a unique index and the charge shares its transaction — same shape, durable.`,
hints:['The entire safety argument lives in ONE method call being atomic — computeIfAbsent is check+work+store fused.','If you wrote if (processed.containsKey(...)) first, two concurrent retries both pass the check — that gap is a double charge.','Key per logical operation (client mints it once), not per attempt — retries REUSE it; that is the whole trick.']}},

{id:'fdr4',title:'Circuit breakers & bulkheads',body:`
<p>Retries handle a dependency's <i>bad moment</i>. But when a dependency is properly down, retrying into it is worse than useless: every attempt burns a thread for a full timeout, your pool drains, and the cascade from lesson 1 begins — you become the outage's next victim <i>and its amplifier</i>. Two patterns contain it.</p>
<p><b>The circuit breaker</b> wraps calls to a dependency and behaves like the electrical original — it trips under fault and stops the flow:</p>
<div class="codeSample">CLOSED  ── calls flow; count recent failures ──▶ threshold crossed ──▶ OPEN
OPEN    ── calls FAIL IMMEDIATELY (no thread parked, no timeout burned)
           dependency gets silence in which to recover
           after a cool-down: ──▶ HALF_OPEN
HALF_OPEN ── let ONE probe through:  success → CLOSED (normal service resumes)
                                     failure → OPEN  (another cool-down)</div>
<p>The subtle virtues: failing <i>fast</i> keeps your own latency honest (a 2ms "dependency unavailable" beats a 30s timeout), the caller gets a clean signal to degrade gracefully (Skywatch's 503-or-stale-cache lesson — same philosophy), and the open circuit is <i>mercy for the dependency</i> — recovery under zero load is 10× easier than under a retry storm. In production you use resilience4j rather than hand-rolling; you hand-roll one today because the state machine <b>is</b> the understanding.</p>
<p><b>Bulkheads</b> attack the other half of the cascade: shared thread pools. If calls to the slow thumbnail service and calls to the payment service share one pool, thumbnails hanging = payments starving — one compartment's flood sinks the ship. The bulkhead: <b>a separate, bounded pool (or semaphore) per dependency</b> — thumbnails may exhaust <i>their</i> 10 threads and queue at <i>their</i> door; payments' threads never notice. Same principle as the runner service being its own container in your launch plan: isolation is decided at design time, not hoped for at runtime.</p>
<p>The kit assembled — timeout (bound each wait), retry+jitter (survive blips), idempotency (make retries legal), breaker (stop hammering the fallen), bulkhead (contain the flood): five small patterns that together are most of "resilience engineering".</p>`,
docs:[['Fowler — CircuitBreaker','https://martinfowler.com/bliki/CircuitBreaker.html'],['resilience4j — circuitbreaker','https://resilience4j.readme.io/docs/circuitbreaker'],['Release It! — stability patterns (Nygard)','https://pragprog.com/titles/mnee2/release-it-second-edition/']],
ex:{title:'Hand-roll the breaker',
prompt:`Write class <code>CircuitBreaker</code> with an enum <code>State { CLOSED, OPEN, HALF_OPEN }</code>, fields <code>private State state = State.CLOSED</code>, <code>private int failures = 0</code>, and finals <code>int threshold</code> + <code>long coolDownMillis</code> + <code>private long openedAt</code> (constructor takes threshold and coolDownMillis). One <b>synchronized</b> method <code>&lt;T&gt; T call(java.util.function.Supplier&lt;T&gt; op)</code>: if OPEN and <code>System.currentTimeMillis() - openedAt &lt; coolDownMillis</code> → <code>throw new IllegalStateException("circuit open")</code>; if OPEN and cool-down elapsed → set HALF_OPEN. Then try <code>op.get()</code>: on success set CLOSED, zero failures, return; on RuntimeException: increment failures, and if HALF_OPEN <b>or</b> failures &gt;= threshold → set OPEN and record <code>openedAt = System.currentTimeMillis()</code>; rethrow. Add <code>State state()</code>.`,
starter:`import java.util.function.Supplier;

public class CircuitBreaker {

    enum State { CLOSED, OPEN, HALF_OPEN }

    // your code
}`,
solution:`import java.util.function.Supplier;

public class CircuitBreaker {

    enum State { CLOSED, OPEN, HALF_OPEN }

    private State state = State.CLOSED;
    private int failures = 0;
    private long openedAt = 0;
    private final int threshold;
    private final long coolDownMillis;

    CircuitBreaker(int threshold, long coolDownMillis) {
        this.threshold = threshold;
        this.coolDownMillis = coolDownMillis;
    }

    synchronized <T> T call(Supplier<T> op) {
        if (state == State.OPEN) {
            if (System.currentTimeMillis() - openedAt < coolDownMillis) {
                throw new IllegalStateException("circuit open");
            }
            state = State.HALF_OPEN;
        }
        try {
            T result = op.get();
            state = State.CLOSED;
            failures = 0;
            return result;
        } catch (RuntimeException e) {
            failures++;
            if (state == State.HALF_OPEN || failures >= threshold) {
                state = State.OPEN;
                openedAt = System.currentTimeMillis();
            }
            throw e;
        }
    }

    synchronized State state() {
        return state;
    }
}`,
tests:[{d:'Open circuit fails fast during cool-down',re:'state\\s*==\\s*State\\.OPEN[\\s\\S]*?coolDownMillis[\\s\\S]*?IllegalStateException\\s*\\(\\s*"circuit open"'},{d:'Cool-down elapsed → HALF_OPEN probe allowed',re:'state\\s*=\\s*State\\.HALF_OPEN'},{d:'Success closes and resets the count',re:'state\\s*=\\s*State\\.CLOSED\\s*;\\s*failures\\s*=\\s*0'},{d:'Half-open failure OR threshold trips it open with a timestamp',re:'state\\s*==\\s*State\\.HALF_OPEN\\s*\\|\\|\\s*failures\\s*>=\\s*threshold[\\s\\S]*?openedAt\\s*=\\s*System\\.currentTimeMillis'},{d:'Original exception rethrown, not swallowed',re:'catch\\s*\\(\\s*RuntimeException\\s+e\\s*\\)[\\s\\S]*?throw\\s+e'},{d:'State transitions are synchronized',re:'synchronized\\s+<T>\\s+T\\s+call'}],
behavior:`1. threshold 3: two failures → still CLOSED (blips tolerated); the third → OPEN. 2. While OPEN, call() throws "circuit open" in microseconds — no thread parked on a doomed 30s timeout, and the dependency hears silence. 3. After coolDownMillis, exactly one probe passes (HALF_OPEN): success → CLOSED with a clean slate; failure → OPEN again for another cool-down. 4. The caller catches IllegalStateException and degrades (cached data, honest 503) — fail-fast turns an outage into a feature flag. 5. synchronized keeps racing threads from double-transitioning — correctness first; a production breaker swaps in atomics.`,
hints:['Write the state diagram as comments first; the method is just the diagram transcribed.','HALF_OPEN is the load-bearing state: ONE probe decides, which is why a half-open failure trips immediately regardless of count.','Fail-fast is the point: the throw in the OPEN branch is the pattern working, not an error case.']}},

{id:'fdr5',title:'Clocks lie: time & ordering',body:`
<p>The last fallacy runs deepest because it feels like physics betraying you: <b>there is no shared "now" between machines</b>. Every server's clock drifts; NTP corrects them within tens of milliseconds at best — and correction itself can <i>step a clock backwards</i>. From this, three working rules:</p>
<ul>
<li><b>Never measure elapsed time with the wall clock.</b> <code>System.currentTimeMillis()</code> answers "what time is it?" — and can jump backward mid-measurement (NTP step, leap smear), giving your "duration" a negative value that will crash something eventually. <code>System.nanoTime()</code> answers the other question — "how long has it been?" — monotonic, never steps back, meaningless as a date. Wall clock for timestamps humans read; <b>monotonic clock for every duration, timeout and benchmark</b>. (Your circuit breaker used currentTimeMillis for a cool-down — fine for tens of seconds; a high-precision timeout would want nanoTime. Knowing why is the lesson.)</li>
<li><b>Never use timestamps to order events across machines.</b> Two servers stamp two chat messages; server B's clock runs 80ms ahead; "sort by timestamp" now shows the reply before the question. Cross-machine ordering needs a <b>logical</b> source: a per-conversation sequence from the database (your chat-design drill answered this), an auto-increment id, or — in fully distributed settings — Lamport-style logical clocks, whose one-line essence is <i>"causality increments a counter; clocks don't vote"</i>.</li>
<li><b>Beware the deceptively hard nearby problems.</b> Distributed locks with expiry ("I hold it for 10s" — says whose clock?), exactly-at-midnight jobs on N servers (N executions), TTL-based coordination — each is a clock-skew bug wearing a feature costume. The senior reflex: any sentence coordinating machines via wall-clock time gets redesigned around a single writer, a database constraint, or a logical sequence.</li>
</ul>
<div class="codeSample">// measuring elapsed time — the one honest way:
long t0 = System.nanoTime();
doWork();
long elapsedMs = (System.nanoTime() - t0) / 1_000_000;   // immune to NTP shenanigans

// ordering chat messages — the one honest way:
//   messages(conversation_id, seq BIGINT, ...)  seq from the DB, not from clocks
</div>
<p>Full ordering-under-partition (vector clocks, consensus, Spanner's atomic clocks) is a rabbit hole with excellent books at the bottom; the working-senior 90% is these three rules applied without exception. They cost nothing and each prevents a bug that is miserable to reproduce — the worst kind.</p>`,
docs:[['Kleppmann — ch. 8, the trouble with clocks','https://dataintensive.net/'],['System.nanoTime — Javadoc','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/System.html#nanoTime()'],['Lamport clocks — the paper, gently','https://martinfowler.com/articles/patterns-of-distributed-systems/lamport-clock.html']],
ex:{title:'Clock discipline drill',lang:'text',
prompt:`One per numbered line: (1) which Java call measures elapsed time safely: <code>System.currentTimeMillis</code> or <code>System.nanoTime</code>? (2) can currentTimeMillis move backwards during normal operation — <code>yes</code> or <code>no</code>? (3) two servers timestamp two chat messages 80ms apart in wall time — is "sort by timestamp" a correct ordering strategy (<code>yes</code>/<code>no</code>)? (4) the honest cross-machine ordering source for one conversation (one word, from the chat drill), (5) "the lock expires in 10 seconds" — name the hidden question that makes this dangerous (three words, starts with <code>whose</code>), (6) a nightly job configured "at 00:00" on 4 identical servers runs how many times (one number)?`,
starter:`1.
2.
3.
4.
5.
6.
`,
solution:`1. System.nanoTime
2. yes
3. no
4. sequence
5. whose clock decides
6. 4
`,
tests:[{d:'Q1: nanoTime for durations',re:'1\\.\\s*(System\\.)?nanoTime',flags:'is'},{d:'Q2: wall clocks step backwards — yes',re:'2\\.\\s*yes',flags:'is'},{d:'Q3: timestamp ordering across machines — no',re:'3\\.\\s*no',flags:'is'},{d:'Q4: a sequence, not a clock',re:'4\\.\\s*sequence',flags:'is'},{d:'Q5: whose clock decides',re:'5\\.\\s*whose\\s+clock',flags:'is'},{d:'Q6: all four servers fire',re:'6\\.\\s*4|6\\.\\s*four',flags:'is'}],
behavior:`1. nanoTime — monotonic, built for exactly this. 2. Yes — NTP corrections step clocks; negative "durations" follow. 3. No — 80ms of skew reorders a conversation; humans notice immediately. 4. A per-conversation sequence from the single writer (the database) — causality by construction. 5. Whose clock decides — the locker's? the store's? skew between them silently shortens or lengthens every lease. 6. 4 — each server's cron is honest and local; without a leader election or a locked job table, "the" job is four jobs. All six are one rule: clocks answer "roughly when for humans", never "in what order for machines".`,
hints:['Two clocks, two questions: what-time-is-it (wall) vs how-long-has-it-been (monotonic). Mixing them is the bug.','Q4-Q6 share one fix: route ordering/uniqueness through a single authority (DB sequence, unique index, leader).','Q5 is the interview classic: distributed locks with TTL are correct only when a fencing token rides along.']}}
]});
