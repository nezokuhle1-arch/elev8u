-- Waitlist (V2 teaser page) schema
-- Run this in the Supabase SQL Editor. Reviewed with the user before applying.

-- 1. APP SETTINGS (singleton row, read directly by the page — not sensitive)
create table public.app_settings (
  id int primary key default 1 check (id = 1),
  waitlist_open boolean not null default true
);

alter table public.app_settings enable row level security;

create policy "App settings are viewable by everyone"
  on public.app_settings for select using (true);

insert into public.app_settings (id, waitlist_open) values (1, true);

-- 2. WAITLIST COUNTER (single locked row — gives gap-free positions)
create table public.waitlist_counter (
  id int primary key default 1 check (id = 1),
  next_position int not null default 1
);

alter table public.waitlist_counter enable row level security;
-- No policies at all: not reachable by anon/authenticated, only by
-- security-definer functions below.

insert into public.waitlist_counter (id, next_position) values (1, 1);

-- 3. WAITLIST SIGNUPS
create table public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  position int not null,
  consent_at timestamptz not null default now(),
  consent_source text not null default 'waitlist_page',
  last_resend_at timestamptz,
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Case-insensitive uniqueness, independent of how the value got written.
create unique index waitlist_signups_email_lower_idx
  on public.waitlist_signups (lower(email));

alter table public.waitlist_signups enable row level security;
-- No SELECT/INSERT/UPDATE policy for any client role: nobody can read
-- other people's emails from the client, and the only write path is the
-- security-definer function below.

-- 4. FUNCTIONS

-- Public, non-sensitive aggregate — safe for anon.
create or replace function public.get_waitlist_count()
returns int
language sql
stable
security definer
set search_path = ''
as $$
  select count(*)::int from public.waitlist_signups;
$$;

-- Server-only (service_role). Atomic, gap-free position assignment.
create or replace function public.join_waitlist(p_email text, p_consent_source text)
returns table("position" int, already_existed boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text := lower(trim(p_email));
  v_position int;
begin
  select ws.position into v_position
  from public.waitlist_signups ws
  where lower(ws.email) = v_email;

  if found then
    return query select v_position, true;
    return;
  end if;

  if not (select app.waitlist_open from public.app_settings app where app.id = 1) then
    raise exception 'waitlist_closed';
  end if;

  update public.waitlist_counter
  set next_position = next_position + 1
  where id = 1
  returning next_position - 1 into v_position;

  insert into public.waitlist_signups (email, position, consent_source)
  values (v_email, v_position, coalesce(p_consent_source, 'waitlist_page'));

  return query select v_position, false;
end;
$$;

-- Server-only (service_role). 10-minute resend rate limit.
create or replace function public.touch_resend(p_email text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text := lower(trim(p_email));
  v_last timestamptz;
begin
  select ws.last_resend_at into v_last
  from public.waitlist_signups ws
  where lower(ws.email) = v_email;

  if not found then
    return false;
  end if;

  if v_last is not null and v_last > now() - interval '10 minutes' then
    return false;
  end if;

  update public.waitlist_signups
  set last_resend_at = now()
  where lower(email) = v_email;

  return true;
end;
$$;

-- 5. GRANTS
revoke execute on function public.join_waitlist(text, text) from public, anon, authenticated;
revoke execute on function public.touch_resend(text) from public, anon, authenticated;
grant execute on function public.join_waitlist(text, text) to service_role;
grant execute on function public.touch_resend(text) to service_role;

grant execute on function public.get_waitlist_count() to anon, authenticated;

revoke all on public.waitlist_signups from anon, authenticated;
revoke all on public.waitlist_counter from anon, authenticated;
