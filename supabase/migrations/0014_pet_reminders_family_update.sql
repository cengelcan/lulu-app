-- Allow any family participant with pet access to update or delete reminders on
-- shared pets. Previously only the creating user (user_id) could mutate rows,
-- so completing a partner's reminder failed silently on push.

drop policy if exists "pet_reminders_update_access" on public.pet_reminders;
create policy "pet_reminders_update_access" on public.pet_reminders
  for update using (public.has_pet_access(pet_id))
  with check (public.has_pet_access(pet_id));

drop policy if exists "pet_reminders_delete_access" on public.pet_reminders;
create policy "pet_reminders_delete_access" on public.pet_reminders
  for delete using (public.has_pet_access(pet_id));
