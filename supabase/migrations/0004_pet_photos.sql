-- Lulu cloud sync schema (v4): pet photo storage
-- Run this once in the Supabase Dashboard -> SQL Editor (after 0001_init.sql).

-- pet photo storage bucket --------------------------------------------------
-- Public read so photo URLs render without signed URLs; writes are scoped to
-- the owning user via the policies below (path must start with their user id).
insert into storage.buckets (id, name, public)
values ('pet-photos', 'pet-photos', true)
on conflict (id) do nothing;

drop policy if exists "pet_photos_read" on storage.objects;
create policy "pet_photos_read" on storage.objects
  for select using (bucket_id = 'pet-photos');

drop policy if exists "pet_photos_insert_own" on storage.objects;
create policy "pet_photos_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'pet-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "pet_photos_update_own" on storage.objects;
create policy "pet_photos_update_own" on storage.objects
  for update using (
    bucket_id = 'pet-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'pet-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "pet_photos_delete_own" on storage.objects;
create policy "pet_photos_delete_own" on storage.objects
  for delete using (
    bucket_id = 'pet-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
