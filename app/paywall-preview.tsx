import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';

import { LuluPlusPaywallContent } from '@/components/paywall/LuluPlusPaywall';
import { SUBSCRIPTION_PRODUCT_IDS, type SubscriptionProductId } from '@/constants/subscription';

const PLAN_PARAM_MAP = {
  weekly: SUBSCRIPTION_PRODUCT_IDS.weekly,
  yearly: SUBSCRIPTION_PRODUCT_IDS.yearly,
  lifetime: SUBSCRIPTION_PRODUCT_IDS.lifetime,
} as const satisfies Record<string, SubscriptionProductId>;

type PaywallPlanParam = keyof typeof PLAN_PARAM_MAP;

function resolveInitialPlan(plan?: string | string[]): SubscriptionProductId {
  const raw = Array.isArray(plan) ? plan[0] : plan;
  if (raw && raw in PLAN_PARAM_MAP) {
    return PLAN_PARAM_MAP[raw as PaywallPlanParam];
  }
  return SUBSCRIPTION_PRODUCT_IDS.yearly;
}

/**
 * Dev-only full-screen paywall for App Store review screenshots.
 *
 * Routes:
 * - /paywall-preview              → weekly selected
 * - /paywall-preview?plan=yearly
 * - /paywall-preview?plan=lifetime
 */
export default function PaywallPreviewScreen() {
  const router = useRouter();
  const { plan } = useLocalSearchParams<{ plan?: string }>();

  if (!__DEV__) {
    return <Redirect href="/(tabs)/home" />;
  }

  return (
    <LuluPlusPaywallContent
      previewMode
      initialSelectedPlan={resolveInitialPlan(plan)}
      onDismiss={() => {
        if (router.canGoBack()) {
          router.back();
        }
      }}
    />
  );
}
