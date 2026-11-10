import { createRoot } from 'react-dom/client';
import { QuizForm } from './QuizForm';
import { createQuizController } from './controller';
import type { QuizOptions } from './contracts';

export function mountQuizForm(host: HTMLElement, options: QuizOptions) {
  if (!Array.isArray(options.quiz?.questions) || !options.quiz.questions.length) throw Error('QUIZ_UNAVAILABLE');
  const controller = createQuizController(options);
  const root = createRoot(host, { identifierPrefix: 'quiz-form-' });
  root.render(<QuizForm options={options} controller={controller} />);
  return {
    load: controller.load,
    prepareSignOut: controller.prepareSignOut,
    dispose() { controller.dispose(); root.unmount(); },
  };
}
