import { Fragment, useEffect, useRef } from 'react';

type Numeric = number | string;
type Blank = { id: string; input_kind?: string };
type Prompt = {
  id: string; type?: 'choice' | 'fill'; stem: string; code?: string;
  options?: [string, string][]; blanks?: Blank[];
};
type Part = { id: string; correct: boolean; accepted: string[] };
type Item = {
  id: string; skill: string; correct: boolean; score: Numeric; maximum: Numeric;
  key?: string; parts?: Part[]; explanation: string; selected_feedback?: string; review?: string;
};
type Answer = string | Record<string, string>;
type Summary = { attempts: Numeric; first_score?: Numeric | null; best_score?: Numeric | null; last_score?: Numeric | null };
type Receipt = {
  attempt_no: Numeric; created_at?: string; answers?: Record<string, Answer>;
  result: { score: Numeric; maximum: Numeric; items: Item[]; practice_checks?: Numeric; hints_used?: Numeric };
};
export type QuizResultProps = {
  record: Receipt; prompts: Prompt[]; summary?: Summary | null;
  links: { lesson: string; review: string; quiz: string; dashboard?: string; course?: string; results?: string };
  focus?: boolean;
};

export function number(value?: Numeric | null) {
  return value != null && Number.isFinite(Number(value))
    ? Number(value).toLocaleString('en-US', { useGrouping: false }) : '—';
}

export const blankLabel = (index: number) => String.fromCharCode(65 + index);

function Score({ value, maximum }: { value?: Numeric | null; maximum: Numeric }) {
  return <bdi dir="ltr">{number(value)} / {number(maximum)}</bdi>;
}

