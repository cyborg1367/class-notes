import { useState } from 'react';
import { PaperButton } from './PaperButton';

export type GateAction = {
  label: string;
  href?: string;
  login?: boolean;
  primary?: boolean;
  onClick?: () => void | Promise<void>;
};
export type TrailItem = { href?: string; label: string; current?: boolean };
export type GateView = {
  title: string;
  body?: string;
  actions?: GateAction[];
  status?: string;
  heading?: 'h1' | 'h2';
};

export function RouteTrail({ items }: { items: TrailItem[] }) {
  return <nav className="shell route-trail" aria-label="مسیر صفحه"><ol>
    {items.map((item, index) => <li key={index}>
      {item.href ? <a href={item.href} dir="auto">{item.label}</a>
        : <span aria-current={item.current ? 'page' : undefined} dir="auto">{item.label}</span>}
    </li>)}
  </ol></nav>;
}

export function GateCard({ view }: { view: GateView }) {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(view.status || '');
  const Heading = view.heading === 'h1' ? 'h1' : 'h2';
  async function run(action: GateAction) {
    if (!action.onClick || busy) return;
    setBusy(true);
    try { await action.onClick(); }
    catch (error) {
      const message = error && typeof error === 'object' && 'message' in error ? String(error.message) : '';
      setStatus(message || 'عملیات کامل نشد. دوباره تلاش کن.');
    }
    finally { setBusy(false); }
  }
  return <div className="gate-card" data-react-gate="" aria-busy={busy}>
    <Heading>{view.title}</Heading>
    {view.body && <p>{view.body}</p>}
    {!!view.actions?.length && <div className="portal-actions">
      {view.actions.map((action, index) => <PaperButton key={index} href={action.href} login={action.login}
        secondary={!action.primary} disabled={busy} onClick={action.onClick ? () => void run(action) : undefined}>
        {action.label}
      </PaperButton>)}
    </div>}
    <p className="status-line" data-gate-status="" role="status" aria-live="polite" data-error={status ? 'true' : undefined}>{status}</p>
  </div>;
}
