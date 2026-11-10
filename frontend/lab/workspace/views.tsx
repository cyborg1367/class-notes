import { useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { PaperIcon } from '../../components/PaperIcon';
import type { WorkspaceActions, WorkspaceControls, WorkspaceOptions } from './contracts';

import { flushSync } from 'react-dom';
import type { CSSProperties } from 'react';
import type { LayoutControls, LayoutState } from '../layout/model';
import { useSplitter } from '../layout/useSplitter';

type Channel<T> = { subscribe(listener: () => void): () => void; get(): T };
export type WorkspaceChannels = {
  controls: Channel<WorkspaceControls>;
  output: Channel<string>;
  save: Channel<{ message: string; attention: boolean }>;
};

function MenuGlyph({ vertical = false }: { vertical?: boolean }) {
  return <svg viewBox="0 0 20 20" aria-hidden="true">
    {[4,10,16].map(n => <circle key={n} cx={vertical ? 10 : n} cy={vertical ? n : 10} r="1" />)}
  </svg>;
}
function FocusGlyph() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 3H3v4m10-4h4v4M3 13v4h4m10-4v4h-4" /></svg>;
}

function Toolbar({ options, actions, controls, save, sidebarHidden, toggleSidebar }: {
  options: WorkspaceOptions; actions: WorkspaceActions; controls: WorkspaceChannels['controls']; save: WorkspaceChannels['save'];
  sidebarHidden: boolean; toggleSidebar(): void;
}) {
  const state = useSyncExternalStore(controls.subscribe, controls.get);
  const saved = useSyncExternalStore(save.subscribe, save.get);
  const canRun = options.mode !== 'readonly-preview', live = options.mode === 'normal';
  return <div className="lab-editor-toolbar" dir="rtl">
    <span className="lab-file"><PaperIcon name="note" /><bdi className="lab-filename" lang="en" dir="ltr" title={options.filename}>{options.filename}</bdi>
      <span className="lab-file-dot" aria-hidden="true" /></span>
    <div className="lab-toolbar-controls">
      <div className="lab-actions" dir="rtl" hidden={!canRun && !live}>
        <button className="lab-run-button" data-run="" type="button" onClick={actions.run} hidden={!canRun || state.running}
          disabled={!canRun || state.busy} title="اجرای کد (Ctrl+Enter)" aria-keyshortcuts="Control+Enter Meta+Enter"><PaperIcon name="play" />اجرای کد</button>
        <button className="lab-run-button" data-stop="" type="button" onClick={actions.stop} hidden={!canRun || !state.running}
          disabled={!canRun || !state.running}>توقف</button>
        <button className="button-forest" data-check="" type="button" onClick={actions.check} hidden={!live}
          disabled={!live || state.busy}><PaperIcon name="check" />بررسی پاسخ</button>
      </div>
      <button className="lab-last-feedback" data-last-feedback="" type="button" hidden>آخرین بازخورد</button>
      <details className="lab-tools" data-tools="">
        <summary aria-label="ابزارها و وضعیت ذخیره" title={saved.attention ? 'ابزارها؛ ذخیره نیاز به بررسی دارد' : 'ابزارها و وضعیت ذخیره'}>
          <MenuGlyph /><span className="lab-save-alert" data-save-alert="" hidden={!saved.attention} aria-label="ذخیره نیاز به بررسی دارد">!</span>
        </summary>
        <div className="lab-tools-menu">
          <p data-save="" role="status" aria-live="polite">{saved.message}</p>
          <button data-download="" type="button" onClick={actions.download}>دانلود کد</button>
          <button data-imports="" type="button" onClick={actions.imports} disabled={!state.canImport}>افزودن دستورهای <bdi dir="ltr" lang="en">import</bdi></button>
          <button data-reset="" type="button" onClick={actions.reset} disabled={state.busy}>بازنشانی این مرحله</button>
          <button data-cloud-load="" type="button" onClick={actions.load} disabled={!live || !state.canLoad} hidden={!live}>دریافت نسخهٔ حساب</button>
          <button data-refresh="" type="button" onClick={actions.refresh} disabled={!live} hidden={!live}>همگام‌سازی پیشرفت</button>
          <button data-activate="" type="button" onClick={actions.activate} disabled={!canRun || state.busy}
            hidden={!canRun || state.hasWorker}>راه‌اندازی Python</button>
          <a href={options.links.account}>حساب کاربری</a><a href={options.links.dashboard}>داشبورد</a>
          <a data-lab-teacher-link="" hidden href={options.links.teacher}>پنل مدرس</a>
        </div>
      </details>
      <button className="lab-tool-button lab-focus-button" data-focus="" type="button" aria-pressed={sidebarHidden}
        aria-controls="lab-instructions" title={sidebarHidden?'نمایش پنل مأموریت':'فضای بیشتر برای کدنویسی'} onClick={toggleSidebar}>
        <FocusGlyph /><span data-focus-label="">{sidebarHidden?'نمایش مأموریت':'تمرکز'}</span>
      </button>
    </div>
  </div>;
}

