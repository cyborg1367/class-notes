import { useRef, type ReactNode } from 'react';
import { date, relative, fa, latin, labFor } from '../../web/assets/instructor-model.mjs';
import type { Attempt, ListView, Page, Person, State } from './contracts';
import type { Controller } from './controller';
import { Bar, Empty, Failure, Grade, Loading, PersonCell, StatusPill, XP, type Labels } from './Presentation';
import { PaperIcon } from '../components/PaperIcon';

type Props = { state: State; labels: Labels; actions: Controller };

function Filters({ state, labels, actions, view }: Props & { view: Exclude<ListView,'requests'> }) {
  const filter = state.filters[view], composing = useRef(false);
  return <div className="toolbar">
    <label className="search" htmlFor="instructor-search"><PaperIcon name="search" />
      <input id="instructor-search" type="search" maxLength={120} autoComplete="off" value={filter.query}
        onCompositionStart={() => { composing.current = true; }}
        onCompositionEnd={event => { composing.current = false; actions.query(event.currentTarget.value); }}
        onChange={event => actions.query(event.currentTarget.value, !composing.current)}
        placeholder="جست‌وجوی نام یا ایمیل" aria-label="جست‌وجوی نام یا ایمیل" />
    </label>
    {view === 'students' && <select className="filter" aria-label="وضعیت دسترسی" value={filter.status}
      onChange={event => actions.changeFilter('status', event.target.value)}>
      <option value="enrolled">همهٔ وضعیت‌ها</option><option value="active">دارای دسترسی</option><option value="suspended">بدون دسترسی</option>
    </select>}
    {view === 'attempts' && <>
      <select className="filter" aria-label="یادداشت" value={filter.lesson || ''} onChange={event => actions.changeFilter('lesson',event.target.value)}>
        <option value="">همهٔ یادداشت‌ها</option>{labels.lessons.map(lesson => <option key={lesson.id} value={lesson.id}>{labels.noteLabel(lesson.id)}</option>)}
      </select>
      <select className="filter" aria-label="نوع تلاش" value={filter.kind} onChange={event => actions.changeFilter('kind',event.target.value)}>
        <option value="all">همهٔ تلاش‌ها</option><option value="first">فقط اولین ثبت</option><option value="later">تلاش‌های بعدی</option>
      </select>
    </>}
  </div>;
}

function Pagination({ state, actions, page, view }: { state: State; actions: Controller; page: Page<unknown>; view: ListView }) {
  return <div className="table-foot">
    <span>{fa(page.total)} {view === 'attempts' ? 'ثبت' : view === 'requests' ? 'درخواست' : 'دانشجو'} · صفحهٔ {fa(state.filters[view].index + 1)}</span>
    <div className="pages"><button className="btn" type="button" disabled={!state.filters[view].index} onClick={() => actions.page(-1)}>قبلی</button>
      <button className="btn" type="button" disabled={!page.next_cursor} onClick={() => actions.page(1)}>بعدی</button></div>
  </div>;
}

