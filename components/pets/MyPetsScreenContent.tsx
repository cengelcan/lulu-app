import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { type Edge } from 'react-native-safe-area-context';

import { MemorialTabContent } from '@/components/pets/MemorialTabContent';
import { PetListRow } from '@/components/pet/PetListRow';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Spacing, Typography } from '@/constants/theme';
import { useTranslation } from '@/hooks/use-translation';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useCheckInStore } from '@/stores/check-in.store';
import { usePetStore } from '@/stores/pet.store';
import { useSetupStore } from '@/stores/setup.store';
import type { Pet } from '@/types/pet';

type MyPetsTab = 'active' | 'memorial';

type MyPetsScreenContentProps = {
  edges?: Edge[];
};

export function MyPetsScreenContent({ edges = ['top', 'bottom'] }: MyPetsScreenContentProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const primaryColor = useThemeColor({}, 'primary');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  const pets = usePetStore((state) => state.pets);
  const activePet = usePetStore((state) => state.pet);
  const isLoading = usePetStore((state) => state.isLoading);
  const error = usePetStore((state) => state.error);
  const loadPets = usePetStore((state) => state.loadPets);
  const setActivePet = usePetStore((state) => state.setActivePet);
  const clearError = usePetStore((state) => state.clearError);

  const loadCheckIns = useCheckInStore((state) => state.loadCheckIns);
  const beginSetup = useSetupStore((state) => state.beginSetup);

  const [isSwitching, setIsSwitching] = useState(false);
  const [switchingPetId, setSwitchingPetId] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<MyPetsTab>('active');

  const activePets = useMemo(
    () => pets.filter((pet) => pet.status !== 'deceased'),
    [pets]
  );
  const deceasedPets = useMemo(
    () => pets.filter((pet) => pet.status === 'deceased'),
    [pets]
  );
  const visiblePets = selectedTab === 'active' ? activePets : deceasedPets;
  const isMemorialTab = selectedTab === 'memorial';
  const isInitialLoading = isLoading && pets.length === 0;

  const tabOptions = useMemo(
    () => [
      { value: 'active' as const, label: t('myPets.petsSection') },
      { value: 'memorial' as const, label: t('myPets.memorialSection') },
    ],
    [t]
  );

  useFocusEffect(
    useCallback(() => {
      void loadPets();
    }, [loadPets])
  );

  const handleSetupPet = () => {
    beginSetup('initial');
    router.replace('/(setup)/pet-type');
  };

  const handleAddPet = () => {
    beginSetup('add');
    router.push('/(setup)/pet-type?mode=add');
  };

  const handleRetry = () => {
    clearError();
    void loadPets();
  };

  const handleSelectPet = useCallback(
    (pet: Pet) => {
      if (isSwitching) {
        return;
      }

      if (activePet?.id === pet.id) {
        router.replace('/(tabs)/home');
        return;
      }

      setIsSwitching(true);
      setSwitchingPetId(pet.id);

      void (async () => {
        try {
          await setActivePet(pet.id);
          await loadCheckIns(pet.id);
          router.replace('/(tabs)/home');
        } catch {
          // Error is stored in pet store for retry flows.
        } finally {
          setIsSwitching(false);
          setSwitchingPetId(null);
        }
      })();
    },
    [activePet?.id, isSwitching, loadCheckIns, router, setActivePet]
  );

  const handleOpenProfile = useCallback(
    (pet: Pet) => {
      if (isSwitching) {
        return;
      }

      router.push(`/pet-profile?id=${pet.id}`);
    },
    [isSwitching, router]
  );

  const renderPetRows = (listPets: Pet[], memorialMode: boolean) =>
    listPets.map((pet, index) => (
      <PetListRow
        key={pet.id}
        pet={pet}
        disabled={isSwitching}
        isActive={!memorialMode && activePet?.id === pet.id}
        isLast={index === listPets.length - 1}
        isSwitching={isSwitching && switchingPetId === pet.id}
        memorialMode={memorialMode}
        onOpenProfile={() => handleOpenProfile(pet)}
        onSelect={() => (memorialMode ? handleOpenProfile(pet) : handleSelectPet(pet))}
      />
    ));

  const renderEmptyActiveTab = () => (
    <View style={styles.emptyTab}>
      <ThemedText
        lightColor={textSecondaryColor}
        darkColor={textSecondaryColor}
        style={styles.emptyTabMessage}>
        {t('myPets.noActivePetsMessage')}
      </ThemedText>
    </View>
  );

  return (
    <ScreenContainer scrollable edges={edges} contentStyle={styles.content}>
      {isInitialLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={primaryColor} size="large" />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <ThemedText style={styles.message}>{error}</ThemedText>
          <Button title={t('common.tryAgain')} onPress={handleRetry} />
        </View>
      ) : pets.length === 0 ? (
        <View style={styles.centered}>
          <ThemedText type="subtitle" style={styles.emptyTitle}>
            {t('myPets.noPetsTitle')}
          </ThemedText>
          <ThemedText
            lightColor={textSecondaryColor}
            darkColor={textSecondaryColor}
            style={styles.message}>
            {t('myPets.noPetsMessage')}
          </ThemedText>
          <Button title={t('common.setUpPet')} onPress={handleSetupPet} style={styles.setupButton} />
        </View>
      ) : (
        <View style={styles.body}>
          <SegmentedControl options={tabOptions} value={selectedTab} onChange={setSelectedTab} />
          {isMemorialTab ? (
            <MemorialTabContent
              pets={deceasedPets}
              disabled={isSwitching}
              onOpenPet={handleOpenProfile}
            />
          ) : visiblePets.length === 0 ? (
            renderEmptyActiveTab()
          ) : (
            <View style={styles.petList}>{renderPetRows(visiblePets, false)}</View>
          )}
          {!isMemorialTab ? (
            <Button title={t('common.addPetWithPlus')} onPress={handleAddPet} />
          ) : null}
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
  },
  body: {
    gap: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.xxl,
  },
  emptyTitle: {
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    ...Typography.body,
  },
  emptyTab: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  emptyTabMessage: {
    textAlign: 'center',
    ...Typography.body,
  },
  setupButton: {
    marginTop: Spacing.sm,
  },
  petList: {
    gap: Spacing.sm,
  },
});
