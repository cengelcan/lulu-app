import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { LuluPlusPaywall } from '@/components/paywall/LuluPlusPaywall';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { LULU_PLUS_FEATURES } from '@/constants/plus-features';
import { useTranslation } from '@/hooks/use-translation';
import { refreshSubscriptionStatus } from '@/services/subscription/lifecycle';
import type { PlusSubscriptionDetails } from '@/services/subscription/plus-status';
import { useUserStore } from '@/stores/user.store';
import {
  formatSubscriptionDate,
  getPlanLabelKey,
  getTrialDaysRemaining,
  projectNextRenewalDate,
} from '@/utils/subscription-display';
import { getLocaleTag } from '@/utils/locale';

const APP_STORE_SUBSCRIPTIONS_URL = 'https://apps.apple.com/account/subscriptions';
const GRADIENT_COLORS = ['#6B4FC4', '#8B6FD4', '#A998D6'] as const;
const GRADIENT_START = { x: 0, y: 1 };
const GRADIENT_END = { x: 1, y: 0 };

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

function buildActiveSubscriptionCopy(
  subscription: PlusSubscriptionDetails | null,
  plusExpiresAt: string | null,
  t: (key: string, params?: Record<string, string>) => string,
  locale: string
): { planLabel: string | null; detailLines: string[] } {
  const detailLines: string[] = [];
  const planLabelKey = subscription ? getPlanLabelKey(subscription.planKind) : null;
  const planLabel = planLabelKey ? t(planLabelKey) : null;
  const expiresAt = subscription?.expiresAt ?? plusExpiresAt;

  if (subscription?.planKind === 'lifetime') {
    detailLines.push(t('profile.luluPlusLifetimeAccess'));
    if (subscription.purchasedAt) {
      const purchased = formatSubscriptionDate(subscription.purchasedAt, locale);
      if (purchased) {
        detailLines.push(t('profile.luluPlusPurchasedOn', { date: purchased }));
      }
    }
    return { planLabel, detailLines };
  }

  if (subscription?.isTrialPeriod && expiresAt) {
    const daysRemaining = getTrialDaysRemaining(expiresAt);
    if (daysRemaining === 0) {
      detailLines.push(t('profile.luluPlusTrialEndsToday'));
    } else if (daysRemaining === 1) {
      detailLines.push(t('profile.luluPlusTrialOneDayLeft'));
    } else {
      detailLines.push(t('profile.luluPlusTrialDaysLeft', { count: String(daysRemaining) }));
    }

    const trialEnd = formatSubscriptionDate(expiresAt, locale);
    if (trialEnd) {
      detailLines.push(t('profile.luluPlusTrialEndsOn', { date: trialEnd }));
    }

    const nextRenewal = projectNextRenewalDate(expiresAt, subscription.planKind);
    const nextRenewalLabel = nextRenewal
      ? formatSubscriptionDate(nextRenewal.toISOString(), locale)
      : null;
    if (nextRenewalLabel) {
      detailLines.push(t('profile.luluPlusNextRenewalOn', { date: nextRenewalLabel }));
    }

    return { planLabel, detailLines };
  }

  if (expiresAt) {
    const formatted = formatSubscriptionDate(expiresAt, locale);
    if (formatted) {
      if (subscription?.willRenew === false) {
        detailLines.push(t('profile.luluPlusExpiresOn', { date: formatted }));
      } else {
        detailLines.push(t('profile.luluPlusRenewsOn', { date: formatted }));
      }
    }
  }

  return { planLabel, detailLines };
}

export function LuluPlusCard() {
  const { t, language } = useTranslation();
  const isPlusActive = useUserStore((state) => state.isPlusActive);
  const plusExpiresAt = useUserStore((state) => state.plusExpiresAt);
  const plusSubscription = useUserStore((state) => state.plusSubscription);

  const [isPaywallVisible, setIsPaywallVisible] = useState(false);

  useEffect(() => {
    if (isPlusActive) {
      void refreshSubscriptionStatus();
    }
  }, [isPlusActive]);

  const locale = getLocaleTag(language);

  const { planLabel, detailLines } = useMemo(
    () => buildActiveSubscriptionCopy(plusSubscription, plusExpiresAt, t, locale),
    [locale, plusExpiresAt, plusSubscription, t]
  );

  const showManageButton =
    isPlusActive && plusSubscription?.planKind !== 'lifetime' && plusSubscription?.planKind !== 'unknown';

  const handlePress = () => {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (isPlusActive) {
      if (showManageButton) {
        void Linking.openURL(APP_STORE_SUBSCRIPTIONS_URL);
      }
      return;
    }

    setIsPaywallVisible(true);
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

            {planLabel ? (
              <View style={styles.planPill}>
                <Text
                  allowFontScaling
                  maxFontSizeMultiplier={Typography.caption.maxFontSizeMultiplier}
                  style={styles.planPillLabel}>
                  {planLabel}
                </Text>
              </View>
            ) : null}

            {detailLines.map((line) => (
              <Text
                key={line}
                allowFontScaling
                maxFontSizeMultiplier={Typography.caption.maxFontSizeMultiplier}
                style={styles.detailLine}>
                {line}
              </Text>
            ))}
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
              {LULU_PLUS_FEATURES.map((feature) => (
                <FeatureRow key={feature.titleKey} label={t(feature.titleKey)} />
              ))}
            </View>
          </>
        )}

        {showManageButton || !isPlusActive ? (
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
        ) : null}
      </LinearGradient>

      {isPaywallVisible ? (
        <LuluPlusPaywall
          key={language}
          visible
          onDismiss={() => setIsPaywallVisible(false)}
        />
      ) : null}
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
  planPill: {
    alignSelf: 'flex-start',
    marginTop: Spacing.xxs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  planPillLabel: {
    ...Typography.caption,
    color: Palette.onDark,
    fontWeight: '700',
  },
  detailLine: {
    ...Typography.caption,
    color: Palette.onDark,
    opacity: 0.85,
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
