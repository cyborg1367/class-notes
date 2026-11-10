import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
import { evaluateBuiltModule, evaluateClassicAsset } from './helpers/built-module.mjs';
import { labFixtureSource, labPreviewDocument } from '../frontend/lab-preview.mjs';

const catalog = JSON.parse(fs.readFileSync('dist/assets/catalog.json', 'utf8'));
const labs = catalog.flatMap(course=>course.lessons).filter(lesson=>lesson.lab);
const base = 'https://class.test/class-notes/';
const wait = async predicate => {
  for (let i=0;i<80;i++) {
    if (predicate()) return;
    await new Promise(resolve=>setTimeout(resolve,15));
  }
  assert.fail('Lab did not settle');
};

async function openLab(t, lesson, { complete = false, saved = false, overlap = false, touch = false, nativeDialog = false, submit } = {}) {
  const dom = new JSDOM('<!doctype html><html dir="rtl"><head><script data-site-ui src="'+base+'assets/site-shell.js"></script></head><body><button type="button" id="outside-lab" aria-hidden="false">Outside</button><main id="host"></main></body></html>',
    { url:base+lesson.lab.path,runScripts:'outside-only',pretendToBeVisual:true });
  const {window} = dom;
  const doc = window.document, $ = selector => doc.querySelector(selector), calls = [];
  window.scrollTo = () => {};
  window.matchMedia = query => ({matches:touch&&query==='(pointer: coarse)',addEventListener(){},removeEventListener(){}});
  if(nativeDialog){
    window.HTMLDialogElement.prototype.showModal=function(){ this.setAttribute('open',''); };
    window.HTMLDialogElement.prototype.close=function(){ this.removeAttribute('open'); };
  }
  window.HTMLElement.prototype.scrollIntoView = () => {};
  let mounted;
  t.after(()=>{ mounted?.dispose(); window.ClassNotesSiteUI?.dispose(); window.close(); });
  await evaluateBuiltModule(dom,'site-shell.js');
  const model = await evaluateBuiltModule(dom,lesson.lab.model);
  evaluateClassicAsset(dom,'coding-lab.js');
  const xp = model.stages.reduce((sum,stage)=>sum+stage.xp,0);
  const restoredCode = '# A learner draft already saved\nprint("keep my code")\n';
  const draft = saved ? { codes:model.stages.map(()=>restoredCode),active:0 } : null;
  const snapshot = {mission:model.missionId,xp:complete?xp:0,maximum:xp,completed:complete?model.stages.map(stage=>stage.id):[],
    tasks:model.stages.map((stage,index)=>({id:stage.id,position:index+1,xp:stage.xp})),badge:complete,attempts:complete?6:0,revision:0,draft};
  const options = {
    userId:'student-test',assets:base+'assets/',lessonURL:base+lesson.id+'/',lessonId:lesson.id,lab:lesson.lab,snapshot,
    isCurrent:()=>true, saveDraft:async (...args)=>{calls.push(['save',args]);return snapshot;},
    refresh:async()=>snapshot,getAttempt:async()=>null,
    submit:async (request,signal)=>{calls.push(['check',request]);return submit ? submit(request,signal,snapshot) : {status:'failed',snapshot,feedback:{code:'MISSING_FUNCTION'}};},
  };
  const pending=overlap ? window.ClassNotesCodingLab.mount($('#host'),options) : null;
  mounted = await window.ClassNotesCodingLab.mount($('#host'),options);
  if(pending)assert.equal(await pending,undefined);
  return {window,doc,$,model,snapshot,calls,restoredCode};
}

for (const lesson of labs) {
  test('Completed mission still opens its own React story: '+lesson.lab.mission,async t=>{
    const {doc,$,model,snapshot,restoredCode,calls}=await openLab(t,lesson,{complete:true,saved:true});
    assert.equal($('[data-react-lab-story]').hidden,false);
    assert.equal($('.lab-workspace').hidden,true);
    assert.equal($('.lab-workspace').hasAttribute('inert'),true);
    assert.equal($('#lab-intro-title').textContent,model.meta.introTitle);
    assert.equal(doc.activeElement,$('#lab-intro-title'));
    assert.equal(doc.querySelectorAll('.lab-intro-table tbody tr').length,3);
    assert.match($('[data-intro-start]').textContent,/ادامهٔ مأموریت/);
    assert.equal($('[data-story-review]').hidden,true);
    $('[data-story-review]').click();
    assert.match($('[data-intro-start]').textContent,/ادامهٔ مأموریت/);
    assert.equal(calls.length,0);
    $('[data-intro-start]').click();
    assert.equal($('.lab-workspace').hidden,false);
    assert.equal($('.lab-workspace').hasAttribute('inert'),false);
    assert.equal($('#lab-code').value,restoredCode);
    assert.equal($('[data-xp]').textContent,String(snapshot.xp));
    assert.equal(calls.length,0);
  });
}

