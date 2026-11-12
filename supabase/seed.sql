-- Demo content for a development project: three courses sharing units, as the centre will set
-- them up (the MS Word unit sits in DCA, ADCA and Basic Computer). No lessons: add real YouTube
-- links from the admin panel. Safe to run more than once.
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
