import { createRoot } from 'react-dom/client';
import { QuizResult, type QuizResultProps } from './QuizResult';

export function mountQuizResult(host: HTMLElement, view: QuizResultProps, onError?: () => void) {
  const root = createRoot(host, { identifierPrefix: 'quiz-result-', onUncaughtError: onError });
  root.render(<QuizResult {...view} />);
  return { dispose: () => root.unmount() };
}
