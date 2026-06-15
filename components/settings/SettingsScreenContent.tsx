import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, Linking, StyleSheet, View } from 'react-native';
import { type Edge } from 'react-native-safe-area-context';

import { SelectableOption } from '@/components/setup/selectable-option';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { CHECK_IN_PREFERENCE_OPTIONS } from '@/constants/check-in';
import { Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useNotificationStore } from '@/stores/notification.store';
import type { CheckInPreference } from '@/types/check-in';

function getNotificationStatusMessage(
  permission: 'allowed' | 'later' | 'denied' | null
): string {
  switch (permission) {
    case 'allowed':
      return 'Notifications are enabled.';
    case 'later':
      return 'Reminders are currently turned off.';
    case 'denied':
      return 'Notifications are disabled in system settings.';
    default:
      return 'Notification status is unavailable.';
  }
}

type SettingsScreenContentProps = {
  edges?: Edge[];
};

export function SettingsScreenContent({
  edges = ['top', 'bottom'],
}: SettingsScreenContentProps) {
  const preference = useNotificationStore((state) => state.preference);
  const permission = useNotificationStore((state) => state.permission);
  const isLoading = useNotificationStore((state) => state.isLoading);
  const storeError = useNotificationStore((state) => state.error);
  const loadNotificationSettings = useNotificationStore((state) => state.loadNotificationSettings);
  const savePreference = useNotificationStore((state) => state.savePreference);
  const clearError = useNotificationStore((state) => state.clearError);

  const primaryColor = useThemeColor({}, 'primary');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  const preferencesEnabled = permission === 'allowed';

  useFocusEffect(
    useCallback(() => {
      void loadNotificationSettings();
    }, [loadNotificationSettings])
  );

  const handleOpenSystemSettings = () => {
    void Linking.openSettings();
  };

  const handleSelectPreference = async (value: CheckInPreference) => {
    if (!preferencesEnabled || value === preference || isLoading) {
      return;
    }

    clearError();

    try {
      await savePreference(value);
    } catch {
      // Store sets error state.
    }
  };

  return (
    <ScreenContainer scrollable edges={edges} contentStyle={styles.content}>
      <View style={styles.body}>
        <Card>
          <ThemedText type="subtitle">Notifications</ThemedText>
          {isLoading && permission === null ? (
            <ActivityIndicator color={primaryColor} style={styles.loading} />
          ) : (
            <>
              <ThemedText
                lightColor={textSecondaryColor}
                darkColor={textSecondaryColor}
                style={styles.statusLabel}>
                Status:
              </ThemedText>
              <ThemedText style={styles.statusMessage}>
                {getNotificationStatusMessage(permission)}
              </ThemedText>
              {permission === 'denied' ? (
                <Button
                  accessibilityLabel="Open Settings"
                  title="Open Settings"
                  variant="secondary"
                  onPress={handleOpenSystemSettings}
                  style={styles.openSettingsButton}
                />
              ) : null}
            </>
          )}
        </Card>

        <Card>
          <ThemedText type="subtitle">Reminder Preference</ThemedText>
          {isLoading ? (
            <ActivityIndicator color={primaryColor} style={styles.loading} />
          ) : null}
          {storeError ? <ThemedText style={styles.error}>{storeError}</ThemedText> : null}
          {CHECK_IN_PREFERENCE_OPTIONS.map((option) => (
            <SelectableOption
              key={option.value}
              label={option.label}
              selected={preference === option.value}
              disabled={!preferencesEnabled || isLoading}
              onPress={() => void handleSelectPreference(option.value)}
            />
          ))}
        </Card>
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
  statusLabel: {
    ...Typography.caption,
  },
  statusMessage: {
    ...Typography.body,
  },
  openSettingsButton: {
    marginTop: Spacing.xs,
  },
  loading: {
    alignSelf: 'flex-start',
  },
  error: {
    ...Typography.caption,
  },
});
