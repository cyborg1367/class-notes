import React,{useId,useMemo,useState} from 'react';
import type {PublicLesson,PublicCourse} from '../catalog/types';
import {lessonNumber, orderedLessons} from '../catalog/order';
import {courseTopics,matchCourseRows} from '../course-filter-model.mjs';
import {PaperButton} from '../components/PaperButton';
import artwork from '../assets/course-figure.svg?raw';

export type Lesson=PublicLesson;
export type Course=PublicCourse;
type Result={version:number;score:number|null;maximum:number|null;href:string|null};
export type CourseView={phase:string;ownerId:string|null;opened:string[];last:string|null;results:Record<string,Result>;busy:string|null;error:string;loginURL?:string;dashboardURL?:string};
export type ViewChannel={perform:(name:string)=>Promise<unknown>};
const fa=(n:number)=>new Intl.NumberFormat('fa-IR').format(n);
const en=(n:number)=>String(n);

function hrefFor(course:Course,id:string){
  if(!/^[a-z0-9]+(?:[/-][a-z0-9]+)*$/.test(id))throw Error('INVALID_COURSE_ROUTE');
  if(id.startsWith(course.id+'/'))return id.slice(course.id.length+1)+'/';
  return '../'.repeat(course.id.split('/').length)+id+'/';
}

export function CourseAccess({view,channel}:{view:CourseView;channel:ViewChannel}){
  const busy=Boolean(view.busy), dashboard=view.dashboardURL||'../dashboard/';
  const headings:Record<string,string>={loading:'در حال بررسی دسترسی کلاس…',guest:'برای مطالعه وارد شو',error:'اطلاعات کلاس دریافت نشد',active:'عضویت این کلاس فعال است',pending:'درخواست عضویت ثبت شده است',suspended:'دسترسی این کلاس غیرفعال است',restricted:'عضویت این کلاس نیاز به پیگیری دارد',unregistered:'به کلاس بپیوند'};
  const descriptions:Record<string,string>={loading:'فهرست یادداشت‌ها در دسترس است؛ وضعیت حساب در حال بررسی است.',guest:'یادداشت‌ها و تمرین‌ها برای اعضای تأییدشدهٔ کلاس در دسترس‌اند.',error:'وضعیت دسترسی مشخص نشد. دریافت اطلاعات را دوباره امتحان کن.',active:'یادداشت‌ها و تمرین‌های این مسیر برای حساب تو در دسترس‌اند.',pending:'پس از تأیید مدرس، دسترسی به محتوای کلاس فعال می‌شود.',suspended:'برای پیگیری وضعیت دسترسی با مدرس در ارتباط باش.',restricted:'وضعیت این عضویت را با مدرس بررسی کن.',unregistered:'درخواست عضویت بفرست؛ دسترسی پس از تأیید مدرس فعال می‌شود.'};
  const perform=(action:string)=>{void channel.perform(action)};
  return <div className="course-membership" data-course-membership="" aria-busy={busy||view.phase==='loading'}>
    <section className={`gate-card course-access-notice course-access-${view.phase}`} aria-labelledby="course-access-title">
      <div className="course-access-copy"><h2 id="course-access-title">{headings[view.phase]||headings.error}</h2><p>{descriptions[view.phase]||descriptions.error}</p>{view.error&&<p className="course-access-error" role="alert">{view.error}</p>}</div>
      <div className="portal-actions course-access-actions" hidden={view.phase==='loading'}>
        {view.phase==='guest'&&<PaperButton href={view.loginURL||'../account/'} login>ورود با <bdi lang="en">Google</bdi><span aria-hidden="true">←</span></PaperButton>}
        {view.phase==='active'&&<PaperButton secondary href={dashboard}>داشبورد من ←</PaperButton>}
        {view.phase==='unregistered'&&<PaperButton disabled={busy} onClick={()=>perform('request-access')}>{busy?'در حال ثبت درخواست…':'درخواست عضویت'}</PaperButton>}
        {['pending','suspended','restricted'].includes(view.phase)&&<PaperButton secondary href={dashboard}>داشبورد من ←</PaperButton>}
        {['error','pending','suspended','restricted'].includes(view.phase)&&<PaperButton secondary disabled={busy} onClick={()=>perform('refresh')}>{busy?'در حال دریافت…':'بررسی دوباره'}</PaperButton>}
      </div>
    </section>
  </div>;
}

