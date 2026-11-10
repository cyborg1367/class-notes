import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
import { evaluateBuiltModule, evaluateClassicAsset } from './helpers/built-module.mjs';

async function boot(t, { getSession, rpc, loadSDK = true }) {
  const dom = new JSDOM(fs.readFileSync('dist/dashboard/index.html', 'utf8'), {
    url: 'http://class.test/dashboard/', runScripts: 'outside-only', pretendToBeVisual: true,
  });
  const { window } = dom, { document } = window;
  t.after(() => { window.ClassNotesSiteUI?.dispose(); window.close(); });
  const setTimeout = window.setTimeout.bind(window);
  window.setTimeout = (callback, ms, ...args) => setTimeout(callback, [12000, 15000].includes(ms) ? 100 : ms, ...args);
  const calls = [];
  const client = { auth: { onAuthStateChange() { calls.push('subscribe'); }, getSession }, rpc };
  window.fetch = async url => {
    assert.equal(new URL(String(url)).pathname, '/assets/auth-config.json');
    return { ok: true, json: async () => ({ supabaseUrl: 'https://project.supabase.co', publishableKey: 'sb_publishable_test_public_key' }) };
  };
  const append = document.head.append.bind(document.head);
  document.head.append = element => {
    append(element);
    if (element.tagName === 'SCRIPT' && loadSDK) {
      window.supabase = { createClient: () => client };
      queueMicrotask(() => element.onload());
    }
  };
  await evaluateBuiltModule(dom, 'site-shell.js');
  evaluateClassicAsset(dom, 'portal.js');
  document.querySelector('script[data-site-ui]').dispatchEvent(new window.Event('load'));
  return { window, document, calls, ready: window.ClassroomReady };
}

test('A dashboard session that never resolves offers retry without treating the visitor as a guest or reading progress', async t => {
  let complete;
  const pending = new Promise(resolve => { complete = resolve; });
  const { document, window, calls, ready } = await boot(t, {
    getSession: () => pending, rpc: () => assert.fail('Never read learner data before resolving the session'),
  });
  await ready;
  assert.match(document.querySelector('[data-dashboard]').textContent, /بررسی نشست ورود طول کشید/);
  assert.ok(document.querySelector('[data-dashboard] button'));
  assert.ok(!document.querySelector('[data-dashboard] [data-login-link], .dash-xp'));
  assert.deepEqual(calls, []);
  complete({ data: { session: { user: { id: 'late' } } }, error: null });
  await new Promise(resolve => setTimeout(resolve, 20));
  assert.equal(window.Classroom.user, null);
});

test('When the SDK download stalls, the dashboard shows a distinct recovery message', async t => {
  const { ready, document } = await boot(t, {
    loadSDK: false, getSession: () => assert.fail('The SDK is unavailable'), rpc: () => assert.fail('The SDK is unavailable'),
  });
  await ready;
  assert.match(document.querySelector('[data-dashboard]').textContent, /سرویس ورود آماده نشد/);
  assert.ok(document.querySelector('[data-dashboard] button'));
});

test('With a confirmed session, a stalled classroom read is abortable and does not masquerade as checking sign-in', async t => {
  let progressText, signal;
  const { ready, document, window } = await boot(t, {
    getSession: async () => ({ data: { session: { user: { id: 'student' } } }, error: null }),
    rpc(name) {
      if (name !== 'classroom_bootstrap') return Promise.resolve({ data: null, error: null });
      progressText = document.querySelector('[data-dashboard] .page-loading').textContent;
      return { abortSignal(value) { signal = value; return new Promise(() => {}); } };
    },
  });
  await ready;
  assert.match(progressText, /در حال دریافت پیشرفت کلاس/);
  assert.equal(signal?.aborted, true);
  assert.equal(window.Classroom.user.id, 'student');
  assert.equal(window.Classroom.serviceError?.message, 'CLASSROOM_STATE_TIMEOUT');
  assert.ok(!document.querySelector('.dash-xp'));
});
