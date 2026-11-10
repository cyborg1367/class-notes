import React, { memo } from 'react';

// Empty mount point. React presence portals into this slot; the portal owns RPC.
export const LegacyPresenceSlot = memo(function LegacyPresenceSlot() {
  return <div className="shell-service-slot shell-presence-slot" data-shell-presence-slot="" />;
});
