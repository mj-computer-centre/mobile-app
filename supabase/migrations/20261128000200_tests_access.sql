-- Tests: access rules and what students can do.
--
-- Students (any signed-in user) see published tests. They can read a test's questions only
-- after starting it, never the answer key, and only their own attempts and answers. Everything
-- a student changes goes through the functions below, which check the clock on the server, so a
-- phone with the wrong time or a modified app cannot start early or answer after time is up.

alter table public.tests enable row level security;
alter table public.test_questions enable row level security;
alter table public.test_answer_keys enable row level security;
alter table public.test_attempts enable row level security;
alter table public.test_answers enable row level security;

revoke all on public.tests, public.test_questions, public.test_answer_keys, public.test_attempts,
  public.test_answers from anon, authenticated;

grant select, insert, update, delete on public.tests to authenticated;
-- Questions and keys are written only by the staff functions (they keep positions gap-free and
-- the key in step with the question); attempts and answers only by the functions below.
grant select on public.test_questions, public.test_answer_keys, public.test_answers to authenticated;
grant select, delete on public.test_attempts to authenticated;
grant all on public.tests, public.test_questions, public.test_answer_keys, public.test_attempts,
  public.test_answers to service_role;

create policy "tests: published for students, all for staff"
  on public.tests for select to authenticated
  using (is_published or (select private.is_staff()));

create policy "tests: staff insert" on public.tests for insert to authenticated
  with check ((select private.is_staff()));
create policy "tests: staff update" on public.tests for update to authenticated
  using ((select private.is_staff())) with check ((select private.is_staff()));
create policy "tests: staff delete" on public.tests for delete to authenticated
  using ((select private.is_staff()));

create policy "test_questions: staff, and students who started the test"
  on public.test_questions for select to authenticated
  using ((select private.is_staff()) or private.has_attempt(test_id));

create policy "test_answer_keys: staff only"
  on public.test_answer_keys for select to authenticated
  using ((select private.is_staff()));

create policy "test_attempts: own, staff read all"
  on public.test_attempts for select to authenticated
  using (user_id = (select auth.uid()) or (select private.is_staff()));

-- Deleting an attempt lets that student take the test again.
create policy "test_attempts: staff delete"
  on public.test_attempts for delete to authenticated
  using ((select private.is_staff()));

create policy "test_answers: own, staff read all"
  on public.test_answers for select to authenticated
  using ((select private.is_staff()) or private.owns_attempt(attempt_id));

-- ---------------------------------------------------------------------------------------------
-- Taking a test.
-- ---------------------------------------------------------------------------------------------

-- Starts the caller's attempt, or returns the one they already have (so a student who closes
-- the app can come back while their time is still running).
create or replace function public.start_test(p_test_id uuid)
returns public.test_attempts
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_now timestamptz := now();
  v_test public.tests;
  v_attempt public.test_attempts;
  v_late boolean;
begin
  if v_user_id is null then
    perform private.fail('not_signed_in');
  end if;

  select * into v_test from public.tests where id = p_test_id;
  -- Staff may try a draft before publishing it.
  if not found or not (v_test.is_published or private.is_staff()) then
    perform private.fail('test_not_found');
  end if;

  select * into v_attempt
  from public.test_attempts where test_id = p_test_id and user_id = v_user_id;
  if found then
    return v_attempt;
  end if;

  if v_now < v_test.starts_at then
    perform private.fail('test_not_open');
  end if;
  v_late := v_now >= v_test.ends_at;
  if v_late and not v_test.allow_late then
    perform private.fail('test_closed');
  end if;
  if not exists (select 1 from public.test_questions where test_id = p_test_id) then
    perform private.fail('test_has_no_questions');
  end if;

  insert into public.test_attempts (test_id, user_id, started_at, deadline_at, is_late)
  values (
    p_test_id,
    v_user_id,
    v_now,
    case
      when v_late then v_now + make_interval(mins => v_test.duration_minutes)
      else least(v_now + make_interval(mins => v_test.duration_minutes), v_test.ends_at)
    end,
    v_late
  )
  on conflict (test_id, user_id) do nothing
  returning * into v_attempt;

  if v_attempt.id is null then
    -- Two taps at once: the other request created the attempt.
    select * into v_attempt
    from public.test_attempts where test_id = p_test_id and user_id = v_user_id;
  end if;
  return v_attempt;
