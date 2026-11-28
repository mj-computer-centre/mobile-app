-- Taking a test: who can see what, the time window, late attempts, answers and scores.
-- now() does not move inside a transaction, so "time passing" is simulated by moving a test's
-- window or an attempt's deadline as the database owner.
begin;

select tests.create_user('owner@test.in', 'Centre Owner') as owner_id \gset
select tests.create_user('asha@test.in', 'Asha Kumari') as asha_id \gset
select tests.create_user('ravi@test.in', 'Ravi Kumar') as ravi_id \gset
select private.bootstrap_owner('owner@test.in');

insert into public.tests (id, title, duration_minutes, starts_at, ends_at, is_published, allow_late, pass_percent)
values
  ('00000000-0000-0000-0000-0000000000e1', 'Live test', 30, now() - interval '1 hour', now() + interval '1 hour', true, false, 50),
  ('00000000-0000-0000-0000-0000000000e2', 'Upcoming test', 30, now() + interval '1 day', now() + interval '2 days', true, false, null),
  ('00000000-0000-0000-0000-0000000000e3', 'Closed test', 30, now() - interval '2 days', now() - interval '1 day', true, false, null),
  ('00000000-0000-0000-0000-0000000000e4', 'Closed, late allowed', 30, now() - interval '2 days', now() - interval '1 day', true, true, null),
  ('00000000-0000-0000-0000-0000000000e5', 'Draft test', 30, now() - interval '1 hour', now() + interval '1 hour', false, false, null),
  ('00000000-0000-0000-0000-0000000000e6', 'Ends soon', 30, now() - interval '1 hour', now() + interval '10 minutes', true, false, null),
  ('00000000-0000-0000-0000-0000000000e7', 'No questions yet', 30, now() - interval '1 hour', now() + interval '1 hour', true, false, null);

insert into public.test_questions (id, test_id, position, prompt, options, marks)
values
  ('00000000-0000-0000-0000-0000000000d1', '00000000-0000-0000-0000-0000000000e1', 0, 'Full form of CPU?', array['Central Program Unit', 'Central Processing Unit', 'Control Panel Unit'], 2),
  ('00000000-0000-0000-0000-0000000000d2', '00000000-0000-0000-0000-0000000000e1', 1, 'Which is an input device?', array['Keyboard', 'Monitor'], 1),
  ('00000000-0000-0000-0000-0000000000d3', '00000000-0000-0000-0000-0000000000e1', 2, 'Shortcut for copy?', array['Ctrl+V', 'Ctrl+X', 'Ctrl+C', 'Ctrl+Z'], 1),
  ('00000000-0000-0000-0000-0000000000d4', '00000000-0000-0000-0000-0000000000e4', 0, 'Late question', array['Yes', 'No'], 1),
  ('00000000-0000-0000-0000-0000000000d5', '00000000-0000-0000-0000-0000000000e5', 0, 'Draft question', array['Yes', 'No'], 1),
  ('00000000-0000-0000-0000-0000000000d6', '00000000-0000-0000-0000-0000000000e6', 0, 'Soon question', array['Yes', 'No'], 1);
insert into public.test_answer_keys (question_id, correct_option, explanation)
values
  ('00000000-0000-0000-0000-0000000000d1', 1, 'CPU stands for Central Processing Unit.'),
  ('00000000-0000-0000-0000-0000000000d2', 0, ''),
  ('00000000-0000-0000-0000-0000000000d3', 2, ''),
  ('00000000-0000-0000-0000-0000000000d4', 0, ''),
  ('00000000-0000-0000-0000-0000000000d5', 0, ''),
  ('00000000-0000-0000-0000-0000000000d6', 0, '');

-- Before starting ------------------------------------------------------------------------------
select tests.act_as(:'asha_id');

select tests.check_equal((select count(*) from public.tests), 6::bigint,
  'a student sees published tests only');
select tests.check_equal((select count(*) from public.test_questions), 0::bigint,
  'a student cannot read questions before starting a test');
select tests.check_equal((select count(*) from public.test_answer_keys), 0::bigint,
  'a student cannot read the answer key');
