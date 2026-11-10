import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM, VirtualConsole } from 'jsdom';
import { evaluateBuiltModule, evaluateClassicAsset } from './helpers/built-module.mjs';

const catalog = JSON.parse(fs.readFileSync('web/assets/catalog.json', 'utf8'));
const [course] = catalog, [first, second] = course.lessons;
const user = { id: 'student-a', user_metadata: { full_name: 'دانشجو الف' } };
const active = [{ course_id: course.id, status: 'active' }];
const snapshot = (lesson, done = 0, xp = 0) => ({
  mission: lesson.lab.mission, tasks: lesson.lab_steps.map(({ id }, position) => ({ id, position })),
  completed: lesson.lab_steps.slice(0, done).map(task => task.id), xp, maximum: 300, badge: done === 6, attempts: done,
});
const labs = Object.fromEntries(course.lessons.map(lesson => [lesson.lab.mission, {
  status: 'fulfilled', value: snapshot(lesson, lesson === first ? 3 : 0, lesson === first ? 90 : 0),
}]));
const receipt = { lesson_id: first.id, version: first.quiz_version, attempts: 2,
  last_id: 'record+A', last_at: '2026-11-01T12:00:00Z', first_score: 80, best_score: 91, last_score: 91, maximum: 100 };
const pause = () => new Promise(resolve => setTimeout(resolve, 15));
async function settle(test) {
  const end = Date.now() + 2500;
  while (!test()) {
    if (Date.now() > end) throw Error('Dashboard view did not settle');
    await pause();
  }
}
function deferred() {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
}

async function boot(t, { initial = user, state, hash = '', review, rpc } = {}) {
  const requests = [], errors = [];
  const virtualConsole = new VirtualConsole();
  // jsdom cannot follow portal's top-level redirect. The test checks its DOM cleanup.
  virtualConsole.on('jsdomError', error => {
    if (!error.message.startsWith('Not implemented: navigation')) errors.push(error);
  });
  const dom = new JSDOM(fs.readFileSync('dist/dashboard/index.html', 'utf8'), { virtualConsole,
    url: 'http://class.test/class-notes/dashboard/' + hash, runScripts: 'outside-only', pretendToBeVisual: true,
  });
  const { window } = dom, { document } = window;
  dom.getInternalVMContext().console = { ...console, warn: (...args) => errors.push(args), error: (...args) => errors.push(args) };
  t.after(() => { window.ClassNotesSiteUI?.dispose(); window.close(); });
  let callback;
  let signins = 0;
  const ok = data => ({ data, error: null });
  const client = {
    auth: {
      onAuthStateChange(fn) { callback = fn; },
      getSession: async () => ok({ session: initial ? { user: initial } : null }),
      signInWithOAuth: async () => { signins++; return { error: Error('Fake OAuth') }; },
    },
    async rpc(name, args) {
      requests.push({ name, args });
      const override = rpc?.(name, args);
      if (override !== undefined) return await override;
      if (name === 'classroom_bootstrap') return ok({ state: state?.() ?? { memberships: active, results: [receipt] }, labs });
      if (name === 'classroom_review_summary') return ok(await (review?.promise ?? { due_count: 3 }));
      if (name.startsWith('classroom_notice_')) return ok({ items: [], unread_count: 0, server_now: new Date().toISOString() });
      if (name === 'classroom_presence_visibility') return ok({ visible: false });
      throw Error('Unexpected RPC: ' + name);
    },
    removeChannel() {},
  };
  window.fetch = async input => {
    assert.equal(new URL(String(input)).pathname, '/class-notes/assets/auth-config.json');
    return { ok: true, json: async () => ({ supabaseUrl: 'https://project.supabase.co', publishableKey: 'sb_publishable_test_public_key' }) };
  };
  const append = document.head.append.bind(document.head);
  document.head.append = node => {
    append(node);
    if (node.tagName === 'SCRIPT') { window.supabase = { createClient: () => client }; queueMicrotask(() => node.onload()); }
  };
  const auth = next => callback(next ? 'SIGNED_IN' : 'SIGNED_OUT', next ? { user: next } : null);
  const ready = (async () => {
    await evaluateBuiltModule(dom, 'site-shell.js');
    evaluateClassicAsset(dom, 'portal.js');
    document.querySelector('script[data-site-ui]').dispatchEvent(new window.Event('load'));
    await window.ClassroomReady;
  })();
  return { window, document, requests, errors, ready, auth, signins: () => signins };
}

test('The compiled dashboard preserves trusted progress, real quiz links and bookmark state during a late review summary', async t => {
  const review = deferred();
  const { window, document, requests, errors, ready } = await boot(t, { hash: '#results', review });
  await ready;
  await settle(() => document.activeElement?.id === 'results');
  const result = document.getElementById('results');
  assert.ok(result.querySelector('details').open);
  assert.equal(result.querySelector('a.button-outline').href,
    'http://class.test/class-notes/quiz/' + first.id + '/?attempt=record%2BA');
  assert.match(document.querySelector('.dash-xp strong').textContent, /90 \/ 1200 XP/);
  assert.match(document.querySelector('.dash-next-step').textContent, new RegExp(first.lab_steps[3].title));
  assert.equal(document.querySelector('.dash-primary').href, 'http://class.test/class-notes/' + first.lab.path);
  assert.equal(document.querySelectorAll('.dash-milestones [data-done="true"]').length, 3);
  assert.ok(!requests.some(({ name }) => name === 'classroom_lab_state'), 'use the bootstrap snapshots');
  const button = document.querySelector('[data-review-lesson]');
  const filter = document.querySelector('[data-review-filter]');
  button.click();
  await settle(() => button.getAttribute('aria-pressed') === 'true');
  assert.deepEqual(JSON.parse(window.localStorage.getItem('classroom-review:' + user.id)), [first.id]);
  filter.click();
  await settle(() => document.querySelectorAll('[data-dashboard-lesson]:not([hidden])').length === 1);
  review.resolve({ due_count: 7 });
  await settle(() => document.querySelector('[data-review-count]').textContent.includes('۷'));
  assert.equal(document.querySelector('[data-review-lesson]'), button);
  assert.equal(filter.getAttribute('aria-pressed'), 'true');
  assert.equal(document.getElementById('results'), result);
  button.click();
  await settle(() => !document.querySelector('.dash-empty-review').hidden);
  assert.equal(document.activeElement, filter);
  assert.deepEqual(errors, []);
});

