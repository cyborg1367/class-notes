// Private notebook data is supplied by authenticated RPCs; no answer bank ships here.
const E=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Isolate array literals and Python identifiers inside Persian sentences.
const teachingText=value=>String(value??'').split(/(\[[\d\s,.]+\]|\([\d\s,.]+\)|[A-Za-z][A-Za-z0-9_]*(?:\s*=\s*[\d.]+)?)/g).map((part,i)=>i%2?'<bdi dir="ltr">'+E(part)+'</bdi>':E(part)).join('');
const fa=value=>Number(value).toLocaleString('fa-IR');
const paths={arrow:'M20 12H4m6-6-6 6 6 6',plus:'M12 5v14M5 12h14',search:'M20 20l-5-5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0',bookmark:'M6 3h12v18l-6-4-6 4Z',clock:'M12 8v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',pencil:'m15 4 5 5M4 20l1-6L16 3l5 5-11 11Z',lock:'M7 10V7a5 5 0 0 1 10 0v3M5 10h14v11H5ZM12 14v3',close:'m6 6 12 12M6 18 18 6'};
const icon=name=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name]||paths.arrow}"/></svg>`;
export const normalizeSearch=value=>String(value??'').replace(/ي/g,'ی').replace(/ك/g,'ک').replace(/[\u064b-\u065f\u200c]/g,'').toLocaleLowerCase().trim();
export function reviewEntries(state,{tab='due',search='',lesson=''}={}){
 const concepts=new Map((state.concepts||[]).map(c=>[c.id,c]));
 const query=normalizeSearch(search);
 return (state.entries||[]).filter(e=>(tab!=='due'||e.due)&&(tab!=='bookmarked'||e.bookmarked)&&(!lesson||concepts.get(e.concept_id)?.lesson_id===lesson)&&(!query||normalizeSearch(e.title+' '+e.note+' '+(concepts.get(e.concept_id)?.description||'')).includes(query)));
}
export function reviewReference(concept,url){
 if(!concept||!/^machine-learning\/[a-z0-9-]+$/.test(concept.lesson_id))return null;
 return url(concept.lesson_id+'/'+(/^[A-Za-z0-9_-]+$/.test(concept.review_anchor||'')?'#'+concept.review_anchor:''));
}
const art=`<svg class="rv-cards" viewBox="0 0 390 150" aria-hidden="true"><g fill="none" stroke="#657064" stroke-width="1"><path d="M8 131h370M24 135h330M58 25l-7-9m30 6 1-12m21 17 6-11"/><path fill="#faf5e8" d="m49 48 106-6 8 87-107 2Z"/><path d="m49 48-5 79 12 4m9-58h72M65 87h75m-74 13h75m-74 14h75"/><path fill="#faf5e8" d="m170 65 90-3 5 66h-91Z"/><path d="m170 65-5 61 9 2m11-42h63m-63 13h64m-63 13h63"/><path fill="#faf5e8" d="m281 80 68-2 5 49-69 1Z"/><path d="m281 80-4 46 8 2m10-30h43m-42 13h44"/></g><g fill="#3e4438" font-family="Georgia,serif" font-size="14"><text x="65" y="66">01</text><text x="184" y="82">02</text><text x="295" y="96">03</text></g></svg>`;
export async function mountReview(root,{rpc,url,userId,lessons=[],isCurrent=()=>true,storage,initialURL,win=root.ownerDocument.defaultView}){
 const doc=root.ownerDocument;
 let state={entries:[],concepts:[]},tab='due',search='',lesson='',busy=false,disposed=false,editor=null,run=null,queue=[],practiceEntry=null,pending=Promise.resolve();
 const ownerKey=`classroom-review-notebook:${userId}:`,alive=()=>!disposed&&isCurrent()&&root.isConnected;
 const $=selector=>root.querySelector(selector);
 function stored(key){try{return JSON.parse(storage?.getItem(ownerKey+key)||'null')}catch{return null}}
 function store(key,value){try{if(value===null)storage?.removeItem(ownerKey+key);else storage?.setItem(ownerKey+key,JSON.stringify(value));return true}catch{return false}}
 function message(text,error=false){if(!alive())return;const el=$('[data-review-status]');el.textContent=text;el.dataset.error=String(error);}
 function errorText(error){const code=String(error?.message||'');return /REVIEW_NOTE_CONFLICT/.test(code)?'نسخهٔ حساب در پنجرهٔ دیگری تغییر کرده است؛ متن تو حفظ شده است.':/REVIEW_CREATE_CONFLICT/.test(code)?'نسخهٔ قبلی این یادداشت ثبت شده است؛ نوشتهٔ فعلی در این مرورگر حفظ شده. مورد ثبت‌شده را از دفتر باز کن.':/REVIEW_ENTRY_EXISTS/.test(code)?'این موضوع از قبل در دفترت هست؛ همان مورد را باز کن.':/REVIEW_NOTE_LIMIT/.test(code)?'دفتر به سقف ۲۰۰ یادداشت آزاد رسیده است.':/CLASS_ACCESS_REQUIRED/.test(code)?'دسترسی این یادداشت فعال نیست؛ وضعیت عضویت را بررسی کن.':/PGRST202|function .*does not exist/.test(code)?'دفتر مرور هنوز روی سرور فعال نشده است. با مدرس در میان بگذار.':'ثبت یا دریافت کامل نشد؛ نوشته‌ات حفظ شده است. دوباره تلاش کن.'}
 function setBusy(value){busy=value;root.setAttribute('aria-busy',String(value));root.querySelectorAll('button').forEach(b=>{b.disabled=value||b.dataset.unavailable==='true'});}
 function act(fn){if(busy||!alive())return pending;setBusy(true);pending=(async()=>{try{await fn()}catch(e){message(errorText(e),true)}finally{if(alive())setBusy(false)}})();return pending}
 function conceptFor(entry){return state.concepts.find(c=>c.id===entry.concept_id)}
 function date(value){return value?new Date(value).toLocaleDateString('fa-IR',{month:'short',day:'numeric'}):''}
 function lessonLabel(id){return lessons.find(l=>l.id===id)?.title||'یادداشت مرتبط'}
 function sourceLabel(e){return ({quiz:'از آزمون',lab:'از لابراتور',manual:'انتخاب خودت'})[e.source?.kind]||'انتخاب خودت'}
 async function reload(){const value=await rpc('classroom_review_state');if(!alive())return false;state={entries:Array.isArray(value?.entries)?value.entries:[],concepts:Array.isArray(value?.concepts)?value.concepts:[]};return true}
 function changeURL(entry){try{const u=new URL(win.location.href);entry?u.searchParams.set('practice',entry):u.searchParams.delete('practice');win.history.replaceState(null,'',u.href)}catch{}}
 root.innerHTML=`<div data-review-view></div><p class="rv-status" data-review-status role="status" aria-live="polite"></p><dialog class="rv-dialog" aria-labelledby="rv-dialog-title"><div data-review-dialog></div></dialog>`;
 const view=$('[data-review-view]'),dialog=$('dialog');
 function closeEditor(){if(editor)persistEditor();editor=null;dialog.close();}
 dialog.addEventListener('cancel',event=>{event.preventDefault();if(!busy)closeEditor()});
 function persistEditor(){if(!editor)return;editor.note=$('[data-note-body]')?.value??editor.note;editor.title=$('[data-note-title]')?.value??editor.title;editor.concept=$('[data-note-concept]')?.value??editor.concept;const unchanged=editor.entry&&editor.note===editor.entry.note&&editor.title===editor.entry.title;store(editor.key,unchanged?null:{note:editor.note,title:editor.title,concept:editor.concept,revision:editor.revision,request:editor.request});}
 function overview(){
  run=null;practiceEntry=null;
  const due=state.entries.filter(e=>e.due),saved=state.entries.filter(e=>e.bookmarked),latest=state.entries.filter(e=>e.note).sort((a,b)=>Date.parse(b.updated_at)-Date.parse(a.updated_at))[0];
  view.innerHTML=`<header class="rv-heading"><div><nav aria-label="مسیر صفحه"><a href="${E(url('dashboard/'))}">داشبورد</a><span aria-hidden="true">/</span><span>دفتر مرور</span></nav><h1>دفتر مرور شخصی</h1><p>هر بار مرور، فرصتی برای فهمیدنِ بهتر.</p></div><button class="rv-outline" data-new>${icon('plus')} یادداشت تازه</button></header>
  <section class="rv-hero" aria-labelledby="rv-today-title"><div class="rv-hero-copy"><p class="rv-eyebrow"><span></span>پیشنهاد امروز</p><h2 id="rv-today-title">کمی مرور، یک قدم جلوتر.</h2><p>${due.length?'با چند تمرین تازه، به موضوعات قبلی برگرد.':state.entries.length?'مرورهای امروز انجام شده‌اند؛ می‌توانی به دفترت برگردی.':'اولین موضوع را انتخاب کن و دفتر خودت را بساز.'}</p>${art}</div><div class="rv-hero-action"><h3>${due.length?fa(due.length)+' موضوع برای امروز':state.entries.length?'برای امروز آماده‌ای':'از یک موضوع شروع کن'}</h3><p>${icon('clock')}${due.length?'حدود '+fa(Math.ceil(due.length*1.5))+' دقیقه':'با ریتم خودت پیش برو'}</p><button class="rv-primary" data-start>${due.length?'شروع مرور':state.entries.length?'انتخاب موضوع':'افزودن اولین موضوع'} ${icon('arrow')}</button><small>${due.length?'هر بار، روی یک موضوع تمرکز می‌کنیم.':'موضوعات و یادداشت‌ها در حساب تو ذخیره می‌شوند.'}</small></div></section>
  <div class="rv-columns"><section class="rv-library" aria-labelledby="rv-topics-title"><div class="rv-library-head"><div><h2 id="rv-topics-title">موضوعات دفتر</h2><span>${fa(state.entries.length)} موضوع</span></div><label class="rv-search">${icon('search')}<input type="search" data-search placeholder="جست‌وجوی موضوع…" aria-label="جست‌وجو در موضوع و یادداشت" value="${E(search)}"></label></div><div class="rv-filters"><div role="group" aria-label="وضعیت مرور"><button data-tab="due" aria-pressed="${tab==='due'}">برای امروز ${fa(due.length)}</button><button data-tab="all" aria-pressed="${tab==='all'}">همه</button><button data-tab="bookmarked" aria-pressed="${tab==='bookmarked'}">نشان‌شده‌ها ${fa(saved.length)}</button></div><label class="rv-lesson-filter"><span class="sr-only">فیلتر یادداشت</span><select data-lesson><option value="">همهٔ یادداشت‌ها</option>${lessons.map(l=>`<option value="${E(l.id)}" ${l.id===lesson?'selected':''}>${E(l.title)}</option>`).join('')}</select></label></div><div data-review-list></div></section>
  <aside class="rv-side"><section class="rv-note-paper"><p class="rv-note-kicker">با زبان خودم ${icon('pencil')}</p><h2>${latest?'آخرین یادداشت من':'یادداشتی برای خودت'}</h2>${latest?`<h3>${E(latest.title)}</h3><p class="rv-note-preview">${E(latest.note.slice(0,240))}${latest.note.length>240?'…':''}</p>`:'<p class="rv-note-preview">چیزی را که تازه فهمیده‌ای، با زبان خودت بنویس؛ حتی در یک جمله.</p>'}<div class="rv-writing-lines" aria-hidden="true"></div><button class="rv-text-link" data-latest="${E(latest?.id||'')}">${latest?'ویرایش یادداشت':'نوشتن اولین یادداشت'} ${icon('arrow')}</button></section><p class="rv-private">${icon('lock')}یادداشت‌ها فقط برای خودت هستند.</p></aside></div>`;
  $('[data-new]').onclick=()=>openEditor();
  $('[data-start]').onclick=()=>{if(due.length){queue=due.map(e=>e.id);void act(()=>start(queue.shift()))}else openEditor()};
  $('[data-latest]').onclick=()=>openEditor(latest);
  $('[data-search]').oninput=event=>{search=event.target.value;renderList()};
  $('[data-lesson]').onchange=event=>{lesson=event.target.value;renderList()};
  view.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{tab=b.dataset.tab;view.querySelectorAll('[data-tab]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tab===tab)));renderList()});
  renderList();
 }
 function renderList(){
  const entries=reviewEntries(state,{tab,search,lesson});
  $('[data-review-list]').innerHTML=entries.length?entries.map((e,i)=>{const c=conceptFor(e);return `<article class="rv-entry"><button class="rv-entry-open" data-open="${E(e.id)}"><span class="rv-entry-number" dir="ltr">${String(i+1).padStart(2,'0')}</span><span><strong>${E(e.title)}</strong><small>${E(c?lessonLabel(c.lesson_id):'یادداشت شخصی')} · ${sourceLabel(e)}</small><span class="rv-entry-description">${E(c?.description||e.note.slice(0,100)||'یادداشتی با زبان خودت.')}</span>${c&&!e.due?`<small>مرور بعدی: ${E(date(e.next_due))}</small>`:''}</span><span class="rv-open-arrow">${icon('arrow')}</span></button><button class="rv-bookmark" data-bookmark="${E(e.id)}" aria-label="نشان‌گذاری ${E(e.title)}" aria-pressed="${e.bookmarked}">${icon('bookmark')}</button></article>`}).join(''):`<div class="rv-empty"><h3>${search||lesson?'موضوعی با این فیلتر پیدا نشد.':tab==='due'?'مرور آماده‌ای باقی نمانده است.':tab==='bookmarked'?'هنوز موضوعی نشان نکرده‌ای.':'دفترت هنوز خالی است.'}</h3><p>${tab==='due'?'می‌توانی از «همه» موضوعات قبلی را ببینی یا موضوع تازه‌ای اضافه کنی.':'یک موضوع انتخاب کن یا یادداشت شخصی خودت را بنویس.'}</p><button class="rv-text-link" data-empty-add>افزودن موضوع ${icon('plus')}</button></div>`;
  view.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>openEditor(state.entries.find(e=>e.id===b.dataset.open)));
  view.querySelectorAll('[data-bookmark]').forEach(b=>b.onclick=()=>void act(async()=>{const e=state.entries.find(e=>e.id===b.dataset.bookmark);await rpc('classroom_review_save',{p_entry:e.id,p_revision:e.revision,p_note:e.note,p_bookmarked:!e.bookmarked,p_title:e.title});if(await reload())overview()}));
  $('[data-empty-add]')?.addEventListener('click',()=>openEditor());
 }
 function openEditor(entry){
  if(busy||!alive())return;
  const key='note:'+(entry?.id||'new'),draft=stored(key);
  editor={entry,key,request:draft?.request||globalThis.crypto.randomUUID(),title:draft?.title??entry?.title??'',note:draft?.note??entry?.note??'',concept:draft?.concept??entry?.concept_id??'',revision:draft?.revision??entry?.revision??0};
  const c=entry&&conceptFor(entry),reference=reviewReference(c,url);
  $('[data-review-dialog]').innerHTML=`<header class="rv-dialog-head"><h2 id="rv-dialog-title">${entry?'موضوع و یادداشت من':'یادداشت تازه'}</h2><button class="rv-icon" data-close aria-label="بستن">${icon('close')}</button></header><form data-note-form>${!entry?`<label>موضوع مرتبط<select data-note-concept><option value="">یادداشت آزاد</option>${state.concepts.map(c=>`<option value="${E(c.id)}" ${editor.concept===c.id?'selected':''}>${E(c.title)}</option>`).join('')}</select></label>`:''}<label>عنوان<input data-note-title maxlength="160" value="${E(editor.title)}" ${entry?.concept_id?'readonly':''} required></label>${entry?.source?`<p class="rv-context">${E(entry.source.description)}</p>`:''}${draft?'<p class="rv-draft-notice">پیش‌نویس ذخیره‌نشدهٔ همین مرورگر بازیابی شد.</p>':''}<label>با زبان خودم<textarea data-note-body maxlength="4000" rows="5" placeholder="چه چیزی را بهتر فهمیدم؟ دفعهٔ بعد به چه نکته‌ای دقت کنم؟">${E(editor.note)}</textarea></label><p class="rv-dialog-status" data-note-status role="status"></p><div data-note-conflict></div><div class="rv-dialog-actions"><button class="rv-primary" type="submit">ذخیرهٔ یادداشت</button>${entry?.concept_id?'<button class="rv-outline" type="button" data-practice>تمرین این موضوع</button>':''}${reference?`<a class="rv-text-link" href="${E(reference)}">مرور بخش مرتبط ${icon('arrow')}</a>`:''}</div></form>${entry?.history?.length?`<details class="rv-history"><summary>سابقهٔ مرور · ${fa(entry.history.length)} مرور اخیر</summary><ul>${entry.history.map(h=>`<li><time>${E(date(h.at))}</time><span>${h.correct?h.hint_used?'پاسخ درست با راهنما':'پاسخ درست بدون راهنما':'نیازمند مرور دوباره'}</span></li>`).join('')}</ul></details>`:''}`;
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
 async function start(id){
  practiceEntry=state.entries.find(e=>e.id===id);if(!practiceEntry)return;
  changeURL(id);const saved=stored('pending:'+id);
  if(saved?.run?.entry_id===id){run=saved.run;renderPractice();await finish(saved.answer);return}
  const value=await rpc('classroom_review_start',{p_entry:id});if(!alive())return;run=value;changeURL(id);renderPractice();message('');
 }
 function renderPractice(){
  const e=practiceEntry,c=conceptFor(e),ref=reviewReference(c,url);
  view.innerHTML=`<div class="rv-practice-head"><button class="rv-text-link" data-back>${icon('arrow')} بازگشت به دفتر</button><span>یک تمرین، یک مفهوم</span></div><section class="rv-practice" aria-labelledby="rv-question-title"><p class="rv-eyebrow">مرور شخصی · ${E(e.title)}</p><h1 id="rv-question-title" tabindex="-1">${teachingText(run.question.stem)}</h1><form data-answer-form><fieldset><legend class="sr-only">پاسخت را انتخاب کن</legend>${run.question.options.map((option,i)=>`<label class="rv-answer"><input type="radio" name="review-answer" value="${i}" required><span>${teachingText(option)}</span></label>`).join('')}</fieldset><div class="rv-practice-tools"><button class="rv-primary" type="submit">بررسی پاسخ ${icon('arrow')}</button><button type="button" class="rv-outline" data-hint>Hint</button><button type="button" class="rv-text-link" data-skip>هنوز نمی‌دانم</button></div></form><p class="rv-hint" data-hint-text ${run.hint?'':'hidden'}>${teachingText(run.hint||'')}</p><div data-review-feedback aria-live="polite"></div>${ref?`<a class="rv-text-link rv-reference" href="${E(ref)}" target="_blank" rel="noopener">مرور بخش مرتبط در یادداشت ${icon('arrow')}</a>`:''}</section>`;
  $('[data-back]').onclick=()=>void act(async()=>{changeURL(null);if(await reload())overview()});
  $('[data-hint]').onclick=()=>void act(async()=>{const hint=await rpc('classroom_review_hint',{p_run:run.id});if(!alive())return;run.hint=hint;run.hint_used=true;$('[data-hint-text]').innerHTML=teachingText(hint);$('[data-hint-text]').hidden=false});
  $('[data-answer-form]').onsubmit=event=>{event.preventDefault();const selected=$('input[name="review-answer"]:checked');if(selected)void act(()=>finish(selected.value))};
  $('[data-skip]').onclick=()=>void act(()=>finish(null));
  $('[data-hint]').dataset.unavailable=String(!!run.hint_used);
  $('#rv-question-title').focus();
 }
 async function finish(answer){
  const entryId=practiceEntry.id;store('pending:'+entryId,{run,answer});
  const result=await rpc('classroom_review_finish',{p_run:run.id,p_answer:answer});if(!alive())return;
  view.querySelectorAll('input,button[data-hint],button[data-skip],button[type="submit"]').forEach(el=>{el.disabled=true;el.dataset.unavailable='true'});
  const selected=run.question.options[Number(result.answer)];
  $('[data-review-feedback]').innerHTML=`<section class="rv-feedback" data-correct="${result.correct}"><h2>${result.correct?result.hint_used?'درست بود؛ با کمک راهنما.':'درست بود.':'این مفهوم را دوباره مرور می‌کنیم.'}</h2><p>${teachingText(result.explanation)}</p>${!result.correct?'<p>پاسخ این تمرین: <strong>'+teachingText(selected)+'</strong></p>':''}<p class="rv-next-date">مرور بعدی: ${E(date(result.next_due))}</p><button class="rv-primary" data-next>${queue.length?'موضوع بعدی':'بازگشت به دفتر'} ${icon('arrow')}</button></section>`;
  $('[data-next]').onclick=()=>void act(async()=>{store('pending:'+entryId,null);if(!await reload())return;if(queue.length)await start(queue.shift());else{changeURL(null);overview();message('مرور در حساب تو ثبت شد.')}});
 }
 function persistOnExit(){if(editor)persistEditor()}
 win.addEventListener('pagehide',persistOnExit);
 try{
  if(await reload()){
   const initial=new URL(initialURL||win.location.href),filter=initial.searchParams.get('lesson');if(lessons.some(l=>l.id===filter))lesson=filter;
   const id=initial.searchParams.get('practice');if(state.entries.some(e=>e.id===id&&e.concept_id)){setBusy(true);try{await start(id)}finally{setBusy(false)}}else overview();
  }
 }catch(error){if(alive()){view.innerHTML='<section class="rv-empty"><h1>دفتر مرور دریافت نشد.</h1><button class="rv-outline" data-retry>تلاش دوباره</button></section>';$('[data-retry]').onclick=()=>void act(async()=>{if(await reload()){overview();message('')}});message(errorText(error),true)}}
 return {
  prepareSignOut:async()=>{await pending;if(!alive())return {saved:true};return {saved:await saveEditor(false),localSaved:!!editor}},
  dispose(){persistOnExit();disposed=true;win.removeEventListener('pagehide',persistOnExit);if(dialog.open)dialog.close();root.replaceChildren()}
 };
}
