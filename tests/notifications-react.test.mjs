import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM, VirtualConsole } from 'jsdom';
import { evaluateBuiltModule, evaluateClassicAsset } from './helpers/built-module.mjs';
import { notificationsFixtureSource, notificationsPreviewDocument } from '../frontend/notifications-preview.mjs';

const baseURL = 'https://class.test/class-notes/';
const popupTime = '2026-11-09T12:00:00.000Z', pageTime = '2026-11-09T12:01:00.000Z';
const preferences = { lab: true, review: true, content: true, access: true, revision: 2 };
const item = (id, extra = {}) => ({
  id, title: 'اعلان ' + id, kind: 'review', episode: 'revision-3', path: 'review/',
  description: 'توضیح اعلان', action: 'بازکردن دفتر مرور', active: true,
  occurred_at: popupTime, read_at: null, snoozed_until: null, ...extra,
});
const feed = (items, extra = {}) => ({
  items, unread_count: 2, preferences, server_now: popupTime, next_cursor: null, ...extra,
});
const defer = () => {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
};
async function wait(predicate, label = 'Notifications did not settle') {
  const end = Date.now() + 3000;
  while (!predicate()) {
    if (Date.now() > end) assert.fail(label);
    await new Promise(resolve => setTimeout(resolve, 12));
  }
}

async function fixture(t, handler, options = {}) {
  const dom = new JSDOM(`<!doctype html><html lang="fa" dir="rtl"><head><script data-site-ui src="${baseURL}assets/site-shell.js"></script></head>
    <body><header class="account-controls"><span id="anchor"></span><span id="other"></span></header>
    <main><div data-notifications-page><p>loading shell</p></div><button id="outside">outside</button></main></body></html>`,
    { url: baseURL + 'notifications/', runScripts: 'outside-only', pretendToBeVisual: true });
  const { window } = dom, { document: doc } = window, $ = selector => doc.querySelector(selector);
  const calls = [], destinations = [];
  const shell = await evaluateBuiltModule(dom, 'site-shell.js');
  const { mountNotifications } = await shell.loadNotifications();
  const ui = mountNotifications({
    baseURL, userId: 'test-account', onNavigate: href => destinations.push(href),
    rpc: async (name, args) => { calls.push({ name, args: structuredClone(args) }); return handler(name, args); },
    ...options,
  });
  t.after(() => { ui.dispose(); window.ClassNotesSiteUI?.dispose(); window.close(); });
  const anchor = $('#anchor');
  ui.attach(anchor); ui.attach(anchor);
  if (options.attachHistory !== false) ui.attachPage($('[data-notifications-page]'));
  await ui.refresh();
  await wait(() => $('.notice-trigger'));
  const popup = () => $('[data-react-notices-popup]'), history = () => $('[data-react-notices-history]');
  const open = async () => { $('.notice-trigger').click(); await wait(() => popup() && !popup().hidden); };
  function key(target, value, extra = {}) {
    const event = new window.KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true, ...extra });
    target.dispatchEvent(event);
    return event.defaultPrevented;
  }
  return { window, doc, $, ui, calls, destinations, popup, history, open, key };
}

test('A single React popup follows the active bell, restores focus and fits a narrow viewport', async t => {
  const { window, doc, $, ui, popup, open, key } = await fixture(t, () => feed([item('safe')]));
  Object.defineProperties(window, { innerWidth: { value: 320 }, innerHeight: { value: 420 } });
  const bell = $('#anchor .notice-trigger');
  bell.getBoundingClientRect = () => ({ left: 285, top: 365, bottom: 400, width: 24 });
  assert.equal(doc.querySelectorAll('#anchor .notice-trigger').length, 1);
  await open();
  assert.equal(popup().dir, 'rtl');
  assert.equal(doc.activeElement, popup().querySelector('h2'));
  assert.equal(bell.getAttribute('aria-expanded'), 'true');
  assert.equal(bell.getAttribute('aria-controls'), popup().id);
  assert.equal(popup().dataset.noticePlacement, 'above');
  assert.equal(popup().style.width, '296px');
  assert.equal(key(doc.activeElement, 'Escape'), true);
  await wait(() => popup().hidden);
  assert.equal(doc.activeElement, bell);
  ui.attach($('#other'));
  await wait(() => $('#other .notice-trigger'));
  $('#other .notice-trigger').click();
  await wait(() => !popup().hidden);
  assert.equal(bell.getAttribute('aria-expanded'), 'false');
  assert.equal($('#other .notice-trigger').getAttribute('aria-expanded'), 'true');
  doc.dispatchEvent(new window.CustomEvent('classroom-panel-open', { detail: { kind: 'account' } }));
  await wait(() => popup().hidden);
  assert.equal(doc.querySelectorAll('[data-react-notices-popup]').length, 1);
});

