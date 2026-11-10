import { useEffect, useRef, useState } from 'react';

export function useNavigation() {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const nav = useRef<HTMLElement>(null);

  useEffect(() => {
    const doc = button.current?.ownerDocument;
    const win = doc?.defaultView;
    if (!doc || !win) return;

    function close() {
      setOpen(false);
    }

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === 'Escape' && open) {
        close();
        button.current?.focus();
      }
    }

    function handleOutsideInteraction(event: Event) {
      const target = event.target as Node;
      if (!nav.current?.contains(target) && !button.current?.contains(target)) {
        close();
      }
    }

    function handleOtherPanel(event: Event) {
      if ((event as CustomEvent).detail?.kind !== 'navigation') {
        close();
      }
    }

    const mobileViewport = win.matchMedia?.('(max-width:1100px)');
    function handleViewportChange() {
      if (mobileViewport && !mobileViewport.matches) close();
    }

    doc.addEventListener('keydown', handleKeydown);
    doc.addEventListener('pointerdown', handleOutsideInteraction);
    doc.addEventListener('focusin', handleOutsideInteraction);
    doc.addEventListener('classroom-panel-open', handleOtherPanel);
    mobileViewport?.addEventListener('change', handleViewportChange);

    return () => {
      doc.removeEventListener('keydown', handleKeydown);
      doc.removeEventListener('pointerdown', handleOutsideInteraction);
      doc.removeEventListener('focusin', handleOutsideInteraction);
      doc.removeEventListener('classroom-panel-open', handleOtherPanel);
      mobileViewport?.removeEventListener('change', handleViewportChange);
    };
  }, [open]);

  function toggle() {
    const doc = button.current?.ownerDocument;
    const win = doc?.defaultView;
    if (!open && doc && win) {
      doc.dispatchEvent(new win.CustomEvent('classroom-panel-open', {
        detail: { kind: 'navigation' },
      }));
    }
    setOpen(value => !value);
  }

  return { open, button, nav, toggle, close: () => setOpen(false) };
}
