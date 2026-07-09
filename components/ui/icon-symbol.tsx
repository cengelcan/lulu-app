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
  'chevron.left': 'chevron-left',
  'chevron.right': 'chevron-right',
  'chart.line.uptrend.xyaxis': 'trending-up',
  'doc.text.fill': 'description',
  'pills.fill': 'medication',
  'lock.fill': 'lock',
  'envelope.fill': 'mail',
  'eye.fill': 'visibility',
  'pawprint.fill': 'pets',
  'checkmark': 'check',
  'checkmark.circle': 'check-circle',
  'pencil': 'edit',
  'gearshape.fill': 'settings',
  'person.fill': 'person',
  'star.fill': 'star',
  'square.and.arrow.up': 'share',
  'camera.fill': 'photo-camera',
  'arrow.up.right': 'open-in-new',
  'fork.knife.circle': 'restaurant',
  'fork.knife': 'restaurant',
  'arrow.down.circle': 'arrow-circle-down',
  'arrow.up.circle': 'arrow-circle-up',
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
  'exclamationmark.circle': 'error-outline',
  'leaf.fill': 'eco',
  'chevron.down': 'expand-more',
  'heart.fill': 'favorite',
  heart: 'favorite-border',
  'sparkles': 'auto-awesome',
  'exclamationmark.triangle': 'warning',
  'arrow.down': 'south',
  'arrow.up': 'north',
  'eye.slash': 'visibility-off',
  'circle.lefthalf.filled': 'contrast',
  'circle.righthalf.filled': 'contrast',
  'xmark.circle': 'cancel',
  circle: 'radio-button-unchecked',
  'cross.case.fill': 'local-hospital',
  'syringe.fill': 'vaccines',
  'ant.fill': 'pest-control',
  'scalemass.fill': 'monitor-weight',
  'scalemass': 'monitor-weight',
  'ellipsis.circle.fill': 'more-horiz',
  'staroflife.fill': 'medical-services',
  'crown.fill': 'workspace-premium',
  'bell.fill': 'notifications',
  'calendar': 'event',
  'calendar.badge.checkmark': 'event-available',
  'clock.fill': 'schedule',
  'plus': 'add',
  'magnifyingglass': 'search',
  'sun.max.fill': 'wb-sunny',
  'moon.fill': 'dark-mode',
  'cloud.sun.fill': 'wb-cloudy',
  'shield.fill': 'shield',
  'slider.horizontal.3': 'tune',
  'arrow.clockwise': 'refresh',
  'chart.bar.fill': 'bar-chart',
  'photo.fill': 'photo',
  'icloud.fill': 'cloud',
  'gift.fill': 'card-giftcard',
  'person.2.fill': 'groups',
  'person.badge.plus': 'person-add',
  'rectangle.portrait.and.arrow.right': 'logout',
  'checkmark.circle.fill': 'check-circle',
  'xmark.circle.fill': 'cancel',
  'xmark': 'close',
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

export function getMaterialIconName(name: IconSymbolName): ComponentProps<typeof MaterialIcons>['name'] {
  return MAPPING[name];
}
