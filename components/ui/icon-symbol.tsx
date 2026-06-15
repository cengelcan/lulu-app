// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
export type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chart.line.uptrend.xyaxis': 'trending-up',
  'doc.text.fill': 'description',
  'pills.fill': 'medication',
  'lock.fill': 'lock',
  'pawprint.fill': 'pets',
  'checkmark': 'check',
  'pencil': 'edit',
  'gearshape.fill': 'settings',
  'person.fill': 'person',
  'star.fill': 'star',
  'square.and.arrow.up': 'share',
  'camera.fill': 'photo-camera',
  'arrow.up.right': 'open-in-new',
  'fork.knife.circle': 'restaurant',
  'arrow.down.circle': 'arrow-circle-down',
  'arrow.up.circle': 'arrow-circle-up',
  'checkmark.circle': 'check-circle',
  'drop': 'water-drop',
  'drop.halffull': 'opacity',
  'drop.fill': 'water-drop',
  'drop.triangle.fill': 'invert-colors',
  'humidity.fill': 'water',
  'battery.0percent': 'battery-0-bar',
  'battery.25percent': 'battery-2-bar',
  'battery.50percent': 'battery-4-bar',
  'battery.75percent': 'battery-6-bar',
  'bolt.fill': 'bolt',
  'wind': 'air',
  'cloud.bolt': 'thunderstorm',
  'face.smiling': 'sentiment-satisfied',
  'heart.fill': 'favorite',
  'sparkles': 'auto-awesome',
  'exclamationmark.triangle': 'warning',
  'arrow.down': 'south',
  'arrow.up': 'north',
  'eye.slash': 'visibility-off',
  'circle.lefthalf.filled': 'contrast',
  'circle.righthalf.filled': 'contrast',
  'xmark.circle': 'cancel',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
