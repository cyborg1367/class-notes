import React from 'react';
import { hydrateRoot, Root } from 'react-dom/client';
import type { PublicCourse } from './catalog/types';
import { HomePage } from './home/HomePage';
import { getViewChannel } from '../web/assets/view-channel.mjs';
import { INITIAL_HOME_VIEW } from '../web/assets/home-view-model.mjs';

let root: Root | undefined;

export function mountHome() {
  if (root) return;
  const host = document.querySelector<HTMLElement>('[data-home-react-root]');
  const entry = document.querySelector<HTMLScriptElement>('script[data-home-ui]');
  if (!host || !entry) return;
  const catalog = JSON.parse(document.querySelector('#catalog-data')?.textContent || '[]') as PublicCourse[];
  const version = new URL(entry.src).searchParams.get('v') || 'build';
  const channel = getViewChannel(host, INITIAL_HOME_VIEW);
  root = hydrateRoot(host, <HomePage catalog={catalog} channel={channel} version={version} />, {
    identifierPrefix: 'home-',
    onRecoverableError(error) {
      host.dataset.reactRecovery = 'true';
      console.warn('Homepage hydration:', error);
    },
  });
  host.dataset.homeMounted = 'true';
}

export function dispose() {
  root?.unmount();
  root = undefined;
}

window.ClassNotesHome = { mountHome, dispose };
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountHome, { once: true });
else mountHome();
