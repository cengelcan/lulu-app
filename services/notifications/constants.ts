export const APP_SCHEME = 'luluapp';

export const CHECK_IN_ROUTE = '/check-in' as const;

export const CHECK_IN_DEEP_LINK = `${APP_SCHEME}://check-in`;

export const CHECK_IN_NOTIFICATION_DATA = {
  route: CHECK_IN_ROUTE,
  deepLink: CHECK_IN_DEEP_LINK,
} as const;

export const CHECK_IN_REMINDER_NOTIFICATION_ID = 'pet-health-check-in-reminder';

export const CHECK_IN_REMINDER_NOTIFICATION_ID_PREFIX = 'pet-health-check-in-reminder';

export const CHECK_IN_REMINDER_SCHEDULE_HORIZON_DAYS = 14;

export function getCheckInReminderNotificationId(dateKey: string): string {
  return `${CHECK_IN_REMINDER_NOTIFICATION_ID_PREFIX}-${dateKey}`;
}

export const ANDROID_CHECK_IN_CHANNEL_ID = 'check-in-reminders-v2';

export const CHECK_IN_REMINDER_SOUND = 'bell_ring.wav';

/** Legacy slot IDs — cancelled on sync to clean up pre-migration schedules. */
export const LEGACY_CHECK_IN_REMINDER_SLOT_IDS = [
  'pet-health-check-in-reminder-morning',
  'pet-health-check-in-reminder-afternoon',
  'pet-health-check-in-reminder-evening',
] as const;

export const ALL_CHECK_IN_REMINDER_NOTIFICATION_IDS = [
  CHECK_IN_REMINDER_NOTIFICATION_ID,
  ...LEGACY_CHECK_IN_REMINDER_SLOT_IDS,
] as const;

export const PET_REMINDER_NOTIFICATION_ID_PREFIX = 'pet-health-reminder-';

export const ANDROID_PET_REMINDER_CHANNEL_ID = 'pet-reminders-v1';

export const PET_REMINDER_REMINDER_SOUND = 'bell_ring.wav';

export function getPetReminderNotificationId(reminderId: string): string {
  return `${PET_REMINDER_NOTIFICATION_ID_PREFIX}${reminderId}`;
}

export function isPetReminderNotificationId(identifier: string): boolean {
  return identifier.startsWith(PET_REMINDER_NOTIFICATION_ID_PREFIX);
}
