import type { Answer, Answers, Mode, Pending, QuizOptions, QuizView, Receipt, Summary } from './contracts';
import { emptyNotice, isObject, normalizedAnswer, questionState, savedAnswers, savedSubmission } from './model';

const restored = 'وضعیت ارسال قبلی هنوز مشخص نشده است. همین پاسخ‌ها را دوباره بررسی کن؛ تلاش تکراری ثبت نمی‌شود.';

export function createQuizController(options: QuizOptions) {
  const { quiz, lesson, userId, storage } = options;
  const key = `classroom-quiz:${userId}:${lesson}:v${quiz.version}`;
  const pendingKey = key + ':pending';
  const questions = new Map(quiz.questions.map(question => [question.id, question]));
  const listeners = new Set<() => void>();
  const pending = savedSubmission(storage.read(pendingKey), quiz.version);
  const local = savedAnswers(storage.read(key), quiz.questions);
  let view: QuizView = { loading: true, mode: 'assessment', started: Boolean(pending),
    answers: pending ? savedAnswers(pending.answers, quiz.questions) : local, pending,
    submitting: false, review: false, recovered: false, feedback: {}, checking: {}, draft: emptyNotice,
    submission: pending ? { text: restored } : emptyNotice };
  let disposed = false, revision = 0, focusTicket = 0, practiceEpoch = 0, committed = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let queue: Promise<unknown> = Promise.resolve();
  const current = () => !disposed && options.isCurrent();
  function update(patch: Partial<QuizView>) {
    if (!current()) return;
    view = { ...view, ...patch };
    listeners.forEach(listener => listener());
  }
  const focused = (id: string) => ({ kind: 'question' as const, id, ticket: ++focusTicket });
  const stateOf = (id: string) => questionState(questions.get(id)!, view.answers[id], options);
  const incomplete = () => quiz.questions.find(question => !stateOf(question.id).complete);

  async function load() {
    let answers = view.answers;
    if (!pending && !Object.keys(local).length) {
      try { answers = savedAnswers(await options.loadDraft(), quiz.questions); }
      catch { update({ draft: { error: true, text: 'پیش‌نویس حساب دریافت نشد؛ پاسخ‌های همین مرورگر، در صورت وجود، حفظ شده‌اند.' } }); }
    }
    const recovered = quiz.questions.some(question => {
      const answer = answers[question.id];
      return typeof answer === 'string' ? Boolean(answer) : Boolean(answer && Object.values(answer).some(Boolean));
    });
    update({ loading: false, answers, recovered, ...(pending ? { focus: focused(quiz.questions[0].id) } : {}) });
  }

  function save(answers: Answers) {
    const rev = ++revision, localOK = storage.write(key, answers);
    update({ draft: { error: !localOK, text: localOK ? 'پیش‌نویس در این مرورگر ذخیره شد.' : 'ذخیره در مرورگر ممکن نشد؛ در حال تلاش برای ذخیره در حساب…' } });
    clearTimeout(timer);
    timer = setTimeout(() => {
      queue = queue.then(async () => {
        if (!current() || committed || view.pending || rev !== revision) return;
        try {
          await options.saveDraft(answers);
          if (rev === revision && !view.pending) update({ draft: { text: 'پیش‌نویس در حساب ذخیره شد.' } });
        } catch {
          if (rev === revision && !view.pending) update({ draft: { error: true, text: localOK ? 'ذخیره در حساب کامل نشد؛ پیش‌نویس مرورگر باقی است.' : 'پیش‌نویس ذخیره نشد؛ پیش از بستن صفحه، پاسخ‌ها را نزد خودت نگه دار.' } });
        }
      });
    }, 800);
  }

  async function prepareSignOut() {
    clearTimeout(timer);
    await queue;
    if (!current() || committed || !revision) return { saved: true };
    const localSaved = storage.write(key, view.answers);
    if (view.pending) return { saved: true, localSaved };
    try {
      await options.saveDraft(view.answers);
      return { saved: true, localSaved };
    } catch { return { saved: false, localSaved }; }
  }

  function setMode(mode: Mode) {
    if (!current() || view.pending || committed || mode === view.mode) return;
    practiceEpoch++;
    update({ mode, feedback: {}, review: false, submission: emptyNotice });
  }

  function start() {
    if (!view.loading && !view.started) update({ started: true, focus: focused(quiz.questions[0].id) });
  }

  function setAnswer(id: string, value: string, blank?: string) {
    if (!current() || !view.started || view.pending || committed) return;
    const question = questions.get(id);
    if (!question) return;
    const old = view.answers[id];
    let answer: Answer;
    if (question.type === 'choice') {
      if (!question.options.some(([option]) => option === value)) return;
      answer = value;
    } else {
      if (blank === undefined || !question.blanks.some(item => item.id === blank)) return;
      answer = { ...(typeof old === 'object' ? old : {}), [blank]: value };
    }
    const answers = { ...view.answers, [id]: answer };
    const feedback = { ...view.feedback };
    delete feedback[id];
    update({ answers, feedback, review: false, submission: emptyNotice });
    save(answers);
  }

  function focusQuestion(id: string) {
    if (questions.has(id)) update({ review: false, focus: focused(id) });
  }

  async function practice(id: string, hint: boolean) {
    const question = questions.get(id);
    if (!question || !current() || !view.started || view.mode !== 'practice' || view.pending || committed || view.checking[id]) return;
    const report = (text: string) => update({ feedback: { ...view.feedback, [id]: { kind: 'notice', text } } });
    if (!hint) {
      const state = stateOf(id);
      if (Object.keys(state.errors).length) {
        report('قالب پاسخ را اصلاح کن؛ هنوز درستی مفهوم بررسی نشده است.');
        focusQuestion(id);
        return;
      }
      if (!state.complete) { report('پاسخ این سؤال را کامل کن، سپس بررسی را بزن.'); return; }
    }
    const epoch = practiceEpoch, snapshot = view.answers[id];
    update({ checking: { ...view.checking, [id]: true } });
    try {
      const response = await options.practice(id, normalizedAnswer(question, snapshot, options.normalizeBlank, true), hint);
      if (!current() || practiceEpoch !== epoch || view.mode !== 'practice' || view.pending || committed) return;
      if (!hint && snapshot !== view.answers[id]) { report('پاسخ هنگام بررسی تغییر کرد؛ پاسخ جدید را دوباره بررسی کن.'); return; }
      const item = response.items?.[0];
      if (hint) update({ feedback: { ...view.feedback, [id]: { kind: 'hint', text: response.hint ?? '' } } });
      else if (item) update({ feedback: { ...view.feedback, [id]: { kind: 'check', item } } });
      else report(options.errorText(Error('QUIZ_FEEDBACK_UNAVAILABLE')));
    } catch (error) {
      if (current() && practiceEpoch === epoch && view.mode === 'practice' && !view.pending && !committed) report(options.errorText(error));
    } finally {
      const checking = { ...view.checking };
      delete checking[id];
      update({ checking });
    }
  }

  function validate() {
    const invalid = quiz.questions.find(question => Object.keys(stateOf(question.id).errors).length);
    if (!invalid) return true;
    update({ review: false, focus: focused(invalid.id), submission: { error: true,
      text: 'قالب بعضی پاسخ‌ها معتبر نیست. آن‌ها را اصلاح کن؛ این پیام دربارهٔ درست یا غلط بودن مفهوم نیست.' } });
    return false;
  }

  function fallbackSummary(record: Receipt): Summary {
    const score = record.result?.score ?? 0;
    return { first_score: options.previousSummary?.first_score ?? (Number(record.attempt_no) === 1 ? score : null),
      best_score: Math.max(Number(options.previousSummary?.best_score ?? score), Number(score)),
      last_score: score, attempts: record.attempt_no };
  }

  async function submit() {
    if (!current() || !view.started || view.mode !== 'assessment' || view.submitting || committed) return;
    if (!view.pending && (!view.review || !validate())) return;
    let submission = view.pending;
    if (!submission) {
      const answers = Object.fromEntries(quiz.questions.flatMap(question => {
        const answer = view.answers[question.id];
        if (answer == null) return [];
        const normalized = normalizedAnswer(question, answer, options.normalizeBlank);
        return normalized == null ? [] : [[question.id, normalized]];
      }));
      try { submission = { id: options.requestId(), version: quiz.version, answers }; }
      catch (error) { update({ submission: { error: true, text: options.errorText(error) } }); return; }
      storage.write(pendingKey, submission);
    }
    const request = submission;
    clearTimeout(timer);
    practiceEpoch++;
    update({ pending: request, submitting: true, review: false, feedback: {}, submission: { text: 'در حال ثبت و بررسی پاسخ‌ها…' } });
    let record: Receipt;
    try {
      await queue;
      if (!current()) return;
      record = await options.submit(request);
      if (!isObject(record)) throw Error('QUIZ_RECEIPT_UNAVAILABLE');
    } catch (error) {
      update({ submitting: false, submission: { error: true,
        text: options.errorText(error) + ' پاسخ‌های همین ارسال نگه داشته شده‌اند؛ برای مشخص‌شدن وضعیت، دوباره بررسی کن.' } });
      return;
    }
    if (!current()) return;
    committed = true;
    storage.write(pendingKey, null);
    storage.write(key, {});
    const receipt = { record: { ...record, answers: request.answers }, summary: fallbackSummary(record) };
    update({ submission: { text: 'نتیجه ثبت شد؛ در حال آماده‌سازی نمایش…' } });
    options.onCommitted();
    // A committed attempt cannot be re-sent if draft cleanup or refresh fails.
    try { await options.saveDraft({}); } catch { /* The server receipt is already available. */ }
    if (!current()) return;
    update({ pending: null, submitting: false, receipt, submission: { text: 'نتیجه در حساب ثبت شد.' } });
    try {
      const summary = await options.refreshSummary();
      if (summary) update({ receipt: { ...receipt, summary } });
    } catch { /* Keep the receipt and the best summary already available. */ }
  }

  function reviewSubmission() {
    if (!current() || !view.started || view.mode !== 'assessment' || view.submitting || committed) return;
    if (view.pending) { void submit(); return; }
    if (validate()) update({ review: true, submission: emptyNotice, focus: { kind: 'review', ticket: ++focusTicket } });
  }

  return {
    load, start, setMode, setAnswer, practice, focusQuestion, prepareSignOut, reviewSubmission, submit,
    findMissing() { const item = incomplete(); if (item) focusQuestion(item.id); },
    edit() { const item = incomplete() || quiz.questions[0]; focusQuestion(item.id); },
    getSnapshot: () => view,
    subscribe(listener: () => void) { listeners.add(listener); return () => listeners.delete(listener); },
    dispose() { disposed = true; clearTimeout(timer); listeners.clear(); },
  };
}

export type QuizController = ReturnType<typeof createQuizController>;
