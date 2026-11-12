-- People: student profiles and the staff who manage content.
--
-- Roles live in `staff`, not on `profiles`, because students may update their own profile row;
-- a role column there would let anyone promote themselves.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text check (char_length(full_name) <= 120),
  email text check (char_length(email) <= 320),
  -- Indian mobile number, 10 digits, stored without +91.
  phone text check (phone ~ '^[6-9][0-9]{9}$'),
  city text check (char_length(city) <= 80),
  interested_course_id uuid, -- foreign key added with the catalog
  profile_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'One row per signed-in user; created by a trigger on auth.users.';

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function private.set_updated_at();

create table public.staff (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role public.staff_role not null,
  added_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

comment on table public.staff is 'Users who can manage content. Only the owner can add or remove staff.';

-- ---------------------------------------------------------------------------------------------
-- Helpers used by policies. Security definer so a policy on `staff` can read `staff`.
-- ---------------------------------------------------------------------------------------------

create or replace function private.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.staff where user_id = auth.uid());
$$;

create or replace function private.is_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.staff where user_id = auth.uid() and role = 'owner');
$$;

create or replace function private.require_staff()
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.is_staff() then
    perform private.fail('staff_only');
  end if;
end;
$$;

create or replace function private.require_owner()
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.is_owner() then
    perform private.fail('owner_only');
  end if;
end;
$$;

revoke all on function private.is_staff() from public;
revoke all on function private.is_owner() from public;
revoke all on function private.require_staff() from public;
revoke all on function private.require_owner() from public;
grant execute on function private.is_staff() to anon, authenticated, service_role;
grant execute on function private.is_owner() to authenticated, service_role;
grant execute on function private.require_staff() to authenticated, service_role;
grant execute on function private.require_owner() to authenticated, service_role;

-- ---------------------------------------------------------------------------------------------
-- New users get a profile row automatically.
-- ---------------------------------------------------------------------------------------------

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    left(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'), 120)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function private.handle_new_user() from public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- ---------------------------------------------------------------------------------------------
-- The centre must always keep at least one owner.
-- ---------------------------------------------------------------------------------------------

create or replace function private.ensure_owner_remains()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.role = 'owner'
     and (tg_op = 'DELETE' or new.role <> 'owner')
     and not exists (
       select 1 from public.staff where role = 'owner' and user_id <> old.user_id
     ) then
    perform private.fail('last_owner');
  end if;
  return coalesce(new, old);
end;
$$;

revoke all on function private.ensure_owner_remains() from public;

create trigger staff_ensure_owner_remains
  before update or delete on public.staff
  for each row execute function private.ensure_owner_remains();

-- ---------------------------------------------------------------------------------------------
-- Row-level security.
-- ---------------------------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.staff enable row level security;

revoke all on public.profiles from anon, authenticated;
revoke all on public.staff from anon, authenticated;
grant select, update on public.profiles to authenticated;
grant select on public.staff to authenticated;
grant all on public.profiles, public.staff to service_role;

create policy "profiles: read own, staff read all"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select private.is_staff()));

create policy "profiles: update own"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "staff: read own row, staff read all"
  on public.staff for select to authenticated
  using (user_id = (select auth.uid()) or (select private.is_staff()));

-- Staff changes go through the functions below, never direct writes.

-- ---------------------------------------------------------------------------------------------
-- Staff management (owner only).
-- ---------------------------------------------------------------------------------------------

create or replace function public.add_staff_by_email(p_email text, p_role public.staff_role)
returns public.staff
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_row public.staff;
begin
  perform private.require_owner();

  select id into v_user_id
  from auth.users
  where lower(email) = lower(trim(p_email))
  limit 1;

  if v_user_id is null then
    -- The person must sign in to the app once before they can be added.
    perform private.fail('user_not_found');
  end if;

  insert into public.staff (user_id, role, added_by)
  values (v_user_id, p_role, auth.uid())
  on conflict (user_id) do update set role = excluded.role
  returning * into v_row;

  return v_row;
end;
$$;

create or replace function public.remove_staff(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.require_owner();
  delete from public.staff where user_id = p_user_id;
end;
$$;

-- Run once from the Supabase SQL editor to make the centre's account the first owner:
--   select private.bootstrap_owner('centre@gmail.com');
create or replace function private.bootstrap_owner(p_email text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
begin
  select id into v_user_id from auth.users where lower(email) = lower(trim(p_email)) limit 1;
  if v_user_id is null then
    perform private.fail('user_not_found');
  end if;
  insert into public.staff (user_id, role) values (v_user_id, 'owner')
  on conflict (user_id) do update set role = 'owner';
end;
$$;

revoke all on function public.add_staff_by_email(text, public.staff_role) from public, anon;
revoke all on function public.remove_staff(uuid) from public, anon;
revoke all on function private.bootstrap_owner(text) from public, anon, authenticated;
grant execute on function public.add_staff_by_email(text, public.staff_role) to authenticated;
grant execute on function public.remove_staff(uuid) to authenticated;
