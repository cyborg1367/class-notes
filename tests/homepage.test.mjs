import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
import { evaluateBuiltModule, evaluateClassicAsset } from './helpers/built-module.mjs';
import { getViewChannel } from '../web/assets/view-channel.mjs';
import { INITIAL_HOME_VIEW, projectHomeView } from '../web/assets/home-view-model.mjs';

const pause = () => new Promise(resolve => setTimeout(resolve, 25));
async function settle(predicate) {
  const end = Date.now() + 3000;
  while (!predicate()) {
    if (Date.now() > end) throw Error('Homepage state did not settle');
    await pause();
  }
}

function fixture(t, { reducedMotion, observer, url = 'http://class.test/' } = {}) {
  const dom = new JSDOM(fs.readFileSync('dist/index.html', 'utf8'), {
    url, runScripts: 'outside-only', pretendToBeVisual: true,
  });
  const { window } = dom, document = window.document, diagnostics = [];
  const context = dom.getInternalVMContext();
  context.console = { ...console, warn: (...args) => diagnostics.push(args), error: (...args) => diagnostics.push(args) };
  if (reducedMotion !== undefined) window.matchMedia = () => ({ matches: reducedMotion, addEventListener() {}, removeEventListener() {} });
  if (observer) window.IntersectionObserver = observer;
  t.after(() => { window.ClassNotesHome?.dispose(); window.ClassNotesSiteUI?.dispose(); window.close(); });
  return { dom, window, document, diagnostics };
}

test('The homepage is complete in SSR, with neutral account state, current catalog and actual assets', t => {
  const { document } = fixture(t);
  assert.equal(document.querySelectorAll('#main h1').length, 1);
  for (const id of ['top', 'classes', 'method', 'instructor']) assert.ok(document.getElementById(id), id);
  const card = document.querySelector('[data-home-course]');
  assert.equal(card.dataset.noteCount, '4'); assert.equal(card.dataset.labCount, '4'); assert.equal(card.dataset.quizCount, '4');
  assert.equal(card.dataset.latestLesson, 'machine-learning/thresholds-and-roc');
  const account = document.querySelector('[data-home-react-account]');
  assert.equal(account.textContent, 'حساب کاربری'); assert.equal(account.getAttribute('aria-disabled'), 'false');
  assert.ok(document.querySelector('[data-gradient-hero] .gradient-hero-placeholder'));
  assert.match(document.querySelector('.gradient-hero-caption').textContent, /سطح خطا/);
  assert.ok(!document.querySelector('[data-anatomy-figure]'));
  assert.ok(fs.existsSync('dist/assets/gradient-descent-wash.webp'));
  assert.ok(!document.querySelector('script[src*="space3d.js"]'));
  assert.ok(!document.querySelector('script[src*="scroll-motion.js"]'));
  const ink = document.querySelector('.home-course-ink');
  assert.ok(fs.existsSync('dist' + new URL(ink.src).pathname));
});

test('Homepage hydration reuses markup; auth changes update only the account CTA and keep the diagram and cards', async t => {
  const { dom, document, diagnostics } = fixture(t);
  const host = document.querySelector('[data-home-react-root]');
  const card = host.querySelector('[data-home-course]'), illustration = host.querySelector('[data-gradient-hero]');
  await evaluateBuiltModule(dom, 'homepage.js');
  await settle(() => host.dataset.homeMounted === 'true'); await pause();
  assert.equal(host.querySelector('[data-home-course]'), card); assert.equal(host.querySelector('[data-gradient-hero]'), illustration);
  const channel = getViewChannel(host, INITIAL_HOME_VIEW); let clicks = 0;
  const release = channel.bindActions({ 'sign-in': async () => { clicks++; } });
  const links = { account: '/account/', dashboard: '/dashboard/' };
  channel.publish({ ...projectHomeView({ ready: true }, links), errorMessage: '' });
  await settle(() => document.querySelector('[data-home-react-account]').textContent.includes('Google'));
  document.querySelector('[data-home-react-account]').click(); await settle(() => clicks === 1);
  channel.publish({ ...projectHomeView({ ready: true, userId: 'signed-in' }, links), errorMessage: '' });
  await settle(() => document.querySelector('[data-home-react-account]').textContent === 'رفتن به داشبورد');
  assert.equal(new URL(document.querySelector('[data-home-react-account]').href).pathname, '/dashboard/');
  assert.equal(host.querySelector('[data-gradient-hero]'), illustration); assert.equal(host.querySelector('[data-home-course]'), card);
  channel.reset(); await pause();
  assert.equal(document.querySelector('[data-home-react-account]').getAttribute('aria-disabled'), 'false');
  assert.equal(host.dataset.reactRecovery, undefined); assert.deepEqual(diagnostics, []); release();
});

