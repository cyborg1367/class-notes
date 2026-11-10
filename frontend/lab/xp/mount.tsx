import { createPortal, flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { normalizeProgress, normalizeReward, type LabProgress, type LabReward } from './model';
import { InlineReward, Progress, RewardDialog } from './views';

type Actions = { onDismiss(stage: number, advance: boolean): void };

export function mountLabXp(root: HTMLElement, actions: Actions) {
  const progressHost = root.querySelector<HTMLElement>('[data-react-lab-xp]');
  const awardHost = root.querySelector<HTMLElement>('[data-react-lab-award]');
  if (!progressHost || !awardHost) throw new Error('LAB_XP_MOUNT_POINT_MISSING');

  const view = createRoot(progressHost,{ identifierPrefix:'lab-xp-' });
  let progress: LabProgress | null = null;
  let reward: LabReward | null = null;
  let inline = false;
  let disposed = false;
  const overlayHost=root.querySelector<HTMLElement>('[data-lab-reward-slot]')||root;
  const dialog = () => overlayHost.querySelector<HTMLDialogElement>('[data-celebration]');
  const render = () => flushSync(()=>view.render(<>
    {progress && <Progress progress={progress} />}
    {createPortal(<InlineReward reward={inline?reward:null} />,awardHost)}
    {reward && !inline && createPortal(<RewardDialog reward={reward} onDismiss={dismiss} />,overlayHost)}
  </>));

  function clear() {
    if (disposed || !reward) return;
    const element = dialog();
    reward = null;
    inline = false;
    if (element?.open && typeof element.close === 'function') element.close();
    render();
  }
  function dismiss(advance: boolean) {
    if (!reward || disposed) return;
    const { stage } = reward;
    clear();
    actions.onDismiss(stage,advance);
  }

  return {
    update(next: LabProgress) {
      if (disposed) return;
      const value = normalizeProgress(next);
      if (progress && progress.xp===value.xp && progress.maximum===value.maximum &&
          progress.completed===value.completed && progress.total===value.total) return;
      progress = value;
      render();
    },
    show(next: LabReward) {
      if (disposed) return false;
      const value = normalizeReward(next);
      if (!value) return false;
      clear();
      reward = value;
      render();
      const element = dialog();
      try {
        if (typeof element?.showModal !== 'function' || typeof element.close !== 'function') throw new Error('DIALOG_UNAVAILABLE');
        element.showModal();
        element.querySelector<HTMLElement>('[data-celebration-continue]')?.focus({ preventScroll:true });
      } catch {
        if (element?.open && typeof element.close === 'function') element.close();
        inline = true;
        render();
      }
      return true;
    },
    clear,
    dispose() {
      if (disposed) return;
      const element = dialog();
      disposed = true;
      reward = null;
      if (element?.open && typeof element.close === 'function') element.close();
      view.unmount();
    },
  };
}
