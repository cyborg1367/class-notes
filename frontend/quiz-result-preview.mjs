import { readFile } from 'node:fs/promises';
import path from 'node:path';

const route = '/__preview__/quiz-result/';
const script = '/__preview__/quiz-result-fixture.mjs';
const formRoute = '/__preview__/quiz/';
const formScript = '/__preview__/quiz-fixture.mjs';
const lesson = 'machine-learning/prediction-problem';
const quizRoute = '/quiz/' + lesson + '/';

export const prompts = [
  { id: 'choice', type: 'choice', stem: 'اگر فاصله کمتر باشد، چه چیزی می‌دانیم؟',
    options: [['a', 'نمونه‌ها در این فضا شبیه‌ترند.'], ['b', 'حتماً در یک کلاس‌اند.']] },
  { id: 'fill', type: 'fill', stem: 'عبارت مقایسه را کامل کن.',
    code: 'nearby = distance {{op}} {{limit}}',
    blanks: [{ id: 'op', input_kind: 'operator' }, { id: 'limit', input_kind: 'integer' }] },
];
export const record = {
  id: '00000000-0000-4000-8000-000000000001', lesson_id: lesson, attempt_no: 2, created_at: '2026-01-12T08:30:00Z',
  answers: { choice: 'a', fill: { op: '<', limit: '9' } },
  result: { score: 3, maximum: 4, practice_checks: 1, hints_used: 0, items: [
    { id: 'choice', skill: 'مقایسهٔ نمونه‌ها', score: 2, maximum: 2, correct: true, key: 'a',
      explanation: 'فاصله، شباهت را بر اساس ویژگی‌های انتخاب‌شده می‌سنجد.' },
    { id: 'fill', skill: 'تکمیل کد', score: 1, maximum: 2, correct: false,
      parts: [{ id: 'op', accepted: ['<'], correct: true }, { id: 'limit', accepted: ['3'], correct: false }],
      explanation: 'برای این نمونه، شرط `distance < 3` را می‌سنجیم.' },
  ] },
  prompts, summary: { first_score: 2, best_score: 3, last_score: 3, attempts: 2 },
};

export async function quizResultPreviewDocument(root, form = false) {
  const html = await readFile(path.join(root, 'dist', quizRoute.slice(1), 'index.html'), 'utf8');
  return html
    .replace(/<script\b(?=[^>]*\bdata-portal)[^>]*>\s*<\/script>/, '')
    .replace(/<link\b[^>]*href="[^"]*vendor\/supabase\/supabase\.js[^"]*"[^>]*>/, '')
    .replace('<head>', `<head><base href="${quizRoute}">`)
    .replace(/href="#main"/, `href="${form ? formRoute : route}#main"`)
    .replace('</head>', form ? '<link rel="stylesheet" href="/assets/quiz-form.css"></head>' : '</head>')
    .replace('<div data-quiz-root>', '<aside class="panel-card"><p>پیش‌نمایش محلی · سؤال و نتیجه ساختگی‌اند. هیچ تلاشی ثبت نمی‌شود.</p></aside><div data-quiz-root>')
    .replace('</body>', `<script type="module" src="${form ? formScript : script}"></script></body>`);
}

export function quizResultFixtureSource() {
  const data = { record, prompts, summary: record.summary, links: { lesson: '/' + lesson + '/',
    quiz: quizRoute, review: '/review/?lesson=' + encodeURIComponent(lesson) } };
  return `const {loadQuizResult}=await import(document.querySelector('script[data-site-ui]').src);
const {mountQuizResult}=await loadQuizResult();
const view=mountQuizResult(document.querySelector('[data-quiz-root]'),${JSON.stringify(data)});
window.addEventListener('pagehide',event=>{if(!event.persisted)view.dispose();});`;
}

