-- Ordering: attach, detach and reorder sections in a course and lessons in a section.
--
-- Positions are 0-based and gap-free. Each function locks the parent row first, so two admins
-- editing the same course or section at once are serialised instead of colliding on positions.
-- Unit labels ("Unit 1 – …") are derived from position in the app (packages/shared/src/catalog).

-- Sections in a course ---------------------------------------------------------------------------

create or replace function public.attach_section(p_course_id uuid, p_section_id uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_position integer;
begin
  perform private.require_staff();
  perform 1 from public.courses where id = p_course_id for update;
  if not found then
    perform private.fail('course_not_found');
  end if;
  if not exists (select 1 from public.sections where id = p_section_id) then
    perform private.fail('section_not_found');
  end if;

  select position into v_position
  from public.course_sections where course_id = p_course_id and section_id = p_section_id;
  if found then
    return v_position; -- already attached; attaching is idempotent
  end if;

  select coalesce(max(position) + 1, 0) into v_position
  from public.course_sections where course_id = p_course_id;

  insert into public.course_sections (course_id, section_id, position)
  values (p_course_id, p_section_id, v_position);
  return v_position;
end;
$$;

create or replace function public.detach_section(p_course_id uuid, p_section_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.require_staff();
  perform 1 from public.courses where id = p_course_id for update;

  delete from public.course_sections where course_id = p_course_id and section_id = p_section_id;

  update public.course_sections cs
  set position = ranked.new_position
  from (
    select section_id, (row_number() over (order by position) - 1)::integer as new_position
    from public.course_sections where course_id = p_course_id
  ) ranked
  where cs.course_id = p_course_id
    and cs.section_id = ranked.section_id
    and cs.position <> ranked.new_position;
end;
$$;

-- p_section_ids must list exactly the course's current sections, in the new order.
create or replace function public.reorder_course_sections(p_course_id uuid, p_section_ids uuid[])
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.require_staff();
  perform 1 from public.courses where id = p_course_id for update;

  if coalesce(cardinality(p_section_ids), 0) <> (select count(distinct x) from unnest(p_section_ids) x)
     or (select count(*) from public.course_sections where course_id = p_course_id)
        <> coalesce(cardinality(p_section_ids), 0)
     or exists (
       select 1 from unnest(p_section_ids) x
       where not exists (
         select 1 from public.course_sections
         where course_id = p_course_id and section_id = x
       )
     ) then
    perform private.fail('order_mismatch');
  end if;

  update public.course_sections cs
  set position = (o.ordinality - 1)::integer
  from unnest(p_section_ids) with ordinality as o(section_id, ordinality)
  where cs.course_id = p_course_id and cs.section_id = o.section_id;
end;
$$;

-- Lessons in a section ---------------------------------------------------------------------------

create or replace function public.attach_lesson(p_section_id uuid, p_lesson_id uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_position integer;
begin
  perform private.require_staff();
  perform 1 from public.sections where id = p_section_id for update;
  if not found then
    perform private.fail('section_not_found');
  end if;
  if not exists (select 1 from public.lessons where id = p_lesson_id) then
    perform private.fail('lesson_not_found');
  end if;

  select position into v_position
  from public.section_lessons where section_id = p_section_id and lesson_id = p_lesson_id;
  if found then
    return v_position;
  end if;

  select coalesce(max(position) + 1, 0) into v_position
  from public.section_lessons where section_id = p_section_id;

  insert into public.section_lessons (section_id, lesson_id, position)
  values (p_section_id, p_lesson_id, v_position);
  return v_position;
end;
$$;

-- Appends several lessons in the order given (a playlist import), skipping ones already there.
-- Returns how many were added.
create or replace function public.attach_lessons(p_section_id uuid, p_lesson_ids uuid[])
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_next integer;
  v_added integer;
begin
  perform private.require_staff();
  perform 1 from public.sections where id = p_section_id for update;
  if not found then
    perform private.fail('section_not_found');
  end if;
  if exists (
    select 1 from unnest(p_lesson_ids) x where not exists (select 1 from public.lessons where id = x)
  ) then
    perform private.fail('lesson_not_found');
  end if;

  select coalesce(max(position) + 1, 0) into v_next
  from public.section_lessons where section_id = p_section_id;

  with wanted as (
    select x as lesson_id, min(o) as first_seen
    from unnest(p_lesson_ids) with ordinality as t(x, o)
    where not exists (
      select 1 from public.section_lessons where section_id = p_section_id and lesson_id = x
    )
    group by x
  )
  insert into public.section_lessons (section_id, lesson_id, position)
  select p_section_id, lesson_id, (v_next + row_number() over (order by first_seen) - 1)::integer
  from wanted;

  get diagnostics v_added = row_count;
  return v_added;
end;
$$;

create or replace function public.detach_lesson(p_section_id uuid, p_lesson_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.require_staff();
  perform 1 from public.sections where id = p_section_id for update;

  delete from public.section_lessons where section_id = p_section_id and lesson_id = p_lesson_id;

  update public.section_lessons sl
  set position = ranked.new_position
  from (
    select lesson_id, (row_number() over (order by position) - 1)::integer as new_position
    from public.section_lessons where section_id = p_section_id
  ) ranked
  where sl.section_id = p_section_id
    and sl.lesson_id = ranked.lesson_id
    and sl.position <> ranked.new_position;
end;
$$;

create or replace function public.reorder_section_lessons(p_section_id uuid, p_lesson_ids uuid[])
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.require_staff();
  perform 1 from public.sections where id = p_section_id for update;

  if coalesce(cardinality(p_lesson_ids), 0) <> (select count(distinct x) from unnest(p_lesson_ids) x)
     or (select count(*) from public.section_lessons where section_id = p_section_id)
        <> coalesce(cardinality(p_lesson_ids), 0)
     or exists (
       select 1 from unnest(p_lesson_ids) x
       where not exists (
         select 1 from public.section_lessons
         where section_id = p_section_id and lesson_id = x
       )
     ) then
    perform private.fail('order_mismatch');
  end if;

  update public.section_lessons sl
  set position = (o.ordinality - 1)::integer
  from unnest(p_lesson_ids) with ordinality as o(lesson_id, ordinality)
  where sl.section_id = p_section_id and sl.lesson_id = o.lesson_id;
end;
$$;

revoke all on function public.attach_section(uuid, uuid) from public, anon;
revoke all on function public.detach_section(uuid, uuid) from public, anon;
revoke all on function public.reorder_course_sections(uuid, uuid[]) from public, anon;
revoke all on function public.attach_lesson(uuid, uuid) from public, anon;
revoke all on function public.attach_lessons(uuid, uuid[]) from public, anon;
revoke all on function public.detach_lesson(uuid, uuid) from public, anon;
revoke all on function public.reorder_section_lessons(uuid, uuid[]) from public, anon;
grant execute on function public.attach_section(uuid, uuid) to authenticated;
grant execute on function public.detach_section(uuid, uuid) to authenticated;
grant execute on function public.reorder_course_sections(uuid, uuid[]) to authenticated;
grant execute on function public.attach_lesson(uuid, uuid) to authenticated;
grant execute on function public.attach_lessons(uuid, uuid[]) to authenticated;
grant execute on function public.detach_lesson(uuid, uuid) to authenticated;
grant execute on function public.reorder_section_lessons(uuid, uuid[]) to authenticated;
