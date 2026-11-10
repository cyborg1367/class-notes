import { reviewOutcome, reviewReference } from '../../web/assets/review.mjs';
import type { Evidence, Lesson, Practice, ReviewOptions } from './contracts';
import type { ReviewController } from './controller';
import { Action, FocusHeading, Icon, shortDate, TeachingText } from './Presentation';

const steps = ['چرایی مرور', 'بازخوانی', 'آزمودن', 'برداشت من'];
const labReasons: Record<string, string> = {
  CONFUSION_LAYOUT: 'گزارش ماتریس خطا در این بررسی، با نتیجهٔ مورد انتظار هم‌خوان نبود.',
  SPLIT_ALIGNMENT: 'تقسیم داده در این بررسی، با قرارداد آموزش و آزمون هم‌خوان نبود.',
  ACCURACY_VALUES: 'شمارش پاسخ‌های درست یا نسبت گزارش‌شده در این بررسی هم‌خوان نبود.',
  NEIGHBOR_ORDER: 'ترتیب همسایه‌های خروجی در این بررسی به بازبینی نیاز داشت.',
  INVALID_INDICES: 'اندیس‌های برگردانده‌شده در این بررسی معتبر نبودند.',
  LABEL_ALIGNMENT: 'برچسب‌های خروجی با سطرهای همسایه‌ها هم‌ردیف نبودند.',
  VOTE_COUNTS: 'تعداد رأی‌های گزارش‌شده در این بررسی هم‌خوان نبود.',
  MAJORITY: 'کلاس برنده در این بررسی با رأی اکثریت هم‌خوان نبود.',
  MAJORITY_TIE: 'قاعدهٔ رفع تساوی در این بررسی به بازبینی نیاز داشت.',
  VOTE_SHARE: 'سهم رأی گزارش‌شده در این بررسی هم‌خوان نبود.',
};

type Links = { lessons: Lesson[]; url: ReviewOptions['url'] };
type StageProps = Links & { practice: Practice; busy: boolean; controller: ReviewController };
function EvidenceCard({ item, lessons, url }: Links & { item?: Evidence }) {
  const when = item?.at && Number.isFinite(Date.parse(item.at))
    ? new Date(item.at).toLocaleString('fa-IR', { dateStyle: 'medium', timeStyle: 'short' }) : '';
  if (item?.kind === 'quiz') {
    const lesson = lessons.find(l => l.id === item.lesson_id);
    const href = lesson && /^[0-9a-f-]{36}$/i.test(item.attempt_id ?? '')
      ? url('quiz/' + lesson.id + '/?attempt=' + encodeURIComponent(item.attempt_id!)) : null;
    return <article className="rv-evidence">
      <p className="rv-evidence-meta">از آزمون{when && ' · ' + when}</p>
      {item.prompt ? <p className="rv-evidence-prompt"><TeachingText value={item.prompt} /></p>
        : <p>پاسخ یک سؤال ثبت‌شده، به این موضوع مرتبط بوده است.</p>}
      {item.code && <pre className="rv-source-code" dir="ltr">{item.code}</pre>}
      {item.answer && <p>پاسخ ثبت‌شدهٔ تو: <strong><TeachingText value={item.answer} /></strong></p>}
      <p className="rv-evidence-outcome">این پاسخ در آن تلاش، کامل درست نبود؛ با یک مثال دیگر به مفهوم برمی‌گردیم.</p>
      {href && <a className="rv-text-link" target="_blank" rel="noopener" href={href}>دیدن نتیجهٔ همان تلاش ←</a>}
    </article>;
  }
  if (item?.kind === 'lab') {
    const lab = item.mission ? lessons.find(lesson => lesson.lab?.mission === item.mission) : undefined;
    const task = lab?.lab_steps?.find(t => t.id === item.task)?.title;
    return <article className="rv-evidence">
      <p className="rv-evidence-meta">از لابراتور{when && ' · ' + when}</p>
      {task && <h3>{task}</h3>}
      <p>{labReasons[item.feedback_code ?? ''] || 'خروجی این تلاش با نتیجهٔ بررسی هم‌خوان نبود؛ این مفهوم برای بازبینی پیشنهاد شده است.'}</p>
      {item.completed && <p className="rv-resolved">{item.passed_later ? 'پس از آن، این مأموریت را با موفقیت گذرانده‌ای.'
        : 'این مأموریت در حساب تو انجام‌شده است.'} این مرور برای یادآوری مفهوم است.</p>}
      {lab?.lab && <a className="rv-text-link" target="_blank" rel="noopener" href={url(lab.lab.path)}>بازگشت به لابراتور ←</a>}
    </article>;
  }
  return <article className="rv-evidence"><p>این موضوع را خودت برای مرور انتخاب کرده‌ای. می‌توانی نکته را بازخوانی کنی و با یک سؤال کوتاه خودت را بیازمایی.</p></article>;
}

