-- Subscription tier columns + server-side Free/Plus enforcement.
-- Limits mirror constants/subscription.ts (Free: 1 pet, 3 reminders/mo, 5 records/mo;
-- Plus: 10 active pets; family owner must be Plus, max 4 non-owner members).

-- profiles: Plus status (RevenueCat webhook / admin grant) -------------------

alter table public.profiles
  add column if not exists plus_active boolean not null default false,
  add column if not exists plus_expires_at timestamptz,
  add column if not exists plus_source text;

alter table public.profiles
  drop constraint if exists profiles_plus_source_check;

alter table public.profiles
  add constraint profiles_plus_source_check
  check (
    plus_source is null
    or plus_source in ('revenuecat', 'lifetime', 'promo', 'admin')
  );

-- Helpers --------------------------------------------------------------------

create or replace function public.is_user_plus(p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select p.plus_active
        and (p.plus_expires_at is null or p.plus_expires_at > now())
      from public.profiles p
      where p.id = p_user_id
    ),
    false
  );
$$;

create or replace function public.current_month_bounds_utc()
returns table (month_start timestamptz, month_end timestamptz)
language sql
stable
as $$
  select
    date_trunc('month', now() at time zone 'utc') at time zone 'utc',
    (date_trunc('month', now() at time zone 'utc') + interval '1 month') at time zone 'utc';
$$;

-- Pet limits -----------------------------------------------------------------

create or replace function public.enforce_pet_tier_limits()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_active_count integer;
  v_is_plus boolean;
begin
  if coalesce(new.status, 'active') <> 'active' then
    return new;
  end if;

  select count(*)::integer
  into v_active_count
  from public.pets
  where user_id = new.user_id
    and coalesce(status, 'active') = 'active'
    and (tg_op = 'INSERT' or id <> new.id);

  v_is_plus := public.is_user_plus(new.user_id);

  if v_is_plus then
    if v_active_count >= 10 then
      raise exception 'plus_pet_limit_reached';
    end if;
  else
    if v_active_count >= 1 then
      raise exception 'free_pet_limit_reached';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_pet_tier_limits on public.pets;
create trigger enforce_pet_tier_limits
  before insert or update of status on public.pets
  for each row execute function public.enforce_pet_tier_limits();

-- Record limits (Free: 5 / calendar month UTC) --------------------------------

create or replace function public.enforce_record_tier_limits()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
  v_month_start timestamptz;
  v_month_end timestamptz;
begin
  if public.is_user_plus(new.user_id) then
    return new;
  end if;

  select b.month_start, b.month_end
  into v_month_start, v_month_end
  from public.current_month_bounds_utc() b;

  select count(*)::integer
  into v_count
  from public.pet_records
  where user_id = new.user_id
    and created_at >= v_month_start
    and created_at < v_month_end;

  if v_count >= 5 then
    raise exception 'free_record_limit_reached';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_record_tier_limits on public.pet_records;
create trigger enforce_record_tier_limits
  before insert on public.pet_records
  for each row execute function public.enforce_record_tier_limits();

-- Reminder limits (Free: 3 / calendar month UTC) ------------------------------

create or replace function public.enforce_reminder_tier_limits()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
  v_month_start timestamptz;
  v_month_end timestamptz;
begin
  if public.is_user_plus(new.user_id) then
    return new;
  end if;

  select b.month_start, b.month_end
  into v_month_start, v_month_end
  from public.current_month_bounds_utc() b;

  select count(*)::integer
  into v_count
  from public.pet_reminders
  where user_id = new.user_id
    and created_at >= v_month_start
    and created_at < v_month_end;

  if v_count >= 3 then
    raise exception 'free_reminder_limit_reached';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_reminder_tier_limits on public.pet_reminders;
create trigger enforce_reminder_tier_limits
  before insert on public.pet_reminders
  for each row execute function public.enforce_reminder_tier_limits();

-- Family sharing: owner must be Plus -----------------------------------------

drop policy if exists "family_groups_insert_owner" on public.family_groups;
create policy "family_groups_insert_owner" on public.family_groups
  for insert with check (
    auth.uid() = owner_user_id
    and public.is_user_plus(owner_user_id)
  );

-- Family join: owner Plus + max 4 non-owner members (5 people total) -----------

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

  if not public.is_user_plus(v_group.owner_user_id) then
    raise exception 'Family sharing requires Lulu Plus';
  end if;

  select count(distinct pm.member_user_id)
  into v_member_count
  from public.pet_memberships pm
  where pm.family_group_id = v_group.id;

  if v_member_count >= 4 then
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

grant execute on function public.is_user_plus(uuid) to authenticated;
