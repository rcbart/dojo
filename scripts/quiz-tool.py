#!/usr/bin/env python3
"""Inspect and repair length-biased quiz distractors.

A correct answer that is conspicuously the longest option is answerable without
knowing the material. This tool lists the worst offenders and applies fixes.

  list  N                 show the N worst, as JSON, ready to rewrite
  apply patch.json        apply {file, stream, qi, oi, text, why?} edits in place

`text` replaces the option. Optional `why` replaces the parallel whyWrong entry,
which you must supply whenever a rewritten distractor no longer matches the
rebuttal that was written against the old wording.

Banks are single-line `window.QUIZZES_HAND = {...}` JSON assignments, so edits
round-trip through json and cannot corrupt the structure.
"""
import io, json, re, sys

BANKS = {
    'dev': 'src/quizzes_hand.js',
    'idn': 'identity-dojo/src/quizzes_hand.js',
    'js':  'js-dojo/src/quizzes_hand.js',
}
RATIO, ABS = 1.4, 20
TAG = re.compile(r'<[^>]+>')
strip = lambda s: TAG.sub('', str(s)).strip()


def load(rel):
    s = io.open(rel, encoding='utf-8').read().strip()
    m = re.match(r'^window\.(\w+)\s*=\s*(\{.*\})\s*;?\s*$', s, re.S)
    return m.group(1), json.loads(m.group(2))


def save(rel, name, data):
    io.open(rel, 'w', encoding='utf-8').write(
        'window.%s=%s;\n' % (name, json.dumps(data, ensure_ascii=False, separators=(',', ':'))))


def bias(q):
    """Return (gap, answer_index) if the correct option is conspicuously longest."""
    if not isinstance(q.get('options'), list) or len(q['options']) < 2:
        return None
    ai = q.get('answer', q.get('correct'))
    if not isinstance(ai, int):
        return None
    lens = [len(strip(o)) for o in q['options']]
    right, others = lens[ai], [l for i, l in enumerate(lens) if i != ai]
    mean = sum(others) / len(others)
    if right > max(others) and right >= mean * RATIO and right - mean >= ABS:
        return round(right - mean), ai
    return None


def cmd_list(n):
    rows = []
    for key, rel in BANKS.items():
        _, data = load(rel)
        for stream, qs in data.items():
            for qi, q in enumerate(qs):
                b = bias(q)
                if b:
                    rows.append({'file': key, 'stream': stream, 'qi': qi, 'gap': b[0],
                                 'answer': b[1], 'q': strip(q['q']),
                                 'options': [strip(o) for o in q['options']],
                                 'why': strip(q.get('why', '')),
                                 'whyWrong': [strip(w) for w in q.get('whyWrong', [])]})
    rows.sort(key=lambda r: -r['gap'])
    print(json.dumps(rows[:n], ensure_ascii=False, indent=1))


def cmd_apply(patch_path):
    patch = json.load(io.open(patch_path, encoding='utf-8'))
    by_file = {}
    for p in patch:
        by_file.setdefault(p['file'], []).append(p)
    changed = 0
    for key, edits in by_file.items():
        rel = BANKS[key]
        name, data = load(rel)
        for e in edits:
            q = data[e['stream']][e['qi']]
            if 'text' in e:
                q['options'][e['oi']] = e['text']
                changed += 1
            # A rewritten distractor needs its rebuttal rewritten with it, or the
            # explanation you get for picking it will describe a claim that is no
            # longer on the screen.
            if 'why' in e and isinstance(q.get('whyWrong'), list) and len(q['whyWrong']) == len(q['options']):
                assert e['oi'] != q.get('answer'), 'refusing to put a rebuttal in the correct slot'
                q['whyWrong'][e['oi']] = e['why']
        save(rel, name, data)
        print('  %-4s %d edit(s) -> %s' % (key, len(edits), rel))
    print('%d option(s) rewritten' % changed)


if __name__ == '__main__':
    if sys.argv[1] == 'list':
        cmd_list(int(sys.argv[2]))
    elif sys.argv[1] == 'apply':
        cmd_apply(sys.argv[2])