test('History pagination, filtering and cutoff stay separate from the recent list', async t => {
  const stale = defer();
  const first = item('first'), second = item('second'), recent = item('recent');
  const cursor = { at: first.occurred_at, id: first.id };
  let filtered = false;
  const { $, calls, popup, history, open } = await fixture(t, (name, args) => {
    if (name !== 'classroom_notifications') return true;
    if (!args.p_history) return feed([recent]);
    if (args.p_before_id) return feed([first, second], { server_now: pageTime });
    if (args.p_unread) { filtered = true; return feed([second], { server_now: pageTime }); }
    if (filtered) return stale.promise;
    return feed([first], { server_now: pageTime, next_cursor: cursor });
  });
  await wait(() => $('[data-notice-more]'));
  $('[data-notice-more]').click();
  await wait(() => history().querySelectorAll('article').length === 2);
  const paging = calls.find(call => call.args.p_before_id);
  assert.deepEqual(paging.args, { p_history: true, p_before: cursor.at, p_before_id: first.id, p_unread: false });
  await open();
  assert.equal(popup().querySelectorAll('article').length, 1);
  assert.ok(popup().querySelector('[data-notice-open="recent"]'));
  history().querySelector('[data-read-all]').click();
  await wait(() => calls.some(call => call.name === 'classroom_notice_read_all'));
  assert.deepEqual(calls.find(call => call.name === 'classroom_notice_read_all').args, { p_owner: 'test-account', p_cutoff: pageTime });
  await wait(() => !history().querySelector('[data-notice-filter="unread"]').disabled);
  history().querySelector('[data-notice-filter="unread"]').click();
  await wait(() => history().querySelector('[data-notice-open="second"]') && !history().querySelector('[data-notice-open="first"]'));
  history().querySelector('[data-notice-filter="all"]').click();
  await wait(() => calls.filter(call => call.args.p_history && !call.args.p_unread && !call.args.p_before_id).length === 3);
  history().querySelector('[data-notice-filter="unread"]').click();
  await wait(() => history().querySelector('[data-notice-open="second"]'));
  stale.resolve(feed([first]));
  await new Promise(resolve => setTimeout(resolve, 25));
  assert.ok(!history().querySelector('[data-notice-open="first"]'));
  if (popup().hidden) await open();
  assert.ok(popup().querySelector('[data-notice-open="recent"]'));
});

test('Read, snooze and navigation retain exact owner and episode and render server text safely', async t => {
  const first = item('first', { title: '<img src=x onerror=alert(1)>', description: '<script>bad</script>' });
  const { $, calls, open, popup, destinations } = await fixture(t, (name, args) => {
    if (name === 'classroom_notice_read') { first.read_at = popupTime; return true; }
    if (name === 'classroom_notice_snooze') {
      first.snoozed_until = new Date(Date.now() + args.p_days * 86400000).toISOString(); return true;
    }
    return feed([first, item('bad', { path: '../private/' })]);
  }, { attachHistory: false });
  await open();
  assert.equal(popup().querySelectorAll('article').length, 1);
  assert.match(popup().querySelector('h3').textContent, /<img/);
  assert.equal(popup().querySelector('article img,article script'), null);
  $('[data-read-one="first"]').click();
  await wait(() => !popup().querySelector('[data-read-one]'));
  assert.deepEqual(calls.find(call => call.name === 'classroom_notice_read').args, {
    p_owner: 'test-account', p_id: 'first', p_episode: 'revision-3',
  });
  await wait(() => !popup().querySelector('[data-snooze]').disabled);
  popup().querySelector('[data-snooze][data-days="3"]').click();
  await wait(() => popup().querySelector('.notice-resolved'));
  assert.deepEqual(calls.find(call => call.name === 'classroom_notice_snooze').args, {
    p_owner: 'test-account', p_id: 'first', p_episode: 'revision-3', p_days: 3,
  });
  await wait(() => !popup().querySelector('[data-notice-open]').hasAttribute('aria-disabled'));
  popup().querySelector('[data-notice-open]').click();
  await wait(() => destinations.length === 1);
  assert.deepEqual(destinations, [baseURL + 'review/']);
});

