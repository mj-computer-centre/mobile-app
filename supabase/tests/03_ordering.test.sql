-- Attach, detach and reorder keep positions gap-free; only staff may use them.
begin;

select tests.create_user('owner@test.in') as owner_id \gset
select tests.create_user('asha@test.in') as asha_id \gset
select private.bootstrap_owner('owner@test.in');

insert into public.courses (id, title, is_published) values ('00000000-0000-0000-0000-0000000000c1', 'ADCA', true);
insert into public.sections (id, title)
values ('00000000-0000-0000-0000-0000000000a1', 'Fundamentals'),
       ('00000000-0000-0000-0000-0000000000a2', 'MS Paint'),
       ('00000000-0000-0000-0000-0000000000a3', 'MS Word');
insert into public.lessons (id, kind, title, youtube_video_id)
values ('00000000-0000-0000-0000-0000000000b1', 'video', 'Part 1', 'aaaaaaaaaa1'),
       ('00000000-0000-0000-0000-0000000000b2', 'video', 'Part 2', 'aaaaaaaaaa2');

select tests.act_as(:'asha_id');
select tests.check_raises(
  $$select public.attach_section('00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-0000000000a1')$$,
  'mcc:staff_only', 'a student cannot attach units');
select tests.check_raises($$select * from public.admin_dashboard_stats()$$,
  'mcc:staff_only', 'a student cannot read dashboard numbers');

select tests.act_as(:'owner_id');

select tests.check_equal(
  public.attach_section('00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-0000000000a1'),
  0, 'the first unit gets position 0');
select public.attach_section('00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-0000000000a2');
select tests.check_equal(
  public.attach_section('00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-0000000000a3'),
  2, 'later units go to the end');
select tests.check_equal(
  public.attach_section('00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-0000000000a1'),
  0, 'attaching an attached unit again changes nothing');

select public.reorder_course_sections('00000000-0000-0000-0000-0000000000c1', array[
  '00000000-0000-0000-0000-0000000000a3', '00000000-0000-0000-0000-0000000000a1',
  '00000000-0000-0000-0000-0000000000a2']::uuid[]);
select tests.check_equal(
  (select string_agg(s.title, ',' order by cs.position) from public.course_sections cs
     join public.sections s on s.id = cs.section_id where cs.course_id = '00000000-0000-0000-0000-0000000000c1'),
  'MS Word,Fundamentals,MS Paint', 'reordering applies the new order');

select tests.check_raises(
  $$select public.reorder_course_sections('00000000-0000-0000-0000-0000000000c1', array[
    '00000000-0000-0000-0000-0000000000a3', '00000000-0000-0000-0000-0000000000a1']::uuid[])$$,
  'mcc:order_mismatch', 'a reorder that leaves out a unit is refused');
select tests.check_raises(
  $$select public.reorder_course_sections('00000000-0000-0000-0000-0000000000c1', array[
    '00000000-0000-0000-0000-0000000000a3', '00000000-0000-0000-0000-0000000000a3',
    '00000000-0000-0000-0000-0000000000a1']::uuid[])$$,
  'mcc:order_mismatch', 'a reorder that repeats a unit is refused');

select public.detach_section('00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-0000000000a1');
select tests.check_equal(
  (select string_agg(cs.position::text, ',' order by cs.position) from public.course_sections cs
     where cs.course_id = '00000000-0000-0000-0000-0000000000c1'),
  '0,1', 'removing a unit closes the gap');
select tests.check(exists (select 1 from public.sections where id = '00000000-0000-0000-0000-0000000000a1'),
  'removing a unit from a course keeps the unit in the library');

-- Lessons in a unit.
select public.attach_lesson('00000000-0000-0000-0000-0000000000a3', '00000000-0000-0000-0000-0000000000b1');
select tests.check_equal(
  public.attach_lesson('00000000-0000-0000-0000-0000000000a3', '00000000-0000-0000-0000-0000000000b2'),
  1, 'lessons are added at the end of the unit');
select public.reorder_section_lessons('00000000-0000-0000-0000-0000000000a3', array[
  '00000000-0000-0000-0000-0000000000b2', '00000000-0000-0000-0000-0000000000b1']::uuid[]);
select tests.check_equal(
  (select lesson_id from public.section_lessons
     where section_id = '00000000-0000-0000-0000-0000000000a3' and position = 0),
  '00000000-0000-0000-0000-0000000000b2'::uuid, 'lessons can be reordered');
select public.detach_lesson('00000000-0000-0000-0000-0000000000a3', '00000000-0000-0000-0000-0000000000b2');
select tests.check_equal(
  (select position from public.section_lessons
     where section_id = '00000000-0000-0000-0000-0000000000a3' and lesson_id = '00000000-0000-0000-0000-0000000000b1'),
  0, 'removing a lesson closes the gap');

-- Bulk attach (playlist import): keeps the given order, skips duplicates and lessons already there.
insert into public.lessons (id, kind, title, youtube_video_id)
values ('00000000-0000-0000-0000-0000000000b3', 'video', 'Part 3', 'aaaaaaaaaa3');
select tests.check_equal(
  public.attach_lessons('00000000-0000-0000-0000-0000000000a3', array[
    '00000000-0000-0000-0000-0000000000b3', '00000000-0000-0000-0000-0000000000b1',
    '00000000-0000-0000-0000-0000000000b2', '00000000-0000-0000-0000-0000000000b3']::uuid[]),
  2, 'a playlist import adds only lessons not already in the unit');
select tests.check_equal(
  (select string_agg(l.title, ',' order by sl.position) from public.section_lessons sl
     join public.lessons l on l.id = sl.lesson_id where sl.section_id = '00000000-0000-0000-0000-0000000000a3'),
  'Part 1,Part 3,Part 2', 'imported lessons go to the end in playlist order');
select tests.check_raises(
  $$select public.attach_lessons('00000000-0000-0000-0000-0000000000a3', array['00000000-0000-0000-0000-00000000dead']::uuid[])$$,
  'mcc:lesson_not_found', 'importing a lesson that does not exist is refused');

select tests.check_equal((select courses_total from public.admin_dashboard_stats()), 1::bigint,
  'staff can read dashboard numbers');
select tests.check_equal((select students_total from public.admin_dashboard_stats()), 1::bigint,
  'the dashboard counts students, not staff');

rollback;
