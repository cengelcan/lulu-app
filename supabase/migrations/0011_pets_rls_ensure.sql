-- Ensure pets RLS policies exist after partial migration runs.
-- Safe to re-run: drops and recreates the owner write policies.
--
-- Note: PostgREST upsert on pets fails RLS even for new rows with these policies.
-- The app uses insert + update (on conflict) instead of upsert for pets sync.

drop policy if exists "pets_insert_own" on public.pets;
create policy "pets_insert_own" on public.pets
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "pets_update_own" on public.pets;
create policy "pets_update_own" on public.pets
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "pets_delete_own" on public.pets;
create policy "pets_delete_own" on public.pets
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- SELECT policy depends on family-sharing helpers from 0009.
drop policy if exists "pets_select_access" on public.pets;
create policy "pets_select_access" on public.pets
  for select
  to authenticated
  using (public.has_pet_access(id));
