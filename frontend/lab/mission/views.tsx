import { PaperIcon } from '../../components/PaperIcon';

export type MissionStep = {
  id: string; title: string; xp: number; brief: string;
  // Markup authored in the public mission modules. Learner input is never passed here.
  action: string; inputTitle: string; input: string; resultTitle: string; result: string;
  task: string; example: string; hints: readonly string[];
};
export type MissionView = {
  steps: readonly MissionStep[]; active: number; limit: number;
  completed: ReadonlySet<string>; busy: boolean; revealed: number;
};
const fa = new Intl.NumberFormat('fa-IR');
const format = (value: number) => fa.format(value);
export const lockedExplanation = 'برای بازشدن مراحل بعد، پاسخ مرحلهٔ پیشین باید تأیید شود.';

export function MissionPath({ view, onChoose }: { view: MissionView; onChoose(index: number): void }) {
  return <>{view.steps.map((step,index) => {
    const completed = view.completed.has(step.id);
    const locked = index > view.limit;
    const active = index === view.active;
    const label = 'مرحلهٔ ' + format(index+1) + ': ' + step.title + (completed ? '؛ تکمیل‌شده' : locked ? '؛ قفل‌شده' : '');
    return <li key={step.id} title={locked ? label + '؛ ' + lockedExplanation : label}>
      <button data-stage={index} data-done={completed} data-locked={locked} type="button" aria-label={label}
        aria-current={active ? 'step' : undefined} aria-describedby={locked ? 'lab-stage-lock-help' : undefined}
        disabled={locked || view.busy} onClick={() => { if (!active && !locked && !view.busy) onChoose(index); }}>
        <span className="mission-step-number" aria-hidden="true">{completed ? '✓' : format(index+1)}</span>
      </button>
    </li>;
  })}</>;
}

export function MissionBrief({ view }: { view: MissionView }) {
  const step = view.steps[view.active];
  return <>
    <div className="mission-brief-meta">
      <p className="lab-task-number" data-task-number="">مرحلهٔ {format(view.active+1)} از {format(view.steps.length)}</p>
      <span className="mission-brief-xp" data-task-reward="" lang="en" dir="ltr">+{step.xp} XP</span>
    </div>
    <h2 id="lab-task-title" tabIndex={-1}>{step.title}</h2>
    <p className="mission-context" data-concept="">{step.brief}</p>
    <p className="mission-action" data-action="" dangerouslySetInnerHTML={{ __html: step.action }} />
    <dl className="mission-io">
      <div><dt>{step.inputTitle}</dt><dd data-input="" dangerouslySetInnerHTML={{ __html: step.input }} /></div>
      <div><dt>{step.resultTitle}</dt><dd data-result="" dangerouslySetInnerHTML={{ __html: step.result }} /></div>
    </dl>
    <details key={step.id} className="mission-contract">
      <summary>یک مثال کوچک</summary>
      <div className="mission-task-text" data-task="" dangerouslySetInnerHTML={{ __html: step.task }} />
      <pre data-example="" dir="ltr" tabIndex={0}>{step.example}</pre>
    </details>
    <p id="lab-stage-lock-help" className={view.limit < view.steps.length-1
      ? 'mission-lock-note' : 'lab-sr-only'}>{lockedExplanation}</p>
  </>;
}

export function MissionHints({ view, onReveal }: { view: MissionView; onReveal(): void }) {
  const hints = view.steps[view.active].hints;
  const visible = hints.slice(0,view.revealed);
  return <div className="mission-hints">
    <button type="button" data-hint="" className="lab-hint-button" disabled={view.busy || visible.length >= hints.length}
      onClick={onReveal}><PaperIcon name="hint" /><span data-hint-label="">راهنمای بعدی</span></button>
    <span className="mission-hint-count" data-hint-count="">{format(visible.length)} از {format(hints.length)}</span>
    <div data-hints="" aria-live="polite">
      {visible.map((hint,index) => <p key={index}><b>{format(index+1)}</b> {hint}</p>)}
    </div>
  </div>;
}
