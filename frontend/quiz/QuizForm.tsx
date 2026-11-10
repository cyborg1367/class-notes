import { Component, useEffect, useRef, useSyncExternalStore } from 'react';
import { AttemptHistory, QuizNavigation, QuizResult, number, type QuizResultProps } from '../quiz-result/QuizResult';
import type { QuizController } from './controller';
import type { QuizOptions, QuizView } from './contracts';
import { questionState } from './model';
import { QuestionCard } from './QuestionCard';

const modeNote = {
  practice: 'تمرین: ابتدا خودت پاسخ بده؛ در صورت نیاز راهنمای مفهومی بگیر و سپس پاسخ را بررسی کن. نتیجهٔ آزمون با تمرین ثبت نمی‌شود.',
  assessment: 'آزمون: پاسخ‌ها را کامل کن و پیش از ثبت نهایی مرور کن. راهنما و بررسی پاسخ در این حالت نمایش داده نمی‌شوند.',
};

class ReceiptBoundary extends Component<{ view: QuizResultProps; receiptURL?: string }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (!this.state.failed && Array.isArray(this.props.view.record.result?.items)) return <QuizResult {...this.props.view} />;
    return <section className="panel-card">
      <p role="status">نتیجه ثبت شد، اما نمایش آن کامل نشد.</p>
      <div className="portal-actions">
        <button type="button" className="button-outline" onClick={() => this.setState({ failed: false })}>نمایش دوبارهٔ نتیجه</button>
        {this.props.receiptURL && <a className="quiet-link" href={this.props.receiptURL}>باز کردن رسید ثبت‌شده ←</a>}
      </div>
    </section>;
  }
}

function QuizIntro({ options, controller, view }: { options: QuizOptions; controller: QuizController; view: QuizView }) {
  const count = options.quiz.questions.length;
  const choices = options.quiz.questions.filter(question => question.type === 'choice').length;
  const maximum = options.quiz.questions.reduce((total, question) => total + Number(question.points), 0);
  return <section className="panel-card quiz-intro" data-quiz-intro="" hidden={view.started}>
    <h2>پیش از شروع</h2>
    <div className="quiz-facts"><span>{number(count)} سؤال</span><span>{number(maximum)} امتیاز</span><span>زمان پیشنهادی: 10 تا 15 دقیقه</span></div>
    <p>{number(choices)} سؤال چهارگزینه‌ای و {number(count - choices)} سؤال تکمیل کد داری. هر جای خالی مستقل امتیاز می‌گیرد؛ کدها در این صفحه اجرا نمی‌شوند.</p>
    <ul className="quiz-rules">
      <li>محدودیت زمانی و تایمر اجباری وجود ندارد.</li>
      <li>در تمرین، راهنما و بررسی پاسخ در دسترس است؛ تمرین نتیجهٔ آزمون ثبت نمی‌کند.</li>
      <li>در آزمون، نمره و توضیح پاسخ‌ها پس از ثبت نهایی نمایش داده می‌شوند.</li>
      <li>ثبت نهایی قابل ویرایش نیست؛ شرکت دوباره مجاز است و اولین و بهترین نتیجه جدا نگه داشته می‌شوند.</li>
      <li>دفعات استفاده از راهنما و بررسی تمرینی همراه نتیجه گزارش می‌شوند. تغییر حالت این سابقه را پاک نمی‌کند.</li>
    </ul>
    <AttemptHistory summary={options.previousSummary} maximum={maximum} />
    {view.recovered && <p className="small-note" data-resume-note="">پیش‌نویس پاسخ‌ها بازیابی شده است؛ با شروع، همان پاسخ‌ها را می‌بینی.</p>}
    {view.draft.error && <p className="status-line" data-error="true" role="status">{view.draft.text}</p>}
    <button className="button-forest" type="button" data-start="" onClick={controller.start}>
      {view.mode === 'practice' ? 'شروع تمرین' : 'شروع آزمون'}
    </button>
  </section>;
}

