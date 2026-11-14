import type { ReactNode } from 'react';
import styles from './LessonTemplate.module.css';

export function LessonLayout({ sidebar, children }: { sidebar: ReactNode; children: ReactNode }) {
  return <div className={'shell lesson-shell ' + styles.frame} data-lesson-layout="">
    {sidebar}
    <article className={'lesson-body ' + styles.body}>{children}</article>
  </div>;
}
