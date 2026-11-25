import React from 'react';
import { PaperButton } from '../components/PaperButton';
import { PaperIcon } from '../components/PaperIcon';
import type { ExamSummary } from './contracts';

const fa = (value: number) => Number(value).toLocaleString('fa-IR');
const date = (value?: string | null) => {
  if (!value) return '';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? '' : parsed.toLocaleString('fa-IR', { dateStyle: 'medium', timeStyle: 'short' });
};

function stateLabel(exam: ExamSummary) {
  if (exam.status === 'in_progress') return 'در حال برگزاری';
  if (exam.status === 'completed') return 'شرکت‌شده';
  if (exam.status === 'scheduled') return 'هنوز فعال نشده';
  if (exam.status === 'closed') return 'مهلت شرکت پایان یافته';
  if (exam.status === 'unavailable') return 'فعلاً در دسترس نیست';
  return 'آمادهٔ شرکت';
}

function ExamCard({ exam, href }: { exam: ExamSummary; href: string }) {
  const canStart = exam.status === 'available' || exam.status === 'in_progress';
  const destination = exam.status === 'completed' && exam.last_attempt_id
    ? href + '?attempt=' + encodeURIComponent(exam.last_attempt_id) : href;
  const attempts = exam.attempts_allowed == null
    ? `${fa(exam.attempts_used ?? 0)} تلاش ثبت‌شده`
    : `${fa(exam.attempts_used ?? 0)} از ${fa(exam.attempts_allowed)} تلاش`;
  const score = exam.best_score != null && exam.maximum_score != null
    ? `${fa(exam.best_score)} از ${fa(exam.maximum_score)}` : null;
  return <article className="exam-card" data-exam-card={exam.id}>
    <div className="exam-card-mark"><PaperIcon name="quiz" /></div>
    <div className="exam-card-body">
      <div className="exam-card-heading">
        <div><p className="exam-eyebrow">ارزیابی مستقل</p><h2>{exam.title}</h2></div>
        <span className={'exam-status exam-status-' + exam.status}>{stateLabel(exam)}</span>
      </div>
      {exam.subtitle && <p className="exam-subtitle">{exam.subtitle}</p>}
      <p className="exam-description">{exam.description}</p>
      <div className="exam-facts" aria-label="مشخصات امتحان">
        <span><PaperIcon name="note" />{fa(exam.question_count)} سؤال</span>
        <span><PaperIcon name="clock" />{fa(exam.duration_minutes)} دقیقه</span>
        <span><PaperIcon name="check" />{attempts}</span>
        {score && <span><PaperIcon name="medal" />بهترین نتیجه: {score}</span>}
      </div>
      {(exam.available_from || exam.available_until) && <p className="exam-window">
        {exam.available_from && <>شروع: {date(exam.available_from)}</>}
        {exam.available_from && exam.available_until && ' · '}
        {exam.available_until && <>پایان: {date(exam.available_until)}</>}
      </p>}
      <div className="exam-card-actions">
        {canStart
          ? <PaperButton href={destination}>{exam.status === 'in_progress' ? 'ادامهٔ امتحان ←' : 'مشاهده و شروع امتحان ←'}</PaperButton>
          : <PaperButton href={destination} secondary>مشاهدهٔ نتیجه / جزئیات</PaperButton>}
      </div>
    </div>
  </article>;
}

export function ExamCatalog({ exams, examURL }: { exams: ExamSummary[]; examURL: (id: string) => string }) {
  return <div className="exam-catalog" data-exam-catalog="">
    <header className="exam-page-intro">
      <p className="exam-eyebrow">CLASS ASSESSMENTS</p>
      <h1>امتحانات مستقل</h1>
      <p>این بخش برای ارزیابی‌های رسمی کلاس در نظر گرفته شده است. امتحانات اینجا مستقل از تمرین‌های کوتاه هر یادداشت و لابراتورها برگزار می‌شوند.</p>
    </header>
    <section className="exam-list-section" aria-labelledby="exam-list-title">
      <div className="exam-section-heading"><div><h2 id="exam-list-title">امتحانات کلاس</h2><p>امتحان‌های فعال و سوابق قابل مشاهدهٔ حساب تو</p></div><span className="exam-count">{fa(exams.length)} امتحان</span></div>
      {exams.length
        ? <div className="exam-list">{exams.map(exam => <ExamCard key={exam.id} exam={exam} href={examURL(exam.id)} />)}</div>
        : <div className="exam-empty"><PaperIcon name="note" /><h3>هنوز امتحانی برای این کلاس منتشر نشده است.</h3><p>وقتی مدرس امتحانی را فعال کند، از همین بخش در دسترس قرار می‌گیرد.</p></div>}
    </section>
    <p className="exam-separation-note">تمرین‌های هر یادداشت همچنان در صفحهٔ همان یادداشت باقی می‌مانند؛ نتیجهٔ آن‌ها با نتیجهٔ امتحانات مستقل ادغام نمی‌شود.</p>
  </div>;
}