test('Settings preserve edits on a version conflict, allow comparison and return focus to the opener', async t => {
  let remote = { ...preferences }, tries = 0;
  const { $, doc, calls, history, key } = await fixture(t, (name, args) => {
    if (name === 'classroom_notifications') return feed([item('one')], { preferences: remote });
    if (name === 'classroom_notice_preferences' && ++tries === 1) {
      remote = { ...remote, revision: 3, review: false };
      throw Error('NOTICE_SETTINGS_CONFLICT');
    }
    remote = { ...args.p_settings, revision: 4 };
    return remote;
  });
  const opener = history().querySelector('[data-notice-settings]');
  opener.focus();
  opener.click();
  await wait(() => $('dialog.notice-settings[open]'));
  const dialog = $('dialog.notice-settings'), change = () => dialog.querySelector('input[name="lab"]');
  assert.equal(doc.activeElement, dialog.querySelector('h2'));
  assert.equal($('main').hasAttribute('inert'), true);
  assert.equal(key(doc.activeElement, 'Tab', { shiftKey: true }), true);
  assert.equal(doc.activeElement, dialog.querySelector('[type="submit"]'));
  change().click(); await wait(() => !change().checked);
  const submit = () => dialog.querySelector('form').dispatchEvent(new doc.defaultView.Event('submit', { bubbles: true, cancelable: true }));
  submit();
  await wait(() => !dialog.querySelector('[data-settings-conflict]').hidden);
  assert.equal(dialog.querySelector('[type="submit"]').disabled, true);
  assert.equal(change().checked, false);
  dialog.querySelector('[data-settings-conflict]').click();
  await wait(() => dialog.querySelector('[data-settings-remote]'));
  assert.equal(change().checked, false);
  assert.equal(dialog.querySelector('input[name="review"]').checked, true);
  await wait(() => !dialog.querySelector('[type="submit"]').disabled);
  submit();
  await wait(() => !$('dialog.notice-settings'));
  await wait(() => doc.activeElement === opener, 'Settings focus did not return to the opener');
  assert.equal($('main').hasAttribute('inert'), false);
  const writes = calls.filter(call => call.name === 'classroom_notice_preferences');
  assert.deepEqual(writes.map(call => call.args.p_revision), [2, 3]);
  assert.deepEqual(writes[1].args, { p_owner: 'test-account', p_revision: 3, p_settings: { lab: false, review: true, content: true, access: true } });
});

test('Disposal clears every surface and prevents late reads from navigating as a former owner', async t => {
  const late = defer();
  const { $, calls, ui, open, popup, destinations } = await fixture(t, name => {
    return name === 'classroom_notice_read' ? late.promise : feed([item('one')]);
  });
  await open();
  popup().querySelector('[data-notice-open]').click();
  await wait(() => calls.some(call => call.name === 'classroom_notice_read'));
  ui.dispose();
  late.resolve(true);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal($('[data-react-notifications-root]'), null);
  assert.equal($('.notice-trigger'), null);
  assert.equal($('[data-react-notices-history]'), null);
  assert.deepEqual(destinations, []);
});

