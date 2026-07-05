import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { FamilyHeroPlaceholder } from '@/components/family/FamilyHeroPlaceholder';
import { FamilyHowItWorksCard } from '@/components/family/FamilyHowItWorksCard';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing, Typography } from '@/constants/theme';
import { useTranslation } from '@/hooks/use-translation';
import { useThemeColor } from '@/hooks/use-theme-color';

export function FamilyEmptyContent() {
  const router = useRouter();
  const { t } = useTranslation();
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const brandAccentColor = useThemeColor({}, 'brandAccent');

  const steps = useMemo(
    () => [
      t('family.howItWorks.step1'),
      t('family.howItWorks.step2'),
      t('family.howItWorks.step3'),
      t('family.howItWorks.step4'),
    ],
    [t]
  );

  return (
    <View style={styles.container}>
      <FamilyHeroPlaceholder icon="pawprint.fill" />
      <ThemedText type="title" style={styles.headline}>
        {t('family.empty.headline')}
      </ThemedText>
      <ThemedText
        lightColor={textSecondaryColor}
        darkColor={textSecondaryColor}
        style={styles.subheadline}>
        {t('family.empty.subheadline')}
      </ThemedText>

      <View style={styles.actions}>
        <Button
          title={t('family.empty.createCta')}
          leadingIcon={<IconSymbol name="plus" size={18} color="#ffffff" />}
          onPress={() => router.push('/family/create' as Href)}
        />
        <Button
          title={t('family.empty.joinCta')}
          variant="secondary"
          leadingIcon={<IconSymbol name="person.2.fill" size={18} color={brandAccentColor} />}
          onPress={() => router.push('/family/join' as Href)}
        />
      </View>

      <FamilyHowItWorksCard title={t('family.howItWorks.title')} steps={steps} />
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
  actions: {
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
});
