import { readFile } from 'node:fs/promises';
import path from 'node:path';

const route = '/__preview__/lab/';
const script = '/__preview__/lab-fixture.mjs';

export async function labPreviewDocument(root) {
  const catalog = JSON.parse(await readFile(path.join(root,'dist/assets/catalog.json'),'utf8'));
  const labRoute = '/' + catalog.flatMap(course=>course.lessons).find(lesson=>lesson.lab).lab.path;
  return (await readFile(path.join(root,'dist',labRoute.slice(1),'index.html'),'utf8'))
    .replace(/<script\b(?=[^>]*\bdata-portal)[^>]*>\s*<\/script>/,'')
    .replace(/<link\b[^>]*href="[^"]*vendor\/supabase\/supabase\.js[^"]*"[^>]*>/,'')
    .replace('<head>',`<head><base href="${labRoute}">`)
    .replace('</head>','<style>[data-lab-demo] .lab-workspace:not([hidden]){display:block;min-height:0;height:auto;padding-block:16px}[data-lab-demo] textarea{display:block;box-sizing:border-box;width:100%;margin-block:8px 12px;padding:10px;font:14px/1.7 monospace}[data-sample-labs]{display:flex;flex-wrap:wrap;gap:6px}</style></head>')
    .replace(/href="#main"/,`href="${route}#main"`)
    .replace(/(<main\b[^>]*>)[\s\S]*?(<\/main>)/,
      '$1<aside class="shell gate-card"><p>پیش‌نمایش محلی داستان و بازخورد؛ بدون ورود، اجرا، ذخیره یا امتیاز.</p><nav aria-label="لابراتور نمونه" data-sample-labs></nav></aside><section class="shell" data-lab-demo></section>$2')
    .replace('</body>',`<script type="module" src="${script}"></script></body>`);
}

export function labFixtureSource() {
  return `const shell=document.querySelector('script[data-site-ui]');
const assets=new URL('.',shell.src);
const asset=name=>{const url=new URL(name,assets);url.search=new URL(shell.src).search;return url.href;};
const params=new URLSearchParams(location.search);
const lessons=JSON.parse(document.querySelector('#catalog-data').textContent).flatMap(course=>course.lessons).filter(item=>item.lab);
const lesson=lessons.find(item=>String(item.number)===params.get('note'))||lessons[0];
const nav=document.querySelector('[data-sample-labs]');
for(const item of lessons){
 const link=document.createElement('a');link.className='button-outline';
 link.href='/__preview__/lab/?note='+encodeURIComponent(item.number)+(params.has('complete')?'&complete=1':'');
 link.textContent='لابراتور '+item.number;
 if(item===lesson)link.setAttribute('aria-current','page');
 nav.append(link,' ');
}
const [model,{mountExperience},{mountLabPresentation}]=await Promise.all([
 import(asset(lesson.lab.model)),import(asset('coding-lab-experience.mjs')),import(shell.src).then(async module=>{await module.ready;return module.loadLabPresentation();})
]);
const root=document.querySelector('[data-lab-demo]');root.classList.add('lab-open-notebook');
root.innerHTML='<header class="mission-top"><button class="lab-story-review" type="button" data-story-review>مرور داستان</button></header><div class="lab-workspace" hidden><div class="gate-card"><h2 id="lab-task-title" tabindex="-1">محیط نمونهٔ مأموریت</h2><p>برای امتحان بازگشت به کد، بخشی از متن را انتخاب کن و بازخورد نمونه را باز کن.</p><label for="lab-code">کد نمونه</label><textarea id="lab-code" dir="ltr" spellcheck="false" rows="5"></textarea><button class="button-outline" data-demo-feedback type="button">بازخورد نمونه</button><button class="lab-last-feedback" data-last-feedback hidden type="button">آخرین بازخورد</button></div></div>';
root.querySelector('#lab-code').value=model.normalize({}).codes[0];
const experience=mountExperience(root,{meta:{...model.meta,title:lesson.lab.title,lessonBridge:lesson.lab.bridge},
 dataset:model.dataset,stages:model.stages,missionId:model.missionId,hasProgress:params.has('complete'),mountLabPresentation});
root.querySelector('[data-demo-feedback]').onclick=()=>experience.showFeedback({code:'MISSING_FUNCTION'},'failed',model.stages[0]);
experience.start();
window.addEventListener('pagehide',event=>{if(!event.persisted)experience.dispose();});`;
}

export function labPreviewPlugin(root) {
  return {name:'local-lab-experience-preview',apply:'serve',configureServer(server) {
    server.middlewares.use(async (request,response,next)=>{
      const url=new URL(request.url||'/','http://local.invalid');
      if(request.method!=='GET'||![route,script].includes(url.pathname))return next();
      try {
        const isScript=url.pathname===script;
        response.setHeader('Cache-Control','no-store');
        response.setHeader('Content-Type',isScript?'text/javascript; charset=utf-8':'text/html; charset=utf-8');
        response.end(isScript?labFixtureSource():await server.transformIndexHtml(route,await labPreviewDocument(root)));
      } catch(error) { next(error); }
    });
  }};
}
