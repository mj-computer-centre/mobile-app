-- AI pictures: only staff may draw them, and only up to the day's limit.
begin;

select tests.create_user('owner@test.in') as owner_id \gset
select tests.create_user('asha@test.in') as asha_id \gset
select private.bootstrap_owner('owner@test.in');

select tests.act_as(:'asha_id');
select tests.check_raises($$select public.use_ai_image_allowance()$$,
  'mcc:staff_only', 'a student cannot draw AI pictures');
select tests.check_raises($$select count(*) from public.ai_image_usage$$,
  'permission denied', 'nobody reads the day''s count from the table');

select tests.act_as_anon();
select tests.check_raises($$select public.use_ai_image_allowance()$$,
  'permission denied', 'a visitor cannot draw AI pictures');

select tests.act_as(:'owner_id');
select tests.check_equal(public.use_ai_image_allowance(), 1, 'the first picture of the day is number 1');
select tests.check_equal(public.use_ai_image_allowance(), 2, 'each picture adds one');
select tests.check_raises($$update public.ai_image_usage set pictures = 0$$,
  'permission denied', 'staff cannot reset the count');

-- The last picture inside the limit, then one too many.
select tests.act_as_superuser();
update public.ai_image_usage set pictures = 39;
select tests.act_as(:'owner_id');
select tests.check_equal(public.use_ai_image_allowance(), 40, 'the fortieth picture of the day is allowed');
select tests.check_raises($$select public.use_ai_image_allowance()$$,
  'mcc:ai_images_used_up', 'the forty-first is refused');
select tests.act_as_superuser();
select tests.check_equal((select pictures from public.ai_image_usage), 40,
  'a refused picture is not counted');

-- A new day starts from one again.
update public.ai_image_usage set day = day - 1;
select tests.act_as(:'owner_id');
select tests.check_equal(public.use_ai_image_allowance(), 1, 'the count starts again the next day');

rollback;
