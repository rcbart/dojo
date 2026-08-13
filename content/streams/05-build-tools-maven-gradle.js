STREAMS.push({icon:'🔧',title:'Build Tools: Maven & Gradle',blurb:'How imports and dependencies really work, POMs, lifecycles, Gradle, and professional project setup.',lessons:[
{id:'bld0',title:'Imports, the classpath & how libraries actually load',body:`
<p>Three separate mechanisms that beginners blur together:</p>
<ul>
<li><b><code>import</code></b> is compile-time sugar only — it lets you write <code>Gson</code> instead of <code>com.google.gson.Gson</code>. It does NOT fetch or load anything.</li>
<li><b>The classpath</b> is where classes are actually found: a list of directories and jars that <code>javac</code> searches at compile time and <code>java</code> searches at runtime. A <b>jar</b> is just a zip of .class files.</li>
<li><b>A build tool</b> (Maven/Gradle) is a classpath robot: it downloads declared libraries (and their <i>transitive</i> dependencies) from a repository into a local cache — Maven's is <code>~/.m2/repository</code> — and assembles the classpath for you.</li>
</ul>
<div class="codeSample"># by hand — what the build tool automates:
javac -cp lib/gson-2.11.0.jar src/App.java -d out
java  -cp out:lib/gson-2.11.0.jar App          # ':' on macOS/Linux, ';' on Windows

# the classic failure, decoded:
#   compile-time missing  -&gt; "cannot find symbol"        (javac classpath)
#   runtime missing       -&gt; NoClassDefFoundError        (java classpath)
# same root cause: the class is not on THAT phase's classpath</div>
<div class="codeSample">import com.google.gson.Gson;               // now the short name works
Gson gson = new Gson();                     // class loaded from the jar at runtime

// where things come from: Maven Central (search.maven.org) hosts the jars;
// your pom/build.gradle names GAV coordinates; the tool resolves + caches them.</div>
<p>So "importing an SDK" is really three steps: declare the coordinate in the build file → tool downloads it to the local cache and puts it on the classpath → your <code>import</code> statements compile. The JDK's own classes (java.util, java.net.http) need no dependency — they ship with the runtime; only <code>java.lang</code> needs no import.</p>`,
docs:[['Classpath — Oracle','https://docs.oracle.com/javase/8/docs/technotes/tools/unix/classpath.html'],['Using package members / imports — Oracle','https://docs.oracle.com/javase/tutorial/java/package/usepkgs.html'],['Maven Central search','https://central.sonatype.com/']],
ex:{title:'Classpath forensics',lang:'shell',
prompt:`Answer one per numbered line: (1) the command compiling <code>src/App.java</code> into <code>out/</code> with <code>lib/gson-2.11.0.jar</code> on the classpath, (2) the command running class <code>App</code> with both <code>out</code> and that jar on the classpath (macOS/Linux separator), (3) the import statement for <code>com.google.gson.Gson</code>, (4) the error you get at RUNTIME when a class present at compile time is missing from the runtime classpath, (5) the directory where Maven caches downloaded dependencies, (6) the term for dependencies your dependencies pull in.`,
starter:`# 1)

# 2)

# 3)

# 4)

# 5)

# 6)
`,
tests:[{d:'javac with -cp and -d out',re:'javac\\s+-cp\\s+lib/gson-2\\.11\\.0\\.jar\\s+src/App\\.java\\s+-d\\s+out'},{d:'java with out:jar classpath',re:'java\\s+-cp\\s+out:lib/gson-2\\.11\\.0\\.jar\\s+App'},{d:'Correct import statement',re:'import\\s+com\\.google\\.gson\\.Gson\\s*;'},{d:'NoClassDefFoundError',re:'NoClassDefFoundError'},{d:'~/.m2/repository',re:'\\.m2/repository'},{d:'Transitive dependencies',re:'[Tt]ransitive'}],
behavior:`1. (1) javac -cp lib/gson-2.11.0.jar src/App.java -d out. 2. (2) java -cp out:lib/gson-2.11.0.jar App — note the bare class name, and : as separator. 3. (3) import com.google.gson.Gson; 4. (4) NoClassDefFoundError (compile-time missing would be "cannot find symbol"). 5. (5) ~/.m2/repository. 6. (6) transitive dependencies.`,
hints:['-cp sets the search path; -d sets where compiled classes land.','At runtime BOTH your classes (out) and the library jar must be on -cp, joined with : (or ; on Windows).','The two-error distinction — compile vs runtime classpath — is the debugging superpower here.'],
solution:`# 1)
javac -cp lib/gson-2.11.0.jar src/App.java -d out

# 2)
java -cp out:lib/gson-2.11.0.jar App

# 3)
import com.google.gson.Gson;

# 4)
NoClassDefFoundError

# 5)
~/.m2/repository

# 6)
Transitive dependencies`}},
{id:'bld1',title:'Maven: the POM',body:`
<p>Maven builds are declared in <code>pom.xml</code>. Every project has coordinates — <code>groupId:artifactId:version</code> (GAV) — and gets dependencies from Maven Central by the same coordinates. Convention over configuration: source in <code>src/main/java</code>, tests in <code>src/test/java</code>, no build scripting needed for a standard project.</p>
<div class="codeSample">&lt;project&gt;
  &lt;modelVersion&gt;4.0.0&lt;/modelVersion&gt;
  &lt;groupId&gt;com.example.dojo&lt;/groupId&gt;
  &lt;artifactId&gt;javadojo&lt;/artifactId&gt;
  &lt;version&gt;1.0.0&lt;/version&gt;
  &lt;properties&gt;
    &lt;maven.compiler.release&gt;21&lt;/maven.compiler.release&gt;
  &lt;/properties&gt;
  &lt;dependencies&gt;
    &lt;dependency&gt;
      &lt;groupId&gt;org.junit.jupiter&lt;/groupId&gt;
      &lt;artifactId&gt;junit-jupiter&lt;/artifactId&gt;
      &lt;version&gt;5.10.2&lt;/version&gt;
      &lt;scope&gt;test&lt;/scope&gt;
    &lt;/dependency&gt;
  &lt;/dependencies&gt;
&lt;/project&gt;</div>
<p>Key commands: <code>mvn compile</code>, <code>mvn test</code>, <code>mvn package</code> (jar in <code>target/</code>), <code>mvn clean install</code>.</p>

<h4>Coordinates: how Maven finds anything</h4>
<p>Every artifact in the world is addressed by <b>groupId : artifactId : version</b>, and that triple is
the whole naming system. <code>groupId</code> is a reverse-domain namespace you control,
<code>artifactId</code> the module name, <code>version</code> the release. A <code>-SNAPSHOT</code>
suffix means "unreleased and mutable" — Maven re-checks it periodically, whereas a release version is
cached forever on the assumption it can never change.</p>

<h4>Scopes decide what ends up where</h4>
<div class="codeSample" data-hl>compile   (default) needed to build AND at runtime; ships with your app
provided  needed to compile, supplied by the environment at runtime
          (servlet API, and anything the container already has)
runtime   not needed to compile, required to run — JDBC drivers
test      test code only; never packaged
import    only in dependencyManagement, to pull in a BOM</div>
<p>Getting a scope wrong produces a specific, recognisable failure: <code>provided</code> where you
needed <code>compile</code> compiles fine and throws <code>NoClassDefFoundError</code> at runtime,
which is why that error so often means "a scope is wrong", not "a dependency is missing".</p>

<h4>Transitive dependencies and the nearest-wins rule</h4>
<p>Your dependencies have dependencies. Maven resolves the graph automatically, and when two paths
demand different versions of the same library it does <b>not</b> pick the newest — it picks the one
<i>nearest to your POM</i> in the tree, breaking ties by declaration order. This surprises people
regularly, and it is why <code>mvn dependency:tree</code> is the single most useful diagnostic
command: it shows what was chosen and what was omitted for conflict.</p>
<p>The fix for a bad resolution is to state the version yourself. A
<code>&lt;dependencyManagement&gt;</code> block pins versions across the whole build without adding
dependencies, so child modules inherit a consistent set and never declare versions at all.</p>

<h4>The lifecycle is why order is not yours to choose</h4>
<p><code>mvn package</code> does not just package: it runs validate → compile → test → package, in
that order, because invoking a phase runs every phase before it. That is the trade Maven makes —
convention over configuration. You do not describe <i>how</i> to build, you attach plugins to phases
and accept the sequence.</p>
<p>Hence a common confusion: <b><code>install</code> is not deployment.</b> It copies the artifact into
your local <code>~/.m2</code> repository so other local projects can resolve it. Publishing to a shared
repository is <code>deploy</code>.</p>
<p><b>And <code>clean</code> is not a ritual.</b> It deletes <code>target/</code>. Adding it to every
build "just in case" throws away incremental compilation and slows the loop; reach for it when stale
output is genuinely suspected — after changing a plugin version, or when the build behaves in a way the
source does not explain.</p>`,
docs:[['Maven in 5 Minutes','https://maven.apache.org/guides/getting-started/maven-in-five-minutes.html'],['POM Reference','https://maven.apache.org/pom.html']],
ex:{title:'Write a POM',lang:'xml',
prompt:`Write a minimal <code>pom.xml</code> for project <code>com.example.dojo : hello-maven : 0.1.0</code> that sets the compiler release to 21 and declares <b>one test-scoped dependency</b>: <code>org.junit.jupiter : junit-jupiter : 5.10.2</code>.`,
starter:`<project>
    <modelVersion>4.0.0</modelVersion>
    <!-- coordinates -->

    <!-- properties: compiler release 21 -->

    <!-- dependencies: junit-jupiter, test scope -->
</project>`,
tests:[{d:'Has the GAV coordinates',re:'<groupId>com\\.example\\.dojo</groupId>[\\s\\S]*<artifactId>hello-maven</artifactId>[\\s\\S]*<version>0\\.1\\.0</version>'},{d:'Compiler release 21',re:'<maven\\.compiler\\.release>21</maven\\.compiler\\.release>'},{d:'JUnit dependency declared',re:'<artifactId>junit-jupiter</artifactId>'},{d:'Dependency is test-scoped',re:'<scope>test</scope>'}],
behavior:`1. XML is well-formed (tags balanced). 2. Project GAV = com.example.dojo:hello-maven:0.1.0. 3. properties contains maven.compiler.release = 21. 4. junit-jupiter 5.10.2 with scope test inside <dependencies><dependency>.`,
hints:['Coordinates are three top-level tags: <code>&lt;groupId&gt;</code>, <code>&lt;artifactId&gt;</code>, <code>&lt;version&gt;</code>.','Properties block: <code>&lt;properties&gt;&lt;maven.compiler.release&gt;21&lt;/maven.compiler.release&gt;&lt;/properties&gt;</code>','Each dependency needs its own GAV plus <code>&lt;scope&gt;test&lt;/scope&gt;</code>, nested in &lt;dependencies&gt;&lt;dependency&gt;.'],
solution:`<project>
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.example.dojo</groupId>
    <artifactId>hello-maven</artifactId>
    <version>0.1.0</version>

    <properties>
        <maven.compiler.release>21</maven.compiler.release>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter</artifactId>
            <version>5.10.2</version>
            <scope>test</scope>
        </dependency>
    </dependencies>
</project>`}},
{id:'bld2',title:'Maven: lifecycle, scopes & running tests',body:`
<p>Maven phases run in a fixed order; asking for one runs all before it: <code>validate → compile → test → package → verify → install → deploy</code>. Tests run via the Surefire plugin during <code>test</code>.</p>
<p>Dependency <b>scopes</b> control the classpath: <code>compile</code> (default, everywhere), <code>test</code> (tests only), <code>provided</code> (compile-time, container supplies at runtime), <code>runtime</code> (runtime only, e.g. JDBC drivers). Useful daily commands:</p>
<div class="codeSample">mvn test                       # run unit tests
mvn -Dtest=WalletTest test     # a single test class
mvn dependency:tree            # who pulls in what (conflict hunting!)
mvn clean package -DskipTests  # build the jar, skip tests
mvn versions:display-dependency-updates</div>
<p>Transitive conflicts are resolved "nearest wins" — <code>dependency:tree</code> is your debugger.</p>`,
docs:[['Build Lifecycle','https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html'],['Dependency Mechanism & scopes','https://maven.apache.org/guides/introduction/introduction-to-dependency-mechanism.html']],
ex:{title:'Lifecycle quiz — in commands',lang:'shell',
prompt:`Write, one per line, the Maven commands to: (1) delete previous build output and run the full test suite, (2) run only the class <code>AuthTokenTest</code>, (3) print the dependency tree, (4) build the jar while skipping tests.`,
starter:`# 1) clean + tests

# 2) only AuthTokenTest

# 3) dependency tree

# 4) jar without tests
`,
tests:[{d:'clean test',re:'mvn\\s+clean\\s+test'},{d:'Single test via -Dtest',re:'-Dtest=AuthTokenTest'},{d:'dependency:tree',re:'mvn\\s+dependency:tree'},{d:'package with -DskipTests',re:'mvn[^\\n]*package[^\\n]*-DskipTests|mvn[^\\n]*-DskipTests[^\\n]*package'}],
behavior:`1. Line for (1) is "mvn clean test". 2. (2) uses -Dtest=AuthTokenTest with the test phase. 3. (3) is "mvn dependency:tree". 4. (4) runs package with -DskipTests.`,
hints:['Phases chain: <code>mvn clean test</code> cleans then runs everything through test.','Surefire filter: <code>mvn -Dtest=AuthTokenTest test</code>','The tree is a plugin goal, not a phase: <code>mvn dependency:tree</code>'],
solution:`# 1) clean + tests
mvn clean test

# 2) only AuthTokenTest
mvn -Dtest=AuthTokenTest test

# 3) dependency tree
mvn dependency:tree

# 4) jar without tests
mvn clean package -DskipTests`}},
{id:'bld3',title:'Gradle: build scripts & tasks',body:`
<p>Gradle describes builds as a graph of <b>tasks</b>, configured in <code>build.gradle</code> (Groovy) or <code>build.gradle.kts</code> (Kotlin). Same conventions as Maven (source sets), but faster: incremental builds, build cache, and the Gradle wrapper (<code>./gradlew</code>) pins the Gradle version per project.</p>
<div class="codeSample">plugins {
    id 'java'
    id 'application'
}

group = 'com.example.dojo'
version = '0.1.0'

repositories { mavenCentral() }

dependencies {
    implementation 'com.fasterxml.jackson.core:jackson-databind:2.17.1'
    testImplementation 'org.junit.jupiter:junit-jupiter:5.10.2'
}

test { useJUnitPlatform() }

application { mainClass = 'com.example.dojo.Main' }</div>
<p><code>implementation</code> ≈ Maven compile (but hidden from consumers' compile classpath), <code>testImplementation</code> ≈ test scope, <code>api</code> leaks to consumers (library projects only). Run: <code>./gradlew build</code>, <code>./gradlew test</code>, <code>./gradlew run</code>, <code>./gradlew tasks</code>.</p>`,
docs:[['Gradle User Manual','https://docs.gradle.org/current/userguide/userguide.html'],['Java plugin & dependency configurations','https://docs.gradle.org/current/userguide/java_plugin.html']],
ex:{title:'Write a build.gradle',lang:'groovy',
prompt:`Write a <code>build.gradle</code> that: applies the <code>java</code> plugin, uses <code>mavenCentral()</code>, declares <code>com.google.code.gson:gson:2.11.0</code> as <code>implementation</code> and <code>org.junit.jupiter:junit-jupiter:5.10.2</code> as <code>testImplementation</code>, and configures the test task with <code>useJUnitPlatform()</code>.`,
starter:`plugins {
    // java plugin
}

repositories {
    // where dependencies come from
}

dependencies {
    // gson: implementation, junit: testImplementation
}

// configure test task for JUnit 5
`,
tests:[{d:'Applies java plugin',re:"id\\s+['\\\"]java['\\\"]"},{d:'mavenCentral repository',re:'mavenCentral\\s*\\(\\s*\\)'},{d:'gson as implementation',re:"implementation\\s+['\\\"]com\\.google\\.code\\.gson:gson:2\\.11\\.0['\\\"]"},{d:'junit as testImplementation',re:"testImplementation\\s+['\\\"]org\\.junit\\.jupiter:junit-jupiter"},{d:'useJUnitPlatform configured',re:'useJUnitPlatform\\s*\\(\\s*\\)'}],
behavior:`1. plugins block contains id 'java'. 2. repositories has mavenCentral(). 3. Both dependencies in the right configurations. 4. test { useJUnitPlatform() } present. 5. Valid Groovy DSL structure.`,
hints:["Plugins block: <code>plugins { id 'java' }</code>","Dependency line: <code>implementation 'group:artifact:version'</code> — single string, colon-separated.","JUnit 5 needs: <code>test { useJUnitPlatform() }</code> or tests silently don't run."],
solution:`plugins {
    id 'java'
}

repositories {
    mavenCentral()
}

dependencies {
    implementation 'com.google.code.gson:gson:2.11.0'
    testImplementation 'org.junit.jupiter:junit-jupiter:5.10.2'
}

test {
    useJUnitPlatform()
}`}},
{id:'bld4',title:'Maven vs Gradle & multi-module thinking',body:`
<p>Choosing and scaling:</p>
<ul>
<li><b>Maven</b>: rigid lifecycle, XML, enormous ecosystem, effortless onboarding — most enterprises (and most Spring docs) speak Maven.</li>
<li><b>Gradle</b>: programmable, faster (incremental + cache + daemon), first-class for Android/Kotlin; complexity can grow unchecked.</li>
<li>Both: wrapper scripts commit the build tool version into the repo (<code>mvnw</code>, <code>gradlew</code>) — always use the wrapper in CI.</li>
</ul>
<p>Multi-module: a parent POM (<code>&lt;packaging&gt;pom&lt;/packaging&gt;</code>, <code>&lt;modules&gt;</code>) or Gradle <code>settings.gradle</code> with <code>include 'api', 'core'</code>. Share versions centrally: Maven <code>&lt;dependencyManagement&gt;</code>, Gradle version catalogs (<code>libs.versions.toml</code>). A Spring Boot project typically inherits <code>spring-boot-starter-parent</code> precisely to get managed versions.</p>`,
docs:[['Maven multi-module','https://maven.apache.org/guides/mini/guide-multiple-modules.html'],['Gradle version catalogs','https://docs.gradle.org/current/userguide/version_catalogs.html']],
ex:{title:'Wrapper & structure drill',lang:'shell',
prompt:`One per line: (1) the command to run tests using the <b>Maven wrapper</b>, (2) the command to run tests using the <b>Gradle wrapper</b>, (3) the settings.gradle line that includes modules <code>api</code> and <code>core</code>, (4) the Maven packaging value a parent aggregator POM must declare (write it as the full XML tag).`,
starter:`# 1) maven wrapper, tests

# 2) gradle wrapper, tests

# 3) settings.gradle include line

# 4) parent POM packaging tag
`,
tests:[{d:'./mvnw test',re:'\\./mvnw\\s+(clean\\s+)?test'},{d:'./gradlew test',re:'\\./gradlew\\s+test'},{d:"include 'api', 'core'",re:"include\\s+['\\\"]api['\\\"]\\s*,\\s*['\\\"]core['\\\"]"},{d:'<packaging>pom</packaging>',re:'<packaging>pom</packaging>'}],
behavior:`1. Uses ./mvnw not mvn. 2. Uses ./gradlew not gradle. 3. Valid Groovy include line with both module names. 4. Exact tag <packaging>pom</packaging>.`,
hints:['Wrappers live in the repo root: <code>./mvnw</code> and <code>./gradlew</code> — same arguments as the real tools.',"settings.gradle: <code>include 'api', 'core'</code>",'Aggregator POMs are not jars — their packaging is <code>pom</code>.'],
solution:`# 1) maven wrapper, tests
./mvnw test

# 2) gradle wrapper, tests
./gradlew test

# 3) settings.gradle include line
include 'api', 'core'

# 4) parent POM packaging tag
<packaging>pom</packaging>`}},
{id:'bld5',title:'Project setup like a senior engineer',body:`
<p>What a senior's "new project" checklist actually contains, and why:</p>
<div class="codeSample">my-service/
├── mvnw / mvnw.cmd / .mvn/          # wrapper COMMITTED — identical builds everywhere
├── pom.xml                          # pinned versions, compiler release set
├── .gitignore                       # target/, build/, .idea/, *.iml, .DS_Store
├── .editorconfig                    # indentation/encoding enforced across IDEs
├── README.md                        # how to build, run, test — in 5 lines
├── .github/workflows/ci.yml        # CI from commit #1, not "later"
└── src/
    ├── main/java/com/example/svc/   # package = reversed domain, matches dirs
    ├── main/resources/              # application.properties, db/migration/
    ├── test/java/com/example/svc/   # mirrors main — tooling depends on this
    └── test/resources/</div>
<p><b>Under the hood</b>, when you run <code>./mvnw verify</code>: the wrapper downloads the pinned Maven version → Maven reads the POM, resolves the dependency graph (local cache <code>~/.m2</code> first, then Central), builds the compile/test classpaths → plugins bound to each lifecycle phase run in order (compiler → surefire tests → jar → failsafe). "Convention over configuration" is why there is no config for any of this: the standard layout IS the contract the plugins rely on.</p>
<p>The senior habits: wrapper committed (never "install maven 3.9 first"), versions pinned (no version ranges), formatter + linter as build plugins (Spotless — style debates end), tests and CI wired before the first feature, one-command onboarding (<code>git clone && ./mvnw verify</code> must just work), and a <code>.gitignore</code> that keeps build output and IDE noise out of review forever.</p>`,
docs:[['Standard directory layout — Maven','https://maven.apache.org/guides/introduction/introduction-to-the-standard-directory-layout.html'],['Maven wrapper','https://maven.apache.org/wrapper/'],['Spotless plugin','https://github.com/diffplug/spotless']],
ex:{title:'Bootstrap checklist',lang:'shell',
prompt:`One per numbered line: (1) the command that adds the Maven wrapper to a project, (2) the three most important <code>.gitignore</code> entries for a Maven + IntelliJ project (one line, space-separated), (3) the standard directory for production code of package <code>com.example.svc</code> (full path from project root), (4) the single command a new teammate should need after cloning, (5) which file pins the exact Maven version the wrapper uses.`,
starter:`# 1)

# 2)

# 3)

# 4)

# 5)
`,
tests:[{d:'Wrapper goal',re:'mvn\\s+wrapper:wrapper'},{d:'Ignores target, .idea and *.iml',re:'target/?\\s+\\.idea/?\\s+\\*\\.iml'},{d:'Standard source path with package dirs',re:'src/main/java/com/example/svc'},{d:'One-command onboarding via the wrapper',re:'\\./mvnw\\s+(clean\\s+)?(verify|install|test)'},{d:'maven-wrapper.properties pins the version',re:'maven-wrapper\\.properties'}],
behavior:`1. (1) mvn wrapper:wrapper (thereafter it's ./mvnw for everyone). 2. (2) target/ .idea/ *.iml. 3. (3) src/main/java/com/example/svc — package segments become directories. 4. (4) ./mvnw verify (or clean verify) — clone-to-green in one command. 5. (5) .mvn/wrapper/maven-wrapper.properties (the distributionUrl line).`,
hints:['The wrapper is itself installed by Maven once: <code>mvn wrapper:wrapper</code> — after that, the wrapper is what everyone (and CI) runs.','Ignore generated things: build output (target/), IDE state (.idea/, *.iml). Never ignore the wrapper files.','Convention: package com.example.svc ⇒ src/main/java/com/example/svc — plugins assume it, so do not fight it.'],
solution:`# 1)
mvn wrapper:wrapper

# 2)
target/ .idea/ *.iml

# 3)
src/main/java/com/example/svc

# 4)
./mvnw verify

# 5)
.mvn/wrapper/maven-wrapper.properties`}}
]});
