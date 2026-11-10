import { useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent } from 'react';
import { PaperIcon } from '../components/PaperIcon';
import { categories, kinds, sleeping, unread, type Notice } from './model';
import type { NotificationsStore, NotificationSnapshot } from './store';

const fa = new Intl.NumberFormat('fa-IR');
const date = new Intl.DateTimeFormat('fa-IR', { month: 'short', day: 'numeric' });
const digits = (text: string) => text.replace(/[0-9]/g, digit => '۰۱۲۳۴۵۶۷۸۹'[Number(digit)]);
function relativeDate(value: string) {
  const day = new Date(value), today = new Date();
  if (day.toDateString() === today.toDateString()) return 'امروز';
  today.setDate(today.getDate() - 1);
  return day.toDateString() === today.toDateString() ? 'دیروز' : date.format(day);
}
export type NoticeActions = {
  href(item: Notice): string;
  open(item: Notice, event: MouseEvent<HTMLAnchorElement>): void;
  settings(opener: HTMLElement): void;
};
type ViewProps = { state: NotificationSnapshot; store: NotificationsStore; actions: NoticeActions };
const locked = (state: NotificationSnapshot) => state.busy || state.authBusy;

export function Bell({ state, expanded, panelId, toggle }: {
  state: NotificationSnapshot; expanded: boolean; panelId: string; toggle(): void;
}) {
  const { unreadCount, error, authBusy } = state;
  const label = unreadCount === null
    ? 'اعلان‌ها' + (error ? '؛ دریافت کامل نشد' : '')
    : 'اعلان‌ها؛ ' + fa.format(unreadCount) + ' خوانده‌نشده' + (error ? '؛ وضعیت ممکن است قدیمی باشد' : '');
  return <span className="notice-host" data-react-notice-bell="">
    <button type="button" className="notice-trigger" aria-label={label} aria-expanded={expanded}
      aria-controls={panelId} aria-busy={unreadCount === null && !error} disabled={authBusy} onClick={toggle}>
      <PaperIcon name="bell" />
      {unreadCount !== null && unreadCount > 0 &&
        <span className="notice-badge" aria-hidden="true">
          <bdi dir="ltr">{unreadCount > 99 ? fa.format(99) + '+' : fa.format(unreadCount)}</bdi>
        </span>}
    </button>
  </span>;
}

function NoticeCard({ item, state, store, actions }: ViewProps & { item: Notice }) {
  const isUnread = unread(item), deferred = sleeping(item), busy = locked(state);
  async function markRead(button: HTMLButtonElement) {
    const scope = button.closest('[data-react-notices-popup],[data-react-notices-history]');
    const doc = button.ownerDocument;
    const read = await store.read(item);
    if (read && scope?.isConnected && !scope.closest('[hidden]') &&
        !button.isConnected && doc.activeElement === doc.body) {
      const link = Array.from(scope.querySelectorAll<HTMLAnchorElement>('[data-notice-open]'))
        .find(element => element.dataset.noticeOpen === item.id);
      (link ?? scope.querySelector<HTMLElement>('h1,h2'))?.focus({ preventScroll: true });
    }
  }
  return <article className="notice-item" data-kind={item.kind} data-read={!isUnread} data-active={item.active}>
    <span className="notice-type-icon"><PaperIcon name={categories[item.kind][2]} /></span>
    <div className="notice-copy">
      <div className="notice-item-heading"><h3>{digits(item.title)}{isUnread && <span className="notice-unread" aria-label="خوانده‌نشده" />}</h3>
        <time dateTime={item.occurred_at}>{relativeDate(item.occurred_at)}</time></div>
      <p>{digits(item.description)}</p>
      {!item.active ? <p className="notice-resolved">این یادآوری اکنون فعال نیست.</p>
        : deferred && <p className="notice-resolved">یادآوری دوباره: {date.format(new Date(item.snoozed_until!))}</p>}
      <div className="notice-item-actions">
        <a data-notice-open={item.id} href={actions.href(item)} aria-disabled={busy || undefined}
          onClick={event => actions.open(item, event)} onAuxClick={event => { if (event.button === 1) actions.open(item, event); }}>
          {item.active ? item.action : 'مشاهده'} <span aria-hidden="true">←</span>
        </a>
        {isUnread && <button type="button" className="notice-read-one" data-read-one={item.id}
          aria-label={'خواندم: ' + item.title} aria-disabled={busy || undefined} title="خواندم"
          onClick={event => void markRead(event.currentTarget)}><PaperIcon name="check" /></button>}
        {item.active && !deferred && (item.kind === 'lab' || item.kind === 'review') &&
          <details className="notice-later">
            <summary aria-label={'یادآوری مجدد برای ' + item.title}><PaperIcon name="clock" /><span>بعداً</span></summary>
            <div>{[1, 3, 7].map(days => <button key={days} type="button" data-snooze={item.id} data-days={days}
              disabled={busy} onClick={() => store.snooze(item, days)}>{fa.format(days)} روز دیگر</button>)}</div>
          </details>}
      </div>
    </div>
  </article>;
}