function Table({ state, labels, actions, view }: Props & { view: Exclude<ListView,'requests'> }) {
  const report = state.pages[view];
  if (!report || report.loading) return <Loading />;
  if (report.error || !report.data) return <Failure error={report.error} retry={actions.refresh} />;
  const page = report.data;
  if (!page.rows.length) return <Empty title="اطلاعاتی برای نمایش نیست" action={state.filters[view].query
    ? <button className="btn" type="button" onClick={actions.clearQuery}>پاک‌کردن جست‌وجو</button> : undefined}>
    {state.filters[view].query ? 'نام، ایمیل یا فیلتر را تغییر دهید.' : 'هنوز داده‌ای با این شرایط ثبت نشده است.'}
  </Empty>;

  let columns: string[], rows: { key: string; cells: ReactNode[] }[];
  if (view === 'attempts') {
    columns = ['دانشجو','یادداشت','نوع ثبت','نمره','زمان','پاسخ‌ها'];
    rows = (page.rows as Attempt[]).map(attempt => ({ key: attempt.id, cells: [
      <PersonCell person={attempt} />,
      <>{labels.noteLabel(attempt.lesson_id)}<span className="sub">نسخهٔ {fa(attempt.version)}</span></>,
      attempt.attempt_no === 1 ? <span className="tag-first">اولین ثبت</span> : 'تلاش ' + fa(attempt.attempt_no),
      <Grade score={attempt} />, date(attempt.created_at),
      <button className="btn small-btn" type="button" onClick={() => void actions.attempt(attempt.id)}>بررسی پاسخ‌ها</button>,
    ] }));
  } else if (view === 'labs') {
    columns = ['دانشجو','مأموریت‌های انجام‌شده','XP','آخرین ثبت لابراتور','جزئیات'];
    rows = (page.rows as Person[]).map(person => {
      const lab = labFor(person, state.filters.labs.mission);
      return { key: person.user_id, cells: [
        <PersonCell person={person} />,
        lab ? <div className="lab-cell"><span>{fa(lab.completed)} از {fa(lab.task_count)}</span><Bar value={lab.completed} max={lab.task_count} /></div> : '—',
        <XP lab={lab} />, relative(lab?.last_at),
        <button className="btn small-btn" type="button" onClick={() => void actions.student(person.user_id)}>جزئیات</button>,
      ] };
    });
  } else {
    columns = ['دانشجو','XP لابراتورها','آخرین آزمون','آخرین ثبت آموزشی','دسترسی','جزئیات'];
    rows = (page.rows as Person[]).map(person => ({ key: person.user_id, cells: [
      <PersonCell person={person} />,
      <><XP lab={person.lab} /><span className="sub">{fa(person.lab.completed)} از {fa(person.lab.task_count)} مأموریت</span></>,
      <><Grade score={person.latest_quiz} />{person.latest_quiz && <span className="sub">
        {labels.noteLabel(person.latest_quiz.lesson_id)} · نسخهٔ {fa(person.latest_quiz.version)}</span>}</>,
      relative(person.last_registered_at), <StatusPill status={person.status} />,
      <button className="btn small-btn" type="button" aria-label={'پروندهٔ ' + (person.name || person.email || 'دانشجو')}
        onClick={() => void actions.student(person.user_id)}>پرونده ←</button>,
    ] }));
  }
  return <>
    <div className="table-scroll teacher-report-scroll">
      <table role="table" className="teacher-report-table">
        <thead role="rowgroup"><tr role="row">{columns.map(title => <th key={title} scope="col" role="columnheader">{title}</th>)}</tr></thead>
        <tbody role="rowgroup">{rows.map(row => <tr key={row.key} role="row">{row.cells.map((cell,index) => <td key={columns[index]} role="cell">
          {index > 0 && index < columns.length - 1 && <span className="teacher-mobile-label" aria-hidden="true">{columns[index]}</span>}
          <div>{cell}</div>
        </td>)}</tr>)}</tbody>
      </table>
    </div>
    <Pagination state={state} actions={actions} page={page} view={view} />
  </>;
}

function Requests({ state, labels, actions }: Props) {
  const report = state.pages.requests;
  if (!report || report.loading) return <section className="card"><Loading /></section>;
  if (report.error || !report.data) return <section className="card"><Failure error={report.error} retry={actions.refresh} /></section>;
  const page = report.data;
  if (!page.rows.length) return <section className="card"><Empty title="درخواستی در انتظار نیست">
    درخواست تازه‌ای که نیاز به بررسی داشته باشد، اینجا نمایش داده می‌شود.</Empty></section>;
  return <>
    <p className="notice">{fa(page.total)} درخواست در انتظار است. پیش از فعال‌کردن دسترسی، نام و ایمیل را بررسی کنید.</p>
    <div className="request-list">{(page.rows as Person[]).map(person =>
      <article className="request-card" key={person.user_id}>
        <div className="avatar" aria-hidden="true">{(person.name || 'د')[0]}</div>
        <div className="request-info"><h2>{person.name || 'دانشجو'}</h2><bdi>{person.email}</bdi>
          <p>درخواست عضویت در {labels.courseTitle} · {date(person.requested_at)}</p></div>
        <div className="request-actions">
          <button className="btn" type="button" onClick={() => void actions.student(person.user_id, 'request')}>بررسی</button>
          <button className="btn primary" type="button" onClick={() => void actions.askMembership(person.user_id)}>تأیید دسترسی</button>
        </div>
      </article>)}</div>
    <Pagination state={state} actions={actions} page={page} view="requests" />
  </>;
}

