-- Per-user notification preferences. Family activity digests are privacy-first:
-- disabled until each user explicitly opts in.

create table if not exists public.notification_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  family_activity_digest_enabled boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.notification_preferences enable row level security;

drop policy if exists "notification_preferences_select_own"
  on public.notification_preferences;
create policy "notification_preferences_select_own"
  on public.notification_preferences
  for select
  using (auth.uid() = user_id);

drop policy if exists "notification_preferences_insert_own"
  on public.notification_preferences;
create policy "notification_preferences_insert_own"
  on public.notification_preferences
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "notification_preferences_update_own"
  on public.notification_preferences;
create policy "notification_preferences_update_own"
  on public.notification_preferences
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop trigger if exists set_notification_preferences_updated_at
  on public.notification_preferences;
create trigger set_notification_preferences_updated_at
  before update on public.notification_preferences
  for each row execute function public.set_updated_at();
