const {paperIcon}=await import(new URL('./paper-icons.mjs'+new URL(import.meta.url).search,import.meta.url));
// In-site notices only. This module never awards XP, submits coursework or
// requests browser notification permission. No inbox payload is stored locally.
const E = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fa = n => Number(n).toLocaleString('fa-IR');
const digits = s => String(s).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);
const icons = Object.fromEntries(Object.entries({bell:'bell',lab:'lab',review:'review',content:'book',access:'check',gear:'gear',clock:'clock',check:'check',close:'close'}).map(([name,key])=>[name,paperIcon(key)]));
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
export function mergeNotices(current, next) { const map = new Map(current.map(i => [i.id, i])); for (const item of next)
    map.set(item.id, item); return [...map.values()]; }
let serial = 0;
export function mountNotifications({ doc = document, win = window, rpc, userId, baseURL, isCurrent = () => true, onNavigate, requestTimeout = 12000, refreshInterval = 300000 }) {
    let disposed = false, authBusy = false, mutating = false, active = null, model = null, error = '', lastFetch = 0, ticket = 0, pendingRead = null, pageHost = null, pageItems = [], pageCursor = null, pageSnapshot = null, pageUnread = false, pageTicket = 0, pageError = '', pageLoaded = false, settings = null, settingsRevision = null, channel = null, refreshTimer = null;
    const hosts = new Map(), cancels = new Set(), panelId = 'class-notice-panel-' + (++serial), alive = () => !disposed && isCurrent();
    const panel = doc.createElement('section');
    panel.className = 'notice-panel';
    panel.id = panelId;
    panel.dir = 'rtl';
    panel.hidden = true;
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-labelledby', panelId + '-title');
    doc.body.append(panel);
    const live = doc.createElement('p');
    live.className = 'sr-only';
    live.setAttribute('role', 'status');
    live.setAttribute('aria-live', 'polite');
    doc.body.append(live);
    const notify = text => { if (alive())
        live.textContent = text; };
    const date = v => v ? new Date(v).toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' }) : '';
    function time(v) { if (!v)
        return ''; const a = new Date(v), b = new Date(); if (a.toDateString() === b.toDateString())
        return 'امروز'; b.setDate(b.getDate() - 1); return a.toDateString() === b.toDateString() ? 'دیروز' : date(v); }
    function failure(e) { const m = String(e?.message || ''); return /NOTICE_CHANGED/.test(m) ? 'این اعلان تغییر کرده است؛ فهرست را به‌روز کن.' : /NOTICE_SETTINGS_CONFLICT/.test(m) ? 'تنظیمات در پنجرهٔ دیگری تغییر کرده است؛ انتخاب‌های تو حفظ شده‌اند.' : /PGRST202|does not exist/.test(m) ? 'مرکز اعلان‌ها هنوز روی سرور فعال نشده است.' : 'دریافت یا ثبت اعلان‌ها کامل نشد. دوباره تلاش کن.'; }
    function bounded(name, args = {}) {
        if (!alive())
            return Promise.reject(Error('ACCOUNT_CHANGED'));
        return new Promise((resolve, reject) => {
            let done = false;
            const timer = win.setTimeout(() => end(false, Error('NOTICE_TIMEOUT')), requestTimeout);
            const cancel = () => end(false, Error('ACCOUNT_CHANGED'));
            cancels.add(cancel);
            function end(ok, value) { if (done)
                return; done = true; win.clearTimeout(timer); cancels.delete(cancel); ok ? resolve(value) : reject(value); }
            Promise.resolve().then(() => rpc(name, args)).then(v => end(true, v), e => end(false, e));
        });
    }
    function announceChange() { try {
        channel?.postMessage({ type: 'changed', owner: userId });
    }
    catch { } }
    function place() {
        if (!active || panel.hidden)
            return;
        if (!active.isConnected) {
            close();
            return;
        }
        const r = active.querySelector('button').getBoundingClientRect(), w = Math.min(430, win.innerWidth - 24), left = Math.max(12, Math.min(r.left - w * .25, win.innerWidth - w - 12)), top = r.bottom + 11;
        panel.style.width = w + 'px';
        panel.style.left = left + 'px';
        panel.style.top = top + 'px';
        panel.style.maxHeight = Math.max(80, win.innerHeight - top - 12) + 'px';
        panel.style.setProperty('--notice-pointer', Math.max(18, Math.min(w - 24, r.left + r.width / 2 - left)) + 'px');
    }
    function close(focus = false) { const old = active; active = null; panel.hidden = true; for (const host of hosts.values())
        host.querySelector('button').setAttribute('aria-expanded', 'false'); if (focus)
        old?.querySelector('button')?.focus(); }
    function attach(anchor) {
        if (!alive() || !anchor)
            return;
        for (const [a, h] of hosts)
            if (!a.isConnected) {
                if (active === h)
                    close();
                h.remove();
                hosts.delete(a);
            }
        if (hosts.has(anchor))
            return;
        const host = doc.createElement('span');
        host.className = 'notice-host';
        host.innerHTML = `<button type="button" class="notice-trigger" aria-label="اعلان‌ها" aria-expanded="false" aria-controls="${panelId}">${icons.bell}<span class="notice-dot" hidden aria-hidden="true"></span></button>`;
        anchor.append(host);
        hosts.set(anchor, host);
        host.querySelector('button').onclick = () => { if (authBusy || !alive())
            return; if (active === host) {
            close();
            return;
        } close(); active = host; doc.dispatchEvent(new win.CustomEvent('classroom-panel-open', { detail: { kind: 'notifications' } })); panel.hidden = false; host.querySelector('button').setAttribute('aria-expanded', 'true'); renderPanel(); place(); panel.querySelector('h2')?.focus(); void refresh(true); };
        paintTriggers();
    }
    function paintTriggers() { for (const host of hosts.values()) {
        const b = host.querySelector('button'), dot = host.querySelector('.notice-dot');
        dot.hidden = !model?.unread_count;
        b.disabled = authBusy;
        b.setAttribute('aria-label', model ? 'اعلان‌ها؛ ' + fa(model.unread_count) + ' خوانده‌نشده' + (error ? '؛ وضعیت ممکن است قدیمی باشد' : '') : 'اعلان‌ها' + (error ? '؛ دریافت کامل نشد' : ''));
        b.setAttribute('aria-busy', String(!model && !error));
    } }
    function rows(items) {
        return items.map(i => {
            const sleeping = i.snoozed_until && Date.parse(i.snoozed_until) > Date.now(), unread = !i.read_at && i.active && !sleeping;
            return `<article class="notice-item" data-kind="${E(i.kind)}" data-read="${!unread}" data-active="${i.active}"><span class="notice-type-icon">${icons[i.kind]}</span><div class="notice-copy"><div class="notice-item-heading"><h3>${E(digits(i.title))}${unread ? '<span class="notice-unread" aria-label="خوانده‌نشده"></span>' : ''}</h3><time datetime="${E(i.occurred_at)}">${E(time(i.occurred_at))}</time></div><p>${E(digits(i.description))}</p>${!i.active ? '<p class="notice-resolved">این یادآوری اکنون فعال نیست.</p>' : sleeping ? '<p class="notice-resolved">یادآوری دوباره: ' + E(date(i.snoozed_until)) + '</p>' : ''}<div class="notice-item-actions"><a data-notice-open="${E(i.id)}" data-notice-focus="open:${E(i.id)}" href="${E(noticeURL(i.path, baseURL))}">${E(i.active ? i.action : 'مشاهده')} <span aria-hidden="true">←</span></a>${unread ? '<button type="button" class="notice-read-one" data-read-one="' + E(i.id) + '" data-notice-focus="read:' + E(i.id) + '" aria-label="خواندم: ' + E(i.title) + '" title="خواندم">' + icons.check + '</button>' : ''}${i.active && !sleeping && ['lab', 'review'].includes(i.kind) ? `<details class="notice-later"><summary aria-label="یادآوری مجدد برای ${E(i.title)}">${icons.clock}<span>بعداً</span></summary><div>${[1, 3, 7].map(d => `<button type="button" data-snooze="${E(i.id)}" data-days="${d}">${fa(d)} روز دیگر</button>`).join('')}</div></details>` : ''}</div></div></article>`;
        }).join('');
    }
    function preserveRender(container, html) { const focused = container.contains(doc.activeElement), key = doc.activeElement?.getAttribute?.('data-notice-focus'); container.innerHTML = html; if (focused) {
        const same = [...container.querySelectorAll('[data-notice-focus]')].find(e => e.getAttribute('data-notice-focus') === key);
        (same || container.querySelector('h2,h1'))?.focus?.({ preventScroll: true });
    } }
    function renderPanel() {
        if (!alive())
            return;
        const html = `<header class="notice-panel-head"><h2 id="${panelId}-title" tabindex="-1">اعلان‌ها</h2><button type="button" data-read-all ${!model?.unread_count ? 'disabled' : ''}>همه را خواندم</button></header><div class="notice-panel-body">${error ? '<div class="notice-error" role="status"><p>' + E(error) + '</p><button type="button" data-notice-retry>تلاش دوباره</button></div>' : ''}${!model && !error ? '<p class="notice-empty" role="status">در حال دریافت اعلان‌ها…</p>' : model?.items.length ? rows(model.items) : model ? '<div class="notice-empty"><strong>اعلان تازه‌ای نداری.</strong><p>خبرهای کلاس و یادآوری‌های مناسب اینجا نمایش داده می‌شوند.</p></div>' : ''}</div><footer class="notice-panel-footer"><a href="${E(new URL('notifications/', baseURL).href)}">مشاهدهٔ همهٔ اعلان‌ها ←</a><button type="button" data-notice-settings ${!model ? 'disabled' : ''}>${icons.gear} تنظیمات</button></footer>`;
        const key = JSON.stringify([model?.items, model?.unread_count, !!model, error, mutating]);
        if (panel.dataset.renderKey === key)
            return;
        panel.dataset.renderKey = key;
        preserveRender(panel, html);
        lockActions();
    }
    function renderPage() {
        if (!pageHost?.isConnected || !alive())
            return;
        preserveRender(pageHost, `<header class="notice-page-heading"><div><p>حساب کاربری / اعلان‌ها</p><h1 tabindex="-1">اعلان‌های من</h1><p>${model ? fa(model.unread_count) + ' اعلان خوانده‌نشده' : 'خبرهای کلاس و یادآوری‌های مسیر یادگیری'}</p></div><button type="button" class="button-outline" data-notice-settings ${!model ? 'disabled' : ''}>${icons.gear} تنظیمات</button></header><div class="notice-page-tools"><div role="group" aria-label="فیلتر اعلان‌ها"><button type="button" data-notice-filter="all" aria-pressed="${!pageUnread}">همه</button><button type="button" data-notice-filter="unread" aria-pressed="${pageUnread}">خوانده‌نشده</button></div><button type="button" data-read-all ${!model?.unread_count || !pageSnapshot ? 'disabled' : ''}>همه را خواندم</button><button type="button" data-page-refresh>به‌روزرسانی</button></div>${pageError ? '<p class="notice-error" role="status">' + E(pageError) + '</p>' : ''}<div class="notice-page-list">${pageItems.length ? rows(pageItems) : pageLoaded ? '<p class="notice-empty">اعلانی در این فهرست نیست.</p>' : '<p class="notice-empty" role="status">در حال دریافت اعلان‌ها…</p>'}</div>${pageCursor ? '<button type="button" class="button-outline notice-more" data-notice-more>نمایش موارد بیشتر</button>' : ''}`);
        lockActions();
    }
    function lockActions() { if (settings)
        for (const el of settings.querySelectorAll('input'))
            el.disabled = authBusy || mutating; for (const container of [panel, pageHost, settings])
        if (container)
            for (const b of container.querySelectorAll('button')) {
                if (!b.hasAttribute('data-was-disabled'))
                    b.dataset.wasDisabled = String(b.disabled);
                b.disabled = authBusy || mutating || b.dataset.wasDisabled === 'true';
            } }
    function unlockActions() { if (settings)
        for (const el of settings.querySelectorAll('input'))
            el.disabled = authBusy; for (const container of [panel, pageHost, settings])
        if (container)
            for (const b of container.querySelectorAll('button[data-was-disabled]')) {
                b.disabled = b.dataset.wasDisabled === 'true';
                delete b.dataset.wasDisabled;
            } }
    function cleanFeed(value) { if (!value || !Array.isArray(value.items) || !value.preferences || !Number.isInteger(value.unread_count) || value.unread_count < 0 || !Number.isFinite(Date.parse(value.server_now)) || !Number.isInteger(value.preferences.revision) || !['lab', 'review', 'content', 'access'].every(k => typeof value.preferences[k] === 'boolean'))
        throw Error('INVALID_NOTICE_FEED'); return { ...value, items: value.items.filter(i => validNotice(i, baseURL)), unread_count: Math.max(0, Number(value.unread_count)) }; }
    function refresh(force = false) {
        if (!alive() || authBusy)
            return Promise.resolve();
        if (pendingRead && !force)
            return pendingRead;
        if (!force && Date.now() - lastFetch < 60000)
            return Promise.resolve();
        const t = ++ticket;
        const task = (async () => { try {
            const value = cleanFeed(await bounded('classroom_notifications'));
            if (!alive() || t !== ticket)
                return;
            model = value;
            lastFetch = Date.now();
            error = '';
            paintTriggers();
            renderPanel();
        }
        catch (e) {
            if (alive() && t === ticket) {
                error = failure(e);
                paintTriggers();
                renderPanel();
            }
        }
        finally {
            if (pendingRead === task)
                pendingRead = null;
        } })();
        pendingRead = task;
        return task;
    }
    async function loadPage({ reset = false, unread = pageUnread } = {}) {
        if (!alive() || !pageHost?.isConnected)
            return;
        const t = ++pageTicket;
        pageHost.setAttribute('aria-busy', 'true');
        try {
            const cursor = reset ? null : pageCursor, value = cleanFeed(await bounded('classroom_notifications', { p_history: true, p_before: cursor?.at || null, p_before_id: cursor?.id || null, p_unread: unread }));
            if (!alive() || t !== pageTicket)
                return;
            pageItems = reset ? value.items : mergeNotices(pageItems, value.items);
            pageCursor = value.next_cursor;
            pageUnread = unread;
            pageError = '';
            pageLoaded = true;
            if (reset)
                pageSnapshot = value.server_now;
            model = { ...(model || value), preferences: value.preferences, unread_count: value.unread_count };
            paintTriggers();
            renderPage();
            renderPanel();
        }
        catch (e) {
            if (alive() && t === pageTicket) {
                pageError = failure(e);
                renderPage();
            }
        }
        finally {
            if (alive() && t === pageTicket)
                pageHost.setAttribute('aria-busy', 'false');
        }
    }
    function itemById(id) { return model?.items.find(i => i.id === id) || pageItems.find(i => i.id === id); }
    async function action(fn) { if (!alive() || mutating || authBusy)
        return false; mutating = true; ++ticket; ++pageTicket; lockActions(); try {
        const result = await fn();
        if (!alive() || result === false)
            return false;
        announceChange();
        return true;
    }
    catch (e) {
        if (alive())
            notify(failure(e));
        return false;
    }
    finally {
        if (alive()) {
            mutating = false;
            unlockActions();
            paintTriggers();
            renderPanel();
        }
    } }
    async function readItem(item) { return action(async () => { await bounded('classroom_notice_read', { p_owner: userId, p_id: item.id, p_episode: item.episode }); if (!alive())
        return; for (const list of [model?.items || [], pageItems])
        for (const i of list)
            if (i.id === item.id && i.episode === item.episode)
                i.read_at = new Date().toISOString(); await refresh(true); if (pageHost)
        await loadPage({ reset: true }); notify('اعلان خوانده شد.'); }); }
    async function openItem(item, event) {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button) {
            void readItem(item);
            return;
        }
        event.preventDefault();
        if (authBusy || mutating)
            return;
        close();
        let timer;
        await Promise.race([readItem(item), new Promise(resolve => { timer = win.setTimeout(resolve, 1500); })]);
        win.clearTimeout(timer);
        if (alive()) {
            const href = noticeURL(item.path, baseURL);
            if (href)
                (onNavigate || ((u) => win.location.assign(u)))(href);
        }
    }
    function openSettings() {
        if (!model || settings || authBusy)
            return;
        close();
        settingsRevision = model.preferences.revision;
        settings = doc.createElement('dialog');
        settings.className = 'notice-settings';
        settings.dir = 'rtl';
        settings.setAttribute('aria-labelledby', panelId + '-settings-title');
        const labels = { lab: ['لابراتورها', 'پیشنهاد قدم بعدی و یادآوری ادامهٔ لابراتور'], review: ['دفتر مرور', 'یادآوری موضوعات آمادهٔ مرور'], content: ['محتوای تازه', 'انتشار یادداشت، تمرین یا لابراتور'], access: ['دسترسی کلاس', 'خبر فعال‌شدن دسترسی کلاس'] };
        settings.innerHTML = `<header><h2 id="${panelId}-settings-title">تنظیمات اعلان‌ها</h2><button type="button" data-close-settings aria-label="بستن">${icons.close}</button></header><p>انتخاب کن چه اعلان‌هایی در سایت ببینی.</p><form data-settings-form>${Object.entries(labels).map(([key, l]) => `<label><span><strong>${l[0]}</strong><small>${l[1]}</small></span><input type="checkbox" name="${key}" ${model.preferences[key] ? 'checked' : ''}></label>`).join('')}<p class="notice-settings-status" role="status"></p><button type="button" class="button-outline" data-settings-conflict hidden>دریافت تنظیمات جدید برای مقایسه</button><p data-settings-remote hidden></p><button class="button-forest" type="submit">ذخیرهٔ تنظیمات</button></form>`;
        doc.body.append(settings);
        settings.querySelector('[data-close-settings]').onclick = closeSettings;
        settings.addEventListener('cancel', e => { e.preventDefault(); if (!mutating)
            closeSettings(); });
        settings.querySelector('form').onsubmit = e => { e.preventDefault(); void saveSettings(); };
        settings.showModal();
    }
    function closeSettings() { if (!settings)
        return; settings.close(); settings.remove(); settings = null; [...hosts.values()].find(h => h.isConnected)?.querySelector('button')?.focus(); }
    async function saveSettings() {
        if (!settings)
            return;
        const draft = Object.fromEntries(['lab', 'review', 'content', 'access'].map(k => [k, settings.querySelector(`input[name="${k}"]`).checked]));
        await action(async () => { try {
            await bounded('classroom_notice_preferences', { p_owner: userId, p_revision: settingsRevision, p_settings: draft });
            if (!alive())
                return;
            closeSettings();
            await refresh(true);
            if (pageHost)
                await loadPage({ reset: true });
            notify('تنظیمات اعلان‌ها ذخیره شد.');
        }
        catch (e) {
            if (!alive() || !settings)
                return;
            settings.querySelector('.notice-settings-status').textContent = failure(e);
            if (/NOTICE_SETTINGS_CONFLICT/.test(String(e?.message))) {
                const b = settings.querySelector('[data-settings-conflict]');
                b.hidden = false;
                b.onclick = () => void action(async () => { const value = cleanFeed(await bounded('classroom_notifications')); if (!alive() || !settings)
                    return; settingsRevision = value.preferences.revision; const p = settings.querySelector('[data-settings-remote]'); p.hidden = false; p.textContent = ['lab', 'review', 'content', 'access'].map(k => labelsForSetting(k) + ': ' + (value.preferences[k] ? 'فعال' : 'خاموش')).join(' · '); settings.querySelector('.notice-settings-status').textContent = 'انتخاب‌های تو حفظ شدند؛ ذخیرهٔ بعدی آن‌ها را در حساب جایگزین می‌کند.'; });
            }
            return false;
        } });
    }
    function labelsForSetting(k) { return { lab: 'لابراتور', review: 'مرور', content: 'محتوای تازه', access: 'دسترسی' }[k]; }
    function click(event) {
        const inSurface = panel.contains(event.target) || pageHost?.contains(event.target);
        if (!inSurface) {
            if (active && ![...hosts.values()].some(h => h.contains(event.target)))
                close();
            return;
        }
        const target = event.target.closest?.('button,a');
        if (!target || !alive())
            return;
        if (target.hasAttribute('data-notice-open')) {
            const item = itemById(target.dataset.noticeOpen);
            if (item)
                void openItem(item, event);
            return;
        }
        if (target.hasAttribute('data-read-one')) {
            const i = itemById(target.dataset.readOne);
            if (i)
                void readItem(i);
        }
        if (target.hasAttribute('data-read-all'))
            void action(async () => { await bounded('classroom_notice_read_all', { p_owner: userId, p_cutoff: pageHost?.contains(target) ? pageSnapshot : model?.server_now }); await refresh(true); if (pageHost)
                await loadPage({ reset: true }); notify('اعلان‌های موجود خوانده شدند.'); });
        if (target.hasAttribute('data-snooze')) {
            const i = itemById(target.dataset.snooze);
            if (i)
                void action(async () => { await bounded('classroom_notice_snooze', { p_owner: userId, p_id: i.id, p_episode: i.episode, p_days: Number(target.dataset.days) }); await refresh(true); if (pageHost)
                    await loadPage({ reset: true }); notify('یادآوری برای زمان دیگری تنظیم شد.'); });
        }
        if (target.hasAttribute('data-notice-settings'))
            openSettings();
        if (target.hasAttribute('data-notice-retry'))
            void refresh(true);
        if (target.hasAttribute('data-page-refresh')) {
            void refresh(true);
            void loadPage({ reset: true });
        }
        if (target.hasAttribute('data-notice-filter'))
            void loadPage({ reset: true, unread: target.dataset.noticeFilter === 'unread' });
        if (target.hasAttribute('data-notice-more'))
            void loadPage();
    }
    function keydown(e) { if (!active)
        return; if (e.key === 'Escape') {
        e.preventDefault();
        close(true);
        return;
    } if (e.key === 'Tab' && panel.contains(e.target)) {
        const list = [...panel.querySelectorAll('button,a,summary')].filter(x => !x.disabled && !x.closest('[hidden]') && (!x.closest('details:not([open])') || x.tagName === 'SUMMARY'));
        if (e.shiftKey && (e.target === list[0] || e.target.tagName === 'H2') || !e.shiftKey && e.target === list.at(-1)) {
            e.preventDefault();
            close(true);
        }
    } }
    function focusin(e) { if (active && !panel.contains(e.target) && ![...hosts.values()].some(h => h.contains(e.target)))
        close(); }
    function panelOpened(e) { if (e.detail?.kind !== 'notifications')
        close(); }
    function refreshSurfaces(force = false) { const needed = force || Date.now() - lastFetch >= 60000; void refresh(force); if (needed && pageHost)
        void loadPage({ reset: true }); }
    function visibleRefresh() { if (doc.visibilityState !== 'hidden' && win.navigator?.onLine !== false)
        refreshSurfaces(); }
    function online() { refreshSurfaces(true); }
    function progress() { if (!alive())
        return; if (refreshTimer)
        win.clearTimeout(refreshTimer); refreshTimer = win.setTimeout(() => { refreshTimer = null; refreshSurfaces(true); }, 250); }
    doc.addEventListener('click', click);
    doc.addEventListener('keydown', keydown);
    doc.addEventListener('focusin', focusin);
    doc.addEventListener('classroom-panel-open', panelOpened);
    doc.addEventListener('classroom-progress-changed', progress);
    doc.addEventListener('visibilitychange', visibleRefresh);
    win.addEventListener('focus', visibleRefresh);
    win.addEventListener('online', online);
    win.addEventListener('resize', place);
    win.addEventListener('scroll', place, true);
    const interval = win.setInterval(visibleRefresh, refreshInterval);
    try {
        if (win.BroadcastChannel) {
            channel = new win.BroadcastChannel('class-notes-notices:' + new URL(baseURL).pathname + ':' + userId);
            channel.onmessage = e => { if (e.data?.type === 'changed' && e.data.owner === userId)
                refreshSurfaces(true); };
        }
    }
    catch { }
    return {
        attach, refresh,
        attachPage(root) { if (root === pageHost)
            return; pageHost = root; pageItems = []; pageLoaded = false; pageCursor = null; pageUnread = false; if (root) {
            renderPage();
            void loadPage({ reset: true });
        } },
        setBusy(value) { authBusy = !!value; if (authBusy)
            close(); paintTriggers(); if (!authBusy) {
            unlockActions();
            if (mutating)
                lockActions();
        }
        else
            lockActions(); },
        dispose() { if (disposed)
            return; disposed = true; ++ticket; ++pageTicket; close(); closeSettings(); for (const cancel of [...cancels])
            cancel(); for (const host of hosts.values())
            host.remove(); hosts.clear(); panel.remove(); live.remove(); model = null; pageItems = []; if (pageHost)
            pageHost.replaceChildren(); pageHost = null; win.clearInterval(interval); if (refreshTimer)
            win.clearTimeout(refreshTimer); channel?.close(); doc.removeEventListener('click', click); doc.removeEventListener('keydown', keydown); doc.removeEventListener('focusin', focusin); doc.removeEventListener('classroom-panel-open', panelOpened); doc.removeEventListener('classroom-progress-changed', progress); doc.removeEventListener('visibilitychange', visibleRefresh); win.removeEventListener('focus', visibleRefresh); win.removeEventListener('online', online); win.removeEventListener('resize', place); win.removeEventListener('scroll', place, true); }
    };
}
