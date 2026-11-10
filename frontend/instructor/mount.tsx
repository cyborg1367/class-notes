import { useEffect, useRef, useSyncExternalStore } from 'react';
import { createRoot } from 'react-dom/client';
import { PaperIcon } from '../components/PaperIcon';
import { date, fa, message } from '../../web/assets/instructor-model.mjs';
import { Overview } from './Overview';
import { Reports } from './Reports';
import { Details } from './Details';
import { Empty, viewLabels } from './Presentation';
import { createInstructorController, type Controller } from './controller';
import type { InstructorOptions, View } from './contracts';

const views = [
  { id: 'overview', icon: 'dashboard', name: 'نمای کلی', title: 'نمای کلی کلاس', description: 'درخواست‌های منتظر، پیشرفت کلاس و موضوعات نیازمند مرور را ببینید.' },
  { id: 'students', icon: 'user', name: 'دانشجویان', title: 'دانشجویان', description: 'دسترسی، آخرین نتیجه و پیشرفت لابراتور هر دانشجو را بررسی کنید.' },
  { id: 'attempts', icon: 'quiz', name: 'آزمون‌ها', title: 'آزمون‌ها', description: 'پاسخ‌های ثبت‌شده و سؤال‌های نیازمند توضیح دوباره را ببینید.' },
  { id: 'labs', icon: 'lab', name: 'لابراتورها', title: 'لابراتورها', description: 'پیشرفت مأموریت‌ها را با XP ثبت‌شده دنبال کنید.' },
  { id: 'requests', icon: 'bell', name: 'درخواست‌ها', title: 'درخواست‌های عضویت', description: 'مشخصات حساب‌های تازه را بررسی کنید و دربارهٔ دسترسی تصمیم بگیرید.' },
] as const;

function Instructor({ controller, options }: { controller: Controller; options: InstructorOptions }) {
  const state = useSyncExternalStore(controller.subscribe, controller.getSnapshot);
  const labels = viewLabels(state, options.courses, options.catalog);
  const active = views.find(view => view.id === state.view)!;
  const heading = useRef<HTMLHeadingElement>(null), lastView = useRef<View>(state.view);
  useEffect(() => {
    if (lastView.current !== state.view) heading.current?.focus({ preventScroll: true });
    lastView.current = state.view;
  }, [state.view]);
  const canExport = ['students','attempts','labs'].includes(state.view) &&
    !(state.view === 'attempts' && state.filters.attempts.section === 'concepts');
  const refreshing = state.view === 'overview' ? state.overviewLoading : state.pages[state.view]?.loading || state.conceptLoading;

  return <div data-react-instructor="" className="instructor-react">
    <div className="instructor-app">
      <aside className="sidebar">
        <div className="teacher-side-brand"><PaperIcon name="dashboard" /><span>پنل مدرس</span></div>
        <nav className="side-nav" aria-label="بخش‌های پنل مدرس" data-instructor-nav="">
          {views.map(item => <button key={item.id} type="button" data-view={item.id} aria-current={item.id === state.view ? 'page' : undefined}
            onClick={() => controller.navigate(item.id)} disabled={state.mutating || Boolean(state.accessError)}>
            <PaperIcon name={item.icon} /><span>{item.name}</span>
            {item.id === 'requests' && Boolean(state.overview?.stats.pending_students) && <span className="count">{fa(state.overview!.stats.pending_students)}</span>}
          </button>)}
        </nav>
      </aside>
      <section className="content" aria-label="گزارش مدرس">
        <header className="teacher-header">
          <div className="teacher-context">
            <div className="teacher-course">
              {options.courses.length > 1 ? <>
                <label htmlFor="instructor-course">کلاس</label>
                <select id="instructor-course" data-course="" value={state.course} disabled={state.mutating} onChange={event => controller.changeCourse(event.target.value)}>
                  {options.courses.map(course => <option key={course.course_id} value={course.course_id}>{course.title}</option>)}
                </select>
              </> : <><span className="teacher-course-label">کلاس</span><bdi>{labels.courseTitle}</bdi></>}
            </div>
            {state.overview?.server_now && <span className="teacher-refresh-time">آخرین دریافت: {date(state.overview.server_now,true)}</span>}
          </div>
          <div className="page-heading">
            <div><h1 tabIndex={-1} ref={heading}>{active.title}</h1><p>{active.description}</p></div>
            {!state.accessError && <div className="heading-actions">
              {canExport && <button className="btn" type="button" disabled={state.exporting || Boolean(refreshing)} onClick={() => void controller.exportCSV()}>
                <PaperIcon name="download" />{state.exporting ? 'در حال آماده‌سازی…' : 'دریافت CSV'}
              </button>}
              <button className="btn" type="button" disabled={state.mutating || Boolean(refreshing)} onClick={() => void controller.refresh()}>
                {refreshing ? 'در حال دریافت…' : 'به‌روزرسانی'}
              </button>
            </div>}
          </div>
          {state.exporting && <p className="small muted" role="status">{state.exportProgress}</p>}
        </header>
        {state.accessError ? <section className="card"><Empty title="دسترسی مدرس تأیید نشد"
          action={<a className="btn" href={options.url('dashboard/')}>داشبورد ←</a>}>{message(state.accessError)}</Empty></section>
          : state.view === 'overview' ? <Overview state={state} labels={labels} actions={controller} />
          : <Reports state={state} labels={labels} actions={controller} />}
      </section>
    </div>
    <Details sheet={state.sheet} confirmation={state.confirmation} labels={labels} actions={controller} />
    <div className="toast" data-instructor-toast="" role="status" hidden={!state.toast}>{state.toast}</div>
  </div>;
}

export function mountInstructor(host: HTMLElement, options: InstructorOptions) {
  if (!options.courses.length) throw Error('TEACHER_REQUIRED');
  const doc = host.ownerDocument, win = doc.defaultView;
  if (!win) throw Error('INSTRUCTOR_WINDOW_UNAVAILABLE');
  const urls = new Map<string, number>();
  const controller = createInstructorController({ ...options, isCurrent: () => host.isConnected && options.isCurrent() }, (name,text) => {
    const href = win.URL.createObjectURL(new win.Blob([text],{type:'text/csv;charset=utf-8'}));
    const link = doc.createElement('a');link.href = href;link.download = name;link.hidden = true;
    doc.body.append(link);link.click();link.remove();
    urls.set(href,win.setTimeout(() => { win.URL.revokeObjectURL(href);urls.delete(href); },3000));
  });
  const root = createRoot(host, { identifierPrefix: 'instructor-' });
  root.render(<Instructor controller={controller} options={options} />);
  const ready = controller.loadOverview();
  return { ready, dispose() {
    controller.dispose();
    for (const [href,timer] of urls) { win.clearTimeout(timer);win.URL.revokeObjectURL(href); }
    urls.clear();root.unmount();
  } };
}
