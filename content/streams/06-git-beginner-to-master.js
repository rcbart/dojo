STREAMS.push({icon:'🌿',title:'Git: Beginner to Master',blurb:'What version control actually is, one file through the full flow, then multiple files, remotes, branching — up to revert, rebase and the history-rewriting toolbox.',lessons:[
{id:'git0',title:'What Git is — and why',body:`
<p><b>Git is a version control system</b>: a program that records snapshots of your project so you can see every change ever made, undo any of them, and work on several ideas in parallel without copies like <code>Main_final_v2_REALLY.java</code>. It was built by Linus Torvalds in 2005 to manage Linux; today it is effectively the only game in town.</p>
<p><b>Why you need it</b> (even alone, even for one file): a complete history of who changed what and why, fearless experimentation (any state is recoverable), and — once remotes enter — the collaboration backbone of the entire industry. GitHub, GitLab, CI/CD, code review: all of it sits on git.</p>
<p><b>The model, in four ideas:</b></p>
<ul>
<li><b>Snapshots, not diffs.</b> A <b>commit</b> is a full snapshot of every tracked file, plus a message, an author, a timestamp, and a pointer to its parent commit. Diffs are <i>computed</i> between snapshots, not stored. Each commit is named by a hash like <code>a3f9c21</code> — the ids you'll pass to commands.</li>
<li><b>Three areas.</b> Your <b>working directory</b> (the files you edit) → the <b>staging area</b> (what you've marked for the next commit with <code>git add</code>) → the <b>repository</b> (the committed history, stored in the hidden <code>.git/</code> folder). The two-step add-then-commit lets you compose exactly what each commit contains.</li>
<li><b>Branches are pointers.</b> A branch is just a movable label on a commit; <b>HEAD</b> is "where you are now". Creating a branch copies nothing — it writes a 41-byte file. That's why git branching is fast and habitual, not ceremonial.</li>
<li><b>Everything is local.</b> Your clone contains the FULL history. Commits, diffs, branches, log — all instant, all offline. Remotes (coming two lessons from now) are just other copies you exchange commits with.</li>
</ul>
<div class="codeSample">working directory ──git add──▶ staging area ──git commit──▶ history (.git/)
   edit files          choose what ships          immutable snapshot chain
                                                  a3f9c21 ◀─ 7be02d4 ◀─ main ◀─ HEAD</div>`,
docs:[['Pro Git (free book) — What is Git?','https://git-scm.com/book/en/v2/Getting-Started-What-is-Git%3F'],['Git glossary','https://git-scm.com/docs/gitglossary'],['Git objects — Pro Git internals','https://git-scm.com/book/en/v2/Git-Internals-Git-Objects']],
ex:{title:'Mental-model check',lang:'text',
prompt:`One answer per numbered line: (1) does a commit store a full <code>snapshot</code> or a <code>diff</code>? (2) the area where changes wait between <code>git add</code> and <code>git commit</code> (two words), (3) the hidden folder holding the entire history (write it as the folder name), (4) a branch is best described as: a <code>copy</code> of the code or a <code>pointer</code> to a commit? (5) the name of the pointer that marks where you currently are (one word, caps ok), (6) true or false: you need a network connection to commit.`,
starter:`1.
2.
3.
4.
5.
6.
`,
solution:`1. snapshot
2. staging area
3. .git
4. pointer
5. HEAD
6. false
`,
tests:[{d:'Q1: snapshots, not diffs',re:'1\\.\\s*snapshot',flags:'is'},{d:'Q2: the staging area',re:'2\\.\\s*staging\\s*area',flags:'is'},{d:'Q3: .git folder',re:'3\\.\\s*\\.git\\b',flags:'is'},{d:'Q4: a branch is a pointer',re:'4\\.\\s*pointer',flags:'is'},{d:'Q5: HEAD',re:'5\\.\\s*head',flags:'is'},{d:'Q6: commits are local — false',re:'6\\.\\s*false',flags:'is'}],
behavior:`1. snapshot — git stores the whole tree per commit; diffs are derived on demand. 2. staging area (the index) — the composition surface for the next commit. 3. .git — delete it and the project becomes just files again. 4. pointer — which is why branches cost nothing. 5. HEAD — where the next commit will attach. 6. false — history is fully local; only clone/fetch/pull/push touch the network.`,
hints:['Two of the six answers (snapshot, pointer) correct the two most common wrong mental models about git.','The staging area is also called the index — same thing, two names.','Only four everyday commands need a network: clone, fetch, pull, push. Everything else is local.']}},

{id:'git1',title:'One file through the flow',body:`
<p>The core loop of a git life, with a single file. Create a project, watch one file travel <i>untracked → staged → committed → modified → staged → committed</i>. Run every command here for real if you have a terminal nearby — the drill below asks you to reproduce them.</p>
<div class="codeSample">mkdir journal && cd journal
git init                          # a repo is born: .git/ appears
echo "day 1" &gt; notes.txt

git status                        # notes.txt: "untracked" — git sees it, tracks nothing yet
git add notes.txt                 # → staged: it will be in the next commit
git status                        # "changes to be committed"
git commit -m "Add notes"         # snapshot! history has 1 commit

echo "day 2" &gt;&gt; notes.txt
git status                        # "modified" — working copy differs from last commit
git diff                          # EXACTLY what changed, unstaged (+day 2)
git add notes.txt
git diff --staged                 # what will ship in the next commit
git commit -m "Update notes"

git log --oneline                 # the story so far, one line per commit</div>
<p>Read <code>git status</code> obsessively — it names every state and even prints the command to move each file to the next one. The two diffs matter: plain <code>git diff</code> is working-vs-staged ("what have I not yet staged?"), <code>git diff --staged</code> is staged-vs-committed ("what am I about to commit?"). Checking the second before every commit is the habit that prevents "oops, that wasn't meant to go in".</p>
<p>Commit messages: imperative mood, say <i>why</i> when it isn't obvious. "Add notes", not "added some stuff".</p>`,
docs:[['git status','https://git-scm.com/docs/git-status'],['git diff','https://git-scm.com/docs/git-diff'],['Pro Git — recording changes','https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository']],
ex:{title:'The single-file drill',lang:'shell',
prompt:`You are in an empty folder with one file, <code>notes.txt</code>, already created. One command per numbered line: (1) turn the folder into a git repository, (2) show the state of the working tree, (3) stage <code>notes.txt</code>, (4) commit with message <code>Add notes</code>, (5) after editing the file — show the <b>unstaged</b> changes, (6) stage it and show what is <b>about to be committed</b> (two commands joined with <code>&amp;&amp;</code>), (7) commit with message <code>Update notes</code>, (8) show the compact one-line history.`,
starter:`1.
2.
3.
4.
5.
6.
7.
8.
`,
solution:`1. git init
2. git status
3. git add notes.txt
4. git commit -m "Add notes"
5. git diff
6. git add notes.txt && git diff --staged
7. git commit -m "Update notes"
8. git log --oneline
`,
tests:[{d:'init creates the repo',re:'1\\.\\s*git\\s+init\\s*$',flags:'im'},{d:'status inspects the tree',re:'2\\.\\s*git\\s+status',flags:'i'},{d:'the file is staged by name',re:'3\\.\\s*git\\s+add\\s+notes\\.txt',flags:'i'},{d:'first commit with the exact message',re:'4\\.\\s*git\\s+commit\\s+-m\\s+"Add notes"',flags:'i'},{d:'unstaged changes via plain diff',re:'5\\.\\s*git\\s+diff\\s*$',flags:'im'},{d:'stage, then preview the commit with diff --staged',re:'6\\.\\s*git\\s+add\\s+notes\\.txt\\s*&&\\s*git\\s+diff\\s+--staged',flags:'i'},{d:'second commit',re:'7\\.\\s*git\\s+commit\\s+-m\\s+"Update notes"',flags:'i'},{d:'compact history',re:'8\\.\\s*git\\s+log\\s+--oneline',flags:'i'}],
behavior:`1. After line 1 a .git folder exists and status works. 2-4. notes.txt travels untracked → staged → committed; log shows one commit. 5. Plain git diff prints the +day 2 line because working differs from staged. 6. After adding, plain diff prints NOTHING and --staged prints the change — the same edit viewed from the other side. 7-8. Two commits, newest first, short hashes + messages.`,
hints:['Steps 2 and 5-6 are the inspection habit: status names states, diff shows content.','git diff (no flags) compares working ↔ staged; --staged compares staged ↔ last commit.','Commit messages ride -m in double quotes: git commit -m "Add notes".']}},

{id:'git2',title:'A second file: staging with intent',body:`
<p>Real projects have many files — and git's staging area exists precisely so that <b>a commit contains one logical change, not "everything I touched today"</b>. Add a second file to the journal and learn to compose commits deliberately.</p>
<div class="codeSample">echo "buy milk" &gt; todo.txt          # new file — while notes.txt ALSO has edits
git status                          # two files, two different states

git add todo.txt                    # stage ONLY the new file
git commit -m "Add todo list"       # commit #1: one logical change
git add notes.txt
git commit -m "Update notes"        # commit #2: the other change

git log --stat                      # history + which files each commit touched
git show                            # the full content of the latest commit
git mv todo.txt tasks.txt           # rename WITH history (mv + stage in one step)
git rm scratch.txt                  # delete AND stage the deletion</div>
<p>The professional habits this unlocks:</p>
<ul>
<li><b>Path-scoped staging</b> — <code>git add &lt;file&gt;</code> per file; <code>git add .</code> only when you've checked status first and truly mean "all of it".</li>
<li><b>Hunk staging</b> — <code>git add -p notes.txt</code> walks each change block asking stage/skip: two unrelated edits in ONE file can become two clean commits.</li>
<li><b>Let git see renames</b> — <code>git mv</code> keeps history following the file; <code>git log --follow tasks.txt</code> traces through the rename.</li>
<li><b>Review shape, not just content</b> — <code>git log --stat</code> shows which files each commit touched; a commit touching 14 files named "fix typo" is lying about something.</li>
</ul>`,
docs:[['git add (incl. -p)','https://git-scm.com/docs/git-add'],['git mv','https://git-scm.com/docs/git-mv'],['Pro Git — viewing history','https://git-scm.com/book/en/v2/Git-Basics-Viewing-the-Commit-History']],
ex:{title:'The two-file drill',lang:'shell',
prompt:`Both <code>notes.txt</code> (modified) and <code>todo.txt</code> (brand new) have changes. One command per numbered line: (1) stage <b>only</b> <code>todo.txt</code>, (2) commit with message <code>Add todo list</code>, (3) stage <code>notes.txt</code> interactively, <b>hunk by hunk</b> (the -p flag), (4) commit with message <code>Update notes</code>, (5) show the history <b>with per-file statistics</b>, (6) rename <code>todo.txt</code> to <code>tasks.txt</code> the git way, (7) show the full changes introduced by the latest commit (one command, no arguments needed).`,
starter:`1.
2.
3.
4.
5.
6.
7.
`,
solution:`1. git add todo.txt
2. git commit -m "Add todo list"
3. git add -p notes.txt
4. git commit -m "Update notes"
5. git log --stat
6. git mv todo.txt tasks.txt
7. git show
`,
tests:[{d:'Only the new file staged first',re:'1\\.\\s*git\\s+add\\s+todo\\.txt\\s*$',flags:'im'},{d:'First logical commit',re:'2\\.\\s*git\\s+commit\\s+-m\\s+"Add todo list"',flags:'i'},{d:'Hunk-by-hunk staging with -p',re:'3\\.\\s*git\\s+add\\s+-p\\s+notes\\.txt',flags:'i'},{d:'Second logical commit',re:'4\\.\\s*git\\s+commit\\s+-m\\s+"Update notes"',flags:'i'},{d:'History with file stats',re:'5\\.\\s*git\\s+log\\s+--stat',flags:'i'},{d:'Rename via git mv (history follows)',re:'6\\.\\s*git\\s+mv\\s+todo\\.txt\\s+tasks\\.txt',flags:'i'},{d:'git show prints the latest commit',re:'7\\.\\s*git\\s+show\\s*$',flags:'im'}],
behavior:`1-4. Two edits become two commits, each telling one story — the staging area doing its real job. 3. add -p pauses at every hunk with y/n — surgical commits even inside one file. 5. log --stat shows commit 1 touched only todo.txt, commit 2 only notes.txt. 6. git mv renames on disk AND stages the rename in one step. 7. git show with no arguments means "the commit HEAD points at".`,
hints:['The whole point of lines 1-4: git add chooses WHAT each commit contains; commit only seals it.','-p = --patch: y stages the hunk, n skips, s splits it smaller.','git show defaults to HEAD — the newest commit.']}},

{id:'git3',title:'Local & remote, main & master',body:`
<p>Everything so far lived in <code>.git/</code> on your machine. A <b>remote</b> is simply <i>another copy of the repository</i>, usually on a server (GitHub, GitLab), that you exchange commits with. Your local repo is complete and independent — the remote is a peer you sync with, not a "master copy" you check files out from.</p>
<ul>
<li><b>origin</b> — the default nickname for the remote you cloned from. <code>git remote -v</code> lists remotes and their URLs. (Just a name — you can add more; fork workflows add an <code>upstream</code> remote.)</li>
<li><b>clone</b> — copy a remote repo, full history included: <code>git clone git@github.com:acme/app.git</code>.</li>
<li><b>push</b> — send your new local commits to the remote. The first push of a new branch sets its <b>upstream</b> (which remote branch it tracks): <code>git push -u origin feature/todo</code> — after that, plain <code>git push</code> and <code>git pull</code> know where to go.</li>
<li><b>fetch</b> — download the remote's new commits <i>without touching your files</i>; they land in remote-tracking branches like <code>origin/main</code>. Look before you leap: <code>git fetch</code>, then compare, then merge when ready.</li>
<li><b>pull</b> — fetch + merge into your current branch in one step. Convenient; fetch is the careful sibling.</li>
</ul>
<div class="codeSample">   YOUR MACHINE (complete repo)                REMOTE "origin" (complete repo)
   main ── your local commits      ──push──▶   main
   origin/main (last known state)  ◀──fetch──  (new commits from teammates)
                └── git merge origin/main   =   pull, decomposed</div>
<p><b>main vs master</b>: both are just <i>names for the default branch</i> — nothing more. Git historically created <code>master</code>; since 2020 GitHub and most tooling default to <code>main</code>. Older repos and tutorials say master, newer ones main; the concept is identical, and <code>git init -b main</code> (or the <code>init.defaultBranch</code> config) picks the name at creation. When you see <code>origin/main</code>, read it as "the main branch, as the remote last told me it looks".</p>`,
docs:[['Working with remotes — Pro Git','https://git-scm.com/book/en/v2/Git-Basics-Working-with-Remotes'],['git fetch','https://git-scm.com/docs/git-fetch'],['GitHub — the default branch','https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-branches-in-your-repository/changing-the-default-branch']],
ex:{title:'Remotes drill',lang:'shell',
prompt:`One answer per numbered line — commands unless stated otherwise: (1) copy the remote repository <code>git@github.com:acme/app.git</code> to your machine, (2) list the configured remotes with their URLs, (3) push the current new branch <code>feature/todo</code> to origin, <b>setting its upstream</b>, (4) download the remote's new commits <b>without changing any of your files</b>, (5) fetch-and-merge the remote's changes into your current branch in one command, (6) concept, not a command: the historical default branch name that <code>main</code> replaced (one word), (7) concept: after a fetch, the branch name that holds "main as the remote last reported it" (the full two-part name).`,
starter:`1.
2.
3.
4.
5.
6.
7.
`,
solution:`1. git clone git@github.com:acme/app.git
2. git remote -v
3. git push -u origin feature/todo
4. git fetch
5. git pull
6. master
7. origin/main
`,
tests:[{d:'clone with the SSH URL',re:'1\\.\\s*git\\s+clone\\s+git@github\\.com:acme/app\\.git',flags:'i'},{d:'remotes listed verbosely',re:'2\\.\\s*git\\s+remote\\s+-v',flags:'i'},{d:'push sets upstream with -u',re:'3\\.\\s*git\\s+push\\s+(-u|--set-upstream)\\s+origin\\s+feature/todo',flags:'i'},{d:'fetch downloads without merging',re:'4\\.\\s*git\\s+fetch\\s*$',flags:'im'},{d:'pull = fetch + merge',re:'5\\.\\s*git\\s+pull\\s*$',flags:'im'},{d:'master was the old default name',re:'6\\.\\s*master\\s*$',flags:'im'},{d:'origin/main is the remote-tracking branch',re:'7\\.\\s*origin/main',flags:'i'}],
behavior:`1. clone brings the FULL history — you could go offline forever and still have everything. 2. remote -v shows origin's fetch and push URLs. 3. -u wires feature/todo to origin/feature/todo so future plain pushes know where to go. 4. fetch updates origin/* tracking branches only — working files untouched. 5. pull is fetch immediately followed by merge. 6-7. master and main are interchangeable names for the same concept; origin/main is your local, read-only record of the remote's main.`,
hints:['Four network commands total: clone, push, fetch, pull. Everything else in git is local.','fetch is "tell me what happened"; pull is "and also apply it here".','origin/main is not the remote itself — it is your last-known snapshot OF the remote, updated on every fetch.']}},

{id:'git4',title:'Branches: parallel work & merging',body:`
<p>A branch lets an idea develop in isolation while <code>main</code> stays shippable. Since branches are just pointers, the whole cycle is cheap enough to use for every feature, fix and experiment — the industry's default workflow:</p>
<div class="codeSample">git switch -c feature/tags     # create-and-switch (older spelling: git checkout -b)
# ...edit notes.txt and tasks.txt, add, commit — as many commits as the idea needs
git switch main                # back to stable
git merge feature/tags         # bring the idea in
git branch -d feature/tags     # merged = safe to delete (the COMMITS remain)</div>
<p><b>Two kinds of merge.</b> If main hasn't moved since you branched, git just slides the pointer forward — a <b>fast-forward</b>, no new commit. If main HAS moved, git creates a <b>merge commit</b> with two parents, joining the histories. Both are normal; <code>git log --graph --oneline</code> shows the shape.</p>
<p><b>Conflicts, demystified.</b> If both branches changed the <i>same lines</i>, git stops and marks the file:</p>
<div class="codeSample">&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD
day 2: shipped the feature
=======
day 2: fixed the bug
&gt;&gt;&gt;&gt;&gt;&gt;&gt; feature/tags</div>
<p>Nothing is broken: edit the file to the text you actually want (removing the markers), <code>git add</code> it, <code>git commit</code>. That's the entire resolution protocol. <code>git merge --abort</code> backs out entirely if you want to think first. Conflicts are not errors — they are git refusing to guess between two truths.</p>
<p>Branch hygiene: short-lived branches, named by intent (<code>feature/…</code>, <code>fix/…</code>), merged within days. The longer a branch lives, the bigger the merge.</p>`,
docs:[['Basic branching & merging — Pro Git','https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging'],['git switch','https://git-scm.com/docs/git-switch'],['git merge','https://git-scm.com/docs/git-merge']],
ex:{title:'The branch cycle drill',lang:'shell',
prompt:`One command per numbered line: (1) create <b>and switch to</b> branch <code>feature/tags</code> (the modern <code>switch</code> form), (2) stage <b>both</b> <code>notes.txt</code> and <code>tasks.txt</code> in one command naming them, (3) commit with message <code>Add tagging</code>, (4) switch back to <code>main</code>, (5) merge the feature branch in, (6) delete the merged branch, (7) show the history as a <b>graph</b>, one line per commit (two flags).`,
starter:`1.
2.
3.
4.
5.
6.
7.
`,
solution:`1. git switch -c feature/tags
2. git add notes.txt tasks.txt
3. git commit -m "Add tagging"
4. git switch main
5. git merge feature/tags
6. git branch -d feature/tags
7. git log --graph --oneline
`,
tests:[{d:'create-and-switch with switch -c',re:'1\\.\\s*git\\s+switch\\s+-c\\s+feature/tags',flags:'i'},{d:'both files staged in one command',re:'2\\.\\s*git\\s+add\\s+(notes\\.txt\\s+tasks\\.txt|tasks\\.txt\\s+notes\\.txt)',flags:'i'},{d:'commit on the branch',re:'3\\.\\s*git\\s+commit\\s+-m\\s+"Add tagging"',flags:'i'},{d:'back to main via switch',re:'4\\.\\s*git\\s+switch\\s+main',flags:'i'},{d:'merge brings the idea home',re:'5\\.\\s*git\\s+merge\\s+feature/tags',flags:'i'},{d:'merged branch deleted with -d',re:'6\\.\\s*git\\s+branch\\s+-d\\s+feature/tags',flags:'i'},{d:'graph view of history',re:'7\\.\\s*git\\s+log\\s+(--graph\\s+--oneline|--oneline\\s+--graph)',flags:'i'}],
behavior:`1. switch -c creates the pointer and moves HEAD in one step. 2-3. The multi-file staging habit from the previous lesson, now on a branch. 4-5. If main didn't move, the merge fast-forwards; if it did, a merge commit with two parents appears. 6. -d refuses to delete an UNmerged branch (safety); -D forces. 7. The graph shows the fork and the join — or a straight line if it fast-forwarded.`,
hints:['switch -c = create + switch. The older spelling checkout -b does the same and you will meet it in old docs.','git add takes any number of paths — one command, both files.','branch -d only deletes the LABEL — commits reachable from main are never deleted with it.']}},

{id:'git5',title:'Choose the right undo',body:`
<p>Git has several undo tools because "undo" means different things. Matching the tool to the situation is the skill — and knowing that <b>almost nothing is ever lost</b> is the confidence.</p>
<ul>
<li><b>Discard uncommitted edits to a file</b> — <code>git restore notes.txt</code>: working copy resets to the last commit. The one command here that genuinely destroys work (those edits were never committed), so give it a breath before Enter.</li>
<li><b>Unstage, keep the edits</b> — <code>git restore --staged notes.txt</code>: pulls the file back out of the staging area; your changes stay in the working directory.</li>
<li><b>Undo a PUSHED commit</b> — <code>git revert abc123</code>: creates a NEW commit applying the inverse. History moves forward, teammates' clones stay consistent. The only polite undo for shared history (the full story in the advanced lesson).</li>
<li><b>Park everything, quickly</b> — <code>git stash</code> shelves all dirty work; <code>git stash pop</code> brings it back. For "urgent bug, wrong branch" moments.</li>
<li><b>The safety net</b> — <code>git reflog</code>: a journal of everywhere HEAD has pointed, even through "destructive" operations. A commit you can find in reflog is a commit you can recover: <code>git switch -c rescue abc123</code>.</li>
</ul>
<div class="codeSample">                        where is the damage?
   working dir only          staged                    committed & pushed
   git restore FILE          git restore --staged F    git revert HASH
   (edits gone)              (edits kept)              (inverse commit)
              lost something? → git reflog → git switch -c rescue HASH</div>`,
docs:[['git restore','https://git-scm.com/docs/git-restore'],['git revert','https://git-scm.com/docs/git-revert'],['git stash','https://git-scm.com/docs/git-stash'],['git reflog','https://git-scm.com/docs/git-reflog']],
ex:{title:'Undo triage',lang:'shell',
prompt:`For each scenario write ONE command on the numbered line: (1) throw away your uncommitted edits to <code>notes.txt</code>, (2) unstage <code>notes.txt</code> but keep the edits, (3) undo commit <code>abc123</code> that is already pushed to main, (4) shelve all your dirty work quickly to switch branches, (5) bring the shelved work back (and drop it from the shelf), (6) show the log of everywhere HEAD has pointed — your safety net.`,
starter:`1.
2.
3.
4.
5.
6.
`,
solution:`1. git restore notes.txt
2. git restore --staged notes.txt
3. git revert abc123
4. git stash
5. git stash pop
6. git reflog
`,
tests:[{d:'restore discards working-copy edits',re:'1\\.\\s*git\\s+restore\\s+notes\\.txt',flags:'i'},{d:'--staged unstages but keeps edits',re:'2\\.\\s*git\\s+restore\\s+--staged\\s+notes\\.txt',flags:'i'},{d:'pushed history undone with revert, never reset',re:'3\\.\\s*git\\s+revert\\s+abc123',flags:'i'},{d:'stash shelves dirty work',re:'4\\.\\s*git\\s+stash\\s*$',flags:'im'},{d:'stash pop restores and drops',re:'5\\.\\s*git\\s+stash\\s+pop',flags:'i'},{d:'reflog is the safety net',re:'6\\.\\s*git\\s+reflog',flags:'i'}],
behavior:`1. notes.txt matches the last commit again; the edits are gone for real. 2. The change leaves the staging area but stays in the file — recomposition, not destruction. 3. A new commit "Revert ..." lands; the bad commit remains in history but its effect is gone — safe on shared branches. 4-5. stash/pop round-trips the entire dirty state. 6. reflog lists HEAD's journey with hashes — from there, any state is recoverable via switch -c.`,
hints:['restore vs restore --staged: working copy vs staging area.','Pushed = shared = revert. Reset on a pushed branch rewrites history other people already have.','reflog is local and expires (default ~90 days) — a safety net, not an archive.']}},

{id:'git6',title:'Advanced: revert, rebase & rewriting history',body:`
<p>The advanced toolbox splits cleanly in two: commands that <b>move history forward</b> (safe anywhere) and commands that <b>rewrite history</b> (powerful, local-only). The golden rule that keeps teams sane: <b>never rewrite commits that others may already have</b>.</p>
<ul>
<li><b>git revert HASH</b> — the forward undo: a new commit containing the inverse change. Works on any branch, shared or not, because it only <i>adds</i> history.</li>
<li><b>git reset</b> — moves your branch pointer backwards, three strengths: <code>--soft HEAD~1</code> (uncommit, keep changes staged — perfect for "forgot a file" or "wrong message"), <code>--mixed</code> (default: uncommit and unstage, changes kept in files), <code>--hard</code> (all gone — reflog is your only friend after this). Local branches only.</li>
<li><b>git rebase main</b> — <i>replay</i> your branch's commits on top of the latest main, one by one, as if you had started today. Result: a straight line, no merge commit, clean review. Your commits get NEW hashes — that's the rewrite, and that's why it's for unpushed branches.</li>
<li><b>git rebase -i HEAD~4</b> — interactive: an editor lists the last 4 commits and you direct the replay: <code>pick</code>, <code>reword</code> (fix a message), <code>squash</code>/<code>fixup</code> (fold "wip" and "typo" into one honest commit), <code>drop</code>, or reorder the lines. The standard tidy-up before opening a PR.</li>
<li><b>git cherry-pick HASH</b> — copy ONE commit from anywhere onto the current branch (the hotfix that must land on both main and the release branch).</li>
<li><b>git bisect</b> — binary-search history for the commit that broke things: <code>start</code>, mark <code>bad</code>/<code>good</code>, answer git's checkouts until it names the culprit. Twenty commits ≈ 5 tests.</li>
</ul>
<div class="codeSample">merge:  main ─A─B────M         rebase:  main ─A─B─C'─D'
              \\      /                    straight line, new hashes C',D' —
     feature   ─C──D                      same content, rewritten history</div>
<p>Choosing: <b>merge</b> when the branch is shared or the fork-point matters; <b>rebase</b> to keep an unpushed feature branch current and its history clean; <b>revert</b> when the mistake is already public. All three end with the same files — they differ in the story history tells.</p>`,
docs:[['Rebasing — Pro Git','https://git-scm.com/book/en/v2/Git-Branching-Rebasing'],['Reset demystified — Pro Git','https://git-scm.com/book/en/v2/Git-Tools-Reset-Demystified'],['git cherry-pick','https://git-scm.com/docs/git-cherry-pick'],['git bisect','https://git-scm.com/docs/git-bisect']],
ex:{title:'History-rewriting drill',lang:'shell',
prompt:`One command per numbered line: (1) undo the <b>pushed</b> commit <code>abc123</code> the shared-history-safe way, (2) uncommit your <b>local</b> last commit but keep all its changes staged (you forgot a file), (3) replay your current feature branch onto the latest <code>main</code>, (4) open an interactive rebase over the last 4 commits to squash your "wip" commits, (5) copy commit <code>9f8e7d</code> from another branch onto this one, (6) start a bisect session, (7) during bisect — mark the current commit broken.`,
starter:`1.
2.
3.
4.
5.
6.
7.
`,
solution:`1. git revert abc123
2. git reset --soft HEAD~1
3. git rebase main
4. git rebase -i HEAD~4
5. git cherry-pick 9f8e7d
6. git bisect start
7. git bisect bad
`,
tests:[{d:'shared history → revert, never reset',re:'1\\.\\s*git\\s+revert\\s+abc123',flags:'i'},{d:'soft reset uncommits, keeps work staged',re:'2\\.\\s*git\\s+reset\\s+--soft\\s+HEAD~1',flags:'i'},{d:'rebase replays onto main',re:'3\\.\\s*git\\s+rebase\\s+main\\s*$',flags:'im'},{d:'interactive rebase over 4 commits',re:'4\\.\\s*git\\s+rebase\\s+-i\\s+HEAD~4',flags:'i'},{d:'cherry-pick copies one commit',re:'5\\.\\s*git\\s+cherry-pick\\s+9f8e7d',flags:'i'},{d:'bisect session opened',re:'6\\.\\s*git\\s+bisect\\s+start',flags:'i'},{d:'current commit marked bad',re:'7\\.\\s*git\\s+bisect\\s+bad',flags:'i'}],
behavior:`1. revert adds an inverse commit — teammates just pull it like any other. 2. --soft moves the branch pointer back one; the files sit staged, ready to be amended into a better commit. 3. Your commits are replayed on top of today's main with new hashes — do this only before pushing. 4. The -i editor lists 4 commits; changing pick to squash/fixup/reword directs the rewrite. 5. cherry-pick creates a new commit with the same change but a different hash and parent. 6-7. bisect start, then bad/good answers, binary-search the breakage — O(log n) debugging.`,
hints:['Line 1 vs line 2 is the whole lesson: pushed → forward fix (revert); local → rewrite freely (reset/rebase).','HEAD~1 means "one commit before HEAD" — the ~N syntax counts parents backwards.','After bisect names the culprit: git bisect reset returns you to where you started.']}}
]});
