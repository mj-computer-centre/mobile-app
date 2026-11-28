-- Tests: what staff can do. Tests themselves are edited directly (row-level security allows
-- staff); questions go through these functions so that positions stay gap-free and a question
-- is never saved without its answer key.

-- Raises invalid_question unless the question is complete and well-formed.
create or replace function private.check_test_question(
  p_prompt text,
  p_options text[],
  p_correct_option integer,
  p_marks integer,
  p_explanation text
)
returns void
language plpgsql
immutable
set search_path = ''
as $$
begin
  if p_prompt is null or char_length(btrim(p_prompt)) not between 1 and 1000
     or p_options is null
     or coalesce(cardinality(p_options), 0) not between 2 and 6
     or exists (
       select 1 from unnest(p_options) o
       where o is null or char_length(btrim(o)) not between 1 and 300
     )
     or p_correct_option is null
     or p_correct_option < 0
     or p_correct_option >= cardinality(p_options)
     or p_marks is null
     or p_marks not between 1 and 100
     or char_length(coalesce(p_explanation, '')) > 1000
  then
    perform private.fail('invalid_question');
  end if;
end;
$$;

create or replace function private.trim_options(p_options text[])
returns text[]
language sql
immutable
set search_path = ''
as $$
  select array_agg(btrim(o) order by n) from unnest(p_options) with ordinality as t(o, n);
$$;