function CodeInput({ actions, controls, hidden }: { actions: WorkspaceActions; controls: WorkspaceChannels['controls']; hidden:boolean }) {
  const state = useSyncExternalStore(controls.subscribe, controls.get);
  return <div className="lab-code-wrap" id="lab-editor-region" dir="ltr" lang="en" hidden={hidden}>
    <pre className="lab-lines" dir="ltr" aria-hidden="true" />
    <div className="lab-code">
      <pre data-highlight="" dir="ltr" aria-hidden="true" />
      <textarea id="lab-code" aria-label="کد Python" dir="ltr" lang="en" wrap="off" spellCheck={false} autoCapitalize="off"
        autoComplete="off" maxLength={20000} readOnly={state.busy} onInput={actions.input} onScroll={actions.scroll}
        onKeyDown={event => { if (!event.isDefaultPrevented()) actions.keydown(event.nativeEvent); }} />
    </div>
  </div>;
}

function ConsoleOutput({ output }: { output: WorkspaceChannels['output'] }) {
  const value = useSyncExternalStore(output.subscribe, output.get);
  const element = useRef<HTMLPreElement>(null);
  const follow = useRef(true);
  useLayoutEffect(() => {
    const pre = element.current;
    if (!pre) return;
    if (!value) follow.current = true;
    if (follow.current) pre.scrollTop = pre.scrollHeight;
  }, [value]);
  return <pre ref={element} className="lab-output" data-output="" dir="ltr" tabIndex={0} aria-label="خروجی Python"
    onScroll={event => {
      const pre = event.currentTarget;
      follow.current = pre.scrollHeight - pre.clientHeight - pre.scrollTop < 12;
    }}>{value}</pre>;
}

