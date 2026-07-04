-- Family sharing: groups, memberships, activity feed, and role-based RLS.
--
-- Order matters: create tables first, then helper functions that reference
-- pet_memberships, then RLS policies and RPCs.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.family_groups (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users (id) on delete cascade,
  code text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  rotated_at timestamptz
);

create unique index if not exists idx_family_groups_owner_active
  on public.family_groups (owner_user_id)
  where is_active = true;

create index if not exists idx_family_groups_code on public.family_groups (code);

create table if not exists public.family_group_pets (
  family_group_id uuid not null references public.family_groups (id) on delete cascade,
  pet_id text not null references public.pets (id) on delete cascade,
  primary key (family_group_id, pet_id)
);

create index if not exists idx_family_group_pets_pet on public.family_group_pets (pet_id);

create table if not exists public.pet_memberships (
  id uuid primary key default gen_random_uuid(),
  pet_id text not null references public.pets (id) on delete cascade,
  member_user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'member' check (role = 'member'),
  family_group_id uuid not null references public.family_groups (id) on delete cascade,
  joined_at timestamptz not null default now(),
  unique (pet_id, member_user_id)
);

create index if not exists idx_pet_memberships_member on public.pet_memberships (member_user_id);
create index if not exists idx_pet_memberships_group on public.pet_memberships (family_group_id);

