import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {dashboardState, dashboardPreviewDocument, dashboardPreviewSource} from './preview/dashboard.mjs';
const STATES=['guest','member','pending','unregistered','suspended','restricted','error','loading'];
const labels={guest:'مهمان',member:'عضو کلاس',pending:'در انتظار تأیید',unregistered:'بدون عضویت',suspended:'دسترسی غیرفعال',restricted:'نیاز به پیگیری',error:'خطای دریافت',loading:'در حال دریافت'};
const fixturePath='/__preview__/course-fixture.mjs';
const virtualFixture='\0class-notes:course-fixture';
const dashboardFixture='/__preview__/dashboard-fixture.mjs';
const virtualDashboard='\0class-notes:dashboard-fixture';
function matchesFixture(id,prefix){return id===prefix||id.startsWith(prefix+'?');}
function stateOf(id,prefix){return new URLSearchParams(id.slice(prefix.length)).get('state');}

function fixtureState(id,prefix){
  if(!matchesFixture(id,prefix))return null;
  const state=stateOf(id,prefix);
  return STATES.includes(state)?state:'guest';
}

export function previewFixtureSource(state){
  if(!STATES.includes(state))state='guest';
  return `import {createCourseController} from '/assets/course-service.mjs';
import {waitForSiteUI} from '/assets/site-shell-adapter.mjs';
await waitForSiteUI(document,window);
const course=JSON.parse(document.querySelector('#catalog-data').textContent).find(c=>c.id===document.body.dataset.lessonId);
const selected=${JSON.stringify(state)};
const previewHere=location.pathname+location.search;
let context={ready:selected!=='loading',userId:selected==='guest'||selected==='loading'?null:'local-preview-user',error:selected==='error',memberships:[],results:[],study:{opened:[],last:null}};
if(['member','pending','suspended','restricted'].includes(selected))context.memberships=[{course_id:course.id,status:selected==='member'?'active':selected==='restricted'?'rejected':selected}];
if(selected==='member'){
 context.study={opened:course.lessons.slice(0,2).map(l=>l.id),last:course.lessons[1]?.id||course.lessons[0]?.id};
 context.results=course.lessons.slice(0,1).map(l=>({lesson_id:l.id,version:l.quiz_version,last_score:8,maximum:10,last_id:'local-preview-receipt'}));
}
const controller=createCourseController({host:document.querySelector('[data-course-react-root]'),course,readContext:()=>context,
 links:{login:previewHere+'#local-preview-banner',dashboard:'../dashboard/',result:()=>previewHere+'#local-preview-banner'},isCurrent:()=>true,
 refresh:async()=>{context={...context,error:false,ready:true}},
 requestAccess:async()=>{context={...context,memberships:[{course_id:course.id,status:'pending'}]}}
});
window.addEventListener('pagehide',event=>{if(!event.persisted)controller.dispose()});
`;
}

export async function previewDocument(root,state){
  if(!STATES.includes(state))state='guest';
  const catalog=JSON.parse(await readFile(path.join(root,'dist/assets/catalog.json'),'utf8'));
  const course=catalog[0];
  let html=await readFile(path.join(root,'dist',course.id,'index.html'),'utf8');
  html=html.replace(/<script\b(?=[^>]*\bdata-portal)[^>]*>\s*<\/script>/,'');
  // Keep the prerendered React attributes untouched for hydration. A document
  // base gives its relative links the same meaning as on the real course route.
  const courseBase='/'+course.id.split('/').map(encodeURIComponent).join('/')+'/';
  html=html.replace('<head>','<head><base href="'+courseBase+'">');
  html=html.replace(/href="#([^"]*)"/g,'href="/__preview__/course/?state='+state+'#$1"');
  const buttons=STATES.map(name=>`<a href="/__preview__/course/?state=${name}" ${name===state?'aria-current="page"':''}>${labels[name]}</a>`).join('');
  const banner='<aside id="local-preview-banner" class="local-preview-banner"><strong>پیش‌نمایش محلی رابط</strong><p>این حالت‌ها دادهٔ نمونه‌اند؛ به حساب واقعی وصل نیستند و هیچ پیشرفت یا امتیازی ثبت نمی‌کنند.</p><nav aria-label="حالت نمایشی">'+buttons+'</nav></aside>';
  const css='<style>.portal-nav>[data-shell-account-slot]{display:none}.local-preview-banner{background:#efe2c1;border-bottom:1px solid #9a9d87;padding:12px 20px;font:14px/1.9 var(--font-body);color:#24241f}.local-preview-banner p{font-size:13px;margin:4px 0 8px}.local-preview-banner nav{display:flex;gap:8px;flex-wrap:wrap}.local-preview-banner a{display:inline-flex;align-items:center;min-height:44px;padding:4px 10px;border:1px solid #9a9d87;border-radius:3px;text-decoration:none;color:#18564e}.local-preview-banner a[aria-current]{background:#18564e;color:#fffaf0}</style>';
  html=html.replace('</head>',css+'</head>').replace(/(<body\b[^>]*>)/,'$1'+banner);
  return html.replace('</body>','<script type="module" src="/__preview__/course-fixture.mjs?state='+state+'"></script></body>');
}

export function coursePreviewPlugin(root){
  const dist=path.resolve(root,'dist'),assets=path.join(dist,'assets')+path.sep;
  return{name:'local-course-state-preview',apply:'serve',
    resolveId(id){
      if(matchesFixture(id,dashboardFixture))return virtualDashboard+'?state='+dashboardState(stateOf(id,dashboardFixture));
      const state=fixtureState(id,fixturePath);
      if(state!==null)return virtualFixture+'?state='+state;
    },
    load(id){
      if(matchesFixture(id,virtualDashboard))return dashboardPreviewSource(stateOf(id,virtualDashboard));
      const state=fixtureState(id,virtualFixture);
      if(state!==null)return previewFixtureSource(state);
    },
    configureServer(server){server.middlewares.use(async(req,res,next)=>{
    const url=new URL(req.url||'/','http://local.invalid');
    // dist already contains runnable browser assets. In particular portal.js is
    // a CLASSIC script: Vite import-analysis would prepend an ESM helper to it.
    // Serve emitted scripts exactly as Pages does, before Vite transforms them.
    if(['GET','HEAD'].includes(req.method)&&url.pathname.startsWith('/assets/')&&/\.(?:m?js)$/.test(url.pathname)){
      let filename;try{filename=path.resolve(dist,'.'+decodeURIComponent(url.pathname))}catch{res.statusCode=400;res.end();return}
      if(!filename.startsWith(assets)){res.statusCode=403;res.end();return}
      try{
        const bytes=await readFile(filename);
        res.setHeader('Content-Type','text/javascript; charset=utf-8');res.setHeader('Cache-Control','no-store');
        res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Content-Length',String(bytes.length));
        res.end(req.method==='HEAD'?undefined:bytes);
      }catch(error){if(error.code==='ENOENT'||error.code==='EISDIR'){res.statusCode=404;res.end();return}next(error)}
      return;
    }
    const dashboard=url.pathname==='/__preview__/dashboard/';
    if(!dashboard&&url.pathname!=='/__preview__/course/')return next();
    try{
      const state=url.searchParams.get('state');
      res.setHeader('Content-Type','text/html; charset=utf-8');res.setHeader('Cache-Control','no-store');
      res.end(await server.transformIndexHtml(url.pathname,await (dashboard?dashboardPreviewDocument(root,state):previewDocument(root,state))));
    }catch(error){next(error)}
  })}};
}
