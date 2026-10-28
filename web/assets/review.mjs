const {paperIcon}=await import(new URL('./paper-icons.mjs'+new URL(import.meta.url).search,import.meta.url));
// Private notebook data is supplied by authenticated RPCs; no answer bank ships here.
const E=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Isolate array literals and Python identifiers inside Persian sentences.
const teachingText=value=>String(value??'').split(/(\[\s*(?:\[[\d\s,.]+\]\s*,?\s*)+\]|\[[\d\s,.]+\]|\([\d\s,.]+\)|[A-Za-z][A-Za-z0-9_]*(?:\s*=\s*[\d.]+)?)/g).map((part,i)=>i%2?'<bdi dir="ltr">'+E(part)+'</bdi>':E(part)).join('');
const fa=value=>Number(value).toLocaleString('fa-IR');
const icon=name=>paperIcon(name);
export const normalizeSearch=value=>String(value??'').replace(/ي/g,'ی').replace(/ك/g,'ک').replace(/[\u064b-\u065f\u200c]/g,'').toLocaleLowerCase().trim();
export function reviewEntries(state,{tab='due',search='',lesson=''}={}){
 const concepts=new Map((state.concepts||[]).map(c=>[c.id,c]));
 const query=normalizeSearch(search);
 return (state.entries||[]).filter(e=>(tab!=='due'||e.due)&&(tab!=='bookmarked'||e.bookmarked)&&(!lesson||concepts.get(e.concept_id)?.lesson_id===lesson)&&(!query||normalizeSearch(e.title+' '+e.note+' '+(concepts.get(e.concept_id)?.description||'')).includes(query)));
}
export const reviewSessionEntries=state=>reviewEntries(state).slice(0,3);
export function reviewReference(concept,url){
 if(!concept||!/^machine-learning\/[a-z0-9-]+$/.test(concept.lesson_id))return null;
 return url(concept.lesson_id+'/'+(/^[A-Za-z0-9_-]+$/.test(concept.review_anchor||'')?'#'+concept.review_anchor:''));
}
export function reviewOutcome(result){
 if(!result?.correct)return {status:'needs-review',title:'به نکته برگردیم و دوباره امتحان کنیم.'};
 if(result.hint_used)return {status:'with-hint',title:'پاسخ درست بود؛ با کمک راهنما.'};
 if(result.preparation_used===true)return {status:'after-reading',title:'پس از بازخوانی، درست پاسخ دادی.'};
 if(result.preparation_used===false)return {status:'retrieval',title:'در این مثال، بدون بازخوانی درست پاسخ دادی.'};
 return {status:'unclassified',title:'در این مثال، درست پاسخ دادی.'};
}
export function latestReviewWriting(entries){
 return entries.flatMap(e=>[...(e.note?[e]:[]),...(e.last_reflection?.text?[{...e,note:e.last_reflection.text,updated_at:e.last_reflection.at,isReflection:true}]:[])]).sort((a,b)=>(Date.parse(b.updated_at)||0)-(Date.parse(a.updated_at)||0))[0];
}
const art=paperIcon('review','rv-cards');
export async function mountReview(root,{rpc,url,userId,lessons=[],isCurrent=()=>true,storage,initialURL,win=root.ownerDocument.defaultView}){
 const doc=root.ownerDocument;
 let state={entries:[],concepts:[]},tab='due',search='',lesson='',busy=false,disposed=false,editor=null,run=null,queue=[],practiceEntry=null,context=null,reflection=null,prepared=false,pending=Promise.resolve();
 const ownerKey=`classroom-review-notebook:${userId}:`,alive=()=>!disposed&&isCurrent()&&root.isConnected;
 const $=selector=>root.querySelector(selector);
 function stored(key){try{return JSON.parse(storage?.getItem(ownerKey+key)||'null')}catch{return null}}
 function store(key,value){try{if(value===null)storage?.removeItem(ownerKey+key);else storage?.setItem(ownerKey+key,JSON.stringify(value));return true}catch{return false}}
 function message(text,error=false){if(!alive())return;const el=$('[data-review-status]');el.textContent=text;el.dataset.error=String(error);}
 function errorText(error){const code=String(error?.message||'');return /REVIEW_NOTE_CONFLICT/.test(code)?'نسخهٔ حساب در پنجرهٔ دیگری تغییر کرده است؛ متن تو حفظ شده است.':/REVIEW_CREATE_CONFLICT/.test(code)?'نسخهٔ قبلی این یادداشت ثبت شده است؛ نوشتهٔ فعلی در این مرورگر حفظ شده. مورد ثبت‌شده را از دفتر باز کن.':/REVIEW_ENTRY_EXISTS/.test(code)?'این موضوع از قبل در دفترت هست؛ همان مورد را باز کن.':/REVIEW_NOTE_LIMIT/.test(code)?'دفتر به سقف ۲۰۰ یادداشت آزاد رسیده است.':/CLASS_ACCESS_REQUIRED/.test(code)?'دسترسی این یادداشت فعال نیست؛ وضعیت عضویت را بررسی کن.':/PGRST202|function .*does not exist/.test(code)?'به‌روزرسانی دفتر مرور هنوز روی سرور فعال نشده است. با مدرس در میان بگذار.':'ثبت یا دریافت کامل نشد؛ نوشته‌ات حفظ شده است. دوباره تلاش کن.'}
 function setBusy(value){busy=value;root.setAttribute('aria-busy',String(value));root.querySelectorAll('button').forEach(b=>{b.disabled=value||b.dataset.unavailable==='true'});root.querySelectorAll('dialog input,dialog textarea,dialog select,[data-reflection]').forEach(el=>{el.disabled=value});}
 function act(fn){if(busy||!alive())return pending;setBusy(true);pending=(async()=>{try{await fn()}catch(e){message(errorText(e),true)}finally{if(alive())setBusy(false)}})();return pending}
 function conceptFor(entry){return context?.entry_id===entry?.id?context.concept:state.concepts.find(c=>c.id===entry?.concept_id)}
 function date(value){return value?new Date(value).toLocaleDateString('fa-IR',{month:'short',day:'numeric'}):''}
 function lessonLabel(id){return lessons.find(l=>l.id===id)?.title||'یادداشت مرتبط'}
 function sourceLabel(e){return ({quiz:'از آزمون',lab:'از لابراتور',manual:'انتخاب خودت'})[e.source?.kind]||'انتخاب خودت'}
 async function reload(){const value=await rpc('classroom_review_state');if(!alive())return false;state={entries:Array.isArray(value?.entries)?value.entries:[],concepts:Array.isArray(value?.concepts)?value.concepts:[]};return true}
 function changeURL(entry,step='reason'){try{const u=new URL(win.location.href);if(entry){u.searchParams.set('practice',entry);u.searchParams.set('step',step)}else{u.searchParams.delete('practice');u.searchParams.delete('step')}win.history.replaceState(null,'',u.href)}catch{}}
 root.innerHTML=`<div data-review-view></div><p class="rv-status" data-review-status role="status" aria-live="polite"></p><dialog class="rv-dialog" aria-labelledby="rv-dialog-title"><div data-review-dialog></div></dialog>`;
 const view=$('[data-review-view]'),dialog=$('dialog');
 function closeEditor(){if(editor)persistEditor();editor=null;dialog.close();}
 dialog.addEventListener('cancel',event=>{event.preventDefault();if(!busy)closeEditor()});
 function persistEditor(){if(!editor)return;editor.note=$('[data-note-body]')?.value??editor.note;editor.title=$('[data-note-title]')?.value??editor.title;editor.concept=$('[data-note-concept]')?.value??editor.concept;const unchanged=editor.entry&&editor.note===editor.entry.note&&editor.title===editor.entry.title;store(editor.key,unchanged?null:{note:editor.note,title:editor.title,concept:editor.concept,revision:editor.revision,request:editor.request});}
 function overview(){
  view.classList.remove('rv-mode-practice');
  run=null;practiceEntry=null;context=null;reflection=null;
  const due=state.entries.filter(e=>e.due),session=reviewSessionEntries(state),saved=state.entries.filter(e=>e.bookmarked),latest=latestReviewWriting(state.entries);
  view.innerHTML=`<header class="rv-heading"><div><nav aria-label="مسیر صفحه"><a href="${E(url('dashboard/'))}">داشبورد</a><span aria-hidden="true">/</span><span>دفتر مرور</span></nav><h1>دفتر مرور شخصی</h1><p>هر بار مرور، فرصتی برای فهمیدنِ بهتر.</p></div><button class="rv-outline" data-new>${icon('plus')} یادداشت تازه</button></header>
  <section class="rv-hero" aria-labelledby="rv-today-title"><div class="rv-hero-copy"><p class="rv-eyebrow"><span></span>پیشنهاد امروز</p><h2 id="rv-today-title">کمی مرور، یک قدم جلوتر.</h2><p>${due.length?'به تجربهٔ قبلی برگرد، نکته را مرور کن و دوباره امتحان کن.':state.entries.length?'در حال حاضر موضوعی برای مرور زمان‌بندی‌شده آماده نیست.':'اولین موضوع را انتخاب کن و دفتر خودت را بساز.'}</p>${art}</div><div class="rv-hero-action"><h3>${due.length?fa(session.length)+' موضوع در این مرور':state.entries.length?'مرور آماده‌ای نداری':'از یک موضوع شروع کن'}</h3><p>${icon('clock')}${due.length?'حدود '+fa(session.length*3)+' دقیقه':'با ریتم خودت پیش برو'}</p><button class="rv-primary" data-start>${due.length?'شروع مرور':state.entries.length?'دیدن موضوعات':'افزودن اولین موضوع'} ${icon('arrow')}</button><small>${due.length>session.length?fa(due.length)+' موضوع آماده است؛ در این نوبت فقط '+fa(session.length)+' موضوع را مرور می‌کنیم.':due.length?'هر بار، روی یک موضوع تمرکز می‌کنیم.':'موضوعات و یادداشت‌ها در حساب تو ذخیره می‌شوند.'}</small></div></section>
  <div class="rv-columns"><section class="rv-library" aria-labelledby="rv-topics-title"><div class="rv-library-head"><div><h2 id="rv-topics-title">موضوعات دفتر</h2><span>${fa(state.entries.length)} موضوع</span></div><label class="rv-search">${icon('search')}<input type="search" data-search placeholder="جست‌وجوی موضوع…" aria-label="جست‌وجو در موضوع و یادداشت" value="${E(search)}"></label></div><div class="rv-filters"><div role="group" aria-label="وضعیت مرور"><button data-tab="due" aria-pressed="${tab==='due'}">برای امروز ${fa(due.length)}</button><button data-tab="all" aria-pressed="${tab==='all'}">همه</button><button data-tab="bookmarked" aria-pressed="${tab==='bookmarked'}">نشان‌شده‌ها ${fa(saved.length)}</button></div><label class="rv-lesson-filter"><span class="sr-only">فیلتر یادداشت</span><select data-lesson><option value="">همهٔ یادداشت‌ها</option>${lessons.map(l=>`<option value="${E(l.id)}" ${l.id===lesson?'selected':''}>${E(l.title)}</option>`).join('')}</select></label></div><div data-review-list></div></section>
  <aside class="rv-side"><section class="rv-note-paper"><p class="rv-note-kicker">با زبان خودم ${icon('pencil')}</p><h2>${latest?latest.isReflection?'آخرین برداشت من':'آخرین یادداشت من':'یادداشتی برای خودت'}</h2>${latest?`<h3>${E(latest.title)}</h3><p class="rv-note-preview">${E(latest.note.slice(0,240))}${latest.note.length>240?'…':''}</p>`:'<p class="rv-note-preview">چیزی را که تازه فهمیده‌ای، با زبان خودت بنویس؛ حتی در یک جمله.</p>'}<div class="rv-writing-lines" aria-hidden="true"></div><button class="rv-text-link" data-latest="${E(latest?.id||'')}">${latest?latest.isReflection?'مشاهدهٔ موضوع':'ویرایش یادداشت':'نوشتن اولین یادداشت'} ${icon('arrow')}</button></section><p class="rv-private">${icon('lock')}یادداشت‌ها فقط برای خودت هستند.</p></aside></div>`;
  $('[data-new]').onclick=()=>openEditor();
  $('[data-start]').onclick=()=>{if(due.length){queue=session.map(e=>e.id);void act(()=>start(queue.shift()))}else if(state.entries.length){tab='all';overview()}else openEditor()};
  $('[data-latest]').onclick=()=>{if(latest?.isReflection){queue=[];void act(()=>start(latest.id))}else openEditor(latest)};
  $('[data-search]').oninput=event=>{search=event.target.value;renderList()};
  $('[data-lesson]').onchange=event=>{lesson=event.target.value;renderList()};
  view.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{tab=b.dataset.tab;view.querySelectorAll('[data-tab]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tab===tab)));renderList()});
  renderList();
 }
 function renderList(){
  const entries=reviewEntries(state,{tab,search,lesson});
  $('[data-review-list]').innerHTML=entries.length?entries.map((e,i)=>{const c=conceptFor(e);return `<article class="rv-entry"><button class="rv-entry-open" data-open="${E(e.id)}"><span class="rv-entry-number" dir="ltr">${String(i+1).padStart(2,'0')}</span><span><strong>${E(e.title)}</strong><small>${E(c?lessonLabel(c.lesson_id):'یادداشت شخصی')} · ${sourceLabel(e)}</small><span class="rv-entry-description">${E(c?.description||e.note.slice(0,100)||'یادداشتی با زبان خودت.')}</span>${e.paused?'<small>مرور این موضوع متوقف است؛ نوشته‌ها حفظ شده‌اند.</small>':''}${c&&!e.due&&!e.paused?`<small>مرور بعدی: ${E(date(e.next_due))}</small>`:''}</span><span class="rv-open-arrow">${icon('arrow')}</span></button><button class="rv-note-shortcut" data-edit-note="${E(e.id)}" aria-label="یادداشت شخصی دربارهٔ ${E(e.title)}">${icon('pencil')}</button><button class="rv-bookmark" data-bookmark="${E(e.id)}" aria-label="نشان‌گذاری ${E(e.title)}" aria-pressed="${e.bookmarked}">${icon('bookmark')}</button></article>`}).join(''):`<div class="rv-empty"><h3>${search||lesson?'موضوعی با این فیلتر پیدا نشد.':tab==='due'?'مرور آماده‌ای باقی نمانده است.':tab==='bookmarked'?'هنوز موضوعی نشان نکرده‌ای.':'دفترت هنوز خالی است.'}</h3><p>${tab==='due'?'می‌توانی از «همه» موضوعات قبلی را ببینی یا موضوع تازه‌ای اضافه کنی.':'یک موضوع انتخاب کن یا یادداشت شخصی خودت را بنویس.'}</p><button class="rv-text-link" data-empty-add>افزودن موضوع ${icon('plus')}</button></div>`;
  view.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>{const e=state.entries.find(e=>e.id===b.dataset.open);if(e.concept_id){queue=[];void act(()=>start(e.id))}else openEditor(e)});
  view.querySelectorAll('[data-edit-note]').forEach(b=>b.onclick=()=>openEditor(state.entries.find(e=>e.id===b.dataset.editNote)));
  view.querySelectorAll('[data-bookmark]').forEach(b=>b.onclick=()=>void act(async()=>{const e=state.entries.find(e=>e.id===b.dataset.bookmark);await rpc('classroom_review_save',{p_entry:e.id,p_revision:e.revision,p_note:e.note,p_bookmarked:!e.bookmarked,p_title:e.title});if(await reload())overview()}));
  $('[data-empty-add]')?.addEventListener('click',()=>openEditor());
 }
 function openEditor(entry){
  if(busy||!alive())return;
  const key='note:'+(entry?.id||'new'),draft=stored(key);
  editor={entry,key,request:draft?.request||globalThis.crypto.randomUUID(),title:draft?.title??entry?.title??'',note:draft?.note??entry?.note??'',concept:draft?.concept??entry?.concept_id??'',revision:draft?.revision??entry?.revision??0};
  const c=entry&&conceptFor(entry),reference=reviewReference(c,url);
  $('[data-review-dialog]').innerHTML=`<header class="rv-dialog-head"><h2 id="rv-dialog-title">${entry?'موضوع و یادداشت من':'یادداشت تازه'}</h2><button class="rv-icon" data-close aria-label="بستن">${icon('close')}</button></header><form data-note-form>${!entry?`<label>موضوع مرتبط<select data-note-concept><option value="">یادداشت آزاد</option>${state.concepts.map(c=>`<option value="${E(c.id)}" ${editor.concept===c.id?'selected':''}>${E(c.title)}</option>`).join('')}</select></label>`:''}<label>عنوان<input data-note-title maxlength="160" value="${E(editor.title)}" ${entry?.concept_id?'readonly':''} required></label>${entry?.source?`<p class="rv-context">${E(entry.source.description)}</p>`:''}${draft?'<p class="rv-draft-notice">پیش‌نویس ذخیره‌نشدهٔ همین مرورگر بازیابی شد.</p>':''}<label>با زبان خودم<textarea data-note-body maxlength="4000" rows="5" placeholder="چه چیزی را بهتر فهمیدم؟ دفعهٔ بعد به چه نکته‌ای دقت کنم؟">${E(editor.note)}</textarea></label><p class="rv-dialog-status" data-note-status role="status"></p><div data-note-conflict></div><div class="rv-dialog-actions"><button class="rv-primary" type="submit">ذخیرهٔ یادداشت</button>${entry?.concept_id?'<button class="rv-outline" type="button" data-practice>مرور این موضوع</button>':''}${reference?`<a class="rv-text-link" href="${E(reference)}">${c.review_anchor?'مرور بخش مرتبط':'بازکردن یادداشت مرتبط'} ${icon('arrow')}</a>`:''}</div></form>${entry?.history?.length?`<details class="rv-history"><summary>سابقهٔ مرور · ${fa(entry.history.length)} مرور اخیر</summary><ul>${entry.history.map(h=>`<li><time>${E(date(h.at))}</time><span>${h.correct?h.hint_used?'پاسخ درست با راهنما':h.preparation_used?'پاسخ درست پس از بازخوانی':h.preparation_used===false?'پاسخ درست بدون بازخوانی':'پاسخ درست':'نیازمند مرور دوباره'}</span>${h.reflection?'<p class="rv-history-reflection">'+E(h.reflection)+'</p>':''}</li>`).join('')}</ul></details>`:''}`;
  $('[data-close]').onclick=closeEditor;
  $('[data-note-form]').onsubmit=event=>{event.preventDefault();void act(saveEditor)};
  for(const input of dialog.querySelectorAll('input,textarea,select'))input.addEventListener('input',()=>{persistEditor();if(!editor.entry){$('[data-note-title]').readOnly=!!editor.concept;if(editor.concept){const c=state.concepts.find(c=>c.id===editor.concept);$('[data-note-title]').value=c.title;editor.title=c.title;persistEditor()}}});
  $('[data-note-concept]')?.addEventListener('change',()=>{const existing=state.entries.find(e=>e.concept_id===$('[data-note-concept]').value);if(existing){$('[data-note-status]').innerHTML='این موضوع از قبل در دفترت هست. <button type="button" class="rv-text-link" data-existing>بازکردن موضوع موجود ←</button>';$('[data-existing]').onclick=()=>{closeEditor();openEditor(existing)}}else $('[data-note-status]').textContent=''});
  $('[data-practice]')?.addEventListener('click',()=>void act(async()=>{if(await saveEditor(false)){const id=editor?.entry?.id||entry.id;closeEditor();queue=[];await start(id)}}));
  dialog.showModal();
 }
 async function saveEditor(close=true){
  if(!editor)return true;persistEditor();const draft=editor;
  if(draft.entry&&draft.note===draft.entry.note&&draft.title===draft.entry.title){if(close){editor=null;dialog.close();overview()}return true}
  if(!draft.title.trim()&&!draft.concept){$('[data-note-status]').textContent='برای یادداشتت یک عنوان بنویس.';return false}
  try{
   if(draft.entry){draft.revision=await rpc('classroom_review_save',{p_entry:draft.entry.id,p_revision:draft.revision,p_note:draft.note,p_bookmarked:draft.entry.bookmarked,p_title:draft.title});}
   else {const id=await rpc('classroom_review_add',{p_owner:userId,p_request:draft.request,p_concept:draft.concept||null,p_title:draft.title,p_note:draft.note});draft.entry={id};}
   if(!alive())return false;store(draft.key,null);if(!await reload())return false;
   draft.entry=state.entries.find(e=>e.id===draft.entry.id);draft.revision=draft.entry?.revision;draft.key='note:'+draft.entry.id;
   if(close){editor=null;dialog.close();overview();message('یادداشت در حساب تو ذخیره شد.')}return true;
  }catch(error){
   if(!alive())return false;
   $('[data-note-status]').textContent=errorText(error);
   if(/REVIEW_NOTE_CONFLICT/.test(String(error?.message))){
    $('[data-note-conflict]').innerHTML='<button class="rv-outline" type="button" data-compare>دریافت نسخهٔ حساب برای مقایسه</button><div data-account-note></div>';
    $('[data-compare]').onclick=()=>void act(async()=>{if(!await reload())return;const remote=state.entries.find(e=>e.id===draft.entry.id);if(!remote)return;draft.revision=remote.revision;draft.entry=remote;$('[data-account-note]').innerHTML='<details open><summary>متن ذخیره‌شدهٔ حساب</summary><p class="rv-preserve">'+E(remote.note||'خالی')+'</p></details>';$('[data-note-status]').textContent='متن تو حفظ شد. دو نسخه را مقایسه کن؛ ذخیرهٔ بعدی متن فعلی تو را در حساب قرار می‌دهد.';persistEditor()});
   }
   return false;
  }
 }
 function steps(current){return '<ol class="rv-learning-steps" aria-label="مراحل مرور">'+['چرایی مرور','بازخوانی','آزمودن','برداشت من'].map((label,i)=>`<li ${i===current?'aria-current="step"':''}><bdi>${i+1}</bdi>${label}</li>`).join('')+'</ol>'}
 function evidenceHTML(item){
  const when=item.at?new Date(item.at).toLocaleString('fa-IR',{dateStyle:'medium',timeStyle:'short'}):'';
  if(item.kind==='quiz'){
   const path=/^machine-learning\/[a-z0-9-]+$/.test(item.lesson_id||'')&&/^[0-9a-f-]{36}$/.test(item.attempt_id||'')?url('quiz/'+item.lesson_id+'/?attempt='+item.attempt_id):null;
   return `<article class="rv-evidence"><p class="rv-evidence-meta">از آزمون · ${E(when)}</p>${item.prompt?'<p class="rv-evidence-prompt">'+teachingText(item.prompt)+'</p>':'<p>پاسخ یک سؤال ثبت‌شده، به این موضوع مرتبط بوده است.</p>'}${item.code?'<pre class="rv-source-code" dir="ltr">'+E(item.code)+'</pre>':''}${item.answer?'<p>پاسخ ثبت‌شدهٔ تو: <strong>'+teachingText(item.answer)+'</strong></p>':''}<p class="rv-evidence-outcome">این پاسخ در آن تلاش، کامل درست نبود؛ با یک مثال دیگر به مفهوم برمی‌گردیم.</p>${path?'<a class="rv-text-link" target="_blank" rel="noopener" href="'+E(path)+'">دیدن نتیجهٔ همان تلاش ←</a>':''}</article>`;
  }
  if(item.kind==='lab'){
   const l=item.mission?lessons.find(l=>l.lab?.mission===item.mission):null,task=l?.lab_steps?.find(t=>t.id===item.task)?.title;
   const reasons={CONFUSION_LAYOUT:'گزارش ماتریس خطا در این بررسی، با نتیجهٔ مورد انتظار هم‌خوان نبود.',SPLIT_ALIGNMENT:'تقسیم داده در این بررسی، با قرارداد آموزش و آزمون هم‌خوان نبود.',ACCURACY_VALUES:'شمارش پاسخ‌های درست یا نسبت گزارش‌شده در این بررسی هم‌خوان نبود.',NEIGHBOR_ORDER:'ترتیب همسایه‌های خروجی در این بررسی به بازبینی نیاز داشت.',INVALID_INDICES:'اندیس‌های برگردانده‌شده در این بررسی معتبر نبودند.',LABEL_ALIGNMENT:'برچسب‌های خروجی با سطرهای همسایه‌ها هم‌ردیف نبودند.',VOTE_COUNTS:'تعداد رأی‌های گزارش‌شده در این بررسی هم‌خوان نبود.',MAJORITY:'کلاس برنده در این بررسی با رأی اکثریت هم‌خوان نبود.',MAJORITY_TIE:'قاعدهٔ رفع تساوی در این بررسی به بازبینی نیاز داشت.',VOTE_SHARE:'سهم رأی گزارش‌شده در این بررسی هم‌خوان نبود.'};
   return `<article class="rv-evidence"><p class="rv-evidence-meta">از لابراتور · ${E(when)}</p>${task?'<h2>'+E(task)+'</h2>':''}<p>${E(reasons[item.feedback_code]||'خروجی این تلاش با نتیجهٔ بررسی هم‌خوان نبود؛ این مفهوم برای بازبینی پیشنهاد شده است.')}</p>${item.completed?'<p class="rv-resolved">'+(item.passed_later?'پس از آن، این مأموریت را با موفقیت گذرانده‌ای.':'این مأموریت در حساب تو انجام‌شده است.')+' این مرور برای یادآوری مفهوم است.</p>':''}${l?'<a class="rv-text-link" target="_blank" rel="noopener" href="'+E(url(l.lab.path))+'">بازگشت به لابراتور ←</a>':''}</article>`;
  }
  return '<article class="rv-evidence"><p>این موضوع را خودت برای مرور انتخاب کرده‌ای. می‌توانی نکته را بازخوانی کنی و با یک سؤال کوتاه خودت را بیازمایی.</p></article>';
 }
 async function start(id,phase='reason'){
  practiceEntry=state.entries.find(e=>e.id===id);if(!practiceEntry)return;
  context=null;run=null;reflection=null;prepared=false;
  const saved=stored('pending:'+id);
  if(saved?.run?.entry_id===id){run=saved.run;renderPractice();await finish(saved.answer);return}
  const value=await rpc('classroom_review_context',{p_entry:id});if(!alive())return;
  context=value;changeURL(id,phase);
  if(phase==='question'&&!practiceEntry.paused)await startQuestion();else renderContext(phase==='concept'?'concept':'reason');
 }
 function renderContext(phase='reason'){
  view.classList.add('rv-mode-practice');
  const e=practiceEntry,c=conceptFor(e),learning=c.learning||{},ref=reviewReference(c,url),evidence=context?.evidence||[];
  changeURL(e.id,phase);reflection=null;if(phase==='concept')prepared=true;
  view.innerHTML=`<div class="rv-practice-head"><button class="rv-text-link" data-back>${icon('arrow')} بازگشت به دفتر</button><span>به تجربهٔ قبلی برگرد و دوباره امتحان کن</span></div><section class="rv-practice rv-context-flow">${steps(phase==='reason'?0:1)}<p class="rv-eyebrow">مرور شخصی</p><h1 id="rv-context-title" tabindex="-1">${E(e.title)}</h1>${phase==='reason'?`<h2 class="rv-context-heading">چرا این موضوع اینجاست؟</h2>${evidence[0]?evidenceHTML(evidence[0]):evidenceHTML({kind:'manual'})}${evidence.length>1?'<details class="rv-other-evidence"><summary>تجربه‌های مرتبط دیگر</summary>'+evidence.slice(1).map(evidenceHTML).join('')+'</details>':''}<p class="rv-learning-goal"><strong>هدف این مرور:</strong> ${teachingText(learning.goal||c.description||'مفهوم را در یک مثال دیگر بررسی کن.')}</p><div class="rv-practice-tools"><button class="rv-primary" data-read>${e.paused?'فعال‌کردن مرور':prepared?'ادامهٔ تمرین':e.last_review?'اول بدون بازخوانی امتحان کن':'بازخوانی نکته'} ${icon('arrow')}</button>${!e.paused?'<button class="rv-outline" data-direct>'+(e.last_review?'ابتدا نکته را بازخوانی می‌کنم':'مستقیم تمرین می‌کنم')+'</button><button class="rv-text-link" data-pause>فعلاً از مرور خارج کن</button>':''}</div>`:`<p class="rv-learning-goal">${teachingText(learning.goal||'')}</p><p class="rv-learning-core">${teachingText(learning.core||c.description)}</p><section class="rv-worked-example"><h2>یک مثال برای بازخوانی</h2><p>${teachingText(learning.example||'')}</p></section><p class="rv-concept-note">${teachingText(learning.pitfall||'')}</p>${e.note?'<details class="rv-own-note"><summary>یادداشت قبلی من</summary><p>'+E(e.note)+'</p></details>':''}${e.last_reflection?.text?'<details class="rv-own-note"><summary>برداشت قبلی من</summary><p>'+E(e.last_reflection.text)+'</p></details>':''}<div class="rv-practice-tools"><button class="rv-primary" data-question>حالا با یک مثال دیگر امتحان کن ${icon('arrow')}</button><button class="rv-text-link" data-reason>بازگشت به دلیل پیشنهاد</button></div>${ref?'<a class="rv-text-link rv-reference" target="_blank" rel="noopener" href="'+E(ref)+'">'+(c.review_anchor?'مطالعهٔ بخش مرتبط در یادداشت':'مطالعهٔ یادداشت مرتبط')+' ←</a>':''}`}</section>`;
  $('[data-back]').onclick=()=>void act(async()=>{changeURL(null);if(await reload())overview()});
  $('[data-read]')?.addEventListener('click',()=>void act(async()=>{if(e.paused){await rpc('classroom_review_pause',{p_entry:e.id,p_revision:e.revision,p_paused:false});if(!await reload())return;practiceEntry=state.entries.find(x=>x.id===e.id);renderContext('concept')}else if(e.last_review||prepared)await startQuestion();else renderContext('concept')}));
  $('[data-direct]')?.addEventListener('click',()=>{if(e.last_review)renderContext('concept');else void act(startQuestion)});
  $('[data-question]')?.addEventListener('click',()=>void act(startQuestion));
  $('[data-reason]')?.addEventListener('click',()=>renderContext('reason'));
  $('[data-pause]')?.addEventListener('click',()=>void act(async()=>{await rpc('classroom_review_pause',{p_entry:e.id,p_revision:e.revision,p_paused:true});if(await reload()){changeURL(null);overview();message('مرور این موضوع متوقف شد؛ از «همه» می‌توانی دوباره فعالش کنی.')}}));
  $('#rv-context-title').focus();message('');
 }
 async function startQuestion(){
  const value=await rpc('classroom_review_open',{p_entry:practiceEntry.id,p_read_before:prepared});if(!alive())return;
  run=value;changeURL(practiceEntry.id,'question');renderPractice();message('');
 }
 function renderPractice(){
  view.classList.add('rv-mode-practice');
  const e=practiceEntry,c=conceptFor(e),ref=reviewReference(c,url);
  view.innerHTML=`<div class="rv-practice-head"><button class="rv-text-link" data-back>${icon('arrow')} بازگشت به دفتر</button><span>یک تمرین، یک مفهوم</span></div><section class="rv-practice" aria-labelledby="rv-question-title">${steps(2)}<p class="rv-eyebrow">آزمودن دوباره · ${E(e.title)}</p><h1 id="rv-question-title" tabindex="-1">${teachingText(run.question.stem)}</h1><form data-answer-form><fieldset><legend class="sr-only">پاسخت را انتخاب کن</legend>${run.question.options.map((option,i)=>`<label class="rv-answer"><input type="radio" name="review-answer" value="${i}" required><span>${teachingText(option)}</span></label>`).join('')}</fieldset><div class="rv-practice-tools"><button class="rv-primary" type="submit">بررسی پاسخ ${icon('arrow')}</button><button type="button" class="rv-outline" data-hint>Hint</button><button type="button" class="rv-text-link" data-skip>هنوز نمی‌دانم</button></div></form><p class="rv-hint" data-hint-text ${run.hint?'':'hidden'}>${teachingText(run.hint||'')}</p><div data-review-feedback aria-live="polite"></div>${context?'<button class="rv-text-link rv-reference" data-reread>بازخوانی نکته ←</button>':ref?`<a class="rv-text-link rv-reference" href="${E(ref)}" target="_blank" rel="noopener">${c.review_anchor?'مرور بخش مرتبط در یادداشت':'بازکردن یادداشت مرتبط'} ${icon('arrow')}</a>`:''}</section>`;
  $('[data-back]').onclick=()=>void act(async()=>{changeURL(null);if(await reload())overview()});
  $('[data-reread]')?.addEventListener('click',()=>void act(async()=>{const value=await rpc('classroom_review_open',{p_entry:practiceEntry.id,p_read_before:true});if(!alive())return;run=value;renderContext('concept')}));
  $('[data-hint]').onclick=()=>void act(async()=>{const hint=await rpc('classroom_review_hint',{p_run:run.id});if(!alive())return;run.hint=hint;run.hint_used=true;$('[data-hint-text]').innerHTML=teachingText(hint);$('[data-hint-text]').hidden=false});
  $('[data-answer-form]').onsubmit=event=>{event.preventDefault();const selected=$('input[name="review-answer"]:checked');if(selected)void act(()=>finish(selected.value))};
  $('[data-skip]').onclick=()=>void act(()=>finish(null));
  $('[data-hint]').dataset.unavailable=String(!!run.hint_used);
  $('#rv-question-title').focus();
 }
 function persistReflection(){
  if(!reflection)return;reflection.text=$('[data-reflection]')?.value??reflection.text;
  store('reflection:'+reflection.runId,reflection.text===reflection.saved?null:{text:reflection.text,revision:reflection.revision});
 }
 async function saveReflection(){
  if(!reflection)return true;persistReflection();const r=reflection;
  if(r.text===r.saved)return true;
  try{
   const value=await rpc('classroom_review_reflect',{p_run:r.runId,p_revision:r.revision,p_text:r.text});if(!alive())return false;
   r.revision=value.revision;r.saved=value.text;store('reflection:'+r.runId,null);$('[data-reflection-status]').textContent='برداشت تو در حساب ذخیره شد.';return true;
  }catch(error){
   if(!alive())return false;
   $('[data-reflection-status]').textContent=/REVIEW_REFLECTION_CONFLICT/.test(String(error?.message))?'برداشت این مرور در پنجرهٔ دیگری تغییر کرده؛ نوشتهٔ تو حفظ شده است.':errorText(error);
   if(/REVIEW_REFLECTION_CONFLICT/.test(String(error?.message))){
    $('[data-reflection-compare]').hidden=false;
    $('[data-reflection-compare]').onclick=()=>void act(async()=>{const remote=await rpc('classroom_review_reflect',{p_run:r.runId});if(!alive())return;r.revision=remote.revision;r.saved=remote.text;$('[data-reflection-remote]').textContent=remote.text||'خالی';$('[data-reflection-remote]').hidden=false;$('[data-reflection-status]').textContent='نسخهٔ حساب برای مقایسه نشان داده شد. ذخیرهٔ بعدی نوشتهٔ فعلی تو را ثبت می‌کند.';persistReflection()});
   }
   return false;
  }
 }
 async function finish(answer){
  const entryId=practiceEntry.id;store('pending:'+entryId,{run,answer});
  const result=await rpc('classroom_review_finish',{p_run:run.id,p_answer:answer});if(!alive())return;doc.dispatchEvent(new win.CustomEvent('classroom-progress-changed'));
  view.querySelectorAll('input,button[data-hint],button[data-skip],button[type="submit"],button[data-reread]').forEach(el=>{el.disabled=true;el.dataset.unavailable='true'});
  $('[data-answer-form]').hidden=true;$('[data-hint-text]').hidden=true;if($('[data-reread]'))$('[data-reread]').hidden=true;$('#rv-question-title').textContent=practiceEntry.title;
  const selected=run.question.options[Number(result.answer)],learning=conceptFor(practiceEntry)?.learning||{},draft=stored('reflection:'+run.id);
  reflection={runId:run.id,text:draft?.text??result.reflection??'',saved:result.reflection||'',revision:draft?.revision??result.reflection_revision??0};
  $('.rv-learning-steps').outerHTML=steps(3);
  $('[data-review-feedback]').innerHTML=`<section class="rv-feedback" data-correct="${result.correct}"><h2 data-result-title tabindex="-1">${E(reviewOutcome(result).title)}</h2><p>${teachingText(result.explanation)}</p><details class="rv-own-note"><summary>مرور سؤال و پاسخ من</summary><p>${teachingText(run.question.stem)}</p><p>پاسخ تو: ${answer===null?'هنوز نمی‌دانم':teachingText(run.question.options[Number(answer)])}</p></details>${!result.correct?'<p>پاسخ این تمرین: <strong>'+teachingText(selected)+'</strong></p>':''}<p class="rv-next-date">${result.correct&&!result.hint_used&&!result.preparation_used?'نتیجهٔ همین تمرین ثبت شد.':'مرور بعدی کمک می‌کند این نکته را دوباره بررسی کنی.'} مرور بعدی: ${E(date(result.next_due))}</p><section class="rv-reflection"><h3>با زبان خودم</h3><label for="rv-reflection-text">${teachingText(learning.reflection_prompt||'از این مرور چه نکته‌ای را می‌خواهم به خاطر بسپارم؟')}</label><textarea id="rv-reflection-text" data-reflection maxlength="2000" rows="3" placeholder="اختیاری؛ یک جمله هم کافی است.">${E(reflection.text)}</textarea><button class="rv-text-link" data-save-reflection>ذخیرهٔ برداشت من</button><p data-reflection-status class="rv-dialog-status" role="status"></p><button class="rv-outline" data-reflection-compare hidden>دریافت نسخهٔ حساب برای مقایسه</button><p class="rv-preserve" data-reflection-remote hidden></p></section><div class="rv-practice-tools">${!result.correct||result.hint_used||result.preparation_used?'<button class="'+(result.correct?'rv-outline':'rv-primary')+'" data-retry-concept>'+(result.correct?'یک مثال دیگر، بدون بازخوانی':'بازخوانی و یک سؤال دیگر')+' '+icon('arrow')+'</button>':''}<button class="${result.correct?'rv-primary':'rv-outline'}" data-next>${queue.length?'موضوع بعدی':'بازگشت به دفتر'} ${icon('arrow')}</button></div></section>`;
  const resultTitle=$('[data-result-title]');resultTitle.focus({preventScroll:true});resultTitle.scrollIntoView?.({block:'start',behavior:win.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  $('[data-reflection]').oninput=persistReflection;
  $('[data-save-reflection]').onclick=()=>void act(saveReflection);
  async function leave(next){if(!await saveReflection())return;if(!await reload())return;store('pending:'+entryId,null);reflection=null;practiceEntry=state.entries.find(e=>e.id===entryId);await next()}
  $('[data-next]').onclick=()=>void act(()=>leave(async()=>{if(queue.length)await start(queue.shift());else{changeURL(null);overview();message('نتیجهٔ مرور در حساب تو ثبت شد.')}}));
  $('[data-retry-concept]')?.addEventListener('click',()=>void act(()=>leave(async()=>{if(!context)context=await rpc('classroom_review_context',{p_entry:entryId});if(alive()){if(result.correct){prepared=false;await startQuestion()}else renderContext('concept')}})));
  $('[data-back]').onclick=()=>void act(()=>leave(async()=>{changeURL(null);overview()}));
 }
 function persistOnExit(){if(editor)persistEditor();persistReflection()}
 win.addEventListener('pagehide',persistOnExit);
 try{
  if(await reload()){
   const initial=new URL(initialURL||win.location.href),filter=initial.searchParams.get('lesson');if(lessons.some(l=>l.id===filter))lesson=filter;
   const id=initial.searchParams.get('practice');if(state.entries.some(e=>e.id===id&&e.concept_id)){setBusy(true);try{await start(id,['reason','concept','question'].includes(initial.searchParams.get('step'))?initial.searchParams.get('step'):'reason')}finally{setBusy(false)}}else overview();
  }
 }catch(error){if(alive()){view.innerHTML='<section class="rv-empty"><h1>دفتر مرور دریافت نشد.</h1><button class="rv-outline" data-retry>تلاش دوباره</button></section>';$('[data-retry]').onclick=()=>void act(async()=>{if(await reload()){overview();message('')}});message(errorText(error),true)}}
 return {
  prepareSignOut:async()=>{await pending;if(!alive())return {saved:true};return {saved:await saveEditor(false)&&await saveReflection(),localSaved:!!editor||!!reflection}},
  dispose(){persistOnExit();disposed=true;win.removeEventListener('pagehide',persistOnExit);if(dialog.open)dialog.close();root.replaceChildren()}
 };
}
