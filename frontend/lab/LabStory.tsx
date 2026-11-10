import { PaperIcon } from '../components/PaperIcon';
import type { IntroModel } from './contracts';

const labels = { start: 'شروع مأموریت', resume: 'ادامهٔ مأموریت', return: 'برگشت به مأموریت' };
const fa = new Intl.NumberFormat('fa-IR');

function DatasetSample({ dataset }: Pick<IntroModel,'dataset'>) {
  const sample = dataset.X.slice(0, 3);
  return <>
    <p className="lab-intro-kicker" id="lab-sample-label">
      نمونه‌ای از داده‌ها · {fa.format(sample.length)} سطر از {fa.format(dataset.X.length)} سطر
    </p>
    <div className="lab-intro-table" role="region" aria-labelledby="lab-sample-label" tabIndex={0}>
      <table aria-labelledby="lab-sample-label">
        <thead><tr>
          <th scope="col">شناسه</th>
          {dataset.columns.map((column, i) => <th scope="col" key={i}>{column.label}</th>)}
          {dataset.texts && <th scope="col">متن پیامک</th>}
          {dataset.y && <th scope="col">برچسب</th>}
        </tr></thead>
        <tbody>{sample.map((row,i) => <tr key={i}>
          <th scope="row" dir="ltr">{dataset.names[i]}</th>
          {row.map((value,j) => <td key={j} dir="ltr">{value}</td>)}
          {dataset.texts && <td className="lab-message-cell" dir="auto">{dataset.texts[i]}</td>}
          {dataset.y && <td>{dataset.y[i]}{dataset.texts && (dataset.y[i] ? ' · تبلیغاتی' : ' · عادی')}</td>}
        </tr>)}</tbody>
      </table>
    </div>
  </>;
}

export function LabStory({ model, onEnter }: { model: IntroModel; onEnter: () => void }) {
  const { meta, dataset, stages, example, action, showQueryCode } = model;
  return <>
    <div className="lab-intro-copy">
      <p className="lab-intro-kicker"><PaperIcon name="lab" /> پیش از شروع · {meta.title}</p>
      <h2 id="lab-intro-title" tabIndex={-1}>{meta.introTitle}</h2>
      <div className="lab-intro-story-copy">
        {meta.lessonBridge && <p>{meta.lessonBridge}</p>}
        <div dangerouslySetInnerHTML={{ __html: meta.story }} />
      </div>
      <div className="lab-intro-dataset">
        <h3>داده‌ها چه معنایی دارند؟</h3>
        <div dangerouslySetInnerHTML={{ __html: meta.dataIntro }} />
      </div>
    </div>
    <div className="lab-intro-sample">
      <DatasetSample dataset={dataset} />
      <div className="lab-intro-query">
        <span>{meta.queryLabel}{showQueryCode && <> · <code>query</code></>}</span>
        {dataset.queryText && <blockquote className="lab-message-text" dir="auto">{dataset.queryText}</blockquote>}
        {example && <strong dir="ltr">{example}</strong>}
        {meta.queryHelp && <p>{meta.queryHelp}</p>}
      </div>
    </div>
    <div className="lab-intro-path">
      <h3>چه چیزی خواهی ساخت؟</h3>
      <p>{meta.introGoal}</p>
      <ol>{stages.map((stage,i) => <li key={i}>{stage.title}</li>)}</ol>
    </div>
    <footer className="lab-intro-footer">
      <span>{fa.format(stages.length)} مأموریت · <bdi dir="ltr">{stages.reduce((sum,stage) => sum + stage.xp,0)} XP</bdi></span>
      <button className="button-forest" data-intro-start="" type="button" onClick={onEnter}>
        {labels[action]} <span aria-hidden="true">←</span>
      </button>
    </footer>
  </>;
}
