#!/usr/bin/env node
// Build dist/index.html (and a root javadojo.html copy) from src/ + content/streams/.
const fs = require('fs');
const path = require('path');
const ROOT = __dirname;
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');

const manifest = JSON.parse(read('content/streams/manifest.json'));
const data = read('content/streams/_header.js')
  + manifest.map(f => read(path.join('content/streams', f))).join('')
  + read('content/streams/_footer.js');
const script = read('src/app.js') + data + read('src/boot.js');
const html = read('src/shell.html')
  .replace('@@STYLES@@', () => read('src/styles.css'))
  .replace('@@SCRIPT@@', () => script);

fs.mkdirSync(path.join(ROOT, 'dist'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'dist/index.html'), html);
fs.writeFileSync(path.join(ROOT, 'javadojo.html'), html);
console.log('built dist/index.html (' + html.length + ' chars, ' + manifest.length + ' streams)');
