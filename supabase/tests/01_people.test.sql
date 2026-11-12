-- Profiles, staff and staff management.
begin;

select tests.create_user('owner@test.in', 'Centre Owner') as owner_id \gset
select tests.create_user('admin@test.in', 'Staff Member') as admin_id \gset
select tests.create_user('asha@test.in', 'Asha Kumari') as asha_id \gset
select tests.create_user('ravi@test.in') as ravi_id \gset

select tests.check_equal(
  (select full_name from public.profiles where id = :'asha_id'),
  'Asha Kumari',
  'a profile row is created for every new user, with the name from Google');

select private.bootstrap_owner('owner@test.in');

-- A student ----------------------------------------------------------------------------------
select tests.act_as(:'asha_id');

select tests.check_equal((select count(*) from public.profiles), 1::bigint,
  'a student sees only their own profile');

select tests.check_equal(
  tests.rows_affected(format(
    $$update public.profiles set phone = '9876543210', city = 'Makhdumpur' where id = %L$$, :'asha_id')),
  1, 'a student can complete their own profile');

select tests.check_raises(
  format($$update public.profiles set phone = '12345' where id = %L$$, :'asha_id'),
  'profiles_phone_check', 'a phone number that is not a 10-digit Indian mobile is rejected');

select tests.check_equal(
  tests.rows_affected(format($$update public.profiles set city = 'Patna' where id = %L$$, :'ravi_id')),
  0, 'a student cannot change someone else''s profile');

select tests.check_raises($$insert into public.staff (user_id, role) values (auth.uid(), 'owner')$$,
  'permission denied', 'a student cannot make themselves staff');

select tests.check_raises($$select public.add_staff_by_email('ravi@test.in', 'admin')$$,
  'mcc:owner_only', 'only the owner can add staff');

select tests.check_equal((select count(*) from public.staff), 0::bigint,
  'a student sees no staff rows');

-- The owner ------------------------------------------------------------------------------------
select tests.act_as(:'owner_id');

select tests.check_equal(
  (select role::text from public.add_staff_by_email('  ADMIN@test.in ', 'admin')),
  'admin', 'the owner adds an admin by email, ignoring case and spaces');

select tests.check_raises($$select public.add_staff_by_email('nobody@test.in', 'admin')$$,
  'mcc:user_not_found', 'adding someone who has never signed in explains why it failed');

select tests.check_raises(format($$select public.remove_staff(%L)$$, :'owner_id'),
  'mcc:last_owner', 'the last owner cannot remove themselves');

select tests.check_equal((select count(*) from public.profiles), 4::bigint,
  'staff can read every profile');

select tests.check_equal((select count(*) from public.student_directory), 2::bigint,
  'the student directory lists students, not staff');

select tests.check_equal((select count(*) from public.staff_directory), 2::bigint,
  'the staff directory lists the owner and the admin');

-- The admin ------------------------------------------------------------------------------------
select tests.act_as(:'admin_id');

select tests.check_raises(format($$select public.remove_staff(%L)$$, :'owner_id'),
  'mcc:owner_only', 'an admin cannot remove staff');

-- The student directory for a student is just themselves.
select tests.act_as(:'asha_id');
select tests.check_equal((select count(*) from public.student_directory), 1::bigint,
  'a student querying the directory sees only their own row');

-- Deleting the last owner's account is blocked, so the centre is never locked out.
select tests.act_as_superuser();
select tests.check_raises(format($$delete from auth.users where id = %L$$, :'owner_id'),
  'mcc:last_owner', 'the last owner''s account cannot be deleted');

select tests.check_equal(
  tests.rows_affected(format($$delete from auth.users where id = %L$$, :'ravi_id')),
  1, 'deleting a student account removes the user');
select tests.check_equal((select count(*) from public.profiles where id = :'ravi_id'), 0::bigint,
  'the deleted student''s profile goes with it');

rollback;
