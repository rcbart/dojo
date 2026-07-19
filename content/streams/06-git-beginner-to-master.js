STREAMS.push({icon:'🌿',title:'Git: Beginner to Master',blurb:'From your first commit to rebase, bisect and disaster recovery — with hands-on command exercises.',lessons:[
{id:'git1',title:'Snapshots: init, add, commit',body:`
<p>Git stores <b>snapshots</b> of your whole project, not diffs. Files move through three zones: <i>working directory</i> → (<code>git add</code>) → <i>staging area</i> → (<code>git commit</code>) → <i>repository history</i>. The staging area is the feature beginners skip and masters lean on: you choose exactly what goes into each commit.</p>
<div class="codeSample">git init                 # new repo in this folder
git status               # what changed, what's staged
git add Wallet.java      # stage one file
git add -p               # stage interactively, hunk by hunk (master habit)
git commit -m "Add wallet with overdraw guard"
git log --oneline        # history, one line per commit
git diff                 # unstaged changes;  --staged for staged ones</div>
<p>Commit messages: imperative mood, say <i>why</i> not just what. Small, focused commits make review and revert possible.</p>`,
docs:[['Pro Git book — Getting Started','https://git-scm.com/book/en/v2/Getting-Started-Git-Basics'],['git commit — reference','https://git-scm.com/docs/git-commit']],
ex:{title:'First repository',lang:'shell',
prompt:`Write the command sequence (one per line) to: create a repo, check its status, stage only <code>Main.java</code>, commit with message <code>Initial commit</code>, then show the compact one-line history.`,
starter:`# your commands:
`,
tests:[{d:'git init',re:'git\\s+init'},{d:'git status',re:'git\\s+status'},{d:'Stages only Main.java (not .)',re:'git\\s+add\\s+Main\\.java'},{d:'Commit with -m message',re:'git\\s+commit\\s+-m\\s+.Initial commit.'},{d:'Compact log',re:'git\\s+log\\s+--oneline'}],
behavior:`1. Order is init → status → add → commit → log. 2. add targets Main.java specifically, not "git add ." . 3. Commit message exactly "Initial commit" quoted. 4. Log uses --oneline.`,
hints:['Start with <code>git init</code>, and make <code>git status</code> your reflex after every step.','Stage a specific file by naming it: <code>git add Main.java</code>.','<code>git commit -m "Initial commit"</code> then <code>git log --oneline</code>.'],
solution:`git init
git status
git add Main.java
git commit -m "Initial commit"
git log --oneline`}},
{id:'git2',title:'Branching & merging',body:`
<p>A branch is just a movable pointer to a commit — creating one is free. Work on feature branches; keep <code>main</code> releasable.</p>
<div class="codeSample">git switch -c feature/login   # create + switch (modern syntax)
# ...commit work...
git switch main
git merge feature/login       # fast-forward if main didn't move
git branch -d feature/login   # delete merged branch

# conflict flow:
# 1. git merge marks conflicted files with &lt;&lt;&lt;&lt;&lt;&lt;&lt; ======= &gt;&gt;&gt;&gt;&gt;&gt;&gt;
# 2. edit files, keep what's right
# 3. git add &lt;file&gt;   →   git commit</div>
<p>Merge keeps true history (a merge commit); conflicts are normal, not an emergency — Git is asking you to decide, once, and record the decision.</p>`,
docs:[['Branching — Pro Git','https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging'],['git switch — reference','https://git-scm.com/docs/git-switch']],
ex:{title:'Feature branch cycle',lang:'shell',
prompt:`Commands, one per line: create-and-switch to branch <code>feature/jwt</code>, stage <b>all</b> changes, commit <code>Add JWT validation</code>, switch back to <code>main</code>, merge the feature branch, delete it (it is merged).`,
starter:`# feature branch workflow:
`,
tests:[{d:'Creates + switches in one command',re:'git\\s+(switch\\s+-c|checkout\\s+-b)\\s+feature/jwt'},{d:'Stages all changes',re:'git\\s+add\\s+(\\.|-A|--all)'},{d:'Commits with message',re:'git\\s+commit\\s+-m\\s+.Add JWT validation.'},{d:'Returns to main',re:'git\\s+(switch|checkout)\\s+main'},{d:'Merges then deletes the branch',re:'git\\s+merge\\s+feature/jwt[\\s\\S]*git\\s+branch\\s+-d\\s+feature/jwt'}],
behavior:`1. switch -c (or checkout -b) creates feature/jwt. 2. Work committed on the branch. 3. Merge happens FROM main (switch back first). 4. branch -d only after merge (order matters).`,
hints:['Modern create+switch: <code>git switch -c feature/jwt</code>.','You merge INTO the branch you are on — so switch to main before merging.','<code>git branch -d</code> (lowercase d) refuses to delete unmerged work — that is a safety feature.'],
solution:`git switch -c feature/jwt
git add .
git commit -m "Add JWT validation"
git switch main
git merge feature/jwt
git branch -d feature/jwt`}},
{id:'git3',title:'Remotes: clone, push, pull & the PR flow',body:`
<p>A remote is a repo elsewhere (GitHub/GitLab). <code>origin</code> is the default name of the one you cloned from.</p>
<div class="codeSample">git clone git@github.com:acme/api-platform.git
git remote -v                     # list remotes
git fetch                         # download refs, touch nothing local
git pull                          # fetch + merge into current branch
git push -u origin feature/jwt    # publish branch, set upstream (-u once)
git pull --rebase                 # replay local commits on top (linear)</div>
<p>The pull-request flow: branch → commit → push → open PR → review → merge → <code>git pull</code> on main → delete branch. <b>fetch vs pull</b>: fetch is always safe; pull changes your working branch. Masters fetch first and look before merging.</p>`,
docs:[['Working with Remotes — Pro Git','https://git-scm.com/book/en/v2/Git-Basics-Working-with-Remotes'],['GitHub PR docs','https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests']],
ex:{title:'Publish a branch',lang:'shell',
prompt:`Commands, one per line: clone <code>git@github.com:acme/ciam.git</code>, create-and-switch to <code>fix/token-expiry</code>, commit all staged work with message <code>Fix token expiry check</code> (assume already staged), push the branch <b>setting its upstream</b>, and finally fetch the latest remote state without changing anything local.`,
starter:`# remote workflow:
`,
tests:[{d:'Clones the repo',re:'git\\s+clone\\s+git@github\\.com:acme/ciam\\.git'},{d:'Creates fix/token-expiry',re:'git\\s+(switch\\s+-c|checkout\\s+-b)\\s+fix/token-expiry'},{d:'Commits',re:'git\\s+commit\\s+-m\\s+.Fix token expiry check.'},{d:'Pushes with upstream (-u / --set-upstream)',re:'git\\s+push\\s+(-u|--set-upstream)\\s+origin\\s+fix/token-expiry'},{d:'Safe fetch at the end',re:'git\\s+fetch'}],
behavior:`1. Clone URL exact. 2. Branch created before committing. 3. push uses -u origin fix/token-expiry so future pushes are just "git push". 4. Last command is fetch (not pull).`,
hints:['<code>git push -u origin &lt;branch&gt;</code> — the -u links the local branch to the remote one, once.','fetch downloads and stops; pull would also merge. The prompt asks for the safe one.','Branch names with slashes (fix/…) are fine — they are just names.'],
solution:`git clone git@github.com:acme/ciam.git
git switch -c fix/token-expiry
git commit -m "Fix token expiry check"
git push -u origin fix/token-expiry
git fetch`}},
{id:'git4',title:'Undo: restore, reset, revert, stash',body:`
<p>Four different "undos" — using the wrong one is how history gets eaten:</p>
<div class="codeSample">git restore Wallet.java          # discard UNSTAGED edits to a file
git restore --staged Wallet.java # unstage (keep the edits)
git stash                        # shelve dirty work; git stash pop to restore
git revert a1b2c3                # NEW commit that undoes a1b2c3 — safe on shared branches
git reset --soft HEAD~1          # undo last commit, keep changes staged
git reset --hard HEAD~1          # DESTROY last commit + changes (local only!)
git reflog                       # where HEAD has been — the disaster recovery log</div>
<p>Golden rules: <b>revert</b> on anything already pushed; <b>reset</b> only on local commits; when everything looks lost, <code>git reflog</code> almost always gets it back.</p>`,
docs:[['Undoing Things — Pro Git','https://git-scm.com/book/en/v2/Git-Basics-Undoing-Things'],['git reset demystified','https://git-scm.com/book/en/v2/Git-Tools-Reset-Demystified']],
ex:{title:'Choose the right undo',lang:'shell',
prompt:`For each scenario write ONE command on the numbered line: (1) throw away your uncommitted edits to <code>Auth.java</code>, (2) unstage <code>Auth.java</code> but keep the edits, (3) undo commit <code>abc123</code> that is <b>already pushed to main</b>, (4) shelve all your dirty work quickly to switch branches, (5) show the log of everywhere HEAD has pointed (your safety net).`,
starter:`# 1)

# 2)

# 3)

# 4)

# 5)
`,
tests:[{d:'restore for working-dir edits',re:'git\\s+restore\\s+Auth\\.java'},{d:'restore --staged to unstage',re:'git\\s+restore\\s+--staged\\s+Auth\\.java'},{d:'revert (NOT reset) for pushed commit',re:'git\\s+revert\\s+abc123'},{d:'stash the dirty work',re:'git\\s+stash'},{d:'reflog as the safety net',re:'git\\s+reflog'}],
behavior:`1. (1) is restore without --staged. 2. (2) adds --staged. 3. (3) must be revert — reset would rewrite shared history. 4. (4) git stash. 5. (5) git reflog. Using reset --hard for (3) is an automatic fail.`,
hints:['restore touches the working directory by default; add <code>--staged</code> to touch the index instead.','Already pushed ⇒ never rewrite: <code>git revert</code> creates a new commit that cancels the old one.','<code>git reflog</code> lists every position HEAD has had — you can reset back to any of them.'],
solution:`# 1)
git restore Auth.java

# 2)
git restore --staged Auth.java

# 3)
git revert abc123

# 4)
git stash

# 5)
git reflog`}},
{id:'git5',title:'Mastery: rebase, interactive rebase, cherry-pick, bisect',body:`
<p>The power tools — all rewrite or navigate history, so the prime directive applies: <b>never rewrite commits that others may have pulled.</b></p>
<div class="codeSample">git rebase main                # replay your branch onto latest main (linear history)
git rebase -i HEAD~3           # interactive: reorder / squash / reword last 3
#   pick a1 Add endpoint
#   squash b2 fix typo         ← melts into the commit above
#   reword c3 Add tests        ← stop to edit the message
git cherry-pick d4e5f6         # copy one commit onto this branch (hotfixes)
git bisect start
git bisect bad                 # current commit is broken
git bisect good v1.4.0         # this tag was fine → binary search begins
git bisect reset               # done — Git found the guilty commit</div>
<p>Typical pro flow: rebase your feature branch on main before opening the PR, squash the "fix typo" noise with <code>-i</code>, and let bisect find regressions in log₂(n) steps.</p>`,
docs:[['Rewriting History — Pro Git','https://git-scm.com/book/en/v2/Git-Tools-Rewriting-History'],['git bisect — reference','https://git-scm.com/docs/git-bisect']],
ex:{title:'Master moves',lang:'shell',
prompt:`One command per numbered line: (1) replay your current feature branch onto the latest <code>main</code>, (2) open an interactive rebase over the last 4 commits, (3) copy commit <code>9f8e7d</code> from another branch onto this one, (4) start a bisect session, (5) during bisect, mark the current commit broken, (6) mark tag <code>v2.1.0</code> as the last known good.`,
starter:`# 1)

# 2)

# 3)

# 4)

# 5)

# 6)
`,
tests:[{d:'rebase onto main',re:'git\\s+rebase\\s+main'},{d:'interactive over last 4',re:'git\\s+rebase\\s+-i\\s+HEAD~4'},{d:'cherry-pick the commit',re:'git\\s+cherry-pick\\s+9f8e7d'},{d:'bisect start',re:'git\\s+bisect\\s+start'},{d:'bisect bad + good v2.1.0',re:'git\\s+bisect\\s+bad[\\s\\S]*git\\s+bisect\\s+good\\s+v2\\.1\\.0'}],
behavior:`1. Six commands in order. 2. Interactive rebase uses -i HEAD~4. 3. cherry-pick with the exact hash. 4. bisect sequence: start, bad, good v2.1.0 — after which Git checks out the midpoint automatically.`,
hints:['(1) from the feature branch: <code>git rebase main</code> — your commits are replayed on top.','(2) <code>-i HEAD~N</code> covers the last N commits.','bisect is a conversation: <code>start</code>, then alternate <code>bad</code>/<code>good</code> marks until Git names the culprit.'],
solution:`# 1)
git rebase main

# 2)
git rebase -i HEAD~4

# 3)
git cherry-pick 9f8e7d

# 4)
git bisect start

# 5)
git bisect bad

# 6)
git bisect good v2.1.0`}}
]});
