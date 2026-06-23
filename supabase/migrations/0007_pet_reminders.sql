-- pet_reminders -------------------------------------------------------------
create table if not exists public.pet_reminders (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  pet_id text not null references public.pets (id) on delete cascade,
  type text not null,
  due_date text not null,
  due_time jsonb,
  notes text,
  status text not null default 'pending',
  completed_at timestamptz,
  record_id text references public.pet_records (id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_pet_reminders_user_pet on public.pet_reminders (user_id, pet_id, due_date);
create index if not exists idx_pet_reminders_user_status on public.pet_reminders (user_id, status);

alter table public.pet_reminders enable row level security;

drop policy if exists "pet_reminders_select_own" on public.pet_reminders;
create policy "pet_reminders_select_own" on public.pet_reminders
  for select using (auth.uid() = user_id);

drop policy if exists "pet_reminders_insert_own" on public.pet_reminders;
create policy "pet_reminders_insert_own" on public.pet_reminders
  for insert with check (auth.uid() = user_id);

drop policy if exists "pet_reminders_update_own" on public.pet_reminders;
create policy "pet_reminders_update_own" on public.pet_reminders
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "pet_reminders_delete_own" on public.pet_reminders;
create policy "pet_reminders_delete_own" on public.pet_reminders
  for delete using (auth.uid() = user_id);

drop trigger if exists set_pet_reminders_updated_at on public.pet_reminders;
create trigger set_pet_reminders_updated_at
  before update on public.pet_reminders
  for each row execute function public.set_updated_at();
