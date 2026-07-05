import { Platform } from 'react-native';

import {
  ALL_CHECK_IN_REMINDER_NOTIFICATION_IDS,
  ANDROID_CHECK_IN_CHANNEL_ID,
  CHECK_IN_NOTIFICATION_DATA,
  CHECK_IN_REMINDER_NOTIFICATION_ID_PREFIX,
  CHECK_IN_REMINDER_SCHEDULE_HORIZON_DAYS,
  CHECK_IN_REMINDER_SOUND,
  getCheckInReminderNotificationId,
} from '@/services/notifications/constants';
import {
  formatCheckInReminderDateKey,
} from '@/services/notifications/check-in-reminder-variants';
import { getCheckInReminderContentForDate } from '@/services/notifications/content';
import { getExpoNotificationsModule } from '@/services/notifications/expo-notifications-module';
import { resolvePetPhotoAttachment } from '@/services/notifications/pet-photo-attachment';
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

type CheckInSchedulePet = {
  id: string;
  name: string;
  photoUri?: string | null;
};

function buildUpcomingCheckInTriggerDates(
  reminderTime: ReminderTime,
  horizonDays: number
): Date[] {
  const { hour, minute } = reminderTime;
  const now = Date.now();
  const results: Date[] = [];

  for (let dayOffset = 0; results.length < horizonDays; dayOffset += 1) {
    const candidate = new Date();
    candidate.setHours(hour, minute, 0, 0);
    candidate.setDate(candidate.getDate() + dayOffset);

    if (candidate.getTime() > now) {
      results.push(candidate);
    }
  }

  return results;
}

async function cancelScheduledCheckInReminders(
  Notifications: ExpoNotificationsModule
): Promise<void> {
  await Promise.all(
    ALL_CHECK_IN_REMINDER_NOTIFICATION_IDS.map((identifier) =>
      Notifications.cancelScheduledNotificationAsync(identifier)
    )
  );

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();

  await Promise.all(
    scheduled
      .filter((notification: { identifier: string }) =>
        notification.identifier.startsWith(CHECK_IN_REMINDER_NOTIFICATION_ID_PREFIX)
      )
      .map((notification: { identifier: string }) =>
        Notifications.cancelScheduledNotificationAsync(notification.identifier)
      )
  );
}

export async function cancelCheckInReminder(): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  const Notifications = await getExpoNotificationsModule();
  if (!Notifications) {
    return;
  }

  await cancelScheduledCheckInReminders(Notifications);
}

async function scheduleCheckInReminders(
  Notifications: ExpoNotificationsModule,
  reminderTime: ReminderTime,
  pet: CheckInSchedulePet,
  language: Awaited<ReturnType<typeof getAppLanguage>>
): Promise<void> {
  const photoAttachment = await resolvePetPhotoAttachment(pet.photoUri);
  const triggerDates = buildUpcomingCheckInTriggerDates(
    reminderTime,
    CHECK_IN_REMINDER_SCHEDULE_HORIZON_DAYS
  );

  await Promise.all(
    triggerDates.map(async (triggerDate) => {
      const dateKey = formatCheckInReminderDateKey(triggerDate);
      const { title, body } = getCheckInReminderContentForDate(
        pet.name,
        pet.id,
        dateKey,
        language
      );

      await Notifications.scheduleNotificationAsync({
        identifier: getCheckInReminderNotificationId(dateKey),
        content: {
          title,
          body,
          sound: CHECK_IN_REMINDER_SOUND,
          data: { ...CHECK_IN_NOTIFICATION_DATA },
          ...(Platform.OS === 'android' ? { channelId: ANDROID_CHECK_IN_CHANNEL_ID } : {}),
          ...(Platform.OS === 'ios' && photoAttachment
            ? { attachments: [photoAttachment] }
            : {}),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate,
          ...(Platform.OS === 'android' ? { channelId: ANDROID_CHECK_IN_CHANNEL_ID } : {}),
        },
      });
    })
  );
}

export async function syncCheckInReminderSchedule(input?: {
  reminderTime?: ReminderTime | null;
  permission?: NotificationPermissionStatus | null;
  petName?: string | null;
  petId?: string | null;
  petPhotoUri?: string | null;
}): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  const [reminderTime, permission, activePet, language] = await Promise.all([
    input?.reminderTime !== undefined ? Promise.resolve(input.reminderTime) : getCheckInReminderTime(),
    input?.permission !== undefined ? Promise.resolve(input.permission) : getNotificationPermission(),
    getActivePet(),
    getAppLanguage(),
  ]);

  await cancelCheckInReminder();

  if (permission !== 'allowed') {
    return;
  }

  const schedulePet: CheckInSchedulePet | null = activePet
    ? {
        id: input?.petId ?? activePet.id,
        name: input?.petName ?? activePet.name,
        photoUri: input?.petPhotoUri ?? activePet.photoUri ?? null,
      }
    : input?.petName
      ? {
          id: input.petId ?? 'active-pet',
          name: input.petName,
          photoUri: input.petPhotoUri ?? null,
        }
      : null;

  if (!schedulePet?.name) {
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

  await scheduleCheckInReminders(Notifications, reminderTime, schedulePet, language);
}
