import { StyleSheet, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Palette, Radius } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

type PlusLockIconProps = {
  size?: number;
  color?: string;
};

export function PlusLockIcon({ size = 14, color }: PlusLockIconProps) {
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  return <IconSymbol name="lock.fill" size={size} color={color ?? textSecondaryColor} />;
}

type PlusLockBadgeProps = {
  size?: number;
};

export function PlusLockBadge({ size = 11 }: PlusLockBadgeProps) {
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const surfaceColor = useThemeColor({}, 'surfaceElevated');
  const borderColor = useThemeColor({}, 'border');

  return (
    <View style={[styles.badge, { backgroundColor: surfaceColor, borderColor }]}>
      <IconSymbol name="lock.fill" size={size} color={textSecondaryColor} />
    </View>
  );
}

export function PlusLockButtonIcon() {
  return <PlusLockIcon size={16} color={Palette.onDark} />;
}

const styles = StyleSheet.create({
  badge: {
    width: 22,
    height: 22,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
