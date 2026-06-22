import { decode } from 'base64-arraybuffer';

import { supabase } from '@/lib/supabase';
import { getUserProfile, setUserProfile } from '@/storage/user.storage';
import type { UserProfile } from '@/types/user';

type RemoteProfileRow = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
};

const AVATAR_BUCKET = 'avatars';

function extensionForMimeType(mimeType: string | null): string {
  if (!mimeType) {
    return 'jpg';
  }

  const subtype = mimeType.split('/')[1]?.toLowerCase();

  if (!subtype) {
    return 'jpg';
  }

  return subtype === 'jpeg' ? 'jpg' : subtype;
}

export async function fetchRemoteProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const row = data as RemoteProfileRow;
  return { displayName: row.display_name, avatarUri: row.avatar_url };
}

export async function pushProfile(userId: string, profile: UserProfile): Promise<void> {
  const { error } = await supabase.from('profiles').upsert(
    {
      id: userId,
      display_name: profile.displayName,
      avatar_url: profile.avatarUri,
    },
    { onConflict: 'id' }
  );

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Uploads an avatar (base64 image bytes) to Supabase Storage and returns a
 * public, cache-busted URL. The file is stored under the user's own folder so
 * the storage RLS policy permits the write.
 */
export async function uploadAvatar(
  userId: string,
  base64: string,
  mimeType: string | null
): Promise<string> {
  const extension = extensionForMimeType(mimeType);
  const path = `${userId}/avatar.${extension}`;
  const contentType = mimeType ?? 'image/jpeg';

  const { error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, decode(base64), { contentType, upsert: true });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
  return `${data.publicUrl}?v=${Date.now()}`;
}

/**
 * Reconciles the local profile with Supabase (the source of truth).
 *
 * Transition case: when the cloud has no profile row yet but the device has a
 * local profile, it is pushed up (claimed for this user). Otherwise the local
 * cache is replaced with the cloud profile.
 */
export async function pullProfileIntoLocal(userId: string): Promise<UserProfile> {
  const remoteProfile = await fetchRemoteProfile(userId);

  if (!remoteProfile) {
    const localProfile = await getUserProfile();

    if (localProfile.displayName || localProfile.avatarUri) {
      await pushProfile(userId, localProfile);
    }

    return localProfile;
  }

  await setUserProfile(remoteProfile);
  return remoteProfile;
}
