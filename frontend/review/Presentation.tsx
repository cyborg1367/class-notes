import { Fragment, useEffect, useRef, type ComponentProps, type ReactNode } from 'react';
import { paperIcon, paperMark } from '../../web/assets/paper-icons.mjs';

export const fa = (n: number) => n.toLocaleString('fa-IR');
export const shortDate = (value?: string | null) =>
  value && Number.isFinite(Date.parse(value)) ? new Date(value).toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' }) : '';

export function Icon({ name }: { name: string }) {
  return <span className="rv-glyph" aria-hidden="true" dangerouslySetInnerHTML={{ __html: paperIcon(name) }} />;
}

export function ReviewArt() {
  return <span className="rv-glyph" aria-hidden="true" dangerouslySetInnerHTML={{ __html: paperMark('review', 'rv-cards') }} />;
}

// Keep Python names and numeric examples in reading order in RTL sentences.
export function TeachingText({ value }: { value?: string | null }) {
  const parts = (value ?? '').split(/(\[\s*(?:\[[\d\s,.]+\]\s*,?\s*)+\]|\[[\d\s,.]+\]|\([\d\s,.]+\)|[A-Za-z][A-Za-z0-9_]*(?:\s*=\s*[\d.]+)?)/g);
  return <>{parts.map((part, i) => i % 2 ? <bdi dir="ltr" key={i}>{part}</bdi> : <Fragment key={i}>{part}</Fragment>)}</>;
}

export function Action({ tone = 'outline', icon, children, ...props }: ComponentProps<'button'> & {
  tone?: 'primary' | 'outline' | 'text-link'; icon?: string; children: ReactNode;
}) {
  return <button type="button" className={'rv-' + tone} {...props}>{children}{icon && <> <Icon name={icon} /></>}</button>;
}

export function FocusHeading({ id, children, level = 1 }: { id: string; children: ReactNode; level?: 1 | 2 }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);
  const Heading = level === 1 ? 'h1' : 'h2';
  return <Heading id={id} ref={ref} tabIndex={-1}>{children}</Heading>;
}
