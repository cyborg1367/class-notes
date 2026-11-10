import { missionPreviewDocument, missionFixtureSource } from './lab-mission-preview.mjs';

const route = '/__preview__/lab-tutor/';
const script = '/__preview__/lab-tutor-fixture.mjs';

export async function tutorPreviewDocument(root) {
  return (await missionPreviewDocument(root))
    .replaceAll('/__preview__/lab-mission/',route)
    .replace('/__preview__/lab-mission-fixture.mjs',script)
    .replace(/(<aside class="gate-card" data-fixture-banner><p>)[\s\S]*?(<\/p>)/,
      '$1پیش‌نمایش محلی دستیار · پاسخ‌ها نمونه‌اند و هیچ پیام، کد یا خروجی به سرور ارسال نمی‌شود.$2');
}

function sampleReply(body, signal) {
  return new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>{
      signal.removeEventListener('abort',stop);
      resolve({
        version:2,task:body.task,source:'model',conversation:'local-demo-conversation',remaining:4,
        reply:'پاسخ نمونه: اول مشخص کن تابع باید چه ورودی‌ای بگیرد و چه خروجی‌ای برگرداند. یک نمونهٔ کوچک از داده انتخاب کن و نتیجه را دستی پیش‌بینی کن.',
      });
    },350);
    function stop(){clearTimeout(timer);reject(new Error('Preview request cancelled'));}
    signal.addEventListener('abort',stop,{once:true});
  });
}

export function tutorFixtureSource() {
  const marker=' previewOnly:true,';
  const source=missionFixtureSource();
  if (!source.includes(marker)) throw Error('Local lab preview contract is missing');
  return source.replaceAll('/__preview__/lab-mission/',route)
    .replace(marker,marker+' tutorRequest:'+sampleReply.toString()+',')
    .replace(/if\(complete&&![^)]*\)document\.querySelector\('\[data-fixture-banner\] p'\)\.textContent=[^\n]*\n/,'');
}

export function labTutorPreviewPlugin(root) {
  return {name:'local-lab-tutor-preview',apply:'serve',configureServer(server) {
    server.middlewares.use(async (request,response,next)=>{
      const url=new URL(request.url||'/','http://local.invalid');
      if(request.method!=='GET'||![route,script].includes(url.pathname))return next();
      try{
        const isScript=url.pathname===script;
        response.setHeader('Cache-Control','no-store');
        response.setHeader('Content-Type',isScript?'text/javascript; charset=utf-8':'text/html; charset=utf-8');
        response.end(isScript?tutorFixtureSource():await server.transformIndexHtml(route,await tutorPreviewDocument(root)));
      }catch(error){next(error);}
    });
  }};
}
