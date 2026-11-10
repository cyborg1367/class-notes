import { readFile } from 'node:fs/promises';
import path from 'node:path';

const route = '/__preview__/lesson/';
const script = '/__preview__/lesson-fixture.mjs';
const lesson = 'machine-learning/prediction-problem';

export async function readerPreviewDocument(root) {
  const html = await readFile(path.join(root, 'dist', lesson, 'index.html'), 'utf8');
  return html
    .replace(/<script\b(?=[^>]*\bdata-portal)[^>]*>\s*<\/script>/, '')
    .replace(/<link\b[^>]*href="[^"]*vendor\/supabase\/supabase\.js[^"]*"[^>]*>/, '')
    .replace('<head>', `<head><base href="/${lesson}/">`)
    .replace(/href="#main"/, `href="${route}#main"`)
    .replace('</head>', '<style>[data-shell-account-slot]{display:none}.reader-sample{padding:10px 7%;background:var(--kit-sage);border-block-end:1px solid var(--kit-rule)}</style></head>')
    .replace(/(<body\b[^>]*>)/, '$1<aside class="reader-sample">پیش‌نمایش محلی صفحهٔ مطالعه · متن و داده‌ها نمونه‌اند. لینک‌های قبلی و بعدی داخل همین نمونه کار می‌کنند. دانلود خصوصی غیرفعال است.</aside>')
    .replace('</body>', `<script type="module" src="${script}"></script></body>`);
}

const sample = `
<section class="hero lesson-hero" id="top"><div class="shell hero-grid">
<div class="hero-copy"><p class="eyebrow"><span class="eyebrow-rule" aria-hidden="true"></span>نمونهٔ صفحهٔ مطالعه</p>
<h1>نزدیک‌ترین ایستگاه <em>کدام است؟</em></h1>
<p class="hero-lede">سه ایستگاه روی یک نقشه داریم. برای پیدا کردن نزدیک‌ترین ایستگاه به نقطهٔ سبز، فاصلهٔ هر ایستگاه را جداگانه حساب می‌کنیم.</p>
<div class="hero-actions"><a class="button-primary" href="#map">شروع مطالعه ←</a></div></div>
<figure class="hero-figure"><svg viewBox="0 0 420 280" role="img" aria-label="نقطهٔ سبز و سه ایستگاه روی نقشه">
<rect width="420" height="280" fill="#f6efdc"/><path d="M32 30V244H390M90 30V244M150 30V244M210 30V244M270 30V244M330 30V244M32 65H390M32 125H390M32 185H390" fill="none" stroke="#bcb6a1"/>
<path d="M210 185L270 125M210 185L90 65M210 185L330 65" fill="none" stroke="#708774" stroke-dasharray="5 5"/>
<circle cx="210" cy="185" r="9" fill="#18564e"/><circle cx="270" cy="125" r="8" fill="#c9a058"/><circle cx="90" cy="65" r="8" fill="#c9a058"/><circle cx="330" cy="65" r="8" fill="#c9a058"/>
</svg><figcaption>سبز: نقطهٔ شروع · اُخرایی: ایستگاه‌ها</figcaption></figure></div>
<div class="shell"><ul class="hero-strip"><li><span class="strip-number">01</span><span class="strip-text">مختصات، موقعیت هر ایستگاه را مشخص می‌کنند.</span></li>
<li><span class="strip-number">02</span><span class="strip-text">فاصله‌ها را از یک نقطهٔ مشترک می‌سنجیم.</span></li>
<li><span class="strip-number">03</span><span class="strip-text">کمترین فاصله، انتخاب ما را تعیین می‌کند.</span></li></ul></div></section>
<div class="shell lesson-shell"><aside class="lesson-rail" aria-label="فهرست مطالب">
<p class="rail-title">مسیر این درس</p><ol class="rail-list"><li><a href="#map"><span class="rail-num">01</span> نقشهٔ نمونه</a></li>
<li><a href="#distance"><span class="rail-num">02</span> فاصلهٔ دو نقطه</a></li><li><a href="#python"><span class="rail-num">03</span> محاسبه با Python</a></li></ol>
<div class="reading-state"><span id="reading-label">۰٪ مطالعه شده</span><div aria-hidden="true"><i id="sidebar-progress"></i></div></div>
</aside><article class="lesson-body">
<section class="lesson-section" id="map"><header class="section-head"><h2>نقشهٔ نمونه</h2></header><div class="lesson-prose">
<p>موقعیت شروع را با دو عدد می‌نویسیم: فاصله روی محور افقی و محور عمودی. هر ایستگاه نیز یک جفت عدد دارد. برای مقایسه، مبدأ هر سه فاصله همان نقطهٔ سبز است.</p>
<table><thead><tr><th scope="col">ایستگاه</th><th scope="col">مختصات</th></tr></thead><tbody>
<tr><th scope="row">A</th><td dir="ltr">(1, 3)</td></tr><tr><th scope="row">B</th><td dir="ltr">(4, 2)</td></tr><tr><th scope="row">C</th><td dir="ltr">(5, 3)</td></tr>
</tbody></table></div></section>
<section class="lesson-section" id="distance"><header class="section-head"><h2>فاصلهٔ دو نقطه</h2></header><div class="lesson-prose">
<p>اختلاف‌ها را در هر محور حساب کن، به توان دو برسان، جمع کن و ریشهٔ دوم بگیر.</p>
<p dir="ltr"><math display="block" aria-label="ریشهٔ دوم مجموع مربع اختلاف‌های x و y"><mi>d</mi><mo>=</mo><msqrt><mrow><msup><mrow><mo>(</mo><mi>Δx</mi><mo>)</mo></mrow><mn>2</mn></msup><mo>+</mo><msup><mrow><mo>(</mo><mi>Δy</mi><mo>)</mo></mrow><mn>2</mn></msup></mrow></msqrt></math></p>
<p>اگر اختلاف روی هر دو محور صفر باشد، دو نقطه یکی هستند و فاصله هم صفر است.</p></div></section>
<section class="lesson-section" id="python"><header class="section-head"><h2>محاسبه با Python</h2></header><div class="lesson-prose">
<p>برای هر ایستگاه یک فاصله حساب می‌کنیم. سپس نام ایستگاهی را می‌گیریم که فاصله‌اش از همه کمتر است.</p>
<div class="code-block"><div class="code-head"><span dir="ltr">Python</span><button type="button" class="copy-code">کپی کد</button></div><pre dir="ltr"><code>from math import dist

origin = (3, 1)
stations = {"A": (1, 3), "B": (4, 2), "C": (5, 3)}
nearest = min(stations, key=lambda name: dist(origin, stations[name]))
print(nearest)</code></pre></div></div></section>
<nav class="adjacent-lessons" aria-label="یادداشت‌های پیوسته"><a href="../vector-distance/" rel="prev">یادداشت قبلی: از یک جدول تا نزدیک‌ترین نمونه</a></nav>
<aside class="portal-quiz-link"><p>جای فایل‌ها و تمرین اینجا، در پایان یادداشت است.</p>
<a class="button-forest" href="../../quiz/machine-learning/prediction-problem/">تمرین و آزمون این یادداشت ←</a>
<a class="button-outline" data-private-download="machine-learning/sample.pdf" href="#">دریافت PDF ↓</a>
<a class="button-outline" data-private-download="machine-learning/sample.ipynb" href="#">دانلود نوت‌بوک انگلیسی ↓</a></aside>
<footer class="lesson-footer"><p>این صفحه فقط برای بررسی قالب نمایش داده می‌شود.</p><a href="../">بازگشت به فهرست کلاس ←</a></footer>
</article></div>`;

