import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
import { evaluateBuiltModule, evaluateClassicAsset } from './helpers/built-module.mjs';

const pause = () => new Promise(resolve => setTimeout(resolve, 25));
async function settle(predicate) {
  const end = Date.now() + 3500;
  while (!predicate()) { if (Date.now() > end) throw Error('Account state did not settle'); await pause(); }
}
const user = { id: 'student', email: 'student@example.test', user_metadata: { full_name: 'Student Example', avatar_url: 'https://images.test/student.png' } };
const urls = { account: '/account/', dashboard: '/dashboard/', review: '/review/', teacher: '/instructor/' };

function fixture(t, suffix = '') {
  const dom = new JSDOM(fs.readFileSync('dist/account/index.html', 'utf8'), {
    url: 'http://class.test/account/' + suffix, runScripts: 'outside-only', pretendToBeVisual: true,
  });
  const { window } = dom, document = window.document, diagnostics = [];
  dom.getInternalVMContext().console = { ...console, warn: (...args) => diagnostics.push(args), error: (...args) => diagnostics.push(args) };
  t.after(() => { window.ClassNotesAccountPage?.dispose(); window.ClassNotesSiteUI?.dispose(); window.close(); });
  return { dom, window, document, diagnostics };
}
async function hydrate(result, order = ['site-shell.js', 'account-page.js']) {
  for (const entry of order) await evaluateBuiltModule(result.dom, entry);
  await Promise.all([result.window.ClassNotesAccountPage.ready, result.window.ClassNotesSiteUI.ready]);
}
function mount(result, actions = {}) {
  return result.window.ClassNotesSiteUI.mountAccountUI({ urls, onSignIn: async () => {}, onSignOut: async () => {}, ...actions });
}
function key(result, target, value, shiftKey = false) {
  target.dispatchEvent(new result.window.KeyboardEvent('keydown', { key: value, shiftKey, bubbles: true, cancelable: true }));
}

test('Account page and header hydrate in either entry order, reuse SSR nodes and share escaped identity/action state', async t => {
  for (const order of [['account-page.js', 'site-shell.js'], ['site-shell.js', 'account-page.js']]) {
    const result = fixture(t), { document, diagnostics } = result;
    const heading = document.querySelector('#main h1'), panel = document.querySelector('.account-grid');
    assert.ok(document.querySelector('[data-account-guest]').hidden);
    assert.ok(document.querySelector('[data-account-member]').hidden);
    await hydrate(result, order);
    let signins = 0, exits = 0;
    const api = mount(result, { onSignIn: async () => { signins++; }, onSignOut: async () => { exits++; } });
    api.update({ ready: true });
    await settle(() => !document.querySelector('[data-account-guest]').hidden);
    document.querySelector('[data-signin]').click(); await settle(() => signins === 1);
    const unsafe = { ...user, user_metadata: { full_name: '<img src=x onerror=alert(1)>', avatar_url: 'javascript:alert(1)' } };
    api.update({ ready: true, user: unsafe, teacher: true });
    await settle(() => document.querySelector('[data-user-name]').textContent === unsafe.user_metadata.full_name);
    assert.equal(document.querySelector('.account-person strong').textContent, unsafe.user_metadata.full_name);
    assert.ok(!document.querySelector('.account-person img')); assert.ok(!document.querySelector('.account-avatar img'));
    assert.equal(document.querySelector('[data-user-email]').textContent, user.email);
    assert.ok(document.querySelector('.account-menu-items a[href="/instructor/"]'));
    api.setContinue('/quiz/machine-learning/prediction-problem/');
    await settle(() => document.querySelector('[data-continue]').getAttribute('href').includes('/quiz/'));
    document.querySelector('[data-signout]').click(); await settle(() => exits === 1);
    assert.equal(signins, 1); assert.equal(document.querySelector('#main h1'), heading); assert.equal(document.querySelector('.account-grid'), panel);
    assert.ok(!document.querySelector('[data-react-recovery]')); assert.deepEqual(diagnostics, []);
  }
});

