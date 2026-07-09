import * as Haptics from 'expo-haptics';
import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { PurchasesPackage } from 'react-native-purchases';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { LuluLogo } from '@/components/LuluLogo';
import { BrandGradientFill } from '@/components/ui/BrandGradient';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { LEGAL_URLS } from '@/constants/legal';
import {
  SUBSCRIPTION_PRODUCT_IDS,
  SUBSCRIPTION_PREVIEW_PRICES,
  type SubscriptionProductId,
} from '@/constants/subscription';
import { LULU_PLUS_FEATURES } from '@/constants/plus-features';
import { Fonts, Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import { isRevenueCatAvailable } from '@/services/subscription/revenuecat';
import { useSubscriptionStore } from '@/stores/subscription.store';
import { useUserStore } from '@/stores/user.store';
import { translateError } from '@/utils/translate-error';

const APP_STORE_SUBSCRIPTIONS_URL = 'https://apps.apple.com/account/subscriptions';
const HERO_LOGO_SIZE = 80;

type PlanVisual = {
  icon: IconSymbolName;
  badgeKey?: string;
  badgeStyle?: 'popular' | 'save' | 'lifetime';
};

type PlanOption = {
  id: SubscriptionProductId;
  titleKey: string;
  subtitleKey: string;
  visual: PlanVisual;
};

const PLAN_OPTIONS: PlanOption[] = [
  {
    id: SUBSCRIPTION_PRODUCT_IDS.weekly,
    titleKey: 'paywall.planWeeklyTitle',
    subtitleKey: 'paywall.trialWeekly',
    visual: {
      icon: 'crown.fill',
    },
  },
  {
    id: SUBSCRIPTION_PRODUCT_IDS.yearly,
    titleKey: 'paywall.planYearlyTitle',
    subtitleKey: 'paywall.trialYearly',
    visual: {
      icon: 'star.fill',
      badgeKey: 'paywall.planMostPopular',
      badgeStyle: 'popular',
    },
  },
  {
    id: SUBSCRIPTION_PRODUCT_IDS.lifetime,
    titleKey: 'paywall.planLifetimeTitle',
    subtitleKey: 'paywall.lifetimePayOnce',
    visual: {
      icon: 'gift.fill',
      badgeKey: 'paywall.planOneTimePayment',
      badgeStyle: 'lifetime',
    },
  },
];

type LuluPlusPaywallContentProps = {
  onDismiss: () => void;
  onPurchaseComplete?: () => void;
  /** Dev/screenshot mode — shows mock plan prices without RevenueCat. */
  previewMode?: boolean;
  /** Pre-select a plan (preview screenshots / deep links). */
  initialSelectedPlan?: SubscriptionProductId;
};

type LuluPlusPaywallProps = LuluPlusPaywallContentProps & {
  visible: boolean;
};

async function openLegalUrl(url: string): Promise<void> {
  await openBrowserAsync(url, {
    presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
  });
}

function findPackage(
  packages: PurchasesPackage[],
  productId: SubscriptionProductId
): PurchasesPackage | null {
  return packages.find((pkg) => pkg.product.identifier === productId) ?? null;
}

type FeatureTileProps = {
  icon: IconSymbolName;
  title: string;
  description: string;
  iconColor: string;
  textColor: string;
  textSecondaryColor: string;
};

function FeatureTile({
  icon,
  title,
  description,
  iconColor,
  textColor,
  textSecondaryColor,
}: FeatureTileProps) {
  return (
    <View style={styles.featureTile}>
      <IconSymbol name={icon} size={20} color={iconColor} style={styles.featureIcon} />
      <View style={styles.featureCopy}>
        <Text
          allowFontScaling
          maxFontSizeMultiplier={1.4}
          style={[styles.featureTitle, { color: textColor }]}>
          {title}
        </Text>
        <Text
          allowFontScaling
          maxFontSizeMultiplier={1.5}
          style={[styles.featureDescription, { color: textSecondaryColor }]}>
          {description}
        </Text>
      </View>
    </View>
  );
}

type PlanCardProps = {
  title: string;
  price: string;
  period?: string;
  subtitle: string;
  badge?: string;
  selected: boolean;
  onPress: () => void;
  visual: PlanVisual;
  brandAccentColor: string;
  brandAccentSoftColor: string;
  surfaceColor: string;
  textColor: string;
  textSecondaryColor: string;
  borderColor: string;
};

function PlanCard({
  title,
  price,
  period,
  subtitle,
  badge,
  selected,
  onPress,
  visual,
  brandAccentColor,
  brandAccentSoftColor,
  surfaceColor,
  textColor,
  textSecondaryColor,
  borderColor,
}: PlanCardProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.planCard,
        {
          borderColor: selected ? brandAccentColor : borderColor,
          backgroundColor: selected ? brandAccentSoftColor : surfaceColor,
        },
        selected && styles.planCardSelected,
      ]}>
      {badge ? (
        <View style={[styles.planBadge, { backgroundColor: brandAccentSoftColor }]}>
          <Text
            allowFontScaling
            maxFontSizeMultiplier={1.2}
            numberOfLines={1}
            style={[styles.planBadgeText, { color: brandAccentColor }]}>
            {badge}
          </Text>
        </View>
      ) : (
        <View style={styles.planBadgeSpacer} />
      )}

      <IconSymbol name={visual.icon} size={20} color={brandAccentColor} />

      <Text
        allowFontScaling
        maxFontSizeMultiplier={1.3}
        numberOfLines={1}
        style={[styles.planTitle, { color: textColor }]}>
        {title}
      </Text>

      <Text
        allowFontScaling
        maxFontSizeMultiplier={1.25}
        numberOfLines={1}
        style={[styles.planPrice, { color: textColor }]}>
        {price}
      </Text>
      {period ? (
        <Text
          allowFontScaling
          maxFontSizeMultiplier={1.25}
          numberOfLines={1}
          style={[styles.planPeriod, { color: textSecondaryColor }]}>
          {period}
        </Text>
      ) : null}

      <Text
        allowFontScaling
        maxFontSizeMultiplier={1.3}
        numberOfLines={2}
        style={[styles.planSubtitle, { color: textSecondaryColor }]}>
        {subtitle}
      </Text>

      <View style={styles.planCardFooter}>
        {selected ? (
          <IconSymbol name="checkmark.circle.fill" size={20} color={brandAccentColor} />
        ) : (
          <View style={[styles.planRadioEmpty, { borderColor }]} />
        )}
      </View>
    </Pressable>
  );
}

