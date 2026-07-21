-- Deliver shared reminder changes to every authorized family device. Each
-- client pulls the latest rows and rebuilds its own local notification schedule.

alter publication supabase_realtime add table public.pet_reminders;