test('Pre-hydration auth data does not cause a guest flash or hydration recovery', async t => {
  const { dom, document, diagnostics } = fixture(t);
  const host = document.querySelector('[data-home-react-root]'), original = host.querySelector('[data-home-react-account]');
  getViewChannel(host, INITIAL_HOME_VIEW).publish({ ...projectHomeView({ ready: true, userId: 'student' }, { account: '/account/', dashboard: '/dashboard/' }), errorMessage: '' });
  await evaluateBuiltModule(dom, 'homepage.js');
  await settle(() => original.textContent === 'رفتن به داشبورد');
  assert.equal(host.querySelector('[data-home-react-account]'), original);
  assert.equal(host.dataset.reactRecovery, undefined); assert.deepEqual(diagnostics, []);
});
test('The homepage hydrates below a GitHub Pages project prefix with local course and asset URLs', async t => {
  const { dom, document, diagnostics } = fixture(t, { url: 'http://class.test/class-notes/' });
  await evaluateBuiltModule(dom, 'site-shell.js'); await dom.window.ClassNotesSiteUI.ready;
  await evaluateBuiltModule(dom, 'homepage.js'); await pause();
  for (const selector of ['.home-course-open', '.home-course-read', '.home-course-ink', '[data-home-react-account]']) {
    const element = document.querySelector(selector), url = new URL(element.href || element.src);
    assert.ok(url.pathname.startsWith('/class-notes/'), selector);
  }
  assert.equal(document.querySelector('[data-home-react-root]').dataset.reactRecovery, undefined);
  assert.deepEqual(diagnostics, []);
});

test('The existing gradient figure loads on intersection and still responds to keyboard controls after styling', async t => {
  let enter;
  class Observer {
    constructor(callback) { this.callback = callback; }
    observe(target) {
      const notify = () => this.callback([{ target, isIntersecting: true }]);
      if (target.hasAttribute('data-gradient-hero')) enter = notify;
      else notify();
    }
    disconnect() {}
  }
  const { dom, document, window, diagnostics } = fixture(t, { reducedMotion: true, observer: Observer });
  await evaluateBuiltModule(dom, 'homepage.js');
  await settle(() => enter);
  assert.ok(!document.querySelector('[data-anatomy-figure]'));
  enter();
  const shadow = () => document.querySelector('[data-anatomy-figure]')?.shadowRoot;
  await settle(() => shadow()?.querySelector('[data-gradient-object-only]'));
  const stage = shadow().querySelector('.iso-stage'), drawing = shadow().querySelector('.gd-svg');
  const palette = shadow().querySelector('[data-gradient-object-only]').textContent;
  assert.equal(drawing.getAttribute('viewBox'), '70 58 460 300');
  assert.match(palette, /--anatomy-top: #27615a/);
  assert.match(palette, /--anatomy-top: #e1bd78/);
  assert.equal(drawing.querySelectorAll('[data-gd-column]').length, 2);
  assert.ok(drawing.querySelector('[data-gd-hit="terrain"]'));
  const original = stage.getAttribute('aria-valuenow');
  assert.ok(original);
  const key = value => stage.dispatchEvent(new window.KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true }));
  key('ArrowUp');
  await settle(() => stage.getAttribute('aria-valuenow') !== original);
  key('Escape');
  await settle(() => stage.getAttribute('aria-valuenow') === original);
  assert.deepEqual(diagnostics, []);
});

test('Reveal motion respects reduced-motion preference and cleans up observer/listener ownership', async t => {
  const reduced = fixture(t, { reducedMotion: true });
  await evaluateBuiltModule(reduced.dom, 'homepage.js'); await pause();
  assert.equal(reduced.document.querySelectorAll('.scroll-entering').length, 0);
  let disconnected = 0;
  class Observer {
    constructor(callback) { this.callback = callback; }
    observe(target) { this.callback([{ target, isIntersecting: true }]); }
    disconnect() { disconnected++; }
  }
  const animated = fixture(t, { reducedMotion: false, observer: Observer });
  await evaluateBuiltModule(animated.dom, 'homepage.js'); await settle(() => animated.document.querySelector('.scroll-entering'));
  animated.window.ClassNotesHome.dispose(); assert.ok(disconnected >= 3);
  assert.deepEqual(reduced.diagnostics, []); assert.deepEqual(animated.diagnostics, []);
});

