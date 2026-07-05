-- Keep pet_memberships aligned with family_group_pets when the owner changes
-- which pets are shared, and revoke member access when sharing is deactivated.

-- ---------------------------------------------------------------------------
-- RPC: sync memberships after owner updates shared pets
-- ---------------------------------------------------------------------------

create or replace function public.sync_family_group_memberships(p_family_group_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_group public.family_groups%rowtype;
  v_inserted integer := 0;
  v_deleted integer := 0;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select *
  into v_group
  from public.family_groups
  where id = p_family_group_id
    and is_active = true;

  if not found then
    raise exception 'Family group not found';
  end if;

  if v_group.owner_user_id != auth.uid() then
    raise exception 'Not authorized';
  end if;

  -- Grant access to newly shared pets for every existing group member.
  insert into public.pet_memberships (pet_id, member_user_id, family_group_id)
  select fgp.pet_id, members.member_user_id, p_family_group_id
  from public.family_group_pets fgp
  join public.pets p on p.id = fgp.pet_id
  cross join (
    select distinct member_user_id
    from public.pet_memberships
    where family_group_id = p_family_group_id
  ) members
  where fgp.family_group_id = p_family_group_id
    and coalesce(p.status, 'active') = 'active'
  on conflict (pet_id, member_user_id) do nothing;

  get diagnostics v_inserted = row_count;

  -- Revoke access to pets that are no longer shared in this group.
  delete from public.pet_memberships pm
  where pm.family_group_id = p_family_group_id
    and not exists (
      select 1
      from public.family_group_pets fgp
      join public.pets p on p.id = fgp.pet_id
      where fgp.family_group_id = p_family_group_id
        and fgp.pet_id = pm.pet_id
        and coalesce(p.status, 'active') = 'active'
    );

  get diagnostics v_deleted = row_count;

  return jsonb_build_object('inserted', v_inserted, 'deleted', v_deleted);
end;
$$;

-- ---------------------------------------------------------------------------
-- RPC: revoke all member access when owner deactivates sharing
-- ---------------------------------------------------------------------------

create or replace function public.revoke_family_group_memberships(p_family_group_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_group public.family_groups%rowtype;
  v_deleted integer := 0;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select *
  into v_group
  from public.family_groups
  where id = p_family_group_id;

  if not found then
    raise exception 'Family group not found';
  end if;

  if v_group.owner_user_id != auth.uid() then
    raise exception 'Not authorized';
  end if;

  delete from public.pet_memberships
  where family_group_id = p_family_group_id;

  get diagnostics v_deleted = row_count;

  return jsonb_build_object('deleted', v_deleted);
end;
$$;

grant execute on function public.sync_family_group_memberships(uuid) to authenticated;
grant execute on function public.revoke_family_group_memberships(uuid) to authenticated;
