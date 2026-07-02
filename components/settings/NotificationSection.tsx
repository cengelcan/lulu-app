import { Linking, StyleSheet, View } from 'react-native';

import { GroupedSection } from '@/components/pet/GroupedSection';
import { SettingsToggleRow } from '@/components/settings/SettingsToggleRow';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { TimePickerField } from '@/components/ui/TimePickerField';
import { Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import type { NotificationPermissionStatus } from '@/storage/prefs.storage';
import type { ReminderTime } from '@/types/reminder';
import { translateError } from '@/utils/translate-error';

type NotificationSectionProps = {
  permission: NotificationPermissionStatus | null;
  reminderTime: ReminderTime | null;
  petReminderNotificationsEnabled: boolean;
  isLoading: boolean;
  error: string | null;
  onToggleCheckIn: (enabled: boolean) => void;
  onTogglePetReminders: (enabled: boolean) => void;
  onTimeChange: (time: ReminderTime) => void;
};

export function NotificationSection({
  permission,
  reminderTime,
  petReminderNotificationsEnabled,
  isLoading,
  error,
  onToggleCheckIn,
  onTogglePetReminders,
  onTimeChange,
}: NotificationSectionProps) {
  const { t } = useTranslation();
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const resolvedError = translateError(t, error);
  const checkInEnabled = permission === 'allowed';
  const isDenied = permission === 'denied';
  const toggleDisabled = isLoading || isDenied;
  const time = reminderTime ?? { hour: 9, minute: 0 };

  const handleOpenSystemSettings = () => {
    void Linking.openSettings();
  };

  return (
    <View style={styles.section}>
      <GroupedSection title={t('settings.notifications')}>
        <SettingsToggleRow
          label={t('settings.dailyCheckInReminder')}
          value={checkInEnabled}
          disabled={toggleDisabled}
          onValueChange={onToggleCheckIn}
          isLast={!checkInEnabled}
        />
        {checkInEnabled ? (
          <TimePickerField
            accessibilityLabel={t('settings.reminderTime')}
            label={t('settings.reminderTime')}
            value={time}
            disabled={isLoading}
            variant="row"
            onChange={onTimeChange}
          />
        ) : null}
        <SettingsToggleRow
          label={t('settings.petReminderNotifications')}
          value={petReminderNotificationsEnabled}
          disabled={toggleDisabled}
          onValueChange={onTogglePetReminders}
          isLast
        />
      </GroupedSection>

      {resolvedError ? <ThemedText style={styles.error}>{resolvedError}</ThemedText> : null}

      {isDenied ? (
        <View style={styles.footer}>
          <ThemedText
            lightColor={textSecondaryColor}
            darkColor={textSecondaryColor}
            style={styles.footerText}>
            {t('settings.notificationsDisabledFooter')}
          </ThemedText>
          <Button
            accessibilityLabel={t('settings.openSettings')}
            title={t('settings.openSettings')}
            variant="secondary"
            onPress={handleOpenSystemSettings}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.sm,
  },
  footer: {
    gap: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
  footerText: {
    ...Typography.caption,
    textAlign: 'center',
  },
  error: {
    ...Typography.caption,
    paddingHorizontal: Spacing.xs,
  },
});
