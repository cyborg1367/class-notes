import { useLayoutEffect, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { createNotificationStore, type NotificationsOptions } from './store';
import { Bell, NoticeHistory, NoticePopup, type NoticeActions } from './views';
import { NoticeSettings } from './NoticeSettings';

let serial = 0;
type Surfaces = { anchors: { element: HTMLElement; key: number }[]; page: HTMLElement | null; active: HTMLElement | null };

// Only the adapter knows about the page shell. All surfaces share one store
// and one React root. Portals keep the shell/account roots independent.
export function mountNotifications(options: NotificationsOptions) {
  const doc = options.doc ?? document, win = options.win ?? window;
  const id = 'class-notice-panel-' + (++serial);
  const host = doc.createElement('div');
  host.dataset.reactNotificationsRoot = '';
  host.style.display = 'contents';
  doc.body.append(host);
  const root = createRoot(host, { identifierPrefix: id + '-' });
  const listeners = new Set<() => void>();
  const channelOwner = options.userId;
  let channel: BroadcastChannel | undefined, refreshTimer: number | undefined, anchorKey = 0;
  let disposed = false, settingsOpener: HTMLElement | null = null, focusAfterSettings: HTMLElement | null = null;
  let surfaces: Surfaces = { anchors: [], active: null, page: null };
  const store = createNotificationStore(win, options, () => {
    try { channel?.postMessage({ type: 'changed', owner: channelOwner }); } catch { /* Optional cross-tab refresh. */ }
  });
  const getSurfaces = () => surfaces;
  const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
  function set(patch: Partial<Surfaces>) {
    surfaces = { ...surfaces, ...patch };
    listeners.forEach(listener => listener());
  }
  const trigger = (anchor: HTMLElement | null) => anchor?.querySelector<HTMLElement>('.notice-trigger') ?? null;
  function close(focus = false) {
    const previous = surfaces.active;
    if (!previous) return;
    set({ active: null });
    if (focus && previous.isConnected) trigger(previous)?.focus({ preventScroll: true });
  }
  function toggle(anchor: HTMLElement) {
    if (!store.alive() || store.get().authBusy || store.get().settings) return;
    if (surfaces.active === anchor) { close(); return; }
    set({ active: anchor });
    doc.dispatchEvent(new win.CustomEvent('classroom-panel-open', { detail: { kind: 'notifications' } }));
    void store.refresh(true);
  }
  const actions: NoticeActions = {
    href: item => options.previewHref ?? item.href,
    async open(item, event) {
      const { busy, authBusy } = store.get();
      if (!store.alive() || busy || authBusy) { event.preventDefault(); return; }
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button) {
        void store.read(item); return;
      }
      event.preventDefault();
      close();
      if (await store.read(item) && store.alive() && !store.get().authBusy)
        (options.onNavigate ?? (href => win.location.assign(href)))(item.href);
    },
    settings(opener) {
      if (!store.openSettings()) return;
      focusAfterSettings = null;
      settingsOpener = (opener.closest('[data-react-notices-popup]') ? trigger(surfaces.active) : null) ?? opener;
      close();
    },
  };
  function focusOpener() {
    const target = focusAfterSettings;
    if (!target || disposed) return;
    if (!target.isConnected || store.get().authBusy) { focusAfterSettings = null; return; }
    if (target.matches(':disabled')) return;
    focusAfterSettings = null;
    if (doc.activeElement === doc.body || host.contains(doc.activeElement))
      target.focus({ preventScroll: true });
  }
  function restoreSettingsFocus() {
    focusAfterSettings = settingsOpener;
    settingsOpener = null;
    win.queueMicrotask(focusOpener);
  }
  function App() {
    const state = useSyncExternalStore(store.subscribe, store.get);
    const { anchors, active, page } = useSyncExternalStore(subscribe, getSurfaces);
    useLayoutEffect(focusOpener, [state.busy, state.settings]);
    return <>
      {anchors.map(({ element, key }) => createPortal(
        <Bell state={state} expanded={active === element} panelId={id} toggle={() => toggle(element)} />, element, String(key)))}
      <NoticePopup {...{ state, store, actions }} anchor={active} panelId={id}
        historyURL={options.previewHref ?? new URL('notifications/', options.baseURL).href} close={close} />
      {page && createPortal(<NoticeHistory {...{ state, store, actions }} />, page)}
      {state.settings && <NoticeSettings {...{ state, store }} panelId={id} restore={restoreSettingsFocus} />}
      <p className="sr-only" role="status" aria-live="polite">{state.actionError || state.message}</p>
    </>;
  }

  function inside(target: EventTarget | null) {
    const node = target as Node | null;
    return !!node && (host.contains(node) || surfaces.anchors.some(({ element }) => element.contains(node)));
  }
  function outside(event: Event) {
    if (surfaces.active && !inside(event.target)) close();
  }
  function escape(event: KeyboardEvent) {
    if (surfaces.active && event.key === 'Escape' && !event.defaultPrevented && !event.isComposing) {
      event.preventDefault(); close(true);
    }
  }
  function panelOpened(event: Event) {
    if ((event as CustomEvent).detail?.kind !== 'notifications') close();
  }
  function progress() {
    if (!store.alive()) return;
    win.clearTimeout(refreshTimer);
    refreshTimer = win.setTimeout(() => { refreshTimer = undefined; store.refreshSurfaces(true); }, 250);
  }
  function visible() {
    if (doc.visibilityState !== 'hidden' && win.navigator.onLine !== false) store.refreshSurfaces();
  }
  function online() { store.refreshSurfaces(true); }
  function prune() {
    const anchors = surfaces.anchors.filter(({ element }) => element.isConnected);
    const active = surfaces.active?.isConnected ? surfaces.active : null;
    if (anchors.length !== surfaces.anchors.length || active !== surfaces.active) set({ anchors, active });
    if (surfaces.page && !surfaces.page.isConnected) { set({ page: null }); store.setHistoryAttached(false); }
  }

  const observer = typeof win.MutationObserver === 'function' ? new win.MutationObserver(records => {
    if (records.some(record => record.removedNodes.length)) prune();
  }) : null;
  observer?.observe(doc.body, { childList: true, subtree: true });
  doc.addEventListener('click', outside);
  doc.addEventListener('focusin', outside);
  doc.addEventListener('keydown', escape);
  doc.addEventListener('classroom-panel-open', panelOpened);
  doc.addEventListener('classroom-progress-changed', progress);
  doc.addEventListener('visibilitychange', visible);
  win.addEventListener('focus', visible);
  win.addEventListener('online', online);
  const interval = win.setInterval(visible, options.refreshInterval ?? 300000);
  try {
    if (win.BroadcastChannel) {
      channel = new win.BroadcastChannel('class-notes-notices:' + new URL(options.baseURL).pathname + ':' + channelOwner);
      channel.onmessage = event => {
        if (event.data?.type === 'changed' && event.data?.owner === channelOwner) store.refreshSurfaces(true);
      };
    }
  } catch { /* The in-page inbox works without BroadcastChannel. */ }

  root.render(<App />);
  return {
    attach(element: HTMLElement | null) {
      if (!element?.isConnected || !store.alive()) return;
      prune();
      if (!surfaces.anchors.some(anchor => anchor.element === element))
        set({ anchors: [...surfaces.anchors, { element, key: ++anchorKey }] });
    },
    attachPage(page: HTMLElement | null) {
      if (!store.alive() || page === surfaces.page) return;
      if (page) page.replaceChildren();
      set({ page });
      store.setHistoryAttached(!!page);
    },
    refresh: store.refresh,
    setBusy(value: boolean) { store.setBusy(value); if (value) close(); },
    dispose() {
      if (disposed) return;
      disposed = true;
      observer?.disconnect();
      win.clearInterval(interval);
      win.clearTimeout(refreshTimer);
      channel?.close();
      doc.removeEventListener('click', outside);
      doc.removeEventListener('focusin', outside);
      doc.removeEventListener('keydown', escape);
      doc.removeEventListener('classroom-panel-open', panelOpened);
      doc.removeEventListener('classroom-progress-changed', progress);
      doc.removeEventListener('visibilitychange', visible);
      win.removeEventListener('focus', visible);
      win.removeEventListener('online', online);
      store.dispose();
      root.unmount();
      host.remove();
      listeners.clear();
      surfaces = { anchors: [], page: null, active: null };
      settingsOpener = null;
      focusAfterSettings = null;
    },
  };
}