test('Account popup escapes header containment, fits a narrow viewport and supports focus, hidden items and dismissal', async t => {
  const result = fixture(t), { document, window, diagnostics } = result;
  const style = document.createElement('style'); style.textContent = '.account-menu-dashboard{display:none}'; document.head.append(style);
  Object.defineProperty(window, 'innerWidth', { value: 320, configurable: true });
  await hydrate(result); const api = mount(result); api.update({ ready: true, user });
  await settle(() => document.querySelector('[data-account-trigger]'));
  const trigger = document.querySelector('[data-account-trigger]');
  trigger.getBoundingClientRect = () => ({ top: 20, bottom: 60, right: 310 });
  key(result, trigger, 'ArrowDown'); await settle(() => document.querySelector('.account-menu-portal'));
  let popup = document.querySelector('.account-menu-portal .account-popover');
  assert.equal(popup.closest('[data-site-header-root]'), null);
  assert.equal(document.activeElement.getAttribute('href'), '/account/');
  assert.ok(parseFloat(popup.style.left) >= 12); assert.ok(parseFloat(popup.style.left) + parseFloat(popup.style.width) <= 308);
  key(result, popup, 'End'); assert.ok(document.activeElement.matches('[data-account-signout]'));
  key(result, popup, 'ArrowDown'); assert.equal(document.activeElement.getAttribute('href'), '/account/');
  key(result, popup, 'Escape'); await settle(() => trigger.getAttribute('aria-expanded') === 'false'); assert.equal(document.activeElement, trigger);
  trigger.click(); await settle(() => document.querySelector('.account-menu-portal'));
  document.querySelector('#main').dispatchEvent(new window.Event('pointerdown', { bubbles: true }));
  await settle(() => trigger.getAttribute('aria-expanded') === 'false');
  trigger.click(); await settle(() => document.querySelector('.account-menu-portal'));
  popup = document.querySelector('.account-menu-portal .account-popover'); key(result, popup, 'Tab');
  await settle(() => trigger.getAttribute('aria-expanded') === 'false'); assert.equal(document.activeElement, trigger);
  const image = trigger.querySelector('img'); image.dispatchEvent(new window.Event('error'));
  await settle(() => !trigger.querySelector('img')); assert.deepEqual(diagnostics, []);
});

test('Compact lab account attachment is idempotent, has one open menu and releases detached hosts without disturbing notification contents', async t => {
  const result = fixture(t), { document, window, diagnostics } = result;
  await hydrate(result); const api = mount(result); api.update({ ready: true, user });
  await settle(() => document.querySelector('[data-notification-anchor]'));
  const anchor = document.querySelector('[data-notification-anchor]'), external = document.createElement('button');
  external.textContent = 'notification widget'; anchor.append(external);
  const lab = document.createElement('div'); document.body.append(lab);
  const host = api.attach(lab, { compact: true }); assert.equal(api.attach(lab, { compact: true }), host);
  await settle(() => host.querySelector('[data-account-trigger]'));
  document.querySelector('[data-account-trigger]').click(); await settle(() => document.querySelector('.account-menu-portal'));
  host.querySelector('[data-account-trigger]').click(); await settle(() => document.querySelector('.account-menu-portal.account-controls-compact'));
  assert.equal(document.querySelectorAll('.account-menu-portal').length, 1);
  assert.equal(document.querySelector('[data-account-scope="header"] [data-account-trigger]').getAttribute('aria-expanded'), 'false');
  api.update({ ready: true, user }); await pause(); assert.ok(external.isConnected); assert.equal(external.parentElement, anchor);
  document.body.classList.add('lab-notebook-ready'); api.focusAccount(); await pause(); assert.equal(document.activeElement, host.querySelector('[data-account-trigger]'));
  lab.remove(); api.update({ ready: true, user }); await settle(() => !document.querySelector('.account-menu-portal'));
  assert.ok(!host.isConnected); assert.ok(external.isConnected);
  document.dispatchEvent(new window.CustomEvent('classroom-panel-open', { detail: { kind: 'notifications' } })); await pause();
  assert.deepEqual(diagnostics, []);
});

test('Draft confirmation has a safe initial focus, traps fallback keyboard focus and requires an explicit exit decision', async t => {
  const result = fixture(t), { document } = result; await hydrate(result); const api = mount(result); api.update({ ready: true, user });
  await settle(() => document.querySelector('[data-account-trigger]'));
  const trigger = document.querySelector('[data-account-trigger]'); trigger.focus();
  let pending = api.confirmUnsaved({ localSaved: true }); await settle(() => document.querySelector('[role="alertdialog"]'));
  let dialog = document.querySelector('[role="alertdialog"]'); assert.ok(dialog.open);
  assert.equal(document.activeElement, dialog.querySelector('[data-stay]'));
  key(result, document.activeElement, 'Tab', true); assert.equal(document.activeElement, dialog.querySelector('[data-leave]'));
  key(result, document.activeElement, 'Tab'); assert.equal(document.activeElement, dialog.querySelector('[data-stay]'));
  key(result, dialog, 'Escape'); assert.equal(await pending, false); await settle(() => !document.querySelector('[role="alertdialog"]'));
  assert.equal(document.activeElement, trigger);
  pending = api.confirmUnsaved({ localSaved: false }); await settle(() => document.querySelector('[data-leave]'));
  document.querySelector('[data-leave]').click(); assert.equal(await pending, true);
  await settle(() => !document.querySelector('[role="alertdialog"]'));
});

