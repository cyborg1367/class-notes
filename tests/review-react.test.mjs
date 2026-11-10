import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
import { evaluateBuiltModule, evaluateClassicAsset } from './helpers/built-module.mjs';
import { reviewFixtureSource, reviewPreviewDocument } from '../frontend/review-preview.mjs';

const lesson = { id: 'machine-learning/vector-distance', title: 'یادداشت آزمون' };
const concept = { id: 'sample-topic', lesson_id: lesson.id, title: 'ویژگی‌ها', description: 'هر ستون یک ویژگی است.',
  learning: { core: 'نمونهٔ X را بررسی کن.', example: 'X = [[2, 4], [3, 5]]' } };
const original = { id: 'topic-one', concept_id: concept.id, title: concept.title, note: 'نسخهٔ حساب', revision: 0, due: true, bookmarked: false };
const run = { id: 'run-one', entry_id: original.id, question: { stem: 'در X چند ویژگی داریم؟', options: ['یک', 'دو'] }, hint_used: false };
const tick = () => new Promise(resolve => setTimeout(resolve, 15));
async function until(test) {
  const deadline = Date.now() + 2500;
  for (let result; !(result = test());) {
    if (Date.now() > deadline) throw Error('Review UI did not settle');
    await tick();
  }
}
function pending() {
  let resolve;
  const task = new Promise(done => { resolve = done; });
  return { task, resolve };
}
function browser(t, query = '') {
  const dom = new JSDOM(fs.readFileSync('dist/review/index.html', 'utf8'), {
    url: 'http://class.test/class-notes/review/' + query, runScripts: 'outside-only', pretendToBeVisual: true,
  });
  const { window } = dom, { document } = window;
  return { dom, window, document };
}
const key = suffix => 'classroom-review-notebook:student:' + suffix;

async function fixture(t, { query, storage, beforeLoad, rpc, owner = () => true } = {}) {
  const { dom, window, document } = browser(t, query);
  const requests = [];
  const shell = await evaluateBuiltModule(dom, 'site-shell.js');
  await shell.ready;
  const module = await shell.loadReviewNotebook();
  const entries = [{ ...original }, { ...original, id: 'topic-two', title: 'موضوع بعدی', note: '' }];
  let ui = module.mountReviewNotebook(document.querySelector('[data-review-root]'), {
    url: path => 'http://class.test/class-notes/' + path, userId: 'student', lessons: [lesson],
    isCurrent: owner, storage: storage || window.localStorage, async rpc(name, args) {
      requests.push([name, args]);
      const override = rpc?.(name, args, entries);
      if (override !== undefined) return await override;
      if (name === 'classroom_review_state') return { entries: structuredClone(entries), concepts: [concept] };
      if (name === 'classroom_review_context') return { entry_id: args.p_entry, concept, evidence: [] };
      if (name === 'classroom_review_open') return { ...run, entry_id: args.p_entry };
      if (name === 'classroom_review_hint') return 'تعداد ستون‌ها را بشمار.';
      if (name === 'classroom_review_finish') return { correct: true, answer: '1', preparation_used: true, hint_used: false, explanation: 'X دو ستون دارد.' };
      if (name === 'classroom_review_reflect') return { text: args.p_text, revision: 1 };
      if (name === 'classroom_review_save') {
        const item = entries.find(entry => entry.id === args.p_entry);
        if (item.revision !== args.p_revision) throw Error('REVIEW_NOTE_CONFLICT');
        Object.assign(item, { note: args.p_note, title: args.p_title, bookmarked: args.p_bookmarked });
        return ++item.revision;
      }
      throw Error('Unexpected review RPC: ' + name);
    },
  });
  const dispose = () => { ui?.dispose(); ui = null; };
  t.after(() => { dispose(); window.ClassNotesSiteUI?.dispose(); window.close(); });
  beforeLoad?.(window);
  const ready = ui.load();
  const $ = selector => document.querySelector(selector);
  function write(selector, value) {
    const element = $(selector);
    const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element), 'value').set;
    setter.call(element, value);
    element.dispatchEvent(new window.Event('input', { bubbles: true }));
  }
  const click = selector => {
    const button = $(selector);
    assert.ok(button && !button.disabled, selector);
    button.click();
  };
  const submit = selector => $(selector).dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
  return { $, click, submit, write, window, document, requests, ready, entries, dispose, ui };
}

