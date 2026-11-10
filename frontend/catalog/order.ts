export function lessonNumber(value: string | undefined, position: number): number {
  const text = String(value ?? '').trim();
  const number = /^[+-]?\d+$/.test(text) ? Number(text) : 0;
  return Number.isSafeInteger(number) && number > 0 ? number : position + 1;
}

// Catalog numbers are the teaching order. Preserve authored order for ties.
export function orderedLessons<T extends { number?: string }>(lessons: readonly T[]) {
  return lessons.map((lesson, position) => ({
    lesson, number: lessonNumber(lesson.number, position), position,
  })).sort((a, b) => a.number - b.number || a.position - b.position);
}
