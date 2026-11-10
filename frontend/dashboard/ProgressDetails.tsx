import { useEffect, useRef } from 'react';
import type { DashboardModel, LessonProgress, QuizReceipt, RouteLink } from './contracts';
import { DashboardGlyph } from './DashboardGlyph';
import { en, fa, formatDate, quizPath } from './format';

export function SkillsAndBadges({ model, link }: { model: DashboardModel; link: RouteLink }) {
  return <section className="dash-growth">
    <div className="dash-skills">
      <h2><DashboardGlyph name="gear" />مهارت‌های تمرین‌شده</h2>
      {model.skills.length ? <ul>{model.skills.map(label =>
        <li key={label}><DashboardGlyph name="check" /><span>{label}</span></li>)}</ul>
        : <p className="dash-empty-note">پس از قبول‌شدن مأموریت‌ها، مهارت‌های تمرین‌شده‌ات اینجا نمایش داده می‌شوند.</p>}
    </div>
    <div className="dash-badges">
      <h2><DashboardGlyph name="medal" />نشان‌های من</h2>
      {model.labs.length ? <div className="dash-stamp-list">{model.labs.map(lesson => {
        if (!lesson.lab) return null;
        const { title, path } = lesson.lab;
        const earned = lesson.progress?.status === 'ready' && lesson.progress.finished;
        const status = earned ? 'دریافت شد' : lesson.progress?.status === 'ready' ? 'در مسیر دریافت' : 'وضعیت دریافت نشد';
        return <a key={lesson.id} className="dash-stamp" data-earned={earned} href={link(path)} aria-label={title + '؛ ' + status}>
          <DashboardGlyph name={lesson.dashboard_art ?? 'sms'} kind="badge" className="dash-stamp-icon" />
          <span>{title}</span><small>{status}</small>
        </a>;
      })}</div> : <p className="dash-empty-note">نشان‌های لابراتورها اینجا نمایش داده می‌شوند.</p>}
    </div>
  </section>;
}

function Score({ label, points, maximum }: { label: string; points?: number | null; maximum?: number }) {
  return <div><span>{label}</span>
    <strong><bdi dir="ltr">{points != null && maximum != null ? en(Number(points)) + ' / ' + en(Number(maximum)) : '—'}</bdi></strong>
  </div>;
}

type ResultsProps = { receipts: DashboardResult[]; link: RouteLink };
export type DashboardResult = {
  receipt: QuizReceipt;
  lesson: LessonProgress;
};

export function QuizResults({ receipts, link }: ResultsProps) {
  const section = useRef<HTMLElement>(null);
  const details = useRef<HTMLDetailsElement>(null);
  const hasResults = receipts.length > 0;
  useEffect(() => {
    const node = section.current, panel = details.current, win = node?.ownerDocument.defaultView;
    if (!hasResults || !node || !panel || !win) return;
    const openFromHash = () => {
      if (win.location.hash !== '#results') return;
      panel.open = true;
      node.focus({ preventScroll: true });
      node.scrollIntoView?.({ block: 'start' });
    };
    openFromHash();
    win.addEventListener('hashchange', openFromHash);
    return () => win.removeEventListener('hashchange', openFromHash);
  }, [hasResults]);

  if (!hasResults) return null;
  return <section id="results" data-dashboard-results="" tabIndex={-1} ref={section} aria-label="نتایج آزمون‌ها">
    <details className="dash-results-details" ref={details}>
      <summary>جزئیات نتایج آزمون‌ها · {fa(receipts.length)} نتیجه</summary>
      <div className="dash-results-body"><div className="dashboard-results">{receipts.map(({ lesson, receipt }) => {
        const date = formatDate(receipt.last_at);
        return <article className="dashboard-result" key={lesson.id + ':' + receipt.version} data-result-lesson={lesson.id}>
          <div className="result-heading">
            <div><p className="eyebrow" dir="auto">{lesson.course.display_title || lesson.course.title} · نسخهٔ {en(Number(receipt.version))}</p>
              <h3>{lesson.title}</h3></div>
            {date && <p className="small-note">آخرین ثبت: {date}</p>}
          </div>
          {Number(receipt.attempts) > 0 ? <div className="quiz-history" aria-label="سابقهٔ همین نسخه از آزمون">
            <Score label="اولین نتیجه" points={receipt.first_score} maximum={receipt.maximum} />
            <Score label="بهترین نتیجه" points={receipt.best_score} maximum={receipt.maximum} />
            {receipt.last_score != null && <Score label="آخرین نتیجه" points={receipt.last_score} maximum={receipt.maximum} />}
            <div><span>تعداد تلاش‌ها</span><strong>{en(Number(receipt.attempts))}</strong></div>
          </div> : <p className="small-note">هنوز نتیجه‌ای برای این نسخه از آزمون ثبت نشده است.</p>}
          <div className="portal-actions">
            {receipt.last_id && <a className="button-outline" href={link(quizPath(lesson.id, receipt.last_id))}>مشاهدهٔ آخرین نتیجه ←</a>}
            <a className="quiet-link" href={link(quizPath(lesson.id))}>تمرین و آزمون</a>
          </div>
        </article>;
      })}</div></div>
    </details>
  </section>;
}
