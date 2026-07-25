alter table public.vet_visits add column if not exists general_notes text;

create table if not exists public.vet_visit_outcomes (
  visit_id text primary key references public.vet_visits (id) on delete cascade,
  user_entered_summary text not null,
  treatment_notes text,
  next_visit_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.vet_visit_outcomes enable row level security;

create policy "vet_visit_outcomes_select_access" on public.vet_visit_outcomes for select using (
  exists (select 1 from public.vet_visits visit where visit.id = visit_id and public.has_pet_access(visit.pet_id))
);
create policy "vet_visit_outcomes_insert_access" on public.vet_visit_outcomes for insert with check (
  exists (select 1 from public.vet_visits visit where visit.id = visit_id and public.has_pet_access(visit.pet_id))
);
create policy "vet_visit_outcomes_update_access" on public.vet_visit_outcomes for update using (
  exists (select 1 from public.vet_visits visit where visit.id = visit_id and public.has_pet_access(visit.pet_id))
) with check (
  exists (select 1 from public.vet_visits visit where visit.id = visit_id and public.has_pet_access(visit.pet_id))
);
create policy "vet_visit_outcomes_delete_access" on public.vet_visit_outcomes for delete using (
  exists (select 1 from public.vet_visits visit where visit.id = visit_id and public.has_pet_access(visit.pet_id))
);

create trigger set_vet_visit_outcomes_updated_at before update on public.vet_visit_outcomes
  for each row execute function public.set_updated_at();

alter publication supabase_realtime add table public.vet_visit_outcomes;
