import { useLayoutEffect, useRef, type KeyboardEvent } from 'react';
import { PaperIcon } from '../components/PaperIcon';
import { categories, kinds } from './model';
import type { NotificationSnapshot, NotificationsStore } from './store';
import { tabStops } from './views';

export function NoticeSettings({ state, store, panelId, restore }: {
  state: NotificationSnapshot; store: NotificationsStore; panelId: string; restore(): void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const restoreRef = useRef(restore);
  useLayoutEffect(() => {
    const modal = dialog.current;
    if (!modal) return;
    const doc = modal.ownerDocument;
    let native = false;
    const inerted: Element[] = [];
    try {
      if (typeof modal.showModal === 'function') { modal.showModal(); native = true; }
    } catch { /* Keep the settings accessible where showModal is unavailable. */ }
    if (!native) {
      modal.setAttribute('open', '');
      modal.dataset.fallback = '';
      for (const sibling of Array.from(doc.body.children)) {
        if (sibling.contains(modal) || sibling.hasAttribute('inert') || ['SCRIPT', 'STYLE', 'LINK'].includes(sibling.tagName)) continue;
        sibling.setAttribute('inert', '');
        inerted.push(sibling);
      }
    }
    heading.current?.focus({ preventScroll: true });
    function contain(event: FocusEvent) {
      if (!modal?.contains(event.target as Node)) heading.current?.focus({ preventScroll: true });
    }
    if (!native) doc.addEventListener('focusin', contain);
    return () => {
      doc.removeEventListener('focusin', contain);
      if (native && modal.open) modal.close();
      for (const sibling of inerted) sibling.removeAttribute('inert');
      if (store.alive()) restoreRef.current();
    };
  }, [store]);

  function keydown(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); store.closeSettings(); return; }
    if (event.key !== 'Tab') return;
    const stops = tabStops(event.currentTarget), first = stops[0], last = stops[stops.length - 1];
    if (!first) { event.preventDefault(); return; }
    if (event.shiftKey && (event.target === first || event.target === heading.current)) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && event.target === last) { event.preventDefault(); first.focus(); }
  }

  const settings = state.settings;
  if (!settings) return null;
  const busy = state.busy || state.authBusy;
  return <dialog ref={dialog} dir="rtl" className="notice-settings" data-react-notices-settings=""
    aria-modal="true" aria-labelledby={panelId + '-settings-title'} onKeyDown={keydown}
    onCancel={event => { event.preventDefault(); store.closeSettings(); }}>
    <header>
      <h2 ref={heading} id={panelId + '-settings-title'} tabIndex={-1}>تنظیمات اعلان‌ها</h2>
      <button type="button" data-close-settings="" aria-label="بستن" disabled={busy}
        onClick={store.closeSettings}><PaperIcon name="close" /></button>
    </header>
    <p>انتخاب کن چه اعلان‌هایی در سایت ببینی.</p>
    <form data-settings-form="" onSubmit={event => { event.preventDefault(); void store.saveSettings(); }}>
      {kinds.map(kind => <label key={kind}>
        <span><strong>{categories[kind][0]}</strong><small>{categories[kind][1]}</small></span>
        <input type="checkbox" name={kind} checked={settings.draft[kind]} disabled={busy}
          onChange={event => store.changeSetting(kind, event.currentTarget.checked)} />
      </label>)}
      <p className="notice-settings-status" role="status">{settings.status}</p>
      <button type="button" className="button-outline" data-settings-conflict="" hidden={!settings.conflict}
        disabled={busy} onClick={store.compareSettings}>دریافت تنظیمات جدید برای مقایسه</button>
      {settings.remote && <p data-settings-remote="">{kinds.map(kind =>
        categories[kind][0] + ': ' + (settings.remote![kind] ? 'فعال' : 'خاموش')).join(' · ')}</p>}
      <button className="button-forest" type="submit" disabled={busy || settings.conflict}>ذخیرهٔ تنظیمات</button>
    </form>
  </dialog>;
}
