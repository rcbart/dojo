#!/usr/bin/env python3
"""Voice check for everything the site actually publishes.

scripts/voice-check.py covers a single markdown post. This covers the rest of
the published surface: the home page, the course index, the rubric, and the
lesson prose in every dojo. It reads prose only, skipping code, math blocks and
SVG, because an identifier is not a spelling mistake.

Fails on an em dash, a British spelling, LLM filler vocabulary, or a leftover
placeholder. Drafts under blog/ are not published and are not checked here.

  python3 scripts/verify-voice-content.py FILE...
"""
import io, re, sys, collections
HARD = {
 'em dash': r'—',
 'British spelling': r'\b(?:centre|centres|colour|colours|coloured|behaviour|behaviours|behavioural|organisation|organisations|organisational|organise|organised|organises|organising|recognise|recognised|recognises|recognising|recognisable|apologise|analyse|analysed|analyses|analysing|labelled|labelling|travelled|travelling|whilst|learnt|realise|realised|realises|realising|favour|favours|favourite|favourable|honour|honoured|honours|neighbour|neighbours|neighbouring|neighbourhood|flavour|flavours|rumour|humour|prioritise|prioritised|utilise|utilised|defence|defences|licence|licences|programme|programmes|serialise|serialised|serialisation|normalise|normalised|normalisation|initialise|initialised|initialisation|optimise|optimised|optimises|optimising|optimisation|synchronise|synchronised|authorise|authorised|specialise|specialised|customise|customised|summarise|summarised|minimise|minimised|maximise|maximised|maximising|catalogue|catalogues|modelling|modelled|artefact|artefacts|misspelt|enrolment|amongst|spelt|greyscale|practise|sceptical)\b',
 'LLM vocabulary': r'\b(?:delve|delving|leverage|leveraging|seamless|seamlessly|myriad|pivotal|tapestry|a testament to|in the realm of|it is worth noting|plays a (?:key|vital|crucial) role|navigate the complexities)\b',
 'unfilled placeholder': r'\[(?:TODO|TBD|STORY SLOT|YOUR |STILL NEEDED|EPIGRAPH|PLACEHOLDER)[^\]]*\]',
}
def text_of(p):
    s = io.open(p, encoding='utf-8', errors='replace').read()
    s = re.sub(r'<script[^>]*>.*?</script>', ' ', s, flags=re.S|re.I) if p.endswith('.html') else s
    s = re.sub(r'<style[^>]*>.*?</style>', ' ', s, flags=re.S|re.I)
    s = re.sub(r'<pre[^>]*>.*?</pre>', ' ', s, flags=re.S|re.I)
    s = re.sub(r'<code[^>]*>.*?</code>', ' ', s, flags=re.S|re.I)
    s = re.sub(r'<[^>]+>', ' ', s)
    return s
def js_prose(p):
    """Stream files: take only the template-literal bodies, minus code and math."""
    s = io.open(p, encoding='utf-8', errors='replace').read()
    out = []
    for m in re.finditer(r'body:\s*`(.*?)`,\n', s, re.S):
        t = m.group(1)
        t = re.sub(r'<pre[^>]*>.*?</pre>', ' ', t, flags=re.S)
        t = re.sub(r'<code[^>]*>.*?</code>', ' ', t, flags=re.S)
        t = re.sub(r'<div class="mathblock">.*?</div>', ' ', t, flags=re.S)
        t = re.sub(r'<svg.*?</svg>', ' ', t, flags=re.S)
        out.append(re.sub(r'<[^>]+>', ' ', t))
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
if tot:
    print('\nThese are the tells Ron asked to keep out of his own writing.')
    sys.exit(1)
