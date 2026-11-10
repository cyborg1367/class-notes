import { useEffect, useRef, type MouseEvent } from 'react';
import { PaperIcon } from '../components/PaperIcon';
import { Inline, CodePrompt, blankLabel } from '../quiz-result/QuizResult';
import { QuestionFigure } from '../quiz/QuestionFigure';
import type { QuizFigure } from '../quiz/contracts';
import { date, relative, fa, latin, message } from '../../web/assets/instructor-model.mjs';
import type { Confirmation, Concept, History, Receipt, Sheet } from './contracts';
import type { Controller } from './controller';
import { Bar, Failure, Grade, Loading, StatusPill, XP, type Labels } from './Presentation';

function useModal(open: boolean) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!open || !dialog) return;
    const doc = dialog.ownerDocument;
    const origin = doc.activeElement as HTMLElement | null;
    if (typeof dialog.showModal === 'function') {
      if (!dialog.open) dialog.showModal();
    } else dialog.setAttribute('open', '');
    return () => {
      if (dialog.open) {
        if (typeof dialog.close === 'function') dialog.close();
        else dialog.removeAttribute('open');
      }
      if (origin?.isConnected) origin.focus({ preventScroll: true });
      else doc.querySelector<HTMLElement>('[data-instructor-nav] [aria-current="page"]')?.focus({ preventScroll: true });
    };
  }, [open]);
  return ref;
}

function isBackdrop(event: MouseEvent<HTMLDialogElement>) {
  if (event.target !== event.currentTarget) return false;
  const bounds = event.currentTarget.getBoundingClientRect();
  return event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
}

function Attempts({ history, user, labels, actions }: { history: History; user: string; labels: Labels; actions: Controller }) {
  if (history.loading) return <Loading>در حال دریافت ثبت‌های آزمون…</Loading>;
  if (history.error || !history.data) return <Failure error={history.error} retry={() => void actions.loadHistory()} />;
  return <>
    {history.data.rows.length ? history.data.rows.map(attempt =>
      <button key={attempt.id} className="attempt-link" type="button" onClick={() => void actions.attempt(attempt.id,user)}>
        <span>{labels.noteLabel(attempt.lesson_id)} · نسخهٔ {fa(attempt.version)}
          <small>{date(attempt.created_at)} · {attempt.attempt_no === 1 ? 'اولین ثبت' : 'تلاش ' + fa(attempt.attempt_no)}</small></span>
        <span><Grade score={attempt} /> ←</span>
      </button>) : <p className="small muted">هنوز آزمونی ثبت نشده است.</p>}
    <div className="pages instructor-history-pages">
      <button className="btn small-btn" type="button" disabled={!history.index} onClick={() => actions.historyPage(-1)}>قبلی</button>
      <span className="small muted">صفحهٔ {fa(history.index + 1)}</span>
      <button className="btn small-btn" type="button" disabled={!history.data.next_cursor} onClick={() => actions.historyPage(1)}>بعدی</button>
    </div>
  </>;
}

