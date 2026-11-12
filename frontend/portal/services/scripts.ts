export function portalCreateScriptLoader(doc: Pick<Document, 'createElement' | 'head'>, timeout = 10_000) {
  const pending = new Map<string, Promise<void>>();
  return (src: string | URL): Promise<void> => {
    const key = String(src), existing = pending.get(key);
    if (existing) return existing;
    const script = doc.createElement('script'); script.src = key;
    let resolve!: () => void, reject!: (error: unknown) => void, finished = false;
    const task = new Promise<void>((yes, no) => { resolve = yes; reject = no; });
    pending.set(key, task);
    const timer = setTimeout(() => finish(Error('SCRIPT_TIMEOUT')), timeout);
    function finish(error?: unknown) {
      if (finished) return;
      finished = true; clearTimeout(timer); script.onload = null; script.onerror = null;
      if (!error) { resolve(); return; }
      if (pending.get(key) === task) pending.delete(key);
      script.remove(); reject(error);
    }
    script.onload = () => finish();
    script.onerror = () => finish(Error('SCRIPT_UNAVAILABLE'));
    try { doc.head.append(script); } catch (error) { finish(error); }
    return task;
  };
}
