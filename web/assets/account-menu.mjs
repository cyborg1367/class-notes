// Compatibility entry for existing integrations; rendering is owned by React.
const version = new URL(import.meta.url).search;
const [model, protection] = await Promise.all([
  import(new URL('./account-model.mjs' + version, import.meta.url)),
  import(new URL('./sign-out-service.mjs' + version, import.meta.url)),
]);
export const accountIdentity = model.accountIdentity;
export const saveBeforeSignOut = protection.saveBeforeSignOut;
export function mountAccountUI(options = {}) {
  const win = options.win || options.doc?.defaultView || window;
  if (!win.ClassNotesSiteUI?.mountAccountUI) throw Error('REACT_ACCOUNT_UI_REQUIRED');
  return win.ClassNotesSiteUI.mountAccountUI(options);
}
