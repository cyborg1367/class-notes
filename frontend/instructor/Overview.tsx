import { PaperIcon } from '../components/PaperIcon';
import { date, fa, message } from '../../web/assets/instructor-model.mjs';
import type { Controller } from './controller';
import type { State } from './contracts';
import { Bar, Failure, Loading, type Labels } from './Presentation';

export function Overview({ state, labels, actions }: { state: State; labels: Labels; actions: Controller }) {
  const overview = state.overview;
  if (!overview) return <section className="card">{state.overviewError
    ? <Failure error={state.overviewError} retry={actions.loadOverview} /> : <Loading />}</section>;
  const stats = overview.stats;
  return <>
    {state.overviewError ? <p className="notice" role="alert">{message(state.overviewError)} آخرین گزارش دریافت‌شده نمایش داده می‌شود.</p> : null}
    <div className="teacher-metrics">
      <button className="teacher-metric" type="button" onClick={() => actions.navigate('students')}>
        <span className="teacher-metric-label"><PaperIcon name="user" />دانشجوی دارای دسترسی</span>
        <strong>{fa(stats.active_students)}</strong><small>مشاهدهٔ دانشجویان ←</small>
      </button>
      <button className="teacher-metric" data-tone={stats.pending_students > 0 ? 'attention' : undefined} type="button" onClick={() => actions.navigate('requests')}>
        <span className="teacher-metric-label"><PaperIcon name="bell" />درخواست در انتظار</span>
        <strong>{fa(stats.pending_students)}</strong><small>بررسی دسترسی‌ها ←</small>
      </button>
      <button className="teacher-metric" type="button" onClick={() => actions.navigate('attempts')}>
        <span className="teacher-metric-label"><PaperIcon name="quiz" />ثبت نهایی آزمون</span>
        <strong>{fa(stats.total_attempts)}</strong><small>مشاهدهٔ ثبت‌ها ←</small>
      </button>
    </div>
    <div className="teacher-overview-grid">
      <section className="card teacher-inbox">
        <header className="card-head"><div><h2>درخواست‌های تازه</h2><p>پیش از تأیید، مشخصات حساب را بررسی کنید.</p></div></header>
        <div className="card-content">
          {overview.pending.length ? overview.pending.map(person =>
            <div key={person.user_id} className="pending-person">
              <div className="avatar" aria-hidden="true">{(person.name || 'د')[0]}</div>
              <div><strong>{person.name || 'دانشجو'}</strong><small>{date(person.created_at)}</small></div>
              <button className="btn small-btn" type="button" onClick={() => void actions.student(person.user_id, 'request')}>بررسی</button>
            </div>) : <p className="small muted">درخواستی در انتظار نیست.</p>}
          {stats.pending_students > 0 && <button className="quiet teacher-card-link" type="button" onClick={() => actions.navigate('requests')}>همهٔ درخواست‌ها ←</button>}
        </div>
      </section>
      <section className="card">
        <header className="card-head"><div><h2>پیشرفت لابراتورها</h2><p>تعداد دانشجویانی که همهٔ مأموریت‌ها را کامل کرده‌اند.</p></div>
          <button className="quiet" type="button" onClick={() => actions.navigate('labs')}>گزارش کامل ←</button></header>
        <div className="card-content">
          {overview.labs.length ? overview.labs.map(mission => <div className="progress-item" key={mission.mission}>
            <div className="progress-line"><div className="progress-title"><span className="number-tag">{String(mission.ordinal ?? '').padStart(2,'0')}</span>
              <span>{labels.labTitle(mission.mission, mission.title)}</span></div><small>{fa(mission.completed_students)} از {fa(mission.students)} نفر</small></div>
            <Bar value={mission.completed_students} max={mission.students} />
          </div>) : <p className="small muted">هنوز لابراتوری برای گزارش این کلاس ثبت نشده است.</p>}
        </div>
      </section>
    </div>
    <section className="card wide-card">
      <header className="card-head"><div><h2>برای جلسهٔ بعد چه چیزی را مرور کنیم؟</h2><p>نسبت خطا در اولین ثبت هر دانشجو، برای هر نسخهٔ آزمون.</p></div>
        <button className="quiet" type="button" onClick={() => actions.setSection('concepts')}>تحلیل سؤال‌ها ←</button></header>
      <div className="card-content">
        {overview.concepts.length ? overview.concepts.map(concept => <div className="question-line" key={concept.lesson_id + ':' + concept.version + ':' + concept.question_id}>
          <div><strong>{concept.skill || concept.question_id}</strong><p>{labels.noteLabel(concept.lesson_id)} · نسخهٔ {fa(concept.version)}</p></div>
          <Bar value={concept.responses - concept.correct} max={concept.responses} />
          <span className="small">{fa(concept.responses - concept.correct)} خطا از {fa(concept.responses)} پاسخ</span>
        </div>) : <p className="small muted">پس از ثبت آزمون‌ها، این گزارش نمایش داده می‌شود.</p>}
      </div>
      <p className="legend-note">نسبت خطا را در کنار تعداد پاسخ‌ها و ابهام احتمالی سؤال بخوانید.</p>
    </section>
  </>;
}
