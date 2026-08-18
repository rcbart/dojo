#!/usr/bin/env node
// Build dist/index.html (and a root devdojo.html copy) for DevDojo.
//
// Layout note: engine/ is the SHARED RUNTIME, used by every course in this
// repo. src/ holds only what belongs to this course, the content-derived
// grading and quiz maps. Keeping those apart is what lets a course be lifted
// into its own repository without forking the engine.
const fs = require('fs');
const path = require('path');
const ROOT = __dirname;
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const engine = p => read(path.join('engine', p));

const manifest = JSON.parse(read('content/streams/manifest.json'));
const data = read('content/streams/_header.js')
  + manifest.map(f => read(path.join('content/streams', f))).join('')
  + read('content/streams/_footer.js');

const script = engine('sqlengine.js')
  + read('src/gradejava.js')
  + read('src/quizzes_hand.js')
  + read('src/quizzes.js')
  + engine('glossary.js')   // must precede app.js: merges terms into KW at load
  + engine('grade.js')
  + engine('feedback.js')
  + engine('icons.js')   // must precede app.js: ico() is called during render
  + engine('app.js')
  + data
  + engine('boot.js');

const html = engine('shell.html')
  .replace('@@STYLES@@', () => engine('styles.css'))
  .replace('@@SCRIPT@@', () => script.replace(/<\/script/gi, '<\\/script')) /* SCRIPT-SAFE: a literal </script> inside content would terminate the inline tag */;

fs.mkdirSync(path.join(ROOT, 'dist'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'dist/index.html'), html);
fs.writeFileSync(path.join(ROOT, 'devdojo.html'), html);
console.log('built dist/index.html (' + html.length + ' chars, ' + manifest.length + ' streams)');
