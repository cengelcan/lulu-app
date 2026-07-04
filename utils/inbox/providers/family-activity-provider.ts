import type { InboxItem, InboxProvider } from '@/types/inbox';

/**
 * v2 — Family activity feed from `activity_events` (Supabase).
 * Returns an empty list until family sharing is implemented.
 */
export const buildFamilyActivityItems: InboxProvider = (): InboxItem[] => {
  return [];
};
