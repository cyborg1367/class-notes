import type { QuizResultProps } from '../quiz-result/QuizResult';

export type Answer = string | Record<string, string>;
export type Answers = Record<string, Answer>;
export type Blank = { id: string; label: string; input_kind: string };
export type Pair = readonly [number, number];
export type QuizFigure =
  | { type: 'distance2d'; u: Pair; v: Pair }
  | { type: 'knn2d'; query: Pair; points: { id: string; x: Pair; y: number }[] };
type Prompt = { id: string; skill: string; stem: string; points: number | string; code?: string; figure?: QuizFigure };
export type Question = Prompt & ({ type: 'choice'; options: [string, string][] } | { type: 'fill'; blanks: Blank[] });
export type Quiz = { version: number; questions: Question[] };
export type Summary = NonNullable<QuizResultProps['summary']>;
export type Receipt = QuizResultProps['record'] & { id?: string };
export type Mode = 'practice' | 'assessment';
export type FeedbackItem = { correct: boolean; explanation: string; review?: string; selected_feedback?: string; parts?: { id: string; correct: boolean }[] };
export type PracticeResponse = { hint?: string; items?: FeedbackItem[] };
export type Notice = { text: string; error?: boolean };
export type Feedback = { kind: 'notice'; text: string } | { kind: 'hint'; text: string } | { kind: 'check'; item: FeedbackItem };
export type FocusTarget = { kind: 'question'; id: string; ticket: number } | { kind: 'review'; ticket: number };
export type Pending = { id: string; version: number; answers: Answers };
export type QuizLinks = QuizResultProps['links'] & { course: string; results: string };

export type QuizOptions = {
  quiz: Quiz; lesson: string; userId: string; previousSummary?: Summary;
  links: QuizLinks;
  storage: { read: (key: string) => unknown; write: (key: string, value: unknown) => boolean };
  loadDraft: () => Promise<unknown>;
  saveDraft: (answers: Answers) => Promise<unknown>;
  practice: (id: string, answer: Answer | null, hint: boolean) => Promise<PracticeResponse>;
  submit: (pending: Pending) => Promise<Receipt>;
  onCommitted: () => void;
  refreshSummary: () => Promise<Summary | undefined>;
  isCurrent: () => boolean;
  requestId: () => string;
  errorText: (error: unknown) => string;
  normalizeBlank: (value: unknown) => string;
  blankError: (value: unknown, kind: string) => string;
  blankHelp: (kind: string) => string;
};

export type QuizView = {
  loading: boolean;
  mode: Mode;
  started: boolean;
  answers: Answers;
  pending: Pending | null;
  submitting: boolean;
  review: boolean;
  recovered: boolean;
  focus?: FocusTarget;
  feedback: Record<string, Feedback>;
  checking: Record<string, boolean>;
  draft: Notice;
  submission: Notice;
  receipt?: { record: Receipt; summary: Summary };
};
