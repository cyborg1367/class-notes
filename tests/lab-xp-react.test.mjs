import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
import { evaluateBuiltModule,evaluateClassicAsset } from './helpers/built-module.mjs';
import { xpFixtureSource,xpPreviewDocument } from '../frontend/lab-xp-preview.mjs';

const base = 'https://class.test/class-notes/';
const labs = JSON.parse(fs.readFileSync('dist/assets/catalog.json','utf8')).flatMap(course=>course.lessons).filter(note=>note.lab);
const wait = async predicate=>{
  for(let tries=0;tries<80;tries++){if(predicate())return;await new Promise(resolve=>setTimeout(resolve,12));}
  assert.fail('Lab XP did not settle');
};

function browser(t,html,url,modal='native') {
  const dom=new JSDOM(html,{url,runScripts:'outside-only',pretendToBeVisual:true});
  const {window}=dom,doc=window.document,$=selector=>doc.querySelector(selector);
  const opens=[];
  window.scrollTo=()=>{};
  window.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
  window.HTMLElement.prototype.scrollIntoView=()=>{};
  if(modal!=='missing'){
    const proto=window.HTMLDialogElement.prototype;
    proto.showModal=function(){
      if(modal==='throws'&&this.hasAttribute('data-celebration'))throw Error('Dialog could not open');
      if(this.open)throw Error('Already open');
      this.open=true;opens.push(this);
    };
    proto.close=function(){
      this.open=false;this.dispatchEvent(new window.Event('close'));
    };
  }
  t.after(()=>{window.ClassNotesCodingLab?.dispose();window.ClassNotesSiteUI?.dispose();window.close();});
  return {dom,window,doc,$,opens};
}

async function fixture(t,{note=labs[0],completed=0,modal,submit,saveDraft}={}) {
  const ui=browser(t,`<!doctype html><html lang="fa" dir="rtl"><head><script data-site-ui src="${base}assets/site-shell.js"></script></head><body><main id="host"></main></body></html>`,base+note.lab.path,modal);
  const {dom,doc,window,$}=ui;
  await evaluateBuiltModule(dom,'site-shell.js');
  evaluateClassicAsset(dom,'coding-lab.js');
  const model=await evaluateBuiltModule(dom,note.lab.model);
  const stages=model.stages;
  const snapshot=(count,draft=null)=>({
    mission:model.missionId,xp:stages.slice(0,count).reduce((sum,s)=>sum+s.xp,0),
    maximum:stages.reduce((sum,s)=>sum+s.xp,0),completed:stages.slice(0,count).map(s=>s.id),badge:count===stages.length,
    attempts:count,revision:0,draft,tasks:stages.map((s,i)=>({id:s.id,position:i+1,xp:s.xp})),
  });
  const state=snapshot(completed,completed?{active:Math.min(completed,stages.length-1),codes:stages.map((_,i)=>i===completed?'pass':''),hints:stages.map(()=>0),explanation:''}:null);
  const calls=[];
  const receipts=[];
  let after=state,events=0;
  doc.addEventListener('classroom-progress-changed',()=>{events++;});
  await window.ClassNotesCodingLab.mount($('#host'),{
    userId:'xp-review',lessonId:note.id,lessonURL:base+note.id+'/',lab:note.lab,snapshot:state,assets:base+'assets/',
    isCurrent:()=>true,saveDraft:async(draft)=>saveDraft?saveDraft(draft,state):({...after,draft,revision:1}),refresh:async()=>after,
    getAttempt:async id=>{receipts.push(id);return null;},
    submit:async(body,signal)=>{
      calls.push({body,signal});
      const index=stages.findIndex(s=>s.id===body.task);
      const result=submit?await submit({body,signal,snapshot,state,index,calls}):
        {status:'passed',xp_added:stages[index].xp,snapshot:snapshot(index+1)};
      if(result.snapshot)after=result.snapshot;
      return result;
    },
  });
  $('[data-intro-start]').click();
  const check=()=>$('[data-check]').click();
  return {...ui,model,calls,receipts,check,state,events:()=>events};
}

