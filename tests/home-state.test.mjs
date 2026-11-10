import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createHomeController } from '../web/assets/home-service.mjs';
import { INITIAL_HOME_VIEW, projectHomeView } from '../web/assets/home-view-model.mjs';
import { getViewChannel } from '../web/assets/view-channel.mjs';
import { HOME_ORIENTATION, SAMPLE_POINTS, orbit, projectPoint } from '../frontend/home/domain/feature-space.ts';
const require = createRequire(import.meta.url);
const originalSpace = require('../web/assets/space3d.js');
const links = { account: '/account/', dashboard: '/dashboard/' };

function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

test('Home DTO distinguishes pending auth, guests, signed-in accounts and failure without retaining private identity', () => {
  assert.equal(projectHomeView({ ready: false, userId: 'old-id' }, links).phase, 'loading');
  assert.equal(projectHomeView({ ready: true }, links).phase, 'guest');
  assert.equal(projectHomeView({ ready: true, error: true }, links).phase, 'error');
  const signedIn = projectHomeView({ ready: true, userId: 'new-id', memberships: [], user_metadata: { name: 'Hidden' }, results: [{ score: 9 }] }, links);
  assert.equal(signedIn.phase, 'authenticated');
  assert.doesNotMatch(JSON.stringify(signedIn), /new-id|Hidden|memberships|results|score|token/);
  assert.equal(INITIAL_HOME_VIEW.phase, 'loading');
});

test('Home sign-in delegates once and never starts from a loading, failed or authenticated view', async () => {
  const host = { isConnected: true }, waiting = deferred();
  let context = { ready: true }, calls = 0;
  const controller = createHomeController({ host, readContext: () => context, links, isCurrent: () => true, onSignIn: () => { calls++; return waiting.promise; } });
  const channel = getViewChannel(host, INITIAL_HOME_VIEW);
  const first = channel.perform('sign-in'), repeated = channel.perform('sign-in');
  await Promise.resolve(); await Promise.resolve();
  assert.equal(calls, 1); assert.equal(channel.getSnapshot().busy, true);
  assert.equal(await repeated, false);
  context = { ready: true, userId: 'student' }; controller.update();
  assert.equal(channel.getSnapshot().phase, 'authenticated');
  waiting.resolve(); await first;
  assert.equal(channel.getSnapshot().busy, false);
  for (const next of [{ ready: false }, { ready: true, error: true }, { ready: true, userId: 'student' }]) {
    context = next; controller.update(); assert.equal(await channel.perform('sign-in'), false);
  }
  assert.equal(calls, 1); controller.dispose();
});

test('Home actions are rechecked after queuing; disconnecting or disposing cannot overwrite a replacement controller', async () => {
  const host = { isConnected: true }, waiting = deferred();
  let context = { ready: true }, calls = 0;
  const options = { host, readContext: () => context, links, isCurrent: () => true, onSignIn: () => { calls++; return waiting.promise; } };
  const old = createHomeController(options), channel = getViewChannel(host, INITIAL_HOME_VIEW);
  const obsoleteClick = channel.perform('sign-in'); context = { ready: true, userId: 'other' };
  assert.equal(await obsoleteClick, false); assert.equal(calls, 0);
  context = { ready: true }; old.update(); const pending = channel.perform('sign-in');
  await Promise.resolve(); await Promise.resolve();
  const replacement = createHomeController({ ...options, readContext: () => ({ ready: true, userId: 'replacement' }) });
  old.dispose(); waiting.resolve(); await pending;
  assert.equal(channel.getSnapshot().phase, 'authenticated');
  host.isConnected = false; assert.equal(await channel.perform('sign-in'), false);
  replacement.dispose(); assert.equal(channel.getSnapshot().phase, 'loading');
});

test('A rejected sign-in recovers with visible feedback and remains retryable', async () => {
  const host = { isConnected: true }; let calls = 0;
  const controller = createHomeController({ host, links, isCurrent: () => true, readContext: () => ({ ready: true }), onSignIn: async () => { if (++calls === 1) throw Error('OFFLINE'); } });
  const channel = getViewChannel(host, INITIAL_HOME_VIEW);
  assert.equal(await channel.perform('sign-in'), false);
  assert.ok(channel.getSnapshot().errorMessage); assert.equal(channel.getSnapshot().busy, false);
  assert.equal(await channel.perform('sign-in'), true);
  assert.equal(channel.getSnapshot().errorMessage, ''); controller.dispose();
});

test('The React feature-space projection matches the existing illustration and never changes sample coordinates', () => {
  const before = JSON.stringify(SAMPLE_POINTS);
  for (const yaw of [-3, -0.62, 0, 2.8]) for (const pitch of [-1.1, 0.36, 1.1]) {
    for (const point of SAMPLE_POINTS) assert.deepEqual(projectPoint(point, { yaw, pitch }), originalSpace.projectSpace(point, yaw, pitch));
  }
  let orientation = { ...HOME_ORIENTATION };
  for (let index = 0; index < 100; index++) orientation = orbit(orientation, 10, 10);
  assert.ok(orientation.yaw >= -Math.PI && orientation.yaw <= Math.PI); assert.equal(orientation.pitch, 1.1);
  assert.equal(orbit(orientation, -100, -100).pitch, -1.1);
  assert.equal(JSON.stringify(SAMPLE_POINTS), before);
});
