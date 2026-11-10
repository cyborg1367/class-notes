import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { createTutorController, type TutorOptions } from './controller';
import { TutorPanel } from './TutorPanel';

type MountOptions = TutorOptions & { host: HTMLElement; opener?: HTMLElement | null; onClose(): void };
export function mountTutor(root: HTMLElement, options: MountOptions) {
  const controller = createTutorController(options);
  const view = createRoot(options.host,{ identifierPrefix:'lab-tutor-' });
  let returnPoint: { start:number; end:number; top:number; left:number } | null = null;
  let disposed = false;
  const editor = () => root.querySelector<HTMLTextAreaElement>('#lab-code');
  function close(restore = true) {
    const wasOpen = controller.close();
    if (!wasOpen || !restore || !options.isCurrent()) return;
    options.onClose();
    options.opener?.focus({ preventScroll:true });
    const field = editor();
    if (field && returnPoint) {
      field.setSelectionRange(returnPoint.start,returnPoint.end);
      field.scrollTop = returnPoint.top;
      field.scrollLeft = returnPoint.left;
    }
  }
  flushSync(() => view.render(<TutorPanel controller={controller} onClose={()=>close()} />));
  return {
    open({ focus = true }: { focus?: boolean } = {}) {
      if (disposed || !options.isCurrent()) return;
      if (!controller.get().open) {
        const field = editor();
        returnPoint = field ? { start:field.selectionStart,end:field.selectionEnd,top:field.scrollTop,left:field.scrollLeft } : null;
      }
      flushSync(()=>controller.open());
      if (focus) options.host.querySelector<HTMLElement>('#lab-tutor-question')?.focus({ preventScroll:true });
    },
    setStage: controller.setStage,
    close,
    dispose() {
      if (disposed) return;
      disposed = true;controller.dispose();view.unmount();
    },
  };
}
