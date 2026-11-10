import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { MissionBrief, MissionHints, MissionPath, type MissionView } from './views';

export function mountLabMission(root: HTMLElement, actions: { choose(index: number): void; reveal(): void }) {
  const host = (name: string) => {
    const element = root.querySelector<HTMLElement>(name);
    if (!element) throw new Error('LAB_MISSION_MOUNT_POINT_MISSING');
    return element;
  };
  const header = host('.lab-mission-header');
  const measure = () => {
    const height = Math.ceil(header.getBoundingClientRect().height);
    if (height > 0) root.style.setProperty('--lab-measured-header', height + 'px');
  };
  const win = root.ownerDocument.defaultView;
  const observer = win?.ResizeObserver ? new win.ResizeObserver(measure) : null;
  observer?.observe(header);
  measure();
  const steps = createRoot(host('[data-react-mission-path]'), { identifierPrefix: 'lab-step-' });
  const brief = createRoot(host('[data-react-mission-brief]'), { identifierPrefix: 'lab-brief-' });
  const hints = createRoot(host('[data-react-mission-hints]'), { identifierPrefix: 'lab-hint-' });
  let last: MissionView | null = null;
  return {
    render(view: MissionView) {
      if (last && last.active === view.active && last.limit === view.limit && last.busy === view.busy &&
          last.revealed === view.revealed && last.completed.size === view.completed.size &&
          [...view.completed].every(id => last!.completed.has(id))) return;
      last = view;
      // The existing controller moves focus after navigation, so commit before returning.
      flushSync(() => {
        steps.render(<MissionPath view={view} onChoose={actions.choose} />);
        brief.render(<MissionBrief view={view} />);
        hints.render(<MissionHints view={view} onReveal={actions.reveal} />);
      });
    },
    dispose() {
      observer?.disconnect();
      root.style.removeProperty('--lab-measured-header');
      steps.unmount();brief.unmount();hints.unmount();
    },
  };
}

export { mountLabReference } from '../reference/mount';
