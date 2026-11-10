import { memo } from 'react';
import type { EndResources, ReaderOptions } from './contracts';
import type { ReaderResources } from './resources';
import { PrivateDownload } from './ReaderControls';
import { lessonNeighbors } from './lesson-model';

type Routes = Pick<ReaderOptions, 'info' | 'href'>;
function LessonPagerCard({ relation, number, title, href }: {
  relation: 'prev' | 'next'; number: number; title: string; href: string;
}) {
  const previous = relation === 'prev';
  return <a className={'reader-pager-link reader-pager-' + (previous ? 'previous' : 'next')} rel={relation} href={href} dir="rtl">
    <span className="reader-pager-label">
      <bdi className="reader-pager-number" dir="ltr">{number.toLocaleString('fa-IR')}</bdi>
      <span className="reader-pager-direction">{previous ? 'یادداشت قبلی' : 'یادداشت بعدی'}</span>
      <span className="reader-pager-arrow" aria-hidden="true">{previous ? '→' : '←'}</span>
    </span>
    <strong><bdi>{title}</bdi></strong>
  </a>;
}

export const LessonPager = memo(function LessonPager({ info, href }: Routes) {
  const { previous, next } = lessonNeighbors(info);
  if (!previous && !next) return null;
  return <nav className="reader-pager" dir="rtl" aria-label="یادداشت قبلی و بعدی" data-lesson-pager="">
    {previous && <LessonPagerCard relation="prev" number={previous.number} title={previous.lesson.title}
      href={href(previous.lesson.id + '/')} />}
    {next && <LessonPagerCard relation="next" number={next.number} title={next.lesson.title}
      href={href(next.lesson.id + '/')} />}
  </nav>;
});

export const LessonResources = memo(function LessonResources({ info, href, data, files, preview }: Routes & {
  data: EndResources; files: ReaderResources; preview?: boolean;
}) {
  if (!info.quiz_version && !data.pdf && !data.notebook && !data.extras.length) return null;
  const download = (path: string, label: string) =>
    <PrivateDownload path={path} label={label} className="button-outline" files={files} preview={preview} />;
  return <section className="portal-quiz-link reader-resources" id={data.id} aria-label="منابع و تمرین این یادداشت" data-lesson-resources="">
    <h2>منابع و تمرین این یادداشت</h2>
    <p>برای مرور یا شرکت در آزمون، از این بخش شروع کن. فایل‌ها برای مطالعه و اجرای مثال‌ها در دسترس‌اند.</p>
    <div className="reader-resource-actions">
      {info.quiz_version && <a className="button-forest" href={href('quiz/' + info.id + '/')}>تمرین و آزمون این یادداشت ←</a>}
      {data.pdf && download(data.pdf, 'دریافت PDF ↓')}
      {data.notebook && download(data.notebook, 'دانلود نوت‌بوک انگلیسی ↓')}
    </div>
    {data.extras.length > 0 && <div className="reader-resource-extras">
      {data.extras.map(file => <div key={file.path}>{download(file.path, file.label)}</div>)}
    </div>}
    {data.note && <p className="small-note">{data.note}</p>}
  </section>;
});

export function LessonFooter({ info, href }: Routes) {
  return <footer className="lesson-footer">
    <p>این یادداشت بخشی از کلاس <bdi>{info.course.display_title || info.course.title}</bdi> است.</p>
    <a href={href(info.course.id + '/')}>بازگشت به فهرست کلاس ←</a>
  </footer>;
}
