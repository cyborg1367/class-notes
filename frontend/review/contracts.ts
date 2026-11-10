export type Lesson = {
  id: string; title: string; lab?: { mission: string; path: string };
  lab_steps?: { id: string; title: string }[];
};
export type Learning = { goal?: string; core?: string; example?: string; pitfall?: string; reflection_prompt?: string };
export type Concept = {
  id: string; title: string; lesson_id: string; review_anchor?: string | null;
  description?: string; learning?: Learning | null;
};
export type Outcome = { correct: boolean; hint_used?: boolean; preparation_used?: boolean | null };
export type Source = { kind?: string; description?: string };
export type HistoryItem = Outcome & { at?: string; reflection?: string };
export type Entry = {
  id: string; concept_id?: string | null; title: string; note: string; revision: number;
  due: boolean; bookmarked: boolean; paused?: boolean; last_review?: string | null;
  next_due?: string | null; updated_at?: string;
  source?: Source | null; history?: HistoryItem[]; last_reflection?: { text: string; at?: string } | null;
};
export type Notebook = { entries: Entry[]; concepts: Concept[] };
export type Tab = 'due' | 'all' | 'bookmarked';
export type Filters = { tab: Tab; search: string; lesson: string };
export type Evidence = Source & {
  at?: string; lesson_id?: string; attempt_id?: string; prompt?: string; code?: string; answer?: string;
  mission?: string; task?: string; feedback_code?: string; completed?: boolean; passed_later?: boolean;
};
export type Context = { entry_id: string; concept: Concept; evidence: Evidence[] };
export type Run = {
  id: string; entry_id: string; question: { stem: string; options: string[] };
  hint_used?: boolean; hint?: string | null;
};
export type Receipt = Outcome & {
  answer?: string; explanation?: string; next_due?: string | null;
  reflection?: string | null; reflection_revision?: number;
};
export type Writing = { text: string; revision: number };
export type SaveNote = { p_entry: string; p_revision: number; p_title: string; p_note: string; p_bookmarked: boolean };

type Calls = {
  classroom_review_state: [undefined, Notebook];
  classroom_review_context: [{ p_entry: string }, Context];
  classroom_review_open: [{ p_entry: string; p_read_before: boolean }, Run];
  classroom_review_hint: [{ p_run: string }, string];
  classroom_review_finish: [{ p_run: string; p_answer: string | null }, Receipt];
  classroom_review_save: [SaveNote, number];
  classroom_review_add: [{ p_owner: string; p_request: string; p_concept: string | null; p_title: string; p_note: string }, string];
  classroom_review_pause: [{ p_entry: string; p_revision: number; p_paused: boolean }, number];
  classroom_review_reflect: [{ p_run: string; p_revision?: number; p_text?: string }, Writing];
};
export type RPC = <Name extends keyof Calls>(name: Name, ...args: Calls[Name][0] extends undefined
  ? [] : [Calls[Name][0]]) => Promise<Calls[Name][1]>;

export type Editor = {
  entry?: Entry; request: string; title: string; note: string; concept: string; revision: number;
  recovered: boolean; message: string; conflict: boolean; remote?: string;
};
export type Reflection = Writing & { saved: string; message: string; conflict: boolean; remote?: string };
export type PracticeBase = { entry: Entry; context: Context; prepared: boolean; queue: string[] };
export type Practice = PracticeBase & (
  { stage: 'reason' | 'concept' } |
  { stage: 'question'; run: Run; selected: string | null } |
  { stage: 'feedback'; run: Run; answer: string | null; receipt: Receipt; reflection: Reflection }
);
export type ReviewView = {
  phase: 'loading' | 'error' | 'ready';
  notebook: Notebook; filters: Filters; busy: boolean; notice: string; error: boolean;
  editor: Editor | null; practice: Practice | null;
};
export type ReviewOptions = {
  rpc: RPC; url: (route: string) => string; userId: string; lessons: Lesson[];
  isCurrent: () => boolean; storage?: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
  initialURL: string; updateURL: (entry: string | null, step?: string) => void;
  onProgress: () => void; requestId: () => string;
};
