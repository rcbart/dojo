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
exs:[{title:'Failure literacy drill',lang:'text',
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
hints:['Q1-Q2 are the same insight twice: silence is ambiguous, and one of its worlds already did the work.','Q4: the dependency did not take your service down — your WAITING for it did.','Q5-Q6 test the mindset shift: failure and skew are the default weather, not storms.']},{title:'Interview: the dual-write problem',lang:'text',
prompt:`A staff-level favorite. Your service must write an order to Postgres AND publish an "order placed" event to Kafka. One per numbered line: (1) you write to the DB, then the process crashes before publishing — the two systems are now ____ (one word, think agreement); (2) you publish first, then the DB write fails — downstream consumers now believe in an order that doesn't ____ (one word); (3) there is no atomic transaction spanning a database and a message broker — true or false; (4) the pattern that fixes this by writing the event into the SAME db transaction as the order, into an events table (one word, you met it in the Spring stream); (5) a separate process then reads that table and publishes, marking rows sent — this gives ____-least-once delivery (one word); (6) because it's at-least-once, consumers must be ____ (one word, the fdr3 property).`,
starter:`1.
2.
3.
4.
5.
6.
`,
solution:`1. inconsistent
2. exist
3. true
4. outbox
5. at
6. idempotent
`,
tests:[{d:'Q1: crash between writes = inconsistency',re:'1\\.\\s*inconsist',flags:'is'},{d:'Q2: phantom event for a non-existent order',re:'2\\.\\s*exist',flags:'is'},{d:'Q3: no XA across DB and broker — true',re:'3\\.\\s*true',flags:'is'},{d:'Q4: the outbox pattern',re:'4\\.\\s*outbox',flags:'is'},{d:'Q5: at-least-once delivery',re:'5\\.\\s*at\\b',flags:'is'},{d:'Q6: idempotent consumers close the loop',re:'6\\.\\s*idempotent',flags:'is'}],
behavior:`1-2. The dual-write problem stated both directions: whichever you do first, a crash between the two leaves the systems disagreeing — a phantom or a lost event. 3. True — the seductive "just use a distributed transaction" doesn't exist between Postgres and Kafka in practice; accepting this is the start of wisdom. 4. Outbox: the event row and the business row commit together (one transaction, one system, atomic by construction) — the impossible cross-system atomicity sidestepped. 5. At-least-once: the relay may crash after publishing but before marking sent, and re-publish — duplicates are possible by design. 6. Idempotent — which is exactly why fdr3 exists; outbox and idempotency are two halves of one solution.`,
hints:['Every "write to DB and queue" question is this trap — name it before proposing the fix.','The key trick: convert a cross-system problem into a single-system transaction (the outbox row).','Q5-Q6 are inseparable: at-least-once delivery is only safe because consumers dedupe.']},
{title:'Interview: at-most vs at-least once',lang:'text',
prompt:`Delivery semantics, asked to probe depth. One per numbered line: (1) "send, don't retry, tolerate loss" is ____-most-once (one word); (2) "retry until acked, tolerate duplicates" is ____-least-once (one word); (3) true exactly-once <b>delivery</b> over an unreliable network is <code>possible</code> or <code>impossible</code>? (4) the practical stand-in the industry actually ships: at-least-once delivery PLUS idempotent processing = effectively-____ (one word); (5) for a metrics pipeline emitting 1M points/s where losing 0.01% is fine, which semantic is the right cost choice (write <code>at-most-once</code> or <code>at-least-once</code>); (6) for charging a credit card, which semantic — and it's only safe because of the fdr3 mechanism (name the semantic, one hyphenated phrase).`,
starter:`1.
2.
3.
4.
5.
6.
`,
solution:`1. at
2. at
3. impossible
4. once
5. at-most-once
6. at-least-once
`,
tests:[{d:'Q1: at-most-once = lossy, no retry',re:'1\\.\\s*at\\b',flags:'is'},{d:'Q2: at-least-once = retried, duplicated',re:'2\\.\\s*at\\b',flags:'is'},{d:'Q3: exactly-once delivery is impossible',re:'3\\.\\s*impossible',flags:'is'},{d:'Q4: effectively-once is the shippable goal',re:'4\\.\\s*once',flags:'is'},{d:'Q5: metrics tolerate at-most-once',re:'5\\.\\s*at[- ]?most[- ]?once',flags:'is'},{d:'Q6: payments need at-least-once + idempotency',re:'6\\.\\s*at[- ]?least[- ]?once',flags:'is'}],
behavior:`1-2. The two honest choices the network permits: give up (lose some) or retry (duplicate some). 3. Impossible — you cannot distinguish "lost request" from "lost response", so you must pick which error to tolerate. 4. Effectively-once — at-least-once wire delivery + dedupe at the consumer = the business outcome of exactly-once without the impossible guarantee. 5. At-most-once: for high-volume metrics, retrying is more expensive than the rounding error a dropped point causes — the RIGHT laziness. 6. At-least-once for payments, made safe by idempotency keys — never at-most-once (a silently dropped charge is a lost sale and an angry merchant). Choosing semantics per use-case by cost is the senior move.`,
hints:['Two knobs, pick your poison: lose messages, or duplicate them — never neither.','Q5 vs Q6 is the whole lesson: the SAME impossibility, opposite correct choices, decided by what an error costs.','"Effectively once" is the phrase that signals you understand the impossibility instead of denying it.']}]},

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
exs:[{title:'Implement backoff with jitter',
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
hints:['The shape is: try { return } catch { last? rethrow : sleep-and-loop } — nothing else.','1L << attempt is 2^attempt without Math.pow — and the L keeps 31+ attempts from overflowing int.','Full jitter means the FLOOR is zero: nextLong(cap + 1) picks uniformly in [0, cap] — not cap itself, not cap/2 + random.']},{title:'Deadline propagation',
prompt:`Interview scenario: a request enters with a budget and must not let downstream calls outlive it (timeout budgets, lesson fdr2). Write class <code>Deadline</code>: a <code>private final long deadlineNanos</code>; a static factory <code>static Deadline in(long millis)</code> returning <code>new Deadline(System.nanoTime() + millis * 1_000_000)</code> (make the constructor private, taking the absolute nanos); <code>long remainingMillis()</code> returning <code>Math.max(0, (deadlineNanos - System.nanoTime()) / 1_000_000)</code>; <code>boolean expired()</code> returning <code>System.nanoTime() &gt;= deadlineNanos</code>. Use <code>nanoTime</code> throughout — a deadline measured on the wall clock is a bug.`,
starter:`public class Deadline {

    // your code
}`,
solution:`public class Deadline {

    private final long deadlineNanos;

    private Deadline(long deadlineNanos) {
        this.deadlineNanos = deadlineNanos;
    }

    static Deadline in(long millis) {
        return new Deadline(System.nanoTime() + millis * 1_000_000);
    }

    long remainingMillis() {
        return Math.max(0, (deadlineNanos - System.nanoTime()) / 1_000_000);
    }

    boolean expired() {
        return System.nanoTime() >= deadlineNanos;
    }
}`,
tests:[{d:'Deadline stored as absolute nanoTime',re:'private\\s+final\\s+long\\s+deadlineNanos'},{d:'Factory adds the budget to nanoTime()',re:'System\\.nanoTime\\s*\\(\\s*\\)\\s*\\+\\s*millis\\s*\\*\\s*1_?000_?000'},{d:'remaining clamps at zero, never negative',re:'Math\\.max\\s*\\(\\s*0\\s*,\\s*\\(\\s*deadlineNanos\\s*-\\s*System\\.nanoTime'},{d:'expired compares against nanoTime',re:'System\\.nanoTime\\s*\\(\\s*\\)\\s*>=\\s*deadlineNanos'},{d:'Monotonic clock only — no wall clock',re:'currentTimeMillis',not:true},{d:'Private constructor, static factory entry',re:'private\\s+Deadline\\s*\\('}],
behavior:`1. Deadline d = Deadline.in(2000): d.remainingMillis() starts near 2000 and counts down; d.expired() flips true at ~2s. 2. remainingMillis() never returns negative — you pass it straight as the next call's timeout, and each hop down the chain gets what's LEFT of the original budget. 3. Because it rides nanoTime, an NTP correction mid-request can't grant free time or expire the deadline early. 4. This is how gRPC and modern RPC frameworks carry deadlines: the ABSOLUTE deadline propagates across services, each computing its own remaining budget — nobody works on a request whose caller already gave up.`,
hints:['Store the ABSOLUTE deadline, not the duration — that is what makes it propagatable across hops.','remainingMillis() feeds the next call\'s timeout: the budget shrinks automatically as time passes.','Math.max(0, ...) matters: a negative timeout means "wait forever" in many APIs — the opposite of intent.']},
{title:'Interview: retry storm post-mortem',lang:'text',
prompt:`A dependency had a 30-second blip; it turned into a 20-minute outage. Diagnose the amplifiers, one per numbered line: (1) each of 3 service layers retried 3× — one user action became how many requests (one number); (2) all clients retried on a fixed 1s interval, hitting the recovering service in synchronized waves — this is the ____ ____ (two words); (3) the fix for the synchronization is adding ____ to the backoff (one word); (4) the fix for the escalating wait between attempts is ____ backoff (one word); (5) retries should happen at ____ layer, not every layer (one word: <code>one</code> or <code>every</code>); (6) the request that overloads a service should be shed early by the ____ ____ so retries fail fast instead of piling on (two words, fdr4).`,
starter:`1.
2.
3.
4.
5.
6.
`,
solution:`1. 27
2. thundering herd
3. jitter
4. exponential
5. one
6. circuit breaker
`,
tests:[{d:'Q1: 3×3×3 = 27 amplification',re:'1\\.\\s*27',flags:'is'},{d:'Q2: synchronized retries = thundering herd',re:'2\\.\\s*thundering\\s+herd',flags:'is'},{d:'Q3: jitter desynchronizes',re:'3\\.\\s*jitter',flags:'is'},{d:'Q4: exponential backoff decays pressure',re:'4\\.\\s*exponential',flags:'is'},{d:'Q5: retry at ONE layer only',re:'5\\.\\s*one',flags:'is'},{d:'Q6: circuit breaker sheds load',re:'6\\.\\s*circuit\\s+breaker',flags:'is'}],
behavior:`1. 27 — retry multiplies MULTIPLICATIVELY across layers; three innocent-looking 3× policies become 27× at the worst moment. 2. The thundering herd: 10,000 clients on a 1s timer become a synchronized battering ram every second. 3-4. Jitter spreads the herd across time; exponential backoff shrinks total pressure — the two are always used together (full jitter, your fdr2 code). 5. Retry at ONE layer — usually the edge/client — so amplification is 3×, not 27×. 6. The circuit breaker sheds load: once open, retries fail in microseconds instead of parking threads and feeding the fire. This exact cascade has caused real multi-hour outages at major companies; the fix is five small patterns, all in this stream.`,
hints:['Multiply the per-layer retry counts — that product is your amplification factor.','Jitter and exponential backoff solve two DIFFERENT problems (synchronization vs magnitude); you need both.','Retrying at every layer is the single most common way a blip becomes an outage.']}]},

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
exs:[{title:'Build the idempotent handler',
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
hints:['The entire safety argument lives in ONE method call being atomic — computeIfAbsent is check+work+store fused.','If you wrote if (processed.containsKey(...)) first, two concurrent retries both pass the check — that gap is a double charge.','Key per logical operation (client mints it once), not per attempt — retries REUSE it; that is the whole trick.']},{title:'Idempotency with a TTL store',
prompt:`Production idempotency keys can't grow forever — they expire. Write class <code>IdempotencyStore</code>: a <code>private final java.util.Map&lt;String, Long&gt; seen = new java.util.concurrent.ConcurrentHashMap&lt;&gt;()</code> (key → expiry-epoch-millis) and a final <code>long ttlMillis</code> (constructor arg). Method <code>boolean firstTime(String key)</code>: compute <code>long now = System.currentTimeMillis()</code>; use <code>seen.merge(key, now + ttlMillis, (oldExpiry, newExpiry) -&gt; oldExpiry)</code> — merge keeps the FIRST expiry — then return <code>true</code> only if the stored value equals <code>now + ttlMillis</code> (i.e. we just inserted it). Also add <code>void sweep()</code>: remove entries whose value <code>&lt;= System.currentTimeMillis()</code> using <code>seen.values().removeIf(...)</code>... (wall clock is acceptable here — coarse TTLs, not durations).`,
starter:`import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;

public class IdempotencyStore {

    // your code
}`,
solution:`import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;

public class IdempotencyStore {

    private final Map<String, Long> seen = new ConcurrentHashMap<>();
    private final long ttlMillis;

    IdempotencyStore(long ttlMillis) {
        this.ttlMillis = ttlMillis;
    }

    boolean firstTime(String key) {
        long expiry = System.currentTimeMillis() + ttlMillis;
        Long stored = seen.merge(key, expiry, (oldExpiry, newExpiry) -> oldExpiry);
        return stored == expiry;
    }

    void sweep() {
        long now = System.currentTimeMillis();
        seen.values().removeIf(exp -> exp <= now);
    }
}`,
tests:[{d:'Concurrent map keyed to expiry timestamps',re:'Map<String,\\s*Long>\\s+seen\\s*=\\s*new\\s+ConcurrentHashMap<>'},{d:'merge keeps the FIRST expiry (returns oldExpiry)',re:'merge\\s*\\(\\s*key\\s*,\\s*expiry\\s*,\\s*\\(\\s*oldExpiry\\s*,\\s*newExpiry\\s*\\)\\s*->\\s*oldExpiry\\s*\\)'},{d:'firstTime true only when we just inserted',re:'return\\s+stored\\s*==\\s*expiry'},{d:'sweep evicts expired entries',re:'seen\\.values\\s*\\(\\s*\\)\\s*\\.removeIf\\s*\\(\\s*\\w+\\s*->\\s*\\w+\\s*<=\\s*now'},{d:'No check-then-act race — merge is atomic',re:'containsKey',not:true}],
behavior:`1. firstTime("k") → true the first call; firstTime("k") again → false (duplicate suppressed) — the retry is now harmless. 2. merge is ONE atomic operation: two threads racing the same key both call merge, one inserts and the remapping function keeps the first expiry — exactly one gets true, no lock, no window. 3. After ttlMillis and a sweep(), "k" is gone and would be treated as new — bounded memory, because retry storms don't last 24 hours. 4. Using == on the boxed Long is safe here ONLY because we compare against the very object we passed in (merge returns it on insert); a subtle point worth the comment in real code.`,
hints:['merge(key, value, remapping) is the atomic idiom: insert-if-absent, and the lambda decides what to keep on conflict.','Returning oldExpiry from the lambda means "first write wins" — the essence of idempotency.','sweep() runs on a timer in production; here it just proves entries are reclaimable.']},
{title:'Which operations are idempotent?',lang:'text',
prompt:`Rapid-fire, the interview litmus test — for each, is repeating it safe? Answer <code>yes</code> (idempotent) or <code>no</code>, one per numbered line: (1) <code>PUT /users/7 {name:"Ada"}</code> (absolute set); (2) <code>balance = balance + 100</code> (relative change); (3) <code>DELETE /orders/9</code>; (4) <code>SET x = 5</code>; (5) <code>list.append(item)</code>; (6) <code>INSERT ... ON CONFLICT DO NOTHING</code> keyed on a natural id.`,
starter:`1.
2.
3.
4.
5.
6.
`,
solution:`1. yes
2. no
3. yes
4. yes
5. no
6. yes
`,
tests:[{d:'Q1: absolute PUT is idempotent',re:'1\\.\\s*yes',flags:'is'},{d:'Q2: relative increment is NOT',re:'2\\.\\s*no',flags:'is'},{d:'Q3: DELETE is idempotent (gone stays gone)',re:'3\\.\\s*yes',flags:'is'},{d:'Q4: absolute assignment is idempotent',re:'4\\.\\s*yes',flags:'is'},{d:'Q5: append duplicates on repeat',re:'5\\.\\s*no',flags:'is'},{d:'Q6: upsert-do-nothing is idempotent',re:'6\\.\\s*yes',flags:'is'}],
behavior:`1. Yes — setting a field to an absolute value twice lands the same place. 2. No — the canonical dangerous op: +100 twice is +200; every "increment", "append", "charge" is relative and needs an idempotency key. 3. Yes — deleting an already-deleted thing is a no-op; DELETE is idempotent by REST design. 4. Yes — same as PUT: absolute. 5. No — append grows the list each time; relative. 6. Yes — ON CONFLICT DO NOTHING makes the insert safe to repeat, which is how you make a naturally-non-idempotent INSERT safe at the database. The rule crystallized: absolute state = idempotent; relative change = not, until you add a key or a conflict clause.`,
hints:['The one-line test: does the operation SET or does it CHANGE-BY? Set is safe; change-by is not.','DELETE and PUT are idempotent by REST design; POST is the one that usually isn’t.','Q6 shows the fix: ON CONFLICT / upsert converts a dangerous INSERT into a safe one.']}]},

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
exs:[{title:'Hand-roll the breaker',
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
hints:['Write the state diagram as comments first; the method is just the diagram transcribed.','HALF_OPEN is the load-bearing state: ONE probe decides, which is why a half-open failure trips immediately regardless of count.','Fail-fast is the point: the throw in the OPEN branch is the pattern working, not an error case.']},{title:'Bulkhead with a semaphore',
prompt:`Isolate a flaky dependency so it can't drain your whole thread pool (bulkhead, fdr4). Write class <code>Bulkhead</code>: a <code>private final java.util.concurrent.Semaphore permits</code> built in the constructor from an int <code>maxConcurrent</code> (<code>new Semaphore(maxConcurrent)</code>). Method <code>&lt;T&gt; T execute(java.util.function.Supplier&lt;T&gt; call)</code>: <code>if (!permits.tryAcquire())</code> throw <code>new IllegalStateException("bulkhead full")</code> — fail fast, do NOT queue; then <code>try { return call.get(); } finally { permits.release(); }</code> so the permit is always returned even on exception.`,
starter:`import java.util.concurrent.Semaphore;
import java.util.function.Supplier;

public class Bulkhead {

    // your code
}`,
solution:`import java.util.concurrent.Semaphore;
import java.util.function.Supplier;

public class Bulkhead {

    private final Semaphore permits;

    Bulkhead(int maxConcurrent) {
        this.permits = new Semaphore(maxConcurrent);
    }

    <T> T execute(Supplier<T> call) {
        if (!permits.tryAcquire()) {
            throw new IllegalStateException("bulkhead full");
        }
        try {
            return call.get();
        } finally {
            permits.release();
        }
    }
}`,
tests:[{d:'Bounded concurrency via a Semaphore',re:'new\\s+Semaphore\\s*\\(\\s*maxConcurrent\\s*\\)'},{d:'Non-blocking tryAcquire — fail fast, no queue',re:'!\\s*permits\\.tryAcquire\\s*\\(\\s*\\)'},{d:'Over-limit calls rejected immediately',re:'IllegalStateException\\s*\\(\\s*"bulkhead full"'},{d:'Permit released in finally — even on exception',re:'finally\\s*\\{\\s*permits\\.release\\s*\\(\\s*\\)'},{d:'Work runs inside the try',re:'try\\s*\\{\\s*return\\s+call\\.get'}],
behavior:`1. Bulkhead b = new Bulkhead(10): the 11th concurrent call throws "bulkhead full" instantly instead of waiting — the flaky dependency can consume at most 10 threads, ever. 2. The finally release is load-bearing: without it, an exception leaks a permit and the bulkhead slowly strangles itself to zero. 3. tryAcquire (not acquire) is the whole design choice — blocking would just move the queue from the thread pool into the semaphore; failing fast is what CONTAINS the failure. 4. In production you'd give the payment path its own Bulkhead and the thumbnail path another — the thumbnail service melting down can't starve payments of threads. Isolation decided at design time, exactly like the runner container in your launch plan.`,
hints:['tryAcquire() returns false instead of blocking — that non-blocking choice IS the bulkhead’s value.','The finally is not optional: a leaked permit on the exception path is a slow-motion outage.','One Bulkhead per dependency: separate compartments so one flood doesn’t sink the ship.']},
{title:'Interview: cascading failure diagnosis',lang:'text',
prompt:`The login page is down. Investigation shows the AVATAR thumbnail service is slow. One per numbered line: (1) the login service calls the avatar service and they share one thread ____ (one word); (2) avatar calls take 30s instead of 30ms, so login threads pile up ____ on avatar (one word); (3) the login thread pool exhausts and login itself stops responding — this spread is a ____ failure (one word); (4) the pattern that would have stopped login from calling the known-slow avatar service (two words); (5) the pattern that would have capped avatar calls to a few threads, protecting the rest of the pool (one word); (6) the design principle: a non-critical dependency (avatars) must never be able to take down a critical path (login) — call it graceful ____ (one word).`,
starter:`1.
2.
3.
4.
5.
6.
`,
solution:`1. pool
2. waiting
3. cascading
4. circuit breaker
5. bulkhead
6. degradation
`,
tests:[{d:'Q1: shared thread pool is the conduit',re:'1\\.\\s*pool',flags:'is'},{d:'Q2: threads block waiting on the slow dep',re:'2\\.\\s*waiting|2\\.\\s*blocked',flags:'is'},{d:'Q3: cascading failure',re:'3\\.\\s*cascad',flags:'is'},{d:'Q4: circuit breaker stops the calls',re:'4\\.\\s*circuit\\s+breaker',flags:'is'},{d:'Q5: bulkhead caps the blast',re:'5\\.\\s*bulkhead',flags:'is'},{d:'Q6: graceful degradation',re:'6\\.\\s*degradation',flags:'is'}],
behavior:`1-3. The anatomy of a cascade: shared pool → threads block on the slow dependency → pool exhausts → the SERVICE that shared the pool dies, three hops from the original hiccup. The avatar service never went fully down; your WAITING on it did. 4. A circuit breaker on the avatar client: after N slow calls it opens, login stops calling avatar, renders a default avatar, stays up. 5. A bulkhead caps avatar to (say) 5 threads; even fully hung, 5 threads block, not the whole pool. 6. Graceful degradation: login with a blank avatar beats no login — deciding at design time which dependencies are allowed to fail is senior work. This is a real outage shape at real companies; the fix is this stream.`,
hints:['Trace the conduit: how did a THUMBNAIL problem reach LOGIN? The shared pool is the wire.','Breaker (stop calling) and bulkhead (cap the calls) attack the two halves of the cascade.','Q6 is the mindset: rank dependencies as critical/non-critical at DESIGN time, before the incident.']}]},

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
exs:[{title:'Clock discipline drill',lang:'text',
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
hints:['Two clocks, two questions: what-time-is-it (wall) vs how-long-has-it-been (monotonic). Mixing them is the bug.','Q4-Q6 share one fix: route ordering/uniqueness through a single authority (DB sequence, unique index, leader).','Q5 is the interview classic: distributed locks with TTL are correct only when a fencing token rides along.']},{title:'Interview: the distributed lock trap',lang:'text',
prompt:`"We’ll use a Redis lock with a 10-second expiry to make sure only one worker processes each job." Find the bugs, one per numbered line: (1) worker A acquires the lock, then GC-pauses for 12 seconds; the lock expires and worker B acquires it — now how many workers think they hold it (one number); (2) A wakes and writes, unaware it lost the lock — the corruption this causes is a ____ (one word, think two writers); (3) "the lock expires in 10s" hides the question ____ ____ decides (two words, from fdr5); (4) the fix: each lock acquisition gets a monotonically increasing ____ token (one word) that the resource checks and rejects if stale; (5) using wall-clock timestamps to decide lock expiry across machines is safe — true or false; (6) the general lesson: distributed locks are only correct when the protected resource can ____ writes from a superseded holder (one word, think turn away).`,
starter:`1.
2.
3.
4.
5.
6.
`,
solution:`1. 2
2. race
3. whose clock
4. fencing
5. false
6. reject
`,
tests:[{d:'Q1: two workers hold it simultaneously',re:'1\\.\\s*2|1\\.\\s*two',flags:'is'},{d:'Q2: two writers = a race / corruption',re:'2\\.\\s*race|2\\.\\s*corruption',flags:'is'},{d:'Q3: whose clock decides',re:'3\\.\\s*whose\\s+clock',flags:'is'},{d:'Q4: fencing token',re:'4\\.\\s*fencing',flags:'is'},{d:'Q5: cross-machine wall clocks — false',re:'5\\.\\s*false',flags:'is'},{d:'Q6: the resource must reject stale writers',re:'6\\.\\s*reject',flags:'is'}],
behavior:`1. Two — a GC pause (or slow disk, or NTP step) longer than the lease means the expiry fires while A still believes it holds the lock. 2. A race: two "exclusive" writers, the exact thing the lock was supposed to prevent, now WORSE because everyone trusts it. 3. "Whose clock decides" — A's? Redis's? the skew between them silently shortens the effective lease. 4. Fencing tokens: each grant increments a number; A holds token 33, B gets 34; the storage layer rejects any write with a token below the highest it has seen — A's late write bounces. 5. False — cross-machine wall-clock reasoning is the root bug. 6. Reject — a lock without a fencing token at the resource is a suggestion, not a guarantee. This is Kleppmann's famous Redlock critique; interviewers at top shops love it.`,
hints:['The killer is any pause longer than the lease — GC, VM migration, a slow syscall.','A lock alone is advisory; a lock PLUS a fencing token the resource enforces is safe.','If your answer to "what if the holder pauses past the timeout?" is silence, the design is broken.']},
{title:'Wall clock vs monotonic in code',
prompt:`Cement the fdr5 rule in code. Write class <code>Timing</code> with two static methods: (1) <code>long measureMillis(Runnable task)</code> — capture <code>System.nanoTime()</code> before, run the task, return <code>(System.nanoTime() - start) / 1_000_000</code> — the MONOTONIC clock, because this is a duration; (2) <code>String isoTimestamp()</code> — return <code>java.time.Instant.now().toString()</code> — the WALL clock, correct here because this is a human-facing point in time, not a duration. The lesson is picking the right clock for each job.`,
starter:`import java.time.Instant;

public class Timing {

    static long measureMillis(Runnable task) {
        return 0;
    }

    static String isoTimestamp() {
        return null;
    }
}`,
solution:`import java.time.Instant;

public class Timing {

    static long measureMillis(Runnable task) {
        long start = System.nanoTime();
        task.run();
        return (System.nanoTime() - start) / 1_000_000;
    }

    static String isoTimestamp() {
        return Instant.now().toString();
    }
}`,
tests:[{d:'Duration measured with nanoTime, not wall clock',re:'System\\.nanoTime\\s*\\(\\s*\\)[\\s\\S]*?task\\.run[\\s\\S]*?System\\.nanoTime'},{d:'nanoTime difference divided to millis',re:'\\(\\s*System\\.nanoTime\\s*\\(\\s*\\)\\s*-\\s*start\\s*\\)\\s*/\\s*1_?000_?000'},{d:'measureMillis never uses the wall clock',re:'measureMillis[\\s\\S]*?currentTimeMillis',not:true},{d:'Timestamp uses the wall clock (Instant)',re:'Instant\\.now\\s*\\(\\s*\\)\\.toString'},{d:'currentTimeMillis not used for the duration',re:'currentTimeMillis\\s*\\(\\s*\\)[\\s\\S]*?task\\.run',not:true}],
behavior:`1. measureMillis returns a duration that is immune to NTP steps and never negative — even if the wall clock leaps backward mid-task, nanoTime marches forward monotonically. 2. isoTimestamp returns a real calendar time humans can read and compare to logs — which is exactly what nanoTime CAN'T give you (its zero point is arbitrary). 3. The two methods are the fdr5 rule made executable: two clocks answering two different questions — "how long?" (monotonic) and "when, for a human?" (wall) — and using either for the other's job is the bug. 4. Every benchmark, timeout and latency metric you ever write should reach for nanoTime; every created-at, log line and receipt for Instant/wall.`,
hints:['Duration → nanoTime; human timestamp → Instant/wall clock. Two questions, two clocks.','nanoTime’s absolute value is meaningless — only DIFFERENCES matter; that’s why it can’t make timestamps.','If you ever subtract two currentTimeMillis values to time something, this lesson is why you shouldn’t.']}]}
]});
