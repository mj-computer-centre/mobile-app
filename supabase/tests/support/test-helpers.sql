-- Helpers for the SQL tests in supabase/tests/*.test.sql. Applied after the migrations.
-- Each test file runs in its own transaction and rolls back, so tests never see each other's data.

create schema tests;
grant usage on schema tests to anon, authenticated, service_role;

-- Creates an auth user (the profile row follows from the trigger) and returns its id.
create function tests.create_user(p_email text, p_name text default null)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  insert into auth.users (email, raw_user_meta_data)
  values (p_email, case when p_name is null then '{}'::jsonb else jsonb_build_object('full_name', p_name) end)
  returning id into v_id;
  return v_id;
end;
$$;

-- Becomes a signed-in user for the rest of the transaction, as PostgREST would.
create function tests.act_as(p_user_id uuid)
returns void
language plpgsql
as $$
begin
  perform set_config('request.jwt.claims',
    json_build_object('sub', p_user_id, 'role', 'authenticated')::text, true);
  perform set_config('role', 'authenticated', true);
end;
$$;

create function tests.act_as_anon()
returns void
language plpgsql
as $$
begin
  perform set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true);
  perform set_config('role', 'anon', true);
end;
$$;

-- Back to the superuser that owns the test database (for fixture setup between checks).
create function tests.act_as_superuser()
returns void
language plpgsql
as $$
begin
  perform set_config('role', 'none', true);
  perform set_config('request.jwt.claims', '', true);
end;
$$;

create function tests.check(p_condition boolean, p_message text)
returns void
language plpgsql
as $$
begin
  if p_condition is distinct from true then
    raise exception 'FAIL: %', p_message;
  end if;
  raise notice 'ok - %', p_message;
end;
$$;

create function tests.check_equal(p_actual anyelement, p_expected anyelement, p_message text)
returns void
language plpgsql
as $$
begin
  if p_actual is distinct from p_expected then
    raise exception 'FAIL: % (expected %, got %)', p_message, p_expected, p_actual;
  end if;
  raise notice 'ok - %', p_message;
end;
$$;

-- Runs p_sql and passes only if it fails with a message containing p_expected_fragment.
create function tests.check_raises(p_sql text, p_expected_fragment text, p_message text)
returns void
language plpgsql
as $$
begin
  begin
    execute p_sql;
  exception when others then
    if position(p_expected_fragment in sqlerrm) > 0 then
      raise notice 'ok - %', p_message;
      return;
    end if;
    raise exception 'FAIL: % (expected error containing "%", got "%")',
      p_message, p_expected_fragment, sqlerrm;
  end;
  raise exception 'FAIL: % (expected an error, statement succeeded)', p_message;
end;
$$;

-- Number of rows an UPDATE or DELETE touched (0 when row-level security hides the row).
create function tests.rows_affected(p_sql text)
returns integer
language plpgsql
as $$
declare
  v_count integer;
begin
  execute p_sql;
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

grant execute on all functions in schema tests to anon, authenticated, service_role;
