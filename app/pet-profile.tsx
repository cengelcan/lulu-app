import { Stack, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { GroupedSection } from '@/components/pet/GroupedSection';
import { PetAvatar } from '@/components/pet/PetAvatar';
import { ProfileDetailRow } from '@/components/pet/ProfileDetailRow';
import { ThemedText } from '@/components/themed-text';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { usePetStore } from '@/stores/pet.store';
import {
  displayHealthConditions,
  displayPetAgeGroup,
  displayPetBreed,
  displayPetDate,
  displayPetSex,
  displayPetSpecies,
  displayPetSpayNeuterStatus,
  displayPetText,
} from '@/utils/pet-display';

export default function PetProfileScreen() {
  const router = useRouter();
  const pet = usePetStore((state) => state.pet);
  const isLoading = usePetStore((state) => state.isLoading);
  const loadPet = usePetStore((state) => state.loadPet);

  const primaryColor = useThemeColor({}, 'primary');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  useEffect(() => {
    void loadPet();
  }, [loadPet]);

  useEffect(() => {
    if (!isLoading && !pet) {
      router.dismissTo('/(tabs)/home');
    }
  }, [isLoading, pet, router]);

  const handleEditProfile = useCallback(() => {
    if (process.env.EXPO_OS === 'ios') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/edit-pet');
  }, [router]);

  if (isLoading && !pet) {
    return (
      <>
        <Stack.Screen options={{ headerShown: true, title: 'Pet Profile' }} />
        <ScreenContainer edges={['bottom']} contentStyle={styles.centered}>
          <ActivityIndicator color={primaryColor} size="large" />
        </ScreenContainer>
      </>
    );
  }

  if (!pet) {
    return null;
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: pet.name,
          headerRight: () => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Edit profile"
              hitSlop={8}
              onPress={handleEditProfile}
              style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1, paddingHorizontal: Spacing.sm }]}>
              <ThemedText lightColor={primaryColor} darkColor={primaryColor} type="defaultSemiBold">
                Edit
              </ThemedText>
            </Pressable>
          ),
        }}
      />
      <ScreenContainer scrollable edges={['bottom']} contentStyle={styles.content}>
        <View style={styles.body}>
          <View style={styles.header}>
            <PetAvatar photoUri={pet.photoUri} size={96} />
            <ThemedText type="title" style={styles.petName}>
              {pet.name}
            </ThemedText>
            <ThemedText
              lightColor={textSecondaryColor}
              darkColor={textSecondaryColor}
              style={styles.petType}>
              {displayPetSpecies(pet.species)}
            </ThemedText>
          </View>

          <GroupedSection title="Basic Information">
            <ProfileDetailRow label="Breed" value={displayPetBreed(pet.breed, pet.species)} />
            <ProfileDetailRow label="Color" value={displayPetText(pet.color)} />
            <ProfileDetailRow label="Sex" value={displayPetSex(pet.sex)} />
            <ProfileDetailRow
              label="Age Group"
              value={displayPetAgeGroup(pet.ageGroup)}
              isLast
            />
          </GroupedSection>

          <GroupedSection title="Health Information">
            <ProfileDetailRow
              label="Spayed / Neutered"
              value={displayPetSpayNeuterStatus(pet.spayNeuterStatus)}
            />
            <ProfileDetailRow label="Birth Date" value={displayPetDate(pet.birthDate)} />
            <ProfileDetailRow
              label="Health Conditions"
              value={displayHealthConditions(pet.healthConditions)}
              isLast
            />
          </GroupedSection>

          <GroupedSection title="Additional Information">
            <ProfileDetailRow label="Adoption Date" value={displayPetDate(pet.adoptionDate)} />
            <ProfileDetailRow label="Microchip" value={displayPetText(pet.microchipId)} isLast />
          </GroupedSection>

          <GroupedSection title="Owner">
            <ProfileDetailRow label="Owner Name" value={displayPetText(pet.ownerName)} isLast />
          </GroupedSection>
        </View>
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
  header: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  petName: {
    textAlign: 'center',
  },
  petType: {
    ...Typography.body,
    textAlign: 'center',
  },
});
