STREAMS.push({icon:'📐',dan:true,title:'System Design & Tradeoffs',blurb:'The senior skill: deciding what to build. Estimation, the scaling toolbox, data decisions, a full design walkthrough, and writing it down in design docs & ADRs.',lessons:[
{id:'sd1',title:'Thinking in tradeoffs',body:`
<p>Everything before this stream taught you to build correctly. Seniority starts with a different question: <b>of the five correct designs, which one should exist?</b> The real answer is always a tradeoff, and the senior habit is naming what you're paying and what you're buying, out loud, before committing.</p>
<p>The currencies you trade between:</p>
<ul>
<li><b>Latency vs throughput</b>: batching requests raises total work done per second and makes each individual answer slower. Neither is "better"; a trading system and a nightly report want opposite ends.</li>
<li><b>Consistency vs availability</b>: when a network partition splits your replicas (and it will), you choose: refuse writes (consistent, less available) or accept them and reconcile later (available, temporarily inconsistent). Bank balances pick one way, like-counts the other.</li>
<li><b>Simplicity vs everything else</b>: every component you add (cache, queue, second database) buys a capability and costs operational surface: one more thing to monitor, secure, upgrade, and debug at 2am. Seniors count this cost reflexively; juniors discover it in production.</li>
<li><b>Build vs buy vs skip</b>: the strongest senior move is the feature not built. "We can add the queue when the write rate demands it" is a design decision, and often the best one.</li>
</ul>
<p><b>Back-of-envelope estimation</b> is how you ground these choices in numbers instead of vibes. The multiplication is deliberately crude; you want the order of magnitude, not the third digit:</p>
<div class="codeSample">10M users × 10 requests/day  =  100M req/day
100M / ~100k seconds per day =  ~1,000 req/s average  →  plan ~3-5k peak

storage: 100M events/day × 1 KB  ≈ 100 GB/day  ≈ 36 TB/year   (retention policy needed!)
one server realistically:  a few thousand simple req/s  →  average fits on ONE box;
                           peak, redundancy and growth are why you'll still want ~3</div>
<p>Useful constants to carry: ~100k seconds/day (it's 86,400; round up for margin); reads dominate writes 10:1 to 100:1 in most consumer systems; a request touching only RAM/cache is ~100× cheaper than one touching disk, ~10× again vs one crossing a datacenter. The point of estimation is not precision; it's that "1k req/s" and "1M req/s" are <i>different projects</i>, and five minutes of arithmetic tells you which one you're in before you design the wrong one.</p>`,
docs:[['The CAP theorem (Kleppmann critique)','https://martin.kleppmann.com/2015/05/11/please-stop-calling-databases-cp-or-ap.html'],['Latency numbers every programmer should know','https://gist.github.com/jboner/2841832'],['Designing Data-Intensive Applications (the book)','https://dataintensive.net/']],
exs:[{title:'Estimation drill',lang:'text',
prompt:`Order-of-magnitude answers, one per numbered line; crude is correct: (1) 5M users each making 20 requests/day: how many requests per second on average? Round using ~100k seconds/day (one number, e.g. <code>1000</code>); (2) those are 2 KB each: roughly how much ingress per day, in GB (one number); (3) a partition cuts your two replicas apart and you keep accepting writes on both: did you choose <code>consistency</code> or <code>availability</code>? (4) like-counts on posts: is temporary staleness <code>acceptable</code> or <code>unacceptable</code>? (5) adding a Redis cache buys read speed: name the main thing it costs (two words, think 2am), (6) the average load in Q1 fits one server: name the reason you still deploy more than one (one word).`,
starter:`1.
2.
3.
4.
5.
6.
`,
solution:`1. 1000
2. 200
3. availability
4. acceptable
5. operational complexity
6. redundancy
`,
tests:[{d:'Q1: ~1000 req/s (100M requests / ~100k s)',re:'1\\.\\s*1[,.]?000\\b|1\\.\\s*1000',flags:'is'},{d:'Q2: ~200 GB/day',re:'2\\.\\s*200',flags:'is'},{d:'Q3: accepting writes on both sides = availability',re:'3\\.\\s*availability',flags:'is'},{d:'Q4: like-counts tolerate staleness',re:'4\\.\\s*acceptable',flags:'is'},{d:'Q5: the cost is operational complexity',re:'5\\.\\s*operational\\s+complexity|5\\.\\s*(complexity|ops\\s+burden)',flags:'is'},{d:'Q6: redundancy is why one is never enough',re:'6\\.\\s*redundancy',flags:'is'}],
behavior:`1. 5M × 20 = 100M/day ÷ ~100k s ≈ 1,000 req/s, and you'd whisper "peak ~3-5k" right after. 2. 100M × 2 KB = 200 GB/day, which forces the retention conversation nobody scheduled. 3. Availability: both sides accept writes, reconciliation comes later, the CAP choice made concrete. 4. Acceptable: a like-count being 3 seconds stale harms nobody; a bank balance is the other answer. 5. Operational complexity: a cache is a second system that can be stale, full, down, or lying. 6. Redundancy: the second server is not for load, it's for the day the first one dies.`,
hints:['100M/day over 100k seconds: just cancel zeros; estimation is licensed laziness.','Q3: refusing writes during partition = consistency; accepting on both sides = availability.','Q6: capacity says one box; the FAILURE model says never one box.']},{title:'Interview: estimate WhatsApp',lang:'text',
prompt:`The classic warm-up at Meta-tier interviews: messaging at world scale, order-of-magnitude answers, one per numbered line: (1) 2B users send ~50 messages/day: total messages per day (one number with unit, e.g. <code>100B</code>); (2) per second, using ~100k seconds/day (one number); (3) at ~100 bytes per message, ingest per day in TB (one number); (4) each message fans out to a group of avg 5 recipients: delivery writes per second (one number); (5) 500M users online at once, each holding one TCP connection; at 1M connections per server, how many connection servers (one number); (6) for those connection servers, the scarce resource is <code>cpu</code> or <code>memory</code>?`,
starter:`1.
2.
3.
4.
5.
6.
`,
solution:`1. 100B
2. 1M
3. 10
4. 5M
5. 500
6. memory
`,
tests:[{d:'Q1: 2B × 50 = 100B messages/day',re:'1\\.\\s*100\\s*b(illion)?',flags:'is'},{d:'Q2: ~1M messages/s',re:'2\\.\\s*1\\s*m(illion)?\\b|2\\.\\s*1,?000,?000',flags:'is'},{d:'Q3: ~10 TB/day of message bodies',re:'3\\.\\s*10\\b',flags:'is'},{d:'Q4: fan-out ×5 → 5M deliveries/s',re:'4\\.\\s*5\\s*m(illion)?\\b',flags:'is'},{d:'Q5: 500 connection servers',re:'5\\.\\s*500\\b',flags:'is'},{d:'Q6: connections cost memory',re:'6\\.\\s*memory',flags:'is'}],
behavior:`1-2. 100B/day ÷ 100k s ≈ 1M msgs/s, and you'd note peak ~3×. 3. 100B × 100 bytes = 10 TB/day: surprisingly small; text is cheap, media is the real storage story. 4. Delivery amplification is the load: 5M writes/s says the write path needs queues and batching, not heroics. 5. 500 servers just to HOLD sockets, before any work happens. 6. Memory: an idle connection burns ~KBs of buffers and zero CPU; this is why chat companies obsess over per-connection overhead (and why virtual threads exist).`,
hints:['Round brutally: 86,400 seconds is 100k; 2×50 is 100.','Q4 is the lesson: message RECEIVED rate is fan-out × send rate, the feed lesson\'s write amplification wearing a chat costume.','Q6: sockets sit idle 99% of the time; they hold state, they don\'t compute.']},
{title:'Interview: estimate YouTube storage',lang:'text',
prompt:`The storage-side classic, one per numbered line: (1) ~500 hours of video are uploaded per minute: hours per day (one number); (2) at ~1 GB per hour (720p), raw ingest per day in TB (one number); (3) each video is transcoded into ~5 quality renditions: total stored per day in TB (one number); (4) views outnumber uploads ~1000:1; the bandwidth bill is dominated by <code>ingest</code> or <code>egress</code>? (5) the infrastructure that serves the same popular video from servers near each viewer (one acronym); (6) 90% of watches hit videos under a month old: the storage strategy for everything older (two words).`,
starter:`1.
2.
3.
4.
5.
6.
`,
solution:`1. 720000
2. 720
3. 3600
4. egress
5. CDN
6. cold storage
`,
tests:[{d:'Q1: 500 × 60 × 24 = 720k hours/day',re:'1\\.\\s*720[,.]?000|1\\.\\s*720k',flags:'is'},{d:'Q2: ~720 TB/day raw',re:'2\\.\\s*720\\b',flags:'is'},{d:'Q3: ×5 renditions ≈ 3600 TB/day',re:'3\\.\\s*3[,.]?600|3\\.\\s*3\\.6\\s*pb',flags:'is'},{d:'Q4: egress dwarfs ingest',re:'4\\.\\s*egress',flags:'is'},{d:'Q5: CDN',re:'5\\.\\s*cdn',flags:'is'},{d:'Q6: cold storage / archival tier',re:'6\\.\\s*(cold\\s+storage|archiv)',flags:'is'}],
behavior:`1-3. 720k hours → 720 TB raw → ~3.6 PB/day stored once renditions exist: transcoding multiplies storage BEFORE anyone watches. 4. Egress by three orders of magnitude, which reorganizes the whole design around serving, not accepting. 5. CDN: the only economical answer to serving one hot file a billion times. 6. Cold storage: the hot/cold split from the data lesson at its logical extreme: petabytes that almost nobody will ever watch again live on the cheapest tier that still answers eventually.`,
hints:['The multiplications are trivial; the INSIGHT questions are 4-6: storage grows linearly, serving grows with popularity.','Q3: renditions are why "1 GB uploaded" never means "1 GB stored".','Q6 pays most of the bill: the working set is weeks, the archive is decades.']},
{title:'Latency numbers you must feel',lang:'text',
prompt:`Every senior carries these orders of magnitude (Dean\'s classic numbers, rounded hard). One per numbered line: (1) reading from RAM is measured in <code>ns</code>, <code>µs</code> or <code>ms</code>? (2) an SSD random read is ~100 of which unit? (3) a round trip within one datacenter ~0.5 of which unit? (4) a round trip across continents ~100+ of which unit? (5) roughly how many RAM reads fit in the time of ONE cross-continent round trip: <code>a thousand</code>, <code>a million</code>, or <code>a billion</code>? (6) your page makes 30 sequential cross-region calls at ~100ms each: is the resulting ~3s page load fixed by <code>faster servers</code> or <code>fewer/parallel round trips</code>?`,
starter:`1.
2.
3.
4.
5.
6.
`,
solution:`1. ns
2. µs
3. ms
4. ms
5. a million
6. fewer/parallel round trips
`,
tests:[{d:'Q1: RAM in nanoseconds',re:'1\\.\\s*ns|1\\.\\s*nano',flags:'is'},{d:'Q2: SSD ~100µs',re:'2\\.\\s*(µs|us|micro)',flags:'is'},{d:'Q3: in-DC RTT ~0.5ms',re:'3\\.\\s*ms|3\\.\\s*milli',flags:'is'},{d:'Q4: cross-continent 100+ms',re:'4\\.\\s*ms|4\\.\\s*milli',flags:'is'},{d:'Q5: ~a million RAM reads per ocean crossing',re:'5\\.\\s*a?\\s*million',flags:'is'},{d:'Q6: round trips, not horsepower',re:'6\\.\\s*(fewer|parallel)',flags:'is'}],
behavior:`1-4. ns → µs → ms → 100s of ms: each storage/network tier costs roughly 1000× the one above. 5. ~100M ns vs ~100 ns: a million RAM reads per transatlantic hello; this single ratio explains caching as an industry. 6. Fewer/parallel: 30 × 100ms sequential is a GEOMETRY problem; no CPU fixes the speed of light. Batch the calls, parallelize with CompletableFuture (your concurrency stream), or move the data closer. Feeling these numbers is what makes design review instincts fast.`,
hints:['The ladder to memorize: RAM ~100ns, SSD ~100µs, same-DC ~0.5ms, cross-region ~100ms.','Q5: divide 100ms by 100ns and count zeros.','Q6 is the chatty-API fallacy from the reliability stream, now with arithmetic teeth.']}]},

{id:'sd2',title:'The scaling toolbox',body:`
<p>Systems scale through a small, ordered toolbox. Senior judgment is applying the tools <b>in order of cheapness</b>: each next tool costs more complexity than the last, so you earn it with evidence, not anticipation.</p>
<ul>
<li><b>1. Vertical scaling</b>: a bigger box. Unfashionable and correct: zero code changes, and modern boxes are enormous. Its limits (price curve, single point of failure) are real but usually further away than people claim.</li>
<li><b>2. Stateless horizontal scaling</b>: N identical app servers behind a load balancer. The prerequisite is that <i>the servers hold no state</i>: sessions in Redis or JWTs, files in object storage, memory only as cache. This is why the Ledgerly project kept state in Postgres: stateless services scale by copy-paste.</li>
<li><b>3. Caching</b>: the tool that buys you the most, in layers: browser (Cache-Control), CDN for static assets, application cache (Caffeine/Redis, your cache stampede lesson), and the database's own buffer pool. Every layer answers requests the layer below never sees. The tax: invalidation, staleness, and one of computing's two hard problems.</li>
<li><b>4. Read replicas</b>: the 10:1 read-heavy reality means one writer + N readers goes far. New tax: <b>replication lag</b>. A user who writes then immediately reads may not see their own write unless you route read-after-write to the primary.</li>
<li><b>5. Queues as shock absorbers</b>: decouple accepting work from doing it (your Kafka/outbox lessons). Spikes become backlog instead of outages; the tax is eventual completion and idempotent consumers.</li>
<li><b>6. Sharding</b>: split the data itself across databases by some key. <b>Last resort</b>: cross-shard queries, rebalancing, and hot keys (the celebrity problem) make everything harder forever. Reach for it when a single writer genuinely cannot cope, not before.</li>
</ul>
<div class="codeSample">symptom                          → reach for
"CPU pegged on app servers"      → more replicas (they're stateless, right?)
"same rows read 1000×/s"         → cache (with a TTL you can defend)
"reads drown the database"       → read replicas (mind read-after-write)
"traffic spikes break writes"    → queue between accept and process
"ONE table too big for ONE box"  → sharding, the tool of last resort</div>
<p>The meta-rule: <b>scale the bottleneck, not the architecture</b>. Measure, find the actual constraint, apply the cheapest tool that moves it, re-measure. Systems that jumped to microservices-plus-sharding on day one carry the tax forever while their traffic would have fit in a cache.</p>`,
docs:[['Scaling to 11M+ users on AWS','https://highscalability.com/a-beginners-guide-to-scaling-to-11-million-users-on-amazons/'],['Cache strategies, AWS builders library','https://aws.amazon.com/builders-library/caching-challenges-and-strategies/'],['Shopify, sharding lessons','https://shopify.engineering/a-pods-architecture-to-allow-shopify-to-scale']],
exs:[{title:'Bottleneck triage',lang:'text',
prompt:`Name the cheapest correct tool, one per numbered line: (1) app servers at 95% CPU, database idle: <code>replicas</code>, <code>cache</code> or <code>sharding</code>? (2) the same product page is read 5,000×/s and changes hourly: which tool? (3) users complain "I posted but my post isn't in my feed" right after a write, on a system with read replicas: name the cause (two words), (4) checkout requests spike 50× during a sale and orders are being dropped: which tool absorbs the spike? (5) what property must app servers have BEFORE horizontal scaling works (one word), (6) a single Postgres writer is genuinely saturated after caching, replicas and queues: what's left (one word)?`,
starter:`1.
2.
3.
4.
5.
6.
`,
solution:`1. replicas
2. cache
3. replication lag
4. queue
5. stateless
6. sharding
`,
tests:[{d:'Q1: CPU-bound stateless tier → more replicas',re:'1\\.\\s*replicas',flags:'is'},{d:'Q2: hot, slowly-changing read → cache',re:'2\\.\\s*cache',flags:'is'},{d:'Q3: read-after-write missing = replication lag',re:'3\\.\\s*replication\\s+lag',flags:'is'},{d:'Q4: spikes → queue as shock absorber',re:'4\\.\\s*queue',flags:'is'},{d:'Q5: stateless is the prerequisite',re:'5\\.\\s*stateless',flags:'is'},{d:'Q6: the last resort by name',re:'6\\.\\s*shard',flags:'is'}],
behavior:`1. The database is idle: the bottleneck is compute; clone the stateless tier. 2. 5,000 reads/s of hourly-changing data is the textbook cache hit: TTL 60s serves 300k requests per refresh. 3. Replication lag: the write landed on the primary, the read hit a replica that hasn't caught up; route read-after-write to the primary. 4. A queue turns the 50× spike into a backlog that drains: checkout accepts fast, fulfillment catches up. 5. Stateless: server-held sessions break the moment a load balancer sends request 2 elsewhere. 6. Sharding: named correctly as what remains when the cheaper tools are exhausted, not as an opening move.`,
hints:['Always ask which resource is actually saturated; the answer names the tool.','Q3 is the classic replica surprise; the fix is routing, not more hardware.','The order of the toolbox IS the answer key: cheapest tool that moves the measured bottleneck.']},{title:'Implement the interview classic: token bucket',
prompt:`"Design a rate limiter" is a top-5 interview question at every major company, and the standard answer is the <b>token bucket</b>. Write class <code>TokenBucket</code>: finals <code>long capacity</code> and <code>double refillPerSecond</code>, fields <code>double tokens</code> (start = capacity) and <code>long lastRefillNanos</code> (start = <code>System.nanoTime()</code>), constructor taking capacity and refillPerSecond. One <b>synchronized</b> method <code>boolean tryAcquire()</code>: compute <code>long now = System.nanoTime()</code>; add elapsed-seconds × refillPerSecond to tokens, capped at capacity (<code>Math.min</code>); set lastRefillNanos = now; then if <code>tokens &gt;= 1</code> subtract 1 and return true, else return false. Use <code>nanoTime</code>, never wall clock (the clocks lesson is watching).`,
starter:`public class TokenBucket {

    // your code
}`,
solution:`public class TokenBucket {

    private final long capacity;
    private final double refillPerSecond;
    private double tokens;
    private long lastRefillNanos;

    TokenBucket(long capacity, double refillPerSecond) {
        this.capacity = capacity;
        this.refillPerSecond = refillPerSecond;
        this.tokens = capacity;
        this.lastRefillNanos = System.nanoTime();
    }

    synchronized boolean tryAcquire() {
        long now = System.nanoTime();
        double elapsedSeconds = (now - lastRefillNanos) / 1_000_000_000.0;
        tokens = Math.min(capacity, tokens + elapsedSeconds * refillPerSecond);
        lastRefillNanos = now;
        if (tokens >= 1) {
            tokens -= 1;
            return true;
        }
        return false;
    }
}`,
tests:[{d:'Refill is computed from nanoTime, not wall clock',re:'System\\.nanoTime\\s*\\(\\s*\\)'},{d:'Wall clock never consulted',re:'currentTimeMillis',not:true},{d:'Elapsed seconds × rate added, capped at capacity',re:'Math\\.min\\s*\\(\\s*capacity\\s*,\\s*tokens\\s*\\+\\s*elapsedSeconds\\s*\\*\\s*refillPerSecond\\s*\\)'},{d:'Acquire = check ≥ 1, subtract, true',re:'tokens\\s*>=\\s*1[\\s\\S]*?tokens\\s*-=\\s*1[\\s\\S]*?return\\s+true'},{d:'Empty bucket refuses without blocking',re:'return\\s+false'},{d:'Thread-safe via synchronized',re:'synchronized\\s+boolean\\s+tryAcquire'}],
behavior:`1. new TokenBucket(5, 1.0): five immediate tryAcquire() calls return true (the BURST allowance, the bucket's whole advantage over fixed windows), the sixth false. 2. Wait ~2 seconds: two more acquires pass: refill is continuous, not per-window. 3. Idle for an hour: tokens sit at 5, not 3600: the cap IS the burst policy. 4. Lazy refill (compute on access) means no background thread; the pattern scales to millions of buckets in a map keyed by user id, which is exactly Bucket4j's design in your launch plan. 5. nanoTime keeps an NTP step from minting or destroying tokens.`,
hints:['Refill lazily on every call: elapsed × rate, capped; no scheduler needed.','The interview follow-up you should expect: "why not a fixed 1-minute window?" Answer: boundary bursts (2× limit straddling the reset) and no burst credit.','Divide by 1e9 as a DOUBLE (1_000_000_000.0) or integer division eats the fraction.']},
{title:'Interview: Ticketmaster flash sale',lang:'text',
prompt:`50k tickets go on sale at 10:00; 10M people click at 10:00:01, the oversell-prevention interview (asked in many shapes). One per numbered line: (1) the tool that turns the 10M-click spike into a processable stream (one word); (2) the fair UX wrapper over it that admits users in randomized batches (two words); (3) the ONLY trustworthy place to prevent overselling: <code>frontend counter</code>, <code>app-server memory</code> or <code>database constraint</code>? (4) the SQL shape that atomically claims a ticket: UPDATE ... SET remaining = remaining - 1 WHERE remaining ____ (write the condition); (5) carts hold a ticket for 10 minutes: the mechanism that returns unpaid holds to the pool (one word, think expiry); (6) a user double-clicks purchase: what makes the second request harmless (two words, from the reliability stream)?`,
starter:`1.
2.
3.
4.
5.
6.
`,
solution:`1. queue
2. waiting room
3. database constraint
4. > 0
5. TTL
6. idempotency key
`,
tests:[{d:'Q1: a queue absorbs the spike',re:'1\\.\\s*queue',flags:'is'},{d:'Q2: virtual waiting room',re:'2\\.\\s*(virtual\\s+)?waiting\\s+room',flags:'is'},{d:'Q3: only the database can be trusted',re:'3\\.\\s*database\\s+constraint',flags:'is'},{d:'Q4: the guard is remaining > 0',re:'4\\.\\s*>\\s*0',flags:'is'},{d:'Q5: TTL returns abandoned holds',re:'5\\.\\s*ttl|5\\.\\s*expiry',flags:'is'},{d:'Q6: idempotency key dedupes the double click',re:'6\\.\\s*idempotency\\s+key',flags:'is'}],
behavior:`1-2. The queue is physics, the waiting room is fairness on top: real position numbers beat 10M browsers hammering retry. 3. Every layer above the database lies under concurrency: 10k app servers each "remembering" 50k remaining sell 500M tickets. 4. WHERE remaining > 0 makes claim-and-check ONE atomic statement; zero rows updated = sold out; no gap for two buyers in one ticket. 5. TTL on holds (plus a reconciliation sweep, belt and suspenders) keeps abandoned carts from strangling inventory. 6. The idempotency key, lesson fdr3 cashing in: double-click, timeout-retry, and back-button all collapse to one charge.`,
hints:['The theme of Q3-Q4: under concurrency, truth lives where the ATOMICITY lives.','Q4 is your db3 transfer exercise\'s WHERE clause, promoted to inventory.','Interviewers push follow-ups toward Q5-Q6; the unhappy paths are where candidates separate.']},
{title:'The celebrity problem (hot keys)',lang:'text',
prompt:`Your feed system shards by user id and caches per-post data. A celebrity with 100M followers posts: the classic hot-key follow-up. One per numbered line: (1) the general name for one key receiving wildly disproportionate traffic (two words); (2) push-based fan-out writes 100M feed entries for this one post: the hybrid strategy handles celebrities how instead (one word, the other fan-out); (3) 500k req/s all miss the cache for the same post id at the same instant and hit the database together: this stampede is called the ____ ____ problem (two words, either name accepted); (4) the fix where only ONE request recomputes while the rest wait (two words, or the Caffeine feature name); (5) the cheap second layer that absorbs hot reads before they reach the shared cache (two words); (6) sharding by post id: does the hot post's traffic still land on one shard (<code>yes</code>/<code>no</code>)?`,
starter:`1.
2.
3.
4.
5.
6.
`,
solution:`1. hot key
2. pull
3. cache stampede
4. request coalescing
5. local cache
6. yes
`,
tests:[{d:'Q1: hot key / hot partition',re:'1\\.\\s*hot\\s+(key|partition|spot)',flags:'is'},{d:'Q2: celebrities are pulled, not pushed',re:'2\\.\\s*pull',flags:'is'},{d:'Q3: cache stampede / thundering herd',re:'3\\.\\s*(cache\\s+stampede|thundering\\s+herd|dog[- ]?pil)',flags:'is'},{d:'Q4: coalesce to one recompute',re:'4\\.\\s*(request\\s+coalescing|single\\s*flight|refresh)',flags:'is'},{d:'Q5: a local in-process cache',re:'5\\.\\s*local\\s+cache|5\\.\\s*in[- ]process',flags:'is'},{d:'Q6: sharding cannot spread ONE key',re:'6\\.\\s*yes',flags:'is'}],
behavior:`1. Hot key: the failure mode sharding cannot fix, because hashing sends one key to one place by design. 2. Pull for the celebrity, push for everyone else: the hybrid from the walkthrough, now motivated by writes: one post ≠ 100M inserts. 3-4. The stampede and its cure: one flight recomputes, half a million wait milliseconds for its result; your Caffeine caching lesson called this refresh-ahead/coalescing. 5. A tiny in-process cache (even 1-second TTL) turns 500k shared-cache hits into N-servers hits. 6. Yes, which is the whole point: replicate READS of hot data (layers of cache); resharding rearranges deck chairs.`,
hints:['Q2: the write cost of push is followers × posts; celebrities break the multiplication.','Q6 is the trick question; candidates propose "shard harder" and the interviewer waits.','Layered defense: local cache → shared cache with coalescing → the poor database.']}]},

{id:'sd3',title:'Data decisions: model for the reads',body:`
<p>Most system-design decisions are secretly data decisions. The senior question is never "SQL or NoSQL?" in the abstract; it's <b>"what are the queries, and what shape serves them?"</b></p>
<ul>
<li><b>Start relational.</b> Postgres handles the first several orders of magnitude of almost anything, gives you transactions, joins, constraints and 50 years of tooling. Choosing a specialty store first and rediscovering joins by hand in application code is the most common self-inflicted wound in system design. Document stores earn their place when data is genuinely document-shaped and join-free; key-value stores when access is only ever by key at huge scale; search indexes for text search. Each is an <i>addition</i> justified by a query pattern, not a replacement chosen by fashion.</li>
<li><b>Normalization is for writes; denormalization is for reads.</b> Third-normal-form (each fact stored once) makes updates cheap and anomalies impossible: the right default. But a feed that joins six tables per page view at 1,000 req/s may earn a denormalized copy: store the feed pre-built, accept that a username change now means updating N rows. You are trading <b>write complexity for read speed</b>; say so explicitly, and write down who updates the copy.</li>
<li><b>Indexes are the same trade in miniature.</b> Every index makes some query O(log n) and every write slightly slower (one more structure to update). Index the columns your WHERE/ORDER BY actually use (your EXPLAIN lesson); an unused index is pure write tax.</li>
<li><b>Cache vs denormalize vs precompute</b>: three answers to "reads are slow", in increasing commitment: a cache is disposable (TTL, rebuildable, can be dropped); a denormalized column is a schema promise (must be maintained forever); a precomputed table (materialized view, nightly rollup) sits between. Prefer the most disposable thing that meets the latency target.</li>
<li><b>Estimate the working set.</b> 36 TB/year sounds scary until you ask what's <i>hot</i>: if 95% of reads touch the last 30 days (~3 TB), that fits in RAM across a few replicas; archive the rest to object storage. Hot/cold separation routinely deletes an order of magnitude from the hardware bill.</li>
</ul>
<p>The habit that binds these: <b>list the top 5 queries before choosing anything</b>: their frequency, latency budget, and consistency needs. The design falls out of that table more reliably than out of any technology preference.</p>`,
docs:[['Use the index, Luke','https://use-the-index-luke.com/'],['PostgreSQL, materialized views','https://www.postgresql.org/docs/current/rules-materializedviews.html'],['DDIA ch. 2-3, data models & storage','https://dataintensive.net/']],
exs:[{title:'Data decisions drill',lang:'text',
prompt:`One per numbered line: (1) the sane default database for a new CRUD product (one word), (2) storing each fact exactly once is called ____ (one word), (3) pre-joining a feed into one read-optimized copy trades write complexity for ____ ____ (two words), (4) reads are slow; rank these by <b>disposability</b>, most disposable first: <code>denormalized column</code>, <code>cache</code>, <code>materialized view</code> (comma-separated), (5) every index speeds one query and taxes every ____ (one word), (6) 95% of reads touch 30 days of data: the pattern of keeping that in fast storage and archiving the rest is called ____/____ separation (two words, slash ok).`,
starter:`1.
2.
3.
4.
5.
6.
`,
solution:`1. postgres
2. normalization
3. read speed
4. cache, materialized view, denormalized column
5. write
6. hot/cold
`,
tests:[{d:'Q1: relational default (postgres accepted)',re:'1\\.\\s*(postgres|postgresql|relational|sql)',flags:'is'},{d:'Q2: normalization',re:'2\\.\\s*normali[sz]ation',flags:'is'},{d:'Q3: bought read speed',re:'3\\.\\s*read\\s+(speed|performance)',flags:'is'},{d:'Q4: disposability order cache → view → column',re:'4\\.\\s*cache\\s*,\\s*materiali[sz]ed\\s+view\\s*,\\s*denormali[sz]ed\\s+column',flags:'is'},{d:'Q5: writes pay for every index',re:'5\\.\\s*write',flags:'is'},{d:'Q6: hot/cold separation',re:'6\\.\\s*hot\\s*[/-]?\\s*cold',flags:'is'}],
behavior:`1. Postgres (any relational answer accepted): specialty stores are earned additions, not defaults. 2. Normalization: each fact once, updates touch one row. 3. Read speed; and the unstated price is every writer now maintaining the copy. 4. Cache (droppable), materialized view (rebuildable on schedule), denormalized column (a forever schema promise), commitment ascending. 5. Write: indexes are free to read, never free to maintain. 6. Hot/cold: the working set, not total data, sizes your hardware.`,
hints:['Q4 hinges on one question: if this thing is wrong or in the way, how hard is it to delete?','Q5: an index is a data structure updated on every INSERT/UPDATE; that IS the tax.','The top-5-queries table beats every technology opinion you will ever hold.']},{title:'Interview: Uber’s data shapes',lang:'text',
prompt:`"Design Uber" is really three data problems wearing one trench coat. One per numbered line: (1) 1M drivers ping GPS every 4 seconds = 250k writes/s of ephemeral, ever-stale data: does this belong in Postgres or in memory (write <code>postgres</code> or <code>memory</code>)? (2) "find drivers near rider X" needs a spatial index: name one spatial indexing scheme (one word is enough: the grid-cell encoding, the tree, or the PostGIS extension); (3) a completed trip (route, fare, receipt) is immutable business record: which store now (one word); (4) the fraud team wants "average fare by city by hour over 2 years": row-store Postgres or a columnar warehouse (one word answer: <code>columnar</code> or <code>rows</code>); (5) live driver positions vs historical trips is which classic split from the data lesson (slash-separated two words); (6) the surge multiplier for a city cell is computed from supply/demand counts: precomputed per cell on a tick, or computed per-request (write <code>precomputed</code> or <code>per-request</code>)?`,
starter:`1.
2.
3.
4.
5.
6.
`,
solution:`1. memory
2. geohash
3. postgres
4. columnar
5. hot/cold
6. precomputed
`,
tests:[{d:'Q1: ephemeral pings live in memory',re:'1\\.\\s*memory',flags:'is'},{d:'Q2: geohash/quadtree/PostGIS all accepted',re:'2\\.\\s*(geohash|quadtree|postgis|h3|s2)',flags:'is'},{d:'Q3: immutable business records → relational',re:'3\\.\\s*postgres',flags:'is'},{d:'Q4: analytics wants columnar',re:'4\\.\\s*columnar',flags:'is'},{d:'Q5: hot/cold again',re:'5\\.\\s*hot\\s*[/-]?\\s*cold',flags:'is'},{d:'Q6: surge is precomputed per tick',re:'6\\.\\s*precomputed',flags:'is'}],
behavior:`1. Memory (Redis-style, geo-indexed): the data is worthless in 5 seconds and rewritten anyway; durability would be paying to persist noise. 2. Geohash (or quadtree/H3/S2): "nearby" becomes "same or adjacent cells", a prefix query, not a table scan of the planet. 3. Postgres, because money demands transactions, constraints, and audits: the receipt is sacred even though the ping was disposable. 4. Columnar: scanning two columns of a billion rows is what warehouses are FOR; row stores read entire rows to answer. 5. Hot/cold, third appearance; it really is most of data architecture. 6. Precomputed per tick (every few seconds, per cell): 100k requests reading one number beats 100k requests each counting drivers.`,
hints:['Q1 and Q3 are the same axis, opposite ends: value-per-byte decides durability spend.','Q2: any scheme that makes 2D proximity a 1D prefix works; naming one is enough for the interview.','Q6 is sd2\'s cache thinking applied to a computation instead of a row.']},
{title:'Interview: real-time leaderboard',lang:'text',
prompt:`Gaming/fintech favorite: 50M players, scores update constantly, everyone wants the top-10 and their own rank. One per numbered line: (1) <code>SELECT ... ORDER BY score DESC LIMIT 10</code> per page view at 100k req/s: sane or insane (one word); (2) the purpose-built structure keeping members sorted by score with O(log n) updates (two words, the Redis name); (3) in Redis, getting a member's exact rank is one ____ call (write the command name, starts with Z); (4) the top-10 changes every few ms but users cannot perceive that: the fix serving 100k req/s from one computation (three words or fewer, think TTL); (5) the database keeps the authoritative scores and the sorted set is a ____ (one word, what kind of copy, from the data lesson); (6) exact rank #23,417,882 of 50M: worth computing precisely for the UI, <code>yes</code> or <code>no</code>?`,
starter:`1.
2.
3.
4.
5.
6.
`,
solution:`1. insane
2. sorted set
3. ZRANK
4. cache with TTL
5. view
6. no
`,
tests:[{d:'Q1: ORDER BY per request at that rate is insane',re:'1\\.\\s*insane',flags:'is'},{d:'Q2: the sorted set',re:'2\\.\\s*sorted\\s+set',flags:'is'},{d:'Q3: ZRANK',re:'3\\.\\s*zrank',flags:'is'},{d:'Q4: cache the top-10 briefly',re:'4\\.\\s*cache',flags:'is'},{d:'Q5: the sorted set is a derived view',re:'5\\.\\s*view|5\\.\\s*derived',flags:'is'},{d:'Q6: deep ranks deserve approximation',re:'6\\.\\s*no',flags:'is'}],
behavior:`1. Insane: sorting 50M rows 100k times a second is the same answer computed 100k times; the arithmetic indicts the design. 2-3. The sorted set (skip list underneath, your data structures stream meeting production): ZADD updates, ZREVRANGE tops, ZRANK ranks, all logarithmic. 4. A 1-second-TTL cache of the top-10: freshness humans cannot distinguish, load collapsed by five orders of magnitude. 5. A view: Postgres owns truth (transactions, audit), Redis serves reads; rebuild-from-truth is the recovery plan, which is what makes losing Redis an inconvenience instead of an incident. 6. No: "top 0.1%" reads better than an exact number that changed before it rendered; precision has a cost and here it buys nothing.`,
hints:['Q1: whenever identical work repeats per-request, the design is asking for a view or a cache.','The skip list from your data structures stream is literally what ZRANK walks.','Q5-Q6 are the senior moves: name the source of truth, and spend precision only where users can taste it.']},
{title:'Interview: Dropbox, metadata vs blobs',lang:'text',
prompt:`The file-sync classic (Dropbox/Drive interviews). One per numbered line: (1) the file BYTES belong in (two words); (2) path, owner, version, share-permissions belong in a ____ database (one word); (3) two users upload the same 200MB file: storing it once is enabled by keying blobs on their ____ ____ (two words, from the security stream); (4) a 2GB file changed in one corner: re-uploading only the changed pieces requires storing files as ____ (one word); (5) the same file edited offline on two devices: the sync conflict resolution users forgive: <code>last-write-wins</code> (silently drop one) or <code>conflict copy</code> (keep both, rename one)? (6) "can Ada read /q3/report.pdf?" must be checked where: <code>client</code> or <code>server</code>?`,
starter:`1.
2.
3.
4.
5.
6.
`,
solution:`1. object storage
2. relational
3. content hash
4. chunks
5. conflict copy
6. server
`,
tests:[{d:'Q1: blobs → object storage',re:'1\\.\\s*object\\s+stor',flags:'is'},{d:'Q2: metadata → relational',re:'2\\.\\s*relational|2\\.\\s*sql|2\\.\\s*postgres',flags:'is'},{d:'Q3: dedupe by content hash',re:'3\\.\\s*content\\s+hash',flags:'is'},{d:'Q4: chunked storage enables delta sync',re:'4\\.\\s*chunks?',flags:'is'},{d:'Q5: users forgive the conflict copy',re:'5\\.\\s*conflict\\s+copy',flags:'is'},{d:'Q6: authorization is server-side, always',re:'6\\.\\s*server',flags:'is'}],
behavior:`1-2. The founding split: cheap dumb bytes at scale (object storage) + small precious structure (relational), the Shorty/prj1 pattern at planet size. 3. Content-addressing: hash the bytes (your sha256 lesson), key storage on the digest; identical uploads collapse to one blob plus two metadata rows. 4. Chunks (~4MB): the changed corner re-uploads one chunk, not 2GB, and chunk hashes give you dedupe INSIDE files too. 5. Conflict copy: silently discarding someone's afternoon is the unforgivable sin; "report (Ada's conflicted copy)" is ugly and correct. Your progress-sync merge in the launch plan made the same call. 6. Server: the client is the attacker's laptop; the IDOR lesson, filesystem edition.`,
hints:['The metadata/blob split is THE pattern: every "design a storage product" answer starts there.','Q3-Q4 compose: hash per chunk = dedupe + delta sync from one design choice.','Q5: when merging loses data, users leave; when it embarrasses with a rename, they shrug.']}]},

{id:'sd4',title:'Walkthrough: designing a real system',body:`
<p>The method, start to finish, on a concrete problem: <b>design an image-sharing feed</b> (users post images, follow others, see a feed). This five-step loop is reusable on any system, and it is exactly the structure interviewers listen for.</p>
<p><b>1. Requirements & numbers first.</b> Functional: post image, follow, view feed. Non-functional: feed loads &lt; 200ms, 10M users, ~1M posts/day, reads dominate ~100:1. Instant deductions: 1M/day ≈ 12 writes/s (tiny!) but ~1,200 feed reads/s (the real problem): <i>this system is a read problem</i>. Half the design just fell out of arithmetic.</p>
<p><b>2. API sketch</b>. Nail the contract before the internals: <code>POST /posts</code>, <code>POST /users/id/follow</code>, <code>GET /feed?cursor=...</code> (cursor pagination, your REST lesson, because page numbers break when new posts land).</p>
<p><b>3. Data model</b>: <code>users</code>, <code>posts(author_id, image_url, created_at)</code>, <code>follows(follower_id, followee_id)</code>. Images are the easy trap: they go in <b>object storage + CDN</b>, never the database; the DB stores the URL.</p>
<p><b>4. The core decision, every real system has one.</b> Here: how is the feed built?</p>
<div class="codeSample">fan-out on READ  (pull): feed = query posts of everyone I follow, at request time
  + simple, always fresh      − that query at 1,200/s joins follows×posts, expensive

fan-out on WRITE (push): when someone posts, INSERT into every follower's feed table
  + feed read = one indexed lookup (fast, cheap)     − a 5M-follower celebrity post
                                                       = 5M writes (the hot-key problem)

production answer: HYBRID, push for normal users, pull for celebrities, merge at read.
Not a compromise: a recognition that two populations have two different shapes.</div>
<p><b>5. Walk the failure & growth paths.</b> What breaks first? The feed store → cache hot feeds. Celebrity posts → the hybrid. Image bandwidth → CDN already took it. Then say what you're NOT building: no stories, no ranking algorithm v1; chronological ships first.</p>
<p>Notice what the method did: numbers chose read-vs-write focus, the API forced pagination thinking, the data model surfaced object storage, and ONE decision (fan-out) got the real analysis. Depth on the decision that matters beats shallow coverage of ten boxes, in interviews and in the design review at work.</p>`,
docs:[['Instagram engineering (feed architecture)','https://instagram-engineering.com/'],['System design primer','https://github.com/donnemartin/system-design-primer'],['Twitter timelines at scale (InfoQ talk)','https://www.infoq.com/presentations/Twitter-Timeline-Scalability/']],
exs:[{title:'The core-decision drill',lang:'text',
prompt:`Same method, new system: <b>a chat app</b> (1:1 and small groups, 10M users): one per numbered line: (1) messages are written once and read by ~5 people: is chat a <code>read</code> problem or a <code>write</code> problem compared to the feed? (2) the core decision in chat is delivery: the server pushing over an open connection is which protocol (one word, you built one in the projects stream), (3) a user was offline for an hour: what makes messages survive until they connect (one word), (4) message ordering within one conversation: global timestamps or a per-conversation ____ (one word, think monotonically increasing), (5) images in chat go where (two words), (6) name the thing you'd explicitly NOT build in v1 from: <code>read receipts</code>, <code>message storage</code>, <code>login</code>.`,
starter:`1.
2.
3.
4.
5.
6.
`,
solution:`1. write
2. websocket
3. queue
4. sequence
5. object storage
6. read receipts
`,
tests:[{d:'Q1: chat inverts the feed, write-shaped',re:'1\\.\\s*write',flags:'is'},{d:'Q2: WebSocket push',re:'2\\.\\s*websockets?',flags:'is'},{d:'Q3: a queue/inbox holds offline messages',re:'3\\.\\s*(queue|inbox|buffer)',flags:'is'},{d:'Q4: per-conversation sequence number',re:'4\\.\\s*sequence',flags:'is'},{d:'Q5: object storage (+ CDN) as always',re:'5\\.\\s*object\\s+stor',flags:'is'},{d:'Q6: read receipts are the v1 cut',re:'6\\.\\s*read\\s+receipts',flags:'is'}],
behavior:`1. Write: each message is written per-recipient-ish and read a handful of times; the feed's 100:1 read ratio inverts. 2. WebSocket: DojoChat was this lesson's rehearsal. 3. A queue (per-user inbox): offline users' messages wait durably instead of vanishing. 4. Sequence numbers per conversation: wall-clock timestamps skew across devices (foreshadowing the clocks lesson next stream). 5. Object storage behind a CDN; the message row carries a URL. 6. Read receipts: login and storage are the product; receipts are v2 polish. Cutting them is a design decision, not a failure.`,
hints:['Run step 1 arithmetic and the read-vs-write answer falls out before any boxes are drawn.','Q4: "sort by timestamp" across machines is a lie you will meet again next stream.','Q6 tests the senior move from the walkthrough: name what you are NOT building, out loud.']},{title:'Interview: URL shortener, planet-scale',lang:'text',
prompt:`The most-asked system design question on earth: you BUILT one in the projects stream; now the scale follow-ups. One per numbered line: (1) 100M new links/month but 10B redirects/month: the system is a ____ problem (one word); (2) generating short codes on 20 app servers with zero collisions and zero coordination per-request: each server pre-claims a ____ of ids from a central counter (one word, a chunk of sequence space); (3) those numeric ids become 7-char codes via encoding in base ____ (one number, the alphabet you used in Shorty); (4) redirects should be 301 (cacheable, browsers stop coming back), but you lose per-click ____ (one word), which is why analytics products answer 302; (5) 1% of links get 99% of clicks: the layer answering those without touching the database (one word); (6) expired links: scan-and-delete hourly, or check-at-redirect plus a lazy background sweep (write <code>scan</code> or <code>lazy</code>)?`,
starter:`1.
2.
3.
4.
5.
6.
`,
solution:`1. read
2. range
3. 62
4. analytics
5. cache
6. lazy
`,
tests:[{d:'Q1: 100:1 → read problem',re:'1\\.\\s*read',flags:'is'},{d:'Q2: pre-claimed id ranges (block allocation)',re:'2\\.\\s*(range|block|batch)',flags:'is'},{d:'Q3: base62',re:'3\\.\\s*62',flags:'is'},{d:'Q4: 301 caching costs analytics',re:'4\\.\\s*analytics|4\\.\\s*(click\\s+)?(stats|counts|tracking)',flags:'is'},{d:'Q5: cache serves the hot 1%',re:'5\\.\\s*cache',flags:'is'},{d:'Q6: lazy expiry + sweep',re:'6\\.\\s*lazy',flags:'is'}],
behavior:`1. Read: the ratio decides where effort goes before any component is named. 2. Range allocation: server A takes ids 1M-2M, server B 2M-3M: one coordination per million ids instead of per request; Twitter's Snowflake is this idea with timestamps baked in. 3. Base62: 62^7 ≈ 3.5 trillion codes; the projects-stream slug generator was the toy version. 4. Analytics: the 301-vs-302 tradeoff is a BUSINESS decision wearing an HTTP status: cacheable-and-blind vs slower-and-measured. 5. Cache: hot links from Caffeine/Redis in microseconds; the DB sees the long tail. 6. Lazy: check expiry on the read path (one comparison), reclaim in a background sweep; scanning billions of rows hourly to delete thousands is the crime.`,
hints:['You built the 10-links version; the follow-ups are all "now remove the shared counter/DB from the hot path".','Q2: coordination amortized from per-request to per-million is THE distributed-id trick.','Q4 was in your prj1 lesson as "use 302 while debugging"; here is who never switches: analytics companies.']},
{title:'Interview: Uber dispatch, the core decision',lang:'text',
prompt:`Feed had fan-out; chat had delivery; dispatch's core decision is <b>matching under contention</b>. One per numbered line: (1) rider requests and driver positions meet in a matching engine partitioned by ____ (one word, the geographic unit from the data drill); (2) two matchers racing to assign the SAME driver to two riders is prevented by an atomic ____ on the driver (one word, think "claim with expiry"); (3) that claim carries a timeout so a crashed matcher's driver isn't locked forever; the reliability-stream concept riding along to make expired-claim writes safe is the ____ token (one word); (4) the rider watches the car approach in realtime over a ____ (one word, projects stream); (5) no driver accepts within 10s: the request should <code>fail</code> or <code>expand the search radius and retry</code> (write <code>fail</code> or <code>expand</code>); (6) surge pricing exists primarily to <code>maximize revenue</code> or to <code>move supply toward demand</code> (pick one)?`,
starter:`1.
2.
3.
4.
5.
6.
`,
solution:`1. geohash
2. lease
3. fencing
4. websocket
5. expand
6. move supply toward demand
`,
tests:[{d:'Q1: partition by geo cell',re:'1\\.\\s*(geohash|cell|city|region|h3)',flags:'is'},{d:'Q2: an atomic lease/lock claims the driver',re:'2\\.\\s*(lease|lock)',flags:'is'},{d:'Q3: the fencing token',re:'3\\.\\s*fencing',flags:'is'},{d:'Q4: websocket push',re:'4\\.\\s*websockets?',flags:'is'},{d:'Q5: degrade by expanding, not failing',re:'5\\.\\s*expand',flags:'is'},{d:'Q6: surge is a supply signal',re:'6\\.\\s*move\\s+supply',flags:'is'}],
behavior:`1. Geo-partitioning makes each matcher's world small: a city cell, not a planet; cross-cell only at boundaries. 2. The lease: SET driver:42 = trip-99 NX PX 15000 (or a DB row with a unique constraint), exactly the Ticketmaster atomic claim, with people instead of tickets. 3. Fencing, the clocks-lesson cliffhanger resolved: an expired matcher holding a stale lease must have its late writes rejected by token comparison, or "whose clock decides" bites. 4. The WebSocket from DojoChat, now moving cars instead of chat lines. 5. Expand: matching is a liquidity problem; graceful degradation here means widening, not erroring. 6. Supply movement: the surge number is a message to DRIVERS ("come here"); revenue is the side effect. Knowing what a mechanism is FOR is the difference between designing it and cargo-culting it.`,
hints:['Every marketplace interview (Uber/Lyft/DoorDash/Instacart) is this same skeleton: partition, claim atomically, push updates, degrade by widening.','Q2-Q3 are fdr5\'s distributed-lock warning made concrete: lease + fencing or double-assignment.','Q6-type "what is it FOR" questions are how interviewers find candidates who think in systems, not components.']},
{title:'Interview: notification system',lang:'text',
prompt:`Amazon/Meta staple: one service, all pushes/emails/SMS for the company. One per numbered line: (1) callers (order service, marketing...) hand you a notification and immediately get 202: between them and delivery sits a ____ (one word); (2) push, email and SMS providers fail independently and at different rates: each channel gets its own worker pool and queue, the ____ pattern (one word, reliability stream); (3) the marketing team retries a failed batch and users must not get the email twice: per-notification ____ key (one word); (4) "order shipped" must go out now; "weekly digest" must not wake anyone at 3am and respects per-user channel opt-outs: preferences are checked at ____ time (one word: <code>enqueue</code> or <code>send</code>); (5) the SMS provider rate-limits you to 100/s: your sender enforces this with the ____ ____ you implemented two lessons ago (two words); (6) after 5 failed delivery attempts a notification goes to the ____ ____ queue for humans (two words or the acronym).`,
starter:`1.
2.
3.
4.
5.
6.
`,
solution:`1. queue
2. bulkhead
3. idempotency
4. send
5. token bucket
6. dead letter
`,
tests:[{d:'Q1: accept fast, deliver async, a queue',re:'1\\.\\s*queue',flags:'is'},{d:'Q2: per-channel isolation = bulkhead',re:'2\\.\\s*bulkhead',flags:'is'},{d:'Q3: idempotency key per notification',re:'3\\.\\s*idempotency',flags:'is'},{d:'Q4: preferences checked at send time',re:'4\\.\\s*send',flags:'is'},{d:'Q5: the token bucket paces the provider',re:'5\\.\\s*token\\s+bucket',flags:'is'},{d:'Q6: dead letter queue',re:'6\\.\\s*dead\\s+letter|6\\.\\s*dlq',flags:'is'}],
behavior:`1. The queue decouples "we accepted it" (202, milliseconds) from "we delivered it" (seconds to hours), every async design's first move. 2. Bulkheads per channel: SMS provider down must not drown push notifications in the same pool: fdr4's compartments, now with three ships. 3. The idempotency key rides the notification through every retry; marketing's double-fired batch collapses harmlessly. 4. Send time: preferences and quiet hours are evaluated against the world as it IS at delivery, not as it was at enqueue (a user who opted out an hour ago stays opted out). 5. Your TokenBucket, verbatim: refill 100/s, senders tryAcquire before each SMS; the provider never sees a violation. 6. The DLQ: after bounded retries, poison messages park for human forensics instead of looping forever. Six answers, five of them YOUR previous lessons: senior design is composition of known parts.`,
hints:['This question is beloved precisely because it composes everything: queue, bulkhead, idempotency, rate limit, DLQ, a resilience-pattern roll call.','Q4 is the subtle one interviewers probe: state read at enqueue time is stale by send time.','Q6: "what happens after the LAST retry?" Always have an answer; "it loops" is the wrong one.']}]},

{id:'sd5',title:'Design docs & ADRs: deciding in writing',body:`
<p>A design that lives in your head scales to one person and zero months. Senior engineers <b>decide in writing</b>: not bureaucracy, but the cheapest known way to find flaws before building, get real review, and let 2027-you understand why 2026-you did this.</p>
<p><b>The design doc</b> (one to four pages, written <i>before</i> building anything significant):</p>
<div class="codeSample">1. Context, the problem, the numbers, what happens if we do nothing
2. Goals, bullet list; and NON-goals: what this explicitly won't do
3. Proposal, the design, at whatever depth the decision needs
4. Alternatives, 2-3 seriously considered options and WHY NOT each
                 (the section reviewers read first, no alternatives = no thinking)
5. Risks, what could go wrong, blast radius, rollback story
6. Open questions, asked outright; a doc with zero open questions is bluffing</div>
<p><b>The ADR</b> (Architecture Decision Record) is the design doc's small sibling: half a page recording ONE decision, numbered and immutable, living in the repo (<code>docs/adr/0007-use-postgres-for-progress.md</code>). Its power is the <b>Context → Decision → Consequences</b> discipline: consequences <i>including the bad ones you accept</i>:</p>
<div class="codeSample"># ADR-0007: Store progress in Postgres, not Redis
Status: accepted            (later: superseded by ADR-0019, history preserved, never edited)
## Context
Progress must survive restarts and joins with users; write rate ~12/s.
## Decision
Postgres. The write rate is trivial; durability and joins are the need.
## Consequences
+ transactions with user data;  + one fewer system to run
− hot-path reads hit the DB → add Caffeine if p99 exceeds 50ms   ← accepted cost, named</div>
<p>Why writing beats meetings: text is reviewable asynchronously and by more people; writing exposes hand-waving that speech hides ("...and then somehow the cache invalidates"); the alternatives section forces real comparison; and the archive turns "why on earth is it built this way?" from archaeology into a link. Every "why do we even have this queue?" argument that ends in a shrug is a missing ADR.</p>`,
docs:[['ADR, the original pattern (Nygard)','https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions'],['adr.github.io, formats & tools','https://adr.github.io/'],['Design docs at Google','https://www.industrialempathy.com/posts/design-docs-at-google/']],
exs:[{title:'Write an ADR',lang:'text',
prompt:`Write ADR-0001 for Dev Dojo's own launch (the decision is made; record it): a markdown-shaped doc containing, in order: (1) a title line starting <code># ADR-0001:</code> about choosing a <b>separate runner service</b> for executing user code; (2) a <code>Status: accepted</code> line; (3) a <code>## Context</code> section mentioning that user code is <b>untrusted</b>; (4) a <code>## Decision</code> section stating code runs in an <b>isolated container</b> with <b>no network</b>; (5) a <code>## Consequences</code> section with at least one <code>+</code> line and at least one <code>-</code> line, and the minus must name a real accepted cost (latency, ops burden...).`,
starter:`# ADR-0001:

Status:

## Context

## Decision

## Consequences
`,
solution:`# ADR-0001: Execute user code in a separate runner service

Status: accepted

## Context
The dojo must compile and run code submitted by users. User code is
untrusted by definition; the API process must never execute it in
its own JVM, and the blast radius of a malicious submission must be
contained by design, not by hope.

## Decision
A dedicated runner service executes each submission in an isolated
container with no network access, strict memory/CPU limits and a hard
timeout. The API talks to it only through a queue.

## Consequences
+ arbitrary-code execution is contained; API credentials never share a process with user code
+ runner can be scaled and updated independently
- every run pays container startup latency (~seconds, acceptable for grading)
- one more service to deploy, monitor and patch
`,
tests:[{d:'Numbered title about the runner decision',re:'#\\s*ADR-0001:.*runner',flags:'i'},{d:'Status recorded as accepted',re:'Status:\\s*accepted',flags:'i'},{d:'Context names the untrusted-code reality',re:'##\\s*Context[\\s\\S]*?untrusted',flags:'i'},{d:'Decision: isolated container, no network',re:'##\\s*Decision[\\s\\S]*?isolat[\\s\\S]*?no\\s+network',flags:'i'},{d:'Consequences include at least one + and one -',re:'##\\s*Consequences[\\s\\S]*?^\\+[\\s\\S]*?^-',flags:'im'},{d:'The minus names a real cost (latency or ops)',re:'-\\s*.*(latenc|deploy|monitor|patch|ops|complex)',flags:'i'}],
behavior:`1. The document reads Context → Decision → Consequences: why, what, and the price, in that order. 2. Context justifies without deciding; Decision decides without re-arguing. 3. The minus lines are the ADR's soul: container latency and ops burden are ACCEPTED, in writing, so nobody relitigates them in six months without new information. 4. Numbered and immutable: a future change gets ADR-00NN "supersedes 0001"; the history of the system's mind stays readable.`,
hints:['Context answers "why did this need deciding?": one paragraph of problem, zero solution.','The Decision section is 2-4 sentences; if it sprawls, it is re-arguing instead of recording.','A Consequences section with only + lines is marketing, not engineering; the real minus is what makes the doc trustworthy.']},{title:'ADR: Kafka vs a managed queue',lang:'text',
prompt:`Your notification system needs its queue and the team is split between self-hosted Kafka and a managed cloud queue (SQS-style). The decision: <b>managed queue for the MVP</b>. Record it as ADR-0002 with the discipline from the lesson: (1) title line <code># ADR-0002:</code> naming the managed-queue choice; (2) <code>Status: accepted</code>; (3) <code>## Context</code> mentioning the team is <b>small</b> (or has no ops capacity) and volume is modest; (4) <code>## Decision</code> naming the managed queue and explicitly stating Kafka is <b>deferred, not rejected</b>: revisit at a stated trigger (e.g. when replay or multi-consumer streams are needed); (5) <code>## Consequences</code> with at least one <code>+</code> line and at least TWO <code>-</code> lines: real accepted costs (vendor lock-in, no replay, per-message pricing...).`,
starter:`# ADR-0002:

Status:

## Context

## Decision

## Consequences
`,
solution:`# ADR-0002: Use a managed cloud queue for notification delivery

Status: accepted

## Context
The notification MVP needs reliable async delivery at ~50 msgs/s.
The team is three engineers with no operational capacity to run,
patch and monitor a Kafka cluster; delivery order across users is
not required and replay has no current use case.

## Decision
Use the cloud provider's managed queue (SQS-style) with a dead-letter
queue. Kafka is deferred, not rejected: revisit when we need replay,
multiple independent consumers of the same stream, or sustained
volume above ~5k msgs/s.

## Consequences
+ zero queue infrastructure to operate, patch or page on
+ built-in DLQ and per-message retry policy
- vendor lock-in: migration later means code and semantics changes
- no replay: a consumer bug that deletes messages loses them for good
- per-message pricing grows linearly with volume
`,
tests:[{d:'Numbered title names the managed-queue decision',re:'#\\s*ADR-0002:.*(managed|cloud|sqs)',flags:'i'},{d:'Status accepted',re:'Status:\\s*accepted',flags:'i'},{d:'Context names the small team / no ops capacity',re:'##\\s*Context[\\s\\S]*?(small|three|no\\s+op|capacity)',flags:'i'},{d:'Decision defers Kafka with an explicit revisit trigger',re:'##\\s*Decision[\\s\\S]*?(deferred|revisit)[\\s\\S]*?(replay|consumers|volume|msgs)',flags:'i'},{d:'At least one real plus',re:'##\\s*Consequences[\\s\\S]*?^\\+',flags:'im'},{d:'At least two real minuses',re:'^-[\\s\\S]*?^-',flags:'im'}],
behavior:`1. The Context sells nothing; it states team size, volume and absent requirements, which make the decision nearly self-evident (good ADRs often do). 2. "Deferred, not rejected" with a NAMED trigger is the senior signature: the Kafka advocates know exactly what future evidence reopens the question, so the debate ends instead of festering. 3. Two minuses, priced in full: lock-in and no-replay are real, and writing them down now is what makes the 2027 migration discussion start from facts instead of blame. 4. This ADR takes ten minutes and saves the third re-litigation of this argument in standup.`,
hints:['The revisit trigger is the magic sentence; it converts opponents into future allies with a defined trial date.','Managed-vs-self-hosted ADRs almost always hinge on Context stating the team\'s ops capacity out loud.','Two minuses minimum: a one-sided Consequences section reads as advocacy and gets argued with.']},
{title:'Review this design doc',lang:'text',
prompt:`A teammate's design doc reads, in full: <i>"We will migrate user sessions from Postgres to Redis. Redis is much faster. Implementation: dual-write for a week, then cut over reads, then stop writing to Postgres. Timeline: 3 weeks."</i> Using the lesson's template, name what's missing, one per numbered line: (1) no numbers anywhere: the section that should quantify the problem being solved (one word); (2) nothing says what this migration is NOT changing: the missing bullet list (two words, hyphen ok); (3) "Redis is much faster" considers no other option: the missing section (one word); (4) sessions in Redis with no persistence config (every user logged out on restart): which section should have caught this class of surprise (one word); (5) dual-write with no comparison step: name the missing validation activity (one word or two: comparing the two stores' answers); (6) nothing says how to abort mid-migration: the missing story (one word).`,
starter:`1.
2.
3.
4.
5.
6.
`,
solution:`1. context
2. non-goals
3. alternatives
4. risks
5. verification
6. rollback
`,
tests:[{d:'Q1: Context with numbers is absent',re:'1\\.\\s*context',flags:'is'},{d:'Q2: non-goals unlisted',re:'2\\.\\s*non[- ]?goals',flags:'is'},{d:'Q3: alternatives unconsidered',re:'3\\.\\s*alternatives',flags:'is'},{d:'Q4: risks section missing',re:'4\\.\\s*risks?',flags:'is'},{d:'Q5: no verification/shadow comparison',re:'5\\.\\s*(verification|validation|comparison|shadow)',flags:'is'},{d:'Q6: no rollback story',re:'6\\.\\s*rollback',flags:'is'}],
behavior:`1. Context: is session lookup actually slow? p99? at what load? "Redis is faster" without a number might be solving a non-problem. 2. Non-goals: session SCHEMA unchanged? TTL semantics unchanged? Unstated scope grows silently. 3. Alternatives: Postgres UNLOGGED tables? a Caffeine layer? "no alternatives" reads as "no thinking" to every senior reviewer. 4. Risks: Redis persistence (RDB/AOF?), memory limits, failover; "everyone logged out" is a risk a two-line section catches for free. 5. Verification: the dual-write week is worthless unless something DIFFS the stores; silent divergence discovered at cutover is the classic migration wound. 6. Rollback: reads cut over and sessions written only to Redis: day 10 disaster means what, exactly? A doc that can't answer isn't ready. Six flaws, one root: the doc describes intent, not thinking.`,
hints:['Run the template as a checklist: Context-with-numbers, Goals/Non-goals, Alternatives, Risks, Verification, Rollback: this doc scores 0 for 6.','Q5: dual-write is only as good as the diff job watching it.','The kindest review phrasing: "could you add the numbers that motivated this?" (question form, lesson wrc4).']}]}
]});
