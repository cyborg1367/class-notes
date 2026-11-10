import { useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { createPresenceStore } from './store';
import { PresenceSetting, PresenceWidget } from './views';
import type { PresenceOptions } from './contracts';

export function mountPresence(options: PresenceOptions) {
  const doc = (options.anchor || options.account)?.ownerDocument || document;
  const win = doc.defaultView || window;
  let storage = options.storage;
  if (storage === undefined) {
    try { storage = win.localStorage; } catch { storage = null; }
  }
  const host = doc.createElement('div');
  host.dataset.reactPresenceRoot = '';
  host.style.display = 'contents';
  doc.body.append(host);
  const root = createRoot(host, { identifierPrefix: 'presence-' });
  const store = createPresenceStore(win, { ...options, storage });
  const showWidget = !!(options.anchor && options.courses.length);
  const showSetting = !!options.account;

  function App() {
    useSyncExternalStore(store.subscribe, store.get);
    return <>
      {showWidget && options.anchor && createPortal(<PresenceWidget store={store} />, options.anchor)}
      {showSetting && options.account && createPortal(<PresenceSetting store={store} />, options.account)}
    </>;
  }

  function outside(event: Event) {
    const node = event.target as Node | null;
    const widget = options.anchor?.querySelector('.classroom-presence');
    if (widget && !widget.contains(node)) store.setOpen(false);
  }
  function escape(event: KeyboardEvent) {
    if (event.key === 'Escape' && store.get().open) {
      store.setOpen(false);
      options.anchor?.querySelector<HTMLElement>('summary')?.focus();
    }
  }
  doc.addEventListener('click', outside);
  doc.addEventListener('keydown', escape);
  win.addEventListener('storage', store.storage);
  win.addEventListener('online', store.online);
  win.addEventListener('offline', store.offline);
  doc.addEventListener('visibilitychange', store.visible);
  win.addEventListener('pagehide', store.pagehide);
  win.addEventListener('pageshow', store.pageshow);
  root.render(<App />);

  return {
    dispose() {
      doc.removeEventListener('click', outside);
      doc.removeEventListener('keydown', escape);
      win.removeEventListener('storage', store.storage);
      win.removeEventListener('online', store.online);
      win.removeEventListener('offline', store.offline);
      doc.removeEventListener('visibilitychange', store.visible);
      win.removeEventListener('pagehide', store.pagehide);
      win.removeEventListener('pageshow', store.pageshow);
      store.dispose();
      root.unmount();
      host.remove();
    },
  };
}
