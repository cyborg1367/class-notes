import React, { useEffect, useSyncExternalStore } from 'react';
import type { AccountPort } from './contracts';

export function AccountPage({ port, onReady }: { port: AccountPort; onReady?: () => void }) {
  const view = useSyncExternalStore(port.subscribe, port.getSnapshot, port.getServerSnapshot);
  const guest = view.phase === 'guest', signedIn = view.phase === 'authenticated';
  useEffect(() => { onReady?.(); }, [onReady]);

  return <>
    <nav className="shell route-trail" aria-label="مسیر صفحه"><ol><li><a dir="auto" href="../index.html">صفحهٔ اصلی</a></li><li><span aria-current="page" dir="auto">حساب کاربری</span></li></ol></nav>
    <section className="shell portal-main" id="top">
      <header className="page-head"><h1>حساب کاربری</h1><p /></header>
      <div className="account-grid">
        <div className="account-message">
          <div data-account-intro-guest="" hidden={!guest}><p className="eyebrow">ورود به حساب</p><h2>دسترسی به کلاس‌ها</h2><p>با حساب Google وارد شو و دسترسی کلاس را درخواست کن. پس از تأیید مدرس، یادداشت‌ها، تمرین‌ها و آزمون‌های کلاس در دسترس تو هستند.</p></div>
          <div data-account-intro-member="" hidden={!signedIn}><p className="eyebrow">حساب کاربری</p><h2>مشخصات حساب تو</h2><p>نام و ایمیل این حساب برای شناسایی تو در کلاس استفاده می‌شود. وضعیت عضویت و مسیر یادگیری‌ات را در داشبورد ببین.</p></div>
          <p className="hero-signature" lang="en">Instructor · Masoud Ahangary</p>
        </div>
        <div className="panel-card">
          <div data-account-guest="" hidden={!guest}>
            <h2>ورود با حساب Google</h2><p>برای اولین ورود هم کافی است حساب Google خودت را انتخاب کنی.</p>
            <button className="google-button" data-signin="" data-react-account-action="" type="button" disabled={!guest || Boolean(view.busy)} onClick={() => { void port.signIn(); }}>ورود با Google</button>
            <p className="small-note">نام و ایمیل Google برای شناسایی حساب استفاده می‌شوند. ثبت‌نام به‌تنهایی دسترسی به کلاس ایجاد نمی‌کند.</p>
          </div>
          <div data-account-member="" hidden={!signedIn}>
            <h2>حساب کاربری</h2><p><bdi data-user-name="">{view.identity?.name || ''}</bdi></p><p className="member-email" data-user-email="">{view.identity?.email || ''}</p>
            <div className="portal-actions"><a className="button-forest" href={view.continueURL} data-continue="">ورود به داشبورد ←</a><button className="signout-button" data-signout="" data-react-account-action="" type="button" disabled={Boolean(view.busy)} onClick={() => { void port.signOut(); }}>خروج از حساب</button></div>
            <div data-account-presence-slot="" />
          </div>
          <p className="status-line" data-auth-status="" data-error={view.notice.error} role="status" aria-live="polite">{view.notice.text}</p>
          {view.phase === 'error' && <button type="button" className="button-outline" data-account-retry="" onClick={() => port.retry()}>تلاش دوباره</button>}
          <p className="small-note">در دستگاه مشترک، پس از پایان کار از حساب خارج شو. پیش‌نویس‌ها ممکن است در همان مرورگر باقی بمانند.</p>
        </div>
      </div>
    </section>
  </>;
}
