import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { PET_SPECIES_ICONS } from '@/constants/pet-species';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { PetSpecies } from '@/types/pet';

const ICON_SIZE_DEFAULT = 80;
const ICON_SIZE_COMPACT = 64;

type PetSpeciesOptionProps = {
  species: PetSpecies;
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
  compact?: boolean;
};

export function PetSpeciesOption({
  species,
  label,
  selected,
  onPress,
  disabled = false,
  compact = false,
}: PetSpeciesOptionProps) {
  const iconSize = compact ? ICON_SIZE_COMPACT : ICON_SIZE_DEFAULT;
  const brandAccentColor = useThemeColor({}, 'brandAccent');
  const brandAccentSoft = useThemeColor({}, 'brandAccentSoft');
  const brandAccentBorder = useThemeColor({}, 'brandAccentBorder');
  const borderColor = useThemeColor({}, 'border');
  const surfaceColor = useThemeColor({}, 'surface');
  const primaryTextColor = useThemeColor({}, 'primaryText');
  const textColor = useThemeColor({}, 'text');

  const handlePress = () => {
    if (disabled) {
      return;
    }

    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled }}
      accessibilityLabel={label}
      disabled={disabled}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.option,
        compact ? styles.optionCompact : null,
        {
          backgroundColor: selected ? brandAccentSoft : surfaceColor,
          borderColor: selected ? brandAccentColor : borderColor,
          borderWidth: selected ? 2 : StyleSheet.hairlineWidth,
          opacity: disabled ? 0.5 : pressed ? 0.88 : 1,
        },
      ]}>
      {selected ? (
        <View style={[styles.checkBadge, { backgroundColor: brandAccentColor, borderColor: brandAccentBorder }]}>
          <ThemedText lightColor={primaryTextColor} darkColor={primaryTextColor} style={styles.checkmark}>
            ✓
          </ThemedText>
        </View>
      ) : null}

      <Image
        accessibilityIgnoresInvertColors
        contentFit="contain"
        source={PET_SPECIES_ICONS[species]}
        style={{ width: iconSize, height: iconSize }}
      />

      <ThemedText
        type="defaultSemiBold"
        lightColor={selected ? brandAccentColor : textColor}
        darkColor={selected ? brandAccentColor : textColor}
        style={styles.label}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  option: {
    flex: 1,
    minHeight: 148,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  optionCompact: {
    minHeight: 120,
    paddingTop: Spacing.md,
  },
  checkBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 24,
    height: 24,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
  },
  label: {
    ...Typography.bodySemiBold,
    textAlign: 'center',
  },
});
