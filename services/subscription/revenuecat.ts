import { NativeModules, Platform } from 'react-native';
import Purchases, {
  LOG_LEVEL,
  type CustomerInfo,
  type PurchasesOffering,
  type PurchasesPackage,
} from 'react-native-purchases';

import { REVENUECAT_ENTITLEMENT_PLUS } from '@/constants/subscription';

import { type PlusStatus, resolvePlusStatus } from '@/services/subscription/plus-status';

let configured = false;
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

  const apiKey = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY!;

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
  }
}

export function getPlusStatusFromCustomerInfo(info: CustomerInfo): PlusStatus {
  const entitlement = info.entitlements.active[REVENUECAT_ENTITLEMENT_PLUS];

  if (!entitlement) {
    return { isPlusActive: false, plusExpiresAt: null };
  }

  return resolvePlusStatus({
    plusActive: true,
    plusExpiresAt: entitlement.expirationDate,
  });
}

export async function logInRevenueCat(userId: string): Promise<PlusStatus> {
  const { customerInfo } = await Purchases.logIn(userId);
  return getPlusStatusFromCustomerInfo(customerInfo);
}

export async function logOutRevenueCat(): Promise<void> {
  if (!configured) {
    return;
  }

  await Purchases.logOut();
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
  }
}
