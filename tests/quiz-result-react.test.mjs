import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
import { evaluateBuiltModule, evaluateClassicAsset } from './helpers/built-module.mjs';
import { prompts, record, quizResultPreviewDocument, quizFormFixtureSource } from '../frontend/quiz-result-preview.mjs';

const route = 'quiz/' + record.lesson_id + '/';
const base = 'http://class.test/class-notes/';
const path = 'dist/' + route + 'index.html';
const questions = prompts.map(prompt => ({ ...prompt, points: 2, skill: 'نمونهٔ آزمون',
  ...(prompt.blanks ? { blanks: prompt.blanks.map(blank => ({ ...blank, label: 'بخش نمونه' })) } : {}) }));
const wait = async predicate => {
  for (let i = 0; i < 100; i++) {
    if (predicate()) return;
    await new Promise(resolve => setTimeout(resolve, 15));
  }
  throw Error('Quiz did not settle');
};

const draftKey = 'classroom-quiz:test-user:' + record.lesson_id + ':v2';
async function fixture(t, { attempt = '', guest = false, wrongLesson = false, failFirstSubmit = false, brokenResult = false,
  cloudDraft, localDraft, pending, practiceHandler } = {}) {
  const dom = new JSDOM(fs.readFileSync(path, 'utf8'), { url: base + route + (attempt ? '?attempt=' + attempt : ''),
    runScripts: 'outside-only', pretendToBeVisual: true });
  const { window } = dom, { document } = window;
  window.HTMLElement.prototype.scrollIntoView = () => {};
  const requests = [], submissions = [], practiceCalls = [], drafts = [];
  if (localDraft) window.localStorage.setItem(draftKey, JSON.stringify(localDraft));
  if (pending) window.localStorage.setItem(draftKey + ':pending', JSON.stringify(pending));
  const state = { memberships: [{ course_id: 'machine-learning', status: 'active' }], results: [] };
  window.fetch = async () => ({ ok: true, json: async () => ({ supabaseUrl: 'https://project.supabase.co',
    publishableKey: 'sb_publishable_test_key' }) });
  const client = {
    auth: { getSession: async () => ({ data: { session: guest ? null : { user: { id: 'test-user' } } }, error: null }), onAuthStateChange() {} },
    async rpc(name, args) {
      requests.push(name);
      if (name === 'classroom_bootstrap') return { data: { state }, error: null };
      if (name === 'classroom_attempt') {
        assert.equal(args.p_id, attempt);
        return { data: wrongLesson ? { ...record, lesson_id: 'other/lesson' } : record, error: null };
      }
      if (name === 'classroom_quiz') return { data: { version: 2, questions }, error: null };
      if (name === 'classroom_draft') {
        if ('p_answers' in args) drafts.push(JSON.parse(JSON.stringify(args)));
        return { data: 'p_answers' in args ? null : cloudDraft ?? null, error: null };
      }
      if (name === 'classroom_practice') {
        practiceCalls.push(JSON.parse(JSON.stringify(args)));
        return { data: practiceHandler ? await practiceHandler(args) : { hint: 'نمونهٔ راهنما' }, error: null };
      }
      if (name === 'classroom_submit') {
        submissions.push(JSON.parse(JSON.stringify(args)));
        if (failFirstSubmit && submissions.length === 1) return { data: null, error: Error('network lost') };
        const result = brokenResult ? { ...record.result, items: null } : record.result;
        return { data: { id: record.id, attempt_no: 2, result, created_at: record.created_at }, error: null };
      }
      return { data: null, error: null };
    },
  };
  const append = document.head.append.bind(document.head);
  document.head.append = node => {
    append(node);
    if (node.tagName === 'SCRIPT') {
      window.supabase = { createClient: () => client };
      queueMicrotask(() => node.onload());
    }
  };
  t.after(() => { window.ClassNotesSiteUI?.dispose(); window.close(); });
  await evaluateBuiltModule(dom, 'site-shell.js');
  evaluateClassicAsset(dom, 'portal.js');
  document.querySelector('[data-site-ui]').dispatchEvent(new window.Event('load'));
  await window.ClassroomReady;
  return { document, window, requests, submissions, practiceCalls, drafts, $: selector => document.querySelector(selector) };
}

function setText({ $, window }, blank, value) {
  const input = $('[data-blank="' + blank + '"]');
  Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set.call(input, value);
  input.dispatchEvent(new window.Event('input', { bubbles: true }));
}

