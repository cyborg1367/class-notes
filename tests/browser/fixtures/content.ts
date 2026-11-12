import { readFileSync } from 'node:fs';
export const catalog = JSON.parse(readFileSync(new URL('../../../web/assets/catalog.json',import.meta.url),'utf8')) as {
  id:string; title:string; lessons:{id:string;title:string;number:string;notebook:string;quiz_version:number;
    lab:{mission:string;title:string;path:string};lab_steps:{id:string;title:string}[]}[];
}[];
export const course = catalog[0], firstLesson = course.lessons[0], quizLesson = course.lessons[1];
export const sampleDate = '2026-11-01T08:00:00Z';
export const sampleImage = '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180"><rect width="320" height="180" fill="#f6efdc"/><circle cx="120" cy="90" r="35" fill="#18564e"/><path d="M190 55v70m-35-35h70" stroke="#ad853c" stroke-width="8"/></svg>';
export function lessonPayload(id:string) {
  const lesson = course.lessons.find(item=>item.id===id);
  if (!lesson) throw Error('Unknown browser fixture lesson: '+id);
  return { pdf_path:course.id+'/browser-sample.pdf', scripts:[], body:`
    <section class="hero lesson-hero"><div class="hero-grid"><div class="hero-copy"><p class="eyebrow">یادداشت ${lesson.number}</p>
    <h1>${lesson.title}</h1><p class="hero-lede">از مشاهدهٔ داده تا نوشتن کد و بررسی نتیجه، یک مسیر آموزشی پیوسته را دنبال می‌کنیم.</p>
    <a class="button-primary" href="#sample-data">شروع مطالعه ←</a></div><figure class="hero-figure">${sampleImage}<figcaption>نمونهٔ دیداری داده‌ها</figcaption></figure></div></section>
    <aside class="lesson-rail"><ol class="rail-list"><li><a href="#sample-data">دادهٔ نمونه</a></li><li><a href="#sample-code">کد Python</a></li><li><a href="#sample-reflection">برداشت تو</a></li></ol></aside>
    <article class="lesson-body"><section class="lesson-section" id="sample-data"><h2>دادهٔ نمونه</h2><p>هر سطر یک نمونه است. هر ستون ویژگی مشخصی را توصیف می‌کند.</p>
    <img data-private-path="${course.id}/browser-sample.svg" alt="تصویر آموزشی نمونه" width="320" height="180" />
    <table><thead><tr><th>نمونه</th><th>ویژگی اول</th><th>ویژگی دوم</th></tr></thead><tbody><tr><td>A</td><td>۲</td><td>۵</td></tr><tr><td>B</td><td>۱</td><td>۶</td></tr></tbody></table></section>
    <section class="lesson-section" id="sample-code"><h2>کد Python</h2><div class="code-block"><div class="code-head"><span dir="ltr">Python</span><button class="copy-code" data-copy-code="browser-code" type="button">کپی کد</button></div>
    <pre id="browser-code" dir="ltr"><code>import numpy as np\nX = np.array([[2, 5], [1, 6]])\nprint(X.shape)</code></pre></div>
    ${Array.from({length:8},()=>'<p>برای فهم نتیجه، شکل داده را با معنای سطرها و ستون‌ها مقایسه کن. سپس فرض خودت را با یک مثال دیگر بیازمای.</p>').join('')}
    </section><section class="lesson-section" id="sample-reflection"><h2>برداشت تو</h2><p>اگر یک ویژگی اضافه کنیم، شکل آرایه چه تغییری می‌کند؟</p></section>
    <aside class="portal-quiz-link"><p>تمرین و منابع همین یادداشت</p><a data-private-download="${course.id}/browser-sample.pdf" href="#">دریافت PDF</a><a data-private-download="${course.id}/${lesson.notebook}" href="#">دانلود نوت‌بوک</a></aside></article>` };
}
export const workerFixture = `// Transport fixture; deliberately does not execute Python.
self.onmessage=({data})=>{
 if(data.type==='init')self.postMessage({type:'ready',request:data.request});
 else if(data.type==='run'||data.type==='console'){
  self.postMessage({type:'output',request:data.request,text:'browser fixture output\\n'});
  self.postMessage({type:'done',request:data.request});
 }
};`;
