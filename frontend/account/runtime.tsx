import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { createAccountController } from '../../web/assets/account-controller.mjs';
import { AccountControls } from './AccountControls';
import type { AccountLinks, AccountPort, AccountHandlers } from './contracts';

export type AccountMountOptions = AccountHandlers & { urls: AccountLinks; doc?: Document; win?: Window };
type CompactHost = { host: HTMLElement; root: Root; scope: string };

// One runtime per document. SSR never calls this factory and therefore cannot
// retain account state between routes or requests.
const documents = new WeakMap<Document, ReturnType<typeof createRuntime>>();

function createRuntime(doc: Document, links: AccountLinks) {
  const port = createAccountController({ links, documentURL: doc.baseURI }) as AccountPort;
  const hosts = new Map<HTMLElement, CompactHost>();
  let serial = 0, mounted = false;

  function prune() {
    for (const [anchor, entry] of hosts) {
      if (!anchor.isConnected || !entry.host.isConnected) {
        if (port.getSnapshot().openMenuId === entry.scope) port.closeMenu();
        entry.root.unmount(); entry.host.remove(); hosts.delete(anchor);
      }
    }
  }

  function legacyClick(event: MouseEvent) {
    if (event.defaultPrevented) return;
    const target = (event.target as Element).closest?.('[data-signin],[data-signout],[data-login-link]');
    if (!target || target.closest('[data-react-account-action]')) return;
    if (target.tagName === 'A' && (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)) return;
    const view = port.getSnapshot();
    if (view.phase === 'error' && target.tagName === 'A') return;
    event.preventDefault();
    if (view.phase === 'loading' || view.busy) return;
    if (target.matches('[data-signout]')) void port.signOut();
    else void port.signIn(target);
  }

  function focusAccount() {
    prune();
    const compact = doc.body.classList.contains('lab-notebook-ready')
      ? [...hosts.values()].find(entry => entry.host.isConnected)?.scope : undefined;
    port.requestFocus(compact || 'header');
  }

  const api = {
    update(input: unknown) { prune(); port.update(input); },
    setNotice: port.setNotice,
    setContinue: port.setContinue,
    attach(anchor: HTMLElement, { compact = false } = {}) {
      prune();
      const existing = hosts.get(anchor);
      if (existing) return existing.host;
      const host = doc.createElement('div');
      host.className = 'account-react-host'; anchor.append(host);
      const root = createRoot(host), scope = 'compact-' + (++serial);
      hosts.set(anchor, { host, root, scope });
      root.render(<AccountControls port={port} scope={scope} compact={compact} container={doc.body} />);
      return host;
    },
    detach(anchor: HTMLElement) {
      const entry=hosts.get(anchor);
      if(!entry)return;
      if(port.getSnapshot().openMenuId===entry.scope)port.closeMenu();
      entry.root.unmount();entry.host.remove();hosts.delete(anchor);
    },
    close(focus = false) {
      const scope = port.getSnapshot().openMenuId;
      port.closeMenu();
      if (focus && scope) port.requestFocus(scope);
    },
    confirmUnsaved: port.confirmUnsaved,
    focusAccount,
    dispose() {
      doc.removeEventListener('click', legacyClick);
      for (const entry of hosts.values()) { entry.root.unmount(); entry.host.remove(); }
      hosts.clear(); port.dispose(); documents.delete(doc);
    },
  };

  return {
    port,
    mount(options: AccountMountOptions) {
      port.configure({ ...options, onRetry: options.onRetry || (() => doc.defaultView?.location.reload()) }, options.urls);
      if (!mounted) { mounted = true; doc.addEventListener('click', legacyClick); }
      return api;
    },
    dispose: api.dispose,
  };
}

export function getAccountRuntime(doc: Document, links: AccountLinks) {
  let runtime = documents.get(doc);
  if (!runtime) { runtime = createRuntime(doc, links); documents.set(doc, runtime); }
  return runtime;
}

export type AccountUI = ReturnType<ReturnType<typeof getAccountRuntime>['mount']>;
