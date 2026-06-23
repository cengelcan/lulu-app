import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import type { IconSymbolName } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import type { TrendMetric } from '@/utils/trends';

type ScoreTrendMetricCardProps = {
  metric: TrendMetric;
  titleKey: 'dashboard.trendsAppetite' | 'dashboard.trendsEnergy';
  icon: IconSymbolName;
  accentColor: string;
  chart: ReactNode;
};

export function ScoreTrendMetricCard({
  metric,
  titleKey,
  icon,
  accentColor,
  chart,
}: ScoreTrendMetricCardProps) {
  const { t } = useTranslation();
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');
  const surfaceColor = useThemeColor({}, 'surface');
  const titleColor = useThemeColor({}, 'text');

  const statusLabel =
    metric.status === 'no_data'
      ? t('dashboard.trendsNoData')
      : metric.status === 'normal'
        ? t('dashboard.trendsNormal')
        : t('dashboard.attention');

  return (
    <View style={[styles.card, { backgroundColor: surfaceColor, borderColor }]}>
      <View style={styles.titleRow}>
        <IconSymbol name={icon} size={14} color={accentColor} />
        <ThemedText
          lightColor={titleColor}
          darkColor={titleColor}
          style={styles.title}
          numberOfLines={1}>
          {t(titleKey)}
        </ThemedText>
      </View>
      <ThemedText
        lightColor={accentColor}
        darkColor={accentColor}
        style={styles.value}
        numberOfLines={1}>
        {metric.valueLabel ?? '—'}
      </ThemedText>
      {metric.hasData ? (
        <ThemedText
          lightColor={textSecondaryColor}
          darkColor={textSecondaryColor}
          style={styles.subtitle}
          numberOfLines={1}>
          {statusLabel}
        </ThemedText>
      ) : null}
      {chart}
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
