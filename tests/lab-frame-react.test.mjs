import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
import { evaluateBuiltModule, evaluateClassicAsset } from './helpers/built-module.mjs';

const base='https://class.test/class-notes/';
const note=JSON.parse(fs.readFileSync('dist/assets/catalog.json','utf8'))[0].lessons[3];
const consoleKey='classroom-lab-layout:v2',panelKey='classroom-lab-panel-width:v1';

async function openLab(t,{narrow=false,assistant=false}={}){
  const dom=new JSDOM('<html dir="rtl" lang="fa"><head><script data-site-ui src="'+base+'assets/site-shell.js"></script></head><body><main id="host"></main></body></html>',
    {url:base+note.lab.path,runScripts:'outside-only',pretendToBeVisual:true});
  const {window}=dom,{document:doc,localStorage:storage}=window,$=selector=>doc.querySelector(selector);
  window.scrollTo=()=>{};
  window.HTMLElement.prototype.scrollIntoView=()=>{};
  window.matchMedia=query=>({matches:narrow&&query==='(max-width:860px)',addEventListener(){},removeEventListener(){}});
  if(narrow)Object.defineProperty(window,'innerWidth',{value:390,configurable:true});
  t.after(()=>{window.ClassNotesCodingLab?.dispose();window.ClassNotesSiteUI?.dispose();window.close();});
  storage.setItem(consoleKey,JSON.stringify({ratio:56,collapsed:true}));
  storage.setItem(panelKey,'43');
  await evaluateBuiltModule(dom,'site-shell.js');
  evaluateClassicAsset(dom,'coding-lab.js');
  const model=await evaluateBuiltModule(dom,note.lab.model);
  const snapshot={mission:model.missionId,xp:0,maximum:300,completed:[],badge:false,attempts:0,revision:0,draft:null,
    tasks:model.stages.map((stage,i)=>({id:stage.id,position:i+1,xp:stage.xp}))};
  const calls=[];
  await window.ClassNotesCodingLab.mount($('#host'),{
    userId:'frame-test',lessonId:note.id,lessonURL:base+note.id+'/',lab:note.lab,snapshot,assets:base+'assets/',
    isCurrent:()=>true,saveDraft:async draft=>{calls.push('save');return {...snapshot,draft};},
    refresh:async()=>{calls.push('refresh');return snapshot;},
    getAttempt:async()=>{calls.push('attempt');return null;},
    submit:async()=>{calls.push('submit');throw Error('Unexpected grading');},
    tutorRequest:assistant?async()=>{calls.push('tutor');throw Error('Unexpected tutor request');}:undefined,
  });
  $('[data-intro-start]').click();
  function key(target,value){
    const event=new window.KeyboardEvent('keydown',{key:value,bubbles:true,cancelable:true});
    target.dispatchEvent(event);
    return event.defaultPrevented;
  }
  return {window,doc,$,storage,key,calls};
}

test('Lab frame keeps the editor mounted and follows the visible tab order with keyboard and pointer',async t=>{
  const {doc,$,key,calls}=await openLab(t,{assistant:true});
  const tabs=[...doc.querySelectorAll('[role="tab"]')],editor=$('#lab-code');
  assert.ok($('[data-react-lab-frame]').contains(editor));
  assert.equal($('[role="tablist"]').dir,'ltr');
  assert.deepEqual(tabs.map(tab=>tab.dataset.labTab),['mission','data','guide','assistant']);
  editor.setSelectionRange(2,5);
  function selected(index){
    tabs.forEach((tab,i)=>{
      const panel=doc.getElementById(tab.getAttribute('aria-controls'));
      assert.equal(tab.getAttribute('aria-selected'),String(i===index));
      assert.equal(tab.tabIndex,i===index?0:-1);
      assert.equal(panel.hidden,i!==index);
      assert.equal(panel.getAttribute('aria-labelledby'),tab.id);
    });
  }
  selected(0);
  assert.equal(key(tabs[0],'ArrowRight'),true);
  selected(1);assert.equal(doc.activeElement,tabs[1]);
  assert.equal(key(tabs[1],'End'),true);
  selected(3);assert.equal(doc.activeElement,tabs[3]);
  assert.equal(key(tabs[3],'ArrowRight'),true);
  selected(0);assert.equal(doc.activeElement,tabs[0]);
  tabs[2].click();selected(2);
  assert.equal(key(tabs[2],'Home'),true);selected(0);
  assert.equal($('#lab-code'),editor);
  assert.equal(editor.selectionStart,2);
  assert.equal(editor.selectionEnd,5);
  assert.equal($('[data-xp]').textContent,'0');
  assert.deepEqual(calls,[]);
});

