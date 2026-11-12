-- Catalog access rules.
--
-- Students (any signed-in user) see published courses and everything inside them. Staff see and
-- edit everything. Course membership changes (attach, detach, reorder) go through the functions
-- in the ordering migration so positions stay gap-free; there are no direct write policies on
-- the join tables.
--
-- When paid courses arrive (backlog PAY-01), the visibility helpers gain an enrolment check.

create or replace function private.section_is_visible(p_section_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.course_sections cs
    join public.courses c on c.id = cs.course_id
    where cs.section_id = p_section_id and c.is_published
  );
$$;

-- A lesson is visible when it sits in a visible section, or when it is the notes PDF of a
-- lesson that does.
create or replace function private.lesson_is_visible(p_lesson_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.section_lessons sl
    join public.course_sections cs on cs.section_id = sl.section_id
    join public.courses c on c.id = cs.course_id
    left join public.lessons owner_lesson on owner_lesson.id = sl.lesson_id
    where c.is_published
      and (sl.lesson_id = p_lesson_id or owner_lesson.notes_lesson_id = p_lesson_id)
  );
$$;

revoke all on function private.section_is_visible(uuid) from public;
revoke all on function private.lesson_is_visible(uuid) from public;
grant execute on function private.section_is_visible(uuid) to authenticated, service_role;
grant execute on function private.lesson_is_visible(uuid) to authenticated, service_role;

alter table public.courses enable row level security;
alter table public.sections enable row level security;
alter table public.course_sections enable row level security;
alter table public.lessons enable row level security;
alter table public.section_lessons enable row level security;
alter table public.banners enable row level security;
alter table public.app_settings enable row level security;

revoke all on public.courses, public.sections, public.course_sections, public.lessons,
  public.section_lessons, public.banners, public.app_settings from anon, authenticated;

grant select, insert, update, delete on public.courses, public.sections, public.lessons,
  public.banners to authenticated;
grant select on public.course_sections, public.section_lessons to authenticated;
grant select, update on public.app_settings to authenticated;
-- Contact details are public information; the web privacy page may show them before sign-in.
grant select on public.app_settings to anon;
grant all on public.courses, public.sections, public.course_sections, public.lessons,
  public.section_lessons, public.banners, public.app_settings to service_role;

-- Courses --------------------------------------------------------------------------------------

create policy "courses: published for students, all for staff"
  on public.courses for select to authenticated
  using (is_published or (select private.is_staff()));

create policy "courses: staff insert" on public.courses for insert to authenticated
  with check ((select private.is_staff()));
create policy "courses: staff update" on public.courses for update to authenticated
  using ((select private.is_staff())) with check ((select private.is_staff()));
create policy "courses: staff delete" on public.courses for delete to authenticated
  using ((select private.is_staff()));

-- Sections -------------------------------------------------------------------------------------

create policy "sections: visible through a published course, all for staff"
  on public.sections for select to authenticated
  using ((select private.is_staff()) or private.section_is_visible(id));

create policy "sections: staff insert" on public.sections for insert to authenticated
  with check ((select private.is_staff()));
create policy "sections: staff update" on public.sections for update to authenticated
  using ((select private.is_staff())) with check ((select private.is_staff()));
create policy "sections: staff delete" on public.sections for delete to authenticated
  using ((select private.is_staff()));

create policy "course_sections: rows of published courses, all for staff"
  on public.course_sections for select to authenticated
  using (
    (select private.is_staff())
    or exists (select 1 from public.courses c where c.id = course_id and c.is_published)
  );

-- Lessons --------------------------------------------------------------------------------------

create policy "lessons: visible through a published course, all for staff"
  on public.lessons for select to authenticated
  using ((select private.is_staff()) or private.lesson_is_visible(id));

create policy "lessons: staff insert" on public.lessons for insert to authenticated
  with check ((select private.is_staff()));
create policy "lessons: staff update" on public.lessons for update to authenticated
  using ((select private.is_staff())) with check ((select private.is_staff()));
create policy "lessons: staff delete" on public.lessons for delete to authenticated
  using ((select private.is_staff()));

create policy "section_lessons: rows of visible sections, all for staff"
  on public.section_lessons for select to authenticated
  using ((select private.is_staff()) or private.section_is_visible(section_id));

-- Banners and settings ---------------------------------------------------------------------------

create policy "banners: active for students, all for staff"
  on public.banners for select to authenticated
  using (is_active or (select private.is_staff()));

create policy "banners: staff insert" on public.banners for insert to authenticated
  with check ((select private.is_staff()));
create policy "banners: staff update" on public.banners for update to authenticated
  using ((select private.is_staff())) with check ((select private.is_staff()));
create policy "banners: staff delete" on public.banners for delete to authenticated
  using ((select private.is_staff()));

create policy "app_settings: anyone reads" on public.app_settings for select to anon, authenticated
  using (true);
create policy "app_settings: staff update" on public.app_settings for update to authenticated
  using ((select private.is_staff())) with check ((select private.is_staff()));
