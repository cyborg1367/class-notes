import { memo, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import type { LessonPayload, PreparedLesson, ReaderOptions } from './contracts';
import { CopyCode, PrivateDownload } from './ReaderControls';
import { LessonTemplate } from './LessonTemplate';
import { LegacyReaderHooks } from './LessonOutline';
import { useReaderNavigation } from './navigation';
import { isCourseObject } from './paths';
import type { ReaderResources } from './resources';


function InlineControls({ scope, lesson, files, preview }: {
  scope: HTMLElement; lesson: PreparedLesson; files: ReaderResources; preview?: boolean;
}) {
  const targets = useMemo(() => new Map(Array.from(scope.querySelectorAll('[data-reader-slot]'),
    node => [node.getAttribute('data-reader-slot'), node])), [scope]);
  return <>{lesson.slots.map(slot => {
    const target = targets.get(slot.key);
    if (!target) return null;
    const control = slot.kind === 'copy' ? <CopyCode label={slot.label} text={slot.text} />
      : <PrivateDownload {...slot} files={files} preview={preview} />;
    return createPortal(control, target, slot.key);
  })}</>;
}

export const ReaderDocument = memo(function ReaderDocument({ lesson, payload, options, files, doc }: {
  lesson: PreparedLesson; payload: LessonPayload; options: ReaderOptions; files: ReaderResources; doc: Document;
}) {
  const [scope, setScope] = useState<HTMLDivElement | null>(null);
  const [widgetError, setWidgetError] = useState(false);
  const { active, percent } = useReaderNavigation(scope, lesson.headings);
  const outline = { headings: lesson.headings, active, percent, doc };
  useEffect(() => {
    if (!scope || !files.alive()) return;
    let live = true;
    const active = () => live && files.alive();
    for (const image of scope.querySelectorAll<HTMLImageElement>('img[data-private-path]')) {
      const path = image.dataset.privatePath!;
      if (options.preview) continue;
      void files.load(path).then(url => {
        if (active() && image.isConnected) image.src = url;
      }).catch(() => {
        if (active() && image.isConnected) image.alt += ' — تصویر دریافت نشد؛ صفحه را دوباره باز کن.';
      });
    }
    options.onRead(scope);
    options.refreshMotion?.(scope);
    void (async () => {
      try { await options.enhance(scope); }
      catch { if (active()) setWidgetError(true); }
      const scripts = Array.isArray(payload.scripts) ? payload.scripts : [];
      for (const path of scripts) {
        if (!active()) return;
        if (!isCourseObject(path, options.info.course.id, ['.js'])) continue;
        try {
          const url = await files.load(path);
          if (active()) await options.loadScript(url);
        } catch { if (active()) setWidgetError(true); }
      }
      if (active()) { options.onWidgetsReady?.(); options.refreshMotion?.(scope); }
    })();
    return () => { live = false; options.clearMotion?.(); };
  }, [files, options, payload, scope]);
  return <>
    {widgetError && <p className="shell reader-widget-note" role="status">بعضی ابزارهای تعاملی بارگذاری نشدند. متن یادداشت در دسترس است.</p>}
    <div ref={setScope} data-reader-document="" data-reader-template="" data-lesson-template-version="1" data-lesson-document-id={options.info.id}>
      <LegacyReaderHooks />
      <div id="reader-reading-progress" aria-hidden="true" style={{ transform: 'scaleX(' + percent / 100 + ')' }} />
      <LessonTemplate lesson={lesson} info={options.info} href={options.href} outline={outline} files={files} preview={options.preview} />
    </div>
    {scope && <InlineControls scope={scope} lesson={lesson} files={files} preview={options.preview} />}
  </>;
});
