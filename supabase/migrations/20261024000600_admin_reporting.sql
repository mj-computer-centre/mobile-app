-- Read models for the admin panel. Views run with the caller's rights (security_invoker), so
-- the row-level security of the underlying tables still applies: a student querying
-- student_directory sees only their own row.

create view public.student_directory
with (security_invoker = true) as
select
  p.id,
  p.full_name,
  p.email,
  p.phone,
  p.city,
  p.interested_course_id,
  c.title as interested_course_title,
  p.profile_completed_at,
  p.created_at
from public.profiles p
left join public.courses c on c.id = p.interested_course_id
where not exists (select 1 from public.staff s where s.user_id = p.id);

create view public.staff_directory
with (security_invoker = true) as
select s.user_id, s.role, s.created_at, p.full_name, p.email
from public.staff s
left join public.profiles p on p.id = s.user_id;

-- How many courses use each section, and how many sections use each lesson. The library screen
-- uses these to warn before deleting something that appears elsewhere.
create view public.section_usage
with (security_invoker = true) as
select s.id as section_id, count(cs.course_id)::integer as course_count
from public.sections s
left join public.course_sections cs on cs.section_id = s.id
group by s.id;

create view public.lesson_usage
with (security_invoker = true) as
select
  l.id as lesson_id,
  count(distinct sl.section_id)::integer as section_count,
  count(distinct v.id)::integer as attached_to_video_count
from public.lessons l
left join public.section_lessons sl on sl.lesson_id = l.id
left join public.lessons v on v.notes_lesson_id = l.id
group by l.id;

revoke all on public.student_directory, public.staff_directory, public.section_usage,
  public.lesson_usage from anon, authenticated;
grant select on public.student_directory, public.staff_directory, public.section_usage,
  public.lesson_usage to authenticated;

create or replace function public.admin_dashboard_stats()
returns table (
  students_total bigint,
  students_last_7_days bigint,
  courses_published bigint,
  courses_total bigint,
  lessons_total bigint
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
    (select count(*) from public.lessons);
end;
$$;

revoke all on function public.admin_dashboard_stats() from public, anon;
grant execute on function public.admin_dashboard_stats() to authenticated;
