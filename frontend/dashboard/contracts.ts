import type { PublicCourse, PublicLesson } from '../catalog/types';

export type DashboardLesson = PublicLesson & {
  lab?: { path: string; mission: string; title: string };
  lab_steps?: { id: string; title: string }[];
  practice_skills?: { task: string; label: string }[];
  dashboard_art?: string;
};
export type DashboardCourse = Omit<PublicCourse, 'lessons'> & { lessons: DashboardLesson[] };
export type QuizReceipt = {
  lesson_id: string;
  version: number;
  attempts: number;
  last_id?: string;
  last_at?: string;
  first_score?: number;
  best_score?: number;
  last_score?: number | null;
  maximum?: number;
};
export type LabTask = { id: string; position: number };
export type LabSnapshot = {
  mission: string; tasks: LabTask[]; completed?: string[];
  xp: number; maximum: number; badge?: boolean; attempts?: number;
};
export type LabResult = { status: 'fulfilled'; value: LabSnapshot } | { status: 'rejected' };
export type LabProgress = { status: 'unavailable' } | {
  status: 'ready'; xp: number; maximum: number; tasks: LabTask[]; completed: Set<string>;
  done: number; count: number; finished: boolean; nextTitle: string; attempts: number;
};
export type LessonProgress = DashboardLesson & {
  course: DashboardCourse; opened: boolean; last: boolean;
  quiz: QuizReceipt | null; progress: LabProgress | null;
};
export type DashboardInput = {
  courses: DashboardCourse[];
  results: QuizReceipt[];
  study: Record<string, { last: string | null; opened: string[] }>;
  states: Record<string, LabResult>;
};
export type DashboardModel = {
  courses: DashboardCourse[]; lessons: LessonProgress[]; labs: LessonProgress[];
  target: LessonProgress | null; mode: 'lab' | 'complete' | 'study' | 'unavailable' | null;
  skills: string[]; known: boolean; hasLabs: boolean; xp: number | null; maximum: number | null;
};
export type Membership = {
  id: string; title: string; status: 'pending' | 'suspended' | 'unavailable' | 'unregistered';
};
export type RouteLink = (path: string) => string;
export type DashboardActions = {
  link: RouteLink;
  retry: () => Promise<void>;
  refreshMembership: () => Promise<void>;
  requestAccess: (id: string) => Promise<void>;
  saveBookmarks: (ids: string[]) => void;
};
export type ReadyDashboard = {
  phase: 'ready';
  input: DashboardInput;
  name: string;
  memberships: Membership[];
  bookmarks: string[];
  reviewDue: number | null;
};
export type DashboardView =
  | { phase: 'loading' }
  | { phase: 'guest'; login: string }
  | { phase: 'error'; kind: 'membership' | 'dashboard' }
  | ReadyDashboard;
