import { StyleSheet, View } from 'react-native';

import { Radius } from '@/constants/theme';

type SparklineProps = {
  points: number[];
  color: string;
  variant?: 'line' | 'bar';
  height?: number;
};

export function Sparkline({
  points,
  color,
  variant = 'bar',
  height = 32,
}: SparklineProps) {
  if (points.length === 0) {
    return <View style={[styles.empty, { height }]} />;
  }

  if (variant === 'line') {
    return (
      <View style={[styles.container, { height }]}>
        {points.map((point, index) => {
          const dotSize = 4;
          const bottom = Math.max(0, Math.min(height - dotSize, point * (height - dotSize)));

          return (
            <View key={`${index}-${point}`} style={styles.lineSlot}>
              <View
                style={[
                  styles.lineDot,
                  {
                    width: dotSize,
                    height: dotSize,
                    borderRadius: Radius.full,
                    backgroundColor: color,
                    bottom,
                  },
                ]}
              />
            </View>
          );
        })}
      </View>
    );
  }

  return (
    <View style={[styles.container, { height }]}>
      {points.map((point, index) => {
        const barHeight = Math.max(4, point * height);

        return (
          <View key={`${index}-${point}`} style={styles.barSlot}>
            <View
              style={[
                styles.bar,
                {
                  height: barHeight,
                  backgroundColor: color,
                },
              ]}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    width: '100%',
  },
  empty: {
    width: '100%',
    opacity: 0.2,
  },
  barSlot: {
    flex: 1,
    justifyContent: 'flex-end',
    minWidth: 0,
  },
  bar: {
    borderRadius: Radius.xs,
    width: '100%',
  },
  lineSlot: {
    flex: 1,
    minWidth: 0,
    position: 'relative',
  },
  lineDot: {
    position: 'absolute',
    left: '50%',
    marginLeft: -2,
  },
});
