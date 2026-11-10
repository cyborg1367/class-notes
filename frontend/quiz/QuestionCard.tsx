import { Inline, CodePrompt, blankLabel, number } from '../quiz-result/QuizResult';
import type { Answer, Feedback, Question, QuizOptions } from './contracts';
import { valueOf } from './model';
import { QuestionFigure } from './QuestionFigure';

type Props = {
  question: Question; index: number; answer?: Answer; errors: Record<string, string>;
  feedback?: Feedback; practice: boolean; checking: boolean; locked: boolean; lessonURL: string;
  blankHelp: QuizOptions['blankHelp'];
  onChange: (value: string, blank?: string) => void; onPractice: (hint: boolean) => void;
};

export function QuestionCard({ question, index, answer, errors, feedback, practice, checking, locked,
  lessonURL, blankHelp, onChange, onPractice }: Props) {
  const item = feedback?.kind === 'check' ? feedback.item : undefined;
  const marks = new Map(item?.parts?.map(part => [part.id, part.correct]));
  return <section className="question-card" id={'question-' + question.id} data-question-card={question.id} tabIndex={-1}>
    <div className="question-meta"><span>سؤال {number(index + 1)} · {question.skill}</span><span>{number(question.points)} امتیاز</span></div>
    <h2><Inline text={question.stem} /></h2>
    {question.figure && <QuestionFigure figure={question.figure} />}
    {question.code && <CodePrompt code={question.code} blanks={question.type === 'fill' ? question.blanks : []} />}
    {question.type === 'choice' ? <fieldset className="quiz-choice">
      <legend className="sr-only">گزینه‌های سؤال {number(index + 1)}</legend>
      <div className="quiz-options">{question.options.map(([id, label]) =>
        <label className="quiz-option" key={id}>
          <input type="radio" name={question.id} value={id} data-question={question.id}
            checked={answer === id} disabled={locked} onChange={event => { if (event.currentTarget.checked) onChange(id); }} />
          <bdi dir="auto"><Inline text={label} /></bdi>
        </label>)}</div>
    </fieldset> : <div className="blank-fields">
      {question.blanks.map((blank, index) => {
        const id = question.id + '-' + blank.id, error = errors[blank.id];
        return <label key={blank.id} htmlFor={id}>
          <bdi dir="ltr">{blankLabel(index)}</bdi> — {blank.label}
          <input id={id} data-question={question.id} data-blank={blank.id} type="text" dir="ltr" maxLength={200}
            autoComplete="off" autoCapitalize="off" spellCheck={false} aria-invalid={Boolean(error) || marks.get(blank.id) === false || undefined}
            aria-describedby={id + '-help ' + id + '-error'} aria-label={`جای خالی ${blankLabel(index)}: ${blank.label}`}
            value={valueOf(answer, blank.id)} disabled={locked} onChange={event => onChange(event.currentTarget.value, blank.id)} />
          <span className="blank-help" id={id + '-help'}>{blankHelp(blank.input_kind)}</span>
          <span className="blank-error" id={id + '-error'} data-blank-error={question.id + ':' + blank.id} hidden={!error}>{error}</span>
        </label>;
      })}
    </div>}
    <div className="question-tools" data-practice-tools="" hidden={!practice}>
      <button type="button" data-hint={question.id} disabled={locked || checking} onClick={() => onPractice(true)}>راهنمای مفهومی</button>
      <button type="button" data-check={question.id} disabled={locked || checking} onClick={() => onPractice(false)}>بررسی پاسخ</button>
    </div>
    <div className={'question-feedback' + (item?.correct ? ' is-correct' : '')} data-feedback={question.id}
      role="status" aria-live="polite" hidden={!feedback}>
      {feedback?.kind === 'notice' && feedback.text}
      {feedback?.kind === 'hint' && <>
        <strong>راهنمای مفهومی</strong><p><Inline text={feedback.text} /></p>
        <p className="small-note">اکنون دوباره پاسخ بده؛ بررسی پاسخ، مرحلهٔ بعد است.</p>
      </>}
      {item && <>
        <strong>{item.correct ? 'پاسخ درست است.' : 'پاسخ بررسی شد؛ بخش‌های مشخص‌شده را بازبینی کن.'}</strong>
        {question.type === 'fill' && Boolean(item.parts?.length) && <ul className="practice-parts">
          {question.blanks.filter(blank => marks.has(blank.id)).map(blank =>
            <li key={blank.id}>جای خالی <bdi dir="ltr">{blankLabel(question.blanks.indexOf(blank))}</bdi>: {marks.get(blank.id) ? 'درست' : 'نیازمند بازبینی'}</li>)}
        </ul>}
        {item.selected_feedback && <p><Inline text={item.selected_feedback} /></p>}
        {item.correct ? <p><Inline text={item.explanation} /></p> : <details className="feedback-detail">
          <summary>نمایش توضیح کامل؛ ممکن است پاسخ را نشان دهد</summary><p><Inline text={item.explanation} /></p>
        </details>}
        {item.review && <a href={lessonURL + '#' + encodeURIComponent(item.review)}>مرور بخش مرتبط در یادداشت ←</a>}
      </>}
    </div>
  </section>;
}
