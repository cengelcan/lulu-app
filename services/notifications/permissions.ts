import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import {
  ANDROID_CHECK_IN_CHANNEL_ID,
  ANDROID_PET_REMINDER_CHANNEL_ID,
  CHECK_IN_REMINDER_SOUND,
  PET_REMINDER_REMINDER_SOUND,
} from '@/services/notifications/constants';

export { resolveStoredNotificationPermission } from '@/services/notifications/permission-status';

export async function ensureAndroidNotificationChannels(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync(ANDROID_CHECK_IN_CHANNEL_ID, {
    name: 'Check-in reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: CHECK_IN_REMINDER_SOUND,
  });

  await Notifications.setNotificationChannelAsync(ANDROID_PET_REMINDER_CHANNEL_ID, {
    name: 'Pet reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: PET_REMINDER_REMINDER_SOUND,
  });
}

/** @deprecated Use ensureAndroidNotificationChannels */
export async function ensureAndroidNotificationChannel(): Promise<void> {
  await ensureAndroidNotificationChannels();
}

export async function hasNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }

  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }

  await ensureAndroidNotificationChannels();

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === 'granted') {
    return true;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}
