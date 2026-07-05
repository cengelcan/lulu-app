import { StyleSheet, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { getFamilyIconPreset } from '@/constants/family-icons';
import { Radius } from '@/constants/theme';

type FamilyIconAvatarProps = {
  iconKey: string | null | undefined;
  size?: number;
};

export function FamilyIconAvatar({ iconKey, size = 56 }: FamilyIconAvatarProps) {
  const preset = getFamilyIconPreset(iconKey);
  const iconSize = Math.round(size * 0.45);

  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: preset.backgroundColor,
        },
      ]}>
      <IconSymbol name={preset.icon} size={iconSize} color={preset.iconColor} />
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