test('A guest sees the existing login action and no private data; a new session mounts the same route', async t => {
  const { window, document, requests, ready, auth, signins } = await boot(t, { initial: null });
  assert.ok(document.querySelector('.page-loading'));
  await ready;
  await settle(() => document.querySelector('[data-dashboard] [data-login-link]'));
  assert.ok(!document.querySelector('[data-dashboard-lesson]'));
  assert.deepEqual(requests, []);
  const login = document.querySelector('[data-dashboard] [data-login-link]');
  assert.equal(new URL(login.href).searchParams.get('next'), window.location.href);
  login.click();
  await settle(() => signins() === 1);
  auth(user);
  await settle(() => document.querySelector('.dash-xp'));
  assert.equal(document.querySelector('[data-dashboard] [data-login-link]'), null);
});

test('A membership request uses one existing RPC and updates from the server state', async t => {
  const grant = deferred();
  let status = '';
  const fixture = await boot(t, {
    state: () => ({ memberships: status ? [{ course_id: course.id, status }] : [], results: [receipt] }),
    rpc: (name, args) => {
      if (name !== 'classroom_request_access') return;
      assert.equal(args.p_course, course.id);
      return grant.promise.then(() => { status = 'pending'; return { data: true, error: null }; });
    },
  });
  const { document, requests, ready } = fixture;
  await ready;
  const request = () => document.querySelector('.membership-section .button-forest');
  await settle(request);
  assert.ok(!document.querySelector('[data-dashboard-lesson],#results,.dash-xp'));
  const button = request();
  button.click(); button.click();
  await settle(() => button.disabled);
  assert.equal(requests.filter(({ name }) => name === 'classroom_request_access').length, 1);
  grant.resolve();
  await settle(() => document.querySelector('.membership-section')?.textContent.includes('درخواستت ثبت شده'));
  assert.equal(request(), null);
  assert.ok(!document.querySelector('[data-dashboard-lesson],#results,.dash-xp'));
});

test('Partial fallback failures stay unknown and retry only reads progress; stale replies after sign-out cannot render', async t => {
  let retry = false;
  const late = deferred();
  const { document, requests, errors, ready, auth } = await boot(t, {
    rpc(name, args) {
      if (name === 'classroom_bootstrap') return { data: null, error: { code: 'PGRST202', message: 'missing classroom_bootstrap' } };
      if (name === 'classroom_state') return { data: { memberships: active, results: [] }, error: null };
      if (name !== 'classroom_lab_state') return;
      if (retry) return late.promise;
      if (args.p_mission === second.lab.mission) return { data: null, error: Error('offline') };
      return { data: labs[args.p_mission].value, error: null };
    },
  });
  await ready;
  await settle(() => document.querySelector('[data-dashboard-retry]'));
  assert.equal(document.querySelector('.dash-xp strong').textContent, '— / — XP');
  assert.equal(document.querySelector('.dash-xp progress'), null);
  assert.match(document.querySelector('[data-dashboard-lesson="' + second.id + '"]').textContent, /دریافت نشد/);
  retry = true;
  document.querySelector('[data-dashboard-retry]').click();
  await settle(() => requests.filter(({ name }) => name === 'classroom_lab_state').length === 8);
  auth(null);
  assert.equal(document.querySelector('.dash-xp,[data-dashboard-lesson]'), null);
  late.resolve({ data: labs[first.lab.mission].value, error: null });
  await pause(); await pause();
  assert.equal(document.querySelector('.dash-xp,[data-dashboard-lesson]'), null);
  assert.ok(!requests.some(({ name }) => /lab_save|lab_finish|submit|draft/.test(name)));
  assert.deepEqual(errors, []);
});

test('Retry refreshes a partial bootstrap instead of replaying its old failed snapshot', async t => {
  let bootstrapCount = 0;
  const { document, ready, requests } = await boot(t, { rpc(name) {
    if (name !== 'classroom_bootstrap') return;
    bootstrapCount++;
    const snapshots = { ...labs };
    if (bootstrapCount === 1) snapshots[second.lab.mission] = { status: 'rejected' };
    return { data: { state: { memberships: active, results: [] }, labs: snapshots }, error: null };
  } });
  await ready;
  await settle(() => document.querySelector('.dash-xp [data-dashboard-retry]'));
  assert.ok(document.querySelector('.dash-next-step'), 'keep the known next step while totals are incomplete');
  document.querySelector('.dash-xp [data-dashboard-retry]').click();
  await settle(() => document.querySelector('.dash-xp progress'));
  assert.equal(bootstrapCount, 2);
  assert.match(document.querySelector('.dash-xp strong').textContent, /90 \/ 1200 XP/);
  assert.ok(!requests.some(({ name }) => name === 'classroom_lab_state'));
});
