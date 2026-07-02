import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Rect } from 'react-native-svg';

type TrendEmptyIllustrationProps = {
  width?: number;
  height?: number;
  color?: string;
};

const BAR_WIDTH = 5;
const BAR_GAP = 7;
const BAR_HEIGHTS = [18, 28, 14, 22];
const LINE_POINTS = [
  { x: 0, y: 10 },
  { x: 12, y: 4 },
  { x: 24, y: 14 },
  { x: 36, y: 6 },
];

export function TrendEmptyIllustration({
  width = 52,
  height = 36,
  color = 'rgba(161, 161, 170, 0.55)',
}: TrendEmptyIllustrationProps) {
  const barsWidth = BAR_WIDTH * BAR_HEIGHTS.length + BAR_GAP * (BAR_HEIGHTS.length - 1);
  const offsetX = (width - barsWidth) / 2;
  const baselineY = height - 2;

  return (
    <View style={[styles.wrapper, { width, height }]}>
      <Svg width={width} height={height}>
        {BAR_HEIGHTS.map((barHeight, index) => {
          const x = offsetX + index * (BAR_WIDTH + BAR_GAP);

          return (
            <Rect
              key={`bar-${index}`}
              x={x}
              y={baselineY - barHeight}
              width={BAR_WIDTH}
              height={barHeight}
              rx={2}
              fill={color}
              opacity={0.35}
            />
          );
        })}

        {LINE_POINTS.map((point, index) => {
          const x = offsetX + point.x;
          const y = baselineY - point.y;

          return (
            <Circle
              key={`dot-${index}`}
              cx={x}
              cy={y}
              r={2.5}
              fill={color}
              opacity={0.7}
            />
          );
        })}

        {LINE_POINTS.slice(0, -1).map((point, index) => {
          const next = LINE_POINTS[index + 1];
          const x1 = offsetX + point.x;
          const y1 = baselineY - point.y;
          const x2 = offsetX + next.x;
          const y2 = baselineY - next.y;

          return (
            <Line
              key={`line-${index}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={color}
              strokeWidth={1.5}
              strokeDasharray="3 3"
              opacity={0.7}
            />
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
