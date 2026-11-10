export type AccountLinks = { account: string; dashboard: string; review?: string; teacher: string };
export type AccountView = {
  phase: 'loading' | 'guest' | 'authenticated' | 'error';
  identity: { name: string; email: string; initial: string; avatar: string } | null;
  teacher: boolean;
  busy: 'in' | 'out' | null;
  links: AccountLinks;
  continueURL: string;
  notice: { text: string; error: boolean };
  openMenuId: string | null;
  focusEdge: 'first' | 'last';
  dialog: { id: number; localSaved: boolean } | null;
  focusTarget: string | null;
  focusRevision: number;
};

export type AccountHandlers = {
  onSignIn: (target?: Element) => Promise<unknown> | void;
  onSignOut: () => Promise<unknown> | void;
  onHostsChange?: () => void;
  onRetry?: () => void;
};

export type AccountPort = {
  getSnapshot: () => AccountView;
  getServerSnapshot: () => AccountView;
  subscribe: (listener: () => void) => () => void;
  configure: (handlers: AccountHandlers, links?: AccountLinks) => void;
  update: (input: unknown) => void;
  setNotice: (text: string, error?: boolean) => void;
  setContinue: (value: string) => void;
  signIn: (target?: Element) => Promise<unknown>;
  signOut: () => Promise<unknown>;
  retry: () => void;
  openMenu: (scope: string, edge?: 'first' | 'last') => void;
  closeMenu: () => void;
  hostReady: () => void;
  requestFocus: (scope: string) => void;
  confirmUnsaved: (result: { localSaved?: boolean }) => Promise<boolean>;
  resolveConfirmation: (value: boolean) => void;
  dispose: () => void;
};
