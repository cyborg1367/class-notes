import { orderedLessons } from '../catalog/order';
import type { BinaryPlot, LessonInfo } from './contracts';

export function lessonNeighbors({ id, course }: LessonInfo) {
  const lessons = orderedLessons(course.lessons);
  const index = lessons.findIndex(({ lesson }) => lesson.id === id);
  return {
    previous: index > 0 ? lessons[index - 1] : undefined,
    next: index >= 0 ? lessons[index + 1] : undefined,
  };
}

const isPoint = (value: unknown): value is [number, number] =>
  Array.isArray(value) && value.length === 2 && value.every(n => typeof n === 'number' && Number.isFinite(n) && n >= 0 && n <= 10);

export function binaryPlot(raw: string | null | undefined): BinaryPlot | null {
  if (!raw) return null;
  try {
    const { X, y, names, query } = JSON.parse(raw);
    if (!Array.isArray(X) || X.length < 1 || X.length > 200 || !X.every(isPoint) ||
      !Array.isArray(y) || y.length !== X.length || !y.every(n => n === 0 || n === 1) ||
      !Array.isArray(names) || names.length !== X.length || !names.every(n => typeof n === 'string') ||
      !isPoint(query)) return null;
    return { query, points: X.map(([x, py], i) => ({ x, y: py, positive: y[i] === 1, label: names[i].slice(0, 40) })) };
  } catch { return null; }
}