select tests.check_raises(
  format($$insert into public.test_attempts (test_id, user_id, deadline_at)
           values ('00000000-0000-0000-0000-0000000000e1', %L, now() + interval '10 years')$$, :'asha_id'),
  'permission denied', 'a student cannot create an attempt directly');

select tests.check_raises($$select public.start_test('00000000-0000-0000-0000-0000000000e2')$$,
  'mcc:test_not_open', 'a test cannot be started before its start time');
select tests.check_raises($$select public.start_test('00000000-0000-0000-0000-0000000000e3')$$,
  'mcc:test_closed', 'a missed test cannot be started when late attempts are not allowed');
select tests.check_raises($$select public.start_test('00000000-0000-0000-0000-0000000000e5')$$,
  'mcc:test_not_found', 'a draft test cannot be started by a student');
select tests.check_raises($$select public.start_test('00000000-0000-0000-0000-0000000000e7')$$,
  'mcc:test_has_no_questions', 'a test without questions cannot be started');

-- Starting and answering -------------------------------------------------------------------------
select id as asha_attempt from public.start_test('00000000-0000-0000-0000-0000000000e1') \gset

select tests.check_equal(
  (select deadline_at - started_at from public.test_attempts where id = :'asha_attempt'),
  interval '30 minutes', 'an attempt started in time gets the full duration');
select tests.check_equal(
  (select is_late from public.test_attempts where id = :'asha_attempt'), false,
  'an attempt started inside the window is not late');
select tests.check_equal(
  (select id from public.start_test('00000000-0000-0000-0000-0000000000e1')), :'asha_attempt'::uuid,
  'starting again returns the same attempt');

select tests.check_equal((select count(*) from public.test_questions), 3::bigint,
  'after starting, a student reads the questions of that test only');
select tests.check_equal((select count(*) from public.test_answer_keys), 0::bigint,
  'starting a test does not reveal the answer key');

select public.save_test_answers(:'asha_attempt', jsonb_build_object(
  '00000000-0000-0000-0000-0000000000d1', 1,
  '00000000-0000-0000-0000-0000000000d2', 1));
select tests.check_equal((select count(*) from public.test_answers), 2::bigint,
  'answers are saved while the test is running');

select public.save_test_answers(:'asha_attempt', jsonb_build_object(
  '00000000-0000-0000-0000-0000000000d2', null));
select tests.check_equal((select count(*) from public.test_answers), 1::bigint,
  'an answer can be cleared');
select public.save_test_answers(:'asha_attempt', jsonb_build_object(
  '00000000-0000-0000-0000-0000000000d2', 1));

select tests.check_raises(
  format($$select public.save_test_answers(%L, '{"00000000-0000-0000-0000-0000000000d2": 2}')$$, :'asha_attempt'),
  'mcc:invalid_answer', 'an option the question does not have is refused');
select tests.check_raises(
  format($$select public.save_test_answers(%L, '{"00000000-0000-0000-0000-0000000000d4": 0}')$$, :'asha_attempt'),
  'mcc:invalid_answer', 'a question from another test is refused');
select tests.check_raises(
  format($$select public.save_test_answers(%L, '{"00000000-0000-0000-0000-0000000000d1": "1"}')$$, :'asha_attempt'),
  'mcc:invalid_answer', 'an answer that is not a number is refused');
select tests.check_raises(
  format($$insert into public.test_answers (attempt_id, question_id, selected_option)
           values (%L, '00000000-0000-0000-0000-0000000000d3', 2)$$, :'asha_attempt'),
  'permission denied', 'a student cannot write answers directly');

select tests.check(
  (select score is null and attempt_id is not null from public.my_tests()
     where id = '00000000-0000-0000-0000-0000000000e1'),
  'the test list shows no score while the test is running');
select tests.check_equal((select count(*) from public.my_tests()), 6::bigint,
  'the test list has every published test');
select tests.check_equal(
  (select question_count from public.my_tests() where id = '00000000-0000-0000-0000-0000000000e2'),
  0, 'the test list counts questions without revealing them');

-- Another student ------------------------------------------------------------------------------
select tests.act_as(:'ravi_id');

