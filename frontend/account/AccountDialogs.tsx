import React, { useLayoutEffect, useRef, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import type { AccountPort } from './contracts';

function UnsavedDialog({ port, container, localSaved }: { port: AccountPort; container: HTMLElement; localSaved: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  const native = typeof container.ownerDocument.defaultView?.HTMLDialogElement?.prototype.showModal === 'function';
  useLayoutEffect(() => {
    const node = ref.current, doc = container.ownerDocument;
    if (!node) return;
    const previous = doc.activeElement as HTMLElement | null;
    const win = doc.defaultView;
    if (win) doc.dispatchEvent(new win.CustomEvent('classroom-panel-open', { detail: { kind: 'account-dialog' } }));
    if (native) node.showModal();
    node.querySelector<HTMLButtonElement>('[data-stay]')?.focus();
    return () => { if (native && node.open) node.close(); if (previous?.isConnected) previous.focus(); };
  }, [container, native]);
  return <div className={native ? 'account-dialog-portal' : 'account-dialog-backdrop'}>
    <dialog ref={ref} open={native ? undefined : true} className="account-exit-dialog" dir="rtl" role="alertdialog" aria-modal="true" aria-labelledby="cn-account-exit-title" aria-describedby="cn-account-exit-description"
      onCancel={event => { event.preventDefault(); port.resolveConfirmation(false); }}
      onKeyDown={event => {
        if (event.key === 'Escape') { event.preventDefault(); port.resolveConfirmation(false); }
        if (event.key === 'Tab') {
          const buttons = [...(ref.current?.querySelectorAll<HTMLButtonElement>('button') || [])];
          const first = buttons[0], last = buttons[buttons.length - 1];
          if (event.shiftKey && container.ownerDocument.activeElement === first) { event.preventDefault(); last?.focus(); }
          else if (!event.shiftKey && container.ownerDocument.activeElement === last) { event.preventDefault(); first?.focus(); }
        }
      }}>
      <h2 id="cn-account-exit-title">پیش‌نویس هنوز در حساب ذخیره نشده</h2>
      <p id="cn-account-exit-description">{localSaved ? 'نسخهٔ این مرورگر حفظ شده است. برای دسترسی از دستگاه دیگر، ابتدا ذخیره در حساب را کامل کن.' : 'پیش از خروج، کد یا پاسخ‌های فعلی را نزد خودت نگه دار.'}</p>
      <div><button className="button-forest" type="button" data-stay="" onClick={() => port.resolveConfirmation(false)}>بازگشت و بررسی ذخیره</button><button className="button-outline" type="button" data-leave="" onClick={() => port.resolveConfirmation(true)}>خروج از حساب</button></div>
    </dialog>
  </div>;
}

export function AccountDialogs({ port, container }: { port: AccountPort; container?: HTMLElement }) {
  const view = useSyncExternalStore(port.subscribe, port.getSnapshot, port.getServerSnapshot);
  if (!view.dialog || !container) return null;
  return createPortal(<UnsavedDialog key={view.dialog.id} port={port} container={container} localSaved={view.dialog.localSaved} />, container);
}
