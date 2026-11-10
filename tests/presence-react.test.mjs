import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { evaluateBuiltModule } from './helpers/built-module.mjs';
import { presenceMembers } from '../web/assets/classroom-presence.mjs';

const baseURL = 'https://class.test/class-notes/';
async function wait(predicate, label = 'Presence did not settle') {
  const end = Date.now() + 3000;
  while (!predicate()) {
    if (Date.now() > end) assert.fail(label);
    await new Promise(resolve => setTimeout(resolve, 12));
  }
}

test('presenceMembers drops self, duplicates, emails and control characters', () => {
  assert.deepEqual(presenceMembers([
    { id: 'self', name: 'Me' }, { id: 'a', name: 'علی' }, { id: 'a', name: 'again' },
    { id: 'b', name: 'x@y' }, { id: 'c', name: 'bad\nname' }, { id: 1, name: 'no' },
  ], 'self').map(item => [item.id, item.name]), [['a', 'علی'], ['b', 'هم‌کلاسی'], ['c', 'badname']]);
});

test('React presence lists peers, switches courses and records visibility', async t => {
  const dom = new JSDOM(`<!doctype html><html lang="fa" dir="rtl"><head>
    <script data-site-ui src="${baseURL}assets/site-shell.js"></script></head>
    <body><div id="anchor"></div><div id="account"></div></body></html>`,
    { url: baseURL + 'account/', runScripts: 'outside-only', pretendToBeVisual: true });
  const { window } = dom, { document: doc } = window, $ = selector => doc.querySelector(selector);
  const calls = [], channels = [];
  const client = {
    realtime: { setAuth: async () => {} },
    channel(name) {
      channels.push(name);
      return { on() { return { subscribe(status) { status('SUBSCRIBED'); return {}; } }; } };
    },
    async removeChannel() {},
  };
  const shell = await evaluateBuiltModule(dom, 'site-shell.js');
  const { mountPresence } = await shell.loadPresence();
  const ui = mountPresence({
    client, userId: 'self',
    courses: [{ id: 'machine-learning', title: 'یادگیری ماشین' }, { id: 'other', title: 'کلاس دیگر' }],
    courseId: 'machine-learning',
    anchor: $('#anchor'), account: $('#account'),
    storage: window.localStorage,
    rpc: async (name, args) => {
      calls.push({ name, args: structuredClone(args) });
      if (name === 'classroom_presence') return { members: [{ id: 'peer', name: 'سارا' }], visible: true };
      if (name === 'classroom_presence_visibility') return { visible: args.p_visible };
      return {};
    },
  });
  t.after(() => { ui.dispose(); window.ClassNotesSiteUI?.dispose(); window.close(); });
  await wait(() => $('[data-react-presence] [data-presence-label]')?.textContent.includes('سارا') ||
    $('[data-react-presence] li')?.textContent.includes('سارا'));
  assert.match($('[data-presence-label]').textContent, /۱/);
  assert.equal($('[data-react-presence] li').textContent, 'سارا');
  assert.equal($('[data-presence-settings] input').checked, true);
  $('[data-react-presence] select').value = 'other';
  $('[data-react-presence] select').dispatchEvent(new window.Event('change', { bubbles: true }));
  await wait(() => calls.some(call => call.name === 'classroom_presence' && call.args.p_action === 'leave'));
  $('[data-presence-settings] input').click();
  await wait(() => calls.some(call => call.name === 'classroom_presence_visibility' && call.args.p_visible === false));
  ui.dispose();
  assert.equal($('[data-react-presence-root]'), null);
  assert.equal($('[data-react-presence]'), null);
});
