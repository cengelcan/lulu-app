-- Remote family activity digest delivery.
-- The Edge Function is expected to run every 15 minutes and only includes
-- aggregate counts; no medical metadata is placed in notification previews.

alter table public.notification_preferences
  add column if not exists language text not null default 'en'
    check (language in ('en', 'de', 'tr')),
  add column if not exists digest_last_sent_at timestamptz not null default now();

create or replace function public.reset_family_digest_cursor_on_enable()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.family_activity_digest_enabled
     and not old.family_activity_digest_enabled then
    new.digest_last_sent_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists reset_family_digest_cursor_on_enable
  on public.notification_preferences;
create trigger reset_family_digest_cursor_on_enable
  before update on public.notification_preferences
  for each row execute function public.reset_family_digest_cursor_on_enable();

create table if not exists public.device_push_tokens (
  expo_push_token text primary key
    check (expo_push_token ~ '^(ExponentPushToken|ExpoPushToken)\[[A-Za-z0-9_-]+\]$'),
  user_id uuid not null references auth.users (id) on delete cascade,
  platform text not null check (platform in ('ios', 'android')),
  updated_at timestamptz not null default now()
);

create index if not exists idx_device_push_tokens_user
  on public.device_push_tokens (user_id);

alter table public.device_push_tokens enable row level security;
revoke all on public.device_push_tokens from anon, authenticated;

create or replace function public.register_push_token(
  p_expo_push_token text,
  p_platform text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if p_expo_push_token !~ '^(ExponentPushToken|ExpoPushToken)\[[A-Za-z0-9_-]+\]$' then
    raise exception 'Invalid Expo push token';
  end if;

  if p_platform not in ('ios', 'android') then
    raise exception 'Unsupported push platform';
  end if;

  insert into public.device_push_tokens (
    expo_push_token,
    user_id,
    platform,
    updated_at
  )
  values (
    p_expo_push_token,
    auth.uid(),
    p_platform,
    now()
  )
  on conflict (expo_push_token) do update
  set user_id = excluded.user_id,
      platform = excluded.platform,
      updated_at = now();
end;
$$;

grant execute on function public.register_push_token(text, text) to authenticated;

create or replace function public.unregister_push_token(p_expo_push_token text)
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.device_push_tokens
  where expo_push_token = p_expo_push_token
    and user_id = auth.uid();
$$;

grant execute on function public.unregister_push_token(text) to authenticated;
