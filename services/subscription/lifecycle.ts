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
let onPlusStatusChange: ((status: PlusStatus) => void) | null = null;

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

export async function initializeSubscription(userId: string | null): Promise<void> {
  if (!userId) {
    if (activeUserId !== null || initializedForUserId !== null) {
      await teardownSubscription();
    } else {
      applyPlusStatus({ isPlusActive: false, plusExpiresAt: null, subscription: null });
    }
    return;
  }

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
      await logInRevenueCat(userId);
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

export async function refreshSubscriptionStatus(): Promise<void> {
  if (!activeUserId) {
    return;
  }

  await syncPlusStatus(activeUserId);
}

export async function teardownSubscription(): Promise<void> {
  if (unsubscribeRevenueCat) {
    unsubscribeRevenueCat();
    unsubscribeRevenueCat = null;
  }

  activeUserId = null;
  initializedForUserId = null;
  await teardownRevenueCat();
  applyPlusStatus({ isPlusActive: false, plusExpiresAt: null, subscription: null });
}
