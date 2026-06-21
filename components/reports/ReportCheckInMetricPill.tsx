import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { ReportCheckInFieldEntry } from '@/types/report';

type ReportCheckInMetricPillProps = {
  field: ReportCheckInFieldEntry;
};

export function ReportCheckInMetricPill({ field }: ReportCheckInMetricPillProps) {
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const successColor = useThemeColor({}, 'success');
  const alertColor = useThemeColor({}, 'alert');

  const accentColor = field.isNormal ? successColor : alertColor;

  return (
    <View
      style={[
        styles.pill,
        {
          backgroundColor: surfaceColor,
          borderColor,
        },
      ]}>
      <ThemedText style={styles.emoji}>{field.emoji}</ThemedText>
      <ThemedText
        lightColor={textSecondaryColor}
        darkColor={textSecondaryColor}
        numberOfLines={1}
        style={styles.label}>
        {field.label}
      </ThemedText>
      <ThemedText
        lightColor={accentColor}
        darkColor={accentColor}
        numberOfLines={1}
        style={styles.value}>
        {field.value}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    width: 96,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    gap: 2,
  },
  emoji: {
    fontSize: 18,
    lineHeight: 22,
  },
  label: {
    ...Typography.caption,
    textAlign: 'center',
  },
  value: {
    ...Typography.caption,
    fontWeight: '600',
    textAlign: 'center',
  },
});
