type Action = () => void | PromiseLike<void>;
type Options = {
  routes: Record<string, Action | undefined>;
  before?: Action;
  after?: Action;
  cleanups: readonly (() => void)[];
};

// One document owns its route adapters. Account reset invalidates a pending
// mount before disposal, so an old identity cannot attach the next surface.
export function createPageLifecycle(options: Options) {
  let generation = 0;
  return {
    async mount(page: string) {
      const ticket = generation;
      await options.before?.();
      if (ticket !== generation) return;
      await options.routes[page]?.();
      if (ticket !== generation) return;
      await options.after?.();
    },
    reset() {
      generation++;
      let failure: unknown;
      for (const cleanup of options.cleanups) {
        try { cleanup(); } catch (error) { failure ??= error; }
      }
      if (failure !== undefined) throw failure;
    },
  };
}
