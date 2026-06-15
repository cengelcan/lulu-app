import AsyncStorage from '@react-native-async-storage/async-storage';

import { StorageKeys } from '@/constants/storage-keys';
import type { UserProfile } from '@/types/user';

const EMPTY_PROFILE: UserProfile = {
  displayName: null,
  avatarUri: null,
};

function parseUserProfile(value: string | null): UserProfile {
  if (!value) {
    return { ...EMPTY_PROFILE };
  }

  try {
    const parsed = JSON.parse(value) as Partial<UserProfile>;

    return {
      displayName: typeof parsed.displayName === 'string' ? parsed.displayName : null,
      avatarUri: typeof parsed.avatarUri === 'string' ? parsed.avatarUri : null,
    };
  } catch {
    return { ...EMPTY_PROFILE };
  }
}

export async function getUserProfile(): Promise<UserProfile> {
  const value = await AsyncStorage.getItem(StorageKeys.userProfile);
  return parseUserProfile(value);
}

export async function setUserProfile(profile: UserProfile): Promise<void> {
  await AsyncStorage.setItem(StorageKeys.userProfile, JSON.stringify(profile));
}

export async function clearUserProfile(): Promise<void> {
  await AsyncStorage.removeItem(StorageKeys.userProfile);
}

export async function getLastStoreReviewPromptAt(): Promise<number | null> {
  const value = await AsyncStorage.getItem(StorageKeys.lastStoreReviewPromptAt);
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function setLastStoreReviewPromptAt(timestamp: number): Promise<void> {
  await AsyncStorage.setItem(StorageKeys.lastStoreReviewPromptAt, String(timestamp));
}

export async function clearLastStoreReviewPromptAt(): Promise<void> {
  await AsyncStorage.removeItem(StorageKeys.lastStoreReviewPromptAt);
}
