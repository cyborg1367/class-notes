(function(){
'use strict';let current;
const E=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function mount(root,options){
 current?.dispose();
 const {userId,assets,lessonURL,isCurrent,saveDraft,refresh,submit,getAttempt}=options;
 if(!userId||!isCurrent())return;
 const {stages,dataset,bootstrap,normalize,available,highlight,missionId}=await import(new URL('coding-lab-model.mjs?v=3.0.3',assets));
 if(!isCurrent())return;
 const key=`classroom-mission:${userId}:${missionId}`;
 let cached;try{cached=JSON.parse(localStorage.getItem(key)||'null')}catch{}
 let trusted=options.snapshot,revision=Number(trusted.revision||0),state=normalize(cached?.dirty?cached.state:trusted.draft);
 let dirty=!!cached?.dirty,conflict=dirty&&cached.revision!==revision,changed=0,saving=false,cloudLoading=false;
 let worker=null,phase='idle',checking=false,hasRun=false,disposed=false,epoch=0,request=0,activeRequest=0,timer,autosave,pollTimer,controller,outputSize=0;
 let pending=cached?.pending||null;
 state.active=Math.min(state.active,available(trusted));
 root.innerHTML=`<header class="lab-top mission-top"><div><p class="lab-kicker" lang="en" dir="ltr">FIELD MISSION / 01</p><h1>کارآگاه گلخانه</h1><p>از جدول حسگرها تا جست‌وجوی وضعیت‌های مشابه</p></div><div class="mission-xp"><span>تجربهٔ به‌دست‌آمده</span><strong dir="ltr"><b data-xp>0</b> <small>/ 300 XP</small></strong><progress max="300" value="0" aria-label="XP مأموریت"></progress><span data-count></span></div></header>
 <section class="mission-brief"><div><span class="mission-label">پروندهٔ مأموریت</span><h2>کدام سابقه به وضعیت تازه شبیه‌تر است؟</h2><p>پژوهشگر گلخانه می‌خواهد سابقه‌های شبیه به وضعیت تازهٔ حسگرها را پیدا کند. داده‌ها ساختگی‌اند و هر سطر یک وضعیت ثبت‌شده است؛ هدف تو ساختن ابزار جست‌وجو و آزمودن آن روی ورودی‌های تازه است.</p></div><div class="mission-query"><span>پرس‌وجوی تازه</span><strong dir="ltr">[4.5, 6.5, 4.0]</strong><p>رطوبت · روشنایی · گرما</p><span class="mission-scale">هر سه ویژگی از قبل روی مقیاس مشترک ۰ تا ۱۰ هستند.</span></div></section>
 <div class="lab-workspace"><aside class="lab-instructions" aria-label="داده و مأموریت"><details class="mission-dataset" open><summary>دادهٔ پرونده <span>۱۰ وضعیت · ۳ ویژگی</span></summary><p>امتیاز بزرگ‌تر، مقدار بیشتری از همان ویژگی را نشان می‌دهد. این عددها واحد فیزیکیِ حسگر نیستند. ترتیب ستون‌ها در X ثابت است.</p><div class="mission-table"><table><thead><tr><th>شناسه</th>${dataset.columns.map(c=>`<th>${c.label}<small lang="en">${c.name}</small></th>`).join('')}</tr></thead><tbody>${dataset.X.map((row,i)=>`<tr><th dir="ltr">${dataset.names[i]}</th>${row.map(v=>`<td><span style="--score:${v*10}%">${v}</span></td>`).join('')}</tr>`).join('')}</tbody></table></div><details><summary>تعریف آرایه‌ها در Python</summary><pre dir="ltr" tabindex="0">${E(bootstrap)}</pre></details></details>
 <ol class="mission-path" aria-label="مسیر مأموریت"></ol><section class="lab-task" aria-labelledby="lab-task-title"><p class="lab-task-number" data-task-number></p><h2 id="lab-task-title" tabindex="-1"></h2><p data-concept></p><p data-task></p><details class="mission-contract"><summary>قرارداد خروجی / یک مثال مستقل</summary><pre data-example dir="ltr" tabindex="0"></pre></details><div class="mission-hints"><button type="button" data-hint class="quiet-button">یک سرنخ بده</button><p class="lab-note">راهنما XP را کم نمی‌کند.</p><div data-hints></div></div><div data-reflection hidden><label for="lab-explanation">یادداشت آزمایش تو</label><textarea id="lab-explanation" maxlength="3000" rows="4" placeholder="چه چیزی را پیش‌بینی کردی؟ نتیجه چطور بود؟"></textarea><p class="lab-note">این توضیح برای مرور تو ذخیره می‌شود. XP این تسک بر پایهٔ محاسبات است؛ معنای متن ارزیابی خودکار ندارد.</p></div><div class="lab-feedback" data-feedback role="status" aria-live="polite"></div><button type="button" class="button-forest lab-next" data-next disabled>مأموریت بعدی ←</button><div class="lab-finish" data-finish hidden><span class="mission-seal" aria-hidden="true">✓</span><h3>نخستین جست‌وجوی همسایه</h3><p>نشان پایان مأموریت را گرفتی؛ هر شش ابزار روی داده‌های تازه هم بررسی شدند.</p><a href="${E(new URL('dashboard/',new URL('../',assets)).href)}">دیدن مسیر رشد در داشبورد ←</a><details><summary>چالش آزاد پس از پایان مأموریت</summary><p>یک کپی از داده بساز و مقیاس یکی از ویژگی‌ها را در آن و پرس‌وجوها تغییر بده. پیش از اجرا حدس بزن چه اثری بر همسایه‌ها می‌گذارد؛ سپس نتیجه را در یادداشت آزمایش توضیح بده. این کاوش آزاد XP اضافه ندارد.</p></details></div></section><p class="lab-note">ورودیِ تابع در بررسی نهایی می‌تواند اندازه و مقدار تازه داشته باشد. کد ثابت برای همین جدول، همهٔ بررسی‌ها را پاس نمی‌کند.</p><a class="quiet-link" href="${E(lessonURL)}">مرور جزوهٔ اول ←</a></aside>
 <section class="lab-editor-panel" aria-label="ویرایشگر و کنسول"><div class="lab-panel-head"><span class="lab-file" lang="en">greenhouse.py</span><strong>Python + NumPy</strong></div><div class="lab-code-wrap"><pre class="lab-lines" aria-hidden="true"></pre><div class="lab-code"><pre data-highlight aria-hidden="true"></pre><textarea id="lab-code" aria-label="کد Python" aria-describedby="lab-code-help" dir="ltr" lang="en" wrap="off" spellcheck="false" autocapitalize="off" autocomplete="off" maxlength="20000"></textarea></div></div><div class="lab-actions"><button class="button-outline" data-activate type="button">فعال‌سازی Python</button><button class="button-outline" data-run type="button" disabled>اجرای آزمایشی</button><button class="button-forest" data-check type="button">بررسی و دریافت XP</button><button class="quiet-button" data-stop type="button" disabled>توقف اجرا</button><button class="quiet-button" data-reset type="button">بازنشانی تسک</button><button class="quiet-button" data-download type="button">دانلود کد ↓</button></div><p class="lab-runtime" data-runtime role="status" aria-live="polite">اجرای آزمایشی در همین مرورگر است. بررسی نهایی و XP مستقل از آن انجام می‌شوند.</p><p class="lab-runtime" id="lab-code-help">تورفتگی: Tab · اجرا: Ctrl / ⌘ + Enter · خروج از ویرایشگر: Escape سپس Tab</p><div class="lab-console"><div class="lab-console-head"><span>کنسول Python / خروجی و خطا</span><button data-clear type="button">پاک‌کردن خروجی</button></div><pre class="lab-output" data-output dir="ltr" tabindex="0" aria-label="خروجی Python"># Activate Python to explore the dataset.</pre><form class="lab-console-form"><label for="lab-command">&gt;&gt;&gt;</label><input id="lab-command" aria-label="دستور تک‌خطی Python" placeholder="X.shape" dir="ltr" lang="en" autocomplete="off" spellcheck="false" maxlength="2000" disabled><button type="submit" disabled>اجرا</button></form></div><div class="mission-award" data-award role="status" aria-live="polite" hidden></div></section></div>
 <footer class="lab-bottom"><p data-save role="status" aria-live="polite"></p><button data-refresh type="button">به‌روزرسانی پیشرفت</button><button data-cloud-load type="button">دریافت کد ذخیره‌شدهٔ حساب</button><p>XP هر تسک یک‌بار ثبت می‌شود. اجرای مجدد و استفاده از راهنما امتیاز قبلی را کم نمی‌کنند.</p></footer>`;
 root.insertAdjacentHTML('beforeend',`<dialog class="xp-celebration" data-celebration lang="en" dir="ltr" aria-labelledby="xp-celebration-title" aria-describedby="xp-celebration-message xp-celebration-detail">
 <button class="xp-celebration-close" data-celebration-close type="button" aria-label="Close celebration"><svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></button>
 <div class="xp-orbit"><svg class="xp-ring" viewBox="0 0 240 240" aria-hidden="true"><circle class="xp-ring-disc" cx="120" cy="120" r="99"/><circle class="xp-ring-track" cx="120" cy="120" r="108" pathLength="100"/><circle class="xp-ring-fill" data-celebration-ring cx="120" cy="120" r="108" pathLength="100"/></svg><span class="xp-ring-tip" aria-hidden="true"><i></i></span>
 <div class="xp-celebration-core"><span class="xp-celebration-check" aria-hidden="true"><svg viewBox="0 0 24 24" width="21" height="21"><path d="m5.5 12 4 4L18.5 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span><h2 id="xp-celebration-title"><span data-celebration-earned>+20</span> <span class="xp-celebration-unit">XP</span></h2><span class="xp-celebration-label">XP earned</span></div>
 <span class="xp-spark xp-spark-one" aria-hidden="true"></span><span class="xp-spark xp-spark-two" aria-hidden="true"></span><span class="xp-spark xp-spark-three" aria-hidden="true"></span><span class="xp-spark xp-spark-four" aria-hidden="true"></span></div>
 <p class="xp-celebration-message" id="xp-celebration-message">Nicely done!</p><p class="xp-celebration-total" id="xp-celebration-detail" data-celebration-progress role="progressbar" aria-label="Total lab XP" aria-valuemin="0" aria-valuemax="300" aria-valuenow="0"><span data-celebration-total>20</span><span class="xp-celebration-divider"> / </span><span data-celebration-maximum>300</span> XP</p>
 <button class="xp-celebration-continue" data-celebration-continue type="button" autofocus>Continue<svg viewBox="0 0 20 20" width="17" height="17" aria-hidden="true"><path d="M4 10h12m-5-5 5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button></dialog>`);
 root.querySelector('.lab-workspace').before(root.querySelector('.mission-path'));
 const $=s=>root.querySelector(s),editor=$('#lab-code'),output=$('[data-output]'),save=$('[data-save]'),explanation=$('#lab-explanation'),command=$('#lab-command');
 const alive=()=>!disposed&&isCurrent();
 const celebration=$('[data-celebration]'),celebrated=new Set(trusted.completed||[]);
 let celebrationStep=null;
 function closeCelebration(advance=false){
  const step=celebrationStep;celebrationStep=null;
  if(celebration.open)celebration.close();
  celebration.classList.remove('is-celebrating');
  if(!alive()||step===null)return;
  if(!advance){$('[data-check]').focus();return}
  if(step<stages.length-1&&step+1<=available(trusted)){state.active=step+1;select(true);change()}
  else if(trusted.badge){const title=$('[data-finish] h3');title.setAttribute('tabindex','-1');title.focus()}
 }
 function showCelebration(task,added,before){
  const maximum=Number(trusted.maximum)||300,to=Math.min(maximum,Math.max(0,Number(trusted.xp)||0)),from=Math.min(to,Math.max(0,before));
  if(celebrated.has(task)||added<=0||to<=from)return;
  celebrated.add(task);
  const award=$('[data-award]');award.hidden=false;award.textContent=`+${added} XP · XP earned`;award.setAttribute('lang','en');award.setAttribute('dir','ltr');
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
 function feedback(text,error=false){$('[data-feedback]').textContent=text;$('[data-feedback]').dataset.error=String(error)}
 function persist(){try{localStorage.setItem(key,JSON.stringify({state,dirty,revision,pending}));return true}catch{save.textContent='ذخیرهٔ مرورگر ممکن نیست؛ پیش از خروج، کدت را دانلود کن.';return false}}
 function change(){dirty=true;changed++;persist();clearTimeout(autosave);if(conflict)save.textContent='نسخهٔ حساب در پنجرهٔ دیگری تغییر کرده؛ کد محلی حفظ شده است. ابتدا آن را دانلود و سپس نسخهٔ حساب را دریافت کن.';else{save.textContent='تغییرها در صف ذخیره‌اند…';autosave=setTimeout(flush,1000)}}
 async function flush(){
  if(!alive()||saving||cloudLoading||!dirty||conflict)return;
  saving=true;const serial=changed;
  try{const remote=await saveDraft(JSON.parse(JSON.stringify(state)),revision);if(!alive())return;revision=Number(remote.revision);applyTrusted(remote);if(changed===serial){dirty=false;save.textContent='کد و یادداشت آزمایش در حساب ذخیره شد.'}persist()}
  catch(error){if(!alive())return;conflict=/LAB_PROGRESS_CONFLICT/.test(String(error?.message));save.textContent=conflict?'نسخهٔ حساب تغییر کرده است. کد محلی را دانلود کن؛ سپس نسخهٔ حساب را دریافت کن.':'ذخیره در حساب کامل نشد؛ کد همین مرورگر حفظ شده است. اتصال را بررسی کن.'}
  finally{saving=false;if(alive()&&dirty&&!conflict&&changed!==serial)autosave=setTimeout(flush,1000)}
 }
 function applyTrusted(remote){trusted={...remote,xp:Math.max(Number(trusted.xp||0),Number(remote.xp||0)),completed:[...new Set([...(trusted.completed||[]),...(remote.completed||[])])]};progress()}
 function progress(){
  const completed=new Set(trusted.completed||[]),limit=available(trusted),busy=checking||['loading','running'].includes(phase);
  $('[data-xp]').textContent=Number(trusted.xp||0).toLocaleString('fa-IR');$('progress').value=Number(trusted.xp||0);$('[data-count]').textContent=`${completed.size.toLocaleString('fa-IR')} از ۶ مأموریت انجام شده`;
  $('.mission-path').innerHTML=stages.map((s,i)=>`<li><button data-stage="${i}" type="button" ${i>limit||busy?'disabled':''} ${i===state.active?'aria-current="step"':''} data-done="${completed.has(s.id)}"><span class="mission-step-number">${completed.has(s.id)?'✓':(i+1).toLocaleString('fa-IR')}</span><span>${E(s.title)}</span><b dir="ltr">${s.xp} XP</b></button></li>`).join('');
  $('[data-next]').hidden=state.active===5;$('[data-next]').disabled=!completed.has(stages[state.active].id)||busy;$('[data-finish]').hidden=!trusted.badge;
 }
 function sync(){const pre=$('[data-highlight]');pre.scrollTop=editor.scrollTop;pre.scrollLeft=editor.scrollLeft;$('.lab-lines').scrollTop=editor.scrollTop}
 function paint(){ $('[data-highlight]').innerHTML=highlight(editor.value)+'\n';$('.lab-lines').textContent=editor.value.split('\n').map((_,i)=>i+1).join('\n');sync() }
 function hints(){const n=state.hints[state.active];$('[data-hints]').innerHTML=stages[state.active].hints.slice(0,n).map((h,i)=>`<p><b>${i+1}.</b> ${E(h)}</p>`).join('');$('[data-hint]').disabled=n>=3;$('[data-hint]').textContent=n===0?'یک سرنخ بده':n===3?'هر سه سرنخ نمایش داده شدند':'سرنخ بعدی'}
 function select(focus=false){
  const s=stages[state.active];if(!state.codes[state.active])state.codes[state.active]=(state.active?state.codes[state.active-1]:'')+s.starter;
  editor.value=state.codes[state.active];explanation.value=state.explanation;hasRun=false;
  $('[data-task-number]').textContent=`مأموریت ${(state.active+1).toLocaleString('fa-IR')} از ۶ · ${s.xp.toLocaleString('fa-IR')} XP`;
  $('#lab-task-title').textContent=s.title;$('[data-concept]').textContent=s.concept;$('[data-task]').innerHTML=s.task;$('[data-example]').textContent=s.example;$('[data-reflection]').hidden=state.active!==5;
  feedback((trusted.completed||[]).includes(s.id)?'این تسک قبلاً XP گرفته است. می‌توانی کدت را تغییر بدهی و دوباره آزمایش کنی.':'مسئله را بخوان، راه‌حلت را بساز و برای بررسی نهایی ارسال کن.');
  output.textContent='# Run your code to explore this task.';outputSize=0;hints();paint();controls();if(focus)$('#lab-task-title').focus()
 }
 function controls(message){
  const busy=checking||['loading','running'].includes(phase);
  editor.readOnly=explanation.disabled=busy;$('[data-check]').disabled=busy;$('[data-run]').disabled=busy||phase!=='ready';$('[data-activate]').hidden=!!worker;$('[data-activate]').disabled=busy;$('[data-stop]').disabled=!['loading','running'].includes(phase);$('[data-reset]').disabled=busy;$('[data-cloud-load]').disabled=busy||saving||cloudLoading;
  command.disabled=$('.lab-console-form button').disabled=busy||phase!=='ready'||!hasRun;
  if(message)$('[data-runtime]').textContent=message;root.setAttribute('aria-busy',String(busy));progress()
 }
 function append(text){const slice=String(text).slice(0,16000-outputSize);outputSize+=slice.length;output.textContent+=slice;output.scrollTop=output.scrollHeight}
 function terminate(){clearTimeout(timer);epoch++;worker?.terminate();worker=null;hasRun=false;phase='idle'}
 function fail(message){terminate();controls(message)}
 $('[data-activate]').onclick=()=>{
  if(!alive()||checking||worker)return;
  try{worker=new Worker(new URL('coding-lab-worker.mjs?v=3.0.3',assets),{type:'module'});const generation=++epoch;phase='loading';controls('در حال آماده‌سازی Python و NumPy…');timer=setTimeout(()=>fail('بارگذاری کامل نشد؛ اتصال را بررسی و دوباره فعال‌سازی کن.'),120000);
   worker.onerror=e=>{e.preventDefault?.();if(alive()&&generation===epoch)fail('محیط محلی دریافت نشد؛ اتصال اینترنت را بررسی کن. بررسی نهایی سرور مستقل از این محیط است.')};
   worker.onmessage=({data})=>{if(!alive()||generation!==epoch||data?.request!==activeRequest)return;
    if(data.type==='stage')controls('Python آماده است؛ در حال دریافت NumPy…');
    if(data.type==='ready'){clearTimeout(timer);phase='ready';controls('محیط محلی آماده است؛ کدت را آزمایش کن.')}
    if(data.type==='load-error'){fail('دریافت محیط کامل نشد؛ اتصال را بررسی کن.');return}
    if(phase!=='running')return;
    if(data.type==='output')append(data.text);
    if(data.type==='error'||data.type==='done'){clearTimeout(timer);if(data.type==='error')append('\n'+data.text);if(!output.textContent)output.textContent='# Finished. No printed output.\n';hasRun=true;phase='ready';controls('اجرای آزمایشی پایان یافت. برای ثبت XP، پاسخ را برای بررسی نهایی ارسال کن.')}
   };activeRequest=++request;worker.postMessage({type:'init',request:activeRequest})
  }catch{fail('محیط محلی باز نشد؛ مرورگر و اتصال را بررسی کن.')}
 };
 function run(type,code=editor.value){if(!alive()||phase!=='ready'||checking||!code.trim())return;if(type==='console')append('>>> '+code+'\n');else{output.textContent='';outputSize=0}phase='running';controls('در حال اجرای محلی… حداکثر ۱۵ ثانیه.');activeRequest=++request;timer=setTimeout(()=>{append('\n[Stopped: time limit]\n');fail('اجرا پس از ۱۵ ثانیه متوقف شد. کدت را بررسی و محیط را دوباره فعال کن.')},15000);worker.postMessage({type,code,bootstrap:type==='console'?undefined:bootstrap,request:activeRequest})}
 $('[data-run]').onclick=()=>run('run');$('[data-stop]').onclick=()=>{terminate();append('\n[Stopped]\n');controls('اجرای محلی متوقف شد؛ کد حفظ شده است.')};
 $('.lab-console-form').onsubmit=e=>{e.preventDefault();if(hasRun){const code=command.value;command.value='';run('console',code)}};
 $('[data-clear]').onclick=()=>{output.textContent='';outputSize=0};editor.addEventListener('scroll',sync);
 editor.oninput=()=>{state.codes[state.active]=editor.value;hasRun=false;change();paint();controls()};
 let escapeTab=false;editor.onkeydown=e=>{if(e.key==='Escape'){escapeTab=true;return}if(e.key==='Tab'&&!escapeTab&&!editor.readOnly){e.preventDefault();if(editor.value.length-(editor.selectionEnd-editor.selectionStart)+4<=20000){editor.setRangeText('    ',editor.selectionStart,editor.selectionEnd,'end');editor.dispatchEvent(new Event('input'))}}else if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();$('[data-run]').click()}escapeTab=false};
 explanation.oninput=()=>{state.explanation=explanation.value;change()};
 $('[data-hint]').onclick=()=>{if(state.hints[state.active]<3){state.hints[state.active]++;hints();change()}};
 $('.mission-path').onclick=e=>{const b=e.target.closest('[data-stage]');if(!b||b.disabled)return;state.active=Number(b.dataset.stage);select(true);change()};
 $('[data-next]').onclick=()=>{if(state.active<available(trusted)&&state.active<5){state.active++;select(true);change()}};
 $('[data-reset]').onclick=()=>{if(!confirm('کد این تسک با قالب آغازین جایگزین شود؟ XP قبلی حفظ می‌شود.'))return;state.codes[state.active]=(state.active?state.codes[state.active-1]:'')+stages[state.active].starter;select();change()};
 $('[data-download]').onclick=()=>{const text=bootstrap+'\n'+editor.value+'\n# Reflection\n'+state.explanation.split('\n').map(l=>'# '+l).join('\n'),href=URL.createObjectURL(new Blob([text],{type:'text/x-python;charset=utf-8'})),a=document.createElement('a');a.href=href;a.download=`greenhouse-${stages[state.active].id}.py`;a.click();setTimeout(()=>URL.revokeObjectURL(href),1000)};
 function pollDelay(ms,signal){return new Promise((resolve,reject)=>{const cancel=()=>{clearTimeout(pollTimer);reject(new Error('Aborted'))};signal.addEventListener('abort',cancel,{once:true});pollTimer=setTimeout(()=>{signal.removeEventListener('abort',cancel);resolve()},ms)})}
 $('[data-check]').onclick=async()=>{
  if(!alive()||checking||['loading','running'].includes(phase))return;
  if(!editor.value.trim()){feedback('ابتدا تابع موردنیاز را بنویس.',true);return}
  const task=stages[state.active].id,code=editor.value,xpBefore=Number(trusted.xp||0);
  if(!pending||pending.task!==task||pending.code!==code)pending={task,code,request_id:crypto.randomUUID()};
  persist();$('[data-award]').hidden=true;checking=true;controller=new AbortController();controls('در حال بررسی مستقل روی ورودی‌های تازه… ممکن است نخستین بررسی کمی بیشتر طول بکشد.');feedback('پاسخ برای بررسی ارسال شد؛ XP پس از تأیید ثبت می‌شود.');
  try{
   let result=await submit({mission:missionId,...pending},controller.signal);
   for(let i=0;result?.status==='running'&&i<40;i++){await pollDelay(1500,controller.signal);const found=await getAttempt(pending.request_id);if(found)result=found}
   if(!alive())return;
   if(result?.status==='running'){feedback('بررسی هنوز کامل نشده است. کمی بعد همین پاسخ را دوباره بررسی کن؛ امتیاز تکراری ثبت نمی‌شود.');return}
   if(!result?.snapshot||!['passed','failed','error'].includes(result.status))throw Error('INVALID_SERVER_RESPONSE');
   applyTrusted(result.snapshot);pending=null;persist();feedback(result.message||'بررسی پایان یافت.',result.status!=='passed');
   if(result.status==='passed'&&Number(result.xp_added)>0)showCelebration(task,Number(result.xp_added),xpBefore);
  }catch(error){if(alive())feedback(String(error?.message||'بررسی کامل نشد؛ کد حفظ شده است. دوباره تلاش کن.'),true)}
  finally{checking=false;if(alive())controls('اجرای آزمایشی برای کشف مسئله است؛ XP ثبت‌شده را بالای صفحه می‌بینی.')}
 };
 $('[data-refresh]').onclick=async()=>{try{const remote=await refresh();if(alive()){applyTrusted(remote);feedback('پیشرفت ثبت‌شدهٔ حساب دریافت شد.')}}catch{if(alive())feedback('دریافت پیشرفت کامل نشد؛ اتصال را بررسی کن.',true)}};
 $('[data-cloud-load]').onclick=async()=>{
  if(saving||checking||cloudLoading||['running','loading'].includes(phase))return;
  if(dirty&&!confirm('کد محلی با نسخهٔ حساب جایگزین شود؟ برای نگهداری تغییرها، ابتدا کدت را دانلود کن.'))return;
  cloudLoading=true;clearTimeout(autosave);const before=changed;controls();
  try{const remote=await refresh();if(!alive())return;if(changed!==before){save.textContent='هنگام دریافت، کدت تغییر کرد؛ تغییرهای تازه حفظ شدند.';return}applyTrusted(remote);revision=Number(remote.revision);conflict=false;if(remote.draft){state=normalize(remote.draft);state.active=Math.min(state.active,available(trusted));dirty=false;persist();select();save.textContent='کد ذخیره‌شدهٔ حساب دریافت شد.'}else{dirty=true;changed++;cloudLoading=false;await flush()}}
  catch{if(alive())save.textContent='نسخهٔ حساب دریافت نشد؛ کد محلی حفظ شده است.'}
  finally{cloudLoading=false;if(alive())controls()}
 };
 function pagehide(){closeCelebration();persist();controller?.abort();terminate();if(alive())controls('برای ادامه محیط محلی را دوباره فعال کن.')}
 function dispose(){if(disposed)return;disposed=true;closeCelebration();clearTimeout(autosave);clearTimeout(pollTimer);controller?.abort();terminate();window.removeEventListener('pagehide',pagehide);if(current?.dispose===dispose)current=null}
 window.addEventListener('pagehide',pagehide);select();persist();save.textContent=conflict?'نسخهٔ محلی با حساب تفاوت دارد؛ کدت را دانلود و سپس نسخهٔ حساب را دریافت کن.':dirty?'تغییرهای ذخیره‌نشدهٔ این مرورگر بازیابی شدند.':'کد و یادداشت آزمایش خودکار در حساب ذخیره می‌شوند.';return current
}
window.ClassNotesCodingLab={mount,dispose:()=>current?.dispose()};
})();
