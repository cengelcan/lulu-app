import type { WeightUnit } from '@/types/pet-record';

export const CURRENT_EXPERIENCE_PREFERENCES_VERSION = 1;
export const CURRENT_ONBOARDING_VERSION = 1;

export type ThemePreference = 'system' | 'light' | 'dark';
export type WeightUnitPreference = WeightUnit;

export type NotificationCategoryPreferences = {
  dailyCheckIn: boolean;
  petReminders: boolean;
  medicationDoses: boolean;
  medicationRefill: boolean;
  familyDigest: boolean;
};

export type ExperiencePreferences = {
  schemaVersion: typeof CURRENT_EXPERIENCE_PREFERENCES_VERSION;
  themePreference: ThemePreference;
  weightUnitPreference: WeightUnitPreference;
  onboardingVersionCompleted: number;
  notifications: NotificationCategoryPreferences;
};

export type DeviceMeasurementSystem = 'metric' | 'us' | 'uk' | null;

export type LegacyExperiencePreferenceSnapshot = {
  onboardingCompleted?: boolean | null;
  appAppearance?: string | null;
  notificationPermission?: 'allowed' | 'later' | 'denied' | null;
  petReminderNotificationsEnabled?: boolean | null;
  familyActivityDigestEnabled?: boolean | null;
};
