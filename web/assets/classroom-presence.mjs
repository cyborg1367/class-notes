// Display state only. Identity, visibility, distinct users and leases come from RPCs.
export function presenceMembers(value, self) {
    const seen = new Set(), out = [];
    for (const item of Array.isArray(value) ? value : []) {
        if (!item || typeof item.id !== 'string' || item.id === self || seen.has(item.id)) continue;
        seen.add(item.id);
        const name = typeof item.name === 'string' && !item.name.includes('@')
            ? item.name.replace(/[\u0000-\u001f\u007f]/g, '').slice(0, 60).trim() : 'هم‌کلاسی';
        out.push({ id: item.id, name: name || 'هم‌کلاسی' });
    }
    return out;
}
