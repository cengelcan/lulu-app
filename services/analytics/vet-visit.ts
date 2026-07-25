import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/stores/user.store';

export type VetVisitAnalyticsEvent =
  | 'workspace_opened'
  | 'visit_created'
  | 'visit_started'
  | 'visit_completed'
  | 'follow_up_created'
  | 'paywall_opened';

export type VetVisitAnalyticsSource = 'care' | 'list' | 'form' | 'live' | 'outcome';

function createEventId(): string {
  return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/** Privacy-safe instrumentation: never accepts pet IDs, visit IDs, notes, or medical text. */
export async function trackVetVisitEvent(
  eventName: VetVisitAnalyticsEvent,
  source: VetVisitAnalyticsSource,
  followUpType?: 'reminder' | 'medication'
): Promise<void> {
  const userId = useUserStore.getState().userId;
  if (!userId) return;

  const { error } = await supabase.from('vet_visit_analytics_events').insert({
    id: createEventId(),
    user_id: userId,
    event_name: eventName,
    source,
    follow_up_type: followUpType ?? null,
    occurred_at: new Date().toISOString(),
  });

  if (error && __DEV__) {
    console.warn('Vet Visit analytics event was not delivered', error.message);
  }
}
