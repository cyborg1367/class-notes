import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
import { evaluateBuiltModule, evaluateClassicAsset } from './helpers/built-module.mjs';
import { readerFixtureSource, readerPreviewDocument } from '../frontend/reader-preview.mjs';

const id = 'machine-learning/prediction-problem';
const path = 'machine-learning/prediction/medical-k3-detail.svg';
const alias = path.replace('/prediction/', '/predictions/');
const pdf = 'machine-learning/prediction-problem-tutorial.pdf';
const base = 'http://class.test/class-notes/';
const payload = {
  body: `<section class="hero lesson-hero" id="top"><h1>متن خصوصی آزمایشی</h1><a href="#more">شروع مطالعه</a></section>
<div class="shell lesson-shell">
<aside class="lesson-rail"><ol class="rail-list"><li><a href="#start"><span class="rail-num">01</span> مقدمه</a></li><li><a href="#more">ادامه</a></li><li><a href="#exercise">تمرین قدیمی</a></li></ol>
<div class="reading-state"><span id="reading-label">۰٪ مطالعه شده</span><div><i id="sidebar-progress"></i></div></div></aside>
<article class="lesson-body">
<nav class="mobile-toc"><a href="#start">مقدمه</a><a href="#more">ادامه</a></nav>
<section class="lesson-section" id="start"><h2>مقدمه</h2><img data-private-path="${path}" src="https://bad.example/pixel" alt="نمودار نمونه">
<div class="code-block"><div class="code-head"><button class="copy-code" data-copy-code="code">کپی کد</button></div><pre id="code"><code>print("text")</code></pre></div>
</section>
<section class="lesson-section" id="more"><h2>ادامه</h2><span class="katex"><math><mi>x</mi></math></span>
<svg viewBox="0 0 10 10"><defs><clipPath id="clip"><rect width="8" height="8"/></clipPath></defs><g style="clip-path:url(#clip)"><circle r="4"/></g></svg></section>
<section id="exercise"><p>تمرین قدیمی</p></section><script id="sample-data" type="application/json">{"ok":true}</script>
<nav class="adjacent-lessons"><a href="../vector-distance/">یادداشت قبلی</a></nav>
<aside class="portal-quiz-link"><p>ادامهٔ مسیر</p><a class="button-forest" href="../../quiz/${id}/">آزمون</a><a class="button-outline" data-private-download="${pdf}" href="#">دریافت PDF</a></aside>
<footer class="lesson-footer"><a href="../">فهرست کلاس</a></footer></article></div>`,
  pdf_path: pdf, scripts: ['machine-learning/medical-knn.js'],
};
const tick = () => new Promise(resolve => setTimeout(resolve, 15));
async function until(predicate) {
  const end = Date.now() + 2500;
  for (let value; !(value = predicate());) {
    if (Date.now() > end) throw Error('Reader did not settle');
    await tick();
  }
}
function deferred() {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
}
function setup(t, { url = base + id + '/', html = fs.readFileSync('dist/' + id + '/index.html', 'utf8') } = {}) {
  const dom = new JSDOM(html, { url, runScripts: 'outside-only', pretendToBeVisual: true });
  const { window } = dom, { document } = window;
  const clipboard = [], files = [], revoked = [], anchors = [], scrolled = [];
  Object.defineProperty(window.navigator, 'clipboard', { value: { writeText: async value => { clipboard.push(value); } } });
  window.URL.createObjectURL = blob => {
    files.push(blob);
    return 'blob:' + window.location.origin + '/test-' + files.length;
  };
  window.URL.revokeObjectURL = url => revoked.push(url);
  window.HTMLElement.prototype.scrollIntoView = function () { scrolled.push(this.id); };
  window.HTMLAnchorElement.prototype.click = function () { if (this.hasAttribute('download')) anchors.push([this.download, this.href]); };
  const destroy = () => { window.ClassNotesSiteUI?.dispose(); window.close(); };
  return { dom, window, document, clipboard, files, revoked, anchors, scrolled, destroy };
}

