import type { Href } from 'expo-router';

import { CHECK_IN_ROUTE } from '@/services/notifications/constants';

type NotificationResponse = {
  notification: {
    request: {
      content: {
        data: unknown;
      };
    };
  };
};

const SAFE_NOTIFICATION_ROUTE_PREFIXES = [
  '/check-in',
  '/records',
  '/reminders',
] as const;

const SAFE_NOTIFICATION_TAB_ROUTES = new Set([
  '/(tabs)/home',
  '/(tabs)/care',
  '/(tabs)/my-pets',
  '/(tabs)/profile',
  '/(tabs)/family',
]);

export const NOTIFICATION_ORIGIN_PARAM = 'fromNotification';

function markNotificationRoute(route: Href): Href {
  const value = String(route);
  const [pathAndQuery, hash] = value.split('#', 2);
  const separator = pathAndQuery.includes('?') ? '&' : '?';
  const markedRoute = `${pathAndQuery}${separator}${NOTIFICATION_ORIGIN_PARAM}=1${
    hash ? `#${hash}` : ''
  }`;

  return markedRoute as Href;
}

export function normalizeNotificationRoute(value: unknown): Href | null {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) {
    return null;
  }

  const [path] = value.split(/[?#]/, 1);
  if (!path || path.includes('..')) {
    return null;
  }

  if (path === '/family-sharing') {
    return '/(tabs)/family' as Href;
  }

  if (SAFE_NOTIFICATION_TAB_ROUTES.has(path)) {
    return value as Href;
  }

  const isSafeFeatureRoute = SAFE_NOTIFICATION_ROUTE_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`)
  );

  return isSafeFeatureRoute ? (value as Href) : null;
}

export function getRouteFromNotificationResponse(
  response: NotificationResponse | null | undefined
): Href | null {
  if (!response) {
    return null;
  }

  const data = response.notification.request.content.data as { route?: unknown } | null | undefined;
  const route = normalizeNotificationRoute(data?.route);

  return markNotificationRoute(route ?? CHECK_IN_ROUTE);
}