type TrustBadgeProps = {
  icon: IconSymbolName;
  label: string;
  iconColor: string;
  textSecondaryColor: string;
};

function TrustBadge({ icon, label, iconColor, textSecondaryColor }: TrustBadgeProps) {
  return (
    <View style={styles.trustBadge}>
      <IconSymbol name={icon} size={18} color={iconColor} />
      <Text
        allowFontScaling
        maxFontSizeMultiplier={1.3}
        style={[styles.trustLabel, { color: textSecondaryColor }]}>
        {label}
      </Text>
    </View>
  );
}

export function LuluPlusPaywallContent({
  onDismiss,
  onPurchaseComplete,
  previewMode = false,
  initialSelectedPlan = SUBSCRIPTION_PRODUCT_IDS.yearly,
}: LuluPlusPaywallContentProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surfaceElevated');
  const brandAccentColor = useThemeColor({}, 'brandAccent');
  const brandAccentLightColor = useThemeColor({}, 'brandAccentLight');
  const brandAccentSoftColor = useThemeColor({}, 'brandAccentSoft');
  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');

  const isPlusActive = useUserStore((state) => state.isPlusActive);
  const offerings = useSubscriptionStore((state) => state.offerings);
  const isLoading = useSubscriptionStore((state) => state.isLoading);
  const subscriptionError = useSubscriptionStore((state) => state.error);
  const loadOfferings = useSubscriptionStore((state) => state.loadOfferings);
  const clearSubscriptionError = useSubscriptionStore((state) => state.clearError);
  const purchasePackage = useSubscriptionStore((state) => state.purchasePackage);
  const restorePurchases = useSubscriptionStore((state) => state.restorePurchases);

  const [selectedPlanId, setSelectedPlanId] = useState<SubscriptionProductId>(initialSelectedPlan);

  useEffect(() => {
    setSelectedPlanId(initialSelectedPlan);
  }, [initialSelectedPlan]);

  useEffect(() => {
    if (!previewMode) {
      void loadOfferings();
    }
  }, [loadOfferings, previewMode]);

  const packages = useMemo(
    () => (previewMode ? [] : (offerings?.availablePackages ?? [])),
    [previewMode, offerings]
  );
  const showMockPlans =
    previewMode ||
    !isRevenueCatAvailable() ||
    (__DEV__ && !isLoading && packages.length === 0);

  const selectedPackage = useMemo(
    () => findPackage(packages, selectedPlanId),
    [packages, selectedPlanId]
  );

  const canPurchase = !previewMode && isRevenueCatAvailable() && selectedPackage !== null;

  const handleDismiss = () => {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onDismiss();
  };

  const handlePrimaryPress = async () => {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (previewMode) {
      return;
    }

    if (isPlusActive) {
      await Linking.openURL(APP_STORE_SUBSCRIPTIONS_URL);
      return;
    }

    if (!selectedPackage) {
      return;
    }

    try {
      clearSubscriptionError();
      await purchasePackage(selectedPackage);

      if (!useUserStore.getState().isPlusActive) {
        return;
      }

      onPurchaseComplete?.();
      onDismiss();
    } catch {
      // Store holds error state.
    }
  };

  const handleRestore = async () => {
    if (previewMode) {
      return;
    }

    try {
      await restorePurchases();
      if (useUserStore.getState().isPlusActive) {
        onPurchaseComplete?.();
        onDismiss();
      }
    } catch {
      // Store holds error state.
    }
  };

  const primaryCtaTitle = useMemo(() => {
    if (isPlusActive) {
      return t('paywall.manageSubscription');
    }

    switch (selectedPlanId) {
      case SUBSCRIPTION_PRODUCT_IDS.weekly:
        return t('paywall.ctaTrial3Day');
      case SUBSCRIPTION_PRODUCT_IDS.yearly:
        return t('paywall.ctaTrial7Day');
      case SUBSCRIPTION_PRODUCT_IDS.lifetime:
        return t('paywall.ctaLifetime');
      default:
        return t('paywall.subscribeCta');
    }
  }, [isPlusActive, selectedPlanId, t]);

  const getPlanPricing = (planId: SubscriptionProductId, pkg: PurchasesPackage | null) => {
    const usePreviewPrice = previewMode || showMockPlans || __DEV__ || !pkg;
    const amount = usePreviewPrice
      ? SUBSCRIPTION_PREVIEW_PRICES[planId]
      : pkg!.product.priceString;

    switch (planId) {
      case SUBSCRIPTION_PRODUCT_IDS.weekly:
        return {
          price: amount,
          period: t('paywall.pricePerWeek'),
        };
      case SUBSCRIPTION_PRODUCT_IDS.yearly:
        return {
          price: amount,
          period: t('paywall.pricePerYear'),
        };
      default:
        return {
          price: amount,
          period: undefined,
        };
    }
  };

  const renderPlans = () => {
    if (isPlusActive) {
      return null;
    }

    if (!previewMode && isLoading && packages.length === 0) {
      return (
        <View style={styles.plansLoading}>
          <ActivityIndicator color={brandAccentColor} />
          <Text allowFontScaling style={[styles.plansLoadingLabel, { color: textSecondaryColor }]}>
            {t('paywall.loadingPlans')}
          </Text>
        </View>
      );
    }

    if (!showMockPlans && packages.length === 0) {
      return (
        <View style={styles.plansUnavailableBlock}>
          <Text allowFontScaling style={[styles.plansUnavailable, { color: textSecondaryColor }]}>
            {translateError(t, subscriptionError) ?? t('paywall.plansUnavailable')}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => void loadOfferings()}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
            <Text allowFontScaling style={[styles.retryPlans, { color: brandAccentColor }]}>
              {t('common.tryAgain')}
            </Text>
          </Pressable>
        </View>
      );
    }

    return (
      <View style={styles.plansRow}>
        {PLAN_OPTIONS.map((plan) => {
          const pkg = findPackage(packages, plan.id);
          const pricing = getPlanPricing(plan.id, pkg);
          const badge = plan.visual.badgeKey ? t(plan.visual.badgeKey) : undefined;

          return (
            <PlanCard
              key={plan.id}
              title={t(plan.titleKey)}
              price={pricing.price}
              period={pricing.period}
              subtitle={t(plan.subtitleKey)}
              badge={badge}
              selected={selectedPlanId === plan.id}
              onPress={() => setSelectedPlanId(plan.id)}
              visual={plan.visual}
              brandAccentColor={brandAccentColor}
              brandAccentSoftColor={brandAccentSoftColor}
              surfaceColor={surfaceColor}
              textColor={textColor}
              textSecondaryColor={textSecondaryColor}
              borderColor={borderColor}
            />
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor }]} edges={['bottom']}>
      <View style={styles.layout}>
        <View style={[styles.headerBar, { paddingTop: insets.top + Spacing.md }]}>
          <Pressable
            accessibilityLabel={t('common.dismissDialog')}
            accessibilityRole="button"
            hitSlop={12}
            onPress={handleDismiss}
            style={({ pressed }) => [styles.closeButton, { opacity: pressed ? 0.7 : 1 }]}>
            <IconSymbol name="xmark.circle.fill" size={30} color={textSecondaryColor} />
          </Pressable>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <View style={styles.heroCopy}>
            <LuluLogo
              accessibilityLabel={t('paywall.title')}
              size={HERO_LOGO_SIZE}
              style={styles.heroLogo}
            />
            <Text
              allowFontScaling
              maxFontSizeMultiplier={1.25}
              style={[styles.heroTitle, { color: brandAccentLightColor }]}>
              {t('paywall.title')}
            </Text>
            <View
              style={[
                styles.heroPill,
                {
                  backgroundColor: brandAccentSoftColor,
                  borderColor: Palette.brandAccentBorder,
                },
              ]}>
              <IconSymbol name="sparkles" size={14} color={brandAccentColor} />
              <Text
                allowFontScaling
                maxFontSizeMultiplier={1.3}
                style={[styles.heroPillText, { color: textColor }]}>
                {t('paywall.heroPill')}
              </Text>
            </View>
          </View>

          <View style={styles.body}>
            <View
              style={[
                styles.featuresCard,
                {
                  backgroundColor: surfaceColor,
                  borderColor,
                },
              ]}>
              <Text allowFontScaling maxFontSizeMultiplier={1.35} style={[styles.featuresTitle, { color: textColor }]}>
                {t('paywall.featuresTitleBefore')}
                <Text style={{ color: brandAccentColor, fontWeight: '700' }}>
                  {t('paywall.featuresTitleAccent')}
                </Text>
                {t('paywall.featuresTitleAfter')}
              </Text>

              <View style={styles.featureGrid}>
                {LULU_PLUS_FEATURES.map((feature) => (
                  <FeatureTile
                    key={feature.titleKey}
                    icon={feature.icon}
                    title={t(feature.titleKey)}
                    description={t(feature.descriptionKey)}
                    iconColor={feature.iconColor}
                    textColor={textColor}
                    textSecondaryColor={textSecondaryColor}
                  />
                ))}
              </View>
            </View>

            {!isPlusActive ? <View style={styles.plansSection}>{renderPlans()}</View> : null}

            <View style={styles.trustRow}>
              <TrustBadge
                icon="shield.fill"
                label={t('paywall.trustSecure')}
                iconColor={brandAccentColor}
                textSecondaryColor={textSecondaryColor}
              />
              <TrustBadge
                icon="arrow.clockwise"
                label={t('paywall.trustCancel')}
                iconColor={Palette.brandAccentDark}
                textSecondaryColor={textSecondaryColor}
              />
              <TrustBadge
                icon="heart.fill"
                label={t('paywall.trustLoved')}
                iconColor={Palette.badgePink}
                textSecondaryColor={textSecondaryColor}
              />
            </View>

            <Text
              allowFontScaling
              maxFontSizeMultiplier={1.5}
              style={[styles.legalText, { color: textSecondaryColor }]}>
              {t('paywall.legalRenewal')}
            </Text>

            <View style={styles.footerLinks}>
              <Pressable accessibilityRole="link" onPress={() => void openLegalUrl(LEGAL_URLS.terms)}>
                <Text
                  allowFontScaling
                  maxFontSizeMultiplier={1.3}
                  style={[styles.footerLink, { color: brandAccentColor }]}>
                  {t('profile.terms')}
                </Text>
              </Pressable>
              <Text style={[styles.footerLinkDivider, { color: textSecondaryColor }]}>·</Text>
              <Pressable
                accessibilityRole="link"
                onPress={() => void openLegalUrl(LEGAL_URLS.privacyPolicy)}>
                <Text
                  allowFontScaling
                  maxFontSizeMultiplier={1.3}
                  style={[styles.footerLink, { color: brandAccentColor }]}>
                  {t('profile.privacyPolicy')}
                </Text>
              </Pressable>
              {!isPlusActive ? (
                <>
                  <Text style={[styles.footerLinkDivider, { color: textSecondaryColor }]}>·</Text>
                  <Pressable accessibilityRole="button" onPress={() => void handleRestore()}>
                    <Text
                      allowFontScaling
                      maxFontSizeMultiplier={1.3}
                      style={[styles.footerLink, { color: brandAccentColor }]}>
                      {t('paywall.restorePurchases')}
                    </Text>
                  </Pressable>
                </>
              ) : null}
            </View>
          </View>
        </ScrollView>

        <View
          style={[
            styles.footer,
            {
              backgroundColor,
              borderTopColor: borderColor,
            },
          ]}>
          {subscriptionError && !previewMode && packages.length > 0 ? (
            <Text allowFontScaling style={[styles.purchaseError, { color: textSecondaryColor }]}>
              {translateError(t, subscriptionError)}
            </Text>
          ) : null}
          <Pressable
            accessibilityRole="button"
            disabled={!isPlusActive && !previewMode && (!canPurchase || isLoading)}
            onPress={() => void handlePrimaryPress()}
            style={({ pressed }) => [
              styles.ctaButton,
              isPlusActive ? { backgroundColor: brandAccentColor } : styles.ctaButtonGradient,
              {
                opacity:
                  !isPlusActive && !previewMode && (!canPurchase || isLoading) ? 0.45 : pressed ? 0.9 : 1,
              },
            ]}>
            {!isPlusActive ? <BrandGradientFill /> : null}
            <IconSymbol name="sparkles" size={18} color={Palette.onDark} />
            <Text allowFontScaling maxFontSizeMultiplier={1.3} style={styles.ctaLabel}>
              {primaryCtaTitle}
            </Text>
            <IconSymbol name="chevron.right" size={18} color={Palette.onDark} />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

/** @deprecated Prefer the `/paywall` route or `LuluPlusPaywallContent` on a full-screen stack screen. */
export function LuluPlusPaywall({ visible, ...props }: LuluPlusPaywallProps) {
  return (
    <Modal
      animationType="slide"
      presentationStyle="fullScreen"
      visible={visible}
      onRequestClose={props.onDismiss}>
      <LuluPlusPaywallContent {...props} />
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  layout: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing.lg,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xs,
    zIndex: 1,
  },
  closeButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCopy: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxs,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  heroLogo: {
    backgroundColor: 'transparent',
  },
  heroTitle: {
    textAlign: 'center',
    fontSize: 42,
    lineHeight: 44,
    fontWeight: '600',
    letterSpacing: -1.1,
    fontFamily: Platform.select({
      ios: Fonts?.rounded,
      web: Fonts?.rounded,
      default: undefined,
    }),
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xxs,
    marginTop: Spacing.xxs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  heroPillText: {
    ...Typography.caption,
    fontWeight: '600',
    textAlign: 'center',
  },
  body: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.lg,
  },
  featuresCard: {
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    gap: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  featuresTitle: {
    ...Typography.titleSmall,
    textAlign: 'center',
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  featureTile: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
  },
  featureIcon: {
    marginTop: 1,
  },
  featureCopy: {
    flex: 1,
    gap: 2,
  },
  featureTitle: {
    ...Typography.caption,
    fontWeight: '700',
  },
  featureDescription: {
    fontSize: 11,
    lineHeight: 15,
  },
  plansSection: {
    gap: Spacing.sm,
  },
  plansRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    alignItems: 'stretch',
  },
  plansLoading: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  plansLoadingLabel: {
    ...Typography.body,
    textAlign: 'center',
  },
  plansUnavailable: {
    ...Typography.body,
    textAlign: 'center',
  },
  plansUnavailableBlock: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  retryPlans: {
    ...Typography.body,
    fontWeight: '600',
  },
  purchaseError: {
    ...Typography.caption,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  planCard: {
    flex: 1,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    padding: Spacing.sm,
    alignItems: 'center',
    gap: Spacing.xxs,
    minHeight: 168,
  },
  planCardSelected: {
    borderWidth: 2.5,
  },
  planBadge: {
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.xxs,
    paddingVertical: 2,
    maxWidth: '100%',
  },
  planBadgeSpacer: {
    height: 16,
  },
  planBadgeText: {
    fontSize: 8,
    lineHeight: 10,
    fontWeight: '800',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  planTitle: {
    ...Typography.caption,
    fontWeight: '700',
    textAlign: 'center',
  },
  planPrice: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  planPeriod: {
    fontSize: 10,
    lineHeight: 12,
    textAlign: 'center',
  },
  planSubtitle: {
    fontSize: 10,
    lineHeight: 13,
    textAlign: 'center',
    flex: 1,
  },
  planCardFooter: {
    marginTop: 'auto',
    paddingTop: Spacing.xxs,
  },
  planRadioEmpty: {
    width: 20,
    height: 20,
    borderRadius: Radius.full,
    borderWidth: 1.5,
  },
  trustRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  trustBadge: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.xxs,
  },
  trustLabel: {
    fontSize: 11,
    lineHeight: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
  legalText: {
    ...Typography.caption,
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingBottom: Spacing.sm,
  },
  footerLink: {
    ...Typography.caption,
    fontWeight: '600',
  },
  footerLinkDivider: {},
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  ctaButton: {
    minHeight: 56,
    borderRadius: Radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    overflow: 'hidden',
  },
  ctaButtonGradient: {
    backgroundColor: 'transparent',
  },
  ctaLabel: {
    ...Typography.button,
    color: Palette.onDark,
    flex: 1,
    textAlign: 'center',
  },
});
