-- Fix family_group_pets INSERT policy.
--
-- The original policy joined public.pets directly inside WITH CHECK. That
-- subquery is subject to pets RLS and fails when the row is not visible yet.
-- Use the existing SECURITY DEFINER is_pet_owner() helper instead.

drop policy if exists "family_group_pets_insert_owner" on public.family_group_pets;

create policy "family_group_pets_insert_owner" on public.family_group_pets
  for insert with check (
    exists (
      select 1
      from public.family_groups fg
      where fg.id = family_group_pets.family_group_id
        and fg.owner_user_id = auth.uid()
    )
    and public.is_pet_owner(family_group_pets.pet_id)
  );
