import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Radius } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

const BADGE_SIZE = 28;

type UserAvatarProps = {
  photoUri?: string | null;
  size?: number;
  showEditBadge?: boolean;
};

export function UserAvatar({ photoUri, size = 88, showEditBadge = false }: UserAvatarProps) {
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const iconColor = useThemeColor({}, 'icon');
  const primaryColor = useThemeColor({}, 'primary');
  const primaryTextColor = useThemeColor({}, 'primaryText');

  const avatarStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    borderColor,
  };

  const avatarContent = photoUri ? (
    <Image
      accessibilityLabel="Profile photo"
      contentFit="cover"
      source={{ uri: photoUri }}
      style={[styles.avatar, avatarStyle]}
    />
  ) : (
    <View
      accessibilityLabel="Profile photo placeholder"
      style={[
        styles.placeholder,
        avatarStyle,
        { backgroundColor: surfaceColor, borderStyle: 'dashed', borderWidth: 1.5 },
      ]}>
      <IconSymbol name="person.fill" size={Math.round(size * 0.45)} color={iconColor} />
    </View>
  );

  if (!showEditBadge) {
    return avatarContent;
  }

  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      {avatarContent}
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[
          styles.editBadge,
          {
            backgroundColor: primaryColor,
            borderColor: surfaceColor,
          },
        ]}>
        <IconSymbol name="camera.fill" size={14} color={primaryTextColor} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  avatar: {
    borderWidth: 1,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: Radius.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
