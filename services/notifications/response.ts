import type { Href } from 'expo-router';
import { Platform } from 'react-native';

import { getExpoNotificationsModule } from '@/services/notifications/expo-notifications-module';
import { getRouteFromNotificationResponse } from '@/services/notifications/response-route';

export {
  getRouteFromNotificationResponse,
  normalizeNotificationRoute,
} from '@/services/notifications/response-route';

export async function getNotificationLaunchRoute(): Promise<Href | null> {
  if (Platform.OS === 'web') {
    return null;
  }

  try {
    const Notifications = await getExpoNotificationsModule();
    if (!Notifications) {
      return null;
    }

    const response = await Notifications.getLastNotificationResponseAsync();
    const route = getRouteFromNotificationResponse(response);

    if (route) {
      await Notifications.clearLastNotificationResponseAsync();
    }

    return route;
  } catch (error) {
    console.warn('[notifications] Failed to read launch notification route', error);
    return null;
  }
}
