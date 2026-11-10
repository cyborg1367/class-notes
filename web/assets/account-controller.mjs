import { createViewChannel } from './view-channel.mjs';
import { initialAccountView, accountPresentation, accountContinueURL } from './account-model.mjs';

// Account presentation/action port. SDK state and auth tokens stay with portal.js.
// The owner identifier below is an async race guard, never part of the view DTO.
export function createAccountController({ links, documentURL = 'https://static.invalid/' }) {
  const channel = createViewChannel(initialAccountView(links));
  const serverSnapshot = channel.getSnapshot();
  let disposed = false, owner = null, epoch = 0, pending = null, confirmation = null;
  let source = { phase: 'loading', identity: null, teacher: false, busy: null };
  let handlers = { onSignIn: async () => {}, onSignOut: async () => {}, onHostsChange: () => {}, onRetry: () => {} };
  let dialogSerial = 0;

  function publish(patch) {
    if (disposed) return;
    const next = { ...channel.getSnapshot(), ...patch };
    if (JSON.stringify(next) !== JSON.stringify(channel.getSnapshot())) channel.publish(next);
  }

  function resolveConfirmation(value) {
    const current = confirmation;
    confirmation = null;
    publish({ dialog: null });
    current?.resolve(Boolean(value) && current.epoch === epoch);
  }

  function update(input) {
    if (disposed) return;
    const nextOwner = input.user?.id || null;
    const ownerChanged = nextOwner !== owner;
    if (ownerChanged) {
      epoch++;
      owner = nextOwner;
      pending = null;
      resolveConfirmation(false);
    }
    const next = accountPresentation(input);
    const changed = JSON.stringify(source) !== JSON.stringify(next);
    source = next;
    publish({ ...source, busy: source.busy || pending, ...(changed || ownerChanged ? { openMenuId: null } : {}) });
  }

  async function request(action, target) {
    if (disposed || pending || source.busy) return false;
    if (action === 'in' && source.phase !== 'guest') return false;
    if (action === 'out' && source.phase !== 'authenticated') return false;
    const ticket = epoch;
    pending = action;
    publish({ busy: action, openMenuId: null });
    try {
      if (disposed || epoch !== ticket) return false;
      await (action === 'in' ? handlers.onSignIn(target) : handlers.onSignOut());
      return !disposed && epoch === ticket;
    } catch {
      if (!disposed && epoch === ticket) publish({ notice: { text: action === 'in' ? 'ورود انجام نشد؛ دوباره تلاش کن.' : 'خروج انجام نشد؛ دوباره تلاش کن.', error: true } });
      return false;
    } finally {
      if (!disposed && epoch === ticket) {
        pending = null;
        publish({ busy: source.busy });
      }
    }
  }

  return {
    getSnapshot: channel.getSnapshot,
    getServerSnapshot: () => serverSnapshot,
    subscribe: channel.subscribe,
    update,
    configure(nextHandlers, nextLinks = links) {
      if (disposed) return;
      handlers = { ...handlers, ...nextHandlers };
      links = nextLinks;
      publish({ links });
    },
    setNotice(text, error = false) { publish({ notice: { text: String(text || ''), error: Boolean(error) } }); },
    setContinue(value) { publish({ continueURL: accountContinueURL(value, links, documentURL) }); },
    signIn: target => request('in', target),
    signOut: () => request('out'),
    retry() { if (!disposed && source.phase === 'error') handlers.onRetry(); },
    openMenu(scope, edge = 'first') {
      if (!disposed && source.phase === 'authenticated' && !source.busy && !pending) publish({ openMenuId: scope, focusEdge: edge });
    },
    closeMenu() { publish({ openMenuId: null }); },
    hostReady() { if (!disposed) handlers.onHostsChange(); },
    requestFocus(scope) { publish({ focusTarget: scope, focusRevision: channel.getSnapshot().focusRevision + 1 }); },
    confirmUnsaved(result) {
      if (disposed || confirmation || source.phase !== 'authenticated') return Promise.resolve(false);
      return new Promise(resolve => {
        confirmation = { resolve, epoch };
        publish({ openMenuId: null, dialog: { id: ++dialogSerial, localSaved: Boolean(result?.localSaved) } });
      });
    },
    resolveConfirmation,
    dispose() {
      if (disposed) return;
      resolveConfirmation(false);
      disposed = true;
      epoch++;
      channel.reset();
      owner = null;
      source = { phase: 'loading', identity: null, teacher: false, busy: null };
      handlers = { onSignIn: async () => {}, onSignOut: async () => {}, onHostsChange: () => {}, onRetry: () => {} };
    },
  };
}
