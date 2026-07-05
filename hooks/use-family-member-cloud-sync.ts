import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

import { useSharingStore } from '@/stores/sharing.store';
import { useUserStore } from '@/stores/user.store';

/**
 * Pulls shared pets from the cloud when a family member returns to the app so
 * owner-side sharing changes show up without a full restart.
 */
export function useFamilyMemberCloudSync() {
  const authStatus = useUserStore((state) => state.authStatus);
  const refreshMemberPetsFromCloud = useSharingStore((state) => state.refreshMemberPetsFromCloud);
  const isRefreshing = useRef(false);

  useEffect(() => {
    if (authStatus !== 'authenticated') {
      return;
    }

    const refresh = () => {
      if (isRefreshing.current) {
        return;
      }

      isRefreshing.current = true;
      void refreshMemberPetsFromCloud()
        .catch((error) => {
          console.warn('Failed to refresh shared pets from cloud', error);
        })
        .finally(() => {
          isRefreshing.current = false;
        });
    };

    refresh();

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        refresh();
      }
    });

    return () => subscription.remove();
  }, [authStatus, refreshMemberPetsFromCloud]);
}