async function fixture(t, { options, body = payload, lessonId = id, ...context } = {}) {
  const browser = setup(t, context), { dom, document, window } = browser;
  let controller;
  t.after(() => { controller?.dispose(); browser.destroy(); });
  const shell = await evaluateBuiltModule(dom, 'site-shell.js');
  await shell.ready;
  const { mountLessonReader } = await shell.loadLessonReader();
  const catalog = JSON.parse(document.getElementById('catalog-data').textContent);
  const course = catalog[0], lesson = course.lessons.find(item => item.id === lessonId);
  const calls = [], scripts = [];
  let read = 0;
  const root = document.getElementById('main');
  controller = mountLessonReader(root, {
    info: { ...lesson, course }, href: route => new URL(route, base).href,
    current: () => true, getFile: async (object, signal) => {
      calls.push([object, signal]);
      return new window.Blob(['file']);
    },
    loadScript: async url => { scripts.push(url); }, enhance() {}, onRead() { read++; },
    refreshAccess: async () => {}, retry() {}, ...options,
  });
  controller.render({ phase: 'ready', payload: body });
  const dispose = () => { controller?.dispose(); controller = null; };
  return { ...browser, root, calls, scripts, dispose, read: () => read, $: selector => root.querySelector(selector) };
}

test('React owns the paper reader controls while preserving the authored layout, formulas, data and resources', async t => {
  const { $, window, clipboard, calls, anchors, scrolled, read, files } = await fixture(t, { url: base + id + '/#more' });
  await until(() => $('.reader-copy') && read() === 1);
  assert.equal($('.lesson-hero .hero-copy h1').textContent, 'متن خصوصی آزمایشی');
  assert.equal($('.hero-actions .button-primary').getAttribute('href'), '#start');
  assert.ok($('.lesson-body .katex math'));
  assert.ok($('svg [style="clip-path:url(#clip)"]'));
  assert.equal($('#sample-data').type, 'application/json');
  assert.equal($('#exercise'), null);
  assert.equal($('.reader-rail-list a[href="#exercise"]'), null);
  assert.ok($('.rail-list').closest('[hidden]'));
  assert.ok($('.mobile-toc').closest('[hidden]'));
  assert.ok($('.reader-mobile-toc'));
  assert.equal($('.adjacent-lessons'), null);
  assert.equal($('[data-lesson-pager] [rel=prev]').href, base + 'machine-learning/vector-distance/');
  assert.equal($('[data-lesson-pager] [rel=next]').href, base + 'machine-learning/evaluating-knn/');
  assert.equal($('.portal-quiz-link a').href, base + 'quiz/' + id + '/');
  assert.equal($('.portal-quiz-link button').textContent, 'دریافت PDF ↓');
  assert.equal($('.portal-quiz-link').querySelectorAll('button').length, 2, 'add only the missing notebook link');
  await until(() => scrolled.includes('more'));
  const pos = (top, height = 100) => ({ top, bottom: top + height, height });
  $('#start').getBoundingClientRect = () => pos(-120);
  $('#more').getBoundingClientRect = () => pos(80);
  $('[data-reader-prose]').getBoundingClientRect = () => pos(-160, 1200);
  window.dispatchEvent(new window.Event('scroll'));
  await until(() => $('.reader-rail-list [aria-current=location]')?.getAttribute('href') === '#more');
  assert.equal($('.reader-mobile-toc [aria-current=location]').getAttribute('href'), '#more');
  assert.ok($('.reader-sidebar progress').value > 0);
  assert.equal($('.reader-sidebar progress').value, $('.reader-mobile-outline progress').value);
  $('.reader-copy').click();
  await until(() => $('.reader-copy').textContent === 'کپی شد');
  assert.deepEqual(clipboard, ['print("text")']);
  assert.ok(!calls.some(([path]) => path === pdf), 'private downloads are requested only on click');
  $('.portal-quiz-link button').click();
  await until(() => anchors.length);
  assert.equal(anchors[0][0], 'prediction-problem-tutorial.pdf');
  assert.ok(files.some(file => file.type === 'application/pdf'));
});

