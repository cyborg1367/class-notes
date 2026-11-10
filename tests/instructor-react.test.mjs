import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
import { evaluateBuiltModule, evaluateClassicAsset } from './helpers/built-module.mjs';
import { instructorFixture as demo, makeInstructorFixture, instructorPreviewDocument, instructorFixtureSource } from '../frontend/instructor-preview.mjs';

const page = 'dist/instructor/index.html';
const base = 'http://class.test/class-notes/';
const wait = async (predicate, description) => {
  for (let i = 0; i < 100; i++) {
    const value = predicate(); if (value) return value;
    await new Promise(resolve => setTimeout(resolve, 15));
  }
  assert.fail(description || 'Instructor page did not settle');
};
const deferred = () => {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { resolve, promise };
};

async function fixture(t, { role = 'teacher', intercept = (name, args, rpc) => rpc(name,args) } = {}) {
  const dom = new JSDOM(fs.readFileSync(page, 'utf8'), { url: base + 'instructor/', runScripts: 'outside-only', pretendToBeVisual: true });
  const { window } = dom, { document } = window, requests = [];
  window.HTMLElement.prototype.scrollIntoView = () => {};
  const $ = (selector, container = document) => container.querySelector(selector);
  const button = (label, container = document) => [...container.querySelectorAll('button')].find(element => element.textContent.trim() === label);
  const demoOptions = makeInstructorFixture(demo);
  const state = { memberships: demo.courses.map(course => ({ ...course, role, status: 'active' })), results: [] };
  window.fetch = async () => ({ ok: true, json: async () => ({ supabaseUrl: 'https://project.supabase.co', publishableKey: 'sb_publishable_test_key' }) });
  const client = {
    auth: { getSession: async () => ({ data: { session: { user: { id: 'test-user' } } }, error: null }), onAuthStateChange() {} },
    async rpc(name,args) {
      const parsed = JSON.parse(JSON.stringify(args || {}));
      requests.push({ name, args: parsed });
      if (name === 'classroom_bootstrap') return { data: { state }, error: null };
      if (/^classroom_(instructor_|attempt$|membership$)/.test(name)) {
        try { return { data: await intercept(name,parsed,demoOptions.rpc), error: null }; }
        catch (error) { return { data: null, error }; }
      }
      return { data: null, error: null };
    },
  };
  const append = document.head.append.bind(document.head);
  document.head.append = node => {
    append(node);
    if (node.tagName === 'SCRIPT') { window.supabase = { createClient: () => client };queueMicrotask(() => node.onload()); }
  };
  t.after(() => { window.dispatchEvent(new window.Event('pagehide'));window.ClassNotesSiteUI?.dispose();window.close(); });
  await evaluateBuiltModule(dom, 'site-shell.js');
  evaluateClassicAsset(dom, 'portal.js');
  $('[data-site-ui]').dispatchEvent(new window.Event('load'));
  await window.ClassroomReady;
  return { $, button, window, requests, document };
}

test('The existing instructor route gates private reports before mounting React', async t => {
  const { $, requests } = await fixture(t, { role: 'student' });
  assert.match($('[data-teacher]').textContent, /دسترسی مدرس لازم است/);
  assert.equal($('[data-react-instructor]'), null);
  assert.ok(!requests.some(request => request.name.startsWith('classroom_instructor_')));
});

test('The redesigned instructor overview leads to reports, saved answers and question analysis', async t => {
  const { $, button, requests } = await fixture(t);
  const metrics = await wait(() => $('.teacher-metrics'));
  assert.equal(metrics.children.length, 3);
  assert.equal(metrics.querySelector('[data-tone=attention] strong').textContent, '۱');
  $('.teacher-metric').click();
  await wait(() => $('.teacher-report-table tbody tr'));
  assert.equal($('[data-view=students]').getAttribute('aria-current'), 'page');
  assert.ok($('.teacher-report-table th[scope=col]'));
  assert.ok($('.teacher-report-table .teacher-mobile-label'));
  $('button[aria-label="پروندهٔ سارا رضایی"]').click();
  await wait(() => $('[data-detail][open] .attempt-link'));
  assert.match($('[data-detail]').textContent, /۳ از ۳/);
  $('.attempt-link').click();
  await wait(() => $('.instructor-answer-table'));
  assert.equal($('.instructor-answer-table tbody tr:last-child td:first-of-type').textContent, '9');
  assert.equal($('.instructor-answer-table tbody tr:last-child td:last-of-type').textContent, '3');
  assert.ok(requests.some(request => request.name === 'classroom_attempt' && request.args.p_id === demo.attempt.id));
  $('.sheet-back').click();
  await wait(() => $('[data-detail][open] .attempt-link'));
  $('[aria-label="بستن جزئیات"]').click();
  await wait(() => !$('[data-detail]').open);
  $('[data-view=attempts]').click();
  const analysis = await wait(() => button('تحلیل سؤال‌ها'));
  analysis.click();
  (await wait(() => button('دیدن سؤال'))).click();
  await wait(() => $('[data-detail][open] .sheet-stats'));
  assert.match($('[data-detail]').textContent, /گزینه‌های انتخاب‌شده/);
  assert.ok(!requests.some(request => request.name === 'classroom_membership'));
});

