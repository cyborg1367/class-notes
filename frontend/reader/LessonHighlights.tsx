import type { HeroContent } from './contracts';
import styles from './LessonHighlights.module.css';

export function LessonHighlights({ items }: { items: HeroContent['highlights'] }) {
  return <div className="shell"><ol className={'hero-strip ' + styles.strip} aria-label="سه نکتهٔ اصلی یادداشت" data-lesson-highlights="">
    {items.map(({ number, label }) => <li key={number}>
      <span className={'strip-number ' + styles.number} dir="ltr" aria-hidden="true">{number}</span>
      <span className="strip-text">{label}</span>
    </li>)}
  </ol></div>;
}
