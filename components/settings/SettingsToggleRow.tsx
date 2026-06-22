import { StyleSheet, Switch, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

type SettingsToggleRowProps = {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  isLast?: boolean;
};

export function SettingsToggleRow({
  label,
  value,
  onValueChange,
  disabled = false,
  isLast = false,
}: SettingsToggleRowProps) {
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'primary');
  const primaryTextColor = useThemeColor({}, 'primaryText');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  return (
    <View
      style={[
        styles.row,
        !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: borderColor },
      ]}>
      <ThemedText type="defaultSemiBold" style={styles.label}>
        {label}
      </ThemedText>
      <Switch
        accessibilityLabel={label}
        disabled={disabled}
        ios_backgroundColor={textSecondaryColor}
        onValueChange={onValueChange}
        thumbColor={primaryTextColor}
        trackColor={{ false: textSecondaryColor, true: primaryColor }}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  label: {
    ...Typography.body,
    flex: 1,
  },
});
