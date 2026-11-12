export type PublicConfiguration = { supabaseUrl: string; publishableKey: string };

export function portalConfig(value: unknown): value is PublicConfiguration {
  if (!value || typeof value !== 'object') return false;
  const config = value as Record<string, unknown>;
  if (typeof config.supabaseUrl !== 'string' || typeof config.publishableKey !== 'string') return false;
  try {
    const url = new URL(config.supabaseUrl);
    return url.protocol === 'https:' && !url.username && !url.password && !url.search && !url.hash &&
      url.pathname === '/' && /^sb_publishable_[\w-]+$/.test(config.publishableKey);
  } catch { return false; }
}

export function portalLabEndpoint(value: string, projectURL: string): URL {
  const endpoint = new URL(value), project = new URL(projectURL);
  if (endpoint.protocol !== 'https:' || endpoint.origin !== project.origin ||
    endpoint.pathname !== '/functions/v1/classroom-lab/check' || endpoint.username || endpoint.password ||
    endpoint.search || endpoint.hash) throw Error('INVALID_LAB_ENDPOINT');
  return endpoint;
}

export function portalReturn(value: string | null | undefined, base: URL): string {
  const fallback = new URL('dashboard/', base).href;
  try {
    if (!value) return fallback;
    const url = new URL(value, base), path = decodeURIComponent(url.pathname);
    if (url.origin !== base.origin || url.username || url.password || !path.startsWith(base.pathname) ||
      /(?:^|\/)\.{1,2}(?:\/|$)|\\/.test(path) || path === base.pathname + 'account' ||
      path.startsWith(base.pathname + 'account/')) return fallback;
    return url.href;
  } catch { return fallback; }
}
