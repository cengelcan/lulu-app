import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';

type CheckInProgressProps = {
  completedCount: number;
  totalCount: number;
};

export function CheckInProgress({ completedCount, totalCount }: CheckInProgressProps) {
  const { t } = useTranslation();
  const primaryColor = useThemeColor({}, 'primary');
  const borderColor = useThemeColor({}, 'border');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  return (
    <View style={styles.container}>
      <View style={styles.dots} accessibilityRole="progressbar">
        {Array.from({ length: totalCount }, (_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor: index < completedCount ? primaryColor : borderColor,
              },
            ]}
          />
        ))}
      </View>
      <ThemedText
        lightColor={textSecondaryColor}
        darkColor={textSecondaryColor}
        style={styles.label}>
        {t('checkIn.progress', { count: completedCount, total: totalCount })}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  dots: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: Radius.full,
  },
  label: {
    ...Typography.caption,
    fontWeight: '600',
  },
});
