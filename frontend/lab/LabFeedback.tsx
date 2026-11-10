import type { FeedbackModel } from './contracts';

export function LabFeedback({ model, onClose }: { model: FeedbackModel; onClose: () => void }) {
  return <>
    <button className="lab-feedback-close" data-feedback-close="" type="button" aria-label="بستن بازخورد" onClick={onClose}>×</button>
    <p className="lab-feedback-step" data-feedback-step="">{model.step}</p>
    <span className="lab-feedback-symbol" aria-hidden="true">{model.kind === 'service' ? '…' : model.kind === 'success' ? '✓' : '!'}</span>
    <h2 id="lab-feedback-title" tabIndex={-1}>{model.title}</h2>
    <p id="lab-feedback-message">{model.text}</p>
    {model.field && <p className="lab-feedback-field">نام یا کلید مورد بررسی: <code data-feedback-field="" dir="ltr">{model.field}</code></p>}
    <details className="lab-feedback-hint">
      <summary>راهنمایی</summary><p data-feedback-hint="">{model.hint}</p>
    </details>
    {model.kind === 'correction' && <details className="lab-feedback-example">
      <summary>دیدن مثال</summary>
      <p>مثال آموزشی این مرحله؛ مستقل از ورودی‌های بررسی نهایی.</p>
      <pre data-feedback-example="" dir="ltr" tabIndex={0}>{model.example}</pre>
    </details>}
    <button className="button-forest" data-feedback-return="" type="button" onClick={onClose}>برگشت به کد</button>
  </>;
}
