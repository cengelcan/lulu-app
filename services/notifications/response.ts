import type { Href } from 'expo-router';
import { Platform } from 'react-native';

import { CHECK_IN_ROUTE } from '@/services/notifications/constants';
import { getExpoNotificationsModule } from '@/services/notifications/expo-notifications-module';

type NotificationResponse = {
  notification: {
    request: {
      content: {
        data: unknown;
      };
    };
  };
};

function isHref(value: unknown): value is Href {
  return typeof value === 'string' && value.startsWith('/');
}

export function getRouteFromNotificationResponse(
  response: NotificationResponse | null | undefined
): Href | null {
  if (!response) {
    return null;
  }

  const data = response.notification.request.content.data as { route?: unknown } | null | undefined;

  if (isHref(data?.route)) {
    return data.route;
  }

  return CHECK_IN_ROUTE;
}

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
