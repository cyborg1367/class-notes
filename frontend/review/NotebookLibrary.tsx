import { memo, useRef } from 'react';
import { latestReviewWriting, reviewEntries, reviewSessionEntries } from '../../web/assets/review.mjs';
import type { Entry, Lesson, ReviewView, Tab } from './contracts';
import type { ReviewController } from './controller';
import { Action, fa, Icon, ReviewArt, shortDate } from './Presentation';

type Props = Pick<ReviewView, 'notebook' | 'filters' | 'busy'> & { controller: ReviewController; lessons: Lesson[]; dashboard: string };
const sourceLabel: Record<string, string> = { quiz: 'از آزمون', lab: 'از لابراتور', manual: 'انتخاب خودت' };

function EntryCard({ entry, index, lessonTitle, description, busy, controller }: {
  entry: Entry; index: number; lessonTitle?: string; description?: string; busy: boolean; controller: ReviewController;
}) {
  return <article className="rv-entry">
    <button type="button" className="rv-entry-open" data-open={entry.id} disabled={busy} onClick={() => controller.openEntry(entry.id)}>
      <span className="rv-entry-number" dir="ltr">{String(index + 1).padStart(2, '0')}</span>
      <span>
        <strong>{entry.title}</strong>
        <small>{lessonTitle || 'یادداشت شخصی'} · {sourceLabel[entry.source?.kind ?? 'manual'] ?? sourceLabel.manual}</small>
        <span className="rv-entry-description">{description || entry.note.slice(0, 100) || 'یادداشتی با زبان خودت.'}</span>
        {entry.paused && <small>مرور این موضوع متوقف است؛ نوشته‌ها حفظ شده‌اند.</small>}
        {entry.concept_id && !entry.due && !entry.paused && entry.next_due && <small>مرور بعدی: {shortDate(entry.next_due)}</small>}
      </span>
      <span className="rv-open-arrow"><Icon name="arrow" /></span>
    </button>
    <button type="button" className="rv-note-shortcut" aria-label={'یادداشت شخصی دربارهٔ ' + entry.title}
      data-edit-note={entry.id} disabled={busy} onClick={() => controller.openNote(entry.id)}><Icon name="pencil" /></button>
    <button type="button" className="rv-bookmark" aria-label={'نشان‌گذاری ' + entry.title}
      aria-pressed={entry.bookmarked} data-bookmark={entry.id} disabled={busy}
      onClick={() => void controller.bookmark(entry.id)}><Icon name="bookmark" /></button>
  </article>;
}

