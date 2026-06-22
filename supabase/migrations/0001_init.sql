-- Lulu cloud sync schema (v1)
-- Run this once in the Supabase Dashboard -> SQL Editor.
-- Tables mirror the local SQLite schema and are scoped per user via RLS.

-- updated_at trigger helper -------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- pets ----------------------------------------------------------------------
create table if not exists public.pets (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  species text not null,
  breed text,
  age_group text not null,
  health_conditions jsonb not null default '[]'::jsonb,
  photo_uri text,
  color text,
  sex text,
  spay_neuter_status text,
  birth_date text,
  adoption_date text,
  microchip_id text,
  owner_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_pets_user on public.pets (user_id, created_at);

alter table public.pets enable row level security;

drop policy if exists "pets_select_own" on public.pets;
create policy "pets_select_own" on public.pets
  for select using (auth.uid() = user_id);

drop policy if exists "pets_insert_own" on public.pets;
create policy "pets_insert_own" on public.pets
  for insert with check (auth.uid() = user_id);

drop policy if exists "pets_update_own" on public.pets;
create policy "pets_update_own" on public.pets
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "pets_delete_own" on public.pets;
create policy "pets_delete_own" on public.pets
  for delete using (auth.uid() = user_id);

drop trigger if exists set_pets_updated_at on public.pets;
create trigger set_pets_updated_at
  before update on public.pets
  for each row execute function public.set_updated_at();

-- check_ins -----------------------------------------------------------------
create table if not exists public.check_ins (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  pet_id text not null references public.pets (id) on delete cascade,
  date text not null,
  appetite text not null,
  water_intake text,
  energy text not null,
  mood text,
  pee text,
  poop text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (pet_id, date)
);

create index if not exists idx_check_ins_user_pet on public.check_ins (user_id, pet_id, date);

alter table public.check_ins enable row level security;

drop policy if exists "check_ins_select_own" on public.check_ins;
create policy "check_ins_select_own" on public.check_ins
  for select using (auth.uid() = user_id);

drop policy if exists "check_ins_insert_own" on public.check_ins;
create policy "check_ins_insert_own" on public.check_ins
  for insert with check (auth.uid() = user_id);

drop policy if exists "check_ins_update_own" on public.check_ins;
create policy "check_ins_update_own" on public.check_ins
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "check_ins_delete_own" on public.check_ins;
create policy "check_ins_delete_own" on public.check_ins
  for delete using (auth.uid() = user_id);

drop trigger if exists set_check_ins_updated_at on public.check_ins;
create trigger set_check_ins_updated_at
  before update on public.check_ins
  for each row execute function public.set_updated_at();

-- pet_records ---------------------------------------------------------------
create table if not exists public.pet_records (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  pet_id text not null references public.pets (id) on delete cascade,
  type text not null,
  date text not null,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_pet_records_user_pet on public.pet_records (user_id, pet_id, date);

alter table public.pet_records enable row level security;

drop policy if exists "pet_records_select_own" on public.pet_records;
create policy "pet_records_select_own" on public.pet_records
  for select using (auth.uid() = user_id);

drop policy if exists "pet_records_insert_own" on public.pet_records;
create policy "pet_records_insert_own" on public.pet_records
  for insert with check (auth.uid() = user_id);

drop policy if exists "pet_records_update_own" on public.pet_records;
create policy "pet_records_update_own" on public.pet_records
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "pet_records_delete_own" on public.pet_records;
create policy "pet_records_delete_own" on public.pet_records
  for delete using (auth.uid() = user_id);

drop trigger if exists set_pet_records_updated_at on public.pet_records;
create trigger set_pet_records_updated_at
  before update on public.pet_records
  for each row execute function public.set_updated_at();
