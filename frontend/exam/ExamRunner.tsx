import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { PaperButton } from '../components/PaperButton';
import { ExamQuestionVisual } from './ExamQuestionVisual';
import { MathText } from './MathText';
import type { ExamAnswers, ExamAttempt, ExamQuestion, ExamReceipt, ExamRunnerProps } from './contracts';

export type ExamRunnerHandle = { prepareSignOut: () => Promise<{ saved: boolean }> };
const fa = (value: number) => Number(value).toLocaleString('fa-IR');
const answerCount = (answers: ExamAnswers) => Object.values(answers).filter(Boolean).length;
const remainingTime = (expiresAt: string, now: number) => {
  const deadline = Date.parse(expiresAt);
  return Number.isFinite(deadline) ? Math.max(0, Math.ceil((deadline - now) / 1000)) : 0;
};
const twoDigits = (value: number) => String(Math.max(0, value)).padStart(2, '0');
const timeText = (seconds: number) => `${twoDigits(Math.floor(seconds / 60))}:${twoDigits(seconds % 60)}`;

function ReceiptPanel({ receipt, examListURL, onFeedback, errorText, isTeacher, onRetake, retakeBusy }: {
  receipt: ExamReceipt; examListURL: string;
  onFeedback: ExamRunnerProps['onFeedback']; errorText: ExamRunnerProps['errorText'];
  isTeacher?: boolean; onRetake?: () => void; retakeBusy?: boolean;
}) {
  const [rating, setRating] = useState<number>(receipt.feedback_rating ?? 0);
  const [comment, setComment] = useState(receipt.feedback_comment ?? '');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const reviews = Array.isArray(receipt.feedback) ? receipt.feedback : [];
  const mistakes = reviews.filter(item => !item.is_correct);
  async function sendFeedback(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || rating < 1 || rating > 5) return;
    setBusy(true); setNotice('');
    try {
      await onFeedback(receipt.id, rating, comment.trim());
      setNotice('نظر شما ثبت شد. ممنون از بازخوردتان.');
    } catch (error) { setNotice('ثبت نظر انجام نشد: ' + errorText(error)); }
    finally { setBusy(false); }
  }
  return <section className="exam-receipt" data-exam-receipt="" tabIndex={-1}>
    <div className="exam-receipt-hero">
      <div className="exam-receipt-intro">
        <p className="exam-eyebrow">کارنامه و بازخورد امتحان</p>
        <h1>نتیجهٔ میان‌ترم</h1>
        <p className="exam-result-message">این امتحان یک‌بار برگزار می‌شود؛ پاسخ‌ها نهایی شده‌اند و امکان شرکت مجدد وجود ندارد. در این صفحه می‌توانی نمره، پاسخ درست و دلیل هر سؤال را مرور کنی.</p>
        {receipt.submitted_at && <p className="small-note">زمان ثبت: {new Date(receipt.submitted_at).toLocaleString('fa-IR', { dateStyle: 'medium', timeStyle: 'short' })}</p>}
      </div>
      <div className="exam-receipt-score-card">
        <div className="exam-receipt-score"><strong>{fa(receipt.score)}</strong><span>از {fa(receipt.maximum_score)} امتیاز</span></div>
        <div className="exam-receipt-facts">
          <div><span>پاسخ درست</span><strong>{fa(receipt.correct_count)} از {fa(receipt.question_count)}</strong></div>
          <div><span>پاسخ نادرست یا بی‌پاسخ</span><strong>{fa(receipt.question_count - receipt.correct_count)}</strong></div>
          <div><span>وضعیت</span><strong>{receipt.status === 'expired' ? 'پایان زمان' : 'ثبت نهایی'}</strong></div>
        </div>
      </div>
    </div>

    <div className="exam-receipt-layout">
      <section className="exam-review-section" aria-labelledby="exam-review-title">
        <div className="exam-section-intro">
          <h2 id="exam-review-title">مرور تشریحی پاسخ‌ها</h2>
          <p>{fa(mistakes.length)} سؤال اشتباه یا بدون پاسخ بوده است. توضیح علمی هر سؤال صرفاً پس از ثبت نهایی نمایش داده می‌شود.</p>
        </div>
        <div className="exam-review-list">
          {reviews.map((item, index) => {
            const selected = item.options.find(opt => opt.id === item.selected_option);
            const correct = item.options.find(opt => opt.id === item.correct_option);
            return <article key={item.id} className={'exam-review-item' + (item.is_correct ? ' is-correct' : ' is-incorrect')}>
              <div className="exam-review-heading">
                <h3>سؤال {fa(index + 1)} · {item.skill}</h3>
                <span className="exam-review-state">{item.is_correct ? 'درست' : selected ? 'نادرست' : 'بدون پاسخ'}</span>
              </div>
              <div className="exam-review-stem"><MathText text={item.stem} /></div>
              <ExamQuestionVisual visual={item.visual} />
              <div className="exam-review-answers-grid">
                <div className="exam-review-answer"><strong>پاسخ شما</strong><span><MathText text={selected ? selected.text : 'بدون پاسخ'} /></span></div>
                <div className="exam-review-answer"><strong>پاسخ صحیح</strong><span><MathText text={correct?.text ?? 'نامشخص'} /></span></div>
              </div>
              <div className="exam-review-rationale">
                <strong>چرا؟</strong>
                <div><MathText text={item.rationale} /></div>
                {!item.is_correct && item.selected_explanation && <p className="exam-review-misconception"><strong>نکته دربارهٔ انتخاب شما:</strong> <MathText text={item.selected_explanation} /></p>}
              </div>
            </article>;
          })}
        </div>
      </section>

      <aside className="exam-receipt-aside">
        <section className="exam-feedback-section" aria-labelledby="exam-feedback-title">
          <h2 id="exam-feedback-title">نظرت دربارهٔ امتحان چیست؟</h2>
          <p>این بازخورد برای مدرس است و هیچ تأثیری بر نمرهٔ شما ندارد.</p>
          <form onSubmit={event => void sendFeedback(event)}>
            <fieldset><legend>ارزیابی کلی امتحان</legend>
              <div className="exam-feedback-rating">{[1, 2, 3, 4, 5].map(value => <label key={value}><input name="exam-feedback-rating" type="radio" value={value} checked={rating === value} onChange={() => setRating(value)} /><span>{fa(value)}</span></label>)}</div>
              <p className="small-note">۱ = نیازمند بهبود، ۵ = بسیار مناسب</p>
            </fieldset>
            <label className="exam-feedback-comment">نظر یا پیشنهاد (اختیاری)
              <textarea value={comment} maxLength={1500} rows={5} onChange={event => setComment(event.target.value)} placeholder="مثلاً دربارهٔ شفافیت سؤال‌ها، زمان و میزان دشواری…" />
            </label>
            <button type="submit" className="button-forest" disabled={busy || rating === 0}>{busy ? 'در حال ثبت…' : 'ثبت بازخورد'}</button>
            {notice && <p className="exam-save-state" role="status">{notice}</p>}
          </form>
        </section>

        <section className="exam-receipt-nav">
          {isTeacher && <div className="exam-instructor-retake"><h2>حالت آزمایشی مدرس</h2><p>تلاش‌های آزمایشی مدرس محدودیتی ندارند و در آمار دانشجویان شمرده نمی‌شوند.</p><button type="button" className="button-forest" disabled={retakeBusy} onClick={onRetake}>{retakeBusy ? 'در حال آماده‌سازی…' : 'شروع تلاش آزمایشی جدید'}</button></div>}
          <h2>گام بعدی</h2>
          <p>اگر لازم است دوباره فهرست امتحانات یا صفحهٔ کلاس را ببینی، از این بخش برگرد.</p>
          <PaperButton href={examListURL}>بازگشت به فهرست امتحانات ←</PaperButton>
        </section>
      </aside>
    </div>
  </section>;
}

