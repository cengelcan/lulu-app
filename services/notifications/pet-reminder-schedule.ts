import { Platform } from 'react-native';

import {
  ANDROID_PET_REMINDER_CHANNEL_ID,
  getPetReminderNotificationId,
  isPetReminderNotificationId,
  PET_REMINDER_REMINDER_SOUND,
} from '@/services/notifications/constants';
import { getPetReminderNotificationContent } from '@/services/notifications/content';
import { getExpoNotificationsModule } from '@/services/notifications/expo-notifications-module';
import { resolvePetPhotoAttachment } from '@/services/notifications/pet-photo-attachment';
import { hasNotificationPermission } from '@/services/notifications/permissions';
import { getActivePet } from '@/storage/pet.storage';
import * as petReminderStorage from '@/storage/pet-reminder.storage';
import {
  getAppLanguage,
  getPetReminderNotificationsEnabled,
} from '@/storage/prefs.storage';
import type { PetReminder } from '@/types/pet-reminder';
import { parseLocalDate } from '@/utils/date';
import { getReminderFormRoute } from '@/utils/pet-reminder-display';

type ExpoNotificationsModule = NonNullable<
  Awaited<ReturnType<typeof getExpoNotificationsModule>>
>;

function buildReminderTrigger(
  Notifications: ExpoNotificationsModule,
  reminder: PetReminder
): Record<string, unknown> | null {
  const parsed = parseLocalDate(reminder.dueDate);
  if (!parsed) {
    return null;
  }

  const triggerDate = new Date(parsed);
  triggerDate.setHours(reminder.dueTime.hour, reminder.dueTime.minute, 0, 0);

  if (triggerDate.getTime() <= Date.now()) {
    return null;
  }

  return {
    type: Notifications.SchedulableTriggerInputTypes.DATE,
    date: triggerDate,
    ...(Platform.OS === 'android' ? { channelId: ANDROID_PET_REMINDER_CHANNEL_ID } : {}),
  };
}

type SchedulePet = {
  name: string;
  photoUri?: string | null;
};

async function schedulePetReminderNotification(
  Notifications: ExpoNotificationsModule,
  reminder: PetReminder,
  pet: SchedulePet,
  language: Awaited<ReturnType<typeof getAppLanguage>>
): Promise<void> {
  const trigger = buildReminderTrigger(Notifications, reminder);
  if (!trigger) {
    return;
  }

  const photoAttachment = await resolvePetPhotoAttachment(pet.photoUri);
  const { title, body } = getPetReminderNotificationContent(reminder, pet.name, language);
  const route = getReminderFormRoute(reminder.type, reminder.id);

  await Notifications.scheduleNotificationAsync({
    identifier: getPetReminderNotificationId(reminder.id),
    content: {
      title,
      body,
      sound: PET_REMINDER_REMINDER_SOUND,
      data: {
        route,
        reminderId: reminder.id,
        type: 'pet_reminder',
      },
      ...(Platform.OS === 'android' ? { channelId: ANDROID_PET_REMINDER_CHANNEL_ID } : {}),
      ...(Platform.OS === 'ios' && photoAttachment ? { attachments: [photoAttachment] } : {}),
    },
    trigger,
  });
}

export async function cancelAllPetReminderNotifications(): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  const Notifications = await getExpoNotificationsModule();
  if (!Notifications) {
    return;
  }

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();

  await Promise.all(
    scheduled
      .filter((notification: { identifier: string }) =>
        isPetReminderNotificationId(notification.identifier)
      )
      .map((notification: { identifier: string }) =>
        Notifications.cancelScheduledNotificationAsync(notification.identifier)
      )
  );
}

export async function cancelPetReminderNotification(reminderId: string): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  const Notifications = await getExpoNotificationsModule();
  if (!Notifications) {
    return;
  }

  await Notifications.cancelScheduledNotificationAsync(getPetReminderNotificationId(reminderId));
}

export async function syncPetReminderNotificationSchedule(input?: {
  enabled?: boolean | null;
}): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  const [enabled, pet, language] = await Promise.all([
    input?.enabled !== undefined
      ? Promise.resolve(input.enabled)
      : getPetReminderNotificationsEnabled(),
    getActivePet(),
    getAppLanguage(),
  ]);

  await cancelAllPetReminderNotifications();

  if (!enabled) {
    return;
  }

  const osPermissionGranted = await hasNotificationPermission();
  if (!osPermissionGranted) {
    return;
  }

  if (!pet || pet.status === 'deceased') {
    return;
  }

  const Notifications = await getExpoNotificationsModule();
  if (!Notifications) {
    return;
  }

  const pendingReminders = await petReminderStorage.getPendingPetRemindersByPetId(pet.id);

  await Promise.all(
    pendingReminders.map((reminder) =>
      schedulePetReminderNotification(
        Notifications,
        reminder,
        { name: pet.name, photoUri: pet.photoUri },
        language
      )
    )
  );
}
