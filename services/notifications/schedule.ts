import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import {
  ANDROID_CHECK_IN_CHANNEL_ID,
  CHECK_IN_REMINDER_NOTIFICATION_ID,
  CHECK_IN_REMINDER_SCHEDULE,
  isSchedulableCheckInPreference,
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

  await Notifications.cancelScheduledNotificationAsync(CHECK_IN_REMINDER_NOTIFICATION_ID);
}

async function scheduleDailyCheckInReminder(
  preference: SchedulableCheckInPreference,
  petName: string
): Promise<void> {
  const { hour, minute } = CHECK_IN_REMINDER_SCHEDULE[preference];
  const { title, body } = getCheckInReminderContent(preference, petName);

  await Notifications.scheduleNotificationAsync({
    identifier: CHECK_IN_REMINDER_NOTIFICATION_ID,
    content: {
      title,
      body,
      sound: true,
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

  if (permission !== 'allowed' || !isSchedulableCheckInPreference(preference)) {
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

  await scheduleDailyCheckInReminder(preference, petName);
}
