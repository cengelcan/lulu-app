import { Platform } from 'react-native';

import { getExpoNotificationsModule } from '@/services/notifications/expo-notifications-module';

let notificationHandlerConfigured = false;

/** Configure lazily — calling setNotificationHandler at cold start can crash on iOS 26. */
export async function ensureNotificationHandlerConfigured(): Promise<void> {
  if (notificationHandlerConfigured || Platform.OS === 'web') {
    return;
  }

  try {
    const Notifications = await getExpoNotificationsModule();
    if (!Notifications) {
      return;
    }

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    notificationHandlerConfigured = true;
  } catch (error) {
    console.warn('[notifications] Failed to configure notification handler', error);
  }
}

/** @deprecated Use ensureNotificationHandlerConfigured — kept for existing imports. */
export const configureNotificationHandler = ensureNotificationHandlerConfigured;
