-- Tests: timed multiple-choice tests that students take inside a time window.
--
-- Shape (docs/architecture/data-model.md):
--   test ──< test_questions ──1:1── test_answer_keys
--   test ──< test_attempts ──< test_answers >── test_questions
--
-- The answer key lives in its own table so that row-level security can keep it from students:
-- a policy hides rows, not columns. Scores are never stored. They are worked out from the
-- answers and the key each time they are read, so correcting a wrong key re-marks every attempt.

create table public.tests (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 120),
  -- Instructions students read before they start.
  description text not null default '' check (char_length(description) <= 1000),
  course_id uuid references public.courses (id) on delete set null,
  duration_minutes integer not null check (duration_minutes between 1 and 300),
  -- A student can start between starts_at and ends_at. An attempt started in time ends at
  -- ends_at at the latest, so the centre knows when everyone has finished.
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  -- Lets students who missed the window take the test afterwards. Such attempts are marked late.
  allow_late boolean not null default false,
  -- Lets students see the correct answers once the window has ended.
  show_review boolean not null default true,
  -- Percentage needed to pass; null when the test has no pass mark.
  pass_percent integer check (pass_percent between 1 and 100),
  is_published boolean not null default false,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tests_window_valid check (ends_at > starts_at)
);

comment on table public.tests is 'Timed multiple-choice tests. Students start them inside the window; late attempts only if allow_late.';

create table public.test_questions (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references public.tests (id) on delete cascade,
  position integer not null check (position >= 0),
  prompt text not null check (char_length(prompt) between 1 and 1000),
  -- Two to six choices. The correct one is in test_answer_keys, by its 0-based place here.
  options text[] not null check (cardinality(options) between 2 and 6),
  marks integer not null default 1 check (marks between 1 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Deferred so a reorder can permute positions inside one statement.
  constraint test_questions_position_unique unique (test_id, position) deferrable initially deferred
);

create table public.test_answer_keys (
  question_id uuid primary key references public.test_questions (id) on delete cascade,
  correct_option integer not null check (correct_option between 0 and 5),
  -- Shown with the correct answer when students review the test.
  explanation text not null default '' check (char_length(explanation) <= 1000)
);

comment on table public.test_answer_keys is 'Correct answers. Staff only: students read them through test_attempt_review once the test is over.';

create table public.test_attempts (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references public.tests (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  started_at timestamptz not null default now(),
  -- When this student's time runs out. Answers are refused after it (plus a short grace).
  deadline_at timestamptz not null,
  -- Null while the test is being taken. An attempt whose deadline has passed counts as
  -- finished even when the student never pressed Submit.
  submitted_at timestamptz,
  is_late boolean not null default false,
  -- One attempt per student. Staff can delete an attempt to let a student take the test again.
  constraint test_attempts_one_per_student unique (test_id, user_id),
  constraint test_attempts_deadline_after_start check (deadline_at > started_at)
);

create table public.test_answers (
  attempt_id uuid not null references public.test_attempts (id) on delete cascade,
  question_id uuid not null references public.test_questions (id) on delete cascade,
  selected_option integer not null check (selected_option between 0 and 5),
  answered_at timestamptz not null default now(),
  primary key (attempt_id, question_id)
);

-- Foreign-key indexes (primary keys and unique constraints cover the leading columns).
create index tests_course_id_idx on public.tests (course_id) where course_id is not null;
create index tests_published_starts_at_idx on public.tests (starts_at) where is_published;
create index test_attempts_user_id_idx on public.test_attempts (user_id);
create index test_answers_question_id_idx on public.test_answers (question_id);

create trigger tests_set_updated_at before update on public.tests
  for each row execute function private.set_updated_at();
create trigger test_questions_set_updated_at before update on public.test_questions
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------------------------------
-- Helpers shared by the access rules and the functions in the next migrations.
-- ---------------------------------------------------------------------------------------------

-- True when the caller has started this test. Students may read a test's questions only then.
create or replace function private.has_attempt(p_test_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.test_attempts where test_id = p_test_id and user_id = auth.uid()
  );
$$;

create or replace function private.owns_attempt(p_attempt_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.test_attempts where id = p_attempt_id and user_id = auth.uid()
  );
$$;

-- Marks earned by an attempt so far: the sum of marks of the questions answered correctly.
create or replace function private.attempt_marks(p_attempt_id uuid)
returns table (score integer, correct_count integer, answered_count integer)
language sql
stable
security definer
set search_path = ''
as $$
  select
    coalesce(sum(q.marks) filter (where a.selected_option = k.correct_option), 0)::integer,
    (count(*) filter (where a.selected_option = k.correct_option))::integer,
    count(*)::integer
  from public.test_answers a
  join public.test_questions q on q.id = a.question_id
  left join public.test_answer_keys k on k.question_id = q.id
  where a.attempt_id = p_attempt_id;
$$;

-- Saves answers given as { "<question id>": <option number, or null to clear> }. Every key must
-- be a question of the attempt's test and every number one of that question's options.
create or replace function private.apply_test_answers(
  p_attempt_id uuid,
  p_test_id uuid,
  p_answers jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_answers is null or jsonb_typeof(p_answers) <> 'object' then
    return;
  end if;

  if exists (
    select 1
    from jsonb_each(p_answers) a
    left join public.test_questions q on q.id::text = a.key and q.test_id = p_test_id
    where q.id is null
       -- CASE fixes the order of evaluation: the cast runs only for JSON numbers.
       or not (
         case jsonb_typeof(a.value)
           when 'null' then true
           when 'number' then
             (a.value #>> '{}')::numeric = trunc((a.value #>> '{}')::numeric)
             and (a.value #>> '{}')::numeric >= 0
             and (a.value #>> '{}')::numeric < cardinality(q.options)
           else false
         end
       )
  ) then
    perform private.fail('invalid_answer');
  end if;

  delete from public.test_answers ta
  using jsonb_each(p_answers) a
  where ta.attempt_id = p_attempt_id
    and ta.question_id::text = a.key
    and jsonb_typeof(a.value) = 'null';

  insert into public.test_answers (attempt_id, question_id, selected_option)
  select p_attempt_id, a.key::uuid, (a.value #>> '{}')::integer
  from jsonb_each(p_answers) a
  where jsonb_typeof(a.value) = 'number'
  on conflict (attempt_id, question_id) do update
    set selected_option = excluded.selected_option, answered_at = now();
end;
$$;

revoke all on function private.has_attempt(uuid) from public;
revoke all on function private.owns_attempt(uuid) from public;
revoke all on function private.attempt_marks(uuid) from public;
revoke all on function private.apply_test_answers(uuid, uuid, jsonb) from public;
grant execute on function private.has_attempt(uuid) to authenticated, service_role;
grant execute on function private.owns_attempt(uuid) to authenticated, service_role;