test('The notebook restores the local revision, compares the account note and saves only when confirmed', async t => {
  const sample = await fixture(t, { beforeLoad: window => window.localStorage.setItem(key('note:' + original.id), JSON.stringify({
    request: 'request-one', title: original.title, note: 'نوشتهٔ بازیابی‌شده <b>ایمن</b>', concept: concept.id, revision: -1,
  })) });
  const { $, click, submit, document, window, requests, ready } = sample;
  await ready;
  await until(() => $('[data-edit-note]'));
  const trigger = $('[data-edit-note]');
  trigger.focus();
  click('[data-edit-note]');
  await until(() => $('[data-note-body]')?.value.includes('بازیابی'));
  assert.equal($('dialog b'), null);
  submit('[data-note-form]');
  await until(() => $('[data-compare]') && !$('[data-compare]').disabled);
  assert.equal(window.localStorage.getItem(key('note:' + original.id)) !== null, true);
  click('[data-compare]');
  await until(() => $('.rv-preserve')?.textContent === original.note && !$('[data-note-form] button[type=submit]').disabled);
  assert.match($('[data-note-body]').value, /بازیابی/);
  submit('[data-note-form]');
  await until(() => !$('dialog'));
  assert.equal(window.localStorage.getItem(key('note:' + original.id)), null);
  await until(() => document.activeElement === trigger);
  const saves = requests.filter(([name]) => name === 'classroom_review_save');
  assert.deepEqual(saves.map(([, args]) => args.p_revision), [-1, 0]);
  assert.equal(saves[1][1].p_note, 'نوشتهٔ بازیابی‌شده <b>ایمن</b>');
});

test('The session retains the teaching phases, preparation, hint, server result and next topic', async t => {
  const finished = pending();
  const { $, click, write, requests, window, document, ready } = await fixture(t, {
    rpc(name) { if (name === 'classroom_review_finish') return finished.task; },
  });
  let events = 0;
  document.addEventListener('classroom-progress-changed', () => { events++; });
  await ready;
  await until(() => $('[data-start]'));
  click('[data-start]');
  await until(() => $('[data-read]') && !$('[data-read]').disabled);
  assert.match($('[aria-current=step]').textContent, /چرایی مرور/);
  click('[data-read]');
  await until(() => $('[data-question]') && !$('[data-question]').disabled);
  assert.ok($('.rv-worked-example bdi'));
  click('[data-question]');
  await until(() => $('[data-hint]') && !$('[data-hint]').disabled);
  assert.equal(requests.find(([name]) => name === 'classroom_review_open')[1].p_read_before, true);
  assert.equal($('.rv-feedback'), null);
  click('[data-hint]');
  await until(() => $('[data-hint-text]') && !$('[data-skip]').disabled);
  click('[data-skip]');
  await until(() => requests.some(([name]) => name === 'classroom_review_finish'));
  assert.equal(events, 0);
  assert.equal($('.rv-feedback'), null);
  assert.equal(JSON.parse(window.localStorage.getItem(key('pending:' + original.id))).answer, null);
  finished.resolve({ correct: false, answer: '1', explanation: 'دو ستون دارد.', hint_used: true, preparation_used: true });
  await until(() => $('[data-next]') && !$('[data-next]').disabled);
  assert.equal(events, 1);
  await until(() => document.activeElement?.id === 'rv-feedback-title');
  assert.match($('[aria-current=step]').textContent, /برداشت من/);
  write('[data-reflection]', 'ویژگی را از ستون می‌شمارم.');
  assert.equal(JSON.parse(window.localStorage.getItem(key('reflection:' + run.id))).text, 'ویژگی را از ستون می‌شمارم.');
  click('[data-next]');
  await until(() => window.location.search.includes('topic-two') && Boolean($('[data-read]')));
  assert.equal(window.localStorage.getItem(key('pending:' + original.id)), null);
  assert.equal(requests.find(([name]) => name === 'classroom_review_reflect')[1].p_text, 'ویژگی را از ستون می‌شمارم.');
});

test('An interrupted submission is replayed with its existing run and never opens a second run', async t => {
  const { $, requests, ready } = await fixture(t, {
    query: '?practice=' + original.id + '&step=question',
    beforeLoad: window => window.localStorage.setItem(key('pending:' + original.id), JSON.stringify({ run, answer: '1' })),
  });
  await ready;
  await until(() => $('.rv-feedback'));
  assert.equal(requests.some(([name]) => name === 'classroom_review_open'), false);
  assert.equal(requests.find(([name]) => name === 'classroom_review_finish')[1].p_run, run.id);
});

test('A delayed response cannot restore a disposed notebook or write into another account', async t => {
  const save = pending();
  let current = true;
  const { $, click, write, submit, window, requests, ready, dispose } = await fixture(t, {
    owner: () => current, rpc(name) { if (name === 'classroom_review_save') return save.task; },
  });
  await ready;
  await until(() => $('[data-edit-note]'));
  click('[data-edit-note]');
  await until(() => $('[data-note-body]'));
  write('[data-note-body]', 'پیش‌نویس حساب قبلی');
  submit('[data-note-form]');
  await until(() => requests.some(([name]) => name === 'classroom_review_save'));
  current = false;
  dispose();
  save.resolve(1);
  await tick();
  assert.equal($('[data-review-view]'), null);
  assert.equal(JSON.parse(window.localStorage.getItem(key('note:' + original.id))).note, 'پیش‌نویس حساب قبلی');
  assert.equal(window.localStorage.length, 1);
});

