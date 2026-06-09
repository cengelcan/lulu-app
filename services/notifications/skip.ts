import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import {
  CHECK_IN_REMINDER_NOTIFICATION_ID,
  isNotificationSchedulablePreference,
} from '@/services/notifications/constants';
import {
  cancelCheckInReminderSlot,
  syncCheckInReminderSchedule,
} from '@/services/notifications/schedule';
import {
  addSkippedReminder,
  getSkippedReminders,
  type SkippedReminder,
} from '@/services/notifications/skip.storage';
import {
  canSkipNextReminder,
  resolveUpcomingSlot,
} from '@/services/notifications/upcoming';
import type { CheckInPreference } from '@/types/check-in';

export type { SkippedReminder } from '@/services/notifications/skip.storage';

export { getSkippedReminders, pruneExpiredSkips } from '@/services/notifications/skip.storage';

export async function skipNextReminder(preference: CheckInPreference | null): Promise<void> {
  if (!isNotificationSchedulablePreference(preference)) {
    throw new Error('No schedulable reminder preference');
  }

  const skippedReminders = await getSkippedReminders();
  const now = new Date();

  if (!canSkipNextReminder(preference, skippedReminders, now)) {
    throw new Error('Next reminder cannot be skipped');
  }

  const upcoming = resolveUpcomingSlot(preference, skippedReminders, now);

  if (!upcoming) {
    throw new Error('No upcoming reminder to skip');
  }

  await addSkippedReminder({ slot: upcoming.slot, date: upcoming.date });

  if (Platform.OS !== 'web') {
    if (preference === 'multiple_times_daily') {
      await cancelCheckInReminderSlot(upcoming.slot);
    } else {
      await Notifications.cancelScheduledNotificationAsync(CHECK_IN_REMINDER_NOTIFICATION_ID);
    }
  }

  await syncCheckInReminderSchedule({ preference });
}
