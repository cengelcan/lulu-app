import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { GroupedSection } from '@/components/pet/GroupedSection';
import { PetAvatar } from '@/components/pet/PetAvatar';
import { ProfileDetailRow } from '@/components/pet/ProfileDetailRow';
import { ThemedText } from '@/components/themed-text';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { usePetStore } from '@/stores/pet.store';
import { STACK_BACK_ONLY_OPTIONS } from '@/constants/navigation';
import { usePetDisplay } from '@/hooks/use-pet-display';
import { useTranslation } from '@/hooks/use-translation';

export default function PetProfileScreen() {
  const router = useRouter();
  const { id: idParam } = useLocalSearchParams<{ id?: string | string[] }>();
  const petId = useMemo(
    () => (Array.isArray(idParam) ? idParam[0] : idParam),
    [idParam]
  );
  const { t } = useTranslation();
  const {
    displayPetSpecies,
    displayPetBreed,
    displayPetText,
    displayPetAgeGroup,
    displayPetSex,
    displayPetSpayNeuterStatus,
    displayPetDate,
    displayHealthConditions,
  } = usePetDisplay();
  const pet = usePetStore((state) => state.pet);
  const isLoading = usePetStore((state) => state.isLoading);
  const loadPet = usePetStore((state) => state.loadPet);
  const loadPetById = usePetStore((state) => state.loadPetById);

  const primaryColor = useThemeColor({}, 'primary');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  useEffect(() => {
    if (petId) {
      void loadPetById(petId);
      return;
    }

    void loadPet();
  }, [loadPet, loadPetById, petId]);

  useEffect(() => {
    if (!isLoading && !pet) {
      router.dismissTo('/(tabs)/home');
    }
  }, [isLoading, pet, router]);

  const handleEditProfile = useCallback(() => {
    if (!pet) {
      return;
    }

    if (process.env.EXPO_OS === 'ios') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(`/edit-pet?id=${pet.id}`);
  }, [pet, router]);

  if (isLoading && !pet) {
    return (
      <>
        <Stack.Screen
          options={{
            ...STACK_BACK_ONLY_OPTIONS,
            headerShown: true,
            title: t('pet.profileTitle'),
          }}
        />
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
          ...STACK_BACK_ONLY_OPTIONS,
          headerShown: true,
          title: pet.name,
          headerRight: () => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('pet.editProfileA11y')}
              hitSlop={8}
              onPress={handleEditProfile}
              style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1, paddingHorizontal: Spacing.sm }]}>
              <ThemedText lightColor={primaryColor} darkColor={primaryColor} type="defaultSemiBold">
                {t('pet.editProfile')}
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

          <GroupedSection title={t('pet.sections.basicInformation')}>
            <ProfileDetailRow label={t('pet.fields.breed')} value={displayPetBreed(pet.breed)} />
            <ProfileDetailRow label={t('pet.fields.color')} value={displayPetText(pet.color)} />
            <ProfileDetailRow label={t('pet.fields.sex')} value={displayPetSex(pet.sex)} />
            <ProfileDetailRow
              label={t('pet.fields.ageGroup')}
              value={displayPetAgeGroup(pet.ageGroup)}
              isLast
            />
          </GroupedSection>

          <GroupedSection title={t('pet.sections.healthInformation')}>
            <ProfileDetailRow
              label={t('pet.fields.spayNeuter')}
              value={displayPetSpayNeuterStatus(pet.spayNeuterStatus)}
            />
            <ProfileDetailRow label={t('pet.fields.birthDate')} value={displayPetDate(pet.birthDate)} />
            <ProfileDetailRow
              label={t('pet.fields.healthConditions')}
              value={displayHealthConditions(pet.healthConditions)}
              isLast
            />
          </GroupedSection>

          <GroupedSection title={t('pet.sections.additionalInformation')}>
            <ProfileDetailRow label={t('pet.fields.adoptionDate')} value={displayPetDate(pet.adoptionDate)} />
            <ProfileDetailRow label={t('pet.fields.microchip')} value={displayPetText(pet.microchipId)} isLast />
          </GroupedSection>

          <GroupedSection title={t('pet.sections.owner')}>
            <ProfileDetailRow label={t('pet.fields.ownerName')} value={displayPetText(pet.ownerName)} isLast />
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
