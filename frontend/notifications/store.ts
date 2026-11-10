import { mergeNotices } from '../../web/assets/notifications.mjs';
import { cleanFeed, errorCode, failure, type Cursor, type Feed, type Kind, type Notice, type Preferences, type Settings } from './model';

export type NotificationsOptions = {
  doc?: Document; win?: Window & typeof globalThis;
  rpc(name: string, args?: Record<string, unknown>): Promise<unknown>;
  userId: string; baseURL: string; isCurrent?: () => boolean;
  onNavigate?: (url: string) => void; previewHref?: string;
  requestTimeout?: number; refreshInterval?: number;
};
type History = {
  items: Notice[]; cursor: Cursor | null; snapshot: string | null;
  unreadOnly: boolean; loaded: boolean; loading: boolean; error: string;
};
type SettingsView = {
  draft: Settings; revision: number; status: string; conflict: boolean; remote: Preferences | null;
};
type Snapshot = {
  feed: Feed | null; error: string; unreadCount: number | null; preferences: Preferences | null;
  history: History; settings: SettingsView | null; busy: boolean; authBusy: boolean; message: string; actionError: string;
};
const emptyHistory = (): History => ({
  items: [], cursor: null, snapshot: null, unreadOnly: false, loaded: false, loading: false, error: '',
});

