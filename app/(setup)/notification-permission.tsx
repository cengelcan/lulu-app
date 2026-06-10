import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { SetupScreen } from '@/components/setup/setup-screen';
import { Button } from '@/components/ui/Button';
import { Spacing } from '@/constants/theme';
import { syncCheckInReminderSchedule } from '@/services/notifications';
import { useNotificationStore } from '@/stores/notification.store';
import { usePetStore } from '@/stores/pet.store';
import {
  useSetupStore,
  validateAgeGroup,
  validatePetName,
  validateSpecies,
} from '@/stores/setup.store';
import type { NotificationPermissionStatus } from '@/storage/prefs.storage';

function createPetId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export default function NotificationPermissionScreen() {
  const router = useRouter();

  const species = useSetupStore((state) => state.species);
  const name = useSetupStore((state) => state.name);
  const ageGroup = useSetupStore((state) => state.ageGroup);
  const healthConditions = useSetupStore((state) => state.healthConditions);
  const resetDraft = useSetupStore((state) => state.resetDraft);

  const createPet = usePetStore((state) => state.createPet);
  const petIsLoading = usePetStore((state) => state.isLoading);
  const petError = usePetStore((state) => state.error);
  const clearPetError = usePetStore((state) => state.clearError);

  const savePermission = useNotificationStore((state) => state.savePermission);
  const notificationIsLoading = useNotificationStore((state) => state.isLoading);
  const notificationError = useNotificationStore((state) => state.error);
  const clearNotificationError = useNotificationStore((state) => state.clearError);

  const [validationError, setValidationError] = useState<string | null>(null);

  const isLoading = petIsLoading || notificationIsLoading;
  const error = validationError ?? petError ?? notificationError;

  const completeSetup = useCallback(
    async (permission: NotificationPermissionStatus) => {
      const nameError = validatePetName(name);
      const speciesError = validateSpecies(species);
      const ageGroupError = validateAgeGroup(ageGroup);

      const draftError = nameError ?? speciesError ?? ageGroupError;
      if (draftError) {
        setValidationError(draftError);
        return;
      }

      setValidationError(null);
      clearPetError();
      clearNotificationError();

      try {
        const resolvedPermission = await savePermission(permission);

        if (useNotificationStore.getState().error) {
          return;
        }

        await createPet({
          id: createPetId(),
          name: name.trim(),
          species: species!,
          ageGroup: ageGroup!,
          healthConditions: healthConditions.length > 0 ? healthConditions : ['none'],
          createdAt: new Date().toISOString(),
        });

        if (usePetStore.getState().error) {
          return;
        }

        if (resolvedPermission === 'allowed') {
          await syncCheckInReminderSchedule({
            permission: resolvedPermission,
            petName: name.trim(),
          });
        }

        resetDraft();
        router.replace('/(main)/dashboard');
      } catch {
        // Stores set error state.
      }
    },
    [
      ageGroup,
      clearNotificationError,
      clearPetError,
      createPet,
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
      step={6}
      title="Stay on track with reminders"
      description="We can send gentle reminders for daily check-ins. You can change this later in settings."
      error={error}
      footer={
        <View style={styles.actions}>
          <Button
            title="Allow Notifications"
            disabled={isLoading}
            onPress={() => void completeSetup('allowed')}
          />
          <Button
            title="Maybe Later"
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
