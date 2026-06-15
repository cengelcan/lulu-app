import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import {
  ALL_CHECK_IN_REMINDER_NOTIFICATION_IDS,
  ANDROID_CHECK_IN_CHANNEL_ID,
  CHECK_IN_NOTIFICATION_DATA,
  CHECK_IN_REMINDER_NOTIFICATION_ID,
} from '@/services/notifications/constants';
import { getCheckInReminderContent } from '@/services/notifications/content';
import { hasNotificationPermission } from '@/services/notifications/permissions';
import { getActivePet } from '@/storage/pet.storage';
import {
  getCheckInReminderTime,
  getNotificationPermission,
  type NotificationPermissionStatus,
} from '@/storage/prefs.storage';
import type { ReminderTime } from '@/types/reminder';

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
  reminderTime: ReminderTime,
  petName: string
): Promise<void> {
  const { hour, minute } = reminderTime;
  const { title, body } = getCheckInReminderContent(petName);

  await Notifications.scheduleNotificationAsync({
    identifier: CHECK_IN_REMINDER_NOTIFICATION_ID,
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
  reminderTime?: ReminderTime | null;
  permission?: NotificationPermissionStatus | null;
  petName?: string | null;
}): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  const [reminderTime, permission, pet] = await Promise.all([
    input?.reminderTime !== undefined ? Promise.resolve(input.reminderTime) : getCheckInReminderTime(),
    input?.permission !== undefined ? Promise.resolve(input.permission) : getNotificationPermission(),
    input?.petName !== undefined
      ? Promise.resolve(input.petName ? { name: input.petName } : null)
      : getActivePet(),
  ]);

  await cancelCheckInReminder();

  if (permission !== 'allowed') {
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

  await scheduleDailyCheckInReminder(reminderTime, petName);
}
