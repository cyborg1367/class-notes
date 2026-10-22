(function () {
  'use strict';
  let current;
  const escape = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  async function mount(root, options) {
    current?.dispose();
    const {userId,lessonId,bootstrap,assets,lessonURL,rpc,isCurrent} = options;
    if(!userId || lessonId!=='machine-learning/vector-distance' || !isCurrent()) return;
    const {stages,normalize,invalidate,complete,advance,highlight} = await import(new URL('coding-lab-model.mjs?v=2.8.0',assets));
    if(!isCurrent())return;
    let disposed=false, worker=null, phase='idle', timer, autosave, epoch=0, request=0, runId=0, hasRun=false, outputSize=0;
    let revision=0, cloudEnabled=true, conflict=false, saving=false, cloudLoading=false, changed=0, dirty=false;
    const key=`classroom-coding-lab:${userId}:${lessonId}:v1`;
    let cached=null;
    try{cached=JSON.parse(localStorage.getItem(key)||'null');}catch{}
    let state=normalize(cached?.state), initialNotice='';
    current={dispose};
    try {
      const remote=await rpc({p_lesson:lessonId});
      if(disposed||!isCurrent())return;
      revision=Number(remote?.revision||0);
      if(cached?.dirty){dirty=true;conflict=Number(cached.revision)!==revision;initialNotice=conflict?'نسخهٔ حساب بعد از آخرین ذخیرهٔ این مرورگر تغییر کرده است. تغییرهای محلی بازیابی شدند؛ ابتدا کد را دانلود کن، سپس نسخهٔ حساب را دریافت کن. ذخیرهٔ خودکار تا آن زمان متوقف است.':'نسخهٔ ذخیره‌نشدهٔ همین مرورگر بازیابی شد. برای دریافت نسخهٔ حساب، از دکمهٔ پایین صفحه استفاده کن.';}
      else if(remote?.state)state=normalize(remote.state);
      else if(cached?.state)dirty=true;
    }catch { cloudEnabled=false;initialNotice='ذخیره در حساب در دسترس نیست؛ کد و پیشرفت فقط در همین مرورگر نگه داشته می‌شوند. برای تلاش دوباره، دکمهٔ «دریافت نسخهٔ حساب» را بزن؛ اگر مشکل ادامه داشت با مدرس در میان بگذار.'; }
    if(disposed||!isCurrent())return;
    root.innerHTML=`<header class="lab-top"><div><p class="lab-kicker" lang="en" dir="ltr">LEARNING LAB / 01</p><h1>از داده تا نزدیک‌ترین همسایه</h1><p>هفت قدم با Python و NumPy · جزوهٔ اول</p></div><div class="lab-progress"><strong data-progress></strong><progress max="7" value="0" aria-label="مراحل انجام‌شده"></progress></div></header>
      <div class="lab-workspace"><aside class="lab-instructions" aria-label="مسیر تمرین"><ol class="lab-steps" aria-label="مراحل لابراتور"></ol><section class="lab-task" aria-labelledby="lab-task-title"><p class="lab-task-number" data-step-label></p><h2 id="lab-task-title" tabindex="-1"></h2><p data-concept></p><p data-task></p><details data-hint><summary>یک راهنمای کوچک</summary><p data-hint-text></p></details><div data-reflection hidden><label for="lab-explanation">چه چیزی تغییر کرد و چرا؟</label><textarea id="lab-explanation" maxlength="3000" rows="4" placeholder="فاصله‌ها یا ترتیب همسایه‌ها را مقایسه کن؛ دست‌کم یک جمله بنویس."></textarea><p class="lab-note">محاسبه‌ها خودکار بررسی می‌شوند. توضیح تو ذخیره می‌شود؛ معنای متن در این نسخه ارزیابی خودکار ندارد.</p></div><div class="lab-feedback" role="status" aria-live="polite" data-feedback>از مرحلهٔ اول شروع کن.</div><button class="button-forest lab-next" type="button" data-next disabled>مرحلهٔ بعد ←</button><div class="lab-finish" data-finish hidden><strong>هر هفت مرحله را انجام دادی ✓</strong><p>می‌توانی به جزوه برگردی یا کدت را دانلود و آزمایش را ادامه بدهی.</p><a href="${escape(lessonURL)}">بازگشت به جزوه ←</a></div></section><details class="lab-data"><summary>مشاهدهٔ داده‌های آماده</summary><pre dir="ltr" tabindex="0">${escape(bootstrap)}</pre></details><p class="lab-note">هر اجرای ویرایشگر از داده‌های اولیه شروع می‌شود. کنسول روی متغیرهای آخرین اجرا کار می‌کند؛ بررسی پاسخ همیشه کد ویرایشگر را از نو اجرا می‌کند.</p><a class="quiet-link" href="${escape(lessonURL)}">مرور جزوهٔ اول ←</a></aside>
      <section class="lab-editor-panel" aria-label="ویرایشگر و کنسول Python"><div class="lab-panel-head"><span class="lab-file" lang="en">practice.py</span><strong>Python + NumPy</strong></div><div class="lab-code-wrap"><pre class="lab-lines" aria-hidden="true"></pre><div class="lab-code"><pre data-highlight aria-hidden="true"></pre><textarea id="lab-code" aria-label="کد Python" aria-describedby="lab-code-help" dir="ltr" lang="en" wrap="off" spellcheck="false" autocapitalize="off" autocomplete="off" maxlength="20000"></textarea></div></div><div class="lab-actions"><button type="button" class="button-forest" data-activate>فعال‌سازی Python</button><button type="button" class="button-outline" data-run disabled>اجرای کد</button><button type="button" class="button-forest" data-check disabled>بررسی پاسخ ✓</button><button type="button" class="quiet-button" data-stop disabled>توقف</button><button type="button" class="quiet-button" data-reset>بازنشانی مرحله</button><button type="button" class="quiet-button" data-download>دانلود کد ↓</button></div><p class="lab-runtime" data-runtime role="status" aria-live="polite">محیط فقط با کلیک تو دریافت می‌شود. نخستین بار به اینترنت و کمی زمان نیاز دارد.</p><p class="lab-runtime" id="lab-code-help">تورفتگی: Tab · اجرای کد: Ctrl / ⌘ + Enter · خروج از ویرایشگر: Escape سپس Tab</p><div class="lab-console"><div class="lab-console-head"><span>کنسول Python / خروجی و خطا</span><button type="button" data-clear>پاک‌کردن خروجی</button></div><pre class="lab-output" data-output dir="ltr" tabindex="0" aria-label="خروجی Python"># Activate Python, then run your code.</pre><form class="lab-console-form"><label for="lab-command" aria-label="دستور Python">&gt;&gt;&gt;</label><input id="lab-command" dir="ltr" lang="en" aria-label="دستور تک‌خطی Python" placeholder="X.shape" autocomplete="off" spellcheck="false" maxlength="2000" disabled><button type="submit" disabled>اجرا</button></form></div></section></div>
      <footer class="lab-bottom"><p data-save role="status" aria-live="polite"></p><button type="button" data-cloud-load>دریافت نسخهٔ حساب</button><p>این لابراتور برای تمرین است؛ تیک‌ها نمرهٔ رسمی آزمون نیستند.</p></footer>`;
    const $=s=>root.querySelector(s), editor=$('#lab-code'), lines=$('.lab-lines'), marked=$('[data-highlight]'), output=$('[data-output]'), explanation=$('#lab-explanation'), command=$('#lab-command');
    const run=$('[data-run]'), check=$('[data-check]'), activate=$('[data-activate]'), stop=$('[data-stop]'), reset=$('[data-reset]'), next=$('[data-next]'), save=$('[data-save]');
    function alive(){return !disposed&&isCurrent();}
    function feedback(message,error=false){$('[data-feedback]').textContent=message;$('[data-feedback]').dataset.error=String(error);}
    function localSave(){
      try{localStorage.setItem(key,JSON.stringify({state,dirty,revision}));return true;}
      catch{save.textContent='ذخیره در این مرورگر ممکن نیست؛ پیش از خروج کدت را دانلود کن.';return false;}
    }
    function change(){
      dirty=true;changed++;localSave();clearTimeout(autosave);
      if(cloudEnabled&&!conflict){save.textContent='تغییرها در صف ذخیرهٔ حساب‌اند…';autosave=setTimeout(flush,1000);}
      else if(conflict)save.textContent='نسخهٔ حساب در پنجرهٔ دیگری تغییر کرده است. برای جلوگیری از جایگزینی آن، ذخیره متوقف شد؛ کدت را دانلود کن و سپس نسخهٔ حساب را دریافت کن.';
      else save.textContent='ذخیرهٔ آنلاین در دسترس نیست؛ تغییرها فقط در همین مرورگر نگه داشته می‌شوند.';
    }
    async function flush(){
      if(!alive()||saving||cloudLoading||!dirty||!cloudEnabled||conflict)return;
      saving=true;const serial=changed,snapshot=JSON.parse(JSON.stringify(state));
      try{
        const remote=await rpc({p_lesson:lessonId,p_state:snapshot,p_revision:revision});
        if(!alive())return;
        revision=Number(remote.revision);
        if(changed===serial){dirty=false;save.textContent='کد و پیشرفت در حساب ذخیره شد؛ می‌توانی بعداً از همین‌جا ادامه بدهی.';}else save.textContent='در حال ذخیرهٔ تغییرهای تازه…';
        localSave();
      }catch(err){
        if(!alive())return;
        conflict=/LAB_PROGRESS_CONFLICT/.test(String(err?.message));
        save.textContent=conflict?'نسخهٔ حساب در پنجرهٔ دیگری تغییر کرده است. کدت را دانلود کن؛ سپس با «دریافت نسخهٔ حساب» ادامه بده.':'ذخیره در حساب کامل نشد؛ نسخهٔ مرورگر حفظ شده است. اتصال را بررسی کن؛ با تغییر بعدی دوباره تلاش می‌شود.';
      }finally{saving=false;if(alive()&&dirty&&!conflict&&changed!==serial)autosave=setTimeout(flush,1000);}
    }
    function paintCode(){marked.innerHTML=highlight(editor.value)+'\n';lines.textContent=Array.from({length:editor.value.split('\n').length},(_,i)=>i+1).join('\n');syncScroll();}
    function syncScroll(){marked.scrollTop=editor.scrollTop;marked.scrollLeft=editor.scrollLeft;lines.scrollTop=editor.scrollTop;}
    function progress(){
      $('[data-progress]').textContent=`${state.passed.toLocaleString('fa-IR')} از ۷ مرحله`;$('progress').value=state.passed;
      $('.lab-steps').innerHTML=stages.map((s,i)=>`<li><button type="button" data-step="${i}" title="${escape(s.title)}" aria-label="مرحلهٔ ${i+1}: ${escape(s.title)}${i<state.passed?'، انجام‌شده':''}" ${i===state.active?'aria-current="step"':''} data-passed="${i<state.passed}" ${i>state.passed?'disabled':''}>${i<state.passed?'✓':(i+1).toLocaleString('fa-IR')}</button></li>`).join('');
      next.hidden=state.active===6;next.disabled=state.active>=state.passed||phase==='running'||phase==='loading';
      $('[data-finish]').hidden=state.passed<7;
    }
    function selectStage(focus=false){
      const s=stages[state.active];editor.value=state.codes[state.active];explanation.value=state.explanation;hasRun=false;
      $('[data-step-label]').textContent=`مرحلهٔ ${(state.active+1).toLocaleString('fa-IR')} از ۷`;
      $('#lab-task-title').textContent=s.title;$('[data-concept]').textContent=s.concept;$('[data-task]').innerHTML=s.task;$('[data-hint-text]').textContent=s.hint;
      $('[data-hint]').open=false;$('[data-reflection]').hidden=state.active!==6;
      feedback(state.active<state.passed?'این مرحله انجام شده است. ویرایش کد، بررسی دوبارهٔ این مرحله و مراحل بعد را لازم می‌کند.':'کدت را بنویس، اجرا کن و سپس «بررسی پاسخ» را بزن.');
      output.textContent='# Run your editor code to start this stage.';outputSize=0;paintCode();setPhase(phase);progress();if(focus)$('#lab-task-title').focus();
    }
    function setPhase(value,message){
      phase=value;const busy=['loading','running'].includes(value);
      run.disabled=check.disabled=value!=='ready';activate.hidden=!!worker&&value!=='idle';activate.disabled=busy;
      stop.disabled=!busy;reset.disabled=busy;editor.readOnly=busy;explanation.disabled=busy;
      command.disabled=$('.lab-console-form button').disabled=value!=='ready'||!hasRun;
      if(message)$('[data-runtime]').textContent=message;
      root.setAttribute('aria-busy',String(busy));progress();
    }
    function append(text){
      const str=String(text).slice(0,16000-outputSize);outputSize+=str.length;output.textContent+=str;output.scrollTop=output.scrollHeight;
    }
    function terminate(){clearTimeout(timer);timer=null;epoch++;worker?.terminate();worker=null;hasRun=false;}
    function fail(message){terminate();setPhase('idle',message);}
    activate.onclick=()=>{
      if(!alive()||phase==='loading'||phase==='running')return;
      if(typeof Worker==='undefined'){feedback('مرورگر از اجرای Python پشتیبانی نمی‌کند؛ مرورگر را به‌روز کن یا کدت را دانلود کن.',true);return;}
      try{
        worker=new Worker(new URL('coding-lab-worker.mjs?v=2.8.0',assets),{type:'module'});const generation=++epoch;
        setPhase('loading','در حال دریافت Python…');timer=setTimeout(()=>fail('بارگذاری کامل نشد. اتصال اینترنت را بررسی کن و دوباره فعال‌سازی را بزن؛ کدت حفظ شده است.'),120000);
        worker.onerror=e=>{e.preventDefault?.();if(alive()&&generation===epoch)fail('محیط دریافت نشد. اتصال اینترنت را بررسی و دوباره فعال‌سازی کن.');};
        worker.onmessage=({data})=>{
          if(!alive()||generation!==epoch||!data||data.request!==runId)return;
          if(data.type==='stage')setPhase('loading','Python آماده است؛ در حال دریافت NumPy…');
          if(data.type==='ready'){clearTimeout(timer);setPhase('ready','محیط آماده است. کدت را اجرا کن یا پاسخ را بررسی کن.');}
          if(data.type==='load-error'){fail('دریافت محیط کامل نشد. اتصال به CDN را بررسی کن؛ کدت حفظ شده است.');return;}
          if(phase!=='running')return;
          if(data.type==='output')append(data.text);
          if(data.type==='error'){clearTimeout(timer);append('\n'+data.text);hasRun=true;setPhase('ready','کد خطا دارد؛ پیام Python را در کنسول ببین.');feedback('کد به پایان نرسید؛ خطای کنسول را اصلاح کن و دوباره بررسی کن.',true);}
          if(data.type==='done'||data.type==='checked'){
            clearTimeout(timer);hasRun=true;
            if(data.type==='checked'){
              if(data.verdict?.ok){complete(state);change();feedback(state.active===6?'محاسبه‌ها درست‌اند و توضیحت ذخیره می‌شود. معنای توضیح به‌طور خودکار ارزیابی نمی‌شود.':data.verdict.message);}
              else feedback(data.verdict?.message||'پاسخ هنوز کامل نیست.',true);
            }
            if(!output.textContent)output.textContent='# Finished. No printed output.\n';
            setPhase('ready',data.type==='checked'?'بررسی پایان یافت. بازخورد مرحله را بخوان.':'اجرا پایان یافت. برای تیک‌خوردن مرحله «بررسی پاسخ» را بزن.');
          }
        };
        runId=++request;worker.postMessage({type:'init',request:runId});
      }catch{fail('محیط اجرا باز نشد؛ مرورگر و اتصال را بررسی کن.');}
    };
    function execute(type,code=editor.value){
      if(!alive()||phase!=='ready'||!worker)return;
      if(!code.trim()){feedback('ابتدا کدی بنویس.',true);return;}
      if(type==='check'&&state.active===6&&state.explanation.trim().length<30){feedback('برای مرحلهٔ آخر، یک توضیح دست‌کم ۳۰ حرفی دربارهٔ مقایسهٔ دو پرس‌وجو بنویس.',true);explanation.focus();return;}
      if(type!=='console'){output.textContent='';outputSize=0;}
      else append('>>> '+code+'\n');
      setPhase('running','در حال اجرا… حداکثر زمان هر اجرا ۱۵ ثانیه است.');runId=++request;
      timer=setTimeout(()=>{append('\n[Stopped: 15-second time limit]\n');fail('اجرا پس از ۱۵ ثانیه متوقف شد. حلقه‌ها را بررسی و محیط را دوباره فعال کن.');},15000);
      worker.postMessage({type,code,bootstrap:type==='console'?undefined:bootstrap,stage:state.active,request:runId});
    }
    run.onclick=()=>execute('run');check.onclick=()=>execute('check');
    stop.onclick=()=>{terminate();setPhase('idle','محیط متوقف شد؛ کدت حفظ شده است. برای ادامه دوباره فعال‌سازی کن.');append('\n[Stopped]\n');};
    $('.lab-console-form').onsubmit=e=>{e.preventDefault();if(hasRun){const text=command.value;command.value='';execute('console',text);}};
    $('[data-clear]').onclick=()=>{output.textContent='';outputSize=0;};
    editor.addEventListener('scroll',syncScroll);
    editor.oninput=()=>{state.codes[state.active]=editor.value;invalidate(state);hasRun=false;change();paintCode();setPhase(phase);feedback('کد تغییر کرد؛ برای تأیید، دوباره بررسی پاسخ را بزن.');};
    let tabEscape=false;
    editor.onkeydown=e=>{
      if(e.key==='Escape'){tabEscape=true;return;}
      if(e.key==='Tab'&&!tabEscape&&!editor.readOnly){e.preventDefault();const a=editor.selectionStart,b=editor.selectionEnd;if(editor.value.length-(b-a)+4>20000)return;editor.setRangeText('    ',a,b,'end');editor.dispatchEvent(new Event('input'));}
      else if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();run.click();}
      if(e.key!=='Escape')tabEscape=false;
    };
    explanation.oninput=()=>{state.explanation=explanation.value;invalidate(state);change();progress();feedback('توضیح تغییر کرد؛ برای تکمیل مرحله دوباره بررسی پاسخ را بزن.');};
    $('.lab-steps').onclick=e=>{const b=e.target.closest('[data-step]');if(!b||b.disabled||['running','loading'].includes(phase))return;state.active=Number(b.dataset.step);change();selectStage(true);};
    next.onclick=()=>{if(advance(state)){change();selectStage(true);}};
    reset.onclick=()=>{
      if(!confirm('کد این مرحله با کد آغازین جایگزین شود؟ تیک این مرحله و مرحله‌های بعد پاک می‌شود.'))return;
      state.codes[state.active]=(state.active?state.codes[state.active-1]:'')+stages[state.active].starter;invalidate(state);change();selectStage();editor.focus();
    };
    $('[data-download]').onclick=()=>{
      const text=bootstrap+'\n\n'+editor.value+'\n\n# Reflection\n'+state.explanation.split('\n').map(l=>'# '+l).join('\n');
      const href=URL.createObjectURL(new Blob([text],{type:'text/x-python;charset=utf-8'})),a=document.createElement('a');a.href=href;a.download=`vector-distance-lab-step-${state.active+1}.py`;a.click();setTimeout(()=>URL.revokeObjectURL(href),1000);
    };
    $('[data-cloud-load]').onclick=async()=>{
      if(saving||['loading','running'].includes(phase))return;
      if(dirty&&!confirm('تغییرهای ذخیره‌نشدهٔ همین مرورگر با نسخهٔ حساب جایگزین شوند؟ اگر به آن‌ها نیاز داری ابتدا کد را دانلود کن.'))return;
      const button=$('[data-cloud-load]'),before=changed;button.disabled=true;cloudLoading=true;clearTimeout(autosave);
      try{
        const remote=await rpc({p_lesson:lessonId});if(!alive())return;
        if(changed!==before){save.textContent='هنگام دریافت، کدت تغییر کرد؛ تغییرهای تازه حفظ شدند. برای دریافت نسخهٔ حساب دوباره تلاش کن.';return;}
        cloudEnabled=true;conflict=false;revision=Number(remote?.revision||0);
        if(!remote?.state){save.textContent='نسخه‌ای در حساب وجود ندارد؛ نسخهٔ فعلی را در حساب ذخیره می‌کنیم.';dirty=true;changed++;cloudLoading=false;await flush();return;}
        state=normalize(remote.state);dirty=false;changed++;localSave();selectStage();save.textContent='نسخهٔ حساب دریافت شد.';
      }catch{if(alive())save.textContent='نسخهٔ حساب دریافت نشد؛ تغییرهای فعلی حفظ شدند. اتصال را بررسی کن؛ اگر مشکل ادامه داشت با مدرس در میان بگذار.';}
      finally{cloudLoading=false;if(alive())button.disabled=false;}
    };
    function pagehide(){localSave();terminate();if(alive())setPhase('idle','محیط برای خروج از صفحه متوقف شد؛ دوباره فعال‌سازی کن.');}
    function dispose(){if(disposed)return;disposed=true;clearTimeout(autosave);terminate();window.removeEventListener('pagehide',pagehide);if(current?.dispose===dispose)current=null;}
    window.addEventListener('pagehide',pagehide);
    selectStage();localSave();save.textContent=initialNotice||(cloudEnabled?'کد و پیشرفت به‌صورت خودکار در حساب ذخیره می‌شوند.':'ذخیره فقط در همین مرورگر فعال است.');
    if(dirty&&cloudEnabled&&!cached?.dirty)autosave=setTimeout(flush,1000);
    return current;
  }
  window.ClassNotesCodingLab={mount,dispose:()=>current?.dispose()};
})();
