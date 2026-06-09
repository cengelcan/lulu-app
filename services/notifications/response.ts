import * as Notifications from 'expo-notifications';
import type { Href } from 'expo-router';
import { Platform } from 'react-native';

import { CHECK_IN_ROUTE } from '@/services/notifications/constants';

function isHref(value: unknown): value is Href {
  return typeof value === 'string' && value.startsWith('/');
}

export function getRouteFromNotificationResponse(
  response: Notifications.NotificationResponse | null | undefined
): Href | null {
  if (!response) {
    return null;
  }

  const data = response.notification.request.content.data;

  if (isHref(data?.route)) {
    return data.route;
  }

  return CHECK_IN_ROUTE;
}

export async function getNotificationLaunchRoute(): Promise<Href | null> {
  if (Platform.OS === 'web') {
    return null;
  }

  const response = await Notifications.getLastNotificationResponseAsync();
  const route = getRouteFromNotificationResponse(response);

  if (route) {
    await Notifications.clearLastNotificationResponseAsync();
  }

  return route;
}
