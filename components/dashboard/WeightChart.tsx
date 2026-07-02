import { useMemo, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Defs, Line, LinearGradient as SvgGradient, Path, Stop } from 'react-native-svg';

import { WeightEmptyIllustration, WeightScaleIcon } from '@/components/dashboard/WeightEmptyIllustration';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import { formatLocalDate, getTodayStart, isTodayLocalDate, parseLocalDate } from '@/utils/date';
import { getLocaleTag } from '@/utils/locale';
import {
  formatWeightDelta,
  getWeightChartAxisTicks,
  getWeightChartChange,
  normalizeWeightChartValues,
  WEIGHT_CHANGE_PERIOD_DAYS,
  type WeightChartData,
} from '@/utils/weight-chart';

const DOT_SIZE = 7;
const LAST_DOT_SIZE = 11;
const LINE_WIDTH = 2;
const CHART_PADDING_TOP = 6;
const CHART_PADDING_BOTTOM = 6;
const Y_AXIS_WIDTH = 42;
const Y_AXIS_LABEL_LINE_HEIGHT = 12;
const X_AXIS_HEIGHT = 14;
const DEFAULT_HEIGHT = 120;

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

function formatLastLogDate(
  dateKey: string,
  locale: string,
  t: (key: string) => string
): string {
  if (isTodayLocalDate(dateKey)) {
    return t('common.today');
  }

  const yesterday = new Date(getTodayStart());
  yesterday.setDate(yesterday.getDate() - 1);

  if (dateKey === formatLocalDate(yesterday)) {
    return t('dashboard.weightLastLogYesterday');
  }

  return formatPointDate(dateKey, locale);
}

function getChartPointX(index: number, pointCount: number, width: number): number {
  const slotCount = Math.max(pointCount - 1, 1);
  return (index / slotCount) * width;
}

function getChartPointY(normalizedValue: number, height: number): number {
  const chartHeight = height - CHART_PADDING_TOP - CHART_PADDING_BOTTOM;
  return CHART_PADDING_TOP + (1 - normalizedValue) * chartHeight;
}

function getGuideYPositions(height: number): { high: number; mid: number; low: number } {
  const chartHeight = height - CHART_PADDING_TOP - CHART_PADDING_BOTTOM;

  return {
    high: CHART_PADDING_TOP,
    mid: CHART_PADDING_TOP + chartHeight / 2,
    low: height - CHART_PADDING_BOTTOM,
  };
}

