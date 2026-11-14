import styles from './InstructorCredit.module.css';
export const INSTRUCTOR_NAME = 'Masoud Ahangary';

/** One author credit for lesson heroes, using the existing paper typography. */
export function InstructorCredit() {
  return <p className={'instructor-credit ' + styles.credit} lang="en" dir="ltr" data-instructor-credit="">
    <span>Instructor</span><strong>{INSTRUCTOR_NAME}</strong>
  </p>;
}
