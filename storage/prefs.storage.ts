import AsyncStorage from '@react-native-async-storage/async-storage';

import { StorageKeys } from '@/constants/storage-keys';
import type { AppLanguagePreference, ResolvedLanguage } from '@/types/language';
import {
  DEFAULT_APP_LANGUAGE_PREFERENCE,
  resolveLanguagePreference,
} from '@/types/language';
import type { ReminderTime } from '@/types/reminder';
import { DEFAULT_REMINDER_TIME } from '@/types/reminder';
import { isValidReminderTime } from '@/utils/time';

export type NotificationPermissionStatus = 'allowed' | 'later' | 'denied';

/** @deprecated Legacy check-in preference slots — used only for migration. */
type LegacyCheckInPreference = 'morning' | 'afternoon' | 'evening' | 'multiple_times_daily';

const LEGACY_PREFERENCE_TO_TIME: Record<LegacyCheckInPreference, ReminderTime> = {
  morning: { hour: 9, minute: 0 },
  afternoon: { hour: 18, minute: 0 },
  evening: { hour: 21, minute: 0 },
  multiple_times_daily: { hour: 9, minute: 0 },
};

function parseReminderTimeJson(value: string): ReminderTime | null {
  try {
    const parsed = JSON.parse(value) as ReminderTime;
    return isValidReminderTime(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function isLegacyCheckInPreference(value: string): value is LegacyCheckInPreference {
  return (
    value === 'morning' ||
    value === 'afternoon' ||
    value === 'evening' ||
    value === 'multiple_times_daily'
  );
}

async function migrateLegacyCheckInPreference(): Promise<ReminderTime | null> {
  const legacyValue = await AsyncStorage.getItem(StorageKeys.checkInPreferences);
  if (!legacyValue || !isLegacyCheckInPreference(legacyValue)) {
    return null;
  }

  const reminderTime = LEGACY_PREFERENCE_TO_TIME[legacyValue];
  await setCheckInReminderTime(reminderTime);
  await AsyncStorage.removeItem(StorageKeys.checkInPreferences);
  return reminderTime;
}

export async function getOnboardingCompleted(): Promise<boolean> {
  const value = await AsyncStorage.getItem(StorageKeys.onboardingCompleted);
  return value === 'true';
}

export async function setOnboardingCompleted(completed: boolean): Promise<void> {
  await AsyncStorage.setItem(StorageKeys.onboardingCompleted, completed ? 'true' : 'false');
}

export async function getCurrentUserId(): Promise<string | null> {
  return AsyncStorage.getItem(StorageKeys.currentUserId);
}

export async function setCurrentUserId(userId: string): Promise<void> {
  await AsyncStorage.setItem(StorageKeys.currentUserId, userId);
}

export async function removeCurrentUserId(): Promise<void> {
  await AsyncStorage.removeItem(StorageKeys.currentUserId);
}

export async function getCheckInReminderTime(): Promise<ReminderTime> {
  const value = await AsyncStorage.getItem(StorageKeys.checkInReminderTime);
  if (value) {
    const parsed = parseReminderTimeJson(value);
    if (parsed) {
      return parsed;
    }
  }

  const migrated = await migrateLegacyCheckInPreference();
  if (migrated) {
    return migrated;
  }

  return DEFAULT_REMINDER_TIME;
}

export async function setCheckInReminderTime(reminderTime: ReminderTime): Promise<void> {
  await AsyncStorage.setItem(StorageKeys.checkInReminderTime, JSON.stringify(reminderTime));
}

export async function removeCheckInReminderTime(): Promise<void> {
  await AsyncStorage.removeItem(StorageKeys.checkInReminderTime);
  await AsyncStorage.removeItem(StorageKeys.checkInPreferences);
}

export async function removeAppAppearance(): Promise<void> {
  await AsyncStorage.removeItem(StorageKeys.appAppearance);
}

export async function getAppLanguagePreference(): Promise<AppLanguagePreference> {
  const value = await AsyncStorage.getItem(StorageKeys.appLanguage);

  if (value === 'tr') {
    await AsyncStorage.setItem(StorageKeys.appLanguage, 'en');
    return 'en';
  }

  if (value === 'system' || value === 'en' || value === 'de') {
    return value;
  }

  return DEFAULT_APP_LANGUAGE_PREFERENCE;
}

export async function getAppLanguage(): Promise<ResolvedLanguage> {
  const preference = await getAppLanguagePreference();
  return resolveLanguagePreference(preference);
}

export async function setAppLanguagePreference(
  preference: AppLanguagePreference
): Promise<void> {
  await AsyncStorage.setItem(StorageKeys.appLanguage, preference);
}

/** @deprecated Use setAppLanguagePreference. */
export async function setAppLanguage(language: ResolvedLanguage): Promise<void> {
  await setAppLanguagePreference(language);
}

export async function removeAppLanguage(): Promise<void> {
  await AsyncStorage.removeItem(StorageKeys.appLanguage);
}

export async function getNotificationPermission(): Promise<NotificationPermissionStatus | null> {
  const value = await AsyncStorage.getItem(StorageKeys.notificationPermission);
  if (value === 'allowed' || value === 'later' || value === 'denied') {
    return value;
  }

  return null;
}

export async function setNotificationPermission(
  status: NotificationPermissionStatus
): Promise<void> {
  await AsyncStorage.setItem(StorageKeys.notificationPermission, status);
}

export async function removeNotificationPermission(): Promise<void> {
  await AsyncStorage.removeItem(StorageKeys.notificationPermission);
}

export async function getPetReminderNotificationsEnabled(): Promise<boolean> {
  const value = await AsyncStorage.getItem(StorageKeys.petReminderNotificationsEnabled);
  return value !== 'false';
}

export async function setPetReminderNotificationsEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(
    StorageKeys.petReminderNotificationsEnabled,
    enabled ? 'true' : 'false'
  );
}

export async function removePetReminderNotificationsEnabled(): Promise<void> {
  await AsyncStorage.removeItem(StorageKeys.petReminderNotificationsEnabled);
}

export async function getActivePetId(): Promise<string | null> {
  return AsyncStorage.getItem(StorageKeys.activePetId);
}

export async function setActivePetId(petId: string): Promise<void> {
  await AsyncStorage.setItem(StorageKeys.activePetId, petId);
}

export async function removeActivePetId(): Promise<void> {
  await AsyncStorage.removeItem(StorageKeys.activePetId);
}
