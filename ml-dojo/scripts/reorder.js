// Move the indentation lesson (py9) to AFTER loops (py3), so if/loops are taught first.
const fs = require('fs');
const f = __dirname + '/../content/streams/01-python-from-zero.js';
let s = fs.readFileSync(f, 'utf8');

const startMark = "\n{id:'py9',";
const endMark = "\n{id:'py2',";
const insertMark = "\n{id:'py4',";

const startIdx = s.indexOf(startMark);
const endIdx = s.indexOf(endMark);
if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) throw new Error('py9/py2 markers not found');

// Block is py9 ... up to (not including) the newline before py2. Keep the leading "\n{id:'py9'..."
const block = s.slice(startIdx, endIdx); // includes leading \n, excludes the \n{id:'py2'
// Remove it
s = s.slice(0, startIdx) + s.slice(endIdx);

// Insert before py4
const insIdx = s.indexOf(insertMark);
if (insIdx === -1) throw new Error('py4 marker not found (after removal)');
s = s.slice(0, insIdx) + block + s.slice(insIdx);

fs.writeFileSync(f, s);
console.log('moved py9 to after py3 (before py4)');
