#!/usr/bin/env python3
"""Fail the build when prose drifts back toward the shape that reads as machine-written.

An alpha tester read three Identity lessons in September 2026 and said they read
as AI-written even though every fact checked out. The tells were structural
rather than vocabulary: a sentence mean near 21 words, a parenthetical every
hundred words, and no short sentences anywhere to break the rhythm. Vocabulary is
already gated by voice-check.py and verify-voice-content.py. Nothing was watching
the shape, which is how the MCP guide reached a 21.2-word mean without one gate
complaining.

    python3 scripts/verify-readability.py blog/_mcp-auth-guide/*.md
    python3 scripts/verify-readability.py posts/*.md

Measured on prose only. Code fences, tables, headings, diagram lines, front
matter and ledger comments are removed first, because none of them are sentences
and all of them wreck the mean.
"""

import glob
import re
import statistics
import sys

# Thresholds. Set from measurement rather than taste: the guide's chapters sit
# between 16 and 22 after the September pass, and the two files that genuinely
# read badly at the time were both above 28.
MAX_MEAN = 23.0          # average words per sentence
MIN_BURST = 7.0          # standard deviation of sentence length, Ron's rule
MIN_CONTRACTIONS = 8.0   # per 1000 words; the guide runs around 21
MAX_SENTENCE = 65        # one sentence, in words
MAX_PARENS = 12.0        # prose asides per 1000 words, the tester's tell.
                         # Checked only above 400 words: below that one aside
                         # moves the ratio more than the writing does.
MIN_PROSE = 120          # below this, a file is a table and not prose

# Reference files whose entries are deliberately not sentences.
ENTRY_SHAPED = ('glossary', 'diagram-index')

CONTRACTION = re.compile(r"\b\w+'(?:s|t|re|ve|ll|d|m)\b", re.I)
# A parenthetical that is a citation is not the tell. "(chapter 10)", "(12.1)",
# "(RFC 8693)" and "(9.c step 6)" are the book's cross-reference scaffolding and
# the reader skips them. What the tester noticed was the prose aside.
CITATION = re.compile(r'^\(\s*(?:ch\.|chapters?|sections?|§|RFC|draft|Appendix|'
                      r'[0-9]+\.[0-9a-z]+|[A-Z]\.[0-9a-z]+)\b', re.I)
PAREN = re.compile(r'\([^)]{12,}\)')


def prose(text):
    text = re.sub(r'^---\n.*?\n---\n', '', text, flags=re.S)   # front matter
    text = re.sub(r'<!--.*?-->', '', text, flags=re.S)         # ledger comments
    text = re.sub(r'```.*?```', '', text, flags=re.S)          # code
    text = re.sub(r'^\|.*$', '', text, flags=re.M)             # tables
    text = re.sub(r'^!\[.*$', '', text, flags=re.M)            # diagram lines
    text = re.sub(r'^#{1,6} .*$', '', text, flags=re.M)        # headings
    text = re.sub(r'`[^`]*`', 'X', text)                       # inline code is one word
    return text


def sentences(text):
    """Paragraph first, then sentence. Splitting the whole file at once merges a
    paragraph that ends on a colon with the one after it, which invents
    eighty-word sentences nobody wrote and hides the real ones."""
    out = []
    blocks = re.split(r'\n\s*\n|\n(?=\s*(?:[-*+]\s|\d+\.\s|>))', text)
    for para in blocks:
        para = para.strip()
        if not para:
            continue
        # The closing-markup class matters: "grant.** Every" has no whitespace
        # straight after the period, so a bare (?<=[.!?])\s+ runs two sentences
        # together and reports a 67-word one that nobody wrote.
        for part in re.split(r'(?<=[.!?])[*_`"\')\]]*\s+(?=[A-Za-z"*`\[])',
                             para.replace('\n', ' ')):
            words = len(re.findall(r"[A-Za-z0-9][\w'-]*", part))
            if words >= 3:
                out.append(words)
    return out


def check(path):
    body = prose(open(path, encoding='utf-8').read())
    lengths = sentences(body)
    words = sum(lengths)
    if words < MIN_PROSE:
        return [], f'{path}: {words} prose words, too few to measure'

    mean = statistics.mean(lengths)
    burst = statistics.pstdev(lengths)
    contractions = 1000 * len(CONTRACTION.findall(body)) / words
    asides = [x for x in PAREN.findall(body) if not CITATION.match(x)]
    parens = 1000 * len(asides) / words
    longest = max(lengths)
    entry_shaped = any(k in path for k in ENTRY_SHAPED)

    fails = []
    if mean > MAX_MEAN and not entry_shaped:
        fails.append(f'mean sentence {mean:.1f} words, over {MAX_MEAN}')
    if burst < MIN_BURST:
        fails.append(f'burstiness {burst:.1f}, under {MIN_BURST}: '
                     f'no short sentences breaking the long ones')
    if contractions < MIN_CONTRACTIONS:
        fails.append(f'contractions {contractions:.1f} per 1000, under '
                     f'{MIN_CONTRACTIONS}')
    if longest > MAX_SENTENCE and not entry_shaped:
        fails.append(f'longest sentence {longest} words, over {MAX_SENTENCE}')
    if parens > MAX_PARENS and words >= 400:
        fails.append(f'parentheticals {parens:.1f} per 1000, over {MAX_PARENS}')

    line = (f'{path}: {words}w mean {mean:.1f} burst {burst:.1f} '
            f'contr {contractions:.1f} longest {longest}')
    return fails, line


def main(patterns):
    files = sorted({p for pat in patterns for p in glob.glob(pat)})
    if not files:
        print('verify-readability: no files matched', file=sys.stderr)
        return 1

    bad = 0
    for path in files:
        fails, line = check(path)
        print(f'  {line}')
        for f in fails:
            print(f'    FAIL {f}', file=sys.stderr)
            bad += 1

    if bad:
        print(f'\n{bad} readability failure(s). The fix is cutting rather than '
              f'rewriting: split the sentence, delete the aside, contract.',
              file=sys.stderr)
        return 1

    print(f'readability: {len(files)} file(s) within thresholds.')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:] or ['blog/_mcp-auth-guide/*.md']))
