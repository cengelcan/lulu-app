import * as Haptics from 'expo-haptics';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { PetAvatar } from '@/components/pet/PetAvatar';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing, Typography } from '@/constants/theme';
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
  const { t } = useTranslation();
  const { displayPetBreed, displayPetSpecies } = usePetDisplay();
  const primaryColor = useThemeColor({}, 'primary');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');

  const breed = displayPetBreed(pet.breed);
  const speciesLabel = displayPetSpecies(pet.species);
  const breedLabel = breed !== displayPetBreed(null) ? breed : speciesLabel;
  const deceasedDateLabel =
    memorialMode && pet.deceasedAt
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
        styles.row,
        !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: borderColor },
      ]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          isActive
            ? `${pet.name}, current pet. Tap to go to Home.`
            : `${pet.name}, ${subtitle}. Tap to select.`
        }
        disabled={disabled}
        onPress={handleSelect}
        style={({ pressed }) => [
          styles.mainPressable,
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
        {isSwitching ? (
          <ActivityIndicator color={primaryColor} size="small" />
        ) : isActive ? (
          <IconSymbol name="checkmark" size={20} color={primaryColor} />
        ) : null}
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

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 64,
  },
  mainPressable: {
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
