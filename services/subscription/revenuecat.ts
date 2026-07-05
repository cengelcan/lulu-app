import { NativeModules, Platform } from 'react-native';
import Purchases, {
  LOG_LEVEL,
  type CustomerInfo,
  type PurchasesOffering,
  type PurchasesPackage,
} from 'react-native-purchases';

import {
  REVENUECAT_ENTITLEMENT_PLUS,
  SUBSCRIPTION_PRODUCT_IDS,
} from '@/constants/subscription';

import {
  type PlusPlanKind,
  type PlusStatus,
  type PlusSubscriptionDetails,
  resolvePlusStatus,
} from '@/services/subscription/plus-status';
import { isIntroOrTrialPeriod } from '@/utils/subscription-display';

let configured = false;
let configurePromise: Promise<boolean> | null = null;
let loggedInUserId: string | null = null;
let customerInfoListener: ((info: CustomerInfo) => void) | null = null;

export function isNativePurchasesModuleLinked(): boolean {
  return Boolean(NativeModules.RNPurchases);
}

export function isRevenueCatAvailable(): boolean {
  return (
    Platform.OS === 'ios' &&
    Boolean(process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY) &&
    isNativePurchasesModuleLinked()
  );
}

export async function configureRevenueCat(): Promise<boolean> {
  if (!process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY) {
    return false;
  }

  if (Platform.OS !== 'ios') {
    return false;
  }

  if (!isNativePurchasesModuleLinked()) {
    console.warn(
      '[RevenueCat] Native module (RNPurchases) is not linked. ' +
        'Run `cd ios && pod install`, then rebuild with `npx expo run:ios` (not Expo Go).'
    );
    return false;
  }

  if (configured) {
    return true;
  }

  if (configurePromise) {
    return configurePromise;
  }

  const apiKey = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY!;

  configurePromise = (async () => {
    try {
      if (__DEV__) {
        Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      }

      Purchases.configure({ apiKey });
      configured = true;
      return true;
    } catch (error) {
      console.warn('[RevenueCat] configure failed', error);
      return false;
    } finally {
      configurePromise = null;
    }
  })();

  return configurePromise;
}

function resolvePlanKind(productId: string | undefined): PlusPlanKind {
  if (!productId) {
    return 'unknown';
  }

  if (productId === SUBSCRIPTION_PRODUCT_IDS.weekly) {
    return 'weekly';
  }

  if (productId === SUBSCRIPTION_PRODUCT_IDS.yearly) {
    return 'yearly';
  }

  if (productId === SUBSCRIPTION_PRODUCT_IDS.lifetime) {
    return 'lifetime';
  }

  return 'unknown';
}

function getSubscriptionDetailsFromEntitlement(
  entitlement: NonNullable<CustomerInfo['entitlements']['active'][string]>
): PlusSubscriptionDetails {
  const planKind = resolvePlanKind(entitlement.productIdentifier);
  const purchasedAt = entitlement.originalPurchaseDate ?? entitlement.latestPurchaseDate ?? null;
  const expiresAt = entitlement.expirationDate ?? null;
  const isTrialPeriod = isIntroOrTrialPeriod(
    entitlement.periodType,
    planKind,
    purchasedAt,
    expiresAt
  );

  return {
    planKind,
    productId: entitlement.productIdentifier ?? null,
    isTrialPeriod,
    willRenew: entitlement.willRenew ?? false,
    expiresAt,
    purchasedAt,
  };
}

export function getPlusStatusFromCustomerInfo(info: CustomerInfo): PlusStatus {
  const entitlement = info.entitlements.active[REVENUECAT_ENTITLEMENT_PLUS];

  if (!entitlement) {
    return { isPlusActive: false, plusExpiresAt: null, subscription: null };
  }

  return resolvePlusStatus({
    plusActive: true,
    plusExpiresAt: entitlement.expirationDate,
    subscription: getSubscriptionDetailsFromEntitlement(entitlement),
  });
}

export async function logInRevenueCat(userId: string): Promise<PlusStatus> {
  if (loggedInUserId === userId) {
    const customerInfo = await Purchases.getCustomerInfo();
    return getPlusStatusFromCustomerInfo(customerInfo);
  }

  const { customerInfo } = await Purchases.logIn(userId);
  loggedInUserId = userId;
  return getPlusStatusFromCustomerInfo(customerInfo);
}

export async function logOutRevenueCat(): Promise<void> {
  if (!configured) {
    return;
  }

  await Purchases.logOut();
  loggedInUserId = null;
}

export async function fetchRevenueCatPlusStatus(): Promise<PlusStatus | null> {
  if (!configured) {
    return null;
  }

  const customerInfo = await Purchases.getCustomerInfo();
  return getPlusStatusFromCustomerInfo(customerInfo);
}

export async function fetchOfferings(): Promise<PurchasesOffering | null> {
  if (!configured) {
    return null;
  }

  const offerings = await Purchases.getOfferings();
  return offerings.current;
}

export async function purchaseRevenueCatPackage(pkg: PurchasesPackage): Promise<PlusStatus> {
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return getPlusStatusFromCustomerInfo(customerInfo);
}

export async function restoreRevenueCatPurchases(): Promise<PlusStatus> {
  const customerInfo = await Purchases.restorePurchases();
  return getPlusStatusFromCustomerInfo(customerInfo);
}

export function subscribeToRevenueCatUpdates(onUpdate: (status: PlusStatus) => void): () => void {
  if (!configured) {
    return () => {};
  }

  if (customerInfoListener) {
    Purchases.removeCustomerInfoUpdateListener(customerInfoListener);
  }

  customerInfoListener = (info) => {
    onUpdate(getPlusStatusFromCustomerInfo(info));
  };

  Purchases.addCustomerInfoUpdateListener(customerInfoListener);

  return () => {
    if (customerInfoListener) {
      Purchases.removeCustomerInfoUpdateListener(customerInfoListener);
      customerInfoListener = null;
    }
  };
}

export async function teardownRevenueCat(): Promise<void> {
  if (customerInfoListener) {
    Purchases.removeCustomerInfoUpdateListener(customerInfoListener);
    customerInfoListener = null;
  }

  if (configured) {
    try {
      await Purchases.logOut();
    } catch {
      // Anonymous session after logout is fine.
    }
    configured = false;
    loggedInUserId = null;
  }
}
