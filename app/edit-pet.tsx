import { useNavigation } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { GroupedSection } from '@/components/pet/GroupedSection';
import { PetAvatar } from '@/components/pet/PetAvatar';
import { SelectableOption } from '@/components/setup/selectable-option';
import { ThemedText } from '@/components/themed-text';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import {
  HEALTH_CONDITION_OPTIONS,
  PET_AGE_GROUP_OPTIONS,
  PET_SEX_OPTIONS,
  PET_SPAY_NEUTER_STATUS_OPTIONS,
  PET_SPECIES_OPTIONS,
} from '@/constants/check-in';
import { getBreedOptionsForSpecies, isBreedValidForSpecies } from '@/constants/pet-breeds';
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
import {
  arePetFormSnapshotsEqual,
  buildPetFormSnapshot,
  getPetFormSnapshot,
} from '@/utils/pet-form-snapshot';

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
  const navigation = useNavigation();
  const allowExitRef = useRef(false);

  const pet = usePetStore((state) => state.pet);
  const petIsLoading = usePetStore((state) => state.isLoading);
  const petError = usePetStore((state) => state.error);
  const loadPet = usePetStore((state) => state.loadPet);
  const updatePet = usePetStore((state) => state.updatePet);
  const clearError = usePetStore((state) => state.clearError);

  const [species, setSpecies] = useState<PetSpecies | null>(() => pet?.species ?? null);
  const [breed, setBreed] = useState<string | null>(() => pet?.breed ?? null);
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

  const isDirty = useMemo(() => {
    if (!pet || species === null || ageGroup === null) {
      return false;
    }

    const currentSnapshot = buildPetFormSnapshot({
      name,
      species,
      breed,
      ageGroup,
      healthConditions,
      photoUri,
      color,
      sex,
      spayNeuterStatus,
      birthDate,
      adoptionDate,
      microchipId,
      ownerName,
    });

    return !arePetFormSnapshotsEqual(currentSnapshot, getPetFormSnapshot(pet));
  }, [
    adoptionDate,
    ageGroup,
    birthDate,
    breed,
    color,
    healthConditions,
    microchipId,
    name,
    ownerName,
    pet,
    photoUri,
    sex,
    spayNeuterStatus,
    species,
  ]);

  useEffect(() => {
    void loadPet();
  }, [loadPet]);

  useEffect(() => {
    if (!petIsLoading && !pet) {
      router.dismissTo('/(tabs)/home');
    }
  }, [pet, petIsLoading, router]);

  useEffect(() => {
    if (!pet) {
      return;
    }

    setSpecies(pet.species);
    setBreed(pet.breed ?? null);
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

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (event) => {
      if (allowExitRef.current || !isDirty || isSaving) {
        return;
      }

      event.preventDefault();

      Alert.alert('Discard changes?', 'You have unsaved changes to this pet profile.', [
        { text: 'Keep Editing', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => {
            allowExitRef.current = true;
            navigation.dispatch(event.data.action);
          },
        },
      ]);
    });

    return unsubscribe;
  }, [isDirty, isSaving, navigation]);

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
        breed,
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
      allowExitRef.current = true;
      router.back();
    } catch {
      // Store already sets error state.
    } finally {
      setIsSaving(false);
    }
  }, [
    adoptionDate,
    ageGroup,
    birthDate,
    breed,
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
  const canSave = isDirty && !isSaving;

  if (petIsLoading || !pet) {
    return (
      <>
        <Stack.Screen options={{ headerShown: true, title: 'Edit Pet' }} />
        <ScreenContainer edges={['bottom']} contentStyle={styles.centered}>
          <ActivityIndicator color={primaryColor} size="large" />
        </ScreenContainer>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Edit Pet',
          headerRight: () => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Save"
              disabled={!canSave}
              hitSlop={8}
              onPress={() => void handleSave()}
              style={({ pressed }) => [
                {
                  opacity: !canSave ? 0.4 : pressed ? 0.6 : 1,
                  paddingHorizontal: Spacing.sm,
                },
              ]}>
              <ThemedText lightColor={primaryColor} darkColor={primaryColor} type="defaultSemiBold">
                Save
              </ThemedText>
            </Pressable>
          ),
        }}
      />
      <ScreenContainer scrollable edges={['bottom']} contentStyle={styles.content}>
        <View style={styles.body}>
          <GroupedSection title="Profile Photo">
            <View style={styles.formSectionBody}>
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
          </GroupedSection>

          <GroupedSection title="Pet Type">
            <View style={styles.formSectionBody}>
              {PET_SPECIES_OPTIONS.map((option) => (
                <SelectableOption
                  key={option.value}
                  label={option.label}
                  selected={species === option.value}
                  onPress={() => {
                    setValidationError(null);
                    clearError();
                    if (breed && !isBreedValidForSpecies(breed, option.value)) {
                      setBreed(null);
                    }
                    setSpecies(option.value);
                  }}
                />
              ))}
            </View>
          </GroupedSection>

          {species ? (
            <GroupedSection title="Breed">
              <View style={styles.formSectionBody}>
                <ThemedText
                  lightColor={textSecondaryColor}
                  darkColor={textSecondaryColor}
                  style={styles.optionalHint}>
                  Optional
                </ThemedText>
                {getBreedOptionsForSpecies(species).map((option) => (
                  <SelectableOption
                    key={option.value}
                    label={option.label}
                    selected={breed === option.value}
                    onPress={() => {
                      setValidationError(null);
                      clearError();
                      setBreed(breed === option.value ? null : option.value);
                    }}
                  />
                ))}
              </View>
            </GroupedSection>
          ) : null}

          <GroupedSection title="Basic Information">
            <View style={styles.formSectionBody}>
              <ThemedText type="defaultSemiBold">Pet Name</ThemedText>
              <TextInput
                accessibilityLabel="Pet name"
                autoCapitalize="words"
                autoCorrect={false}
                maxLength={PET_NAME_MAX_LENGTH}
                placeholder="Pet name"
                placeholderTextColor={textSecondaryColor}
                returnKeyType="done"
                style={[styles.input, { color: textColor, backgroundColor: surfaceColor, borderColor }]}
                value={name}
                onChangeText={(value) => {
                  setValidationError(null);
                  clearError();
                  setName(value);
                }}
              />
              <ThemedText type="defaultSemiBold">Color</ThemedText>
              <ThemedText style={styles.optionalHint}>Optional</ThemedText>
              <TextInput
                accessibilityLabel="Pet color"
                autoCapitalize="words"
                autoCorrect={false}
                maxLength={PET_COLOR_MAX_LENGTH}
                placeholder="e.g. Golden, Black and white"
                placeholderTextColor={textSecondaryColor}
                returnKeyType="done"
                style={[styles.input, { color: textColor, backgroundColor: surfaceColor, borderColor }]}
                value={color}
                onChangeText={(value) => {
                  setValidationError(null);
                  clearError();
                  setColor(value);
                }}
              />
              <ThemedText type="defaultSemiBold">Age Group</ThemedText>
              {PET_AGE_GROUP_OPTIONS.map((option) => (
                <SelectableOption
                  key={option.value}
                  label={option.label}
                  selected={ageGroup === option.value}
                  onPress={() => {
                    setValidationError(null);
                    clearError();
                    setAgeGroup(option.value);
                  }}
                />
              ))}
            </View>
          </GroupedSection>

          <GroupedSection title="Health Information">
            <View style={styles.formSectionBody}>
              <ThemedText type="defaultSemiBold">Sex</ThemedText>
              <ThemedText style={styles.optionalHint}>Optional</ThemedText>
              {PET_SEX_OPTIONS.map((option) => (
                <SelectableOption
                  key={option.value}
                  label={option.label}
                  selected={sex === option.value}
                  onPress={() => {
                    setValidationError(null);
                    clearError();
                    setSex(sex === option.value ? null : option.value);
                  }}
                />
              ))}
              <ThemedText type="defaultSemiBold">Spay / Neuter Status</ThemedText>
              <ThemedText style={styles.optionalHint}>Optional</ThemedText>
              {PET_SPAY_NEUTER_STATUS_OPTIONS.map((option) => (
                <SelectableOption
                  key={option.value}
                  label={option.label}
                  selected={spayNeuterStatus === option.value}
                  onPress={() => {
                    setValidationError(null);
                    clearError();
                    setSpayNeuterStatus(
                      spayNeuterStatus === option.value ? null : option.value
                    );
                  }}
                />
              ))}
              <ThemedText type="defaultSemiBold">Birth Date</ThemedText>
              <ThemedText style={styles.optionalHint}>Optional · YYYY-MM-DD</ThemedText>
              <TextInput
                accessibilityLabel="Birth date"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="numbers-and-punctuation"
                placeholder="YYYY-MM-DD"
                placeholderTextColor={textSecondaryColor}
                returnKeyType="done"
                style={[styles.input, { color: textColor, backgroundColor: surfaceColor, borderColor }]}
                value={birthDate}
                onChangeText={(value) => {
                  setValidationError(null);
                  clearError();
                  setBirthDate(value);
                }}
              />
              <ThemedText type="defaultSemiBold">Health Conditions</ThemedText>
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
          </GroupedSection>

          <GroupedSection title="Additional Information">
            <View style={styles.formSectionBody}>
              <ThemedText type="defaultSemiBold">Adoption Date</ThemedText>
              <ThemedText style={styles.optionalHint}>Optional · YYYY-MM-DD</ThemedText>
              <TextInput
                accessibilityLabel="Adoption date"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="numbers-and-punctuation"
                placeholder="YYYY-MM-DD"
                placeholderTextColor={textSecondaryColor}
                returnKeyType="done"
                style={[styles.input, { color: textColor, backgroundColor: surfaceColor, borderColor }]}
                value={adoptionDate}
                onChangeText={(value) => {
                  setValidationError(null);
                  clearError();
                  setAdoptionDate(value);
                }}
              />
              <ThemedText type="defaultSemiBold">Microchip ID</ThemedText>
              <ThemedText style={styles.optionalHint}>Optional</ThemedText>
              <TextInput
                accessibilityLabel="Microchip ID"
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={PET_MICROCHIP_MAX_LENGTH}
                placeholder="Microchip ID"
                placeholderTextColor={textSecondaryColor}
                returnKeyType="done"
                style={[styles.input, { color: textColor, backgroundColor: surfaceColor, borderColor }]}
                value={microchipId}
                onChangeText={(value) => {
                  setValidationError(null);
                  clearError();
                  setMicrochipId(value);
                }}
              />
              <ThemedText type="defaultSemiBold">Owner Name</ThemedText>
              <ThemedText style={styles.optionalHint}>Optional</ThemedText>
              <TextInput
                accessibilityLabel="Owner name"
                autoCapitalize="words"
                autoCorrect={false}
                maxLength={PET_OWNER_MAX_LENGTH}
                placeholder="Owner name"
                placeholderTextColor={textSecondaryColor}
                returnKeyType="done"
                style={[styles.input, { color: textColor, backgroundColor: surfaceColor, borderColor }]}
                value={ownerName}
                onChangeText={(value) => {
                  setValidationError(null);
                  clearError();
                  setOwnerName(value);
                }}
              />
            </View>
          </GroupedSection>
        </View>

        {errorMessage ? (
          <ThemedText
            lightColor={textSecondaryColor}
            darkColor={textSecondaryColor}
            style={styles.error}>
            {errorMessage}
          </ThemedText>
        ) : null}
      </ScreenContainer>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
  },
  body: {
    gap: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formSectionBody: {
    padding: Spacing.md,
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
    marginBottom: Spacing.md,
  },
});
