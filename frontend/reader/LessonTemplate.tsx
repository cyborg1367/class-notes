import type { Heading, LessonInfo, PreparedLesson, ReaderOptions } from './contracts';
import type { ReaderResources } from './resources';
import { LessonHero } from './LessonHero';
import { LessonLayout } from './LessonLayout';
import { LessonContent } from './LessonContent';
import { LessonSidebar, MobileLessonOutline } from './LessonOutline';
import { LessonPager, LessonResources, LessonFooter } from './LessonEnd';
import { localFragment } from './paths';
import './LessonTemplate.module.css';

type Outline = { headings: Heading[]; active: string; percent: number; doc: Document };
/** The one lesson wireframe. Features compose here; content cannot reorder it. */
export function LessonTemplate({ lesson, info, href, outline, files, preview }: {
  lesson: PreparedLesson; info: LessonInfo; href: ReaderOptions['href']; outline: Outline;
  files: ReaderResources; preview?: boolean;
}) {
  const first = lesson.headings.find(({ id }) => id !== lesson.resources.id);
  const start = first ? localFragment('#' + encodeURIComponent(first.id), outline.doc) : undefined;
  return <>
    <LessonHero hero={lesson.hero} title={info.title} start={start} />
    <LessonLayout sidebar={<LessonSidebar {...outline} fact={lesson.fact} />}>
      <MobileLessonOutline {...outline} />
      <LessonContent nodes={lesson.document} />
      <LessonPager info={info} href={href} />
      <LessonResources info={info} href={href} data={lesson.resources} files={files} preview={preview} />
      <LessonFooter info={info} href={href} />
    </LessonLayout>
  </>;
}
