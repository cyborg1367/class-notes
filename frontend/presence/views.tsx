import { useSyncExternalStore, type ChangeEvent } from 'react';
import type { PresenceStore } from './store';

const fa = new Intl.NumberFormat('fa-IR');

export function PresenceWidget({ store }: { store: PresenceStore }) {
  const state = useSyncExternalStore(store.subscribe, store.get);
  return <details className="classroom-presence" data-react-presence="" open={state.open}
    data-connected={state.connected ? 'true' : 'false'}
    onToggle={event => store.setOpen((event.target as HTMLDetailsElement).open)}>
    <summary>
      <span className="presence-dot" aria-hidden="true" />
      <span data-presence-label="">
        {state.connected
          ? <>{fa.format(state.people.length)} <span className="presence-class-word">هم‌کلاسی</span> آنلاین</>
          : (state.status ? 'حضور نامشخص' : 'اتصال…')}
      </span>
    </summary>
    <section className="presence-popover" aria-label="هم‌کلاسی‌های آنلاین">
      <p className="presence-heading">{state.heading}</p>
      <select aria-label="انتخاب کلاس" hidden={state.courses.length < 2} value={state.courseId}
        onChange={event => store.selectCourse(event.currentTarget.value)}>
        {state.courses.map(course => <option key={course.id} value={course.id}>{course.title}</option>)}
      </select>
      <p data-presence-status="" role="status" aria-live="polite">{state.connected ? state.status : (state.status || '')}</p>
      <ul aria-label="فهرست هم‌کلاسی‌های آنلاین">
        {state.people.map(person => <li key={person.id}><span className="presence-dot" aria-hidden="true" />{person.name}</li>)}
      </ul>
      <p className="presence-note">این فهرست خودت را نمی‌شمارد. آنلاین‌بودن به معنی بازبودن سایت است، نه لزوماً مطالعه.</p>
    </section>
  </details>;
}

export function PresenceSetting({ store }: { store: PresenceStore }) {
  const state = useSyncExternalStore(store.subscribe, store.get);
  function change(event: ChangeEvent<HTMLInputElement>) {
    void store.setVisible(event.currentTarget.checked);
  }
  return <section className="presence-setting" data-presence-settings="">
    <label>
      <input type="checkbox" checked={state.visible} disabled={!state.settingReady || state.settingBusy} onChange={change} />
      <span>نمایش حضور من به هم‌کلاسی‌ها</span>
    </label>
    <p>با خاموش‌کردن این گزینه، نامت در فهرست آنلاین نمایش داده نمی‌شود.</p>
    <p data-setting-status="" role="status" aria-live="polite">{state.settingStatus}</p>
  </section>;
}
