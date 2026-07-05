-- Client upsert may attempt INSERT for an existing pet id before falling back to
-- UPDATE. The tier-limit trigger runs before the unique constraint, so skip the
-- limit check when the row already exists (true updates use UPDATE, not INSERT).

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

  if tg_op = 'INSERT' and exists (
    select 1 from public.pets p where p.id = new.id
  ) then
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
