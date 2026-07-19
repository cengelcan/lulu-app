import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';

import { PetAvatar } from '@/components/pet/PetAvatar';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { usePetDisplay } from '@/hooks/use-pet-display';
import { useTranslation } from '@/hooks/use-translation';
import type { Pet } from '@/types/pet';

type PetProfileCardProps = {
  pet: Pet;
  onPress: () => void;
};

export function PetProfileCard({
  pet,
  onPress,
}: PetProfileCardProps) {
  const { t } = useTranslation();
  const { fontScale } = useWindowDimensions();
  const { displayPetBreed, displayPetSpecies } = usePetDisplay();
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  const breedLabel = pet.breed?.trim()
    ? displayPetBreed(pet.breed)
    : displayPetSpecies(pet.species);

  const handlePress = () => {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('dashboard.petProfileA11y', { name: pet.name })}
      onPress={handlePress}
      style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}>
      <Card>
        <View style={styles.topRow}>
          <PetAvatar photoUri={pet.photoUri} size={56} />
          <View style={styles.info}>
            <ThemedText
              type="defaultSemiBold"
              style={styles.petName}
              numberOfLines={fontScale >= 1.4 ? undefined : 1}>
              {pet.name}
            </ThemedText>
            <ThemedText
              lightColor={textSecondaryColor}
              darkColor={textSecondaryColor}
              style={styles.breed}
              numberOfLines={fontScale >= 1.4 ? undefined : 1}>
              {breedLabel}
            </ThemedText>
          </View>
          <IconSymbol name="chevron.right" size={20} color={textSecondaryColor} />
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  info: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  petName: {
    ...Typography.bodySemiBold,
    fontSize: 17,
  },
  breed: {
    ...Typography.caption,
  },
});
