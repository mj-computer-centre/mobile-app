-- The public website: what a visitor can see before signing in.
--
-- Visitors (the `anon` role) may read the list of published courses, each course's outline
-- (unit and lesson titles) and a few counts, so the website can show what the centre teaches.
-- They cannot read lessons themselves: YouTube ids and PDF files stay behind sign-in, which is
-- how the centre learns who its students are. Outlines and counts come from functions that
-- return only titles and numbers, never from the tables.

grant select on public.courses to anon;

create policy "courses: published for visitors"
  on public.courses for select to anon
  using (is_published);

-- Units and lesson titles of a published course, in teaching order. A unit without lessons
-- appears once with null lesson columns.
create or replace function public.public_course_outline(p_course_id uuid)
returns table (
  unit_position integer,
  unit_title text,
  unit_description text,
  lesson_position integer,
  lesson_title text,
  lesson_kind public.lesson_kind,
  duration_seconds integer
)
language sql
stable
security definer
set search_path = ''
as $$
  select cs.position, s.title, s.description, sl.position, l.title, l.kind, l.duration_seconds
  from public.courses c
  join public.course_sections cs on cs.course_id = c.id
  join public.sections s on s.id = cs.section_id
  left join public.section_lessons sl on sl.section_id = s.id
  left join public.lessons l on l.id = sl.lesson_id
  where c.id = p_course_id and c.is_published
  order by cs.position, sl.position;
$$;

-- Real numbers for the website: what students can actually open today.
create or replace function public.public_site_stats()
returns table (courses integer, videos integer, notes integer, tests integer)
language sql
stable
security definer
set search_path = ''
as $$
  select
    (select count(*) from public.courses where is_published)::integer,
    (select count(*) from public.lessons l
       where l.kind = 'video' and private.lesson_is_visible(l.id))::integer,
    (select count(*) from public.lessons l
       where l.kind = 'pdf' and private.lesson_is_visible(l.id))::integer,
    (select count(*) from public.tests where is_published)::integer;
$$;

-- Tests that are running or still to come, soonest first. Titles and times only.
create or replace function public.public_upcoming_tests()
returns table (
  id uuid,
  title text,
  course_title text,
  starts_at timestamptz,
  ends_at timestamptz,
  duration_minutes integer,
  question_count integer,
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
    c.title,
    t.starts_at,
    t.ends_at,
    t.duration_minutes,
    (select count(*)::integer from public.test_questions q where q.test_id = t.id),
    now()
  from public.tests t
  left join public.courses c on c.id = t.course_id and c.is_published
  where t.is_published and t.ends_at > now()
  order by t.starts_at
  limit 6;
$$;

revoke all on function public.public_course_outline(uuid) from public;
revoke all on function public.public_site_stats() from public;
revoke all on function public.public_upcoming_tests() from public;
grant execute on function public.public_course_outline(uuid) to anon, authenticated;
grant execute on function public.public_site_stats() to anon, authenticated;
grant execute on function public.public_upcoming_tests() to anon, authenticated;

-- The app's Play Store page, once it is published: the website's "Get the app" button and the
-- app's "Share the app" message link to it.
alter table public.app_settings
  add column play_store_url text check (char_length(play_store_url) <= 500);
