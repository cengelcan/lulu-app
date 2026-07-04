import AsyncStorage from '@react-native-async-storage/async-storage';

import { StorageKeys } from '@/constants/storage-keys';

function parseDismissedIds(value: string | null): string[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((entry): entry is string => typeof entry === 'string');
  } catch {
    return [];
  }
}

export async function getDismissedInboxItemIds(): Promise<Set<string>> {
  const value = await AsyncStorage.getItem(StorageKeys.inboxDismissed);
  return new Set(parseDismissedIds(value));
}

export async function dismissInboxItem(id: string): Promise<void> {
  const dismissed = await getDismissedInboxItemIds();
  dismissed.add(id);
  await AsyncStorage.setItem(StorageKeys.inboxDismissed, JSON.stringify([...dismissed]));
}

export async function clearDismissedInboxItems(): Promise<void> {
  await AsyncStorage.removeItem(StorageKeys.inboxDismissed);
}
