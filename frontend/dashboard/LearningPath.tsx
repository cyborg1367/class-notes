import type { DashboardCourse, LabProgress, LessonProgress, RouteLink } from './contracts';
import { DashboardGlyph } from './DashboardGlyph';
import { en, fa, quizPath } from './format';

function ProgressIcon({ progress }: { progress: LabProgress | null }) {
  const percent = progress?.status === 'ready' ? progress.done / progress.count * 100 : 0;
  if (percent === 100) return <span className="dash-complete" aria-hidden="true">✓</span>;
  return <svg className="dash-lab-progress" viewBox="0 0 32 32" aria-hidden="true">
    <circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" strokeWidth="1.2" />
    <circle cx="16" cy="16" r="10" fill="none" stroke="currentColor" strokeWidth="5" pathLength="100"
      strokeDasharray={`${percent} 100`} transform="rotate(-90 16 16)" />
  </svg>;
}

function LessonRow({ lesson, bookmarked, hidden, link, toggle }: {
  lesson: LessonProgress; bookmarked: boolean; hidden: boolean; link: RouteLink; toggle: () => void;
}) {
  const { id, quiz, lab, progress } = lesson;
  const points = quiz?.last_score ?? quiz?.best_score;
  const href = link(id + '/');
  return <tr role="row" data-dashboard-lesson={id} data-current={lesson.last} hidden={hidden}>
    <td role="cell" className="dash-chapter" dir="ltr">{lesson.number}</td>
    <th role="rowheader" scope="row" className="dash-lesson-title">
      <a href={href}>{lesson.title}</a>
      <button className="dash-bookmark" type="button" data-review-lesson={id}
        aria-label={`نشان‌گذاری ${lesson.title} برای مرور`} aria-pressed={bookmarked}
        title="برای مرور در این مرورگر نشان کن" onClick={toggle}>
        <DashboardGlyph name="bookmark" className="dash-icon" />
      </button>
    </th>
    <td role="cell" className="dash-lesson-note"><a className="dash-cell-link" href={href}>
      <DashboardGlyph name="note" className="dash-icon" /><span>یادداشت {fa(Number(lesson.number))}</span>
    </a></td>
    <td role="cell" className="dash-lesson-fact">
      <span className="dash-mobile-label" aria-hidden="true">مطالعه</span>
      <span className="dash-cell-link"><DashboardGlyph name="book" className="dash-icon" />
        <span>{lesson.last ? 'آخرین یادداشت' : lesson.opened ? 'بازشده' : 'هنوز باز نشده'}</span>
      </span>
    </td>
    <td role="cell" className="dash-lesson-fact">
      <span className="dash-mobile-label" aria-hidden="true">آزمون</span>
      {lesson.quiz_version ? <a className="dash-cell-link" href={link(quizPath(id, quiz?.last_id))}>
        {quiz ? <DashboardGlyph name="note" className="dash-icon" /> : <span className="dash-not-started" aria-hidden="true">
          <DashboardGlyph name="minus" className="dash-icon" />
        </span>}
        <span>{quiz ? 'نتیجهٔ ثبت‌شده' : 'هنوز شرکت نکرده'}
          {points != null && Number.isFinite(Number(points)) && quiz?.maximum && Number(quiz.maximum) > 0
            ? <small dir="ltr">{en(Number(points))} / {en(Number(quiz.maximum))}</small> : null}
        </span>
      </a> : '—'}
    </td>
    <td role="cell" className="dash-lesson-fact">
      <span className="dash-mobile-label" aria-hidden="true">لابراتور</span>
      {lab ? <a className="dash-cell-link dash-lab-status" href={link(lab.path)}>
        <ProgressIcon progress={progress} />
        <span>{progress?.status === 'ready' ? <span className="dash-lab-metric" dir="ltr">
          <bdi>{en(progress.done)} / {en(progress.count)}</bdi><span aria-hidden="true">·</span><bdi>{en(progress.xp)} XP</bdi>
        </span> : 'دریافت نشد'}</span>
      </a> : '—'}
    </td>
  </tr>;
}

export function LearningPath({ course, lessons, single, onlyBookmarked, bookmarks, link, toggle }: {
  course: DashboardCourse; lessons: LessonProgress[]; single: boolean; onlyBookmarked: boolean;
  bookmarks: Set<string>; link: RouteLink; toggle: (id: string) => void;
}) {
  const heading = 'dash-course-' + course.id;
  return <section className="dash-course" aria-labelledby={heading}
    hidden={onlyBookmarked && !lessons.some(lesson => bookmarks.has(lesson.id))}>
    <header className="dash-section-heading">
      <p lang="en" dir="ltr">{course.display_title || course.title}</p>
      <h2 id={heading}><DashboardGlyph name="map" />{single ? 'مسیر یادگیری من' : course.title}</h2>
    </header>
    <div className="dash-table-wrap">
      <table className="dash-lesson-table" role="table">
        <caption className="sr-only">وضعیت یادداشت‌ها، مطالعه، آزمون و لابراتور</caption>
        <thead role="rowgroup"><tr role="row">
          {['#', 'عنوان فصل', 'یادداشت', 'مطالعه', 'آزمون', 'لابراتور'].map(label =>
            <th key={label} role="columnheader" scope="col">{label}</th>)}
        </tr></thead>
        <tbody role="rowgroup">{lessons.map(lesson =>
          <LessonRow key={lesson.id} lesson={lesson} bookmarked={bookmarks.has(lesson.id)}
            hidden={onlyBookmarked && !bookmarks.has(lesson.id)} link={link} toggle={() => toggle(lesson.id)} />)}
        </tbody>
      </table>
    </div>
  </section>;
}