test('The exact legacy image alias is retried on 404; a widget error does not replace the article', async t => {
  const requested = [];
  const { $, window } = await fixture(t, { options: {
    getFile: async path => {
      requested.push(path);
      if (path.includes('/prediction/')) throw { statusCode: '404', message: 'Object not found' };
      if (path.endsWith('.js')) throw Error('offline');
      return new window.Blob(['image']);
    },
  } });
  await until(() => $('.reader-widget-note') && $('img[data-private-path]').src.startsWith('blob:'));
  assert.deepEqual(requested.filter(item => item.endsWith('.svg')), [path, alias]);
  assert.ok($('.lesson-body #more'));
  assert.ok($('.reader-copy'));
});

test('A taller header updates the reader offset and the active section is kept visible inside a long outline', async t => {
  const { $, document, window, scrolled } = await fixture(t);
  await until(() => $('.reader-sidebar a[aria-current="location"]')?.getAttribute('href') === '#start');
  const scope = $('[data-reader-template]');
  const outline = $('.reader-sidebar nav');
  const header = document.querySelector('.portal-header');
  const rect = (top, height) => ({ top, bottom: top + height, height });
  header.getBoundingClientRect = () => rect(0, 132);
  $('#start').getBoundingClientRect = () => rect(-80, 160);
  $('#more').getBoundingClientRect = () => rect(133, 160);
  Object.defineProperties(outline, {
    clientHeight: { value: 110 },
    scrollHeight: { value: 300 },
  });
  outline.getBoundingClientRect = () => rect(120, 110);
  outline.querySelector('[href="#more"]').getBoundingClientRect = () => rect(250, 30);
  window.dispatchEvent(new window.Event('resize'));
  await until(() => outline.scrollTop > 0);
  assert.equal(scope.style.getPropertyValue('--reader-anchor-offset'), '148px');
  assert.equal(outline.querySelector('[aria-current="location"]').getAttribute('href'), '#more');
  assert.equal(outline.scrollTop, 54);
  assert.ok($('.reader-sidebar > .reader-progress'));
  assert.deepEqual(scrolled, [], 'updating the outline does not scroll the document');
});

test('Disposal aborts the route scope, revokes object URLs and ignores a delayed private asset', async t => {
  const late = deferred();
  let signal;
  const result = await fixture(t, { options: {
    getFile: async (object, abort) => {
      if (object === path) { signal = abort; return late.promise; }
      return new result.window.Blob(['file']);
    },
  } });
  await until(() => signal && result.files.length > 0);
  const oldCount = result.files.length;
  result.dispose();
  late.resolve(new result.window.Blob(['too late']));
  await tick();
  assert.equal(signal.aborted, true);
  assert.equal(result.root.children.length, 0);
  assert.equal(result.files.length, oldCount);
  assert.equal(result.revoked.length, oldCount);
});

test('The authored fragment cannot mount executable markup or request paths outside the authorized course', async t => {
  const body = { ...payload, scripts: ['other-course/app.js'], body: payload.body.replace('</article>', `
<script src="https://bad.example/script.js"></script><iframe src="https://bad.example/"></iframe>
<img onerror="alert(1)" src="https://bad.example/pixel" data-private-path="other-course/x.png" alt="ناامن">
<a href="javascript:alert(1)" id="unsafe">unsafe</a><a href="https://numpy.org/" id="safe">docs</a></article>`) };
  const { $, calls, scripts, read } = await fixture(t, { body });
  await until(() => read() === 1);
  assert.equal($('iframe, script[src], [onerror]'), null);
  assert.equal($('[alt="ناامن"]').getAttribute('src'), null);
  assert.equal($('#unsafe').getAttribute('href'), null);
  assert.equal($('#safe').href, 'https://numpy.org/');
  assert.ok(!calls.some(([path]) => path.startsWith('other-course/')));
  assert.deepEqual(scripts, []);
});

