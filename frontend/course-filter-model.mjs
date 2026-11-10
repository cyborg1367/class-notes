// Public catalog search only. This module never reads account or learning state.
/** @param {unknown} value */
export function normalizeSearch(value) {
  return String(value ?? '').normalize('NFKC').toLowerCase()
    .replace(/[يى]/g, 'ی').replace(/ك/g, 'ک')
    .replace(/[\u064b-\u065f\u0670\u0640]/g, '')
    .replace(/[۰-۹]/g, c => String(c.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, c => String(c.charCodeAt(0) - 1632))
    .replace(/[\u200c\u200d\s]+/g, ' ').trim();
}

/**
 * @template {{id:string,search:string,tags:string[]}} T
 * @param {T[]} rows
 * @param {string} query
 * @param {string} topic
 * @returns {T[]}
 */
export function matchCourseRows(rows, query = '', topic = '') {
  const words = normalizeSearch(query).split(' ').filter(Boolean);
  const selected = normalizeSearch(topic);
  return rows.filter(row => {
    const text = normalizeSearch(row.search);
    return words.every(word => text.includes(word)) &&
      (!selected || row.tags.some(tag => normalizeSearch(tag) === selected));
  });
}

/** @param {{tags:string[]}[]} rows @returns {string[]} */
export function courseTopics(rows) {
  const seen = new Set();
  return rows.flatMap(row => row.tags).filter(tag => {
    const normalized = normalizeSearch(tag);
    if (!normalized || seen.has(normalized)) return false;
    seen.add(normalized); return true;
  });
}
