import { StyleSheet, View } from 'react-native';

import { Sparkline } from '@/components/dashboard/Sparkline';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import type { TrendMetric, TrendMetricKind } from '@/utils/trends';

type TrendMetricCardProps = {
  metric: TrendMetric;
};

const METRIC_LABEL_KEYS: Record<TrendMetricKind, 'dashboard.trendsWeight' | 'dashboard.trendsAppetite' | 'dashboard.trendsEnergy'> = {
  weight: 'dashboard.trendsWeight',
  appetite: 'dashboard.trendsAppetite',
  energy: 'dashboard.trendsEnergy',
};

const METRIC_VARIANTS: Record<TrendMetricKind, 'line' | 'bar'> = {
  weight: 'line',
  appetite: 'bar',
  energy: 'line',
};

export function TrendMetricCard({ metric }: TrendMetricCardProps) {
  const { t } = useTranslation();
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const brandAccentColor = useThemeColor({}, 'brandAccent');
  const successColor = useThemeColor({}, 'success');
  const warningColor = useThemeColor({}, 'warning');
  const borderColor = useThemeColor({}, 'border');
  const surfaceColor = useThemeColor({}, 'surface');

  const chartColor =
    metric.kind === 'appetite'
      ? successColor
      : metric.kind === 'energy'
        ? warningColor
        : brandAccentColor;

  const statusLabel =
    metric.status === 'no_data'
      ? t('dashboard.trendsNoData')
      : metric.status === 'normal'
        ? t('dashboard.trendsNormal')
        : t('dashboard.attention');

  const subtitle =
    metric.subtitleMode === 'delta'
      ? t('dashboard.trendsComparedToLast30Days')
      : metric.subtitleMode === 'latest'
        ? t('dashboard.trendsLatestRecord')
        : statusLabel;

  return (
    <View style={[styles.card, { backgroundColor: surfaceColor, borderColor }]}>
      <ThemedText
        lightColor={textSecondaryColor}
        darkColor={textSecondaryColor}
        style={styles.title}>
        {t(METRIC_LABEL_KEYS[metric.kind])}
      </ThemedText>
      <ThemedText type="defaultSemiBold" style={styles.value} numberOfLines={1}>
        {metric.valueLabel ?? '—'}
      </ThemedText>
      <ThemedText
        lightColor={textSecondaryColor}
        darkColor={textSecondaryColor}
        style={styles.subtitle}
        numberOfLines={1}>
        {subtitle}
      </ThemedText>
      <Sparkline
        points={metric.sparklinePoints}
        color={chartColor}
        variant={METRIC_VARIANTS[metric.kind]}
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
  title: {
    ...Typography.caption,
    fontSize: 12,
  },
  value: {
    ...Typography.bodySemiBold,
    fontSize: 15,
    lineHeight: 20,
  },
  subtitle: {
    ...Typography.caption,
    fontSize: 11,
    lineHeight: 14,
    marginBottom: Spacing.xxs,
  },
});
