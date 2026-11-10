import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

// Content is visible in SSR. Existing paper animation is enabled after hydration
// only, and its DOM attributes remain React-owned throughout the animation.
export function usePaperReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [motion, setMotion] = useState<CSSProperties | undefined>();

  useEffect(() => {
    const element = ref.current;
    const win = element?.ownerDocument.defaultView;
    if (!element || !win?.matchMedia) return;
    const preference = win.matchMedia('(prefers-reduced-motion: reduce)');
    if (preference.matches) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    let started = false;
    let observer: IntersectionObserver | undefined;
    const stop = () => { clearTimeout(timer); setMotion(undefined); };
    function start() {
      if (started || preference.matches || !element || !win) return;
      if (element.ownerDocument.hidden) return;
      started = true;
      observer?.disconnect();
      if (element.contains(element.ownerDocument.activeElement)) return;
      const style = win.getComputedStyle(element);
      const opacity = Number(style.opacity || 1);
      setMotion({
        '--scroll-base-transform': style.transform && style.transform !== 'none' ? style.transform : 'translateY(0px)',
        '--scroll-base-opacity': String(opacity),
        '--scroll-start-opacity': String(opacity * 0.12),
        '--scroll-delay': '0ms',
      } as CSSProperties);
      timer = setTimeout(stop, 550);
    }
    function visibilityChanged() { if (!element?.ownerDocument.hidden) start(); }
    function preferenceChanged() { if (preference.matches) stop(); }
    if (win.IntersectionObserver) {
      observer = new win.IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) start();
      }, { threshold: 0.12 });
      observer.observe(element);
    } else {
      start();
    }
    preference.addEventListener('change', preferenceChanged);
    element.ownerDocument.addEventListener('visibilitychange', visibilityChanged);
    element.addEventListener('pointerdown', stop);
    element.addEventListener('focusin', stop);
    element.addEventListener('animationend', stop);
    return () => {
      clearTimeout(timer);
      observer?.disconnect();
      preference.removeEventListener('change', preferenceChanged);
      element.ownerDocument.removeEventListener('visibilitychange', visibilityChanged);
      element.removeEventListener('pointerdown', stop);
      element.removeEventListener('focusin', stop);
      element.removeEventListener('animationend', stop);
    };
  }, []);

  return { ref, style: motion, suffix: motion ? ' scroll-entering' : '' };
}
