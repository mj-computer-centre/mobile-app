-- Managing tests: only staff create tests and questions; questions keep gap-free positions and
-- always have an answer key.
begin;

select tests.create_user('owner@test.in') as owner_id \gset
select tests.create_user('asha@test.in') as asha_id \gset
select private.bootstrap_owner('owner@test.in');

-- A student ------------------------------------------------------------------------------------
select tests.act_as(:'asha_id');

select tests.check_raises(
  $$insert into public.tests (title, duration_minutes, starts_at, ends_at)
    values ('Hack', 10, now(), now() + interval '1 hour')$$,
  'row-level security', 'a student cannot create a test');
select tests.check_raises(
  $$select public.save_test_question('00000000-0000-0000-0000-0000000000e1', null, 'Q?', array['A', 'B'], 0)$$,
  'mcc:staff_only', 'a student cannot add questions');
select tests.check_raises(
  $$select public.import_test_questions('00000000-0000-0000-0000-0000000000e1', '[]')$$,
  'mcc:staff_only', 'a student cannot import questions');
select tests.check_raises(
  $$select public.delete_test_question('00000000-0000-0000-0000-0000000000d1')$$,
  'mcc:staff_only', 'a student cannot delete questions');
select tests.check_raises(
  $$select public.reorder_test_questions('00000000-0000-0000-0000-0000000000e1', array[]::uuid[])$$,
  'mcc:staff_only', 'a student cannot reorder questions');

-- Staff ----------------------------------------------------------------------------------------
select tests.act_as(:'owner_id');

select tests.check_raises(
  $$insert into public.tests (title, duration_minutes, starts_at, ends_at)
    values ('Backwards', 10, now(), now() - interval '1 hour')$$,
  'tests_window_valid', 'a test must end after it starts');

insert into public.tests (id, title, duration_minutes, starts_at, ends_at)
values ('00000000-0000-0000-0000-0000000000e1', 'Unit test 1', 20, now() + interval '1 day', now() + interval '2 days');
select tests.check_equal(
  (select is_published from public.tests where id = '00000000-0000-0000-0000-0000000000e1'), false,
  'a new test starts as a draft');

select public.save_test_question(
  '00000000-0000-0000-0000-0000000000e1', null, '  Full form of RAM?  ',
  array[' Random Access Memory ', 'Read Access Memory'], 0, 2, 'RAM is Random Access Memory.') as q1 \gset
select public.save_test_question(
  '00000000-0000-0000-0000-0000000000e1', null, 'Which key deletes to the left?',
  array['Delete', 'Backspace', 'Esc'], 1) as q2 \gset

select tests.check_equal(
  (select position from public.test_questions where id = :'q2'), 1,
  'new questions go to the end of the test');
select tests.check_equal(
  (select prompt from public.test_questions where id = :'q1'), 'Full form of RAM?',
  'spaces around a question are trimmed');
select tests.check_equal(
  (select options[1] from public.test_questions where id = :'q1'), 'Random Access Memory',
  'spaces around options are trimmed');
select tests.check_equal(
  (select correct_option from public.test_answer_keys where question_id = :'q1'), 0,
  'the answer key is saved with the question');
select tests.check_equal(
  (select marks from public.test_questions where id = :'q2'), 1,
  'a question is worth one mark unless it says otherwise');

select tests.check_raises(
  $$select public.save_test_question('00000000-0000-0000-0000-0000000000e1', null, 'One option?', array['Only'], 0)$$,
  'mcc:invalid_question', 'a question needs at least two options');
select tests.check_raises(
  $$select public.save_test_question('00000000-0000-0000-0000-0000000000e1', null, 'Which?', array['A', 'B'], 2)$$,
  'mcc:invalid_question', 'the correct answer must be one of the options');
select tests.check_raises(
  $$select public.save_test_question('00000000-0000-0000-0000-0000000000e1', null, '   ', array['A', 'B'], 0)$$,
  'mcc:invalid_question', 'a question needs text');
select tests.check_raises(
  $$select public.save_test_question('00000000-0000-0000-0000-0000000000e1', null, 'Blank option?', array['A', ' '], 0)$$,
  'mcc:invalid_question', 'an option cannot be blank');
select tests.check_raises(
  $$select public.save_test_question('00000000-0000-0000-0000-0000000000e1', null, 'Marks?', array['A', 'B'], 0, 0)$$,
  'mcc:invalid_question', 'marks must be at least one');
select tests.check_raises(
  $$select public.save_test_question('00000000-0000-0000-0000-00000000dead', null, 'Q?', array['A', 'B'], 0)$$,
  'mcc:test_not_found', 'a question cannot be added to a test that does not exist');

