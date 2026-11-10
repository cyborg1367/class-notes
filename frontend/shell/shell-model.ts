import { accountLinks } from '../account/account-links';
import type { AccountLinks } from '../account/contracts';
const pageKinds = ['home', 'course', 'lesson', 'quiz', 'lab', 'review', 'notifications', 'account', 'dashboard', 'instructor', 'about'] as const;
export type ShellPage = {
    route: string;
    page: typeof pageKinds[number];
};
export type ShellLink = {
    id: string;
    label: string;
    href: string;
    icon: string;
    current?: 'page' | 'location';
};
export type ShellModel = {
    home: string;
    logo: string;
    account: string;
    accountLinks: AccountLinks;
    links: ShellLink[];
};
export function parseShellPage(input: unknown): ShellPage {
    if (!input || typeof input !== 'object')
        throw Error('INVALID_SHELL_PAGE');
    const value = input as Record<string, unknown>;
    if (typeof value.route !== 'string' || !/^(?:[a-z0-9-]+\/)*index\.html$/.test(value.route)
        || typeof value.page !== 'string' || !pageKinds.some(kind => kind === value.page))
        throw Error('INVALID_SHELL_PAGE');
    return { route: value.route, page: value.page as ShellPage['page'] };
}
// Public routing only. Session, membership, XP and RPCs never enter this model.
export function shellModel({ route, page }: ShellPage, version = 'build'): ShellModel {
    if (!/^(?:[a-z0-9-]+\/)*index\.html$/.test(route))
        throw Error('INVALID_SHELL_ROUTE');
    const base = '../'.repeat(route.split('/').length - 1), home = base + 'index.html';
    const current = ['course', 'lesson', 'quiz', 'lab'].includes(page) ? 'classes' : page;
    const links: ShellLink[] = [
        { id: 'home', label: 'صفحهٔ اصلی', href: home, icon: 'home' },
        { id: 'classes', label: 'کلاس‌ها', href: home + '#classes', icon: 'courses' },
        { id: 'review', label: 'دفتر مرور', href: base + 'review/', icon: 'review' },
        { id: 'about', label: 'دربارهٔ مدرس', href: base + 'about/', icon: 'user' },
    ];
    return { home, logo: base + 'assets/logo.svg?v=' + encodeURIComponent(version), account: base + 'account/', accountLinks: accountLinks(base),
        links: links.map(link => ({ ...link, ...(link.id === current ? { current: current === 'classes' ? 'location' as const : 'page' as const } : {}) })) };
}
