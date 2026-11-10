import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
import { evaluateBuiltModule, evaluateClassicAsset } from './helpers/built-module.mjs';
import { missionPreviewDocument, missionFixtureSource } from '../frontend/lab-mission-preview.mjs';

const notes=JSON.parse(fs.readFileSync('dist/assets/catalog.json','utf8')).flatMap(course=>course.lessons).filter(note=>note.lab);
const base='https://class.test/class-notes/';
const shell='<script data-site-ui src="'+base+'assets/site-shell.js"></script>';
const wait=async predicate=>{
  for(let n=0;n<100;n++){if(predicate())return;await new Promise(resolve=>setTimeout(resolve,12));}
  assert.fail('Lab UI did not settle');
};

async function fixture(t,note,{complete=0,saved,submit}={}){
  const dom=new JSDOM('<!doctype html><html dir="rtl"><head>'+shell+'</head><body><main id="host"></main></body></html>',
    {url:base+note.lab.path,runScripts:'outside-only',pretendToBeVisual:true});
  const {window}=dom,doc=window.document,$=selector=>doc.querySelector(selector);
  window.scrollTo=()=>{};
  window.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
  window.HTMLElement.prototype.scrollIntoView=()=>{};
  const calls=[];
  t.after(()=>{window.ClassNotesCodingLab?.dispose();window.ClassNotesSiteUI?.dispose();window.close();});
  await evaluateBuiltModule(dom,'site-shell.js');
  evaluateClassicAsset(dom,'coding-lab.js');
  const model=await evaluateBuiltModule(dom,note.lab.model),key='classroom-mission:tester:'+model.missionId;
  const done=model.stages.slice(0,complete);
  const snapshot={mission:model.missionId,completed:done.map(step=>step.id),xp:done.reduce((sum,step)=>sum+step.xp,0),
    maximum:model.stages.reduce((sum,step)=>sum+step.xp,0),tasks:model.stages.map((step,i)=>({id:step.id,position:i+1,xp:step.xp})),
    badge:complete===model.stages.length,attempts:done.length,revision:0,draft:saved||null};
  const options={
    userId:'tester',lessonId:note.id,lessonURL:base+note.id+'/',lab:note.lab,assets:base+'assets/',snapshot,
    isCurrent:()=>true,saveDraft:async draft=>{calls.push(['save',draft]);return {...snapshot,revision:1,draft};},
    refresh:async()=>snapshot,getAttempt:async()=>null,
    submit:async request=>{calls.push(['check',request]);return submit?submit(request,snapshot):{status:'error',feedback:{code:'LAB_PAUSED'},snapshot};},
  };
  const mount=()=>window.ClassNotesCodingLab.mount($('#host'),options);
  await mount();
  const start=()=>$('[data-intro-start]').click();
  const edit=value=>{const editor=$('#lab-code');editor.value=value;editor.dispatchEvent(new window.Event('input',{bubbles:true}));};
  return {window,doc,$,model,snapshot,calls,key,mount,start,edit};
}

for(const note of notes){
  test('React mission navigation preserves the authored task and server lock: '+note.lab.mission,async t=>{
    const {doc,$,model,calls,start}=await fixture(t,note);
    assert.ok($('.lab-mission-header .lab-mission-heading'));
    assert.ok($('.lab-header-utilities [data-header-progress]'));
    assert.ok($('.lab-header-utilities [data-lab-account]'));
    assert.equal($('.lab-workspace').hidden,true);
    assert.equal($('#lab-task-title').textContent,model.stages[0].title);
    assert.equal(doc.querySelectorAll('[data-react-mission-path] button').length,model.stages.length);
    assert.equal($('[data-stage="0"]').getAttribute('aria-current'),'step');
    assert.equal($('[data-stage="1"]').disabled,true);
    assert.match($('#lab-stage-lock-help').textContent,/پاسخ مرحلهٔ پیشین باید تأیید شود/);
    assert.equal($('[data-example]').textContent,model.stages[0].example);
    assert.equal($('[data-input]').innerHTML,model.stages[0].input);
    start();
    $('[data-stage="1"]').click();
    assert.equal($('#lab-task-title').textContent,model.stages[0].title);
    assert.equal($('[data-xp]').textContent,'0');
    assert.equal(calls.length,0);
  });
}

