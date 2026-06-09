import AsyncStorage from '@react-native-async-storage/async-storage';

import { StorageKeys } from '@/constants/storage-keys';
import { formatLocalDate } from '@/services/notifications/date';
import type { SchedulableCheckInPreference } from '@/services/notifications/constants';

export type SkippedReminder = {
  slot: SchedulableCheckInPreference;
  date: string;
};

function isSkippedReminder(value: unknown): value is SkippedReminder {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const record = value as Partial<SkippedReminder>;

  return (
    (record.slot === 'morning' ||
      record.slot === 'afternoon' ||
      record.slot === 'evening') &&
    typeof record.date === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(record.date)
  );
}

export async function getSkippedReminders(): Promise<SkippedReminder[]> {
  const raw = await AsyncStorage.getItem(StorageKeys.reminderSkips);

  if (!raw) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isSkippedReminder);
  } catch {
    return [];
  }
}

export async function addSkippedReminder(skip: SkippedReminder): Promise<void> {
  const existing = await getSkippedReminders();
  const alreadySkipped = existing.some(
    (entry) => entry.slot === skip.slot && entry.date === skip.date
  );

  if (alreadySkipped) {
    return;
  }

  await AsyncStorage.setItem(
    StorageKeys.reminderSkips,
    JSON.stringify([...existing, skip])
  );
}

export async function pruneExpiredSkips(now: Date = new Date()): Promise<SkippedReminder[]> {
  const today = formatLocalDate(now);
  const active = (await getSkippedReminders()).filter((skip) => skip.date >= today);

  await AsyncStorage.setItem(StorageKeys.reminderSkips, JSON.stringify(active));

  return active;
}

export function isReminderSkipped(
  slot: SchedulableCheckInPreference,
  date: string,
  skippedReminders: SkippedReminder[]
): boolean {
  return skippedReminders.some((skip) => skip.slot === slot && skip.date === date);
}
