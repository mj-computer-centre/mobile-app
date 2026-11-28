-- Accounts that have no profile row.
--
-- A profile is created by the trigger on auth.users when someone first signs in. An account that
-- existed before the trigger did has none: on production the first owner signed in before the
-- schema was pushed. The app's Profile page cannot load for such an account, and the staff and
-- student lists show it without a name. This creates the missing rows exactly as the trigger
-- would have. It is safe to run again, from the SQL editor, whenever accounts were created some
-- other way (restored from a backup, added in the dashboard before the first push):
--   select private.backfill_profiles();

create or replace function private.backfill_profiles()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_created integer;
begin
  insert into public.profiles (id, email, full_name)
  select
    u.id,
    u.email,
    left(coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name'), 120)
  from auth.users u
  where not exists (select 1 from public.profiles p where p.id = u.id)
  on conflict (id) do nothing;
  get diagnostics v_created = row_count;
  return v_created;
end;
$$;

revoke all on function private.backfill_profiles() from public;

select private.backfill_profiles();
