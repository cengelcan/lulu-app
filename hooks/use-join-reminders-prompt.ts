import { useCallback, useEffect, useState } from 'react';

import {
  dismissJoinRemindersPrompt,
  isJoinRemindersPromptDismissed,
  isJoinRemindersPromptPending,
} from '@/storage/join-reminders-prompt.storage';
import { getNotificationPermission } from '@/storage/prefs.storage';

export function useJoinRemindersPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);

    try {
      const [pending, dismissed, permission] = await Promise.all([
        isJoinRemindersPromptPending(),
        isJoinRemindersPromptDismissed(),
        getNotificationPermission(),
      ]);

      setIsVisible(pending && !dismissed && permission !== 'allowed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const dismiss = useCallback(async () => {
    await dismissJoinRemindersPrompt();
    setIsVisible(false);
  }, []);

  return { isVisible, isLoading, dismiss, refresh };
}
