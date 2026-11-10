import React, { useEffect, useRef, useState } from 'react';

const source = 'https://skills.wheresryan.sh/anatomy/collection/gradient-descent';
type Figure = typeof import('anatomy-figures/gradient-descent').default;
type FallbackState = 'waiting' | 'failed';

// The illustration paints inside a shadow root. Pass the site palette through
// the author's theme API instead of changing its SVG or interaction code.
const paperTokens = {
  '--anatomy-page': 'transparent',
  '--anatomy-card': 'transparent',
  '--anatomy-paper': 'var(--kit-surface)',
  '--anatomy-top': '#faf3df',
  '--anatomy-face': '#efe7d1',
  '--anatomy-shade-0': '#cdbf9f',
  '--anatomy-shade-1': '#dcd0b4',
  '--anatomy-shade-2': '#e7dcc2',
  '--anatomy-shade-3': '#f1e8d1',
  '--anatomy-lit-top': '#f8ebbb',
  '--anatomy-lit-shade': '#e9d7a3',
  '--anatomy-hi': 'var(--kit-forest)',
  '--anatomy-mid': 'var(--kit-muted)',
  '--anatomy-lo': 'var(--kit-rule-strong)',
  '--anatomy-faint': 'var(--kit-rule)',
  '--anatomy-lit': 'var(--kit-forest)',
  '--anatomy-blue': 'var(--kit-forest)',
  '--anatomy-text': 'var(--kit-muted)',
  '--anatomy-strong': 'var(--kit-ink)',
  '--anatomy-muted': 'var(--kit-muted)',
  '--anatomy-mono': 'var(--kit-font-code)',
} satisfies NonNullable<React.ComponentProps<Figure>['tokens']>;

// Scope finishes to Anatomy 0.1.0's existing shadow SVG parts.
const illustrationStyles = `
  :host .iso .iso-plate {
    padding: 0;
    margin: 0;
    width: auto;
    border: 0;
    background: transparent;
    box-shadow: none;
    --anatomy-paper: var(--kit-surface);
  }
  :host .iso .iso-plate-corners { display: none; }
  :host .iso .iso-stage:focus-visible {
    outline: 2px solid var(--kit-forest);
    outline-offset: -2px;
  }

  /* The baseboard is the solid immediately before its fasteners and terrain. */
  :host .gd-svg > .iso-solid:has(+ .iso-line + .iso-line + .iso-dots + .iso-halo + .gd-board[data-level="0"]) {
    --anatomy-paper: #1e514b;
    --anatomy-top: #27615a;
    --anatomy-shade-0: #183f39;
    --anatomy-shade-1: #1b4640;
    --anatomy-shade-2: #1f4c46;
    --anatomy-shade-3: #25564e;
    --anatomy-mid: #143f38;
  }
  :host .gd-svg > .iso-solid:has(+ .iso-line + .iso-line + .iso-dots + .iso-halo + .gd-board[data-level="0"]) > .iso-bevel {
    stroke: #c9a058;
    stroke-width: 1.2px;
    opacity: 1;
  }
  :host .gd-svg > .iso-dots:has(+ .iso-halo + .gd-board[data-level="0"]) {
    --anatomy-mid: #e0bb78;
  }
  :host .gd-svg > .iso-solid:has(+ .iso-dots + [data-gd-column="lower"]) {
    --anatomy-paper: #22554b;
    --anatomy-top: #397166;
    --anatomy-shade-0: #153e37;
    --anatomy-shade-1: #1c4940;
    --anatomy-shade-2: #25554a;
    --anatomy-shade-3: #2e6156;
    --anatomy-mid: #1b413a;
  }
  :host .gd-svg :is([data-gd-column], [data-gd-rider]) {
    --anatomy-paper: #b38a50;
    --anatomy-top: #e1bd78;
    --anatomy-shade-0: #8b6638;
    --anatomy-shade-1: #a37a43;
    --anatomy-shade-2: #b89054;
    --anatomy-shade-3: #caa363;
    --anatomy-hi: #f4dba1;
    --anatomy-mid: #604921;
    --anatomy-lo: #806239;
    --anatomy-faint: #d4b477;
  }
  :host .gd-svg > .iso-solid:has(+ .iso-line + .gd-spare[data-gd-spare="0"]) {
    --anatomy-top: #f8edcf;
    --anatomy-shade-3: #d8c6a2;
  }

  :host .gd-svg :is(.gd-board, .gd-near, .gd-block) {
    --anatomy-paper: #dce5d3;
    --anatomy-top: var(--kit-sage);
    --anatomy-shade-0: #9eb196;
    --anatomy-shade-1: #b0bfa4;
    --anatomy-shade-2: #c3d1b7;
    --anatomy-shade-3: #d8e2cf;
    --anatomy-mid: #687e65;
  }
  :host .gd-svg :is(.gd-board, .gd-near)[data-level="0"],
  :host .gd-svg :is(.gd-board, .gd-near)[data-level="1"],
  :host .gd-svg :is(.gd-board, .gd-near)[data-level="2"],
  :host .gd-svg :is(.gd-board, .gd-near)[data-level="3"] {
    --anatomy-paper: #c8d7bf;
    --anatomy-top: #d2dfca;
    --anatomy-shade-0: #90a589;
    --anatomy-shade-1: #a3b59b;
    --anatomy-shade-2: #b6c7ac;
    --anatomy-shade-3: #c4d3b9;
  }
  :host .gd-svg :is(.gd-board, .gd-near)[data-level="8"],
  :host .gd-svg :is(.gd-board, .gd-near)[data-level="9"],
  :host .gd-svg :is(.gd-board, .gd-near)[data-level="10"] {
    --anatomy-paper: #eee8d3;
    --anatomy-top: #f5efd9;
    --anatomy-shade-0: #bebc9c;
    --anatomy-shade-1: #cecdb0;
    --anatomy-shade-2: #dcddc1;
    --anatomy-shade-3: #e7e7d0;
  }
  :host .gd-svg .gd-thread {
    stroke: var(--kit-forest);
    stroke-width: 1.25px;
  }
  :host .gd-svg .gd-head[data-lit] > .iso-top { fill: var(--kit-ochre); }
  :host .gd-svg .gd-head[data-lit] > :is(.iso-fill, .iso-shade) { fill: #976b33; }
  :host .gd-svg .gd-head[data-lit] > .iso-edge { stroke: var(--kit-ink); }

  /* The two unlabelled solids just before the pointer are the knob's tiers. */
  :host .gd-svg > .iso-solid:has(+ .iso-line + .iso-line + [data-gd-pointer]),
  :host .gd-svg > .iso-solid:has(+ .iso-solid + .iso-line + .iso-line + [data-gd-pointer]) {
    --anatomy-paper: #225c52;
    --anatomy-top: var(--kit-forest);
    --anatomy-shade-0: var(--kit-forest-hover);
    --anatomy-shade-1: #174b43;
    --anatomy-shade-2: #21594f;
    --anatomy-shade-3: #316d61;
    --anatomy-mid: #7b9b89;
  }
  :host .gd-svg [data-gd-pointer] {
    stroke: var(--kit-ochre);
    stroke-width: 1.7px;
  }
`;

