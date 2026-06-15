import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

type ProfileDetailRowProps = {
  label: string;
  value: string;
  isLast?: boolean;
};

export function ProfileDetailRow({ label, value, isLast = false }: ProfileDetailRowProps) {
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');

  return (
    <View
      accessibilityLabel={`${label}: ${value}`}
      style={[
        styles.row,
        !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: borderColor },
      ]}>
      <ThemedText
        lightColor={textSecondaryColor}
        darkColor={textSecondaryColor}
        style={styles.label}>
        {label}
      </ThemedText>
      <ThemedText type="defaultSemiBold" style={styles.value}>
        {value}
      </ThemedText>
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
    gap: Spacing.md,
  },
  label: {
    ...Typography.body,
    flexShrink: 0,
  },
  value: {
    ...Typography.body,
    flex: 1,
    textAlign: 'right',
  },
});