export function quizFormFixtureSource() {
  const quiz = { version: 2, questions: prompts.map(prompt => ({ ...prompt, points: 2, skill: 'تمرین نمونه',
    ...(prompt.blanks ? { blanks: prompt.blanks.map(blank => ({ ...blank, label: blank.id === 'op' ? 'عملگر مقایسه' : 'عدد آستانه' })) } : {}) })) };
  const links = { lesson: '/' + lesson + '/', course: '/machine-learning/', quiz: formRoute,
    review: '/__preview__/review/', results: route };
  return `const {loadQuizForm}=await import(document.querySelector('script[data-site-ui]').src);
const {mountQuizForm}=await loadQuizForm();
const values=new Map(), record=${JSON.stringify(record)};
const normalizeBlank=value=>String(value??'').trim().replace(/[۰-۹٠-٩]/g,c=>String(c.charCodeAt(0)-(c.charCodeAt(0)>=1776?1776:1632)));
const ui=mountQuizForm(document.querySelector('[data-quiz-root]'),{
  quiz:${JSON.stringify(quiz)}, lesson:${JSON.stringify(lesson)},userId:'local-preview',links:${JSON.stringify(links)},
  storage:{read:key=>values.get(key),write:(key,value)=>{values.set(key,value);return true;}},
  isCurrent:()=>true,requestId:()=>crypto.randomUUID(),errorText:()=> 'در پیش‌نمایش مشکلی پیش آمد.',
  normalizeBlank,blankHelp:kind=>kind==='integer'?'یک عدد صحیح بنویس.':'یک عملگر مقایسه بنویس.',
  blankError:(value,kind)=>{
    const text=normalizeBlank(value);
    return !text||(kind==='integer'?/^[+-]?\\d+$/.test(text):/^(?:==|!=|<=|>=|<|>)$/.test(text))?'':'قالب پاسخ را بررسی کن.';
  },
  loadDraft:async()=>null, saveDraft:async()=>{}, onCommitted:()=>{}, refreshSummary:async()=>undefined,
  practice:async(id,answer,hint)=>{
    if(hint)return {hint:id==='choice'?'به تفاوت شباهت و برچسب کلاس فکر کن.':'دو طرف مقایسه را بررسی کن.'};
    const item=record.result.items.find(item=>item.id===id);
    const parts=item.parts?.map(part=>({...part,correct:part.accepted.includes(answer?.[part.id])}));
    return {items:[{...item,parts,correct:parts?parts.every(part=>part.correct):answer===item.key}]};
  },
  submit:async({answers})=>{
    const items=record.result.items.map(item=>{
      const parts=item.parts?.map(part=>({...part,correct:part.accepted.includes(answers[item.id]?.[part.id])}));
      const score=parts?parts.filter(part=>part.correct).length:answers[item.id]===item.key?item.maximum:0;
      return {...item,parts,score,correct:score===item.maximum};
    });
    return {attempt_no:1,result:{...record.result,practice_checks:0,items,score:items.reduce((total,item)=>total+item.score,0)}};
  },
});
await ui.load();
window.addEventListener('pagehide',event=>{if(!event.persisted)ui.dispose();});`;
}

export function quizResultPreviewPlugin(root) {
  return { name: 'local-quiz-result-preview', apply: 'serve', configureServer(server) {
    server.middlewares.use(async (request, response, next) => {
      const url = new URL(request.url || '/', 'http://local.invalid');
      if (request.method !== 'GET' || ![route, script, formRoute, formScript].includes(url.pathname)) return next();
      try {
        const form = url.pathname === formRoute || url.pathname === formScript;
        const isScript = url.pathname === script || url.pathname === formScript;
        response.setHeader('Content-Type', isScript ? 'text/javascript; charset=utf-8' : 'text/html; charset=utf-8');
        response.setHeader('Cache-Control', 'no-store');
        response.end(isScript ? (form ? quizFormFixtureSource() : quizResultFixtureSource())
          : await server.transformIndexHtml(form ? formRoute : route, await quizResultPreviewDocument(root, form)));
      } catch (error) { next(error); }
    });
  } };
}
