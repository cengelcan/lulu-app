alter table public.profiles
  add column if not exists weight_unit text;

alter table public.profiles
  drop constraint if exists profiles_weight_unit_check;

alter table public.profiles
  add constraint profiles_weight_unit_check
  check (weight_unit is null or weight_unit in ('kg', 'lb'));
