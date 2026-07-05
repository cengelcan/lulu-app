-- Enable Realtime on pet_memberships so members and owners receive live updates
-- when sharing access is granted or revoked. RLS limits which rows each user sees.

alter publication supabase_realtime add table public.pet_memberships;
