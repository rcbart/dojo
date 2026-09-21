#!/usr/bin/env python3
"""Fact-regression gate for the SSO posts.

Reads blog/_sso-fact-guards.md and checks each guard against the post it
names. A `need` guard must match; a `ban` guard must not. Body only: the
YAML front matter and the `#` working-notes block are skipped, so a note
that DESCRIBES a fixed error never satisfies or trips a guard.

  python3 scripts/verify-sso-facts.py                 # all guarded posts
  python3 scripts/verify-sso-facts.py <file> [...]    # only these

Exit 0 clean, 1 if any guard fails.
"""
import re, sys, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GUARDS = os.path.join(ROOT, 'blog', '_sso-fact-guards.md')
POSTS = ['blog/2026-10-04-sso-for-integrations-the-decision.md',
         'blog/2026-10-04-sso-for-integrations.md']

def body(path):
    """The post as a reader sees it: no front matter, no working notes."""
    t = open(os.path.join(ROOT, path), encoding='utf-8').read()
    m = re.match(r'^---\n.*?\n---\n', t, re.S)
    if m:
        t = t[m.end():]
    return '\n'.join(l for l in t.split('\n') if not l.startswith('#'))

def parse():
    guards, cur = [], None
    for raw in open(GUARDS, encoding='utf-8'):
        line = raw.rstrip('\n')
        m = re.match(r'^(file|need|ban|why|est):\s*(.*)$', line)
        if m:
            k, v = m.groups()
            if k == 'file':
                cur = {'file': v.strip(), 'why': '', 'est': ''}
                guards.append(cur)
            elif cur is not None:
                cur[k] = v.strip()
        elif cur is not None and line.startswith('  ') and line.strip():
            for k in ('why', 'est'):
                if cur.get(k):
                    cur[k] += ' ' + line.strip()
                    break
    return [g for g in guards if 'need' in g or 'ban' in g]

def main():
    want = [a for a in sys.argv[1:]]
    targets = want or POSTS
    targets = [t[len(ROOT)+1:] if t.startswith(ROOT + os.sep) else t for t in targets]
    guards = parse()
    bodies = {p: body(p) for p in targets}
    fails = 0
    for g in guards:
        for path, text in bodies.items():
            if g['file'] != 'ANY' and g['file'] != path:
                continue
            pat = g.get('need') or g.get('ban')
            hit = re.search(pat, text, re.I | re.S) is not None
            bad = (not hit) if 'need' in g else hit
            if bad:
                fails += 1
                kind = 'MISSING' if 'need' in g else 'PRESENT'
                print('FAIL  %s  %s: /%s/' % (path, kind, pat))
                print('      %s' % g['why'])
                if g['est']:
                    print('      established %s' % g['est'])
                print()
    checked = sum(1 for g in guards for p in bodies
                  if g['file'] in ('ANY', p))
    if fails:
        print('%d of %d fact guard(s) FAILED across %d post(s).'
              % (fails, checked, len(bodies)))
        return 1
    print('%d fact guard(s) clean across %d post(s).' % (checked, len(bodies)))
    return 0

if __name__ == '__main__':
    sys.exit(main())
