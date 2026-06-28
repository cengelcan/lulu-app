import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';

type PetAvatarProps = {
  photoUri?: string | null;
  size?: number;
  accentBorder?: boolean;
  accentColor?: string;
};

export function PetAvatar({
  photoUri,
  size = 72,
  accentBorder = false,
  accentColor,
}: PetAvatarProps) {
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const brandAccentColor = useThemeColor({}, 'brandAccent');
  const brandAccentGlow = useThemeColor({}, 'brandAccentGlow');
  const iconColor = useThemeColor({}, 'icon');

  const resolvedAccentColor = accentColor ?? brandAccentColor;
  const resolvedBorderColor = accentBorder ? resolvedAccentColor : borderColor;
  const resolvedBorderWidth = accentBorder ? 2 : 1;

  const avatarStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    borderColor: resolvedBorderColor,
    ...(accentBorder
      ? {
          shadowColor: brandAccentGlow,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 1,
          shadowRadius: 10,
          elevation: 6,
        }
      : null),
  };

  if (photoUri) {
    return (
      <Image
        accessibilityLabel="Pet photo"
        contentFit="cover"
        source={{ uri: photoUri }}
        style={[styles.avatar, avatarStyle, { borderWidth: resolvedBorderWidth }]}
      />
    );
  }

  return (
    <View
      accessibilityLabel="Pet photo placeholder"
      style={[
        styles.placeholder,
        avatarStyle,
        { backgroundColor: surfaceColor, borderWidth: resolvedBorderWidth },
      ]}>
      <IconSymbol name="pawprint.fill" size={Math.round(size * 0.45)} color={iconColor} />
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {},
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
