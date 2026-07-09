import { create } from 'zustand';
import type { PurchasesOffering, PurchasesPackage } from 'react-native-purchases';

import {
  ensureRevenueCatSession,
  refreshSubscriptionStatus,
} from '@/services/subscription/lifecycle';
import {
  fetchOfferings,
  isRevenueCatAvailable,
  purchaseRevenueCatPackage,
  restoreRevenueCatPurchases,
} from '@/services/subscription/revenuecat';
import { useUserStore } from '@/stores/user.store';
import { getStoreErrorKey } from '@/utils/store-error';

type SubscriptionState = {
  offerings: PurchasesOffering | null;
  isLoading: boolean;
  error: string | null;
  loadOfferings: () => Promise<void>;
  purchasePackage: (pkg: PurchasesPackage) => Promise<void>;
  restorePurchases: () => Promise<void>;
  clearError: () => void;
};

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  offerings: null,
  isLoading: false,
  error: null,

  loadOfferings: async () => {
    if (!isRevenueCatAvailable()) {
      set({ offerings: null, isLoading: false, error: null });
      return;
    }

    const userId = useUserStore.getState().userId;
    if (!userId) {
      set({ offerings: null, error: 'errors.notAuthenticated' });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const ready = await ensureRevenueCatSession(userId);
      if (!ready) {
        throw new Error('errors.revenueCatUnavailable');
      }

      const offerings = await fetchOfferings();
      if (!offerings || offerings.availablePackages.length === 0) {
        set({ offerings: null, isLoading: false, error: 'errors.subscriptionPlansUnavailable' });
        return;
      }

      set({ offerings, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: getStoreErrorKey(error, 'errors.subscriptionPlansUnavailable'),
      });
    }
  },

  purchasePackage: async (pkg) => {
    set({ isLoading: true, error: null });

    try {
      const status = await purchaseRevenueCatPackage(pkg);
      useUserStore.setState({
        isPlusActive: status.isPlusActive,
        plusExpiresAt: status.plusExpiresAt,
        plusSubscription: status.subscription,
      });
      set({ isLoading: false });
      await refreshSubscriptionStatus();

      if (!useUserStore.getState().isPlusActive) {
        throw new Error('errors.subscriptionEntitlementMissing');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'errors.unknown';

      // User cancelled — not an error state.
      if (message.includes('Purchase was cancelled')) {
        set({ isLoading: false });
        return;
      }

      set({
        isLoading: false,
        error: getStoreErrorKey(error, 'errors.subscriptionEntitlementMissing'),
      });
      throw error;
    }
  },

  restorePurchases: async () => {
    set({ isLoading: true, error: null });

    try {
      const status = await restoreRevenueCatPurchases();
      useUserStore.setState({
        isPlusActive: status.isPlusActive,
        plusExpiresAt: status.plusExpiresAt,
        plusSubscription: status.subscription,
      });
      set({ isLoading: false });
      await refreshSubscriptionStatus();
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'errors.unknown',
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
