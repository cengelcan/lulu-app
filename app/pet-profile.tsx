import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useMemo } from 'react';
import { ActivityIndicator, StyleSheet, View, useWindowDimensions } from 'react-native';

import { GroupedSection } from '@/components/pet/GroupedSection';
import { HealthConditionChips } from '@/components/pet/HealthConditionChips';
import { PetAvatar } from '@/components/pet/PetAvatar';
import { ProfileDetailRow } from '@/components/pet/ProfileDetailRow';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/Card';
import { HeaderTextButton } from '@/components/ui/HeaderTextButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { usePetStore } from '@/stores/pet.store';
import { STACK_BACK_ONLY_OPTIONS, HEADER_ACTION_CONTAINER_STYLE } from '@/constants/navigation';
import { usePetDisplay } from '@/hooks/use-pet-display';
import { useTranslation } from '@/hooks/use-translation';
import { canEditPetProfile } from '@/utils/pet-access';

export default function PetProfileScreen() {
  const router = useRouter();
  const { width, fontScale } = useWindowDimensions();
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
    getHealthConditionLabel,
  } = usePetDisplay();
  const pet = usePetStore((state) => state.pet);
  const isLoading = usePetStore((state) => state.isLoading);
  const loadPet = usePetStore((state) => state.loadPet);
  const loadPetById = usePetStore((state) => state.loadPetById);

  const primaryColor = useThemeColor({}, 'primary');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const brandAccentColor = useThemeColor({}, 'brandAccent');
  const brandAccentSoft = useThemeColor({}, 'brandAccentSoft');
  const brandAccentBorder = useThemeColor({}, 'brandAccentBorder');
  const successColor = useThemeColor({}, 'success');
  const surfaceSoftColor = useThemeColor({}, 'surfaceSoft');
  const stackHero = width < 360 || fontScale >= 1.4;

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
    if (!pet || !canEditPetProfile(pet)) {
      return;
    }

    if (process.env.EXPO_OS === 'ios') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(`/edit-pet?id=${pet.id}`);
  }, [pet, router]);

  const headerRight = useCallback(
    () =>
      pet && canEditPetProfile(pet) ? (
        <HeaderTextButton
          accessibilityLabel={t('pet.editProfileA11y')}
          color={primaryColor}
          label={t('pet.editProfile')}
          onPress={handleEditProfile}
        />
      ) : null,
    [handleEditProfile, pet, primaryColor, t]
  );

  const screenOptions = useMemo(
    () => ({
      ...STACK_BACK_ONLY_OPTIONS,
      headerShown: true as const,
      title: pet?.name ?? t('pet.profileTitle'),
      headerRight,
      headerRightContainerStyle: HEADER_ACTION_CONTAINER_STYLE,
    }),
    [headerRight, pet?.name, t]
  );

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
      <Stack.Screen options={screenOptions} />
      <ScreenContainer scrollable edges={['bottom']} contentStyle={styles.content}>
        <View style={styles.body}>
          <Card style={[styles.heroCard, stackHero && styles.heroCardStacked]}>
            <PetAvatar
              photoUri={pet.photoUri}
              species={pet.species}
              size={96}
              accentBorder
            />
            <View style={[styles.heroCopy, stackHero && styles.heroCopyStacked]}>
              <ThemedText type="title" style={[styles.petName, stackHero && styles.centeredText]}>
                {pet.name}
              </ThemedText>
              <ThemedText
                lightColor={textSecondaryColor}
                darkColor={textSecondaryColor}
                numberOfLines={2}
                style={[styles.breedSummary, stackHero && styles.centeredText]}>
                {displayPetBreed(pet.breed)} · {displayPetSpecies(pet.species)}
              </ThemedText>
              <View style={[styles.badges, stackHero && styles.badgesCentered]}>
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: brandAccentSoft, borderColor: brandAccentBorder },
                  ]}>
                  <ThemedText
                    lightColor={brandAccentColor}
                    darkColor={brandAccentColor}
                    style={styles.badgeLabel}>
                    {displayPetAgeGroup(pet.ageGroup)}
                  </ThemedText>
                </View>
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: pet.status === 'active' ? surfaceSoftColor : brandAccentSoft,
                      borderColor: pet.status === 'active' ? successColor : brandAccentBorder,
                    },
                  ]}>
                  <ThemedText
                    lightColor={pet.status === 'active' ? successColor : brandAccentColor}
                    darkColor={pet.status === 'active' ? successColor : brandAccentColor}
                    style={styles.badgeLabel}>
                    {t(pet.status === 'active' ? 'pet.activeBadge' : 'pet.deceasedBadge')}
                  </ThemedText>
                </View>
              </View>
            </View>
          </Card>

          <GroupedSection title={t('pet.sections.profile')}>
            <ProfileDetailRow label={t('pet.fields.color')} value={displayPetText(pet.color)} />
            <ProfileDetailRow label={t('pet.fields.sex')} value={displayPetSex(pet.sex)} />
            <ProfileDetailRow label={t('pet.fields.birthDate')} value={displayPetDate(pet.birthDate)} isLast />
          </GroupedSection>

          <GroupedSection title={t('pet.sections.health')}>
            <ProfileDetailRow
              label={t('pet.fields.spayNeuter')}
              value={displayPetSpayNeuterStatus(pet.spayNeuterStatus)}
            />
            <View style={styles.healthConditions}>
              <ThemedText
                lightColor={textSecondaryColor}
                darkColor={textSecondaryColor}
                style={styles.healthLabel}>
                {t('pet.fields.healthConditions')}
              </ThemedText>
              <HealthConditionChips
                conditions={pet.healthConditions}
                getLabel={getHealthConditionLabel}
              />
            </View>
          </GroupedSection>

          <GroupedSection title={t('pet.sections.care')}>
            <ProfileDetailRow label={t('pet.fields.adoptionDate')} value={displayPetDate(pet.adoptionDate)} />
            <ProfileDetailRow label={t('pet.fields.microchip')} value={displayPetText(pet.microchipId)} isLast />
          </GroupedSection>

          <GroupedSection title={t('pet.sections.sharing')}>
            <ProfileDetailRow label={t('pet.fields.ownerName')} value={displayPetText(pet.ownerName)} />
            <ProfileDetailRow
              label={t('pet.fields.access')}
              value={t(pet.sharingRole === 'member' ? 'pet.sharedWithYou' : 'pet.ownerManaged')}
              isLast
            />
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
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
  },
  heroCardStacked: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  heroCopy: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.xs,
  },
  petName: {
    flexShrink: 1,
  },
  heroCopyStacked: {
    alignItems: 'center',
  },
  centeredText: {
    textAlign: 'center',
  },
  breedSummary: {
    ...Typography.body,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  badgesCentered: {
    justifyContent: 'center',
  },
  badge: {
    minHeight: 32,
    justifyContent: 'center',
    borderRadius: Radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
  },
  badgeLabel: {
    ...Typography.caption,
    fontWeight: '600',
  },
  healthConditions: {
    gap: Spacing.sm,
    padding: Spacing.md,
  },
  healthLabel: {
    ...Typography.body,
  },
});
