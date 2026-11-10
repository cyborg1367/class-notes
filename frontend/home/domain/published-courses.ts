import type { PublicCourse } from '../../catalog/types';
import { orderedLessons } from '../../catalog/order';

function route(value: string): string {
  if (!/^[a-z0-9]+(?:[/-][a-z0-9]+)*$/.test(value)) {
    throw new Error('INVALID_PUBLIC_ROUTE');
  }
  return value + '/';
}

// Publication comes from the canonical public catalog, not a guessed release
// date or private progress. Keep the authored array and all identifiers intact.
export function publishedCourses(catalog: readonly PublicCourse[]) {
  return catalog.filter(course => course.lessons.length > 0).map((course, index) => {
    const courseHref = route(course.id);
    const ordered = orderedLessons(course.lessons);
    const latest = ordered[ordered.length - 1];
    const latestHref = route(latest.lesson.id);
    if (!latest.lesson.id.startsWith(course.id + '/')) {
      throw new Error('LATEST_LESSON_OUTSIDE_COURSE');
    }
    const title = course.display_title || course.title;
    return {
      id: course.id,
      title,
      language: /^[\x00-\x7f]*$/.test(title) ? 'en' : 'fa',
      description: course.home_description || course.description || '',
      href: courseHref,
      headingId: 'home-course-title-' + (index + 1),
      notes: course.lessons.length,
      labs: course.lessons.filter(lesson => Boolean(lesson.lab)).length,
      quizzes: course.lessons.filter(lesson => Number.isInteger(lesson.quiz_version) && Number(lesson.quiz_version) > 0).length,
      latest: {
        id: latest.lesson.id,
        title: latest.lesson.title,
        subtitle: latest.lesson.subtitle || latest.lesson.description || '',
        number: latest.number,
        href: latestHref,
      },
    };
  });
}

export type PublishedCourse = ReturnType<typeof publishedCourses>[number];
