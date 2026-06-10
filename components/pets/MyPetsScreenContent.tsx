import { useFocusEffect, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { type Edge } from 'react-native-safe-area-context';

import { PetAvatar } from '@/components/pet/PetAvatar';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ComingSoonModal } from '@/components/ui/ComingSoonModal';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { syncCheckInReminderSchedule } from '@/services/notifications/schedule';
import * as petStorage from '@/storage/pet.storage';
import { useCheckInStore } from '@/stores/check-in.store';
import { usePetStore } from '@/stores/pet.store';
import type { Pet } from '@/types/pet';

type MyPetsScreenContentProps = {
  edges?: Edge[];
};

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

type PetListItemProps = {
  pet: Pet;
  isActive: boolean;
  onPress: () => void;
  disabled?: boolean;
};

function PetListItem({ pet, isActive, onPress, disabled = false }: PetListItemProps) {
  const primaryColor = useThemeColor({}, 'primary');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        isActive ? `${pet.name}, current pet. Tap to go to Home.` : `${pet.name}. Tap to select.`
      }
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [{ opacity: disabled ? 0.6 : pressed ? 0.7 : 1 }]}>
      <Card
        style={[
          styles.petRow,
          isActive && { borderColor: primaryColor, borderWidth: 2 },
        ]}>
        <PetAvatar photoUri={pet.photoUri} size={56} />
        <View style={styles.petInfo}>
          <ThemedText type="defaultSemiBold" style={styles.petName}>
            {pet.name}
          </ThemedText>
        </View>
        {isActive ? (
          <View style={[styles.currentBadge, { backgroundColor: `${primaryColor}1A` }]}>
            <ThemedText
              lightColor={primaryColor}
              darkColor={primaryColor}
              style={styles.currentBadgeText}>
              Current
            </ThemedText>
          </View>
        ) : null}
      </Card>
    </Pressable>
  );
}

export function MyPetsScreenContent({ edges = ['top', 'bottom'] }: MyPetsScreenContentProps) {
  const router = useRouter();
  const primaryColor = useThemeColor({}, 'primary');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  const setActivePetInStore = usePetStore((state) => state.setActivePet);
  const loadCheckIns = useCheckInStore((state) => state.loadCheckIns);

  const [pets, setPets] = useState<Pet[]>([]);
  const [currentPet, setCurrentPet] = useState<Pet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSwitching, setIsSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comingSoonVisible, setComingSoonVisible] = useState(false);

  const loadPets = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [petsList, active] = await Promise.all([
        petStorage.getPets(),
        petStorage.getActivePet(),
      ]);
      setPets(petsList);
      setCurrentPet(active);
    } catch (loadError) {
      setError(getErrorMessage(loadError, 'Failed to load pets'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadPets();
    }, [loadPets])
  );

  const handleSetupPet = () => {
    router.replace('/(setup)/pet-type');
  };

  const handleAddPet = () => {
    setComingSoonVisible(true);
  };

  const handleDismissComingSoon = () => {
    setComingSoonVisible(false);
  };

  const handleSelectPet = useCallback(
    (pet: Pet) => {
      if (isSwitching) {
        return;
      }

      if (process.env.EXPO_OS === 'ios') {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      if (currentPet?.id === pet.id) {
        router.replace('/(tabs)/home');
        return;
      }

      setIsSwitching(true);

      void (async () => {
        try {
          await setActivePetInStore(pet.id);
          void loadCheckIns(pet.id);
          void syncCheckInReminderSchedule({ petName: pet.name });
          setCurrentPet(pet);
          router.replace('/(tabs)/home');
        } catch {
          // Error is stored in pet store for retry flows.
        } finally {
          setIsSwitching(false);
        }
      })();
    },
    [currentPet?.id, isSwitching, loadCheckIns, router, setActivePetInStore]
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
          <Button title="Try Again" onPress={() => void loadPets()} />
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
          <ThemedText type="title">My Pets</ThemedText>
          <View style={styles.petList}>
            {pets.map((pet) => (
              <PetListItem
                key={pet.id}
                pet={pet}
                isActive={currentPet?.id === pet.id}
                disabled={isSwitching}
                onPress={() => handleSelectPet(pet)}
              />
            ))}
          </View>
          <Button title="Add Pet" variant="secondary" onPress={handleAddPet} />
        </View>
      )}
      <ComingSoonModal visible={comingSoonVisible} onDismiss={handleDismissComingSoon} />
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
  petList: {
    gap: Spacing.md,
  },
  petRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    flexShrink: 1,
  },
  currentBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  currentBadgeText: {
    ...Typography.caption,
    fontWeight: '600',
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
