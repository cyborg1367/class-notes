import { useEffect, useRef } from 'react';
import type { Heading } from './contracts';
import { Contents } from './ReaderControls';

export function ReadingProgress({ percent }: { percent: number }) {
  return <div className="reader-progress">
    <div className="reader-progress-label"><span>پیشرفت مطالعه</span><bdi>{percent.toLocaleString('fa-IR')}٪</bdi></div>
    <progress value={percent} max={100} aria-label="پیشرفت مطالعه" />
  </div>;
}

type Props = { percent: number; headings: Heading[]; active: string; doc: Document };
export function LessonSidebar({ fact, ...props }: Props & { fact: string }) {
  const contents = useRef<HTMLElement>(null);
  const { active, doc } = props;
  useEffect(() => {
    const scroller = contents.current;
    if (!scroller || scroller.clientHeight >= scroller.scrollHeight) return;
    const current = scroller.querySelector('[aria-current="location"]');
    if (!current || (scroller.contains(doc.activeElement) && current !== doc.activeElement)) return;
    const target = current.getBoundingClientRect(), frame = scroller.getBoundingClientRect();
    if (target.top < frame.top + 4) scroller.scrollTop += target.top - frame.top - 4;
    else if (target.bottom > frame.bottom - 4) scroller.scrollTop += target.bottom - frame.bottom + 4;
  }, [active, doc]);

  return <aside className="lesson-rail reader-sidebar" aria-label="مسیر این یادداشت" data-lesson-sidebar="">
    <ReadingProgress percent={props.percent} />
    {props.headings.length > 0 && <nav ref={contents} aria-label="فهرست بخش‌های درس">
      <p className="rail-title">در این یادداشت</p>
      <ol className="reader-rail-list"><Contents {...props} rail /></ol>
    </nav>}
    {fact && <div className="rail-fact" dangerouslySetInnerHTML={{ __html: fact }} />}
  </aside>;
}

export function MobileLessonOutline(props: Props) {
  return <div className="reader-mobile-outline">
    <ReadingProgress percent={props.percent} />
    {props.headings.length > 0 && <details>
      <summary>فهرست بخش‌های درس</summary>
      <nav className="reader-mobile-toc" aria-label="فهرست بخش‌های درس"><Contents {...props} rail={false} /></nav>
    </details>}
  </div>;
}

// Compatibility targets for private widget scripts that still initialize
// alongside the new reader. They never appear as duplicate navigation.
export function LegacyReaderHooks() {
  return <div hidden aria-hidden="true">
    <div id="reading-progress" />
    <ol className="rail-list" />
    <nav className="mobile-toc" />
    <div className="reading-state"><span id="reading-label" /><div><i id="sidebar-progress" /></div></div>
  </div>;
}
