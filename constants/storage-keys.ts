export const StorageKeys = {
  onboardingCompleted: '@pet_health_journal/onboarding_completed',
  currentUserId: '@pet_health_journal/current_user_id',
  checkInPreferences: '@pet_health_journal/check_in_preferences',
  notificationPermission: '@pet_health_journal/notification_permission',
} as const;

export type StorageKey = (typeof StorageKeys)[keyof typeof StorageKeys];