create table if not exists public.activity_events (
  id text primary key,
  pet_id text not null references public.pets (id) on delete cascade,
  actor_user_id uuid not null references auth.users (id) on delete cascade,
  event_type text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_activity_events_pet_created
  on public.activity_events (pet_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Helper functions (after pet_memberships exists)
-- ---------------------------------------------------------------------------

create or replace function public.is_pet_owner(p_pet_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.pets
    where id = p_pet_id
      and user_id = auth.uid()
  );
$$;

create or replace function public.is_pet_member(p_pet_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.pet_memberships
    where pet_id = p_pet_id
      and member_user_id = auth.uid()
  );
$$;

create or replace function public.has_pet_access(p_pet_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_pet_owner(p_pet_id) or public.is_pet_member(p_pet_id);
$$;

create or replace function public.pet_has_family_members(p_pet_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.pet_memberships
    where pet_id = p_pet_id
  );
$$;

-- ---------------------------------------------------------------------------
-- family_groups RLS
-- ---------------------------------------------------------------------------

alter table public.family_groups enable row level security;

drop policy if exists "family_groups_select_owner" on public.family_groups;
create policy "family_groups_select_owner" on public.family_groups
  for select using (auth.uid() = owner_user_id);

drop policy if exists "family_groups_select_member" on public.family_groups;
create policy "family_groups_select_member" on public.family_groups
  for select using (
    exists (
      select 1
      from public.pet_memberships pm
      where pm.family_group_id = family_groups.id
        and pm.member_user_id = auth.uid()
    )
  );

drop policy if exists "family_groups_insert_owner" on public.family_groups;
create policy "family_groups_insert_owner" on public.family_groups
  for insert with check (auth.uid() = owner_user_id);

drop policy if exists "family_groups_update_owner" on public.family_groups;
create policy "family_groups_update_owner" on public.family_groups
  for update using (auth.uid() = owner_user_id)
  with check (auth.uid() = owner_user_id);

drop policy if exists "family_groups_delete_owner" on public.family_groups;
create policy "family_groups_delete_owner" on public.family_groups
  for delete using (auth.uid() = owner_user_id);

-- ---------------------------------------------------------------------------
-- family_group_pets RLS
-- ---------------------------------------------------------------------------

alter table public.family_group_pets enable row level security;

drop policy if exists "family_group_pets_select" on public.family_group_pets;
create policy "family_group_pets_select" on public.family_group_pets
  for select using (
    exists (
      select 1
      from public.family_groups fg
      where fg.id = family_group_pets.family_group_id
        and (
          fg.owner_user_id = auth.uid()
          or exists (
            select 1
            from public.pet_memberships pm
            where pm.family_group_id = fg.id
              and pm.member_user_id = auth.uid()
          )
        )
    )
  );

drop policy if exists "family_group_pets_insert_owner" on public.family_group_pets;
create policy "family_group_pets_insert_owner" on public.family_group_pets
  for insert with check (
    exists (
      select 1
      from public.family_groups fg
      join public.pets p on p.id = family_group_pets.pet_id
      where fg.id = family_group_pets.family_group_id
        and fg.owner_user_id = auth.uid()
        and p.user_id = auth.uid()
    )
  );

drop policy if exists "family_group_pets_delete_owner" on public.family_group_pets;
create policy "family_group_pets_delete_owner" on public.family_group_pets
  for delete using (
    exists (
      select 1
      from public.family_groups fg
      where fg.id = family_group_pets.family_group_id
        and fg.owner_user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- pet_memberships RLS
-- ---------------------------------------------------------------------------

alter table public.pet_memberships enable row level security;

drop policy if exists "pet_memberships_select" on public.pet_memberships;
create policy "pet_memberships_select" on public.pet_memberships
  for select using (
    member_user_id = auth.uid()
    or public.is_pet_owner(pet_id)
  );

drop policy if exists "pet_memberships_delete_owner" on public.pet_memberships;
create policy "pet_memberships_delete_owner" on public.pet_memberships
  for delete using (public.is_pet_owner(pet_id));

drop policy if exists "pet_memberships_delete_self" on public.pet_memberships;
create policy "pet_memberships_delete_self" on public.pet_memberships
  for delete using (member_user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- activity_events RLS
-- ---------------------------------------------------------------------------

alter table public.activity_events enable row level security;

drop policy if exists "activity_events_select" on public.activity_events;
create policy "activity_events_select" on public.activity_events
  for select using (public.has_pet_access(pet_id));

drop policy if exists "activity_events_insert" on public.activity_events;
create policy "activity_events_insert" on public.activity_events
  for insert with check (
    auth.uid() = actor_user_id
    and public.has_pet_access(pet_id)
  );

-- ---------------------------------------------------------------------------
-- Expand profiles visibility for family participants
-- ---------------------------------------------------------------------------

drop policy if exists "profiles_select_family" on public.profiles;
create policy "profiles_select_family" on public.profiles
  for select using (
    exists (
      select 1
      from public.pet_memberships pm
      join public.pets p on p.id = pm.pet_id
      where p.user_id = profiles.id
        and pm.member_user_id = auth.uid()
    )
    or exists (
      select 1
      from public.pet_memberships pm
      join public.pets p on p.id = pm.pet_id
      where pm.member_user_id = profiles.id
        and p.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- pets RLS — owner full access; members read-only
-- ---------------------------------------------------------------------------

drop policy if exists "pets_select_own" on public.pets;
create policy "pets_select_access" on public.pets
  for select using (public.has_pet_access(id));

drop policy if exists "pets_insert_own" on public.pets;
create policy "pets_insert_own" on public.pets
  for insert with check (auth.uid() = user_id);

drop policy if exists "pets_update_own" on public.pets;
create policy "pets_update_own" on public.pets
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "pets_delete_own" on public.pets;
create policy "pets_delete_own" on public.pets
  for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- check_ins RLS
-- ---------------------------------------------------------------------------

drop policy if exists "check_ins_select_own" on public.check_ins;
create policy "check_ins_select_access" on public.check_ins
  for select using (public.has_pet_access(pet_id));

drop policy if exists "check_ins_insert_own" on public.check_ins;
create policy "check_ins_insert_access" on public.check_ins
  for insert with check (
    auth.uid() = user_id
    and public.has_pet_access(pet_id)
  );

drop policy if exists "check_ins_update_own" on public.check_ins;
create policy "check_ins_update_access" on public.check_ins
  for update using (public.has_pet_access(pet_id))
  with check (
    auth.uid() = user_id
    and public.has_pet_access(pet_id)
  );

drop policy if exists "check_ins_delete_own" on public.check_ins;
create policy "check_ins_delete_access" on public.check_ins
  for delete using (
    auth.uid() = user_id
    and public.has_pet_access(pet_id)
  );

-- ---------------------------------------------------------------------------
-- pet_records RLS
-- ---------------------------------------------------------------------------

drop policy if exists "pet_records_select_own" on public.pet_records;
create policy "pet_records_select_access" on public.pet_records
  for select using (public.has_pet_access(pet_id));

drop policy if exists "pet_records_insert_own" on public.pet_records;
create policy "pet_records_insert_access" on public.pet_records
  for insert with check (
    auth.uid() = user_id
    and public.has_pet_access(pet_id)
  );

drop policy if exists "pet_records_update_own" on public.pet_records;
create policy "pet_records_update_access" on public.pet_records
  for update using (
    auth.uid() = user_id
    and public.has_pet_access(pet_id)
  )
  with check (
    auth.uid() = user_id
    and public.has_pet_access(pet_id)
  );

drop policy if exists "pet_records_delete_own" on public.pet_records;
create policy "pet_records_delete_access" on public.pet_records
  for delete using (
    auth.uid() = user_id
    and public.has_pet_access(pet_id)
  );

-- ---------------------------------------------------------------------------
-- pet_reminders RLS (from 0007)
-- ---------------------------------------------------------------------------

drop policy if exists "pet_reminders_select_own" on public.pet_reminders;
create policy "pet_reminders_select_access" on public.pet_reminders
  for select using (public.has_pet_access(pet_id));

drop policy if exists "pet_reminders_insert_own" on public.pet_reminders;
create policy "pet_reminders_insert_access" on public.pet_reminders
  for insert with check (
    auth.uid() = user_id
    and public.has_pet_access(pet_id)
  );

drop policy if exists "pet_reminders_update_own" on public.pet_reminders;
create policy "pet_reminders_update_access" on public.pet_reminders
  for update using (
    auth.uid() = user_id
    and public.has_pet_access(pet_id)
  )
  with check (
    auth.uid() = user_id
    and public.has_pet_access(pet_id)
  );

drop policy if exists "pet_reminders_delete_own" on public.pet_reminders;
create policy "pet_reminders_delete_access" on public.pet_reminders
  for delete using (
    auth.uid() = user_id
    and public.has_pet_access(pet_id)
  );

-- ---------------------------------------------------------------------------
-- RPC: preview family join
-- ---------------------------------------------------------------------------

create or replace function public.preview_family_join(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_group public.family_groups%rowtype;
  v_owner_name text;
  v_pets jsonb;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select *
  into v_group
  from public.family_groups
  where code = upper(regexp_replace(p_code, '[^A-Za-z0-9]', '', 'g'))
    and is_active = true;

  if not found then
    raise exception 'Invalid family code';
  end if;

  if v_group.owner_user_id = auth.uid() then
    raise exception 'Cannot join your own family group';
  end if;

  select display_name
  into v_owner_name
  from public.profiles
  where id = v_group.owner_user_id;

  select coalesce(
    jsonb_agg(
      jsonb_build_object('id', p.id, 'name', p.name, 'species', p.species)
      order by p.created_at
    ),
    '[]'::jsonb
  )
  into v_pets
  from public.family_group_pets fgp
  join public.pets p on p.id = fgp.pet_id
  where fgp.family_group_id = v_group.id
    and coalesce(p.status, 'active') = 'active';

  if jsonb_array_length(v_pets) = 0 then
    raise exception 'No active pets are shared with this code';
  end if;

  return jsonb_build_object(
    'familyGroupId', v_group.id,
    'ownerUserId', v_group.owner_user_id,
    'ownerDisplayName', v_owner_name,
    'pets', v_pets
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- RPC: accept family join
-- ---------------------------------------------------------------------------

create or replace function public.accept_family_join(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_group public.family_groups%rowtype;
  v_member_count integer;
  v_inserted integer := 0;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select *
  into v_group
  from public.family_groups
  where code = upper(regexp_replace(p_code, '[^A-Za-z0-9]', '', 'g'))
    and is_active = true;

  if not found then
    raise exception 'Invalid family code';
  end if;

  if v_group.owner_user_id = auth.uid() then
    raise exception 'Cannot join your own family group';
  end if;

  select count(distinct pm.member_user_id)
  into v_member_count
  from public.pet_memberships pm
  where pm.family_group_id = v_group.id;

  if v_member_count >= 5 then
    raise exception 'Family member limit reached';
  end if;

  insert into public.pet_memberships (pet_id, member_user_id, family_group_id)
  select fgp.pet_id, auth.uid(), v_group.id
  from public.family_group_pets fgp
  join public.pets p on p.id = fgp.pet_id
  where fgp.family_group_id = v_group.id
    and coalesce(p.status, 'active') = 'active'
  on conflict (pet_id, member_user_id) do nothing;

  get diagnostics v_inserted = row_count;

  insert into public.activity_events (id, pet_id, actor_user_id, event_type, metadata)
  select
    'invite-' || auth.uid()::text || '-' || v_group.id::text,
    fgp.pet_id,
    auth.uid(),
    'invite_accepted',
    jsonb_build_object('familyGroupId', v_group.id)
  from public.family_group_pets fgp
  where fgp.family_group_id = v_group.id
  on conflict (id) do nothing;

  return jsonb_build_object('joinedPetCount', v_inserted);
end;
$$;

-- ---------------------------------------------------------------------------
-- RPC: log care activity (called from app after writes)
-- ---------------------------------------------------------------------------

create or replace function public.log_activity_event(
  p_id text,
  p_pet_id text,
  p_event_type text,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.has_pet_access(p_pet_id) then
    raise exception 'No access to pet';
  end if;

  if not public.pet_has_family_members(p_pet_id)
     and not public.is_pet_member(p_pet_id) then
    return;
  end if;

  insert into public.activity_events (id, pet_id, actor_user_id, event_type, metadata)
  values (p_id, p_pet_id, auth.uid(), p_event_type, coalesce(p_metadata, '{}'::jsonb))
  on conflict (id) do nothing;
end;
$$;

grant execute on function public.preview_family_join(text) to authenticated;
grant execute on function public.accept_family_join(text) to authenticated;
grant execute on function public.log_activity_event(text, text, text, jsonb) to authenticated;
