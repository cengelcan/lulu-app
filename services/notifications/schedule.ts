import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import {
  ALL_CHECK_IN_REMINDER_NOTIFICATION_IDS,
  ANDROID_CHECK_IN_CHANNEL_ID,
  CHECK_IN_NOTIFICATION_DATA,
  CHECK_IN_REMINDER_NOTIFICATION_ID,
  CHECK_IN_REMINDER_SCHEDULE,
  CHECK_IN_REMINDER_SLOT_IDS,
  isNotificationSchedulablePreference,
  isSchedulableCheckInPreference,
  MULTIPLE_TIMES_DAILY_SLOTS,
  type SchedulableCheckInPreference,
} from '@/services/notifications/constants';
import { getCheckInReminderContent } from '@/services/notifications/content';
import { hasNotificationPermission } from '@/services/notifications/permissions';
import { getPet } from '@/storage/pet.storage';
import {
  getCheckInPreferences,
  getNotificationPermission,
  type NotificationPermissionStatus,
} from '@/storage/prefs.storage';
import type { CheckInPreference } from '@/types/check-in';

export async function cancelCheckInReminder(): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  await Promise.all(
    ALL_CHECK_IN_REMINDER_NOTIFICATION_IDS.map((identifier) =>
      Notifications.cancelScheduledNotificationAsync(identifier)
    )
  );
}

async function scheduleDailyCheckInReminder(
  slot: SchedulableCheckInPreference,
  petName: string,
  identifier: string
): Promise<void> {
  const { hour, minute } = CHECK_IN_REMINDER_SCHEDULE[slot];
  const { title, body } = getCheckInReminderContent(slot, petName);

  await Notifications.scheduleNotificationAsync({
    identifier,
    content: {
      title,
      body,
      sound: true,
      data: { ...CHECK_IN_NOTIFICATION_DATA },
      ...(Platform.OS === 'android' ? { channelId: ANDROID_CHECK_IN_CHANNEL_ID } : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      ...(Platform.OS === 'android' ? { channelId: ANDROID_CHECK_IN_CHANNEL_ID } : {}),
    },
  });
}

export async function syncCheckInReminderSchedule(input?: {
  preference?: CheckInPreference | null;
  permission?: NotificationPermissionStatus | null;
  petName?: string | null;
}): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  const [preference, permission, pet] = await Promise.all([
    input?.preference !== undefined ? Promise.resolve(input.preference) : getCheckInPreferences(),
    input?.permission !== undefined ? Promise.resolve(input.permission) : getNotificationPermission(),
    input?.petName !== undefined
      ? Promise.resolve(input.petName ? { name: input.petName } : null)
      : getPet(),
  ]);

  await cancelCheckInReminder();

  if (permission !== 'allowed' || !isNotificationSchedulablePreference(preference)) {
    return;
  }

  const petName = input?.petName ?? pet?.name ?? null;
  if (!petName) {
    return;
  }

  const osPermissionGranted = await hasNotificationPermission();
  if (!osPermissionGranted) {
    return;
  }

  if (preference === 'multiple_times_daily') {
    await Promise.all(
      MULTIPLE_TIMES_DAILY_SLOTS.map((slot) =>
        scheduleDailyCheckInReminder(slot, petName, CHECK_IN_REMINDER_SLOT_IDS[slot])
      )
    );
    return;
  }

  if (isSchedulableCheckInPreference(preference)) {
    await scheduleDailyCheckInReminder(preference, petName, CHECK_IN_REMINDER_NOTIFICATION_ID);
  }
}
