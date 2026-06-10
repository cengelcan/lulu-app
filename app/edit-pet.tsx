import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { PetAvatar } from '@/components/pet/PetAvatar';
import { SelectableOption } from '@/components/setup/selectable-option';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import {
  HEALTH_CONDITION_OPTIONS,
  PET_AGE_GROUP_OPTIONS,
  PET_SEX_OPTIONS,
  PET_SPAY_NEUTER_STATUS_OPTIONS,
  PET_SPECIES_OPTIONS,
} from '@/constants/check-in';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import {
  validateAgeGroup,
  validateOptionalColor,
  validateOptionalMicrochipId,
  validateOptionalOwnerName,
  validateOptionalPetDate,
  validatePetName,
  validateSpecies,
} from '@/stores/setup.store';
import { pickPetPhotoFromGallery } from '@/services/pet-photo';
import { usePetStore } from '@/stores/pet.store';
import type {
  HealthCondition,
  PetAgeGroup,
  PetSex,
  PetSpayNeuterStatus,
  PetSpecies,
} from '@/types/pet';
import {
  PET_COLOR_MAX_LENGTH,
  PET_MICROCHIP_MAX_LENGTH,
  PET_NAME_MAX_LENGTH,
  PET_OWNER_MAX_LENGTH,
} from '@/types/pet';

type OptionSectionProps<T extends string> = {
  title: string;
  options: { value: T; label: string }[];
  selected: T | null;
  onSelect: (value: T | null) => void;
  optional?: boolean;
};

