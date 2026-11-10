import type { ReactNode } from 'react';
import { PaperIcon } from '../components/PaperIcon';
import { fa, latin, message } from '../../web/assets/instructor-model.mjs';
import type { Lesson, Person, State, Course, TeacherCourse, Status } from './contracts';

export function PersonCell({ person }: { person: Pick<Person,'name'|'email'> }) {
  return <><strong>{person.name || person.email || 'دانشجو'}</strong>{person.email && <bdi className="email">{person.email}</bdi>}</>;
}
export function StatusPill({ status }: { status: Status }) {
  return <span className={'pill ' + (status === 'pending' ? 'pending' : status === 'suspended' ? 'off' : '')}>
    {{ active: 'دارای دسترسی', pending: 'در انتظار', suspended: 'بدون دسترسی' }[status] || '—'}
  </span>;
}
export function Grade({ score }: { score?: { score?: number | string | null; maximum?: number | string | null } | null }) {
  return score?.score != null && score.maximum != null && Number.isFinite(Number(score.score)) && Number.isFinite(Number(score.maximum))
    ? <bdi dir="ltr">{fa(score.score)} / {fa(score.maximum)}</bdi> : <>—</>;
}
export function XP({ lab }: { lab?: { xp: number; maximum: number } | null }) {
  return lab && lab.maximum > 0 ? <bdi className="mono xp" dir="ltr">{latin(lab.xp)} / {latin(lab.maximum)} XP</bdi> : <>—</>;
}
export function Bar({ value, max }: { value: number; max: number }) {
  const width = max > 0 ? Math.max(0, Math.min(100, value / max * 100)) : 0;
  return <div className="bar" role="img" aria-label={fa(value) + ' از ' + fa(max)}><i style={{ width: width + '%' }} /></div>;
}
export function Loading({ children = 'در حال دریافت گزارش…' }: { children?: ReactNode }) {
  return <div className="empty" role="status"><span className="spinner" aria-hidden="true" />{children}</div>;
}
export function Empty({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return <div className="empty"><PaperIcon name="note" /><h2>{title}</h2><p>{children}</p>{action}</div>;
}
export function Failure({ error, retry }: { error: unknown; retry: () => void }) {
  return <Empty title="گزارش دریافت نشد" action={<button className="btn primary" type="button" onClick={retry}>دریافت دوباره</button>}>
    {message(error)}
  </Empty>;
}
export function viewLabels(state: State, courses: TeacherCourse[], catalog: Course[]) {
  const course = catalog.find(course => course.id === state.course);
  const lessons = state.overview?.lessons || course?.lessons || [];
  const lessonInfo = (id: string): Lesson | undefined => lessons.find(item => item.id === id) || course?.lessons.find(item => item.id === id);
  const noteLabel = (id: string) => {
    const lesson = lessonInfo(id);
    return lesson?.ordinal ? 'یادداشت ' + fa(lesson.ordinal) : lesson?.number ? 'یادداشت ' + fa(lesson.number) : lesson?.title || id;
  };
  return { course, lessons, lessonInfo, noteLabel, courseTitle: courses.find(item => item.course_id === state.course)?.title || course?.display_title || course?.title || state.course,
    labTitle: (mission: string, title?: string) => course?.lessons.find(item => item.lab?.mission === mission)?.lab?.title || title || 'لابراتور' };
}
export type Labels = ReturnType<typeof viewLabels>;
