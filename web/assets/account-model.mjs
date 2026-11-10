export function accountIdentity(user) {
  const metadata = user?.user_metadata || {};
  const email = String(user?.email || '').slice(0, 254);
  const name = String(metadata.full_name || metadata.name || email.split('@')[0] || 'کاربر').trim().slice(0, 120) || 'کاربر';
  let avatar = '';
  try {
    const url = new URL(metadata.avatar_url || metadata.picture);
    if (url.protocol === 'https:' && !url.username && !url.password) avatar = url.href;
  } catch { /* An invalid avatar is replaced by the text initial. */ }
  return { name, email, initial: Array.from(name)[0], avatar };
}

export function initialAccountView(links) {
  return {
    phase: 'loading', identity: null, busy: null, teacher: false, links,
    continueURL: links.dashboard, notice: { text: 'در حال بررسی ورود…', error: false },
    openMenuId: null, focusEdge: 'first', dialog: null, focusTarget: null, focusRevision: 0,
  };
}

export function accountPresentation(input) {
  const phase = !input.ready ? 'loading' : input.user ? 'authenticated' : input.error ? 'error' : 'guest';
  return {
    phase,
    identity: phase === 'authenticated' ? accountIdentity(input.user) : null,
    teacher: phase === 'authenticated' && Boolean(input.teacher),
    busy: input.busy === 'in' || input.busy === 'out' ? input.busy : null,
  };
}

export function accountContinueURL(value, links, documentURL) {
  const fallback = new URL(links.dashboard, documentURL).href;
  try {
    if (!value) return fallback;
    const base = new URL('../', new URL(links.account, documentURL));
    const url = new URL(value, base), pathname = decodeURIComponent(url.pathname);
    const account = base.pathname + 'account';
    if (url.origin !== base.origin || url.username || url.password || !pathname.startsWith(base.pathname)
      || /(?:^|\/)\.{1,2}(?:\/|$)|\\/.test(pathname) || pathname === account || pathname.startsWith(account + '/')) return fallback;
    return url.href;
  } catch { return fallback; }
}

export function accountMenuPosition(rect, viewport, naturalHeight = 360) {
  const margin = 12, gap = 10;
  const width = Math.min(272, Math.max(0, viewport.width - margin * 2));
  const left = Math.max(margin, Math.min(rect.right - width, viewport.width - width - margin));
  const below = Math.max(0, viewport.height - rect.bottom - gap - margin);
  const above = Math.max(0, rect.top - gap - margin);
  const useAbove = below < Math.min(140, naturalHeight) && above > below;
  const maxHeight = useAbove ? above : below;
  return { width, left, maxHeight, top: useAbove ? Math.max(margin, rect.top - gap - Math.min(naturalHeight, above)) : rect.bottom + gap };
}
