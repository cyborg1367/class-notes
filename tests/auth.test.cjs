const test = require('node:test');
const assert = require('node:assert/strict');
const {validPublicConfig, safeCourseReturn, checkedAnswers} = require('../assets/auth.js');
const base = new URL('https://cyborg1367.github.io/class-notes/');

test('OAuth returns stay inside the course on a repository subpath', () => {
  const good = `${base}machine-learning/prediction-problem/#exercise`;
  assert.equal(safeCourseReturn(good, base), good);
  for (const bad of ['https://evil.example/', '//evil.example/', 'javascript:alert(1)',
    '/another-repository/', `${base}account/`, `${base}machine-learning/%2e%2e/account/`,
    `${base}machine-learning/%2F..%2F..%2Fexternal/`, '%',
    'https://cyborg1367.github.io.evil.example/class-notes/machine-learning/']) {
    assert.equal(safeCourseReturn(bad, base), `${base}machine-learning/`);
  }
});
test('only public configuration is accepted', () => {
  const config = {supabaseUrl:'https://demo.supabase.co',publishableKey:'sb_publishable_demo'};
  assert.equal(validPublicConfig(config), true);
  for (const key of ['', 'sb_secret_demo', 'service_role', 'eyJhbGciOiJIUzI1NiJ9'])
    assert.equal(validPublicConfig({...config,publishableKey:key}), false);
  for (const url of ['http://demo.supabase.co','https://user:secret@demo.supabase.co','https://demo.supabase.co/other','https://demo.supabase.co?secret=1'])
    assert.equal(validPublicConfig({...config,supabaseUrl:url}), false);
});
test('cloud answers accept text only and cannot add worksheet fields', () => {
  assert.deepEqual({...checkedAnswers({'1':'student text','2':'another','unknown':'ignored'},['1','2'])},
    {'1':'student text','2':'another'});
  for (const value of [null, [], 'text', {'1':42}, {'1':{}}, {'1':'a'.repeat(10001)}])
    assert.throws(()=>checkedAnswers(value,['1']));
});
