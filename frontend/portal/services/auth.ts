import { portalDeadline } from './async';
import { portalConfig, type PublicConfiguration } from './config';

type User = { id: string; [key: string]: unknown };
type Session = { user: User; [key: string]: unknown };
type Listener = (event: string, session: Session | null) => void;
type Subscription = { unsubscribe(): void };
export type SessionPort = {
  getSession(): PromiseLike<{ data: { session: Session | null }; error?: unknown }>;
  onAuthStateChange(listener: Listener): { data?: { subscription?: Subscription } } | undefined;
};
type AuthOptions = { auth: { flowType: 'pkce'; detectSessionInUrl: boolean; persistSession: boolean;
  autoRefreshToken: boolean; storageKey: string } };

export function connectAuthProvider<T>(provider: {
  createClient(url: string, key: string, options: AuthOptions): T;
}, config: PublicConfiguration, basePath: string): T {
  if (!portalConfig(config)) throw Error('INVALID_PUBLIC_CONFIG');
  return provider.createClient(config.supabaseUrl, config.publishableKey, { auth: {
    flowType: 'pkce', detectSessionInUrl: true, persistSession: true, autoRefreshToken: true,
    storageKey: `class-notes-auth:${basePath}`,
  } });
}

// The account UI receives projected identity, not this SDK port or a token.
export function createAuthSession(auth: SessionPort, timeout = 12_000) {
  let closed = false, subscription: Subscription | undefined;
  return {
    async resolve(): Promise<Session | null> {
      if (closed) throw Error('ACCOUNT_CHANGED');
      const { data, error } = await portalDeadline(auth.getSession(), timeout, 'AUTH_SESSION_TIMEOUT');
      if (closed) throw Error('ACCOUNT_CHANGED');
      if (error) throw error;
      return data.session;
    },
    subscribe(listener: Listener) {
      if (closed) throw Error('ACCOUNT_CHANGED');
      subscription?.unsubscribe();
      subscription = auth.onAuthStateChange((event, session) => { if (!closed) listener(event, session); })?.data?.subscription;
    },
    dispose() {
      if (closed) return;
      closed = true; subscription?.unsubscribe(); subscription = undefined;
    },
  };
}
