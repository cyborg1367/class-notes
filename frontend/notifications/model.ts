import { noticeKey, noticeURL, validNotice } from '../../web/assets/notifications.mjs';

export const categories = {
  lab: ['لابراتورها', 'پیشنهاد قدم بعدی و یادآوری ادامهٔ لابراتور', 'lab'],
  review: ['دفتر مرور', 'یادآوری موضوعات آمادهٔ مرور', 'review'],
  content: ['محتوای تازه', 'انتشار یادداشت، تمرین یا لابراتور', 'book'],
  access: ['دسترسی کلاس', 'خبر فعال‌شدن دسترسی کلاس', 'check'],
} as const;
export type Kind = keyof typeof categories;
export const kinds = Object.keys(categories) as Kind[];
export type Settings = Record<Kind, boolean>;
export type Preferences = Settings & { revision: number };
export type Notice = {
  id: string; episode: string; kind: Kind; href: string; title: string;
  description: string; action: string; active: boolean; occurred_at: string;
  read_at: string | null; snoozed_until: string | null;
};
export type Cursor = { at: string; id: string };
export type Feed = {
  items: Notice[]; unread_count: number; preferences: Preferences; server_now: string; next_cursor: Cursor | null;
};
type RecordValue = Record<string, unknown>;
function record(value: unknown): RecordValue {
  return value && typeof value === 'object' ? value as RecordValue : {};
}
function timestamp(value: unknown): value is string {
  return typeof value === 'string' && Number.isFinite(Date.parse(value));
}
export function cleanFeed(value: unknown, baseURL: string): Feed {
  const raw = record(value), pref = record(raw.preferences), cursor = record(raw.next_cursor);
  if (!Array.isArray(raw.items) || typeof raw.unread_count !== 'number' || !Number.isInteger(raw.unread_count) ||
      raw.unread_count < 0 || !timestamp(raw.server_now) || !Number.isInteger(pref.revision) ||
      !kinds.every(kind => typeof pref[kind] === 'boolean')) throw Error('INVALID_NOTICE_FEED');

  const items = new Map<string, Notice>();
  for (const input of raw.items) {
    const item = record(input), { id, episode, title, description, action, active, occurred_at, read_at, snoozed_until } = item;
    if (!validNotice(item, baseURL) || typeof id !== 'string' || typeof episode !== 'string' ||
        typeof title !== 'string' || typeof description !== 'string' || typeof action !== 'string' ||
        typeof active !== 'boolean' || !timestamp(occurred_at)) continue;
    const href = noticeURL(item.path, baseURL);
    if (!href) continue;
    const notice: Notice = { id, episode, title, description, action, active, occurred_at, href,
      kind: item.kind as Kind, read_at: timestamp(read_at) ? read_at : null,
      snoozed_until: timestamp(snoozed_until) ? snoozed_until : null };
    items.set(noticeKey(notice), notice);
  }
  const preferences = { lab: pref.lab, review: pref.review, content: pref.content, access: pref.access, revision: pref.revision } as Preferences;
  return { items: [...items.values()], unread_count: raw.unread_count, preferences, server_now: raw.server_now,
    next_cursor: timestamp(cursor.at) && typeof cursor.id === 'string' ? { at: cursor.at, id: cursor.id } : null };
}

export function sleeping(item: Notice, now = Date.now()) {
  return item.snoozed_until !== null && Date.parse(item.snoozed_until) > now;
}
export function unread(item: Notice, now = Date.now()) {
  return !item.read_at && item.active && !sleeping(item, now);
}
export function errorCode(error: unknown) {
  if (typeof error === 'string') return error;
  const { code, message } = record(error);
  return [code, message].filter(value => typeof value === 'string').join(' ');
}
export function failure(error: unknown) {
  const message = errorCode(error);
  if (/NOTICE_CHANGED/.test(message)) return 'این اعلان تغییر کرده است؛ فهرست را به‌روز کن.';
  if (/NOTICE_SETTINGS_CONFLICT/.test(message)) return 'تنظیمات در پنجرهٔ دیگری تغییر کرده است؛ انتخاب‌های تو حفظ شده‌اند.';
  if (/PGRST202|does not exist/.test(message)) return 'مرکز اعلان‌ها هنوز روی سرور فعال نشده است.';
  return 'دریافت یا ثبت اعلان‌ها کامل نشد. دوباره تلاش کن.';
}
