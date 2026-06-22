-- Lulu cloud sync schema (v5): pet lifecycle status (active / deceased)
-- Run this once in the Supabase Dashboard -> SQL Editor (after 0001_init.sql).
--
-- Adds a status column so pets can be marked as deceased (memorial) and an
-- optional timestamp for when that happened. Existing rows default to 'active'.

alter table public.pets
  add column if not exists status text not null default 'active';

alter table public.pets
  add column if not exists deceased_at text;
