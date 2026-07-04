import { useCallback, useState } from 'react';

import { getDismissedInboxItemIds } from '@/storage/inbox-dismissed.storage';
import * as checkInStorage from '@/storage/check-in.storage';
import * as petReminderStorage from '@/storage/pet-reminder.storage';
import * as petStorage from '@/storage/pet.storage';
import { getNotificationPermission } from '@/storage/prefs.storage';
import type { InboxSection } from '@/types/inbox';
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
      });

      setSections(nextSections);
      setActionRequiredCount(getActionRequiredCount(nextSections));
      setShowPetName(activePetCount > 1);
      setIsLoading(false);
    } catch (loadError) {
      setIsLoading(false);
      setError(loadError instanceof Error ? loadError.message : 'errors.loadInbox');
    }
  }, [language, t]);

  return {
    sections,
    actionRequiredCount,
    showPetName,
    isLoading,
    error,
    refresh,
  };
}
