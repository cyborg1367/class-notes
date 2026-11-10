import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
import { evaluateBuiltModule,evaluateClassicAsset } from './helpers/built-module.mjs';

const labs=JSON.parse(fs.readFileSync('dist/assets/catalog.json','utf8')).flatMap(course=>course.lessons).filter(note=>note.lab);
const base='https://class.test/class-notes/';
function browser(t,html,url) {
  const dom=new JSDOM('<!doctype html><html lang="fa" dir="rtl"><head><script data-site-ui src="'+base+
    'assets/site-shell.js"></script></head><body>'+html+'</body></html>',{url,runScripts:'outside-only',pretendToBeVisual:true});
  const {window}=dom,doc=window.document,$=selector=>doc.querySelector(selector);
  window.scrollTo=()=>{};
  window.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
  window.HTMLElement.prototype.scrollIntoView=()=>{};
  t.after(()=>{window.ClassNotesCodingLab?.dispose();window.ClassNotesSiteUI?.dispose();window.close();});
  return {dom,window,doc,$};
}
const wait=async predicate=>{
  for(let i=0;i<100;i++){if(predicate())return;await new Promise(resolve=>setTimeout(resolve,12));}
  assert.fail('Lab reference UI did not settle');
};
async function fixture(t,note,{active=0,worker}={}) {
  const ui=browser(t,'<main id="host"></main>',base+note.lab.path);
  const {window,dom,$}=ui;
  if(worker)window.Worker=worker;
  await evaluateBuiltModule(dom,'site-shell.js');
  evaluateClassicAsset(dom,'coding-lab.js');
  const model=await evaluateBuiltModule(dom,note.lab.model);
  const stages=model.stages;
  const snapshot={mission:model.missionId,xp:300,maximum:300,completed:stages.map(s=>s.id),badge:true,revision:0,attempts:6,
    draft:{active,codes:stages.map((_,index)=>index===active?'pass':''),hints:stages.map(()=>0),explanation:''}};
  await window.ClassNotesCodingLab.mount($('#host'),{
    userId:'lab-reference-test',lessonId:note.id,lessonURL:base+note.id+'/',assets:base+'assets/',assetVersion:'?v=reference-test',
    lab:note.lab,snapshot,isCurrent:()=>true,saveDraft:async draft=>({...snapshot,draft}),refresh:async()=>snapshot,getAttempt:async()=>null,
    submit:async()=>{throw Error('Lab reference must not grade code');},
  });
  $('[data-intro-start]').click();
  const tab=name=>$('#lab-tab-'+name).click();
  return {...ui,model,tab};
}

for(const note of labs) {
  test('Lab reference matches authored data and guide: '+note.lab.mission,async t=>{
    const {$,model,tab,doc}=await fixture(t,note);
    const code=$('#lab-code');
    code.setSelectionRange(1,3);
    tab('data');
    const panel=$('#lab-panel-data');
    assert.equal(panel.hidden,false);
    assert.equal(panel.querySelector('h2').textContent,model.meta.dataTitle);
    const rows=[...panel.querySelectorAll('tbody tr')];
    assert.equal(rows.length,model.dataset.X.length);
    assert.equal(rows[0].querySelector('th').scope,'row');
    assert.deepEqual([...rows[0].cells].slice(2,2+model.dataset.columns.length).map(cell=>Number(cell.textContent)),Array.from(model.dataset.X[0]));
    assert.equal(panel.querySelector('.mission-table').getAttribute('role'),'region');
    assert.equal(panel.querySelector('.mission-table').tabIndex,0);
    const contract=panel.querySelector('details');
    assert.equal(contract.querySelector('pre').textContent,model.bootstrap);
    contract.open=true;
    if(model.csvAsset){
      const url=new URL(panel.querySelector('a[download]').href);
      assert.equal(url.href,base+'assets/'+model.csvAsset+'?v=reference-test');
      assert.ok(fs.statSync('dist/assets/'+model.csvAsset).size>0);
    }else assert.equal(panel.querySelector('a[download]'),null);
    assert.equal(Boolean(panel.querySelector('[data-evaluation-preview]')),Boolean(model.previewCode));
    if(model.dataset.query_new){
      assert.equal(panel.querySelector('[data-second-query]').hidden,true);
      $('[data-stage="'+(model.stages.length-1)+'"]').click();
      tab('data');
      assert.equal(panel.querySelector('[data-second-query]').hidden,false);
      assert.equal(panel.querySelector('[data-second-query] strong').textContent,JSON.stringify(model.dataset.query_new));
      assert.equal(panel.querySelector('details'),contract);
      assert.equal(contract.open,true);
      $('[data-stage="0"]').click();
      tab('data');
      assert.equal(panel.querySelector('[data-second-query]').hidden,true);
    }else{
      assert.equal(panel.querySelector('[data-second-query]'),null);
      assert.deepEqual([code.selectionStart,code.selectionEnd],[1,3]);
    }
    tab('mission');
    $('[data-show-hints]').click();
    assert.equal($('#lab-panel-guide').hidden,false);
    assert.equal(doc.activeElement,$('#lab-tab-guide'));
    assert.equal($('.mission-story summary').textContent,model.meta.storyTitle);
    assert.equal($('#lab-panel-guide .quiet-link').href,base+note.id+'/');
    assert.equal($('#lab-panel-guide [data-hints]').children.length,1);
    assert.equal($('[data-xp]').textContent,'300');
  });
}

