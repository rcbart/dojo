/* ============================== IN-BROWSER SQL ENGINE ==============================
   Dependency-free SQLite-style SELECT engine so learners can run queries on real
   sample datasets, fully offline. Wrapped in an IIFE to avoid any global collisions
   (e.g. the app already defines KW). Exposes window.SQLDB.run(db, sql) and the
   window.SQL_DATASETS sample databases. Supports: SELECT [DISTINCT], *, cols,
   agg([DISTINCT] ...) AS alias, FROM t [alias], [INNER|LEFT|RIGHT|FULL [OUTER]|CROSS] JOIN ... ON,
   WHERE (AND/OR, = <> < > <= >=, LIKE, IS [NOT] NULL), GROUP BY, HAVING agg,
   ORDER BY ... [ASC|DESC], LIMIT n [OFFSET m]. */
window.SQLDB=(function(){
  'use strict';
  const KW=new Set(['select','distinct','from','where','group','by','having','order','limit','offset','join','inner','left','right','full','outer','cross','on','as','and','or','is','not','null','like','asc','desc']);
  const low=x=>String(x).toLowerCase();
  const unq=s=>s[0]==="'"?s.slice(1,-1).replace(/''/g,"'"):s;
  const isNum=s=>/^\d+\.?\d*$/.test(s);
  function tokenize(sql){
    const re=/\s*(<=|>=|<>|!=|=|<|>|\(|\)|,|\*|;|'(?:[^']|'')*'|[A-Za-z_][A-Za-z0-9_.]*|\d+\.?\d*)/g;
    const t=[];let m;while((m=re.exec(sql))!==null){if(m[1]!==undefined&&m[1]!=='')t.push(m[1]);}return t;
  }
  function parse(sql){
    sql=sql.replace(/--[^\n]*/g,' ').replace(/;\s*$/,'').trim();
    const t=tokenize(sql).filter(x=>x!==';');let i=0;
    const q={select:[],distinct:false,from:null,joins:[],where:null,groupBy:[],having:null,orderBy:[],limit:null,offset:null};
    const peek=()=>t[i],next=()=>t[i++];
    if(low(next())!=='select')throw new Error('expected SELECT');
    if(peek()&&low(peek())==='distinct'){q.distinct=true;next();}
    while(i<t.length&&low(peek())!=='from'){
      let item={};
      if(peek()==='*'){item.star=true;next();}
      else{
        if(t[i+1]==='('){const fn=low(next());next();let dist=false;if(peek()&&low(peek())==='distinct'){dist=true;next();}let arg=next();if(arg===')'){item={agg:fn,arg:'*',distinct:dist};}else{item={agg:fn,arg:arg,distinct:dist};next();}checkAgg(fn);}
        else item={col:next()};
        if(peek()&&low(peek())==='as'){next();item.alias=next();}
        else if(peek()&&!KW.has(low(peek()))&&peek()!==','&&peek()!=='(')item.alias=next();
      }
      q.select.push(item);
      if(peek()===',')next();
    }
    if(low(next())!=='from')throw new Error('expected FROM');
    q.from={table:next()};
    if(peek()&&!KW.has(low(peek())))q.from.alias=next();
    while(peek()&&['inner','left','right','full','cross','join'].includes(low(peek()))){
      let type='inner',w=low(peek());
      if(w==='join'){type='inner';next();}
      else if(w==='cross'){type='cross';next();if(peek()&&low(peek())==='join')next();}
      else{type=w;next();if(peek()&&low(peek())==='outer')next();if(peek()&&low(peek())==='join')next();}
      const j={type,table:next()};
      if(peek()&&!KW.has(low(peek())))j.alias=next();
      if(peek()&&low(peek())==='on'){next();j.on={left:next(),op:next(),right:next()};}
      q.joins.push(j);
    }
    if(peek()&&low(peek())==='where'){next();q.where=parseExpr();}
    if(peek()&&low(peek())==='group'){next();if(low(next())!=='by')throw new Error('GROUP BY');while(peek()&&!KW.has(low(peek()))){q.groupBy.push(next());if(peek()===',')next();else break;}}
    if(peek()&&low(peek())==='having'){next();q.having=parseHaving();}
    if(peek()&&low(peek())==='order'){next();if(low(next())!=='by')throw new Error('ORDER BY');if(!peek())throw new Error('ORDER BY needs a column');while(peek()){let col=next(),dir='asc';if(peek()&&(low(peek())==='asc'||low(peek())==='desc'))dir=low(next());q.orderBy.push({col,dir});if(peek()===',')next();else break;}}
    /* A bare LIMIT parsed to NaN, and slice(0,NaN) returns nothing: the learner
       got a confident "0 rows" for a query that never had a row count at all. */
    if(peek()&&low(peek())==='limit'){next();q.limit=intArg(next(),'LIMIT');if(peek()&&low(peek())==='offset'){next();q.offset=intArg(next(),'OFFSET');}}
    return q;
    function intArg(tok,kw){const n=parseInt(tok,10);if(!Number.isFinite(n)||n<0)throw new Error(kw+' needs a whole number, for example '+kw+' 5');return n;}
    function parseExpr(){let preds=[parsePred()],ops=[];while(peek()&&(low(peek())==='and'||low(peek())==='or')){ops.push(low(next()));preds.push(parsePred());}return{preds,ops};}
    /* An incomplete comparison used to reach evalPred with right undefined and
       fail there as "Cannot read properties of undefined", which tells a learner
       nothing about their SQL. Name the operator that is missing its value. */
    function parsePred(){const left=next();if(peek()&&low(peek())==='is'){next();let neg=false;if(low(peek())==='not'){neg=true;next();}if(low(next())!=='null')throw new Error('IS NULL');return{left,op:neg?'isnotnull':'isnull'};}if(peek()&&low(peek())==='like'){next();const pat=next();if(pat===undefined)throw new Error('LIKE needs a pattern, for example LIKE \'Java%\'');return{left,op:'like',right:pat};}const op=next(),right=next();if(op===undefined)throw new Error('incomplete condition after '+left);if(right===undefined)throw new Error('nothing to compare against after '+left+' '+op);return{left,op,right};}
    function parseHaving(){const fn=low(next());next();let dist=false;if(peek()&&low(peek())==='distinct'){dist=true;next();}let arg=next();if(arg!==')')next();const op=next(),val=next();checkAgg(fn);return{agg:fn,arg,op,val,distinct:dist};}
  }
  const resolve=(row,ref)=>{if(row[ref]!==undefined)return row[ref];const bare=ref.includes('.')?ref.split('.').pop():ref;if(row[bare]!==undefined)return row[bare];for(const k in row)if(k.split('.').pop()===bare)return row[k];return undefined;};
  const cmp=(a,b)=>{if(a===b)return 0;if(a===null||a===undefined)return -1;if(b===null||b===undefined)return 1;if(typeof a==='number'&&typeof b==='number')return a-b;return String(a)<String(b)?-1:1;};
  /* LIKE used to compile to a regex, turning each % into '.*'. A pattern with a
     run of them, LIKE '%%%%%%%%%%zzz', backtracks exponentially: ten of them
     froze the tab for 38 seconds on a ten-row table, and the learner types the
     pattern themselves in the "run your query for real" panel with no way to
     interrupt it. This is the two-pointer wildcard match instead: linear in
     practice, never worse than O(n*m), case-sensitive exactly as the regex was. */
  function likeMatch(str,pat){
    let s=0,p=0,star=-1,ss=0;
    while(s<str.length){
      const c=pat[p];
      if(p<pat.length&&(c===str[s]||c==='_')){s++;p++;continue;}
      if(p<pat.length&&c==='%'){star=p++;ss=s;continue;}
      if(star>=0){p=star+1;s=++ss;continue;}
      return false;
    }
    while(p<pat.length&&pat[p]==='%')p++;
    return p===pat.length;
  }
  function evalPred(p,row){const l=resolve(row,p.left);if(p.op==='isnull')return l===null||l===undefined;if(p.op==='isnotnull')return !(l===null||l===undefined);if(p.op==='like'){return likeMatch(String(l),unq(p.right));}let r=isNum(p.right)?parseFloat(p.right):(p.right[0]==="'"?unq(p.right):resolve(row,p.right));const c=cmp(l,r);switch(p.op){case'=':return c===0;case'<>':case'!=':return c!==0;case'<':return c<0;case'>':return c>0;case'<=':return c<=0;case'>=':return c>=0;}return false;}
  function evalWhere(w,row){if(!w)return true;let acc=evalPred(w.preds[0],row);for(let k=0;k<w.ops.length;k++){const nv=evalPred(w.preds[k+1],row);acc=w.ops[k]==='and'?(acc&&nv):(acc||nv);}return acc;}
  const prefixRow=(row,alias)=>{const o={};for(const c in row){o[alias+'.'+c]=row[c];if(o[c]===undefined)o[c]=row[c];}return o;};
  const nullRow=(cols,alias)=>{const o={};for(const c of cols){o[alias+'.'+c]=null;if(o[c]===undefined)o[c]=null;}return o;};
  const resolveByName=(row,name)=>{const bare=name.split('.').pop();for(const k in row){if(k===name||k.split('.').pop()===bare)return row[k];}return undefined;};
  function starRow(r,known){const o={};for(const [al,cols] of known)for(const c of cols)o[c]=r[al+'.'+c]!==undefined?r[al+'.'+c]:r[c];return o;}
  /* MIN/MAX used Math.min/Math.max, which coerce to Number: every text and date
     column came back NaN, and because a grader serializing rows turns both NaN
     and NULL into null, a wrong query could be marked correct. They now reduce
     with the same cmp() the engine uses everywhere else, so 'Zoe' > 'Ada' and
     '2018-01-01' > '2006-05-01' the way SQL says they do. */
  function extreme(vals,wantMax){let best=vals[0];for(let i=1;i<vals.length;i++){const c=cmp(vals[i],best);if(wantMax?c>0:c<0)best=vals[i];}return best;}
  const AGGS=new Set(['count','sum','avg','min','max']);
  /* An unknown function used to fall through and return null, so SELECT UPPER(x)
     produced a silent NULL column instead of telling the learner it is not
     supported. Checked at parse time so the message names the function. */
  function checkAgg(f){if(!AGGS.has(f))throw new Error('unsupported function: '+f.toUpperCase()+'(), this engine supports COUNT, SUM, AVG, MIN and MAX');}
  function distinctVals(vals){const seen=new Set();return vals.filter(v=>{const k=(v===null?'n':typeof v)+'\u0001'+String(v);if(seen.has(k))return false;seen.add(k);return true;});}
  function agg(f,grp,arg,distinct){let vals=grp.map(r=>resolve(r,arg)).filter(v=>v!==null&&v!==undefined);if(distinct)vals=distinctVals(vals);if(f==='count')return arg==='*'?grp.length:vals.length;if(f==='sum')return vals.reduce((a,b)=>a+Number(b),0);if(f==='avg')return vals.length?vals.reduce((a,b)=>a+Number(b),0)/vals.length:null;if(f==='min')return vals.length?extreme(vals,false):null;if(f==='max')return vals.length?extreme(vals,true):null;return null;}
  function run(db,sql){
    const q=parse(sql);const t0=db[q.from.table];if(!t0)throw new Error('unknown table: '+q.from.table);
    const a0=q.from.alias||q.from.table;let rows=t0.rows.map(r=>prefixRow(r,a0));const known=[[a0,t0.cols]];
    for(const j of q.joins){
      const tj=db[j.table];if(!tj)throw new Error('unknown table: '+j.table);const aj=j.alias||j.table;
      const rightRows=tj.rows.map(r=>prefixRow(r,aj));const out=[];const matched=new Set();
      for(const lr of rows){let hit=false;rightRows.forEach((rr,idx)=>{let ok;if(j.type==='cross')ok=true;else ok=cmp(resolve({...lr,...rr},j.on.left),resolve({...lr,...rr},j.on.right))===0;if(ok){out.push({...lr,...rr});hit=true;matched.add(idx);}});if(!hit&&(j.type==='left'||j.type==='full'))out.push({...lr,...nullRow(tj.cols,aj)});}
      if(j.type==='right'||j.type==='full')rightRows.forEach((rr,idx)=>{if(!matched.has(idx)){let base={};for(const [al,cols] of known)Object.assign(base,nullRow(cols,al));out.push({...base,...rr});}});
      rows=out;known.push([aj,tj.cols]);
    }
    if(q.where)rows=rows.filter(r=>evalWhere(q.where,r));
    const hasAgg=q.select.some(s=>s.agg)||q.groupBy.length;let result;
    if(hasAgg){
      const groups=new Map();
      if(q.groupBy.length){for(const r of rows){const key=q.groupBy.map(g=>resolve(r,g)).join('\u0001');if(!groups.has(key))groups.set(key,[]);groups.get(key).push(r);}}
      else groups.set('*',rows);
      result=[];
      for(const [,grp] of groups){
        if(q.having){const av=agg(q.having.agg,grp,q.having.arg,q.having.distinct),rv=parseFloat(q.having.val);let keep;switch(q.having.op){case'>':keep=av>rv;break;case'<':keep=av<rv;break;case'>=':keep=av>=rv;break;case'<=':keep=av<=rv;break;case'=':keep=av===rv;break;default:keep=true;}if(!keep)continue;}
        const o={};for(const s of q.select){const name=s.alias||(s.agg?s.agg.toUpperCase()+'('+(s.distinct?'DISTINCT ':'')+s.arg+')':s.col);o[name]=s.agg?agg(s.agg,grp,s.arg,s.distinct):resolve(grp[0],s.col);}result.push(o);
      }
    } else {
      result=rows.map(r=>{if(q.select.length===1&&q.select[0].star)return starRow(r,known);const o={};for(const s of q.select){const name=s.alias||s.col;o[name]=resolve(r,s.col);}return o;});
    }
    if(q.distinct){const seen=new Set();result=result.filter(r=>{const k=JSON.stringify(r);if(seen.has(k))return false;seen.add(k);return true;});}
    if(q.orderBy.length)result.sort((x,y)=>{for(const o of q.orderBy){const c=cmp(x[o.col]!==undefined?x[o.col]:resolveByName(x,o.col),y[o.col]!==undefined?y[o.col]:resolveByName(y,o.col));if(c!==0)return o.dir==='desc'?-c:c;}return 0;});
    if(q.offset)result=result.slice(q.offset);
    if(q.limit!=null)result=result.slice(0,q.limit);
    return result;
  }
  return {run,parse};
})();

