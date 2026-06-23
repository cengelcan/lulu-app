import * as Haptics from 'expo-haptics';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { PetAvatar } from '@/components/pet/PetAvatar';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { usePetDisplay } from '@/hooks/use-pet-display';
import { useTranslation } from '@/hooks/use-translation';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { Pet } from '@/types/pet';
import { formatDateTimeDdMmYyyyHhMm } from '@/utils/date';

type PetListRowProps = {
  pet: Pet;
  isActive: boolean;
  isLast?: boolean;
  disabled?: boolean;
  isSwitching?: boolean;
  memorialMode?: boolean;
  onSelect: () => void;
  onOpenProfile: () => void;
};

export function PetListRow({
  pet,
  isActive,
  isLast = false,
  disabled = false,
  isSwitching = false,
  memorialMode = false,
  onSelect,
  onOpenProfile,
}: PetListRowProps) {
  if (memorialMode) {
    return (
      <MemorialPetListRow
        pet={pet}
        isLast={isLast}
        disabled={disabled}
        onSelect={onSelect}
        onOpenProfile={onOpenProfile}
      />
    );
  }

  return (
    <ActivePetListRow
      pet={pet}
      isActive={isActive}
      disabled={disabled}
      isSwitching={isSwitching}
      onSelect={onSelect}
      onOpenProfile={onOpenProfile}
    />
  );
}

type MemorialPetListRowProps = {
  pet: Pet;
  isLast?: boolean;
  disabled?: boolean;
  onSelect: () => void;
  onOpenProfile: () => void;
};

function MemorialPetListRow({
  pet,
  isLast = false,
  disabled = false,
  onSelect,
  onOpenProfile,
}: MemorialPetListRowProps) {
  const { t } = useTranslation();
  const { displayPetBreed, displayPetSpecies } = usePetDisplay();
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');

  const breed = displayPetBreed(pet.breed);
  const speciesLabel = displayPetSpecies(pet.species);
  const breedLabel = breed !== displayPetBreed(null) ? breed : speciesLabel;
  const deceasedDateLabel = pet.deceasedAt
    ? t('myPets.deceasedOn', { date: formatDateTimeDdMmYyyyHhMm(pet.deceasedAt) })
    : null;
  const subtitle = deceasedDateLabel ?? breedLabel;

  const handleSelect = () => {
    if (disabled) {
      return;
    }

    if (process.env.EXPO_OS === 'ios') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    onSelect();
  };

  const handleOpenProfile = () => {
    if (disabled) {
      return;
    }

    if (process.env.EXPO_OS === 'ios') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    onOpenProfile();
  };

  return (
    <View
      style={[
        styles.memorialRow,
        !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: borderColor },
      ]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${pet.name}, ${subtitle}. Tap to view profile.`}
        disabled={disabled}
        onPress={handleSelect}
        style={({ pressed }) => [
          styles.memorialMainPressable,
          { opacity: disabled ? 0.6 : pressed ? 0.7 : 1 },
        ]}>
        <PetAvatar photoUri={pet.photoUri} size={48} />
        <View style={styles.info}>
          <ThemedText type="defaultSemiBold" numberOfLines={1}>
            {pet.name}
          </ThemedText>
          <ThemedText
            lightColor={textSecondaryColor}
            darkColor={textSecondaryColor}
            numberOfLines={1}
            style={styles.subtitle}>
            {subtitle}
          </ThemedText>
        </View>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`View ${pet.name} profile`}
        disabled={disabled}
        hitSlop={8}
        onPress={handleOpenProfile}
        style={({ pressed }) => [
          styles.profileButton,
          { opacity: disabled ? 0.6 : pressed ? 0.7 : 1 },
        ]}>
        <IconSymbol name="chevron.right" size={18} color={textSecondaryColor} />
      </Pressable>
    </View>
  );
}

type ActivePetListRowProps = {
  pet: Pet;
  isActive: boolean;
  disabled?: boolean;
  isSwitching?: boolean;
  onSelect: () => void;
  onOpenProfile: () => void;
};

function ActivePetListRow({
  pet,
  isActive,
  disabled = false,
  isSwitching = false,
  onSelect,
  onOpenProfile,
}: ActivePetListRowProps) {
  const { displayPetBreed, displayPetSpecies } = usePetDisplay();
  const brandAccentColor = useThemeColor({}, 'brandAccent');
  const brandAccentBorderColor = useThemeColor({}, 'brandAccentBorder');
  const primaryTextColor = useThemeColor({}, 'primaryText');
  const surfaceColor = useThemeColor({}, 'surface');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  const breed = displayPetBreed(pet.breed);
  const speciesLabel = displayPetSpecies(pet.species);
  const breedLabel = breed !== displayPetBreed(null) ? breed : speciesLabel;

  const handleSelect = () => {
    if (disabled) {
      return;
    }

    if (process.env.EXPO_OS === 'ios') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    onSelect();
  };

  const handleOpenProfile = () => {
    if (disabled) {
      return;
    }

    if (process.env.EXPO_OS === 'ios') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    onOpenProfile();
  };

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: surfaceColor },
        isActive && { borderColor: brandAccentBorderColor, borderWidth: 1 },
      ]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          isActive
            ? `${pet.name}, current pet. Tap to go to Home.`
            : `${pet.name}, ${breedLabel}. Tap to select.`
        }
        disabled={disabled}
        onPress={handleSelect}
        style={({ pressed }) => [
          styles.cardMainPressable,
          { opacity: disabled ? 0.6 : pressed ? 0.7 : 1 },
        ]}>
        <PetAvatar photoUri={pet.photoUri} size={48} />
        <View style={styles.info}>
          <ThemedText type="defaultSemiBold" numberOfLines={1}>
            {pet.name}
          </ThemedText>
          <ThemedText
            lightColor={textSecondaryColor}
            darkColor={textSecondaryColor}
            numberOfLines={1}
            style={styles.subtitle}>
            {breedLabel}
          </ThemedText>
        </View>
        {isSwitching ? (
          <ActivityIndicator color={brandAccentColor} size="small" />
        ) : isActive ? (
          <View style={styles.activeTrailing}>
            <View style={[styles.checkCircle, { backgroundColor: brandAccentColor }]}>
              <IconSymbol name="checkmark" size={14} color={primaryTextColor} />
            </View>
          </View>
        ) : null}
      </Pressable>
      {!isActive && !isSwitching ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`View ${pet.name} profile`}
          disabled={disabled}
          hitSlop={8}
          onPress={handleOpenProfile}
          style={({ pressed }) => [
            styles.profileButton,
            { opacity: disabled ? 0.6 : pressed ? 0.7 : 1 },
          ]}>
          <IconSymbol name="chevron.right" size={18} color={textSecondaryColor} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    minHeight: 72,
  },
  cardMainPressable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingLeft: Spacing.md,
    paddingVertical: Spacing.md,
  },
  activeTrailing: {
    paddingRight: Spacing.md,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memorialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 64,
  },
  memorialMainPressable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingLeft: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  subtitle: {
    ...Typography.caption,
  },
  profileButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