function controlledPreviewWorker() {
  const runs=[];
  class Worker {
    postMessage(message){
      const emit=(type,extra={})=>this.onmessage({data:{type,request:message.request,...extra}});
      if(message.type==='init')queueMicrotask(()=>emit('ready'));
      if(message.type==='run')runs.push((withChart=true)=>{
        if(withChart)emit('preview',{value:{kind:'thresholds',rows:[
          {threshold:0.25,precision:0.5,recall:1,f1:0.667,tpr:1,fpr:0.5,tn:1,fp:1,fn:0,tp:1,n_flagged:2},
          {threshold:0.75,precision:1,recall:0.5,f1:0.667,tpr:0.5,fpr:0,tn:2,fp:0,fn:1,tp:1,n_flagged:1},
        ]}});
        emit('done');
      });
    }
    terminate(){}
  }
  return { Worker,runs };
}

test('The real threshold chart stays in the data tab when the learner has opened the guide',async t=>{
  const {Worker,runs}=controlledPreviewWorker();
  const {$,tab,window}=await fixture(t,labs.at(-1),{active:4,worker:Worker});
  $('[data-run]').click();
  await wait(()=>runs.length===1);
  tab('guide');
  runs[0]();
  const chart=$('[data-evaluation-preview]');
  await wait(()=>!chart.hidden);
  assert.equal($('#lab-panel-guide').hidden,false);
  assert.equal($('#lab-panel-data').hidden,true);
  tab('data');
  const slider=chart.querySelector('input');
  slider.value='1';
  slider.dispatchEvent(new window.Event('input',{bubbles:true}));
  assert.equal(chart.querySelector('output').textContent,'0.750');
  $('[data-stage="0"]').click();
  assert.equal(chart.hidden,true);
  assert.equal(chart.children.length,0);
  assert.equal($('[data-xp]').textContent,'300');
});

test('A second Python run with no chart cannot leave the previous threshold result on screen',async t=>{
  const {Worker,runs}=controlledPreviewWorker();
  const {$}=await fixture(t,labs.at(-1),{active:4,worker:Worker});
  $('[data-run]').click();
  await wait(()=>runs.length===1);
  runs[0]();
  const chart=$('[data-evaluation-preview]');
  await wait(()=>!chart.hidden);
  $('[data-run]').click();
  await wait(()=>runs.length===2);
  assert.equal(chart.hidden,true);
  runs[1](false);
  assert.equal(chart.hidden,true);
  assert.equal(chart.childElementCount,0);
});

test('A chart arriving during keyboard navigation does not hide the focused mission panel',async t=>{
  const {Worker,runs}=controlledPreviewWorker();
  const {$,doc}=await fixture(t,labs.at(-1),{active:4,worker:Worker});
  $('[data-run]').click();
  await wait(()=>runs.length===1);
  const title=$('#lab-task-title');
  title.focus();
  runs[0]();
  await wait(()=>!$('[data-evaluation-preview]').hidden);
  assert.equal($('#lab-panel-mission').hidden,false);
  assert.equal(doc.activeElement===title,true);
});

test('Late previews are discarded after stage changes; authored prose never mounts executable markup',async t=>{
  const {dom,$}=browser(t,'<main><div data-react-lab-dataset></div><div data-react-lab-guide></div></main>',base);
  const {loadLabMission}=await evaluateBuiltModule(dom,'site-shell.js');
  const {mountLabReference}=await loadLabMission();
  const model=await evaluateBuiltModule(dom,labs.at(-1).lab.model);
  let loaded, attempts=0;
  const delayed=new Promise(resolve=>{loaded=resolve;});
  const ui=mountLabReference($('main'),{
    dataset:model.dataset,meta:{...model.meta,dataIntro:'<p onclick="doBad()"><code dir="ltr" style="color:red">X[0]</code><img src=x onerror="doBad()"><script>doBad()</script></p>'},
    bootstrap:model.bootstrap,lessonURL:base+labs.at(-1).id+'/',
    loadPreview:()=>{attempts++;if(attempts===1)throw Error('Download failed');return delayed;},
  });
  t.after(()=>ui.dispose());
  assert.equal($('[data-react-lab-dataset] p[onclick]'),null);
  assert.equal($('[data-react-lab-dataset] img, [data-react-lab-dataset] script'),null);
  assert.equal($('[data-react-lab-dataset] code').dir,'ltr');
  assert.equal($('[data-react-lab-dataset] code').textContent,'X[0]');
  const chart=$('[data-evaluation-preview]');
  assert.equal(await ui.showPreview({},()=>true),false);
  assert.match(chart.textContent,/کنسول/);
  const old=ui.showPreview({name:'old'},()=>true);
  ui.selectStage(true);
  ui.selectStage(false);
  const newest=ui.showPreview({name:'new'},()=>true);
  loaded((host,value)=>{host.textContent=value.name;host.hidden=false;});
  assert.equal(await old,false);
  assert.equal(await newest,true);
  assert.equal(chart.textContent,'new');
  ui.dispose();
  assert.equal(await ui.showPreview({name:'after dispose'},()=>true),false);
});
