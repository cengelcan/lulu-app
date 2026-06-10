import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { type Edge } from 'react-native-safe-area-context';

import { PetAvatar } from '@/components/pet/PetAvatar';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ComingSoonModal } from '@/components/ui/ComingSoonModal';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import * as petStorage from '@/storage/pet.storage';
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
};

function PetListItem({ pet, isActive }: PetListItemProps) {
  const primaryColor = useThemeColor({}, 'primary');

  return (
    <Card
      accessibilityLabel={isActive ? `${pet.name}, current pet` : pet.name}
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
  );
}

export function MyPetsScreenContent({ edges = ['top', 'bottom'] }: MyPetsScreenContentProps) {
  const router = useRouter();
  const primaryColor = useThemeColor({}, 'primary');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  const [pets, setPets] = useState<Pet[]>([]);
  const [activePet, setActivePet] = useState<Pet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
      setActivePet(active);
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
                isActive={activePet?.id === pet.id}
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
