import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {JSDOM} from 'jsdom';
import {evaluateBuiltModule,evaluateClassicAsset} from './helpers/built-module.mjs';
import {mountAccountUI} from '../web/assets/account-menu.mjs';
import {waitForSiteUI} from '../web/assets/site-shell-adapter.mjs';
import {previewDocument} from '../frontend/preview-plugin.mjs';
const pause=()=>new Promise(resolve=>setTimeout(resolve,25));
async function settle(predicate){const end=Date.now()+2500;while(!predicate()){if(Date.now()>end)throw Error('Shell state did not settle');await pause()}}
async function fixture(t,route='machine-learning/index.html',html){
 const url='http://class.test/'+route.replace(/index\.html$/,'');
 const dom=new JSDOM(html||fs.readFileSync('dist/'+route,'utf8'),{url,runScripts:'outside-only',pretendToBeVisual:true});
 const diagnostics=[];const context=dom.getInternalVMContext();context.console={...console,warn:(...args)=>diagnostics.push(args),error:(...args)=>diagnostics.push(args)};
 t.after(()=>{dom.window.ClassNotesCourseApp?.disposeAll();dom.window.ClassNotesSiteUI?.dispose();dom.window.close()});
 const header=dom.window.document.querySelector('[data-site-header-root]'),brand=header.querySelector('.brand');
 await evaluateBuiltModule(dom,'site-shell.js');await dom.window.ClassNotesSiteUI.ready;
 assert.equal(header.querySelector('.brand'),brand,'Header hydration must reuse the server markup');
 assert.equal(header.dataset.reactRecovery,undefined);assert.deepEqual(diagnostics,[]);
 return{dom,window:dom.window,document:dom.window.document,diagnostics};
}
test('Shared shell hydrates public, student, instructor and deeply nested routes without changing the page body',async t=>{
 for(const route of ['index.html','about/index.html','dashboard/index.html','instructor/index.html','machine-learning/prediction-problem/index.html','lab/machine-learning/thresholds-and-roc/index.html']){
  const html=fs.readFileSync('dist/'+route,'utf8'),baseline=new JSDOM(html);const expected=baseline.window.document.querySelector('#main').innerHTML;baseline.window.close();
  const {document}=await fixture(t,route);
  assert.equal(document.querySelector('#main').innerHTML,expected,route);
  assert.equal(new URL(document.querySelector('.brand').href).pathname,'/index.html',route);
  assert.equal(document.querySelectorAll('[data-shell-account-slot]').length,1);
  assert.equal(document.querySelectorAll('[data-shell-presence-slot]').length,1);
 }
});
test('Navigation has one React event owner and preserves account/presence nodes during updates',async t=>{
 const {window,document,diagnostics}=await fixture(t);
 let signins=0,signouts=0;
 const account=mountAccountUI({doc:document,win:window,urls:{account:'/account/',dashboard:'/dashboard/',teacher:'/instructor/',review:'/review/'},onSignIn:async()=>signins++,onSignOut:async()=>signouts++});
 t.after(()=>account.dispose());
 account.update({ready:true,user:{id:'test',email:'student@example.test',user_metadata:{full_name:'Student Example'}}});
 await settle(()=>document.querySelector('[data-account-trigger]'));
 const accountNode=document.querySelector('.account-controls');
 assert.equal(accountNode.parentElement,document.querySelector('[data-shell-account-slot]'));
 const presence=document.createElement('details');presence.textContent='Local presence';document.querySelector('[data-shell-presence-slot]').append(presence);
 const menu=document.querySelector('.nav-menu'),nav=document.querySelector('#portal-nav');
 menu.click();await pause();assert.equal(menu.getAttribute('aria-expanded'),'true');assert.ok(nav.classList.contains('is-open'));
 assert.equal(document.querySelector('.account-controls'),accountNode);assert.ok(presence.isConnected);
 document.dispatchEvent(new window.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));await pause();
 assert.equal(menu.getAttribute('aria-expanded'),'false');assert.equal(document.activeElement,menu);
 menu.click();await pause();document.dispatchEvent(new window.CustomEvent('classroom-panel-open',{detail:{kind:'account'}}));await pause();assert.equal(menu.getAttribute('aria-expanded'),'false');
 const accountTrigger=document.querySelector('[data-account-trigger]');accountTrigger.click();await pause();assert.equal(accountTrigger.getAttribute('aria-expanded'),'true');
 menu.click();await pause();assert.equal(accountTrigger.getAttribute('aria-expanded'),'false');
 document.querySelector('#main').dispatchEvent(new window.Event('pointerdown',{bubbles:true}));await pause();assert.equal(menu.getAttribute('aria-expanded'),'false');
 account.update({ready:true,user:null});await settle(()=>document.querySelector('[data-account-signin]'));document.querySelector('[data-account-signin]').click();await pause();assert.equal(signins,1);assert.equal(signouts,0);
 assert.ok(presence.isConnected);assert.deepEqual(diagnostics,[]);
});
test('Legacy bootstrap waits for hydration and releases listeners on failure or timeout',async()=>{
 const dom=new JSDOM('<script data-site-ui></script>');const{window}=dom,doc=window.document,entry=doc.querySelector('script');
 try{
  let resolve;window.ClassNotesSiteUI={ready:new Promise(done=>{resolve=done})};
  let finished=false;const pending=waitForSiteUI(doc,window).then(()=>{finished=true});await Promise.resolve();assert.equal(finished,false);
  resolve();await pending;assert.equal(finished,true);
  delete window.ClassNotesSiteUI;
  const failed=waitForSiteUI(doc,window);entry.dispatchEvent(new window.Event('error'));await assert.rejects(failed,/SITE_UI_UNAVAILABLE/);
  await assert.rejects(waitForSiteUI(doc,window,5),/SITE_UI_TIMEOUT/);
  entry.remove();await waitForSiteUI(doc,window);
 }finally{window.close()}
});
test('The fixture shell preserves hydration and sample controls while React navigation changes',async t=>{
 const html=await previewDocument(process.cwd(),'member');
 const {window,document,diagnostics}=await fixture(t,'__preview__/course/index.html?state=member',html);
 const slot=document.querySelector('[data-shell-account-slot]'),controls=slot.querySelector('.account-controls');
 document.querySelector('.nav-menu').click();await pause();assert.equal(slot.querySelector('.account-controls'),controls);assert.deepEqual(diagnostics,[]);
});
test('The classic portal boot waits for the React header, resolves a guest and binds Google exactly once',async t=>{
 const dom=new JSDOM(fs.readFileSync('dist/machine-learning/index.html','utf8'),{url:'http://class.test/machine-learning/',runScripts:'outside-only',pretendToBeVisual:true});
 const{window}=dom,document=window.document,diagnostics=[];
 const context=dom.getInternalVMContext();context.console={...console,warn:(...args)=>diagnostics.push(args),error:(...args)=>diagnostics.push(args)};
 t.after(()=>{window.ClassNotesCourseApp?.disposeAll();window.ClassNotesSiteUI?.dispose();window.close()});
 await evaluateBuiltModule(dom,'course-index.js');
 let signins=0,reads=0;
 window.fetch=async input=>{
  assert.equal(new URL(String(input)).pathname,'/assets/auth-config.json');
  return{ok:true,json:async()=>({supabaseUrl:'https://project.supabase.co',publishableKey:'sb_publishable_test_public_key'})};
 };
 const client={auth:{onAuthStateChange(){},getSession:async()=>({data:{session:null},error:null}),signInWithOAuth:async()=>{signins++;return{error:null}}},rpc(){reads++;throw Error('Guest must not read private state')}};
 const append=document.head.append.bind(document.head);
 document.head.append=(node)=>{
  append(node);
  if(node.tagName==='SCRIPT'){
   assert.match(node.src,/\/assets\/vendor\/supabase\/supabase\.js/);
   window.supabase={createClient:()=>client};queueMicrotask(()=>node.onload());
  }
 };
 evaluateClassicAsset(dom,'portal.js');
 let booted=false;window.ClassroomReady.then(()=>{booted=true});await pause();
 assert.equal(booted,false,'Classic boot must wait for the shared ESM shell');
 await evaluateBuiltModule(dom,'site-shell.js');document.querySelector('script[data-site-ui]').dispatchEvent(new window.Event('load'));
 await window.ClassroomReady;
 await settle(()=>document.querySelector('[data-login-link]'));
 assert.equal(document.querySelectorAll('.portal-nav .account-controls').length,1);
 assert.equal(reads,0);document.querySelector('[data-account-signin]').click();await settle(()=>signins===1);
 const menu=document.querySelector('.nav-menu');menu.click();await pause();assert.equal(menu.getAttribute('aria-expanded'),'true');
 assert.equal(document.querySelector('[data-site-header-root]').dataset.reactRecovery,undefined);assert.deepEqual(diagnostics,[]);
});
