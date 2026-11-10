import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {JSDOM} from 'jsdom';
import {evaluateBuiltModule,evaluateClassicAsset} from './helpers/built-module.mjs';
import {tutorPreviewDocument,tutorFixtureSource} from '../frontend/lab-tutor-preview.mjs';

const base='https://class.test/class-notes/';
const notes=JSON.parse(fs.readFileSync('dist/assets/catalog.json','utf8'))[0].lessons;
const note=notes[0];
const wait=async predicate=>{
  for(let n=0;n<100;n++){if(predicate())return;await new Promise(resolve=>setTimeout(resolve,12));}
  assert.fail('Tutor UI did not settle');
};
function reply(body,text='یک نمونهٔ ساده را بررسی کن.') {
  return {version:2,task:body.task,source:'model',reply:text,conversation:'next-'+body.task,remaining:4};
}
function browser(t,html,url){
  const dom=new JSDOM(html,{url,runScripts:'outside-only',pretendToBeVisual:true});
  const {window}=dom,doc=window.document,$=selector=>doc.querySelector(selector);
  window.scrollTo=()=>{};
  window.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
  window.HTMLElement.prototype.scrollIntoView=()=>{};
  t.after(()=>{window.ClassNotesCodingLab?.dispose();window.ClassNotesSiteUI?.dispose();window.close();});
  function edit(text){
    const question=$('#lab-tutor-question');
    Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype,'value').set.call(question,text);
    question.dispatchEvent(new window.Event('input',{bubbles:true}));
  }
  const submit=()=>$('.lab-tutor-form').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));
  return {dom,window,doc,$,edit,submit};
}
async function fixture(t,request=async body=>reply(body),output=''){
  const context=browser(t,`<!doctype html><html lang="fa" dir="rtl"><head><script data-site-ui src="${base}assets/site-shell.js"></script></head><body><main id="host"></main></body></html>`,base+note.lab.path);
  const {$,dom,window}=context,calls=[];
  if(output)window.Worker=class {
    postMessage(message) {
      queueMicrotask(()=>{
        const send=(type,extra={})=>this.onmessage({data:{type,request:message.request,...extra}});
        if(message.type==='init')send('ready');
        else {send('output',{text:output});send('done');}
      });
    }
    terminate(){}
  };
  await evaluateBuiltModule(dom,'site-shell.js');
  evaluateClassicAsset(dom,'coding-lab.js');
  const model=await evaluateBuiltModule(dom,note.lab.model);
  const snapshot={mission:model.missionId,xp:20,maximum:300,completed:[model.stages[0].id],badge:false,attempts:1,revision:0,draft:null,
    tasks:model.stages.map((step,i)=>({id:step.id,position:i+1,xp:step.xp}))};
  await window.ClassNotesCodingLab.mount($('#host'),{
    userId:'test-tutor',lessonId:note.id,lessonURL:base+note.id+'/',lab:note.lab,snapshot,assets:base+'assets/',
    isCurrent:()=>true,saveDraft:async draft=>({...snapshot,draft,revision:1}),refresh:async()=>snapshot,getAttempt:async()=>null,
    submit:async()=>{throw Error('Tutor must not call grading');},
    tutorRequest:async (body,signal)=>{calls.push({body,signal});return request(body,signal,calls.length);},
  });
  $('[data-intro-start]').click();
  const open=async()=>{
    $('[data-lab-tab="assistant"]').click();
    await wait(()=>Boolean($('[data-react-lab-tutor]:not([hidden])')));
  };
  return {...context,model,calls,open};
}

test('Tutor stays in the lab tab and only attaches bounded code when explicitly selected',async t=>{
  const output='x'.repeat(1150)+'END';
  const {$,edit,submit,calls,open}=await fixture(t,async body=>reply(body,'<img src=x onerror=alert(1)>\nپاسخ نمونه'),output);
  $('[data-run]').click();
  await wait(()=>$('[data-output]').textContent===output);
  await open();
  assert.ok($('#lab-panel-assistant [data-react-lab-tutor][dir="rtl"]'));
  assert.equal($('#lab-tutor-question').dir,'auto');
  assert.equal($('#lab-tutor-share').checked,false);
  const code='a'.repeat(4500)+'END';
  $('#lab-code').value=code;
  edit('سؤال اول');submit();
  await wait(()=>$('.lab-tutor-message[data-role="assistant"]'));
  assert.equal(calls[0].body.code,'');
  assert.equal(calls[0].body.output,'');
  assert.equal($('.lab-tutor-message img'),null);
  assert.match($('.lab-tutor-message[data-role="assistant"]').textContent,/<img src=x/);
  $('#lab-tutor-share').click();
  edit('سؤال دوم');submit();
  await wait(()=>$('.lab-tutor-thread').children.length===4);
  assert.equal(calls[1].body.code,code.slice(-4000));
  assert.equal(calls[1].body.output,output.slice(-800));
  assert.equal(calls[1].body.conversation,'next-'+calls[0].body.task);
  assert.equal($('#lab-tutor-share').checked,false);
  assert.equal($('#lab-code').value,code);
  assert.equal($('[data-xp]').textContent,'20');
});