export function Inline({ text }: { text: string }) {
  return <>{String(text ?? '').split(/(`[^`]+`)/g).map((part, index) => part.startsWith('`') && part.endsWith('`')
    ? <code key={index} dir="ltr" className="portal-inline-code">{part.slice(1, -1)}</code>
    : <Fragment key={index}>{part}</Fragment>)}</>;
}

export function CodePrompt({ code, blanks }: { code: string; blanks: Blank[] }) {
  return <pre className="quiz-code" dir="ltr" tabIndex={0}>{code.split(/(\{\{\w+\}\})/g).map((token, index) => {
    const match = token.match(/^\{\{(\w+)\}\}$/);
    const blank = match ? blanks.findIndex(item => item.id === match[1]) : -1;
    return blank >= 0 ? <mark key={index}>[{blankLabel(blank)}]</mark> : <Fragment key={index}>{token}</Fragment>;
  })}</pre>;
}

export function AttemptHistory({ summary, maximum }: { summary?: Summary | null; maximum: Numeric }) {
  if (!summary || !Number(summary.attempts)) return <p className="small-note">هنوز نتیجه‌ای برای این نسخه از آزمون ثبت نشده است.</p>;
  return <div className="quiz-history" aria-label="سابقهٔ همین نسخه از آزمون">
    <div><span>اولین نتیجه</span><strong><Score value={summary.first_score} maximum={maximum} /></strong></div>
    <div><span>بهترین نتیجه</span><strong><Score value={summary.best_score} maximum={maximum} /></strong></div>
    {summary.last_score != null && <div><span>آخرین نتیجه</span><strong><Score value={summary.last_score} maximum={maximum} /></strong></div>}
    <div><span>تعداد تلاش‌ها</span><strong>{number(summary.attempts)}</strong></div>
  </div>;
}

function BlankResults({ parts, answer, prompt, maximum }: {
  parts: Part[]; answer?: Answer; prompt?: Prompt; maximum: Numeric;
}) {
  const share = parts.length ? Number(maximum) / parts.length : 0;
  return <div className="portal-table-scroll">
    <table className="portal-table blank-results">
      <caption>نتیجهٔ هر جای خالی</caption>
      <thead><tr>{['جای خالی', 'پاسخ تو', 'نتیجه', 'امتیاز', 'پاسخ پذیرفته‌شده']
        .map(label => <th key={label} scope="col">{label}</th>)}</tr></thead>
      <tbody>{parts.map((part, index) => {
        const value = typeof answer === 'object' ? answer?.[part.id] : undefined;
        const kind = prompt?.blanks?.find(blank => blank.id === part.id)?.input_kind;
        const accepted = part.accepted.map(value => kind === 'stringLiteral' ? JSON.stringify(value) : value).join(' / ');
        return <tr key={part.id}>
          <th scope="row"><bdi dir="ltr">{blankLabel(index)}</bdi></th>
          <td><bdi dir="ltr">{value || '—'}</bdi></td>
          <td>{part.correct ? 'درست' : value ? 'نیازمند مرور' : 'بدون پاسخ'}</td>
          <td><Score value={part.correct ? share : 0} maximum={share} /></td>
          <td><bdi dir="ltr">{accepted}</bdi></td>
        </tr>;
      })}</tbody>
    </table>
  </div>;
}

function QuestionResult({ item, prompt, answer, index, lesson }: {
  item: Item; prompt?: Prompt; answer?: Answer; index: number; lesson: string;
}) {
  const parts = item.parts ?? [];
  const fill = prompt?.type === 'fill' || parts.length > 0;
  const outcome = item.correct ? 'درست' : Number(item.score) > 0 ? 'بخشی درست' : answer == null ? 'بدون پاسخ' : 'نیازمند مرور';
  const response = typeof answer === 'string' ? (prompt?.options?.find(option => option[0] === answer)?.[1] ?? answer) : '';
  const correct = prompt?.options?.find(option => option[0] === item.key)?.[1];
  return <article className="result-item" data-outcome={item.correct ? 'correct' : 'review'}>
    <div className="question-meta"><span>سؤال {number(index + 1)} · {outcome}</span><span><Score value={item.score} maximum={item.maximum} /></span></div>
    <h3>{item.skill}</h3>
    {prompt && <p><Inline text={prompt.stem} /></p>}
    {prompt?.code && <CodePrompt code={prompt.code} blanks={prompt.blanks ?? parts} />}
    {fill ? <BlankResults parts={parts} answer={answer} prompt={prompt} maximum={item.maximum} /> : <>
      {response ? <p>پاسخ ثبت‌شده: <bdi dir="auto"><Inline text={response} /></bdi></p> : <p>پاسخی ثبت نشده بود.</p>}
      {correct && <p>پاسخ درست: <Inline text={correct} /></p>}
    </>}
    <p><Inline text={item.explanation} /></p>
    {item.selected_feedback && <p><Inline text={item.selected_feedback} /></p>}
    {item.review && <a href={lesson + '#' + encodeURIComponent(item.review)}>مرور بخش مرتبط در یادداشت ←</a>}
  </article>;
}

function attemptDate(value?: string) {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date.toLocaleString('fa-IR', { dateStyle: 'medium', timeStyle: 'short' }) : '';
}

export function QuizNavigation({ links }: { links: QuizResultProps['links'] }) {
  return <nav className="quiz-context" aria-label="دسترسی‌های آزمون">
    <a className="quiet-link" href={links.lesson}>بازگشت به یادداشت ←</a>
    {links.course && <a className="quiet-link" href={links.course}>فهرست یادداشت‌های کلاس</a>}
    {links.results && <a className="quiet-link" href={links.results}>همهٔ نتایج من</a>}
  </nav>;
}

export function QuizResult({ record, prompts, summary, links, focus }: QuizResultProps) {
  const section = useRef<HTMLElement>(null);
  useEffect(() => {
    const element = section.current;
    if (!focus || !element) return;
    element.focus({ preventScroll: true });
    const reduce = element.ownerDocument.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    element.scrollIntoView?.({ behavior: reduce ? 'instant' : 'smooth', block: 'start' });
  }, [focus]);

  const result = record.result;
  const byId = new Map(prompts.map(prompt => [prompt.id, prompt]));
  const date = attemptDate(record.created_at);
  const checks = Number(result.practice_checks) || 0;
  const hints = Number(result.hints_used) || 0;
  return <>
    {!focus && links.course && <QuizNavigation links={links} />}
    <section className="quiz-result" data-react-quiz-result="" ref={section} tabIndex={-1}>
      <p className="eyebrow">نتیجهٔ ثبت‌شده · تلاش {number(record.attempt_no)}</p>
      <h2><Score value={result.score} maximum={result.maximum} /></h2>
      {date && <p><time dateTime={record.created_at}>{date}</time></p>}
      <p>این نتیجه مربوط به همین تلاش است. برای مرور، پاسخ هر سؤال و توضیح آن را ببین.</p>
      <AttemptHistory summary={summary} maximum={result.maximum} />
      <p className="small-note">{checks || hints
        ? `تا زمان این ثبت: ${number(checks)} بررسی تمرینی و ${number(hints)} دریافت راهنما برای این نسخه انجام شده است.`
        : 'برای این نسخه، استفاده‌ای از بررسی تمرینی یا راهنما تا زمان این ثبت گزارش نشده است.'} این شمارش تجمعی است؛ نمره به‌تنهایی نشان‌دهندهٔ تسلط مستقل نیست.</p>
      <div className="result-items">{result.items.map((item, index) =>
        <QuestionResult key={item.id} item={item} prompt={byId.get(item.id)} answer={record.answers?.[item.id]} index={index} lesson={links.lesson} />
      )}</div>
      <a className="button-outline" href={links.review}>مرور موضوعات این یادداشت ←</a>
    </section>
    {links.dashboard ? <div className="portal-actions">
      <a className="button-outline" href={links.quiz}>شرکت دوباره در آزمون ←</a>
      <a className="quiet-link" href={links.dashboard}>بازگشت به داشبورد</a>
    </div> : <a className="button-outline" href={links.quiz}>بازگشت به تمرین و آزمون ←</a>}
  </>;
}