test('Native draft dialog closes and cancels when the account owner changes', async t => {
  const result = fixture(t), { document, window, diagnostics } = result;
  let shown = 0, closed = 0;
  window.HTMLDialogElement.prototype.showModal = function () { shown++; this.open = true; };
  window.HTMLDialogElement.prototype.close = function () { closed++; this.open = false; };
  await hydrate(result); const api = mount(result); api.update({ ready: true, user }); await pause();
  const pending = api.confirmUnsaved({}); await settle(() => shown === 1);
  api.update({ ready: true, user: { ...user, id: 'replacement' } }); assert.equal(await pending, false);
  await settle(() => !document.querySelector('[role="alertdialog"]')); assert.equal(closed, 1); assert.deepEqual(diagnostics, []);
});

async function boot(t, { signedIn = false, invalidConfig = false, failedFetch = false, failedEntry, finishSignOut, emitSignOut = true } = {}) {
  const result = fixture(t, failedEntry ? '?code=example-code' : '?next=%2Freview%2F'), { dom, window, document } = result;
  const returnKey = 'class-notes-oauth-return:/';
  if (failedEntry) window.sessionStorage.setItem(returnKey, 'http://class.test/review/');
  let authChange, reads = 0, signins = 0, signouts = 0, configReads = 0, clients = 0;
  const client = { auth: {
    onAuthStateChange(callback) { authChange = callback; },
    getSession: async () => ({ data: { session: signedIn ? { user } : null }, error: null }),
    signInWithOAuth: async options => { signins++; assert.equal(options.options.redirectTo, 'http://class.test/account/'); return { error: Error('TEST_LOGIN_UNAVAILABLE') }; },
    signOut: async () => { signouts++; if (emitSignOut) authChange('SIGNED_OUT', null); await finishSignOut?.(); return { error: null }; },
  }, rpc: async name => {
    reads++;
    if (name === 'classroom_bootstrap') return { data: { state: { memberships: [], results: [] } }, error: null };
    if (name.startsWith('classroom_notice_')) return { data: { items: [], unread_count: 0, server_now: new Date().toISOString() }, error: null };
    if (name === 'classroom_presence_visibility') return { data: { visible: false }, error: null };
    throw Error('Unexpected RPC: ' + name);
  }, removeChannel() {} };
  window.fetch = async input => { assert.equal(new URL(String(input)).pathname, '/assets/auth-config.json'); configReads++; if (failedFetch) throw Error('TEST_CONFIG_UNAVAILABLE'); return { ok: true, json: async () => invalidConfig ? {} : { supabaseUrl: 'https://project.supabase.co', publishableKey: 'sb_publishable_test_public_key' } }; };
  const append = document.head.append.bind(document.head);
  document.head.append = node => { append(node); if (node.tagName === 'SCRIPT') { window.supabase = { createClient: () => { clients++; return client; } }; queueMicrotask(() => node.onload()); } };
  evaluateClassicAsset(dom, 'portal.js');
  if (failedEntry !== 'shell') await evaluateBuiltModule(dom, 'site-shell.js');
  await pause();
  document.querySelector('script[data-site-ui]').dispatchEvent(new window.Event(failedEntry === 'shell' ? 'error' : 'load'));
  assert.equal(configReads, 1, 'Public configuration can download during hydration');
  assert.equal(clients, 0, 'Session recovery must wait for account page hydration');
  if (failedEntry !== 'account') await evaluateBuiltModule(dom, 'account-page.js');
  document.querySelector('script[data-account-ui]').dispatchEvent(new window.Event(failedEntry === 'account' ? 'error' : 'load'));
  await window.ClassroomReady;
  return { ...result, reads: () => reads, signins: () => signins, signouts: () => signouts, clients: () => clients, returnKey, authChange };
}

test('Actual classic bootstrap waits for both entries and keeps page, header and safe continuation synchronized through sign-out', async t => {
  const { document, diagnostics, signouts } = await boot(t, { signedIn: true });
  await settle(() => !document.querySelector('[data-account-member]').hidden);
  assert.equal(document.querySelector('[data-user-email]').textContent, user.email);
  assert.equal(document.querySelector('[data-continue]').href, 'http://class.test/review/');
  assert.equal(document.querySelectorAll('[data-account-presence-slot] [data-presence-settings]').length <= 1, true);
  document.querySelector('[data-signout]').click(); await settle(() => !document.querySelector('[data-account-guest]').hidden);
  assert.equal(signouts(), 1); assert.ok(document.querySelector('[data-account-signin]')); assert.equal(document.querySelector('#main').inert, false);
  assert.equal(document.querySelector('[data-account-react-root]').dataset.reactRecovery, undefined); assert.deepEqual(diagnostics, []);
});

