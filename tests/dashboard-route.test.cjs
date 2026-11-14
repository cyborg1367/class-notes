const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createDashboardRoute } = require('../web/assets/portal.js');
function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
function fixture() {
  const events = [], controllers = [], renderers = [], bindings = [], failures = [];
  let context = { generation: 1, user: { id: 'student-a' }, state: null, serviceError: null };
  let host = { isConnected: true };
  const feature = {
    mountDashboard() {
      const renderer = { disposed: 0, render() {}, dispose() { this.disposed++; } };
      renderers.push(renderer); events.push('renderer'); return renderer;
    },
    createDashboardController(ports) {
      bindings.push(ports);
      const controller = { loads: 0, disposed: 0,
        async load() { this.loads++; }, dispose() { this.disposed++; ports.renderer.dispose(); } };
      controllers.push(controller); events.push('controller'); return controller;
    },
  };
  const ports = {
    host: () => host, context: () => context, catalog: [], rpc: async () => null,
    loadFeature: async () => { events.push('import'); return feature; },
    refreshAccess: async () => { events.push('refresh'); },
    afterAccessRefresh: () => { events.push('shared'); },
    releaseFallback: () => { events.push('release'); },
    unavailable: async (node, isCurrent) => { if (isCurrent()) failures.push(node); },
    studyFor: () => ({ last: null, opened: [] }), login: () => '/account/', link: value => '/' + value,
    storage: { read: () => null, write() {} },
  };
  return { ports, feature, events, controllers, renderers, bindings, failures,
    setContext(value) { context = value; }, setHost(value) { host = value; },
    changeAccount() { context = { ...context, generation: context.generation + 1, user: { id: 'student-b' } }; } };
}

test('dashboard startup shares the pending feature import and reuses the mounted controller', async () => {
  const f = fixture(), module = deferred();
  let imports = 0;
  f.ports.loadFeature = () => { imports++; return module.promise; };
  const route = createDashboardRoute(f.ports), first = route.mount(), second = route.mount();
  assert.equal(first, second); assert.equal(imports, 1);
  module.resolve(f.feature); await first; await route.mount();
  assert.equal(f.controllers.length, 1); assert.equal(f.controllers[0].loads, 2);
  route.reset(); route.reset(); assert.equal(f.controllers[0].disposed, 1); assert.equal(f.renderers[0].disposed, 1);
});

test('reset during lazy loading prevents the previous account from attaching a renderer', async () => {
  const f = fixture(), module = deferred(); f.ports.loadFeature = () => module.promise;
  const route = createDashboardRoute(f.ports), task = route.mount();
  route.reset(); f.changeAccount(); module.resolve(f.feature); await task;
  assert.equal(f.renderers.length, 0); assert.deepEqual(f.failures, []);
  f.ports.loadFeature = async () => f.feature;
  await route.mount(); assert.equal(f.controllers.length, 1); assert.equal(f.bindings[0].isCurrent(), true);
});

test('a late rejection from an old import cannot clear the replacement pending mount', async () => {
  const f = fixture(), old = deferred(), next = deferred(); let calls = 0;
  f.ports.loadFeature = () => ++calls === 1 ? old.promise : next.promise;
  const route = createDashboardRoute(f.ports), first = route.mount();
  route.reset(); f.changeAccount(); const second = route.mount(); old.reject(Error('old network error')); await first;
  assert.equal(route.mount(), second); assert.equal(calls, 2); assert.deepEqual(f.failures, []);
  next.resolve(f.feature); await second; assert.equal(f.controllers.length, 1);
});

test('account generation and identity both guard an unresolved dashboard import', async () => {
  for (const context of [
    { generation: 2, user: { id: 'student-a' } },
    { generation: 1, user: { id: 'student-b' } },
  ]) {
    const f = fixture(), module = deferred(); f.ports.loadFeature = () => module.promise;
    const route = createDashboardRoute(f.ports), task = route.mount();
    f.setContext(context); module.resolve(f.feature); await task;
    assert.equal(f.controllers.length, 0);
  }
});

