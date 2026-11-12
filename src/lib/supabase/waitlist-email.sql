-- Waitlist email + unsubscribe support.
-- PROPOSED — needs review before it is run. Run by hand in the Supabase SQL
-- editor AFTER waitlist.sql. Nothing in the app calls these until it is run.

-- 1. Lookup by email: id (unsubscribe token subject), position, join date and
--    unsubscribe state. Server-only (service_role).
create or replace function public.get_waitlist_signup(p_email text)
returns table (
  id uuid,
  "position" int,
  created_at timestamptz,
  unsubscribed_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select ws.id, ws."position", ws.created_at, ws.unsubscribed_at
  from public.waitlist_signups ws
  where lower(ws.email) = lower(trim(p_email))
  limit 1
$$;

-- 2. Unsubscribe by id. Idempotent: keeps the first unsubscribed_at.
--    Returns false when no such row exists. Server-only (service_role).
create or replace function public.unsubscribe_waitlist(p_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.waitlist_signups
  set unsubscribed_at = coalesce(unsubscribed_at, now())
  where id = p_id;

  return found;
end;
$$;

-- 3. touch_resend: same as in waitlist.sql, plus it now refuses unsubscribed
--    addresses (returns false without touching last_resend_at).
create or replace function public.touch_resend(p_email text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text := lower(trim(p_email));
  v_last timestamptz;
  v_unsub timestamptz;
begin
  select ws.last_resend_at, ws.unsubscribed_at into v_last, v_unsub
  from public.waitlist_signups ws
  where lower(ws.email) = v_email;

  if not found then
    return false;
  end if;

  if v_unsub is not null then
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

-- GRANTS (service_role only)
revoke execute on function public.get_waitlist_signup(text) from public, anon, authenticated;
revoke execute on function public.unsubscribe_waitlist(uuid) from public, anon, authenticated;
grant execute on function public.get_waitlist_signup(text) to service_role;
grant execute on function public.unsubscribe_waitlist(uuid) to service_role;
-- touch_resend keeps its existing grants (create or replace preserves them).
