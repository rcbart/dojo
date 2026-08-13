STREAMS.push({icon:'🚀',title:'Deploying Java to the Web',blurb:'From runnable jar to production: packaging, Docker, configuration & secrets, CI/CD pipelines, and running live.',lessons:[
{id:'dpl1',title:'Packaging: the runnable jar',body:`
<p>A deployable Java app is a single <b>executable jar</b> — code, dependencies, and an embedded server. Spring Boot's build plugin "repackages" your jar so <code>java -jar</code> just works:</p>
<div class="codeSample">./mvnw clean package                # target/app-1.0.0.jar (fat jar via spring-boot-maven-plugin)
./gradlew bootJar                   # Gradle equivalent -&gt; build/libs/

java -jar target/app-1.0.0.jar      # runs anywhere with a JRE
java -Xmx512m -jar app.jar --spring.profiles.active=prod
java --version                      # deploy target must match your build's release!</div>
<p>Know the vocabulary: a <b>plain jar</b> has only your classes; a <b>fat/uber jar</b> bundles all dependencies; a <b>war</b> deploys into an external Tomcat (legacy — prefer the embedded model). Pin the Java version with <code>maven.compiler.release</code> and build reproducibly with the wrapper, never a local mvn.</p>
<h4>Why the fat jar won</h4>
<p>The older model was a WAR deployed into an application server someone else installed, configured and
patched. That meant the runtime your code ran on was <b>not</b> something your build produced — two
environments could run the same WAR on different Tomcat versions with different JVM flags and behave
differently, and nobody could say why.</p>
<p>Inverting it fixed that. The server becomes a library inside your artifact, so <b>one file contains the
entire runtime contract</b>: your code, your dependencies, and the exact server version you tested
against. It is also what makes containers straightforward — the image is a JRE plus one file — and what
makes "build once, promote the same artifact" achievable rather than aspirational.</p>

<h4>What repackaging actually does</h4>
<p>A fat jar is not just a zip of everything. Java's class loader cannot read a jar nested inside a jar, so
Boot writes a layout with your dependencies kept as intact jars and a small custom loader that knows how
to read them:</p>
<div class="codeSample" data-hl>app.jar
  BOOT-INF/classes/    your compiled code
  BOOT-INF/lib/        every dependency, still a real jar each
  org/springframework/boot/loader/   the launcher
  META-INF/MANIFEST.MF
      Main-Class:       ...JarLauncher      <- what java -jar runs
      Start-Class:      com.acme.App        <- your actual main

// keeping dependency jars whole matters: shading everything into one
// flat class tree breaks signed jars and silently drops duplicated
// resource files - the classic "META-INF/services" merge bug.</div>
<p>The related feature worth knowing is <b>layered jars</b>, which sort the contents by how often they
change (dependencies, then snapshot deps, then your classes). In a Docker build that means a code change
rebuilds only the last, smallest layer instead of shipping 60MB of unchanged libraries every push.</p>

<h4>Versions, and the mistake that gets made once</h4>
<p><code>maven.compiler.release</code> is not the same as <code>source</code>/<code>target</code>: it also
checks that you only call APIs that existed in that release, so compiling on JDK 21 for release 17 fails
fast instead of producing a jar that throws <code>NoSuchMethodError</code> on the older runtime. Set
<code>release</code> and forget the other two.</p>
<p>And a jar built for a newer JDK simply will not load on an older one — <code>UnsupportedClassVersion
Error</code>, at startup, in production. Pin the JDK in your build, in your CI setup step and in your base
image, from the same value.</p>

<h4>Reproducibility</h4>
<p>Use the wrapper (<code>./mvnw</code>, <code>./gradlew</code>) everywhere, including CI. It pins the build
tool version in the repository, so the build does not depend on what happens to be installed on a machine
— which is the same argument as the fat jar, applied one level up.</p>`,
docs:[['Spring Boot executable jars','https://docs.spring.io/spring-boot/specification/executable-jar/index.html'],['spring-boot-maven-plugin','https://docs.spring.io/spring-boot/maven-plugin/index.html']],
ex:{title:'Ship a jar',lang:'shell',
prompt:`One command per numbered line: (1) build the jar with the Maven wrapper, skipping nothing (clean + package), (2) run it with max heap 512 MB and the <code>prod</code> Spring profile active, (3) the Gradle wrapper equivalent of building a Boot jar, (4) print which Java version the server has (sanity check before deploying).`,
starter:`# 1)

# 2)

# 3)

# 4)
`,
tests:[{d:'Wrapper build: ./mvnw clean package',re:'\\./mvnw\\s+clean\\s+package'},{d:'Runs with -Xmx512m and -jar',re:'java\\s+-Xmx512m\\s+-jar'},{d:'Activates the prod profile',re:'--spring\\.profiles\\.active=prod'},{d:'./gradlew bootJar',re:'\\./gradlew\\s+bootJar'},{d:'java --version check',re:'java\\s+--?version'}],
behavior:`1. (1) ./mvnw clean package. 2. (2) java -Xmx512m -jar <path>.jar --spring.profiles.active=prod. 3. (3) ./gradlew bootJar. 4. (4) java --version (or -version).`,
hints:['Always the wrapper: ./mvnw, not mvn — CI and teammates get the identical build tool.','JVM flags go BEFORE -jar; application args (like --spring.profiles.active) go AFTER the jar path.','Gradle Boot builds use the bootJar task.'],
solution:`# 1)
./mvnw clean package

# 2)
java -Xmx512m -jar target/app-1.0.0.jar --spring.profiles.active=prod

# 3)
./gradlew bootJar

# 4)
java --version`}},
{id:'dpl2',title:'Containerize it: Docker for Java',body:`
<p>A container freezes your app + JRE + OS libs into one runnable image. The professional pattern is a <b>multi-stage build</b>: build with a JDK, run on a slim JRE:</p>
<div class="codeSample"># ---- build stage ----
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY . .
RUN ./mvnw clean package -DskipTests

# ---- run stage ----
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]</div>
<div class="codeSample">docker build -t dojo/api:1.0.0 .
docker run -p 8080:8080 dojo/api:1.0.0
docker logs -f &lt;container&gt;</div>
<p>Why multi-stage: the final image has no JDK, no source, no Maven cache — smaller and safer. Use JRE base images, tag images with real versions (never only <code>latest</code>), and let the JVM see container limits (modern JVMs auto-detect cgroup memory).</p>
<h4>What a container is, in one paragraph</h4>
<p>Not a virtual machine. There is no guest kernel and no emulated hardware — a container is a normal Linux
process with a restricted view of the world, assembled from namespaces (its own filesystem, network,
process tree) and cgroups (its share of CPU and memory). That is why it starts in milliseconds and why
the image only needs the userland libraries your app touches, not an operating system in the usual
sense.</p>

<h4>Why multi-stage is the professional default</h4>
<p>Everything present in the final image is attack surface and download size. A single-stage build leaves
the JDK, the compiler, your source code, the Maven cache and any credentials used during the build sitting
in the shipped artifact. Multi-stage discards all of it: only what you explicitly <code>COPY</code>
forward survives.</p>
<div class="codeSample" data-hl># the layer-caching fix that matters more than anything else here:
COPY mvnw pom.xml ./
COPY .mvn .mvn
RUN ./mvnw dependency:go-offline      # cached until pom.xml changes
COPY src ./src                        # source changes invalidate only from here
RUN ./mvnw package -DskipTests

# COPY . . as the first step (as written above) rebuilds EVERY dependency
# on every one-character source edit. correct, and painfully slow.</div>

<h4>The two settings people forget, and their consequences</h4>
<p><b>Do not run as root.</b> Containers share the host kernel, so root inside is closer to root outside
than people assume. One line fixes it — and note that a non-root user cannot bind ports below 1024, which
is why containerised apps listen on 8080.</p>
<div class="codeSample" data-hl>RUN useradd -r -u 1001 app
USER 1001
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "app.jar"]</div>
<p><b>Give the JVM headroom.</b> Modern JVMs read the cgroup limit, but the default heap of ~25% of it is
conservative, while setting <code>-Xmx</code> equal to the container limit gets you OOM-killed — the JVM
also needs metaspace, thread stacks, code cache and direct buffers <i>outside</i> the heap.
<code>MaxRAMPercentage</code> around 75 is the sane default, and the symptom of getting it wrong is exit
code 137 with nothing in the application log, because the kernel killed the process without warning.</p>

<h4>Signals, and why <code>ENTRYPOINT</code> form matters</h4>
<p>The exec form shown runs Java as PID 1, so it receives <code>SIGTERM</code> directly and Spring's
graceful shutdown works. Write it as a shell string instead and a shell becomes PID 1, swallows the
signal, and your container is killed hard after the grace period — dropping every in-flight request on
every deploy.</p>

<h4>Tags and provenance</h4>
<p><code>latest</code> is not a version; it is a mutable pointer, which makes "what is running?"
unanswerable and rollbacks a guess. Tag with the commit SHA (immutable and traceable) and add a
human-readable version alongside. Scan images in CI, rebuild them regularly so base-image CVE fixes
actually reach you, and prefer a slim or distroless base — fewer packages is fewer vulnerabilities to
triage.</p>`,
docs:[['Dockerize a Spring Boot app — spring.io guide','https://spring.io/guides/gs/spring-boot-docker'],['eclipse-temurin images','https://hub.docker.com/_/eclipse-temurin']],
ex:{title:'Write the Dockerfile',lang:'dockerfile',
prompt:`Write a multi-stage Dockerfile: build stage <code>FROM eclipse-temurin:21-jdk AS build</code> that copies the project and runs <code>./mvnw clean package -DskipTests</code>; run stage <code>FROM eclipse-temurin:21-jre</code> that copies the jar from the build stage as <code>app.jar</code>, EXPOSEs 8080, and uses the exec-form <code>ENTRYPOINT</code> to run it.`,
starter:`# build stage


# run stage
`,
tests:[{d:'JDK build stage with alias',re:'FROM\\s+eclipse-temurin:21-jdk\\s+AS\\s+build'},{d:'Builds with the wrapper, skipping tests',re:'RUN\\s+\\./mvnw\\s+clean\\s+package\\s+-DskipTests'},{d:'Slim JRE run stage',re:'FROM\\s+eclipse-temurin:21-jre'},{d:'Copies jar from the build stage',re:'COPY\\s+--from=build\\s+[^\\n]*\\.jar\\s+app\\.jar'},{d:'EXPOSE 8080',re:'EXPOSE\\s+8080'},{d:'Exec-form ENTRYPOINT',re:'ENTRYPOINT\\s+\\[\\s*"java"\\s*,\\s*"-jar"\\s*,\\s*"app\\.jar"\\s*\\]'}],
behavior:`1. Two FROM lines — the image ships only the JRE stage. 2. COPY --from=build pulls target/*.jar into the runtime image as app.jar. 3. ENTRYPOINT is JSON array form (exec form — signals reach the JVM). 4. WORKDIR set in both stages (good practice).`,
hints:['Stage 1: FROM ... AS build, WORKDIR /app, COPY . ., RUN the wrapper build.','Stage 2 copies ONLY the artifact: <code>COPY --from=build /app/target/*.jar app.jar</code>','Exec form matters: <code>ENTRYPOINT ["java", "-jar", "app.jar"]</code> — shell form would swallow SIGTERM and break graceful shutdown.'],
solution:`# build stage
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY . .
RUN ./mvnw clean package -DskipTests

# run stage
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]`}},
{id:'dpl3',title:'Config, secrets & environments',body:`
<p>Twelve-factor rule: <b>config lives in the environment, not in the jar</b>. The same image runs in dev, staging and prod — only the environment differs.</p>
<div class="codeSample"># application.properties (defaults)
server.port=8080
dojo.db.url=jdbc:postgresql://localhost/dojo

# Spring maps env vars automatically (relaxed binding):
# DOJO_DB_URL      -&gt; dojo.db.url
# SERVER_PORT      -&gt; server.port

docker run -p 8080:8080 \\
  -e SPRING_PROFILES_ACTIVE=prod \\
  -e DOJO_DB_URL=jdbc:postgresql://db.internal/dojo \\
  -e DOJO_DB_PASSWORD_FILE=/run/secrets/db_pass \\
  dojo/api:1.0.0</div>
<p>Secrets never go in the image, git, or plain env listings in CI logs — use a secret manager (Vault, AWS Secrets Manager, k8s Secrets). Expose health for orchestrators: Spring Boot Actuator's <code>/actuator/health</code> (add <code>spring-boot-starter-actuator</code>) — this is what load balancers and Kubernetes probe. In CIAM especially: rotating secrets and separating environments isn't hygiene, it's the job.</p>
<h4>The principle, and why it is not just tidiness</h4>
<p>Configuration is everything that differs between deployments of the <i>same</i> code: URLs, credentials,
feature flags, pool sizes. Keeping it out of the artifact is what makes the artifact promotable — the exact
bytes you tested in staging are the bytes that reach production, so "it worked in staging" means
something.</p>
<p>Build a separate image per environment and you have given up that guarantee, plus you now discover
production-only configuration errors in production. The test is simple: <b>could you open-source the
artifact right now without leaking anything?</b> If not, configuration is in the wrong place.</p>

<h4>How Spring resolves it, and why that order matters</h4>
<p>Boot layers property sources and the later ones win, which is what lets a base file carry sensible
defaults while the environment overrides only what it must:</p>
<div class="codeSample" data-hl>command line args          highest
environment variables
application-{profile}.properties
application.properties     lowest

# relaxed binding means these are all the same property:
dojo.db.url  ==  DOJO_DB_URL  ==  dojo_db_url
# so an env var can override anything without matching its exact style</div>
<p>Prefer <b>defaults that fail</b> over defaults that work locally. A missing production database URL
should stop the application at startup, not silently connect to <code>localhost</code> and appear healthy
while serving an empty database. Mark required properties as such and let the app refuse to boot.</p>

<h4>Secrets are a different class of thing</h4>
<p>They need more than "not in the image": they need rotation, an audit trail, and revocation. Environment
variables are the common baseline and they leak in ways people underestimate — they appear in
<code>/proc</code>, in crash dumps, in <code>docker inspect</code>, in any child process, and in the
Actuator <code>env</code> endpoint if you exposed it.</p>
<div class="codeSample" data-hl>hardcoded / committed   -> assume permanently compromised. rotate, do not
                           just delete the commit: git history is forever.
env var                 -> baseline. fine for many things.
mounted file            -> better: not in the process env, can be rotated
                           by updating the file  (hence _FILE conventions)
secret manager at boot  -> access-controlled, audited, revocable
dynamic credentials     -> minted per workload, expire in minutes.
                           nothing long-lived exists to steal.</div>
<p>And when one does leak: <b>rotate first, investigate second</b>. The investigation takes days; the
exposure should not.</p>

<h4>Health endpoints are configuration too</h4>
<p>Expose <code>liveness</code> and <code>readiness</code> separately and wire them to the right probes —
liveness must not check the database, or one brief outage restarts every instance simultaneously and turns
a blip into an incident. Keep management endpoints on a port your cluster can reach and the internet
cannot, and never expose <code>env</code>, <code>heapdump</code> or <code>loggers</code> publicly.</p>`,
docs:[['The Twelve-Factor App — Config','https://12factor.net/config'],['Spring Boot Actuator','https://docs.spring.io/spring-boot/reference/actuator/index.html']],
ex:{title:'Environment drill',lang:'shell',
prompt:`(1) Write the <code>docker run</code> command: image <code>dojo/api:1.2.0</code>, publish port 8080, set env vars <code>SPRING_PROFILES_ACTIVE=prod</code> and <code>DOJO_API_KEY=abc123</code>, run detached (<code>-d</code>). (2) On the next numbered line, the env var name Spring maps to the property <code>dojo.rate.limit</code>. (3) The actuator endpoint path a load balancer should probe. (4) One line stating where the API key should REALLY come from in production (mention a secret manager).`,
starter:`# 1)

# 2)

# 3)

# 4)
`,
tests:[{d:'docker run with -d and port mapping',re:'docker\\s+run[^\\n]*-d[^\\n]*-p\\s*8080:8080|docker\\s+run[^\\n]*-p\\s*8080:8080[^\\n]*-d'},{d:'Both -e env vars set',re:'-e\\s+SPRING_PROFILES_ACTIVE=prod[\\s\\S]*-e\\s+DOJO_API_KEY=abc123'},{d:'Relaxed binding: DOJO_RATE_LIMIT',re:'DOJO_RATE_LIMIT'},{d:'/actuator/health probe path',re:'/actuator/health'},{d:'Names a secret manager',re:'(Vault|Secrets Manager|secret manager|k8s Secret|Kubernetes Secret)','flags':'is'}],
behavior:`1. (1) docker run -d -p 8080:8080 -e SPRING_PROFILES_ACTIVE=prod -e DOJO_API_KEY=abc123 dojo/api:1.2.0 (flag order flexible, image last). 2. (2) DOJO_RATE_LIMIT — dots become underscores, uppercase. 3. (3) /actuator/health. 4. (4) mentions a secret manager (Vault / AWS Secrets Manager / k8s Secrets), not env vars in a repo.`,
hints:['Relaxed binding: lowercase dots -> UPPERCASE_UNDERSCORES.','Health endpoint ships with spring-boot-starter-actuator at /actuator/health.','The -e values here are for the drill; the point of (4) is that production keys come from a secret store at runtime.'],
solution:`# 1)
docker run -d -p 8080:8080 -e SPRING_PROFILES_ACTIVE=prod -e DOJO_API_KEY=abc123 dojo/api:1.2.0

# 2)
DOJO_RATE_LIMIT

# 3)
/actuator/health

# 4)
In production the key is injected at runtime from a secret manager (e.g. Vault or AWS Secrets Manager), never hardcoded or committed.`}},
{id:'dpl4',title:'CI/CD: build, test, ship on every push',body:`
<p>A pipeline turns "works on my machine" into "shipped": every push builds, tests, packages, and publishes an image. GitHub Actions example:</p>
<div class="codeSample">name: ci
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: '21'
          cache: maven
      - run: ./mvnw clean verify          # build + unit + integration tests
      - run: docker build -t ghcr.io/acme/api:$${'{'}{ github.sha }} .
      - run: docker push ghcr.io/acme/api:$${'{'}{ github.sha }}</div>
<p>Principles: the pipeline is the only path to production (no laptop deploys); tests gate the build (<code>verify</code>, not <code>package -DskipTests</code>); images are tagged with the commit SHA for perfect traceability; deploy is then "roll the new tag out" — a separate job with environment approvals for prod.</p>
<h4>What a pipeline is really buying you</h4>
<p>Not automation for its own sake. Three specific properties: <b>every change goes through the same
process</b>, so quality is not a function of who deployed; <b>the process is fast enough that people run
it constantly</b>, so problems surface while the change is small and the author remembers it; and
<b>there is a record</b> of what was built from what, by whom, and what happened.</p>
<p>The corollary is that the pipeline must be the <i>only</i> path to production. One person with
credentials and a laptop deploy undoes all three properties at once — the running system no longer
corresponds to any commit, and the next person to deploy silently reverts it.</p>

<h4>The distinction people blur</h4>
<div class="codeSample" data-hl>CI   every push is built and tested against MAIN, continuously.
     the point is fast feedback on integration - not "we have a build job".
     if branches live for a week, you are not doing CI regardless of tooling.

CDelivery    every green build is RELEASABLE. deploying is a decision.
CDeployment  every green build IS deployed, automatically. no decision.

// most teams want continuous DELIVERY and an explicit approval for prod.
// that is a legitimate choice, not a failure to reach deployment.</div>

<h4>Making the pipeline trustworthy</h4>
<p>A pipeline people ignore is worse than none, because it produces green checkmarks that mean nothing. Two
things destroy trust: <b>flaky tests</b> and <b>slow feedback</b>. Quarantine a flaky test the day it
appears rather than letting the team learn to re-run failures — one tolerated flake teaches everyone that
red does not mean broken. And keep the fast checks first so a compile error fails in ninety seconds, not
after a twenty-minute integration suite.</p>
<p><code>verify</code> rather than <code>package -DskipTests</code> is the same argument in miniature: a
pipeline that skips the tests is a build script.</p>

<h4>Build once, promote the artifact</h4>
<p>The image built from a commit is the image that goes to staging and then to production — never rebuilt
per environment, because a rebuild is a different artifact and the staging result no longer applies.
Tagging with the commit SHA is what makes that traceable: given a running container you can name the exact
source, and given a bad commit you can find every environment carrying it.</p>

<h4>Securing the thing that can deploy anything</h4>
<p>A CI system holds credentials for your registry and your production cluster, and it runs code from every
pull request. Treat it accordingly: pin actions to a commit SHA rather than a moving tag, scope tokens to
the minimum and prefer short-lived OIDC federation over stored registry passwords, do not expose secrets to
workflows triggered by forks, and require review on the workflow files themselves — a pull request that
edits the pipeline is a pull request that can exfiltrate every secret it has.</p>`,
docs:[['GitHub Actions — Java with Maven','https://docs.github.com/en/actions/use-cases-and-examples/building-and-testing/building-and-testing-java-with-maven'],['setup-java action','https://github.com/actions/setup-java']],
ex:{title:'Write the workflow',lang:'yaml',
prompt:`Write a GitHub Actions workflow: name <code>ci</code>, triggered on push to <code>main</code>, one job <code>build</code> on <code>ubuntu-latest</code> with steps: checkout (<code>actions/checkout@v4</code>), <code>actions/setup-java@v4</code> with temurin 21 and maven cache, then <code>./mvnw clean verify</code>, then a docker build step tagging <code>api:test</code> (plain tag is fine for this drill).`,
starter:`name: ci
# trigger

jobs:
  build:
    # runner + steps
`,
tests:[{d:'Triggers on push to main',re:'on:[\\s\\S]*push:[\\s\\S]*branches:[^\\n]*main'},{d:'Runs on ubuntu-latest',re:'runs-on:\\s*ubuntu-latest'},{d:'Checkout v4',re:'uses:\\s*actions/checkout@v4'},{d:'setup-java v4, temurin 21, maven cache',re:'setup-java@v4[\\s\\S]*temurin[\\s\\S]*21[\\s\\S]*cache:\\s*maven'},{d:'Tests gate the build (verify)',re:'\\./mvnw\\s+clean\\s+verify'},{d:'Docker build step',re:'docker\\s+build\\s+-t\\s+api:test'}],
behavior:`1. Valid YAML shape: on.push.branches includes main; jobs.build.runs-on ubuntu-latest; steps in order checkout -> setup-java -> mvnw verify -> docker build. 2. setup-java's with-block has distribution: temurin, java-version: '21', cache: maven. 3. Uses verify (tests run), not -DskipTests.`,
hints:['Trigger block:\non:\n  push:\n    branches: [main]','setup-java needs a with: block — distribution, java-version, cache.','Steps are a YAML list: each - uses: or - run: entry, indented under steps:.'],
solution:`name: ci
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: '21'
          cache: maven
      - run: ./mvnw clean verify
      - run: docker build -t api:test .`}},
{id:'dpl5',title:'Running in production: k8s, probes & zero-downtime',body:`
<p>Where the image actually runs, in ascending order of machinery: a <b>PaaS</b> (Railway, Render, Elastic Beanstalk — push image, get URL), a <b>VM + reverse proxy</b> (nginx/Caddy terminating TLS in front of your jar), or <b>Kubernetes</b> — the enterprise default:</p>
<div class="codeSample">apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 3                      # horizontal scaling
  selector: { matchLabels: { app: api } }
  template:
    metadata: { labels: { app: api } }
    spec:
      containers:
        - name: api
          image: ghcr.io/acme/api:2f9c1e7
          ports: [{ containerPort: 8080 }]
          readinessProbe:          # traffic only when ready
            httpGet: { path: /actuator/health, port: 8080 }
          livenessProbe:           # restart if wedged
            httpGet: { path: /actuator/health, port: 8080 }</div>
<p><b>Readiness</b> gates traffic, <b>liveness</b> restarts wedged pods — that plus a rolling update strategy is zero-downtime deployment: new pods come up, pass readiness, old pods drain. Round it out with structured JSON logs to stdout, metrics (Micrometer → Prometheus), and graceful shutdown (<code>server.shutdown=graceful</code>) so in-flight auth requests finish before a pod dies — in CIAM, that last one is client-visible.</p>`,
docs:[['Kubernetes Deployments','https://kubernetes.io/docs/concepts/workloads/controllers/deployment/'],['Liveness & readiness probes','https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/'],['Spring Boot graceful shutdown','https://docs.spring.io/spring-boot/reference/web/graceful-shutdown.html']],
ex:{title:'Deploy manifest',lang:'yaml',
prompt:`Write a minimal Kubernetes Deployment: name <code>api</code>, <code>replicas: 3</code>, container image <code>dojo/api:1.0.0</code>, <code>containerPort: 8080</code>, and BOTH a <code>readinessProbe</code> and <code>livenessProbe</code> doing an <code>httpGet</code> against <code>/actuator/health</code> on port 8080. (Selector/labels: app: api.)`,
starter:`apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  # replicas, selector, template with container + probes
`,
tests:[{d:'kind: Deployment',re:'kind:\\s*Deployment'},{d:'replicas: 3',re:'replicas:\\s*3'},{d:'The pinned image',re:'image:\\s*dojo/api:1\\.0\\.0'},{d:'containerPort 8080',re:'containerPort:\\s*8080'},{d:'readinessProbe with httpGet on /actuator/health',re:'readinessProbe:[\\s\\S]*?/actuator/health'},{d:'livenessProbe too',re:'livenessProbe:[\\s\\S]*?/actuator/health'}],
behavior:`1. selector.matchLabels app: api matches template labels. 2. Both probes httpGet /actuator/health port 8080. 3. Image tag pinned (1.0.0), not latest. 4. Valid YAML nesting: spec.template.spec.containers is a list.`,
hints:['Skeleton after metadata: spec -> replicas, selector.matchLabels, template.metadata.labels, template.spec.containers.','Each probe: <code>httpGet: { path: /actuator/health, port: 8080 }</code> (inline map form is valid YAML).','Readiness = "may I send traffic?", liveness = "should I restart you?" — you want both, and they can share the endpoint for this drill.'],
solution:`apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
        - name: api
          image: dojo/api:1.0.0
          ports:
            - containerPort: 8080
          readinessProbe:
            httpGet:
              path: /actuator/health
              port: 8080
          livenessProbe:
            httpGet:
              path: /actuator/health
              port: 8080`}},
{id:'log1',title:'Logging: SLF4J, Logback & MDC',body:`
<p>Production Java logs through a <b>facade</b>: your code talks to <b>SLF4J</b> (<code>org.slf4j.Logger</code>), and an implementation — usually <b>Logback</b> (Spring Boot's default) or Log4j2 — does the writing. Libraries must only ever depend on the facade; the application picks the backend.</p>
<ul>
<li><b>The idiom</b>: one logger per class — <code>private static final Logger log = LoggerFactory.getLogger(CheckoutService.class);</code></li>
<li><b>Parameterized, never concatenated</b>: <code>log.debug("order {} for {}", id, user)</code>. With concatenation the string is built <i>even when DEBUG is off</i>; with <code>{}</code> placeholders, formatting only happens if the level is enabled.</li>
<li><b>Levels</b>: <code>ERROR</code> = someone should be paged; <code>WARN</code> = suspicious but handled; <code>INFO</code> = business events (order placed); <code>DEBUG</code> = developer detail; <code>TRACE</code> = firehose. Exceptions go in as the <i>last argument</i>, no placeholder: <code>log.error("payment failed for {}", orderId, e)</code> — that prints the stack trace.</li>
<li><b>MDC</b> (Mapped Diagnostic Context): a per-thread map merged into every log line — put the request id / trace id in once, and every log from that request carries it. Always clean up in <code>finally</code>, or thread pools leak context between requests.</li>
<li><b>In production</b>: log JSON (one object per line) so the aggregator — ELK, Loki, Datadog — can index fields instead of grepping prose. And never log secrets, tokens or full card numbers.</li>
</ul>
<div class="codeSample">private static final Logger log = LoggerFactory.getLogger(CheckoutService.class);

MDC.put("orderId", orderId);
try {
    log.info("checkout started for user {}", userId);
    // ... every log line in here automatically carries orderId ...
} catch (PaymentException e) {
    log.error("payment failed", e);          // exception last, full stack trace
} finally {
    MDC.remove("orderId");                   // pooled threads: always clean up
}</div>`,
docs:[['SLF4J manual','https://www.slf4j.org/manual.html'],['Logback configuration','https://logback.qos.ch/manual/configuration.html'],['MDC — Logback manual','https://logback.qos.ch/manual/mdc.html']],
ex:{title:'Instrument a checkout',
prompt:`Write <code>CheckoutService</code> with the standard logger idiom and a method <code>void checkout(String orderId, String userId)</code> that: (1) puts <code>orderId</code> into the <b>MDC</b>, (2) logs at INFO with <b>two {} placeholders</b>: <code>"checkout started: order {} user {}"</code>, (3) calls <code>charge()</code> (given) in a try, logging failures with <code>log.error("charge failed", e)</code> — exception as last argument, (4) removes the MDC key in <code>finally</code>. No string concatenation inside any log call.`,
starter:`import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;

public class CheckoutService {
    // 1. the one-per-class logger

    void checkout(String orderId, String userId) {
        // 2. MDC.put, INFO with {} {}, try/catch/finally, MDC.remove
    }

    void charge() throws Exception { /* provided */ }
}`,
tests:[{d:'Logger via LoggerFactory.getLogger(Class)',re:'LoggerFactory\\.getLogger\\s*\\(\\s*CheckoutService\\.class\\s*\\)'},{d:'private static final Logger',re:'private\\s+static\\s+final\\s+Logger'},{d:'Parameterized INFO with two placeholders',re:'log\\.info\\s*\\(\\s*"checkout started: order \\{\\} user \\{\\}"\\s*,\\s*orderId\\s*,\\s*userId'},{d:'MDC.put with the order id',re:'MDC\\.put\\s*\\(\\s*"orderId"\\s*,\\s*orderId\\s*\\)'},{d:'Exception logged as last argument',re:'log\\.error\\s*\\(\\s*"charge failed"\\s*,\\s*e\\s*\\)'},{d:'MDC cleaned up in finally',re:'finally\\s*\\{[^}]*MDC\\.remove\\s*\\(\\s*"orderId"\\s*\\)'},{d:'No concatenation inside log calls',re:'log\\.\\w+\\s*\\(\\s*"[^"]*"\\s*\\+',not:true}],
behavior:`1. checkout("o-1","u-9") logs exactly one INFO line with both values substituted into the placeholders. 2. While inside checkout, MDC contains orderId=o-1; after checkout returns (success or failure), the key is gone. 3. If charge() throws, an ERROR line with the full stack trace is emitted and the exception does not escape uncaught cleanup. 4. No log call builds its message with +.`,
hints:['The logger line is boilerplate worth memorizing: <code>private static final Logger log = LoggerFactory.getLogger(CheckoutService.class);</code>','Shape: <code>MDC.put("orderId", orderId); try { log.info("checkout started: order {} user {}", orderId, userId); charge(); } catch (Exception e) { log.error("charge failed", e); } finally { MDC.remove("orderId"); }</code>','log.error takes the exception as a bare last argument — no {} for it. That is what triggers stack-trace printing.'],
solution:`import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;

public class CheckoutService {
    private static final Logger log = LoggerFactory.getLogger(CheckoutService.class);

    void checkout(String orderId, String userId) {
        MDC.put("orderId", orderId);
        try {
            log.info("checkout started: order {} user {}", orderId, userId);
            charge();
        } catch (Exception e) {
            log.error("charge failed", e);
        } finally {
            MDC.remove("orderId");
        }
    }

    void charge() throws Exception { /* provided */ }
}`}},
]});
