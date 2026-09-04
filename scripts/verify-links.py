#!/usr/bin/env python3
"""Resolve every internal link in the assembled site and fail on one that does not land.

The sitemap gate proves the URLs we advertise exist. It says nothing about the
links inside the pages, which is the other half and the half that broke: a
section renamed, an id changed, a path that quietly stopped being copied.

Checks three things per page:
  1. every href to a path under this site resolves to a real file
  2. every #fragment resolves to an element with that id (or a name= anchor)
  3. every link out of the page to another page's #fragment resolves there too

Usage: python3 verify-links.py _site
"""
import io, os, re, sys
from html.parser import HTMLParser

ROOT = sys.argv[1] if len(sys.argv) > 1 else '_site'

# Runtime-rendered courses build their sections from JavaScript, so an id we
# want may never appear as a literal id= in the file. Collect anything that
# looks like an identifier the app could mount, then only warn on those pages.
DYNAMIC = re.compile(r'/(dev|identity|js|ml|authlint)/index\.html$')


class Grab(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.links = []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if a.get('id'):
            self.ids.add(a['id'])
        if tag == 'a' and a.get('name'):
            self.ids.add(a['name'])
        for key in ('href', 'src'):
            v = a.get(key)
            if v:
                self.links.append((tag, key, v.strip()))


def pages():
    for dirpath, _, files in os.walk(ROOT):
        for f in files:
            if f.endswith('.html'):
                yield os.path.join(dirpath, f)


def parse(path):
    p = Grab()
    p.feed(io.open(path, encoding='utf-8', errors='replace').read())
    return p


cache = {}


def info(path):
    if path not in cache:
        cache[path] = parse(path)
    return cache[path]


def resolve(page, href):
    """Return the file a link points at, or None if it is not a local page."""
    if href.startswith(('http://', 'https://', 'mailto:', 'javascript:',
                        'data:', 'tel:', '//')):
        return None
    target = href.split('#')[0].split('?')[0]
    if not target:
        return page                      # a bare #fragment, same page
    if target.startswith('/'):
        base = os.path.join(ROOT, target.lstrip('/'))
    else:
        base = os.path.normpath(os.path.join(os.path.dirname(page), target))
    if os.path.isdir(base):
        base = os.path.join(base, 'index.html')
    elif not os.path.splitext(base)[1]:
        if os.path.isdir(base):
            base = os.path.join(base, 'index.html')
    return base


bad, warn, checked = [], [], 0

for page in sorted(pages()):
    pg = info(page)
    rel = os.path.relpath(page, ROOT)
    for tag, key, href in pg.links:
        target = resolve(page, href)
        if target is None:
            continue
        checked += 1
        if not os.path.exists(target):
            bad.append('%s: %s "%s" does not resolve (%s)'
                       % (rel, tag, href, os.path.relpath(target, ROOT)))
            continue
        frag = href.split('#', 1)[1] if '#' in href else ''
        if not frag or not target.endswith('.html'):
            continue
        tids = info(target).ids
        if frag in tids:
            continue
        # An id can be written as a literal attribute the HTMLParser missed
        # (inside a template literal, say), so look for it in the raw text too.
        raw = io.open(target, encoding='utf-8', errors='replace').read()
        if ('id="%s"' % frag) in raw or ("id='%s'" % frag) in raw:
            continue
        # The looser test - the fragment name appearing anywhere as a quoted
        # string - used to be applied to EVERY page. That is not a check: any
        # fragment whose name happens to be a JS string literal passed without
        # the element existing anywhere. /#click and /#keydown both slipped
        # through on the home page that way. It is only defensible for the
        # runtime-rendered courses, which really do mount sections from JS, so
        # it is now restricted to pages DYNAMIC matches - and even there it only
        # downgrades the finding to a note, it does not silence it.
        if DYNAMIC.search(target) and ("'%s'" % frag) in raw:
            warn.append('%s: "%s" only matches a quoted string in %s (dynamic page)'
                        % (rel, href, os.path.relpath(target, ROOT)))
            continue
        msg = '%s: "%s" has no matching id in %s' % (rel, href, os.path.relpath(target, ROOT))
        (warn if DYNAMIC.search(target) else bad).append(msg)

print('%d internal link(s) checked across %d page(s)' % (checked, len(list(pages()))))
for w in warn:
    print('  note: ' + w)
if bad:
    print('\n%d broken:' % len(bad))
    for b in bad:
        print('  ' + b)
    sys.exit(1)
print('every internal link resolves, fragments included')