test('The real guest route never mounts the private notebook; the local sample never starts the auth portal', async t => {
  const { window, document, dom } = browser(t);
  t.after(() => { window.ClassNotesSiteUI?.dispose(); window.close(); });
  window.fetch = async () => ({ ok: true, json: async () => ({
    supabaseUrl: 'https://project.supabase.co', publishableKey: 'sb_publishable_test_public_key',
  }) });
  const append = document.head.append.bind(document.head);
  document.head.append = node => {
    append(node);
    if (node.tagName !== 'SCRIPT') return;
    window.supabase = { createClient: () => ({ auth: {
      getSession: async () => ({ data: { session: null }, error: null }), onAuthStateChange() {},
    }, rpc() { assert.fail('Guests cannot fetch private reviews'); } }) };
    queueMicrotask(() => node.onload());
  };
  await evaluateBuiltModule(dom, 'site-shell.js');
  evaluateClassicAsset(dom, 'portal.js');
  document.querySelector('script[data-site-ui]').dispatchEvent(new window.Event('load'));
  await window.ClassroomReady;
  assert.ok(document.querySelector('[data-review-root] [data-login-link]'));
  assert.equal(document.querySelector('[data-review-view]'), null);
  const preview = await reviewPreviewDocument(process.cwd());
  assert.match(preview, /rv-sample-banner/);
  assert.doesNotMatch(preview, /script[^>]*data-portal|vendor\/supabase/);
  assert.doesNotMatch(reviewFixtureSource(), /fetch\(|\.rpc\(|createClient\(|localStorage/);
  assert.equal(fs.existsSync('dist/__preview__'), false);
});

test('An authenticated member enters the React notebook through the actual portal bootstrap', async t => {
  const { window, document, dom } = browser(t, '?lesson=' + encodeURIComponent(lesson.id));
  t.after(() => {
    window.ClassNotesSiteUI?.dispose();
    window.close();
  });
  const names = [];
  const user = { id: 'student', user_metadata: { full_name: 'آزمون' } };
  window.fetch = async () => ({ ok: true, json: async () => ({
    supabaseUrl: 'https://project.supabase.co', publishableKey: 'sb_publishable_test_public_key',
  }) });
  const append = document.head.append.bind(document.head);
  document.head.append = node => {
    append(node);
    if (node.tagName !== 'SCRIPT') return;
    window.supabase = { createClient: () => ({ auth: {
      getSession: async () => ({ data: { session: { user } }, error: null }), onAuthStateChange() {},
    }, async rpc(name) {
      names.push(name);
      const data = name === 'classroom_bootstrap'
        ? { state: { memberships: [{ course_id: 'machine-learning', status: 'active' }], results: [] } }
        : name === 'classroom_review_state' ? { entries: [original], concepts: [concept] }
        : name.startsWith('classroom_notice_') ? { items: [], unread_count: 0 } : { visible: false };
      return { data, error: null };
    }, removeChannel() {} }) };
    queueMicrotask(() => node.onload());
  };
  await evaluateBuiltModule(dom, 'site-shell.js');
  evaluateClassicAsset(dom, 'portal.js');
  document.querySelector('script[data-site-ui]').dispatchEvent(new window.Event('load'));
  await window.ClassroomReady;
  await until(() => document.querySelector('.rv-entry'));
  assert.equal(document.querySelector('[data-lesson]').value, lesson.id);
  assert.deepEqual(names.filter(name => name.startsWith('classroom_review_')), ['classroom_review_state']);
  assert.ok(document.querySelector('nav[aria-label="مسیر صفحه"] a').href.endsWith('/class-notes/dashboard/'));
});

test('Preparing to sign out reports cloud failure and a saved local draft separately', async t => {
  const { $, click, write, requests, ready, ui, window } = await fixture(t, {
    rpc(name) {
      if (name === 'classroom_review_save') return Promise.reject(Error('OFFLINE'));
    },
  });
  await ready;
  await until(() => $('[data-edit-note]'));
  click('[data-edit-note]');
  await until(() => $('[data-note-body]'));
  write('[data-note-body]', 'پیش‌نویس برای بعد');
  assert.deepEqual({ ...await ui.prepareSignOut() }, { saved: false, localSaved: true });
  assert.equal(JSON.parse(window.localStorage.getItem(key('note:' + original.id))).note, 'پیش‌نویس برای بعد');
  assert.equal(requests.filter(([name]) => name === 'classroom_review_save').length, 1);
});
