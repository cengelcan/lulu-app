import { supabase } from '@/lib/supabase';
import type { ResolvedLanguage } from '@/types/language';

type FamilyActivityDigestPreferenceRow = {
  family_activity_digest_enabled: boolean;
};

export async function fetchRemoteFamilyActivityDigestEnabled(
  userId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('notification_preferences')
    .select('family_activity_digest_enabled')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as FamilyActivityDigestPreferenceRow | null)
    ?.family_activity_digest_enabled ?? false;
}

export async function saveRemoteFamilyActivityDigestEnabled(
  userId: string,
  enabled: boolean,
  language: ResolvedLanguage
): Promise<void> {
  const { error } = await supabase.from('notification_preferences').upsert(
    {
      user_id: userId,
      family_activity_digest_enabled: enabled,
      language,
    },
    { onConflict: 'user_id' }
  );

  if (error) {
    throw new Error(error.message);
  }
}
