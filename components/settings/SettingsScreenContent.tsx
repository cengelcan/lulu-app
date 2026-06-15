import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { type Edge } from 'react-native-safe-area-context';

import { AppearanceSection } from '@/components/settings/AppearanceSection';
import { NotificationSection } from '@/components/settings/NotificationSection';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAppearanceStore } from '@/stores/appearance.store';
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
  const savePermission = useNotificationStore((state) => state.savePermission);
  const clearError = useNotificationStore((state) => state.clearError);

  const appearance = useAppearanceStore((state) => state.appearance);
  const saveAppearance = useAppearanceStore((state) => state.saveAppearance);

  const primaryColor = useThemeColor({}, 'primary');

  useFocusEffect(
    useCallback(() => {
      void loadNotificationSettings();
    }, [loadNotificationSettings])
  );

  const handleToggleReminders = async (enabled: boolean) => {
    clearError();

    try {
      await savePermission(enabled ? 'allowed' : 'later');
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

  const handleAppearanceSelect = (nextAppearance: typeof appearance) => {
    void saveAppearance(nextAppearance);
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
              isLoading={isLoading}
              error={storeError}
              onToggle={(enabled) => void handleToggleReminders(enabled)}
              onTimeChange={(time) => void handleTimeChange(time)}
            />
            <AppearanceSection
              appearance={appearance}
              onSelect={handleAppearanceSelect}
            />
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
