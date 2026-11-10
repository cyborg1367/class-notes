import { readFile } from 'node:fs/promises';
import path from 'node:path';

const route = '/__preview__/notifications/';
const script = '/__preview__/notifications-fixture.mjs';

export async function notificationsPreviewDocument(root) {
  const html = await readFile(path.join(root, 'dist/notifications/index.html'), 'utf8');
  return html
    .replace(/<script\b(?=[^>]*\bdata-portal)[^>]*>\s*<\/script>/, '')
    .replace(/<link\b[^>]*href="[^"]*vendor\/supabase\/supabase\.js[^"]*"[^>]*>/, '')
    .replace('<head>', '<head><base href="/notifications/">')
    .replace(/href="#main"/, 'href="' + route + '#main"')
    .replace(/(<main\b[^>]*>)/, '$1<aside class="shell gate-card" data-notices-demo><p>پیش‌نمایش محلی · اعلان‌ها نمونه‌اند و تغییرات فقط در همین صفحه می‌مانند.</p><div class="account-controls"><span data-sample-notification-anchor></span></div><p data-sample-message role="status"></p></aside>')
    .replace('</body>', '<script type="module" src="' + script + '"></script></body>');
}

export function notificationsFixtureSource() {
  return `const shell = document.querySelector('script[data-site-ui]');
const { ready, loadNotifications } = await import(shell.src);
await ready;
const { mountNotifications } = await loadNotifications();
const baseURL = new URL('/', location.href).href;
let preferences = { lab: true, review: true, content: true, access: true, revision: 1 };
const examples = [
  ['lab','ادامهٔ لابراتور چهارم','اگر فرصت داری، اثر تغییر آستانه را در یک مرحله آزمایش کن.','lab/machine-learning/thresholds-and-roc/','رفتن به لابراتور'],
  ['review','دو موضوع آمادهٔ مرورند','قبل از کلاس، چند دقیقه به پرسش‌های دفتر مرور سر بزن.','review/','بازکردن دفتر مرور'],
  ['content','یادداشت تازه منتشر شد','از شمارش خطا تا انتخاب آستانه','machine-learning/thresholds-and-roc/','مطالعهٔ یادداشت'],
  ['access','دسترسی کلاس فعال شد','حالا یادداشت‌ها و تمرین‌های کلاس برایت در دسترس‌اند.','dashboard/','دیدن داشبورد'],
  ['content','یک تمرین برای جلسهٔ بعد','یک بار تمرین‌های یادداشت قبلی را مرور کن.','quiz/machine-learning/evaluating-knn/','رفتن به تمرین'],
];
const items = examples.map(([kind,title,description,path,action], index) => ({
  id: 'demo-' + index, episode: 'demo-1', kind, title, description, path, action,
  active: true, occurred_at: new Date(Date.now() - index * 86400000).toISOString(),
  read_at: index < 3 ? null : new Date().toISOString(), snoozed_until: null,
}));
const awake = item => !item.snoozed_until || Date.parse(item.snoozed_until) <= Date.now();
const unread = item => !item.read_at && awake(item);
async function rpc(name, args = {}) {
  const now = new Date().toISOString();
  if (name === 'classroom_notifications') {
    const source = items.filter(item => preferences[item.kind]);
    const selected = source.filter(item => (args.p_history || awake(item)) && (!args.p_unread || unread(item)));
    const position = args.p_before_id ? selected.findIndex(item => item.id === args.p_before_id) + 1 : 0;
    const rows = selected.slice(position, position + (args.p_history ? 3 : 5));
    const last = rows[rows.length - 1];
    return { items: rows, unread_count: source.filter(unread).length, preferences, server_now: now,
      next_cursor: last && args.p_history && position + rows.length < selected.length
        ? { at: last.occurred_at, id: last.id } : null };
  }
  const item = items.find(row => row.id === args.p_id && row.episode === args.p_episode);
  if (name === 'classroom_notice_read' && item) { item.read_at = now; return true; }
  if (name === 'classroom_notice_read_all') {
    items.filter(item => item.occurred_at <= args.p_cutoff && preferences[item.kind] && unread(item))
      .forEach(item => { item.read_at = now; });
    return true;
  }
  if (name === 'classroom_notice_snooze' && item) {
    item.snoozed_until = new Date(Date.now() + args.p_days * 86400000).toISOString(); item.read_at = null; return true;
  }
  if (name === 'classroom_notice_preferences') {
    if (args.p_revision !== preferences.revision) throw Error('NOTICE_SETTINGS_CONFLICT');
    preferences = { ...args.p_settings, revision: preferences.revision + 1 }; return preferences;
  }
  throw Error('UNSUPPORTED_SAMPLE_OPERATION');
}
const ui = mountNotifications({
  rpc, baseURL, userId:'local-notice-sample', previewHref:${JSON.stringify(route)},
  onNavigate() { document.querySelector('[data-sample-message]').textContent = 'این اعلان نمونه است؛ صفحهٔ واقعی باز نشد.'; },
});
ui.attach(document.querySelector('[data-sample-notification-anchor]'));
ui.attachPage(document.querySelector('[data-notifications-page]'));
void ui.refresh();
window.addEventListener('pagehide', event => { if (!event.persisted) ui.dispose(); });
`;
}

export function notificationsPreviewPlugin(root) {
  return { name: 'local-notifications-preview', apply: 'serve', configureServer(server) {
    server.middlewares.use(async (request, response, next) => {
      const url = new URL(request.url || '/', 'http://local.invalid');
      if (request.method !== 'GET' || (url.pathname !== route && url.pathname !== script)) return next();
      try {
        const isScript = url.pathname === script;
        response.setHeader('Content-Type', isScript ? 'text/javascript; charset=utf-8' : 'text/html; charset=utf-8');
        response.setHeader('Cache-Control', 'no-store');
        response.end(isScript ? notificationsFixtureSource() : await server.transformIndexHtml(route, await notificationsPreviewDocument(root)));
      } catch (error) { next(error); }
    });
  }};
}
