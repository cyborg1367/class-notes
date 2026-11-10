// Shared notification data helpers. UI lives in frontend/notifications.
export function noticeURL(path, baseURL) {
    if (typeof path !== 'string' || !/^(?:[a-z0-9]+(?:-[a-z0-9]+)*\/)+$/.test(path))
        return null;
    try {
        const base = new URL(baseURL), url = new URL(path, base);
        return url.origin === base.origin && url.pathname.startsWith(base.pathname) ? url.href : null;
    }
    catch {
        return null;
    }
}
export function validNotice(item, baseURL) { return !!item && ['lab', 'review', 'content', 'access'].includes(item.kind) && typeof item.id === 'string' && typeof item.episode === 'string' && !!noticeURL(item.path, baseURL); }
export function noticeKey(item) { return item.id + ':' + item.episode; }
export function mergeNotices(current, next) {
    const map = new Map(current.map(item => [noticeKey(item), item]));
    for (const item of next) map.set(noticeKey(item), item);
    return [...map.values()];
}
