import { StyleSheet, View } from 'react-native';

import { TrendLineChart } from '@/components/dashboard/TrendLineChart';
import { TrendMetricEmptyState } from '@/components/dashboard/TrendMetricEmptyState';
import { TrendStatusDayRow } from '@/components/dashboard/TrendStatusDayRow';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import type { IconSymbolName } from '@/components/ui/icon-symbol';
import type { TrendMetric, TrendLineMetricKind } from '@/utils/trends';
import { TREND_AXIS_LABEL_KEYS } from '@/utils/trends';

type TrendMetricConfig = {
  titleKey:
    | 'dashboard.trendsAppetite'
    | 'dashboard.trendsWaterIntake'
    | 'dashboard.trendsEnergy'
    | 'dashboard.trendsMood'
    | 'dashboard.trendsPoop'
    | 'dashboard.trendsPee';
  icon: IconSymbolName;
  accentColor: string;
};

const TREND_METRIC_CONFIG: Record<TrendMetric['kind'], TrendMetricConfig> = {
  appetite: {
    titleKey: 'dashboard.trendsAppetite',
    icon: 'fork.knife.circle',
    accentColor: Palette.badgeEmerald,
  },
  waterIntake: {
    titleKey: 'dashboard.trendsWaterIntake',
    icon: 'drop.fill',
    accentColor: '#93C5FD',
  },
  energy: {
    titleKey: 'dashboard.trendsEnergy',
    icon: 'bolt.fill',
    accentColor: Palette.badgeOrange,
  },
  mood: {
    titleKey: 'dashboard.trendsMood',
    icon: 'face.smiling',
    accentColor: '#C4B5FD',
  },
  poop: {
    titleKey: 'dashboard.trendsPoop',
    icon: 'leaf.fill',
    accentColor: '#D6B36A',
  },
  pee: {
    titleKey: 'dashboard.trendsPee',
    icon: 'drop.triangle.fill',
    accentColor: '#C4B5FD',
  },
};

type TrendMetricCardProps = {
  metric: TrendMetric;
};

export function TrendMetricCard({ metric }: TrendMetricCardProps) {
  const { t } = useTranslation();
  const borderColor = useThemeColor({}, 'border');
  const surfaceElevatedColor = useThemeColor({}, 'surfaceElevated');
  const titleColor = useThemeColor({}, 'text');
  const config = TREND_METRIC_CONFIG[metric.kind];

  return (
    <View style={[styles.card, { backgroundColor: surfaceElevatedColor, borderColor }]}>
      <View style={styles.titleRow}>
        <IconSymbol name={config.icon} size={20} color={config.accentColor} />
        <ThemedText
          lightColor={titleColor}
          darkColor={titleColor}
          style={styles.title}
          numberOfLines={1}>
          {t(config.titleKey)}
        </ThemedText>
      </View>

      {!metric.hasData ? (
        <TrendMetricEmptyState
          chartDays={metric.chartDays}
          accentColor={config.accentColor}
        />
      ) : metric.displayMode === 'status' ? (
        <TrendStatusDayRow chartDays={metric.chartDays} />
      ) : (
        <TrendLineChart
          chartDays={metric.chartDays}
          accentColor={config.accentColor}
          axisLabels={{
            top: t(TREND_AXIS_LABEL_KEYS[metric.kind as TrendLineMetricKind].top),
            middle: t(TREND_AXIS_LABEL_KEYS[metric.kind as TrendLineMetricKind].middle),
            bottom: t(TREND_AXIS_LABEL_KEYS[metric.kind as TrendLineMetricKind].bottom),
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    minHeight: 180,
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  title: {
    ...Typography.bodySemiBold,
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
});
