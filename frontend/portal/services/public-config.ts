export function portalCreatePublicConfigLoader<T>(fetchJSON: (url: string) => PromiseLike<T>) {
  const values = new Map<string, Promise<T>>();
  return (url: string | URL): Promise<T> => {
    const key = String(url), existing = values.get(key);
    if (existing) return existing;
    const task = Promise.resolve().then(() => fetchJSON(key));
    values.set(key, task);
    void task.catch(() => { if (values.get(key) === task) values.delete(key); });
    return task;
  };
}

// Only public, fingerprinted configuration uses a document-local result cache.
export function createPublicConfiguration(fetchJSON: typeof fetch, timeout = 10_000) {
  return portalCreatePublicConfigLoader(async href => {
    const controller = new AbortController(), timer = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetchJSON(href, { cache: 'no-cache', credentials: 'same-origin', signal: controller.signal });
      if (!response.ok) throw Error('PUBLIC_CONFIG_UNAVAILABLE');
      return await response.json() as unknown;
    } catch (error) {
      if (controller.signal.aborted) throw Error('PUBLIC_CONFIG_TIMEOUT');
      throw error;
    } finally { clearTimeout(timer); }
  });
}
