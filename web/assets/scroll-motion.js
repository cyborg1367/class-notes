(function () {
  'use strict';
  // Progressive enhancement: no CSS class or inline style ever hides content.
  const page = document.body.dataset.page;
  const selectors = {
    home: '.landing-copy, .learning-window, .landing-classes .section-heading, .course-feature, .instructor-teaser',
    about: '.portfolio-head, .portrait, .project-list',
    course: '.paper-course-copy, .paper-course-figure, .course-lesson',
    lesson: '.hero-figure, figure.teaching-figure:not(.interactive-distance)',
  };
  const selector = selectors[page];
  let media;
  try { media = window.matchMedia?.('(prefers-reduced-motion: reduce)'); } catch { /* Static fallback. */ }
  const supported = selector && media && typeof IntersectionObserver === 'function' &&
    typeof Element !== 'undefined' && typeof Element.prototype.animate === 'function';
  const seen = new WeakSet(), pending = new Map(), running = new Map();
  let observer = null;
  function finish(target) {
    seen.add(target); pending.delete(target); observer?.unobserve(target);
    const animation = running.get(target); running.delete(target); animation?.cancel();
  }
  function settleAll() {
    for (const target of [...pending.keys(), ...running.keys()]) finish(target);
    observer?.disconnect(); observer = null;
  }
  function clearLesson() {
    for (const target of [...pending.keys(), ...running.keys()]) {
      if (target.closest('.lesson-hero, .lesson-body') || !target.isConnected) finish(target);
    }
  }
  function inUse(target) {
    return document.activeElement && target.contains(document.activeElement);
  }
  function enter(entries) {
    for (const entry of entries) {
      const target = entry.target;
      if (!entry.isIntersecting || !pending.has(target)) continue;
      const delay = pending.get(target);
      seen.add(target); pending.delete(target); observer?.unobserve(target);
      if (media.matches || document.hidden || !target.isConnected || inUse(target)) continue;
      try {
        // Preserve the paper figure's authored rotation and any other base transform.
        const style = getComputedStyle(target);
        const transform = style.transform === 'none' ? '' : style.transform;
        const opacity = Number(style.opacity);
        const animation = target.animate([
          {opacity: opacity * 0.9, transform: ('translateY(10px) ' + transform).trim()},
          {opacity, transform: transform || 'none'},
        ], {duration: 300, delay, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'backwards'});
        running.set(target, animation);
        const done = () => { if (running.get(target) === animation) running.delete(target); };
        animation.addEventListener('finish', done, {once: true});
        animation.addEventListener('cancel', done, {once: true});
      } catch { /* Underlying document styles remain visible and unchanged. */ }
    }
  }
  function refresh(root = document) {
    if (!supported) return;
    const targets = Array.from(root.querySelectorAll(selector));
    let listIndex = 0;
    for (const target of targets) {
      if (seen.has(target) || pending.has(target) || !target.isConnected) continue;
      if (media.matches || inUse(target)) { seen.add(target); continue; }
      try {
        if (!observer) observer = new IntersectionObserver(enter, {threshold: 0.12});
        // Only genuine list siblings receive a stagger, capped at 120ms.
        const isListItem = target.matches('.course-lesson, .course-feature');
        pending.set(target, isListItem ? Math.min(listIndex++ * 60, 120) : 0);
        observer.observe(target);
      } catch { settleAll(); return; }
    }
  }
  function interaction(event) {
    for (let target = event.target; target; target = target.parentElement) {
      if (pending.has(target) || running.has(target)) finish(target);
    }
  }
  function preferenceChanged() { if (media.matches) settleAll(); }
  function visibilityChanged() { if (document.hidden) for (const target of [...running.keys()]) finish(target); }
  function destroy() {
    settleAll();
    document.removeEventListener('pointerdown', interaction, true);
    document.removeEventListener('focusin', interaction, true);
    document.removeEventListener('visibilitychange', visibilityChanged);
    window.removeEventListener('pagehide', settleAll);
    window.removeEventListener('beforeprint', settleAll);
    if (media?.removeEventListener) media.removeEventListener('change', preferenceChanged);
    else media?.removeListener?.(preferenceChanged);
  }
  window.ClassNotesMotion = {refresh, clearLesson, destroy};
  if (!supported) return;
  document.addEventListener('pointerdown', interaction, true);
  document.addEventListener('focusin', interaction, true);
  document.addEventListener('visibilitychange', visibilityChanged);
  window.addEventListener('pagehide', settleAll);
  window.addEventListener('beforeprint', settleAll);
  if (media.addEventListener) media.addEventListener('change', preferenceChanged);
  else media.addListener?.(preferenceChanged);
  refresh();
})();
