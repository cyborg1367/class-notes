const segments = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
export function isCourseObject(path: unknown, course: string, extensions: string[]): path is string {
  if (typeof path !== 'string' || !path.startsWith(course + '/')) return false;
  return path.split('/').every(part => segments.test(part) && part !== '.' && part !== '..') &&
    extensions.some(extension => path.toLowerCase().endsWith(extension));
}
export const imageTypes = ['.svg', '.png', '.webp', '.jpg', '.jpeg', '.gif', '.avif'];
export const downloadTypes = ['.pdf', '.ipynb', '.csv', '.tsv', '.zip', '.txt', '.py', '.json'];
export function predictionImageAlias(path: string) {
  return /^machine-learning\/prediction\/medical-(space|k1-detail|k3(?:-detail)?)\.svg$/.test(path)
    ? path.replace('/prediction/', '/predictions/') : null;
}

export function lessonLink(raw: string, page: URL, base: URL, asset = false) {
  if (raw.startsWith('#')) return asset ? null : raw;
  try {
    const url = new URL(raw, page);
    if (url.username || url.password || !['http:', 'https:'].includes(url.protocol)) return null;
    const pathname = decodeURIComponent(url.pathname);
    if (/[\\\u0000-\u001f]/.test(pathname) || pathname.split('/').includes('..')) return null;
    if (url.origin === base.origin) {
      if (!pathname.startsWith(base.pathname)) return null;
      return !asset || pathname.startsWith(new URL('assets/', base).pathname) ? url.href : null;
    }
    return !asset && url.protocol === 'https:' ? url.href : null;
  } catch { return null; }
}

export function localFragment(fragment: string, doc: Document) {
  const current = new URL(doc.location.href), base = new URL(doc.baseURI);
  return current.origin === base.origin && current.pathname === base.pathname && current.search === base.search
    ? fragment : current.pathname + current.search + fragment;
}
