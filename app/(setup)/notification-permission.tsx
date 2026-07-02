import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { NotificationPermissionPrompt } from '@/components/setup/NotificationPermissionPrompt';
import { NotificationIllustration } from '@/components/setup/NotificationIllustration';
import { SetupScreen } from '@/components/setup/setup-screen';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useTranslation } from '@/hooks/use-translation';
import { useThemeColor } from '@/hooks/use-theme-color';
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
import { formatReminderTime12h } from '@/utils/time';
import { translateValidationError } from '@/utils/translate-error';

export default function NotificationPermissionScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const mode = useSetupMode();
  const totalSteps = setupTotalSteps(mode);
  const { onBack } = useSetupScreenBack(6, mode);
  const primaryTextColor = useThemeColor({}, 'primaryText');
  const brandAccentColor = useThemeColor({}, 'brandAccent');

  const species = useSetupStore((state) => state.species);
  const breed = useSetupStore((state) => state.breed);
  const name = useSetupStore((state) => state.name);
  const birthDate = useSetupStore((state) => state.birthDate);
  const healthConditions = useSetupStore((state) => state.healthConditions);
  const photoUri = useSetupStore((state) => state.photoUri);
  const photoUpload = useSetupStore((state) => state.photoUpload);
  const resetDraft = useSetupStore((state) => state.resetDraft);

  const createPet = usePetStore((state) => state.createPet);
  const updatePet = usePetStore((state) => state.updatePet);
  const setActivePet = usePetStore((state) => state.setActivePet);
  const petIsLoading = usePetStore((state) => state.isLoading);
  const petError = usePetStore((state) => state.error);
  const clearPetError = usePetStore((state) => state.clearError);

  const reminderTime = useNotificationStore((state) => state.reminderTime);
  const savePermission = useNotificationStore((state) => state.savePermission);
  const notificationIsLoading = useNotificationStore((state) => state.isLoading);
  const notificationError = useNotificationStore((state) => state.error);
  const clearNotificationError = useNotificationStore((state) => state.clearError);

  const [validationError, setValidationError] = useState<string | null>(null);

  const isLoading = petIsLoading || notificationIsLoading;
  const error = translateValidationError(t, validationError) ?? petError ?? notificationError;

  const previewTimeLabel = useMemo(
    () => (reminderTime ? formatReminderTime12h(reminderTime) : t('setup.notifications.previewTimeFallback')),
    [reminderTime, t]
  );

  const completeSetup = useCallback(
    async (permission: NotificationPermissionStatus) => {
      const draft = { species, breed, name, birthDate, healthConditions, photoUri, photoUpload };
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
          updatePet,
          setActivePet,
          savePermission,
          resetDraft,
          router,
        });

        if (usePetStore.getState().error || useNotificationStore.getState().error) {
          return;
        }
      } catch {
        // Store sets error state.
      }
    },
    [
      birthDate,
      breed,
      clearNotificationError,
      clearPetError,
      createPet,
      updatePet,
      setActivePet,
      healthConditions,
      name,
      photoUri,
      photoUpload,
      resetDraft,
      router,
      savePermission,
      species,
    ]
  );

  return (
    <SetupScreen
      step={6}
      totalSteps={totalSteps}
      title=""
      titlePrefix={t('setup.notifications.titlePrefix')}
      titleAccent={t('setup.notifications.titleAccent')}
      titleAccentVariant="gradient"
      headerIllustration={<NotificationIllustration />}
      description={t('setup.notifications.description')}
      onBack={onBack}
      error={error}
      footer={
        <View style={styles.footer}>
          <Button
            title={t('setup.notifications.allow')}
            disabled={isLoading}
            onPress={() => void completeSetup('allowed')}
            style={styles.primaryButton}
            trailingIcon={
              isLoading ? (
                <ActivityIndicator color={primaryTextColor} size="small" />
              ) : (
                <IconSymbol name="bell.fill" size={18} color={primaryTextColor} />
              )
            }
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('setup.notifications.maybeLater')}
            disabled={isLoading}
            onPress={() => void completeSetup('later')}
            style={({ pressed }) => [
              styles.secondaryAction,
              { opacity: isLoading ? 0.5 : pressed ? 0.7 : 1 },
            ]}>
            <ThemedText
              lightColor={brandAccentColor}
              darkColor={brandAccentColor}
              style={styles.secondaryLabel}>
              {t('setup.notifications.maybeLater')}
            </ThemedText>
          </Pressable>
        </View>
      }>
      <NotificationPermissionPrompt
        petName={name}
        previewAppName={t('welcome.appName')}
        previewTitle={t('setup.notifications.previewTitle')}
        previewBody={t('setup.notifications.previewBody')}
        previewNameFallback={t('setup.notifications.previewNameFallback')}
        previewTimeLabel={previewTimeLabel}
        benefitDaily={t('setup.notifications.benefitDaily')}
        benefitSettings={t('setup.notifications.benefitSettings')}
        hint={t('setup.notifications.hint')}
      />
    </SetupScreen>
  );
}

const styles = StyleSheet.create({
  footer: {
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  primaryButton: {
    borderRadius: Radius.pill,
    minHeight: 52,
  },
  secondaryAction: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: Spacing.md,
  },
  secondaryLabel: {
    ...Typography.bodySemiBold,
  },
});