function ContextStage({ practice, busy, lessons, url, controller }: StageProps) {
  const { stage, entry, context } = practice;
  const { concept, evidence = [] } = context;
  const learning = concept.learning ?? {};
  const reference = reviewReference(concept, url);
  return <>
    <p className="rv-eyebrow">مرور شخصی</p>
    <FocusHeading id="rv-stage-title">{entry.title}</FocusHeading>
    {stage === 'reason' ? <>
      <h2 className="rv-context-heading">چرا این موضوع اینجاست؟</h2>
      <EvidenceCard item={evidence[0]} lessons={lessons} url={url} />
      {evidence.length > 1 && <details className="rv-other-evidence">
        <summary>تجربه‌های مرتبط دیگر</summary>
        {evidence.slice(1).map((item, index) => <EvidenceCard key={index} item={item} lessons={lessons} url={url} />)}
      </details>}
      <p className="rv-learning-goal"><strong>هدف این مرور: </strong>
        <TeachingText value={learning.goal || concept.description || 'مفهوم را در یک مثال دیگر بررسی کن.'} />
      </p>
      <div className="rv-practice-tools">
        <Action tone="primary" icon="arrow" data-read="" disabled={busy} onClick={() => void controller.chooseReading(false)}>
          {entry.paused ? 'فعال‌کردن مرور' : practice.prepared ? 'ادامهٔ تمرین' : entry.last_review
            ? 'اول بدون بازخوانی امتحان کن' : 'بازخوانی نکته'}
        </Action>
        {!entry.paused && <>
          <Action data-direct="" disabled={busy} onClick={() => void controller.chooseReading(true)}>
            {entry.last_review ? 'ابتدا نکته را بازخوانی می‌کنم' : 'مستقیم تمرین می‌کنم'}
          </Action>
          <Action tone="text-link" data-pause="" disabled={busy} onClick={() => void controller.pause()}>فعلاً از مرور خارج کن</Action>
        </>}
      </div>
    </> : <>
      {learning.goal && <p className="rv-learning-goal"><TeachingText value={learning.goal} /></p>}
      <p className="rv-learning-core"><TeachingText value={learning.core || concept.description} /></p>
      {learning.example && <section className="rv-worked-example"><h2>یک مثال برای بازخوانی</h2><p><TeachingText value={learning.example} /></p></section>}
      {learning.pitfall && <p className="rv-concept-note"><TeachingText value={learning.pitfall} /></p>}
      {entry.note && <details className="rv-own-note"><summary>یادداشت قبلی من</summary><p>{entry.note}</p></details>}
      {entry.last_reflection?.text && <details className="rv-own-note"><summary>برداشت قبلی من</summary><p>{entry.last_reflection.text}</p></details>}
      <div className="rv-practice-tools">
        <Action tone="primary" icon="arrow" data-question="" disabled={busy} onClick={() => void controller.openQuestion()}>حالا با یک مثال دیگر امتحان کن</Action>
        <Action tone="text-link" disabled={busy} onClick={controller.reason}>بازگشت به دلیل پیشنهاد</Action>
      </div>
      {reference && <a className="rv-text-link rv-reference" target="_blank" rel="noopener" href={reference}>
        {concept.review_anchor ? 'مطالعهٔ بخش مرتبط در یادداشت' : 'مطالعهٔ یادداشت مرتبط'} ←
      </a>}
    </>}
  </>;
}

function QuestionStage({ practice, busy, controller }: Pick<StageProps, 'busy' | 'controller'> &
  { practice: Extract<Practice, { stage: 'question' }> }) {
  const { entry, run, selected } = practice;
  return <>
    <p className="rv-eyebrow">آزمودن دوباره · {entry.title}</p>
    <FocusHeading id="rv-stage-title"><TeachingText value={run.question.stem} /></FocusHeading>
    <form data-answer-form="" onSubmit={event => { event.preventDefault(); void controller.answer(); }}>
      <fieldset disabled={busy}><legend className="sr-only">پاسخت را انتخاب کن</legend>
        {run.question.options.map((option, i) => <label className="rv-answer" key={i}>
          <input type="radio" name="review-answer" value={i} checked={selected === String(i)} required
            onChange={() => controller.select(String(i))} /><span><TeachingText value={option} /></span>
        </label>)}
      </fieldset>
      <div className="rv-practice-tools">
        <Action tone="primary" type="submit" icon="arrow" disabled={busy}>بررسی پاسخ</Action>
        <Action data-hint="" disabled={busy || Boolean(run.hint_used)} onClick={() => void controller.hint()}>Hint</Action>
        <Action tone="text-link" data-skip="" disabled={busy} onClick={() => void controller.answer(true)}>هنوز نمی‌دانم</Action>
      </div>
    </form>
    <div aria-live="polite">{run.hint && <p className="rv-hint" data-hint-text=""><TeachingText value={run.hint} /></p>}</div>
    <Action tone="text-link" className="rv-text-link rv-reference" data-reread="" disabled={busy}
      onClick={() => void controller.reread()}>بازخوانی نکته ←</Action>
  </>;
}

