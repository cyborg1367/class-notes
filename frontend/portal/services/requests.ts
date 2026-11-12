export type RPCArguments = Record<string, unknown>;
export type RPC = (name: string, args?: RPCArguments) => Promise<unknown>;
type Timing = { name: string; ms: number; error: boolean; shared: boolean };
type Metrics = { requests: number; shared: number; errors: number; total_ms: number; max_ms: number };
type Options = { request(name: string, args: RPCArguments): unknown; clock?: () => number; limit?: number };

// Coalesce only simultaneous allowlisted reads. Completed data, drafts, access
// grants and grading responses are never cached here.
export function portalCreateReadCoordinator({ request, clock = () => Date.now(), limit = 120 }: Options) {
  const reads = new Set(['classroom_bootstrap', 'classroom_state', 'classroom_lesson', 'classroom_lab_state', 'classroom_review_summary']);
  const pending = new Map<string, Promise<unknown>>(), events: Timing[] = [];
  let generation = 0;
  function record(name: string, start: number, error = false, shared = false) {
    events.push({ name, ms: Math.max(0, clock() - start), error, shared });
    if (events.length > limit) events.shift();
  }
  const call: RPC = (name, args = {}) => {
    const start = clock(), epoch = generation, read = reads.has(name);
    const key = read ? JSON.stringify([name, Object.keys(args).sort().map(key => [key, args[key]])]) : '';
    const existing = read ? pending.get(key) : undefined;
    if (existing) { record(name, start, false, true); return existing; }
    if (!read) pending.clear();
    const task = Promise.resolve().then(() => {
      if (epoch !== generation) throw Error('ACCOUNT_CHANGED');
      return request(name, args);
    }).then(value => {
      if (epoch !== generation) throw Error('ACCOUNT_CHANGED');
      record(name, start); return value;
    }, error => { if (epoch === generation) record(name, start, true); throw error; });
    if (read) {
      pending.set(key, task);
      const clear = () => { if (pending.get(key) === task) pending.delete(key); };
      void task.then(clear, clear);
    }
    return task;
  };
  return {
    call,
    reset() { generation++; pending.clear(); events.length = 0; },
    snapshot() { return events.map(event => ({ ...event })); },
    report() {
      const groups: Record<string, Metrics> = Object.create(null);
      for (const event of events) {
        const row = groups[event.name] ||= { requests: 0, shared: 0, errors: 0, total_ms: 0, max_ms: 0 };
        if (event.shared) { row.shared++; continue; }
        row.requests++; row.errors += Number(event.error); row.total_ms += event.ms; row.max_ms = Math.max(row.max_ms, event.ms);
      }
      return Object.fromEntries(Object.entries(groups).map(([name, row]) => [name,
        { ...row, average_ms: row.requests ? row.total_ms / row.requests : 0 }]));
    },
  };
}
