import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import {
  ANDROID_PET_REMINDER_CHANNEL_ID,
  getPetReminderNotificationId,
  isPetReminderNotificationId,
  PET_REMINDER_REMINDER_SOUND,
} from '@/services/notifications/constants';
import { getPetReminderNotificationContent } from '@/services/notifications/content';
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

function buildReminderTrigger(
  reminder: PetReminder
): Notifications.SchedulableNotificationTriggerInput | null {
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

async function schedulePetReminderNotification(
  reminder: PetReminder,
  petName: string,
  language: Awaited<ReturnType<typeof getAppLanguage>>
): Promise<void> {
  const trigger = buildReminderTrigger(reminder);
  if (!trigger) {
    return;
  }

  const { title, body } = getPetReminderNotificationContent(reminder, petName, language);
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
    },
    trigger,
  });
}

export async function cancelAllPetReminderNotifications(): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();

  await Promise.all(
    scheduled
      .filter((notification) => isPetReminderNotificationId(notification.identifier))
      .map((notification) =>
        Notifications.cancelScheduledNotificationAsync(notification.identifier)
      )
  );
}

export async function cancelPetReminderNotification(reminderId: string): Promise<void> {
  if (Platform.OS === 'web') {
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

  const pendingReminders = await petReminderStorage.getPendingPetRemindersByPetId(pet.id);

  await Promise.all(
    pendingReminders.map((reminder) => schedulePetReminderNotification(reminder, pet.name, language))
  );
}
