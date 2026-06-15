import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { PetAvatar } from '@/components/pet/PetAvatar';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { usePetStore } from '@/stores/pet.store';
import {
  displayPetDate,
  displayPetSex,
  displayPetSpecies,
  displayPetSpayNeuterStatus,
  displayPetText,
} from '@/utils/pet-display';

type ProfileDetailRowProps = {
  label: string;
  value: string;
};

function ProfileDetailRow({ label, value }: ProfileDetailRowProps) {
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  return (
    <View style={styles.detailRow} accessibilityLabel={`${label}: ${value}`}>
      <ThemedText
        lightColor={textSecondaryColor}
        darkColor={textSecondaryColor}
        style={styles.detailLabel}>
        {label}
      </ThemedText>
      <ThemedText type="defaultSemiBold">{value}</ThemedText>
    </View>
  );
}

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

  const screenOptions = {
    headerShown: true as const,
    title: 'Pet Profile',
  };

  const handleEditProfile = () => {
    router.push('/edit-pet');
  };

  if (isLoading && !pet) {
    return (
      <>
        <Stack.Screen options={screenOptions} />
        <ScreenContainer edges={['bottom']} contentStyle={styles.centered}>
          <ActivityIndicator color={primaryColor} size="large" />
        </ScreenContainer>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={screenOptions} />
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

        <Card>
          <ThemedText type="subtitle">Basic Information</ThemedText>
          <ProfileDetailRow label="Species" value={displayPetSpecies(pet.species)} />
          <ProfileDetailRow label="Color" value={displayPetText(pet.color)} />
          <ProfileDetailRow label="Sex" value={displayPetSex(pet.sex)} />
        </Card>

        <Card>
          <ThemedText type="subtitle">Health Information</ThemedText>
          <ProfileDetailRow
            label="Spayed / Neutered"
            value={displayPetSpayNeuterStatus(pet.spayNeuterStatus)}
          />
          <ProfileDetailRow label="Birth Date" value={displayPetDate(pet.birthDate)} />
        </Card>

        <Card>
          <ThemedText type="subtitle">Additional Information</ThemedText>
          <ProfileDetailRow label="Adoption Date" value={displayPetDate(pet.adoptionDate)} />
          <ProfileDetailRow label="Microchip" value={displayPetText(pet.microchipId)} />
        </Card>

        <Card>
          <ThemedText type="subtitle">Owner</ThemedText>
          <ProfileDetailRow label="Owner Name" value={displayPetText(pet.ownerName)} />
        </Card>

        <Button
          accessibilityLabel="Edit Profile"
          title="Edit Profile"
          onPress={handleEditProfile}
          style={styles.editButton}
        />
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
  detailRow: {
    gap: Spacing.xs,
  },
  detailLabel: {
    ...Typography.caption,
  },
  editButton: {
    marginTop: Spacing.xs,
  },
});
