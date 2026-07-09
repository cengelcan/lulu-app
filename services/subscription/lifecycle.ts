import {
  configureRevenueCat,
  fetchRevenueCatPlusStatus,
  isRevenueCatAvailable,
  logInRevenueCat,
  subscribeToRevenueCatUpdates,
  teardownRevenueCat,
} from '@/services/subscription/revenuecat';
import { type PlusStatus } from '@/services/subscription/plus-status';
import { resolvePlusStatusForUser } from '@/services/sync/subscription-sync';

let unsubscribeRevenueCat: (() => void) | null = null;
let activeUserId: string | null = null;
let initializedForUserId: string | null = null;
let initializePromise: Promise<void> | null = null;
let initializeTargetUserId: string | null = null;
let onPlusStatusChange: ((status: PlusStatus) => void) | null = null;

type SubscriptionInitOptions = {
  email?: string | null;
};

export function registerPlusStatusHandler(handler: (status: PlusStatus) => void): void {
  onPlusStatusChange = handler;
}

function applyPlusStatus(status: PlusStatus): void {
  onPlusStatusChange?.(status);
}

async function syncPlusStatus(userId: string): Promise<void> {
  const revenueCatStatus = isRevenueCatAvailable() ? await fetchRevenueCatPlusStatus() : null;
  const status = await resolvePlusStatusForUser(userId, revenueCatStatus);
  applyPlusStatus(status);
}

async function initializeSubscriptionInner(
  userId: string,
  options?: SubscriptionInitOptions
): Promise<void> {
  if (userId === initializedForUserId) {
    await syncPlusStatus(userId);
    return;
  }

  if (unsubscribeRevenueCat) {
    unsubscribeRevenueCat();
    unsubscribeRevenueCat = null;
  }

  activeUserId = userId;
  initializedForUserId = userId;

  const configured = await configureRevenueCat();

  if (configured) {
    try {
      await logInRevenueCat(userId, { email: options?.email });
    } catch (error) {
      console.warn('RevenueCat logIn failed', error);
    }

    unsubscribeRevenueCat = subscribeToRevenueCatUpdates((status) => {
      if (activeUserId === userId) {
        applyPlusStatus(status);
      }
    });
  }

  await syncPlusStatus(userId);
}

export async function initializeSubscription(
  userId: string | null,
  options?: SubscriptionInitOptions
): Promise<void> {
  if (!userId) {
    initializePromise = null;
    initializeTargetUserId = null;

    if (activeUserId !== null || initializedForUserId !== null) {
      await teardownSubscription();
    } else {
      applyPlusStatus({ isPlusActive: false, plusExpiresAt: null, subscription: null });
    }
    return;
  }

  if (initializePromise && initializeTargetUserId === userId) {
    return initializePromise;
  }

  if (initializePromise) {
    await initializePromise.catch(() => {});
  }

  initializeTargetUserId = userId;
  initializePromise = initializeSubscriptionInner(userId, options).finally(() => {
    if (initializeTargetUserId === userId) {
      initializePromise = null;
      initializeTargetUserId = null;
    }
  });

  return initializePromise;
}

export async function refreshSubscriptionStatus(): Promise<void> {
  if (!activeUserId) {
    return;
  }

  await syncPlusStatus(activeUserId);
}

/** Ensures RevenueCat is configured and bound to the Supabase user before paywall IAP. */
export async function ensureRevenueCatSession(
  userId: string,
  options?: SubscriptionInitOptions
): Promise<boolean> {
  if (!isRevenueCatAvailable()) {
    return false;
  }

  const configured = await configureRevenueCat();
  if (!configured) {
    return false;
  }

  try {
    await logInRevenueCat(userId, { email: options?.email });
    activeUserId = userId;
    initializedForUserId = userId;
    return true;
  } catch (error) {
    console.warn('RevenueCat logIn failed during paywall setup', error);
    return false;
  }
}

export async function teardownSubscription(): Promise<void> {
  initializePromise = null;
  initializeTargetUserId = null;

  if (unsubscribeRevenueCat) {
    unsubscribeRevenueCat();
    unsubscribeRevenueCat = null;
  }

  activeUserId = null;
  initializedForUserId = null;
  await teardownRevenueCat();
  applyPlusStatus({ isPlusActive: false, plusExpiresAt: null, subscription: null });
}