select tests.check_equal((select count(*) from public.test_attempts), 0::bigint,
  'a student cannot see another student''s attempt');
select tests.check_raises(
  format($$select public.save_test_answers(%L, '{}')$$, :'asha_attempt'),
  'mcc:attempt_not_found', 'a student cannot answer in another student''s attempt');
select tests.check_equal(
  (select count(*) from public.test_attempt_summary(:'asha_attempt')), 0::bigint,
  'a student cannot read another student''s result');

select id as ravi_attempt from public.start_test('00000000-0000-0000-0000-0000000000e1') \gset
select submitted_at as ravi_submitted from public.submit_test(:'ravi_attempt', jsonb_build_object(
  '00000000-0000-0000-0000-0000000000d1', 1,
  '00000000-0000-0000-0000-0000000000d2', 0,
  '00000000-0000-0000-0000-0000000000d3', 2)) \gset
select tests.check_equal(
  (select score from public.test_attempt_summary(:'ravi_attempt')), 4,
  'answers sent with Submit are saved and marked');

-- Submitting -----------------------------------------------------------------------------------
select tests.act_as(:'asha_id');

select tests.check_equal(
  (select count(*) from public.test_attempt_review(:'asha_attempt')), 0::bigint,
  'the correct answers cannot be read while the test is running');

select tests.check(
  (select submitted_at is not null from public.submit_test(:'asha_attempt', jsonb_build_object(
     '00000000-0000-0000-0000-0000000000d3', 2))),
  'submitting finishes the attempt');
select tests.check_equal(
  (select score from public.test_attempt_summary(:'asha_attempt')), 3,
  'the score adds the marks of correct answers (2 + 0 + 1)');
select tests.check_equal(
  (select total_marks from public.test_attempt_summary(:'asha_attempt')), 4,
  'the result gives the total marks of the test');
select tests.check_equal(
  (select correct_count from public.test_attempt_summary(:'asha_attempt')), 2,
  'the result counts correct answers');
select tests.check_equal(
  (select score from public.my_tests() where id = '00000000-0000-0000-0000-0000000000e1'), 3,
  'the test list shows the score once the test is finished');
select tests.check_raises(
  format($$select public.save_test_answers(%L, '{"00000000-0000-0000-0000-0000000000d2": 0}')$$, :'asha_attempt'),
  'mcc:test_already_submitted', 'answers cannot be changed after submitting');
select tests.check(
  (select submitted_at is not null from public.submit_test(:'asha_attempt')),
  'submitting twice is harmless');

select tests.check_equal(
  (select review_available from public.test_attempt_summary(:'asha_attempt')), false,
  'the answers stay hidden while other students can still take the test');
select tests.check(
  (select rank is null from public.test_attempt_summary(:'asha_attempt')),
  'no rank is given until the test window has ended');

-- After the window ends --------------------------------------------------------------------------
select tests.act_as_superuser();
update public.tests set starts_at = now() - interval '3 hours', ends_at = now() - interval '1 minute'
where id = '00000000-0000-0000-0000-0000000000e1';
select tests.act_as(:'asha_id');

select tests.check_equal(
  (select review_available from public.test_attempt_summary(:'asha_attempt')), true,
  'the answers can be reviewed once the window has ended');
select tests.check_equal(
  (select count(*) from public.test_attempt_review(:'asha_attempt')), 3::bigint,
  'the review lists every question');
select tests.check_equal(
  (select correct_option from public.test_attempt_review(:'asha_attempt')
     where question_id = '00000000-0000-0000-0000-0000000000d1'), 1,
  'the review gives the correct answer');
select tests.check_equal(
  (select selected_option from public.test_attempt_review(:'asha_attempt')
     where question_id = '00000000-0000-0000-0000-0000000000d2'), 1,
  'the review gives what the student chose');
select tests.check_equal(
  (select rank from public.test_attempt_summary(:'asha_attempt')), 2,
  'the rank orders students by score');
select tests.check_equal(
  (select rank_out_of from public.test_attempt_summary(:'asha_attempt')), 2,
  'the rank says how many students took the test');

