import { useCallback, useEffect, useState } from 'react';
import { ExamQuestionVisual } from '../exam/ExamQuestionVisual';
import { MathText } from '../exam/MathText';
import type { ExamReceipt } from '../exam/contracts';

interface ExamRow {
  id: string;
  exam_id: string;
  exam_title: string;
  user_id: string;
  name: string;
  email: string | null;
  status: 'submitted' | 'expired' | 'in_progress';
  score: number | null;
  maximum_score: number;
  correct_count: number | null;
  started_at: string;
  submitted_at: string | null;
  feedback_rating: number | null;
  feedback_comment: string | null;
}
interface Summary {
  rows: ExamRow[];
  total: number;
  page_size: number;
  offset: number;
  stats: { total: number; finished: number; average_score: number | null; average_rating: number | null };
}
interface Detail {
  id: string;
  status: ExamRow['status'];
  receipt: ExamReceipt | null;
}
type RPC = (name: string, args: Record<string, unknown>) => Promise<unknown>;
const fa = (value?: number | null) => value == null ? '—' : Number(value).toLocaleString('fa-IR', { maximumFractionDigits: 2 });
const date = (value?: string | null) => value ? new Date(value).toLocaleString('fa-IR', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

export function InstructorExamResults({ course, rpc }: { course: string; rpc: RPC }) {
  const [offset, setOffset] = useState(0);
  const [report, setReport] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<ExamRow | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [query, setQuery] = useState('');
  const [revision, setRevision] = useState(0);
  const limit = 20;
  const refresh = useCallback(() => setRevision(v => v + 1), []);

  useEffect(() => {
    let alive = true;
    setLoading(true); setError('');
    void rpc('classroom_instructor_exam_results', { p_course: course, p_offset: offset, p_limit: limit })
      .then(payload => {
        if (!alive) return;
        const data = payload as Summary;
        if (!data || !Array.isArray(data.rows) || !Number.isInteger(data.total) || !data.stats) throw Error('INVALID_EXAM_REPORT');
        setReport(data);
      })
      .catch(() => { if (alive) setError('دریافت گزارش امتحان ممکن نشد. توابع Supabase و دسترسی مدرس را بررسی کن.'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [course, offset, rpc, revision]);

  useEffect(() => {
    if (!selected) { setDetail(null); return; }
    let alive = true;
    setDetail(null); setDetailError(''); setDetailLoading(true);
    void rpc('classroom_instructor_exam_result', { p_id: selected.id })
      .then(value => {
        if (!alive) return;
        const data = value as Detail;
        if (!data || data.id !== selected.id) throw Error('INVALID_EXAM_DETAIL');
        setDetail(data);
      })
      .catch(() => { if (alive) setDetailError('جزئیات این تلاش دریافت نشد.'); })
      .finally(() => { if (alive) setDetailLoading(false); });
    return () => { alive = false; };
  }, [selected, rpc]);

  const rows = (report?.rows || []).filter(row => {
    const term = query.trim().toLowerCase();
    return !term || [row.name, row.email, row.exam_title].some(value => value?.toLowerCase().includes(term));
  });

  return <section className="instructor-exam-results" dir="rtl">
    <div className="instructor-exam-summary">
      <div><span>شرکت‌کنندگان و تلاش‌ها</span><strong>{fa(report?.stats.total)}</strong></div>
      <div><span>تلاش‌های پایان‌یافته</span><strong>{fa(report?.stats.finished)}</strong></div>
      <div><span>میانگین نمره</span><strong>{fa(report?.stats.average_score)} <small>از ۱۵</small></strong></div>
      <div><span>میانگین رضایت</span><strong>{fa(report?.stats.average_rating)} <small>از ۵</small></strong></div>
    </div>
    <div className="instructor-exam-toolbar">
      <div><h2>کارنامهٔ دانشجویان</h2><p>تلاش‌های آزمایشی مدرس در این گزارش محاسبه نمی‌شوند.</p></div>
      <div className="instructor-exam-tools">
        <input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="جست‌وجوی نام یا ایمیل در همین صفحه" aria-label="جست‌وجوی نام یا ایمیل" />
        <button className="btn" type="button" disabled={loading} onClick={refresh}>به‌روزرسانی</button>
      </div>
    </div>
    {loading && <p className="instructor-exam-message" role="status">در حال دریافت گزارش…</p>}
    {error && <p className="instructor-exam-message is-error" role="alert">{error}</p>}
    {!loading && !error && <>
      {rows.length ? <div className="instructor-exam-table-scroll"><table className="instructor-exam-table">
        <thead><tr><th>دانشجو</th><th>امتحان</th><th>نمره</th><th>وضعیت</th><th>ثبت نهایی</th><th>بازخورد</th><th>کارنامه</th></tr></thead>
        <tbody>{rows.map(row => <tr key={row.id}>
          <td><strong>{row.name || 'دانشجو'}</strong><small><bdi dir="ltr">{row.email || '—'}</bdi></small></td>
          <td>{row.exam_title}</td>
          <td><strong>{row.score == null ? '—' : `${fa(row.score)} / ${fa(row.maximum_score)}`}</strong></td>
          <td>{row.status === 'in_progress' ? 'در حال انجام' : row.status === 'expired' ? 'پایان زمان' : 'ثبت نهایی'}</td>
          <td>{date(row.submitted_at)}</td>
          <td>{row.feedback_rating ? `${fa(row.feedback_rating)} از ۵` : '—'}</td>
          <td><button className="btn small-btn" type="button" onClick={() => setSelected(row)}>مشاهدهٔ جزئیات</button></td>
        </tr>)}</tbody>
      </table></div> : <p className="instructor-exam-message">در این صفحه نتیجه‌ای برای نمایش وجود ندارد.</p>}
      <div className="instructor-exam-pagination">
        <span>{fa(report?.total)} تلاش · صفحهٔ {fa(Math.floor(offset / limit) + 1)}</span>
        <div><button className="btn" type="button" disabled={offset === 0 || loading} onClick={() => setOffset(n => Math.max(0, n - limit))}>قبلی</button>
          <button className="btn" type="button" disabled={loading || offset + limit >= (report?.total || 0)} onClick={() => setOffset(n => n + limit)}>بعدی</button></div>
      </div>
      {query && <p className="small muted">جست‌وجو روی ردیف‌های صفحهٔ جاری انجام می‌شود؛ برای دیدن سایر دانشجویان از صفحه‌بندی استفاده کن.</p>}
    </>}

    {selected && <div className="instructor-exam-detail-overlay" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setSelected(null); }}>
      <section className="instructor-exam-detail" role="dialog" aria-modal="true" aria-labelledby="instructor-exam-detail-title">
        <header><div><p className="exam-eyebrow">نتیجهٔ امتحان</p><h2 id="instructor-exam-detail-title">{selected.name || 'دانشجو'}</h2><bdi dir="ltr">{selected.email || ''}</bdi></div><button type="button" className="btn" onClick={() => setSelected(null)}>بستن ×</button></header>
        {detailLoading && <p role="status">در حال دریافت پاسخ‌ها…</p>}
        {detailError && <p role="alert">{detailError}</p>}
        {detail && !detail.receipt && <p>امتحان این دانشجو هنوز در حال انجام است. پاسخ‌ها و کلیدها فقط بعد از ثبت نهایی نمایش داده می‌شوند.</p>}
        {detail?.receipt && <>
          <div className="instructor-exam-detail-facts"><span>نمره: <b>{fa(detail.receipt.score)} / {fa(detail.receipt.maximum_score)}</b></span><span>پاسخ درست: <b>{fa(detail.receipt.correct_count)}</b></span><span>وضعیت: <b>{detail.receipt.status === 'expired' ? 'پایان زمان' : 'ثبت نهایی'}</b></span></div>
          {selected.feedback_comment && <div className="instructor-exam-comment"><b>نظر دانشجو:</b><p>{selected.feedback_comment}</p></div>}
          <div className="instructor-exam-detail-questions">{detail.receipt.feedback?.map((item,index) => {
            const chosen = item.options.find(option => option.id === item.selected_option);
            const correct = item.options.find(option => option.id === item.correct_option);
            return <article key={item.id} className={item.is_correct ? 'is-correct' : 'is-incorrect'}>
              <div className="instructor-exam-question-header"><strong>سؤال {fa(index + 1)} · {item.skill}</strong><span>{item.is_correct ? 'درست' : chosen ? 'نادرست' : 'بدون پاسخ'}</span></div>
              <div className="instructor-exam-question-stem"><MathText text={item.stem} /></div>
              <ExamQuestionVisual visual={item.visual} />
              <p><strong>پاسخ دانشجو:</strong> <MathText text={chosen?.text || 'بدون پاسخ'} /></p>
              <p><strong>پاسخ صحیح:</strong> <MathText text={correct?.text || '—'} /></p>
              <div className="instructor-exam-reason"><MathText text={item.rationale} /></div>
            </article>;
          })}</div>
        </>}
      </section>
    </div>}
  </section>;
}
