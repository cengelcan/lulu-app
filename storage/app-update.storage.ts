import AsyncStorage from '@react-native-async-storage/async-storage';

import { StorageKeys } from '@/constants/storage-keys';

export type AppUpdateDismissal = {
  version: string;
  dismissedAt: number;
};

export async function getAppUpdateDismissal(): Promise<AppUpdateDismissal | null> {
  const value = await AsyncStorage.getItem(StorageKeys.appUpdateDismissal);
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as Partial<AppUpdateDismissal>;
    if (typeof parsed.version !== 'string' || typeof parsed.dismissedAt !== 'number') {
      return null;
    }

    return { version: parsed.version, dismissedAt: parsed.dismissedAt };
  } catch {
    return null;
  }
}

export function saveAppUpdateDismissal(dismissal: AppUpdateDismissal): Promise<void> {
  return AsyncStorage.setItem(StorageKeys.appUpdateDismissal, JSON.stringify(dismissal));
}