function LessonCard({lesson,index,course,view}:{lesson:Lesson;index:number;course:Course;view:CourseView}){
  const ordinal=lesson.ordinal??lessonNumber(lesson.number,index),result=view.phase==='active'?view.results[lesson.id]:null;
  return <li><article className="dashboard-lesson course-lesson" data-course-lesson={lesson.id}>
    <span className="lesson-order" dir="ltr" lang="en" aria-label={`یادداشت ${ordinal}`}>{String(ordinal).padStart(2,'0')}</span>
    <div className="lesson-details"><h2>{lesson.title}</h2><p className="lesson-subtitle">{lesson.subtitle}</p><p>{lesson.description}</p>
      <div className="expertise" aria-label="موضوع‌های یادداشت">{lesson.tags?.map(tag=><span className="pill" dir="auto" key={tag}>{tag}</span>)}</div>
      {view.phase==='active'&&<p className="small-note" data-study-status="">{view.opened.includes(lesson.id)?'در این مرورگر باز شده است.':'هنوز در این مرورگر باز نشده است.'}</p>}
      {view.phase==='active'&&Boolean(lesson.quiz_version)&&<p className="small-note" data-course-result="">{result?<>آخرین نتیجهٔ نسخهٔ <bdi>{en(result.version)}</bdi>: {result.score!==null&&result.maximum!==null?<bdi dir="ltr">{en(result.score)} / {en(result.maximum)}</bdi>:'برای مشاهده باز کن'}{result.href&&<> · <a href={result.href}>مشاهدهٔ نتیجه</a></>}</>:'برای این نسخه از آزمون هنوز نتیجه‌ای ثبت نشده است.'}</p>}
    </div>
    <div className="portal-actions"><PaperButton href={hrefFor(course,lesson.id)} label={`مطالعهٔ ${lesson.title}`}>مطالعهٔ یادداشت <span aria-hidden="true">←</span></PaperButton>
      {lesson.lab&&<PaperButton secondary href={hrefFor(course,lesson.lab.path.replace(/\/$/,''))} label={`لابراتورِ ${lesson.title}`}>لابراتور کدنویسی</PaperButton>}
      {Boolean(lesson.quiz_version)&&<PaperButton secondary href={hrefFor(course,'quiz/'+lesson.id)} label={`تمرین و آزمونِ ${lesson.title}`}>تمرین و آزمون</PaperButton>}
    </div>
  </article></li>;
}

