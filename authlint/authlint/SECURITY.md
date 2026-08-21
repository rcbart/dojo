# Security

authlint tells people it is safe to paste a production token. That is a serious
claim, so this file states exactly what is being claimed, how each part is
verified, and what is deliberately not covered.

## The claim

**Nothing you paste leaves your browser.** No network request carries it, no
storage retains it, and it never enters the URL.

## How each part is enforced

Not "was checked once", but "fails the build if it stops being true".

### No way out of the page

The shipped file contains no `fetch`, `XMLHttpRequest`, `sendBeacon`,
`WebSocket`, `EventSource`, `Worker`, service worker, remote `<img>`,
`<iframe>`, `<form>`, external script, external stylesheet, CSS `@import` or
remote `url()`. `scripts/verify-security.js` greps for every one of them and
fails CI on a hit.

Beyond absence, there is enforcement. The page carries:

```
Content-Security-Policy: default-src 'none'; script-src 'unsafe-inline';
  style-src 'unsafe-inline'; img-src data:; font-src 'none'; connect-src 'none';
  form-action 'none'; base-uri 'none'; object-src 'none'; manifest-src 'none'
```

`default-src 'none'` with `connect-src 'none'` means the browser refuses every
outbound request regardless of what the JavaScript tries. A future edit that
introduced a leak would be blocked by the browser, not merely disapproved of in
review. `test/security.browser.js` proves this by attempting a real `fetch` and
a real image beacon and asserting both are blocked.

### Nothing is retained

No `localStorage`, `sessionStorage`, `indexedDB`, cookies, Cache API or
`window.name`. Checked statically, and checked again in a real browser by
asserting all three storage areas are empty and `document.cookie` is empty
after use.

### Your input never reaches the URL

This matters more than it sounds. Anything in a query string or fragment is
written to session history, sits in the address bar, is sent in the `Referer`
header when you click an outbound link, and is synchronised between devices by
browsers signed into an account.

- The tool never writes to `location`, and `history.pushState` and
  `history.replaceState` are replaced at load with functions that refuse and log
  an error. A future edit cannot quietly start doing it.
- If the page is *opened* with anything in the query string or fragment, for
  example because somebody hand-built a link, it is stripped immediately on
  load before it can be read.
- The static gate asserts that no source file other than the hardening module
  touches `history` or `location`.

### The input is dropped when you leave

Browsers restore form state on reload and on back-forward navigation, and the
back-forward cache keeps a live copy of the page in memory. Neither is a network
leak, and both leave a production token recoverable by the next person at the
keyboard. The input, the findings and the decoded output are all cleared on
`pagehide`.

The cost is that reloading loses your paste. That is the correct trade for a
tool that handles secrets.

### Text helpers are opted out

This is the leak path people miss. Chrome's *enhanced spellcheck* sends the text
you type to Google. Grammarly and similar extensions read text boxes and
transmit their contents. The paste box carries `spellcheck="false"`,
`autocomplete="off"`, `autocorrect="off"`, `data-gramm="false"`,
`data-gramm_editor="false"`, `data-enable-grammarly="false"`, `data-1p-ignore`
and `data-lpignore="true"`, and the gate fails if any of the first four are
removed.

These are requests, not guarantees. An extension can ignore them. See the limits
below.

### Hostile input cannot execute

Everything rendered is HTML-escaped, including the parts of a finding that quote
your artifact back at you: issuers, key identifiers, status codes, claim names.
All of those are attacker-controlled.

`test/security.browser.js` pastes hostile JWTs, hostile SAML and hostile URLs
carrying `<img src=x onerror=...>`, a script-closing sequence and HTML in claim
names, then asserts no script ran, no element was injected and the text
rendered as text.

### It will not run in a frame

`frame-ancestors` only works as a real HTTP header, and this is a static file,
so there is a script guard instead: framed, it breaks out, and if it cannot, it
replaces itself with a refusal. A framed paste box is the shape of a
credential-harvesting page.

### No third party at all

The shipped file references no third-party origin. The icon is an inline data
URI. There are no fonts, no analytics, no error reporting and no CDN.

## Verify it yourself

Do not take any of the above on trust. It is a static file and the whole point
is that you can check it.

```bash
git clone https://github.com/rcbart/authlint && cd authlint
npm ci
npm test                       # the checks themselves
npm run security               # the static gate, every claim above
npx playwright install chromium
npm run security:browser       # the same claims, in a real browser
```

The thirty-second version, with no toolchain: open the page, open DevTools, go
to the Network tab, and use the tool. You will see the document load and nothing
else. Then turn off your network and use it again.

## What is not covered

Being straight about the boundary is part of the claim being worth anything.

**Browser extensions.** An extension with permission to read the page can read
anything on it. The opt-out attributes above are requests that well-behaved
extensions honour, and nothing in a web page can enforce them. If you are
handling something genuinely sensitive, use a clean profile or the downloaded
file.

**A compromised machine.** Keyloggers, screen capture and malware are outside
what any web page can defend against.

**The host.** If you use the hosted copy at roniam.dev, you are trusting that
the file served is the file in this repository. You do not have to: download it
and diff it against `dist/index.html`, or just use your own copy. That option
existing is the point.

**Your clipboard.** Whatever you copied is still in your clipboard afterwards,
and other applications can read it.

**Signature verification.** authlint does not verify signatures, because that
needs a key and keys need the network. **A result with no findings does not mean
a token is genuine.** Verify in your own code, with the algorithm pinned.

## Reporting something

If you find a way to get data out of the page, or a way to make it execute
pasted content, please report it privately first: open a
[security advisory](https://github.com/rcbart/authlint/security/advisories/new)
rather than a public issue. It is a static file with no server and no users to
notify, so the fix is a commit, but a day's notice is appreciated.

For a wrong or missing check, a normal issue is perfect.

## Disclaimer

authlint is free software provided as-is under the [MIT license](LICENSE), which
includes the full warranty and liability disclaimer.

In plain terms: it inspects what an artifact says and how it is assembled. It
does not verify signatures, it cannot see your verification code, and a result
with no findings is **not** a security assessment, a penetration test, a
compliance control or an assurance that anything is safe. Use it only on systems
you are authorised to test. Any decision you make on the basis of its output is
yours, and the author accepts no liability for it.
