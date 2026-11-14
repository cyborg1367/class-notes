import type { DashboardActions, DashboardCourse, DashboardView, LabResult, QuizReceipt } from './contracts';
import type { RPC } from '../portal/services/requests';

// These ports contain display inputs and actions, never an SDK client or token.
export type DashboardContext = {
  user: { id: string; user_metadata?: { full_name?: unknown; name?: unknown } } | null;
  state: { memberships?: { course_id: string; status: string }[]; results?: QuizReceipt[] } | null;
  serviceError: unknown;
  labSnapshots?: Record<string, LabResult> | null;
};
export type DashboardRenderer = {
  render(view: DashboardView, actions: DashboardActions): void;
  dispose(): void;
};
export type DashboardController = { load(): Promise<void>; dispose(): void };
export type DashboardControllerPorts = {
  renderer: DashboardRenderer;
  catalog: DashboardCourse[];
  context(): DashboardContext;
  isCurrent(): boolean;
  rpc: RPC;
  refreshAccess(): Promise<void>;
  studyFor(course: DashboardCourse): { last: string | null; opened: string[] };
  login(): string;
  link(path: string): string;
  storage: { read(key: string): unknown; write(key: string, value: string[]): unknown };
};
export type DashboardFeature = {
  mountDashboard(host: HTMLElement): DashboardRenderer;
  createDashboardController(ports: DashboardControllerPorts): DashboardController;
};
