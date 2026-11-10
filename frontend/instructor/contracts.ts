import type { QuizFigure } from '../quiz/contracts';
import type { QuizResultProps } from '../quiz-result/QuizResult';

export type View = 'overview' | 'students' | 'attempts' | 'labs' | 'requests';
export type ListView = Exclude<View, 'overview'>;
export type Status = 'active' | 'pending' | 'suspended';
type Score = { score?: number | null; maximum?: number | null };
export type Attempt = Score & { id: string; name?: string; email?: string; lesson_id: string; title?: string; version: number; attempt_no: number; created_at: string };
export type Mission = { mission: string; title?: string; ordinal?: number; completed: string[]; completed_count?: number;
  task_count: number; xp: number; maximum: number; last_at?: string; tasks?: { id: string; position: number }[] };
export type LabTotals = { xp: number; maximum: number; completed: number; task_count: number; attempts: number; last_at?: string; missions: Mission[] };
export type Person = { user_id: string; name?: string; email?: string; status: Status; created_at?: string; requested_at?: string; lab: LabTotals;
  latest_quiz?: (Score & { lesson_id: string; version: number }) | null; last_registered_at?: string; quiz_attempts?: number };
export type Concept = { lesson_id: string; version: number; question_id: string; skill?: string; responses: number; correct: number;
  stem?: string; code?: string; blanks?: { id: string }[]; options?: [string,string][]; choice_counts?: Record<string, number>; figure?: QuizFigure };
export type Lesson = { id: string; title: string; number?: string | number; ordinal?: number; lab?: { mission: string; title?: string };
  lab_steps?: { id: string; title: string }[] };
export type Course = { id: string; title: string; display_title?: string; lessons: Lesson[] };
export type TeacherCourse = { course_id: string; title: string };
export type Overview = { schema_version: 1; server_now?: string; stats: { active_students: number; pending_students: number; total_attempts: number };
  pending: Pick<Person,'user_id'|'name'|'created_at'>[]; lessons?: Lesson[]; concepts: Concept[];
  labs: (Pick<Mission,'mission'|'title'|'ordinal'|'task_count'|'maximum'> & { completed_students: number; students: number })[] };
export type Cursor = Record<string, unknown>;
export type Filter = { query: string; status?: string; lesson?: string | null; kind?: string; section?: string; mission?: string;
  cursors: (Cursor | null)[]; index: number; asOf?: string | null };
export type Page<T> = { rows: T[]; total: number; page_size: number; next_cursor: Cursor | null; as_of?: string | null };
export type Report<T> = { data?: Page<T>; loading?: boolean; error?: unknown };
export type History = Report<Attempt> & { index: number; cursors: (Cursor|null)[]; asOf?: string | null };
export type Receipt = QuizResultProps['record'] & { lesson_id: string; version: number; prompts?: (QuizResultProps['prompts'][number] & { figure?: QuizFigure })[] };
export type Sheet =
  | { kind: 'student' | 'request'; user: string; person?: Person; error?: unknown; history: History }
  | { kind: 'attempt'; id: string; from?: string; row?: Attempt; record?: Receipt; error?: unknown }
  | { kind: 'question'; question: Concept };
export type Confirmation = { course: string; user: string; status: 'active'|'suspended'; name?: string; email?: string; busy: boolean; error?: unknown };
export type State = { course: string; view: View; overview?: Overview; overviewError?: unknown; overviewLoading: boolean;
  filters: Record<ListView, Filter>; pages: Partial<Record<ListView, Report<Person | Attempt>>>;
  concepts: Concept[]; conceptError?: unknown; conceptLoading: boolean;
  sheet?: Sheet; confirmation?: Confirmation; mutating: boolean; accessError?: unknown; exporting: boolean; exportProgress: string; toast: string };
export type InstructorOptions = { courses: TeacherCourse[]; catalog: Course[]; rpc: (name: string,args: Record<string, unknown>)=>Promise<unknown>;
  url: (path: string)=>string; isCurrent: ()=>boolean };