export function CoursePage({course,view,channel}:{course:Course;view:CourseView;channel:ViewChannel}){
  const [query,setQuery]=useState(''),[topic,setTopic]=useState('');
  const searchId=useId(),topicId=useId();
  const lessons=useMemo(()=>orderedLessons(course.lessons).map(({lesson,number})=>({...lesson,ordinal:number})),[course]);
  const rows=useMemo(()=>lessons.map(lesson=>({id:lesson.id,tags:lesson.tags||[],search:[lesson.ordinal,String(lesson.ordinal).padStart(2,'0'),lesson.title,lesson.subtitle||'',lesson.description||'',...(lesson.tags||[])].join(' ')})),[lessons]);
  const topics=useMemo(()=>courseTopics(rows),[rows]);
  const matches=useMemo(()=>new Set(matchCourseRows(rows,query,topic).map(row=>row.id)),[rows,query,topic]);
  const filtered=Boolean(query.trim()||topic);
  const resume=view.phase==='active'?lessons.find(lesson=>lesson.id===view.last):null;
  const start=resume||lessons[0];
  const reset=()=>{setQuery('');setTopic('')};
  return <>
    <header className="paper-course-hero"><div className="paper-course-copy"><h1 className="course-title" dir="auto">{course.display_title||course.title}</h1>
      <p className="paper-course-lead">از <span className="paper-mark">فهم داده</span> تا ساختن مدل</p><p className="paper-course-description">{course.description}</p>
      <div className="paper-instructor"><span className="initials" dir="ltr" aria-hidden="true">MA</span><div>مدرس دوره<strong lang="en" dir="ltr">Masoud Ahangary</strong></div></div>
      {start&&<section className="course-start" aria-labelledby="course-start-title"><div className="course-start-copy" hidden={!resume}><h2 id="course-start-title">آخرین یادداشت بازشده در این مرورگر</h2><p data-course-start-description="">{resume?.title||start.title}</p></div><a className="button-forest" data-course-continue="" href={hrefFor(course,start.id)}>{resume?'ادامهٔ مطالعه':<>شروع از یادداشت <bdi>{String(start.ordinal).padStart(2,'0')}</bdi></>}<span aria-hidden="true">←</span></a></section>}
    </div><figure className="paper-course-figure"><div dangerouslySetInnerHTML={{__html:artwork}}/><span className="graph-note graph-note-sample">هر نقطه، یک نمونه</span><span className="graph-note graph-note-query">پرس‌وجوی جدید</span><figcaption>نمای مفهومیِ فضای ویژگی‌ها</figcaption></figure></header>
    <section className="paper-outline" aria-labelledby="course-outline-title"><div className="section-heading"><div><h2 id="course-outline-title">یادداشت‌های کلاس</h2><p className="outline-note">پیشنهاد مطالعه: به ترتیب شماره‌ها</p></div>{view.phase==='active'&&<a className="quiet-link" data-course-results-link="" href={(view.dashboardURL||'../dashboard/')+'#results'}>نتایج من ←</a>}</div>
      <div className="course-filter"><div className="course-toolbar"><div className="course-filter-fields" role="search" aria-label="جست‌وجو در یادداشت‌های دوره"><div className="course-search-field"><label className="course-visually-hidden" htmlFor={searchId}>جست‌وجوی عنوان یا موضوع یادداشت</label><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg><input id={searchId} type="search" value={query} onInput={event=>setQuery(event.currentTarget.value)} placeholder="جست‌وجوی یادداشت…" autoComplete="off" spellCheck={false} aria-controls="course-lessons-list"/></div><div className="course-topic-field"><label className="course-visually-hidden" htmlFor={topicId}>انتخاب موضوع</label><select id={topicId} value={topic} onChange={event=>setTopic(event.currentTarget.value)} aria-controls="course-lessons-list"><option value="">همهٔ موضوع‌ها</option>{topics.map(label=><option key={label} value={label}>{label}</option>)}</select></div></div><p className="course-count" role="status" aria-live="polite" aria-atomic="true">{filtered?`${fa(matches.size)} از ${fa(rows.length)} یادداشت`:`${fa(rows.length)} یادداشت`}</p></div>
      {filtered&&<div className="course-filter-meta"><button type="button" onClick={reset}>پاک‌کردن فیلترها <span aria-hidden="true">×</span></button></div>}
      {matches.size===0&&<div className="course-search-empty"><p>یادداشتی با این جست‌وجو پیدا نشد.</p><button type="button" onClick={reset}>نمایش همهٔ یادداشت‌ها ←</button></div>}</div>
      <ol className="lesson-path" id="course-lessons-list">{lessons.filter(lesson=>matches.has(lesson.id)).map((lesson,index)=><LessonCard key={lesson.id} lesson={lesson} index={index} course={course} view={view}/>)}</ol>
    </section><CourseAccess view={view} channel={channel}/>
  </>;
}
