import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';

type UserAvatarProps = {
  photoUri?: string | null;
  size?: number;
};

export function UserAvatar({ photoUri, size = 88 }: UserAvatarProps) {
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
        accessibilityLabel="Profile photo"
        contentFit="cover"
        source={{ uri: photoUri }}
        style={[styles.avatar, avatarStyle]}
      />
    );
  }

  return (
    <View
      accessibilityLabel="Profile photo placeholder"
      style={[styles.placeholder, avatarStyle, { backgroundColor: surfaceColor }]}>
      <IconSymbol name="person.fill" size={Math.round(size * 0.45)} color={iconColor} />
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
