const test = require('node:test');
const assert = require('node:assert/strict');
const {exampleDistance, normalizeSearch} = require('../assets/app.js');

test('the worked example retains every arithmetic stage', () => {
  assert.deepEqual(exampleDistance([1,2,3],[4,6,3]), {
    difference: [-3,-4,0], squared:[9,16,0], sum:25, distance:5
  });
});
test('distance is symmetric and identical vectors have zero distance', () => {
  const u=[0,4,9], v=[6,2,3];
  assert.equal(exampleDistance(u,v).distance,exampleDistance(v,u).distance);
  assert.equal(exampleDistance(u,u).distance,0);
});
test('the third component contributes even when the first two are equal', () => {
  assert.equal(exampleDistance([1,2,3],[1,2,9]).distance,6);
});
test('Persian and Arabic letter forms produce the same search key', () => {
  assert.equal(normalizeSearch('ماشين لرنينگ'),normalizeSearch('ماشین لرنینگ'));
  assert.equal(normalizeSearch('  NUMPY   بردار '),'numpy بردار');
});
