import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { CheckInReminderPicker } from '@/components/setup/CheckInReminderPicker';
import { SetupScreen } from '@/components/setup/setup-screen';
import { useTranslation } from '@/hooks/use-translation';
import { setupTotalSteps } from '@/hooks/use-setup-mode';
import { useSetupScreenBack } from '@/hooks/use-setup-screen-back';
import { useNotificationStore } from '@/stores/notification.store';
import { DEFAULT_REMINDER_TIME, type ReminderTime } from '@/types/reminder';

export default function CheckInPrefsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const totalSteps = setupTotalSteps('initial');
  const { onBack } = useSetupScreenBack(5, 'initial');
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
      step={5}
      totalSteps={totalSteps}
      title={t('setup.checkInPrefs.title')}
      description={t('setup.checkInPrefs.description')}
      onContinue={() => void handleContinue()}
      onBack={onBack}
      isLoading={isLoading}
      error={error ?? storeError}>
      <CheckInReminderPicker
        value={reminderTime}
        onChange={setReminderTime}
        disabled={isLoading}
        presetsTitle={t('setup.checkInPrefs.presetsTitle')}
        morningLabel={t('setup.checkInPrefs.morning')}
        afternoonLabel={t('setup.checkInPrefs.afternoon')}
        eveningLabel={t('setup.checkInPrefs.evening')}
        changeTimeLabel={t('setup.checkInPrefs.changeTime')}
        hint={t('setup.checkInPrefs.hint')}
        timeAccessibilityLabel={t('settings.reminderTime')}
      />
    </SetupScreen>
  );
}
