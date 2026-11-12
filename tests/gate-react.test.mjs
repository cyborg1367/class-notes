import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { evaluateBuiltModule } from './helpers/built-module.mjs';

const baseURL = 'https://class.test/class-notes/';

test('GateCard paints membership actions and reports a failed request', async t => {
  const dom = new JSDOM(`<!doctype html><html><head>
    <script data-site-ui src="${baseURL}assets/site-shell.js"></script></head>
    <body><div id="root"></div></body></html>`,
    { url: baseURL, runScripts: 'outside-only', pretendToBeVisual: true });
  const { window } = dom, host = window.document.getElementById('root');
  const shell = await evaluateBuiltModule(dom, 'site-shell.js');
  const { mountGate } = await shell.loadGate();
  const ui = mountGate(host);
  t.after(() => { ui.dispose(); window.ClassNotesSiteUI?.dispose(); window.close(); });
  let requests = 0;
  ui.render({
    title: 'عضویت در کلاس',
    body: 'برای این کلاس درخواست عضویت بده؛ دسترسی پس از تأیید مدرس فعال می‌شود.',
    actions: [
      { label: 'درخواست دسترسی به کلاس', primary: true, onClick: async () => { requests++; throw Error('این اعلان تغییر کرده است'); } },
      { label: 'داشبورد ←', href: baseURL + 'dashboard/' },
    ],
  });
  assert.equal(host.querySelector('h2').textContent, 'عضویت در کلاس');
  host.querySelector('.button-forest').click();
  // React commits asynchronously. Wait for the observable result rather than
  // assuming a 20 ms scheduler turn, especially beside parallel browser tests.
  const deadline = Date.now() + 2_000;
  while (!host.querySelector('[data-gate-status]').textContent && Date.now() < deadline) {
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  assert.equal(requests, 1);
  assert.match(host.querySelector('[data-gate-status]').textContent, /این اعلان تغییر کرده/);
});