test('Overlapping mounts leave one current story and feedback',async t=>{
  const {doc,$}=await openLab(t,labs[0],{overlap:true});
  assert.equal(doc.querySelectorAll('[data-react-lab-story]').length,1);
  assert.equal(doc.querySelectorAll('[data-react-lab-feedback]').length,1);
  $('[data-intro-start]').click();
  assert.equal($('.lab-workspace').hidden,false);
});

test('Reviewing the story returns to the original editor selection',async t=>{
  const {doc,$}=await openLab(t,labs[0]);
  assert.match($('[data-intro-start]').textContent,/شروع مأموریت/);
  $('[data-intro-start]').click();
  const editor=$('#lab-code'), code=editor.value;
  editor.setSelectionRange(5,12);
  editor.scrollTop=20;
  $('[data-story-review]').click();
  assert.equal(doc.activeElement,$('#lab-intro-title'));
  assert.match($('[data-intro-start]').textContent,/برگشت به مأموریت/);
  // A second trigger while hidden must not overwrite the original editor position.
  editor.setSelectionRange(0,0);
  $('[data-story-review]').click();
  $('[data-intro-start]').click();
  assert.equal(doc.activeElement,editor);
  assert.equal(editor.value,code);
  assert.deepEqual([editor.selectionStart,editor.selectionEnd,editor.scrollTop],[5,12,20]);
});

test('A server check renders React feedback and Escape restores the editor',async t=>{
  const {window,doc,$,calls,model}=await openLab(t,labs[1],{saved:true});
  $('[data-intro-start]').click();
  const editor=$('#lab-code');
  editor.setSelectionRange(1,9);
  $('[data-check]').click();
  await wait(()=>Boolean($('[data-react-lab-feedback][open]')));
  const dialog=$('[data-react-lab-feedback]');
  assert.equal(doc.activeElement,$('#lab-feedback-title'));
  const outside=$('#outside-lab');
  assert.equal(outside.inert,true);
  assert.equal(outside.getAttribute('aria-hidden'),'true');
  outside.focus();
  assert.equal(doc.activeElement,$('#lab-feedback-title'));
  $('[data-feedback-return]').focus();
  dialog.dispatchEvent(new window.KeyboardEvent('keydown',{key:'Tab',bubbles:true,cancelable:true}));
  assert.equal(doc.activeElement,$('[data-feedback-close]'));
  assert.equal($('[data-feedback-field]').textContent,model.stages[0].function);
  assert.equal($('[data-feedback-example]').textContent,model.stages[0].example);
  assert.equal(calls.length,1);
  assert.equal(calls[0][1].code,editor.value);
  assert.equal($('[data-xp]').textContent,'0');
  dialog.dispatchEvent(new window.KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));
  assert.equal(dialog.open,false);
  assert.equal(outside.inert,false);
  assert.equal(outside.getAttribute('aria-hidden'),'false');
  assert.equal(doc.activeElement,editor);
  assert.deepEqual([editor.selectionStart,editor.selectionEnd],[1,9]);
  dialog.querySelector('details').open=true;
  $('[data-last-feedback]').click();
  assert.equal(dialog.open,true);
  assert.equal(dialog.querySelector('details').open,false);
  $('[data-feedback-return]').click();
  assert.equal(dialog.open,false);
  assert.equal(calls.length,1);
});

test('Touch entry focuses the task and history restore starts the story without losing the draft',async t=>{
  const {window,doc,$,calls}=await openLab(t,labs[0],{touch:true});
  $('[data-intro-start]').click();
  assert.equal(doc.activeElement,$('#lab-task-title'));
  const editor=$('#lab-code'),code=editor.value+'\n# Unsaved local change';
  editor.value=code;
  editor.dispatchEvent(new window.Event('input',{bubbles:true}));
  window.dispatchEvent(new window.PageTransitionEvent('pagehide',{persisted:true}));
  window.dispatchEvent(new window.PageTransitionEvent('pageshow',{persisted:true}));
  assert.equal($('.lab-workspace').hidden,true);
  assert.match($('[data-intro-start]').textContent,/ادامهٔ مأموریت/);
  $('[data-intro-start]').click();
  assert.equal(editor.value,code);
  assert.equal(doc.activeElement,$('#lab-task-title'));
  assert.ok(calls.every(([type])=>type!=='check'));
});

