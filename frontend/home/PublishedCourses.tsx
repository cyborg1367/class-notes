import React from 'react';
import type { PublicCourse } from '../catalog/types';
import { publishedCourses } from './domain/published-courses';
import type { PublishedCourse } from './domain/published-courses';

const fa = (value: number) => String(value).replace(/\d/g, digit => '۰۱۲۳۴۵۶۷۸۹'[Number(digit)]);

function RouteArrow() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 12H4m6-6-6 6 6 6" /></svg>;
}

function AccessSeal() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" aria-hidden="true"><path d="m12 2 3 2 3.6.4.8 3.5L22 11l-2 3 .1 3.6-3.5 1L14 21l-3-1.8-3.5.2-1.1-3.3L3 14l1-3.4L3.6 7 7 5.7 9 3Z" /><path d="m9 11 2 2 4-4" /></svg>;
}

function HomeCourseCard({ course, version }: { course: PublishedCourse; version: string }) {
  return (
    <article
      className="home-course-card" data-home-course={course.id}
      data-note-count={course.notes} data-lab-count={course.labs} data-quiz-count={course.quizzes}
      data-latest-lesson={course.latest.id} aria-labelledby={course.headingId}
    >
      <div className="home-course-summary">
        <span className="home-course-kicker">مسیر آموزشی</span>
        <h3 id={course.headingId} className="home-course-title" lang={course.language} dir="auto">{course.title}</h3>
        <p className="home-course-lead">{course.description}</p>
        <ul className="home-course-stats" aria-label="محتواهای منتشرشده">
          <li><bdi>{fa(course.notes)}</bdi> یادداشت</li>
          <li><bdi>{fa(course.labs)}</bdi> لابراتور</li>
          <li><bdi>{fa(course.quizzes)}</bdi> آزمون</li>
        </ul>
        <div className="home-course-actions">
          <a className="home-course-open" href={course.href} aria-label={'مشاهدهٔ مسیر دورهٔ ' + course.title}><span>مشاهدهٔ مسیر دوره</span><RouteArrow /></a>
          <span className="home-course-access"><AccessSeal />با تأیید مدرس</span>
        </div>
      </div>
      <section className="home-course-latest" aria-label="تازه‌ترین یادداشت">
        <div className="home-course-latest-head"><p>تازه‌ترین یادداشت</p><span className="home-course-new">جدید</span></div>
        <div className="home-course-note">
          <span className="home-course-number" dir="ltr" lang="en" aria-label={'یادداشت ' + fa(course.latest.number)}>{String(course.latest.number).padStart(2, '0')}</span>
          <div><h4>{course.latest.title}</h4><p>{course.latest.subtitle}</p></div>
        </div>
        <div className="home-course-latest-bottom">
          <img className="home-course-ink" src={'assets/home-course-ink.svg?v=' + encodeURIComponent(version)} width="220" height="140" alt="" aria-hidden="true" loading="lazy" decoding="async" />
          <a className="home-course-read" href={course.latest.href} aria-label={'مطالعهٔ یادداشت ' + course.latest.title}><span>مطالعهٔ یادداشت</span><RouteArrow /></a>
        </div>
      </section>
    </article>
  );
}

export function HomeCourseList({ catalog, version = 'build' }: { catalog: readonly PublicCourse[]; version?: string }) {
  const courses = publishedCourses(catalog);
  return courses.length > 0
    ? <>{courses.map(course => <HomeCourseCard key={course.id} course={course} version={version} />)}</>
    : <p className="home-courses-empty">هنوز دوره‌ای منتشر نشده است.</p>;
}

export function PublishedCourses({ catalog, version }: { catalog: readonly PublicCourse[]; version: string }) {
  return (
    <section className="shell landing-section home-course-section" id="classes" aria-labelledby="published-courses-title">
      <div className="section-heading">
        <div><p className="eyebrow">کلاس‌ها</p><h2 id="published-courses-title">کلاس‌های منتشرشده</h2></div>
        <p>هر کلاس، یک مسیر پیوسته برای یادگیری است.</p>
      </div>
      <div className="home-course-list" data-home-courses=""><HomeCourseList catalog={catalog} version={version} /></div>
    </section>
  );
}
