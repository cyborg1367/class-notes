import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { validateLessonPresentations } from '../.cache/react/course-render.mjs';

test('Every published lesson has the required three learning highlights', () => {
  const catalog = JSON.parse(fs.readFileSync('web/assets/catalog.json','utf8'));
  assert.doesNotThrow(() => validateLessonPresentations(catalog));
});
test('An unconfigured new lesson cannot silently ship without its highlights', () => {
  assert.throws(() => validateLessonPresentations([{lessons:[{id:'machine-learning/unconfigured-lesson'}]}]), /Define three learning highlights/);
});