function Cards({ items, ...props }: ViewProps & { items: Notice[] }) {
  return <>{items.map(item => <NoticeCard key={item.id + ':' + item.episode} item={item} {...props} />)}</>;
}

export function tabStops(root: HTMLElement) {
  return Array.from(root.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),a[href],summary'))
    .filter(node => !node.closest('[hidden]') && node.getAttribute('aria-disabled') !== 'true' &&
      (node.tagName === 'SUMMARY' || !node.closest('details:not([open])')));
}

type Placement = { left: number; top?: number; bottom?: number; width: number; maxHeight: number; '--notice-pointer': string };
function popupPlacement(anchor: HTMLElement, win: Window): Placement {
  const rect = anchor.getBoundingClientRect();
  const viewport = win.document.documentElement.clientWidth || win.innerWidth;
  const height = win.innerHeight, margin = 12, gap = 11;
  const width = Math.max(1, Math.min(430, viewport - margin * 2));
  const left = Math.max(margin, Math.min(rect.left - width * .25, viewport - width - margin));
  const arrow = Math.max(18, Math.min(width - 18, rect.left + rect.width / 2 - left)) + 'px';
  const below = Math.max(0, height - rect.bottom - gap - margin);
  const above = Math.max(0, rect.top - gap - margin);
  return below < 240 && above > below
    ? { left, bottom: height - rect.top + gap, width, maxHeight: above, '--notice-pointer': arrow }
    : { left, top: rect.bottom + gap, width, maxHeight: below, '--notice-pointer': arrow };
}

