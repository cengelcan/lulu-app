import 'expo-sqlite/localStorage/install';

import { StorageKeys } from '@/constants/storage-keys';
import {
  getFamilyActivityDigestEnabled,
  getLegacyAppAppearance,
  getNotificationPermission,
  getOnboardingCompleted,
  getPetReminderNotificationsEnabled,
} from '@/storage/prefs.storage';
import type {
  DeviceMeasurementSystem,
  ExperiencePreferences,
  NotificationCategoryPreferences,
} from '@/types/experience-preferences';
import { getDeviceRegionalSnapshot } from '@/utils/device-regional-settings';
import {
  getDefaultWeightUnit,
  normalizeExperiencePreferences,
} from '@/utils/experience-preferences';
import { loadOrMigrateExperiencePreferences } from '@/utils/experience-preferences-migration';

function readStoredPreferencePayload(): unknown {
  const value = localStorage.getItem(StorageKeys.experiencePreferences);
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function readStoredPreferences(
  measurementSystem: DeviceMeasurementSystem
): ExperiencePreferences | null {
  return normalizeExperiencePreferences(readStoredPreferencePayload(), measurementSystem);
}

export function saveExperiencePreferences(preferences: ExperiencePreferences): void {
  localStorage.setItem(StorageKeys.experiencePreferences, JSON.stringify(preferences));
}

export async function loadExperiencePreferences(
  measurementSystem: DeviceMeasurementSystem
): Promise<ExperiencePreferences> {
  return loadOrMigrateExperiencePreferences(
    {
      readCurrent: readStoredPreferencePayload,
      readLegacy: async () => {
        const [
          onboardingCompleted,
          appAppearance,
          notificationPermission,
          petReminderNotificationsEnabled,
          familyActivityDigestEnabled,
        ] = await Promise.all([
          getOnboardingCompleted(),
          getLegacyAppAppearance(),
          getNotificationPermission(),
          getPetReminderNotificationsEnabled(),
          getFamilyActivityDigestEnabled(),
        ]);

        return {
          onboardingCompleted,
          appAppearance,
          notificationPermission,
          petReminderNotificationsEnabled,
          familyActivityDigestEnabled,
        };
      },
      writeCurrent: saveExperiencePreferences,
    },
    measurementSystem
  );
}

export function resetWeightUnitPreference(
  measurementSystem: DeviceMeasurementSystem
): void {
  const stored = readStoredPreferences(measurementSystem);
  if (!stored) {
    return;
  }

  saveExperiencePreferences({
    ...stored,
    weightUnitPreference: getDefaultWeightUnit(measurementSystem),
  });
}

export function resetUserScopedNotificationPreferences(
  measurementSystem: DeviceMeasurementSystem
): void {
  const stored = readStoredPreferences(measurementSystem);
  if (!stored) {
    return;
  }

  saveExperiencePreferences({
    ...stored,
    notifications: {
      ...stored.notifications,
      familyDigest: false,
    },
  });
}

export async function loadNotificationCategoryPreferences(): Promise<NotificationCategoryPreferences> {
  return (
    await loadExperiencePreferences(getDeviceRegionalSnapshot().measurementSystem)
  ).notifications;
}

export async function saveOnboardingVersionCompleted(version: number): Promise<void> {
  const preferences = await loadExperiencePreferences(
    getDeviceRegionalSnapshot().measurementSystem
  );

  saveExperiencePreferences({
    ...preferences,
    onboardingVersionCompleted: Math.max(0, Math.trunc(version)),
  });
}
