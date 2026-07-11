import { NativeModules, Platform } from 'react-native';
import type {
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
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

type PurchasesModule = typeof import('react-native-purchases').default;

let purchasesModule: PurchasesModule | null = null;
let purchasesModulePromise: Promise<PurchasesModule | null> | null = null;

let configured = false;
let configurePromise: Promise<boolean> | null = null;
let loggedInUserId: string | null = null;
let customerInfoListener: ((info: CustomerInfo) => void) | null = null;
let identityLock: Promise<void> = Promise.resolve();

type RevenueCatIdentityOptions = {
  email?: string | null;
};

async function loadPurchasesModule(): Promise<PurchasesModule | null> {
  if (Platform.OS !== 'ios' || !isNativePurchasesModuleLinked()) {
    return null;
  }

  if (purchasesModule) {
    return purchasesModule;
  }

  if (!purchasesModulePromise) {
    purchasesModulePromise = import('react-native-purchases')
      .then((module) => {
        purchasesModule = module.default;
        return purchasesModule;
      })
      .catch((error) => {
        console.warn('[RevenueCat] Failed to load native module', error);
        return null;
      })
      .finally(() => {
        purchasesModulePromise = null;
      });
  }

  return purchasesModulePromise;
}

async function withIdentityLock<T>(operation: () => Promise<T>): Promise<T> {
  const previous = identityLock;
  let release!: () => void;
  identityLock = new Promise<void>((resolve) => {
    release = resolve;
  });

  await previous;

  try {
    return await operation();
  } finally {
    release();
  }
}

async function syncSubscriberEmail(
  Purchases: PurchasesModule,
  email: string | null | undefined
): Promise<void> {
  const normalized = email?.trim();
  if (!normalized) {
    return;
  }

  try {
    await Purchases.setEmail(normalized);
  } catch (error) {
    console.warn('[RevenueCat] setEmail failed', error);
  }
}

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
      const Purchases = await loadPurchasesModule();
      if (!Purchases) {
        return false;
      }

      if (__DEV__) {
        const { LOG_LEVEL } = await import('react-native-purchases');
        Purchases.setLogLevel(LOG_LEVEL.INFO);
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

export async function logInRevenueCat(
  userId: string,
  options?: RevenueCatIdentityOptions
): Promise<PlusStatus> {
  return withIdentityLock(async () => {
    const Purchases = await loadPurchasesModule();
    if (!Purchases) {
      return { isPlusActive: false, plusExpiresAt: null, subscription: null };
    }

    if (loggedInUserId === userId) {
      await syncSubscriberEmail(Purchases, options?.email);
      const customerInfo = await Purchases.getCustomerInfo();
      return getPlusStatusFromCustomerInfo(customerInfo);
    }

    const { customerInfo } = await Purchases.logIn(userId);
    loggedInUserId = userId;
    await syncSubscriberEmail(Purchases, options?.email);
    return getPlusStatusFromCustomerInfo(customerInfo);
  });
}

export async function logOutRevenueCat(): Promise<void> {
  return withIdentityLock(async () => {
    if (!configured) {
      return;
    }

    const Purchases = await loadPurchasesModule();
    if (!Purchases) {
      return;
    }

    await Purchases.logOut();
    loggedInUserId = null;
  });
}

export async function fetchRevenueCatPlusStatus(): Promise<PlusStatus | null> {
  if (!configured) {
    return null;
  }

  const Purchases = await loadPurchasesModule();
  if (!Purchases) {
    return null;
  }

  const customerInfo = await Purchases.getCustomerInfo();
  return getPlusStatusFromCustomerInfo(customerInfo);
}

export async function fetchOfferings(): Promise<PurchasesOffering | null> {
  if (!configured) {
    return null;
  }

  const Purchases = await loadPurchasesModule();
  if (!Purchases) {
    return null;
  }

  const offerings = await Purchases.getOfferings();
  return offerings.current;
}

export async function purchaseRevenueCatPackage(pkg: PurchasesPackage): Promise<PlusStatus> {
  const Purchases = await loadPurchasesModule();
  if (!Purchases) {
    return { isPlusActive: false, plusExpiresAt: null, subscription: null };
  }

  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return getPlusStatusFromCustomerInfo(customerInfo);
}

export async function restoreRevenueCatPurchases(): Promise<PlusStatus> {
  const Purchases = await loadPurchasesModule();
  if (!Purchases) {
    return { isPlusActive: false, plusExpiresAt: null, subscription: null };
  }

  const customerInfo = await Purchases.restorePurchases();
  return getPlusStatusFromCustomerInfo(customerInfo);
}

export function subscribeToRevenueCatUpdates(onUpdate: (status: PlusStatus) => void): () => void {
  if (!configured || !purchasesModule) {
    return () => {};
  }

  const Purchases = purchasesModule;

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
  return withIdentityLock(async () => {
    const Purchases = purchasesModule ?? (await loadPurchasesModule());

    if (customerInfoListener && Purchases) {
      Purchases.removeCustomerInfoUpdateListener(customerInfoListener);
      customerInfoListener = null;
    }

    if (configured && Purchases) {
      try {
        await Purchases.logOut();
      } catch {
        // Anonymous session after logout is fine.
      }
      configured = false;
      loggedInUserId = null;
    }
  });
}