test('The local preview mounts the real React views with sample data and no auth portal', async t => {
  const html = await notificationsPreviewDocument(process.cwd());
  assert.doesNotMatch(html, /<script[^>]*data-portal|vendor\/supabase/);
  assert.ok(!fs.existsSync('dist/__preview__/notifications/'));
  const dom = new JSDOM(html, { url: 'https://class.test/__preview__/notifications/', runScripts: 'outside-only', pretendToBeVisual: true });
  const asset = 'notices-preview-test-' + process.pid + '.mjs';
  fs.writeFileSync('dist/assets/' + asset, notificationsFixtureSource());
  t.after(() => {
    dom.window.dispatchEvent(new dom.window.Event('pagehide'));
    dom.window.ClassNotesSiteUI?.dispose(); dom.window.close();
    fs.unlinkSync('dist/assets/' + asset);
  });
  dom.window.fetch = () => { throw Error('No network permitted in a notice fixture'); };
  await evaluateBuiltModule(dom, asset);
  const doc = dom.window.document;
  await wait(() => doc.querySelector('[data-react-notices-history] article'));
  doc.querySelector('[data-sample-notification-anchor] button').click();
  await wait(() => doc.querySelector('[data-react-notices-popup]:not([hidden]) article'));
  assert.equal(doc.querySelectorAll('.notice-page-list article').length, 3);
  assert.ok(doc.querySelector('[data-notice-more]'));
  assert.ok([...doc.querySelectorAll('[data-notice-open]')].every(link => new URL(link.href).pathname === '/__preview__/notifications/'));
  assert.equal(dom.window.Classroom, undefined);
});

test('The published portal mounts notices only after sign-in and clears them when the account leaves', async t => {
  for (const signedIn of [false, true]) {
    const html = fs.readFileSync('dist/notifications/index.html', 'utf8');
    const errors = [], virtualConsole = new VirtualConsole();
    virtualConsole.on('jsdomError', error => errors.push(error));
    const dom = new JSDOM(html, { url: 'https://class.test/notifications/', runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole });
    const { window } = dom, doc = window.document;
    t.after(() => { window.ClassNotesSiteUI?.dispose(); window.close(); });
    const user = { id: 'member-one', email: 'learner@example.test', user_metadata: { full_name: 'عضو نمونه' } };
    let authChanged, clientCreates = 0;
    const calls = [];
    const client = {
      auth: {
        getSession: async () => ({ data: { session: signedIn ? { user } : null }, error: null }),
        onAuthStateChange(callback) { authChanged = callback; return { data: { subscription: { unsubscribe() {} } } }; },
      },
      async rpc(name) {
        calls.push(name);
        if (name === 'classroom_bootstrap') return { data: { state: { memberships: [], results: [] } }, error: null };
        if (name === 'classroom_state') return { data: { memberships: [], results: [] }, error: null };
        if (name === 'classroom_notifications') return { data: feed([item('portal')]), error: null };
        return { data: null, error: null };
      },
    };
    window.fetch = async () => ({
      ok: true, json: async () => ({ supabaseUrl: 'https://project.supabase.co', publishableKey: 'sb_publishable_test_public_key' }),
    });
    const append = doc.head.append.bind(doc.head);
    doc.head.append = node => {
      append(node);
      if (node.tagName === 'SCRIPT' && node.src.includes('/vendor/supabase/')) {
        window.supabase = { createClient() { clientCreates++; return client; } };
        queueMicrotask(() => node.onload());
      }
    };
    await evaluateBuiltModule(dom, 'site-shell.js');
    evaluateClassicAsset(dom, 'portal.js');
    await window.ClassroomReady;
    assert.equal(clientCreates, 1);
    if (!signedIn) {
      assert.ok(doc.querySelector('[data-notifications-page] [data-login-link]'));
      assert.equal(doc.querySelector('[data-react-notifications-root]'), null);
      assert.ok(!calls.includes('classroom_notifications'));
    } else {
      await wait(() => doc.querySelector('[data-react-notices-history] [data-notice-open="portal"]') && doc.querySelector('.notice-trigger'));
      assert.equal(doc.querySelectorAll('[data-react-notifications-root]').length, 1);
      authChanged('SIGNED_OUT', null);
      await wait(() => !doc.querySelector('[data-react-notifications-root]'));
      assert.equal(doc.querySelector('[data-notice-open="portal"]'), null);
      assert.equal(doc.querySelector('.notice-trigger'), null);
    }
    assert.ok(errors.every(error => /Not implemented: navigation/.test(error.message)), errors.map(error => error.message).join('\n'));
  }
});

