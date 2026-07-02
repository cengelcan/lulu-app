import { StyleSheet, View } from 'react-native';

import { TrendEmptyIllustration } from '@/components/dashboard/TrendEmptyIllustration';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import { formatWeekdayShort, parseLocalDate } from '@/utils/date';
import { getLocaleTag } from '@/utils/locale';
import type { TrendChartDay } from '@/utils/trends';

type TrendMetricEmptyStateProps = {
  chartDays: TrendChartDay[];
  accentColor?: string;
};

function formatWeekdayLetter(dateKey: string, locale: string): string {
  const date = parseLocalDate(dateKey);
  if (!date) {
    return '';
  }

  return formatWeekdayShort(date, locale).charAt(0).toUpperCase();
}

export function TrendMetricEmptyState({
  chartDays,
  accentColor,
}: TrendMetricEmptyStateProps) {
  const { t, language } = useTranslation();
  const titleColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');
  const surfaceSoftColor = useThemeColor({}, 'surfaceSoft');
  const locale = getLocaleTag(language);
  const illustrationColor = accentColor ?? textSecondaryColor;

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.emptyContainer,
          { borderColor, backgroundColor: surfaceSoftColor },
        ]}>
        <View style={styles.emptyContent}>
          <TrendEmptyIllustration color={illustrationColor} />
          <ThemedText
            lightColor={titleColor}
            darkColor={titleColor}
            style={styles.emptyTitle}>
            {t('dashboard.trendsEmptyTitle')}
          </ThemedText>
          <ThemedText
            lightColor={textSecondaryColor}
            darkColor={textSecondaryColor}
            style={styles.emptyDescription}>
            {t('dashboard.trendsEmptyDescription')}
          </ThemedText>
        </View>
      </View>

      <View style={styles.labels}>
        {chartDays.map((day) => (
          <ThemedText
            key={day.date}
            lightColor={textSecondaryColor}
            darkColor={textSecondaryColor}
            style={styles.label}
            numberOfLines={1}>
            {formatWeekdayLetter(day.date, locale)}
          </ThemedText>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 4,
  },
  emptyContainer: {
    width: '100%',
    minHeight: 108,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContent: {
    alignItems: 'center',
    gap: Spacing.xs,
    maxWidth: 260,
  },
  emptyTitle: {
    ...Typography.bodySemiBold,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyDescription: {
    ...Typography.caption,
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    ...Typography.caption,
    flex: 1,
    fontSize: 10,
    lineHeight: 12,
    textAlign: 'center',
  },
});
