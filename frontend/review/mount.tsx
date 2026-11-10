import { useSyncExternalStore } from 'react';
import { createRoot } from 'react-dom/client';
import type { ReviewOptions } from './contracts';
import { createReviewController, type ReviewController } from './controller';
import { NotebookLibrary } from './NotebookLibrary';
import { NoteDialog } from './NoteDialog';
import { Action } from './Presentation';
import { ReviewPractice } from './ReviewPractice';

type Inputs = Omit<ReviewOptions, 'initialURL' | 'updateURL' | 'onProgress' | 'requestId'>;
function ReviewNotebook({ controller, options }: { controller: ReviewController; options: Inputs }) {
  const view = useSyncExternalStore(controller.subscribe, controller.getSnapshot);
  return <div data-review-view="" aria-busy={view.busy || view.phase === 'loading'}>
    {view.phase === 'ready' ? (view.practice
      ? <ReviewPractice practice={view.practice} busy={view.busy} controller={controller} lessons={options.lessons} url={options.url} />
      : <NotebookLibrary notebook={view.notebook} filters={view.filters} busy={view.busy} controller={controller}
        lessons={options.lessons} dashboard={options.url('dashboard/')} />)
      : view.phase === 'error' ? <section className="rv-empty">
        <h1>دفتر مرور دریافت نشد.</h1><Action data-retry="" onClick={() => void controller.load()}>تلاش دوباره</Action>
      </section> : <p className="rv-status" role="status">در حال دریافت دفتر مرور…</p>}
    <p className="rv-status" data-review-status="" data-error={view.error} role="status">{view.notice}</p>
    {view.editor && <NoteDialog editor={view.editor} notebook={view.notebook} busy={view.busy} controller={controller} url={options.url} />}
  </div>;
}

export function mountReviewNotebook(host: HTMLElement, options: Inputs) {
  const doc = host.ownerDocument, win = doc.defaultView;
  if (!win) throw Error('REVIEW_WINDOW_UNAVAILABLE');
  const controller = createReviewController({
    ...options, initialURL: win.location.href, isCurrent: () => options.isCurrent() && host.isConnected,
    updateURL(entry, step = 'reason') {
      try {
        const url = new URL(win.location.href);
        if (entry) { url.searchParams.set('practice', entry); url.searchParams.set('step', step); }
        else { url.searchParams.delete('practice'); url.searchParams.delete('step'); }
        win.history.replaceState(win.history.state, '', url.href);
      } catch { /* Changing the address is optional. */ }
    },
    onProgress: () => doc.dispatchEvent(new win.CustomEvent('classroom-progress-changed')),
    requestId: () => win.crypto.randomUUID(),
  });
  const root = createRoot(host, { identifierPrefix: 'review-' });
  const persist = () => { controller.persist(); };
  root.render(<ReviewNotebook controller={controller} options={options} />);
  win.addEventListener('pagehide', persist);
  return {
    load: controller.load, prepareSignOut: controller.prepareSignOut,
    dispose() {
      win.removeEventListener('pagehide', persist);
      controller.dispose();
      root.unmount();
    },
  };
}