function Concepts({ state, labels, actions }: Props) {
  if (state.conceptLoading) return <section className="card"><Loading /></section>;
  if (state.conceptError) return <section className="card"><Failure error={state.conceptError} retry={actions.loadConcepts} /></section>;
  return <section className="card">
    <header className="card-head"><div><h2>تحلیل اولین پاسخ‌ها</h2><p>هر دانشجو در هر نسخه، یک بار شمرده می‌شود.</p></div></header>
    <div className="card-content">{state.concepts.length ? state.concepts.map(concept =>
      <div className="question-line" key={concept.lesson_id + ':' + concept.version + ':' + concept.question_id}>
        <div><strong>{concept.skill || concept.question_id}</strong>
          <p>{labels.noteLabel(concept.lesson_id)} · نسخهٔ {fa(concept.version)} · {fa(concept.correct)} پاسخ درست از {fa(concept.responses)}</p></div>
        <Bar value={concept.responses - concept.correct} max={concept.responses} />
        <button className="btn small-btn" type="button" onClick={() => actions.question(concept)}>دیدن سؤال</button>
      </div>) : <p className="small muted">هنوز پاسخی برای تحلیل وجود ندارد.</p>}</div>
    <p className="legend-note">خطای بیشتر می‌تواند از ابهام سؤال یا نیاز به توضیح دوباره باشد. این گزارش رتبه‌بندی دانشجویان نیست.</p>
  </section>;
}

export function Reports(props: Props) {
  const { state, labels, actions } = props, view = state.view;
  if (view === 'requests') return <Requests {...props} />;
  if (view === 'overview') return null;
  const definitions = state.overview?.labs || (state.pages.labs?.data?.rows[0] as Person | undefined)?.lab.missions || [];
  const mission = state.filters.labs.mission, selected = definitions.find(item => item.mission === mission);
  return <>
    {view === 'attempts' && <div className="request-actions instructor-segments" role="group" aria-label="نوع گزارش آزمون">
      {([['attempts','ثبت‌های آزمون'],['concepts','تحلیل سؤال‌ها']] as const).map(([id,label]) =>
        <button key={id} className={'btn ' + (state.filters.attempts.section === id ? 'primary' : '')} type="button"
          aria-pressed={state.filters.attempts.section === id} onClick={() => actions.setSection(id)}>{label}</button>)}
    </div>}
    {view === 'labs' && definitions.length > 0 && <div className="lab-summary" role="group" aria-label="فیلتر لابراتور">
      {definitions.map(item => <button type="button" key={item.mission} aria-pressed={mission === item.mission}
        onClick={() => actions.mission(item.mission)}>
        <span className="number-tag">{String(item.ordinal ?? '').padStart(2,'0')}</span><strong>{labels.labTitle(item.mission,item.title)}</strong>
        <small>{fa(item.task_count)} مأموریت · <bdi>{latin(item.maximum)} XP</bdi></small>
      </button>)}
    </div>}
    {view === 'attempts' && state.filters.attempts.section === 'concepts' ? <Concepts {...props} /> : <section className="card">
      {view === 'labs' && <header className="card-head"><div><h2>{mission === 'all' || !mission ? 'رشد در همهٔ لابراتورها' : labels.labTitle(mission,selected?.title)}</h2>
        <p>XP ثبت‌شده و مأموریت‌های کامل‌شده</p></div>{mission !== 'all' && <button className="quiet" type="button"
        onClick={() => actions.mission('all')}>همهٔ لابراتورها ←</button>}</header>}
      <Filters {...props} view={view} /><Table {...props} view={view} />
      {view === 'attempts' && <p className="table-note">همهٔ ثبت‌ها با صفحه‌بندی در دسترس‌اند؛ نمرهٔ آخر هر دانشجو از کل سوابق محاسبه می‌شود.</p>}
    </section>}
    {view === 'students' && <p className="overview-footnote"><PaperIcon name="info" />
      آخرین ثبت آموزشی از آزمون یا بررسی لابراتور به دست می‌آید؛ نشانهٔ آخرین ورود یا مطالعهٔ یادداشت نیست.</p>}
  </>;
}
