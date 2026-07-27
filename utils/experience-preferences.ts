import {
  CURRENT_EXPERIENCE_PREFERENCES_VERSION,
  CURRENT_ONBOARDING_VERSION,
  type DeviceMeasurementSystem,
  type ExperiencePreferences,
  type LegacyExperiencePreferenceSnapshot,
  type NotificationCategoryPreferences,
  type ThemePreference,
  type WeightUnitPreference,
} from '@/types/experience-preferences';

export function getDefaultWeightUnit(
  measurementSystem: DeviceMeasurementSystem
): WeightUnitPreference {
  return measurementSystem === 'us' ? 'lb' : 'kg';
}

export function createDefaultExperiencePreferences(
  measurementSystem: DeviceMeasurementSystem
): ExperiencePreferences {
  return {
    schemaVersion: CURRENT_EXPERIENCE_PREFERENCES_VERSION,
    themePreference: 'system',
    weightUnitPreference: getDefaultWeightUnit(measurementSystem),
    onboardingVersionCompleted: 0,
    notifications: {
      dailyCheckIn: false,
      petReminders: true,
      medicationDoses: true,
      medicationRefill: true,
      familyDigest: false,
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function resolveThemePreference(value: unknown): ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system' ? value : 'system';
}

function resolveWeightUnitPreference(
  value: unknown,
  fallback: WeightUnitPreference
): WeightUnitPreference {
  return value === 'kg' || value === 'lb' ? value : fallback;
}

function resolveNotificationPreferences(
  value: unknown,
  fallback: NotificationCategoryPreferences
): NotificationCategoryPreferences {
  if (!isRecord(value)) {
    return fallback;
  }

  return {
    dailyCheckIn:
      typeof value.dailyCheckIn === 'boolean' ? value.dailyCheckIn : fallback.dailyCheckIn,
    petReminders:
      typeof value.petReminders === 'boolean' ? value.petReminders : fallback.petReminders,
    medicationDoses:
      typeof value.medicationDoses === 'boolean'
        ? value.medicationDoses
        : fallback.medicationDoses,
    medicationRefill:
      typeof value.medicationRefill === 'boolean'
        ? value.medicationRefill
        : fallback.medicationRefill,
    familyDigest:
      typeof value.familyDigest === 'boolean' ? value.familyDigest : fallback.familyDigest,
  };
}

export function normalizeExperiencePreferences(
  value: unknown,
  measurementSystem: DeviceMeasurementSystem
): ExperiencePreferences | null {
  if (!isRecord(value)) {
    return null;
  }

  const defaults = createDefaultExperiencePreferences(measurementSystem);
  const onboardingVersionCompleted =
    typeof value.onboardingVersionCompleted === 'number' &&
    Number.isInteger(value.onboardingVersionCompleted) &&
    value.onboardingVersionCompleted >= 0
      ? value.onboardingVersionCompleted
      : defaults.onboardingVersionCompleted;

  return {
    schemaVersion: CURRENT_EXPERIENCE_PREFERENCES_VERSION,
    themePreference: resolveThemePreference(value.themePreference),
    weightUnitPreference: resolveWeightUnitPreference(
      value.weightUnitPreference,
      defaults.weightUnitPreference
    ),
    onboardingVersionCompleted,
    notifications: resolveNotificationPreferences(value.notifications, defaults.notifications),
  };
}

export function migrateLegacyExperiencePreferences(
  legacy: LegacyExperiencePreferenceSnapshot,
  measurementSystem: DeviceMeasurementSystem
): ExperiencePreferences {
  const defaults = createDefaultExperiencePreferences(measurementSystem);

  return {
    ...defaults,
    themePreference: resolveThemePreference(legacy.appAppearance),
    onboardingVersionCompleted: legacy.onboardingCompleted
      ? CURRENT_ONBOARDING_VERSION
      : 0,
    notifications: {
      ...defaults.notifications,
      dailyCheckIn: legacy.notificationPermission === 'allowed',
      petReminders:
        typeof legacy.petReminderNotificationsEnabled === 'boolean'
          ? legacy.petReminderNotificationsEnabled
          : defaults.notifications.petReminders,
      familyDigest:
        typeof legacy.familyActivityDigestEnabled === 'boolean'
          ? legacy.familyActivityDigestEnabled
          : defaults.notifications.familyDigest,
    },
  };
}