select tests.act_as_superuser();
update public.tests set show_review = false where id = '00000000-0000-0000-0000-0000000000e1';
select tests.act_as(:'asha_id');
select tests.check_equal(
  (select count(*) from public.test_attempt_review(:'asha_attempt')), 0::bigint,
  'a test with review switched off never shows students the answers');

-- Late attempts and the end of the window --------------------------------------------------------
select id as late_attempt from public.start_test('00000000-0000-0000-0000-0000000000e4') \gset
select tests.check_equal(
  (select is_late from public.test_attempts where id = :'late_attempt'), true,
  'a test taken after its window is marked late');
select tests.check_equal(
  (select deadline_at - started_at from public.test_attempts where id = :'late_attempt'),
  interval '30 minutes', 'a late attempt gets the full duration');

select id as soon_attempt from public.start_test('00000000-0000-0000-0000-0000000000e6') \gset
select tests.check_equal(
  (select deadline_at from public.test_attempts where id = :'soon_attempt'),
  (select ends_at from public.tests where id = '00000000-0000-0000-0000-0000000000e6'),
  'an attempt started near the end stops when the window ends');

-- Time runs out.
select tests.act_as_superuser();
update public.test_attempts
set started_at = now() - interval '1 hour', deadline_at = now() - interval '30 minutes'
where id = :'soon_attempt';
select tests.act_as(:'asha_id');

select tests.check_raises(
  format($$select public.save_test_answers(%L, '{"00000000-0000-0000-0000-0000000000d6": 0}')$$, :'soon_attempt'),
  'mcc:test_time_over', 'answers are refused after time is up');
select tests.check_equal(
  (select score from public.my_tests() where id = '00000000-0000-0000-0000-0000000000e6'), 0,
  'an attempt whose time ran out counts as finished');
select tests.check_equal(
  (select submitted_at from public.submit_test(:'soon_attempt', '{"00000000-0000-0000-0000-0000000000d6": 0}')),
  (select deadline_at from public.test_attempts where id = :'soon_attempt'),
  'a late Submit is recorded at the deadline');
select tests.check_equal(
  (select count(*) from public.test_answers where attempt_id = :'soon_attempt'), 0::bigint,
  'answers sent after time is up are not counted');

-- Staff ----------------------------------------------------------------------------------------
select tests.check_equal(
  (select count(*) from public.test_results('00000000-0000-0000-0000-0000000000e1')), 0::bigint,
  'a student cannot read the results of a test');
select tests.check_equal(
  tests.rows_affected(format($$delete from public.test_attempts where id = %L$$, :'late_attempt')),
  0, 'a student cannot delete an attempt');

select tests.act_as(:'owner_id');

select tests.check_equal((select count(*) from public.tests), 7::bigint,
  'staff see draft and published tests');
select tests.check_equal((select count(*) from public.test_answer_keys), 6::bigint,
  'staff can read the answer keys');
select tests.check_equal(
  (select count(*) from public.test_results('00000000-0000-0000-0000-0000000000e1')), 2::bigint,
  'staff see everyone who took a test');
select tests.check_equal(
  (select full_name from public.test_results('00000000-0000-0000-0000-0000000000e1') limit 1),
  'Ravi Kumar', 'results are listed best score first');
select tests.check_equal(
  (select count(*) from public.test_attempt_review(:'asha_attempt')), 3::bigint,
  'staff can review any attempt');

select tests.check(
  (select id is not null from public.start_test('00000000-0000-0000-0000-0000000000e5')),
  'staff can try a draft test');

select tests.check_equal(
  tests.rows_affected(format($$delete from public.test_attempts where id = %L$$, :'asha_attempt')),
  1, 'staff can delete an attempt so the student can take the test again');
select tests.check_equal(
  (select count(*) from public.test_answers where attempt_id = :'asha_attempt'), 0::bigint,
  'the answers of a deleted attempt go with it');

-- Deleting an account removes that student's attempts.
select tests.act_as_superuser();
delete from auth.users where id = :'ravi_id';
select tests.check_equal(
  (select count(*) from public.test_attempts where user_id = :'ravi_id'), 0::bigint,
  'deleting an account deletes its test attempts');

rollback;
