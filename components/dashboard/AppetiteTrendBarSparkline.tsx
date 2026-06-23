import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { Radius } from '@/constants/theme';

type AppetiteTrendBarSparklineProps = {
  points: number[];
  color: string;
  height?: number;
};

export function AppetiteTrendBarSparkline({
  points,
  color,
  height = 40,
}: AppetiteTrendBarSparklineProps) {
  if (points.length === 0) {
    return <View style={[styles.empty, { height }]} />;
  }

  return (
    <View style={[styles.container, { height }]}>
      {points.map((point, index) => {
        const barHeight = Math.max(6, point * height);

        return (
          <View key={`${index}-${point}`} style={styles.barSlot}>
            <LinearGradient
              colors={[`${color}44`, color]}
              start={{ x: 0.5, y: 1 }}
              end={{ x: 0.5, y: 0 }}
              style={[styles.bar, { height: barHeight }]}
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
    gap: 3,
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
    borderTopLeftRadius: Radius.xs,
    borderTopRightRadius: Radius.xs,
    width: '100%',
  },
});
