STREAMS.push({icon:'📐',dan:true,title:'System Design & Tradeoffs',blurb:'The senior skill: deciding what to build. Estimation, the scaling toolbox, data decisions, a full design walkthrough, and writing it down in design docs & ADRs.',lessons:[
{id:'sd1',title:'Thinking in tradeoffs',body:`
<p>Everything before this stream taught you to build correctly. Seniority starts with a different question: <b>of the five correct designs, which one should exist?</b> The honest answer is always a tradeoff — and the senior habit is naming what you're paying and what you're buying, out loud, before committing.</p>
<p>The currencies you trade between:</p>
<ul>
<li><b>Latency vs throughput</b> — batching requests raises total work done per second and makes each individual answer slower. Neither is "better"; a trading system and a nightly report want opposite ends.</li>
<li><b>Consistency vs availability</b> — when a network partition splits your replicas (and it will), you choose: refuse writes (consistent, less available) or accept them and reconcile later (available, temporarily inconsistent). Bank balances pick one way, like-counts the other.</li>
<li><b>Simplicity vs everything else</b> — every component you add (cache, queue, second database) buys a capability and costs operational surface: one more thing to monitor, secure, upgrade, and debug at 2am. Seniors count this cost reflexively; juniors discover it in production.</li>
<li><b>Build vs buy vs skip</b> — the strongest senior move is the feature not built. "We can add the queue when the write rate demands it" is a design decision, and often the best one.</li>
</ul>
<p><b>Back-of-envelope estimation</b> is how you ground these choices in numbers instead of vibes. The multiplication is deliberately crude — you want the order of magnitude, not the third digit:</p>
<div class="codeSample">10M users × 10 requests/day  =  100M req/day
100M / ~100k seconds per day =  ~1,000 req/s average  →  plan ~3-5k peak

storage: 100M events/day × 1 KB  ≈ 100 GB/day  ≈ 36 TB/year   (retention policy needed!)
one server realistically:  a few thousand simple req/s  →  average fits on ONE box;
                           peak, redundancy and growth are why you'll still want ~3</div>
<p>Useful constants to carry: ~100k seconds/day (it's 86,400 — round up for margin); reads dominate writes 10:1 to 100:1 in most consumer systems; a request touching only RAM/cache is ~100× cheaper than one touching disk, ~10× again vs one crossing a datacenter. The point of estimation is not precision — it's that "1k req/s" and "1M req/s" are <i>different projects</i>, and five minutes of arithmetic tells you which one you're in before you design the wrong one.</p>`,
docs:[['The CAP theorem — Kleppmann critique','https://martin.kleppmann.com/2015/05/11/please-stop-calling-databases-cp-or-ap.html'],['Latency numbers every programmer should know','https://gist.github.com/jboner/2841832'],['Designing Data-Intensive Applications (the book)','https://dataintensive.net/']],
ex:{title:'Estimation drill',lang:'text',
prompt:`Order-of-magnitude answers, one per numbered line — crude is correct: (1) 5M users each making 20 requests/day: how many requests per second on average? Round using ~100k seconds/day (one number, e.g. <code>1000</code>); (2) those are 2 KB each — roughly how much ingress per day, in GB (one number); (3) a partition cuts your two replicas apart and you keep accepting writes on both — did you choose <code>consistency</code> or <code>availability</code>? (4) like-counts on posts: is temporary staleness <code>acceptable</code> or <code>unacceptable</code>? (5) adding a Redis cache buys read speed — name the main thing it costs (two words, think 2am), (6) the average load in Q1 fits one server — name the reason you still deploy more than one (one word).`,
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
behavior:`1. 5M × 20 = 100M/day ÷ ~100k s ≈ 1,000 req/s — and you'd whisper "peak ~3-5k" right after. 2. 100M × 2 KB = 200 GB/day — which forces the retention conversation nobody scheduled. 3. Availability: both sides accept writes, reconciliation comes later — the CAP choice made concrete. 4. Acceptable — a like-count being 3 seconds stale harms nobody; a bank balance is the other answer. 5. Operational complexity: a cache is a second system that can be stale, full, down, or lying. 6. Redundancy — the second server is not for load, it's for the day the first one dies.`,
hints:['100M/day over 100k seconds: just cancel zeros — estimation is licensed laziness.','Q3: refusing writes during partition = consistency; accepting on both sides = availability.','Q6: capacity says one box; the FAILURE model says never one box.']}},

{id:'sd2',title:'The scaling toolbox',body:`
<p>Systems scale through a small, ordered toolbox. Senior judgment is applying the tools <b>in order of cheapness</b> — each next tool costs more complexity than the last, so you earn it with evidence, not anticipation.</p>
<ul>
<li><b>1. Vertical scaling</b> — a bigger box. Unfashionable and correct: zero code changes, and modern boxes are enormous. Its limits (price curve, single point of failure) are real but usually further away than people claim.</li>
<li><b>2. Stateless horizontal scaling</b> — N identical app servers behind a load balancer. The prerequisite is that <i>the servers hold no state</i>: sessions in Redis or JWTs, files in object storage, memory only as cache. This is why the Ledgerly project kept state in Postgres — stateless services scale by copy-paste.</li>
<li><b>3. Caching</b> — the highest-leverage tool, in layers: browser (Cache-Control), CDN for static assets, application cache (Caffeine/Redis — your cache stampede lesson), and the database's own buffer pool. Every layer answers requests the layer below never sees. The tax: invalidation, staleness, and one of computing's two hard problems.</li>
<li><b>4. Read replicas</b> — the 10:1 read-heavy reality means one writer + N readers goes far. New tax: <b>replication lag</b> — a user who writes then immediately reads may not see their own write unless you route read-after-write to the primary.</li>
<li><b>5. Queues as shock absorbers</b> — decouple accepting work from doing it (your Kafka/outbox lessons). Spikes become backlog instead of outages; the tax is eventual completion and idempotent consumers.</li>
<li><b>6. Sharding</b> — split the data itself across databases by some key. <b>Last resort</b>: cross-shard queries, rebalancing, and hot keys (the celebrity problem) make everything harder forever. Reach for it when a single writer genuinely cannot cope — not before.</li>
</ul>
<div class="codeSample">symptom                          → reach for
"CPU pegged on app servers"      → more replicas (they're stateless, right?)
"same rows read 1000×/s"         → cache (with a TTL you can defend)
"reads drown the database"       → read replicas (mind read-after-write)
"traffic spikes break writes"    → queue between accept and process
"ONE table too big for ONE box"  → sharding — the tool of last resort</div>
<p>The meta-rule: <b>scale the bottleneck, not the architecture</b>. Measure, find the actual constraint, apply the cheapest tool that moves it, re-measure. Systems that jumped to microservices-plus-sharding on day one carry the tax forever while their traffic would have fit in a cache.</p>`,
docs:[['Scaling to 11M+ users on AWS','https://aws.amazon.com/blogs/startups/scaling-on-aws-part-1/'],['Cache strategies — AWS builders library','https://aws.amazon.com/builders-library/caching-challenges-and-strategies/'],['Shopify — sharding lessons','https://shopify.engineering/a-pods-architecture-to-allow-shopify-to-scale']],
ex:{title:'Bottleneck triage',lang:'text',
prompt:`Name the cheapest correct tool, one per numbered line: (1) app servers at 95% CPU, database idle — <code>replicas</code>, <code>cache</code> or <code>sharding</code>? (2) the same product page is read 5,000×/s and changes hourly — which tool? (3) users complain "I posted but my post isn't in my feed" right after a write, on a system with read replicas — name the cause (two words), (4) checkout requests spike 50× during a sale and orders are being dropped — which tool absorbs the spike? (5) what property must app servers have BEFORE horizontal scaling works (one word), (6) a single Postgres writer is genuinely saturated after caching, replicas and queues — what's left (one word)?`,
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
behavior:`1. The database is idle — the bottleneck is compute; clone the stateless tier. 2. 5,000 reads/s of hourly-changing data is the textbook cache hit: TTL 60s serves 300k requests per refresh. 3. Replication lag — the write landed on the primary, the read hit a replica that hasn't caught up; route read-after-write to the primary. 4. A queue turns the 50× spike into a backlog that drains — checkout accepts fast, fulfillment catches up. 5. Stateless — server-held sessions break the moment a load balancer sends request 2 elsewhere. 6. Sharding — named correctly as what remains when the cheaper tools are exhausted, not as an opening move.`,
hints:['Always ask which resource is actually saturated — the answer names the tool.','Q3 is the classic replica surprise; the fix is routing, not more hardware.','The order of the toolbox IS the answer key: cheapest tool that moves the measured bottleneck.']}},

{id:'sd3',title:'Data decisions: model for the reads',body:`
<p>Most system-design decisions are secretly data decisions. The senior question is never "SQL or NoSQL?" in the abstract — it's <b>"what are the queries, and what shape serves them?"</b></p>
<ul>
<li><b>Start relational.</b> Postgres handles the first several orders of magnitude of almost anything, gives you transactions, joins, constraints and 50 years of tooling. Choosing a specialty store first and rediscovering joins by hand in application code is the most common self-inflicted wound in system design. Document stores earn their place when data is genuinely document-shaped and join-free; key-value stores when access is only ever by key at huge scale; search indexes for text search. Each is an <i>addition</i> justified by a query pattern, not a replacement chosen by fashion.</li>
<li><b>Normalization is for writes; denormalization is for reads.</b> Third-normal-form (each fact stored once) makes updates cheap and anomalies impossible — the right default. But a feed that joins six tables per page view at 1,000 req/s may earn a denormalized copy: store the feed pre-built, accept that a username change now means updating N rows. You are trading <b>write complexity for read speed</b> — say so explicitly, and write down who updates the copy.</li>
<li><b>Indexes are the same trade in miniature.</b> Every index makes some query O(log n) and every write slightly slower (one more structure to update). Index the columns your WHERE/ORDER BY actually use (your EXPLAIN lesson); an unused index is pure write tax.</li>
<li><b>Cache vs denormalize vs precompute</b> — three answers to "reads are slow", in increasing commitment: a cache is disposable (TTL, rebuildable, can be dropped); a denormalized column is a schema promise (must be maintained forever); a precomputed table (materialized view, nightly rollup) sits between. Prefer the most disposable thing that meets the latency target.</li>
<li><b>Estimate the working set.</b> 36 TB/year sounds scary until you ask what's <i>hot</i>: if 95% of reads touch the last 30 days (~3 TB), that fits in RAM across a few replicas — archive the rest to object storage. Hot/cold separation routinely deletes an order of magnitude from the hardware bill.</li>
</ul>
<p>The habit that binds these: <b>list the top 5 queries before choosing anything</b> — their frequency, latency budget, and consistency needs. The design falls out of that table more reliably than out of any technology preference.</p>`,
docs:[['Use the index, Luke','https://use-the-index-luke.com/'],['PostgreSQL — materialized views','https://www.postgresql.org/docs/current/rules-materializedviews.html'],['DDIA ch. 2-3 — data models & storage','https://dataintensive.net/']],
ex:{title:'Data decisions drill',lang:'text',
prompt:`One per numbered line: (1) the sane default database for a new CRUD product (one word), (2) storing each fact exactly once is called ____ (one word), (3) pre-joining a feed into one read-optimized copy trades write complexity for ____ ____ (two words), (4) reads are slow; rank these by <b>disposability</b>, most disposable first: <code>denormalized column</code>, <code>cache</code>, <code>materialized view</code> (comma-separated), (5) every index speeds one query and taxes every ____ (one word), (6) 95% of reads touch 30 days of data — the pattern of keeping that in fast storage and archiving the rest is called ____/____ separation (two words, slash ok).`,
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
behavior:`1. Postgres (any relational answer accepted) — specialty stores are earned additions, not defaults. 2. Normalization — each fact once, updates touch one row. 3. Read speed — and the unstated price is every writer now maintaining the copy. 4. Cache (droppable), materialized view (rebuildable on schedule), denormalized column (a forever schema promise) — commitment ascending. 5. Write — indexes are free to read, never free to maintain. 6. Hot/cold — the working set, not total data, sizes your hardware.`,
hints:['Q4 hinges on one question: if this thing is wrong or in the way, how hard is it to delete?','Q5: an index is a data structure updated on every INSERT/UPDATE — that IS the tax.','The top-5-queries table beats every technology opinion you will ever hold.']}},

{id:'sd4',title:'Walkthrough: designing a real system',body:`
<p>The method, start to finish, on a concrete problem: <b>design an image-sharing feed</b> (users post images, follow others, see a feed). This five-step loop is reusable on any system — and it is exactly the structure interviewers listen for.</p>
<p><b>1. Requirements & numbers first.</b> Functional: post image, follow, view feed. Non-functional: feed loads &lt; 200ms, 10M users, ~1M posts/day, reads dominate ~100:1. Instant deductions: 1M/day ≈ 12 writes/s (tiny!) but ~1,200 feed reads/s (the real problem) — <i>this system is a read problem</i>. Half the design just fell out of arithmetic.</p>
<p><b>2. API sketch</b> — nail the contract before the internals: <code>POST /posts</code>, <code>POST /users/id/follow</code>, <code>GET /feed?cursor=...</code> (cursor pagination — your REST lesson — because page numbers break when new posts land).</p>
<p><b>3. Data model</b> — <code>users</code>, <code>posts(author_id, image_url, created_at)</code>, <code>follows(follower_id, followee_id)</code>. Images are the easy trap: they go in <b>object storage + CDN</b>, never the database — the DB stores the URL.</p>
<p><b>4. The core decision — every real system has one.</b> Here: how is the feed built?</p>
<div class="codeSample">fan-out on READ  (pull): feed = query posts of everyone I follow, at request time
  + simple, always fresh      − that query at 1,200/s joins follows×posts — expensive

fan-out on WRITE (push): when someone posts, INSERT into every follower's feed table
  + feed read = one indexed lookup (fast, cheap)     − a 5M-follower celebrity post
                                                       = 5M writes (the hot-key problem)

production answer: HYBRID — push for normal users, pull for celebrities, merge at read.
Not a compromise — a recognition that two populations have two different shapes.</div>
<p><b>5. Walk the failure & growth paths.</b> What breaks first? The feed store → cache hot feeds. Celebrity posts → the hybrid. Image bandwidth → CDN already took it. Then say what you're NOT building: no stories, no ranking algorithm v1 — chronological ships first.</p>
<p>Notice what the method did: numbers chose read-vs-write focus, the API forced pagination thinking, the data model surfaced object storage, and ONE decision (fan-out) got the real analysis. Depth on the decision that matters beats shallow coverage of ten boxes — in interviews and in the design review at work.</p>`,
docs:[['Instagram engineering — feed architecture','https://instagram-engineering.com/'],['System design primer','https://github.com/donnemartin/system-design-primer'],['Twitter timelines at scale (InfoQ talk)','https://www.infoq.com/presentations/Twitter-Timeline-Scalability/']],
ex:{title:'The core-decision drill',lang:'text',
prompt:`Same method, new system — <b>a chat app</b> (1:1 and small groups, 10M users): one per numbered line: (1) messages are written once and read by ~5 people — is chat a <code>read</code> problem or a <code>write</code> problem compared to the feed? (2) the core decision in chat is delivery: the server pushing over an open connection is which protocol (one word, you built one in the projects stream), (3) a user was offline for an hour — what makes messages survive until they connect (one word), (4) message ordering within one conversation: global timestamps or a per-conversation ____ (one word, think monotonically increasing), (5) images in chat go where (two words), (6) name the thing you'd explicitly NOT build in v1 from: <code>read receipts</code>, <code>message storage</code>, <code>login</code>.`,
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
tests:[{d:'Q1: chat inverts the feed — write-shaped',re:'1\\.\\s*write',flags:'is'},{d:'Q2: WebSocket push',re:'2\\.\\s*websockets?',flags:'is'},{d:'Q3: a queue/inbox holds offline messages',re:'3\\.\\s*(queue|inbox|buffer)',flags:'is'},{d:'Q4: per-conversation sequence number',re:'4\\.\\s*sequence',flags:'is'},{d:'Q5: object storage (+ CDN) as always',re:'5\\.\\s*object\\s+stor',flags:'is'},{d:'Q6: read receipts are the v1 cut',re:'6\\.\\s*read\\s+receipts',flags:'is'}],
behavior:`1. Write — each message is written per-recipient-ish and read a handful of times; the feed's 100:1 read ratio inverts. 2. WebSocket — DojoChat was this lesson's rehearsal. 3. A queue (per-user inbox): offline users' messages wait durably instead of vanishing. 4. Sequence numbers per conversation — wall-clock timestamps skew across devices (foreshadowing the clocks lesson next stream). 5. Object storage behind a CDN; the message row carries a URL. 6. Read receipts — login and storage are the product; receipts are v2 polish. Cutting them is a design decision, not a failure.`,
hints:['Run step 1 arithmetic and the read-vs-write answer falls out before any boxes are drawn.','Q4: "sort by timestamp" across machines is a lie you will meet again next stream.','Q6 tests the senior move from the walkthrough: name what you are NOT building, out loud.']}},

{id:'sd5',title:'Design docs & ADRs: deciding in writing',body:`
<p>A design that lives in your head scales to one person and zero months. Senior engineers <b>decide in writing</b> — not bureaucracy, but the cheapest known way to find flaws before building, get honest review, and let 2027-you understand why 2026-you did this.</p>
<p><b>The design doc</b> (one to four pages, written <i>before</i> building anything significant):</p>
<div class="codeSample">1. Context     — the problem, the numbers, what happens if we do nothing
2. Goals       — bullet list; and NON-goals: what this explicitly won't do
3. Proposal    — the design, at whatever depth the decision needs
4. Alternatives— 2-3 seriously considered options and WHY NOT each
                 (the section reviewers read first — no alternatives = no thinking)
5. Risks       — what could go wrong, blast radius, rollback story
6. Open questions — asked honestly; a doc with zero open questions is bluffing</div>
<p><b>The ADR</b> (Architecture Decision Record) is the design doc's small sibling: half a page recording ONE decision, numbered and immutable, living in the repo (<code>docs/adr/0007-use-postgres-for-progress.md</code>). Its power is the <b>Context → Decision → Consequences</b> discipline — consequences <i>including the bad ones you accept</i>:</p>
<div class="codeSample"># ADR-0007: Store progress in Postgres, not Redis
Status: accepted            (later: superseded by ADR-0019 — history preserved, never edited)
## Context
Progress must survive restarts and joins with users; write rate ~12/s.
## Decision
Postgres. The write rate is trivial; durability and joins are the need.
## Consequences
+ transactions with user data;  + one fewer system to run
− hot-path reads hit the DB → add Caffeine if p99 exceeds 50ms   ← accepted cost, named</div>
<p>Why writing beats meetings: text is reviewable asynchronously and by more people; writing exposes hand-waving that speech hides ("...and then somehow the cache invalidates"); the alternatives section forces real comparison; and the archive turns "why on earth is it built this way?" from archaeology into a link. Every "why do we even have this queue?" argument that ends in a shrug is a missing ADR.</p>`,
docs:[['ADR — the original pattern (Nygard)','https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions'],['adr.github.io — formats & tools','https://adr.github.io/'],['Design docs at Google','https://www.industrialempathy.com/posts/design-docs-at-google/']],
ex:{title:'Write an ADR',lang:'text',
prompt:`Write ADR-0001 for JavaDojo's own launch (the decision is made — record it): a markdown-shaped doc containing, in order: (1) a title line starting <code># ADR-0001:</code> about choosing a <b>separate runner service</b> for executing user code; (2) a <code>Status: accepted</code> line; (3) a <code>## Context</code> section mentioning that user code is <b>untrusted</b>; (4) a <code>## Decision</code> section stating code runs in an <b>isolated container</b> with <b>no network</b>; (5) a <code>## Consequences</code> section with at least one <code>+</code> line and at least one <code>-</code> line — and the minus must name a real accepted cost (latency, ops burden...).`,
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
untrusted by definition — the API process must never execute it in
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
behavior:`1. The document reads Context → Decision → Consequences: why, what, and the price — in that order. 2. Context justifies without deciding; Decision decides without re-arguing. 3. The minus lines are the ADR's soul: container latency and ops burden are ACCEPTED, in writing, so nobody relitigates them in six months without new information. 4. Numbered and immutable: a future change gets ADR-00NN "supersedes 0001" — the history of the system's mind stays readable.`,
hints:['Context answers "why did this need deciding?" — one paragraph of problem, zero solution.','The Decision section is 2-4 sentences; if it sprawls, it is re-arguing instead of recording.','A Consequences section with only + lines is marketing, not engineering — the honest minus is what makes the doc trustworthy.']}}
]});
