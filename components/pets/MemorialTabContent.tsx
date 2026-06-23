import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { PetListRow } from '@/components/pet/PetListRow';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { useTranslation } from '@/hooks/use-translation';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { Pet } from '@/types/pet';

const MEMORIAL_SKY_BG = require('@/assets/images/memorial-sky-bg.png');

type MemorialTabContentProps = {
  pets: Pet[];
  disabled?: boolean;
  onOpenPet: (pet: Pet) => void;
};

export function MemorialTabContent({ pets, disabled = false, onOpenPet }: MemorialTabContentProps) {
  const { t } = useTranslation();

  const cardBackground = useThemeColor(
    { light: '#f7f4fc', dark: '#1a1528' },
    'surface'
  );
  const cardBorder = useThemeColor({}, 'brandAccentBorder');
  const footerBackground = useThemeColor(
    { light: 'rgba(169, 152, 214, 0.14)', dark: 'rgba(169, 152, 214, 0.1)' },
    'brandAccentSoft'
  );
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const brandAccentColor = useThemeColor({}, 'brandAccent');
  const pawCircleBorder = useThemeColor({}, 'brandAccentBorder');

  const isEmpty = pets.length === 0;

  return (
    <View style={[styles.card, { backgroundColor: cardBackground, borderColor: cardBorder }]}>
      <View style={styles.header}>
        <Image
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          source={MEMORIAL_SKY_BG}
          style={styles.headerBackground}
          contentFit="cover"
        />
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.1)', 'transparent', cardBackground]}
          locations={[0, 0.55, 1]}
          style={styles.headerOverlay}
          pointerEvents="none"
        />
        <View style={styles.headerContent}>
          <View
            style={[
              styles.pawCircle,
              { backgroundColor: 'rgba(255, 255, 255, 0.2)', borderColor: pawCircleBorder },
            ]}>
            <IconSymbol name="pawprint.fill" size={28} color={Palette.onDark} />
          </View>
          <ThemedText
            style={styles.headerTitle}
            maxFontSizeMultiplier={Typography.subtitle.maxFontSizeMultiplier}>
            {t('myPets.memorialHeaderTitle')}
          </ThemedText>
          <ThemedText
            lightColor="rgba(255, 255, 255, 0.88)"
            darkColor="rgba(255, 255, 255, 0.88)"
            style={styles.headerSubtitle}
            maxFontSizeMultiplier={Typography.body.maxFontSizeMultiplier}>
            {t('myPets.memorialHeaderSubtitle')}
          </ThemedText>
        </View>
      </View>

      {isEmpty ? (
        <View style={styles.emptyState}>
          <View
            style={[
              styles.emptyIconCircle,
              { backgroundColor: footerBackground, borderColor: cardBorder },
            ]}>
            <IconSymbol name="sparkles" size={24} color={brandAccentColor} />
          </View>
          <ThemedText type="subtitle" style={styles.emptyTitle}>
            {t('myPets.emptyMemorialTitle')}
          </ThemedText>
          <ThemedText
            lightColor={textSecondaryColor}
            darkColor={textSecondaryColor}
            style={styles.emptyMessage}>
            {t('myPets.emptyMemorialMessage')}
          </ThemedText>
        </View>
      ) : (
        <View style={styles.petList}>
          {pets.map((pet, index) => (
            <PetListRow
              key={pet.id}
              pet={pet}
              disabled={disabled}
              isActive={false}
              isLast={index === pets.length - 1}
              memorialMode
              onOpenProfile={() => onOpenPet(pet)}
              onSelect={() => onOpenPet(pet)}
            />
          ))}
        </View>
      )}

      <View style={[styles.footer, { backgroundColor: footerBackground }]}>
        <ThemedText
          lightColor={textSecondaryColor}
          darkColor={textSecondaryColor}
          style={styles.footerText}>
          {t('myPets.memorialFooter')}
        </ThemedText>
        <IconSymbol name="heart" size={14} color={brandAccentColor} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  header: {
    minHeight: 220,
    justifyContent: 'flex-end',
  },
  headerBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  headerContent: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  pawCircle: {
    width: 64,
    height: 64,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  headerTitle: {
    textAlign: 'center',
    color: Palette.onDark,
    ...Typography.subtitle,
  },
  headerSubtitle: {
    textAlign: 'center',
    ...Typography.body,
  },
  petList: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  emptyTitle: {
    textAlign: 'center',
  },
  emptyMessage: {
    textAlign: 'center',
    ...Typography.body,
    maxWidth: 280,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderRadius: Radius.lg,
  },
  footerText: {
    ...Typography.caption,
    textAlign: 'center',
  },
});