test('The first graded pass updates the React meter and Continue opens only the next unlocked stage',async t=>{
  const {$,doc,model,calls,check,events}=await fixture(t);
  assert.equal($('[data-header-progress]').getAttribute('aria-valuenow'),'0');
  assert.equal($('[data-celebration]'),null);
  const first=model.stages[0];
  check();
  await wait(()=>$('[data-celebration]')?.open);
  assert.equal(calls.length,1);
  assert.equal(calls[0].body.task,first.id);
  assert.equal(calls[0].body.mission,model.missionId);
  assert.ok(calls[0].body.request_id);
  assert.equal($('[data-xp]').textContent,String(first.xp));
  assert.equal($('[data-header-progress]').getAttribute('aria-valuenow'),String(first.xp));
  assert.equal($('[data-count]').textContent,'1 of '+model.stages.length+' completed');
  assert.equal($('[data-celebration-earned]').textContent,'+'+first.xp);
  assert.equal($('[data-award]').textContent,'');
  assert.equal(doc.activeElement,$('[data-celebration-continue]'));
  assert.equal(events(),1);
  $('[data-celebration-continue]').click();
  assert.equal($('[data-celebration]'),null);
  assert.equal($('[data-stage="1"]').getAttribute('aria-current'),'step');
  assert.equal(doc.activeElement,$('#lab-task-title'));
});

test('Dismissing an award keeps the learner in the editor; a repeat pass never opens another award',async t=>{
  const {window,$,doc,check,opens,model}=await fixture(t);
  const editor=$('#lab-code');
  editor.setSelectionRange(3,7);
  check();
  await wait(()=>$('[data-celebration]')?.open);
  const cancel=new window.Event('cancel',{cancelable:true});
  $('[data-celebration]').dispatchEvent(cancel);
  assert.equal(cancel.defaultPrevented,true);
  assert.equal($('[data-celebration]'),null);
  assert.equal(doc.activeElement,editor);
  assert.deepEqual([editor.selectionStart,editor.selectionEnd],[3,7]);
  assert.equal($('[data-stage="0"]').getAttribute('aria-current'),'step');
  check();
  await wait(()=>$('.lab-feedback-dialog')?.open);
  assert.equal(opens.filter(element=>element.hasAttribute('data-celebration')).length,1);
  assert.equal($('[data-xp]').textContent,String(model.stages[0].xp));
});

test('An unavailable native dialog presents the award inline and failed checks never award XP',async t=>{
  const {$,check,model}=await fixture(t,{
    modal:'throws',submit:({snapshot,calls,state})=>calls.length===1
      ?{status:'failed',feedback:{code:'SYNTAX_ERROR'},xp_added:20,snapshot:state}
      :{status:'passed',xp_added:snapshot(1).xp,snapshot:snapshot(1)},
  });
  check();
  await wait(()=>$('.lab-feedback-dialog')?.open);
  assert.equal($('[data-award]').textContent,'');
  assert.equal($('[data-xp]').textContent,'0');
  $('[data-feedback-return]').click();
  check();
  await wait(()=>Boolean($('[data-award]').textContent));
  assert.equal($('[data-celebration]'),null);
  assert.equal($('[data-award]').getAttribute('role'),'status');
  assert.match($('[data-award]').textContent,new RegExp('^\\+'+model.stages[0].xp+' XP'));
  $('[data-stage="1"]').click();
  assert.equal($('[data-award]').textContent,'');
});

test('The final award follows the badge and focuses the completion panel',async t=>{
  const note=labs.at(-1);
  const {$,doc,check,state}=await fixture(t,{note,completed:5});
  assert.equal($('[data-xp]').textContent,String(state.xp));
  assert.equal($('[data-celebration]'),null);
  check();
  await wait(()=>$('[data-celebration]')?.open);
  assert.equal($('#xp-celebration-message').textContent,'Lab completed!');
  assert.equal($('[data-header-progress]').getAttribute('aria-valuenow'),String(state.maximum));
  $('[data-celebration-continue]').click();
  assert.equal($('[data-finish]').hidden,false);
  assert.equal(doc.activeElement,$('[data-finish] h3'));
});