async function answerAndConfirm(context) {
  const { $, window } = context;
  await wait(() => $('[data-start]'));
  $('[data-start]').click();
  await wait(() => !$('[data-quiz-experience]').hidden);
  $('[data-question="choice"][value="a"]').click();
  for (const [blank, value] of [['op','<'], ['limit','9']]) {
    setText(context, blank, value);
  }
  await wait(() => $('[data-answer-count]').textContent.startsWith('2 از 2'));
  $('[data-quiz-form]').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
  await wait(() => !$('[data-review]').hidden);
  $('[data-confirm-submit]').click();
}

test('An authorized saved attempt mounts the React receipt with both question types and no writes', async t => {
  const { $, requests } = await fixture(t, { attempt: record.id });
  await wait(() => $('[data-react-quiz-result]'));
  assert.equal($('.quiz-result h2').textContent, '3 / 4');
  assert.equal($('.quiz-history strong').textContent, '2 / 4');
  assert.equal($('.quiz-result [data-outcome="correct"] h3').textContent, record.result.items[0].skill);
  assert.equal($('.quiz-result .quiz-code mark').textContent, '[A]');
  assert.equal($('.blank-results tbody tr:last-child td:first-of-type').textContent, '9');
  assert.equal($('.blank-results tbody tr:last-child td:last-of-type').textContent, '3');
  assert.equal($('.quiz-result .button-outline').href, base + 'review/?lesson=' + encodeURIComponent(record.lesson_id));
  assert.equal(requests.filter(name => name === 'classroom_attempt').length, 1);
  assert.ok(!requests.some(name => ['classroom_submit', 'classroom_quiz', 'classroom_draft'].includes(name)));
});

test('A guest cannot fetch the attempt and a mismatched lesson does not render it', async t => {
  for (const options of [{ guest: true }, { wrongLesson: true }]) {
    const { $, requests } = await fixture(t, { attempt: record.id, ...options });
    assert.equal($('[data-react-quiz-result]'), null);
    assert.equal(requests.includes('classroom_attempt'), !options.guest);
    assert.equal(Boolean($('[data-login-link]')), Boolean(options.guest));
  }
});

test('A failed submit retries the same ID and the committed result receives keyboard focus', async t => {
  const context = await fixture(t, { failFirstSubmit: true });
  const { $, document, submissions } = context;
  await answerAndConfirm(context);
  await wait(() => $('[data-submit]:not(:disabled)')?.textContent.includes('بررسی وضعیت') && $('[data-submit-status]').dataset.error === 'true');
  $('[data-quiz-form]').dispatchEvent(new context.window.Event('submit', { bubbles: true, cancelable: true }));
  await wait(() => $('[data-react-quiz-result]') === document.activeElement);
  assert.equal(submissions.length, 2);
  assert.deepEqual(submissions[0], submissions[1]);
  assert.deepEqual(submissions[1].p_answers, record.answers);
  assert.equal($('[data-quiz-experience]').hidden, true);
  assert.equal($('.quiz-result h2').textContent, '3 / 4');
});

test('A display failure after commit offers the saved receipt without another submission', async t => {
  const context = await fixture(t, { brokenResult: true });
  await answerAndConfirm(context);
  await wait(() => context.$('[data-result] .quiet-link'));
  assert.equal(context.$('[data-result] .quiet-link').href, base + route + '?attempt=' + record.id);
  assert.match(context.$('[data-result] .panel-card [role=status]').textContent, /نتیجه ثبت شد/);
  context.$('[data-result] button').click();
  await wait(() => context.$('[data-result] button:not(:disabled)'));
  assert.equal(context.submissions.length, 1);
});

test('The sample receipt is local and does not boot the authentication portal', async () => {
  const html = await quizResultPreviewDocument(process.cwd());
  assert.doesNotMatch(html, /script[^>]*data-portal|vendor\/supabase/);
  assert.match(html, /quiz-result-fixture\.mjs/);
  assert.equal(fs.existsSync('dist/__preview__/quiz-result'), false);
});

test('The React quiz restores a cloud draft, prefers a browser draft, and resumes a pending submission verbatim', async t => {
  const cloud = await fixture(t, { cloudDraft: record.answers });
  await wait(() => cloud.$('[data-resume-note]'));
  assert.equal(cloud.$('[data-blank="limit"]').value, '9');
  assert.equal(cloud.$('[data-question="choice"][value="a"]').checked, true);
  const local = await fixture(t, { localDraft: { fill: { limit: '7' } }, cloudDraft: record.answers });
  await wait(() => local.$('[data-resume-note]'));
  assert.equal(local.$('[data-blank="limit"]').value, '7');
  assert.ok(!local.requests.includes('classroom_draft'));
  const pending = { id: 'frozen-submission', version: 2, answers: record.answers };
  const resumed = await fixture(t, { pending });
  await wait(() => resumed.$('[data-submit]')?.textContent.includes('بررسی وضعیت'));
  assert.ok(resumed.$('[data-blank="limit"]').disabled);
  resumed.$('[data-quiz-form]').dispatchEvent(new resumed.window.Event('submit', { bubbles: true, cancelable: true }));
  await wait(() => resumed.$('[data-react-quiz-result]'));
  assert.equal(resumed.submissions[0].p_submission, pending.id);
  assert.deepEqual(resumed.submissions[0].p_answers, pending.answers);
  assert.equal(resumed.window.localStorage.getItem(draftKey + ':pending'), 'null');
});

