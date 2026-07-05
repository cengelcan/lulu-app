import { createClient } from 'npm:@supabase/supabase-js@2';

/** Keep in sync with constants/subscription.ts */
const ENTITLEMENT_PLUS = 'plus';
const LIFETIME_PRODUCT_ID = 'lulu_plus_lifetime';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type RevenueCatWebhookPayload = {
  api_version?: string;
  event: RevenueCatEvent;
};

type RevenueCatEvent = {
  id: string;
  type: string;
  app_user_id: string;
  entitlement_id?: string | null;
  entitlement_ids?: string[] | null;
  product_id?: string | null;
  expiration_at_ms?: number | null;
  purchased_at_ms?: number | null;
  environment?: string;
};

type PlusUpdate = {
  plus_active: boolean;
  plus_expires_at: string | null;
  plus_source: 'revenuecat' | 'lifetime';
};

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function isUuid(value: string): boolean {
  return UUID_REGEX.test(value);
}

function msToIso(ms: number | null | undefined): string | null {
  if (ms == null || !Number.isFinite(ms)) {
    return null;
  }

  const date = new Date(ms);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function resolvePlusSource(productId: string | null | undefined): 'revenuecat' | 'lifetime' {
  return productId === LIFETIME_PRODUCT_ID ? 'lifetime' : 'revenuecat';
}

function eventIncludesPlusEntitlement(event: RevenueCatEvent): boolean {
  if (event.entitlement_id === ENTITLEMENT_PLUS) {
    return true;
  }

  return (event.entitlement_ids ?? []).includes(ENTITLEMENT_PLUS);
}

function grantPlus(event: RevenueCatEvent): PlusUpdate {
  const source = resolvePlusSource(event.product_id);
  const expiresAt = source === 'lifetime' ? null : msToIso(event.expiration_at_ms);

  return {
    plus_active: true,
    plus_expires_at: expiresAt,
    plus_source: source,
  };
}

function resolvePlusUpdate(event: RevenueCatEvent): PlusUpdate | null {
  const hasPlus = eventIncludesPlusEntitlement(event);

  switch (event.type) {
    case 'INITIAL_PURCHASE':
    case 'RENEWAL':
    case 'UNCANCELLATION':
    case 'NON_RENEWING_PURCHASE':
    case 'SUBSCRIPTION_EXTENDED':
    case 'REFUND_REVERSED':
    case 'PRODUCT_CHANGE':
    case 'TEMPORARY_ENTITLEMENT_GRANT':
      return hasPlus ? grantPlus(event) : null;

    case 'CANCELLATION':
      // User cancelled renewal but keeps access until expiration_at_ms.
      if (!hasPlus) {
        return null;
      }

      return {
        plus_active: true,
        plus_expires_at: msToIso(event.expiration_at_ms),
        plus_source: resolvePlusSource(event.product_id),
      };

    case 'EXPIRATION':
      if (!hasPlus) {
        return null;
      }

      return {
        plus_active: false,
        plus_expires_at: msToIso(event.expiration_at_ms),
        plus_source: resolvePlusSource(event.product_id),
      };

    case 'BILLING_ISSUE':
    case 'TEST':
    case 'TRANSFER':
      return null;

    default:
      return null;
  }
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return mismatch === 0;
}

async function verifyHmacSignature(
  rawBody: string,
  header: string,
  secret: string,
  toleranceSeconds = 300
): Promise<boolean> {
  const parts = Object.fromEntries(
    header.split(',').map((part) => {
      const index = part.indexOf('=');
      return [part.slice(0, index), part.slice(index + 1)] as const;
    })
  );

  const timestamp = parts.t;
  const expectedSignature = parts.v1;

  if (!timestamp || !expectedSignature) {
    return false;
  }

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signedPayload = `${timestamp}.${rawBody}`;
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(signedPayload)
  );

  const computed = Array.from(new Uint8Array(signatureBuffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');

  if (!timingSafeEqual(computed, expectedSignature)) {
    return false;
  }

  const eventTime = Number.parseInt(timestamp, 10);
  if (!Number.isFinite(eventTime)) {
    return false;
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  return Math.abs(nowSeconds - eventTime) <= toleranceSeconds;
}

function verifyAuthorization(req: Request, authSecret: string): boolean {
  const authorization = req.headers.get('Authorization')?.trim();

  if (!authorization) {
    return false;
  }

  if (authorization === `Bearer ${authSecret}`) {
    return true;
  }

  return timingSafeEqual(authorization, authSecret);
}

async function verifyRequest(req: Request, rawBody: string): Promise<Response | null> {
  const authSecret = Deno.env.get('REVENUECAT_WEBHOOK_AUTH')?.trim();
  const signingSecret = Deno.env.get('REVENUECAT_WEBHOOK_SIGNING_SECRET')?.trim();

  if (!authSecret && !signingSecret) {
    console.error('[revenuecat-webhook] Missing REVENUECAT_WEBHOOK_AUTH or signing secret');
    return jsonResponse({ error: 'webhook_auth_not_configured' }, 500);
  }

  if (signingSecret) {
    const signature = req.headers.get('X-RevenueCat-Webhook-Signature');
    if (!signature) {
      return jsonResponse({ error: 'missing_signature' }, 401);
    }

    const valid = await verifyHmacSignature(rawBody, signature, signingSecret);
    if (!valid) {
      return jsonResponse({ error: 'invalid_signature' }, 401);
    }

    return null;
  }

  if (!authSecret || !verifyAuthorization(req, authSecret)) {
    return jsonResponse({ error: 'unauthorized' }, 401);
  }

  return null;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'method_not_allowed' }, 405);
  }

  const rawBody = await req.text();
  const authError = await verifyRequest(req, rawBody);
  if (authError) {
    return authError;
  }

  let payload: RevenueCatWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as RevenueCatWebhookPayload;
  } catch {
    return jsonResponse({ error: 'invalid_json' }, 400);
  }

  const event = payload.event;
  if (!event?.id || !event.type || !event.app_user_id) {
    return jsonResponse({ error: 'invalid_event' }, 400);
  }

  if (!isUuid(event.app_user_id)) {
    console.info('[revenuecat-webhook] skipped anonymous app_user_id', event.app_user_id);
    return jsonResponse({ ok: true, skipped: true, reason: 'anonymous_user' });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('[revenuecat-webhook] Missing Supabase env vars');
    return jsonResponse({ error: 'server_misconfigured' }, 500);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const plusUpdate = resolvePlusUpdate(event);

  const { data: processResult, error: processError } = await supabase.rpc(
    'process_revenuecat_webhook_event',
    {
      p_event_id: event.id,
      p_event_type: event.type,
      p_user_id: event.app_user_id,
      p_apply_plus: plusUpdate !== null,
      p_plus_active: plusUpdate?.plus_active ?? false,
      p_plus_expires_at: plusUpdate?.plus_expires_at ?? null,
      p_plus_source: plusUpdate?.plus_source ?? 'revenuecat',
    }
  );

  if (processError) {
    console.error('[revenuecat-webhook] process_revenuecat_webhook_event failed', processError);
    return jsonResponse({ error: 'process_failed', message: processError.message }, 500);
  }

  return jsonResponse({
    event_id: event.id,
    event_type: event.type,
    action: plusUpdate ? 'updated' : 'ignored',
    ...(typeof processResult === 'object' && processResult !== null ? processResult : { ok: true }),
  });
});
