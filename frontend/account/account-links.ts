import type { AccountLinks } from './contracts';

export function accountLinks(base: string): AccountLinks {
  return { account: base + 'account/', dashboard: base + 'dashboard/', review: base + 'review/', teacher: base + 'instructor/' };
}