test('Leaving the tab aborts a pending reply, keeps the draft and isolates it from the next stage',async t=>{
  let resolveLate;
  const late=new Promise(resolve=>{resolveLate=resolve;});
  const {$,edit,submit,calls,open}=await fixture(t,(body,_signal,index)=>index===2?late:Promise.resolve(reply(body,'پاسخ مرحلهٔ '+body.task)));
  await open();
  edit('سؤال ثبت‌شده');submit();
  await wait(()=>$('.lab-tutor-thread').children.length===2);
  edit('پیش‌نویس مرحلهٔ اول');submit();submit();
  assert.equal(calls.length,2);
  $('[data-lab-tab="data"]').click();
  assert.equal(calls[1].signal.aborted,true);
  $('[data-stage="1"]').click();
  await open();
  assert.equal($('#lab-tutor-question').value,'');
  assert.equal($('.lab-tutor-thread').children.length,0);
  resolveLate(reply(calls[1].body,'پاسخ دیررس'));
  await new Promise(resolve=>setImmediate(resolve));
  assert.doesNotMatch($('.lab-tutor-thread').textContent,/پاسخ دیررس/);
  edit('پرسش مرحلهٔ دوم');submit();
  await wait(()=>$('.lab-tutor-thread').children.length===2);
  assert.equal(calls[2].body.conversation,'');
  $('[data-stage="0"]').click();
  await open();
  assert.equal($('#lab-tutor-question').value,'پیش‌نویس مرحلهٔ اول');
  assert.match($('.lab-tutor-thread').textContent,/سؤال ثبت‌شده/);
  assert.doesNotMatch($('.lab-tutor-thread').textContent,/پرسش مرحلهٔ دوم|پاسخ دیررس/);
});

test('A failed or mismatched reply preserves the question and consumes one-time attachment consent',async t=>{
  const {$,edit,submit,calls,open}=await fixture(t,async (body,_signal,index)=>{
    if(index===1)throw Object.assign(new Error('network'),{code:'PROVIDER_UNAVAILABLE'});
    return {...reply(body),task:'other-task'};
  });
  await open();
  $('#lab-code').value='example code';
  $('#lab-tutor-share').click();
  edit('سؤال بدون پاسخ');submit();
  await wait(()=>$('.lab-tutor-status').dataset.kind==='error');
  assert.equal($('#lab-tutor-question').value,'سؤال بدون پاسخ');
  assert.equal($('#lab-tutor-share').checked,false);
  assert.equal(calls[0].body.code,'example code');
  submit();
  await wait(()=>calls.length===2&&!$('.lab-tutor-send').disabled);
  assert.equal(calls[1].body.code,'');
  assert.equal($('.lab-tutor-thread').children.length,0);
  assert.equal($('#lab-tutor-question').value,'سؤال بدون پاسخ');
});

test('Escape returns to the mission without moving the editor caret',async t=>{
  const {window,doc,$,open}=await fixture(t);
  const editor=$('#lab-code');
  editor.setSelectionRange(3,7);
  await open();
  $('#lab-tutor-question').dispatchEvent(new window.KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));
  assert.equal($('#lab-panel-mission').hidden,false);
  assert.equal(doc.activeElement,$('[data-tutor-open]'));
  assert.deepEqual([editor.selectionStart,editor.selectionEnd],[3,7]);
});

