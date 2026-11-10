import { useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { AccountPort, AccountView } from './contracts';
import { accountMenuPosition } from '../../web/assets/account-model.mjs';

function visibleItems(menu: HTMLElement | null) {
  const win = menu?.ownerDocument.defaultView;
  return [...(menu?.querySelectorAll<HTMLElement>('[role="menuitem"]:not(:disabled)') || [])].filter(item => {
    const style = win?.getComputedStyle(item);
    return style?.display !== 'none' && style?.visibility !== 'hidden';
  });
}

export function useAccountMenu(port: AccountPort, view: AccountView, scope: string) {
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLElement>(null);
  const open = view.openMenuId === scope && view.phase === 'authenticated';
  const [position, setPosition] = useState<CSSProperties>({});

  useLayoutEffect(() => {
    const doc = root.current?.ownerDocument, win = doc?.defaultView;
    if (!open || !doc || !win) return;

    function place() {
      if (!trigger.current || !menu.current || !win) return;
      setPosition(accountMenuPosition(trigger.current.getBoundingClientRect(), {
        width: win.innerWidth, height: win.innerHeight,
      }, menu.current.scrollHeight || 360));
    }
    function outside(event: Event) {
      // Another root can open its menu before this effect's cleanup runs.
      // An old listener may dismiss only the scope that installed it.
      if (port.getSnapshot().openMenuId !== scope) return;
      const target = event.target as Node;
      if (!root.current?.contains(target) && !menu.current?.contains(target)) port.closeMenu();
    }
    function otherPanel(event: Event) {
      if ((event as CustomEvent).detail?.kind !== 'account') port.closeMenu();
    }

    place();
    const items = visibleItems(menu.current);
    (view.focusEdge === 'last' ? items[items.length - 1] : items[0])?.focus();
    doc.addEventListener('pointerdown', outside);
    doc.addEventListener('click', outside);
    doc.addEventListener('focusin', outside);
    doc.addEventListener('classroom-panel-open', otherPanel);
    win.addEventListener('resize', place);
    win.addEventListener('scroll', place, true);
    return () => {
      doc.removeEventListener('pointerdown', outside);
      doc.removeEventListener('click', outside);
      doc.removeEventListener('focusin', outside);
      doc.removeEventListener('classroom-panel-open', otherPanel);
      win.removeEventListener('resize', place);
      win.removeEventListener('scroll', place, true);
    };
  }, [open, port, scope, view.focusEdge]);

  useLayoutEffect(() => {
    if (view.focusTarget !== scope || view.busy) return;
    const target = trigger.current || root.current?.querySelector<HTMLElement>('button,a');
    target?.focus();
  }, [view.focusRevision, view.focusTarget, view.busy, scope]);

  function show(edge: 'first' | 'last' = 'first') {
    const doc = root.current?.ownerDocument, win = doc?.defaultView;
    if (doc && win) doc.dispatchEvent(new win.CustomEvent('classroom-panel-open', { detail: { kind: 'account' } }));
    port.openMenu(scope, edge);
  }

  function close(restoreFocus = false) {
    port.closeMenu();
    if (restoreFocus) trigger.current?.focus();
  }

  function keydown(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(true); return; }
    if (event.key === 'Tab') { close(true); return; }
    const items = visibleItems(menu.current);
    if (!items.length) return;
    const current = items.indexOf(event.currentTarget.ownerDocument.activeElement as HTMLElement);
    const next = event.key === 'ArrowDown' ? (current + 1) % items.length
      : event.key === 'ArrowUp' ? (current - 1 + items.length) % items.length
      : event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : null;
    if (next !== null) { event.preventDefault(); items[next].focus(); }
  }

  return { root, trigger, menu, open, position, show, close, keydown };
}