end;
$$;

-- Saves answers while the test is running. p_answers is { "<question id>": <option or null> }.
-- A minute of grace after the deadline covers a slow connection on the last answer.
create or replace function public.save_test_answers(p_attempt_id uuid, p_answers jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_attempt public.test_attempts;
begin
  select * into v_attempt
  from public.test_attempts where id = p_attempt_id and user_id = auth.uid()
  for update;
  if not found then
    perform private.fail('attempt_not_found');
  end if;
  if v_attempt.submitted_at is not null then
    perform private.fail('test_already_submitted');
  end if;
  if now() > v_attempt.deadline_at + interval '60 seconds' then
    perform private.fail('test_time_over');
  end if;

  perform private.apply_test_answers(v_attempt.id, v_attempt.test_id, p_answers);
end;
$$;

-- Finishes the attempt. The app sends every answer again with it, so answers that could not be
-- saved one by one on a poor connection still count. Submitting twice is harmless.
create or replace function public.submit_test(p_attempt_id uuid, p_answers jsonb default null)
returns public.test_attempts
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_attempt public.test_attempts;
begin
  select * into v_attempt
  from public.test_attempts where id = p_attempt_id and user_id = auth.uid()
  for update;
  if not found then
    perform private.fail('attempt_not_found');
  end if;
  if v_attempt.submitted_at is not null then
    return v_attempt;
  end if;

  if now() <= v_attempt.deadline_at + interval '60 seconds' then
    perform private.apply_test_answers(v_attempt.id, v_attempt.test_id, p_answers);
  end if;

  update public.test_attempts
  set submitted_at = least(now(), deadline_at)
  where id = v_attempt.id
  returning * into v_attempt;
  return v_attempt;
end;
$$;

-- ---------------------------------------------------------------------------------------------
-- What a student sees: the list of tests, and the result of an attempt.
-- ---------------------------------------------------------------------------------------------

-- Every published test with the caller's own attempt and, once it is finished, their score.
-- server_now lets the app count down correctly on a phone whose clock is wrong.
create or replace function public.my_tests()
returns table (
  id uuid,
  title text,
  description text,
  course_id uuid,
  course_title text,
  duration_minutes integer,
  starts_at timestamptz,
  ends_at timestamptz,
  allow_late boolean,
  show_review boolean,
  pass_percent integer,
  question_count integer,
  total_marks integer,
  attempt_id uuid,
  attempt_started_at timestamptz,
  attempt_deadline_at timestamptz,
  attempt_submitted_at timestamptz,
  attempt_is_late boolean,
  score integer,
  server_now timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    t.id,
    t.title,
    t.description,
    t.course_id,
    c.title,
    t.duration_minutes,
    t.starts_at,
    t.ends_at,
    t.allow_late,
    t.show_review,
    t.pass_percent,
    (select count(*)::integer from public.test_questions q where q.test_id = t.id),
    (select coalesce(sum(q.marks), 0)::integer from public.test_questions q where q.test_id = t.id),
    a.id,
    a.started_at,
    a.deadline_at,
    a.submitted_at,
    a.is_late,
    case
      when a.id is not null and (a.submitted_at is not null or now() > a.deadline_at)
        then (select m.score from private.attempt_marks(a.id) m)
    end,
    now()
  from public.tests t
  left join public.courses c on c.id = t.course_id
  left join public.test_attempts a on a.test_id = t.id and a.user_id = auth.uid()
  where t.is_published and auth.uid() is not null
  order by t.starts_at desc;
$$;

-- The result of one attempt, for its owner or for staff. No row when the caller may not see it.
-- The rank compares students who took the test in time and is given once the window has ended.
create or replace function public.test_attempt_summary(p_attempt_id uuid)
returns table (
  attempt_id uuid,
  test_id uuid,
  user_id uuid,
  started_at timestamptz,
  deadline_at timestamptz,
  submitted_at timestamptz,
  is_finished boolean,
  is_late boolean,
  score integer,
  total_marks integer,
  correct_count integer,
  answered_count integer,
  question_count integer,
  time_taken_seconds integer,
  rank integer,
  rank_out_of integer,
  review_available boolean,
  server_now timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  with attempt as (
    select ta.*, (ta.submitted_at is not null or now() > ta.deadline_at) as finished
    from public.test_attempts ta
    where ta.id = p_attempt_id and (ta.user_id = auth.uid() or private.is_staff())
  ),
  test as (
    select tt.* from public.tests tt join attempt on attempt.test_id = tt.id
  ),
  paper as (
    select count(*)::integer as question_count, coalesce(sum(q.marks), 0)::integer as total_marks
    from public.test_questions q join attempt on attempt.test_id = q.test_id
  ),
  ranked as (
    -- Best score first; a faster finish breaks a tie.
    select
      o.id,
      rank() over (
        order by om.score desc,
          least(coalesce(o.submitted_at, o.deadline_at), o.deadline_at) - o.started_at
      )::integer as place,
      (count(*) over ())::integer as out_of
    from public.test_attempts o
    join attempt on attempt.test_id = o.test_id
    cross join lateral private.attempt_marks(o.id) om
    where not o.is_late and (o.submitted_at is not null or now() > o.deadline_at)
  )
  select
    attempt.id,
    attempt.test_id,
    attempt.user_id,
    attempt.started_at,
    attempt.deadline_at,
    attempt.submitted_at,
    attempt.finished,
    attempt.is_late,
    case when attempt.finished then m.score end,
    paper.total_marks,
    case when attempt.finished then m.correct_count end,
    m.answered_count,
    paper.question_count,
    extract(epoch from (
      least(coalesce(attempt.submitted_at, now()), attempt.deadline_at) - attempt.started_at
    ))::integer,
    case when attempt.finished and not attempt.is_late and now() >= test.ends_at
      then (select r.place from ranked r where r.id = attempt.id) end,
    case when attempt.finished and not attempt.is_late and now() >= test.ends_at
      then (select r.out_of from ranked r where r.id = attempt.id) end,
    attempt.finished and (private.is_staff() or (test.show_review and now() >= test.ends_at)),
    now()
  from attempt
  cross join test
  cross join paper
  cross join lateral private.attempt_marks(attempt.id) m;
$$;

-- Every question of a finished attempt with what the student chose and the correct answer.
-- For students: only after the test window has ended, and only when the test allows a review.
-- No rows when the caller may not see it.
create or replace function public.test_attempt_review(p_attempt_id uuid)
returns table (
  question_id uuid,
  question_position integer,
  prompt text,
  options text[],
  marks integer,
  selected_option integer,
  correct_option integer,
  explanation text
)
language sql
stable
security definer
set search_path = ''
as $$
  select q.id, q.position, q.prompt, q.options, q.marks, ans.selected_option, k.correct_option,
    coalesce(k.explanation, '')
  from public.test_attempts a
  join public.tests t on t.id = a.test_id
  join public.test_questions q on q.test_id = a.test_id
  left join public.test_answer_keys k on k.question_id = q.id
  left join public.test_answers ans on ans.attempt_id = a.id and ans.question_id = q.id
  where a.id = p_attempt_id
    and (
      private.is_staff()
      or (
        a.user_id = auth.uid()
        and (a.submitted_at is not null or now() > a.deadline_at)
        and t.show_review
        and now() >= t.ends_at
      )
    )
  order by q.position;
$$;

revoke all on function public.start_test(uuid) from public, anon;
revoke all on function public.save_test_answers(uuid, jsonb) from public, anon;
revoke all on function public.submit_test(uuid, jsonb) from public, anon;
revoke all on function public.my_tests() from public, anon;
revoke all on function public.test_attempt_summary(uuid) from public, anon;
revoke all on function public.test_attempt_review(uuid) from public, anon;
grant execute on function public.start_test(uuid) to authenticated;
grant execute on function public.save_test_answers(uuid, jsonb) to authenticated;
grant execute on function public.submit_test(uuid, jsonb) to authenticated;
grant execute on function public.my_tests() to authenticated;
grant execute on function public.test_attempt_summary(uuid) to authenticated;
grant execute on function public.test_attempt_review(uuid) to authenticated;
