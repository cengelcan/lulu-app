import { supabase } from '@/lib/supabase';
import {
  mergePlusStatus,
  resolvePlusStatus,
  type PlusStatus,
} from '@/services/subscription/plus-status';

type RemotePlusRow = {
  plus_active: boolean;
  plus_expires_at: string | null;
};

export async function pullPlusStatusFromCloud(userId: string): Promise<PlusStatus> {
  const { data, error } = await supabase
    .from('profiles')
    .select('plus_active, plus_expires_at')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return { isPlusActive: false, plusExpiresAt: null };
  }

  const row = data as RemotePlusRow;
  return resolvePlusStatus({
    plusActive: row.plus_active,
    plusExpiresAt: row.plus_expires_at,
  });
}

export async function resolvePlusStatusForUser(
  userId: string,
  revenueCatStatus: PlusStatus | null
): Promise<PlusStatus> {
  try {
    const cloudStatus = await pullPlusStatusFromCloud(userId);

    if (revenueCatStatus) {
      return mergePlusStatus(revenueCatStatus, cloudStatus);
    }

    return cloudStatus;
  } catch (error) {
    console.warn('Failed to pull Plus status from cloud', error);
    return revenueCatStatus ?? { isPlusActive: false, plusExpiresAt: null };
  }
}
