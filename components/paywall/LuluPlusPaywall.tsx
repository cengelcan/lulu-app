import * as Haptics from 'expo-haptics';
import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import { useEffect, useMemo, useState } from 'react';
import {
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import type { PurchasesPackage } from 'react-native-purchases';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { LuluLogo } from '@/components/LuluLogo';
import { BrandGradientFill } from '@/components/ui/BrandGradient';
import { ContentState } from '@/components/ui/content-state';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { getLegalUrls } from '@/constants/legal';
import { LayoutTokens } from '@/constants/layout';
import { getPaywallLayout } from '@/constants/paywall-layout';
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
import { buildPaywallPlanCopy } from '@/utils/paywall-billing';
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
  visual: PlanVisual;
};

const PLAN_OPTIONS: PlanOption[] = [
  {
    id: SUBSCRIPTION_PRODUCT_IDS.monthly,
    titleKey: 'paywall.planMonthlyTitle',
    visual: {
      icon: 'crown.fill',
    },
  },
  {
    id: SUBSCRIPTION_PRODUCT_IDS.yearly,
    titleKey: 'paywall.planYearlyTitle',
    visual: {
      icon: 'star.fill',
      badgeKey: 'paywall.planMostPopular',
      badgeStyle: 'popular',
    },
  },
  {
    id: SUBSCRIPTION_PRODUCT_IDS.lifetime,
    titleKey: 'paywall.planLifetimeTitle',
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
  expanded: boolean;
};

function FeatureTile({
  icon,
  title,
  description,
  iconColor,
  textColor,
  textSecondaryColor,
  expanded,
}: FeatureTileProps) {
  return (
    <View style={[styles.featureTile, expanded && styles.featureTileStacked]}>
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
  expanded: boolean;
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
  expanded,
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
      accessibilityLabel={[badge, title, price, period, subtitle].filter(Boolean).join('. ')}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.planCard,
        {
          borderColor: selected ? brandAccentColor : borderColor,
          backgroundColor: selected ? brandAccentSoftColor : surfaceColor,
        },
        selected && styles.planCardSelected,
        expanded && styles.planCardExpanded,
      ]}>
      {badge ? (
        <View style={[styles.planBadge, { backgroundColor: brandAccentSoftColor }]}>
          <Text
            allowFontScaling
            maxFontSizeMultiplier={Typography.caption.maxFontSizeMultiplier}
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
        maxFontSizeMultiplier={Typography.caption.maxFontSizeMultiplier}
        style={[styles.planTitle, { color: textColor }]}>
        {title}
      </Text>

      <Text
        allowFontScaling
        maxFontSizeMultiplier={Typography.bodySemiBold.maxFontSizeMultiplier}
        selectable
        style={[styles.planPrice, { color: textColor }]}>
        {price}
      </Text>
      {period ? (
        <Text
          allowFontScaling
          maxFontSizeMultiplier={Typography.caption.maxFontSizeMultiplier}
          style={[styles.planPeriod, { color: textSecondaryColor }]}>
          {period}
        </Text>
      ) : null}

      <Text
        allowFontScaling
        maxFontSizeMultiplier={Typography.caption.maxFontSizeMultiplier}
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
  expanded: boolean;
};

function TrustBadge({ icon, label, iconColor, textSecondaryColor, expanded }: TrustBadgeProps) {
  return (
    <View style={[styles.trustBadge, expanded && styles.trustBadgeStacked]}>
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
  const { t, language } = useTranslation();
  const legalUrls = getLegalUrls(language);
  const insets = useSafeAreaInsets();
  const { fontScale, width } = useWindowDimensions();
  const paywallLayout = getPaywallLayout(width, fontScale);

  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surfaceElevated');
  const accentColor = useThemeColor({}, 'accent');
  const brandAccentSoftColor = useThemeColor({}, 'brandAccentSoft');
  const brandAccentBorderColor = useThemeColor({}, 'brandAccentBorder');
  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');
  const alertColor = useThemeColor({}, 'alert');

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

  const getPlanPricing = (planId: SubscriptionProductId, pkg: PurchasesPackage | null) => {
    const usePreviewPrice = previewMode || showMockPlans || !pkg;
    const amount = usePreviewPrice
      ? SUBSCRIPTION_PREVIEW_PRICES[planId]
      : pkg!.product.priceString;

    switch (planId) {
      case SUBSCRIPTION_PRODUCT_IDS.monthly:
        return {
          price: amount,
          period: t('paywall.pricePerMonth'),
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

  const selectedPricing = getPlanPricing(selectedPlanId, selectedPackage);
  const selectedPlanCopy = buildPaywallPlanCopy(selectedPlanId, selectedPricing.price, t);
  const primaryCtaTitle = isPlusActive
    ? t('paywall.manageSubscription')
    : selectedPlanCopy.cta;

  const renderPlans = () => {
    if (isPlusActive) {
      return null;
    }

    if (!previewMode && isLoading && packages.length === 0) {
      return (
        <ContentState
          kind="loading"
          accessibilityLabel={t('paywall.loadingPlans')}
          style={styles.plansLoading}
        />
      );
    }

    if (!showMockPlans && packages.length === 0) {
      return (
        <ContentState
          kind="error"
          message={translateError(t, subscriptionError) ?? t('paywall.plansUnavailable')}
          actionLabel={t('common.tryAgain')}
          onActionPress={() => void loadOfferings()}
        />
      );
    }

    return (
      <View style={[styles.plansRow, paywallLayout.stackPlans && styles.plansRowStacked]}>
        {PLAN_OPTIONS.map((plan) => {
          const pkg = findPackage(packages, plan.id);
          const pricing = getPlanPricing(plan.id, pkg);
          const planCopy = buildPaywallPlanCopy(plan.id, pricing.price, t);
          const badge = plan.visual.badgeKey ? t(plan.visual.badgeKey) : undefined;

          return (
            <PlanCard
              key={plan.id}
              title={t(plan.titleKey)}
              price={pricing.price}
              period={pricing.period}
              subtitle={planCopy.subtitle}
              badge={badge}
              selected={selectedPlanId === plan.id}
              expanded={paywallLayout.stackPlans}
              onPress={() => setSelectedPlanId(plan.id)}
              visual={plan.visual}
              brandAccentColor={accentColor}
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
          contentInsetAdjustmentBehavior="automatic"
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
              style={[styles.heroTitle, { color: accentColor }]}>
              {t('paywall.title')}
            </Text>
            <View
              style={[
                styles.heroPill,
                {
                  backgroundColor: brandAccentSoftColor,
                  borderColor: brandAccentBorderColor,
                },
              ]}>
              <IconSymbol name="sparkles" size={14} color={accentColor} />
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
                <Text style={{ color: accentColor, fontWeight: '700' }}>
                  {t('paywall.featuresTitleAccent')}
                </Text>
                {t('paywall.featuresTitleAfter')}
              </Text>

              <View
                style={[
                  styles.featureGrid,
                  paywallLayout.stackFeatures && styles.featureGridStacked,
                ]}>
                {LULU_PLUS_FEATURES.map((feature) => (
                  <FeatureTile
                    key={feature.titleKey}
                    icon={feature.icon}
                    title={t(feature.titleKey)}
                    description={t(feature.descriptionKey)}
                    iconColor={feature.iconColor}
                    textColor={textColor}
                    textSecondaryColor={textSecondaryColor}
                    expanded={paywallLayout.stackFeatures}
                  />
                ))}
              </View>
            </View>

            {!isPlusActive ? <View style={styles.plansSection}>{renderPlans()}</View> : null}

            <View
              style={[
                styles.trustRow,
                paywallLayout.stackTrustBadges && styles.trustRowStacked,
              ]}>
              <TrustBadge
                icon="shield.fill"
                label={t('paywall.trustSecure')}
                iconColor={accentColor}
                textSecondaryColor={textSecondaryColor}
                expanded={paywallLayout.stackTrustBadges}
              />
              <TrustBadge
                icon="arrow.clockwise"
                label={t('paywall.trustCancel')}
                iconColor={accentColor}
                textSecondaryColor={textSecondaryColor}
                expanded={paywallLayout.stackTrustBadges}
              />
              <TrustBadge
                icon="heart.fill"
                label={t('paywall.trustLoved')}
                iconColor={Palette.badgePink}
                textSecondaryColor={textSecondaryColor}
                expanded={paywallLayout.stackTrustBadges}
              />
            </View>

            <Text
              allowFontScaling
              maxFontSizeMultiplier={1.5}
              style={[styles.legalText, { color: textSecondaryColor }]}>
              {t('paywall.legalRenewal')}
            </Text>

            <View style={styles.footerLinks}>
              <Pressable
                accessibilityRole="link"
                onPress={() => void openLegalUrl(legalUrls.terms)}
                style={styles.footerLinkPressable}>
                <Text
                  allowFontScaling
                  maxFontSizeMultiplier={1.3}
                  style={[styles.footerLink, { color: accentColor }]}>
                  {t('profile.terms')}
                </Text>
              </Pressable>
              <Text style={[styles.footerLinkDivider, { color: textSecondaryColor }]}>·</Text>
              <Pressable
                accessibilityRole="link"
                onPress={() => void openLegalUrl(legalUrls.privacyPolicy)}
                style={styles.footerLinkPressable}>
                <Text
                  allowFontScaling
                  maxFontSizeMultiplier={1.3}
                  style={[styles.footerLink, { color: accentColor }]}>
                  {t('profile.privacyPolicy')}
                </Text>
              </Pressable>
              {!isPlusActive ? (
                <>
                  <Text style={[styles.footerLinkDivider, { color: textSecondaryColor }]}>·</Text>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => void handleRestore()}
                    style={styles.footerLinkPressable}>
                    <Text
                      allowFontScaling
                      maxFontSizeMultiplier={1.3}
                      style={[styles.footerLink, { color: accentColor }]}>
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
            <Text
              accessibilityLiveRegion="assertive"
              allowFontScaling
              selectable
              style={[styles.purchaseError, { color: alertColor }]}>
              {translateError(t, subscriptionError)}
            </Text>
          ) : null}
          {!isPlusActive ? (
            <Text
              selectable
              allowFontScaling
              maxFontSizeMultiplier={1.4}
              style={[styles.billingDisclosure, { color: textSecondaryColor }]}>
              {selectedPlanCopy.disclosure}
            </Text>
          ) : null}
          <Pressable
            accessibilityLabel={primaryCtaTitle}
            accessibilityRole="button"
            accessibilityState={{
              disabled: !isPlusActive && !previewMode && (!canPurchase || isLoading),
            }}
            disabled={!isPlusActive && !previewMode && (!canPurchase || isLoading)}
            onPress={() => void handlePrimaryPress()}
            style={({ pressed }) => [
              styles.ctaButton,
              isPlusActive ? { backgroundColor: accentColor } : styles.ctaButtonGradient,
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
    width: '100%',
    maxWidth: LayoutTokens.readingContentMaxWidth,
    alignSelf: 'center',
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
    width: '100%',
    maxWidth: LayoutTokens.readingContentMaxWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.lg,
  },
  featuresCard: {
    borderRadius: Radius.xl,
    borderCurve: 'continuous',
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
  featureGridStacked: {
    flexDirection: 'column',
  },
  featureTile: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
  },
  featureTileStacked: {
    width: '100%',
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
  plansRowStacked: {
    flexDirection: 'column',
  },
  plansLoading: {
    minHeight: 120,
  },
  purchaseError: {
    ...Typography.caption,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  planCard: {
    flex: 1,
    borderRadius: Radius.lg,
    borderCurve: 'continuous',
    borderWidth: 1.5,
    padding: Spacing.sm,
    alignItems: 'center',
    gap: Spacing.xxs,
    minHeight: 168,
  },
  planCardSelected: {
    borderWidth: 2.5,
  },
  planCardExpanded: {
    flex: 0,
    width: '100%',
    minHeight: 0,
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
  trustRowStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  trustBadge: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.xxs,
  },
  trustBadgeStacked: {
    flexDirection: 'row',
    justifyContent: 'center',
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
  footerLinkPressable: {
    minHeight: 44,
    justifyContent: 'center',
  },
  footerLinkDivider: {},
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: Spacing.sm,
  },
  billingDisclosure: {
    ...Typography.caption,
    textAlign: 'center',
    lineHeight: 17,
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
