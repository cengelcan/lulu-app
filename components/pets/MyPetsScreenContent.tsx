import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { type Edge } from 'react-native-safe-area-context';

import { PetListRow } from '@/components/pet/PetListRow';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useCheckInStore } from '@/stores/check-in.store';
import { usePetStore } from '@/stores/pet.store';
import { useSetupStore } from '@/stores/setup.store';
import type { Pet } from '@/types/pet';

type MyPetsScreenContentProps = {
  edges?: Edge[];
};

export function MyPetsScreenContent({ edges = ['top', 'bottom'] }: MyPetsScreenContentProps) {
  const router = useRouter();
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
  const resetDraft = useSetupStore((state) => state.resetDraft);

  const [isSwitching, setIsSwitching] = useState(false);
  const [switchingPetId, setSwitchingPetId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      void loadPets();
    }, [loadPets])
  );

  const handleSetupPet = () => {
    router.replace('/(setup)/pet-type');
  };

  const handleAddPet = () => {
    resetDraft();
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

      void (async () => {
        setIsSwitching(true);
        setSwitchingPetId(pet.id);

        try {
          if (activePet?.id !== pet.id) {
            await setActivePet(pet.id);
            await loadCheckIns(pet.id);
          }
          router.push('/pet-profile');
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

  return (
    <ScreenContainer scrollable edges={edges} contentStyle={styles.content}>
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={primaryColor} size="large" />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <ThemedText style={styles.message}>{error}</ThemedText>
          <Button title="Try Again" onPress={handleRetry} />
        </View>
      ) : pets.length === 0 ? (
        <View style={styles.centered}>
          <ThemedText type="subtitle" style={styles.emptyTitle}>
            No pets yet
          </ThemedText>
          <ThemedText
            lightColor={textSecondaryColor}
            darkColor={textSecondaryColor}
            style={styles.message}>
            Add your first pet to begin tracking.
          </ThemedText>
          <Button title="Set Up Pet" onPress={handleSetupPet} style={styles.setupButton} />
        </View>
      ) : (
        <View style={styles.body}>
          <Card style={styles.listCard}>
            {pets.map((pet, index) => (
              <PetListRow
                key={pet.id}
                pet={pet}
                disabled={isSwitching}
                isActive={activePet?.id === pet.id}
                isLast={index === pets.length - 1}
                isSwitching={isSwitching && switchingPetId === pet.id}
                onOpenProfile={() => handleOpenProfile(pet)}
                onSelect={() => handleSelectPet(pet)}
              />
            ))}
          </Card>
          <Button title="Add Pet" variant="secondary" onPress={handleAddPet} />
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
  listCard: {
    padding: 0,
    gap: 0,
    overflow: 'hidden',
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
  setupButton: {
    marginTop: Spacing.sm,
  },
});
