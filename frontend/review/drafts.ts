import type { Editor, Reflection, ReviewOptions, Run } from './contracts';

export const noteKey = (id?: string) => 'note:' + (id || 'new');
export const reflectionKey = (id: string) => 'reflection:' + id;
export const pendingKey = (id: string) => 'pending:' + id;

type NoteDraft = Pick<Editor, 'request' | 'title' | 'note' | 'concept' | 'revision'>;
export function createDrafts({ storage, userId }: Pick<ReviewOptions, 'storage' | 'userId'>) {
  const prefix = 'classroom-review-notebook:' + userId + ':';
  function read(key: string): unknown {
    try { return JSON.parse(storage?.getItem(prefix + key) || 'null'); } catch { return null; }
  }
  function write(key: string, value: object | null) {
    try {
      if (!storage) return false;
      if (value === null) storage.removeItem(prefix + key);
      else storage.setItem(prefix + key, JSON.stringify(value));
      return true;
    } catch { return false; }
  }
  function record(key: string) {
    const value = read(key);
    return value && typeof value === 'object' ? value as Record<string, unknown> : {};
  }
  function note(id?: string): Partial<NoteDraft> {
    const { request, title, note, concept, revision } = record(noteKey(id));
    return typeof request === 'string' && typeof title === 'string' && typeof note === 'string' &&
      typeof concept === 'string' && typeof revision === 'number'
      ? { request, title, note, concept, revision } : {};
  }
  function saveNote(draft: Editor) {
    const { entry, request, title, note, concept, revision } = draft;
    const unchanged = entry ? title === entry.title && note === entry.note : !title && !note && !concept;
    return write(noteKey(entry?.id), unchanged ? null : { request, title, note, concept, revision });
  }
  function reflection(id: string) {
    const { text, revision } = record(reflectionKey(id));
    return typeof text === 'string' && typeof revision === 'number' ? { text, revision } : null;
  }
  function saveReflection(id: string, draft: Reflection) {
    return write(reflectionKey(id), draft.text === draft.saved ? null : { text: draft.text, revision: draft.revision });
  }
  function pending(id: string): { run: Run; answer: string | null } | null {
    const { run, answer } = record(pendingKey(id));
    if (!run || typeof run !== 'object') return null;
    const value = run as Partial<Run>;
    if (value.entry_id !== id || typeof value.id !== 'string' || typeof value.question?.stem !== 'string' ||
      !Array.isArray(value.question.options) || !value.question.options.every(item => typeof item === 'string') ||
      (answer !== null && (typeof answer !== 'string' || !/^\d+$/.test(answer) || Number(answer) >= value.question.options.length))) return null;
    return { run: value as Run, answer };
  }
  return { note, reflection, saveNote, saveReflection, pending, write };
}
