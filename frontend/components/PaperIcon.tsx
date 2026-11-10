import React from 'react';
import { paperIcon } from '../../web/assets/paper-icons.mjs';
// Geometry comes exclusively from the existing, code-owned icon registry.
export function PaperIcon({ name }: {
    name: string;
}) {
    return <span className="shell-icon" aria-hidden="true" dangerouslySetInnerHTML={{ __html: paperIcon(name) }}/>;
}