test('Lab focus and splitter changes keep the previous preferences, selection and draft',async t=>{
  const {window,$,key,storage,calls}=await openLab(t);
  const editor=$('#lab-code'),side=$('[data-panel-resizer]'),row=$('[data-resizer]'),consoleBody=$('[data-console-body]');
  assert.equal($('[data-lab-tab="assistant"]'),null);
  assert.equal(consoleBody.hidden,true);
  assert.equal(row.tabIndex,-1);
  assert.equal(side.getAttribute('aria-valuenow'),'43');
  $('[data-console-toggle]').click();
  assert.equal(row.getAttribute('aria-valuenow'),'56');
  assert.equal(key(row,'ArrowUp'),true);
  assert.deepEqual(JSON.parse(storage.getItem(consoleKey)),{ratio:51,collapsed:false});
  assert.equal(key(side,'ArrowLeft'),true);
  assert.equal(JSON.parse(storage.getItem(panelKey)),45);

  const original=editor.value;
  editor.setSelectionRange(2,5);
  $('[data-focus]').click();
  assert.equal($('#lab-instructions').hidden,true);
  assert.equal(side.tabIndex,-1);
  key(editor,'Escape');
  assert.equal($('#lab-instructions').hidden,false);
  $('[data-output-focus]').click();
  assert.equal($('#lab-editor-region').hidden,true);
  assert.equal(row.hidden,true);
  key($('[data-output-focus]'),'Escape');
  assert.equal($('#lab-editor-region').hidden,false);
  assert.equal(row.hidden,false);
  assert.equal($('#lab-code'),editor);
  assert.equal(editor.value,original);
  assert.equal(editor.selectionStart,2);
  assert.equal(editor.selectionEnd,5);
  assert.deepEqual(calls,[]);

  function pointer(target,type,x,id){
    const event=new window.MouseEvent(type,{bubbles:true,cancelable:true,button:0,clientX:x});
    Object.defineProperty(event,'pointerId',{value:id});
    target.dispatchEvent(event);
  }
  pointer(side,'pointerdown',500,7);
  pointer(window,'pointermove',420,8);
  assert.equal(side.getAttribute('aria-valuenow'),'45');
  pointer(window,'pointermove',420,7);
  assert.ok(Number(side.getAttribute('aria-valuenow'))>45);
  pointer(window,'pointerup',420,7);
  const saved=storage.getItem(panelKey);
  assert.ok(Number(saved)>45);
  pointer(window,'pointermove',350,7);
  assert.equal(storage.getItem(panelKey),saved);
});

test('The phone layout removes the horizontal handle from the keyboard path and keeps the saved desktop width',async t=>{
  const {$,storage,key,calls}=await openLab(t,{narrow:true});
  const side=$('[data-panel-resizer]');
  assert.equal(side.hidden,true);
  assert.equal(side.tabIndex,-1);
  assert.equal(key(side,'End'),false);
  assert.equal(storage.getItem(panelKey),'43');
  $('[data-lab-tab="data"]').click();
  assert.equal($('#lab-panel-data').hidden,false);
  assert.deepEqual(calls,[]);
});
