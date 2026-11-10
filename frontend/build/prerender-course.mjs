import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const slot = /<!-- course-react:start -->[\s\S]*?<!-- course-react:end -->/;
const entry = /<script\b[^>]*\bsrc="([^"]*assets\/course-index\.js(?:\?[^"]*)?)"[^>]*>\s*<\/script>/;
const retry = '<section class="shell gate-card course-startup-error" data-course-startup-error hidden>' +
  '<h2>اطلاعات کلاس دریافت نشد</h2><p class="status-line" role="alert">وضعیت دسترسی مشخص نشد.</p>' +
  '<a class="button-outline" href="">بارگیری دوباره</a></section>';

export async function prerenderCourse(root, courseId, html) {
  const filename = path.join(root, 'web', courseId, 'index.html');
  const original = await readFile(filename, 'utf8');
  if (!slot.test(original) || !entry.test(original)) throw Error('MISSING_REACT_COURSE_ENTRY: ' + courseId);
  let updated = original.replace(slot, () => '<!-- course-react:start -->' + html + '<!-- course-react:end -->')
    .replace(entry, (_tag, src) => '<script type="module" data-course-ui src="' + src + '"></script>');
  if (!updated.includes('data-course-startup-error')) {
    updated = updated.replace(/<!-- course-react:end -->\s*<\/section>/, end => end + retry);
    if (!updated.includes('data-course-startup-error')) throw Error('MISSING_COURSE_RETRY_SLOT: ' + courseId);
  }
  if (updated !== original) await writeFile(filename, updated, 'utf8');
}
