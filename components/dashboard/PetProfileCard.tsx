import { useMemo } from 'react';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';

import { PetAvatar } from '@/components/pet/PetAvatar';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { usePetDisplay } from '@/hooks/use-pet-display';
import { useTranslation } from '@/hooks/use-translation';
import type { CheckIn } from '@/types/check-in';
import type { Pet } from '@/types/pet';
import { getAbnormalCheckInFields } from '@/utils/check-in';
import { getLocaleTag } from '@/utils/locale';
import { formatLastCheckInWhen } from '@/utils/last-check-in';

type HealthBadgeProps = {
  variant: 'healthy' | 'attention';
};

function HealthBadge({ variant }: HealthBadgeProps) {
  const { t } = useTranslation();
  const successColor = useThemeColor({}, 'success');
  const warningColor = useThemeColor({}, 'warning');
  const isHealthy = variant === 'healthy';
  const accentColor = isHealthy ? successColor : warningColor;

  return (
    <View style={[styles.badge, { backgroundColor: `${accentColor}22`, borderColor: `${accentColor}55` }]}>
      <View style={[styles.badgeDot, { backgroundColor: accentColor }]} />
      <ThemedText
        lightColor={accentColor}
        darkColor={accentColor}
        style={styles.badgeLabel}>
        {isHealthy ? t('dashboard.healthy') : t('dashboard.attention')}
      </ThemedText>
    </View>
  );
}

type PetProfileCardProps = {
  pet: Pet;
  todayCheckIn: CheckIn | null;
  latestCheckIn: CheckIn | null;
  onPress: () => void;
};

export function PetProfileCard({
  pet,
  todayCheckIn,
  latestCheckIn,
  onPress,
}: PetProfileCardProps) {
  const { t, language } = useTranslation();
  const { displayPetBreed, displayPetSpecies } = usePetDisplay();
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const locale = getLocaleTag(language);

  const breedLabel = pet.breed?.trim()
    ? displayPetBreed(pet.breed)
    : displayPetSpecies(pet.species);

  const healthBadge = useMemo(() => {
    if (!todayCheckIn) {
      return null;
    }

    const abnormalFields = getAbnormalCheckInFields(todayCheckIn);
    return abnormalFields.length === 0 ? 'healthy' : 'attention';
  }, [todayCheckIn]);

  const lastCheckInLabel = latestCheckIn
    ? t('dashboard.lastCheckIn', {
        when: formatLastCheckInWhen(latestCheckIn, locale, t),
      })
    : null;

  const handlePress = () => {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('dashboard.petProfileA11y', { name: pet.name })}
      onPress={handlePress}
      style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}>
      <Card>
        <View style={styles.topRow}>
          <PetAvatar photoUri={pet.photoUri} size={56} />
          <View style={styles.info}>
            <View style={styles.nameRow}>
              <ThemedText type="defaultSemiBold" style={styles.petName} numberOfLines={1}>
                {pet.name}
              </ThemedText>
              {healthBadge ? <HealthBadge variant={healthBadge} /> : null}
            </View>
            <ThemedText
              lightColor={textSecondaryColor}
              darkColor={textSecondaryColor}
              style={styles.breed}
              numberOfLines={1}>
              {breedLabel}
            </ThemedText>
            {lastCheckInLabel ? (
              <ThemedText
                lightColor={textSecondaryColor}
                darkColor={textSecondaryColor}
                style={styles.lastCheckIn}
                numberOfLines={1}>
                {lastCheckInLabel}
              </ThemedText>
            ) : null}
          </View>
          <IconSymbol name="chevron.right" size={18} color={textSecondaryColor} />
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  info: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  petName: {
    ...Typography.bodySemiBold,
    fontSize: 17,
    flexShrink: 1,
  },
  breed: {
    ...Typography.caption,
  },
  lastCheckIn: {
    ...Typography.caption,
    marginTop: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xxs,
    borderRadius: Radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: Radius.full,
  },
  badgeLabel: {
    ...Typography.caption,
    fontWeight: '600',
  },
});
