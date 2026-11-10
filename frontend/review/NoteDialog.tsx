import { useEffect, useRef } from 'react';
import { reviewReference } from '../../web/assets/review.mjs';
import type { Editor, Notebook, ReviewOptions } from './contracts';
import type { ReviewController } from './controller';
import { Action, fa, Icon, shortDate } from './Presentation';

export function NoteDialog({ editor, notebook, busy, controller, url }: {
  editor: Editor; notebook: Notebook; busy: boolean; controller: ReviewController; url: ReviewOptions['url'];
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const trigger = dialog.ownerDocument.activeElement;
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    dialog.querySelector<HTMLElement>('[data-note-title]:not([readonly]),textarea')?.focus();
    return () => {
      if (dialog.open && typeof dialog.close === 'function') dialog.close();
      const doc = dialog.ownerDocument;
      doc.defaultView?.requestAnimationFrame(() => {
        if (trigger instanceof HTMLElement && trigger.isConnected && doc.activeElement === doc.body) trigger.focus();
      });
    };
  }, []);

  const { entry } = editor;
  const concept = notebook.concepts.find(item => item.id === entry?.concept_id);
  const reference = reviewReference(concept, url);
  const existing = !entry && editor.concept ? notebook.entries.find(item => item.concept_id === editor.concept) : undefined;
  return <dialog ref={ref} className="rv-dialog" aria-labelledby="rv-dialog-title"
    onCancel={event => { event.preventDefault(); controller.closeEditor(); }}>
    <header className="rv-dialog-head">
      <h2 id="rv-dialog-title">{entry ? 'موضوع و یادداشت من' : 'یادداشت تازه'}</h2>
      <button className="rv-icon" type="button" aria-label="بستن" data-close="" disabled={busy} onClick={controller.closeEditor}><Icon name="close" /></button>
    </header>
    <form data-note-form="" onSubmit={event => { event.preventDefault(); void controller.saveNote(); }}>
      <fieldset className="rv-editor-fields" disabled={busy}>
        {!entry && <label>موضوع مرتبط<select data-note-concept="" value={editor.concept}
          onChange={event => controller.edit({ concept: event.target.value })}>
          <option value="">یادداشت آزاد</option>{notebook.concepts.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}
        </select></label>}
        <label>عنوان<input data-note-title="" maxLength={160} required
          readOnly={Boolean(entry?.concept_id || editor.concept)} value={editor.title}
          onChange={event => controller.edit({ title: event.target.value })} /></label>
        {entry?.source?.description && <p className="rv-context">{entry.source.description}</p>}
        {editor.recovered && <p className="rv-draft-notice">پیش‌نویس ذخیره‌نشدهٔ همین مرورگر بازیابی شد.</p>}
        <label>با زبان خودم<textarea data-note-body="" maxLength={4000} rows={5} value={editor.note}
          placeholder="چه چیزی را بهتر فهمیدم؟ دفعهٔ بعد به چه نکته‌ای دقت کنم؟"
          onChange={event => controller.edit({ note: event.target.value })} /></label>
      </fieldset>
      {existing && <p className="rv-dialog-status">این موضوع از قبل در دفترت هست. <Action tone="text-link" disabled={busy}
        onClick={() => controller.openNote(existing.id)}>بازکردن موضوع موجود ←</Action></p>}
      <p className="rv-dialog-status" role="status" data-note-status="">{editor.message}</p>
      {editor.conflict && <Action data-compare="" disabled={busy} onClick={() => void controller.compareNote()}>دریافت نسخهٔ حساب برای مقایسه</Action>}
      {editor.remote !== undefined && <details open><summary>متن ذخیره‌شدهٔ حساب</summary><p className="rv-preserve">{editor.remote || 'خالی'}</p></details>}
      <div className="rv-dialog-actions">
        <Action tone="primary" type="submit" disabled={busy || Boolean(existing)}>ذخیرهٔ یادداشت</Action>
        {entry?.concept_id && <Action data-practice="" disabled={busy} onClick={() => void controller.reviewFromEditor()}>مرور این موضوع</Action>}
        {reference && <a className="rv-text-link" href={reference}>{concept?.review_anchor ? 'مرور بخش مرتبط' : 'بازکردن یادداشت مرتبط'} <Icon name="arrow" /></a>}
      </div>
    </form>
    {Boolean(entry?.history?.length) && <details className="rv-history">
      <summary>سابقهٔ مرور · {fa(entry?.history?.length ?? 0)} مرور اخیر</summary>
      <ul>{entry?.history?.map((item, index) => <li key={item.at ?? index}>
        <time dateTime={item.at}>{shortDate(item.at)}</time>
        <span>{!item.correct ? 'نیازمند مرور دوباره' : item.hint_used ? 'پاسخ درست با راهنما'
          : item.preparation_used ? 'پاسخ درست پس از بازخوانی' : item.preparation_used === false ? 'پاسخ درست بدون بازخوانی' : 'پاسخ درست'}</span>
        {item.reflection && <p className="rv-history-reflection">{item.reflection}</p>}
      </li>)}</ul>
    </details>}
  </dialog>;
}
