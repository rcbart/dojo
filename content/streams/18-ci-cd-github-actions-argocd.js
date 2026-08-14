STREAMS.push({icon:'🔁',title:'CI/CD: GitHub Actions & ArgoCD',blurb:'From "what is CD, actually?" through GitHub Actions pipelines to pull-based GitOps deployment with ArgoCD.',lessons:[
{id:'cicd1',title:'What CI and CD actually are',body:`
<p>Three letters, three distinct practices — people conflate them constantly:</p>
<ul>
<li><b>Continuous Integration (CI)</b>: every push to the shared branch triggers an automated build and the full test suite. The point is <i>small batches</i>: integrating twice a day surfaces conflicts and breakage while the change is still tiny and fresh in your head. No green pipeline → no merge.</li>
<li><b>Continuous Delivery (CD #1)</b>: every commit that passes CI is automatically packaged into a <i>deployable artifact</i> (a versioned jar, a tagged Docker image) so that releasing is a <b>business decision, not an engineering scramble</b>. A human still presses the button.</li>
<li><b>Continuous Deployment (CD #2)</b>: nobody presses the button. Passing the pipeline <i>is</i> the release — every green commit rolls to production automatically. Requires serious test coverage, monitoring, and fast rollback.</li>
</ul>
<p>The pipeline is a funnel — each stage cheaper to fail in than the next:</p>
<div class="codeSample">push → compile → unit tests → package image → integration tests → deploy to staging → (gate) → production
        seconds     seconds       ~1 min          minutes             minutes         approval/auto</div>
<p><b>Why it matters</b>: teams that deploy small changes frequently have <i>fewer</i> incidents, not more — each deploy carries less risk, and rollback is trivial because the previous artifact is one tag away. The DORA metrics (deploy frequency, lead time, change-failure rate, time-to-restore) all improve together.</p>
<p>Vocabulary you will use in the next lessons: an <b>artifact</b> (the immutable build output), an <b>environment</b> (dev/staging/prod — same artifact, different config), a <b>gate</b> (a manual or automated check between environments), and <b>rollback</b> (redeploying the previous artifact — never "fix forward under pressure" as plan A).</p>`,
docs:[['Continuous Delivery — Martin Fowler','https://martinfowler.com/bliki/ContinuousDelivery.html'],['DORA research: Accelerate metrics','https://dora.dev/guides/dora-metrics-four-keys/'],['CI — Martin Fowler','https://martinfowler.com/articles/continuousIntegration.html']],
ex:{title:'CI/CD literacy drill',lang:'text',
prompt:`One answer per numbered line — this drill checks you can tell the practices apart: (1) the practice where every push runs build + tests on a shared branch (two words or the abbreviation), (2) in <b>continuous delivery</b>, who or what decides a release ships: <code>human</code> or <code>pipeline</code>? (3) in <b>continuous deployment</b>: <code>human</code> or <code>pipeline</code>? (4) the name for the immutable build output a pipeline produces (one word), (5) the safest first response to a bad production deploy: <code>rollback</code> or <code>hotfix</code>? (6) do small frequent deploys carry <code>more</code> or <code>less</code> risk per deploy than big rare ones?`,
starter:`1.
2.
3.
4.
5.
6.
`,
solution:`1. continuous integration
2. human
3. pipeline
4. artifact
5. rollback
6. less
`,
tests:[{d:'Q1: continuous integration (or CI)',re:'1\\.\\s*(continuous\\s+integration|ci)\\b',flags:'is'},{d:'Q2: human decides in delivery',re:'2\\.\\s*human',flags:'is'},{d:'Q3: pipeline decides in deployment',re:'3\\.\\s*pipeline',flags:'is'},{d:'Q4: artifact',re:'4\\.\\s*artifact',flags:'is'},{d:'Q5: rollback first',re:'5\\.\\s*rollback',flags:'is'},{d:'Q6: less risk',re:'6\\.\\s*less',flags:'is'}],
behavior:`1. Line 1 names continuous integration (CI accepted). 2. Line 2 says human — delivery keeps a person on the button. 3. Line 3 says pipeline — deployment automates the button away. 4. Line 4 names the artifact. 5. Line 5 chooses rollback — redeploying the known-good artifact beats debugging under fire. 6. Line 6 says less — small batches spread risk thin.`,
hints:['Delivery vs deployment is exactly one word of difference: who presses the button.','An artifact is immutable — the SAME jar/image moves through staging and prod; only config differs.','Rollback is cheap precisely because CD keeps the previous artifact one tag away.']}},

{id:'cicd2',title:'GitHub Actions: workflow anatomy',body:`
<p>GitHub Actions is CI/CD hosted inside your repo. One YAML file in <code>.github/workflows/</code> = one <b>workflow</b>. The anatomy:</p>
<div class="codeSample">name: ci                      # display name
on:                           # ── TRIGGERS: which events start it
  push:
    branches: [main]
  pull_request:               # also on every PR
jobs:                         # ── JOBS: run in PARALLEL by default,
  build:                      #    each on a fresh virtual machine
    runs-on: ubuntu-latest    # the runner
    steps:                    # ── STEPS: run in SEQUENCE inside the job
      - uses: actions/checkout@v4          # "uses" = a published action
      - run: ./mvnw -q verify              # "run"  = a shell command
  lint:
    runs-on: ubuntu-latest
    steps: [ ... ]
  deploy:
    needs: [build, lint]      # "needs" turns parallel into a DAG
    steps: [ ... ]</div>
<p>The pieces that matter:</p>
<ul>
<li><b>Events</b> (<code>on:</code>): push, pull_request, schedule (cron), workflow_dispatch (manual button), tag pushes for releases.</li>
<li><b>Jobs are isolated VMs</b> — nothing survives between jobs unless you pass it (upload-artifact / download-artifact). Steps within a job share the filesystem.</li>
<li><b>uses vs run</b>: <code>uses:</code> pulls a versioned, reusable action from the marketplace (checkout, setup-java, docker/build-push-action); <code>run:</code> is your own shell.</li>
<li><b>Secrets</b>: stored in repo Settings → Secrets, injected as <code>\${{ secrets.MY_KEY }}</code> — never hardcode credentials in the YAML (it is versioned, forkable, and public-ish forever).</li>
<li><b>Contexts</b>: <code>\${{ github.sha }}</code>, <code>\${{ github.actor }}</code>, <code>\${{ secrets.* }}</code> — template expressions GitHub substitutes before the step runs.</li>
</ul>

<h4>What actually triggers a run, and why that is a security question</h4>
<p>The <code>on:</code> block decides when a workflow runs, and the difference between
<code>pull_request</code> and <code>pull_request_target</code> is the one to understand rather than copy.
<code>pull_request</code> runs the workflow <i>from the pull request</i> with no access to your secrets.
<code>pull_request_target</code> runs the workflow <i>from your default branch</i> with secrets available —
which is safe only if it never checks out and executes the contributor's code. Getting that pair backwards
on a public repository hands your secrets to anyone who can open a pull request.</p>

<h4>Jobs, steps and the thing people get wrong about state</h4>
<p>Steps within a job share a runner and a working directory. <b>Jobs do not.</b> Each job gets a fresh
machine, so anything one job produces and another needs must travel through an artifact or a cache — and
each <code>run:</code> step is its own shell, so a <code>cd</code> or an exported variable does not survive
to the next step unless you write it to <code>$GITHUB_ENV</code>.</p>
<div class="codeSample">jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4          # pin actions; a moving tag is someone else's code
      - uses: actions/setup-java@v4
        with: { distribution: temurin, java-version: '21' }
      - run: ./mvnw -B verify              # -B: batch mode, no interactive progress spam</div>

<h4>Making it fast and making it honest</h4>
<p>Cache the dependency directory, not the build output — a cached <code>~/.m2</code> turns a three-minute
download into seconds, while caching compiled classes risks a stale build that passes. Use a matrix when
you genuinely support several versions, and remember every matrix cell is a full run: a three-by-three
matrix is nine machines and nine times the minutes.</p>
<p>And pin third-party actions. <code>@v4</code> is a moving tag that can be repointed, so a supply-chain
compromise upstream becomes your CI running someone else's code with your secrets. Pinning to a commit SHA
is the version of this advice that actually holds.</p>`,
docs:[['Workflow syntax reference','https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions'],['Events that trigger workflows','https://docs.github.com/en/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows'],['Using secrets','https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions']],
ex:{title:'Write a workflow skeleton',lang:'yaml',
prompt:`Write a complete workflow YAML named <code>greet</code> that: (1) triggers on <b>push to main only</b> and additionally on <b>manual dispatch</b> (<code>workflow_dispatch</code>); (2) has one job <code>hello</code> on <code>ubuntu-latest</code>; (3) first step <b>checks out the repo</b> with <code>actions/checkout@v4</code>; (4) second step is named <code>Say it</code> and runs the shell command <code>echo "hello \${{ github.actor }}"</code> — using the context expression so the pusher's username appears.`,
starter:`name: greet
# triggers here

# job here
`,
solution:`name: greet
on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  hello:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Say it
        run: echo "hello \${{ github.actor }}"
`,
tests:[{d:'Triggers on push to main',re:'on:[\\s\\S]*?push:[\\s\\S]*?branches:\\s*\\[?\\s*main'},{d:'Manual dispatch trigger present',re:'workflow_dispatch'},{d:'Job hello on ubuntu-latest',re:'hello:[\\s\\S]*?runs-on:\\s*ubuntu-latest'},{d:'Checkout step uses actions/checkout@v4',re:'uses:\\s*actions/checkout@v4'},{d:'Named step runs echo with github.actor context',re:'run:\\s*echo\\s+"hello\\s+\\$\\{\\{\\s*github\\.actor\\s*\\}\\}"'}],
behavior:`1. Pushing to main starts the workflow; pushing to any other branch does not. 2. The Actions tab shows a Run workflow button because of workflow_dispatch. 3. The job spins an ubuntu-latest VM, checks out the code, then prints hello <username-who-pushed>. 4. The \${{ github.actor }} expression is substituted by GitHub before the shell sees it.`,
hints:['Two triggers = two keys under on: — push (with branches: [main] nested) and workflow_dispatch (no value needed, just the key with a colon).','Steps is a YAML list: each - starts a step; a step has either uses: or run: (plus an optional name:).','Context expressions live inside \${{ ... }} — YAML treats the whole thing as a plain string.']}},

{id:'cicd3',title:'CI for Java, done properly',body:`
<p>A professional Java CI job does four things fast: restore caches, build+test, build the image, push it with a traceable tag. The reference workflow:</p>
<div class="codeSample">name: ci
on:
  push:
    branches: [main]
permissions:
  contents: read
  packages: write            # allowed to push to GHCR
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: 21
          cache: maven       # caches ~/.m2 keyed on pom.xml hash
      - run: ./mvnw -q clean verify        # verify = compile + unit + integration tests
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}   # auto-provided token
      - uses: docker/build-push-action@v6
        with:
          push: true
          tags: ghcr.io/\${{ github.repository }}:\${{ github.sha }}</div>
<p>The professional details:</p>
<ul>
<li><b>Cache the dependencies</b> — <code>cache: maven</code> on setup-java turns a 4-minute dependency download into seconds. Same for <code>cache: gradle</code>.</li>
<li><b>verify, not package</b> — <code>mvnw verify</code> runs the whole lifecycle through integration tests; <code>package -DskipTests</code> in CI is lying to yourself.</li>
<li><b>Tag images with the commit SHA</b> — <code>:latest</code> tells you nothing; <code>:\${{ github.sha }}</code> makes every running container traceable to the exact commit. Ship <code>:latest</code> as an <i>additional</i> tag if you like.</li>
<li><b>GITHUB_TOKEN over PATs</b> — the auto-provided token is scoped to this repo and expires with the run; a personal access token in a secret is a standing credential to steal.</li>
<li><b>permissions:</b> — default the workflow to read-only and grant <code>packages: write</code> explicitly. Least privilege applies to robots too.</li>
</ul>

<h4>Fast feedback is a design goal, not a nice-to-have</h4>
<p>A pipeline that takes twenty minutes changes behaviour: people stop waiting for it, batch their changes,
and merge on hope. Under five minutes it becomes part of the edit-run loop. That is worth optimising for
directly — cache dependencies, run the fast checks first so an obvious failure returns in seconds, and
parallelise the slow ones.</p>
<p>Order matters more than raw speed. Compile and unit tests before integration tests; static checks before
either. Failing in ninety seconds on a typo beats failing in twelve minutes on the same typo after the
container has been built.</p>

<h4>The traceability that makes an incident survivable</h4>
<p>Tag the image with the commit SHA, always, and use <code>:latest</code> only as an <i>additional</i>
tag. During an incident the question is "what exactly is running?", and <code>:latest</code> cannot answer
it — the digest pinned to a commit can. The same reasoning applies to build metadata: stamping the version,
commit and build time into the artifact costs nothing and turns a guess into a lookup.</p>

<h4>What CI must never contain</h4>
<ul>
<li><b>Secrets in the workflow file.</b> Use the platform's secret store, and prefer OIDC federation to a
long-lived cloud key entirely — the workload-identity argument from the identity course.</li>
<li><b><code>-DskipTests</code>.</b> A pipeline that builds without testing is a slower way to ship the
same bug.</li>
<li><b>Unpinned third-party actions.</b> A moving tag is someone else's code with access to your secrets.</li>
<li><b>Flaky tests left quarantined forever.</b> A test suite people re-run until it passes has stopped
being a gate — which is the same failure as a red build that gets overridden.</li>
</ul>`,
docs:[['setup-java action','https://github.com/actions/setup-java'],['build-push-action','https://github.com/docker/build-push-action'],['Publishing images to GHCR','https://docs.github.com/en/actions/use-cases-and-examples/publishing-packages/publishing-docker-images']],
ex:{title:'Write the Java CI workflow',lang:'yaml',
prompt:`Write the workflow: name <code>java-ci</code>, on push to main. Set top-level <code>permissions:</code> with <code>contents: read</code> and <code>packages: write</code>. One job <code>build</code> on ubuntu-latest with steps: (1) checkout v4; (2) <code>actions/setup-java@v4</code> with temurin, java-version 21 and <code>cache: maven</code>; (3) run <code>./mvnw -q clean verify</code>; (4) log in to <code>ghcr.io</code> with <code>docker/login-action@v3</code> using <code>\${{ github.actor }}</code> / <code>\${{ secrets.GITHUB_TOKEN }}</code>; (5) <code>docker/build-push-action@v6</code> with <code>push: true</code> and the image tagged <code>ghcr.io/\${{ github.repository }}:\${{ github.sha }}</code>.`,
starter:`name: java-ci
on:
  push:
    branches: [main]
`,
solution:`name: java-ci
on:
  push:
    branches: [main]
permissions:
  contents: read
  packages: write
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: 21
          cache: maven
      - run: ./mvnw -q clean verify
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}
      - uses: docker/build-push-action@v6
        with:
          push: true
          tags: ghcr.io/\${{ github.repository }}:\${{ github.sha }}
`,
tests:[{d:'Least-privilege permissions block',re:'permissions:[\\s\\S]*?contents:\\s*read[\\s\\S]*?packages:\\s*write'},{d:'setup-java v4 with temurin 21 and maven cache',re:'actions/setup-java@v4[\\s\\S]*?temurin[\\s\\S]*?java-version:\\s*.?21[\\s\\S]*?cache:\\s*maven'},{d:'Runs mvnw clean verify',re:'run:\\s*\\./mvnw\\s+-q\\s+clean\\s+verify'},{d:'GHCR login with GITHUB_TOKEN',re:'docker/login-action@v3[\\s\\S]*?ghcr\\.io[\\s\\S]*?secrets\\.GITHUB_TOKEN'},{d:'Pushes image tagged with the commit SHA',re:'build-push-action@v6[\\s\\S]*?push:\\s*true[\\s\\S]*?ghcr\\.io/\\$\\{\\{\\s*github\\.repository\\s*\\}\\}:\\$\\{\\{\\s*github\\.sha\\s*\\}\\}'},{d:'No PAT — only the auto-provided token',re:'secrets\\.(?!GITHUB_TOKEN)[A-Z_]+',not:true}],
behavior:`1. A push to main compiles, runs the full test suite, and (only if green) pushes ghcr.io/<owner>/<repo>:<full-sha>. 2. The second run is much faster — the Maven cache restores ~/.m2 keyed on the pom hash. 3. The workflow can read code and write packages, nothing else. 4. Every deployed container is traceable to a commit by its image tag.`,
hints:['permissions: is a TOP-LEVEL key (same indent as jobs:) — contents: read, packages: write nested under it.','setup-java takes with: distribution / java-version / cache — cache: maven is what makes run #2 fast.','The image tag combines two contexts back to back: ghcr.io/\${{ github.repository }}:\${{ github.sha }}.']}},

{id:'cicd4',title:'From CI to CD: environments & release strategies',body:`
<p>CI ends with a green artifact. CD is everything between that artifact and users — and it is mostly <i>risk management</i>:</p>
<ul>
<li><b>Environments</b>: the same image flows dev → staging → production; only configuration (env vars, secrets, replica counts) changes. GitHub Environments let you attach <b>required reviewers</b> to production — the "gate" from lesson 1, encoded in the platform.</li>
<li><b>Rolling deploy</b>: replace instances a few at a time behind the load balancer. Zero downtime, but two versions run simultaneously — your DB migrations must tolerate that (expand-then-contract: add the new column first, deploy code that writes both, remove the old column a release later).</li>
<li><b>Blue/green</b>: run the full new stack (green) beside the old (blue), flip traffic at the router, keep blue warm for instant rollback. Costs 2× capacity for the window.</li>
<li><b>Canary</b>: route 1-5% of real traffic to the new version, watch error rates and latency, then ramp. The most honest test there is — production traffic is the one workload you cannot simulate.</li>
<li><b>Rollback ≠ revert</b>: rollback redeploys the previous <i>artifact</i> (seconds); revert undoes the <i>commit</i> and rebuilds (minutes, plus review). Have both; reach for rollback first.</li>
</ul>
<p>One rule ties the room together: <b>the artifact is immutable</b>. If staging tested image <code>:abc123</code>, production runs <code>:abc123</code> — not a rebuild "of the same code". Rebuilds can differ (new base image, new dependency resolution); what you tested is what you ship.</p>

<h4>The database is what makes deployment hard</h4>
<p>Rolling deploys mean two versions of your code run at the same time, against one schema. That single
fact dictates the discipline: <b>expand, migrate, contract</b>. Add the new column, deploy code that writes
both old and new, backfill, deploy code that reads the new one, and only then remove the old — four
deploys, each of which is safe on its own, instead of one that must be perfect.</p>
<p>A destructive migration shipped alongside the code that needs it is the classic cause of an unrollable
deploy: the code can go back, the dropped column cannot.</p>

<h4>Choosing a release strategy by what it buys</h4>
<ul>
<li><b>Rolling</b> — cheapest, no extra capacity, two versions live. The default.</li>
<li><b>Blue-green</b> — full second environment, instant switch, instant rollback. You pay for double
capacity during the cutover and you still have the schema problem.</li>
<li><b>Canary</b> — a small share of real traffic on the new version while you watch error rate and
latency. The only strategy that gives you evidence before full exposure, and the only one that requires
you to have decided in advance what "bad" looks like.</li>
<li><b>Feature flags</b> — separate <i>deploying</i> from <i>releasing</i>, so the risky change ships dark
and is turned on independently. The cost is flag debt: every flag is a branch in production that someone
must eventually remove.</li>
</ul>

<h4>What makes a rollback real</h4>
<p>Rollback is not a plan, it is a rehearsed action with a number attached: how long does it take, who can
do it at 3am, and does it survive the migration you just ran? If the answer to any of those is unknown, you
have a forward-only deploy and should treat every release accordingly. The environments should differ only
in <b>configuration</b> — same image, different variables — because an artefact rebuilt per environment is
no longer the artefact you tested.`,
docs:[['GitHub Environments & protection rules','https://docs.github.com/en/actions/managing-workflow-runs-and-deployments/managing-deployments/managing-environments-for-deployment'],['Blue/green deployments — Fowler','https://martinfowler.com/bliki/BlueGreenDeployment.html'],['Canary release — Fowler','https://martinfowler.com/bliki/CanaryRelease.html']],
ex:{title:'Strategy triage',lang:'text',
prompt:`One answer per numbered line: (1) the strategy that replaces instances gradually behind a load balancer (one word), (2) the strategy that runs old and new stacks side by side and flips traffic at the router (two words, slash ok), (3) the strategy that sends a small % of real traffic to the new version first (one word), (4) staging tested image :abc123 — does production <code>rebuild</code> or <code>reuse</code> that image? (5) the migration discipline that lets two app versions share one schema during a rolling deploy (hyphenated phrase: ______-then-______), (6) which is faster to execute: <code>rollback</code> or <code>revert</code>?`,
starter:`1.
2.
3.
4.
5.
6.
`,
solution:`1. rolling
2. blue/green
3. canary
4. reuse
5. expand-then-contract
6. rollback
`,
tests:[{d:'Q1 rolling',re:'1\\.\\s*rolling',flags:'is'},{d:'Q2 blue/green',re:'2\\.\\s*blue[ /-]?green',flags:'is'},{d:'Q3 canary',re:'3\\.\\s*canary',flags:'is'},{d:'Q4 reuse the tested artifact',re:'4\\.\\s*reuse',flags:'is'},{d:'Q5 expand-then-contract',re:'5\\.\\s*expand[ -]?then[ -]?contract',flags:'is'},{d:'Q6 rollback is faster',re:'6\\.\\s*rollback',flags:'is'}],
behavior:`1. rolling — gradual instance replacement. 2. blue/green — two full stacks, router flip, blue kept warm. 3. canary — a trickle of real traffic as the final test. 4. reuse — immutable artifacts: what staging tested is byte-for-byte what prod runs. 5. expand-then-contract — schema tolerates both versions mid-rollout. 6. rollback — redeploying a kept artifact takes seconds; revert rebuilds.`,
hints:['Blue/green trades money (2× capacity during the window) for an instant, boring rollback.','Q5 is the database answer to "two versions run at once": ADD the column first, REMOVE it a release later.','Rollback moves a tag pointer; revert moves the git history AND waits for a rebuild.']}},

{id:'cicd5',title:'GitOps & ArgoCD: pull-based CD',body:`
<p>Everything so far <i>pushes</i>: the pipeline runs kubectl/ssh at the cluster. <b>GitOps inverts it</b> — you describe the desired state in a git repo, and an agent <i>inside the cluster</i> pulls and applies it:</p>
<div class="codeSample">PUSH CD:   pipeline ──(kubectl apply / ssh)──▶ cluster        # cluster creds live in CI
PULL CD:   gitops repo ◀──(watches)── agent in cluster        # creds never leave
                 ▲                        │ applies & reports
                 └── humans + CI commit ──┘</div>
<p>Why teams switch: the git repo becomes the <b>single source of truth</b> — every change is a reviewable PR, the audit log is git log, disaster recovery is "point a fresh cluster at the repo", and cluster credentials never sit in CI secrets.</p>
<p><b>ArgoCD</b> is the most used GitOps agent for Kubernetes. Its moving parts:</p>
<ul>
<li><b>repo-server</b> clones your gitops repo and renders manifests (plain YAML, Kustomize, or Helm).</li>
<li><b>application-controller</b> compares rendered (desired) state against live cluster state, reports <b>Sync status</b> (in sync / OutOfSync) and <b>Health</b> (Healthy / Progressing / Degraded), and applies diffs.</li>
<li><b>API/UI server</b> — the web UI where you see the app tree, diffs, and history.</li>
</ul>
<p>You register an app with an <b>Application</b> resource — "watch this repo path, apply it to that cluster/namespace":</p>
<div class="codeSample">apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: dojo-api
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/you/dojo-gitops
    targetRevision: main
    path: apps/dojo-api
  destination:
    server: https://kubernetes.default.svc
    namespace: dojo
  syncPolicy:
    automated:
      prune: true       # delete cluster resources removed from git
      selfHeal: true    # revert manual kubectl edits (drift)
    syncOptions:
      - CreateNamespace=true</div>
<p><code>prune</code> and <code>selfHeal</code> are the GitOps contract enforced: git says it → it exists; git doesn't → it goes; someone hand-edits the cluster → ArgoCD puts it back. "Drift" stops being a slow mystery and becomes a red OutOfSync badge.</p>`,
docs:[['ArgoCD — core concepts','https://argo-cd.readthedocs.io/en/stable/core_concepts/'],['Application specification','https://argo-cd.readthedocs.io/en/stable/user-guide/application-specification/'],['OpenGitOps principles','https://opengitops.dev/']],
ex:{title:'Write an Application manifest',lang:'yaml',
prompt:`Write the ArgoCD <code>Application</code> for a payments service: apiVersion <code>argoproj.io/v1alpha1</code>, kind <code>Application</code>, metadata name <code>payments</code> in namespace <code>argocd</code>. Spec: project <code>default</code>; source repo <code>https://github.com/acme/gitops</code>, targetRevision <code>main</code>, path <code>apps/payments</code>; destination server <code>https://kubernetes.default.svc</code>, namespace <code>payments</code>; and an <b>automated syncPolicy with both prune and selfHeal true</b>.`,
starter:`apiVersion:
kind:
`,
solution:`apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: payments
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/acme/gitops
    targetRevision: main
    path: apps/payments
  destination:
    server: https://kubernetes.default.svc
    namespace: payments
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
`,
tests:[{d:'Correct apiVersion and kind',re:'apiVersion:\\s*argoproj\\.io/v1alpha1[\\s\\S]*?kind:\\s*Application'},{d:'Named payments, lives in argocd namespace',re:'metadata:[\\s\\S]*?name:\\s*payments[\\s\\S]*?namespace:\\s*argocd'},{d:'Source: repo, revision main, path apps/payments',re:'source:[\\s\\S]*?repoURL:\\s*https://github\\.com/acme/gitops[\\s\\S]*?targetRevision:\\s*main[\\s\\S]*?path:\\s*apps/payments'},{d:'Destination: in-cluster, payments namespace',re:'destination:[\\s\\S]*?kubernetes\\.default\\.svc[\\s\\S]*?namespace:\\s*payments'},{d:'Automated sync with prune and selfHeal',re:'syncPolicy:[\\s\\S]*?automated:[\\s\\S]*?prune:\\s*true[\\s\\S]*?selfHeal:\\s*true'}],
behavior:`1. Applying this in the argocd namespace makes ArgoCD clone acme/gitops@main, render apps/payments, and apply it to the payments namespace of its own cluster. 2. Deleting a manifest from the repo deletes the resource (prune). 3. kubectl-editing a Deployment by hand gets reverted within the sync interval (selfHeal). 4. The UI shows payments as a tree with Sync and Health status.`,
hints:['The Application itself lives in namespace argocd; spec.destination.namespace is where the WORKLOAD goes — two different namespaces in one file.','https://kubernetes.default.svc is ArgoCD-speak for "this same cluster I am running in".','prune and selfHeal nest under syncPolicy.automated — both default false; you are opting into the full GitOps contract.']}},

{id:'cicd6',title:'The full pipeline: Actions + ArgoCD together',body:`
<p>The two tools meet at one commit. CI builds and tests the image; CD is <i>a git commit that changes which tag the gitops repo points at</i>. ArgoCD does the rest:</p>
<div class="codeSample">app repo push ─▶ Actions: test → build image ghcr.io/acme/api:SHA → push
                          │
                          └─▶ checkout gitops repo
                              kustomize edit set image api=ghcr.io/acme/api:SHA
                              git commit -m "api: deploy SHA" && git push
                                        │
gitops repo ◀─────────────────────────────┘
     ▲
ArgoCD watches ─▶ OutOfSync ─▶ sync ─▶ cluster runs :SHA   (rollback = git revert)</div>
<p>That middle step in Actions is just three shell lines (with a deploy key or app token for the gitops repo — this one <i>does</i> need a secret, scoped to that repo only):</p>
<div class="codeSample">- uses: actions/checkout@v4
  with:
    repository: acme/gitops
    token: \${{ secrets.GITOPS_TOKEN }}
- run: |
    cd apps/api
    kustomize edit set image api=ghcr.io/acme/api:\${{ github.sha }}
    git config user.name ci-bot && git config user.email ci@acme.dev
    git commit -am "api: deploy \${{ github.sha }}" && git push</div>
<p>Day-2 ArgoCD you should know: <b>sync waves</b> (<code>argocd.argoproj.io/sync-wave</code> annotations order db-migration Jobs before Deployments), <b>hooks</b> (PreSync migration Jobs), and the <b>CLI</b> for scripting and CI checks. Rollback in GitOps is beautifully boring: <code>git revert</code> the bump commit — ArgoCD sees the old tag and converges. The cluster followed git into the hole; it follows git back out.</p>

<h4>Why the two halves are separate on purpose</h4>
<p>The pipeline stops at the registry. Actions builds, tests and pushes an image; ArgoCD notices a changed
manifest and reconciles the cluster toward it. Nothing in CI holds cluster credentials, which is the point:
a compromised build job cannot deploy, because it has no way to reach production. It can only publish an
artefact and propose a change.</p>
<p>That separation also changes what "deployed" means. Push-based CD reports success when the deploy command
returns; pull-based CD reports it when the cluster's actual state matches the declared state — which is a
stronger claim, and the reason drift shows up as a status rather than as a surprise months later.</p>

<h4>The handover: how the image tag reaches the manifest</h4>
<p>Something has to write the new tag into the manifest repository, and this is where teams improvise
badly. The honest options: a CI step that commits the tag to the config repo, or an image updater watching
the registry. Either way, two rules hold. <b>Never deploy a mutable tag</b> such as <code>latest</code> —
pin the digest or an immutable tag, or you cannot say what is running. And <b>keep application and config
in separate repositories</b>, or the commit that updates the tag re-triggers the build that produced it.</p>

<h4>What to verify before calling it done</h4>
<ul>
<li><b>A rollback is a revert.</b> If going back means re-running a pipeline, you do not have GitOps yet —
you have a slower deploy.</li>
<li><b>The cluster is the source of truth for what IS; git is the source of truth for what SHOULD BE.</b>
Anyone who kubectl-edits production creates drift, and the reconciler either fights them or reports it.</li>
<li><b>Secrets are not in git</b>, sealed or external — the one thing the declarative model cannot take
literally.</li>
</ul>`,
docs:[['Kustomize — set image','https://kubectl.docs.kubernetes.io/references/kustomize/cmd/edit/setimage/'],['ArgoCD sync waves & hooks','https://argo-cd.readthedocs.io/en/stable/user_guide/sync-waves/'],['argocd CLI reference','https://argo-cd.readthedocs.io/en/stable/user_guide/commands/argocd_app/']],
ex:{title:'argocd CLI drill',lang:'shell',
prompt:`One command per numbered line, using the <code>argocd</code> CLI: (1) log in to server <code>argocd.acme.dev</code> (just the login command with the server host), (2) list all applications, (3) show the details/status of app <code>payments</code>, (4) trigger a sync of <code>payments</code>, (5) sync <code>payments</code> but only preview what would change (the diff, no apply — one command, it is not <code>sync</code>), (6) roll <code>payments</code> back to history id <code>7</code>.`,
starter:`1.
2.
3.
4.
5.
6.
`,
solution:`1. argocd login argocd.acme.dev
2. argocd app list
3. argocd app get payments
4. argocd app sync payments
5. argocd app diff payments
6. argocd app rollback payments 7
`,
tests:[{d:'login with server host',re:'1\\.\\s*argocd\\s+login\\s+argocd\\.acme\\.dev'},{d:'app list',re:'2\\.\\s*argocd\\s+app\\s+list'},{d:'app get payments',re:'3\\.\\s*argocd\\s+app\\s+get\\s+payments'},{d:'app sync payments',re:'4\\.\\s*argocd\\s+app\\s+sync\\s+payments'},{d:'diff previews without applying',re:'5\\.\\s*argocd\\s+app\\s+diff\\s+payments'},{d:'rollback to history 7',re:'6\\.\\s*argocd\\s+app\\s+rollback\\s+payments\\s+7'}],
behavior:`1. Line 1 authenticates the CLI against the ArgoCD API server. 2-3. list shows every Application with Sync/Health; get zooms into payments. 4. sync forces reconciliation now instead of waiting for the poll interval. 5. diff renders desired vs live and prints the delta — the safe preview. 6. rollback re-applies the manifests from history entry 7 (though in pure GitOps, git revert of the bump commit is the cleaner path — the repo stays truthful).`,
hints:['Every app command is argocd app <verb> — list, get, sync, diff, rollback.','diff is the read-only twin of sync: same comparison, no apply.','rollback takes the app name AND the numeric history id (argocd app history payments shows the ids).']}}
]});

