export const StorageKeys = {
  onboardingCompleted: '@pet_health_journal/onboarding_completed',
  currentUserId: '@pet_health_journal/current_user_id',
  checkInPreferences: '@pet_health_journal/check_in_preferences',
  checkInReminderTime: '@pet_health_journal/check_in_reminder_time',
  appAppearance: '@pet_health_journal/app_appearance',
  appLanguage: '@pet_health_journal/app_language',
  notificationPermission: '@pet_health_journal/notification_permission',
  petReminderNotificationsEnabled: '@pet_health_journal/pet_reminder_notifications_enabled',
  activePetId: '@pet_health_journal/active_pet_id',
  userProfile: '@pet_health_journal/user_profile',
  lastStoreReviewPromptAt: '@pet_health_journal/last_store_review_prompt_at',
} as const;

export type StorageKey = (typeof StorageKeys)[keyof typeof StorageKeys];
