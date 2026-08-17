STREAMS.push({icon:'📦',title:'JPMS & Performance Engineering',blurb:'The Java module system, and finding real bottlenecks with JFR and async-profiler.',lessons:[
{id:'jpm1',title:'JPMS: module-info basics',body:`
<p>Since Java 9 the platform and (optionally) your code are organized as <b>modules</b>: named units that declare what they need and what they expose. A module is a jar with a <code>module-info.java</code> at its root:</p>
<div class="codeSample">module com.dojo.api {
    requires java.net.http;              // I use this module
    requires transitive com.dojo.model;  // my users get this one for free
    exports com.dojo.api.client;         // only THIS package is visible outside
}                                        // everything not exported is hidden, even public classes!</div>
<div class="codeSample">javac -d out --module-source-path src $(find src -name "*.java")
java --module-path out -m com.dojo.api/com.dojo.api.client.Main
jdeps --module-path out out/com.dojo.api      # analyze real dependencies</div>
<p>The win: <b>strong encapsulation</b>. "public" stops meaning "everyone"; only exported packages are API. <code>requires transitive</code> is for types that appear in your own API signatures. Code without module-info lands on the classpath as the <i>unnamed module</i>, perfectly legal, which is why most apps adopt JPMS gradually or never; the JDK itself, though, is fully modular, and jlink (next lesson) needs it.</p>

<h4>Why the module system exists</h4>
<p>Before Java 9 the classpath was a flat list with two structural problems. <b>Encapsulation stopped at <code>public</code></b>: any class in any jar could reach any public type in any other, so "internal" packages were internal by convention and by nothing else, which is how <code>sun.misc.Unsafe</code> ended up load-bearing across the ecosystem. And <b>dependencies were unverified</b>: a missing jar produced a <code>NoClassDefFoundError</code> at the moment of first use, potentially in production at 3am, rather than at startup.</p>
<p>Modules address both. <code>requires</code> is checked when the module graph is resolved, so a missing dependency fails immediately and visibly, and split packages (the same package in two jars) are rejected outright rather than resolved by classpath order.</p>

<h4>The directives worth knowing</h4>
<ul>
<li><code>exports p</code>: package <code>p</code> is API. <code>exports p to m</code> is a qualified export, visible only to named modules.</li>
<li><code>requires transitive m</code>: anyone requiring you also gets <code>m</code>. Use it when <code>m</code>'s types appear in <i>your</i> public signatures; forgetting it means your callers fail to compile against your own API.</li>
<li><code>opens p</code>: allows deep reflection at runtime without exporting at compile time, which is what frameworks doing dependency injection or ORM need. <code>open module</code> opens everything, and is the pragmatic escape hatch.</li>
<li><code>provides X with Y</code> / <code>uses X</code>: the module-aware form of <code>ServiceLoader</code>.</li>
</ul>

<h4>The real adoption story</h4>
<p>Most applications never write a <code>module-info.java</code>, and that is a defensible choice: on the classpath your code lives in the unnamed module, which reads everything and exports everything, exactly as before. The value is highest for <b>libraries</b> (where a published module boundary is a real API contract) and for anything that wants <code>jlink</code> to produce a trimmed runtime image, since jlink needs a fully modular graph.</p>
<p>What everyone does encounter, modules or not, is the JDK's own modularity: <code>InaccessibleObjectException</code> and the "module java.base does not open java.lang" message are the platform enforcing encapsulation on reflection. The correct answer is a targeted <code>--add-opens</code> flag while the library is fixed, not a blanket one, and certainly not staying on an old JDK.</p>`,
docs:[['Modules — dev.java','https://dev.java/learn/modules/'],['JPMS quick-start — openjdk','https://openjdk.org/projects/jigsaw/quick-start']],
ex:{title:'Write a module descriptor',
prompt:`Write the <code>module-info.java</code> for module <code>com.example.tokens</code>: it <code>requires java.net.http</code>, <code>requires transitive com.example.model</code> (model types appear in its public API), and exports exactly two packages: <code>com.example.tokens.api</code> and <code>com.example.tokens.claims</code>. Nothing else is exported.`,
starter:`module com.example.tokens {
    // requires ..., requires transitive ..., exports x2
}`,
tests:[{d:'Correct module name',re:'module\\s+com\\.example\\.tokens\\s*\\{'},{d:'requires java.net.http',re:'requires\\s+java\\.net\\.http\\s*;'},{d:'requires transitive the model',re:'requires\\s+transitive\\s+com\\.example\\.model\\s*;'},{d:'Exports the api package',re:'exports\\s+com\\.example\\.tokens\\.api\\s*;'},{d:'Exports the claims package',re:'exports\\s+com\\.example\\.tokens\\.claims\\s*;'}],
behavior:`1. Exactly two exports: internal packages stay sealed even if their classes are public. 2. transitive on the model module means consumers of com.example.tokens can compile against model types without requiring it themselves. 3. Valid module-info syntax (statements end with ;).`,
hints:['Each directive is a statement: <code>requires java.net.http;</code>','transitive goes between requires and the module name.','One exports statement per package; there is no wildcard.'],
solution:`module com.example.tokens {
    requires java.net.http;
    requires transitive com.example.model;

    exports com.example.tokens.api;
    exports com.example.tokens.claims;
}`}},
{id:'jpm2',title:'JPMS advanced: services, opens & jlink',body:`
<p>Three power features:</p>
<div class="codeSample">// SERVICES: decoupled plugins via the module system
module com.dojo.spi {
    exports com.dojo.spi;                          // the interface lives here
}
module com.dojo.provider {
    requires com.dojo.spi;
    provides com.dojo.spi.TokenSigner
        with com.dojo.provider.HmacSigner;         // my implementation
}
module com.dojo.app {
    requires com.dojo.spi;
    uses com.dojo.spi.TokenSigner;                 // consumed via ServiceLoader
}
// in code:  ServiceLoader.load(TokenSigner.class)

// OPENS: allow frameworks to reflect on internals (Jackson, Spring, JPA)
module com.dojo.api {
    opens com.dojo.api.dto to com.fasterxml.jackson.databind;
}</div>
<div class="codeSample">jlink --module-path out --add-modules com.dojo.app --output myruntime
myruntime/bin/java -m com.dojo.app/...        # custom runtime: ~40MB, only YOUR modules</div>
<p><code>exports</code> = compile-time visibility; <code>opens</code> = deep reflection at runtime (an <i>open module</i> opens everything). <code>jlink</code> assembles a trimmed runtime image from just the modules you use, the JPMS payoff for containers.</p>
<h4>Why services are the interesting part</h4>
<p><code>requires</code> creates a hard, compile-time dependency: useful, and the opposite of a plugin
architecture. Services invert it: the consumer depends only on the <b>interface</b> module, and providers
are discovered at runtime from whatever happens to be on the module path.</p>
<div class="codeSample" data-hl>app --requires--&gt; spi  &lt;--requires-- provider
        uses                        provides ... with ...

// the app has NO reference to the provider. add a provider module to
// the module path and ServiceLoader finds it; remove it and nothing
// breaks at compile time. that is a plugin system with no framework.</div>
<p>The improvement over the old <code>META-INF/services</code> mechanism is that the module system
<b>verifies it</b>: the compiler checks that the class named in <code>provides ... with ...</code> exists
and actually implements the interface. The classpath version failed at runtime, on a typo, with a
confusing error.</p>
<p><code>ServiceLoader</code> is lazy (it instantiates on iteration), so treat a missing provider as a
real case and decide what an empty result means. Ordering is not guaranteed either, which matters if you
were hoping for a priority chain.</p>

<h4><code>exports</code> versus <code>opens</code>: the distinction that causes every migration error</h4>
<div class="codeSample" data-hl>exports com.acme.api;         compile-time access to PUBLIC types.
                              reflection into private members still fails.

opens com.acme.dto;           deep reflection at RUNTIME - setAccessible
                              works. no compile-time access granted.

opens com.acme.dto to com.fasterxml.jackson.databind;   qualified: only
                              that module. this is the right default.

open module com.acme { }      every package open. the pragmatic escape
                              hatch when migrating a large codebase.</div>
<p>This is why frameworks fail with <code>InaccessibleObjectException</code> on a modular application:
Jackson needs to reflect into your DTO's private fields, and <code>exports</code> does not grant that.
Strong encapsulation is the feature: the JDK's own internals became genuinely inaccessible, which is what
allowed the platform to evolve, and the <code>--add-opens</code> flags you have seen in start-up scripts
are the same thing being pried open from outside.</p>

<h4><code>jlink</code>, and where JPMS actually landed</h4>
<p><code>jlink</code> is the concrete payoff: a runtime image containing only the modules you actually use.
A hello-world image is around 40MB against a full JDK's 300MB, which matters for container size and cold
start. It works only if the whole graph is modular, which is why <code>jdeps</code> exists to find what is
missing.</p>
<p>And the assessment worth stating plainly: <b>JPMS did not win in application code.</b> The JDK itself is
modular and benefits enormously, but most Spring Boot services ship a fat jar on the classpath and use
Docker for the packaging problem JPMS was partly aimed at. Learn it because you will meet
<code>--add-opens</code>, because the JDK's structure now depends on it, and because <code>jlink</code> is
genuinely useful, not because your next service will have a <code>module-info.java</code>.</p>`,
docs:[['ServiceLoader — API','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/ServiceLoader.html'],['jlink — Oracle','https://docs.oracle.com/en/java/javase/21/docs/specs/man/jlink.html']],
ex:{title:'Wire a service',
prompt:`Write two module descriptors in one editor (Java allows one per file; for this drill, stack them): (1) module <code>com.dojo.provider</code>: requires <code>com.dojo.spi</code>, and <code>provides com.dojo.spi.TokenSigner with com.dojo.provider.HmacSigner</code>. (2) module <code>com.dojo.app</code>: requires <code>com.dojo.spi</code>, declares <code>uses com.dojo.spi.TokenSigner</code>, and <code>opens com.dojo.app.dto to com.fasterxml.jackson.databind</code>.`,
starter:`module com.dojo.provider {
    // requires + provides ... with ...
}

module com.dojo.app {
    // requires + uses + opens ... to ...
}`,
tests:[{d:'provides ... with ... in the provider',re:'provides\\s+com\\.dojo\\.spi\\.TokenSigner\\s+with\\s+com\\.dojo\\.provider\\.HmacSigner\\s*;'},{d:'Both modules require the spi',re:'requires\\s+com\\.dojo\\.spi\\s*;[\\s\\S]*requires\\s+com\\.dojo\\.spi\\s*;'},{d:'uses declaration in the app',re:'uses\\s+com\\.dojo\\.spi\\.TokenSigner\\s*;'},{d:'Qualified opens to Jackson',re:'opens\\s+com\\.dojo\\.app\\.dto\\s+to\\s+com\\.fasterxml\\.jackson\\.databind\\s*;'}],
behavior:`1. Provider declares the implementation binding; app declares consumption; neither knows the other exists, only the SPI. 2. ServiceLoader.load(TokenSigner.class) in the app would find HmacSigner when both are on the module path. 3. The dto package is open ONLY to Jackson: not exported, not open to the world.`,
hints:['Service binding: <code>provides &lt;interface&gt; with &lt;implementation&gt;;</code>','The consumer side is one word different: <code>uses &lt;interface&gt;;</code>','Qualified opens: <code>opens &lt;pkg&gt; to &lt;module&gt;;</code>: reflection for one friend, hidden from everyone else.'],
solution:`module com.dojo.provider {
    requires com.dojo.spi;
    provides com.dojo.spi.TokenSigner with com.dojo.provider.HmacSigner;
}

module com.dojo.app {
    requires com.dojo.spi;
    uses com.dojo.spi.TokenSigner;
    opens com.dojo.app.dto to com.fasterxml.jackson.databind;
}`}},
{id:'prf1',title:'Java Flight Recorder: always-on profiling',body:`
<p>JFR is the JDK's built-in event recorder: ~1% overhead, safe in production, which is exactly where the interesting problems live. It records method samples, allocations, GC pauses, lock contention, I/O and thousands more events into a <code>.jfr</code> file you open in JDK Mission Control (JMC).</p>
<div class="codeSample"># at launch: record for 60s, dump to file
java -XX:StartFlightRecording=duration=60s,filename=rec.jfr -jar app.jar

# or attach to a RUNNING process, the production move:
jcmd &lt;pid&gt; JFR.start name=probe settings=profile
jcmd &lt;pid&gt; JFR.dump  name=probe filename=probe.jfr
jcmd &lt;pid&gt; JFR.stop  name=probe

jfr print --events jdk.GCPhasePause probe.jfr    # CLI peek without JMC
jfr summary probe.jfr</div>
<p>Reading it in JMC: start with <b>Automated Analysis</b> (it names suspects), then Method Profiling (hot methods), Memory (allocation pressure → GC pain), and Lock Instances (contention). Rule one of performance work: <b>measure before you optimize</b>: the bottleneck is almost never where intuition points.</p>
<h4>Why "safe in production" changes everything</h4>
<p>Most profilers are laboratory tools: they slow the process enough that you must reproduce
the problem in a test environment first. But the interesting performance problems <b>only exist in
production</b>: they need real traffic patterns, real data volumes, real concurrency and the one customer
whose account has 400,000 rows. A profiler you cannot run there is a profiler that cannot see them.</p>
<p>JFR's roughly 1% overhead is the whole point. It is built into the JDK, it can run continuously, and you
can attach to a process that is misbehaving <i>right now</i> rather than trying to recreate it
afterwards.</p>

<h4>The two ways in</h4>
<div class="codeSample" data-hl># always-on, with a ring buffer you can dump when something happens
-XX:StartFlightRecording=settings=profile,maxsize=200m,maxage=6h,
                         dumponexit=true,filename=/var/log/app.jfr

# attach to a running process - the 3am move
jcmd &lt;pid&gt; JFR.start name=probe settings=profile
jcmd &lt;pid&gt; JFR.dump  name=probe filename=/tmp/probe.jfr
jcmd &lt;pid&gt; JFR.stop  name=probe

# two settings ship by default:
#   default = ~1% overhead, safe to leave on forever
#   profile = ~2%, more allocation and method sampling detail</div>
<p><code>maxage</code> is the underrated one: with a rolling buffer, when an incident happens you dump the
<i>last six hours</i>, including the period before anyone noticed. That is the difference between
investigating the event and investigating its aftermath.</p>

<h4>Reading a recording without getting lost</h4>
<p>A recording contains thousands of event types, which is overwhelming if you browse. Go in with a
question and a route:</p>
<p><b>Automated Analysis</b> first: JMC names its suspects and is right often enough to save an hour.
<b>Method Profiling</b> for "where is CPU going", remembering these are samples: a method appearing in 40%
of them is where the time is, but rare-and-slow will not show. <b>Memory</b> for allocation pressure, which
is the usual real cause of "GC problems": the fix is allocating less, not tuning the collector.
<b>Lock Instances</b> for contention, where a single hot <code>synchronized</code> block explains a
throughput ceiling that CPU graphs do not. And <b>Exceptions</b>, because a swallowed exception thrown a
million times a minute is startlingly expensive and invisible everywhere else.</p>

<h4>Beyond the built-in events</h4>
<p>You can define your own: extend <code>jdk.jfr.Event</code>, annotate it, and emit around a business
operation. Now "token issuance latency" is in the same timeline as GC pauses and lock contention, and
correlating a business-level symptom with a JVM-level cause becomes reading one chart rather than joining
two systems.</p>

<h4>The rule this lesson exists to enforce</h4>
<p><b>Measure first.</b> Intuition about performance is wrong at a rate that should be embarrassing:
the bottleneck is regularly an N+1 query, a misconfigured pool, a serialisation cost or a log statement,
and almost never the algorithm someone was about to rewrite. Optimising without a profile is guessing with
extra steps, and it usually makes the code worse while leaving the problem in place.</p>`,
docs:[['JFR — Oracle docs','https://docs.oracle.com/en/java/javase/21/jfapi/why-use-jfr-api.html'],['JDK Mission Control','https://openjdk.org/projects/jmc/'],['jfr tool — reference','https://docs.oracle.com/en/java/javase/21/docs/specs/man/jfr.html']],
ex:{title:'Flight recorder drill',lang:'shell',
prompt:`One per numbered line: (1) launch <code>app.jar</code> with a 60-second recording written to <code>rec.jfr</code>, (2) start a named recording (<code>name=probe</code>, <code>settings=profile</code>) on running pid 4242, (3) dump it to <code>probe.jfr</code>, (4) stop it, (5) print a summary of the file with the <code>jfr</code> CLI tool.`,
starter:`# 1)

# 2)

# 3)

# 4)

# 5)
`,
tests:[{d:'StartFlightRecording at launch',re:'-XX:StartFlightRecording=duration=60s,filename=rec\\.jfr'},{d:'jcmd JFR.start with name and settings',re:'jcmd\\s+4242\\s+JFR\\.start\\s+name=probe\\s+settings=profile'},{d:'JFR.dump to the file',re:'JFR\\.dump\\s+name=probe\\s+filename=probe\\.jfr'},{d:'JFR.stop',re:'JFR\\.stop\\s+name=probe'},{d:'jfr summary',re:'jfr\\s+summary\\s+probe\\.jfr'}],
behavior:`1. (1) java -XX:StartFlightRecording=duration=60s,filename=rec.jfr -jar app.jar. 2-4. jcmd 4242 JFR.start/dump/stop with the name, attaching to a live process, no restart. 5. jfr summary probe.jfr.`,
hints:['The launch flag is one long -XX option with comma-separated parameters.','jcmd verbs are dotted: JFR.start, JFR.dump, JFR.stop; all take name=.','settings=profile is the higher-detail preset (default is the lower-overhead "default").'],
solution:`# 1)
java -XX:StartFlightRecording=duration=60s,filename=rec.jfr -jar app.jar

# 2)
jcmd 4242 JFR.start name=probe settings=profile

# 3)
jcmd 4242 JFR.dump name=probe filename=probe.jfr

# 4)
jcmd 4242 JFR.stop name=probe

# 5)
jfr summary probe.jfr`}},
{id:'prf2',title:'async-profiler & flame graphs',body:`
<p><a href="https://github.com/async-profiler/async-profiler" target="_blank" rel="noopener">async-profiler</a> is the community-standard sampling profiler: low overhead, no safepoint bias (it samples via perf events, so it sees what the JVM's own sampler misses), and it emits <b>flame graphs</b> directly:</p>
<div class="codeSample">./asprof -d 30 -f cpu.html 4242            # 30s CPU profile → interactive flame graph
./asprof -e alloc -d 30 -f alloc.html 4242 # who ALLOCATES (GC pressure hunting)
./asprof -e lock  -d 30 -f lock.html 4242  # lock contention
./asprof -e wall  -d 30 -f wall.html 4242  # wall clock: includes waiting (I/O-bound apps!)</div>
<p><b>Reading a flame graph</b>: y-axis is stack depth, x-axis is <i>proportion of samples</i>: width = time, and the x-order is alphabetical, NOT chronological. Hunt for wide plateaus: a wide frame with no children doing work is your hotspot. The four modes map to the four classic diagnoses: CPU-bound (cpu), memory-churn (alloc), contention (lock), and waiting-on-I/O (wall, where cpu profiles look deceptively idle).</p>

<h4>Sampling, and what it can and cannot tell you</h4>
<p>A sampling profiler interrupts the process many times a second and records the current stack. It therefore measures <b>where time is spent</b>, in proportion, with an overhead of a percent or two, which is what makes it safe to run in production. What it cannot tell you is anything that happens between samples: a method called ten million times for a microsecond each shows up as a wide plateau with no explanation, and a rare five-second stall may not appear at all. For counts and exact durations you need instrumentation or JFR events, not a profiler.</p>
<p>The safepoint-bias point matters here. The JVM's built-in sampler can only take a sample at a safepoint, and hot inlined loops may contain none, so it systematically blames the wrong frames. async-profiler samples via OS perf events and sees the true stack, including JIT-compiled and native frames.</p>

<h4>Which mode answers which question</h4>
<ul>
<li><b>cpu</b>: "the machine is busy; what is it computing?" Wide plateaus at the leaves are the hotspots.</li>
<li><b>alloc</b>: "GC is running constantly." This profiles allocation <i>sites</i>, which is what to fix; tuning the collector is what you do after the churn is gone.</li>
<li><b>lock</b>: "threads are waiting on each other." Width is time blocked on a monitor, which points at the contended lock rather than the slow method.</li>
<li><b>wall</b>: "the request takes two seconds but the CPU is idle." Wall-clock sampling includes time blocked on I/O, and it is the mode that finds the sequential downstream call nobody remembered.</li>
</ul>
<p>Choosing the wrong mode is the most common reason a profiling session finds nothing: a service waiting on a database is invisible in a CPU profile, and its flame graph will look reassuringly flat while the latency is entirely real.</p>

<h4>Method</h4>
<p>Profile the workload you care about, under load, on hardware that resembles production; a profile of a JVM doing nothing is a picture of the JIT warming up. Take a baseline before the change and a second profile after, and compare like for like; "it feels faster" is not a measurement. And read the graph top-down for width, not bottom-up for familiarity: the frame you recognise is rarely the frame that is costing you.</p>`,
docs:[['async-profiler — GitHub','https://github.com/async-profiler/async-profiler'],['Flame graphs — Brendan Gregg','https://www.brendangregg.com/flamegraphs.html']],
ex:{title:'Profiler triage',lang:'text',
prompt:`Answer on the numbered lines: (1) the command for a 30s CPU flame graph of pid 4242 into <code>cpu.html</code>, (2) the event mode that shows what is creating GC pressure, (3) the event mode that catches time spent blocked on I/O that a CPU profile misses, (4) in a flame graph, what the WIDTH of a frame means, (5) true or false: left-to-right order in a flame graph is chronological.`,
starter:`# 1)

# 2)

# 3)

# 4)

# 5)
`,
tests:[{d:'Correct asprof command',re:'asprof\\s+-d\\s+30\\s+-f\\s+cpu\\.html\\s+4242'},{d:'alloc mode for GC pressure',re:'\\balloc\\b','flags':'is'},{d:'wall mode for blocked time',re:'\\bwall\\b','flags':'is'},{d:'Width = share of samples/time',re:'(time|samples)','flags':'is'},{d:'False: alphabetical, not chronological',re:'[Ff]alse'}],
behavior:`1. (1) ./asprof -d 30 -f cpu.html 4242. 2. (2) alloc. 3. (3) wall. 4. (4) the fraction of samples (≈ time) spent in that frame and its children. 5. (5) False: frames are sorted alphabetically; flame graphs show proportion, not sequence.`,
hints:['Flags: -e event, -d duration seconds, -f output file, then the pid.','CPU-idle-but-slow means the time is spent waiting; that is what wall-clock mode reveals.','The most common flame-graph misreading is assuming x = time order. It is not.'],
solution:`# 1)
./asprof -d 30 -f cpu.html 4242

# 2)
alloc

# 3)
wall

# 4)
The proportion of samples (≈ time) spent in that frame and everything it calls; wide = hot.

# 5)
False: frames are ordered alphabetically; the x-axis shows proportion, not chronology.`}}
]});
