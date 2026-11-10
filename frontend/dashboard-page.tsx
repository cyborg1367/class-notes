import { createRoot } from 'react-dom/client';
import { DashboardPage } from './dashboard/DashboardPage';
import type { DashboardActions, DashboardView } from './dashboard/contracts';

// One React root per dashboard visit. The portal retains authorization and I/O.
export function mountDashboard(host: HTMLElement) {
  const root = createRoot(host, { identifierPrefix: 'dashboard-' });
  return {
    render(view: DashboardView, actions: DashboardActions) {
      root.render(<DashboardPage view={view} actions={actions} />);
    },
    dispose() { root.unmount(); },
  };
}

export { createDashboardController } from './dashboard/dashboard-controller.mjs';
