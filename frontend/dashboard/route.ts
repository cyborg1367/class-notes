import type { DashboardContext, DashboardController, DashboardControllerPorts, DashboardFeature,
  DashboardRenderer } from './controller-contracts';

type RouteContext = DashboardContext & { generation: number };
type Ports = Omit<DashboardControllerPorts, 'renderer' | 'context' | 'isCurrent' | 'refreshAccess'> & {
  host(): HTMLElement | null;
  context(): RouteContext;
  loadFeature(): Promise<DashboardFeature>;
  refreshAccess(): Promise<void>;
  afterAccessRefresh(): void;
  releaseFallback(host: HTMLElement): void;
  unavailable(host: HTMLElement, isCurrent: () => boolean): void | Promise<void>;
};
type Owner = { host: HTMLElement; generation: number; userId: string | null; revision: number };
type Mounted = { owner: Owner; controller: DashboardController };
type Pending = { owner: Owner; task: Promise<void> };

// One dashboard route per document. Only its current owner can attach a root,
// report a startup error, or refresh shared account services after an await.
export function createDashboardRoute(ports: Ports) {
  let revision = 0;
  let mounted: Mounted | null = null;
  let pending: Pending | null = null;
  let ownedHost: HTMLElement | null = null;

  function current(owner: Owner): boolean {
    const context = ports.context();
    return owner.revision === revision && owner.host.isConnected &&
      owner.generation === context.generation && owner.userId === (context.user?.id ?? null);
  }

  function reset(): void {
    revision++;
    const previous = mounted, host = ownedHost;
    mounted = null; pending = null; ownedHost = null;
    try { previous?.controller.dispose(); }
    finally { if (host) ports.releaseFallback(host); }
  }

  async function initialize(owner: Owner): Promise<void> {
    const alive = () => current(owner);
    let renderer: DashboardRenderer | null = null, controller: DashboardController | null = null;
    let adopted = false;
    try {
      const feature = await ports.loadFeature();
      if (!alive()) return;
      ports.releaseFallback(owner.host);
      renderer = feature.mountDashboard(owner.host);
      if (!alive()) { renderer.dispose(); return; }
      controller = feature.createDashboardController({
        renderer, catalog: ports.catalog, context: ports.context, isCurrent: alive, rpc: ports.rpc,
        refreshAccess: async () => {
          if (!alive()) return;
          await ports.refreshAccess();
          if (alive()) ports.afterAccessRefresh();
        },
        studyFor: ports.studyFor, login: ports.login, link: ports.link, storage: ports.storage,
      });
      if (!alive()) { controller.dispose(); return; }
      mounted = { owner, controller }; adopted = true;
      await controller.load();
    } catch {
      if (!adopted) renderer?.dispose();
      if (!alive()) return;
      if (mounted?.controller === controller) {
        mounted = null;
        controller?.dispose();
      }
      await ports.unavailable(owner.host, alive);
    }
  }

  function mount(): Promise<void> {
    const host = ports.host();
    if (!host) { if (ownedHost) reset(); return Promise.resolve(); }
    if ((ownedHost && ownedHost !== host) ||
        (mounted && !current(mounted.owner)) ||
        (pending && (!current(pending.owner) || pending.owner.host !== host))) reset();
    if (mounted) return mounted.controller.load();
    if (pending) return pending.task;
    const context = ports.context();
    const owner: Owner = { host, generation: context.generation, userId: context.user?.id ?? null, revision };
    ownedHost = host;
    const task = initialize(owner).finally(() => { if (pending?.task === task) pending = null; });
    pending = { owner, task };
    return task;
  }

  return { mount, reset };
}
