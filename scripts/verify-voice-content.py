#!/usr/bin/env python3
"""Voice check for everything the site actually publishes.

scripts/voice-check.py covers a single markdown post. This covers the rest of
the published surface: the home page, the course index, the rubric, and the
lesson prose in every dojo. It reads prose only, skipping code, math blocks and
SVG, because an identifier is not a spelling mistake.

Fails on an em dash, a British spelling, LLM filler vocabulary, or a leftover
placeholder. Drafts under blog/ are not published and are not checked here.

Also enforces a ratcheting budget on "honest". The word is a claim about the
text rather than a property of it, and once it appears often enough the reader
starts wondering about everything that was not labelled. It went to 77 across
the site before anyone noticed. A handful of uses genuinely earn their place, so
this is a budget rather than a ban: the count may fall, never rise.

  python3 scripts/verify-voice-content.py FILE...
"""
import io, re, sys, collections
HARD = {
 'em dash': r'—',
 'British spelling': r'\b(?:centre|centres|colour|colours|coloured|behaviour|behaviours|behavioural|organisation|organisations|organisational|organise|organised|organises|organising|recognise|recognised|recognises|recognising|recognisable|apologise|analyse|analysed|analyses|analysing|labelled|labelling|travelled|travelling|whilst|learnt|realise|realised|realises|realising|favour|favours|favourite|favourable|honour|honoured|honours|neighbour|neighbours|neighbouring|neighbourhood|flavour|flavours|rumour|humour|prioritise|prioritised|utilise|utilised|defence|defences|licence|licences|programme|programmes|serialise|serialised|serialisation|normalise|normalised|normalisation|initialise|initialised|initialisation|optimise|optimised|optimises|optimising|optimisation|synchronise|synchronised|authorise|authorised|specialise|specialised|customise|customised|summarise|summarised|minimise|minimised|maximise|maximised|maximising|catalogue|catalogues|modelling|modelled|artefact|artefacts|misspelt|enrolment|amongst|judgement|judgements|judgemental|spelt|greyscale|practise|sceptical)\b',
 'LLM vocabulary': r'\b(?:delve|delving|leverage|leveraging|seamless|seamlessly|myriad|pivotal|tapestry|a testament to|in the realm of|load[- ]bearing|it is worth noting|plays a (?:key|vital|crucial) role|navigate the complexities)\b',
 'unfilled placeholder': r'\[(?:TODO|TBD|STORY SLOT|YOUR |STILL NEEDED|EPIGRAPH|PLACEHOLDER)[^\]]*\]',
}
def text_of(p):
    s = io.open(p, encoding='utf-8', errors='replace').read()
    # Markdown: fenced blocks and inline backtick spans are code, not prose.
    # Without this the gate flagged shell and YAML comments inside fences,
    # which is why the crash-course markdown was never in the file list.
    if p.endswith('.md'):
        s = re.sub(r'(?ms)^[ \t]*(`{3,}|~{3,}).*?^[ \t]*\1[ \t]*$', ' ', s)
        s = re.sub(r'`[^`\n]*`', ' ', s)
    s = re.sub(r'<script[^>]*>.*?</script>', ' ', s, flags=re.S|re.I) if p.endswith('.html') else s
    s = re.sub(r'<style[^>]*>.*?</style>', ' ', s, flags=re.S|re.I)
    s = re.sub(r'<pre[^>]*>.*?</pre>', ' ', s, flags=re.S|re.I)
    s = re.sub(r'<code[^>]*>.*?</code>', ' ', s, flags=re.S|re.I)
    s = re.sub(r'<[^>]+>', ' ', s)
    return s
def _prose(t):
    """Strip code, math and SVG out of one prose field."""
    t = re.sub(r'<pre[^>]*>.*?</pre>', ' ', t, flags=re.S)
    t = re.sub(r'<code[^>]*>.*?</code>', ' ', t, flags=re.S)
    t = re.sub(r'<div class="mathblock">.*?</div>', ' ', t, flags=re.S)
    t = re.sub(r'<svg.*?</svg>', ' ', t, flags=re.S)
    return re.sub(r'<[^>]+>', ' ', t)


# A lesson publishes far more prose than its body. The exercise prompt, the
# behavior spec, the hints and the titles are all rendered to the reader, and
# reading only `body:` left every one of them unchecked - which is most of the
# words on the exercise pane.
BACKTICK_FIELD = re.compile(r'\b(?:body|prompt|behavior):\s*`(.*?)`,\n', re.S)
HINTS_FIELD = re.compile(r'\bhints:\s*\[(.*?)\],?\n', re.S)
SQ_STRING = re.compile(r"'((?:[^'\\]|\\.)*)'", re.S)
TITLE_FIELD = re.compile(r"\btitle:\s*'((?:[^'\\]|\\.)*)'")


def js_prose(p):
    """Stream files: every template-literal prose field, minus code and math."""
    s = io.open(p, encoding='utf-8', errors='replace').read()
    out = []
    for m in BACKTICK_FIELD.finditer(s):
        out.append(_prose(m.group(1)))
    for m in HINTS_FIELD.finditer(s):
        for h in SQ_STRING.findall(m.group(1)):
            out.append(_prose(h.replace("\\'", "'")))
    for m in TITLE_FIELD.finditer(s):
        out.append(_prose(m.group(1).replace("\\'", "'")))
    return '\n'.join(out)
tot = collections.Counter()
for p in sys.argv[1:]:
    t = js_prose(p) if re.search(r'content/streams/.*\.js$', p) else text_of(p)
    hits = []
    for name, pat in HARD.items():
        for m in re.finditer(pat, t, re.I):
            w = m.group(0)
            hits.append((name, w)); tot[name] += 1
    if hits:
        c = collections.Counter(h for h in hits)
        print('%-56s %s' % (p, dict(collections.Counter(n for n,_ in hits))))
        for (n, w), k in collections.Counter(hits).most_common(6):
            print('        %3d  %-18s %s' % (k, n, w[:60]))
print('\nTOTAL', dict(tot) or 'clean')

# ---- ratcheting budget on "honest" -------------------------------------------
# The published surface is at zero. The uses that genuinely earn their place all
# live outside this set: a code comment in the test harness, a variable named
# `honest` in the RLHF exercise where it is the technical contrast, and a draft
# whose subject is honesty. If a new one earns it, raise this deliberately and
# say why in the commit. Do not raise it to make a build pass.
HONEST_BUDGET = 0
honest = 0
for p in sys.argv[1:]:
    t = js_prose(p) if re.search(r'content/streams/.*\.js$', p) else text_of(p)
    honest += len(re.findall(r'\bhonest[a-z]*\b', t, re.I))
print('honest: %d of %d budgeted' % (honest, HONEST_BUDGET))
over = honest > HONEST_BUDGET
if over:
    print('\n"honest" is a claim about the text, not a property of it. It is over budget.\n'
          'Say the unflattering thing instead of announcing that you are about to.')

if tot:
    print('\nThese are the tells Ron asked to keep out of his own writing.')
if tot or over:
    sys.exit(1)