test('Practice preserves answers and cannot submit; stale checks are ignored after a mode change', async t => {
  let resolveCheck;
  const pendingCheck = new Promise(resolve => { resolveCheck = resolve; });
  const context = await fixture(t, { practiceHandler: args => args.p_hint ? { hint: 'نمونهٔ راهنما' } : pendingCheck });
  const { $, window, submissions, practiceCalls } = context;
  await wait(() => $('[data-start]'));
  $('[data-mode="practice"]').click();
  $('[data-start]').click();
  await wait(() => !$('[data-practice-tools]').hidden && !$('[data-quiz-experience]').hidden);
  $('[data-hint="fill"]').click();
  await wait(() => $('[data-feedback="fill"]').textContent.includes('نمونهٔ راهنما'));
  setText(context, 'op', '<'); setText(context, 'limit', '۹');
  await wait(() => $('[data-map="fill"]').classList.contains('is-answered'));
  $('[data-check="fill"]').click();
  await wait(() => practiceCalls.length === 2);
  assert.deepEqual(practiceCalls[1].p_answer, { op: '<', limit: '9' });
  $('[data-quiz-form]').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
  assert.equal(submissions.length, 0);
  $('[data-mode="assessment"]').click();
  resolveCheck({ items: [record.result.items[1]] });
  await wait(() => $('[data-practice-tools]').hidden && !$('[data-check="fill"]').disabled);
  assert.ok($('[data-feedback="fill"]').hidden);
  assert.equal($('[data-blank="limit"]').value, '۹');
  assert.match($('link[data-quiz-form-style]').href, /\/class-notes\/assets\/quiz-form\.css\?v=[a-f0-9]+/);
});

test('A bad blank format blocks final review, then a corrected draft is saved under the existing version key', async t => {
  const context = await fixture(t);
  const { $, window, document, drafts, submissions } = context;
  await wait(() => $('[data-start]'));
  $('[data-start]').click();
  await wait(() => !$('[data-quiz-experience]').hidden);
  setText(context, 'op', '<'); setText(context, 'limit', '3.2');
  await wait(() => $('[data-blank="limit"]').getAttribute('aria-invalid') === 'true');
  $('[data-quiz-form]').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
  await wait(() => document.activeElement === $('[data-question-card="fill"]'));
  assert.ok($('[data-review]').hidden);
  assert.equal(submissions.length, 0);
  setText(context, 'limit', '۳');
  await wait(() => drafts.length > 0);
  assert.deepEqual(drafts[0], { p_lesson: record.lesson_id, p_version: 2, p_kind: 'quiz', p_answers: { fill: { op: '<', limit: '۳' } } });
  assert.deepEqual(JSON.parse(window.localStorage.getItem(draftKey)), drafts[0].p_answers);
  $('[data-quiz-form]').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
  await wait(() => !$('[data-review]').hidden);
  assert.ok($('[data-review-question="choice"]'));
});

test('The local quiz preview runs the real React form without any portal or RPC', async t => {
  const html = await quizResultPreviewDocument(process.cwd(), true);
  assert.doesNotMatch(html, /script[^>]*data-portal|vendor\/supabase/);
  const dom = new JSDOM(html, { url: 'http://class.test/__preview__/quiz/', runScripts: 'outside-only', pretendToBeVisual: true });
  const { window } = dom;
  const temp = 'quiz-fixture-test-' + process.pid + '.mjs';
  fs.writeFileSync('dist/assets/' + temp, quizFormFixtureSource());
  t.after(() => {
    window.dispatchEvent(new window.Event('pagehide'));
    window.ClassNotesSiteUI?.dispose(); window.close(); fs.unlinkSync('dist/assets/' + temp);
  });
  await evaluateBuiltModule(dom, temp);
  await wait(() => window.document.querySelector('[data-start]'));
  assert.ok(window.document.querySelector('[data-react-quiz-form]'));
  assert.ok(!window.Classroom);
});