async function portal(t, { authenticated = false, active = false, fallback = false } = {}) {
  const browser = setup(t), { window, document, dom } = browser;
  t.after(browser.destroy);
  const requests = [], privatePaths = [];
  window.fetch = async () => ({ ok: true, json: async () => ({
    supabaseUrl: 'https://project.supabase.co', publishableKey: 'sb_publishable_test_public_key',
  }) });
  const membership = { course_id: 'machine-learning', status: active ? 'active' : 'pending' };
  const client = { auth: {
    getSession: async () => ({ data: { session: authenticated ? { user: { id: 'test-student' } } : null }, error: null }),
    onAuthStateChange() {},
  }, async rpc(name) {
    requests.push(name);
    const state = { memberships: [membership], results: [] };
    const body = { ...payload, scripts: [] };
    if (name === 'classroom_bootstrap') return { data: { state, lesson: active && !fallback ? body : null }, error: null };
    if (name === 'classroom_lesson') return { data: body, error: null };
    return { data: { items: [], unread_count: 0, visible: false }, error: null };
  }, storage: { from() { return { async download(path) {
    privatePaths.push(path); return { data: new window.Blob(['image']), error: null };
  } }; } }, removeChannel() {} };
  const append = document.head.append.bind(document.head);
  document.head.append = node => {
    append(node);
    if (node.tagName === 'SCRIPT') { window.supabase = { createClient: () => client }; queueMicrotask(() => node.onload()); }
  };
  await evaluateBuiltModule(dom, 'site-shell.js');
  evaluateClassicAsset(dom, 'portal.js');
  document.querySelector('script[data-site-ui]').dispatchEvent(new window.Event('load'));
  await window.ClassroomReady;
  return { ...browser, requests, privatePaths };
}

test('Guests and pending members never fetch the private lesson or its Storage objects', async t => {
  for (const authenticated of [false, true]) {
    const { document, requests, privatePaths } = await portal(t, { authenticated });
    await until(() => document.querySelector('#main .gate-card'));
    assert.equal(document.querySelector('[data-reader-document]'), null);
    assert.equal(requests.includes('classroom_lesson'), false);
    assert.deepEqual(privatePaths, []);
    assert.equal(Boolean(document.querySelector('#main [data-login-link]')), !authenticated);
  }
});

test('The authenticated portal uses bootstrap first, falls back to the lesson RPC and records study', async t => {
  for (const fallback of [false, true]) {
    const { document, window, requests, privatePaths } = await portal(t, { authenticated: true, active: true, fallback });
    await until(() => window.localStorage.getItem('classroom-last:test-student') && document.querySelector('.reader-copy'));
    assert.equal(requests.includes('classroom_lesson'), fallback);
    assert.deepEqual(privatePaths, [path]);
    assert.equal(JSON.parse(window.localStorage.getItem('classroom-last:test-student')), id);
  }
});

test('Local preview stays on its own route and contains only synthetic content', async t => {
  const html = await readerPreviewDocument(process.cwd());
  assert.doesNotMatch(html, /script[^>]*data-portal|vendor\/supabase/);
  assert.match(readerFixtureSource(), /نزدیک‌ترین ایستگاه/);
  assert.equal(fs.existsSync('dist/__preview__'), false);
  const { $, document } = await fixture(t, { html, url: 'http://class.test/__preview__/lesson/', options: {
    href: route => 'http://class.test/' + route, preview: true,
  } });
  await until(() => $('.reader-mobile-toc a') && $('.portal-quiz-link button'));
  assert.equal($('.reader-mobile-toc a').href, 'http://class.test/__preview__/lesson/#start');
  assert.equal($('.lesson-hero a').href, 'http://class.test/__preview__/lesson/#start');
  assert.ok($('.portal-quiz-link button').disabled);
  assert.ok(document.querySelector('.reader-sample'));
});

