import { Platform } from 'react-native';

import {
  ALL_CHECK_IN_REMINDER_NOTIFICATION_IDS,
  ANDROID_CHECK_IN_CHANNEL_ID,
  CHECK_IN_NOTIFICATION_DATA,
  CHECK_IN_REMINDER_NOTIFICATION_ID,
  CHECK_IN_REMINDER_SOUND,
} from '@/services/notifications/constants';
import { getCheckInReminderContent } from '@/services/notifications/content';
import { getExpoNotificationsModule } from '@/services/notifications/expo-notifications-module';
import { hasNotificationPermission } from '@/services/notifications/permissions';
import { getActivePet } from '@/storage/pet.storage';
import {
  getCheckInReminderTime,
  getAppLanguage,
  getNotificationPermission,
  type NotificationPermissionStatus,
} from '@/storage/prefs.storage';
import type { ReminderTime } from '@/types/reminder';

type ExpoNotificationsModule = NonNullable<
  Awaited<ReturnType<typeof getExpoNotificationsModule>>
>;

export async function cancelCheckInReminder(): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  const Notifications = await getExpoNotificationsModule();
  if (!Notifications) {
    return;
  }

  await Promise.all(
    ALL_CHECK_IN_REMINDER_NOTIFICATION_IDS.map((identifier) =>
      Notifications.cancelScheduledNotificationAsync(identifier)
    )
  );
}

async function scheduleDailyCheckInReminder(
  Notifications: ExpoNotificationsModule,
  reminderTime: ReminderTime,
  petName: string,
  language: Awaited<ReturnType<typeof getAppLanguage>>
): Promise<void> {
  const { hour, minute } = reminderTime;
  const { title, body } = getCheckInReminderContent(petName, language);

  await Notifications.scheduleNotificationAsync({
    identifier: CHECK_IN_REMINDER_NOTIFICATION_ID,
    content: {
      title,
      body,
      sound: CHECK_IN_REMINDER_SOUND,
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

  const [reminderTime, permission, pet, language] = await Promise.all([
    input?.reminderTime !== undefined ? Promise.resolve(input.reminderTime) : getCheckInReminderTime(),
    input?.permission !== undefined ? Promise.resolve(input.permission) : getNotificationPermission(),
    input?.petName !== undefined
      ? Promise.resolve(input.petName ? { name: input.petName } : null)
      : getActivePet(),
    getAppLanguage(),
  ]);

  await cancelCheckInReminder();

  if (permission !== 'allowed') {
    return;
  }

  const petName = input?.petName ?? pet?.name ?? null;
  if (!petName) {
    return;
  }

  if (!reminderTime) {
    return;
  }

  const osPermissionGranted = await hasNotificationPermission();
  if (!osPermissionGranted) {
    return;
  }

  const Notifications = await getExpoNotificationsModule();
  if (!Notifications) {
    return;
  }

  await scheduleDailyCheckInReminder(Notifications, reminderTime, petName, language);
}
