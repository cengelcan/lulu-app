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
import { useUserStore } from '@/stores/user.store';

let unsubscribeRevenueCat: (() => void) | null = null;
let activeUserId: string | null = null;

function applyPlusStatus(status: PlusStatus): void {
  useUserStore.setState({
    isPlusActive: status.isPlusActive,
    plusExpiresAt: status.plusExpiresAt,
  });
}

async function syncPlusStatus(userId: string): Promise<void> {
  const revenueCatStatus = isRevenueCatAvailable() ? await fetchRevenueCatPlusStatus() : null;
  const status = await resolvePlusStatusForUser(userId, revenueCatStatus);
  applyPlusStatus(status);
}

export async function initializeSubscription(userId: string | null): Promise<void> {
  if (unsubscribeRevenueCat) {
    unsubscribeRevenueCat();
    unsubscribeRevenueCat = null;
  }

  activeUserId = userId;

  if (!userId) {
    applyPlusStatus({ isPlusActive: false, plusExpiresAt: null });
    return;
  }

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
  await teardownRevenueCat();
  applyPlusStatus({ isPlusActive: false, plusExpiresAt: null });
}