function LabConsole({ actions, controls, output, allowCommand, mode, toggleConsole, toggleConsoleFocus }: {
  actions: WorkspaceActions; controls: WorkspaceChannels['controls']; output: WorkspaceChannels['output']; allowCommand: boolean;
  mode: LayoutState['consoleMode']; toggleConsole(): void; toggleConsoleFocus(): void;
}) {
  const collapsed=mode==='collapsed', focused=mode==='focus';
  const consoleLabel=collapsed?'نمایش خروجی':'جمع کردن خروجی';
  const focusLabel=focused?'بازگرداندن اندازهٔ خروجی':'بزرگ‌کردن خروجی';
  const state = useSyncExternalStore(controls.subscribe, controls.get);
  const [open,setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const focusInput = useRef(false);
  useLayoutEffect(() => {
    if (open && focusInput.current) {
      if (state.canConsole) input.current?.focus({preventScroll:true});
      focusInput.current = false;
    }
  }, [open,state.canConsole]);
  function closeCommand() {
    setOpen(false);
    toggle.current?.focus({preventScroll:true});
  }
  return <section className="lab-console" aria-label="کنسول Python" dir="rtl">
    <div className="lab-console-head" dir="rtl">
      <span className="lab-console-title" lang="fa">خروجی</span>
      <div className="lab-console-actions">
        <button ref={toggle} data-repl-toggle="" className="lab-repl-toggle" type="button" aria-label="دستور تک‌خطی Python"
          title="دستور تک‌خطی Python" aria-expanded={open} aria-controls="lab-repl-form" hidden={!allowCommand}
          onClick={() => { if (!open) focusInput.current = true;setOpen(!open); }}>
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m4 6 4 4-4 4m6 0h6" /></svg>
        </button>
        <details className="lab-console-tools">
          <summary aria-label="ابزارهای خروجی" title="ابزارهای خروجی"><MenuGlyph vertical /></summary>
          <div className="lab-console-menu">
            <button data-clear="" type="button" onClick={actions.clear}>پاک‌کردن خروجی</button>
          </div>
        </details>
        <button data-console-toggle="" className="lab-console-toggle" type="button" aria-expanded={!collapsed}
          aria-controls="lab-console-body" aria-label={consoleLabel} title={consoleLabel} onClick={toggleConsole}>
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 12 5-5 5 5" /></svg>
        </button>
        <button data-output-focus="" className="lab-output-focus" type="button" aria-pressed={focused}
          aria-label={focusLabel} title={focusLabel} onClick={toggleConsoleFocus}>
          <FocusGlyph />
        </button>
      </div>
    </div>
    <div className="lab-console-body" data-console-body="" id="lab-console-body" hidden={collapsed}>
      <ConsoleOutput output={output} />
      <form className="lab-console-form" id="lab-repl-form" dir="ltr" hidden={!open}
        onSubmit={event => { event.preventDefault();actions.command(); }}
        onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault();event.stopPropagation();closeCommand(); } }}>
        <label htmlFor="lab-command" aria-hidden="true">&gt;&gt;&gt;</label>
        <input ref={input} id="lab-command" aria-label="دستور تک‌خطی Python" placeholder="X.shape" dir="ltr" lang="en" autoComplete="off"
          spellCheck={false} maxLength={2000} disabled={!state.canConsole} />
        <button type="submit" dir="rtl" disabled={!state.canConsole}>اجرا</button>
      </form>
    </div>
  </section>;
}

function RuntimeStatus({ controls }: { controls: WorkspaceChannels['controls'] }) {
  const state = useSyncExternalStore(controls.subscribe, controls.get);
  return <p className="lab-runtime" data-runtime="" role="status" aria-live="polite"
    hidden={!state.message || (!state.busy && !state.error)}>{state.message}</p>;
}

export function Workspace({ options, actions, channels, layout }: {
  options: WorkspaceOptions; actions: WorkspaceActions; channels: WorkspaceChannels; layout: LayoutControls;
}) {
  const state=useSyncExternalStore(layout.layout.subscribe,layout.layout.get);
  const splitter=useSplitter({
    axis:'row',share:state.editorShare,disabled:state.consoleMode!=='normal',
    change:(value,remember)=>flushSync(()=>layout.layout.changeShare('row',value,remember)),
    save:()=>layout.layout.save('row'),
  });
  const style={'--editor-share':splitter.ratio+'fr','--console-share':100-splitter.ratio+'fr'} as CSSProperties;
  return <>
    <Toolbar options={options} actions={actions} controls={channels.controls} save={channels.save}
      sidebarHidden={state.sidebarHidden} toggleSidebar={layout.toggleSidebar} />
    <div ref={splitter.container} data-split="" style={style}
      className={'lab-split-area'+(state.consoleMode==='collapsed'?' is-console-collapsed':state.consoleMode==='focus'?' is-console-focused':'')+
        (splitter.dragging?' is-resizing':'')}>
      <CodeInput actions={actions} controls={channels.controls} hidden={state.consoleMode==='focus'} />
      <div className="lab-resizer" data-resizer="" role="separator" aria-label="تغییر اندازهٔ ویرایشگر و خروجی"
        aria-orientation="horizontal" aria-controls="lab-editor-region lab-console-body"
        title="برای تغییر اندازه بکش؛ یا از کلیدهای بالا و پایین استفاده کن" {...splitter.handle}><span aria-hidden="true" /></div>
      <LabConsole actions={actions} controls={channels.controls} output={channels.output} allowCommand={options.mode !== 'readonly-preview'}
        mode={state.consoleMode} toggleConsole={layout.toggleConsole} toggleConsoleFocus={layout.toggleConsoleFocus} />
    </div>
    <RuntimeStatus controls={channels.controls} />
    <div data-react-lab-award="" style={{ display:'contents' }} />
  </>;
}
