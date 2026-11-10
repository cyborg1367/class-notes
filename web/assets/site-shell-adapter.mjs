// Readiness boundary between classic bootstrap and route React entries.
function waitForEntry(doc, win, selector, key, timeout) {
  const entry = doc.querySelector(selector);
  if (!entry) return Promise.resolve();
  return new Promise((resolve, reject) => {
    let done = false;
    function finish(error) {
      if (done) return;
      done = true; clearTimeout(timer);
      entry.removeEventListener('load', loaded); entry.removeEventListener('error', failed);
      error ? reject(error) : resolve();
    }
    function loaded() {
      const ui = win[key];
      if (!ui) return finish(Error('SITE_UI_UNAVAILABLE'));
      Promise.resolve(ui.ready).then(() => finish(), finish);
    }
    function failed() { finish(Error('SITE_UI_UNAVAILABLE')); }
    const timer = setTimeout(() => finish(Error('SITE_UI_TIMEOUT')), timeout);
    entry.addEventListener('load', loaded); entry.addEventListener('error', failed);
    if (win[key]) loaded();
  });
}
export function waitForSiteUI(doc, win, timeout = 10000) {
  return waitForEntry(doc, win, 'script[data-site-ui]', 'ClassNotesSiteUI', timeout);
}
export function waitForAccountPage(doc, win, timeout = 10000) {
  return waitForEntry(doc, win, 'script[data-account-ui]', 'ClassNotesAccountPage', timeout);
}
export function waitForCoursePage(doc, win, timeout = 10000) {
  return waitForEntry(doc, win, 'script[data-course-ui]', 'ClassNotesCourseApp', timeout);
}
