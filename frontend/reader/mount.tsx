import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { LessonInfo, ReaderAccess, ReaderOptions, ReaderView } from './contracts';
import { prepareLesson } from './prepare';
import { ReaderDocument } from './ReaderDocument';
import { createReaderResources, type ReaderResources } from './resources';

function LessonTrail({ info, href }: { info: LessonInfo; href: ReaderOptions['href'] }) {
  return <nav className="shell route-trail" aria-label="مسیر صفحه"><ol>
    <li><a href={href('index.html')}>صفحهٔ اصلی</a></li>
    <li><a href={href('index.html#classes')}>کلاس‌ها</a></li>
    <li><a href={href(info.course.id + '/')} dir="auto">{info.course.display_title || info.course.title}</a></li>
    <li><span aria-current="page">یادداشت <bdi dir="ltr">{info.number}</bdi> · {info.title}</span></li>
  </ol></nav>;
}
function LessonShortcuts({ info, href }: { info: LessonInfo; href: ReaderOptions['href'] }) {
  return <nav className="shell lesson-shortcuts" aria-label="دسترسی‌های یادداشت">
    <a className="quiet-link" href={href(info.course.id + '/')}>فهرست یادداشت‌های کلاس ←</a>
    {info.lab && <a className="button-forest" href={href(info.lab.path)}>ورود به لابراتور کدنویسی ←</a>}
    {info.quiz_version && <a className="button-outline" href={href('quiz/' + info.id + '/')}>تمرین و آزمون این یادداشت</a>}
  </nav>;
}
function Gate({ access, options }: { access: ReaderAccess; options: ReaderOptions }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const action = async (request: boolean) => {
    if (busy || !options.current()) return;
    setBusy(true);
    setError(false);
    try { await options.refreshAccess(request); }
    catch { if (options.current()) setError(true); }
    finally { if (options.current()) setBusy(false); }
  };
  if (access.kind === 'guest') return <div className="gate-card">
    <h2>برای ادامه وارد شو.</h2><p>متن یادداشت‌ها و آزمون‌ها فقط برای اعضای تأییدشدهٔ کلاس در دسترس است.</p>
    <div className="portal-actions"><a className="button-forest" href={access.login} data-login-link="">ورود با Google ←</a></div>
  </div>;
  const message = {
    error: 'ورود انجام شده، اما اطلاعات کلاس دریافت نشد. کمی بعد دوباره امتحان کن.',
    pending: 'درخواستت ثبت شده است؛ پس از تأیید مدرس، دسترسی فعال می‌شود.',
    suspended: 'دسترسی این کلاس فعلاً غیرفعال است. برای پیگیری با مدرس در ارتباط باش.',
    restricted: 'برای پیگیری وضعیت عضویت با مدرس در ارتباط باش.',
    unregistered: 'برای این کلاس درخواست عضویت بده؛ دسترسی پس از تأیید مدرس فعال می‌شود.',
  }[access.kind];
  return <div className="gate-card" aria-busy={busy}>
    <h2>{access.kind === 'error' ? 'اطلاعات کلاس دریافت نشد.' : 'عضویت در کلاس'}</h2><p>{message}</p>
    <div className="portal-actions">
      {access.kind === 'unregistered' && <button className="button-forest" type="button" disabled={busy}
        onClick={() => void action(true)}>درخواست دسترسی به کلاس</button>}
      <a className="button-outline" href={options.href('dashboard/')}>داشبورد ←</a>
      <button className="button-outline" type="button" disabled={busy} onClick={() => void action(false)}>
        {access.kind === 'error' ? 'تلاش دوباره' : 'به‌روزرسانی وضعیت عضویت'}
      </button>
    </div>
    {error && <p className="status-line" data-error="true" role="status">عملیات کامل نشد. دوباره تلاش کن.</p>}
  </div>;
}
function Reader({ state, options, files, doc }: {
  state: ReaderView & { prepared?: ReturnType<typeof prepareLesson> }; options: ReaderOptions; files: ReaderResources; doc: Document;
}) {
  const { info, href } = options;
  return <>
    <LessonTrail info={info} href={href} />
    {state.phase === 'ready' && state.prepared ? <>
      <LessonShortcuts info={info} href={href} />
      <ReaderDocument lesson={state.prepared} payload={state.payload} files={files} options={options} doc={doc} />
    </> : <section className="shell portal-main" id="top">
      <header className="page-head"><h1>{info.title}</h1></header>
      {state.phase === 'gate' ? <Gate access={state.access} options={options} />
        : state.phase === 'loading' ? <div className="page-loading" role="status" aria-busy="true">
          <span className="page-loading-line" /><span className="page-loading-line" /><span className="page-loading-line" />
          <p className="status-line">در حال دریافت یادداشت…</p>
        </div> : <div className="gate-card">
          <h2>دریافت یادداشت کامل نشد.</h2><p>اتصال را بررسی کن و دوباره تلاش کن.</p>
          <div className="portal-actions">
            <button type="button" className="button-forest" onClick={options.retry}>تلاش دوباره</button>
            <a className="button-outline" href={href('dashboard/')}>داشبورد ←</a>
          </div>
        </div>}
    </section>}
  </>;
}

export function mountLessonReader(host: HTMLElement, options: ReaderOptions) {
  const doc = host.ownerDocument, win = doc.defaultView;
  if (!win) throw Error('READER_WINDOW_UNAVAILABLE');
  const files = createReaderResources(win, options);
  const root = createRoot(host, { identifierPrefix: 'reader-' });
  host.dataset.readerReact = '';
  function render(state: ReaderView) {
    if (!files.alive()) return;
    const prepared = state.phase === 'ready' ? prepareLesson(doc, state.payload, options.info, options.href) : undefined;
    doc.body.classList.toggle('classroom-loaded', Boolean(prepared));
    root.render(<Reader state={{ ...state, prepared }} options={options} files={files} doc={doc} />);
  }
  return {
    render,
    dispose() {
      files.dispose();
      root.unmount();
      delete host.dataset.readerReact;
      doc.body.classList.remove('classroom-loaded');
    },
  };
}
