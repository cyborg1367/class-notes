import { presenceMembers } from '../../web/assets/classroom-presence.mjs';
import type { PresenceCourse, PresenceOptions, PresencePerson, PresenceSnapshot } from './contracts';

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {};
}

export function createPresenceStore(win: Window, options: PresenceOptions) {
  const { client, rpc, userId, courses } = options;
  const session = win.crypto.randomUUID();
  const key = `classroom-presence-setting:${userId}`;
  let course: PresenceCourse | undefined = courses.find(item => item.id === options.courseId) || courses[0];
  let state: PresenceSnapshot = {
    open: false, connected: false, heading: course?.title || '', people: [],
    status: '', courseId: course?.id || '', courses, visible: true,
    settingBusy: false, settingStatus: '', settingReady: false,
  };
  let disposed = false, inflight = false, queued = false, changing = false, epoch = 0, lastSync = 0;
  let channel: unknown, timer: number | undefined, poll: number | undefined;
  const listeners = new Set<() => void>();
  const alive = () => !disposed && (options.isCurrent?.() ?? true);
  function set(patch: Partial<PresenceSnapshot>) {
    if (!alive()) return;
    state = { ...state, ...patch };
    listeners.forEach(listener => listener());
  }
  function unknown() {
    set({
      connected: false, people: [],
      status: 'فهرست به‌روز دریافت نشد؛ اتصال دوباره خودکار انجام می‌شود.',
    });
  }
  function render(value: unknown) {
    lastSync = Date.now();
    const raw = record(value);
    const people = presenceMembers(raw.members, userId) as PresencePerson[];
    const visible = raw.visible !== false;
    set({
      connected: true, people, visible,
      settingReady: true,
      status: people.length ? '' : 'در حال حاضر هم‌کلاسی دیگری آنلاین نیست.',
    });
  }
  async function sync() {
    if (!alive() || !course) return;
    if (inflight) { queued = true; return; }
    inflight = true;
    const gen = epoch, id = course.id;
    try {
      const value = await rpc('classroom_presence', { p_course: id, p_session: session, p_action: 'sync' });
      if (alive() && gen === epoch) render(value);
    } catch {
      if (alive() && gen === epoch) unknown();
    } finally {
      inflight = false;
      if (queued && alive()) { queued = false; schedule(); }
    }
  }
  function schedule() {
    if (!alive() || timer) return;
    timer = win.setTimeout(() => { timer = undefined; void sync(); }, 1000);
  }
  async function leave(id: string) {
    try { await rpc('classroom_presence', { p_course: id, p_session: session, p_action: 'leave' }); }
    catch { /* Leave is best-effort. */ }
  }
  function disconnect() {
    if (!channel) return;
    const old = channel;
    channel = null;
    Promise.resolve(client.removeChannel(old)).catch(() => {});
  }
  async function connect() {
    epoch++;
    disconnect();
    if (!course || !alive()) return;
    set({ heading: course.title, courseId: course.id });
    const gen = epoch;
    void sync();
    try {
      await client.realtime?.setAuth();
      if (!alive() || gen !== epoch) return;
      const next = client.channel('classroom-presence:' + course.id, { config: { private: true } });
      channel = next.on('broadcast', { event: 'changed' }, schedule).subscribe(status => {
        if (alive() && gen === epoch && status === 'SUBSCRIBED' && Date.now() - lastSync > 1000) schedule();
      });
    } catch { /* RPC polling remains available. */ }
  }
  function startPoll() {
    win.clearInterval(poll);
    poll = win.setInterval(() => { void sync(); }, options.pollInterval ?? 30000);
  }

  void (async () => {
    try {
      if (course) { void connect(); startPoll(); return; }
      const value = record(await rpc('classroom_presence_visibility'));
      if (!alive()) return;
      set({ visible: value.visible !== false, settingReady: true });
    } catch {
      if (alive()) set({ settingStatus: 'تنظیم حضور دریافت نشد.' });
    }
    if (alive()) { void connect(); startPoll(); }
  })();

  return {
    get: () => state,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    setOpen(open: boolean) { if (alive()) set({ open }); },
    selectCourse(id: string) {
      if (!alive()) return;
      const previous = course?.id;
      course = courses.find(item => item.id === id) || courses[0];
      if (previous) void leave(previous);
      unknown();
      void connect();
    },
    async setVisible(wanted: boolean) {
      if (changing || !alive()) return;
      changing = true;
      set({ settingBusy: true });
      try {
        const value = record(await rpc('classroom_presence_visibility', { p_visible: wanted }));
        if (!alive()) return;
        const visible = value.visible !== false;
        set({ visible, settingStatus: visible ? 'نمایش حضور فعال شد.' : 'حضور تو پنهان شد.' });
        try { options.storage?.setItem(key, String(Date.now())); } catch { /* Optional cross-tab hint. */ }
        schedule();
      } catch {
        if (alive()) set({ settingStatus: 'تنظیم ثبت نشد؛ دوباره تلاش کن.' });
      } finally {
        changing = false;
        if (alive()) set({ settingBusy: false });
      }
    },
    online() { void sync(); },
    offline() { unknown(); },
    visible() { if (!win.document.hidden) void sync(); },
    storage(event: StorageEvent) { if (event.key === key) schedule(); },
    pagehide() { if (course) void leave(course.id); disconnect(); },
    pageshow() { void connect(); },
    dispose() {
      if (disposed) return;
      disposed = true;
      epoch++;
      win.clearTimeout(timer);
      win.clearInterval(poll);
      disconnect();
      if (course) void leave(course.id);
      listeners.clear();
    },
  };
}
export type PresenceStore = ReturnType<typeof createPresenceStore>;
