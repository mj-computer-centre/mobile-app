-- AI pictures for course covers: the day's count.
--
-- Staff can have a course's cover picture drawn by an AI image model (FLUX.1 [schnell] on
-- Cloudflare Workers AI) through the `course-image` edge function. A Cloudflare account gets a
-- free allowance each day, and the same account may serve other projects, so every picture is
-- counted here and the function stops at a daily limit that stays well inside the allowance.

create table public.ai_image_usage (
  -- A day in UTC: Cloudflare's allowance resets at midnight UTC.
  day date primary key,
  pictures integer not null default 0 check (pictures >= 0)
);

comment on table public.ai_image_usage is 'AI pictures drawn per UTC day. Written only by use_ai_image_allowance.';

alter table public.ai_image_usage enable row level security;
revoke all on public.ai_image_usage from anon, authenticated;
grant all on public.ai_image_usage to service_role;
-- No policies: nobody reads or writes the table directly; the function below is the only way in.

-- Counts one more picture for today and returns how many have been drawn today, this one
-- included. Refuses once the day's limit is reached. Staff only. A picture costs about 173 of the
-- account's 10,000 free "neurons" a day (measured: a new account ran out after 58 pictures), so
-- 40 pictures (ten sets of four) are about 6,900 and always fit in the free allowance.
create or replace function public.use_ai_image_allowance()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_daily_limit constant integer := 40;
  v_used integer;
begin
  perform private.require_staff();

  insert into public.ai_image_usage as usage (day, pictures)
  values ((now() at time zone 'utc')::date, 1)
  on conflict (day) do update
    set pictures = usage.pictures + 1
    where usage.pictures < v_daily_limit
  returning pictures into v_used;

  if v_used is null then
    perform private.fail('ai_images_used_up');
  end if;
  return v_used;
end;
$$;

revoke all on function public.use_ai_image_allowance() from public, anon;
grant execute on function public.use_ai_image_allowance() to authenticated;
