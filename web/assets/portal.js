"use strict";
function portalEscape(value){return String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function portalInline(value){return String(value??'').split(/(`[^`]+`)/g).map(s=>s.startsWith('`')&&s.endsWith('`')?'<code dir="ltr" class="portal-inline-code">'+portalEscape(s.slice(1,-1))+'</code>':portalEscape(s)).join('');}
function portalReturn(value,base){
 const fallback=new URL("dashboard/",base).href;
 try{if(!value)return fallback;const u=new URL(value,base),p=decodeURIComponent(u.pathname);
  if(u.origin!==base.origin||u.username||u.password||!p.startsWith(base.pathname)||/(?:^|\/)\.{1,2}(?:\/|$)|\\/.test(p)||p.startsWith(base.pathname+"account/"))return fallback;
  return u.href;
 }catch{return fallback;}
}
function portalConfig(c){try{const u=new URL(c.supabaseUrl);return u.protocol==="https:"&&!u.username&&!u.password&&!u.search&&!u.hash&&u.pathname==="/"&&/^sb_publishable_[\w-]+$/.test(c.publishableKey);}catch{return false;}}
function portalFigure(f){
 const e=portalEscape;const description=f.type==='distance2d'?`محورها هم‌مقیاس‌اند؛ U در (${f.u.join(', ')}) و V در (${f.v.join(', ')}) است.`:`محورها هم‌مقیاس‌اند؛ q در (${f.query.join(', ')}) است. `+f.points.map(p=>`${p.id}: (${p.x.join(', ')}), کلاس ${p.y}`).join('؛ ')+'. دایره کلاس صفر و مربع کلاس یک است.';let s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 360" role="img" aria-label="'+e(description)+'">';
 const min=f.type==='knn2d'?3.8:0,max=f.type==='knn2d'?7.4:7,unit=270/(max-min),xy=p=>[65+(p[0]-min)*unit,305-(p[1]-min)*unit];
 for(let v=Math.ceil(min);v<=max;v++){const[x,y]=xy([v,v]);s+=`<path d="M${x},35V305 M65,${y}H335" stroke="#dce6d4"/><text x="${x}" y="325" text-anchor="middle" font-size="11" fill="#708368">${v}</text><text x="48" y="${y+4}" text-anchor="middle" font-size="11" fill="#708368">${v}</text>`;}
 s+='<path d="M65,35V305H335" fill="none" stroke="#7f9873"/><text x="355" y="310" font-size="12" fill="#506c43">x₁</text><text x="55" y="23" font-size="12" fill="#506c43">x₂</text>';
 if(f.type==='distance2d'){
  const a=xy(f.u),b=xy(f.v);s+=`<path d="M${a}L${b[0]},${a[1]}L${b}" fill="none" stroke="#a8b99a" stroke-dasharray="5 4"/><path d="M${a}L${b}" stroke="#326940" stroke-width="3"/>`;
  [[a,'U',f.u],[b,'V',f.v]].forEach(([p,id,coords])=>{s+=`<circle cx="${p[0]}" cy="${p[1]}" r="6" fill="#326940"/><text x="${p[0]+12}" y="${p[1]+4}" font-size="12" fill="#375332">${id} (${coords.join(', ')})</text>`;});
 }else{
  f.points.forEach(p=>{const[x,y]=xy(p.x);s+=p.y===0?`<circle cx="${x}" cy="${y}" r="6" fill="#2d7560"/>`:`<rect x="${x-6}" y="${y-6}" width="12" height="12" rx="1" fill="#b76844"/>`;const off=p.id==='A'?[-18,-14]:[12,5];s+=`<text x="${x+off[0]}" y="${y+off[1]}" fill="#516d46" font-size="12">${e(p.id)} · ${p.y}</text>`;});
  const[x,y]=xy(f.query);s+=`<path d="M${x},${y-7}L${x+7},${y}L${x},${y+7}L${x-7},${y}Z" fill="#193f30"/><text x="${x-18}" y="${y+21}" fill="#193f30" font-size="13">q</text>`;
 }
 return s+'</svg>';
}
if(typeof module!=="undefined"&&module.exports)module.exports={portalEscape,portalInline,portalReturn,portalConfig,portalFigure};

if(typeof document!=="undefined"){
 const $=(s,p=document)=>p.querySelector(s),$$=(s,p=document)=>Array.from(p.querySelectorAll(s)),E=portalEscape;
 const entry=$('script[data-portal]'),assets=new URL('.',entry.src),base=new URL('../',assets),page=document.body.dataset.page,lid=document.body.dataset.lessonId;
 const catalog=JSON.parse($('#catalog-data').textContent),fa=n=>Number(n).toLocaleString('fa-IR'),url=p=>new URL(p,base).href;
 const num=n=>Number(n).toLocaleString('en-US',{useGrouping:false}),score=(n,m)=>'<bdi dir="ltr">'+num(n)+' / '+num(m)+'</bdi>',blankLabel=i=>String.fromCharCode(65+i);
 const app={client:null,user:null,state:null,generation:0,serviceError:null};window.Classroom=app;
 const objectURLs=new Set();let lastUser=null,initializing=true;
 function status(el,text,error=false){if(el){el.textContent=text;el.dataset.error=String(error);}}
 function friendly(err){const m=String(err?.message||'');if(/CLASS_ACCESS_REQUIRED/.test(m))return 'دسترسی این کلاس هنوز فعال نیست؛ وضعیت عضویتت را در داشبورد بررسی کن.';if(/TEACHER_REQUIRED/.test(m))return 'این صفحه فقط برای مدرسِ این کلاس در دسترس است.';if(/SIGN_IN_REQUIRED/.test(m))return 'برای ادامه به حساب خودت وارد شو.';if(/QUIZ_VERSION_CHANGED/.test(m))return 'نسخهٔ آزمون تغییر کرده است. پاسخ‌هایت را نگه دار و صفحه را دوباره باز کن.';if(/SUBMISSION_CONFLICT/.test(m))return 'این ارسال قبلاً ثبت شده است؛ نتیجه را از داشبورد باز کن.';if(/INVALID_|UNKNOWN_|TOO_LONG/.test(m))return 'بعضی پاسخ‌ها قالب معتبر ندارند؛ گزینه‌ها و جای خالی‌ها را بررسی کن.';return 'دریافت یا ثبت اطلاعات کامل نشد. اتصال را بررسی کن و دوباره تلاش کن؛ اگر ادامه داشت با مدرس در میان بگذار.';}
 async function rpc(name,args={}){const{data,error}=await app.client.rpc(name,args);if(error)throw error;return data;}
 function lesson(id){for(const c of catalog){const l=c.lessons.find(l=>l.id===id);if(l)return {...l,course:c};}return null;}
 const member=c=>app.state?.memberships?.find(m=>m.course_id===c&&m.status==='active');
 function loginURL(next=location.href){const u=new URL('account/',base);u.searchParams.set('next',portalReturn(next,base));return u.href;}
 function date(value){return new Date(value).toLocaleString('fa-IR',{dateStyle:'medium',timeStyle:'short'});}
 function storageGet(key){try{return JSON.parse(localStorage.getItem(key)||'null');}catch{return null;}}
 function storageSet(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}}
 function clearObjects(){for(const u of objectURLs)URL.revokeObjectURL(u);objectURLs.clear();}
 function authUI(){
  $$('[data-account-link]').forEach(a=>{a.textContent=app.user?'داشبورد ←':'ورود به حساب ←';a.href=app.user?url('dashboard/'):url('account/');});
  if($('[data-account-guest]'))$('[data-account-guest]').hidden=!!app.user;
  if($('[data-account-member]'))$('[data-account-member]').hidden=!app.user;
  if($('[data-user-name]'))$('[data-user-name]').textContent=app.user?.user_metadata?.full_name||'';
  if($('[data-user-email]'))$('[data-user-email]').textContent=app.user?.email||'';
  $$('[data-teacher-link]').forEach(a=>{a.hidden=!app.state?.memberships?.some(m=>m.role==='teacher'&&m.status==='active');});
 }
 async function refreshState(){const gen=app.generation;try{const state=await rpc('classroom_state');if(gen===app.generation){app.state=state;app.serviceError=null;authUI();}}catch(err){if(gen===app.generation){app.state=null;app.serviceError=err;}}}
 function onUser(user){const old=app.user?.id||null,next=user?.id||null;app.user=user;if(old!==next){app.generation++;app.state=null;clearObjects();}
  authUI();
  if(!initializing&&old!==next){if(old){if(['lesson','quiz','dashboard','instructor'].includes(page))$('#main').innerHTML='<section class="shell portal-main"><p class="status-line">در حال تغییر حساب…</p></section>';location.reload();}else{setTimeout(async()=>{await refreshState();await mount();},0);}}
 }
 async function loadScript(src){await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=reject;document.head.append(s);});}
 async function boot(){
  const nav=$('.nav-menu');nav?.addEventListener('click',()=>{const expanded=nav.getAttribute('aria-expanded')!=='true';nav.setAttribute('aria-expanded',String(expanded));$('#portal-nav').classList.toggle('is-open',expanded);});
  $$('#portal-nav a').forEach(a=>a.addEventListener('click',()=>{$('#portal-nav').classList.remove('is-open');nav?.setAttribute('aria-expanded','false');}));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){$('#portal-nav').classList.remove('is-open');nav?.setAttribute('aria-expanded','false');}});
  $$('[data-login-link]').forEach(a=>{a.href=loginURL();});
  const current=new URL(location.href),hash=new URLSearchParams(current.hash.slice(1));
  const returned=current.searchParams.has('code'),oauthError=current.searchParams.has('error')||hash.has('error');
  const key=`class-notes-oauth-return:${base.pathname}`;let previous=null;
  if(returned||oauthError){try{previous=sessionStorage.getItem(key);sessionStorage.removeItem(key);}catch{}}
  const next=portalReturn(previous||current.searchParams.get('next'),base);
  if($('[data-continue]'))$('[data-continue]').href=next;
  try{
   const response=await fetch(new URL('auth-config.json',assets),{cache:'no-cache',credentials:'same-origin'});if(!response.ok)throw Error('CONFIG_UNAVAILABLE');
   const config=await response.json();if(!portalConfig(config)){status($('[data-auth-status]'),'ورود به کلاس هنوز راه‌اندازی نشده است.');status($('[data-page-status]'),'ورود به کلاس هنوز راه‌اندازی نشده است.');return;}
   await loadScript(new URL('vendor/supabase/supabase.js',assets).href);
   app.client=window.supabase.createClient(config.supabaseUrl,config.publishableKey,{auth:{flowType:'pkce',detectSessionInUrl:true,persistSession:true,autoRefreshToken:true,storageKey:`class-notes-auth:${base.pathname}`}});
   app.client.auth.onAuthStateChange((_event,session)=>onUser(session?.user||null));
   const{data,error}=await app.client.auth.getSession();if(error)throw error;onUser(data.session?.user||null);
   if(returned||oauthError){['code','error','error_code','error_description'].forEach(k=>current.searchParams.delete(k));if(oauthError)current.hash='';history.replaceState(null,'',current.href);}
   if(returned&&app.user&&!oauthError){location.replace(next);return;}
   $('[data-signin]')?.removeAttribute('disabled');
   $('[data-signin]')?.addEventListener('click',async()=>{const b=$('[data-signin]');b.disabled=true;status($('[data-auth-status]'),'در حال رفتن به Google…');try{try{sessionStorage.setItem(key,next);}catch{}const{error}=await app.client.auth.signInWithOAuth({provider:'google',options:{redirectTo:url('account/'),queryParams:{prompt:'select_account'}}});if(error)throw error;}catch(err){status($('[data-auth-status]'),friendly(err),true);b.disabled=false;}});
   $('[data-signout]')?.addEventListener('click',async()=>{const b=$('[data-signout]');b.disabled=true;const{error}=await app.client.auth.signOut({scope:'local'});if(error){status($('[data-auth-status]'),friendly(error),true);b.disabled=false;}else{onUser(null);status($('[data-auth-status]'),'از حساب خارج شدی.');}});
   if(app.user)await refreshState();initializing=false;authUI();
   status($('[data-auth-status]'),oauthError?'ورود کامل نشد؛ دوباره تلاش کن.':app.user?'به حساب خودت وارد شده‌ای.':'',oauthError);
   await mount();
  }catch(err){status($('[data-auth-status]'),friendly(err),true);status($('[data-page-status]'),friendly(err),true);}
 }
 function renderGate(root,courseId){
  if(!app.user){root.innerHTML=`<div class="gate-card"><h2>برای ادامه وارد شو.</h2><p>متن یادداشت‌ها و آزمون‌ها فقط برای اعضای تأییدشدهٔ کلاس در دسترس است.</p><div class="portal-actions"><a class="button-forest" href="${E(loginURL())}">ورود با Google ←</a></div></div>`;return;}
  if(app.serviceError){root.innerHTML='<div class="gate-card"><h2>اطلاعات کلاس دریافت نشد.</h2><p>ورود انجام شده، اما اطلاعات کلاس دریافت نشد. با مدرس در میان بگذار یا کمی بعد دوباره امتحان کن.</p><button class="button-outline" data-refresh type="button">تلاش دوباره</button></div>';root.querySelector('[data-refresh]').onclick=async()=>{await refreshState();await mount();};return;}
  const m=app.state?.memberships?.find(m=>m.course_id===courseId);
  const text=m?.status==='pending'?'درخواستت ثبت شده است؛ پس از تأیید مدرس، دسترسی فعال می‌شود.':m?.status==='suspended'?'دسترسی این کلاس فعلاً غیرفعال است. برای پیگیری با مدرس در ارتباط باش.':'برای این کلاس درخواست عضویت بده؛ دسترسی پس از تأیید مدرس فعال می‌شود.';
  root.innerHTML=`<div class="gate-card"><h2>عضویت در کلاس</h2><p>${text}</p><div class="portal-actions">${!m?'<button class="button-forest" data-request type="button">درخواست دسترسی به کلاس</button>':''}<a class="button-outline" href="${E(url('dashboard/'))}">داشبورد ←</a><button class="button-outline" data-refresh type="button">به‌روزرسانی وضعیت عضویت</button></div><p class="status-line" data-gate-status role="status" aria-live="polite"></p></div>`;
  root.querySelector('[data-request]')?.addEventListener('click',async e=>{e.currentTarget.disabled=true;try{await rpc('classroom_request_access',{p_course:courseId});await refreshState();await mount();}catch(err){status(root.querySelector('[data-gate-status]'),friendly(err),true);e.currentTarget.disabled=false;}});
  root.querySelector('[data-refresh]').onclick=async()=>{await refreshState();await mount();};
 }
 async function mount(){
  if(page==='dashboard')await dashboard();
  if(page==='instructor')await teacher();
  if(page==='lesson')await loadLesson();
  if(page==='quiz')await loadQuiz();
 }
 function resultSummary(id){return app.state?.results?.filter(r=>r.lesson_id===id).sort((a,b)=>b.version-a.version)[0];}
 async function dashboard(){
  const root=$('[data-dashboard]'),notice=$('[data-page-status]');status(notice,'');
  if(!app.user||app.serviceError){renderGate(root,catalog[0].id);return;}
  const results=app.state?.results||[],active=(app.state?.memberships||[]).filter(m=>m.status==='active');
  root.innerHTML=`<div class="stats-row"><div class="stat-tile"><strong>${fa(active.length)}</strong><span>کلاس فعال</span></div><div class="stat-tile"><strong>${fa(results.length)}</strong><span>نسخه‌های پاسخ‌داده‌شده</span></div><div class="stat-tile"><strong>${fa(results.reduce((s,r)=>s+Number(r.attempts),0))}</strong><span>تلاش ثبت‌شده</span></div></div>`;
  for(const c of catalog){const section=document.createElement('section');root.append(section);
   if(!member(c.id)){section.innerHTML=`<div class="section-heading"><h2>${E(c.title)}</h2></div><div data-course-gate></div>`;renderGate($('[data-course-gate]',section),c.id);continue;}
   let last=storageGet(`classroom-last:${app.user.id}`);if(!c.lessons.some(l=>l.id===last))last=c.lessons[0].id;
   section.innerHTML=`<div class="section-heading"><div><p class="eyebrow">کلاس فعال</p><h2>${E(c.title)}</h2></div><a class="quiet-link" href="${E(url(last+'/'))}">ادامهٔ مطالعه ←</a></div><div class="dashboard-lessons">${c.lessons.map(l=>{const r=resultSummary(l.id);return `<article class="dashboard-lesson"><span class="lesson-order" dir="ltr">${l.number}</span><div><h2>${E(l.title)}</h2><p>${E(l.description)}</p>${r?`<span class="score-tag">اولین ثبت: ${score(r.first_score,r.maximum)} · بهترین: ${score(r.best_score,r.maximum)} · ${num(r.attempts)} تلاش</span>`:'<span class="score-tag">هنوز در این آزمون شرکت نکرده‌ای.</span>'}</div><div class="portal-actions"><a class="button-forest" href="${E(url(l.id+'/'))}">مطالعهٔ یادداشت ←</a><a class="button-outline" href="${E(url('quiz/'+l.id+'/'))}">تمرین و آزمون</a>${r?`<a class="quiet-link" href="${E(url('quiz/'+l.id+'/?attempt='+r.last_id))}">آخرین نتیجه</a>`:''}</div></article>`;}).join('')}</div>`;
  }
 }
 async function privateBlob(path){const{data,error}=await app.client.storage.from('class-materials').download(path);if(error)throw error;const mime=path.endsWith('.js')?'text/javascript':path.endsWith('.svg')?'image/svg+xml':path.endsWith('.pdf')?'application/pdf':data.type;const blob=mime?new Blob([data],{type:mime}):data;const u=URL.createObjectURL(blob);objectURLs.add(u);return u;}
 async function loadLesson(){
  const info=lesson(lid),root=$('#main'),gen=app.generation;
  if(!app.user||app.serviceError||!member(info.course.id)){root.innerHTML='<section class="shell portal-main" id="top"><header class="page-head"><h1>'+E(info.title)+'</h1></header><div data-lesson-gate></div></section>';renderGate($('[data-lesson-gate]'),info.course.id);return;}
  try{
   const payload=await rpc('classroom_lesson',{p_lesson:lid});if(gen!==app.generation)return;
   root.innerHTML=payload.body;document.body.classList.add('classroom-loaded');
   for(const image of $$('[data-private-path]',root)){const path=image.dataset.privatePath;privateBlob(path).then(u=>{if(gen===app.generation&&image.isConnected)image.src=u;}).catch(()=>{image.alt+=' — تصویر دریافت نشد؛ صفحه را دوباره باز کن.';});}
   $$('[data-private-download]',root).forEach(a=>a.addEventListener('click',async e=>{e.preventDefault();const label=a.textContent;a.textContent='در حال دریافت…';try{const u=await privateBlob(a.dataset.privateDownload);if(gen!==app.generation)return;const link=document.createElement('a');link.href=u;link.download=a.dataset.privateDownload.split('/').pop();document.body.append(link);link.click();link.remove();}catch(err){window.alert(friendly(err));}finally{a.textContent=label;}}));
   for(const path of payload.scripts){const u=await privateBlob(path);if(gen!==app.generation)return;await loadScript(u);}
   await loadScript(new URL('space3d.js',assets).href);
   document.dispatchEvent(new CustomEvent('class-notes-user',{detail:{userId:app.user.id}}));
   worksheet();storageSet(`classroom-last:${app.user.id}`,lid);
  }catch(err){if(gen===app.generation){root.innerHTML='<section class="shell portal-main" id="top"><div class="gate-card"><h2>دریافت یادداشت کامل نشد.</h2><p>'+E(friendly(err))+'</p><a class="button-outline" href="'+E(url('dashboard/'))+'">داشبورد ←</a></div></section>';}}
 }
 function worksheet(){
  const root=$('[data-cloud-tools]');if(!root)return;
  $('[data-cloud-save]',root).textContent='ذخیرهٔ پیش‌نویس در حساب';$('[data-cloud-load]',root).textContent='دریافت پیش‌نویس از حساب';const drafts=window.ClassNotesDrafts,notice=$('[data-cloud-status]',root),uid=app.user.id,gen=app.generation;
  $('[data-cloud-login]',root).hidden=true;$('[data-cloud-buttons]',root).hidden=false;
  $('[data-cloud-description]',root).textContent='پیش‌نویس را در حساب خودت ذخیره کن و روی دستگاه دیگر دریافت کن. این دکمه تحویل نهایی تکلیف نیست.';
  const imp=$('[data-draft-import]',root);imp.hidden=!Object.values(drafts.guestSnapshot()).some(Boolean);
  imp.onclick=()=>{if(confirm('پیش‌نویس بدون ورودِ همین مرورگر را خودت نوشته‌ای؟ آن را جایگزین پاسخ‌های فعلی کنیم؟')){drafts.apply(drafts.guestSnapshot());status(notice,'پیش‌نویس در جدول قرار گرفت؛ برای ذخیره در حساب دکمهٔ ذخیره را بزن.');}};
  let busy=false;async function act(fn){if(busy)return;busy=true;$$('button',root).forEach(b=>b.disabled=true);try{await fn();}catch(err){if(gen===app.generation)status(notice,friendly(err),true);}finally{busy=false;$$('button',root).forEach(b=>b.disabled=false);}}
  $('[data-cloud-save]',root).onclick=()=>act(async()=>{if(drafts.owner()!==uid)return;status(notice,'در حال ذخیره…');await rpc('classroom_draft',{p_lesson:lid,p_kind:'worksheet',p_version:1,p_answers:drafts.snapshot()});if(gen===app.generation)status(notice,'پیش‌نویس پاسخ‌ها در حساب ذخیره شد.');});
  $('[data-cloud-load]',root).onclick=()=>act(async()=>{status(notice,'در حال دریافت…');const answers=await rpc('classroom_draft',{p_lesson:lid,p_kind:'worksheet',p_version:1});if(gen!==app.generation)return;if(!answers){status(notice,'هنوز پیش‌نویسی برای این یادداشت در حساب ذخیره نشده است.');return;}if(Object.values(drafts.snapshot()).some(Boolean)&&!confirm('پاسخ‌های فعلی با نسخهٔ ذخیره‌شده در حساب جایگزین شوند؟')){status(notice,'پاسخ‌های فعلی حفظ شدند.');return;}drafts.apply(answers);status(notice,'پیش‌نویس ذخیره‌شده از حساب دریافت شد.');});
 }
 function resultHTML(record,info,prompts=[]){
  const r=record.result,byId=Object.fromEntries(prompts.map(q=>[q.id,q]));
  const items=r.items.map((item,i)=>{
   const q=byId[item.id],value=record.answers?.[item.id],isFill=q?.type==='fill'||Boolean(item.parts?.length);
   // Grading parts preserve the original blank order; jsonb answer-object keys do not.
   // Saved attempt prompts from v2 omit blank metadata, so the result must work without it.
   let response='';
   if(typeof value==='string')response=q?.options?.find(o=>o[0]===value)?.[1]||value;
   else if(value)response=(item.parts||[]).map((p,n)=>`${blankLabel(n)}: ${value[p.id]??'—'}`).join(' · ');
   const correct=isFill?item.parts?.map((p,n)=>`${blankLabel(n)}: ${p.accepted.join(' / ')}`).join(' · '):q?.options?.find(o=>o[0]===item.key)?.[1];
   const answerText=text=>'<bdi dir="'+(isFill?'ltr':'auto')+'">'+(isFill?E(text):portalInline(text))+'</bdi>';
   return `<article class="result-item"><h3>${num(i+1)}. ${E(item.skill)} — ${score(item.score,item.maximum)}</h3>${q?'<p>'+portalInline(q.stem)+'</p>':''}${response?'<p>پاسخ ثبت‌شده: '+answerText(response)+'</p>':'<p>پاسخی ثبت نشده بود.</p>'}<p>${item.correct?'پاسخ درست است.':'این بخش نیاز به مرور دارد.'} ${portalInline(item.explanation)}</p>${item.selected_feedback?'<p>'+portalInline(item.selected_feedback)+'</p>':''}${correct?'<p>پاسخ معتبر: '+answerText(correct)+'</p>':''}<a href="${E(url(info.id+'/#'+item.review))}">مرور بخش مرتبط در یادداشت ←</a></article>`;
  }).join('');
  return `<section class="quiz-result" tabindex="-1"><p class="eyebrow">نتیجهٔ ثبت‌شده · تلاش ${num(record.attempt_no)}</p><h2>${score(r.score,r.maximum)}</h2><p>${record.created_at?E(date(record.created_at)):''} · این نمره میزان پاسخ‌گویی در همین آزمون است و به‌تنهایی اثبات تسلط کامل نیست.</p>${r.practice_checks||r.hints_used?`<p>پیش از این ثبت: ${num(r.practice_checks||0)} بررسی تمرینی و ${num(r.hints_used||0)} دریافت راهنما انجام شده است.</p>`:''}<div class="result-items">${items}</div></section>`;
 }
 async function loadQuiz(){
  const root=$('[data-quiz-root]'),notice=$('[data-page-status]'),info=lesson(lid),gen=app.generation;
  status(notice,'');if(!app.user||app.serviceError||!member(info.course.id)){renderGate(root,info.course.id);return;}
  try{
   const prior=new URL(location.href).searchParams.get('attempt');
   if(prior){const record=await rpc('classroom_attempt',{p_id:prior});if(gen!==app.generation)return;if(record.lesson_id!==lid)throw Error('WRONG_LESSON');root.innerHTML=resultHTML(record,info,record.prompts||[])+`<a class="button-outline" href="${E(url('quiz/'+info.id+'/'))}">بازگشت به تمرین و آزمون ←</a>`;return;}
   const quiz=await rpc('classroom_quiz',{p_lesson:lid});if(gen!==app.generation)return;
   const key=`classroom-quiz:${app.user.id}:${lid}:v${quiz.version}`,uid=app.user.id;
   let answers=storageGet(key)||{},pending=storageGet(key+':pending'),mode='assessment',submitted=false,saveTimer,queue=Promise.resolve(),revision=0;
   if(!answers||typeof answers!=='object'||Array.isArray(answers))answers={};
   if(pending?.version!==quiz.version||!pending?.answers||typeof pending.answers!=='object')pending=null;
   try{const saved=await rpc('classroom_draft',{p_lesson:lid,p_kind:'quiz',p_version:quiz.version});if(gen!==app.generation)return;if(!Object.keys(answers).length&&saved)answers=saved;}catch{status(notice,'پیش‌نویس حساب دریافت نشد؛ پاسخ‌های مرورگر در دسترس‌اند.',true);}
   if(pending)answers=pending.answers;
   root.innerHTML=`<div class="mode-tabs" role="group" aria-label="حالت پاسخ‌گویی"><button type="button" data-mode="practice" aria-pressed="false">تمرین با راهنما</button><button type="button" data-mode="assessment" aria-pressed="true">آزمون</button></div><p class="small-note" data-mode-note>آزمون 6 سؤال و 10 امتیاز دارد؛ زمان پیشنهادی 10 تا 15 دقیقه است و تایمر اجباری ندارد. پس از ثبت نهایی، نتیجه و توضیح پاسخ‌ها نمایش داده می‌شود.</p><div data-result></div><div class="quiz-layout"><aside class="quiz-rail"><h2>مسیر پاسخ‌گویی</h2><nav class="question-map" aria-label="شمارهٔ سؤال‌ها">${quiz.questions.map((q,i)=>`<a href="#question-${E(q.id)}" data-map="${E(q.id)}">${num(i+1)}</a>`).join('')}</nav><p data-answer-count></p><span class="progress-track" aria-hidden="true"><i data-answer-progress></i></span><p class="save-note" data-save-note role="status" aria-live="polite"></p></aside><div><form data-quiz-form>${quiz.questions.map((q,i)=>{
    const inputs=q.type==='choice'?`<fieldset class="quiz-choice"><legend class="sr-only">گزینه‌های سؤال ${num(i+1)}</legend><div class="quiz-options">${q.options.map(([id,text])=>`<label class="quiz-option"><input type="radio" name="${E(q.id)}" value="${E(id)}" data-question="${E(q.id)}"><bdi dir="auto">${portalInline(text)}</bdi></label>`).join('')}</div></fieldset>`:`<div class="blank-fields">${q.blanks.map((b,n)=>`<label for="${E(q.id+'-'+b.id)}"><bdi dir="ltr">${blankLabel(n)}</bdi> — ${E(b.label)}<input id="${E(q.id+'-'+b.id)}" data-question="${E(q.id)}" data-blank="${E(b.id)}" type="text" dir="ltr" maxlength="200" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="جای خالی ${blankLabel(n)}: ${E(b.label)}"></label>`).join('')}</div>`;
    const code=q.code?'<pre class="quiz-code" tabindex="0">'+E(q.code).replace(/\{\{(\w+)\}\}/g,(_m,id)=>'<mark>['+blankLabel(q.blanks.findIndex(b=>b.id===id))+']</mark>')+'</pre>':'';
    return `<section class="question-card" id="question-${E(q.id)}" data-question-card="${E(q.id)}"><div class="question-meta"><span>سؤال ${num(i+1)} / ${E(q.skill)}</span><span>${num(q.points)} امتیاز</span></div><h2>${portalInline(q.stem)}</h2>${q.figure?'<figure class="quiz-figure">'+portalFigure(q.figure)+'<figcaption class="small-note">محورها هم‌مقیاس‌اند؛ شکل، دادهٔ مستقلِ همین سؤال است.</figcaption></figure>':''}${code}${inputs}<div class="question-tools" data-practice-tools hidden><button type="button" data-check="${E(q.id)}">بررسی پاسخ</button><button type="button" data-hint="${E(q.id)}">دریافت راهنما</button></div><div class="question-feedback" data-feedback="${E(q.id)}" role="status" aria-live="polite" hidden></div></section>`;
   }).join('')}<section class="quiz-submit"><p data-submit-note>پاسخ‌هایت را مرور کن. ثبت نهایی یک تلاش تازه می‌سازد و نتیجهٔ آن قابل ویرایش نیست؛ می‌توانی بعداً تلاش تازه‌ای انجام بدهی.</p><button class="button-forest" type="submit" data-submit>ثبت نهایی و دیدن نتیجه ←</button><p class="status-line" data-submit-status role="status" aria-live="polite"></p></section></form></div></div>`;
   const form=$('[data-quiz-form]',root),saveNote=$('[data-save-note]',root),submitStatus=$('[data-submit-status]',root),submitButton=$('[data-submit]',root);
   function fillFields(){for(const input of $$('[data-question]',form)){const value=answers[input.dataset.question];if(input.type==='radio')input.checked=value===input.value;else input.value=typeof value?.[input.dataset.blank]==='string'?value[input.dataset.blank]:'';}}
   function answered(q){return q.type==='choice'?q.options.some(o=>o[0]===answers[q.id]):q.blanks.every(b=>String(answers[q.id]?.[b.id]||'').trim());}
   function update(){const count=quiz.questions.filter(answered).length;$('[data-answer-count]',root).textContent=`${num(count)} از ${num(quiz.questions.length)} سؤال کامل شده`;$('[data-answer-progress]',root).style.width=(count/quiz.questions.length*100)+'%';quiz.questions.forEach(q=>$(`[data-map="${q.id}"]`,root).classList.toggle('is-answered',!!answered(q)));}
   function save(){const rev=++revision;storageSet(key,answers);status(saveNote,'پیش‌نویس در این مرورگر ذخیره شد.');clearTimeout(saveTimer);saveTimer=setTimeout(()=>{const snapshot=JSON.parse(JSON.stringify(answers));queue=queue.catch(()=>{}).then(async()=>{if(app.user?.id!==uid||gen!==app.generation||submitted)return;await rpc('classroom_draft',{p_lesson:lid,p_kind:'quiz',p_version:quiz.version,p_answers:snapshot});if(rev===revision&&gen===app.generation)status(saveNote,'پیش‌نویس در حساب ذخیره شد.');}).catch(()=>{if(gen===app.generation)status(saveNote,'ذخیره در حساب کامل نشد؛ پیش‌نویس مرورگر باقی است.',true);});},800);}
   fillFields();update();
   form.addEventListener('input',e=>{const input=e.target;if(!input.dataset.question||pending||submitted)return;const id=input.dataset.question;if(input.type==='radio'){if(input.checked)answers[id]=input.value;}else{if(!answers[id]||typeof answers[id]!=='object')answers[id]={};answers[id][input.dataset.blank]=input.value;}const feedback=$(`[data-feedback="${id}"]`,root);feedback.hidden=true;input.removeAttribute('aria-invalid');update();save();});
   $$('[data-mode]',root).forEach(b=>b.onclick=()=>{if(pending||submitted)return;mode=b.dataset.mode;$$('[data-mode]',root).forEach(x=>x.setAttribute('aria-pressed',String(x===b)));$$('[data-practice-tools]',root).forEach(el=>el.hidden=mode!=='practice');$$('[data-feedback]',root).forEach(el=>el.hidden=true);$('[data-mode-note]',root).textContent=mode==='practice'?'حالت تمرین: بررسی و راهنما نمرهٔ رسمی نمی‌سازند. تعداد استفاده از راهنما و بررسی تمرینی همراه ثبت نهایی گزارش می‌شود.':'حالت آزمون: پس از ثبت کل پاسخ‌ها، نمره و توضیح سؤال‌ها نمایش داده می‌شود. تمرین‌های قبلی از سابقه حذف نمی‌شوند.';$('[data-submit-note]',root).textContent=mode==='practice'?'برای ثبت نتیجه، حالت «آزمون» را انتخاب کن.':'ثبت نهایی یک تلاش تازه می‌سازد و نتیجهٔ آن قابل ویرایش نیست.';submitButton.hidden=mode==='practice';});
   async function practice(id,hint,button){if(mode!=='practice'||pending||submitted)return;const q=quiz.questions.find(q=>q.id===id),box=$(`[data-feedback="${id}"]`,root);if(!hint&&!answered(q)){box.hidden=false;box.textContent='پاسخ این سؤال را کامل کن، سپس بررسی را بزن.';return;}button.disabled=true;try{const r=await rpc('classroom_practice',{p_lesson:lid,p_version:quiz.version,p_question:id,p_answer:answers[id]??null,p_hint:hint});if(gen!==app.generation)return;box.hidden=false;box.classList.toggle('is-correct',!hint&&r.items[0].correct);if(hint)box.innerHTML=portalInline(r.hint);else {const item=r.items[0];if(q.type==='fill')for(const p of item.parts||[]){const input=$(`[data-question="${id}"][data-blank="${p.id}"]`,root);input?.setAttribute('aria-invalid',String(!p.correct));}box.innerHTML=`${r.items[0].correct?'پاسخ درست است.':'بخشی از پاسخ نیاز به بازبینی دارد.'} ${portalInline(r.items[0].explanation)} ${portalInline(item.selected_feedback||'')}${q.type==='fill'?'<br>'+E((item.parts||[]).map((p,i)=>'جای خالی '+blankLabel(q.blanks.findIndex(b=>b.id===p.id))+': '+(p.correct?'درست':'نیازمند بازبینی')).join(' · ')):''}<br><a href="${E(url(lid+'/#'+r.items[0].review))}">مرور بخش مرتبط ←</a>`;}}catch(err){box.hidden=false;box.textContent=friendly(err);}finally{button.disabled=false;}}
   $$('[data-check]',root).forEach(b=>b.onclick=()=>practice(b.dataset.check,false,b));$$('[data-hint]',root).forEach(b=>b.onclick=()=>practice(b.dataset.hint,true,b));
   function freeze(){ $$('input',form).forEach(i=>i.disabled=true);$$('[data-mode], [data-check], [data-hint]',root).forEach(b=>b.disabled=true);}
   if(pending){freeze();status(submitStatus,'ارسال قبلی هنوز تأیید نشده است. همین پاسخ‌ها را دوباره بررسی کن؛ تلاش تکراری ثبت نمی‌شود.');submitButton.textContent='بررسی ثبت قبلی ←';}
   form.addEventListener('submit',async e=>{e.preventDefault();if(mode!=='assessment'||submitted||submitButton.disabled)return;const missing=quiz.questions.filter(q=>!answered(q)).length;if(!pending&&missing&&!confirm(`${num(missing)} سؤال کامل نشده است. پاسخ‌های موجود ثبت شوند؟`))return;
    if(!pending){pending={id:crypto.randomUUID(),version:quiz.version,answers:JSON.parse(JSON.stringify(answers))};storageSet(key+':pending',pending);}freeze();submitButton.disabled=true;clearTimeout(saveTimer);status(submitStatus,'در حال ثبت و بررسی پاسخ‌ها…');
    try{await queue;const record=await rpc('classroom_submit',{p_lesson:lid,p_version:quiz.version,p_answers:pending.answers,p_submission:pending.id});if(gen!==app.generation)return;submitted=true;record.answers=pending.answers;storageSet(key+':pending',null);storageSet(key,{});try{await rpc('classroom_draft',{p_lesson:lid,p_kind:'quiz',p_version:quiz.version,p_answers:{}});}catch{}
     $('[data-result]',root).innerHTML=resultHTML(record,info,quiz.questions)+`<div class="portal-actions"><a class="button-outline" href="${E(url('quiz/'+info.id+'/'))}">شرکت دوباره در آزمون ←</a><a class="quiet-link" href="${E(url('dashboard/'))}">دیدن همهٔ نتیجه‌ها</a></div>`;const result=$('.quiz-result',root);result.focus();result.scrollIntoView({behavior:'smooth',block:'start'});status(submitStatus,'نتیجه در حساب ثبت شد.');submitButton.hidden=true;
    }catch(err){if(gen===app.generation){status(submitStatus,friendly(err)+' پاسخ‌های همین ارسال نگه داشته شده‌اند؛ دکمه را برای بررسی دوباره بزن.',true);submitButton.textContent='بررسی دوبارهٔ همین ارسال ←';submitButton.disabled=false;}}
   });
  }catch(err){if(gen===app.generation)status(notice,friendly(err),true);}
 }
 async function teacher(){
  const root=$('[data-teacher]'),notice=$('[data-page-status]');status(notice,'');
  if(!app.user||app.serviceError){renderGate(root,catalog[0].id);return;}
  const courses=(app.state?.memberships||[]).filter(m=>m.role==='teacher'&&m.status==='active');
  if(!courses.length){root.innerHTML='<div class="gate-card"><h2>دسترسی مدرس لازم است.</h2><p>این حساب برای مدیریت کلاس فعال نشده است.</p><a class="button-outline" href="'+E(url('dashboard/'))+'">داشبورد ←</a></div>';return;}
  root.innerHTML=`<div class="teacher-controls"><label for="teacher-course">کلاس</label><select id="teacher-course">${courses.map(c=>`<option value="${E(c.course_id)}">${E(c.title)}</option>`).join('')}</select><button class="button-outline" type="button" data-report-refresh>به‌روزرسانی گزارش</button></div><div data-report></div><div data-teacher-review></div>`;
  const select=$('#teacher-course',root),out=$('[data-report]',root);
  async function report(){const gen=app.generation,selectedCourse=select.value;status(notice,'در حال دریافت گزارش…');try{const data=await rpc('classroom_report',{p_course:selectedCourse});if(gen!==app.generation||selectedCourse!==select.value)return;status(notice,'');out.innerHTML=`<div class="stats-row"><div class="stat-tile"><strong>${fa(data.members.filter(m=>m.status==='pending').length)}</strong><span>درخواست در انتظار</span></div><div class="stat-tile"><strong>${fa(data.members.filter(m=>m.role==='student'&&m.status==='active').length)}</strong><span>دانشجوی فعال</span></div><div class="stat-tile"><strong>${fa(data.total_attempts)}</strong><span>تلاش ثبت‌شده</span></div></div><section class="panel-card"><h2>عضویت‌های کلاس</h2><div class="portal-table-scroll"><table class="portal-table"><thead><tr><th>دانشجو / ایمیل</th><th>وضعیت</th><th>عملیات</th></tr></thead><tbody>${data.members.map(m=>`<tr><td>${E(m.name)}<br><bdi>${E(m.email)}</bdi></td><td>${m.role==='teacher'?'مدرس':m.status==='active'?'فعال':m.status==='pending'?'در انتظار تأیید':'غیرفعال'}</td><td>${m.role==='student'?`<button type="button" data-member="${E(m.user_id)}" data-status="${m.status==='active'?'suspended':'active'}">${m.status==='active'?'غیرفعال‌کردن':'تأیید دسترسی'}</button>`:'—'}</td></tr>`).join('')}</tbody></table></div></section><section class="panel-card"><h2>تلاش‌های ثبت‌شده</h2><p class="small-note">${fa(data.total_attempts)} تلاش در مجموع؛ حداکثر ۲۰۰ تلاش آخر نمایش داده می‌شود. تلاش اول و تلاش‌های بعدی جدا مشخص‌اند.</p><div class="portal-table-scroll"><table class="portal-table"><thead><tr><th>دانشجو</th><th>یادداشت / نسخه</th><th>تلاش</th><th>نمره</th><th>زمان</th><th>پاسخ‌ها</th></tr></thead><tbody>${data.attempts.map(a=>`<tr><td><bdi>${E(a.email)}</bdi></td><td>${E(lesson(a.lesson_id)?.title||a.lesson_id)} · ${fa(a.version)}</td><td>${num(a.attempt_no)}</td><td>${score(a.score,a.maximum)}</td><td>${E(date(a.created_at))}</td><td><button type="button" data-attempt="${E(a.id)}">بررسی</button></td></tr>`).join('')||'<tr><td colspan="6">هنوز آزمونی ثبت نشده است.</td></tr>'}</tbody></table></div></section><section class="panel-card"><h2>کدام مفهوم‌ها به مرور نیاز دارند؟</h2><p class="small-note">این آمار از اولین ثبت نهاییِ هر دانشجو در هر نسخه است؛ تمرین و تعداد نمونه‌ها را در تفسیر آن در نظر بگیر. نرخ خطا می‌تواند نشانهٔ ابهام خودِ سؤال هم باشد.</p><div class="portal-table-scroll"><table class="portal-table"><thead><tr><th>سؤال / مهارت</th><th>تعداد پاسخ</th><th>پاسخ کاملِ درست</th><th>گزینه‌های انتخاب‌شده</th></tr></thead><tbody>${data.questions.map(q=>`<tr><td><bdi>${E(q.question_id)}</bdi> · ${E(q.skill)} · نسخهٔ ${fa(q.version)}${q.stem?'<br>'+portalInline(q.stem):''}</td><td>${fa(q.responses)}</td><td>${fa(q.correct)} (${fa(Math.round(q.correct/q.responses*100))}٪)</td><td>${q.choices.length?E(Object.entries(q.choices.reduce((r,v)=>(r[v]=(r[v]||0)+1,r),{})).map(([k,v])=>(q.options?.find(o=>o[0]===k)?.[1]||k)+': '+fa(v)).join(' · ')):'—'}</td></tr>`).join('')||'<tr><td colspan="4">هنوز داده‌ای برای تحلیل وجود ندارد.</td></tr>'}</tbody></table></div></section>`;
    $$('[data-member]',out).forEach(b=>b.onclick=async()=>{if(!confirm(b.dataset.status==='active'?'دسترسی این دانشجو به محتوای کلاس فعال شود؟':'دسترسی این دانشجو غیرفعال شود؟'))return;b.disabled=true;try{await rpc('classroom_membership',{p_course:select.value,p_user:b.dataset.member,p_status:b.dataset.status});await report();}catch(err){status(notice,friendly(err),true);b.disabled=false;}});
    $$('[data-attempt]',out).forEach(b=>b.onclick=async()=>{b.disabled=true;try{const a=await rpc('classroom_attempt',{p_id:b.dataset.attempt});if(gen!==app.generation)return;const info=lesson(a.lesson_id);$('[data-teacher-review]',root).innerHTML=resultHTML(a,info,a.prompts||[]);const result=$('.quiz-result',root);result.focus();result.scrollIntoView({behavior:'smooth'});}catch(err){status(notice,friendly(err),true);}finally{b.disabled=false;}});
   }catch(err){status(notice,friendly(err),true);}}
  select.onchange=report;$('[data-report-refresh]',root).onclick=report;await report();
 }
 window.ClassroomReady=boot();
}
