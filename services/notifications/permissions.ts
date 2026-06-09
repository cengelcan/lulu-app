import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { ANDROID_CHECK_IN_CHANNEL_ID } from '@/services/notifications/constants';

export async function ensureAndroidNotificationChannel(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync(ANDROID_CHECK_IN_CHANNEL_ID, {
    name: 'Check-in reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
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

  await ensureAndroidNotificationChannel();

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === 'granted') {
    return true;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}
