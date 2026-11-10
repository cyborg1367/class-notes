import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { JSDOM, VirtualConsole } from 'jsdom';
import { evaluateBuiltModule, evaluateClassicAsset } from './helpers/built-module.mjs';

function page(t, route, { prefix = '', signIn = null, rpc, download, script } = {}) {
  const address = 'https://class.test' + prefix + '/' + route.replace(/index\.html$/, '');
  const diagnostics = [], browserErrors = [], requests = [], rpcCalls = [], downloads = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', error => browserErrors.push(error));
  const dom = new JSDOM(readFileSync('dist/' + route, 'utf8'), { url: address, runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole });
  const { window } = dom, { document } = window;
  dom.getInternalVMContext().console = { ...console, warn: (...args) => diagnostics.push(args), error: (...args) => diagnostics.push(args) };
  t.after(() => {
    window.ClassNotesHome?.dispose(); window.ClassNotesCourseApp?.disposeAll();
    window.ClassNotesAccountPage?.dispose(); window.ClassNotesSiteUI?.dispose(); window.close();
  });
  let authChange, sessions = 0;
  const client = {
    auth: {
      onAuthStateChange(callback) { authChange = callback; },
      async getSession() { sessions++; return { data: { session: signIn ? { user: signIn } : null }, error: null }; },
    },
    async rpc(name, args) { rpcCalls.push(name); if (!rpc) throw Error('Unexpected RPC: ' + name); return rpc(name, args); },
    storage: { from(bucket) { return { async download(path) { downloads.push({ bucket, path }); if (!download) throw Error('Unexpected private download'); return download(path); } }; } },
    removeChannel() {},
  };
  window.fetch = async input => {
    const url = new URL(input);
    requests.push(url.pathname);
    assert.equal(url.origin, 'https://class.test');
    assert.equal(url.pathname, prefix + '/assets/auth-config.json');
    return { ok: true, json: async () => ({ supabaseUrl: 'https://fixture.supabase.co', publishableKey: 'sb_publishable_fixture' }) };
  };
  const append = document.head.append.bind(document.head);
  document.head.append = node => {
    append(node);
    if (node.tagName !== 'SCRIPT') return;
    if (node.src.includes('/assets/vendor/supabase/supabase.js')) {
      window.supabase = { createClient: () => client };
      queueMicrotask(() => node.onload());
    } else if (script) script(node);
    else { diagnostics.push(['Unexpected script', node.src]); queueMicrotask(() => node.onerror()); }
  };
  async function boot() {
    for (const entry of document.querySelectorAll('script[data-site-ui],script[data-home-ui],script[data-course-ui],script[data-account-ui]')) {
      await evaluateBuiltModule(dom, new URL(entry.src).pathname.split('/').at(-1));
    }
    await Promise.all([window.ClassNotesSiteUI?.ready, window.ClassNotesCourseApp?.ready, window.ClassNotesAccountPage?.ready]);
    evaluateClassicAsset(dom, 'portal.js');
    await window.ClassroomReady;
  }
  return { boot, window, document, diagnostics, browserErrors, requests, rpcCalls, downloads, sessions: () => sessions, changeUser: user => authChange('SIGNED_IN', { user }) };
}

test('Every built route boots with a guest and no private requests, at root or below a project prefix', async t => {
  const routes = readdirSync('dist', { recursive: true }).filter(route => route.endsWith('index.html')).sort();
  assert.equal(routes.length, 20);
  for (const [index, route] of routes.entries()) {
    await t.test(route, async item => {
      const prefix = index % 2 ? '/class-notes' : '';
      const app = page(item, route, { prefix });
      await app.boot();
      assert.deepEqual(app.diagnostics, []);
      assert.deepEqual(app.browserErrors, []);
      assert.deepEqual(app.requests, [prefix + '/assets/auth-config.json']);
      assert.equal(app.sessions(), 1);
      assert.deepEqual(app.rpcCalls, []);
      assert.deepEqual(app.downloads, []);
      assert.equal(app.document.querySelectorAll('[data-react-recovery]').length, 0);
      assert.equal(new URL(app.document.querySelector('.brand').href).pathname, prefix + '/index.html');
      assert.ok(app.document.querySelector('[data-site-header-root][data-shell-mounted="true"]'));
    });
  }
});