export function NoticePopup({ state, store, actions, panelId, anchor, historyURL, close }: ViewProps & {
  panelId: string; anchor: HTMLElement | null; historyURL: string; close(focus?: boolean): void;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  const panel = useRef<HTMLElement>(null);
  const [placement, setPlacement] = useState<Placement>();
  useLayoutEffect(() => {
    if (!anchor) return;
    const win = anchor.ownerDocument.defaultView;
    if (!win) return;
    const measure = () => {
      const trigger = anchor.querySelector<HTMLElement>('.notice-trigger');
      if (trigger) setPlacement(popupPlacement(trigger, win));
    };
    measure();
    heading.current?.focus({ preventScroll: true });
    win.addEventListener('resize', measure);
    win.addEventListener('scroll', measure, true);
    win.visualViewport?.addEventListener('resize', measure);
    return () => {
      win.removeEventListener('resize', measure);
      win.removeEventListener('scroll', measure, true);
      win.visualViewport?.removeEventListener('resize', measure);
    };
  }, [anchor]);
  function keydown(event: KeyboardEvent<HTMLElement>) {
    if (event.key !== 'Tab' || !panel.current) return;
    const stops = tabStops(panel.current);
    if ((event.shiftKey && (event.target === heading.current || event.target === stops[0])) ||
        (!event.shiftKey && event.target === stops[stops.length - 1])) {
      event.preventDefault(); close(true);
    }
  }
  return <section ref={panel} id={panelId} data-react-notices-popup="" className="notice-panel"
    dir="rtl" role="region" aria-labelledby={panelId + '-title'} hidden={!anchor}
    data-notice-placement={placement?.bottom === undefined ? 'below' : 'above'} style={placement as CSSProperties} onKeyDown={keydown}>
    {anchor && <>
      <header className="notice-panel-head">
        <h2 ref={heading} id={panelId + '-title'} tabIndex={-1}>اعلان‌ها</h2>
        <button type="button" data-read-all="" disabled={locked(state) || !state.feed || !state.unreadCount}
          onClick={() => store.readAll('popup')}>همه را خواندم</button>
      </header>
      <div className="notice-panel-body">
        {state.actionError && <p className="notice-error">{state.actionError}</p>}
        {state.error && <div className="notice-error" role="status"><p>{state.error}</p>
          <button type="button" data-notice-retry="" disabled={locked(state)}
            onClick={() => { store.clearActionError(); void store.refresh(true); }}>تلاش دوباره</button></div>}
        {!state.feed && !state.error ? <p className="notice-empty" role="status">در حال دریافت اعلان‌ها…</p>
          : state.feed?.items.length ? <Cards items={state.feed.items} {...{ state, store, actions }} />
          : state.feed ? <div className="notice-empty"><strong>اعلان تازه‌ای نداری.</strong>
            <p>خبرهای کلاس و یادآوری‌های مناسب اینجا نمایش داده می‌شوند.</p></div> : null}
      </div>
      <footer className="notice-panel-footer">
        <a href={historyURL}>مشاهدهٔ همهٔ اعلان‌ها ←</a>
        <button type="button" data-notice-settings="" disabled={locked(state) || !state.preferences}
          onClick={event => actions.settings(event.currentTarget)}><PaperIcon name="gear" /> تنظیمات</button>
      </footer>
    </>}
  </section>;
}

export function NoticeHistory({ state, store, actions }: ViewProps) {
  const { history, unreadCount } = state, busy = locked(state);
  return <section dir="rtl" data-react-notices-history="" aria-busy={history.loading}>
    <header className="notice-page-heading">
      <div><p>حساب کاربری / اعلان‌ها</p><h1 tabIndex={-1}>اعلان‌های من</h1>
        <p>{unreadCount === null ? 'خبرهای کلاس و یادآوری‌های مسیر یادگیری' : fa.format(unreadCount) + ' اعلان خوانده‌نشده'}</p></div>
      <button type="button" className="button-outline" data-notice-settings="" disabled={busy || !state.preferences}
        onClick={event => actions.settings(event.currentTarget)}><PaperIcon name="gear" /> تنظیمات</button>
    </header>
    <div className="notice-page-tools">
      <div role="group" aria-label="فیلتر اعلان‌ها">
        <button type="button" data-notice-filter="all" aria-pressed={!history.unreadOnly} disabled={busy}
          onClick={() => { if (history.unreadOnly) void store.loadHistory(true, false); }}>همه</button>
        <button type="button" data-notice-filter="unread" aria-pressed={history.unreadOnly} disabled={busy}
          onClick={() => { if (!history.unreadOnly) void store.loadHistory(true, true); }}>خوانده‌نشده</button>
      </div>
      <button type="button" data-read-all="" disabled={busy || !unreadCount || !history.snapshot}
        onClick={() => store.readAll('history')}>همه را خواندم</button>
      <button type="button" data-page-refresh="" disabled={busy || history.loading}
        onClick={() => { store.clearActionError(); store.refreshSurfaces(true); }}>به‌روزرسانی</button>
    </div>
    {state.actionError && <p className="notice-error">{state.actionError}</p>}
    {history.error && <p className="notice-error" role="status">{history.error}</p>}
    <div className="notice-page-list">
      {history.items.length ? <Cards items={history.items} {...{ state, store, actions }} />
        : history.loading ? <p className="notice-empty" role="status">در حال دریافت اعلان‌ها…</p>
        : history.loaded ? <p className="notice-empty">اعلانی در این فهرست نیست.</p> : null}
    </div>
    {history.cursor && <button type="button" className="button-outline notice-more" data-notice-more=""
      disabled={busy || history.loading} onClick={() => void store.loadHistory(false)}>نمایش موارد بیشتر</button>}
  </section>;
}
