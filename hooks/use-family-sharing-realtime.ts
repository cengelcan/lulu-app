import { useEffect, useRef } from 'react';

import { supabase } from '@/lib/supabase';
import { waitForBootstrap } from '@/services/bootstrap/bootstrap-gate';
import {
  fromRemoteActivityEventRow,
  type RemoteActivityEventRow,
} from '@/services/sharing/activity-events-sync';
import { useFamilyActivityStore } from '@/stores/family-activity.store';
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
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'medication_plans' },
        scheduleRefresh
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'medication_schedules' },
        scheduleRefresh
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'medication_doses' },
        scheduleRefresh
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'medication_inventory' },
        scheduleRefresh
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'activity_events' },
        (payload) => {
          const row = payload.new as RemoteActivityEventRow;
          void useFamilyActivityStore
            .getState()
            .mergeRealtimeEvent(fromRemoteActivityEventRow(row));
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