test('Native dialog cancel preserves the code and leaves page accessibility state alone',async t=>{
  const {window,doc,$}=await openLab(t,labs[2],{nativeDialog:true});
  $('[data-intro-start]').click();
  const editor=$('#lab-code');
  editor.value='';
  $('[data-check]').click();
  const dialog=$('[data-react-lab-feedback]');
  assert.equal(dialog.open,true);
  assert.equal($('#outside-lab').getAttribute('aria-hidden'),'false');
  dialog.dispatchEvent(new window.Event('cancel',{cancelable:true}));
  assert.equal(dialog.open,false);
  assert.equal(doc.activeElement,editor);
  assert.equal(editor.value,'');
});

test('Leaving the lab aborts an active check and ignores a late server result',async t=>{
  let finish, signal, snapshot;
  const pending=new Promise(resolve=>{finish=resolve;});
  const {window,$,calls}=await openLab(t,labs[3],{submit(_request,checkSignal,original){
    signal=checkSignal;snapshot=original;return pending;
  }});
  $('[data-intro-start]').click();
  $('[data-check]').click();
  assert.equal(calls.length,1);
  assert.equal($('[data-xp]').textContent,'0');
  let progressEvents=0;
  window.document.addEventListener('classroom-progress-changed',()=>{progressEvents++;});
  window.ClassNotesCodingLab.dispose();
  assert.equal(signal.aborted,true);
  finish({status:'passed',snapshot:{...snapshot,xp:300},xp_added:300});
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal($('[data-react-lab-feedback]'),null);
  assert.equal($('[data-react-lab-story]'),null);
  assert.equal($('[data-xp]'),null);
  assert.equal(progressEvents,0);
});

test('The dev lab fixture renders the real story and feedback without starting the portal',async t=>{
  const html=await labPreviewDocument(process.cwd());
  assert.doesNotMatch(html,/script[^>]*data-portal|vendor\/supabase/);
  assert.ok(!fs.existsSync('dist/__preview__/lab/'));
  const dom=new JSDOM(html,{url:'http://class.test/__preview__/lab/?complete=1',runScripts:'outside-only',pretendToBeVisual:true});
  const {window}=dom, $=selector=>window.document.querySelector(selector);
  window.scrollTo=()=>{};
  const temp='lab-fixture-test-'+process.pid+'.mjs';
  fs.writeFileSync('dist/assets/'+temp,labFixtureSource());
  t.after(()=>{
    window.dispatchEvent(new window.Event('pagehide'));window.ClassNotesSiteUI?.dispose();window.close();
    fs.unlinkSync('dist/assets/'+temp);
  });
  await evaluateBuiltModule(dom,temp);
  assert.equal($('[data-react-recovery]'),null);
  assert.match($('[data-intro-start]').textContent,/ادامهٔ مأموریت/);
  $('[data-intro-start]').click();
  $('[data-demo-feedback]').click();
  assert.ok($('[data-react-lab-feedback][open]'));
  assert.ok(!window.Classroom && !window.ClassNotesCodingLab);
});

