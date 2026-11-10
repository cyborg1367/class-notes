import { readFile } from 'node:fs/promises';
import path from 'node:path';

const route = '/__preview__/review/';
const script = '/__preview__/review-fixture.mjs';

export async function reviewPreviewDocument(root) {
  const html = await readFile(path.join(root, 'dist/review/index.html'), 'utf8');
  return html
    .replace(/<script\b(?=[^>]*\bdata-portal)[^>]*>\s*<\/script>/, '')
    .replace(/<link\b[^>]*href="[^"]*vendor\/supabase\/supabase\.js[^"]*"[^>]*>/, '')
    .replace('<head>', '<head><base href="/review/">')
    .replace('</head>', '<style>[data-shell-account-slot]{display:none}.rv-sample-banner{padding:12px 7%;background:var(--kit-sage);border-block-end:1px solid var(--kit-rule)}</style></head>')
    .replace(/(<body\b[^>]*>)/, '$1<aside class="rv-sample-banner">پیش‌نمایش محلی دفتر مرور · داده‌ها نمونه‌اند و تغییرات فقط تا بستن یا تازه‌کردن این صفحه باقی می‌مانند.</aside>')
    .replace('</body>', `<script type="module" src="${script}"></script></body>`);
}

// Dev-only module. The real route never imports or publishes these samples.
export function reviewFixtureSource() {
  return `const entry = document.querySelector('script[data-site-ui]');
const { loadReviewNotebook } = await import(entry.src);
const { mountReviewNotebook } = await loadReviewNotebook();
const lessons = JSON.parse(document.querySelector('#catalog-data').textContent).flatMap(course => course.lessons);
const concept = { id: 'sample-concept', lesson_id: lessons[0]?.id, title: 'تعداد ویژگی‌های یک نمونه',
  description: 'سطرها نمونه و ستون‌ها ویژگی‌اند.',
  learning: {
    goal: 'تشخیص بده هر نمونه چند ویژگی دارد.',
    core: 'در یک جدول داده، تعداد ستون‌ها تعداد ویژگی‌های هر نمونه است.',
    example: 'آرایهٔ [[2, 5], [1, 6]] دو سطر و دو ستون دارد. هر سطر دو ویژگی دارد.',
    pitfall: 'تعداد سطرها را به جای تعداد ویژگی‌ها نشمار.',
  },
};
const topics = [
  { id: 'sample-topic', concept_id: concept.id, title: concept.title, note: 'در داده‌های جدولی، ویژگی را با ستون می‌شمارم.',
    due: true, bookmarked: false, revision: 0, updated_at: '2026-11-01T08:00:00Z', source: { kind: 'manual' } },
  { id: 'sample-note', concept_id: null, title: 'یادداشت آزاد نمونه', note: 'فردا مثال دیگری تمرین کنم.',
    due: false, bookmarked: true, revision: 0, updated_at: '2026-11-01T06:00:00Z' },
];
const state = { entries: topics, concepts: [concept] };
const memory = new Map(), runs = new Map();
const storage = { getItem: key => memory.get(key) ?? null, setItem: (key, value) => memory.set(key, value), removeItem: key => memory.delete(key) };
async function rpc(name, args = {}) {
  const item = state.entries.find(item => item.id === args.p_entry);
  const run = runs.get(args.p_run);
  switch (name) {
    case 'classroom_review_state': return structuredClone(state);
    case 'classroom_review_context': return { entry_id: item.id, concept, evidence: [{ kind: 'manual' }] };
    case 'classroom_review_open': {
      let current = [...runs.values()].find(run => run.entry_id === item.id && !run.receipt);
      if (!current) {
        current = { id: crypto.randomUUID(), entry_id: item.id,
          question: { stem: 'جدولی ۵ سطر و ۳ ستون دارد. هر نمونه چند ویژگی دارد؟', options: ['۵', '۳', '۱۵'] },
          hint_used: false, prepared: false, reflection: '', revision: 0 };
        runs.set(current.id, current);
      }
      current.prepared ||= args.p_read_before;
      const { id, entry_id, question, hint_used, hint } = current;
      return { id, entry_id, question, hint_used, hint };
    }
    case 'classroom_review_hint': run.hint_used = true; return run.hint = 'فقط ستون‌ها را بشمار.';
    case 'classroom_review_finish': {
      const entry = state.entries.find(entry => entry.id === run.entry_id);
      entry.due = false; entry.last_review = new Date().toISOString();
      run.receipt ??= { correct: args.p_answer === '1', answer: '1', explanation: 'هر سطر یک نمونه است و سه ستون دارد.',
        hint_used: run.hint_used, preparation_used: run.prepared, next_due: new Date(Date.now() + 86400000).toISOString() };
      entry.next_due = run.receipt.next_due;
      return { ...run.receipt, reflection: run.reflection, reflection_revision: run.revision };
    }
    case 'classroom_review_reflect':
      if (args.p_text !== undefined) {
        run.reflection = args.p_text; run.revision++;
        state.entries.find(item => item.id === run.entry_id).last_reflection = { text: run.reflection, at: new Date().toISOString() };
      }
      return { text: run.reflection, revision: run.revision };
    case 'classroom_review_pause': item.paused = args.p_paused; item.due = !item.paused; return ++item.revision;
    case 'classroom_review_save':
      if (item.revision !== args.p_revision) throw Error('REVIEW_NOTE_CONFLICT');
      Object.assign(item, { title: args.p_title, note: args.p_note, bookmarked: args.p_bookmarked, updated_at: new Date().toISOString() });
      return ++item.revision;
    case 'classroom_review_add': {
      const id = crypto.randomUUID();
      state.entries.unshift({ id, concept_id: args.p_concept, title: args.p_title, note: args.p_note,
        due: Boolean(args.p_concept), bookmarked: false, revision: 0, updated_at: new Date().toISOString() });
      return id;
    }
    default: throw Error('UNSUPPORTED_SAMPLE_ACTION');
  }
}
const ui = mountReviewNotebook(document.querySelector('[data-review-root]'), {
  rpc, url: route => new URL('../' + route, document.baseURI).href, userId: 'local-review-sample', lessons, isCurrent: () => true, storage,
});
void ui.load();
window.addEventListener('pagehide', event => { if (!event.persisted) ui.dispose(); });
`;
}

export function reviewPreviewPlugin(root) {
  return {
    name: 'local-review-preview', apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const url = new URL(request.url || '/', 'http://local.invalid');
        if (request.method !== 'GET' || (url.pathname !== route && url.pathname !== script)) return next();
        try {
          const isScript = url.pathname === script;
          response.setHeader('Content-Type', isScript ? 'text/javascript; charset=utf-8' : 'text/html; charset=utf-8');
          response.setHeader('Cache-Control', 'no-store');
          response.end(isScript ? reviewFixtureSource() : await server.transformIndexHtml(route, await reviewPreviewDocument(root)));
        } catch (error) { next(error); }
      });
    },
  };
}
