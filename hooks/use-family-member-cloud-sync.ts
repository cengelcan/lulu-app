import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

import { waitForBootstrap } from '@/services/bootstrap/bootstrap-gate';
import { useSharingStore } from '@/stores/sharing.store';
import { useUserStore } from '@/stores/user.store';

/**
 * Pulls shared pet care data from the cloud when a family participant returns
 * to the app. Covers both members (shared pets) and owners (active family group
 * with shared pets) so cross-device updates appear without a full restart.
 */
export function useFamilyMemberCloudSync() {
  const authStatus = useUserStore((state) => state.authStatus);
  const refreshSharedDataFromCloud = useSharingStore((state) => state.refreshSharedDataFromCloud);
  const isRefreshing = useRef(false);

  useEffect(() => {
    if (authStatus !== 'authenticated') {
      return;
    }

    const refresh = async () => {
      await waitForBootstrap();

      if (isRefreshing.current) {
        return;
      }

      isRefreshing.current = true;
      try {
        await refreshSharedDataFromCloud();
      } catch (error) {
        console.warn('Failed to refresh shared pet data from cloud', error);
      } finally {
        isRefreshing.current = false;
      }
    };

    void refresh();

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void refresh();
      }
    });

    return () => subscription.remove();
  }, [authStatus, refreshSharedDataFromCloud]);
}
