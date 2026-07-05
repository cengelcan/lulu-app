import { Pressable, StyleSheet, View } from 'react-native';

import { PetAvatar } from '@/components/pet/PetAvatar';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { usePetDisplay } from '@/hooks/use-pet-display';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { Pet } from '@/types/pet';

type SharedPetCardProps = {
  pet: Pet;
  onPress?: () => void;
};

export function SharedPetCard({ pet, onPress }: SharedPetCardProps) {
  const { displayPetSpecies, displayPetAgeGroup } = usePetDisplay();
  const surfaceColor = useThemeColor({}, 'surfaceElevated');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');

  const subtitle = `${displayPetSpecies(pet.species)} · ${displayPetAgeGroup(pet.ageGroup)}`;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: surfaceColor, borderColor, opacity: pressed ? 0.85 : 1 },
      ]}>
      <View style={styles.avatarWrap}>
        <PetAvatar photoUri={pet.photoUri} species={pet.species} size={120} />
      </View>
      <View style={styles.footer}>
        <ThemedText type="defaultSemiBold" numberOfLines={1}>
          {pet.name}
        </ThemedText>
        <ThemedText
          lightColor={textSecondaryColor}
          darkColor={textSecondaryColor}
          numberOfLines={1}
          style={styles.subtitle}>
          {subtitle}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 140,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  avatarWrap: {
    alignItems: 'center',
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  footer: {
    padding: Spacing.sm,
    gap: 2,
  },
  subtitle: {
    ...Typography.caption,
  },
});
