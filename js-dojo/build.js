#!/usr/bin/env node
// Build dist/index.html for JSDojo.
//
// This course owns everything under js-dojo/ except the runtime, which comes
// from the shared ../engine. That is the only external dependency: to lift
// this course into its own repository, vendor or submodule engine/ and change
// ENGINE below. Nothing else needs to move.
const fs = require('fs');
const path = require('path');
const ROOT = __dirname;
const ENGINE = path.join(ROOT, '..', 'engine');

const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const engine = p => fs.readFileSync(path.join(ENGINE, p), 'utf8');

const manifest = JSON.parse(read('content/streams/manifest.json'));
const data = read('content/streams/_header.js')
  + manifest.map(f => read(path.join('content/streams', f))).join('\n')
  + read('content/streams/_footer.js');

const script = read('src/config.js') + '\n'
  + engine('sqlengine.js')
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
  .replace('@@SCRIPT@@', () => script.replace(/<\/script/gi, '<\\/script')) /* SCRIPT-SAFE: a literal </script> inside content would terminate the inline tag */
  .replace(/<title>[^<]*<\/title>/,
    () => { const m = read('src/config.js').match(/pageTitle:\s*'([^']+)'/);
            return m ? `<title>${m[1]}</title>` : '<title>Dev Dojo: Master software engineering</title>'; });

fs.mkdirSync(path.join(ROOT, 'dist'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'dist/index.html'), html);
console.log('built js-dojo/dist/index.html (' + html.length + ' chars, ' + manifest.length + ' streams)');
