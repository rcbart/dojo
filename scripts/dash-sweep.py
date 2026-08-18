#!/usr/bin/env python3
"""Replace spaced em dashes with ordinary punctuation. Dry run unless --apply."""
import re, sys, json
from collections import Counter

APPLY = '--apply' in sys.argv

PROTECT = [
    re.compile(r'<pre\b.*?</pre>', re.S | re.I),
    re.compile(r'<code\b.*?</code>', re.S | re.I),
    re.compile(r'<div class="codeSample".*?</div>', re.S | re.I),
    re.compile(r'^```[^\n]*\n.*?^```', re.S | re.M),
    re.compile(r'https?://\S+'),
]
COORD = {'and','but','or','so','yet','nor','then'}
REL   = {'which','who','whom','whose','where','when','while'}

INLINE_TICK = re.compile(r'`[^`\n]+`')

def build_protected(text, md=False):
    spans = []
    pats = PROTECT + ([INLINE_TICK] if md else [])
    for pat in pats:
        for m in pat.finditer(text):
            spans.append((m.start(), m.end()))
    spans.sort()
    merged = []
    for s, e in spans:
        if merged and s <= merged[-1][1]:
            merged[-1] = (merged[-1][0], max(merged[-1][1], e))
        else:
            merged.append((s, e))
    return merged

def in_span(i, merged):
    lo, hi = 0, len(merged) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        s, e = merged[mid]
        if i < s: hi = mid - 1
        elif i >= e: lo = mid + 1
        else: return True
    return False

def line_bounds(text, i):
    s = text.rfind('\n', 0, i) + 1
    e = text.find('\n', i)
    return s, (e if e != -1 else len(text))

HEADING = re.compile(r'^\s*(#{1,6}\s|>\s*#{1,6}\s|<h[1-6][^>]*>)')
# "- **term** — gloss" / "* `FLAG` — gloss": a definition, so a colon.
DEFLIST = re.compile(r'^\s*([-*+]|\d+\.)\s+([*_`]{1,2}[^*_`]+[*_`]{1,2}|<b>.*?</b>)\s*$')
# HTML equivalent: "<li><b>Heap</b> — a complete binary tree..." is also a definition.
HTMLDEF = re.compile(r'<(li|p|td)[^>]*>\s*(<b>|<strong>)[^<]{1,60}(</b>|</strong>)\s*$')
# "['Title — Source', 'https://...']": an attribution, so parentheses.
ATTRIB  = re.compile(r"\[\s*['\"][^'\"]*$")

def sweep(text, md=False):
    merged = build_protected(text, md)
    hits = [m for m in re.finditer(r'(?<=\S) — (?=\S)', text) if not in_span(m.start(), merged)]
    skipped = len(re.findall(r'(?<=\S) — (?=\S)', text)) - len(hits)

    # Group hits by line so paired (parenthetical) dashes are handled together.
    lines = {}
    for m in hits:
        lines.setdefault(line_bounds(text, m.start()), []).append(m)

    edits, rules = [], Counter()
    rules['skipped-code'] = skipped

    for (ls, le), ms in lines.items():
        line = text[ls:le]
        is_heading = bool(HEADING.match(line))

        # PAIRED: exactly two dashes on one line, with text on both outer sides
        # -> parenthetical. Convert both to commas so the aside stays an aside.
        if len(ms) == 2 and not is_heading:
            inner = text[ms[0].end():ms[1].start()]
            after = text[ms[1].end():le].strip()
            if after and len(inner) < 120:
                edits.append((ms[0].start(), ms[0].end(), ', '))
                edits.append((ms[1].start(), ms[1].end(), ', '))
                rules['paired->commas'] += 2
                continue
            rules['FLAG-unbalanced-pair'] += 2
            for m in ms:
                edits.append((m.start(), m.end(), ', '))
            continue

        for m in ms:
            left  = text[ls:m.start()]
            right = text[m.end():le]
            rw = re.match(r'[\'"(\[*_`]*([A-Za-z]+)', right)
            word = rw.group(1) if rw else ''
            lw = word.lower()

            if is_heading:
                rep, rule = ': ', 'heading->colon'
            elif DEFLIST.match(left) or HTMLDEF.search(left):
                rep, rule = ': ', 'deflist->colon'
            elif ATTRIB.search(left) and re.match(r"[^'\"]{1,40}['\"]", right):
                rep, rule = ' (', 'attribution->parens'
            elif left.rstrip().endswith(','):
                rep, rule = ': ', 'left-comma->colon'
            elif lw in COORD:
                rep, rule = ', ', 'conjunction->comma'
            elif lw in REL:
                rep, rule = ', ', 'relative->comma'
            elif word and word[0].isupper() and lw not in COORD | REL:
                rep, rule = ': ', 'capital->colon'
            else:
                rep, rule = ', ', 'default->comma'
            if rule == 'attribution->parens':
                close = re.match(r"([^'\"]{1,40})(['\"])", right)
                edits.append((m.start(), m.end(), ' ('))
                edits.append((m.end() + close.end(1), m.end() + close.end(1), ')'))
            else:
                edits.append((m.start(), m.end(), rep))
            rules[rule] += 1

    edits.sort()
    out, last = [], 0
    for s, e, rep in edits:
        out.append(text[last:s]); out.append(rep); last = e
    out.append(text[last:])
    return ''.join(out), rules

files = [l.strip() for l in open('/tmp/srcfiles.txt') if l.strip()]
total, changed, allrules, samples = 0, 0, Counter(), []
for f in files:
    try: src = open(f, encoding='utf-8').read()
    except Exception: continue
    new, rules = sweep(src, md=f.lower().endswith(('.md', '.markdown')))
    if new != src:
        changed += 1
        if APPLY: open(f, 'w', encoding='utf-8').write(new)
        else:
            for a, b in zip(src.split('\n'), new.split('\n')):
                if a != b and len(samples) < 3000:
                    samples.append({'file': f, 'before': a.strip()[:300], 'after': b.strip()[:300]})
    total += sum(v for k, v in rules.items() if k != 'skipped-code')
    allrules.update(rules)

print(f"{'APPLIED' if APPLY else 'DRY RUN'}: {total} replacements across {changed} files\n=== BY RULE ===")
for k, v in allrules.most_common(): print(f"  {v:>6}  {k}")
if not APPLY:
    json.dump(samples, open('/tmp/samples.json','w'), indent=1)
    print(f"\n{len(samples)} changed lines captured")