test('Returning via the browser history restores the active tutor tab and cancels the old request',async t=>{
  let resolveLate;
  const late=new Promise(resolve=>{resolveLate=resolve;});
  const {window,$,edit,submit,calls,open}=await fixture(t,(body,_signal,index)=>index===1?late:Promise.resolve(reply(body)));
  await open();
  edit('پرسش در انتظار');submit();
  window.dispatchEvent(new window.PageTransitionEvent('pagehide',{persisted:true}));
  assert.equal(calls[0].signal.aborted,true);
  window.dispatchEvent(new window.PageTransitionEvent('pageshow',{persisted:true}));
  if($('.lab-workspace').hidden) $('[data-intro-start]').click();
  await wait(()=>Boolean($('[data-react-lab-tutor]:not([hidden])')));
  assert.equal($('#lab-tab-assistant').getAttribute('aria-selected'),'true');
  assert.equal($('#lab-tutor-question').value,'پرسش در انتظار');
  resolveLate(reply(calls[0].body,'پاسخ قدیمی'));
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal($('.lab-tutor-thread').children.length,0);
  submit();
  await wait(()=>$('.lab-tutor-thread').children.length===2);
});

test('A stalled request times out and permits a retry even if the transport ignores cancellation',async t=>{
  const {window,$,edit,submit,calls,open}=await fixture(t,(body,_signal,index)=>index===1?new Promise(()=>{}):Promise.resolve(reply(body)));
  await open();
  const schedule=window.setTimeout.bind(window);
  window.setTimeout=(fn,ms,...args)=>schedule(fn,ms===70000?0:ms,...args);
  edit('پرسش طولانی');submit();
  await wait(()=>$('.lab-tutor-status').dataset.kind==='error');
  assert.equal(calls[0].signal.aborted,true);
  assert.equal($('.lab-tutor-send').disabled,false);
  assert.equal($('#lab-tutor-question').value,'پرسش طولانی');
  submit();
  await wait(()=>$('.lab-tutor-thread').children.length===2);
});

test('The six-turn limit is enforced, and reset starts an empty conversation',async t=>{
  const {window,$,edit,submit,calls,open}=await fixture(t);
  await open();
  edit('هنوز در حال نوشتنم');
  const editor=$('#lab-tutor-question');
  for(const modifiers of [{shiftKey:true},{isComposing:true}]){
    const event=new window.KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true,...modifiers});
    editor.dispatchEvent(event);
    assert.equal(event.defaultPrevented,false);
  }
  assert.equal(calls.length,0);
  for(let n=0;n<6;n++){
    edit('پرسش '+n);submit();
    await wait(()=>$('.lab-tutor-thread').children.length===(n+1)*2);
  }
  assert.equal($('.lab-tutor-send').disabled,true);
  $('[data-lab-tab="data"]').click();
  await open();
  assert.match($('.lab-tutor-status').textContent,/شش نوبت/);
  edit('نباید ارسال شود');submit();
  assert.equal(calls.length,6);
  $('.lab-tutor-reset').click();
  await wait(()=>$('.lab-tutor-thread').children.length===0&&!$('.lab-tutor-send').disabled);
  edit('سؤال تازه');submit();
  await wait(()=>calls.length===7);
  assert.equal(calls[6].body.conversation,'');
});

test('Local tutor preview uses sample replies without loading auth or sending a request',async t=>{
  const html=await tutorPreviewDocument(process.cwd());
  assert.doesNotMatch(html,/script[^>]*data-portal|vendor\/supabase/);
  const {dom,window,doc,$,edit,submit}=browser(t,html,'http://class.test/__preview__/lab-tutor/');
  window.fetch=()=>{throw Error('Local sample has no network');};
  const tmp='tutor-fixture-test-'+process.pid+'.mjs';
  fs.writeFileSync('dist/assets/'+tmp,tutorFixtureSource());
  t.after(()=>fs.unlinkSync('dist/assets/'+tmp));
  const append=doc.head.append.bind(doc.head);
  doc.head.append=node=>{
    append(node);
    if(node.tagName==='SCRIPT'&&node.src.includes('coding-lab.js')){
      evaluateClassicAsset(dom,'coding-lab.js');queueMicrotask(()=>node.onload());
    }
  };
  await evaluateBuiltModule(dom,tmp);
  $('[data-intro-start]').click();
  $('[data-lab-tab="assistant"]').click();
  await wait(()=>$('#lab-tutor-question'));
  edit('از کجا شروع کنم؟');submit();
  await wait(()=>$('.lab-tutor-message[data-role="assistant"]'));
  assert.match($('.lab-tutor-message[data-role="assistant"]').textContent,/پاسخ نمونه/);
  assert.ok(!window.Classroom);
});
