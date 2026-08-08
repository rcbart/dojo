const fs = require('fs');
const dir = __dirname + '/../content/streams/';
let total = 0;
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith('.js')) continue;
  let s = fs.readFileSync(dir + f, 'utf8');
  const before = s;
  // Source has literal двойной backslash sequences like \\u0027 which render as text.
  // Collapse to a single-backslash unicode escape ('), which JS parses to the real
  // character in ANY string-quote context (safe inside '...', "...", and `...`).
  s = s.replace(/\\\\u0027/g, '\\u0027')   // apostrophe '
       .replace(/\\\\u2019/g, '\\u2019')   // right single quote ’
       .replace(/\\\\u00e9/g, '\\u00e9');  // é
  if (s !== before) {
    const n = (before.match(/\\\\u(0027|2019|00e9)/g) || []).length;
    total += n;
    fs.writeFileSync(dir + f, s);
    console.log('fixed', f, '(' + n + ')');
  }
}
console.log('total escape fixes:', total);
