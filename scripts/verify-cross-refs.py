#!/usr/bin/env python3
"""Resolve every cross-reference in the guide against the headings that exist.

The guide leans on its own scaffolding: 258 references of the form "chapter 12",
"section 3.3", "§ 15.b", "(ch. 10)" and "Appendix B". That scaffolding is what
lets a reader arrive at chapter 15 and be pointed back to the audience rule
rather than have it restated. It is also the first thing a renumbering breaks,
and it breaks silently: the prose still reads fine, the link is just a lie.

So this gate builds the set of headings the guide actually contains and checks
every reference against it. A reference to a chapter that does not exist, or to
a section inside a chapter that has no such subsection, fails the build.

It is deliberately not a link checker. These are prose references, not URLs.
What it verifies is that the target exists, not that the sentence around it is
still true, which no gate can do.

    python3 scripts/verify-cross-refs.py blog/_mcp-auth-guide/*.md
"""

import glob
import re
import sys
from collections import defaultdict

# Targets: "# Chapter 12. ...", "## 12.a ...", "## 12.1 ...", "# Appendix B. ..."
CHAPTER_H = re.compile(r'^#\s+Chapter\s+(\d+)\b', re.M)
APPENDIX_H = re.compile(r'^#\s+Appendix\s+([A-Z])\b', re.M)
SECTION_H = re.compile(r'^##\s+([0-9]+|[A-Z])\.([0-9a-z]+)\b', re.M)

# References, each capturing the target it claims exists.
#
# The book cites other people's documents in the same breath as its own, so
# "section 7.5.1 of the draft" and "section 4.2 of RFC 7636" have to be left
# alone. Two things separate them from an internal reference: an external one
# names its document straight after, and the book's own sections are one level
# deep (12.a, 15.3) while specs go deeper (7.5.1). Both tests are applied.
REFS = [
    # "(ch. 8, 17)" and "Ch. 9, 21" cite two chapters each. Capturing only the
    # first number is how a wrong second one survived a renumbering, so the whole
    # run is captured here and split into numbers below.
    ('chapter-run', re.compile(r'\bch(?:\.|apters?)\s*'
                               r'(\d+(?:\s*(?:,|and)\s*\d+)*)', re.I)),
    # re.I matters: "Section 15.3 covers..." at the start of a sentence was
    # invisible to a lowercase-only pattern, which is how five references to a
    # section deleted in a split went on resolving for weeks.
    ('section', re.compile(r'\bsections?\s+(\d+\.[0-9a-z]+)(?![0-9a-z.])', re.I)),
    ('section', re.compile(r'§\s*([0-9]+\.[0-9a-z]+|[A-Z]\.[0-9a-z]+)(?![0-9a-z.])')),
    ('appendix', re.compile(r'\bAppendix\s+([A-Z])\b')),
]

# What marks the citation as somebody else's document rather than this one.
EXTERNAL = re.compile(r'^\s*(?:of|in|from)\s+(?:the\s+)?'
                      r'(?:draft|spec|specification|RFC|standard|BCP|profile)\b', re.I)


def collect_targets(files):
    chapters, appendices = set(), set()
    sections = defaultdict(set)
    for path in files:
        text = open(path, encoding='utf-8').read()
        chapters.update(CHAPTER_H.findall(text))
        appendices.update(APPENDIX_H.findall(text))
        for owner, sub in SECTION_H.findall(text):
            sections[owner].add(sub)
    return chapters, appendices, sections


def main(patterns):
    files = sorted({p for pat in patterns for p in glob.glob(pat)})
    if not files:
        print('verify-cross-refs: no files matched', file=sys.stderr)
        return 1

    chapters, appendices, sections = collect_targets(files)
    if not chapters:
        print('verify-cross-refs: no chapter headings found, is the path right?',
              file=sys.stderr)
        return 1

    broken, checked = [], 0
    for path in files:
        lines = open(path, encoding='utf-8').read().split('\n')
        in_comment = False
        for lineno, line in enumerate(lines, 1):
            stripped = line.lstrip()
            # Ledger comments run to several lines. Skipping only the line that
            # opens one left every continuation line being checked, which is how
            # a note *about* another document's section numbering failed a build.
            if in_comment:
                if '-->' in line:
                    in_comment = False
                continue
            if stripped.startswith('<!--'):
                if '-->' not in line:
                    in_comment = True
                continue                       # ledger comments never ship
            if stripped.startswith('|') and 'diagram-index' in path:
                continue                       # the diagram index cites by design
            # The qualifier that marks a citation as somebody else's document can
            # wrap: "section 13.15 of the\ndraft". Looking at the rest of this
            # line only, the gate saw " of the" and called it an internal
            # reference. So the next line comes along for the test.
            nxt = lines[lineno] if lineno < len(lines) else ''
            for kind, pattern in REFS:
                for m in pattern.finditer(line):
                    if EXTERNAL.match(line[m.end():] + ' ' + nxt.strip()):
                        continue                   # citing a spec, not this book
                    target = m.group(1)
                    checked += 1
                    if kind == 'chapter-run':
                        checked += len(re.findall(r'\d+', target)) - 1
                        for one in re.findall(r'\d+', target):
                            if one not in chapters:
                                broken.append((path, lineno, f'chapter {one}'))
                    elif kind == 'chapter' and target not in chapters:
                        broken.append((path, lineno, f'chapter {target}'))
                    elif kind == 'appendix' and target not in appendices:
                        broken.append((path, lineno, f'Appendix {target}'))
                    elif kind == 'section':
                        owner, _, sub = target.partition('.')
                        if owner not in sections or sub not in sections[owner]:
                            broken.append((path, lineno, f'section {target}'))

    for path, lineno, target in broken:
        print(f'  {path}:{lineno}: points at {target}, which does not exist',
              file=sys.stderr)

    if broken:
        print(f'\n{len(broken)} cross-reference(s) point at nothing. A renumbering '
              f'usually did this.', file=sys.stderr)
        return 1

    print(f'cross-references: {checked} resolve across {len(files)} file(s) '
          f'({len(chapters)} chapters, {len(appendices)} appendices).')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:] or ['blog/_mcp-auth-guide/*.md']))
