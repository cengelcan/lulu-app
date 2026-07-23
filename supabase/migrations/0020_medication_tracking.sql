-- First-class medication plans, schedules, and immutable dose occurrences.

create table if not exists public.medication_plans (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  pet_id text not null references public.pets (id) on delete cascade,
  name text not null,
  form text,
  dosage text not null,
  unit text not null,
  instructions text,
  starts_on text not null,
  ends_on text,
  timezone text not null,
  is_prn boolean not null default false,
  status text not null default 'active' check (status in ('active', 'completed', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.medication_schedules (
  id text primary key,
  plan_id text not null references public.medication_plans (id) on delete cascade,
  frequency text not null check (frequency in ('daily', 'weekly', 'custom')),
  interval_value integer not null default 1 check (interval_value > 0),
  weekdays jsonb not null default '[]'::jsonb,
  times jsonb not null default '[]'::jsonb,
  effective_from text not null,
  effective_to text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.medication_doses (
  id text primary key,
  plan_id text not null references public.medication_plans (id) on delete cascade,
  schedule_id text references public.medication_schedules (id) on delete set null,
  pet_id text not null references public.pets (id) on delete cascade,
  scheduled_at timestamptz not null,
  local_date text not null,
  local_time jsonb not null,
  timezone text not null,
  status text not null default 'scheduled'
    check (status in ('scheduled', 'taken', 'skipped', 'missed', 'snoozed')),
  completed_at timestamptz,
  actor_user_id uuid references auth.users (id) on delete set null,
  note text,
  snoozed_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (plan_id, scheduled_at)
);

create table if not exists public.medication_inventory (
  plan_id text primary key references public.medication_plans (id) on delete cascade,
  pet_id text not null references public.pets (id) on delete cascade,
  remaining_doses integer not null default 0 check (remaining_doses >= 0),
  refill_threshold integer not null default 3 check (refill_threshold >= 0),
  updated_at timestamptz not null default now()
);

create index if not exists idx_medication_plans_pet_status
  on public.medication_plans (pet_id, status);
create index if not exists idx_medication_schedules_plan
  on public.medication_schedules (plan_id);
create index if not exists idx_medication_doses_pet_status_scheduled
  on public.medication_doses (pet_id, status, scheduled_at);
create index if not exists idx_medication_inventory_pet
  on public.medication_inventory (pet_id);

alter table public.medication_plans enable row level security;
alter table public.medication_schedules enable row level security;
alter table public.medication_doses enable row level security;
alter table public.medication_inventory enable row level security;

create policy "medication_plans_select_access" on public.medication_plans
  for select using (public.has_pet_access(pet_id));
create policy "medication_plans_insert_access" on public.medication_plans
  for insert with check (auth.uid() = user_id and public.has_pet_access(pet_id));
create policy "medication_plans_update_access" on public.medication_plans
  for update using (public.has_pet_access(pet_id)) with check (public.has_pet_access(pet_id));
create policy "medication_plans_delete_access" on public.medication_plans
  for delete using (public.has_pet_access(pet_id));

create policy "medication_schedules_select_access" on public.medication_schedules
  for select using (
    exists (select 1 from public.medication_plans mp where mp.id = plan_id and public.has_pet_access(mp.pet_id))
  );
create policy "medication_schedules_insert_access" on public.medication_schedules
  for insert with check (
    exists (select 1 from public.medication_plans mp where mp.id = plan_id and public.has_pet_access(mp.pet_id))
  );
create policy "medication_schedules_update_access" on public.medication_schedules
  for update using (
    exists (select 1 from public.medication_plans mp where mp.id = plan_id and public.has_pet_access(mp.pet_id))
  );
create policy "medication_schedules_delete_access" on public.medication_schedules
  for delete using (
    exists (select 1 from public.medication_plans mp where mp.id = plan_id and public.has_pet_access(mp.pet_id))
  );

create policy "medication_doses_select_access" on public.medication_doses
  for select using (public.has_pet_access(pet_id));
create policy "medication_doses_insert_access" on public.medication_doses
  for insert with check (public.has_pet_access(pet_id));
create policy "medication_doses_update_access" on public.medication_doses
  for update using (public.has_pet_access(pet_id)) with check (public.has_pet_access(pet_id));
create policy "medication_doses_delete_access" on public.medication_doses
  for delete using (public.has_pet_access(pet_id));

create policy "medication_inventory_select_access" on public.medication_inventory
  for select using (public.has_pet_access(pet_id));
create policy "medication_inventory_insert_access" on public.medication_inventory
  for insert with check (public.has_pet_access(pet_id));
create policy "medication_inventory_update_access" on public.medication_inventory
  for update using (public.has_pet_access(pet_id)) with check (public.has_pet_access(pet_id));
create policy "medication_inventory_delete_access" on public.medication_inventory
  for delete using (public.has_pet_access(pet_id));

create trigger set_medication_plans_updated_at
  before update on public.medication_plans
  for each row execute function public.set_updated_at();
create trigger set_medication_schedules_updated_at
  before update on public.medication_schedules
  for each row execute function public.set_updated_at();
create trigger set_medication_doses_updated_at
  before update on public.medication_doses
  for each row execute function public.set_updated_at();
create trigger set_medication_inventory_updated_at
  before update on public.medication_inventory
  for each row execute function public.set_updated_at();

alter publication supabase_realtime add table public.medication_plans;
alter publication supabase_realtime add table public.medication_schedules;
alter publication supabase_realtime add table public.medication_doses;
alter publication supabase_realtime add table public.medication_inventory;

create or replace function public.set_medication_inventory(
  p_plan_id text,
  p_remaining_doses integer,
  p_refill_threshold integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_plan public.medication_plans%rowtype;
  v_previous_remaining integer;
begin
  select * into v_plan from public.medication_plans where id = p_plan_id;
  if not found or not public.has_pet_access(v_plan.pet_id) then
    raise exception 'Medication plan not found';
  end if;

  select remaining_doses into v_previous_remaining
  from public.medication_inventory where plan_id = p_plan_id;

  insert into public.medication_inventory (
    plan_id, pet_id, remaining_doses, refill_threshold, updated_at
  ) values (
    p_plan_id, v_plan.pet_id, greatest(0, p_remaining_doses),
    greatest(0, p_refill_threshold), now()
  )
  on conflict (plan_id) do update set
    remaining_doses = excluded.remaining_doses,
    refill_threshold = excluded.refill_threshold,
    updated_at = now();

  if v_previous_remaining is not null and v_previous_remaining is distinct from greatest(0, p_remaining_doses) then
    perform public.log_activity_event(
      'medication-refill-' || p_plan_id || '-' || extract(epoch from now())::bigint,
      v_plan.pet_id,
      'medication_refilled',
      jsonb_build_object('planId', p_plan_id)
    );
  end if;
end;
$$;

grant execute on function public.set_medication_inventory(text, integer, integer) to authenticated;

create or replace function public.transition_medication_dose(
  p_dose_id text,
  p_status text,
  p_completed_at timestamptz default null,
  p_snoozed_until timestamptz default null,
  p_note text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_dose public.medication_doses%rowtype;
begin
  if p_status not in ('taken', 'skipped', 'snoozed') then
    raise exception 'Unsupported medication dose transition';
  end if;

  select * into v_dose from public.medication_doses where id = p_dose_id for update;
  if not found or not public.has_pet_access(v_dose.pet_id) then
    raise exception 'Medication dose not found';
  end if;

  if v_dose.status in ('taken', 'skipped') then
    if v_dose.status = p_status then return; end if;
    raise exception 'Medication dose already resolved';
  end if;

  if p_status = 'taken' then
    update public.medication_inventory
    set remaining_doses = greatest(0, remaining_doses - 1), updated_at = now()
    where plan_id = v_dose.plan_id;
  end if;

  update public.medication_doses
  set status = p_status,
      completed_at = case when p_status in ('taken', 'skipped') then coalesce(p_completed_at, now()) else null end,
      actor_user_id = case when p_status in ('taken', 'skipped') then auth.uid() else actor_user_id end,
      snoozed_until = case when p_status = 'snoozed' then p_snoozed_until else null end,
      note = coalesce(p_note, note),
      updated_at = now()
  where id = p_dose_id;

  perform public.log_activity_event(
    'dose-' || p_dose_id || '-' || p_status,
    v_dose.pet_id,
    'dose_' || p_status,
    jsonb_build_object('planId', v_dose.plan_id, 'doseId', p_dose_id)
  );
end;
$$;

grant execute on function public.transition_medication_dose(text, text, timestamptz, timestamptz, text) to authenticated;