const evaluationSample = `
<section class="hero lesson-hero"><div class="hero-grid">
<div class="hero-copy"><p class="eyebrow">نمونهٔ صفحهٔ مطالعه</p>
<h1>از پیش‌بینی یک نمونه<br>تا <em>ارزیابیِ</em> یک طبقه‌بند</h1>
<p class="hero-lede">برای سنجش مدل، چند نمونه را از ابتدا کنار می‌گذاریم. سپس پیش‌بینی مدل را برای آن‌ها با برچسب واقعی مقایسه می‌کنیم.</p>
<a class="button-primary" href="#holdout">شروع مطالعه ←</a></div>
<figure class="hero-figure"><svg viewBox="0 0 420 260" role="img" aria-label="شش دایرهٔ سبز برای آموزش و دو لوزی اُخرایی برای آزمون">
<rect width="420" height="260" fill="#f6efdc"/><path d="M35 25V228H390M94 25V228M154 25V228M214 25V228M274 25V228M334 25V228M35 57H390M35 114H390M35 171H390" fill="none" stroke="#bcb6a1"/>
<g fill="#18564e"><circle cx="72" cy="199" r="8"/><circle cx="129" cy="171" r="8"/><circle cx="162" cy="127" r="8"/><circle cx="219" cy="154" r="8"/><circle cx="260" cy="91" r="8"/><circle cx="337" cy="59" r="8"/></g>
<path d="M146 193l10 10-10 10-10-10zM303 110l10 10-10 10-10-10z" fill="#c9a058" stroke="#80601e"/>
</svg><figcaption>دایره: دادهٔ آموزش · لوزی: دادهٔ آزمون</figcaption></figure></div></section>
<article class="lesson-body">
<section class="lesson-section" id="holdout"><header class="section-head"><h2>دادهٔ آموزش و دادهٔ آزمون</h2></header>
<div class="lesson-prose"><p>دایره‌ها نمونه‌های مرجع مدل‌اند. لوزی‌ها تا زمان سنجش کنار گذاشته می‌شوند.</p></div></section>
<section class="lesson-section" id="results"><header class="section-head"><h2>مقایسهٔ پیش‌بینی با واقعیت</h2></header>
<div class="lesson-prose"><p>پس از پیش‌بینی، نتیجه را با برچسب واقعی هر نمونهٔ آزمون مقایسه می‌کنیم.</p></div></section>
<aside class="portal-quiz-link">
<a class="button-outline" data-private-download="machine-learning/sample.pdf" href="#">دریافت PDF ↓</a>
<a class="button-outline" data-private-download="machine-learning/sample.ipynb" href="#">دانلود نوت‌بوک انگلیسی ↓</a>
</aside>
</article>`;

