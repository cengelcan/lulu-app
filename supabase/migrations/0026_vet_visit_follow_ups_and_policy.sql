alter table public.vet_visit_outcomes
  add column if not exists follow_up_reminder_id text references public.pet_reminders (id) on delete set null,
  add column if not exists medication_plan_id text references public.medication_plans (id) on delete set null;

drop policy if exists "vet_visits_update_access" on public.vet_visits;
create policy "vet_visits_update_access" on public.vet_visits for update using (
  public.has_pet_access(pet_id)
  and (auth.uid() = user_id or public.is_pet_owner(pet_id))
) with check (
  public.has_pet_access(pet_id)
  and (auth.uid() = user_id or public.is_pet_owner(pet_id))
);

drop policy if exists "vet_visits_delete_access" on public.vet_visits;
create policy "vet_visits_delete_access" on public.vet_visits for delete using (
  public.has_pet_access(pet_id)
  and (auth.uid() = user_id or public.is_pet_owner(pet_id))
);

drop policy if exists "vet_visit_questions_insert_access" on public.vet_visit_questions;
create policy "vet_visit_questions_insert_access" on public.vet_visit_questions for insert with check (
  exists (
    select 1 from public.vet_visits visit
    where visit.id = visit_id
      and public.has_pet_access(visit.pet_id)
      and (auth.uid() = visit.user_id or public.is_pet_owner(visit.pet_id))
  )
);

drop policy if exists "vet_visit_questions_update_access" on public.vet_visit_questions;
create policy "vet_visit_questions_update_access" on public.vet_visit_questions for update using (
  exists (
    select 1 from public.vet_visits visit
    where visit.id = visit_id
      and public.has_pet_access(visit.pet_id)
      and (auth.uid() = visit.user_id or public.is_pet_owner(visit.pet_id))
  )
) with check (
  exists (
    select 1 from public.vet_visits visit
    where visit.id = visit_id
      and public.has_pet_access(visit.pet_id)
      and (auth.uid() = visit.user_id or public.is_pet_owner(visit.pet_id))
  )
);

drop policy if exists "vet_visit_questions_delete_access" on public.vet_visit_questions;
create policy "vet_visit_questions_delete_access" on public.vet_visit_questions for delete using (
  exists (
    select 1 from public.vet_visits visit
    where visit.id = visit_id
      and public.has_pet_access(visit.pet_id)
      and (auth.uid() = visit.user_id or public.is_pet_owner(visit.pet_id))
  )
);

drop policy if exists "vet_visit_outcomes_insert_access" on public.vet_visit_outcomes;
create policy "vet_visit_outcomes_insert_access" on public.vet_visit_outcomes for insert with check (
  exists (
    select 1 from public.vet_visits visit
    where visit.id = visit_id
      and public.has_pet_access(visit.pet_id)
      and (auth.uid() = visit.user_id or public.is_pet_owner(visit.pet_id))
  )
);

drop policy if exists "vet_visit_outcomes_update_access" on public.vet_visit_outcomes;
create policy "vet_visit_outcomes_update_access" on public.vet_visit_outcomes for update using (
  exists (
    select 1 from public.vet_visits visit
    where visit.id = visit_id
      and public.has_pet_access(visit.pet_id)
      and (auth.uid() = visit.user_id or public.is_pet_owner(visit.pet_id))
  )
) with check (
  exists (
    select 1 from public.vet_visits visit
    where visit.id = visit_id
      and public.has_pet_access(visit.pet_id)
      and (auth.uid() = visit.user_id or public.is_pet_owner(visit.pet_id))
  )
);

drop policy if exists "vet_visit_outcomes_delete_access" on public.vet_visit_outcomes;
create policy "vet_visit_outcomes_delete_access" on public.vet_visit_outcomes for delete using (
  exists (
    select 1 from public.vet_visits visit
    where visit.id = visit_id
      and public.has_pet_access(visit.pet_id)
      and (auth.uid() = visit.user_id or public.is_pet_owner(visit.pet_id))
  )
);

create table if not exists public.vet_visit_analytics_events (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  event_name text not null check (event_name in (
    'workspace_opened', 'visit_created', 'visit_started', 'visit_completed',
    'follow_up_created', 'paywall_opened'
  )),
  source text,
  follow_up_type text check (follow_up_type is null or follow_up_type in ('reminder', 'medication')),
  occurred_at timestamptz not null default now()
);

alter table public.vet_visit_analytics_events enable row level security;
create policy "vet_visit_analytics_insert_own" on public.vet_visit_analytics_events for insert
  with check (auth.uid() = user_id);

-- Analytics is write-only for app clients. Service-role reporting may aggregate it.