function FeedbackStage({ practice, busy, controller }: Pick<StageProps, 'busy' | 'controller'> &
  { practice: Extract<Practice, { stage: 'feedback' }> }) {
  const { entry, run, answer, receipt, reflection, context, queue } = practice;
  const answerIndex = receipt.answer !== undefined ? Number(receipt.answer) : -1;
  const correctAnswer = run.question.options[answerIndex];
  const retry = !receipt.correct || receipt.hint_used || receipt.preparation_used;
  return <>
    <h1 id="rv-stage-title">{entry.title}</h1>
    <section className="rv-feedback" data-correct={receipt.correct} aria-labelledby="rv-feedback-title">
      <FocusHeading id="rv-feedback-title" level={2}>{reviewOutcome(receipt).title}</FocusHeading>
      <p><TeachingText value={receipt.explanation} /></p>
      <details className="rv-own-note"><summary>مرور سؤال و پاسخ من</summary>
        <p><TeachingText value={run.question.stem} /></p>
        <p>پاسخ تو: {answer === null ? 'هنوز نمی‌دانم' : <TeachingText value={run.question.options[Number(answer)]} />}</p>
      </details>
      {!receipt.correct && correctAnswer && <p>پاسخ این تمرین: <strong><TeachingText value={correctAnswer} /></strong></p>}
      <p className="rv-next-date">{retry ? 'مرور بعدی کمک می‌کند این نکته را دوباره بررسی کنی.' : 'نتیجهٔ همین تمرین ثبت شد.'}
        {receipt.next_due && ' مرور بعدی: ' + shortDate(receipt.next_due)}</p>
      <section className="rv-reflection">
        <h3>با زبان خودم</h3>
        <label htmlFor="rv-reflection-text"><TeachingText value={context.concept.learning?.reflection_prompt || 'از این مرور چه نکته‌ای را می‌خواهم به خاطر بسپارم؟'} /></label>
        <textarea id="rv-reflection-text" data-reflection="" maxLength={2000} rows={3} disabled={busy}
          placeholder="اختیاری؛ یک جمله هم کافی است." value={reflection.text} onChange={event => controller.editReflection(event.target.value)} />
        <Action tone="text-link" data-save-reflection="" disabled={busy} onClick={() => void controller.saveReflection()}>ذخیرهٔ برداشت من</Action>
        <p className="rv-dialog-status" role="status">{reflection.message}</p>
        {reflection.conflict && <Action data-reflection-compare="" disabled={busy}
          onClick={() => void controller.compareReflection()}>دریافت نسخهٔ حساب برای مقایسه</Action>}
        {reflection.remote !== undefined && <details open><summary>برداشت ذخیره‌شدهٔ حساب</summary>
          <p className="rv-preserve">{reflection.remote || 'خالی'}</p></details>}
      </section>
      <div className="rv-practice-tools">
        {retry && <Action tone={receipt.correct ? 'outline' : 'primary'} icon="arrow" disabled={busy}
          data-retry-concept="" onClick={() => void controller.leave('retry')}>
          {receipt.correct ? 'یک مثال دیگر، بدون بازخوانی' : 'بازخوانی و یک سؤال دیگر'}
        </Action>}
        <Action tone={receipt.correct ? 'primary' : 'outline'} icon="arrow" data-next="" disabled={busy}
          onClick={() => void controller.leave('next')}>{queue.length ? 'موضوع بعدی' : 'بازگشت به دفتر'}</Action>
      </div>
    </section>
  </>;
}

export function ReviewPractice(props: StageProps) {
  const { practice, busy, controller } = props;
  const stage = ['reason', 'concept', 'question', 'feedback'].indexOf(practice.stage);
  return <div className="rv-mode-practice">
    <div className="rv-practice-head">
      <Action tone="text-link" data-back="" disabled={busy} onClick={() => void controller.leave('back')}><Icon name="arrow" /> بازگشت به دفتر</Action>
      <span>{stage < 2 ? 'به تجربهٔ قبلی برگرد و دوباره امتحان کن' : 'یک تمرین، یک مفهوم'}</span>
    </div>
    <section className={'rv-practice' + (stage < 2 ? ' rv-context-flow' : '')} aria-labelledby="rv-stage-title">
      <ol className="rv-learning-steps" aria-label="مراحل مرور">{steps.map((label, i) => <li key={label}
        aria-current={stage === i ? 'step' : undefined}><bdi>{i + 1}</bdi>{label}</li>)}</ol>
      {practice.stage === 'question' ? <QuestionStage key={practice.run.id} practice={practice} busy={busy} controller={controller} />
        : practice.stage === 'feedback' ? <FeedbackStage key={practice.run.id} practice={practice} busy={busy} controller={controller} />
        : <ContextStage key={practice.entry.id + practice.stage} {...props} />}
    </section>
  </div>;
}
