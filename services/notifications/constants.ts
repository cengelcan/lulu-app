import type { CheckInPreference } from '@/types/check-in';

export const CHECK_IN_REMINDER_NOTIFICATION_ID = 'pet-health-check-in-reminder';

export const ANDROID_CHECK_IN_CHANNEL_ID = 'check-in-reminders';

export type SchedulableCheckInPreference = Exclude<
  CheckInPreference,
  'multiple_times_daily'
>;

export const CHECK_IN_REMINDER_SCHEDULE: Record<
  SchedulableCheckInPreference,
  { hour: number; minute: number }
> = {
  morning: { hour: 9, minute: 0 },
  afternoon: { hour: 18, minute: 0 },
  evening: { hour: 21, minute: 0 },
};

export const MULTIPLE_TIMES_DAILY_SLOTS: SchedulableCheckInPreference[] = [
  'morning',
  'afternoon',
  'evening',
];

export const CHECK_IN_REMINDER_SLOT_IDS: Record<SchedulableCheckInPreference, string> = {
  morning: 'pet-health-check-in-reminder-morning',
  afternoon: 'pet-health-check-in-reminder-afternoon',
  evening: 'pet-health-check-in-reminder-evening',
};

export const ALL_CHECK_IN_REMINDER_NOTIFICATION_IDS = [
  CHECK_IN_REMINDER_NOTIFICATION_ID,
  ...MULTIPLE_TIMES_DAILY_SLOTS.map((slot) => CHECK_IN_REMINDER_SLOT_IDS[slot]),
] as const;

export function isSchedulableCheckInPreference(
  preference: CheckInPreference | null
): preference is SchedulableCheckInPreference {
  return (
    preference === 'morning' || preference === 'afternoon' || preference === 'evening'
  );
}

export function isNotificationSchedulablePreference(
  preference: CheckInPreference | null
): preference is CheckInPreference {
  return (
    preference === 'morning' ||
    preference === 'afternoon' ||
    preference === 'evening' ||
    preference === 'multiple_times_daily'
  );
}
