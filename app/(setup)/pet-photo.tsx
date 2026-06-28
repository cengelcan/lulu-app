import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import { PetPhotoPicker } from '@/components/setup/PetPhotoPicker';
import { SetupScreen } from '@/components/setup/setup-screen';
import { useTranslation } from '@/hooks/use-translation';
import { setupRoute, setupTotalSteps, useSetupMode } from '@/hooks/use-setup-mode';
import { useSetupScreenBack } from '@/hooks/use-setup-screen-back';
import { finalizeAddModePet, validateSetupDraft } from '@/services/setup/finalize-pet-creation';
import { pickPetPhotoFromGallery } from '@/services/pet-photo';
import { useCheckInStore } from '@/stores/check-in.store';
import { usePetStore } from '@/stores/pet.store';
import { useSetupStore } from '@/stores/setup.store';
import { translateValidationError } from '@/utils/translate-error';

export default function PetPhotoScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const mode = useSetupMode();
  const totalSteps = setupTotalSteps(mode);
  const { onBack } = useSetupScreenBack(4, mode);

  const species = useSetupStore((state) => state.species);
  const breed = useSetupStore((state) => state.breed);
  const name = useSetupStore((state) => state.name);
  const ageGroup = useSetupStore((state) => state.ageGroup);
  const healthConditions = useSetupStore((state) => state.healthConditions);
  const photoUri = useSetupStore((state) => state.photoUri);
  const photoUpload = useSetupStore((state) => state.photoUpload);
  const setPhoto = useSetupStore((state) => state.setPhoto);
  const resetDraft = useSetupStore((state) => state.resetDraft);

  const createPet = usePetStore((state) => state.createPet);
  const updatePet = usePetStore((state) => state.updatePet);
  const setActivePet = usePetStore((state) => state.setActivePet);
  const petIsLoading = usePetStore((state) => state.isLoading);
  const petError = usePetStore((state) => state.error);
  const clearPetError = usePetStore((state) => state.clearError);

  const loadCheckIns = useCheckInStore((state) => state.loadCheckIns);

  const [validationError, setValidationError] = useState<string | null>(null);
  const [isPickingPhoto, setIsPickingPhoto] = useState(false);

  const handlePickPhoto = useCallback(async () => {
    if (isPickingPhoto || petIsLoading) {
      return;
    }

    setValidationError(null);
    setIsPickingPhoto(true);

    try {
      const result = await pickPetPhotoFromGallery();

      if (!result.ok) {
        if (result.reason === 'permission_denied') {
          Alert.alert(t('profile.photoAccessTitle'), t('profile.photoAccessMessage'));
        }
        return;
      }

      setPhoto(
        result.uri,
        result.base64 && result.mimeType
          ? { base64: result.base64, mimeType: result.mimeType }
          : null
      );
    } catch {
      Alert.alert(t('profile.couldNotSavePhoto'), t('common.tryAgain'));
    } finally {
      setIsPickingPhoto(false);
    }
  }, [isPickingPhoto, petIsLoading, setPhoto, t]);

  const handleContinueAdd = useCallback(async () => {
    const currentDraft = {
      species,
      breed,
      name,
      ageGroup,
      healthConditions,
      photoUri,
      photoUpload,
    };
    const draftError = validateSetupDraft(currentDraft);

    if (draftError) {
      setValidationError(draftError);
      return;
    }

    setValidationError(null);
    clearPetError();

    try {
      await finalizeAddModePet(currentDraft, {
        createPet,
        updatePet,
        setActivePet,
        loadCheckIns,
        resetDraft,
        router,
      });
    } catch {
      // Store sets error state.
    }
  }, [
    ageGroup,
    breed,
    clearPetError,
    createPet,
    updatePet,
    healthConditions,
    loadCheckIns,
    name,
    photoUri,
    photoUpload,
    resetDraft,
    router,
    setActivePet,
    species,
  ]);

  const handleContinue = useCallback(() => {
    if (mode === 'add') {
      void handleContinueAdd();
      return;
    }

    const draftError = validateSetupDraft({
      species,
      breed,
      name,
      ageGroup,
      healthConditions,
      photoUri,
      photoUpload,
    });
    if (draftError) {
      setValidationError(draftError);
      return;
    }

    setValidationError(null);
    router.push(setupRoute('/(setup)/check-in-prefs', mode));
  }, [
    ageGroup,
    breed,
    handleContinueAdd,
    healthConditions,
    mode,
    name,
    photoUri,
    photoUpload,
    router,
    species,
  ]);

  const error = translateValidationError(t, validationError) ?? petError;

  return (
    <SetupScreen
      step={4}
      totalSteps={totalSteps}
      title={t('setup.petPhoto.title')}
      description={t('setup.petPhoto.description')}
      onContinue={handleContinue}
      onBack={onBack}
      buttonTitle={mode === 'add' ? t('setup.petPhoto.addPet') : t('common.continue')}
      isLoading={mode === 'add' ? petIsLoading : false}
      error={error}>
      <PetPhotoPicker
        photoUri={photoUri}
        addPhotoLabel={t('setup.petPhoto.addPhoto')}
        changePhotoLabel={t('pet.changePhoto')}
        addPhotoHint={t('setup.petPhoto.hint')}
        isPicking={isPickingPhoto}
        onPickPhoto={() => void handlePickPhoto()}
      />
    </SetupScreen>
  );
}
