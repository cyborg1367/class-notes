export type ExamStatus = 'available' | 'in_progress' | 'completed' | 'scheduled' | 'closed' | 'unavailable';

export type ExamSummary = {
  id: string;
  course_id: string;
  title: string;
  subtitle?: string;
  description: string;
  duration_minutes: number;
  question_count: number;
  status: ExamStatus;
  attempts_used?: number;
  attempts_allowed?: number | null;
  best_score?: number | null;
  maximum_score?: number | null;
  last_attempt_id?: string | null;
  available_from?: string | null;
  available_until?: string | null;
};

export type ExamOption = { id: string; text: string };
export type ExamVisual = 'validation_curve' | 'decision_boundary' | 'confusion_matrix';
export type ExamQuestion = {
  id: string;
  skill: string;
  stem: string;
  options: ExamOption[];
  visual?: ExamVisual;
};

export type ExamAnswers = Record<string, string>;

export type ExamAttempt = {
  id: string;
  exam_id: string;
  status: 'in_progress' | 'submitted' | 'expired';
  started_at: string;
  expires_at: string;
  server_now?: string;
  answers: ExamAnswers;
  questions: ExamQuestion[];
};

export type ExamReview = {
  id: string;
  skill: string;
  stem: string;
  options: ExamOption[];
  visual?: ExamVisual;
  selected_option: string | null;
  correct_option: string;
  is_correct: boolean;
  rationale: string;
  selected_explanation?: string | null;
};

export type ExamReceipt = {
  id: string;
  status: 'submitted' | 'expired';
  score: number;
  maximum_score: number;
  correct_count: number;
  question_count: number;
  submitted_at: string;
  feedback: ExamReview[];
  feedback_rating?: number | null;
  feedback_comment?: string | null;
};

export type ExamRunnerProps = {
  exam: ExamSummary;
  activeAttempt?: ExamAttempt | null;
  receipt?: ExamReceipt | null;
  examListURL: string;
  storage: { read: (key: string) => unknown; write: (key: string, value: unknown) => boolean };
  onStart: (code: string) => Promise<ExamAttempt>;
  isTeacher?: boolean;
  onSave: (attemptId: string, answers: ExamAnswers) => Promise<unknown>;
  onSubmit: (attemptId: string, answers: ExamAnswers) => Promise<ExamReceipt>;
  onCommitted: () => void;
  onFeedback: (attemptId: string, rating: number, comment: string) => Promise<{ rating: number; comment: string }>;
  isCurrent: () => boolean;
  errorText: (error: unknown) => string;
};
