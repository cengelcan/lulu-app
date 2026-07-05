-- Family group display profile: name and icon preset.

alter table public.family_groups
  add column if not exists name text not null default 'Lulu Family',
  add column if not exists icon_key text not null default 'house_paw';

comment on column public.family_groups.name is 'User-visible family group name';
comment on column public.family_groups.icon_key is 'Preset icon key for the family avatar';
