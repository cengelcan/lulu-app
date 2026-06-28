import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { PET_SPECIES_ICON_PORTRAIT_CROP, PET_SPECIES_ICONS } from '@/constants/pet-species';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { PetSpecies } from '@/types/pet';

type PetAvatarProps = {
  photoUri?: string | null;
  species?: PetSpecies | null;
  size?: number;
  accentBorder?: boolean;
  accentColor?: string;
};

export function PetAvatar({
  photoUri,
  species = null,
  size = 72,
  accentBorder = false,
  accentColor,
}: PetAvatarProps) {
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const brandAccentColor = useThemeColor({}, 'brandAccent');
  const brandAccentSoft = useThemeColor({}, 'brandAccentSoft');
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

  const portraitCrop = species ? PET_SPECIES_ICON_PORTRAIT_CROP[species] : null;
  const portraitIconSize = portraitCrop ? size * portraitCrop.scale : 0;

  return (
    <View
      accessibilityLabel="Pet photo placeholder"
      style={[
        styles.placeholder,
        avatarStyle,
        {
          backgroundColor: species ? brandAccentSoft : surfaceColor,
          borderWidth: resolvedBorderWidth,
        },
      ]}>
      {species && portraitCrop ? (
        <Image
          accessibilityIgnoresInvertColors
          contentFit="contain"
          source={PET_SPECIES_ICONS[species]}
          style={{
            position: 'absolute',
            width: portraitIconSize,
            height: portraitIconSize,
            top: size * portraitCrop.offsetY,
            left: (size - portraitIconSize) / 2 + size * portraitCrop.offsetX,
          }}
        />
      ) : (
        <IconSymbol name="pawprint.fill" size={Math.round(size * 0.45)} color={iconColor} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {},
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
