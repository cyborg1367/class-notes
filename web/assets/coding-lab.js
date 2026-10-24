(function(){
'use strict';let current;
const E=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function mount(root,options){
 current?.dispose();
 const {userId,assets,lessonURL,isCurrent,saveDraft,refresh,submit,getAttempt}=options;
 if(!userId||!isCurrent())return;
 const assetURL=path=>{const u=new URL(path,assets);u.search=options.assetVersion||'?v=build';return u;};
 if(!options.lab?.model||!options.lab?.mission)throw Error('LAB_CATALOG_REQUIRED');
 const [model,{mountLayout},{mountExperience}]=await Promise.all([import(assetURL(options.lab.model)),import(assetURL('coding-lab-layout.mjs')),import(assetURL('coding-lab-experience.mjs'))]);
 if(!isCurrent())return;
 const {stages,dataset,bootstrap,normalize,available,highlight,missionId}=model;
 if(missionId!==options.lab.mission||options.snapshot?.mission&&options.snapshot.mission!==missionId)throw Error('LAB_CATALOG_MISMATCH');
 const meta={...model.meta,title:options.lab.title,lessonBridge:options.lab.bridge};
 const key=`classroom-mission:${userId}:${missionId}`;
 let cached;try{cached=JSON.parse(localStorage.getItem(key)||'null')}catch{}
 let trusted=options.snapshot,revision=Number(trusted.revision||0),state=normalize(cached?.dirty?cached.state:trusted.draft);
 let dirty=!!cached?.dirty,conflict=dirty&&cached.revision!==revision,changed=0,saving=false,cloudLoading=false;
 let worker=null,phase='idle',checking=false,hasRun=false,disposed=false,epoch=0,request=0,activeRequest=0,timer,autosave,pollTimer,controller,outputSize=0,localSaveTimer=null,paintFrame=null;
 let pending=cached?.pending||null;
 state.active=Math.min(state.active,available(trusted));
 root.innerHTML=`<header class="lab-top mission-top">
 <a class="lab-wordmark" href="${E(new URL('../index.html',assets).href)}"><strong>دفتر کلاس</strong><small lang="en" dir="ltr">CLASS NOTES</small></a>
 <div class="mission-xp" lang="en" dir="ltr" aria-label="Lab progress"><div class="mission-xp-orbit" data-header-progress role="progressbar" aria-label="Lab XP" aria-valuemin="0" aria-valuemax="300" aria-valuenow="0"><svg class="xp-ring" viewBox="0 0 240 240" aria-hidden="true"><circle class="xp-ring-disc" cx="120" cy="120" r="99"/><circle class="xp-ring-track" cx="120" cy="120" r="108" pathLength="100"/><circle class="xp-ring-fill" cx="120" cy="120" r="108" pathLength="100"/></svg><div class="mission-xp-core" aria-hidden="true"><strong class="mission-xp-value" data-xp>0</strong></div></div><div class="mission-xp-copy"><span class="mission-xp-limit">of <span data-xp-maximum>300</span> XP</span><p class="mission-xp-count" data-count></p><span class="mission-xp-percent" data-xp-percent></span></div></div>
 <nav class="lab-site-links" aria-label="پیمایش لابراتور"><a href="${E(lessonURL)}">یادگیری</a><a href="${E(new URL(`quiz/${meta.lessonId}/`,new URL('../',assets)).href)}">تمرین‌ها</a><a href="${E(new URL('machine-learning/',new URL('../',assets)).href)}">مسیرها</a></nav>
 <div class="lab-mission-heading"><div class="lab-heading-copy"><h1>${E(meta.title)}</h1><button class="lab-story-review" data-story-review type="button">مرور داستان</button></div>  <nav class="mission-navigation" aria-label="مراحل مأموریت"><span class="mission-navigation-label">مسیر مأموریت</span><ol class="mission-path" aria-label="مراحل مأموریت"></ol></nav></div></header>
 <div class="lab-workspace">
 <aside class="lab-instructions" aria-label="پنل مأموریت">

  <div class="lab-tabs" role="tablist" dir="ltr" aria-label="راهنمای لابراتور" aria-orientation="horizontal">
   <button id="lab-tab-mission" data-lab-tab="mission" role="tab" aria-controls="lab-panel-mission" aria-selected="true" type="button">مأموریت</button>
   <button id="lab-tab-data" data-lab-tab="data" role="tab" aria-controls="lab-panel-data" aria-selected="false" tabindex="-1" type="button">داده‌ها</button>
   <button id="lab-tab-guide" data-lab-tab="guide" role="tab" aria-controls="lab-panel-guide" aria-selected="false" tabindex="-1" type="button">راهنما</button>
  </div>
  <div class="lab-instruction-scroll">
  <section class="lab-task" id="lab-panel-mission" role="tabpanel" aria-labelledby="lab-tab-mission" tabindex="0">

   <p class="lab-task-number" data-task-number></p><h2 id="lab-task-title" tabindex="-1"></h2>
   <p class="mission-context" data-concept></p>
   <p class="mission-action" data-action></p>
   <dl class="mission-io"><div><dt data-input-title></dt><dd data-input></dd></div><div><dt data-result-title></dt><dd data-result></dd></div></dl>
   <details class="mission-contract"><summary>یک مثال کوچک</summary><div class="mission-task-text" data-task></div><pre data-example dir="ltr" tabindex="0"></pre></details>
   <div class="mission-task-actions"><button type="button" class="lab-hint-button" data-show-hints lang="en" dir="ltr"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 13c0-2-2-2.5-2-5a5 5 0 0 1 10 0c0 2.5-2 3-2 5M7 13h6M8 16h4M10 1V0M3 3 2 2M17 3l1-1M1 8H0m20 0h-1"/></svg>Hint</button><span class="mission-task-reward" data-task-reward lang="en" dir="ltr"></span></div>
   <div data-reflection hidden><label for="lab-explanation">پیش‌بینی و نتیجهٔ آزمایش تو</label><textarea id="lab-explanation" maxlength="3000" rows="3" placeholder="پیش از اجرا چه حدسی داشتی؟ پس از اجرا چه چیزی فهمیدی؟"></textarea></div>
   <div class="lab-feedback" data-feedback role="status" aria-live="polite" hidden></div>
   <button type="button" class="button-forest lab-next" data-next disabled>مرحلهٔ بعد ←</button>
   <div class="lab-finish" data-finish hidden><span class="mission-seal" aria-hidden="true">✓</span><h3>${E(meta.finish)}</h3><p>هر شش مرحله را انجام دادی.</p><a href="${E(new URL('dashboard/',new URL('../',assets)).href)}">دیدن مسیر رشد در داشبورد ←</a></div>
  </section>
  <section class="mission-dataset" id="lab-panel-data" role="tabpanel" aria-labelledby="lab-tab-data" tabindex="0" hidden>
   <p class="lab-panel-kicker">داده‌های آمادهٔ این تمرین</p><h2>${E(meta.dataTitle)}</h2>
   ${meta.dataIntro}
   <div class="mission-query"><span>${E(meta.queryLabel)} · <code>query</code></span>${dataset.queryText?`<blockquote class="lab-message-text">${E(dataset.queryText)}</blockquote>`:''}<strong dir="ltr">${E(JSON.stringify(dataset.query))}</strong><p>${E(meta.queryHelp)}</p></div>
   <div class="mission-query" data-second-query hidden><span>وضعیت دوم · <code>query_new</code></span><strong dir="ltr">${E(JSON.stringify(dataset.query_new))}</strong><p>${E(meta.secondHelp||'')}</p></div>
   <div class="mission-table" tabindex="0" aria-label="${E(meta.tableTitle)}"><table><caption>${E(meta.tableTitle)} · اندیس‌ها از صفر شروع می‌شوند</caption><thead><tr><th>اندیس</th><th>شناسه</th>${dataset.columns.map(c=>`<th>${c.label}<small lang="en">${c.name}</small></th>`).join('')}${dataset.texts?'<th>متن پیامک</th>':''}${dataset.y?'<th>برچسب <small lang="en">y</small></th>':''}</tr></thead><tbody>${dataset.X.map((row,i)=>`<tr><th dir="ltr">${i}</th><td dir="ltr">${dataset.names[i]}</td>${row.map(v=>`<td>${v}</td>`).join('')}${dataset.texts?`<td class="lab-message-cell">${E(dataset.texts[i])}</td>`:''}${dataset.y?`<td>${dataset.y[i]}${dataset.texts?` · ${dataset.y[i]?'تبلیغاتی':'عادی'}`:''}</td>`:''}</tr>`).join('')}</tbody></table></div>
   <details class="mission-contract"><summary>آرایه‌های آماده در Python</summary><p>${meta.variables}</p><pre dir="ltr" tabindex="0">${E(bootstrap)}</pre></details>
  </section>
  <section class="mission-guide" id="lab-panel-guide" role="tabpanel" aria-labelledby="lab-tab-guide" tabindex="0" hidden>
   <p class="lab-panel-kicker">وقتی به کمک نیاز داری</p><h2>قدم بعدی را پیدا کن</h2>
   <div class="mission-hints"><button type="button" data-hint class="lab-hint-button" lang="en" dir="ltr"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 13c0-2-2-2.5-2-5a5 5 0 0 1 10 0c0 2.5-2 3-2 5M7 13h6M8 16h4M10 1V0M3 3 2 2M17 3l1-1M1 8H0m20 0h-1"/></svg><span data-hint-label>Hint</span></button><span class="mission-hint-count" data-hint-count lang="en" dir="ltr"></span><div data-hints></div></div>
   <details class="mission-story"><summary>${E(meta.storyTitle)}</summary>${meta.story}</details>
   <details class="mission-contract"><summary>چطور با این محیط کار کنم؟</summary><ol class="mission-guide-steps"><li>در تابع خواسته‌شده، <code>pass</code> را با راه‌حل خودت جایگزین کن.</li><li>تابع باید جواب را با <code>return</code> برگرداند. خط <code>print(...)</code> زیر آن، جواب را در خروجی نشان می‌دهد.</li><li>«اجرای کد» را بزن و خروجی یا خطا را ببین. می‌توانی چند بار کدت را تغییر بدهی و امتحان کنی.</li><li>وقتی آماده بودی، «بررسی پاسخ» را بزن تا مرحله ارزیابی شود و XP بگیری.</li></ol></details>
   <a class="quiet-link" href="${E(lessonURL)}">مرور جزوه ←</a>
  </section>
  </div>
 </aside>
 <section class="lab-editor-panel" aria-label="ویرایشگر و خروجی">
  <div class="lab-editor-toolbar"><span class="lab-file" lang="en" dir="ltr"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 2h6l4 4v12H5ZM11 2v5h4M8 10h4m-4 3h4"/></svg>${E(meta.filename)}<span class="lab-file-dot" aria-hidden="true"></span></span>

   <div class="lab-actions"><button class="lab-run-button" data-run type="button"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m7 4 9 6-9 6Z"/></svg>اجرای کد</button><button class="lab-run-button" data-stop type="button" hidden disabled>توقف</button><button class="button-forest" data-check type="button">بررسی پاسخ</button></div>
   <button class="lab-last-feedback" data-last-feedback type="button" hidden>آخرین بازخورد</button>
   <details class="lab-tools" data-tools><summary aria-label="ابزارها و وضعیت ذخیره" title="ابزارها و وضعیت ذخیره"><svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="4" cy="10" r="1"/><circle cx="10" cy="10" r="1"/><circle cx="16" cy="10" r="1"/></svg><span class="lab-save-alert" data-save-alert hidden aria-label="ذخیره نیاز به بررسی دارد">!</span></summary><div class="lab-tools-menu"><p data-save role="status" aria-live="polite"></p><button data-download type="button">دانلود کد</button><button data-reset type="button">بازنشانی این مرحله</button><button data-cloud-load type="button">دریافت نسخهٔ حساب</button><button data-refresh type="button">همگام‌سازی پیشرفت</button><button data-activate type="button">راه‌اندازی Python</button><a href="${E(new URL('account/',new URL('../',assets)).href)}">حساب کاربری</a><a href="${E(new URL('dashboard/',new URL('../',assets)).href)}">داشبورد</a><a data-lab-teacher-link hidden href="${E(new URL('instructor/',new URL('../',assets)).href)}">پنل مدرس</a></div></details>   <button class="lab-tool-button lab-focus-button" data-focus type="button" aria-pressed="false" title="فضای بیشتر برای کدنویسی"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 3H3v4m10-4h4v4M3 13v4h4m10-4v4h-4"/></svg><span data-focus-label>تمرکز</span></button>
  </div>
  <div class="lab-split-area" data-split>
   <div class="lab-code-wrap" id="lab-editor-region"><pre class="lab-lines" aria-hidden="true"></pre><div class="lab-code"><pre data-highlight aria-hidden="true"></pre><textarea id="lab-code" aria-label="کد Python" dir="ltr" lang="en" wrap="off" spellcheck="false" autocapitalize="off" autocomplete="off" maxlength="20000"></textarea></div></div>
   <div class="lab-resizer" data-resizer role="separator" tabindex="0" aria-label="تغییر اندازهٔ ویرایشگر و خروجی" aria-orientation="horizontal" aria-controls="lab-editor-region lab-console-body" aria-valuemin="20" aria-valuemax="85" aria-valuenow="67" title="برای تغییر اندازه بکش؛ یا از کلیدهای بالا و پایین استفاده کن"><span aria-hidden="true"></span></div>
   <section class="lab-console" aria-label="کنسول Python"><div class="lab-console-head"><span class="lab-console-title" lang="fa" dir="rtl">خروجی</span><div><details class="lab-console-tools"><summary aria-label="ابزارهای خروجی" title="ابزارهای خروجی"><svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="4" r="1"/><circle cx="10" cy="10" r="1"/><circle cx="10" cy="16" r="1"/></svg></summary><div class="lab-console-menu"><button data-clear type="button">پاک‌کردن خروجی</button><button data-console-toggle type="button" aria-expanded="true" aria-controls="lab-console-body">جمع کردن خروجی</button></div></details><button data-output-focus class="lab-output-focus" type="button" aria-pressed="false" aria-label="بزرگ‌کردن خروجی" title="بزرگ‌کردن خروجی"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 3H3v4m10-4h4v4M3 13v4h4m10-4v4h-4"/></svg></button></div></div>
    <div class="lab-console-body" data-console-body id="lab-console-body"><pre class="lab-output" data-output dir="ltr" tabindex="0" aria-label="خروجی Python"></pre><details class="lab-repl"><summary title="دستور Python"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m4 6 4 4-4 4m6 0h6"/></svg><span class="lab-sr-only">دستور Python</span></summary><form class="lab-console-form"><label for="lab-command">&gt;&gt;&gt;</label><input id="lab-command" aria-label="دستور تک‌خطی Python" placeholder="X.shape" dir="ltr" lang="en" autocomplete="off" spellcheck="false" maxlength="2000" disabled><button type="submit" disabled>اجرا</button></form></details></div>
   </section>
  </div>
  <p class="lab-runtime" data-runtime role="status" aria-live="polite" hidden></p><div class="mission-award" data-award role="status" aria-live="polite" hidden></div>
 </section>
 </div>`;
 root.insertAdjacentHTML('beforeend',`<dialog class="xp-celebration" data-celebration lang="en" dir="ltr" aria-labelledby="xp-celebration-title" aria-describedby="xp-celebration-message xp-celebration-detail">
 <button class="xp-celebration-close" data-celebration-close type="button" aria-label="Close celebration"><svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></button>
 <div class="xp-orbit"><svg class="xp-ring" viewBox="0 0 240 240" aria-hidden="true"><circle class="xp-ring-disc" cx="120" cy="120" r="99"/><circle class="xp-ring-track" cx="120" cy="120" r="108" pathLength="100"/><circle class="xp-ring-fill" data-celebration-ring cx="120" cy="120" r="108" pathLength="100"/></svg><span class="xp-ring-tip" aria-hidden="true"><i></i></span>
 <div class="xp-celebration-core"><span class="xp-celebration-check" aria-hidden="true"><svg viewBox="0 0 24 24" width="21" height="21"><path d="m5.5 12 4 4L18.5 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span><h2 id="xp-celebration-title"><span data-celebration-earned>+20</span> <span class="xp-celebration-unit">XP</span></h2><span class="xp-celebration-label">XP earned</span></div>
 <span class="xp-spark xp-spark-one" aria-hidden="true"></span><span class="xp-spark xp-spark-two" aria-hidden="true"></span><span class="xp-spark xp-spark-three" aria-hidden="true"></span><span class="xp-spark xp-spark-four" aria-hidden="true"></span></div>
 <p class="xp-celebration-message" id="xp-celebration-message">Nicely done!</p><p class="xp-celebration-total" id="xp-celebration-detail" data-celebration-progress role="progressbar" aria-label="Total lab XP" aria-valuemin="0" aria-valuemax="300" aria-valuenow="0"><span data-celebration-total>20</span><span class="xp-celebration-divider"> / </span><span data-celebration-maximum>300</span> XP</p>
 <button class="xp-celebration-continue" data-celebration-continue type="button" autofocus>Continue<svg viewBox="0 0 20 20" width="17" height="17" aria-hidden="true"><path d="M4 10h12m-5-5 5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button></dialog>`);
 const $=s=>root.querySelector(s),editor=$('#lab-code'),output=$('[data-output]'),save=$('[data-save]'),explanation=$('#lab-explanation'),command=$('#lab-command');
 root.classList.add('lab-open-notebook');document.body.classList.add('lab-notebook-ready');
 const alive=()=>!disposed&&isCurrent();
 const layout=mountLayout(root);
 const experience=mountExperience(root,{userId,missionId,meta,dataset,stages,hasProgress:!!(trusted.draft||trusted.attempts||trusted.completed?.length||cached?.dirty)});
 const toolsMenu=$('[data-tools]'),consoleTools=$('.lab-console-tools');
 $('[data-lab-teacher-link]').hidden=document.querySelector('[data-teacher-link]')?.hidden!==false;
 function dismissTools(e){for(const menu of [toolsMenu,consoleTools])if(!menu.contains(e.target)||e.target.closest('.lab-tools-menu button,.lab-console-menu button'))menu.open=false}
 function closeTools(e){if(e.key==='Escape')for(const menu of [toolsMenu,consoleTools])if(menu.open){menu.open=false;menu.querySelector('summary').focus()}}
 root.addEventListener('click',dismissTools);root.addEventListener('keydown',closeTools);
 let runWhenReady=false;
 function saveStatus(message,attention=false){save.textContent=message;$('[data-save-alert]').hidden=!attention;$('[data-tools] summary').title=attention?'ابزارها؛ ذخیره نیاز به بررسی دارد':'ابزارها و وضعیت ذخیره'}
 const celebration=$('[data-celebration]'),celebrated=new Set(trusted.completed||[]);
 let celebrationStep=null;
 function closeCelebration(advance=false){
  const step=celebrationStep;celebrationStep=null;
  if(celebration.open)celebration.close();
  celebration.classList.remove('is-celebrating');
  if(!alive()||step===null)return;
  if(!advance){editor.focus();return}
  if(step<stages.length-1&&step+1<=available(trusted)){state.active=step+1;select(true);change()}
  else if(trusted.badge){const title=$('[data-finish] h3');title.setAttribute('tabindex','-1');title.focus()}
 }
 function showCelebration(task,added,before){
  const maximum=Number(trusted.maximum)||300,to=Math.min(maximum,Math.max(0,Number(trusted.xp)||0)),from=Math.min(to,Math.max(0,before));
  if(celebrated.has(task)||added<=0||to<=from)return;
  celebrated.add(task);
  const award=$('[data-award]');award.hidden=typeof celebration.showModal==='function';award.textContent=`+${added} XP · XP earned`;award.setAttribute('lang','en');award.setAttribute('dir','ltr');
  $('[data-celebration-earned]').textContent=`+${added}`;$('[data-celebration-total]').textContent=String(to);$('[data-celebration-maximum]').textContent=String(maximum);
  $('[data-celebration-progress]').setAttribute('aria-valuemax',String(maximum));$('[data-celebration-progress]').setAttribute('aria-valuenow',String(to));$('[data-celebration-progress]').setAttribute('aria-valuetext',`${to} of ${maximum} XP`);
  $('#xp-celebration-message').textContent=to===maximum?'Lab completed!':'Nicely done!';
  celebration.style.setProperty('--xp-from',String(100-from/maximum*100));celebration.style.setProperty('--xp-to',String(100-to/maximum*100));
  celebration.style.setProperty('--xp-turn-from',`${from/maximum*360}deg`);celebration.style.setProperty('--xp-turn-to',`${to/maximum*360}deg`);
  celebration.classList.toggle('is-complete',to===maximum);celebrationStep=stages.findIndex(s=>s.id===task);
  if(typeof celebration.showModal!=='function')return; // Inline reward remains available in older browsers.
  celebration.classList.remove('is-celebrating');celebration.showModal();void celebration.offsetWidth;celebration.classList.add('is-celebrating');
  $('[data-celebration-continue]').focus();
 }
 $('[data-celebration-continue]').onclick=()=>closeCelebration(true);
 $('[data-celebration-close]').onclick=()=>closeCelebration();
 celebration.onclick=e=>{if(e.target===celebration)closeCelebration()};
 celebration.addEventListener('cancel',e=>{e.preventDefault();closeCelebration()});
 celebration.addEventListener('close',()=>{celebrationStep=null;celebration.classList.remove('is-celebrating')});
 current={dispose};
 function feedback(text,error=false){const box=$('[data-feedback]');box.textContent=text;box.hidden=!text;box.dataset.error=String(error)}
 function persist(){try{localStorage.setItem(key,JSON.stringify({state,dirty,revision,pending}));return true}catch{saveStatus('ذخیرهٔ مرورگر ممکن نیست؛ کدت را دانلود کن.',true);return false}}
 function change(){dirty=true;changed++;clearTimeout(localSaveTimer);localSaveTimer=setTimeout(()=>{localSaveTimer=null;if(alive())persist()},150);clearTimeout(autosave);if(conflict)saveStatus('کد محلی با نسخهٔ حساب تفاوت دارد. ابتدا کدت را دانلود کن؛ سپس نسخهٔ حساب را دریافت کن.',true);else{saveStatus('در حال ذخیره…');autosave=setTimeout(flush,1000)}}
 async function flush(){
  if(!alive()||saving||cloudLoading||!dirty||conflict)return;
  saving=true;const serial=changed;
  try{const remote=await saveDraft(JSON.parse(JSON.stringify(state)),revision);if(!alive())return;revision=Number(remote.revision);applyTrusted(remote);if(changed===serial){dirty=false;saveStatus('در حساب ذخیره شد.')}persist()}
  catch(error){if(!alive())return;conflict=/LAB_PROGRESS_CONFLICT/.test(String(error?.message));saveStatus(conflict?'نسخهٔ حساب تغییر کرده است. پیش از دریافت آن، کد محلی را دانلود کن.':'ذخیره در حساب کامل نشد. کد این مرورگر حفظ شده است.',true)}
  finally{saving=false;if(alive()&&dirty&&!conflict&&changed!==serial)autosave=setTimeout(flush,1000)}
 }
 function applyTrusted(remote){trusted={...remote,xp:Math.max(Number(trusted.xp||0),Number(remote.xp||0)),completed:[...new Set([...(trusted.completed||[]),...(remote.completed||[])])]};progress()}
 function progress(){
  const completed=new Set(trusted.completed||[]),limit=available(trusted),busy=checking||['loading','running'].includes(phase);
  const maximum=Number(trusted.maximum)||300,xp=Math.min(maximum,Math.max(0,Number(trusted.xp)||0)),header=$('.mission-xp'),meter=$('[data-header-progress]');
  $('[data-xp]').textContent=String(xp);$('[data-xp-maximum]').textContent=String(maximum);$('[data-count]').textContent=`${completed.size} of ${stages.length} completed`;$('[data-xp-percent]').textContent=`${Math.round(xp/maximum*100)}% complete`;
  header.style.setProperty('--xp-to',String(100-xp/maximum*100));header.classList.toggle('is-complete',xp===maximum);
  meter.setAttribute('aria-valuemax',String(maximum));meter.setAttribute('aria-valuenow',String(xp));meter.setAttribute('aria-valuetext',`${xp} of ${maximum} XP; ${completed.size} of ${stages.length} missions completed`);
  $('.mission-path').innerHTML=stages.map((s,i)=>`<li><button data-stage="${i}" type="button" title="${E(s.title)} · ${s.xp} XP" aria-label="مرحلهٔ ${i+1}: ${E(s.title)}${completed.has(s.id)?'؛ تکمیل شده':''}" ${i>limit||busy?'disabled':''} ${i===state.active?'aria-current="step"':''} data-done="${completed.has(s.id)}"><span class="mission-step-number" aria-hidden="true">${completed.has(s.id)?'✓':i+1}</span></button></li>`).join('');
  $('[data-next]').hidden=state.active===5||!completed.has(stages[state.active].id);$('[data-next]').disabled=!completed.has(stages[state.active].id)||busy;$('[data-finish]').hidden=!trusted.badge;
 }
 function sync(){const pre=$('[data-highlight]');pre.scrollTop=editor.scrollTop;pre.scrollLeft=editor.scrollLeft;$('.lab-lines').scrollTop=editor.scrollTop}
 function paint(){ $('[data-highlight]').innerHTML=highlight(editor.value)+'\n';$('.lab-lines').textContent=editor.value.split('\n').map((_,i)=>i+1).join('\n');sync() }
 function hints(){const n=state.hints[state.active];$('[data-hints]').innerHTML=stages[state.active].hints.slice(0,n).map((h,i)=>`<p><b lang="en">${i+1}</b> ${E(h)}</p>`).join('');$('[data-hint]').disabled=n>=3;$('[data-hint-label]').textContent='Hint';$('[data-hint-count]').textContent=`${n} / 3`}
 function select(focus=false){
  const s=stages[state.active];if(!state.codes[state.active])state.codes[state.active]=(state.active?state.codes[state.active-1]:'')+s.starter;
  editor.value=state.codes[state.active];explanation.value=state.explanation;hasRun=false;
  $('[data-task-number]').textContent=`مرحلهٔ ${(state.active+1).toLocaleString('fa-IR')} از ۶`;
  $('#lab-task-title').textContent=s.title;$('[data-concept]').textContent=s.brief;$('[data-action]').innerHTML=s.action;$('[data-task]').innerHTML=s.task;$('[data-example]').textContent=s.example;$('[data-input-title]').textContent=s.inputTitle;$('[data-result-title]').textContent=s.resultTitle;$('[data-input]').innerHTML=s.input;$('[data-result]').innerHTML=s.result;$('[data-task-reward]').textContent=`+${s.xp} XP`;$('[data-reflection]').hidden=state.active!==5;$('[data-second-query]').hidden=!dataset.query_new||state.active!==5;layout.showMission();$('.lab-instruction-scroll').scrollTop=0;
  feedback('');
  output.textContent='';outputSize=0;hints();paint();controls();if(focus)$('#lab-task-title').focus()
 }
 function controls(message,error=false,refreshProgress=true){
  const busy=checking||['loading','running'].includes(phase);
  editor.readOnly=explanation.disabled=busy;$('[data-check]').disabled=busy;$('[data-run]').disabled=busy;$('[data-activate]').hidden=!!worker;$('[data-activate]').disabled=busy;$('[data-stop]').disabled=!['loading','running'].includes(phase);$('[data-stop]').hidden=$('[data-stop]').disabled;$('[data-run]').hidden=!$('[data-stop]').disabled;$('[data-reset]').disabled=busy;$('[data-cloud-load]').disabled=busy||saving||cloudLoading;
  command.disabled=$('.lab-console-form button').disabled=busy||phase!=='ready'||!hasRun;
  const runtime=$('[data-runtime]');runtime.textContent=message||'';runtime.hidden=!message||(!busy&&!error);root.setAttribute('aria-busy',String(busy));experience.setBusy(busy);if(refreshProgress)progress()
 }
 function append(text){const slice=String(text).slice(0,16000-outputSize);outputSize+=slice.length;output.textContent+=slice;output.scrollTop=output.scrollHeight}
 function terminate(){runWhenReady=false;clearTimeout(timer);epoch++;worker?.terminate();worker=null;hasRun=false;phase='idle'}
 function fail(message){terminate();controls(message,true)}
 $('[data-activate]').onclick=()=>{
  if(!alive()||checking||worker)return;
  try{worker=new Worker(assetURL('coding-lab-worker.mjs'),{type:'module'});const generation=++epoch;phase='loading';controls('در حال آماده‌سازی Python و NumPy…');timer=setTimeout(()=>fail('بارگذاری کامل نشد؛ اتصال را بررسی و دوباره فعال‌سازی کن.'),120000);
   worker.onerror=e=>{e.preventDefault?.();if(alive()&&generation===epoch)fail('محیط محلی دریافت نشد؛ اتصال اینترنت را بررسی کن. بررسی نهایی سرور مستقل از این محیط است.')};
   worker.onmessage=({data})=>{if(!alive()||generation!==epoch||data?.request!==activeRequest)return;
    if(data.type==='stage')controls('Python آماده است؛ در حال دریافت NumPy…');
    if(data.type==='ready'){clearTimeout(timer);phase='ready';controls();if(runWhenReady){runWhenReady=false;run('run')}}
    if(data.type==='load-error'){fail('دریافت محیط کامل نشد؛ اتصال را بررسی کن.');return}
    if(phase!=='running')return;
    if(data.type==='output')append(data.text);
    if(data.type==='error'||data.type==='done'){clearTimeout(timer);if(data.type==='error')append('\n'+data.text);if(!output.textContent)output.textContent='# Finished. No printed output.\n';hasRun=true;phase='ready';controls()}
   };activeRequest=++request;worker.postMessage({type:'init',request:activeRequest})
  }catch{fail('محیط محلی باز نشد؛ مرورگر و اتصال را بررسی کن.')}
 };
 function run(type,code=editor.value){if(!alive()||phase!=='ready'||checking||!code.trim())return;layout.openConsole();if(type==='console')append('>>> '+code+'\n');else{output.textContent='';outputSize=0}phase='running';controls('در حال اجرا…');activeRequest=++request;timer=setTimeout(()=>{append('\n[Stopped: time limit]\n');fail('اجرا پس از ۱۵ ثانیه متوقف شد. کدت را بررسی و محیط را دوباره فعال کن.')},15000);worker.postMessage({type,code,bootstrap:type==='console'?undefined:bootstrap,request:activeRequest})}
 $('[data-run]').onclick=()=>{if(!alive()||checking||['loading','running'].includes(phase))return;layout.openConsole();if(phase==='idle'){runWhenReady=true;$('[data-activate]').onclick()}else run('run')};$('[data-stop]').onclick=()=>{terminate();append('\n[Stopped]\n');controls()};
 $('.lab-console-form').onsubmit=e=>{e.preventDefault();if(hasRun){const code=command.value;command.value='';run('console',code)}};
 $('[data-clear]').onclick=()=>{output.textContent='';outputSize=0};editor.addEventListener('scroll',sync);
 editor.oninput=()=>{state.codes[state.active]=editor.value;hasRun=false;change();if(typeof requestAnimationFrame==='function'){if(paintFrame===null)paintFrame=requestAnimationFrame(()=>{paintFrame=null;if(alive())paint()})}else paint();controls(undefined,false,false)};
 let escapeTab=false;editor.onkeydown=e=>{if(e.key==='Escape'){escapeTab=true;return}if(e.key==='Tab'&&!escapeTab&&!editor.readOnly){e.preventDefault();if(editor.value.length-(editor.selectionEnd-editor.selectionStart)+4<=20000){editor.setRangeText('    ',editor.selectionStart,editor.selectionEnd,'end');editor.dispatchEvent(new Event('input'))}}else if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();$('[data-run]').click()}escapeTab=false};
 explanation.oninput=()=>{state.explanation=explanation.value;change()};
 $('[data-show-hints]').onclick=()=>{layout.selectTab('guide',true);if(state.hints[state.active]===0)$('[data-hint]').onclick()};
 $('[data-hint]').onclick=()=>{if(state.hints[state.active]<3){state.hints[state.active]++;hints();change()}};
 $('.mission-path').onclick=e=>{const b=e.target.closest('[data-stage]');if(!b||b.disabled)return;state.active=Number(b.dataset.stage);select(true);change()};
 $('[data-next]').onclick=()=>{if(state.active<available(trusted)&&state.active<5){state.active++;select(true);change()}};
 $('[data-reset]').onclick=()=>{if(!confirm('کد این تسک با قالب آغازین جایگزین شود؟ XP قبلی حفظ می‌شود.'))return;state.codes[state.active]=(state.active?state.codes[state.active-1]:'')+stages[state.active].starter;select();change()};
 $('[data-download]').onclick=()=>{const text=bootstrap+'\n'+editor.value+'\n# Reflection\n'+state.explanation.split('\n').map(l=>'# '+l).join('\n'),href=URL.createObjectURL(new Blob([text],{type:'text/x-python;charset=utf-8'})),a=document.createElement('a');a.href=href;a.download=`${meta.downloadPrefix||missionId}-${stages[state.active].id}.py`;a.click();setTimeout(()=>URL.revokeObjectURL(href),1000)};
 function pollDelay(ms,signal){return new Promise((resolve,reject)=>{const cancel=()=>{clearTimeout(pollTimer);reject(new Error('Aborted'))};signal.addEventListener('abort',cancel,{once:true});pollTimer=setTimeout(()=>{signal.removeEventListener('abort',cancel);resolve()},ms)})}
 $('[data-check]').onclick=async()=>{
  if(!alive()||checking||['loading','running'].includes(phase))return;
  if(!editor.value.trim()){experience.showFeedback({code:'EMPTY_CODE'},'failed',stages[state.active]);return}
  const checkedStage=stages[state.active],returnPoint=experience.capture();
  const task=checkedStage.id,code=editor.value,xpBefore=Number(trusted.xp||0);
  if(!pending||pending.task!==task||pending.code!==code)pending={task,code,request_id:crypto.randomUUID()};
  persist();$('[data-award]').hidden=true;checking=true;controller=new AbortController();controls('در حال بررسی پاسخ…');feedback('');
  try{
   let result=await submit({mission:missionId,...pending},controller.signal);
   for(let i=0;result?.status==='running'&&i<40;i++){await pollDelay(1500,controller.signal);const found=await getAttempt(pending.request_id);if(found)result=found}
   if(!alive())return;
   if(result?.status==='running'){experience.showFeedback({code:'CHECK_PENDING'},'error',checkedStage,returnPoint);return}
   if(!result?.snapshot||!['passed','failed','error'].includes(result.status))throw Error('INVALID_SERVER_RESPONSE');
   applyTrusted(result.snapshot);pending=null;persist();
   if(result.status!=='passed')experience.showFeedback(result.feedback,result.status,checkedStage,returnPoint);
   else if(!Number(result.xp_added))experience.showFeedback({code:'ALREADY_PASSED'},'passed',checkedStage,returnPoint);
   if(result.status==='passed'&&Number(result.xp_added)>0){experience.rememberFeedback({code:'PASSED'},'passed',checkedStage);showCelebration(task,Number(result.xp_added),xpBefore);}
  }catch(error){if(alive()&&error?.name!=='AbortError')experience.showFeedback({code:error?.code||'CHECK_UNAVAILABLE'},'error',checkedStage,returnPoint)}
  finally{checking=false;if(alive())controls()}
 };
 $('[data-refresh]').onclick=async()=>{try{const remote=await refresh();if(alive()){applyTrusted(remote);feedback('پیشرفت ثبت‌شدهٔ حساب دریافت شد.')}}catch{if(alive())feedback('دریافت پیشرفت کامل نشد؛ اتصال را بررسی کن.',true)}};
 $('[data-cloud-load]').onclick=async()=>{
  if(saving||checking||cloudLoading||['running','loading'].includes(phase))return;
  if(dirty&&!confirm('کد محلی با نسخهٔ حساب جایگزین شود؟ برای نگهداری تغییرها، ابتدا کدت را دانلود کن.'))return;
  cloudLoading=true;clearTimeout(autosave);const before=changed;controls();
  try{const remote=await refresh();if(!alive())return;if(changed!==before){saveStatus('هنگام دریافت، کدت تغییر کرد؛ تغییرهای تازه حفظ شدند.',true);return}applyTrusted(remote);revision=Number(remote.revision);conflict=false;if(remote.draft){state=normalize(remote.draft);state.active=Math.min(state.active,available(trusted));dirty=false;persist();select();saveStatus('نسخهٔ حساب دریافت شد.')}else{dirty=true;changed++;cloudLoading=false;await flush()}}
  catch{if(alive())saveStatus('نسخهٔ حساب دریافت نشد؛ کد محلی حفظ شده است.',true)}
  finally{cloudLoading=false;if(alive())controls()}
 };
 function pagehide(){experience.close(false);closeCelebration();clearTimeout(localSaveTimer);persist();controller?.abort();terminate();if(alive())controls('برای ادامه محیط محلی را دوباره فعال کن.')}
 function dispose(){if(disposed)return;clearTimeout(localSaveTimer);if(paintFrame!==null&&typeof cancelAnimationFrame==='function')cancelAnimationFrame(paintFrame);persist();disposed=true;document.body.classList.remove('lab-notebook-ready');root.classList.remove('lab-open-notebook');layout.dispose();experience.dispose();root.removeEventListener('click',dismissTools);root.removeEventListener('keydown',closeTools);closeCelebration();clearTimeout(autosave);clearTimeout(pollTimer);controller?.abort();terminate();window.removeEventListener('pagehide',pagehide);if(current?.dispose===dispose)current=null}
 window.addEventListener('pagehide',pagehide);select();persist();saveStatus(conflict?'نسخهٔ محلی با حساب تفاوت دارد؛ پیش از دریافت نسخهٔ حساب، کدت را دانلود کن.':dirty?'کد این مرورگر بازیابی شد.':'ذخیرهٔ خودکار فعال است.',conflict);experience.start();return current
}
window.ClassNotesCodingLab={mount,dispose:()=>current?.dispose()};
})();