test('Guest account login has one action owner and invalid configuration renders a usable error state', async t => {
  const normal = await boot(t); await settle(() => !normal.document.querySelector('[data-account-guest]').hidden);
  normal.document.querySelector('[data-signin]').click(); await settle(() => normal.signins() === 1 && /ورود شروع نشد/.test(normal.document.querySelector('[data-auth-status]').textContent));
  assert.equal(normal.document.querySelector('[data-signin]').disabled, false);
  assert.equal(normal.reads(), 0); assert.match(normal.document.querySelector('[data-auth-status]').textContent, /ورود شروع نشد/);
  for (const failure of [{ invalidConfig: true }, { failedFetch: true }]) {
    const failed = await boot(t, failure); await settle(() => failed.document.querySelector('[data-account-retry]'));
    assert.ok(failed.document.querySelector('[data-account-guest]').hidden); assert.equal(failed.signins(), 0); assert.equal(failed.reads(), 0);
    assert.equal(failed.document.querySelector('[data-auth-status]').dataset.error, 'true'); assert.deepEqual(failed.diagnostics, []);
  }
  assert.deepEqual(normal.diagnostics, []);
});

test('An unavailable account or shell entry exposes a persistent retry and preserves the pending OAuth return', async t => {
  for (const failedEntry of ['account', 'shell']) {
    const { document, window, clients, returnKey, diagnostics } = await boot(t, { failedEntry });
    const failure = document.querySelector('[data-account-startup-error]');
    assert.ok(failure && !failure.hidden, failedEntry);
    assert.ok(document.querySelector('[data-account-react-root]').hidden);
    assert.ok(failure.querySelector('[role="alert"]').textContent);
    assert.equal(failure.querySelector('a').href, window.location.href);
    assert.equal(clients(), 0);
    assert.equal(window.sessionStorage.getItem(returnKey), 'http://class.test/review/');
    assert.deepEqual(diagnostics, []);
  }
});

test('An earlier sign-out completion cannot clear a newer signed-in account', async t => {
  let finish;
  const pending = new Promise(resolve => { finish = resolve; });
  const { document, authChange, signouts, diagnostics } = await boot(t, { signedIn: true, finishSignOut: () => pending });
  await settle(() => !document.querySelector('[data-account-member]').hidden);
  document.querySelector('[data-signout]').click();
  await settle(() => signouts() === 1);
  const replacement = { id: 'other-student', email: 'other@example.test' };
  authChange('SIGNED_IN', { user: replacement });
  await settle(() => document.querySelector('[data-user-email]').textContent === replacement.email);
  authChange('SIGNED_OUT', null); // delayed event from the earlier local sign-out
  finish();
  await settle(() => document.querySelector('#main').inert === false);
  assert.equal(document.querySelector('[data-user-email]').textContent, replacement.email);
  assert.equal(document.querySelector('[data-account-member]').hidden, false);
  assert.ok(!document.querySelector('[data-account-signin]'));
  assert.deepEqual(diagnostics, []);
});


test('A stalled logout restores the UI without duplicating the pending SDK operation', async t => {
  let finish;
  const pending = new Promise(resolve => { finish = resolve; });
  const { window, document, authChange, signouts } = await boot(t, { signedIn: true, finishSignOut: () => pending, emitSignOut: false });
  t.after(finish);
  await settle(() => !document.querySelector('[data-account-member]').hidden);
  const timer = window.setTimeout.bind(window);
  window.setTimeout = (callback, delay, ...args) => timer(callback, delay === 12000 ? 5 : delay, ...args);
  document.querySelector('[data-signout]').click();
  await settle(() => signouts() === 1);
  await settle(() => !document.querySelector('#main').inert && !document.querySelector('[data-signout]').disabled);
  assert.match(document.querySelector('[data-auth-status]').textContent, /خروج.*طول کشید/);
  document.querySelector('[data-signout]').click();
  assert.equal(signouts(), 1);
  assert.equal(document.querySelector('[data-account-member]').hidden, false);
  authChange('SIGNED_OUT', null);
  finish();
  await settle(() => !document.querySelector('[data-account-guest]').hidden);
  assert.equal(document.querySelector('#main').inert, false);
});
