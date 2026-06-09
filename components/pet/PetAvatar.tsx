import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';

type PetAvatarProps = {
  photoUri?: string | null;
  size?: number;
};

export function PetAvatar({ photoUri, size = 72 }: PetAvatarProps) {
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const iconColor = useThemeColor({}, 'icon');

  const avatarStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    borderColor,
  };

  if (photoUri) {
    return (
      <Image
        accessibilityLabel="Pet photo"
        contentFit="cover"
        source={{ uri: photoUri }}
        style={[styles.avatar, avatarStyle]}
      />
    );
  }

  return (
    <View
      accessibilityLabel="Pet photo placeholder"
      style={[styles.placeholder, avatarStyle, { backgroundColor: surfaceColor }]}>
      <IconSymbol name="pawprint.fill" size={Math.round(size * 0.45)} color={iconColor} />
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    borderWidth: 1,
  },
  placeholder: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
