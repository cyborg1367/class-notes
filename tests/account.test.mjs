import fs from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { accountIdentity, accountMarkup, saveBeforeSignOut } from '../web/assets/account-menu.mjs';
import { createRequire } from 'node:module';
const { portalReturn } = createRequire(import.meta.url)('../web/assets/portal.js');
const urls = { account: 'https://class.test/notes/account/', dashboard: 'https://class.test/notes/dashboard/', teacher: 'https://class.test/notes/instructor/' };
const user = { id: 'student', email: 'student@example.com', user_metadata: { full_name: 'سارا احمدی', avatar_url: 'https://example.com/avatar.jpg' } };
test('unresolved sessions stay neutral, resolved guests see Google and members see dashboard and logout', () => {
    const loading = accountMarkup({ ready: false }, urls, 'menu');
    assert.ok(!loading.includes('data-account-signin'));
    const guest = accountMarkup({ ready: true }, urls, 'menu');
    assert.ok(guest.includes('data-account-signin'));
    assert.ok(!guest.includes('data-account-signout'));
    const member = accountMarkup({ ready: true, user }, urls, 'menu');
    assert.ok(!member.includes('data-account-signin'));
    assert.ok(member.includes('داشبورد من'));
    assert.ok(member.includes('data-account-signout'));
    assert.ok(!member.includes(urls.teacher));
    const teacher = accountMarkup({ ready: true, user, teacher: true }, urls, 'menu');
    assert.ok(teacher.includes(urls.teacher));
});
test('identity metadata is escaped and image URLs cannot use executable or credentialed schemes', () => {
    const hostile = { email: '<b>@example.com', user_metadata: { full_name: '<img src=x onerror=alert(1)>', avatar_url: 'javascript:alert(1)' } };
    assert.equal(accountIdentity(hostile).avatar, '');
    assert.equal(accountIdentity({ user_metadata: { avatar_url: 'https://user:pass@example.com/' } }).avatar, '');
    const html = accountMarkup({ ready: true, user: hostile }, urls, 'menu');
    assert.ok(!html.includes('<img src=x'));
    assert.ok(html.includes('&lt;img'));
    assert.equal(accountIdentity({ email: 'student@example.com' }).name, 'student');
});
test('OAuth return targets stay inside the site and account callbacks fall back to dashboard', () => {
    const base = new URL('https://class.test/notes/');
    for (const target of ['https://evil.test/', '/other/', 'https://class.test/notes/account/', 'https://class.test/notes/%2e%2e/private'])
        assert.equal(portalReturn(target, base), urls.dashboard);
    const lesson = 'https://class.test/notes/lab/machine-learning/evaluating-knn/';
    assert.equal(portalReturn(lesson, base), lesson);
});
test('logout waits for the draft before revoking the current browser session', async () => {
    const calls = [];
    let finish;
    const task = saveBeforeSignOut({ save: () => new Promise(resolve => { finish = resolve; }), confirm: async () => { throw Error('Unexpected confirmation'); }, isCurrent: () => true, signOut: async () => { calls.push('signout'); return {}; } });
    await Promise.resolve();
    assert.deepEqual(calls, []);
    finish({ saved: true });
    assert.equal(await task, true);
    assert.deepEqual(calls, ['signout']);
});
test('failed saving offers a real choice, cancellation keeps the account signed in', async () => {
    let confirmed = 0, exits = 0;
    const options = { save: async () => ({ saved: false, localSaved: true }), confirm: async (result) => { confirmed++; assert.equal(result.localSaved, true); return false; }, isCurrent: () => true, signOut: async () => { exits++; return {}; } };
    assert.equal(await saveBeforeSignOut(options), false);
    assert.equal(exits, 0);
    assert.equal(await saveBeforeSignOut({ ...options, confirm: async () => true }), true);
    assert.equal(exits, 1);
    assert.equal(confirmed, 1);
});
test('account switches during save or confirmation never log out the replacement account', async () => {
    let current = true, exits = 0;
    const options = { save: async () => { current = false; return { saved: true }; }, isCurrent: () => current, confirm: async () => true, signOut: async () => { exits++; return {}; } };
    assert.equal(await saveBeforeSignOut(options), false);
    assert.equal(exits, 0);
    current = true;
    assert.equal(await saveBeforeSignOut({ ...options, save: async () => ({ saved: false }), confirm: async () => { current = false; return true; } }), false);
    assert.equal(exits, 0);
});
test('save timeout can be cancelled and authentication failures remain visible to the caller', async () => {
    let exits = 0;
    assert.equal(await saveBeforeSignOut({ save: () => new Promise(() => { }), timeout: 5, confirm: async () => false, isCurrent: () => true, signOut: async () => { exits++; return {}; } }), false);
    assert.equal(exits, 0);
    await assert.rejects(() => saveBeforeSignOut({ save: async () => ({ saved: true }), confirm: async () => true, isCurrent: () => true, signOut: async () => ({ error: Error('AUTH_OFFLINE') }) }), /AUTH_OFFLINE/);
});

test('every page shell loads account styling and starts with a neutral account fallback',()=>{
 const web=new URL('../web/',import.meta.url);
 for(const path of fs.readdirSync(web,{recursive:true}).filter(path=>path.endsWith('.html'))){
  const html=fs.readFileSync(new URL(path,web),'utf8');
  if(!html.includes('data-portal'))continue;
  assert.ok(html.includes('assets/account-menu.css?v=build'),path+' has no account styles');
  assert.ok(html.includes('data-account-link'),path+' has no account fallback');
  assert.ok(!/data-account-link[^>]*>ورود/.test(html),path+' flashes a guest-only label');
 }
});
