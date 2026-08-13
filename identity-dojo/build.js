#!/usr/bin/env node
// Build dist/index.html for IdentityDojo. Reuses the shared runtime in ../src
// so there is one engine to maintain; only the content, config and shell differ.
const fs = require('fs');
const path = require('path');
const ROOT = __dirname;
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const shared = p => fs.readFileSync(path.join(ROOT, '..', 'src', p), 'utf8');

const manifest = JSON.parse(read('content/streams/manifest.json'));
const data = read('content/streams/_header.js')
  + manifest.map(f => read(path.join('content/streams', f))).join('\n')
  + read('content/streams/_footer.js');

const script = read('src/config.js') + '\n'
  + shared('app.js') + '\n'
  + shared('sqlengine.js') + '\n'
  + shared('gradejava.js') + '\n'
  + shared('quizzes.js') + '\n'
  + shared('quizzes_hand.js') + '\n'
  + data + '\n'
  + shared('boot.js');

const html = read('src/shell.html')
  .replace('@@STYLES@@', () => shared('styles.css'))
  .replace('@@SCRIPT@@', () => script);

fs.mkdirSync(path.join(ROOT, 'dist'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'dist/index.html'), html);
console.log('built identity-dojo/dist/index.html (' + html.length + ' chars, ' + manifest.length + ' streams)');
