import { StyleSheet, View } from 'react-native';

import { PET_SPECIES_OPTIONS } from '@/constants/check-in';
import { Spacing } from '@/constants/theme';
import type { PetSpecies } from '@/types/pet';

import { PetSpeciesOption } from './PetSpeciesOption';

type PetSpeciesSelectorProps = {
  selected: PetSpecies | null;
  onSelect: (species: PetSpecies) => void;
  getLabel: (species: PetSpecies) => string;
  disabled?: boolean;
  compact?: boolean;
};

export function PetSpeciesSelector({
  selected,
  onSelect,
  getLabel,
  disabled = false,
  compact = false,
}: PetSpeciesSelectorProps) {
  return (
    <View accessibilityRole="radiogroup" style={styles.row}>
      {PET_SPECIES_OPTIONS.map((option) => (
        <PetSpeciesOption
          key={option.value}
          species={option.value}
          label={getLabel(option.value)}
          selected={selected === option.value}
          onPress={() => onSelect(option.value)}
          disabled={disabled}
          compact={compact}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
});
