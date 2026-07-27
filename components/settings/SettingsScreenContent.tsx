import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { type Edge } from 'react-native-safe-area-context';

import { AppearanceSection } from '@/components/settings/appearance-section';
import { LanguageSection } from '@/components/settings/LanguageSection';
import { NotificationSection } from '@/components/settings/NotificationSection';
import { WeightUnitSection } from '@/components/settings/weight-unit-section';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useExperiencePreferencesStore } from '@/stores/experience-preferences.store';
import { useLanguageStore } from '@/stores/language.store';
import { useNotificationStore } from '@/stores/notification.store';
import { useUserStore } from '@/stores/user.store';
import { pushWeightUnitPreference } from '@/services/sync/weight-unit-preference-sync';
import type { ReminderTime } from '@/types/reminder';

type SettingsScreenContentProps = {
  edges?: Edge[];
};

export function SettingsScreenContent({
  edges = ['top', 'bottom'],
}: SettingsScreenContentProps) {
  const reminderTime = useNotificationStore((state) => state.reminderTime);
  const permission = useNotificationStore((state) => state.permission);
  const isLoading = useNotificationStore((state) => state.isLoading);
  const storeError = useNotificationStore((state) => state.error);
  const loadNotificationSettings = useNotificationStore((state) => state.loadNotificationSettings);
  const saveReminderTime = useNotificationStore((state) => state.saveReminderTime);
  const savePetReminderNotificationsEnabled = useNotificationStore(
    (state) => state.savePetReminderNotificationsEnabled
  );
  const petReminderNotificationsEnabled = useNotificationStore(
    (state) => state.petReminderNotificationsEnabled
  );
  const dailyCheckInNotificationsEnabled = useNotificationStore(
    (state) => state.dailyCheckInNotificationsEnabled
  );
  const medicationDoseNotificationsEnabled = useNotificationStore(
    (state) => state.medicationDoseNotificationsEnabled
  );
  const medicationRefillNotificationsEnabled = useNotificationStore(
    (state) => state.medicationRefillNotificationsEnabled
  );
  const saveDailyCheckInNotificationsEnabled = useNotificationStore(
    (state) => state.saveDailyCheckInNotificationsEnabled
  );
  const saveMedicationDoseNotificationsEnabled = useNotificationStore(
    (state) => state.saveMedicationDoseNotificationsEnabled
  );
  const saveMedicationRefillNotificationsEnabled = useNotificationStore(
    (state) => state.saveMedicationRefillNotificationsEnabled
  );
  const familyActivityDigestEnabled = useNotificationStore(
    (state) => state.familyActivityDigestEnabled
  );
  const saveFamilyActivityDigestEnabled = useNotificationStore(
    (state) => state.saveFamilyActivityDigestEnabled
  );
  const clearError = useNotificationStore((state) => state.clearError);

  const themePreference = useExperiencePreferencesStore(
    (state) => state.preferences?.themePreference ?? 'system'
  );
  const loadPreferences = useExperiencePreferencesStore((state) => state.loadPreferences);
  const saveThemePreference = useExperiencePreferencesStore(
    (state) => state.saveThemePreference
  );
  const weightUnitPreference = useExperiencePreferencesStore(
    (state) => state.preferences?.weightUnitPreference ?? 'kg'
  );
  const saveWeightUnitPreference = useExperiencePreferencesStore(
    (state) => state.saveWeightUnitPreference
  );
  const userId = useUserStore((state) => state.userId);

  const languagePreference = useLanguageStore((state) => state.languagePreference);
  const saveLanguage = useLanguageStore((state) => state.saveLanguage);

  const primaryColor = useThemeColor({}, 'primary');

  useFocusEffect(
    useCallback(() => {
      void loadNotificationSettings();
      void loadPreferences();
    }, [loadNotificationSettings, loadPreferences])
  );

  const handleToggleCheckIn = async (enabled: boolean) => {
    clearError();

    try {
      await saveDailyCheckInNotificationsEnabled(enabled);
    } catch {
      // Store sets error state.
    }
  };

  const handleToggleMedicationDoses = async (enabled: boolean) => {
    clearError();
    try {
      await saveMedicationDoseNotificationsEnabled(enabled);
    } catch {
      // Store sets error state.
    }
  };

  const handleToggleMedicationRefill = async (enabled: boolean) => {
    clearError();
    try {
      await saveMedicationRefillNotificationsEnabled(enabled);
    } catch {
      // Store sets error state.
    }
  };

  const handleTogglePetReminders = async (enabled: boolean) => {
    clearError();

    try {
      await savePetReminderNotificationsEnabled(enabled);
    } catch {
      // Store sets error state.
    }
  };

  const handleTimeChange = async (time: ReminderTime) => {
    clearError();

    try {
      await saveReminderTime(time);
    } catch {
      // Store sets error state.
    }
  };

  const handleToggleFamilyActivityDigest = async (enabled: boolean) => {
    clearError();

    try {
      await saveFamilyActivityDigestEnabled(enabled);
    } catch {
      // Store sets error state.
    }
  };

  const handleLanguageSelect = (nextLanguage: typeof languagePreference) => {
    void saveLanguage(nextLanguage);
  };

  const handleThemeSelect = (nextTheme: typeof themePreference) => {
    void saveThemePreference(nextTheme).catch(() => {
      // Store keeps the previous preference and records the error.
    });
  };

  const handleWeightUnitSelect = async (nextUnit: typeof weightUnitPreference) => {
    try {
      await saveWeightUnitPreference(nextUnit);
    } catch {
      return;
    }

    if (userId) {
      try {
        await pushWeightUnitPreference(userId, nextUnit);
      } catch (error) {
        // Local-first: keep the selection and reconcile it on the next authenticated sync.
        console.warn('Failed to sync weight unit preference', error);
      }
    }
  };

  const isInitialLoading = isLoading && permission === null;

  return (
    <ScreenContainer scrollable edges={edges} contentStyle={styles.content}>
      <View style={styles.body}>
        {isInitialLoading ? (
          <ActivityIndicator color={primaryColor} style={styles.loading} />
        ) : (
          <>
            <AppearanceSection
              preference={themePreference}
              onChange={handleThemeSelect}
            />
            <WeightUnitSection
              preference={weightUnitPreference}
              onChange={(nextUnit) => void handleWeightUnitSelect(nextUnit)}
            />
            <NotificationSection
              permission={permission}
              reminderTime={reminderTime}
              dailyCheckInNotificationsEnabled={dailyCheckInNotificationsEnabled}
              petReminderNotificationsEnabled={petReminderNotificationsEnabled}
              medicationDoseNotificationsEnabled={medicationDoseNotificationsEnabled}
              medicationRefillNotificationsEnabled={medicationRefillNotificationsEnabled}
              familyActivityDigestEnabled={familyActivityDigestEnabled}
              isLoading={isLoading}
              error={storeError}
              onToggleCheckIn={(enabled) => void handleToggleCheckIn(enabled)}
              onTogglePetReminders={(enabled) => void handleTogglePetReminders(enabled)}
              onToggleMedicationDoses={(enabled) => void handleToggleMedicationDoses(enabled)}
              onToggleMedicationRefill={(enabled) => void handleToggleMedicationRefill(enabled)}
              onToggleFamilyActivityDigest={(enabled) =>
                void handleToggleFamilyActivityDigest(enabled)
              }
              onTimeChange={(time) => void handleTimeChange(time)}
            />
            <LanguageSection language={languagePreference} onSelect={handleLanguageSelect} />
          </>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
  },
  body: {
    gap: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  loading: {
    alignSelf: 'center',
    marginTop: Spacing.lg,
  },
});
