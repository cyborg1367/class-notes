import { views, fa, message, freshFilters, resetPages, createRequestGate, overviewReport, reportPage, studentReport,
  pageArgs, collectPages, csvText, exportRows } from '../../web/assets/instructor-model.mjs';
import type { Attempt, Concept, Confirmation, Cursor, History, InstructorOptions, ListView, Page, Person, Receipt, Sheet, State, View } from './contracts';

type Download = (filename: string, text: string) => void;
export function createInstructorController(options: InstructorOptions, download: Download) {
  const { courses, catalog, rpc } = options;
  const gate = createRequestGate(options.isCurrent);
  const listeners = new Set<() => void>();
  let searchTimer: ReturnType<typeof setTimeout> | undefined, toastTimer: ReturnType<typeof setTimeout> | undefined;
  let state: State = { course: courses[0].course_id, view: 'overview', overviewLoading: true, filters: freshFilters(),
    pages: {}, concepts: [], conceptLoading: false, mutating: false, exporting: false, exportProgress: '', toast: '' };

  function publish(patch: Partial<State>) {
    if (!gate.current()) return;
    state = { ...state, ...patch };
    listeners.forEach(listener => listener());
  }
  const lessons = () => state.overview?.lessons || catalog.find(course => course.id === state.course)?.lessons || [];
  const reportName = (view: ListView) => view === 'attempts' ? 'classroom_instructor_attempts' : 'classroom_instructor_students';
  const history = (): History => ({ index: 0, cursors: [null], asOf: null, loading: true });
  const setPage = (view: ListView, data: State['pages'][ListView]) => publish({ pages: { ...state.pages, [view]: data } });
  const setFilter = (view: ListView, patch: Partial<State['filters'][ListView]>, reset = false) => {
    const filter = { ...state.filters[view], ...patch };
    if (reset) resetPages(filter);
    publish({ filters: { ...state.filters, [view]: filter } });
  };
  const setSheet = (sheet?: Sheet) => publish({ sheet });
  function toast(text: string) {
    clearTimeout(toastTimer);publish({ toast: text });
    toastTimer = setTimeout(() => publish({ toast: '' }), 6000);
  }
  function accessLost(error: unknown) {
    if (!/TEACHER_REQUIRED|CLASS_ACCESS_REQUIRED/.test(String((error as Error)?.message ?? ''))) return false;
    gate.invalidate();
    clearTimeout(searchTimer);clearTimeout(toastTimer);
    publish({ overview: undefined, pages: {}, concepts: [], sheet: undefined, confirmation: undefined, exporting: false,
      exportProgress: '', mutating: false, toast: '', accessError: error });
    return true;
  }
  async function loadOverview() {
    if (!gate.current() || state.accessError) return;
    const current = gate.ticket('overview'), course = state.course;
    publish({ overviewLoading: true });
    try {
      const overview = overviewReport(await rpc('classroom_instructor_overview', { p_course: course }));
      if (current()) publish({ overview, overviewError: undefined, overviewLoading: false });
    } catch (error) {
      if (current() && !accessLost(error)) publish({ overviewError: error, overviewLoading: false });
    }
  }
  async function loadList(view: ListView) {
    if (!gate.current() || state.accessError) return;
    clearTimeout(searchTimer);
    const current = gate.ticket('list-' + view), args = pageArgs(view, state.course, state.filters[view]);
    setPage(view, { loading: true });
    try {
      const page = reportPage(await rpc(reportName(view), args));
      if (!current()) return;
      if (view !== 'attempts') page.rows.forEach(studentReport);
      if (page.as_of) setFilter(view, { asOf: page.as_of });
      setPage(view, { data: page });
    } catch (error) { if (current() && !accessLost(error)) setPage(view, { error }); }
  }
  async function loadConcepts() {
    if (!gate.current() || state.accessError) return;
    const current = gate.ticket('concepts');
    publish({ conceptLoading: true, conceptError: undefined });
    try {
      const concepts = await rpc('classroom_instructor_questions', { p_course: state.course });
      if (!current()) return;
      if (!Array.isArray(concepts)) throw Error('INVALID_INSTRUCTOR_RESPONSE');
      publish({ concepts, conceptLoading: false });
    } catch (error) { if (current() && !accessLost(error)) publish({ conceptError: error, conceptLoading: false }); }
  }
  function loadCurrent() {
    clearTimeout(searchTimer);
    if (state.view === 'overview') return loadOverview();
    if (state.view === 'attempts' && state.filters.attempts.section === 'concepts') return loadConcepts();
    return loadList(state.view);
  }
  function cancelExport() { gate.cancel('export'); publish({ exporting: false, exportProgress: '' }); }
  function navigate(view: View) {
    if (!views.some(([id]) => id === view) || state.mutating || state.accessError || view === state.view) return;
    clearTimeout(searchTimer);cancelExport();publish({ view });void loadCurrent();
  }
  function changeCourse(course: string) {
    if (!courses.some(item => item.course_id === course) || course === state.course || state.mutating) return;
    clearTimeout(searchTimer);clearTimeout(toastTimer);gate.invalidate();
    publish({ course, overview: undefined, overviewError: undefined, overviewLoading: true, filters: freshFilters(), pages: {},
      concepts: [], conceptError: undefined, conceptLoading: false, sheet: undefined, confirmation: undefined, exporting: false,
      exportProgress: '', mutating: false, accessError: undefined, toast: '' });
    void loadOverview();if (state.view !== 'overview') void loadCurrent();
  }
  function query(value: string, defer = true) {
    if (state.view === 'overview' || state.view === 'requests' || state.accessError) return;
    const view = state.view;
    gate.cancel('list-' + view);cancelExport();clearTimeout(searchTimer);
    setFilter(view, { query: value.slice(0, 120) }, true);
    if (defer) searchTimer = setTimeout(() => { if (gate.current() && state.view === view) void loadList(view); }, 250);
  }
  function changeFilter(field: 'status'|'lesson'|'kind', value: string) {
    const view = state.view;if (view === 'overview') return;
    cancelExport();setFilter(view, { [field]: field === 'lesson' ? value || null : value }, true);void loadCurrent();
  }
  function setSection(section: 'attempts'|'concepts') {
    cancelExport();setFilter('attempts', { section });
    if (state.view !== 'attempts') navigate('attempts');else void loadCurrent();
  }
  function mission(value: string) { cancelExport();setFilter('labs', { mission: value }); }
  function page(direction: -1|1) {
    const view = state.view;if (view === 'overview') return;
    const filter = state.filters[view], cursor = state.pages[view]?.data?.next_cursor;
    if (state.pages[view]?.loading || (direction > 0 && !cursor) || (direction < 0 && !filter.index)) return;
    const cursors = filter.cursors.slice(), index = filter.index + direction;
    if (direction > 0) cursors[index] = cursor as Cursor;
    setFilter(view, { cursors, index });void loadList(view);
  }
  function refresh() {
    cancelExport();
    if (state.view === 'overview') return loadOverview();
    if (state.accessError) return;
    setFilter(state.view, {}, true);
    return Promise.allSettled([loadOverview(), loadCurrent()]);
  }
  function closeSheet() {
    if (state.mutating) return;
    gate.cancel('sheet');gate.cancel('history');gate.cancel('prepare-member');setSheet();
  }
  async function loadHistory(next?: History) {
    const sheet = state.sheet;if (sheet?.kind !== 'student') return;
    const current = gate.ticket('history'), course = state.course, user = sheet.user;
    const h = next || sheet.history;
    setSheet({ ...sheet, history: { ...h, loading: true, error: undefined } });
    const same = () => current() && state.sheet?.kind === 'student' && state.sheet.user === user;
    try {
      const data = reportPage(await rpc('classroom_instructor_attempts', {
        p_course: course, p_user: user, p_limit: 5, p_after: h.cursors[h.index], p_as_of: h.asOf,
      }));
      if (same()) setSheet({ ...sheet, history: { ...h, data, loading: false, error: undefined, asOf: data.as_of } });
    } catch (error) {
      if (same() && !accessLost(error)) setSheet({ ...sheet, history: { ...h, loading: false, error } });
    }
  }
  function historyPage(direction: -1|1) {
    const sheet = state.sheet;if (sheet?.kind !== 'student' || sheet.history.loading) return;
    const h = sheet.history, cursor = h.data?.next_cursor;
    if ((direction > 0 && !cursor) || (direction < 0 && !h.index)) return;
    const cursors = h.cursors.slice(), index = h.index + direction;
    if (direction > 0) cursors[index] = cursor as Cursor;
    void loadHistory({ ...h, cursors, index });
  }
  async function student(user: string, kind: 'student'|'request' = 'student') {
    if (!gate.current() || state.accessError) return;
    gate.cancel('history');const current = gate.ticket('sheet');
    const sheet: Sheet = { kind, user, history: history() };setSheet(sheet);
    try {
      const person = studentReport(await rpc('classroom_instructor_student', { p_course: state.course, p_user: user }));
      if (!current()) return;
      setSheet({ ...sheet, person });
      if (kind === 'student') void loadHistory();
    } catch (error) { if (current() && !accessLost(error)) setSheet({ ...sheet, error }); }
  }
  async function attempt(id: string, from?: string) {
    if (!gate.current() || state.accessError) return;
    const rows = state.pages.attempts?.data?.rows as Attempt[] | undefined;
    const historyRows = state.sheet?.kind === 'student' ? state.sheet.history.data?.rows : undefined;
    const row = rows?.find(attempt => attempt.id === id) || historyRows?.find(attempt => attempt.id === id);
    gate.cancel('history');const current = gate.ticket('sheet');
    const sheet: Sheet = { kind: 'attempt', id, from, row };setSheet(sheet);
    try {
      const record = await rpc('classroom_attempt', { p_id: id }) as Receipt;
      if (!current()) return;
      if (!record?.result || !record.lesson_id || !lessons().some(lesson => lesson.id === record.lesson_id)) throw Error('INVALID_INSTRUCTOR_RESPONSE');
      setSheet({ ...sheet, record });
    } catch (error) { if (current() && !accessLost(error)) setSheet({ ...sheet, error }); }
  }
  function question(concept: Concept) {
    gate.cancel('sheet');gate.cancel('history');setSheet({ kind: 'question', question: concept });
  }
  function knownPerson(user: string) {
    const sheet = state.sheet;
    if ((sheet?.kind === 'student' || sheet?.kind === 'request') && sheet.person?.user_id === user) return sheet.person;
    return Object.values(state.pages).flatMap(page => page?.data?.rows ?? [])
      .find((row): row is Person => 'user_id' in row && row.user_id === user && Boolean(row.status));
  }
  async function askMembership(user: string) {
    if (!gate.current() || state.mutating || state.accessError) return;
    const current = gate.ticket('prepare-member'), course = state.course;
    let person = knownPerson(user);
    if (!person) { await student(user, 'request');person = knownPerson(user); }
    if (!current() || course !== state.course || !person) return;
    publish({ confirmation: { course, user, status: person.status === 'active' ? 'suspended' : 'active',
      name: person.name, email: person.email, busy: false } });
  }
  function cancelConfirmation() { if (!state.confirmation?.busy) publish({ confirmation: undefined }); }
  async function commitMembership() {
    const c = state.confirmation;
    if (!c || c.busy || c.course !== state.course || !gate.current()) return;
    const current = gate.ticket('membership');
    publish({ mutating: true, confirmation: { ...c, busy: true, error: undefined } });
    try {
      await rpc('classroom_membership', { p_course: c.course, p_user: c.user, p_status: c.status });
      if (!current()) return;
      const filters = { ...state.filters };
      for (const key of Object.keys(filters) as ListView[]) { filters[key] = { ...filters[key] };resetPages(filters[key]); }
      publish({ mutating: false, confirmation: undefined, filters, pages: {}, overviewError: undefined });
      closeSheet();toast('دسترسی ' + (c.name || 'دانشجو') + ' ' + (c.status === 'active' ? 'فعال' : 'غیرفعال') + ' شد.');
      if (state.view === 'overview') await loadOverview();else await Promise.allSettled([loadOverview(), loadCurrent()]);
    } catch (error) {
      if (current() && !accessLost(error)) publish({ mutating: false, confirmation: { ...c, busy: false, error } });
    }
  }
  async function exportCSV() {
    const view = state.view;
    if (state.exporting || state.accessError || view === 'overview' || view === 'requests' ||
        (view === 'attempts' && state.filters.attempts.section === 'concepts')) return;
    const current = gate.ticket('export'), filter = { ...state.filters[view], index: 0, cursors: [null] };
    publish({ exporting: true, exportProgress: 'در حال دریافت همهٔ ردیف‌های فیلترشده…' });
    try {
      const rows = await collectPages(args => rpc(reportName(view), args), pageArgs(view, state.course, filter, 100),
        { alive: current, onProgress: (n, total) => { if (current()) publish({ exportProgress: fa(n) + ' از ' + fa(total) + ' ردیف دریافت شد.' }); } });
      if (!current()) return;
      download('classroom-' + view + '-' + new Date().toISOString().slice(0,10) + '.csv', csvText(exportRows(view, rows, filter.mission)));
      toast('CSV شامل ' + fa(rows.length) + ' ردیف فیلترشده آماده شد.');
    } catch (error) { if (current() && !accessLost(error)) toast(message(error)); }
    finally { if (current()) publish({ exporting: false, exportProgress: '' }); }
  }
  return {
    getSnapshot: () => state,
    subscribe(fn: () => void) { listeners.add(fn);return () => listeners.delete(fn); },
    loadOverview, navigate, changeCourse, query, changeFilter, setSection, mission, page, refresh, closeSheet, student, attempt,
    question, askMembership, commitMembership, cancelConfirmation, exportCSV, historyPage, loadHistory, loadConcepts,
    clearQuery() { query('', false);if (state.view !== 'overview') void loadList(state.view); },
    dispose() { gate.dispose();clearTimeout(searchTimer);clearTimeout(toastTimer);listeners.clear(); },
  };
}
export type Controller = ReturnType<typeof createInstructorController>;