export const NotebookLibrary = memo(function NotebookLibrary({ notebook, filters, busy, controller, lessons, dashboard }: Props) {
  const { entries, concepts } = notebook;
  const due = entries.filter(entry => entry.due).length;
  const count = reviewSessionEntries(notebook).length;
  const latest = latestReviewWriting(entries);
  const shown = reviewEntries(notebook, filters);
  const byId = new Map(concepts.map(item => [item.id, item]));
  const lessonTitles = new Map(lessons.map(item => [item.id, item.title]));
  const tabs: { id: Tab; label: string }[] = [
    { id: 'due', label: 'برای امروز ' + fa(due) }, { id: 'all', label: 'همه' },
    { id: 'bookmarked', label: 'نشان‌شده‌ها ' + fa(entries.filter(entry => entry.bookmarked).length) },
  ];
  const listHeading = useRef<HTMLHeadingElement>(null);
  return <>
    <header className="rv-heading">
      <div><nav aria-label="مسیر صفحه"><a href={dashboard}>داشبورد</a><span aria-hidden="true">/</span><span>دفتر مرور</span></nav>
        <h1>دفتر مرور شخصی</h1><p>هر بار مرور، فرصتی برای فهمیدنِ بهتر.</p></div>
      <Action data-new="" disabled={busy} onClick={() => controller.openNote()}><Icon name="plus" /> یادداشت تازه</Action>
    </header>
    <section className="rv-hero" aria-labelledby="rv-today-title">
      <div className="rv-hero-copy"><p className="rv-eyebrow"><span />پیشنهاد امروز</p>
        <h2 id="rv-today-title">کمی مرور، یک قدم جلوتر.</h2>
        <p>{due ? 'به تجربهٔ قبلی برگرد، نکته را مرور کن و دوباره امتحان کن.'
          : entries.length ? 'در حال حاضر موضوعی برای مرور زمان‌بندی‌شده آماده نیست.' : 'اولین موضوع را انتخاب کن و دفتر خودت را بساز.'}</p>
        <ReviewArt />
      </div>
      <div className="rv-hero-action">
        <h3>{due ? fa(count) + ' موضوع در این مرور' : entries.length ? 'مرور آماده‌ای نداری' : 'از یک موضوع شروع کن'}</h3>
        <p><Icon name="clock" />{due ? 'حدود ' + fa(count * 3) + ' دقیقه' : 'با ریتم خودت پیش برو'}</p>
        <Action tone="primary" icon="arrow" data-start="" disabled={busy}
          onClick={() => { controller.startSession(); if (!due && entries.length) listHeading.current?.focus(); }}>
          {due ? 'شروع مرور' : entries.length ? 'دیدن موضوعات' : 'افزودن اولین موضوع'}
        </Action>
        <small>{due > count ? fa(due) + ' موضوع آماده است؛ در این نوبت فقط ' + fa(count) + ' موضوع را مرور می‌کنیم.'
          : due ? 'هر بار، روی یک موضوع تمرکز می‌کنیم.' : 'موضوعات و یادداشت‌ها در حساب تو ذخیره می‌شوند.'}</small>
      </div>
    </section>
    <div className="rv-columns">
      <section className="rv-library" aria-labelledby="rv-topics-title">
        <div className="rv-library-head">
          <div><h2 id="rv-topics-title" ref={listHeading} tabIndex={-1}>موضوعات دفتر</h2><span>{fa(entries.length)} موضوع</span></div>
          <label className="rv-search"><Icon name="search" /><input type="search" data-search=""
            placeholder="جست‌وجوی موضوع…" aria-label="جست‌وجو در موضوع و یادداشت" value={filters.search}
            onChange={event => controller.setFilters({ search: event.target.value })} /></label>
        </div>
        <div className="rv-filters">
          <div role="group" aria-label="وضعیت مرور">{tabs.map(tab => <button type="button" data-tab={tab.id}
            key={tab.id} aria-pressed={filters.tab === tab.id} onClick={() => controller.setFilters({ tab: tab.id })}>{tab.label}</button>)}</div>
          <label className="rv-lesson-filter"><span className="sr-only">فیلتر یادداشت</span>
            <select data-lesson="" value={filters.lesson} onChange={event => controller.setFilters({ lesson: event.target.value })}>
              <option value="">همهٔ یادداشت‌ها</option>{lessons.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}
            </select>
          </label>
        </div>
        <div data-review-list="">
          {shown.length ? shown.map((entry, index) => {
            const concept = entry.concept_id ? byId.get(entry.concept_id) : undefined;
            return <EntryCard key={entry.id} entry={entry} index={index} busy={busy} controller={controller}
              lessonTitle={concept ? lessonTitles.get(concept.lesson_id) || 'یادداشت مرتبط' : undefined} description={concept?.description} />;
          }) : <div className="rv-empty">
            <h3>{filters.search || filters.lesson ? 'موضوعی با این فیلتر پیدا نشد.' : filters.tab === 'due'
              ? 'مرور آماده‌ای باقی نمانده است.' : filters.tab === 'bookmarked' ? 'هنوز موضوعی نشان نکرده‌ای.' : 'دفترت هنوز خالی است.'}</h3>
            <p>{filters.tab === 'due' ? 'می‌توانی از «همه» موضوعات قبلی را ببینی یا موضوع تازه‌ای اضافه کنی.' : 'یک موضوع انتخاب کن یا یادداشت شخصی خودت را بنویس.'}</p>
            <Action tone="text-link" icon="plus" disabled={busy} onClick={() => controller.openNote()}>افزودن موضوع</Action>
          </div>}
        </div>
      </section>
      <aside className="rv-side">
        <section className="rv-note-paper">
          <p className="rv-note-kicker">با زبان خودم <Icon name="pencil" /></p>
          <h2>{latest ? latest.isReflection ? 'آخرین برداشت من' : 'آخرین یادداشت من' : 'یادداشتی برای خودت'}</h2>
          {latest && <h3>{latest.title}</h3>}
          <p className="rv-note-preview">{latest
            ? latest.note.slice(0, 240) + (latest.note.length > 240 ? '…' : '')
            : 'چیزی را که تازه فهمیده‌ای، با زبان خودت بنویس؛ حتی در یک جمله.'}</p>
          <div className="rv-writing-lines" aria-hidden="true" />
          <Action tone="text-link" icon="arrow" disabled={busy}
            onClick={() => latest?.isReflection ? controller.openEntry(latest.id) : controller.openNote(latest?.id)}>
            {latest ? latest.isReflection ? 'مشاهدهٔ موضوع' : 'ویرایش یادداشت' : 'نوشتن اولین یادداشت'}
          </Action>
        </section>
        <p className="rv-private"><Icon name="lock" />یادداشت‌ها فقط برای خودت هستند.</p>
      </aside>
    </div>
  </>;
});