select public.save_test_question(
  '00000000-0000-0000-0000-0000000000e1', :'q2', 'Which key erases the letter before the cursor?',
  array['Delete', 'Esc', 'Backspace'], 2);
select tests.check_equal(
  (select correct_option from public.test_answer_keys where question_id = :'q2'), 2,
  'editing a question updates its answer key');
select tests.check_equal((select count(*) from public.test_questions), 2::bigint,
  'editing a question does not add one');
select tests.check_raises(
  format($$select public.save_test_question('00000000-0000-0000-0000-00000000dead', %L, 'Q?', array['A', 'B'], 0)$$, :'q2'),
  'mcc:test_not_found', 'a question cannot be moved to a test that does not exist');

-- Import.
select tests.check_equal(
  public.import_test_questions('00000000-0000-0000-0000-0000000000e1', '[
    {"prompt": "Ctrl+S does what?", "options": ["Save", "Search"], "correct_option": 0},
    {"prompt": "Ctrl+P does what?", "options": ["Paste", "Print"], "correct_option": 1, "marks": 2},
    {"prompt": "Ctrl+Z does what?", "options": ["Undo", "Zoom"], "correct_option": 0, "explanation": "Z for undo."}
  ]'::jsonb),
  3, 'importing adds every question');
select tests.check_equal(
  (select string_agg(position::text, ',' order by position) from public.test_questions
     where test_id = '00000000-0000-0000-0000-0000000000e1'),
  '0,1,2,3,4', 'imported questions follow the existing ones in order');
select tests.check_equal(
  (select count(*) from public.test_answer_keys), 5::bigint,
  'every imported question has an answer key');
select tests.check_raises(
  $$select public.import_test_questions('00000000-0000-0000-0000-0000000000e1', '[
      {"prompt": "Fine?", "options": ["Yes", "No"], "correct_option": 0},
      {"prompt": "Broken", "options": ["Only one"], "correct_option": 0}
    ]'::jsonb)$$,
  'mcc:invalid_question', 'one bad question refuses the whole import');
select tests.check_equal((select count(*) from public.test_questions), 5::bigint,
  'a refused import adds nothing');

-- Reorder and delete.
select tests.check_raises(
  format($$select public.reorder_test_questions('00000000-0000-0000-0000-0000000000e1', array[%L, %L]::uuid[])$$,
    :'q2', :'q1'),
  'mcc:order_mismatch', 'a reorder that leaves out a question is refused');

select public.reorder_test_questions(
  '00000000-0000-0000-0000-0000000000e1',
  array(select id from public.test_questions
        where test_id = '00000000-0000-0000-0000-0000000000e1' order by position desc));
select tests.check_equal(
  (select position from public.test_questions where id = :'q1'), 4,
  'reordering applies the new order');

select public.delete_test_question(:'q2');
select tests.check_equal(
  (select string_agg(position::text, ',' order by position) from public.test_questions
     where test_id = '00000000-0000-0000-0000-0000000000e1'),
  '0,1,2,3', 'deleting a question closes the gap');
select tests.check_equal(
  (select count(*) from public.test_answer_keys where question_id = :'q2'), 0::bigint,
  'a deleted question takes its answer key with it');

-- Read models.
select tests.check_equal(
  (select question_count from public.test_usage where test_id = '00000000-0000-0000-0000-0000000000e1'),
  4, 'the test list counts questions');
select tests.check_equal(
  (select total_marks from public.test_usage where test_id = '00000000-0000-0000-0000-0000000000e1'),
  6, 'the test list adds up the marks');
select tests.check_equal((select tests_total from public.admin_dashboard_stats()), 1::bigint,
  'the dashboard counts tests');
select tests.check_equal((select tests_published from public.admin_dashboard_stats()), 0::bigint,
  'the dashboard counts published tests separately');

select tests.check_equal(
  tests.rows_affected($$update public.tests set is_published = true, allow_late = true
                        where id = '00000000-0000-0000-0000-0000000000e1'$$),
  1, 'staff can publish a test and allow late attempts');

select tests.act_as(:'asha_id');
select tests.check_equal(
  tests.rows_affected($$update public.tests set allow_late = false$$), 0,
  'a student cannot change a test');
select tests.check_equal(
  (select question_count from public.test_usage where test_id = '00000000-0000-0000-0000-0000000000e1'),
  0, 'the staff read model reveals nothing about questions to a student');

select tests.act_as(:'owner_id');
select tests.check_equal(
  tests.rows_affected($$delete from public.tests where id = '00000000-0000-0000-0000-0000000000e1'$$),
  1, 'staff can delete a test');
select tests.check_equal((select count(*) from public.test_questions), 0::bigint,
  'deleting a test deletes its questions');

rollback;
