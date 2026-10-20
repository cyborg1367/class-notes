const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {parseHTML} = require('linkedom');
const root = path.join(__dirname,'..');
const settle = async () => { for(let i=0;i<8;i++) await new Promise(setImmediate); };
async function boot(route, options={}) {
  const {window} = parseHTML(fs.readFileSync(path.join(root,'dist',route,'index.html'),'utf8'));
  const {document} = window;
  const href = `https://cyborg1367.github.io/class-notes/${route}/` + (options.search || '');
  const locURL = new URL(href);
  let replaced, authListener, session = options.user ? {user:options.user} : null;
  const calls = [], stored = new Map(), temp = new Map();
  if(options.previousReturn) temp.set('class-notes-oauth-return:/class-notes/',options.previousReturn);
  let cloud = options.cloud || null;
  let failSave = false;
  const location = {href,pathname:locURL.pathname,replace:value=>{replaced=value;}};
  document.querySelector('script[data-class-auth]').src = 'https://cyborg1367.github.io/class-notes/assets/auth.js';
  document.querySelectorAll('.lesson-section').forEach((s,i)=>{s.getBoundingClientRect=()=>({top:1000+i*1000});});
  const originalAppend = document.head.append.bind(document.head);
  document.head.append = (element) => { originalAppend(element); if(element.tagName==='SCRIPT') queueMicrotask(()=>element.onload()); };
  window.supabase={createClient:(url,key,config)=>{
    calls.push({type:'client',url,key,config});
    return {
      auth:{onAuthStateChange:fn=>{authListener=fn;},getSession:async()=>({data:{session},error:null}),
        signInWithOAuth:async args=>{calls.push({type:'oauth',args});return {error:null};},
        signOut:async args=>{calls.push({type:'signout',args});session=null;authListener('SIGNED_OUT',null);return {error:null};}},
      from:table=>({upsert:async(row,opts)=>{calls.push({type:'save',table,row,opts});if(!failSave) cloud={answers:row.answers};return {error:failSave?new Error('offline'):null};},
        select:()=>{const filters=[];const q={eq:(k,v)=>{filters.push([k,v]);return q;},maybeSingle:async()=>{calls.push({type:'load',table,filters});return {data:cloud,error:null};}};return q;}})
    };
  }};
  window.confirm=()=>options.confirm!==false;
  const context={window,document,location,URL,CustomEvent:window.CustomEvent,
    history:{replaceState:(_s,_t,value)=>{calls.push({type:'clean-url',value});}},
    fetch:async()=>({ok:true,json:async()=>options.disabled?{supabaseUrl:'',publishableKey:''}:{supabaseUrl:'https://demo.supabase.co',publishableKey:'sb_publishable_demo'}}),
    localStorage:{getItem:k=>stored.get(k)||null,setItem:(k,v)=>stored.set(k,v)},
    sessionStorage:{getItem:k=>temp.get(k)||null,setItem:(k,v)=>temp.set(k,v),removeItem:k=>temp.delete(k)},
    requestAnimationFrame:fn=>fn(),addEventListener:window.addEventListener.bind(window),
    scrollY:0,innerHeight:900,navigator:{},setTimeout:()=>0,clearTimeout:()=>{},console};
  vm.runInNewContext(fs.readFileSync(path.join(root,'assets/app.js'),'utf8'),context);
  vm.runInNewContext(fs.readFileSync(path.join(root,'assets/auth.js'),'utf8'),context);
  await settle();
  return {window,document,calls,stored,replaced:()=>replaced,
    user:u=>{session=u?{user:u}:null;authListener('SIGNED_IN',session);},
    failSave:()=>{failSave=true;}};
}
test('Google login uses the correct repository callback and PKCE session settings',async()=>{
  const b=await boot('account',{search:'?next=https%3A%2F%2Fevil.example%2F'});
  const client=b.calls.find(c=>c.type==='client');
  assert.equal(client.config.auth.flowType,'pkce');
  assert.equal(client.config.auth.detectSessionInUrl,true);
  assert.equal(b.document.querySelector('[data-auth-guest]').hidden,false);
  b.document.querySelector('[data-google-signin]').click();await settle();
  const oauth=b.calls.find(c=>c.type==='oauth').args;
  assert.equal(oauth.provider,'google');
  const callback=new URL(oauth.options.redirectTo);
  assert.equal(callback.pathname,'/class-notes/account/');
  assert.equal(callback.search,'');
});
test('unconfigured accounts leave public lessons usable and do not load the SDK',async()=>{
  const b=await boot('account',{disabled:true});
  assert.equal(b.calls.length,0);
  assert.match(b.document.querySelector('[data-auth-status]').textContent,/هنوز فعال نشده/);
  assert.equal(b.document.querySelector('[data-auth-guest]').hidden,true);
});
test('worksheet drafts and cloud operations follow the current student',async()=>{
  const b=await boot('machine-learning/prediction-problem');
  const field=b.document.querySelector('[data-answer]');
  field.value='guest draft';field.dispatchEvent(new b.window.Event('input'));
  b.user({id:'student-a',email:'a@example.test'});
  assert.equal(field.value,'');
  assert.equal(b.document.querySelector('[data-draft-import]').hidden,false);
  b.document.querySelector('[data-draft-import]').click();
  assert.equal(field.value,'guest draft');
  assert.equal(b.calls.some(c=>c.type==='save'),false);
  field.value='A answer';field.dispatchEvent(new b.window.Event('input'));
  b.document.querySelector('[data-cloud-save]').click();await settle();
  assert.equal(b.calls.find(c=>c.type==='save').row.user_id,'student-a');
  assert.equal(b.calls.find(c=>c.type==='save').row.lesson_id,'machine-learning/prediction-problem');
  field.value='changed locally';
  b.document.querySelector('[data-cloud-load]').click();await settle();
  assert.equal(field.value,'A answer');
  b.user({id:'student-b'});assert.equal(field.value,'');
  field.value='B answer';field.dispatchEvent(new b.window.Event('input'));
  b.user({id:'student-a'});assert.equal(field.value,'A answer');
  b.failSave();b.document.querySelector('[data-cloud-save]').click();await settle();
  assert.equal(field.value,'A answer');
  assert.equal(b.document.querySelector('[data-cloud-status]').dataset.error,'true');
  b.user(null);assert.equal(field.value,'guest draft');
  assert.equal(b.document.querySelector('[data-cloud-buttons]').hidden,true);
});
test('successful callback cleans its one-use code and returns to the lesson',async()=>{
  const next='https://cyborg1367.github.io/class-notes/machine-learning/prediction-problem/#exercise';
  const b=await boot('account',{user:{id:'student-a',email:'a@example.test'},search:'?code=one-use',previousReturn:next});
  assert.equal(b.replaced(),next);
  assert.equal(new URL(b.calls.find(c=>c.type==='clean-url').value).searchParams.has('code'),false);
});
test('profile text is rendered as text and signout clears the account UI',async()=>{
  const b=await boot('account',{user:{id:'student-a',email:'a@example.test',user_metadata:{full_name:'<img src=x onerror=alert(1)>'}}});
  assert.equal(b.document.querySelector('[data-user-name] img'),null);
  b.document.querySelector('[data-signout]').click();await settle();
  assert.equal(b.document.querySelector('[data-auth-member]').hidden,true);
  assert.equal(b.document.querySelector('[data-auth-guest]').hidden,false);
});
