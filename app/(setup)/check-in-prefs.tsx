import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

import { SelectableOption } from '@/components/setup/selectable-option';
import { SetupScreen } from '@/components/setup/setup-screen';
import { CHECK_IN_PREFERENCE_OPTIONS } from '@/constants/check-in';
import { useNotificationStore } from '@/stores/notification.store';
import type { CheckInPreference } from '@/types/check-in';

export default function CheckInPrefsScreen() {
  const router = useRouter();
  const savePreference = useNotificationStore((state) => state.savePreference);
  const isLoading = useNotificationStore((state) => state.isLoading);
  const storeError = useNotificationStore((state) => state.error);
  const clearError = useNotificationStore((state) => state.clearError);

  const [preference, setPreference] = useState<CheckInPreference | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = useCallback(async () => {
    if (!preference) {
      setError('Please select a check-in preference');
      return;
    }

    clearError();
    setError(null);

    try {
      await savePreference(preference);

      if (useNotificationStore.getState().error) {
        return;
      }

      router.push('/(setup)/notification-permission');
    } catch {
      // Store sets error state.
    }
  }, [clearError, preference, router, savePreference]);

  return (
    <SetupScreen
      step={5}
      title="When should we remind you?"
      description="Choose your preferred check-in time."
      onContinue={() => void handleContinue()}
      continueDisabled={!preference}
      isLoading={isLoading}
      error={error ?? storeError}>
      {CHECK_IN_PREFERENCE_OPTIONS.map((option) => (
        <SelectableOption
          key={option.value}
          label={option.label}
          selected={preference === option.value}
          onPress={() => {
            setError(null);
            clearError();
            setPreference(option.value);
          }}
        />
      ))}
    </SetupScreen>
  );
}
