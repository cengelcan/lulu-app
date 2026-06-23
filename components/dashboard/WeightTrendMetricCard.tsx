import { StyleSheet, View } from 'react-native';

import { WeightTrendSparkline } from '@/components/dashboard/WeightTrendSparkline';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import type { TrendMetric } from '@/utils/trends';

const WEIGHT_ACCENT = Palette.badgeViolet;

type WeightTrendMetricCardProps = {
  metric: TrendMetric;
};

export function WeightTrendMetricCard({ metric }: WeightTrendMetricCardProps) {
  const { t } = useTranslation();
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');
  const surfaceColor = useThemeColor({}, 'surface');
  const titleColor = useThemeColor({}, 'text');

  const subtitle =
    metric.subtitleMode === 'delta'
      ? t('dashboard.trendsComparedToLast30Days')
      : metric.subtitleMode === 'latest'
        ? t('dashboard.trendsLatestRecord')
        : t('dashboard.trendsNoData');

  return (
    <View style={[styles.card, { backgroundColor: surfaceColor, borderColor }]}>
      <View style={styles.titleRow}>
        <IconSymbol name="scalemass.fill" size={14} color={WEIGHT_ACCENT} />
        <ThemedText
          lightColor={titleColor}
          darkColor={titleColor}
          style={styles.title}
          numberOfLines={1}>
          {t('dashboard.trendsWeight')}
        </ThemedText>
      </View>
      <ThemedText
        lightColor={WEIGHT_ACCENT}
        darkColor={WEIGHT_ACCENT}
        style={styles.value}
        numberOfLines={1}>
        {metric.valueLabel ?? '—'}
      </ThemedText>
      <ThemedText
        lightColor={textSecondaryColor}
        darkColor={textSecondaryColor}
        style={styles.subtitle}
        numberOfLines={1}>
        {subtitle}
      </ThemedText>
      <WeightTrendSparkline
        points={metric.sparklinePoints}
        color={WEIGHT_ACCENT}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 0,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.sm,
    gap: Spacing.xxs,
    minHeight: 118,
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xxs,
  },
  title: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: '600',
  },
  value: {
    ...Typography.bodySemiBold,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
  subtitle: {
    ...Typography.caption,
    fontSize: 11,
    lineHeight: 14,
    marginBottom: Spacing.xxs,
  },
});