test('A grading result received after leaving the page is not displayed as a new award',async t=>{
  let resolve;
  const {window,$,check,calls,events}=await fixture(t,{
    submit:({snapshot})=>new Promise(done=>{
      resolve=()=>done({status:'passed',xp_added:snapshot(1).xp,snapshot:snapshot(1)});
    }),
  });
  check();
  assert.equal(calls.length,1);
  window.dispatchEvent(new window.PageTransitionEvent('pagehide',{persisted:true}));
  assert.equal(calls[0].signal.aborted,true);
  resolve();
  await new Promise(done=>setImmediate(done));
  assert.equal(events(),0);
  assert.equal($('[data-celebration]'),null);
  assert.equal($('[data-xp]').textContent,'0');
});

test('A delayed draft save cannot hide the lab completion badge after the last pass',async t=>{
  let finishSave;
  const {window,doc,$,check,state}=await fixture(t,{
    note:labs.at(-1),completed:5,
    saveDraft:(draft,before)=>new Promise(resolve=>{
      finishSave=()=>resolve({...before,draft,revision:1});
    }),
  });
  const code=$('#lab-code');
  code.value+='\n# final edit';
  code.dispatchEvent(new window.Event('input',{bubbles:true}));
  const save=window.ClassNotesCodingLab.prepareSignOut();
  await wait(()=>typeof finishSave==='function');
  check();
  await wait(()=>$('[data-celebration]')?.open);
  finishSave();
  assert.equal((await save).saved,true);
  assert.equal($('[data-xp]').textContent,String(state.maximum));
  assert.equal($('[data-finish]').hidden,false);
  $('[data-celebration-continue]').click();
  assert.equal(doc.activeElement,$('[data-finish] h3'));
});

test('A receipt for a different lab is rejected without changing XP, and retry keeps its request ID',async t=>{
  const {$,calls,check,events}=await fixture(t,{
    submit:({snapshot,calls})=>({
      status:'passed',xp_added:snapshot(1).xp,
      snapshot:calls.length===1?{...snapshot(1),mission:labs[1].lab.mission}:snapshot(1),
    }),
  });
  check();
  await wait(()=>$('.lab-feedback-dialog')?.open||$('[data-celebration]')?.open);
  assert.equal($('[data-celebration]'),null);
  assert.ok($('.lab-feedback-dialog').open);
  assert.equal($('[data-xp]').textContent,'0');
  assert.equal(events(),0);
  $('[data-feedback-return]').click();
  check();
  await wait(()=>$('[data-celebration]')?.open);
  assert.equal(calls[1].body.request_id,calls[0].body.request_id);
  assert.equal(events(),1);
});

test('The XP sample renders the real components without auth, grading or network requests',async t=>{
  const html=await xpPreviewDocument(process.cwd());
  assert.doesNotMatch(html,/script[^>]*data-portal|vendor\/supabase|lab-mission-fixture\.mjs/);
  const {dom,window,$}=browser(t,html,'http://class.test/__preview__/lab-xp/');
  window.fetch=()=>{throw Error('XP preview does not use network');};
  const temp='xp-fixture-test-'+process.pid+'.mjs';
  fs.writeFileSync('dist/assets/'+temp,xpFixtureSource());
  t.after(()=>fs.unlinkSync('dist/assets/'+temp));
  await evaluateBuiltModule(dom,temp);
  $('[data-xp-example="step"]').click();
  assert.ok($('[data-celebration]').open);
  assert.equal($('[data-xp]').textContent,'55');
  $('[data-celebration-close]').click();
  $('[data-xp-example="finish"]').click();
  assert.equal($('[data-xp]').textContent,'300');
  assert.equal($('#xp-celebration-message').textContent,'Lab completed!');
  window.dispatchEvent(new window.PageTransitionEvent('pagehide',{persisted:true}));
  assert.equal($('[data-celebration]'),null);
});
