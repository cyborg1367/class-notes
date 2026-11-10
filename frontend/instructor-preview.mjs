import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { record } from './quiz-result-preview.mjs';

const route = '/__preview__/instructor/';
const script = '/__preview__/instructor-fixture.mjs';
const course = 'machine-learning';
const date = '2026-01-12T08:30:00.123456Z';
const lesson = { id: record.lesson_id, title: 'از مشورت گرفتن تا طبقه‌بندی باینری', ordinal: 2,
  lab: { mission: 'quality-knn-v1', title: 'تشخیص پیامک ناخواسته' } };
const courses = [{ course_id: course, title: 'ماشین لرنینگ' }, { course_id: 'sample-course', title: 'کلاس نمونهٔ دوم' }];
const catalog = [{ id: course, title: courses[0].title, lessons: [lesson] }, { id: 'sample-course', title: courses[1].title, lessons: [] }];
const lab = { xp: 300, maximum: 300, completed: 3, task_count: 3, attempts: 4, missions: [{
  mission: lesson.lab.mission, title: lesson.lab.title, xp: 300, maximum: 300, completed: ['read', 'train', 'report'], task_count: 3,
  tasks: ['read','train','report'].map((id,index) => ({ id, position: index + 1 })), last_at: date }] };
const people = [
  { user_id: 'sample-1', name: 'سارا رضایی', email: 'sara@example.test', status: 'active', lab, last_registered_at: date,
    latest_quiz: { lesson_id: lesson.id, version: 2, score: 3, maximum: 4 }, quiz_attempts: 1 },
  { user_id: 'sample-2', name: 'امیر احمدی', email: 'amir@example.test', status: 'active',
    lab: { xp: 100, maximum: 300, completed: 1, task_count: 3, attempts: 2, missions: [] } },
  { user_id: 'sample-3', name: 'نگار کاظمی', email: 'negar@example.test', status: 'pending', requested_at: date,
    lab: { xp: 0, maximum: 0, completed: 0, task_count: 0, attempts: 0, missions: [] } },
];
const attempt = { id: record.id, name: people[0].name, email: people[0].email, lesson_id: lesson.id, title: lesson.title,
  version: 2, attempt_no: 1, score: 3, maximum: 4, created_at: date };
const concept = { lesson_id: lesson.id, version: 2, question_id: 'choice', skill: 'تفاوت فاصله و برچسب کلاس',
  stem: record.prompts[0].stem, options: record.prompts[0].options, responses: 7, correct: 4, choice_counts: { a: 4, b: 3 } };

export function makeInstructorFixture(data) {
  const { people, course, lesson, catalog, courses, attempt, concept, record, date } = data;
  const students = people.map(person => ({ ...person }));
  const page = (rows, args) => {
    const start = args.p_after?.offset || 0, end = start + args.p_limit;
    return { rows: rows.slice(start,end), total: rows.length, page_size: args.p_limit,
      next_cursor: end < rows.length ? { offset: end } : null, as_of: date };
  };
  return { catalog, courses, url: route => '/' + route, isCurrent: () => true, async rpc(name, args) {
    const rows = args.p_course === course ? students : [];
    if (name === 'classroom_instructor_overview') {
      const active = rows.filter(person => person.status === 'active'), pending = rows.filter(person => person.status === 'pending');
      return { schema_version: 1, server_now: date, stats: { active_students: active.length, pending_students: pending.length,
        total_attempts: rows.length ? 1 : 0 }, pending: pending.map(person => ({ ...person, created_at: person.requested_at })),
        lessons: rows.length ? [lesson] : [], concepts: rows.length ? [concept] : [],
        labs: rows.length ? [{ mission: lesson.lab.mission, title: lesson.lab.title, ordinal: 2, task_count: people[0].lab.task_count, maximum: 300, completed_students: 1, students: active.length }] : [] };
    }
    if (name === 'classroom_instructor_students') return page(rows.filter(person =>
      (args.p_status === 'enrolled' ? person.status !== 'pending' : args.p_status === person.status) &&
      (!args.p_query || (person.name + ' ' + person.email).toLowerCase().includes(args.p_query.toLowerCase()))), args);
    if (name === 'classroom_instructor_questions') return rows.length ? [concept] : [];
    if (name === 'classroom_instructor_attempts') return page(rows.length && (!args.p_user || args.p_user === students[0].user_id) &&
      (!args.p_lesson || args.p_lesson === lesson.id) && args.p_kind !== 'later' &&
      (!args.p_query || (attempt.name + ' ' + attempt.email).toLowerCase().includes(args.p_query.toLowerCase())) ? [attempt] : [], args);
    if (name === 'classroom_attempt' && args.p_id === record.id) return { ...record, version: attempt.version, attempt_no: attempt.attempt_no };
    const person = rows.find(person => person.user_id === args.p_user);
    if (name === 'classroom_instructor_student' && person) return { ...person };
    if (name === 'classroom_membership' && person && ['active','suspended'].includes(args.p_status)) { person.status = args.p_status; return null; }
    throw Error('UNEXPECTED_INSTRUCTOR_FIXTURE_REQUEST');
  } };
}

export const instructorFixture = { people, course, lesson, catalog, courses, attempt, concept, record, date };

export async function instructorPreviewDocument(root) {
  const html = await readFile(path.join(root, 'dist/instructor/index.html'), 'utf8');
  return html
    .replace(/<script\b(?=[^>]*\bdata-portal)[^>]*>\s*<\/script>/, '')
    .replace(/<link\b[^>]*href="[^"]*vendor\/supabase\/supabase\.js[^"]*"[^>]*>/, '')
    .replace('<head>', '<head><base href="/instructor/">')
    .replace(/href="#main"/, `href="${route}#main"`)
    .replace('<div data-teacher>', '<aside class="instructor-preview-banner"><p>پیش‌نمایش محلی · همهٔ داده‌ها ساختگی‌اند و تغییرات فقط در همین صفحه می‌مانند.</p></aside><div data-teacher>')
    .replace('در حال بررسی دسترسی مدرس…', '')
    .replace('</body>', `<script type="module" src="${script}"></script></body>`);
}

export function instructorFixtureSource() {
  return `const {loadInstructor}=await import(document.querySelector('script[data-site-ui]').src);
const {mountInstructor}=await loadInstructor();
const createFixture=${makeInstructorFixture.toString()};
const ui=mountInstructor(document.querySelector('[data-teacher]'),createFixture(${JSON.stringify(instructorFixture)}));
window.addEventListener('pagehide',event=>{if(!event.persisted)ui.dispose();});`;
}

export function instructorPreviewPlugin(root) {
  return { name: 'local-instructor-preview', apply: 'serve', configureServer(server) {
    server.middlewares.use(async (request, response, next) => {
      const url = new URL(request.url || '/', 'http://local.invalid');
      if (request.method !== 'GET' || ![route, script].includes(url.pathname)) return next();
      try {
        const isScript = url.pathname === script;
        response.setHeader('Content-Type', isScript ? 'text/javascript; charset=utf-8' : 'text/html; charset=utf-8');
        response.setHeader('Cache-Control', 'no-store');
        response.end(isScript ? instructorFixtureSource() : await server.transformIndexHtml(route, await instructorPreviewDocument(root)));
      } catch (error) { next(error); }
    });
  } };
}
