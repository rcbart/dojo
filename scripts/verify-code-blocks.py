#!/usr/bin/env python3
"""Parse every fenced code block in the prose, so a snippet cannot rot quietly.

The MCP guide ships code a reader is expected to paste. A wrong diagram is
obvious and a wrong snippet is not: it looks like code, it reads like code,
and it fails in their editor rather than in our build. The dogfooding gate
exists because a model answer that stopped passing was invisible from the
learner's side; this is the same argument applied to prose.

What it does, and deliberately not more. Python blocks are parsed with `ast`,
so syntax errors and bad indentation fail the build. JSON blocks are parsed
with `json.loads`, which catches the trailing comma and the smart quote. HTTP
blocks are checked for a request line or a status line, which is enough to
catch a mangled paste. Nothing here executes anything, and nothing here
type-checks: a snippet can be valid and still be wrong, which is what the
worked test vectors in the prose are for.

REPL blocks (lines starting with >>>) are transcripts of a session, not source,
so they are checked for the prompt shape and otherwise left alone.

    python3 scripts/verify-code-blocks.py blog/_mcp-auth-guide/*.md
"""

import ast
import glob
import json
import re
import sys

FENCE = re.compile(r'^```([A-Za-z0-9_+-]*)\n(.*?)^```', re.S | re.M)
STATUS = re.compile(r'^HTTP/\d(?:\.\d)? \d{3}\b')
REQUEST = re.compile(r'^[A-Z]{3,7} \S+ HTTP/\d(?:\.\d)?$')


def check_python(body):
    if body.lstrip().startswith('>>>'):
        for line in body.splitlines():
            if line and not line.startswith(('>>>', '...', "'", '"')):
                continue
        return None                      # a transcript, not a module
    ast.parse(body)
    return None


def check_json(body):
    json.loads(body)
    return None


def check_http(body):
    first = body.strip().splitlines()[0] if body.strip() else ''
    if not (STATUS.match(first) or REQUEST.match(first)):
        return f'first line is neither a request line nor a status line: {first[:60]!r}'
    return None


CHECKERS = {'python': check_python, 'py': check_python,
            'json': check_json, 'http': check_http}


def main(patterns):
    files = sorted({p for pat in patterns for p in glob.glob(pat)})
    if not files:
        print('verify-code-blocks: no files matched', file=sys.stderr)
        return 1

    checked = skipped = 0
    failures = []
    for path in files:
        with open(path, encoding='utf-8') as fh:
            text = fh.read()
        for n, (lang, body) in enumerate(FENCE.findall(text), 1):
            checker = CHECKERS.get(lang.lower())
            if checker is None:
                skipped += 1
                continue
            try:
                problem = checker(body)
                if problem:
                    failures.append((path, n, lang, problem))
                else:
                    checked += 1
            except (SyntaxError, ValueError) as exc:
                failures.append((path, n, lang, f'{type(exc).__name__}: {exc}'))

    for path, n, lang, problem in failures:
        print(f'  {path}: block {n} [{lang}] {problem}', file=sys.stderr)

    if failures:
        print(f'\n{len(failures)} code block(s) do not parse. '
              f'A reader would paste these.', file=sys.stderr)
        return 1

    print(f'code blocks: {checked} parsed clean across {len(files)} file(s), '
          f'{skipped} unlabeled block(s) skipped.')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:] or ['blog/_mcp-auth-guide/*.md']))
