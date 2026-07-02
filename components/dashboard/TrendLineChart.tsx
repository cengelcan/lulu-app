import { useMemo, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Line } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import { formatWeekdayShort, parseLocalDate } from '@/utils/date';
import { getLocaleTag } from '@/utils/locale';
import type { TrendChartDay } from '@/utils/trends';

const DOT_SIZE = 7;
const LINE_WIDTH = 2;
const CHART_PADDING = 6;
const Y_AXIS_WIDTH = 42;
const DEFAULT_HEIGHT = 88;

type TrendLineChartProps = {
  chartDays: TrendChartDay[];
  accentColor: string;
  axisLabels: {
    top: string;
    middle: string;
    bottom: string;
  };
  height?: number;
};

type ChartPoint = {
  x: number;
  y: number;
  index: number;
};

type ChartSegment = {
  key: string;
  length: number;
  angle: number;
  centerX: number;
  centerY: number;
};

function getYForPosition(position: number, height: number): number {
  const chartHeight = height - CHART_PADDING * 2;
  return CHART_PADDING + (1 - position) * chartHeight;
}

function getChartPoints(
  width: number,
  height: number,
  chartDays: TrendChartDay[],
  positions: (number | null)[]
): ChartPoint[] {
  if (width <= 0 || chartDays.length === 0) {
    return [];
  }

  const slotCount = Math.max(chartDays.length - 1, 1);

  return chartDays.flatMap((day, index) => {
    const position = positions[index];
    if (position === null) {
      return [];
    }

    return [
      {
        x: (index / slotCount) * width,
        y: getYForPosition(position, height),
        index,
      },
    ];
  });
}

function getChartSegments(chartPoints: ChartPoint[]): ChartSegment[] {
  const segments: ChartSegment[] = [];

  for (let index = 1; index < chartPoints.length; index += 1) {
    const start = chartPoints[index - 1];
    const end = chartPoints[index];

    if (end.index - start.index > 1) {
      continue;
    }

    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;
    const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (length === 0) {
      continue;
    }

    segments.push({
      key: `${start.index}-${end.index}`,
      length,
      angle: (Math.atan2(deltaY, deltaX) * 180) / Math.PI,
      centerX: (start.x + end.x) / 2,
      centerY: (start.y + end.y) / 2,
    });
  }

  return segments;
}

function formatWeekdayLetter(dateKey: string, locale: string): string {
  const date = parseLocalDate(dateKey);
  if (!date) {
    return '';
  }

  return formatWeekdayShort(date, locale).charAt(0).toUpperCase();
}

export function TrendLineChart({
  chartDays,
  accentColor,
  axisLabels,
  height = DEFAULT_HEIGHT,
}: TrendLineChartProps) {
  const { language } = useTranslation();
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');
  const [plotWidth, setPlotWidth] = useState(0);
  const locale = getLocaleTag(language);

  const positions = useMemo(
    () => chartDays.map((day) => day.value),
    [chartDays]
  );
  const chartPoints = useMemo(
    () => getChartPoints(plotWidth, height, chartDays, positions),
    [chartDays, height, plotWidth, positions]
  );
  const segments = useMemo(() => getChartSegments(chartPoints), [chartPoints]);

  const handlePlotLayout = (event: LayoutChangeEvent) => {
    setPlotWidth(event.nativeEvent.layout.width);
  };

  const highGuideY = CHART_PADDING;
  const lowGuideY = height - CHART_PADDING;

  return (
    <View style={styles.wrapper}>
      <View style={styles.chartRow}>
        <View style={[styles.yAxis, { height }]}>
          <ThemedText
            lightColor={textSecondaryColor}
            darkColor={textSecondaryColor}
            style={styles.axisLabel}
            numberOfLines={1}>
            {axisLabels.top}
          </ThemedText>
          <ThemedText
            lightColor={textSecondaryColor}
            darkColor={textSecondaryColor}
            style={styles.axisLabel}
            numberOfLines={1}>
            {axisLabels.middle}
          </ThemedText>
          <ThemedText
            lightColor={textSecondaryColor}
            darkColor={textSecondaryColor}
            style={styles.axisLabel}
            numberOfLines={1}>
            {axisLabels.bottom}
          </ThemedText>
        </View>

        <View style={[styles.plot, { height }]} onLayout={handlePlotLayout}>
          {plotWidth > 0 ? (
            <>
              <Svg width={plotWidth} height={height} style={StyleSheet.absoluteFill}>
                <Line
                  x1={0}
                  y1={highGuideY}
                  x2={plotWidth}
                  y2={highGuideY}
                  stroke={borderColor}
                  strokeWidth={1}
                  strokeDasharray="4 4"
                  opacity={0.7}
                />
                <Line
                  x1={0}
                  y1={lowGuideY}
                  x2={plotWidth}
                  y2={lowGuideY}
                  stroke={borderColor}
                  strokeWidth={1}
                  strokeDasharray="4 4"
                  opacity={0.7}
                />
              </Svg>

              {segments.map((segment) => (
                <View
                  key={segment.key}
                  style={[
                    styles.segment,
                    styles.segmentGlow,
                    {
                      width: segment.length,
                      backgroundColor: accentColor,
                      shadowColor: accentColor,
                      left: segment.centerX - segment.length / 2,
                      top: segment.centerY - LINE_WIDTH / 2,
                      transform: [{ rotate: `${segment.angle}deg` }],
                    },
                  ]}
                />
              ))}
              {chartPoints.map((point) => (
                <View
                  key={point.index}
                  style={[
                    styles.dot,
                    styles.dotGlow,
                    {
                      width: DOT_SIZE,
                      height: DOT_SIZE,
                      borderRadius: DOT_SIZE / 2,
                      backgroundColor: accentColor,
                      shadowColor: accentColor,
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
        <View style={{ width: Y_AXIS_WIDTH + Spacing.xs }} />
        <View style={styles.xLabels}>
          {chartDays.map((day) => (
            <ThemedText
              key={day.date}
              lightColor={textSecondaryColor}
              darkColor={textSecondaryColor}
              style={styles.xLabel}
              numberOfLines={1}>
              {formatWeekdayLetter(day.date, locale)}
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
    paddingVertical: CHART_PADDING - 2,
  },
  axisLabel: {
    ...Typography.caption,
    fontSize: 10,
    lineHeight: 12,
    textAlign: 'right',
  },
  plot: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  segment: {
    position: 'absolute',
    height: LINE_WIDTH,
    borderRadius: Radius.full,
  },
  segmentGlow: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 4,
  },
  dot: {
    position: 'absolute',
  },
  dotGlow: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 5,
  },
  xAxis: {
    flexDirection: 'row',
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
});
