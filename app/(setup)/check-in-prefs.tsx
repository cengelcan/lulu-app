import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { SetupScreen } from '@/components/setup/setup-screen';
import { TimePickerField } from '@/components/ui/TimePickerField';
import { useSetupScreenBack } from '@/hooks/use-setup-screen-back';
import { useNotificationStore } from '@/stores/notification.store';
import { DEFAULT_REMINDER_TIME, type ReminderTime } from '@/types/reminder';

export default function CheckInPrefsScreen() {
  const router = useRouter();
  const { onBack } = useSetupScreenBack(6, 'initial');
  const savedReminderTime = useNotificationStore((state) => state.reminderTime);
  const saveReminderTime = useNotificationStore((state) => state.saveReminderTime);
  const loadNotificationSettings = useNotificationStore((state) => state.loadNotificationSettings);
  const isLoading = useNotificationStore((state) => state.isLoading);
  const storeError = useNotificationStore((state) => state.error);
  const clearError = useNotificationStore((state) => state.clearError);

  const [reminderTime, setReminderTime] = useState<ReminderTime>(
    savedReminderTime ?? DEFAULT_REMINDER_TIME
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadNotificationSettings();
  }, [loadNotificationSettings]);

  useEffect(() => {
    if (savedReminderTime) {
      setReminderTime(savedReminderTime);
    }
  }, [savedReminderTime]);

  const handleContinue = useCallback(async () => {
    clearError();
    setError(null);

    try {
      await saveReminderTime(reminderTime);

      if (useNotificationStore.getState().error) {
        return;
      }

      router.push('/(setup)/notification-permission');
    } catch {
      // Store sets error state.
    }
  }, [clearError, reminderTime, router, saveReminderTime]);

  return (
    <SetupScreen
      step={6}
      title="When should we remind you?"
      description="Choose your preferred daily reminder time."
      onContinue={() => void handleContinue()}
      onBack={onBack}
      isLoading={isLoading}
      error={error ?? storeError}>
      <TimePickerField
        accessibilityLabel="Reminder time"
        value={reminderTime}
        onChange={setReminderTime}
      />
    </SetupScreen>
  );
}
