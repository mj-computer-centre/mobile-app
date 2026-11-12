-- Foundation: schemas, enums and helpers shared by every later migration.
--
-- `private` holds security-definer helpers used by row-level security policies. It is not in
-- the API's exposed schemas, so clients cannot call these functions over PostgREST.

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated, service_role;

create type public.staff_role as enum ('owner', 'admin');
create type public.lesson_kind as enum ('video', 'pdf');

-- Keeps updated_at honest without trusting clients to send it.
create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Raises an error the app maps to a stable code. Messages are always `mcc:<code>`;
-- packages/shared/src/errors.ts lists every code.
create or replace function private.fail(p_code text)
returns void
language plpgsql
set search_path = ''
as $$
begin
  raise exception using errcode = 'P0001', message = 'mcc:' || p_code;
end;
$$;

revoke all on function private.set_updated_at() from public;
revoke all on function private.fail(text) from public;
grant execute on function private.fail(text) to authenticated, service_role;
