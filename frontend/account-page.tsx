import React from 'react';
import { hydrateRoot, Root } from 'react-dom/client';
import { AccountPage } from './account/AccountPage';
import { accountLinks } from './account/account-links';
import { getAccountRuntime } from './account/runtime';

let root: Root | undefined;
let resolveReady: () => void;
export const ready = new Promise<void>(resolve => { resolveReady = resolve; });

export function mountAccountPage() {
  if (root) return;
  const host = document.querySelector<HTMLElement>('[data-account-react-root]');
  if (!host) { resolveReady(); return; }
  const { port } = getAccountRuntime(document, accountLinks('../'));
  root = hydrateRoot(host, <AccountPage port={port} onReady={resolveReady} />, {
    identifierPrefix: 'account-page-',
    onRecoverableError(error) { host.dataset.reactRecovery = 'true'; console.warn('Account page hydration:', error); },
  });
}

export function dispose() { root?.unmount(); root = undefined; }
window.ClassNotesAccountPage = { ready, mountAccountPage, dispose };
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountAccountPage, { once: true });
else mountAccountPage();
