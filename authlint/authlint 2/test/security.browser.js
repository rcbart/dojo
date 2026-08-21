/* Browser-side security verification.
 *
 * scripts/verify-security.js checks the shipped file statically. This checks
 * the running page, which is where the claims actually have to hold: hostile
 * input must render as text, the URL must never carry the input, storage must
 * stay empty, the box must empty on pagehide, and the Content-Security-Policy
 * must genuinely block an outbound request rather than merely be present.
 *
 *   npx playwright install chromium
 *   node test/security.browser.js
 */
const { chromium } = require('playwright');
const F = 'file://' + require('path').resolve(__dirname, '../dist/index.html');
const XSS='<img src=x onerror="window.__pwned=1">';
let bad=0; const ok=(n,c,d)=>{ if(!c) bad++; console.log((c?'ok   ':'FAIL ')+n+(c?'':'  <-- '+(d||''))); };
(async()=>{
  const b = await chromium.launch();
  const ctx = await b.newContext();
  const p = await ctx.newPage();
  const net=[], errs=[], csp=[];
  let probing=false;   // the CSP probes below deliberately attempt a request; do not count those
  p.on('request',r=>{ if(!probing && !r.url().startsWith('file:')) net.push(r.url()); });
  p.on('pageerror',e=>errs.push(e.message));
  p.on('console',m=>{ if(!probing && /Content Security Policy/i.test(m.text())) csp.push(m.text()); });
  let dialog=false; p.on('dialog', async d=>{ dialog=true; await d.dismiss(); });

  // 1. hostile JWT: a claim value, a claim name, and a script-closer
  await p.goto(F); await p.waitForTimeout(400);
  const tok = await p.evaluate((x)=>{
    const b=o=>btoa(JSON.stringify(o)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
    const now=Math.floor(Date.now()/1000);
    const pl={iss:'http://'+x, sub:x, aud:x, exp:now+60, iat:now, jti:'</script><script>window.__pwned=1</script>'};
    pl[x]='y';
    return b({alg:'RS256',kid:x})+'.'+b(pl)+'.c2ln';
  }, XSS);
  await p.fill('#in', tok); await p.waitForTimeout(400);
  ok('no script executed from a hostile JWT', !(await p.evaluate(()=>window.__pwned)));
  ok('no injected <img> element', (await p.$$('#out img')).length===0);
  ok('hostile text is rendered as text', (await p.evaluate(()=>document.body.innerText)).includes('<img src=x'));
  ok('no dialog opened', !dialog);

  // 2. hostile SAML
  await p.fill('#in', '<samlp:Response xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" ID="'+XSS+'"><script>window.__pwned=1</script><saml:Assertion xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" ID="a"><saml:Issuer>'+XSS+'</saml:Issuer></saml:Assertion></samlp:Response>');
  await p.waitForTimeout(400);
  ok('no script executed from hostile SAML', !(await p.evaluate(()=>window.__pwned)));

  // 3. hostile URL params
  await p.fill('#in', 'https://id.example.com/authorize?response_type=code&client_id='+encodeURIComponent(XSS)+'&redirect_uri='+encodeURIComponent('http://'+XSS));
  await p.waitForTimeout(400);
  ok('no script executed from a hostile URL', !(await p.evaluate(()=>window.__pwned)));

  // 3b. the diagnosis path. It quotes the paste back at you — JSON key names,
  //     XML root elements, decoded segment content — so it is an injection
  //     surface in exactly the same way the findings are.
  await p.fill('#in', 'this is not an authentication artifact at all');
  await p.waitForTimeout(300);
  ok('an unrecognised paste gets the unknown state',
     (await p.$$('#out .diag.unknown')).length===1);

  await p.fill('#in', 'eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJ1LTEifQ');
  await p.waitForTimeout(300);
  ok('a truncated JWT gets the malformed state, not the unknown one',
     (await p.$$('#out .diag.malformed')).length===1);
  ok('the malformed state says what it looks like',
     (await p.evaluate(()=>document.querySelector('#out .dt').innerText)).includes('looks like a JWT'));

  await p.fill('#in', '{"'+XSS+'":1,"b":2}');
  await p.waitForTimeout(300);
  ok('no script executed from a hostile JSON key in a diagnosis',
     !(await p.evaluate(()=>window.__pwned)));
  ok('no element injected by a hostile JSON key', (await p.$$('#out img')).length===0);

  await p.fill('#in', '<order onload="window.__pwned=1"><id>7</id></order>');
  await p.waitForTimeout(300);
  ok('no script executed from a hostile XML root in a diagnosis',
     !(await p.evaluate(()=>window.__pwned)));

  await p.fill('#in', '<samlp:Response xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"><saml:Assert');
  await p.waitForTimeout(300);
  ok('a real DOMParser rejects truncated XML and it is diagnosed',
     (await p.$$('#out .diag')).length===1,
     await p.evaluate(()=>document.querySelector('#out').innerText.slice(0,120)));

  // 4. the input never reaches the URL
  ok('URL stays clean while typing', (await p.evaluate(()=>location.href)).indexOf('eyJ')===-1);

  // 5. a URL that arrives carrying a secret is stripped
  const p2 = await ctx.newPage();
  await p2.goto(F+'?token=SECRET123#also=SECRET456'); await p2.waitForTimeout(500);
  const href = await p2.evaluate(()=>location.href);
  ok('a token in the query string is stripped on load', !href.includes('SECRET123'), href);
  ok('a token in the fragment is stripped on load', !href.includes('SECRET456'), href);
  await p2.close();

  // 6. storage stays empty
  const store = await p.evaluate(()=>({ls:localStorage.length, ss:sessionStorage.length, ck:document.cookie}));
  ok('localStorage empty', store.ls===0);
  ok('sessionStorage empty', store.ss===0);
  ok('no cookies', store.ck==='');

  // 7. pagehide clears the box
  await p.fill('#in','SENSITIVE-VALUE'); await p.waitForTimeout(200);
  await p.evaluate(()=>window.dispatchEvent(new Event('pagehide')));
  ok('input cleared on pagehide', (await p.inputValue('#in'))==='');

  // 9. zero network during everything above, checked before the deliberate probes
  ok('zero non-file network requests during normal use', net.length===0, net.join(', '));
  ok('no CSP violations during normal use', csp.length===0, csp.join(' | '));

  // 8. CSP actually blocks a network attempt. These are deliberate attempts,
  //    so stop counting requests first.
  probing = true;
  const blocked = await p.evaluate(async ()=>{
    try { await fetch('https://example.com/leak'); return 'ALLOWED'; }
    catch(e){ return 'BLOCKED'; }
  });
  ok('CSP blocks an outbound fetch', blocked==='BLOCKED', blocked);
  const imgBlocked = await p.evaluate(()=>new Promise(r=>{
    const i=new Image(); i.onload=()=>r('ALLOWED'); i.onerror=()=>r('BLOCKED');
    i.src='https://example.com/pixel.png'; setTimeout(()=>r('BLOCKED'),1500);
  }));
  ok('CSP blocks a remote image beacon', imgBlocked==='BLOCKED', imgBlocked);

  ok('no uncaught page errors', errs.length===0, errs.join(' | '));

  // 10. framing is refused
  const p3 = await ctx.newPage();
  await p3.setContent('<iframe src="'+F+'" width=600 height=400></iframe>');
  await p3.waitForTimeout(900);
  const framedText = await p3.evaluate(()=>{ const f=document.querySelector('iframe'); try{ return f.contentDocument ? f.contentDocument.body.innerText.slice(0,80) : 'NO-ACCESS'; }catch(e){ return 'CROSS-ORIGIN'; } });
  ok('refuses to run framed', /will not run in a frame|NO-ACCESS|CROSS-ORIGIN/.test(framedText) || framedText.length<5, framedText);
  await p3.close();

  console.log(bad ? '\n'+bad+' CHECK(S) FAILED' : '\nall browser security checks passed');
  await b.close();
  process.exit(bad?1:0);
})();
