(function () {
  'use strict';
  // Content starts visible. A temporary CSS animation is applied only on entry.
  const page = document.body.dataset.page;
  const selectors = {
    home: '.landing-copy, .learning-window, .landing-classes .section-heading, .course-feature, .instructor-teaser',
    about: '.portfolio-head, .portrait, .project-list',
    course: '.paper-course-copy, .paper-course-figure, .course-lesson',
    lesson: '.hero-figure, figure.teaching-figure:not(.interactive-distance)',
  };
  const selector = selectors[page], html = document.documentElement;
  html.dataset.scrollMotionVersion = '2.7.1';
  let media, observer = null, fallback = false, frame = null, started = 0, destroyed = false;
  try { media = window.matchMedia?.('(prefers-reduced-motion: reduce)'); } catch { /* Static fallback. */ }
  const seen = new WeakSet(), pending = new Map(), running = new Map();
  const report = value => { html.dataset.scrollMotion = value; };
  function counts() {
    html.dataset.scrollMotionStarted = String(started);
    html.dataset.scrollMotionActive = String(running.size);
    html.dataset.scrollMotionPending = String(pending.size);
  }
  function finish(target, consume = true) {
    if (consume) seen.add(target);
    pending.delete(target); observer?.unobserve(target);
    const state = running.get(target); running.delete(target);
    state?.cleanup(); counts();
  }
  function settleAll() {
    for (const target of [...running.keys()]) finish(target);
    for (const target of [...pending.keys()]) finish(target, false);
    observer?.disconnect(); observer = null;
  }
  function clearLesson() {
    for (const target of [...pending.keys(), ...running.keys()]) {
      if (target.closest('.lesson-hero, .lesson-body') || !target.isConnected) finish(target);
    }
  }
  const inUse = target => document.activeElement && target.contains(document.activeElement);
  function enter(target) {
    if (!pending.has(target)) return;
    if (document.hidden) return; // Defer until the foreground check, rather than consume the entrance.
    const delay = pending.get(target);
    if (media.matches) return;
    if (!target.isConnected || inUse(target)) { finish(target); return; }
    seen.add(target); pending.delete(target); observer?.unobserve(target);
    const properties = ['--scroll-base-transform', '--scroll-base-opacity', '--scroll-start-opacity', '--scroll-delay'];
    const saved = properties.map(name => [name, target.style.getPropertyValue(name), target.style.getPropertyPriority(name)]);
    let timer;
    const ended = event => { if (event.target === target && event.animationName === 'class-notes-scroll-in') finish(target); };
    const cleanup = () => {
      clearTimeout(timer);
      target.classList.remove('scroll-entering');
      target.removeEventListener('animationend', ended);
      target.removeEventListener('animationcancel', ended);
      for (const [name, value, priority] of saved) {
        if (value) target.style.setProperty(name, value, priority); else target.style.removeProperty(name);
      }
      if (!target.getAttribute('style')?.trim()) target.removeAttribute('style');
    };
    running.set(target, {cleanup});
    try {
      const style = getComputedStyle(target), opacity = Number(style.opacity);
      target.style.setProperty('--scroll-base-transform', style.transform === 'none' ? 'translateY(0px)' : style.transform);
      target.style.setProperty('--scroll-base-opacity', String(opacity));
      target.style.setProperty('--scroll-start-opacity', String(opacity * 0.12));
      target.style.setProperty('--scroll-delay', delay + 'ms');
      target.addEventListener('animationend', ended);
      target.addEventListener('animationcancel', ended);
      target.classList.add('scroll-entering');
      // A missing/stale stylesheet must produce visible content and a useful diagnostic.
      if (!getComputedStyle(target).animationName.split(',').map(name => name.trim()).includes('class-notes-scroll-in')) {
        finish(target); report('styles-unavailable'); return;
      }
      started++; counts();
      timer = setTimeout(() => finish(target), 400 + delay + 150);
    } catch (error) {
      finish(target); report('error');
      console.warn('Class Notes scroll motion could not start:', error.message);
    }
  }
  function checkVisible() {
    if (destroyed || document.hidden || media.matches) return;
    const height = window.innerHeight || document.documentElement.clientHeight;
    for (const target of [...pending.keys()]) {
      if (!target.isConnected) { finish(target); continue; }
      const rect = target.getBoundingClientRect();
      if (rect.top < height - 24 && rect.bottom > 0) enter(target);
    }
  }
  function queueCheck() {
    if (frame !== null || destroyed) return;
    frame = requestAnimationFrame(() => { frame = null; checkVisible(); });
  }
  function observe(target) {
    if (!fallback && !observer) {
      try {
        observer = new IntersectionObserver(entries => {
          for (const entry of entries) if (entry.isIntersecting) enter(entry.target);
        }, {threshold: 0.12});
      } catch {
        fallback = true;
        window.addEventListener('scroll', queueCheck, {passive: true});
        window.addEventListener('resize', queueCheck, {passive: true});
      }
    }
    if (fallback) queueCheck(); else observer.observe(target);
  }
  function refresh(root = document) {
    if (destroyed || !selector || !media) return;
    if (media.matches) { report('reduced-motion'); return; }
    let listIndex = 0;
    for (const target of root.querySelectorAll(selector)) {
      if (seen.has(target) || pending.has(target) || !target.isConnected) continue;
      if (inUse(target)) { seen.add(target); continue; }
      const listItem = target.matches('.course-lesson, .course-feature');
      pending.set(target, listItem ? Math.min(listIndex++ * 60, 120) : 0);
      observe(target);
    }
    counts();
    if (!['styles-unavailable', 'error'].includes(html.dataset.scrollMotion)) report(fallback ? 'ready-fallback' : 'ready');
  }
  function interaction(event) {
    for (let target = event.target; target; target = target.parentElement) {
      if (pending.has(target) || running.has(target)) finish(target);
    }
  }
  function preferenceChanged() {
    if (media.matches) { settleAll(); report('reduced-motion'); }
    else { report('ready'); refresh(); queueCheck(); }
  }
  function visibilityChanged() {
    if (document.hidden) for (const target of [...running.keys()]) finish(target);
    else queueCheck();
  }
  function restored() { refresh(); queueCheck(); }
  function destroy() {
    destroyed = true; settleAll();
    if (frame !== null) cancelAnimationFrame(frame);
    document.removeEventListener('pointerdown', interaction, true);
    document.removeEventListener('focusin', interaction, true);
    document.removeEventListener('visibilitychange', visibilityChanged);
    window.removeEventListener('pagehide', settleAll);
    window.removeEventListener('pageshow', restored);
    window.removeEventListener('beforeprint', settleAll);
    window.removeEventListener('scroll', queueCheck);
    window.removeEventListener('resize', queueCheck);
    if (media?.removeEventListener) media.removeEventListener('change', preferenceChanged);
    else media?.removeListener?.(preferenceChanged);
  }
  window.ClassNotesMotion = {refresh, clearLesson, destroy};
  counts();
  if (!selector) { report('static-page'); return; }
  if (!media) { report('unsupported'); return; }
  document.addEventListener('pointerdown', interaction, true);
  document.addEventListener('focusin', interaction, true);
  document.addEventListener('visibilitychange', visibilityChanged);
  window.addEventListener('pagehide', settleAll);
  window.addEventListener('pageshow', restored);
  window.addEventListener('beforeprint', settleAll);
  if (media.addEventListener) media.addEventListener('change', preferenceChanged);
  else media.addListener?.(preferenceChanged);
  refresh();
})();
