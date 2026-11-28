-- Accounts without a profile row (created before the trigger existed) get one.
begin;

select tests.create_user('early@test.in') as early_id \gset
select tests.create_user('asha@test.in') as asha_id \gset

-- An account from before the trigger: no profile row.
delete from public.profiles where id = :'early_id';
update public.profiles set city = 'Makhdumpur' where id = :'asha_id';

select tests.check_equal(private.backfill_profiles(), 1,
  'the account without a profile gets one');
select tests.check_equal(
  (select email from public.profiles where id = :'early_id'), 'early@test.in',
  'with the email of the account');
select tests.check_equal(
  (select city from public.profiles where id = :'asha_id'), 'Makhdumpur',
  'a profile that was already there is left as it was');
select tests.check_equal(private.backfill_profiles(), 0,
  'running it again creates nothing');

select tests.act_as(:'early_id');
select tests.check_equal(
  (select count(*) from public.profiles where id = :'early_id'), 1::bigint,
  'the account can now read its own profile');
select tests.check_raises($$select private.backfill_profiles()$$,
  'permission denied', 'a signed-in user cannot run it');

rollback;
