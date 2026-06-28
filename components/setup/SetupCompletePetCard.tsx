import { StyleSheet, View } from 'react-native';

import { PetAvatar } from '@/components/pet/PetAvatar';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/Card';
import { Palette, Spacing, Typography } from '@/constants/theme';
import { usePetDisplay } from '@/hooks/use-pet-display';
import { useTranslation } from '@/hooks/use-translation';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { Pet, PetSex } from '@/types/pet';
import { getPetAgeParts } from '@/utils/pet-age';

type SetupCompletePetCardProps = {
  pet: Pet;
};

function getSexSymbol(sex: PetSex | null | undefined): string | null {
  if (sex === 'female') {
    return '♀';
  }

  if (sex === 'male') {
    return '♂';
  }

  return null;
}

function formatPetAgeLabel(
  birthDate: string | null | undefined,
  t: (key: string, params?: Record<string, string | number>) => string
): string | null {
  if (!birthDate) {
    return null;
  }

  const parts = getPetAgeParts(birthDate);
  if (!parts) {
    return null;
  }

  const { years, months } = parts;

  if (years === 0) {
    return t('reports.petCard.ageMonths', { months });
  }

  if (months === 0) {
    return t('reports.petCard.ageYears', { years });
  }

  return t('reports.petCard.ageYearsMonths', { years, months });
}

export function SetupCompletePetCard({ pet }: SetupCompletePetCardProps) {
  const { t } = useTranslation();
  const { displayPetSpecies, displayPetBreed } = usePetDisplay();
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const brandAccentColor = useThemeColor({}, 'brandAccent');

  const sexSymbol = getSexSymbol(pet.sex);
  const ageLabel = formatPetAgeLabel(pet.birthDate, t);
  const speciesLabel = displayPetSpecies(pet.species);
  const breedLabel = pet.breed?.trim() ? displayPetBreed(pet.breed) : null;

  const detailsLabel = [breedLabel ?? speciesLabel, ageLabel].filter(Boolean).join(' • ');

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <PetAvatar
          photoUri={pet.photoUri}
          species={pet.species}
          size={80}
          accentBorder
          accentColor={brandAccentColor}
        />
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <ThemedText type="defaultSemiBold" style={styles.name} numberOfLines={1}>
              {pet.name}
            </ThemedText>
            {sexSymbol ? (
              <ThemedText
                lightColor={Palette.badgePink}
                darkColor={Palette.badgePink}
                style={styles.sexSymbol}>
                {sexSymbol}
              </ThemedText>
            ) : null}
          </View>
          <ThemedText
            lightColor={textSecondaryColor}
            darkColor={textSecondaryColor}
            style={styles.details}
            numberOfLines={2}>
            {detailsLabel}
          </ThemedText>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  info: {
    flex: 1,
    gap: Spacing.xs,
    minWidth: 0,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  name: {
    ...Typography.subtitle,
    flexShrink: 1,
  },
  sexSymbol: {
    fontSize: 20,
    lineHeight: 24,
  },
  details: {
    ...Typography.body,
    fontSize: 17,
    lineHeight: 24,
  },
});
