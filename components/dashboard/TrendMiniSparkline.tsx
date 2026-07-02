import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Palette, Radius, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import { formatWeekdayShort, parseLocalDate } from '@/utils/date';
import { getLocaleTag } from '@/utils/locale';
import {
  normalizeTrendChartPoints,
  type TrendChartDay,
  type TrendDailyStatus,
} from '@/utils/trends';

const DOT_SIZE = 6;
const LINE_WIDTH = 2;
const CHART_PADDING = 2;

const STATUS_COLORS: Record<Exclude<TrendDailyStatus, 'no_data'>, string> = {
  normal: Palette.success,
  attention: Palette.error,
  not_observed: Palette.muted,
};

type TrendMiniSparklineProps = {
  chartDays: TrendChartDay[];
  accentColor: string;
  useStatusColors?: boolean;
  height?: number;
};

type ChartPoint = {
  x: number;
  y: number;
  status: TrendDailyStatus;
};

type ChartSegment = {
  key: string;
  length: number;
  angle: number;
  centerX: number;
  centerY: number;
  color: string;
};

function getChartPoints(
  width: number,
  height: number,
  chartDays: TrendChartDay[],
  normalizedPoints: (number | null)[]
): ChartPoint[] {
  if (width <= 0 || chartDays.length === 0) {
    return [];
  }

  const chartHeight = height - CHART_PADDING * 2;
  const slotCount = Math.max(chartDays.length - 1, 1);

  return chartDays.flatMap((day, index) => {
    const point = normalizedPoints[index];
    if (point === null) {
      return [];
    }

    return [
      {
        x: (index / slotCount) * width,
        y: CHART_PADDING + (1 - point) * chartHeight,
        status: day.status,
      },
    ];
  });
}

function getChartSegments(chartPoints: ChartPoint[], accentColor: string): ChartSegment[] {
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

    const endColor =
      end.status === 'no_data'
        ? accentColor
        : STATUS_COLORS[end.status as Exclude<TrendDailyStatus, 'no_data'>] ?? accentColor;

    segments.push({
      key: `${index}-${start.x}-${end.x}`,
      length,
      angle: (Math.atan2(deltaY, deltaX) * 180) / Math.PI,
      centerX: (start.x + end.x) / 2,
      centerY: (start.y + end.y) / 2,
      color: endColor,
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

export function TrendMiniSparkline({
  chartDays,
  accentColor,
  useStatusColors = true,
  height = 44,
}: TrendMiniSparklineProps) {
  const { language } = useTranslation();
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const [width, setWidth] = useState(0);
  const locale = getLocaleTag(language);

  const normalizedPoints = useMemo(() => normalizeTrendChartPoints(chartDays), [chartDays]);
  const chartPoints = useMemo(
    () => getChartPoints(width, height, chartDays, normalizedPoints),
    [chartDays, height, normalizedPoints, width]
  );
  const segments = useMemo(
    () => getChartSegments(chartPoints, accentColor),
    [accentColor, chartPoints]
  );

  const handleLayout = (event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  };

  const getDotColor = (status: TrendDailyStatus) => {
    if (!useStatusColors || status === 'no_data') {
      return accentColor;
    }

    return STATUS_COLORS[status];
  };

  return (
    <View style={styles.wrapper}>
      <View style={[styles.chart, { height }]} onLayout={handleLayout}>
        {width > 0 && chartPoints.length > 0 ? (
          <>
            <LinearGradient
              colors={[`${accentColor}00`, `${accentColor}33`]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={[styles.gradient, { height: height * 0.9 }]}
            />
            {segments.map((segment) => (
              <View
                key={segment.key}
                style={[
                  styles.segment,
                  {
                    width: segment.length,
                    backgroundColor: segment.color,
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
                    backgroundColor: getDotColor(point.status),
                    left: point.x - DOT_SIZE / 2,
                    top: point.y - DOT_SIZE / 2,
                  },
                ]}
              />
            ))}
          </>
        ) : (
          <View style={[styles.emptyChart, { height }]} />
        )}
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
  chart: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  emptyChart: {
    width: '100%',
    opacity: 0.15,
    borderRadius: Radius.sm,
    backgroundColor: Palette.mutedSoft,
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
