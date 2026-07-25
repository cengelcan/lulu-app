create table if not exists public.vet_visits (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  pet_id text not null references public.pets (id) on delete cascade,
  scheduled_at timestamptz not null,
  provider_id text,
  provider_name text,
  reason text not null,
  status text not null default 'planned' check (status in ('planned', 'in_progress', 'completed', 'cancelled')),
  health_report_start_date text,
  health_report_end_date text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vet_visit_questions (
  id text primary key,
  visit_id text not null references public.vet_visits (id) on delete cascade,
  text text not null,
  answer text,
  is_answered boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_vet_visits_pet_scheduled on public.vet_visits (pet_id, scheduled_at);
create index if not exists idx_vet_visits_pet_status on public.vet_visits (pet_id, status);
create index if not exists idx_vet_visit_questions_visit_order on public.vet_visit_questions (visit_id, sort_order);

alter table public.vet_visits enable row level security;
alter table public.vet_visit_questions enable row level security;

create policy "vet_visits_select_access" on public.vet_visits for select using (public.has_pet_access(pet_id));
create policy "vet_visits_insert_access" on public.vet_visits for insert
  with check (auth.uid() = user_id and public.has_pet_access(pet_id));
create policy "vet_visits_update_access" on public.vet_visits for update
  using (public.has_pet_access(pet_id)) with check (public.has_pet_access(pet_id));
create policy "vet_visits_delete_access" on public.vet_visits for delete using (public.has_pet_access(pet_id));

create policy "vet_visit_questions_select_access" on public.vet_visit_questions for select using (
  exists (select 1 from public.vet_visits visit where visit.id = visit_id and public.has_pet_access(visit.pet_id))
);
create policy "vet_visit_questions_insert_access" on public.vet_visit_questions for insert with check (
  exists (select 1 from public.vet_visits visit where visit.id = visit_id and public.has_pet_access(visit.pet_id))
);
create policy "vet_visit_questions_update_access" on public.vet_visit_questions for update using (
  exists (select 1 from public.vet_visits visit where visit.id = visit_id and public.has_pet_access(visit.pet_id))
) with check (
  exists (select 1 from public.vet_visits visit where visit.id = visit_id and public.has_pet_access(visit.pet_id))
);
create policy "vet_visit_questions_delete_access" on public.vet_visit_questions for delete using (
  exists (select 1 from public.vet_visits visit where visit.id = visit_id and public.has_pet_access(visit.pet_id))
);

create trigger set_vet_visits_updated_at before update on public.vet_visits
  for each row execute function public.set_updated_at();
create trigger set_vet_visit_questions_updated_at before update on public.vet_visit_questions
  for each row execute function public.set_updated_at();

alter publication supabase_realtime add table public.vet_visits;
alter publication supabase_realtime add table public.vet_visit_questions;