test('A reconnect queues one refresh after older popup and history requests settle', async t => {
  const oldFeed = defer(), oldHistory = defer(), pending = { popup: 0, page: 0 };
  const { window, $, ui, popup, history } = await fixture(t, (_name, args) => {
    const surface = args.p_history ? 'page' : 'popup';
    const count = ++pending[surface];
    if (count === 2) return args.p_history ? oldHistory.promise : oldFeed.promise;
    return feed([item(count === 1 ? 'original' : 'updated')]);
  });
  await wait(() => history().querySelector('[data-notice-open="original"]'));
  $('#anchor .notice-trigger').click();
  await wait(() => !popup().hidden && pending.popup === 2);
  $('[data-notice-filter="unread"]').click();
  await wait(() => pending.page === 2);
  if (popup().hidden) $('#anchor .notice-trigger').click();
  await wait(() => !popup().hidden);
  window.dispatchEvent(new window.Event('online'));
  window.dispatchEvent(new window.Event('online'));
  oldFeed.resolve(feed([item('old-popup')]));
  oldHistory.resolve(feed([item('old-history')]));
  await wait(() => popup().querySelector('[data-notice-open="updated"]') &&
    history().querySelector('[data-notice-open="updated"]'), 'Forced refresh was dropped while earlier reads were in flight');
  assert.deepEqual(pending, { popup: 3, page: 3 });
  ui.dispose();
});

test('A failed write gives visible feedback and can be retried without losing the unread notice', async t => {
  let attempts = 0;
  const { $, open, popup } = await fixture(t, (name) => {
    if (name === 'classroom_notice_read' && ++attempts === 1) throw Error('NOTICE_CHANGED');
    return feed([item('one', { read_at: attempts >= 2 ? popupTime : null })]);
  }, { attachHistory: false });
  await open();
  $('[data-read-one]').click();
  await wait(() => popup().querySelector('.notice-error'), 'The failed write was only announced to a screen reader');
  assert.match(popup().querySelector('.notice-error').textContent, /این اعلان تغییر کرده/);
  assert.ok($('[data-read-one]'));
  $('[data-read-one]').click();
  await wait(() => !$('[data-read-one]'));
  assert.equal(popup().querySelector('.notice-error'), null);
  assert.equal(attempts, 2);
});

test('A failed open keeps the reader on the page and leaves the notice unread', async t => {
  const { $, open, popup, destinations } = await fixture(t, name => {
    if (name === 'classroom_notice_read') throw Error('NOTICE_CHANGED');
    return feed([item('one')]);
  }, { attachHistory: false });
  await open();
  popup().querySelector('[data-notice-open]').click();
  await wait(() => /این اعلان تغییر کرده/.test($('.sr-only[role="status"]')?.textContent ?? ''));
  assert.deepEqual(destinations, []);
  await open();
  assert.ok(popup().querySelector('[data-read-one="one"]'));
});

test('A stalled feed unlocks the UI and a retry ignores the late response', async t => {
  const stalled = defer();
  let reads = 0;
  const { $, open, popup } = await fixture(t, () => {
    if (++reads <= 2) return stalled.promise;
    return feed([item('recovered')]);
  }, { attachHistory: false, requestTimeout: 50 });
  assert.equal($('.notice-trigger').getAttribute('aria-busy'), 'false');
  await open();
  await wait(() => reads === 2);
  await new Promise(resolve => setTimeout(resolve, 75));
  popup().querySelector('[data-notice-retry]').click();
  await wait(() => popup().querySelector('[data-notice-open="recovered"]'));
  stalled.resolve(feed([item('stale')]));
  await new Promise(resolve => setTimeout(resolve, 25));
  assert.equal(popup().querySelector('[data-notice-open="stale"]'), null);
  assert.equal(popup().querySelector('.notice-error'), null);
});

