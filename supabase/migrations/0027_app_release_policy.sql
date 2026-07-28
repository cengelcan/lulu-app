create table if not exists public.app_release_policy (
  platform text primary key check (platform in ('ios', 'android')),
  enabled boolean not null default true,
  latest_version text not null,
  minimum_supported_version text not null,
  store_url text not null,
  reminder_interval_hours integer not null default 24
    check (reminder_interval_hours between 1 and 720),
  updated_at timestamptz not null default now()
);

alter table public.app_release_policy enable row level security;

drop policy if exists "app_release_policy_public_read" on public.app_release_policy;
create policy "app_release_policy_public_read"
  on public.app_release_policy
  for select
  to anon, authenticated
  using (true);

revoke all on table public.app_release_policy from anon, authenticated;
grant select on table public.app_release_policy to anon, authenticated;

insert into public.app_release_policy (
  platform,
  enabled,
  latest_version,
  minimum_supported_version,
  store_url,
  reminder_interval_hours
)
values (
  'ios',
  true,
  '1.3.0',
  '1.0.0',
  'https://apps.apple.com/app/id6787669539',
  24
)
on conflict (platform) do nothing;