async function bootLabRoute(t, lesson, status) {
  const html = fs.readFileSync('dist/' + lesson.lab.path + 'index.html', 'utf8');
  const dom = new JSDOM(html, { url:base+lesson.lab.path,runScripts:'outside-only',pretendToBeVisual:true });
  const { window } = dom;
  const doc = window.document, $ = selector => doc.querySelector(selector);
  const requests = [], checks = [];
  window.scrollTo = () => {};
  window.matchMedia = () => ({ matches:false,addEventListener(){},removeEventListener(){} });
  window.HTMLElement.prototype.scrollIntoView = () => {};
  t.after(()=>{
    window.ClassNotesCodingLab?.dispose();
    window.ClassNotesSiteUI?.dispose();
    window.close();
  });
  const model = await evaluateBuiltModule(dom, lesson.lab.model);
  const stage = model.stages[0];
  const draftCode = '# Server draft\nprint(42)\n';
  const snapshot = {
    mission: lesson.lab.mission, xp:0, maximum:model.stages.reduce((sum,step)=>sum+step.xp,0),
    completed:[], tasks:model.stages.map((step,index)=>({id:step.id,position:index+1,xp:step.xp})),
    badge:false, attempts:0, revision:1, draft:{active:0,codes:model.stages.map(()=>draftCode)},
  };
  const signedIn = status !== 'guest';
  const project = 'https://fixture.supabase.co';
  const checkURL = project+'/functions/v1/classroom-lab/check';
  const publishableKey = 'sb_publishable_fixture_key';
  const response = data => ({ ok:true, json:async()=>data });
  window.fetch = async (input, options) => {
    const url = new URL(String(input),base);
    if(url.href===checkURL){
      checks.push({ ...JSON.parse(options.body), auth:options.headers.Authorization });
      return response({ status:'passed', snapshot:{...snapshot,xp:stage.xp,completed:[stage.id]},xp_added:stage.xp });
    }
    if(url.origin==='https://class.test'&&url.pathname.endsWith('/auth-config.json'))return response({supabaseUrl:project,publishableKey});
    if(url.origin==='https://class.test'&&url.pathname.endsWith('/lab-service.json'))return response({checkURL});
    throw Error('Unexpected fixture request: '+url.pathname);
  };
  const client = {
    auth:{
      getSession:async()=>({ data:{ session:signedIn?{user:{id:'fixture-student'},access_token:'fixture-session'}:null },error:null }),
      onAuthStateChange(){},
    },
    async rpc(name,args){
      requests.push({name,args});
      if(name==='classroom_bootstrap')return {data:{state:{memberships:[{course_id:catalog[0].id,status}],results:[]},
        lab:status==='active'?snapshot:null},error:null};
      return {data:{items:[],unread_count:0,visible:false},error:null};
    },
  };
  const append = doc.head.append.bind(doc.head);
  doc.head.append = node => {
    append(node);
    if(node.tagName!=='SCRIPT')return;
    const pathname=new URL(node.src).pathname;
    if(pathname.endsWith('/vendor/supabase/supabase.js'))window.supabase={createClient:()=>client};
    else if(pathname.endsWith('/coding-lab.js'))evaluateClassicAsset(dom,'coding-lab.js');
    else return;
    queueMicrotask(()=>node.onload());
  };
  await evaluateBuiltModule(dom,'site-shell.js');
  evaluateClassicAsset(dom,'portal.js');
  $('script[data-site-ui]').dispatchEvent(new window.Event('load'));
  await window.ClassroomReady;
  return { $, model, requests, checks, draftCode };
}

test('The published lab route still requires an active class membership',async t=>{
  for(const status of ['guest','pending','suspended']){
    const { $,requests,checks } = await bootLabRoute(t,labs[0],status);
    assert.ok($('#main .gate-card'),status);
    assert.equal(Boolean($('#main [data-login-link]')),status==='guest');
    assert.equal($('[data-react-lab-story]'),null);
    assert.equal($('[data-lab-account]'),null);
    assert.ok(!requests.some(request=>request.name.startsWith('classroom_lab_')));
    assert.deepEqual(checks,[]);
  }
});

test('The published lab route resumes the server draft and only a submitted server receipt adds XP',async t=>{
  const { $,model,requests,checks,draftCode } = await bootLabRoute(t,labs.at(-1),'active');
  const bootstrap = requests.filter(request=>request.name==='classroom_bootstrap');
  assert.equal(bootstrap.length,1);
  assert.equal(bootstrap[0].args.p_mission,model.missionId);
  assert.ok(!requests.some(request=>request.name==='classroom_lab_state'),'Bootstrap already carries progress');
  assert.equal($('[data-react-lab-story]').hidden,false);
  assert.equal($('#lab-intro-title').textContent,model.meta.introTitle);
  assert.equal($('[data-xp]').textContent,'0');
  assert.deepEqual(checks,[]);
  $('[data-intro-start]').click();
  assert.equal($('#lab-code').value,draftCode);
  $('[data-check]').click();
  const {id,xp}=model.stages[0];
  await wait(()=> $('[data-xp]').textContent===String(xp));
  assert.equal(checks.length,1);
  assert.equal(checks[0].mission,model.missionId);
  assert.equal(checks[0].task,id);
  assert.equal(checks[0].code,draftCode);
  assert.equal(checks[0].auth,'Bearer fixture-session');
  assert.match(checks[0].request_id,/^[0-9a-f-]{36}$/);
  $('[data-last-feedback]').click();
  assert.equal($('[data-react-lab-feedback]').dataset.kind,'success');
  $('[data-feedback-return]').click();
  assert.equal($('#lab-code').value,draftCode);
  assert.equal(checks.length,1);
});
