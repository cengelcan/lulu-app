import { StyleSheet, View } from 'react-native';

import { FamilyIconAvatar } from '@/components/family/FamilyIconAvatar';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';

type FamilyStatusCardProps = {
  name: string;
  iconKey: string;
  memberCount: number;
  petCount: number;
  showPremiumBadge?: boolean;
};

export function FamilyStatusCard({
  name,
  iconKey,
  memberCount,
  petCount,
  showPremiumBadge = false,
}: FamilyStatusCardProps) {
  const { t } = useTranslation();
  const brandAccentSoft = useThemeColor({}, 'brandAccentSoft');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const brandAccentColor = useThemeColor({}, 'brandAccent');

  return (
    <View style={[styles.card, { backgroundColor: brandAccentSoft }]}>
      <FamilyIconAvatar iconKey={iconKey} size={52} />
      <View style={styles.info}>
        <ThemedText type="defaultSemiBold">{name}</ThemedText>
        <ThemedText lightColor={textSecondaryColor} darkColor={textSecondaryColor} style={styles.meta}>
          {t('family.statusMeta', { members: memberCount, pets: petCount })}
        </ThemedText>
      </View>
      {showPremiumBadge ? (
        <View style={[styles.badge, { backgroundColor: brandAccentColor }]}>
          <IconSymbol name="crown.fill" size={12} color="#FBBF24" />
          <ThemedText style={styles.badgeText}>{t('family.premiumBadge')}</ThemedText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  meta: {
    ...Typography.caption,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
});
