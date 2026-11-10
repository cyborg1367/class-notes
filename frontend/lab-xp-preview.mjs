import { missionPreviewDocument } from './lab-mission-preview.mjs';

export const xpPreviewPath = '/__preview__/lab-xp/';
const fixturePath = '/__preview__/lab-xp-fixture.mjs';
const markup = `<article class="gate-card" data-lab-xp-preview>
  <h1>پیش‌نمایش پیشرفت لابراتور</h1>
  <p>این امتیازها نمونه‌اند و در هیچ حسابی ثبت نمی‌شوند.</p>
  <div data-react-lab-xp></div>
  <p><button class="button-forest" type="button" data-xp-example="step">نمایش پاداش یک مرحله</button>
  <button class="button-outline" type="button" data-xp-example="finish">نمایش پایان لابراتور</button></p>
  <div data-react-lab-award></div>
  <p role="status" data-xp-preview-status></p>
</article>`;

export async function xpPreviewDocument(root) {
  return (await missionPreviewDocument(root))
    .replace(/(<main\b[^>]*>)[\s\S]*?(<\/main>)/,'$1'+markup+'$2')
    .replace(/<script type="module" src="\/__preview__\/lab-mission-fixture\.mjs"><\/script>/,
      '<script type="module" src="'+fixturePath+'"></script>')
    .replace('/__preview__/lab-mission/#main',xpPreviewPath+'#main');
}

function startSample(mountLabXp) {
  const host = document.querySelector('[data-lab-xp-preview]');
  const status = host.querySelector('[data-xp-preview-status]');
  const xp = mountLabXp(host,{onDismiss(_stage,advance){
    status.textContent=advance?'ادامه انتخاب شد.':'پنجرهٔ نمونه بسته شد.';
  }});
  xp.update({xp:20,maximum:300,completed:1,total:6});
  host.addEventListener('click',event=>{
    const type=event.target.closest('[data-xp-example]')?.dataset.xpExample;
    if(!type)return;
    const finished=type==='finish';
    const sample=finished?{stage:5,earned:80,from:220,to:300}:{stage:1,earned:35,from:20,to:55};
    status.textContent='';
    xp.update({xp:sample.to,maximum:300,completed:finished?6:2,total:6});
    xp.show({...sample,maximum:300,finished});
  });
  window.addEventListener('pagehide',event=>{if(event.persisted)xp.clear();else xp.dispose();});
}

export function xpFixtureSource() {
  return `const shell = document.querySelector('script[data-site-ui]');
const {loadLabXp,ready} = await import(shell.src);
await ready;
const {mountLabXp} = await loadLabXp();
(${startSample.toString()})(mountLabXp);`;
}

export function labXpPreviewPlugin(root) {
  return {name:'local-lab-xp-preview',apply:'serve',configureServer(server){
    server.middlewares.use(async (request,response,next)=>{
      const url=new URL(request.url||'/','http://local.invalid');
      if(request.method!=='GET'||![xpPreviewPath,fixturePath].includes(url.pathname))return next();
      try{
        const script=url.pathname===fixturePath;
        response.setHeader('Cache-Control','no-store');
        response.setHeader('Content-Type',script?'text/javascript; charset=utf-8':'text/html; charset=utf-8');
        response.end(script?xpFixtureSource():await server.transformIndexHtml(xpPreviewPath,await xpPreviewDocument(root)));
      }catch(error){next(error);}
    });
  }};
}
