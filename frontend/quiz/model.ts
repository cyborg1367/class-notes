import type { Answer, Answers, Pending, Question, QuizOptions } from './contracts';

export const emptyNotice = { text: '' };
export const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export function valueOf(answer: Answer | undefined, id: string) {
  return typeof answer === 'object' && typeof answer[id] === 'string' ? answer[id] : '';
}

export function questionState(question: Question, answer: Answer | undefined, options: Pick<QuizOptions, 'normalizeBlank' | 'blankError'>) {
  if (question.type === 'choice') {
    return { complete: question.options.some(([value]) => value === answer), partial: false, errors: {} as Record<string, string> };
  }
  const present = question.blanks.filter(blank => options.normalizeBlank(valueOf(answer, blank.id))).length;
  const errors = Object.fromEntries(question.blanks.flatMap(blank => {
    const error = options.blankError(valueOf(answer, blank.id), blank.input_kind);
    return error ? [[blank.id, error]] : [];
  }));
  return { complete: present === question.blanks.length, partial: present > 0 && present < question.blanks.length, errors };
}

export function savedAnswers(raw: unknown, questions: Question[]): Answers {
  if (!isObject(raw)) return {};
  const entries: [string, Answer][] = [];
  for (const question of questions) {
    const value = raw[question.id];
    if (question.type === 'choice') {
      if (typeof value === 'string' && question.options.some(([id]) => id === value)) entries.push([question.id, value]);
    } else if (isObject(value)) {
      entries.push([question.id, Object.fromEntries(question.blanks.flatMap(blank =>
        typeof value[blank.id] === 'string' ? [[blank.id, value[blank.id] as string]] : []))]);
    }
  }
  return Object.fromEntries(entries);
}

export function savedSubmission(raw: unknown, version: number): Pending | null {
  if (!isObject(raw) || raw.version !== version || typeof raw.id !== 'string' || !raw.id || !isObject(raw.answers)) return null;
  // A retry must send the original payload, including its original ID.
  const valid = Object.values(raw.answers).every(answer => typeof answer === 'string' ||
    (isObject(answer) && Object.values(answer).every(value => typeof value === 'string')));
  return valid ? { id: raw.id, version, answers: raw.answers as Answers } : null;
}

export function normalizedAnswer(question: Question, answer: Answer | undefined, normalize: QuizOptions['normalizeBlank'], includeEmpty = false) {
  if (question.type === 'choice') return typeof answer === 'string' ? answer : null;
  return Object.fromEntries(question.blanks.flatMap(blank =>
    includeEmpty || (typeof answer === 'object' && typeof answer[blank.id] === 'string')
      ? [[blank.id, normalize(valueOf(answer, blank.id))]] : []));
}
