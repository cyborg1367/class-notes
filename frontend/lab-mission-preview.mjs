import { readFile } from 'node:fs/promises';
import path from 'node:path';

const route = '/__preview__/lab-mission/';
const script = '/__preview__/lab-mission-fixture.mjs';
const workspaceRoute = '/__preview__/lab-workspace/';
const workspaceScript = '/__preview__/lab-workspace-fixture.mjs';

export async function missionPreviewDocument(root,workspace = false) {
  const catalog = JSON.parse(await readFile(path.join(root,'dist/assets/catalog.json'),'utf8'));
  const lab = catalog.flatMap(course=>course.lessons).find(note=>note.lab);
  const activeRoute=workspace?workspaceRoute:route;
  const activeScript=workspace?workspaceScript:script;
  const fixtureAttr=workspace?'data-lab-workspace-fixture':'data-lab-fixture';
  const banner=workspace?'پیش‌نمایش محلی ویرایشگر · اجرای کد و کنسول شبیه‌سازی می‌شوند. اتصال به حساب و بررسی پاسخ غیرفعال‌اند.'
    :'پیش‌نمایش محلی · دو مرحلهٔ اول نمونه تکمیل شده‌اند. اجرا، نمره‌دهی و ذخیرهٔ حساب غیرفعال‌اند.';
  return (await readFile(path.join(root,'dist',lab.lab.path,'index.html'),'utf8'))
    .replace(/<script\b(?=[^>]*\bdata-portal)[^>]*>\s*<\/script>/,'')
    .replace(/<link\b[^>]*href="[^"]*vendor\/supabase\/supabase\.js[^"]*"[^>]*>/,'')
    .replace('<head>',`<head><base href="/${lab.lab.path}">`)
    .replace(/href="#main"/,`href="${activeRoute}#main"`)
    .replace(/(<main\b[^>]*>)[\s\S]*?(<\/main>)/,
      `$1<aside class="gate-card" data-fixture-banner><p>${banner}</p><nav aria-label="انتخاب لابراتور نمونه" data-fixture-links></nav></aside><div ${fixtureAttr}></div>$2`)
    .replace('</body>',`<script type="module" src="${activeScript}"></script></body>`);
}

function demoWorker() {
  let timer;
  const worker = {
    onmessage:null,
    postMessage(message) {
      const send=(type,extra={})=>worker.onmessage?.({data:{type,request:message.request,...extra}});
      timer=setTimeout(()=>{
        if(message.type==='init'){send('ready');return;}
        const text=message.type==='console'
          ? '[نمونه] نتیجهٔ ساختگی دستور کنسول\n'
          : '[نمونه] خروجی آزمایشی؛ کد به‌صورت واقعی اجرا نشد.\n';
        send('output',{text});send('done');
      },message.type==='init'?120:450);
    },
    terminate(){clearTimeout(timer);},
  };
  return worker;
}

export function missionFixtureSource(workspace = false) {
  return `const shell=document.querySelector('script[data-site-ui]');
const assets=new URL('.',shell.src),version=new URL(shell.src).search;
const asset=name=>{const url=new URL(name,assets);url.search=version;return url.href;};
const params=new URLSearchParams(location.search);
const notes=JSON.parse(document.querySelector('#catalog-data').textContent).flatMap(course=>course.lessons).filter(note=>note.lab);
const note=notes.find(item=>String(item.number)===params.get('note'))||notes[0];
const complete=params.get('complete')==='1';
const nav=document.querySelector('[data-fixture-links]');
for(const item of notes){
 const link=document.createElement('a');link.className='button-outline';link.href=${JSON.stringify(workspace?workspaceRoute:route)}+'?note='+encodeURIComponent(item.number)+(complete?'&complete=1':'');
 link.textContent='لابراتور '+item.number;
 if(item===note)link.setAttribute('aria-current','page');
 nav.append(link,' ');
}
if(complete&&!${workspace})document.querySelector('[data-fixture-banner] p').textContent='پیش‌نمایش محلی · همهٔ مراحل نمونه تکمیل شده‌اند. اجرا، نمره‌دهی و ذخیرهٔ حساب غیرفعال‌اند.';
const [{ready},model]=await Promise.all([import(shell.src),import(asset(note.lab.model))]);
await ready;
await new Promise((resolve,reject)=>{
 const script=document.createElement('script');script.src=asset('coding-lab.js');
 script.onload=resolve;script.onerror=reject;document.head.append(script);
});
const done=model.stages.slice(0,complete?model.stages.length:2);
const snapshot={mission:model.missionId,completed:done.map(step=>step.id),xp:done.reduce((sum,step)=>sum+step.xp,0),
 maximum:model.stages.reduce((sum,step)=>sum+step.xp,0),tasks:model.stages.map((step,i)=>({id:step.id,position:i+1,xp:step.xp})),
 badge:complete,attempts:done.length,revision:0,draft:null};
const root=document.querySelector(${JSON.stringify(workspace?'[data-lab-workspace-fixture]':'[data-lab-fixture]')}),user=${JSON.stringify(workspace?'lab-workspace-preview':'lab-mission-preview')},key='classroom-mission:'+user+':'+model.missionId;
try{localStorage.removeItem(key)}catch{}
const ui=await window.ClassNotesCodingLab.mount(root,{
 previewOnly:true,${workspace?'createRuntimeWorker:'+demoWorker.toString()+',':''}
 userId:user,lessonId:note.id,lessonURL:new URL('../'+note.id+'/',assets).href,lab:note.lab,snapshot,assets:assets.href,assetVersion:version,
 isCurrent:()=>root.isConnected,saveDraft:async()=>snapshot,refresh:async()=>snapshot,getAttempt:async()=>null,
 submit:async()=>({status:'error',feedback:{code:'LAB_PAUSED'},snapshot})
});
const account=document.createElement('span');account.className='mission-brief-xp';account.textContent='حساب نمونه';
root.querySelector('[data-lab-account]').append(account);
window.addEventListener('pagehide',event=>{
 if(!event.persisted){ui.dispose();try{localStorage.removeItem(key)}catch{}}
});`;
}

export function labMissionPreviewPlugin(root) {
  return {name:'local-lab-mission-preview',apply:'serve',configureServer(server) {
    server.middlewares.use(async (request,response,next)=>{
      const url=new URL(request.url||'/','http://local.invalid');
      if(request.method!=='GET'||![route,script,workspaceRoute,workspaceScript].includes(url.pathname))return next();
      try{
        const isScript=url.pathname===script||url.pathname===workspaceScript;
        const workspace=url.pathname===workspaceRoute||url.pathname===workspaceScript;
        response.setHeader('Cache-Control','no-store');
        response.setHeader('Content-Type',isScript?'text/javascript; charset=utf-8':'text/html; charset=utf-8');
        response.end(isScript?missionFixtureSource(workspace):await server.transformIndexHtml(url.pathname,await missionPreviewDocument(root,workspace)));
      }catch(error){next(error);}
    });
  }};
}
