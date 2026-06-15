import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { SetupScreen } from '@/components/setup/setup-screen';
import { Button } from '@/components/ui/Button';
import { Spacing } from '@/constants/theme';
import { useTranslation } from '@/hooks/use-translation';
import { setupTotalSteps, useSetupMode } from '@/hooks/use-setup-mode';
import { useSetupScreenBack } from '@/hooks/use-setup-screen-back';
import {
  finalizeInitialModePet,
  validateSetupDraft,
} from '@/services/setup/finalize-pet-creation';
import { useNotificationStore } from '@/stores/notification.store';
import { usePetStore } from '@/stores/pet.store';
import { useSetupStore } from '@/stores/setup.store';
import type { NotificationPermissionStatus } from '@/storage/prefs.storage';
import { translateValidationError } from '@/utils/translate-error';

export default function NotificationPermissionScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const mode = useSetupMode();
  const totalSteps = setupTotalSteps(mode);
  const { onBack } = useSetupScreenBack(7, mode);

  const species = useSetupStore((state) => state.species);
  const breed = useSetupStore((state) => state.breed);
  const name = useSetupStore((state) => state.name);
  const ageGroup = useSetupStore((state) => state.ageGroup);
  const healthConditions = useSetupStore((state) => state.healthConditions);
  const resetDraft = useSetupStore((state) => state.resetDraft);

  const createPet = usePetStore((state) => state.createPet);
  const setActivePet = usePetStore((state) => state.setActivePet);
  const petIsLoading = usePetStore((state) => state.isLoading);
  const petError = usePetStore((state) => state.error);
  const clearPetError = usePetStore((state) => state.clearError);

  const savePermission = useNotificationStore((state) => state.savePermission);
  const notificationIsLoading = useNotificationStore((state) => state.isLoading);
  const notificationError = useNotificationStore((state) => state.error);
  const clearNotificationError = useNotificationStore((state) => state.clearError);

  const [validationError, setValidationError] = useState<string | null>(null);

  const isLoading = petIsLoading || notificationIsLoading;
  const error = translateValidationError(t, validationError) ?? petError ?? notificationError;

  const completeSetup = useCallback(
    async (permission: NotificationPermissionStatus) => {
      const draft = { species, breed, name, ageGroup, healthConditions };
      const draftError = validateSetupDraft(draft);

      if (draftError) {
        setValidationError(draftError);
        return;
      }

      setValidationError(null);
      clearPetError();
      clearNotificationError();

      try {
        await finalizeInitialModePet(draft, permission, {
          createPet,
          setActivePet,
          savePermission,
          resetDraft,
          router,
        });

        if (usePetStore.getState().error || useNotificationStore.getState().error) {
          return;
        }
      } catch {
        // Stores set error state.
      }
    },
    [
      ageGroup,
      breed,
      clearNotificationError,
      clearPetError,
      createPet,
      setActivePet,
      healthConditions,
      name,
      resetDraft,
      router,
      savePermission,
      species,
    ]
  );

  return (
    <SetupScreen
      step={7}
      totalSteps={totalSteps}
      title={t('setup.notifications.title')}
      description={t('setup.notifications.description')}
      onBack={onBack}
      error={error}
      footer={
        <View style={styles.actions}>
          <Button
            title={t('setup.notifications.allow')}
            disabled={isLoading}
            onPress={() => void completeSetup('allowed')}
          />
          <Button
            title={t('setup.notifications.maybeLater')}
            variant="ghost"
            disabled={isLoading}
            onPress={() => void completeSetup('later')}
          />
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
});
