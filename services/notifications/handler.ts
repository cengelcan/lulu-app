import { Platform } from 'react-native';

import { getExpoNotificationsModule } from '@/services/notifications/expo-notifications-module';

export async function configureNotificationHandler(): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

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
}
