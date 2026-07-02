import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import { parseLocalDate } from '@/utils/date';
import { getLocaleTag } from '@/utils/locale';
import {
  normalizeWeightChartValues,
  type WeightChartData,
} from '@/utils/weight-chart';

const DOT_SIZE = 7;
const LINE_WIDTH = 2;
const CHART_PADDING = 6;
const Y_AXIS_WIDTH = 36;
const DEFAULT_HEIGHT = 132;

type WeightChartProps = {
  data: WeightChartData;
  onAddPress: () => void;
  accentColor?: string;
  height?: number;
};

type ChartPoint = {
  x: number;
  y: number;
};

type ChartSegment = {
  key: string;
  length: number;
  angle: number;
  centerX: number;
  centerY: number;
};

function formatAxisValue(value: number, locale: string): string {
  return value.toLocaleString(locale, {
    maximumFractionDigits: 1,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 1,
  });
}

function formatPointDate(dateKey: string, locale: string): string {
  const date = parseLocalDate(dateKey);
  if (!date) {
    return dateKey;
  }

  return date.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
  });
}

function getChartPoints(
  width: number,
  height: number,
  normalizedValues: number[]
): ChartPoint[] {
  if (width <= 0 || normalizedValues.length === 0) {
    return [];
  }

  const chartHeight = height - CHART_PADDING * 2;
  const slotCount = Math.max(normalizedValues.length - 1, 1);

  return normalizedValues.map((value, index) => ({
    x: (index / slotCount) * width,
    y: CHART_PADDING + (1 - value) * chartHeight,
  }));
}

function getChartSegments(chartPoints: ChartPoint[]): ChartSegment[] {
  const segments: ChartSegment[] = [];

  for (let index = 1; index < chartPoints.length; index += 1) {
    const start = chartPoints[index - 1];
    const end = chartPoints[index];
    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;
    const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (length === 0) {
      continue;
    }

    segments.push({
      key: `${index}-${start.x}-${end.x}`,
      length,
      angle: (Math.atan2(deltaY, deltaX) * 180) / Math.PI,
      centerX: (start.x + end.x) / 2,
      centerY: (start.y + end.y) / 2,
    });
  }

  return segments;
}

export function WeightChart({
  data,
  onAddPress,
  accentColor = Palette.badgeViolet,
  height = DEFAULT_HEIGHT,
}: WeightChartProps) {
  const { t, language } = useTranslation();
  const locale = getLocaleTag(language);
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');
  const surfaceSoftColor = useThemeColor({}, 'surfaceSoft');
  const [plotWidth, setPlotWidth] = useState(0);

  const normalizedValues = useMemo(() => {
    if (!data.hasData || data.minValue === null || data.maxValue === null) {
      return [];
    }

    return normalizeWeightChartValues(
      data.points.map((point) => point.value),
      data.minValue,
      data.maxValue
    );
  }, [data]);

  const chartPoints = useMemo(
    () => getChartPoints(plotWidth, height, normalizedValues),
    [height, normalizedValues, plotWidth]
  );
  const segments = useMemo(() => getChartSegments(chartPoints), [chartPoints]);

  const handlePlotLayout = (event: LayoutChangeEvent) => {
    setPlotWidth(event.nativeEvent.layout.width);
  };

  if (!data.hasData) {
    return (
      <View style={[styles.emptyContainer, { height, borderColor, backgroundColor: surfaceSoftColor }]}>
        <Button
          title={t('dashboard.weightAddData')}
          variant="secondary"
          onPress={onAddPress}
          style={styles.emptyButton}
        />
      </View>
    );
  }

  const minLabel =
    data.minValue === null ? '' : formatAxisValue(data.minValue, locale);
  const maxLabel =
    data.maxValue === null ? '' : formatAxisValue(data.maxValue, locale);

  return (
    <View style={styles.wrapper}>
      <View style={styles.chartRow}>
        <View style={[styles.yAxis, { height }]}>
          <ThemedText
            lightColor={textSecondaryColor}
            darkColor={textSecondaryColor}
            style={styles.axisLabel}
            numberOfLines={1}>
            {maxLabel}
          </ThemedText>
          <View style={styles.axisSpacer} />
          <ThemedText
            lightColor={textSecondaryColor}
            darkColor={textSecondaryColor}
            style={styles.axisLabel}
            numberOfLines={1}>
            {minLabel}
          </ThemedText>
        </View>

        <View style={[styles.plot, { height }]} onLayout={handlePlotLayout}>
          {plotWidth > 0 ? (
            <>
              <LinearGradient
                colors={[`${accentColor}00`, `${accentColor}33`]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={[styles.gradient, { height: height * 0.92 }]}
              />
              {segments.map((segment) => (
                <View
                  key={segment.key}
                  style={[
                    styles.segment,
                    {
                      width: segment.length,
                      backgroundColor: accentColor,
                      left: segment.centerX - segment.length / 2,
                      top: segment.centerY - LINE_WIDTH / 2,
                      transform: [{ rotate: `${segment.angle}deg` }],
                    },
                  ]}
                />
              ))}
              {chartPoints.map((point, index) => (
                <View
                  key={`${index}-${point.x}`}
                  style={[
                    styles.dot,
                    {
                      width: DOT_SIZE,
                      height: DOT_SIZE,
                      borderRadius: DOT_SIZE / 2,
                      backgroundColor: accentColor,
                      left: point.x - DOT_SIZE / 2,
                      top: point.y - DOT_SIZE / 2,
                    },
                  ]}
                />
              ))}
            </>
          ) : null}
        </View>
      </View>

      <View style={styles.xAxis}>
        <View style={{ width: Y_AXIS_WIDTH }} />
        <View style={styles.xLabels}>
          {data.points.map((point) => (
            <ThemedText
              key={point.date}
              lightColor={textSecondaryColor}
              darkColor={textSecondaryColor}
              style={styles.xLabel}
              numberOfLines={1}>
              {formatPointDate(point.date, locale)}
            </ThemedText>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.xxs,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: Spacing.xs,
  },
  yAxis: {
    width: Y_AXIS_WIDTH,
    justifyContent: 'space-between',
    paddingVertical: CHART_PADDING,
  },
  axisLabel: {
    ...Typography.caption,
    fontSize: 10,
    lineHeight: 12,
    textAlign: 'right',
  },
  axisSpacer: {
    flex: 1,
  },
  plot: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  segment: {
    position: 'absolute',
    height: LINE_WIDTH,
    borderRadius: Radius.full,
  },
  dot: {
    position: 'absolute',
  },
  xAxis: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  xLabels: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  xLabel: {
    ...Typography.caption,
    flex: 1,
    fontSize: 10,
    lineHeight: 12,
    textAlign: 'center',
  },
  emptyContainer: {
    width: '100%',
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  emptyButton: {
    minWidth: 148,
  },
});
