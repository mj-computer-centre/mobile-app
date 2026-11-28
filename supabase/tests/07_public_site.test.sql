-- The public website: a visitor who has not signed in sees course names and outlines, and
-- nothing that would let them watch a lesson or take a test.
begin;

select tests.create_user('owner@test.in') as owner_id \gset
select private.bootstrap_owner('owner@test.in');

insert into public.courses (id, title, short_description, is_published)
values ('00000000-0000-0000-0000-0000000000c1', 'ADCA', 'Advanced diploma', true),
       ('00000000-0000-0000-0000-0000000000c2', 'Tally (draft)', '', false);
insert into public.sections (id, title)
values ('00000000-0000-0000-0000-0000000000a1', 'MS Word'),
       ('00000000-0000-0000-0000-0000000000a2', 'MS Excel'),
       ('00000000-0000-0000-0000-0000000000a3', 'Tally Prime');
insert into public.course_sections (course_id, section_id, position)
values ('00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-0000000000a1', 0),
       ('00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-0000000000a2', 1),
       ('00000000-0000-0000-0000-0000000000c2', '00000000-0000-0000-0000-0000000000a3', 0);
insert into public.lessons (id, kind, title, pdf_path)
values ('00000000-0000-0000-0000-0000000000f1', 'pdf', 'Mail merge notes', 'f1.pdf'),
       ('00000000-0000-0000-0000-0000000000f2', 'pdf', 'MS Word full notes', 'f2.pdf'),
       ('00000000-0000-0000-0000-0000000000f3', 'pdf', 'Unused notes', 'f3.pdf');
insert into public.lessons (id, kind, title, youtube_video_id, duration_seconds, notes_lesson_id)
values ('00000000-0000-0000-0000-0000000000b1', 'video', 'Mail merge', 'dQw4w9WgXcQ', 300,
        '00000000-0000-0000-0000-0000000000f1'),
       ('00000000-0000-0000-0000-0000000000b2', 'video', 'Vouchers', 'aaaaaaaaaaa', 200, null);
insert into public.section_lessons (section_id, lesson_id, position)
values ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000b1', 0),
       ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000f2', 1),
       ('00000000-0000-0000-0000-0000000000a3', '00000000-0000-0000-0000-0000000000b2', 0);

insert into public.tests (id, title, course_id, duration_minutes, starts_at, ends_at, is_published)
values
  ('00000000-0000-0000-0000-0000000000e1', 'Sunday test', '00000000-0000-0000-0000-0000000000c1', 30,
   now() + interval '1 day', now() + interval '2 days', true),
  ('00000000-0000-0000-0000-0000000000e2', 'Last week''s test', null, 30,
   now() - interval '8 days', now() - interval '7 days', true),
  ('00000000-0000-0000-0000-0000000000e3', 'Draft test', null, 30,
   now() + interval '1 day', now() + interval '2 days', false);
insert into public.test_questions (test_id, position, prompt, options)
values ('00000000-0000-0000-0000-0000000000e1', 0, 'Secret question', array['A', 'B']);

select tests.act_as_anon();

select tests.check_equal((select count(*) from public.courses), 1::bigint,
  'a visitor sees published courses only');
select tests.check_raises($$insert into public.courses (title) values ('Hack')$$,
  'permission denied', 'a visitor cannot create a course');
select tests.check_raises($$select count(*) from public.lessons$$, 'permission denied',
  'lessons are not readable before sign-in');
select tests.check_raises($$select count(*) from public.sections$$, 'permission denied',
  'units are not readable from the tables before sign-in');
select tests.check_raises($$select count(*) from public.tests$$, 'permission denied',
  'tests are not readable from the table before sign-in');
select tests.check_raises($$select count(*) from public.test_questions$$, 'permission denied',
  'test questions are not readable before sign-in');
select tests.check_raises($$select count(*) from public.profiles$$, 'permission denied',
  'student details are not readable before sign-in');
select tests.check_raises(
  $$select public.start_test('00000000-0000-0000-0000-0000000000e1')$$,
  'permission denied', 'a visitor cannot start a test');
select tests.check_raises($$select * from public.my_tests()$$,
  'permission denied', 'a visitor cannot list tests with attempts');

select tests.check_equal(
  (select count(*) from public.public_course_outline('00000000-0000-0000-0000-0000000000c1')),
  3::bigint, 'the outline lists each lesson, and a unit without lessons once');
select tests.check_equal(
  (select string_agg(coalesce(lesson_title, '-'), ',' order by unit_position, lesson_position)
     from public.public_course_outline('00000000-0000-0000-0000-0000000000c1')),
  'Mail merge,MS Word full notes,-', 'the outline is in teaching order');
select tests.check_equal(
  (select count(*) from public.public_course_outline('00000000-0000-0000-0000-0000000000c2')),
  0::bigint, 'a draft course has no public outline');

select tests.check_equal((select courses from public.public_site_stats()), 1,
  'the website counts published courses');
select tests.check_equal((select videos from public.public_site_stats()), 1,
  'the website counts videos students can open');
select tests.check_equal((select notes from public.public_site_stats()), 2,
  'the website counts unit notes and notes attached to videos, not unused files');
select tests.check_equal((select tests from public.public_site_stats()), 2,
  'the website counts published tests');

select tests.check_equal(
  (select string_agg(title, ',') from public.public_upcoming_tests()),
  'Sunday test', 'the website lists published tests that have not ended');
select tests.check_equal(
  (select question_count from public.public_upcoming_tests() limit 1), 1,
  'the website says how many questions a test has');
select tests.check_equal(
  (select course_title from public.public_upcoming_tests() limit 1), 'ADCA',
  'the website names the course a test belongs to');

select tests.check_equal((select count(*) from public.app_settings), 1::bigint,
  'contact details and the Play Store link are readable before sign-in');

-- Staff set the Play Store link.
select tests.act_as(:'owner_id');
select tests.check_equal(
  tests.rows_affected($$update public.app_settings
    set play_store_url = 'https://play.google.com/store/apps/details?id=in.example.app'$$),
  1, 'staff can set the Play Store link');

rollback;
