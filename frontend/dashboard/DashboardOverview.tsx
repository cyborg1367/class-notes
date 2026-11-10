import type { DashboardActions, DashboardModel, RouteLink } from './contracts';
import { DashboardGlyph } from './DashboardGlyph';
import { RetryDashboard } from './DashboardAccess';
import { en, fa } from './format';

export function DashboardGreeting({ name, model, retry }: {
  name: string; model: DashboardModel; retry: DashboardActions['retry'];
}) {
  const { xp, maximum } = model;
  const known = xp !== null && maximum !== null;
  return <header className="dash-greeting">
    <div><h1>سلام، {name}</h1><p>قدم بعدی یادگیری‌ات اینجاست.</p></div>
    {model.hasLabs && <div className="dash-xp" aria-label="تجربهٔ ثبت‌شدهٔ لابراتورها">
      <p className="dash-xp-caption">تجربهٔ ثبت‌شدهٔ لابراتورها</p>
      <strong dir="ltr">{known ? <>{en(xp)} <span>/ {en(maximum)} XP</span></> : '— / — XP'}</strong>
      {known
        ? <progress value={xp} max={maximum} aria-label="پیشرفت XP" />
        : <p>پیشرفت کامل دریافت نشد.{model.mode !== 'unavailable' &&
          <> <RetryDashboard className="dash-retry-link" run={retry} /></>}</p>}
    </div>}
  </header>;
}

export function LearningContinuation({ model, link, retry }: {
  model: DashboardModel; link: RouteLink; retry: DashboardActions['retry'];
}) {
  const { target, mode } = model;
  const progress = mode === 'lab' && target?.progress?.status === 'ready' ? target.progress : null;
  const lab = (mode === 'lab' || mode === 'complete') ? target?.lab : null;
  const unavailable = mode === 'unavailable';
  const title = unavailable ? 'پیشرفت لابراتور دریافت نشد' : lab?.title ?? target?.title ?? 'مسیر یادگیری‌ات را شروع کن';
  let description = 'برای دسترسی به یادداشت‌ها، درخواست عضویت کلاس بده.';
  let action = 'دیدن کلاس‌ها';
  if (progress) {
    description = `${fa(progress.done)} مأموریت از ${fa(progress.count)} مأموریت انجام شده`;
    action = progress.done ? 'ادامهٔ لابراتور' : 'شروع لابراتور';
  } else if (mode === 'complete') {
    description = 'همهٔ مأموریت‌های لابراتورها را انجام داده‌ای.';
    action = 'مرور لابراتور';
  } else if (unavailable) {
    description = 'کد و پیشرفت ثبت‌شده‌ات حفظ شده‌اند؛ برای دریافت وضعیت دوباره تلاش کن.';
  } else if (target) {
    description = 'از یادداشت شروع کن و بعد، آموخته‌هایت را در تمرین به کار ببر.';
    action = target.opened ? 'ادامهٔ مطالعه' : 'شروع مطالعه';
  }

  return <section className="dash-continuation" aria-labelledby="dash-next-title">
    <div className="dash-next-copy">
      <DashboardGlyph name={mode === 'study' ? 'book' : 'lab'} kind={mode === 'study' ? 'icon' : 'mark'} className="dash-section-icon" />
      <p className="dash-eyebrow">{mode === 'complete' ? 'مسیر طی‌شدهٔ تو' : 'ادامهٔ مسیر یادگیری'}</p>
      <h2 id="dash-next-title">{title}</h2>
      <p className="dash-next-description">{description}</p>
      {progress && <>
        <p className="dash-next-step">مرحلهٔ بعد: {progress.nextTitle}</p>
        <ol className="dash-milestones" aria-label="مأموریت‌های انجام‌شده">
          {progress.tasks.map((task, i) => {
            const done = progress.completed.has(task.id);
            return <li key={task.id} data-done={done}
              aria-label={`مأموریت ${fa(i + 1)}؛ ${done ? 'انجام‌شده' : 'هنوز انجام نشده'}`} />;
          })}
        </ol>
      </>}
    </div>
    <div className="dash-next-actions">
      {unavailable
        ? <RetryDashboard className="dash-primary" run={retry} arrow />
        : <a className="dash-primary" href={link(lab?.path ?? (target ? target.id + '/' : 'index.html#classes'))}>
          {action} <span aria-hidden="true">←</span>
        </a>}
      {target && !unavailable && <a className="dash-text-link" href={link((mode === 'study' ? target.course.id : target.id) + '/')}>
        {mode === 'study' ? 'فهرست کلاس' : 'مرور یادداشت'}
      </a>}
    </div>
  </section>;
}

export function PersonalReviewCard({ due, href }: { due: number | null; href: string }) {
  const text = due === null ? 'موضوعات و یادداشت‌هایت را در یک جای مستقل مرور کن.'
    : due > 0 ? `${fa(due)} موضوع برای مرور آماده است.` : 'موضوع تازه‌ای اضافه کن یا یادداشت‌های خودت را ببین.';
  return <section className="dash-personal-review">
    <div><h2>دفتر مرور شخصی</h2><p data-review-count role="status">{text}</p></div>
    <a href={href}>رفتن به دفتر مرور ←</a>
  </section>;
}
