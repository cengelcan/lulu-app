import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ComingSoonModal } from '@/components/ui/ComingSoonModal';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { useTranslation } from '@/hooks/use-translation';
import { useUserStore } from '@/stores/user.store';
import { parseLocalDate } from '@/utils/date';
import { getLocaleTag } from '@/utils/locale';

const GRADIENT_COLORS = ['#6B4FC4', '#8B6FD4', '#A998D6'] as const;
// Reference: darkest at bottom-left, lightest at top-right.
const GRADIENT_START = { x: 0, y: 1 };
const GRADIENT_END = { x: 1, y: 0 };

const FEATURE_KEYS = [
  'profile.luluPlusFeaturePdf',
  'profile.luluPlusFeatureSharing',
  'profile.luluPlusFeatureBackup',
  'profile.luluPlusFeaturePhotos',
] as const;

function formatRenewalDate(dateString: string, locale: string): string | null {
  const parsed = parseLocalDate(dateString);
  if (!parsed) {
    return null;
  }

  return parsed.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

type FeatureRowProps = {
  label: string;
};

function FeatureRow({ label }: FeatureRowProps) {
  return (
    <View style={styles.featureRow}>
      <IconSymbol name="checkmark" size={16} color={Palette.onDark} />
      <Text
        allowFontScaling
        maxFontSizeMultiplier={Typography.body.maxFontSizeMultiplier}
        style={styles.featureLabel}>
        {label}
      </Text>
    </View>
  );
}

export function LuluPlusCard() {
  const { t, language } = useTranslation();
  const isPlusActive = useUserStore((state) => state.isPlusActive);
  const plusExpiresAt = useUserStore((state) => state.plusExpiresAt);

  const [isModalVisible, setIsModalVisible] = useState(false);

  const renewalDateLabel = useMemo(() => {
    if (!plusExpiresAt) {
      return null;
    }

    const formatted = formatRenewalDate(plusExpiresAt, getLocaleTag(language));
    return formatted ? t('profile.luluPlusRenewsOn', { date: formatted }) : null;
  }, [language, plusExpiresAt, t]);

  const handlePress = () => {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsModalVisible(true);
  };

  return (
    <>
      <LinearGradient
        colors={[...GRADIENT_COLORS]}
        start={GRADIENT_START}
        end={GRADIENT_END}
        style={styles.card}>
        <View style={styles.header}>
          <ThemedText type="subtitle" lightColor={Palette.onDark} darkColor={Palette.onDark}>
            {t('profile.luluPlus')}
          </ThemedText>
          <IconSymbol name="crown.fill" size={24} color={Palette.onDark} />
        </View>

        {isPlusActive ? (
          <View style={styles.activeContent}>
            <Text
              allowFontScaling
              maxFontSizeMultiplier={Typography.body.maxFontSizeMultiplier}
              style={styles.description}>
              {t('profile.luluPlusActiveStatus')}
            </Text>
            {renewalDateLabel ? (
              <Text
                allowFontScaling
                maxFontSizeMultiplier={Typography.caption.maxFontSizeMultiplier}
                style={styles.renewalDate}>
                {renewalDateLabel}
              </Text>
            ) : null}
          </View>
        ) : (
          <>
            <Text
              allowFontScaling
              maxFontSizeMultiplier={Typography.body.maxFontSizeMultiplier}
              style={styles.description}>
              {t('profile.luluPlusDescription')}
            </Text>
            <View style={styles.featureList}>
              {FEATURE_KEYS.map((key) => (
                <FeatureRow key={key} label={t(key)} />
              ))}
            </View>
          </>
        )}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isPlusActive ? t('profile.manageA11y') : t('profile.upgradeA11y')}
          onPress={handlePress}
          style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}>
          <Text
            allowFontScaling
            maxFontSizeMultiplier={Typography.button.maxFontSizeMultiplier}
            style={styles.ctaLabel}>
            {isPlusActive ? t('profile.manage') : t('profile.upgrade')}
          </Text>
        </Pressable>
      </LinearGradient>

      <ComingSoonModal visible={isModalVisible} onDismiss={() => setIsModalVisible(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  description: {
    ...Typography.body,
    color: Palette.onDark,
    opacity: 0.92,
  },
  activeContent: {
    gap: Spacing.xxs,
  },
  renewalDate: {
    ...Typography.caption,
    color: Palette.onDark,
    opacity: 0.8,
  },
  featureList: {
    gap: Spacing.xs,
    marginTop: Spacing.xxs,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  featureLabel: {
    ...Typography.body,
    color: Palette.onDark,
    flex: 1,
  },
  cta: {
    minHeight: 48,
    marginTop: Spacing.xs,
    borderRadius: Radius.md,
    backgroundColor: Palette.brandAccentLight,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  ctaPressed: {
    opacity: 0.85,
  },
  ctaLabel: {
    ...Typography.button,
    color: Palette.ink,
  },
});