function StudentDetail({ sheet, labels, actions }: { sheet: Extract<Sheet,{user:string}>; labels: Labels; actions: Controller }) {
  const person = sheet.person;
  if (sheet.error || !person) return <>
    <h2 id="instructor-detail-title">{sheet.kind === 'request' ? 'بررسی درخواست' : 'پروندهٔ آموزشی دانشجو'}</h2>
    {sheet.error ? <Failure error={sheet.error} retry={() => void actions.student(sheet.user,sheet.kind)} /> : <Loading>در حال دریافت پرونده…</Loading>}
  </>;
  return <>
    <h2 id="instructor-detail-title">{person.name || person.email || 'دانشجو'}</h2>
    <bdi className="email">{person.email}</bdi>
    <div className="sheet-meta"><StatusPill status={person.status} /><span className="small muted">{sheet.kind === 'request'
      ? 'درخواست: ' + date(person.requested_at) : 'آخرین ثبت آموزشی: ' + relative(person.last_registered_at)}</span></div>
    {sheet.kind === 'request' ? <section className="sheet-section">
      <h3>عضویت در {labels.courseTitle}</h3><p className="small muted">با تأیید، دسترسی این حساب به محتوای کلاس فعال می‌شود.</p>
      <div className="confirm-actions"><button className="btn" type="button" onClick={actions.closeSheet}>بررسی در فرصت دیگر</button>
        <button className="btn primary" type="button" disabled={person.status === 'active'} onClick={() => void actions.askMembership(person.user_id)}>تأیید دسترسی</button></div>
    </section> : <>
      <div className="sheet-stats">
        <div className="sheet-stat"><span>XP لابراتورها</span><strong><XP lab={person.lab} /></strong></div>
        <div className="sheet-stat"><span>آخرین نمرهٔ آزمون</span><strong><Grade score={person.latest_quiz} /></strong></div>
      </div>
      <section className="sheet-section"><h3>مسیر لابراتورها</h3>
        {person.lab.missions.length ? person.lab.missions.map(mission => {
          const completed = mission.completed || [], steps = labels.course?.lessons.find(lesson => lesson.lab?.mission === mission.mission)?.lab_steps || [];
          return <div key={mission.mission} className="sheet-progress">
            <div className="progress-line"><strong>{labels.labTitle(mission.mission,mission.title)}</strong>
              <small>{fa(completed.length)} از {fa(mission.task_count)} · <bdi className="mono">{latin(mission.xp)} XP</bdi></small></div>
            <Bar value={completed.length} max={mission.task_count} />
            {!!mission.tasks?.length && <details className="instructor-task-details"><summary>مأموریت‌ها</summary><ul>{mission.tasks.map(task =>
              <li key={task.id}><span aria-hidden="true">{completed.includes(task.id) ? '✓' : '○'}</span>{' '}
                {steps.find(step => step.id === task.id)?.title || 'مأموریت ' + fa(task.position)}
                {completed.includes(task.id) && <span className="small muted"> · انجام‌شده</span>}</li>)}</ul></details>}
          </div>;
        }) : <p className="small muted">هنوز پیشرفت لابراتوری در این گزارش نیست.</p>}
      </section>
      <section className="sheet-section"><h3>ثبت‌های آزمون{person.quiz_attempts == null ? '' : ' · ' + fa(person.quiz_attempts) + ' ثبت'}</h3>
        <Attempts history={sheet.history} user={sheet.user} labels={labels} actions={actions} />
      </section>
      <section className="sheet-section"><button className={'btn ' + (person.status === 'active' ? 'danger' : '')} type="button"
        onClick={() => void actions.askMembership(person.user_id)}>{person.status === 'active' ? 'غیرفعال‌کردن دسترسی' : 'فعال‌کردن دسترسی'}</button></section>
    </>}
  </>;
}

function ReportFigure({ figure }: { figure?: QuizFigure }) {
  const pair = (value: unknown) => Array.isArray(value) && value.length === 2 && value.every(Number.isFinite);
  const valid = figure?.type === 'distance2d' ? pair(figure.u) && pair(figure.v) :
    figure?.type === 'knn2d' && pair(figure.query) && Array.isArray(figure.points) &&
    figure.points.every(point => point && typeof point.id === 'string' && pair(point.x) && (point.y === 0 || point.y === 1));
  return valid && figure ? <div className="instructor-question-figure"><QuestionFigure figure={figure} /></div> : null;
}

function PromptCode({ code, blanks }: { code?: string; blanks?: { id: string }[] }) {
  return code ? <div className="instructor-code"><span>Python</span><CodePrompt code={code} blanks={blanks || []} /></div> : null;
}

