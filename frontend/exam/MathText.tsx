import React, { useEffect, useMemo, useRef } from 'react';

declare global {
  interface Window {
    katex?: {
      render: (source: string, element: HTMLElement, options?: { throwOnError?: boolean; displayMode?: boolean; output?: string; strict?: string | boolean }) => void;
    };
  }
}

type Token = { kind: 'text' | 'math'; value: string; display?: boolean };
let katexLoad: Promise<void> | undefined;

function ensureKatex(): Promise<void> {
  if (window.katex?.render) return Promise.resolve();
  if (katexLoad) return katexLoad;
  katexLoad = new Promise(resolve => {
    const portal = document.querySelector<HTMLScriptElement>('script[data-portal]');
    // Use the copy already bundled with the site's private lesson pages.
    const src = portal?.src ? new URL('katex/katex.min.js', new URL('.', portal.src)).href : '/assets/katex/katex.min.js';
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.dataset.examKatexLoader = '';
    script.addEventListener('load', () => resolve(), { once: true });
    script.addEventListener('error', () => resolve(), { once: true });
    document.head.append(script);
  });
  return katexLoad;
}

// V3's SQL patch accidentally stored doubled backslashes (\\frac, \\(...\\)).
// Normalize these records so both old and corrected strings render reliably.
export function normalizeMathSource(value: string): string {
  return value.replace(/\\\\/g, '\\');
}

export function tokenizeMath(value: string): Token[] {
  const text = normalizeMathSource(value);
  const tokens: Token[] = [];
  const pattern = /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)|\$[^$\n]+\$)/g;
  let position = 0;
  for (const match of text.matchAll(pattern)) {
    const start = match.index ?? 0;
    const hit = match[0];
    if (start > position) tokens.push({ kind: 'text', value: text.slice(position, start) });
    if (hit.startsWith('$$')) tokens.push({ kind: 'math', value: hit.slice(2, -2).trim(), display: true });
    else if (hit.startsWith('\\[')) tokens.push({ kind: 'math', value: hit.slice(2, -2).trim(), display: true });
    else if (hit.startsWith('\\(')) tokens.push({ kind: 'math', value: hit.slice(2, -2).trim() });
    else tokens.push({ kind: 'math', value: hit.slice(1, -1).trim() });
    position = start + hit.length;
  }
  if (position < text.length) tokens.push({ kind: 'text', value: text.slice(position) });
  if (!tokens.length) tokens.push({ kind: 'text', value: text });
  return tokens;
}

function mathFallback(value: string): string {
  return value.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '($1) / ($2)')
    .replace(/\\times/g, '×').replace(/\\approx/g, '≈')
    .replace(/\\mu/g, 'μ').replace(/\\sigma/g, 'σ')
    .replace(/\\,/g, ' ').replace(/[{}]/g, '');
}

function Formula({ value, display }: { value: string; display?: boolean }) {
  const element = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let alive = true;
    void ensureKatex().then(() => {
      if (!alive || !element.current || !window.katex?.render) return;
      try { window.katex.render(value, element.current, { throwOnError: false, displayMode: display, output: 'html', strict: 'ignore' }); }
      catch { element.current.textContent = mathFallback(value); }
    });
    return () => { alive = false; };
  }, [value, display]);
  return <span className={display ? 'exam-math-block' : 'exam-math-inline'} dir="ltr" ref={element}>{mathFallback(value)}</span>;
}

// Preserve RTL sentence flow while isolating English technical terms.
function PlainText({ value }: { value: string }) {
  return <>{value.split(/([A-Za-z][A-Za-z0-9._-]*(?:[ \t]+[A-Za-z][A-Za-z0-9._-]*)*)/g).map((segment, index) =>
    /^[A-Za-z]/.test(segment) ? <bdi key={index} dir="ltr">{segment}</bdi> : <React.Fragment key={index}>{segment}</React.Fragment>
  )}</>;
}

export function MathText({ text, className = '' }: { text: string; className?: string }) {
  const tokens = useMemo(() => tokenizeMath(text || ''), [text]);
  return <span className={`exam-math-text ${className}`.trim()} dir="rtl">
    {tokens.map((token, index) => token.kind === 'math'
      ? <Formula key={index} value={token.value} display={token.display} />
      : <PlainText key={index} value={token.value} />)}
  </span>;
}
