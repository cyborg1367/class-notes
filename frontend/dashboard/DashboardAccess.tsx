import { useRef, useState } from 'react';
import type { DashboardActions, Membership } from './contracts';

const messages: Record<Membership['status'], string> = {
  pending: 'درخواستت ثبت شده است؛ پس از تأیید مدرس، دسترسی فعال می‌شود.',
  suspended: 'دسترسی این کلاس فعلاً غیرفعال است. برای پیگیری با مدرس در ارتباط باش.',
  unavailable: 'وضعیت عضویتت دریافت نشد؛ دوباره تلاش کن.',
  unregistered: 'برای این کلاس درخواست عضویت بده؛ دسترسی پس از تأیید مدرس فعال می‌شود.',
};

function MembershipCard({ item, actions }: { item: Membership; actions: DashboardActions }) {
  const inFlight = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function run(action: () => Promise<void>) {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError('');
    try { await action(); }
    catch { setError('عملیات کامل نشد. اتصال را بررسی کن و دوباره تلاش کن.'); }
    finally { inFlight.current = false; setBusy(false); }
  }

  return <article>
    <h3 dir="auto">{item.title}</h3>
    <div className="gate-card">
      <h4>عضویت در کلاس</h4>
      <p>{messages[item.status]}</p>
      <div className="portal-actions">
        {item.status === 'unregistered' && <button type="button" className="button-forest"
          disabled={busy} onClick={() => void run(() => actions.requestAccess(item.id))}>درخواست دسترسی به کلاس</button>}
        <button type="button" className="button-outline" disabled={busy}
          onClick={() => void run(actions.refreshMembership)}>به‌روزرسانی وضعیت عضویت</button>
      </div>
      <p className="status-line" data-error={Boolean(error)} role="status">{error || (busy ? 'در حال به‌روزرسانی…' : '')}</p>
    </div>
  </article>;
}

export function DashboardMembership({ items, actions }: { items: Membership[]; actions: DashboardActions }) {
  if (!items.length) return null;
  return <section className="membership-section" aria-labelledby="dash-membership-title">
    <div className="section-heading"><h2 id="dash-membership-title">عضویت و درخواست دسترسی</h2></div>
    {items.map(item => <MembershipCard key={item.id} item={item} actions={actions} />)}
  </section>;
}

export function DashboardGuest({ login }: { login: string }) {
  return <div className="gate-card">
    <h1>برای ادامه وارد شو.</h1>
    <p>متن یادداشت‌ها و آزمون‌ها فقط برای اعضای تأییدشدهٔ کلاس در دسترس است.</p>
    <div className="portal-actions"><a className="button-forest" data-login-link="" href={login}>ورود با Google ←</a></div>
  </div>;
}

export function RetryDashboard({ run, className, arrow = false }: {
  run: () => Promise<void>; className: string; arrow?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  return <button className={className} type="button" data-dashboard-retry="" disabled={busy}
    onClick={async () => {
      setBusy(true);
      try { await run(); } finally { setBusy(false); }
    }}>
    {busy ? 'در حال دریافت…' : 'تلاش دوباره'}{arrow && <span aria-hidden="true"> ←</span>}
  </button>;
}

export function DashboardError({ kind, retry }: { kind: 'membership' | 'dashboard'; retry: DashboardActions['retry'] }) {
  return <section className="gate-card">
    <h1>{kind === 'membership' ? 'اطلاعات کلاس دریافت نشد.' : 'داشبورد دریافت نشد.'}</h1>
    <p>{kind === 'membership' ? 'ورود انجام شده، اما اطلاعات کلاس دریافت نشد.' : 'برای دریافت مسیر یادگیری دوباره تلاش کن.'}</p>
    <RetryDashboard className="button-outline" run={retry} />
  </section>;
}
