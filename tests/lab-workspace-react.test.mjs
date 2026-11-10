import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
import { evaluateBuiltModule,evaluateClassicAsset } from './helpers/built-module.mjs';
import { missionPreviewDocument,missionFixtureSource } from '../frontend/lab-mission-preview.mjs';

const catalog=JSON.parse(fs.readFileSync('dist/assets/catalog.json','utf8'));
const note=catalog[0].lessons[0],base='https://class.test/class-notes/';
const wait=async predicate=>{
  for(let i=0;i<90;i++){if(predicate())return;await new Promise(resolve=>setTimeout(resolve,15));}
  assert.fail('Workspace did not settle');
};
function browser(t,html,url){
  const dom=new JSDOM(html,{url,runScripts:'outside-only',pretendToBeVisual:true});
  const {window}=dom,doc=window.document,$=selector=>doc.querySelector(selector);
  window.scrollTo=()=>{};
  window.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
  window.HTMLElement.prototype.scrollIntoView=()=>{};
  t.after(()=>{window.ClassNotesCodingLab?.dispose();window.ClassNotesSiteUI?.dispose();window.close();});
  return {dom,window,doc,$};
}
async function fixture(t){
  const context=browser(t,`<!doctype html><html dir="rtl" lang="fa"><head><script data-site-ui src="${base}assets/site-shell.js"></script></head><body><main id="host"></main></body></html>`,base+note.lab.path);
  const {dom,window,$}=context;
  const workers=[],saves=[];
  let checks=0;
  window.Worker=class {
    constructor(url,options){this.url=url;this.options=options;this.posts=[];workers.push(this);}
    postMessage(message){this.posts.push(message);}
    send(type,extra={}){this.onmessage({data:{type,request:this.posts.at(-1).request,...extra}});}
    terminate(){this.stopped=true;}
  };
  await evaluateBuiltModule(dom,'site-shell.js');
  evaluateClassicAsset(dom,'coding-lab.js');
  const model=await evaluateBuiltModule(dom,note.lab.model);
  const snapshot={mission:model.missionId,xp:20,maximum:300,completed:[model.stages[0].id],badge:false,attempts:1,revision:0,
    tasks:model.stages.map((stage,index)=>({id:stage.id,position:index+1,xp:stage.xp})),draft:null};
  await window.ClassNotesCodingLab.mount($('#host'),{
    userId:'test-workspace',lessonId:note.id,lessonURL:base+note.id+'/',lab:note.lab,snapshot,assets:base+'assets/',
    isCurrent:()=>true,saveDraft:async draft=>{saves.push(draft);return {...snapshot,revision:1,draft};},refresh:async()=>snapshot,
    getAttempt:async()=>null,submit:async()=>{checks++;return {status:'error',feedback:{code:'LAB_PAUSED'},snapshot};},
  });
  $('[data-intro-start]').click();
  const key=(value,modifiers={})=>{
    const event=new window.KeyboardEvent('keydown',{key:value,bubbles:true,cancelable:true,...modifiers});
    $('#lab-code').dispatchEvent(event);
    return event;
  };
  const edit=value=>{const editor=$('#lab-code');editor.value=value;editor.dispatchEvent(new window.Event('input',{bubbles:true}));};
  return {...context,workers,saves,key,edit,checks:()=>checks};
}

test('React editor handles indentation and keyboard exit without losing the stage draft',async t=>{
  const {$,key,edit,saves,window}=await fixture(t);
  const editor=$('#lab-code');
  assert.ok(editor.closest('[data-react-lab-workspace]'));
  assert.equal($('.lab-editor-toolbar').dir,'rtl');
  assert.equal($('.lab-actions').dir,'rtl');
  assert.equal($('.lab-file bdi').dir,'ltr');
  for(const selector of ['#lab-editor-region','.lab-lines','[data-highlight]','#lab-code','[data-output]','.lab-console-form','#lab-command']){
    assert.equal($(selector).dir,'ltr',selector);
  }
  assert.equal($('.lab-console-head').dir,'rtl');
  assert.equal($('.lab-console-form button').dir,'rtl');
  edit('print(42)');
  editor.setSelectionRange(0,0);
  assert.equal(key('Tab').defaultPrevented,true);
  assert.equal(editor.value,'    print(42)');
  assert.equal(key('Tab',{shiftKey:true}).defaultPrevented,false);
  key('Escape');
  assert.equal(key('Tab').defaultPrevented,false);
  assert.equal(key('Tab',{isComposing:true}).defaultPrevented,false);
  $('[data-stage="1"]').click();
  $('[data-stage="0"]').click();
  assert.equal($('#lab-code'),editor);
  assert.equal(editor.value,'    print(42)');
  await window.ClassNotesCodingLab.prepareSignOut();
  assert.equal(saves.at(-1).codes[0],'    print(42)');
});

