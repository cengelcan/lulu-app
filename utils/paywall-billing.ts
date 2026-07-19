import {
  SUBSCRIPTION_PRODUCT_IDS,
  type SubscriptionProductId,
} from '@/constants/subscription';
import type { TranslationParams } from '@/i18n/types';

type Translate = (key: string, params?: TranslationParams) => string;

export type PaywallPlanCopy = {
  subtitle: string;
  disclosure: string;
  cta: string;
};

export function buildPaywallPlanCopy(
  planId: SubscriptionProductId,
  price: string,
  t: Translate
): PaywallPlanCopy {
  switch (planId) {
    case SUBSCRIPTION_PRODUCT_IDS.monthly:
      return {
        subtitle: t('paywall.renewsMonthly'),
        disclosure: t('paywall.billingMonthlyDisclosure', { price }),
        cta: t('paywall.subscribeCta'),
      };
    case SUBSCRIPTION_PRODUCT_IDS.yearly:
      return {
        subtitle: t('paywall.renewsYearly'),
        disclosure: t('paywall.billingYearlyDisclosure', { price }),
        cta: t('paywall.subscribeCta'),
      };
    case SUBSCRIPTION_PRODUCT_IDS.lifetime:
      return {
        subtitle: t('paywall.lifetimePayOnce'),
        disclosure: t('paywall.billingLifetimeDisclosure', { price }),
        cta: t('paywall.ctaLifetime'),
      };
  }
}
