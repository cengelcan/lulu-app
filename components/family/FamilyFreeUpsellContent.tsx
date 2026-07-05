import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { FamilyBenefitCard } from '@/components/family/FamilyBenefitCard';
import { FamilyHeroPlaceholder } from '@/components/family/FamilyHeroPlaceholder';
import { LuluPlusPaywall } from '@/components/paywall/LuluPlusPaywall';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { PlusLockButtonIcon } from '@/components/ui/PlusLockIcon';
import { Spacing, Typography } from '@/constants/theme';
import { useTranslation } from '@/hooks/use-translation';
import { useThemeColor } from '@/hooks/use-theme-color';

export function FamilyFreeUpsellContent() {
  const router = useRouter();
  const { t } = useTranslation();
  const [isPaywallVisible, setIsPaywallVisible] = useState(false);
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const brandAccentColor = useThemeColor({}, 'brandAccent');

  const benefits = useMemo(
    () => [
      {
        icon: 'person.2.fill' as const,
        title: t('family.benefits.sharedAccess.title'),
        description: t('family.benefits.sharedAccess.description'),
      },
      {
        icon: 'calendar.badge.checkmark' as const,
        title: t('family.benefits.checkIns.title'),
        description: t('family.benefits.checkIns.description'),
      },
      {
        icon: 'shield.fill' as const,
        title: t('family.benefits.coordination.title'),
        description: t('family.benefits.coordination.description'),
      },
      {
        icon: 'doc.text.fill' as const,
        title: t('family.benefits.reports.title'),
        description: t('family.benefits.reports.description'),
      },
    ],
    [t]
  );

  return (
    <View style={styles.container}>
      <FamilyHeroPlaceholder icon="person.2.fill" />
      <ThemedText type="title" style={styles.headline}>
        {t('family.free.headline')}
      </ThemedText>
      <ThemedText
        lightColor={textSecondaryColor}
        darkColor={textSecondaryColor}
        style={styles.subheadline}>
        {t('family.free.subheadline')}
      </ThemedText>

      <View style={styles.benefits}>
        {benefits.map((benefit) => (
          <FamilyBenefitCard
            key={benefit.title}
            icon={benefit.icon}
            title={benefit.title}
            description={benefit.description}
          />
        ))}
      </View>

      <View style={styles.actions}>
        <Button
          title={t('family.free.unlockCta')}
          leadingIcon={<PlusLockButtonIcon />}
          onPress={() => setIsPaywallVisible(true)}
        />
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/family/join' as Href)}
          style={styles.linkButton}>
          <ThemedText lightColor={brandAccentColor} darkColor={brandAccentColor} style={styles.linkText}>
            {t('family.free.joinWithCode')}
          </ThemedText>
        </Pressable>
      </View>

      <LuluPlusPaywall visible={isPaywallVisible} onDismiss={() => setIsPaywallVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  headline: {
    textAlign: 'center',
  },
  subheadline: {
    textAlign: 'center',
    ...Typography.body,
    paddingHorizontal: Spacing.sm,
  },
  benefits: {
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  actions: {
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  linkButton: {
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  linkText: {
    ...Typography.body,
  },
});
