import { portalDeadline } from './async';
import { portalCreateReadCoordinator, type RPC, type RPCArguments } from './requests';

type Result = { data: unknown; error?: unknown };
type Request = PromiseLike<Result> & { abortSignal?: (signal: AbortSignal) => PromiseLike<Result> };
export type ClassroomClient = { rpc(name: string, args: RPCArguments): Request };
type Parameters = { p_page: string; p_lesson: string | null; p_mission: string | null; p_missions: string[] };
type State = { memberships: unknown[]; results: unknown[]; [key: string]: unknown };
type Bundle = { state: State; [key: string]: unknown };

export function portalMissingBootstrap(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const value = error as Record<string, unknown>;
  return ['PGRST202', '42883'].includes(String(value.code)) &&
    /\bclassroom_bootstrap\b/.test(String(value.message || '') + ' ' + String(value.details || ''));
}

export function createClassroomTransport({ client, page, clock, timeout = 15_000 }: {
  client(): ClassroomClient; page: string; clock?: () => number; timeout?: number;
}) {
  return portalCreateReadCoordinator({ clock, request: async (name, args) => {
    const request = client().rpc(name, args);
    const startup = ['classroom_bootstrap', 'classroom_state', 'classroom_lesson', 'classroom_review_state', 'classroom_review_context'].includes(name) ||
      (page === 'dashboard' && name === 'classroom_lab_state');
    const controller = startup ? new AbortController() : null;
    const task = controller && typeof request.abortSignal === 'function' ? request.abortSignal(controller.signal) : request;
    const result = await (controller ? portalDeadline(task, timeout, 'CLASSROOM_STATE_TIMEOUT', () => controller.abort()) : task);
    if (result.error) throw result.error;
    return result.data;
  } });
}

// Capability detection belongs to one document. Only the precise missing-RPC
// errors enable the older backend fallback; auth/network errors never do.
export function createClassroomBootstrap(rpc: RPC) {
  let available = true;
  return { async load(parameters: Parameters): Promise<{ bundle: Bundle | null; state: unknown }> {
    let bundle: Bundle | null = null;
    if (available) {
      try {
        const value = await rpc('classroom_bootstrap', parameters);
        const state = value && typeof value === 'object' ? (value as Record<string, unknown>).state : null;
        if (!state || typeof state !== 'object' || !Array.isArray((state as State).memberships) ||
          !Array.isArray((state as State).results)) throw Error('INVALID_BOOTSTRAP_RESPONSE');
        bundle = value as Bundle;
      } catch (error) {
        if (!portalMissingBootstrap(error)) throw error;
        available = false;
      }
    }
    return { bundle, state: bundle ? bundle.state : await rpc('classroom_state') };
  } };
}
