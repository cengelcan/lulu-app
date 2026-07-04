import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { type Edge } from 'react-native-safe-area-context';

import { FamilySharingSettingsSection } from '@/components/settings/FamilySharingSettingsSection';
import { LanguageSection } from '@/components/settings/LanguageSection';
import { NotificationSection } from '@/components/settings/NotificationSection';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useLanguageStore } from '@/stores/language.store';
import { useNotificationStore } from '@/stores/notification.store';
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
  const savePermission = useNotificationStore((state) => state.savePermission);
  const petReminderNotificationsEnabled = useNotificationStore(
    (state) => state.petReminderNotificationsEnabled
  );
  const clearError = useNotificationStore((state) => state.clearError);

  const languagePreference = useLanguageStore((state) => state.languagePreference);
  const saveLanguage = useLanguageStore((state) => state.saveLanguage);

  const primaryColor = useThemeColor({}, 'primary');

  useFocusEffect(
    useCallback(() => {
      void loadNotificationSettings();
    }, [loadNotificationSettings])
  );

  const handleToggleCheckIn = async (enabled: boolean) => {
    clearError();

    try {
      await savePermission(enabled ? 'allowed' : 'later');
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

  const handleLanguageSelect = (nextLanguage: typeof languagePreference) => {
    void saveLanguage(nextLanguage);
  };

  const isInitialLoading = isLoading && permission === null;

  return (
    <ScreenContainer scrollable edges={edges} contentStyle={styles.content}>
      <View style={styles.body}>
        {isInitialLoading ? (
          <ActivityIndicator color={primaryColor} style={styles.loading} />
        ) : (
          <>
            <NotificationSection
              permission={permission}
              reminderTime={reminderTime}
              petReminderNotificationsEnabled={petReminderNotificationsEnabled}
              isLoading={isLoading}
              error={storeError}
              onToggleCheckIn={(enabled) => void handleToggleCheckIn(enabled)}
              onTogglePetReminders={(enabled) => void handleTogglePetReminders(enabled)}
              onTimeChange={(time) => void handleTimeChange(time)}
            />
            <FamilySharingSettingsSection />
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
