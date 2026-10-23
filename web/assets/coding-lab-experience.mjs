// Presentation only: introduction and feedback never grant XP or unlock tasks.
const escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const messages={
 SIGN_IN_REQUIRED:['ورود دوباره لازم است','نشست ورود معتبر نیست. دوباره وارد حساب خودت شو.','کد محلی حفظ شده است.'],
 CLASS_ACCESS_REQUIRED:['دسترسی کلاس را بررسی کن','عضویت فعال کلاس برای بررسی پاسخ لازم است.','وضعیت عضویت را در داشبورد ببین یا با مدرس در میان بگذار.'],
 LAB_RATE_LIMIT:['کمی صبر کن','تعداد بررسی‌های اخیر یا اجراهای هم‌زمان به سقف مجاز رسیده است.','چند لحظه بعد دوباره تلاش کن؛ کدت حفظ شده است.'],
 LAB_BUDGET_EXHAUSTED:['سهمیهٔ بررسی فعلاً تمام شده','سقف مصرف مشترک محیط بررسی پر شده است. این نتیجه به معنی اشتباه بودن کدت نیست.','اجرای محلی در دسترس است؛ برای بررسی نهایی با مدرس در میان بگذار.'],
 LAB_PAUSED:['بررسی نهایی موقتاً متوقف است','مدرس محیط بررسی را موقتاً متوقف کرده است.','می‌توانی کدت را محلی اجرا و ذخیره کنی.'],
 REQUEST_CONFLICT:['این درخواست نیاز به تازه‌سازی دارد','شناسهٔ درخواست قبلاً برای پاسخ دیگری ثبت شده است.','ابتدا کدت را دانلود کن و سپس صفحه را بازخوانی کن.'],

 MISSING_FUNCTION:['تابع پیدا نشد','تابع خواسته‌شده در کد تعریف نشده است. نام آن را با صورت مسئله مقایسه کن.','نام تابع باید دقیقاً همان نام خواسته‌شده باشد.'],
 NOT_CALLABLE:['نام تابع تغییر کرده است','نام خواسته‌شده وجود دارد، اما دیگر یک تابع قابل فراخوانی نیست.','بررسی کن بعد از تعریف تابع، مقدار دیگری به نام آن نداده باشی.'],
 SYNTAX_ERROR:['ساختار کد را بررسی کن','کد پیش از اجرای تابع با خطای نگارشی Python متوقف شد.','کد را اجرا کن و محل خطا را در کنسول ببین؛ تورفتگی، پرانتز و دونقطه‌ها را بررسی کن.'],
 NAME_ERROR:['یک نام تعریف نشده است','هنگام اجرا، یک نام در دسترس نبود. کد را اجرا کن تا محل آن را در کنسول ببینی.','نام متغیرها و توابع کمکی را بررسی کن؛ کد مراحل قبلی هم باید قابل اجرا باشد.'],
 TYPE_ERROR:['نوع مقدار یا آرگومان را بررسی کن','اجرای کد با خطای نوع داده یا فراخوانی متوقف شد.','تعداد آرگومان‌ها و نوع مقدارهایی را که به تابع‌ها می‌دهی با صورت مسئله مقایسه کن.'],
 INDEX_ERROR:['اندیس‌گذاری را بررسی کن','اجرای تابع با خطای دسترسی به اندیس متوقف شد.','اندیس‌ها از صفر شروع می‌شوند و اندازهٔ ورودی‌های بررسی ممکن است با جدول صفحه متفاوت باشد.'],
 VALUE_ERROR:['ابعاد و مقدارها را بررسی کن','اجرای تابع با خطای مقدار یا سازگاری ابعاد متوقف شد.','کد را اجرا کن؛ شکل آرایه‌ها و محور محاسبه را با قرارداد تابع مقایسه کن.'],
 RUNTIME_ERROR:['اجرای کد کامل نشد','کد هنگام بارگذاری یا اجرای تابع با خطا متوقف شد.','اجرای کد و متن خطای کنسول می‌تواند محل مشکل را روشن کند.'],
 INVALID_RETURN:['نوع خروجی قابل بررسی نیست','پاسخ تابع باید عدد متناهی، آرایه یا دیکشنری کوچکِ خواسته‌شده باشد.','مقدار برگشتی را بررسی کن؛ مقدارهای بی‌نهایت، NaN یا نوع‌های نامرتبط پذیرفته نمی‌شوند.'],
 MISSING_RETURN:['پاسخ تابع برنگشته است','مقدار برگشتی تابع None بود. print پاسخ را نمایش می‌دهد؛ پاسخ تابع باید با return برگردد.','وجود print به‌تنهایی مقدار برگشتی تابع را تعیین نمی‌کند.'],
 OUTPUT_TYPE:['نوع خروجی را بررسی کن','نوع مقدار برگشتی با قرارداد این مرحله هماهنگ نیست.','مثال ورودی و خروجی مرحله را ببین؛ عدد، آرایه و دیکشنری جای یکدیگر قرار نمی‌گیرند.'],
 MISSING_OUTPUT_KEY:['یک کلید در خروجی نیست','یکی از کلیدهای لازم در دیکشنری خروجی وجود ندارد.','نام کلیدها باید دقیق باشد؛ همهٔ کلیدهای خواسته‌شده را حتی برای مقدار صفر برگردان.'],
 OUTPUT_SHAPE:['شکل خروجی را بررسی کن','تعداد یا شکل اعضای خروجی با قرارداد ورودی هماهنگ نیست.','به ازای هر نمونه یا هر k، همان تعداد نتیجهٔ خواسته‌شده لازم است؛ آرایهٔ یک‌بعدی با آرایهٔ ستونی تفاوت دارد.'],
 INPUT_CHANGED:['ورودی تغییر کرده است','در یکی از بررسی‌ها، دادهٔ ورودی پس از اجرای تابع تغییر کرد.','برای محاسبهٔ نتیجه از آرایهٔ تازه یا کپی استفاده کن؛ مرتب‌سازی یا انتساب درجا می‌تواند ورودی را تغییر بدهد.'],
 INVALID_INDICES:['اندیس‌ها معتبر نیستند','خروجی شامل اندیس تکراری، غیرصحیح یا خارج از محدوده است.','اندیس همسایه با فاصلهٔ آن فرق دارد؛ هر همسایه باید یک اندیس معتبر و یکتا داشته باشد.'],
 NEIGHBOR_ORDER:['انتخاب یا ترتیب همسایه‌ها را بررسی کن','اندیس‌ها معتبرند، اما فاصله‌هایشان ترتیب نزدیک‌ترین همسایه‌ها را ندارد.','فاصلهٔ همهٔ سطرها را حساب کن و نتیجه را از نزدیک به دور انتخاب کن.'],
 DISTANCE_TIE:['قرارداد فاصلهٔ برابر را بررسی کن','در یک ورودی با فاصله‌های برابر، ترتیب انتخاب با قرارداد این لابراتور سازگار نبود.','در بازرس کیفیت، وقتی فاصله برابر است اندیس کوچک‌تر زودتر می‌آید.'],
 LABEL_ALIGNMENT:['برچسب‌ها با همسایه‌ها هماهنگ نیستند','اندیس همسایه‌ها درست است، اما برچسب‌های برگشتی متعلق به همان اندیس‌ها نیستند.','اندیس‌های منتخب باید روی y هم اعمال شوند؛ y را جداگانه مرتب نکن.'],
 CHANGED_TYPE:['نوع changed را بررسی کن','مقدار changed باید بولی باشد: True یا False.','آرایهٔ مقایسهٔ عضو به عضو، یک مقدار بولیِ واحد نیست.'],
 SET_CHANGE:['معنای تغییر گروه را بررسی کن','اندیس‌های دو جست‌وجو درست‌اند، اما changed با تغییر اعضای گروه سازگار نیست.','فقط جابه‌جایی ترتیب همان اعضا، تغییر گروه نیست.'],
 VOTE_COUNTS:['تعداد رأی‌ها را بررسی کن','تعداد رأی‌های گزارش‌شده برای ورودی بررسی، با قرارداد این مرحله هماهنگ نیست.','هر برچسب یک رأی دارد. مجموع رأی دو کلاس باید برابر تعداد رأی‌دهندگان باشد.'],
 MAJORITY_TIE:['قرارداد رأی مساوی را بررسی کن','در یک ورودی با رأی برابر، کلاس انتخاب‌شده با قرارداد مرحله سازگار نبود.','قرارداد این ابزار در تساوی، کلاس صفر است.'],
 MAJORITY:['کلاس برنده را بررسی کن','برچسب برنده با شمارش رأی‌ها هماهنگ نیست.','برچسب برنده را برگردان، نه تعداد رأی آن کلاس را.'],
 VOTE_SHARE:['سهم رأی را بررسی کن','برچسب و تعداد رأی‌ها درست‌اند، اما vote_share با آن‌ها هماهنگ نیست.','سهم رأی یک نسبت بین صفر و یک است؛ درصد یا احتمال واقعی خرابی نیست.'],
 RESULT_VALUES:['مقدار پاسخ را بررسی کن','شکل خروجی درست است، اما مقدار آن روی یکی از ورودی‌های تازه درست نبود.','محاسبه را از خود ورودی انجام بده؛ به مقدارها یا اندازهٔ جدول صفحه وابسته نباش.'],
 SERVICE_ERROR:['بررسی کامل نشد','محیط بررسی به نتیجهٔ قابل اتکا نرسید. این پیام به معنی نادرست بودن پاسخ تو نیست.','کدت حفظ شده است؛ کمی بعد دوباره بررسی کن.'],
 EXECUTION_LIMIT:['اجرا متوقف شد','فرایند اجرا به محدودیت محیط برخورد کرد و بررسی کامل نشد.','حلقه‌ها و اندازهٔ محاسبات را بررسی کن و دوباره تلاش کن؛ در صورت تکرار با مدرس در میان بگذار.'],
 CHECK_PENDING:['بررسی هنوز ادامه دارد','نتیجه هنوز آماده نیست. کمی بعد همین پاسخ را دوباره بررسی کن.','درخواست قبلی حفظ می‌شود و بررسی مجدد، XP تکراری ثبت نمی‌کند.'],
 PASSED:['پاسخ تأیید شد','راه‌حل این مرحله روی ورودی‌های تازه درست کار کرد و پیشرفت ثبت شد.','می‌توانی به مرحلهٔ بعد بروی یا کدت را دوباره مرور کنی.'],
 ALREADY_PASSED:['پاسخ تأیید شد','این مرحله قبلاً امتیاز گرفته است؛ بررسی موفق دوباره، XP اضافه نمی‌کند.','می‌توانی کدت را بهتر کنی یا به مرحلهٔ بعد بروی.'],
 EMPTY_CODE:['کد را بنویس','ابتدا تابع خواسته‌شده را در ادیتور بنویس.','قالب آغازین و قرارداد مرحله در پنل مأموریت قرار دارند.'],
 CHECK_UNAVAILABLE:['ارتباط بررسی کامل نشد','نتیجهٔ نهایی دریافت نشد. کدت حفظ شده است.','اتصال و وضعیت ورود را بررسی کن و دوباره تلاش کن.'],
 CONTRACT:['پاسخ نیاز به اصلاح دارد','نتیجه با قرارداد این مرحله هماهنگ نیست.','نوع خروجی، نام کلیدها و مثال مرحله را بررسی کن.']
};
const fields=new Set(['n_samples','n_features','indices','distances','before_indices','after_indices','changed','labels','class_0','class_1','label','vote_share']);
export function feedbackView(value,status='failed'){
 const code=typeof value?.code==='string'&&Object.hasOwn(messages,value.code)?value.code:status==='error'?'SERVICE_ERROR':status==='passed'?'ALREADY_PASSED':'CONTRACT';
 const [title,text,hint]=messages[code];return {code,title,text,hint,field:fields.has(value?.field)?value.field:null,kind:['SERVICE_ERROR','CHECK_PENDING','CHECK_UNAVAILABLE','EXECUTION_LIMIT','SIGN_IN_REQUIRED','CLASS_ACCESS_REQUIRED','LAB_RATE_LIMIT','LAB_BUDGET_EXHAUSTED','LAB_PAUSED','REQUEST_CONFLICT'].includes(code)?'service':['ALREADY_PASSED','PASSED'].includes(code)?'success':'correction'};
}
export function mountExperience(root,{userId,missionId,meta,dataset,stages,hasProgress,onStart}){
 const $=s=>root.querySelector(s),editor=$('#lab-code'),workspace=$('.lab-workspace');
 const key=`classroom-lab-intro:v2:${userId}:${missionId}`;let seen=false;try{seen=localStorage.getItem(key)==='seen'}catch{}
 let disposed=false,last=null,returnPoint=null,reviewing=false,inerted=[];
 const intro=document.createElement('section');intro.className='lab-intro';intro.hidden=true;intro.setAttribute('aria-labelledby','lab-intro-title');
 intro.innerHTML=`<div class="lab-intro-copy"><p class="lab-intro-kicker">پیش از شروع · ${escape(meta.title)}</p><h2 id="lab-intro-title" tabindex="-1">${escape(meta.introTitle)}</h2>${meta.story}<div class="lab-intro-dataset"><h3>داده‌ها چه معنایی دارند؟</h3>${meta.dataIntro}</div></div><div class="lab-intro-sample"><p class="lab-intro-kicker">نمونه‌ای از داده‌ها · ۳ سطر از ${dataset.X.length} سطر</p><div class="lab-intro-table"><table><thead><tr><th>شناسه</th>${dataset.columns.map(c=>`<th>${escape(c.label)}</th>`).join('')}${dataset.y?'<th>برچسب</th>':''}</tr></thead><tbody>${dataset.X.slice(0,3).map((row,i)=>`<tr><th dir="ltr">${escape(dataset.names[i])}</th>${row.map(v=>`<td dir="ltr">${v}</td>`).join('')}${dataset.y?`<td>${dataset.y[i]}</td>`:''}</tr>`).join('')}</tbody></table></div><div class="lab-intro-query"><span>${escape(meta.queryLabel)} · <code>query</code></span><strong dir="ltr">${escape(JSON.stringify(dataset.query))}</strong><p>${escape(meta.queryHelp)}</p></div></div><div class="lab-intro-path"><h3>چه چیزی خواهی ساخت؟</h3><p>${escape(meta.introGoal)}</p><ol>${stages.map(s=>`<li>${escape(s.title)}</li>`).join('')}</ol></div><footer class="lab-intro-footer"><span lang="en" dir="ltr">${stages.length} Missions · ${stages.reduce((sum,s)=>sum+s.xp,0)} XP</span><button class="button-forest" data-intro-start type="button">شروع مأموریت ←</button></footer>`;
 workspace.before(intro);
 const dialog=document.createElement('dialog');dialog.className='lab-feedback-dialog';dialog.setAttribute('aria-labelledby','lab-feedback-title');dialog.setAttribute('aria-describedby','lab-feedback-message');dialog.setAttribute('dir','rtl');dialog.setAttribute('aria-modal','true');
 dialog.innerHTML='<button class="lab-feedback-close" data-feedback-close type="button" aria-label="بستن بازخورد">×</button><p class="lab-feedback-step" data-feedback-step></p><span class="lab-feedback-symbol" aria-hidden="true">!</span><h2 id="lab-feedback-title" tabindex="-1"></h2><p id="lab-feedback-message" aria-live="polite"></p><p class="lab-feedback-field" hidden>نام یا کلید مورد بررسی: <code data-feedback-field dir="ltr"></code></p><details class="lab-feedback-hint"><summary lang="en" dir="ltr">Hint</summary><p data-feedback-hint></p></details><details class="lab-feedback-example"><summary>دیدن مثال</summary><p>مثال آموزشی این مرحله؛ مستقل از ورودی‌های بررسی نهایی.</p><pre data-feedback-example dir="ltr" tabindex="0"></pre></details><button class="button-forest" data-feedback-return type="button">برگشت به کد</button>';
 root.append(dialog);
 function point(){return {start:editor.selectionStart,end:editor.selectionEnd,top:editor.scrollTop,left:editor.scrollLeft,pageX:window.scrollX||0,pageY:window.scrollY||0};}
 function restore(){editor.focus({preventScroll:true});if(returnPoint&&typeof editor.setSelectionRange==='function')editor.setSelectionRange(returnPoint.start,returnPoint.end);if(returnPoint){editor.scrollTop=returnPoint.top;editor.scrollLeft=returnPoint.left;editor.dispatchEvent(new Event('scroll'));window.scrollTo?.({left:returnPoint.pageX,top:returnPoint.pageY,behavior:'auto'});}}
 function hideFeedback(focus=true){if(dialog.open){if(typeof dialog.close==='function')dialog.close();else{dialog.removeAttribute('open');dialog.open=false;}}for(const [el,value] of inerted)el.inert=value;inerted=[];root.classList.remove('has-feedback-fallback');if(focus&&!disposed)restore();}
 function showIntro(review=false){if(disposed)return;reviewing=review;returnPoint=point();hideFeedback(false);intro.hidden=false;workspace.hidden=true;workspace.inert=true;root.classList.add('is-lab-intro');$('[data-intro-start]').textContent=review?'برگشت به مأموریت ←':hasProgress?'ادامهٔ مأموریت ←':'شروع مأموریت ←';$('#lab-intro-title').focus({preventScroll:true});intro.scrollIntoView?.({block:'start'});}
 function leaveIntro(){try{localStorage.setItem(key,'seen')}catch{}seen=true;intro.hidden=true;workspace.hidden=false;workspace.inert=false;root.classList.remove('is-lab-intro');if(reviewing)restore();else{editor.focus({preventScroll:true});root.scrollIntoView?.({block:'start'});onStart?.();}}
 $('[data-intro-start]').onclick=leaveIntro;
 $('[data-story-review]').onclick=()=>showIntro(true);
 function rememberFeedback(value,status,stage){last={view:feedbackView(value,status),stage};$('[data-last-feedback]').hidden=false;}
 function showFeedback(value,status,stage,savedPoint){
  if(disposed)return;rememberFeedback(value,status,stage);returnPoint=savedPoint||point();const v=last.view;
  dialog.dataset.kind=v.kind;$('#lab-feedback-title').textContent=v.title;$('#lab-feedback-message').textContent=v.text;
  $('[data-feedback-step]').textContent=`${meta.title} · ${stage.title}`;const field=v.field||(['MISSING_FUNCTION','NOT_CALLABLE','MISSING_RETURN'].includes(v.code)?stage.function:null);$('[data-feedback-field]').textContent=field||'';$('.lab-feedback-field').hidden=!field;
  $('[data-feedback-hint]').textContent=v.hint;$('.lab-feedback-hint').open=false;$('[data-feedback-example]').textContent=stage.example;$('.lab-feedback-example').open=false;$('.lab-feedback-example').hidden=v.kind==='service'||v.kind==='success';
  $('.lab-feedback-symbol').textContent=v.kind==='service'?'…':v.kind==='success'?'✓':'!';$('[data-last-feedback]').hidden=false;
  if(typeof dialog.showModal==='function'){if(!dialog.open)dialog.showModal();}else{if(!dialog.open){inerted=[...root.children].filter(el=>el!==dialog).map(el=>[el,el.inert]);for(const [el] of inerted)el.inert=true;}root.classList.add('has-feedback-fallback');dialog.setAttribute('open','');dialog.open=true;}
  $('#lab-feedback-title').focus({preventScroll:true});dialog.scrollTop=0;
 }
 $('[data-last-feedback]').onclick=()=>{if(last)showFeedback({code:last.view.code,field:last.view.field},last.view.kind==='success'?'passed':'failed',last.stage)};
 $('[data-feedback-close]').onclick=$('[data-feedback-return]').onclick=()=>hideFeedback();
 const cancel=e=>{e.preventDefault();e.stopPropagation();hideFeedback()};dialog.addEventListener('cancel',cancel);
 const keys=e=>{if(!dialog.open)return;if(e.key==='Escape'){cancel(e);return;}if(e.key==='Tab'){const list=[...dialog.querySelectorAll('button,summary,pre[tabindex]')].filter(el=>!el.closest('[hidden]')&&(!el.closest('details')||el.tagName==='SUMMARY'||el.closest('details').open));const first=list[0],last=list.at(-1);if(e.shiftKey&&(document.activeElement===first||document.activeElement===$('#lab-feedback-title'))){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}};dialog.addEventListener('keydown',keys);
 return {start(){if(!seen)showIntro();},capture:point,showFeedback,rememberFeedback,close:hideFeedback,setBusy(busy){$('[data-story-review]').disabled=busy;$('[data-last-feedback]').disabled=busy;},dispose(){disposed=true;hideFeedback(false);workspace.inert=false;root.classList.remove('is-lab-intro');intro.remove();dialog.remove();}};
}