const student = { id: 'fixture-student', email: 'student@example.test' };
const lessonId = 'machine-learning/prediction-problem';
const route = lessonId + '/index.html';
const imagePath = 'machine-learning/predictions/example.svg';
const scriptPath = 'machine-learning/predictions/example.js';
const membership = { course_id: 'machine-learning', status: 'active', role: 'student' };
const lessonData = (body, scripts = []) => async name => {
  if (name === 'classroom_bootstrap') return { data: { state: { memberships: [membership], results: [] }, lesson: { body, scripts } }, error: null };
  if (name.startsWith('classroom_notice_')) return { data: { items: [], unread_count: 0, server_now: new Date().toISOString() }, error: null };
  if (name === 'classroom_presence_visibility') return { data: { visible: false }, error: null };
  throw Error('Unexpected RPC: ' + name);
};

test('The protected reader requests the exact stored path once and fills both image elements', async t => {
  const body = '<section class="lesson-body" id="top"><h1>Protected fixture</h1>' +
    '<img data-private-path="' + imagePath + '" alt="one"><img data-private-path="' + imagePath + '" alt="two"></section>';
  const app = page(t, route, { signIn: student, rpc: lessonData(body), download: async () => ({ data: new Blob(['<svg/>']), error: null }) });
  const types = [];
  app.window.URL.createObjectURL = blob => { types.push(blob.type); return 'blob:https://class.test/fixture-image'; };
  app.window.URL.revokeObjectURL = () => {};
  await app.boot();
  // The protected React reader commits the article asynchronously after boot.
  const images = () => app.document.querySelectorAll('img[src="blob:https://class.test/fixture-image"]');
  for (let tries=0;tries<100&&images().length!==2;tries++)
    await new Promise(resolve=>setTimeout(resolve,10));
  assert.deepEqual(app.downloads, [{ bucket: 'class-materials', path: imagePath }]);
  assert.deepEqual(types, ['image/svg+xml']);
  assert.equal(app.document.querySelectorAll('img[src="blob:https://class.test/fixture-image"]').length, 2);
  assert.ok(app.window.localStorage.getItem('classroom-study:' + student.id + ':machine-learning'));
  assert.deepEqual(app.diagnostics, []);
});

test('A late private script cannot mark a lesson as opened under a replacement account', async t => {
  let entered;
  const started = new Promise(resolve => { entered = resolve; });
  const body = '<section class="lesson-body" id="top"><h1>Protected fixture</h1></section>';
  const app = page(t, route, {
    signIn: student, rpc: lessonData(body, [scriptPath]),
    download: async () => ({ data: new Blob(['// lesson fixture']), error: null }),
    script: node => entered(node),
  });
  app.window.URL.createObjectURL = () => 'blob:https://class.test/fixture-script';
  app.window.URL.revokeObjectURL = () => {};
  const ready = app.boot();
  const node = await started;
  const events = [];
  app.document.addEventListener('class-notes-user', event => events.push(event.detail.userId));
  const replacement = { id: 'other-student', email: 'other@example.test' };
  app.changeUser(replacement);
  node.onload();
  await ready;
  assert.deepEqual(events, []);
  assert.equal(app.window.localStorage.getItem('classroom-study:' + replacement.id + ':machine-learning'), null);
  assert.ok(!app.document.querySelector('.lesson-body'));
  assert.deepEqual(app.diagnostics, []);
  // JSDOM cannot actually reload on the cross-tab identity change.
  assert.ok(app.browserErrors.every(error => error.type === 'not implemented'));
});
