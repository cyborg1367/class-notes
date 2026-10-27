const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const icon = paths => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const userIcon = icon('<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2Z"/>');
const exitIcon = icon('<path d="M9 4H4v16h5m6-13 5 5-5 5m-7-5h12"/>');
const dashboardIcon = icon('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>');
const chevron = icon('<path d="m7 10 5 5 5-5"/>');
const google = '<svg class="account-google-mark" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.33 2.98-7.36Z"/><path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.42l-3.24-2.51c-.9.6-2.05.97-3.38.97-2.61 0-4.83-1.76-5.62-4.12H3.04v2.59A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.38 13.92A6 6 0 0 1 6.06 12c0-.67.11-1.32.32-1.92V7.49H3.04A10 10 0 0 0 2 12c0 1.61.39 3.14 1.04 4.51l3.34-2.59Z"/><path fill="#EA4335" d="M12 5.96c1.47 0 2.79.5 3.82 1.49l2.86-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.96 5.49l3.34 2.59A5.96 5.96 0 0 1 12 5.96Z"/></svg>';
export function accountIdentity(user) {
    const metadata = user?.user_metadata || {}, email = String(user?.email || '').slice(0, 254);
    const name = String(metadata.full_name || metadata.name || email.split('@')[0] || 'کاربر').trim().slice(0, 120) || 'کاربر';
    let avatar = '';
    try {
        const value = new URL(metadata.avatar_url || metadata.picture);
        if (value.protocol === 'https:' && !value.username && !value.password)
            avatar = value.href;
    }
    catch { }
    return { name, email, initial: Array.from(name)[0], avatar };
}
export function accountMarkup({ user, ready, error, busy, teacher }, urls, id, compact = false) {
    if (!ready)
        return '<span class="account-placeholder" role="status" aria-label="در حال بررسی حساب"><span></span></span>';
    if (error && !user)
        return `<a class="account-fallback" href="${escape(urls.account)}">حساب کاربری</a>`;
    if (!user)
        return `<button class="account-signin" type="button" data-account-signin ${busy ? 'disabled' : ''} aria-label="ورود با Google">${google}<span class="account-signin-full">ورود با <bdi lang="en">Google</bdi></span><span class="account-signin-short" aria-hidden="true">ورود</span></button>`;
    const person = accountIdentity(user), photo = person.avatar ? `<img src="${escape(person.avatar)}" referrerpolicy="no-referrer" alt="" decoding="async">` : '';
    return `${compact ? '' : `<a class="account-dashboard" href="${escape(urls.dashboard)}">داشبورد من</a>`}<span data-notification-anchor></span><button class="account-trigger" type="button" data-account-trigger aria-label="منوی حساب ${escape(person.name)}" aria-haspopup="menu" aria-expanded="false" aria-controls="${id}" ${busy ? 'disabled' : ''}><span class="account-avatar" aria-hidden="true"><span>${escape(person.initial)}</span>${photo}</span><span class="account-trigger-name">${escape(person.name.split(/\s+/)[0])}</span>${chevron}</button>
 <section class="account-popover" id="${id}" aria-label="حساب کاربری" hidden><div class="account-person"><strong dir="auto">${escape(person.name)}</strong><bdi dir="ltr">${escape(person.email)}</bdi></div><div class="account-menu-items" role="menu" aria-label="عملیات حساب"><a class="account-menu-dashboard" role="menuitem" tabindex="-1" href="${escape(urls.dashboard)}">${dashboardIcon}داشبورد من</a><a role="menuitem" tabindex="-1" href="${escape(urls.account)}">${userIcon}حساب کاربری</a>${urls.review ? `<a role="menuitem" tabindex="-1" href="${escape(urls.review)}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M3 5c4-2 6-1 9 1 3-2 5-3 9-1v15c-4-2-6-1-9 1-3-2-5-3-9-1ZM12 6v15"/></svg>دفتر مرور شخصی</a>` : ''}${teacher ? `<a role="menuitem" tabindex="-1" href="${escape(urls.teacher)}">${dashboardIcon}پنل مدرس</a>` : ''}<button class="account-exit" type="button" role="menuitem" tabindex="-1" data-account-signout ${busy ? 'disabled' : ''}>${exitIcon}<span>${busy === 'out' ? 'در حال خروج…' : 'خروج از حساب'}</span></button></div></section>`;
}
export async function saveBeforeSignOut({ save, confirm, isCurrent, signOut, timeout = 8000 }) {
    let timer, result;
    try {
        result = await Promise.race([Promise.resolve().then(save), new Promise(resolve => { timer = setTimeout(() => resolve({ saved: false }), timeout); })]);
    }
    catch {
        result = { saved: false };
    }
    finally {
        clearTimeout(timer);
    }
    if (!isCurrent())
        return false;
    if (result?.saved === false && !await confirm(result))
        return false;
    if (!isCurrent())
        return false;
    const { error } = await signOut();
    if (error)
        throw error;
    return true;
}
export function mountAccountUI({ doc = document, win = window, urls, onSignIn, onSignOut }) {
    let state = { user: null, ready: false, error: false, busy: false, teacher: false }, active = null, serial = 0, dialog = null, signature = '';
    const roots = new Map(), hero = doc.querySelector('[data-home-account]');
    function items(menu) { return [...menu.querySelectorAll('[role="menuitem"]')].filter(el => !el.disabled && win.getComputedStyle(el).display !== 'none'); }
    function place() { if (!active)
        return; const { root, menu } = active, rect = root.querySelector('[data-account-trigger]').getBoundingClientRect(), width = Math.min(272, win.innerWidth - 24); menu.style.width = width + 'px'; menu.style.left = Math.max(12, Math.min(rect.right - width, win.innerWidth - width - 12)) + 'px'; menu.style.top = (rect.bottom + 10) + 'px'; menu.style.maxHeight = Math.max(140, win.innerHeight - rect.bottom - 24) + 'px'; }
    function close(focus = false) { if (!active)
        return; const { root, menu } = active; active = null; menu.hidden = true; const trigger = root.querySelector('[data-account-trigger]'); trigger?.setAttribute('aria-expanded', 'false'); if (focus)
        trigger?.focus(); }
    function open(root, last = false) { close(); doc.dispatchEvent(new win.CustomEvent('classroom-panel-open',{detail:{kind:'account'}})); const menu = root.querySelector('.account-popover'); if (!menu)
        return; menu.hidden = false; root.querySelector('[data-account-trigger]').setAttribute('aria-expanded', 'true'); active = { root, menu }; place(); const list = items(menu); (last ? list.at(-1) : list[0])?.focus(); }
    function render(root) { const { id, compact } = roots.get(root); root.dataset.authState = !state.ready ? 'loading' : state.user ? 'member' : state.error ? 'error' : 'guest'; root.setAttribute('aria-busy', String(!state.ready || !!state.busy)); root.innerHTML = accountMarkup(state, urls, id, compact); root.querySelector('.account-avatar img')?.addEventListener('error', event => event.currentTarget.remove(), { once: true }); }
    function attach(anchor, { compact = false } = {}) { const existing = [...roots.keys()].find(root => root.parentElement === anchor); if (existing)
        return existing; const root = doc.createElement('div'); root.className = 'account-controls' + (compact ? ' account-controls-compact' : ''); root.dir = 'rtl'; roots.set(root, { id: 'account-menu-' + (++serial), compact }); anchor.append(root); render(root); return root; }
    const header = doc.querySelector('.portal-nav');
    if (header) {
        header.querySelector('[data-account-link]')?.remove();
        header.querySelectorAll('[data-teacher-link]').forEach(el => el.remove());
        attach(header);
    }
    function update(next) { state = { ...state, ...next }; const nextSignature = JSON.stringify([state.user?.id, state.user ? accountIdentity(state.user) : null, state.ready, state.error, state.busy, state.teacher]); if (nextSignature === signature)
        return; signature = nextSignature; close(); for (const root of roots.keys()) {
        if (!root.isConnected) {
            roots.delete(root);
            continue;
        }
        render(root);
    } if (hero) {
        hero.innerHTML = !state.ready ? 'حساب کاربری' : state.user ? 'رفتن به داشبورد' : state.error ? 'حساب کاربری' : `${google}<span>ورود با <bdi lang="en">Google</bdi></span>`;
        hero.href = state.user ? urls.dashboard : urls.account;
        hero.setAttribute('aria-disabled', String(!state.ready || !!state.busy));
    } }
    function click(event) { const target = event.target.closest?.('[data-account-trigger], [data-account-signin], [data-account-signout], [data-home-account], [data-signin], [data-signout], [data-login-link]'); if (target) {
        if (target.matches('[data-account-trigger]')) {
            event.preventDefault();
            if (state.busy)
                return;
            const root = target.closest('.account-controls');
            if (active?.root === root)
                close();
            else
                open(root);
            return;
        }
        if (target.matches('[data-home-account]') && state.user && !state.busy)
            return;
        if (!state.ready || state.busy) {
            event.preventDefault();
            return;
        }
        if (state.error && !state.user && !target.matches('[data-signout],[data-account-signout]'))
            return;
        event.preventDefault();
        if (target.matches('[data-signout],[data-account-signout]'))
            void onSignOut();
        else
            void onSignIn(target);
        return;
    } if (active && !active.root.contains(event.target))
        close(); }
    function keydown(event) { const trigger = event.target.closest?.('[data-account-trigger]'); if (trigger && ['ArrowDown', 'ArrowUp'].includes(event.key)) {
        event.preventDefault();
        if (!state.busy)
            open(trigger.closest('.account-controls'), event.key === 'ArrowUp');
        return;
    } if (!active || !active.root.contains(event.target))
        return; if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        close(true);
        return;
    } if (event.key === 'Tab') {
        close(true);
        return;
    } const list = items(active.menu), index = list.indexOf(doc.activeElement); let next; if (event.key === 'ArrowDown')
        next = (index + 1) % list.length; if (event.key === 'ArrowUp')
        next = (index - 1 + list.length) % list.length; if (event.key === 'Home')
        next = 0; if (event.key === 'End')
        next = list.length - 1; if (next !== undefined) {
        event.preventDefault();
        list[next]?.focus();
    } }
    function focusin(event) { if (active && !active.root.contains(event.target))
        close(); }
    function otherPanel(event){if(event.detail?.kind!=='account')close();}
    doc.addEventListener('classroom-panel-open',otherPanel);
    doc.addEventListener('click', click);
    doc.addEventListener('keydown', keydown);
    doc.addEventListener('focusin', focusin);
    win.addEventListener('resize', place);
    win.addEventListener('scroll', place, true);
    function confirmUnsaved(result) { close(); if (dialog)
        return Promise.resolve(false); const node = doc.createElement('dialog'); node.className = 'account-exit-dialog'; node.dir = 'rtl'; node.setAttribute('aria-labelledby', 'account-exit-title'); node.setAttribute('aria-describedby', 'account-exit-description'); node.innerHTML = `<h2 id="account-exit-title">پیش‌نویس هنوز در حساب ذخیره نشده</h2><p id="account-exit-description">${result.localSaved ? 'نسخهٔ این مرورگر حفظ شده است. برای دسترسی از دستگاه دیگر، ابتدا ذخیره در حساب را کامل کن.' : 'پیش از خروج، کد یا پاسخ‌های فعلی را نزد خودت نگه دار.'}</p><div><button type="button" class="button-forest" data-stay>بازگشت و بررسی ذخیره</button><button type="button" class="button-outline" data-leave>خروج از حساب</button></div>`; doc.body.append(node); dialog = node; if (typeof node.showModal !== 'function') {
        const result = win.confirm(node.textContent);
        node.remove();
        dialog = null;
        return Promise.resolve(result);
    } return new Promise(resolve => { function finish(value) { node.close(); node.remove(); dialog = null; resolve(value); } node.querySelector('[data-stay]').onclick = () => finish(false); node.querySelector('[data-leave]').onclick = () => finish(true); node.addEventListener('cancel', event => { event.preventDefault(); finish(false); }); node.showModal(); node.querySelector('[data-stay]').focus(); }); }
    update({});
    return { update, attach, close, confirmUnsaved, focusAccount() { const all = [...roots.keys()]; const root = doc.body.classList.contains('lab-notebook-ready') ? all.find(root => roots.get(root).compact) || all[0] : all[0]; root?.querySelector('[data-account-trigger],[data-account-signin],a')?.focus(); }, dispose() { close(); dialog?.close(); dialog?.remove(); for (const root of roots.keys())
            root.remove(); roots.clear(); doc.removeEventListener('classroom-panel-open',otherPanel); doc.removeEventListener('click', click); doc.removeEventListener('keydown', keydown); doc.removeEventListener('focusin', focusin); win.removeEventListener('resize', place); win.removeEventListener('scroll', place, true); } };
}
