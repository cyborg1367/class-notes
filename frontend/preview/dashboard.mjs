import {readFile} from 'node:fs/promises';
import path from 'node:path';

export const dashboardStates = Object.freeze({
  member: 'در حال یادگیری', fresh: 'تازه‌وارد', partial: 'پیشرفت ناقص', pending: 'در انتظار عضویت',
});
export const dashboardState = value => Object.hasOwn(dashboardStates, value) ? value : 'member';

export async function dashboardPreviewDocument(root, state) {
  state = dashboardState(state);
  const html = await readFile(path.join(root, 'dist/dashboard/index.html'), 'utf8');
  const controls = Object.entries(dashboardStates).map(([id, label]) =>
    `<a href="/__preview__/dashboard/?state=${id}"${state === id ? ' aria-current="page"' : ''}>${label}</a>`).join('');
  const banner = `<aside class="local-preview-banner" id="local-preview-banner">
    <strong>پیش‌نمایش محلی داشبورد</strong><p>داده‌ها نمونه‌اند و امتیاز یا پیشرفت واقعی ثبت نمی‌شود.</p>
    <nav aria-label="حالت نمایشی">${controls}</nav>
  </aside>`;
  return html
    .replace(/<script\b(?=[^>]*\bdata-portal)[^>]*>\s*<\/script>/, '')
    .replace(/<link\b[^>]*href="[^"]*vendor\/supabase\/supabase\.js[^"]*"[^>]*>/, '')
    .replace('<head>', '<head><base href="/dashboard/">')
    .replace('</head>', `<style>
      [data-shell-account-slot]{display:none}
      .local-preview-banner{padding:12px 20px;background:var(--kit-sage);border-bottom:1px solid var(--kit-rule)}
      .local-preview-banner p{margin:0}
      .local-preview-banner nav{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}
      .local-preview-banner a{display:inline-flex;align-items:center;min-height:44px;padding-inline:10px;border:1px solid var(--kit-rule);color:var(--kit-forest);text-decoration:none}
      .local-preview-banner a[aria-current]{background:var(--kit-forest);color:var(--kit-surface)}
    </style></head>`)
    .replace(/(<body\b[^>]*>)/, '$1' + banner)
    .replace('</body>', `<script type="module" src="/__preview__/dashboard-fixture.mjs?state=${state}"></script></body>`);
}

export function dashboardPreviewSource(state) {
  return `import { mountDashboard } from '/assets/dashboard-page.js';
const state = ${JSON.stringify(dashboardState(state))};
const catalog = JSON.parse(document.querySelector('#catalog-data').textContent);
const courses = state === 'pending' ? [] : catalog;
const labs = courses.flatMap(course => course.lessons.filter(lesson => lesson.lab));
const states = Object.fromEntries(labs.map((lesson, index) => {
  if (state === 'partial' && index === 1) return [lesson.id, {status: 'rejected'}];
  const tasks = lesson.lab_steps.map(({ id }, position) => ({ id, position }));
  const started = state !== 'fresh' && index === 0;
  const completed = started ? tasks.slice(0, 4).map(task => task.id) : [];
  return [lesson.id, {status: 'fulfilled', value: {
    mission: lesson.lab.mission, tasks, completed, maximum: 300, xp: started ? 160 : 0, attempts: completed.length,
  }}];
}));
const input = {courses, states, study: {}, results: []};
const memberships = state === 'pending' ? catalog.map(course => ({
  id:course.id, title:course.display_title || course.title, status:'pending',
})) : [];
const preview = mountDashboard(document.querySelector('[data-dashboard]'));
preview.render({phase:'ready', input, memberships, name:'دانشجو', bookmarks:[], reviewDue:state==='fresh'?0:3}, {
  link: value => new URL('../'+value, document.baseURI).href,
  retry: async () => location.reload(),
  refreshMembership: async () => location.reload(),
  requestAccess: async () => {}, saveBookmarks: () => {},
});
window.addEventListener('pagehide', event => { if (!event.persisted) preview.dispose(); });
`;
}