/* Sample datasets (a "db" is a map of tableName -> {cols, rows}). Referenced by
   SQL exercises via ex.data = 'library' | 'shop' | 'org'. */
window.SQL_DATASETS={
  library:{
    books:{cols:['id','author_id','title','price_cents','published'],rows:[
      {id:1,author_id:1,title:'Effective Java',price_cents:4500,published:'2018-01-01'},
      {id:2,author_id:1,title:'Java Concurrency in Practice',price_cents:5200,published:'2006-05-01'},
      {id:3,author_id:2,title:'Clean Code',price_cents:3900,published:'2008-08-01'},
      {id:4,author_id:2,title:'Refactoring',price_cents:4700,published:'1999-07-01'},
      {id:5,author_id:3,title:'The Pragmatic Programmer',price_cents:4200,published:'1999-10-01'},
      {id:6,author_id:3,title:'Designing Data-Intensive Applications',price_cents:5600,published:'2017-03-01'},
      {id:7,author_id:1,title:'Java Puzzlers',price_cents:3200,published:null},
      {id:8,author_id:4,title:'Domain-Driven Design',price_cents:5400,published:'2003-08-01'},
      {id:9,author_id:4,title:'Working Effectively with Legacy Code',price_cents:3600,published:null},
      {id:10,author_id:2,title:'Head First Java',price_cents:1400,published:'2005-02-01'}]}
  },
  shop:{
    users:{cols:['id','name'],rows:[{id:1,name:'Ada'},{id:2,name:'Bo'},{id:3,name:'Cy'},{id:4,name:'Di'}]},
    orders:{cols:['id','user_id','total_cents','created_at'],rows:[
      {id:1,user_id:1,total_cents:20000,created_at:'2026-01-05'},{id:2,user_id:1,total_cents:40000,created_at:'2026-02-10'},
      {id:3,user_id:2,total_cents:15000,created_at:'2026-01-20'},{id:4,user_id:3,total_cents:60000,created_at:'2026-03-01'},
      {id:5,user_id:3,total_cents:30000,created_at:'2026-03-15'},{id:6,user_id:1,total_cents:5000,created_at:'2026-04-01'}]}
  },
  org:{
    employees:{cols:['id','name','dept_id','manager_id'],rows:[
      {id:1,name:'Alice',dept_id:1,manager_id:null},{id:2,name:'Bob',dept_id:1,manager_id:1},
      {id:3,name:'Carol',dept_id:2,manager_id:1},{id:4,name:'Dan',dept_id:2,manager_id:3},{id:5,name:'Eve',dept_id:null,manager_id:1}]},
    departments:{cols:['id','name'],rows:[{id:1,name:'Engineering'},{id:2,name:'Sales'},{id:3,name:'HR'},{id:4,name:'Legal'}]}
  }
};
