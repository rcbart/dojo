# JavaDojo 🥋

An interactive, single-page Java curriculum: 21 streams, 136 lessons, 214 hands-on exercises with an in-browser editor, structural checks, AI-assisted test runs, belt progression, tournaments, and four end-to-end real-world projects.

## Repository layout

```
src/
  shell.html      HTML page shell (placeholders: @@STYLES@@, @@SCRIPT@@)
  styles.css      all styling
  app.js          runtime: state, navigation, editor, test runner, hints
  boot.js         startup calls
content/streams/  one module per stream (the course content — most edits happen here)
  manifest.json   stream order
scripts/
  verify.js       content test suite (parses all modules, runs every exercise's
                  regex tests against its own solution, checks id uniqueness)
build.js          assembles everything into dist/index.html + javadojo.html
```

## Workflow

```bash
node scripts/verify.js   # validate content
node build.js            # produce dist/index.html (and javadojo.html copy)
```

The build output is a fully self-contained HTML file — open it in a browser, host it anywhere static. Generated files are gitignored; only source is versioned.

## Editing content

Each stream module calls `STREAMS.push({...})` with lessons; each lesson has `body` (HTML), `docs` links, and one `ex` or several `exs`. An exercise carries `prompt`, `starter`, `solution`, regex `tests` (`{d, re, flags?, not?}`), `behavior` (shown as "What your code must do"), and `hints`. Content lives inside JS template literals: escape backticks and `${` (write `\${`).

Streams flagged `tournament:true` or `project:true` are excluded from belt progression.

## Companion docs

- `BACKEND_PLAN.md` — architecture for publishing JavaDojo as a real product
- `LAUNCH_GUIDE.md` — step-by-step: static hosting → Spring Boot backend → AI judge → sandboxed code runner
