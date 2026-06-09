import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, TextInput, View } from 'react-native';

import { SelectableOption } from '@/components/setup/selectable-option';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import {
  HEALTH_CONDITION_OPTIONS,
  PET_AGE_GROUP_OPTIONS,
  PET_SPECIES_OPTIONS,
} from '@/constants/check-in';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import {
  validateAgeGroup,
  validatePetName,
  validateSpecies,
} from '@/stores/setup.store';
import { usePetStore } from '@/stores/pet.store';
import type { HealthCondition, PetAgeGroup, PetSpecies } from '@/types/pet';
import { PET_NAME_MAX_LENGTH } from '@/types/pet';

type OptionSectionProps<T extends string> = {
  title: string;
  options: { value: T; label: string }[];
  selected: T | null;
  onSelect: (value: T) => void;
};

function OptionSection<T extends string>({
  title,
  options,
  selected,
  onSelect,
}: OptionSectionProps<T>) {
  return (
    <View style={styles.section}>
      <ThemedText type="subtitle">{title}</ThemedText>
      {options.map((option) => (
        <SelectableOption
          key={option.value}
          label={option.label}
          selected={selected === option.value}
          onPress={() => onSelect(option.value)}
        />
      ))}
    </View>
  );
}

function toggleHealthCondition(
  current: HealthCondition[],
  condition: HealthCondition
): HealthCondition[] {
  if (condition === 'none') {
    return ['none'];
  }

  const withoutNone = current.filter((item) => item !== 'none');

  if (withoutNone.includes(condition)) {
    return withoutNone.filter((item) => item !== condition);
  }

  return [...withoutNone, condition];
}

export default function EditPetScreen() {
  const router = useRouter();

  const pet = usePetStore((state) => state.pet);
  const petIsLoading = usePetStore((state) => state.isLoading);
  const petError = usePetStore((state) => state.error);
  const loadPet = usePetStore((state) => state.loadPet);
  const updatePet = usePetStore((state) => state.updatePet);
  const clearError = usePetStore((state) => state.clearError);

  const [species, setSpecies] = useState<PetSpecies | null>(() => pet?.species ?? null);
  const [name, setName] = useState(() => pet?.name ?? '');
  const [ageGroup, setAgeGroup] = useState<PetAgeGroup | null>(() => pet?.ageGroup ?? null);
  const [healthConditions, setHealthConditions] = useState<HealthCondition[]>(
    () => pet?.healthConditions ?? []
  );
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const surfaceColor = useThemeColor({}, 'surface');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  useEffect(() => {
    void loadPet();
  }, [loadPet]);

  useEffect(() => {
    if (!petIsLoading && !pet) {
      router.replace('/(main)/dashboard');
    }
  }, [pet, petIsLoading, router]);

  useEffect(() => {
    if (!pet) {
      return;
    }

    setSpecies(pet.species);
    setName(pet.name);
    setAgeGroup(pet.ageGroup);
    setHealthConditions(pet.healthConditions);
  }, [pet?.id]);

  const handleSave = useCallback(async () => {
    if (!pet) {
      return;
    }

    const nameError = validatePetName(name);
    if (nameError) {
      setValidationError(nameError);
      return;
    }

    const speciesError = validateSpecies(species);
    if (speciesError) {
      setValidationError(speciesError);
      return;
    }

    const ageGroupError = validateAgeGroup(ageGroup);
    if (ageGroupError) {
      setValidationError(ageGroupError);
      return;
    }

    if (species === null || ageGroup === null) {
      return;
    }

    setValidationError(null);
    clearError();
    setIsSaving(true);

    try {
      await updatePet({
        ...pet,
        name: name.trim(),
        species,
        ageGroup,
        healthConditions,
      });
      router.replace('/(main)/dashboard');
    } catch {
      // Store already sets error state.
    } finally {
      setIsSaving(false);
    }
  }, [ageGroup, clearError, healthConditions, name, pet, router, species, updatePet]);

  const errorMessage = validationError ?? petError;

  if (petIsLoading || !pet) {
    return (
      <ScreenContainer contentStyle={styles.centered}>
        <ActivityIndicator color={primaryColor} size="large" />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable contentStyle={styles.content}>
      <View style={styles.body}>
        <ThemedText type="title">Edit Pet</ThemedText>
        <ThemedText
          lightColor={textSecondaryColor}
          darkColor={textSecondaryColor}
          style={styles.description}>
          Update your pet&apos;s profile information.
        </ThemedText>

        <OptionSection
          title="Pet Type"
          options={PET_SPECIES_OPTIONS}
          selected={species}
          onSelect={(value) => {
            setValidationError(null);
            clearError();
            setSpecies(value);
          }}
        />

        <View style={styles.section}>
          <ThemedText type="subtitle">Pet Name</ThemedText>
          <TextInput
            accessibilityLabel="Pet name"
            autoCapitalize="words"
            autoCorrect={false}
            maxLength={PET_NAME_MAX_LENGTH}
            placeholder="Pet name"
            placeholderTextColor={textSecondaryColor}
            returnKeyType="done"
            style={[
              styles.input,
              {
                color: textColor,
                backgroundColor: surfaceColor,
                borderColor,
              },
            ]}
            value={name}
            onChangeText={(value) => {
              setValidationError(null);
              clearError();
              setName(value);
            }}
          />
        </View>

        <OptionSection
          title="Age Group"
          options={PET_AGE_GROUP_OPTIONS}
          selected={ageGroup}
          onSelect={(value) => {
            setValidationError(null);
            clearError();
            setAgeGroup(value);
          }}
        />

        <View style={styles.section}>
          <ThemedText type="subtitle">Health Conditions</ThemedText>
          {HEALTH_CONDITION_OPTIONS.map((option) => (
            <SelectableOption
              key={option.value}
              label={option.label}
              selected={healthConditions.includes(option.value)}
              onPress={() => {
                setValidationError(null);
                clearError();
                setHealthConditions((current) => toggleHealthCondition(current, option.value));
              }}
            />
          ))}
        </View>
      </View>

      {errorMessage ? (
        <ThemedText
          lightColor={textSecondaryColor}
          darkColor={textSecondaryColor}
          style={styles.error}>
          {errorMessage}
        </ThemedText>
      ) : null}

      <Button
        title="Save"
        onPress={() => void handleSave()}
        disabled={isSaving}
        style={styles.button}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  body: {
    flex: 1,
    gap: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  description: {
    ...Typography.body,
  },
  section: {
    gap: Spacing.sm,
  },
  input: {
    ...Typography.body,
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    minHeight: 52,
  },
  error: {
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  button: {
    marginBottom: Spacing.md,
  },
});
