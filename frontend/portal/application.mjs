import { portalEscape, portalInline, portalBlankValue, portalBlankError, portalBlankHelp } from './quiz-format';
import { portalReturn, portalConfig, portalLabEndpoint } from './services/config';
import { portalCreateScriptLoader } from './services/scripts';
import { portalAbortable, portalDeadline } from './services/async';
import { createClassroomTransport, createClassroomBootstrap } from './services/classroom';
import { createPublicConfiguration } from './services/public-config';
import { connectAuthProvider, createAuthSession } from './services/auth';
import { createPageLifecycle } from './services/routes';
import { createDashboardRoute } from '../dashboard/route';

// Transitional composition root. UI belongs to the existing React features;
// account lifetime and route-specific adapters are extracted in subsequent steps.
export function startPortal() {

 const $=(s,p=document)=>p.querySelector(s),$$=(s,p=document)=>Array.from(p.querySelectorAll(s)),E=portalEscape;
 const entry=$('script[data-portal]'),assets=new URL('.',entry.src),base=new URL('../',assets),page=document.body.dataset.page,lid=document.body.dataset.lessonId;
 const catalog=JSON.parse($('#catalog-data').textContent),fa=n=>Number(n).toLocaleString('fa-IR'),url=p=>new URL(p,base).href;
 const app={client:null,user:null,state:null,generation:0,serviceError:null};window.Classroom=app;
 let instructorUI=null,instructorTicket=0;
 let courseController=null,courseTicket=0;
 let homeController=null;
 let readerUI=null,readerTicket=0;
 let quizUI=null,quizResultUI=null,quizTicket=0;
 let accountNotice={text:'در حال بررسی ورود…',error:false};
 let noticeUI=null,noticeTicket=0,reviewUI=null,reviewGeneration=0,presence=null,presenceTicket=0,accountUI=null,authReady=false,authFailed=false,authBusy=false,localSignOut=null,beforeSignOut=null,toastTimer;
 let gateModule=null,routeFrame=null;const gateUIs=new Set();
 async function gates(){
  if(!document?.defaultView)throw Error('DOCUMENT_CLOSED');
  if(!gateModule)gateModule=await import(assetURL('site-shell.js').href).then(module=>module.loadGate());
  return gateModule;
 }
 function disposeGates(host){for(const ui of [...gateUIs]){if(!host||ui.host===host||host.contains(ui.host)){ui.dispose();gateUIs.delete(ui);}}}
 async function paintGate(host,view,isCurrent=()=>true){
  try{
   const {mountGate}=await gates();
   if(!document?.defaultView||!host?.isConnected||!isCurrent())return;
   disposeGates(host);host.replaceChildren();const ui=mountGate(host);ui.host=host;gateUIs.add(ui);ui.render(view);
  }catch(error){if(document?.defaultView)throw error;}
 }
 function accessGate(courseId){
  if(!app.user)return {title:'برای ادامه وارد شو.',body:'متن یادداشت‌ها و آزمون‌ها فقط برای اعضای تأییدشدهٔ کلاس در دسترس است.',actions:[{label:'ورود با Google ←',href:loginURL(),login:true,primary:true}]};
  if(app.serviceError)return {title:'اطلاعات کلاس دریافت نشد.',body:'ورود انجام شده، اما اطلاعات کلاس دریافت نشد. با مدرس در میان بگذار یا کمی بعد دوباره امتحان کن.',actions:[{label:'تلاش دوباره',onClick:async()=>{await refreshState();await mount();}}]};
  const m=app.state?.memberships?.find(row=>row.course_id===courseId);
  const body=m?.status==='pending'?'درخواستت ثبت شده است؛ پس از تأیید مدرس، دسترسی فعال می‌شود.':m?.status==='suspended'?'دسترسی این کلاس فعلاً غیرفعال است. برای پیگیری با مدرس در ارتباط باش.':'برای این کلاس درخواست عضویت بده؛ دسترسی پس از تأیید مدرس فعال می‌شود.';
  const actions=[];
  if(!m)actions.push({label:'درخواست دسترسی به کلاس',primary:true,onClick:async()=>{try{await rpc('classroom_request_access',{p_course:courseId});await refreshState();await mount();}catch(err){throw Error(friendly(err));}}});
  actions.push({label:'داشبورد ←',href:url('dashboard/')},{label:'به‌روزرسانی وضعیت عضویت',onClick:async()=>{await refreshState();await mount();}});
  return {title:'عضویت در کلاس',body,actions};
 }
 async function renderGate(root,courseId){await paintGate(root,accessGate(courseId));}
 let initializing=true;
 function status(el,text,error=false){if(el?.matches('[data-auth-status]')&&$('[data-account-react-root]')){accountNotice={text,error};accountUI?.setNotice(text,error);return;}if(el){el.textContent=text;el.dataset.error=String(error);}}
 function friendly(err){const m=String(err?.message||'');if(/CLASS_ACCESS_REQUIRED/.test(m))return 'دسترسی این کلاس هنوز فعال نیست؛ وضعیت عضویتت را در داشبورد بررسی کن.';if(/TEACHER_REQUIRED/.test(m))return 'این صفحه فقط برای مدرسِ این کلاس در دسترس است.';if(/SIGN_IN_REQUIRED/.test(m))return 'برای ادامه به حساب خودت وارد شو.';if(/QUIZ_VERSION_CHANGED/.test(m))return 'نسخهٔ آزمون تغییر کرده است. پاسخ‌هایت را نگه دار و صفحه را دوباره باز کن.';if(/SUBMISSION_CONFLICT/.test(m))return 'این ارسال قبلاً ثبت شده است؛ نتیجه را از داشبورد باز کن.';if(/INVALID_|UNKNOWN_|TOO_LONG/.test(m))return 'بعضی پاسخ‌ها قالب معتبر ندارند؛ گزینه‌ها و جای خالی‌ها را بررسی کن.';return 'دریافت یا ثبت اطلاعات کامل نشد. اتصال را بررسی کن و دوباره تلاش کن؛ اگر ادامه داشت با مدرس در میان بگذار.';}
 const reads=createClassroomTransport({client:()=>app.client,page,clock:()=>window.performance?.now?.()??Date.now()});
 window.ClassroomPerformance=Object.freeze({snapshot:()=>reads.snapshot(),report:()=>reads.report()});
 const publicConfig=createPublicConfiguration(fetch);
 const rpc=(name,args={})=>reads.call(name,args);
 const bootstrap=createClassroomBootstrap(rpc);
 let bootData=null,stateTicket=0;
 function lesson(id){for(const c of catalog){const l=c.lessons.find(l=>l.id===id);if(l)return {...l,course:c};}return null;}
 const member=c=>app.state?.memberships?.find(m=>m.course_id===c&&m.status==='active');
 function loginURL(next=location.href){const u=new URL('account/',base);u.searchParams.set('next',portalReturn(next,base));return u.href;}
 function storageGet(key){try{return JSON.parse(localStorage.getItem(key)||'null');}catch{return null;}}
 function storageSet(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}}
 function authUI(){
  homeController?.update();
  accountUI?.update({user:app.user,ready:authReady,error:authFailed,busy:authBusy,teacher:!!app.state?.memberships?.some(m=>m.role==='teacher'&&m.status==='active')});
  if(noticeUI){$$('[data-notification-anchor]').forEach(anchor=>noticeUI.attach(anchor));noticeUI.setBusy(!!authBusy);}
  $$('[data-signin]:not([data-react-account-action])').forEach(b=>{b.disabled=!authReady||authFailed||!!authBusy;});
  $$('[data-signout]:not([data-react-account-action])').forEach(b=>{b.disabled=!!authBusy;});
  if(!$('[data-account-react-root]')){
  $$('[data-account-intro-guest]').forEach(el=>{el.hidden=!authReady||authFailed||!!app.user;});
  $$('[data-account-intro-member]').forEach(el=>{el.hidden=!authReady||!app.user;});
  if($('[data-account-guest]'))$('[data-account-guest]').hidden=!authReady||authFailed||!!app.user;
  if($('[data-account-member]'))$('[data-account-member]').hidden=!authReady||!app.user;
  if($('[data-user-name]'))$('[data-user-name]').textContent=app.user?.user_metadata?.full_name||'';
  if($('[data-user-email]'))$('[data-user-email]').textContent=app.user?.email||'';
  }
  $$('[data-teacher-link]').forEach(a=>{a.hidden=!app.state?.memberships?.some(m=>m.role==='teacher'&&m.status==='active');});
 }
 async function refreshState(){const gen=app.generation,ticket=++stateTicket;bootData=null;try{
   const {bundle,state}=await bootstrap.load({p_page:page,p_lesson:lid||null,
    p_mission:page==='lab'?lesson(lid)?.lab?.mission||null:null,
    p_missions:page==='dashboard'?catalog.flatMap(c=>c.lessons.filter(l=>l.lab).map(l=>l.lab.mission)):[]});
   if(gen===app.generation&&ticket===stateTicket){bootData=bundle;app.state=state;app.serviceError=null;authUI();}
  }catch(err){if(gen===app.generation&&ticket===stateTicket){bootData=null;app.state=null;app.serviceError=err;}}}

 function onUser(user,manualExit=false){const old=app.user?.id||null,next=user?.id||null;app.user=user;if(old!==next){app.generation++;pageLifecycle.reset();app.state=null;beforeSignOut=null;}
  authUI();
  if(!initializing&&old!==next){
   const privatePage=['lesson','lab','quiz','dashboard','instructor','course','review','notifications'].includes(page);
   if(old&&page==='course')window.ClassNotesCourseApp?.disposeAll();
   if(old&&privatePage){const main=$('#main');disposeGates(main);if(main){const text=document.createElement('p');text.className='status-line';text.setAttribute('role','status');text.textContent='در حال تغییر حساب…';main.replaceChildren(text);}}
   if(manualExit)return;
   if(old&&next&&(!localSignOut||privatePage)){location.reload();return;}
   if(old&&!next&&privatePage){location.replace(url('index.html'));return;}
   setTimeout(async()=>{if(app.user)await refreshState();await mount();},0);
  }
 }
 const loadScript=portalCreateScriptLoader(document);
 const assetURL=path=>{const u=new URL(path,assets);u.search=new URL(entry.src).search;return u;};
 async function boot(){
  if(!$('script[data-site-ui]')){
  const nav=$('.nav-menu');nav?.addEventListener('click',()=>{const expanded=nav.getAttribute('aria-expanded')!=='true';nav.setAttribute('aria-expanded',String(expanded));$('#portal-nav').classList.toggle('is-open',expanded);});
  $$('#portal-nav a').forEach(a=>a.addEventListener('click',()=>{$('#portal-nav').classList.remove('is-open');nav?.setAttribute('aria-expanded','false');}));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){$('#portal-nav').classList.remove('is-open');nav?.setAttribute('aria-expanded','false');}});
  document.addEventListener('classroom-panel-open',()=>{$('#portal-nav')?.classList.remove('is-open');nav?.setAttribute('aria-expanded','false');});
  }
  $$('[data-login-link]').forEach(a=>{a.href=loginURL();});
  const current=new URL(location.href),hash=new URLSearchParams(current.hash.slice(1));
  const returned=current.searchParams.has('code'),oauthError=current.searchParams.has('error')||hash.has('error');
  const key=`class-notes-oauth-return:${base.pathname}`;let previous=null;
  if(returned||oauthError){try{previous=sessionStorage.getItem(key);}catch{}}
  const next=portalReturn(previous||current.searchParams.get('next'),base);
  function notify(text,error=false){status($('[data-auth-status]'),text,error);const toast=$('#toast');if(toast){toast.textContent=text;toast.classList.add('is-visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('is-visible'),6500);}}
  function loadingError(message){
   if(page==='account'&&!accountUI){
    const fallback=$('[data-account-startup-error]'),account=$('[data-account-react-root]');
    if(fallback&&account){
     const alert=fallback.querySelector('[role="alert"]'),retry=fallback.querySelector('a');
     if(alert)alert.textContent=message;
     if(retry)retry.href=location.href;
     account.hidden=true;fallback.hidden=false;return;
    }
   }
   if(page==='course'){void courseFailure(message);return;}
   const roots=$$('.page-loading'),access=$('[data-course-membership]');if(access?.firstElementChild?.matches('p[role="status"]'))roots.push(access);
   for(const root of roots){root.setAttribute('aria-busy','false');const text=document.createElement('p');text.className='status-line';text.setAttribute('role','status');status(text,message,true);const retry=document.createElement('button');retry.type='button';retry.className='button-outline';retry.textContent='تلاش دوباره';retry.onclick=()=>location.reload();root.replaceChildren(text,retry);}
  }
  async function signIn(target){
    if(!authReady||authBusy||!app.client||app.user)return;
    authBusy='in';authUI();notify('در حال رفتن به Google…');
    try{const destination=target?.matches('[data-login-link]')?new URL(target.getAttribute('href'),base).searchParams.get('next'):page==='account'?next:['home','about'].includes(page)?url('dashboard/'):location.href;
     const safeNext=portalReturn(destination,base);try{sessionStorage.setItem(key,safeNext);}catch{}
     const {error}=await app.client.auth.signInWithOAuth({provider:'google',options:{redirectTo:url('account/'),queryParams:{prompt:'select_account'}}});if(error)throw error;
    }catch{authBusy=false;authUI();notify('ورود شروع نشد؛ اتصال را بررسی کن و دوباره تلاش کن.',true);}
  }
  let saveBeforeSignOut,authSession;
  async function signOut(){
    if(!app.user||authBusy)return;
    if(localSignOut){notify('درخواست خروج قبلی هنوز در جریان است. برای بررسی وضعیت حساب، صفحه را دوباره باز کن.',true);return;}
    const owner=app.user.id,gen=app.generation,save=beforeSignOut,main=$('#main'),wasInert=main?.inert;
    const isCurrent=()=>app.user?.id===owner&&app.generation===gen;
    authBusy='out';authUI();if(main)main.inert=true;
    let committed=false,attempt=null;
    function commitExit(){
     if(committed||!isCurrent())return;
     committed=true;onUser(null,true);notify('از حساب خارج شدی.');
     if(['lesson','lab','quiz','dashboard','instructor','course','review','notifications'].includes(page)){
      try{sessionStorage.setItem('class-notes-signout:'+base.pathname,'1');}catch{}
      location.replace(url('index.html'));
     }
    }
    try{const done=await saveBeforeSignOut({
     save:()=>isCurrent()?(page==='lab'?window.ClassNotesCodingLab?.prepareSignOut()||{saved:true}:save?.()||{saved:true}):{saved:false},
     confirm:result=>accountUI.confirmUnsaved(result),isCurrent,
     signOut:()=>{
      const flight={expired:false,observed:false,commitExit};
      attempt=localSignOut=flight;
      const request=Promise.resolve().then(()=>app.client.auth.signOut({scope:'local'}));
      function finish(succeeded){
       if(localSignOut===flight)localSignOut=null;
       if(!flight.expired||!isCurrent())return;
       if(succeeded||flight.observed)commitExit();
       else notify('خروج از حساب انجام نشد؛ اتصال را بررسی کن و دوباره تلاش کن.',true);
      }
      void request.then(result=>finish(!!result&&!result.error),()=>finish(false));
      return portalDeadline(request,12000,'SIGN_OUT_TIMEOUT',()=>{flight.expired=true;});
     }
    });
     if(done)commitExit();
    }catch(error){
     if(isCurrent()){
      if(attempt?.observed)commitExit();
      else notify(error?.message==='SIGN_OUT_TIMEOUT'?'خروج از حساب طول کشید. برای بررسی وضعیت حساب، صفحه را دوباره باز کن.':
       'خروج از حساب انجام نشد؛ اتصال را بررسی کن و دوباره تلاش کن.',true);
     }
    }finally{
     authBusy=false;if(main?.isConnected)main.inert=!!wasInert;authUI();
     if(committed||isCurrent())accountUI?.focusAccount();
    }
  }
  try{
   if(page==='home'&&$('[data-home-react-root]')){
    const {createHomeController}=await import(assetURL('home-service.mjs').href);
    homeController=createHomeController({host:$('[data-home-react-root]'),
     readContext:()=>({ready:authReady,userId:app.user?.id||null,error:authFailed,busy:authBusy}),
     links:{account:url('account/'),dashboard:url('dashboard/')},onSignIn:()=>signIn(),
     isCurrent:()=>!!$('[data-home-react-root]')});
   }
   // Download public dependencies while React hydrates. Hold failures until the
   // account view is mounted so they reach its error state too.
   const provider=portalDeadline(Promise.all([
    publicConfig(new URL('auth-config.json',assets).href),
    loadScript(assetURL('vendor/supabase/supabase.js').href)
   ]),12000,'AUTH_SETUP_TIMEOUT').then(([config])=>({ok:true,config}),error=>({ok:false,error}));
   const [{saveBeforeSignOut:protectSignOut}]=await Promise.all([
    import(assetURL('sign-out-service.mjs').href),
    import(assetURL('site-shell-adapter.mjs').href).then(({waitForSiteUI,waitForAccountPage})=>Promise.all([waitForSiteUI(document,window),waitForAccountPage(document,window)]))
   ]);
   saveBeforeSignOut=protectSignOut;
   accountUI=window.ClassNotesSiteUI.mountAccountUI({
    urls:{account:url('account/'),dashboard:url('dashboard/'),review:url('review/'),teacher:url('instructor/')},
    onSignIn:signIn,onSignOut:signOut,onHostsChange:()=>{$$('[data-notification-anchor]').forEach(anchor=>noticeUI?.attach(anchor));}
   });
   accountUI.setContinue(next);accountUI.setNotice(accountNotice.text,accountNotice.error);authUI();
   const setup=await provider;
   if(!setup.ok)throw setup.error;
   const {config}=setup;
   if(!portalConfig(config)){status($('[data-auth-status]'),'ورود به کلاس هنوز راه‌اندازی نشده است.');status($('[data-page-status]'),'ورود به کلاس هنوز راه‌اندازی نشده است.');authReady=true;authFailed=true;authUI();loadingError('ورود به کلاس هنوز راه‌اندازی نشده است.');notify('ورود به کلاس هنوز راه‌اندازی نشده است.',true);return;}
   app.config=config;
   app.client=connectAuthProvider(window.supabase,config,base.pathname);
   authSession=createAuthSession(app.client.auth);
   const session=await authSession.resolve();
   authReady=true;onUser(session?.user||null);
   authSession.subscribe((event,session)=>{
    if(authFailed)return;
    if(event==='SIGNED_OUT'&&localSignOut){
     // An SDK event can precede its Promise or arrive after the UI deadline.
     // The request owner is checked again before either path commits.
     localSignOut.observed=true;
     if(localSignOut.expired)localSignOut.commitExit();
     return;
    }
    onUser(session?.user||null);
   });
   status($('[data-auth-status]'),oauthError?'ورود کامل نشد؛ دوباره تلاش کن.':app.user?'به حساب خودت وارد شده‌ای.':'',oauthError);
   if(page==='dashboard'&&app.user){
    const pending=$('[data-dashboard] .page-loading p');
    if(pending)pending.textContent='در حال دریافت پیشرفت کلاس…';
   }
   if(returned||oauthError){
    try{sessionStorage.removeItem(key);}catch{}
    ['code','error','error_code','error_description'].forEach(k=>current.searchParams.delete(k));if(oauthError)current.hash='';history.replaceState(null,'',current.href);
   }
   if(returned&&app.user&&!oauthError){location.replace(next);return;}
   if(app.user){if(page==='lab'&&!window.ClassNotesCodingLab)void loadScript(assetURL('coding-lab.js').href).catch(()=>{});await refreshState();}initializing=false;authUI();
   await mount();
   try{const signedOutKey='class-notes-signout:'+base.pathname;if(sessionStorage.getItem(signedOutKey)){sessionStorage.removeItem(signedOutKey);notify('از حساب خارج شدی.');}}catch{}
  }catch(err){
   authReady=true;authFailed=true;authSession?.dispose();authUI();
   const message=err?.message==='AUTH_SESSION_TIMEOUT'?'بررسی نشست ورود طول کشید. اتصال به سرویس ورود را بررسی کن و دوباره تلاش کن.'
    :['AUTH_SETUP_TIMEOUT','PUBLIC_CONFIG_TIMEOUT','PUBLIC_CONFIG_UNAVAILABLE','SCRIPT_UNAVAILABLE','SCRIPT_TIMEOUT'].includes(err?.message)?'سرویس ورود آماده نشد. اتصال را بررسی کن و دوباره تلاش کن.'
    :err?.message?.startsWith('SITE_UI_')?'رابط صفحه کامل بارگذاری نشد. صفحه را دوباره باز کن.'
    :'بررسی حساب کامل نشد. اتصال را بررسی کن و دوباره تلاش کن.';
   status($('[data-page-status]'),message,true);loadingError(message);notify(message,true);
  }
 }
 async function mount(){await pageLifecycle.mount(page);}
 async function notificationsPage(){
  const root=$('[data-notifications-page]');
  if(!root)return;
  if(!app.user||app.serviceError){noticeTicket++;noticeUI?.dispose();noticeUI=null;await renderGate(root,catalog[0].id);return;}
  if(noticeUI)return;
  disposeGates(root);
  const loading=document.createElement('p');loading.className='notice-empty';loading.setAttribute('role','status');loading.textContent='در حال دریافت اعلان‌ها…';
  root.replaceChildren(loading);
 }
 async function mountNotices(){
  if(!app.user||app.serviceError)return;
  if(noticeUI){$$('[data-notification-anchor]').forEach(anchor=>noticeUI.attach(anchor));const pageRoot=$('[data-notifications-page]');if(pageRoot)disposeGates(pageRoot);noticeUI.attachPage(pageRoot);void noticeUI.refresh();return;}
  const ticket=++noticeTicket,gen=app.generation,owner=app.user.id,alive=()=>gen===app.generation&&ticket===noticeTicket&&app.user?.id===owner;
  try{
   const {mountNotifications}=await import(assetURL('site-shell.js').href).then(module=>module.loadNotifications());if(!alive())return;
   noticeUI=mountNotifications({rpc,userId:owner,baseURL:base.href,isCurrent:alive});
   $$('[data-notification-anchor]').forEach(anchor=>noticeUI.attach(anchor));
   const pageRoot=$('[data-notifications-page]');if(pageRoot)disposeGates(pageRoot);noticeUI.attachPage(pageRoot);void noticeUI.refresh(true);
  }catch{if(alive()&&page==='notifications'){
   const root=$('[data-notifications-page]');
   void paintGate(root,{title:'اعلان‌ها دریافت نشد.',heading:'h1',actions:[{label:'تلاش دوباره',onClick:()=>mountNotices()}]});
  }}
 }
 async function reviewNotebook(){
  const root=$('[data-review-root]');if(!root)return;
  const gen=app.generation,ticket=++reviewGeneration;
  reviewUI?.dispose();reviewUI=null;beforeSignOut=null;
  const active=catalog.filter(c=>member(c.id));
  if(!app.user||app.serviceError||!active.length){await renderGate(root,catalog[0].id);return;}
  const owner=app.user.id,alive=()=>gen===app.generation&&ticket===reviewGeneration&&app.user?.id===owner&&root.isConnected;
  try{
   const {mountReviewNotebook}=await portalDeadline(import(assetURL('site-shell.js').href)
    .then(module=>module.loadReviewNotebook()),12000,'REVIEW_UI_TIMEOUT');
   if(!alive())return;
   let storage;try{storage=localStorage}catch{}
   const ui=mountReviewNotebook(root,{rpc,url,userId:owner,lessons:active.flatMap(c=>c.lessons),storage,isCurrent:alive});
   reviewUI=ui;beforeSignOut=()=>ui.prepareSignOut();
   void ui.load();
  }catch{
   if(!alive())return;
   void paintGate(root,{title:'دفتر مرور دریافت نشد.',heading:'h1',actions:[{label:'تلاش دوباره',onClick:()=>reviewNotebook()}]});
  }
 }
 async function mountClassroomPresence(){
  const ticket=++presenceTicket,gen=app.generation;presence?.dispose();presence=null;
  if(!app.user||app.serviceError)return;
  const owner=app.user.id,courses=catalog.filter(c=>member(c.id)).map(c=>({id:c.id,title:c.display_title||c.title}));
  try{
   const {mountPresence}=await import(assetURL('site-shell.js').href).then(module=>module.loadPresence());
   if(ticket!==presenceTicket||gen!==app.generation)return;
   if(!document.querySelector('link[data-presence-style]')){const css=document.createElement('link');css.rel='stylesheet';css.href=assetURL('classroom-presence.css').href;css.dataset.presenceStyle='';document.head.append(css);}
   presence=mountPresence({client:app.client,rpc,userId:owner,courses,courseId:lesson(lid)?.course.id||lid,anchor:page==='lab'?($('[data-lab-presence-slot]')||$('.lab-site-links')):($('[data-shell-presence-slot]')||$('.portal-nav')),account:($('[data-account-presence-slot]')||$('[data-account-member]')),isCurrent:()=>gen===app.generation&&app.user?.id===owner});
  }catch{/* Presence never blocks lessons, grading or login. */}
 }
 function studyState(course){
  if(!app.user)return {last:null,opened:[]};
  const ids=course.lessons.map(l=>l.id),raw=storageGet(`classroom-study:${app.user.id}:${course.id}`);
  const opened=Array.isArray(raw?.opened)?[...new Set(raw.opened.filter(id=>ids.includes(id)))]:[];
  const legacy=storageGet(`classroom-last:${app.user.id}`);
  const last=ids.includes(raw?.last)?raw.last:ids.includes(legacy)?legacy:null;
  if(last&&!opened.includes(last))opened.push(last);
  return {last,opened};
 }
 function recordStudy(info){
  const state=studyState(info.course);state.last=info.id;if(!state.opened.includes(info.id))state.opened.push(info.id);
  storageSet(`classroom-study:${app.user.id}:${info.course.id}`,state);
  storageSet(`classroom-last:${app.user.id}`,info.id);
 }
 async function loadCodingLab(){
  const info=lesson(lid),root=$('#main'),gen=app.generation;
  window.ClassNotesCodingLab?.dispose();
  disposeGates(root);routeFrame?.dispose();routeFrame=null;
  const {mountRouteFrame}=await gates();
  if(gen!==app.generation)return;
  routeFrame=mountRouteFrame(root,[
   {href:url('index.html'),label:'صفحهٔ اصلی'},{href:url('index.html#classes'),label:'کلاس‌ها'},
   {href:url(info.course.id+'/'),label:info.course.display_title||info.course.title},
   {label:'یادداشت '+info.number+' · '+info.title,current:true},
  ]);
  const host=routeFrame.slot;
  if(!app.user||app.serviceError||!member(info.course.id)){await renderGate(host,info.course.id);return;}
  status(host,'در حال دریافت داده‌های لابراتور…');
  try{
   if(!info.lab)throw Error('این یادداشت لابراتور فعالی ندارد.');
   const mission=info.lab.mission;
   const moduleURL=assetURL('coding-lab.js');
   const [snapshot]=await Promise.all([bootData?.lab?Promise.resolve(bootData.lab):rpc('classroom_lab_state',{p_mission:mission}),window.ClassNotesCodingLab?Promise.resolve():loadScript(moduleURL.href)]);
   if(gen!==app.generation)return;
   const getEndpoint=async()=>{const config=await publicConfig(assetURL('lab-service.json').href);return portalLabEndpoint(config.checkURL,app.config.supabaseUrl)};
   // Public endpoint metadata is independent of Python and authentication.
   void getEndpoint().catch(()=>{});
   if(gen!==app.generation)return;
   const owner=app.user.id;
   async function readServiceBody(response){
    try{
     if(typeof response?.text==='function'){const text=await response.text();return text?JSON.parse(text):null;}
     if(typeof response?.json==='function')return await response.json();
    }catch{return null;}
    return null;
   }
   async function submit(body,signal){
    let endpoint;
    try{endpoint=await portalAbortable(getEndpoint(),signal);}
    catch(error){if(error?.name==='AbortError')throw error;throw Error('بررسی نهایی هنوز فعال نشده است. می‌توانی کدت را محلی آزمایش و ذخیره کنی؛ XP پس از فعال‌شدن بررسی ثبت می‌شود.');}
    const {data,error}=await app.client.auth.getSession();
    if(error||gen!==app.generation||data.session?.user?.id!==owner)throw Error('حساب ورود تغییر کرده است؛ صفحه را بازخوانی کن.');
    const result=await fetch(endpoint.href,{method:'POST',headers:{'Content-Type':'application/json','apikey':app.config.publishableKey,'Authorization':'Bearer '+data.session.access_token},body:JSON.stringify(body),credentials:'omit',signal});
    const value=await readServiceBody(result);
    if(!result.ok){const code=typeof value?.error==='string'?value.error:'';const text={CLASS_ACCESS_REQUIRED:'عضویت کلاس فعال نیست؛ وضعیت دسترسی را بررسی کن.',TASK_LOCKED:'ابتدا تسک قبلی را انجام بده.',LAB_RATE_LIMIT:'چند لحظه صبر کن و دوباره تلاش کن؛ تعداد بررسی‌های اخیر به حد مجاز رسیده است.',LAB_BUDGET_EXHAUSTED:'سهمیهٔ بررسی فعلاً تمام شده است؛ با مدرس در میان بگذار. کدت ذخیره می‌شود و اجرای محلی در دسترس است.',LAB_PAUSED:'بررسی نهایی موقتاً توسط مدرس متوقف شده است؛ کدت را محلی آزمایش و ذخیره کن.',REQUEST_CONFLICT:'این درخواست با کد دیگری ثبت شده است؛ صفحه را بازخوانی کن.',SIGN_IN_REQUIRED:'دوباره وارد حساب خودت شو.'}[code];const error=Error(text||'سرویس بررسی پاسخ نداد؛ کدت حفظ شده است. دوباره تلاش کن.');if(text)error.code=code;throw error;}
    return value;
   }
   async function tutorRequest(body,signal){
    const {data,error}=await app.client.auth.getSession();
    if(error||gen!==app.generation||data.session?.user?.id!==owner){const err=Error('SIGN_IN_REQUIRED');err.code='SIGN_IN_REQUIRED';throw err;}
    const endpoint=new URL('/functions/v1/classroom-tutor/help',app.config.supabaseUrl);
    const response=await fetch(endpoint.href,{method:'POST',headers:{'Content-Type':'application/json','apikey':app.config.publishableKey,'Authorization':'Bearer '+data.session.access_token},body:JSON.stringify(body),credentials:'omit',signal});
    const value=await readServiceBody(response);
    if(gen!==app.generation)throw Error('ACCOUNT_CHANGED');
    if(!response.ok||!value||typeof value!=='object'){const err=Error('TUTOR_REQUEST_FAILED');if(typeof value?.error==='string')err.code=value.error;throw err;}
    return value;
   }
   await window.ClassNotesCodingLab.mount(host,{userId:owner,lessonId:lid,lab:info.lab,assetVersion:new URL(entry.src).search,assets:assets.href,lessonURL:url(lid+'/'),snapshot,
    saveDraft:(state,revision)=>rpc('classroom_lab_save',{p_state:state,p_revision:revision,p_owner:owner,p_mission:mission}),
    refresh:()=>rpc('classroom_lab_state',{p_mission:mission}),getAttempt:request=>rpc('classroom_lab_receipt',{p_request:request,p_mission:mission}),submit,tutorRequest,
    onFrameDispose:frame=>{const account=frame.querySelector('[data-lab-account]');if(account)accountUI?.detach?.(account);},
    isCurrent:()=>gen===app.generation&&!!member(info.course.id)});
   if(gen===app.generation&&$('[data-lab-account]')){accountUI?.attach($('[data-lab-account]'),{compact:true});$$('[data-notification-anchor]').forEach(anchor=>noticeUI?.attach(anchor));}
  }catch(err){if(gen!==app.generation)return;void paintGate(host,{title:'لابراتور دریافت نشد.',body:friendly(err),heading:'h1',actions:[{label:'تلاش دوباره',onClick:()=>loadCodingLab()}]});}
 }
 async function courseFailure(message){
  const host=$('[data-course-react-root]'),gen=app.generation;if(!host)return;
  const {getViewChannel}=await import(assetURL('view-channel.mjs').href);
  const {INITIAL_COURSE_VIEW}=await import(assetURL('course-service.mjs').href);
  if(gen!==app.generation||!host.isConnected)return;
  getViewChannel(host,INITIAL_COURSE_VIEW).publish({...INITIAL_COURSE_VIEW,phase:'error',error:message});
 }
 async function course(){
  const c=catalog.find(c=>c.id===lid),host=$('[data-course-react-root]');if(!c||!host)return;
  if(courseController){courseController.update();return;}
  const gen=app.generation,owner=app.user?.id||null,ticket=++courseTicket;
  const {createCourseController}=await import(assetURL('course-service.mjs').href);
  const alive=()=>gen===app.generation&&ticket===courseTicket&&host.isConnected&&(app.user?.id||null)===owner;
  if(!alive())return;
  courseController=createCourseController({host,course:c,isCurrent:alive,
   readContext:()=>({ready:authReady,userId:app.user?.id||null,error:app.serviceError||authFailed,memberships:app.state?.memberships||[],results:app.state?.results||[],study:app.user?studyState(c):null}),
   links:{login:loginURL(),dashboard:url('dashboard/'),result:(id,attempt)=>url('quiz/'+id+'/?attempt='+encodeURIComponent(attempt))},
   refresh:async()=>{if(authFailed||!app.client){location.reload();return;}await refreshState();if(alive()){void mountNotices();void mountClassroomPresence();}},
   requestAccess:async()=>{if(!alive()||!app.user)throw Error('SIGN_IN_REQUIRED');await rpc('classroom_request_access',{p_course:c.id});}
  });
 }
 async function loadLesson(){
  const info=lesson(lid),host=$('#main');if(!info||!host)return;
  const gen=app.generation,ticket=++readerTicket,owner=app.user?.id;
  const alive=()=>gen===app.generation&&ticket===readerTicket&&app.user?.id===owner&&host.isConnected;
  readerUI?.dispose();readerUI=null;beforeSignOut=null;
  const membership=app.state?.memberships?.find(m=>m.course_id===info.course.id);
  const access=!owner?{kind:'guest',login:loginURL()}:app.serviceError?{kind:'error'}:
   membership?.status==='active'?null:{kind:membership?(['pending','suspended'].includes(membership.status)?membership.status:'restricted'):'unregistered'};
  // Read the authorized payload while the public reader code loads. Rejections
  // remain handled even if navigation or an account change disposes the reader.
  const payload=access?null:(bootData?.lesson?Promise.resolve(bootData.lesson):rpc('classroom_lesson',{p_lesson:lid}))
   .then(value=>({ok:true,value}),()=>({ok:false}));
  try{
   const {mountLessonReader}=await portalDeadline(import(assetURL('site-shell.js').href)
    .then(module=>module.loadLessonReader()),12000,'READER_UI_TIMEOUT');
   if(!alive())return;
   const load=path=>portalDeadline(loadScript(path),12000,'LESSON_SCRIPT_TIMEOUT');
   let refreshing=false;
   readerUI=mountLessonReader(host,{info,href:url,current:alive,retry:()=>{if(alive())void loadLesson()},
    refreshAccess:async request=>{
     if(!alive()||!owner||refreshing)return;
     refreshing=true;
     try{
      if(request&&access?.kind==='unregistered')await rpc('classroom_request_access',{p_course:info.course.id});
      if(!alive())return;
      await refreshState();
      if(alive())await loadLesson();
     }finally{refreshing=false;}
    },
    getFile:async(path,signal)=>{
     const result=await portalAbortable(portalDeadline(app.client.storage.from('class-materials').download(path),12000,'LESSON_FILE_TIMEOUT'),signal);
     if(result.error)throw result.error;return result.data;
    },
    loadScript:load,
    enhance:async scope=>{
     if(scope.querySelector('[data-space3d]')){
      await load(assetURL('space3d.js').href);
      if(alive())window.ClassNotesSpace?.refresh(scope);
     }
    },
    onRead:()=>{if(alive())recordStudy(info);},
    onWidgetsReady:()=>{if(alive())document.dispatchEvent(new CustomEvent('class-notes-user',{detail:{userId:owner}}));},
    refreshMotion:scope=>window.ClassNotesMotion?.refresh(scope),clearMotion:()=>window.ClassNotesMotion?.clearLesson(),
   });
   if(access){readerUI.render({phase:'gate',access});return;}
   readerUI.render({phase:'loading'});
   const result=await payload;
   if(alive())readerUI.render(result?.ok?{phase:'ready',payload:result.value}:{phase:'error'});
  }catch{
   if(!alive())return;
   if(readerUI){readerUI.render({phase:'error'});return;}
   void paintGate(host,{title:'صفحهٔ مطالعه بارگذاری نشد.',actions:[{label:'تلاش دوباره',onClick:()=>loadLesson()}]});
  }
 }
 async function paintQuizResult(host,view,alive,receiptURL){
  const current=()=>alive()&&host.isConnected;
  if(!current())return;
  function unavailable(){
   if(!current())return;
   quizResultUI?.dispose();quizResultUI=null;
   const panel=document.createElement('section');panel.className='panel-card';
   const message=document.createElement('p');message.setAttribute('role','status');
   message.textContent=view.focus?'نتیجه ثبت شد، اما نمایش آن کامل نشد.':'نمایش نتیجه کامل نشد.';
   panel.append(message);
   if(receiptURL){const link=document.createElement('a');link.className='quiet-link';link.href=receiptURL;link.textContent='باز کردن رسید ثبت‌شده ←';panel.append(link);}
   host.replaceChildren(panel);
  }
  try{
   const {mountQuizResult}=await portalDeadline(import(assetURL('site-shell.js').href)
    .then(module=>module.loadQuizResult()),12000,'QUIZ_RESULT_UI_TIMEOUT');
   if(!current())return;
   quizResultUI=mountQuizResult(host,view,()=>queueMicrotask(unavailable));
  }catch{unavailable();}
 }
 async function loadQuiz(){
  const root=$('[data-quiz-root]'),info=lesson(lid),gen=app.generation,ticket=++quizTicket;
  quizUI?.dispose();quizUI=null;quizResultUI?.dispose();quizResultUI=null;beforeSignOut=null;
  if(!root||!info)return;
  const notice=$(':scope > [data-page-status]',root.parentElement)||$('[data-page-status]');
  const alive=()=>gen===app.generation&&ticket===quizTicket&&root.isConnected;
  const links={lesson:url(info.id+'/'),review:url('review/?lesson='+encodeURIComponent(info.id)),quiz:url('quiz/'+info.id+'/'),
   course:url(info.course.id+'/'),results:url('dashboard/#results')};
  status(notice,'');if(!app.user||app.serviceError||!member(info.course.id)){await renderGate(root,info.course.id);return;}
  try{
   const prior=new URL(location.href).searchParams.get('attempt');
   if(prior){
    const record=await rpc('classroom_attempt',{p_id:prior});if(!alive())return;
    if(record.lesson_id!==lid)throw Error('WRONG_LESSON');
    await paintQuizResult(root,{record,prompts:record.prompts||[],summary:record.summary,links},alive);
    return;
   }
   if(!$('link[data-quiz-form-style]')){
    const style=document.createElement('link');style.rel='stylesheet';style.href=assetURL('quiz-form.css').href;style.dataset.quizFormStyle='';document.head.append(style);
   }
   const [quiz,{mountQuizForm}]=await Promise.all([
    rpc('classroom_quiz',{p_lesson:lid}),
    portalDeadline(import(assetURL('site-shell.js').href).then(module=>module.loadQuizForm()),12000,'QUIZ_FORM_UI_TIMEOUT'),
   ]);
   if(!alive())return;
   const summary=()=>app.state?.results?.find(row=>row.lesson_id===lid&&Number(row.version)===Number(quiz.version));
   const params={p_lesson:lid,p_version:quiz.version},draft={...params,p_kind:'quiz'};
   quizUI=mountQuizForm(root,{quiz,lesson:lid,userId:app.user.id,previousSummary:summary(),links:{...links,dashboard:url('dashboard/')},
    storage:{read:storageGet,write:storageSet},isCurrent:alive,requestId:()=>crypto.randomUUID(),errorText:friendly,
    normalizeBlank:portalBlankValue,blankError:portalBlankError,blankHelp:portalBlankHelp,
    loadDraft:()=>rpc('classroom_draft',draft),saveDraft:answers=>rpc('classroom_draft',{...draft,p_answers:answers}),
    practice:(question,answer,hint)=>rpc('classroom_practice',{...params,p_question:question,p_answer:answer,p_hint:hint}),
    submit:pending=>rpc('classroom_submit',{...params,p_answers:pending.answers,p_submission:pending.id}),
    onCommitted:()=>document.dispatchEvent(new CustomEvent('classroom-progress-changed')),
    refreshSummary:async()=>{await refreshState();return alive()?summary():undefined;},
   });
   beforeSignOut=quizUI.prepareSignOut;
   await quizUI.load();
  }catch(err){if(alive()){
   quizUI?.dispose();quizUI=null;beforeSignOut=null;
   void paintGate(root,{title:'آزمون دریافت نشد.',body:friendly(err),actions:[{label:'تلاش دوباره',onClick:()=>loadQuiz()}]});
  }}
 }

 async function teacher(){
  const root=$('[data-teacher]'),notice=$('[data-page-status]'),gen=app.generation,ticket=++instructorTicket;
  instructorUI?.dispose();instructorUI=null;status(notice,'');
  if(!root)return;
  if(!app.user||app.serviceError){await renderGate(root,catalog[0].id);return;}
  const courses=(app.state?.memberships||[]).filter(m=>m.role==='teacher'&&m.status==='active');
  if(!courses.length){await paintGate(root,{title:'دسترسی مدرس لازم است.',body:'این حساب برای مدیریت کلاس فعال نشده است.',heading:'h1',actions:[{label:'داشبورد ←',href:url('dashboard/')}]});return;}
  const owner=app.user.id,alive=()=>gen===app.generation&&ticket===instructorTicket&&app.user?.id===owner;
  try{
   const {mountInstructor}=await portalDeadline(import(assetURL('site-shell.js').href).then(module=>module.loadInstructor()),12000,'INSTRUCTOR_UI_TIMEOUT');if(!alive())return;
   const ui=mountInstructor(root,{rpc,courses,catalog,url,isCurrent:alive});
   if(!alive()){ui.dispose();return;}instructorUI=ui;
  }catch{if(alive()){void paintGate(root,{title:'پنل مدرس دریافت نشد.',heading:'h1',actions:[{label:'تلاش دوباره',onClick:()=>teacher()}]});}}
 }
 const dashboardRoute=createDashboardRoute({
  host:()=>$('[data-dashboard]'),catalog,rpc,
  context:()=>({generation:app.generation,user:app.user,state:app.state,serviceError:app.serviceError,labSnapshots:bootData?.labs}),
  loadFeature:()=>portalDeadline(import(assetURL('dashboard-page.js').href),12000,'DASHBOARD_UI_TIMEOUT'),
  refreshAccess:refreshState,afterAccessRefresh:()=>{void mountNotices();void mountClassroomPresence();},
  studyFor:studyState,login:loginURL,link:url,storage:{read:storageGet,write:storageSet},
  releaseFallback:disposeGates,
  unavailable:(host,isCurrent)=>paintGate(host,{title:'داشبورد دریافت نشد.',body:'صفحه را دوباره بارگذاری کن تا دریافت داشبورد تکرار شود.',heading:'h1',
   actions:[{label:'بازخوانی داشبورد',onClick:()=>{if(isCurrent())location.reload();}}]},isCurrent),
 });
 const pageLifecycle=createPageLifecycle({
  routes:{dashboard:dashboardRoute.mount,review:reviewNotebook,course,instructor:teacher,lesson:loadLesson,lab:loadCodingLab,quiz:loadQuiz},
  before:async()=>{if(page==='notifications')await notificationsPage();void mountNotices();},
  after:()=>{void mountClassroomPresence();},
  cleanups:[
   ()=>{courseTicket++;courseController?.dispose();courseController=null;},
   ()=>{readerTicket++;readerUI?.dispose();readerUI=null;},
   ()=>{quizTicket++;quizUI?.dispose();quizUI=null;quizResultUI?.dispose();quizResultUI=null;},
   dashboardRoute.reset,
   ()=>{instructorTicket++;instructorUI?.dispose();instructorUI=null;},
   ()=>{reads.reset();stateTicket++;bootData=null;},
   ()=>{noticeTicket++;noticeUI?.dispose();noticeUI=null;},
   ()=>{presenceTicket++;presence?.dispose();presence=null;},
   ()=>{reviewGeneration++;reviewUI?.dispose();reviewUI=null;},
   ()=>{disposeGates();routeFrame?.dispose();routeFrame=null;},
   ()=>{window.ClassNotesPython?.dispose();window.ClassNotesCodingLab?.dispose();window.ClassNotesMotion?.clearLesson();},
  ],
 });
 window.ClassroomReady=boot();
}
