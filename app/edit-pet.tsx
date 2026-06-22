import { useNavigation, usePreventRemove } from '@react-navigation/native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { GroupedSection } from '@/components/pet/GroupedSection';
import { PetAvatar } from '@/components/pet/PetAvatar';
import { SelectableOption } from '@/components/setup/selectable-option';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { DatePickerField } from '@/components/ui/DatePickerField';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import {
  HEALTH_CONDITION_OPTIONS,
  PET_AGE_GROUP_OPTIONS,
  PET_SEX_OPTIONS,
  PET_SPAY_NEUTER_STATUS_OPTIONS,
  PET_SPECIES_OPTIONS,
} from '@/constants/check-in';
import { getBreedOptionsForSpecies, isBreedValidForSpecies } from '@/constants/pet-breeds';
import { STACK_BACK_ONLY_OPTIONS } from '@/constants/navigation';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { usePetDisplay } from '@/hooks/use-pet-display';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
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
import { uploadPetPhoto } from '@/services/sync/pets-sync';
import { usePetStore } from '@/stores/pet.store';
import { useUserStore } from '@/stores/user.store';
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
import { translateValidationError } from '@/utils/translate-error';

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
  const { id: idParam } = useLocalSearchParams<{ id?: string | string[] }>();
  const petId = useMemo(
    () => (Array.isArray(idParam) ? idParam[0] : idParam),
    [idParam]
  );
  const { t } = useTranslation();
  const {
    getSpeciesLabel,
    getBreedLabel,
    getAgeGroupLabel,
    getSexLabel,
    getSpayNeuterLabel,
    getHealthConditionLabel,
  } = usePetDisplay();

  const pet = usePetStore((state) => state.pet);
  const petIsLoading = usePetStore((state) => state.isLoading);
  const petError = usePetStore((state) => state.error);
  const loadPet = usePetStore((state) => state.loadPet);
  const loadPetById = usePetStore((state) => state.loadPetById);
  const updatePet = usePetStore((state) => state.updatePet);
  const deletePet = usePetStore((state) => state.deletePet);
  const setPetStatus = usePetStore((state) => state.setPetStatus);
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
  const [canLeave, setCanLeave] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const isDeceased = pet?.status === 'deceased';

  // Navigation that must wait until the confirm modal is fully dismissed.
  // Navigating away while a React Native <Modal> is still mounted leaves a
  // lingering overlay on iOS that swallows all touches (frozen screen).
  const pendingNavRef = useRef<(() => void) | null>(null);

  const runPendingNav = useCallback(() => {
    const navigate = pendingNavRef.current;
    pendingNavRef.current = null;
    navigate?.();
  }, []);

  const leaveAfterModalClose = useCallback(
    (navigate: () => void) => {
      pendingNavRef.current = navigate;
      // iOS fires the modal's onDismiss after the dismissal animation; Android
      // tears the modal down cleanly, so navigate on the next tick instead.
      if (Platform.OS !== 'ios') {
        runPendingNav();
      }
    },
    [runPendingNav]
  );

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
    if (petId) {
      void loadPetById(petId);
      return;
    }

    void loadPet();
  }, [loadPet, loadPetById, petId]);

  useEffect(() => {
    if (!petIsLoading && !pet && !isDeleting && !isUpdatingStatus) {
      router.dismissTo('/(tabs)/home');
    }
  }, [pet, petIsLoading, router, isDeleting, isUpdatingStatus]);

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

  usePreventRemove(isDirty && !isSaving && !isDeleting && !isUpdatingStatus && !canLeave, ({ data }) => {
    Alert.alert(t('pet.discardTitle'), t('pet.discardMessage'), [
      { text: t('pet.keepEditing'), style: 'cancel' },
      {
        text: t('pet.discard'),
        style: 'destructive',
        onPress: () => navigation.dispatch(data.action),
      },
    ]);
  });

  useEffect(() => {
    if (!canLeave) {
      return;
    }

    router.back();
  }, [canLeave, router]);

  const handleChangePhoto = useCallback(async () => {
    setValidationError(null);
    clearError();
    setIsPickingPhoto(true);

    try {
      const result = await pickPetPhotoFromGallery();

      if (!result.ok) {
        if (result.reason === 'permission_denied') {
          setValidationError(t('pet.photoPermissionError'));
        }
        return;
      }

      // Upload the picked image to cloud storage so the photo syncs across
      // devices; fall back to the local uri if the upload fails (best-effort).
      let nextPhotoUri = result.uri;
      const userId = useUserStore.getState().userId;

      if (userId && pet && result.base64) {
        try {
          nextPhotoUri = await uploadPetPhoto(userId, pet.id, result.base64, result.mimeType);
        } catch (uploadError) {
          console.warn('Failed to upload pet photo to cloud', uploadError);
        }
      }

      setPhotoUri(nextPhotoUri);
    } finally {
      setIsPickingPhoto(false);
    }
  }, [clearError, pet, t]);

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
      setCanLeave(true);
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
    sex,
    spayNeuterStatus,
    species,
    updatePet,
  ]);

  const handleConfirmDelete = useCallback(async () => {
    if (!pet) {
      return;
    }

    setIsDeleting(true);

    try {
      await deletePet(pet.id);
      leaveAfterModalClose(() => router.dismissTo('/(tabs)/my-pets'));
      setIsDeleteModalVisible(false);
    } catch {
      // Store already sets error state; keep the user on the screen to retry.
      setIsDeleting(false);
    }
  }, [deletePet, leaveAfterModalClose, pet, router]);

  const handleConfirmStatusChange = useCallback(async () => {
    if (!pet) {
      return;
    }

    setIsUpdatingStatus(true);

    try {
      await setPetStatus(pet.id, pet.status === 'deceased' ? 'active' : 'deceased');
      leaveAfterModalClose(() => router.dismissTo('/(tabs)/my-pets'));
      setIsStatusModalVisible(false);
    } catch {
      // Store already sets error state; keep the user on the screen to retry.
      setIsUpdatingStatus(false);
    }
  }, [leaveAfterModalClose, pet, router, setPetStatus]);

  const errorMessage = translateValidationError(t, validationError) ?? petError;
  const canSave = isDirty && !isSaving;

  if (petIsLoading || !pet) {
    return (
      <>
        <Stack.Screen
          options={{
            ...STACK_BACK_ONLY_OPTIONS,
            headerShown: true,
            title: t('pet.editTitle'),
          }}
        />
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
          ...STACK_BACK_ONLY_OPTIONS,
          headerShown: true,
          title: t('pet.editTitle'),
          headerBackButtonMenuEnabled: false,
          headerRight: () => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('pet.saveA11y')}
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
                {t('common.save')}
              </ThemedText>
            </Pressable>
          ),
        }}
      />
      <ScreenContainer scrollable edges={['bottom']} contentStyle={styles.content}>
        <View style={styles.body}>
          <GroupedSection title={t('pet.sections.profilePhoto')}>
            <View style={styles.formSectionBody}>
              <View style={styles.photoRow}>
                <PetAvatar photoUri={photoUri} size={88} />
                <Pressable
                  accessibilityLabel={t('pet.changePhotoA11y')}
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
                    <ThemedText type="defaultSemiBold">{t('pet.changePhoto')}</ThemedText>
                  )}
                </Pressable>
              </View>
            </View>
          </GroupedSection>

          <GroupedSection title={t('pet.sections.petType')}>
            <View style={styles.formSectionBody}>
              {PET_SPECIES_OPTIONS.map((option) => (
                <SelectableOption
                  key={option.value}
                  label={getSpeciesLabel(option.value)}
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
            <GroupedSection title={t('pet.sections.breed')}>
              <View style={styles.formSectionBody}>
                <ThemedText
                  lightColor={textSecondaryColor}
                  darkColor={textSecondaryColor}
                  style={styles.optionalHint}>
                  {t('common.optional')}
                </ThemedText>
                {getBreedOptionsForSpecies(species).map((option) => (
                  <SelectableOption
                    key={option.value}
                    label={getBreedLabel(option.value)}
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

          <GroupedSection title={t('pet.sections.basicInformation')}>
            <View style={styles.formSectionBody}>
              <ThemedText type="defaultSemiBold">{t('pet.fields.petName')}</ThemedText>
              <TextInput
                accessibilityLabel={t('pet.fields.petName')}
                autoCapitalize="words"
                autoCorrect={false}
                maxLength={PET_NAME_MAX_LENGTH}
                placeholder={t('pet.fields.petNamePlaceholder')}
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
              <ThemedText type="defaultSemiBold">{t('pet.fields.color')}</ThemedText>
              <ThemedText style={styles.optionalHint}>{t('common.optional')}</ThemedText>
              <TextInput
                accessibilityLabel={t('pet.fields.color')}
                autoCapitalize="words"
                autoCorrect={false}
                maxLength={PET_COLOR_MAX_LENGTH}
                placeholder={t('pet.fields.colorPlaceholder')}
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
              <ThemedText type="defaultSemiBold">{t('pet.fields.ageGroup')}</ThemedText>
              {PET_AGE_GROUP_OPTIONS.map((option) => (
                <SelectableOption
                  key={option.value}
                  label={getAgeGroupLabel(option.value)}
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

          <GroupedSection title={t('pet.sections.healthInformation')}>
            <View style={styles.formSectionBody}>
              <ThemedText type="defaultSemiBold">{t('pet.fields.sex')}</ThemedText>
              <ThemedText style={styles.optionalHint}>{t('common.optional')}</ThemedText>
              {PET_SEX_OPTIONS.map((option) => (
                <SelectableOption
                  key={option.value}
                  label={getSexLabel(option.value)}
                  selected={sex === option.value}
                  onPress={() => {
                    setValidationError(null);
                    clearError();
                    setSex(sex === option.value ? null : option.value);
                  }}
                />
              ))}
              <ThemedText type="defaultSemiBold">{t('pet.fields.spayNeuter')}</ThemedText>
              <ThemedText style={styles.optionalHint}>{t('common.optional')}</ThemedText>
              {PET_SPAY_NEUTER_STATUS_OPTIONS.map((option) => (
                <SelectableOption
                  key={option.value}
                  label={getSpayNeuterLabel(option.value)}
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
              <ThemedText type="defaultSemiBold">{t('pet.fields.birthDate')}</ThemedText>
              <ThemedText style={styles.optionalHint}>{t('common.optional')}</ThemedText>
              <DatePickerField
                accessibilityLabel={t('pet.fields.birthDate')}
                disabled={isSaving}
                placeholder={t('pet.fields.birthDatePlaceholder')}
                value={birthDate}
                onChange={(nextValue) => {
                  setValidationError(null);
                  clearError();
                  setBirthDate(nextValue);
                }}
              />
              <ThemedText type="defaultSemiBold">{t('pet.fields.healthConditions')}</ThemedText>
              {HEALTH_CONDITION_OPTIONS.map((option) => (
                <SelectableOption
                  key={option.value}
                  label={getHealthConditionLabel(option.value)}
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

          <GroupedSection title={t('pet.sections.additionalInformation')}>
            <View style={styles.formSectionBody}>
              <ThemedText type="defaultSemiBold">{t('pet.fields.adoptionDate')}</ThemedText>
              <ThemedText style={styles.optionalHint}>{t('common.optional')}</ThemedText>
              <DatePickerField
                accessibilityLabel={t('pet.fields.adoptionDate')}
                disabled={isSaving}
                placeholder={t('pet.fields.adoptionDatePlaceholder')}
                value={adoptionDate}
                onChange={(nextValue) => {
                  setValidationError(null);
                  clearError();
                  setAdoptionDate(nextValue);
                }}
              />
              <ThemedText type="defaultSemiBold">{t('pet.fields.microchip')}</ThemedText>
              <ThemedText style={styles.optionalHint}>{t('common.optional')}</ThemedText>
              <TextInput
                accessibilityLabel={t('pet.fields.microchip')}
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={PET_MICROCHIP_MAX_LENGTH}
                placeholder={t('pet.fields.microchipPlaceholder')}
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
              <ThemedText type="defaultSemiBold">{t('pet.fields.ownerName')}</ThemedText>
              <ThemedText style={styles.optionalHint}>{t('common.optional')}</ThemedText>
              <TextInput
                accessibilityLabel={t('pet.fields.ownerName')}
                autoCapitalize="words"
                autoCorrect={false}
                maxLength={PET_OWNER_MAX_LENGTH}
                placeholder={t('pet.fields.ownerNamePlaceholder')}
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

          {isDeceased ? (
            <ThemedText
              lightColor={textSecondaryColor}
              darkColor={textSecondaryColor}
              style={styles.memorialNote}>
              {t('pet.memorialNote', { name: pet.name })}
            </ThemedText>
          ) : null}

          <Button
            accessibilityLabel={isDeceased ? t('pet.restorePetA11y') : t('pet.markDeceasedA11y')}
            title={isDeceased ? t('pet.restorePet') : t('pet.markDeceased')}
            variant="secondary"
            disabled={isSaving || isDeleting || isUpdatingStatus}
            onPress={() => setIsStatusModalVisible(true)}
            style={styles.statusButton}
          />

          <Button
            accessibilityLabel={t('pet.deletePetA11y')}
            title={t('pet.deletePet')}
            variant="destructive"
            disabled={isSaving || isDeleting || isUpdatingStatus}
            onPress={() => setIsDeleteModalVisible(true)}
            style={styles.deleteButton}
          />
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

      <ConfirmModal
        visible={isDeleteModalVisible}
        title={t('pet.deletePetTitle', { name: pet.name })}
        message={t('pet.deletePetMessage', { name: pet.name })}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        destructive
        isLoading={isDeleting}
        onConfirm={() => void handleConfirmDelete()}
        onDismiss={runPendingNav}
        onCancel={() => {
          if (!isDeleting) {
            setIsDeleteModalVisible(false);
          }
        }}
      />

      <ConfirmModal
        visible={isStatusModalVisible}
        title={t(isDeceased ? 'pet.restorePetTitle' : 'pet.markDeceasedTitle', { name: pet.name })}
        message={t(isDeceased ? 'pet.restorePetMessage' : 'pet.markDeceasedMessage', {
          name: pet.name,
        })}
        confirmLabel={t(isDeceased ? 'pet.restorePet' : 'pet.markDeceased')}
        cancelLabel={t('common.cancel')}
        isLoading={isUpdatingStatus}
        onConfirm={() => void handleConfirmStatusChange()}
        onDismiss={runPendingNav}
        onCancel={() => {
          if (!isUpdatingStatus) {
            setIsStatusModalVisible(false);
          }
        }}
      />
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
  memorialNote: {
    ...Typography.caption,
    marginTop: Spacing.sm,
  },
  statusButton: {
    marginTop: Spacing.sm,
  },
  deleteButton: {
    marginTop: Spacing.sm,
  },
});
