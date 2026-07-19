STREAMS.push({icon:'📦',title:'JPMS & Performance Engineering',blurb:'The Java module system, and finding real bottlenecks with JFR and async-profiler.',lessons:[
{id:'jpm1',title:'JPMS: module-info basics',body:`
<p>Since Java 9 the platform and (optionally) your code are organized as <b>modules</b>: named units that declare what they need and what they expose. A module is a jar with a <code>module-info.java</code> at its root:</p>
<div class="codeSample">module com.dojo.api {
    requires java.net.http;              // I use this module
    requires transitive com.dojo.model;  // my users get this one for free
    exports com.dojo.api.client;         // only THIS package is visible outside
}                                        // everything not exported is hidden — even public classes!</div>
<div class="codeSample">javac -d out --module-source-path src $(find src -name "*.java")
java --module-path out -m com.dojo.api/com.dojo.api.client.Main
jdeps --module-path out out/com.dojo.api      # analyze real dependencies</div>
<p>The win: <b>strong encapsulation</b> — "public" stops meaning "everyone"; only exported packages are API. <code>requires transitive</code> is for types that appear in your own API signatures. Code without module-info lands on the classpath as the <i>unnamed module</i> — perfectly legal, which is why most apps adopt JPMS gradually or never; the JDK itself, though, is fully modular, and jlink (next lesson) needs it.</p>`,
docs:[['Modules — dev.java','https://dev.java/learn/modules/'],['JPMS quick-start — openjdk','https://openjdk.org/projects/jigsaw/quick-start']],
ex:{title:'Write a module descriptor',
prompt:`Write the <code>module-info.java</code> for module <code>com.example.tokens</code>: it <code>requires java.net.http</code>, <code>requires transitive com.example.model</code> (model types appear in its public API), and exports exactly two packages: <code>com.example.tokens.api</code> and <code>com.example.tokens.claims</code>. Nothing else is exported.`,
starter:`module com.example.tokens {
    // requires ..., requires transitive ..., exports x2
}`,
tests:[{d:'Correct module name',re:'module\\s+com\\.example\\.tokens\\s*\\{'},{d:'requires java.net.http',re:'requires\\s+java\\.net\\.http\\s*;'},{d:'requires transitive the model',re:'requires\\s+transitive\\s+com\\.example\\.model\\s*;'},{d:'Exports the api package',re:'exports\\s+com\\.example\\.tokens\\.api\\s*;'},{d:'Exports the claims package',re:'exports\\s+com\\.example\\.tokens\\.claims\\s*;'}],
behavior:`1. Exactly two exports — internal packages stay sealed even if their classes are public. 2. transitive on the model module means consumers of com.example.tokens can compile against model types without requiring it themselves. 3. Valid module-info syntax (statements end with ;).`,
hints:['Each directive is a statement: <code>requires java.net.http;</code>','transitive goes between requires and the module name.','One exports statement per package — there is no wildcard.'],
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
<p><code>exports</code> = compile-time visibility; <code>opens</code> = deep reflection at runtime (an <i>open module</i> opens everything). <code>jlink</code> assembles a trimmed runtime image from just the modules you use — the JPMS payoff for containers.</p>`,
docs:[['ServiceLoader — API','https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/ServiceLoader.html'],['jlink — Oracle','https://docs.oracle.com/en/java/javase/21/docs/specs/man/jlink.html']],
ex:{title:'Wire a service',
prompt:`Write two module descriptors in one editor (Java allows one per file — for this drill, stack them): (1) module <code>com.dojo.provider</code>: requires <code>com.dojo.spi</code>, and <code>provides com.dojo.spi.TokenSigner with com.dojo.provider.HmacSigner</code>. (2) module <code>com.dojo.app</code>: requires <code>com.dojo.spi</code>, declares <code>uses com.dojo.spi.TokenSigner</code>, and <code>opens com.dojo.app.dto to com.fasterxml.jackson.databind</code>.`,
starter:`module com.dojo.provider {
    // requires + provides ... with ...
}

module com.dojo.app {
    // requires + uses + opens ... to ...
}`,
tests:[{d:'provides ... with ... in the provider',re:'provides\\s+com\\.dojo\\.spi\\.TokenSigner\\s+with\\s+com\\.dojo\\.provider\\.HmacSigner\\s*;'},{d:'Both modules require the spi',re:'requires\\s+com\\.dojo\\.spi\\s*;[\\s\\S]*requires\\s+com\\.dojo\\.spi\\s*;'},{d:'uses declaration in the app',re:'uses\\s+com\\.dojo\\.spi\\.TokenSigner\\s*;'},{d:'Qualified opens to Jackson',re:'opens\\s+com\\.dojo\\.app\\.dto\\s+to\\s+com\\.fasterxml\\.jackson\\.databind\\s*;'}],
behavior:`1. Provider declares the implementation binding; app declares consumption — neither knows the other exists, only the SPI. 2. ServiceLoader.load(TokenSigner.class) in the app would find HmacSigner when both are on the module path. 3. The dto package is open ONLY to Jackson — not exported, not open to the world.`,
hints:['Service binding: <code>provides &lt;interface&gt; with &lt;implementation&gt;;</code>','The consumer side is one word different: <code>uses &lt;interface&gt;;</code>','Qualified opens: <code>opens &lt;pkg&gt; to &lt;module&gt;;</code> — reflection for one friend, hidden from everyone else.'],
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
<p>JFR is the JDK's built-in event recorder — ~1% overhead, safe in production, which is exactly where the interesting problems live. It records method samples, allocations, GC pauses, lock contention, I/O and thousands more events into a <code>.jfr</code> file you open in JDK Mission Control (JMC).</p>
<div class="codeSample"># at launch: record for 60s, dump to file
java -XX:StartFlightRecording=duration=60s,filename=rec.jfr -jar app.jar

# or attach to a RUNNING process — the production move:
jcmd &lt;pid&gt; JFR.start name=probe settings=profile
jcmd &lt;pid&gt; JFR.dump  name=probe filename=probe.jfr
jcmd &lt;pid&gt; JFR.stop  name=probe

jfr print --events jdk.GCPhasePause probe.jfr    # CLI peek without JMC
jfr summary probe.jfr</div>
<p>Reading it in JMC: start with <b>Automated Analysis</b> (it names suspects), then Method Profiling (hot methods), Memory (allocation pressure → GC pain), and Lock Instances (contention). Rule one of performance work: <b>measure before you optimize</b> — the bottleneck is almost never where intuition points.</p>`,
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
behavior:`1. (1) java -XX:StartFlightRecording=duration=60s,filename=rec.jfr -jar app.jar. 2-4. jcmd 4242 JFR.start/dump/stop with the name — attaching to a live process, no restart. 5. jfr summary probe.jfr.`,
hints:['The launch flag is one long -XX option with comma-separated parameters.','jcmd verbs are dotted: JFR.start, JFR.dump, JFR.stop — all take name=.','settings=profile is the higher-detail preset (default is the lower-overhead "default").'],
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
<p><b>Reading a flame graph</b>: y-axis is stack depth, x-axis is <i>proportion of samples</i> — width = time, and the x-order is alphabetical, NOT chronological. Hunt for wide plateaus: a wide frame with no children doing work is your hotspot. The four modes map to the four classic diagnoses: CPU-bound (cpu), memory-churn (alloc), contention (lock), and waiting-on-I/O (wall — where cpu profiles look deceptively idle).</p>`,
docs:[['async-profiler — GitHub','https://github.com/async-profiler/async-profiler'],['Flame graphs — Brendan Gregg','https://www.brendangregg.com/flamegraphs.html']],
ex:{title:'Profiler triage',lang:'text',
prompt:`Answer on the numbered lines: (1) the command for a 30s CPU flame graph of pid 4242 into <code>cpu.html</code>, (2) the event mode that shows what is creating GC pressure, (3) the event mode that catches time spent blocked on I/O that a CPU profile misses, (4) in a flame graph, what the WIDTH of a frame means, (5) true or false: left-to-right order in a flame graph is chronological.`,
starter:`# 1)

# 2)

# 3)

# 4)

# 5)
`,
tests:[{d:'Correct asprof command',re:'asprof\\s+-d\\s+30\\s+-f\\s+cpu\\.html\\s+4242'},{d:'alloc mode for GC pressure',re:'\\balloc\\b','flags':'is'},{d:'wall mode for blocked time',re:'\\bwall\\b','flags':'is'},{d:'Width = share of samples/time',re:'(time|samples)','flags':'is'},{d:'False — alphabetical, not chronological',re:'[Ff]alse'}],
behavior:`1. (1) ./asprof -d 30 -f cpu.html 4242. 2. (2) alloc. 3. (3) wall. 4. (4) the fraction of samples (≈ time) spent in that frame and its children. 5. (5) False — frames are sorted alphabetically; flame graphs show proportion, not sequence.`,
hints:['Flags: -e event, -d duration seconds, -f output file, then the pid.','CPU-idle-but-slow means the time is spent waiting — that is what wall-clock mode reveals.','The most common flame-graph misreading is assuming x = time order. It is not.'],
solution:`# 1)
./asprof -d 30 -f cpu.html 4242

# 2)
alloc

# 3)
wall

# 4)
The proportion of samples (≈ time) spent in that frame and everything it calls — wide = hot.

# 5)
False — frames are ordered alphabetically; the x-axis shows proportion, not chronology.`}}
]});
