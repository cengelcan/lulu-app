import { useEffect, useRef } from 'react';

import { supabase } from '@/lib/supabase';
import { waitForBootstrap } from '@/services/bootstrap/bootstrap-gate';
import { useSharingStore } from '@/stores/sharing.store';
import { useUserStore } from '@/stores/user.store';

const DEBOUNCE_MS = 400;

/**
 * Subscribes to family membership and reminder changes over Supabase Realtime.
 * RLS ensures users only receive rows for pets they can access. Debounced pulls
 * refresh the local cache and rebuild this device's notification schedule.
 */
export function useFamilySharingRealtime() {
  const authStatus = useUserStore((state) => state.authStatus);
  const userId = useUserStore((state) => state.userId);
  const handleSharingRealtimeUpdate = useSharingStore((state) => state.handleSharingRealtimeUpdate);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRefreshing = useRef(false);

  useEffect(() => {
    if (authStatus !== 'authenticated' || !userId) {
      return;
    }

    const scheduleRefresh = () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        void (async () => {
          await waitForBootstrap();

          if (isRefreshing.current) {
            return;
          }

          isRefreshing.current = true;
          try {
            await handleSharingRealtimeUpdate();
          } catch (error) {
            console.warn('Failed to apply family sharing realtime update', error);
          } finally {
            isRefreshing.current = false;
          }
        })();
      }, DEBOUNCE_MS);
    };

    const channel = supabase
      .channel(`family-care:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pet_memberships',
        },
        () => {
          scheduleRefresh();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pet_reminders',
        },
        () => {
          scheduleRefresh();
        }
      )
      .subscribe();

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      void supabase.removeChannel(channel);
    };
  }, [authStatus, handleSharingRealtimeUpdate, userId]);
}
