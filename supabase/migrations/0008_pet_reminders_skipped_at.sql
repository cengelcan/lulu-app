alter table public.pet_reminders
  add column if not exists skipped_at timestamptz;
