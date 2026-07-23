import { create } from 'zustand';

import {
  fetchActivityEventPage,
  fetchActorDisplayNames,
} from '@/services/sharing/activity-events-sync';
import * as activityEventStorage from '@/storage/activity-event.storage';
import * as petStorage from '@/storage/pet.storage';
import {
  getFamilyActivityLastReadAt,
  setFamilyActivityLastReadAt,
} from '@/storage/prefs.storage';
import { useUserStore } from '@/stores/user.store';
import type {
  ActivityEvent,
  ActivityEventCursor,
} from '@/types/sharing';
import { mergeFamilyActivityEvents } from '@/utils/family-activity';

type FamilyActivityState = {
  events: ActivityEvent[];
  actorDisplayNames: Map<string, string | null>;
  nextCursor: ActivityEventCursor | null;
  isLoading: boolean;
  isLoadingMore: boolean;
  isOffline: boolean;
  lastReadAt: string | null;
  error: string | null;
  loadInitial: () => Promise<void>;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  mergeRealtimeEvent: (event: ActivityEvent) => Promise<void>;
  markRead: () => Promise<void>;
  clear: () => void;
};

async function loadActorNames(
  events: ActivityEvent[],
  current: Map<string, string | null>
): Promise<Map<string, string | null>> {
  const missingIds = events
    .map((event) => event.actorUserId)
    .filter((id) => !current.has(id));
  if (missingIds.length === 0) return current;
  const fetched = await fetchActorDisplayNames(missingIds);
  return new Map([...current, ...fetched]);
}

async function getAccessiblePetIds(): Promise<string[]> {
  return (await petStorage.getPets()).map((pet) => pet.id);
}

export const useFamilyActivityStore = create<FamilyActivityState>((set, get) => ({
  events: [],
  actorDisplayNames: new Map(),
  nextCursor: null,
  isLoading: false,
  isLoadingMore: false,
  isOffline: false,
  lastReadAt: null,
  error: null,

  loadInitial: async () => {
    set({ isLoading: true, error: null });
    const petIds = await getAccessiblePetIds();
    await activityEventStorage.deleteActivityEventsOutsidePets(petIds);
    const cached = await activityEventStorage.getCachedActivityEvents();
    const userId = useUserStore.getState().userId;
    const lastReadAt = userId ? await getFamilyActivityLastReadAt(userId) : null;
    if (cached.length > 0) set({ events: cached, lastReadAt });
    else set({ lastReadAt });
    await get().refresh();
  },

  refresh: async () => {
    set({ isLoading: get().events.length === 0, error: null });
    try {
      const petIds = await getAccessiblePetIds();
      await activityEventStorage.deleteActivityEventsOutsidePets(petIds);
      const page = await fetchActivityEventPage(petIds);
      await activityEventStorage.upsertActivityEvents(page.events);
      const actorDisplayNames = await loadActorNames(
        page.events,
        get().actorDisplayNames
      );
      set({
        events: page.events,
        actorDisplayNames,
        nextCursor: page.nextCursor,
        isLoading: false,
        isOffline: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        isOffline: get().events.length > 0,
        error: get().events.length > 0
          ? null
          : error instanceof Error ? error.message : 'errors.loadFamilyActivity',
      });
    }
  },

  loadMore: async () => {
    const cursor = get().nextCursor;
    if (!cursor || get().isLoadingMore) return;
    set({ isLoadingMore: true, error: null });
    try {
      const page = await fetchActivityEventPage(await getAccessiblePetIds(), cursor);
      await activityEventStorage.upsertActivityEvents(page.events);
      const events = mergeFamilyActivityEvents(get().events, page.events);
      const actorDisplayNames = await loadActorNames(events, get().actorDisplayNames);
      set({
        events,
        actorDisplayNames,
        nextCursor: page.nextCursor,
        isLoadingMore: false,
        isOffline: false,
      });
    } catch (error) {
      set({
        isLoadingMore: false,
        isOffline: true,
        error: error instanceof Error ? error.message : 'errors.loadFamilyActivity',
      });
    }
  },

  mergeRealtimeEvent: async (event) => {
    await activityEventStorage.upsertActivityEvents([event]);
    const events = mergeFamilyActivityEvents(get().events, [event]);
    let actorDisplayNames = get().actorDisplayNames;
    try {
      actorDisplayNames = await loadActorNames([event], actorDisplayNames);
    } catch {
      // The event remains useful with the generic actor fallback.
    }
    set({ events, actorDisplayNames });
  },

  markRead: async () => {
    const userId = useUserStore.getState().userId;
    const latest = get().events[0]?.occurredAt;
    if (!userId || !latest) return;
    await setFamilyActivityLastReadAt(userId, latest);
    set({ lastReadAt: latest });
  },

  clear: () => set({
    events: [],
    actorDisplayNames: new Map(),
    nextCursor: null,
    isLoading: false,
    isLoadingMore: false,
    isOffline: false,
    lastReadAt: null,
    error: null,
  }),
}));