export function createNotificationStore(win: Window, options: NotificationsOptions, announceChange: () => void) {
  const { userId, baseURL, rpc, requestTimeout = 12000 } = options;
  let state: Snapshot = {
    feed: null, error: '', unreadCount: null, preferences: null, history: emptyHistory(),
    settings: null, busy: false, authBusy: false, message: '', actionError: '',
  };
  let disposed = false, historyAttached = false, lastFetch = 0, lastCount = 0, feedTicket = 0, historyTicket = 0;
  let pendingFeed: Promise<void> | null = null, refreshRequested = false;
  const cancellations = new Set<() => void>(), listeners = new Set<() => void>();
  const alive = () => !disposed && (options.isCurrent?.() ?? true);
  function set(patch: Partial<Snapshot>) {
    if (!alive()) return;
    state = { ...state, ...patch };
    listeners.forEach(listener => listener());
  }
  const history = (patch: Partial<History>) => set({ history: { ...state.history, ...patch } });
  function bounded(name: string, args?: Record<string, unknown>) {
    return new Promise<unknown>((resolve, reject) => {
      if (!alive()) { reject(Error('ACCOUNT_CHANGED')); return; }
      let settled = false;
      const timer = win.setTimeout(() => finish(false, Error('NOTICE_TIMEOUT')), requestTimeout);
      const cancel = () => finish(false, Error('ACCOUNT_CHANGED'));
      function finish(ok: boolean, value: unknown) {
        if (settled) return;
        settled = true;
        win.clearTimeout(timer);
        cancellations.delete(cancel);
        if (ok) resolve(value); else reject(value);
      }
      cancellations.add(cancel);
      Promise.resolve().then(() => {
        if (!alive() || settled) throw Error('ACCOUNT_CHANGED');
        return rpc(name, args ?? {});
      }).then(value => finish(true, value), error => finish(false, error));
    });
  }
  const older = () => lastFetch === 0 || Date.now() - lastFetch >= 60000;
  function shared(feed: Feed): Pick<Snapshot, 'unreadCount' | 'preferences'> {
    const preferences = state.preferences && state.preferences.revision > feed.preferences.revision
      ? state.preferences : feed.preferences;
    const date = Date.parse(feed.server_now);
    const unreadCount = date >= lastCount ? feed.unread_count : state.unreadCount;
    lastCount = Math.max(lastCount, date);
    return { unreadCount, preferences };
  }
  function refresh(force = false) {
    if (!alive() || state.authBusy) return Promise.resolve();
    if (pendingFeed) return pendingFeed;
    if (!force && !older()) return Promise.resolve();
    const ticket = ++feedTicket;
    const task = bounded('classroom_notifications').then(value => {
      if (!alive() || ticket !== feedTicket) return;
      const feed = cleanFeed(value, baseURL);
      lastFetch = Date.now();
      set({ feed, error: '', ...shared(feed) });
    }).catch(error => {
      if (ticket === feedTicket) set({ error: failure(error) });
    }).finally(() => {
      if (pendingFeed === task) {
        pendingFeed = null;
        drainRefresh();
      }
    });
    pendingFeed = task;
    return task;
  }
  async function loadHistory(reset: boolean, unreadOnly = state.history.unreadOnly) {
    if (!alive() || state.authBusy || !historyAttached ||
        (!reset && (!state.history.cursor || state.history.loading))) return;
    const ticket = ++historyTicket, cursor = reset ? null : state.history.cursor;
    const filterChanged = unreadOnly !== state.history.unreadOnly;
    if (filterChanged) history({ ...emptyHistory(), unreadOnly, loading: true });
    else history({ loading: true, error: '' });
    try {
      const response = await bounded('classroom_notifications', {
        p_history: true, p_before: cursor?.at ?? null, p_before_id: cursor?.id ?? null, p_unread: unreadOnly,
      });
      if (!alive() || ticket !== historyTicket) return;
      const feed = cleanFeed(response, baseURL);
      set({ ...shared(feed), history: {
        items: reset ? feed.items : mergeNotices(state.history.items, feed.items),
        snapshot: reset ? feed.server_now : state.history.snapshot,
        cursor: feed.next_cursor, unreadOnly, loaded: true, loading: false, error: '',
      } });
    } catch (error) {
      if (ticket === historyTicket) history({ loading: false, error: failure(error) });
    } finally {
      drainRefresh();
    }
  }
  function setHistoryAttached(attached: boolean) {
    historyAttached = attached;
    ++historyTicket;
    set({ history: emptyHistory() });
    if (attached) void loadHistory(true);
    else drainRefresh();
  }
  // A response already in flight may precede a cross-tab write or reconnect.
  // Coalesce those invalidations into one later read of each surface.
  function drainRefresh() {
    if (!refreshRequested || !alive() || state.authBusy || state.busy || pendingFeed || state.history.loading) return;
    refreshRequested = false;
    void refresh(true);
    void loadHistory(true);
  }
  function refreshSurfaces(force = false) {
    if (!alive()) return;
    if (force) {
      refreshRequested = true;
      drainRefresh();
      return;
    }
    if (state.authBusy || state.busy || !older()) return;
    void refresh();
    if (!state.history.loading) void loadHistory(true);
  }
  async function action(run: () => Promise<void>, message?: string) {
    if (!alive() || state.busy || state.authBusy) return false;
    set({ busy: true, message: '', actionError: '' });
    try {
      await run();
      if (!alive()) return false;
      if (message) {
        announceChange();
        if (pendingFeed) { ++feedTicket; pendingFeed = null; }
        ++historyTicket;
        refreshRequested = false;
        history({ loading: false });
        await Promise.all([refresh(true), loadHistory(true)]);
        if (alive()) set({ message });
      }
      return alive();
    } catch (error) {
      if (alive() && !state.settings) set({ actionError: failure(error) });
      return false;
    } finally {
      if (alive()) {
        set({ busy: false });
        drainRefresh();
      }
    }
  }

  const itemArgs = (item: Notice) => ({ p_owner: userId, p_id: item.id, p_episode: item.episode });
  const write = async (name: string, args: Record<string, unknown>) => { await bounded(name, args); };
  function read(item: Notice) {
    return action(async () => {
      await write('classroom_notice_read', itemArgs(item));
      if (!alive()) return;
      const readAt = new Date().toISOString();
      const mark = (entry: Notice) => entry.id === item.id && entry.episode === item.episode
        ? { ...entry, read_at: entry.read_at ?? readAt } : entry;
      set({
        feed: state.feed && { ...state.feed, items: state.feed.items.map(mark) },
        history: { ...state.history, items: state.history.items.map(mark).filter(entry => !state.history.unreadOnly || !entry.read_at) },
      });
    }, 'اعلان خوانده شد.');
  }
  function readAll(surface: 'popup' | 'history') {
    const cutoff = surface === 'popup' ? state.feed?.server_now : state.history.snapshot;
    if (!cutoff || !state.unreadCount) return;
    void action(() => write('classroom_notice_read_all', { p_owner: userId, p_cutoff: cutoff }), 'اعلان‌های موجود خوانده شدند.');
  }
  function snooze(item: Notice, days: number) {
    if (![1, 3, 7].includes(days) || !item.active || (item.kind !== 'lab' && item.kind !== 'review')) return;
    void action(() => write('classroom_notice_snooze', { ...itemArgs(item), p_days: days }), 'یادآوری برای زمان دیگری تنظیم شد.');
  }
  function openSettings() {
    const pref = state.preferences;
    if (!alive() || state.busy || state.authBusy || !pref || state.settings) return false;
    const { revision, ...draft } = pref;
    set({ settings: { draft, revision, status: '', conflict: false, remote: null } });
    return true;
  }
  function changeSetting(kind: Kind, value: boolean) {
    const settings = state.settings;
    if (settings && !state.busy && !state.authBusy) set({ settings: { ...settings, draft: { ...settings.draft, [kind]: value } } });
  }
  function closeSettings() {
    if (state.settings && !state.busy) set({ settings: null });
  }
  async function saveSettings() {
    const settings = state.settings;
    if (!settings || settings.conflict) return false;
    let saved = false;
    await action(async () => {
      try {
        await bounded('classroom_notice_preferences', { p_owner: userId, p_revision: settings.revision, p_settings: settings.draft });
      } catch (error) {
        set({ settings: { ...settings, conflict: /NOTICE_SETTINGS_CONFLICT/.test(errorCode(error)), status: failure(error) } });
        throw error;
      }
      saved = alive();
      if (saved) set({ settings: null });
    }, 'تنظیمات اعلان‌ها ذخیره شد.');
    return saved && alive();
  }
  function compareSettings() {
    const settings = state.settings;
    if (!settings?.conflict) return;
    void action(async () => {
      try {
        const { preferences } = cleanFeed(await bounded('classroom_notifications'), baseURL);
        set({ settings: { ...settings, revision: preferences.revision, remote: preferences, conflict: false,
          status: 'انتخاب‌های تو حفظ شدند؛ با ذخیره، همین انتخاب‌ها جایگزین تنظیمات حساب می‌شوند.' } });
      } catch (error) {
        set({ settings: { ...settings, status: failure(error) } });
        throw error;
      }
    });
  }
  return {
    get: () => state,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    alive, refresh, refreshSurfaces, setHistoryAttached, loadHistory, read, readAll, snooze,
    openSettings, changeSetting, closeSettings, saveSettings, compareSettings,
    clearActionError() { if (state.actionError) set({ actionError: '' }); },
    setBusy(authBusy: boolean) {
      if (state.authBusy === authBusy) return;
      set({ authBusy });
      if (!authBusy) drainRefresh();
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      for (const cancel of [...cancellations]) cancel();
      listeners.clear();
      state = { feed: null, error: '', unreadCount: null, preferences: null, history: emptyHistory(),
        settings: null, busy: false, authBusy: false, message: '', actionError: '' };
    },
  };
}
export type NotificationsStore = ReturnType<typeof createNotificationStore>;
export type NotificationSnapshot = ReturnType<NotificationsStore['get']>;
