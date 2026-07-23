// eslint-disable-next-line import/no-unresolved -- Supabase Edge Functions use Deno npm specifiers.
import { createClient } from 'npm:@supabase/supabase-js@2';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const FAMILY_ACTIVITY_ROUTE = '/family-activity';

type DigestPreference = {
  user_id: string;
  language: 'de' | 'en' | 'tr';
  digest_last_sent_at: string;
};

type PushTokenRow = {
  user_id: string;
  expo_push_token: string;
};

type ExpoPushTicket = {
  status: 'error' | 'ok';
  id?: string;
  message?: string;
  details?: { error?: string };
};

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let index = 0; index < a.length; index += 1) {
    mismatch |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return mismatch === 0;
}

function getDigestCopy(
  language: DigestPreference['language'],
  count: number
): { title: string; body: string } {
  if (language === 'de') {
    return {
      title: 'Neue Familienaktivität',
      body: `In deiner Familie gibt es ${count} neue Pflegeaktivität${count === 1 ? '' : 'en'}.`,
    };
  }

  if (language === 'tr') {
    return {
      title: 'Yeni aile aktivitesi',
      body: `Ailende ${count} yeni bakım aktivitesi var.`,
    };
  }

  return {
    title: 'New family activity',
    body: `There ${count === 1 ? 'is' : 'are'} ${count} new care ${
      count === 1 ? 'activity' : 'activities'
    } in your family.`,
  };
}

async function getFamilyIds(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<string[]> {
  const [{ data: owned, error: ownedError }, { data: joined, error: joinedError }] =
    await Promise.all([
      supabase
        .from('family_groups')
        .select('id')
        .eq('owner_user_id', userId)
        .eq('is_active', true),
      supabase
        .from('pet_memberships')
        .select('family_group_id, family_groups!inner(is_active)')
        .eq('member_user_id', userId)
        .eq('family_groups.is_active', true),
    ]);

  if (ownedError || joinedError) {
    throw new Error(ownedError?.message ?? joinedError?.message);
  }

  return [
    ...new Set([
      ...(owned ?? []).map((row) => row.id as string),
      ...(joined ?? []).map((row) => row.family_group_id as string),
    ]),
  ];
}

async function countNewActivity(
  supabase: ReturnType<typeof createClient>,
  preference: DigestPreference,
  until: string
): Promise<number> {
  const familyIds = await getFamilyIds(supabase, preference.user_id);
  if (familyIds.length === 0) return 0;

  const { count, error } = await supabase
    .from('activity_events')
    .select('id', { count: 'exact', head: true })
    .in('family_id', familyIds)
    .neq('actor_user_id', preference.user_id)
    .gt('occurred_at', preference.digest_last_sent_at)
    .lte('occurred_at', until);

  if (error) throw new Error(error.message);
  return count ?? 0;
}

async function sendDigest(
  tokens: string[],
  language: DigestPreference['language'],
  count: number,
  accessToken: string | undefined
): Promise<{ delivered: boolean; invalidTokens: string[] }> {
  const copy = getDigestCopy(language, count);
  const messages = tokens.map((token) => ({
    to: token,
    sound: 'default',
    channelId: 'family-activity-v1',
    title: copy.title,
    body: copy.body,
    data: {
      route: FAMILY_ACTIVITY_ROUTE,
      deepLink: 'luluapp://family-activity',
      kind: 'family_activity_digest',
    },
  }));

  const response = await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-Encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify(messages),
  });

  if (!response.ok) {
    throw new Error(`Expo push request failed with HTTP ${response.status}`);
  }

  const payload = (await response.json()) as {
    data?: ExpoPushTicket | ExpoPushTicket[];
  };
  const tickets = Array.isArray(payload.data)
    ? payload.data
    : payload.data
      ? [payload.data]
      : [];

  return {
    delivered: tickets.some((ticket) => ticket.status === 'ok'),
    invalidTokens: tickets.flatMap((ticket, index) =>
      ticket.status === 'error' && ticket.details?.error === 'DeviceNotRegistered'
        ? [tokens[index]]
        : []
    ),
  };
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'method_not_allowed' }, 405);
  }

  const cronSecret = Deno.env.get('FAMILY_ACTIVITY_DIGEST_CRON_SECRET')?.trim();
  const suppliedSecret = req.headers.get('X-Cron-Secret')?.trim();
  if (
    !cronSecret ||
    !suppliedSecret ||
    !timingSafeEqual(cronSecret, suppliedSecret)
  ) {
    return jsonResponse({ error: 'unauthorized' }, 401);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: 'server_misconfigured' }, 500);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const cutoff = new Date().toISOString();

  const { data: preferences, error: preferenceError } = await supabase
    .from('notification_preferences')
    .select('user_id, language, digest_last_sent_at')
    .eq('family_activity_digest_enabled', true)
    .limit(1000);

  if (preferenceError) {
    return jsonResponse({ error: 'preference_query_failed' }, 500);
  }

  const userIds = (preferences ?? []).map((row) => row.user_id as string);
  if (userIds.length === 0) {
    return jsonResponse({ ok: true, delivered: 0 });
  }

  const { data: tokenRows, error: tokenError } = await supabase
    .from('device_push_tokens')
    .select('user_id, expo_push_token')
    .in('user_id', userIds);

  if (tokenError) {
    return jsonResponse({ error: 'token_query_failed' }, 500);
  }

  const tokensByUser = new Map<string, string[]>();
  for (const row of (tokenRows ?? []) as PushTokenRow[]) {
    const tokens = tokensByUser.get(row.user_id) ?? [];
    tokens.push(row.expo_push_token);
    tokensByUser.set(row.user_id, tokens);
  }

  let delivered = 0;
  const failures: string[] = [];
  for (const preference of (preferences ?? []) as DigestPreference[]) {
    const tokens = tokensByUser.get(preference.user_id) ?? [];
    if (tokens.length === 0) continue;

    try {
      const count = await countNewActivity(supabase, preference, cutoff);
      if (count === 0) continue;

      const result = await sendDigest(
        tokens,
        preference.language,
        count,
        Deno.env.get('EXPO_ACCESS_TOKEN')?.trim()
      );

      if (result.invalidTokens.length > 0) {
        await supabase
          .from('device_push_tokens')
          .delete()
          .in('expo_push_token', result.invalidTokens);
      }

      if (result.delivered) {
        await supabase
          .from('notification_preferences')
          .update({ digest_last_sent_at: cutoff })
          .eq('user_id', preference.user_id)
          .eq('family_activity_digest_enabled', true);
        delivered += 1;
      }
    } catch (error) {
      console.error('[family-activity-digest] delivery failed', error);
      failures.push(preference.user_id);
    }
  }

  return jsonResponse({
    ok: failures.length === 0,
    delivered,
    failed: failures.length,
  });
});