test('Run and console commands use the worker, render output as text and do not submit grading',async t=>{
  const {$,window,key,edit,workers,checks}=await fixture(t);
  edit('print("hello")');
  assert.equal(key('Enter',{ctrlKey:true}).defaultPrevented,true);
  assert.equal(workers.length,1);
  const worker=workers[0];
  assert.equal(worker.posts[0].type,'init');
  assert.deepEqual(Array.from(worker.posts[0].packages),['numpy']);
  worker.send('ready');
  assert.equal(worker.posts[1].type,'run');
  assert.equal(worker.posts[1].code,'print("hello")');
  const unsafe='<img src=x onerror=alert(1)>\n';
  worker.send('output',{text:unsafe});worker.send('done');
  await wait(()=>!$('#lab-command').disabled);
  assert.equal($('[data-output]').textContent,unsafe);
  assert.equal($('[data-output] img'),null);
  const toggle=$('[data-repl-toggle]'),form=$('#lab-repl-form');
  assert.ok($('.lab-console-head').contains(toggle));
  assert.equal(form.hidden,true);
  toggle.click();
  await wait(()=>!form.hidden);
  assert.equal(toggle.getAttribute('aria-expanded'),'true');
  assert.equal(window.document.activeElement,$('#lab-command'));
  $('#lab-command').dispatchEvent(new window.KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));
  await wait(()=>form.hidden);
  assert.equal(window.document.activeElement,toggle);
  toggle.click();
  await wait(()=>!form.hidden);
  $('#lab-command').value='X.shape';
  $('.lab-console-form').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));
  assert.equal(worker.posts.at(-1).type,'console');
  assert.equal(worker.posts.at(-1).code,'X.shape');
  assert.equal(worker.posts.at(-1).bootstrap,undefined);
  worker.send('output',{text:'(10, 3)\n'});worker.send('done');
  await wait(()=>$('[data-output]').textContent.includes('(10, 3)'));
  assert.match($('[data-output]').textContent,/>>> X\.shape/);
  $('[data-clear]').click();
  await wait(()=>$('[data-output]').textContent==='');
  assert.equal(checks(),0);
  assert.equal($('[data-xp]').textContent,'20');
});

test('Stop ignores a late worker reply and preserves the editor and resize controls',async t=>{
  const {$,window,edit,workers}=await fixture(t);
  const editor=$('#lab-code');
  edit('print(2)');
  $('[data-run]').click();
  const worker=workers[0];
  worker.send('ready');
  await wait(()=>!$('[data-stop]').hidden);
  $('[data-stop]').click();
  worker.send('output',{text:'late reply'});
  await wait(()=>$('[data-output]').textContent.includes('[Stopped]'));
  assert.doesNotMatch($('[data-output]').textContent,/late reply/);
  assert.equal(worker.stopped,true);
  const splitter=$('[data-resizer]'),before=Number(splitter.getAttribute('aria-valuenow'));
  splitter.dispatchEvent(new window.KeyboardEvent('keydown',{key:'ArrowUp',bubbles:true,cancelable:true}));
  assert.ok(Number(splitter.getAttribute('aria-valuenow'))<before);
  assert.ok($('.lab-console-head').contains($('[data-console-toggle]')));
  $('[data-console-toggle]').click();
  assert.equal($('[data-console-body]').hidden,true);
  $('[data-console-toggle]').click();
  assert.equal($('[data-console-body]').hidden,false);
  assert.equal($('#lab-code'),editor);
  assert.equal(editor.value,'print(2)');
});

test('The workspace preview uses simulated output without starting a real worker or auth',async t=>{
  const html=await missionPreviewDocument(process.cwd(),true);
  assert.doesNotMatch(html,/script[^>]*data-portal|vendor\/supabase/);
  assert.ok(!fs.existsSync('dist/__preview__/lab-workspace/'));
  const {dom,window,doc,$}=browser(t,html,'http://class.test/__preview__/lab-workspace/');
  let realWorkers=0;
  window.Worker=class{constructor(){realWorkers++;throw Error('No real worker allowed in fixture');}};
  const temp='workspace-fixture-test-'+process.pid+'.mjs';
  fs.writeFileSync('dist/assets/'+temp,missionFixtureSource(true));
  t.after(()=>fs.unlinkSync('dist/assets/'+temp));
  const append=doc.head.append.bind(doc.head);
  doc.head.append=node=>{
    append(node);
    if(node.tagName==='SCRIPT'&&node.src.includes('coding-lab.js')){
      evaluateClassicAsset(dom,'coding-lab.js');queueMicrotask(()=>node.onload());
    }
  };
  await evaluateBuiltModule(dom,temp);
  $('[data-intro-start]').click();
  $('[data-run]').click();
  await wait(()=>$('[data-output]').textContent.includes('کد به‌صورت واقعی اجرا نشد'));
  assert.equal(realWorkers,0);
  assert.equal($('[data-check]').hidden,true);
  assert.ok(!window.Classroom);
});