test('All four routes share one resource card and progress; neighbors stop at the edges of the course', async t => {
  const course = JSON.parse(fs.readFileSync('web/assets/catalog.json', 'utf8'))[0];
  const lessons = course.lessons;
  for (const [index, lesson] of lessons.entries()) {
    const alternate = index === 3 ? {
      ...payload,
      body: payload.body
        .replace(/<div class="reading-state">.*?<\/aside>/, '</aside>')
        .replace('<aside class="portal-quiz-link">', '<section class="lesson-resources" id="resources">')
        .replace('</a></aside>', '</a></section>'),
    } : payload;
    const { $, dispose } = await fixture(t, {
      lessonId: lesson.id,
      url: base + lesson.id + '/',
      body: alternate,
    });
    await until(() => $('[data-lesson-resources] .reader-resource-actions'));
    const previous = $('[data-lesson-pager] [rel=prev]'), next = $('[data-lesson-pager] [rel=next]');
    assert.equal(previous?.href, index ? base + lessons[index - 1].id + '/' : undefined);
    assert.equal(next?.href, index + 1 < lessons.length ? base + lessons[index + 1].id + '/' : undefined);
    assert.equal($('[data-lesson-resources]').id, 'resources');
    assert.equal($('[data-lesson-resources] .button-forest').href, base + 'quiz/' + lesson.id + '/');
    assert.equal($('[data-lesson-resources] .reader-resource-actions').children.length, 3);
    assert.ok($('.reader-sidebar progress'));
    assert.ok($('.reader-mobile-outline progress'));
    assert.equal($('.adjacent-lessons,.lesson-resources'), null);
    assert.match($('.reader-rail-list a[href="#resources"]').textContent, /منابع و تمرین/);
    assert.equal($('.reader-rail-list a[href="#resources"] .rail-num').textContent, '03');
    dispose();
  }
});

test('Catalog numbers, rather than array position or authored links, determine neighbors', async t => {
  const course = JSON.parse(fs.readFileSync('web/assets/catalog.json', 'utf8'))[0];
  const [two, three, ten] = course.lessons.map((item, i) => ({ ...item, number: ['02','03','10','11'][i] }));
  const info = { ...three, course: { ...course, lessons: [ten, three, two] } };
  const { $ } = await fixture(t, { options: { info } });
  await until(() => $('[data-lesson-pager] [rel=next]'));
  assert.equal($('[data-lesson-pager] [rel=prev]').href, base + two.id + '/');
  assert.equal($('[data-lesson-pager] [rel=next]').href, base + ten.id + '/');
  assert.match($('[data-lesson-pager] [rel=next]').textContent, /۱۰/);
});

test('Authored figure markup and the data-driven second-lesson figure use the same hero component', async t => {
  const generated = await fixture(t, { body: {
    ...payload,
    body: payload.body.replace('</article>',
      '<script id="medical-knn-data" type="application/json">{"X":[[1,2],[3,4]],"y":[0,1],"names":["A","B"],"query":[2,3]}</script></article>'),
  } });
  await until(() => generated.$('[data-lesson-hero] .binary-hero'));
  assert.ok(generated.$('[data-lesson-hero] [data-hero-query]'));
  assert.ok(generated.$('#medical-knn-data'));
  const authored = await fixture(t, { body: {
    ...payload,
    body: payload.body.replace('<h1>متن خصوصی آزمایشی</h1>',
      '<div class="hero-grid"><div class="hero-copy"><h1>عنوان</h1></div><figure class="hero-figure"><svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="9"/></svg><figcaption>توضیح شکل</figcaption></figure></div>'),
  } });
  await until(() => authored.$('[data-lesson-hero] .hero-figure'));
  assert.equal(authored.$('[data-lesson-hero] .hero-figure figcaption').textContent, 'توضیح شکل');
  assert.ok(authored.$('[data-lesson-hero] .hero-figure svg circle'));
});

