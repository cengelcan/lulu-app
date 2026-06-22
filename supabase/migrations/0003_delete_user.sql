-- Lulu account deletion (v3): self-service account deletion RPC
-- Run this once in the Supabase Dashboard -> SQL Editor (after 0002_profiles.sql).
--
-- Deleting an auth user requires elevated privileges, so this is a SECURITY
-- DEFINER function: it runs with the owner's rights but only ever deletes the
-- *currently authenticated* user (auth.uid()). Removing the auth.users row
-- cascades to pets / check_ins / pet_records / profiles via their
-- `on delete cascade` foreign keys.
--
-- Note: avatar files are NOT removed here. Supabase blocks direct DELETEs on
-- storage.objects from SQL (error 42501), so the client removes the user's
-- avatar via the Storage API before calling this RPC.

create or replace function public.delete_user()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  -- Cascades to pets, check_ins, pet_records, and profiles.
  delete from auth.users where id = uid;
end;
$$;

-- Only authenticated users may delete their own account.
revoke all on function public.delete_user() from public, anon;
grant execute on function public.delete_user() to authenticated;
