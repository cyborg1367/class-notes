import type { Pair, QuizFigure } from './contracts';

export function QuestionFigure({ figure }: { figure: QuizFigure }) {
  const distance = figure.type === 'distance2d';
  const min = distance ? 0 : 3.8, max = distance ? 7 : 7.4;
  const unit = 270 / (max - min);
  const xy = (point: Pair): Pair => [65 + (point[0] - min) * unit, 305 - (point[1] - min) * unit];
  const values = Array.from({ length: Math.floor(max) - Math.ceil(min) + 1 }, (_, index) => Math.ceil(min) + index);
  const description = distance
    ? `محورها هم‌مقیاس‌اند؛ U در (${figure.u.join(', ')}) و V در (${figure.v.join(', ')}) است.`
    : `محورها هم‌مقیاس‌اند؛ q در (${figure.query.join(', ')}) است. ` + figure.points
      .map(point => `${point.id}: (${point.x.join(', ')}), کلاس ${point.y}`).join('؛ ') + '. دایره کلاس صفر و مربع کلاس یک است.';

  return <figure className="quiz-figure">
    <svg viewBox="0 0 420 360" role="img" aria-label={description}>
      {values.map(value => {
        const [x, y] = xy([value, value]);
        return <g key={value}>
          <path d={`M${x},35V305 M65,${y}H335`} stroke="#dce6d4" />
          <text x={x} y={325} textAnchor="middle" fontSize={11} fill="#708368">{value}</text>
          <text x={48} y={y + 4} textAnchor="middle" fontSize={11} fill="#708368">{value}</text>
        </g>;
      })}
      <path d="M65,35V305H335" fill="none" stroke="#7f9873" />
      <text x={355} y={310} fontSize={12} fill="#506c43">x₁</text>
      <text x={55} y={23} fontSize={12} fill="#506c43">x₂</text>
      {distance ? <DistancePoints u={figure.u} v={figure.v} xy={xy} /> : <>
        {figure.points.map(point => {
          const [x, y] = xy(point.x), [dx, dy] = point.id === 'A' ? [-18, -14] : [12, 5];
          return <g key={point.id}>
            {point.y === 0 ? <circle cx={x} cy={y} r={6} fill="#2d7560" />
              : <rect x={x - 6} y={y - 6} width={12} height={12} rx={1} fill="#b76844" />}
            <text x={x + dx} y={y + dy} fill="#516d46" fontSize={12}>{point.id} · {point.y}</text>
          </g>;
        })}
        <QueryPoint point={xy(figure.query)} />
      </>}
    </svg>
    <figcaption className="small-note">محورها هم‌مقیاس‌اند؛ شکل، دادهٔ مستقلِ همین سؤال است.</figcaption>
  </figure>;
}

function DistancePoints({ u, v, xy }: { u: Pair; v: Pair; xy: (point: Pair) => Pair }) {
  const a = xy(u), b = xy(v);
  return <>
    <path d={`M${a}L${b[0]},${a[1]}L${b}`} fill="none" stroke="#a8b99a" strokeDasharray="5 4" />
    <path d={`M${a}L${b}`} stroke="#326940" strokeWidth={3} />
    {([{ name: 'U', value: u, point: a }, { name: 'V', value: v, point: b }]).map(({ name, value, point: [x, y] }) =>
      <g key={name}><circle cx={x} cy={y} r={6} fill="#326940" />
        <text x={x + 12} y={y + 4} fontSize={12} fill="#375332">{name} ({value.join(', ')})</text></g>)}
  </>;
}

function QueryPoint({ point: [x, y] }: { point: Pair }) {
  return <>
    <path d={`M${x},${y - 7}L${x + 7},${y}L${x},${y + 7}L${x - 7},${y}Z`} fill="#193f30" />
    <text x={x - 18} y={y + 21} fill="#193f30" fontSize={13}>q</text>
  </>;
}
