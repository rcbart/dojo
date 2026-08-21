#!/usr/bin/env python3
"""Rebalance which slot the correct answer sits in.

A learner who notices the right answer is nearly always the second option can
score without reading the question. This spreads correct answers evenly across
the slots, deterministically (seeded by the question text), so a second run is
a no-op and the diff stays reviewable.

Questions whose option order carries meaning are left alone: anything with an
"all/none of the above" option, a "both A and B" reference, a set of options
that is purely numeric and so reads as an ordered scale, or fewer than three
options.

  python3 scripts/quiz-shuffle.py report      show the current distribution
  python3 scripts/quiz-shuffle.py apply       rewrite the banks in place
"""
import hashlib, io, json, re, sys, collections

BANKS = {
    'dev': 'src/quizzes_hand.js',
    'idn': 'identity-dojo/src/quizzes_hand.js',
    'js':  'js-dojo/src/quizzes_hand.js',
}
SKIP = re.compile(r'\b(all|none|both|neither) of (the |these )?(above|these|them)\b'
                  r'|\bof the above\b|\bboth [AB1-4] and\b|\b[AB] and [BC] only\b', re.I)
NUMERICISH = re.compile(r'^[\s\d.,%$+\-/x×()]+$')
TAG = re.compile(r'<[^>]+>')


def h(s):
    return int(hashlib.md5(s.encode('utf-8')).hexdigest(), 16)


def skippable(opts):
    if len(opts) < 3:
        return True
    flat = [TAG.sub('', str(o)).strip() for o in opts]
    if any(SKIP.search(o) for o in flat):
        return True
    if all(NUMERICISH.match(o) for o in flat if o):
        return True
    return False


def plan(items):
    """items: [(key, n_options)] -> {key: target_slot}, near-uniform within each arity."""
    by_n = collections.defaultdict(list)
    for key, n in items:
        by_n[n].append(key)
    out = {}
    for n, keys in by_n.items():
        keys.sort(key=h)
        for i, k in enumerate(keys):
            out[k] = i % n
    return out


def perm(opts, ai, key, target):
    """Index permutation placing option `ai` in slot `target`.

    The distractors are put in a canonical order (sorted by their own text)
    before the key-seeded rotation, so the result depends on the SET of options
    rather than on their current arrangement. Without that, a second run rotates
    them again: the answer position looks stable while the options keep moving
    underneath it, which is not a fixed point and is easy to miss, because the
    summary counts are identical either way."""
    rest = sorted((i for i in range(len(opts)) if i != ai), key=lambda i: str(opts[i]))
    r = h(key) % len(rest)
    rest = rest[r:] + rest[:r]
    return rest[:target] + [ai] + rest[target:]


def reorder(q, order):
    """Apply the permutation to options and to every array that parallels it."""
    n = len(q['options'])
    for k, v in list(q.items()):
        if isinstance(v, list) and len(v) == n:
            q[k] = [v[i] for i in order]


def load(rel):
    s = io.open(rel, encoding='utf-8').read().strip()
    m = re.match(r'^window\.(\w+)\s*=\s*(\{.*\})\s*;?\s*$', s, re.S)
    return m.group(1), json.loads(m.group(2))


def save(rel, name, data):
    io.open(rel, 'w', encoding='utf-8').write(
        'window.%s=%s;\n' % (name, json.dumps(data, ensure_ascii=False, separators=(',', ':'))))


def walk(data):
    """Yield every question dict that has options and an answer index."""
    stack = [data]
    while stack:
        cur = stack.pop()
        if isinstance(cur, dict):
            if isinstance(cur.get('options'), list) and isinstance(cur.get('answer'), int):
                yield cur
            stack.extend(cur.values())
        elif isinstance(cur, list):
            stack.extend(cur)


def main(mode):
    grand = collections.Counter()
    for tag, rel in BANKS.items():
        name, data = load(rel)
        qs = list(walk(data))
        movable = [q for q in qs if not skippable(q['options'])]
        # Key on content that does not move. Including options[0] made the key
        # change every time the options were reordered, so the plan differed on
        # every run and the banks never settled.
        keys = [(str(q.get('q', '')) + '|' + '|'.join(sorted(str(o) for o in q['options'])),
                 len(q['options'])) for q in movable]
        targets = plan(keys)
        before = collections.Counter(q['answer'] for q in qs)
        for q, (key, _) in zip(movable, keys):
            t = targets[key]
            reorder(q, perm(q['options'], q['answer'], key, t))
            q['answer'] = t
        after = collections.Counter(q['answer'] for q in qs)
        grand.update(after)
        print('%-4s %3d questions, %3d movable, %3d left as-is' %
              (tag, len(qs), len(movable), len(qs) - len(movable)))
        print('     before %s' % dict(sorted(before.items())))
        print('     after  %s' % dict(sorted(after.items())))
        if mode == 'apply':
            save(rel, name, data)
    print('all banks after: %s' % dict(sorted(grand.items())))
    if mode != 'apply':
        print('(report only, nothing written)')


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else 'report')
