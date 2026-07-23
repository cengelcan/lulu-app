-- Versioned family activity envelope and cursor-friendly ordering.

alter table public.activity_events
  add column if not exists family_id uuid references public.family_groups (id) on delete cascade,
  add column if not exists entity_id text,
  add column if not exists metadata_version integer not null default 1
    check (metadata_version > 0),
  add column if not exists occurred_at timestamptz;

update public.activity_events
set occurred_at = created_at
where occurred_at is null;

alter table public.activity_events
  alter column occurred_at set default now(),
  alter column occurred_at set not null;

update public.activity_events ae
set family_id = fgp.family_group_id
from public.family_group_pets fgp
where fgp.pet_id = ae.pet_id
  and ae.family_id is null;

create index if not exists idx_activity_events_family_occurred
  on public.activity_events (family_id, occurred_at desc, id desc);
create index if not exists idx_activity_events_pet_occurred
  on public.activity_events (pet_id, occurred_at desc, id desc);

alter publication supabase_realtime add table public.activity_events;

drop function if exists public.log_activity_event(text, text, text, jsonb);

create or replace function public.log_activity_event(
  p_id text,
  p_pet_id text,
  p_event_type text,
  p_metadata jsonb default '{}'::jsonb,
  p_entity_id text default null,
  p_metadata_version integer default 1,
  p_occurred_at timestamptz default now()
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_family_id uuid;
  v_metadata jsonb := coalesce(p_metadata, '{}'::jsonb);
begin
  if not public.has_pet_access(p_pet_id) then
    raise exception 'No access to pet';
  end if;

  if not public.pet_has_family_members(p_pet_id)
     and not public.is_pet_member(p_pet_id) then
    return;
  end if;

  select family_group_id into v_family_id
  from public.family_group_pets
  where pet_id = p_pet_id
  limit 1;

  insert into public.activity_events (
    id, family_id, pet_id, actor_user_id, event_type, entity_id,
    metadata, metadata_version, occurred_at
  )
  values (
    p_id, v_family_id, p_pet_id, auth.uid(), p_event_type,
    coalesce(
      p_entity_id,
      v_metadata ->> 'entityId',
      v_metadata ->> 'doseId',
      v_metadata ->> 'recordId',
      v_metadata ->> 'reminderId'
    ),
    v_metadata,
    greatest(1, p_metadata_version),
    coalesce(p_occurred_at, now())
  )
  on conflict (id) do nothing;
end;
$$;

grant execute on function public.log_activity_event(
  text, text, text, jsonb, text, integer, timestamptz
) to authenticated;

drop policy if exists "activity_events_insert" on public.activity_events;
revoke insert on public.activity_events from authenticated;
