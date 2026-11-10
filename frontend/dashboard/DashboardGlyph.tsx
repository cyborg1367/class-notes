import { paperBadge, paperIcon, paperMark } from '../../web/assets/paper-icons.mjs';

const draw = { icon: paperIcon, mark: paperMark, badge: paperBadge };

// The shared paper registry returns decorative SVG using fixed geometry.
export function DashboardGlyph({ name, kind = 'icon', className = '' }: {
  name: string; kind?: keyof typeof draw; className?: string;
}) {
  return <span className="dash-glyph" aria-hidden="true"
    dangerouslySetInnerHTML={{ __html: draw[kind](name, className) }} />;
}
