-- Who can see and change catalog content.
begin;

select tests.create_user('owner@test.in') as owner_id \gset
select tests.create_user('asha@test.in') as asha_id \gset
select private.bootstrap_owner('owner@test.in');

-- Fixtures: a published course with one unit, and a draft course with another.
insert into public.courses (id, title, is_published, original_price_paise)
values ('00000000-0000-0000-0000-0000000000c1', 'ADCA', true, 1499900),
       ('00000000-0000-0000-0000-0000000000c2', 'Tally (draft)', false, null);
insert into public.sections (id, title)
values ('00000000-0000-0000-0000-0000000000a1', 'MS Word'),
       ('00000000-0000-0000-0000-0000000000a2', 'Tally Prime');
insert into public.course_sections (course_id, section_id, position)
values ('00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-0000000000a1', 0),
       ('00000000-0000-0000-0000-0000000000c2', '00000000-0000-0000-0000-0000000000a2', 0);
insert into public.lessons (id, kind, title, pdf_path)
values ('00000000-0000-0000-0000-0000000000f1', 'pdf', 'Mail merge notes', 'f1.pdf'),
       ('00000000-0000-0000-0000-0000000000f2', 'pdf', 'MS Word full notes', 'f2.pdf');
insert into public.lessons (id, kind, title, youtube_video_id, notes_lesson_id)
values ('00000000-0000-0000-0000-0000000000b1', 'video', 'Mail merge', 'dQw4w9WgXcQ',
        '00000000-0000-0000-0000-0000000000f1'),
       ('00000000-0000-0000-0000-0000000000b2', 'video', 'Vouchers', 'aaaaaaaaaaa', null);
insert into public.section_lessons (section_id, lesson_id, position)
values ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000b1', 0),
       ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000f2', 1),
       ('00000000-0000-0000-0000-0000000000a2', '00000000-0000-0000-0000-0000000000b2', 0);
insert into public.banners (image_path, is_active) values ('banners/on.jpg', true), ('banners/off.jpg', false);

-- Data rules -----------------------------------------------------------------------------------
select tests.check_raises(
  $$insert into public.lessons (kind, title) values ('video', 'No link')$$,
  'lessons_kind_shape', 'a video lesson needs a YouTube video id');

select tests.check_raises(
  $$insert into public.lessons (kind, title, youtube_video_id) values ('video', 'Again', 'dQw4w9WgXcQ')$$,
  'lessons_youtube_video_id_unique', 'the same YouTube video is stored only once');

select tests.check_raises(
  $$update public.lessons set notes_lesson_id = '00000000-0000-0000-0000-0000000000b2'
    where id = '00000000-0000-0000-0000-0000000000b1'$$,
  'mcc:notes_must_be_pdf', 'notes attached to a video must be a PDF');

-- A student ----------------------------------------------------------------------------------
select tests.act_as(:'asha_id');

select tests.check_equal((select count(*) from public.courses), 1::bigint,
  'a student sees published courses only');
select tests.check_equal((select count(*) from public.sections), 1::bigint,
  'a student sees units of published courses only');
select tests.check_equal((select count(*) from public.course_sections), 1::bigint,
  'a student sees course-unit links of published courses only');
select tests.check_equal((select count(*) from public.section_lessons), 2::bigint,
  'a student sees lesson links of visible units only');
select tests.check(
  exists (select 1 from public.lessons where id = '00000000-0000-0000-0000-0000000000f1'),
  'a student sees the notes PDF attached to a visible video');
select tests.check(
  not exists (select 1 from public.lessons where id = '00000000-0000-0000-0000-0000000000b2'),
  'a student cannot see lessons of a draft course');
select tests.check_equal((select count(*) from public.banners), 1::bigint,
  'a student sees active banners only');

select tests.check_raises($$insert into public.courses (title) values ('Hack')$$,
  'row-level security', 'a student cannot create a course');
select tests.check_equal(
  tests.rows_affected($$update public.courses set title = 'Changed'$$), 0,
  'a student cannot edit a course');
select tests.check_equal(
  tests.rows_affected($$update public.app_settings set phone = '9999999999'$$), 0,
  'a student cannot change the contact details');
select tests.check_raises(
  $$insert into public.course_sections values ('00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-0000000000a2', 5)$$,
  'permission denied', 'nobody writes course-unit links directly');

-- Before sign-in -------------------------------------------------------------------------------
select tests.act_as_anon();
select tests.check_equal((select count(*) from public.app_settings), 1::bigint,
  'contact details are readable before sign-in');
-- The public website lists courses (supabase/tests/07_public_site.test.sql has the detail).
select tests.check_equal((select count(*) from public.courses), 1::bigint,
  'published courses are readable before sign-in, drafts are not');
select tests.check_raises($$select count(*) from public.lessons$$, 'permission denied',
  'lessons are not readable before sign-in');

-- Staff ----------------------------------------------------------------------------------------
select tests.act_as(:'owner_id');

select tests.check_equal((select count(*) from public.courses), 2::bigint,
  'staff see draft and published courses');
select tests.check_equal((select count(*) from public.lessons), 4::bigint,
  'staff see every lesson');
select tests.check_equal(
  tests.rows_affected($$update public.app_settings set phone = '9876543210', timings = 'Mon–Sat 8 am–6 pm'$$),
  1, 'staff can change the contact details');
insert into public.courses (title) values ('Basic Computer');
select tests.check_equal(
  (select count(*) from public.courses where title = 'Basic Computer'), 1::bigint,
  'staff can create a course');
select tests.check_equal(
  (select section_count from public.lesson_usage where lesson_id = '00000000-0000-0000-0000-0000000000f1'),
  0, 'lesson usage counts the units a lesson sits in');
select tests.check_equal(
  (select attached_to_video_count from public.lesson_usage where lesson_id = '00000000-0000-0000-0000-0000000000f1'),
  1, 'lesson usage counts the videos a notes PDF is attached to');

rollback;
