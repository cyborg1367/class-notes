/** Public presentation metadata, separate from protected lesson bodies/answers. */
type ThreeHighlights = readonly [string, string, string];
export const lessonPresentations: Readonly<Partial<Record<string, ThreeHighlights>>> = {
  'machine-learning/vector-distance': [
    'هر سطر، بردار یک نمونه است.', 'هر ویژگی، یک مؤلفهٔ معنادار است.', 'فاصله، شباهت را عددی می‌کند.',
  ],
  'machine-learning/prediction-problem': [
    'نمونهٔ تازه را با داده‌های آموزش مقایسه می‌کنیم.', 'نزدیک‌ترین همسایه‌ها در تصمیم رأی می‌دهند.', 'تعداد همسایه‌ها روی پیش‌بینی اثر می‌گذارد.',
  ],
  'machine-learning/evaluating-knn': [
    'دادهٔ آزمون را از آموزش جدا می‌کنیم.', 'پیش‌بینی را با برچسب واقعی می‌سنجیم.', 'نوع خطاها را کنار تعدادشان می‌بینیم.',
  ],
  'machine-learning/thresholds-and-roc': [
    'همهٔ خطاها معنای یکسانی ندارند.', 'تغییر آستانه، تصمیم‌های مدل را عوض می‌کند.', 'دقت و بازیابی را کنار هم بررسی می‌کنیم.',
  ],
  'machine-learning/cross-validation': [
    'تنظیم‌ها را با چند تقسیم داده مقایسه می‌کنیم.', 'آماده‌سازی داده همراه مدل ارزیابی می‌شود.', 'آزمون نهایی تا پایان انتخاب کنار می‌ماند.',
  ],
};
export function presentationHighlights(id: string, authored: string[]) {
  const fallback: ThreeHighlights | null = authored.length === 3 ? [authored[0], authored[1], authored[2]] : null;
  const labels = lessonPresentations[id] || fallback;
  if (!labels) throw Error('LESSON_PRESENTATION_REQUIRES_THREE_HIGHLIGHTS: ' + id);
  return labels.map((label, i) => ({ number: String(i + 1).padStart(2, '0'), label }));
}

export function validateLessonPresentations(courses: { lessons: { id: string }[] }[]) {
  for (const course of courses) for (const lesson of course.lessons) {
    const highlights = lessonPresentations[lesson.id];
    if (!highlights || highlights.length !== 3 || highlights.some(label => !label.trim())) {
      throw Error('Define three learning highlights in frontend/reader/lesson-presentation.ts: ' + lesson.id);
    }
  }
}
