import React from 'react';
import type { ExamVisual } from './contracts';

const validation = [
  { k: 1, train: .99, valid: .67 }, { k: 3, train: .96, valid: .77 },
  { k: 5, train: .92, valid: .84 }, { k: 11, train: .88, valid: .89 },
  { k: 21, train: .82, valid: .85 }, { k: 41, train: .74, valid: .76 },
  { k: 61, train: .68, valid: .69 },
];

function ValidationCurve() {
  const x = (index: number) => 84 + index * 66;
  const y = (value: number) => 230 - ((value - 0.6) / 0.4) * 150;
  const path = (key: 'train' | 'valid') => validation.map((point, index) => `${index ? 'L' : 'M'}${x(index)},${y(point[key])}`).join(' ');
  return <figure className="exam-figure exam-validation-figure">
    <svg viewBox="0 0 600 340" role="img" aria-label="منحنی اعتبارسنجی KNN؛ دقت آموزش از مقدار بالا در k برابر یک به‌تدریج کاهش می‌یابد و دقت اعتبارسنجی در k برابر یازده به بیشترین مقدار می‌رسد.">
      <rect x="36" y="18" width="528" height="286" rx="18" fill="#fffef9" stroke="#d8ded3" />
      <text x="300" y="48" textAnchor="middle" fontSize="15" fontWeight="700" fill="#385242">Validation Curve</text>
      {[0.6, 0.7, 0.8, 0.9, 1].map(value => <g key={value}>
        <path d={`M84 ${y(value)} H510`} stroke="#d8ded3" strokeWidth="1" />
        <text x="70" y={y(value) + 4} textAnchor="end" fontSize="11" fill="#66745f">{Math.round(value * 100)}%</text>
      </g>)}
      <path d="M84 80V230H510" fill="none" stroke="#87957f" strokeWidth="1.5" />
      <path d={path('train')} fill="none" stroke="#b76844" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d={path('valid')} fill="none" stroke="#286c5b" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      {validation.map((point, index) => <g key={point.k}>
        <circle cx={x(index)} cy={y(point.train)} r="5" fill="#b76844" />
        <circle cx={x(index)} cy={y(point.valid)} r="5" fill="#286c5b" />
        <text x={x(index)} y="256" textAnchor="middle" fontSize="12" fill="#66745f">{point.k}</text>
      </g>)}
      <text x="297" y="295" textAnchor="middle" fontSize="13" fill="#485a45">تعداد همسایه‌ها (k)</text>
      <text x="34" y="154" transform="rotate(-90 34 154)" textAnchor="middle" fontSize="13" fill="#485a45">دقت</text>
    </svg>
    <div className="exam-curve-legend" aria-label="راهنمای خطوط نمودار" dir="rtl">
      <span><i className="is-train" aria-hidden="true" /> دقت آموزش</span>
      <span><i className="is-valid" aria-hidden="true" /> دقت اعتبارسنجی</span>
    </div>
    <figcaption>نمودار فرضی برای تفسیر رفتار مدل؛ محور عمودی دقت و محور افقی تعداد همسایه‌ها را نشان می‌دهد.</figcaption>
  </figure>;
}

function DecisionBoundary() {
  return <figure className="exam-figure exam-boundary-figure">
    <svg viewBox="0 0 520 285" role="img" aria-label="مرز تصمیم KNN؛ ناحیهٔ سمت چپ پیش‌بینی کلاس صفر و ناحیهٔ سمت راست پیش‌بینی کلاس یک است. مثلث P برچسب واقعی صفر در ناحیهٔ پیش‌بینی یک و مثلث Q برچسب واقعی یک در ناحیهٔ پیش‌بینی صفر قرار دارد.">
      <rect x="35" y="22" width="450" height="220" rx="5" fill="#e7eff7"/>
      <path d="M270 22 C246 73 296 117 263 162 C247 188 270 215 253 242 H485 V22 Z" fill="#f7e8df"/>
      <path d="M270 22 C246 73 296 117 263 162 C247 188 270 215 253 242" fill="none" stroke="#59665c" strokeWidth="2.4" strokeDasharray="6 5"/>
      <path d="M35 242H485" stroke="#87957f"/><path d="M35 22V242" stroke="#87957f"/>
      <polygon points="346,96 332,122 360,122" fill="#315f88" stroke="#fff" strokeWidth="2.5"/>
      <text x="366" y="112" fontSize="14" fontWeight="700" fill="#315f88">P</text>
      <polygon points="150,151 136,177 164,177" fill="#bb603a" stroke="#fff" strokeWidth="2.5"/>
      <text x="170" y="169" fontSize="14" fontWeight="700" fill="#bb603a">Q</text>
      <text x="120" y="48" fontSize="12" fill="#315f88">پیش‌بینی کلاس ۰</text>
      <text x="365" y="48" fontSize="12" fill="#9d512f">پیش‌بینی کلاس ۱</text>
      <text x="258" y="273" textAnchor="middle" fontSize="11" fill="#59665c">فضای ویژگی‌ها · نمایش شماتیک</text>
    </svg>
    <figcaption>رنگ پس‌زمینه پیش‌بینی مدل و رنگ مثلث برچسب واقعی نمونه را نشان می‌دهد.</figcaption>
  </figure>;
}

function ConfusionMatrix() {
  return <figure className="exam-figure exam-matrix-figure" role="group" aria-label="ماتریس درهم‌ریختگی با کلاس واقعی در سطرها و کلاس پیش‌بینی‌شده در ستون‌ها">
    <div className="exam-matrix-title">Confusion Matrix</div>
    <p className="exam-matrix-caption">سطرها: کلاس واقعی · ستون‌ها: کلاس پیش‌بینی‌شده</p>
    <div className="exam-matrix-layout" dir="ltr">
      <div className="exam-matrix-y-label" lang="fa" dir="rtl">کلاس واقعی</div>
      <table className="exam-matrix-table" aria-label="ماتریس درهم‌ریختگی">
        <thead><tr><th scope="col" aria-label="کلاس واقعی و پیش‌بینی‌شده"></th><th scope="col">پیش‌بینی ۰</th><th scope="col">پیش‌بینی ۱</th></tr></thead>
        <tbody>
          <tr><th scope="row">واقعی ۰</th><td className="is-correct" aria-label="۳۶ مورد درست">36</td><td className="is-error" aria-label="۴ مورد اشتباه">4</td></tr>
          <tr><th scope="row">واقعی ۱</th><td className="is-error" aria-label="۶ مورد اشتباه">6</td><td className="is-correct" aria-label="۱۴ مورد درست">14</td></tr>
        </tbody>
      </table>
    </div>
    <figcaption>خانه‌های سبز: پیش‌بینی درست · خانه‌های نارنجی: پیش‌بینی نادرست</figcaption>
  </figure>;
}

export function ExamQuestionVisual({ visual }: { visual?: ExamVisual }) {
  if (visual === 'validation_curve') return <ValidationCurve />;
  if (visual === 'decision_boundary') return <DecisionBoundary />;
  if (visual === 'confusion_matrix') return <ConfusionMatrix />;
  return null;
}