function Answers({ receipt }: { receipt: Receipt }) {
  const prompts = new Map(receipt.prompts?.map(prompt => [prompt.id,prompt]));
  if (!receipt.result.items?.length) return <p className="small muted">جزئیات پاسخ‌های این ثبت در دسترس نیست.</p>;
  return <>{receipt.result.items.map((item,index) => {
    const question = prompts.get(item.id), value = receipt.answers?.[item.id], parts = item.parts || [];
    const selected = typeof value === 'string' ? question?.options?.find(([id]) => id === value)?.[1] || value : 'پاسخی ثبت نشده بود.';
    const correct = question?.options?.find(([id]) => id === item.key)?.[1];
    const outcome = item.correct ? 'درست' : Number(item.score) > 0 ? 'بخشی درست' : 'نادرست';
    return <article key={item.id} className="answer">
      <header><span>سؤال {fa(index + 1)} · {item.skill || item.id}</span>
        <span className={'pill ' + (item.correct ? '' : 'pending')}>{outcome} · <Grade score={item} /></span></header>
      {question ? <><p><Inline text={question.stem} /></p>
        <ReportFigure figure={question.figure} />
        <PromptCode code={question.code} blanks={question.blanks} /></> :
        <p className="small muted">متن این نسخهٔ سؤال در دسترس نیست؛ نتیجهٔ ثبت‌شده حفظ شده است.</p>}
      {parts.length ? <div className="table-scroll"><table className="instructor-answer-table">
        <caption>پاسخ هر جای خالی</caption><thead><tr>{['جای خالی','پاسخ دانشجو','نتیجه','پاسخ پذیرفته‌شده'].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead>
        <tbody>{parts.map((part,index) => {
          const accepted = (part.accepted || []).map(answer => question?.blanks?.find(blank => blank.id === part.id)?.input_kind === 'stringLiteral'
            ? JSON.stringify(answer) : answer).join(' / ');
          return <tr key={part.id}><th scope="row">{blankLabel(index)}</th>
            <td><bdi dir="ltr">{value && typeof value === 'object' ? value[part.id] ?? '—' : '—'}</bdi></td>
            <td>{part.correct ? 'درست' : 'نادرست'}</td><td><bdi dir="ltr">{accepted}</bdi></td></tr>;
        })}</tbody>
      </table></div> : <dl><dt>پاسخ دانشجو</dt><dd><Inline text={selected} /></dd>
        {correct && <><dt>پاسخ معیار</dt><dd><Inline text={correct} /></dd></>}</dl>}
      <p className="small muted top-gap"><Inline text={item.explanation} /></p>
      {item.selected_feedback && <p className="small muted"><Inline text={item.selected_feedback} /></p>}
    </article>;
  })}</>;
}

function AttemptDetail({ sheet, labels, actions }: { sheet: Extract<Sheet,{kind:'attempt'}>; labels: Labels; actions: Controller }) {
  const receipt = sheet.record;
  return <>
    {sheet.from && <button className="quiet sheet-back" type="button" onClick={() => void actions.student(sheet.from!)}>→ بازگشت به دانشجو</button>}
    <h2 id="instructor-detail-title">بررسی پاسخ آزمون</h2>
    {sheet.error ? <Failure error={sheet.error} retry={() => void actions.attempt(sheet.id,sheet.from)} /> : !receipt ? <Loading>در حال دریافت پاسخ‌ها…</Loading> : <>
      <p className="small muted">{labels.lessonInfo(receipt.lesson_id)?.title || sheet.row?.title || receipt.lesson_id}</p>
      <div className="sheet-meta">{sheet.row?.name && <span>{sheet.row.name}</span>}<span className="pill">نسخهٔ {fa(receipt.version)}</span>
        <span className="pill off">{Number(receipt.attempt_no) === 1 ? 'اولین ثبت نهایی' : 'تلاش ' + fa(receipt.attempt_no)}</span></div>
      <div className="sheet-stats"><div className="sheet-stat"><span>نمرهٔ همین ثبت</span><strong><Grade score={receipt.result} /></strong></div>
        <div className="sheet-stat"><span>زمان ثبت</span><strong className="instructor-date">{date(receipt.created_at,true)}</strong></div></div>
      <section className="sheet-section"><h3>پاسخ‌های ثبت‌شده</h3><Answers receipt={receipt} /></section>
    </>}
  </>;
}

function QuestionDetail({ concept, labels }: { concept: Concept; labels: Labels }) {
  const counts = Object.entries(concept.choice_counts || {}).sort((a,b) => b[1]-a[1]);
  return <>
    <h2 id="instructor-detail-title">{concept.skill || concept.question_id}</h2>
    <p className="small muted top-gap">{labels.noteLabel(concept.lesson_id)} · نسخهٔ {fa(concept.version)} · اولین ثبت نهایی</p>
    <section className="sheet-section">
      <p><Inline text={concept.stem || 'متن سؤال در دسترس نیست.'} /></p>
      <ReportFigure figure={concept.figure} />
      <PromptCode code={concept.code} blanks={concept.blanks} />
      <div className="sheet-stats top-gap"><div className="sheet-stat"><span>تعداد پاسخ‌ها</span><strong>{fa(concept.responses)}</strong></div>
        <div className="sheet-stat"><span>پاسخ کاملِ درست</span><strong>{fa(concept.correct)}</strong></div></div>
      {counts.length ? <><h3 className="top-gap">گزینه‌های انتخاب‌شده</h3>{counts.map(([key,n]) => <div className="answer" key={key}>
        <p><Inline text={concept.options?.find(([id]) => id === key)?.[1] || key} /></p><small>{fa(n)} پاسخ</small></div>)}</> :
        <p className="small muted top-gap">برای سؤال‌های جای خالی، جزئیات هر پاسخ در ثبت آزمون قابل بررسی است.</p>}
    </section>
  </>;
}

export function Details({ sheet, confirmation, actions, labels }: { sheet?: Sheet; confirmation?: Confirmation; actions: Controller; labels: Labels }) {
  const detail = useModal(Boolean(sheet)), confirm = useModal(Boolean(confirmation));
  const sheetKey = sheet?.kind === 'attempt' ? 'attempt:' + sheet.id : sheet && 'user' in sheet ? sheet.kind + ':' + sheet.user : sheet?.kind;
  useEffect(() => { if (detail.current) detail.current.scrollTop = 0; }, [sheetKey, detail]);
  const caption = sheet?.kind === 'attempt' ? 'بررسی پاسخ آزمون' : sheet?.kind === 'question' ? 'تحلیل سؤال' :
    sheet?.kind === 'request' ? 'بررسی درخواست' : 'پروندهٔ آموزشی دانشجو';
  const enable = confirmation?.status === 'active';
  return <>
    <dialog ref={detail} className="instructor-detail" data-detail="" aria-labelledby="instructor-detail-title"
      onCancel={event => { event.preventDefault();actions.closeSheet(); }}
      onClose={event => { if (sheet && !event.currentTarget.open) actions.closeSheet(); }}
      onClick={event => { if (isBackdrop(event)) actions.closeSheet(); }}>
      {sheet && <>
        <header className="sheet-head"><span>{caption}</span><button className="icon-btn" type="button" aria-label="بستن جزئیات"
          onClick={actions.closeSheet}><PaperIcon name="close" /></button></header>
        <div className="sheet-body">{sheet.kind === 'attempt' ? <AttemptDetail sheet={sheet} labels={labels} actions={actions} />
          : sheet.kind === 'question' ? <QuestionDetail concept={sheet.question} labels={labels} />
          : <StudentDetail sheet={sheet} labels={labels} actions={actions} />}</div>
      </>}
    </dialog>
    <dialog ref={confirm} className="confirm" data-confirmation="" aria-labelledby="instructor-confirm-title"
      onCancel={event => { event.preventDefault();actions.cancelConfirmation(); }}
      onClose={event => { if (confirmation && !event.currentTarget.open) actions.cancelConfirmation(); }}
      onClick={event => { if (isBackdrop(event)) actions.cancelConfirmation(); }}>
      {confirmation && <>
        <h2 id="instructor-confirm-title">{enable ? 'تأیید دسترسی به کلاس' : 'غیرفعال‌کردن دسترسی'}</h2>
        <p>{confirmation.name}<br /><bdi>{confirmation.email}</bdi></p>
        <p>{enable ? 'این حساب به محتوای کلاس دسترسی خواهد داشت.' : 'دسترسی این حساب متوقف می‌شود؛ نمره‌ها، XP و کارهای قبلی حفظ می‌شوند.'}</p>
        {confirmation.error ? <p role="alert">{message(confirmation.error)}</p> : null}
        {confirmation.busy && <p role="status">در حال ثبت وضعیت…</p>}
        <div className="confirm-actions">
          <button className="btn" type="button" disabled={confirmation.busy} onClick={actions.cancelConfirmation}>انصراف</button>
          <button className={'btn ' + (enable ? 'primary' : 'danger')} type="button" disabled={confirmation.busy}
            onClick={() => void actions.commitMembership()}>{enable ? 'تأیید دسترسی' : 'غیرفعال‌کردن'}</button>
        </div>
      </>}
    </dialog>
  </>;
}
