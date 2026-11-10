import type { ReactNode } from 'react';
import type { Dataset, ReferenceMeta } from './contracts';

export function DatasetReference({ dataset, meta, intro, variables, bootstrap, csvURL, finalStage, hasPreview }: {
  dataset: Dataset; meta: ReferenceMeta; intro: ReactNode; variables: ReactNode;
  bootstrap: string; csvURL?: string; finalStage: boolean; hasPreview: boolean;
}) {
  const [testSize,seed,k]=dataset.query;
  const queryValue=csvURL
    ? meta.queryText || (dataset.query.length===3 ? `test_size=${testSize} · seed=${seed} · k=${k}` : JSON.stringify(dataset.query))
    : JSON.stringify(dataset.query);
  return <>
    <p className="lab-panel-kicker">داده‌های آمادهٔ این تمرین</p>
    <h2>{meta.dataTitle}</h2>
    {hasPreview && <section className="lab-evaluation-preview" data-evaluation-preview=""
      aria-label="خروجی تصویری ارزیابی" hidden />}
    {intro}
    {csvURL && <a className="button-outline" href={csvURL} download lang="en">Download CSV ↓</a>}
    <div className="mission-query">
      <span>{meta.queryLabel}{!csvURL&&<> · <code dir="ltr">query</code></>}</span>
      {dataset.queryText && <blockquote className="lab-message-text" dir="auto">{dataset.queryText}</blockquote>}
      <strong dir="ltr">{queryValue}</strong>
      <p>{meta.queryHelp}</p>
    </div>
    {dataset.query_new && <div className="mission-query" data-second-query="" hidden={!finalStage}>
      <span>وضعیت دوم · <code dir="ltr">query_new</code></span>
      <strong dir="ltr">{JSON.stringify(dataset.query_new)}</strong>
      <p>{meta.secondHelp}</p>
    </div>}
    <DatasetTable dataset={dataset} title={meta.tableTitle} />
    <details className="mission-contract">
      <summary>آرایه‌های آماده در Python</summary>
      <p>{variables}</p>
      <pre dir="ltr" lang="en" tabIndex={0}>{bootstrap}</pre>
    </details>
  </>;
}

function DatasetTable({ dataset,title }: { dataset: Dataset; title: string }) {
  const {columns,X,names,texts,y}=dataset;
  return <div className="mission-table" role="region" tabIndex={0} aria-label={title}>
    <table>
      <caption>{title} · اندیس‌ها از صفر شروع می‌شوند</caption>
      <thead><tr>
        <th scope="col">اندیس</th><th scope="col">شناسه</th>
        {columns.map(column=><th scope="col" key={column.name}>{column.label}<small lang="en" dir="ltr">{column.name}</small></th>)}
        {texts&&<th scope="col">متن پیامک</th>}
        {y&&<th scope="col">برچسب <small lang="en" dir="ltr">y</small></th>}
      </tr></thead>
      <tbody>{X.map((row,index)=><tr key={index}>
        <th scope="row" dir="ltr">{index}</th>
        <td dir="ltr">{names[index]}</td>
        {row.map((value,col)=><td key={col} dir="ltr">{value}</td>)}
        {texts&&<td className="lab-message-cell" dir="auto">{texts[index]}</td>}
        {y&&<td><bdi>{y[index]}</bdi>{texts&&(y[index]?' · تبلیغاتی':' · عادی')}</td>}
      </tr>)}</tbody>
    </table>
  </div>;
}

export function GuideReference({ title, story, lessonURL }: { title: string; story: ReactNode; lessonURL: string }) {
  return <>
    <details className="mission-story">
      <summary>{title}</summary>
      {story}
    </details>
    <details className="mission-contract">
      <summary>چطور با این محیط کار کنم؟</summary>
      <ol className="mission-guide-steps">
        <li>در تابع خواسته‌شده، <code dir="ltr">pass</code> را با راه‌حل خودت جایگزین کن.</li>
        <li>تابع باید جواب را با <code dir="ltr">return</code> برگرداند. خط <code dir="ltr">print(...)</code> زیر آن، جواب را در خروجی نشان می‌دهد.</li>
        <li>«اجرای کد» را بزن و خروجی یا خطا را ببین. می‌توانی چند بار کدت را تغییر بدهی و امتحان کنی.</li>
        <li>وقتی آماده بودی، «بررسی پاسخ» را بزن تا مرحله ارزیابی شود و XP بگیری.</li>
      </ol>
    </details>
    <a className="quiet-link" href={lessonURL}>مرور جزوه ←</a>
  </>;
}
