#!/usr/bin/env node
// Every capitalized acronym a dojo uses in lesson prose that has no glossary
// entry and so no click-to-explain popup. Noisy by design (HR, URI, TV show up);
// read the top of the list, not the tail.
//   node scripts/verify-acronyms.js . identity-dojo
const fs=require('fs'),path=require('path');
const REPO=process.argv[2],DOJO=process.argv[3];
const g=new Function('document','window',fs.readFileSync(path.join(REPO,'engine/glossary.js'),'utf8')+'\n;return {KW,GLOSS_ALL};')({getElementById:()=>null,addEventListener:()=>{}},{});
const KW=g.KW;
const streams=path.join(REPO,DOJO,'content/streams');
const S=[];for(const f of JSON.parse(fs.readFileSync(path.join(streams,'manifest.json'),'utf8')))new Function('STREAMS',fs.readFileSync(path.join(streams,f),'utf8'))(S);
function prose(html){let s=String(html||'');s=s.replace(/<pre[\s\S]*?<\/pre>/gi,' ').replace(/<code[\s\S]*?<\/code>/gi,' ').replace(/<div class="codeSample"[\s\S]*?<\/div>/gi,' ').replace(/<svg[\s\S]*?<\/svg>/gi,' ').replace(/<[^>]+>/g,' ');return s.replace(/&[a-z#0-9]+;/g,' ');}
const seen={};
for(const st of S)for(const l of (st.lessons||[])){
  const t=prose([l.body,l.ex&&l.ex.prompt,l.ex&&l.ex.behavior,...((l.exs||[]).map(e=>e.prompt))].filter(Boolean).join(' '));
  for(const m of t.matchAll(/\b([A-Z][A-Z0-9]{1,7}(?:-[A-Z0-9]{1,4})?)\b/g)){
    const a=m[1];if(/^\d+$/.test(a))continue;
    if(!seen[a])seen[a]={n:0,lessons:new Set()};seen[a].n++;seen[a].lessons.add(l.id);
  }
}
const IGN=new Set(['I','A','OK','ID','URL','HTTP','HTTPS','JSON','API','APIS','HTML','TLS','SQL','UI','CPU','RAM','OS','IP','TCP','DNS','GET','POST','PUT','DELETE','PATCH','HEAD','AND','OR','NOT','THE','TODO','ASCII','UTF','UUID','CLI','SDK','IDE','PDF','CSV','XML','YAML','RFC','IETF','NIST','ISO','US','UK','EU','FAQ','PIN','SMS','USB','NFC','QR','PC','MS','AWS','GCP','IBM','ADFS','OWASP','MITM','SHA','HMAC','RSA','AES','EC','GCM','CBC','PEM','DER','ASN','MD','CA','CN','OU','DC','DN','FIDO','W3C','MIT','BSD','GNU','GUI','FIPS','RPC','GRPC','SSH','FTP','SMTP','IMAP','LDAP','AD','TXT','JS','TS','CSS','DOM','SPA','CRUD','ORM','JDBC','JVM','JDK','JRE','JAR','JUnit','ACL','RBAC','ABAC','ReBAC','PBAC','TL','DR','FYI','ASAP','EOF','NB','PS','II','III','IV','V','VI','X','Y','Z','N','M','K','B','C','D','E','F','G','H','J','L','O','P','Q','R','S','T','U','W']);
const rows=Object.entries(seen).filter(([a])=>!KW[a.toLowerCase()]&&!IGN.has(a)).sort((x,y)=>y[1].n-x[1].n);
console.log(`${DOJO}: ${rows.length} acronyms with no glossary/popup key`);
for(const [a,v] of rows)console.log(`  ${String(v.n).padStart(4)}  ${a.padEnd(10)} in ${[...v.lessons].slice(0,6).join(', ')}${v.lessons.size>6?' +'+(v.lessons.size-6):''}`);
