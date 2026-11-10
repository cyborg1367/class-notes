import { useEffect, useState } from 'react';
import type { Heading } from './contracts';

const empty = { active: '', percent: 0 };
export function useReaderNavigation(scope: HTMLElement | null, headings: Heading[]) {
  const [position, setPosition] = useState(empty);
  useEffect(() => {
    if (!scope) return;
    const win = scope.ownerDocument.defaultView;
    if (!win) return;
    const elements = new Map(Array.from(scope.querySelectorAll<HTMLElement>('[id]'), node => [node.id, node]));
    const sections = headings.flatMap(({ id }) => {
      const element = elements.get(id);
      return element ? [element] : [];
    });
    const article = scope.querySelector<HTMLElement>('[data-reader-prose]') || scope;
    const header = scope.ownerDocument.querySelector('.portal-header');
    let frame: number | null = null, offset = 0;
    const update = () => {
      frame = null;
      const nextOffset = Math.max(100, Math.ceil(header?.getBoundingClientRect().height || 0) + 16);
      if (nextOffset !== offset) {
        offset = nextOffset;
        scope.style.setProperty('--reader-anchor-offset', offset + 'px');
      }
      let active = sections[0]?.id || '';
      for (const section of sections) {
        const bounds = section.getBoundingClientRect();
        if (bounds.height > 0 && bounds.top <= offset) active = section.id;
      }
      const bounds = article.getBoundingClientRect();
      const span = Math.max(1, bounds.height - win.innerHeight + offset);
      const percent = bounds.height > 0 ? Math.round(Math.max(0, Math.min(1, (offset - bounds.top) / span)) * 100) : 0;
      setPosition(previous => previous.active === active && previous.percent === percent ? previous : { active, percent });
    };
    const schedule = () => {
      if (frame === null) frame = win.requestAnimationFrame(update);
    };
    const restore = () => {
      try {
        const id = decodeURIComponent(win.location.hash.slice(1));
        if (id) elements.get(id)?.scrollIntoView?.({ block: 'start' });
      } catch { /* Ignore malformed fragments. */ }
      schedule();
    };
    const initial = win.requestAnimationFrame(restore);
    win.addEventListener('scroll', schedule, { passive: true });
    win.addEventListener('resize', schedule, { passive: true });
    win.addEventListener('hashchange', schedule);
    scope.addEventListener('load', schedule, true);
    const resize = typeof win.ResizeObserver === 'function' ? new win.ResizeObserver(schedule) : null;
    const body = scope.querySelector('.lesson-body');
    if (body && body !== article) resize?.observe(body);
    resize?.observe(article);
    if (header) resize?.observe(header);
    update();
    return () => {
      win.cancelAnimationFrame(initial);
      if (frame !== null) win.cancelAnimationFrame(frame);
      win.removeEventListener('scroll', schedule);
      win.removeEventListener('resize', schedule);
      win.removeEventListener('hashchange', schedule);
      scope.removeEventListener('load', schedule, true);
      resize?.disconnect();
      scope.style.removeProperty('--reader-anchor-offset');
    };
  }, [scope, headings]);
  return position;
}
