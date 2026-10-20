-- Run once in Supabase SQL Editor, on the classroom project.
-- No passwords, emails or privileged roles are stored in this table.
begin;
create table public.class_notes_answers (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id text not null check (lesson_id ~ '^[a-z0-9-]+/[a-z0-9-]+$' and length(lesson_id) <= 160),
  answers jsonb not null default '{}'::jsonb
    check (jsonb_typeof(answers) = 'object' and octet_length(answers::text) <= 131072),
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);
alter table public.class_notes_answers enable row level security;
revoke all on public.class_notes_answers from public, anon, authenticated;
grant select, insert, update, delete on public.class_notes_answers to authenticated;

create policy "Read own answers" on public.class_notes_answers
for select to authenticated using ((select auth.uid()) = user_id);
create policy "Insert own answers" on public.class_notes_answers
for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Update own answers" on public.class_notes_answers
for update to authenticated using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
create policy "Delete own answers" on public.class_notes_answers
for delete to authenticated using ((select auth.uid()) = user_id);

create function public.class_notes_touch_answer() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
revoke all on function public.class_notes_touch_answer() from public, anon, authenticated;
create trigger class_notes_answer_timestamp before update on public.class_notes_answers
for each row execute function public.class_notes_touch_answer();
commit;
