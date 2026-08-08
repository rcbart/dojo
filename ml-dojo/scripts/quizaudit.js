// Audit quiz option lengths: flag questions where the CORRECT option is the longest,
// which makes the answer guessable from length alone.
const fs = require('fs');
const dir = __dirname + '/../content/streams/';
const rd = p => fs.readFileSync(dir + p, 'utf8');
const files = JSON.parse(rd('manifest.json'));
const STREAMS = (new Function(rd('_header.js') + files.map(rd).join('\n') + '\nreturn STREAMS;'))();

let total = 0, correctIsLongest = 0, correctLongestByMargin = 0;
const flagged = [];
STREAMS.forEach(s => s.lessons.forEach(l => {
  if (!l.quiz) return;
  l.quiz.questions.forEach((q, qi) => {
    total++;
    const lens = q.options.map(o => String(o).length);
    const correctLen = lens[q.answer];
    const others = lens.filter((_, i) => i !== q.answer);
    const maxOther = Math.max(...others);
    const avgOther = others.reduce((a, b) => a + b, 0) / others.length;
    const isLongest = correctLen > maxOther;
    if (isLongest) correctIsLongest++;
    // "by margin": strictly longest AND at least 40% longer than the average wrong option
    if (isLongest && correctLen >= 1.4 * avgOther) {
      correctLongestByMargin++;
      flagged.push({ id: l.id, qi, correctLen, avgOther: Math.round(avgOther) });
    }
  });
}));

console.log('total questions:', total);
console.log('correct option is the LONGEST:', correctIsLongest, '(' + Math.round(100 * correctIsLongest / total) + '%)  — random would be ~' + Math.round(100/ (STREAMS[0].lessons[0].quiz.questions[0].options.length)) + '%');
console.log('correct is longest AND >=40% longer than avg distractor (clear giveaway):', correctLongestByMargin);
console.log('\nlessons with the most flagged questions:');
const byLesson = {};
flagged.forEach(f => byLesson[f.id] = (byLesson[f.id] || 0) + 1);
Object.entries(byLesson).sort((a, b) => b[1] - a[1]).slice(0, 20).forEach(([id, n]) => console.log('  ' + id + ': ' + n));
