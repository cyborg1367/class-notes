export const fa = (n: number) => n.toLocaleString('fa-IR');
export const en = (n: number) => n.toLocaleString('en-US', { useGrouping: false });
export const formatDate = (value?: string) =>
  value && Number.isFinite(Date.parse(value))
    ? new Date(value).toLocaleString('fa-IR', { dateStyle: 'medium', timeStyle: 'short' })
    : '';

export function quizPath(id: string, attempt?: string) {
  return 'quiz/' + id + '/' + (attempt ? '?attempt=' + encodeURIComponent(attempt) : '');
}
