import { reviewSessionEntries } from '../../web/assets/review.mjs';
import type { Editor, Entry, Filters, Notebook, Practice, PracticeBase, ReviewOptions, ReviewView, Run } from './contracts';
import { createDrafts, noteKey, pendingKey, reflectionKey } from './drafts';
import { hasError, reviewError } from './messages';

const blankNotebook: Notebook = { entries: [], concepts: [] };
type StartStage = 'reason' | 'concept' | 'question';

export function createReviewController(options: ReviewOptions) {
  const { rpc, isCurrent, requestId, updateURL } = options;
  const drafts = createDrafts(options);
  const initial = new URL(options.initialURL);
  const lesson = initial.searchParams.get('lesson');
  let view: ReviewView = {
    phase: 'loading', notebook: blankNotebook, busy: false, notice: '', error: false,
    filters: { tab: 'due', search: '', lesson: options.lessons.some(l => l.id === lesson) ? lesson! : '' },
    editor: null, practice: null,
  };
  const listeners = new Set<() => void>();
  let disposed = false;
  let operation: Promise<void> | null = null;
  const alive = () => !disposed && isCurrent();
  const publish = (patch: Partial<ReviewView>) => {
    if (!alive()) return;
    view = { ...view, ...patch };
    listeners.forEach(listener => listener());
  };
  const notice = (text: string, error = false) => publish({ notice: text, error });
  const find = (id: string) => view.notebook.entries.find(entry => entry.id === id);
  const replaceEntry = (entry: Entry) => {
    const notebook = view.notebook, exists = Boolean(find(entry.id));
    publish({ notebook: { ...notebook, entries: exists
      ? notebook.entries.map(item => item.id === entry.id ? entry : item) : [entry, ...notebook.entries] } });
  };

  function act(work: () => Promise<void>) {
    if (operation || !alive()) return operation ?? Promise.resolve();
    operation = Promise.resolve().then(async () => {
      if (!alive()) return;
      try { await work(); }
      catch (error) { notice(reviewError(error), true); }
    }).finally(() => { operation = null; publish({ busy: false }); });
    publish({ busy: true });
    return operation;
  }
  async function reload() {
    const notebook = await rpc('classroom_review_state');
    if (!alive()) return false;
    if (!Array.isArray(notebook?.entries) || !Array.isArray(notebook?.concepts)) throw Error('REVIEW_INVALID_RESPONSE');
    publish({ notebook });
    return true;
  }
  function library(text = '') {
    updateURL(null);
    publish({ practice: null, notice: text, error: false });
  }
  function setFilters(filters: Partial<Filters>) {
    publish({ filters: { ...view.filters, ...filters } });
  }
  function showPractice(practice: Practice) {
    if (!alive()) return;
    updateURL(practice.entry.id, practice.stage === 'feedback' ? 'question' : practice.stage);
    publish({ practice, notice: '', error: false });
  }

  async function load() {
    return act(async () => {
      publish({ phase: 'loading', notice: '', error: false });
      try {
        if (!await reload()) return;
        publish({ phase: 'ready' });
        const id = initial.searchParams.get('practice'), requested = initial.searchParams.get('step');
        if (id && find(id)?.concept_id) await start(id, [], requested === 'question' || requested === 'concept' ? requested : 'reason');
      } catch (error) {
        if (view.phase === 'loading') publish({ phase: 'error' });
        notice(reviewError(error), true);
      }
    });
  }

  function openEditor(entry?: Entry) {
    if (!alive()) return;
    const saved = drafts.note(entry?.id);
    publish({ editor: {
      entry, request: saved.request ?? requestId(), title: saved.title ?? entry?.title ?? '',
      note: saved.note ?? entry?.note ?? '', concept: saved.concept ?? entry?.concept_id ?? '',
      revision: saved.revision ?? entry?.revision ?? 0, recovered: Boolean(saved.request),
      message: '', conflict: false,
    } });
  }
  function edit(patch: Partial<Pick<Editor, 'title' | 'note' | 'concept'>>) {
    if (!view.editor || view.busy || !alive()) return;
    const editor = { ...view.editor, ...patch };
    if (patch.concept !== undefined) {
      const concept = view.notebook.concepts.find(c => c.id === patch.concept);
      if (concept) editor.title = concept.title;
      editor.message = '';
    }
    drafts.saveNote(editor);
    publish({ editor });
  }
  function closeEditor() {
    if (view.busy || !alive()) return;
    if (view.editor) drafts.saveNote(view.editor);
    publish({ editor: null });
  }
  async function saveEditor(close: boolean) {
    const editor = view.editor;
    if (!editor) return true;
    if (editor.entry && editor.note === editor.entry.note && editor.title === editor.entry.title) {
      if (close) publish({ editor: null });
      return true;
    }
    if (!editor.title.trim() && !editor.concept) {
      if (!editor.note.trim() && !editor.title.trim()) return true;
      publish({ editor: { ...editor, message: 'برای یادداشتت یک عنوان بنویس.' } });
      return false;
    }
    const persisted = drafts.saveNote(editor);
    let saved: Entry;
    try {
      if (editor.entry) {
        const { id, bookmarked } = editor.entry;
        const revision = await rpc('classroom_review_save', {
          p_entry: id, p_revision: editor.revision, p_note: editor.note, p_bookmarked: bookmarked, p_title: editor.title,
        });
        saved = { ...editor.entry, revision, note: editor.note, title: editor.title, updated_at: new Date().toISOString() };
      } else {
        const id = await rpc('classroom_review_add', {
          p_owner: options.userId, p_request: editor.request, p_concept: editor.concept || null,
          p_title: editor.title, p_note: editor.note,
        });
        saved = { id, revision: 0, concept_id: editor.concept || null, title: editor.title.trim(),
          note: editor.note, bookmarked: false, due: Boolean(editor.concept), updated_at: new Date().toISOString() };
      }
    } catch (error) {
      const message = reviewError(error) + (persisted ? ' پیش‌نویس در همین مرورگر حفظ شده است.' : '');
      publish({ editor: { ...editor, message, conflict: hasError(error, 'REVIEW_NOTE_CONFLICT') } });
      return false;
    }
    if (!alive()) return false;
    drafts.write(noteKey(editor.entry?.id), null);
    replaceEntry(saved);
    publish({ editor: close ? null : { ...editor, entry: saved, title: saved.title, revision: saved.revision } });
    try { await reload(); }
    catch { if (close) notice('یادداشت ذخیره شد. فهرست دفتر کامل تازه نشد؛ می‌توانی صفحه را دوباره باز کنی.'); return alive(); }
    if (!alive()) return false;
    if (close) notice('یادداشت در حساب تو ذخیره شد.');
    return true;
  }
  async function compareNote() {
    const editor = view.editor;
    if (!editor?.entry || !await reload()) return;
    const entry = find(editor.entry.id);
    if (!entry) return;
    const next = { ...editor, entry, revision: entry.revision, remote: entry.note, conflict: false,
      message: 'دو نسخه را مقایسه کن. ذخیرهٔ بعدی متن فعلی تو را در حساب ثبت می‌کند.' };
    drafts.saveNote(next);
    publish({ editor: next });
  }

  async function bookmark(id: string) {
    const entry = find(id);
    if (!entry) return;
    try {
      const revision = await rpc('classroom_review_save', {
        p_entry: id, p_revision: entry.revision, p_title: entry.title, p_note: entry.note, p_bookmarked: !entry.bookmarked,
      });
      if (alive()) replaceEntry({ ...entry, bookmarked: !entry.bookmarked, revision });
    } catch (error) {
      if (hasError(error, 'REVIEW_NOTE_CONFLICT') && alive()) await reload();
      throw error;
    }
  }

  async function start(id: string, queue: string[], stage: StartStage = 'reason') {
    const entry = find(id);
    if (!entry?.concept_id) return;
    const context = await rpc('classroom_review_context', { p_entry: id });
    if (!alive()) return;
    if (context?.entry_id !== id || !context.concept) throw Error('REVIEW_INVALID_CONTEXT');
    const base: PracticeBase = { entry, context, queue, prepared: stage === 'concept' };
    const pending = drafts.pending(id);
    if (pending) {
      const question = { ...base, stage: 'question' as const, run: pending.run, selected: pending.answer };
      showPractice(question);
      await finish(question, pending.answer);
    } else if (stage === 'question' && !entry.paused) await openQuestion(base);
    else showPractice({ ...base, stage: entry.paused ? 'reason' : stage === 'concept' ? 'concept' : 'reason' });
  }
  async function openQuestion(base: PracticeBase) {
    const run = await rpc('classroom_review_open', { p_entry: base.entry.id, p_read_before: base.prepared });
    if (!alive()) return;
    if (run?.entry_id !== base.entry.id || !Array.isArray(run.question?.options) || !run.question.options.length) throw Error('REVIEW_INVALID_QUESTION');
    showPractice({ ...base, stage: 'question', run, selected: null });
  }
  function readConcept(practice: Practice) {
    showPractice({ ...practice, stage: 'concept', prepared: true });
  }
  async function chooseReading(direct: boolean) {
    const practice = view.practice;
    if (!practice || practice.stage !== 'reason') return;
    const { entry } = practice;
    if (entry.paused) {
      await rpc('classroom_review_pause', { p_entry: entry.id, p_revision: entry.revision, p_paused: false });
      if (!alive() || !await reload()) return;
      const current = find(entry.id);
      if (current) readConcept({ ...practice, entry: current });
    } else if (direct ? !entry.last_review : Boolean(entry.last_review || practice.prepared)) {
      await openQuestion(practice);
    } else readConcept(practice);
  }
  async function pause() {
    const entry = view.practice?.entry;
    if (!entry) return;
    await rpc('classroom_review_pause', { p_entry: entry.id, p_revision: entry.revision, p_paused: true });
    if (alive() && await reload()) library('مرور این موضوع متوقف شد؛ از «همه» می‌توانی دوباره فعالش کنی.');
  }

  async function finish(practice: Extract<Practice, { stage: 'question' }>, answer: string | null) {
    const { run, entry } = practice;
    drafts.write(pendingKey(entry.id), { run, answer });
    const receipt = await rpc('classroom_review_finish', { p_run: run.id, p_answer: answer });
    if (!alive()) return;
    if (!receipt || typeof receipt.correct !== 'boolean') throw Error('REVIEW_INVALID_RECEIPT');
    options.onProgress();
    const saved = receipt.reflection ?? '', draft = drafts.reflection(run.id);
    showPractice({ ...practice, stage: 'feedback', answer, receipt,
      reflection: { text: draft?.text ?? saved, revision: draft?.revision ?? receipt.reflection_revision ?? 0,
        saved, message: '', conflict: false } });
  }
  async function hint() {
    const practice = view.practice;
    if (practice?.stage !== 'question' || practice.run.hint_used) return;
    const text = await rpc('classroom_review_hint', { p_run: practice.run.id });
    publish({ practice: { ...practice, run: { ...practice.run, hint: text, hint_used: true } } });
  }
  async function reread() {
    const practice = view.practice;
    if (practice?.stage !== 'question') return;
    await rpc('classroom_review_open', { p_entry: practice.entry.id, p_read_before: true });
    if (alive()) readConcept(practice);
  }

  async function saveReflection() {
    const practice = view.practice;
    if (practice?.stage !== 'feedback') return true;
    const { reflection, run } = practice;
    if (reflection.text === reflection.saved) return true;
    const persisted = drafts.saveReflection(run.id, reflection);
    try {
      const saved = await rpc('classroom_review_reflect', { p_run: run.id, p_revision: reflection.revision, p_text: reflection.text });
      if (!alive()) return false;
      drafts.write(reflectionKey(run.id), null);
      publish({ practice: { ...practice, reflection: { ...saved, saved: saved.text, conflict: false, message: 'برداشت تو در حساب ذخیره شد.' } } });
      return true;
    } catch (error) {
      const conflict = hasError(error, 'REVIEW_REFLECTION_CONFLICT');
      const message = (conflict ? 'برداشت این مرور در پنجرهٔ دیگری تغییر کرده است.' : reviewError(error)) +
        (persisted ? ' پیش‌نویس در همین مرورگر حفظ شده است.' : '');
      publish({ practice: { ...practice, reflection: { ...reflection, conflict, message } } });
      return false;
    }
  }
  async function compareReflection() {
    const practice = view.practice;
    if (practice?.stage !== 'feedback') return;
    const remote = await rpc('classroom_review_reflect', { p_run: practice.run.id });
    if (!alive()) return;
    const reflection = { ...practice.reflection, revision: remote.revision, saved: remote.text, remote: remote.text, conflict: false,
      message: 'نسخهٔ حساب برای مقایسه نشان داده شد. ذخیرهٔ بعدی نوشتهٔ فعلی تو را ثبت می‌کند.' };
    drafts.saveReflection(practice.run.id, reflection);
    publish({ practice: { ...practice, reflection } });
  }
  async function leave(next: 'back' | 'next' | 'retry') {
    const practice = view.practice;
    if (!practice) return;
    if (practice.stage === 'feedback' && !await saveReflection()) return;
    if (!alive() || !await reload()) return;
    if (practice.stage === 'feedback') drafts.write(pendingKey(practice.entry.id), null);
    const [nextId, ...queue] = practice.queue;
    if (next === 'next' && nextId) await start(nextId, queue);
    else if (next === 'retry' && practice.stage === 'feedback') {
      const entry = find(practice.entry.id);
      if (!entry) { library(); return; }
      if (practice.receipt.correct) await openQuestion({ ...practice, entry, prepared: false });
      else readConcept({ ...practice, entry });
    } else library(next === 'next' ? 'نتیجهٔ مرور در حساب تو ثبت شد.' : '');
  }

  function persist() {
    const { editor, practice } = view;
    const noteSaved = !editor || drafts.saveNote(editor);
    const reflectionSaved = practice?.stage !== 'feedback' || drafts.saveReflection(practice.run.id, practice.reflection);
    return noteSaved && reflectionSaved;
  }

  return {
    getSnapshot: () => view,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    load, setFilters,
    openNote(id?: string) {
      if (view.busy || !alive()) return;
      const entry = id ? find(id) : undefined;
      if (!id || entry) openEditor(entry);
    },
    edit, closeEditor,
    saveNote: () => act(async () => { if (!await saveEditor(true)) return; if (view.editor) publish({ editor: null }); }),
    compareNote: () => act(compareNote),
    openEntry(id: string) {
      if (view.busy || !alive()) return;
      const entry = find(id);
      if (entry?.concept_id) void act(() => start(id, []));
      else if (entry) openEditor(entry);
    },
    reviewFromEditor: () => act(async () => {
      const id = view.editor?.entry?.id;
      if (id && await saveEditor(false) && alive()) { publish({ editor: null }); await start(id, []); }
    }),
    startSession() {
      if (view.busy || !alive()) return;
      const [first, ...rest] = reviewSessionEntries(view.notebook);
      if (first) void act(() => start(first.id, rest.map(entry => entry.id)));
      else if (view.notebook.entries.length) setFilters({ tab: 'all' });
      else openEditor();
    },
    bookmark: (id: string) => act(() => bookmark(id)),
    chooseReading: (direct: boolean) => act(() => chooseReading(direct)),
    pause: () => act(pause),
    reason() { if (!view.busy && view.practice) showPractice({ ...view.practice, stage: 'reason' }); },
    openQuestion: () => act(async () => { if (view.practice) await openQuestion(view.practice); }),
    select(answer: string) {
      if (!view.busy && view.practice?.stage === 'question') publish({ practice: { ...view.practice, selected: answer } });
    },
    hint: () => act(hint),
    reread: () => act(reread),
    answer(skip = false) {
      return act(async () => {
        const practice = view.practice;
        if (practice?.stage === 'question' && (skip || practice.selected !== null)) await finish(practice, skip ? null : practice.selected);
      });
    },
    leave: (direction: 'back' | 'next' | 'retry') => act(() => leave(direction)),
    editReflection(text: string) {
      const practice = view.practice;
      if (!alive() || view.busy || practice?.stage !== 'feedback') return;
      const reflection = { ...practice.reflection, text };
      drafts.saveReflection(practice.run.id, reflection);
      publish({ practice: { ...practice, reflection } });
    },
    saveReflection: () => act(async () => { await saveReflection(); }),
    compareReflection: () => act(compareReflection),
    persist,
    async prepareSignOut() {
      await operation;
      if (!alive()) return { saved: true };
      const localSaved = persist();
      let saved = false;
      await act(async () => {
        const noteSaved = await saveEditor(false);
        const reflectionSaved = await saveReflection();
        saved = noteSaved && reflectionSaved;
      });
      return { saved, localSaved };
    },
    dispose() { if (!disposed) persist(); disposed = true; listeners.clear(); },
  };
}

export type ReviewController = ReturnType<typeof createReviewController>;
