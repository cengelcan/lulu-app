import * as Notifications from 'expo-notifications';
import { useRouter, useRootNavigationState } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { getRouteFromNotificationResponse } from '@/services/notifications/response';

export function useNotificationResponse(): void {
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const isNavigationReady = Boolean(navigationState?.key);

  useEffect(() => {
    if (Platform.OS === 'web' || !isNavigationReady) {
      return;
    }

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const route = getRouteFromNotificationResponse(response);

      if (route) {
        router.push(route);
      }
    });

    return () => subscription.remove();
  }, [isNavigationReady, router]);
}
