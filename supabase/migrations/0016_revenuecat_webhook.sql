-- RevenueCat webhook idempotency + server-side Plus status updates.
-- Deploy with: supabase functions deploy revenuecat-webhook
-- Secrets (Dashboard → Edge Functions → revenuecat-webhook → Secrets):
--   REVENUECAT_WEBHOOK_AUTH          — Authorization header value from RC dashboard
--   REVENUECAT_WEBHOOK_SIGNING_SECRET — optional HMAC secret (if HMAC enabled in RC)

create table if not exists public.revenuecat_webhook_events (
  event_id text primary key,
  event_type text not null,
  app_user_id uuid not null,
  created_at timestamptz not null default now()
);

create index if not exists revenuecat_webhook_events_app_user_id_idx
  on public.revenuecat_webhook_events (app_user_id);

alter table public.revenuecat_webhook_events enable row level security;

-- Service-role only (no policies for authenticated/anon).

create or replace function public.process_revenuecat_webhook_event(
  p_event_id text,
  p_event_type text,
  p_user_id uuid,
  p_apply_plus boolean,
  p_plus_active boolean,
  p_plus_expires_at timestamptz,
  p_plus_source text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_existing_source text;
  v_inserted_event_id text;
begin
  if p_apply_plus
    and p_plus_source is not null
    and p_plus_source not in ('revenuecat', 'lifetime', 'promo', 'admin')
  then
    raise exception 'invalid plus_source';
  end if;

  insert into public.revenuecat_webhook_events (event_id, event_type, app_user_id)
  values (p_event_id, p_event_type, p_user_id)
  on conflict (event_id) do nothing
  returning event_id into v_inserted_event_id;

  if v_inserted_event_id is null then
    return jsonb_build_object('ok', true, 'duplicate', true);
  end if;

  if not p_apply_plus then
    return jsonb_build_object('ok', true, 'processed', true, 'action', 'ignored');
  end if;

  if not exists (select 1 from auth.users where id = p_user_id) then
    return jsonb_build_object('ok', true, 'skipped', true, 'reason', 'user_not_found');
  end if;

  select plus_source
  into v_existing_source
  from public.profiles
  where id = p_user_id;

  -- Do not revoke manually granted Plus when RevenueCat sends EXPIRATION for a
  -- customer that never subscribed through the stores.
  if not p_plus_active
    and v_existing_source in ('admin', 'promo')
  then
    return jsonb_build_object('ok', true, 'skipped', true, 'reason', 'protected_plus_source');
  end if;

  insert into public.profiles (id, plus_active, plus_expires_at, plus_source)
  values (p_user_id, p_plus_active, p_plus_expires_at, p_plus_source)
  on conflict (id) do update
  set
    plus_active = excluded.plus_active,
    plus_expires_at = excluded.plus_expires_at,
    plus_source = excluded.plus_source,
    updated_at = now();

  return jsonb_build_object(
    'ok', true,
    'processed', true,
    'plus_active', p_plus_active,
    'plus_expires_at', p_plus_expires_at,
    'plus_source', p_plus_source
  );
end;
$$;

revoke all on function public.process_revenuecat_webhook_event(
  text, text, uuid, boolean, boolean, timestamptz, text
) from public;
grant execute on function public.process_revenuecat_webhook_event(
  text, text, uuid, boolean, boolean, timestamptz, text
) to service_role;
