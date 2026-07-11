import { useRouter, useRootNavigationState } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { waitForBootstrap } from '@/services/bootstrap/bootstrap-gate';
import { ensureNotificationHandlerConfigured } from '@/services/notifications/handler';
import { getExpoNotificationsModule } from '@/services/notifications/expo-notifications-module';
import { getRouteFromNotificationResponse } from '@/services/notifications/response';
import { isExpoGo } from '@/utils/is-expo-go';

export function useNotificationResponse(): void {
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const isNavigationReady = Boolean(navigationState?.key);

  useEffect(() => {
    if (Platform.OS === 'web' || !isNavigationReady || isExpoGo()) {
      return;
    }

    let subscription: { remove: () => void } | undefined;

    void (async () => {
      await waitForBootstrap();
      await ensureNotificationHandlerConfigured();

      const Notifications = await getExpoNotificationsModule();
      if (!Notifications) {
        return;
      }

      subscription = Notifications.addNotificationResponseReceivedListener(
        (response: Parameters<typeof getRouteFromNotificationResponse>[0]) => {
          const route = getRouteFromNotificationResponse(response);

          if (route) {
            router.push(route);
          }
        }
      );
    })();

    return () => {
      subscription?.remove();
    };
  }, [isNavigationReady, router]);
}