export function QuizForm({ options, controller }: { options: QuizOptions; controller: QuizController }) {
  const view = useSyncExternalStore(controller.subscribe, controller.getSnapshot);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!view.focus || !root.current || view.receipt) return;
    const target = view.focus;
    const item = target.kind === 'review' ? root.current.querySelector<HTMLElement>('[data-review]')
      : Array.from(root.current.querySelectorAll<HTMLElement>('[data-question-card]')).find(card => card.dataset.questionCard === target.id);
    if (!item) return;
    item.focus({ preventScroll: true });
    const reduce = item.ownerDocument.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    item.scrollIntoView?.({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }, [view.focus, view.receipt]);

  const questions = options.quiz.questions;
  const progress = questions.map(question => questionState(question, view.answers[question.id], options));
  const missing = questions.flatMap((question, index) => progress[index].complete ? [] : [{ question, index }]);
  const complete = questions.length - missing.length;
  const practice = view.mode === 'practice', locked = Boolean(view.pending || view.submitting || view.receipt);
  const receiptId = view.receipt?.record.id;

  return <div className="react-quiz-form" data-react-quiz-form="" ref={root}>
    <QuizNavigation links={options.links} />
    {view.loading ? <p className="status-line" role="status">در حال آماده‌سازی آزمون…</p> : <>
      {!view.receipt && <>
        <div className="mode-tabs" role="group" aria-label="انتخاب حالت پاسخ‌گویی">
          <button type="button" data-mode="practice" aria-pressed={practice} disabled={locked} onClick={() => controller.setMode('practice')}>تمرین با راهنما</button>
          <button type="button" data-mode="assessment" aria-pressed={!practice} disabled={locked} onClick={() => controller.setMode('assessment')}>آزمون</button>
        </div>
        <QuizIntro options={options} controller={controller} view={view} />
        <p className="small-note" data-mode-note="" role="status">{modeNote[view.mode]}</p>
      </>}
      <div data-result="">
        {view.receipt && <>
          <p className="status-line" role="status">{view.submission.text}</p>
          <ReceiptBoundary receiptURL={receiptId ? options.links.quiz + '?attempt=' + encodeURIComponent(receiptId) : undefined}
            view={{ ...view.receipt, prompts: questions, links: options.links, focus: true }} />
        </>}
      </div>
      <div className="quiz-layout" data-quiz-experience="" hidden={!view.started || Boolean(view.receipt)}>
        {!view.receipt && <>
          <aside className="quiz-rail">
            <h2>سؤال‌ها</h2>
            <nav className="question-map" aria-label="شمارهٔ سؤال‌ها">
              {questions.map((question, index) => {
                const state = progress[index], invalid = Object.keys(state.errors).length > 0;
                const label = invalid ? 'قالب پاسخ نیازمند اصلاح' : state.complete ? 'تکمیل‌شده' : state.partial ? 'نیمه‌کامل' : 'بدون پاسخ';
                const classes = [state.complete && 'is-answered', state.partial && 'is-partial', invalid && 'is-invalid'].filter(Boolean).join(' ');
                return <a key={question.id} className={classes} href={'#question-' + encodeURIComponent(question.id)} data-map={question.id}
                  aria-label={`سؤال ${number(index + 1)}: ${label}`} onClick={event => {
                    event.preventDefault(); controller.focusQuestion(question.id);
                  }}>{number(index + 1)}</a>;
              })}
            </nav>
            <p data-answer-count="">{number(complete)} از {number(questions.length)} سؤال کامل شده</p>
            <span className="progress-track" aria-hidden="true"><i data-answer-progress="" style={{ width: (complete / questions.length * 100) + '%' }} /></span>
            <button type="button" className="quiet-button" data-find-missing="" hidden={!missing.length} onClick={controller.findMissing}>رفتن به سؤال ناقص</button>
            <p className="save-note" data-save-note="" data-error={Boolean(view.draft.error)} role="status">{view.draft.text}</p>
          </aside>
          <div className="react-quiz-work">
            <form data-quiz-form="" noValidate onSubmit={event => { event.preventDefault(); controller.reviewSubmission(); }}>
              {questions.map((question, index) => <QuestionCard key={question.id} question={question} index={index}
                answer={view.answers[question.id]} errors={progress[index].errors} feedback={view.feedback[question.id]}
                practice={practice} checking={Boolean(view.checking[question.id])} locked={locked} lessonURL={options.links.lesson}
                blankHelp={options.blankHelp} onChange={(value, blank) => controller.setAnswer(question.id, value, blank)}
                onPractice={hint => void controller.practice(question.id, hint)} />)}
              <section className="quiz-submit">
                <p data-submit-note="">{practice ? 'برای ثبت نتیجه، حالت «آزمون» را انتخاب کن. پاسخ‌های فعلی حفظ می‌شوند.'
                  : 'پس از مرور، می‌توانی ثبت نهایی را تأیید کنی. سؤال‌های بی‌پاسخ امتیازی نمی‌گیرند.'}</p>
                <button className="button-forest" type="submit" data-submit="" hidden={practice} disabled={view.submitting}>
                  {view.pending ? 'بررسی وضعیت همین ارسال ←' : 'مرور و ثبت نهایی ←'}
                </button>
                <section className="submission-review" data-review="" hidden={!view.review} tabIndex={-1} aria-labelledby="review-title">
                  <h2 id="review-title">مرور پیش از ثبت</h2>
                  <div data-review-body="">
                    <p>{number(complete)} از {number(questions.length)} سؤال کامل شده است.</p>
                    {missing.length ? <><p>این سؤال‌ها کامل نشده‌اند و ممکن است بخشی از امتیازشان را از دست بدهی:</p>
                      <ul>{missing.map(({ question, index }) => <li key={question.id}>
                        <a data-review-question={question.id} href={'#question-' + encodeURIComponent(question.id)} onClick={event => {
                          event.preventDefault(); controller.focusQuestion(question.id);
                        }}>سؤال {number(index + 1)} · {question.skill}</a>
                      </li>)}</ul>
                    </> : <p>همهٔ سؤال‌ها پاسخ دارند؛ این وضعیت به معنی درست‌بودن پاسخ‌ها نیست.</p>}
                    <p>با تأیید، یک تلاش ثبت می‌شود. پاسخ‌های این تلاش قابل ویرایش نیستند؛ می‌توانی بعداً دوباره شرکت کنی.</p>
                  </div>
                  <div className="portal-actions">
                    <button className="button-forest" type="button" data-confirm-submit="" onClick={() => void controller.submit()}>
                      {missing.length ? `ثبت با ${number(missing.length)} سؤال ناقص` : 'تأیید و ثبت نهایی'}
                    </button>
                    <button className="button-outline" type="button" data-edit="" onClick={controller.edit}>بازگشت به پاسخ‌ها</button>
                  </div>
                </section>
                <p className="status-line" data-submit-status="" data-error={Boolean(view.submission.error)} role="status">{view.submission.text}</p>
              </section>
            </form>
          </div>
        </>}
      </div>
    </>}
  </div>;
}