-- Adds a question at the end of the test (p_question_id null) or changes an existing one.
-- Returns the question's id.
create or replace function public.save_test_question(
  p_test_id uuid,
  p_question_id uuid,
  p_prompt text,
  p_options text[],
  p_correct_option integer,
  p_marks integer default 1,
  p_explanation text default ''
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
  v_position integer;
begin
  perform private.require_staff();
  perform 1 from public.tests where id = p_test_id for update;
  if not found then
    perform private.fail('test_not_found');
  end if;
  perform private.check_test_question(p_prompt, p_options, p_correct_option, p_marks, p_explanation);

  if p_question_id is null then
    select coalesce(max(position) + 1, 0) into v_position
    from public.test_questions where test_id = p_test_id;
    if v_position >= 200 then
      perform private.fail('too_many_questions');
    end if;
    insert into public.test_questions (test_id, position, prompt, options, marks)
    values (p_test_id, v_position, btrim(p_prompt), private.trim_options(p_options), p_marks)
    returning id into v_id;
  else
    update public.test_questions
    set prompt = btrim(p_prompt), options = private.trim_options(p_options), marks = p_marks
    where id = p_question_id and test_id = p_test_id
    returning id into v_id;
    if v_id is null then
      perform private.fail('question_not_found');
    end if;
  end if;

  insert into public.test_answer_keys (question_id, correct_option, explanation)
  values (v_id, p_correct_option, btrim(coalesce(p_explanation, '')))
  on conflict (question_id) do update
    set correct_option = excluded.correct_option, explanation = excluded.explanation;
  return v_id;
end;
$$;

-- Adds many questions at once, in the order given (the "paste questions" import). p_questions
-- is an array of { prompt, options, correct_option, marks?, explanation? }. All or nothing:
-- one bad question refuses the whole import. Returns how many were added.
create or replace function public.import_test_questions(p_test_id uuid, p_questions jsonb)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_next integer;
  v_added integer := 0;
  v_item jsonb;
  v_id uuid;
  v_prompt text;
  v_options text[];
  v_correct integer;
  v_marks integer;
  v_explanation text;
begin
  perform private.require_staff();
  perform 1 from public.tests where id = p_test_id for update;
  if not found then
    perform private.fail('test_not_found');
  end if;
  if p_questions is null or jsonb_typeof(p_questions) <> 'array' then
    perform private.fail('invalid_question');
  end if;

  select coalesce(max(position) + 1, 0) into v_next
  from public.test_questions where test_id = p_test_id;
  if v_next + jsonb_array_length(p_questions) > 200 then
    perform private.fail('too_many_questions');
  end if;

  for v_item in select value from jsonb_array_elements(p_questions) loop
    if jsonb_typeof(v_item) <> 'object'
       or jsonb_typeof(v_item -> 'options') is distinct from 'array'
       or jsonb_typeof(v_item -> 'correct_option') is distinct from 'number'
       or jsonb_typeof(coalesce(v_item -> 'marks', '1'::jsonb)) <> 'number' then
      perform private.fail('invalid_question');
    end if;
    v_prompt := v_item ->> 'prompt';
    v_options := array(select jsonb_array_elements_text(v_item -> 'options'));
    v_correct := (v_item ->> 'correct_option')::numeric::integer;
    v_marks := coalesce((v_item ->> 'marks')::numeric::integer, 1);
    v_explanation := coalesce(v_item ->> 'explanation', '');
    perform private.check_test_question(v_prompt, v_options, v_correct, v_marks, v_explanation);

    insert into public.test_questions (test_id, position, prompt, options, marks)
    values (p_test_id, v_next + v_added, btrim(v_prompt), private.trim_options(v_options), v_marks)
    returning id into v_id;
    insert into public.test_answer_keys (question_id, correct_option, explanation)
    values (v_id, v_correct, btrim(v_explanation));
    v_added := v_added + 1;
  end loop;
  return v_added;
end;
$$;

create or replace function public.delete_test_question(p_question_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_test_id uuid;
begin
  perform private.require_staff();
  select test_id into v_test_id from public.test_questions where id = p_question_id;
  if not found then
    return; -- already gone
  end if;
  perform 1 from public.tests where id = v_test_id for update;

  delete from public.test_questions where id = p_question_id;

  update public.test_questions q
  set position = ranked.new_position
  from (
    select id, (row_number() over (order by position) - 1)::integer as new_position
    from public.test_questions where test_id = v_test_id
  ) ranked
  where q.id = ranked.id and q.position <> ranked.new_position;
end;
$$;

-- p_question_ids must list exactly the test's current questions, in the new order.
create or replace function public.reorder_test_questions(p_test_id uuid, p_question_ids uuid[])
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.require_staff();
  perform 1 from public.tests where id = p_test_id for update;

  if coalesce(cardinality(p_question_ids), 0) <> (select count(distinct x) from unnest(p_question_ids) x)
     or (select count(*) from public.test_questions where test_id = p_test_id)
        <> coalesce(cardinality(p_question_ids), 0)
     or exists (
       select 1 from unnest(p_question_ids) x
       where not exists (
         select 1 from public.test_questions where test_id = p_test_id and id = x
       )
     ) then
    perform private.fail('order_mismatch');
  end if;

  update public.test_questions q
  set position = (o.ordinality - 1)::integer
  from unnest(p_question_ids) with ordinality as o(question_id, ordinality)
  where q.test_id = p_test_id and q.id = o.question_id;
end;
$$;

-- Everyone who took a test, best score first. Staff only (no rows for anyone else).
create or replace function public.test_results(p_test_id uuid)
returns table (
  attempt_id uuid,
  user_id uuid,
  full_name text,
  email text,
  phone text,
  started_at timestamptz,
  submitted_at timestamptz,
  deadline_at timestamptz,
  is_finished boolean,
  is_late boolean,
  score integer,
  correct_count integer,
  answered_count integer,
  time_taken_seconds integer
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    a.id,
    a.user_id,
    p.full_name,
    p.email,
    p.phone,
    a.started_at,
    a.submitted_at,
    a.deadline_at,
    (a.submitted_at is not null or now() > a.deadline_at),
    a.is_late,
    m.score,
    m.correct_count,
    m.answered_count,
    extract(epoch from (
      least(coalesce(a.submitted_at, now()), a.deadline_at) - a.started_at
    ))::integer
  from public.test_attempts a
  left join public.profiles p on p.id = a.user_id
  cross join lateral private.attempt_marks(a.id) m
  where a.test_id = p_test_id and private.is_staff()
  order by m.score desc,
    least(coalesce(a.submitted_at, now()), a.deadline_at) - a.started_at,
    a.started_at;
$$;

-- Counts for the admin list of tests. Runs with the caller's rights, so it is only meaningful
-- for staff (students cannot see questions of tests they have not started).
create view public.test_usage
with (security_invoker = true) as
select
  t.id as test_id,
  (select count(*) from public.test_questions q where q.test_id = t.id)::integer as question_count,
  (select coalesce(sum(q.marks), 0) from public.test_questions q where q.test_id = t.id)::integer as total_marks,
  (select count(*) from public.test_attempts a where a.test_id = t.id)::integer as attempt_count
from public.tests t;

revoke all on public.test_usage from anon, authenticated;
grant select on public.test_usage to authenticated;

-- The dashboard gains test numbers. The return type changes, so the function is replaced.
drop function public.admin_dashboard_stats();

create function public.admin_dashboard_stats()
returns table (
  students_total bigint,
  students_last_7_days bigint,
  courses_published bigint,
  courses_total bigint,
  lessons_total bigint,
  tests_published bigint,
  tests_total bigint,
  attempts_total bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform private.require_staff();
  return query
  select
    (select count(*) from public.profiles p
       where not exists (select 1 from public.staff s where s.user_id = p.id)),
    (select count(*) from public.profiles p
       where p.created_at >= now() - interval '7 days'
         and not exists (select 1 from public.staff s where s.user_id = p.id)),
    (select count(*) from public.courses where is_published),
    (select count(*) from public.courses),
    (select count(*) from public.lessons),
    (select count(*) from public.tests where is_published),
    (select count(*) from public.tests),
    (select count(*) from public.test_attempts);
end;
$$;

revoke all on function private.check_test_question(text, text[], integer, integer, text) from public;
revoke all on function private.trim_options(text[]) from public;
revoke all on function public.save_test_question(uuid, uuid, text, text[], integer, integer, text) from public, anon;
revoke all on function public.import_test_questions(uuid, jsonb) from public, anon;
revoke all on function public.delete_test_question(uuid) from public, anon;
revoke all on function public.reorder_test_questions(uuid, uuid[]) from public, anon;
revoke all on function public.test_results(uuid) from public, anon;
revoke all on function public.admin_dashboard_stats() from public, anon;
grant execute on function public.save_test_question(uuid, uuid, text, text[], integer, integer, text) to authenticated;
grant execute on function public.import_test_questions(uuid, jsonb) to authenticated;
grant execute on function public.delete_test_question(uuid) to authenticated;
grant execute on function public.reorder_test_questions(uuid, uuid[]) to authenticated;
grant execute on function public.test_results(uuid) to authenticated;
grant execute on function public.admin_dashboard_stats() to authenticated;
