import { useMemo, useRef, useState } from 'react';
import { dashboardModel } from '../../web/assets/dashboard-model.mjs';
import type { DashboardActions, DashboardView, ReadyDashboard } from './contracts';
import { DashboardGreeting, LearningContinuation, PersonalReviewCard } from './DashboardOverview';
import { DashboardGlyph } from './DashboardGlyph';
import { LearningPath } from './LearningPath';
import { QuizResults, SkillsAndBadges } from './ProgressDetails';
import { DashboardError, DashboardGuest, DashboardMembership } from './DashboardAccess';

function ReadyPage({ view, actions }: { view: ReadyDashboard; actions: DashboardActions }) {
  const { input, name, memberships, reviewDue } = view;
  const { link, retry, saveBookmarks } = actions;
  const model = useMemo(() => dashboardModel(input), [input]);
  const [bookmarks, setBookmarks] = useState(() => new Set(view.bookmarks));
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);
  const filter = useRef<HTMLButtonElement>(null);
  const lessonsById = useMemo(() => new Map(model.lessons.map(lesson => [lesson.id, lesson])), [model]);
  const receipts = input.results.flatMap(receipt => {
    const lesson = lessonsById.get(receipt.lesson_id);
    return lesson ? [{ receipt, lesson }] : [];
  });

  function toggle(id: string) {
    const next = new Set(bookmarks);
    if (next.has(id)) {
      if (onlyBookmarked) filter.current?.focus();
      next.delete(id);
    } else next.add(id);
    setBookmarks(next);
    saveBookmarks([...next]);
  }

  return <>
    <DashboardGreeting name={name} model={model} retry={retry} />
    <LearningContinuation model={model} link={link} retry={retry} />
    <PersonalReviewCard due={reviewDue} href={link('review/')} />
    {model.lessons.length > 0 && <div className="dash-path-tools">
      <button ref={filter} className="dash-review-toggle" data-review-filter="" aria-pressed={onlyBookmarked}
        type="button" onClick={() => setOnlyBookmarked(value => !value)}>
        <DashboardGlyph name="bookmark" className="dash-icon" /> فقط یادداشت‌های نشان‌شده
      </button>
    </div>}
    {model.courses.map(course => <LearningPath key={course.id} course={course}
      lessons={course.lessons.flatMap(({ id }) => {
        const lesson = lessonsById.get(id);
        return lesson ? [lesson] : [];
      })}
      single={model.courses.length === 1} onlyBookmarked={onlyBookmarked} bookmarks={bookmarks} link={link} toggle={toggle} />)}
    <p className="dash-empty-review" role="status"
      hidden={!onlyBookmarked || model.lessons.some(lesson => bookmarks.has(lesson.id))}>هنوز یادداشتی برای مرور نشان نکرده‌ای.</p>
    <SkillsAndBadges model={model} link={link} />
    <DashboardMembership items={memberships} actions={actions} />
    <QuizResults receipts={receipts} link={link} />
  </>;
}

export function DashboardPage({ view, actions }: { view: DashboardView; actions: DashboardActions }) {
  switch (view.phase) {
    case 'loading': return <p className="dash-empty-note" role="status">در حال دریافت مسیر یادگیری…</p>;
    case 'guest': return <DashboardGuest login={view.login} />;
    case 'error': return <DashboardError kind={view.kind} retry={actions.retry} />;
    case 'ready': return <ReadyPage view={view} actions={actions} />;
  }
}
