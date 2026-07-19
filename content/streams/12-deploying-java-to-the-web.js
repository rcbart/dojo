STREAMS.push({icon:'🚀',title:'Deploying Java to the Web',blurb:'From runnable jar to production: packaging, Docker, configuration & secrets, CI/CD pipelines, and running live.',lessons:[
{id:'dpl1',title:'Packaging: the runnable jar',body:`
<p>A deployable Java app is a single <b>executable jar</b> — code, dependencies, and an embedded server. Spring Boot's build plugin "repackages" your jar so <code>java -jar</code> just works:</p>
<div class="codeSample">./mvnw clean package                # target/app-1.0.0.jar (fat jar via spring-boot-maven-plugin)
./gradlew bootJar                   # Gradle equivalent -&gt; build/libs/

java -jar target/app-1.0.0.jar      # runs anywhere with a JRE
java -Xmx512m -jar app.jar --spring.profiles.active=prod
java --version                      # deploy target must match your build's release!</div>
<p>Know the vocabulary: a <b>plain jar</b> has only your classes; a <b>fat/uber jar</b> bundles all dependencies; a <b>war</b> deploys into an external Tomcat (legacy — prefer the embedded model). Pin the Java version with <code>maven.compiler.release</code> and build reproducibly with the wrapper, never a local mvn.</p>`,
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
<p>Why multi-stage: the final image has no JDK, no source, no Maven cache — smaller and safer. Use JRE base images, tag images with real versions (never only <code>latest</code>), and let the JVM see container limits (modern JVMs auto-detect cgroup memory).</p>`,
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
<p>Secrets never go in the image, git, or plain env listings in CI logs — use a secret manager (Vault, AWS Secrets Manager, k8s Secrets). Expose health for orchestrators: Spring Boot Actuator's <code>/actuator/health</code> (add <code>spring-boot-starter-actuator</code>) — this is what load balancers and Kubernetes probe. In CIAM especially: rotating secrets and separating environments isn't hygiene, it's the job.</p>`,
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
<p>Principles: the pipeline is the only path to production (no laptop deploys); tests gate the build (<code>verify</code>, not <code>package -DskipTests</code>); images are tagged with the commit SHA for perfect traceability; deploy is then "roll the new tag out" — a separate job with environment approvals for prod.</p>`,
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
