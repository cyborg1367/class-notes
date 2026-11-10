import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { GateCard, RouteTrail, type GateView, type TrailItem } from '../components/GateCard';

export type { GateView, TrailItem };

export function mountGate(host: HTMLElement) {
  const root = createRoot(host, { identifierPrefix: 'gate-' });
  return {
    render(view: GateView) { flushSync(() => root.render(<GateCard view={view} />)); },
    dispose() { root.unmount(); },
  };
}

export function mountRouteFrame(host: HTMLElement, trail: TrailItem[]) {
  const root = createRoot(host, { identifierPrefix: 'route-frame-' });
  flushSync(() => root.render(<>
    <RouteTrail items={trail} />
    <section className="shell portal-main"><div data-lab-host="" /></section>
  </>));
  return {
    slot: host.querySelector<HTMLElement>('[data-lab-host]')!,
    dispose() { root.unmount(); },
  };
}

export function mountStatus(host: HTMLElement, text: string, retry?: () => void) {
  const root = createRoot(host, { identifierPrefix: 'gate-status-' });
  flushSync(() => root.render(<section className="shell portal-main">
    <p className="status-line" role="status">{text}</p>
    {retry && <button type="button" className="button-outline" onClick={retry}>تلاش دوباره</button>}
  </section>));
  return { dispose() { root.unmount(); } };
}
