// npm install --no-save @electric-sql/pglite@0.3.14
// Run with NODE_PATH pointing to its node_modules when installed outside this repo.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {PGlite} = require('@electric-sql/pglite');

test('Postgres RLS isolates two students for reads, inserts, updates and deletes', async () => {
  const db = new PGlite();
  const a = '00000000-0000-4000-8000-000000000001';
  const b = '00000000-0000-4000-8000-000000000002';
  try {
    await db.exec(`create role anon; create role authenticated;
      create schema auth; create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
      grant usage on schema auth, public to authenticated, anon;
      grant execute on function auth.uid() to authenticated, anon;
      insert into auth.users values ('${a}'), ('${b}');`);
    await db.exec(fs.readFileSync(path.join(__dirname,'../supabase/001_student_answers.sql'),'utf8'));
    async function asUser(id) {
      await db.exec('reset role; set role authenticated;');
      await db.query("select set_config('request.jwt.claim.sub', $1, false)",[id]);
    }
    const lesson = 'machine-learning/vector-distance';
    await asUser(a);
    await db.query('insert into public.class_notes_answers(user_id,lesson_id,answers) values ($1,$2,$3)', [a,lesson,{'1':'A draft'}]);
    await assert.rejects(db.query('insert into public.class_notes_answers(user_id,lesson_id) values ($1,$2)', [b,lesson]),/row-level security/);
    await asUser(b);
    assert.equal((await db.query('select * from public.class_notes_answers')).rows.length,0);
    assert.equal((await db.query('update public.class_notes_answers set answers=\'{"1":"stolen"}\' where user_id=$1 returning *',[a])).rows.length,0);
    assert.equal((await db.query('delete from public.class_notes_answers where user_id=$1 returning *',[a])).rows.length,0);
    await db.query('insert into public.class_notes_answers(user_id,lesson_id,answers) values ($1,$2,$3)',[b,lesson,{'1':'B draft'}]);
    assert.equal((await db.query('select * from public.class_notes_answers')).rows.length,1);
    await assert.rejects(db.query("update public.class_notes_answers set user_id=$1, lesson_id='machine-learning/prediction-problem' where user_id=$2",[a,b]),/row-level security/);
    await asUser(a);
    assert.equal((await db.query('select answers from public.class_notes_answers')).rows[0].answers['1'],'A draft');
    await db.query('insert into public.class_notes_answers(user_id,lesson_id,answers) values ($1,$2,$3) on conflict(user_id,lesson_id) do update set answers=excluded.answers',[a,lesson,{'1':'A saved'}]);
    assert.equal((await db.query('select answers from public.class_notes_answers')).rows[0].answers['1'],'A saved');
    await assert.rejects(db.query('insert into public.class_notes_answers(user_id,lesson_id,answers) values ($1,$2,$3)',[a,'bad/lesson',['bad']]),/check constraint/);
    await db.exec('reset role; set role anon;');
    for (const sql of ['select * from public.class_notes_answers','delete from public.class_notes_answers'])
      await assert.rejects(db.exec(sql),/permission denied/);
  } finally { await db.close(); }
});
