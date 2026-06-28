import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { BrandGradientTokens } from '@/constants/theme';

type BrandGradientProps = {
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  pointerEvents?: 'none' | 'auto' | 'box-none' | 'box-only';
};

export function BrandGradient({ style, children, pointerEvents }: BrandGradientProps) {
  return (
    <LinearGradient
      colors={[...BrandGradientTokens.colors]}
      start={BrandGradientTokens.start}
      end={BrandGradientTokens.end}
      pointerEvents={pointerEvents}
      style={style}>
      {children}
    </LinearGradient>
  );
}

export function BrandGradientFill({ style }: { style?: StyleProp<ViewStyle> }) {
  return <BrandGradient pointerEvents="none" style={[StyleSheet.absoluteFill, style]} />;
}
