import React, { memo } from 'react';

// Temporary boundary for the remaining presence service. React owns this empty
// wrapper; only the presence service owns its descendants.
export const LegacyPresenceSlot = memo(function LegacyPresenceSlot() {
  return <div className="shell-service-slot shell-presence-slot" data-shell-presence-slot="" />;
});