function getChartPoints(
  width: number,
  height: number,
  normalizedValues: number[]
): ChartPoint[] {
  if (width <= 0 || normalizedValues.length === 0) {
    return [];
  }

  return normalizedValues.map((value, index) => ({
    x: getChartPointX(index, normalizedValues.length, width),
    y: getChartPointY(value, height),
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

function buildAreaPath(chartPoints: ChartPoint[], height: number): string {
  if (chartPoints.length === 0) {
    return '';
  }

  const bottom = height - CHART_PADDING_BOTTOM;
  const first = chartPoints[0];
  const last = chartPoints[chartPoints.length - 1];

  let path = `M ${first.x} ${bottom} L ${first.x} ${first.y}`;

  for (let index = 1; index < chartPoints.length; index += 1) {
    const point = chartPoints[index];
    path += ` L ${point.x} ${point.y}`;
  }

  path += ` L ${last.x} ${bottom} Z`;
  return path;
}

export function WeightChart({
  data,
  onAddPress,
  accentColor = Palette.badgeViolet,
  height = DEFAULT_HEIGHT,
}: WeightChartProps) {
  const { t, language } = useTranslation();
  const locale = getLocaleTag(language);
  const titleColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');
  const surfaceSoftColor = useThemeColor({}, 'surfaceSoft');
  const canvasColor = useThemeColor({}, 'background');
  const [plotWidth, setPlotWidth] = useState(0);

  const change = useMemo(
    () => (data.hasData ? getWeightChartChange(data.points) : null),
    [data]
  );

  const axisTicks = useMemo(() => {
    if (!data.hasData || data.minValue === null || data.maxValue === null) {
      return null;
    }

    return getWeightChartAxisTicks(data.minValue, data.maxValue);
  }, [data]);

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
  const areaPath = useMemo(() => buildAreaPath(chartPoints, height), [chartPoints, height]);

  const handlePlotLayout = (event: LayoutChangeEvent) => {
    setPlotWidth(event.nativeEvent.layout.width);
  };

  if (!data.hasData) {
    return (
      <View
        style={[
          styles.emptyContainer,
          { borderColor, backgroundColor: surfaceSoftColor },
        ]}>
        <View style={styles.emptyContent}>
          <WeightEmptyIllustration
            accentColor={accentColor}
            borderColor={borderColor}
          />
          <View style={styles.emptyTextBlock}>
            <ThemedText
              lightColor={titleColor}
              darkColor={titleColor}
              style={styles.emptyTitle}>
              {t('dashboard.weightEmptyTitle')}
            </ThemedText>
            <ThemedText
              lightColor={textSecondaryColor}
              darkColor={textSecondaryColor}
              style={styles.emptyDescription}>
              {t('dashboard.weightEmptyDescription')}
            </ThemedText>
            <Button
              title={t('dashboard.weightAddData')}
              variant="primary"
              onPress={onAddPress}
              leadingIcon={<WeightScaleIcon size={16} color={Palette.onDark} />}
              style={styles.emptyButton}
            />
          </View>
        </View>
      </View>
    );
  }

  const unitLabel = data.unit ? t(`records.units.${data.unit}`) : '';
  const latest = data.latest;
  const lastLogLabel = latest ? formatLastLogDate(latest.date, locale, t) : '—';

  const changeLabel = (() => {
    if (!change || !data.unit) {
      return '—';
    }

    const delta = `${formatWeightDelta(change.valueDelta, locale)} ${unitLabel}`;

    if (change.percentDelta === null) {
      return t('dashboard.weightChangeValueNoPercent', { delta });
    }

    const percent = Math.abs(change.percentDelta).toLocaleString(locale, {
      maximumFractionDigits: 1,
      minimumFractionDigits: Number.isInteger(Math.abs(change.percentDelta)) ? 0 : 1,
    });

    return t('dashboard.weightChangeValue', { delta, percent });
  })();

  const changeColor =
    change && change.valueDelta > 0
      ? Palette.success
      : change && change.valueDelta < 0
        ? Palette.warning
        : titleColor;

  const guideYs = useMemo(() => getGuideYPositions(height), [height]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.chartRow}>
        <View style={[styles.yAxis, { height }]}>
          {axisTicks ? (
            <>
              <ThemedText
                lightColor={textSecondaryColor}
                darkColor={textSecondaryColor}
                style={[
                  styles.axisLabel,
                  styles.yAxisValue,
                  { top: guideYs.high - Y_AXIS_LABEL_LINE_HEIGHT / 2 },
                ]}
                numberOfLines={1}>
                {formatAxisValue(axisTicks.max, locale)}
              </ThemedText>
              <ThemedText
                lightColor={textSecondaryColor}
                darkColor={textSecondaryColor}
                style={[
                  styles.axisLabel,
                  styles.yAxisValue,
                  { top: guideYs.mid - Y_AXIS_LABEL_LINE_HEIGHT / 2 },
                ]}
                numberOfLines={1}>
                {formatAxisValue(axisTicks.mid, locale)}
              </ThemedText>
              <ThemedText
                lightColor={textSecondaryColor}
                darkColor={textSecondaryColor}
                style={[
                  styles.axisLabel,
                  styles.yAxisValue,
                  { top: guideYs.low - Y_AXIS_LABEL_LINE_HEIGHT / 2 },
                ]}
                numberOfLines={1}>
                {formatAxisValue(axisTicks.min, locale)}
              </ThemedText>
            </>
          ) : null}
        </View>

        <View style={[styles.plot, { height }]} onLayout={handlePlotLayout}>
          {plotWidth > 0 ? (
            <>
              <Svg width={plotWidth} height={height} style={StyleSheet.absoluteFill}>
                <Defs>
                  <SvgGradient id="weightAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor={accentColor} stopOpacity="0.28" />
                    <Stop offset="1" stopColor={accentColor} stopOpacity="0" />
                  </SvgGradient>
                </Defs>
                {guideYs ? (
                  <>
                    <Line
                      x1={0}
                      y1={guideYs.high}
                      x2={plotWidth}
                      y2={guideYs.high}
                      stroke={borderColor}
                      strokeWidth={1}
                      opacity={0.55}
                    />
                    <Line
                      x1={0}
                      y1={guideYs.mid}
                      x2={plotWidth}
                      y2={guideYs.mid}
                      stroke={borderColor}
                      strokeWidth={1}
                      opacity={0.35}
                    />
                    <Line
                      x1={0}
                      y1={guideYs.low}
                      x2={plotWidth}
                      y2={guideYs.low}
                      stroke={borderColor}
                      strokeWidth={1}
                      opacity={0.55}
                    />
                  </>
                ) : null}
                {areaPath ? (
                  <Path d={areaPath} fill="url(#weightAreaGradient)" />
                ) : null}
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
              {chartPoints.map((point, index) => {
                const isLast = index === chartPoints.length - 1;
                const size = isLast ? LAST_DOT_SIZE : DOT_SIZE;

                return (
                  <View
                    key={`${index}-${point.x}`}
                    style={[
                      styles.dot,
                      isLast ? styles.lastDot : styles.dotGlow,
                      {
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        backgroundColor: accentColor,
                        shadowColor: accentColor,
                        borderWidth: isLast ? 2 : 0,
                        borderColor: isLast ? canvasColor : 'transparent',
                        left: point.x - size / 2,
                        top: point.y - size / 2,
                      },
                    ]}
                  />
                );
              })}
            </>
          ) : null}
        </View>
      </View>

      <View style={styles.xAxis}>
        <View style={{ width: Y_AXIS_WIDTH + Spacing.xs }} />
        <View
          style={[
            styles.xLabels,
            plotWidth > 0 ? { width: plotWidth } : null,
            { height: X_AXIS_HEIGHT },
          ]}>
          {plotWidth > 0
            ? data.points.map((point, index) => {
                const x = getChartPointX(index, data.points.length, plotWidth);
                const isFirst = index === 0;
                const isLast = index === data.points.length - 1;

                return (
                  <ThemedText
                    key={point.date}
                    lightColor={textSecondaryColor}
                    darkColor={textSecondaryColor}
                    style={[
                      styles.xLabel,
                      isFirst
                        ? styles.xLabelFirst
                        : isLast
                          ? styles.xLabelLast
                          : { left: x, transform: [{ translateX: '-50%' }] },
                    ]}
                    numberOfLines={1}>
                    {formatPointDate(point.date, locale)}
                  </ThemedText>
                );
              })
            : null}
        </View>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <IconSymbol name="calendar" size={13} color={accentColor} />
          <View style={styles.summaryText}>
            <ThemedText
              lightColor={textSecondaryColor}
              darkColor={textSecondaryColor}
              style={styles.summaryLabel}
              numberOfLines={1}>
              {t('dashboard.weightLastLog')}
            </ThemedText>
            <ThemedText
              lightColor={titleColor}
              darkColor={titleColor}
              style={styles.summaryValue}
              numberOfLines={1}>
              {lastLogLabel}
            </ThemedText>
          </View>
        </View>

        <View style={styles.summaryItem}>
          <IconSymbol name="chart.line.uptrend.xyaxis" size={13} color={accentColor} />
          <View style={styles.summaryText}>
            <ThemedText
              lightColor={textSecondaryColor}
              darkColor={textSecondaryColor}
              style={styles.summaryLabel}
              numberOfLines={1}>
              {t('dashboard.weightChangePeriod', { days: String(WEIGHT_CHANGE_PERIOD_DAYS) })}
            </ThemedText>
            <ThemedText
              lightColor={changeColor}
              darkColor={changeColor}
              style={styles.summaryValue}
              numberOfLines={1}>
              {changeLabel}
            </ThemedText>
          </View>
        </View>
      </View>

      <Button
        title={t('dashboard.weightAddData')}
        variant="primary"
        onPress={onAddPress}
        leadingIcon={<WeightScaleIcon size={16} color={Palette.onDark} />}
        style={styles.logButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.sm,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: Spacing.xs,
  },
  yAxis: {
    width: Y_AXIS_WIDTH,
    position: 'relative',
  },
  yAxisValue: {
    position: 'absolute',
    right: 0,
  },
  axisLabel: {
    ...Typography.caption,
    fontSize: 10,
    lineHeight: Y_AXIS_LABEL_LINE_HEIGHT,
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
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  dot: {
    position: 'absolute',
  },
  dotGlow: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  lastDot: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.65,
    shadowRadius: 6,
  },
  xAxis: {
    flexDirection: 'row',
  },
  xLabels: {
    position: 'relative',
    flex: 1,
  },
  xLabel: {
    ...Typography.caption,
    position: 'absolute',
    top: 0,
    fontSize: 10,
    lineHeight: X_AXIS_HEIGHT,
    textAlign: 'center',
    minWidth: 28,
  },
  xLabelFirst: {
    left: 0,
    textAlign: 'left',
  },
  xLabelLast: {
    right: 0,
    textAlign: 'right',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: Spacing.lg,
    paddingHorizontal: Spacing.xs,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xxs,
    flexShrink: 1,
    maxWidth: '46%',
  },
  summaryText: {
    flex: 1,
    gap: 1,
    minWidth: 0,
  },
  summaryLabel: {
    ...Typography.caption,
    fontSize: 10,
    lineHeight: 13,
  },
  summaryValue: {
    ...Typography.caption,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  logButton: {
    alignSelf: 'stretch',
    minHeight: 42,
  },
  emptyContainer: {
    width: '100%',
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
  },
  emptyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  emptyTextBlock: {
    flex: 1,
    gap: Spacing.xs,
  },
  emptyTitle: {
    ...Typography.bodySemiBold,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
  },
  emptyDescription: {
    ...Typography.caption,
    fontSize: 13,
    lineHeight: 18,
  },
  emptyButton: {
    alignSelf: 'flex-start',
    minHeight: 40,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.xxs,
  },
});
