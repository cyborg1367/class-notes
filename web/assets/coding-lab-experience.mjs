// Presentation only: introduction and feedback never grant XP or unlock tasks.
const messages={
 POSITIVE_SCORES:["ستون کلاس مثبت را بررسی کن", "امتیازهای خروجی با کلاس ۱ و ترتیب سطرها هماهنگ نیستند.", "classes_ ترتیب ستون‌های predict_proba را تعیین می‌کند؛ برچسب predict امتیاز نیست."],
 THRESHOLD_RULE:["مرز تصمیم را بررسی کن", "یکی از تصمیم‌ها با قانون آستانه هماهنگ نیست.", "تساویِ امتیاز و آستانه، مثبت است؛ ورودی را درجا تغییر نده."],
 METRIC_VALUES:["صورت و مخرج معیار را بررسی کن", "شمارش‌ها یا نسبت‌ها با ورودی هماهنگ نیستند.", "Precision بین مثبت‌های پیش‌بینی‌شده و Recall بین مثبت‌های واقعی حساب می‌شود؛ beta ورودی را هم ببین."],
 THRESHOLD_ROWS:["گزارش آستانه‌ها را بررسی کن", "یکی از سطرها با قانون تصمیم یا ترتیب ورودی هماهنگ نیست.", "آستانه‌ها را به همان ترتیب بررسی کن؛ FPR مخرج منفی‌های واقعی را دارد."],
 ROC_VALUES:["منحنی و رتبه‌بندی را بررسی کن", "نقاط، آستانه‌ها یا AUC با امتیازها هماهنگ نیستند.", "از امتیاز خام استفاده کن؛ شروع بی‌نهایت، گروه‌های مساوی و تمام نقاط متمایز حفظ شوند."],
 POLICY_VALUES:["اولویت‌های سیاست را بررسی کن", "گزینهٔ برنده یا نتیجهٔ نبود گزینه با قرارداد هماهنگ نیست.", "ابتدا شرط Precision و حداقل یک تصمیم مثبت؛ سپس Recall، Precision و آستانهٔ بزرگ‌تر."],

 SPLIT_ALIGNMENT:['تقسیم داده را بررسی کن','ویژگی‌ها و برچسب‌ها یا تنظیمات تقسیم با قرارداد مرحله هماهنگ نیستند.','X و y را با هم تقسیم کن؛ test_size و seed از ورودی می‌آیند و stratify برچسب کل داده است.'],
 ACCURACY_VALUES:['معنای Accuracy را بررسی کن','شمارش درست‌ها یا نسبت گزارش‌شده با ورودی هماهنگ نیست.','مخرج، تعداد همهٔ نمونه‌های ارزیابی است؛ نسبت را برگردان، نه درصد.'],
 CONFUSION_LAYOUT:['جهت ماتریس را بررسی کن','چهار خانهٔ گزارش با واقعیت و پیش‌بینی هماهنگ نیستند.','سطر واقعی و ستون پیش‌بینی است؛ ترتیب هر دو محور صفر و یک باشد.'],
 REPORT_VALUES:['گزارش نهایی را بررسی کن','یکی از مقدارهای گزارش از ارزیابی همین ورودی به دست نیامده است.','تقسیم، پیش‌بینی و سنجش را برای آرگومان‌های همین فراخوانی انجام بده.'],
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
 DISTANCE_TIE:['قرارداد فاصلهٔ برابر را بررسی کن','در یک ورودی با فاصله‌های برابر، ترتیب انتخاب با قرارداد این لابراتور سازگار نبود.','در لابراتور پیامک، وقتی فاصله برابر است اندیس کوچک‌تر زودتر می‌آید.'],
 LABEL_ALIGNMENT:['برچسب‌ها با همسایه‌ها هماهنگ نیستند','اندیس همسایه‌ها درست است، اما برچسب‌های برگشتی متعلق به همان اندیس‌ها نیستند.','اندیس‌های منتخب باید روی y هم اعمال شوند؛ y را جداگانه مرتب نکن.'],
 CHANGED_TYPE:['نوع changed را بررسی کن','مقدار changed باید بولی باشد: True یا False.','آرایهٔ مقایسهٔ عضو به عضو، یک مقدار بولیِ واحد نیست.'],
 SET_CHANGE:['معنای تغییر گروه را بررسی کن','اندیس‌های دو جست‌وجو درست‌اند، اما changed با تغییر اعضای گروه سازگار نیست.','فقط جابه‌جایی ترتیب همان اعضا، تغییر گروه نیست.'],
 VOTE_COUNTS:['تعداد رأی‌ها را بررسی کن','تعداد رأی‌های گزارش‌شده برای ورودی بررسی، با قرارداد این مرحله هماهنگ نیست.','هر برچسب یک رأی دارد. مجموع رأی دو کلاس باید برابر تعداد رأی‌دهندگان باشد.'],
 MAJORITY_TIE:['قرارداد رأی مساوی را بررسی کن','در یک ورودی با رأی برابر، کلاس انتخاب‌شده با قرارداد مرحله سازگار نبود.','قرارداد این ابزار در تساوی، کلاس صفر است.'],
 MAJORITY:['کلاس برنده را بررسی کن','برچسب برنده با شمارش رأی‌ها هماهنگ نیست.','برچسب برنده را برگردان، نه تعداد رأی آن کلاس را.'],
 VOTE_SHARE:['سهم رأی را بررسی کن','برچسب و تعداد رأی‌ها درست‌اند، اما vote_share با آن‌ها هماهنگ نیست.','سهم رأی یک نسبت بین صفر و یک است؛ درصد یا احتمال واقعی تبلیغاتی بودن نیست.'],
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
function outsideDialog(dialog){
 const elements=[];
 for(let current=dialog;current.parentElement;current=current.parentElement){
  const parent=current.parentElement;
  for(const sibling of parent.children){
   if(sibling!==current&&!['SCRIPT','LINK','STYLE','TEMPLATE'].includes(sibling.tagName))elements.push(sibling);
  }
  if(parent===dialog.ownerDocument.body)break;
 }
 return elements;
}

export function mountExperience(root,{missionId,meta,dataset,stages,hasProgress,mountLabPresentation,setStoryVisible}){
 const doc=root.ownerDocument,win=doc.defaultView;
 const $=selector=>root.querySelector(selector);
 const editor=$('#lab-code'),taskHeading=$('#lab-task-title'),workspace=$('.lab-workspace');
 const reviewButton=$('[data-story-review]'),feedbackButton=$('[data-last-feedback]');
 const reviewInitiallyHidden=reviewButton.hidden,workspaceInitiallyInert=Boolean(workspace.inert);
 let disposed=false,entered=false,last=null,feedbackPoint=null,storyPoint=null,reviewing=false,inerted=[];
 const intro=doc.createElement('section');
 intro.className='lab-intro';intro.hidden=true;intro.dataset.reactLabStory='';
 intro.setAttribute('aria-labelledby','lab-intro-title');
 const introSlot=$('[data-lab-intro-slot]');
 if(introSlot)introSlot.append(intro);else workspace.before(intro);
 const dialog=doc.createElement('dialog');
 dialog.className='lab-feedback-dialog';dialog.dataset.reactLabFeedback='';dialog.dir='rtl';
 dialog.setAttribute('aria-labelledby','lab-feedback-title');
 dialog.setAttribute('aria-describedby','lab-feedback-message');
 dialog.setAttribute('aria-modal','true');
 ($('[data-lab-feedback-slot]')||root).append(dialog);
 const ui=mountLabPresentation(intro,dialog);
 const point=()=>({start:editor.selectionStart,end:editor.selectionEnd,top:editor.scrollTop,left:editor.scrollLeft,pageX:win.scrollX||0,pageY:win.scrollY||0});
 const feedbackHeading=()=>dialog.querySelector('#lab-feedback-title');
 function restore(position){
  if(!root.isConnected||workspace.hidden)return;
  editor.focus({preventScroll:true});if(!position)return;
  editor.setSelectionRange(position.start,position.end);
  editor.scrollTop=position.top;editor.scrollLeft=position.left;
  editor.dispatchEvent(new win.Event('scroll'));
  win.scrollTo?.({left:position.pageX,top:position.pageY,behavior:'auto'});
 }
 function trapFallbackFocus(event){
  if(dialog.open&&!dialog.contains(event.target))feedbackHeading()?.focus({preventScroll:true});
 }
 function hideFeedback(focus=true){
  const wasOpen=dialog.open;
  doc.removeEventListener('focusin',trapFallbackFocus);
  if(wasOpen){if(typeof dialog.close==='function')dialog.close();else dialog.removeAttribute('open');}
  for(const [element,inert,ariaHidden] of inerted){
   element.inert=inert;
   if(ariaHidden===null)element.removeAttribute('aria-hidden');else element.setAttribute('aria-hidden',ariaHidden);
  }
  inerted=[];root.classList.remove('has-feedback-fallback');
  if(wasOpen&&focus&&!disposed)restore(feedbackPoint);
 }
 function leaveIntro(){
  if(disposed||intro.hidden)return;
  entered=true;
  intro.hidden=true;
  if(setStoryVisible)setStoryVisible(false);
  else{workspace.hidden=false;workspace.inert=workspaceInitiallyInert;reviewButton.hidden=reviewInitiallyHidden;}
  root.classList.remove('is-lab-intro');
  if(reviewing)restore(storyPoint);else{
   // On touch, let learners read the task before opening the virtual keyboard.
   const target=win.matchMedia?.('(pointer: coarse)').matches&&taskHeading?taskHeading:editor;
   target.focus({preventScroll:true});root.scrollIntoView?.({block:'start'});
  }
 }
 function showIntro(review=false){
  if(disposed||!intro.hidden)return;
  reviewing=review;storyPoint=review?point():null;hideFeedback(false);
  const evaluation=missionId==='evaluation-knn-v1';
  ui.showIntro({meta,dataset,stages,example:meta.queryText||(evaluation?'test_size=0.25 · seed=42 · k=3':JSON.stringify(dataset.query)),
   showQueryCode:!meta.queryText&&!evaluation,action:review?'return':hasProgress||entered?'resume':'start'},leaveIntro);
  if(setStoryVisible)setStoryVisible(true);
  else{workspace.hidden=true;workspace.inert=true;reviewButton.hidden=true;}
  intro.hidden=false;root.classList.add('is-lab-intro');
  intro.querySelector('#lab-intro-title').focus({preventScroll:true});intro.scrollIntoView?.({block:'start'});
 }
 function rememberFeedback(value,status,stage){
  if(disposed)return;
  const view=feedbackView(value,status);
  const field=view.field||(['MISSING_FUNCTION','NOT_CALLABLE','MISSING_RETURN'].includes(view.code)?stage.function:null);
  last={...view,field,step:meta.title+' · '+stage.title,example:stage.example};
  feedbackButton.hidden=false;
 }
 function openFeedback(savedPoint){
  if(disposed||!last||!intro.hidden)return;
  feedbackPoint=savedPoint||point();
  dialog.dataset.kind=last.kind;
  ui.showFeedback(last,hideFeedback);
  if(!dialog.open){
   if(typeof dialog.showModal==='function')dialog.showModal();
   else{
    dialog.setAttribute('open','');
    feedbackHeading().focus({preventScroll:true});
    inerted=outsideDialog(dialog).map(element=>[element,Boolean(element.inert),element.getAttribute('aria-hidden')]);
    for(const [element] of inerted){element.inert=true;element.setAttribute('aria-hidden','true');}
    root.classList.add('has-feedback-fallback');
    doc.addEventListener('focusin',trapFallbackFocus);
   }
  }
  feedbackHeading().focus({preventScroll:true});dialog.scrollTop=0;
 }
 function showFeedback(value,status,stage,savedPoint){
  rememberFeedback(value,status,stage);openFeedback(savedPoint);
 }
 const review=()=>{if(!reviewButton.disabled)showIntro(true);};
 const lastFeedback=()=>{if(!feedbackButton.disabled)openFeedback();};
 const cancel=event=>{event.preventDefault();event.stopPropagation();hideFeedback();};
 const keys=event=>{
  if(!dialog.open)return;
  if(event.key==='Escape'){cancel(event);return;}
  if(event.key!=='Tab')return;
  const list=[...dialog.querySelectorAll('button:not(:disabled),summary,pre[tabindex]')].filter(element=>!element.closest('[hidden]')&&
   (!element.closest('details')||element.tagName==='SUMMARY'||element.closest('details').open));
  if(!list.length)return;
  const first=list[0],last=list.at(-1);
  if(event.shiftKey&&doc.activeElement===first){event.preventDefault();last.focus();}
  else if(!event.shiftKey&&doc.activeElement===last){event.preventDefault();first.focus();}
 };
 reviewButton.addEventListener('click',review);feedbackButton.addEventListener('click',lastFeedback);
 dialog.addEventListener('cancel',cancel);dialog.addEventListener('keydown',keys);
 return {
  start(){showIntro();},capture:point,showFeedback,rememberFeedback,close:hideFeedback,
  setBusy(busy){reviewButton.disabled=busy;feedbackButton.disabled=busy;},
  dispose(){
   if(disposed)return;disposed=true;hideFeedback(false);
   reviewButton.removeEventListener('click',review);feedbackButton.removeEventListener('click',lastFeedback);
   dialog.removeEventListener('cancel',cancel);dialog.removeEventListener('keydown',keys);
   if(!setStoryVisible){workspace.inert=workspaceInitiallyInert;reviewButton.hidden=reviewInitiallyHidden;}
   root.classList.remove('is-lab-intro');ui.dispose();intro.remove();dialog.remove();
  }
 };
}
