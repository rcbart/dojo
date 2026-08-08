STREAMS.push({icon:'🏗️',project:true,title:'Real-World Projects',blurb:'Four end-to-end, multi-file builds — from empty repo to a URL you can send your friends. No belt credit; these are for the résumé, not the rank.',lessons:[
{id:'prj1',title:'Project: Shorty — a URL shortener',body:`
<p><b>What you build</b>: a production-style URL shortener. POST a long URL, get back <code>https://yourdomain/r/aB3x9</code>; opening it 301-redirects and counts the click. Small enough to finish, real enough to contain a database, migrations, Docker, and a deploy.</p>
<p><b>You will practice</b>: Spring Boot REST, JPA + Flyway, base62 encoding, HTTP redirects done right, Docker multi-stage builds, and your first real deploy. Prereqs: Fundamentals, Spring Boot and Deploying streams.</p>
<p><b>Step 1 — generate the project.</b> One curl against start.spring.io:</p>
<div class="codeSample">curl https://start.spring.io/starter.tgz \\
  -d type=maven-project -d javaVersion=21 -d groupId=dev.shorty -d artifactId=shorty \\
  -d dependencies=web,data-jpa,postgresql,flyway,validation | tar -xzvf -
cd shorty && git init && git add . && git commit -m "skeleton"</div>
<p><b>Step 2 — the database.</b> <code>compose.yaml</code> in the project root, then the first migration at <code>src/main/resources/db/migration/V1__links.sql</code>:</p>
<div class="codeSample"># compose.yaml
services:
  db:
    image: postgres:17
    environment: { POSTGRES_DB: shorty, POSTGRES_USER: shorty, POSTGRES_PASSWORD: local }
    ports: ["5432:5432"]

-- V1__links.sql
CREATE TABLE links (
  id         BIGSERIAL PRIMARY KEY,
  slug       VARCHAR(16) NOT NULL UNIQUE,
  target     TEXT        NOT NULL,
  clicks     BIGINT      NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_links_slug ON links(slug);</div>
<p>Point <code>application.yaml</code> at it (url <code>jdbc:postgresql://localhost:5432/shorty</code>, user/pass from env with local defaults — the pattern from the Deploying stream).</p>
<p><b>Step 3 — entity and repository.</b> <code>Link.java</code> (@Entity on the links table: id @GeneratedValue, slug, target, clicks) and <code>LinkRepository extends JpaRepository&lt;Link, Long&gt;</code> with <code>Optional&lt;Link&gt; findBySlug(String slug)</code>. Multi-file starts here: one class per file, real packages (<code>dev.shorty.link</code>).</p>
<p><b>Step 4 — the service (Exercise 1).</b> <code>ShortenService</code> turns a target URL into a stored Link with a random base62 slug, validating the URL first. Write it in the exercise tab — then drop your solution into the project.</p>
<p><b>Step 5 — the API (Exercise 2).</b> <code>LinkController</code>: <code>POST /api/links</code> body <code>{"url": "https://..."}</code> → 201 with <code>{"slug": "...", "target": "..."}</code>; <code>GET /r/{slug}</code> → <b>301 with a Location header</b> and a click increment; unknown slug → 404. The redirect status matters: 301 lets browsers cache the hop; use 302 while debugging, 301 when it works.</p>
<p><b>Step 6 — prove it.</b></p>
<div class="codeSample">docker compose up -d && ./mvnw spring-boot:run
curl -s -X POST localhost:8080/api/links -H 'Content-Type: application/json' -d '{"url": "https://en.wikipedia.org/wiki/URL_shortening"}'
curl -i localhost:8080/r/&lt;slug-from-above&gt;      # expect HTTP/1.1 301 + Location
psql postgresql://shorty:local@localhost/shorty -c 'select slug, clicks from links'</div>
<p><b>Step 7 — containerize (Exercise 3).</b> The multi-stage Dockerfile: Maven+JDK builds the jar, a JRE-only image runs it as a non-root user.</p>
<p><b>Step 8 — DEPLOY. The playbook (referenced by every later project).</b> Pick a lane:</p>
<ul>
<li><b>Option A — Hetzner VPS (most learning, ~€5/mo)</b>: create a CX22 (Ubuntu 24.04, your SSH key), <code>curl -fsSL https://get.docker.com | sh</code>, copy a production <code>compose.yaml</code> (your image from GHCR + postgres + caddy), point a DNS A-record at the IP, and a 2-line Caddyfile gives you automatic HTTPS: <code>shorty.yourdomain.dev { reverse_proxy app:8080 }</code>. Push-to-deploy comes free once you add the CI workflow from the CI/CD stream (build image → ssh <code>docker compose pull && up -d</code>).</li>
<li><b>Option B — Fly.io (fastest to live)</b>: <code>fly launch</code> detects the Dockerfile and writes <code>fly.toml</code>; <code>fly postgres create && fly postgres attach</code> injects <code>DATABASE_URL</code> (map it to the Spring vars); <code>fly deploy</code> ships; <code>fly certs add</code> for your domain. Free-ish for toys, zero server admin.</li>
<li><b>Option C — Render (zero CLI)</b>: push to GitHub → New Web Service → pick the repo (it reads the Dockerfile) → add a managed Postgres → set the env vars in the dashboard → every push auto-deploys. Easiest, least transferable.</li>
</ul>
<p><b>Done when</b> a slug you created redirects on a public URL over HTTPS from your phone, and the click count grows. Extensions when hungry: custom slugs, expiry dates, a QR endpoint, per-slug stats JSON.</p>`,
docs:[['Spring Initializr','https://start.spring.io'],['HTTP 301 vs 302 — MDN','https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/301'],['Fly.io Java guide','https://fly.io/docs/languages-and-frameworks/java/'],['Caddy reverse proxy','https://caddyserver.com/docs/quick-starts/reverse-proxy']],
exs:[
{title:'The shorten service',
prompt:`Write <code>ShortenService</code> (plain class, constructor-injected <code>LinkRepository repo</code> into a private final field): method <code>Link shorten(String url)</code> that (1) <b>validates</b> the url starts with <code>http://</code> or <code>https://</code>, else throws <code>IllegalArgumentException</code>; (2) generates a <b>6-char base62 slug</b> with a private method <code>randomSlug()</code>: pick 6 random chars from the constant <code>"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"</code> using <code>java.security.SecureRandom</code>; (3) retries while <code>repo.findBySlug(slug)</code> is present (collision loop); (4) saves and returns <code>repo.save(new Link(slug, url))</code>.`,
starter:`import java.security.SecureRandom;
import java.util.Optional;

public class ShortenService {

    private static final String ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    // your code
}`,
solution:`import java.security.SecureRandom;
import java.util.Optional;

public class ShortenService {

    private static final String ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    private final LinkRepository repo;
    private final SecureRandom random = new SecureRandom();

    public ShortenService(LinkRepository repo) {
        this.repo = repo;
    }

    public Link shorten(String url) {
        if (url == null || !(url.startsWith("http://") || url.startsWith("https://"))) {
            throw new IllegalArgumentException("url must start with http:// or https://");
        }
        String slug = randomSlug();
        while (repo.findBySlug(slug).isPresent()) {
            slug = randomSlug();
        }
        return repo.save(new Link(slug, url));
    }

    private String randomSlug() {
        StringBuilder sb = new StringBuilder(6);
        for (int i = 0; i < 6; i++) {
            sb.append(ALPHABET.charAt(random.nextInt(ALPHABET.length())));
        }
        return sb.toString();
    }
}`,
tests:[{d:'Repository constructor-injected into a final field',re:'private\\s+final\\s+LinkRepository\\s+repo[\\s\\S]*?ShortenService\\s*\\(\\s*LinkRepository'},{d:'Rejects non-http(s) urls with IllegalArgumentException',re:'startsWith\\s*\\(\\s*"https?://"\\s*\\)[\\s\\S]*?IllegalArgumentException|IllegalArgumentException[\\s\\S]*?startsWith'},{d:'SecureRandom, not Math.random or Random',re:'SecureRandom'},{d:'Math.random / java.util.Random not used',re:'Math\\.random|new\\s+Random\\s*\\(',not:true},{d:'Collision loop consults findBySlug',re:'while\\s*\\([\\s\\S]*?findBySlug[\\s\\S]*?isPresent'},{d:'Saves and returns via the repository',re:'return\\s+repo\\.save\\s*\\(\\s*new\\s+Link'}],
behavior:`1. shorten("https://example.com") returns a saved Link whose slug is 6 chars from the base62 alphabet. 2. shorten("ftp://x") and shorten(null) throw IllegalArgumentException. 3. If the generated slug already exists, a new one is drawn until free — the unique index on slug is the last line of defense, this loop is the first. 4. SecureRandom makes slugs unguessable; java.util.Random is predictable enough to enumerate.`,
hints:['The validation guard reads: if (url == null || !(url.startsWith("http://") || url.startsWith("https://"))) throw ...','randomSlug: loop 6 times appending ALPHABET.charAt(random.nextInt(ALPHABET.length())).','The collision loop is while (repo.findBySlug(slug).isPresent()) slug = randomSlug(); — rare, but "rare" times a million links is "weekly".']},
{title:'The redirect controller',
prompt:`Write <code>LinkController</code>: <code>@RestController</code> with constructor-injected <code>ShortenService service</code> and <code>LinkRepository repo</code> (final fields). Endpoints: (1) <code>@PostMapping("/api/links")</code> taking <code>@RequestBody CreateLink body</code> (record <code>CreateLink(String url)</code> — declare it in the file), calling the service and returning the Link with status <b>201</b> via <code>@ResponseStatus(HttpStatus.CREATED)</code>. (2) <code>@GetMapping("/r/{slug}")</code> returning <code>ResponseEntity&lt;Void&gt;</code>: look up by slug; if present, <b>increment clicks and save</b>, then return status <b>301 MOVED_PERMANENTLY</b> with the <code>Location</code> header set to the target; if absent return <code>ResponseEntity.notFound().build()</code>.`,
starter:`import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class LinkController {

    record CreateLink(String url) {}

    // your code
}`,
solution:`import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class LinkController {

    record CreateLink(String url) {}

    private final ShortenService service;
    private final LinkRepository repo;

    public LinkController(ShortenService service, LinkRepository repo) {
        this.service = service;
        this.repo = repo;
    }

    @PostMapping("/api/links")
    @ResponseStatus(HttpStatus.CREATED)
    public Link create(@RequestBody CreateLink body) {
        return service.shorten(body.url());
    }

    @GetMapping("/r/{slug}")
    public ResponseEntity<Void> redirect(@PathVariable String slug) {
        return repo.findBySlug(slug)
            .map(link -> {
                link.setClicks(link.getClicks() + 1);
                repo.save(link);
                return ResponseEntity.status(HttpStatus.MOVED_PERMANENTLY)
                    .header("Location", link.getTarget())
                    .<Void>build();
            })
            .orElse(ResponseEntity.notFound().build());
    }
}`,
tests:[{d:'POST /api/links returns 201',re:'@PostMapping\\s*\\(\\s*"/api/links"\\s*\\)[\\s\\S]*?@ResponseStatus\\s*\\(\\s*HttpStatus\\.CREATED\\s*\\)|@ResponseStatus\\s*\\(\\s*HttpStatus\\.CREATED\\s*\\)[\\s\\S]*?@PostMapping'},{d:'Body bound via @RequestBody record',re:'@RequestBody\\s+CreateLink'},{d:'GET /r/{slug} with @PathVariable',re:'@GetMapping\\s*\\(\\s*"/r/\\{slug\\}"\\s*\\)[\\s\\S]*?@PathVariable'},{d:'301 MOVED_PERMANENTLY with Location header',re:'MOVED_PERMANENTLY[\\s\\S]*?header\\s*\\(\\s*"Location"'},{d:'Click count incremented before redirecting',re:'getClicks\\s*\\(\\s*\\)\\s*\\+\\s*1'},{d:'Unknown slug → 404 via notFound()',re:'notFound\\s*\\(\\s*\\)\\s*\\.build'}],
behavior:`1. POST /api/links {"url": "https://x.dev"} → 201 and the JSON of the saved Link (slug included). 2. GET /r/<that-slug> → 301, Location: https://x.dev, and the row's clicks goes from 0 to 1. 3. GET /r/nope → 404 with an empty body. 4. Browsers follow the Location header automatically — curl -i shows the raw mechanics.`,
hints:['Two annotations on create: @PostMapping for the route, @ResponseStatus(HttpStatus.CREATED) for the 201.','The redirect is ResponseEntity.status(HttpStatus.MOVED_PERMANENTLY).header("Location", target).build() — no body needed.','Optional.map/orElse handles both branches without an if: map the present case to the 301, orElse the notFound().build().']},
{title:'The production Dockerfile',lang:'dockerfile',
prompt:`Write the multi-stage Dockerfile: <b>build stage</b> — <code>FROM maven:3.9-eclipse-temurin-21 AS build</code>, workdir <code>/app</code>, copy <code>pom.xml</code> alone and run <code>mvn -q dependency:go-offline</code> (layer caching: dependencies re-download only when the pom changes), then copy <code>src</code> and run <code>mvn -q -DskipTests package</code>. <b>Run stage</b> — <code>FROM eclipse-temurin:21-jre</code>, create a non-root user with <code>RUN useradd -r app</code> and switch to it with <code>USER app</code>, copy the jar from the build stage to <code>/app.jar</code>, <code>EXPOSE 8080</code>, and an exec-form <code>ENTRYPOINT</code> running it.`,
starter:`# build stage

# run stage
`,
solution:`FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -q dependency:go-offline
COPY src src
RUN mvn -q -DskipTests package

FROM eclipse-temurin:21-jre
RUN useradd -r app
USER app
COPY --from=build /app/target/*.jar /app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
`,
tests:[{d:'Named build stage on the Maven+JDK image',re:'FROM\\s+maven:3\\.9-eclipse-temurin-21\\s+AS\\s+build'},{d:'pom copied alone before go-offline (layer caching)',re:'COPY\\s+pom\\.xml\\s+\\.[\\s\\S]*?dependency:go-offline[\\s\\S]*?COPY\\s+src'},{d:'Run stage is JRE-only',re:'FROM\\s+eclipse-temurin:21-jre'},{d:'Non-root user created and used',re:'useradd\\s+-r\\s+app[\\s\\S]*?USER\\s+app'},{d:'Jar copied from the build stage',re:'COPY\\s+--from=build\\s+/app/target/\\*\\.jar\\s+/app\\.jar'},{d:'Exec-form ENTRYPOINT (JSON array)',re:'ENTRYPOINT\\s+\\["java",\\s*"-jar",\\s*"/app\\.jar"\\]'}],
behavior:`1. docker build produces an image around 300-400 MB (JRE), not 800+ (full Maven+JDK) — the build stage is discarded. 2. Editing only src and rebuilding skips the dependency download layer entirely. 3. docker inspect shows the process runs as app, not root — a container escape lands in an unprivileged account. 4. Exec-form ENTRYPOINT makes java PID 1 so SIGTERM reaches it and Spring shuts down gracefully.`,
hints:['Two FROM lines = two stages; only the last one ships.','The caching trick is strictly: COPY pom.xml → go-offline → COPY src → package. Order IS the feature.','Exec form is the JSON-array form: ENTRYPOINT ["java", "-jar", "/app.jar"] — shell form wraps it in /bin/sh and eats signals.']}
]},

{id:'prj2',title:'Project: Ledgerly — an expense tracker API',body:`
<p><b>What you build</b>: a multi-user expense-tracking REST API with registration, JWT login, per-user data isolation, validation, real tests, and CI that blocks broken merges. This is the "professional practices" project — its skills transfer to nearly every backend job.</p>
<p><b>You will practice</b>: Spring Security's filter chain, JWT issuance and validation, BCrypt, ownership checks (the #1 real-world authz bug), Bean Validation, MockMvc tests, GitHub Actions. Prereqs: project 1, Spring Boot, Security & Crypto, CI/CD streams.</p>
<p><b>Step 1 — skeleton.</b> start.spring.io as before with <code>web,data-jpa,postgresql,flyway,validation,security</code> plus jjwt (io.jsonwebtoken jjwt-api/impl/jackson 0.12.x) in the pom. Compose file with Postgres — same recipe as Shorty.</p>
<p><b>Step 2 — schema.</b> <code>V1__users.sql</code> and <code>V2__expenses.sql</code>:</p>
<div class="codeSample">CREATE TABLE users (
  id            BIGSERIAL PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE expenses (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT NOT NULL REFERENCES users(id),
  amount_cents BIGINT NOT NULL CHECK (amount_cents &gt; 0),
  category    VARCHAR(40) NOT NULL,
  note        TEXT,
  spent_on    DATE NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_expenses_user ON expenses(user_id, spent_on);</div>
<p><b>Step 3 — auth.</b> Three pieces, each its own file: <code>AuthController</code> (register: validate email + password ≥ 10 chars, BCrypt-hash, insert, 201; login: verify, mint a JWT — HS256, subject = user id, 7-day expiry, secret from <code>JWT_SECRET</code> env); <code>JwtFilter</code> (a OncePerRequestFilter reading <code>Authorization: Bearer</code>, validating, populating the SecurityContext); and <code>SecurityConfig</code> — <b>Exercise 1</b>.</p>
<p><b>Step 4 — the domain (Exercise 2).</b> <code>Expense</code> entity + repository with <code>findByUserId</code>/<code>findByIdAndUserId</code>, a record DTO with validation annotations (<code>@Positive</code> amountCents, <code>@NotBlank</code> category, <code>@PastOrPresent</code> spentOn), and <code>ExpenseController</code> where <b>every query is scoped to the authenticated user id</b>. The failure mode this prevents has a name — IDOR, insecure direct object reference: <code>GET /api/expenses/17</code> must 404 when expense 17 is someone else's, and the clean way is <code>findByIdAndUserId</code> so other users' rows are simply invisible.</p>
<p><b>Step 5 — tests.</b> <code>ExpenseControllerTest</code> with MockMvc: anonymous request → 401; created-then-fetched roundtrip → 200 with the right JSON; fetching another user's expense id → 404. If you only ever write three tests in a project, write these three.</p>
<p><b>Step 6 — CI (Exercise 3).</b> The workflow that runs the suite on every push and PR — with a Postgres <b>service container</b>, because your tests hit a real database, not H2 make-believe.</p>
<p><b>Step 7 — deploy.</b> Playbook from Project 1 (Hetzner / Fly / Render), two deltas: set <code>JWT_SECRET</code> (generate with <code>openssl rand -base64 32</code>; secret manager or platform secrets, never the compose file) and run migrations on boot (Flyway already does). <b>Done when</b> you can register on the public URL from curl, log in, post an expense from your phone, and a second account cannot see it.</p>
<p>Extensions: monthly summary endpoint (<code>GROUP BY category</code>), CSV export, budgets with 80% alerts, refresh tokens.</p>`,
docs:[['Spring Security architecture','https://docs.spring.io/spring-security/reference/servlet/architecture.html'],['jjwt','https://github.com/jwtk/jjwt'],['Bean Validation constraints','https://jakarta.ee/specifications/bean-validation/3.0/jakarta-bean-validation-spec-3.0.html#builtinconstraints'],['Actions service containers','https://docs.github.com/en/actions/use-cases-and-examples/using-containerized-services/about-service-containers']],
exs:[
{title:'The security config',
prompt:`Write <code>SecurityConfig</code>: <code>@Configuration</code> + <code>@EnableWebSecurity</code>, constructor-injected <code>JwtFilter jwtFilter</code> (final field). One <code>@Bean SecurityFilterChain chain(HttpSecurity http)</code> that: <b>disables CSRF</b> (stateless token API), sets session creation policy <code>STATELESS</code>, permits <code>"/api/auth/**"</code> and <code>"/actuator/health"</code> to all, requires authentication for <code>anyRequest</code>, and registers the JWT filter <b>before</b> <code>UsernamePasswordAuthenticationFilter</code>. Also expose a <code>@Bean PasswordEncoder</code> returning <code>new BCryptPasswordEncoder()</code>.`,
starter:`import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // your code
}`,
solution:`import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    public SecurityConfig(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    SecurityFilterChain chain(HttpSecurity http) throws Exception {
        return http
            .csrf(c -> c.disable())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(a -> a
                .requestMatchers("/api/auth/**", "/actuator/health").permitAll()
                .anyRequest().authenticated())
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}`,
tests:[{d:'@Configuration + @EnableWebSecurity',re:'@Configuration[\\s\\S]*?@EnableWebSecurity'},{d:'CSRF disabled for the stateless API',re:'csrf\\s*\\([\\s\\S]*?disable'},{d:'Session policy STATELESS',re:'SessionCreationPolicy\\.STATELESS'},{d:'Auth endpoints and health permitted to all',re:'requestMatchers\\s*\\(\\s*"/api/auth/\\*\\*"\\s*,\\s*"/actuator/health"\\s*\\)\\s*\\.permitAll'},{d:'Everything else authenticated',re:'anyRequest\\s*\\(\\s*\\)\\s*\\.authenticated'},{d:'JWT filter registered before the username/password filter',re:'addFilterBefore\\s*\\(\\s*jwtFilter\\s*,\\s*UsernamePasswordAuthenticationFilter\\.class'},{d:'BCrypt encoder bean exposed',re:'PasswordEncoder[\\s\\S]*?new\\s+BCryptPasswordEncoder\\s*\\(\\s*\\)'}],
behavior:`1. Anonymous GET /api/expenses → 401; anonymous POST /api/auth/register → allowed through. 2. /actuator/health answers without a token, so load balancers can probe. 3. With a valid Bearer token the JwtFilter authenticates the request before Spring's username/password machinery would run. 4. No JSESSIONID cookie ever appears — STATELESS means every request authenticates itself. 5. passwordEncoder() gives AuthController one blessed way to hash.`,
hints:['The chain is one fluent expression ending in .build() — each config aspect is a lambda: csrf(c -> c.disable()), sessionManagement(s -> ...), authorizeHttpRequests(a -> ...).','Order inside authorizeHttpRequests matters: specific requestMatchers().permitAll() lines FIRST, anyRequest().authenticated() LAST.','addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class) slots your filter into the standard chain position for token auth.']},
{title:'The ownership-checked controller',
prompt:`Write <code>ExpenseController</code>: <code>@RestController</code>, <code>@RequestMapping("/api/expenses")</code>, constructor-injected final <code>ExpenseRepository repo</code>. Declare record <code>NewExpense(@Positive long amountCents, @NotBlank String category, String note, @PastOrPresent LocalDate spentOn)</code> in the file. Endpoints, with the caller's user id from the <code>@AuthenticationPrincipal Long userId</code> parameter: (1) <code>@GetMapping</code> list → <code>repo.findByUserId(userId)</code>; (2) <code>@PostMapping</code> create from <code>@Valid @RequestBody NewExpense</code> → save an Expense built <b>with the caller's userId</b>, return it with <code>@ResponseStatus(HttpStatus.CREATED)</code>; (3) <code>@GetMapping("/{id}")</code> single → <code>repo.findByIdAndUserId(id, userId)</code> mapped to 200, <code>orElse</code> 404 via ResponseEntity — <b>never findById</b>, that is the IDOR hole.`,
starter:`import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    record NewExpense(@Positive long amountCents, @NotBlank String category,
                      String note, @PastOrPresent LocalDate spentOn) {}

    // your code
}`,
solution:`import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    record NewExpense(@Positive long amountCents, @NotBlank String category,
                      String note, @PastOrPresent LocalDate spentOn) {}

    private final ExpenseRepository repo;

    public ExpenseController(ExpenseRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Expense> list(@AuthenticationPrincipal Long userId) {
        return repo.findByUserId(userId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Expense create(@AuthenticationPrincipal Long userId, @Valid @RequestBody NewExpense in) {
        Expense e = new Expense(userId, in.amountCents(), in.category(), in.note(), in.spentOn());
        return repo.save(e);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Expense> one(@AuthenticationPrincipal Long userId, @PathVariable Long id) {
        return repo.findByIdAndUserId(id, userId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
}`,
tests:[{d:'List scoped to the caller: findByUserId',re:'findByUserId\\s*\\(\\s*userId\\s*\\)'},{d:'Create validates the body (@Valid) and returns 201',re:'@ResponseStatus\\s*\\(\\s*HttpStatus\\.CREATED\\s*\\)[\\s\\S]*?@Valid\\s+@RequestBody|@Valid\\s+@RequestBody[\\s\\S]*?CREATED'},{d:'Saved expense carries the CALLER’s id, not one from the body',re:'new\\s+Expense\\s*\\(\\s*userId'},{d:'Single fetch uses findByIdAndUserId (IDOR-proof)',re:'findByIdAndUserId\\s*\\(\\s*id\\s*,\\s*userId\\s*\\)'},{d:'Plain findById never used',re:'findById\\s*\\(',not:true},{d:'Missing/foreign row → 404',re:'notFound\\s*\\(\\s*\\)\\s*\\.build'}],
behavior:`1. GET /api/expenses returns only the caller's rows — two users each see their own list. 2. POST with amountCents -5 or blank category → 422/400 from validation before any code of yours runs. 3. The created expense belongs to the token's user even if a malicious body claims another user_id — the server never reads ownership from the client. 4. GET /api/expenses/17 where 17 belongs to someone else → 404, indistinguishable from not-existing (no information leak).`,
hints:['Ownership never comes from the request body — the ONLY trusted source is the authenticated principal.','findByIdAndUserId folds the authz check into the query: foreign rows are not "forbidden", they are absent → natural 404.','@Valid on the @RequestBody triggers the record’s constraint annotations; without it they are decoration.']},
{title:'CI with a real database',lang:'yaml',
prompt:`Write the workflow <code>ci</code>: on <code>push</code> to main <b>and</b> on <code>pull_request</code>. One job <code>test</code> on ubuntu-latest with a Postgres 17 <b>service container</b>: image <code>postgres:17</code>, env <code>POSTGRES_DB: ledgerly</code>, <code>POSTGRES_USER: ledgerly</code>, <code>POSTGRES_PASSWORD: ci</code>, ports mapping <code>5432:5432</code>. Steps: checkout v4; setup-java v4 (temurin, 21, <code>cache: maven</code>); run <code>./mvnw -q verify</code> with env vars <code>DB_URL: jdbc:postgresql://localhost:5432/ledgerly</code>, <code>DB_USER: ledgerly</code>, <code>DB_PASS: ci</code> on that step.`,
starter:`name: ci
`,
solution:`name: ci
on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:17
        env:
          POSTGRES_DB: ledgerly
          POSTGRES_USER: ledgerly
          POSTGRES_PASSWORD: ci
        ports:
          - 5432:5432
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: 21
          cache: maven
      - run: ./mvnw -q verify
        env:
          DB_URL: jdbc:postgresql://localhost:5432/ledgerly
          DB_USER: ledgerly
          DB_PASS: ci
`,
tests:[{d:'Runs on push to main AND every pull request',re:'on:[\\s\\S]*?push:[\\s\\S]*?branches:\\s*\\[?\\s*main[\\s\\S]*?pull_request'},{d:'Postgres 17 service container declared',re:'services:[\\s\\S]*?postgres:[\\s\\S]*?image:\\s*postgres:17'},{d:'Service env: db, user and password set',re:'POSTGRES_DB:\\s*ledgerly[\\s\\S]*?POSTGRES_USER:\\s*ledgerly[\\s\\S]*?POSTGRES_PASSWORD:\\s*ci'},{d:'Port 5432 published to the job',re:'ports:[\\s\\S]*?5432:5432'},{d:'Java 21 with maven cache',re:'setup-java@v4[\\s\\S]*?java-version:\\s*.?21[\\s\\S]*?cache:\\s*maven'},{d:'verify runs with DB env vars pointing at the service',re:'\\./mvnw\\s+-q\\s+verify[\\s\\S]*?DB_URL:\\s*jdbc:postgresql://localhost:5432/ledgerly'}],
behavior:`1. Every push to main and every PR spins a throwaway Postgres next to the job VM; localhost:5432 works because the port is published. 2. Flyway migrates the empty database, MockMvc tests run against the real engine — CHECK constraints and SQL behavior included, which H2 would fake. 3. A red suite blocks the merge; the database vanishes with the VM. 4. Second run is fast: Maven cache hit.`,
hints:['pull_request as a bare key (no filters) means every PR against any branch.','services: is a JOB-level key, sibling of steps: — GitHub starts the container and wires networking before step 1.','The DB env vars go on the mvnw STEP (env: under that step), matching the names your application.yaml reads.']}
]},
{id:'prj3',title:'Project: DojoChat — realtime chat over WebSockets',body:`
<p><b>What you build</b>: a chat server with rooms — open two browser tabs, type in one, see it in the other instantly. Then make it survive running on <i>two</i> server instances with Redis pub/sub, which is the moment this stops being a toy: state and concurrency become real.</p>
<p><b>You will practice</b>: the WebSocket protocol, Spring's WebSocketHandler API, thread-safe collections under concurrent sessions, Redis pub/sub as an inter-instance bus, and proxying WebSockets in production. Prereqs: projects 1-2, Concurrency stream.</p>
<p><b>Step 1 — skeleton.</b> start.spring.io with <code>websocket,data-redis</code>. Compose file: just <code>redis: { image: redis:7, ports: ["6379:6379"] }</code> — no SQL database in this one; chat history is an extension.</p>
<p><b>Step 2 — one instance, one room (Exercise 1).</b> <code>ChatHandler extends TextWebSocketHandler</code>: track live sessions in a <code>CopyOnWriteArraySet</code>, broadcast every incoming message to every open session. Register it in <code>WebSocketConfig implements WebSocketConfigurer</code> at path <code>/ws/chat</code>. The threading reality: <b>each WebSocket session is driven by container threads concurrently</b> — a plain HashSet corrupts, an Iterator throws; the copy-on-write set is the right tool at chat scale (many reads/broadcasts, rare mutations).</p>
<p><b>Step 3 — a throwaway client.</b> <code>src/main/resources/static/index.html</code> — 20 lines: <code>new WebSocket("ws://localhost:8080/ws/chat?room=java")</code>, onmessage appends to a list, a form sends. Two tabs = your first realtime moment.</p>
<p><b>Step 4 — rooms.</b> Read the <code>room</code> query parameter from the session URI in <code>afterConnectionEstablished</code>, keep <code>Map&lt;String, Set&lt;WebSocketSession&gt;&gt;</code> (ConcurrentHashMap + computeIfAbsent), broadcast only within the room. Also handle <code>afterConnectionClosed</code> — leaking closed sessions is THE classic WebSocket bug: every broadcast then throws on the dead session.</p>
<p><b>Step 5 — the multi-instance problem (Exercise 2).</b> Run two instances (<code>--server.port=8081</code>): tabs on different ports stop seeing each other — sessions live in instance memory. Fix with <b>Redis pub/sub</b>: on receive, <i>publish</i> to channel <code>chat:&lt;room&gt;</code> instead of broadcasting; a Redis <i>subscriber</i> in each instance receives and delivers to its local sessions. Draw it before coding it:</p>
<div class="codeSample">tab A ──ws── instance 1 ──publish──▶ Redis chat:java ──▶ instance 1 subscriber ──▶ its local sessions
tab B ──ws── instance 2 ◀──────────────┘ (same message) ──▶ instance 2 subscriber ──▶ its local sessions</div>
<p><b>Step 6 — presence.</b> On join/leave, publish a system message ("ron joined") to the room channel. Extension: a Redis SET per room holding usernames, INCR/DECR on join/leave, expose <code>GET /api/rooms/{room}/who</code>.</p>
<p><b>Step 7 — deploy.</b> Playbook from Project 1, with the WebSocket deltas: <b>Hetzner/Caddy</b> — nothing extra, Caddy proxies WebSocket upgrades automatically (this is why we chose it); nginx would need explicit <code>Upgrade</code>/<code>Connection</code> headers. <b>Fly.io</b> — works out of the box, and <code>fly redis create</code> provides the bus; scale to 2 machines (<code>fly scale count 2</code>) to see the pub/sub architecture earn its keep in production. <b>Render</b> — WebSockets supported on web services; add their managed Redis. Use <code>wss://</code> (TLS) from the browser — mixed content rules block <code>ws://</code> on an https page. <b>Done when</b> two phones on different networks chat through your domain.</p>`,
docs:[['WebSockets in Spring','https://docs.spring.io/spring-framework/reference/web/websocket.html'],['Redis pub/sub','https://redis.io/docs/latest/develop/interact/pubsub/'],['MDN — WebSocket API','https://developer.mozilla.org/en-US/docs/Web/API/WebSocket'],['Caddy + WebSockets','https://caddyserver.com/docs/caddyfile/directives/reverse_proxy']],
exs:[
{title:'The broadcast handler',
prompt:`Write <code>ChatHandler extends TextWebSocketHandler</code> (single room version): field <code>private final Set&lt;WebSocketSession&gt; sessions = new CopyOnWriteArraySet&lt;&gt;()</code>. Override three methods: (1) <code>afterConnectionEstablished(WebSocketSession session)</code> — add the session; (2) <code>handleTextMessage(WebSocketSession session, TextMessage message)</code> — loop the set and <code>sendMessage(new TextMessage(message.getPayload()))</code> to every session that <code>isOpen()</code>; (3) <code>afterConnectionClosed(WebSocketSession session, CloseStatus status)</code> — remove the session. Declare <code>throws Exception</code> as the base class does.`,
starter:`import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

public class ChatHandler extends TextWebSocketHandler {

    // your code
}`,
solution:`import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

public class ChatHandler extends TextWebSocketHandler {

    private final Set<WebSocketSession> sessions = new CopyOnWriteArraySet<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        sessions.add(session);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        for (WebSocketSession s : sessions) {
            if (s.isOpen()) {
                s.sendMessage(new TextMessage(message.getPayload()));
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        sessions.remove(session);
    }
}`,
tests:[{d:'Thread-safe CopyOnWriteArraySet holds the sessions',re:'CopyOnWriteArraySet\\s*<\\s*>\\s*\\('},{d:'Join adds the session',re:'afterConnectionEstablished[\\s\\S]*?sessions\\.add\\s*\\(\\s*session'},{d:'Broadcast loops every session',re:'handleTextMessage[\\s\\S]*?for\\s*\\([\\s\\S]*?sessions\\s*\\)'},{d:'Only open sessions receive (isOpen guard)',re:'isOpen\\s*\\(\\s*\\)[\\s\\S]*?sendMessage'},{d:'Payload relayed as a new TextMessage',re:'sendMessage\\s*\\(\\s*new\\s+TextMessage\\s*\\(\\s*message\\.getPayload'},{d:'Leave removes the session (no leak)',re:'afterConnectionClosed[\\s\\S]*?sessions\\.remove\\s*\\(\\s*session'},{d:'No plain HashSet',re:'new\\s+HashSet',not:true}],
behavior:`1. Two connected clients: either one sends "hi" → BOTH receive "hi" (sender included — echo confirms delivery). 2. A third client joining mid-conversation receives subsequent messages only. 3. Closing a tab removes its session; the next broadcast does not throw. 4. Concurrent joins/sends do not corrupt the set — CopyOnWriteArraySet snapshots iteration while writes copy. 5. The isOpen() guard skips sessions that died without a clean close (network drop).`,
hints:['The three overrides are the whole lifecycle: established → add, message → fan out, closed → remove.','Broadcast is a plain enhanced for over sessions with if (s.isOpen()) s.sendMessage(...).','Why not HashSet? handleTextMessage runs on container threads concurrently with joins — iteration + mutation on a HashSet is a ConcurrentModificationException waiting for peak traffic.']},
{title:'The Redis bridge',
prompt:`Two classes gluing instances together: (1) <code>ChatPublisher</code> — constructor-injected final <code>StringRedisTemplate redis</code>; method <code>void publish(String room, String message)</code> calling <code>redis.convertAndSend("chat:" + room, message)</code>. (2) <code>RedisBridgeConfig</code> — <code>@Configuration</code> with a <code>@Bean RedisMessageListenerContainer container(RedisConnectionFactory factory, ChatHandler handler)</code>: create the container, <code>setConnectionFactory(factory)</code>, and <code>addMessageListener</code> with a lambda <code>(message, pattern) -&gt; handler.deliverLocal(new String(message.getBody()))</code> subscribed to <code>new PatternTopic("chat:*")</code>; return the container.`,
starter:`import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.listener.PatternTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;

public class ChatPublisher {
    // publisher here
}

@Configuration
class RedisBridgeConfig {
    // listener container bean here
}`,
solution:`import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.listener.PatternTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;

public class ChatPublisher {

    private final StringRedisTemplate redis;

    public ChatPublisher(StringRedisTemplate redis) {
        this.redis = redis;
    }

    public void publish(String room, String message) {
        redis.convertAndSend("chat:" + room, message);
    }
}

@Configuration
class RedisBridgeConfig {

    @Bean
    RedisMessageListenerContainer container(RedisConnectionFactory factory, ChatHandler handler) {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(factory);
        container.addMessageListener(
            (message, pattern) -> handler.deliverLocal(new String(message.getBody())),
            new PatternTopic("chat:*"));
        return container;
    }
}`,
tests:[{d:'Publisher sends via convertAndSend to chat:<room>',re:'convertAndSend\\s*\\(\\s*"chat:"\\s*\\+\\s*room\\s*,\\s*message'},{d:'StringRedisTemplate constructor-injected, final',re:'private\\s+final\\s+StringRedisTemplate\\s+redis[\\s\\S]*?ChatPublisher\\s*\\(\\s*StringRedisTemplate'},{d:'Listener container bean wired to the connection factory',re:'RedisMessageListenerContainer[\\s\\S]*?setConnectionFactory\\s*\\(\\s*factory'},{d:'Subscribes to the chat:* pattern',re:'PatternTopic\\s*\\(\\s*"chat:\\*"'},{d:'Incoming Redis messages delivered to local sessions',re:'deliverLocal\\s*\\(\\s*new\\s+String\\s*\\(\\s*message\\.getBody'}],
behavior:`1. publish("java", "hi") → every instance subscribed to chat:* receives "hi" within milliseconds, including the publishing instance itself. 2. The lambda listener decodes the raw bytes and hands them to the handler's local fan-out — the handler no longer broadcasts directly on receive; it publishes, and delivery ALWAYS flows through Redis (one code path, whether 1 instance or 10). 3. Two app instances on different ports: tabs connected to each now see each other's messages. 4. PatternTopic chat:* means new rooms need zero subscription changes.`,
hints:['The publisher is 6 lines: field, constructor, one method delegating to convertAndSend.','The container bean pattern: new → setConnectionFactory → addMessageListener(listener, topic) → return. Spring starts/stops it with the context.','MessageListener is a functional interface (message, pattern) — the room is recoverable from message.getChannel() when you deliver per-room.']},
{title:'Production compose for chat',lang:'yaml',
prompt:`Write the production <code>compose.yaml</code> for DojoChat on a VPS: services (1) <code>app</code> — image <code>ghcr.io/you/dojochat:latest</code>, <code>restart: unless-stopped</code>, environment <code>SPRING_DATA_REDIS_HOST: redis</code>, depends_on redis; (2) <code>redis</code> — image <code>redis:7</code>, restart unless-stopped; (3) <code>caddy</code> — image <code>caddy:2</code>, restart unless-stopped, ports <code>"80:80"</code> and <code>"443:443"</code>, volumes mounting <code>./Caddyfile:/etc/caddy/Caddyfile</code> and named volume <code>caddy_data:/data</code>. Declare the <code>caddy_data</code> volume at the bottom. No ports exposed on app or redis — only Caddy faces the internet.`,
starter:`services:
`,
solution:`services:
  app:
    image: ghcr.io/you/dojochat:latest
    restart: unless-stopped
    environment:
      SPRING_DATA_REDIS_HOST: redis
    depends_on:
      - redis
  redis:
    image: redis:7
    restart: unless-stopped
  caddy:
    image: caddy:2
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
volumes:
  caddy_data:
`,
tests:[{d:'App runs the GHCR image and restarts on failure',re:'app:[\\s\\S]*?image:\\s*ghcr\\.io/you/dojochat:latest[\\s\\S]*?restart:\\s*unless-stopped'},{d:'App finds Redis by service name (SPRING_DATA_REDIS_HOST)',re:'SPRING_DATA_REDIS_HOST:\\s*redis'},{d:'App declared to depend on redis',re:'depends_on:[\\s\\S]*?-\\s*redis'},{d:'Only caddy publishes ports 80 and 443',re:'caddy:[\\s\\S]*?ports:[\\s\\S]*?"80:80"[\\s\\S]*?"443:443"'},{d:'Only ONE ports: block in the file (caddy) — app and redis stay internal',re:'ports:[\\s\\S]*ports:',not:true},{d:'Caddyfile mounted and cert volume persisted',re:'\\./Caddyfile:/etc/caddy/Caddyfile[\\s\\S]*?caddy_data:/data[\\s\\S]*?volumes:\\s*\\n\\s*caddy_data:'}],
behavior:`1. docker compose up -d starts all three; the app resolves the hostname "redis" via compose's internal network — no IPs anywhere. 2. From the internet only 80/443 answer; the app and Redis are unreachable directly (attack surface = Caddy). 3. A 2-line Caddyfile (chat.you.dev { reverse_proxy app:8080 }) terminates TLS AND proxies WebSocket upgrades with zero extra config. 4. caddy_data persists certificates across restarts — no re-issuance dance. 5. A crashed container restarts by itself.`,
hints:['Service names ARE hostnames on the compose network — that is why SPRING_DATA_REDIS_HOST is just "redis".','The security posture comes from omission: no ports: on app/redis means no host binding at all.','Named volumes are declared twice: used in the service, listed under top-level volumes:.']}
]},

{id:'prj4',title:'Project: Skywatch — a live API dashboard',body:`
<p><b>What you build</b>: a weather dashboard for cities you pick — a Java backend that consumes a public API (Open-Meteo, no key required), caches results properly, refreshes on a schedule, and serves a small live frontend. The consuming-external-APIs project: timeouts, caching, and graceful degradation — daily bread in every integration job.</p>
<p><b>You will practice</b>: java.net.http.HttpClient, Jackson against JSON you don't control, Caffeine caching with TTLs, scheduled refresh, static file serving, defensive error handling. Prereqs: projects 1-2, APIs & REST and Caching lessons.</p>
<p><b>Step 1 — skeleton.</b> start.spring.io with <code>web,cache</code> + Caffeine (<code>com.github.ben-manes.caffeine:caffeine</code>) in the pom. No database — the cache IS the state (rebuildable from the source on restart: a fine property to recognize).</p>
<p><b>Step 2 — meet the API in the terminal first.</b> Always curl before you code the client:</p>
<div class="codeSample">curl -s 'https://api.open-meteo.com/v1/forecast?latitude=32.08&amp;longitude=34.78&amp;current=temperature_2m,wind_speed_10m'
# → {"current": {"temperature_2m": 27.4, "wind_speed_10m": 11.2, ...}, ...}</div>
<p><b>Step 3 — the client (Exercise 1).</b> <code>WeatherClient</code>: one shared HttpClient (connect timeout!), request timeout, status check, Jackson tree-model parse into your own record <code>Reading(double temperature, double windSpeed)</code>. Your record, not their schema — the anti-corruption layer that keeps their API's shape out of your codebase.</p>
<p><b>Step 4 — cache + schedule (Exercise 2).</b> <code>WeatherService</code> with <code>@Cacheable("weather")</code> keyed by city; Caffeine configured <code>expireAfterWrite(10m), maximumSize(500)</code>; a <code>@Scheduled(fixedRate = 600_000)</code> refresher warming the configured cities so users rarely hit a cold path. Enable with <code>@EnableCaching</code> + <code>@EnableScheduling</code>. Why cache an API that changes hourly? Because 1000 dashboard users must not translate to 1000 identical upstream calls — you are one <code>429 Too Many Requests</code> away from understanding rate limits personally.</p>
<p><b>Step 5 — your API + frontend.</b> <code>GET /api/weather/{city}</code> (404 unknown city, 503 when upstream fails and no cache exists), plus <code>static/index.html</code>: a fetch loop every 60s rendering cards. Servers serve JSON; browsers render it.</p>
<p><b>Step 6 — resilience drill.</b> Kill your network and reload: the dashboard must keep showing cached readings (stale beats blank), and log — not throw — upstream failures. Test with WireMock if you want CI coverage of timeouts/500s: point the client's base URL at a mock that misbehaves on cue.</p>
<p><b>Step 7 — deploy.</b> Playbook from Project 1, easiest of the four: no database, no attachments — a single container on any of the three targets. One delta worth doing on Hetzner/Fly: set JVM flags <code>-XX:MaxRAMPercentage=75</code> so the container's memory limit is respected. <b>Done when</b> your dashboard renders live cities on your public URL and survives an upstream outage gracefully. Extensions: city search (Open-Meteo geocoding API), a second source (air quality), an SSE endpoint pushing updates instead of the fetch loop.</p>`,
docs:[['Open-Meteo API docs','https://open-meteo.com/en/docs'],['java.net.http.HttpClient','https://docs.oracle.com/en/java/javase/21/docs/api/java.net.http/java/net/http/HttpClient.html'],['Caffeine wiki','https://github.com/ben-manes/caffeine/wiki'],['Spring @Scheduled','https://docs.spring.io/spring-framework/reference/integration/scheduling.html']],
exs:[
{title:'The API client',
prompt:`Write <code>WeatherClient</code>: record <code>Reading(double temperature, double windSpeed)</code> declared in the file. Fields: a <code>private final HttpClient http</code> built in the constructor with <code>HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(3)).build()</code>, and a <code>private final ObjectMapper mapper = new ObjectMapper()</code>. Method <code>Reading fetch(double lat, double lon) throws Exception</code>: build the GET for <code>https://api.open-meteo.com/v1/forecast?latitude=&lt;lat&gt;&amp;longitude=&lt;lon&gt;&amp;current=temperature_2m,wind_speed_10m</code> with <code>.timeout(Duration.ofSeconds(5))</code>; send with <code>BodyHandlers.ofString()</code>; if <code>statusCode() != 200</code> throw <code>IllegalStateException</code> including the code; else parse with the tree model: <code>mapper.readTree(body).path("current")</code>, reading <code>temperature_2m</code> and <code>wind_speed_10m</code> as doubles into a Reading.`,
starter:`import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

public class WeatherClient {

    record Reading(double temperature, double windSpeed) {}

    // your code
}`,
solution:`import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

public class WeatherClient {

    record Reading(double temperature, double windSpeed) {}

    private final HttpClient http;
    private final ObjectMapper mapper = new ObjectMapper();

    public WeatherClient() {
        this.http = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(3))
            .build();
    }

    public Reading fetch(double lat, double lon) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://api.open-meteo.com/v1/forecast?latitude=" + lat
                + "&longitude=" + lon + "&current=temperature_2m,wind_speed_10m"))
            .timeout(Duration.ofSeconds(5))
            .GET()
            .build();
        HttpResponse<String> response = http.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200) {
            throw new IllegalStateException("open-meteo returned " + response.statusCode());
        }
        JsonNode current = mapper.readTree(response.body()).path("current");
        return new Reading(
            current.path("temperature_2m").asDouble(),
            current.path("wind_speed_10m").asDouble());
    }
}`,
tests:[{d:'Shared client with a connect timeout',re:'HttpClient\\.newBuilder\\s*\\(\\s*\\)[\\s\\S]*?connectTimeout\\s*\\(\\s*Duration\\.ofSeconds\\s*\\(\\s*3'},{d:'Per-request timeout set',re:'\\.timeout\\s*\\(\\s*Duration\\.ofSeconds\\s*\\(\\s*5'},{d:'Correct endpoint with both metrics requested',re:'api\\.open-meteo\\.com/v1/forecast\\?latitude=[\\s\\S]*?current=temperature_2m,wind_speed_10m'},{d:'Non-200 becomes IllegalStateException with the code',re:'statusCode\\s*\\(\\s*\\)\\s*!=\\s*200[\\s\\S]*?IllegalStateException[\\s\\S]*?statusCode'},{d:'Tree-model parse of the current node',re:'readTree\\s*\\([\\s\\S]*?\\.path\\s*\\(\\s*"current"'},{d:'Returns your own Reading record, not their schema',re:'return\\s+new\\s+Reading\\s*\\('}],
behavior:`1. fetch(32.08, 34.78) returns a Reading with plausible Tel Aviv numbers; the upstream JSON's nesting never escapes this class. 2. A 500/404 from upstream throws IllegalStateException naming the code — callers see one failure type. 3. An unreachable network fails within 3s (connect) / 5s (total) — never a hung thread; without timeouts, every stuck upstream call parks a request thread forever, and a slow dependency becomes YOUR outage. 4. Missing JSON fields parse as 0.0 via path() instead of throwing — acceptable here, a conscious choice.`,
hints:['Two different timeouts: connectTimeout on the CLIENT (TCP establishment), .timeout on the REQUEST (whole exchange).','Tree model beats full DTO binding when you want 2 fields from a 40-field response: readTree(...).path("current").path("temperature_2m").asDouble().','path() (not get()) returns a missing node instead of null — chainable without NPEs.']},
{title:'Cache + scheduled warm-up',
prompt:`Two classes: (1) <code>CacheConfig</code> — <code>@Configuration @EnableCaching @EnableScheduling</code> with a <code>@Bean CacheManager cacheManager()</code>: a <code>CaffeineCacheManager("weather")</code> whose Caffeine builder sets <code>maximumSize(500)</code> and <code>expireAfterWrite(Duration.ofMinutes(10))</code>. (2) <code>WeatherService</code> — <code>@Service</code>, constructor-injected final <code>WeatherClient client</code>; method <code>@Cacheable(value = "weather", key = "#city")</code> <code>Reading forCity(String city)</code> that looks up coordinates from a <code>private static final Map&lt;String, double[]&gt; CITIES</code> (entries for "telaviv" {32.08, 34.78} and "london" {51.5, -0.12}), throws <code>IllegalArgumentException</code> for unknown cities, else delegates to <code>client.fetch</code>; and <code>@Scheduled(fixedRate = 600_000)</code> <code>void warm()</code> that loops CITIES keys calling <code>forCity</code> in a try/catch that logs and continues.`,
starter:`import java.time.Duration;
import java.util.Map;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import com.github.benmanes.caffeine.cache.Caffeine;

@Configuration
@EnableCaching
@EnableScheduling
class CacheConfig {
    // cache manager bean
}

@Service
public class WeatherService {
    // your code
}`,
solution:`import java.time.Duration;
import java.util.Map;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import com.github.benmanes.caffeine.cache.Caffeine;

@Configuration
@EnableCaching
@EnableScheduling
class CacheConfig {

    @Bean
    CacheManager cacheManager() {
        CaffeineCacheManager manager = new CaffeineCacheManager("weather");
        manager.setCaffeine(Caffeine.newBuilder()
            .maximumSize(500)
            .expireAfterWrite(Duration.ofMinutes(10)));
        return manager;
    }
}

@Service
public class WeatherService {

    private static final Map<String, double[]> CITIES = Map.of(
        "telaviv", new double[]{32.08, 34.78},
        "london", new double[]{51.5, -0.12});

    private final WeatherClient client;

    public WeatherService(WeatherClient client) {
        this.client = client;
    }

    @Cacheable(value = "weather", key = "#city")
    public WeatherClient.Reading forCity(String city) throws Exception {
        double[] coords = CITIES.get(city);
        if (coords == null) {
            throw new IllegalArgumentException("unknown city: " + city);
        }
        return client.fetch(coords[0], coords[1]);
    }

    @Scheduled(fixedRate = 600_000)
    void warm() {
        for (String city : CITIES.keySet()) {
            try {
                forCity(city);
            } catch (Exception e) {
                System.err.println("warm-up failed for " + city + ": " + e.getMessage());
            }
        }
    }
}`,
tests:[{d:'Caching and scheduling both enabled',re:'@EnableCaching[\\s\\S]*?@EnableScheduling'},{d:'Caffeine: bounded size + 10-minute TTL',re:'maximumSize\\s*\\(\\s*500\\s*\\)[\\s\\S]*?expireAfterWrite\\s*\\(\\s*Duration\\.ofMinutes\\s*\\(\\s*10'},{d:'forCity cached per city key',re:'@Cacheable\\s*\\(\\s*value\\s*=\\s*"weather"\\s*,\\s*key\\s*=\\s*"#city"'},{d:'Unknown city rejected with IllegalArgumentException',re:'IllegalArgumentException\\s*\\(\\s*"unknown city'},{d:'Scheduled warm-up every 10 minutes',re:'@Scheduled\\s*\\(\\s*fixedRate\\s*=\\s*600_?000'},{d:'Warm-up survives one city failing (try/catch inside the loop)',re:'for\\s*\\([\\s\\S]*?try\\s*\\{[\\s\\S]*?forCity[\\s\\S]*?catch'}],
behavior:`1. First forCity("london") hits the network; the next 10 minutes of calls return instantly from cache; entry expires and the next call refetches. 2. forCity("atlantis") throws IllegalArgumentException — and is NOT cached (exceptions never populate a @Cacheable cache). 3. Every 10 minutes warm() refreshes both cities, so real users almost always hit warm cache. 4. Open-Meteo down during warm-up: the error is logged, the OTHER city still refreshes, stale entries keep serving. 5. maximumSize(500) caps memory even if you add a city-search feature later.`,
hints:['CaffeineCacheManager("weather") + setCaffeine(builder) — the builder carries size and TTL.','@Cacheable key = "#city" is SpEL referencing the parameter by name.','The warm-up try/catch goes INSIDE the for loop — outside it, one bad city aborts the whole refresh cycle.']},
{title:'The dashboard endpoint',
prompt:`Write <code>WeatherController</code>: <code>@RestController</code>, constructor-injected final <code>WeatherService service</code>. One endpoint <code>@GetMapping("/api/weather/{city}")</code> returning <code>ResponseEntity&lt;WeatherClient.Reading&gt;</code>: call <code>service.forCity(city)</code> in a try/catch — return <code>ResponseEntity.ok(reading)</code> on success; catch <code>IllegalArgumentException</code> → <code>ResponseEntity.notFound().build()</code>; catch any other <code>Exception</code> → <code>ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build()</code> (503 — the upstream failed, not the client's fault, and honest status codes are how frontends degrade gracefully).`,
starter:`import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class WeatherController {

    // your code
}`,
solution:`import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class WeatherController {

    private final WeatherService service;

    public WeatherController(WeatherService service) {
        this.service = service;
    }

    @GetMapping("/api/weather/{city}")
    public ResponseEntity<WeatherClient.Reading> weather(@PathVariable String city) {
        try {
            return ResponseEntity.ok(service.forCity(city));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        }
    }
}`,
tests:[{d:'Route with @PathVariable city',re:'@GetMapping\\s*\\(\\s*"/api/weather/\\{city\\}"\\s*\\)[\\s\\S]*?@PathVariable'},{d:'Success wraps the reading in 200 OK',re:'ResponseEntity\\.ok\\s*\\(\\s*service\\.forCity'},{d:'Unknown city → 404',re:'catch\\s*\\(\\s*IllegalArgumentException[\\s\\S]*?notFound\\s*\\(\\s*\\)\\s*\\.build'},{d:'Upstream failure → 503, not 500',re:'catch\\s*\\(\\s*Exception[\\s\\S]*?SERVICE_UNAVAILABLE'},{d:'Catch order: specific before general',re:'catch\\s*\\(\\s*IllegalArgumentException[\\s\\S]*?catch\\s*\\(\\s*Exception'}],
behavior:`1. GET /api/weather/london → 200 {"temperature": ..., "windSpeed": ...} (cache-fast after first hit). 2. GET /api/weather/atlantis → 404, empty body. 3. Upstream dead + cold cache → 503; the frontend shows "temporarily unavailable" instead of a broken card. 4. Upstream dead + warm cache → still 200: @Cacheable answers without calling anything. 5. The catch order compiles ONLY specific-first — Java rejects unreachable catch blocks.`,
hints:['Three outcomes, three branches: ok / notFound / SERVICE_UNAVAILABLE — the mapping IS the exercise.','IllegalArgumentException must be caught before Exception or the second block is unreachable (compile error).','503 vs 500 matters: 500 = "my bug", 503 = "dependency down, retry later" — monitoring and frontends treat them differently.']}
]}

]});

