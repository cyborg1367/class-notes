// Synthetic scores, independent of the lesson dataset or any learner data.
const scores = [
  { value: 0.10, positive: false }, { value: 0.28, positive: true },
  { value: 0.36, positive: false }, { value: 0.52, positive: false },
  { value: 0.62, positive: true }, { value: 0.76, positive: false },
  { value: 0.86, positive: true }, { value: 0.92, positive: true },
];
const thresholds = [
  { value: 0.40, tone: 'lower', dash: '5 4' },
  { value: 0.70, tone: 'higher', dash: '2 4' },
];
const x = (value: number) => 60 + 350 * value;
const axis = [0, .25, .5, .75, 1];
const positives = scores.filter(sample => sample.positive).length;
const metrics = (threshold: number) => {
  const predicted = scores.filter(sample => sample.value >= threshold);
  const tp = predicted.filter(sample => sample.positive).length;
  return { precision: tp / predicted.length, recall: tp / positives };
};

export function ThresholdScoreFigure() {
  return <figure className="hero-figure reader-threshold-figure" data-threshold-hero="">
    <div className="reader-threshold-heading">
      <strong>یک مدل، دو آستانه</strong><span>دادهٔ ساختگی</span>
    </div>
    <svg className="reader-threshold-chart" viewBox="0 0 432 173" role="img"
      aria-label="امتیاز هشت نمونه با دو آستانهٔ ۰٫۴۰ و ۰٫۷۰؛ لوزی‌ها نمونه‌های مثبت و مربع‌ها نمونه‌های منفی‌اند.">
      <g className="reader-threshold-grid">
        {axis.map(n => <line key={n} x1={x(n)} x2={x(n)} y1="31" y2="131" />)}
        <path d="M60 59H410M60 103H410" />
      </g>
      <g className="reader-threshold-axis" textAnchor="middle">
        <path d="M60 131H410" />
        {axis.map(n => <text key={n} x={x(n)} y="148">{n}</text>)}
        <text x="235" y="164">Model score</text>
      </g>
      <g className="reader-threshold-axis" textAnchor="end">
        <text x="54" y="63">Positive</text><text x="54" y="107">Negative</text>
      </g>
      {thresholds.map(({ value, tone, dash }) =>
        <g className={'reader-threshold-' + tone} key={value} data-threshold={value}>
          <line x1={x(value)} x2={x(value)} y1="30" y2="131" strokeDasharray={dash} />
          <text x={x(value)} y="20" textAnchor="middle">{value.toFixed(2)}</text>
        </g>)}
      {scores.map(({ value, positive }) => positive
        ? <path className="reader-threshold-positive" key={value} data-score={value}
          d={`M${x(value)} 52l7 7-7 7-7-7z`} />
        : <rect className="reader-threshold-negative" key={value} data-score={value}
          x={x(value) - 5.5} y="97.5" width="11" height="11" rx="1" />)}
    </svg>
    <div className="reader-threshold-results" dir="ltr">
      {thresholds.map(({ value, tone }) => {
        const { precision, recall } = metrics(value);
        return <div className={'reader-threshold-result reader-threshold-' + tone} key={value} data-threshold-result={value}>
          <span className="reader-threshold-cut" lang="en">Threshold {value.toFixed(2)}</span>
          <dl lang="en">
            <div><dt>Precision</dt><dd>{precision.toFixed(2)}</dd></div>
            <div><dt>Recall</dt><dd>{recall.toFixed(2)}</dd></div>
          </dl>
        </div>;
      })}
    </div>
    <figcaption>لوزی و مربع، کلاس واقعی نمونه را نشان می‌دهند. امتیازها ثابت‌اند. با آستانهٔ بالاتر، در این مثال <bdi lang="en">Precision</bdi> بیشتر و <bdi lang="en">Recall</bdi> کمتر می‌شود.</figcaption>
  </figure>;
}