function Question({ question, index, answer, disabled, onChange }: {
  question: ExamQuestion; index: number; answer?: string; disabled: boolean; onChange: (id: string) => void;
}) {
  return <article className="exam-question" id={'exam-question-' + question.id} data-exam-question={question.id} tabIndex={-1}>
    <div className="exam-question-meta"><span>سؤال {fa(index + 1)} <i aria-hidden="true">·</i> {question.skill}</span></div>
    <div className="exam-question-stem" role="heading" aria-level={2}><MathText text={question.stem} /></div>
    <ExamQuestionVisual visual={question.visual} />
    <fieldset className="exam-options" disabled={disabled}>
      <legend className="sr-only">گزینه‌های سؤال {fa(index + 1)}</legend>
      {question.options.map((option, optionIndex) => <label className={'exam-option' + (answer === option.id ? ' is-selected' : '')} key={option.id}>
        <input type="radio" name={question.id} value={option.id} checked={answer === option.id} onChange={() => onChange(option.id)} />
        <span className="exam-option-key">{String.fromCharCode(65 + optionIndex)}</span>
        <span className="exam-option-text"><MathText text={option.text} /></span>
      </label>)}
    </fieldset>
  </article>;
}

export const ExamRunner = forwardRef<ExamRunnerHandle, ExamRunnerProps>(function ExamRunner(props, ref) {
  const { exam, activeAttempt, receipt: initialReceipt, examListURL, storage, onStart, onSave, onSubmit, onFeedback, onCommitted, isCurrent, errorText, isTeacher = false } = props;
  const recovered = activeAttempt ? storage.read(`classroom-exam:${exam.id}:${activeAttempt.id}`) : null;
  const localAnswers: ExamAnswers = {};
  if (recovered && typeof recovered === 'object' && !Array.isArray(recovered)) {
    for (const question of activeAttempt?.questions ?? []) {
      const value = (recovered as Record<string, unknown>)[question.id];
      if (typeof value === 'string' && question.options.some(option => option.id === value)) localAnswers[question.id] = value;
    }
  }
  const [attempt, setAttempt] = useState<ExamAttempt | null>(activeAttempt ?? null);
  const [answers, setAnswers] = useState<ExamAnswers>(() => ({ ...(activeAttempt?.answers ?? {}), ...localAnswers }));
  const [receipt, setReceipt] = useState<ExamReceipt | null>(initialReceipt ?? null);
  const [startBusy, setStartBusy] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [review, setReview] = useState(false);
  const [notice, setNotice] = useState('');
  const [saveNotice, setSaveNotice] = useState('');
  const [now, setNow] = useState(Date.now());
  const [serverOffset, setServerOffset] = useState(() => activeAttempt?.server_now ? Date.parse(activeAttempt.server_now) - Date.now() : 0);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const saveFlight = useRef<Promise<unknown>>(Promise.resolve());
  const latest = useRef({ attempt, answers, receipt });
  const submittingRef = useRef(false);
  const mounted = useRef(true);
  latest.current = { attempt, answers, receipt };

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; clearTimeout(saveTimer.current); };
  }, []);

  const answered = useMemo(() => answerCount(answers), [answers]);
  const remaining = attempt ? remainingTime(attempt.expires_at, now + serverOffset) : exam.duration_minutes * 60;

  async function saveNow(attemptId: string, values: ExamAnswers) {
    try {
      await onSave(attemptId, values);
      if (mounted.current && isCurrent()) setSaveNotice('پاسخ‌ها ذخیره شده‌اند.');
      return true;
    } catch (error) {
      if (mounted.current && isCurrent()) setSaveNotice('ذخیرهٔ آنلاین انجام نشد؛ پاسخ‌ها در این مرورگر نگه داشته شده‌اند. ' + errorText(error));
      return false;
    }
  }

  useImperativeHandle(ref, () => ({
    async prepareSignOut() {
      clearTimeout(saveTimer.current);
      const current = latest.current;
      if (!current.attempt || current.receipt || current.attempt.status !== 'in_progress') return { saved: true };
      storage.write(`classroom-exam:${exam.id}:${current.attempt.id}`, current.answers);
      await saveFlight.current;
      return { saved: await saveNow(current.attempt.id, current.answers) };
    },
  }), [exam.id, isCurrent, onSave, storage]);

  useEffect(() => {
    if (!attempt || receipt || attempt.status !== 'in_progress') return;
    const key = `classroom-exam:${exam.id}:${attempt.id}`;
    storage.write(key, answers);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      if (!isCurrent() || submittingRef.current) return;
      const task = saveFlight.current.then(() => saveNow(attempt.id, answers));
      saveFlight.current = task;
    }, 850);
    return () => clearTimeout(saveTimer.current);
  }, [answers, attempt, exam.id, isCurrent, receipt, storage]);

  useEffect(() => {
    if (!attempt || receipt || attempt.status !== 'in_progress') return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [attempt, receipt]);

  async function start(retake = false) {
    if (startBusy || (!retake && (attempt || receipt)) || !isCurrent()) return;
    if (!isTeacher && !retake && !accessCode.trim()) {setNotice('کد ورود امتحان را وارد کن.'); return;}
    setStartBusy(true); setNotice('');
    try {
      const next = await onStart(isTeacher ? '' : accessCode.trim());
      if (!isCurrent() || !mounted.current) return;
      if (!next || !Array.isArray(next.questions) || !next.questions.length || !next.expires_at) throw Error('EXAM_START_RESPONSE_INVALID');
      setAttempt(next);
      setReceipt(null);
      setReview(false);
      setAccessCode('');
      setAnswers(next.answers ?? {});
      setServerOffset(next.server_now ? Date.parse(next.server_now) - Date.now() : 0);
      setNow(Date.now());
    } catch (error) {
      if (mounted.current && isCurrent()) setNotice(errorText(error));
    } finally { if (mounted.current) setStartBusy(false); }
  }

  async function submit(auto = false) {
    const current = latest.current;
    if (!current.attempt || current.receipt || submittingRef.current || !isCurrent()) return;
    submittingRef.current = true;
    setSubmitting(true); setReview(false); setNotice(auto ? 'زمان امتحان به پایان رسیده است؛ در حال ثبت پاسخ‌های ذخیره‌شده…' : 'در حال ثبت نهایی پاسخ‌ها…');
    clearTimeout(saveTimer.current);
    storage.write(`classroom-exam:${exam.id}:${current.attempt.id}`, current.answers);
    await saveFlight.current;
    try {
      const result = await onSubmit(current.attempt.id, current.answers);
      if (!isCurrent() || !mounted.current) return;
      setReceipt(result);
      storage.write(`classroom-exam:${exam.id}:${current.attempt.id}`, null);
      setNotice('نتیجهٔ امتحان ثبت شد.');
      onCommitted();
    } catch (error) {
      submittingRef.current = false;
      if (mounted.current && isCurrent()) {
        setSubmitting(false);
        setNotice(errorText(error) + ' پاسخ‌های ثبت‌شده در این مرورگر حفظ شده‌اند؛ دوباره تلاش کن.');
      }
    }
  }

  useEffect(() => {
    if (attempt && !receipt && remaining === 0 && !submittingRef.current) void submit(true);
    // Deadline is derived from the server-provided expires_at; submit is guarded by a ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, attempt, receipt]);

  function choose(questionId: string, optionId: string) {
    if (submitting || receipt || !attempt || remaining <= 0) return;
    const question = attempt.questions.find(item => item.id === questionId);
    if (!question?.options.some(option => option.id === optionId)) return;
    setAnswers(current => ({ ...current, [questionId]: optionId }));
    setNotice('');
  }

  if (receipt) return <div className="exam-runner" data-exam-runner=""><ReceiptPanel receipt={receipt} examListURL={examListURL} onFeedback={onFeedback} errorText={errorText} isTeacher={isTeacher} retakeBusy={startBusy} onRetake={() => void start(true)} /></div>;

  if (!attempt) return <div className="exam-runner" data-exam-runner="">
    <nav className="exam-context"><a href={examListURL}>فهرست امتحانات ←</a></nav>
    <header className="exam-runner-heading"><p className="exam-eyebrow">EXAM SESSION</p><h1>{exam.title}</h1><p>{exam.description}</p></header>
    <section className="exam-start-panel">
      <h2>پیش از شروع</h2>
      <div className="exam-start-facts"><span>{fa(exam.question_count)} سؤال چهارگزینه‌ای</span><span>{fa(exam.duration_minutes)} دقیقه</span><span>ثبت نهایی آنلاین</span></div>
      <ul>
        <li>زمان از لحظهٔ شروع محاسبه می‌شود و با بستن صفحه متوقف نخواهد شد.</li>
        <li>می‌توانی بین سؤال‌ها جابه‌جا شوی و پاسخ‌ها را تا پایان زمان تغییر بدهی.</li>
        <li>پاسخ‌ها هنگام امتحان به‌صورت خودکار ذخیره می‌شوند.</li>
        <li>پس از پایان زمان، پاسخ‌های ذخیره‌شده برای ثبت نهایی ارسال می‌شوند.</li>
        <li>هر دانشجو فقط یک فرصت شرکت دارد؛ بستن صفحه یا Refresh کردن فرصت تازه‌ای ایجاد نمی‌کند.</li>
        <li>بلافاصله بعد از ثبت نهایی، نمره، پاسخ‌های صحیح و توضیح هر سؤال نمایش داده می‌شود.</li>
      </ul>
      {!isTeacher && <label className="exam-access-label" htmlFor="exam-access-code">کد ورود امتحان
        <input id="exam-access-code" className="exam-access-input" type="text" dir="ltr" autoComplete="off" spellCheck={false} maxLength={100} value={accessCode} onChange={event => setAccessCode(event.target.value)} placeholder="Enter access code" />
        <small>کد اعلام‌شده توسط مدرس را وارد کن. کد هنگام بررسی در سرور اعتبارسنجی می‌شود.</small>
      </label>}
      {isTeacher && <p className="exam-teacher-notice">حالت مدرس: می‌توانی بدون کد ورود و بدون محدودیت دفعات شرکت کنی.</p>}
      {notice && <p className="exam-alert" role="alert">{notice}</p>}
      <button type="button" className="button-forest" disabled={startBusy || (!isTeacher && !accessCode.trim()) || !['available', 'in_progress'].includes(exam.status)} onClick={() => void start()}>{startBusy ? 'در حال آماده‌سازی…' : exam.status === 'scheduled' ? 'امتحان هنوز فعال نشده' : exam.status === 'closed' ? 'مهلت شرکت پایان یافته' : 'شروع امتحان'}</button>
    </section>
  </div>;

  const questions = attempt.questions;
  const missing = questions.filter(question => !answers[question.id]);
  const locked = submitting || remaining <= 0;
  return <div className="exam-runner" data-exam-runner="">
    <nav className="exam-context"><a href={examListURL}>فهرست امتحانات ←</a></nav>
    <header className="exam-live-header">
      <div><p className="exam-eyebrow">MIDTERM EXAM</p><h1>{exam.title}</h1><p>{fa(questions.length)} سؤال · {fa(exam.duration_minutes)} دقیقه</p></div>
      <div className={'exam-clock' + (remaining <= 300 ? ' is-warning' : '')} role="timer" aria-live="off" aria-label={'زمان باقی‌مانده ' + timeText(remaining)}>
        <span>زمان باقی‌مانده</span><strong dir="ltr">{timeText(remaining)}</strong>
      </div>
    </header>
    <div className="exam-progress-row"><span>{fa(answered)} از {fa(questions.length)} سؤال پاسخ داده شده</span><span>{fa(missing.length)} سؤال بی‌پاسخ</span></div>
    <div className="exam-progress-track" aria-hidden="true"><i style={{ width: `${answered / Math.max(questions.length, 1) * 100}%` }} /></div>
    <div className="exam-live-layout">
      <aside className="exam-question-rail">
        <h2>سؤال‌ها</h2>
        <nav aria-label="رفتن به سؤال">
          {questions.map((question, index) => <a key={question.id} href={'#exam-question-' + encodeURIComponent(question.id)} className={answers[question.id] ? 'is-answered' : ''} aria-label={`سؤال ${fa(index + 1)}${answers[question.id] ? '، پاسخ داده شده' : '، بی‌پاسخ'}`}>{fa(index + 1)}</a>)}
        </nav>
        <p className="exam-save-state" role="status">{saveNotice || 'ذخیرهٔ خودکار پاسخ‌ها فعال است.'}</p>
      </aside>
      <form className="exam-question-list" onSubmit={event => { event.preventDefault(); setReview(true); }}>
        {questions.map((question, index) => <Question key={question.id} question={question} index={index} answer={answers[question.id]} disabled={locked} onChange={option => choose(question.id, option)} />)}
        <section className="exam-submit-panel">
          <p>{missing.length ? `${fa(missing.length)} سؤال هنوز پاسخ ندارد. سؤال‌های بی‌پاسخ امتیازی دریافت نمی‌کنند.` : 'همهٔ سؤال‌ها پاسخ داده شده‌اند. پیش از ثبت نهایی می‌توانی پاسخ‌ها را مرور کنی.'}</p>
          {notice && <p className="exam-alert" role="status">{notice}</p>}
          {remaining <= 0 && !receipt
            ? <button className="button-forest" type="button" disabled={submitting} onClick={() => void submit(true)}>{submitting ? 'در حال ثبت…' : 'ارسال پاسخ‌های ذخیره‌شده'}</button>
            : !review
              ? <button className="button-forest" type="submit" disabled={submitting}>مرور و ثبت نهایی پاسخ‌ها</button>
              : <div className="exam-submit-confirm" data-exam-confirm="">
                <h2>تأیید ثبت نهایی</h2>
                <p>پس از ثبت، امکان تغییر پاسخ‌ها وجود ندارد. {missing.length ? `تعداد ${fa(missing.length)} سؤال بدون پاسخ باقی می‌ماند.` : 'تمام سؤال‌ها پاسخ دارند.'}</p>
                <div className="exam-actions"><button className="button-forest" type="button" disabled={submitting} onClick={() => void submit(false)}>{submitting ? 'در حال ثبت…' : 'تأیید و ثبت نهایی'}</button><button className="button-outline" type="button" disabled={submitting} onClick={() => setReview(false)}>بازگشت به سؤال‌ها</button></div>
              </div>}
        </section>
      </form>
    </div>
  </div>;
});