async function bootWithFakeAuth(t, { user = null, failConfig = false } = {}) {
  const result = fixture(t), { dom, window, document } = result;
  let authChange, signins = 0;
  const requests = [];
  const client = {
    auth: {
      onAuthStateChange(callback) { authChange = callback; },
      getSession: async () => ({ data: { session: user ? { user } : null }, error: null }),
      signInWithOAuth: async options => { signins++; assert.equal(options.options.redirectTo, 'http://class.test/account/'); return { error: Error('TEST_SIGNIN_UNAVAILABLE') }; },
      signOut: async () => { authChange?.('SIGNED_OUT', null); return { error: null }; },
    },
    rpc: async name => {
      requests.push(name);
      if (name === 'classroom_bootstrap') return { data: { state: { memberships: [], results: [] } }, error: null };
      // Existing notification/presence read paths are allowed; no learner writes.
      if (name.startsWith('classroom_notice_')) return { data: { items: [], unread_count: 0, server_now: new Date().toISOString() }, error: null };
      if (name === 'classroom_presence_visibility') return { data: { visible: false }, error: null };
      throw Error('Unexpected RPC: ' + name);
    },
    removeChannel() {},
  };
  window.fetch = async input => {
    assert.equal(new URL(String(input)).pathname, '/assets/auth-config.json');
    if (failConfig) throw Error('TEST_CONFIG_UNAVAILABLE');
    return { ok: true, json: async () => ({ supabaseUrl: 'https://project.supabase.co', publishableKey: 'sb_publishable_test_public_key' }) };
  };
  const append = document.head.append.bind(document.head);
  document.head.append = node => {
    append(node);
    if (node.tagName === 'SCRIPT') { assert.match(node.src, /\/vendor\/supabase\/supabase\.js/); window.supabase = { createClient: () => client }; queueMicrotask(() => node.onload()); }
  };
  await evaluateBuiltModule(dom, 'homepage.js');
  evaluateClassicAsset(dom, 'portal.js');
  await evaluateBuiltModule(dom, 'site-shell.js'); document.querySelector('script[data-site-ui]').dispatchEvent(new window.Event('load'));
  await window.ClassroomReady;
  return { ...result, requests, signins: () => signins };
}

test('Actual classic bootstrap and React CTA share one sign-in action; rejection leaves the page usable', async t => {
  const { document, diagnostics, requests, signins } = await bootWithFakeAuth(t);
  await settle(() => document.querySelector('[data-home-react-account]').textContent.includes('Google'));
  const card = document.querySelector('[data-home-course]');
  document.querySelector('[data-home-react-account]').click();
  await settle(() => signins() === 1 && document.querySelector('[data-home-react-account]').getAttribute('aria-disabled') === 'false');
  assert.equal(signins(), 1); assert.equal(document.querySelector('[data-home-course]'), card); assert.deepEqual(requests, []);
  assert.match(document.querySelector('#toast').textContent, /ورود شروع نشد/); assert.deepEqual(diagnostics, []);
});

test('An unavailable auth config resolves to an account fallback rather than an endless homepage loading state', async t => {
  const { document, diagnostics, signins } = await bootWithFakeAuth(t, { failConfig: true });
  await settle(() => document.querySelector('[data-home-react-account]').getAttribute('aria-disabled') === 'false');
  assert.equal(document.querySelector('[data-home-react-account]').textContent, 'حساب کاربری'); assert.equal(signins(), 0);
  assert.ok(document.querySelector('[data-home-course]')); assert.deepEqual(diagnostics, []);
});

test('Signed-in homepage CTA and header remain synchronized after a real sign-out callback', async t => {
  const { document, diagnostics, requests } = await bootWithFakeAuth(t, { user: { id: 'local-student', email: 'student@example.test', user_metadata: { full_name: 'Student Example' } } });
  await settle(() => document.querySelector('[data-home-react-account]').textContent === 'رفتن به داشبورد');
  const illustration = document.querySelector('[data-gradient-hero]');
  document.querySelector('[data-account-trigger]').click(); document.querySelector('[data-account-signout]').click();
  await settle(() => document.querySelector('[data-home-react-account]').textContent.includes('Google'));
  assert.equal(document.querySelector('[data-gradient-hero]'), illustration);
  assert.ok(!requests.some(name => /lab_save|lab_finish|draft|submit|request_access/.test(name)));
  assert.deepEqual(diagnostics, []);
});
