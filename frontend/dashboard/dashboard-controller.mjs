// Adapts the existing portal services to dashboard views. No React, DOM mutation,
// SDK access, or learner writes outside the existing membership action.
/** @param {import('./controller-contracts').DashboardControllerPorts} ports
 * @returns {import('./controller-contracts').DashboardController} */
export function createDashboardController({
  renderer, catalog, context, isCurrent, rpc, refreshAccess, studyFor, login, link, storage,
}) {
  let revision = 0, disposed = false, membershipBusy = false;

  async function load() {
    if (disposed || !isCurrent()) return;
    const ticket = ++revision;
    const alive = () => !disposed && isCurrent() && ticket === revision;
    const { user, state, serviceError, labSnapshots } = context();
    const memberships = Array.isArray(state?.memberships) ? state.memberships : [];
    const reviewKey = user && 'classroom-review:' + user.id;
    const byCourse = new Map(memberships.map(item => [item.course_id, item]));
    const active = catalog.filter(course => byCourse.get(course.id)?.status === 'active');
    const actions = {
      link,
      retry: () => refresh(),
      refreshMembership: () => refresh(),
      requestAccess: courseId => refresh(courseId),
      saveBookmarks: ids => { if (alive() && reviewKey) storage.write(reviewKey, ids); },
    };

    async function refresh(courseId) {
      if (!alive() || !user || membershipBusy) return;
      if (courseId && (!catalog.some(course => course.id === courseId) || byCourse.has(courseId))) return;
      membershipBusy = true;
      try {
        if (courseId) await rpc('classroom_request_access', { p_course: courseId });
        if (!alive()) return;
        await refreshAccess();
        if (alive()) await load();
      } finally { membershipBusy = false; }
    }

    if (!user) { renderer.render({ phase: 'guest', login: login() }, actions); return; }
    if (serviceError) { renderer.render({ phase: 'error', kind: 'membership' }, actions); return; }
    renderer.render({ phase: 'loading' }, actions);
    try {
      const lessons = active.flatMap(course => course.lessons);
      const labs = lessons.filter(lesson => lesson.lab);
      const snapshots = labSnapshots
        ? labs.map(lesson => labSnapshots[lesson.lab.mission] ?? { status: 'rejected' })
        : await Promise.allSettled(labs.map(lesson => rpc('classroom_lab_state', { p_mission: lesson.lab.mission })));
      if (!alive()) return;

      const lessonIds = new Set(lessons.map(lesson => lesson.id));
      const results = (state?.results ?? []).filter(receipt => lessonIds.has(receipt.lesson_id))
        .sort((a, b) => (Date.parse(b.last_at) || 0) - (Date.parse(a.last_at) || 0));
      const pending = catalog.filter(course => byCourse.get(course.id)?.status !== 'active').map(course => {
        const membership = byCourse.get(course.id);
        const status = membership?.status;
        return { id: course.id, title: course.display_title || course.title,
          status: status === 'pending' || status === 'suspended' ? status : membership ? 'unavailable' : 'unregistered' };
      });
      const saved = storage.read(reviewKey);
      const name = String(user.user_metadata?.full_name || user.user_metadata?.name || '').trim();
      const view = {
        phase: 'ready',
        name: name && !name.includes('@') ? name.split(/\s+/)[0].slice(0, 40) : 'دوست من',
        memberships: pending,
        bookmarks: Array.isArray(saved) ? saved.filter(id => lessonIds.has(id)) : [],
        reviewDue: null,
        input: {
          courses: active, results, study: Object.fromEntries(active.map(course => [course.id, studyFor(course)])),
          states: Object.fromEntries(labs.map((lesson, i) => [lesson.id, snapshots[i]])),
        },
      };
      renderer.render(view, actions);
      void rpc('classroom_review_summary').then(value => {
        if (!alive() || value?.due_count == null) return;
        const due = Number(value.due_count);
        if (Number.isSafeInteger(due) && due >= 0) renderer.render({ ...view, reviewDue: due }, actions);
      }).catch(() => {});
    } catch {
      if (alive()) renderer.render({ phase: 'error', kind: 'dashboard' }, actions);
    }
  }

  return {
    load,
    dispose() {
      disposed = true;
      renderer.dispose();
    },
  };
}
