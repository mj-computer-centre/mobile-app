-- Demo content for a development project: three courses sharing units, as the centre will set
-- them up (the MS Word unit sits in DCA, ADCA and Basic Computer), and one test that opens
-- tomorrow. No lessons: add real YouTube links from the admin panel. Safe to run more than once.
-- Run in the Supabase SQL editor of the DEV project only.

insert into public.courses (id, title, short_description, duration_text, original_price_paise, about_points, is_published, sort_order)
values
  ('00000000-0000-4000-8000-00000000c001', 'Basic Computer', 'Computer basics for beginners', '3 months', 299900,
   array['Video lessons in Hindi', 'PDF notes', 'Free certificate'], true, 0),
  ('00000000-0000-4000-8000-00000000c002', 'DCA', 'Diploma in Computer Applications', '6 months', 799900,
   array['Video lessons in Hindi', 'PDF notes', 'Free certificate'], true, 1),
  ('00000000-0000-4000-8000-00000000c003', 'ADCA', 'Advanced Diploma in Computer Applications', '12 months', 1499900,
   array['Video lessons in Hindi', 'PDF notes', 'Free certificate'], true, 2)
on conflict (id) do nothing;

insert into public.sections (id, title)
values
  ('00000000-0000-4000-8000-00000000a001', 'Fundamentals of Computer'),
  ('00000000-0000-4000-8000-00000000a002', 'MS Word'),
  ('00000000-0000-4000-8000-00000000a003', 'MS Excel'),
  ('00000000-0000-4000-8000-00000000a004', 'Tally Prime')
on conflict (id) do nothing;

insert into public.course_sections (course_id, section_id, position)
values
  ('00000000-0000-4000-8000-00000000c001', '00000000-0000-4000-8000-00000000a001', 0),
  ('00000000-0000-4000-8000-00000000c001', '00000000-0000-4000-8000-00000000a002', 1),
  ('00000000-0000-4000-8000-00000000c002', '00000000-0000-4000-8000-00000000a001', 0),
  ('00000000-0000-4000-8000-00000000c002', '00000000-0000-4000-8000-00000000a002', 1),
  ('00000000-0000-4000-8000-00000000c002', '00000000-0000-4000-8000-00000000a003', 2),
  ('00000000-0000-4000-8000-00000000c003', '00000000-0000-4000-8000-00000000a001', 0),
  ('00000000-0000-4000-8000-00000000c003', '00000000-0000-4000-8000-00000000a002', 1),
  ('00000000-0000-4000-8000-00000000c003', '00000000-0000-4000-8000-00000000a003', 2),
  ('00000000-0000-4000-8000-00000000c003', '00000000-0000-4000-8000-00000000a004', 3)
on conflict (course_id, section_id) do nothing;

-- A demo test for DCA: opens a day after the seed runs and stays open for two days, so there is
-- time to try it. Edit the times in Admin > Tests to open it sooner.
insert into public.tests (id, title, description, course_id, duration_minutes, starts_at, ends_at, pass_percent, is_published)
values
  ('00000000-0000-4000-8000-00000000e001', 'Computer Fundamentals practice test',
   'Three easy questions to show how tests work.',
   '00000000-0000-4000-8000-00000000c002', 10, now() + interval '1 day', now() + interval '3 days', 40, true)
on conflict (id) do nothing;

insert into public.test_questions (id, test_id, position, prompt, options, marks)
values
  ('00000000-0000-4000-8000-00000000d001', '00000000-0000-4000-8000-00000000e001', 0,
   'What is the full form of CPU?',
   array['Central Program Unit', 'Central Processing Unit', 'Control Panel Unit', 'Computer Personal Unit'], 1),
  ('00000000-0000-4000-8000-00000000d002', '00000000-0000-4000-8000-00000000e001', 1,
   'Which of these is an input device?',
   array['Monitor', 'Printer', 'Keyboard', 'Speaker'], 1),
  ('00000000-0000-4000-8000-00000000d003', '00000000-0000-4000-8000-00000000e001', 2,
   'Which shortcut copies the selected text?',
   array['Ctrl + V', 'Ctrl + C', 'Ctrl + X', 'Ctrl + Z'], 1)
on conflict (id) do nothing;

insert into public.test_answer_keys (question_id, correct_option, explanation)
values
  ('00000000-0000-4000-8000-00000000d001', 1, 'The CPU, or Central Processing Unit, carries out the instructions of a program.'),
  ('00000000-0000-4000-8000-00000000d002', 2, 'A keyboard sends what you type into the computer.'),
  ('00000000-0000-4000-8000-00000000d003', 1, '')
on conflict (question_id) do nothing;
