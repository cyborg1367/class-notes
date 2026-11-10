import React, { useMemo, useRef, useState } from 'react';
import { HOME_ORIENTATION, SAMPLE_POINTS, ORBIT_ACTIONS, orbit, projectPoint } from './domain/feature-space';
import type { Point3, OrbitAction } from './domain/feature-space';

const AXIS_COLORS = ['#21665d', '#9a4e32', '#555f79'];
const FLOOR: readonly Point3[] = [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]];
const KEY_ACTIONS: Record<string, OrbitAction | undefined> = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down', Home: 'reset' };

export function FeatureSpace() {
  const [orientation, setOrientation] = useState({ ...HOME_ORIENTATION });
  const [dragging, setDragging] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const drag = useRef<{ id: number; x: number; y: number } | null>(null);
  const scene = useMemo(() => {
    const project = (point: Point3) => projectPoint(point, orientation);
    const points = [
      ...SAMPLE_POINTS.map((point, index) => ({ id: 'sample-' + index, point, query: false })),
      { id: 'query', point: [0.49, 0.48, 0.48] as Point3, query: true },
    ].map(point => ({ ...point, screen: project(point.point) })).sort((a, b) => a.screen.z - b.screen.z);
    return { project, points };
  }, [orientation]);

  function announce() {
    setAnnouncement('زاویهٔ نمایش تغییر کرد؛ مختصات و فاصلهٔ نقاط ثابت مانده‌اند.');
  }

  function action(name: OrbitAction) {
    if (name === 'reset') {
      setOrientation({ ...HOME_ORIENTATION });
      setAnnouncement('نمای اولیه بازگردانده شد.');
    } else {
      const [dx, dy] = ORBIT_ACTIONS[name];
      setOrientation(current => orbit(current, dx, dy));
      announce();
    }
  }

  function stop(event: React.PointerEvent<SVGSVGElement>) {
    if (drag.current?.id !== event.pointerId) return;
    drag.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    announce();
  }

  function line(key: string, from: Point3, to: Point3, color: string, width = 1, dash = '', opacity = 1) {
    const start = scene.project(from), end = scene.project(to);
    return <line key={key} x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke={color} strokeWidth={width} strokeDasharray={dash} opacity={opacity} strokeLinecap="round" />;
  }

  return (
    <div className={'space-view is-ready' + (dragging ? ' is-dragging' : '')} data-feature-space="">
      <svg
        className="space-canvas" viewBox="0 0 520 400" role="img" tabIndex={0}
        aria-label="نمای سه‌بعدیِ قابل چرخش؛ با کلیدهای جهت یا کشیدن بچرخانید. کلید Home نمای اولیه را بازمی‌گرداند."
        onPointerDown={event => {
          if (event.isPrimary === false || event.button !== 0) return;
          drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
          event.currentTarget.setPointerCapture?.(event.pointerId);
          setDragging(true);
        }}
        onPointerMove={event => {
          const previous = drag.current;
          if (!previous || previous.id !== event.pointerId) return;
          const dx = (event.clientX - previous.x) * 0.009;
          const dy = (event.clientY - previous.y) * 0.009;
          drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
          setOrientation(current => orbit(current, dx, dy));
        }}
        onPointerUp={stop} onPointerCancel={stop} onLostPointerCapture={stop}
        onKeyDown={event => {
          const name = KEY_ACTIONS[event.key];
          if (name) { event.preventDefault(); action(name); }
        }}
      >
        <polygon points={FLOOR.map(point => { const p = scene.project(point); return p.x + ',' + p.y; }).join(' ')} fill="#ded6bd" fillOpacity="0.48" />
        {[0, 1, 2, 3, 4].flatMap(index => {
          const t = index / 4;
          return [line('floor-x-' + index, [t, 0, 0], [t, 0, 1], '#aaa88f', 0.8), line('floor-z-' + index, [0, 0, t], [1, 0, t], '#aaa88f', 0.8)];
        })}
        {[0, 1, 2].map(axis => {
          const others = [0, 1, 2].filter(index => index !== axis);
          const end: [number, number, number] = [0, 0, 0]; end[axis] = 1.13;
          const tip = scene.project(end);
          return <g key={'axis-' + axis}>
            {[0, 1].flatMap(a => [0, 1].map(b => {
              const from: [number, number, number] = [0, 0, 0], to: [number, number, number] = [0, 0, 0];
              from[others[0]] = to[others[0]] = a; from[others[1]] = to[others[1]] = b; to[axis] = 1;
              return line('edge-' + a + '-' + b, from, to, '#8f9785', 0.9, '3 5', 0.65);
            }))}
            {line('axis', [0, 0, 0], end, AXIS_COLORS[axis], 2)}
            <circle cx={tip.x} cy={tip.y} r="3" fill={AXIS_COLORS[axis]} />
            <text x={tip.x} y={tip.y - 12} fill={AXIS_COLORS[axis]} textAnchor="middle" fontSize="16" fontWeight="700">{['x₁', 'x₂', 'x₃'][axis]}</text>
          </g>;
        })}
        {scene.points.map(point => line('projection-' + point.id, point.point, [point.point[0], 0, point.point[2]], '#8f9785', 0.8, '2 5', 0.4))}
        {scene.points.map(point => {
          const { x, y, scale, z } = point.screen;
          const radius = (point.query ? 9 : 6.5) * scale;
          const color = point.query ? '#f4d835' : '#21665d';
          return <g key={point.id} data-space-point={point.id}>
            {point.query && <circle cx={x} cy={y} r={radius + 7} fill="none" stroke={color} strokeOpacity="0.22" strokeWidth="2" />}
            <circle cx={x} cy={y} r={radius} fill={color} opacity={point.query ? 1 : Math.max(0.62, Math.min(1, 0.82 + z * 0.22))} stroke="#24241f" strokeWidth="1.4" />
            {point.query && <text x={x + radius + 7} y={y - 8} fill="#24241f" fontSize="17" fontWeight="700">q</text>}
          </g>;
        })}
      </svg>
      <div className="space-tools">
        <p>بکشید و بچرخانید <span aria-hidden="true">↔</span></p>
        <div className="space-controls" role="group" aria-label="کنترل زاویهٔ نمای سه‌بعدی">
          <button type="button" data-orbit="left" aria-label="چرخش به چپ" onClick={() => action('left')}>←</button>
          <button type="button" data-orbit="right" aria-label="چرخش به راست" onClick={() => action('right')}>→</button>
          <button type="button" data-orbit="up" aria-label="چرخش به بالا" onClick={() => action('up')}>↑</button>
          <button type="button" data-orbit="down" aria-label="چرخش به پایین" onClick={() => action('down')}>↓</button>
          <button type="button" data-orbit="reset" onClick={() => action('reset')}>نمای اولیه</button>
        </div>
      </div>
      <p className="space-legend">نقاط سبز: نمونه‌ها · نقطهٔ زرد: پرس‌وجوی q</p>
      <span className="space-status sr-only" role="status" aria-live="polite">{announcement}</span>
    </div>
  );
}
