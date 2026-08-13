# engine

The shared runtime for every course in this repository. Zero dependencies — no framework, no
bundler, no CDN.

| File | What it is |
|---|---|
| `app.js` | state, navigation, the editor, graders (SQL / JS / Java), spaced-repetition Review, Practice, quizzes, glossary |
| `sqlengine.js` | a dependency-free in-browser SQL engine plus sample datasets |
| `boot.js` | startup wiring |
| `shell.html` | the page shell — `@@STYLES@@` and `@@SCRIPT@@` are replaced at build time |
| `styles.css` | all styling |

## Contract with a course

A course supplies its own content, its own content-derived maps (`gradejava.js`, `quizzes.js`,
`quizzes_hand.js`) and a `build.js` that concatenates them with these files. It may configure the
runtime without forking it, via two optional globals defined **before** `app.js` loads:

| Global | Effect |
|---|---|
| `DOJO_DOMAINS` | replaces the home-page domain grouping |
| `DOJO_NO_IAM_MERGE` | keeps identity sub-streams separate instead of merging them into one |

See `../identity-dojo/src/config.js` for a worked example.

## Changing it

Any edit here affects every course. Run each course's `scripts/verify.js` and `build.js` before
committing — the CI workflow does both and fails the deploy if either course breaks.