function BareFigure({ figure: FigureComponent }: { figure: Figure }) {
  const figure = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = figure.current, shadow = element?.shadowRoot;
    if (!element || !shadow) return;
    // Tighten the empty margins. Anatomy maps pointer positions through the
    // SVG's screen transform, so the original geometry and hit areas stay intact.
    const drawing = shadow.querySelector<SVGSVGElement>('.gd-svg[viewBox="0 0 600 420"]');
    drawing?.setAttribute('viewBox', '70 58 460 300');
    const style = element.ownerDocument.createElement('style');
    style.dataset.gradientObjectOnly = '';
    style.textContent = illustrationStyles;
    shadow.append(style);
    return () => {
      style.remove();
      drawing?.setAttribute('viewBox', '0 0 600 420');
    };
  }, []);

  return <div dir="ltr"><FigureComponent ref={figure} theme="paper" tokens={paperTokens} /></div>;
}

function FigureFallback({ phase }: { phase: FallbackState }) {
  return <div className="gradient-hero-placeholder" role="status">
    {phase === 'waiting' ? 'در حال آماده‌سازی نمودار…' : <a href={source}>باز کردن دموی اصلی</a>}
  </div>;
}

class FigureBoundary extends React.Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <FigureFallback phase="failed" /> : this.props.children; }
}

export function GradientHero() {
  const host = useRef<HTMLDivElement>(null);
  const [FigureComponent, setFigure] = useState<Figure | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const node = host.current, win = node?.ownerDocument.defaultView;
    if (!node || !win?.IntersectionObserver || !win.matchMedia) { setFailed(true); return; }
    let active = true, started = false;
    const observer = new win.IntersectionObserver(entries => {
      if (started || !entries.some(entry => entry.isIntersecting)) return;
      started = true;
      observer.disconnect();
      void import('anatomy-figures/gradient-descent').then(({ default: Figure }) => {
        if (active) setFigure(() => Figure);
      }).catch(() => { if (active) setFailed(true); });
    }, { rootMargin: '120px 0px' });
    observer.observe(node);
    return () => { active = false; observer.disconnect(); };
  }, []);

  return <figure className="gradient-hero" aria-label="گرادیان کاهشی">
    <div className="gradient-hero-art" ref={host} data-gradient-hero="">
      {FigureComponent
        ? <FigureBoundary><BareFigure figure={FigureComponent} /></FigureBoundary>
        : <FigureFallback phase={failed ? 'failed' : 'waiting'} />}
      <noscript><p className="gradient-hero-no-script"><a href={source}>مشاهدهٔ نمودار در سایت سازنده</a></p></noscript>
    </div>
    <figcaption className="gradient-hero-caption">
      نمونهٔ تعاملی · حرکت روی سطح خطا
    </figcaption>
  </figure>;
}
