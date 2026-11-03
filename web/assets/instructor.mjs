// Authenticated instructor UI. All educational state comes from server reports.
const modelURL=new URL('./instructor-model.mjs',import.meta.url);modelURL.search=new URL(import.meta.url).search;
const {views,escapeHTML:E,inline,fa,latin,date,relative,freshFilters,resetPages,createRequestGate,
 reportPage,overviewReport,studentReport,labFor,pageArgs,message,csvText,exportRows,collectPages}=await import(modelURL.href);

const shapes={overview:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',students:'<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M17 5a3 3 0 0 1 0 6m1 4a5 5 0 0 1 3 5"/>',attempts:'<path d="M7 4H5v17h14V4h-2M9 3h6v4H9zM8 12h8m-8 4h5"/>',labs:'<path d="M9 3h6m-5 0v6l-6 10a1.5 1.5 0 0 0 1.3 2h13.4a1.5 1.5 0 0 0 1.3-2L14 9V3M7 15h10"/>',requests:'<rect x="3" y="5" width="18" height="15" rx="2"/><path d="m3 7 9 6 9-6M15 1v6m-3-3h6"/>',search:'<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>',arrow:'<path d="M19 12H5m6-6-6 6 6 6"/>',close:'<path d="m6 6 12 12M6 18 18 6"/>',download:'<path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-11v1"/>',empty:'<path d="M4 7h16v14H4zM8 3h8v4M8 13h8m-8 4h5"/>'};
const icon=k=>'<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(shapes[k]||shapes.info)+'</svg>';
const personCell=p=>'<strong>'+E(p.name||p.email||'دانشجو')+'</strong><bdi class="email">'+E(p.email||'')+'</bdi>';
const statusPill=p=>'<span class="pill '+(p.status==='pending'?'pending':p.status==='suspended'?'off':'')+'">'+({active:'دارای دسترسی',pending:'در انتظار',suspended:'بدون دسترسی'}[p.status]||'—')+'</span>';
const grade=q=>q?.score!=null&&q?.maximum!=null&&Number.isFinite(Number(q.score))&&Number.isFinite(Number(q.maximum))?'<bdi dir="ltr">'+fa(q.score)+' / '+fa(q.maximum)+'</bdi>':'—';
const xpHTML=lab=>lab&&lab.maximum>0?'<bdi class="mono xp">'+latin(lab.xp)+' / '+latin(lab.maximum)+' XP</bdi>':'—';
function bar(value,max){const width=max>0?Math.max(0,Math.min(100,value/max*100)):0;return '<div class="bar" role="img" aria-label="'+E(fa(value)+' از '+fa(max))+'"><i style="width:'+width+'%"></i></div>';}
const loading=label=>'<div class="empty" role="status" aria-live="polite"><span class="spinner" aria-hidden="true"></span>'+E(label||'در حال دریافت گزارش…')+'</div>';
function empty(title,text,action=''){return '<div class="empty">'+icon('empty')+'<h2>'+E(title)+'</h2><p>'+E(text)+'</p>'+action+'</div>';}
function failure(error,action='retry'){return empty('گزارش دریافت نشد',message(error),'<button class="btn primary" type="button" data-action="'+action+'">دریافت دوباره</button>');}

export function mountInstructor(root,{rpc,courses,catalog=[],url,isCurrent=()=>true,renderFigure=null,document:doc=root.ownerDocument}){
 const win=doc.defaultView;
 const gate=createRequestGate(()=>root.isConnected&&isCurrent());
 const state={course:courses[0].course_id,view:'overview',overview:null,overviewError:null,overviewLoading:true,
  filters:freshFilters(),pages:{},concepts:null,conceptError:null,conceptLoading:false,sheet:null,confirmation:null,
  exporting:false,exportProgress:'',mutating:false,accessError:null};
 const urls=new Set();let searchTimer,toastTimer,returnFocus,composing=false;
 root.innerHTML='<div class="instructor-app"><aside class="sidebar"><p class="side-label">مدیریت کلاس</p><nav class="side-nav" aria-label="بخش‌های پنل مدرس" data-instructor-nav></nav><div class="course-block"><label for="instructor-course">کلاس انتخاب‌شده</label><select id="instructor-course" data-course></select><p data-course-counts></p></div></aside><section class="content" data-instructor-content tabindex="-1" aria-label="گزارش مدرس"></section></div><dialog class="instructor-detail" data-detail aria-labelledby="instructor-detail-title"></dialog><dialog class="confirm" data-confirmation aria-labelledby="instructor-confirm-title"></dialog><div class="toast" data-instructor-toast role="status" aria-live="polite" hidden></div>';
 const nav=root.querySelector('[data-instructor-nav]'),content=root.querySelector('[data-instructor-content]'),detail=root.querySelector('[data-detail]'),confirmation=root.querySelector('[data-confirmation]');
 const q=s=>root.querySelector(s);
 const courseInfo=()=>catalog.find(c=>c.id===state.course);
 const lessons=()=>state.overview?.lessons||courseInfo()?.lessons||[];
 const lessonInfo=id=>lessons().find(l=>l.id===id)||courseInfo()?.lessons.find(l=>l.id===id);
 const noteLabel=id=>{const l=lessonInfo(id);return l?.ordinal?'یادداشت '+fa(l.ordinal):l?.number?'یادداشت '+fa(l.number):l?.title||id;};
 const labTitle=m=>courseInfo()?.lessons.find(l=>l.lab?.mission===m.mission)?.lab.title||m.title||'لابراتور';
 const labs=()=>state.overview?.labs||state.pages.labs?.rows?.[0]?.lab.missions||[];
 const courseTitle=()=>courses.find(c=>c.course_id===state.course)?.title||courseInfo()?.display_title||state.course;
 function toast(text){if(!gate.current())return;clearTimeout(toastTimer);const box=q('[data-instructor-toast]');box.textContent=text;box.hidden=false;toastTimer=setTimeout(()=>{if(box.isConnected)box.hidden=true;},6000);}
 function accessLost(error){
  if(!/TEACHER_REQUIRED|CLASS_ACCESS_REQUIRED/.test(error?.message||''))return false;
  gate.invalidate();closeSheet();if(confirmation.open)confirmation.close();clearTimeout(searchTimer);
  Object.assign(state,{overview:null,pages:{},concepts:null,sheet:null,confirmation:null,exporting:false,mutating:false,accessError:error});render();return true;
 }
 function renderNav(){
  nav.innerHTML=views.map(([id,title])=>'<button type="button" data-view="'+id+'" '+(id===state.view?'aria-current="page"':'')+'>'+icon(id)+'<span>'+title+'</span>'+(id==='requests'&&state.overview?.stats.pending_students?'<span class="count">'+fa(state.overview.stats.pending_students)+'</span>':'')+'</button>').join('');
  const select=q('[data-course]');if(select.options?.length!==courses.length)select.innerHTML=courses.map(c=>'<option value="'+E(c.course_id)+'">'+E(c.title)+'</option>').join('');
  for(const option of select.querySelectorAll('option'))option.selected=option.value===state.course;
  select.disabled=state.mutating;
  q('[data-course-counts]').textContent=state.overview?fa(lessons().length)+' یادداشت · '+fa(state.overview.labs.length)+' لابراتور':'';
 }
 function renderOverview(){
  if(!state.overview)return '<section class="card">'+(state.overviewError?failure(state.overviewError):loading())+'</section>';
  const o=state.overview,s=o.stats;
  return (state.overviewError?'<p class="notice" role="alert">'+E(message(state.overviewError))+' آخرین گزارش دریافت‌شده نمایش داده می‌شود.</p>':'')+
   '<div class="stats"><div class="stat"><span>دانشجوی دارای دسترسی</span><strong>'+fa(s.active_students)+'</strong><small>عضویت فعال در این کلاس</small></div><div class="stat"><span>درخواست در انتظار</span><strong>'+fa(s.pending_students)+'</strong><small>آمادهٔ بررسی مدرس</small></div><div class="stat"><span>ثبت نهایی آزمون</span><strong>'+fa(s.total_attempts)+'</strong><small>همهٔ ثبت‌ها، شامل تلاش‌های بعدی</small></div></div><div class="overview-grid"><section class="card"><header class="card-head"><div><h2>مسیر کلاس در لابراتور</h2><p>دانشجویانی که همهٔ مأموریت‌های هر لابراتور را کامل کرده‌اند</p></div><button class="quiet" type="button" data-view="labs">گزارش کامل ←</button></header><div class="card-content">'+
   (o.labs.map(m=>'<div class="progress-item"><div class="progress-line"><div class="progress-title"><span class="number-tag">'+E(String(m.ordinal).padStart(2,'0'))+'</span><span>'+E(labTitle(m))+'</span></div><small>'+fa(m.completed_students)+' از '+fa(m.students)+' نفر</small></div>'+bar(m.completed_students,m.students)+'</div>').join('')||'<p class="small muted">هنوز لابراتوری برای گزارش این کلاس ثبت نشده است.</p>')+
   '</div></section><section class="card"><header class="card-head"><div><h2>درخواست‌های تازه</h2><p>دسترسی به کلاس با تأیید شما فعال می‌شود</p></div><span class="pill pending">'+fa(s.pending_students)+' درخواست</span></header><div class="card-content">'+
   (o.pending.map(p=>'<div class="pending-person"><div class="avatar" aria-hidden="true">'+E((p.name||'د')[0])+'</div><div><strong>'+E(p.name)+'</strong><small>'+E(date(p.created_at))+'</small></div><button class="btn small-btn" type="button" data-request="'+E(p.user_id)+'">بررسی</button></div>').join('')||'<p class="small muted">درخواستی در انتظار نیست.</p>')+
   '</div></section></div><section class="card wide-card"><header class="card-head"><div><h2>برای جلسهٔ بعد، چه چیزی را مرور کنیم؟</h2><p>نسبت پاسخ نادرست در اولین ثبت نهایی هر دانشجو و هر نسخه</p></div><button class="quiet" type="button" data-action="concepts">تحلیل سؤال‌ها ←</button></header><div class="card-content">'+
   (o.concepts.map(r=>'<div class="question-line"><div><strong>'+E(r.skill||r.question_id)+'</strong><p>'+E(noteLabel(r.lesson_id))+' · نسخهٔ '+fa(r.version)+'</p></div>'+bar(r.responses-r.correct,r.responses)+'<span class="small">'+fa(r.responses-r.correct)+' خطا از '+fa(r.responses)+' پاسخ</span></div>').join('')||'<p class="small muted">پس از ثبت آزمون‌ها، این بخش شکل می‌گیرد.</p>')+
   '</div></section><p class="overview-footnote">'+icon('info')+'تعداد تلاش به‌تنهایی نشانهٔ ضعف نیست؛ نسبت خطا را همراه با تعداد پاسخ‌ها و ابهام احتمالی سؤال بخوانید.</p>';
 }
 function filters(view){const f=state.filters[view];let controls='';
  if(view==='students')controls='<select id="instructor-status-filter" class="filter" data-filter="status" aria-label="وضعیت دسترسی">'+[['enrolled','همهٔ وضعیت‌ها'],['active','دارای دسترسی'],['suspended','بدون دسترسی']].map(([v,t])=>'<option value="'+v+'" '+(v===f.status?'selected':'')+'>'+t+'</option>').join('')+'</select>';
  if(view==='attempts')controls='<select id="instructor-lesson-filter" class="filter" data-filter="lesson" aria-label="یادداشت"><option value="">همهٔ یادداشت‌ها</option>'+lessons().map(l=>'<option value="'+E(l.id)+'" '+(l.id===f.lesson?'selected':'')+'>'+E(noteLabel(l.id))+'</option>').join('')+'</select><select id="instructor-kind-filter" class="filter" data-filter="kind" aria-label="نوع تلاش">'+[['all','همهٔ تلاش‌ها'],['first','فقط اولین ثبت'],['later','تلاش‌های بعدی']].map(([v,t])=>'<option value="'+v+'" '+(v===f.kind?'selected':'')+'>'+t+'</option>').join('')+'</select>';
  return '<div class="toolbar"><label class="search" for="instructor-search">'+icon('search')+'<input id="instructor-search" type="search" maxlength="120" autocomplete="off" data-search value="'+E(f.query)+'" placeholder="جست‌وجوی نام یا ایمیل" aria-label="جست‌وجوی نام یا ایمیل"></label>'+controls+'</div>';
 }
 function pagination(view,page){const f=state.filters[view];return '<div class="table-foot"><span>'+fa(page.total)+' '+(view==='attempts'?'ثبت':'دانشجو')+' · صفحهٔ '+fa(f.index+1)+'</span><div class="pages"><button class="btn" type="button" data-page="-1" '+(f.index===0?'disabled':'')+'>قبلی</button><button class="btn" type="button" data-page="1" '+(!page.next_cursor?'disabled':'')+'>بعدی</button></div></div>';}
 function table(view){const page=state.pages[view];
  if(!page||page.loading)return loading();if(page.error)return failure(page.error);
  if(!page.rows.length)return empty('اطلاعاتی برای نمایش نیست',state.filters[view].query?'نام، ایمیل یا فیلتر را تغییر دهید.':'هنوز داده‌ای با این شرایط ثبت نشده است.',state.filters[view].query?'<button class="btn" type="button" data-action="clear">پاک‌کردن جست‌وجو</button>':'');
  let heads,rows;
  if(view==='attempts'){
   heads=['دانشجو','یادداشت','نوع ثبت','نمره','زمان','پاسخ‌ها'];
   rows=page.rows.map(a=>'<tr><td>'+personCell(a)+'</td><td title="'+E(a.title)+'">'+E(noteLabel(a.lesson_id))+'<span class="sub">نسخهٔ '+fa(a.version)+'</span></td><td>'+(a.attempt_no===1?'<span class="tag-first">اولین ثبت</span>':'تلاش '+fa(a.attempt_no))+'</td><td>'+grade(a)+'</td><td>'+E(date(a.created_at))+'</td><td><button class="btn small-btn" type="button" data-attempt="'+E(a.id)+'">بررسی</button></td></tr>').join('');
  }else if(view==='labs'){
   const mission=state.filters.labs.mission;heads=['دانشجو','مأموریت‌های انجام‌شده','XP','آخرین ثبت لابراتور','جزئیات'];
   rows=page.rows.map(p=>{const m=labFor(p,mission);return '<tr><td>'+personCell(p)+'</td><td>'+(m?'<div class="lab-cell"><span>'+fa(m.completed)+' از '+fa(m.task_count)+'</span>'+bar(m.completed,m.task_count)+'</div>':'—')+'</td><td>'+xpHTML(m)+'</td><td>'+E(relative(m?.last_at))+'</td><td><button class="btn small-btn" type="button" data-student="'+E(p.user_id)+'">جزئیات</button></td></tr>';}).join('');
  }else{
   heads=['دانشجو','XP لابراتورها','آخرین آزمون','آخرین ثبت آموزشی','دسترسی','جزئیات'];
   rows=page.rows.map(p=>'<tr><td>'+personCell(p)+'</td><td>'+xpHTML(p.lab)+'<span class="sub">'+fa(p.lab.completed)+' از '+fa(p.lab.task_count)+' مأموریت</span></td><td>'+grade(p.latest_quiz)+(p.latest_quiz?'<span class="sub">'+E(noteLabel(p.latest_quiz.lesson_id))+' · نسخهٔ '+fa(p.latest_quiz.version)+'</span>':'')+'</td><td>'+E(relative(p.last_registered_at))+'</td><td>'+statusPill(p)+'</td><td><button class="icon-btn" type="button" data-student="'+E(p.user_id)+'" aria-label="جزئیات '+E(p.name)+'">'+icon('arrow')+'</button></td></tr>').join('');
  }
  return '<div class="table-scroll"><table><thead><tr>'+heads.map(h=>'<th scope="col">'+h+'</th>').join('')+'</tr></thead><tbody>'+rows+'</tbody></table></div>'+pagination(view,page);
 }
 function conceptsView(){
  if(state.conceptLoading)return '<section class="card">'+loading()+'</section>';
  if(state.conceptError)return '<section class="card">'+failure(state.conceptError,'retry-concepts')+'</section>';
  return '<section class="card"><header class="card-head"><div><h2>تحلیل اولین پاسخ‌ها</h2><p>همهٔ سوابق؛ هر دانشجو در هر نسخه، یک بار شمرده می‌شود.</p></div></header><div class="card-content">'+
   ((state.concepts||[]).map((r,i)=>'<div class="question-line"><div><strong>'+E(r.skill||r.question_id)+'</strong><p>'+E(noteLabel(r.lesson_id))+' · نسخهٔ '+fa(r.version)+' · '+fa(r.correct)+' پاسخ کاملِ درست از '+fa(r.responses)+'</p></div>'+bar(r.responses-r.correct,r.responses)+'<button class="btn small-btn" type="button" data-question="'+i+'">دیدن سؤال</button></div>').join('')||'<p class="small muted">هنوز پاسخی برای تحلیل وجود ندارد.</p>')+
   '</div><p class="legend-note">خطای بیشتر می‌تواند از ابهام سؤال یا نیاز به توضیح دوباره باشد. این گزارش رتبه‌بندی دانشجویان نیست.</p></section>';
 }
 function requestsView(){const page=state.pages.requests;if(!page||page.loading)return '<section class="card">'+loading()+'</section>';if(page.error)return '<section class="card">'+failure(page.error)+'</section>';
  if(!page.rows.length)return '<section class="card">'+empty('درخواستی در انتظار نیست','درخواست تازه‌ای که نیاز به بررسی داشته باشد، اینجا نمایش داده می‌شود.')+'</section>';
  return '<div class="notice">'+fa(page.total)+' درخواست در انتظار است. پیش از فعال‌کردن دسترسی، نام و ایمیل را بررسی کنید.</div><div class="request-list">'+page.rows.map(p=>'<article class="request-card"><div class="avatar" aria-hidden="true">'+E((p.name||'د')[0])+'</div><div class="request-info"><h2>'+E(p.name)+'</h2><bdi>'+E(p.email)+'</bdi><p>درخواست عضویت در '+E(courseTitle())+' · '+E(date(p.requested_at))+'</p></div><div class="request-actions"><button class="btn primary" type="button" data-approve="'+E(p.user_id)+'">تأیید دسترسی</button><button class="btn" type="button" data-request="'+E(p.user_id)+'">بررسی</button></div></article>').join('')+'</div>'+pagination('requests',page);
 }
 function listView(){
  if(state.view==='requests')return requestsView();
  if(state.view==='students')return '<section class="card">'+filters('students')+table('students')+'</section><p class="overview-footnote">'+icon('info')+'آخرین ثبت آموزشی از آزمون یا بررسی لابراتور به دست می‌آید؛ نشانهٔ آخرین ورود یا مطالعهٔ یادداشت نیست.</p>';
  if(state.view==='attempts'){const f=state.filters.attempts;return '<div class="request-actions instructor-segments"><button class="btn '+(f.section==='attempts'?'primary':'')+'" type="button" data-section="attempts">ثبت‌های آزمون</button><button class="btn '+(f.section==='concepts'?'primary':'')+'" type="button" data-section="concepts">تحلیل سؤال‌ها</button></div>'+(f.section==='concepts'?conceptsView():'<section class="card">'+filters('attempts')+table('attempts')+'<p class="table-note">همهٔ ثبت‌ها با صفحه‌بندی در دسترس‌اند؛ نمرهٔ آخر هر دانشجو از کل سوابق محاسبه می‌شود.</p></section>');}
  const f=state.filters.labs,definitions=labs();
  return '<div class="lab-summary">'+definitions.map(m=>'<button type="button" data-mission="'+E(m.mission)+'" aria-pressed="'+(f.mission===m.mission)+'"><span class="number-tag">'+E(String(m.ordinal).padStart(2,'0'))+'</span><strong>'+E(labTitle(m))+'</strong><small>'+fa(m.task_count)+' مأموریت · <bdi>'+latin(m.maximum)+' XP</bdi></small></button>').join('')+'</div><section class="card"><header class="card-head"><div><h2>'+E(f.mission==='all'?'رشد در همهٔ لابراتورها':labTitle(definitions.find(m=>m.mission===f.mission)||{mission:f.mission}))+'</h2><p>XP ثبت‌شده و مأموریت‌های کامل‌شده</p></div>'+(f.mission!=='all'?'<button class="quiet" type="button" data-mission="all">همهٔ لابراتورها ←</button>':'')+'</header>'+filters('labs')+table('labs')+'</section>';
 }
 function render(preserve=false){if(!gate.current())return;
  let focused,start,end;if(preserve&&content.contains(doc.activeElement)){focused=doc.activeElement.id;try{start=doc.activeElement.selectionStart;end=doc.activeElement.selectionEnd;}catch{}}
  renderNav();if(state.accessError){content.innerHTML='<section class="card">'+empty('دسترسی مدرس تأیید نشد',message(state.accessError),'<a class="btn" href="'+E(url('dashboard/'))+'">داشبورد ←</a>')+'</section>';return;}
  const texts={overview:['نمای کلی کلاس','تصویر کوتاهی از کلاس و کارهایی که به بررسی شما نیاز دارند.'],students:['دانشجویان','نمرهٔ آزمون و رشد لابراتور هر دانشجو را کنار هم ببینید.'],attempts:['آزمون‌ها','پاسخ‌ها را بررسی کنید و مفهوم‌های نیازمند توضیح دوباره را پیدا کنید.'],labs:['لابراتورها','پیشرفت مأموریت‌ها را با XP ثبت‌شده دنبال کنید.'],requests:['درخواست‌های عضویت','نام، ایمیل و دسترسی اعضای تازه را بررسی کنید.']};const t=texts[state.view];
  const exportable=['students','attempts','labs'].includes(state.view)&&!(state.view==='attempts'&&state.filters.attempts.section==='concepts');
  content.innerHTML='<div class="crumb">فضای مدرس / '+E(courseTitle())+'</div><header class="page-heading"><div><h1>'+t[0]+'</h1><p>'+t[1]+'</p></div><div class="heading-actions">'+(exportable?'<button class="btn" type="button" data-action="export" '+(state.exporting?'disabled':'')+'>'+icon('download')+(state.exporting?'در حال آماده‌سازی…':'دریافت CSV')+'</button>':'')+'<button class="btn" type="button" data-action="refresh" '+(state.mutating?'disabled':'')+'>به‌روزرسانی</button></div></header>'+
   (state.exporting?'<p class="small muted" role="status">'+E(state.exportProgress||'در حال دریافت همهٔ ردیف‌های فیلترشده…')+'</p>':'')+
   (state.view==='overview'?renderOverview():listView())+
   (state.overview?.server_now?'<p class="instructor-report-time muted small">آخرین دریافت نمای کلی: '+E(date(state.overview.server_now,true))+'</p>':'');
  if(focused){const el=content.querySelector('#'+focused);if(el){el.focus({preventScroll:true});if(typeof start==='number')try{el.setSelectionRange(start,end);}catch{}}}
 }

 async function loadOverview(){const current=gate.ticket('overview'),course=state.course;state.overviewLoading=true;
  if(state.view==='overview')render();
  try{const value=overviewReport(await rpc('classroom_instructor_overview',{p_course:course}));if(!current())return;state.overview=value;state.overviewError=null;state.accessError=null;}
  catch(error){if(!current()||accessLost(error))return;state.overviewError=error;}
  if(!current())return;state.overviewLoading=false;if(state.view==='overview'||state.view==='labs')render(true);else renderNav();
 }
 async function loadList(view=state.view){
  clearTimeout(searchTimer);if(!state.filters[view]||state.accessError)return;const current=gate.ticket('list-'+view),args=pageArgs(view,state.course,state.filters[view]);
  state.pages[view]={loading:true};if(state.view===view)render(true);
  try{const value=reportPage(await rpc(view==='attempts'?'classroom_instructor_attempts':'classroom_instructor_students',args));
   if(!current())return;if(view!=='attempts')value.rows.forEach(studentReport);
   state.pages[view]=value;const f=state.filters[view];if(value.as_of)f.asOf=value.as_of;
  }catch(error){if(current()&&!accessLost(error))state.pages[view]={error};}
  if(current()&&state.view===view)render(true);
 }
 async function loadConcepts(){const current=gate.ticket('concepts');state.conceptLoading=true;state.conceptError=null;render(true);
  try{const value=await rpc('classroom_instructor_questions',{p_course:state.course});if(!current())return;if(!Array.isArray(value))throw Error('INVALID_INSTRUCTOR_RESPONSE');state.concepts=value;}
  catch(error){if(current()&&!accessLost(error))state.conceptError=error;}
  if(current()){state.conceptLoading=false;if(state.view==='attempts')render(true);}
 }
 async function loadCurrent(){clearTimeout(searchTimer);if(state.accessError)return;if(state.view==='overview')return loadOverview();if(state.view==='attempts'&&state.filters.attempts.section==='concepts')return loadConcepts();return loadList();}
 function cancelExport(){gate.cancel('export');state.exporting=false;state.exportProgress='';}
 function navigate(view){if(!views.some(([key])=>key===view))return;clearTimeout(searchTimer);cancelExport();state.view=view;render();content.focus({preventScroll:true});void loadCurrent();}
 function closeSheet(){gate.cancel('sheet');gate.cancel('history');state.sheet=null;if(detail.open)detail.close();}
 function showSheet(label,body){if(!detail.open)returnFocus=doc.activeElement;detail.innerHTML='<header class="sheet-head"><span>'+E(label)+'</span><button class="icon-btn" type="button" data-action="close-sheet" aria-label="بستن جزئیات">'+icon('close')+'</button></header><div class="sheet-body">'+body+'</div>';if(!detail.open)detail.showModal();}
 function renderStudent(){const s=state.sheet;if(!s||!['student','request'].includes(s.kind))return;
  let body='<h2 id="instructor-detail-title">'+(s.kind==='request'?'بررسی درخواست':'پروندهٔ آموزشی')+'</h2>';
  if(s.error)body+=failure(s.error,'retry-student');else if(!s.person)body+=loading('در حال دریافت پرونده…');else{
   const p=s.person;body='<h2 id="instructor-detail-title">'+E(p.name||p.email)+'</h2><bdi class="email">'+E(p.email)+'</bdi><div class="sheet-meta">'+statusPill(p)+'<span class="small muted">'+(s.kind==='request'?'درخواست: '+E(date(p.requested_at)):'آخرین ثبت آموزشی: '+E(relative(p.last_registered_at)))+'</span></div>';
   if(s.kind==='request')body+='<section class="sheet-section"><h3>عضویت در '+E(courseTitle())+'</h3><p class="small muted">با تأیید، دسترسی این حساب به محتوای کلاس فعال می‌شود.</p><div class="confirm-actions"><button class="btn" type="button" data-action="close-sheet">بررسی در فرصت دیگر</button><button class="btn primary" type="button" data-approve="'+E(p.user_id)+'" '+(p.status==='active'?'disabled':'')+'>تأیید دسترسی</button></div></section>';
   else body+='<div class="sheet-stats"><div class="sheet-stat"><span>XP لابراتورها</span><strong>'+xpHTML(p.lab)+'</strong></div><div class="sheet-stat"><span>آخرین نمرهٔ آزمون</span><strong>'+grade(p.latest_quiz)+'</strong></div></div><section class="sheet-section"><h3>مسیر لابراتورها</h3>'+p.lab.missions.map(m=>'<div class="sheet-progress"><div class="progress-line"><strong>'+E(labTitle(m))+'</strong><small>'+fa(m.completed.length)+' از '+fa(m.task_count)+' · <bdi class="mono">'+latin(m.xp)+' XP</bdi></small></div>'+bar(m.completed.length,m.task_count)+'<details class="instructor-task-details"><summary>مأموریت‌ها</summary><ul>'+m.tasks.map(t=>{const label=courseInfo()?.lessons.find(l=>l.lab?.mission===m.mission)?.lab_steps?.find(step=>step.id===t.id)?.title||'مأموریت '+fa(t.position);return '<li><span aria-hidden="true">'+(m.completed.includes(t.id)?'✓':'○')+'</span> '+E(label)+(m.completed.includes(t.id)?'<span class="small muted"> · انجام‌شده</span>':'')+'</li>';}).join('')+'</ul></details></div>').join('')+'</section><section class="sheet-section"><h3>ثبت‌های آزمون · '+fa(p.quiz_attempts)+' ثبت</h3>'+historyHTML(s.history)+'</section><section class="sheet-section"><button class="btn '+(p.status==='active'?'danger':'')+'" type="button" data-membership="'+E(p.user_id)+'">'+(p.status==='active'?'غیرفعال‌کردن دسترسی':'فعال‌کردن دسترسی')+'</button></section>';
  }
  showSheet(s.kind==='request'?'بررسی درخواست':'پروندهٔ آموزشی دانشجو',body);
 }
 function historyHTML(h){if(!h||h.loading)return loading('در حال دریافت ثبت‌های آزمون…');if(h.error)return failure(h.error,'retry-history');
  return (h.rows.map(a=>'<button class="attempt-link" type="button" data-attempt="'+E(a.id)+'" data-from-student="'+E(state.sheet.user)+'"><span>'+E(noteLabel(a.lesson_id))+' · نسخهٔ '+fa(a.version)+'<small>'+E(date(a.created_at))+' · '+(a.attempt_no===1?'اولین ثبت':'تلاش '+fa(a.attempt_no))+'</small></span><span>'+grade(a)+' ←</span></button>').join('')||'<p class="small muted">هنوز آزمونی ثبت نشده است.</p>')+
   '<div class="pages instructor-history-pages"><button class="btn small-btn" type="button" data-history-page="-1" '+(h.index===0?'disabled':'')+'>قبلی</button><span class="small muted">صفحهٔ '+fa(h.index+1)+'</span><button class="btn small-btn" type="button" data-history-page="1" '+(!h.next_cursor?'disabled':'')+'>بعدی</button></div>';
 }
 async function loadHistory(){const s=state.sheet;if(s?.kind!=='student')return;const current=gate.ticket('history');const h=s.history||{index:0,cursors:[null],asOf:null};h.loading=true;s.history=h;renderStudent();
  try{const page=reportPage(await rpc('classroom_instructor_attempts',{p_course:state.course,p_user:s.user,p_limit:5,p_after:h.cursors[h.index],p_as_of:h.asOf}));if(!current()||state.sheet!==s)return;s.history={...h,...page,loading:false,asOf:page.as_of};}
  catch(error){if(current()&&!accessLost(error)&&state.sheet===s)s.history={...h,loading:false,error};}
  if(current()&&state.sheet===s)renderStudent();
 }
 async function studentSheet(user,kind='student'){
  gate.cancel('sheet');gate.cancel('history');const current=gate.ticket('sheet');state.sheet={kind,user,person:null,history:{index:0,cursors:[null],asOf:null,loading:true}};renderStudent();detail.scrollTop=0;
  try{const value=studentReport(await rpc('classroom_instructor_student',{p_course:state.course,p_user:user}));if(!current())return;state.sheet.person=value;renderStudent();if(kind==='student')void loadHistory();}
  catch(error){if(current()&&!accessLost(error)){state.sheet.error=error;renderStudent();}}
 }
 function codeHTML(q){if(!q?.code)return '';const blanks=q.blanks||[];return '<div class="instructor-code"><span>Python</span><pre dir="ltr" tabindex="0">'+E(q.code).replace(/\{\{(\w+)\}\}/g,(_m,id)=>'['+(blanks.findIndex(b=>b.id===id)>=0?String.fromCharCode(65+blanks.findIndex(b=>b.id===id)):E(id))+']')+'</pre></div>';}
 function figureHTML(figure){if(!figure||!renderFigure)return '';try{
  const valid=p=>Array.isArray(p)&&p.length===2&&p.every(x=>typeof x==='number'&&Number.isFinite(x));
  if(figure.type==='distance2d'&&valid(figure.u)&&valid(figure.v)||figure.type==='knn2d'&&valid(figure.query)&&Array.isArray(figure.points)&&figure.points.every(p=>valid(p.x)&&[0,1].includes(p.y)))return '<div class="instructor-question-figure">'+renderFigure(figure)+'</div>';
 }catch{}return '';}
 function answersHTML(record){const prompts=Object.fromEntries((record.prompts||[]).map(p=>[p.id,p]));return (record.result?.items||[]).map((item,i)=>{
  const q=prompts[item.id],answer=record.answers?.[item.id],parts=item.parts||[];
  let response;if(parts.length){response='<div class="table-scroll"><table class="instructor-answer-table"><caption>پاسخ هر جای خالی</caption><thead><tr><th scope="col">جای خالی</th><th scope="col">پاسخ دانشجو</th><th scope="col">نتیجه</th><th scope="col">پاسخ پذیرفته‌شده</th></tr></thead><tbody>'+parts.map((p,n)=>'<tr><th scope="row">'+String.fromCharCode(65+n)+'</th><td><bdi dir="ltr">'+E(answer?.[p.id]??'—')+'</bdi></td><td>'+(p.correct?'درست':'نادرست')+'</td><td><bdi dir="ltr">'+E((p.accepted||[]).map(v=>q?.blanks?.find(b=>b.id===p.id)?.input_kind==='stringLiteral'?JSON.stringify(v):v).join(' / '))+'</bdi></td></tr>').join('')+'</tbody></table></div>';}
  else{const selected=q?.options?.find(o=>o[0]===answer)?.[1]??answer,correct=q?.options?.find(o=>o[0]===item.key)?.[1];response='<dl><dt>پاسخ دانشجو</dt><dd>'+inline(typeof selected==='string'?selected:'پاسخی ثبت نشده بود.')+'</dd>'+(correct!=null?'<dt>پاسخ معیار</dt><dd>'+inline(correct)+'</dd>':'')+'</dl>';}
  const outcome=item.correct?'درست':Number(item.score)>0?'بخشی درست':'نادرست';return '<article class="answer"><header><span>سؤال '+fa(i+1)+' · '+E(item.skill||item.id)+'</span><span class="pill '+(item.correct?'':'pending')+'">'+outcome+' · '+grade(item)+'</span></header>'+(q?'<p>'+inline(q.stem)+'</p>'+figureHTML(q.figure)+codeHTML(q):'<p class="small muted">متن این نسخهٔ سؤال در دسترس نیست؛ نتیجهٔ ثبت‌شده حفظ شده است.</p>')+response+'<p class="small muted top-gap">'+inline(item.explanation||'')+'</p>'+(item.selected_feedback?'<p class="small muted">'+inline(item.selected_feedback)+'</p>':'')+'</article>';
 }).join('')||'<p class="small muted">جزئیات پاسخ‌های این ثبت در دسترس نیست.</p>';}
 function renderAttempt(){const s=state.sheet;if(s?.kind!=='attempt')return;let body='<h2 id="instructor-detail-title">بررسی پاسخ آزمون</h2>';
  if(s.from)body='<button class="quiet sheet-back" type="button" data-student="'+E(s.from)+'">→ بازگشت به دانشجو</button>'+body;
  if(s.error)body+=failure(s.error,'retry-attempt');else if(!s.record)body+=loading('در حال دریافت پاسخ‌ها…');else{const a=s.record;body+='<p class="small muted">'+E(lessonInfo(a.lesson_id)?.title||s.row?.title||a.lesson_id)+'</p><div class="sheet-meta"><span>'+E(s.row?.name||'')+'</span><span class="pill">نسخهٔ '+fa(a.version)+'</span><span class="pill off">'+(a.attempt_no===1?'اولین ثبت نهایی':'تلاش '+fa(a.attempt_no))+'</span></div><div class="sheet-stats"><div class="sheet-stat"><span>نمرهٔ همین ثبت</span><strong>'+grade(a.result)+'</strong></div><div class="sheet-stat"><span>زمان ثبت</span><strong class="instructor-date">'+E(date(a.created_at,true))+'</strong></div></div><section class="sheet-section"><h3>پاسخ‌های ثبت‌شده</h3>'+answersHTML(a)+'</section>';}
  showSheet('بررسی پاسخ آزمون',body);
 }
 async function attemptSheet(id,from=null){
  const row=state.pages.attempts?.rows?.find(a=>a.id===id)||state.sheet?.history?.rows?.find(a=>a.id===id);
  gate.cancel('history');const current=gate.ticket('sheet');state.sheet={kind:'attempt',id,from,row};renderAttempt();detail.scrollTop=0;
  try{const record=await rpc('classroom_attempt',{p_id:id});if(!current())return;if(!record?.result||!record.lesson_id||!lessons().some(l=>l.id===record.lesson_id))throw Error('INVALID_INSTRUCTOR_RESPONSE');state.sheet.record=record;renderAttempt();}
  catch(error){if(current()&&!accessLost(error)){state.sheet.error=error;renderAttempt();}}
 }
 function questionSheet(index){const r=state.concepts?.[index];if(!r)return;gate.cancel('sheet');gate.cancel('history');state.sheet={kind:'question'};
  const counts=Object.entries(r.choice_counts||{}).sort((a,b)=>b[1]-a[1]);
  showSheet('تحلیل سؤال','<h2 id="instructor-detail-title">'+E(r.skill||r.question_id)+'</h2><p class="small muted top-gap">'+E(noteLabel(r.lesson_id))+' · نسخهٔ '+fa(r.version)+' · اولین ثبت نهایی</p><section class="sheet-section"><p>'+inline(r.stem||'متن سؤال در دسترس نیست.')+'</p>'+figureHTML(r.figure)+codeHTML(r)+'<div class="sheet-stats top-gap"><div class="sheet-stat"><span>تعداد پاسخ‌ها</span><strong>'+fa(r.responses)+'</strong></div><div class="sheet-stat"><span>پاسخ کاملِ درست</span><strong>'+fa(r.correct)+'</strong></div></div>'+(counts.length?'<h3 class="top-gap">گزینه‌های انتخاب‌شده</h3>'+counts.map(([key,n])=>'<div class="answer"><p>'+inline(r.options?.find(o=>o[0]===key)?.[1]||key)+'</p><small>'+fa(n)+' پاسخ</small></div>').join(''):'<p class="small muted top-gap">برای سؤال‌های جای خالی، جزئیات هر پاسخ در ثبت آزمون قابل بررسی است.</p>')+'</section>');detail.scrollTop=0;
 }
 function knownPerson(user){if(state.sheet?.person?.user_id===user)return state.sheet.person;return Object.values(state.pages).flatMap(p=>p.rows||[]).find(p=>p.user_id===user&&p.status);}
 async function askMembership(user){const current=gate.ticket('prepare-member'),course=state.course;let p=knownPerson(user);if(!p){await studentSheet(user,'request');p=state.sheet?.person;}if(!current()||course!==state.course||p?.user_id!==user)return;
  const enable=p.status!=='active';state.confirmation={course:state.course,user,status:enable?'active':'suspended',name:p.name,email:p.email,busy:false};renderConfirmation();confirmation.showModal();
 }
 function renderConfirmation(){const c=state.confirmation;if(!c)return;const enable=c.status==='active';
  confirmation.innerHTML='<h2 id="instructor-confirm-title">'+(enable?'تأیید دسترسی به کلاس':'غیرفعال‌کردن دسترسی')+'</h2><p>'+E(c.name)+'<br><bdi>'+E(c.email)+'</bdi></p><p>'+(enable?'این حساب به محتوای کلاس دسترسی خواهد داشت.':'دسترسی این حساب متوقف می‌شود؛ نمره‌ها، XP و کارهای قبلی حفظ می‌شوند.')+'</p>'+(c.error?'<p role="alert">'+E(message(c.error))+'</p>':'')+(c.busy?'<p role="status">در حال ثبت وضعیت…</p>':'')+'<div class="confirm-actions"><button class="btn" type="button" data-action="cancel-confirm" '+(c.busy?'disabled':'')+'>انصراف</button><button class="btn '+(enable?'primary':'danger')+'" type="button" data-action="confirm-member" '+(c.busy?'disabled':'')+'>'+(enable?'تأیید دسترسی':'غیرفعال‌کردن')+'</button></div>';
 }
 async function commitMembership(){const c=state.confirmation;if(!confirmation.open||!c||c.busy||c.course!==state.course||!gate.current())return;const current=gate.ticket('membership');c.busy=true;c.error=null;state.mutating=true;renderConfirmation();renderNav();
  try{await rpc('classroom_membership',{p_course:c.course,p_user:c.user,p_status:c.status});if(!current())return;state.mutating=false;if(confirmation.open)confirmation.close();state.confirmation=null;closeSheet();
   for(const f of Object.values(state.filters))resetPages(f);state.pages={};state.overviewError=null;toast('دسترسی '+c.name+' '+(c.status==='active'?'فعال':'غیرفعال')+' شد.');
   if(state.view==='overview')await loadOverview();else await Promise.allSettled([loadOverview(),loadCurrent()]);
  }catch(error){if(current()&&!accessLost(error)){c.busy=false;c.error=error;state.mutating=false;state.confirmation=c;renderConfirmation();renderNav();}}
 }
 async function exportCSV(){if(state.exporting||!['students','attempts','labs'].includes(state.view))return;const current=gate.ticket('export'),view=state.view,filter={...state.filters[view]},course=state.course;state.exporting=true;state.exportProgress='در حال دریافت همهٔ ردیف‌های فیلترشده…';render(true);
  try{const name=view==='attempts'?'classroom_instructor_attempts':'classroom_instructor_students';
   const rows=await collectPages(args=>rpc(name,args),pageArgs(view,course,filter,100),{alive:current,onProgress:(n,total)=>{if(current()){state.exportProgress=fa(n)+' از '+fa(total)+' ردیف دریافت شد.';render(true);}}});
   if(!current())return;const blob=new Blob([csvText(exportRows(view,rows,filter.mission))],{type:'text/csv;charset=utf-8'}),link=doc.createElement('a'),href=URL.createObjectURL(blob);urls.add(href);link.href=href;link.download='classroom-'+view+'-'+new Date().toISOString().slice(0,10)+'.csv';link.click();setTimeout(()=>{URL.revokeObjectURL(href);urls.delete(href);},3000);toast('CSV شامل '+fa(rows.length)+' ردیف فیلترشده آماده شد.');
  }catch(error){if(current()&&!accessLost(error))toast(message(error));}finally{if(current()){state.exporting=false;render(true);}}
 }
 function changeCourse(course){if(!courses.some(c=>c.course_id===course)||course===state.course)return;clearTimeout(searchTimer);gate.invalidate();closeSheet();if(confirmation.open)confirmation.close();Object.assign(state,{course,overview:null,overviewError:null,overviewLoading:true,filters:freshFilters(),pages:{},concepts:null,conceptError:null,conceptLoading:false,exporting:false,confirmation:null,mutating:false,accessError:null});render();void loadOverview();if(state.view!=='overview')void loadCurrent();}
 function click(e){const b=e.target.closest('button');if(!b||b.disabled||!root.contains(b)||!gate.current())return;
  if(b.dataset.view)navigate(b.dataset.view);
  else if(b.dataset.student)void studentSheet(b.dataset.student);
  else if(b.dataset.request)void studentSheet(b.dataset.request,'request');
  else if(b.dataset.attempt)void attemptSheet(b.dataset.attempt,b.dataset.fromStudent||null);
  else if(b.hasAttribute('data-question'))questionSheet(Number(b.dataset.question));
  else if(b.dataset.approve||b.dataset.membership)void askMembership(b.dataset.approve||b.dataset.membership);
  else if(b.dataset.section){cancelExport();state.filters.attempts.section=b.dataset.section;render();void loadCurrent();}
  else if(b.dataset.mission){cancelExport();state.filters.labs.mission=b.dataset.mission;render();}
  else if(b.dataset.page){const f=state.filters[state.view],page=state.pages[state.view];if(!page||page.loading)return;const direction=Number(b.dataset.page);if(direction>0){if(!page.next_cursor)return;f.cursors[f.index+1]=page.next_cursor;f.index++;}else f.index=Math.max(0,f.index-1);void loadList();}
  else if(b.dataset.historyPage){const h=state.sheet?.history;if(!h||h.loading)return;if(Number(b.dataset.historyPage)>0){if(!h.next_cursor)return;h.cursors[h.index+1]=h.next_cursor;h.index++;}else h.index=Math.max(0,h.index-1);void loadHistory();}
  else switch(b.dataset.action){
   case 'close-sheet':closeSheet();break;
   case 'cancel-confirm':confirmation.close();state.confirmation=null;break;
   case 'confirm-member':void commitMembership();break;
   case 'export':void exportCSV();break;
   case 'concepts':state.filters.attempts.section='concepts';navigate('attempts');break;
   case 'retry-concepts':void loadConcepts();break;
   case 'retry-student':if(state.sheet)void studentSheet(state.sheet.user,state.sheet.kind);break;
   case 'retry-history':void loadHistory();break;
   case 'retry-attempt':if(state.sheet)void attemptSheet(state.sheet.id,state.sheet.from);break;
   case 'clear':state.filters[state.view].query='';resetPages(state.filters[state.view]);void loadList();break;
   case 'retry':case 'refresh':cancelExport();if(state.filters[state.view])resetPages(state.filters[state.view]);if(state.view==='overview')void loadOverview();else{void loadCurrent();void loadOverview();}break;
  }
 }
 function search(e){if(!e.target.hasAttribute('data-search')||e.isComposing||composing)return;const view=state.view,f=state.filters[view];if(!f)return;f.query=e.target.value.slice(0,120);resetPages(f);gate.cancel('list-'+view);cancelExport();clearTimeout(searchTimer);searchTimer=setTimeout(()=>{if(gate.current()&&state.view===view)void loadList(view);},250);}
 function change(e){if(e.target.hasAttribute('data-course'))changeCourse(e.target.value);else if(e.target.dataset.filter){const f=state.filters[state.view];f[e.target.dataset.filter]=e.target.dataset.filter==='lesson'?e.target.value||null:e.target.value;resetPages(f);cancelExport();void loadCurrent();}}
 const startComposition=()=>{composing=true;},endComposition=e=>{composing=false;search(e);};
 const restoreFocus=()=>{if(!gate.current())return;if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});else nav.querySelector('[aria-current="page"]')?.focus({preventScroll:true});};
 const onSheetClose=()=>{if(detail.open)return;gate.cancel('sheet');gate.cancel('history');state.sheet=null;detail.replaceChildren();restoreFocus();};
 const onConfirmClose=()=>{if(!confirmation.open){state.confirmation=null;confirmation.replaceChildren();}};
 const onConfirmCancel=e=>{if(state.confirmation?.busy)e.preventDefault();};
 const outside=e=>{const d=e.currentTarget;if(e.target!==d||d===confirmation&&state.confirmation?.busy)return;const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();};
 root.addEventListener('click',click);root.addEventListener('input',search);root.addEventListener('change',change);root.addEventListener('compositionstart',startComposition);root.addEventListener('compositionend',endComposition);detail.addEventListener('close',onSheetClose);detail.addEventListener('click',outside);confirmation.addEventListener('click',outside);confirmation.addEventListener('cancel',onConfirmCancel);confirmation.addEventListener('close',onConfirmClose);
 render();const ready=loadOverview();
 return {ready,dispose(){gate.dispose();clearTimeout(searchTimer);clearTimeout(toastTimer);for(const u of urls)URL.revokeObjectURL(u);urls.clear();root.removeEventListener('click',click);root.removeEventListener('input',search);root.removeEventListener('change',change);root.removeEventListener('compositionstart',startComposition);root.removeEventListener('compositionend',endComposition);detail.removeEventListener('close',onSheetClose);detail.removeEventListener('click',outside);confirmation.removeEventListener('click',outside);confirmation.removeEventListener('cancel',onConfirmCancel);confirmation.removeEventListener('close',onConfirmClose);if(detail.open)detail.close();if(confirmation.open)confirmation.close();state.overview=null;state.pages={};state.concepts=null;state.sheet=null;state.confirmation=null;root.replaceChildren();}};
}
