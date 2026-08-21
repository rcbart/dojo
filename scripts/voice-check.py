#!/usr/bin/env python3
"""Voice and AI-tell check for posts written under Ron's name.

Usage: python3 scripts/voice-check.py blog/2026-08-25-some-post.md

Exits non-zero if a hard rule is broken (em dashes, British spellings,
LLM vocabulary, leftover placeholders, burstiness below 7).
The conventions this enforces are documented in CLAUDE.md.
"""
import re
import statistics
import sys
from collections import Counter

if len(sys.argv) < 2:
    sys.exit("usage: voice-check.py <post.md>")

raw = open(sys.argv[1], encoding='utf-8').read()
text = re.sub(r'^---.*?---', '', raw, flags=re.S)          # strip front matter
# Code is not prose. A fenced block full of `exercise.run.call` was being read as
# an unfilled placeholder, and identifiers are not subject to spelling rules.
text = re.sub(r'```.*?```', '', text, flags=re.S)
text = re.sub(r'`[^`\n]+`', '', text)
body = re.sub(r'^(#|>).*$', '', text, flags=re.M)          # strip headings/quotes
body = re.sub(r'\*\*(.*?)\*\*', r'\1', body)

sents = [s.strip() for s in re.split(r'(?<=[.!?])\s+', body) if len(s.strip()) > 3]
lens = [len(s.split()) for s in sents]
burst = statistics.pstdev(lens) if len(lens) > 1 else 0.0

print(f"words {len(body.split())} · sentences {len(sents)} · "
      f"mean {statistics.mean(lens):.1f} · burstiness {burst:.1f}")
print(f"under 6 words: {sum(1 for n in lens if n < 6)}   "
      f"over 30: {sum(1 for n in lens if n > 30)}")
print(f"contractions: {len(re.findall(chr(39) + '(t|ve|re|ll|m|s|d)', text))}")
print()

HARD = {
    'em dash': r'—',
    'British spelling': r'\b(centre|colour|behaviour|organis|recognis|apologis|'
                        r'analyse|labelled|travelled|whilst|learnt|realis|favour|honour|'
                        r'neighbour|flavour|rumour|humour|'
                        r'prioritis|utilis|defence|licence|programme)[a-z]*',
    'LLM vocabulary': r'\b(delve|leverage|robust|seamless|myriad|pivotal|crucial|'
                      r'tapestry|realm|underscore|testament)\b',
    'unfilled placeholder': r'\[[A-Za-z][^\]]{4,}\]',
}
SOFT = {
    'self-deprecation': r"\b(took me a while|eventually|finally|I made \w+ mistakes?|"
                        r"had to unlearn|for years|that surprised me)\b",
    '"not just X but Y"': r'\bnot (just|only|merely)\b',
    '"it\'s not about X, it\'s about Y"': r"not about \w+[,.] it'?s about",
    '"at the end of the day"': r'\bat the end of the day\b',
    '"moreover / furthermore / that being said"':
        r'\b(that being said|moreover|furthermore|additionally,)\b',
    'rule-of-three noun list': r'\b\w+, \w+,? and \w+\.',
    '"the key is / the truth is"': r'\b(the key is|the truth is|the reality is)\b',
    'hedge stacking': r'\b(arguably|somewhat|perhaps|relatively speaking)\b',
    'aphoristic closer': r'(?m)^[A-Z][^.\n]{10,60} is not [^.\n]{3,40}\. '
                         r'It(?:\'s| is) [^.\n]{3,50}\.$',
}

failed = False
print("hard rules")
for name, pat in HARD.items():
    hits = re.findall(pat, text, re.I)
    if hits:
        failed = True
        sample = hits[0] if isinstance(hits[0], str) else hits[0][0]
        print(f"  FAIL  {len(hits):>3}  {name}   e.g. {str(sample)[:60]!r}")
    else:
        print(f"  ok      0  {name}")

if burst < 7:
    failed = True
    print(f"  FAIL       burstiness {burst:.1f} is below 7 (reads uniform)")
else:
    print(f"  ok         burstiness {burst:.1f}")

print("\nsoft flags (judgement, not failure)")
for name, pat in SOFT.items():
    n = len(re.findall(pat, text, re.I))
    if n:
        print(f"  {n:>3}  {name}{'   <-- ' if n > 2 else ''}")

openers = Counter(s.split()[0].lower().strip('",') for s in sents if s.split())
print("\nopeners:", openers.most_common(7))

paras = [p for p in re.split(r'\n\s*\n', body) if len(p.split()) > 15]
if paras:
    plens = [len(p.split()) for p in paras]
    print(f"paragraphs >15w: {len(paras)} · mean {statistics.mean(plens):.0f}w · "
          f"longest {max(plens)}w")

sys.exit(1 if failed else 0)
