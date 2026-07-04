import { useCallback, useState } from 'react';

import {
  fetchActivityEvents,
  fetchActorDisplayNames,
} from '@/services/sharing/activity-events-sync';
import { getDismissedInboxItemIds } from '@/storage/inbox-dismissed.storage';
import * as checkInStorage from '@/storage/check-in.storage';
import * as petReminderStorage from '@/storage/pet-reminder.storage';
import * as petStorage from '@/storage/pet.storage';
import { getNotificationPermission } from '@/storage/prefs.storage';
import { useUserStore } from '@/stores/user.store';
import type { InboxSection } from '@/types/inbox';
import type { ActivityEvent } from '@/types/sharing';
import {
  buildInboxItems,
  getActionRequiredCount,
} from '@/utils/inbox/build-inbox-items';
import { getLocaleTag } from '@/utils/locale';

import { useTranslation } from '@/hooks/use-translation';

type UseInboxResult = {
  sections: InboxSection[];
  actionRequiredCount: number;
  showPetName: boolean;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export function useInbox(): UseInboxResult {
  const { t, language } = useTranslation();
  const userId = useUserStore((state) => state.userId);
  const [sections, setSections] = useState<InboxSection[]>([]);
  const [actionRequiredCount, setActionRequiredCount] = useState(0);
  const [showPetName, setShowPetName] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [pets, checkIns, reminders, permission, dismissedIds] = await Promise.all([
        petStorage.getPets(),
        checkInStorage.getAllCheckIns(),
        petReminderStorage.getAllPetReminders(),
        getNotificationPermission(),
        getDismissedInboxItemIds(),
      ]);

      const petIds = pets.map((pet) => pet.id);
      let activityEvents: ActivityEvent[] = [];
      let actorDisplayNames = new Map<string, string | null>();

      if (userId && petIds.length > 0) {
        try {
          activityEvents = await fetchActivityEvents(petIds);
          const actorIds = activityEvents.map((event) => event.actorUserId);
          actorDisplayNames = await fetchActorDisplayNames(actorIds);
        } catch (activityError) {
          console.warn('Failed to load family activity events', activityError);
        }
      }

      const activePetCount = pets.filter((pet) => pet.status !== 'deceased').length;

      const nextSections = buildInboxItems({
        pets,
        checkIns,
        reminders,
        permission,
        dismissedIds,
        referenceDate: new Date(),
        locale: getLocaleTag(language),
        t,
        activityEvents,
        currentUserId: userId,
        actorDisplayNames,
      });

      setSections(nextSections);
      setActionRequiredCount(getActionRequiredCount(nextSections));
      setShowPetName(activePetCount > 1);
      setIsLoading(false);
    } catch (loadError) {
      setIsLoading(false);
      setError(loadError instanceof Error ? loadError.message : 'errors.loadInbox');
    }
  }, [language, t, userId]);

  return {
    sections,
    actionRequiredCount,
    showPetName,
    isLoading,
    error,
    refresh,
  };
}
