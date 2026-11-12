export function portalAbortable<T>(task: PromiseLike<T>, signal?: AbortSignal): PromiseLike<T> {
  if (!signal) return task;
  return new Promise<T>((resolve, reject) => {
    let done = false;
    const finish = (ok: boolean, value: T | Error) => {
      if (done) return;
      done = true;
      signal.removeEventListener('abort', abort);
      if (ok) resolve(value as T); else reject(value);
    };
    const abort = () => { const error = Error('Aborted'); error.name = 'AbortError'; finish(false, error); };
    signal.addEventListener('abort', abort, { once: true });
    Promise.resolve(task).then(value => finish(true, value), error => finish(false, error));
    if (signal.aborted) abort();
  });
}

export function portalDeadline<T>(task: PromiseLike<T>, ms: number, code: string, onTimeout?: () => void): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => { reject(Error(code)); onTimeout?.(); }, ms);
  });
  return Promise.race([task, timeout]).finally(() => clearTimeout(timer));
}
