const version = new URL(import.meta.url).search;
const [{ getViewChannel }, { INITIAL_HOME_VIEW, projectHomeView }] = await Promise.all([
  import(new URL('./view-channel.mjs' + version, import.meta.url)),
  import(new URL('./home-view-model.mjs' + version, import.meta.url)),
]);

// Adapter to the current auth owner. No SDK, RPC, token storage or new reads.
export function createHomeController({ host, readContext, links, onSignIn, isCurrent }) {
  const channel = getViewChannel(host, INITIAL_HOME_VIEW);
  let disposed = false;
  let pending = false;
  let errorMessage = '';
  const alive = () => !disposed && host.isConnected && isCurrent();

  function update() {
    if (!alive()) return;
    const view = projectHomeView(readContext(), links);
    channel.publish({ ...view, busy: view.busy || pending, errorMessage: view.phase === 'guest' ? errorMessage : '' });
  }

  async function signIn() {
    if (!alive() || pending) return false;
    const view = projectHomeView(readContext(), links);
    if (view.phase !== 'guest' || view.busy) return false;
    pending = true;
    errorMessage = '';
    update();
    try {
      if (!alive() || readContext().userId) return false;
      await onSignIn();
      return alive();
    } catch {
      if (alive()) errorMessage = 'ورود شروع نشد؛ دوباره تلاش کن یا صفحهٔ حساب را باز کن.';
      return false;
    } finally {
      pending = false;
      update();
    }
  }

  const release = channel.bindActions({ 'sign-in': signIn });
  update();
  return {
    update,
    dispose() {
      if (disposed) return;
      disposed = true;
      if (release()) channel.reset();
    },
  };
}
