import { createRoot } from 'react-dom/client';
import { ExamCatalog } from './ExamCatalog';
import { ExamRunner, type ExamRunnerHandle } from './ExamRunner';
import type { ExamRunnerProps, ExamSummary } from './contracts';

export function mountExamCatalog(host: HTMLElement, options: { exams: ExamSummary[]; examURL: (id: string) => string }) {
  if (!Array.isArray(options.exams)) throw Error('EXAM_CATALOG_INVALID');
  const root = createRoot(host, { identifierPrefix: 'exam-catalog-' });
  root.render(<ExamCatalog exams={options.exams} examURL={options.examURL} />);
  return { dispose() { root.unmount(); } };
}

export function mountExamRunner(host: HTMLElement, options: ExamRunnerProps) {
  const handle: { current: ExamRunnerHandle | null } = { current: null };
  const root = createRoot(host, { identifierPrefix: 'exam-runner-' });
  root.render(<ExamRunner ref={value => { handle.current = value; }} {...options} />);
  return {
    prepareSignOut: () => handle.current?.prepareSignOut() ?? Promise.resolve({ saved: true }),
    dispose() { handle.current = null; root.unmount(); },
  };
}
