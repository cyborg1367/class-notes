const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createClassroomBootstrap, createClassroomTransport, connectAuthProvider, createAuthSession,
  createPublicConfiguration, createPageLifecycle } = require('../web/assets/portal.js');
const parameters = { p_page: 'dashboard', p_lesson: null, p_mission: null, p_missions: [] };
const state = { memberships: [], results: [] };
const defer = () => { let resolve; const promise = new Promise(done => { resolve = done; }); return { promise, resolve }; };

test('the compiled portal preserves a synchronous Node helper API without browser side effects', () => {
  assert.equal(typeof createClassroomTransport, 'function');
  assert.equal(typeof createAuthSession, 'function');
});

test('bootstrap uses the bundled response without a second state request', async () => {
  const calls = [], bundle = { state, labs: {} };
  const service = createClassroomBootstrap(async name => { calls.push(name); return bundle; });
  assert.deepEqual(await service.load(parameters), { bundle, state });
  assert.deepEqual(calls, ['classroom_bootstrap']);
});

test('only a missing bootstrap switches this document to the older backend contract', async () => {
  const calls = [];
  const service = createClassroomBootstrap(async name => {
    calls.push(name);
    if (name === 'classroom_bootstrap') throw { code: 'PGRST202', message: 'missing classroom_bootstrap' };
    return state;
  });
  assert.deepEqual(await service.load(parameters), { bundle: null, state });
  await service.load(parameters);
  assert.deepEqual(calls, ['classroom_bootstrap', 'classroom_state', 'classroom_state']);
});

test('network errors and malformed bootstrap payloads never enable fallback', async () => {
  for (const response of [null, { state: null }, { state: { memberships: [] } }, Error('offline')]) {
    const calls = [], service = createClassroomBootstrap(async name => {
      calls.push(name); if (response instanceof Error) throw response; return response;
    });
    await assert.rejects(service.load(parameters));
    await assert.rejects(service.load(parameters));
    assert.deepEqual(calls, ['classroom_bootstrap', 'classroom_bootstrap']);
  }
});

test('the classroom startup deadline aborts its SDK request and remains retryable', async () => {
  let signal;
  const pending = Object.assign(new Promise(() => {}), { abortSignal(value) { signal = value; return this; } });
  const service = createClassroomTransport({ page: 'dashboard', timeout: 10, client: () => ({ rpc: () => pending }) });
  await assert.rejects(service.call('classroom_bootstrap'), /CLASSROOM_STATE_TIMEOUT/);
  assert.equal(signal.aborted, true);
  assert.equal(service.snapshot()[0].error, true);
});

test('the classroom transport resolves the current client when dispatching and preserves backend errors', async () => {
  const error = { code: 'CLASS_ACCESS_REQUIRED' };
  let client = { rpc: async () => ({ data: 'first', error: null }) };
  const service = createClassroomTransport({ page: 'lesson', client: () => client });
  assert.equal(await service.call('classroom_state'), 'first');
  client = { rpc: async () => ({ data: null, error }) };
  await assert.rejects(service.call('classroom_state'), value => value === error);
});

test('provider creation keeps PKCE and the existing root/project session storage key', () => {
  for (const base of ['/', '/class-notes/']) {
    let received;
    const client = {}, provider = { createClient(...args) { received = args; return client; } };
    const config = { supabaseUrl: 'https://project.supabase.co', publishableKey: 'sb_publishable_test' };
    assert.equal(connectAuthProvider(provider, config, base), client);
    assert.equal(received[2].auth.storageKey, 'class-notes-auth:' + base);
    assert.equal(received[2].auth.flowType, 'pkce');
    assert.equal(received[2].auth.detectSessionInUrl, true);
  }
  assert.throws(() => connectAuthProvider({}, { supabaseUrl: 'http://wrong.test', publishableKey: 'secret' }, '/'), /INVALID_PUBLIC_CONFIG/);
});

test('session listeners unsubscribe exactly once and ignore callbacks after disposal', async () => {
  let callback, removed = 0, received = 0;
  const session = { user: { id: 'sample' } }, service = createAuthSession({
    getSession: async () => ({ data: { session }, error: null }),
    onAuthStateChange(fn) { callback = fn; return { data: { subscription: { unsubscribe() { removed++; } } } }; },
  });
  assert.equal(await service.resolve(), session);
  service.subscribe(() => { received++; }); callback('SIGNED_IN', session);
  service.dispose(); service.dispose(); callback('SIGNED_OUT', null);
  assert.equal(received, 1); assert.equal(removed, 1);
  await assert.rejects(service.resolve(), /ACCOUNT_CHANGED/);
});

test('a disposed session cannot accept a delayed SDK session and stalled sessions have a deadline', async () => {
  const pending = defer(), service = createAuthSession({ getSession: () => pending.promise, onAuthStateChange() {} });
  const result = service.resolve(); service.dispose(); pending.resolve({ data: { session: { user: { id: 'old' } } } });
  await assert.rejects(result, /ACCOUNT_CHANGED/);
  const stalled = createAuthSession({ getSession: () => new Promise(() => {}), onAuthStateChange() {} }, 10);
  await assert.rejects(stalled.resolve(), /AUTH_SESSION_TIMEOUT/);
});

test('public configuration shares successful reads, retries failures and passes an abort signal', async () => {
  let calls = 0, options;
  const load = createPublicConfiguration(async (_url, request) => {
    calls++; options = request;
    return { ok: calls > 1, json: async () => ({ public: true }) };
  });
  await assert.rejects(load('config?v=1'), /PUBLIC_CONFIG_UNAVAILABLE/);
  const first = load('config?v=1'), second = load('config?v=1');
  assert.equal(first, second); assert.deepEqual(await first, { public: true });
  assert.equal(calls, 2); assert.ok(options.signal); assert.equal(options.credentials, 'same-origin');
});

test('the page lifecycle preserves shared-service and route startup order', async () => {
  const calls = [], page = createPageLifecycle({ routes: { lesson: async () => { calls.push('lesson'); } },
    before: () => { calls.push('before'); }, after: () => { calls.push('after'); }, cleanups: [] });
  await page.mount('lesson'); assert.deepEqual(calls, ['before', 'lesson', 'after']);
});

test('an account reset while startup waits cannot mount the previous identity', async () => {
  const pending = defer(), calls = [], page = createPageLifecycle({ before: () => pending.promise,
    routes: { dashboard: () => { calls.push('dashboard'); } }, after: () => { calls.push('after'); },
    cleanups: [() => { calls.push('cleanup'); }] });
  const mount = page.mount('dashboard'); page.reset(); pending.resolve(); await mount;
  assert.deepEqual(calls, ['cleanup']);
});

test('account cleanup attempts every owned resource and remains usable for another account', () => {
  const calls = [], failure = Error('dispose failed'), page = createPageLifecycle({ routes: {}, cleanups: [
    () => { calls.push('one'); throw failure; }, () => { calls.push('two'); },
  ] });
  assert.throws(() => page.reset(), value => value === failure);
  assert.throws(() => page.reset(), value => value === failure);
  assert.deepEqual(calls, ['one','two','one','two']);
});