test('Membership waits for confirmation, blocks duplicate writes, then refreshes the pending list', async t => {
  const mutation = deferred();
  const { $, button, requests } = await fixture(t, {
    async intercept(name,args,rpc) {
      if (name === 'classroom_membership') await mutation.promise;
      return rpc(name,args);
    },
  });
  (await wait(() => $('[data-view=requests]'))).click();
  const card = await wait(() => $('.request-card'));
  button('تأیید دسترسی',card).click();
  const confirm = await wait(() => $('[data-confirmation][open]'));
  assert.match(confirm.textContent, /negar@example\.test/);
  assert.ok(!requests.some(request => request.name === 'classroom_membership'));
  button('انصراف',confirm).click();
  await wait(() => !confirm.open);
  button('تأیید دسترسی',$('.request-card')).click();
  await wait(() => confirm.open);
  const accept = button('تأیید دسترسی',confirm);
  accept.click();accept.click();
  await wait(() => accept.disabled);
  assert.deepEqual(requests.filter(request => request.name === 'classroom_membership'), [{
    name: 'classroom_membership', args: { p_course: demo.course, p_user: 'sample-3', p_status: 'active' },
  }]);
  mutation.resolve();
  await wait(() => !confirm.open && $('.content').textContent.includes('درخواستی در انتظار نیست'));
  assert.match($('[data-instructor-toast]').textContent, /فعال شد/);
});

test('A report arriving after a course switch cannot display the previous course records', async t => {
  const late = deferred();
  const { $, window, requests } = await fixture(t, { intercept(name,args,rpc) {
    return name === 'classroom_instructor_students' && args.p_course === demo.course ? late.promise.then(() => rpc(name,args)) : rpc(name,args);
  } });
  (await wait(() => $('[data-view=students]'))).click();
  await wait(() => requests.some(request => request.name === 'classroom_instructor_students'));
  const selector = $('[data-course]');
  selector.value = demo.courses[1].course_id;
  selector.dispatchEvent(new window.Event('change', { bubbles: true }));
  await wait(() => $('.content').textContent.includes('اطلاعاتی برای نمایش نیست'));
  late.resolve();
  await new Promise(resolve => setTimeout(resolve, 30));
  assert.equal($('.teacher-report-table'), null);
  assert.ok(!$('.content').textContent.includes('سارا رضایی'));
});

test('The local demo mounts the real interface without booting the private portal', async t => {
  const html = await instructorPreviewDocument(process.cwd());
  assert.ok(html.includes('<base href="/instructor/">'));
  assert.ok(html.includes('همهٔ داده‌ها ساختگی‌اند'));
  assert.ok(!html.includes('data-portal'));
  assert.ok(!fs.existsSync('dist/__preview__/instructor/'));
  const dom = new JSDOM(html, { url: 'http://class.test/__preview__/instructor/', runScripts: 'outside-only', pretendToBeVisual: true });
  const { window } = dom;
  const temp = 'instructor-fixture-test-' + process.pid + '.mjs';
  fs.writeFileSync('dist/assets/' + temp, instructorFixtureSource());
  t.after(() => {
    window.dispatchEvent(new window.Event('pagehide'));
    window.ClassNotesSiteUI?.dispose(); window.close(); fs.unlinkSync('dist/assets/' + temp);
  });
  await evaluateBuiltModule(dom, temp);
  const metrics = await wait(() => window.document.querySelector('.teacher-metrics'));
  assert.equal(metrics.children.length, 3);
  assert.ok(!window.Classroom);
  window.document.querySelector('[data-view=labs]').click();
  await wait(() => window.document.querySelector('.teacher-report-table tbody tr'));
  assert.match(window.document.querySelector('.lab-summary small').textContent, /۳ مأموریت/);
});