test('The hero owns one study action and the full title even when the authored header has forced breaks', async t => {
  const third = 'machine-learning/evaluating-knn';
  const body = payload.body
    .replace('<h1>متن خصوصی آزمایشی</h1><a href="#more">شروع مطالعه</a>',
      `<div class="hero-copy"><p class="eyebrow">ارزیابی مدل</p>
      <h1>از پیش‌بینی یک نمونه<br>تا <em>ارزیابی</em> یک طبقه‌بند</h1>
      <p><a class="button-forest" href="#more">شروع مطالعه ←</a></p>
      <div class="hero-actions"><a class="button-primary" href="${base + third}/index.html#more">ادامه</a>
      <button type="button">مطالعهٔ یادداشت</button></div>
      <a href="https://numpy.org/">مستندات NumPy</a></div>`);
  const { $ } = await fixture(t, { lessonId: third, url: base + third + '/?mode=test', body: { ...payload, body } });
  await until(() => $('[data-lesson-start]'));
  const hero = $('[data-lesson-hero]');
  assert.equal(hero.querySelectorAll('a[href*="#"],button').length, 1);
  assert.equal(hero.querySelector('[data-lesson-start]').getAttribute('href'), '#start');
  assert.equal(hero.querySelector('h1').textContent, 'از پیش‌بینی یک نمونه تا ارزیابی یک طبقه‌بند');
  assert.equal(hero.querySelector('h1 br'), null);
  assert.equal(hero.querySelector('h1 em').textContent, 'ارزیابی');
  assert.equal(hero.querySelector('.eyebrow').nextElementSibling.tagName, 'H1');
  assert.ok(hero.querySelector('a[href="https://numpy.org/"]'));
});

test('The pager isolates the number before the RTL label and right-aligns an only card', async t => {
  const first = 'machine-learning/vector-distance';
  const body = payload.body.replace('شروع مطالعه</a></section>',
    'شروع مطالعه</a><figure class="hero-figure"><figcaption>نمودار</figcaption></figure></section>');
  const { $, document, window } = await fixture(t, { lessonId: first, url: base + first + '/', body: { ...payload, body } });
  await until(() => $('[data-lesson-pager] [rel=next]'));
  const nav = $('[data-lesson-pager]'), card = nav.querySelector('a'), label = card.querySelector('.reader-pager-label');
  assert.equal(nav.dir, 'rtl');
  assert.equal(nav.children.length, 1);
  assert.equal(label.firstElementChild.tagName, 'BDI');
  assert.equal(label.firstElementChild.textContent, '۲');
  assert.equal(label.children[1].textContent, 'یادداشت بعدی');
  assert.equal(label.children[2].textContent, '←');

  const sheet = document.createElement('style');
  sheet.textContent = fs.readFileSync('dist/assets/paper.css', 'utf8');
  document.head.append(sheet);
  assert.equal(window.getComputedStyle(card).gridColumn, '1');
  assert.equal(window.getComputedStyle(label).direction, 'rtl');
  assert.equal(window.getComputedStyle($('.lesson-hero .hero-grid')).gridTemplateAreas, '"figure copy"');
  assert.equal(window.getComputedStyle($('.reader-hero-title')).maxWidth, 'none');
});

test('The fourth lesson uses an exact threshold comparison rather than its old decorative illustration', async t => {
  const fourth = 'machine-learning/thresholds-and-roc';
  const body = payload.body.replace('</h1><a href="#more">', '</h1><figure class="hero-figure"><img src="../../assets/hero-space.svg" alt="old-illustration"></figure><a href="#more">');
  const { $, calls } = await fixture(t, { lessonId: fourth, url: base + fourth + '/', body: { ...payload, body } });
  await until(() => $('[data-threshold-hero]'));
  assert.equal($('[alt="old-illustration"]'), null);
  assert.equal($('[data-threshold-hero]').querySelectorAll('[data-score]').length, 8);
  const metrics = threshold => Array.from($('[data-threshold-result="' + threshold + '"]').querySelectorAll('dd'), item => item.textContent);
  assert.deepEqual(metrics('0.4'), ['0.60', '0.75']);
  assert.deepEqual(metrics('0.7'), ['0.67', '0.50']);
  assert.ok(calls.every(([path]) => !path.endsWith('hero-space.svg')));
});
