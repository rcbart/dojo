/* ============================== BOOT ============================== */
mergeIdentity();renderNav();renderHome();refreshBelt();

/* ---- interactive JWT tamper demo (used by the OAuth/JWT/JOSE stream, lesson jose5) ---- */
window.jwtTamper=(function(){
  const enc=new TextEncoder();
  function b64url(buf){let s=btoa(String.fromCharCode.apply(null,new Uint8Array(buf)));return s.replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
  function unb64(s){return Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));}
  function el(id){return document.getElementById(id);}
  const S={};
  async function gen(){
    const st=el('jt-status'); if(!st)return;
    if(!(window.crypto&&crypto.subtle)){st.style.color='#f5b301';st.textContent='Web Crypto is unavailable in this browser context, so the live demo can’t run here.';return;}
    const header={alg:'ES256',typ:'JWT'};
    const payload={sub:'user-1234',role:'user',iss:'https://auth.example.com'};
    S.headerB64=b64url(enc.encode(JSON.stringify(header)));
    S.payloadText=JSON.stringify(payload,null,2);
    const kp=await crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},true,['sign','verify']);
    S.pub=kp.publicKey;S.priv=kp.privateKey;
    const input=S.headerB64+'.'+b64url(enc.encode(S.payloadText));
    S.origSigB64=b64url(await crypto.subtle.sign({name:'ECDSA',hash:'SHA-256'},S.priv,enc.encode(input)));
    el('jt-payload').value=S.payloadText;
    el('jt-gen').textContent='Re-generate & sign';
    await edit(el('jt-payload'));
  }
  async function edit(ta){
    if(!S.priv)return;
    const input=S.headerB64+'.'+b64url(enc.encode(ta.value));
    const valid=await crypto.subtle.verify({name:'ECDSA',hash:'SHA-256'},S.pub,unb64(S.origSigB64),enc.encode(input));
    const reqB64=b64url(await crypto.subtle.sign({name:'ECDSA',hash:'SHA-256'},S.priv,enc.encode(input)));
    el('jt-siginput').textContent=input;
    el('jt-origsig').textContent=S.origSigB64;
    el('jt-newsig').textContent=reqB64;
    el('jt-token').textContent=input+'.'+S.origSigB64;
    const st=el('jt-status');
    if(valid){st.style.color='#22c55e';st.textContent='✔ Signature VALID — the payload matches what was signed.';}
    else{st.style.color='#ef4444';st.textContent='✘ Signature INVALID — you changed the payload, so it no longer matches the signature: verification FAILS. Forging a matching signature would need the issuer’s private key, which an attacker doesn’t have.';}
    const d=el('jt-diff');
    if(d)d.textContent=(S.origSigB64===reqB64)?'identical — payload untouched':'completely different — changing even one character of the payload changes the entire signature';
  }
  return {gen,edit};
})();
