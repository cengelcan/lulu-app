import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';

import { Radius } from '@/constants/theme';

const DOT_SIZE = 5;
const LINE_WIDTH = 2;
const CHART_PADDING = 4;

type TrendLineSparklineProps = {
  points: number[];
  color: string;
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

function getChartPoints(width: number, height: number, points: number[]): ChartPoint[] {
  if (points.length === 0 || width <= 0) {
    return [];
  }

  const chartHeight = height - CHART_PADDING * 2;

  if (points.length === 1) {
    return [{ x: width / 2, y: CHART_PADDING + (1 - points[0]) * chartHeight }];
  }

  return points.map((point, index) => ({
    x: (index / (points.length - 1)) * width,
    y: CHART_PADDING + (1 - point) * chartHeight,
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

export function TrendLineSparkline({
  points,
  color,
  height = 40,
}: TrendLineSparklineProps) {
  const [width, setWidth] = useState(0);

  const chartPoints = useMemo(
    () => getChartPoints(width, height, points),
    [height, points, width]
  );
  const segments = useMemo(() => getChartSegments(chartPoints), [chartPoints]);

  const handleLayout = (event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  };

  if (points.length === 0) {
    return <View style={[styles.empty, { height }]} />;
  }

  return (
    <View style={[styles.container, { height }]} onLayout={handleLayout}>
      {width > 0 ? (
        <>
          <LinearGradient
            colors={[`${color}00`, `${color}40`]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={[styles.gradient, { height: height * 0.85 }]}
          />
          {segments.map((segment) => (
            <View
              key={segment.key}
              style={[
                styles.segment,
                {
                  width: segment.length,
                  backgroundColor: color,
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
                  backgroundColor: color,
                  left: point.x - DOT_SIZE / 2,
                  top: point.y - DOT_SIZE / 2,
                },
              ]}
            />
          ))}
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  empty: {
    width: '100%',
    opacity: 0.2,
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
});
