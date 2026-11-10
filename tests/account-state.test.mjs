import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createAccountController } from '../web/assets/account-controller.mjs';
import { accountContinueURL, accountMenuPosition } from '../web/assets/account-model.mjs';
import { saveBeforeSignOut } from '../web/assets/sign-out-service.mjs';

const links = { account: '../account/', dashboard: '../dashboard/', review: '../review/', teacher: '../instructor/' };
const user = { id: 'student', email: 'student@example.test', user_metadata: { full_name: 'Student Example', token: 'DO_NOT_STORE' } };
const turn = () => new Promise(setImmediate);
const create = () => createAccountController({ links, documentURL: 'https://class.test/course/account/' });
function deferred() { let resolve; const promise = new Promise(done => { resolve = done; }); return { promise, resolve }; }

test('Account snapshots stay neutral in SSR and contain only projected identity, never session data or membership grants', () => {
  const port = create(), initial = port.getServerSnapshot();
  port.update({ ready: true, user: { ...user, access_token: 'DO_NOT_STORE', membership: 'teacher' } });
  const view = port.getSnapshot();
  assert.equal(view.phase, 'authenticated'); assert.equal(view.teacher, false);
  assert.equal(view.identity.name, 'Student Example');
  assert.doesNotMatch(JSON.stringify(view), /DO_NOT_STORE|access_token|membership/);
  assert.equal(port.getServerSnapshot(), initial); assert.equal(initial.phase, 'loading');
  assert.throws(() => { view.identity.name = 'changed'; }, TypeError);
  port.update({ ready: true, user: null, teacher: true });
  assert.equal(port.getSnapshot().identity, null); assert.equal(port.getSnapshot().teacher, false); port.dispose();
});

test('Actions are guarded by phase and deduplicated while a provider callback is pending', async () => {
  const port = create(), pending = deferred(); let starts = 0, exits = 0;
  port.configure({ onSignIn: async () => { starts++; await pending.promise; }, onSignOut: async () => { exits++; } });
  assert.equal(await port.signIn(), false);
  port.update({ ready: true });
  const first = port.signIn(); assert.equal(await port.signIn(), false); assert.equal(starts, 1);
  pending.resolve(); await first;
  assert.equal(await port.signOut(), false);
  port.update({ ready: true, user }); await port.signOut(); assert.equal(exits, 1);
  port.update({ ready: true, error: true }); assert.equal(await port.signIn(), false); port.dispose();
});

test('A failed draft save requires an explicit decision; cancel never calls the auth exit', async () => {
  const port = create(); port.update({ ready: true, user }); let exits = 0;
  port.configure({ onSignIn: async () => {}, onSignOut: () => saveBeforeSignOut({
    save: async () => ({ saved: false, localSaved: true }), confirm: port.confirmUnsaved,
    isCurrent: () => true, signOut: async () => { exits++; return {}; },
  }) });
  const cancel = port.signOut(); await turn();
  assert.equal(port.getSnapshot().dialog.localSaved, true); port.resolveConfirmation(false); await cancel;
  assert.equal(exits, 0); assert.equal(port.getSnapshot().busy, null);
  const leave = port.signOut(); await turn();
  port.resolveConfirmation(true); await leave; assert.equal(exits, 1); port.dispose();
});

test('Switching owner while confirmation is open cancels it and prevents signing out the replacement account', async () => {
  const port = create(); port.update({ ready: true, user }); let exits = 0, current = true;
  port.configure({ onSignIn: async () => {}, onSignOut: () => saveBeforeSignOut({
    save: async () => ({ saved: false }), confirm: port.confirmUnsaved, isCurrent: () => current,
    signOut: async () => { exits++; return {}; },
  }) });
  const result = port.signOut(); await turn();
  assert.ok(port.getSnapshot().dialog); current = false;
  port.update({ ready: true, user: { ...user, id: 'replacement', email: 'replacement@example.test' } });
  port.resolveConfirmation(true); await result;
  assert.equal(exits, 0); assert.equal(port.getSnapshot().dialog, null);
  assert.equal(port.getSnapshot().identity.email, 'replacement@example.test'); port.dispose();
});

test('Confirmation resolves safely even when a subscriber responds synchronously; disposal clears identity', async () => {
  const port = create(); port.update({ ready: true, user });
  const off = port.subscribe(() => { if (port.getSnapshot().dialog) port.resolveConfirmation(true); });
  assert.equal(await port.confirmUnsaved({}), true); off();
  const pending = port.confirmUnsaved({}); port.dispose(); assert.equal(await pending, false);
  assert.equal(port.getSnapshot().identity, null); assert.equal(port.getSnapshot().phase, 'loading');
});

test('Account continue links cannot leave the app prefix, return to account, or contain credentials and encoded traversal', () => {
  const doc = 'https://class.test/course/account/';
  const fallback = 'https://class.test/course/dashboard/';
  for (const value of ['https://evil.test/', '//evil.test/', 'javascript:alert(1)', '/elsewhere/', '/course/account', '/course/account/', '/course/%2e%2e%2felsewhere/', 'https://user:pass@class.test/course/note/']) {
    assert.equal(accountContinueURL(value, links, doc), fallback, value);
  }
  assert.equal(accountContinueURL('/course/quiz/ml/note/?attempt=1', links, doc), 'https://class.test/course/quiz/ml/note/?attempt=1');
});

test('Account popup positioning fits narrow viewports and opens above the trigger when space below is scarce', () => {
  const mobile = accountMenuPosition({ top: 20, bottom: 64, right: 310 }, { width: 320, height: 700 }, 360);
  assert.ok(mobile.left >= 12); assert.ok(mobile.left + mobile.width <= 308); assert.ok(mobile.top + mobile.maxHeight <= 688);
  const above = accountMenuPosition({ top: 550, bottom: 590, right: 250 }, { width: 320, height: 620 }, 300);
  assert.ok(above.top < 550); assert.ok(above.top + Math.min(300, above.maxHeight) <= 540);
});
