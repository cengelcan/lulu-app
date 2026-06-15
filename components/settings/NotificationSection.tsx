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

type NotificationSectionProps = {
  permission: NotificationPermissionStatus | null;
  reminderTime: ReminderTime | null;
  isLoading: boolean;
  error: string | null;
  onToggle: (enabled: boolean) => void;
  onTimeChange: (time: ReminderTime) => void;
};

export function NotificationSection({
  permission,
  reminderTime,
  isLoading,
  error,
  onToggle,
  onTimeChange,
}: NotificationSectionProps) {
  const { t } = useTranslation();
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const remindersEnabled = permission === 'allowed';
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
          value={remindersEnabled}
          disabled={toggleDisabled}
          onValueChange={onToggle}
          isLast={!remindersEnabled}
        />
        {remindersEnabled ? (
          <TimePickerField
            accessibilityLabel={t('settings.reminderTime')}
            label={t('settings.reminderTime')}
            value={time}
            disabled={isLoading}
            variant="row"
            isLast
            onChange={onTimeChange}
          />
        ) : null}
      </GroupedSection>

      {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}

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