test('reset disposes an in-flight controller once and its late failure cannot show an error', async () => {
  const f = fixture(), load = deferred(), create = f.feature.createDashboardController;
  f.feature.createDashboardController = ports => { const c = create(ports); c.load = () => load.promise; return c; };
  const route = createDashboardRoute(f.ports), task = route.mount(); await Promise.resolve();
  assert.equal(f.controllers.length, 1); route.reset(); load.reject(Error('old data error')); await task;
  assert.equal(f.controllers[0].disposed, 1); assert.equal(f.renderers[0].disposed, 1); assert.deepEqual(f.failures, []);
});

test('module failure reports a current route error and permits a later clean mount', async () => {
  const f = fixture(); let fail = true;
  f.ports.loadFeature = async () => { if (fail) throw Error('asset offline'); return f.feature; };
  const route = createDashboardRoute(f.ports); await route.mount();
  assert.equal(f.failures.length, 1); assert.equal(f.renderers.length, 0);
  fail = false; await route.mount(); assert.equal(f.controllers.length, 1);
});

test('a controller construction error releases the renderer before fallback and retry', async () => {
  const f = fixture(), create = f.feature.createDashboardController;
  f.feature.createDashboardController = () => { throw Error('startup failure'); };
  const route = createDashboardRoute(f.ports); await route.mount();
  assert.equal(f.renderers[0].disposed, 1); assert.equal(f.failures.length, 1);
  f.feature.createDashboardController = create; await route.mount();
  assert.equal(f.renderers.length, 2); assert.equal(f.controllers.length, 1);
});

test('changing account while creating a renderer releases it without creating a controller', async () => {
  const f = fixture(), mount = f.feature.mountDashboard;
  f.feature.mountDashboard = () => { const result = mount(); f.changeAccount(); return result; };
  await createDashboardRoute(f.ports).mount();
  assert.equal(f.renderers[0].disposed, 1); assert.equal(f.controllers.length, 0);
});

test('shared services refresh only for the current account, including after awaited access refresh', async () => {
  const f = fixture(), refresh = deferred(); f.ports.refreshAccess = () => { f.events.push('refresh'); return refresh.promise; };
  const route = createDashboardRoute(f.ports); await route.mount();
  const task = f.bindings[0].refreshAccess(); route.reset(); f.changeAccount(); refresh.resolve(); await task;
  await f.bindings[0].refreshAccess();
  assert.equal(f.events.filter(e => e === 'refresh').length, 1); assert.equal(f.events.includes('shared'), false);
  f.ports.refreshAccess = async () => {};
  await route.mount(); await f.bindings[1].refreshAccess(); assert.equal(f.events.filter(e => e === 'shared').length, 1);
});

test('a new dashboard host disposes the old root before creating its replacement', async () => {
  const f = fixture(), route = createDashboardRoute(f.ports); await route.mount();
  f.setHost({ isConnected: true }); await route.mount();
  assert.equal(f.controllers[0].disposed, 1); assert.equal(f.controllers.length, 2); assert.equal(f.bindings[0].isCurrent(), false);
});

test('an absent or detached route never starts a renderer and losing the host releases the root', async () => {
  const f = fixture(), route = createDashboardRoute(f.ports); f.setHost(null); await route.mount();
  assert.deepEqual(f.events, []); f.setHost({ isConnected: false }); await route.mount(); assert.equal(f.renderers.length, 0);
  f.setHost({ isConnected: true }); await route.mount(); f.setHost(null); await route.mount();
  assert.equal(f.controllers[0].disposed, 1);
});

test('an asynchronously loaded error view cannot attach after its route is reset', async () => {
  const f = fixture(), gate = deferred();
  f.ports.loadFeature = async () => { throw Error('asset offline'); };
  f.ports.unavailable = async (host, current) => { await gate.promise; if (current()) f.failures.push(host); };
  const route = createDashboardRoute(f.ports), task = route.mount(); await Promise.resolve();
  route.reset(); f.changeAccount(); gate.resolve(); await task; assert.deepEqual(f.failures, []);
});

test('replacing a failed route host releases its fallback even before another import succeeds', async () => {
  const f = fixture(); f.ports.loadFeature = async () => { throw Error('offline'); };
  const route = createDashboardRoute(f.ports); await route.mount();
  const next = deferred(); f.ports.loadFeature = () => next.promise;
  f.setHost({ isConnected: true }); const task = route.mount();
  assert.equal(f.events.filter(e => e === 'release').length, 1);
  next.resolve(f.feature); await task; assert.equal(f.controllers.length, 1);
});
