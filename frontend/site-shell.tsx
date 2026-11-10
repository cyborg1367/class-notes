import React from 'react';
import { hydrateRoot, Root } from 'react-dom/client';
import { shellModel, parseShellPage } from './shell/shell-model';
import { SiteHeader } from './shell/SiteHeader';
import { SiteFooter } from './shell/SiteFooter';
import { getAccountRuntime } from './account/runtime';
import type { AccountMountOptions } from './account/runtime';
const roots: Root[] = [];
let mounted = false, resolveReady: () => void;
export const ready = new Promise<void>(resolve => { resolveReady = resolve; });
export function mountShell() {
    if (mounted)
        return;
    mounted = true;
    const data = document.querySelector('#site-shell-data'), entry = document.querySelector<HTMLScriptElement>('script[data-site-ui]');
    if (!data || !entry) {
        resolveReady();
        return;
    }
    const page = parseShellPage(JSON.parse(data.textContent || 'null'));
    const model = shellModel(page, new URL(entry.src).searchParams.get('v') || 'build');
    const runtime = getAccountRuntime(document, model.accountLinks);
    const header = document.querySelector<HTMLElement>('[data-site-header-root]'), footer = document.querySelector<HTMLElement>('[data-site-footer-root]');
    function recovery(host: HTMLElement, error: unknown) { host.dataset.reactRecovery = 'true'; console.warn('Site shell hydration:', error); }
    if (footer)
        roots.push(hydrateRoot(footer, <SiteFooter model={model}/>, { identifierPrefix: 'site-footer-', onRecoverableError: error => recovery(footer, error) }));
    if (header)
        roots.push(hydrateRoot(header, <SiteHeader model={model} account={runtime.port} container={document.body} onReady={() => { header.dataset.shellMounted = 'true'; resolveReady(); }}/>, { identifierPrefix: 'site-header-', onRecoverableError: error => recovery(header, error) }));
    else
        resolveReady();
}
export function dispose() {
    const data = document.querySelector('#site-shell-data');
    if (data) getAccountRuntime(document, shellModel(parseShellPage(JSON.parse(data.textContent || 'null'))).accountLinks).dispose();
    for (const root of roots)
    root.unmount(); roots.length = 0; }
export function mountAccountUI(options: AccountMountOptions) {
    return getAccountRuntime(options.doc || document, options.urls).mount(options);
}
window.ClassNotesSiteUI = { ready, mountShell, dispose, mountAccountUI };
if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', mountShell, { once: true });
else
    mountShell();

// The private notebook shares the runtime, but its code loads only for members
// on the notebook route or in the local fixture.
export function loadReviewNotebook() {
    return import('./review/mount');
}

export function loadLessonReader() {
    return import('./reader/mount');
}

export function loadQuizResult() {
    return import('./quiz-result/mount');
}

export function loadQuizForm() {
    return import('./quiz/mount');
}

export function loadInstructor() {
    return import('./instructor/mount');
}

export function loadLabPresentation() {
    return import('./lab/mount');
}

export function loadLabMission() {
    return import('./lab/mission/mount');
}

export function loadLabWorkspace() {
    return import('./lab/workspace/mount');
}

export function loadLabTutor() {
    return import('./lab/tutor/mount');
}

export function loadLabXp() {
    return import('./lab/xp/mount');
}

export function loadLabFrame() {
    return import('./lab/frame/mount');
}

export function loadNotifications() {
    return import('./notifications/mount');
}
