import type { ReaderOptions } from './contracts';
import { downloadTypes, imageTypes, isCourseObject, predictionImageAlias } from './paths';

const mediaTypes: Record<string, string> = {
  svg: 'image/svg+xml', png: 'image/png', webp: 'image/webp', jpg: 'image/jpeg',
  jpeg: 'image/jpeg', gif: 'image/gif', avif: 'image/avif', js: 'text/javascript',
  pdf: 'application/pdf', ipynb: 'application/x-ipynb+json', csv: 'text/csv',
};
function missing(error: unknown) {
  if (!error || typeof error !== 'object') return false;
  return ['status', 'statusCode'].some(key => key in error && String((error as Record<string, unknown>)[key]) === '404') ||
    ('code' in error && ['404', 'not_found', 'NoSuchKey'].includes(String(error.code))) ||
    ('message' in error && /\bobject not found\b/i.test(String(error.message)));
}

export function createReaderResources(win: Window & typeof globalThis, options: ReaderOptions) {
  const abort = new win.AbortController();
  const requests = new Map<string, Promise<string>>();
  const urls = new Set<string>();
  const alive = () => !abort.signal.aborted && options.current();

  function load(path: string) {
    if (!alive()) return Promise.reject(Error('READER_CLOSED'));
    if (!isCourseObject(path, options.info.course.id, [...imageTypes, ...downloadTypes, '.js'])) return Promise.reject(Error('INVALID_LESSON_RESOURCE'));
    const existing = requests.get(path);
    if (existing) return existing;
    const task = (async () => {
      let data: Blob;
      try { data = await options.getFile(path, abort.signal); }
      catch (error) {
        const alias = predictionImageAlias(path);
        if (!alive() || !alias || !missing(error)) throw error;
        data = await options.getFile(alias, abort.signal);
      }
      if (!alive()) throw Error('READER_CLOSED');
      const extension = path.split('.').pop()?.toLowerCase() || '';
      const type = mediaTypes[extension] || data.type;
      const objectURL = win.URL.createObjectURL(type ? new win.Blob([data], { type }) : data);
      urls.add(objectURL);
      return objectURL;
    })();
    requests.set(path, task);
    void task.catch(() => { if (requests.get(path) === task) requests.delete(path); });
    return task;
  }
  function dispose() {
    abort.abort();
    for (const url of urls) win.URL.revokeObjectURL(url);
    urls.clear();
    requests.clear();
  }
  return { load, dispose, alive };
}
export type ReaderResources = ReturnType<typeof createReaderResources>;
