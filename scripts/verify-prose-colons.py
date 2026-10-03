#!/usr/bin/env python3
"""Prose-colon check for blog drafts and posts.

Ron's rule (2 Oct 2026): no colons in prose. A colon is fine in a reference
callout (">! Series:", ">! Scope:"), a heading, a table header, a listing
caption, code, HTTP headers, mermaid labels, front matter and HTML comments.
Everything else is prose and a colon there is a separator we don't use.

Reports every in-sentence colon (": ") and every lead-in colon (line ending
in ":") in prose lines. Report-only by default; --strict exits 1 if any found.

  python3 scripts/verify-prose-colons.py [--strict] FILE...
  python3 scripts/verify-prose-colons.py blog/*.md          # the queue
"""
import io, re, sys

def prose_lines(path):
    s = io.open(path, encoding='utf-8', errors='replace').read()
    if s.startswith('---'):
        parts = s.split('\n---\n', 1)
        s = parts[1] if len(parts) == 2 else s
    s = re.sub(r'(?ms)^[ \t]*(`{3,}|~{3,}).*?^[ \t]*\1[ \t]*$', '', s)   # fences incl. mermaid
    s = re.sub(r'<!--.*?-->', '', s, flags=re.S)                           # comments
    s = re.sub(r'`[^`\n]*`', '`code`', s)                                  # inline code
    s = re.sub(r'\[[^\]\n]*\]\([^)\n]*\)', '[link]', s)                     # link text + target (section titles may carry colons)
    s = re.sub(r'(?m)(?:Long\s*\n?\s*)?form:', 'form.', s)                   # glossary "Long form:" lead-ins are reference
    prev = None
    for i, line in enumerate(s.split('\n'), 1):
        t = line.strip()
        if not t:
            prev = t; continue
        if not t: continue
        if t.startswith('#') or t.startswith('>!'): continue
        if t.startswith('|'):
            if re.match(r'^\|[\s:|-]+\|$', t): continue                     # separator row
            if prev is not None and not prev.startswith('|'): continue    # header row (first row of a table)
        if re.match(r'^(Listing|Figure|Table) \d+:', t): continue
        if re.match(r'^[A-Za-z-]+: \S', t) and len(t) < 60 and ' ' not in t.split(': ',1)[0]:
            continue                                                       # key: value line (http headers)
        yield i, t
        prev = t

def main(argv):
    strict = '--strict' in argv
    files = [a for a in argv if not a.startswith('--')]
    total = 0
    for p in files:
        hits = []
        for i, t in prose_lines(p):
            for m in re.finditer(r'[^\s]: \S', t):
                hits.append((i, 'in-sentence', t[max(0, m.start()-40):m.end()+30]))
            if t.endswith(':'):
                hits.append((i, 'lead-in', t[-70:]))
        if hits:
            print(f'{p}: {len(hits)} prose colon(s)')
            for i, kind, ctx in hits[:40]:
                print(f'  L{i} {kind}: ...{ctx}...')
            total += len(hits)
    print(f'prose colons: {total} across {len(files)} file(s)')
    if strict and total: sys.exit(1)

if __name__ == '__main__':
    main(sys.argv[1:])
