import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { LabStory } from './LabStory';
import { LabFeedback } from './LabFeedback';
import type { FeedbackModel, IntroModel } from './contracts';

export function mountLabPresentation(intro: HTMLElement, feedback: HTMLDialogElement) {
  const introRoot = createRoot(intro, { identifierPrefix: 'lab-intro-' });
  const feedbackRoot = createRoot(feedback, { identifierPrefix: 'lab-feedback-' });
  let revision = 0;
  return {
    // The lab controller focuses the committed heading immediately after showing each view.
    showIntro(model: IntroModel, onEnter: () => void) {
      flushSync(() => introRoot.render(<LabStory model={model} onEnter={onEnter} />));
    },
    showFeedback(model: FeedbackModel, onClose: () => void) {
      flushSync(() => feedbackRoot.render(<LabFeedback key={++revision} model={model} onClose={onClose} />));
    },
    dispose() { feedbackRoot.unmount();introRoot.unmount(); },
  };
}
