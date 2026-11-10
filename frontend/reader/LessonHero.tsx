import { memo } from 'react';
import type { BinaryPlot, HeroContent } from './contracts';
import { ThresholdScoreFigure } from './ThresholdScoreFigure';

function BinaryFigure({ plot }: { plot: BinaryPlot }) {
  const [qx, qy] = [64 + 37.6 * plot.query[0], 426 - 37.6 * plot.query[1]];
  return <figure className="hero-figure binary-hero">
    <svg viewBox="0 0 540 510" role="img"
      aria-label="نمونه‌های ساختگی در فضای دو ویژگی؛ دایره کلاس صفر، مربع کلاس یک و لوزی پرس‌وجو است.">
      {[0, 2, 4, 6, 8, 10].map(n => {
        const x = 64 + 37.6 * n, y = 426 - 37.6 * n;
        return <g key={n}>
          <path d={`M${x} 50V426M64 ${y}H440`} stroke="#b9b7a1" strokeOpacity=".45" />
          <g fill="#585e4e" fontSize="16"><text x={x} y="453" textAnchor="middle">{n}</text>
            <text x="48" y={y + 5} textAnchor="end">{n}</text></g>
        </g>;
      })}
      <path d="M64 40V426H452m-394-375 6-11 6 11m371 369 11 6-11 6" fill="none" stroke="#24241f" strokeWidth="1.8" />
      <g fill="#24241f" fontSize="19"><text x="252" y="489" textAnchor="middle">M1</text>
        <text x="20" y="238" transform="rotate(-90 20 238)" textAnchor="middle">M2</text></g>
      {plot.points.map(({ x: valueX, y: valueY, positive, label }, index) => {
        const x = 64 + 37.6 * valueX, y = 426 - 37.6 * valueY;
        const [dx, dy] = index === 4 ? [-33, -12] : index === 5 ? [13, 27] : [12, -11];
        const title = <title>{label}: M1 = {valueX}, M2 = {valueY}, class {positive ? 1 : 0}</title>;
        return <g key={index}>
          {positive
            ? <rect data-hero-class="1" x={x - 7} y={y - 7} width="14" height="14" fill="#a35236" stroke="#24241f">{title}</rect>
            : <circle data-hero-class="0" cx={x} cy={y} r="7" fill="#21665d" stroke="#24241f">{title}</circle>}
          <text x={x + dx} y={y + dy} fill="#3e4438" fontSize="16">{label}</text>
        </g>;
      })}
      <path data-hero-query="" d={`m${qx} ${qy - 10} 10 10-10 10-10-10z`} fill="#f4d835" stroke="#24241f" strokeWidth="1.5" />
      <text x={qx + 18} y={qy + 3} fill="#24241f" fontSize="19" fontWeight="700">q</text>
    </svg>
    <div className="binary-hero-legend">
      <span><svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="6" fill="#21665d" stroke="#24241f" /></svg>کلاس <bdi>0</bdi></span>
      <span><svg viewBox="0 0 20 20" aria-hidden="true"><rect x="4" y="4" width="12" height="12" fill="#a35236" stroke="#24241f" /></svg>کلاس <bdi>1</bdi></span>
      <span><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m10 2 8 8-8 8-8-8z" fill="#f4d835" stroke="#24241f" /></svg>پرس‌وجوی <bdi>q</bdi></span>
    </div>
    <p className="binary-hero-axes"><bdi>M1</bdi>: امتیاز تنفسی · <bdi>M2</bdi>: امتیاز خستگی</p>
    <figcaption>پرونده‌ها و امتیازها کاملاً ساختگی‌اند؛ کلاسِ <bdi>q</bdi> هنوز مشخص نیست.</figcaption>
  </figure>;
}

export const LessonHero = memo(function LessonHero({ hero, title, start }: { hero: HeroContent; title: string; start?: string }) {
  const { visual } = hero;
  return <section className="hero lesson-hero" id="top" data-lesson-hero="">
    <div className={'shell hero-grid' + (visual ? '' : ' hero-grid--single')}>
      <div className="hero-copy">
        {hero.eyebrow && <p className="eyebrow" dangerouslySetInnerHTML={{ __html: hero.eyebrow }} />}
        {hero.titleHTML ? <h1 className="reader-hero-title" dangerouslySetInnerHTML={{ __html: hero.titleHTML }} />
          : <h1 className="reader-hero-title">{title}</h1>}
        {hero.copy && <div className="reader-hero-text" dangerouslySetInnerHTML={{ __html: hero.copy }} />}
        {(start || hero.meta) && <div className="hero-actions">
          {start && <a className="button-primary" data-lesson-start="" href={start}>شروع مطالعه <span aria-hidden="true">←</span></a>}
          {hero.meta && <p className="hero-meta" dangerouslySetInnerHTML={{ __html: hero.meta }} />}
        </div>}
      </div>
      {visual?.kind === 'binary' && <BinaryFigure plot={visual.plot} />}
      {visual?.kind === 'authored' && <figure className={visual.className} dangerouslySetInnerHTML={{ __html: visual.html }} />}
      {visual?.kind === 'threshold-scores' && <ThresholdScoreFigure />}
    </div>
    {hero.highlights.length > 0 && <div className="shell"><ul className="hero-strip" aria-label="نکات کلیدی یادداشت">
      {hero.highlights.map(({ number, html }, index) => <li key={index}>
        <span className="strip-number" dir="ltr" aria-hidden="true">{number}</span>
        <span className="strip-text" dangerouslySetInnerHTML={{ __html: html }} />
      </li>)}
    </ul></div>}
  </section>;
});