test('A background update during a failed mutation is not lost', async t => {
  const writing = defer();
  let reads = 0, writes = 0, newer = false;
  const { $, window, popup, open } = await fixture(t, name => {
    if (name === 'classroom_notice_read') { writes++; return writing.promise; }
    reads++;
    return feed([item(newer ? 'fresh' : 'first')]);
  }, { attachHistory: false });
  await open();
  await wait(() => reads === 2);
  $('[data-read-one]').click();
  await wait(() => writes === 1);
  newer = true;
  window.dispatchEvent(new window.Event('online'));
  assert.equal(reads, 2);
  writing.resolve(Promise.reject(Error('NOTICE_CHANGED')));
  await wait(() => popup().querySelector('[data-notice-open="fresh"]'));
  assert.equal(reads, 3);
  assert.match(popup().querySelector('.notice-error').textContent, /این اعلان تغییر کرده/);
});

test('The bell shows a Persian unread count before it opens and removes the badge after clearing notices', async t => {
  let unread = 105;
  const { $, open, popup } = await fixture(t, name => {
    if (name === 'classroom_notice_read_all') { unread = 0; return true; }
    return feed([item('one')], { unread_count: unread });
  }, { attachHistory: false });
  const bell = $('.notice-trigger');
  assert.equal(bell.getAttribute('aria-expanded'), 'false');
  const badge = bell.querySelector('.notice-badge');
  assert.equal(badge.textContent, '۹۹+');
  assert.equal(badge.getAttribute('aria-hidden'), 'true');
  assert.match(bell.getAttribute('aria-label'), /۱۰۵ خوانده‌نشده/);
  await open();
  popup().querySelector('[data-read-all]').click();
  await wait(() => !bell.querySelector('.notice-badge'));
  assert.match(bell.getAttribute('aria-label'), /۰ خوانده‌نشده/);
});

test('Signed-in readers receive the unread badge while the lesson payload is still pending', async t => {
  const route = 'machine-learning/prediction-problem/';
  const html = fs.readFileSync('dist/' + route + 'index.html', 'utf8');
  const dom = new JSDOM(html, { url: 'https://class.test/' + route, runScripts: 'outside-only', pretendToBeVisual: true });
  const { window } = dom, doc = window.document;
  t.after(() => { window.ClassNotesSiteUI?.dispose(); window.close(); });
  const lesson = defer(), calls = [];
  const user = { id: 'badge-test', email: 'learner@example.test', user_metadata: { full_name: 'عضو نمونه' } };
  const client = {
    auth: { getSession: async () => ({ data: { session: { user } }, error: null }), onAuthStateChange() {} },
    async rpc(name) {
      calls.push(name);
      if (name === 'classroom_bootstrap' || name === 'classroom_state') {
        const state = { memberships: [{ course_id: 'machine-learning', status: 'active', role: 'student' }], results: [] };
        return { data: name === 'classroom_bootstrap' ? { state } : state, error: null };
      }
      if (name === 'classroom_lesson') return lesson.promise;
      if (name === 'classroom_notifications') return { data: feed([item('new')], { unread_count: 3 }), error: null };
      return { data: null, error: null };
    },
  };
  window.fetch = async () => ({
    ok: true,
    json: async () => ({ supabaseUrl: 'https://project.supabase.co', publishableKey: 'sb_publishable_test_public_key' }),
  });
  const append = doc.head.append.bind(doc.head);
  doc.head.append = node => {
    append(node);
    if (node.tagName === 'SCRIPT' && node.src.includes('/vendor/supabase/')) {
      window.supabase = { createClient: () => client };
      queueMicrotask(() => node.onload());
    }
  };
  await evaluateBuiltModule(dom, 'site-shell.js');
  evaluateClassicAsset(dom, 'portal.js');
  try {
    await wait(() => calls.includes('classroom_lesson'));
    await wait(() => doc.querySelector('.notice-badge')?.textContent === '۳');
    assert.equal(doc.querySelector('.notice-trigger').getAttribute('aria-expanded'), 'false');
    assert.equal(calls.filter(name => name === 'classroom_notifications').length, 1);
  } finally {
    lesson.resolve({ data: null, error: { message: 'End the isolated slow-request fixture' } });
    await window.ClassroomReady;
  }
});
