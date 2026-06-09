import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { ANDROID_CHECK_IN_CHANNEL_ID } from '@/services/notifications/constants';
import { ensureAndroidNotificationChannel } from '@/services/notifications/permissions';

const DEV_TEST_REMINDER_NOTIFICATION_ID = 'dev-test-check-in-reminder';
const DEV_TEST_REMINDER_DELAY_SECONDS = 10;

export const DEV_TEST_REMINDER_BODY =
  "Complete today's check-in in less than 10 seconds.";

export function getDevTestReminderTitle(petName: string): string {
  return `How is ${petName} today?`;
}

export type DevTestReminderResult = {
  success: boolean;
  message: string;
};

export async function scheduleDevTestReminder(
  petName: string
): Promise<DevTestReminderResult> {
  if (!__DEV__ || Platform.OS === 'web') {
    return { success: false, message: 'Test reminders are only available in dev builds.' };
  }

  try {
    const permissionStatus = await Notifications.getPermissionsAsync();
    console.log('[dev-test-reminder] permission status:', permissionStatus);

    if (permissionStatus.status !== 'granted') {
      const requestedPermission = await Notifications.requestPermissionsAsync();
      console.log('[dev-test-reminder] permission request result:', requestedPermission);

      if (requestedPermission.status !== 'granted') {
        return { success: false, message: 'Notification permission denied.' };
      }
    }

    await ensureAndroidNotificationChannel();

    await Notifications.cancelScheduledNotificationAsync(DEV_TEST_REMINDER_NOTIFICATION_ID);

    const notificationId = await Notifications.scheduleNotificationAsync({
      identifier: DEV_TEST_REMINDER_NOTIFICATION_ID,
      content: {
        title: getDevTestReminderTitle(petName),
        body: DEV_TEST_REMINDER_BODY,
        sound: true,
        data: { route: '/check-in' },
        ...(Platform.OS === 'android' ? { channelId: ANDROID_CHECK_IN_CHANNEL_ID } : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: DEV_TEST_REMINDER_DELAY_SECONDS,
        repeats: false,
      },
    });

    console.log('[dev-test-reminder] scheduled notification id:', notificationId);

    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    console.log('[dev-test-reminder] scheduled notifications:', scheduledNotifications);

    return { success: true, message: 'Test reminder scheduled' };
  } catch (error) {
    console.error('[dev-test-reminder] failed to schedule notification:', error);

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to schedule test reminder.',
    };
  }
}