test('Changing stages retains a cleared draft and preserves existing output on reselect',async t=>{
  const {doc,$,model,calls,start,edit,mount,snapshot,window,key}=await fixture(t,notes[0],{complete:2});
  start();
  $('[data-output]').textContent='Existing output';
  $('[data-stage="0"]').click();
  assert.equal($('[data-output]').textContent,'Existing output');
  edit('# stage zero\nprint(10)\n');
  $('[data-stage="1"]').click();
  assert.equal(doc.activeElement,$('#lab-task-title'));
  assert.equal($('#lab-task-title').textContent,model.stages[1].title);
  assert.notEqual($('#lab-code').value,'# stage zero\nprint(10)\n');
  edit('');
  $('[data-stage="0"]').click();
  assert.equal($('#lab-code').value,'# stage zero\nprint(10)\n');
  $('[data-stage="1"]').click();
  assert.equal($('#lab-code').value,'');
  $('[data-stage="0"]').click();
  window.ClassNotesCodingLab.dispose();
  assert.ok(JSON.parse(window.localStorage.getItem(key)).initialized.includes(1));
  await mount();start();$('[data-stage="1"]').click();
  assert.equal($('#lab-code').value,'');
  await window.ClassNotesCodingLab.prepareSignOut();
  assert.deepEqual(Object.keys(calls.at(-1)[1]).sort(),['active','codes','explanation','hints']);
  assert.equal(calls.at(-1)[1].codes[1],'');
  assert.equal($('[data-xp]').textContent,String(snapshot.xp));
});

test('Hints and examples follow the selected stage without changing XP',async t=>{
  const { $,model,snapshot,calls,start }=await fixture(t,notes[1],{complete:2});
  start();
  $('[data-show-hints]').click();
  assert.equal($('#lab-panel-guide').hidden,false);
  assert.ok($('[data-hints]').textContent.includes(model.stages[0].hints[0]));
  const first=$('[data-hints]').textContent;
  $('[data-hint]').click();
  assert.notEqual($('[data-hints]').textContent,first);
  $('[data-stage="1"]').click();
  assert.equal($('#lab-panel-mission').hidden,false);
  assert.equal($('[data-hints]').textContent,'');
  $('[data-react-mission-brief] details').open=true;
  $('[data-stage="0"]').click();
  assert.equal($('[data-react-mission-brief] details').open,false);
  assert.ok($('[data-hints]').textContent.includes(model.stages[0].hints[0]));
  assert.equal($('[data-xp]').textContent,String(snapshot.xp));
  assert.ok(calls.every(([name])=>name!=='check'));
});

test('Stage switching is suspended during grading and responds to the confirmed unlock',async t=>{
  let finish;
  const hold=new Promise(resolve=>{finish=resolve;});
  const { $,model,snapshot,calls,start }=await fixture(t,notes[2],{submit:()=>hold});
  start();
  $('[data-check]').click();
  assert.equal($('[data-stage="0"]').disabled,true);
  assert.equal($('[data-stage="1"]').disabled,true);
  finish({status:'passed',xp_added:model.stages[0].xp,snapshot:{...snapshot,xp:model.stages[0].xp,completed:[model.stages[0].id]}});
  await wait(()=>!$('[data-stage="1"]').disabled);
  assert.equal($('[data-stage="0"]').dataset.done,'true');
  assert.equal($('[data-stage="2"]').disabled,true);
  assert.equal($('[data-xp]').textContent,String(model.stages[0].xp));
  $('[data-next]').click();
  assert.equal($('#lab-task-title').textContent,model.stages[1].title);
  assert.equal(calls.filter(([type])=>type==='check').length,1);
});

test('The mission preview ships no auth bootstrap and mounts the full demo',async t=>{
  const html=await missionPreviewDocument(process.cwd());
  assert.doesNotMatch(html,/script[^>]*data-portal|vendor\/supabase/);
  assert.ok(!fs.existsSync('dist/__preview__/lab-mission/'));
  const dom=new JSDOM(html,{url:'http://class.test/__preview__/lab-mission/?note=04',runScripts:'outside-only',pretendToBeVisual:true});
  const {window}=dom,doc=window.document,$=selector=>doc.querySelector(selector);
  const temp='mission-fixture-test-'+process.pid+'.mjs';
  fs.writeFileSync('dist/assets/'+temp,missionFixtureSource());
  t.after(()=>{
    window.ClassNotesCodingLab?.dispose();window.ClassNotesSiteUI?.dispose();window.close();
    fs.unlinkSync('dist/assets/'+temp);
  });
  let workerStarts=0;
  window.Worker=class { constructor(){workerStarts++;throw Error('The preview must not start a worker');} };
  window.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
  window.scrollTo=()=>{};
  const append=doc.head.append.bind(doc.head);
  doc.head.append=node=>{
    append(node);
    if(node.tagName==='SCRIPT'&&node.src.includes('coding-lab.js')){
      evaluateClassicAsset(dom,'coding-lab.js');queueMicrotask(()=>node.onload());
    }
  };
  await evaluateBuiltModule(dom,temp);
  assert.ok($('.lab-mission-header'));
  assert.equal($('[data-react-mission-path] button[aria-current=step]').dataset.stage,'0');
  $('[data-intro-start]').click();
  $('[data-stage="2"]').click();
  assert.equal($('[data-react-mission-path] button[aria-current=step]').dataset.stage,'2');
  assert.equal($('[data-stage="3"]').disabled,true);
  $('#lab-code').dispatchEvent(new window.KeyboardEvent('keydown',{key:'Enter',ctrlKey:true,bubbles:true,cancelable:true}));
  assert.equal(workerStarts,0);
  assert.ok(!window.Classroom);
});