function OptionSection<T extends string>({
  title,
  options,
  selected,
  onSelect,
  optional = false,
}: OptionSectionProps<T>) {
  return (
    <View style={styles.section}>
      <ThemedText type="subtitle">{title}</ThemedText>
      {optional ? (
        <ThemedText style={styles.optionalHint}>Optional</ThemedText>
      ) : null}
      {options.map((option) => (
        <SelectableOption
          key={option.value}
          label={option.label}
          selected={selected === option.value}
          onPress={() => onSelect(selected === option.value && optional ? null : option.value)}
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

function normalizeOptionalText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function normalizeOptionalDate(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
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
  const [photoUri, setPhotoUri] = useState<string | null>(() => pet?.photoUri ?? null);
  const [color, setColor] = useState(() => pet?.color ?? '');
  const [sex, setSex] = useState<PetSex | null>(() => pet?.sex ?? null);
  const [spayNeuterStatus, setSpayNeuterStatus] = useState<PetSpayNeuterStatus | null>(
    () => pet?.spayNeuterStatus ?? null
  );
  const [birthDate, setBirthDate] = useState(() => pet?.birthDate ?? '');
  const [adoptionDate, setAdoptionDate] = useState(() => pet?.adoptionDate ?? '');
  const [microchipId, setMicrochipId] = useState(() => pet?.microchipId ?? '');
  const [ownerName, setOwnerName] = useState(() => pet?.ownerName ?? '');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPickingPhoto, setIsPickingPhoto] = useState(false);

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
    setPhotoUri(pet.photoUri ?? null);
    setColor(pet.color ?? '');
    setSex(pet.sex ?? null);
    setSpayNeuterStatus(pet.spayNeuterStatus ?? null);
    setBirthDate(pet.birthDate ?? '');
    setAdoptionDate(pet.adoptionDate ?? '');
    setMicrochipId(pet.microchipId ?? '');
    setOwnerName(pet.ownerName ?? '');
  }, [pet?.id]);

  const handleChangePhoto = useCallback(async () => {
    setValidationError(null);
    clearError();
    setIsPickingPhoto(true);

    try {
      const result = await pickPetPhotoFromGallery();

      if (result.ok) {
        setPhotoUri(result.uri);
        return;
      }

      if (result.reason === 'permission_denied') {
        setValidationError('Photo library access is required to choose a pet photo.');
      }
    } finally {
      setIsPickingPhoto(false);
    }
  }, [clearError]);

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

    const colorError = validateOptionalColor(color);
    if (colorError) {
      setValidationError(colorError);
      return;
    }

    const birthDateError = validateOptionalPetDate(birthDate);
    if (birthDateError) {
      setValidationError(birthDateError);
      return;
    }

    const adoptionDateError = validateOptionalPetDate(adoptionDate);
    if (adoptionDateError) {
      setValidationError(adoptionDateError);
      return;
    }

    const microchipError = validateOptionalMicrochipId(microchipId);
    if (microchipError) {
      setValidationError(microchipError);
      return;
    }

    const ownerNameError = validateOptionalOwnerName(ownerName);
    if (ownerNameError) {
      setValidationError(ownerNameError);
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
        photoUri,
        color: normalizeOptionalText(color),
        sex,
        spayNeuterStatus,
        birthDate: normalizeOptionalDate(birthDate),
        adoptionDate: normalizeOptionalDate(adoptionDate),
        microchipId: normalizeOptionalText(microchipId),
        ownerName: normalizeOptionalText(ownerName),
      });
      router.replace('/pet-profile');
    } catch {
      // Store already sets error state.
    } finally {
      setIsSaving(false);
    }
  }, [
    adoptionDate,
    ageGroup,
    birthDate,
    clearError,
    color,
    healthConditions,
    microchipId,
    name,
    ownerName,
    pet,
    photoUri,
    router,
    sex,
    spayNeuterStatus,
    species,
    updatePet,
  ]);

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

        <View style={styles.section}>
          <ThemedText type="subtitle">Profile Photo</ThemedText>
          <View style={styles.photoRow}>
            <PetAvatar photoUri={photoUri} size={88} />
            <Pressable
              accessibilityLabel="Change photo"
              accessibilityRole="button"
              disabled={isPickingPhoto || isSaving}
              onPress={() => void handleChangePhoto()}
              style={({ pressed }) => [
                styles.changePhotoButton,
                {
                  backgroundColor: surfaceColor,
                  borderColor,
                  opacity: pressed || isPickingPhoto || isSaving ? 0.7 : 1,
                },
              ]}>
              {isPickingPhoto ? (
                <ActivityIndicator color={primaryColor} size="small" />
              ) : (
                <ThemedText type="defaultSemiBold">Change Photo</ThemedText>
              )}
            </Pressable>
          </View>
        </View>

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

        <View style={styles.section}>
          <ThemedText type="subtitle">Color</ThemedText>
          <ThemedText style={styles.optionalHint}>Optional</ThemedText>
          <TextInput
            accessibilityLabel="Pet color"
            autoCapitalize="words"
            autoCorrect={false}
            maxLength={PET_COLOR_MAX_LENGTH}
            placeholder="e.g. Golden, Black and white"
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
            value={color}
            onChangeText={(value) => {
              setValidationError(null);
              clearError();
              setColor(value);
            }}
          />
        </View>

        <OptionSection
          title="Sex"
          options={PET_SEX_OPTIONS}
          selected={sex}
          optional
          onSelect={(value) => {
            setValidationError(null);
            clearError();
            setSex(value);
          }}
        />

        <OptionSection
          title="Spay / Neuter Status"
          options={PET_SPAY_NEUTER_STATUS_OPTIONS}
          selected={spayNeuterStatus}
          optional
          onSelect={(value) => {
            setValidationError(null);
            clearError();
            setSpayNeuterStatus(value);
          }}
        />

        <View style={styles.section}>
          <ThemedText type="subtitle">Birth Date</ThemedText>
          <ThemedText style={styles.optionalHint}>Optional</ThemedText>
          <TextInput
            accessibilityLabel="Birth date"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="numbers-and-punctuation"
            placeholder="YYYY-MM-DD"
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
            value={birthDate}
            onChangeText={(value) => {
              setValidationError(null);
              clearError();
              setBirthDate(value);
            }}
          />
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle">Adoption Date</ThemedText>
          <ThemedText style={styles.optionalHint}>Optional</ThemedText>
          <TextInput
            accessibilityLabel="Adoption date"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="numbers-and-punctuation"
            placeholder="YYYY-MM-DD"
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
            value={adoptionDate}
            onChangeText={(value) => {
              setValidationError(null);
              clearError();
              setAdoptionDate(value);
            }}
          />
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle">Microchip ID</ThemedText>
          <ThemedText style={styles.optionalHint}>Optional</ThemedText>
          <TextInput
            accessibilityLabel="Microchip ID"
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={PET_MICROCHIP_MAX_LENGTH}
            placeholder="Microchip ID"
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
            value={microchipId}
            onChangeText={(value) => {
              setValidationError(null);
              clearError();
              setMicrochipId(value);
            }}
          />
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle">Owner Name</ThemedText>
          <ThemedText style={styles.optionalHint}>Optional</ThemedText>
          <TextInput
            accessibilityLabel="Owner name"
            autoCapitalize="words"
            autoCorrect={false}
            maxLength={PET_OWNER_MAX_LENGTH}
            placeholder="Owner name"
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
            value={ownerName}
            onChangeText={(value) => {
              setValidationError(null);
              clearError();
              setOwnerName(value);
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
  optionalHint: {
    ...Typography.caption,
  },
  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  changePhotoButton: {
    flex: 1,
    minHeight: 52,
    borderWidth: 1,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
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
