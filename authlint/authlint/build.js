#!/usr/bin/env node
/* Build dist/index.html from src/.
   One file out, no dependencies, no build-time network. The order below is the
   load order: helpers before the checks that use them, checks before the app. */
const fs = require('fs');
const path = require('path');
const ROOT = __dirname;
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');

const SCRIPTS = [
  'src/hardening.js',   // first: it traps history writes before anything else runs
  'src/finding.js',
  'src/decode.js',
  'src/detect.js',
  'src/diagnose.js',    // only runs when detect gives up, so it loads beside it
  'src/checks-jwt.js',
  'src/checks-oidc.js',
  'src/checks-oauth.js',
  'src/checks-saml.js',
  'src/samples.js',
  'src/app.js',
];

const script = SCRIPTS.map(read).join('\n');
const html = read('src/shell.html')
  .replace('@@STYLES@@', () => read('src/styles.css'))
  // A literal </script> anywhere in the source would end the inline tag early.
  .replace('@@SCRIPT@@', () => script.replace(/<\/script/gi, '<\\/script'));

fs.mkdirSync(path.join(ROOT, 'dist'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'dist/index.html'), html);
console.log('built dist/index.html (' + html.length.toLocaleString() + ' chars, ' +
            SCRIPTS.length + ' modules)');
