import { RouteTrail } from '../components/GateCard';

export const instructorName = 'مسعود آهنگری';
export const instructorLatin = 'Masoud Ahangary';
export const instructorLinkedIn = 'https://www.linkedin.com/in/masoud-ahangary/';
export const expertise = [
  'یادگیری ماشین', 'یادگیری عمیق', 'مهندسی ایجنت‌های هوش مصنوعی', 'علم شبکه‌ها',
  'بهینه‌سازی', 'جست‌وجوی معنایی و بازیابی اطلاعات', 'معماری سامانه‌های داده‌محور',
] as const;

export function AboutPage({ home = '../index.html', portrait = '../assets/masoud-ahangary.webp' }: { home?: string; portrait?: string }) {
  return <>
    <RouteTrail items={[{ href: home, label: 'صفحهٔ اصلی' }, { label: 'دربارهٔ مدرس', current: true }]} />
    <section className="portfolio shell" id="instructor" aria-labelledby="instructor-title">
      <div className="portfolio-head">
        <div>
          <p className="eyebrow">دربارهٔ مدرس</p>
          <h1 id="instructor-title">{instructorName}</h1>
          <p className="latin-name" lang="en" dir="ltr">{instructorLatin}</p>
        </div>
        <a className="quiet-link" href={instructorLinkedIn} target="_blank" rel="noopener noreferrer">سوابق و فعالیت‌ها در LinkedIn ↗</a>
      </div>
      <div className="portfolio-grid instructor-profile">
        <figure className="portrait instructor-portrait">
          <img src={portrait} width={640} height={800} alt={instructorName} decoding="async" />
        </figure>
        <div className="portfolio-copy">
          <p>من مسعود آهنگری هستم؛ تحصیل‌کردهٔ دانشگاه صنعتی شریف و فعال در حوزه‌های یادگیری ماشین، یادگیری عمیق و مهندسی ایجنت‌های هوش مصنوعی. تجربهٔ من همچنین شامل اجرای پروژه‌های مهم در حوزهٔ علم شبکه‌ها، حل مسائل بهینه‌سازی و توسعهٔ سامانه‌های داده‌محور است. در این مسیر، به پیوند میان مبانی نظری، صورت‌بندی دقیق مسئله و ساخت راه‌حل‌های عملی توجه دارم.</p>
          <p>در تدریس، تلاش می‌کنم مفاهیم از طریق توضیح روشن، مثال و تجربهٔ عملی قابل فهم شوند. در این کلاس‌ها، از شناخت مسئله و داده‌ها شروع می‌کنیم و قدم‌به‌قدم به پیاده‌سازی و بررسی نتیجه می‌رسیم؛ با این هدف که دانشجو علاوه بر نوشتن کد، منطق راه‌حل، دلیل انتخاب روش و محدودیت‌های آن را هم درک کند.</p>
          <h2 className="instructor-skills-title">حوزه‌های تخصص</h2>
          <div className="expertise" aria-label="حوزه‌های تخصص">{expertise.map(item => <span key={item}>{item}</span>)}</div>
        </div>
      </div>
    </section>
  </>;
}