const thresholdSample = `
<section class="hero lesson-hero"><div class="hero-copy"><p class="eyebrow">نمونهٔ صفحهٔ مطالعه</p>
<h1>از شمارش خطا تا <em>انتخاب آستانه</em></h1>
<p class="hero-lede">امتیازهای مدل را ثابت نگه دار. ببین با تغییر خط تصمیم، کدام نمونه‌ها مثبت پیش‌بینی می‌شوند و Precision و Recall چطور تغییر می‌کنند.</p>
<a class="button-forest" href="#decision">شروع مطالعه ←</a></div></section>
<article class="lesson-body"><section class="lesson-section" id="decision"><header class="section-head"><h2>امتیاز و آستانه</h2></header>
<div class="lesson-prose"><p>هر علامت یک نمونه است. لوزی‌ها واقعاً مثبت‌اند و مربع‌ها واقعاً منفی. نمونه‌هایی که امتیازشان به آستانه می‌رسد یا از آن بیشتر است، مثبت اعلام می‌شوند.</p></div></section>
<section class="lesson-section" id="tradeoff"><header class="section-head"><h2>چه چیزی با تغییر آستانه عوض می‌شود؟</h2></header>
<div class="lesson-prose"><p>خط دوم سمت راست خط اول است. با این آستانهٔ بالاتر، بعضی خطاهای مثبت حذف می‌شوند، اما بخشی از نمونه‌های مثبت هم از دست می‌روند.</p></div></section>
<aside class="portal-quiz-link">
<a class="button-outline" data-private-download="machine-learning/sample.pdf" href="#">دریافت PDF ↓</a>
<a class="button-outline" data-private-download="machine-learning/sample.ipynb" href="#">دانلود نوت‌بوک انگلیسی ↓</a>
</aside></article>`;

export function readerFixtureSource() {
  return `const shell = document.querySelector('script[data-site-ui]');
const { loadLessonReader } = await import(shell.src);
const { mountLessonReader } = await loadLessonReader();
const course = JSON.parse(document.querySelector('#catalog-data').textContent)[0];
const selection = new URLSearchParams(location.search).get('note');
const lesson = course.lessons.find(lesson => lesson.number === selection)
  || course.lessons.find(lesson => lesson.id === ${JSON.stringify(lesson)});
const sampleRoutes = new Map(course.lessons.map(item => [item.id + '/', item.number]));
const isThreshold = lesson.hero_kind === 'threshold-scores';
const isEvaluation = lesson.id === 'machine-learning/evaluating-knn';
const preview = isThreshold
  ? { title: 'از شمارش خطا تا انتخاب آستانه', body: ${JSON.stringify(thresholdSample)} }
  : isEvaluation
    ? { title: 'از پیش‌بینی یک نمونه تا ارزیابی یک طبقه‌بند', body: ${JSON.stringify(evaluationSample)} }
    : { title: 'نزدیک‌ترین ایستگاه کدام است؟', body: ${JSON.stringify(sample)} };
const ui = mountLessonReader(document.querySelector('#main'), {
 info: { ...lesson, title: preview.title, course },
 href: route => new URL(sampleRoutes.has(route)
   ? '/__preview__/lesson/?note=' + encodeURIComponent(sampleRoutes.get(route))
   : '/' + route, location.href).href, current: () => true,
 getFile: async () => { throw Error('PREVIEW_HAS_NO_PRIVATE_FILES'); },
 loadScript: async () => {}, enhance() {}, onRead() {}, refreshAccess: async () => {}, retry() {}, preview: true,
});
ui.render({ phase: 'ready', payload: { body: preview.body, scripts: [] } });
window.addEventListener('pagehide', event => { if (!event.persisted) ui.dispose(); });
`;
}

export function readerPreviewPlugin(root) {
  return { name: 'local-lesson-preview', apply: 'serve', configureServer(server) {
    server.middlewares.use(async (request, response, next) => {
      const url = new URL(request.url || '/', 'http://local.invalid');
      if (request.method !== 'GET' || (url.pathname !== route && url.pathname !== script)) return next();
      try {
        const isScript = url.pathname === script;
        response.setHeader('Content-Type', isScript ? 'text/javascript; charset=utf-8' : 'text/html; charset=utf-8');
        response.setHeader('Cache-Control', 'no-store');
        response.end(isScript ? readerFixtureSource() : await server.transformIndexHtml(route, await readerPreviewDocument(root)));
      } catch (error) { next(error); }
    });
  } };
}
