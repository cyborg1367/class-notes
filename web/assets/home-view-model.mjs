export const INITIAL_HOME_VIEW = Object.freeze({
  phase: 'loading',
  busy: false,
  accountURL: 'account/',
  dashboardURL: 'dashboard/',
  errorMessage: '',
});

// This DTO deliberately contains no session, user metadata, scores or access
// grants. Signed in does not imply membership of any class.
export function projectHomeView(context, links) {
  return {
    phase: !context.ready ? 'loading' : context.userId ? 'authenticated' : context.error ? 'error' : 'guest',
    busy: Boolean(context.busy),
    accountURL: links.account,
    dashboardURL: links.dashboard,
  };
}
