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

export function isSchedulableCheckInPreference(
  preference: CheckInPreference | null
): preference is SchedulableCheckInPreference {
  return (
    preference === 'morning' || preference === 'afternoon' || preference === 'evening'
  );
}
